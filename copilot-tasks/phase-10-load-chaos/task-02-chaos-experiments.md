
# Phase 10, Task 2: Chaos Experiments — Resilience Validation

**Objective:** Inject failures and validate service resilience.

**Duration:** 6 hours (Week 19-20)

## Acceptance Criteria

- [ ] Chaos experiments defined: pod-kill, network-latency, network-loss, cpu-stress
- [ ] Experiments deployed to Kubernetes: LitmusChaos or Chaos Mesh
- [ ] Schedule: weekly Sunday 2 AM UTC
- [ ] Runbooks for each failure mode
- [ ] Chaos tests: Pod recovers <60s, SLO margin < 50% consumed
- [ ] Audit events logged for each chaos run
- [ ] Grafana annotations on chaos start/end
- [ ] Post-experiment report: metrics, alerts, recovery time

## Implementation

LitmusChaos experiments:
```yaml
Pod Kill: Terminate pod, verify Kubernetes reschedules
Network Latency: +500ms delay, verify circuit breaker + bulkhead
Network Loss: 10% packet drop, verify retry + timeout
CPU Stress: 80% CPU load, verify load shedding
```

Chaos schedule (weekly):
```yaml
schedule: "0 2 * * 0"  # Sunday 2 AM UTC
```

Runbook template:
```markdown
## Pod Kill Procedure

### Before
- Monitor: availability, error rate, latency
- Baseline: all metrics nominal

### During (60 seconds)
- Inject: Kill primary pod
- Observe: Pod restarting, traffic shifting
- Verify: Kubernetes reschedule < 30s

### After
- Verify: Pod recovered, in service
- Metrics: error rate recovered, latency < baseline + 50ms
- Pass: If SLO error budget < 50% consumed
```

## Output

- Chaos experiments (chaos/*.yaml)
- CronJob schedule
- Runbooks for each failure mode
- Post-experiment analysis
- Audit events recorded

