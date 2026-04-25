# Operations Runbooks: Enterprise Medical Device Platform

**Purpose:** Step-by-step procedures for operating and maintaining the medical device platform  
**Audience:** Operations team, compliance, on-call engineers, clinical team  
**Status:** Version 1.0 — Complete for Q4 2026 deployment

---

## Runbooks Index

### 1️⃣ SDLC Release Runbook
**File:** `01-SDLC-Release-Runbook.md`

Procedures for releasing software through SDLC gates:
- Feature releases (2-4 weeks, full 8 gates)
- Patch releases (1 week, abbreviated 4 gates)
- Hotfixes (24 hours, expedited 2 gates)
- Testing, approval gates, deployment procedures
- Troubleshooting: test failures, deployment issues

**When to use:** Any code release to production

**Key steps:**
1. Create feature/fix branch
2. Implement + unit tests (≥80% coverage)
3. Code review + static analysis
4. Integration + system testing
5. Approval gates (design, implementation, V&V, release)
6. Deploy to staging → production
7. Monitor + verify

---

### 2️⃣ Incident Response Runbook
**File:** `02-Incident-Response-Runbook.md`

Procedures for responding to production incidents:
- P1 critical incidents (15 min response)
- P2 high priority (1 hour response)
- P3 medium priority (4 hour response)
- Security incident escalation
- Root cause investigation
- Post-mortem analysis

**When to use:** Any production issue affecting patient safety, system availability, or data integrity

**P1 Critical Examples:**
- System authentication bypass
- Patient data corruption
- Audit trail tampering
- System unavailability (>5% error rate)

**Key steps:**
1. Declare incident (page on-call)
2. Assess impact (patients at risk?)
3. Contain (disable feature / rollback / fix)
4. Investigate (root cause)
5. Communicate (update every 15 min)
6. Resolve (deploy permanent fix)
7. Post-mortem (within 24 hours)

**Response times:**
- P1: Page within 15 min → resolve within 1 hour
- P2: Acknowledge within 1 hour → resolve within 4 hours
- P3: Acknowledge within 4 hours → resolve within 24 hours

---

### 3️⃣ Audit Trail Verification Runbook
**File:** `03-Audit-Verification-Runbook.md`

Procedures for verifying audit trail integrity:
- Daily chain verification (2 AM UTC)
- Weekly deep-dive audit (Monday 9 AM)
- Monthly full-chain re-verification
- Quarterly FDA compliance report
- Emergency: Restore from backup

**When to use:** Scheduled daily verification + when tampering suspected

**Daily procedure:**
1. Initiate chain verification (2 AM UTC)
2. Verify Merkle hashes (every event)
3. Verify digital signatures
4. Report any discrepancies
5. Alert if tampering detected (P1 incident)

**Key capability:** Detect tampering within 24 hours maximum

**FDA benefit:** Continuous compliance monitoring ensures device integrity

---

## Operations Schedule

| Time | Frequency | Procedure | Owner |
|---|---|---|---|
| 2:00 AM UTC | Daily | Audit trail verification | On-call ops |
| 9:00 AM UTC | Monday | Weekly audit deep-dive | Compliance |
| Monthly | 1st of month | Full-chain re-verification | Compliance |
| Monthly | 1st of month | FDA compliance report | Compliance |
| As-needed | During incident | Incident response | On-call engineer |
| 2 weeks | Per release | SDLC release process | Release manager |

---

## Escalation Paths

### Severity-Based Response

```
P1 (Critical)
  ├─ Immediate: Page on-call engineer
  ├─ 5 min: Notify engineering lead
  ├─ 10 min: Notify CTO
  ├─ 15 min: Notify compliance officer
  └─ 15 min: Notify clinical team (if patient safety risk)

P2 (High)
  ├─ 1 hour: Notify on-call engineer
  ├─ 2 hours: Notify engineering lead
  └─ 4 hours: Escalate to compliance if unresolved

P3 (Medium)
  ├─ 4 hours: File ticket, notify on next standup
  └─ 24 hours: Must start investigation

P4 (Low)
  └─ File ticket for backlog prioritization
```

### Always Escalate To Compliance If:
- Patient safety at risk
- Data exposure occurred
- Audit trail integrity compromised
- Regulatory reporting required
- Device malfunction suspected

---

## Integration With Technical Flows

Each runbook ties to specific technical flows:

| Runbook | Flow 1 (SDLC) | Flow 2 (Audit) | Flow 4 (Risk) | Flow 6 (Post-Mkt) |
|---|---|---|---|---|
| Release | ✅ Gates 1-8 | ✅ Logged | ✅ Gating criteria | ✅ Monitoring |
| Incident Response | ✅ Hotfix process | ✅ Investigation | ✅ Risk assessment | ✅ Adverse events |
| Audit Verification | — | ✅ Chain integrity | — | — |

---

## Quick Start: On-Call Checklist

### First 15 Minutes (Any P1 Incident)

- [ ] Accept PagerDuty page (acknowledge)
- [ ] Open this runbook: `02-Incident-Response-Runbook.md`
- [ ] Join incident Slack channel (`#incidents`)
- [ ] Assess: Is patient safety at risk?
- [ ] If YES → Page clinical team immediately
- [ ] Understand the issue (ask: what failed?)
- [ ] Contain the issue (disable feature / rollback)
- [ ] Notify compliance officer (email + Slack)

### Next 30 Minutes

- [ ] Investigate root cause
- [ ] Implement permanent fix
- [ ] Deploy fix / verify deployment
- [ ] Monitor for recurrence
- [ ] Update incident status every 15 min

### Post-Incident (Within 24 Hours)

- [ ] Schedule post-mortem meeting
- [ ] Write post-mortem document (root cause analysis)
- [ ] Identify corrective actions
- [ ] Close PagerDuty incident

---

## Training & Certification

### Required Training
- All engineers: SDLC Release Runbook
- On-call engineers: Incident Response + Audit Verification
- Compliance: All three runbooks
- Clinical team: Incident Response (patient safety section)

### Certification
- Read runbook (30 min)
- Walk through example scenario (1 hour)
- Shadow experienced team member (1 incident)
- Lead an incident independently (sign-off)

---

## Maintenance

These runbooks are living documents. Update when:
- Process changes
- Tools change (e.g., PagerDuty → new tool)
- New incident types discovered
- FDA guidance updates
- Team members provide feedback

**Last updated:** April 25, 2026  
**Next review:** July 25, 2026 (quarterly)

---

## Related Documents

- Technical Flows: `../technical-flows/`
- FDA 510(k) submission: `../compliance-metrics/`
- Release notes: `RELEASES.md`
- Incident history: `INCIDENT_LOG.md`

