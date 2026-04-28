# Biostatistics Audit Plan — Julia Tooling Addendum

**Companion to:** `biostatistics-audit-plan.md`
**Scope:** Concrete Julia toolchain, package selections, macros, CI configuration, and orchestration
**Plan version:** 1.0
**Created:** April 27, 2026

This addendum pins every Julia-specific decision the master plan deferred to Phase 0 reconnaissance. Conventions align with the `julia-enterprise-repo` skill (v2.1) so that biostatistics packages built under this plan inherit the same audit logging, exception hierarchy, and quality gates as `PedNeoSim.jl` and `HealthcareSPC.jl`.

---

## 1. Toolchain Pinning

### 1.1 Julia version

- **Pinned version:** Julia `1.11.x` (LTS-track stable as of April 2026)
- Recorded in `Project.toml` under `[compat]`:

```toml
[compat]
julia = "1.11"
```

- CI matrix tests against `1.10` (previous LTS) and `1.11` (current). Anything older fails.
- `juliaup` is the supported version manager. The repo includes a `.juliaup` lock equivalent: a `JULIA_VERSION` constant in `scripts/audit/audit_env.jl` that any audit script asserts against on startup.

### 1.2 Project and Manifest

- **Both `Project.toml` and `Manifest.toml` are committed.** This is non-standard for libraries but mandatory for audit reproducibility — the Manifest is the lockfile of record. A separate `Project.toml`-only branch can be maintained for downstream consumers if package registry policy requires it, but the audit dossier always pins to the Manifest.
- Manifest regeneration is its own PR class with mandatory full-audit re-run.

### 1.3 Numerical determinism flags

Audit invocations always use:

```bash
julia --project=. \
      --check-bounds=yes \
      --depwarn=error \
      --inline=no \
      -e 'using Pkg; Pkg.test(coverage=true)'
```

Plus, **never use** in calculation code paths:

- `@fastmath` — breaks IEEE 754 semantics; if absolutely needed, opt in per-function with documented justification and a non-fastmath reference test
- `@inbounds` without paired `@boundscheck` correctness test
- `--math-mode=fast` (the CLI flag equivalent)
- `Threads.@threads` over reductions that aren't associative — use `OnlineStats.jl` or explicit serial reduction

A CI grep gate fails the build if `@fastmath` appears anywhere under `src/` without an `# AUDIT-OK:` comment carrying a rationale.

---

## 2. Mandatory Package Stack

### 2.1 Test infrastructure (`[extras]` and `[targets]` in `Project.toml`)

```toml
[extras]
Test = "8dfed614-e22c-5e08-85e1-65c5234f0b40"
Aqua = "4c88cf16-eb10-579e-8560-4a9242c79595"
JET = "c3a54625-cd67-489e-a8e7-0a5a0ff4e31b"
ReferenceTests = "324d217c-45ce-50fc-942e-d289b448e8cf"
Supposition = "5e57bb29-b2e0-4b3a-b7c4-86b6c66ab8d8"
BenchmarkTools = "6e4b80f9-dd63-53aa-95a3-0cdb28fa8baf"
Random = "9a3f8284-a2c9-5f02-9a11-845980a1fd5c"
StableRNGs = "860ef19b-820b-49d6-a774-d7a799459cd3"
Coverage = "a2441757-f6aa-5fb2-8edb-039e3f45d037"
JSON3 = "0f8b85d8-7281-11e9-16c2-39a750bddbf1"
Documenter = "e30172f5-a6a5-5a46-863b-614d45cd2de4"

[targets]
test = ["Test", "Aqua", "JET", "ReferenceTests", "Supposition",
        "BenchmarkTools", "Random", "StableRNGs", "JSON3"]
```

### 2.2 Numerical packages (audited and pinned)

If the library wraps or composes existing numerical packages, pin them explicitly:

```toml
[deps]
Distributions    = "31c24e10-a181-5473-b8eb-7969acd0382f"
StatsBase        = "2913bbd2-ae8a-5f71-8c99-4fb6c76f3a91"
HypothesisTests  = "09f84164-cd44-5f33-b23f-e6b0d136a0d5"
GLM              = "38e38edf-8417-5370-95a0-9cbb8c7f171a"
Survival         = "8a913cab-fc8e-5d2b-b1f8-7f6c47b5c3fa"
MixedModels      = "ff71e718-51f3-5ec2-a782-8ffcbfa3c316"
SpecialFunctions = "276daf66-3868-5448-9aa4-cd146d93841b"
LinearAlgebra    = "37e2e46d-f89d-539d-b4ee-838fcccc9c8e"

[compat]
Distributions    = "0.25"
StatsBase        = "0.34"
HypothesisTests  = "0.11"
GLM              = "1.9"
Survival         = "0.3"
MixedModels      = "4.25"
SpecialFunctions = "2.4"
julia            = "1.11"
```

`[compat]` bounds are documented in `AUDIT/02_dependency_validation.md` with: package name, range allowed, what calculations depend on it, last validation run against which exact version, and whether the package is itself audited or an external trusted dependency.

### 2.3 Banned patterns

`AUDIT/00_banned_patterns.md`:

- `@fastmath` in calculation code without `# AUDIT-OK:` rationale
- `@inbounds` without a paired test asserting boundary behavior
- `Float32` for user-facing calculation results (use `Float64`)
- Untyped function signatures in calculation code (every public calculation has fully typed arguments and return type)
- `eval` and `@eval` in calculation paths (audit log integrity)
- `Threads.@threads` over non-associative reductions
- Global mutable state in calculation modules
- `try`/`catch` swallowing errors silently — typed errors only

---

## 3. The `@audited_calculation` Macro

This is the canonical audit logger from the `julia-enterprise-repo` skill, formalized for biostatistics.

### 3.1 Module: `BiostatAudit.jl`

```julia
module BiostatAudit

using SHA
using JSON3
using Dates

export @audited_calculation, AuditRecord, audit_mode_enabled, set_audit_sink!

struct AuditRecord
    calculation_id::String
    version::String
    tier::String
    references::Vector{String}
    inputs_hash::String          # hex of SHA-256
    output_summary::Dict{Symbol,Any}
    started::DateTime
    duration_ms::Float64
    code_sha::String
    julia_version::String
end

const AUDIT_MODE = Ref(false)
const AUDIT_SINK = Ref{Function}(_ -> nothing)
const BUILD_GIT_SHA = Ref{String}("unknown")

audit_mode_enabled() = AUDIT_MODE[]
set_audit_sink!(f::Function) = (AUDIT_SINK[] = f)

function _hash_inputs(args)
    io = IOBuffer()
    JSON3.write(io, args)
    bytes2hex(sha256(take!(io)))
end

function _summarize(result)
    # Override this per-calculation via dispatch on result type
    Dict{Symbol,Any}(:type => string(typeof(result)),
                     :hash => bytes2hex(sha256(string(result))))
end

"""
    @audited_calculation id="..." version="..." tier="..." refs=[...] body

Wraps a calculation function so every invocation in audit mode emits a structured
`AuditRecord` to the configured sink. Outside audit mode, runtime overhead is one
branch.
"""
macro audited_calculation(kwargs...)
    # Parse keyword arguments and the function definition (last positional)
    # ... (full implementation; sketch shown for clarity)
    fn = kwargs[end]
    opts = Dict(k.args[1] => k.args[2] for k in kwargs[1:end-1])

    # Extract function name, args, body
    quote
        function $(esc(fn.args[1].args[1]))($(esc.(fn.args[1].args[2:end])...))
            local _audit_started = now()
            local _audit_inputs_hash = $(@__MODULE__)._hash_inputs(($(esc.(fn.args[1].args[2:end])...),))
            local _audit_result = $(esc(fn.args[2]))

            if $(@__MODULE__).audit_mode_enabled()
                local _record = $(@__MODULE__).AuditRecord(
                    $(opts[:id]), $(opts[:version]), $(opts[:tier]),
                    $(opts[:refs]),
                    _audit_inputs_hash,
                    $(@__MODULE__)._summarize(_audit_result),
                    _audit_started,
                    (now() - _audit_started).value,
                    $(@__MODULE__).BUILD_GIT_SHA[],
                    string(VERSION),
                )
                $(@__MODULE__).AUDIT_SINK[](_record)
            end
            _audit_result
        end
    end
end

end # module
```

### 3.2 Usage

```julia
using BiostatAudit

@audited_calculation id="stats.ttest.welch" version="v1" tier="T2" refs=["Rosner_8e_ex_7_4", "R_stats_4.4.1"] function welch_t_test(x::Vector{Float64}, y::Vector{Float64}, alternative::Symbol)::TTestResult
    # ... implementation ...
end
```

### 3.3 Build SHA injection

In `deps/build.jl`:

```julia
sha = try
    readchomp(`git rev-parse HEAD`)
catch
    "unknown"
end
write(joinpath(@__DIR__, "build_sha.jl"),
      "const BUILD_GIT_SHA = \"$sha\"\n")
```

In the package `__init__`:

```julia
function __init__()
    include(joinpath(@__DIR__, "..", "deps", "build_sha.jl"))
    BiostatAudit.BUILD_GIT_SHA[] = BUILD_GIT_SHA
end
```

---

## 4. The `@cited` Reference Registry

Per the `julia-enterprise-repo` skill, every clinical or methodologic reference cited in a calculation gets a registry entry. For biostatistics, this becomes the cross-link between the calculation code and `AUDIT/02_reference_registry.json`.

### 4.1 Pattern

```julia
using BiostatAudit

@cited "Rosner_8e_ex_7_4" begin
    type = "textbook"
    author = "Rosner, B."
    title = "Fundamentals of Biostatistics"
    edition = "8th"
    year = 2016
    page = 224
    example = "7.4"
end

@cited "R_stats_4.4.1" begin
    type = "software"
    package = "stats"
    language = "R"
    version = "4.4.1"
    function_call = "t.test(x, y, var.equal = TRUE)"
end
```

A startup hook validates that every `@audited_calculation` `refs=[...]` entry resolves to a `@cited` registry entry. Unresolved references fail the test suite.

---

## 5. Numerical Assertion Conventions

### 5.1 The `@test_close` macro

`test/utils/assertions.jl`:

```julia
"""
    @test_close actual expected atol=... rtol=... because="..."

Numerical equality with explicit tolerance and rationale. Failure prints the
ULP difference and the `because` string for audit trail clarity.
"""
macro test_close(actual, expected, atol_kw, rtol_kw, because_kw)
    quote
        local _actual = $(esc(actual))
        local _expected = $(esc(expected))
        local _atol = $(esc(atol_kw.args[2]))
        local _rtol = $(esc(rtol_kw.args[2]))
        local _because = $(esc(because_kw.args[2]))
        local _diff = abs(_actual - _expected)
        local _bound = _atol + _rtol * abs(_expected)
        if !(_diff <= _bound)
            @error "test_close failed" actual=_actual expected=_expected diff=_diff bound=_bound atol=_atol rtol=_rtol because=_because
            @test false
        else
            @test true
        end
    end
end
```

### 5.2 Tolerance policy

Same table as the Rust addendum, kept in sync via `AUDIT/04_tolerance_policy.md`:

| Class | `atol` | `rtol` |
|-------|--------|--------|
| Closed-form CDF/PDF | `1e-14` | `1e-12` |
| Analytical p-values | `1e-12` | `1e-10` |
| Iterative MLE | `1e-8` | `1e-6` |
| Bootstrap / simulation | per-test | per-test |

### 5.3 ULP-level comparison for cross-language parity

For Phase 9 cross-language re-derivation, also use:

```julia
function ulp_distance(a::Float64, b::Float64)::Int
    a == b && return 0
    ai = reinterpret(Int64, a)
    bi = reinterpret(Int64, b)
    abs(ai - bi)
end

# In tests:
@test ulp_distance(julia_result, fixture_result) <= 4
```

---

## 6. Property-Based Testing — `Supposition.jl`

Julia's property-based testing ecosystem is younger than Rust's `proptest` or Python's `Hypothesis`. `Supposition.jl` is the most viable choice; document its limitations honestly in the dossier.

### 6.1 Strategies (`test/utils/strategies.jl`)

```julia
using Supposition
using Supposition: Data

# Finite Float64, excluding NaN, ±Inf, subnormals
finite_f64 = Data.Floats{Float64}(; nans=false, infs=false, subnormals=false)

# A non-empty sample of finite f64 values
function sample_strategy(min_n::Int, max_n::Int)
    Data.Vectors(finite_f64; min_size=min_n, max_size=max_n)
end

# A pair of samples
function two_samples_strategy(min_n::Int, max_n::Int)
    Data.@composed function(
        x = sample_strategy(min_n, max_n),
        y = sample_strategy(min_n, max_n)
    )
        (x, y)
    end
end

# Probability strictly inside (0, 1)
probability_strategy = Data.Floats{Float64}(;
    minimum=nextfloat(0.0), maximum=prevfloat(1.0),
    nans=false, infs=false)
```

### 6.2 Invariant pattern

```julia
using Supposition
using Test

@testset "Welch t-test invariants" begin
    @check function welch_pvalue_in_unit_interval(input = two_samples_strategy(2, 200))
        x, y = input
        result = welch_t_test(x, y, :two_sided)
        0.0 <= result.p <= 1.0
    end

    @check function welch_group_swap_symmetry(input = two_samples_strategy(2, 200))
        x, y = input
        r1 = welch_t_test(x, y, :two_sided)
        r2 = welch_t_test(y, x, :two_sided)
        abs(r1.t + r2.t) < 1e-12 && abs(r1.p - r2.p) < 1e-14
    end
end
```

### 6.3 Fallback: hand-rolled randomized invariant tests

Where `Supposition.jl` shrinking proves unreliable, fall back to fixed-seed `StableRNGs`-driven randomized tests. Document in `AUDIT/03_test_traceability_matrix.md` which calculations use `Supposition.jl` vs. hand-rolled, and why.

```julia
using StableRNGs

@testset "Welch t-test randomized invariant — hand-rolled" begin
    rng = StableRNG(42)
    for _ in 1:10_000
        n_x = rand(rng, 2:200)
        n_y = rand(rng, 2:200)
        x = randn(rng, n_x)
        y = randn(rng, n_y)
        result = welch_t_test(x, y, :two_sided)
        @test 0.0 <= result.p <= 1.0
    end
end
```

The seed `42` is committed; the test is bit-reproducible across runs and across Julia versions on the same algorithm.

### 6.4 Counterexample persistence

Unlike `proptest-regressions`, `Supposition.jl` does not yet ship with first-class committed-counterexample support. Workaround: when a property fails, capture the counterexample inputs to `test/regressions/<test_name>.json`, commit the file, and add a deterministic test that replays the counterexample on every run.

This is a manual discipline — flagged in `AUDIT/00_recon.md` as a known toolchain limitation relative to the Rust track.

---

## 7. Snapshot / Reference Testing — `ReferenceTests.jl`

For complex calculation outputs (regression result structs, survival summaries), `ReferenceTests.jl` provides the Julia analogue of `insta`.

### 7.1 Pattern

```julia
using ReferenceTests
using Test

@testset "Cox PH on lung dataset" begin
    result = cox_ph(LUNG_DATASET, [:age, :sex, :ph_ecog])
    @test_reference "references/cox_ph_lung_dataset.json" begin
        # Round to 6 decimals to absorb last-bit platform variation
        Dict(
            :coefficients => round.(result.coefficients; digits=6),
            :se => round.(result.se; digits=6),
            :loglik => round(result.loglik; digits=6),
            :n_events => result.n_events,
            :n_subjects => result.n_subjects,
        )
    end
end
```

### 7.2 Update workflow

```bash
# Inspect what would change
JULIA_REFERENCETESTS_UPDATE=1 julia --project -e 'using Pkg; Pkg.test()'

# Review diffs in references/ before committing
git diff test/references/

# CI runs without the env var, fails on any mismatch
```

`test/references/` is committed and reviewed like any other artifact.

---

## 8. Static Analysis & Quality Gates

### 8.1 `Aqua.jl` — package hygiene

`test/aqua.jl`:

```julia
using Aqua
using Biostatistics

Aqua.test_all(
    Biostatistics;
    ambiguities = (recursive = false,),  # third-party ambiguities not our problem
    deps_compat = (check_extras = true,),
    piracies = true,
    project_extras = true,
    stale_deps = true,
    unbound_args = true,
    undefined_exports = true,
)
```

### 8.2 `JET.jl` — type stability and inference

`test/jet.jl`:

```julia
using JET
using Biostatistics

@testset "JET static analysis" begin
    rep = report_package(Biostatistics;
        target_defined_modules = true,
        analyze_from_definitions = true)
    @test isempty(JET.get_reports(rep))
end
```

Type-unstable calculations are a numerical hazard: they admit silent type promotion or boxing that can change rounding behavior. JET catches them.

### 8.3 Documenter doctest enforcement

```julia
# test/doctests.jl
using Documenter
using Biostatistics

DocMeta.setdocmeta!(Biostatistics, :DocTestSetup, :(using Biostatistics); recursive=true)
doctest(Biostatistics)
```

Every docstring example with a `julia> ... ` block becomes a test. Worked-example calculations in docstrings get free golden coverage.

### 8.4 Format check

```julia
# test/format.jl
using JuliaFormatter
@test format(".", BlueStyle(); overwrite=false, verbose=false)
```

`.JuliaFormatter.toml`:

```toml
style = "blue"
indent = 4
margin = 100
always_for_in = true
remove_extra_newlines = true
```

---

## 9. Coverage Gating

### 9.1 Tool: `Coverage.jl` + LCOV

```julia
# scripts/audit/coverage_gate.jl
using Coverage
using JSON3

cd(joinpath(@__DIR__, "..", ".."))

coverage = process_folder("src")
coverage = merge_coverage_counts(coverage)

registry = JSON3.read(read("AUDIT/01_calculation_registry.json", String))

failures = String[]
for entry in registry
    file = entry.source_file
    fc = filter(c -> c.filename == file, coverage)
    isempty(fc) && (push!(failures, "no coverage data for $file"); continue)

    covered, total = get_summary(fc[1])
    pct = covered / total

    threshold = entry.tier == "T1" ? 0.95 :
                entry.tier == "T2" ? 0.85 :
                entry.tier == "T3" ? 0.70 : 0.0

    if pct < threshold
        push!(failures, "$(entry.id) ($(entry.tier)): $(round(pct*100; digits=1))% < $(threshold*100)%")
    end
end

if !isempty(failures)
    println("Coverage gate failed:")
    foreach(f -> println("  ", f), failures)
    exit(1)
end
println("Coverage gate passed.")
```

### 9.2 CI invocation

```bash
julia --project -e 'using Pkg; Pkg.test(coverage=true)'
julia --project=scripts/audit scripts/audit/coverage_gate.jl
```

---

## 10. CI Workflow — `.github/workflows/audit.yml`

```yaml
name: audit

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
  schedule:
    - cron: "0 6 * * 1"

env:
  JULIA_NUM_THREADS: "1"
  JULIA_PROJECT: "@."

jobs:
  format:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: julia-actions/setup-julia@v2
        with:
          version: "1.11"
      - run: julia --project -e 'using Pkg; Pkg.add("JuliaFormatter"); using JuliaFormatter; @assert format(".", BlueStyle(); overwrite=false)'

  test-matrix:
    strategy:
      fail-fast: false
      matrix:
        julia-version: ["1.10", "1.11"]
        os: [ubuntu-24.04, macos-14, windows-2022]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: julia-actions/setup-julia@v2
        with:
          version: ${{ matrix.julia-version }}
      - uses: julia-actions/cache@v2
      - uses: julia-actions/julia-buildpkg@v1
      - uses: julia-actions/julia-runtest@v1
        with:
          coverage: ${{ matrix.julia-version == '1.11' && matrix.os == 'ubuntu-24.04' }}

  aqua-jet:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: julia-actions/setup-julia@v2
        with:
          version: "1.11"
      - uses: julia-actions/cache@v2
      - run: julia --project -e 'using Pkg; Pkg.instantiate(); include("test/aqua.jl")'
      - run: julia --project -e 'using Pkg; Pkg.instantiate(); include("test/jet.jl")'

  doctests:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: julia-actions/setup-julia@v2
        with:
          version: "1.11"
      - uses: julia-actions/cache@v2
      - run: julia --project=docs -e 'using Pkg; Pkg.instantiate(); include("test/doctests.jl")'

  property-tests-extended:
    runs-on: ubuntu-24.04
    if: github.event_name == 'schedule' || contains(github.event.pull_request.labels.*.name, 'extended-properties')
    env:
      SUPPOSITION_MAX_EXAMPLES: "10000"
    steps:
      - uses: actions/checkout@v4
      - uses: julia-actions/setup-julia@v2
        with:
          version: "1.11"
      - uses: julia-actions/cache@v2
      - run: julia --project -e 'using Pkg; Pkg.test(test_args=["properties"])'

  coverage-gate:
    needs: test-matrix
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: julia-actions/setup-julia@v2
        with:
          version: "1.11"
      - uses: julia-actions/cache@v2
      - run: julia --project=scripts/audit scripts/audit/coverage_gate.jl

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
      - uses: julia-actions/setup-julia@v2
        with:
          version: "1.11"
      - uses: julia-actions/cache@v2
      - run: julia --project=scripts/audit scripts/audit/build_registry.jl --check

  dossier-freshness:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: julia-actions/setup-julia@v2
        with:
          version: "1.11"
      - uses: julia-actions/cache@v2
      - run: julia --project=scripts/audit scripts/audit/render_validation_md.jl --check

  benchmarks:
    runs-on: ubuntu-24.04
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: julia-actions/setup-julia@v2
        with:
          version: "1.11"
      - uses: julia-actions/cache@v2
      - run: julia --project=benchmarks -e 'using Pkg; Pkg.instantiate(); include("benchmarks/run_benchmarks.jl")'
      - uses: actions/upload-artifact@v4
        with:
          name: benchmark-results
          path: benchmarks/results.json
```

---

## 11. Local Orchestration — `justfile`

```
default:
    @just --list

# Full audit suite
audit:
    julia --project -e 'using JuliaFormatter; @assert format(".", BlueStyle(); overwrite=false)'
    julia --project --check-bounds=yes --depwarn=error -e 'using Pkg; Pkg.test(coverage=true)'
    julia --project -e 'include("test/aqua.jl")'
    julia --project -e 'include("test/jet.jl")'
    julia --project=docs -e 'include("test/doctests.jl")'
    julia --project=scripts/audit scripts/audit/coverage_gate.jl
    julia --project=scripts/audit scripts/audit/build_registry.jl --check
    julia --project=scripts/audit scripts/audit/render_validation_md.jl --check

# Fast inner loop (skips coverage, doctests, dossier rebuild)
audit-fast:
    julia --project -e 'using Pkg; Pkg.test()'

# Regenerate R/Python fixtures and diff
audit-fixtures-regenerate:
    bash scripts/audit/regenerate_all_fixtures.sh
    git diff AUDIT/fixtures/ || true

# Extended property tests (10k examples each)
audit-properties-extended:
    SUPPOSITION_MAX_EXAMPLES=10000 julia --project -e 'using Pkg; Pkg.test(test_args=["properties"])'

# Update reference snapshots interactively
audit-snapshots-review:
    JULIA_REFERENCETESTS_UPDATE=1 julia --project -e 'using Pkg; Pkg.test(test_args=["snapshots"])'
    git diff test/references/

# Regenerate registry, traceability, dossier
audit-dossier:
    julia --project=scripts/audit scripts/audit/build_registry.jl
    julia --project=scripts/audit scripts/audit/render_validation_md.jl
    git diff AUDIT/

# Single calculation audit
audit-one CALC:
    julia --project -e 'using Pkg; Pkg.test(test_args=["{{CALC}}"])'

# Phase 9 independent re-derivation
audit-rederive CALC:
    bash scripts/audit/rederive.sh {{CALC}}
```

---

## 12. Directory Layout (Julia-specific)

```
biostatistics/
├── Project.toml
├── Manifest.toml                          # committed
├── .JuliaFormatter.toml
├── justfile
├── src/
│   ├── Biostatistics.jl                   # main module
│   ├── audit/
│   │   ├── BiostatAudit.jl
│   │   └── citations.jl                   # @cited registry
│   ├── stats/
│   │   ├── ttest.jl
│   │   ├── anova.jl
│   │   └── ...
│   ├── survival/
│   ├── bayes/
│   └── exceptions.jl                      # typed exception hierarchy
├── test/
│   ├── runtests.jl
│   ├── utils/
│   │   ├── assertions.jl                  # @test_close
│   │   ├── strategies.jl                  # Supposition strategies
│   │   └── fixtures.jl                    # JSON fixture loader
│   ├── golden/
│   ├── cross_validation/
│   ├── properties/
│   ├── stability/
│   ├── edge_cases/
│   ├── snapshots/
│   ├── references/                        # ReferenceTests.jl outputs
│   ├── regressions/                       # Supposition counterexample replays
│   ├── aqua.jl
│   ├── jet.jl
│   ├── doctests.jl
│   └── format.jl
├── benchmarks/
│   ├── Project.toml
│   └── run_benchmarks.jl
├── docs/
│   ├── Project.toml
│   └── src/
├── scripts/audit/
│   ├── Project.toml
│   ├── build_registry.jl
│   ├── render_validation_md.jl
│   ├── coverage_gate.jl
│   ├── regenerate_all_fixtures.sh
│   ├── rederive.sh
│   └── reference_capture/
│       ├── R/
│       └── python/
├── deps/
│   ├── build.jl                           # injects build_sha.jl
│   └── build_sha.jl                       # generated, gitignored
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

## 13. Determinism Checklist

- [x] Julia version pinned via `[compat]` and CI matrix
- [x] `Project.toml` AND `Manifest.toml` both committed
- [x] No `@fastmath` in calculation paths without `# AUDIT-OK:` rationale
- [x] No `@inbounds` without paired boundary test
- [x] No `Float32` for user-facing results
- [x] No `Threads.@threads` over non-associative reductions
- [x] All public calculations fully type-annotated
- [x] `StableRNGs` for randomized tests (not `Random.MersenneTwister`, whose stream is stable but the API is more error-prone for cross-version)
- [x] `--check-bounds=yes` in audit invocations
- [x] `--depwarn=error` in audit invocations
- [x] `Aqua.test_all` and `JET.report_package` clean
- [x] Doctests pass
- [x] Multi-OS, multi-Julia-version matrix
- [x] Build SHA injected via `deps/build.jl`

---

## 14. Honest Limitations vs the Rust Track

For the dossier, document these as known asymmetries:

1. **Property-based testing maturity**: `Supposition.jl` is younger than `proptest`. Shrinking is sometimes weaker; counterexample persistence is manual rather than automatic. Mitigation: hand-rolled `StableRNGs`-driven invariant tests as a backstop, with explicit per-calculation choice in `AUDIT/03_test_traceability_matrix.md`.

2. **Compilation latency**: Julia's TTFX (time-to-first-execution) inflates CI wall-clock. Mitigation: `julia-actions/cache@v2` and PrecompileTools.jl precompile workflows for hot paths.

3. **Manifest.toml as lockfile**: not standard library practice, but mandatory for the audit dossier. Downstream consumers may need to delete the Manifest before resolving — document this in the README.

4. **Type inference fragility**: Julia's flexibility means that adding a method elsewhere can change inference for an existing calculation. JET catches obvious cases; subtle ones surface only via cross-validation. Mitigation: extensive cross-validation tests, treated as a non-negotiable complement to property tests rather than a substitute.

These are filed honestly in `AUDIT/00_known_toolchain_limitations.md` and reviewed quarterly.

---

## 15. Phase Mapping (master plan ↔ Julia addendum)

| Master plan phase | Julia-specific section in this addendum |
|---|---|
| Phase 0 — Recon | §1 (toolchain), §2 (package stack), §14 (limitations) |
| Phase 1 — Registry | `scripts/audit/build_registry.jl` walks `methods()` + AST inspection |
| Phase 2 — References | §4 (`@cited`), §11 layout for `reference_capture/` |
| Phase 3 — Three-tier validation | §5 (`@test_close`), §6 (Supposition), §7 (ReferenceTests) |
| Phase 4 — Stability | §5.2 tolerance policy, `tests/stability/` |
| Phase 5 — Edge cases | `tests/edge_cases/` |
| Phase 6 — Documentation | §8.3 doctests, `render_validation_md.jl` |
| Phase 7 — CI | §10 (`audit.yml`) |
| Phase 8 — Continuous verification | §10 schedule trigger, §11 `just audit` |
| Phase 9 — Re-derivation | `scripts/audit/rederive.sh`, polyglot with Rust |
| Phase 10 — Sign-off | `render_validation_md.jl` writes sign-off block from build SHA |

---

## 16. Cross-Reference With `julia-enterprise-repo` Skill

This addendum is consistent with and extends the `julia-enterprise-repo` v2.1 skill. Specific carry-overs:

- **Typed exception hierarchy** — `Biostatistics.Exceptions` module with `BiostatError <: Exception` root, `NumericalError`, `DomainError`, `ConvergenceError`, `ReferenceMismatchError` subtypes
- **`@audited_calculation` macro** — formalized in §3 above, identical pattern to PedNeoSim.jl
- **`@cited` registry** — formalized in §4 above
- **Mutation tracker** — applies to mutable calculation state if any (rare in pure stats, used in Bayesian sampler state)
- **Build provenance manifest** — generated by `deps/build.jl`
- **Aqua.jl + JET.jl quality gates** — §8
- **CLAUDE.md project config** — included in repo root, instructs Claude Code to read this addendum and the master plan before any change
- **VS Code settings** — committed to `.vscode/` with formatter, test runner, and audit-aware tasks

If a calculation is implemented in both Julia and Rust (a likely outcome for cross-pollinating `rust-sci-core` and `Biostatistics.jl`), Phase 9 cross-language re-derivation becomes the strongest evidence the audit produces. The two addenda are designed to make this comparison mechanical: same fixture JSON, same tolerance policy, same `assert_close` / `@test_close` semantics, same registry IDs.

---

*End of Julia addendum.*
