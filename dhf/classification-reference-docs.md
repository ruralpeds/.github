# Software Safety Classification (IEC 62304 §4.2)

**Repository:** reference-docs  
**Classification Date:** May 2026  
**Assigned Class:** Not Applicable  
**Assessor:** Timothy Hartzog, Compliance Officer

---

## Decision Rationale

The `reference-docs` repository contains technical documentation, API references, architecture guides, and best practices for developers. This software is not medical device software per FDA definition (21 CFR 860.3(c)) because:

1. **No intended clinical use:** Documentation is technical guidance for developers, not for clinical end-users.
2. **No patient interaction:** Documentation does not process, store, or output patient data.
3. **No clinical algorithms:** Documentation describes architecture and best practices; it does not contain clinical logic, diagnostics, or treatment algorithms.
4. **Guidance only:** The documentation provides guidance to developers. Harm from misunderstood documentation is a software engineering quality issue, not a medical device safety issue.

---

## Harm Assessment

**Q: Can the software cause injury or damage to health?**

**Answer:** No.

**Rationale:**  
Documentation is technical guidance for developers. Potential indirect harm (a developer misunderstands architecture and implements a flawed system) is a software engineering quality issue, not documentation safety. Such risks are mitigated through code review, testing, and architectural review, not through documentation validation per medical device standards.

---

## Regulatory Status

### Medical Device Software?
**No.** This repository does not meet the FDA definition of medical device software:
- Not intended for clinical use
- Not a system or component of a medical device
- Guidance material, not executable software

### IEC 62304 Applicability?
**No.** IEC 62304 applies to medical device software, not to technical documentation. Documentation is subject to technical review governance, not medical device lifecycle.

### Governing Standards
- **Not subject to:** IEC 62304 (medical device software lifecycle)
- **Subject to:** 
  - ISO 27001 (information security governance, if sensitive)
  - Standard technical documentation review processes
  - Version control and change management per organizational policy

---

## Classification

**Assigned Class:** **Not Applicable** (Non-Medical Device Software, Technical Documentation)

This repository is classified as technical documentation and is not subject to IEC 62304 medical device lifecycle requirements.

---

## Controls & Governance

### Applicable Controls
- **Technical Review:** Peer review of documentation accuracy and completeness
- **Version Control:** Standard git workflow with branch protection
- **Access Control:** Standard GitHub RBAC (Role-Based Access Control)
- **Change Management:** Standard pull request review process
- **Documentation Format:** Markdown, clear structure, examples for developers

### Not Applicable Controls
- IEC 62304 Traceability (not required for documentation)
- Clinical Validation (not applicable to technical guidance)
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
