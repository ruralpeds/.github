# Gap Analysis Automated Workflows

**Version:** 1.0  
**Updated:** 2026-05-04  
**Status:** Active

This document describes the automated workflows for bootstrapping and validating gap analysis across the ruralpeds organization.

---

## Overview

The Gap Analysis system uses three automated workflows to maintain consistency across ~70 Rust and Julia repositories:

1. **gap-bootstrap-auto.yml** — Monthly discovery and bootstrap of new repos
2. **gap-validate.yml** — Format and schema validation in each repo's CI
3. **reusable-gap-schema-check.yml** — Reusable schema validation for repo CI pipelines

---

## 1. Auto Bootstrap Workflow

**File:** `.github/workflows/gap-bootstrap-auto.yml`  
**Runs in:** `ruralpeds/.github` repository  
**Trigger:** First of month (3 AM EST) or `workflow_dispatch`

### Purpose

Discovers all non-archived Rust and Julia repos **without** `.gap-analysis/` and bootstraps them with:
- `.gap-analysis/GAP_ANALYSIS.md` (customized for the repo)
- `.gap-analysis/schema.md` (organization standard)
- `.gap-analysis/.gitignore` (ignores status.json and generated files)
- `.gap-analysis/build-ledger.jsonl` (empty ledger)

### How It Works

1. **List Repos:** Queries GitHub API for all Rust/Julia repos in `ruralpeds/`
2. **Filter:** Excludes repos that already have `.gap-analysis/GAP_ANALYSIS.md`
3. **Create Files:** Pushes template files to each repo's default branch
4. **Report:** Creates or updates a GitHub issue with bootstrap summary

### Manual Trigger

```bash
# Trigger from Actions tab in GitHub UI with inputs:
# - dry_run: true (preview changes without committing)
# - single_repo: "" (or repo name to bootstrap just one repo)
```

### Report Output

Creates a GitHub issue in `ruralpeds/.github` with:
- Count of newly bootstrapped repos
- Count of already-bootstrapped repos
- Count of errors (if any)
- List of bootstrapped repos
- Link to artifact with detailed JSON report

### Dry Run Mode

Set `dry_run: true` to preview what would happen without making any changes.

---

## 2. Gap Validation Workflow

**File:** `.github/workflows/gap-validate.yml`  
**Runs in:** Every repo with `.gap-analysis/` files  
**Trigger:** Any push/PR modifying `.gap-analysis/` files

### Purpose

Validates gap analysis format and schema compliance in each repository. Runs as a required check in PRs.

### Validation Checks

#### Format Validation
- ✅ File existence: `GAP_ANALYSIS.md`, `schema.md`, `.gitignore`, `build-ledger.jsonl`
- ✅ Markdown structure: Required headers (# Gap Analysis, ## Active Gaps)
- ✅ Gap ID format: `GAP-NNN` (numeric, 3–4 digits)
- ✅ Gap ID uniqueness: No duplicate IDs
- ✅ Status enum: Values from approved list
- ✅ Priority enum: [P0, P1, P2, P3, P4]
- ✅ Required fields per gap: Status, Priority, Owner, Target Completion
- ✅ JSONL format: Valid JSON on each line of build-ledger.jsonl

#### Schema Enforcement
- ✅ `schema.md` exists and contains required sections
- ✅ `.gitignore` exists and ignores `status.json`
- ✅ P0/P1 gaps have assigned owners (not [Unassigned])
- ✅ P0/P1 gaps have target completion dates (not TBD)

### Valid Status Values

The workflow accepts these status values:

```
Not Started
Backlog
In Progress
Blocked
In Review
Completed
Archived
(Legacy: In the Air, Building, Committed)
```

### Status Update Cadence

Per the organization standard:
- **Minimum:** Weekly
- **Ideal:** On every PR merge
- **Never:** More than 2 weeks without update

### Example: Valid Gap Entry

```markdown
### GAP-001: Implement QuadraticSpline interpolation

**Status:** In Progress  
**Priority:** P1  
**Owner:** @alice  
**Target Completion:** 2026-06-30  

**Description:**  
Implement QuadraticSpline interpolation for CDC/WHO growth reference tables 
(0–19 years). Validate against NCHS published z-scores.

**Related PRs:**  
- #42 (WIP)
- #43 (In Review)

**Last Status Update:** 2026-05-02 — Coding phase, unit tests 95% done
```

### Example: Invalid Gap Entry

```markdown
### GAP-001: Implement QuadraticSpline interpolation

**Status:** In Development    # ❌ Invalid status (should be "In Progress")
**Priority:** CRITICAL        # ❌ Invalid priority (should be P0-P4)
**Owner:** [Unassigned]       # ⚠️  Warning: P1 gap needs owner
**Target Completion:** TBD    # ⚠️  Warning: P1 gap needs target date
```

### Handling Validation Failures

If the workflow fails, the PR cannot merge. Check the workflow output:

1. **Format errors** (❌ blocks merge):
   - Invalid status/priority values
   - Duplicate gap IDs
   - Missing required files
   - Malformed JSONL

2. **Schema warnings** (⚠️ informational):
   - P0/P1 gaps missing owners/dates
   - Missing optional sections

To fix:
1. Edit `.gap-analysis/GAP_ANALYSIS.md` according to the error message
2. Commit and push
3. Workflow re-runs automatically

---

## 3. Reusable Schema Check Workflow

**File:** `.github/workflows/reusable-gap-schema-check.yml`  
**Called from:** Individual repo CI workflows

### Purpose

Provides a reusable workflow for individual repos to validate gap schema as part of their CI pipeline (e.g., before building).

### Usage in Repo CI

Add to your repo's CI workflow (e.g., `.github/workflows/ci.yml`):

```yaml
jobs:
  gap-schema-check:
    if: hashFiles('.gap-analysis/GAP_ANALYSIS.md') != ''
    uses: ruralpeds/.github/.github/workflows/reusable-gap-schema-check.yml@main
    with:
      report_path: /tmp/gap_schema_check.json
```

### What It Checks

1. **schema.md** — Exists and contains required sections
2. **.gitignore** — Exists and ignores `status.json`
3. **build-ledger.jsonl** — Valid JSONL format (if present)
4. **GAP_ANALYSIS.md** — Correct structure

### Output

- ✅ Passes silently if all checks pass
- ❌ Fails build with error message if critical issues found
- ⚠️ Warns but passes for optional issues

### JSON Report

Writes report to path specified in `report_path` input:

```json
{
  "timestamp": "2026-05-04T14:30:00",
  "schema_valid": true,
  "checks": {
    "gap_analysis_md": "passed",
    "schema_md": "passed",
    "gitignore": "passed",
    "build_ledger_jsonl": "passed"
  }
}
```

---

## Validation Script

**File:** `scripts/validate_gap_format.py`  
**Can be run:** Locally or in CI

### Local Usage

```bash
# Validate current repo
python3 scripts/validate_gap_format.py

# Validate specific repo with strict mode
python3 scripts/validate_gap_format.py --repo ../other-repo --strict

# Save JSON report
python3 scripts/validate_gap_format.py --json-report /tmp/report.json
```

### Exit Codes

- `0` — Validation passed
- `1` — Validation failed (errors present)

### Outputs

**Console:**
```
==================================================
GAP ANALYSIS VALIDATION REPORT
==================================================

❌ ERRORS:
  [GAP-001]: Invalid status 'In Development'

⚠️  WARNINGS:
  [GAP-042]: Missing required field: Owner

ℹ️  INFO:
  Found 12 gaps (all unique)

==================================================
❌ VALIDATION FAILED
==================================================
```

**JSON Report:**
```json
{
  "timestamp": "2026-05-04T14:30:00",
  "valid": false,
  "errors": [
    "❌[GAP-001]: Invalid status 'In Development'"
  ],
  "warnings": [
    "⚠️[GAP-042]: Missing required field: Owner"
  ],
  "summary": {
    "error_count": 1,
    "warning_count": 1,
    "info_count": 5
  }
}
```

---

## Integration with Contributing Guidelines

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed information on:
- Gap ID format and naming
- When to update gaps
- How to reference gaps in PRs
- P0/P1 priority requirements

---

## Troubleshooting

### "Missing .gap-analysis/GAP_ANALYSIS.md"

**Cause:** Repo has not been bootstrapped yet.

**Solution:** 
- Trigger `gap-bootstrap-auto` workflow in `ruralpeds/.github` with this repo name
- Or wait for next monthly run

### "Duplicate gap IDs"

**Cause:** Two gaps with the same ID in the document.

**Solution:**
1. Identify the duplicates in `.gap-analysis/GAP_ANALYSIS.md`
2. Renumber one of them to the next available number
3. Commit and push

### "Invalid status 'In Development'"

**Cause:** Status value is not in the approved enum.

**Solution:**
Change status to one of:
```
Not Started, Backlog, In Progress, Blocked, In Review, Completed, Archived
```

### "build-ledger.jsonl: Invalid JSON on line 5"

**Cause:** A line in the ledger is not valid JSON.

**Solution:**
1. Open `.gap-analysis/build-ledger.jsonl`
2. Check line 5 for syntax errors
3. Consult `gap_lifecycle.py` or issue an event using its CLI

### Workflow fails but changes look correct

**Cause:** Validation is stricter than expected, or outdated cache.

**Solutions:**
1. Re-run the workflow from the Actions tab
2. Push an empty commit to force re-run: `git commit --allow-empty -m "Re-run validation"`
3. Check for whitespace issues or special characters

---

## Organizational Standards

**Enforcement:**
- ✅ Required check in all repos with `.gap-analysis/`
- ✅ PRs cannot merge if validation fails
- ✅ Scheduled monthly bootstrap ensures compliance

**Contact:**
For questions or issues with the workflow:
- Open an issue in `ruralpeds/.github`
- Tag: `gap-analysis`
- Mention: @timothyhartzog

---

## See Also

- [GAP_ANALYSIS_LIFECYCLE.md](GAP_ANALYSIS_LIFECYCLE.md) — Full lifecycle standard
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Contributing guidelines
- `scripts/gap_lifecycle.py` — CLI for gap status transitions
- `.github/templates/gap-analysis/` — Template files
