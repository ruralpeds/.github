# Phase 7, Task 2: FHIR Validation — US Core 6.1 Profile Conformance

**Objective:** Validate synthetic patient FHIR bundles against US Core 6.1 profiles.

**Duration:** 6 hours (Week 14)

## Requirements

- Integrate HAPI FHIR validator into CI pipeline
- Validate all Synthea fixtures against US Core 6.1 profiles
- Detect missing elements, invalid CodeSystems, invariant violations
- Generate validation report (JSON + HTML)
- Fail CI if errors exceed threshold
- Wire into clinical test suites

## Acceptance Criteria

- [ ] HAPI FHIR validator JAR downloaded and cached
- [ ] US Core 6.1 profiles loaded (resource types: Patient, Observation, Condition, MedicationRequest, etc.)
- [ ] Validation workflow runs on Synthea fixtures
- [ ] No FHIR validation errors (0 errors required)
- [ ] Validation report generated (JSON + HTML artifact)
- [ ] PR comments with validation status
- [ ] docs/testing/CLINICAL_TESTING_DEPTH.md updated (Week 14 section)

## Implementation Steps

1. **Set up HAPI FHIR validator:**
   - Download validator JAR: `wget https://github.com/hapifhir/org.hl7.fhir.core/releases/download/6.4.8/validator_cli.jar`
   - Cache in /tmp/hapi-fhir/
   - Verify: `java -jar validator_cli.jar -version`
   - Java 17+ required

2. **Configure US Core 6.1 profiles:**
   - Load IG package: `hl7.fhir.us.core#6.1.0`
   - Profiles to validate:
     - http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient
     - http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab
     - http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs
     - http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition
     - http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest
   - Create validator config JSON with profiles

3. **Validate Synthea fixtures:**
   - Input: `tests/fixtures/fhir/synthetic/*.json` (Synthea output from Task 1)
   - For each resource:
     - Check: resourceType present
     - Check: id present (best practice)
     - Check: meta.profile contains US Core profile URL
     - Check: All required elements present (per US Core constraints)
     - Check: CodeSystems valid (e.g., LOINC for lab observations)
   - Generate violations list: missing elements, invalid bindings, invariant violations

4. **Generate validation report:**
   - JSON format:
     ```json
     {
       "total_resources": 300,
       "valid": 295,
       "invalid": 5,
       "errors": [
         {
           "file": "patient-123.json",
           "resource_type": "Patient",
           "errors": ["Missing required element: name"]
         }
       ],
       "warnings": [
         {"file": "...", "message": "No US Core profile declared"}
       ]
     }
     ```
   - HTML report with summary table + error details
   - Upload artifact (90-day retention)

5. **Integrate workflow:**
   - Workflow file: `.github/workflows/reusable-fhir-validation.yml` ✅ (already created)
   - Inputs:
     - `fixture_path`: `tests/fixtures/fhir/synthetic` (default)
     - `profile_version`: `6.1` (default)
     - `fail_on_error`: `true` (default)
     - `max_errors`: `0` (default — no tolerance)
   - Outputs: `validation_status`, `error_count`, `warning_count`
   - Called after reusable-synthea-fixtures.yml

6. **Wire into clinical tests:**
   - Create test suite that uses validated fixtures:
     ```python
     import json
     from pathlib import Path
     
     @pytest.fixture
     def fhir_patients():
         fixtures = Path('tests/fixtures/fhir/synthetic')
         return [json.load(open(f)) for f in fixtures.glob('*.json') 
                 if json.load(open(f)).get('resourceType') == 'Patient']
     
     def test_patient_vitals(fhir_patients):
         # Clinical test using real FHIR structure
         for patient in fhir_patients:
             assert patient.get('resourceType') == 'Patient'
     ```

7. **Document:**
   - Update docs/testing/CLINICAL_TESTING_DEPTH.md (Week 14 section):
     ```markdown
     ## Week 14: FHIR Validation
     - Validate all Synthea fixtures against US Core 6.1
     - HAPI FHIR validator checks resource conformance
     - Failure modes: missing elements, invalid CodeSystems, invariants
     - PR status check: "FHIR Validation" (must pass)
     - 0 errors required (no tolerance)
     ```

## Regulatory Alignment

- **IEC 62304 §7.3:** Verification with valid, conformant test data
- **FDA:** US Core profiles are standard for EHR interoperability
- **HIPAA:** Profile conformance required for HL7/FHIR exchange

## Failure Modes & Resolution

| Error | Cause | Resolution |
|-------|-------|-----------|
| Missing required element | Synthea incomplete | Update Synthea config |
| Invalid CodeSystem binding | LOINC/SNOMED mismatch | Fix Synthea terminology |
| Invariant violation | Constraint unsatisfied | Regenerate fixtures |
| Profile not declared | Missing meta.profile | Add to Synthea output |

## Output Artifacts

- Validation report JSON: `fhir_validation_report.json`
- Validation report HTML: `fhir_validation_report.html`
- Workflow artifact: `fhir-validation-report` (90-day)

## Dependencies

- Phase 7, Task 1 complete (Synthea fixtures generated)
- Java 17+
- HAPI FHIR validator JAR accessible

## Next Task

Phase 7, Task 3: Adversarial Testing — Property-based + mutation tests
