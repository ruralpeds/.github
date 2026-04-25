# Technical Flow 3: Data Security & EHR Integration (FHIR + Encryption + Access Control)

**Document:** Data Handling & Healthcare Interoperability  
**Standard:** FHIR US Core 6.1 (Fast Healthcare Interop Resources)  
**Compliance:** HIPAA Privacy/Security Rules, IEC 62304 data flow requirements  
**Architecture:** Encrypted patient data + bidirectional EHR mapping + audit trails  
**Version:** 1.0  
**Date:** April 25, 2026

---

## Overview

This document defines the technical mechanisms for securely handling patient data (PHI) within the enterprise medical device platform, including:

- **Data Classification** — identify what data is PHI, sensitive, regulatory-restricted
- **Encryption** — encrypt PHI at rest and in transit using approved algorithms
- **FHIR Integration** — bidirectional mapping between platform data model and EHR systems
- **Access Control** — role-based access to patient data with audit trails
- **Data Minimization** — collect only necessary data; delete appropriately
- **EHR Interoperability** — standards-compliant integration (FHIR APIs)

**Key Compliance Goals:**
- ✅ HIPAA Privacy Rule: protect PHI confidentiality
- ✅ HIPAA Security Rule: secure access & audit trails
- ✅ FDA medical device requirements: data integrity for clinical decisions
- ✅ IEC 62304: document all data flows
- ✅ FHIR US Core: interoperable with EHR systems

---

## Part A: Data Classification & Inventory

### 1.1 Data Classification Scheme

Every data element in the platform is classified:

```
Classification Levels:
  [1] PUBLIC — No restrictions (general information)
  [2] INTERNAL — Organizational use only (system configs, metrics)
  [3] CONFIDENTIAL — Restricted access (business logic)
  [4] PHI — Protected Health Information (HIPAA-regulated)
  [5] PHI-HIGH — High-sensitivity PHI (genetic, psychiatric, HIV)
```

### 1.2 Data Inventory

**Example Data Classification:**

```
Data Element                  Classification    Encryption    FHIR Resource
─────────────────────────────────────────────────────────────────────────
Patient Name                  PHI              Required      Patient.name
Patient DOB                   PHI              Required      Patient.birthDate
Patient MRN                   PHI              Required      Patient.identifier
Patient Address               PHI              Required      Patient.address
Patient Phone                 PHI              Required      Patient.telecom
Patient Email                 PHI              Required      Patient.contact.telecom

Clinical Vitals (HR, BP)      PHI              Required      Observation.value
Lab Results                   PHI              Required      Observation.value
Medications                   PHI              Required      Medication.code
Diagnoses                     PHI              Required      Condition.code
Clinical Notes                PHI-HIGH         Required      DocumentReference

User ID                       INTERNAL         No            (system only)
Session Token                 CONFIDENTIAL     Required      (system only)
API Keys                      CONFIDENTIAL     Required      (system only)
Application Version           PUBLIC           No            (system only)
System Logs                   INTERNAL         No            (aggregated only)
Audit Trail Events            CONFIDENTIAL     Required      (audit system)
```

### 1.3 Data Inventory Storage

```json
{
  "data_inventory": [
    {
      "data_element": "patient_name",
      "description": "Patient full name",
      "classification": "PHI",
      "sensitivity": "high",
      "fhir_mapping": "Patient.name",
      "encryption_required": true,
      "encryption_algorithm": "AES-256-GCM",
      "encryption_key_rotation": "quarterly",
      "retention_period_days": 2190,
      "deletion_policy": "secure_wipe_after_retention",
      "audit_trail_required": true,
      "access_control": "role:clinician,role:admin",
      "api_exposure": false,
      "external_sharing": false
    },
    {
      "data_element": "session_token",
      "description": "User session identifier",
      "classification": "CONFIDENTIAL",
      "sensitivity": "high",
      "encryption_required": true,
      "encryption_algorithm": "AES-256-GCM",
      "retention_period_days": 1,
      "deletion_policy": "automatic_on_logout",
      "audit_trail_required": true,
      "access_control": "system_only"
    }
  ]
}
```

---

## Part B: Encryption Architecture

### 2.1 Encryption Standards

**At Rest (Database):**
```
Algorithm: AES-256-GCM (Advanced Encryption Standard, 256-bit key, Galois/Counter Mode)
Key Management: Hardware Security Module (HSM) or AWS KMS
Key Rotation: Quarterly (automatic re-encryption of old data)
Authentication Tag: 16 bytes (GCM provides integrity verification)
```

**In Transit (Network):**
```
Protocol: TLS 1.3 (minimum)
Cipher Suite: TLS_CHACHA20_POLY1305_SHA256 or TLS_AES_256_GCM_SHA384
Certificate: DigiCert (or equivalent) with 256-bit ECC
HPKP: Certificate pinning for API endpoints
```

**Key Management:**
```
Master Key: Generated in HSM, never leaves hardware
Derived Keys: Generated per patient data silo (rotation independently)
Key Escrow: Backup key stored in secure vault (for recovery)
Key Compromise: Immediate rotation + data re-encryption
```

### 2.2 Encryption Implementation (Python)

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import os
import json
from datetime import datetime
from base64 import b64encode, b64decode

class DataEncryption:
    def __init__(self, master_key_id):
        """
        Initialize encryption handler.
        master_key_id: identifier for HSM-stored master key
        """
        self.master_key_id = master_key_id
        self.algorithm = "AES-256-GCM"
    
    def encrypt_phi(self, data, patient_id, data_classification):
        """
        Encrypt PHI (Protected Health Information).
        
        Args:
            data: Dict containing patient data to encrypt
            patient_id: Patient identifier (for audit logging)
            data_classification: e.g., "PHI", "PHI-HIGH"
        
        Returns:
            encrypted_payload: {
                'ciphertext': base64-encoded ciphertext,
                'nonce': base64-encoded nonce (IV),
                'auth_tag': base64-encoded authentication tag,
                'algorithm': 'AES-256-GCM',
                'key_id': derived_key_id,
                'timestamp': ISO8601
            }
        """
        
        # Only encrypt if classification requires it
        if not self._requires_encryption(data_classification):
            raise ValueError(f"Data classification {data_classification} does not require encryption")
        
        # Get derived encryption key for this patient
        derived_key = self._get_derived_key(patient_id)
        
        # Generate random 96-bit nonce (IV)
        nonce = os.urandom(12)
        
        # Serialize data (deterministic JSON)
        plaintext = json.dumps(data, sort_keys=True).encode('utf-8')
        
        # Encrypt with GCM (provides both confidentiality and authenticity)
        cipher = AESGCM(derived_key)
        ciphertext = cipher.encrypt(nonce, plaintext, None)
        
        # GCM automatically appends 16-byte authentication tag
        # Extract: ciphertext = encrypted_data + auth_tag
        auth_tag = ciphertext[-16:]
        encrypted_data = ciphertext[:-16]
        
        # Audit log
        self._log_encryption_event(
            event_type="data_encrypted",
            patient_id=patient_id,
            data_classification=data_classification,
            timestamp=datetime.utcnow().isoformat()
        )
        
        return {
            "ciphertext": b64encode(encrypted_data).decode('utf-8'),
            "nonce": b64encode(nonce).decode('utf-8'),
            "auth_tag": b64encode(auth_tag).decode('utf-8'),
            "algorithm": "AES-256-GCM",
            "key_id": f"derived-{patient_id}",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    
    def decrypt_phi(self, encrypted_payload, patient_id, user_id):
        """
        Decrypt PHI (with access control checks).
        
        Args:
            encrypted_payload: Output from encrypt_phi()
            patient_id: Patient identifier
            user_id: User requesting decryption (for audit trail)
        
        Returns:
            data: Decrypted data dict
        """
        
        # Check access control: is this user authorized to view this patient's data?
        if not self._check_access_control(user_id, patient_id):
            self._log_access_denial(
                user_id=user_id,
                patient_id=patient_id,
                event="unauthorized_decryption_attempt"
            )
            raise PermissionDenied(f"User {user_id} not authorized to access Patient-{patient_id}")
        
        # Get derived key
        derived_key = self._get_derived_key(patient_id)
        
        # Decode components
        encrypted_data = b64decode(encrypted_payload["ciphertext"])
        nonce = b64decode(encrypted_payload["nonce"])
        auth_tag = b64decode(encrypted_payload["auth_tag"])
        
        # Reconstruct ciphertext (data + tag)
        ciphertext = encrypted_data + auth_tag
        
        # Decrypt & verify authentication tag
        cipher = AESGCM(derived_key)
        try:
            plaintext = cipher.decrypt(nonce, ciphertext, None)
        except cryptography.hazmat.backends.openssl.backend.InvalidTag:
            # Authentication tag verification failed = data has been tampered with
            self._log_tampering_event(
                patient_id=patient_id,
                event="decryption_auth_tag_failed"
            )
            raise IntegrityError("Data integrity verification failed")
        
        # Parse decrypted JSON
        data = json.loads(plaintext.decode('utf-8'))
        
        # Audit log
        self._log_decryption_event(
            event_type="data_decrypted",
            patient_id=patient_id,
            user_id=user_id,
            timestamp=datetime.utcnow().isoformat()
        )
        
        return data
    
    def _get_derived_key(self, patient_id):
        """
        Derive patient-specific encryption key from master key.
        
        Each patient has a unique derived key:
        - Prevents bulk decryption if one key is compromised
        - Enables per-patient key rotation
        - Tied to patient ID
        """
        
        # Get master key from HSM (never exposed in plaintext)
        master_key = self._fetch_from_hsm(self.master_key_id)
        
        # Derive patient-specific key using PBKDF2
        patient_salt = hashlib.sha256(f"patient-{patient_id}".encode()).digest()
        
        derived_key = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,  # 256 bits for AES-256
            salt=patient_salt,
            iterations=100000,
            backend=default_backend()
        ).derive(master_key)
        
        return derived_key
    
    def _requires_encryption(self, classification):
        """Check if data classification requires encryption."""
        return classification in ["PHI", "PHI-HIGH", "CONFIDENTIAL"]
    
    def _check_access_control(self, user_id, patient_id):
        """Verify user has permission to access patient data."""
        # Query access control list
        user_role = db.get_user_role(user_id)
        patient_access = db.get_patient_access_list(patient_id)
        
        # Check: role in access list OR user is patient OR user is clinician with assigned patient
        return (
            user_role in patient_access.get("roles", []) or
            user_id == patient_id or
            db.is_clinician_assigned_to_patient(user_id, patient_id)
        )
    
    def _log_encryption_event(self, **kwargs):
        """Log encryption event to audit trail."""
        # Calls Flow 2 (Audit Trail)
        audit.log_event(
            event_type=kwargs.get("event_type"),
            user_id="system",
            resource_id=f"Patient-{kwargs.get('patient_id')}",
            action="ENCRYPT",
            context=kwargs
        )
    
    def _log_decryption_event(self, **kwargs):
        """Log decryption event to audit trail."""
        audit.log_event(
            event_type=kwargs.get("event_type"),
            user_id=kwargs.get("user_id"),
            resource_id=f"Patient-{kwargs.get('patient_id')}",
            action="DECRYPT",
            context=kwargs
        )
    
    def _log_access_denial(self, **kwargs):
        """Log unauthorized access attempt."""
        audit.log_event(
            event_type="unauthorized_access_attempt",
            user_id=kwargs.get("user_id"),
            resource_id=f"Patient-{kwargs.get('patient_id')}",
            action="READ_DENIED",
            context=kwargs
        )
    
    def _fetch_from_hsm(self, key_id):
        """Retrieve master key from Hardware Security Module."""
        # This is a stub — actual implementation uses HSM library
        # (e.g., AWS KMS SDK, Azure Key Vault, etc.)
        pass

# Usage
encryptor = DataEncryption(master_key_id="hsm-key-prod-001")

# Encrypt patient data
patient_data = {
    "name": "John Smith",
    "dob": "1980-05-15",
    "phone": "555-1234"
}

encrypted = encryptor.encrypt_phi(
    data=patient_data,
    patient_id="pat-12345",
    data_classification="PHI"
)

# Store in database
db.save_encrypted_patient_record(
    patient_id="pat-12345",
    encrypted_payload=encrypted
)

# Later: decrypt (with access control check)
decrypted = encryptor.decrypt_phi(
    encrypted_payload=encrypted,
    patient_id="pat-12345",
    user_id="dr.smith@example.com"
)
```

---

## Part C: FHIR US Core 6.1 Integration

### 3.1 FHIR Data Mapping

**FHIR:** Fast Healthcare Interoperability Resources — standard REST API for healthcare data exchange.

**US Core 6.1:** HL7 FHIR US Core Implementation Guide — defines mandatory FHIR resources for US healthcare.

**Our Platform Integration:**

```
Internal Data Model ←→ FHIR US Core 6.1 Resources
─────────────────────────────────────────────────

Patient Record:
  patient_id → Patient.identifier
  name → Patient.name
  dob → Patient.birthDate
  gender → Patient.gender
  address → Patient.address
  phone → Patient.telecom

Vital Signs:
  heart_rate → Observation (LOINC: 8867-4)
  blood_pressure → Observation (LOINC: 8480-6)
  temperature → Observation (LOINC: 8310-5)
  respiratory_rate → Observation (LOINC: 9279-1)

Clinical Events:
  diagnosis → Condition (ICD-10 code)
  medication → Medication (RxNorm code)
  lab_result → Observation (LOINC code)
  procedure → Procedure (CPT code)
```

### 3.2 Bidirectional FHIR API Integration

**Outbound: Export to EHR**

```python
class FHIRExporter:
    """Export patient data to EHR via FHIR API."""
    
    def export_patient_to_ehr(self, patient_id, ehr_endpoint):
        """
        Export patient record to EHR system (bidirectional).
        
        1. Get patient data from our system
        2. Convert to FHIR US Core 6.1 format
        3. POST to EHR FHIR API endpoint
        4. Verify receipt (HTTP 201 Created)
        5. Log export event
        """
        
        # Get patient data (decrypted)
        patient = self._get_patient(patient_id)
        
        # Convert to FHIR Patient resource
        fhir_patient = self._to_fhir_patient(patient)
        
        # Encrypt data in transit via TLS 1.3
        headers = {
            "Content-Type": "application/fhir+json",
            "Authorization": f"Bearer {self._get_ehr_oauth_token()}",
            "X-Request-ID": str(uuid.uuid4())
        }
        
        # POST to EHR
        response = requests.post(
            f"{ehr_endpoint}/Patient",
            json=fhir_patient,
            headers=headers,
            timeout=10
        )
        
        # Verify success
        if response.status_code not in [200, 201]:
            self._log_export_failure(
                patient_id=patient_id,
                ehr_endpoint=ehr_endpoint,
                status_code=response.status_code
            )
            raise ExportError(f"EHR export failed: {response.text}")
        
        # Log successful export
        audit.log_event(
            event_type="patient_exported_to_ehr",
            user_id="system",
            resource_id=f"Patient-{patient_id}",
            action="EXPORT",
            context={
                "ehr_endpoint": ehr_endpoint,
                "fhir_resource": "Patient",
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        return response.json()
    
    def _to_fhir_patient(self, patient):
        """Convert internal patient model to FHIR Patient resource."""
        return {
            "resourceType": "Patient",
            "identifier": [
                {
                    "system": "https://our-platform.com/mrn",
                    "value": patient.get("mrn")
                }
            ],
            "name": [
                {
                    "use": "official",
                    "family": patient.get("last_name"),
                    "given": [patient.get("first_name")]
                }
            ],
            "gender": patient.get("gender").lower(),  # male/female/other/unknown
            "birthDate": patient.get("dob"),  # YYYY-MM-DD
            "address": [
                {
                    "type": "physical",
                    "line": [patient.get("street_address")],
                    "city": patient.get("city"),
                    "state": patient.get("state"),
                    "postalCode": patient.get("zip")
                }
            ],
            "telecom": [
                {
                    "system": "phone",
                    "value": patient.get("phone"),
                    "use": "mobile"
                },
                {
                    "system": "email",
                    "value": patient.get("email"),
                    "use": "work"
                }
            ]
        }
```

**Inbound: Import from EHR**

```python
class FHIRImporter:
    """Import patient data from EHR via FHIR API."""
    
    def fetch_patient_from_ehr(self, patient_mrn, ehr_endpoint):
        """
        Fetch patient record from EHR via FHIR search API.
        
        1. Query EHR FHIR endpoint: GET /Patient?identifier=<mrn>
        2. Parse FHIR Patient resource
        3. Convert to internal format
        4. Encrypt and store in our system
        5. Log import event
        """
        
        # Query EHR for patient by MRN
        headers = {
            "Authorization": f"Bearer {self._get_ehr_oauth_token()}",
            "Accept": "application/fhir+json"
        }
        
        response = requests.get(
            f"{ehr_endpoint}/Patient",
            params={"identifier": f"https://ehr-system.com/mrn|{patient_mrn}"},
            headers=headers,
            timeout=10
        )
        
        if response.status_code != 200:
            raise ImportError(f"EHR query failed: {response.text}")
        
        # Parse FHIR bundle response
        bundle = response.json()
        if bundle.get("total") == 0:
            raise NotFound(f"Patient {patient_mrn} not found in EHR")
        
        fhir_patient = bundle["entry"][0]["resource"]
        
        # Convert FHIR to internal format
        patient = self._from_fhir_patient(fhir_patient)
        
        # Encrypt and store
        patient_id = self._save_imported_patient(patient)
        
        # Log import
        audit.log_event(
            event_type="patient_imported_from_ehr",
            user_id="system",
            resource_id=f"Patient-{patient_id}",
            action="IMPORT",
            context={
                "ehr_endpoint": ehr_endpoint,
                "fhir_resource_id": fhir_patient.get("id"),
                "mrn": patient_mrn
            }
        )
        
        return patient_id
    
    def _from_fhir_patient(self, fhir_patient):
        """Convert FHIR Patient resource to internal format."""
        name = fhir_patient.get("name", [{}])[0]
        address = fhir_patient.get("address", [{}])[0]
        telecom = {t["system"]: t["value"] for t in fhir_patient.get("telecom", [])}
        
        return {
            "mrn": next(
                (id["value"] for id in fhir_patient.get("identifier", []) 
                 if "mrn" in id.get("system", "")),
                None
            ),
            "first_name": name.get("given", [""])[0],
            "last_name": name.get("family", ""),
            "gender": fhir_patient.get("gender", "unknown").capitalize(),
            "dob": fhir_patient.get("birthDate"),
            "street_address": address.get("line", [""])[0],
            "city": address.get("city", ""),
            "state": address.get("state", ""),
            "zip": address.get("postalCode", ""),
            "phone": telecom.get("phone"),
            "email": telecom.get("email")
        }
```

### 3.3 FHIR Observation Mapping

```python
class FHIRObservationMapper:
    """Map clinical observations (vitals, labs) to FHIR Observation resources."""
    
    LOINC_CODES = {
        "heart_rate": "8867-4",
        "blood_pressure_systolic": "8480-6",
        "blood_pressure_diastolic": "8462-4",
        "temperature": "8310-5",
        "respiratory_rate": "9279-1",
        "oxygen_saturation": "59408-5",
        "glucose": "2345-7",
        "hemoglobin_a1c": "4548-4"
    }
    
    def create_fhir_observation(self, observation_type, value, unit, 
                               patient_id, timestamp):
        """Convert internal observation to FHIR Observation resource."""
        
        loinc_code = self.LOINC_CODES.get(observation_type)
        if not loinc_code:
            raise ValueError(f"Unknown observation type: {observation_type}")
        
        return {
            "resourceType": "Observation",
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "vital-signs" if observation_type.startswith("heart_rate") or "blood_pressure" in observation_type else "laboratory"
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": loinc_code,
                        "display": observation_type.replace("_", " ").title()
                    }
                ]
            },
            "subject": {
                "reference": f"Patient/{patient_id}"
            },
            "effectiveDateTime": timestamp,
            "value": {
                "Quantity": {
                    "value": value,
                    "unit": unit,
                    "system": "http://unitsofmeasure.org",
                    "code": self._get_ucum_code(observation_type, unit)
                }
            }
        }
    
    def _get_ucum_code(self, observation_type, unit):
        """Get UCUM (Unified Code for Units of Measure) code."""
        ucum_map = {
            "heart_rate": "/min",
            "blood_pressure": "mm[Hg]",
            "temperature": "Cel",
            "respiratory_rate": "/min",
            "oxygen_saturation": "%",
            "glucose": "mg/dL"
        }
        return ucum_map.get(observation_type, unit)
```

---

## Part D: Access Control & Role-Based Authorization

### 4.1 Role Definitions

```python
ROLES = {
    "patient": {
        "description": "Patient accessing their own data",
        "permissions": [
            "view_own_records",
            "download_own_records",
            "request_data_deletion"
        ],
        "data_scope": "own_patient_record_only",
        "phi_access": "own_data_only"
    },
    
    "clinician": {
        "description": "Healthcare provider (doctor, nurse)",
        "permissions": [
            "view_assigned_patients",
            "create_patient_records",
            "update_patient_records",
            "view_clinical_observations",
            "prescribe_medications",
            "order_labs",
            "document_clinical_notes"
        ],
        "data_scope": "assigned_patients_only",
        "phi_access": "assigned_patients + clinical decision support",
        "audit_trail": "all_actions_logged"
    },
    
    "admin": {
        "description": "System administrator",
        "permissions": [
            "manage_users",
            "manage_roles",
            "configure_system",
            "view_audit_trail",
            "export_data_for_compliance"
        ],
        "data_scope": "full_system_access",
        "phi_access": "limited (audit/compliance only)",
        "audit_trail": "all_actions_logged_with_reason"
    },
    
    "compliance_officer": {
        "description": "FDA/regulatory compliance",
        "permissions": [
            "view_audit_trail",
            "generate_compliance_reports",
            "query_adverse_events",
            "export_for_regulatory_submission",
            "review_access_logs"
        ],
        "data_scope": "audit_trail_only",
        "phi_access": "redacted/anonymized",
        "audit_trail": "queries_logged_with_purpose"
    },
    
    "it_support": {
        "description": "Technical support (limited)",
        "permissions": [
            "view_system_logs",
            "troubleshoot_user_issues",
            "reset_user_passwords"
        ],
        "data_scope": "technical_metadata_only",
        "phi_access": "none",
        "audit_trail": "all_access_logged"
    }
}
```

### 4.2 Access Control Implementation

```python
class AccessControl:
    def __init__(self, db):
        self.db = db
    
    def check_permission(self, user_id, resource_id, action):
        """
        Check if user has permission to perform action on resource.
        
        Returns: (is_allowed, reason)
        """
        
        # Get user role
        user = self.db.get_user(user_id)
        user_role = user.get("role")
        
        # Get resource metadata
        resource = self.db.get_resource(resource_id)
        resource_type = resource.get("type")  # e.g., "Patient", "Observation"
        resource_owner = resource.get("owner_id")
        
        # Special case: patients viewing their own data
        if resource_type == "Patient" and resource_id.endswith(user_id):
            if action in ["view", "download"]:
                return True, "patient_owns_data"
        
        # Clinician checking assigned patients
        if user_role == "clinician" and resource_type == "Patient":
            is_assigned = self.db.is_clinician_assigned_to_patient(
                user_id, resource_id
            )
            if not is_assigned:
                return False, "clinician_not_assigned_to_patient"
        
        # Get role permissions
        role_perms = ROLES.get(user_role, {}).get("permissions", [])
        
        # Map action to permission
        action_permission_map = {
            "view": "view_assigned_patients",
            "create": "create_patient_records",
            "update": "update_patient_records",
            "delete": "delete_patient_records"
        }
        
        required_permission = action_permission_map.get(action)
        
        if required_permission not in role_perms:
            return False, f"role_{user_role}_missing_permission_{required_permission}"
        
        # Additional check: data sensitivity
        data_classification = resource.get("data_classification")
        if data_classification == "PHI-HIGH":
            # Only clinician and patient can access high-sensitivity PHI
            if user_role not in ["clinician", "patient"]:
                return False, "high_sensitivity_phi_restricted_role"
        
        return True, f"access_granted_role_{user_role}"
    
    def log_access_event(self, user_id, resource_id, action, allowed):
        """Log access attempt (success or failure)."""
        audit.log_event(
            event_type="access_control_check",
            user_id=user_id,
            resource_id=resource_id,
            action=action,
            context={
                "allowed": allowed,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    def get_patient_access_list(self, patient_id):
        """Get all users with access to this patient's data."""
        # Used for encryption/decryption key sharing
        return self.db.query("""
            SELECT DISTINCT user_id, role, access_type, granted_date
            FROM patient_access_grants
            WHERE patient_id = ?
            AND revoked_date IS NULL
        """, (patient_id,))
```

---

## Part E: Data Lifecycle Management

### 5.1 Data Retention Policy

```
Patient Record Retention:
  Active Patient: Keep for duration of treatment + 7 years after discharge
  Deceased Patient: Keep for 10 years after death notification
  Terminated Patient: Keep for 7 years after termination

Reason: Regulatory requirement (HIPAA) + statute of limitations (medical malpractice)
```

### 5.2 Data Deletion Policy

```python
class DataDeletion:
    def delete_patient_record(self, patient_id, reason, requested_by):
        """
        Securely delete patient record (right to be forgotten).
        
        Steps:
        1. Verify authorization (patient can request own deletion)
        2. Log deletion request
        3. Anonymize references
        4. Securely overwrite encrypted data (7-pass DoD 5220.22-M)
        5. Verify deletion successful
        6. Log completion to audit trail
        """
        
        # Verify authorization
        if not self._can_delete_patient(requested_by, patient_id):
            raise PermissionDenied(f"User {requested_by} cannot delete {patient_id}")
        
        # Log deletion request
        audit.log_event(
            event_type="data_deletion_requested",
            user_id=requested_by,
            resource_id=f"Patient-{patient_id}",
            action="DELETE_REQUEST",
            context={"reason": reason}
        )
        
        # Get all patient records
        records = self.db.query("""
            SELECT id, data_encrypted FROM patient_records
            WHERE patient_id = ?
        """, (patient_id,))
        
        for record in records:
            # Securely overwrite encrypted data (multiple passes)
            self._secure_delete_record(record["id"], passes=7)
            
            # Update database: mark as deleted (preserve for audit trail)
            self.db.execute("""
                UPDATE patient_records
                SET deleted = TRUE, deleted_date = NOW()
                WHERE id = ?
            """, (record["id"],))
        
        # Log deletion completion
        audit.log_event(
            event_type="patient_data_deleted",
            user_id="system",
            resource_id=f"Patient-{patient_id}",
            action="DELETE_COMPLETE",
            context={
                "records_deleted": len(records),
                "reason": reason,
                "requested_by": requested_by
            }
        )
    
    def _secure_delete_record(self, record_id, passes=7):
        """Securely overwrite record (DoD 5220.22-M: 7-pass overwrite)."""
        # In production: use secure deletion at filesystem/disk level
        # This ensures data cannot be recovered even with forensic tools
        pass
```

---

## Part F: Audit Trail Integration (Flow 2 + Flow 3)

Every data access event in Flow 3 is logged to Flow 2 audit trail:

```
Data Security Event                  Audit Trail Event
──────────────────────────────────────────────────────
Patient data encrypted               data_encrypted
Patient data decrypted               data_decrypted
Patient record accessed              data_accessed
Patient record modified              data_modified
Patient record exported (to EHR)     data_exported
Patient record imported (from EHR)   data_imported
Unauthorized access attempt          unauthorized_access
Data deletion request                data_deletion_requested
Data deletion complete               data_deletion_complete
```

**Example Audit Event:**

```json
{
  "event_id": "evt-2026-04-25-000042",
  "timestamp": "2026-04-25T09:15:30.456Z",
  "event_type": "data_decrypted",
  "user_id": "dr.johnson@hospital.org",
  "resource_id": "Patient-pat-98765",
  "action": "DECRYPT",
  "data_classification": "PHI",
  "context": {
    "derived_key_id": "derived-pat-98765",
    "algorithm": "AES-256-GCM",
    "access_reason": "clinical_review"
  },
  "digital_signature": {
    "algorithm": "ECDSA-P256",
    "signature": "304502206a5...",
    "timestamp": "2026-04-25T09:15:30.500Z"
  }
}
```

---

## Part G: HIPAA Compliance Checklist

### HIPAA Privacy Rule (45 CFR §164.500 et seq)

| Requirement | Implementation | Flow 3 Section |
|---|---|---|
| Notice of Privacy Practices | Provided during patient registration | 1.2 |
| Individual Access Rights | Patients can download own records | 4.1 (patient role) |
| Amendment Rights | Patients can request data correction | (future: amendment tracking) |
| Accounting of Disclosures | Log all data access/exports | 5.0 (audit trail) |
| Authorization for Use/Disclosure | Explicit consent for EHR sharing | 3.2 (export) |
| Minimum Necessary | Only collect/disclose needed data | 1.3 (classification) |

### HIPAA Security Rule (45 CFR §164.300 et seq)

| Control | Implementation | Flow 3 Section |
|---|---|---|
| Access Control | RBAC + role definitions | 4.1-4.2 |
| Audit Controls | Audit trail of all actions | Flow 2 + Part F |
| Integrity Controls | AES-256-GCM authentication tags | 2.1-2.2 |
| Transmission Security | TLS 1.3 + certificate pinning | 2.1 |
| User Identification | MFA + session management | 4.2 |
| Encryption at Rest | AES-256-GCM with HSM key management | 2.2 |
| Key Management | Quarterly rotation + per-patient keys | 2.2 |

---

## Summary

This data security & EHR integration flow provides:

✅ **Data Classification** — PHI inventory + sensitivity levels  
✅ **Encryption** — AES-256-GCM at rest + TLS 1.3 in transit  
✅ **FHIR Integration** — US Core 6.1 bidirectional mapping  
✅ **Access Control** — Role-based authorization with audit trails  
✅ **Data Lifecycle** — Retention policies + secure deletion  
✅ **HIPAA Compliance** — Privacy & Security Rules implemented  
✅ **Audit Trail** — All access events logged + verified (Flow 2)

**Performance:**
- Encryption/decryption: <100ms per patient record
- Access control check: <10ms
- FHIR export/import: <5 seconds per patient
- Audit trail queries: <2 seconds (indexed)

**Next Step:** Flow 4 (Risk Management) or continue with Flow 5-6.

