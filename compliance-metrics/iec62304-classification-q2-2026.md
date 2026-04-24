# IEC 62304 Classification Decisions — Q2-2026

**Decision Date:** May 2026  
**Assessor:** Timothy Hartzog (Compliance Officer)  
**Status:** ✅ COMPLETED  
**Effective Date:** May 2026

---

## Executive Summary

Three pending repositories have been assessed for IEC 62304 safety classification under the FDA definition of medical device software (21 CFR 860.3(c)). All three repositories have been determined to be **Not Applicable** (non-medical-device software).

This decision closes the Q1-2026 compliance gap (3 pending classifications → 0) and brings the organization to 100% repository classification coverage.

---

## Classification Decisions

| Repository | Class | Rationale | Impact |
|---|---|---|---|
| **legacy-content-repo** | Not Applicable | Educational textbook content; no executable code; no clinical algorithms; no patient interaction | Removes from IEC 62304 traceability gating; standard code review governance applies |
| **educational-simulation** | Not Applicable | Reference implementation of neonatal growth simulator; explicitly non-clinical; educational tool only; no clinical integration | Removes from IEC 62304 traceability gating; academic governance applies |
| **reference-docs** | Not Applicable | Technical documentation and API reference; no executable code; guidance to developers only; no clinical content | Removes from IEC 62304 traceability gating; technical review governance applies |

---

## Per-Repo Assessment

### Repository 1: legacy-content-repo

**Description:** Educational textbook content, historical references, technical documentation  
**Classification:** Not Applicable  

**Harm Assessment:**  
Q: Can the software cause injury or damage to health?  
**A:** No. Content is static text and images with no executable code. Potential indirect harm (reader misunderstands content → makes poor clinical decision) is editorial responsibility, not software safety.

**Regulatory Status:**
- **Is this medical device software per FDA definition?** No
- **IEC 62304 applicability?** No
- **Governing standards:** ISO 27001 (information security), standard code review

**Detailed Rationale:** See `/dhf/classification-legacy-content-repo.md`

---

### Repository 2: educational-simulation

**Description:** Reference implementation of neonatal growth simulator; educational tool  
**Classification:** Not Applicable  

**Harm Assessment:**  
Q: Can the software cause injury or damage to health?  
**A:** No. Software is explicitly non-clinical. Potential indirect harm (student misunderstands simulator behavior → learns wrong concept) is educational effectiveness issue, not software safety.

**Regulatory Status:**
- **Is this medical device software per FDA definition?** No
- **IEC 62304 applicability?** No
- **Governing standards:** Academic peer review, standard code review

**Detailed Rationale:** See `/dhf/classification-educational-simulation.md`

---

### Repository 3: reference-docs

**Description:** Technical documentation, API references, architecture guides, best practices  
**Classification:** Not Applicable  

**Harm Assessment:**  
Q: Can the software cause injury or damage to health?  
**A:** No. Documentation is technical guidance for developers. Potential indirect harm (developer misunderstands architecture → implements flawed system) is software engineering quality issue, not documentation safety.

**Regulatory Status:**
- **Is this medical device software per FDA definition?** No
- **IEC 62304 applicability?** No
- **Governing standards:** Technical documentation review, standard version control

**Detailed Rationale:** See `/dhf/classification-reference-docs.md`

---

## Classification Impact Summary

### Removed from IEC 62304 Governance
- legacy-content-repo
- educational-simulation
- reference-docs

### Still Subject to IEC 62304
- **Class B:** pedneoSim.jl, pediatric-cds (2 repos)
- **Class A:** audit-service (1 repo)

### Organization-Wide Classification Status

**Total Repositories:** 8 (3 clinical device repos + 5 non-device repos)

**Classification Coverage:** 100% (8/8 repos classified)

| Classification | Count | Repos |
|---|---|---|
| Class B | 2 | pedneoSim.jl, pediatric-cds |
| Class A | 1 | audit-service |
| Not Applicable | 5 | legacy-content-repo, educational-simulation, reference-docs, + 2 others |

---

## Governance Updates

### Traceability Gating Changes

The three newly-classified "Not Applicable" repositories are **removed from IEC 62304 traceability matrix requirements**:

- **Before:** All repos required SW-### requirement traceability (reusable-iec62304-traceability.yml)
- **After:** Only Class A/B repos (audit-service, pedneoSim.jl, pediatric-cds) require traceability matrix

This simplifies governance for educational/documentation repos while maintaining rigor for clinical device software.

### Custom Property Updates

GitHub Custom Property `iec62304-class` updated for all three repos:

```bash
gh repo edit ruralpeds/legacy-content-repo \
  --custom-properties '{"iec62304-class":"not-applicable"}'

gh repo edit ruralpeds/educational-simulation \
  --custom-properties '{"iec62304-class":"not-applicable"}'

gh repo edit ruralpeds/reference-docs \
  --custom-properties '{"iec62304-class":"not-applicable"}'
```

**Verification Status:** ✅ All three properties updated

---

## Documentation

All classification decisions documented in Design History File (DHF):

- `/dhf/classification-legacy-content-repo.md`
- `/dhf/classification-educational-simulation.md`
- `/dhf/classification-reference-docs.md`
- `/dhf/IEC62304_CLASSIFICATION_DECISION_MEETING.md` (meeting notes and framework)

---

## Compliance Scorecard Impact

**IEC 62304 Classification Completeness:**
- **Before Q2-2026:** 5/8 repos classified (62.5%)
- **After Q2-2026 Initiative 03:** 8/8 repos classified (100%)
- **Compliance Factor:** +15 points toward Q2 compliance target

**Q2 Target:** 87/100 (from Q1 baseline of 82.5/100)

---

## Approval & Signature

**Assessor:** Timothy Hartzog, Compliance Officer  
**Date:** May 2026  
**Effective Date:** May 2026  

This classification decision is final and effective. All three repositories are formally classified as "Not Applicable" to IEC 62304 and are exempt from medical device software lifecycle requirements.

**Next Steps:**
1. ✅ Classification decisions documented in DHF
2. ✅ GitHub Custom Properties updated
3. ✅ Classification decision archived in compliance-metrics
4. → Commit classification records to git
5. → Update compliance scorecard (100% classification coverage)
6. → Proceed to Initiative Q2-2: OpenSSF Scorecard Remediation

---

## Reference Documents

- **Classification Framework:** `/copilot-tasks/q2-2026-initiatives/initiative-03-classification-decision.md`
- **Assessment Meeting:** `/dhf/IEC62304_CLASSIFICATION_DECISION_MEETING.md`
- **Regulatory Reference:** FDA 21 CFR 860.3(c), IEC 62304:2015 §4.2
- **Related Initiatives:** Initiative Q2-1 (Provenance), Initiative Q2-2 (OpenSSF Remediation)
