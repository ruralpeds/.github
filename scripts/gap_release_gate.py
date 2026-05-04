#!/usr/bin/env python3
"""
gap_release_gate.py — Release gate enforcement for gap-analysis compliance.

Checks a repository's gap-analysis status before allowing a release to proceed.
Enforces policies:
  - P0 gaps: ZERO allowed (hard block)
  - P1 gaps: Must have completion date <= 30 days from now
  - All gaps: Must have owner assigned
  - All gaps: Must not be in "Blocked" status

Outputs JSON audit log for downstream CI/release workflows.
Can be overridden with explicit approval (approval flag + audit trail).

Usage:
    gap_release_gate.py --repo PATH --tag TAG [--force-approval REASON]

Environment:
    GITHUB_ACTOR: Actor making the release (for audit trail)
    GITHUB_SHA: Commit SHA being released (for audit trail)
"""

from __future__ import annotations

import argparse
import datetime
import json
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional
import re


# Reuse the Gap data class from gap_lifecycle.py
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
VALID_PRIORITIES = ["P0", "P1", "P2", "P3", "P4"]


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


def utc_now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def utc_today_iso() -> str:
    return datetime.date.today().isoformat()


@dataclass
class ReleaseGateViolation:
    gap_id: str
    gap_title: str
    violation_type: str  # "p0_blocked", "p1_overdue", "unassigned", "blocked_status"
    message: str
    severity: str  # "error" or "warning"


@dataclass
class ReleaseGateReport:
    repo: str
    tag: str
    passed: bool
    timestamp: str
    total_gaps: int
    violations: list[ReleaseGateViolation]
    force_approved: bool
    approval_reason: Optional[str]
    actor: Optional[str]
    sha: Optional[str]

    def to_dict(self) -> dict:
        return {
            "repo": self.repo,
            "tag": self.tag,
            "passed": self.passed,
            "timestamp": self.timestamp,
            "total_gaps": self.total_gaps,
            "violations": [asdict(v) for v in self.violations],
            "force_approved": self.force_approved,
            "approval_reason": self.approval_reason,
            "actor": self.actor,
            "sha": self.sha,
        }


def parse_target_date(date_str: Optional[str]) -> Optional[datetime.date]:
    """Parse a target completion date string (YYYY-MM-DD format)."""
    if not date_str or date_str.lower() in ("unassigned", "none", "tbd"):
        return None
    try:
        return datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


def check_release_gate(repo: Path, tag: str, force_approval: bool = False, approval_reason: Optional[str] = None) -> ReleaseGateReport:
    """
    Check gap-analysis compliance for a release.

    Args:
        repo: Path to the repository root
        tag: Release tag (for reporting)
        force_approval: If True, bypass gate checks but mark as approved
        approval_reason: Reason for force approval

    Returns:
        ReleaseGateReport with pass/fail status and violations
    """
    doc_path = repo / ".gap-analysis" / "GAP_ANALYSIS.md"

    if not doc_path.exists():
        # No gap analysis — allow release
        return ReleaseGateReport(
            repo=str(repo),
            tag=tag,
            passed=True,
            timestamp=utc_now_iso(),
            total_gaps=0,
            violations=[],
            force_approved=False,
            approval_reason=None,
            actor=None,
            sha=None,
        )

    doc_text = doc_path.read_text()
    gaps = parse_gaps(doc_text)

    # Filter to active gaps (not Completed or Archived)
    active_gaps = [g for g in gaps if g.status not in ("Completed", "Archived")]

    violations: list[ReleaseGateViolation] = []
    today = datetime.date.today()

    for gap in active_gaps:
        # Rule 1: P0 gaps are hard blockers
        if gap.priority == "P0":
            violations.append(
                ReleaseGateViolation(
                    gap_id=gap.id,
                    gap_title=gap.title,
                    violation_type="p0_blocked",
                    message=f"P0 gap {gap.id} is still open (status: {gap.status}); releases are blocked",
                    severity="error",
                )
            )

        # Rule 2: P1 gaps must have completion date <= 30 days from now
        if gap.priority == "P1":
            target = parse_target_date(gap.target_completion)
            if target is None:
                violations.append(
                    ReleaseGateViolation(
                        gap_id=gap.id,
                        gap_title=gap.title,
                        violation_type="p1_overdue",
                        message=f"P1 gap {gap.id} has no target completion date",
                        severity="error",
                    )
                )
            elif target < today:
                violations.append(
                    ReleaseGateViolation(
                        gap_id=gap.id,
                        gap_title=gap.title,
                        violation_type="p1_overdue",
                        message=f"P1 gap {gap.id} target completion date ({target}) is in the past",
                        severity="error",
                    )
                )
            elif (target - today).days > 30:
                violations.append(
                    ReleaseGateViolation(
                        gap_id=gap.id,
                        gap_title=gap.title,
                        violation_type="p1_overdue",
                        message=f"P1 gap {gap.id} target completion date ({target}) is > 30 days away",
                        severity="error",
                    )
                )

        # Rule 3: All gaps must have owner assigned
        if not gap.owner or gap.owner.lower() in ("unassigned", "none", "tbd"):
            violations.append(
                ReleaseGateViolation(
                    gap_id=gap.id,
                    gap_title=gap.title,
                    violation_type="unassigned",
                    message=f"Gap {gap.id} has no owner assigned",
                    severity="error",
                )
            )

        # Rule 4: Gaps must not be "Blocked" without resolution plan
        if gap.status == "Blocked":
            violations.append(
                ReleaseGateViolation(
                    gap_id=gap.id,
                    gap_title=gap.title,
                    violation_type="blocked_status",
                    message=f"Gap {gap.id} is in 'Blocked' status; must be resolved or moved to another status",
                    severity="error",
                )
            )

    passed = len(violations) == 0 or force_approval

    return ReleaseGateReport(
        repo=str(repo),
        tag=tag,
        passed=passed,
        timestamp=utc_now_iso(),
        total_gaps=len(active_gaps),
        violations=violations,
        force_approved=force_approval,
        approval_reason=approval_reason,
        actor=None,  # will be set from env
        sha=None,    # will be set from env
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Release gate enforcement for gap-analysis compliance"
    )
    parser.add_argument("--repo", required=True, help="Path to repository root")
    parser.add_argument("--tag", required=True, help="Release tag")
    parser.add_argument(
        "--force-approval",
        action="store_true",
        help="Force approval of gate (must include approval reason)",
    )
    parser.add_argument(
        "--approval-reason",
        help="Reason for force approval (required if --force-approval is set)",
    )
    parser.add_argument(
        "--json-output",
        help="Path to write JSON audit report (stdout if not specified)",
    )

    args = parser.parse_args()

    if args.force_approval and not args.approval_reason:
        print("::error::--force-approval requires --approval-reason", file=sys.stderr)
        return 2

    repo = Path(args.repo).resolve()
    if not repo.exists():
        print(f"::error::Repository path does not exist: {repo}", file=sys.stderr)
        return 2

    report = check_release_gate(
        repo=repo,
        tag=args.tag,
        force_approval=args.force_approval,
        approval_reason=args.approval_reason,
    )

    # Fill in actor and SHA from environment
    report.actor = os.environ.get("GITHUB_ACTOR")
    report.sha = os.environ.get("GITHUB_SHA")

    # Output audit report as JSON
    report_dict = report.to_dict()
    json_output = json.dumps(report_dict, indent=2)

    if args.json_output:
        Path(args.json_output).write_text(json_output)

    print(json_output)

    # Print summary to stdout for human readability
    print("\n" + "=" * 70, file=sys.stderr)
    print(f"Release Gate Check: {report.tag}", file=sys.stderr)
    print("=" * 70, file=sys.stderr)
    print(f"Repository: {repo}", file=sys.stderr)
    print(f"Total gaps: {report.total_gaps}", file=sys.stderr)
    print(f"Violations: {len(report.violations)}", file=sys.stderr)

    if report.violations:
        print("\nViolations:", file=sys.stderr)
        for v in report.violations:
            print(f"  [{v.severity.upper()}] {v.gap_id}: {v.message}", file=sys.stderr)

    if report.force_approved:
        print(f"\n::warning::Gate BYPASSED by force approval", file=sys.stderr)
        if report.approval_reason:
            print(f"Reason: {report.approval_reason}", file=sys.stderr)

    print("=" * 70, file=sys.stderr)

    # Exit code: 0 if passed, 1 if failed (unless force-approved)
    if report.passed:
        print("✓ Release gate PASSED", file=sys.stderr)
        return 0
    else:
        print("✗ Release gate FAILED", file=sys.stderr)
        return 1


if __name__ == "__main__":
    import os
    sys.exit(main())
