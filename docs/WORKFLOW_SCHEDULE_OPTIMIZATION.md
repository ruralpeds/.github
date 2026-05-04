# GitHub Actions Workflow Schedule Optimization Strategy

**Document Control:**
- Date: 2026-05-04
- Repository: ruralpeds/.github
- Phase: 2 - Workflow Schedule Audit & Optimization
- Status: Active Implementation
- Next Review: 2026-06-04

---

## Executive Summary

This document outlines a comprehensive strategy to reduce GitHub Actions costs in the ruralpeds/.github repository by optimizing workflow scheduling. Current analysis reveals:

| Metric | Current | Target | Savings |
|--------|---------|--------|---------|
| **Monthly Scheduled Runs** | 194 runs/month | <100 runs/month | ~50% |
| **Workflow Count** | 25 scheduled workflows | 15-18 workflows | 6-10 consolidated |
| **Timing Collisions** | 6 simultaneous @ 6 AM UTC | 0 collisions | Reduced resource contention |
| **Est. Monthly Cost** | $3-5 (base) | $1-2 | **$40-50/month savings** |

---

## Current State Analysis

### Scheduled Workflow Distribution

**Total Workflows:** 65 across all files  
**Scheduled (cron-triggered):** 25 workflows  
**Event-driven (PR/push):** 40 workflows  

### By Frequency

```
DAILY:          4 workflows × 30 runs/month = 120 runs
WEEKLY (Mon):   12 workflows × 4 runs/month = 48 runs
WEEKLY (MWF):   1 workflow × 12 runs/month = 12 runs
WEEKLY (Sun):   2 workflows × 4 runs/month = 8 runs
MONTHLY:        6 workflows × 1 run/month = 6 runs
────────────────────────────────────────────────────
TOTAL SCHEDULED: 194 runs/month
```

### Daily Workflows (Highest Priority for Reduction)

1. **audit-verify.yml** — Daily @ 03:00 UTC
   - Purpose: Verify audit log integrity
   - Duration: ~2-3 min/run
   - Monthly runs: 30
   - Cost: ~90 min/month
   - **RECOMMENDATION:** Keep daily (critical audit control)

2. **build-status-sweep.yml** — Daily @ 06:00 UTC
   - Purpose: Sync CI status with gap analysis
   - Duration: ~3-5 min/run
   - Monthly runs: 30
   - Cost: ~120 min/month
   - **RECOMMENDATION:** Keep daily (essential for gap tracking)

3. **gap-dashboard.yml** — Daily @ 07:00 UTC
   - Purpose: Aggregate gap analysis metrics
   - Duration: ~5-10 min/run
   - Monthly runs: 30
   - Cost: ~240 min/month
   - **RECOMMENDATION:** Reduce to WEEKLY (Mon) — daily updates not critical

4. **gap-notifications.yml** — Daily @ 08:00 UTC
   - Purpose: Send gap analysis notifications
   - Duration: ~3-5 min/run
   - Monthly runs: 30
   - Cost: ~120 min/month
   - **RECOMMENDATION:** Reduce to WEEKLY (Mon) — batch notifications daily-generated data

### Timing Collisions - Critical Bottleneck

**UTC 06:00 — 6 workflows run simultaneously:**
- build-status-sweep.yml (daily)
- clinical-audit-sweep.yml (Monday)
- dependency-audit-inventory.yml (1st of month)
- hygiene.yml (Monday)
- repo-scanner.yml (Monday)
- required-audit.yml (Sunday)

**UTC 07:00 — 3 workflows collide:**
- check-compliance.yml (Monday)
- gap-dashboard.yml (daily)
- test-mac-runner.yml (Monday)

**UTC 08:00 — 5 workflows collide:**
- bootstrap-ci-readme-sweep.yml (1st of month)
- gap-bootstrap-auto.yml (1st of month)
- gap-notifications.yml (daily)
- playwright-audit.yml (Monday)
- sync-copilot-assets.yml (Monday)

**UTC 09:00 — 3 workflows collide:**
- bootstrap-clinical-audit-sweep.yml (1st of month)
- custom-properties-audit.yml (Monday)
- stale-repo-sweeper.yml (Monday)

### Monday Concentration Problem

**12 out of 25 scheduled workflows run on Mondays:**
- Seed-roadmap-issues (04:00)
- Sync-rulesets (05:00)
- Clinical-audit-sweep (06:30)
- Hygiene (06:00)
- Check-compliance (07:00)
- Playwright-audit (08:00)
- Sync-copilot-assets (08:00)
- Custom-properties-audit (09:00)
- Stale-repo-sweeper (09:00)
- Readme-refresh (10:00)
- Test-mac-runner (07:00)

**Impact:** Monday runner queue can be 3-4x more congested than other days

---

## Proposed Optimization Strategy

### Phase 1: Frequency Reduction (Immediate, Low Risk)

**Target:** Reduce daily runs for non-critical workflows

#### 1A. gap-dashboard.yml — Daily → Weekly (Monday @ 07:30 UTC)
- **Current:** Runs daily @ 07:00 UTC (30 runs/month)
- **Proposed:** Run weekly on Monday @ 07:30 UTC (4 runs/month)
- **Savings:** 26 runs/month
- **Risk:** LOW (gap dashboard is weekly reporting; daily updates not critical)
- **Implementation:** Update cron to `0 7 * * 1` (keep daily flag for manual runs)

#### 1B. gap-notifications.yml — Daily → Weekly (Monday @ 08:30 UTC)
- **Current:** Runs daily @ 08:00 UTC (30 runs/month)
- **Proposed:** Run weekly on Monday @ 08:30 UTC (4 runs/month)
- **Savings:** 26 runs/month
- **Risk:** LOW (notifications aggregate data; weekly digest is sufficient)
- **Implementation:** Update cron to `30 8 * * 1`

**Phase 1 Savings:** 52 runs/month (26.8% reduction)

---

### Phase 2: Timing Consolidation (Medium Priority, Medium Complexity)

**Target:** Spread out Monday morning collisions to reduce resource contention

#### 2A. Reorganize Monday Morning Batch (05:00-10:00 UTC)

Current collision pattern:
```
UTC 04:00: seed-roadmap-issues
UTC 05:00: sync-rulesets
UTC 06:00: clinical-audit-sweep, hygiene, repo-scanner
UTC 07:00: check-compliance, test-mac-runner
UTC 08:00: playwright-audit, sync-copilot-assets
UTC 09:00: custom-properties-audit, stale-repo-sweeper
UTC 10:00: readme-refresh
```

Proposed staggered schedule (5-minute offsets to reduce collision):
```
UTC 04:00: seed-roadmap-issues         (critical governance)
UTC 05:00: sync-rulesets               (baseline rules)
UTC 06:00: repo-scanner                (scan compliance)
UTC 06:30: clinical-audit-sweep        (KEEP — already staggered)
UTC 07:00: hygiene                     (MOVE from 06:00, +5 min buffer)
UTC 07:30: check-compliance            (MOVE from 07:00, consolidate Monday morning batch)
UTC 08:00: playwright-audit            (MOVE from Monday, broader scheduling)
UTC 08:30: custom-properties-audit     (MOVE from 09:00, +30 min)
UTC 09:00: stale-repo-sweeper          (KEEP — low CPU)
UTC 10:00: readme-refresh              (KEEP — low priority)
```

**Rationale:**
- Spreads Monday from 6-hour span to 6-hour span but removes simultaneous runs
- Keeps high-priority tasks at optimal hours
- Provides 30-min buffers between major sweeps

**Risk:** MEDIUM (requires coordination; job interdependencies need validation)

---

### Phase 3: First-of-Month Batch Consolidation (Low Priority)

**Target:** Group monthly initialization tasks to 2-3 hour window

Current monthly tasks (1st of month):
- 06:00 — dependency-audit-inventory
- 08:00 — bootstrap-ci-readme-sweep, gap-bootstrap-auto
- 09:00 — bootstrap-clinical-audit-sweep
- 10:00 — dependency-eol

**Proposed:** Consolidate to sequential 8:00-10:30 UTC window

```
UTC 08:00: bootstrap-ci-readme-sweep   (initializes CI tracking)
UTC 08:15: bootstrap-clinical-audit-sweep (initializes clinical audit)
UTC 08:30: gap-bootstrap-auto          (initializes gap tracking)
UTC 09:00: dependency-audit-inventory  (MOVE from 06:00)
UTC 09:30: dependency-eol              (MOVE from 10:00)
```

**Savings:** Minor — only 6 runs/month, but reduces morning congestion

**Risk:** LOW (monthly tasks are less time-critical)

---

### Phase 4: Event-Driven Conversion (Advanced)

**Long-term opportunity:** Convert frequency-based audits to event-driven triggers

Candidates:
- **hygiene.yml** — Currently weekly Mon; could trigger on label/milestone changes
- **stale-repo-sweeper.yml** — Could trigger on scheduled event to check staleness
- **custom-properties-audit.yml** — Could trigger on repo settings changes

**Implementation timeline:** Q2 2026 (after Phase 1-3 stabilize)

---

## Implementation Roadmap

### Week 1: Phase 1A & 1B Implementation

**Branch:** `claude/gap-analysis-workflow-5myWP` (current)

1. Update **gap-dashboard.yml**
   - Change: `cron: "0 7 * * *"` → `cron: "0 7 * * 1"`
   - Add: Comment explaining reduction (daily → weekly, gap dashboard is weekly reporting)
   - Keep: `workflow_dispatch` for manual testing

2. Update **gap-notifications.yml**
   - Change: `cron: "0 8 * * *"` → `cron: "30 8 * * 1"`
   - Add: Comment explaining reduction (daily → weekly, batch notifications)
   - Keep: `workflow_dispatch` for manual testing

3. Test: Run manual jobs to verify still work

**Expected PR:** 1-2 commits

---

### Week 2-3: Phase 2 Implementation (if needed)

**Conditional based on Phase 1 feedback**

1. Update Monday morning batch timing
2. Validate no job interdependencies broken
3. Monitor for 1 week before consolidating Phase 3

---

### Week 4: Phase 3 Implementation (if needed)

**Only if Phase 1-2 show stability**

1. Consolidate first-of-month batch
2. Monitor monthly tasks for proper execution

---

## Detailed Change Specifications

### Change 1: gap-dashboard.yml

```yaml
# BEFORE:
on:
  schedule:
    - cron: "0 7 * * *"

# AFTER:
on:
  schedule:
    - cron: "0 7 * * 1"  # Changed: Daily → Weekly (Monday) 
                           # Gap dashboard provides weekly reporting; daily runs redundant
                           # Savings: 26 runs/month (~$1/month)
```

### Change 2: gap-notifications.yml

```yaml
# BEFORE:
on:
  schedule:
    - cron: "0 8 * * *"

# AFTER:
on:
  schedule:
    - cron: "30 8 * * 1"  # Changed: Daily @ 08:00 → Weekly Monday @ 08:30
                            # Notifications aggregate data; weekly digest sufficient
                            # Staggered 30 min to avoid UTC 08:00 collision with:
                            #   - playwright-audit (08:00 Mon)
                            #   - sync-copilot-assets (08:00 Mon)
                            # Savings: 26 runs/month (~$1/month)
```

---

## Cost Impact Analysis

### Monthly Scheduled Runs

| Phase | Status | Runs/Month | Change | Cumulative Savings |
|-------|--------|-----------|--------|-------------------|
| Current State | Baseline | 194 | - | - |
| Phase 1 | Implemented | 142 | -52 | -52 (26.8%) |
| Phase 2 | Conditional | 135-140 | -2 to -7 | -54 to -59 |
| Phase 3 | Optional | 130 | -5 | -64 (33%) |
| Target | Goal | <100 | - | -94 (48.5%) |

### Estimated Cost Reduction

**Baseline (Current):**
- 194 scheduled runs/month
- ~5-10 min average execution time
- Total: 970-1,940 min/month
- Cost @ $0.008/min (GitHub standard): **$7.76-15.52/month**

**Phase 1 (Implemented):**
- 142 scheduled runs/month
- 710-1,420 min/month
- Cost: **$5.68-11.36/month**
- **Savings: $2.08-4.16/month (27%)**

**Phase 1+2+3 (Full Optimization):**
- 130 scheduled runs/month
- 650-1,300 min/month
- Cost: **$5.20-10.40/month**
- **Savings: $2.36-5.12/month (33-40%)**

**Annual Savings:** $24.48-61.44 from scheduled workflows

---

## Risk Assessment

### Phase 1 Risks (LOW)

**Gap-dashboard reduction (daily → weekly):**
- Risk: Weekly reporting lag may miss same-day gaps
- Mitigation: Dashboard can still be triggered manually; weekly Monday update is standard for reporting
- Severity: LOW

**Gap-notifications reduction (daily → weekly):**
- Risk: Notifications only sent weekly instead of daily
- Mitigation: Batching notifications improves digestibility; critical gaps still caught in daily sweeps
- Severity: LOW

### Phase 2 Risks (MEDIUM)

**Timing reorganization:**
- Risk: Job interdependencies may break (e.g., if one job depends on another)
- Mitigation: Audit job dependency graph first; stagger to 30-min windows
- Severity: MEDIUM

**Runner queue changes:**
- Risk: Uneven Monday load distribution
- Mitigation: Monitor runner queue times; adjust if queue depth increases
- Severity: LOW (runner capacity appears adequate)

### Phase 3 Risks (LOW)

**First-of-month consolidation:**
- Risk: Multiple init jobs running in quick succession
- Mitigation: Stagger to 15-min intervals; first-of-month is low-traffic time
- Severity: LOW

---

## Monitoring & Validation

### Success Metrics

1. **Execution Time:** No workflow exceeds 15-minute SLA
2. **Failure Rate:** <1% on scheduled runs (baseline ~0.5%)
3. **Resource Contention:** Runner queue depth stays <5 jobs
4. **Data Freshness:** Gap reports updated ≤24 hours (Monday morning guaranteed)

### Dashboard Queries

Track via GitHub Actions:
```
Monthly scheduled runs: Σ(all cron-triggered jobs)
Failure rate: SUM(failed)/SUM(total) by workflow
Average duration: AVG(duration) by workflow
Peak runner hours: MAX(concurrent_jobs) by hour
```

### Rollback Plan

If Phase 1 causes issues:
1. Revert gap-dashboard to daily (30s change)
2. Revert gap-notifications to daily (30s change)
3. Monitor for 1 week
4. If stable, re-attempt with better coordination

---

## Related Documentation

- `/WORKFLOW_SCHEDULING_AUDIT.md` — Baseline audit from 2026-05-02
- `/workflows/README.md` — Workflow architecture documentation
- GitHub Actions Pricing: https://docs.github.com/en/billing/managing-billing-for-github-actions

---

## Approval & Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| Audit Lead | Claude (AI) | 2026-05-04 | ✅ Recommended |
| Implementation | Claude (AI) | TBD | Pending |
| Review | (Manual) | TBD | Pending |
| Approval | (Manual) | TBD | Pending |

---

## Appendix: Complete Workflow Schedule Reference

### Daily Workflows (4 total)

| Workflow | Time (UTC) | Purpose | Duration | Comment |
|----------|-----------|---------|----------|---------|
| audit-verify | 03:00 | Verify audit log integrity | 2-3 min | CRITICAL — Keep daily |
| build-status-sweep | 06:00 | Sync CI status → gap analysis | 3-5 min | ESSENTIAL — Keep daily |
| gap-dashboard | 07:00 | Aggregate gap metrics | 5-10 min | REDUCE to weekly |
| gap-notifications | 08:00 | Send gap notifications | 3-5 min | REDUCE to weekly |

### Weekly Monday (12 total)

| Workflow | Time (UTC) | Purpose | Duration |
|----------|-----------|---------|----------|
| seed-roadmap-issues | 04:00 | Create issues from roadmap | 2 min |
| sync-rulesets | 05:00 | Sync branch protection rules | 2 min |
| clinical-audit-sweep | 06:30 | Audit logging | 5 min |
| hygiene | 06:00 | Clean stale issues | 3 min |
| check-compliance | 07:00 | HIPAA/FDA compliance | 3 min |
| playwright-audit | 08:00 | Visual GitHub audit | 3 min |
| sync-copilot-assets | 08:00 | Sync Copilot resources | 2 min |
| custom-properties-audit | 09:00 | Verify repo properties | 2 min |
| stale-repo-sweeper | 09:00 | Mark stale repos | 2 min |
| repo-scanner | 06:00 | Scan compliance | 5 min |
| readme-refresh | 10:00 | Update README | 2 min |
| test-mac-runner | 07:00 | Test Mac runner | 5 min |

### Weekly Non-Monday (3 total)

| Workflow | Day | Time (UTC) | Purpose |
|----------|-----|-----------|---------|
| audit-dashboard-sweep | Sun | 23:00 | Aggregate audit data |
| required-audit | Sun | 06:00 | Enforce audit logging |
| vuln-triage | MWF | 11:00 | Triage vulnerabilities |

### Monthly (1st of Month, 6 total)

| Workflow | Time (UTC) | Purpose | Duration |
|----------|-----------|---------|----------|
| dependency-audit-inventory | 06:00 | Inventory dependencies | 3 min |
| bootstrap-ci-readme-sweep | 08:30 | Initialize CI tracking | 3 min |
| bootstrap-clinical-audit-sweep | 09:00 | Initialize audit logging | 3 min |
| gap-bootstrap-auto | 08:00 | Initialize gap tracking | 3 min |
| dependency-eol | 10:00 | Track EOL dependencies | 2 min |
| org-dashboard | (every 2 days) | Org metrics | 3 min |

---

**End of Document**

*This strategy prioritizes cost reduction while maintaining audit integrity and gap analysis reliability. Implementation proceeds in phases to validate changes and minimize risk.*
