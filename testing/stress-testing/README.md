# Stress Testing Framework: Scalability & Performance Validation

**Purpose:** Validate system scales gracefully under 4× patient load (2,000 patients)  
**Compliance:** IEC 62304 V&V (scalability), FDA 510(k) performance under load  
**Version:** 1.0 (April 25, 2026)

---

## Quick Start

### Run Stress Test

```bash
# Generate 2,000 synthetic patients
cd ../synthea
python3 generate_patients.py 2000 synthetic_patients_2000.json

# Run stress test
cd ../stress-testing
python3 run_stress_test.py ../synthea/synthetic_patients_2000.json stress_results

# Output: Degradation analysis, EKS scaling report, findings
```

---

## Stress Test Objectives

### Primary Goals
1. **Measure performance degradation** under 4× load
2. **Validate EKS auto-scaling** (3 → 5+ nodes)
3. **Verify alert accuracy** remains consistent
4. **Detect resource bottlenecks** (database, memory, CPU)
5. **Establish stress baselines** for future regression testing

### Success Criteria

| Metric | Baseline (500 pts) | Stress Target (2k pts) | Pass Criteria |
|--------|-------------------|----------------------|---------------|
| **Database Insert Rate** | 10,000 events/sec | 5,000 events/sec | ≥4,000 events/sec |
| **API Latency p95** | 200ms | <400ms | <500ms (acceptable) |
| **Alert Latency p95** | 3-5s | <10s | <15s (critical still responsive) |
| **EKS Nodes** | 3 | 5-6 | Auto-scale triggers |
| **Pod Evictions** | 0 | 0 | None (memory sufficient) |
| **Error Rate** | <0.1% | <0.5% | <1% (acceptable) |

---

## Acceptable Degradation Analysis

### Database Performance Degradation

**Expected:** 50% degradation acceptable (10k → 5k events/sec)

```
Why 50% is acceptable:
  - 2,000 patients = 4× load
  - Expected: linear scaling would show 10k/4 = 2.5k events/sec
  - Actual target: 5k events/sec = better than linear scaling
  - Indicates efficient resource utilization
  
Meaning:
  - ✅ 5,000 events/sec = PASS (better than expected)
  - ⚠️  3,000 events/sec = MARGINAL (below acceptable)
  - ❌ 1,000 events/sec = FAIL (severe bottleneck)
```

### API Latency Degradation

**Tolerance:** 2× baseline acceptable (200ms → 400ms p95)

```
Why 2× is acceptable:
  - Under load, latency typically increases linearly with queue depth
  - 4× load → 4× longer queues → 4× latency (worst case)
  - 2× tolerance accounts for:
    * Connection pooling reuse
    * Load balancing across replicas
    * Auto-scaling relief (new nodes added)
    
Meaning:
  - ✅ <400ms = PASS (well scaled)
  - ⚠️  400-600ms = MARGINAL (approaching limits)
  - ❌ >600ms = FAIL (serious scaling issue)
```

### Alert Latency Degradation

**SLA:** Critical alerts must remain responsive (<10s under stress)

```
Why <10s is critical:
  - P1 alerts (hypoglycemia, sepsis) require immediate response
  - 2s baseline → 10s = 5× increase acceptable
  - Beyond 10s = patient safety risk
  
Meaning:
  - ✅ <10s = PASS (responsive)
  - ⚠️  10-15s = MARGINAL (acceptable but concerning)
  - ❌ >15s = FAIL (unsafe delay)
```

---

## Test Scenarios

### Scenario 1: Baseline Established (Week 2)

**Data:** 500 synthetic patients, 336,000 observations

**Metrics:**
```
Database:
  Insert rate: 9,800-10,200 events/sec ✅ PASS
  Latency p95: 0.8-1.0ms
  Duration: ~34 seconds

API:
  Throughput: 98 req/sec
  Latency p95: 195-205ms ✅ PASS
  Error rate: <0.1%

Alerts:
  P1 average: 2-4 seconds ✅ PASS
  Latency p95: 3-5 seconds

System:
  Memory: 8-9GB
  CPU: 30-40%
  Nodes: 3 (stable)
```

### Scenario 2: Stress Test (2,000 patients)

**Data:** 2,000 synthetic patients, 1,344,000 observations (4× baseline)

**Expected Metrics:**
```
Database:
  Insert rate: 4,500-5,500 events/sec ✅ PASS (50% degradation acceptable)
  Latency p95: 1.5-2.0ms (2× acceptable due to higher contention)
  Duration: ~4-5 minutes

API:
  Throughput: 80-90 req/sec (slightly degraded)
  Latency p95: 300-400ms ✅ PASS (2× tolerance acceptable)
  Error rate: <0.5%

Alerts:
  P1 average: 5-8 seconds ✅ PASS (still responsive)
  Latency p95: 8-10 seconds (acceptable)

EKS:
  Initial nodes: 3
  Final nodes: 5-6 (auto-scaled) ✅ PASS
  Pod evictions: 0 (memory sufficient)

System:
  Memory: 14-18GB (distributed across more nodes)
  CPU: 60-80% (healthy utilization)
```

---

## EKS Auto-Scaling Validation

### Expected Auto-Scaling Behavior

```
Time 0:00 - Load test starts
  Nodes: 3 (t3.2xlarge each = 8 vCPU, 32GB RAM)
  Pods: 3 replicas platform-api
  CPU: 0% (idle)

Time 1:00 - Load ramps up
  CPU: 35-50% (approaching HPA threshold of 70%)
  Latency: 200-250ms
  Nodes: 3 (stable, CPU not yet at threshold)

Time 2:00 - High load sustained
  CPU: 65-75% (exceeding HPA threshold)
  ⏳ HPA triggers: adds 1-2 replicas
  ⏳ Pods scale: 3 → 5 replicas

Time 3:00 - More pods, but not enough resources
  CPU still 70%+ (new pods added, but same node capacity)
  ⏳ Cluster autoscaler detects: not enough nodes for pending pods
  ⏳ Nodes added: 3 → 5 nodes

Time 4:00 - Nodes added, resources distributed
  CPU: 45-60% (now distributed across 5 nodes)
  Pods: 5 replicas across 5 nodes (1:1 ratio)
  Latency: 300-350ms (improved after scaling)

Time 5:00 - Load test completes
  Nodes: 5 (stable)
  Pods: 5 replicas running
  Success: ✅ Auto-scaling triggered, performance improved
```

### Scaling Metrics to Monitor

```
HPA (Horizontal Pod Autoscaler):
  Current: kubectl get hpa -n platform
  Metrics: kubectl get hpa -n platform -o wide
  Events: kubectl describe hpa platform-api-hpa -n platform

Cluster Autoscaler:
  Logs: kubectl logs -f -n kube-system -l app=cluster-autoscaler
  Events: kubectl get events -n kube-system | grep scaling

Node Status:
  Nodes: kubectl get nodes -o wide
  Capacity: kubectl describe nodes | grep -A 5 "Allocated resources"
  Pressure: kubectl get nodes -o json | jq '.items[].status.conditions'
```

---

## Performance Degradation Analysis

### Database Degradation Calculation

```python
degradation_percent = (baseline_rate - stress_rate) / baseline_rate × 100

Example:
  Baseline: 10,000 events/sec
  Stress: 5,000 events/sec
  Degradation: (10,000 - 5,000) / 10,000 × 100 = 50%
  Assessment: ✅ PASS (within 50% acceptable)

Thresholds:
  ≤50% degradation = ✅ PASS (excellent scaling)
  50-75% degradation = ⚠️  MARGINAL (investigate bottleneck)
  >75% degradation = ❌ FAIL (severe scaling issue)
```

### API Latency Degradation Calculation

```python
degradation_percent = (stress_latency - baseline_latency) / baseline_latency × 100

Example:
  Baseline p95: 200ms
  Stress p95: 350ms
  Degradation: (350 - 200) / 200 × 100 = 75%
  Assessment: ✅ PASS (within 100% acceptable)

Thresholds:
  ≤100% increase = ✅ PASS (acceptable under 4× load)
  100-150% increase = ⚠️  MARGINAL (approaching limits)
  >150% increase = ❌ FAIL (severe performance issue)
```

### Alert Latency Validation

```python
p95_latency_seconds ≤ target_sla_seconds

Example - Hypoglycemia Alert:
  Baseline p95: 2.5 seconds
  Stress p95: 7.8 seconds
  SLA: <60 seconds (critical alert)
  Assessment: ✅ PASS (well within SLA)

SLA Thresholds:
  P1 Critical: <60 seconds
  P2 High: <180 seconds
  P3 Medium: <300 seconds
```

---

## Resource Bottleneck Detection

### Database CPU Bottleneck

**Indicators:**
```
- Insert rate hits ceiling at ~5-6k events/sec
- Does not improve with more API replicas
- CPU on RDS = 85-95% sustained
- Disk I/O = 5-10k IOPS (max: 3000 IOPS configured)
```

**Root Cause:** RDS instance class or IOPS too small

**Solution:** Upgrade RDS instance or add read replicas

### API Memory Bottleneck

**Indicators:**
```
- Pod OOMKilled (out of memory)
- Pod evictions in kubectl get events
- Memory request/limit insufficient
```

**Root Cause:** Container memory limit too small

**Solution:** Increase pod memory request/limit

### EKS Node Capacity Bottleneck

**Indicators:**
```
- Pods in Pending state (not scheduled)
- kubectl describe pod shows "Insufficient cpu/memory"
- Cluster autoscaler logs show "cannot add nodes" (quota exceeded)
```

**Root Cause:** Max node count reached or AWS quota exceeded

**Solution:** Increase max node count or request AWS quota increase

---

## Stress Test Execution

### Step 1: Pre-Test Checks

```bash
# Verify baseline metrics exist
ls performance_baseline.json

# Verify synthetic data generated
ls ../synthea/synthetic_patients_2000.json

# Check EKS cluster health
kubectl get nodes
kubectl get deployment -n platform

# Check database capacity
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT pg_database_size('audit_trail')"
```

### Step 2: Start Monitoring (In separate terminal)

```bash
# Monitor nodes
watch -n 5 'kubectl get nodes -o wide'

# Monitor pods
watch -n 5 'kubectl get pods -n platform -o wide'

# Monitor HPA
watch -n 5 'kubectl get hpa -n platform'

# Monitor metrics
kubectl top nodes
kubectl top pods -n platform
```

### Step 3: Run Stress Test

```bash
# Start test
python3 run_stress_test.py ../synthea/synthetic_patients_2000.json stress_results

# This will:
#   1. Load 1,344,000 events
#   2. Monitor EKS cluster (nodes, pods, evictions)
#   3. Measure insert rate, latency, throughput
#   4. Compare to baseline metrics
#   5. Generate degradation analysis
#   6. Output: stress_test_metrics.json + stress_test_analysis.json
```

### Step 4: Analyze Results

```bash
# View JSON results
cat stress_results/stress_test_analysis.json | jq '.degradation'

# Check EKS scaling
cat stress_results/stress_test_analysis.json | jq '.eks_summary'

# Review findings
cat stress_results/stress_test_analysis.json | jq '.findings'
```

---

## Success Checklist

After stress test completes:

```
✅ Database
  ☐ Insert rate ≥ 4,000 events/sec
  ☐ Latency p95 < 2.5ms
  ☐ No connection pool exhaustion
  ☐ No query timeouts

✅ API
  ☐ Latency p95 < 500ms
  ☐ Error rate < 1%
  ☐ Throughput ≥ 80 req/sec
  ☐ No hanging requests

✅ Alerts
  ☐ P1 alerts < 15 seconds
  ☐ All alert types fire
  ☐ No false positives/negatives increase
  ☐ Detection accuracy maintained

✅ EKS
  ☐ Auto-scaling triggered (3 → 5+ nodes)
  ☐ No pod evictions
  ☐ No out-of-memory errors
  ☐ Pods distributed across new nodes
  ☐ No failed pod scheduling

✅ System
  ☐ Memory usage < 85% on largest node
  ☐ CPU usage 60-80% (healthy utilization)
  ☐ Disk I/O < 8k IOPS
  ☐ Network throughput healthy
```

---

## Troubleshooting

### Insert Rate Too Low (<3,000 events/sec)

```bash
# Check RDS instance class
aws rds describe-db-instances \
  --db-instance-identifier platform-audit-trail-db \
  --query 'DBInstances[0].DBInstanceClass'
# Should be r6i.xlarge or larger

# Check IOPS
aws rds describe-db-instances \
  --db-instance-identifier platform-audit-trail-db \
  --query 'DBInstances[0].Iops'
# Should be 3000+ for stress test

# Check database CPU
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=platform-audit-trail-db \
  --start-time 2026-05-02T00:00:00Z \
  --end-time 2026-05-02T02:00:00Z \
  --period 60 \
  --statistics Maximum

# Solution: Upgrade RDS instance or disable other workloads
```

### Pod Evictions Detected

```bash
# Check pod resources
kubectl describe pod platform-api-0 -n platform | grep -A 5 "Limits\|Requests"

# Check node memory pressure
kubectl describe nodes | grep -A 10 "Pressure"

# Solution: Increase pod memory request/limit or add more nodes
```

### Auto-Scaling Not Triggered

```bash
# Check HPA status
kubectl describe hpa platform-api-hpa -n platform

# Check current CPU utilization
kubectl top pods -n platform

# Check HPA metrics
kubectl get hpa -n platform

# Solution: May need to lower HPA CPU threshold or increase target scale
```

---

## Expected Timeline

```
Week 3: Stress Testing
  Monday: Prepare 2,000 patient dataset
  Tuesday: Run baseline stress test (500 → 2,000)
  Wednesday: EKS scaling validation
  Thursday: Analyze results, identify bottlenecks

Week 4: Optimization & Re-testing
  Monday: Optimize identified bottlenecks
  Tuesday-Wednesday: Re-run stress test (validate improvements)
  Thursday: Final degradation analysis, documentation
```

---

## Next Phase: Week 5-6 (Security Testing)

After stress testing validates scalability, proceed to:
- OWASP Top 10 penetration testing
- API security validation (authentication, authorization, injection)
- Database security hardening (SQL injection, privilege escalation)
- Audit trail tampering tests

---

**Last Updated:** April 25, 2026  
**Next Review:** May 9, 2026  
**Maintained By:** Platform Engineering
