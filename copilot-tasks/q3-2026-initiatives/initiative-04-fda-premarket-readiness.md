# Q3-2026 Initiative 04: FDA Premarket Readiness Assessment

**Duration:** 3 weeks (August 1–21)  
**Owner:** Timothy Hartzog (Compliance Officer)  
**Priority:** CRITICAL (Go/No-Go Decision Point for Device Pathway)

---

## Objective

Conduct comprehensive FDA premarket readiness assessment. Make formal go/no-go decision on FDA device pathway. If GO: assemble premarket package (505(b)(1) submission). If NO-GO: pivot Year 3 roadmap to non-device EHR platform expansion.

**Current State:** Q2-2026 initiatives complete; compliance score ≥87; Year 2 framework proven.

**Go Criteria:**
- ✅ IEC 62304 traceability complete (Initiatives Q2-3, Q3-1)
- ✅ SBOM/VEX documentation (Initiatives Q2-2, Q2-1)
- ✅ SLSA v1 provenance (Initiative Q2-1)
- ✅ Cybersecurity assessment complete
- ✅ Synthetic validation (mutation testing, chaos results)
- ✅ Legal review clearance
- ✅ Resource commitment (15+ FTE for submission + post-market)

**Decision Gate:** August 21, 2026 (formal approval vote)

---

## Assessment Components

### 1. Technical Requirements (80% weight)

**IEC 62304 Completeness:**
- Design controls documented (traceability matrix ≥95%)
- Risk management (ISO 14971 baseline + quarterly reviews)
- Verification & validation (test reports, coverage >85%)

**Software SBOM & Provenance:**
- SBOM for all clinical repos (CycloneDX 1.4 conformant)
- VEX documents (vulnerability status for each dependency)
- SLSA v1 provenance for all releases

**Cybersecurity:**
- NIST SP 800-218 SSDF v1.1 conformance
- Penetration testing report (third-party)
- Security patch SLA documented

**Data Integrity & 21 CFR Part 11:**
- Audit trail (tamper-proof, 7-year retention)
- Electronic signatures (keyless via Sigstore)
- Access controls & authentication verified

### 2. Regulatory & Legal (15% weight)

**FDA Classification:**
- Device classification confirmed (Class I/II/III determination)
- 510(k) or PMA pathway identified

**Quality Management System (QMS):**
- ISO 13485:2016 readiness assessment
- Document control procedures
- Complaint handling procedure

**Labeling & Instructions:**
- User manual review (clarity, safety info)
- Labeling compliance (FDA & state requirements)
- Risk warnings & contraindications documented

### 3. Business & Resources (5% weight)

**Operational Readiness:**
- Post-market surveillance plan (21 CFR 806)
- Recall procedures documented
- Complaint intake process staffed

**Resource Commitment:**
- Regulatory affairs: 1 FTE minimum
- Clinical liaison: 0.5 FTE
- Post-market coordinator: 1 FTE
- Total commitment: 2.5+ FTE for first 18 months post-approval

---

## Assessment Timeline

| Week | Activity | Owner | Decision |
|------|----------|-------|----------|
| Week 1 (Aug 1–7) | Technical review | Eng + Timothy | Readiness score |
| Week 2 (Aug 8–14) | Regulatory alignment | Timothy + Legal | Go/No-Go indicators |
| Week 3 (Aug 15–21) | Final assessment + vote | All stakeholders | **Formal decision** |

---

## Decision Outcomes

### Option A: GO (Proceed with FDA Pathway)

**Actions:**
- Assemble premarket package (estimated 2–3 months)
- Engage FDA regulatory counsel
- Prepare for 510(k) or PMA submission
- Allocate Year 3 resources to regulatory submission

**Year 3 Roadmap Pivot:**
- Q4 2026: Premarket package finalization
- Q1 2027: FDA submission
- Q2–Q3 2027: FDA review & interactions
- Q4 2027: Conditional approval (target)

### Option B: NO-GO (Pursue Non-Device Platform)

**Actions:**
- Pivot to TEFCA/QHIN readiness (no device classification)
- Expand EHR integration (non-clinical use)
- Target healthcare IT market (administrative systems)
- Allocate Year 3 resources to platform expansion

**Year 3 Roadmap Pivot:**
- Q4 2026: TEFCA/QHIN architecture design
- Q1 2027: Healthcare IT partnership agreements
- Q2–Q3 2027: Platform expansion (multi-EHR support)
- Q4 2027: Market launch (non-device)

---

## Critical Success Factors

**Must-Haves for GO Decision:**
1. IEC 62304 traceability ≥95%
2. Compliance score ≥87/100
3. Cybersecurity assessment passed
4. Legal sign-off (no regulatory blockers)
5. 2.5+ FTE resource commitment secured

**Show-Stoppers (Force NO-GO):**
1. Traceability <85%
2. Cybersecurity vulnerabilities (critical/high)
3. Legal issues (IP conflicts, regulatory precedent concerns)
4. Resource unavailability (critical staff)
5. FDA preliminary feedback indicating probable rejection

---

## Deliverables

- `dhf/FDA_PREMARKET_READINESS_REPORT.pdf` (formal assessment)
- `dhf/DEVICE_CLASSIFICATION_DETERMINATION.md` (510(k) vs. PMA decision)
- Board-level presentation (go/no-go recommendation)
- Year 3 roadmap (conditional on decision)

---

## Approval & Sign-Off

**Decision Committee:**
- Timothy Hartzog (Compliance Officer) — vote
- CFO / Business Lead — vote (resource commitment)
- Chief Technology Officer — vote (technical readiness)
- CEO/Executive Sponsor — final authority

**Decision Date:** August 21, 2026  
**Communication:** Board meeting + stakeholder briefing

---

## Post-Decision Transition

- **If GO:** Regulatory strategy session → premarket package assembly → FDA engagement
- **If NO-GO:** Strategic pivot meeting → non-device roadmap finalization → alternative market positioning

---

**This decision determines the strategic direction for Years 3–5.**

