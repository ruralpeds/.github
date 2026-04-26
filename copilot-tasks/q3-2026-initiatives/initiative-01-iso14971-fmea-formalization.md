# Q3-2026 Initiative 01: ISO 14971 Risk Management Formalization

**Period:** Q3-2026 (July–September)  
**Concurrent Initiative:** Yes (parallel with 4 other Q3 initiatives)  
**Duration:** 4 weeks (July 1–28)  
**Owner:** Timothy Hartzog (Compliance Officer)  
**Priority:** HIGH (Establishes formal risk management; enables design controls)

---

## Objective

Formalize ISO 14971 Risk Management process per medical device standards. Establish baseline Failure Mode & Effects Analysis (FMEA) for clinical device repos (PedNeoSim.jl, pediatric-cds). Create quarterly FMEA review cycle and document residual risk assessment.

**Current State:** Risk management ad-hoc; no formal FMEA baseline; no quarterly review process.

**End State:** 
- Baseline FMEA with 18–25 hazard modes identified
- Quarterly review cycle operationalized
- Risk acceptance documentation for all identified hazards
- Design controls informed by risk analysis

---

## Acceptance Criteria

- [ ] Conduct risk analysis workshop (2 hours, documented)
- [ ] Identify 18–25 hazard modes across Class A/B repos
- [ ] Assign risk scores (severity, occurrence, detectability)
- [ ] Define mitigation strategies for high/medium risks
- [ ] Create baseline FMEA spreadsheet (dhf/risk/fmea-baseline.xlsx)
- [ ] Document FMEA process (dhf/risk/fmea-process.md)
- [ ] Risk acceptance form signed by stakeholders
- [ ] Quarterly review schedule published

---

## ISO 14971 Framework

### Risk Management Process (§7 Overview)

1. **Risk Analysis** (§7.3)
   - Identify hazards
   - Estimate risk magnitude (severity × occurrence)
   - Document in FMEA

2. **Risk Evaluation** (§7.4)
   - Compare to acceptable risk criteria
   - Determine if mitigation required

3. **Risk Control** (§7.5)
   - Implement design/operational controls
   - Verify effectiveness (testing)

4. **Residual Risk Evaluation** (§7.6)
   - Assess remaining risk after controls
   - Accept or iterate controls

5. **Risk Management Review** (§7.7)
   - Quarterly review of risk register
   - Incorporate new findings/feedback
   - Update FMEA for new hazards

---

## Baseline FMEA Scope

### Scope: PedNeoSim.jl & Pediatric-CDS (Class B Repos)

**Functions:**
- Neonatal growth calculation engine
- Clinical decision support (CDS) algorithms
- Data input validation
- Reporting output generation
- System integration points

**Users:**
- Healthcare providers (nurses, physicians)
- System administrators
- External system interfaces (EHR)

**Use Cases:**
- Patient growth assessment
- Clinical decision support
- Trend reporting

---

## Hazard Categories (Expected 18–25 Modes)

### Calculation/Algorithm Errors (5–7 modes)
1. Incorrect growth percentile calculation (Severity: High, Occurrence: Low, RPN: Medium)
2. Weight/height data input transposition (Severity: Medium, Occurrence: Medium, RPN: Medium)
3. CDS algorithm logic error → wrong recommendation (Severity: High, Occurrence: Low, RPN: Medium)
4. Floating-point precision loss in calculations (Severity: Low, Occurrence: Low, RPN: Low)
5. Database lookup error (percentile table corruption) (Severity: High, Occurrence: Very Low, RPN: Medium)

### Data Integrity Issues (4–6 modes)
6. Patient data corruption during transmission (Severity: High, Occurrence: Very Low, RPN: Low)
7. Missing required input fields (Severity: Medium, Occurrence: Medium, RPN: Medium)
8. Concurrent write conflict (multiple users editing same record) (Severity: Medium, Occurrence: Low, RPN: Low)
9. EHR integration data mismatch (Severity: High, Occurrence: Low, RPN: Medium)
10. Audit log tampering (Severity: High, Occurrence: Very Low, RPN: Low)

### System/Operational Failures (4–6 modes)
11. System timeout during long calculation (Severity: Medium, Occurrence: Low, RPN: Low)
12. Database connection failure (Severity: High, Occurrence: Low, RPN: Medium)
13. User permission escalation → unauthorized access (Severity: High, Occurrence: Very Low, RPN: Low)
14. Incorrect version deployed (old algorithm running) (Severity: High, Occurrence: Very Low, RPN: Low)
15. Backup/recovery failure → data loss (Severity: Critical, Occurrence: Very Low, RPN: Low)

### Human/Interface Errors (4–6 modes)
16. Clinician misinterprets output report (Severity: High, Occurrence: Medium, RPN: High) ⚠️
17. Wrong patient selected in UI (Severity: Critical, Occurrence: Low, RPN: High) ⚠️
18. System shutdown during critical operation (Severity: High, Occurrence: Very Low, RPN: Low)
19. UI display of misleading data format (Severity: Medium, Occurrence: Medium, RPN: Medium)
20. Incomplete/unclear audit trail for accountability (Severity: Medium, Occurrence: Low, RPN: Low)

**High-Risk Modes (require mitigation):** 16, 17, 3, 9

---

## Risk Control Strategies

### High-Risk Mitigations

**Mode 16: Clinician Misinterprets Output**
- Control: Clear labeling of percentiles with clinical interpretation guide
- Verification: User testing with sample clinicians
- Verification Evidence: Usability test report (docs/risk/usability-testing-q3.md)

**Mode 17: Wrong Patient Selected**
- Control: Patient ID verification on every action (double-check UI)
- Verification: Automated unit tests for patient selection logic
- Verification Evidence: Test coverage report (>95% for patient selection module)

**Mode 3: CDS Algorithm Logic Error**
- Control: Algorithm validation against reference implementations
- Verification: Automated regression tests against gold-standard outputs
- Verification Evidence: Test case documentation (50+ test cases)

**Mode 9: EHR Integration Data Mismatch**
- Control: Data mapping validation at integration points
- Verification: Integration tests with sandbox EHR system
- Verification Evidence: Integration test report (docs/risk/ehr-integration-tests.md)

---

## FMEA Implementation Timeline

| Week | Phase | Task | Effort | Owner |
|------|-------|------|--------|-------|
| Week 1 (Jul 1–7) | Planning | Risk analysis workshop prep | 2 days | Timothy |
| Week 1 (Jul 1–7) | Execution | Conduct risk analysis workshop (2h) | 4 hours | Timothy + Team |
| Week 2 (Jul 8–14) | Analysis | Document FMEA baseline (18–25 modes) | 3 days | Timothy |
| Week 3 (Jul 15–21) | Design | Create mitigation strategies | 2 days | Timothy + Eng |
| Week 4 (Jul 22–28) | Documentation | Finalize FMEA, risk process doc | 2 days | Timothy |

**Total:** 4 weeks calendar (10 days effort)

---

## Deliverables

- [ ] `dhf/risk/fmea-baseline.xlsx` (FMEA spreadsheet with all modes, risks, controls)
- [ ] `dhf/risk/fmea-process.md` (Formal ISO 14971 process documentation)
- [ ] `dhf/risk/risk-acceptance-form.pdf` (Signed risk acceptance by stakeholders)
- [ ] `docs/risk/usability-testing-q3.md` (Usability test results for Mode 16 control)
- [ ] `docs/risk/ehr-integration-tests.md` (Integration test results for Mode 9 control)
- [ ] Quarterly review schedule (calendar invites for 2026 Q3, Q4)

---

## Success Metrics

| Metric | Success Criteria | Verification |
|--------|-----------------|--------------|
| FMEA completeness | 18–25 hazard modes identified | Count in xlsx |
| Risk scoring | All modes have severity/occurrence/RPN | Excel calculations valid |
| Mitigation coverage | All high-risk modes have controls | Design controls documented |
| Process documented | ISO 14971 §7 mapped to artifacts | Process doc complete |
| Quarterly review | Schedule published for Jul–Dec 2026 | Calendar events created |
| Risk acceptance | Signed form from compliance + clinical lead | PDF in DHF |

---

## Dependencies

- ✅ IEC 62304 classification complete (Initiative Q2-3)
- ✅ Design History File structure (Phase 6)
- Access to clinical domain experts (for workshop)
- Design documentation for PedNeoSim.jl, pediatric-cds

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Incomplete hazard identification | Unmitigated risks | Multi-disciplinary workshop (clinical + engineering) |
| Risk acceptance delayed | Schedule slip | Stakeholder sign-off pre-scheduled |
| Mitigation design too complex | Feasibility issues | Design review checkpoint (Week 3) |

---

## Quarterly Review Cycle (After Initiative Complete)

Once baseline FMEA established, implement recurring quarterly review:

**Schedule:**
- Q3 Review: August 15, 2026
- Q4 Review: November 15, 2026
- Q1 2027 Review: February 15, 2027

**Activities:**
- Review new failure modes from incident/feedback database
- Update risk scores if new data available
- Verify control effectiveness
- Document changes in FMEA

---

## Next Step

After Initiative Q3-1 completion (July 28), FMEA serves as input to:
- **Initiative Q3-2:** EHR Integration Framework (design controls informed by risk)
- **Initiative Q3-4:** FDA Premarket Readiness (risk analysis required for 505(b)(1) submission)

---

## Reference Documents

- **ISO 14971:2019** — Medical device risk management
- **IEC 62304** — Design controls requirement mapping
- **FDA Guidance:** Risk Analysis (FDA-G94-1)
