# Compliance Metrics & Scorecard — Quarterly Review

**Scope:** Phase 12 (Weeks 23-24) — Aggregate metrics across all repos, compliance scorecard, DORA metrics, quarterly review meeting.

**Goal:** Dashboard showing regulatory compliance status, security posture, and SLO performance for all clinical services.

---

## Metrics Dashboard

Weekly job aggregates metrics via GitHub API + GHAS + artifact analysis:

### 1. Compliance Score (per repo)

```python
compliance_score = (
    (signed_commits_pct * 0.15) +
    (codeql_pass_pct * 0.10) +
    (sbom_present * 0.10) +
    (provenance_present * 0.10) +
    (phi_scan_pass_pct * 0.10) +
    (coverage_pct / 100 * 0.15) +
    (mutation_kill_rate_pct / 100 * 0.10) +
    (audit_completeness_pct * 0.10) +
    (iec62304_traceability_pct / 100 * 0.10)
) * 100
```

### 2. OpenSSF Scorecard

Per-repo Scorecard score (0-100). Repos with criticality=clinical-decision must have ≥ 7.0.

### 3. DORA Metrics

```yaml
Deployment Frequency:
  target: ≥ 1 per week (clinical-support tier)
  measurement: releases per month
  
Lead Time for Change:
  target: ≤ 7 days (PR merge to production)
  measurement: median time from PR opened to deployed
  
Change Failure Rate:
  target: ≤ 15% (rollbacks + hotfixes / all releases)
  measurement: percentage of releases requiring rollback
  
Time to Restore:
  target: ≤ 2 hours (MTTF - Mean Time To First Fix)
  measurement: median time from incident to resolution
```

### 4. Vulnerability Posture

```yaml
Open CVEs:
  by severity: critical (0 tolerance), high (≤ 5), medium (≤ 20)
  MTTR: mean time to remediate (target: <30 days for critical)
  
SBOM Staleness:
  target: regenerated on every release
  measurement: days since last SBOM update
  
VEX Coverage:
  target: 100% of CVEs in SBOM have VEX statement
  measurement: percentage with (not_affected | affected | fixed)
```

### 5. Test Quality

```yaml
Code Coverage:
  by class: Class A (70%), Class B (85%), Class C (95%)
  
Mutation Kill Rate:
  by class: Class A (0%), Class B (70%), Class C (85%)
  
Test Count:
  per endpoint: ≥ 3 tests per endpoint (happy path, error, edge case)
  
Test Execution Time:
  target: unit tests < 5 min, integration < 15 min
```

### 6. SLO Compliance (per service)

```yaml
Availability:
  target: 99.9% (3 nines)
  measurement: % of time service responded without 5xx
  
Latency P95:
  target: ≤ 500ms (FHIR), ≤ 1s (CDS)
  measurement: 95th percentile response time
  
Error Rate:
  target: < 1%
  measurement: failed requests / total requests
  
Audit Completeness:
  target: 100%
  measurement: % of expected events logged
```

### 7. Incident Metrics

```yaml
Mean Time Between Failures (MTBF):
  target: ≥ 720 hours (30 days)
  
Mean Time to Detect (MTTD):
  target: < 5 minutes
  
Mean Time to Resolve (MTTR):
  target: < 2 hours
  
Post-Incident Review Rate:
  target: 100% of incidents >= critical
```

---

## Compliance by Classification

Scorecard filtered by repo custom properties:

```markdown
## Clinical-Decision Repos (highest scrutiny)

| Repo | Compliance | Scorecard | SLO Compliance | DORA | Status |
|------|-----------|-----------|---|---|---|
| ruralpeds/PedNeoSim.jl | 92% | 8.2 | 99.95% ✅ | Lead: 3d, MTTR: 1.2h | 🟢 |
| ruralpeds/cds-api | 88% | 7.8 | 99.87% ⚠️ | Lead: 5d, MTTR: 2.5h | 🟡 |

## Class B Repos

| Repo | Coverage | Mutation | IEC62304 | Audit | Status |
|------|----------|----------|----------|-------|--------|
| ruralpeds/growth-chart | 89% ✅ | 71% ✅ | 100% ✅ | 99.9% ✅ | 🟢 |

## Clinical-Support Repos

| Repo | Compliance | Tests | Coverage | Status |
|------|-----------|-------|----------|--------|
| ruralpeds/drug-interactions | 85% ✅ | 450 | 92% ✅ | 🟢 |
```

---

## Quarterly Review Meeting

Every quarter (Jan/Apr/Jul/Oct 24), run 1-hour review:

### Agenda

1. **Compliance Score Trends** (10 min)
   - Moving average: has compliance improved?
   - Outliers: repos below 75%?
   
2. **Incident Review** (15 min)
   - Count: how many incidents this quarter?
   - MTTR trend: are incidents resolved faster?
   - Root causes: what types of failures?
   
3. **SLO Performance** (15 min)
   - Which services missed SLOs?
   - Error budget consumed per service
   - Any correlation with code changes?
   
4. **Security Posture** (10 min)
   - Open critical CVEs? (must be 0)
   - SBOM staleness: any repos stale?
   - Secret scanning: any recent leaks?
   
5. **Action Items** (10 min)
   - Top 3 gaps from previous quarter: resolved?
   - New gaps identified this quarter
   - Assign owners + due dates for Q{N+1}

### Review Document

```markdown
# Q2 2026 Quarterly Compliance Review

**Date:** 2026-04-24  
**Attendees:** Timothy Hartzog  
**Executive Summary:** Compliance improved from 82% (Q1) to 88% (Q2). SLO targets met for all clinical-decision services. One critical incident; MTTR was 45 min.

## Metrics Summary

- Compliance Score: 88% (target: ≥ 85%) ✅
- OpenSSF Scorecard (mean): 7.6 (target: ≥ 7.0) ✅
- SLO Compliance: 99.94% (target: ≥ 99.9%) ✅
- DORA Lead Time: 4 days (trend: improving)
- Critical CVEs: 0 (target: 0) ✅
- Incidents: 2 (1 critical, 1 high)

## Incident Analysis

| Date | Severity | Service | MTTD | MTTR | Root Cause |
|------|----------|---------|------|------|-----------|
| 2026-04-15 | Critical | fhir-gateway | 3 min | 45 min | Circuit breaker misconfigured |
| 2026-04-22 | High | cds-api | 8 min | 1.5h | Database query timeout |

## Action Items

| Item | Owner | Due | Status |
|------|-------|-----|--------|
| Audit circuit breaker config | Timothy | 2026-05-01 | In Progress |
| Add query timeout safeguards | Timothy | 2026-05-08 | Pending |
| Increase FHIR test coverage 85%→95% | Timothy | 2026-05-15 | Pending |

## Regulatory Compliance

- HIPAA: ✅ Audit trail complete, PHI scan passing
- 21 CFR Part 11: ✅ E-signature workflow tested
- IEC 62304: ✅ Class B repo DHF up-to-date
- FDA §524B: ✅ SBOM/VEX current for all releases

## Approvals

- Reviewed by: Timothy Hartzog (operator + compliance officer)
- Approval date: 2026-04-24
- Next review: 2026-07-24
```

---

## Dashboard Implementation

Create `ruralpeds/metrics` repo:

```
metrics/
├── .github/workflows/
│   └── aggregate-metrics.yml
├── scripts/
│   ├── fetch_ghas_results.py
│   ├── compute_compliance_score.py
│   └── generate_dashboard.py
├── docs/
│   └── metrics-schema.md
└── dashboards/
    ├── compliance-scorecard.html
    ├── dora-metrics.html
    └── slo-compliance.html
```

Weekly job:

```yaml
# .github/workflows/aggregate-metrics.yml

name: Aggregate Compliance Metrics

on:
  schedule:
    - cron: '0 3 * * 1'  # Monday 3 AM UTC

jobs:
  aggregate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Fetch GitHub Insights
        run: |
          gh api repos/ruralpeds/metrics/issues \
            --jq '.[] | {repo: .title, coverage, mutation_kill_rate}'
      
      - name: Compute Compliance Scores
        run: python3 scripts/compute_compliance_score.py
      
      - name: Generate Dashboards
        run: python3 scripts/generate_dashboard.py
      
      - name: Publish to GitHub Pages
        run: |
          cp dashboards/*.html docs/
          git add docs/
          git commit -m "chore: update compliance dashboards (weekly)"
          git push
```

---

## Deliverables (Phase 12)

- [ ] Compliance scorecard (all repos, classifications)
- [ ] OpenSSF Scorecard tracking (per repo, trending)
- [ ] DORA metrics dashboard (deployment frequency, lead time, MTTR)
- [ ] SLO compliance dashboard (per service, error budget)
- [ ] Incident metrics (MTTD, MTTR, count, trends)
- [ ] Quarterly review template + first review (Q2 2026)
- [ ] GitHub Pages dashboard: `ruralpeds.github.io/metrics/`
- [ ] Roadmap for Year 2 (Phases 13-24)

---

## Regulatory Alignment

- HIPAA §164.308(a)(5)(ii)(C): Risk assessment quarterly
- 21 CFR Part 11: Audit trail completeness
- IEC 62304: Design review every 3-4 months
- FDA: Post-market surveillance + trending

