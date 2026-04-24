# Phase 9, Task 1: OpenTelemetry Instrumentation

**Objective:** Add OpenTelemetry traces and metrics to first service.

**Duration:** 7 hours (Week 17)

## Acceptance Criteria

- [ ] OTel SDK integrated (Rust tokio-console compatible)
- [ ] Trace sampling configured (100% errors, 1% success, 10% high-latency)
- [ ] All HTTP endpoints emit spans
- [ ] All database calls propagate trace context
- [ ] Metrics: http_requests_total, http_request_duration_ms, http_requests_failed_total
- [ ] Trace exporter: Jaeger (dev), Tempo (prod)
- [ ] Prometheus metrics scrape config
- [ ] Integration test: verify trace emission

## Implementation

```rust
// Cargo.toml
[dependencies]
opentelemetry = "0.21"
opentelemetry-jaeger = "0.20"
tracing = "0.1"
tracing-opentelemetry = "0.22"
```

Start every request with span:
```rust
let span = tracer.start("POST /fhir/Patient");
defer { span.end() }
```

Emit metrics on endpoints:
```rust
request_counter.add(1, &[KeyValue::new("method", "POST")]);
request_duration.record(elapsed_ms, &[KeyValue::new("path", "/fhir/Patient")]);
```

## Output

- Service with OTel SDK
- Trace sampling rules
- Metrics definitions
- Integration test
