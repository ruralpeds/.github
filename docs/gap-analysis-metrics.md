# Gap Analysis Metrics & Trends

**Status:** Auto-generated daily by [`.github/workflows/gap-dashboard.yml`](.github/workflows/gap-dashboard.yml)
**Last Updated:** 2026-05-04 (placeholder — updates daily at 07:00 UTC)
**Owner:** Timothy Hartzog (@timothyhartzog)

---

## Overview

This document tracks gap analysis metrics, trends, and bottlenecks across the ruralpeds organization. It is generated automatically every morning at 07:00 UTC and includes:

- **Completion % by repo** — which teams are most on-track?
- **Gap age distribution** — which gaps are getting stale?
- **P0/P1 urgency indicators** — are critical gaps moving?
- **Trends** (week-over-week) — are we accelerating or stalling?
- **Bottlenecks** — which gaps are blocked or at risk?

---

## Key Metrics

### Org-Wide Summary

| Metric | Value | Trend |
|--------|-------|-------|
| **Total Gaps** | [TOTAL_GAPS] | [TREND_TOTAL] |
| **Completion %** | [COMPLETION_PCT]% | [TREND_COMPLETION] |
| **Completed Gaps** | [COMPLETED_GAPS] | [TREND_COMPLETED] |
| **Repos with Gaps** | [REPOS_WITH_GAPS] / [TOTAL_REPOS] | — |
| **P0 (Blocker) Count** | [P0_COUNT] | [TREND_P0] |
| **P1 (Critical) Count** | [P1_COUNT] | [TREND_P1] |

**Health Status:** [HEALTH_STATUS]
- 🟢 **Excellent** — Completion % > 70%, no overdue P0/P1 gaps
- 🟡 **Good** — Completion % 50-70%, P0 gaps in progress
- 🟠 **At Risk** — Completion % 30-50%, P0/P1 gaps overdue or blocked
- 🔴 **Critical** — Completion % < 30%, multiple P0 gaps overdue

---

## Completion Rate by Repository

| Repository | Gaps | Completed | % | P0 | Status |
|---|---|---|---|---|---|
| [REPO_BREAKDOWN] |

> **Top Performers:** Repos with >70% completion
> **At Risk:** Repos with <50% completion (consider escalation)

---

## Gap Age Distribution

**How many gaps by age (days since last status update)?**

| Age Range | Count | % | Examples |
|-----------|-------|---|----------|
| **< 7 days** | [AGE_0_7] | [PCT_0_7]% | Recently active ✅ |
| **7-14 days** | [AGE_7_14] | [PCT_7_14]% | On track ✅ |
| **14-30 days** | [AGE_14_30] | [PCT_14_30]% | Monitor 🟡 |
| **30-60 days** | [AGE_30_60] | [PCT_30_60]% | At risk 🟠 |
| **> 60 days** | [AGE_60_PLUS] | [PCT_60_PLUS]% | Critical 🔴 |

**Action Items:**
- Gaps > 30 days should have a status update
- Gaps > 60 days require owner escalation
- Blocked gaps should have clear unblock criteria

---

## P0/P1 Critical Gaps

### P0 Gaps (Blocker — Release Critical)

**Total P0 Gaps:** [P0_COUNT]

| Gap ID | Repo | Title | Status | Owner | Target | Days Until |
|--------|------|-------|--------|-------|--------|------------|
| [P0_TABLE] |

**Status Breakdown:**
- ✅ Completed: [P0_COMPLETED]
- 🔄 In Review: [P0_IN_REVIEW]
- 📋 In Progress: [P0_IN_PROGRESS]
- 🚫 Blocked: [P0_BLOCKED] — **ESCALATE** 🔴
- 📅 Backlog/Not Started: [P0_BACKLOG_NOT_STARTED] — **ESCALATE** 🔴

**Overdue P0 Gaps (Target date passed):**

[OVERDUE_P0_TABLE]

> ⚠️ **Alert:** Overdue P0 gaps block releases. Escalate immediately to owners and sprint leads.

### P1 Gaps (Critical — 1-3 months)

**Total P1 Gaps:** [P1_COUNT]

| Gap ID | Repo | Status | Owner | Target |
|--------|------|--------|-------|--------|
| [P1_TABLE] |

**Status Breakdown:**
- ✅ Completed: [P1_COMPLETED]
- 🔄 In Review: [P1_IN_REVIEW]
- 📋 In Progress: [P1_IN_PROGRESS]
- 🚫 Blocked: [P1_BLOCKED]
- 📅 Backlog/Not Started: [P1_BACKLOG_NOT_STARTED]

---

## Trends (Week-over-Week)

**Trend Period:** Previous 7 days vs. 14 days ago

| Metric | 7d Ago | Today | Change | Trend |
|--------|--------|-------|--------|-------|
| Total Gaps | [TOTAL_7D_AGO] | [TOTAL_TODAY] | [TOTAL_DELTA] | [TOTAL_ARROW] |
| Completed | [COMPLETED_7D_AGO] | [COMPLETED_TODAY] | [COMPLETED_DELTA] | [COMPLETED_ARROW] |
| Completion % | [PCT_7D_AGO]% | [PCT_TODAY]% | [PCT_DELTA]% | [PCT_ARROW] |
| P0 Count | [P0_7D_AGO] | [P0_TODAY] | [P0_DELTA] | [P0_ARROW] |
| In Progress | [IN_PROGRESS_7D_AGO] | [IN_PROGRESS_TODAY] | [IN_PROGRESS_DELTA] | [IN_PROGRESS_ARROW] |
| Blocked | [BLOCKED_7D_AGO] | [BLOCKED_TODAY] | [BLOCKED_DELTA] | [BLOCKED_ARROW] |

**Velocity (gaps completed per week):** [VELOCITY] gaps/week

**Projection:** At current velocity, 100% completion in [DAYS_TO_COMPLETION] days (~ [WEEKS_TO_COMPLETION] weeks)

---

## Bottlenecks & Risk Factors

### Blocked Gaps (Dependency Chains)

**Total Blocked:** [BLOCKED_COUNT]

| Gap ID | Title | Blocked By | Owner | Days Blocked |
|--------|-------|-----------|-------|-------------|
| [BLOCKED_TABLE] |

**Risk:** Gaps blocked > 14 days may indicate:
- Upstream dependency not progressing
- Owner capacity constraints
- Technical issues requiring escalation
- Misaligned priorities

**Action:** Review blocker status weekly; unblock or reprioritize.

### Gaps Without Owners

**Unassigned Gaps:** [UNASSIGNED_COUNT]

These gaps lack a designated owner and may stall:

| Gap ID | Repo | Priority | Status |
|--------|------|----------|--------|
| [UNASSIGNED_TABLE] |

**Action:** Assign an owner within 2 business days or reprioritize to P4/Archive.

### Stalled Gaps (No Update > 21 Days)

**Stalled Count:** [STALLED_COUNT]

| Gap ID | Repo | Status | Last Update | Owner |
|--------|------|--------|-------------|-------|
| [STALLED_TABLE] |

**Action:** Contact owner for status update; if no response in 2 days, escalate to sprint lead.

---

## Repository Health Scorecard

| Repo | Gaps | Completed | % | P0 | P1 | Blocked | Stalled | Health |
|------|------|-----------|---|----|----|---------|---------|--------|
| [REPO_SCORECARD] |

**Legend:**
- 🟢 Green (Excellent) — >70% completion, no blocked P0/P1, <2 stalled
- 🟡 Yellow (Good) — 50-70% completion, P0/P1 in progress
- 🟠 Orange (At Risk) — 30-50% completion, blocked gaps, aged gaps
- 🔴 Red (Critical) — <30% completion, overdue P0/P1, escalation needed

---

## Historical Trend Data

**7-Day Trend Chart (Completion %)**

```
100% │
     │
 80% │         ╱─────╲
     │        ╱       ╲
 60% │───────╱─────────╲──────
     │      ╱           ╲
 40% │────╱───────────────╲────
     │   ╱                 ╲
 20% │──╱─────────────────────
     │
  0% └────────────────────────
     Mon Tue Wed Thu Fri Sat Sun
```

**Weekly Completion Velocity**

- **Week of Apr 28** — [WEEK_28_COMPLETED] gaps completed
- **Week of Apr 21** — [WEEK_21_COMPLETED] gaps completed
- **Week of Apr 14** — [WEEK_14_COMPLETED] gaps completed
- **Moving Average (4 week)** — [MOVING_AVG] gaps/week

---

## Compliance Indicators

### Audit Trail Status

- **Ledger Events This Week** — [LEDGER_EVENTS]
- **Gap Status Changes** — [STATUS_CHANGES]
- **PR Links Created** — [PR_LINKS]
- **Gaps Completed** — [GAPS_COMPLETED_THIS_WEEK]

**Ledger Integrity:** ✅ All events cryptographically signed and audit-ready

### Regulatory Readiness

| Aspect | Status | Notes |
|--------|--------|-------|
| **Gap Coverage** | [STATUS] | All repos with gap analysis? |
| **Ledger Audit Trail** | [STATUS] | All changes logged? |
| **Owner Accountability** | [STATUS] | All P0/P1 assigned? |
| **Traceability** | [STATUS] | PRs linked to gaps? |
| **Residual Risk** | [STATUS] | Are risk assessments current? |

---

## How to Use This Report

1. **Daily Check** (5 min) — Review P0 gaps and overdue dates
2. **Weekly Review** (30 min) — Check trends, unblock stalled gaps, reassign as needed
3. **Sprint Planning** — Use completion % by repo to plan work
4. **Escalation** — P0 overdue or blocked gaps → notify sprint leads
5. **Retrospective** — Use trend data to estimate velocity and runway

---

## Links & Resources

- **Gap Analysis System:** [`.gap-analysis/README.md`](.gap-analysis/README.md)
- **Full Dashboard:** [Gap Analysis Dashboard](./gap-analysis-dashboard.md)
- **Live Dashboard Issue:** [📊 Gap Analysis Dashboard](../../issues) (pinned)
- **Workflow Definition:** [`.github/workflows/gap-dashboard.yml`](.github/workflows/gap-dashboard.yml)
- **Export Formats:**
  - JSON — `org-dashboard-gaps.json`
  - CSV — `audit-log/compliance-gaps.csv` (for spreadsheet analysis)
  - Markdown — `audit-log/compliance-report.md`

---

## Feedback & Questions

- **Report Issues** — Open an issue tagged `gap-analysis` in this repo
- **Escalations** — Mention @timothyhartzog for P0/P1 issues
- **Suggestions** — Use Discussions in the `.github` repo

**Last Generated:** 2026-05-04 07:15 UTC by GitHub Actions
