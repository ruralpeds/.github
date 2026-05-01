# Runbook: High Error Rate (5xx)

**Alert:** `FhirGatewayAvailabilityWarning` / `*AvailabilityCritical`
**Severity:** Warning → Critical
**Regulatory alignment:** IEC 62304 §8.2, HIPAA § 164.308(a)(6)

---

## Trigger Condition

Error rate is consuming the monthly SLO error budget at an unsustainable burn rate:
- **Warning:** 6× burn rate sustained for 15 min across 6h + 30m windows
- **Critical:** 14.4× burn rate sustained for 2 min across 1h + 5m windows

---

## Diagnosis (< 5 min)

```bash
# 1. Identify which endpoints are failing
kubectl exec -n prod deploy/fhir-gateway -- \
  curl -s localhost:9090/metrics | grep 'http_requests_failed_total'

# 2. Check recent error logs (PHI-redacted)
kubectl logs -n prod deploy/fhir-gateway --since=10m | \
  grep '"level":"ERROR"' | jq '{event,error,trace_id}'

# 3. Check downstream dependencies
kubectl exec -n prod deploy/fhir-gateway -- \
  curl -s localhost:8080/healthz/dependencies | jq .
```

## Common Causes & Fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| 5xx on `/fhir/Patient` only | DB connection pool exhausted | Scale DB pool: `kubectl set env deploy/fhir-gateway DB_POOL_MAX=40` |
| All endpoints returning 503 | Pod OOM-killed | Check `kubectl describe pod`; increase memory limit |
| Auth-related 500s | Upstream OIDC provider down | Check `circuit_breaker_state{dependency="oidc"}` |
| Spike then recovery | Bad deploy | `kubectl rollout undo deploy/fhir-gateway` |

## Escalation

If not resolved within **15 min** of page:
1. Notify on-call clinical engineer via PagerDuty escalation
2. Open P1 incident in Linear
3. Post in `#incidents` Slack channel with trace_id from failing requests
