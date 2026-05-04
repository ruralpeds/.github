# Gap Analysis Slack Notifications — Setup Guide

**Document Version:** 1.0  
**Created:** 2026-05-04  
**Status:** Active

This guide explains how to set up Slack notifications for the gap-analysis system.

---

## Overview

The gap-analysis governance system sends Slack notifications for:
- **Daily aging checks** — Gaps exceeding age thresholds
- **Release blockers** — When release gates are violated
- **Gap ownership** — When gaps are assigned to teams
- **Status changes** — When gap status is updated

All notifications go to `#gap-analysis-alerts` channel.

---

## Quick Setup

### 1. Create Slack Webhook

1. Go to your Slack workspace
2. Visit [api.slack.com/apps](https://api.slack.com/apps)
3. Click **Create New App**
4. Choose **From scratch**
   - App name: `Gap Analysis Alerts`
   - Workspace: Select your workspace
5. Click **Create App**

### 2. Enable Incoming Webhooks

1. In your app, go to **Incoming Webhooks**
2. Toggle **Activate Incoming Webhooks** to **On**
3. Click **Add New Webhook to Workspace**
4. Select channel: **#gap-analysis-alerts** (or create it)
5. Click **Allow**
6. Copy the **Webhook URL** (format: `https://hooks.slack.com/services/T.../B.../...`)

### 3. Add Webhook to GitHub Secret

In `ruralpeds/.github` repository:

1. Go to **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Paste the webhook URL from step 2
5. Click **Add secret**

### 4. Test the Webhook

Test the webhook with curl:

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message from GitHub"}' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

You should see the message in Slack.

---

## Repository-Level Setup

By default, repos inherit the org-level secret from `ruralpeds/.github`.

### Override in Individual Repo

If a repo needs a different webhook (e.g., private channel):

1. Go to **repo > Settings > Secrets and variables > Actions**
2. Add `SLACK_WEBHOOK_URL` secret with custom webhook URL
3. This overrides the org-level secret for that repo

### Multiple Channels

To send to multiple channels:

1. Create separate webhooks for each channel
2. Store in repo secrets with different names (e.g., `SLACK_WEBHOOK_ALERTS`, `SLACK_WEBHOOK_STATUS`)
3. Update workflow to use the appropriate secret

---

## Channel Configuration

### #gap-analysis-alerts (Main Channel)

**Purpose:** All gap notifications
- Daily aging gap reports
- Release gate failures
- Ownership assignments
- P0/P1 gap creation alerts

**Members:**
- `@architecture-team` (notified of P0 violations)
- `@platform-leads` (notified of aging gaps)
- `@devops` (notified of release blockers)

**Notification Settings (in Slack):**
- Mute everything except mentions
- Or unmute for high-priority items (@channel for P0 issues)

### #release-engineering (Optional)

**Purpose:** Release gate violations only
- Used if separate from general alerts channel

**Setup:**
1. Create webhook for this channel
2. Update workflow to use different secret name
3. Configure notification rules in Slack

---

## Notification Types & Examples

### Daily Aging Gaps Report

Sent at 8 AM UTC by `gap-notifications.yml` schedule.

```
🕐 Gaps Aging Beyond Threshold

Repository: ruralpeds/rust-sci-core

• GAP-042: Implement QuadraticSpline
  Type: last_update_stale | Days: 45 (threshold: 30)
  Last status update was 45 days ago (2026-03-20)

• GAP-081: Add quarterly FMEA review
  Type: in_progress_long | Days: 75 (threshold: 60)
  P1 gap in progress for 75 days (since 2026-02-19)

• GAP-033: Validation test suite
  Type: blocked_stale | Days: 120 (threshold: 90)
  Blocked for 120 days; needs attention (since 2025-12-05)
```

### Release Gate Failure

Sent when release is blocked by policy violations.

```
🛑 Release Gate Violations

Repository: ruralpeds/rust-sci-core
Release: v1.0.0

• GAP-042: Implement QuadraticSpline
  Type: p1_overdue
  P1 gap target completion date (2026-06-15) is > 30 days away

• GAP-099: Undocumented feature
  Type: unassigned
  Gap has no owner assigned

2 violations found; release BLOCKED.
```

### New P0/P1 Gap Created

Sent when P0 or P1 gap is added to GAP_ANALYSIS.md.

```
⚠️ New P0/P1 Gaps Detected

Repository: ruralpeds/rust-sci-core

• GAP-101: Critical: Data validation bypass
  Priority: P0 | Owner: @alice
  Status: Not Started

• GAP-102: Add HIPAA compliance checklist
  Priority: P1 | Owner: @bob
  Status: Backlog

Review urgently and assign due dates.
```

### Ownership Assignment

Sent when gap owner is assigned.

```
✋ Gap Ownership Assigned

Gap: GAP-042: Implement QuadraticSpline
Owner: @charlie
Repository: ruralpeds/rust-sci-core

Assigned gap ownership. Charlie (@charlie) is now responsible for updates.
```

---

## Customization

### Custom Message Formatting

Edit `scripts/gap_notifications.py` to customize:
- Message emoji (🕐, 🛑, ⚠️, etc.)
- Field formatting
- Color coding
- Mention patterns

Example: Add color blocks (Slack BlockKit):

```python
payload = {
    "text": "Gap alert",
    "blocks": [
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": "*Alert*"},
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": "Details here"},
            "accessory": {
                "type": "image",
                "image_url": "https://example.com/gap-icon.png",
                "alt_text": "Gap icon"
            }
        }
    ]
}
```

### Conditional Notifications

Send notifications only for P0 gaps:

```python
if gap.priority == "P0":
    send_slack_message(webhook_url, payload)
```

### Mention Users/Teams

Tag individuals or teams in notifications:

```python
text = f"cc: <@{owner}> <@&C1234567890>"  # @user and @team
```

---

## Troubleshooting

### Webhook URL is invalid

**Error:** `403 Forbidden` or `404 Not Found`

**Solution:**
1. Verify webhook URL is complete (no copy/paste errors)
2. Check webhook hasn't been revoked in Slack app settings
3. Generate new webhook: App > Incoming Webhooks > Add New Webhook

### Messages not appearing in Slack

**Cause 1:** Wrong channel in webhook
- Solution: Check webhook is configured for `#gap-analysis-alerts`

**Cause 2:** Slack app is not in the channel
- Solution: Add the app to the channel (@[BotName] invite)

**Cause 3:** Webhook rate limit exceeded
- Solution: Wait 1 minute, or regenerate webhook

**Cause 4:** Invalid JSON in payload
- Solution: Run `gap_notifications.py --dry-run` locally to validate

### Test Webhook Manually

```bash
# Simple test
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test from terminal"}' \
  $SLACK_WEBHOOK_URL

# Test with full payload
curl -X POST -H 'Content-type: application/json' \
  --data @payload.json \
  $SLACK_WEBHOOK_URL
```

### Debugging in GitHub Actions

Add debug output to workflow:

```yaml
- name: Test Slack notification
  shell: bash
  run: |
    python3 scripts/gap_notifications.py \
      --repo test-repo \
      --event aging_gaps \
      --aging-file /tmp/test.json \
      --slack-webhook "${{ secrets.SLACK_WEBHOOK_URL }}"
```

Check workflow logs for errors.

---

## Security Best Practices

### Webhook URL Protection

1. **Never commit webhook URL** to git
2. **Use GitHub Secrets** (not env vars in workflows)
3. **Rotate webhooks** if URL is accidentally exposed
4. **Restrict webhook to specific IP** if Slack app supports it

### Channel Access Control

1. **Private channel**: Only authorized team members can see notifications
2. **Public channel**: Use message filtering (only mention when critical)
3. **Thread replies**: Reduce noise by grouping related alerts in threads

### Audit Logging

Slack stores message history. For sensitive data:
1. Don't include specific user identities in alerts
2. Don't include commit SHAs in public channels
3. Use private channels for detailed audit trails

---

## Integration with Other Systems

### Microsoft Teams

If your org uses Teams instead:

1. Create connector webhook in Teams channel
2. Same setup as Slack, different URL format
3. Update `gap_notifications.py` to use Teams webhook format

### Email Notifications

For weekly summaries:

1. Create separate `gap_email_summary.py` script
2. Schedule weekly digest job
3. Send to email list in `EMAIL_LIST` env var

### PagerDuty / Incident Management

For P0 alerts:

1. Create PagerDuty integration
2. Trigger incident when P0 gap is created
3. Add escalation policy for urgent gaps

---

## Monitoring & Alerting

### Track Notification Health

Monitor that notifications are being sent:

```bash
# Check Slack API logs for webhook calls
# In Slack app: Settings > Logs

# GitHub Actions: Check workflow runs
# In repo: Actions > Workflow name > View logs
```

### Alert on Failed Notifications

If webhook fails too many times:

1. GitHub Actions marks workflow as failed
2. PR merge can be blocked (if required check)
3. Manual intervention needed to resolve

---

## FAQ

**Q: Can I send to multiple channels?**

A: Yes, create multiple webhooks and call `gap_notifications.py` for each.

**Q: How do I silence notifications temporarily?**

A: Mute `#gap-analysis-alerts` in Slack. Or pause the scheduled workflow.

**Q: Can I customize the message format?**

A: Yes, edit `scripts/gap_notifications.py` to customize `send_slack_message()`.

**Q: What if the webhook URL leaks?**

A: Revoke it immediately in Slack app settings and generate a new one.

**Q: Do I need to set up secrets in every repo?**

A: No, repos inherit from `ruralpeds/.github`. Only override if needed.

---

## See Also

- [GAP_ANALYSIS_WORKFLOWS.md](GAP_ANALYSIS_WORKFLOWS.md) — Workflows overview
- `scripts/gap_notifications.py` — Notification script
- `scripts/gap_aging_check.py` — Aging detection
- `scripts/gap_release_gate.py` — Release gate enforcement
- [Slack API Documentation](https://api.slack.com/messaging/webhooks)
