#!/usr/bin/env python3
"""
clinical_audit_scanner.py — Clinical function audit registry generator.

Discovers every clinical calculation, statistics, and scoring function across
Rust and Julia source files in a target repo, tracks git-derived dates,
extracts references from doc comments, detects test files, and writes/merges
a .clinical-audit/registry.yaml file.

This is the source of truth for all automated clinical audit data. Human
reviewers interact only via the `review` subcommand or by hand-editing the
human-owned fields described in policies/clinical-audit-schema.yaml.

Subcommands:
    scan    --repo <path> [--language rust|julia|auto]
    report  --repo <path> [--format text|json|markdown]
    review  --repo <path> --function <id> --status approved|flagged
            --reviewer <login> [--notes "..."]

Exit codes:
    scan:   0 = success (no flagged functions, or fail_on_flagged not set)
            1 = one or more functions have status "flagged"
    report: always 0
    review: 0 = success, 1 = function not found

No external dependencies — stdlib only (Python 3.11+).
"""

from __future__ import annotations

import argparse
import datetime
import json
import re
import subprocess
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SCANNER_VERSION = "1.0"
REGISTRY_VERSION = "1.0"
REGISTRY_RELATIVE = ".clinical-audit/registry.yaml"

CLINICAL_PATH_KEYWORDS: tuple[str, ...] = (
    "calc", "calculat", "stat", "statistic", "clinical", "score", "scoring",
    "formula", "algorithm", "metric", "dosing", "dose", "pharmacokinet",
    "biochem", "lab", "reference", "vital", "growth", "pediatric", "peds",
    "weight", "bmi", "cardiac", "renal", "hepatic", "respiratory",
)

CLINICAL_NAME_PATTERNS: tuple[str, ...] = (
    "calculate", "compute", "estimate", "score", "derive", "predict",
    "percentile", "z_score", "zscore", "normalize", "classify", "stratify", "risk_",
)

CLINICAL_DOC_MARKERS: tuple[str, ...] = (
    "@clinical", "@stat", "@scoring", "@validate", "# Clinical", "# Statistics",
)

_PATH_KW_RE = re.compile(
    "|".join(re.escape(k) for k in CLINICAL_PATH_KEYWORDS), re.IGNORECASE
)

_DOI_RE = re.compile(
    r"https?://doi\.org/(\S+)|(?<!\w)(10\.\d{4,}/\S+)", re.IGNORECASE
)
_PMID_RE = re.compile(
    r"PMID[:\s]+(\d+)|pubmed\.ncbi\.nlm\.nih\.gov/(\d+)", re.IGNORECASE
)
_STANDARD_RE = re.compile(
    r"(ISO|IEC|HIPAA|HL7|FHIR|LOINC|SNOMED|ICD-\d+)\s*[\d\-:]+", re.IGNORECASE
)
_REF_HEADING_RE = re.compile(
    r"^#+\s*(References|Citations|Bibliography)\s*$", re.IGNORECASE | re.MULTILINE
)

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------


@dataclass
class RefEntry:
    type: str
    citation: str
    description: str = ""


@dataclass
class DateInfo:
    first_commit: Optional[str] = None
    last_modified: Optional[str] = None
    last_reviewed: Optional[str] = None


@dataclass
class ReviewInfo:
    status: str = "pending"
    reviewer: Optional[str] = None
    reviewed_at: Optional[str] = None
    notes: Optional[str] = None


@dataclass
class ValidationInfo:
    method: str = "not_validated"
    test_files: list[str] = field(default_factory=list)
    has_tests: bool = False
    coverage_pct: Optional[float] = None
    last_validated: Optional[str] = None
    validation_notes: Optional[str] = None
    iec62304_class: Optional[str] = None


@dataclass
class FunctionEntry:
    id: str
    name: str
    qualified: str
    file: str
    line_start: int
    language: str
    category: str
    signature: str
    description: str
    dates: DateInfo = field(default_factory=DateInfo)
    review: ReviewInfo = field(default_factory=ReviewInfo)
    references: list[RefEntry] = field(default_factory=list)
    validation: ValidationInfo = field(default_factory=ValidationInfo)


@dataclass
class RegistrySummary:
    total_functions: int = 0
    approved: int = 0
    pending_review: int = 0
    flagged: int = 0


@dataclass
class Registry:
    version: str = REGISTRY_VERSION
    repo: str = ""
    language: str = ""
    last_scanned: str = ""
    generator: str = f"clinical_audit_scanner v{SCANNER_VERSION}"
    summary: RegistrySummary = field(default_factory=RegistrySummary)
    functions: list[FunctionEntry] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Minimal YAML serialiser (stdlib only — no PyYAML)
# ---------------------------------------------------------------------------


def _yaml_scalar(v: object) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, float):
        return str(v)
    s = str(v)
    if not s:
        return '""'
    escaped = s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    return f'"{escaped}"'


def _yaml_str_list(items: list[str], indent: str) -> str:
    if not items:
        return "[]\n"
    lines = ["\n"]
    for item in items:
        lines.append(f"{indent}- {_yaml_scalar(item)}\n")
    return "".join(lines)


def entry_to_yaml(e: FunctionEntry) -> str:
    i1 = "  "   # list item marker level (under functions:)
    i2 = "    "  # entry field level
    i3 = "      "  # nested sub-object fields
    i4 = "        "  # deeply nested (ref list items)

    ref_block = "[]\n"
    if e.references:
        ref_block = "\n"
        for r in e.references:
            ref_block += f"{i3}- type: {_yaml_scalar(r.type)}\n"
            ref_block += f"{i4}citation: {_yaml_scalar(r.citation)}\n"
            ref_block += f"{i4}description: {_yaml_scalar(r.description)}\n"

    tf_block = _yaml_str_list(e.validation.test_files, i3)

    return (
        f"{i1}- id: {_yaml_scalar(e.id)}\n"
        f"{i2}name: {_yaml_scalar(e.name)}\n"
        f"{i2}qualified: {_yaml_scalar(e.qualified)}\n"
        f"{i2}file: {_yaml_scalar(e.file)}\n"
        f"{i2}line_start: {e.line_start}\n"
        f"{i2}language: {_yaml_scalar(e.language)}\n"
        f"{i2}category: {_yaml_scalar(e.category)}\n"
        f"{i2}signature: {_yaml_scalar(e.signature)}\n"
        f"{i2}description: {_yaml_scalar(e.description)}\n"
        f"\n"
        f"{i2}dates:\n"
        f"{i3}first_commit: {_yaml_scalar(e.dates.first_commit)}\n"
        f"{i3}last_modified: {_yaml_scalar(e.dates.last_modified)}\n"
        f"{i3}last_reviewed: {_yaml_scalar(e.dates.last_reviewed)}\n"
        f"\n"
        f"{i2}review:\n"
        f"{i3}status: {_yaml_scalar(e.review.status)}\n"
        f"{i3}reviewer: {_yaml_scalar(e.review.reviewer)}\n"
        f"{i3}reviewed_at: {_yaml_scalar(e.review.reviewed_at)}\n"
        f"{i3}notes: {_yaml_scalar(e.review.notes)}\n"
        f"\n"
        f"{i2}references: {ref_block}"
        f"\n"
        f"{i2}validation:\n"
        f"{i3}method: {_yaml_scalar(e.validation.method)}\n"
        f"{i3}test_files: {tf_block}"
        f"{i3}has_tests: {_yaml_scalar(e.validation.has_tests)}\n"
        f"{i3}coverage_pct: {_yaml_scalar(e.validation.coverage_pct)}\n"
        f"{i3}last_validated: {_yaml_scalar(e.validation.last_validated)}\n"
        f"{i3}validation_notes: {_yaml_scalar(e.validation.validation_notes)}\n"
        f"{i3}iec62304_class: {_yaml_scalar(e.validation.iec62304_class)}\n"
    )


def registry_to_yaml(reg: Registry) -> str:
    lines: list[str] = [
        f"version: {_yaml_scalar(reg.version)}\n",
        f"repo: {_yaml_scalar(reg.repo)}\n",
        f"language: {_yaml_scalar(reg.language)}\n",
        f"last_scanned: {_yaml_scalar(reg.last_scanned)}\n",
        f"generator: {_yaml_scalar(reg.generator)}\n",
        f"\n",
        f"summary:\n",
        f"  total_functions: {reg.summary.total_functions}\n",
        f"  approved: {reg.summary.approved}\n",
        f"  pending_review: {reg.summary.pending_review}\n",
        f"  flagged: {reg.summary.flagged}\n",
        f"\n",
        f"functions:\n",
    ]
    for e in reg.functions:
        lines.append(entry_to_yaml(e))
    return "".join(lines)


# ---------------------------------------------------------------------------
# Minimal YAML reader (parses only what registry_to_yaml writes)
# ---------------------------------------------------------------------------


def _unquote(s: str) -> Optional[str]:
    s = s.strip()
    if s == "null":
        return None
    if s.startswith('"') and s.endswith('"'):
        inner = s[1:-1]
        return inner.replace('\\"', '"').replace("\\\\", "\\").replace("\\n", "\n")
    return s or None


def _parse_int_or_none(s: str) -> Optional[int]:
    s = s.strip()
    if s == "null":
        return None
    try:
        return int(s)
    except ValueError:
        return None


def _parse_bool(s: str) -> bool:
    return s.strip() == "true"


def load_registry(path: Path) -> Registry:
    """Parse a registry.yaml file written by registry_to_yaml."""
    lines = path.read_text(encoding="utf-8").splitlines()
    reg = Registry()
    reg.functions = []

    def kv(line: str) -> tuple[str, str]:
        idx = line.index(":")
        return line[:idx].strip(), line[idx + 1:].strip()

    i = 0
    current: Optional[FunctionEntry] = None
    in_functions = in_dates = in_review = in_refs = in_validation = False
    current_ref: Optional[dict] = None

    while i < len(lines):
        raw = lines[i]
        stripped = raw.strip()
        i += 1

        if not stripped or stripped.startswith("#"):
            continue

        # Top-level keys
        if not raw[0].isspace():
            in_functions = in_dates = in_review = in_refs = in_validation = False
            if current_ref and current:
                current.references.append(RefEntry(**current_ref))
                current_ref = None
            if stripped.startswith("version:"):
                _, v = kv(stripped); reg.version = _unquote(v) or REGISTRY_VERSION
            elif stripped.startswith("repo:"):
                _, v = kv(stripped); reg.repo = _unquote(v) or ""
            elif stripped.startswith("language:"):
                _, v = kv(stripped); reg.language = _unquote(v) or ""
            elif stripped.startswith("last_scanned:"):
                _, v = kv(stripped); reg.last_scanned = _unquote(v) or ""
            elif stripped.startswith("generator:"):
                _, v = kv(stripped); reg.generator = _unquote(v) or ""
            elif stripped == "functions:":
                in_functions = True
            continue

        # summary: block (2-space, not inside functions)
        if raw.startswith("  ") and not raw.startswith("    ") and not in_functions:
            if stripped.startswith("total_functions:"):
                _, v = kv(stripped); reg.summary.total_functions = _parse_int_or_none(v) or 0
            elif stripped.startswith("approved:"):
                _, v = kv(stripped); reg.summary.approved = _parse_int_or_none(v) or 0
            elif stripped.startswith("pending_review:"):
                _, v = kv(stripped); reg.summary.pending_review = _parse_int_or_none(v) or 0
            elif stripped.startswith("flagged:"):
                _, v = kv(stripped); reg.summary.flagged = _parse_int_or_none(v) or 0
            continue

        if not in_functions:
            continue

        # 2-space: function list item start
        if raw.startswith("  ") and not raw.startswith("    "):
            if current_ref and current:
                current.references.append(RefEntry(**current_ref))
                current_ref = None
            if stripped.startswith("- id:"):
                if current:
                    reg.functions.append(current)
                _, v = kv(stripped[2:])
                current = FunctionEntry(
                    id=_unquote(v) or "", name="", qualified="", file="",
                    line_start=0, language="", category="", signature="", description="",
                )
                in_dates = in_review = in_refs = in_validation = False
            continue

        # 4-space: entry fields
        if raw.startswith("    ") and not raw.startswith("      "):
            if current_ref and current:
                current.references.append(RefEntry(**current_ref))
                current_ref = None
            in_dates = in_review = in_refs = in_validation = False
            if not current:
                continue
            if stripped.startswith("name:"):
                _, v = kv(stripped); current.name = _unquote(v) or ""
            elif stripped.startswith("qualified:"):
                _, v = kv(stripped); current.qualified = _unquote(v) or ""
            elif stripped.startswith("file:"):
                _, v = kv(stripped); current.file = _unquote(v) or ""
            elif stripped.startswith("line_start:"):
                _, v = kv(stripped); current.line_start = _parse_int_or_none(v) or 0
            elif stripped.startswith("language:"):
                _, v = kv(stripped); current.language = _unquote(v) or ""
            elif stripped.startswith("category:"):
                _, v = kv(stripped); current.category = _unquote(v) or ""
            elif stripped.startswith("signature:"):
                _, v = kv(stripped); current.signature = _unquote(v) or ""
            elif stripped.startswith("description:"):
                _, v = kv(stripped); current.description = _unquote(v) or ""
            elif stripped == "dates:":
                in_dates = True
            elif stripped == "review:":
                in_review = True
            elif stripped.startswith("references:"):
                val = stripped[len("references:"):].strip()
                if val == "[]":
                    current.references = []
                else:
                    in_refs = True
            elif stripped == "validation:":
                in_validation = True
            continue

        # 6-space: sub-object fields
        if raw.startswith("      ") and not raw.startswith("        "):
            if not current:
                continue
            if in_dates:
                if stripped.startswith("first_commit:"):
                    _, v = kv(stripped); current.dates.first_commit = _unquote(v)
                elif stripped.startswith("last_modified:"):
                    _, v = kv(stripped); current.dates.last_modified = _unquote(v)
                elif stripped.startswith("last_reviewed:"):
                    _, v = kv(stripped); current.dates.last_reviewed = _unquote(v)
            elif in_review:
                if stripped.startswith("status:"):
                    _, v = kv(stripped); current.review.status = _unquote(v) or "pending"
                elif stripped.startswith("reviewer:"):
                    _, v = kv(stripped); current.review.reviewer = _unquote(v)
                elif stripped.startswith("reviewed_at:"):
                    _, v = kv(stripped); current.review.reviewed_at = _unquote(v)
                elif stripped.startswith("notes:"):
                    _, v = kv(stripped); current.review.notes = _unquote(v)
            elif in_refs:
                if stripped.startswith("- type:"):
                    if current_ref:
                        current.references.append(RefEntry(**current_ref))
                    _, v = kv(stripped[2:])
                    current_ref = {"type": _unquote(v) or "", "citation": "", "description": ""}
                elif stripped.startswith("citation:") and current_ref is not None:
                    _, v = kv(stripped); current_ref["citation"] = _unquote(v) or ""
                elif stripped.startswith("description:") and current_ref is not None:
                    _, v = kv(stripped); current_ref["description"] = _unquote(v) or ""
            elif in_validation:
                if stripped.startswith("method:"):
                    _, v = kv(stripped); current.validation.method = _unquote(v) or "not_validated"
                elif stripped.startswith("test_files:"):
                    val = stripped[len("test_files:"):].strip()
                    if val == "[]":
                        current.validation.test_files = []
                elif stripped.startswith("- "):
                    current.validation.test_files.append(_unquote(stripped[2:]) or "")
                elif stripped.startswith("has_tests:"):
                    _, v = kv(stripped); current.validation.has_tests = _parse_bool(v)
                elif stripped.startswith("coverage_pct:"):
                    _, v = kv(stripped); sv = _unquote(v)
                    current.validation.coverage_pct = float(sv) if sv else None
                elif stripped.startswith("last_validated:"):
                    _, v = kv(stripped); current.validation.last_validated = _unquote(v)
                elif stripped.startswith("validation_notes:"):
                    _, v = kv(stripped); current.validation.validation_notes = _unquote(v)
                elif stripped.startswith("iec62304_class:"):
                    _, v = kv(stripped); current.validation.iec62304_class = _unquote(v)
            continue

        # 8-space: ref citation/description when - type: is a separate block
        if raw.startswith("        ") and current and in_refs:
            if current_ref is None:
                current_ref = {"type": "", "citation": "", "description": ""}
            if stripped.startswith("citation:"):
                _, v = kv(stripped); current_ref["citation"] = _unquote(v) or ""
            elif stripped.startswith("description:"):
                _, v = kv(stripped); current_ref["description"] = _unquote(v) or ""

    # Flush trailing
    if current_ref and current:
        current.references.append(RefEntry(**current_ref))
    if current:
        reg.functions.append(current)

    return reg


# ---------------------------------------------------------------------------
# Git helpers
# ---------------------------------------------------------------------------


def _git(args: list[str], cwd: Path) -> str:
    try:
        r = subprocess.run(
            ["git"] + args, cwd=str(cwd),
            capture_output=True, text=True, timeout=30,
        )
        return r.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        return ""


def git_first_commit_date(repo_root: Path, file_path: str) -> Optional[str]:
    # --diff-filter=A: only the commit where file was Added; --follow: track renames.
    # Take the last line (oldest when multiple appear — edge case).
    out = _git(["log", "--follow", "--diff-filter=A", "--format=%ai", "--", file_path], repo_root)
    if not out:
        return None
    return out.splitlines()[-1].strip()[:10]


def git_last_modified_date(repo_root: Path, file_path: str) -> Optional[str]:
    out = _git(["log", "--follow", "--format=%ai", "-1", "--", file_path], repo_root)
    return out[:10] if out else None


def git_remote_name(repo_root: Path) -> str:
    out = _git(["remote", "get-url", "origin"], repo_root)
    if not out:
        return repo_root.name
    m = re.search(r"[:/]([^/]+/[^/]+?)(?:\.git)?$", out)
    return m.group(1) if m else repo_root.name


# ---------------------------------------------------------------------------
# Reference extraction
# ---------------------------------------------------------------------------


def extract_references(doc_comment: str) -> list[RefEntry]:
    refs: list[RefEntry] = []
    seen: set[str] = set()

    def add(type_: str, citation: str, description: str = "") -> None:
        c = citation.rstrip(".,;)")
        if c and c not in seen:
            seen.add(c)
            refs.append(RefEntry(type=type_, citation=c, description=description))

    for m in _DOI_RE.finditer(doc_comment):
        add("doi", (m.group(1) or m.group(2) or "").rstrip(".,;)"))

    for m in _PMID_RE.finditer(doc_comment):
        add("pmid", m.group(1) or m.group(2) or "")

    for m in _STANDARD_RE.finditer(doc_comment):
        add("standard", m.group(0).strip())

    # Freeform lines under reference-section headings
    for hm in _REF_HEADING_RE.finditer(doc_comment):
        section = doc_comment[hm.end():]
        nxt = re.search(r"^#+\s", section, re.MULTILINE)
        section = section[:nxt.start()] if nxt else section
        for line in section.splitlines():
            line = line.strip().lstrip("/*# \t")
            if not line:
                continue
            if any(line in r.citation or r.citation in line for r in refs):
                continue
            if re.match(r"^[-*\d\"']", line):
                add("book", line)

    return refs


# ---------------------------------------------------------------------------
# Test file detection
# ---------------------------------------------------------------------------


def _search_test_files(repo_root: Path, fn_name: str, language: str) -> list[str]:
    candidates: list[Path] = []
    if language == "Rust":
        for d in ["tests", "src"]:
            p = repo_root / d
            if p.is_dir():
                candidates.extend(p.rglob("*.rs"))
    elif language == "Julia":
        p = repo_root / "test"
        if p.is_dir():
            candidates.extend(p.rglob("*.jl"))

    found: list[str] = []
    pattern = re.compile(r"\b" + re.escape(fn_name) + r"\b")
    for tf in candidates:
        try:
            if pattern.search(tf.read_text(encoding="utf-8", errors="replace")):
                found.append(str(tf.relative_to(repo_root)))
        except OSError:
            continue
    return sorted(found)


# ---------------------------------------------------------------------------
# Rust scanner
# ---------------------------------------------------------------------------

# One or more /// doc comment lines immediately before a fn declaration.
_RUST_FN_RE = re.compile(
    r"((?:[ \t]*///[^\n]*\n)+)"
    r"[ \t]*"
    r"((?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?(?:unsafe\s+)?fn\s+\w+[^\n{;]*)",
    re.MULTILINE,
)
_RUST_FN_NAME_RE = re.compile(r"fn\s+(\w+)")


def _rust_qualify(file_path: str, fn_name: str) -> str:
    p = Path(file_path)
    parts: list[str] = []
    found_src = False
    for part in p.parts:
        if part == "src":
            found_src = True
            continue
        if not found_src:
            continue
        parts.append(part)
    if not parts:
        return fn_name
    stem = parts[-1]
    if "." in stem:
        stem = stem.rsplit(".", 1)[0]
    if stem in ("mod", "lib"):
        parts = parts[:-1]
    else:
        parts[-1] = stem
    return ("::".join(parts) + "::" + fn_name) if parts else fn_name


def _is_clinical(fn_name: str, file_path: str, doc_text: str) -> bool:
    if any(marker in doc_text for marker in CLINICAL_DOC_MARKERS):
        return True
    if _PATH_KW_RE.search(file_path):
        return True
    fn_lower = fn_name.lower().rstrip("!")
    return any(fn_lower.startswith(p) or p in fn_lower for p in CLINICAL_NAME_PATTERNS)


def _categorise(fn_name: str, doc_text: str, file_path: str) -> str:
    fp = file_path.lower()
    fn = fn_name.lower()
    doc = doc_text.lower()
    if "score" in fp or "score" in fn or "@scoring" in doc:
        return "scoring"
    if "stat" in fp or "percentile" in fn or "zscore" in fn or "z_score" in fn:
        return "statistics"
    if "reference" in fp or "range" in fn:
        return "reference_range"
    return "clinical_calculation"


def scan_rust_file(repo_root: Path, file_path: Path) -> list[FunctionEntry]:
    rel_path = str(file_path.relative_to(repo_root))
    try:
        source = file_path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return []

    entries: list[FunctionEntry] = []
    for m in _RUST_FN_RE.finditer(source):
        doc_block = m.group(1)
        sig_line = m.group(2).strip()
        name_m = _RUST_FN_NAME_RE.search(sig_line)
        if not name_m:
            continue
        fn_name = name_m.group(1)
        doc_text = "\n".join(line.lstrip().lstrip("/ ") for line in doc_block.splitlines())
        if not _is_clinical(fn_name, rel_path, doc_text):
            continue
        line_start = source[:m.start()].count("\n") + 1
        first_line = next((l.strip() for l in doc_text.splitlines() if l.strip()), "")
        entries.append(FunctionEntry(
            id=fn_name, name=fn_name, qualified=_rust_qualify(rel_path, fn_name),
            file=rel_path, line_start=line_start, language="Rust",
            category=_categorise(fn_name, doc_text, rel_path),
            signature=sig_line, description=first_line,
            references=extract_references(doc_text),
        ))
    return entries


# ---------------------------------------------------------------------------
# Julia scanner
# ---------------------------------------------------------------------------

# Docstring immediately before a function declaration (multi-line or single-line form).
_JULIA_FN_RE = re.compile(
    r'"""(.*?)"""'
    r'\s*\n\s*'
    r'(function\s+\w[\w!]*\s*\([^\n]*'
    r'|(?:\w[\w!]*)\s*\([^\n]*\)\s*=\s*[^\n]+)',
    re.DOTALL,
)
_JULIA_FN_NAME_RE = re.compile(r"(?:function\s+|^)(\w[\w!]*)\s*[\(\s]")


def _julia_qualify(file_path: str, fn_name: str) -> str:
    p = Path(file_path)
    parts: list[str] = []
    found_src = False
    for part in p.parts:
        if part == "src":
            found_src = True
            continue
        if not found_src:
            continue
        parts.append(part)
    if not parts:
        return fn_name
    stem = parts[-1]
    if "." in stem:
        stem = stem.rsplit(".", 1)[0]
    parts[-1] = stem
    return ".".join(parts) + "." + fn_name


def scan_julia_file(repo_root: Path, file_path: Path) -> list[FunctionEntry]:
    rel_path = str(file_path.relative_to(repo_root))
    try:
        source = file_path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return []

    entries: list[FunctionEntry] = []
    for m in _JULIA_FN_RE.finditer(source):
        doc_text = m.group(1).strip()
        sig_line = m.group(2).strip()
        name_m = _JULIA_FN_NAME_RE.match(sig_line)
        if not name_m:
            continue
        fn_name = name_m.group(1)
        if not _is_clinical(fn_name, rel_path, doc_text):
            continue
        line_start = source[:m.start()].count("\n") + 1
        first_line = next((l.strip() for l in doc_text.splitlines() if l.strip()), "")
        entries.append(FunctionEntry(
            id=fn_name, name=fn_name, qualified=_julia_qualify(rel_path, fn_name),
            file=rel_path, line_start=line_start, language="Julia",
            category=_categorise(fn_name, doc_text, rel_path),
            signature=sig_line, description=first_line,
            references=extract_references(doc_text),
        ))
    return entries


# ---------------------------------------------------------------------------
# Repo-level scan
# ---------------------------------------------------------------------------

_SKIP_DIRS = {".git", ".github", "target", "_build", "build", "node_modules",
              ".clinical-audit", ".gap-analysis"}


def _detect_language(repo_root: Path) -> str:
    rs = sum(1 for _ in repo_root.rglob("*.rs"))
    jl = sum(1 for _ in repo_root.rglob("*.jl"))
    if rs == 0 and jl == 0:
        return "unknown"
    return "Rust" if rs >= jl else "Julia"


def scan_repo(repo_root: Path, language: str = "auto") -> list[FunctionEntry]:
    if language == "auto":
        language = _detect_language(repo_root)

    entries: list[FunctionEntry] = []
    ext = "*.rs" if language == "Rust" else "*.jl"
    scan_fn = scan_rust_file if language == "Rust" else scan_julia_file

    for src_file in sorted(repo_root.rglob(ext)):
        if any(p in _SKIP_DIRS for p in src_file.parts):
            continue
        entries.extend(scan_fn(repo_root, src_file))

    return entries


# ---------------------------------------------------------------------------
# ID deduplication — qualified path when two functions share a bare name
# ---------------------------------------------------------------------------


def _deduplicate_ids(entries: list[FunctionEntry]) -> list[FunctionEntry]:
    count: dict[str, int] = {}
    for e in entries:
        count[e.name] = count.get(e.name, 0) + 1
    for e in entries:
        if count[e.name] > 1:
            e.id = e.qualified
    return entries


# ---------------------------------------------------------------------------
# Merge: preserve human fields from an existing registry
# ---------------------------------------------------------------------------


def _ref_key(r: RefEntry) -> str:
    return f"{r.type}:{r.citation}"


def merge_entries(existing: FunctionEntry, fresh: FunctionEntry) -> FunctionEntry:
    # Auto fields
    existing.file = fresh.file
    existing.line_start = fresh.line_start
    existing.language = fresh.language
    existing.signature = fresh.signature
    if not existing.description:
        existing.description = fresh.description
    existing.dates.first_commit = fresh.dates.first_commit
    existing.dates.last_modified = fresh.dates.last_modified
    # dates.last_reviewed — human-set, never touch

    # Category: update unless human has corrected to not_clinical/removed
    if existing.category not in ("not_clinical", "removed", "not_applicable"):
        existing.category = fresh.category

    # References: union by citation key; preserve manually-added refs
    auto_keys = {_ref_key(r) for r in fresh.references}
    manual = [r for r in existing.references if _ref_key(r) not in auto_keys]
    existing.references = fresh.references + manual

    # Validation: test detection is auto; rest is human
    existing.validation.test_files = fresh.validation.test_files
    existing.validation.has_tests = fresh.validation.has_tests
    if fresh.validation.has_tests and existing.validation.method == "not_validated":
        existing.validation.method = "unit_tests"
    # review, validation.last_validated, iec62304_class — all human-owned

    return existing


def merge_registry(existing_reg: Registry, fresh_entries: list[FunctionEntry]) -> Registry:
    existing_by_id = {e.id: e for e in existing_reg.functions}
    fresh_by_id = {e.id: e for e in fresh_entries}

    for fid, fresh in fresh_by_id.items():
        if fid in existing_by_id:
            existing_by_id[fid] = merge_entries(existing_by_id[fid], fresh)
        else:
            existing_by_id[fid] = fresh

    today = datetime.date.today().isoformat()
    for eid, existing in existing_by_id.items():
        if eid not in fresh_by_id and existing.category != "removed":
            existing.category = "removed"
            existing.dates.last_modified = today

    merged = list(existing_by_id.values())
    merged.sort(key=lambda e: (e.category == "removed", e.file, e.line_start))
    existing_reg.functions = merged
    return existing_reg


# ---------------------------------------------------------------------------
# Summary + stale-review warnings
# ---------------------------------------------------------------------------


def recompute_summary(reg: Registry) -> None:
    active = [e for e in reg.functions if e.category != "removed"]
    reg.summary.total_functions = len(active)
    reg.summary.approved = sum(1 for e in active if e.review.status == "approved")
    reg.summary.pending_review = sum(1 for e in active if e.review.status == "pending")
    reg.summary.flagged = sum(1 for e in active if e.review.status == "flagged")


def _emit_stale_warnings(reg: Registry) -> None:
    for e in reg.functions:
        if e.category == "removed" or e.review.status != "approved":
            continue
        lm, lr = e.dates.last_modified, e.dates.last_reviewed
        if lm and lr and lm > lr:
            print(
                f"::warning file={e.file}::Clinical function '{e.id}' was "
                f"last reviewed {lr} but source was modified {lm}. "
                "Reviewer should confirm change is non-material."
            )


# ---------------------------------------------------------------------------
# Git date population
# ---------------------------------------------------------------------------


def populate_git_dates(repo_root: Path, entries: list[FunctionEntry]) -> None:
    # Cache by file path — many functions often share a file.
    first_cache: dict[str, Optional[str]] = {}
    last_cache: dict[str, Optional[str]] = {}
    for entry in entries:
        fp = entry.file
        if fp not in first_cache:
            first_cache[fp] = git_first_commit_date(repo_root, fp)
            last_cache[fp] = git_last_modified_date(repo_root, fp)
        entry.dates.first_commit = first_cache[fp]
        entry.dates.last_modified = last_cache[fp]


# ---------------------------------------------------------------------------
# Subcommand: scan
# ---------------------------------------------------------------------------


def cmd_scan(args: argparse.Namespace) -> int:
    repo_root = Path(args.repo).resolve()
    if not repo_root.is_dir():
        print(f"::error::Repo path does not exist: {repo_root}", file=sys.stderr)
        return 1

    language = args.language or "auto"
    print(f"Scanning {repo_root} (language={language}) …")

    fresh = scan_repo(repo_root, language)
    fresh = _deduplicate_ids(fresh)
    detected_lang = fresh[0].language if fresh else _detect_language(repo_root)
    if detected_lang == "unknown" and language != "auto":
        detected_lang = language

    populate_git_dates(repo_root, fresh)

    for entry in fresh:
        tfs = _search_test_files(repo_root, entry.name, entry.language)
        entry.validation.test_files = tfs
        entry.validation.has_tests = bool(tfs)
        if tfs and entry.validation.method == "not_validated":
            entry.validation.method = "unit_tests"

    registry_path = repo_root / REGISTRY_RELATIVE
    if registry_path.exists():
        reg = merge_registry(load_registry(registry_path), fresh)
        reg.last_scanned = datetime.date.today().isoformat()
        reg.generator = f"clinical_audit_scanner v{SCANNER_VERSION}"
    else:
        reg = Registry(
            repo=git_remote_name(repo_root),
            language=detected_lang,
            last_scanned=datetime.date.today().isoformat(),
            functions=fresh,
        )

    recompute_summary(reg)
    _emit_stale_warnings(reg)

    registry_path.parent.mkdir(parents=True, exist_ok=True)
    registry_path.write_text(registry_to_yaml(reg), encoding="utf-8")

    print(
        f"Registry written ({reg.summary.total_functions} functions, "
        f"{reg.summary.pending_review} pending, {reg.summary.flagged} flagged)"
    )
    return 1 if reg.summary.flagged > 0 else 0


# ---------------------------------------------------------------------------
# Subcommand: report
# ---------------------------------------------------------------------------


def cmd_report(args: argparse.Namespace) -> int:
    repo_root = Path(args.repo).resolve()
    registry_path = repo_root / REGISTRY_RELATIVE
    if not registry_path.exists():
        print(f"No registry found at {registry_path}", file=sys.stderr)
        return 0

    reg = load_registry(registry_path)
    fmt = args.format or "text"

    if fmt == "json":
        def entry_dict(e: FunctionEntry) -> dict:
            return {
                "id": e.id, "name": e.name, "qualified": e.qualified,
                "file": e.file, "line_start": e.line_start, "language": e.language,
                "category": e.category, "signature": e.signature, "description": e.description,
                "dates": asdict(e.dates), "review": asdict(e.review),
                "references": [asdict(r) for r in e.references],
                "validation": asdict(e.validation),
            }
        print(json.dumps({
            "version": reg.version, "repo": reg.repo, "language": reg.language,
            "last_scanned": reg.last_scanned, "generator": reg.generator,
            "summary": asdict(reg.summary),
            "functions": [entry_dict(e) for e in reg.functions],
        }, indent=2))

    elif fmt == "markdown":
        active = [e for e in reg.functions if e.category != "removed"]
        removed = [e for e in reg.functions if e.category == "removed"]
        print(f"## Clinical Function Audit — `{reg.repo}`\n")
        print(f"**Scanned:** {reg.last_scanned}  |  **Language:** {reg.language}  |  **Generator:** {reg.generator}\n")
        print("### Summary\n")
        print("| Metric | Count |")
        print("|--------|-------|")
        print(f"| Total functions | {reg.summary.total_functions} |")
        print(f"| Approved | {reg.summary.approved} |")
        print(f"| Pending review | {reg.summary.pending_review} |")
        print(f"| Flagged | {reg.summary.flagged} |")
        print("\n### Functions\n")
        print("| ID | File | Category | Status | Has Tests | Modified | Refs |")
        print("|----|------|----------|--------|-----------|----------|------|")
        for e in active:
            status = "**FLAGGED**" if e.review.status == "flagged" else e.review.status
            print(
                f"| `{e.id}` | `{e.file}` | {e.category} | {status} | "
                f"{'yes' if e.validation.has_tests else 'no'} | "
                f"{e.dates.last_modified or 'unknown'} | {len(e.references)} |"
            )
        if not active:
            print("_No clinical functions discovered._")
        if removed:
            print(f"\n### Removed ({len(removed)})\n")
            for e in removed:
                print(f"- `{e.id}` (was `{e.file}`)")

    else:  # text
        print(f"Clinical Audit — {reg.repo}")
        print("=" * 60)
        print(f"Scanned:   {reg.last_scanned}")
        print(f"Language:  {reg.language}")
        print(f"Functions: {reg.summary.total_functions}  (approved={reg.summary.approved}  pending={reg.summary.pending_review}  flagged={reg.summary.flagged})")
        print()
        for e in reg.functions:
            if e.category == "removed":
                continue
            print(f"  [{e.review.status:>12}]  {e.id}  ({e.file}:{e.line_start})")
            if e.description:
                print(f"               {e.description[:70]}")
            if e.review.status == "flagged" and e.review.notes:
                print(f"               NOTE: {e.review.notes}")

    return 0


# ---------------------------------------------------------------------------
# Subcommand: review
# ---------------------------------------------------------------------------


def cmd_review(args: argparse.Namespace) -> int:
    repo_root = Path(args.repo).resolve()
    registry_path = repo_root / REGISTRY_RELATIVE
    if not registry_path.exists():
        print(f"No registry at {registry_path}", file=sys.stderr)
        return 1

    reg = load_registry(registry_path)
    target = next((e for e in reg.functions if e.id == args.function), None)
    if target is None:
        print(f"Function '{args.function}' not found.", file=sys.stderr)
        return 1

    target.review.status = args.status
    target.review.reviewer = args.reviewer
    target.review.reviewed_at = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    target.dates.last_reviewed = datetime.date.today().isoformat()
    if args.notes:
        target.review.notes = args.notes

    recompute_summary(reg)
    registry_path.write_text(registry_to_yaml(reg), encoding="utf-8")
    print(f"Updated '{args.function}': status={args.status}, reviewer={args.reviewer}")
    return 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="clinical_audit_scanner.py")
    sub = p.add_subparsers(dest="cmd", required=True)

    ps = sub.add_parser("scan", help="Discover functions and write/update registry.yaml")
    ps.add_argument("--repo", required=True)
    ps.add_argument("--language", choices=["rust", "julia", "auto"], default="auto")
    ps.set_defaults(func=cmd_scan)

    pr = sub.add_parser("report", help="Print registry state")
    pr.add_argument("--repo", required=True)
    pr.add_argument("--format", choices=["text", "json", "markdown"], default="text")
    pr.set_defaults(func=cmd_report)

    pv = sub.add_parser("review", help="Set review status on a function")
    pv.add_argument("--repo", required=True)
    pv.add_argument("--function", required=True)
    pv.add_argument("--status", required=True, choices=["approved", "flagged"])
    pv.add_argument("--reviewer", required=True)
    pv.add_argument("--notes", default=None)
    pv.set_defaults(func=cmd_review)

    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if hasattr(args, "language") and args.language:
        args.language = {"rust": "Rust", "julia": "Julia", "auto": "auto"}.get(
            args.language.lower(), args.language
        )
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
