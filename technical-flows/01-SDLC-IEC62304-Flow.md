# Technical Flow 1: Software Development Lifecycle with IEC 62304 Controls

**Document:** Enterprise Medical Device Software Development Lifecycle  
**Standard:** IEC 62304:2015 (Medical device software lifecycle)  
**Compliance:** FDA 21 CFR Part 11 compatible  
**Version:** 1.0  
**Date:** April 24, 2026

---

## Overview

This document defines the technical workflow for developing medical device software with integrated IEC 62304 design controls, ensuring traceability, change management, verification/validation, and risk management throughout the software lifecycle.

**Key Compliance Gates:** 8 mandatory checkpoints  
**Audit Trail Integration:** Every phase transition logged with timestamps, users, approvals  
**Rollback Capability:** Safe state at each gate for defect remediation

---

## Phase 1: Software Planning & Requirements (IEC 62304 §5.1-5.2)

### Input
- Product requirements from clinical/regulatory team
- Risk assessment (ISO 14971 pre-assessment)
- Intended use statement
- Software safety classification (Class A/B/C)

### Process Flow

```
START
  ↓
[1.1] Intake & Classification
  - Receive requirements document
  - Classify software safety level:
    * Class A: No injury/damage
    * Class B: Non-serious injury possible
    * Class C: Death/serious injury possible
  - Log: requirement_id, safety_class, date, submitter
  ↓
[1.2] Software Requirements Specification (SRS) Creation
  - Functional requirements (shall/should statements)
  - Non-functional (performance, usability, security)
  - Regulatory requirements mapping
  - IEC 62304 traceability matrix start
  - Required: 2+ reviewers; zero critical comments
  ↓
[1.3] Risk Analysis (ISO 14971 Integration)
  - Hazard identification (medical device context)
  - Preliminary hazard severity/probability
  - Risk control measures assignment
  - Link risk items to requirements
  ↓
[1.4] Design Input Approval Gate ✓ MANDATORY AUDIT POINT
  - Checklist verification:
    ☑ SRS complete & reviewed
    ☑ Safety classification assigned
    ☑ Risk controls identified
    ☑ Traceability initiated
  - Approval: Engineering Lead + Compliance Officer
  - Audit log entry: design_input_approved, timestamp, approvers
  ↓
PROCEED TO DESIGN PHASE
```

### Compliance Data Logged
```json
{
  "phase": "planning",
  "requirement_id": "REQ-001",
  "safety_class": "B",
  "requirement_text": "System shall authenticate users with MFA",
  "risk_controls": ["RC-002", "RC-003"],
  "created_date": "2026-04-24T10:30:00Z",
  "created_by": "timothy.hartzog@example.com",
  "reviewed_by": ["engineer@example.com", "compliance@example.com"],
  "approval_status": "approved",
  "approval_date": "2026-04-24T14:15:00Z",
  "audit_hash": "sha256:abc123..."
}
```

---

## Phase 2: Software Design (IEC 62304 §5.3)

### Input
- Approved SRS
- Risk control specifications
- Architecture decisions

### Process Flow

```
START
  ↓
[2.1] Architectural Design
  - Define software modules/components
  - Module interactions & data flows
  - Security boundaries (FHIR endpoints, encryption zones)
  - Deployment architecture
  - Link to requirements (traceability matrix)
  ↓
[2.2] Detailed Design
  - Data structures (FHIR resource definitions)
  - Algorithm specifications
  - Interface definitions (APIs, database schema)
  - Error handling & recovery mechanisms
  - Audit trail event types & fields
  ↓
[2.3] Design Review (Formal)
  - Peer review minimum 2 engineers
  - Compliance check: Risk controls traceable to design
  - Security review: Cryptography, access control, audit logging
  - Required: Design document + checklist sign-off
  ↓
[2.4] Design Approval Gate ✓ MANDATORY AUDIT POINT
  - Checklist:
    ☑ Architecture reviewed
    ☑ All requirements allocated to modules
    ☑ Risk controls implemented in design
    ☑ Data flows documented
    ☑ Security review complete
  - Approval: CTO + Compliance Officer
  - Audit log: design_phase_approved
  ↓
PROCEED TO IMPLEMENTATION PHASE
```

### Compliance Data Logged
```json
{
  "phase": "design",
  "design_id": "DES-001",
  "module_name": "AuthenticationService",
  "requirement_allocation": ["REQ-001", "REQ-005"],
  "risk_controls_implemented": ["RC-002"],
  "data_flows": ["patient_data_encrypted", "audit_event_logged"],
  "security_review": {
    "cryptography": "pass",
    "access_control": "pass",
    "audit_logging": "pass"
  },
  "review_date": "2026-04-25",
  "reviewed_by": ["eng1@example.com", "eng2@example.com"],
  "approved_date": "2026-04-25T16:00:00Z",
  "approved_by": "cto@example.com",
  "audit_hash": "sha256:def456..."
}
```

---

## Phase 3: Software Implementation (IEC 62304 §5.4)

### Input
- Approved design document
- Code standards & templates
- Development environment setup

### Process Flow

```
START
  ↓
[3.1] Development Environment Setup
  - Git repository initialized with branch protection
  - Main branch: production-ready code only
  - Development branch: feature work
  - Required: SLSA v1.0 provenance setup (Sigstore keyless)
  ↓
[3.2] Code Development
  - Feature branch per requirement (REQ-001, DES-001)
  - Mandatory code patterns:
    * Audit event logging on every state change
    * Input validation (OWASP top 10)
    * Error handling with fallback states
    * Cryptographic operations via approved libs
  - Required: Unit tests written before merge
  ↓
[3.3] Code Review & Static Analysis
  - Pull request: minimum 1 code review approval
  - Static analysis: no high-risk vulns (SAST)
  - Code coverage: ≥80% for medical device modules
  - Security scanning: dependency vulnerabilities (SBOM)
  - Required: All comments resolved before merge
  ↓
[3.4] Traceability Verification
  - Verify code implements approved design
  - Verify design implements requirements
  - Generate code-to-design-to-requirement matrix
  - Required: 100% forward traceability
  ↓
[3.5] Implementation Approval Gate ✓ MANDATORY AUDIT POINT
  - Checklist:
    ☑ All code reviewed & approved
    ☑ Static analysis clean (no highs)
    ☑ Unit tests passing (≥80% coverage)
    ☑ Traceability matrix complete
    ☑ Security scanning complete
    ☑ SLSA provenance attested
  - Approval: Engineering Lead
  - Audit log: implementation_complete, commit hash
  ↓
PROCEED TO TESTING PHASE
```

### Compliance Data Logged
```json
{
  "phase": "implementation",
  "commit_hash": "abc123def456",
  "feature_branch": "feature/authentication",
  "requirement_coverage": ["REQ-001", "REQ-005"],
  "design_coverage": ["DES-001"],
  "code_review": {
    "approved_by": "eng1@example.com",
    "review_date": "2026-04-26",
    "comments_resolved": true
  },
  "static_analysis": {
    "tool": "bandit",
    "vulnerabilities_high": 0,
    "vulnerabilities_medium": 1,
    "mitigations": ["SQL parameterized queries"]
  },
  "code_coverage": 0.82,
  "sbom": "cyclonedx-1.4.json",
  "slsa_provenance": {
    "attestation_uri": "sigstore://...",
    "timestamp": "2026-04-26T10:30:00Z"
  },
  "approved_date": "2026-04-26T14:00:00Z",
  "audit_hash": "sha256:ghi789..."
}
```

---

## Phase 4: Software Verification & Validation (IEC 62304 §5.5-5.6)

### Input
- Implementation complete & approved
- Test plans aligned to requirements
- Validation protocols for clinical use

### Process Flow

```
START
  ↓
[4.1] Unit Testing Execution
  - Run automated unit test suite
  - Coverage report: ≥80% of medical modules
  - Required: All tests passing before integration
  - Log: test_run_id, pass/fail count, timestamp
  ↓
[4.2] Integration Testing
  - Test module interactions (API contracts)
  - Test data flows (FHIR mapping, encryption)
  - Test error handling & recovery
  - Test audit trail logging & integrity
  - Required: No critical defects unresolved
  ↓
[4.3] System Testing
  - End-to-end workflows (clinician use case)
  - Performance testing (latency, throughput)
  - Security testing (authentication, encryption)
  - Resilience testing (chaos engineering, 28+ day MTBF)
  - Required: All requirements verified
  ↓
[4.4] Compliance Verification
  - IEC 62304 traceability: requirements → design → code → tests
  - Risk controls: each control verified in test results
  - CFR Part 11 audit trail: events logged, tamper-proof
  - FHIR compliance: sample data round-trip validation
  - Required: Traceability matrix 100% complete
  ↓
[4.5] Validation (Clinical Context)
  - Use case testing: realistic clinical workflows
  - Usability testing: HCI assessment
  - Failure mode testing: what happens if subsystem fails?
  - Required: Clinical team sign-off
  ↓
[4.6] Verification & Validation Approval Gate ✓ MANDATORY AUDIT POINT
  - Checklist:
    ☑ All unit tests passing (≥80% coverage)
    ☑ Integration tests complete & passing
    ☑ System tests complete & passing
    ☑ Security testing: no exploitable vulns
    ☑ Traceability matrix 100% (req → test)
    ☑ Risk controls verified
    ☑ Clinical validation complete
    ☑ No critical defects remaining
  - Approval: QA Lead + Clinical Officer + Compliance Officer
  - Audit log: verification_validation_approved, test_summary
  ↓
PROCEED TO RELEASE PHASE
```

### Compliance Data Logged
```json
{
  "phase": "verification_validation",
  "test_campaign_id": "TC-2026-Q2-001",
  "test_categories": {
    "unit_tests": {
      "total": 245,
      "passed": 245,
      "failed": 0,
      "coverage_percent": 0.84
    },
    "integration_tests": {
      "total": 58,
      "passed": 58,
      "failed": 0,
      "critical_issues": 0
    },
    "system_tests": {
      "total": 32,
      "passed": 32,
      "failed": 0
    },
    "security_tests": {
      "penetration_test": "passed",
      "vulnerability_scan": "zero_exploitable",
      "authentication_test": "passed"
    }
  },
  "traceability_matrix": {
    "requirements_tested": 47,
    "requirements_total": 47,
    "coverage_percent": 1.0
  },
  "risk_controls_verified": 18,
  "clinical_validation": "approved_by_clinical_officer",
  "approval_date": "2026-04-29T15:00:00Z",
  "approved_by": ["qa_lead@example.com", "clinical@example.com", "compliance@example.com"],
  "audit_hash": "sha256:jkl012..."
}
```

---

## Phase 5: Software Release (IEC 62304 §5.7)

### Input
- Verification & Validation approved
- Release notes prepared
- Deployment plan finalized

### Process Flow

```
START
  ↓
[5.1] Release Preparation
  - Tag release in git: v1.0.0 (semantic versioning)
  - Generate release notes: features, fixes, known issues
  - Package release artifacts (container image, checksums)
  - Generate SBOM (Software Bill of Materials, CycloneDX)
  - Generate VEX (Vulnerability Exploitability Exchange)
  ↓
[5.2] Release Attestation (SLSA v1.0)
  - Sign release artifacts with Sigstore keyless
  - Generate provenance attestation
    * Source: git commit hash
    * Build: build logs, compiler version
    * Timestamp: ISO 8601
  - Store provenance in supply chain repository
  ↓
[5.3] Release Documentation
  - Create release record in compliance system:
    * Feature list + requirement mapping
    * Test results summary
    * Risk assessment: no new risks introduced
    * Security assessment: dependency vulnerabilities addressed
  - Create software traceability matrix for release
  ↓
[5.4] Release Approval Gate ✓ MANDATORY AUDIT POINT
  - Checklist:
    ☑ Release notes complete
    ☑ SBOM & VEX generated
    ☑ SLSA provenance attested
    ☑ All V&V tests still passing
    ☑ Risk controls verified in release
    ☑ No security vulns unaddressed
  - Approval: Release Manager + Compliance Officer
  - Audit log: release_approved, version, attestation_uri
  ↓
[5.5] Release Deployment
  - Deploy to staging environment
  - Run post-deployment verification
  - Monitor for errors (Grafana Tempo)
  - If errors: halt deployment, log issue, enter defect cycle
  - Deploy to production
  ↓
[5.6] Post-Release Monitoring
  - Monitor application logs for errors
  - Monitor Grafana Tempo for performance issues
  - Monitor audit trail for integrity violations
  - Collect post-market surveillance data
  - If critical issue: trigger incident response
  ↓
[5.7] Release Closure
  - Confirm successful deployment to all environments
  - Archive release artifacts
  - Create release summary for regulatory records
  - Audit log: release_complete, deployment_date
  ↓
END - RELEASE COMPLETE
```

### Compliance Data Logged
```json
{
  "phase": "release",
  "release_version": "v1.0.0",
  "release_date": "2026-05-01",
  "source_commit": "abc123def456",
  "release_notes": {
    "features": ["Authentication MFA", "FHIR patient mapping"],
    "bug_fixes": ["Session timeout handling"],
    "known_issues": []
  },
  "sbom": {
    "format": "cyclonedx-1.4",
    "file": "sbom.json",
    "total_dependencies": 47,
    "vulnerable_dependencies": 0
  },
  "vex": {
    "format": "cyclonedx-vex",
    "addressed_vulnerabilities": 2
  },
  "slsa_provenance": {
    "build_type": "github-actions-v1",
    "builder": "github.com/actions/runner@v2.0",
    "source_uri": "git://github.com/company/platform@abc123",
    "timestamp": "2026-05-01T08:00:00Z",
    "attestation_uri": "sigstore://attestation-123"
  },
  "risk_assessment": "no_new_risks",
  "security_assessment": {
    "dependency_vulns": 0,
    "code_scan": "passed"
  },
  "approved_date": "2026-05-01T09:00:00Z",
  "approved_by": ["release_manager@example.com", "compliance@example.com"],
  "deployment_status": "production_deployed",
  "deployment_date": "2026-05-01T14:30:00Z",
  "audit_hash": "sha256:mno345..."
}
```

---

## Phase 6: Maintenance & Updates (IEC 62304 §5.8)

### Input
- Released software in production
- Post-market surveillance data
- User feedback & defect reports

### Process Flow

```
START
  ↓
[6.1] Issue Triage
  - Classify severity:
    * Critical: Loss of functionality/safety risk → hotfix within 24h
    * High: Significant impact → fix in next release
    * Medium: Minor impact → backlog
    * Low: Cosmetic → backlog
  ↓
[6.2] Root Cause Analysis
  - Trace defect to source (design flaw, implementation bug, etc)
  - Risk assessment: could defect cause patient harm?
  - Regulatory assessment: does FDA need to be notified?
  ↓
[6.3] Defect Resolution
  - Create defect ticket linked to original requirement
  - Enter fix into feature branch (same as Phase 3-4 flow)
  - Code review, testing, traceability
  - Link fix back to defect
  ↓
[6.4] Maintenance Release Approval Gate ✓ MANDATORY AUDIT POINT
  - Checklist:
    ☑ Root cause identified
    ☑ Fix tested & verified
    ☑ Traceability complete
    ☑ Risk assessment: no new risks
    ☑ Regulatory assessment complete
  - Approval: Engineering Lead + Compliance Officer
  - Audit log: maintenance_approved, defect_id, fix_version
  ↓
[6.5] Release & Deployment
  - Tag release (patch version increment, e.g., v1.0.1)
  - Follow Phase 5 (attestation, documentation, deployment)
  ↓
[6.6] Regulatory Notification
  - If safety issue: notify FDA within required timeframe
  - If patient harm: mandatory medical device report (MDR)
  - Document notification in compliance system
  ↓
END - MAINTENANCE CYCLE COMPLETE
```

### Compliance Data Logged
```json
{
  "phase": "maintenance",
  "defect_id": "DEF-001",
  "severity": "high",
  "issue_description": "Session timeout not properly logged to audit trail",
  "root_cause": "Missing audit event in logout handler",
  "root_cause_analysis_date": "2026-05-02",
  "fix_version": "v1.0.1",
  "fix_commit": "def456ghi789",
  "regulatory_impact": "user_action_not_tracked",
  "fda_notification_required": false,
  "mdr_required": false,
  "testing_status": "passed",
  "approval_date": "2026-05-03T10:00:00Z",
  "approved_by": ["engineering@example.com", "compliance@example.com"],
  "deployed_date": "2026-05-03T14:00:00Z",
  "audit_hash": "sha256:pqr678..."
}
```

---

## IEC 62304 Traceability Matrix Integration

Every phase generates traceability data. The complete matrix:

```
Requirement (REQ-001)
  ↓ allocated to
Design Component (DES-001)
  ↓ implemented in
Code Module (src/auth/mfa.py)
  ↓ verified by
Test Case (TC-AUTH-001)
  ↓ confirmed in
Release (v1.0.0)
```

**Matrix Storage:** JSON file, updated at each phase
**Matrix Audit:** Hash chain ensures no retroactive modification
**Matrix Verification:** 100% coverage required for FDA submission

---

## Change Management & Configuration Control

### Change Request Process

```
[Change Request] 
  ↓
[Assessment: Risk + Regulatory Impact]
  ↓
[Approval: Engineering + Compliance]
  ↓
[Implementation: Follow SDLC phases as needed]
  ↓
[Re-V&V: Verify fix doesn't break other functions]
  ↓
[Release: Patch or minor version increment]
```

### Change Log Entry
```json
{
  "change_id": "CHG-001",
  "date": "2026-05-05",
  "submitted_by": "engineer@example.com",
  "description": "Add support for patient demographics update",
  "type": "enhancement",
  "sdlc_phases_affected": ["design", "implementation", "verification"],
  "risk_assessment": "medium_risk_existing_functionality_unaffected",
  "regulatory_impact": "fhir_mapping_extended",
  "approval_status": "approved",
  "approved_by": ["cto@example.com", "compliance@example.com"],
  "approved_date": "2026-05-05T11:00:00Z",
  "implementation_status": "released_v1.1.0",
  "audit_hash": "sha256:stu901..."
}
```

---

## Audit Trail Integration Points

Every SDLC phase gate logs:
- **Who:** User ID, timestamp
- **What:** Phase name, approval decision, checksum
- **Why:** Change reason (if applicable)
- **Status:** Approved/Rejected/Conditional

Each log entry is cryptographically hashed and chained (see Technical Flow 2: Audit Trail & Compliance).

---

## Implementation Standards

### Code Patterns
- All state changes logged to audit trail
- All external calls wrapped with error handling
- All inputs validated before processing
- All cryptographic operations use approved algorithms
- All FHIR operations via validated mapping layer

### Testing Requirements
- Unit: ≥80% coverage for medical modules
- Integration: All module interactions tested
- System: End-to-end clinical workflows
- Security: Penetration testing, static analysis clean

### Documentation Requirements
- Design: UML diagrams + algorithm specifications
- Code: Docstrings for complex functions
- Tests: Test case rationale documented
- Release: Feature list + requirement mapping

---

## Summary

This SDLC flow ensures:
✅ 100% requirement traceability (requirement → design → code → test)  
✅ IEC 62304 compliance (8 mandatory approval gates)  
✅ Risk management integration (hazards → design → implementation → testing)  
✅ Audit trail completeness (every decision logged & verifiable)  
✅ Supply chain security (SLSA v1.0 provenance on every release)  
✅ CFR Part 11 readiness (electronic records with audit trail integrity)

**Next:** See Technical Flow 2 for audit trail & compliance mechanisms.
