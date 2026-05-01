# Runbook: Circuit Breaker Open

**Alert:** `CircuitBreakerOpen`
**Severity:** Warning
**Regulatory alignment:** IEC 62304 §8.2, NIST SP 800-53 SC-5

---

## Trigger Condition

A `sci-resilience` circuit breaker has been in the `open` state for > 1 minute.
When open, all calls to the protected dependency are rejected immediately (fail-fast),
and callers receive a `CircuitBreakerError` rather than waiting for a timeout.

## State Machine Reference

```
Closed ──(failure threshold exceeded)──► Open
  ▲                                        │
  │                                        │ (half-open probe timer)
  └──(probe succeeds)── Half-Open ◄────────┘
                             │
                             └──(probe fails)──► Open
```

## Diagnosis

```bash
# 1. Which service/dependency is affected?
# Alert label: service=X, dependency=Y

# 2. Check if the dependency is actually down
kubectl exec -n prod deploy/<service> -- \
  curl -sv <dependency-health-url>/healthz 2>&1 | tail -5

# 3. Check circuit breaker metrics
# Grafana: Dependency Health dashboard > Circuit Breaker States panel

# 4. Check recent trips
kubectl exec -n prod deploy/<service> -- \
  curl -s localhost:9090/metrics | grep circuit_breaker_trips_total
```

## Common Causes

| Dependency | Common cause |
|---|---|
| Database | Connection pool exhausted, DB failover in progress |
| OIDC provider | Token endpoint timeout; certificate expiry |
| External FHIR server | Rate limiting, planned maintenance |
| Audit log writer | Disk pressure on audit volume |

## Resolution

1. **If dependency is genuinely down:** Wait for it to recover. The circuit breaker
   will automatically probe with a half-open request after the `half_open_timeout`
   (default: 30 s). Do not force-reset unless instructed.

2. **If dependency is healthy but breaker is stuck open:**
   ```bash
   # Force reset via admin endpoint (requires ADMIN_TOKEN)
   kubectl exec -n prod deploy/<service> -- \
     curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
     localhost:8080/admin/circuit-breaker/<dependency>/reset
   ```

3. **If this is a false positive** (dependency healthy, error threshold too low):
   File a ticket to adjust `failure_threshold` or `timeout` in the `RetryPolicy` config.

## Escalation

Open circuit breaker affecting `audit-log-writer` → escalate immediately (HIPAA audit continuity risk).
