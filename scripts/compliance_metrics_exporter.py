#!/usr/bin/env python3
"""
compliance_metrics_exporter.py

Extends compliance export with deadline-specific metrics.
Generates multiple export formats for compliance tracking.

Outputs:
- org-deadline-compliance.json (dashboards/reporting)
- deadline-tracking.csv (spreadsheet analysis)
- deadline-events.jsonl (append-only audit trail)

Usage:
    python3 scripts/compliance_metrics_exporter.py --token ghp_... --org ruralpeds --output-dir /tmp
"""

import argparse
import csv
import json
import re
import sys
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


def calculate_days_overdue(target_date: str) -> Optional[int]:
    """Calculate days overdue (negative if in future, positive if past)."""
    try:
        target = datetime.strptime(target_date, "%Y-%m-%d").date()
        today = datetime.now().date()
        return (today - target).days
    except:
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

        # Extract fields
        priority_match = re.search(r"^\*\*Priority\*\*:\s*([P0-4])\b", block, re.MULTILINE)
        priority = priority_match.group(1) if priority_match else "P3"

        status_match = re.search(r"^\*\*Status\*\*:\s*(.+)$", block, re.MULTILINE)
        status = status_match.group(1).strip() if status_match else "Unknown"

        owner_match = re.search(r"^\*\*Owner\*\*:\s*(.+)$", block, re.MULTILINE)
        owner = owner_match.group(1).strip() if owner_match else "Unassigned"

        target_match = re.search(r"^\*\*Target Completion\*\*:\s*(.+)$", block, re.MULTILINE)
        target_str = target_match.group(1).strip() if target_match else None
        target_date = parse_deadline_date(target_str) if target_str else None

        days_overdue = calculate_days_overdue(target_date) if target_date else None

        # Determine escalation level
        escalation = "info"
        if days_overdue is not None:
            if days_overdue >= 7:
                escalation = "severe"
            elif days_overdue >= 3:
                escalation = "critical"
            elif days_overdue > 0:
                escalation = "warning"
            elif -7 <= days_overdue < 0:
                escalation = "watch"

        gaps.append({
            "gap_id": gap_id,
            "repo": repo,
            "title": title,
            "priority": priority,
            "owner": owner,
            "status": status,
            "target_date": target_date,
            "days_overdue": days_overdue,
            "escalation_level": escalation,
        })

    return gaps


def main():
    parser = argparse.ArgumentParser(description="Export deadline compliance metrics")
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default="ruralpeds", help="Organization")
    parser.add_argument("--output-dir", default="/tmp", help="Output directory")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n📊 Compliance Metrics Exporter\n")
    print(f"Organization: {args.org}")

    # Fetch repos
    print("Fetching repos...", end=" ", flush=True)
    repos = list_org_repos(args.org, args.token)
    print(f"✓ {len(repos)} repos")

    # Collect all gaps
    all_gaps = []
    for i, repo in enumerate(repos, 1):
        repo_name = repo["name"]
        content = get_file_content(args.org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", args.token)
        if not content:
            continue

        gaps = extract_gaps_from_md(content, repo_name)
        all_gaps.extend(gaps)

    print(f"✓ Found {len(all_gaps)} total gaps")

    # JSON export (for dashboards)
    json_export = {
        "timestamp": datetime.now().isoformat(),
        "organization": args.org,
        "summary": {
            "total_gaps": len(all_gaps),
            "by_priority": {
                "P0": sum(1 for g in all_gaps if g["priority"] == "P0"),
                "P1": sum(1 for g in all_gaps if g["priority"] == "P1"),
                "P2": sum(1 for g in all_gaps if g["priority"] == "P2"),
                "P3": sum(1 for g in all_gaps if g["priority"] == "P3"),
                "P4": sum(1 for g in all_gaps if g["priority"] == "P4"),
            },
            "by_escalation": {
                "severe": sum(1 for g in all_gaps if g["escalation_level"] == "severe"),
                "critical": sum(1 for g in all_gaps if g["escalation_level"] == "critical"),
                "warning": sum(1 for g in all_gaps if g["escalation_level"] == "warning"),
                "watch": sum(1 for g in all_gaps if g["escalation_level"] == "watch"),
                "info": sum(1 for g in all_gaps if g["escalation_level"] == "info"),
            },
            "by_status": {
                "Not Started": sum(1 for g in all_gaps if "Not Started" in g["status"]),
                "In Progress": sum(1 for g in all_gaps if "In Progress" in g["status"]),
                "Completed": sum(1 for g in all_gaps if "Completed" in g["status"]),
                "Blocked": sum(1 for g in all_gaps if "Blocked" in g["status"]),
            },
        },
        "gaps": all_gaps,
    }

    json_path = output_dir / "org-deadline-compliance.json"
    with open(json_path, "w") as f:
        json.dump(json_export, f, indent=2)
    print(f"✓ JSON export: {json_path}")

    # CSV export (for spreadsheets)
    csv_path = output_dir / "deadline-tracking.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "gap_id", "repo", "title", "priority", "owner", "status",
            "target_date", "days_overdue", "escalation_level"
        ])
        writer.writeheader()
        writer.writerows(all_gaps)
    print(f"✓ CSV export: {csv_path}")

    # JSONL export (append-only audit trail)
    jsonl_path = output_dir / "deadline-events.jsonl"
    with open(jsonl_path, "a") as f:
        for gap in all_gaps:
            event = {
                "timestamp": datetime.now().isoformat(),
                "event_type": "gap_status_snapshot",
                **gap,
            }
            f.write(json.dumps(event) + "\n")
    print(f"✓ JSONL export: {jsonl_path}")

    # Print summary
    summary = json_export["summary"]
    print(f"\n{'='*70}")
    print("EXPORT SUMMARY")
    print(f"{'='*70}\n")
    print(f"Total gaps: {summary['total_gaps']}")
    print(f"By priority: P0={summary['by_priority']['P0']} P1={summary['by_priority']['P1']} "
          f"P2={summary['by_priority']['P2']} P3={summary['by_priority']['P3']} P4={summary['by_priority']['P4']}")
    print(f"Escalation: Severe={summary['by_escalation']['severe']} "
          f"Critical={summary['by_escalation']['critical']} "
          f"Warning={summary['by_escalation']['warning']}")
    print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
