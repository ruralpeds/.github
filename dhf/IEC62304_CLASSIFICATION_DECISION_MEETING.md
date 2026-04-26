# IEC 62304 Classification Decision Meeting — Q2-2026

**Meeting Date:** May 2–8, 2026  
**Duration:** 1 hour  
**Location:** [Virtual/In-person]  
**Attendees:** Timothy Hartzog (Compliance Officer), Domain Experts  
**Purpose:** Formal safety classification decision for 3 pending repositories under IEC 62304 standard

---

## Meeting Agenda

| Time | Topic | Duration | Owner |
|------|-------|----------|-------|
| 0:00–0:05 | Introduction: IEC 62304 Classification Framework | 5 min | Timothy |
| 0:05–0:15 | Review: legacy-content-repo | 10 min | Group |
| 0:15–0:25 | Review: educational-simulation | 10 min | Group |
| 0:25–0:35 | Review: reference-docs | 10 min | Group |
| 0:35–0:55 | Decision Discussion & Rationale | 20 min | Group |
| 0:55–1:00 | Summary & Approval | 5 min | Timothy |

---

## Pre-Meeting Preparation

**Framework Review:**
- IEC 62304 §4.2 Harm Assessment Criteria
- FDA 21 CFR 860.3(c) Definition of Medical Device Software
- Classification Decision Template (provided below)

**Per-Repo Assessment:**
See detailed assessments in initiative-03-classification-decision.md

---

## Classification Decision Template

```markdown
# IEC 62304 Classification Decision — [Repo Name]

**Repository:** [name]  
**Classification Date:** May 2026  
**Assessor(s):** Timothy Hartzog, [others]  
**Classification:** [Class A/B/C/Not Applicable]

## Harm Assessment

**Q: Can the software cause injury or damage to health?**  
Answer: [yes/no/not applicable]

**Rationale:** [1–3 sentences explaining why harm is/isn't possible]

## Clinical Use Intent

- Intended for clinical decision-making? [yes/no]
- If yes: what decisions/diagnoses?
- If no: what is intended use?

## Regulatory Status

- Is this medical device software per FDA definition? [yes/no]
- IEC 62304 applicability? [yes/no]
- Governing standard(s)? [IEC 62304 / HIPAA / ISO 27001 / other]

## Assigned Class

**Class:** [A / B / C / Not Applicable]

## Controls & Verification (if Class A/B/C)

[Only if class A or higher; list key controls]

## Approval

**Signature:** Timothy Hartzog, Compliance Officer  
**Date:** May 2026  
**Effective Date:** [approval date]
```

---

## Expected Outcomes

**Repo 1: legacy-content-repo**
- Classification: **Not Applicable**
- Rationale: Educational content, no executable code, no clinical algorithms
- Impact: Removes from IEC 62304 traceability gating

**Repo 2: educational-simulation**
- Classification: **Not Applicable**
- Rationale: Reference implementation, explicitly non-clinical
- Impact: Removes from IEC 62304 traceability gating

**Repo 3: reference-docs**
- Classification: **Not Applicable**
- Rationale: Documentation only, no clinical content
- Impact: Removes from IEC 62304 traceability gating

---

## Post-Meeting Deliverables

1. Classification decision documented for each repo (DHF)
2. GitHub Custom Property `iec62304-class` updated
3. Classification decision archived in compliance-metrics
4. Git commit with classification records
5. Compliance scorecard updated (100% of repos classified)

---

## Meeting Notes

[To be filled during meeting]

---

## Approval Sign-Off

**Timothy Hartzog, Compliance Officer**  
**Date: [Meeting Date]**  
**Effective Date: May 2026**
