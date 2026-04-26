# Chaos Runbook: Message Queue Backpressure

**Scenario ID:** S7  
**Added:** Q2 2026  
**Regulatory alignment:** IEC 62304 §7.3, NIST SP 800-53 SI-17

---

## Objective

Verify that the system handles a slow consumer (queue fills to 90% capacity) without dropping messages, and that producer backpressure, alerting, and automatic recovery all function correctly.

---

## Prerequisites

- Cluster access to the staging namespace
- Message queue deployed (RabbitMQ, Kafka, or NATS — adjust commands accordingly)
- Prometheus `rabbitmq_queue_messages_ready` (or equivalent) scraped
- Alert rule `QueueDepth70Pct` configured and routed to Slack #ops-alerts
- Consumer service can be network-throttled via Chaos Mesh `PodNetworkChaos`

---

## Chaos Experiment Steps

### 1. Pre-flight checks (5 min)

```bash
# Verify queue is healthy and empty
kubectl exec -n staging svc/rabbitmq -- \
  rabbitmqctl list_queues name messages consumers
# Expected: messages ~0, consumers >= 1

# Record baseline consumer throughput
kubectl top pod -n staging -l app=queue-consumer
# Note CPU/memory baseline

# Verify alert rule is active
curl -s http://prometheus:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name=="QueueDepth70Pct")'
```

### 2. Throttle consumer (network bandwidth injection)

```bash
# Apply Chaos Mesh bandwidth throttle — limit consumer to 10% normal throughput
cat <<EOF | kubectl apply -f -
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: queue-consumer-throttle
  namespace: staging
spec:
  action: bandwidth
  mode: one
  selector:
    namespaces: [staging]
    labelSelectors:
      app: queue-consumer
  bandwidth:
    rate: "10kbps"
    limit: 100
    buffer: 10000
  duration: "10m"
EOF

START=$(date +%s)
echo "Consumer throttled at $(date -u)"
```

### 3. Monitor queue depth (every 30s for 10 min)

```bash
while true; do
  DEPTH=$(kubectl exec -n staging svc/rabbitmq -- \
    rabbitmqctl list_queues messages --quiet 2>/dev/null | head -1)
  echo "$(date -u): queue depth = $DEPTH messages"
  [ "$DEPTH" -ge "90" ] && echo ">>> 90% threshold reached" && break
  sleep 30
done
```

### 4. Verify producer backpressure at 90%

```bash
# Check producer logs for backpressure/retry behavior
kubectl logs -n staging -l app=queue-producer --since=15m | \
  grep -E "backpressure|retry|WARN|queue_full"
# Expected: lines showing exponential backoff, NOT "message dropped"

# Check for dropped messages
kubectl exec -n staging svc/rabbitmq -- \
  rabbitmqctl list_queues name messages_unacknowledged messages_ready
# messages_ready should not exceed queue max; no nacked/dropped
```

### 5. Remove throttle and verify recovery

```bash
kubectl delete networkchaos queue-consumer-throttle -n staging

# Watch queue drain
watch -n5 'kubectl exec -n staging svc/rabbitmq -- rabbitmqctl list_queues name messages'
# Expected: messages decreases back to 0 within 5 minutes

END=$(date +%s)
echo "Experiment duration: $((END - START))s"
```

---

## Expected Behavior (Success)

| Check | Expected | How to verify |
|---|---|---|
| No messages dropped | 0 drops at 90% depth | `rabbitmqctl list_queues messages_unacknowledged` = 0 drops |
| Alert fires at 70% | Notification in #ops-alerts ≤ 60s after threshold | Slack message timestamp |
| Producer retries | Exponential backoff in logs | Grep producer logs for `backpressure` or `retry` |
| Queue drains post-recovery | 0 messages within 5 min of throttle removed | `rabbitmqctl list_queues messages` → 0 |
| No phantom consumers | All messages processed exactly once | Pre/post message count comparison |

---

## Failure Modes and Remediation

| Failure | Detection | Remediation |
|---|---|---|
| Messages dropped at 90% depth | `messages_unacknowledged` grows; producer sees `NACK` | Enable publisher confirms; set `x-max-length` with `reject-publish` overflow policy |
| Alert does not fire | No Slack notification within 2 min of 70% | Check Prometheus scrape interval; verify alertmanager webhook |
| Producer does not back off | Log shows rapid publish even at 90% | Add queue depth check in producer loop; implement `basic.return` handler |
| Queue does not drain | Depth stays > 50% after 10 min | Scale out consumer; check consumer exception loop |

---

## Rollback

If the experiment leaves the queue in a bad state:

```bash
# Remove throttle immediately
kubectl delete networkchaos queue-consumer-throttle -n staging 2>/dev/null || true

# If queue is stuck, purge non-critical messages
kubectl exec -n staging svc/rabbitmq -- rabbitmqctl purge_queue staging-events
# WARNING: only do this if messages are safe to drop (e.g., metrics, non-clinical)
```

---

## Metrics to Collect

| Metric | Source | Target |
|---|---|---|
| Messages dropped | `rabbitmq_queue_messages_dead` delta | 0 |
| Max queue depth reached | Prometheus `rabbitmq_queue_messages_ready` | < 95% capacity |
| Time to 70% alert | Slack notification vs. threshold crossing | < 60s |
| Time to drain after recovery | Prometheus queue depth | < 5 min |
| Producer retry attempts | Application logs | > 0 (proves backpressure active) |

---

## Post-Experiment Actions

1. Record results in `compliance-metrics/chaos-results-q2-2026.md`
2. If messages dropped: open issue to harden producer with publisher confirms
3. If alert did not fire: fix Prometheus scrape or alertmanager route
4. Update MTBF estimate (+2–3 days projected improvement if SLO met)
