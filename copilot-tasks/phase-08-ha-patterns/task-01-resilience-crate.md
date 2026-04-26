# Phase 8, Task 1: Resilience Crate — Core Patterns Implementation

**Objective:** Build polyglot resilience library with 8 HA patterns (Rust primary).

**Duration:** 8 hours (Weeks 15-16)

## Requirements

- Rust crate `sci-resilience` with all 8 patterns
- Configuration system (YAML/JSON → strongly-typed Rust)
- OpenTelemetry metrics for all patterns
- Comprehensive test suite (unit + chaos)
- Documentation with examples for each pattern

## Acceptance Criteria

- [ ] Rust crate published to `crates/sci-resilience/`
- [ ] All 8 patterns implemented and tested
- [ ] Configuration via YAML/JSON with schema validation
- [ ] OpenTelemetry metrics emitted for all patterns
- [ ] Chaos tests (property tests + fuzzing)
- [ ] Examples for each pattern in `examples/`
- [ ] Integration tests with mock services
- [ ] docs/architecture/HA_PATTERNS_LIBRARY.md ✅ (already created)

## Implementation Steps

### 1. Crate Structure

```
crates/sci-resilience/
├── Cargo.toml
├── src/
│   ├── lib.rs
│   ├── circuit_breaker.rs
│   ├── bulkhead.rs
│   ├── retry.rs
│   ├── timeout.rs
│   ├── idempotency.rs
│   ├── hedging.rs
│   ├── load_shedding.rs
│   ├── feature_flags.rs
│   ├── config.rs
│   ├── metrics.rs
│   └── error.rs
├── tests/
│   ├── integration_test.rs
│   └── chaos_test.rs
├── examples/
│   ├── circuit_breaker_example.rs
│   ├── bulkhead_example.rs
│   └── ...
└── docs/
    └── README.md
```

### 2. Circuit Breaker Implementation

```rust
// src/circuit_breaker.rs

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum CircuitState {
    Closed,
    Open,
    HalfOpen,
}

pub struct CircuitBreaker {
    state: Arc<Mutex<CircuitState>>,
    failure_threshold: f32,
    success_threshold: usize,
    cooldown: Duration,
    failure_history: Arc<Mutex<Vec<Instant>>>,
    meter: Meter,
}

impl CircuitBreaker {
    pub fn new(
        failure_threshold: f32,
        success_threshold: usize,
        cooldown: Duration,
    ) -> Self {
        let meter = global::meter("sci-resilience");
        Self {
            state: Arc::new(Mutex::new(CircuitState::Closed)),
            failure_threshold,
            success_threshold,
            cooldown,
            failure_history: Arc::new(Mutex::new(Vec::new())),
            meter,
        }
    }

    pub async fn call<F, T, E>(&self, f: F) -> Result<T, CircuitError<E>>
    where
        F: Fn() -> BoxFuture<'static, Result<T, E>>,
        E: std::error::Error,
    {
        let mut state = self.state.lock().unwrap();
        match *state {
            CircuitState::Closed => {
                match f().await {
                    Ok(result) => {
                        self.record_success();
                        Ok(result)
                    }
                    Err(e) => {
                        self.record_failure();
                        if self.failure_rate_exceeded() {
                            *state = CircuitState::Open;
                            self.meter.u64_counter("circuit_breaker_trips_total")
                                .add(1, &[]);
                        }
                        Err(CircuitError::Downstream(e))
                    }
                }
            }
            CircuitState::Open => {
                let self_ref = self.clone();
                if self_ref.opened_at.elapsed() > self.cooldown {
                    *state = CircuitState::HalfOpen;
                    drop(state);
                    self.call(f).await
                } else {
                    Err(CircuitError::Open)
                }
            }
            CircuitState::HalfOpen => {
                // Allow single probe request
                match f().await {
                    Ok(result) => {
                        *state = CircuitState::Closed;
                        self.meter.u64_counter("circuit_breaker_closed_total")
                            .add(1, &[]);
                        Ok(result)
                    }
                    Err(e) => {
                        *state = CircuitState::Open;
                        Err(CircuitError::Downstream(e))
                    }
                }
            }
        }
    }

    fn failure_rate_exceeded(&self) -> bool {
        let history = self.failure_history.lock().unwrap();
        let window_start = Instant::now() - Duration::from_secs(60);
        let recent = history.iter()
            .filter(|&&t| t > window_start)
            .count();
        let total = history.len().max(1);
        (recent as f32 / total as f32) > self.failure_threshold
    }

    fn record_success(&self) {
        self.meter.u64_counter("circuit_breaker_successes_total")
            .add(1, &[]);
    }

    fn record_failure(&self) {
        self.meter.u64_counter("circuit_breaker_failures_total")
            .add(1, &[]);
        self.failure_history.lock().unwrap().push(Instant::now());
    }
}
```

### 3. Bulkhead Implementation

```rust
// src/bulkhead.rs

pub struct Bulkhead {
    semaphore: Arc<Semaphore>,
    queue: Arc<Mutex<VecDeque<Instant>>>,
    max_queue: usize,
    timeout: Duration,
    meter: Meter,
}

impl Bulkhead {
    pub fn new(max_concurrency: usize, max_queue: usize, timeout: Duration) -> Self {
        let meter = global::meter("sci-resilience");
        Self {
            semaphore: Arc::new(Semaphore::new(max_concurrency)),
            queue: Arc::new(Mutex::new(VecDeque::new())),
            max_queue,
            timeout,
            meter,
        }
    }

    pub async fn execute<F, T, E>(&self, f: F) -> Result<T, BulkheadError<E>>
    where
        F: Fn() -> BoxFuture<'static, Result<T, E>>,
        E: std::error::Error,
    {
        // Try to acquire permit
        match tokio::time::timeout(
            Duration::from_secs(1),
            self.semaphore.acquire(1),
        )
        .await
        {
            Ok(permit) => {
                let result = f().await;
                drop(permit);
                self.meter.u64_counter("bulkhead_executions_total")
                    .add(1, &[]);
                result.map_err(BulkheadError::Execution)
            }
            Err(_) => {
                self.meter.u64_counter("bulkhead_rejections_total")
                    .add(1, &[]);
                Err(BulkheadError::QueueFull)
            }
        }
    }
}
```

### 4. Retry Implementation

```rust
// src/retry.rs

pub struct RetryConfig {
    pub max_attempts: usize,
    pub initial_delay: Duration,
    pub max_delay: Duration,
    pub backoff_multiplier: f32,
    pub jitter_factor: f32,
}

pub async fn retry_with_backoff<F, T, E>(
    mut f: F,
    config: &RetryConfig,
) -> Result<T, E>
where
    F: FnMut() -> BoxFuture<'static, Result<T, E>>,
    E: std::error::Error,
{
    let meter = global::meter("sci-resilience");
    let mut delay = config.initial_delay;

    for attempt in 0..config.max_attempts {
        match f().await {
            Ok(result) => {
                meter.u64_counter("retry_attempts_total")
                    .add(1, &[KeyValue::new("outcome", "success")]);
                return Ok(result);
            }
            Err(e) => {
                if attempt == config.max_attempts - 1 {
                    meter.u64_counter("retry_attempts_total")
                        .add(1, &[KeyValue::new("outcome", "max_retries")]);
                    return Err(e);
                }

                // Apply jitter
                let jitter = (delay.as_millis() as f32) * config.jitter_factor;
                let jittered = (delay.as_millis() as f32)
                    + (rand::random::<f32>() * 2.0 - 1.0) * jitter;

                tokio::time::sleep(Duration::from_millis(jittered as u64)).await;

                delay = std::cmp::min(
                    Duration::from_millis(
                        (delay.as_millis() as f32 * config.backoff_multiplier) as u64,
                    ),
                    config.max_delay,
                );
            }
        }
    }

    unreachable!()
}
```

### 5. Configuration System

```rust
// src/config.rs

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ResilienceConfig {
    pub circuit_breakers: HashMap<String, CircuitBreakerConfig>,
    pub bulkheads: HashMap<String, BulkheadConfig>,
    pub retries: HashMap<String, RetryConfig>,
    pub timeouts: HashMap<String, Duration>,
    pub idempotency: IdempotencyConfig,
    pub load_shedding: LoadSheddingConfig,
    pub features: HashMap<String, FeatureConfig>,
}

impl ResilienceConfig {
    pub fn from_file(path: &str) -> Result<Self> {
        let content = std::fs::read_to_string(path)?;
        serde_yaml::from_str(&content).map_err(|e| anyhow!(e))
    }

    pub fn from_json(json: &str) -> Result<Self> {
        serde_json::from_str(json).map_err(|e| anyhow!(e))
    }
}
```

### 6. Test Suite

```rust
// tests/chaos_test.rs

#[tokio::test]
async fn test_circuit_breaker_opens_on_threshold() {
    let cb = CircuitBreaker::new(0.5, 5, Duration::from_secs(10));
    
    // Simulate 50% failure
    for i in 0..100 {
        let _ = cb.call(|| {
            let i = i.clone();
            Box::pin(async move {
                if i % 2 == 0 {
                    Err::<(), _>("failed")
                } else {
                    Ok(())
                }
            })
        }).await;
    }
    
    assert_eq!(cb.state(), CircuitState::Open);
}

#[tokio::test]
async fn test_bulkhead_rejects_on_saturation() {
    let bulkhead = Bulkhead::new(5, 10, Duration::from_secs(30));
    
    // Fill semaphore
    for _ in 0..5 {
        let _ = bulkhead.execute(|| {
            Box::pin(async { tokio::time::sleep(Duration::from_secs(1)).await; Ok::<(), _>(()) })
        }).await;
    }
    
    // Next should fail
    let result = bulkhead.execute(|| {
        Box::pin(async { Ok::<(), _>(()) })
    }).await;
    
    assert!(result.is_err());
}
```

### 7. Examples

```rust
// examples/circuit_breaker_example.rs
#[tokio::main]
async fn main() {
    let cb = CircuitBreaker::new(0.5, 5, Duration::from_secs(30));
    
    loop {
        match cb.call(|| {
            Box::pin(async { make_api_call().await })
        }).await {
            Ok(result) => println!("Success: {:?}", result),
            Err(e) => eprintln!("Error: {:?}", e),
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
}
```

## Output Artifacts

- Rust crate: `crates/sci-resilience/` with Cargo.toml published
- Config schema: `docs/schema/resilience.schema.json`
- Examples: 8 files (one per pattern)
- Tests: unit + integration + chaos
- Metrics: OpenTelemetry gauge + counter definitions

## Dependencies

- tokio (async runtime)
- opentelemetry (metrics)
- serde + serde_yaml (config)
- proptest (property tests)

## Next Task

Phase 8, Task 2: Service Integration — Refactor first service to use patterns
