#!/usr/bin/env python3
"""
validate_gap_format.py

Validates .gap-analysis/GAP_ANALYSIS.md format and schema compliance.

Usage:
  python3 scripts/validate_gap_format.py [--repo PATH] [--strict] [--json-report]

Validates:
  - Status enum: [Not Started, Backlog, In Progress, Blocked, In Review, Completed, Archived]
  - Gap ID format (GAP-NNN) and uniqueness
  - Required fields: Status, Priority, Owner, Target Completion
  - Proper markdown structure
  - Priority values: [P0, P1, P2, P3, P4]
  - P0/P1 gaps have owners and target dates

Returns:
  0 = validation passed
  1 = validation errors found
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple


VALID_STATUSES = [
    "Not Started",
    "Backlog",
    "In Progress",
    "Blocked",
    "In Review",
    "Completed",
    "Archived",
    # Legacy statuses
    "In the Air",
    "Building",
    "Committed",
]

VALID_PRIORITIES = ["P0", "P1", "P2", "P3", "P4"]

GAP_HEADER_RE = re.compile(r"^### (GAP-\d{3,4}):\s*(.+)$", re.MULTILINE)
GAP_BLOCK_SPLIT_RE = re.compile(r"^### GAP-", re.MULTILINE)


class ValidationError:
    def __init__(self, level: str, message: str, gap_id: Optional[str] = None):
        self.level = level  # 'error', 'warning', 'info'
        self.message = message
        self.gap_id = gap_id

    def __str__(self):
        prefix = {"error": "❌", "warning": "⚠️", "info": "ℹ️"}[self.level]
        gap_part = f" [{self.gap_id}]" if self.gap_id else ""
        return f"{prefix}{gap_part}: {self.message}"


class GapValidator:
    def __init__(self, repo_path: Path = Path("."), strict: bool = False):
        self.repo_path = repo_path
        self.strict = strict
        self.errors: list[ValidationError] = []
        self.warnings: list[ValidationError] = []
        self.infos: list[ValidationError] = []

        self.gap_file = repo_path / ".gap-analysis" / "GAP_ANALYSIS.md"
        self.schema_file = repo_path / ".gap-analysis" / "schema.md"
        self.gitignore_file = repo_path / ".gap-analysis" / ".gitignore"
        self.ledger_file = repo_path / ".gap-analysis" / "build-ledger.jsonl"

    def error(self, msg: str, gap_id: Optional[str] = None):
        self.errors.append(ValidationError("error", msg, gap_id))

    def warning(self, msg: str, gap_id: Optional[str] = None):
        self.warnings.append(ValidationError("warning", msg, gap_id))

    def info(self, msg: str, gap_id: Optional[str] = None):
        self.infos.append(ValidationError("info", msg, gap_id))

    def validate(self) -> Tuple[bool, dict]:
        """Validate gap analysis. Returns (success, report)."""

        # Check basic file existence
        if not self.gap_file.exists():
            self.error(f"Gap analysis file not found: {self.gap_file.relative_to(self.repo_path)}")
            return False, self._build_report()

        # Read file
        try:
            content = self.gap_file.read_text()
        except Exception as e:
            self.error(f"Failed to read {self.gap_file}: {e}")
            return False, self._build_report()

        # Validate structure
        self._validate_structure(content)

        # Validate gaps
        gaps = self._extract_gaps(content)
        self._validate_gaps(gaps)

        # Validate schema and ledger files
        self._validate_supporting_files()

        # Determine overall success
        success = len(self.errors) == 0
        if self.strict and len(self.warnings) > 0:
            success = False

        return success, self._build_report()

    def _validate_structure(self, content: str):
        """Validate overall markdown structure."""

        # Check for main header
        if not re.search(r"^#\s+Gap Analysis", content, re.MULTILINE):
            self.error("Missing main header '# Gap Analysis for ...'")

        # Check for required sections
        required_sections = ["## Overview", "## Active Gaps"]
        for section in required_sections:
            if f"{section}" not in content:
                self.warning(f"Missing recommended section: {section}")

    def _extract_gaps(self, content: str) -> list[dict]:
        """Extract all gaps from markdown."""
        gaps = []

        # Split by gap header
        parts = GAP_BLOCK_SPLIT_RE.split(content)

        for part in parts[1:]:  # Skip first part (header)
            lines = part.split("\n")
            if not lines:
                continue

            # First line is the gap header
            header_line = lines[0]
            match = re.match(r"(\d{3,4}):\s*(.+)$", header_line)
            if not match:
                continue

            gap_num, gap_title = match.groups()
            gap_id = f"GAP-{gap_num}"
            full_block = "\n".join(lines)

            # Parse fields
            fields = self._extract_fields(full_block)

            gaps.append({
                "id": gap_id,
                "title": gap_title,
                "number": int(gap_num),
                "block": full_block,
                "fields": fields,
            })

        return gaps

    def _extract_fields(self, block: str) -> dict:
        """Extract field values from a gap block."""
        fields = {}

        # Extract common fields
        patterns = {
            "status": r"\*\*Status\*\*:\s*(.+?)(?=\n|\*\*|\Z)",
            "priority": r"\*\*Priority\*\*:\s*(.+?)(?=\n|\*\*|\Z)",
            "owner": r"\*\*Owner\*\*:\s*(.+?)(?=\n|\*\*|\Z)",
            "target_completion": r"\*\*Target Completion\*\*:\s*(.+?)(?=\n|\*\*|\Z)",
            "description": r"\*\*Description\*\*:\s*(.+?)(?=\n\n|\*\*|\Z)",
        }

        for field_name, pattern in patterns.items():
            match = re.search(pattern, block, re.DOTALL)
            if match:
                fields[field_name] = match.group(1).strip()

        return fields

    def _validate_gaps(self, gaps: list[dict]):
        """Validate individual gaps."""

        if not gaps:
            self.info("No gaps found (this is OK for new repos)")
            return

        gap_ids = set()
        gap_numbers = set()

        for gap in gaps:
            gap_id = gap["id"]
            gap_num = gap["number"]
            fields = gap["fields"]

            # Check for duplicate IDs
            if gap_id in gap_ids:
                self.error(f"Duplicate gap ID: {gap_id}")
            gap_ids.add(gap_id)

            # Check for numbering issues (gaps should be sequential or close)
            if gap_num in gap_numbers:
                self.error(f"Duplicate gap number: {gap_num}", gap_id)
            gap_numbers.add(gap_num)

            # Validate required fields
            required_fields = {
                "status": "Status",
                "priority": "Priority",
                "owner": "Owner",
                "target_completion": "Target Completion",
            }

            for field_key, field_name in required_fields.items():
                if field_key not in fields or not fields[field_key]:
                    self.warning(f"Missing required field: {field_name}", gap_id)

            # Validate status enum
            if "status" in fields:
                status = fields["status"]
                if status not in VALID_STATUSES:
                    self.error(f"Invalid status '{status}'. Valid: {', '.join(VALID_STATUSES)}", gap_id)

            # Validate priority enum (accept "P0 (description)" format too)
            if "priority" in fields:
                priority = fields["priority"].strip()
                # Extract just the priority code if description is included
                priority_code = priority.split()[0] if priority else ""
                if priority_code not in VALID_PRIORITIES:
                    self.error(f"Invalid priority '{priority}'. Valid: {', '.join(VALID_PRIORITIES)}", gap_id)

            # Validate P0/P1 requirements
            if "priority" in fields:
                priority = fields["priority"].strip()
                priority_code = priority.split()[0] if priority else ""

                if priority_code in ["P0", "P1"]:
                    # Must have owner
                    owner = fields.get("owner", "").strip()
                    if not owner or owner == "[Unassigned]" or owner == "Unassigned":
                        self.warning(f"{priority_code} gap should have an assigned owner", gap_id)

                    # Must have target completion date
                    target = fields.get("target_completion", "").strip()
                    if not target or target in ["TBD", "None", "N/A"]:
                        self.warning(f"{priority_code} gap should have a target completion date", gap_id)
                elif not self._is_valid_date(target):
                    self.warning(f"Target completion date format unclear: '{target}' (prefer YYYY-MM-DD)", gap_id)

    def _validate_supporting_files(self):
        """Validate schema.md and other supporting files."""

        # Check schema.md exists
        if not self.schema_file.exists():
            self.warning(f"Schema file not found: {self.schema_file.relative_to(self.repo_path)}")
        else:
            self.info("Schema file present")

        # Check .gitignore exists
        if not self.gitignore_file.exists():
            self.warning(f".gitignore not found: {self.gitignore_file.relative_to(self.repo_path)}")
        else:
            # Check if status.json is in .gitignore
            try:
                gitignore_content = self.gitignore_file.read_text()
                if "status.json" not in gitignore_content:
                    self.warning("status.json not in .gap-analysis/.gitignore (should be ignored)")
            except Exception:
                pass

        # Check build-ledger.jsonl format if it exists
        if self.ledger_file.exists():
            try:
                with open(self.ledger_file, 'r') as f:
                    for i, line in enumerate(f, 1):
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            json.loads(line)
                        except json.JSONDecodeError as e:
                            self.error(f"Invalid JSON on line {i} of build-ledger.jsonl: {e}")
                self.info("build-ledger.jsonl is valid JSONL")
            except Exception as e:
                self.error(f"Failed to read build-ledger.jsonl: {e}")

    def _is_valid_date(self, date_str: str) -> bool:
        """Check if string looks like a valid date."""
        # YYYY-MM-DD format
        if re.match(r"\d{4}-\d{2}-\d{2}", date_str):
            try:
                datetime.strptime(date_str, "%Y-%m-%d")
                return True
            except ValueError:
                return False
        return False

    def _build_report(self) -> dict:
        """Build validation report."""
        return {
            "timestamp": datetime.now().isoformat(),
            "valid": len(self.errors) == 0,
            "errors": [str(e) for e in self.errors],
            "warnings": [str(e) for e in self.warnings],
            "infos": [str(e) for e in self.infos],
            "summary": {
                "error_count": len(self.errors),
                "warning_count": len(self.warnings),
                "info_count": len(self.infos),
            },
        }


def main():
    parser = argparse.ArgumentParser(description="Validate gap analysis format and schema")
    parser.add_argument("--repo", type=Path, default=Path("."), help="Repository path")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    parser.add_argument("--json-report", type=Path, help="Save JSON report to file")

    args = parser.parse_args()

    # Validate
    validator = GapValidator(args.repo, strict=args.strict)
    success, report = validator.validate()

    # Print results
    print("\n" + "=" * 70)
    print("GAP ANALYSIS VALIDATION REPORT")
    print("=" * 70 + "\n")

    if report["errors"]:
        print("❌ ERRORS:")
        for error in report["errors"]:
            print(f"  {error}")
        print()

    if report["warnings"]:
        print("⚠️  WARNINGS:")
        for warning in report["warnings"]:
            print(f"  {warning}")
        print()

    if report["infos"]:
        print("ℹ️  INFO:")
        for info in report["infos"]:
            print(f"  {info}")
        print()

    print("=" * 70)
    if success:
        print("✅ VALIDATION PASSED")
    else:
        print("❌ VALIDATION FAILED")
    print("=" * 70 + "\n")

    # Save JSON report if requested
    if args.json_report:
        args.json_report.write_text(json.dumps(report, indent=2))
        print(f"📄 Report saved to: {args.json_report}\n")

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
