# Phase 8, Task 2: Service Integration — Refactor First Service

**Objective:** Integrate sci-resilience patterns into a production service.

**Duration:** 6 hours (Weeks 15-16)

## Requirements

- Select a service (recommend FHIR gateway or CDS API)
- Refactor to use circuit breaker for downstream calls
- Implement bulkhead for database connection pooling
- Add retry logic with deadline propagation
- Wire idempotency for POST endpoints
- Add load shedding under CPU pressure
- Establish metrics baseline (`perf/baseline.json`)
- Document integration process

## Acceptance Criteria

- [ ] Service selected and approved
- [ ] `Cargo.toml` dependency added for sci-resilience
- [ ] Configuration file: `config/resilience.yaml`
- [ ] All 3+ endpoints refactored with patterns
- [ ] Metrics baseline created and committed
- [ ] Integration tests passing (chaos + happy path)
- [ ] Performance regression test (P95 latency within 10%)
- [ ] Documentation: integration guide for next service
- [ ] PR merged with evidence of pattern effectiveness

## Implementation Steps

### 1. Service Selection

Pick service with:
- External API dependencies (for circuit breaker)
- Database access (for bulkhead)
- POST endpoints (for idempotency)
- SLA commitment (for metrics baseline)

**Recommendation:** FHIR Gateway (dependencies: Auth, CDS, Compliance)

### 2. Dependency Addition

```toml
# Cargo.toml
[dependencies]
sci-resilience = { path = "../sci-resilience", features = ["full"] }
tokio = { version = "1.38", features = ["full"] }
opentelemetry = { version = "0.21" }
opentelemetry-prometheus = "0.13"
tracing-opentelemetry = "0.22"
```

### 3. Configuration File

```yaml
# config/resilience.yaml

circuit_breakers:
  fhir_auth_api:
    failure_threshold: 0.5
    success_threshold: 3
    cooldown_duration: 30s
    failure_window: 60s
    timeout: 5s
    
  cds_api:
    failure_threshold: 0.4
    success_threshold: 5
    cooldown_duration: 20s
    timeout: 10s
    
  compliance_check:
    failure_threshold: 0.3
    success_threshold: 5
    cooldown_duration: 45s
    timeout: 3s

bulkheads:
  postgres_pool:
    max_concurrency: 50
    queue_depth: 200
    timeout: 30s
    
  redis_cache:
    max_concurrency: 100
    queue_depth: 500
    timeout: 2s

retries:
  default:
    max_attempts: 3
    initial_delay: 100ms
    max_delay: 5s
    backoff_multiplier: 2.0
    jitter_factor: 0.1
    
  critical:
    max_attempts: 5
    initial_delay: 50ms
    max_delay: 10s
    backoff_multiplier: 1.5
    jitter_factor: 0.05

timeouts:
  http_client: 30s
  database_query: 10s
  cache_get: 500ms
  external_api: 5s

idempotency:
  cache_backend: redis
  cache_ttl: 24h
  header_name: "Idempotency-Key"
  
  protected_endpoints:
    - POST /fhir/Patient
    - POST /fhir/Condition
    - POST /api/audit-events

load_shedding:
  enabled: true
  cpu_threshold: 0.85
  memory_threshold: 0.90
  queue_depth_threshold: 200
  shed_probability: 0.5

features:
  cds_recommendations:
    enabled: true
    rollout: 100
    expiration: 2026-06-30
```

### 4. Service Builder Setup

```rust
// src/main.rs

use sci_resilience::{ResilienceBuilder, ResilienceConfig};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load config
    let resilience_config = ResilienceConfig::from_file("config/resilience.yaml")?;
    
    // Build resilience layer
    let resilience = ResilienceBuilder::new()
        .circuit_breakers(resilience_config.circuit_breakers.clone())
        .bulkheads(resilience_config.bulkheads.clone())
        .retries(resilience_config.retries.clone())
        .idempotency(resilience_config.idempotency.clone())
        .load_shedding(resilience_config.load_shedding.clone())
        .build()?;
    
    // Initialize OpenTelemetry metrics
    let metrics_exporter = opentelemetry_prometheus::exporter().build()?;
    let provider = opentelemetry::sdk::metrics::MeterProvider::builder()
        .with_reader(metrics_exporter)
        .build();
    opentelemetry::global::set_meter_provider(provider);
    
    // Build HTTP server
    let app = axum::Router::new()
        .route("/fhir/Patient", axum::routing::post(post_patient))
        .route("/fhir/Patient/:id", axum::routing::get(get_patient))
        .layer(axum::middleware::from_fn_with_state(
            resilience.clone(),
            load_shedding_middleware,
        ))
        .with_state(resilience);
    
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await?;
    axum::serve(listener, app).await?;
    
    Ok(())
}
```

### 5. Endpoint Refactoring

```rust
// src/handlers/patient.rs

#[axum::post("/fhir/Patient")]
async fn post_patient(
    State(resilience): State<Arc<Resilience>>,
    Json(patient): Json<Patient>,
    headers: HeaderMap,
) -> Result<(StatusCode, Json<Patient>), ApiError> {
    // Extract idempotency key
    let idempotency_key = headers
        .get("Idempotency-Key")
        .and_then(|h| h.to_str().ok())
        .ok_or(ApiError::MissingIdempotencyKey)?;
    
    // Validate with compliance service (circuit breaker + timeout)
    let is_compliant = resilience
        .circuit_breaker("compliance_check")
        .call(|| {
            let patient = patient.clone();
            Box::pin(async move {
                resilience
                    .with_timeout(|| {
                        Box::pin(call_compliance_api(&patient))
                    }, Duration::from_secs(3))
                    .await
            })
        })
        .await
        .map_err(|e| {
            // Circuit open or timeout; gracefully degrade
            tracing::warn!("Compliance check failed: {:?}", e);
            ApiError::ComplianceCheckFailed
        })?;
    
    if !is_compliant {
        return Err(ApiError::NotCompliant);
    }
    
    // Store in database (with bulkhead + idempotency)
    let stored_patient = resilience
        .bulkhead("postgres_pool")
        .execute(|| {
            let patient = patient.clone();
            let key = idempotency_key.to_string();
            Box::pin(async move {
                resilience
                    .idempotent_execute(&key, || {
                        let patient = patient.clone();
                        Box::pin(async move {
                            db::insert_patient(&patient).await
                        })
                    }, Duration::from_secs(24 * 3600))
                    .await
            })
        })
        .await
        .map_err(|e| ApiError::DatabaseError(e.to_string()))?;
    
    // Emit audit event (with retry)
    let _ = retry_with_backoff(
        || {
            let patient = stored_patient.clone();
            Box::pin(async move {
                audit::log_patient_created(&patient).await
            })
        },
        &resilience.retry_config("default"),
    )
    .await;
    
    Ok((StatusCode::CREATED, Json(stored_patient)))
}

#[axum::get("/fhir/Patient/:id")]
async fn get_patient(
    State(resilience): State<Arc<Resilience>>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<Json<Patient>, ApiError> {
    // Try cache first (with timeout)
    let patient = resilience
        .with_timeout(|| {
            let id = id.clone();
            Box::pin(async move {
                cache::get_patient(&id).await
            })
        }, Duration::from_millis(500))
        .await
        .ok(); // Ignore cache miss
    
    if let Some(patient) = patient {
        return Ok(Json(patient));
    }
    
    // Fall back to DB (with bulkhead + retry)
    let patient = resilience
        .bulkhead("postgres_pool")
        .execute(|| {
            let id = id.clone();
            Box::pin(async move {
                retry_with_backoff(
                    || {
                        let id = id.clone();
                        Box::pin(async move {
                            db::get_patient(&id).await
                        })
                    },
                    &resilience.retry_config("default"),
                )
                .await
            })
        })
        .await
        .map_err(|e| ApiError::NotFound)?;
    
    Ok(Json(patient))
}
```

### 6. Middleware for Load Shedding

```rust
// src/middleware.rs

pub async fn load_shedding_middleware<B>(
    State(resilience): State<Arc<Resilience>>,
    request: Request<B>,
    next: Next,
) -> Response {
    if resilience.should_shed_load() {
        let body = axum::body::to_bytes(
            Json(json!({
                "error": "service_overloaded",
                "retry_after_seconds": 30
            })).into_response().into_body(),
            usize::MAX,
        )
        .await
        .unwrap();
        
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            [("Retry-After", "30")],
            body,
        ).into_response();
    }
    
    next.run(request).await
}
```

### 7. Metrics Baseline

```rust
// scripts/establish_baseline.sh

#!/bin/bash

# Load test the service with k6
k6 run --out json=baseline_load_test.json <<'K6_SCRIPT'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up
    { duration: '5m', target: 50 },   // Stay
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // P95 < 500ms
    'http_req_failed': ['rate<0.01'],     // Error rate < 1%
  },
};

export default function () {
  let res = http.post('http://localhost:3000/fhir/Patient',
    JSON.stringify({
      resourceType: 'Patient',
      name: [{ given: ['John'] }],
    }),
    { headers: { 'Content-Type': 'application/fhir+json' } }
  );
  
  check(res, {
    'status is 201': (r) => r.status === 201,
  });
  
  sleep(1);
}
K6_SCRIPT

# Extract metrics
jq '.metrics | {
  p50: .http_req_duration.values.p(0.5),
  p95: .http_req_duration.values.p(0.95),
  p99: .http_req_duration.values.p(0.99),
  error_rate: ((.http_req_failed.values.total / .http_reqs.values.total) * 100)
}' baseline_load_test.json > perf/baseline.json

echo "Baseline metrics established in perf/baseline.json"
```

### 8. Integration Tests

```rust
// tests/resilience_integration_test.rs

#[tokio::test]
async fn test_circuit_breaker_protects_from_cascade() {
    // Simulate CDS API failure
    let mock_cds = MockCdsApi::new_with_failure_rate(0.8);
    
    // Call POST /fhir/Patient 100 times
    for i in 0..100 {
        let result = post_patient_with_mock_cds(patient, &mock_cds).await;
        if i < 50 {
            // Circuit not open yet
            assert!(result.is_err() || result.is_ok());
        } else {
            // Circuit should be open; request fails immediately
            assert!(result.is_err());
        }
    }
}

#[tokio::test]
async fn test_bulkhead_prevents_starvation() {
    // Fill bulkhead with slow queries
    for _ in 0..50 {
        tokio::spawn(async {
            db::slow_query().await  // 30s timeout
        });
    }
    
    // New request should be queued, not hang forever
    let result = tokio::time::timeout(
        Duration::from_secs(5),
        post_patient(patient),
    )
    .await;
    
    assert!(result.is_err()); // Timeout expected (queue full)
}

#[tokio::test]
async fn test_idempotency_prevents_duplicates() {
    let key = "patient-123";
    
    // First POST
    let resp1 = post_with_idempotency_key(patient, key).await;
    assert_eq!(resp1.status, 201);
    
    // Retry with same key
    let resp2 = post_with_idempotency_key(patient, key).await;
    assert_eq!(resp2.status, 200);  // Cached result
    assert_eq!(resp1.body, resp2.body);  // Identical
}
```

## Output Artifacts

- Service refactored: 3+ endpoints with patterns
- Configuration file: `config/resilience.yaml` 
- Metrics baseline: `perf/baseline.json` (P50, P95, P99, error rate)
- Test suite: integration + chaos + performance regression
- Documentation: `docs/INTEGRATION_GUIDE.md` for next service

## Success Metrics

- Circuit breaker prevents ≥50% of downstream failures from reaching caller
- Bulkhead prevents queue depth from exceeding 200
- P95 latency regression < 10% compared to baseline
- Error rate ≤ 1%
- Feature flag rollout works (can disable features without redeploy)

## Dependencies

- sci-resilience crate (from Task 1)
- k6 or Locust (load testing)
- opentelemetry/prometheus (metrics)

## Next Phase

Phase 9: Observability Baseline (OTel, structured logging, Grafana)
