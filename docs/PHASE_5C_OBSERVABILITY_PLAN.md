# Phase 5C: Observability & Monitoring — Planning & Implementation

**Status:** Active Implementation  
**Branch:** `claude/phase-5-advanced-automation`  
**Date Started:** May 4, 2026  
**Target Completion:** June 1, 2026 (4 weeks)  
**Effort:** 60-80 hours

---

## Executive Summary

### Problem Statement
- **Current state:** No centralized observability into CI/CD system health
- **Impact:** Cannot proactively detect performance degradation or failures
- **Gaps:** Missing dashboards, alerting, runbooks for common issues
- **Opportunity:** Enable data-driven operational decisions with real-time visibility

### Proposed Solution: Observability Platform
- **Instrument all workflows** with metrics collection
- **Build metrics pipeline** for aggregation & trending
- **Create real-time dashboards** for system health
- **Implement alerting** for critical conditions
- **Document runbooks** for common incidents

### Success Metrics
| Metric | Target | Status |
|--------|--------|--------|
| Instrumentation | 100% of workflows | ⏳ Implementation |
| Metrics Latency | < 5 min to dashboard | ⏳ Development |
| MTTR | < 1 min detection | ⏳ Validation |
| Alert Accuracy | > 95% signal-to-noise | ⏳ Tuning |
| Runbook Coverage | 10+ common issues | ⏳ Documentation |

---

## Architecture: 4-Layer Observability Stack

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: INSTRUMENTATION (GitHub Actions Workflows)         │
├─────────────────────────────────────────────────────────────┤
│ - Collect job metrics: duration, CPU, memory, disk          │
│ - Capture job status: success, failure, cancelled           │
│ - Track resource usage: runner health, queue depth          │
│ - Export to stdout → captured by GitHub Actions             │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: COLLECTION (Metrics Gathering)                     │
├─────────────────────────────────────────────────────────────┤
│ - Daily jobs: Fetch metrics from workflow logs              │
│ - Normalize: Convert to Prometheus format                   │
│ - Store: TSDB or JSON time-series                           │
│ - Aggregate: 5-min, 1-hour, daily rollups                   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: DASHBOARDS (Visualization)                         │
├─────────────────────────────────────────────────────────────┤
│ - Real-time dashboard: Current job status, queue depth      │
│ - Performance dashboard: Job durations, trends              │
│ - Health dashboard: Runner uptime, failure rates            │
│ - Cost dashboard: Cost trends, by team/project              │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: ALERTING & RUNBOOKS (Response)                     │
├─────────────────────────────────────────────────────────────┤
│ - Alerts: Workflow failures, slow jobs, high queue          │
│ - Notifications: Slack, email, issues                       │
│ - Runbooks: 10+ documented incident responses               │
│ - Auto-remediation: For common issues (optional)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 5C Sub-Tasks

### Task 1: Metrics Instrumentation (1 week)

**Goal:** Instrument all workflows with comprehensive metrics

#### 1.1: Define Observable Metrics
```
Job-Level Metrics:
  - job_duration_seconds (histogram)
  - job_status (enum: success, failure, cancelled, skipped)
  - job_cpu_utilization (gauge, %)
  - job_memory_utilization (gauge, MB)
  - job_disk_usage (gauge, MB)

Runner-Level Metrics:
  - runner_uptime (gauge, seconds)
  - runner_queue_depth (gauge, count)
  - runner_utilization (gauge, %)
  - runner_health_status (enum: healthy, degraded, unhealthy)

Workflow-Level Metrics:
  - workflow_run_duration (histogram)
  - workflow_run_status (enum)
  - workflow_success_rate (gauge, %)
  - workflow_failure_rate (gauge, %)
```

#### 1.2: Create Metrics Collection Script
- Script: `scripts/collect-metrics.sh`
- Function: Capture metrics from job environment
- Metrics: Duration, status, resource usage
- Output: Structured JSON to stdout
- Integration: Add to all workflows as final step

#### 1.3: Instrument All Workflows
- Add metrics collection to:
  - gap-dashboard.yml
  - deadline-breach-notification.yml
  - batch-job-executor-kubernetes.yml
  - cost-metrics-daily.yml
  - cost-attribution-daily.yml
  - All 50+ other workflows

#### 1.4: Create Metrics Schema
- Document metric names, units, types
- Define alert thresholds
- Specify retention policies

**Deliverable:** All workflows instrumented, baseline metrics flowing

---

### Task 2: Metrics Collection & Storage (1 week)

**Goal:** Aggregate metrics from all workflow runs

#### 2.1: Create Metrics Aggregator
- Script: `scripts/metrics-aggregator.py` (~400 lines)
- Function:
  1. Fetch metrics from all workflow runs (last 24 hours)
  2. Parse and normalize metrics
  3. Apply transformations (calculations, aggregations)
  4. Store in time-series format (JSON + Prometheus)
  5. Calculate percentiles and trends

#### 2.2: Create Metrics Storage
- JSONL: `audit-log/metrics/events.jsonl` (raw events)
- JSON: `audit-log/metrics/time-series-YYYY-MM-DD.json` (aggregated)
- Prometheus: `audit-log/metrics/metrics.txt` (compatible format)

#### 2.3: Create Daily Aggregation Workflow
- Workflow: `.github/workflows/metrics-daily.yml`
- Trigger: Daily at 04:00 UTC (after collection)
- Jobs:
  1. aggregate-metrics: Run metrics-aggregator.py
  2. validate-metrics: Quality checks
  3. archive-metrics: Save to audit-log

#### 2.4: Create Trending Analysis
- Script: `scripts/metrics-trend-analyzer.py` (~300 lines)
- Function:
  1. Load historical metrics (last 30 days)
  2. Calculate trends (daily, weekly)
  3. Detect anomalies (deviation from baseline)
  4. Forecast future values
  5. Generate alerts for concerning trends

**Deliverable:** Metrics flowing daily, trends visible

---

### Task 3: Dashboards & Visualization (1 week)

**Goal:** Create visual dashboards for system health

#### 3.1: Real-Time Status Dashboard
- File: `docs/observability-dashboard-status.md`
- Content:
  1. Current job queue depth
  2. Recent job success rate (last 24h)
  3. Active workflows
  4. Runner status summary
  5. Recent failures/alerts

#### 3.2: Performance Dashboard
- File: `docs/observability-dashboard-performance.md`
- Content:
  1. Median job duration (by workflow)
  2. P95/P99 job durations
  3. Job duration trends (7-day, 30-day)
  4. Slowest jobs (top 10)
  5. Performance regression detection

#### 3.3: Health Dashboard
- File: `docs/observability-dashboard-health.md`
- Content:
  1. Runner uptime by host
  2. Job failure rate by workflow
  3. Failure types (timeout, OOM, network, etc.)
  4. Runner utilization trends
  5. Queue depth trends

#### 3.4: Create Dashboard Updater
- Script: `scripts/dashboard-generator.py` (~350 lines)
- Function: Generate markdown dashboards from metrics
- Update frequency: Hourly or on-demand
- Targets:
  1. Status dashboard (hourly)
  2. Performance dashboard (daily)
  3. Health dashboard (daily)

#### 3.5: Create Grafana/Prometheus Integration (Optional)
- Export metrics in Prometheus format
- Create Grafana dashboards (if Grafana available)
- Enable external monitoring tools integration

**Deliverable:** 3 dashboards live, updated hourly/daily

---

### Task 4: Alerting & Runbooks (1 week)

**Goal:** Detect problems and enable fast response

#### 4.1: Define Alert Rules
```
Alert Rule 1: High Job Failure Rate
- Condition: Job failure rate > 10% in last 1 hour
- Severity: Critical
- Action: Notify #ci-failures Slack channel

Alert Rule 2: High Queue Depth
- Condition: Job queue > 20 waiting
- Severity: Warning
- Action: Notify #ci-ops channel, suggest scaling

Alert Rule 3: Slow Jobs
- Condition: Job duration > 2x baseline for 3 consecutive runs
- Severity: Warning
- Action: Create GitHub issue for investigation

Alert Rule 4: Runner Unhealthy
- Condition: Runner uptime < 95% in rolling window
- Severity: Critical
- Action: Notify #infrastructure, trigger health check

Alert Rule 5: Cost Spike
- Condition: Daily cost > 150% of average
- Severity: Warning
- Action: Create GitHub issue, notify team lead

Alert Rule 6: Low Disk Space
- Condition: Runner disk usage > 90%
- Severity: Critical
- Action: Trigger cleanup job, notify ops
```

#### 4.2: Create Alert Detector
- Script: `scripts/alert-detector.py` (~300 lines)
- Function:
  1. Load alert rules configuration
  2. Evaluate conditions against metrics
  3. Detect state changes (alert fired/resolved)
  4. Generate notification payloads
  5. Send notifications (Slack, email, GitHub issues)

#### 4.3: Create Alert Workflow
- Workflow: `.github/workflows/observability-alerts.yml`
- Trigger: Every 15 minutes (frequent checks)
- Jobs:
  1. detect-alerts: Run alert-detector.py
  2. send-notifications: Post to Slack/email
  3. create-issues: Create GitHub issues for critical alerts

#### 4.4: Create Runbooks
- Document: `docs/runbooks/` directory
- Runbooks (10+ files):
  1. `job-failure-response.md` — What to do when jobs fail
  2. `high-queue-depth-response.md` — Handle job backlog
  3. `slow-job-investigation.md` — Debug performance issues
  4. `runner-health-recovery.md` — Recover unhealthy runner
  5. `disk-space-cleanup.md` — Free up runner storage
  6. `oom-killer-investigation.md` — Handle out-of-memory
  7. `network-timeout-debugging.md` — Network issues
  8. `cost-spike-investigation.md` — Unusual spending
  9. `ci-degradation-response.md` — System-wide issues
  10. `incident-communication.md` — How to communicate incidents

#### 4.5: Create Incident Response Workflow
- Workflow: `.github/workflows/observability-incident.yml`
- Triggered by: Slack command or manual trigger
- Function:
  1. Create incident issue
  2. Start communication thread
  3. Trigger on-call runbook
  4. Collect diagnostic data
  5. Track resolution time

**Deliverable:** Alerts flowing, 10+ runbooks documented, incident response ready

---

## Implementation Timeline

### Week 1: Instrumentation & Collection
```
Mon: Define observable metrics, create collection script
Tue: Instrument 10-15 critical workflows
Wed: Instrument remaining workflows (50+)
Thu: Create daily metrics workflow, validate data
Fri: Code review, documentation
```

### Week 2: Dashboards
```
Mon: Create status dashboard
Tue: Create performance dashboard
Wed: Create health dashboard
Thu: Create dashboard updater, test automation
Fri: Code review, dashboard refinement
```

### Week 3: Alerting
```
Mon: Define alert rules (6 rules)
Tue: Create alert detector script
Wed: Create alert workflow, Slack integration
Thu: Test alerts, tune thresholds
Fri: Code review, documentation
```

### Week 4: Runbooks & Launch
```
Mon-Tue: Document 10+ runbooks
Wed: Create incident response workflow
Thu: Training & validation
Fri: Launch to production, monitoring
```

---

## Detailed Component Specifications

### Component 1: Metrics Collection Script
**File:** `scripts/collect-metrics.sh` (~150 lines)

```bash
#!/bin/bash
# Capture job metrics and export as JSON

JOB_DURATION=$(( $(date +%s) - JOB_START_TIME ))
JOB_STATUS="${JOB_STATUS:-unknown}"
RUNNER_TYPE="${RUNNER_TYPE:-unknown}"

# Get resource usage
CPU_UTIL=$(ps aux | grep -v grep | awk '{sum+=$3} END {print sum}')
MEMORY_USAGE=$(free -h | grep Mem | awk '{print $3}')
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}')

# Export metrics as JSON
cat << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "job_name": "$JOB_NAME",
  "job_duration_seconds": $JOB_DURATION,
  "job_status": "$JOB_STATUS",
  "runner_type": "$RUNNER_TYPE",
  "cpu_utilization_percent": $CPU_UTIL,
  "memory_usage_mb": $(echo $MEMORY_USAGE | numfmt --from=auto --to=iec-i --suffix=B 2>/dev/null || echo 0),
  "disk_usage_percent": ${DISK_USAGE%\%},
  "cost_estimate": $(( JOB_DURATION / 60 * HOURLY_RATE / 60 ))
}
EOF
```

**Integration:** Add to end of each job:
```yaml
- name: Collect metrics
  if: always()  # Run even if job failed
  run: bash scripts/collect-metrics.sh
```

---

### Component 2: Metrics Aggregator Script
**File:** `scripts/metrics-aggregator.py` (~400 lines)

```python
#!/usr/bin/env python3
"""
metrics-aggregator.py

Aggregate metrics from all workflow runs into time-series format.
Calculates percentiles, trends, and anomalies.

Usage:
    python3 scripts/metrics-aggregator.py \
        --token $GITHUB_TOKEN \
        --org ruralpeds \
        --hours 24 \
        --output-dir audit-log/metrics
"""

# Features:
# - Fetch metrics from all workflow runs
# - Parse job metrics from logs
# - Normalize to standard format
# - Calculate percentiles (p50, p95, p99)
# - Detect trends and anomalies
# - Store in JSONL + JSON + Prometheus formats
# - Generate baseline for alerting
```

**Outputs:**
- `metrics.jsonl` — Raw events
- `time-series-YYYY-MM-DD.json` — Aggregated by hour
- `metrics.txt` — Prometheus format for external scraping

---

### Component 3: Alert Detector Script
**File:** `scripts/alert-detector.py` (~300 lines)

```python
#!/usr/bin/env python3
"""
alert-detector.py

Evaluate alert rules against current metrics.
Sends notifications for triggered alerts.

Usage:
    python3 scripts/alert-detector.py \
        --config config/alert-rules.json \
        --metrics-file audit-log/metrics/current.json \
        --output alerts.json
"""

# Features:
# - Load alert rules from config
# - Evaluate conditions against metrics
# - Detect state transitions (new/resolved alerts)
# - Generate notification payloads
# - Send to Slack, email, GitHub
# - Track alert history for deduplication
```

**Alert Rules Config:**
```json
{
  "alerts": [
    {
      "name": "high_job_failure_rate",
      "condition": "failure_rate > 0.1",
      "severity": "critical",
      "channel": "#ci-failures",
      "runbook": "job-failure-response.md"
    }
  ]
}
```

---

### Component 4: Dashboard Generator
**File:** `scripts/dashboard-generator.py` (~350 lines)

```python
#!/usr/bin/env python3
"""
dashboard-generator.py

Generate markdown dashboards from metrics data.
Creates visual representations and summaries.

Usage:
    python3 scripts/dashboard-generator.py \
        --metrics-file audit-log/metrics/time-series.json \
        --output docs/observability-dashboard.md
"""

# Generates:
# - Status dashboard (real-time)
# - Performance dashboard (trends)
# - Health dashboard (reliability)
# - Cost dashboard (spending)
```

---

## Workflows

### Workflow 1: Daily Metrics Collection
**File:** `.github/workflows/metrics-daily.yml` (~200 lines)

```yaml
name: Observability — Daily Metrics
on:
  schedule:
    - cron: "0 4 * * *"  # Daily at 04:00 UTC
jobs:
  aggregate:
    runs-on: [self-hosted, mac-studio, arm64]
    steps:
      - uses: actions/checkout@v4
      - run: python scripts/metrics-aggregator.py ...
      - uses: actions/upload-artifact@v4
        with:
          name: daily-metrics
          path: audit-log/metrics/
```

---

### Workflow 2: Alert Detection (Frequent)
**File:** `.github/workflows/observability-alerts.yml` (~180 lines)

```yaml
name: Observability — Alert Detection
on:
  schedule:
    - cron: "*/15 * * * *"  # Every 15 minutes
jobs:
  detect:
    runs-on: [self-hosted, mac-studio, arm64]
    steps:
      - uses: actions/checkout@v4
      - run: python scripts/alert-detector.py ...
      - name: Notify Slack
        if: steps.detect.outputs.alerts_found == 'true'
        run: |
          curl -X POST $SLACK_WEBHOOK \
            -d @alerts.json
```

---

### Workflow 3: Dashboard Generation
**File:** `.github/workflows/observability-dashboards.yml` (~150 lines)

```yaml
name: Observability — Generate Dashboards
on:
  schedule:
    - cron: "0 * * * *"  # Hourly
jobs:
  generate:
    runs-on: [self-hosted, mac-studio, arm64]
    steps:
      - uses: actions/checkout@v4
      - run: python scripts/dashboard-generator.py ...
      - run: |
          git add docs/observability-dashboard-*.md
          git commit -m "docs: update observability dashboards"
          git push || true
```

---

## Dashboards

### Dashboard 1: Real-Time Status
**File:** `docs/observability-dashboard-status.md`

```markdown
# CI/CD System Status (Real-Time)

## Queue Status
- Current queue depth: 12 jobs waiting
- Oldest job waiting: 5 minutes (15 min ago)
- Queue trend: ▲ Increasing (5 min avg: 8)

## Recent Jobs (Last 24 Hours)
- Total runs: 847
- Successful: 823 (97.2%)
- Failed: 15 (1.8%)
- Cancelled: 9 (1.1%)

## Runner Status
- Mac runners: 2 online (1 busy)
- Kubernetes runners: 4 online (2 busy)
- Uptime: 99.8% (last 7 days)

## Recent Alerts
- ⚠️ Queue depth high (12 waiting)
- ✅ All runners healthy
```

---

### Dashboard 2: Performance Trends
**File:** `docs/observability-dashboard-performance.md`

```markdown
# CI/CD Performance Dashboard

## Job Duration Trends
- Median (p50): 8.2 minutes
- P95: 14.5 minutes
- P99: 18.3 minutes

## Slowest Workflows
1. gap-dashboard: 15.2 min (↑ 12% vs. last week)
2. batch-job-executor-kubernetes: 14.8 min
3. cost-attribution-daily: 12.1 min

## Performance Regression Alert
🔴 gap-dashboard is 12% slower than baseline
- Historical avg: 13.6 minutes
- Current: 15.2 minutes (1.6 min increase)
- Recommendation: Review recent changes
```

---

### Dashboard 3: System Health
**File:** `docs/observability-dashboard-health.md`

```markdown
# CI/CD System Health

## Runner Uptime
- Mac runners: 99.9% (last 7d)
- Kubernetes: 99.8% (last 7d)
- Average: 99.85%

## Job Success Rate
- Last 24h: 97.2%
- Last 7d: 96.8%
- Last 30d: 95.2%

## Top Failure Types
1. Timeout: 8 jobs (53%)
2. OOM Killer: 4 jobs (27%)
3. Network: 2 jobs (13%)
4. Other: 1 job (7%)

## Health Score: 96/100
- Runner availability: 99.85/100
- Job success rate: 97.2/100
- Performance: 92/100 (P95 < 15min)
```

---

## Alert Rules Configuration

**File:** `config/alert-rules.json`

```json
{
  "alerts": [
    {
      "id": "high_failure_rate",
      "name": "High Job Failure Rate",
      "condition": "failure_rate_1h > 0.10",
      "severity": "critical",
      "description": "More than 10% of jobs failed in last hour",
      "channels": ["#ci-failures", "ci-ops@company.com"],
      "runbook": "job-failure-response.md",
      "auto_remediate": false
    },
    {
      "id": "high_queue_depth",
      "name": "High Queue Depth",
      "condition": "queue_depth > 20",
      "severity": "warning",
      "description": "More than 20 jobs waiting",
      "channels": ["#ci-ops"],
      "runbook": "high-queue-depth-response.md",
      "auto_remediate": true,
      "remediation_action": "scale-runners"
    },
    {
      "id": "slow_jobs",
      "name": "Slow Jobs Detected",
      "condition": "job_duration_p95 > baseline * 2.0 for 3 runs",
      "severity": "warning",
      "description": "Jobs are 2x slower than normal",
      "channels": ["#ci-performance"],
      "runbook": "slow-job-investigation.md",
      "auto_remediate": false
    },
    {
      "id": "runner_unhealthy",
      "name": "Runner Unhealthy",
      "condition": "runner_uptime_7d < 0.95",
      "severity": "critical",
      "description": "Runner uptime below 95%",
      "channels": ["#infrastructure"],
      "runbook": "runner-health-recovery.md",
      "auto_remediate": true,
      "remediation_action": "restart-runner"
    },
    {
      "id": "cost_spike",
      "name": "Cost Spike Detected",
      "condition": "daily_cost > avg_7d * 1.5",
      "severity": "warning",
      "description": "Daily cost is 50% higher than average",
      "channels": ["#cost-optimization"],
      "runbook": "cost-spike-investigation.md",
      "auto_remediate": false
    }
  ]
}
```

---

## Runbooks Directory

**File:** `docs/runbooks/`

```
runbooks/
├── job-failure-response.md ..................... Debug & recover failed jobs
├── high-queue-depth-response.md ............... Handle job backlog
├── slow-job-investigation.md .................. Identify performance bottlenecks
├── runner-health-recovery.md .................. Recover unhealthy runner
├── disk-space-cleanup.md ....................... Free up runner storage
├── oom-killer-investigation.md ................ Handle out-of-memory
├── network-timeout-debugging.md ............... Debug network issues
├── cost-spike-investigation.md ................ Investigate unusual spending
├── ci-degradation-response.md ................. System-wide incident response
└── incident-communication.md .................. How to communicate incidents
```

---

## Success Criteria

### Week 1 Checkpoint ✅
- [ ] All critical workflows instrumented
- [ ] Metrics flowing daily
- [ ] Baseline metrics established
- [ ] Collection workflow running reliably

### Week 2 Checkpoint ✅
- [ ] Status dashboard live
- [ ] Performance dashboard live
- [ ] Health dashboard live
- [ ] Dashboards updating hourly

### Week 3 Checkpoint ✅
- [ ] Alert rules defined & tested
- [ ] Alert detection workflow running
- [ ] Slack notifications working
- [ ] Alert accuracy > 95%

### Week 4 Checkpoint ✅
- [ ] 10+ runbooks documented
- [ ] Incident response workflow ready
- [ ] Team training completed
- [ ] MTTR < 1 minute for alert detection

### Final Criteria (Go/No-Go)
- ✅ MTTR: < 1 minute from detection
- ✅ Dashboard latency: < 5 minutes
- ✅ Alert accuracy: > 95% signal-to-noise
- ✅ Runbook coverage: 10+ common issues
- ✅ Team adoption: 100% awareness of dashboards

---

## Expected Outcomes (Phase 5C)

### Week 1 Output
- All workflows instrumented ✅
- Metrics collection working ✅
- Baseline established ✅

### Week 2 Output
- Status dashboard live ✅
- Performance trends visible ✅
- Health metrics tracked ✅

### Week 3 Output
- Alerts flowing ✅
- Slack integration working ✅
- Alert accuracy tuned ✅

### Week 4 Output
- Runbooks documented ✅
- Incident response ready ✅
- Team trained ✅
- MTTR: < 1 min ✅

---

## Metrics Schema

### Job Metrics
```json
{
  "timestamp": "2026-05-25T14:30:00Z",
  "job_name": "gap-dashboard",
  "workflow_name": "Gap Analysis Dashboard",
  "job_duration_seconds": 900,
  "job_status": "success",
  "runner_type": "self-hosted:mac",
  "cpu_utilization_percent": 65.3,
  "memory_usage_mb": 2048,
  "disk_usage_percent": 45,
  "cost_estimate": 0.19,
  "exit_code": 0
}
```

### Aggregated Metrics
```json
{
  "timestamp": "2026-05-25T15:00:00Z",
  "period": "2026-05-25T14:00:00Z to 2026-05-25T15:00:00Z",
  "summary": {
    "total_jobs": 42,
    "successful_jobs": 41,
    "failed_jobs": 1,
    "success_rate": 0.976
  },
  "duration_metrics": {
    "p50": 450,
    "p95": 850,
    "p99": 1200,
    "max": 1350
  },
  "resource_metrics": {
    "avg_cpu_utilization": 62.1,
    "avg_memory_mb": 1950,
    "avg_disk_usage_percent": 42
  }
}
```

---

## Dependencies & Integrations

### Required
- GitHub token with repo:read permissions
- Self-hosted runners with metric collection capability
- Slack webhook for notifications (optional but recommended)

### Optional
- Prometheus server (for metric storage)
- Grafana (for advanced dashboards)
- External monitoring service (DataDog, New Relic, etc.)

---

## Deliverables Checklist

### Scripts (4 files, ~1,200 lines)
- [ ] `collect-metrics.sh` (150 lines)
- [ ] `metrics-aggregator.py` (400 lines)
- [ ] `alert-detector.py` (300 lines)
- [ ] `dashboard-generator.py` (350 lines)

### Workflows (3 files, ~530 lines)
- [ ] `metrics-daily.yml` (200 lines)
- [ ] `observability-alerts.yml` (180 lines)
- [ ] `observability-dashboards.yml` (150 lines)

### Configuration (2 files, ~200 lines)
- [ ] `config/alert-rules.json` (alert definitions)
- [ ] `config/alert-thresholds.json` (numeric thresholds)

### Dashboards (3 files, ~400 lines)
- [ ] `docs/observability-dashboard-status.md`
- [ ] `docs/observability-dashboard-performance.md`
- [ ] `docs/observability-dashboard-health.md`

### Runbooks (10+ files, ~1,200 lines)
- [ ] `docs/runbooks/job-failure-response.md`
- [ ] `docs/runbooks/high-queue-depth-response.md`
- [ ] `docs/runbooks/slow-job-investigation.md`
- [ ] `docs/runbooks/runner-health-recovery.md`
- [ ] `docs/runbooks/disk-space-cleanup.md`
- [ ] `docs/runbooks/oom-killer-investigation.md`
- [ ] `docs/runbooks/network-timeout-debugging.md`
- [ ] `docs/runbooks/cost-spike-investigation.md`
- [ ] `docs/runbooks/ci-degradation-response.md`
- [ ] `docs/runbooks/incident-communication.md`

**Total Phase 5C Effort:** ~1,200 lines code + 1,600 lines docs + 3 workflows

---

## Next Steps

### Immediate (This Week)
1. Review Phase 5C plan with team
2. Define observable metrics list
3. Design alert rules
4. Create metrics schema

### Implementation (Week of May 11)
1. Instrument critical workflows
2. Deploy metrics collection
3. Test data pipeline
4. Instrument all workflows

### Dashboards (Week of May 18)
1. Create status dashboard
2. Create performance dashboard
3. Create health dashboard
4. Automate dashboard updates

### Alerts & Runbooks (Week of May 25)
1. Deploy alert detection
2. Slack integration
3. Document runbooks
4. Train team

### Launch (Week of June 1)
1. Go-live to production
2. Monitor for issues
3. Tune alert thresholds
4. Gather feedback

---

## Related Documentation

- `PHASE_5_ADVANCED_AUTOMATION_OUTLINE.md` — Phase 5 overview
- `PHASE_5A_KUBERNETES_DEPLOYMENT.md` — Phase 5A (completed)
- `PHASE_5B_COST_ATTRIBUTION_PLAN.md` — Phase 5B (in progress)
- `metrics-reference.md` — Metrics definitions (TBD)
- `alert-guide.md` — Alert creation & tuning (TBD)

---

**Phase 5C: Observability & Monitoring — Ready for Implementation** 

Next: Instrument workflows with metrics collection.
