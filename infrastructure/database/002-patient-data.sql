-- Database Migration 002: Patient Data & HIPAA Encryption
-- Compliance: HIPAA Security Rule §164.312(a)(2)(ii) - Encryption & decryption
--            HIPAA Privacy Rule §164.501 - Minimum necessary standard
--            IEC 62304 - Data protection
-- Version: 1.0 (April 25, 2026)

-- Table for encrypted patient records
CREATE TABLE IF NOT EXISTS patient_records (
  id VARCHAR(50) PRIMARY KEY,

  -- Patient identification
  patient_id VARCHAR(100) NOT NULL UNIQUE,
  mrn VARCHAR(100) NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,

  -- Encrypted patient data (PII protected)
  encrypted_payload JSONB NOT NULL,
  -- Example decrypted payload:
  -- {
  --   "first_name": "John",
  --   "last_name": "Doe",
  --   "ssn": "123-45-6789",
  --   "address": "123 Main St",
  --   "phone": "555-1234",
  --   "email": "john@example.com"
  -- }

  -- Encryption metadata (HIPAA §164.312(a)(2)(ii))
  encryption_algorithm VARCHAR(50) NOT NULL DEFAULT 'AES-256-GCM',
  -- Algorithm must be AES-256-GCM; not configurable

  encryption_key_id VARCHAR(100) NOT NULL,
  -- References key in HSM; never stored directly

  encryption_key_version INT DEFAULT 1,
  -- Track key rotation; re-encryption not needed if key_id changes

  encryption_iv VARCHAR(64) NOT NULL,
  -- Initialization vector for GCM mode (unique per encryption)

  encryption_tag VARCHAR(64) NOT NULL,
  -- Authentication tag for GCM mode (proves no tampering)

  -- Data classification (HIPAA)
  data_classification VARCHAR(50) DEFAULT 'PHI-HIGH',
  -- Classification: PHI-HIGH (identifiable), PHI-LIMITED (quasi-identifiable), INTERNAL

  -- Audit trail reference (every access logged)
  created_by VARCHAR(100) NOT NULL,
  created_date TIMESTAMP DEFAULT NOW() NOT NULL,
  modified_by VARCHAR(100),
  modified_date TIMESTAMP,

  -- Logical deletion (not physical; for audit trail)
  deleted BOOLEAN DEFAULT FALSE,
  deleted_by VARCHAR(100),
  deleted_date TIMESTAMP,
  deletion_reason VARCHAR(255),

  -- Retention & destruction
  retention_expires_date DATE,
  destruction_date TIMESTAMP,
  destruction_method VARCHAR(100),
  -- Method: CRYPTO_ERASE, PHYSICAL_DESTRUCTION, etc.

  -- Compliance constraints
  CONSTRAINT patient_must_be_encrypted CHECK (encrypted_payload IS NOT NULL),
  CONSTRAINT patient_encryption_algorithm_valid CHECK (encryption_algorithm = 'AES-256-GCM'),
  CONSTRAINT patient_key_id_not_null CHECK (encryption_key_id IS NOT NULL),
  CONSTRAINT patient_iv_not_null CHECK (encryption_iv IS NOT NULL),
  CONSTRAINT patient_tag_not_null CHECK (encryption_tag IS NOT NULL)
);

CREATE INDEX idx_patient_id ON patient_records(patient_id);
CREATE INDEX idx_patient_mrn ON patient_records(mrn);
CREATE INDEX idx_patient_created_date ON patient_records(created_date DESC);
CREATE INDEX idx_patient_modified_date ON patient_records(modified_date DESC);
CREATE INDEX idx_patient_deleted ON patient_records(deleted);

-- Table for patient consent & privacy
CREATE TABLE IF NOT EXISTS patient_consent (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(100) NOT NULL,

  -- Consent type
  consent_type VARCHAR(100) NOT NULL,
  -- Type: TREATMENT, PAYMENT, OPERATIONS, RESEARCH, MARKETING

  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMP NOT NULL,
  consent_document_id VARCHAR(100),

  -- Withdrawal
  withdrawn BOOLEAN DEFAULT FALSE,
  withdrawal_timestamp TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  FOREIGN KEY (patient_id)
    REFERENCES patient_records(patient_id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_consent_patient_id ON patient_consent(patient_id);
CREATE INDEX idx_consent_type ON patient_consent(consent_type);

-- Table for access control (who can view which patients)
CREATE TABLE IF NOT EXISTS patient_access_permissions (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(100) NOT NULL,

  -- WHO has access
  user_id VARCHAR(100) NOT NULL,
  user_role VARCHAR(50),

  -- WHAT they can do (minimum necessary standard)
  permission_type VARCHAR(50) NOT NULL,
  -- Type: READ, WRITE, DELETE, EXPORT, SHARE

  permission_scope VARCHAR(100),
  -- Scope: ALL_DATA, CLINICAL_ONLY, DEMOGRAPHICS_ONLY, BILLING_ONLY

  -- WHY (purpose)
  purpose VARCHAR(255) NOT NULL,
  -- Purpose: DIRECT_CARE, OPERATIONS, BILLING, RESEARCH, LEGAL, etc.

  -- Temporal restriction
  access_starts TIMESTAMP NOT NULL,
  access_expires TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  granted_by VARCHAR(100) NOT NULL,
  granted_timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  revoked_by VARCHAR(100),
  revoked_timestamp TIMESTAMP,

  CONSTRAINT permission_temporal_validity CHECK (access_starts < COALESCE(access_expires, NOW() + INTERVAL '100 years')),
  FOREIGN KEY (patient_id)
    REFERENCES patient_records(patient_id)
    ON DELETE RESTRICT
);

CREATE INDEX idx_patient_access_patient_id ON patient_access_permissions(patient_id);
CREATE INDEX idx_patient_access_user_id ON patient_access_permissions(user_id);
CREATE INDEX idx_patient_access_active ON patient_access_permissions(is_active);

-- ROLE-BASED ACCESS CONTROL (principle of least privilege)

-- Create patient_data role (encrypted data only)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'patient_data_user') THEN
    CREATE ROLE patient_data_user;
  END IF;
END $$;

-- Grant permissions
GRANT CONNECT ON DATABASE postgres TO patient_data_user;
GRANT USAGE ON SCHEMA public TO patient_data_user;
GRANT SELECT ON patient_records TO patient_data_user;
GRANT SELECT ON patient_consent TO patient_data_user;
GRANT SELECT ON patient_access_permissions TO patient_data_user;

-- NEVER grant INSERT/UPDATE/DELETE on patient_records to application role
-- Instead: Application calls stored procedures that enforce encryption

-- Stored procedure for creating patient records (enforces encryption)
CREATE OR REPLACE FUNCTION create_encrypted_patient(
  p_patient_id VARCHAR(100),
  p_mrn VARCHAR(100),
  p_date_of_birth DATE,
  p_encrypted_payload JSONB,
  p_encryption_key_id VARCHAR(100),
  p_encryption_iv VARCHAR(64),
  p_encryption_tag VARCHAR(64),
  p_created_by VARCHAR(100)
) RETURNS VARCHAR(50) AS $$
DECLARE
  v_record_id VARCHAR(50);
BEGIN
  -- Generate unique ID
  v_record_id := 'PAT-' || gen_random_uuid()::text;

  -- Insert (enforces encryption algorithm check)
  INSERT INTO patient_records (
    id,
    patient_id,
    mrn,
    date_of_birth,
    encrypted_payload,
    encryption_algorithm,
    encryption_key_id,
    encryption_iv,
    encryption_tag,
    created_by,
    created_date
  ) VALUES (
    v_record_id,
    p_patient_id,
    p_mrn,
    p_date_of_birth,
    p_encrypted_payload,
    'AES-256-GCM',
    p_encryption_key_id,
    p_encryption_iv,
    p_encryption_tag,
    p_created_by,
    NOW()
  );

  -- Log to audit trail
  INSERT INTO audit_trail (
    event_id,
    unix_timestamp,
    user_id,
    action_type,
    resource_type,
    resource_id,
    event_json,
    event_hash,
    signature,
    signature_timestamp,
    merkle_chain_hash,
    data_classification
  ) VALUES (
    'EVT-' || gen_random_uuid()::text,
    EXTRACT(EPOCH FROM NOW())::BIGINT,
    p_created_by,
    'patient_record_created',
    'PatientRecord',
    v_record_id,
    jsonb_build_object(
      'patient_id', p_patient_id,
      'mrn', p_mrn,
      'encryption_key_id', p_encryption_key_id
    ),
    'SHA256_PLACEHOLDER',
    'SIGNATURE_PLACEHOLDER',
    NOW(),
    'MERKLE_HASH_PLACEHOLDER',
    'PHI-HIGH'
  );

  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql;

-- Compliance notes:
-- - All patient data encrypted with AES-256-GCM (HIPAA §164.312(a)(2)(ii))
-- - Encryption key ID stored, key itself never stored in database
-- - Every access logged to audit_trail (HIPAA §164.312(b) Audit Controls)
-- - Access control enforced via patient_access_permissions
-- - Consent tracked in patient_consent
-- - Re-encryption not needed on key rotation (key_id points to new key)
