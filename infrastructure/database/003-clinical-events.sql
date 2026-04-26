-- Database Migration 003: Clinical Events & Adverse Event Monitoring
-- Compliance: IEC 62304 §5.8 Post-market surveillance
--            FDA MedWatch - Adverse event tracking
--            21 CFR Part 803 - Medical Device Reporting (MDR)
-- Version: 1.0 (April 25, 2026)

-- Table for vital signs & clinical measurements
CREATE TABLE IF NOT EXISTS clinical_vitals (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(100) NOT NULL,
  event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Vital signs (from connected devices or manual entry)
  heart_rate_bpm INT,
  systolic_mmhg INT,
  diastolic_mmhg INT,
  temperature_celsius DECIMAL(5, 2),
  respiratory_rate_bpm INT,
  oxygen_saturation_percent DECIMAL(5, 2),
  blood_glucose_mg_dl DECIMAL(7, 2),

  -- Additional measurements
  weight_kg DECIMAL(7, 2),
  height_cm DECIMAL(6, 2),

  -- Data quality
  measurement_reliability VARCHAR(50),
  -- Reliability: RELIABLE, QUESTIONABLE, UNRELIABLE, MANUAL_ENTRY

  data_source VARCHAR(100),
  -- Source: DEVICE_MONITOR, MANUAL_ENTRY, EHR_IMPORT, etc.

  -- For audit trail
  recorded_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT vitals_at_least_one_measurement CHECK (
    heart_rate_bpm IS NOT NULL
    OR systolic_mmhg IS NOT NULL
    OR temperature_celsius IS NOT NULL
    OR oxygen_saturation_percent IS NOT NULL
  ),

  FOREIGN KEY (patient_id)
    REFERENCES patient_records(patient_id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_vitals_patient_timestamp ON clinical_vitals(patient_id, event_timestamp DESC);
CREATE INDEX idx_vitals_timestamp ON clinical_vitals(event_timestamp DESC);

-- Table for clinical alerts
CREATE TABLE IF NOT EXISTS clinical_alerts (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(100) NOT NULL,
  event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Alert identification
  alert_type VARCHAR(100) NOT NULL,
  -- Type: TACHYCARDIA, BRADYCARDIA, HYPERTENSION, HYPOTENSION, HYPOXEMIA,
  --       HYPERGLYCEMIA, HYPOGLYCEMIA, FEVER, RESPIRATORY_DISTRESS, etc.

  alert_severity VARCHAR(20) NOT NULL,
  -- Severity: INFO, WARNING, ALERT, CRITICAL

  alert_description TEXT NOT NULL,

  -- Alert triggering data
  triggering_vital VARCHAR(50),
  triggering_value DECIMAL(10, 2),
  alert_threshold DECIMAL(10, 2),

  -- Clinician response
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by VARCHAR(100),
  acknowledged_timestamp TIMESTAMP,
  acknowledged_notes TEXT,

  -- Resolution
  alert_resolved BOOLEAN DEFAULT FALSE,
  resolved_by VARCHAR(100),
  resolved_timestamp TIMESTAMP,
  resolution_notes TEXT,
  resolution_type VARCHAR(50),
  -- Resolution: PATIENT_IMPROVED, MEDICATION_GIVEN, DEVICE_ADJUSTED, FALSE_ALARM, etc.

  -- Adverse event tracking
  resulted_in_adverse_event BOOLEAN DEFAULT FALSE,
  adverse_event_id VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT alert_acknowledged_before_resolved CHECK (
    (NOT alert_resolved) OR acknowledged
  ),

  FOREIGN KEY (patient_id)
    REFERENCES patient_records(patient_id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_alerts_patient_timestamp ON clinical_alerts(patient_id, event_timestamp DESC);
CREATE INDEX idx_alerts_severity ON clinical_alerts(alert_severity);
CREATE INDEX idx_alerts_unacknowledged ON clinical_alerts(acknowledged) WHERE NOT acknowledged;
CREATE INDEX idx_alerts_unresolved ON clinical_alerts(alert_resolved) WHERE NOT alert_resolved;

-- Table for medications
CREATE TABLE IF NOT EXISTS clinical_medications (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(100) NOT NULL,

  -- Medication details
  drug_name VARCHAR(255) NOT NULL,
  rxnorm_code VARCHAR(20),
  -- RxNorm code for standardization

  dose_value DECIMAL(10, 2),
  dose_unit VARCHAR(50),
  -- Unit: mg, mcg, mL, units, etc.

  route VARCHAR(50),
  -- Route: PO (oral), IV, IM, SC, etc.

  frequency VARCHAR(100),
  -- Frequency: ONCE_DAILY, TWICE_DAILY, Q4H, Q6H, etc.

  indications TEXT,
  -- Why medication was prescribed

  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT TRUE,

  -- Prescriber & administration
  prescribed_by VARCHAR(100),
  prescribed_date TIMESTAMP DEFAULT NOW() NOT NULL,
  administered_by VARCHAR(100),
  last_administered TIMESTAMP,

  -- Adverse reactions (if any)
  adverse_reaction_observed BOOLEAN DEFAULT FALSE,
  adverse_reaction_description TEXT,

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT med_end_after_start CHECK (
    (end_date IS NULL) OR (end_date >= start_date)
  ),

  FOREIGN KEY (patient_id)
    REFERENCES patient_records(patient_id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_medications_patient_active ON clinical_medications(patient_id, active);
CREATE INDEX idx_medications_drug_name ON clinical_medications(drug_name);

-- Table for adverse events (device-related)
CREATE TABLE IF NOT EXISTS adverse_events (
  id VARCHAR(100) PRIMARY KEY,
  patient_id VARCHAR(100) NOT NULL,

  -- Event details
  event_timestamp TIMESTAMP NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  -- Type: DEATH, SERIOUS_INJURY, HOSPITALIZATION, MALFUNCTION, INCORRECT_TREATMENT, etc.

  event_description TEXT NOT NULL,
  clinical_outcome VARCHAR(100),
  -- Outcome: DEATH, SERIOUS_INJURY, RESOLVED, ONGOING, UNKNOWN

  -- Device involvement
  device_involved BOOLEAN NOT NULL,
  device_model VARCHAR(255),
  device_serial_number VARCHAR(100),
  device_manufacturer VARCHAR(255),

  -- Root cause assessment
  preliminary_root_cause TEXT,
  root_cause_investigation_required BOOLEAN DEFAULT FALSE,

  -- Causality assessment (0.0 = not related, 1.0 = definitely related)
  causality_score DECIMAL(3, 2),
  causality_justification TEXT,

  -- Reporting status
  mdr_reportable BOOLEAN DEFAULT FALSE,
  mdr_report_id VARCHAR(100),
  reported_to_fda BOOLEAN DEFAULT FALSE,
  reported_date TIMESTAMP,
  fda_reference_number VARCHAR(100),

  -- Timeline
  discovered_by VARCHAR(100),
  discovered_date TIMESTAMP DEFAULT NOW() NOT NULL,
  investigation_started TIMESTAMP,
  investigation_completed TIMESTAMP,

  -- Severity classification
  severity VARCHAR(20) NOT NULL,
  -- Severity: MINOR, MAJOR, CRITICAL

  affected_patient_count INT DEFAULT 1,

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT adverse_event_valid_causality CHECK (
    causality_score IS NULL OR (causality_score >= 0.0 AND causality_score <= 1.0)
  ),

  FOREIGN KEY (patient_id)
    REFERENCES patient_records(patient_id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_adverse_patient_timestamp ON adverse_events(patient_id, event_timestamp DESC);
CREATE INDEX idx_adverse_event_type ON adverse_events(event_type);
CREATE INDEX idx_adverse_mdr_reportable ON adverse_events(mdr_reportable);
CREATE INDEX idx_adverse_severity ON adverse_events(severity);

-- Table for device malfunctions
CREATE TABLE IF NOT EXISTS device_malfunctions (
  id VARCHAR(100) PRIMARY KEY,
  adverse_event_id VARCHAR(100),

  device_model VARCHAR(255) NOT NULL,
  device_serial_number VARCHAR(100),

  -- Malfunction description
  malfunction_type VARCHAR(100) NOT NULL,
  -- Type: ALERT_FAILURE, INCORRECT_ALERT, SENSOR_FAILURE, COMMUNICATION_FAILURE, etc.

  malfunction_description TEXT NOT NULL,

  -- Impact assessment
  alert_affected BOOLEAN,
  vital_sign_misreported BOOLEAN,
  patient_injury_risk BOOLEAN,

  -- Timeline
  first_observed TIMESTAMP NOT NULL,
  reproducible BOOLEAN DEFAULT FALSE,

  -- Investigation
  root_cause VARCHAR(255),
  remediation_action VARCHAR(255),
  remediation_status VARCHAR(50),
  -- Status: PENDING, IN_PROGRESS, COMPLETED, NOT_NEEDED

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT malfunction_root_cause_if_completed CHECK (
    remediation_status != 'COMPLETED' OR root_cause IS NOT NULL
  ),

  FOREIGN KEY (adverse_event_id)
    REFERENCES adverse_events(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_malfunction_device ON device_malfunctions(device_model, device_serial_number);
CREATE INDEX idx_malfunction_type ON device_malfunctions(malfunction_type);

-- Table for adverse event investigations
CREATE TABLE IF NOT EXISTS adverse_event_investigations (
  id SERIAL PRIMARY KEY,
  adverse_event_id VARCHAR(100) NOT NULL,

  -- Investigation scope
  investigation_type VARCHAR(50) NOT NULL,
  -- Type: PRELIMINARY, COMPREHENSIVE, FOLLOW_UP

  investigation_status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  -- Status: IN_PROGRESS, COMPLETED, INCONCLUSIVE, REOPENED

  -- Investigators
  lead_investigator VARCHAR(100) NOT NULL,
  investigation_team TEXT,
  -- Comma-separated list of investigators

  -- Timeline
  investigation_started TIMESTAMP NOT NULL,
  investigation_completed TIMESTAMP,

  -- Findings
  preliminary_findings TEXT,
  root_cause_identified VARCHAR(255),
  contributing_factors TEXT,

  -- Actions taken
  corrective_actions TEXT,
  preventive_actions TEXT,

  -- Documentation
  investigation_report_id VARCHAR(100),
  investigation_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT investigation_completed_after_started CHECK (
    investigation_completed IS NULL OR investigation_completed >= investigation_started
  ),

  FOREIGN KEY (adverse_event_id)
    REFERENCES adverse_events(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_investigation_adverse_event ON adverse_event_investigations(adverse_event_id);
CREATE INDEX idx_investigation_status ON adverse_event_investigations(investigation_status);

-- Compliance notes:
-- - All clinical events timestamped (IEC 62304 traceability)
-- - Alerts tracked with response times (quality of device operation)
-- - Adverse events linked to alerts and malfunctions (causality)
-- - MedWatch reporting integration (21 CFR Part 803)
-- - Investigation tracking for root cause analysis
-- - Data immutability: inserted once, never modified (like audit trail)
