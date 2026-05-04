# Deadline Enforcement System

**Status:** Phase 4A Tier 4  
**Last Updated:** May 4, 2026  
**Owner:** Gap Analysis System

---

## Overview

The deadline enforcement system automatically tracks, validates, and escalates gap deadlines across all 27 repositories in the ruralpeds organization. It provides:

- **Daily breach detection** — Identifies overdue P0/P1 gaps at 06:00 UTC
- **Escalation workflow** — Every 12 hours (06:00 & 18:00 UTC), escalates long-overdue gaps
- **CI/CD integration** — Validates deadline constraints on every PR and push
- **Compliance metrics** — Multi-format exports (JSON/CSV/JSONL) for dashboards and audits
- **Cross-repo coordination** — Detects deadline collisions and ownership conflicts

---

## Deadline Policies

### P0 Gaps (Blocker — releases/compliance critical)

**Deadline Constraint:**
- Target completion date must be **≤ 14 days** from today
- Must have owner assigned
- No past-dated deadlines allowed
- Hard block on release if any P0 gap is overdue

**Escalation:**
- If overdue: Alert owner immediately, escalate to team lead
- If approaching deadline: Schedule 1:1 sync with owner
- If > 7 days overdue: Create incident on critical path

**Example:**
```markdown
### GAP-001: Security vulnerability remediation
**Priority:** P0 (Blocker)
**Owner:** @security-lead
**Target Completion:** 2026-05-08  # Must be <= 14 days
```

### P1 Gaps (Critical — 1-3 months)

**Deadline Constraint:**
- Target completion date must be **≤ 30 days** from today
- Must have owner assigned
- No past-dated deadlines allowed
- Warn (but don't block) release if P1 gap is overdue

**Escalation:**
- If overdue: Schedule sync with owner within 2 business days
- If approaching deadline: Send weekly check-in reminders
- If > 3 days overdue: Escalate to team lead for capacity review

**Example:**
```markdown
### GAP-042: API v2 deprecation
**Priority:** P1 (Critical)
**Owner:** @api-team
**Target Completion:** 2026-05-20  # Must be <= 30 days
```

### P2-P4 Gaps (High/Medium/Low)

**Deadline Constraint:**
- No hard deadline constraint
- Target completion date recommended but not required
- No escalation if overdue

---

## System Components

### 1. Daily Breach Detection (deadline-breach-notification.yml)

**Schedule:** Every day at 06:00 UTC  
**Triggers:** Cron schedule + manual dispatch

**Workflow:**
1. `deadline_calculator.py` parses all repos' GAP_ANALYSIS.md
2. Calculates days-to-deadline and overdue status for each P0/P1 gap
3. Identifies breaches (days_overdue > 0)
4. Posts Slack alert to #compliance-alerts
5. Creates GitHub issue with detailed breach list
6. Archives deadline metrics as artifact

**Output:**
- Slack notification (immediate if breaches found)
- GitHub issue #NNN with breach details
- Artifact: deadline_metrics.json

### 2. Escalation Handler (deadline-breach-escalation.yml)

**Schedule:** Every 12 hours at 06:00 & 18:00 UTC  
**Triggers:** Cron schedule + manual dispatch

**Workflow:**
1. `breach_escalation_handler.py` analyzes all overdue gaps
2. Determines escalation level based on:
   - Days overdue (>=7 → critical, 3-7 → severe, >0 → high/medium)
   - Gap priority (P0 escalates faster than P1)
   - Ownership history (repeated breaches escalate further)
   - Status staleness (no updates > 14 days escalates)
3. Generates escalation templates (Slack + GitHub)
4. Posts escalation issues for critical/severe breaches
5. Sends Slack notification to @owner and team leads
6. Archives escalation report to audit-log/escalations/

**Output:**
- Escalation GitHub issues (if critical/severe)
- Slack notification to owners + team leads
- Audit log entry: escalation-YYYY-MM-DD-HHMM.json

### 3. CI/CD Validation (gap-analysis-validate.yml + required-compliance.yml)

**Schedule:** On PR and push to main  
**Triggers:** Changes to .gap-analysis/GAP_ANALYSIS.md

**Checks:**
- ✅ P0 deadline <= 14 days
- ✅ P1 deadline <= 30 days
- ✅ No past-dated deadlines
- ✅ Valid date format
- ✅ All required fields present

**Behavior:**
- Warnings: Show in validation report but don't block
- Errors: Block PR/push with clear message

**Example Output:**
```
❌ [GAP-001] (P0): Deadline in the past: 2026-04-30
⚠️  [GAP-042] (P1): Deadline is 45 days away (should be <= 30)
✅ All deadline constraints satisfied
```

### 4. Cross-Repo Coordination (gap_sync_coordinator.py)

**Schedule:** Weekly Monday at 07:00 UTC (part of gap-dashboard.yml)  
**Triggers:** Cron schedule + manual dispatch via gap-dashboard workflow

**Workflow:**
1. Reads GAP_ANALYSIS.md from all 27 repos
2. Builds deadline index (date → [gaps])
3. Detects deadline collisions (3+ gaps due same day)
4. Analyzes ownership distribution
5. Flags overloaded owners (capacity warnings)
6. Archives sync snapshot to audit-log/daily/

**Output:**
- gap-sync-index.json with deadline index and collision alerts
- Archived snapshots: audit-log/daily/sync-index-YYYY-MM-DD.json

### 5. Compliance Metrics Export (compliance_metrics_exporter.py)

**Schedule:** Weekly Monday at 07:00 UTC (part of gap-dashboard.yml)  
**Triggers:** Cron schedule + manual dispatch via gap-dashboard workflow

**Outputs:**
1. **org-deadline-compliance.json** — Dashboard/reporting
   - Summary stats (by priority, escalation, status)
   - Full gap details with escalation levels
   - Suitable for custom dashboards

2. **deadline-tracking.csv** — Spreadsheet analysis
   - One row per gap
   - Columns: gap_id, repo, title, priority, owner, status, target_date, days_overdue, escalation_level
   - Importable to Excel/Google Sheets

3. **deadline-events.jsonl** — Append-only audit trail
   - One JSON object per line
   - Historical tracking for compliance audits
   - Suitable for time-series analysis

---

## Escalation Levels

Gaps are assigned escalation levels based on overdue days and other factors:

| Level | Days Overdue | P0 Multiplier | Action | Example |
|-------|--------------|---------------|--------|---------|
| **critical** | >= 14 | 1.5x | 🚨 Alert immediately, block release | Overdue by 2+ weeks |
| **severe** | 7-13 | 1.5x | 🔴 Escalate within 24 hours | Overdue by 1-2 weeks |
| **high** | 3-6 | 1.2x | 🟠 Schedule sync within 48 hours | Overdue by 3-6 days |
| **medium** | 1-2 | 1.0x | 🟡 Contact owner for status | Overdue by 1-2 days |
| **watch** | -7 to 0 | 1.0x | 🔵 Due soon, no action yet | Due within 7 days |
| **info** | < -7 | 1.0x | ℹ️ On track | Not due for 7+ days |

**Multiplier Effect:** P0 gaps can escalate 1.5x faster due to higher severity. For example:
- A P1 gap 3 days overdue = "high"
- A P0 gap 3 days overdue = "severe" (escalated due to priority)

---

## Operational Procedures

### Daily Tasks (06:00 UTC)

1. **deadline-breach-notification.yml runs automatically**
   - Check Slack #compliance-alerts for alerts
   - If breaches found: Review GitHub issue and take action
   - Contact gap owners for status updates

### Twice-Daily Tasks (06:00 & 18:00 UTC)

2. **deadline-breach-escalation.yml runs automatically**
   - Review escalation GitHub issues (if created)
   - Contact owners of critical/severe breaches
   - Escalate to team leads as needed

### Weekly Tasks (Monday 07:00 UTC)

3. **gap-dashboard.yml sync-deadline-compliance job runs**
   - Review org-wide deadline metrics
   - Check for deadline collisions in gap-sync-index.json
   - Analyze ownership distribution for workload balance

### Monthly Tasks

4. **Manual review**
   - Review escalation history in audit-log/escalations/
   - Analyze trends (which gaps repeatedly breach?)
   - Consider adjusting deadlines or assigning additional owners

### Quarterly Tasks

5. **Policy review**
   - Audit P0/P1 deadline constraints (14/30 days)
   - Review escalation procedures
   - Update documentation if needed

---

## How to Update Your Repo's Gap Deadlines

### Adding a New Gap

1. Open `.gap-analysis/GAP_ANALYSIS.md` in your repo
2. Add a new gap block under `## Active Gaps`:
   ```markdown
   ### GAP-NNN: Brief description
   **Priority:** P0 or P1 (or P2-P4)
   **Owner:** @your-github-username
   **Target Completion:** YYYY-MM-DD
   **Status:** Not Started
   **Description:** Clear explanation of the gap
   ```

3. For P0/P1 gaps, ensure:
   - `Target Completion` is <= 14 days (P0) or <= 30 days (P1)
   - `Owner` is assigned (not `[Unassigned]`)
   - Date is in future (not past)

4. Commit and push: `git commit -m "docs: add gap GAP-NNN"`
5. Validation runs automatically on PR/push

### Updating an Existing Deadline

1. Edit the `**Target Completion**` field
2. Ensure new date still satisfies constraints
3. Update `**Status**` if progress was made
4. Commit and push
5. CI/CD validates automatically

### Extending a Deadline

If you need more time:
1. Update `**Target Completion**` to new date
2. Add a note to `**Description**` explaining why
3. Contact your team lead if extending a P0 deadline beyond 14 days

**Note:** Extended P0 deadlines beyond 14 days will generate warnings during validation. Escalation may be triggered.

---

## Troubleshooting

### "Deadline in the past" error

**Cause:** Target completion date is before today  
**Fix:** Update `Target Completion` to a future date

```markdown
**Target Completion:** 2026-05-15  # Must be >= tomorrow
```

### "Invalid date format" warning

**Cause:** Date not in a recognized format  
**Fix:** Use YYYY-MM-DD format
```markdown
**Target Completion:** 2026-05-15  # ✅ Good
**Target Completion:** 05/15/2026  # Also works
**Target Completion:** May 15, 2026  # Also works
```

### "P0 deadline is too far in future" error

**Cause:** P0 deadline > 90 days away  
**Fix:** P0 should be urgent. If task takes > 90 days, consider P1 instead

### "Overloaded owner" warning

**Cause:** One person has 10+ active gaps  
**Fix:** Reassign gaps to other team members or split work

---

## Integration with Release Gates

P0 deadline compliance is enforced as a release gate:

1. **Before release**, check if any P0 gaps are overdue
2. **If overdue P0 exists:**
   - ❌ BLOCK release (hard gate)
   - Require sign-off from team lead to override

3. **If overdue P1 exists:**
   - ⚠️ WARN (soft gate, doesn't block)
   - Recommend scheduling follow-up sync

---

## Escalation Decision Tree

```
Gap is overdue?
├─ NO → info (on track)
├─ YES
   ├─ Days overdue >= 14? → critical (🚨)
   ├─ Days overdue >= 7? → severe (🔴)
   ├─ Days overdue >= 3? → high (🟠)
   ├─ Days overdue >= 1? → medium (🟡)
   └─ Days overdue < 1? → medium (🟡)
   
For each escalation level:
├─ critical: Alert immediately, escalate to exec
├─ severe: Contact team lead + owner within 24h
├─ high: Schedule 48h sync
├─ medium: Email status check
└─ watch: Track for next review
```

---

## Dashboard & Reporting

### Live Dashboard

View real-time gap status: [Gap Analysis Dashboard](../../docs/gap-analysis-dashboard.md)

### Compliance Metrics

Export formats available for analysis:
- **JSON:** `org-deadline-compliance.json` (dashboards)
- **CSV:** `deadline-tracking.csv` (spreadsheets)
- **JSONL:** `deadline-events.jsonl` (audit trails)

These are generated weekly and available in workflow artifacts.

### Audit Log

Historical escalation records: `audit-log/escalations/escalation-*.json`

---

## Support & Questions

- **System overview:** See PHASE_4A_GAP_AUTOMATION_SUMMARY.md
- **Incident response:** See deadline-breach-response.md
- **Escalation logic:** See breach_escalation_handler.py source code
- **Questions:** Open an issue tagged `gap-analysis` or contact the gap analysis team

---

**Ready for Phase 4B: Infrastructure as Code**
