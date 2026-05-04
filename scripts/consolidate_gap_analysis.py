#!/usr/bin/env python3
"""
consolidate_gap_analysis.py

Consolidates root-level gap analysis files into the new .gap-analysis/ system.

For repos with root-level GAP_ANALYSIS.md or GAPS.md:
  1. Reads and parses the old file
  2. Extracts gap status (built/complete/in-progress/etc.)
  3. Merges content into new .gap-analysis/GAP_ANALYSIS.md
  4. Archives old file to .gap-analysis/archive/
  5. Commits and pushes changes

Run locally:
  python3 scripts/consolidate_gap_analysis.py --token ghp_... --org ruralpeds --dry-run
  python3 scripts/consolidate_gap_analysis.py --token ghp_... --org ruralpeds
"""

import argparse
import base64
import json
import sys
import re
from datetime import datetime
from pathlib import Path

import requests


ORG = "ruralpeds"
TODAY = datetime.now().strftime("%Y-%m-%d")

# Target repos with root-level gap files
TARGET_REPOS = {
    "Evidence-based-julia": "GAP_ANALYSIS.md",
    "Geo-julia": "GAP_ANALYSIS.md",
    "WeatherMed.jl": "GAP_ANALYSIS.md",
    "Rural-quality-julia": "GAP_ANALYSIS.md",
    "Textbook": "GAPS.md",
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


def b64(text: str) -> str:
    """Encode to base64."""
    return base64.b64encode(text.encode()).decode()


def get_file(org: str, repo: str, path: str, token: str) -> dict | None:
    """Return {sha, content} or None if file doesn't exist."""
    r = api("get", f"/repos/{org}/{repo}/contents/{path}", token)
    if r.status_code == 404:
        return None
    if r.status_code != 200:
        return None
    data = r.json()
    if isinstance(data, list):
        return None
    try:
        content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
        return {"sha": data["sha"], "content": content}
    except Exception:
        return None


def create_or_update_file(
    org: str,
    repo: str,
    path: str,
    content: str,
    message: str,
    token: str,
    sha: str | None = None,
    branch: str = "main",
) -> bool:
    """Create or update a file. Returns True on success."""
    payload = {
        "message": message,
        "content": b64(content),
        "branch": branch,
    }
    if sha:
        payload["sha"] = sha

    r = api("put", f"/repos/{org}/{repo}/contents/{path}", token, json=payload)
    return r.status_code in (200, 201)


def parse_old_gap_format(content: str) -> dict:
    """Parse old GAPS.md or GAP_ANALYSIS.md format."""
    gaps = {
        "active": [],
        "completed": [],
        "abandoned": [],
        "raw_content": content,
    }

    # Look for table rows with gap IDs
    lines = content.split("\n")
    current_section = None
    in_table = False

    for line in lines:
        stripped = line.strip()

        # Detect section headers
        if "## Active" in stripped or "## In Progress" in stripped or "## Queued" in stripped:
            current_section = "active"
            in_table = False
            continue
        elif "## Completed" in stripped or "## Done" in stripped:
            current_section = "completed"
            in_table = False
            continue
        elif "## Abandoned" in stripped or "## Rejected" in stripped:
            current_section = "abandoned"
            in_table = False
            continue
        elif stripped.startswith("## "):
            current_section = None
            continue

        # Detect table headers
        if "|" in line and "---" in line:
            in_table = True
            continue

        # Parse table rows
        if in_table and "|" in line and current_section:
            parts = [p.strip() for p in line.split("|")[1:-1]]
            if len(parts) >= 2:
                gap_id = parts[0]
                title = parts[1] if len(parts) > 1 else ""
                priority = parts[2] if len(parts) > 2 else "P3"
                category = parts[3] if len(parts) > 3 else "general"

                # Filter out header-like rows
                if gap_id and not gap_id.startswith("-") and re.match(r"GAP-\d+", gap_id):
                    gaps[current_section].append({
                        "id": gap_id,
                        "title": title,
                        "priority": priority.strip() if priority else "P3",
                        "category": category.strip() if category else "general",
                    })

    return gaps


def convert_to_new_format(repo_name: str, old_gaps: dict, old_filename: str) -> str:
    """Convert old gaps to new .gap-analysis/GAP_ANALYSIS.md format."""

    content = f"""# Gap Analysis for `{repo_name}`

**Repository:** `{repo_name}`
**Last Updated:** {TODAY}
**Migrated from:** `{old_filename}` (consolidated from root level)
**Maintainer:** [Unassigned]

---

## Active Gaps

"""

    # Add active gaps
    if old_gaps["active"]:
        for gap in old_gaps["active"]:
            gap_id = gap["id"].strip()
            title = gap["title"].strip()
            priority = gap["priority"].strip() if gap["priority"] else "P3"
            category = gap["category"].strip() if gap["category"] else "general"

            content += f"""
### {gap_id}: {title}

**Status**: In Progress
**Priority**: {priority}
**Owner**: [Unassigned]
**Target Completion**: TBD

**Description**:
[Migrated from {old_filename}]

**Acceptance Criteria**:
- [ ] Criterion 1

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: {TODAY}
- Migrated from root-level {old_filename}

---
"""

    # Add completed gaps
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
**PR**: (migrated from root-level {old_filename})
**Completion Notes**: Consolidated from legacy gap tracking file

---
"""

    content += """
## How to update

1. Statuses: `Not Started`, `Backlog`, `In Progress`, `Blocked`, `In Review`, `Completed`, `Archived`
2. `status.json` is auto-generated — do not commit it (see `.gitignore`)
3. Update `Last Status Update` whenever a status changes; commit with `docs: GAP-NNN <verb>`

"""

    return content


def consolidate_repo(
    org: str,
    repo_name: str,
    old_filename: str,
    token: str,
    dry_run: bool,
) -> dict:
    """Consolidate gap files in a repo."""
    result = {
        "repo": repo_name,
        "status": "skipped",
        "old_file": old_filename,
        "gaps_found": 0,
        "actions": [],
    }

    # Get default branch
    r = api("get", f"/repos/{org}/{repo_name}", token)
    if r.status_code != 200:
        result["status"] = "error"
        result["error"] = "Failed to get repo info"
        return result

    default_branch = r.json().get("default_branch", "main")

    # Read old gap file
    old_file = get_file(org, repo_name, old_filename, token)
    if not old_file:
        result["status"] = "not_found"
        return result

    # Parse old gaps
    old_gaps = parse_old_gap_format(old_file["content"])
    total_gaps = len(old_gaps["active"]) + len(old_gaps["completed"]) + len(old_gaps["abandoned"])

    result["gaps_found"] = total_gaps
    result["active_count"] = len(old_gaps["active"])
    result["completed_count"] = len(old_gaps["completed"])
    result["abandoned_count"] = len(old_gaps["abandoned"])

    if total_gaps == 0:
        result["status"] = "empty"
        return result

    if dry_run:
        result["status"] = "would_consolidate"
        result["actions"] = [
            f"Parse {old_filename} ({total_gaps} gaps)",
            "Merge into .gap-analysis/GAP_ANALYSIS.md",
            f"Archive {old_filename} to .gap-analysis/archive/",
            "Commit changes",
        ]
        return result

    try:
        # 1. Read new gap file
        new_file = get_file(org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", token)
        if not new_file:
            result["status"] = "error"
            result["error"] = "New .gap-analysis/GAP_ANALYSIS.md not found"
            return result

        # 2. Convert old gaps to new format
        new_content = convert_to_new_format(repo_name, old_gaps, old_filename)

        # 3. Create archive directory and archive old file
        archive_path = f".gap-analysis/archive/{old_filename}.archived"
        archive_content = f"""# Archived Gap Analysis
**Original file:** `{old_filename}`
**Archived date:** {TODAY}
**Reason:** Consolidated into .gap-analysis/GAP_ANALYSIS.md

---

## Original Content

{old_file['content']}
"""

        success = create_or_update_file(
            org,
            repo_name,
            archive_path,
            archive_content,
            f"chore(gap): archive legacy {old_filename}",
            token,
            branch=default_branch,
        )

        if not success:
            result["status"] = "error"
            result["error"] = f"Failed to archive {old_filename}"
            return result

        result["actions"].append(f"Archived {old_filename} to .gap-analysis/archive/")

        # 4. Update new gap file
        success = create_or_update_file(
            org,
            repo_name,
            ".gap-analysis/GAP_ANALYSIS.md",
            new_content,
            f"chore(gap): consolidate legacy gaps from {old_filename}",
            token,
            sha=new_file["sha"],
            branch=default_branch,
        )

        if not success:
            result["status"] = "error"
            result["error"] = "Failed to update .gap-analysis/GAP_ANALYSIS.md"
            return result

        result["actions"].append("Updated .gap-analysis/GAP_ANALYSIS.md")
        result["status"] = "consolidated"
        return result

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        return result


def main():
    parser = argparse.ArgumentParser(description="Consolidate root-level gap files into new system")
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default=ORG, help="GitHub org")
    parser.add_argument("--dry-run", action="store_true", help="Dry run (show what would happen)")
    parser.add_argument("--repo", help="Consolidate single repo (default: all target repos)")
    args = parser.parse_args()

    print(f"\n📦 Consolidating root-level gap analysis files\n")

    # Determine repos to process
    if args.repo:
        if args.repo not in TARGET_REPOS:
            print(f"❌ {args.repo} not in target repos")
            return 1
        repos_to_process = {args.repo: TARGET_REPOS[args.repo]}
        print(f"Consolidating single repo: {args.repo}\n")
    else:
        repos_to_process = TARGET_REPOS
        print(f"Found {len(TARGET_REPOS)} repos with root-level gap files\n")

    # Process each repo
    results = {
        "consolidated": [],
        "would_consolidate": [],
        "not_found": [],
        "empty": [],
        "errors": [],
    }

    for i, (repo_name, old_filename) in enumerate(repos_to_process.items(), 1):
        print(f"[{i}/{len(repos_to_process)}] {repo_name}...", end=" ", flush=True)

        try:
            result = consolidate_repo(args.org, repo_name, old_filename, args.token, args.dry_run)

            if result["status"] == "consolidated":
                print(f"✓ CONSOLIDATED ({result['gaps_found']} gaps)")
                results["consolidated"].append(result)
            elif result["status"] == "would_consolidate":
                print(f"→ WOULD consolidate ({result['gaps_found']} gaps)")
                results["would_consolidate"].append(result)
            elif result["status"] == "not_found":
                print("not found")
                results["not_found"].append(repo_name)
            elif result["status"] == "empty":
                print("empty")
                results["empty"].append(repo_name)
            else:
                print(f"❌ ERROR: {result.get('error', 'unknown')}")
                results["errors"].append(result)

        except Exception as e:
            print(f"❌ ERROR: {e}")
            results["errors"].append({"repo": repo_name, "error": str(e)})

    # Print summary
    print(f"\n{'='*70}")
    print("CONSOLIDATION SUMMARY")
    print(f"{'='*70}\n")

    print(f"✓ Consolidated:         {len(results['consolidated'])} repos")
    print(f"→ Would consolidate:    {len(results['would_consolidate'])} repos (dry-run mode)")
    print(f"- Not found:            {len(results['not_found'])} repos")
    print(f"- Empty:                {len(results['empty'])} repos")
    print(f"❌ Errors:              {len(results['errors'])} repos")

    # Show details
    if results["consolidated"] or results["would_consolidate"]:
        print(f"\n{'='*70}")
        print("CONSOLIDATION DETAILS")
        print(f"{'='*70}\n")

        for item in results["consolidated"] + results["would_consolidate"]:
            repo = item["repo"]
            old_file = item["old_file"]
            active = item.get("active_count", 0)
            completed = item.get("completed_count", 0)
            abandoned = item.get("abandoned_count", 0)
            total = item["gaps_found"]

            print(f"\n📦 {repo}")
            print(f"  Source file: {old_file}")
            print(f"  Gaps found:")
            print(f"    Active:    {active}")
            print(f"    Completed: {completed}")
            print(f"    Abandoned: {abandoned}")
            print(f"    Total:     {total}")
            print(f"  Actions:")
            for action in item.get("actions", []):
                print(f"    → {action}")

    if results["errors"]:
        print(f"\n❌ Errors:")
        for item in results["errors"]:
            print(f"  - {item['repo']}: {item.get('error', 'unknown')}")

    # Save report
    report = {
        "timestamp": TODAY,
        "org": args.org,
        "dry_run": args.dry_run,
        "summary": {
            "consolidated": len(results["consolidated"]),
            "would_consolidate": len(results["would_consolidate"]),
            "not_found": len(results["not_found"]),
            "empty": len(results["empty"]),
            "errors": len(results["errors"]),
        },
        "consolidated_repos": [
            {
                "repo": item["repo"],
                "old_file": item["old_file"],
                "gaps": {
                    "active": item.get("active_count", 0),
                    "completed": item.get("completed_count", 0),
                    "abandoned": item.get("abandoned_count", 0),
                    "total": item["gaps_found"],
                }
            }
            for item in results["consolidated"] + results["would_consolidate"]
        ],
    }

    report_path = Path("/tmp/gap_consolidation_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n📄 Report saved to: {report_path}")

    if args.dry_run:
        print("\n🔧 DRY RUN MODE: No changes made")
        print("To proceed with consolidation, run without --dry-run flag")

    return 0 if not results["errors"] else 1


if __name__ == "__main__":
    sys.exit(main())
