---
title: "Scaffold sci-resilience crate (timeout/retry/circuit-breaker)"
phase: phase-08
slug: sci-resilience-crate
preferred-agent: copilot
preflight-confirmation: false
estimated-complexity: m

goal: >
  Add a `sci-resilience` crate to the `rust-sci-core` workspace implementing
  the four patterns every clinical service must use: timeout, retry with
  jittered exponential backoff, circuit breaker, and bulkhead. Make it the
  required HTTP-client wrapper for any service that calls external
  dependencies.

acceptance-criteria:
  - "New crate `sci-resilience` added to the workspace with dependency only on sci-units, thiserror, tokio, tracing"
  - "Public API: `RetryPolicy`, `CircuitBreaker`, `Bulkhead`, `timeout()` wrapper, `resilient_call()` combinator"
  - "Property-based tests via proptest: retry never exceeds policy max-attempts, circuit-breaker state transitions are monotonic, bulkhead never over-admits"
  - "Doc examples compile and run (doctests green)"
  - "README with integration example showing a resilient reqwest client"
  - "No `unsafe`, no `panic!` in non-test code"

files-to-touch:
  - "crates/sci-resilience/Cargo.toml"
  - "crates/sci-resilience/src/lib.rs"
  - "crates/sci-resilience/src/timeout.rs"
  - "crates/sci-resilience/src/retry.rs"
  - "crates/sci-resilience/src/circuit_breaker.rs"
  - "crates/sci-resilience/src/bulkhead.rs"
  - "crates/sci-resilience/tests/property_tests.rs"
  - "crates/sci-resilience/README.md"
  - "Cargo.toml"                                   # workspace members

files-not-to-touch:
  - "AGENTS.md"
  - "audit-log/**"
  - "other crates' sources (this task is isolated to sci-resilience)"

tests-required: |
  - `cargo test -p sci-resilience` green
  - `cargo clippy -p sci-resilience -- -D warnings` clean
  - `cargo doc -p sci-resilience --no-deps` builds without warnings
  - `cargo nextest run -p sci-resilience` green
  - proptest with 1000 cases per property

standards:
  - "NIST SSDF PW.5 — produce well-secured software (defensive coding)"
  - "ISO/IEC 25010 — reliability characteristic"
  - "IEC 62304 §5.5.1 — implementation rules (applied to the services that will use this)"

rollback: >
  Remove the crate from `Cargo.toml` workspace members. Services that have
  adopted it must revert to their prior HTTP-client code in a separate PR.

labels:
  - "rust"
  - "resilience"
  - "infrastructure"

---

## Context

Every service in the org that talks to an external dependency (another
service, Postgres, Redis, a FHIR server) needs these four patterns, and
every service currently gets them wrong in subtly different ways. Making
them a shared crate:

1. Guarantees consistent behavior (a request that times out in service A
   times out the same way in service B).
2. Centralizes observability (every resilience event emits the same metrics
   and spans).
3. Makes security review fast (one crate to audit vs. N).
4. Provides a drop-in upgrade path when we tune defaults.

The crate wraps `reqwest`, `sqlx`, and any `tokio`-based async call — it's
call-site-agnostic.

## Public API sketch

```rust
// retry
pub struct RetryPolicy {
    pub max_attempts: u32,
    pub initial_backoff: Duration,
    pub max_backoff: Duration,
    pub jitter: JitterStrategy,   // None | Full | Equal | Decorrelated
}
impl RetryPolicy {
    pub fn exponential() -> Self { ... }
    pub fn for_database() -> Self { ... }    // conservative defaults
    pub fn for_idempotent_http() -> Self { ... }
}

// circuit breaker
pub struct CircuitBreaker {
    pub failure_threshold: u32,
    pub success_threshold: u32,
    pub half_open_after: Duration,
}
// states: Closed → Open → HalfOpen → Closed|Open

// bulkhead
pub struct Bulkhead {
    pub max_concurrent: usize,
    pub queue_depth: usize,
}

// combinator
pub async fn resilient_call<F, T, E>(
    policy: ResiliencePolicy,
    op: F,
) -> Result<T, ResilienceError<E>>
where
    F: Fn() -> BoxFuture<'static, Result<T, E>>,
    E: std::error::Error + Send + 'static,
{ ... }

pub struct ResiliencePolicy {
    pub timeout: Option<Duration>,
    pub retry: Option<RetryPolicy>,
    pub breaker: Option<Arc<CircuitBreaker>>,
    pub bulkhead: Option<Arc<Bulkhead>>,
}
```

## Properties to test

With `proptest`:

1. **Retry count invariant**: For any policy P and any `op` that always fails,
   the number of invocations is exactly `min(P.max_attempts, retries_allowed)`.
2. **Backoff monotonicity (without jitter)**: `backoff(n+1) >= backoff(n)` up
   to `max_backoff` cap.
3. **Jitter bound**: with `Full` jitter, actual sleep ∈ `[0, base]`; with
   `Equal` jitter, actual sleep ∈ `[base/2, base/2 + rand(base/2)]`.
4. **Circuit breaker monotone transitions**: starting Closed, a sequence of
   failures ≥ failure_threshold → Open. From Open, after `half_open_after`,
   next call → HalfOpen. From HalfOpen, success_threshold consecutive
   successes → Closed; any failure → Open.
5. **Bulkhead over-admission impossibility**: at no point does the number of
   in-flight operations exceed `max_concurrent`.

## Observability

Every layer emits:
- `tracing::Span` at `info` level with operation name.
- Metrics (via `metrics` crate facade): `resilience_calls_total{op,state}`,
  `resilience_failures_total{op,reason}`, `resilience_circuit_state{op}`,
  `resilience_bulkhead_depth{op}`.

## Usage example (goes in README)

```rust
use sci_resilience::{ResiliencePolicy, RetryPolicy, CircuitBreaker, resilient_call};
use std::{sync::Arc, time::Duration};

let breaker = Arc::new(CircuitBreaker::default());
let policy = ResiliencePolicy {
    timeout: Some(Duration::from_secs(5)),
    retry: Some(RetryPolicy::for_idempotent_http()),
    breaker: Some(Arc::clone(&breaker)),
    bulkhead: None,
};

let client = reqwest::Client::new();
let response = resilient_call(policy, || {
    let client = client.clone();
    Box::pin(async move {
        client.get("https://fhir.example.org/Patient/123")
              .send().await?.error_for_status()
    })
}).await?;
```

## Verification

- `cargo test -p sci-resilience` — all unit + proptest tests green.
- `cargo clippy -p sci-resilience -- -D warnings` — clean.
- `cargo doc -p sci-resilience --no-deps --open` — docs render.
- Benchmark the overhead of wrapping a no-op call: adds < 10 μs on tokio
  multi-thread runtime. Include the numbers in the PR body.

## References

- Release It! (Michael Nygard) — Chapters on timeouts, circuit breakers,
  bulkheads.
- Marc Brooker: "Exponential Backoff and Jitter" (AWS Architecture Blog).
- AWS: "Timeouts, retries, and backoff with jitter" in the Builders' Library.
