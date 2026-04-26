# Q2-2026 Week 3 Execution Plan (May 22–29)
## Continuation: Initiatives Q2-2, Q2-4, Q2-5, Q2-6 Kickoff

**Period:** May 22–29, 2026 (Week 3)  
**Checkpoint Date:** May 29 (end of Week 3)  
**Status:** Planned & Ready for Execution

---

## Overview

Week 3 marks the transition from baseline assessment (Weeks 1-2) to active remediation and new initiative launch. Four of six Q2 initiatives enter execution phase:

- **Initiative Q2-2 Phase 2:** Branch protection + SBOM verification (IN PROGRESS)
- **Initiative Q2-4:** Chaos testing scenario design & execution starts
- **Initiative Q2-5:** Post-market surveillance framework design starts
- **Initiative Q2-6:** Maintenance scheduling framework starts

---

## Initiative Q2-2 Phase 2: Branch Protection & SBOM Verification

**Owner:** Platform Engineering  
**Duration:** May 22–29 (1 week)  
**Priority:** HIGH

### Actions

**Monday–Tuesday (May 22–23): Branch Protection Setup**

Repository: `legacy-content-repo`
```bash
gh repo edit ruralpeds/legacy-content-repo \
  --enable-auto-merge \
  --require-status-checks \
  --require-approvals 1 \
  --dismiss-stale-reviews false \
  --branch main
```

Repository: `educational-simulation`
```bash
gh repo edit ruralpeds/educational-simulation \
  --enable-auto-merge \
  --require-status-checks \
  --require-approvals 1 \
  --dismiss-stale-reviews false \
  --branch main
```

**Wednesday–Thursday (May 24–25): SBOM Verification in CI**

- Verify `.github/workflows/ci-content.yml` generates `sbom.json` artifact on each run
- Verify `.github/workflows/ci-julia.yml` generates `sbom.json` artifact on each run
- Pull artifacts from CI runs (5+ test runs per repo)
- Validate CycloneDX 1.4 format compliance for all SBOMs
- Document SBOM schema in compliance-metrics/sbom-verification-q2.md

**Friday (May 26): Readiness Verification**

- Test feature branch PR to both repos
- Verify CI workflow triggers ✅
- Verify branch protection prevents merge without approval + status checks ✅
- Document results in Week 3 checkpoint

### Expected Outcome
- Branch protection active on both repos
- SBOM generation verified in CI pipeline
- Projected scorecard gain: +2.0-2.5 points per repo
- Both repos approach ≥7.0 score

### Deliverables
- Branch protection rules documented (GitHub settings)
- SBOM verification report (compliance-metrics/sbom-verification-q2.md)
- Week 3 checkpoint summary

---

## Initiative Q2-4: Chaos Testing Expansion — Scenario Design

**Owner:** Platform Engineering  
**Duration:** May 22–29 (scenario design); Jun 1–5 (execution)  
**Priority:** MEDIUM

### Scenario 1: Database Failover (Replica Failure)

**Objective:** Verify system recovers when read replica becomes unavailable  
**Preconditions:**
- Primary database + 2 read replicas operational
- Application routing 20% queries to each replica

**Failure Scenario:**
1. Inject network partition: Replica B unreachable (tc command or iptables)
2. Simulate 30-second partition
3. Expected: Application detects unavailability, shifts load to Replica C
4. Verify: No customer-facing error; query latency increases <10%; no data loss

**Verification:**
- Grafana dashboard: Query latency per replica
- Application logs: Failover detection + retry logic
- Database replication lag: 0 after recovery
- MTBF metric: Incident classified as handled (no customer impact)

**Duration:** 15 min scenario + 30 min recovery observation = 45 min total

### Scenario 2: Message Queue Backpressure (Queue Saturation)

**Objective:** Verify system handles message queue saturation without data loss  
**Preconditions:**
- Message queue (RabbitMQ/Kafka) operational
- Consumer processing ~1000 msg/sec baseline

**Failure Scenario:**
1. Reduce consumer throughput: Pause consumer for 60 seconds
2. Producer continues at normal rate (message queue fills)
3. Expected: Producer detects backpressure, applies circuit breaker
4. Verify: No message loss; queue drains within 5 min of consumer resumption

**Verification:**
- Message queue depth monitoring: Peak <95% of capacity
- Producer logs: Circuit breaker activation + retry logic
- Consumer logs: Resumption and catchup
- Data consistency: All messages processed exactly-once

**Duration:** 20 min scenario + 20 min recovery = 40 min total

### Testing Schedule (Week 3 Design, Week 4 Execution)

| Date | Scenario | Owner | Duration | Result |
|------|----------|-------|----------|--------|
| Jun 1 (Mon 3 AM UTC) | Replica Failover | Platform Eng | 45 min | Documented |
| Jun 3 (Wed 3 AM UTC) | Queue Backpressure | Platform Eng | 40 min | Documented |
| Jun 5 (Fri 9 AM UTC) | Review + Metrics | Platform Eng | 30 min | MTBF updated |

---

## Initiative Q2-5: Post-Market Surveillance Framework — Design Phase

**Owner:** Timothy Hartzog (Compliance)  
**Duration:** May 22–29 (design); Jun 5-19 (implementation + pilots)  
**Priority:** MEDIUM

### Framework Components to Design

**1. GitHub Issues Template (post-market-tracker.yml)**

Standard template for adverse event reports:
```yaml
name: Adverse Event Report
description: Report a serious adverse event or complaint
title: "[ADVERSE EVENT] "
body:
  - type: dropdown
    id: severity
    attributes:
      label: Severity Level
      options:
        - CRITICAL (immediate risk to patient safety)
        - HIGH (potential serious adverse health consequence)
        - MEDIUM (temporary or reversible adverse consequence)
        - LOW (minor issue, no patient impact)
  - type: textarea
    id: description
    attributes:
      label: Event Description
      placeholder: Clinical context, timing, impact
  - type: textarea
    id: impact
    attributes:
      label: Patient Impact
      placeholder: How was the patient affected?
  - type: input
    id: report-date
    attributes:
      label: Date of Event (YYYY-MM-DD)
```

**2. Workflow: post-market-tracker.yml**

- Trigger: Issue created with label `adverse-event`
- Actions:
  - Auto-add to GitHub project (compliance-metrics/post-market-tracker)
  - Create entry in audit log: `complaints.jsonl`
  - Send Slack notification to #compliance channel
  - Escalate CRITICAL/HIGH to Compliance Officer (issue assignment)

**3. Audit Log Structure (complaints.jsonl)**

```json
{
  "timestamp": "2026-06-05T10:30:00Z",
  "event_id": "AE-2026-001",
  "severity": "HIGH",
  "description": "Algorithm returned incorrect percentile",
  "reported_by": "clinical-user",
  "patient_impact": "Patient growth trend misinterpreted; required additional assessment",
  "resolution": "Algorithm verified; no impact on other patients",
  "status": "closed",
  "workflow_id": "gh-issue-12345"
}
```

**4. Slack Integration**

- Notification format: Severity badge + Event summary + Link to GitHub issue
- Escalation: CRITICAL/HIGH issues tagged for Compliance Officer follow-up
- Weekly digest: Slack message to #compliance with all adverse events from past week

### Design Review Checkpoint (May 29)

- Template finalized and committed to `.github/ISSUE_TEMPLATE/`
- Workflow logic documented
- Audit log schema defined
- Slack integration design reviewed

---

## Initiative Q2-6: Maintenance Window Optimization — Schedule Design

**Owner:** Timothy Hartzog (Compliance)  
**Duration:** May 22–29 (design); Jun 19-26 (publication)  
**Priority:** MEDIUM

### Maintenance Schedule Framework

**Standard Maintenance Window**
- **Time:** Sunday 2:00 AM – 4:00 AM UTC
- **Frequency:** Weekly (every Sunday)
- **Duration:** 2 hours
- **Impact:** All non-critical services eligible for maintenance

**Blackout Periods (No Maintenance Allowed)**
- Monday–Friday 6:00 AM – 6:00 PM UTC (business hours, US Eastern)
- Saturday 12:00 PM – 8:00 PM UTC (weekend usage peak)
- Clinical usage hours (facility-specific, to be collected from stakeholders)

**Emergency Maintenance**
- Allowed outside scheduled window only for:
  - Critical security patches (CVSS ≥9.0)
  - Data loss prevention
  - Compliance requirement (regulatory order)
- Requires Compliance Officer approval + stakeholder notification

### SLO Integration

**Availability SLO:** 99.9% uptime = 43.2 min downtime/month allowed

**Maintenance Budget:** 2 hours/week × 4 weeks = 8 hours/month = 480 min

**SLO Impact Calculation:**
- Planned maintenance window: 2 hours × 4 = 8 hours/month
- Scheduled within non-critical hours: Does NOT count against 99.9% SLO (excluded)
- Emergency maintenance: Counts against SLO if unplanned
- Target: Zero unplanned downtime (emergency maintenance avoided)

### Deliverables (Week 5: Jun 19-26)

1. **docs/maintenance-schedule-2026.md** — Published calendar with dates, times, services affected
2. **Calendar invitations** — iCal feed for all stakeholders (clinical users, providers, integrations)
3. **Stakeholder notification** — Email/Slack message 1 week in advance for each window
4. **SLO documentation** — Updated SLO target with maintenance exclusions

---

## Week 3 Resource Allocation

| Initiative | Task | Owner | Hours | Status |
|-----------|------|-------|-------|--------|
| Q2-2 Phase 2 | Branch protection + SBOM verification | Platform Eng | 8 | Starting |
| Q2-4 | Chaos scenario design (2 scenarios) | Platform Eng | 6 | Starting |
| Q2-5 | Post-market template + workflow design | Timothy H. | 5 | Starting |
| Q2-6 | Maintenance schedule framework design | Timothy H. | 3 | Starting |
| **Total** | | | **22 hours** | |

---

## May 29 Checkpoint Expectations

### Initiative Q2-2
- ✅ Branch protection enabled on both repos
- ✅ SBOM verification in progress (5+ artifact validations)
- ⏳ Initial scorecard re-run scheduled for June 5

### Initiative Q2-4
- ✅ Scenario 1 (Replica Failover) design complete
- ✅ Scenario 2 (Queue Backpressure) design complete
- ⏳ Execution scheduled for Jun 1–5

### Initiative Q2-5
- ✅ Template (`post-market-tracker.yml`) designed
- ✅ Workflow logic documented
- ✅ Audit log schema finalized
- ⏳ Implementation begins Jun 5

### Initiative Q2-6
- ✅ Maintenance window framework designed
- ✅ SLO integration verified
- ⏳ Publication scheduled for Jun 19-26

### Compliance Score Progress
- **May 15 baseline:** 85.3/100
- **May 29 projection:** 85.5/100 (branch protection +0.2 points)
- **June 5 target:** 86.5/100 (scorecard remediation + chaos execution)
- **June 30 target:** 87.0/100 (all initiatives complete)

---

## Next Checkpoint
**June 15, 2026 (Midpoint Review)**
- Verify all four initiatives on track
- Address any blockers discovered in Weeks 3-4
- Confirm June 30 closure is achievable

