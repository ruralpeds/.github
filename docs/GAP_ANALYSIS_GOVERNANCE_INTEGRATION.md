# Gap Analysis Governance & Enforcement — Integration Guide

**Version:** 1.0  
**Created:** 2026-05-04  
**Status:** Active

This document provides a comprehensive guide to integrating the gap-analysis governance and enforcement system across the ruralpeds organization.

---

## What Was Implemented

### 1. Release Gate Enforcement (`gap_release_gate.py`)

Enforces compliance before releases can proceed.

**Policies:**
- P0 gaps: ZERO allowed (hard block)
- P1 gaps: Must have completion date ≤ 30 days from now
- All gaps: Must have owner assigned
- All gaps: Must not be in "Blocked" status

**Features:**
- JSON audit trail for all releases
- Force-approve with reason (for emergency releases)
- Detailed violation reports
- CI/CD integration via reusable workflow

**Exit Codes:**
- `0` — Gate passed
- `1` — Gate failed (violations exist)
- `2` — Configuration error (missing args, etc.)

---

### 2. Aging Gap Detection (`gap_aging_check.py`)

Identifies gaps that need attention based on age thresholds.

**Detects:**
- Last Status Update > 30 days old
- P0/P1 gaps in "In Progress" > 60 days
- Gaps in "Blocked" status > 90 days

**Features:**
- Runs daily on schedule
- Event-driven for GAP_ANALYSIS.md changes
- JSON report output
- Feeds into notification system

---

### 3. Notification System (`gap_notifications.py`)

Sends Slack notifications for gap events.

**Events:**
- New P0/P1 gaps created
- Gaps aging beyond thresholds
- Release blockers detected
- Gap ownership assignments

**Features:**
- Slack webhook integration
- Custom message formatting
- Multiple channel support
- Audit trail preservation

---

### 4. Ownership Assignment (`gap_ownership.py`)

Suggests and assigns ownership for unassigned gaps.

**Suggestion Logic:**
- CODEOWNERS file patterns
- Repository maintainers
- Gap description analysis

**Features:**
- High-confidence suggestions (70%+)
- Fallback to primary maintainer
- Auto-assignment mode
- JSON suggestions report

---

### 5. Notification Workflow (`gap-notifications.yml`)

Scheduled and event-driven notifications.

**Triggers:**
- **Scheduled:** Every day at 8 AM UTC
- **Event-driven:** When GAP_ANALYSIS.md changes

**Operations:**
- Runs `gap_aging_check.py`
- Sends Slack notifications
- Integrates with release gate

---

### 6. Release Gate Workflow (`release-gate-gaps.yml`)

Reusable workflow for repos to enforce release gates.

**Inputs:**
- `tag` — Release tag
- `force_approval` — Override gate (boolean)
- `approval_reason` — Reason for override

**Outputs:**
- `gate_passed` — Boolean result
- `violations_count` — Number of violations
- `report_file` — JSON audit report path

**Artifacts:**
- Release gate report (30-day retention)

---

## Integration Checklist

### Step 1: Configure Slack (Org-Level)

- [ ] Create Slack webhook for `#gap-analysis-alerts`
- [ ] Add `SLACK_WEBHOOK_URL` secret to `ruralpeds/.github`
  - Path: Settings > Secrets and variables > Actions
  - Name: `SLACK_WEBHOOK_URL`
  - Value: Your webhook URL
- [ ] Test webhook with curl
- [ ] Verify `gap-notifications.yml` is in `.github/workflows/`

**Documentation:** [GAP_ANALYSIS_SLACK_SETUP.md](GAP_ANALYSIS_SLACK_SETUP.md)

### Step 2: Enable Release Gates (Per Repo)

For each repo that releases:

1. Add to release workflow (e.g., `.github/workflows/release.yml`):

```yaml
jobs:
  check-gaps:
    uses: ruralpeds/.github/.github/workflows/release-gate-gaps.yml@main
    with:
      tag: ${{ github.ref_name }}
```

2. Ensure `SLACK_WEBHOOK_URL` is available (inherited from org or repo-level)

3. Test on a branch release before production

### Step 3: Configure Organization Policy

Update org-wide rulesets to require gap checks:

1. Go to repo > Settings > Rules (or organization rules)
2. Create or update required checks to include:
   - `release-gate-gaps` (for releases)
   - `gap-validate` (for all PRs)

### Step 4: Team Training

- [ ] Notify teams about new release gate policy
- [ ] Document that P0 gaps block releases
- [ ] Explain aging gap notifications
- [ ] Show example release gate failures
- [ ] Train on force-approval audit process

**Send:** [Team Training Template](#team-training-template)

### Step 5: Monitoring & Alerts

Set up monitoring dashboard:

- [ ] Track release gate failures per repo
- [ ] Monitor aging gaps trends
- [ ] Alert on repeated policy violations
- [ ] Weekly summary of gap status

**See:** [Monitoring](#monitoring--reporting)

---

## Usage Examples

### Local Testing

Test release gate on current repo:

```bash
python3 scripts/gap_release_gate.py \
  --repo . \
  --tag v1.2.3 \
  --json-output /tmp/gate-report.json

cat /tmp/gate-report.json
```

Check for aging gaps:

```bash
python3 scripts/gap_aging_check.py \
  --repo . \
  --json-output /tmp/aging-report.json

python3 -m json.tool /tmp/aging-report.json
```

Suggest ownership:

```bash
python3 scripts/gap_ownership.py --repo .
```

### In Release Workflow

Example release workflow:

```yaml
name: Release

on:
  push:
    tags:
      - "v*.*.*"

jobs:
  check-gaps:
    uses: ruralpeds/.github/.github/workflows/release-gate-gaps.yml@main
    with:
      tag: ${{ github.ref_name }}

  build-and-release:
    needs: check-gaps
    if: needs.check-gaps.outputs.gate_passed == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and release
        run: cargo build --release
```

### Force Approval (Emergency Release)

For urgent hotfixes:

```yaml
  check-gaps:
    uses: ruralpeds/.github/.github/workflows/release-gate-gaps.yml@main
    with:
      tag: ${{ github.ref_name }}
      force_approval: true
      approval_reason: "Emergency hotfix for CVE-2026-1234; P0 gap accepted per security team"
```

Creates audit trail:
- Workflow logs show approval reason
- JSON report includes approval details
- Slack notification sent with warning
- Release artifacts include audit information

---

## Daily Operations

### Morning Gap Review (8 AM UTC)

Automated by `gap-notifications.yml`:

1. **Gap Aging Check** runs daily
2. **Slack notifications** sent for aging gaps
3. **Team leads** review and assign actions

### Update Action

When aging gap is found:

1. **Open gap** in GAP_ANALYSIS.md
2. **Update Last Status Update** field
3. **Add status-update bullet** with current progress
4. **Merge PR** — triggers workflow
5. **Notification** confirms update

### Release Preparation

Before releasing:

1. **Check gap status** in repo
2. **If gate fails:**
   - Fix P0 gaps, OR
   - Extend P1 target dates, OR
   - Assign ownership to unassigned gaps
3. **Re-run gate** (automatically after PR merge)
4. **Proceed with release** once gate passes

### Ownership Assignment

Use script to suggest owners:

```bash
python3 scripts/gap_ownership.py --repo . --mode suggest
```

Review suggestions, then:

```bash
# Manual: Edit GAP_ANALYSIS.md and update Owner field
# Auto: Apply high-confidence suggestions
python3 scripts/gap_ownership.py --repo . --mode assign --auto
```

---

## Monitoring & Reporting

### Release Gate Success Rate

Track releases over time:

```bash
# Query all release gate reports (stored as artifacts)
# Calculate success rate by repo and date
# Identify patterns in violations
```

### Aging Gap Trends

Monitor gap age distribution:

```bash
# Weekly: Count gaps by age bucket
# Monthly: Trend analysis (improving or declining?)
# Quarterly: Review thresholds (30/60/90 days still appropriate?)
```

### Notification Effectiveness

Track Slack notifications:

```bash
# Count messages sent per week
# Monitor acknowledgment rate (reactions, replies)
# Identify noisy channels (too many notifications?)
```

### Policy Violations by Type

Categorize release gate failures:

```
P0 gaps blocked release: 15 (8%)
P1 overdue: 42 (22%)
Unassigned gaps: 28 (15%)
Blocked status: 12 (6%)
Other: 85 (45%)
```

---

## Troubleshooting

### Release Gate Always Fails

**Cause:** Policy is too strict for your process

**Solutions:**
1. Review P1 target completion dates — extend if needed
2. Use force-approval for known exceptions (with reason)
3. Update GAP_ANALYSIS.md to complete/archive old gaps
4. Consider adjusting thresholds (30-day P1 rule)

### Notifications Not Arriving

**Cause:** Slack webhook not configured

**Solutions:**
1. Check `SLACK_WEBHOOK_URL` secret is set
2. Verify webhook URL is valid (test with curl)
3. Confirm bot is in `#gap-analysis-alerts` channel
4. Check workflow logs for errors

### Aging Check Never Finds Gaps

**Cause:** Gaps are up-to-date

**Solutions:**
1. Review last-status-update dates — all recent?
2. Verify thresholds are appropriate for your pace
3. Check aging_check.py is running (workflow logs)
4. Manually trigger notification workflow

### Force Approval Creates Alert Loop

**Cause:** Multiple emergency releases in succession

**Solutions:**
1. Use same approval reason for related issues
2. Create tracking issue for underlying problem
3. Schedule follow-up to resolve root cause
4. Consider temporary threshold adjustment

---

## Team Training Template

Use this to communicate with team leads:

---

**Subject: New Release Gate & Aging Gap Notifications**

Hi [Team],

We've deployed new governance policies for gap-analysis compliance. Here's what changed:

**Release Gates**

Starting immediately, releases are gated on gap-analysis compliance:

✅ Allowed:
- All active gaps assigned to an owner
- P1 gaps with target completion ≤ 30 days
- P2-P4 gaps any status

❌ Blocked:
- ANY P0 gaps (must be completed first)
- P1 gaps without target date or > 30 days away
- Unassigned gaps
- Gaps in "Blocked" status

**If your release is blocked:**

1. Check the release gate report for violations
2. Fix violations by updating GAP_ANALYSIS.md
3. Re-run gate (automatic after PR merge)
4. For emergency releases: Use force-approval with reason

**Daily Aging Alerts**

At 8 AM UTC, you'll receive Slack notifications for:

- Gaps with no status update > 30 days
- P0/P1 gaps in progress > 60 days
- Gaps blocked > 90 days

**Action Required:**

- [ ] Review your repo's GAP_ANALYSIS.md
- [ ] Update Last Status Update fields (at least weekly)
- [ ] Assign owners to all gaps
- [ ] Set realistic target completion dates for P1 gaps
- [ ] Move completed gaps to "Completed" section

**Questions?**

See [GAP_ANALYSIS_GOVERNANCE_INTEGRATION.md](GAP_ANALYSIS_GOVERNANCE_INTEGRATION.md) or contact @timothyhartzog.

Thanks,
Architecture Team

---

## Script Reference

### gap_release_gate.py

```bash
# Check release compliance
python3 scripts/gap_release_gate.py --repo . --tag v1.0.0

# Force approve emergency release
python3 scripts/gap_release_gate.py \
  --repo . --tag v1.0.0 \
  --force-approval \
  --approval-reason "CVE-2026-1234 hotfix"

# Save report
python3 scripts/gap_release_gate.py \
  --repo . --tag v1.0.0 \
  --json-output /tmp/report.json
```

### gap_aging_check.py

```bash
# Check for aging gaps
python3 scripts/gap_aging_check.py --repo .

# Save report
python3 scripts/gap_aging_check.py \
  --repo . \
  --json-output /tmp/aging.json
```

### gap_notifications.py

```bash
# Send Slack notification (requires SLACK_WEBHOOK_URL env or --slack-webhook)
python3 scripts/gap_notifications.py \
  --repo my-repo \
  --event aging_gaps \
  --aging-file /tmp/aging.json

# Other events
python3 scripts/gap_notifications.py \
  --repo my-repo \
  --event release_blockers \
  --violations-file /tmp/report.json
```

### gap_ownership.py

```bash
# Suggest ownership
python3 scripts/gap_ownership.py --repo .

# Auto-assign suggestions
python3 scripts/gap_ownership.py --repo . --mode assign --auto

# Save suggestions
python3 scripts/gap_ownership.py \
  --repo . \
  --json-output /tmp/suggestions.json
```

---

## See Also

- [GAP_ANALYSIS_WORKFLOWS.md](GAP_ANALYSIS_WORKFLOWS.md) — Workflow overview
- [GAP_ANALYSIS_SLACK_SETUP.md](GAP_ANALYSIS_SLACK_SETUP.md) — Slack configuration
- [GAP_ANALYSIS_LIFECYCLE.md](GAP_ANALYSIS_LIFECYCLE.md) — Lifecycle standard
- `scripts/gap_release_gate.py` — Release gate script
- `scripts/gap_aging_check.py` — Aging detection
- `scripts/gap_notifications.py` — Slack notifications
- `scripts/gap_ownership.py` — Ownership assignment
- `.github/workflows/gap-notifications.yml` — Notification workflow
- `.github/workflows/release-gate-gaps.yml` — Release gate workflow
