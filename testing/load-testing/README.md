# Load Testing Framework: Performance Validation

**Purpose:** Measure system performance and validate FDA-required SLAs  
**Compliance:** IEC 62304 V&V, FDA 510(k) clinical safety, CFR Part 11 audit controls  
**Version:** 1.0 (April 25, 2026)

---

## Quick Start

### 1. Run Baseline Load Test

```bash
# Generate synthetic patients (if not already done)
cd ../synthea
python3 generate_patients.py 500 synthetic_patients.json

# Move to load-testing directory and run
cd ../load-testing
python3 run_load_test.py ../synthea/synthetic_patients.json load_test_results

# Output: JSON + HTML performance reports
```

### 2. Measure Alert Latencies

```bash
# Measure time from observation → alert firing
python3 measure_alert_latency.py http://localhost:8080 [api_key]

# Output: alert_latency_report.md with P1/P2/P3 SLA analysis
```

### 3. Compare to Baseline

```bash
# Run automated regression testing
./compare_performance_baseline.sh

# Output: Flags regressions >10% database or >20% API latency
```

---

## Performance SLAs

### Database Performance

| Metric | Baseline (500 pts) | Stress (2k pts) | Target |
|--------|-------------------|-----------------|--------|
| Insert rate | 10,000 events/sec | 5,000 events/sec | ≥ target |
| Insert latency p95 | <1ms | <2ms | <5ms |
| Query latency p95 | <10ms | <50ms | <100ms |
| Disk I/O | <1k IOPS | <5k IOPS | <10k IOPS |

### API Performance (3-node EKS)

| Metric | Target | Pass Criteria |
|--------|--------|---------------|
| POST /fhir/Observation latency p95 | <200ms | <250ms |
| POST /fhir/Observation throughput | 100 req/sec | ≥80 req/sec |
| GET latency p95 | <50ms | <75ms |
| Error rate | <0.1% | <1% |

### Alert Performance

| Alert Severity | SLA | Target | Pass Criteria |
|----------------|-----|--------|---------------|
| **P1 Critical** | 60s | hypoglycemia, sepsis, respiratory failure | ≤ 80s (133% tolerance) |
| **P2 High** | 180s | hypertension, arrhythmia, high memory | ≤ 240s (133% tolerance) |
| **P3 Medium** | 300s | elevated HR, mild hypoxemia | ≤ 400s (133% tolerance) |

---

## Baseline Performance Targets

### Week 1 Baseline (Synthetic Data)

```
Database Insert Performance:
  - Patients: 500
  - Observations: 336,000
  - Total events: 336,500
  - Expected insert rate: 10,000 events/sec
  - Expected duration: ~34 seconds
  - Total event load: ~168M events (if scaled to 5,000 patients)

API Performance (Live System):
  - Throughput: 100 POST requests/sec
  - Latency (p95): 200ms
  - Latency (p99): 300ms
  - Error rate: <0.1%

Alert Performance:
  - Hypoglycemia: <5 seconds (critical)
  - Sepsis: <5 seconds (critical)
  - Severe hypertension: <10 seconds (critical)
  - Non-critical: <20 seconds
```

---

## Test Scenarios

### Baseline Test (500 Patients)

**Setup:**
- 500 synthetic patients
- 7 days of vital observations (every 15 minutes)
- 336,000 total observations
- PostgreSQL with RDS r6i.xlarge (4 vCPU, 32GB RAM)
- EKS 3-node cluster (t3.2xlarge each)

**Execution:**
```bash
python3 run_load_test.py ../synthea/synthetic_patients.json load_test_results
```

**Metrics Collected:**
- Database insert rate (events/sec)
- Insert latency percentiles (p50, p95, p99)
- API request latency percentiles
- API throughput (requests/sec)
- Alert firing latency
- System memory usage
- CPU utilization
- Disk I/O

**Success Criteria:**
```
✅ Database insert rate ≥ 8,000 events/sec (80% of target)
✅ API latency p95 < 250ms (125% of target)
✅ Alert latency p95 < 10 seconds (critical alerts)
✅ No database errors
✅ No API timeouts
```

### Stress Test (2,000 Patients)

**Setup:**
- 4× baseline: 2,000 synthetic patients
- 1,344,000 total observations
- Same EKS cluster (may auto-scale)

**Expected Results:**
```
Database:
  - Insert rate: ~5,000 events/sec (degraded, but acceptable)
  - Insert latency p95: <2ms (slightly increased)
  - Duration: ~4.5 minutes

API:
  - Latency p95: 300-400ms (degraded)
  - Throughput: 80-90 req/sec (degraded)
  - EKS should auto-scale (add nodes if CPU >70%)
```

### Alert Accuracy Test

**Scenarios:**
1. **Hypoglycemia**: 10 patients with glucose <40 mg/dL
2. **Hyperglycemia**: 10 patients with glucose >350 mg/dL
3. **Sepsis**: 5 patients with SIRS criteria + fever
4. **Respiratory Failure**: 5 patients with SpO2 <85%
5. **False Negatives**: Glucose 38 but no alert → measures sensitivity
6. **False Positives**: Glucose 68 but alert fires → measures specificity

**Metrics:**
```
Sensitivity = TP / (TP + FN)        # Detection rate
Specificity = TN / (TN + FP)        # Non-false-alarm rate
PPV = TP / (TP + FP)                # Precision
NPV = TN / (TN + FN)                # Negative predictive value

Target (FDA):
  - Sensitivity ≥ 95%
  - Specificity ≥ 99%
  - PPV ≥ 90%
```

---

## Performance Baseline Management

### Save Baseline After First Test

```bash
# After baseline test completes:
python3 run_load_test.py ../synthea/synthetic_patients.json

# Automatically saves to performance_baseline.json
```

### Baseline Contents

```json
{
  "timestamp": "2026-04-25T10:30:00",
  "metrics": {
    "database": {
      "total_events_inserted": 336500,
      "insert_rate_per_sec": 10245.8,
      "insert_latency_p50_ms": 0.23,
      "insert_latency_p95_ms": 0.89,
      "insert_latency_p99_ms": 1.45
    },
    "api": {
      "total_requests": 3365,
      "latency_p50_ms": 125,
      "latency_p95_ms": 198,
      "latency_p99_ms": 278
    }
  }
}
```

### Regression Detection

Automatic alerting on:
- Database insert rate degradation >10%
- API latency increase >20% (p95)
- Alert latency increase >25%
- Error rate increase >50%

---

## Monitoring Integration

### Prometheus Metrics

During load test, track:

```promql
# Insert rate
rate(audit_trail_inserts_total[5m])

# API latency
histogram_quantile(0.95, request_duration_seconds_bucket)

# Alert latency
histogram_quantile(0.95, alert_latency_seconds_bucket)

# Database connections
pg_stat_activity_count

# Memory usage
container_memory_usage_bytes{pod="platform-api"}

# CPU usage
rate(container_cpu_usage_seconds_total[5m])
```

### Grafana Dashboard: Load Testing

Create dashboard with panels:

1. **Database Performance**
   - Insert rate (target: 10k/sec)
   - Insert latency p95 (target: <1ms)
   - Query latency p95 (target: <10ms)

2. **API Performance**
   - Request latency p95 (target: <200ms)
   - Throughput (target: 100 req/sec)
   - Error rate (target: <0.1%)

3. **Alert Performance**
   - Alert latency p95 (target: <5s critical)
   - Alerts fired (should match expectations)
   - False positive rate (target: <1%)

4. **System Resources**
   - Memory usage (baseline: 8GB)
   - CPU usage (baseline: <40%)
   - Disk I/O (baseline: <1k IOPS)

---

## Regression Testing Strategy

### Continuous Baseline Comparison

After each major code change, run:

```bash
# 1. Generate fresh synthetic data
python3 ../synthea/generate_patients.py 500 synthetic_patients.json

# 2. Run load test
python3 run_load_test.py synthetic_patients.json

# 3. Compare to baseline
./compare_performance_baseline.sh

# 4. Flag if regressions detected
# Output: performance_regression_report.html
```

### Acceptable Degradation

During normal development:
- Database: ±10% acceptable (build variation)
- API: ±15% acceptable
- Alert latency: ±20% acceptable

Beyond these thresholds → investigate performance issue

---

## Load Testing Checklist

### Pre-Test

```
☐ Verify synthetic data generated (../synthea/synthetic_patients.json)
☐ Verify database connectivity (psql -h localhost -U audit_trail_user)
☐ Verify API running (curl http://localhost:8080/health)
☐ Verify EKS cluster healthy (kubectl get nodes)
☐ Verify Prometheus scraping (http://prometheus:9090/targets)
☐ Stop background jobs (cron, batch processes)
☐ Monitor system resources in separate terminal
```

### During Test

```
☐ Monitor database CPU/memory (kubectl top pods)
☐ Monitor API pod logs (kubectl logs -f -n platform platform-api-0)
☐ Monitor Prometheus alerts (http://prometheus:9090/alerts)
☐ Record any errors or warnings
☐ Take screenshots of key metrics
```

### Post-Test

```
☐ Collect performance reports
☐ Compare to baseline (automated)
☐ Analyze any regressions
☐ Document findings
☐ Update performance documentation
☐ Archive test data for auditing
```

---

## Performance Report Example

### Summary

```
Test: load_test_20260425_103000
Duration: 34.2 seconds
Patients: 500
Observations: 336,000
Total Events: 336,500

DATABASE PERFORMANCE
  Insert Rate: 9,834 events/sec (98% of target)
  Insert Latency p95: 0.87ms
  Insert Latency p99: 1.23ms
  Status: ✅ PASS

API PERFORMANCE
  Requests: 3,365
  Error Rate: 0.03%
  Throughput: 98 req/sec
  Latency p95: 195ms (97% of target)
  Latency p99: 278ms
  Status: ✅ PASS

ALERT PERFORMANCE
  Total Alerts Fired: 42
  False Positives: 1
  False Negatives: 0
  Latency p95: 3.2s (critical), 8.1s (non-critical)
  Status: ✅ PASS

SYSTEM RESOURCES
  Peak Memory: 8.2GB
  Peak CPU: 38%
  Disk I/O: 245 IOPS
  Status: ✅ PASS

OVERALL: ✅ ALL SLAs MET
```

---

## Troubleshooting

### Database Insert Rate Low (<5k events/sec)

```bash
# Check RDS instance class
aws rds describe-db-instances --db-instance-identifier platform-audit-trail-db \
  --query 'DBInstances[0].DBInstanceClass'

# Check IOPS
aws rds describe-db-instances --db-instance-identifier platform-audit-trail-db \
  --query 'DBInstances[0].Iops'

# Check database CPU
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=platform-audit-trail-db \
  --start-time 2026-04-25T10:00:00Z --end-time 2026-04-25T11:00:00Z \
  --period 60 --statistics Maximum

# Solution: May need to upgrade RDS instance or add read replicas
```

### API Latency High (>300ms)

```bash
# Check EKS node resources
kubectl top nodes
kubectl top pods -n platform

# Check API pod logs for errors
kubectl logs -f -n platform platform-api-0

# Check database connection pool
kubectl exec -it -n platform platform-api-0 -- \
  curl localhost:8080/metrics | grep db_pool

# Solution: May need EKS auto-scaling, connection pool tuning, or caching
```

### Alert Latency High (>10 seconds)

```bash
# Check alert processor logs
kubectl logs -f -n platform alert-processor-0

# Check Prometheus scrape interval
curl http://prometheus:9090/api/v1/query_range \
  --data-urlencode 'query=prometheus_tsdb_symbol_table_size_bytes' \
  --data-urlencode 'start=1609459200' \
  --data-urlencode 'end=1609545600' \
  --data-urlencode 'step=300'

# Solution: May need to optimize alert rules, add more replicas, or tune scrape interval
```

---

## Next Steps: Weeks 3-9

| Week | Phase | Focus |
|------|-------|-------|
| **2** (current) | Load Testing | Baseline establishment ✅ |
| **3-4** | Stress Testing | 2,000 patients, scalability |
| **5-6** | Security Testing | OWASP Top 10, penetration testing |
| **7** | E2E Workflows | Patient admission → response |
| **8** | Compliance Evidence | FDA submission package |
| **9** | Clinical Validation | Physician review, accuracy tuning |

---

## References

- **Load Testing Best Practices:** https://www.owasp.org/index.php/Load_Testing
- **FDA Guidance:** IEC 62304 §5.3 (Software Verification)
- **Performance Tuning:** https://www.postgresql.org/docs/current/performance-tips.html
- **Kubernetes Scaling:** https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/

---

**Last Updated:** April 25, 2026  
**Next Review:** May 2, 2026  
**Maintained By:** Platform Engineering
