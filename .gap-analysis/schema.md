# Gap Analysis Schema for .github (Org Governance)

**Repository**: `ruralpeds/.github`
**Last Updated**: 2026-04-28
**Scope**: Rules specific to the org-level governance repository

This repo carries org-wide rulesets, custom-property definitions, reusable
workflows, audit-ledger tooling, infrastructure templates, and the
compliance-metrics archive. Gaps tracked here are **org-governance gaps**, not
feature gaps for clinical or research repos.

---

## Gap ID Naming Convention

```
GAP-NNN    (per-repo numbering, zero-padded)
```

Sequential within this repo. No sub-namespaces; cross-repo gaps reference
their owning repo (see org standard).

---

## Status Update Cadence

- **Minimum**: Weekly Monday morning sync.
- **On every Q-initiative milestone**: Update affected gaps the same day the
  initiative ships (these gaps drive the compliance scorecard).
- **Never**: More than 14 days without a status update on a P0/P1 gap.

---

## Ownership Rules

| Priority | Owner Required | Target Date Required |
|----------|---------------|---------------------|
| **P0 (Blocker)** | Yes — within 30 days | Yes |
| **P1 (Critical)** | Yes — within 90 days | Yes |
| **P2 (High)** | Yes (default: Compliance Officer) | Recommended |
| **P3 (Medium)** | Optional | No |
| **P4 (Low)** | Optional | No |

Default owner for unattributed P2+ gaps: **Timothy Hartzog (Compliance
Officer)**.

---

## Cross-Repo Dependencies

When a gap here unblocks/blocks gaps in clinical or content repos, document
both sides. Use the org-wide format:

```markdown
**Blocking Issues**: GAP-XXX (repo: ruralpeds/<other>) — waiting on us
**Blocked By**: GAP-YYY (repo: ruralpeds/<other>) — unblock when complete
```

---

## Repo-Specific Categories

For this org-governance repo, gaps usually fall into one of:

| Category | Examples |
|----------|----------|
| **Workflow infrastructure** | New reusable workflow, refactor, deprecation |
| **Ruleset / property** | New ruleset JSON, custom-property additions |
| **Audit & evidence** | Ledger schema changes, Sigstore key rotation, export packaging |
| **Compliance scorecard** | Initiatives that move the score (linked to Q-roadmap) |
| **Branch / repo hygiene** | Cleanup, retention, deletion sweeps |
| **Submission packaging** | FDA bundle assembly, validation export, RTM publishing |

Tag the **Description** with one of these category labels to keep the
dashboard reportable.

---

## Definition of Completed (this repo)

A gap is **Completed** when:

1. ✅ Acceptance criteria all met
2. ✅ Merged to `main` (not just to a working branch)
3. ✅ If the gap touches a workflow used by other repos, at least one downstream
   repo has run the new/changed workflow successfully
4. ✅ Audit ledger (`audit-log/governance-ledger.jsonl`) has an entry recording
   the change, when applicable
5. ✅ Gap moved to **Completed Gaps** section with PR # and notes

---

## Archive Rules

- Historical compliance assessments live under
  `compliance-metrics/` and are **not duplicated** into
  `.gap-analysis/archive/`.
- `.gap-analysis/archive/README.md` indexes those external documents.
- Gaps closed in this repo's `GAP_ANALYSIS.md` stay in **Completed Gaps** for
  90 days, then move to `.gap-analysis/archive/<YYYY>-completed.md`.

---

## Compliance Auditing

Audited weekly by `.github/workflows/gap-analysis-validate.yml`. The validator
checks:

- Status enum is one of the 7 allowed values
- P0/P1 gaps have owner + ISO date
- Gap IDs are unique
- No duplicate or malformed entries

---

## Change Log

| Date | Change | Who |
|------|--------|-----|
| 2026-04-28 | Initial schema for .github repo | Claude (org rebuild) |
