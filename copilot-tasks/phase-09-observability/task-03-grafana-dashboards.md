
# Phase 9, Task 3: Grafana Dashboards + SLO Alerts

**Objective:** Create dashboards and multi-burn-rate alert rules.

**Duration:** 6 hours (Week 18)

## Acceptance Criteria

- [ ] Service Health dashboard (availability, error budget)
- [ ] RED dashboard (rate, errors, duration)
- [ ] Resource Utilization dashboard (CPU, memory, connections)
- [ ] Dependency Health dashboard (circuit breaker, bulkhead)
- [ ] SLO definitions in slo.yaml (all services)
- [ ] Alert rules: multi-burn-rate (2x/10x)
- [ ] Runbooks for top 5 alerts
- [ ] Alert routing: critical→pagerduty, warning→slack

## Implementation

Grafana JSON templates:
- `docs/grafana/service-health.json`
- `docs/grafana/red-metrics.json`
- `docs/grafana/dependency-health.json`

SLO definition (slo.yaml):
```yaml
service: my-service
slos:
  - name: availability
    objective: 99.9
    window: 30d
    alert_rules:
      - burn_rate: 2.0
        window: 1h
        alert_after: 30m
```

## Output

- Grafana dashboards (4 templates)
- SLO definitions
- Alert rules + routing
- Runbooks (markdown)

