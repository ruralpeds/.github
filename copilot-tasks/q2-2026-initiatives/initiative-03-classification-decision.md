# Q2-2026 Initiative 03: IEC 62304 Classification Decision

**Period:** Q2-2026 (May–June)  
**Concurrent Initiative:** Yes (parallel with 5 other Q2 initiatives, can start immediately)  
**Duration:** 1 week (3 days decision + documentation)  
**Owner:** Timothy Hartzog (Compliance Officer) + Domain Experts  
**Priority:** HIGH (Critical Path: finalizes clinical repo governance, enables DHF closure)

---

## Objective

Formal safety classification decision for 3 pending repositories under IEC 62304 standard:

1. `legacy-content-repo` — Educational textbook content, no executable logic
2. `educational-simulation` — Reference simulation implementation, not clinical use
3. `reference-docs` — Technical documentation/reference guide

**Current State:** All 3 repos await classification (likely Class A: no capability for harm).

**End State:** Each repo has:
- Formal classification documented in DHF (`dhf/classification.md`)
- GitHub Custom Property `iec62304-class` updated
- Classification decision record in compliance archive

---

## Acceptance Criteria

- [ ] Safety assessment meeting conducted (1 hour, documented)
- [ ] Classification decision for each of 3 repos (Class A/B/C or Not Applicable)
- [ ] Written rationale for each classification (in `dhf/classification.md` per repo)
- [ ] GitHub Custom Properties updated for each repo
- [ ] Classification record committed + archived in compliance-metrics/
- [ ] If any repo classified as Class A or higher: add to IEC 62304 governance (traceability gating, etc.)

---

## Classification Framework (IEC 62304 §4.2)

**Step 1: Harm Assessment**
- Can the software cause injury or damage to health? 
  - **No** → Class A
  - **Yes, minor** → Class B
  - **Yes, serious** → Class C

**Step 2: Document Rationale**
- Why can/cannot harm occur?
- What controls prevent harm (if any)?
- Is clinical use intended?

**Step 3: Assign Class**
- Class A: Software cannot cause harm (or is not medical device software)
- Class B: Software can cause minor harm; nonimmediately life-threatening
- Class C: Software can cause serious harm; immediate threat to life

---

## Per-Repo Assessment

### Repo 1: `legacy-content-repo`

**Description:** Educational textbook content, historical archives, reference materials. No executable code, no calculations, no clinical algorithms.

**Harm Assessment:**
- **Q: Can software cause injury or damage to health?** NO
  - Content is static text/images (Markdown, PDF, images)
  - No executable code (shell scripts, binaries, etc.)
  - No clinical algorithms (dose calc, risk assessment, decision trees)
  - No patient data processing
  - No integration with clinical systems
  - Potential harm: misinformation in textbook → clinical decision error → but this is editorial responsibility, not software safety

**Classification Rationale:**
- **Not Medical Device Software** per FDA definition (no system/software intended to diagnose, cure, mitigate, treat, or prevent disease)
- Software not critical to clinical care decision
- Textbook content subject to editorial review, not clinical validation
- IEC 62304 applicability: **NOT APPLICABLE**
- Governance: Information governance only (HIPAA confidentiality if PHI-related, which it is not)

**Assigned Class:** **Not Applicable** (or Class A if treating as informational software)

**Recommendation:** Mark as "Not Applicable" with clear documentation that this is educational content, subject to editorial governance, not medical device software lifecycle.

---

### Repo 2: `educational-simulation`

**Description:** Reference implementation of neonatal growth simulator; educational tool for learning simulation methodology, not intended for clinical decision support.

**Harm Assessment:**
- **Q: Can software cause injury or damage to health?** NO
  - Explicitly not intended for clinical use
  - Educational/reference only; teaching tool
  - No patient data input; no clinical integration
  - No dosing, diagnostic, or therapy recommendations
  - Output is growth curves/reference charts for **learning**, not patient care
  - Potential harm: student misunderstands simulation behavior → learns wrong concept → but this is educational effectiveness, not software safety

**Classification Rationale:**
- **Not Medical Device Software** (explicitly non-clinical, educational intent)
- Similar to academic research software: not subject to FDA oversight
- Not intended for clinical decision-making
- IEC 62304 applicability: **NOT APPLICABLE**
- Governance: Academic/educational governance, peer review, quality assurance

**Assigned Class:** **Not Applicable**

**Recommendation:** Mark as "Not Applicable" with documentation that this is reference/educational software, explicitly non-clinical.

---

### Repo 3: `reference-docs`

**Description:** Technical documentation, API references, architecture guides, best practices. No executable code, no clinical content.

**Harm Assessment:**
- **Q: Can software cause injury or damage to health?** NO
  - Documentation only; no clinical algorithms or patient data
  - Provides guidance to developers, not end-users
  - Harm is indirect (if developer misunderstands architecture → builds bad system), but software itself is documentation

**Classification Rationale:**
- **Not Medical Device Software** (documentation/guidance, not a system/software)
- Similar to standards documents, textbooks
- Not critical to clinical safety (if docs are wrong, code review catches it)
- IEC 62304 applicability: **NOT APPLICABLE**
- Governance: Technical documentation review, version control

**Assigned Class:** **Not Applicable**

**Recommendation:** Mark as "Not Applicable"; documentation subject to technical review, not clinical validation.

---

## Classification Decision Meeting

**Meeting Structure:** 1 hour, documented

**Attendees:**
- Timothy Hartzog (Compliance Officer)
- Platform Engineering Lead (if available)
- Domain expert (for PedNeoSim context, if applicable)

**Agenda:**

| Time | Topic | Owner |
|------|-------|-------|
| 0:00–0:05 | Intro: IEC 62304 classification framework | Timothy |
| 0:05–0:15 | Review `legacy-content-repo` | Group |
| 0:15–0:25 | Review `educational-simulation` | Group |
| 0:25–0:35 | Review `reference-docs` | Group |
| 0:35–0:55 | Decision discussion + rationale documentation | Group |
| 0:55–1:00 | Summary + approval | Timothy |

**Decision Record Template:**

```markdown
# IEC 62304 Classification Decision

**Repo:** [name]  
**Date:** May 2026  
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

## Implementation: Document & Commit

### Step 1: Create DHF Classification Files (1 hour)

For each of 3 repos, create `dhf/classification.md`:

**Example (legacy-content-repo):**

```markdown
# Software Safety Classification (IEC 62304 §4.2)

**Repository:** legacy-content-repo  
**Classification Date:** May 2026  
**Assigned Class:** Not Applicable  

## Decision Rationale

This repository contains educational textbook content, historical references, and technical documentation. 
It is not medical device software per FDA definition (21 CFR 860.3(c)) because:

1. **No intended use for medical diagnosis or therapy:** Content is educational reference material
2. **No patient interaction:** No patient data input, output, or processing
3. **No clinical integration:** No integration with clinical systems or workflows
4. **Static content:** Text, images, and diagrams; no executable algorithms

### Harm Assessment

**Q: Can the software cause injury or damage to health?**

**A:** No. Content is educational/informational. Potential indirect harm (reader misunderstands content → 
makes poor clinical decision) is editorial responsibility, not software safety. Mitigated through peer 
review and editorial processes, not software validation.

## Governing Standards

- Not subject to IEC 62304 (medical device software lifecycle)
- Subject to HIPAA if content includes PHI (none in scope)
- Subject to ISO 27001 information security governance

## Approval

**Timothy Hartzog, Compliance Officer**  
**Date: May 2026**  
**Effective Date: [approval date]**
```

---

### Step 2: Update GitHub Custom Properties (30 min)

For each repo, update the `iec62304-class` custom property:

```bash
# legacy-content-repo
gh repo edit ruralpeds/legacy-content-repo \
  --custom-properties '{"iec62304-class":"not-applicable"}'

# educational-simulation  
gh repo edit ruralpeds/educational-simulation \
  --custom-properties '{"iec62304-class":"not-applicable"}'

# reference-docs
gh repo edit ruralpeds/reference-docs \
  --custom-properties '{"iec62304-class":"not-applicable"}'
```

**Verification:**
```bash
gh api repos/ruralpeds/legacy-content-repo \
  --jq '.custom_properties.iec62304-class'
# Expected output: "not-applicable"
```

---

### Step 3: Archive Classification Decision (30 min)

Create summary file: `compliance-metrics/iec62304-classification-q2-2026.md`

```markdown
# IEC 62304 Classification Decisions — Q2-2026

**Decision Date:** May 2026  
**Assessor:** Timothy Hartzog (Compliance Officer)  
**Status:** ✅ COMPLETED

## Summary

Three pending repositories assessed for IEC 62304 applicability. All determined to be **Not Applicable** 
(non-medical-device software).

| Repo | Class | Rationale |
|------|-------|-----------|
| legacy-content-repo | Not Applicable | Educational textbook; no clinical algorithms |
| educational-simulation | Not Applicable | Reference implementation; explicitly non-clinical |
| reference-docs | Not Applicable | Documentation; no executable code |

## Next Steps

All 5 clinical repos now classified:
- Class B: pedneoSim.jl, pediatric-cds (2 repos)
- Class A: audit-service (1 repo)
- Not Applicable: legacy-content, educational-simulation, reference-docs (3 repos)

Compliance scorecard updated: IEC 62304 classification complete (100% of repos classified).
```

---

### Step 4: Commit Classification Records (30 min)

```bash
# Add all classification files
git add \
  legacy-content-repo/dhf/classification.md \
  educational-simulation/dhf/classification.md \
  reference-docs/dhf/classification.md \
  compliance-metrics/iec62304-classification-q2-2026.md

# Update custom properties (done via gh CLI, will be reflected in repo settings)

git commit -m "docs: IEC 62304 classification decision — 3 repos determined Not Applicable

Completed classification assessment per IEC 62304 §4.2:
- legacy-content-repo: Not Applicable (educational content, no clinical intent)
- educational-simulation: Not Applicable (reference impl, explicitly non-clinical)
- reference-docs: Not Applicable (documentation, no algorithms)

All classification decisions documented in DHF (dhf/classification.md per repo).
GitHub Custom Property 'iec62304-class' updated for each repo.

Compliance status: 100% of 68 org repos now classified.
Outstanding items: 0 (all repos have formal classification decision)."
```

---

## Timeline

| Day | Task | Effort | Owner |
|------|------|--------|-------|
| Day 1 | Prepare assessment framework + agenda | 1 hour | Timothy |
| Day 2 | Conduct classification meeting (1 hour) | 1 hour | Timothy + Group |
| Day 2–3 | Document DHF classification files (3 repos) | 1.5 hours | Timothy |
| Day 3 | Update custom properties + archive decision | 1 hour | Timothy |
| Day 3 | Commit + verification | 30 min | Timothy |

**Total:** 1 week calendar (3 days effort), 5 hours total

---

## Success Metrics

- ✅ All 3 repos have formal classification decision documented
- ✅ Classification rationale recorded in DHF
- ✅ GitHub Custom Property `iec62304-class` updated for all repos
- ✅ Classification decision archived in compliance-metrics
- ✅ Compliance scorecard: IEC 62304 classification complete (100%)

---

## Expected Outcome

**All 3 repos classified as "Not Applicable"** (non-medical-device software):
- Removes from IEC 62304 traceability gating (no traceability matrix required)
- Simplifies governance (subject to standard code review, not clinical validation)
- Closes Q1 compliance gap (3 pending classifications → 0)

---

## Dependencies

- Access to repo settings (GitHub admin)
- Domain knowledge of each repo's purpose
- IEC 62304 standard reference (Section 4.2)

---

## Output Artifacts

- `[repo]/dhf/classification.md` (3 files)
- `compliance-metrics/iec62304-classification-q2-2026.md` (decision summary)
- Updated GitHub Custom Properties (via gh CLI)
- Git commit with classification decision

---

## Next Step

Once classification decision is committed (May 8–15), update compliance scorecard and proceed to **Initiative 04: Chaos Testing Expansion**.
