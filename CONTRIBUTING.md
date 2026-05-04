# Contributing to ruralpeds

## Before you open a PR

1. Run the compliance workflow locally or via `act` if possible.
2. Update `.github/AUDIT.yaml` via the audit workflow with
   `mark-reviewed: true` when appropriate.
3. Sign your commits (`git commit -S`). The compliance workflow
   enforces signatures for FDA Class II+ repos.
4. Include an entry in `CHANGELOG.md` (if present) for user-visible
   behavior changes.
5. If modifying `.gap-analysis/GAP_ANALYSIS.md`, ensure your changes
   pass the gap analysis validation workflow.

## Gap Analysis

### What is Gap Analysis?

Gap analysis documents known limitations, TODOs, and planned features for each
repository. It's part of the Organization Standard for tracking work across all
Rust and Julia repos in ruralpeds.

**Location:** `.gap-analysis/GAP_ANALYSIS.md` (created automatically for new repos)

**Key files:**
- `.gap-analysis/GAP_ANALYSIS.md` — Human-facing gap tracking document
- `.gap-analysis/schema.md` — Gap naming conventions and ownership rules
- `.gap-analysis/build-ledger.jsonl` — Append-only log of status transitions
- `.gap-analysis/status.json` — Generated index (gitignored)

### Gap ID Format

Per-repo numbering: `GAP-NNN` (zero-padded, e.g., GAP-001, GAP-042)

Examples:
- `GAP-001` — First gap in this repo
- `GAP-042` — 42nd gap
- `GAP-999` — Max 999 gaps per repo (time to archive old ones if you hit this)

### Gap Fields

All gaps must include:

| Field | Format | Example |
|-------|--------|---------|
| **ID** | GAP-NNN | GAP-001 |
| **Status** | See enum below | In Progress |
| **Priority** | P0–P4 | P1 |
| **Owner** | GitHub username or email | @john-doe or john@example.com |
| **Target Completion** | YYYY-MM-DD or TBD | 2026-06-30 |

**Valid Status Values:**
```
Not Started, Backlog, In Progress, Blocked, In Review, Completed, Archived
```

**Valid Priority Values:**
```
P0 (Blocker), P1 (Critical), P2 (High), P3 (Medium), P4 (Low)
```

### P0/P1 Requirements

If a gap is priority P0 or P1:
- ✅ **Must** have an assigned owner (not [Unassigned])
- ✅ **Must** have a target completion date (YYYY-MM-DD, not TBD)
- ✅ **Must** be updated at least weekly

### Updating Gap Status

When you open a PR related to a gap:

1. Reference the gap in your PR title: `GAP-001: Fix widget rendering`
2. Update the gap's status in `.gap-analysis/GAP_ANALYSIS.md`
   - `In the Air` — PR opened, CI running
   - `Committed` — All CI passed, awaiting merge
   - `Completed` — Merged
3. The validation workflow will check your changes

### Gap Validation

**Automated checks run on:**
- Any PR modifying `.gap-analysis/GAP_ANALYSIS.md`
- Any push to main that changes gap files

**Validation includes:**
- ✅ Status enum values correct
- ✅ Gap ID format (GAP-NNN) and uniqueness
- ✅ Required fields present
- ✅ Priority values [P0–P4]
- ✅ P0/P1 gaps have owners and target dates
- ✅ Schema files present and valid
- ✅ build-ledger.jsonl is valid JSONL

If validation fails, your PR cannot merge. See the workflow output for details.

## Branch protection

- Direct pushes to `main` are blocked in most repos.
- PRs require the `Required — Compliance` and `Required — Audit Log`
  checks to pass.
- For repos with `.gap-analysis/`, PRs also require the
  `Gap Analysis Format Validation` check to pass.
- For clinical-software repos, PRs also require review from a
  designated clinical reviewer.

## Code of conduct

Treat contributors and patients with equal respect. Harmful content or
conduct — including disclosure of real patient data, even as 'examples' —
will result in removal from the project.

