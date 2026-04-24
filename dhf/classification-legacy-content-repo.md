# Software Safety Classification (IEC 62304 §4.2)

**Repository:** legacy-content-repo  
**Classification Date:** May 2026  
**Assigned Class:** Not Applicable  
**Assessor:** Timothy Hartzog, Compliance Officer

---

## Decision Rationale

The `legacy-content-repo` repository contains educational textbook content, historical references, and technical documentation. This software is not medical device software per FDA definition (21 CFR 860.3(c)) because:

1. **No intended use for medical diagnosis or therapy:** Content is purely educational reference material intended for learning, not clinical decision support.
2. **No patient interaction:** No patient data input, output, or processing. Content is static reference material.
3. **No clinical integration:** No integration with clinical systems, workflows, or patient care processes.
4. **Static content only:** Repository contains text (Markdown), images, and diagrams. No executable code, algorithms, calculations, or clinical logic.

---

## Harm Assessment

**Q: Can the software cause injury or damage to health?**

**Answer:** No.

**Rationale:**  
Content is educational and informational in nature. Potential indirect harm (a reader misunderstands educational content and makes a poor clinical decision) is an editorial responsibility, not a software safety issue. Such risks are mitigated through peer review and editorial governance processes, not through software validation and verification per IEC 62304.

---

## Regulatory Status

### Medical Device Software?
**No.** This repository does not meet the FDA definition of medical device software:
- Not intended to diagnose, cure, mitigate, treat, or prevent disease in humans
- Not intended for clinical decision support or clinical workflows
- Not a component of a medical device system

### IEC 62304 Applicability?
**No.** IEC 62304 applies only to medical device software. Educational content subject to editorial governance, not medical device lifecycle.

### Governing Standards
- **Not subject to:** IEC 62304 (medical device software lifecycle)
- **Subject to:** 
  - ISO 27001 (information security governance)
  - HIPAA (if content includes PHI; none in scope for this repo)
  - Standard code review and documentation governance

---

## Classification

**Assigned Class:** **Not Applicable** (Non-Medical Device Software)

This repository is classified as non-medical device software and is not subject to IEC 62304 medical device lifecycle requirements.

---

## Controls & Governance

### Applicable Controls
- **Code Review:** Standard peer review per organizational policy
- **Documentation:** Editorial review and quality assurance
- **Access Control:** Standard GitHub RBAC (Role-Based Access Control)
- **Change Control:** Standard git workflow with branch protection

### Not Applicable Controls
- IEC 62304 Traceability (not required for non-device software)
- Clinical Validation (not required for educational content)
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
