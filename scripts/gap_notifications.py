#!/usr/bin/env python3
"""
gap_notifications.py — Send notifications about gap-analysis events.

Sends Slack notifications for:
  - New P0/P1 gaps created
  - Gaps aging beyond thresholds
  - Release blockers detected
  - Teams assigned ownership

Can also send email notifications (optional) for:
  - Weekly gap status summaries
  - P0 alerts

GitHub issue comments are added when:
  - Gap status changes
  - New gap is created

Usage:
    gap_notifications.py --repo PATH --event EVENT [--target-channel CHANNEL]

Environment:
    SLACK_WEBHOOK_URL: Webhook URL for Slack notifications
    SLACK_MENTION_CHANNEL: (optional) Channel to use instead of env var
    EMAIL_LIST: (optional) Comma-separated emails for email notifications
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import sys
import urllib.request
import urllib.error
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class Gap:
    id: str
    title: str
    status: Optional[str] = None
    priority: Optional[str] = None
    owner: Optional[str] = None
    target_completion: Optional[str] = None
    description: str = ""
    related_prs: str = ""
    blocked_by: str = ""
    last_status_update: Optional[str] = None
    raw_block: str = ""
    block_start: int = 0
    block_end: int = 0


GAP_HEADER_RE = re.compile(r"^### (GAP-\d{3,4}):\s*(.+)$", re.MULTILINE)


def parse_gaps(doc_text: str) -> list[Gap]:
    """Parse all gap blocks out of GAP_ANALYSIS.md text."""
    gaps: list[Gap] = []
    headers = list(GAP_HEADER_RE.finditer(doc_text))
    if not headers:
        return gaps

    section_re = re.compile(r"^## [^#\n][^\n]*$", re.MULTILINE)
    section_offsets = [m.start() for m in section_re.finditer(doc_text)]

    for i, m in enumerate(headers):
        gap_id = m.group(1)
        title = m.group(2).strip()
        start = m.start()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(doc_text)

        for off in section_offsets:
            if start < off < end:
                end = off
                break

        block = doc_text[start:end]
        g = Gap(
            id=gap_id,
            title=title,
            raw_block=block,
            block_start=start,
            block_end=end,
        )

        def field(name: str) -> Optional[str]:
            m = re.search(
                rf"^\*\*{re.escape(name)}\*\*\s*:\s*(.+?)\s*$",
                block,
                re.MULTILINE,
            )
            if m:
                return m.group(1).strip()
            m = re.search(
                rf"^\*\*{re.escape(name)}:\*\*\s*(.+?)\s*$",
                block,
                re.MULTILINE,
            )
            return m.group(1).strip() if m else None

        g.status = field("Status")
        g.priority = field("Priority")
        g.owner = field("Owner")
        g.target_completion = field("Target Completion")
        g.related_prs = field("Related PRs") or ""
        g.blocked_by = field("Blocked By") or ""
        g.last_status_update = field("Last Status Update")

        gaps.append(g)

    return gaps


def send_slack_message(webhook_url: str, payload: dict) -> bool:
    """
    Send a Slack webhook message.

    Args:
        webhook_url: Slack webhook URL
        payload: Message payload dict

    Returns:
        True if successful, False otherwise
    """
    if not webhook_url:
        print("::warning::SLACK_WEBHOOK_URL not configured; skipping Slack notification", file=sys.stderr)
        return False

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            webhook_url,
            data=data,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                return True
    except Exception as e:
        print(f"::warning::Failed to send Slack message: {e}", file=sys.stderr)
        return False

    return False


def notify_new_p0_p1_gaps(repo: str, gaps: list[Gap], webhook_url: Optional[str] = None) -> bool:
    """Notify about newly created P0/P1 gaps."""
    p0_p1_gaps = [g for g in gaps if g.priority in ("P0", "P1") and g.status == "Not Started"]

    if not p0_p1_gaps:
        return True

    webhook_url = webhook_url or os.environ.get("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return False

    gap_blocks = []
    for gap in p0_p1_gaps:
        owner = gap.owner or "Unassigned"
        gap_blocks.append(
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{gap.id}: {gap.title}*\n"
                            f"Priority: {gap.priority} | Owner: {owner}\n"
                            f"Status: {gap.status}",
                },
            }
        )

    payload = {
        "text": f"New {gap.priority} gaps in {repo}",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f":warning: New {gap.priority} Gaps Detected",
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Repository:* {repo}",
                },
            },
        ] + gap_blocks + [
            {
                "type": "divider",
            },
        ],
    }

    return send_slack_message(webhook_url, payload)


def notify_aging_gaps(repo: str, aging_gaps: list[dict], webhook_url: Optional[str] = None) -> bool:
    """Notify about gaps aging beyond thresholds."""
    if not aging_gaps:
        return True

    webhook_url = webhook_url or os.environ.get("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return False

    gap_blocks = []
    for ag in aging_gaps:
        gap_blocks.append(
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{ag['gap_id']}*\n"
                            f"Type: {ag['aging_type']} | Days: {ag['days_since']} (threshold: {ag['threshold_days']})\n"
                            f"{ag['message']}",
                },
            }
        )

    payload = {
        "text": f"Aging gaps in {repo}",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": ":hourglass_flowing_sand: Gaps Aging Beyond Threshold",
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Repository:* {repo}",
                },
            },
        ] + gap_blocks + [
            {
                "type": "divider",
            },
        ],
    }

    return send_slack_message(webhook_url, payload)


def notify_release_blockers(repo: str, violations: list[dict], webhook_url: Optional[str] = None) -> bool:
    """Notify about release gate violations."""
    if not violations:
        return True

    webhook_url = webhook_url or os.environ.get("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return False

    violation_blocks = []
    for v in violations:
        violation_blocks.append(
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{v['gap_id']}*\n"
                            f"Type: {v['violation_type']}\n"
                            f"{v['message']}",
                },
            }
        )

    payload = {
        "text": f"Release blockers in {repo}",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": ":stop_sign: Release Gate Violations",
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Repository:* {repo}",
                },
            },
        ] + violation_blocks + [
            {
                "type": "divider",
            },
        ],
    }

    return send_slack_message(webhook_url, payload)


def notify_ownership_assigned(repo: str, gap: Gap, owner: str, webhook_url: Optional[str] = None) -> bool:
    """Notify when gap ownership is assigned."""
    webhook_url = webhook_url or os.environ.get("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return False

    payload = {
        "text": f"Ownership assigned in {repo}",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": ":raising_hand: Gap Ownership Assigned",
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Gap:* {gap.id}: {gap.title}\n"
                            f"*Owner:* {owner}\n"
                            f"*Repository:* {repo}",
                },
            },
            {
                "type": "divider",
            },
        ],
    }

    return send_slack_message(webhook_url, payload)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Send notifications about gap-analysis events"
    )
    parser.add_argument("--repo", required=True, help="Repository name or path")
    parser.add_argument(
        "--event",
        required=True,
        choices=["new_gaps", "aging_gaps", "release_blockers", "ownership_assigned"],
        help="Notification event type",
    )
    parser.add_argument("--gaps-file", help="Path to JSON file with gaps data")
    parser.add_argument("--aging-file", help="Path to JSON file with aging gaps data")
    parser.add_argument("--violations-file", help="Path to JSON file with violations")
    parser.add_argument("--gap-id", help="Gap ID (for ownership_assigned event)")
    parser.add_argument("--owner", help="Owner name (for ownership_assigned event)")
    parser.add_argument(
        "--target-channel",
        help="Slack channel override (e.g., #gap-analysis-alerts)",
    )
    parser.add_argument(
        "--slack-webhook",
        help="Slack webhook URL (falls back to SLACK_WEBHOOK_URL env)",
    )

    args = parser.parse_args()

    webhook_url = args.slack_webhook or os.environ.get("SLACK_WEBHOOK_URL")

    try:
        if args.event == "new_gaps":
            if not args.gaps_file:
                print("::error::--gaps-file required for new_gaps event", file=sys.stderr)
                return 2
            gaps_data = json.loads(Path(args.gaps_file).read_text())
            gaps = [
                Gap(
                    id=g["id"],
                    title=g["title"],
                    status=g.get("status"),
                    priority=g.get("priority"),
                    owner=g.get("owner"),
                )
                for g in gaps_data
            ]
            return 0 if notify_new_p0_p1_gaps(args.repo, gaps, webhook_url) else 1

        elif args.event == "aging_gaps":
            if not args.aging_file:
                print("::error::--aging-file required for aging_gaps event", file=sys.stderr)
                return 2
            aging_data = json.loads(Path(args.aging_file).read_text())
            return 0 if notify_aging_gaps(args.repo, aging_data.get("aging_gaps", []), webhook_url) else 1

        elif args.event == "release_blockers":
            if not args.violations_file:
                print("::error::--violations-file required for release_blockers event", file=sys.stderr)
                return 2
            violations_data = json.loads(Path(args.violations_file).read_text())
            return 0 if notify_release_blockers(args.repo, violations_data.get("violations", []), webhook_url) else 1

        elif args.event == "ownership_assigned":
            if not args.gap_id or not args.owner:
                print("::error::--gap-id and --owner required for ownership_assigned event", file=sys.stderr)
                return 2
            gap = Gap(id=args.gap_id, title="<Title>")
            return 0 if notify_ownership_assigned(args.repo, gap, args.owner, webhook_url) else 1

    except Exception as e:
        print(f"::error::Notification failed: {e}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
