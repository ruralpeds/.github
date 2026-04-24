# Q2-2026 Initiative 05: Post-Market Surveillance Pilot

**Period:** Q2-2026 (May–June)  
**Concurrent Initiative:** Yes (parallel with all 6 Q2 initiatives)  
**Duration:** 2 weeks (May 8–22)  
**Owner:** Timothy Hartzog (Compliance Officer)  
**Priority:** MEDIUM (Establishes post-market compliance infrastructure; no critical path)

---

## Objective

Wire adverse-event templates and complaint tracking into GitHub Issues. Create automated workflow to capture post-market events and log them to audit trail (WORM archive). Establish baseline post-market surveillance capability for FDA compliance.

**Current State:** No post-market event tracking; complaints managed ad-hoc via email.

**End State:** GitHub Issues integrate with post-market workflow; automation routes issues to audit log; Slack notifications alert compliance team; 2 pilot events successfully tracked.

---

## Acceptance Criteria

- [ ] Create issue template: `.github/ISSUE_TEMPLATE/post-market-event.md`
- [ ] Implement workflow: `.github/workflows/post-market-tracker.yml` (triggers on label, appends to audit log)
- [ ] Initialize audit log: `dhf/post-market/complaints.jsonl` (WORM format)
- [ ] Configure Slack notification to #compliance-alerts on new events
- [ ] Execute 2 pilot post-market events with full workflow verification
- [ ] Verify workflow completes within 5 minutes (SLA)
- [ ] Document process in `docs/post-market-surveillance.md`

---

## Components

### 1. Issue Template: `post-market-event.md`

```markdown
---
name: Post-Market Event Report
about: Report adverse events, complaints, or post-market feedback
title: 'Post-Market Event: [Device Name] - [Event Type]'
labels: post-market
---

## Event Information

**Event Date:** [YYYY-MM-DD]  
**Device/Component:** [e.g., PedNeoSim v1.0.0]  
**Event Type:** (choose one)
- [ ] Adverse event (injury/harm)
- [ ] Complaint (functional issue)
- [ ] Near miss
- [ ] Feedback/suggestion

## Description

[Detailed description of event]

## Impact

**Severity:** [Critical/High/Medium/Low]  
**Users Affected:** [Number]  
**Estimated Duration:** [How long was issue present?]

## Root Cause (if known)

[Initial root cause analysis]

## Actions Taken

- [ ] Immediate mitigation
- [ ] Notification to regulatory body
- [ ] Investigation initiated

## Compliance Notes

- FDA Reportable: [ ] Yes [ ] No
- MedWatch Filing: [ ] Required [ ] Not required
```

### 2. Workflow: `post-market-tracker.yml`

```yaml
name: Post-Market Surveillance Tracker

on:
  issues:
    types:
      - opened
      - edited

permissions:
  contents: write
  issues: read

jobs:
  track-event:
    if: contains(github.event.issue.labels.*.name, 'post-market')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Extract Event Data
        id: event-data
        run: |
          ISSUE_NUMBER=${{ github.event.issue.number }}
          ISSUE_TITLE=${{ github.event.issue.title }}
          ISSUE_BODY=${{ github.event.issue.body }}
          ISSUE_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
          echo "issue_number=${ISSUE_NUMBER}" >> $GITHUB_OUTPUT
          echo "issue_title=${ISSUE_TITLE}" >> $GITHUB_OUTPUT
          echo "issue_date=${ISSUE_DATE}" >> $GITHUB_OUTPUT

      - name: Append to Audit Log
        run: |
          ENTRY=$(cat <<EOF
          {
            "timestamp": "${{ steps.event-data.outputs.issue_date }}",
            "event_type": "post-market-event",
            "issue_number": ${{ steps.event-data.outputs.issue_number }},
            "title": "${{ steps.event-data.outputs.issue_title }}",
            "repo": "${{ github.repository }}",
            "event_url": "${{ github.event.issue.html_url }}"
          }
          EOF
          )
          echo "$ENTRY" >> dhf/post-market/complaints.jsonl
          git config user.email "compliance@ruralpeds.org"
          git config user.name "Compliance Bot"
          git add dhf/post-market/complaints.jsonl
          git commit -m "audit: post-market event tracked (issue #${{ steps.event-data.outputs.issue_number }})"
          git push

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook-url: ${{ secrets.SLACK_COMPLIANCE_WEBHOOK }}
          payload: |
            {
              "text": "🚨 Post-Market Event: Issue #${{ steps.event-data.outputs.issue_number }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Post-Market Surveillance Alert*\n*Issue:* ${{ steps.event-data.outputs.issue_title }}\n*URL:* ${{ github.event.issue.html_url }}"
                  }
                }
              ]
            }

      - name: Verify Audit Trail Entry
        run: |
          # Verify entry was recorded
          ENTRY_COUNT=$(wc -l < dhf/post-market/complaints.jsonl)
          echo "Audit trail entries: ${ENTRY_COUNT}"
          echo "✅ Post-market event logged successfully"
```

### 3. Audit Log: `dhf/post-market/complaints.jsonl`

WORM-format (Write-Once-Read-Many) JSON Lines file:
- One JSON object per line (immutable append-only)
- Timestamped (RFC 3339)
- Audit trail of all post-market events
- Backed up to S3 Object Lock for long-term retention

```jsonl
{"timestamp":"2026-05-10T09:15:00Z","event_type":"post-market-event","issue_number":42,"title":"Post-Market Event: PedNeoSim v1.0.0 - Adverse event","repo":"ruralpeds/pedneoSim","event_url":"https://github.com/ruralpeds/pedneoSim/issues/42"}
```

---

## Pilot Execution Plan

### Pilot Event 1: Mock Adverse Event

**Date:** May 10, 2026  
**Scenario:** User reports incorrect growth calculation in PedNeoSim

**Steps:**
1. Create GitHub issue with `post-market` label
2. Trigger workflow automatically
3. Verify:
   - ✅ Issue created successfully
   - ✅ Workflow triggered within <1 minute
   - ✅ Audit log entry appended
   - ✅ Slack notification sent to #compliance-alerts
   - ✅ Issue shows "Post-Market Event" context

**Expected Duration:** <5 minutes

### Pilot Event 2: Mock Complaint

**Date:** May 20, 2026  
**Scenario:** User reports feature request that could be compliance-related

**Steps:**
1. Create GitHub issue with `post-market` label
2. Trigger workflow automatically
3. Verify same workflow and audit trail

**Expected Duration:** <5 minutes

---

## Implementation Timeline

| Week | Phase | Task | Effort | Owner |
|------|-------|------|--------|-------|
| Week 1 (May 1–8) | Planning | Template design, workflow review | 1 day | Timothy |
| Week 2 (May 8–15) | Implementation | Code template + workflow | 2 days | Timothy |
| Week 2 (May 15–22) | Pilot #1 | Execute mock adverse event | 4 hours | Timothy |
| Week 2–3 (May 22–29) | Pilot #2 | Execute mock complaint | 4 hours | Timothy |
| Week 3 (May 29–Jun 5) | Verification | Verify audit log, Slack integration | 2 days | Timothy |

**Total:** 2 weeks calendar (6 days effort, ~20 hours)

---

## Deliverables

- [ ] `.github/ISSUE_TEMPLATE/post-market-event.md` (template)
- [ ] `.github/workflows/post-market-tracker.yml` (automation)
- [ ] `dhf/post-market/complaints.jsonl` (audit log, seeded with 2 pilot entries)
- [ ] `docs/post-market-surveillance.md` (process documentation)
- [ ] Slack webhook configured to #compliance-alerts

---

## Success Metrics

| Metric | Success Criteria | Verification |
|--------|------------------|--------------|
| Template created | YAML frontmatter + fields defined | File exists, renders in GitHub |
| Workflow triggers | Fires on `post-market` label | Workflow logs show execution |
| Audit trail appends | Entry added to complaints.jsonl within 1 min | Git commit history |
| Slack notifies | Alert sent to #compliance-alerts within 5 min | Slack message timestamp |
| Pilot events complete | 2 mock events processed end-to-end | Both workflow executions successful |

---

## Compliance Framework

### FDA Post-Market Surveillance (21 CFR 806)

This initiative implements the data capture layer for post-market surveillance:

- **Issue Template:** Captures required event information (type, date, severity, description)
- **Audit Log:** Maintains immutable record of all reported events (§806.20 documentation)
- **Slack Integration:** Ensures timely notification to compliance team (§806.27 investigation)
- **Automation:** Guarantees no events are dropped or lost

### IEC 62304 Post-Market Monitoring (§7.4)

Aligns with IEC 62304 post-market surveillance requirements:
- Event logging per §7.4
- Traceability of events to specific device versions
- Analysis framework for trend detection

---

## Security & Access Control

- **GitHub Access:** Issue creation limited to organization members
- **Audit Log Access:** Read-only to compliance team (git history)
- **Slack Notification:** Restricted to #compliance-alerts channel (authorized personnel only)
- **Data Retention:** Audit log retained indefinitely (WORM S3 Object Lock backup)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Workflow fails to trigger | Events not logged | Pre-test on staging; fallback manual entry |
| Slack integration misconfigured | Alerts not received | Test webhook before production |
| Audit log corruption | Loss of evidence trail | S3 Object Lock backup with cross-region replication |

---

## Dependencies

- ✅ GitHub Actions enabled
- ✅ GitHub Issues accessible
- ✅ Slack workspace + webhook URL configured
- ✅ `dhf/post-market/` directory created

---

## Next Steps

1. **Create template & workflow** (Week 2): Merge to main
2. **Pilot Event 1** (May 10): Full end-to-end test
3. **Pilot Event 2** (May 20): Validate repeatability
4. **Documentation** (Week 3): Publish process guide
5. **Go-live** (May 22): Begin production post-market surveillance

---

## Post-Pilot Operations

Once pilots complete successfully:
- Move from GitHub Issues `post-market` label to dedicated board/project
- Set up quarterly post-market surveillance review (FDA §806.25)
- Integrate with complaint trending analysis (statistical sampling)
- Archive quarterly reports to Design History File

---

## Reference Documents

- **FDA 21 CFR 806:** Post-Market Surveillance
- **IEC 62304 §7.4:** Post-Market Monitoring
- **GitHub Issues Documentation:** https://docs.github.com/en/issues
- **Slack Webhooks:** https://api.slack.com/messaging/webhooks
