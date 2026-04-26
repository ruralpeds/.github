# HA Patterns Library — Resilience & Fault Tolerance Reference

**Scope:** Phase 8 (Weeks 15-16) — Implement polyglot resilience patterns library for healthcare services.

**Problem statement:** Healthcare services demand fault tolerance. A peds device platform cannot have hard dependencies fail; it must gracefully degrade. A circuit breaker prevents cascading failures; bulkheads prevent one slow downstream from taking down the entire API; retries recover from transient errors; idempotency ensures operations are safely retryable.

This document defines the standard set of HA patterns, their implementation in Rust (primary), with wrappers for Python/Julia/Go/Node, and integration guidelines for every new service.

---

## Eight Resilience Patterns

1. **Circuit Breaker** — Detect failure; stop sending requests; auto-recover
2. **Bulkhead** — Limit concurrency per downstream; isolate failure
3. **Retry** — Exponential backoff + jitter; deadline propagation
4. **Timeout** — Every I/O operation has a deadline
5. **Idempotency** — Write operations tagged with idempotency keys
6. **Request Hedging** — Send to multiple replicas; return fastest
7. **Load Shedding** — Detect overload; return 503 Retry-After
8. **Graceful Degradation** — Feature flags for non-critical paths

---

## Circuit Breaker Pattern

**Purpose:** Prevent cascading failures. When downstream fails, stop sending requests.

**States:**
- CLOSED: Normal operation (allow requests)
- OPEN: Failure detected (reject requests)
- HALF-OPEN: Probing recovery (allow limited requests)

**Configuration:**
```yaml
circuit_breakers:
  fhir_gateway:
    failure_threshold: 0.5        # 50% failure rate triggers OPEN
    success_threshold: 5          # 5 successes in HALF-OPEN closes
    cooldown_duration: 30s        # Wait before HALF-OPEN
    failure_window: 60s           # Sliding window
    timeout: 5s
```

**Metrics:**
- circuit_breaker_state (gauge: 1=closed, 0=half-open, -1=open)
- circuit_breaker_failures_total (counter)
- circuit_breaker_trips_total (counter)

---

## Bulkhead Pattern

**Purpose:** Isolate failure. Bound concurrency per downstream.

**Configuration:**
```yaml
bulkheads:
  postgres_pool:
    max_concurrency: 20         # Max 20 concurrent
    queue_depth: 50             # Queue max 50
    timeout: 30s                # Total time (wait + exec)
  
  redis_pool:
    max_concurrency: 10
    queue_depth: 100
    timeout: 5s
```

**Metrics:**
- bulkhead_available_permits (gauge)
- bulkhead_queue_depth (gauge)
- bulkhead_rejections_total (counter)

---

## Retry Pattern

**Purpose:** Recover from transient errors with exponential backoff + jitter.

**Configuration:**
```yaml
retries:
  default:
    max_attempts: 3
    initial_delay: 100ms
    max_delay: 10s
    backoff_multiplier: 2.0
    jitter_factor: 0.1          # ±10% random jitter
```

**Deadline Propagation:**
Service A (deadline=now+30s) calls B with 25s timeout, which calls C with 23s timeout.

**Metrics:**
- retry_attempts_total (counter, by outcome)
- retry_total_delay_ms (histogram)

---

## Timeout Pattern

**Purpose:** No unbounded waits. Every I/O has a deadline.

**Configuration:**
```yaml
timeouts:
  http_client: 30s
  database_query: 10s
  cache_get: 500ms
  external_api: 5s
  background_job: 5m
```

**Metrics:**
- timeout_exceeded_total (counter)
- request_duration_ms (histogram)

---

## Idempotency Pattern

**Purpose:** Write operations are safely retryable. Client-provided key → cached result.

**Configuration:**
```yaml
idempotency:
  cache_backend: redis
  cache_ttl: 24h
  header_name: "Idempotency-Key"
  
  protected_endpoints:
    - POST /api/orders
    - POST /api/prescriptions
    - POST /api/audit-events
```

**API Contract:**
```http
POST /api/prescriptions HTTP/1.1
Idempotency-Key: "pres-2026-04-24-001"

# First request: 201 Created
# Retry with same key: 200 OK (cached result)
```

**Metrics:**
- idempotency_cache_hits (counter)
- idempotency_cache_misses (counter)

---

## Request Hedging Pattern

**Purpose:** Latency-critical reads go to multiple replicas; return fastest.

**Configuration:**
```yaml
hedging:
  replicas: 3
  hedge_after: 50ms          # Hedge if first slow
  max_hedge_delay: 200ms     # But give up after 200ms
```

**Metrics:**
- hedging_hedge_count (counter)
- hedging_first_response_time_ms (histogram)
- hedging_hedged_response_time_ms (histogram)

---

## Load Shedding Pattern

**Purpose:** When overloaded, reject traffic with 503 Retry-After.

**Configuration:**
```yaml
load_shedding:
  enabled: true
  cpu_threshold: 0.80           # Shed when CPU > 80%
  memory_threshold: 0.90        # Shed when memory > 90%
  queue_depth_threshold: 100    # Shed when queue > 100
  shed_probability: 0.5         # Reject 50% when overloaded
```

**HTTP Response:**
```http
HTTP/1.1 503 Service Unavailable
Retry-After: 30

{
  "error": "overloaded",
  "retry_after_seconds": 30
}
```

**Metrics:**
- load_shedding_rejections_total (counter)
- system_cpu_percent (gauge)
- system_memory_percent (gauge)
- queue_depth (gauge)

---

## Graceful Degradation Pattern

**Purpose:** Non-critical features behind feature flags. Disable if broken/slow.

**Configuration (OpenFeature):**
```yaml
features:
  growth_percentile_chart:
    enabled: true
    rollout: 100
    expiration: 2026-06-30
    
  enhanced_dosing_calculator:
    enabled: false
    rollout: 10       # Canary
    expiration: 2026-05-31
    
  cds_integration:
    enabled: true
    rollout: 100
    dependency_check:
      service: "cds-api"
      failure_rate_threshold: 0.2  # Disable if >20% errors
```

**Usage Pattern:**
```rust
if flag_manager.is_enabled("growth_percentile_chart", user_id) {
    match render_growth_chart(patient_id).await {
        Ok(chart) => html.push_str(&chart),
        Err(e) => {
            tracing::warn!("Growth chart failed: {}", e);
            // Continue without it
        }
    }
}
```

**Metrics:**
- feature_flag_checks_total (counter, by flag)
- feature_flag_enabled_ratio (gauge)

---

## Service Integration Checklist

### 1. Dependencies
```toml
[dependencies]
sci-resilience = { path = "../sci-resilience", features = ["full"] }
opentelemetry = "0.21"
tracing = "0.1"
```

### 2. Configuration File
```yaml
# config/resilience.yaml
circuit_breakers: { ... }
bulkheads: { ... }
retries: { ... }
idempotency: { ... }
```

### 3. Service Initialization
```rust
let resilience = ResilienceBuilder::new()
    .add_circuit_breaker("fhir_api", config.circuit_breakers["fhir_api"].clone())
    .add_bulkhead("db_pool", config.bulkheads["db_pool"].clone())
    .build();
```

### 4. Endpoint Decoration
```rust
#[post("/prescriptions")]
async fn create_prescription(
    req: Json<PrescriptionRequest>,
    resilience: web::Data<Resilience>,
) -> Result<Json<PrescriptionResponse>> {
    resilience.circuit_breaker("cds_api").call(|| {
        Box::pin(async {
            resilience.with_timeout(|| {
                Box::pin(call_cds_api(&req))
            }, Duration::from_secs(5)).await
        })
    }).await?;
    Ok(Json(response))
}
```

### 5. Testing
Every pattern includes property tests and chaos tests:
```rust
#[tokio::test]
async fn test_circuit_breaker_opens_on_failure() {
    // Simulate 50% failure; verify state transitions
}
```

---

## Metrics Dashboard

All patterns emit OpenTelemetry metrics. Grafana dashboard template provided: `docs/grafana/resilience-dashboard.json`.

Key observability:
- Circuit breaker state changes (tripped/recovered)
- Bulkhead queue depth and rejections
- Retry attempt distribution
- Timeout exceeded count
- Feature flag rollout percentages
- System load (CPU, memory, queue depth)

---

## Regulatory Alignment

- **IEC 62304 §7.3:** Reliability testing via pattern validation
- **FDA:** Graceful degradation required for medical device software
- **HIPAA §164.308(a)(7):** Business continuity patterns included in BCP

---

## Deliverables (Phase 8)

- [ ] Rust crate `sci-resilience` with all 8 patterns
- [ ] Python wrapper module `sci_resilience`
- [ ] Configuration schema (JSON Schema + docs)
- [ ] Integration guide (this document) + examples
- [ ] Chaos tests for each pattern
- [ ] Grafana dashboard template
- [ ] First service refactored to use patterns
- [ ] Metrics baseline established
