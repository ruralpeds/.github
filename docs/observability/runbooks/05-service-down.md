# Runbook: Service Down / Unavailable

**Alert:** `FhirGatewayAvailabilityCritical`, `AuditLogWriterDown`, and equivalents
**Severity:** Critical (P1)
**Regulatory alignment:** IEC 62304 §8.2, HIPAA § 164.308(a)(7), NIST SP 800-53 CP-10

---

## Trigger Condition

Critical-level availability alert fired — the service is returning ≥ ~1.4% errors
(fhir-gateway) or any errors (audit-log-writer), sustained for ≥ 2 minutes.

---

## Immediate Actions (< 3 min)

```bash
# 1. Check pod status
kubectl get pods -n prod -l app=<service> --sort-by='.status.startTime'

# 2. Check recent events
kubectl get events -n prod --field-selector involvedObject.name=<pod-name> \
  --sort-by='.lastTimestamp' | tail -20

# 3. Check pod logs for crash reason
kubectl logs -n prod deploy/<service> --previous --tail=50 | \
  grep -E '"level":"(ERROR|FATAL)"' | jq '{event,error,trace_id}'

# 4. Check node health
kubectl get nodes -o wide
kubectl describe node <node-name> | grep -A5 "Conditions:"
```

## Decision Tree

```
Service returning 5xx / not responding
│
├── Pods in CrashLoopBackOff?
│   YES → Check logs (step 3 above); check OOMKilled: kubectl describe pod
│   NO  ─┐
│        ▼
├── Pods Pending?
│   YES → Node pressure? PVC not bound? → kubectl describe pod
│   NO  ─┐
│        ▼
├── Pods Running but unhealthy?
│   YES → Readiness probe failing → kubectl exec and curl /healthz
│   NO  ─┐
│        ▼
└── Pods healthy but ingress failing?
    YES → Check ingress controller / load balancer
```

## Recovery Procedures

### Rollback a bad deploy
```bash
kubectl rollout undo deploy/<service> -n prod
kubectl rollout status deploy/<service> -n prod --timeout=120s
```

### Force pod restart
```bash
kubectl rollout restart deploy/<service> -n prod
```

### Scale up replicas (if traffic surge)
```bash
kubectl scale deploy/<service> -n prod --replicas=6
```

## Special Case: Audit Log Writer Down

If `audit-log-writer` is the affected service:
1. **Immediately** notify compliance officer (HIPAA audit gap risk).
2. Enable fallback local audit buffer if configured: `kubectl set env deploy/fhir-gateway AUDIT_FALLBACK_BUFFER=true`
3. Do NOT restart more than once without investigating — repeated restarts may
   corrupt the Merkle-chain sequence number.
4. After recovery, verify chain integrity:
   ```bash
   python3 scripts/verify_audit_chain.py --from-last-checkpoint
   ```

## Post-Incident

- File postmortem in Linear within 24 h of recovery.
- Tag `p1-incident` and link to Grafana snapshot of the outage window.
- Regulatory note: document incident timeline in DHF if service class ≥ B (IEC 62304).
