# Phase 7, Task 1: Synthea Fixtures — Synthetic Patient Generation

**Objective:** Generate realistic FHIR bundles without PHI for clinical testing.

**Duration:** 5 hours (Week 13)

## Requirements

- Clone Synthea build → generate neonatal + pediatric cohorts (300 patients total)
- Deterministic seeding for reproducible test runs
- Store fixtures in `tests/fixtures/fhir/synthetic/`
- Wire into CI: `reusable-synthea-fixtures.yml` workflow
- Document fixture structure and usage

## Acceptance Criteria

- [ ] Synthea build succeeds (`./gradlew build -x test`)
- [ ] 300 FHIR JSON resources generated (100 neonatal, 100 infant, 50 toddler, 50 school-age)
- [ ] All resources are valid JSON with `resourceType` field
- [ ] Fixture index created: `tests/fixtures/fhir/synthetic/INDEX.json`
- [ ] Workflow runs successfully on `workflow_call` trigger
- [ ] Artifacts uploaded with 90-day retention
- [ ] Documentation: `docs/testing/CLINICAL_TESTING_DEPTH.md` (already exists)

## Implementation Steps

1. **Set up Synthea environment:**
   - Clone synth-data-med/synthea → /tmp/synthea
   - Java 17+ required
   - Run `./gradlew build -x test` (skip tests for speed)
   - Verify build: `ls build/libs/synthea-with-dependencies.jar`

2. **Configure pediatric cohorts:**
   - Edit synthea.properties:
     - `generate.neonatal_count = 100`
     - `generate.infant_count = 100`
     - `generate.toddler_count = 50`
     - `generate.school_age_count = 50`
   - Set deterministic seed: `generate.seed = $(date +%Y-%W)` (weekly seed for reproducibility)
   - Output format: FHIR JSON only

3. **Generate FHIR bundles:**
   - Run: `java -jar build/libs/synthea-with-dependencies.jar -a 0-12 -s SEED -p 300 Massachusetts`
   - Output directory: `synthea/output/fhir/*.json`
   - Validate: Check all files are valid JSON, have `resourceType` field

4. **Copy to test fixtures:**
   - Create `tests/fixtures/fhir/synthetic/` directory
   - Copy generated JSONs: `cp synthea/output/fhir/*.json tests/fixtures/fhir/synthetic/`
   - Generate INDEX.json:
     ```json
     {
       "total_resources": 300,
       "resource_types": ["Patient", "Observation", "Condition", ...],
       "fixtures": {
         "Patient": [{"file": "...", "id": "...", "size_kb": ...}]
       }
     }
     ```

5. **Integrate workflow:**
   - Workflow file: `.github/workflows/reusable-synthea-fixtures.yml` ✅ (already created)
   - Inputs:
     - `cohort_neonatal`: 100
     - `cohort_infant`: 100
     - `cohort_toddler`: 50
     - `cohort_school_age`: 50
     - `seed`: "reproducible-weekly" (default)
   - Outputs: `fixture_count`, `fixture_hash`
   - Upload artifact: `synthea-fhir-fixtures-{run_id}` (90-day retention)

6. **Document usage:**
   - Add to docs/testing/CLINICAL_TESTING_DEPTH.md (Week 13 section):
     ```markdown
     ## Week 13: Synthea Fixtures
     - Fixtures stored in `tests/fixtures/fhir/synthetic/`
     - 300 realistic patient records (neonatal through school-age)
     - Generated weekly via `reusable-synthea-fixtures.yml`
     - Deterministic seeding ensures reproducibility
     ```

## Regulatory Alignment

- **IEC 62304 §7.3:** Verification with realistic test data (Synthea provides realistic patient distributions)
- **FDA:** Synthetic data (no real PHI) acceptable for preclinical validation
- **HIPAA:** No PHI risk (Synthea = fully synthetic)

## Output Artifacts

- `tests/fixtures/fhir/synthetic/` directory with 300 JSON files
- `tests/fixtures/fhir/synthetic/INDEX.json` (fixture manifest)
- Workflow artifact: `synthea-fhir-fixtures-{run_id}.zip` (90-day)

## Dependencies

- Phase 6 complete (IEC 62304 structure in place)
- docs/testing/CLINICAL_TESTING_DEPTH.md already created

## Next Task

Phase 7, Task 2: FHIR Validation (Week 14) — Validate fixtures against US Core 6.1 profiles
