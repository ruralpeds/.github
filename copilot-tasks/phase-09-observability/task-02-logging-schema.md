# Phase 9, Task 2: Structured Logging + Redaction

**Objective:** Implement structured JSON logging with PHI redaction.

**Duration:** 5 hours (Week 17-18)

## Acceptance Criteria

- [ ] All logs output valid JSON
- [ ] Mandatory fields: timestamp, service, level, trace_id, event
- [ ] logging-redaction.yaml enforced
- [ ] Sensitive fields redacted (patient name, MRN, SSN, email)
- [ ] Unit test: PHI redaction works
- [ ] Loki log aggregation test passing
- [ ] Log schema JSON published

## Implementation

Structured logging via tracing:
```rust
tracing::info!(
    event = "patient_created",
    patient_id = patient.id,
    duration_ms = elapsed.as_millis() as u64,
    "Patient created successfully"
);
```

Redaction middleware:
```rust
pub fn redact_log_event(event: &mut LogEvent) {
    if let Some(patient_name) = event.get("patient.name") {
        event.insert("patient.name", "[REDACTED]");
    }
}
```

## Output

- logging-redaction.yaml
- Redaction middleware + tests
- Log schema JSON

