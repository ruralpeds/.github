---
applyTo: "tests/**,e2e/**,**/*_test.{rs,py,jl,go,ts,js}"
---

# Instructions: Tests

## Hard rules

- **Never use real patient data.** All fixtures are synthetic (Synthea-generated or manually constructed with obviously-synthetic names like "TESTPATIENT Alpha, MRN 000-TEST-001").
- **Tests are deterministic.** No wall-clock time without injection, no `random()` without a fixed seed, no network without mocking, no real filesystem outside `tmpdir`.
- **Tests are isolated.** Each test sets up and tears down its own state. Order independence — `pytest -p random-order`, `cargo test` parallel, etc., must all pass.
- **Never skip a test** to make CI green. `@pytest.mark.skip`, `#[ignore]`, `describe.skip`, `t.Skip()` — require a linked issue and a deadline in the comment.
- **Never weaken an assertion** to make a flaky test pass. Flake = investigate and fix; if truly environmental, document.

## Test categories and conventions

### Unit

- File naming: `test_*.{rs,py,jl,go,ts}` or `*_test.{rs,go}` per language norms.
- One logical assertion cluster per test function.
- Arrange / Act / Assert structure with blank lines separating.

### Integration

- Under `tests/integration/` (Python/Rust) or `e2e/integration/` (Node/TS).
- May spin up real Postgres, Redis, etc. via Testcontainers or the repo's `make up-testenv`.
- Each test must restore state; no cross-test leakage.

### Contract tests

- Every external-facing API has a contract test verifying the OpenAPI/FHIR/asyncapi spec.
- Breaking change to the contract = major version bump + migration note.

### Property-based tests (MANDATORY for clinical calcs)

For any function in `src/clinical/`, `src/dose/`, `src/growth/`, `src/lab*/`, or equivalents:

- Use the language's property-based tester: `proptest` (Rust), `hypothesis` (Python), `PropCheck.jl` / `Supposition.jl` (Julia), `fast-check` (TS), `gopter` (Go).
- Cover at minimum:
  - **Boundary values** — zero, negative (reject), max, max+1, very small, very large.
  - **NaN / Inf / denormal** — all must be handled or rejected explicitly.
  - **Unit confusion** — every accepted unit and every rejected one.
  - **Tenfold errors** — `value * 10` must not be silently accepted for quantities with human-realistic ranges.
  - **Extreme ages** — 0-minute-old, 50+ years for pediatric calcs.
  - **Temporal edges** — DST transitions, leap seconds, midnight-UTC, year boundaries.
- Shrinking configured; failing cases reported with minimal counterexample.

### E2E (Playwright)

- Under `e2e/playwright/`.
- Use semantic / accessible locators (`getByRole`, `getByLabel`), not CSS selectors on auto-generated class names.
- Always capture trace, screenshot, video on failure (already configured in the reusable workflow).
- Tests run against a test instance seeded with synthetic Synthea patients.

### Mutation tests

- Weekly, not per-PR (expensive).
- Target modules are listed in `tests/mutation-targets.txt`.
- Kill rate gates per `AGENTS.md §6`.

### Accessibility tests

- Every Playwright test for a UI includes an `axe-core` scan before exit.
- WCAG 2.2 AA violations of severity `serious` or `critical` fail the test.

### PHI-leak tests

- For any service that emits logs: a targeted test runs a synthetic patient through the service and asserts no identifier appears in the captured log stream.
- Use a known synthetic patient with distinctive name `PHITEST-CANARY` and MRN `999-PHI-CANARY`. If the canary appears in logs, the test fails.

## Test naming

Prefer sentence-style names that describe the behavior and the condition:

- ✅ `test_rejects_gestational_age_below_22_weeks`
- ✅ `test_emits_audit_event_on_dose_override`
- ❌ `test_ga_1`, `test_validate`, `test_works`

## What NOT to test

- Do not test the compiler, the standard library, or third-party dependencies (unless you genuinely are wrapping a gotcha — then comment why).
- Do not test through multiple layers if you could test in isolation. Use unit > integration > E2E, and prefer the lowest feasible level.
- Do not write tests that assert on internal implementation details that the caller shouldn't care about.

## Test data

- Fixtures under `tests/fixtures/`:
  - `tests/fixtures/synthetic-patients/` — Synthea output, committed (or downloaded on demand via the fixtures workflow).
  - `tests/fixtures/fhir/` — hand-crafted FHIR resources with the `"meta": {"tag": [{"code": "SYNTHETIC"}]}` marker.
  - `tests/fixtures/hl7v2/` — synthetic HL7v2 messages.
- Never add a fixture without the `SYNTHETIC` marker somewhere in its content and filename.
