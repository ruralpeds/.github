#!/usr/bin/env python3
"""
gap_lifecycle.py — Single CLI for all gap-analysis lifecycle operations.

This module is the source of truth for parsing and mutating
.gap-analysis/GAP_ANALYSIS.md, appending to .gap-analysis/build-ledger.jsonl,
and regenerating .gap-analysis/status.json. The org-level reusable workflow
(reusable-gap-analysis.yml) is its only caller in CI; humans can also invoke
it locally for the same effect.

Invariants:
  - GAP_ANALYSIS.md is the human-facing doc; this script mutates only the
    Status, status-update bullet, and Related PRs / Last Status Update fields
    on existing gaps. It does NOT add or rename gap headers.
  - build-ledger.jsonl is append-only. We never rewrite history; we only
    append new lines.
  - status.json is fully regenerated from GAP_ANALYSIS.md every run.

Subcommands:
    extract-id    --branch BRANCH | --pr-title TITLE | --pr-body BODY
    advance       --repo PATH --gap GAP-NNN --to STATUS --trigger TRIGGER [--branch X --actor X --sha X]
    link-pr       --repo PATH --gap GAP-NNN --pr N --actor X
    complete      --repo PATH --gap GAP-NNN --pr N --merge-sha SHA --actor X
    revert-to-progress --repo PATH --gap GAP-NNN --pr N --actor X
    sync-index    --repo PATH
    audit         --repo PATH [--report-file PATH]
    promote       --repo PATH --suggestion SUG-ID --new-gap GAP-NNN
    parse         --repo PATH

All commands are idempotent. If state already matches the desired transition,
the command is a no-op (no ledger event, no doc edit, no status.json write).
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

# ----------------------------------------------------------------------------
# Constants
# ----------------------------------------------------------------------------

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

GAP_HEADER_RE = re.compile(r"^### (GAP-\d{3,4}):\s*(.+)$", re.MULTILINE)
GAP_BLOCK_SPLIT_RE = re.compile(r"^### GAP-", re.MULTILINE)

BRANCH_GAP_RE = re.compile(r"^gap/(\d{3,4})(?:-[a-z0-9-]+)?$")
PR_TITLE_GAP_RE = re.compile(r"^(GAP-\d{3,4}):")
PR_BODY_ALSO_CLOSES_RE = re.compile(r"Also closes:\s*((?:GAP-\d{3,4}(?:,\s*)?)+)", re.IGNORECASE)


# ----------------------------------------------------------------------------
# Domain types
# ----------------------------------------------------------------------------


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
    raw_block: str = ""              # the full text including the header line
    block_start: int = 0             # char offset in source doc
    block_end: int = 0


# ----------------------------------------------------------------------------
# Parsing
# ----------------------------------------------------------------------------


def parse_gaps(doc_text: str) -> list[Gap]:
    """Parse all gap blocks out of GAP_ANALYSIS.md text."""
    gaps: list[Gap] = []
    # Find every "### GAP-NNN: title" header and the offset where it begins.
    headers = list(GAP_HEADER_RE.finditer(doc_text))
    if not headers:
        return gaps
    # Also find every "## " section header — gap blocks must terminate at
    # the next sibling section (e.g. "## Completed Gaps") even when no
    # subsequent "### GAP-" header exists.
    section_re = re.compile(r"^## [^#\n][^\n]*$", re.MULTILINE)
    section_offsets = [m.start() for m in section_re.finditer(doc_text)]
    for i, m in enumerate(headers):
        gap_id = m.group(1)
        title = m.group(2).strip()
        start = m.start()
        # Default end: next gap header or EOF.
        end = headers[i + 1].start() if i + 1 < len(headers) else len(doc_text)
        # Tighten end to the nearest "## " section header strictly after
        # `start` and at-or-before the next gap header.
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
        # Extract fields with a regex that handles both `**Field:** value` and
        # `**Field**: value` and strips bold markers cleanly.
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
        # Crude description extraction (between **Description:** and next **Field:**
        # where Field can be multiple words like "Acceptance Criteria").
        desc_m = re.search(
            r"\*\*Description:\*\*\s*\n(.+?)(?=\n\*\*[^*\n]+:\*\*|\Z)",
            block,
            re.DOTALL,
        )
        if desc_m:
            g.description = desc_m.group(1).strip()
        gaps.append(g)
    return gaps


def find_gap(gaps: list[Gap], gap_id: str) -> Optional[Gap]:
    for g in gaps:
        if g.id == gap_id:
            return g
    return None


# ----------------------------------------------------------------------------
# Mutation
# ----------------------------------------------------------------------------


def replace_field_in_block(block: str, field_name: str, new_value: str) -> str:
    """Replace a `**Field:** ...` or `**Field**: ...` line inside a gap block.
    If the field is not present, append it after the gap header."""
    # Match BOTH `**Field:**` and `**Field**:` styles. Templates use
    # `**Field**: value` but auto-inserted lines historically used
    # `**Field:** value` — must accept either to avoid duplicate fields.
    pattern = re.compile(
        rf"^\*\*{re.escape(field_name)}(?::\*\*|\*\*:)\s*.*$",
        re.MULTILINE,
    )
    new_line = f"**{field_name}**: {new_value}"
    if pattern.search(block):
        return pattern.sub(new_line, block, count=1)
    # Field missing — insert after the header line.
    lines = block.splitlines(keepends=True)
    out: list[str] = []
    inserted = False
    for line in lines:
        out.append(line)
        if not inserted and line.startswith("### GAP-"):
            out.append("\n")
            out.append(new_line + "\n")
            inserted = True
    return "".join(out)


def append_status_update_bullet(block: str, date_str: str, note: str) -> str:
    """Append a status-update bullet under '**Last Status Update**' header."""
    # Update the **Last Status Update** date first.
    block = replace_field_in_block(block, "Last Status Update", date_str)
    # Append a bullet immediately after the Last Status Update line.
    # Match BOTH `**Last Status Update:**` and `**Last Status Update**:` styles.
    pattern = re.compile(
        r"(^\*\*Last Status Update(?::\*\*|\*\*:)[^\n]*\n)",
        re.MULTILINE,
    )
    bullet = f"- {note}\n"
    if pattern.search(block):
        return pattern.sub(rf"\1{bullet}", block, count=1)
    return block + "\n" + bullet


def write_doc_with_updated_block(doc_text: str, gap: Gap, new_block: str) -> str:
    """Replace the full block of `gap` in `doc_text` with `new_block`."""
    # Use the saved offsets.
    return doc_text[: gap.block_start] + new_block + doc_text[gap.block_end :]


# ----------------------------------------------------------------------------
# Ledger
# ----------------------------------------------------------------------------


def utc_now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def append_ledger_event(repo: Path, event: dict) -> None:
    ledger = repo / ".gap-analysis" / "build-ledger.jsonl"
    ledger.parent.mkdir(parents=True, exist_ok=True)
    if not ledger.exists():
        # Schema header line (matches build-ledger.template.jsonl).
        header = {
            "$schema": "https://github.com/ruralpeds/.github/blob/main/docs/GAP_ANALYSIS_LIFECYCLE.md#7-event-ledger-build-ledgerjsonl",
            "$comment": "This file is workflow-owned. Do not edit by hand.",
            "$created": utc_now_iso(),
        }
        ledger.write_text(json.dumps(header) + "\n")
    event = {"ts": utc_now_iso(), **event}
    with ledger.open("a") as f:
        f.write(json.dumps(event, separators=(",", ":")) + "\n")


def read_ledger(repo: Path) -> list[dict]:
    ledger = repo / ".gap-analysis" / "build-ledger.jsonl"
    if not ledger.exists():
        return []
    out: list[dict] = []
    for line in ledger.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if "$schema" in obj or "$comment" in obj:
            continue  # header line
        out.append(obj)
    return out


# ----------------------------------------------------------------------------
# Subcommand: extract-id
# ----------------------------------------------------------------------------


def cmd_extract_id(args: argparse.Namespace) -> int:
    if args.branch:
        m = BRANCH_GAP_RE.match(args.branch.strip())
        if m:
            print(f"GAP-{m.group(1).zfill(3)}")
            return 0
        return 1
    if args.pr_title:
        m = PR_TITLE_GAP_RE.match(args.pr_title.strip())
        if m:
            print(m.group(1))
            return 0
        return 1
    if args.pr_body:
        m = PR_BODY_ALSO_CLOSES_RE.search(args.pr_body or "")
        if m:
            ids = re.findall(r"GAP-\d{3,4}", m.group(1))
            print(" ".join(ids))
            return 0
        return 1
    print("extract-id requires --branch, --pr-title, or --pr-body", file=sys.stderr)
    return 2


# ----------------------------------------------------------------------------
# Subcommand: advance (status transition)
# ----------------------------------------------------------------------------


def cmd_advance(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    doc = repo / ".gap-analysis" / "GAP_ANALYSIS.md"
    if not doc.exists():
        print(f"No GAP_ANALYSIS.md at {doc}", file=sys.stderr)
        return 1
    text = doc.read_text()
    gaps = parse_gaps(text)
    g = find_gap(gaps, args.gap)
    if g is None:
        print(f"::warning::{args.gap} not found in GAP_ANALYSIS.md; cannot advance", file=sys.stderr)
        return 0  # not an error in CI — the gap may not have been added yet
    if args.to not in VALID_STATUSES:
        print(f"Invalid target status: {args.to}", file=sys.stderr)
        return 2
    if g.status == args.to:
        print(f"{g.id} already {args.to}; no-op")
        return 0
    today = datetime.date.today().isoformat()
    note_parts = [f"workflow: {args.trigger}"]
    if args.branch:
        note_parts.append(f"branch `{args.branch}`")
    if args.pr:
        note_parts.append(f"PR #{args.pr}")
    if args.actor:
        note_parts.append(f"by @{args.actor}")
    note = " — ".join(note_parts)
    new_block = replace_field_in_block(g.raw_block, "Status", args.to)
    new_block = append_status_update_bullet(new_block, today, f"Status → **{args.to}** ({note})")
    text = write_doc_with_updated_block(text, g, new_block)
    doc.write_text(text)
    append_ledger_event(repo, {
        "event": "status_changed",
        "gap": g.id,
        "from": g.status,
        "to": args.to,
        "trigger": args.trigger,
        "branch": args.branch,
        "pr": int(args.pr) if args.pr else None,
        "sha": args.sha,
        "actor": args.actor,
    })
    if args.trigger == "branch_opened":
        append_ledger_event(repo, {
            "event": "branch_opened",
            "gap": g.id,
            "branch": args.branch,
            "actor": args.actor,
            "sha": args.sha,
        })
    print(f"{g.id}: {g.status} → {args.to}")
    return 0


# ----------------------------------------------------------------------------
# Subcommand: link-pr
# ----------------------------------------------------------------------------


def cmd_link_pr(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    doc = repo / ".gap-analysis" / "GAP_ANALYSIS.md"
    if not doc.exists():
        return 1
    text = doc.read_text()
    gaps = parse_gaps(text)
    g = find_gap(gaps, args.gap)
    if g is None:
        print(f"::warning::{args.gap} not found", file=sys.stderr)
        return 0
    today = datetime.date.today().isoformat()
    pr_link = f"#{args.pr}"
    existing = g.related_prs.strip()
    if existing in ("", "None"):
        new_prs = pr_link
    elif pr_link in existing:
        new_prs = existing
    else:
        new_prs = f"{existing}, {pr_link}"
    new_block = replace_field_in_block(g.raw_block, "Related PRs", new_prs)
    if g.status != "In Review":
        new_block = replace_field_in_block(new_block, "Status", "In Review")
        new_block = append_status_update_bullet(
            new_block, today, f"Status → **In Review** (PR {pr_link} opened by @{args.actor})"
        )
        append_ledger_event(repo, {
            "event": "status_changed",
            "gap": g.id,
            "from": g.status,
            "to": "In Review",
            "trigger": "pr_opened",
            "pr": int(args.pr),
            "actor": args.actor,
        })
    append_ledger_event(repo, {
        "event": "pr_opened",
        "gap": g.id,
        "pr": int(args.pr),
        "actor": args.actor,
    })
    text = write_doc_with_updated_block(text, g, new_block)
    doc.write_text(text)
    print(f"{g.id}: linked PR #{args.pr}")
    return 0


# ----------------------------------------------------------------------------
# Subcommand: complete
# ----------------------------------------------------------------------------


def cmd_complete(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    doc = repo / ".gap-analysis" / "GAP_ANALYSIS.md"
    if not doc.exists():
        return 1
    text = doc.read_text()
    gaps = parse_gaps(text)
    g = find_gap(gaps, args.gap)
    if g is None:
        print(f"::warning::{args.gap} not found", file=sys.stderr)
        return 0
    today = datetime.date.today().isoformat()
    new_block = replace_field_in_block(g.raw_block, "Status", "Completed")
    new_block = append_status_update_bullet(
        new_block,
        today,
        f"Status → **Completed** (PR #{args.pr} merged @ `{(args.merge_sha or '')[:7]}` by @{args.actor})",
    )
    append_ledger_event(repo, {
        "event": "status_changed",
        "gap": g.id,
        "from": g.status,
        "to": "Completed",
        "trigger": "pr_merged",
        "pr": int(args.pr),
        "actor": args.actor,
    })
    append_ledger_event(repo, {
        "event": "pr_merged",
        "gap": g.id,
        "pr": int(args.pr),
        "merge_sha": args.merge_sha,
        "actor": args.actor,
    })
    text = write_doc_with_updated_block(text, g, new_block)
    doc.write_text(text)
    print(f"{g.id}: Completed (PR #{args.pr})")
    return 0


# ----------------------------------------------------------------------------
# Subcommand: revert-to-progress
# ----------------------------------------------------------------------------


def cmd_revert_to_progress(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    doc = repo / ".gap-analysis" / "GAP_ANALYSIS.md"
    if not doc.exists():
        return 1
    text = doc.read_text()
    gaps = parse_gaps(text)
    g = find_gap(gaps, args.gap)
    if g is None:
        return 0
    if g.status != "In Review":
        # If status was already past or before "In Review", don't touch it.
        return 0
    today = datetime.date.today().isoformat()
    new_block = replace_field_in_block(g.raw_block, "Status", "In Progress")
    new_block = append_status_update_bullet(
        new_block,
        today,
        f"Status → **In Progress** (PR #{args.pr} closed without merge by @{args.actor})",
    )
    append_ledger_event(repo, {
        "event": "pr_closed_unmerged",
        "gap": g.id,
        "pr": int(args.pr),
        "actor": args.actor,
    })
    append_ledger_event(repo, {
        "event": "status_changed",
        "gap": g.id,
        "from": "In Review",
        "to": "In Progress",
        "trigger": "pr_closed_unmerged",
        "pr": int(args.pr),
        "actor": args.actor,
    })
    text = write_doc_with_updated_block(text, g, new_block)
    doc.write_text(text)
    print(f"{g.id}: reverted In Review → In Progress")
    return 0


# ----------------------------------------------------------------------------
# Subcommand: sync-index (regenerate status.json)
# ----------------------------------------------------------------------------


def cmd_sync_index(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    doc = repo / ".gap-analysis" / "GAP_ANALYSIS.md"
    if not doc.exists():
        return 0
    text = doc.read_text()
    gaps = parse_gaps(text)
    by_status: dict[str, int] = {}
    by_priority: dict[str, int] = {}
    gap_summaries: list[dict] = []
    for g in gaps:
        by_status[g.status or "unknown"] = by_status.get(g.status or "unknown", 0) + 1
        if g.priority:
            # Strip parenthetical labels: "P0 (Blocker)" -> "P0"
            p = g.priority.split()[0]
            by_priority[p] = by_priority.get(p, 0) + 1
        desc = g.description.replace("\n", " ").strip()
        if len(desc) > 200:
            desc = desc[:197] + "..."
        gap_summaries.append({
            "id": g.id,
            "title": g.title,
            "status": g.status,
            "priority": g.priority,
            "owner": g.owner,
            "target_completion": g.target_completion,
            "related_prs": g.related_prs,
            "last_status_update": g.last_status_update,
            "description_excerpt": desc,
        })
    status_obj = {
        "generated_at": utc_now_iso(),
        "schema_version": "1.0",
        "total_gaps": len(gaps),
        "summary": {
            "by_status": by_status,
            "by_priority": by_priority,
        },
        "gaps": gap_summaries,
    }
    out = repo / ".gap-analysis" / "status.json"
    out.write_text(json.dumps(status_obj, indent=2) + "\n")
    print(f"Wrote {out} ({len(gaps)} gaps)")
    return 0


# ----------------------------------------------------------------------------
# Subcommand: audit
# ----------------------------------------------------------------------------


def cmd_audit(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    doc = repo / ".gap-analysis" / "GAP_ANALYSIS.md"
    if not doc.exists():
        return 0
    text = doc.read_text()
    gaps = parse_gaps(text)
    events = read_ledger(repo)
    drift: list[str] = []
    notes: list[str] = []

    # 1. Every gap with status != Backlog/NotStarted should have at least one
    # ledger event.
    seen_in_ledger: set[str] = set()
    for e in events:
        if "gap" in e and e["gap"]:
            seen_in_ledger.add(e["gap"])
    for g in gaps:
        if g.status not in (None, "Not Started", "Backlog") and g.id not in seen_in_ledger:
            drift.append(f"DRIFT: {g.id} has status `{g.status}` but no ledger events.")

    # 2. Every "Completed" gap should have a pr_merged event.
    completed_gaps = [g.id for g in gaps if g.status == "Completed"]
    pr_merged_gaps = {e["gap"] for e in events if e.get("event") == "pr_merged"}
    for gid in completed_gaps:
        if gid not in pr_merged_gaps:
            drift.append(f"DRIFT: {gid} is Completed in doc but no pr_merged event in ledger.")

    # 3. Every pr_merged event should map to a Completed gap.
    for e in events:
        if e.get("event") == "pr_merged":
            gid = e.get("gap")
            g = find_gap(gaps, gid)
            if g and g.status != "Completed":
                drift.append(f"DRIFT: ledger says {gid} merged via PR #{e.get('pr')} but doc shows status `{g.status}`.")

    # 4. P0/P1 gaps should have owner+target.
    for g in gaps:
        if g.priority and g.priority.split()[0] in ("P0", "P1"):
            if not g.owner or "Unassigned" in g.owner:
                notes.append(f"NOTE: {g.id} ({g.priority}) has no owner.")
            if not g.target_completion or "TBD" in g.target_completion:
                notes.append(f"NOTE: {g.id} ({g.priority}) has no target date.")

    # 5. Stale gaps: In Progress with no update in >14 days.
    today = datetime.date.today()
    for g in gaps:
        if g.status == "In Progress" and g.last_status_update:
            try:
                last = datetime.date.fromisoformat(g.last_status_update[:10])
                if (today - last).days > 14:
                    notes.append(f"NOTE: {g.id} has been In Progress for {(today - last).days} days without update.")
            except ValueError:
                pass

    # Emit the report.
    if args.report_file:
        report = []
        report.append(f"# Gap Analysis Audit Report — {today.isoformat()}\n")
        report.append(f"**Repo:** `{repo.name}`\n")
        report.append(f"**Total gaps:** {len(gaps)}\n")
        report.append(f"**Ledger events:** {len(events)}\n\n")
        if drift:
            report.append("## Drift detected\n")
            for d in drift:
                report.append(f"- {d}\n")
            report.append("\n")
        if notes:
            report.append("## Notes (informational)\n")
            for n in notes:
                report.append(f"- {n}\n")
            report.append("\n")
        if not drift and not notes:
            report.append("All checks pass.\n")
        Path(args.report_file).write_text("".join(report))

    if drift:
        for d in drift:
            print(d)
        # Append a single audit_drift_detected event so the next run knows.
        append_ledger_event(repo, {
            "event": "audit_drift_detected",
            "gap": None,
            "actor": "audit-bot",
            "drift_count": len(drift),
        })
        return 0  # Non-fatal — issue-creation is the surface area, not exit code.
    print("Audit clean.")
    return 0


# ----------------------------------------------------------------------------
# Subcommand: promote (suggestion → gap)
# ----------------------------------------------------------------------------


def cmd_promote(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    sug = repo / ".gap-analysis" / "SUGGESTIONS.md"
    if not sug.exists():
        return 1
    # Just record the event; the actual move is a human edit (or a future
    # automation hook). This keeps the script honest about what it owns.
    append_ledger_event(repo, {
        "event": "suggestion_promoted",
        "gap": args.new_gap,
        "from_suggestion": args.suggestion,
        "actor": args.actor or "human",
    })
    print(f"Recorded suggestion_promoted: {args.suggestion} → {args.new_gap}")
    return 0


# ----------------------------------------------------------------------------
# Subcommand: parse (debugging)
# ----------------------------------------------------------------------------


def cmd_parse(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    doc = repo / ".gap-analysis" / "GAP_ANALYSIS.md"
    if not doc.exists():
        return 1
    gaps = parse_gaps(doc.read_text())
    out = []
    for g in gaps:
        d = asdict(g)
        # Don't dump the full raw block in human output.
        d.pop("raw_block", None)
        d.pop("block_start", None)
        d.pop("block_end", None)
        out.append(d)
    print(json.dumps(out, indent=2))
    return 0


# ----------------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="gap_lifecycle.py")
    sub = p.add_subparsers(dest="cmd", required=True)

    pe = sub.add_parser("extract-id")
    pe.add_argument("--branch")
    pe.add_argument("--pr-title")
    pe.add_argument("--pr-body")
    pe.set_defaults(func=cmd_extract_id)

    pa = sub.add_parser("advance")
    pa.add_argument("--repo", required=True)
    pa.add_argument("--gap", required=True)
    pa.add_argument("--to", required=True, choices=VALID_STATUSES)
    pa.add_argument("--trigger", required=True)
    pa.add_argument("--branch")
    pa.add_argument("--pr")
    pa.add_argument("--actor")
    pa.add_argument("--sha")
    pa.set_defaults(func=cmd_advance)

    pl = sub.add_parser("link-pr")
    pl.add_argument("--repo", required=True)
    pl.add_argument("--gap", required=True)
    pl.add_argument("--pr", required=True)
    pl.add_argument("--actor", required=True)
    pl.set_defaults(func=cmd_link_pr)

    pc = sub.add_parser("complete")
    pc.add_argument("--repo", required=True)
    pc.add_argument("--gap", required=True)
    pc.add_argument("--pr", required=True)
    pc.add_argument("--merge-sha", required=True)
    pc.add_argument("--actor", required=True)
    pc.set_defaults(func=cmd_complete)

    pr = sub.add_parser("revert-to-progress")
    pr.add_argument("--repo", required=True)
    pr.add_argument("--gap", required=True)
    pr.add_argument("--pr", required=True)
    pr.add_argument("--actor", required=True)
    pr.set_defaults(func=cmd_revert_to_progress)

    ps = sub.add_parser("sync-index")
    ps.add_argument("--repo", required=True)
    ps.set_defaults(func=cmd_sync_index)

    pau = sub.add_parser("audit")
    pau.add_argument("--repo", required=True)
    pau.add_argument("--report-file")
    pau.set_defaults(func=cmd_audit)

    pp = sub.add_parser("promote")
    pp.add_argument("--repo", required=True)
    pp.add_argument("--suggestion", required=True)
    pp.add_argument("--new-gap", required=True)
    pp.add_argument("--actor")
    pp.set_defaults(func=cmd_promote)

    pq = sub.add_parser("parse")
    pq.add_argument("--repo", required=True)
    pq.set_defaults(func=cmd_parse)

    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
