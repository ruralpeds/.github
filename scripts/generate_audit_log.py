#!/usr/bin/env python3
"""
generate_audit_log.py — Generate and maintain comprehensive audit logs.

Tracks build history, creation dates, modification dates, commit references,
and full build provenance for every CI run. Stored per-repo and regularly
updated.

Usage: python generate_audit_log.py <repo_path> [--update]

Outputs a JSON audit ledger at <repo_path>/audit-log/ledger.json
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def git(*args, cwd=None) -> str:
    """Run a git command and return stdout."""
    result = subprocess.run(
        ["git", *args],
        capture_output=True,
        text=True,
        cwd=cwd,
    )
    return result.stdout.strip()


def get_repo_metadata(repo: Path) -> dict:
    """Gather comprehensive repo metadata."""
    return {
        "repository": os.environ.get("GITHUB_REPOSITORY", git("remote", "get-url", "origin", cwd=repo)),
        "default_branch": git("rev-parse", "--abbrev-ref", "HEAD", cwd=repo),
        "first_commit_date": git("log", "--reverse", "--format=%aI", cwd=repo).split("\n")[0] if git("log", "--reverse", "--format=%aI", cwd=repo) else None,
        "total_commits": git("rev-list", "--count", "HEAD", cwd=repo),
    }


def get_build_entry(repo: Path) -> dict:
    """Generate a single build audit entry with full provenance."""
    now = datetime.now(timezone.utc)
    sha = git("rev-parse", "HEAD", cwd=repo)
    short_sha = git("rev-parse", "--short", "HEAD", cwd=repo)

    # Get commit details
    commit_msg = git("log", "-1", "--format=%s", cwd=repo)
    commit_author = git("log", "-1", "--format=%an <%ae>", cwd=repo)
    commit_date = git("log", "-1", "--format=%aI", cwd=repo)

    # Get tag if present
    tag = git("describe", "--tags", "--exact-match", "HEAD", cwd=repo)

    # Get changed files in this commit
    changed_files = git("diff-tree", "--no-commit-id", "--name-status", "-r", sha, cwd=repo)
    file_changes = []
    for line in changed_files.split("\n"):
        if line.strip():
            parts = line.split("\t", 1)
            if len(parts) == 2:
                file_changes.append({"status": parts[0], "path": parts[1]})

    entry = {
        "id": f"{now.strftime('%Y%m%d%H%M%S')}_{short_sha}",
        "timestamp": now.isoformat(),
        "date_created": now.strftime("%Y-%m-%d"),
        "date_modified": now.strftime("%Y-%m-%d"),
        "date_last_reviewed": None,
        "build": {
            "run_id": os.environ.get("GITHUB_RUN_ID", "local"),
            "run_number": os.environ.get("GITHUB_RUN_NUMBER", "0"),
            "workflow": os.environ.get("GITHUB_WORKFLOW", "local"),
            "event": os.environ.get("GITHUB_EVENT_NAME", "manual"),
            "actor": os.environ.get("GITHUB_ACTOR", git("config", "user.name", cwd=repo)),
            "runner_os": os.environ.get("RUNNER_OS", "local"),
        },
        "commit": {
            "sha": sha,
            "short_sha": short_sha,
            "message": commit_msg,
            "author": commit_author,
            "date": commit_date,
            "tag": tag if tag else None,
            "branch": os.environ.get("GITHUB_REF_NAME", git("rev-parse", "--abbrev-ref", "HEAD", cwd=repo)),
        },
        "references": {
            "commit_url": f"https://github.com/{os.environ.get('GITHUB_REPOSITORY', '')}/commit/{sha}",
            "run_url": f"https://github.com/{os.environ.get('GITHUB_REPOSITORY', '')}/actions/runs/{os.environ.get('GITHUB_RUN_ID', '')}",
            "tree_url": f"https://github.com/{os.environ.get('GITHUB_REPOSITORY', '')}/tree/{sha}",
        },
        "changes": {
            "files_changed": len(file_changes),
            "files": file_changes[:50],  # Cap at 50 to avoid huge entries
        },
        "status": "success",
    }

    return entry


def load_ledger(ledger_path: Path) -> dict:
    """Load existing ledger or create new one."""
    if ledger_path.exists():
        try:
            return json.loads(ledger_path.read_text())
        except (json.JSONDecodeError, OSError):
            pass

    return {
        "schema_version": "2.0",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_updated": None,
        "repository": None,
        "summary": {
            "total_builds": 0,
            "first_build": None,
            "last_build": None,
            "date_last_reviewed": None,
            "contributors": [],
        },
        "builds": [],
        "review_history": [],
    }


def update_ledger(ledger: dict, entry: dict, repo_meta: dict) -> dict:
    """Add a build entry and update summary."""
    ledger["last_updated"] = datetime.now(timezone.utc).isoformat()
    ledger["repository"] = repo_meta

    # Avoid duplicate entries for same commit
    existing_shas = {b["commit"]["sha"] for b in ledger["builds"]}
    if entry["commit"]["sha"] in existing_shas:
        # Update existing entry's date_modified
        for b in ledger["builds"]:
            if b["commit"]["sha"] == entry["commit"]["sha"]:
                b["date_modified"] = entry["timestamp"]
                b["build"] = entry["build"]
                break
    else:
        ledger["builds"].append(entry)

    # Update summary
    ledger["summary"]["total_builds"] = len(ledger["builds"])
    if ledger["builds"]:
        ledger["summary"]["first_build"] = ledger["builds"][0]["timestamp"]
        ledger["summary"]["last_build"] = ledger["builds"][-1]["timestamp"]

    # Track unique contributors
    contributors = set()
    for b in ledger["builds"]:
        actor = b.get("build", {}).get("actor")
        if actor:
            contributors.add(actor)
    ledger["summary"]["contributors"] = sorted(contributors)

    # Preserve date_last_reviewed from existing review_history
    reviews = ledger.get("review_history", [])
    if reviews:
        ledger["summary"]["date_last_reviewed"] = reviews[-1].get("reviewed_at")
    else:
        ledger["summary"]["date_last_reviewed"] = None

    # Keep last 500 builds to prevent unbounded growth
    if len(ledger["builds"]) > 500:
        ledger["builds"] = ledger["builds"][-500:]

    return ledger


def stamp_review(ledger: dict, reviewer: str, notes: str = "") -> dict:
    """Record a manual code review event in the ledger."""
    now = datetime.now(timezone.utc).isoformat()
    review_entry = {
        "reviewed_at": now,
        "reviewer": reviewer,
        "notes": notes,
    }
    if "review_history" not in ledger:
        ledger["review_history"] = []
    ledger["review_history"].append(review_entry)
    ledger["summary"]["date_last_reviewed"] = now

    # Also stamp the most recent build entry with the review date
    if ledger.get("builds"):
        ledger["builds"][-1]["date_last_reviewed"] = now

    ledger["last_updated"] = now
    return ledger


def main():
    if len(sys.argv) < 2:
        print("Usage: generate_audit_log.py <repo_path> [--update] [--review <reviewer> [notes]]")
        sys.exit(1)

    repo = Path(sys.argv[1]).resolve()
    update_mode = "--update" in sys.argv
    review_mode = "--review" in sys.argv

    reviewer = ""
    review_notes = ""
    if review_mode:
        idx = sys.argv.index("--review")
        reviewer = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else "unknown"
        review_notes = sys.argv[idx + 2] if idx + 2 < len(sys.argv) else ""

    if not repo.exists():
        print(f"::error::Repo path does not exist: {repo}")
        sys.exit(1)

    audit_dir = repo / "audit-log"
    audit_dir.mkdir(parents=True, exist_ok=True)
    ledger_path = audit_dir / "ledger.json"

    repo_meta = get_repo_metadata(repo)
    entry = get_build_entry(repo)
    ledger = load_ledger(ledger_path)
    ledger = update_ledger(ledger, entry, repo_meta)

    if review_mode:
        ledger = stamp_review(ledger, reviewer, review_notes)
        print(f"  Review stamped by: {reviewer}")

    ledger_path.write_text(json.dumps(ledger, indent=2) + "\n")
    print(f"Audit ledger updated: {ledger_path}")
    print(f"  Total builds tracked: {ledger['summary']['total_builds']}")
    print(f"  Last build: {entry['commit']['short_sha']} by {entry['build']['actor']}")
    if ledger["summary"].get("date_last_reviewed"):
        print(f"  Last reviewed: {ledger['summary']['date_last_reviewed']}")

    # Also write individual entry for easy access
    entry_file = audit_dir / f"{entry['id']}.json"
    entry_file.write_text(json.dumps(entry, indent=2) + "\n")
    print(f"  Entry written: {entry_file.name}")

    # Set output for GitHub Actions
    output_file = os.environ.get("GITHUB_OUTPUT")
    if output_file:
        with open(output_file, "a") as f:
            f.write(f"entry_id={entry['id']}\n")
            f.write(f"ledger_path={ledger_path}\n")


if __name__ == "__main__":
    main()
