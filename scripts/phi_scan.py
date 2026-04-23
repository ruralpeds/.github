#!/usr/bin/env python3
"""
phi_scan.py — regex-based PHI/PII scanner for clinical repos.

Usage:
  phi_scan.py --patterns .github/phi-patterns.yml \
              --output phi-findings.json \
              --fail-on {low|medium|high|critical}

Severity ranking:
  critical > high > medium > low
Exit 1 if any finding ≥ threshold.
"""

from __future__ import annotations
import argparse, json, re, subprocess, sys
from pathlib import Path

import yaml

SEVERITY_ORDER = {"low": 0, "medium": 1, "high": 2, "critical": 3}
IGNORE_DIRS = {".git", "node_modules", "target", "build", "dist", ".venv", "venv",
               "__pycache__", ".pytest_cache", ".mypy_cache"}
IGNORE_EXT  = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
               ".pdf", ".zip", ".tar", ".gz", ".xz", ".bz2", ".7z",
               ".mp3", ".mp4", ".wav", ".ogg", ".webm",
               ".woff", ".woff2", ".ttf", ".otf", ".eot",
               ".so", ".dylib", ".dll", ".exe", ".bin"}


def tracked_files() -> list[Path]:
    """Use git ls-files so we only scan source, not deps."""
    try:
        out = subprocess.check_output(["git", "ls-files"], text=True).splitlines()
    except subprocess.CalledProcessError:
        out = [str(p) for p in Path(".").rglob("*") if p.is_file()]
    paths = []
    for rel in out:
        p = Path(rel)
        if not p.is_file(): continue
        if any(part in IGNORE_DIRS for part in p.parts): continue
        if p.suffix.lower() in IGNORE_EXT: continue
        if p.stat().st_size > 5_000_000: continue
        paths.append(p)
    return paths


def load_patterns(path: Path) -> list[dict]:
    data = yaml.safe_load(path.read_text())
    compiled = []
    for p in data.get("patterns", []):
        compiled.append({
            "id":       p["id"],
            "name":     p["name"],
            "severity": p.get("severity", "medium").lower(),
            "regex":    re.compile(p["regex"]),
            "allow_in": set(p.get("allow_in_paths", [])),
        })
    return compiled


def scan(files: list[Path], patterns: list[dict]) -> list[dict]:
    findings = []
    for f in files:
        try:
            text = f.read_text(errors="ignore")
        except Exception:
            continue
        for lineno, line in enumerate(text.splitlines(), 1):
            for pat in patterns:
                # Allow-list: patterns that are fine in certain paths (e.g., test fixtures).
                if any(str(f).startswith(a) for a in pat["allow_in"]):
                    continue
                for m in pat["regex"].finditer(line):
                    findings.append({
                        "file":     str(f),
                        "line":     lineno,
                        "rule":     pat["id"],
                        "name":     pat["name"],
                        "severity": pat["severity"],
                        "match":    m.group(0)[:80],
                    })
    return findings


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--patterns", required=True, type=Path)
    ap.add_argument("--output",   required=True, type=Path)
    ap.add_argument("--fail-on",  default="high")
    args = ap.parse_args()

    patterns = load_patterns(args.patterns)
    findings = scan(tracked_files(), patterns)

    args.output.write_text(json.dumps({"findings": findings}, indent=2))

    threshold = SEVERITY_ORDER[args.fail_on]
    bad = [f for f in findings if SEVERITY_ORDER[f["severity"]] >= threshold]
    if bad:
        print(f"::error::{len(bad)} PHI finding(s) at or above {args.fail_on}:", file=sys.stderr)
        for f in bad[:20]:
            print(f"  {f['file']}:{f['line']}  [{f['severity']}]  {f['name']}", file=sys.stderr)
        return 1
    print(f"No PHI findings at severity ≥ {args.fail_on} ({len(findings)} lower-severity hits logged).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
