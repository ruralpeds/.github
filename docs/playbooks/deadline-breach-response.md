# Deadline Breach Response Playbook

**Status:** Phase 4A Tier 4  
**Last Updated:** May 4, 2026  
**Purpose:** Step-by-step guidance for responding to gap deadline breaches

---

## Quick Response Guide

| Escalation Level | Who | When | Action | Urgency |
|------------------|-----|------|--------|---------|
| **critical** 🚨 | Exec lead + Owner | Within 1 hour | Block release, create incident | IMMEDIATE |
| **severe** 🔴 | Team lead + Owner | Within 24 hours | Schedule 1:1, escalate | HIGH |
| **high** 🟠 | Owner | Within 48 hours | Schedule sync, reassess timeline | MEDIUM |
| **medium** 🟡 | Owner | Within 72 hours | Email status check | LOW |
| **watch** 🔵 | Owner | Weekly check-in | Monitor for escalation | NONE |

---

## 1. Critical Escalation (🚨)

**When:** Gap is 14+ days overdue AND P0 priority

### Immediate Steps (1 hour)

1. **Slack alert received** in #compliance-alerts
   ```
   🚨 CRITICAL ESCALATION: GAP-001 (P0) — 18 days overdue
   Owner: @jane-smith
   Action Required: Contact immediately
   ```

2. **Respond in Slack thread:**
   - Confirm receipt: "Acknowledged, investigating"
   - Tag owner and team lead

3. **Contact owner immediately** (Slack, email, call if severe)
   - Ask for immediate status update
   - Identify blockers: Why is it overdue?
   - Escalate decision: Can deadline be met?

### Investigation (within 1 hour)

4. **Open the repo and review the gap:**
   - URL: `https://github.com/ruralpeds/{repo}/.gap-analysis/GAP_ANALYSIS.md`
   - Check current status, last update date
   - Review PR references for progress

5. **Ask owner these questions:**
   - What's the actual status?
   - What's blocking completion?
   - Is the deadline realistic?
   - Do you need additional resources?
   - If not completable: What's the new target?

### Escalation Decision (by end of 1 hour)

6. **If gap CAN be completed by deadline:**
   - Allocate additional resources if needed
   - Update owner assignment if required
   - Post progress update to GitHub issue

7. **If gap CANNOT be completed by deadline:**
   - Schedule emergency sync with team lead
   - Decide: Extend deadline or scope reduction?
   - Get explicit approval from stakeholder
   - Update gap with new target date + reason

8. **If gap blocks release:**
   - Create incident with severity=critical
   - Notify release manager
   - Block release until resolved
   - Consider hotfix vs. delay decision

### Follow-up (within 24 hours)

9. **Post incident summary:**
   - What happened
   - Why it happened
   - What we fixed
   - Preventative measures

10. **Schedule 1:1 with owner:**
    - Discuss workload/capacity
    - Identify if this is a pattern
    - Plan to prevent future breaches

---

## 2. Severe Escalation (🔴)

**When:** Gap is 7-13 days overdue

### First Contact (within 24 hours)

1. **Escalation GitHub issue created automatically**
   - Review issue details
   - Click "View Report" link to see context

2. **Contact owner via Slack or email:**
   ```
   Hi @owner,

   Your gap GAP-042 is now 10 days overdue (due 2026-05-05).
   
   Can you provide a status update?
   - Current progress
   - Expected completion date
   - Any blockers we can help with
   
   Let's schedule a 15-min sync to discuss.
   ```

3. **If no response within 4 hours:**
   - Escalate to team lead
   - Team lead contacts owner directly

### Assessment (within 24 hours)

4. **Review owner's response:**
   - On track? Good, continue monitoring
   - Off track? Understand why
   - Blocked? Unblock or reallocate

5. **If still off track:**
   - Schedule 30-min team lead + owner sync
   - Discuss: Is deadline realistic?
   - Options:
     - Extend deadline (with approval)
     - Reduce scope
     - Allocate additional help
     - Accept slip and plan follow-up

### Decision (within 24 hours)

6. **Decide on action:**
   - If extending: Update gap, post to issue
   - If on track: Set follow-up for 3 days
   - If reallocating: Change owner, notify new owner

### Follow-up (within 72 hours)

7. **Daily check-in for next 3 days:**
   - Brief Slack message: "On track?" 
   - Look for progress in status updates
   - If no progress: Escalate to critical

---

## 3. High Escalation (🟠)

**When:** Gap is 3-6 days overdue

### Initial Check (within 48 hours)

1. **Escalation GitHub issue created**
   - Review context

2. **Email owner with link:**
   ```
   Your gap GAP-042 is overdue (3 days).
   View details: [link to issue]
   
   Please provide:
   - Current status
   - Expected completion
   - Any blockers
   
   Let me know if you need help!
   ```

3. **If no response within 24 hours:**
   - Follow up with Slack mention
   - CC team lead

### Assessment (within 48 hours)

4. **Review owner's response:**
   - Expect response within 24-48 hours
   - If responsive and on track: OK
   - If non-responsive: Escalate to severe

5. **If delayed:**
   - Request updated target date
   - Offer support (resources, unblocking, scope reduction)

### Follow-up (3 days)

6. **Check in:** "Still on track for new target?"
   - If no: Escalate to severe
   - If yes: Continue monitoring

---

## 4. Medium Escalation (🟡)

**When:** Gap is 1-2 days overdue

### Check (within 72 hours)

1. **Email owner:**
   ```
   FYI: Your gap GAP-042 is now 1 day overdue.
   
   Status: [check repo and share current status]
   
   Can you confirm expected completion date?
   ```

2. **No response needed if:**
   - Recent status update shows progress
   - Target date clearly set

3. **If unclear:**
   - Ask for update on Slack
   - Link to gap documentation

### Follow-up (weekly)

4. **Weekly check:**
   - Review status in repo
   - If still overdue after 1 week: Escalate to high

---

## 5. Watch Level (🔵)

**When:** Gap is due soon (within 7 days)

### Weekly Monitoring

1. **No action required** unless:
   - Status hasn't been updated in 7 days
   - Owner marks as blocked
   - Dependencies missing

2. **If stalled:**
   - Send friendly reminder
   - Check for blockers
   - Offer support

---

## Escalation Checklist

Use this when escalating a gap to the next level:

- [ ] Contacted owner and identified root cause
- [ ] Asked about additional resources needed
- [ ] Determined if deadline is realistic
- [ ] If extending: Got approval + updated gap
- [ ] If blocked: Identified blockers and next steps
- [ ] Notified team lead and/or stakeholders
- [ ] Posted summary to GitHub issue
- [ ] Set follow-up reminder (date + action)
- [ ] Documented reason for escalation

---

## Common Blocker Scenarios

### Scenario 1: Owner Says "I Need More Help"

**Steps:**
1. Ask: What kind of help? (Code review, design, resources, etc.)
2. Identify: Who can provide that help?
3. Allocate: Assign support resource
4. Re-target: New realistic deadline?
5. Follow-up: 3 days later, is help sufficient?

### Scenario 2: Owner Says "This Is Harder Than Expected"

**Steps:**
1. Ask: Why? What's the difficulty?
2. Brainstorm: Alternative approaches?
3. Descope: Can we reduce scope?
4. Re-estimate: What's realistic timeline now?
5. Escalate: If critical and timeline slips far, escalate

### Scenario 3: Owner Is Unresponsive

**Steps:**
1. First 24 hours: Try Slack, email, quick ping
2. Second 24 hours: Tag team lead in Slack thread
3. Third 24 hours: Team lead calls/DMs owner directly
4. If still no response: Escalate to manager
5. Consider: Is owner overwhelmed? Reassign gap?

### Scenario 4: Gap Is Blocked On Another Team

**Steps:**
1. Identify: Which team/gap is blocking?
2. Contact: Reach out to blocking team lead
3. Prioritize: Ask to unblock or accelerate
4. If blocked: Document blockers and new realistic timeline
5. Escalate: If critical path, escalate to exec

### Scenario 5: Deadline Is Truly Unrealistic

**Steps:**
1. Gather data: How much work is left? How many devs?
2. Estimate: Realistic timeline given resources
3. Options:
   - Reduce scope (prioritize MVP)
   - Extend deadline (with approval)
   - Add resources (if available)
4. Decision: Team lead + owner + stakeholder decide
5. Update: New target + reason in gap

---

## Preventing Future Breaches

After each escalation, ask:

1. **Why did this happen?**
   - Underestimated work
   - Resources unavailable
   - Unexpected complexity
   - Owner overwhelmed
   - Poor tracking

2. **How do we prevent next time?**
   - Better estimates (add buffer)
   - More frequent check-ins
   - Clearer ownership
   - Descope if needed
   - Reallocate overloaded owner

3. **Action items:**
   - Owner: [specific action]
   - Team lead: [specific action]
   - System: [if process change needed]

---

## Escalation Example Workflow

```
Day 1: Gap shows 7 days overdue (severe 🔴)
  → Escalation issue created automatically
  → Slack #compliance-alerts notified
  → Action: Email owner for status

Day 2: Owner responds "On track, just slow comms"
  → Update gap with latest status
  → Schedule 3-day check-in
  → Acknowledge in issue

Day 5: 3-day check-in: Owner hasn't updated gap
  → Gap now 10 days overdue
  → Escalate to critical 🚨
  → Call owner directly
  → Owner says needs 5 more days
  → Get team lead approval for deadline extension
  → Update gap target → 2026-05-13
  → Post to issue with new ETA

Day 10: New deadline arrived, gap marked Completed
  → Close escalation issue
  → Post "Resolution" comment
  → Document lessons learned
```

---

## Tools & Links

- **Escalation Reports:** `audit-log/escalations/escalation-*.json`
- **Live Dashboard:** docs/gap-analysis-dashboard.md
- **Enforcement Policies:** docs/deadline-enforcement.md
- **GitHub Issues:** Filter by label `deadline-escalation`
- **Slack:** #compliance-alerts (for breach notifications)

---

## Contact & Support

- **Questions:** Open issue tagged `gap-analysis`
- **Urgent:** Ping `@gap-analysis-team` in Slack
- **On-call:** Check CODEOWNERS for rotation
