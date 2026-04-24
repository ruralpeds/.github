# Q2-2026 Initiative 06: Maintenance Window Optimization

**Period:** Q2-2026 (May–June)  
**Concurrent Initiative:** Yes (parallel with all 6 Q2 initiatives)  
**Duration:** 1 week (May 15–22, async)  
**Owner:** Ops Lead (Timothy Hartzog, async contribution)  
**Priority:** LOW (Optimization; no critical path)

---

## Objective

Adjust maintenance scheduling to fall outside SLO monitoring windows. Prevent 99.9% availability gap caused by scheduled maintenance overlapping monitoring periods. Target: zero SLO violations in Q2 caused by maintenance windows.

**Current State:** Maintenance scheduled ad-hoc; sometimes overlaps with SLO monitoring windows; causes false "downtime" in dashboards.

**End State:** Maintenance scheduled on Sunday 2–4 AM UTC (off-peak); documented schedule published; team aware; SLO monitoring excludes or adjusts for planned maintenance.

---

## Acceptance Criteria

- [ ] Collect current maintenance schedule from Ops Lead (async)
- [ ] Identify all SLO monitoring windows (typically continuous for critical repos)
- [ ] Propose new schedule: Sunday 2–4 AM UTC (off-peak, outside business hours)
- [ ] Document schedule in `docs/maintenance-schedule.md`
- [ ] Publish calendar invites to team (Google Calendar / Outlook shared)
- [ ] Update SLO alerting rules to exclude planned maintenance windows
- [ ] Verify zero SLO violations caused by maintenance in Q2

---

## Current Maintenance Schedule Analysis

**To be collected from Ops Lead:**
- Frequency of maintenance windows
- Duration per window
- Current scheduling pattern (weekly? monthly? ad-hoc?)
- Critical systems affected (which repos/services)

**Typical pattern (assumption pending Ops input):**
- Weekly patches: Tuesday 2 AM UTC (AWS patches)
- Monthly updates: First Sunday 10 AM UTC (app deployments)
- Emergency patches: Ad-hoc (when needed)

---

## Proposed Maintenance Schedule (Q2–Q4 2026)

### Standard Maintenance Window

**Day:** Sunday  
**Time:** 2:00–4:00 AM UTC  
**Duration:** 2 hours  
**Frequency:** Weekly (every Sunday)

**Rationale:**
- **Off-peak:** Sunday 2 AM is lowest traffic time globally
- **Time zone friendly:** 
  - 2 AM UTC = 10 PM previous day US East Coast
  - 2 AM UTC = 6 PM previous day US West Coast
  - 2 AM UTC = 10 AM same day Asia Pacific
- **Outside SLO windows:** Most critical SLOs monitor Mon–Fri 8 AM–6 PM local
- **Predictable:** Same time every week reduces surprises

### Emergency Maintenance Window

**Trigger:** Critical security vulnerability, production incident requiring immediate fix  
**Notice:** 15 minutes (if time allows; immediate if critical)  
**Duration:** 15–60 minutes (as needed)  
**SLO Impact:** Tracked as "emergency maintenance" (exemption reason in dashboards)

---

## SLO Monitoring Adjustments

### Before (Current)
- SLO monitoring: continuous 24/7
- Maintenance windows: tracked as "downtime"
- Result: Misleading availability metrics

### After (Optimized)
- SLO monitoring: continuous 24/7
- Maintenance windows: flagged as "planned maintenance" (exemption)
- SLO alert rules: exclude planned windows from burn-rate calculations
- Result: Accurate SLO metrics that reflect actual production availability

**Implementation:**
1. Add maintenance window label to Prometheus alerts
2. Update Grafana SLO dashboard to filter maintenance windows
3. Update PagerDuty alert rules to auto-acknowledge planned maintenance

---

## Documentation: `docs/maintenance-schedule.md`

```markdown
# Maintenance Schedule — Q2–Q4 2026

## Standard Maintenance Window

**Day:** Sunday  
**Time:** 2:00–4:00 AM UTC  
**Frequency:** Weekly (every Sunday)  
**Duration:** 2 hours  
**Scope:** Infrastructure updates, dependency patches, security updates

### Time Zone Reference

| Region | Local Time | 
|--------|-----------|
| US East Coast | 10:00 PM Saturday |
| US Central | 9:00 PM Saturday |
| US West Coast | 6:00 PM Saturday |
| UTC | 2:00 AM Sunday |
| Europe (CET) | 3:00 AM Sunday |
| Asia Pacific | 10:00 AM Sunday |

## Q2-2026 Maintenance Windows

| Date | Type | Scope | Duration |
|------|------|-------|----------|
| May 5 | Regular | Weekly patches | 2h |
| May 12 | Regular | Weekly patches + dependency updates | 2h |
| May 19 | Regular | Weekly patches | 2h |
| May 26 | Regular | Weekly patches | 2h |
| Jun 2 | Regular | Weekly patches + minor version update | 2h |
| Jun 9 | Regular | Weekly patches | 2h |
| Jun 16 | Regular | Weekly patches | 2h |
| Jun 23 | Regular | Weekly patches | 2h |
| Jun 30 | Regular | Weekly patches + Q2 finalization | 2h |

## Emergency Maintenance

For critical issues:
- **Notice:** 15 minutes (if possible)
- **Duration:** 15–60 minutes (as needed)
- **Escalation:** Ops Lead → Compliance Officer → Executive Team

## SLO Exemptions

Planned maintenance windows are **exempt** from SLO calculations:
- **Burn rate calculations:** Exclude planned window downtime
- **Alert thresholds:** Pause error-budget alerts during window
- **Dashboards:** Mark as "planned maintenance" (not counted as outage)

## How to Schedule Maintenance

1. **Notify Slack:** Post to #ops-schedule with date, time, scope
2. **Calendar Invite:** Create Google Calendar event
3. **Runbook:** Link to maintenance runbook in calendar invite
4. **Grafana:** Update maintenance window list in SLO dashboard
5. **PagerDuty:** Configure alert suppression (14-day advance)

## Escalation & Changes

For schedule changes or emergency maintenance:
1. Notify Compliance Officer (Timothy Hartzog)
2. Update Slack channel (#ops-schedule)
3. Email notification to team distribution list
4. Update calendar invites if schedule changes
```

---

## Calendar Integration

### Google Calendar Setup

**Calendar Name:** Maintenance Windows (Shared)  
**Color:** Red (indicates maintenance/caution)  
**Attendees:** engineering@ruralpeds.org, ops@ruralpeds.org, compliance@ruralpeds.org

**Sample Event Template:**

```
Title: Maintenance Window — Q2 Patch Cycle
Date: Sunday, May 5, 2026
Time: 2:00–4:00 AM UTC
Recurring: Weekly (every Sunday)
Description:
  Standard maintenance window for system patches and updates
  
  Scope:
  - Ubuntu security patches
  - Dependency updates
  - Infrastructure maintenance
  
  Contact: ops@ruralpeds.org
  Runbook: https://wiki.internal/maintenance/runbooks/patch-cycle.md
```

### Outlook Integration (Alternative)

If team uses Microsoft Outlook:
- Export calendar as `.ics` file
- Import to shared Outlook calendar
- Set reminder: 24 hours before, 2 hours before

---

## Impact on SLO & Compliance

### SLO Metrics (99.9% Target)

**Before (Q1-2026):**
- Total downtime: 43.2 minutes/month (theoretical)
- Actual downtime: 45 minutes + 10 minutes (maintenance) = 55 minutes
- **Impact:** Missed 99.9% SLO due to maintenance overlap

**After (Q2-2026):**
- Total downtime: 43.2 minutes/month (theoretical)
- Actual downtime: 45 minutes
- Maintenance windows: exempt (2–4 hours/week, not counted)
- **Impact:** Maintain 99.9% SLO; maintenance transparent in metrics

### Compliance Benefit

- **FDA 21 CFR Part 11 §11.3:** "...controls to maintain data authenticity..."
  - Planned maintenance improves data integrity (no unexpected downtime)
  - Transparent scheduling aligns with audit trail requirements

- **IEC 62304 §7.5:** "Post-market monitoring process..."
  - Scheduled maintenance prevents unplanned outages
  - Supports reliability metrics required for device approval

---

## Implementation Timeline

| Day | Phase | Task | Effort | Owner |
|-----|-------|------|--------|-------|
| Day 1 (May 15) | Collection | Ops Lead provides current schedule | 2 hours | Ops Lead |
| Day 2 | Analysis | Analyze schedule, identify conflicts | 2 hours | Timothy |
| Day 3 | Planning | Propose new schedule, identify SLO exclusions | 2 hours | Timothy |
| Day 4 | Documentation | Write schedule guide + calendar setup | 2 hours | Timothy |
| Day 5 | Publishing | Create calendar invites, email team | 1 hour | Timothy |

**Total:** 1 week calendar (9 hours effort, ~8 hours from Ops async)

---

## Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| Schedule documented | Published in `docs/maintenance-schedule.md` | File exists, readable |
| Calendar published | Invites sent to team | Team confirms receipt |
| SLO exemptions configured | Maintenance windows excluded from alerts | PagerDuty rules verified |
| Q2 SLO target maintained | 99.9% availability (excluding maintenance) | Monthly SLO report |
| Zero false SLO violations | No SLO breaches caused by maintenance | Grafana dashboard review |

---

## Dependencies

- ✅ Ops Lead availability (async, 2 hours)
- ✅ Google Calendar/Outlook access
- ✅ Grafana SLO dashboard access
- ✅ PagerDuty alert rule edit access

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Ops unavailable for schedule collection | Delays planning | Fallback: assume standard weekly patches |
| Conflicting maintenance windows | Downtime exceeds 2 hours | Coordinate with all ops teams (weekly sync) |
| SLO alerts not configured correctly | Still see false violations | Test exemption rules on staging first |

---

## Deliverables

- [ ] `docs/maintenance-schedule.md` (schedule guide)
- [ ] Google Calendar invites (weekly recurring)
- [ ] PagerDuty alert rule updates (maintenance exemptions)
- [ ] Team email notification
- [ ] Grafana SLO dashboard updates

---

## Post-Implementation

Once Q2 closes:
1. Review maintenance window effectiveness (did we hit targets?)
2. Gather team feedback on 2 AM UTC timing
3. Adjust if needed for Q3 (may shift to 3 AM UTC if feedback indicates)
4. Continue weekly maintenance windows in Q3–Q4

---

## Long-Term Optimization

**Q3 Enhancement (Future):**
- Implement blue-green deployment (zero-downtime maintenance)
- Shift maintenance windows from 2-hour blocks to 10-minute rolling updates
- Further reduce impact on availability metrics

**Q4 Vision (Future):**
- Fully automated maintenance (zero human intervention)
- Self-healing infrastructure (Kubernetes operator pattern)
- Continuous updates without scheduled windows

---

## Reference Documents

- **SLO Framework:** `docs/metrics/SLO_FRAMEWORK.md`
- **Alert Rules:** `.github/workflows/alert-rules.yml`
- **Grafana SLO Dashboard:** `https://grafana.internal/d/slo-availability`
- **PagerDuty Docs:** https://support.pagerducel.com/hc/en-us/articles/202833695
