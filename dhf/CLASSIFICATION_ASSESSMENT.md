# IEC 62304 Classification Assessment — Q2-2026

**Assessment Date:** April 24, 2026  
**Assessor:** Timothy Hartzog (Compliance Officer)  
**Status:** In Progress → Target Completion May 15, 2026

## Overview

Assessment of classification status for `.github` repository and related clinical repos under IEC 62304 Software Lifecycle standard (Section 4.2).

## Repositories in Scope

### Clinical Decision Support Repos (Existing, Classified)

| Repo | Current Class | Status | Notes |
|------|---------------|--------|-------|
| pedneoSim.jl | Class B | ✅ Classified | Neonatal simulation device |
| pediatric-cds | Class B | ✅ Classified | Clinical decision support |
| audit-service | Class A | ✅ Classified | Non-clinical audit infrastructure |

### Pending Classification Repos

| Repo | Type | Current Status | Assessment |
|------|------|----------------|------------|
| legacy-content-repo | Educational content | Pending | Content only; non-device |
| educational-simulation | Reference implementation | Pending | Educational, non-clinical |
| reference-docs | Documentation | Pending | Technical docs; non-device |

### Meta Repos (Support Infrastructure)

| Repo | Type | Applicability | Notes |
|------|------|---------------|-|
| `.github` | Governance/CI-CD | N/A | Implements governance for other repos, not medical device software itself |
| mlx-models | Model cache | N/A | Dependency storage, not medical device |
| Other support repos | Build, test infra | N/A | Supporting tools, not medical devices |

---

## Classification Decision Framework

Per IEC 62304 §4.2: Software Safety Classification

**Step 1: Can the software cause injury or damage to health?**
- **No** → Class A
- **Yes, minor** → Class B  
- **Yes, serious** → Class C

**Step 2: Rationale & Controls**
- Document why harm is/isn't possible
- List controls preventing harm

**Step 3: Governance Assignment**
- Class A/B/C: Full IEC 62304 lifecycle
- Not Applicable: Standard code governance (ISO 27001, HIPAA, OpenSSF)

---

## Assessment Timeline

**Week 1 (Apr 24 – May 1):** Prepare assessment + schedule decision meeting  
**Week 2 (May 2–8):** Conduct classification meeting (1 hour); document DHF  
**Week 3 (May 9–15):** Update custom properties, commit classifications  

---

## Decision Meeting Details

**Format:** 1-hour focused assessment  
**Participants:**
- Timothy Hartzog (Compliance Officer, lead assessor)
- [Platform Engineering Lead, if available]
- [Domain expert for clinical repos context]

**Agenda:**
1. (5 min) Review classification framework (IEC 62304 §4.2)
2. (10 min) Assess `legacy-content-repo` — harm capability?
3. (10 min) Assess `educational-simulation` — clinical intent?
4. (10 min) Assess `reference-docs` — regulatory applicability?
5. (20 min) Formal decision + rationale documentation
6. (5 min) Approval + next steps

**Decision Template** (per repo):
```
# Classification Decision: [Repo Name]

**Date:** May [date], 2026  
**Assessor:** Timothy Hartzog  
**Classification:** [Class A/B/C/Not Applicable]  

## Harm Assessment
Q: Can the software cause injury or damage to health?
A: [Yes/No/Not Applicable], because [1–3 sentence rationale]

## Clinical Use Intent
[Is this intended for clinical decision-making? Yes/No]

## Regulatory Status
[Is this medical device software per FDA? Yes/No]
[IEC 62304 Applicability? Yes/No]

## Assigned Class
[A / B / C / Not Applicable]
```

---

## Expected Classifications

Based on repo descriptions:

| Repo | Expected Class | Rationale |
|------|---------------|-|
| legacy-content-repo | **Not Applicable** | Educational textbook; no clinical algorithms; no patient data |
| educational-simulation | **Not Applicable** | Reference implementation; explicitly non-clinical; no live patient use |
| reference-docs | **Not Applicable** | Documentation; no executable code; no clinical logic |

---

## Next Steps

1. **May 2–8:** Conduct 1-hour classification meeting
2. **May 2–8:** Document DHF classification files (3 repos)
3. **May 9–15:** Update GitHub Custom Property `iec62304-class` for each repo
4. **May 15:** Commit classification decision + archive in compliance-metrics
5. **May 15:** Update compliance scorecard: IEC 62304 classification complete (100%)

---

**Owner:** Timothy Hartzog, Compliance Officer  
**Next Review:** Classification decision meeting (date TBD, week of May 2–8)
