#!/usr/bin/env python3
"""
migrate_gap_analysis.py

Scans all Rust and Julia repos in ruralpeds org for old GAPS.md files
and shows what would be migrated to the new .gap-analysis/GAP_ANALYSIS.md system.

Run locally:
  python3 scripts/migrate_gap_analysis.py --token ghp_... --org ruralpeds --dry-run

Or via workflow with:
  python3 scripts/migrate_gap_analysis.py --token $GH_TOKEN --org ruralpeds --dry-run
"""

import argparse
import base64
import json
import sys
from datetime import datetime
from pathlib import Path

import requests


ORG = "ruralpeds"
TODAY = datetime.now().strftime("%Y-%m-%d")

# Repos to skip
SKIP_REPOS = {
    ".github",
    "gap-analysis-standard",
    "gap-dashboard",
}


def api(method: str, path: str, token: str, **kwargs) -> requests.Response:
    """Make GitHub API call."""
    url = f"https://api.github.com{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    return getattr(requests, method)(url, headers=headers, timeout=30, **kwargs)


def list_org_repos(org: str, token: str, language: str = None) -> list[dict]:
    """List all non-archived repos in org, optionally filtered by language."""
    repos = []
    page = 1
    while True:
        params = {
            "page": page,
            "per_page": 100,
            "type": "sources",
            "sort": "updated",
        }
        r = api("get", f"/orgs/{org}/repos", token, params=params)
        r.raise_for_status()
        data = r.json()
        if not data:
            break

        for repo in data:
            if repo["archived"]:
                continue
            if language and repo.get("language") != language:
                continue
            repos.append(repo)
        page += 1
    return repos


def get_file(org: str, repo: str, path: str, token: str) -> dict | None:
    """Return {sha, content} or None if file doesn't exist."""
    r = api("get", f"/repos/{org}/{repo}/contents/{path}", token)
    if r.status_code == 404:
        return None
    if r.status_code != 200:
        return None
    data = r.json()
    if isinstance(data, list):  # Directory listing
        return None
    try:
        content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
        return {"sha": data["sha"], "content": content}
    except Exception:
        return None


def parse_gaps_md(content: str) -> dict:
    """Parse old GAPS.md format (markdown table-based)."""
    gaps = {"active": [], "completed": [], "abandoned": []}

    current_section = None
    in_table = False

    for line in content.split("\n"):
        line = line.strip()

        if line.startswith("## Active"):
            current_section = "active"
            in_table = False
            continue
        elif line.startswith("## Completed"):
            current_section = "completed"
            in_table = False
            continue
        elif line.startswith("## Abandoned"):
            current_section = "abandoned"
            in_table = False
            continue
        elif line.startswith("## "):
            current_section = None
            in_table = False
            continue

        # Detect table header
        if line.startswith("|") and "---|" in line:
            in_table = True
            continue

        # Parse table rows
        if in_table and line.startswith("|") and current_section:
            parts = [p.strip() for p in line.split("|")[1:-1]]
            if len(parts) >= 2 and not parts[0].startswith("-"):
                gap_id = parts[0]
                title = parts[1] if len(parts) > 1 else ""
                if gap_id and not gap_id.startswith("-"):
                    gaps[current_section].append({
                        "id": gap_id,
                        "title": title,
                        "raw": line
                    })

    return gaps


def convert_to_new_format(repo_name: str, old_gaps: dict) -> str:
    """Convert old GAPS.md to new .gap-analysis/GAP_ANALYSIS.md format."""

    content = f"""# Gap Analysis for `{repo_name}`

**Repository:** `{repo_name}`
**Last Updated:** {TODAY}
**Migrated from:** Legacy GAPS.md system

---

## Active Gaps

"""

    if old_gaps["active"]:
        for gap in old_gaps["active"]:
            # Create a new-format gap entry
            gap_id = gap["id"].strip()
            title = gap["title"].strip()
            content += f"""
### {gap_id}: {title}

**Status**: Backlog
**Priority**: P3 (Medium)
**Owner**: [Unassigned]
**Target Completion**: TBD

**Description**:
[Migrated from legacy GAPS.md - please update with full description]

**Acceptance Criteria**:
- [ ] Criterion 1

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: {TODAY}
- Migrated from legacy GAPS.md system

---
"""

    if old_gaps["completed"]:
        content += """
## Completed Gaps (Last 90 Days)

"""
        for gap in old_gaps["completed"]:
            gap_id = gap["id"].strip()
            title = gap["title"].strip()
            content += f"""
### ✅ {gap_id}: {title}

**Status**: Completed
**Completed Date**: {TODAY}
**PR**: (migrated from legacy)
**Completion Notes**: Migrated from legacy GAPS.md system

---
"""

    content += """
## How to update

1. Statuses: `Not Started`, `Backlog`, `In Progress`, `Blocked`, `In Review`, `Completed`, `Archived`
2. `status.json` is auto-generated — do not commit it (see `.gitignore`)
3. Update `Last Status Update` whenever a status changes

"""

    return content


def scan_repo(org: str, repo_name: str, token: str) -> dict | None:
    """Scan a repo for old GAPS.md. Return migration info or None."""

    # Check if repo has old GAPS.md
    old_gaps_file = get_file(org, repo_name, "GAPS.md", token)
    if not old_gaps_file:
        return None

    # Check if repo already has new .gap-analysis/
    new_gaps_file = get_file(org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", token)
    if new_gaps_file:
        return {
            "repo": repo_name,
            "status": "already_migrated",
            "old_gaps": old_gaps_file,
            "new_gaps": new_gaps_file,
        }

    # Parse old GAPS.md
    old_gaps = parse_gaps_md(old_gaps_file["content"])

    # Count gaps
    total = len(old_gaps["active"]) + len(old_gaps["completed"]) + len(old_gaps["abandoned"])

    if total == 0:
        return {
            "repo": repo_name,
            "status": "empty",
            "old_gaps": old_gaps_file,
        }

    # Generate new format
    new_content = convert_to_new_format(repo_name, old_gaps)

    return {
        "repo": repo_name,
        "status": "ready_to_migrate",
        "old_content": old_gaps_file["content"],
        "parsed_gaps": old_gaps,
        "new_content": new_content,
        "stats": {
            "active": len(old_gaps["active"]),
            "completed": len(old_gaps["completed"]),
            "abandoned": len(old_gaps["abandoned"]),
            "total": total,
        }
    }


def main():
    parser = argparse.ArgumentParser(description="Scan for old GAPS.md and show migration to new system")
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default=ORG, help="GitHub org")
    parser.add_argument("--dry-run", action="store_true", help="Dry run (show what would happen)")
    parser.add_argument("--repo", help="Scan single repo (default: all)")
    args = parser.parse_args()

    print(f"\n🔍 Scanning for legacy GAPS.md files in {args.org} org\n")

    # Get repos to scan
    if args.repo:
        repos_to_scan = [args.repo]
        print(f"Scanning single repo: {args.repo}\n")
    else:
        print("Discovering Rust and Julia repos...")
        rust_repos = list_org_repos(args.org, args.token, language="Rust")
        julia_repos = list_org_repos(args.org, args.token, language="Julia")

        all_repos = {r["name"]: r for r in rust_repos + julia_repos}
        repos_to_scan = [r for r in all_repos.keys() if r not in SKIP_REPOS]

        print(f"  Found {len(rust_repos)} Rust repos")
        print(f"  Found {len(julia_repos)} Julia repos")
        print(f"  Total (after filtering): {len(repos_to_scan)}\n")

    # Scan each repo
    results = {
        "ready_to_migrate": [],
        "already_migrated": [],
        "empty": [],
        "no_old_gaps": [],
        "errors": []
    }

    for i, repo_name in enumerate(repos_to_scan, 1):
        print(f"[{i}/{len(repos_to_scan)}] {repo_name}...", end=" ", flush=True)

        try:
            result = scan_repo(args.org, repo_name, args.token)

            if result is None:
                print("no old GAPS.md")
                results["no_old_gaps"].append(repo_name)
            elif result["status"] == "ready_to_migrate":
                stats = result["stats"]
                print(f"✓ MIGRATE ({stats['total']} gaps: {stats['active']} active, {stats['completed']} completed)")
                results["ready_to_migrate"].append(result)
            elif result["status"] == "already_migrated":
                print("already migrated")
                results["already_migrated"].append(repo_name)
            elif result["status"] == "empty":
                print("empty GAPS.md")
                results["empty"].append(repo_name)
        except Exception as e:
            print(f"ERROR: {e}")
            results["errors"].append({"repo": repo_name, "error": str(e)})

    # Print summary
    print(f"\n{'='*70}")
    print("MIGRATION SCAN SUMMARY")
    print(f"{'='*70}\n")

    print(f"✓ Ready to migrate:     {len(results['ready_to_migrate'])} repos")
    print(f"✓ Already migrated:     {len(results['already_migrated'])} repos")
    print(f"- Empty GAPS.md:        {len(results['empty'])} repos")
    print(f"- No old GAPS.md:       {len(results['no_old_gaps'])} repos")
    print(f"❌ Errors:              {len(results['errors'])} repos")

    # Show details of repos ready to migrate
    if results["ready_to_migrate"]:
        print(f"\n{'='*70}")
        print("REPOS READY FOR MIGRATION")
        print(f"{'='*70}\n")

        for item in results["ready_to_migrate"]:
            repo = item["repo"]
            stats = item["stats"]
            print(f"\n📦 {repo}")
            print(f"   Active gaps:    {stats['active']}")
            print(f"   Completed:      {stats['completed']}")
            print(f"   Abandoned:      {stats['abandoned']}")
            print(f"   Total:          {stats['total']}")

            if stats["active"] > 0:
                print(f"\n   Old gaps (Active):")
                for gap in item["parsed_gaps"]["active"]:
                    print(f"     - {gap['id']}: {gap['title']}")

            print(f"\n   → Will create: .gap-analysis/GAP_ANALYSIS.md")
            print(f"   → Old GAPS.md will be archived")

    # Save report
    report = {
        "timestamp": TODAY,
        "org": args.org,
        "dry_run": args.dry_run,
        "summary": {
            "ready_to_migrate": len(results["ready_to_migrate"]),
            "already_migrated": len(results["already_migrated"]),
            "empty": len(results["empty"]),
            "no_old_gaps": len(results["no_old_gaps"]),
            "errors": len(results["errors"]),
        },
        "repos_to_migrate": [
            {"repo": item["repo"], "stats": item["stats"]}
            for item in results["ready_to_migrate"]
        ]
    }

    report_path = Path("/tmp/gap_migration_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n📄 Full report saved to: {report_path}")

    if args.dry_run:
        print("\n🔧 DRY RUN MODE: No changes made")
        print("\nTo proceed with migration, run without --dry-run flag")

    return 0 if not results["errors"] else 1


if __name__ == "__main__":
    sys.exit(main())
