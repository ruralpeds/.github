# Gap Analysis for [Repo Name]

**Repository**: `ruralpeds/[repo-name]`
**Last Updated**: 2026-04-23 14:30:00 UTC
**Maintainer(s)**: [Your name(s)]

---

## Overview

[1–2 sentences: What does this repo do? What gaps are you tracking? What's the strategic focus area?]

**Example**: 
> "rust-sci-core is an ecosystem of Rust crates for scientific computing (ODEs, probability, clinical utilities, etc.). We track gaps across 15+ crates. Priority focus: enterprise-grade differential equation solvers and competing-risks biostatistics."

---

## Active Gaps

### GAP-001: [Feature name]

**Status**: Not Started
**Priority**: P2 (High)
**Owner**: [Unassigned]
**Target Completion**: YYYY-MM-DD

**Description**:
[What needs to be built? Why? What problem does it solve? Provide enough context that someone unfamiliar with the repo understands what you're proposing.]

**Acceptance Criteria**:
- [ ] Criterion 1 (specific, measurable)
- [ ] Criterion 2
- [ ] Criterion 3

**Implementation Notes**:
[Technical approach, architecture decisions, dependencies, relevant papers, links to issues, constraints.]

**Related PRs**: None
**Blocking Issues**: None
**Blocked By**: None

**Last Status Update**: YYYY-MM-DD
- [Brief note on progress. What changed since last update? What's the next step?]

---

### GAP-002: [Another feature]

**Status**: In Progress
**Priority**: P1 (Critical)
**Owner**: Alice Chen
**Target Completion**: 2026-05-30

**Description**:
Implement Rosenbrock implicit RK methods (23 and 34) for sci-ode to handle medium-stiffness ODEs efficiently. Currently support RK4 (explicit) and TR-BDF2 (stiff); Rosenbrock fills middle ground.

**Acceptance Criteria**:
- [ ] Rosenbrock23 trait implementation in `src/integrators/rosenbrock.rs`
- [ ] Rosenbrock34 variant
- [ ] Jacobian computation via automatic differentiation (dual numbers) + user-provided option
- [ ] Van der Vorst GMRES linear solver integration
- [ ] Benchmarks: convergence order verified against Hairer test suite (E1–E5)
- [ ] Example: solve Oregonator (stiff autocatalytic reaction)
- [ ] Documentation with references to original papers

**Implementation Notes**:
- W-formulation (Steihaug & Wolfbrandt, 1979)
- Leverage existing `sci-test-utils` for convergence order verification
- Coordinate with `sci-wasm` for WASM bindings (post-MVP)
- Reference: Hairer et al. (1993) "Solving ODEs II: Stiff and Differential-Algebraic Problems"

**Related PRs**: #45, #47
**Blocking Issues**: [#127: Improve linear solver abstraction](https://github.com/ruralpeds/rust-sci-core/issues/127)
**Blocked By**: GAP-008 (generalized linear solver trait)

**Last Status Update**: 2026-04-22
- Rosenbrock23 trait definition complete; now implementing Jacobian computation. GAP-008 should unblock this by next week.

---

### GAP-003: BioStatistics.jl Kaplan-Meier with competing risks

**Status**: Backlog
**Priority**: P1 (Critical)
**Owner**: [Unassigned]
**Target Completion**: 2026-07-01

**Description**:
Implement competing risks analysis (Gray's test, subdistribution hazards, cumulative incidence functions) for R ecosystem parity with `cmprsk` package. Essential for neonatal outcome studies where multiple endpoints (discharge, transfer, NICU death) compete.

**Acceptance Criteria**:
- [ ] Aalen-Johansen estimator with bootstrap confidence intervals
- [ ] Gray's test for cumulative incidence function comparison
- [ ] Cumulative incidence function plotting (Plots.jl recipe)
- [ ] Fine-Gray subdistribution hazard regression
- [ ] Unit tests: 3-event systems with simulated 100 patients
- [ ] Validation: outputs match cmprsk R package (within 1% tolerance)
- [ ] Documentation with references and examples

**Implementation Notes**:
- Reference: Fine & Gray (1999) "A Proportional Hazards Model for the Subdistribution of a Competing Risk"
- Coordinates with `Survival.jl` for KM baseline
- Test against synthetic + published datasets (e.g., CGHQ neonatal discharge cohort)

**Related PRs**: None
**Blocking Issues**: None
**Blocked By**: None

**Last Status Update**: 2026-04-18
- Designed data structures (CompetingRiskData, CompetingRiskModel). Ready for BioStatistics.jl architecture review.

---

### GAP-004: sci-ode WASM bindings + interactive visualizations

**Status**: Not Started
**Priority**: P2 (High)
**Owner**: [Unassigned]
**Target Completion**: 2026-08-31

**Description**:
Compile sci-ode solvers to WebAssembly; expose via `wasm-bindgen`. Enable interactive phase-portrait explorers, bifurcation diagrams, and ODE system simulators on the web (no backend needed).

**Acceptance Criteria**:
- [ ] WASM target builds for RK4, Dormand-Prince, TR-BDF2
- [ ] Solvers callable from JavaScript (tsify wrappers)
- [ ] Observable notebook example: Lorenz attractor, user adjustable parameters
- [ ] Web component: phase portrait 2D/3D visualization (Three.js)
- [ ] Performance: solve 10K steps in <500ms on browser
- [ ] Documentation + deployment guide

**Implementation Notes**:
- Uses existing `sci-wasm` crate in workspace
- Coordinates with `sci-ode` maintainers for API stability
- Future: integrate into `ruralpeds/modeling` interactive textbook

**Related PRs**: None
**Blocking Issues**: None
**Blocked By**: GAP-001, GAP-002 (need stable sci-ode API)

**Last Status Update**: 2026-04-20
- Prototyped simple RK4 WASM; now planning full sci-ode integration.

---

## Completed Gaps (Last 90 Days)

Move **finished** gaps here (with checkmarks). Archive gaps after 90 days.

### ✅ GAP-X: sci-growth CDC/WHO percentile interpolation

**Status**: Completed
**Completed Date**: 2026-04-12
**PR**: #38
**Completion Notes**: 
Integrated QuadraticSpline with WHO growth reference tables (0–19 years). Validated against NCHS published z-scores; all edge cases (extreme growth velocity, malnutrition) handled. 22 unit tests. Deployed to production in PedNeoSim.jl Phase 1.

---

## Roadmap by Quarter

| Gap ID | Feature | Q2 2026 | Q3 2026 | Q4 2026 | Notes |
|--------|---------|---------|---------|---------|-------|
| GAP-001 | Cardiometabolic risk | ✓ Planned | | | Part of sci-clinical MVP |
| GAP-002 | Rosenbrock solver | ✓ In Progress | | | Unblocks stiff system support |
| GAP-003 | Competing risks | ✓ Planned | ✓ In Progress | | Neonatal study priority |
| GAP-004 | WASM bindings | | ✓ Planned | | After WASM stabilization |

---

## Dependencies & Blocking Issues

| Gap | Depends On | Status | ETA |
|-----|-----------|--------|-----|
| GAP-002 (Rosenbrock) | GAP-008 (linear solver) | In Progress | 2026-04-29 |
| GAP-004 (WASM) | GAP-001, GAP-002 | Not Started | N/A |
| GAP-003 (Competing risks) | None | Backlog | 2026-07-01 |

---

## Archive (Decided Not To Do)

### 🗑️ GAP-X: [Feature name]

**Status**: Archived
**Archived Date**: YYYY-MM-DD
**Reason**: [Why was this deprioritized? Cost/benefit analysis? Alternative approach chosen?]

**Example**:
> "Deprecated in favor of GAP-005 (competing risks approach is more general). Revisit if Kaplan-Meier without competing risks becomes a use case."

---

## Schema & Governance

For rules specific to **this repo**, see `schema.md`.

For organization-wide standards, see `docs/GAP_ANALYSIS_STANDARDS.md` in `ruralpeds/.github`.

---

## How to Update This Document

### When you start a new gap
1. Copy the "GAP-XXX:" template above
2. Fill in required fields (Status, Priority, Owner, Target Completion, Description, Acceptance Criteria)
3. Commit: `git commit -m "docs: add GAP-XXX [feature name]"`

### When you start work on a gap
1. Change Status to `In Progress`
2. Update "Last Status Update" with today's date
3. Commit: `git commit -m "docs: start GAP-XXX"`

### When you open a PR
1. Change Status to `In Review`
2. Add the PR number to "Related PRs"
3. Commit (on main or in the PR): `git commit -m "docs: GAP-XXX in review"`

### When your PR merges
1. Same day/next day: Move gap to "Completed Gaps" section
2. Fill in "Completed Date" and "PR" fields
3. Add "Completion Notes" summarizing what was built
4. Commit: `git commit -m "docs: mark GAP-XXX complete"`

### When a gap is blocked
1. Change Status to `Blocked`
2. Update "Blocked By" field with the blocking gap/issue
3. Add a note in "Last Status Update" explaining why
4. Commit: `git commit -m "docs: GAP-XXX blocked by [reason]"`

### When unblocked
1. Change Status back to `In Progress`
2. Clear "Blocked By" field (or set to "None")
3. Add note in "Last Status Update"
4. Commit: `git commit -m "docs: GAP-XXX unblocked"`

---

## Questions?

Refer to `docs/GAP_ANALYSIS_STANDARDS.md` in `ruralpeds/.github` for the full standard and FAQ.
