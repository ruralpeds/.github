#!/usr/bin/env python3
"""
Build Audit Log Generator
=========================
Generates a comprehensive BUILD_AUDIT_LOG.md and updates build-log.json
by consolidating data from:
  - Git commit history (dates, authors, SHAs)
  - Knowledge registry (creation/modification metadata)
  - Decision tree JSON files (version, source, clinical references)
  - Package versions (Cargo.toml, package.json)

Usage:
  python scripts/generate_audit_log.py              # full regeneration
  python scripts/generate_audit_log.py --update      # append new entries since last run
  python scripts/generate_audit_log.py --json-only   # update build-log.json only
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
REGISTRY_PATH = PROJECT_ROOT / "knowledge" / "registry.json"
BUILD_LOG_PATH = PROJECT_ROOT / "build-log.json"
AUDIT_LOG_PATH = PROJECT_ROOT / "BUILD_AUDIT_LOG.md"
TREE_DATA_DIR = PROJECT_ROOT / "apps" / "web" / "static" / "decision-trees" / "tree-data"
SVELTE_TREE_DIR = PROJECT_ROOT / "apps" / "web" / "src" / "lib" / "data" / "trees"


def run_git(*args):
    """Run a git command and return stdout."""
    result = subprocess.run(
        ["git", "-C", str(PROJECT_ROOT)] + list(args),
        capture_output=True, text=True
    )
    return result.stdout.strip()


def get_git_log():
    """Get full git log as structured data."""
    raw = run_git(
        "log", "--all", "--format=%H|%aI|%an|%s", "--date=iso-strict"
    )
    commits = []
    for line in raw.splitlines():
        if not line.strip():
            continue
        parts = line.split("|", 3)
        if len(parts) == 4:
            commits.append({
                "hash": parts[0],
                "short": parts[0][:7],
                "date": parts[1],
                "author": parts[2],
                "subject": parts[3],
            })
    return commits


def get_file_first_commit(filepath):
    """Get the first commit that introduced a file."""
    rel = os.path.relpath(filepath, PROJECT_ROOT)
    result = run_git("log", "--diff-filter=A", "--format=%H|%aI|%an", "--", rel)
    if result:
        parts = result.splitlines()[-1].split("|", 2)
        if len(parts) == 3:
            return {"hash": parts[0], "date": parts[1], "author": parts[2]}
    return None


def get_file_last_commit(filepath):
    """Get the most recent commit that modified a file."""
    rel = os.path.relpath(filepath, PROJECT_ROOT)
    result = run_git("log", "-1", "--format=%H|%aI|%an|%s", "--", rel)
    if result:
        parts = result.split("|", 3)
        if len(parts) == 4:
            return {"hash": parts[0], "date": parts[1], "author": parts[2], "subject": parts[3]}
    return None


def get_file_commit_count(filepath):
    """Count how many commits touched a file."""
    rel = os.path.relpath(filepath, PROJECT_ROOT)
    result = run_git("rev-list", "--count", "HEAD", "--", rel)
    try:
        return int(result)
    except ValueError:
        return 0


def load_registry():
    """Load the knowledge registry."""
    if REGISTRY_PATH.exists():
        with open(REGISTRY_PATH) as f:
            return json.load(f)
    return {"entries": {}}


def load_tree_metadata():
    """Load metadata from all decision tree JSON files."""
    trees = []
    for d in [TREE_DATA_DIR, SVELTE_TREE_DIR]:
        if not d.exists():
            continue
        for f in sorted(d.glob("*.json")):
            try:
                with open(f) as fh:
                    data = json.load(fh)
                first = get_file_first_commit(f)
                last = get_file_last_commit(f)
                trees.append({
                    "file": str(f.relative_to(PROJECT_ROOT)),
                    "id": data.get("id", f.stem),
                    "title": data.get("title", f.stem),
                    "version": data.get("version", "—"),
                    "source": data.get("source", "—"),
                    "mode": data.get("mode", "—"),
                    "created": first["date"] if first else "unknown",
                    "created_by": first["author"] if first else "unknown",
                    "created_commit": first["hash"][:7] if first else "—",
                    "last_modified": last["date"] if last else "unknown",
                    "last_modified_by": last["author"] if last else "unknown",
                    "last_modified_commit": last["hash"][:7] if last else "—",
                    "last_modified_subject": last["subject"] if last else "—",
                    "commit_count": get_file_commit_count(f),
                })
            except (json.JSONDecodeError, KeyError):
                continue
    return trees


def get_package_versions():
    """Extract version info from package files."""
    versions = {}
    pkg_web = PROJECT_ROOT / "apps" / "web" / "package.json"
    if pkg_web.exists():
        with open(pkg_web) as f:
            d = json.load(f)
            versions["web_app"] = d.get("version", "unknown")
    cargo = PROJECT_ROOT / "Cargo.toml"
    if cargo.exists():
        with open(cargo) as f:
            for line in f:
                if "version" in line and "=" in line:
                    v = line.split("=", 1)[1].strip().strip('"')
                    versions["rust_workspace"] = v
                    break
    return versions


def format_date(iso_str):
    """Format ISO date to readable form."""
    if not iso_str or iso_str in ("unknown", "—"):
        return "—"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M")
    except (ValueError, AttributeError):
        return iso_str[:16]


def generate_build_log_json(commits, registry, trees, versions):
    """Generate the machine-readable build-log.json."""
    now = datetime.now(timezone.utc).isoformat()
    entries = registry.get("entries", {})

    # Build events from commits
    build_events = []
    for c in commits:
        event = {
            "type": "commit",
            "date": c["date"],
            "author": c["author"],
            "commit": c["short"],
            "subject": c["subject"],
        }
        # Categorize
        subj = c["subject"].lower()
        if any(k in subj for k in ["feat", "add"]):
            event["action"] = "created"
        elif any(k in subj for k in ["fix", "correct"]):
            event["action"] = "fixed"
        elif any(k in subj for k in ["refactor", "chore", "clean"]):
            event["action"] = "maintenance"
        elif "merge" in subj:
            event["action"] = "merged"
        elif any(k in subj for k in ["docs", "doc"]):
            event["action"] = "documented"
        elif "test" in subj:
            event["action"] = "tested"
        else:
            event["action"] = "modified"
        build_events.append(event)

    # Artifact inventory
    artifacts = []
    for eid, entry in entries.items():
        artifacts.append({
            "id": eid,
            "category": entry.get("category"),
            "title": entry.get("title"),
            "status": entry.get("status"),
            "created": entry.get("created"),
            "created_by": entry.get("created_by"),
            "created_commit": entry.get("created_commit"),
            "modification_count": len(entry.get("modifications", [])),
            "source_documents": entry.get("source_documents", []),
            "tags": entry.get("tags", []),
        })

    build_log = {
        "schema_version": "2.0.0",
        "generated": now,
        "generator": "scripts/generate_audit_log.py",
        "project": "Pediatric Emergency Decision Support",
        "versions": versions,
        "summary": {
            "total_commits": len(commits),
            "total_artifacts": len(artifacts),
            "total_decision_trees": len(trees),
            "categories": {},
        },
        "builds": build_events,
        "artifacts": artifacts,
        "decision_trees": trees,
    }

    # Category summary
    for a in artifacts:
        cat = a.get("category", "unknown")
        build_log["summary"]["categories"][cat] = (
            build_log["summary"]["categories"].get(cat, 0) + 1
        )

    with open(BUILD_LOG_PATH, "w") as f:
        json.dump(build_log, f, indent=2)
    return build_log


def generate_audit_log_md(commits, registry, trees, versions, build_log):
    """Generate the human-readable BUILD_AUDIT_LOG.md."""
    now = datetime.now(timezone.utc)
    entries = registry.get("entries", {})
    current_branch = run_git("rev-parse", "--abbrev-ref", "HEAD")
    current_commit = run_git("rev-parse", "--short", "HEAD")

    lines = []
    lines.append("# Build Audit Log")
    lines.append("")
    lines.append(f"**Generated:** {now.strftime('%Y-%m-%d %H:%M UTC')}  ")
    lines.append(f"**Branch:** `{current_branch}`  ")
    lines.append(f"**Commit:** `{current_commit}`  ")
    lines.append(f"**Generator:** `scripts/generate_audit_log.py`  ")
    lines.append(f"**Machine-readable log:** `build-log.json`")
    lines.append("")

    # ── Summary
    lines.append("## Summary")
    lines.append("")
    lines.append(f"| Metric | Count |")
    lines.append(f"|--------|-------|")
    lines.append(f"| Total commits | {len(commits)} |")
    lines.append(f"| Knowledge artifacts | {len(entries)} |")
    lines.append(f"| Decision trees (JSON) | {len(trees)} |")
    lines.append(f"| Web app version | {versions.get('web_app', '—')} |")
    lines.append(f"| Rust workspace version | {versions.get('rust_workspace', '—')} |")
    lines.append("")

    # Category breakdown
    cats = build_log["summary"]["categories"]
    lines.append("### Artifacts by Category")
    lines.append("")
    lines.append("| Category | Count |")
    lines.append("|----------|-------|")
    for cat in sorted(cats):
        lines.append(f"| {cat} | {cats[cat]} |")
    lines.append("")

    # ── Decision Trees
    lines.append("## Decision Trees")
    lines.append("")
    lines.append("| Tree | Version | Mode | Source/Guideline | Created | Last Modified | Commits |")
    lines.append("|------|---------|------|------------------|---------|---------------|---------|")
    for t in sorted(trees, key=lambda x: x["id"]):
        src = t["source"] if t["source"] != "—" else ""
        lines.append(
            f"| {t['title']} | {t['version']} | {t['mode']} | {src} "
            f"| {format_date(t['created'])} (`{t['created_commit']}`) "
            f"| {format_date(t['last_modified'])} (`{t['last_modified_commit']}`) "
            f"| {t['commit_count']} |"
        )
    lines.append("")

    # ── Knowledge Registry Artifacts
    lines.append("## Knowledge Registry Artifacts")
    lines.append("")

    # Group by category
    by_cat = {}
    for eid, entry in entries.items():
        cat = entry.get("category", "unknown")
        by_cat.setdefault(cat, []).append((eid, entry))

    for cat in sorted(by_cat):
        items = sorted(by_cat[cat], key=lambda x: x[0])
        lines.append(f"### {cat.replace('_', ' ').title()} ({len(items)})")
        lines.append("")
        lines.append("| ID | Title | Created | Created By | Commit | Modifications | Source Docs | Status |")
        lines.append("|----|-------|---------|------------|--------|---------------|-------------|--------|")
        for eid, entry in items:
            mods = entry.get("modifications", [])
            mod_count = len(mods)
            mod_info = f"{mod_count}"
            if mods:
                last_mod = mods[-1]
                mod_info = f"{mod_count} (last: {format_date(last_mod.get('date', ''))})"
            src_docs = ", ".join(entry.get("source_documents", [])) or "—"
            commit = entry.get("created_commit")
            commit_str = f"`{commit[:7]}`" if commit and commit != "None" else "—"
            lines.append(
                f"| {eid} | {entry.get('title', '—')} "
                f"| {format_date(entry.get('created', ''))} "
                f"| {entry.get('created_by', '—')} "
                f"| {commit_str} "
                f"| {mod_info} "
                f"| {src_docs} "
                f"| {entry.get('status', '—')} |"
            )
        lines.append("")

    # ── Full Commit History
    lines.append("## Commit History")
    lines.append("")
    lines.append("| Date | Author | Commit | Subject |")
    lines.append("|------|--------|--------|---------|")
    for c in commits:
        lines.append(
            f"| {format_date(c['date'])} | {c['author']} | `{c['short']}` | {c['subject']} |"
        )
    lines.append("")

    # ── Evidence References
    lines.append("## Clinical Evidence References")
    lines.append("")
    lines.append("References extracted from decision trees and knowledge registry entries.")
    lines.append("")
    refs_found = False
    for eid, entry in entries.items():
        primary_refs = entry.get("primary_references", [])
        if primary_refs:
            refs_found = True
            lines.append(f"### {entry.get('title', eid)}")
            lines.append("")
            for ref in primary_refs:
                doi = ref.get("doi", "")
                year = ref.get("year", "")
                rtype = ref.get("type", "")
                lines.append(f"- **{rtype}** ({year}): DOI `{doi}`")
            lines.append("")
    # Tree-level sources
    for t in trees:
        if t["source"] and t["source"] != "—":
            refs_found = True
            lines.append(f"- **{t['title']}** v{t['version']}: {t['source']}")
    if not refs_found:
        lines.append("_No explicit evidence references found. Add `source` fields to tree JSON and `primary_references` to registry entries._")
    lines.append("")

    # ── Footer
    lines.append("---")
    lines.append("")
    lines.append("*This log is auto-generated. Run `python scripts/generate_audit_log.py` to regenerate.*  ")
    lines.append("*Automatic updates occur on every push via `.github/workflows/audit-log.yml`.*")
    lines.append("")

    with open(AUDIT_LOG_PATH, "w") as f:
        f.write("\n".join(lines))


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Generate build audit log")
    parser.add_argument("--json-only", action="store_true", help="Only update build-log.json")
    parser.add_argument("--update", action="store_true", help="Incremental update")
    args = parser.parse_args()

    print("Collecting git history...")
    commits = get_git_log()
    print(f"  {len(commits)} commits found")

    print("Loading knowledge registry...")
    registry = load_registry()
    print(f"  {len(registry.get('entries', {}))} entries")

    print("Scanning decision tree metadata...")
    trees = load_tree_metadata()
    print(f"  {len(trees)} trees found")

    print("Reading package versions...")
    versions = get_package_versions()
    print(f"  {versions}")

    print("Generating build-log.json...")
    build_log = generate_build_log_json(commits, registry, trees, versions)

    if not args.json_only:
        print("Generating BUILD_AUDIT_LOG.md...")
        generate_audit_log_md(commits, registry, trees, versions, build_log)

    print("Done.")
    print(f"  build-log.json: {BUILD_LOG_PATH}")
    if not args.json_only:
        print(f"  BUILD_AUDIT_LOG.md: {AUDIT_LOG_PATH}")


if __name__ == "__main__":
    main()
