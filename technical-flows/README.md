# Technical Flows: Enterprise Medical Device Software Architecture

**Purpose:** Comprehensive technical flows that enhance the technical abilities for producing better enterprise medical software with integrated auditing, compliance, and regulatory controls.

**Status:** Version 1.0 — April 24, 2026

---

## Document Index

### Flow 1: Software Development Lifecycle with IEC 62304 Controls
**File:** `01-SDLC-IEC62304-Flow.md`

Defines the end-to-end software development lifecycle with integrated medical device regulatory controls:

- **Phase 1:** Software Planning & Requirements (IEC 62304 §5.1-5.2)
  - Requirements capture, safety classification, risk analysis
  - Design Input Approval Gate (mandatory checkpoint)

- **Phase 2:** Software Design (IEC 62304 §5.3)
  - Architectural & detailed design
  - Design review & peer approval
  - Design Approval Gate

- **Phase 3:** Software Implementation (IEC 62304 §5.4)
  - Code development with audit logging
  - Code review & static analysis
  - Traceability verification
  - Implementation Approval Gate

- **Phase 4:** Software Verification & Validation (IEC 62304 §5.5-5.6)
  - Unit, integration, system testing
  - Compliance verification
  - Clinical validation
  - V&V Approval Gate

- **Phase 5:** Software Release (IEC 62304 §5.7)
  - Release documentation & SBOM generation
  - SLSA v1.0 provenance attestation (Sigstore keyless)
  - Release Approval Gate & deployment

- **Phase 6:** Maintenance & Updates (IEC 62304 §5.8)
  - Defect triage & root cause analysis
  - Maintenance release process
  - Regulatory notification workflows

**Key Features:**
- ✅ 8 mandatory compliance gates (SDLC phase transitions)
- ✅ 100% requirement traceability (requirement → design → code → test)
- ✅ Risk management integration (ISO 14971)
- ✅ Supply chain security (SLSA v1.0 provenance)
- ✅ Change management & configuration control
- ✅ Audit trail integration at every gate

**Use Case:** Design and implement new features, bug fixes, or maintenance releases while maintaining FDA medical device compliance.

---

### Flow 2: Audit Trail & Compliance (CFR Part 11 + Merkle-Chain Hashing)
**File:** `02-Audit-Trail-CFRPart11-Flow.md`

Defines the technical mechanism for capturing, storing, and validating audit trail events with cryptographic tamper detection:

- **Part A: Event Capture & Structure**
  - Audit event definition (WHO, WHAT, WHEN, WHERE, WHY)
  - Event types requiring audit trail (system, data, security, compliance)
  - Event capture points in code (Python patterns)

- **Part B: Merkle-Chain Hashing for Tamper Detection**
  - Merkle tree structure for cryptographic chaining
  - Hash chain calculation (H(n) = SHA256(event_n || H(n-1)))
  - Database schema with chain verification
  - Chain integrity verification process
  - Periodic verification schedule (daily)

- **Part C: CFR Part 11 Compliance Requirements**
  - §11.10(a): Data Integrity
  - §11.10(b): Secure Software Validation
  - §11.70(a): Audit Trail Requirements
  - §11.70(c): Restricted Access to Audit Trail
  - §11.100(b): User ID & Authentication
  - §11.200: Electronic Signatures (digital signatures on critical events)

- **Part D: Audit Trail Query & Reporting**
  - SQL query examples (user activity, patient records, data exports)
  - Regulatory reports (Integrity Report, User Activity Summary)

- **Part E: Implementation Roadmap**
  - Phase 1-5 execution plan (6 weeks)
  - Database optimization
  - Performance targets (1000+ events/min)
  - Scalability planning

**Key Features:**
- ✅ Merkle-chain hashing: tamper-proof audit trail
- ✅ Digital signatures (ECDSA-P256): event authenticity
- ✅ CFR Part 11 compliance: all 6 major sections addressed
- ✅ Daily integrity verification: tampering detected within 24 hours
- ✅ Regulatory reporting: FDA submission-ready reports
- ✅ Enterprise-scale: 1000+ events/min, 50+ TB/year storage

**Use Case:** Capture and verify every state-changing action in the system (user auth, data changes, SDLC approvals, post-market events) with FDA-compliant audit trail that detects tampering.

---

## Integration: Flow 1 + Flow 2

### SDLC Phase Gates + Audit Trail Events

Every SDLC approval gate in Flow 1 generates audit events in Flow 2:

```
Flow 1 (SDLC)                    Flow 2 (Audit Trail)
─────────────────────────────────────────────────
Design Input Gate                design_input_approved
  ↓ [logged]                       ↓ [event captured]
Design Approval Gate              design_phase_approved
  ↓ [logged]                       ↓ [event captured]
Implementation Approval Gate      implementation_complete
  ↓ [logged]                       ↓ [event captured]
V&V Approval Gate                 verification_validation_approved
  ↓ [logged]                       ↓ [event captured]
Release Approval Gate             release_approved
  ↓ [logged]                       ↓ [event captured]
Maintenance Approval Gate         maintenance_approved
  ↓ [logged]                       ↓ [event captured]
```

Each gate approval is:
- Captured in audit trail (Flow 2)
- Digitally signed by approver (CFR Part 11 §11.200)
- Chained in Merkle hash (tamper detection)
- Verifiable during FDA inspection

### Code Implementation: SDLC Phase Integration

```python
# In SDLC approval handler
def approve_design_phase(design_id, approver_user_id):
    """Approve design phase with audit trail integration."""
    
    # Update SDLC status (Flow 1)
    design = db.get_design(design_id)
    design.approval_status = "approved"
    design.approved_by = approver_user_id
    design.approval_date = datetime.utcnow()
    db.commit()
    
    # Log to audit trail (Flow 2)
    audit = AuditTrail(db, signing_key)
    audit.log_event(
        event_type="design_phase_approved",
        user_id=approver_user_id,
        resource_id=f"Design-{design_id}",
        action="APPROVE",
        data_after={
            "design_id": design_id,
            "approval_status": "approved",
            "approved_by": approver_user_id,
            "approval_date": design.approval_date.isoformat()
        }
    )
    
    # Digital signature on approval (CFR Part 11)
    signature = audit._sign_event({
        "event_type": "design_phase_approved",
        "design_id": design_id,
        "approver": approver_user_id,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # Save signature to compliance records
    db.save_approval_signature(
        design_id=design_id,
        approval_type="design_phase",
        signature=signature,
        signed_date=datetime.utcnow()
    )
```

---

## Compliance Mapping

### IEC 62304 Requirements Coverage

| IEC 62304 Section | Flow 1 Coverage | Flow 2 Coverage | Combined Status |
|---|---|---|---|
| §5.1 Software Planning | Requirements capture phase | Audit event: req_defined | ✅ Complete |
| §5.2 Software Requirements | SRS creation & review | Audit events: req_approved | ✅ Complete |
| §5.3 Software Design | Design phases + approval gates | Audit events: design_approved | ✅ Complete |
| §5.4 Software Implementation | Code review + traceability | Audit events: code_reviewed | ✅ Complete |
| §5.5 Verification | Unit/integration/system testing | Audit events: tests_executed | ✅ Complete |
| §5.6 Validation | Clinical use case testing | Audit events: validation_approved | ✅ Complete |
| §5.7 Software Release | Release checklist + approval | Audit events: release_approved | ✅ Complete |
| §5.8 Maintenance | Defect lifecycle + updates | Audit events: defect_resolved | ✅ Complete |

### CFR Part 11 Requirements Coverage

| CFR Part 11 Section | Flow 2 Implementation | Status |
|---|---|---|
| §11.10(a) Data Integrity | Merkle-chain hashing + signatures | ✅ Complete |
| §11.10(b) Secure Software | SDLC with validation (Flow 1) | ✅ Complete |
| §11.70(a) Audit Trail | Complete event capture | ✅ Complete |
| §11.70(c) Audit Trail Access | RBAC on audit_trail_access permission | ✅ Complete |
| §11.100(b) User ID & Auth | MFA required, session timeout | ✅ Complete |
| §11.200 Electronic Signatures | ECDSA digital signatures | ✅ Complete |

---

## FDA Submission Package Reference

### For 510(k) Submission (Q1 2027)

**Section I.A — Software Lifecycle Documentation**
- File: `01-SDLC-IEC62304-Flow.md`
- Demonstrates compliance with IEC 62304 (medical device software standard)
- Shows all 8 approval gates with examples

**Section I.B — Data Integrity & Audit Trail**
- File: `02-Audit-Trail-CFRPart11-Flow.md`
- Demonstrates compliance with CFR Part 11 (electronic records)
- Shows tamper detection mechanism (Merkle-chain hashing)
- Sample audit trail reports

**Section I.C — Traceability Matrix**
- Generated from SDLC Flow 1 implementation
- 100% requirement → design → code → test coverage
- Ready for FDA review

**Section I.D — Risk Management (ISO 14971)**
- Integrated with SDLC (Flow 1, §2.1 & §4.3)
- Risk controls verified in V&V phase

**Section II — Post-Market Surveillance**
- Audit trail captures all clinical events (Flow 2)
- Adverse event reporting mechanism
- Continuous monitoring capability

---

## Deployment & Scaling

### Expected Performance

| Metric | Target | Status |
|---|---|---|
| Audit events/minute | 1,000+ | ✅ Achievable with indexed DB |
| Chain verification time | <5 seconds | ✅ Parallel processing |
| Query response time | <2 seconds | ✅ With proper indexing |
| Annual storage | 50+ TB | ✅ Planned for 2+ years data |
| Uptime requirement | 99.9% | ✅ HA database + backup |

### Security Posture

| Control | Implementation | Status |
|---|---|---|
| Access Control | RBAC on audit data | ✅ |
| Encryption | TLS in transit, encryption at rest | ✅ |
| Signatures | ECDSA-P256 on critical events | ✅ |
| Tamper Detection | Daily Merkle-chain verification | ✅ |
| Audit Trail | Complete capture of all actions | ✅ |

---

## Complete Technical Stack (6 Flows)

All 6 technical flows are now complete and integrated:

✅ **Flow 1: SDLC (IEC 62304)** — 6-phase development with 8 approval gates
✅ **Flow 2: Audit Trail (CFR Part 11)** — Merkle-chain hashing + digital signatures
✅ **Flow 3: Data Security & EHR** — AES-256-GCM encryption + FHIR integration
✅ **Flow 4: Risk Management (ISO 14971)** — 18 hazards → FMEA → residual risk
✅ **Flow 5: Supply Chain Security (SLSA v1.0)** — Provenance attestation + SCA
✅ **Flow 6: Post-Market Surveillance** — Adverse event detection + MDR reporting

---

## Document Control

| Field | Value |
|---|---|
| Document Version | 1.0 |
| Date Created | April 24, 2026 |
| Compliance Officer | Timothy H. Hartzog |
| Review Status | Ready for implementation |
| FDA Submission Ready | Yes (Q1 2027) |

---

## Quick Start

### To Implement Flow 1 (SDLC):
1. Read `01-SDLC-IEC62304-Flow.md` section by section
2. Adapt to your organization (replace repo names, team roles, etc.)
3. Set up approval workflow in your SDLC tool (GitHub, Jira, etc.)
4. Document each phase gate with evidence (design docs, test results, etc.)

### To Implement Flow 2 (Audit Trail):
1. Read `02-Audit-Trail-CFRPart11-Flow.md` Part A-C
2. Set up database schema (PostgreSQL or similar)
3. Implement AuditTrail.log_event() in your codebase
4. Add audit calls at state-change points (user auth, data updates, approvals)
5. Set up daily chain verification job
6. Build audit trail query UI for compliance team

### Integration:
1. Implement both flows in parallel (independent)
2. When SDLC gates are approved, trigger audit logging (via code)
3. Verify chain integrity daily
4. Generate FDA reports monthly

---

## Support & Questions

For questions about these technical flows:
- IEC 62304 details: See medical device software standards documentation
- CFR Part 11 details: See FDA electronic records guidance
- Implementation questions: Contact Compliance Officer (timothy.hartzog@example.com)
- FDA submission questions: Engage regulatory counsel (Q4 2026)

