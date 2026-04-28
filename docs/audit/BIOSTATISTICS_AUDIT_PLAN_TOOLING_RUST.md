# Biostatistics Audit Plan — Rust Tooling Addendum

**Companion to:** `biostatistics-audit-plan.md`
**Scope:** Concrete Rust toolchain, crate selections, macros, CI configuration, and orchestration
**Plan version:** 1.0
**Created:** April 27, 2026

This addendum pins every Rust-specific decision the master plan deferred to Phase 0 reconnaissance. Once committed to the repo, Claude Code executes against fixed tooling rather than re-deciding each session — which is itself an audit-grade requirement.

---

## 1. Toolchain Pinning

### 1.1 `rust-toolchain.toml` (committed)

```toml
[toolchain]
channel = "1.83.0"
components = ["rustfmt", "clippy", "llvm-tools-preview"]
profile = "default"
targets = [
    "x86_64-unknown-linux-gnu",
    "aarch64-apple-darwin",
    "x86_64-pc-windows-msvc",
]
```

The audit dossier's sign-off block records the exact `rustc --version --verbose` output. Bumping the toolchain triggers a full audit rerun.

### 1.2 Cargo profile for numerical determinism

In `Cargo.toml`:

```toml
[profile.release]
opt-level = 3
lto = "fat"
codegen-units = 1
debug = true                   # symbols for stability investigation
overflow-checks = true         # never silently wrap in numerical code
panic = "abort"

[profile.audit]
inherits = "release"
opt-level = 3
debug-assertions = true        # keeps assert! and debug_assert! in audit builds
overflow-checks = true

[profile.dev]
opt-level = 1                  # dev tests still need reasonable numeric throughput
overflow-checks = true
```

`cargo test --profile audit` is the canonical audit invocation. Both `dev` and `release` profiles also run in CI to catch optimization-level differences.

### 1.3 Compiler flags

Pinned via `.cargo/config.toml`:

```toml
[build]
rustflags = ["-D", "warnings"]

[target.'cfg(all())']
rustflags = [
    "-C", "target-cpu=generic",     # NOT native: cross-platform reproducibility wins
]

[env]
RUSTFLAGS_CI = "-D warnings -C target-cpu=generic"
```

Rationale: `target-cpu=native` produces faster code but breaks reproducibility across CPUs. For a calculation library where bit-exact agreement matters across the CI matrix, generic targeting is mandatory. Performance-critical deployments can override locally with documented impact.

FMA (fused multiply-add) is *not* enabled by default. If a specific calculation requires FMA for precision, it is opted in per-function via `#[target_feature(enable = "fma")]` with safety justification documented inline.

---

## 2. Mandatory Crate Stack

### 2.1 Test infrastructure (`[dev-dependencies]`)

```toml
[dev-dependencies]
# Property-based testing
proptest = "1.5"
proptest-derive = "0.5"

# Snapshot / regression testing
insta = { version = "1.40", features = ["json", "ron"] }

# Numerical assertions
approx = "0.5"
float_eq = "1.0"               # finer-grained ULP comparisons

# Benchmarks
criterion = { version = "0.5", features = ["html_reports"] }

# JSON fixture loading
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# Test harness extensions
rstest = "0.23"                # parameterized tests
test-case = "3.3"              # alternative parameterization syntax
pretty_assertions = "1.4"      # readable diffs on assertion failures

# Determinism
rand = { version = "0.8", features = ["small_rng"] }
rand_chacha = "0.3"            # ChaCha20Rng is the canonical seedable RNG
```

### 2.2 Numerical libraries (audited and pinned)

If the library depends on numerical crates rather than implementing from scratch, pin them and document validation status:

```toml
[dependencies]
statrs = "=0.17.1"             # distributions, special functions
nalgebra = "=0.33.0"           # linear algebra
ndarray = "=0.16.1"            # n-dimensional arrays
ndarray-stats = "=0.6.0"       # descriptive stats
argmin = "=0.10.0"             # optimization (MLE, Cox PH)
roots = "=0.0.8"               # 1D root finding (quantile inversion)
```

Exact-version pins (`=`) prevent silent semver bumps from invalidating fixtures. Each pinned crate gets an entry in `AUDIT/02_dependency_validation.md` recording: version, license, last security audit date, what calculations depend on it, what tests cover the integration.

### 2.3 Banned crate / pattern list

Documented in `AUDIT/00_banned_patterns.md`:

- `unsafe` blocks in calculation code paths (allowed only in low-level numerical primitives with safety proofs)
- `f32` for any user-facing calculation result (use `f64` exclusively; `f32` only for memory-bound storage with documented precision loss)
- `std::f64::EPSILON` as a default tolerance — every comparison declares its tolerance explicitly
- `unwrap()` and `expect()` in calculation paths — typed errors only
- `std::mem::transmute` on floats
- `#[allow(clippy::...)]` without an inline rationale comment

A custom `clippy.toml` enforces what's enforceable mechanically; the rest is enforced by code review and a CI grep gate.

---

## 3. The `assert_close!` Convention

Every numerical assertion declares its tolerance and the reason for it. The plan mandates this; here is the concrete macro.

### 3.1 In `crates/sci-test-utils/src/assertions.rs`

```rust
//! Numerical assertion macros for the biostatistics audit suite.
//!
//! Every comparison declares atol, rtol, and a `because` justification.
//! Failures emit a structured diagnostic compatible with insta snapshot review.

#[macro_export]
macro_rules! assert_close {
    ($actual:expr, $expected:expr, atol = $atol:expr, rtol = $rtol:expr, because = $reason:expr $(,)?) => {{
        let actual: f64 = $actual;
        let expected: f64 = $expected;
        let atol: f64 = $atol;
        let rtol: f64 = $rtol;
        let diff = (actual - expected).abs();
        let bound = atol + rtol * expected.abs();
        if !(diff <= bound) {
            panic!(
                "assert_close! failed
  actual:   {actual:.17e}
  expected: {expected:.17e}
  |diff|:   {diff:.3e}
  bound:    {bound:.3e}  (atol={atol:.3e}, rtol={rtol:.3e})
  because:  {reason}
  ulp_diff: {ulp}",
                actual = actual,
                expected = expected,
                diff = diff,
                bound = bound,
                atol = atol,
                rtol = rtol,
                reason = $reason,
                ulp = float_eq::FloatEqUlpsTol::debug_ulps_diff(&actual, &expected),
            );
        }
    }};
}

#[macro_export]
macro_rules! assert_close_pvalue {
    ($actual:expr, $expected:expr, source = $source:expr $(,)?) => {{
        // Standard tolerance for p-values cross-validated against R/scipy:
        // 1e-12 absolute floor, 1e-10 relative for tail-precision regions.
        $crate::assert_close!(
            $actual, $expected,
            atol = 1e-12, rtol = 1e-10,
            because = concat!("p-value cross-validated against ", $source)
        );
    }};
}
```

### 3.2 Tolerance policy

Default tolerances by calculation class, declared once and cited from every test:

| Class | `atol` | `rtol` | Rationale |
|-------|--------|--------|-----------|
| Closed-form CDF/PDF (normal, gamma, beta) | `1e-14` | `1e-12` | Limited by IEEE 754 f64 representation of the formula |
| p-values from analytical tests (t, chi-square, F) | `1e-12` | `1e-10` | Reference impl precision |
| Iterative MLE (logistic, Cox PH) | `1e-8` | `1e-6` | Convergence criterion of `1e-9` in optimizer |
| Bootstrap / simulation results | `documented per-test` | `documented per-test` | Seed pinned, B fixed, tolerance reflects stochastic floor |
| Textbook worked examples | `documented per-test` | `documented per-test` | Bounded by the precision the textbook publishes |

Stored in `AUDIT/04_tolerance_policy.md` with each calculation's row referencing one of these classes.

---

## 4. Audit Logging — `#[audited]` Procedural Macro

The Julia plan references `@audited_calculation`. The Rust analogue is a proc macro on functions that emits a structured log record on every call when audit mode is enabled.

### 4.1 Crate layout

```
crates/sci-audit/
├── Cargo.toml
├── src/lib.rs              # runtime: AuditRecord, sinks, hashing
└── ../sci-audit-macros/    # proc-macro crate (must be separate)
    ├── Cargo.toml
    └── src/lib.rs
```

### 4.2 Usage

```rust
use sci_audit::audited;

#[audited(
    id = "stats.ttest.welch",
    version = "v1",
    references = ["Rosner_8e_ex_7_4", "R_stats_4.4.1"],
    tier = "T2"
)]
pub fn welch_t_test(x: &[f64], y: &[f64], alternative: Tail) -> Result<TTestResult, StatsError> {
    // ... implementation ...
}
```

### 4.3 What the macro generates (sketch)

```rust
pub fn welch_t_test(x: &[f64], y: &[f64], alternative: Tail) -> Result<TTestResult, StatsError> {
    let __audit_inputs_hash = sci_audit::hash_inputs(&(x, y, alternative));
    let __audit_started = std::time::SystemTime::now();

    // Original body, renamed:
    let __audit_result = welch_t_test_impl(x, y, alternative);

    if sci_audit::audit_mode_enabled() {
        sci_audit::emit(sci_audit::AuditRecord {
            calculation_id: "stats.ttest.welch",
            version: "v1",
            tier: "T2",
            references: &["Rosner_8e_ex_7_4", "R_stats_4.4.1"],
            inputs_hash: __audit_inputs_hash,
            output_summary: sci_audit::summarize(&__audit_result),
            started: __audit_started,
            duration: __audit_started.elapsed().unwrap_or_default(),
            code_sha: sci_audit::BUILD_GIT_SHA,
        });
    }

    __audit_result
}

fn welch_t_test_impl(x: &[f64], y: &[f64], alternative: Tail) -> Result<TTestResult, StatsError> {
    // ... original body ...
}
```

### 4.4 Audit record schema (`sci-audit::AuditRecord`)

```rust
#[derive(Debug, Clone, serde::Serialize)]
pub struct AuditRecord {
    pub calculation_id: &'static str,
    pub version: &'static str,
    pub tier: &'static str,
    pub references: &'static [&'static str],
    pub inputs_hash: [u8; 32],         // BLAKE3 of canonical input encoding
    pub output_summary: OutputSummary,  // hash + key scalars, never full payload
    pub started: SystemTime,
    pub duration: Duration,
    pub code_sha: &'static str,         // injected at build time
}
```

Sinks are pluggable (file, stderr, no-op). In tests the sink is a thread-local buffer the test can introspect; in production, a JSONL file or syslog target.

### 4.5 Build-time SHA injection

`build.rs`:

```rust
fn main() {
    let sha = std::process::Command::new("git")
        .args(["rev-parse", "HEAD"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "unknown".into());
    println!("cargo:rustc-env=BUILD_GIT_SHA={sha}");
}
```

The dossier sign-off block reads this to bind itself to a code SHA.

---

## 5. Property-Based Testing — `proptest` Patterns

### 5.1 Domain-specific strategies

In `crates/sci-test-utils/src/strategies.rs`:

```rust
use proptest::prelude::*;

/// Finite f64 in a clinically reasonable range. Excludes NaN, ±Inf, and subnormals.
pub fn finite_f64() -> impl Strategy<Value = f64> {
    prop::num::f64::NORMAL
        .prop_filter("must be finite", |x| x.is_finite())
        .prop_filter("must not be subnormal", |x| !x.is_subnormal())
}

/// A non-empty sample of finite f64 values, length 2..=1000.
pub fn sample(min_n: usize, max_n: usize) -> impl Strategy<Value = Vec<f64>> {
    prop::collection::vec(finite_f64(), min_n..=max_n)
}

/// A probability in (0, 1). Excludes exactly 0 and 1 by default;
/// edge values are tested separately in edge_cases/.
pub fn probability() -> impl Strategy<Value = f64> {
    (0.0_f64..1.0).prop_filter("strictly inside (0, 1)", |&p| p > 0.0 && p < 1.0)
}

/// A pair of samples for two-sample tests.
pub fn two_samples(min_n: usize, max_n: usize) -> impl Strategy<Value = (Vec<f64>, Vec<f64>)> {
    (sample(min_n, max_n), sample(min_n, max_n))
}
```

### 5.2 Invariant test pattern

```rust
use proptest::prelude::*;
use sci_test_utils::strategies::two_samples;

proptest! {
    #![proptest_config(ProptestConfig {
        cases: 1000,
        max_shrink_iters: 10000,
        .. ProptestConfig::default()
    })]

    /// Welch's t-test p-value must be in [0, 1] for any valid input.
    #[test]
    fn welch_pvalue_in_unit_interval((x, y) in two_samples(2, 200)) {
        let result = welch_t_test(&x, &y, Tail::Two).unwrap();
        prop_assert!(result.p >= 0.0 && result.p <= 1.0,
            "p={} outside [0,1]", result.p);
    }

    /// Swapping groups inverts t but preserves |t| and p.
    #[test]
    fn welch_group_swap_symmetry((x, y) in two_samples(2, 200)) {
        let r1 = welch_t_test(&x, &y, Tail::Two).unwrap();
        let r2 = welch_t_test(&y, &x, Tail::Two).unwrap();
        prop_assert!((r1.t + r2.t).abs() < 1e-12);
        prop_assert!((r1.p - r2.p).abs() < 1e-14);
    }

    /// Two-sided p ≥ 2 × min(one-sided p).
    #[test]
    fn welch_two_sided_geq_twice_one_sided((x, y) in two_samples(2, 200)) {
        let two = welch_t_test(&x, &y, Tail::Two).unwrap();
        let less = welch_t_test(&x, &y, Tail::Less).unwrap();
        let greater = welch_t_test(&x, &y, Tail::Greater).unwrap();
        let twice_min = 2.0 * less.p.min(greater.p);
        prop_assert!(two.p >= twice_min - 1e-12);
    }
}
```

### 5.3 Seed pinning and reproducibility

`proptest.toml` at repo root:

```toml
# Reproducibility: every property test failure persists its seed in
# proptest-regressions/<test_path>.txt, which IS committed to the repo.
[default]
cases = 1000
max_shrink_iters = 10000
fork = false
timeout = 30000
```

The `proptest-regressions/` directory is committed. Any historical counterexample is replayed on every run, preventing "fixed it once" regressions.

---

## 6. Snapshot Regression with `insta`

For calculations whose output is a complex struct (regression results, survival summaries), `insta` snapshots provide regression detection without rewriting expected values by hand.

### 6.1 Snapshot configuration

`.config/insta.yaml`:

```yaml
output: minimal
snapshot_path: ../snapshots
prepend_module_to_snapshot: true
```

### 6.2 Snapshot test pattern

```rust
use insta::assert_json_snapshot;

#[test]
fn cox_ph_lung_dataset_snapshot() {
    let result = cox_ph(&LUNG_DATASET, &["age", "sex", "ph_ecog"]).unwrap();
    assert_json_snapshot!("cox_ph_lung_dataset", &result, {
        ".coefficients[].se" => insta::dynamic_redaction(|v, _| {
            // Round to 6 decimals to absorb last-bit platform variation
            format!("{:.6}", v.as_f64().unwrap())
        }),
    });
}
```

### 6.3 Review workflow

- A test's output changes → `cargo insta review` shows a side-by-side diff
- Reviewer accepts → snapshot is updated, change appears in the PR
- Snapshot file lives next to the test source, version-controlled, reviewed like any other artifact
- CI runs `cargo insta test --check` which fails on any unaccepted change

---

## 7. Coverage Gating

### 7.1 Tool: `cargo-llvm-cov`

```bash
cargo install cargo-llvm-cov --locked
```

### 7.2 Per-tier thresholds (CI gate)

```bash
# Run coverage and emit JSON
cargo llvm-cov --workspace --json --output-path target/coverage.json

# Enforce thresholds via a gate script
scripts/audit/check_coverage.sh
```

`scripts/audit/check_coverage.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

REGISTRY="AUDIT/01_calculation_registry.json"
COVERAGE="target/coverage.json"

# Cross-reference each registry entry with its file's coverage.
# T1: ≥95% lines, T2: ≥85%, T3: ≥70%
python3 scripts/audit/coverage_gate.py \
    --registry "$REGISTRY" \
    --coverage "$COVERAGE" \
    --t1-min 0.95 \
    --t2-min 0.85 \
    --t3-min 0.70
```

Failures print which calculation under-covered and by how much, with file paths and line ranges.

---

## 8. Static Analysis & Code Quality

### 8.1 `clippy.toml`

```toml
# Stricter for numerical correctness
avoid-breaking-exported-api = true
disallowed-methods = [
    { path = "f64::EPSILON", reason = "use explicit tolerance with documented rationale" },
    { path = "std::f64::EPSILON", reason = "use explicit tolerance with documented rationale" },
]
disallowed-types = [
    # Add domain-specific banned types here
]
cognitive-complexity-threshold = 25
too-many-arguments-threshold = 8
```

### 8.2 CI invocations

```yaml
- run: cargo fmt --all -- --check
- run: cargo clippy --workspace --all-targets --all-features -- -D warnings -W clippy::pedantic -W clippy::nursery
- run: cargo doc --workspace --no-deps --document-private-items
  env:
    RUSTDOCFLAGS: "-D warnings -D rustdoc::broken-intra-doc-links"
- run: cargo deny check
- run: cargo audit
```

### 8.3 `deny.toml`

```toml
[licenses]
allow = ["MIT", "Apache-2.0", "BSD-3-Clause", "BSD-2-Clause", "ISC", "Unicode-DFS-2016"]
confidence-threshold = 0.9

[bans]
multiple-versions = "warn"
wildcards = "deny"

[advisories]
yanked = "deny"
ignore = []
```

---

## 9. CI Workflow — `.github/workflows/audit.yml`

```yaml
name: audit

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
  schedule:
    - cron: "0 6 * * 1"   # Monday 06:00 UTC: weekly fixture freshness check

env:
  CARGO_TERM_COLOR: always
  RUST_BACKTRACE: 1
  RUSTFLAGS: "-D warnings -C target-cpu=generic"

jobs:
  format:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt
      - run: cargo fmt --all -- --check

  clippy:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy
      - uses: Swatinem/rust-cache@v2
      - run: cargo clippy --workspace --all-targets --all-features -- -D warnings

  test-matrix:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-24.04, macos-14, windows-2022]
        profile: [dev, release, audit]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - run: cargo test --workspace --profile ${{ matrix.profile }}

  property-tests-extended:
    runs-on: ubuntu-24.04
    if: github.event_name == 'schedule' || contains(github.event.pull_request.labels.*.name, 'extended-properties')
    env:
      PROPTEST_CASES: "10000"
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - run: cargo test --workspace --release -- properties

  coverage:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: llvm-tools-preview
      - uses: Swatinem/rust-cache@v2
      - run: cargo install cargo-llvm-cov --locked
      - run: cargo llvm-cov --workspace --json --output-path target/coverage.json
      - run: bash scripts/audit/check_coverage.sh
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: target/coverage.json

  fixture-freshness:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: r-lib/actions/setup-r@v2
        with:
          r-version: "4.4.1"
      - uses: r-lib/actions/setup-renv@v2
        with:
          working-directory: scripts/audit/reference_capture/R
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r scripts/audit/reference_capture/python/requirements.txt
      - run: bash scripts/audit/regenerate_all_fixtures.sh
      - run: git diff --exit-code AUDIT/fixtures/

  registry-completeness:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo run --bin build_registry -- --check
        # Fails if any pub fn returning numeric is missing from registry

  dossier-freshness:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo run --bin render_validation_md -- --check
        # Fails if VALIDATION.md / VALIDATION_DOSSIER.md don't match HEAD

  security:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo install cargo-audit cargo-deny --locked
      - run: cargo audit
      - run: cargo deny check

  benchmarks:
    runs-on: ubuntu-24.04
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - run: cargo bench --workspace -- --save-baseline pr
      - run: git checkout main
      - run: cargo bench --workspace -- --save-baseline main
      - run: cargo install critcmp
      - run: critcmp main pr --threshold 1.10  # warn at 10% regression
```

---

## 10. Local Orchestration — `justfile`

```
default:
    @just --list

# Full audit suite (use this before every PR)
audit:
    cargo fmt --all -- --check
    cargo clippy --workspace --all-targets --all-features -- -D warnings
    cargo test --workspace --profile audit
    cargo llvm-cov --workspace --json --output-path target/coverage.json
    bash scripts/audit/check_coverage.sh
    cargo run --bin build_registry -- --check
    cargo run --bin render_validation_md -- --check
    cargo audit
    cargo deny check

# Fast inner-loop audit (skips coverage and external tools)
audit-fast:
    cargo clippy --workspace --all-targets -- -D warnings
    cargo test --workspace

# Regenerate all R/Python fixtures and diff
audit-fixtures-regenerate:
    bash scripts/audit/regenerate_all_fixtures.sh
    git diff AUDIT/fixtures/ || true

# Extended property test run (10k cases per property)
audit-properties-extended:
    PROPTEST_CASES=10000 cargo test --workspace --release -- properties

# Update insta snapshots interactively
audit-snapshots-review:
    cargo insta test --review

# Regenerate registry, traceability matrix, and dossier
audit-dossier:
    cargo run --bin build_registry
    cargo run --bin render_validation_md
    git diff AUDIT/

# Run a single calculation's full audit (golden + cross + property + stability + edge)
audit-one CALC:
    cargo test --workspace -- {{CALC}}

# Phase 9 independent re-derivation for one calculation
audit-rederive CALC:
    bash scripts/audit/rederive.sh {{CALC}}
```

---

## 11. Directory Layout (Rust-specific)

```
biostatistics/
├── Cargo.toml                              # workspace root
├── rust-toolchain.toml
├── clippy.toml
├── deny.toml
├── proptest.toml
├── .cargo/config.toml
├── .config/insta.yaml
├── justfile
├── crates/
│   ├── sci-stats/
│   │   ├── Cargo.toml
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── ttest.rs
│   │   │   ├── anova.rs
│   │   │   └── ...
│   │   ├── tests/
│   │   │   ├── golden/
│   │   │   ├── cross_validation/
│   │   │   ├── properties/
│   │   │   ├── stability/
│   │   │   └── edge_cases/
│   │   ├── benches/
│   │   ├── snapshots/
│   │   ├── proptest-regressions/          # committed
│   │   └── VALIDATION.md
│   ├── sci-survival/
│   ├── sci-bayes/
│   ├── sci-audit/                         # runtime
│   ├── sci-audit-macros/                  # proc macros (separate crate)
│   └── sci-test-utils/
│       └── src/
│           ├── assertions.rs              # assert_close! et al.
│           ├── strategies.rs              # proptest strategies
│           └── fixtures.rs                # fixture loader
├── scripts/audit/
│   ├── build_registry/                    # Rust binary
│   ├── render_validation_md/              # Rust binary
│   ├── coverage_gate.py
│   ├── check_coverage.sh
│   ├── regenerate_all_fixtures.sh
│   ├── rederive.sh
│   └── reference_capture/
│       ├── R/
│       └── python/
├── AUDIT/
│   ├── 00_recon.md
│   ├── 00_banned_patterns.md
│   ├── 01_calculation_registry.{json,md}
│   ├── 02_dependency_validation.md
│   ├── 02_reference_registry.json
│   ├── 04_tolerance_policy.md
│   ├── ...
│   ├── fixtures/                          # JSON, language-neutral
│   └── VALIDATION_DOSSIER.md
└── .github/workflows/audit.yml
```

---

## 12. Determinism Checklist

These are the things that quietly destroy reproducibility in numerical Rust. Each gets a CI gate.

- [x] `target-cpu=generic` set in `.cargo/config.toml`, not `native`
- [x] FMA disabled by default; opt-in per-function with safety justification
- [x] No `f32` in user-facing calculation results
- [x] No `unsafe` in calculation code paths
- [x] `proptest-regressions/` committed
- [x] `insta` snapshots committed
- [x] `Cargo.lock` committed (it's a library — yes, commit it for the audit dossier; bin crates always commit)
- [x] Exact-version pins on numerical dependencies
- [x] RNG seeds explicit and pinned in every test that uses randomness (`ChaCha20Rng::seed_from_u64`)
- [x] No `HashMap` iteration in calculation paths (use `BTreeMap` or sorted iteration when output ordering matters)
- [x] Multi-OS CI matrix runs all profiles (dev / release / audit)
- [x] Build SHA injected into binaries via `build.rs`

---

## 13. Phase Mapping (master plan ↔ Rust addendum)

| Master plan phase | Rust-specific section in this addendum |
|---|---|
| Phase 0 — Recon | §1 (toolchain), §2 (crate stack inventory) |
| Phase 1 — Registry | `scripts/audit/build_registry` Rust binary using `syn` to parse `pub fn` signatures |
| Phase 2 — References | §11 layout (`scripts/audit/reference_capture/`); same R/Python as master plan |
| Phase 3 — Three-tier validation | §3 (`assert_close!`), §5 (proptest), §6 (insta) |
| Phase 4 — Stability | §3.2 tolerance policy, edge case tests in `tests/stability/` |
| Phase 5 — Edge cases | `tests/edge_cases/` per crate |
| Phase 6 — Documentation | `render_validation_md` binary, §11 per-crate `VALIDATION.md` |
| Phase 7 — CI | §9 (`audit.yml`) |
| Phase 8 — Continuous verification | §9 schedule trigger, §10 `just audit` |
| Phase 9 — Re-derivation | `scripts/audit/rederive.sh`, polyglot with Julia (see Julia addendum) |
| Phase 10 — Sign-off | `render_validation_md` writes sign-off block from build SHA |

---

*End of Rust addendum.*
