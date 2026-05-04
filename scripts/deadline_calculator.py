#!/usr/bin/env python3
"""
deadline_calculator.py

Analyzes P0/P1 gap deadlines across the organization.
- Parses target completion dates from GAP_ANALYSIS.md files
- Calculates deadline urgency and overdue status
- Generates deadline metrics and risk rankings
- Outputs JSON report for dashboards and notifications

Usage:
    python3 scripts/deadline_calculator.py --token ghp_... --org ruralpeds --output deadlines.json
"""

import argparse
import json
import re
import sys
from datetime import datetime, timedelta
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


def parse_deadline_date(date_str: str) -> Optional[datetime]:
    """Parse various date formats."""
    if not date_str or date_str.upper() in ("TBD", "NONE", "N/A"):
        return None

    formats = [
        "%Y-%m-%d",
        "%m/%d/%Y",
        "%b %d, %Y",
        "%B %d, %Y",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue

    return None


def calculate_deadline_urgency(gap_id: str, priority: str, target_date: Optional[datetime]) -> dict:
    """Calculate deadline urgency metrics."""
    if not target_date:
        return {
            "gap_id": gap_id,
            "priority": priority,
            "target_date": None,
            "days_to_deadline": None,
            "overdue_days": None,
            "status": "No deadline set",
            "urgency_level": "info",
            "risk_score": 0.0,
        }

    today = datetime.now().date()
    target = target_date.date() if isinstance(target_date, datetime) else target_date
    days_to = (target - today).days

    # Determine urgency level
    if days_to < 0:
        urgency = "critical"
        risk_score = min(1.0, 0.8 + (abs(days_to) / 30.0) * 0.2)
        status = f"OVERDUE by {abs(days_to)} days"
    elif days_to == 0:
        urgency = "critical"
        risk_score = 0.95
        status = "DUE TODAY"
    elif days_to <= 3:
        urgency = "critical"
        risk_score = 0.9
        status = f"Due in {days_to} days"
    elif days_to <= 7:
        urgency = "high"
        risk_score = 0.7
        status = f"Due in {days_to} days"
    elif days_to <= 14:
        urgency = "medium"
        risk_score = 0.4
        status = f"Due in {days_to} days"
    else:
        urgency = "low"
        risk_score = 0.1
        status = f"Due in {days_to} days"

    # Increase risk for P0 gaps
    if priority == "P0":
        risk_score = min(1.0, risk_score + 0.1)

    return {
        "gap_id": gap_id,
        "priority": priority,
        "target_date": target.isoformat(),
        "days_to_deadline": days_to,
        "overdue_days": abs(days_to) if days_to < 0 else None,
        "status": status,
        "urgency_level": urgency,
        "risk_score": round(risk_score, 2),
    }


def extract_gaps_from_md(content: str, repo: str) -> list[dict]:
    """Extract P0/P1 gaps with deadlines from GAP_ANALYSIS.md."""
    gaps = []

    for match in re.finditer(
        r"^### ✅?\s?(GAP-\d{3,4}):\s*(.+?)(?=^### (?:✅\s)?GAP-|^## |^$)",
        content,
        re.MULTILINE | re.DOTALL
    ):
        block = match.group(0)
        gap_id = match.group(1)
        title = match.group(2)

        # Extract priority
        priority_match = re.search(r"^\*\*Priority\*\*:\s*([P0-4])\b", block, re.MULTILINE)
        priority = priority_match.group(1) if priority_match else "P3"

        # Only track P0/P1
        if priority not in ("P0", "P1"):
            continue

        # Extract target completion date
        target_match = re.search(r"^\*\*Target Completion\*\*:\s*(.+)$", block, re.MULTILINE)
        target_str = target_match.group(1).strip() if target_match else None
        target_date = parse_deadline_date(target_str) if target_str else None

        # Extract owner
        owner_match = re.search(r"^\*\*Owner\*\*:\s*(.+)$", block, re.MULTILINE)
        owner = owner_match.group(1).strip() if owner_match else "Unassigned"

        # Extract status
        status_match = re.search(r"^\*\*Status\*\*:\s*(.+)$", block, re.MULTILINE)
        status = status_match.group(1).strip() if status_match else "Unknown"

        urgency = calculate_deadline_urgency(gap_id, priority, target_date)

        gaps.append({
            "repo": repo,
            "gap_id": gap_id,
            "title": title.strip(),
            "priority": priority,
            "owner": owner,
            "status": status,
            "target_date": target_str,
            "parsed_target_date": target_date.isoformat() if target_date else None,
            **urgency,
        })

    return gaps


def main():
    parser = argparse.ArgumentParser(description="Calculate deadline urgency for P0/P1 gaps")
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default="ruralpeds", help="Organization")
    parser.add_argument("--output", default="/tmp/deadline-metrics.json", help="Output JSON file")
    args = parser.parse_args()

    print(f"\n📅 Gap Deadline Calculator\n")
    print(f"Organization: {args.org}")

    # Fetch repos
    print("Fetching repos...", end=" ", flush=True)
    repos = list_org_repos(args.org, args.token)
    print(f"✓ {len(repos)} repos")

    # Collect all deadlines
    all_gaps = []
    for i, repo in enumerate(repos, 1):
        repo_name = repo["name"]
        content = get_file_content(args.org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", args.token)
        if not content:
            continue

        gaps = extract_gaps_from_md(content, repo_name)
        all_gaps.extend(gaps)
        if gaps:
            print(f"[{i}/{len(repos)}] {repo_name}: {len(gaps)} P0/P1 gaps")

    # Sort by urgency (risk score descending)
    all_gaps.sort(key=lambda g: (g["risk_score"], g["days_to_deadline"] or 999), reverse=True)

    # Summary statistics
    critical = sum(1 for g in all_gaps if g["urgency_level"] == "critical")
    overdue = sum(1 for g in all_gaps if g["overdue_days"] is not None)

    report = {
        "timestamp": datetime.now().isoformat(),
        "organization": args.org,
        "summary": {
            "total_p0_p1_gaps": len(all_gaps),
            "critical_urgency": critical,
            "overdue_gaps": overdue,
            "days_to_highest_deadline": min((g["days_to_deadline"] for g in all_gaps if g["days_to_deadline"] is not None), default=None),
        },
        "deadlines": all_gaps,
    }

    # Write report
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n{'='*70}")
    print("DEADLINE SUMMARY")
    print(f"{'='*70}\n")
    print(f"Total P0/P1 gaps: {len(all_gaps)}")
    print(f"Critical urgency: {critical}")
    print(f"Overdue gaps: {overdue}")

    if overdue > 0:
        print(f"\n⚠️  OVERDUE GAPS (immediate action required):")
        for gap in [g for g in all_gaps if g["overdue_days"] is not None]:
            print(f"  - {gap['gap_id']} ({gap['repo']}): {gap['overdue_days']} days overdue")

    print(f"\n📄 Report saved to: {args.output}\n")

    return 0 if overdue == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
