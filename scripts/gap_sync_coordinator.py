#!/usr/bin/env python3
"""
gap_sync_coordinator.py

Builds cross-repo deadline index and synchronization status.
- Reads GAP_ANALYSIS.md from all repos
- Aggregates deadline information
- Detects deadline collisions (convergence risks)
- Identifies ownership coverage gaps
- Generates coordination metrics

Usage:
    python3 scripts/gap_sync_coordinator.py --token ghp_... --org ruralpeds --output index.json
"""

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests


def api(method: str, path: str, token: str, **kwargs) -> requests.Response:
    """Make GitHub API call."""
    url = f"https://api.github.com{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    return getattr(requests, method)(url, headers=headers, timeout=30, **kwargs)


def list_org_repos(org: str, token: str) -> list[dict]:
    """List all non-archived repos in org."""
    repos = []
    page = 1
    while True:
        r = api("get", f"/orgs/{org}/repos", token, params={
            "page": page,
            "per_page": 100,
            "type": "sources",
            "sort": "updated",
        })
        r.raise_for_status()
        data = r.json()
        if not data:
            break
        repos.extend([r for r in data if not r["archived"]])
        page += 1
    return repos


def get_file_content(org: str, repo: str, path: str, token: str) -> Optional[str]:
    """Fetch file content from GitHub."""
    r = api("get", f"/repos/{org}/{repo}/contents/{path}", token)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    data = r.json()
    if isinstance(data, list):
        return None
    headers = {"Authorization": f"Bearer {token}"}
    raw_r = requests.get(data["download_url"], headers=headers, timeout=30)
    raw_r.raise_for_status()
    return raw_r.text


def parse_deadline_date(date_str: str) -> Optional[str]:
    """Parse and normalize date string to YYYY-MM-DD."""
    if not date_str or date_str.upper() in ("TBD", "NONE", "N/A"):
        return None

    formats = ["%Y-%m-%d", "%m/%d/%Y", "%b %d, %Y", "%B %d, %Y"]

    for fmt in formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None


def extract_gaps_from_md(content: str, repo: str) -> list[dict]:
    """Extract all gaps from GAP_ANALYSIS.md."""
    gaps = []

    for match in re.finditer(
        r"^### ✅?\s?(GAP-\d{3,4}):\s*(.+?)(?=^### (?:✅\s)?GAP-|^## |^$)",
        content,
        re.MULTILINE | re.DOTALL
    ):
        block = match.group(0)
        gap_id = match.group(1)
        title = match.group(2).strip()

        # Extract priority
        priority_match = re.search(r"^\*\*Priority\*\*:\s*([P0-4])\b", block, re.MULTILINE)
        priority = priority_match.group(1) if priority_match else "P3"

        # Extract status
        status_match = re.search(r"^\*\*Status\*\*:\s*(.+)$", block, re.MULTILINE)
        status = status_match.group(1).strip() if status_match else "Unknown"

        # Extract owner
        owner_match = re.search(r"^\*\*Owner\*\*:\s*(.+)$", block, re.MULTILINE)
        owner = owner_match.group(1).strip() if owner_match else "Unassigned"

        # Extract target date
        target_match = re.search(r"^\*\*Target Completion\*\*:\s*(.+)$", block, re.MULTILINE)
        target_str = target_match.group(1).strip() if target_match else None
        target_date = parse_deadline_date(target_str) if target_str else None

        gaps.append({
            "repo": repo,
            "gap_id": gap_id,
            "title": title,
            "priority": priority,
            "owner": owner,
            "status": status,
            "target_date": target_date,
        })

    return gaps


def main():
    parser = argparse.ArgumentParser(description="Coordinate gap sync across repos")
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default="ruralpeds", help="Organization")
    parser.add_argument("--output", default="/tmp/gap-sync-index.json", help="Output JSON file")
    args = parser.parse_args()

    print(f"\n🔄 Gap Sync Coordinator\n")
    print(f"Organization: {args.org}")

    # Fetch repos
    print("Fetching repos...", end=" ", flush=True)
    repos = list_org_repos(args.org, args.token)
    print(f"✓ {len(repos)} repos")

    # Collect all gaps
    all_gaps = []
    repos_with_gaps = 0
    for i, repo in enumerate(repos, 1):
        repo_name = repo["name"]
        content = get_file_content(args.org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", args.token)
        if not content:
            continue

        gaps = extract_gaps_from_md(content, repo_name)
        if gaps:
            all_gaps.extend(gaps)
            repos_with_gaps += 1
            if i % 5 == 0:
                print(f"[{i}/{len(repos)}] {repo_name}: {len(gaps)} gaps")

    print(f"✓ Found {len(all_gaps)} total gaps in {repos_with_gaps} repos")

    # Build indexes
    by_date = defaultdict(list)  # deadline -> [gaps]
    by_owner = defaultdict(list)  # owner -> [gaps]
    unassigned_count = 0

    for gap in all_gaps:
        if gap["target_date"]:
            by_date[gap["target_date"]].append(gap)

        if gap["owner"].lower() in ("unassigned", "none", "[unassigned]"):
            unassigned_count += 1
        else:
            by_owner[gap["owner"]].append(gap)

    # Identify deadline collisions (convergence risks)
    collisions = []
    for date, gaps in sorted(by_date.items()):
        if len(gaps) >= 3:  # 3+ gaps due same day = collision risk
            collisions.append({
                "date": date,
                "gap_count": len(gaps),
                "gaps": [f"{g['gap_id']} ({g['repo']})" for g in gaps[:5]],
                "risk_level": "critical" if len(gaps) >= 5 else "high",
            })

    # Identify ownership issues
    ownership_metrics = {
        "unassigned_count": unassigned_count,
        "unassigned_pct": round(100 * unassigned_count / len(all_gaps), 1) if all_gaps else 0,
        "owners_count": len(by_owner),
        "avg_gaps_per_owner": round(len(all_gaps) / max(1, len(by_owner)), 1),
        "overloaded_owners": [
            {
                "owner": owner,
                "gap_count": len(gaps),
                "p0_count": sum(1 for g in gaps if g["priority"] == "P0"),
                "p1_count": sum(1 for g in gaps if g["priority"] == "P1"),
            }
            for owner, gaps in sorted(by_owner.items(), key=lambda x: len(x[1]), reverse=True)[:10]
        ],
    }

    # Build report
    report = {
        "timestamp": datetime.now().isoformat(),
        "organization": args.org,
        "summary": {
            "total_repos": len(repos),
            "repos_with_gaps": repos_with_gaps,
            "total_gaps": len(all_gaps),
            "p0_count": sum(1 for g in all_gaps if g["priority"] == "P0"),
            "p1_count": sum(1 for g in all_gaps if g["priority"] == "P1"),
            "deadline_collisions": len(collisions),
            "unassigned_gaps": unassigned_count,
        },
        "ownership": ownership_metrics,
        "deadline_collisions": collisions,
        "deadline_index": {
            date: [{"gap_id": g["gap_id"], "repo": g["repo"], "owner": g["owner"]}
                   for g in gaps]
            for date, gaps in sorted(by_date.items())
        },
    }

    # Write report
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(report, f, indent=2)

    # Print summary
    print(f"\n{'='*70}")
    print("SYNC COORDINATION SUMMARY")
    print(f"{'='*70}\n")
    print(f"Total gaps: {len(all_gaps)}")
    print(f"P0: {report['summary']['p0_count']} | P1: {report['summary']['p1_count']}")
    print(f"Unassigned: {unassigned_count} ({ownership_metrics['unassigned_pct']}%)")
    print(f"Deadline collisions: {len(collisions)}")

    if collisions:
        print(f"\n⚠️  DEADLINE CONVERGENCE RISKS:")
        for collision in collisions[:5]:
            print(f"  {collision['date']}: {collision['gap_count']} gaps ({collision['risk_level']})")
            for gap in collision['gaps'][:3]:
                print(f"    - {gap}")

    if ownership_metrics['overloaded_owners']:
        print(f"\n📊 OVERLOADED OWNERS:")
        for owner_info in ownership_metrics['overloaded_owners'][:5]:
            print(f"  {owner_info['owner']}: {owner_info['gap_count']} gaps "
                  f"(P0: {owner_info['p0_count']}, P1: {owner_info['p1_count']})")

    print(f"\n📄 Report saved to: {args.output}\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
