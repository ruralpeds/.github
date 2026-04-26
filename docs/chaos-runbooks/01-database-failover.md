# Chaos Runbook: Database Failover

**Scenario ID:** S6  
**Added:** Q2 2026  
**Regulatory alignment:** IEC 62304 §7.3, NIST SP 800-53 CP-10

---

## Objective

Verify that the system survives a primary database pod deletion with automatic replica promotion, completing within the 30-second SLO and with zero data loss.

---

## Prerequisites

- Cluster access to the staging namespace (`kubectl` configured)
- Primary/replica DB cluster (PostgreSQL streaming replication or equivalent)
- Prometheus metrics available for `pg_stat_replication` and application health
- PagerDuty or alert receiver configured to catch `DatabasePrimaryDown` alert

---

## Chaos Experiment Steps

### 1. Pre-flight checks (5 min)

```bash
# Verify replica is in sync
kubectl exec -n staging db-primary-0 -- \
  psql -U postgres -c "SELECT client_addr, state, replay_lag FROM pg_stat_replication;"
# Expected: replay_lag = 0

# Verify application is healthy
kubectl get pods -n staging -l app=fhir-service
# Expected: all Running

# Note the current primary pod name
DB_POD=$(kubectl get pod -n staging -l role=primary -o name | head -1)
echo "Primary pod: $DB_POD"
```

### 2. Inject chaos (60s window)

```bash
# Delete the primary pod — replica should auto-promote
kubectl delete pod -n staging "$DB_POD"

# Start timer
START=$(date +%s)
```

### 3. Monitor failover (watch for 120s)

```bash
# Watch pod status
watch -n2 kubectl get pods -n staging -l app=postgres

# Watch application error rate (in separate terminal)
kubectl logs -n staging -l app=fhir-service --since=5m | grep -E "ERROR|connection|reconnect"
```

### 4. Verify recovery

```bash
# Time to failover
END=$(date +%s)
FAILOVER_SEC=$((END - START))
echo "Failover completed in: ${FAILOVER_SEC}s (SLO: <30s)"

# Verify new primary is accepting writes
NEW_PRIMARY=$(kubectl get pod -n staging -l role=primary -o name | head -1)
kubectl exec -n staging "$NEW_PRIMARY" -- psql -U postgres -c "\l"

# Verify no data loss — check WAL LSN continuity
kubectl exec -n staging "$NEW_PRIMARY" -- \
  psql -U postgres -c "SELECT pg_current_wal_lsn();"
```

---

## Expected Behavior (Success)

| Check | Expected | How to verify |
|---|---|---|
| Replica promotes | Within 30s | `kubectl get pods` shows new primary |
| Application reconnects | Within 60s | Health endpoint returns 200 OK |
| No data loss | 0 committed transactions lost | WAL LSN continuous; row counts match |
| Alert fires | Within 60s | PagerDuty or Slack notification received |
| Old primary removed | Pod terminates | `kubectl get pods` no longer shows old pod |

---

## Failure Modes and Remediation

| Failure | Detection | Remediation |
|---|---|---|
| Failover > 30s | Timer exceeds SLO | Tune replica promotion timeout; check replication slot lag |
| Application does not reconnect | Health check stays unhealthy | Verify connection pool retry config (`max_retries`, `retry_delay`) |
| Data loss detected | Row count mismatch | Check WAL level (must be `logical` or `replica`); verify sync replication |
| Alert not fired | No notification within 60s | Check Prometheus `pg_up` metric scrape interval; verify alertmanager routes |

---

## Rollback

If the experiment causes an unrecoverable state:

```bash
# Restore from backup snapshot (last known good state)
kubectl apply -f manifests/staging/db-restore-job.yaml

# Or scale up a fresh replica from the base image
kubectl scale statefulset postgres -n staging --replicas=2
```

---

## Metrics to Collect

| Metric | Source | Target |
|---|---|---|
| Failover duration (s) | Timer between pod delete and new primary ready | < 30s |
| Application error rate during chaos | Prometheus `http_requests_failed_total` | < 5% of normal |
| P99 latency during failover | Prometheus `http_request_duration_seconds` | < 2000ms |
| Data loss (rows) | Pre/post row counts in critical tables | 0 |
| Time to alert | PagerDuty notification timestamp | < 60s |

---

## Post-Experiment Actions

1. Record results in `compliance-metrics/chaos-results-q2-2026.md`
2. If failover > 30s: open issue to tune replication topology
3. If application did not reconnect: open issue to improve connection pool retry logic
4. Update MTBF estimate (+3–5 days projected improvement if SLO met)
