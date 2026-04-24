# Load + Chaos Testing — Performance Baselines & Resilience Validation

**Scope:** Phase 10 (Weeks 19-20) — Load test every service; chaos test distributed dependencies.

**Problem statement:** Code passes unit tests but fails under load. Circuit breakers (Phase 8) only help if you know failure modes. This phase adds:
1. **Load testing** (k6/Locust): Establish performance baselines, detect regressions
2. **Chaos testing** (LitmusChaos/Chaos Mesh): Inject failures systematically
3. **SLO validation**: Verify service meets availability + latency targets under load

---

## Load Testing (k6 / Locust)

### Per-Service Load Test

Every HTTP service must have:

```javascript
// tests/load_test.js (k6)

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
const latency = new Trend('latency_ms');

export const options = {
  stages: [
    { duration: '2m', target: 10 },     // Ramp up
    { duration: '5m', target: 100 },    // Sustain (1.67 RPS per user)
    { duration: '2m', target: 0 },      // Ramp down
  ],
  thresholds: {
    'latency_ms': ['p(95)<500', 'p(99)<1000'],
    'errors': ['rate<0.01'],
  },
};

export default function () {
  group('POST /fhir/Patient (happy path)', function () {
    const payload = JSON.stringify({
      resourceType: 'Patient',
      name: [{ given: ['TestPatient'] }],
    });
    
    const start = new Date().getTime();
    const res = http.post(
      'http://localhost:3000/fhir/Patient',
      payload,
      {
        headers: {
          'Content-Type': 'application/fhir+json',
          'Idempotency-Key': `key-${__VU}-${__ITER}`,
        },
      }
    );
    const elapsed = new Date().getTime() - start;
    
    latency.add(elapsed);
    errorRate.add(res.status >= 400);
    
    check(res, {
      'status is 201 or 200': (r) => [201, 200].includes(r.status),
      'body has id': (r) => JSON.parse(r.body)?.id !== undefined,
      'latency < 500ms': () => elapsed < 500,
    });
  });
  
  group('GET /fhir/Patient/:id (read)', function () {
    const res = http.get('http://localhost:3000/fhir/Patient/pat-123');
    check(res, { 'status 200': (r) => r.status === 200 });
  });
  
  sleep(1);
}
```

### Baseline Creation

```bash
#!/bin/bash
# scripts/establish_load_baseline.sh

SERVICE_NAME=$1
k6 run -o json=load_results.json tests/load_test.js

# Extract metrics
jq -n "$(jq -r '.metrics | to_entries | map({key: .key, value: (.value.values | {min,max,mean,p95,p99})})' load_results.json)" > perf/baseline_${SERVICE_NAME}.json

echo "Baseline saved to perf/baseline_${SERVICE_NAME}.json"
```

### Regression Testing (per-PR)

```bash
#!/bin/bash
# In CI: compare new run to baseline

k6 run tests/load_test.js -o json=current.json
CURRENT_P95=$(jq '.metrics[] | select(.type=="Trend") | .values.p95' current.json | head -1)
BASELINE_P95=$(jq '.latency_ms.values.p95' perf/baseline.json)

if (( $(echo "$CURRENT_P95 > $BASELINE_P95 * 1.1" | bc -l) )); then
    echo "❌ P95 latency regression: $CURRENT_P95ms > $BASELINE_P95ms"
    exit 1
else
    echo "✅ P95 latency OK: $CURRENT_P95ms (baseline: $BASELINE_P95ms)"
fi
```

### Load Test Endpoints

| Service | Endpoint | Load | Duration | Target P95 |
|---------|----------|------|----------|-----------|
| FHIR Gateway | POST /fhir/Patient | 100 RPS | 5 min | 500ms |
| FHIR Gateway | GET /fhir/Patient/:id | 500 RPS | 5 min | 100ms |
| CDS API | POST /cds/evaluate | 50 RPS | 5 min | 1000ms |
| Audit API | POST /audit-events | 200 RPS | 5 min | 50ms |

---

## Chaos Testing (LitmusChaos / Chaos Mesh)

### Chaos Experiments

```yaml
# chaos/pod-kill.yaml (LitmusChaos)

apiVersion: litmuschaos.io/v1alpha1
kind: Experiment
metadata:
  name: fhir-pod-kill
spec:
  definition:
    serviceAccount: litmus
    image: litmuschaos/go-runner:latest
    args:
      - -c
      - ./experiments -name pod-kill
  scheduling:
    minDuration: 60s      # Kill pod, then wait 60s for recovery
  scope:
    appns: default
    applabel: app=fhir-gateway
    appkind: deployment
  appinfo:
    appns: default
    applabel: app=fhir-gateway
    appkind: deployment
  engineState: active
  statusCheckPolicy: Active

---

# chaos/network-latency.yaml (Chaos Mesh)

apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: fhir-network-latency
spec:
  action: delay
  mode: all
  selector:
    namespaces:
      - default
    labelSelectors:
      app: fhir-gateway
  delay:
    latency: "500ms"      # Add 500ms latency to all outbound traffic
    jitter: "100ms"
  duration: 5m
  scheduler:
    cron: "0 2 * * 0"     # Run Sunday 2 AM UTC

---

# chaos/network-loss.yaml

apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: fhir-packet-loss
spec:
  action: loss
  mode: all
  selector:
    namespaces:
      - default
    labelSelectors:
      app: fhir-gateway
  loss:
    loss: "10%"           # Drop 10% of packets
  duration: 5m
  direction: egress       # Only outbound

---

# chaos/stress-cpu.yaml

apiVersion: chaos-mesh.org/v1alpha1
kind: StressChaos
metadata:
  name: fhir-cpu-stress
spec:
  action: stress
  mode: all
  selector:
    namespaces:
      - default
    labelSelectors:
      app: fhir-gateway
  stressors:
    cpu:
      workers: 2
      load: 80             # 80% CPU for 10 minutes
  duration: 10m
```

### Chaos Schedule

```yaml
# chaos/chaos-schedule.yaml (Weekly schedule)

apiVersion: batch/v1
kind: CronJob
metadata:
  name: chaos-tests
spec:
  schedule: "0 2 * * 0"   # Sunday 2 AM UTC
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccount: chaos-operator
          containers:
            - name: chaos-runner
              image: chaos-runner:latest
              command:
                - ./run-chaos-suite.sh
              env:
                - name: CHAOS_NAMESPACE
                  value: default
                - name: SERVICES_TO_TEST
                  value: "fhir-gateway,cds-api,audit-service"
          restartPolicy: OnFailure
```

### Chaos Test Procedures

**1. Pod Kill Test**
```
Before: Pod running, healthy, no errors
Inject: Kill pod
Observe:
  - Kubernetes reschedules pod (should be <60s)
  - Service continues accepting requests (other pods)
  - Error rate spikes then recovers
After: Pod recovered, requests processed normally
Pass: If error rate < 5% total
```

**2. Network Latency Test**
```
Before: P95 latency = 100ms
Inject: +500ms latency to all outbound calls
Observe:
  - Circuit breaker may open (timeout threshold)
  - Bulkhead may accumulate queue
  - SLO margin consumed
After: Latency returns to 100ms
Pass: If SLO error budget < 50% consumed
```

**3. Network Loss Test**
```
Before: 0% packet loss
Inject: 10% packet loss on all egress
Observe:
  - TCP retries on lost packets
  - Downstream timeouts possible
  - Retry logic engages
After: Loss removed
Pass: If P99 latency remains < 1000ms
```

---

## Observability During Load/Chaos

Every test run emits an audit event:

```json
{
  "event_type": "load_test_started",
  "test_name": "fhir-gateway-load-100rps",
  "timestamp": "2026-04-24T02:00:00Z",
  "parameters": {
    "target_load": "100 RPS",
    "duration_minutes": 5,
    "stage_1": "1-100 users over 2 min"
  }
}
```

Grafana annotation on start/end:
```
2026-04-24 02:00 - 02:10: Load test running (100 RPS)
```

---

## Regulatory Alignment

- **IEC 62304 §7.3:** Load testing demonstrates reliability under stress
- **FDA:** Performance validated for intended use (e.g., 100 concurrent users)
- **HIPAA:** Availability requirement: test recovery from failures
- **ONC Certification:** Performance testing required for certified health IT

---

## Deliverables (Phase 10)

- [ ] Load test script (k6 or Locust) for each service
- [ ] Performance baseline: `perf/baseline_*.json` (P50, P95, P99, error rate)
- [ ] Regression test: PR fails if P95 regresses >10%
- [ ] Chaos experiments: pod-kill, network-latency, network-loss, cpu-stress
- [ ] Chaos schedule: weekly runs on Sunday 2 AM UTC
- [ ] Chaos runbooks: procedures for each failure injection
- [ ] SLO compliance report: service meets targets under load
- [ ] Documentation: load/chaos procedures for next engineer

