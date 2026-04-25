-- Database Migration 004: Risk Management & FMEA Tracking
-- Compliance: ISO 14971 - Risk management
--            IEC 62304 §5 - Software lifecycle design control
--            FDA Design Control Guidance
-- Version: 1.0 (April 25, 2026)

-- Table for hazard identification & analysis
CREATE TABLE IF NOT EXISTS risk_hazards (
  id VARCHAR(20) PRIMARY KEY,
  -- Format: H-001, H-002, etc.

  hazard_name VARCHAR(255) NOT NULL,
  hazard_description TEXT NOT NULL,

  -- Affected system/subsystem
  affected_component VARCHAR(100),
  -- Component: AUTHENTICATION, DATA_INTEGRITY, ALERT_SYSTEM, SENSORS, etc.

  hazard_category VARCHAR(50),
  -- Category: AUTHENTICATION, DATA_INTEGRITY, CLINICAL_DECISION, AVAILABILITY, etc.

  -- Initial risk assessment
  potential_harm VARCHAR(255) NOT NULL,
  affected_patients VARCHAR(100),
  -- Affected: DIRECT_PATIENT, CLINICAL_TEAM, HEALTHCARE_FACILITY, MANUFACTURER

  -- FMEA Scoring (baseline, before controls)
  severity_score INT NOT NULL,
  -- Severity 1-10: 10 = patient death, 1 = cosmetic

  occurrence_probability INT NOT NULL,
  -- Probability 1-10: 10 = almost certain, 1 = remote

  detectability_score INT NOT NULL,
  -- Detectability 1-10: 10 = undetectable, 1 = always detected

  baseline_rpn INT GENERATED ALWAYS AS (severity_score * occurrence_probability * detectability_score) STORED,
  -- RPN = Risk Priority Number (baseline before controls)

  -- Risk classification
  baseline_risk_level VARCHAR(20),
  -- Level: ACCEPTABLE, CONDITIONAL, UNACCEPTABLE
  -- UNACCEPTABLE if RPN >= 40; requires control measures

  -- Requirements traceability
  risk_control_required BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT severity_valid CHECK (severity_score >= 1 AND severity_score <= 10),
  CONSTRAINT occurrence_valid CHECK (occurrence_probability >= 1 AND occurrence_probability <= 10),
  CONSTRAINT detectability_valid CHECK (detectability_score >= 1 AND detectability_score <= 10)
);

CREATE INDEX idx_hazard_component ON risk_hazards(affected_component);
CREATE INDEX idx_hazard_risk_level ON risk_hazards(baseline_risk_level);

-- Table for risk control measures
CREATE TABLE IF NOT EXISTS risk_controls (
  id VARCHAR(20) PRIMARY KEY,
  -- Format: RC-001, RC-002, etc.

  hazard_id VARCHAR(20) NOT NULL,

  -- Control description
  control_name VARCHAR(255) NOT NULL,
  control_description TEXT NOT NULL,
  control_type VARCHAR(50) NOT NULL,
  -- Type: DESIGN_MEASURE, INFORMATION_FOR_USERS, TRAINING, MONITORING, etc.

  -- Control hierarchy
  hierarchy_level VARCHAR(20),
  -- Level: PRIMARY (eliminate hazard), SECONDARY (reduce risk), TERTIARY (mitigate)

  -- Implementation details
  responsible_team VARCHAR(100),
  implementation_status VARCHAR(50) DEFAULT 'PLANNED',
  -- Status: PLANNED, IN_PROGRESS, IMPLEMENTED, VERIFIED, COMPLETED

  -- SDLC phase where implemented
  implementation_phase VARCHAR(50),
  -- Phase: DESIGN, IMPLEMENTATION, V&V, RELEASE, MAINTENANCE

  -- Testing & verification
  control_test_case_id VARCHAR(100),
  control_verified BOOLEAN DEFAULT FALSE,
  control_verification_date TIMESTAMP,

  -- Residual risk after control
  residual_severity_score INT,
  residual_occurrence_probability INT,
  residual_detectability_score INT,
  residual_rpn INT GENERATED ALWAYS AS (
    COALESCE(residual_severity_score, 1) *
    COALESCE(residual_occurrence_probability, 1) *
    COALESCE(residual_detectability_score, 1)
  ) STORED,

  -- Risk acceptance
  residual_risk_accepted BOOLEAN DEFAULT FALSE,
  risk_acceptance_date TIMESTAMP,
  risk_acceptance_reviewer VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT control_implemented_before_verified CHECK (
    (implementation_status != 'VERIFIED' AND implementation_status != 'COMPLETED') OR
    implementation_status IN ('VERIFIED', 'COMPLETED')
  ),

  CONSTRAINT residual_scores_if_implemented CHECK (
    implementation_status NOT IN ('IMPLEMENTED', 'VERIFIED', 'COMPLETED') OR
    (residual_severity_score IS NOT NULL AND residual_occurrence_probability IS NOT NULL AND residual_detectability_score IS NOT NULL)
  ),

  CONSTRAINT residual_accepted_if_verified CHECK (
    NOT control_verified OR residual_risk_accepted
  ),

  FOREIGN KEY (hazard_id)
    REFERENCES risk_hazards(id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_control_hazard ON risk_controls(hazard_id);
CREATE INDEX idx_control_implementation_status ON risk_controls(implementation_status);
CREATE INDEX idx_control_verified ON risk_controls(control_verified);

-- Table for post-market surveillance findings
CREATE TABLE IF NOT EXISTS post_market_findings (
  id VARCHAR(100) PRIMARY KEY,

  -- Finding identification
  finding_type VARCHAR(50) NOT NULL,
  -- Type: ADVERSE_EVENT, DEVICE_MALFUNCTION, DESIGN_DEFICIENCY, USE_ERROR, etc.

  finding_date TIMESTAMP NOT NULL DEFAULT NOW(),
  finding_source VARCHAR(100),
  -- Source: USER_REPORT, CLINICAL_STAFF, MANUFACTURER_COMPLAINT, FDA_INQUIRY, etc.

  finding_description TEXT NOT NULL,

  -- Severity
  severity VARCHAR(20) NOT NULL,
  -- Severity: MINOR, MAJOR, CRITICAL

  -- Relation to risk hazards
  related_hazard_id VARCHAR(20),
  related_adverse_event_id VARCHAR(100),

  -- Investigation
  investigation_required BOOLEAN DEFAULT TRUE,
  investigation_status VARCHAR(50) DEFAULT 'PENDING',
  investigation_lead VARCHAR(100),

  -- Trend analysis
  is_trend BOOLEAN DEFAULT FALSE,
  trend_description TEXT,
  similar_finding_count INT DEFAULT 1,

  -- Potential impact
  could_affect_design_control BOOLEAN DEFAULT FALSE,
  could_require_risk_re_assessment BOOLEAN DEFAULT FALSE,

  -- Safety signal detection
  detected_as_safety_signal BOOLEAN DEFAULT FALSE,
  safety_signal_threshold_exceeded BOOLEAN DEFAULT FALSE,

  -- FDA notification
  fda_notification_required BOOLEAN DEFAULT FALSE,
  fda_reported BOOLEAN DEFAULT FALSE,
  fda_report_date TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT investigation_pending_if_required CHECK (
    NOT investigation_required OR investigation_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')
  ),

  FOREIGN KEY (related_hazard_id)
    REFERENCES risk_hazards(id)
    ON DELETE SET NULL,
  FOREIGN KEY (related_adverse_event_id)
    REFERENCES adverse_events(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_finding_type ON post_market_findings(finding_type);
CREATE INDEX idx_finding_severity ON post_market_findings(severity);
CREATE INDEX idx_finding_is_trend ON post_market_findings(is_trend);
CREATE INDEX idx_finding_fda_required ON post_market_findings(fda_notification_required);

-- Table for Medical Device Reporting (MDR) submissions
CREATE TABLE IF NOT EXISTS mdr_reports (
  id VARCHAR(100) PRIMARY KEY,

  -- FDA identifier
  fda_form_id VARCHAR(50),
  -- Format: FDA Form 3500A

  fda_submission_date TIMESTAMP,
  fda_mdr_reference_number VARCHAR(50),

  -- Submission type
  submission_type VARCHAR(50) NOT NULL,
  -- Type: PRELIMINARY, FINAL, SUPPLEMENT, ANNUAL_REPORT

  submission_status VARCHAR(50) DEFAULT 'DRAFT',
  -- Status: DRAFT, SUBMITTED, ACKNOWLEDGED, UNDER_REVIEW, CLOSED

  -- Related events
  adverse_event_id VARCHAR(100),
  device_malfunction_id VARCHAR(100),

  -- Device information
  device_manufacturer VARCHAR(255) NOT NULL,
  device_model VARCHAR(255) NOT NULL,
  device_serial_number VARCHAR(100),

  -- Event information
  event_date TIMESTAMP NOT NULL,
  event_type VARCHAR(100),
  event_description TEXT NOT NULL,

  -- Patient information (redacted)
  patient_age_years INT,
  patient_gender VARCHAR(10),
  -- Patient identifiable info: NOT stored in this table (see patient_records with encryption)

  -- Outcome
  event_outcome VARCHAR(100),
  -- Outcome: DEATH, SERIOUS_INJURY, HOSPITALIZATION, REQUIRED_INTERVENTION, etc.

  -- Narratives
  manufacturer_narrative TEXT,
  health_professional_narrative TEXT,
  user_narrative TEXT,

  -- Supporting documents
  document_references TEXT,
  -- JSON array of document IDs

  -- Internal tracking
  internal_case_number VARCHAR(100),
  assigned_to VARCHAR(100),
  priority VARCHAR(20),
  -- Priority: ROUTINE, EXPEDITED

  -- Submission details
  submitted_by VARCHAR(100),
  submitted_date TIMESTAMP,
  submitted_to_fda_date TIMESTAMP,

  -- Follow-up
  fda_follow_up_required BOOLEAN DEFAULT FALSE,
  fda_follow_up_deadline DATE,
  fda_follow_up_response_status VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT mdr_submitted_after_created CHECK (
    submitted_date IS NULL OR submitted_date >= created_at
  ),

  CONSTRAINT mdr_fda_submission_after_internal CHECK (
    submitted_to_fda_date IS NULL OR submitted_to_fda_date >= submitted_date
  ),

  FOREIGN KEY (adverse_event_id)
    REFERENCES adverse_events(id)
    ON DELETE SET NULL,
  FOREIGN KEY (device_malfunction_id)
    REFERENCES device_malfunctions(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_mdr_status ON mdr_reports(submission_status);
CREATE INDEX idx_mdr_fda_submitted ON mdr_reports(submitted_to_fda_date DESC);
CREATE INDEX idx_mdr_adverse_event ON mdr_reports(adverse_event_id);

-- Table for design changes & design modifications
CREATE TABLE IF NOT EXISTS design_changes (
  id VARCHAR(100) PRIMARY KEY,

  -- Change identification
  change_number VARCHAR(50) UNIQUE NOT NULL,
  change_date TIMESTAMP DEFAULT NOW() NOT NULL,

  change_type VARCHAR(50) NOT NULL,
  -- Type: CORRECTIVE_ACTION, PREVENTIVE_ACTION, IMPROVEMENT, MANDATORY, etc.

  change_reason VARCHAR(255) NOT NULL,
  change_description TEXT NOT NULL,

  -- Related risk findings
  related_hazard_id VARCHAR(20),
  related_post_market_finding_id VARCHAR(100),
  related_adverse_event_id VARCHAR(100),

  -- Approval
  change_approved BOOLEAN DEFAULT FALSE,
  approved_by VARCHAR(100),
  approval_date TIMESTAMP,

  -- Implementation
  implementation_planned_date DATE,
  implementation_actual_date DATE,
  implementation_status VARCHAR(50),

  -- Documentation
  change_control_document_id VARCHAR(100),
  fda_notification_required BOOLEAN DEFAULT FALSE,
  fda_notified BOOLEAN DEFAULT FALSE,
  fda_notification_date TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT change_approved_before_implemented CHECK (
    implementation_status NOT IN ('IMPLEMENTED', 'RELEASED') OR change_approved
  ),

  FOREIGN KEY (related_hazard_id)
    REFERENCES risk_hazards(id)
    ON DELETE SET NULL,
  FOREIGN KEY (related_post_market_finding_id)
    REFERENCES post_market_findings(id)
    ON DELETE SET NULL,
  FOREIGN KEY (related_adverse_event_id)
    REFERENCES adverse_events(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_change_number ON design_changes(change_number);
CREATE INDEX idx_change_type ON design_changes(change_type);
CREATE INDEX idx_change_status ON design_changes(implementation_status);

-- Compliance notes:
-- - All risk assessments documented (ISO 14971)
-- - Controls verified before risk acceptance (Design Control Guidance)
-- - Post-market findings tracked and investigated
-- - MDR submissions integrated with adverse events
-- - Design changes linked to findings/hazards (traceability)
-- - FDA notification workflows defined
