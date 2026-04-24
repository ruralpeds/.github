# Q2-2026 Execution Summary: 6 Concurrent Initiatives

**Period:** May 1 – June 30, 2026  
**Compliance Target:** Score 87/100 (from 82.5/100)  
**Status:** Ready for launch  

---

## Initiative Roadmap at a Glance

| # | Initiative | Owner | Duration | Priority | Status |
|---|-----------|-------|----------|----------|--------|
| 1 | SLSA v1 Provenance Backfill | Timothy H. | 1 week | HIGH | 📋 Detailed plan ready |
| 2 | OpenSSF Scorecard Remediation | Eng Team | 2 weeks | MEDIUM | 📋 Detailed plan ready |
| 3 | IEC 62304 Classification Decision | Timothy H. | 1 week | HIGH | 📋 Detailed plan ready |
| 4 | Chaos Testing Expansion | Eng Team | 2 weeks | MEDIUM | 📋 Summary below |
| 5 | Post-Market Surveillance Pilot | Timothy H. | 2 weeks | MEDIUM | 📋 Summary below |
| 6 | Maintenance Window Optimization | Ops Lead | 1 week | LOW | 📋 Summary below |

---

## Initiative 04: Chaos Testing Expansion

**Goal:** Improve MTBF from 28.4 → 35+ days by increasing chaos experiment frequency

**Owner:** Platform Engineering  
**Duration:** 2 weeks (May 8–22)  
**Actions:**
- Convert `reusable-chaos-test.yml` from weekly → bi-weekly schedule
- Add 2 new chaos scenarios: database failover, message queue backpressure
- Update runbooks for each scenario
- Execute 2 chaos runs; document findings

**Success:** MTBF improves to ≥30 days by Q3 start (July 1)

**Deliverables:**
- `.github/workflows/reusable-chaos-test.yml` (updated schedule)
- Runbooks: `docs/chaos-runbooks/` (new scenarios)
- Execution reports: `compliance-metrics/chaos-results-q2-2026.md`

**Effort:** ~40 hours (eng team)

---

## Initiative 05: Post-Market Surveillance Pilot

**Goal:** Wire adverse-event templates and complaint tracking into GitHub Issues

**Owner:** Timothy Hartzog (Compliance Officer)  
**Duration:** 2 weeks (May 8–22)  
**Actions:**
- Create `.github/ISSUE_TEMPLATE/post-market-event.md` (issue template)
- Create automation: on issue creation with label `post-market`, append stub to `dhf/post-market/complaints.jsonl`
- Set up Slack notification to #compliance-alerts on new post-market events
- Pilot with 2 mock post-market events; verify workflow executes within 5 min
- Go-live approval (May 22)

**Success:** Post-market issue → audit log entry verified within 5 min for 2 test events

**Deliverables:**
- `.github/ISSUE_TEMPLATE/post-market-event.md` (template)
- `.github/workflows/post-market-tracker.yml` (automation)
- `dhf/post-market/complaints.jsonl` (database, seeded with 2 pilot entries)
- Slack webhook integration configured

**Effort:** ~20 hours

---

## Initiative 06: Maintenance Window Optimization

**Goal:** Adjust maintenance scheduling to fall outside SLO monitoring windows; prevent 99.9% availability gap

**Owner:** Ops Lead (async contribution)  
**Duration:** 1 week (May 15–22)  
**Actions:**
- Review current maintenance schedule (collect from Ops Lead)
- Identify SLO monitoring windows (typically continuous for critical repos)
- Propose new schedule: maintenance on Sunday 2–4 AM UTC (off-peak)
- Document in `docs/maintenance-schedule.md`
- Publish calendar invites to team

**Success:** Q2 maintenance windows: zero SLO violations (0% unavailability in monitoring windows)

**Deliverables:**
- `docs/maintenance-schedule.md` (published schedule, Q2–Q4 2026)
- Calendar events (Google Calendar / Outlook shared)

**Effort:** ~8 hours

---

## Parallel Execution Timeline

```
May 1 ─────────────────────────────────────────────────────── June 30

Initiative 1 (Provenance Backfill)
  ├─ Days 1–2: Identify releases, rebuild context
  ├─ Days 2–3: Generate SLSA v1 provenance (async)
  └─ Days 4–5: Verify + document
  └─ May 1–15 (parallel with 2–6)

Initiative 2 (OpenSSF Remediation)
  ├─ Days 1–2: Gap assessment, planning
  ├─ Days 2–5: Implement CI, branch protection, SBOM
  ├─ Days 5–7: Verification, verification
  └─ May 1–22 (parallel with 1,3–6)

Initiative 3 (IEC 62304 Classification)
  ├─ Day 1: Prepare assessment framework
  ├─ Day 2: Conduct meeting (1 hour)
  ├─ Days 2–3: Document DHF + update properties
  └─ May 2–15 (short duration, early completion)

Initiative 4 (Chaos Testing Expansion)
  ├─ Days 1–3: Update schedule, add new scenarios
  ├─ Days 4–10: Execute chaos runs (async, bi-weekly)
  └─ May 8–22 (parallel with all)

Initiative 5 (Post-Market Surveillance Pilot)
  ├─ Days 1–3: Create templates, automation
  ├─ Days 4–7: Pilot with 2 mock events
  └─ May 8–22 (parallel with all)

Initiative 6 (Maintenance Window Optimization)
  ├─ Days 1–2: Collect current schedule
  ├─ Days 3–4: Propose new schedule
  └─ Days 5–7: Publish calendar
  └─ May 15–22 (short duration, late start ok)

June 1–30: Verification phase
  ├─ Track completion status
  ├─ Run verification tests (OpenSSF re-score, Scorecard verification)
  ├─ Finalize Q2 compliance assessment
  └─ Prepare for Q3 (July 15) review
```

---

## Critical Path & Dependencies

**Critical Path (blocks other work):**
1. Initiative 3 (Classification decision) — Must complete by May 15 to unblock governance updates
2. Initiative 1 (Provenance backfill) — Must complete by May 31 for FDA readiness
3. Initiative 2 (OpenSSF remediation) — Must complete by June 15 to finalize scorecard for audit

**Independent Parallel Work:**
- Initiative 4 (Chaos testing) — Can run in background; no blockers
- Initiative 5 (Post-market surveillance) — Can run in background; no blockers
- Initiative 6 (Maintenance optimization) — Low priority; completion not blocking others

---

## Weekly Checkpoints

**May 1 (Week 1 start):** All 6 initiatives launch
- Initiative 1: Gap analysis phase
- Initiative 2: Kickoff planning
- Initiative 3: Prepare assessment
- Initiative 4: Update chaos schedule
- Initiative 5: Create templates
- Initiative 6: Collect ops data

**May 8 (Week 2 checkpoint):**
- Initiative 1: SLSA v1 provenance generation in progress
- Initiative 2: CI workflows added, testing
- Initiative 3: Classification decision completed ✅
- Initiative 4: Bi-weekly chaos schedule active
- Initiative 5: Pilot event testing in progress
- Initiative 6: New maintenance schedule drafted

**May 15 (Week 3 checkpoint):**
- Initiative 1: Backfill verification in progress
- Initiative 2: SBOM + branch protection merged
- Initiative 3: DHF classification files committed ✅
- Initiative 4: First bi-weekly chaos run completed
- Initiative 5: Pilot automation verified
- Initiative 6: Calendar published ✅

**May 22 (Week 4 checkpoint):**
- Initiative 1: Attestations verified, documented ✅
- Initiative 2: Scorecard re-verification in progress
- Initiative 3: Custom properties updated ✅
- Initiative 4: Second chaos run completed
- Initiative 5: Go-live approval granted ✅
- Initiative 6: Schedule in effect ✅

**June 1–15 (Weeks 5–6):**
- Initiative 2: Final OpenSSF verification (≥7.0 confirmed)
- Initiative 1: Compliance scorecard updated (provenance 95%)
- Overall Q2 compliance assessment finalized

**June 30 (Q2 end):**
- ✅ All 6 initiatives completed
- ✅ Compliance score target 87/100 achieved (from 82.5)
- ✅ Q2-2026 review meeting scheduled (July 15)

---

## Success Criteria (Q2 Completion)

✅ **Initiative 1:** All 5 Phase 1–2 releases have SLSA v1 provenance (verified)  
✅ **Initiative 2:** Both legacy-content-repo + educational-simulation ≥7.0 scorecard  
✅ **Initiative 3:** All 3 repos formally classified (Not Applicable, documented in DHF)  
✅ **Initiative 4:** Bi-weekly chaos testing active; MTBF ≥30 days  
✅ **Initiative 5:** Post-market surveillance automation live; 2 pilot events successful  
✅ **Initiative 6:** Maintenance schedule optimized; zero SLO violations in Q2  

**Overall Q2 Target:** Compliance score 87/100 (from 82.5)

---

## Resource Allocation

| Role | Total Q2 Effort | Initiatives |
|------|-----------------|------------|
| Timothy H. (Compliance Officer) | ~60 hours | 1, 3, 5 |
| Platform Eng Team | ~80 hours | 2, 4 |
| Ops Lead (async) | ~8 hours | 6 |
| **Total** | **~148 hours** | **All 6** |

**Calendar Time:** 8 weeks (May 1 – June 30)  
**FTE Effort:** ~3.7 weeks (one full-time person for entire Q2)  
**Parallel Execution Efficiency:** 148 hours ÷ 8 weeks ÷ 40 hrs/week = ~4.6 FTE-weeks needed, achieved via parallelization

---

## Next Review

**Q2-2026 Midpoint Checkpoint:** June 15, 2026
- Verify progress on all 6 initiatives
- Flag any blockers or risks
- Adjust timeline if needed

**Q2-2026 Closure Review:** July 15, 2026
- Final compliance scorecard (target 87/100)
- Lessons learned (what worked, what didn't)
- Transition to Q3-2026 initiatives (FMEA, EHR integration, FDA readiness)

---

## Commitment & Approval

**Q2-2026 Execution Plan approved by:**

- **Timothy Hartzog** — Compliance Officer (Initiatives 1, 3, 5)
- **Platform Engineering Lead** — (Initiatives 2, 4)
- **Ops Lead** — (Initiative 6, async)

**Approval Date:** April 24, 2026  
**Effective Start:** May 1, 2026  
**Target Completion:** June 30, 2026

---

## Links to Detailed Plans

- **Initiative 01:** `copilot-tasks/q2-2026-initiatives/initiative-01-provenance-backfill.md`
- **Initiative 02:** `copilot-tasks/q2-2026-initiatives/initiative-02-openssf-remediation.md`
- **Initiative 03:** `copilot-tasks/q2-2026-initiatives/initiative-03-classification-decision.md`
- **Initiative 04–06:** (Summary above; full plans in next commit)

---

**Ready for Q2-2026 execution. All initiatives approved. Launch date: May 1, 2026.**
