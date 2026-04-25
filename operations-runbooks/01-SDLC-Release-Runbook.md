# Operational Runbook 1: SDLC Release Process

**Purpose:** Step-by-step procedures for releasing software through SDLC gates  
**Scope:** Feature releases, patch releases, hotfixes  
**Audience:** Engineering team, QA, release manager, compliance  
**Version:** 1.0  
**Last Updated:** April 25, 2026

---

## Quick Reference: Release Types

| Release Type | Trigger | Timeline | Gates | Example |
|---|---|---|---|---|
| **Feature Release** | New functionality | 2-4 weeks | All 8 gates | Add FHIR patient sync |
| **Patch Release** | Bug fix | 1 week | Abbreviated (4 gates) | Fix session timeout |
| **Hotfix** | Critical bug in production | 24 hours | Expedited (2 gates) | Auth bypass vulnerability |
| **Maintenance** | Performance/refactoring | 1 week | Standard (6 gates) | Optimize database queries |

---

## Phase 1: Planning & Requirements (1-2 Days)

### Step 1.1: Create Feature Request

```bash
# 1. Create GitHub issue
gh issue create \
  --title "Feature: Patient FHIR synchronization" \
  --body "Allow bidirectional sync of patient records with EHR via FHIR API" \
  --label "enhancement,fhir,high-priority"

# 2. Get issue number (e.g., #1234)
ISSUE_NUMBER=1234
```

### Step 1.2: Write Software Requirements Specification (SRS)

**File:** `docs/requirements/REQ-FHIR-001.md`

```markdown
# Software Requirements Specification: FHIR Patient Sync

## Functional Requirements
- REQ-001: System shall sync patient demographics from EHR every 24 hours
- REQ-002: System shall validate FHIR Patient resource against US Core 6.1
- REQ-003: System shall log sync success/failure to audit trail
- REQ-004: System shall handle network timeout gracefully (retry 3x)

## Non-Functional Requirements
- Performance: Complete patient sync in <5 seconds per patient
- Reliability: 99.9% uptime during sync operations
- Security: All patient data encrypted in transit (TLS 1.3)

## Regulatory Requirements
- Compliance: HIPAA Privacy Rule (§164.501)
- Compliance: IEC 62304 §5.2 (software requirements)
- Audit Trail: All sync events logged

## Acceptance Criteria
- All tests passing (unit, integration, system)
- Traceability matrix complete (req → design → code)
- Code review approved by ≥2 engineers
- Security review approved
- Clinical team validation complete
```

### Step 1.3: Risk Assessment (Pre-Design)

```bash
# Create risk assessment document
cat > docs/risk/RISK-FHIR-001.md << 'EOF'
# Risk Assessment: FHIR Patient Sync

## Potential Hazards
- H-001: Incorrect patient mapping → wrong data displayed
- H-002: Network failure during sync → incomplete patient record
- H-003: FHIR parsing error → system crash

## Risk Controls (Design Phase will implement)
- RC-001: Validate patient MRN against EHR before sync
- RC-002: Implement retry logic with exponential backoff
- RC-003: Add error handling for malformed FHIR resources
EOF
```

### Step 1.4: Design Input Approval Gate ✓

**Checklist:**
- ☑ SRS written & reviewed (2+ engineers)
- ☑ Risk assessment completed
- ☑ Traceability matrix initiated
- ☑ Security requirements identified

**Command:**
```bash
# Mark gate as passed in issue
gh issue comment $ISSUE_NUMBER \
  --body "## ✅ DESIGN INPUT GATE APPROVED
- SRS: docs/requirements/REQ-FHIR-001.md
- Risk: docs/risk/RISK-FHIR-001.md
- Approved by: Timothy H. (Compliance Officer)
- Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

---

## Phase 2: Design (3-5 Days)

### Step 2.1: Create Architectural Design Document

**File:** `docs/design/DES-FHIR-001.md`

```markdown
# Design Document: FHIR Patient Sync

## Architecture Diagram
```
┌─────────────────────────────────────────┐
│  Our Platform                           │
├─────────────────────────────────────────┤
│ ┌──────────────┐  ┌────────────────┐    │
│ │ FHIR Importer│──│ Patient DB     │    │
│ │ (REST Client)│  │ (Encrypted)    │    │
│ └──────┬───────┘  └────────────────┘    │
│        │                                │
│        │ TLS 1.3                        │
│        │ FHIR US Core 6.1               │
│        └───────────────┬────────────────┤
│                        │                │
└────────────────────────┼────────────────┘
                         │
                ┌────────▼────────┐
                │   EHR System    │
                │  (Epic/Cerner)  │
                └─────────────────┘
```

## Module Design
- Module 1: FHIRImporter (REST client, error handling)
- Module 2: PatientMapper (FHIR → internal model)
- Module 3: SyncScheduler (24h scheduled job)
- Module 4: AuditLogger (log all sync events)

## Data Structures
```python
class PatientFHIR:
    mrn: str  # Medical Record Number (unique identifier)
    name: str
    dob: datetime
    gender: str
    address: str
    phone: str
    fhir_resource_id: str  # Reference to EHR
```

## Error Handling
- Network timeout: Retry 3x with exponential backoff (1s, 2s, 4s)
- Invalid FHIR: Log error, skip patient, continue
- Authentication failure: Alert compliance officer

## Security
- Encryption: AES-256-GCM for stored patient data
- Transport: TLS 1.3 for API calls
- Access: Only Sync Service can call this API
```

### Step 2.2: Design Review (Peer Review)

```bash
# Create design review comment in issue
gh issue comment $ISSUE_NUMBER \
  --body "## Design Review Checklist
- ☑ Architecture diagram clear
- ☑ Error handling specified
- ☑ Security controls identified
- ☑ All requirements allocated to modules

Reviewed by: Engineer1, Engineer2
Approved: $(date -u +%Y-%m-%d)"
```

### Step 2.3: Design Approval Gate ✓

```bash
gh issue comment $ISSUE_NUMBER \
  --body "## ✅ DESIGN APPROVAL GATE PASSED
- Design: docs/design/DES-FHIR-001.md
- Reviewed by: CTO
- All requirements → design modules
- All risk controls → design specifications
- Approved: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

---

## Phase 3: Implementation (5-10 Days)

### Step 3.1: Create Feature Branch

```bash
# Create branch for feature
git checkout -b feature/fhir-patient-sync

# Create directory structure
mkdir -p src/integrations/fhir
mkdir -p tests/integration/fhir
mkdir -p docs/api/fhir
```

### Step 3.2: Implement Code

**File:** `src/integrations/fhir/importer.py`

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import requests
from typing import Dict, List
from datetime import datetime

class FHIRPatientImporter:
    """Import patient data from EHR via FHIR API."""
    
    def __init__(self, ehr_endpoint: str, oauth_token: str):
        self.ehr_endpoint = ehr_endpoint
        self.oauth_token = oauth_token
        self.encryptor = DataEncryption()
        self.audit = AuditTrail()
    
    def sync_patient(self, patient_mrn: str) -> Dict:
        """
        Sync single patient from EHR.
        Requirement: REQ-001, REQ-002, REQ-003
        """
        
        try:
            # REQ-002: Fetch & validate FHIR
            fhir_patient = self._fetch_fhir_patient(patient_mrn)
            self._validate_fhir_us_core(fhir_patient)
            
            # Convert to internal format
            patient = self._fhir_to_internal(fhir_patient)
            
            # Encrypt patient data (security requirement)
            encrypted = self.encryptor.encrypt_phi(
                patient, 
                patient_id=patient_mrn,
                data_classification="PHI"
            )
            
            # Store in database
            db.save_patient(patient_mrn, encrypted)
            
            # REQ-003: Log to audit trail
            self.audit.log_event(
                event_type="patient_synced",
                user_id="system",
                resource_id=f"Patient-{patient_mrn}",
                action="SYNC",
                context={"fhir_resource_id": fhir_patient["id"]}
            )
            
            return {"status": "success", "patient_mrn": patient_mrn}
        
        except Exception as e:
            # REQ-003: Log failure
            self.audit.log_event(
                event_type="patient_sync_failed",
                user_id="system",
                resource_id=f"Patient-{patient_mrn}",
                action="SYNC_FAILED",
                context={"error": str(e)}
            )
            raise
    
    def _fetch_fhir_patient(self, patient_mrn: str, retries: int = 3) -> Dict:
        """REQ-004: Handle network timeout with retries."""
        
        for attempt in range(retries):
            try:
                response = requests.get(
                    f"{self.ehr_endpoint}/Patient",
                    params={"identifier": f"https://mrn|{patient_mrn}"},
                    headers={"Authorization": f"Bearer {self.oauth_token}"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    bundle = response.json()
                    if bundle.get("total") > 0:
                        return bundle["entry"][0]["resource"]
                    raise NotFound(f"Patient {patient_mrn} not found")
                
            except requests.Timeout:
                wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                if attempt < retries - 1:
                    time.sleep(wait_time)
                    continue
                raise
        
        raise TimeoutError(f"Failed after {retries} retries")
    
    def _validate_fhir_us_core(self, fhir_patient: Dict) -> bool:
        """REQ-002: Validate FHIR US Core 6.1 compliance."""
        
        required_fields = ["name", "birthDate", "gender", "address"]
        
        for field in required_fields:
            if not fhir_patient.get(field):
                raise ValidationError(f"Missing required FHIR field: {field}")
        
        return True
```

### Step 3.3: Write Unit Tests (≥80% Coverage)

**File:** `tests/unit/fhir/test_importer.py`

```python
import pytest
from unittest.mock import Mock, patch

class TestFHIRPatientImporter:
    
    def test_sync_patient_success(self):
        """Test successful patient sync."""
        importer = FHIRPatientImporter("https://ehr.example.com", "token123")
        
        # Mock EHR response
        mock_response = {
            "resourceType": "Patient",
            "id": "pat-123",
            "name": [{"given": ["John"], "family": "Smith"}],
            "birthDate": "1980-05-15",
            "gender": "male",
            "address": [{"city": "Boston", "state": "MA"}]
        }
        
        with patch.object(importer, '_fetch_fhir_patient', return_value=mock_response):
            result = importer.sync_patient("12345")
            assert result["status"] == "success"
    
    def test_sync_patient_network_retry(self):
        """Test network retry on timeout."""
        importer = FHIRPatientImporter("https://ehr.example.com", "token123")
        
        # Mock timeout, then success
        with patch('requests.get') as mock_get:
            mock_get.side_effect = [
                requests.Timeout(),  # Attempt 1: timeout
                Mock(status_code=200, json=lambda: {  # Attempt 2: success
                    "entry": [{"resource": {...}}]
                })
            ]
            
            result = importer.sync_patient("12345")
            assert result["status"] == "success"
            assert mock_get.call_count == 2  # Verify retry happened
    
    def test_sync_patient_validation_error(self):
        """Test validation of missing FHIR fields."""
        importer = FHIRPatientImporter("https://ehr.example.com", "token123")
        
        invalid_fhir = {
            "resourceType": "Patient",
            # Missing required fields: name, birthDate, gender, address
        }
        
        with pytest.raises(ValidationError):
            importer.sync_patient("12345")
```

### Step 3.4: Code Review (Pull Request)

```bash
# Push feature branch
git add -A
git commit -m "feat: implement FHIR patient synchronization

- FHIRPatientImporter class for EHR integration
- Bidirectional mapping: FHIR ↔ internal format
- Network retry logic with exponential backoff
- Encryption: AES-256-GCM for PHI at rest
- Audit trail logging: all sync events
- Unit tests: 87% coverage
- Requirements: REQ-001, REQ-002, REQ-003, REQ-004 implemented"

git push -u origin feature/fhir-patient-sync

# Create pull request
gh pr create \
  --title "feat: FHIR patient synchronization" \
  --body "Implements bidirectional FHIR sync per REQ-FHIR-001"
```

### Step 3.5: Implementation Approval Gate ✓

**PR Merge Checklist:**
- ☑ Code reviewed & approved (≥1 reviewer)
- ☑ Unit tests passing (87% coverage)
- ☑ Static analysis clean (no high vulns)
- ☑ Traceability matrix updated
- ☑ All 4 requirements implemented

```bash
# Merge PR
gh pr merge --squash
```

---

## Phase 4: Verification & Validation (3-5 Days)

### Step 4.1: Run Integration Tests

```bash
# Run full test suite
npm test -- --coverage

# Expected: All tests pass, coverage ≥80%
# Output: PASSED (245 unit tests, 87% coverage)
```

### Step 4.2: System Testing

**Test Case 1: Happy Path (Patient Exists in EHR)**

```
Given: EHR has patient MRN=12345
When: System runs sync
Then: Patient data in DB matches EHR
And: Audit trail logged: patient_synced event
```

**Test Case 2: Error Handling (Network Timeout)**

```
Given: EHR endpoint times out
When: System retries 3x with backoff
Then: Patient eventually synced (after 2nd/3rd retry)
And: Audit trail logged: retry attempts
```

### Step 4.3: Compliance Verification

```bash
# Run traceability check
./scripts/verify_traceability.sh --version v1.1.0

# Output: Traceability Matrix
# ┌─────────┬───────────┬────────┬──────────┐
# │ Req ID  │ Design    │ Code   │ Test     │
# ├─────────┼───────────┼────────┼──────────┤
# │ REQ-001 │ DES-1.1.1 │ impl.py│ TC-1.1.1 │ ✓
# │ REQ-002 │ DES-1.2.1 │ valid. │ TC-1.2.1 │ ✓
# │ REQ-003 │ DES-1.3.1 │ audit. │ TC-1.3.1 │ ✓
# │ REQ-004 │ DES-1.4.1 │ retry. │ TC-1.4.1 │ ✓
# └─────────┴───────────┴────────┴──────────┘
# Status: 100% COMPLETE ✓
```

### Step 4.4: V&V Approval Gate ✓

```bash
# Create V&V report
cat > docs/testing/TEST-REPORT-v1.1.0.md << 'EOF'
# Test Report: v1.1.0 (FHIR Patient Sync)

## Test Results Summary
- Unit Tests: 245/245 PASSED (87% coverage)
- Integration Tests: 32/32 PASSED
- System Tests: 8/8 PASSED
- Security Tests: 5/5 PASSED

## Traceability
- Requirements covered: 4/4 (100%)
- Design modules tested: 4/4 (100%)
- Risk controls verified: 5/5 (100%)

## Approval
- QA Lead: APPROVED
- Clinical Officer: APPROVED
- Compliance Officer: APPROVED
EOF

# Mark gate as passed
gh pr comment --body "## ✅ V&V APPROVAL GATE PASSED
- All tests passing (245 unit, 32 integration, 8 system)
- Coverage: 87% (target: 80%)
- Traceability: 100% (4/4 requirements)
- Risk controls: 5/5 verified
- Approved: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

---

## Phase 5: Release (1-2 Days)

### Step 5.1: Create Release Tag

```bash
# Tag release (semantic versioning)
git tag -a v1.1.0 \
  -m "Release v1.1.0: FHIR Patient Synchronization

- Feature: Bidirectional FHIR sync with EHR
- Improvements: Network retry, encryption
- Tests: 245 unit tests (87% coverage)
- Compliance: 100% traceability
- Security: SAST clean, no critical vulns"

git push origin v1.1.0
```

### Step 5.2: Generate Release Artifacts

```bash
# Build Docker container
docker build -t ghcr.io/company/platform:v1.1.0 .

# Generate SBOM (CycloneDX)
cyclonedx-npm --output sbom-v1.1.0.json

# Generate vulnerability scan
npm audit --json > npm-audit-v1.1.0.json

# Sign with Sigstore (SLSA v1.0)
cosign sign-blob --key cosign.key sbom-v1.1.0.json > sbom.sig
```

### Step 5.3: Release Approval Gate ✓

**Checklist:**
- ☑ SBOM generated (CycloneDX)
- ☑ Vulnerability scan: 0 unaddressed HIGH/CRITICAL
- ☑ SLSA provenance signed
- ☑ Release notes complete
- ☑ All tests still passing

```bash
# Create release
gh release create v1.1.0 \
  --title "Release v1.1.0: FHIR Patient Sync" \
  --body "✅ FHIR patient synchronization with bidirectional EHR mapping
- Network-resilient: 3x retry with exponential backoff
- Encrypted: AES-256-GCM for PHI at rest
- Audited: All sync events logged to compliance trail
- Tested: 245 unit tests (87% coverage), 32 integration tests
- Secure: Zero critical vulnerabilities
- SLSA v1.0: Signed provenance attestation"
```

### Step 5.4: Deployment

```bash
# Push container to registry
docker push ghcr.io/company/platform:v1.1.0

# Deploy to staging
kubectl set image deployment/platform \
  platform=ghcr.io/company/platform:v1.1.0 \
  --namespace=staging

# Run smoke tests
./scripts/smoke_tests.sh

# Deploy to production (blue-green)
kubectl set image deployment/platform-blue \
  platform=ghcr.io/company/platform:v1.1.0 \
  --namespace=production

# Verify health
kubectl get pods -n production
kubectl logs -f deployment/platform-blue -n production
```

### Step 5.5: Release Closure

```bash
# Verify deployment successful
PODS=$(kubectl get pods -n production -l version=v1.1.0 --no-headers)
if [ "$(echo $PODS | grep -c Running)" -eq 3 ]; then
  echo "✅ Deployment successful: v1.1.0 running"
else
  echo "❌ Deployment failed: pods not running"
  exit 1
fi

# Log to audit trail
audit.log_event(
    event_type="release_deployed",
    user_id="release-manager",
    resource_id="Release-v1.1.0",
    action="DEPLOY",
    context={
        "version": "v1.1.0",
        "environment": "production",
        "timestamp": datetime.utcnow().isoformat(),
        "pods_running": 3
    }
)

echo "✅ RELEASE COMPLETE: v1.1.0 deployed to production"
```

---

## Emergency Procedures

### Critical Bug Hotfix (Timeline: 4 Hours)

**If:** Production bug affects patient safety  
**Then:** Expedited hotfix process

```bash
# 1. Create hotfix branch (skip full SDLC)
git checkout -b hotfix/critical-auth-bypass

# 2. Implement fix + minimal testing (4 hours)
# ... code change ...
git commit -m "hotfix: [brief description]"

# 3. Expedited review (1 engineer) & testing
npm test

# 4. Deploy with minimal ceremony
git tag v1.1.1-hotfix
docker build -t ghcr.io/company/platform:v1.1.1-hotfix .
kubectl set image deployment/platform platform=... -n production

# 5. Retrospective review (post-deployment)
# Full design review + additional testing within 24 hours
```

---

## Troubleshooting

### Problem: Tests Failing After Code Change

```bash
# 1. Check which tests failed
npm test 2>&1 | grep FAIL

# 2. Run only failing tests with verbose output
npm test -- --testNamePattern="test_sync_patient_success" --verbose

# 3. Debug interactively
npm test -- --watch

# 4. If all else fails: revert & investigate
git revert HEAD
# ... investigate offline ...
```

### Problem: Deployment Fails

```bash
# 1. Check pod status
kubectl get pods -n production

# 2. Get pod logs
kubectl logs deployment/platform -n production -f

# 3. Rollback to previous version
kubectl set image deployment/platform \
  platform=ghcr.io/company/platform:v1.0.9 -n production

# 4. Post-mortem: why did deploy fail?
```

---

## Summary

This runbook provides step-by-step procedures for:
✅ Feature releases (2-4 weeks, full 8 gates)  
✅ Patch releases (1 week, 4 gates)  
✅ Hotfixes (24 hours, 2 gates)  
✅ Emergency rollbacks  

All processes maintain FDA compliance (IEC 62304 gates + audit trails).
