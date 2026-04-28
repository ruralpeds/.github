# Biostatistics Calculation Audit & Verification Plan

**Repository:** `ruralpeds/biostatistics`
**Plan owner:** Claude Code (executor) / Timothy Hartzog (reviewer)
**Standard target:** FDA 21 CFR Part 11 / IEC 62304 / AAMI TIR57 alignment, NIST StRD methodology, ICH E9 statistical principles
**Plan version:** 1.0
**Created:** April 27, 2026

---

## 0. Mission

Produce defensible, reproducible evidence that **every calculation** in `ruralpeds/biostatistics` returns a numerically correct answer for every documented input domain — and that this evidence is regenerable on demand, machine-checkable in CI, and auditable by a regulator, peer reviewer, or successor maintainer.

The end state is not "the tests pass." The end state is a **Validation Dossier** that, for each calculation, can answer four questions in writing:

1. **What does it compute?** (mathematical specification + citation to the canonical source)
2. **How do we know it computes that?** (golden values, cross-implementation parity, property invariants, stability evidence)
3. **Where does it break?** (documented edge cases, failure modes, numerical limits)
4. **How will we know if it ever stops working?** (CI gates, regression fixtures, monitoring)

---

## 1. Guiding Principles

1. **Three independent witnesses per calculation.** No calculation is considered verified by a single test or a single reference. Every result must be corroborated by (a) a published worked example with a known answer, (b) at least one independent reference implementation (R, Python, or both), and (c) a mathematical property invariant.
2. **Reference precedence is fixed and recorded.** When implementations disagree, the resolution rule is declared in advance: textbook > peer-reviewed reference implementation (R `stats`, `survival`, etc.) > scipy/statsmodels > vendor calculator. Disagreements are not bugs to suppress — they are findings to document.
3. **Tolerance is justified, never default.** Every numerical comparison declares its tolerance (`atol`, `rtol`) and the reason for that tolerance (floating point precision, algorithm-specific rounding, published precision of the reference value).
4. **Tests exist at three altitudes.** Golden-value tests (does it match the textbook example?), cross-validation tests (does it match R/scipy on randomized inputs?), and property-based tests (do mathematical invariants hold for any valid input?).
5. **The audit is reproducible.** Every reference value used in a test cites its source (textbook page, R script + version, scipy version, NIST StRD dataset ID). Generation scripts for cross-validation fixtures live in the repo.
6. **No medical-source policy violations.** Per project standards, any clinically-flavored validation citation is USA-sourced (AAP, AHA, NRP, ACOG, CDC, FDA, NIH); methodologic citations may be international. Bart D. Ehrman is not used in any context (does not apply here, but flagged for completeness).
7. **Audit logging is built in.** Every calculation in the codebase eventually emits a structured audit record (calculation name, inputs hash, output, version, timestamp) when invoked in audit mode — consistent with the `julia-enterprise-repo` standard.

---

## 2. Phase 0 — Repository Reconnaissance

**Goal:** Complete situational awareness before any test is written.

### 2.1 Tasks

- Clone `ruralpeds/biostatistics` to working directory.
- Detect primary language(s): Rust (likely `sci-stats`, `sci-bayes`, `sci-quality` extensions), Julia, Python, or polyglot. Record in `AUDIT/00_recon.md`.
- Inventory test infrastructure:
  - Rust: `cargo test`, presence of `proptest`, `quickcheck`, `criterion`, `insta`.
  - Julia: `Test`, `Aqua.jl`, `JET.jl`, `ReferenceTests.jl`.
  - Python: `pytest`, `hypothesis`, `pytest-benchmark`, `numpy.testing`.
- Inventory existing CI: `.github/workflows/`. Note what runs, on what triggers, with what coverage thresholds.
- Map the dependency graph: which modules call which? Use `cargo tree`, `Pkg.dependencies()`, or `pipdeptree`. Identify leaf modules (pure calculations, no internal dependencies) — these get audited first.
- Generate `AUDIT/00_recon.md` containing:
  - Languages, build systems, dependency manager versions
  - Top-level module list with one-line description per module
  - Existing test count and pass/fail status at HEAD
  - Existing coverage percentage (if measurable)
  - Existing CI workflows and what they verify
  - Known TODOs, FIXMEs, or `unimplemented!` / `error("not implemented")` markers in calculation paths

### 2.2 Deliverables

- `AUDIT/00_recon.md` — repository situational report
- `AUDIT/00_module_dependency_graph.svg` — visual dependency map
- `AUDIT/00_baseline_metrics.json` — pre-audit metrics (test count, coverage, build time)

### 2.3 Success criteria

- Every module in the public API surface is listed
- Every existing test is mapped to the calculation it validates (or flagged as unmapped)
- Baseline build is green; if not, recon ends with a remediation note

---

## 3. Phase 1 — Calculation Inventory & Taxonomy

**Goal:** Build a complete, structured registry of every calculation the library performs. Nothing gets audited that is not in the registry; nothing gets shipped that is not audited.

### 3.1 Tasks

- Walk every public function. For each one that returns a numerical value (scalar, vector, matrix, distribution, struct of numerical fields), create a registry entry.
- Use AST-level introspection where possible:
  - Rust: parse `pub fn` signatures with `syn`; flag any returning numeric types or types containing numeric fields.
  - Julia: `methods()` enumeration + `@code_warntype` to confirm numeric return.
  - Python: `inspect.signature` + type annotations.
- Categorize each calculation into the **biostatistics taxonomy** (Appendix A).
- For each entry, record:
  - Fully qualified name (module path + function name)
  - One-line specification ("computes Welch's two-sample t-test statistic, df, and two-sided p-value")
  - Input domain (parameter types and admissible ranges)
  - Output domain (return type and admissible ranges)
  - Taxonomy category and subcategory
  - Risk tier (see 3.2)
  - Current test status (untested / smoke / golden / cross-validated / property-tested)

### 3.2 Risk tiering

Each calculation gets a tier that drives how much validation effort it receives.

| Tier | Definition | Examples | Required validation |
|------|------------|----------|---------------------|
| **T1 — Critical** | Output may directly inform clinical decisions or regulatory submissions | Diagnostic test metrics, sample size for clinical trials, survival HR, dose-response | Golden + cross-validation + property + stability + edge case + audit log |
| **T2 — Foundational** | Building block used by T1 calculations | Mean, variance, CDFs, log-likelihood kernels, optimization routines | Golden + cross-validation + property + stability |
| **T3 — Convenience** | Display, formatting, summary helpers that wrap verified calculations | Pretty-printers, table builders, plot data shapers | Golden values for representative cases |
| **T4 — Experimental** | Behind a feature flag; not part of supported API | Research prototypes, unstable algorithms | Smoke tests + clear `experimental` marker |

### 3.3 Deliverables

- `AUDIT/01_calculation_registry.json` — machine-readable registry, one entry per calculation, conforming to schema in Appendix D
- `AUDIT/01_calculation_registry.md` — human-readable rendering of the same data
- `AUDIT/01_taxonomy_coverage.md` — heatmap of taxonomy categories vs. coverage status

### 3.4 Success criteria

- Every public numerical function appears in the registry
- Every entry has a tier, a category, and a current-status field
- Registry is generated by a script (`scripts/audit/build_registry.{rs,jl,py}`) so it can be regenerated on demand
- A CI job fails if a public function is added without a registry entry

---

## 4. Phase 2 — Reference Standard Registry

**Goal:** For every calculation in the registry, identify the authoritative source(s) of truth.

### 4.1 Reference hierarchy

Order of precedence when references disagree:

1. **Closed-form analytical truth** (e.g., Beta(1,1) is uniform; t with df=∞ is normal)
2. **Published worked examples in established textbooks** with explicit numerical answers (Rosner, Altman, Kirkwood & Sterne, Hosmer & Lemeshow, Collett, Fleiss)
3. **NIST Statistical Reference Datasets (StRD)** for descriptive stats, ANOVA, regression, nonlinear regression
4. **Peer-reviewed reference implementations** with documented numerical methods:
   - R `stats`, `survival`, `lme4`, `nlme`, `MASS`, `epiR`, `pwr`, `meta`, `metafor`, `pROC`, `boot`, `exact2x2`, `PropCIs`, `binom`, `Hmisc`, `rms`
   - Python `scipy.stats`, `statsmodels`, `lifelines`, `pingouin`
5. **Independent re-derivation** in a CAS (SymPy, Mathematica) for closed-form results
6. **Vendor-validated calculators** as final cross-check only (OpenEpi, GraphPad, SAS PROC outputs when published)

### 4.2 Tasks

- For each registry entry, populate a `references` block with at least two independent entries from the hierarchy above.
- For textbook references, record: author, title, edition, year, page or example number, the input values, and the published answer.
- For software references, record: package, version, function call signature with argument values, and the captured output.
- Build `scripts/audit/reference_capture/` containing R scripts (`.R`) and Python scripts (`.py`) that **regenerate every cross-validation fixture from scratch**, with package versions pinned via `renv.lock` (R) and `requirements.txt` + `pip freeze` (Python) committed alongside.
- Capture all reference outputs to `AUDIT/fixtures/` as JSON, with a deterministic schema: `{calculation, inputs, expected_output, source, source_version, capture_date, hash}`.

### 4.3 Deliverables

- `AUDIT/02_reference_registry.json` — every calculation mapped to ≥2 references
- `AUDIT/fixtures/` — captured reference values
- `scripts/audit/reference_capture/` — regeneration scripts + lockfiles
- `AUDIT/02_reference_provenance.md` — narrative explaining why each reference was chosen and what it does and does not validate

### 4.4 Success criteria

- No T1 or T2 calculation has fewer than two independent references
- Every fixture file has a regeneration script and the regeneration produces a byte-identical (modulo timestamps) result
- All software references have pinned versions

---

## 5. Phase 3 — Three-Tier Validation Architecture

**Goal:** Implement the actual tests. This is the heaviest phase by code volume.

### 5.1 Tier 1: Golden-value tests

Worked examples from textbooks and NIST StRD, embedded as named tests with citations in the test docstring.

```rust
/// Rosner, Fundamentals of Biostatistics, 8th ed., Example 7.4, p. 224.
/// Two-sample t-test, equal variances assumed.
/// FEV1 in smokers (n=100, mean=2.55, sd=0.61) vs nonsmokers (n=100, mean=2.78, sd=0.55).
/// Published: t = -2.80, df = 198, p = 0.0056 (two-sided).
#[test]
fn rosner_ex_7_4_two_sample_t_equal_var() {
    let result = two_sample_t(
        Sample { n: 100, mean: 2.55, sd: 0.61 },
        Sample { n: 100, mean: 2.78, sd: 0.55 },
        Variance::Equal,
        Tail::Two,
    );
    assert_close!(result.t, -2.80, atol = 0.01);     // textbook precision: 2 decimals
    assert_eq!(result.df, 198.0);
    assert_close!(result.p, 0.0056, rtol = 0.01);    // textbook precision: 2 sig figs
}
```

Every golden test has:
- Citation comment (textbook + page, or NIST StRD dataset ID)
- Input values verbatim from the source
- Expected values verbatim from the source
- Tolerance justified by the precision the source publishes to

### 5.2 Tier 2: Cross-implementation validation

For each calculation, generate a **fixture matrix** of randomized but fixed-seed inputs spanning the input domain, run them through the reference implementation (R or scipy), and store the expected outputs. The library's tests then read the fixture and assert match.

Process:
1. `scripts/audit/reference_capture/<calc>.R` (or `.py`) generates 50–500 input cases with a fixed RNG seed
2. For each case, computes the answer in the reference implementation
3. Writes `AUDIT/fixtures/<calc>.json`
4. Library test reads the fixture, runs the same inputs through the library, and compares with declared tolerance

Tolerances:
- For analytical computations (CDFs, p-values from closed-form distributions): `rtol = 1e-12`
- For iterative computations (MLE, optimization, Cox PH): `rtol = 1e-6` typically; document the convergence criterion
- For bootstrap or simulation-based methods: tolerance documented per method, with the seed pinned and the iteration count fixed

### 5.3 Tier 3: Property-based tests

Use `proptest` (Rust), `Hypothesis` (Python), or hand-rolled generators (Julia) to assert mathematical invariants over arbitrary valid inputs. Property catalog in Appendix C.

Example invariants:
- A p-value is always in `[0, 1]`
- A two-sided p-value equals twice the smaller one-sided p-value (for symmetric distributions)
- A 95% CI contains the point estimate (for symmetric CIs around the estimate)
- Wilson and Clopper-Pearson CIs for a proportion always lie within `[0, 1]` (Wald CI famously does **not** — that's a property test that **must fail** to prove the test is real)
- Doubling sample size narrows a CI width by approximately √2
- Swapping the two groups in a symmetric two-sample test flips the sign of the test statistic but preserves the absolute value and the p-value
- A CDF is monotone non-decreasing
- A PDF integrates to 1 (numerically, within tolerance) over its support
- Cox PH hazard ratio is invariant under monotone transformation of follow-up time
- Sensitivity = TP / (TP + FN); Specificity = TN / (TN + FP); these are bounded `[0, 1]` and sum to ≥ 1 only in degenerate cases
- For a Kaplan-Meier curve, S(t) is monotone non-increasing, S(0) = 1, S(∞) ≤ S(t) for all t

### 5.4 Deliverables

- `tests/golden/` — Tier 1 tests, organized by taxonomy category
- `tests/cross_validation/` — Tier 2 tests, reading from `AUDIT/fixtures/`
- `tests/properties/` — Tier 3 property tests
- `AUDIT/03_test_traceability_matrix.md` — every registry entry mapped to its test files

### 5.5 Success criteria

- Every T1 calculation has ≥1 test in each tier
- Every T2 calculation has ≥1 test in tiers 1 and 2, and ≥1 invariant in tier 3
- All tests pass on the supported platform matrix
- Test traceability matrix has zero rows with empty cells in required columns

---

## 6. Phase 4 — Numerical Stability Audit

**Goal:** Document and test the numerical limits of every calculation.

### 6.1 Failure modes to probe

- **Catastrophic cancellation**: subtracting near-equal large numbers. Classic example: naive variance via `E[X²] − (E[X])²`. Test that the implementation uses Welford's online algorithm or a two-pass method, and verify against pathological inputs (e.g., NIST `NumAcc1`–`NumAcc4`).
- **Overflow / underflow**: log-sum-exp for likelihoods, log-gamma for combinatorics, log-space probability computations. Probe with extreme inputs.
- **Loss of precision in CDF tails**: e.g., `1 - pnorm(z)` for large z loses precision; correct version uses `pnorm(z, lower.tail = FALSE)`. Test tail probabilities at z = 5, 6, 7, 8.
- **Convergence failures**: MLE or Cox PH that does not converge. Test that the library detects non-convergence and surfaces it (does not silently return last iterate).
- **Singular matrices**: regression with collinear predictors. Test that the library detects singularity and reports it.
- **Small-sample corrections**: Hedges' g vs Cohen's d, Welch–Satterthwaite df, exact vs asymptotic tests. Document which correction is used and where the asymptotic approximation breaks.
- **Tie handling**: Wilcoxon, log-rank, Spearman with ties. Test against the exact and approximate tie-corrected versions (R `wilcox.test(exact=TRUE)` vs default).

### 6.2 Tasks

- For each T1 and T2 calculation, write a `stability_<calc>` test module that probes its known failure modes.
- Use NIST StRD's Lower-Level Information for descriptive statistics, ANOVA, and linear regression — these datasets are designed to expose numerical instability.
- For distribution functions, test extreme tails (e.g., `pnorm(8)` should be ≈ 6.22e-16, not 0 or 1).
- Document, per calculation, the **certified input domain** — the range of inputs where the result is guaranteed to be within declared tolerance. Inputs outside this domain either return a typed error or a flagged result, never a silently wrong number.

### 6.3 Deliverables

- `tests/stability/` — stability test modules
- `AUDIT/04_certified_input_domains.md` — per-calculation domain declarations
- `AUDIT/04_known_numerical_limits.md` — narrative catalog of every probed failure mode and how the library handles it

### 6.4 Success criteria

- Every T1 and T2 calculation has a documented certified input domain
- Every documented failure mode has a corresponding test
- No calculation silently returns a wrong number for an input it accepts; either the input is rejected, the result is flagged, or the result meets declared tolerance

---

## 7. Phase 5 — Edge Case & Failure Mode Catalog

**Goal:** Probe boundaries that ordinary tests miss.

### 7.1 Edge cases to enumerate per calculation

- Empty input (n=0)
- Single observation (n=1)
- All identical values (zero variance)
- One value differs by epsilon
- Negative values where positivity is assumed
- Zero counts in contingency tables (Haldane–Anscombe correction territory)
- Perfect separation in logistic regression
- All events / no events in survival data
- Censoring at t=0
- Missing values: `NaN`, `None`, `missing` — does the library propagate, drop, or error?
- Integer vs float inputs (silent coercion can introduce subtle bugs)
- Very small probabilities (`p < 1e-300`)
- Very large counts (overflow in factorials, combinatorials)
- Unicode in factor labels (categorical regression)
- Zero-width confidence intervals (when SE = 0)

### 7.2 Tasks

- For each calculation, enumerate applicable edge cases from the master list (Appendix C.4).
- Write a test for each: assert either the correct numerical answer or an explicit, typed error.
- Confirm error messages include the calculation name and the offending input characteristic.

### 7.3 Deliverables

- `tests/edge_cases/` — edge case tests
- `AUDIT/05_edge_case_matrix.md` — calculation × edge case matrix with handling declared

### 7.4 Success criteria

- Every applicable edge case is tested
- Every error path emits a typed error with diagnostic information
- No edge case causes a panic, segfault, infinite loop, or silently wrong result

---

## 8. Phase 6 — Regulatory-Grade Documentation

**Goal:** Produce per-module Validation Statements that a reviewer can read in 10 minutes and understand exactly what was tested and why.

### 8.1 Per-module deliverable: `<module>/VALIDATION.md`

Every calculation module gets a `VALIDATION.md` next to its source, with this structure:

1. **Module purpose** — one paragraph
2. **Calculations covered** — table linking to registry entries
3. **Mathematical specifications** — for each calculation, the formula and citation
4. **Reference sources** — for each calculation, the references used
5. **Test inventory** — for each calculation, links to golden / cross / property / stability / edge case tests
6. **Certified input domains** — copied from Phase 4
7. **Known numerical limits** — copied from Phase 4
8. **Disagreements and resolutions** — any case where two references disagree, the resolution, the reasoning
9. **Open issues** — anything not yet validated, with target date and tier
10. **Change log** — when this VALIDATION.md was last regenerated, by what audit run, against what code SHA
### 8.2 Repository-wide deliverable: `AUDIT/VALIDATION_DOSSIER.md`

A single document indexing every module's `VALIDATION.md`, summarizing:

- Total calculations by tier
- Coverage status (validated / partial / unvalidated)
- Open audit findings
- Deferred items with rationale
- Sign-off block (auditor, date, code SHA, fixture hashes)

### 8.3 Tasks

- Generate `VALIDATION.md` per module via a script (`scripts/audit/render_validation_md.{rs,jl,py}`) that reads the registry, fixtures, and test traceability matrix.
- Make regeneration idempotent: running it twice on the same repo state produces byte-identical output.
- Bind the dossier to a code SHA: the dossier header records the git SHA it was built from, and CI fails if the dossier is older than HEAD.

### 8.4 Success criteria

- Every module with a calculation has a `VALIDATION.md`
- `AUDIT/VALIDATION_DOSSIER.md` exists, is current with HEAD, and passes a CI freshness check
- A reviewer with no prior knowledge can read a `VALIDATION.md` and reproduce every cited test result by running a single command

---

## 9. Phase 7 — CI/CD Gates

**Goal:** Make it impossible to merge a regression.

### 9.1 Required gates (block merge on failure)

- `cargo test --all` (or Julia `Pkg.test()` / `pytest`) — all tiers pass
- `cargo test --release` — release-mode pass to catch optimization-induced bugs
- Coverage gate: ≥ 95% line coverage on T1 calculations, ≥ 85% on T2, measured by `cargo-llvm-cov` / `Coverage.jl` / `coverage.py`
- Fixture freshness check: every fixture's hash matches the regeneration script output
- Registry completeness: every public numerical function has a registry entry
- Documentation freshness: `VALIDATION_DOSSIER.md` SHA matches HEAD
- Numerical regression: snapshot tests using `insta` (Rust) or `ReferenceTests.jl` for any calculation whose output was previously certified — any change requires explicit review
- Multi-OS matrix: Linux, macOS (Apple Silicon — your Mac Studio target), Windows. Catches platform-specific floating point quirks (e.g., x87 80-bit on legacy Windows)

### 9.2 Advisory gates (warn but do not block)

- Performance regression: `criterion` / `BenchmarkTools` benchmarks run on every PR; warn if any T1 calculation regresses >10%
- Aqua.jl / JET.jl (Julia), `clippy -- -D warnings` (Rust), `ruff` + `mypy` (Python) — code quality

### 9.3 Tasks

- Author `.github/workflows/audit.yml` implementing the above
- Add a `make audit` (or `just audit`) target that runs the full audit suite locally
- Integrate hygiene workflow from the April 23, 2026 sweep (`hygiene.yml`)
- Pin all CI tool versions; bump via Renovate or Dependabot with a label that triggers a fresh fixture regeneration

### 9.4 Deliverables

- `.github/workflows/audit.yml`
- `Makefile` or `justfile` with `audit`, `audit-fast`, `audit-fixtures-regenerate` targets
- `AUDIT/07_ci_gates.md` describing each gate, its purpose, and its failure mode

---

## 10. Phase 8 — Continuous Verification

**Goal:** The audit is not a one-shot artifact. It must remain valid as code, references, and dependencies evolve.

### 10.1 Recurring tasks

- **Quarterly fixture regeneration**: re-run `scripts/audit/reference_capture/` against current R / Python versions. Diff against committed fixtures. Any change requires a documented review.
- **Annual textbook reference review**: confirm cited editions are still current; if a new edition supersedes an example, update the citation and re-run the test.
- **Dependency update protocol**: any change to a numerical dependency (e.g., a `nalgebra` or `LinearAlgebra` bump) triggers a full audit suite run before merge.
- **Audit log review**: structured logs from `@audited_calculation` (Julia) or equivalent Rust/Python instrumentation are reviewed quarterly for unexpected input distributions or convergence failures in production.

### 10.2 Triggered re-validation

Any of these triggers a partial or full re-audit:

- New calculation added → registry entry + Tier 1/2/3 tests required before merge
- Calculation signature changed → re-run cross-validation; update fixtures if input domain changed
- Numerical algorithm changed (e.g., switching from Welford to Chan) → full re-run of stability suite + property tests for that calculation
- Reference implementation publishes a numerical correction → diff against new behavior; document divergence and decide whether to track or stay

### 10.3 Deliverables

- `AUDIT/08_continuous_verification_runbook.md` — the operational runbook
- `.github/ISSUE_TEMPLATE/audit_finding.md` — template for filing findings discovered during continuous verification

---

## 11. Phase 9 — Independent Re-derivation Sanity Check

**Goal:** Catch cases where the library, the textbook, and the reference implementation all share the same bug.

### 11.1 Tasks

For a sampled subset of T1 calculations (≥ 20% of T1, randomly selected), perform an **independent re-derivation**:

- Re-implement the calculation from the published formula in a different language than the library uses (if library is Rust, use Julia or Python; if Julia, use Rust or Python).
- Use a CAS (SymPy) for closed-form re-derivation where possible.
- Compute the answer for the canonical worked example.
- Compare to the library, the textbook, and the reference implementation.

This is the "four-way agreement" check. Three-way agreement among textbook, R, and library can hide a propagated error in the formula; a fourth independent path reduces that risk substantially.

### 11.2 Deliverables

- `AUDIT/09_independent_rederivation/` — one subfolder per re-derived calculation, containing the alternate implementation, the comparison output, and a written conclusion

---

## 12. Phase 10 — Sign-off & Dossier Closure

**Goal:** Declare the audit complete (for this version), with a dated, hashed sign-off.

### 12.1 Closure checklist

- [ ] All registry entries have status ≥ "validated to required tier"
- [ ] All `VALIDATION.md` files are current with HEAD
- [ ] `VALIDATION_DOSSIER.md` is current with HEAD
- [ ] All fixtures regenerate to byte-identical output from pinned reference scripts
- [ ] All CI gates green on the supported platform matrix
- [ ] Independent re-derivation sample is complete with no unresolved findings
- [ ] Open findings are either resolved, deferred with documented rationale, or filed as issues with target dates
- [ ] Audit run hash and code SHA are recorded in the dossier sign-off block

### 12.2 Sign-off block

```
Audit version: 1.0
Audit run hash: <sha256 of dossier + fixtures + registry>
Code SHA: <git rev-parse HEAD>
Date: <ISO 8601 UTC>
Auditor: <name>
Tooling versions: <pinned R, Python, Rust, Julia versions>
Findings: <count by severity>
Deferred items: <count, link to issues>
```

---

## Appendix A — Biostatistics Calculation Taxonomy

Categories the library is presumed or expected to cover, with examples. Adapt during Phase 1 to the actual repo contents.

### A.1 Descriptive statistics
Mean, median, geometric mean, harmonic mean, mode, variance (sample / population), standard deviation, MAD, IQR, percentiles (linear, weighted, type 1–9), trimmed mean, winsorized mean, skewness, kurtosis, coefficient of variation, weighted statistics.

### A.2 Probability distributions
Normal, t, chi-square, F, binomial, Poisson, negative binomial, beta, gamma, exponential, Weibull, log-normal, hypergeometric, multinomial, Dirichlet, beta-binomial. For each: PDF/PMF, CDF, inverse CDF (quantile), random sampling, MLE estimators.

### A.3 Hypothesis tests — parametric
One-sample t, two-sample t (equal var, Welch), paired t, one-way ANOVA, two-way ANOVA, repeated-measures ANOVA, MANOVA, Levene's test, Bartlett's test, F-test for variance, Hotelling's T².

### A.4 Hypothesis tests — non-parametric
Wilcoxon signed-rank, Mann-Whitney U, Kruskal-Wallis, Friedman, sign test, Wald-Wolfowitz runs test, Kolmogorov-Smirnov, Anderson-Darling, Shapiro-Wilk, Cramér–von Mises.

### A.5 Categorical data
Pearson chi-square, Yates-corrected chi-square, Fisher exact (2×2 and r×c), Barnard exact, Boschloo exact, McNemar (asymptotic + exact), Cochran-Mantel-Haenszel, Cochran's Q, Stuart-Maxwell.

### A.6 Effect sizes
Cohen's d, Hedges' g, Glass's Δ, OR, RR, RD, NNT, NNH, log OR with SE, eta², partial eta², omega², Cramer's V, phi, Cohen's w, Cohen's h, Cohen's f, r (point-biserial, Pearson), Spearman ρ, Kendall τ.

### A.7 Confidence intervals for proportions and rates
Wald, Wilson, Wilson with continuity correction, Clopper-Pearson (exact), Agresti-Coull, Jeffreys, Newcombe (difference of two proportions), Miettinen-Nurminen, Wilson score for ratios, exact Poisson rate.

### A.8 Diagnostic accuracy
Sensitivity, specificity, PPV, NPV, prevalence, accuracy, Youden's J, LR+, LR−, DOR, ROC AUC (trapezoidal, DeLong), optimal cutoff (Youden, closest-to-corner, cost-weighted), Fagan / pre-test–post-test probability, NRI, IDI.

### A.9 Regression
Simple linear, multiple linear, weighted least squares, ridge, lasso, elastic net, logistic (binary, multinomial, ordinal), Poisson, negative binomial, zero-inflated Poisson / NB, Tobit, quantile regression. Diagnostics: residuals (raw, standardized, studentized, Pearson, deviance), leverage, Cook's distance, DFBETAs, VIF.

### A.10 Survival analysis
Kaplan-Meier estimate + Greenwood SE, log-rank test (unstratified, stratified), Peto-Peto, Tarone-Ware, Cox proportional hazards (Breslow, Efron, exact ties), Schoenfeld residuals, time-dependent covariates, frailty models, parametric survival (Weibull, exponential, log-normal, log-logistic), competing risks (Fine-Gray), restricted mean survival time, Kaplan-Meier confidence bands.

### A.11 Multilevel and longitudinal
Linear mixed effects (REML, ML), generalized linear mixed models, GEE (exchangeable, AR1, unstructured), ICC (one-way, two-way, agreement, consistency), Bland-Altman limits of agreement.

### A.12 Bayesian methods
Conjugate updates (beta-binomial, normal-normal, gamma-Poisson), credible intervals (HDI, equal-tail), Bayes factors, posterior predictive checks, MCMC diagnostics (R-hat, ESS, divergences). If implementing samplers: NUTS, Metropolis-Hastings.

### A.13 Meta-analysis
Inverse-variance fixed-effect, Mantel-Haenszel, Peto OR, DerSimonian-Laird, REML, Paule-Mandel, Hartung-Knapp adjustment, I², Q, τ², H², prediction intervals, Egger's test, Begg's test, trim-and-fill, leave-one-out.

### A.14 Sample size and power
Single proportion, difference of two proportions, single mean, difference of two means (equal/unequal var), paired means, ANOVA, correlation, regression, Cox PH (Schoenfeld, Freedman), survival (log-rank), equivalence (TOST), non-inferiority, cluster-randomized (with ICC inflation).

### A.15 Statistical process control (your quality work)
X̄-R, X̄-S, I-MR, p, np, c, u, EWMA, CUSUM (V-mask, decision interval), Western Electric / Nelson rules, capability indices (Cp, Cpk, Pp, Ppk).

### A.16 Risk and clinical prediction
Logistic prediction with calibration (Hosmer-Lemeshow, calibration slope/intercept), discrimination (C-statistic, optimism-corrected via bootstrap), decision curve analysis, NRI / IDI, recalibration, score thresholds.

---

## Appendix B — Reference Source Registry

### B.1 Textbooks (USA-centric, methodologic)

| Source | Use |
|--------|-----|
| Rosner, *Fundamentals of Biostatistics*, 8th ed. | General biostatistics worked examples |
| Altman, *Practical Statistics for Medical Research* | Clinical statistics, CI methods |
| Kirkwood & Sterne, *Essential Medical Statistics*, 2nd ed. | General medical statistics |
| Hosmer, Lemeshow & Sturdivant, *Applied Logistic Regression*, 3rd ed. | Logistic regression worked examples |
| Collett, *Modelling Survival Data in Medical Research*, 3rd ed. | Survival analysis worked examples |
| Fleiss, Levin & Paik, *Statistical Methods for Rates and Proportions*, 3rd ed. | Categorical data, agreement |
| Borenstein et al., *Introduction to Meta-Analysis* | Meta-analysis worked examples |
| Harrell, *Regression Modeling Strategies*, 2nd ed. | Predictive modeling, validation |
| Steyerberg, *Clinical Prediction Models*, 2nd ed. | Clinical prediction, decision curves |
| Montgomery, *Introduction to Statistical Quality Control*, 8th ed. | SPC charts, capability |

### B.2 Reference datasets

- **NIST Statistical Reference Datasets (StRD)**: https://www.itl.nist.gov/div898/strd/ — descriptive statistics, ANOVA, linear regression, nonlinear regression, with certified values to ≥10 significant digits
- **Anscombe's quartet**: visualization sanity checks (identical summary stats, different shapes)
- **Datasaurus dozen**: similar role for modern visualization testing

### B.3 Reference software (pin versions in lockfiles)

| Domain | R | Python |
|--------|---|--------|
| Core distributions, tests | `stats` (base) | `scipy.stats` |
| Regression, mixed models | `stats`, `lme4`, `nlme`, `MASS` | `statsmodels` |
| Survival | `survival` | `lifelines` |
| Effect sizes, power | `pwr`, `effectsize` | `pingouin`, `statsmodels.stats.power` |
| Categorical / exact | `exact2x2`, `Exact`, `epitools`, `epiR` | `scipy.stats`, `statsmodels.stats` |
| Proportions CIs | `binom`, `PropCIs` | `statsmodels.stats.proportion` |
| ROC / diagnostics | `pROC`, `OptimalCutpoints`, `DiagnosisMed` | `scikit-learn`, `pROC` via `rpy2` |
| Meta-analysis | `meta`, `metafor` | `pymetaanalysis`, `statsmodels` (limited) |
| SPC | `qcc`, `qicharts2` | (R is canonical here) |

### B.4 Online cross-checks (final corroboration only, never primary reference)

OpenEpi, Epi Info, GraphPad QuickCalcs, MedCalc, sample size calculators at PS (Vanderbilt) and Sealed Envelope.

---

## Appendix C — Property Invariant Catalog (excerpt)

A starter list. Expand during Phase 3. Every invariant gets a property test.

### C.1 Universal numerical
- All probabilities ∈ [0, 1]
- All p-values ∈ [0, 1]
- All variances ≥ 0
- All standard errors ≥ 0
- CDF is monotone non-decreasing
- PMF / PDF non-negative
- CDF approaches 0 at −∞ and 1 at +∞

### C.2 Test statistics
- Two-sided p ≥ one-sided p (for symmetric distributions: 2× one-sided when test statistic on the corresponding side)
- p-value of a sample tested against itself ≈ 1 (degenerate case)
- Swapping groups in symmetric two-sample test: |statistic| invariant, p invariant
- Larger n with same effect → smaller p (monotone in n for fixed effect)

### C.3 Confidence intervals
- 95% CI contains the point estimate
- Higher confidence → wider CI (CI_99 ⊇ CI_95 ⊇ CI_90)
- Larger n → narrower CI (width ∝ 1/√n asymptotically)
- Wilson, Clopper-Pearson, Agresti-Coull, Jeffreys all ⊆ [0, 1]
- **Wald CI for proportion is NOT ⊆ [0, 1]** — this property test is expected to fail; documenting that failure is the point

### C.4 Edge case master list
- n = 0, n = 1, n = 2
- All identical values
- One-value-differs by ε
- Maximum-variance arrangement
- All zeros / all ones (binary outcomes)
- Perfect separation (logistic)
- All censored / no censored (survival)
- Censoring at t = 0
- NaN, Inf, missing inputs
- Integer overflow boundaries
- Sub-normal floats
- Probabilities at machine epsilon and 1 − machine epsilon

### C.5 Domain-specific
- Kaplan-Meier: S(0) = 1, S monotone non-increasing, S(t) ∈ [0, 1]
- Cox PH: HR invariant under monotone time transform
- ROC AUC: invariant under monotone score transform
- Diagnostic metrics: sensitivity + (1 − sensitivity) = 1 trivially; PPV depends on prevalence (Bayesian invariant testable)
- Meta-analysis I²: ∈ [0, 100%]
- SPC charts: in-control ARL ≥ out-of-control ARL for any shift > 0

---

## Appendix D — Suggested Directory Layout

```
biostatistics/
├── src/                              # library source
├── tests/
│   ├── golden/                       # Tier 1 (textbook worked examples)
│   ├── cross_validation/             # Tier 2 (R / scipy fixtures)
│   ├── properties/                   # Tier 3 (property-based)
│   ├── stability/                    # Phase 4 (numerical limits)
│   └── edge_cases/                   # Phase 5 (boundaries)
├── benches/                          # criterion / BenchmarkTools
├── scripts/audit/
│   ├── build_registry.{rs,jl,py}
│   ├── render_validation_md.{rs,jl,py}
│   └── reference_capture/
│       ├── R/
│       │   ├── ttest.R
│       │   ├── survival.R
│       │   └── renv.lock
│       └── python/
│           ├── ttest.py
│           ├── survival.py
│           └── requirements.txt
├── AUDIT/
│   ├── 00_recon.md
│   ├── 01_calculation_registry.{json,md}
│   ├── 01_taxonomy_coverage.md
│   ├── 02_reference_registry.json
│   ├── 02_reference_provenance.md
│   ├── 03_test_traceability_matrix.md
│   ├── 04_certified_input_domains.md
│   ├── 04_known_numerical_limits.md
│   ├── 05_edge_case_matrix.md
│   ├── 07_ci_gates.md
│   ├── 08_continuous_verification_runbook.md
│   ├── 09_independent_rederivation/
│   ├── fixtures/
│   │   ├── ttest_welch.json
│   │   ├── kaplan_meier.json
│   │   └── ...
│   └── VALIDATION_DOSSIER.md
├── .github/
│   ├── workflows/
│   │   ├── audit.yml
│   │   ├── hygiene.yml
│   │   └── ...
│   └── ISSUE_TEMPLATE/audit_finding.md
└── Makefile / justfile
```

### D.1 Registry entry schema (JSON)

```json
{
  "id": "stats.ttest.welch",
  "fully_qualified_name": "biostatistics::stats::ttest::welch",
  "specification": "Welch's two-sample t-test for unequal variances. Returns t-statistic, Welch-Satterthwaite degrees of freedom, and two-sided p-value.",
  "input_domain": {
    "x": "non-empty vector of finite f64",
    "y": "non-empty vector of finite f64",
    "alternative": "Two | Less | Greater"
  },
  "output_domain": {
    "t": "finite f64",
    "df": "f64 ≥ 1",
    "p": "f64 ∈ [0, 1]"
  },
  "category": "hypothesis_tests.parametric",
  "tier": "T2",
  "references": [
    {"type": "textbook", "source": "Rosner 8e", "example": "7.4", "page": 224},
    {"type": "software", "source": "R stats::t.test", "version": "4.4.1"}
  ],
  "tests": {
    "golden": ["tests/golden/ttest.rs::welch_rosner_7_4"],
    "cross_validation": ["tests/cross_validation/ttest.rs::welch_fixture"],
    "property": ["tests/properties/ttest.rs::welch_pvalue_in_unit_interval"],
    "stability": ["tests/stability/ttest.rs::welch_extreme_variance_ratio"],
    "edge_cases": ["tests/edge_cases/ttest.rs::welch_n_equals_2"]
  },
  "certified_input_domain": "n_x ≥ 2, n_y ≥ 2, finite values, var_x + var_y > 0",
  "audit_log_emitter": "biostatistics::audit::ttest_welch_v1",
  "validation_status": "validated",
  "last_audit_run": "2026-04-27T00:00:00Z",
  "last_audit_code_sha": "abc123..."
}
```

---

## Appendix E — Suggested Claude Code Slash Commands

To wrap this plan in your Claude Code workflow:

| Command | Action |
|---------|--------|
| `/audit-recon` | Execute Phase 0 |
| `/audit-registry` | Execute Phase 1, regenerate registry |
| `/audit-references <calculation>` | Capture/refresh references for one calculation |
| `/audit-fixtures-regenerate` | Re-run all R/Python capture scripts, diff against committed fixtures |
| `/audit-add <calculation>` | Scaffold registry entry + 5 test files for a new calculation |
| `/audit-validate-module <path>` | Run all tiers for one module, regenerate its `VALIDATION.md` |
| `/audit-dossier` | Regenerate `VALIDATION_DOSSIER.md` against HEAD |
| `/audit-rederive <calculation>` | Phase 9 independent re-derivation for one calculation |
| `/audit-signoff` | Run closure checklist; if green, write sign-off block to dossier |

---

## Appendix F — Execution Sequencing for Claude Code

A recommended order of operations once this plan is in the repo:

1. **Week 1:** Phases 0–1 (recon + registry). Output: complete inventory, no tests yet.
2. **Week 2:** Phase 2 (reference registry) + scaffolding for Phase 3. Output: fixtures captured for top 20% of calculations by tier weight.
3. **Weeks 3–5:** Phase 3 (three-tier validation), prioritizing T1, then T2, then T3. Output: green test suite for all T1.
4. **Week 6:** Phases 4–5 (stability + edge cases). Output: every T1/T2 has documented limits and edge tests.
5. **Week 7:** Phase 6 (documentation) + Phase 7 (CI). Output: `VALIDATION.md` per module, CI gates active.
6. **Week 8:** Phase 9 (independent re-derivation sample) + Phase 10 (sign-off).
7. **Ongoing:** Phase 8 (continuous verification).

Adjust based on T1 count from Phase 1 — if there are >50 T1 calculations, expand Weeks 3–5 accordingly.

---

## Appendix G — What "Proven Correct" Actually Means Here

A note on epistemic humility, since this is a clinical-adjacent library.

This audit does not produce a mathematical proof of correctness. What it produces is:

1. **Correspondence with reference truth** — the library agrees with textbook-published answers and with mature reference implementations across a documented input domain, within documented tolerance.
2. **Conformance to mathematical structure** — invariants that must hold for any correct implementation are tested over randomized inputs.
3. **Bounded failure** — outside the certified input domain, the library either rejects the input with a typed error, returns a flagged result, or its behavior is explicitly documented.
4. **Reproducible evidence** — every claim above is regenerable from pinned references on demand.
5. **Continuous attestation** — CI prevents regression; quarterly review prevents reference drift.

The remaining residual risk is what regulators call *known unknowns*: cases where the library, the textbook, and the reference implementation share the same error. Phase 9 (independent re-derivation) addresses a sample of this risk; full elimination is impossible. For T1 calculations destined for clinical decision support, this residual is documented in the dossier and reviewed with clinical stakeholders before release.

---

*End of plan.*
