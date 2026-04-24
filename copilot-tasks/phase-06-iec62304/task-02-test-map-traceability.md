# Task 2: Test Case Map & Traceability Matrix

**Status**: Phase 6, Week 11 Mid  
**Objective**: Map all tests to requirements; generate traceability matrix  
**Preflight Confirmation**: false  
**Dependencies**: Task 1 (DHF bootstrap complete)

---

## What You'll Do

1. **Create Test Case Map (`dhf/verification/unit-test-map.yaml`)**
   - [ ] For every unit test in `tests/unit/`, create a test case entry (TC-###)
   - [ ] For every integration test, create an entry
   - [ ] For every property-based test, create an entry
   - [ ] Include: test ID, title, type (unit/integration/property), requirement tested, risk control verified, preconditions, actions, expected results, pass criteria
   - [ ] Example: TC-101 validates birth date input (SW-010, RC-001)
   - [ ] Include ~30–50 test cases (comprehensive for Class C)

2. **Annotate Source Code**
   - [ ] Add `@requirement("SW-###")` annotations to safety-critical functions
   - [ ] Add `@mitigates("RC-###")` annotations to functions implementing risk controls
   - [ ] Add `@test-case("TC-###")` annotations to test functions
   - [ ] Example:
     ```rust
     /// @requirement("SW-001")
     /// @mitigates("RC-005")
     fn calculate_ventilator_fio2(setpoint: f32) -> Result<f32> { ... }
     ```

3. **Generate Traceability Matrix**
   - [ ] Build mapping: SW-### → list of TC-### test cases
   - [ ] Build reverse mapping: TC-### → SW-### requirement it tests
   - [ ] Verify: every SW-### has ≥1 TC-###
   - [ ] Verify: every TC-### maps to a SW-###
   - [ ] Compute: % coverage for each requirement
   - [ ] Output: HTML table + SARIF report

4. **Implement `reusable-iec62304-traceability.yml`**
   - [ ] Workflow parses `software-requirements.yaml`
   - [ ] Workflow scans source code for annotations
   - [ ] Workflow loads `unit-test-map.yaml`
   - [ ] Workflow validates coverage (every SW-### has test)
   - [ ] Workflow checks code coverage metrics (≥95% for Class C)
   - [ ] Workflow generates HTML matrix + SARIF
   - [ ] Workflow fails PR if coverage gaps found

5. **Wire Workflow into CI**
   - [ ] Add call to `reusable-iec62304-traceability.yml` in PedNeoSim.jl CI
   - [ ] Test: PR with new code → workflow runs → checks coverage
   - [ ] Test: PR removes test without updating requirement → workflow fails
   - [ ] Test: Coverage drops below 95% → workflow fails

6. **Test Coverage Metrics**
   - [ ] Install coverage tool (lcov for Rust/C, pytest-cov for Python, etc.)
   - [ ] Generate coverage report on every test run
   - [ ] Parse coverage XML (Cobertura or similar)
   - [ ] Validate: line coverage ≥ 95% for Class C
   - [ ] Validate: branch coverage ≥ 90% for Class C
   - [ ] Document baseline in `dhf/verification/coverage-report/baseline.txt`

---

## Files to Create/Modify

| File | Change |
|------|--------|
| `dhf/verification/unit-test-map.yaml` | New: 30–50 test case entries |
| `src/**/*.rs` (or equivalent) | Add @requirement, @mitigates, @test-case annotations |
| `tests/**/*test.rs` | Add @test-case annotations |
| `.github/workflows/reusable-iec62304-traceability.yml` | Already created; wire into CI |
| `dhf/verification/coverage-report/baseline.txt` | Baseline metrics (95% coverage, etc.) |

---

## Acceptance Criteria

- ✅ Test case map created (≥30 TC-### entries)
- ✅ All source functions annotated (@requirement, @mitigates)
- ✅ All tests annotated (@test-case)
- ✅ Traceability matrix generated
- ✅ Every SW-### has ≥1 test case
- ✅ Every TC-### maps to a SW-###
- ✅ Code coverage ≥ 95% (Class C) verified
- ✅ Workflow integrated into CI
- ✅ PR blocked if coverage falls below minimum
- ✅ HTML matrix viewable as artifact

---

## Estimated Effort

- Test case map: ~2 hours (30–50 entries with full metadata)
- Source annotations: ~1.5 hours (search + add decorators)
- Workflow integration: ~1 hour
- Coverage setup + verification: ~1 hour
- Testing workflow behavior: ~1 hour

**Total**: ~6 hours
