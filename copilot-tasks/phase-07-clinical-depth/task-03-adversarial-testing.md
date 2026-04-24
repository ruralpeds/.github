# Phase 7, Task 3: Adversarial Testing — Property-Based + Mutation Tests

**Objective:** Ensure test quality through property-based and mutation testing.

**Duration:** 7 hours (Weeks 15-16)

## Requirements

- Add property-based tests (proptest/hypothesis) for boundary conditions
- Add mutation testing (cargo-mutants/mutmut) to measure test effectiveness
- Achieve Class B (70%) or Class C (85%) mutation kill rate
- Cover edge cases: unit confusion, extreme ages, DST boundaries, prescription errors
- Run mutation tests weekly (not per-PR)
- Document test gaps and fixes

## Acceptance Criteria

- [ ] Property-based tests written for critical functions (5+ test functions)
- [ ] Mutation testing workflow integrated: `reusable-mutation-test.yml`
- [ ] Baseline mutation kill rate ≥70% (Class B) or ≥85% (Class C)
- [ ] Test gaps identified and fixed
- [ ] Mutation report generated (JSON artifact)
- [ ] Weekly CI schedule configured
- [ ] docs/testing/CLINICAL_TESTING_DEPTH.md updated (Weeks 15-16 sections)

## Implementation Steps

### Layer 1: Property-Based Tests (Weeks 15-16)

1. **Identify critical properties:**
   - Invariants: "For any valid patient age, vitals must be within pediatric range"
   - Determinism: "Running same calculation 100× yields same result"
   - Commutativity: "dose_kg * weight == dose_total (order irrelevant)"
   - Unit handling: "kg must not be treated as lb (≠ 2.2× difference)"
   - Boundary conditions: age=0, age=999, dose=0, dose=∞, weight=0.001kg (premature infant)

2. **Write property tests (Rust with proptest):**
   ```rust
   use proptest::prelude::*;
   
   proptest! {
       #[test]
       fn prop_valid_patient_age(age in 0u16..150) {
           // Property: all ages 0-150 years are valid
           assert!(is_valid_patient_age(age));
       }
       
       #[test]
       fn prop_vital_signs_range(age in 0u16..12) {
           // Property: pediatric vitals must be in expected ranges
           let patient = Patient { age_years: age as u8, ..Default::default() };
           let vitals = calculate_vitals(&patient);
           
           if age < 1 {
               assert!(vitals.heart_rate > 100 && vitals.heart_rate < 160); // neonate
           } else if age < 3 {
               assert!(vitals.heart_rate > 90 && vitals.heart_rate < 150);  // infant
           } else {
               assert!(vitals.heart_rate > 70 && vitals.heart_rate < 130);  // toddler
           }
       }
       
       #[test]
       fn prop_dose_calculation_units(weight_kg in 0.5f32..150.0) {
           // Property: kg != lb (critical safety property)
           let dose_kg = calculate_dose_mg(weight_kg, DrugUnit::Kilograms);
           let dose_lb = calculate_dose_mg(weight_kg * 2.2, DrugUnit::Pounds);
           
           // Should NOT be equal (would indicate unit confusion)
           assert_ne!(dose_kg, dose_lb);
       }
       
       #[test]
       fn prop_age_boundary(age in 0u16..1000) {
           // Property: no panics on any age (even invalid ranges)
           let result = std::panic::catch_unwind(|| {
               is_valid_patient_age(age as u8)
           });
           assert!(result.is_ok()); // Should not panic
       }
   }
   ```

3. **Write property tests (Python with hypothesis):**
   ```python
   from hypothesis import given, strategies as st, assume
   from datetime import datetime, timedelta
   
   @given(age=st.integers(min_value=0, max_value=150))
   def test_prop_valid_patient_age(age):
       assert is_valid_patient_age(age)
   
   @given(weight_kg=st.floats(min_value=0.5, max_value=150.0))
   def test_prop_dose_unit_safety(weight_kg):
       # Unit confusion test: kg must not equal lb
       dose_kg = calculate_dose_mg(weight_kg, unit="kg")
       dose_lb = calculate_dose_mg(weight_kg * 2.2, unit="lb")
       assert dose_kg != dose_lb
   
   @given(
       year=st.integers(2023, 2025),
       month=st.integers(1, 12),
       day=st.integers(1, 28)
   )
   def test_prop_dst_boundary(year, month, day):
       # DST edge case: timestamp handling around DST transitions
       dt = datetime(year, month, day)
       result = parse_clinical_timestamp(dt.isoformat())
       assert result is not None  # Should parse all valid dates
   
   @given(prescription=st.just({"dose": 100, "unit": "mg"}))
   def test_prop_tenfold_overdose_detection(prescription):
       # Safety property: 10× overdose should be detected
       overdose = {**prescription, "dose": prescription["dose"] * 10}
       assert is_suspicious_dose(overdose)
   ```

4. **Add edge-case tests manually:**
   - Age 0 (newborn), age 999 (invalid)
   - Weight 0.5 kg (premature), weight 200 kg (invalid)
   - Dose 0, dose 10000 mg (likely error)
   - Timestamp at DST transition (2:00 AM, spring forward)
   - Leap second handling

### Layer 2: Mutation Testing (Weeks 15-16)

1. **Install mutation tools:**
   - Rust: `cargo install cargo-mutants`
   - Python: `pip install mutmut pytest`
   - JavaScript: `npm install -g stryker stryker-cli`

2. **Run baseline mutation tests:**
   ```bash
   # Rust
   cargo mutants --output results.json
   
   # Python
   mutmut run --tests-dir tests
   ```

3. **Interpret results:**
   - Killed mutant = test caught the mutation (good)
   - Survived mutant = test missed the mutation (test gap)
   - Example:
     ```rust
     // Original code
     if age < 12 { ... }
     
     // Mutation 1: if age <= 12
     // If test only covers age=11, mutation survives → test gap found
     ```

4. **Fix test gaps:**
   - For each survived mutation, add property test or example
   - Example: If `age < 12` survived mutation to `age <= 12`, add test:
     ```rust
     #[test]
     fn test_age_boundary_12() {
         assert!(is_child(11));
         assert!(is_child(12));  // Catches <= vs < mutation
         assert!(!is_child(13));
     }
     ```

5. **Run weekly:**
   - Schedule: `cron '0 2 * * 0'` (Sunday 2 AM UTC)
   - Workflow: `reusable-mutation-test.yml` ✅ (already created)
   - Inputs:
     - `language`: rust|python|javascript
     - `class`: a|b|c
     - `test_command`: "cargo test --release"
   - Outputs: `kill_rate`, `mutants_killed`, `mutants_survived`

6. **Thresholds by safety class:**
   - Class A: 0% minimum (informational)
   - Class B: 70% minimum (regulatory requirement)
   - Class C: 85% minimum (critical device)

### Layer 3: Integration

1. **Create CI schedule for mutations:**
   - Weekly job in `.github/workflows/schedule-mutation-test.yml`
   - Trigger: `schedule: [{cron: '0 2 * * 0'}]` (weekly Sunday)
   - Calls `reusable-mutation-test.yml` with class=b language=rust

2. **Continuous coverage maintenance:**
   - After each PR merge, check if new code is covered
   - Example: if new function added, mutation test should detect if tests are missing
   - Alert: if mutation kill rate drops, create GitHub issue

3. **Document test gaps:**
   - Create issue: "Mutation Testing Report — Week {week}"
   - List survived mutants (test gaps)
   - Assign fixes to next sprint

## Regulatory Alignment

- **IEC 62304 §7.3:** Test effectiveness — mutation testing proves tests actually work
- **FDA:** "Adequate verification" requires measuring test quality, not just coverage
- **ISTQB:** Mutation testing = test effectiveness metric

## Example: Unit Confusion Bug

```python
# Vulnerable code (unit confusion)
def calculate_dose_mg(weight_value, unit="kg"):
    if unit == "kg":
        return weight_value * 20  # pediatric dosing
    elif unit == "lb":
        return weight_value * 20  # WRONG: should be * 9.1, not * 20
    return None

# Test that PASSES with coverage but FAILS with mutations
def test_dose_calculation():
    assert calculate_dose_mg(10, "kg") == 200  # ✅ passes
    # Missing: assert calculate_dose_mg(22, "lb") == 200  # ✅ would fail (unit confusion)

# Mutation test runs and catches it:
# Mutant: "weight_value * 20" → "weight_value * 19"
# Result: Original test still passes, mutation kills test detection → survived mutant
# Conclusion: Test doesn't validate correct dose range
```

## Output Artifacts

- Property-based test code: `tests/test_properties_*.rs/.py`
- Mutation report JSON: `coverage/mutation.json`
- Weekly mutation GitHub issue: "Mutation Testing Report — Week {N}"

## Dependencies

- Phase 7, Tasks 1-2 complete
- Test suite exists and passes
- Rust/Python tooling available
- Deterministic RNG seeding for reproducibility

## Success Metrics

| Metric | Target | Class B | Class C |
|--------|--------|---------|---------|
| Code coverage | ≥85% | ≥85% | ≥95% |
| Mutation kill rate | ≥70% | ≥70% | ≥85% |
| Property tests | 5+ | 10+ | 15+ |
| Boundary tests | 10+ | 15+ | 20+ |

## Next Phase

Phase 8: HA Patterns Library (Weeks 17-18)
