#!/usr/bin/env python3
"""
compliance_export.py — Export gap data in multiple formats for compliance reporting.

This script:
  1. Reads all gap data (from aggregate_gaps.py output or live discovery)
  2. Reads audit trail from build-ledger.jsonl files
  3. Exports formats:
     - JSON: Full structured data with audit trail
     - CSV: Status report for spreadsheets
     - Markdown: Human-readable compliance report
  4. Includes:
     - Audit trail (from build-ledger.jsonl)
     - Gap ownership and target dates
     - Risk assessments (if available)
     - Compliance indicators

Usage:
    python scripts/compliance_export.py \\
        --token ghp_... \\
        --org ruralpeds \\
        [--formats json,csv,md] \\
        [--output-dir audit-log/]
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
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
PRIORITY_LABELS = {
    "P0": "Blocker (releases/compliance critical)",
    "P1": "Critical (1-3 months)",
    "P2": "High (scheduled, not immediate)",
    "P3": "Medium (nice to have)",
    "P4": "Low (exploratory/maintenance)",
}

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


def parse_gaps_from_md(repo: str, content: str) -> list[dict]:
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

        desc_match = re.search(r"^\*\*Description\*\*:\s*(.+?)(?=^## |\*\*Acceptance|$)", block_text, re.MULTILINE | re.DOTALL)
        description = desc_match.group(1).strip()[:200] if desc_match else ""

        gaps.append({
            "repo": repo,
            "gap_id": gap_id,
            "title": title,
            "status": status,
            "priority": priority,
            "owner": owner,
            "target_completion": target_completion,
            "description": description,
        })

    return gaps


def parse_ledger_events(content: str) -> list[dict]:
    """Parse build-ledger.jsonl."""
    events = []
    for line in content.strip().split("\n"):
        if not line.strip() or line.startswith("{\"$"):
            continue
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return events


def gather_compliance_data(org: str, token: str) -> dict:
    """Gather all gap and audit data."""
    print(f"[{datetime.now().isoformat()}] Discovering repos...", file=sys.stderr)
    repos = list_org_repos(org, token)
    print(f"Found {len(repos)} repos", file=sys.stderr)

    all_data = {
        "timestamp": datetime.now().isoformat(),
        "org": org,
        "repositories": {},
        "summary": {
            "total_repos": len(repos),
            "repos_with_gaps": 0,
            "total_gaps": 0,
            "by_priority": {},
            "by_status": {},
        },
    }

    for repo in repos:
        repo_name = repo["name"]
        print(f"[{datetime.now().isoformat()}] Processing {repo_name}...", file=sys.stderr)

        gap_content = get_file_content(org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", token)
        if not gap_content:
            continue

        gaps = parse_gaps_from_md(repo_name, gap_content)
        if not gaps:
            continue

        all_data["summary"]["repos_with_gaps"] += 1
        all_data["summary"]["total_gaps"] += len(gaps)

        # Parse ledger
        ledger_content = get_file_content(org, repo_name, ".gap-analysis/build-ledger.jsonl", token)
        events = parse_ledger_events(ledger_content) if ledger_content else []

        # Track priority and status counts
        for gap in gaps:
            priority = gap["priority"]
            status = gap["status"]
            all_data["summary"]["by_priority"][priority] = all_data["summary"]["by_priority"].get(priority, 0) + 1
            all_data["summary"]["by_status"][status] = all_data["summary"]["by_status"].get(status, 0) + 1

        all_data["repositories"][repo_name] = {
            "url": repo["html_url"],
            "gaps": gaps,
            "audit_events": events,
            "last_updated": repo["updated_at"],
        }

    return all_data


def export_json(data: dict, output_path: Path) -> None:
    """Export as JSON."""
    with output_path.open("w") as f:
        json.dump(data, f, indent=2)
    print(f"Exported JSON to {output_path}", file=sys.stderr)


def export_csv(data: dict, output_path: Path) -> None:
    """Export gaps as CSV for spreadsheet analysis."""
    with output_path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Repository",
            "Gap ID",
            "Title",
            "Status",
            "Priority",
            "Owner",
            "Target Completion",
            "Description",
        ])

        for repo_name, repo_data in data["repositories"].items():
            for gap in repo_data["gaps"]:
                writer.writerow([
                    repo_name,
                    gap["gap_id"],
                    gap["title"],
                    gap["status"],
                    gap["priority"],
                    gap["owner"],
                    gap["target_completion"],
                    gap["description"],
                ])

    print(f"Exported CSV to {output_path}", file=sys.stderr)


def export_markdown(data: dict, output_path: Path) -> None:
    """Export as human-readable compliance report."""
    lines = []
    lines.append("# Gap Analysis Compliance Report")
    lines.append("")
    lines.append(f"**Generated:** {data['timestamp']}")
    lines.append(f"**Organization:** {data['org']}")
    lines.append("")

    # Summary
    summary = data["summary"]
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- **Total Repositories:** {summary['total_repos']}")
    lines.append(f"- **Repos with Gap Analysis:** {summary['repos_with_gaps']}")
    lines.append(f"- **Total Gaps:** {summary['total_gaps']}")
    lines.append("")

    # By Priority
    if summary["by_priority"]:
        lines.append("### By Priority")
        lines.append("")
        for priority in ["P0", "P1", "P2", "P3", "P4"]:
            count = summary["by_priority"].get(priority, 0)
            label = PRIORITY_LABELS.get(priority, priority)
            lines.append(f"- **{priority}** ({label}): {count}")
        lines.append("")

    # By Status
    if summary["by_status"]:
        lines.append("### By Status")
        lines.append("")
        for status in VALID_STATUSES:
            count = summary["by_status"].get(status, 0)
            if count > 0:
                lines.append(f"- {status}: {count}")
        lines.append("")

    # P0 Critical Gaps
    p0_gaps = []
    for repo_name, repo_data in data["repositories"].items():
        for gap in repo_data["gaps"]:
            if gap["priority"] == "P0":
                p0_gaps.append((repo_name, gap))

    if p0_gaps:
        lines.append("## Critical P0 Gaps (Immediate Action Required)")
        lines.append("")
        for repo_name, gap in sorted(p0_gaps):
            lines.append(f"### {gap['gap_id']}: {gap['title']}")
            lines.append(f"**Repository:** `{repo_name}`")
            lines.append(f"**Status:** {gap['status']}")
            lines.append(f"**Owner:** {gap['owner']}")
            lines.append(f"**Target Completion:** {gap['target_completion']}")
            lines.append("")
            lines.append(f"{gap['description']}")
            lines.append("")

    # By Repository
    lines.append("## Repository Breakdown")
    lines.append("")
    for repo_name, repo_data in sorted(data["repositories"].items()):
        gaps = repo_data["gaps"]
        if gaps:
            p0_count = sum(1 for g in gaps if g["priority"] == "P0")
            p1_count = sum(1 for g in gaps if g["priority"] == "P1")
            completed = sum(1 for g in gaps if g["status"] == "Completed")
            lines.append(f"### {repo_name}")
            lines.append(f"- Total gaps: {len(gaps)}")
            lines.append(f"- Completed: {completed}")
            lines.append(f"- P0 (Critical): {p0_count}")
            lines.append(f"- P1 (High): {p1_count}")
            lines.append(f"- Last updated: {repo_data['last_updated']}")
            lines.append("")

    with output_path.open("w") as f:
        f.write("\n".join(lines))
    print(f"Exported Markdown to {output_path}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Export gap data for compliance reporting"
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
        "--formats",
        default="json,csv,md",
        help="Export formats: json,csv,md (default: json,csv,md)",
    )
    parser.add_argument(
        "--output-dir",
        default="audit-log",
        help="Output directory (default: audit-log)",
    )

    args = parser.parse_args()

    try:
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        print(f"[{datetime.now().isoformat()}] Gathering compliance data...", file=sys.stderr)
        data = gather_compliance_data(args.org, args.token)

        formats = set(args.formats.split(","))

        if "json" in formats:
            export_json(data, output_dir / "compliance-gaps.json")

        if "csv" in formats:
            export_csv(data, output_dir / "compliance-gaps.csv")

        if "md" in formats:
            export_markdown(data, output_dir / "compliance-report.md")

        print(f"[{datetime.now().isoformat()}] Done!", file=sys.stderr)

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
