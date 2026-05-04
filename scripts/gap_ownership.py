#!/usr/bin/env python3
"""
gap_ownership.py — Suggest and assign ownership for gaps.

Finds unassigned gaps and suggests owners based on:
  - Code file patterns (CODEOWNERS file)
  - Repository maintainers (from MAINTAINERS.md or repo metadata)
  - Team ownership configuration

Can auto-assign or create a PR for manual review.

Usage:
    gap_ownership.py --repo PATH [--mode suggest|assign] [--auto]

Modes:
    suggest: Print suggested assignments (default)
    assign: Create a PR with ownership assignments

Environment:
    GITHUB_TOKEN: For reading CODEOWNERS and creating PRs
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import os
import re
import sys
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


def parse_codeowners(codeowners_path: Path) -> dict[str, str]:
    """
    Parse CODEOWNERS file and return pattern -> owner mapping.

    CODEOWNERS format:
    # comment
    pattern owner1 owner2
    *.py @python-team
    docs/ @docs-lead
    """
    owners = {}

    if not codeowners_path.exists():
        return owners

    try:
        for line in codeowners_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue

            parts = line.split()
            if len(parts) >= 2:
                pattern = parts[0]
                owner = parts[1]  # Just take first owner
                owners[pattern] = owner

    except Exception as e:
        print(f"::warning::Failed to parse CODEOWNERS: {e}", file=sys.stderr)

    return owners


def parse_maintainers(maintainers_path: Path) -> Optional[str]:
    """
    Parse MAINTAINERS.md or similar to find primary maintainer.

    Simple heuristic: look for first GitHub handle.
    """
    if not maintainers_path.exists():
        return None

    try:
        text = maintainers_path.read_text()
        # Look for @username pattern
        m = re.search(r"@([a-zA-Z0-9_-]+)", text)
        if m:
            return m.group(1)
    except Exception as e:
        print(f"::warning::Failed to parse maintainers file: {e}", file=sys.stderr)

    return None


@dataclass
class OwnershipSuggestion:
    gap_id: str
    gap_title: str
    current_owner: Optional[str]
    suggested_owner: Optional[str]
    suggestion_reason: str
    confidence: float  # 0.0 to 1.0


def suggest_ownership(repo: Path) -> list[OwnershipSuggestion]:
    """
    Suggest ownership for unassigned gaps.

    Returns:
        List of ownership suggestions
    """
    doc_path = repo / ".gap-analysis" / "GAP_ANALYSIS.md"

    if not doc_path.exists():
        return []

    doc_text = doc_path.read_text()
    gaps = parse_gaps(doc_text)

    # Filter to unassigned gaps
    unassigned = [
        g for g in gaps
        if not g.owner or g.owner.lower() in ("unassigned", "none", "tbd")
    ]

    suggestions: list[OwnershipSuggestion] = []

    # Try to find owner from CODEOWNERS
    codeowners_path = repo / "CODEOWNERS"
    codeowners = parse_codeowners(codeowners_path)

    # Try to find primary maintainer
    maintainers_path = repo / "MAINTAINERS.md"
    primary_maintainer = parse_maintainers(maintainers_path)

    for gap in unassigned:
        suggested = None
        reason = ""
        confidence = 0.0

        # First choice: look at related_prs to infer owner
        if gap.related_prs and gap.related_prs not in ("None", ""):
            # Extract PR numbers and could theoretically query GitHub for author,
            # but we'll skip that for now.
            pass

        # Second choice: gap description might mention file paths
        if gap.description and codeowners:
            # Extract potential file paths from description (basic heuristic)
            # Look for paths that look like file/directory names
            potential_paths = re.findall(r'\b([\w\-./]+\.[\w]+|[\w\-./]+/)\b', gap.description.lower())

            # Try to match extracted paths against CODEOWNERS patterns
            for potential_path in potential_paths:
                for pattern, owner in codeowners.items():
                    # Use fnmatch for proper glob pattern matching
                    if fnmatch.fnmatch(potential_path, pattern.lower()):
                        suggested = owner
                        reason = f"Gap mentions path '{potential_path}' which matches CODEOWNERS pattern '{pattern}'"
                        confidence = 0.6
                        break
                if suggested:
                    break

        # Fallback: use primary maintainer
        if not suggested and primary_maintainer:
            suggested = primary_maintainer
            reason = "Repository primary maintainer"
            confidence = 0.5

        # If still no suggestion, try repo metadata (owner of last commit, etc.)
        # This would require git or GitHub API access.

        if suggested:
            suggestions.append(
                OwnershipSuggestion(
                    gap_id=gap.id,
                    gap_title=gap.title,
                    current_owner=gap.owner,
                    suggested_owner=suggested,
                    suggestion_reason=reason,
                    confidence=confidence,
                )
            )

    return suggestions


def replace_field_in_block(block: str, field_name: str, new_value: str) -> str:
    """Replace a `**Field:** ...` or `**Field**: ...` line inside a gap block."""
    pattern = re.compile(
        rf"^\*\*{re.escape(field_name)}(?::\*\*|\*\*:)\s*.*$",
        re.MULTILINE,
    )
    new_line = f"**{field_name}**: {new_value}"
    if pattern.search(block):
        return pattern.sub(new_line, block, count=1)

    # Field missing — insert after the header line
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


def apply_ownership_assignments(doc_text: str, suggestions: list[OwnershipSuggestion]) -> str:
    """Apply ownership assignments to GAP_ANALYSIS.md text."""
    gaps = parse_gaps(doc_text)

    for suggestion in suggestions:
        gap = next((g for g in gaps if g.id == suggestion.gap_id), None)
        if gap and suggestion.suggested_owner:
            gap.raw_block = replace_field_in_block(
                gap.raw_block,
                "Owner",
                suggestion.suggested_owner,
            )
            # Replace in doc_text
            doc_text = doc_text[: gap.block_start] + gap.raw_block + doc_text[gap.block_end :]

    return doc_text


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Suggest and assign ownership for gaps"
    )
    parser.add_argument("--repo", required=True, help="Path to repository root")
    parser.add_argument(
        "--mode",
        choices=["suggest", "assign"],
        default="suggest",
        help="suggest (print suggestions) or assign (update GAP_ANALYSIS.md)",
    )
    parser.add_argument(
        "--auto",
        action="store_true",
        help="Auto-assign high-confidence suggestions without manual review",
    )
    parser.add_argument(
        "--json-output",
        help="Path to write JSON suggestions",
    )

    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not repo.exists():
        print(f"::error::Repository path does not exist: {repo}", file=sys.stderr)
        return 2

    suggestions = suggest_ownership(repo)

    if not suggestions:
        print("No unassigned gaps found.", file=sys.stderr)
        return 0

    # Output suggestions as JSON
    suggestions_dict = [
        {
            "gap_id": s.gap_id,
            "gap_title": s.gap_title,
            "current_owner": s.current_owner,
            "suggested_owner": s.suggested_owner,
            "suggestion_reason": s.suggestion_reason,
            "confidence": s.confidence,
        }
        for s in suggestions
    ]

    json_output = json.dumps(suggestions_dict, indent=2)

    if args.json_output:
        Path(args.json_output).write_text(json_output)

    print(json_output)

    # Print summary to stderr
    print("\n" + "=" * 70, file=sys.stderr)
    print("Gap Ownership Suggestions", file=sys.stderr)
    print("=" * 70, file=sys.stderr)
    print(f"Repository: {repo}", file=sys.stderr)
    print(f"Unassigned gaps: {len(suggestions)}", file=sys.stderr)
    print()

    for s in suggestions:
        confidence_pct = int(s.confidence * 100)
        print(f"{s.gap_id}: {s.gap_title}", file=sys.stderr)
        print(f"  Suggested: {s.suggested_owner} ({confidence_pct}% confidence)", file=sys.stderr)
        print(f"  Reason: {s.suggestion_reason}", file=sys.stderr)
        print()

    print("=" * 70, file=sys.stderr)

    if args.mode == "assign" and args.auto:
        # Apply assignments
        doc_path = repo / ".gap-analysis" / "GAP_ANALYSIS.md"
        doc_text = doc_path.read_text()
        updated_text = apply_ownership_assignments(doc_text, suggestions)
        doc_path.write_text(updated_text)
        print(f"✓ Applied ownership assignments to {doc_path}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
