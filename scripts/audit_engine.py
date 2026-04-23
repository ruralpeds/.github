#!/usr/bin/env python3
"""
audit_engine.py — repository audit log engine.

Usage:
  audit_engine.py update   # read/write .github/AUDIT.yaml + AUDIT_LOG.md

Writes these GitHub Actions outputs:
  status           — fresh | stale | missing-sources | updated
  last-reviewed    — ISO8601
  changed          — true | false
  source-count     — int
  history-count    — int

Environment inputs:
  REVIEW_INTERVAL_DAYS, CLASSIFICATION, REQUIRE_SOURCES, MARK_REVIEWED,
  REVIEWER, REPO, COMMIT_SHA, COMMIT_MSG
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap, CommentedSeq

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

REPO_ROOT = Path(".")
AUDIT_PATH = REPO_ROOT / ".github" / "AUDIT.yaml"
AUDIT_LOG_PATH = REPO_ROOT / "AUDIT_LOG.md"

# ───────────────────────────────────────────────────────────── helpers

def sh(*args: str) -> str:
    return subprocess.check_output(args, text=True).strip()

def iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()

def first_commit_iso() -> str:
    return sh("git", "log", "--reverse", "--format=%cI", "--max-parents=0").splitlines()[0]

def last_commit_iso() -> str:
    return sh("git", "log", "-1", "--format=%cI")

def set_output(key: str, value) -> None:
    path = os.environ.get("GITHUB_OUTPUT")
    if not path:
        print(f"{key}={value}")
        return
    with open(path, "a") as f:
        f.write(f"{key}={value}\n")

# ───────────────────────────────────────────────────────────── sources

SOURCE_MARKER = re.compile(
    r"<!--\s*SOURCE:\s*(?P<type>\w+)\s*\|\s*(?P<name>[^|]+?)\s*"
    r"(?:\|\s*(?P<url>https?://\S+?)\s*)?"
    r"(?:\|\s*accessed=(?P<accessed>\d{4}-\d{2}-\d{2})\s*)?-->",
    re.IGNORECASE,
)

def harvest_sources() -> list[dict]:
    """Harvest declared sources from:
       - .github/AUDIT.yaml (existing)
       - CITATION.cff (Citation File Format)
       - CITATIONS.md / REFERENCES.md — markdown bullet list of DOIs/URLs
       - Any file with <!-- SOURCE: type|name|url|accessed=YYYY-MM-DD --> markers
    """
    sources: dict[str, dict] = {}

    # CITATION.cff
    cff = REPO_ROOT / "CITATION.cff"
    if cff.exists():
        try:
            data = yaml.load(cff.read_text())
            for ref in (data.get("references") or []):
                key = ref.get("doi") or ref.get("url") or ref.get("title")
                if key:
                    sources[str(key)] = {
                        "type": "citation",
                        "name": ref.get("title", "Untitled"),
                        "url":  ref.get("url") or (f"https://doi.org/{ref['doi']}" if ref.get("doi") else None),
                        "accessed": ref.get("date-accessed"),
                    }
        except Exception:
            pass

    # CITATIONS.md / REFERENCES.md
    for name in ("CITATIONS.md", "REFERENCES.md", "SOURCES.md"):
        p = REPO_ROOT / name
        if p.exists():
            for line in p.read_text().splitlines():
                m = re.match(r"\s*[-*]\s+\[(?P<name>[^\]]+)\]\((?P<url>[^)]+)\)", line)
                if m:
                    sources[m["url"]] = {
                        "type": "document",
                        "name": m["name"].strip(),
                        "url":  m["url"].strip(),
                        "accessed": None,
                    }

    # Inline markers across all tracked files
    for rel in sh("git", "ls-files").splitlines():
        p = REPO_ROOT / rel
        if not p.is_file() or p.stat().st_size > 5_000_000:
            continue
        try:
            text = p.read_text(errors="ignore")
        except Exception:
            continue
        for m in SOURCE_MARKER.finditer(text):
            key = (m["url"] or m["name"]).strip()
            sources[key] = {
                "type": m["type"].lower(),
                "name": m["name"].strip(),
                "url": (m["url"] or "").strip() or None,
                "accessed": m["accessed"],
            }

    return list(sources.values())

# ───────────────────────────────────────────────────────────── core

def load_or_init() -> CommentedMap:
    if AUDIT_PATH.exists():
        return yaml.load(AUDIT_PATH.read_text()) or CommentedMap()
    AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
    m = CommentedMap()
    m["metadata"] = CommentedMap()
    m["sources"] = CommentedSeq()
    m["compliance"] = CommentedMap()
    m["history"] = CommentedSeq()
    return m

def update() -> None:
    repo           = os.environ["REPO"]
    classification = os.environ["CLASSIFICATION"]
    interval       = int(os.environ["REVIEW_INTERVAL_DAYS"])
    mark_reviewed  = os.environ["MARK_REVIEWED"].lower() == "true"
    reviewer       = os.environ["REVIEWER"]
    commit_sha     = os.environ["COMMIT_SHA"]
    commit_msg     = os.environ.get("COMMIT_MSG", "").splitlines()[0][:120]

    doc = load_or_init()
    meta = doc.setdefault("metadata", CommentedMap())

    # ── metadata ──
    meta["repo_name"]      = repo
    meta["classification"] = classification
    meta.setdefault("created", first_commit_iso())
    meta["last_modified"]  = last_commit_iso()

    if mark_reviewed or "last_reviewed" not in meta:
        meta["last_reviewed"] = iso_now()
        meta["reviewer"]      = reviewer

    # ── sources ──
    sources = harvest_sources()
    doc["sources"] = CommentedSeq(sources)

    # ── history (append-only) ──
    history = doc.setdefault("history", CommentedSeq())
    existing_shas = {h.get("commit") for h in history if isinstance(h, dict)}
    if commit_sha not in existing_shas:
        history.append(CommentedMap({
            "date":        iso_now(),
            "action":      "modified",
            "commit":      commit_sha,
            "reviewer":    reviewer,
            "description": commit_msg or "automated audit update",
        }))

    # ── freshness ──
    last_reviewed = datetime.fromisoformat(meta["last_reviewed"].replace("Z", "+00:00"))
    age_days = (datetime.now(timezone.utc) - last_reviewed).days
    status = "stale" if age_days > interval else "fresh"
    if not sources and os.environ.get("REQUIRE_SOURCES", "").lower() == "true":
        status = "missing-sources"

    # ── write ──
    before = AUDIT_PATH.read_text() if AUDIT_PATH.exists() else ""
    with open(AUDIT_PATH, "w") as f:
        yaml.dump(doc, f)
    after = AUDIT_PATH.read_text()

    write_markdown_log(doc)

    # ── outputs ──
    set_output("status", status)
    set_output("last-reviewed", meta["last_reviewed"])
    set_output("changed", "true" if before != after else "false")
    set_output("source-count", str(len(sources)))
    set_output("history-count", str(len(history)))

def write_markdown_log(doc: CommentedMap) -> None:
    meta = doc.get("metadata", {})
    sources = doc.get("sources", [])
    history = doc.get("history", [])

    lines = [
        f"# Audit Log — {meta.get('repo_name', 'unknown')}",
        "",
        "> Auto-generated from `.github/AUDIT.yaml`. Do not edit by hand.",
        "",
        "## Metadata",
        "",
        f"- **Classification:** {meta.get('classification', 'n/a')}",
        f"- **Created:**        {meta.get('created', 'n/a')}",
        f"- **Last modified:**  {meta.get('last_modified', 'n/a')}",
        f"- **Last reviewed:**  {meta.get('last_reviewed', 'n/a')}",
        f"- **Reviewer:**       {meta.get('reviewer', 'n/a')}",
        "",
        "## Sources & Citations",
        "",
    ]
    if sources:
        for s in sources:
            name = s.get("name", "—")
            url = s.get("url")
            accessed = s.get("accessed")
            suffix = f" _(accessed {accessed})_" if accessed else ""
            lines.append(f"- **{s.get('type','doc')}** — [{name}]({url}){suffix}" if url
                         else f"- **{s.get('type','doc')}** — {name}{suffix}")
    else:
        lines.append("_No sources declared. Add `CITATIONS.md` or inline `<!-- SOURCE: ... -->` markers._")

    lines += ["", "## History", "", "| Date | Action | Commit | Reviewer | Description |",
              "|---|---|---|---|---|"]
    pipe_escape = lambda s: str(s).replace('|', '\\|')
    for h in history[-50:][::-1]:     # latest 50, newest first
        desc   = pipe_escape(h.get('description', ''))
        commit = str(h.get('commit', ''))[:7]
        lines.append(
            f"| {h.get('date','')} | {h.get('action','')} | "
            f"`{commit}` | {h.get('reviewer','')} | {desc} |"
        )

    AUDIT_LOG_PATH.write_text("\n".join(lines) + "\n")

# ───────────────────────────────────────────────────────────── entry

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "update"
    if cmd == "update":
        update()
    else:
        print(f"unknown command: {cmd}", file=sys.stderr)
        sys.exit(2)
