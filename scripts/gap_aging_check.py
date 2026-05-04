#!/usr/bin/env python3
"""
gap_aging_check.py — Detect gaps that are aging beyond acceptable thresholds.

Identifies gaps that need attention based on:
  - Last Status Update > 30 days old
  - P0/P1 gaps in "In Progress" > 60 days
  - Gaps in "Blocked" status > 90 days without resolution

Outputs a report with aging gaps for downstream notification workflows.

Usage:
    gap_aging_check.py --repo PATH [--json-output PATH]

Environment:
    None required
"""

from __future__ import annotations

import argparse
import datetime
import json
import re
import sys
from dataclasses import dataclass, asdict
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


def parse_date(date_str: Optional[str]) -> Optional[datetime.date]:
    """Parse a date string (YYYY-MM-DD format)."""
    if not date_str:
        return None
    try:
        return datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


@dataclass
class AgingGap:
    gap_id: str
    gap_title: str
    status: Optional[str]
    priority: Optional[str]
    owner: Optional[str]
    aging_type: str  # "last_update_stale", "in_progress_long", "blocked_stale"
    days_since: int
    threshold_days: int
    message: str


@dataclass
class AgingReport:
    repo: str
    timestamp: str
    total_gaps: int
    aging_gaps: list[AgingGap]

    def to_dict(self) -> dict:
        return {
            "repo": self.repo,
            "timestamp": self.timestamp,
            "total_gaps": self.total_gaps,
            "aging_gaps": [asdict(g) for g in self.aging_gaps],
        }


def check_gap_aging(repo: Path) -> AgingReport:
    """
    Check for gaps that are aging beyond acceptable thresholds.

    Args:
        repo: Path to the repository root

    Returns:
        AgingReport with list of aging gaps
    """
    doc_path = repo / ".gap-analysis" / "GAP_ANALYSIS.md"

    if not doc_path.exists():
        return AgingReport(
            repo=str(repo),
            timestamp=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            total_gaps=0,
            aging_gaps=[],
        )

    doc_text = doc_path.read_text()
    gaps = parse_gaps(doc_text)

    # Filter to active gaps (not Completed or Archived)
    active_gaps = [g for g in gaps if g.status not in ("Completed", "Archived")]

    today = datetime.date.today()
    aging_gaps: list[AgingGap] = []

    for gap in active_gaps:
        # Check 1: Last Status Update > 30 days old
        if gap.last_status_update:
            last_update = parse_date(gap.last_status_update)
            if last_update:
                days_since = (today - last_update).days
                if days_since > 30:
                    aging_gaps.append(
                        AgingGap(
                            gap_id=gap.id,
                            gap_title=gap.title,
                            status=gap.status,
                            priority=gap.priority,
                            owner=gap.owner,
                            aging_type="last_update_stale",
                            days_since=days_since,
                            threshold_days=30,
                            message=f"Last status update was {days_since} days ago ({last_update})",
                        )
                    )

        # Check 2: P0/P1 gaps in "In Progress" > 60 days
        if gap.status == "In Progress" and gap.priority in ("P0", "P1"):
            if gap.last_status_update:
                last_update = parse_date(gap.last_status_update)
                if last_update:
                    days_since = (today - last_update).days
                    if days_since > 60:
                        aging_gaps.append(
                            AgingGap(
                                gap_id=gap.id,
                                gap_title=gap.title,
                                status=gap.status,
                                priority=gap.priority,
                                owner=gap.owner,
                                aging_type="in_progress_long",
                                days_since=days_since,
                                threshold_days=60,
                                message=f"{gap.priority} gap in progress for {days_since} days (since {last_update})",
                            )
                        )

        # Check 3: Gaps in "Blocked" status > 90 days
        if gap.status == "Blocked":
            if gap.last_status_update:
                last_update = parse_date(gap.last_status_update)
                if last_update:
                    days_since = (today - last_update).days
                    if days_since > 90:
                        aging_gaps.append(
                            AgingGap(
                                gap_id=gap.id,
                                gap_title=gap.title,
                                status=gap.status,
                                priority=gap.priority,
                                owner=gap.owner,
                                aging_type="blocked_stale",
                                days_since=days_since,
                                threshold_days=90,
                                message=f"Blocked for {days_since} days; needs attention (since {last_update})",
                            )
                        )

    return AgingReport(
        repo=str(repo),
        timestamp=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        total_gaps=len(active_gaps),
        aging_gaps=aging_gaps,
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Detect gaps aging beyond acceptable thresholds"
    )
    parser.add_argument("--repo", required=True, help="Path to repository root")
    parser.add_argument(
        "--json-output",
        help="Path to write JSON report (stdout if not specified)",
    )

    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not repo.exists():
        print(f"::error::Repository path does not exist: {repo}", file=sys.stderr)
        return 2

    report = check_gap_aging(repo)

    # Output audit report as JSON
    report_dict = report.to_dict()
    json_output = json.dumps(report_dict, indent=2)

    if args.json_output:
        Path(args.json_output).write_text(json_output)

    print(json_output)

    # Print summary to stderr for human readability
    print("\n" + "=" * 70, file=sys.stderr)
    print(f"Gap Aging Report", file=sys.stderr)
    print("=" * 70, file=sys.stderr)
    print(f"Repository: {repo}", file=sys.stderr)
    print(f"Total gaps: {report.total_gaps}", file=sys.stderr)
    print(f"Aging gaps: {len(report.aging_gaps)}", file=sys.stderr)

    if report.aging_gaps:
        print("\nAging Gaps:", file=sys.stderr)
        # Group by type
        by_type = {}
        for ag in report.aging_gaps:
            if ag.aging_type not in by_type:
                by_type[ag.aging_type] = []
            by_type[ag.aging_type].append(ag)

        for aging_type in ["last_update_stale", "in_progress_long", "blocked_stale"]:
            if aging_type in by_type:
                type_name = {
                    "last_update_stale": "Stale Status Updates",
                    "in_progress_long": "Long-Running In Progress",
                    "blocked_stale": "Long-Blocked Gaps",
                }[aging_type]
                print(f"\n  {type_name}:", file=sys.stderr)
                for ag in by_type[aging_type]:
                    print(f"    {ag.gap_id} ({ag.priority}): {ag.message}", file=sys.stderr)

    print("=" * 70, file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
