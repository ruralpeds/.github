# Software Safety Classification (IEC 62304 §4.2)

**Repository:** educational-simulation  
**Classification Date:** May 2026  
**Assigned Class:** Not Applicable  
**Assessor:** Timothy Hartzog, Compliance Officer

---

## Decision Rationale

The `educational-simulation` repository contains a reference implementation of a neonatal growth simulator. This software is explicitly designed as an educational tool for learning simulation methodology and is not intended for clinical use. It is not medical device software per FDA definition (21 CFR 860.3(c)) because:

1. **No intended clinical use:** The software is explicitly labeled as educational and reference-only, not for clinical decision support.
2. **No patient data processing:** The simulator accepts no patient data input and produces no patient-specific recommendations.
3. **No clinical integration:** The simulator is not integrated with electronic health records (EHR) systems, clinical workflows, or patient care processes.
4. **Educational output only:** Output is reference growth curves and educational charts for learning purposes, not for patient care decisions.

---

## Harm Assessment

**Q: Can the software cause injury or damage to health?**

**Answer:** No.

**Rationale:**  
The simulator is an educational tool for teaching simulation methodology to students and researchers. Potential indirect harm (a student misunderstands simulation behavior and learns an incorrect concept) is an educational effectiveness issue, not a software safety issue. Such risks are mitigated through pedagogical review and curriculum design, not through medical device validation.

---

## Regulatory Status

### Medical Device Software?
**No.** This repository does not meet the FDA definition of medical device software:
- Not intended to diagnose, cure, mitigate, treat, or prevent disease in humans
- Explicitly non-clinical; designed for educational purposes
- Not a component of a medical device system

### IEC 62304 Applicability?
**No.** IEC 62304 applies only to medical device software. Educational/academic software is governed by academic and institutional quality assurance processes, not medical device lifecycle.

### Governing Standards
- **Not subject to:** IEC 62304 (medical device software lifecycle)
- **Subject to:** 
  - Academic/institutional quality assurance
  - Peer review (if published)
  - ISO 27001 (information security governance)
  - Standard code review and documentation governance

---

## Classification

**Assigned Class:** **Not Applicable** (Non-Medical Device Software, Educational)

This repository is classified as educational/reference software and is not subject to IEC 62304 medical device lifecycle requirements.

---

## Controls & Governance

### Applicable Controls
- **Code Review:** Standard peer review per organizational policy
- **Testing:** Unit tests and integration tests appropriate for educational software
- **Documentation:** API documentation and usage examples for students/researchers
- **Access Control:** Standard GitHub RBAC (Role-Based Access Control)
- **Change Control:** Standard git workflow with branch protection

### Not Applicable Controls
- IEC 62304 Traceability (not required for educational software)
- Clinical Validation (not required for non-clinical software)
- Design Controls (not required for non-device software)
- Design History File (not required for non-device software)

---

## Approval

**Assessor:** Timothy Hartzog, Compliance Officer  
**Date:** May 2026  
**Effective Date:** May 2026  

This classification decision is final. The repository is classified as Not Applicable to IEC 62304 and is therefore exempt from medical device software lifecycle requirements.

---

## Reference Documents

- FDA 21 CFR 860.3(c) — Definition of Medical Device
- IEC 62304:2015 — Medical device software lifecycle processes
- initiative-03-classification-decision.md — Detailed classification framework
