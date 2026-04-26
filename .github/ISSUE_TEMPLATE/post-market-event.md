---
name: Post-Market Event Report
about: Report adverse events, complaints, or post-market feedback for FDA-regulated devices
title: "Post-Market Event: [Device/Version] — [Event Type]"
labels: post-market
assignees: ""
---

<!--
  This template captures post-market surveillance events per:
    - 21 CFR Part 806 (Medical Device Reports)
    - IEC 62304 §7.4 (Software Post-Market Monitoring)
  
  All fields are required. The post-market-tracker.yml workflow will
  automatically append this report to dhf/post-market/complaints.jsonl.
-->

## Event Information

**Event Date:** <!-- YYYY-MM-DD -->  
**Report Date:** <!-- YYYY-MM-DD (today) -->  
**Device / Component:** <!-- e.g., PedNeoSim v1.2.0 / rust-sci-core v0.9.1 -->  
**Software Version (git SHA or tag):** <!-- e.g., v1.2.0 / abc1234 -->

**Event Type:** *(select one)*
- [ ] Adverse event — patient injury or potential injury
- [ ] Complaint — device did not perform as expected
- [ ] Near miss — failure that did not reach patient
- [ ] Malfunction — device malfunction without known patient impact
- [ ] Feedback / suggestion — improvement opportunity

---

## Description

<!-- Provide a detailed, factual description of what happened.
     Include: what the user was doing, what the device did, what was expected. -->

---

## Patient / User Impact

**Severity:** *(select one)*
- [ ] Critical — actual or potential serious injury / death
- [ ] High — significant malfunction; clinical decision affected
- [ ] Medium — malfunction; workaround available
- [ ] Low — minor inconvenience; no clinical impact

**Users / Patients Affected:** <!-- Number or "Unknown" -->  
**Clinical Setting:** <!-- e.g., NICU, outpatient, simulation lab -->  
**Estimated Duration Issue Was Present:** <!-- e.g., "since v1.1.0 release on 2026-03-01" -->

---

## Root Cause (if known)

<!-- Initial analysis. Leave blank if investigation is pending. -->

---

## Actions Taken

- [ ] Immediate mitigation applied (describe below)
- [ ] Users / sites notified
- [ ] Investigation initiated (assign to team member)
- [ ] Fix identified and in progress
- [ ] Fix deployed / patch released

**Mitigation details:**

<!-- Describe any immediate steps taken (e.g., "disabled feature flag X", "issued advisory"). -->

---

## Regulatory Disposition

**FDA Reportable (21 CFR 803)?**
- [ ] Yes — MedWatch filing required within 30 calendar days
- [ ] No — documented rationale: <!-- explain why not reportable -->
- [ ] Under evaluation — pending initial investigation

**IEC 62304 §7.4 Trend Analysis Required?**
- [ ] Yes — this event is part of a pattern (≥3 similar complaints)
- [ ] No

**Corrective Action (CAPA) Needed?**
- [ ] Yes — open CAPA issue and link here: #
- [ ] No

---

## Traceability

**Related Software Requirements:** <!-- e.g., SW-042, SW-107 -->  
**Related Hazard / Risk Control:** <!-- e.g., HZ-003, RC-007 -->  
**Related GitHub Issues / PRs:** <!-- link any code-level issues -->

---

## Attachments

<!-- Attach logs, screenshots, or reproduction steps as files.
     Do NOT attach files containing real patient data (PHI/ePHI). -->
