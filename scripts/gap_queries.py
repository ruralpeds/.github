#!/usr/bin/env python3
"""
gap_queries.py — Cross-repo gap analysis queries.

This script provides high-level queries on gap data:
  - Query: All P0 gaps across org
  - Query: Gaps blocking releases
  - Query: Oldest unresolved gaps
  - Query: Gaps by owner/team
  - Query: By priority and status
  - Outputs: JSON, formatted tables, markdown

Usage:
    python scripts/gap_queries.py \\
        --token ghp_... \\
        --org ruralpeds \\
        --query p0 \\
        [--format json|table|md]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
from collections import defaultdict
from dataclasses import dataclass

import requests


@dataclass
class GapRecord:
    repo: str
    gap_id: str
    title: str
    status: str
    priority: str
    owner: str
    target_completion: str
    blocked_by: str
    description: str


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


def list_org_repos(org: str, token: str) -> list[dict]:
    """List all non-archived repos in org."""
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
            if repo["name"] in SKIP_REPOS:
                continue
            repos.append(repo)

        page += 1
    return repos


def get_file_content(org: str, repo: str, path: str, token: str) -> Optional[str]:
    """Fetch raw file content from GitHub."""
    r = api("get", f"/repos/{org}/{repo}/contents/{path}", token)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    data = r.json()
    if isinstance(data, list):
        return None  # It's a directory
    # Fetch raw content
    raw_r = requests.get(data["download_url"], timeout=30)
    raw_r.raise_for_status()
    return raw_r.text


def parse_gaps_from_md(repo: str, content: str) -> list[GapRecord]:
    """Parse all gaps from GAP_ANALYSIS.md content."""
    gaps = []
    for match in re.finditer(
        r"^### ✅?\s?(GAP-\d{3,4}):\s*(.+?)(?=^### (?:✅\s)?GAP-|^## |$)",
        content,
        re.MULTILINE | re.DOTALL,
    ):
        block_text = match.group(0)
        gap_id = match.group(1)
        title = match.group(2)

        # Extract fields
        status_match = re.search(r"^\*\*Status\*\*:\s*(.+)$", block_text, re.MULTILINE)
        status = status_match.group(1).strip() if status_match else "Unknown"

        priority_match = re.search(r"^\*\*Priority\*\*:\s*\(([P0-4])\b", block_text)
        priority = priority_match.group(1) if priority_match else "P3"

        owner_match = re.search(r"^\*\*Owner\*\*:\s*(.+)$", block_text, re.MULTILINE)
        owner = owner_match.group(1).strip() if owner_match else "Unassigned"

        target_match = re.search(r"^\*\*Target Completion\*\*:\s*(.+)$", block_text, re.MULTILINE)
        target_completion = target_match.group(1).strip() if target_match else "TBD"

        blocked_by_match = re.search(r"^\*\*Blocked By\*\*:\s*(.+)$", block_text, re.MULTILINE)
        blocked_by = blocked_by_match.group(1).strip() if blocked_by_match else "None"

        desc_match = re.search(r"^\*\*Description\*\*:\s*(.+?)(?=^## |\*\*Acceptance|$)", block_text, re.MULTILINE | re.DOTALL)
        description = desc_match.group(1).strip()[:200] if desc_match else ""

        gaps.append(GapRecord(
            repo=repo,
            gap_id=gap_id,
            title=title,
            status=status,
            priority=priority,
            owner=owner,
            target_completion=target_completion,
            blocked_by=blocked_by,
            description=description,
        ))

    return gaps


def discover_all_gaps(org: str, token: str) -> list[GapRecord]:
    """Discover and parse gaps from all repos."""
    print(f"[{datetime.now().isoformat()}] Discovering repos...", file=sys.stderr)
    repos = list_org_repos(org, token)
    print(f"Found {len(repos)} repos", file=sys.stderr)

    all_gaps = []
    for repo in repos:
        repo_name = repo["name"]
        content = get_file_content(org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", token)
        if not content:
            continue

        gaps = parse_gaps_from_md(repo_name, content)
        if gaps:
            print(f"  {repo_name}: {len(gaps)} gaps", file=sys.stderr)
            all_gaps.extend(gaps)

    return all_gaps


def query_p0(gaps: list[GapRecord]) -> list[GapRecord]:
    """Query: All P0 gaps."""
    return [g for g in gaps if g.priority == "P0"]


def query_blocking_releases(gaps: list[GapRecord]) -> list[GapRecord]:
    """Query: Gaps marked as blocking releases (P0 + In Progress/Blocked)."""
    return [
        g for g in gaps
        if g.priority == "P0" and g.status in ["In Progress", "Blocked", "Backlog", "Not Started"]
    ]


def query_oldest_unresolved(gaps: list[GapRecord], limit: int = 10) -> list[GapRecord]:
    """Query: Oldest unresolved gaps (by target_completion date)."""
    unresolved = [g for g in gaps if g.status != "Completed" and g.status != "Archived"]
    # Sort by target_completion date
    try:
        return sorted(unresolved, key=lambda g: g.target_completion or "9999-12-31")[:limit]
    except:
        return unresolved[:limit]


def query_by_owner(gaps: list[GapRecord]) -> dict[str, list[GapRecord]]:
    """Query: Gaps grouped by owner."""
    by_owner = defaultdict(list)
    for gap in gaps:
        by_owner[gap.owner].append(gap)
    return dict(sorted(by_owner.items()))


def query_by_priority_and_status(gaps: list[GapRecord]) -> dict[str, dict[str, int]]:
    """Query: Gaps by priority and status."""
    result = {}
    for priority in ["P0", "P1", "P2", "P3", "P4"]:
        result[priority] = {}
        for status in ["Not Started", "Backlog", "In Progress", "Blocked", "In Review", "Completed", "Archived"]:
            count = sum(1 for g in gaps if g.priority == priority and g.status == status)
            if count > 0:
                result[priority][status] = count
    return result


def format_as_json(data) -> str:
    """Format output as JSON."""
    if isinstance(data, list):
        return json.dumps([
            {
                "repo": g.repo,
                "gap_id": g.gap_id,
                "title": g.title,
                "status": g.status,
                "priority": g.priority,
                "owner": g.owner,
                "target_completion": g.target_completion,
                "blocked_by": g.blocked_by,
            }
            for g in data
        ], indent=2)
    elif isinstance(data, dict):
        # Convert dataclass objects to dicts
        def convert(obj):
            if isinstance(obj, GapRecord):
                return {
                    "repo": obj.repo,
                    "gap_id": obj.gap_id,
                    "title": obj.title,
                    "status": obj.status,
                    "priority": obj.priority,
                    "owner": obj.owner,
                    "target_completion": obj.target_completion,
                    "blocked_by": obj.blocked_by,
                }
            elif isinstance(obj, dict):
                return {k: convert(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert(i) for i in obj]
            return obj

        return json.dumps(convert(data), indent=2)
    return json.dumps(data, indent=2)


def format_as_table(gaps: list[GapRecord]) -> str:
    """Format output as a table."""
    if not gaps:
        return "No results"

    # Calculate column widths
    headers = ["Repo", "Gap ID", "Status", "Priority", "Owner"]
    max_widths = {
        "repo": max(len("Repo"), max(len(g.repo) for g in gaps)) + 1,
        "gap_id": max(len("Gap ID"), max(len(g.gap_id) for g in gaps)) + 1,
        "status": max(len("Status"), max(len(g.status) for g in gaps)) + 1,
        "priority": max(len("Priority"), max(len(g.priority) for g in gaps)) + 1,
        "owner": max(len("Owner"), min(30, max(len(g.owner) for g in gaps))) + 1,
    }

    lines = []
    # Header
    lines.append(
        f"{headers[0]:<{max_widths['repo']}} | "
        f"{headers[1]:<{max_widths['gap_id']}} | "
        f"{headers[2]:<{max_widths['status']}} | "
        f"{headers[3]:<{max_widths['priority']}} | "
        f"{headers[4]:<{max_widths['owner']}}"
    )
    lines.append("-" * (sum(max_widths.values()) + 12))

    # Rows
    for gap in gaps:
        lines.append(
            f"{gap.repo:<{max_widths['repo']}} | "
            f"{gap.gap_id:<{max_widths['gap_id']}} | "
            f"{gap.status:<{max_widths['status']}} | "
            f"{gap.priority:<{max_widths['priority']}} | "
            f"{gap.owner[:30]:<{max_widths['owner']}}"
        )

    return "\n".join(lines)


def format_as_markdown(title: str, gaps: list[GapRecord]) -> str:
    """Format output as markdown."""
    lines = [f"# {title}", ""]

    if not gaps:
        lines.append("No results.")
        return "\n".join(lines)

    lines.append(f"**Found {len(gaps)} gaps**")
    lines.append("")
    lines.append("| Repo | Gap ID | Title | Status | Priority | Owner | Target |")
    lines.append("|---|---|---|---|---|---|---|")

    for gap in gaps:
        lines.append(
            f"| `{gap.repo}` | {gap.gap_id} | {gap.title[:40]}... | "
            f"{gap.status} | {gap.priority} | {gap.owner[:20]} | {gap.target_completion} |"
        )

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Query gap analysis across all repos"
    )
    parser.add_argument(
        "--token",
        required=True,
        help="GitHub API token (GH_TOKEN)",
    )
    parser.add_argument(
        "--org",
        default="ruralpeds",
        help="Organization name (default: ruralpeds)",
    )
    parser.add_argument(
        "--query",
        required=True,
        choices=["p0", "blocking-releases", "oldest", "by-owner", "by-priority-status"],
        help="Query type",
    )
    parser.add_argument(
        "--format",
        default="table",
        choices=["json", "table", "md"],
        help="Output format (default: table)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=10,
        help="Result limit for certain queries (default: 10)",
    )

    args = parser.parse_args()

    try:
        print(f"[{datetime.now().isoformat()}] Running query: {args.query}", file=sys.stderr)
        gaps = discover_all_gaps(args.org, args.token)
        print(f"[{datetime.now().isoformat()}] Discovered {len(gaps)} total gaps", file=sys.stderr)

        if args.query == "p0":
            results = query_p0(gaps)
            title = "P0 Critical Gaps"
        elif args.query == "blocking-releases":
            results = query_blocking_releases(gaps)
            title = "Gaps Blocking Releases"
        elif args.query == "oldest":
            results = query_oldest_unresolved(gaps, args.limit)
            title = f"Top {args.limit} Oldest Unresolved Gaps"
        elif args.query == "by-owner":
            results = query_by_owner(gaps)
            title = "Gaps by Owner"
        elif args.query == "by-priority-status":
            results = query_by_priority_and_status(gaps)
            title = "Gaps by Priority and Status"
        else:
            results = []
            title = "Query Results"

        # Format output
        if args.format == "json":
            output = format_as_json(results)
        elif args.format == "md":
            if isinstance(results, list):
                output = format_as_markdown(title, results)
            else:
                output = format_as_markdown(title, [])
        else:  # table
            if isinstance(results, list):
                output = format_as_table(results)
            else:
                output = json.dumps(results, indent=2)

        print(output)

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
