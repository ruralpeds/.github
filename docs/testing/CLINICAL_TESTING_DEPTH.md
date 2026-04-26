# Clinical Testing Depth — Phase 7

**Phase 7 Deliverable**: Synthetic patient fixtures, FHIR/HL7v2 validation, adversarial testing  
**Last Updated**: 2026-04-24  
**Purpose**: Implement clinical-grade test infrastructure for pediatric/neonatal decision support and simulation software  
**Applies To**: Repos where `criticality in {clinical-support, clinical-decision}` OR `iec62304-class in {class-b, class-c}`

---

## Executive Summary

Phase 7 adds four layers of clinical-grade testing:

1. **Synthetic Patient Fixtures** (Synthea) — Never test with real patient data; generate realistic synthetic FHIR bundles for pediatric/neonatal cohorts
2. **FHIR Validation** (HL7 FHIR validator) — Ensure all data exchange follows US Core 6.1 profiles
3. **HL7v2 Conformance** (HAPI) — Validate legacy HL7v2 messages (EHR integrations)
4. **Adversarial/Edge-Case Testing** — Property-based tests for boundary conditions, unit confusion, extreme ages, time-zone edge cases, prescription errors

**Regulatory drivers:**
- **IEC 62304 §7** — Validation through realistic clinical scenarios
- **HL7 FHIR R4 / US Core 6.1** — Data exchange conformance
- **FDA Guidance** — Software testing with representative use cases
- **21 CFR §820.75** — Process validation with actual use conditions

---

## Layer 1: Synthetic Patient Fixtures (Synthea)

### What is Synthea?

[Synthea](https://github.com/synthetichealth/synthea) is a synthetic patient data generator that creates realistic, statistically-representative FHIR bundles without any PHI. 

**Key features:**
- Generates complete patient histories: demographics, encounters, conditions, medications, labs, vital signs
- Pediatric module: neonatal, peds, adolescent patient types
- Configurable cohorts: disease prevalence, medication patterns, encounter frequency
- FHIR R4 output (HL7v2 also supported)
- Deterministic seed for reproducibility

### Workflow: `reusable-synthea-fixtures.yml`

**Trigger:** On release, or weekly for baseline refresh

**Process:**

```bash
# 1. Clone Synthea
git clone https://github.com/synthetichealth/synthea.git

# 2. Build with pediatric module
cd synthea
./gradlew build

# 3. Generate synthetic cohort
# Example: 100 neonatal patients (GA 28-42 weeks)
./run_synthea.sh -s <seed> -p 100 "Neonatal Cohort" \
  --exporter.fhir.export true \
  --generate.default_age_distribution "0-0" \
  --condition_onset_age_distribution "0-0"

# 4. Output: fhir/
#   ├── Patient-*.json
#   ├── Encounter-*.json
#   ├── Observation-*.json (vitals, labs)
#   ├── MedicationRequest-*.json
#   └── ... (other FHIR resources)

# 5. Cache as artifact
zip -r synthea-fixtures-<date>.zip fhir/
```

### Fixture Storage & Caching

**Location:** `tests/fixtures/fhir/synthetic/`

```
tests/fixtures/fhir/synthetic/
├── README.md                        # Cohort description + seed
├── neonatal-100-patients.bundle.json # FHIR Bundle (all resources)
├── Observation-*.json               # Individual resources (optional)
├── vitals-summary.csv               # Reference stats
└── seed-<timestamp>                 # Reproducibility seed
```

**Caching strategy:**
- Generated fixtures committed to repo (small; ~5 MB per cohort)
- Seed recorded for reproducibility
- Weekly job regenerates with new seed
- Old fixtures retained for regression testing (git history)

### Clinical Cohorts

**Recommended cohorts for Phase 7:**

| Cohort | Size | Age Range | Use Case | Seed |
|--------|------|-----------|----------|------|
| Neonatal | 100 | 0–4 weeks (GA 28–42) | Ventilator sim, neonatal CDS | fixed-2026-q2 |
| Infant | 100 | 4 weeks–1 year | Dose calc, growth charts | fixed-2026-q2 |
| Toddler | 50 | 1–3 years | Medication errors, unit confusion | fixed-2026-q2 |
| School-age | 50 | 3–12 years | Adolescent protocols | fixed-2026-q2 |

Each cohort includes:
- Realistic vital signs (heart rate, respiration, O2 sat, BP)
- Lab values (CBC, metabolic panel, blood gas)
- Medications (age-appropriate, realistic doses)
- Conditions (common pediatric: prematurity, jaundice, sepsis)

---

## Layer 2: FHIR Validation

### Workflow: `reusable-fhir-validation.yml`

**Trigger:** On PR for any repo using FHIR; on release

**Input:**
- FHIR resources under `tests/fixtures/fhir/`
- Custom FHIR profiles (StructureDefinitions) under `src/profiles/`
- Validator configuration (`fhir-validation.yaml`)

**Process:**

```bash
# 1. Download HAPI FHIR validator (CLI)
wget https://github.com/hapifhir/org.hl7.fhir.core/releases/download/6.0.13/validator_cli.jar

# 2. Validate all FHIR resources
java -jar validator_cli.jar \
  -version 4.0.1 \
  -ig "hl7.fhir.us.core#6.1.0" \
  tests/fixtures/fhir/neonatal-100-patients.bundle.json \
  -profile http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient \
  -profile http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-vital-signs \
  -output validation-report.json

# 3. Parse report
# - Count errors, warnings
# - Fail if errors > 0
# - Warn if warnings > threshold
```

**Validation Profiles (US Core 6.1):**

| Resource | Profile | Min Requirement |
|----------|---------|-----------------|
| Patient | us-core-patient | Identifier, name, gender, birthDate |
| Observation (vital signs) | us-core-observation-vital-signs | Code, value, effective date |
| Observation (lab) | us-core-observation-lab-results | Code, value + interpretation |
| Condition | us-core-condition | Code, patient, status |
| MedicationRequest | us-core-medicationrequest | Code, subject, intent |
| Encounter | us-core-encounter | Type, period, status |

**Failure modes detected:**

```
❌ Missing required element (code, value, patient reference)
❌ Incorrect data type (string vs. Coding)
❌ Invalid CodeSystem (not LOINC, RxNorm, ICD-10, etc.)
❌ Missing binding (code must be from required value set)
❌ Invariant violation (custom StructureDefinition rule broken)
❌ Extension not defined in profile
```

**Example output:**

```
Validation Report: neonatal-100-patients.bundle.json

✅ PASS: 450 resources validated
  - Patient: 100 / 100 valid
  - Observation (vitals): 300 / 300 valid
  - Medication: 50 / 50 valid

❌ FAIL: 5 resources invalid
  - Observation-neonatal-002-o2-sat: Missing required element 'value'
  - MedicationRequest-neonatal-015: CodeSystem 'RxNorm' not found
  - Condition-neonatal-042: Invalid code (not in ICD-10 value set)

Warnings: 12 (missing extensions, incomplete data)
```

---

## Layer 3: HL7v2 Conformance (for EHR integration)

### Workflow: `reusable-hl7v2-conformance.yml`

**Trigger:** On PR for services integrating with EHRs (HL7v2 only)

**Use case:** If PedNeoSim.jl or CDS integrates with legacy EHR systems via HL7v2 ORU (Observation Result Update) or OBX (Observation/Result) messages

**Process:**

```bash
# 1. Download HAPI HL7v2 conformance checker
mvn dependency:get -Dartifact=ca.uhn.hapi:hapi-structures-v251:2.5.1

# 2. Validate HL7v2 messages against profile
java -cp hapi-structures-v251.jar ca.uhn.hl7v2.conf.check.ProfileParser \
  -message oru_r01.hl7 \
  -profile pediatric-observation-profile.xml

# 3. Check: message structure, segment order, field cardinality
```

**Example profile (pediatric observation):**

```xml
<ConformanceProfile>
  <SegmentGroup name="ORU_R01_PATIENT_RESULT">
    <Segment name="PID">
      <Field id="1" name="Set ID" min="1" max="1" datatype="SI" />
      <Field id="3" name="Patient ID" min="1" max="1" datatype="CX" />
      <Field id="5" name="Patient Name" min="1" max="1" datatype="XPN" />
      <Field id="7" name="DOB" min="1" max="1" datatype="TS" />
      ...
    </Segment>
    <Segment name="OBX">
      <Field id="1" name="Set ID" min="1" max="1" datatype="SI" />
      <Field id="3" name="Observation Identifier" min="1" max="1" datatype="CE" />
      <Field id="5" name="Observation Value" min="1" max="1" datatype="varies" />
    </Segment>
  </SegmentGroup>
</ConformanceProfile>
```

---

## Layer 4: Adversarial/Edge-Case Testing

### Property-Based Test Framework

**Languages:**
- **Rust**: `proptest` crate
- **Python**: `hypothesis` library
- **Julia**: `Agents.jl` or custom property test harness
- **Go**: `quickcheck` library

### Test Categories

#### 4.1 Boundary Value Testing

**Examples for dose calculation:**

```rust
/// @test-case("TC-401")
/// @requirement("SW-002")
#[test]
fn prop_dose_valid_at_boundaries(weight in 0.5f64..=20.0f64) {
    let dose = calculate_dose_mg(weight).expect("Dose calc failed");
    
    // All results should be within physiological bounds
    assert!(dose >= 0.5, "Dose too low");
    assert!(dose <= 200.0, "Dose too high");
    
    // Formula: dose = weight × standard_dose_per_kg (5 mg/kg)
    let expected_min = weight * 4.5;  // 10% variance
    let expected_max = weight * 5.5;
    assert!(dose >= expected_min && dose <= expected_max,
        "Dose outside expected range: {}", dose);
}
```

**Test values:**
- Min: 0.5 kg (micro-preemie)
- Max: 20 kg (older peds)
- Zero: 0 kg (should reject)
- Negative: -5 kg (should reject)
- Infinity: `f64::INFINITY` (should reject)
- NaN: `f64::NAN` (should reject)

#### 4.2 Unit Confusion Testing

**Example: weight kg vs lb confusion**

```rust
/// @test-case("TC-402")
/// @requirement("SW-010")
/// Hazard: Patient weight misread as lb instead of kg (10x error)
#[test]
fn prop_weight_unit_confusion(weight_kg in 0.5f64..=20.0f64) {
    let weight_lb = weight_kg * 2.20462;  // kg → lb conversion
    
    // If someone enters weight in lb (accidentally), dose would be 10x too low
    let dose_correct = calculate_dose_mg(weight_kg).unwrap();
    
    // System should reject weight > 20 kg (our max)
    // OR detect "unusual" weight (e.g., 44 lb = 20 kg, but entry says 44)
    let result = calculate_dose_mg(weight_lb);
    
    // Expectation: either reject or warn
    if weight_lb > 20.0 {
        assert!(result.is_err(), "Should reject weight > 20 kg");
    } else {
        // If accepted, should not differ wildly from correct dose
        let dose_wrong = result.unwrap();
        let ratio = dose_wrong / dose_correct;
        assert!(ratio >= 0.5 && ratio <= 2.0,
            "Dose off by {}x; possible unit confusion", ratio);
    }
}
```

#### 4.3 Extreme Age Testing

**Example: neonatal vs adult calculator**

```rust
/// @test-case("TC-403")
/// @requirement("SW-001")
#[test]
fn prop_age_boundaries(
    ga_weeks in 22.0f64..=42.0f64,  // Gestational age
    postnatal_days in 0.0f64..=365.0f64  // Corrected age
) {
    // Ventilator settings change drastically with age
    let vent_settings = calculate_ventilator_params(ga_weeks, postnatal_days);
    
    // Extreme neonatal (22 weeks)
    if ga_weeks < 24.0 {
        // High-frequency ventilation needed; low tidal volumes
        assert!(vent_settings.rate > 40, "Rate too low for extreme preemie");
        assert!(vent_settings.tidal_volume_ml < 10.0, "TV too high");
    }
    
    // Older peds (3+ years)
    if postnatal_days > 365.0 * 3.0 {
        // Adult-like ventilation
        assert!(vent_settings.rate < 30, "Rate too high for older child");
        assert!(vent_settings.tidal_volume_ml > 50.0, "TV too low");
    }
}
```

#### 4.4 Time-Zone & DST Edge Cases

**Example: medication timing across DST**

```rust
/// @test-case("TC-404")
/// Medication due at 8:00 AM; DST transition occurs at 2:00 AM
#[test]
fn prop_medication_timing_dst(
    time_before_dst in ntp_timestamp_range(dst_transition - 3600, dst_transition - 1)
) {
    let dose_due = schedule_next_dose(time_before_dst);
    let hours_until_dose = (dose_due - time_before_dst) / 3600;
    
    // Medication should still be due in ~N hours, accounting for DST
    // (not suddenly due in 0 hours or -1 hours)
    assert!(hours_until_dose > 0.0, "Dose in past?");
    assert!(hours_until_dose < 25.0, "Dose delayed > 24h");
}
```

#### 4.5 Prescription Error Detection

**Example: 10-fold overdose catch**

```rust
/// @test-case("TC-405")
/// @mitigates("HZ-008")  // Hazard: Tenfold overdose (common patient-safety event)
#[test]
fn prop_prescription_error_detection(
    dose_correct in 1.0f64..=10.0f64,
    dose_error_factor in [2.0, 5.0, 10.0, 100.0].iter()
) {
    let dose_error = dose_correct * dose_error_factor;
    
    // System should flag suspicious orders
    let check = validate_dose_order(dose_correct, dose_error);
    
    if dose_error_factor >= 10.0 {
        // Definite error; system must catch
        assert!(check.is_err(), "Failed to catch {}x overdose", dose_error_factor);
    } else if dose_error_factor >= 5.0 {
        // Suspicious; should warn
        assert!(check.is_warn() || check.is_err(),
            "Failed to warn on {}x dose", dose_error_factor);
    }
}
```

### Test Harness: `proptest` (Rust example)

**File:** `tests/proptest_clinical.rs`

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn prop_all_weight_values_produce_valid_dose(
        weight in 0.1f64..=100.0f64
    ) {
        // For every possible weight, dose calculation should:
        // 1. Not panic
        // 2. Return a numeric value (not NaN/Infinity)
        // 3. Be within physiological bounds

        let dose_result = calculate_dose_mg(weight);
        
        match dose_result {
            Ok(dose) => {
                prop_assert!(!dose.is_nan());
                prop_assert!(!dose.is_infinite());
                prop_assert!(dose >= 0.0);
                prop_assert!(dose <= 1000.0); // Upper bound for any dose
            }
            Err(_) => {
                // If weight is invalid, error is acceptable
                // (but system should give clear error message)
                prop_assert!(weight < 0.5 || weight > 20.0,
                    "Rejected valid weight: {}", weight);
            }
        }
    }
}
```

**Running property tests:**

```bash
cargo test --test proptest_clinical -- --nocapture

# Output:
# test prop_all_weight_values_produce_valid_dose ... ok
#   Ran 256 test cases
#   Min: 0.15, Max: 99.87
#   Shrunk failure case (if found)
```

---

## Layer 5: Mutation Testing

### Workflow: `reusable-mutation-test.yml`

**Trigger:** Weekly (not per-PR; too slow)

**Purpose:** Verify tests catch code bugs; measure test quality with mutation kill rate

**Tools:**
- **Rust**: `cargo-mutants`
- **Python**: `mutmut`
- **Julia**: `MutationTesting.jl`
- **Go**: Custom or stryker-go

### Example: Rust with `cargo-mutants`

```bash
# 1. Install cargo-mutants
cargo install cargo-mutants

# 2. Run on safety-critical crates
cargo mutants --crate src/ventilator \
  --output target/mutants.json \
  --timeout 30 \
  --no-copy

# 3. Output example:
#   Original test suite: PASS
#   
#   Mutation 1: src/ventilator.rs:42 `rate >= 10` → `rate > 10`
#   Result: KILLED (test caught this)
#   Test: test_ventilator_min_rate
#   
#   Mutation 2: src/ventilator.rs:87 `result * 2.0` → `result * 1.0`
#   Result: SURVIVED (test missed this!)
#   ⚠️  Test gap found
#   
#   Mutation kill rate: 45/50 = 90% ✅

# 4. Report
cargo mutants --output target/mutants.json --print-result

# 5. Parse report; fail if kill rate < threshold (Class C: 85%)
```

### Mutation Categories

| Mutation | Example | Risk Level |
|----------|---------|-----------|
| Arithmetic | `+` → `-` | Critical |
| Comparison | `>=` → `>` | Critical |
| Assignment | `x = 5` → `x = 0` | High |
| Return value | `return true` → `return false` | High |
| Constant | `10` → `9` | Medium |
| Variable delete | remove variable assignment | Medium |

**Mutation survival indicates:**
- ❌ Test gap (mutation not caught)
- ❌ Dead code (mutation has no effect)
- ❌ Unclear test intent

**Test quality metric:**

```
Class B minimum: 70% mutation kill rate
Class C minimum: 85% mutation kill rate
Ideal: >90% (leave <10% for acceptable dead code)
```

---

## Integration: All Four Layers in CI

**Trigger on PR or release:**

```yaml
# .github/workflows/ci-clinical.yml (example)
jobs:
  synthea-fixtures:
    uses: ./.github/workflows/reusable-synthea-fixtures.yml

  fhir-validation:
    uses: ./.github/workflows/reusable-fhir-validation.yml
    needs: synthea-fixtures

  clinical-tests:
    uses: ./.github/workflows/ci-<lang>.yml  # (node, python, rust, etc.)
    with:
      test-type: "clinical"  # Enables property-based tests
    needs: fhir-validation

  mutation-tests:
    uses: ./.github/workflows/reusable-mutation-test.yml
    if: github.event_name == 'schedule'  # Weekly only
    needs: clinical-tests
```

**Required checks (for clinical repos):**

| Check | Artifact | Pass Criteria |
|-------|----------|---------------|
| Synthea fixtures | JSON Bundle | ≥100 synthetic patients |
| FHIR validation | validation-report.json | 0 errors, <10 warnings |
| Unit tests | JUnit XML | ≥95% line coverage (Class C) |
| Property tests | test output | All 256+ cases passed |
| Mutation tests | mutants.json | ≥85% kill rate (Class C) |

---

## Recommended Phase 7 Implementation Order

**Week 13:**
1. Set up Synthea build + generate neonatal cohort
2. Commit synthetic fixtures to `tests/fixtures/fhir/`
3. Add `reusable-synthea-fixtures.yml` workflow

**Week 14:**
1. Integrate HAPI FHIR validator
2. Add `reusable-fhir-validation.yml` workflow
3. Validate Synthea fixtures pass US Core 6.1
4. (Optional) Add HL7v2 conformance if EHR integration planned

**Week 15–16:**
1. Add property-based tests to existing test suites
2. Expand test case coverage (adversarial edge cases)
3. Ensure coverage stays ≥95%
4. Run mutation tests weekly
5. Fix test gaps (mutations that survived)

---

## References

- **Synthea**: [synthetichealth/synthea](https://github.com/synthetichealth/synthea)
- **HAPI FHIR Validator**: [hapifhir/org.hl7.fhir.core](https://github.com/hapifhir/org.hl7.fhir.core)
- **US Core 6.1**: [hl7.org/fhir/us/core](https://hl7.org/fhir/us/core/)
- **Proptest (Rust)**: [docs.rs/proptest](https://docs.rs/proptest/)
- **Hypothesis (Python)**: [hypothesis.readthedocs.io](https://hypothesis.readthedocs.io/)
- **Cargo Mutants (Rust)**: [mutants.rs](https://mutants.rs/)
- **IEC 62304 §7**: Software Validation & Verification
