# Runbook: SLO Error Budget < 10%

**Alert:** `SloBudgetBurnRateHigh`
**Severity:** Warning
**Regulatory alignment:** IEC 62304 §8.2, NIST SP 800-53 SI-12

---

## Trigger Condition

Less than 10% of the 30-day rolling error budget remains for a service SLO.
This alert fires before Critical-level alerts — it is an early warning to
investigate and stabilize before the budget exhausts completely.

---

## Diagnosis

```bash
# 1. Identify which SLO is burning
# (Query Prometheus or check the Grafana service-health dashboard)
# Filter: slo_error_budget_remaining_ratio{service=~".*"} < 0.10

# 2. Pull error budget timeline for the past 7 days
# Grafana: Dashboards > Service Health > Error Budget panel, set range to 7d

# 3. Correlate with deploys
kubectl rollout history deploy -n prod
```

## Decision Tree

```
Budget < 10%
│
├── Is the burn happening NOW (current error rate elevated)?
│   YES → Follow runbook 01-high-error-rate.md
│   NO  → Budget was consumed over the past week(s) — investigate historical incident(s)
│
├── Has a recent deploy correlated with the burn?
│   YES → Consider rollback or hotfix; open postmortem
│   NO  → Examine dependency health (runbook 03-circuit-breaker-open.md)
│
└── Is the SLO objective realistic?
    → If traffic pattern changed permanently, schedule SLO review in next sprint
```

## Recovery Actions

1. Identify and fix the root cause of errors (see runbook 01).
2. If budget is < 5%, **freeze non-critical deploys** for the remainder of the window.
3. Open a postmortem ticket in Linear tagged `slo-breach`.
4. Review SLO objective at next monthly compliance review (see `docs/metrics/COMPLIANCE_METRICS.md`).

## Escalation

Budget < 5% → page on-call SRE immediately.
