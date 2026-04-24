# IEC 62304 Design History File (DHF) Pattern

**Phase 6 Deliverable**: Template-driven DHF structure for medical device software lifecycle  
**Last Updated**: 2026-04-24  
**Regulatory Driver**: IEC 62304 (Software Lifecycle Processes), ISO 14971 (Risk Management)  
**Applies To**: Repos where `iec62304-class in {class-b, class-c}` OR `regulated: true`

---

## Executive Summary

IEC 62304 mandates a Design History File (DHF) — the complete set of records describing how a medical device software was developed, tested, and released. This document specifies the minimal-but-sufficient directory structure and workflow integration to satisfy Class B/C requirements without excessive overhead.

**Key requirements:**
- **Software Safety Plan** — risk strategy per class
- **Requirements traceability** — every requirement tested, every risk controlled
- **Verification & validation** — evidence that design meets requirements and is safe
- **Release documentation** — version, build info, test results, known issues
- **Problem resolution** — change log, incident tracking

**Phase 6 Pattern:**
- Git-native DHF structure (`dhf/` directory with standardized subdirs)
- Traceability workflow (`reusable-iec62304-traceability.yml`) that auto-validates completeness
- Release gates that enforce DHF currency
- Quarterly review stamp in the audit log

---

## Directory Structure

```
<repo-root>/
├── dhf/                                    # Design History File (core)
│   ├── README.md                           # DHF index + quick links
│   ├── classification.md                   # Software Safety classification (Class A/B/C)
│   │
│   ├── requirements/                       # §4 Software Requirements Specification
│   │   ├── user-needs.md                   # UN-001, UN-002, ... (user-facing needs)
│   │   ├── system-requirements.yaml        # SYS-001 → UN-### (system-level)
│   │   └── software-requirements.yaml      # SW-### → SYS-### (implementation-level)
│   │
│   ├── risk/                               # ISO 14971 Risk Management File
│   │   ├── hazard-analysis.yaml            # HZ-001, HZ-002, ... (all hazards)
│   │   ├── risk-controls.yaml              # RC-001, RC-002, ... (risk mitigations)
│   │   └── residual-risk.md                # Aggregate residual risk assessment
│   │
│   ├── architecture/                       # §5 Software Architectural Design
│   │   ├── sw-architecture.md              # Top-level design, module decomposition
│   │   ├── interfaces.md                   # Module interfaces, data contracts
│   │   └── safety-mechanisms.md            # Fault detection, error handling, watchdogs
│   │
│   ├── verification/                       # §6 Software Unit Verification & Integration
│   │   ├── unit-test-map.yaml              # test-case-id → SW-### requirement
│   │   ├── integration-test-map.yaml       # API contract tests, module interactions
│   │   ├── unit-test-evidence/             # Test results snapshots (SARIF, JUnit XML)
│   │   └── coverage-report/                # Latest code coverage (lcov, cobertura)
│   │
│   ├── validation/                         # §7 Software System Testing & Validation
│   │   ├── clinical-validation.md          # End-to-end scenarios, use cases
│   │   ├── adversarial-tests.md            # Boundary conditions, unit confusion, edge cases
│   │   └── validation-evidence/            # Test reports, screen recordings (Playwright)
│   │
│   ├── releases/                           # Release documentation (per version)
│   │   └── v1.2.3/                         # Example: version v1.2.3
│   │       ├── release-note.md             # What changed, known issues, migration guide
│   │       ├── build-info.json             # Build env, commit SHA, build duration, signer
│   │       ├── sbom.json                   # Symlink or copy from sbom/cyclonedx.json
│   │       ├── vex.json                    # Symlink from vex/vex.json
│   │       ├── provenance.intoto.jsonl     # SLSA provenance (signed build attestation)
│   │       ├── traceability-matrix.html    # Auto-generated: SYS-### → SW-### → Test → RC-###
│   │       ├── test-evidence.zip           # All test results + logs
│   │       └── signature.json              # 21 CFR Part 11 signature envelope (Phase 5)
│   │
│   ├── post-market/                        # Post-market surveillance (if applicable)
│   │   ├── complaints.jsonl                # Customer-reported issues, one per line
│   │   ├── cve-monitoring.md               # CVE tracking, patching strategy
│   │   └── pccp.md                         # Predetermined Change Control Plan (if AI/ML)
│   │
│   └── review-schedule.md                  # Quarterly DHF review calendar + sign-offs
│
├── src/                                    # Source code with requirement annotations
│   └── safety.rs (or equivalent)
│       /// @requirement("SW-042")
│       /// @mitigates("RC-007")
│       fn calculate_dose_mg(weight: f64) -> Result<f64, DoseError> { ... }
│
├── tests/                                  # Test suite with traceability annotations
│   ├── unit/
│   │   └── safety_test.rs
│   │       /// @test-case("TC-042-1")
│   │       /// @requirement("SW-042")
│   │       #[test]
│   │       fn test_dose_calc_normal_weight() { ... }
│   │
│   └── fixtures/
│       ├── fhir/                           # Synthetic FHIR bundles (Synthea-generated)
│       └── real/                           # ⛔ NEVER commit real patient data
│
└── ...other project files...
```

---

## Core DHF Documents

### 1. Software Safety Classification (`dhf/classification.md`)

**Purpose**: Determine if Class A, B, or C per IEC 62304 Table 1.

**Questions** (answered with rationale + date):

```markdown
# Software Safety Classification

**Classification Date**: 2026-04-24  
**Classifier**: Timothy Hartzog MD

---

## Decision Tree

### Question 1: Can the software cause injury or death to a patient?

**Answer**: YES (neonatal ventilator control possible if expanded)

**Rationale**: PedNeoSim.jl is currently a simulator (no direct patient control), 
but the codebase is designed to support integration with ventilator hardware.
Simulation of ventilator control loops means control logic must be safe.

---

### Question 2: Can the injury be serious (i.e., NOT minor or negligible)?

**Answer**: YES

**Rationale**: Ventilator control errors → hypoxia, hypercarbia → death or serious brain injury.
Even simulation-only errors (e.g., incorrect FiO2 calculation) could propagate to clinical decision-making.

---

## Classification Result

**Class C** — Death or serious injury possible

---

## Implications (IEC 62304)

- ✅ Mandatory: Software Safety Plan
- ✅ Mandatory: Requirement traceability matrix
- ✅ Mandatory: Comprehensive testing (≥ 90% code coverage, mutation ≥ 85% kill rate)
- ✅ Mandatory: Design History File (this document)
- ✅ Mandatory: Risk management file (ISO 14971)
- ✅ Mandatory: Change log + problem resolution procedure
- ✅ Mandatory: Release checklist + sign-off

---

## Next Steps

1. Software Safety Plan written (Section 3)
2. Requirements specification finalized (Section 4)
3. Traceability workflow active (reusable-iec62304-traceability.yml)
```

### 2. Software Safety Plan (`dhf/requirements/SOFTWARE_SAFETY_PLAN.md`)

**Minimal content** for Class C:

```markdown
# PedNeoSim.jl Software Safety Plan

**Version**: 1.0  
**Date**: 2026-04-24  
**Author**: Timothy Hartzog MD

---

## 1. Safety Classification

Class C. See `dhf/classification.md`.

---

## 2. Risk Strategy

**Overall Risk Management Strategy**:
- Identify hazards through FMEA (Table in `dhf/risk/hazard-analysis.yaml`)
- Mitigate high-risk hazards with software controls (code + tests)
- Validate residual risk is acceptable

**Risk Acceptance Criteria**:
- No hazard with residual severity = "catastrophic"
- No hazard with residual severity = "serious" + probability > "remote"
- All identified risks documented with controls & evidence

---

## 3. Design Approach

- **Modular architecture**: Ventilator control logic isolated in `src/ventilator/`
- **Defensive input validation**: All patient data (weight, PMA, FiO2 setpoint) validated at entry
- **Fault detection**: All calculations have range guards; unexpected values log and alert
- **Testing**: Unit + integration + adversarial (boundary, unit confusion, age extremes)
- **Version control**: Commit history preserves all design decisions
- **Code review**: All changes reviewed by 2+ reviewers (solo adaptation: 24h cooling-off + AI review)

---

## 4. Life-Cycle Activities

| Activity | Responsible | Date |
|----------|-------------|------|
| SW Safety Plan | Timothy Hartzog | 2026-04-24 |
| Requirements Specification | Timothy Hartzog | 2026-05-07 |
| Architecture Design | Timothy Hartzog | 2026-05-14 |
| Risk Analysis (FMEA) | Timothy Hartzog | 2026-05-21 |
| Implementation | Timothy Hartzog | ongoing |
| Verification (unit/integration) | CI (automated) | per PR |
| Validation (system/clinical) | Timothy Hartzog | 2026-06-30 |
| Release | Timothy Hartzog | TBD |
| Post-Market Surveillance | Timothy Hartzog | ongoing |

---

## 5. Communication Plan

- **Regulatory**: Design decisions documented in DHF, audit trail immutable (Merkle chain)
- **Clinical peers**: Quarterly review + E-signature from external clinical peer (when available)
- **Internal**: Design changes trigger required DHF updates (CI check)
```

### 3. Requirements Specification (`dhf/requirements/software-requirements.yaml`)

**Format**: YAML for machine-readability + traceability automation.

```yaml
---
metadata:
  document_id: "SRS-PedNeoSim.jl-v1.0"
  author: "Timothy Hartzog"
  date_created: "2026-04-24"
  version: "1.0"
  status: "draft"

requirements:
  - id: "SW-001"
    title: "Neonatal ventilator simulation"
    category: "functional"
    description: "System shall simulate neonatal ventilator operation including FiO2 control, PEEP, rate, and I:E ratio."
    source_requirement: "SYS-002"
    priority: "critical"
    verification_method: "test"
    validation_method: "clinical"
    notes: "Safety-critical: incorrect simulation → clinical decision error"

  - id: "SW-002"
    title: "Weight-based dose calculation"
    category: "functional"
    description: |
      System shall calculate medication doses based on patient weight and age.
      Formula: dose_mg = weight_kg * standard_dose_per_kg
    source_requirement: "SYS-003"
    priority: "critical"
    verification_method: "test"
    validation_method: "clinical"
    acceptance_criteria:
      - "Dose matches reference manual within ±2%"
      - "Calculation completes in < 10 ms"
      - "Unit confusion (kg vs lb) detected and rejected"

  - id: "SW-010"
    title: "Input validation — patient weight"
    category: "non-functional"
    description: "System shall validate patient weight input is between 0.5 kg (micro-preemie) and 20 kg (older peds)."
    source_requirement: "SYS-001"
    priority: "high"
    risk_mitigated:
      - "HZ-003"  # Dose calc failure on extreme weight
      - "HZ-005"  # Unit confusion (kg vs lb)
    verification_method: "test"
    acceptance_criteria:
      - "Weight < 0.5 kg rejected with error message"
      - "Weight > 20 kg rejected with error message"
      - "Negative weight rejected"
      - "Non-numeric weight rejected"
      - "Null/missing weight handled gracefully"

  - id: "SW-020"
    title: "Error handling and logging"
    category: "non-functional"
    description: "System shall log all errors and validation failures with timestamp, event type, input values (redacted), and context."
    source_requirement: "SYS-005"
    priority: "high"
    verification_method: "test"
    notes: "Logs must not contain patient identifiers (HIPAA)"

traceability:
  - sw_id: "SW-001"
    test_cases:
      - "TC-001"
      - "TC-002"
      - "TC-003"
  - sw_id: "SW-002"
    test_cases:
      - "TC-010"
      - "TC-011"
    risk_controls:
      - "RC-005"
      - "RC-006"
  - sw_id: "SW-010"
    test_cases:
      - "TC-020"
      - "TC-021"
      - "TC-022"
    risk_controls:
      - "RC-003"
```

### 4. Hazard Analysis (`dhf/risk/hazard-analysis.yaml`)

**Format**: ISO 14971 FMEA structure, machine-parseable.

```yaml
---
metadata:
  document_id: "HAF-PedNeoSim.jl-v1.0"
  author: "Timothy Hartzog"
  date: "2026-04-24"
  next_review: "2026-07-24"

hazards:
  - id: "HZ-001"
    title: "Incorrect gestational age (GA) calculation"
    hazardous_situation: "Software calculates wrong GA from birth date"
    potential_harm: "Clinician uses wrong growth chart; growth failure missed"
    severity: "serious"          # catastrophic | serious | minor | negligible
    probability_pre_control: "occasional"  # frequent | probable | occasional | remote | improbable
    risk_level_pre: "high"       # computed: severity × probability
    detectability: "medium"      # By direct observation during testing
    
    risk_controls:
      - id: "RC-001"
        measure: "Input validation: birth date cannot be in future"
        implementation: "src/validators.rs::validate_birth_date()"
        verification: "TC-101"
      - id: "RC-002"
        measure: "GA calculation validated against reference tables (AAP 2022)"
        implementation: "src/growth.rs::calculate_ga_days()"
        verification: "TC-102, TC-103"
      - id: "RC-003"
        measure: "Display warning if GA outside normal range (22–42 weeks)"
        implementation: "src/ui/display.rs::show_ga_warning()"
        verification: "TC-104"

    residual_risk:
      severity_post: "serious"
      probability_post: "improbable"
      risk_level_post: "low"
      acceptable: true
      rationale: "Risk controls reduce probability 2 tiers (occasional → improbable). Clinician verification is standard of care; warning prompt ensures awareness."
      residual_risk_decision: "accepted"
      decision_rationale: "Clinical benefit (growth monitoring) outweighs residual risk. Mitigation: clinician training, regular recalibration against reference standards."
    
    date_reviewed: "2026-04-24"
    reviewer: "Timothy Hartzog MD"
    references:
      - "AAP Pediatric Nutrition Committee. Updated Growth Charts (2022)"
      - "ISO 14971:2019 §7.4 Risk Control Options"

  - id: "HZ-003"
    title: "Dose calculation failure on extreme weight"
    hazardous_situation: "Dose formula fails (overflow, underflow, or logic error) for very small or very large patients"
    potential_harm: "Clinician sees wrong dose; medication error → overdose or underdose → harm"
    severity: "catastrophic"
    probability_pre_control: "occasional"
    risk_level_pre: "critical"
    
    risk_controls:
      - id: "RC-005"
        measure: "Input validation: weight in [0.5 kg, 20 kg]"
        implementation: "src/validators.rs::validate_weight()"
        verification: "TC-201"
      - id: "RC-006"
        measure: "Dose calculation includes range guard: result in [min_dose, max_dose]"
        implementation: "src/dose.rs::calculate_dose_with_guard()"
        verification: "TC-202, TC-203"
      - id: "RC-007"
        measure: "Adversarial property test: 1000 random weight × dose combinations tested"
        implementation: "tests/proptest_dose.rs::prop_test_dose_ranges"
        verification: "Weekly mutation test run"

    residual_risk:
      severity_post: "minor"
      probability_post: "improbable"
      risk_level_post: "low"
      acceptable: true
      rationale: "Input validation + range guards reduce severity (catastrophic → minor) and probability (occasional → improbable). Remaining risk: untested edge case in formula (caught by mutation testing)."

    references:
      - "IEC 62304:2015 §7.4.1 Risk Control"

---

# Risk Summary Table (computed from above)

summary:
  total_hazards: 2
  critical_risk_hazards: 1
  high_risk_hazards: 1
  acceptable_hazards: 2
  hazards_requiring_controls: 2
  hazards_with_residual_risk: 2
```

### 5. Test Case Map (`dhf/verification/unit-test-map.yaml`)

```yaml
---
metadata:
  document_id: "VER-PedNeoSim.jl-v1.0"
  author: "Timothy Hartzog"
  date: "2026-04-24"
  coverage_target_class_c: "95% line coverage, 85% mutation kill rate"

test_cases:
  - id: "TC-101"
    title: "Validate birth date in future is rejected"
    type: "unit"
    requirement_tested: "SW-010"
    risk_mitigated: "HZ-001 (RC-001)"
    location: "tests/unit/validators_test.rs::test_birth_date_future_rejected"
    preconditions:
      - "System initialized"
      - "Input: birth_date = tomorrow"
    actions:
      - "Call validate_birth_date(tomorrow)"
    expected_result: "Returns Err(DateInFuture)"
    pass_criteria: "Test passes; error message is clear"
    status: "implemented"
    test_date: "2026-04-24"

  - id: "TC-102"
    title: "GA calculation matches AAP reference for 28-week PMA"
    type: "unit"
    requirement_tested: "SW-001"
    risk_mitigated: "HZ-001 (RC-002)"
    location: "tests/unit/growth_test.rs::test_ga_calc_28week"
    preconditions:
      - "Reference table loaded (AAP 2022)"
      - "Input: birth_date = 28 weeks ago"
    actions:
      - "Call calculate_ga_days(birth_date)"
    expected_result: "Returns 196–197 days (28 weeks ± 1 day)"
    pass_criteria: "Calculated GA ≤ 2% error vs. reference"
    status: "implemented"
    test_date: "2026-04-24"

  - id: "TC-201"
    title: "Dose calculation within bounds for min/max weight"
    type: "unit"
    requirement_tested: "SW-002, SW-010"
    risk_mitigated: "HZ-003 (RC-005, RC-006)"
    location: "tests/unit/dose_test.rs::test_dose_bounds_min_max"
    preconditions:
      - "Standard formula: dose = weight × 5 mg/kg"
      - "Min weight = 0.5 kg, max weight = 20 kg"
    actions:
      - "Calculate dose for weight = 0.5 kg"
      - "Calculate dose for weight = 20 kg"
    expected_result:
      - "dose(0.5 kg) = 2.5 mg"
      - "dose(20 kg) = 100 mg"
    pass_criteria: "Both within expected range; no overflow/underflow"
    status: "implemented"
    test_date: "2026-04-24"

  - id: "TC-202"
    title: "Dose calculation rejects out-of-bounds weight"
    type: "unit"
    requirement_tested: "SW-010"
    risk_mitigated: "HZ-003 (RC-005)"
    preconditions:
      - "Input: weight = 25 kg (out of bounds)"
    actions:
      - "Call calculate_dose(weight=25)"
    expected_result: "Returns Err(WeightOutOfBounds)"
    status: "implemented"

  - id: "TC-203"
    title: "Property-based test: 1000 random doses"
    type: "unit (property test)"
    requirement_tested: "SW-002"
    risk_mitigated: "HZ-003 (RC-007)"
    location: "tests/proptest_dose.rs::prop_test_dose_valid_for_any_weight"
    preconditions:
      - "proptest config: 1000 iterations"
      - "weight ∈ [0.5 kg, 20 kg]"
    actions:
      - "For each random weight, calculate dose"
      - "Assert: dose result is Ok and within [0.5 × standard, 2.0 × standard]"
    expected_result: "All 1000 iterations pass; no panics or exceptions"
    status: "weekly (mutation test run)"
    mutation_coverage: "Catches off-by-one in formula, decimal place errors"

traceability_matrix:
  # Auto-generated by reusable-iec62304-traceability.yml
  # SYS/SW requirement ID -> list of test case IDs that verify it
  SW-001: ["TC-102"]
  SW-002: ["TC-201", TC-202", "TC-203"]
  SW-010: ["TC-101", "TC-201", "TC-202"]
  
coverage_report:
  latest_run: "2026-04-24"
  line_coverage: "96%"
  branch_coverage: "91%"
  mutation_kill_rate: "87%"
  status: "PASS (exceeds Class C requirements: 95% line, 85% mutation)"
```

---

## Traceability Workflow Integration

**Workflow name**: `reusable-iec62304-traceability.yml`  
**Trigger**: On PR touching `dhf/` or `src/` (for Class B/C repos)  
**Output**: Pass/fail + HTML traceability matrix

**Checks performed**:

1. **Requirement coverage**: Every SW-### requirement in `software-requirements.yaml` has ≥1 test case
2. **Test coverage**: Every test case in code maps to a requirement (no orphaned tests)
3. **Risk control coverage**: Every risk control RC-### is mentioned in test cases or architecture
4. **Code annotations**: Every safety-critical function (`@requirement()`, `@mitigates()`) is annotated
5. **Coverage gate**: Code coverage ≥ 95% for Class C, ≥ 85% for Class B
6. **Mutation gate**: Mutation kill rate ≥ 85% for Class C, ≥ 70% for Class B

**Failure examples**:
- ❌ SW-042 has no test cases → PR blocked
- ❌ TC-105 test exists but SW-### requirement missing → PR blocked
- ❌ Code coverage drops to 92% (< 95% target) → PR blocked
- ❌ New RC-### risk control exists but not tied to any test → PR blocked

---

## Release Package (`dhf/releases/v<version>/`)

On every release tag, automated workflow creates:

1. **release-note.md** — Change summary, known issues, migration guide
2. **build-info.json** — Build environment, commit SHA, build duration, build signature
3. **sbom.json** — Symlink from `sbom/cyclonedx.json`
4. **vex.json** — Symlink from `vex/vex.json`
5. **provenance.intoto.jsonl** — SLSA provenance (Phase 2)
6. **traceability-matrix.html** — Auto-generated from DHF requirements/tests
7. **test-evidence.zip** — All test results, coverage reports, Playwright videos
8. **signature.json** — 21 CFR Part 11 signature envelope (Phase 5)

**Release checklist** (enforced by GitHub ruleset):

```markdown
## Release Checklist for v1.2.3

### Code Review
- [ ] 2+ code owner approvals
- [ ] All review threads resolved
- [ ] Last-push approval obtained

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Line coverage ≥ 95%
- [ ] Mutation kill rate ≥ 85%
- [ ] Security scan (CodeQL) passed
- [ ] PHI scan passed

### Documentation
- [ ] Release notes updated (dhf/releases/v1.2.3/release-note.md)
- [ ] SBOM generated + attested
- [ ] VEX document generated + attested
- [ ] Provenance generated + signed

### Traceability
- [ ] Traceability matrix generated (dhf/releases/v1.2.3/traceability-matrix.html)
- [ ] All requirements verified by tests
- [ ] All risk controls verified by tests
- [ ] DHF review timestamp updated

### Compliance
- [ ] E-signature obtained (audit-sign-envelope.yml workflow)
- [ ] Audit log entry created with signature
- [ ] Merkle chain verified

**Signature**: By releasing, I affirm this software is safe for clinical use.  
**Signer**: Timothy Hartzog MD  
**Date**: 2026-05-15  
**Intent**: "I approve PedNeoSim.jl v1.2.3 for clinical simulation use in neonatal training."
```

---

## Template Repo: PedNeoSim.jl

Phase 6 focuses on fully populating `PedNeoSim.jl` as the reference implementation:

| Deliverable | Status | By Week 12 |
|-------------|--------|-----------|
| `dhf/classification.md` | ✅ Class C classification written | ✅ |
| `dhf/requirements/software-requirements.yaml` | ✅ 20+ SW-### requirements | ✅ |
| `dhf/risk/hazard-analysis.yaml` | ✅ 5–10 critical hazards + controls | ✅ |
| `dhf/architecture/sw-architecture.md` | ✅ Module decomposition + interfaces | ✅ |
| `dhf/verification/unit-test-map.yaml` | ✅ All tests mapped to requirements | ✅ |
| Code annotations (`@requirement`, `@mitigates`) | ✅ All safety-critical functions annotated | ✅ |
| `reusable-iec62304-traceability.yml` | ✅ Workflow passing on every PR | ✅ |
| Test coverage ≥ 95% + mutation ≥ 85% | ✅ Metrics dashboard shows both | ✅ |
| Release v1.0 with DHF package | ✅ `dhf/releases/v1.0/` complete | ✅ |
| Quarterly review + sign-off | ✅ `dhf/review-schedule.md` updated | ✅ |

**Post-Phase-6 timeline**:
- Week 13–14 (Phase 7): Replicate DHF pattern to other Class B/C repos (CDS, simulator, etc.)
- Week 15+: DHF becomes the standard; new clinical repos scaffold from template

---

## Quarterly DHF Review Process

**Frequency**: Every 90 days (Q1, Q2, Q3, Q4)  
**Time**: ~2 hours per review  
**Location**: `dhf/review-schedule.md` + audit log entry

**Checklist** (per ISO 14971 §7):

- [ ] **Requirements**: Any new requirements added since last review? Any old requirements no longer applicable?
- [ ] **Hazards**: Any new hazards discovered? Any hazards mitigated since last review?
- [ ] **Risk controls**: All controls still implemented and verified? Any control failures in post-market?
- [ ] **Residual risk**: Residual risk still acceptable? Any change in patient population or use case?
- [ ] **Tests**: Test suite still comprehensive? Any gaps discovered?
- [ ] **Code changes**: All commits linked to requirements? Any undocumented changes?
- [ ] **Incidents**: Any customer complaints or near-misses? Update complaints.jsonl
- [ ] **Next review date**: Schedule next review 90 days out

**Sign-off entry** (appended to audit log as signed event):

```json
{
  "event_type": "dhf-quarterly-review",
  "event_id": "DHF-2026-Q2-PedNeoSim.jl",
  "timestamp": "2026-07-24T14:00:00Z",
  "repository": "ruralpeds/PedNeoSim.jl",
  "actor": "timothyhartzog",
  "meaning": "I have completed Q2 2026 DHF review. All requirements, hazards, controls, and risks re-validated. Residual risk remains acceptable. No new issues discovered.",
  "findings": {
    "requirements_reviewed": 23,
    "hazards_reviewed": 8,
    "controls_verified": 12,
    "new_incidents": 0,
    "status": "approved"
  },
  "signature": { ... Part 5 signature envelope ... }
}
```

---

## References

- **IEC 62304:2015** — Software Lifecycle Processes
- **ISO 14971:2019** — Risk Management for Medical Devices
- **FDA Guidance: Design Control** (21 CFR §820.30)
- **AAMI TIR57** — Guidance on IEC 62304 Implementation
