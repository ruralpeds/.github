# Runbook: High Latency (P95 > SLO Threshold)

**Alert:** `FhirGatewayLatencyCritical` (and equivalent per-service alerts)
**Severity:** Critical
**Regulatory alignment:** IEC 62304 §8.2

---

## Trigger Condition

P95 latency exceeds the SLO threshold (500 ms for fhir-gateway) sustained
across both a 5-minute and a 1-hour window.

---

## Diagnosis

```bash
# 1. Identify the slow path (per endpoint breakdown)
# Grafana: RED Metrics dashboard > Duration Percentiles, filter by path

# 2. Pull a slow trace from Jaeger
# Open Jaeger UI → search for service=fhir-gateway, min-duration=500ms

# 3. Check if it's a DB issue
kubectl exec -n prod deploy/fhir-gateway -- \
  curl -s localhost:9090/metrics | grep 'db_query_duration_ms'

# 4. Check bulkhead saturation (could cause queue buildup)
kubectl exec -n prod deploy/fhir-gateway -- \
  curl -s localhost:9090/metrics | grep 'bulkhead_'

# 5. Check GC pressure (tokio blocking threads spike)
kubectl exec -n prod deploy/fhir-gateway -- \
  curl -s localhost:9090/metrics | grep 'tokio_blocking_threads'
```

## Latency Budget Breakdown (expected)

| Component | P95 budget |
|---|---|
| Network (ingress → pod) | < 5 ms |
| Auth middleware (OIDC verify) | < 20 ms |
| DB query | < 100 ms |
| Business logic | < 200 ms |
| Response serialization | < 30 ms |
| **Total** | **< 355 ms** (headroom to 500 ms SLO) |

## Common Fixes

| Root cause | Fix |
|---|---|
| DB query slow (missing index) | Check `EXPLAIN ANALYZE`; add index in a non-blocking migration |
| DB pool contention | Increase `DB_POOL_MAX`; check for long-running transactions |
| Downstream FHIR server slow | Check dependency health; consider increasing circuit breaker timeout |
| Tokio blocking thread pool full | Increase `TOKIO_WORKER_THREADS`; move blocking I/O to `spawn_blocking` |
| Large response payloads | Enable pagination; check `_count` parameter usage |

## Escalation

If P99 > 2 000 ms or patient-facing endpoints are affected → page on-call immediately.
