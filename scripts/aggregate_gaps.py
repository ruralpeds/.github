#!/usr/bin/env python3
"""
aggregate_gaps.py — Discover all repos, aggregate gap statistics across the org.

This script:
  1. Discovers all non-archived Rust/Julia repos in the org (via GitHub API)
  2. Reads .gap-analysis/GAP_ANALYSIS.md from each repo
  3. Parses gap statuses: Not Started, Backlog, In Progress, Blocked, In Review, Completed, Archived
  4. Counts gaps by status and priority (P0-P4)
  5. Generates JSON output with:
     - Overall stats (total gaps, completion %)
     - By repo breakdown
     - By status breakdown
     - By priority breakdown
     - P0 gaps (critical, needs immediate action)
  6. Exports to: org-dashboard-gaps.json

Usage:
    python scripts/aggregate_gaps.py \\
        --token ghp_... \\
        --org ruralpeds \\
        [--output org-dashboard-gaps.json]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, asdict
from collections import defaultdict

import requests


# Gap status enums
VALID_STATUSES = [
    "Not Started",
    "Backlog",
    "In Progress",
    "Blocked",
    "In Review",
    "Completed",
    "Archived",
]

VALID_PRIORITIES = ["P0", "P1", "P2", "P3", "P4"]

# Repos to skip
SKIP_REPOS = {
    ".github",
    "gap-analysis-standard",
    "gap-dashboard",
}

# Regex patterns for parsing GAP_ANALYSIS.md
GAP_HEADER_RE = re.compile(r"^### ✅?\s?(GAP-\d{3,4}):\s*(.+)$", re.MULTILINE)
STATUS_RE = re.compile(r"^\*\*Status\*\*:\s*(.+)$", re.MULTILINE)
PRIORITY_RE = re.compile(r"^\*\*Priority\*\*:\s*([P0-4])\b")
OWNER_RE = re.compile(r"^\*\*Owner\*\*:\s*(.+)$", re.MULTILINE)
TARGET_COMPLETION_RE = re.compile(r"^\*\*Target Completion\*\*:\s*(.+)$", re.MULTILINE)


@dataclass
class Gap:
    repo: str
    gap_id: str
    title: str
    status: str
    priority: str
    owner: str
    target_completion: str


@dataclass
class RepoStats:
    repo_name: str
    total_gaps: int
    completed: int
    completion_pct: float
    by_status: dict[str, int]
    by_priority: dict[str, int]
    p0_gaps: list[Gap]


@dataclass
class OrgStats:
    timestamp: str
    total_repos: int
    repos_with_gaps: int
    total_gaps: int
    completed_gaps: int
    completion_pct: float
    by_status: dict[str, int]
    by_priority: dict[str, int]
    by_repo: dict[str, dict]
    p0_gaps: list[dict]


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
    # Fetch raw content with auth headers for private repos
    headers = {"Authorization": f"Bearer {token}"}
    raw_r = requests.get(data["download_url"], headers=headers, timeout=30)
    raw_r.raise_for_status()
    return raw_r.text


def parse_gap_from_block(repo: str, block_text: str) -> Optional[Gap]:
    """Parse a single gap block from markdown."""
    # Extract header
    header_match = re.search(r"^### ✅?\s?(GAP-\d{3,4}):\s*(.+)$", block_text, re.MULTILINE)
    if not header_match:
        return None

    gap_id = header_match.group(1)
    title = header_match.group(2)

    # Extract status
    status_match = re.search(r"^\*\*Status\*\*:\s*(.+)$", block_text, re.MULTILINE)
    status = status_match.group(1).strip() if status_match else "Unknown"

    # Extract priority (format: **Priority**: P0 (Blocker) or similar)
    priority_match = re.search(r"^\*\*Priority\*\*:\s*([P0-4])\b", block_text, re.MULTILINE)
    priority = priority_match.group(1) if priority_match else "P3"

    # Extract owner
    owner_match = re.search(r"^\*\*Owner\*\*:\s*(.+)$", block_text, re.MULTILINE)
    owner = owner_match.group(1).strip() if owner_match else "Unassigned"

    # Extract target completion
    target_match = re.search(r"^\*\*Target Completion\*\*:\s*(.+)$", block_text, re.MULTILINE)
    target_completion = target_match.group(1).strip() if target_match else "TBD"

    return Gap(
        repo=repo,
        gap_id=gap_id,
        title=title,
        status=status,
        priority=priority,
        owner=owner,
        target_completion=target_completion,
    )


def parse_gaps_from_md(repo: str, content: str) -> list[Gap]:
    """Parse all gaps from GAP_ANALYSIS.md content."""
    gaps = []
    for match in re.finditer(r"^### ✅?\s?(GAP-\d{3,4}):\s*(.+?)(?=^### (?:✅\s)?GAP-|^## |^$)", content, re.MULTILINE | re.DOTALL):
        block_text = match.group(0)
        gap = parse_gap_from_block(repo, block_text)
        if gap:
            gaps.append(gap)

    return gaps


def compute_repo_stats(gaps: list[Gap]) -> RepoStats:
    """Compute statistics for a single repo."""
    if not gaps:
        return RepoStats(
            repo_name=gaps[0].repo if gaps else "unknown",
            total_gaps=0,
            completed=0,
            completion_pct=0.0,
            by_status={},
            by_priority={},
            p0_gaps=[],
        )

    repo_name = gaps[0].repo
    total_gaps = len(gaps)
    completed = sum(1 for g in gaps if g.status == "Completed")
    completion_pct = (completed / total_gaps * 100) if total_gaps > 0 else 0.0

    by_status = defaultdict(int)
    by_priority = defaultdict(int)
    p0_gaps = []

    for gap in gaps:
        by_status[gap.status] = by_status.get(gap.status, 0) + 1
        by_priority[gap.priority] = by_priority.get(gap.priority, 0) + 1
        if gap.priority == "P0":
            p0_gaps.append(gap)

    return RepoStats(
        repo_name=repo_name,
        total_gaps=total_gaps,
        completed=completed,
        completion_pct=round(completion_pct, 2),
        by_status=dict(by_status),
        by_priority=dict(by_priority),
        p0_gaps=p0_gaps,
    )


def aggregate_org_gaps(org: str, token: str) -> OrgStats:
    """Discover repos and aggregate gap statistics."""
    print(f"[{datetime.now().isoformat()}] Discovering repos in {org}...", file=sys.stderr)
    repos = list_org_repos(org, token)
    print(f"Found {len(repos)} repos", file=sys.stderr)

    all_gaps: list[Gap] = []
    by_repo: dict[str, dict] = {}
    repos_with_gaps = 0

    for repo in repos:
        repo_name = repo["name"]
        print(f"[{datetime.now().isoformat()}] Scanning {repo_name}...", file=sys.stderr)

        content = get_file_content(org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", token)
        if not content:
            print(f"  → No .gap-analysis/GAP_ANALYSIS.md", file=sys.stderr)
            continue

        gaps = parse_gaps_from_md(repo_name, content)
        if not gaps:
            print(f"  → No gaps found", file=sys.stderr)
            continue

        repos_with_gaps += 1
        print(f"  → {len(gaps)} gaps", file=sys.stderr)
        all_gaps.extend(gaps)

        stats = compute_repo_stats(gaps)
        by_repo[repo_name] = {
            "total_gaps": stats.total_gaps,
            "completed": stats.completed,
            "completion_pct": stats.completion_pct,
            "by_status": stats.by_status,
            "by_priority": stats.by_priority,
            "p0_count": len(stats.p0_gaps),
        }

    # Compute org-wide statistics
    total_gaps = len(all_gaps)
    completed_gaps = sum(1 for g in all_gaps if g.status == "Completed")
    completion_pct = (completed_gaps / total_gaps * 100) if total_gaps > 0 else 0.0

    by_status = defaultdict(int)
    by_priority = defaultdict(int)
    p0_gaps = []

    for gap in all_gaps:
        by_status[gap.status] = by_status.get(gap.status, 0) + 1
        by_priority[gap.priority] = by_priority.get(gap.priority, 0) + 1
        if gap.priority == "P0":
            p0_gaps.append(gap)

    return OrgStats(
        timestamp=datetime.now().isoformat(),
        total_repos=len(repos),
        repos_with_gaps=repos_with_gaps,
        total_gaps=total_gaps,
        completed_gaps=completed_gaps,
        completion_pct=round(completion_pct, 2),
        by_status=dict(by_status),
        by_priority=dict(by_priority),
        by_repo=by_repo,
        p0_gaps=[
            {
                "repo": g.repo,
                "gap_id": g.gap_id,
                "title": g.title,
                "owner": g.owner,
                "target_completion": g.target_completion,
                "status": g.status,
            }
            for g in sorted(p0_gaps, key=lambda g: (g.repo, g.gap_id))
        ],
    )


def main():
    parser = argparse.ArgumentParser(
        description="Aggregate gap statistics across all org repos"
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
        "--output",
        default="org-dashboard-gaps.json",
        help="Output file (default: org-dashboard-gaps.json)",
    )

    args = parser.parse_args()

    try:
        stats = aggregate_org_gaps(args.org, args.token)

        # Write output
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("w") as f:
            json.dump(asdict(stats), f, indent=2)

        print(f"[{datetime.now().isoformat()}] Results written to {output}", file=sys.stderr)
        print(json.dumps(asdict(stats), indent=2))

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
