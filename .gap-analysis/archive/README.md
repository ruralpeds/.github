# Gap Analysis Archive

This `.github` repo did not previously maintain a `.gap-analysis/GAP_ANALYSIS.md`
instance. Gap-analysis-equivalent content was distributed across the historical
compliance and roadmap documents. This index points to that prior content
rather than duplicating it.

**Initial archive index date**: 2026-04-28
**Replaces**: ad-hoc gap tracking in roadmap and compliance-metrics files

---

## Historical Gap-Analysis-Equivalent Documents

These documents predate the formal `.gap-analysis/` directory and effectively
served the same purpose. They are retained in their original locations for
audit-trail integrity (each is referenced from the governance ledger).

### Compliance baselines and remediations

- `compliance-metrics/openssf-baseline-assessment.md` — initial OpenSSF
  scorecard gap analysis (Q1 2026 baseline).
- `compliance-metrics/openssf-remediation-q2-2026.md` — remediation plan for
  OpenSSF gaps identified in the baseline.
- `compliance-metrics/iec62304-classification-q2-2026.md` — IEC 62304 device
  classification gap analysis across org repos.
- `compliance-metrics/EXECUTIVE-STATUS-APRIL-2026.md` — executive view of
  outstanding compliance gaps and Q2 plan (baseline 82.5/100).

### Quarter execution and closure documents

These contain "what gaps were closed this quarter" content:

- `compliance-metrics/Q2-2026-kickoff.md` — Q2 entry-point gap list.
- `compliance-metrics/Q2-2026-execution-status.md` — running status against Q2
  gaps.
- `compliance-metrics/Q2-2026-week*-progress.md` — weekly progress on Q2 gaps.
- `compliance-metrics/Q2-2026-closure-jun30.md` — Q2 closure report.
- (Q3, Q4 2026 and Q1–Q4 2027 files exist as forward-looking plans, not
  closures, as of 2026-04-28.)

### Roadmaps with embedded gap content

- `ENTERPRISE_ROADMAP.md` — long-form enterprise gap roadmap.
- `YEAR_2_ROADMAP.md` — Year-2 (May 2026 – April 2027) gap roadmap.
- `YEAR_2_ROADMAP.md` Q2-Q4 sections drive Year-2 initiative gaps.
- `compliance-metrics/YEAR3-LAUNCH-OCT1-2026.md` and `YEAR3-5-STRATEGIC-ROADMAP.md`
  — Year-3+ gap content.

### Templates (reference only — not gap instances)

- `templates/gap-analysis/GAP_ANALYSIS.md` and `templates/gap-analysis/schema.md`
  — org-wide templates for clinical/content/research repos. These are example
  content and have never been an active gap instance for this repo.

---

## Why an Index, Not Copies

Each file above is referenced from `audit-log/governance-ledger.jsonl` at its
original path. Moving or duplicating them would either break those references
or pollute the audit trail. This README provides a single navigation point;
the source-of-truth files remain where the audit ledger expects them.

---

## When to Add Files Here

Once the active `GAP_ANALYSIS.md` accumulates closed gaps older than 90 days,
they get moved to `.gap-analysis/archive/<YYYY>-completed.md` per the schema.
External documents listed above will not be moved here — they stay in
`compliance-metrics/`.
