#!/usr/bin/env python3
"""
breach_escalation_handler.py

Determines escalation level based on overdue days and ownership history.
Generates escalation recommendations and creates notification templates.

Usage:
    python3 scripts/breach_escalation_handler.py --token ghp_... --org ruralpeds
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

        gaps.append({
            "gap_id": gap_id,
            "repo": repo,
            "title": title,
            "priority": priority,
            "owner": owner,
            "status": status,
            "target_date": target_date,
            "days_overdue": days_overdue,
        })

    return gaps


def calculate_days_overdue(target_date: str) -> Optional[int]:
    """Calculate days overdue (negative if in future, positive if past)."""
    try:
        target = datetime.strptime(target_date, "%Y-%m-%d").date()
        today = datetime.now().date()
        return (today - target).days
    except:
        return None


def determine_escalation_level(gap: dict, breach_history: dict) -> dict:
    """Determine escalation level and recommendations."""
    days_overdue = gap.get("days_overdue") or 0
    priority = gap["priority"]
    owner = gap["owner"]
    gap_id = gap["gap_id"]

    # Base escalation level by overdue days
    if days_overdue >= 14:
        base_level = "critical"
    elif days_overdue >= 7:
        base_level = "severe"
    elif days_overdue >= 3:
        base_level = "high"
    elif days_overdue > 0:
        base_level = "medium"
    else:
        base_level = "watch"

    # Escalation modifier based on priority
    if priority == "P0":
        escalation_multiplier = 1.5  # P0 escalates faster
    elif priority == "P1":
        escalation_multiplier = 1.2
    else:
        escalation_multiplier = 1.0

    # Check ownership history (repeated breaches)
    owner_breach_count = breach_history.get(owner, {}).get("breach_count", 0)
    status_stale_days = breach_history.get(owner, {}).get("avg_days_since_update", 0)

    # If owner has repeated breaches, escalate further
    if owner_breach_count >= 3:
        escalation_multiplier *= 1.5
    elif owner_breach_count >= 2:
        escalation_multiplier *= 1.2

    # If status hasn't been updated recently, escalate
    if status_stale_days > 14:
        escalation_multiplier *= 1.2

    # Calculate final escalation level
    levels = ["watch", "medium", "high", "severe", "critical"]
    base_index = levels.index(base_level)
    final_index = min(len(levels) - 1, int(base_index * escalation_multiplier))
    final_level = levels[final_index]

    # Generate recommendations
    recommendations = []
    if days_overdue > 0:
        recommendations.append(f"Gap is {days_overdue} days overdue")
    if priority == "P0":
        recommendations.append("P0 gaps block releases — escalate immediately")
    elif priority == "P1":
        recommendations.append("P1 gaps require action within 2 business days")
    if owner_breach_count >= 2:
        recommendations.append(f"Owner {owner} has {owner_breach_count} previous breaches — escalate to manager")
    if status_stale_days > 7:
        recommendations.append(f"No status update in {status_stale_days} days — check if work stalled")

    return {
        "gap_id": gap_id,
        "escalation_level": final_level,
        "base_level": base_level,
        "multiplier": escalation_multiplier,
        "days_overdue": days_overdue,
        "priority": priority,
        "owner": owner,
        "recommendations": recommendations,
    }


def generate_escalation_message(escalation: dict, slack: bool = False) -> dict:
    """Generate escalation notification template."""
    gap_id = escalation["gap_id"]
    level = escalation["escalation_level"]
    days = escalation["days_overdue"]
    priority = escalation["priority"]
    owner = escalation["owner"]
    recommendations = escalation["recommendations"]

    # Level emoji and color
    level_config = {
        "critical": {"emoji": "🚨", "color": "#FF0000", "text": "CRITICAL ESCALATION"},
        "severe": {"emoji": "🔴", "color": "#FF6600", "text": "SEVERE ESCALATION"},
        "high": {"emoji": "🟠", "color": "#FFAA00", "text": "HIGH PRIORITY"},
        "medium": {"emoji": "🟡", "color": "#FFFF00", "text": "MEDIUM ESCALATION"},
        "watch": {"emoji": "🔵", "color": "#0099FF", "text": "WATCH"},
    }

    config = level_config.get(level, level_config["medium"])

    if slack:
        # Slack message template
        return {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{config['emoji']} *{config['text']}* — {gap_id}\n"
                        f"*Priority:* {priority} | *Overdue:* {days} days\n"
                        f"*Owner:* @{owner}\n"
                        f"*Recommendations:*\n" +
                        "\n".join(f"• {rec}" for rec in recommendations)
            }
        }
    else:
        # GitHub issue template
        return {
            "title": f"{config['emoji']} {level.upper()}: {gap_id} — {days} days overdue",
            "priority": priority,
            "level": level,
            "owner": owner,
            "body": f"""## Escalation Notice

**Gap:** {gap_id}
**Priority:** {priority}
**Escalation Level:** {config['text']}
**Overdue:** {days} days
**Owner:** @{owner}

## Recommendations

{chr(10).join(f'- {rec}' for rec in recommendations)}

## Action Required

This gap requires immediate attention. Please:
1. Update the status in your repo's GAP_ANALYSIS.md
2. Confirm target completion date
3. Provide progress update or escalate to your manager

---
*Automated escalation from breach_escalation_handler.py*
""",
        }


def main():
    parser = argparse.ArgumentParser(description="Handle gap deadline breach escalations")
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default="ruralpeds", help="Organization")
    parser.add_argument("--output-dir", default="/tmp", help="Output directory")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n🚨 Breach Escalation Handler\n")
    print(f"Organization: {args.org}")

    # Fetch repos
    print("Fetching repos...", end=" ", flush=True)
    repos = list_org_repos(args.org, args.token)
    print(f"✓ {len(repos)} repos")

    # Collect all gaps and identify breaches
    all_gaps = []
    for i, repo in enumerate(repos, 1):
        repo_name = repo["name"]
        content = get_file_content(args.org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", args.token)
        if not content:
            continue

        gaps = extract_gaps_from_md(content, repo_name)
        all_gaps.extend(gaps)

    print(f"✓ Found {len(all_gaps)} total gaps")

    # Filter to breaches only (overdue gaps)
    breaches = [g for g in all_gaps if g.get("days_overdue") and g["days_overdue"] > 0]
    print(f"✓ Identified {len(breaches)} overdue gaps")

    # Build ownership history (mock for now - in real use would query historical data)
    breach_history = {}
    for gap in breaches:
        owner = gap["owner"]
        if owner not in breach_history:
            breach_history[owner] = {"breach_count": 0, "avg_days_since_update": 0}
        breach_history[owner]["breach_count"] += 1
        breach_history[owner]["avg_days_since_update"] = max(
            breach_history[owner]["avg_days_since_update"],
            gap.get("days_overdue", 0)
        )

    # Determine escalations
    escalations = []
    for breach in breaches:
        escalation = determine_escalation_level(breach, breach_history)
        escalations.append(escalation)

    # Sort by severity
    severity_rank = {"critical": 0, "severe": 1, "high": 2, "medium": 3, "watch": 4}
    escalations.sort(key=lambda x: severity_rank.get(x["escalation_level"], 5))

    # Generate templates
    slack_templates = []
    github_templates = []
    for escalation in escalations[:10]:  # Top 10 by severity
        slack_templates.append(generate_escalation_message(escalation, slack=True))
        github_templates.append(generate_escalation_message(escalation, slack=False))

    # Save escalation report
    report = {
        "timestamp": datetime.now().isoformat(),
        "organization": args.org,
        "summary": {
            "total_gaps": len(all_gaps),
            "overdue_gaps": len(breaches),
            "critical_escalations": sum(1 for e in escalations if e["escalation_level"] == "critical"),
            "severe_escalations": sum(1 for e in escalations if e["escalation_level"] == "severe"),
            "high_escalations": sum(1 for e in escalations if e["escalation_level"] == "high"),
        },
        "escalations": escalations,
        "slack_templates": slack_templates,
        "github_templates": github_templates,
    }

    report_path = output_dir / "escalation-report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"✓ Escalation report: {report_path}")

    # Print summary
    summary = report["summary"]
    print(f"\n{'='*70}")
    print("ESCALATION SUMMARY")
    print(f"{'='*70}\n")
    print(f"Total gaps: {summary['total_gaps']}")
    print(f"Overdue: {summary['overdue_gaps']}")
    print(f"Critical: {summary['critical_escalations']} | Severe: {summary['severe_escalations']} | "
          f"High: {summary['high_escalations']}")

    if escalations:
        print(f"\n🚨 TOP ESCALATIONS:")
        for e in escalations[:5]:
            print(f"  {e['escalation_level'].upper()}: {e['gap_id']} ({e['priority']}) "
                  f"— {e['days_overdue']} days overdue, owner: {e['owner']}")

    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
