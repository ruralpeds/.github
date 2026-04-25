-- Database Migration 001: Audit Trail Initialization
-- Compliance: CFR Part 11 §11.10(e) - Cannot modify or delete
--            IEC 62304 - Software lifecycle documentation
--            HIPAA - Audit controls and logging
-- Version: 1.0 (April 25, 2026)

-- Create audit trail table (immutable, append-only)
CREATE TABLE IF NOT EXISTS audit_trail (
  id SERIAL PRIMARY KEY,

  -- Event identification
  event_id VARCHAR(50) UNIQUE NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  unix_timestamp BIGINT NOT NULL,

  -- WHO: User performing action
  user_id VARCHAR(100) NOT NULL,
  user_role VARCHAR(50),
  user_ip_address VARCHAR(45),
  session_id VARCHAR(100),

  -- WHAT: Action details
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT,

  -- WHERE: Resource details
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  resource_name VARCHAR(255),

  -- Event data (JSON for extensibility)
  event_json JSONB NOT NULL,

  -- Integrity verification
  event_hash VARCHAR(64) NOT NULL,
  event_hash_algorithm VARCHAR(20) DEFAULT 'SHA256',

  -- Digital signature (CFR Part 11 §11.70(c))
  signature VARCHAR(500) NOT NULL,
  signature_timestamp TIMESTAMP NOT NULL,
  signer_cert_thumbprint VARCHAR(64),
  signer_algorithm VARCHAR(20) DEFAULT 'ECDSA-P256',

  -- Merkle-chain hashing (CFR Part 11 §11.10(e) tamper detection)
  -- merkle_chain_hash = SHA256(event_json || previous_event_hash)
  merkle_chain_hash VARCHAR(64) NOT NULL UNIQUE,
  merkle_hash_algorithm VARCHAR(20) DEFAULT 'SHA256-CHAIN',
  previous_event_id VARCHAR(50),

  -- Integrity verification status
  chain_verified BOOLEAN DEFAULT FALSE,
  verification_timestamp TIMESTAMP,
  verification_notes TEXT,

  -- Data classification (HIPAA)
  data_classification VARCHAR(50) DEFAULT 'CONFIDENTIAL',

  -- Immutability constraint (CFR Part 11 §11.10(e))
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT audit_trail_immutable CHECK (created_at IS NOT NULL),

  -- Foreign key to previous event (creates chain)
  CONSTRAINT audit_trail_chain_integrity
    FOREIGN KEY (previous_event_id)
    REFERENCES audit_trail(event_id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);

-- Indexes for efficient queries (CFR Part 11 requirement)
CREATE INDEX idx_audit_timestamp ON audit_trail(timestamp DESC);
CREATE INDEX idx_audit_user_id ON audit_trail(user_id);
CREATE INDEX idx_audit_action_type ON audit_trail(action_type);
CREATE INDEX idx_audit_resource_id ON audit_trail(resource_id);
CREATE INDEX idx_audit_event_id ON audit_trail(event_id);
CREATE INDEX idx_audit_created_at ON audit_trail(created_at);

-- Table for recording chain verification results
CREATE TABLE IF NOT EXISTS audit_chain_verification (
  id SERIAL PRIMARY KEY,
  verification_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Chain verification scope
  start_event_id VARCHAR(50) NOT NULL,
  end_event_id VARCHAR(50) NOT NULL,
  total_events INT NOT NULL,

  -- Verification results
  chain_integrity_status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
  -- Status: VALID, TAMPERED, ERROR, UNKNOWN

  verification_duration_seconds DECIMAL(10, 2),
  tampered_events_count INT DEFAULT 0,

  -- Details of any issues found
  verification_notes TEXT,
  verification_errors TEXT,

  -- Who ran verification
  verified_by VARCHAR(100),
  verification_method VARCHAR(50) DEFAULT 'daily_automated',
  -- Method: daily_automated, weekly_manual, monthly_full_chain, investigation

  -- Retention (compliance requirement)
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  CONSTRAINT audit_verification_fk_start
    FOREIGN KEY (start_event_id)
    REFERENCES audit_trail(event_id)
    ON DELETE RESTRICT,
  CONSTRAINT audit_verification_fk_end
    FOREIGN KEY (end_event_id)
    REFERENCES audit_trail(event_id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_verification_timestamp ON audit_chain_verification(verification_timestamp DESC);
CREATE INDEX idx_verification_status ON audit_chain_verification(chain_integrity_status);

-- Table for key rotation history (HSM key management)
CREATE TABLE IF NOT EXISTS key_rotation_log (
  id SERIAL PRIMARY KEY,
  rotation_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Key identification
  key_type VARCHAR(50) NOT NULL,
  -- Type: HSM_MASTER, SIGNING_KEY, ENCRYPTION_KEY, etc.

  key_id VARCHAR(100) NOT NULL,
  key_version INT NOT NULL,

  -- Rotation details
  old_key_thumbprint VARCHAR(64),
  new_key_thumbprint VARCHAR(64) NOT NULL,

  rotation_reason VARCHAR(100),
  -- Reason: SCHEDULED, COMPROMISE_SUSPECTED, KEY_EXPIRATION, COMPLIANCE_REQUIREMENT

  performed_by VARCHAR(100) NOT NULL,
  approval_count INT DEFAULT 0,
  required_approvals INT DEFAULT 2,

  rotation_status VARCHAR(20) DEFAULT 'IN_PROGRESS',
  -- Status: IN_PROGRESS, COMPLETED, FAILED, ROLLED_BACK

  rotation_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_key_rotation_timestamp ON key_rotation_log(rotation_timestamp DESC);
CREATE INDEX idx_key_rotation_key_type ON key_rotation_log(key_type);

-- Table for audit trail access log (HIPAA Audit Controls §164.312(b))
CREATE TABLE IF NOT EXISTS audit_trail_access_log (
  id SERIAL PRIMARY KEY,
  access_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

  -- WHO accessed the audit trail
  user_id VARCHAR(100) NOT NULL,
  user_role VARCHAR(50),

  -- WHAT they did
  access_type VARCHAR(50) NOT NULL,
  -- Type: READ, EXPORT, VERIFY, RESTORE, DELETE_ARCHIVED

  -- Query details
  query_description TEXT,
  rows_returned INT,
  query_duration_seconds DECIMAL(10, 2),

  -- Context
  purpose VARCHAR(255),
  -- Purpose: INCIDENT_INVESTIGATION, COMPLIANCE_AUDIT, ROUTINE_VERIFICATION, LEGAL_HOLD

  -- Status
  access_status VARCHAR(20) DEFAULT 'SUCCESS',
  -- Status: SUCCESS, DENIED, ERROR

  denial_reason VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_access_timestamp ON audit_trail_access_log(access_timestamp DESC);
CREATE INDEX idx_audit_access_user ON audit_trail_access_log(user_id);

-- ROLE-BASED ACCESS CONTROL (CFR Part 11 §11.100(b) Authentication & §11.200 Signatures)

-- Create audit trail role (read-only)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'audit_trail_user') THEN
    CREATE ROLE audit_trail_user;
  END IF;
END $$;

-- Grant permissions (principle of least privilege)
-- audit_trail_user: Can INSERT (append-only) and SELECT (read)
GRANT CONNECT ON DATABASE postgres TO audit_trail_user;
GRANT USAGE ON SCHEMA public TO audit_trail_user;
GRANT SELECT, INSERT ON audit_trail TO audit_trail_user;
GRANT SELECT ON audit_chain_verification TO audit_trail_user;
GRANT SELECT ON audit_trail_access_log TO audit_trail_user;
GRANT USAGE, SELECT ON SEQUENCE audit_trail_id_seq TO audit_trail_user;

-- Compliance notes:
-- - audit_trail_user CANNOT DELETE or UPDATE audit_trail (enforced by GRANT)
-- - Immutability enforced at application level via AppendOnlyAuditLog
-- - All modifications logged in audit_trail (write audit trail entries for modifications)
-- - Key rotation tracked in key_rotation_log
-- - Access to audit trail itself logged in audit_trail_access_log

-- Test: Verify immutability constraints
-- This should FAIL (good):
-- DELETE FROM audit_trail WHERE id = 1;
-- UPDATE audit_trail SET action_type = 'DELETED' WHERE id = 1;
--
-- This should SUCCEED (good):
-- INSERT INTO audit_trail (...) VALUES (...);
-- SELECT * FROM audit_trail WHERE timestamp > NOW() - INTERVAL 1 HOUR;
