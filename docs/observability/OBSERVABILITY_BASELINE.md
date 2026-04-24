# Observability Baseline — OpenTelemetry + Structured Logging + Grafana

**Scope:** Phase 9 (Weeks 17-18) — Organization-wide observability standards.

**Goal:** Traces (OTel), metrics (Prometheus), logs (JSON), and alerts (SLOs) across all services.

---

## Traces (OpenTelemetry)

### Policy
- Error traces: 100% sample rate
- Success traces: 1% sample rate
- High-latency (P99+): 10% sample rate

### Schema
Every span includes: trace_id, span_id, service_name, operation_name, duration_ms, status, attributes (http.method, db.operation, etc.), events, error.

### Propagation
Trace context via `traceparent` header (W3C standard):
```
traceparent: 00-{trace_id}-{span_id}-{sampled}
```

Cascading calls maintain context through entire call chain.

---

## Metrics (Prometheus)

### RED Metrics (Rate, Errors, Duration)
- `http_requests_total` (counter by method, path, status)
- `http_request_duration_ms` (histogram P50/P95/P99)
- `http_requests_failed_total` (counter by error type)

### USE Metrics (Utilization, Saturation, Errors)
- CPU/memory/disk utilization (gauge 0-100%)
- Queue depth, pool availability, thread count (gauge)
- Circuit breaker trips, bulkhead rejections (counter)

### Naming Convention
`<domain>_<operation>_<unit>[_attribute]`

Example: `http_request_duration_ms{method="POST",path="/fhir/Patient",quantile="0.95"}`

---

## Logs (Structured JSON)

### Mandatory Fields
```json
{
  "timestamp": "ISO8601",
  "service": "service-name",
  "level": "INFO|WARN|ERROR|DEBUG",
  "event": "event_name",
  "trace_id": "hex",
  "span_id": "hex",
  "actor_id": "user",
  "message": "human-readable"
}
```

### Redaction Rules
Sensitive fields (patient name, MRN, SSN, email) must be redacted:
- `remove`: Strip field entirely
- `hash_sha256`: Replace with hash
- `truncate_4`: Keep last 4 chars
- `date_year_only`: Keep only year

Example: `patient_name: "[REDACTED]"`, `patient_mrn: "***-5678"`

---

## Alerts (Multi-Burn-Rate SLOs)

### SLO Format
```yaml
service: my-service
slos:
  - name: availability
    objective: 99.9              # 3 nines
    window: 30d
    alert_rules:
      - burn_rate: 2.0           # 2% of budget in 1h
        window: 1h
        alert_after: 30m
      - burn_rate: 10.0          # 10% of budget in 5m
        window: 5m
        alert_after: 1m
```

### Alert Routing
By severity: critical → pagerduty, warning → slack

---

## Grafana Dashboards

Standard template for all services:
1. Service Health (availability, error budget)
2. RED Metrics (RPS, error rate, latency)
3. Resource Utilization (CPU, memory, connections)
4. Dependency Health (circuit breaker state, queue depth)
5. Audit Completeness (events logged, integrity checks)

---

## Implementation Checklist

**Week 17:**
- OTel SDK in first service
- Trace sampling (100% errors, 1% success)
- Metrics (RED + USE)
- Prometheus scrape config

**Week 18:**
- Structured JSON logging + redaction
- Grafana dashboards
- SLO definitions
- Alert rules + runbooks

---

## Regulatory Alignment

- HIPAA §164.312(b): Audit logging with redaction
- 21 CFR Part 11: Timestamps, signatures in audit trail
- IEC 62304: Test coverage and mutation metrics tracked
- FDA: SLO compliance documented

