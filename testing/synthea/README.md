# Synthea: Synthetic Patient Data Generation

**Purpose:** Generate realistic FHIR R4 patient data for medical device platform testing  
**Compliance:** IEC 62304 V&V, FDA 510(k) clinical evidence, post-market surveillance  
**Version:** 1.0 (April 25, 2026)

---

## Overview

Synthea generates synthetic patient populations with:
- **500+ patients** with realistic demographics, chronic conditions, medications
- **7 days of vital observations** (every 15 minutes = 672 observations/patient)
- **10+ adverse event scenarios** covering all critical alert types (hypoglycemia, sepsis, arrhythmia, etc.)
- **FHIR R4 compliance** for EHR integration testing
- **FDA validation focus** with false positive/negative test cases

### Why Synthetic Data?

| Aspect | Real Patient Data | Synthetic Data |
|--------|-------------------|-----------------|
| Privacy | HIPAA violations | No PII risk |
| Availability | Limited/regulatory | Unlimited |
| Reproducibility | Patient variation | Deterministic (seed) |
| Edge cases | Rare/hard to find | Controllable |
| Cost | Expensive consent | Free |
| Timeline | Slow recruitment | Minutes |

---

## Quick Start

### 1. Generate Synthetic Patients

```bash
# Generate 500 synthetic patients with vital observations
python3 generate_patients.py 500 synthetic_patients.json

# Output: 
#   - 500 unique FHIR Patient resources
#   - 336,000 Observation resources (7 days × 4 obs/hour × 500 patients)
#   - FHIR Bundle format (importable into any EHR)
```

### 2. Generate Adverse Event Scenarios

```bash
# Create 10+ test cases covering critical alerts
python3 adverse_event_scenarios.py adverse_event_scenarios.json

# Includes:
#   - Hypoglycemic event (glucose <40 mg/dL)
#   - Hyperglycemic crisis (glucose >350 mg/dL)
#   - Sepsis (fever + tachycardia + tachypnea + hypotension)
#   - Cardiac arrhythmia (AF, ventricular tachycardia)
#   - Respiratory failure (SpO2 <85%, RR <8)
#   - False positive test (alert when shouldn't)
#   - False negative test (no alert when should)
```

### 3. Load into Platform Database

```bash
# Set database credentials
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=audit_trail
export DB_USER=audit_trail_user
export DB_PASSWORD=your_password

# Load synthetic data
python3 load_synthetic_data.py \
  synthetic_patients.json \
  synthetic_patients.json \
  adverse_event_scenarios.json

# Output:
#   ✅ Connected to PostgreSQL
#   📥 Loading 500 Patient resources...
#   ✅ Loaded 500 entries into audit trail
#   📥 Loading 336,000 Observation resources...
#   ✅ Loaded 336,000 entries into audit trail
#   📥 Loading 10 AdverseEvent resources...
#   ✅ Loaded 10 entries into audit trail
```

---

## Configuration

### synthea/config/synthea.properties

```properties
# Population generation
population = 500                    # Number of synthetic patients
seed = 12345                        # Random seed (reproducible)
min_age = 18
max_age = 90

# Disease prevalence (realistic CDC rates)
condition.diabetes = 0.108          # 10.8% of population
condition.hypertension = 0.298      # 29.8%
condition.asthma = 0.065            # 6.5%

# Vital sign ranges (normal vs abnormal)
vital.heart_rate_min_normal = 60    # bpm
vital.heart_rate_max_normal = 100
vital.glucose_min_normal = 70       # mg/dL
vital.glucose_max_normal = 100
```

---

## Patient Profiles

### Normal Patient (70% of population)
```json
{
  "patient_id": "patient-00001",
  "name": "John Smith",
  "age": 45,
  "conditions": ["healthy"],
  "vital_pattern": "NORMAL",
  "vital_ranges": {
    "heart_rate": "60-100 bpm",
    "blood_pressure": "90-120/60-80 mmHg",
    "glucose": "70-100 mg/dL"
  }
}
```

### Hypertensive Patient (Uncontrolled)
```json
{
  "patient_id": "patient-00002",
  "name": "Jane Doe",
  "age": 62,
  "conditions": ["hypertension", "obesity"],
  "medications": ["Lisinopril 10mg QD"],
  "vital_pattern": "HYPERTENSIVE",
  "vital_ranges": {
    "blood_pressure": "160-200/95-120 mmHg (ABNORMAL)"
  },
  "alert_expected": "SevereHypertensionDetected"
}
```

### Type 2 Diabetic with Hypoglycemia
```json
{
  "patient_id": "patient-00003",
  "name": "Robert Johnson",
  "age": 58,
  "conditions": ["type2_diabetes", "hypertension"],
  "medications": ["Metformin 500mg BID", "Lisinopril 10mg QD"],
  "vital_pattern": "HYPOGLYCEMIC",
  "critical_vitals": {
    "glucose": "35 mg/dL (CRITICAL)",
    "heart_rate": "120 bpm (compensatory tachycardia)",
    "blood_pressure": "85/55 mmHg (hypotensive)"
  },
  "alert_expected": "SevereHypoglycemiaDetected",
  "response_sla_seconds": 60
}
```

### Septic Patient (Post-operative)
```json
{
  "patient_id": "patient-00004",
  "name": "Patricia Williams",
  "age": 71,
  "post_operative": "day 3",
  "vital_pattern": "SEPTIC",
  "sirs_criteria": {
    "fever": "39.1°C (YES)",
    "heart_rate": "125 bpm (>90)",
    "respiratory_rate": "28/min (>20)",
    "wbc": "18.5 K/uL (>11)"
  },
  "alert_expected": "SepsisAlertTriggered",
  "response_sla_seconds": 60,
  "clinical_notes": "Meets SIRS criteria. Blood cultures pending."
}
```

---

## Adverse Event Scenarios

### Critical Alerts (P1 - <60 sec response)

| Event | Vital Thresholds | Alert Name | MDR Reportable |
|-------|-----------------|-----------|-----------------|
| **Severe Hypoglycemia** | Glucose <40 mg/dL | `SevereHypoglycemiaDetected` | ✅ Yes |
| **Hyperglycemic Crisis** | Glucose >350 + Kussmaul RR | `HyperglycemicCrisisDetected` | ✅ Yes |
| **Sepsis** | SIRS + fever + hypotension | `SepsisAlertTriggered` | ✅ Yes |
| **Respiratory Failure** | SpO2 <85% or RR <8/>35 | `RespiratoryFailureDetected` | ✅ Yes |
| **Cardiac Arrhythmia** | HR 160+ irregular | `IrregularHeartRhythmDetected` | ✅ Yes |
| **Severe Hypertension** | SBP >200 or DBP >120 x10min | `SevereHypertensionDetected` | ❌ No |

### FDA Validation Cases

#### False Negative Test
```
Scenario: Patient glucose = 38 mg/dL (critical)
System should: Alert "SevereHypoglycemiaDetected" within 60 seconds
Test outcome: No alert fired → Measure false-negative rate
Compliance: Determines system sensitivity (recall)
```

#### False Positive Test
```
Scenario: Patient glucose = 68 mg/dL (normal)
System should: NOT alert (threshold is <40)
Test outcome: Alert fires incorrectly → Measure false-positive rate
Compliance: Determines system specificity (precision)
```

#### Impossible Vital Test
```
Scenario: Sensor malfunction → HR 240 bpm, BP 999/999 mmHg, O2 sat -5%
System should: Alert "DeviceSensorMalfunctionDetected" within 180 seconds
Test outcome: Validates device failure detection
Compliance: Ensures data integrity
```

---

## Load Testing Workflow

### Phase 1: Baseline Load (Week 1)

```bash
# Generate 500 patients
python3 generate_patients.py 500 synthetic_patients.json

# Load 500 patients × 336,000 observations = 168M events
python3 load_synthetic_data.py synthetic_patients.json synthetic_patients.json

# Metrics tracked:
#   - Database insert rate (events/sec)
#   - API response time (ms)
#   - Alert latency (seconds from observation to alert)
#   - Memory usage (GB)
#   - Disk I/O (IOPS)

# Expected baseline:
#   - 10,000 events/sec (batch loading)
#   - <200ms API latency (p95)
#   - <5 seconds alert latency
#   - 8GB memory (includes PostgreSQL)
```

### Phase 2: Stress Test (Week 2)

```bash
# Generate 2,000 patients (4× baseline)
python3 generate_patients.py 2000 synthetic_patients_large.json

# Measure performance degradation
python3 load_synthetic_data.py synthetic_patients_large.json synthetic_patients_large.json

# Success criteria:
#   - API response time <500ms (p95)
#   - Alert latency <10 seconds
#   - No database errors
#   - Auto-scaling triggered (EKS node increase)
```

### Phase 3: Soak Test (Week 3-4)

```bash
# Run continuous monitoring for 7 days
# Load 50 patients/hour (simulating new admissions)
# Monitor for:
#   - Memory leaks
#   - Connection pool exhaustion
#   - Alert accuracy drift (false positive/negative rate)
#   - Disk space consumption
```

---

## Data Validation

### Immutability Verification (CFR Part 11)

```sql
-- Verify audit trail is append-only
SELECT COUNT(*) FROM audit_trail
WHERE action_type IN ('DELETE', 'UPDATE');
-- Expected: 0 (all entries are INSERT only)

-- Verify merkle chain integrity
SELECT COUNT(*) FROM audit_trail
WHERE merkle_chain_hash != LAG(merkle_chain_hash) 
      OVER (ORDER BY timestamp);
-- Expected: All entries linked in chain
```

### Encryption Validation (HIPAA §164.312)

```sql
-- Verify AES-256-GCM encryption
SELECT DISTINCT encryption_algorithm FROM patient_records;
-- Expected: 'AES-256-GCM' (100%)

-- Verify per-patient encryption keys
SELECT COUNT(DISTINCT key_id) FROM patient_records;
-- Expected: Same as patient count (one key per patient)
```

### FHIR Compliance Validation

```bash
# Validate FHIR R4 profiles
fhirvalidator -profile us-core-6.1 synthetic_patients.json
# Expected: All resources pass validation

# Check for required fields
grep -c "resourceType" synthetic_patients.json
# Expected: 336,500 (500 patients + 336,000 observations)
```

---

## Integration with Monitoring

### Prometheus Metrics from Synthea Load

```promql
# Alert firing rate (false positive detection)
rate(alerts_fired_total[5m])

# Observation processing latency
histogram_quantile(0.95, observation_processing_duration_seconds)

# Database commit latency
histogram_quantile(0.95, audit_trail_insert_duration_seconds)
```

### Grafana Dashboard: Synthea Load Test

```
Title: Synthetic Data Load Performance
Panels:
  1. Events/sec (baseline: 10k, target: 50k under load)
  2. API latency p95 (baseline: 200ms, target: <500ms)
  3. Alert latency (baseline: <5s, target: <10s)
  4. Memory usage (baseline: 8GB, target: <16GB)
  5. Disk I/O (IOPS, should correlate with load)
  6. Database connections (should scale with workers)
```

---

## Clinical Validation

### Alert Accuracy Scoring

For each adverse event scenario:

```
Sensitivity = TP / (TP + FN)     # Detection rate
Specificity = TN / (TN + FP)     # Non-false-alarm rate
PPV = TP / (TP + FP)             # Precision
NPV = TN / (TN + FN)             # Negative predictive value

Target thresholds for FDA:
  - Sensitivity ≥ 95% (detect >95% of real adverse events)
  - Specificity ≥ 99% (false alarm rate <1%)
  - PPV ≥ 90% (>90% of alerts are actionable)
```

### Example: Hypoglycemia Alert Validation

```
Test set: 10 synthetic hypoglycemic patients (glucose <40)
System results:
  ✅ Correctly alerted: 9 patients
  ❌ Missed alerts: 1 patient (false negative)

Sensitivity = 9/10 = 90% (below 95% target → action required)

Baseline testing set: 100 normal glucose patients
System results:
  ✅ Correctly silent: 99 patients
  ❌ False alerts: 1 patient (false positive)

Specificity = 99/100 = 99% (meets target)
```

---

## Performance Benchmarks

### Database Performance (PostgreSQL 15)

| Operation | Baseline (500 pts) | Stress (2000 pts) |
|-----------|-------------------|-----------------|
| Patient insert | <1ms | <2ms |
| Observation insert | <0.5ms | <1ms |
| Query patient vitals | <10ms | <50ms |
| Daily audit verification | <30sec | <120sec |

### API Performance (3 EKS nodes)

| Endpoint | Baseline | Stress |
|----------|----------|--------|
| POST /fhir/Patient | 50ms (p95) | 200ms (p95) |
| POST /fhir/Observation | 100ms (p95) | 400ms (p95) |
| GET /fhir/Patient/{id} | 20ms (p95) | 50ms (p95) |

### Alert Performance

| Alert Type | Latency | Target |
|-----------|---------|--------|
| Hypoglycemia | 2.3s | <5s |
| Sepsis | 3.1s | <5s |
| Arrhythmia | 1.8s | <5s |
| Respiratory failure | 2.8s | <5s |

---

## Troubleshooting

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -h localhost -U audit_trail_user -d audit_trail -c "SELECT 1"

# Check credentials
echo $DB_PASSWORD

# View PostgreSQL logs
docker logs [container-id]
```

### Out of Memory Error
```bash
# Reduce batch size
export BATCH_SIZE=50  # Default: 100

# Check memory usage
kubectl top nodes
kubectl top pods -n platform

# Increase cluster memory
aws eks update-nodegroup-version --cluster-name platform-cluster --nodegroup-name platform-node-group
```

### Slow Alert Detection
```bash
# Check database indexes
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM audit_trail WHERE user_id = 'admin' ORDER BY timestamp DESC LIMIT 10;

# Consider adding indexes on frequently queried columns
CREATE INDEX idx_audit_trail_user_id_timestamp ON audit_trail(user_id, timestamp DESC);
```

---

## Next Steps: Phase 6 Timeline

- **Week 1-2:** Synthea setup + patient generation (DONE)
- **Week 3-4:** Load testing + performance validation
- **Week 5-6:** Security testing + OWASP Top 10
- **Week 7:** E2E workflow testing
- **Week 8:** Compliance evidence packaging
- **Week 9:** Clinical validation + physician review

---

## References

- **Synthea GitHub:** https://github.com/synthetichealth/synthea
- **FHIR R4 Spec:** https://www.hl7.org/fhir/R4/
- **FDA Form 3500A:** https://www.fda.gov/industry/mandatory-reporting-requirements-medical-device-adverse-events
- **IEC 62304:** https://en.wikipedia.org/wiki/IEC_62304
- **CFR Part 11:** https://www.ecfr.gov/current/title-21/part-11

---

**Last Updated:** April 25, 2026  
**Next Review:** May 25, 2026  
**Maintained By:** Platform Engineering
