# `docs/audit/` — Audit Documentation Index

This directory holds two distinct families of audit documentation. Both are "audit" in name but address different concerns; keep them mentally separate.

---

## 1. Audit Logging / Event Audit Trail

How the platform produces, signs, stores, and retains immutable audit-log events at runtime. Required for HIPAA, 21 CFR Part 11, and the `audit-log` workflow family in `.github/workflows/`.

| Document | Purpose |
|---|---|
| [`EVENT_TYPES.md`](EVENT_TYPES.md) | Canonical catalog of audit-log event types emitted by every repo. |
| [`EVENT_SIGNATURE_SCHEMA.md`](EVENT_SIGNATURE_SCHEMA.md) | JCS canonicalization + Ed25519 signature schema for audit events. |
| [`WORM_ARCHIVE_STRATEGY.md`](WORM_ARCHIVE_STRATEGY.md) | Write-Once-Read-Many archival strategy for long-term audit retention. |

**Consumed by** `.github/workflows/audit-log.yml`, `audit-sign-envelope.yml`, `audit-verify.yml`, `backfill-slsa-provenance.yml`.

---

## 2. Calculation Verification Audit

How numerical calculations in scientific / clinical code are *proven correct* — taxonomies, reference standards, three-tier test architecture, certified input domains, validation dossiers. This complements the audit-log family: the log proves *what was computed*; the calculation audit proves *that the computation was right*.

| Document | Purpose |
|---|---|
| [`BIOSTATISTICS_AUDIT_PLAN.md`](BIOSTATISTICS_AUDIT_PLAN.md) | **Master charter.** Language-agnostic 10-phase plan for verifying every calculation in `ruralpeds/biostatistics`: registry, reference standards, golden / cross-validation / property test tiers, numerical stability, edge cases, validation dossier, CI gates, continuous verification, independent re-derivation, sign-off. Includes biostatistics taxonomy (16 categories), reference source registry (textbooks + NIST StRD + R/scipy), property invariant catalog, and registry JSON schema. |
| [`BIOSTATISTICS_GOLD_STANDARD_REFERENCES.md`](BIOSTATISTICS_GOLD_STANDARD_REFERENCES.md) | **Per-function gold-standard methodology.** Locks in the textbook + NIST + CAS reference assignments for every one of the 187 catalogued functions in `ruralpeds/biostatistics` across all 16 modules, organized by tier (T1 critical → T3 convenience). Includes a 14-case disagreement-resolution catalog (Welch df rounding, Wilcoxon ties, Fisher r×c, Yates correction, McNemar exact threshold, KM CI type, log-rank ties, bootstrap percentile-vs-BCa, Cohen's d denominator, Hedges correction, Egger weights, Box-Cox positivity, etc.), a property invariant catalog (~80 named invariants keyed across the 187 functions), a clinical reference layer (USA-sourced — AAP, AHA, CDC, USPSTF) for the 6 functions whose gold standard is a clinical algorithm, a reference version drift protocol, and the Phase 9 independent re-derivation plan. Augments the existing single-witness `test/VALIDATION_MATRIX.md` (R-only) with the master plan's required two additional witnesses per calculation. |
| [`BIOSTATISTICS_AUDIT_PLAN_TOOLING_RUST.md`](BIOSTATISTICS_AUDIT_PLAN_TOOLING_RUST.md) | Rust-specific tooling addendum: pinned toolchain, crate stack (`proptest`, `insta`, `approx`, `criterion`, `cargo-llvm-cov`), `assert_close!` macro, `#[audited]` proc macro, multi-OS CI workflow, `justfile` orchestration, determinism checklist. |
| [`BIOSTATISTICS_AUDIT_PLAN_TOOLING_JULIA.md`](BIOSTATISTICS_AUDIT_PLAN_TOOLING_JULIA.md) | Julia-specific tooling addendum: Julia 1.11 pinning, mandatory committed `Manifest.toml`, package stack (`Aqua.jl`, `JET.jl`, `Supposition.jl`, `ReferenceTests.jl`, `BenchmarkTools.jl`), `BiostatAudit.jl` runtime + `@audited_calculation` / `@cited` macros (consistent with `julia-enterprise-repo` skill v2.1), `@test_close` macro, multi-Julia-version CI workflow, `justfile` orchestration. |

**Will be consumed by** future reusable workflows in `.github/workflows/`:

- `reusable-calc-audit-rust.yml` — calls into the Rust addendum's gate suite, targets `[self-hosted, mac-studio, arm64]`.
- `reusable-calc-audit-julia.yml` — same for Julia.
- `reusable-calc-audit-fixture-freshness.yml` — regenerates R/scipy reference fixtures and diffs them.
- `reusable-calc-audit-dossier-freshness.yml` — re-renders `VALIDATION.md` and `VALIDATION_DOSSIER.md` against HEAD and fails on staleness.

These workflows do not yet exist; this directory documents the charter they will implement. Adoption order, runner-label selection, and matrix coverage are recorded in [`docs/WORKFLOW_CATALOG.md`](../WORKFLOW_CATALOG.md) once the reusable workflows land.

---

## Cross-references

- Repo-wide blueprint: [`HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md`](../../HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md)
- Reusable-workflow consumer guide: [`USING_REUSABLE_WORKFLOWS.md`](../USING_REUSABLE_WORKFLOWS.md)
- Workflow catalog: [`WORKFLOW_CATALOG.md`](../WORKFLOW_CATALOG.md)
- Org-required workflows: [`org-required-workflows.md`](../org-required-workflows.md)
- Enterprise audit-logging doc: [`ENTERPRISE_AUDIT_LOGGING.md`](../ENTERPRISE_AUDIT_LOGGING.md)

---

*Last updated:* 2026-04-28
*Owner:* Timothy Hartzog (@timothyhartzog)
