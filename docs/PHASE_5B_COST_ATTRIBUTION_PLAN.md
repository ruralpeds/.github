# Phase 5B: Cost Attribution — Planning & Implementation

**Status:** Active Implementation  
**Branch:** `claude/phase-5-advanced-automation`  
**Date Started:** May 4, 2026  
**Target Completion:** May 25, 2026 (3 weeks)  
**Effort:** 40-60 hours

---

## Executive Summary

### Problem Statement
- **Current state:** No visibility into which teams/projects consume CI/CD resources
- **Impact:** Cannot optimize resource allocation or charge back costs fairly
- **Gap:** Missing cost attribution model and metrics collection
- **Opportunity:** Enable data-driven resource decisions with per-team dashboards

### Proposed Solution: Cost Attribution System
- **Instrument workflows** with team/project tags
- **Collect runner usage** metrics (CPU, memory, time, cost)
- **Aggregate costs** per team/project/workflow
- **Create dashboards** for cost visibility
- **Implement charge-back** model (optional)

### Success Metrics
| Metric | Target | Status |
|--------|--------|--------|
| Instrumentation | 100% workflows tagged | ⏳ Implementation |
| Metrics Collection | Daily aggregation | ⏳ Development |
| Cost Accuracy | ±5% vs. actual bill | ⏳ Validation |
| Dashboard | Real-time cost view | ⏳ Creation |
| ROI | $1,000+ monthly insights | ⏳ Measurement |

---

## Architecture: 4-Layer Cost Attribution System

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: INSTRUMENTATION (GitHub Actions Workflows)         │
├─────────────────────────────────────────────────────────────┤
│ - Add cost tags to all workflows: team, project, environment │
│ - Capture job metadata: duration, runner type, status        │
│ - Log to artifacts: cost-metrics.json per workflow run       │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: COLLECTION (Metrics Gathering)                     │
├─────────────────────────────────────────────────────────────┤
│ - Daily collection: Pull cost-metrics from all workflows     │
│ - Normalize data: Convert job metrics to cost ($)            │
│ - Aggregate: Group by team, project, workflow type          │
│ - Store: JSONL audit trail for historical tracking          │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: AGGREGATION (Cost Calculation)                     │
├─────────────────────────────────────────────────────────────┤
│ - Load cost model: Mac runner $0.37/hr, K8s $0.008/min      │
│ - Calculate costs: Duration × Rate for each job              │
│ - Sum by dimension: team, project, workflow, date            │
│ - Track trends: Daily/weekly/monthly cost evolution          │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: REPORTING (Dashboards & Insights)                  │
├─────────────────────────────────────────────────────────────┤
│ - JSON export: org-cost-attribution.json                     │
│ - CSV export: cost-by-team.csv, cost-by-project.csv         │
│ - Markdown dashboard: docs/cost-attribution-dashboard.md     │
│ - Insights: Top spenders, trends, optimization opportunities │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 5B Sub-Tasks

### Task 1: Workflow Instrumentation (1 week)

**Goal:** Add cost tags to all workflows so we can track spending

#### 1.1: Design Cost Tag Schema
```yaml
# Tags to add to all workflows:
team: "platform" | "data" | "services" | "web" | "ops"
project: "gap-analysis" | "audit-log" | "security" | ... (repo name)
environment: "ci" | "staging" | "prod"
criticality: "high" | "medium" | "low"
cost_center: "engineering" | "devops" | "research"
```

#### 1.2: Create Cost Tagging Script
- Script: `scripts/tag-workflows-for-cost.py`
- Function: Read all workflows, inject cost tags
- Output: Tagged workflows + audit trail
- Execution: Run once to tag all existing workflows

#### 1.3: Update CI/CD Baseline
- Update `gap-dashboard.yml` with cost tags
- Update `deadline-breach-notification.yml` with cost tags
- Update `batch-job-executor-kubernetes.yml` with cost tags
- Example:
```yaml
env:
  COST_TEAM: "platform"
  COST_PROJECT: "gap-analysis"
  COST_ENVIRONMENT: "ci"
```

#### 1.4: Create Cost Metrics Logging
- Script: `scripts/log-cost-metrics.sh`
- Function: Capture job metrics at end of workflow
- Fields: job_name, duration_sec, runner_type, status, cost_estimate
- Output: cost-metrics.json artifact

**Deliverable:** All workflows tagged, metrics logging implemented

---

### Task 2: Metrics Collection Pipeline (1 week)

**Goal:** Automatically collect cost data from all workflow runs

#### 2.1: Create Artifact Collector Script
- Script: `scripts/cost-metrics-collector.py`
- Function: Daily job to download all cost-metrics.json artifacts
- Process:
  1. List all workflow runs (last 24 hours)
  2. Download artifacts from each run
  3. Parse cost-metrics.json
  4. Normalize data (convert to standard format)
  5. Append to audit trail (JSONL)

#### 2.2: Create Daily Collection Workflow
- Workflow: `.github/workflows/cost-metrics-daily.yml`
- Trigger: Daily at 02:00 UTC (off-peak)
- Jobs:
  1. collect-metrics: Run cost-metrics-collector.py
  2. archive-metrics: Save to audit-log/cost/daily/
  3. validate-metrics: Check data quality

#### 2.3: Implement Cost Model
- Script: `scripts/cost_model.py`
- Constants:
  ```python
  COST_PER_HOUR = {
      "self-hosted:mac": 0.37,
      "self-hosted:linux": 0.10,
      "github-hosted:ubuntu": 0.008,  # per minute
      "kubernetes": 0.008,  # per minute
  }
  ```
- Function: Calculate cost from duration + runner type

#### 2.4: Build Audit Trail (JSONL)
- File: `audit-log/cost/events.jsonl` (append-only)
- One event per workflow run with cost data
- Immutable historical record for compliance

**Deliverable:** Daily metric collection working, cost model implemented

---

### Task 3: Cost Aggregation & Analysis (1 week)

**Goal:** Calculate costs by team, project, workflow type

#### 3.1: Create Aggregation Script
- Script: `scripts/cost-aggregator.py`
- Input: JSONL audit trail (events.jsonl)
- Process:
  1. Load all cost events
  2. Group by: team, project, workflow, date
  3. Sum costs for each group
  4. Calculate trends (daily, weekly, monthly)
  5. Identify outliers & expensive workflows

#### 3.2: Generate Cost Reports
- JSON report: `org-cost-attribution.json`
  ```json
  {
    "timestamp": "2026-05-25T...",
    "summary": {
      "total_cost": 4500.00,
      "period": "2026-05-01 to 2026-05-25",
      "by_team": {...},
      "by_project": {...},
      "trends": {...}
    },
    "by_team": {
      "platform": { "cost": 1500, "runs": 150 },
      "data": { "cost": 1200, "runs": 120 },
      ...
    },
    "expensive_workflows": [
      { "name": "batch-job-executor-kubernetes", "cost": 450 }
    ]
  }
  ```

- CSV exports:
  - `cost-by-team.csv`: Team, Cost, RunCount, AvgCost
  - `cost-by-project.csv`: Project, Cost, RunCount, AvgCost
  - `cost-by-workflow.csv`: Workflow, Cost, RunCount, AvgCost

#### 3.3: Create Aggregation Workflow
- Workflow: `.github/workflows/cost-attribution-daily.yml`
- Trigger: Daily at 03:00 UTC (after collection)
- Jobs:
  1. aggregate-costs: Run cost-aggregator.py
  2. generate-reports: Create JSON/CSV exports
  3. upload-reports: Save artifacts

**Deliverable:** Daily cost aggregation working, reports generated

---

### Task 4: Dashboards & Reporting (1 week)

**Goal:** Visualize costs and enable decision-making

#### 4.1: Create Markdown Dashboard
- File: `docs/cost-attribution-dashboard.md`
- Sections:
  1. Summary: Total cost, period, YTD
  2. By Team: Cost breakdown, trends
  3. By Project: Cost per project, top spenders
  4. By Workflow: Most expensive workflows
  5. Trends: Daily/weekly/monthly cost evolution
  6. Insights: Opportunities, anomalies
  7. Forecast: Projected monthly/annual costs

#### 4.2: Create JSON Dashboard (for tooling)
- File: `docs/cost-attribution-data.json`
- Structure: Time-series data for custom dashboards
- Use case: Integration with external BI tools

#### 4.3: Create Cost Optimization Recommendations
- Script: `scripts/cost-optimization-recommender.py`
- Analysis:
  1. Identify most expensive workflows
  2. Suggest runner type changes (Mac → K8s if applicable)
  3. Flag long-running jobs for optimization
  4. Recommend consolidation opportunities
  5. Highlight cost anomalies

#### 4.4: Create Issue for Monthly Review
- Workflow: `.github/workflows/cost-review-issue.yml`
- Trigger: Monthly on first Monday
- Content:
  1. Monthly cost summary
  2. Top 5 spenders (teams/projects)
  3. Recommended optimizations
  4. Trend comparison (vs. previous month)

**Deliverable:** Dashboards created, automated monthly reviews

---

## Implementation Timeline

### Week 1: Instrumentation & Collection
```
Mon: Design cost tag schema, create tagging script
Tue: Tag all workflows, implement metrics logging
Wed: Create metrics collector, set up daily workflow
Thu: Implement cost model, validate first data
Fri: Code review, documentation
```

### Week 2: Aggregation & Reports
```
Mon: Create aggregation script
Tue: Generate cost reports (JSON/CSV)
Wed: Create aggregation workflow, test daily runs
Thu: Validate cost accuracy vs. expected ranges
Fri: Code review, optimization
```

### Week 3: Dashboards & Insights
```
Mon: Create markdown dashboard
Tue: Create JSON dashboard for tooling
Wed: Implement cost recommendations
Thu: Create monthly review workflow
Fri: Documentation, final validation
```

---

## Success Criteria

### Week 1 Checkpoint
- [ ] All workflows instrumented with cost tags
- [ ] Metrics logging working for all jobs
- [ ] Daily collection workflow running successfully
- [ ] Cost model implemented & validated

### Week 2 Checkpoint
- [ ] Aggregation script working
- [ ] JSON/CSV reports generating daily
- [ ] Cost accuracy within ±10% of estimates
- [ ] Audit trail (JSONL) growing daily

### Week 3 Checkpoint
- [ ] Cost attribution dashboard live
- [ ] Insights & recommendations working
- [ ] Monthly review workflow configured
- [ ] Cost visibility achievable for all teams

### Final Criteria (Go/No-Go)
- ✅ Cost accuracy: ±5% vs. actual GitHub bill
- ✅ Dashboard: Real-time or < 1 hour delay
- ✅ Adoption: All workflows using cost tags
- ✅ ROI: $1,000+ monthly insights delivered

---

## Detailed Component Specifications

### Component 1: Cost Tagging Script
**File:** `scripts/tag-workflows-for-cost.py` (~250 lines)

```python
#!/usr/bin/env python3
"""
tag-workflows-for-cost.py

Add cost attribution tags to all GitHub Actions workflows.
Tags: team, project, environment, criticality, cost_center

Usage:
    python3 scripts/tag-workflows-for-cost.py \
        --repo-path /path/to/repo \
        --team platform \
        --mapping-file config/cost-mapping.json
"""

# Features:
# - Read all workflows from .github/workflows/
# - Inject cost tags into each workflow as env variables
# - Create backup of original workflows
# - Output change report
# - Idempotent (safe to run multiple times)
```

**Inputs:**
- Mapping file: `config/cost-mapping.json` (workflow → team/project)
- Override flags: `--team`, `--project` (for new workflows)

**Outputs:**
- Tagged workflows (updated YAML files)
- Backup directory: `.github/workflows/.backups/`
- Report: `tag-workflows-report.json`

---

### Component 2: Metrics Collector Script
**File:** `scripts/cost-metrics-collector.py` (~350 lines)

```python
#!/usr/bin/env python3
"""
cost-metrics-collector.py

Download and normalize cost metrics from workflow artifacts.
Runs daily to collect data from all workflow runs.

Usage:
    python3 scripts/cost-metrics-collector.py \
        --token $GITHUB_TOKEN \
        --org ruralpeds \
        --hours 24 \
        --output-dir audit-log/cost
"""

# Features:
# - List workflow runs from last N hours
# - Download cost-metrics.json from artifacts
# - Normalize to standard format
# - Append to JSONL audit trail
# - Validate data quality
# - Handle missing/invalid data
```

**Inputs:**
- GitHub token (org:read, artifacts:read)
- Time window: Last 24 hours (or configurable)

**Outputs:**
- `audit-log/cost/events.jsonl` (append-only audit trail)
- `audit-log/cost/daily/metrics-YYYY-MM-DD.json` (daily snapshot)

**Data Format:**
```json
{
  "timestamp": "2026-05-25T14:30:00Z",
  "workflow_name": "gap-dashboard",
  "job_name": "generate-dashboard",
  "duration_seconds": 1800,
  "runner_type": "self-hosted:mac",
  "cost_estimate": 0.19,
  "team": "platform",
  "project": "gap-analysis",
  "status": "completed"
}
```

---

### Component 3: Cost Aggregator Script
**File:** `scripts/cost-aggregator.py` (~400 lines)

```python
#!/usr/bin/env python3
"""
cost-aggregator.py

Aggregate costs from JSONL audit trail by dimensions.
Generates JSON, CSV, and insights reports.

Usage:
    python3 scripts/cost-aggregator.py \
        --input-dir audit-log/cost \
        --output-dir audit-log/reports \
        --date 2026-05-25
"""

# Features:
# - Load JSONL events from audit trail
# - Group by: team, project, workflow, date, hour
# - Calculate: sum, average, count, trends
# - Identify: expensive workflows, anomalies, patterns
# - Generate: JSON, CSV, markdown reports
# - Forecast: Trending monthly/annual costs
```

**Inputs:**
- JSONL audit trail: `audit-log/cost/events.jsonl`
- Cost model config: `config/cost-model.json`

**Outputs:**
- `org-cost-attribution.json` (comprehensive report)
- `cost-by-team.csv`
- `cost-by-project.csv`
- `cost-by-workflow.csv`
- `cost-trends.json` (historical trends)

---

### Component 4: Dashboard Generator
**File:** `scripts/dashboard-cost-generator.py` (~300 lines)

```python
#!/usr/bin/env python3
"""
dashboard-cost-generator.py

Generate markdown dashboard from cost attribution data.
Creates human-readable cost visibility & insights.

Usage:
    python3 scripts/dashboard-cost-generator.py \
        --input org-cost-attribution.json \
        --output docs/cost-attribution-dashboard.md
"""

# Features:
# - Create markdown tables for each dimension
# - Calculate month-over-month trends
# - Highlight expensive workflows
# - Generate cost optimization recommendations
# - Include team-level drill-downs
# - Add forecast section
```

**Inputs:**
- Cost report: `org-cost-attribution.json`
- Template: `config/dashboard-template.md`

**Outputs:**
- `docs/cost-attribution-dashboard.md` (auto-generated weekly)

---

## Workflows

### Workflow 1: Daily Metrics Collection
**File:** `.github/workflows/cost-metrics-daily.yml` (~200 lines)

```yaml
name: Cost Metrics — Daily Collection
on:
  schedule:
    - cron: "0 2 * * *"  # Daily at 02:00 UTC
jobs:
  collect-metrics:
    runs-on: [self-hosted, mac-studio, arm64]
    steps:
      - uses: actions/checkout@v4
      - run: python scripts/cost-metrics-collector.py ...
      - uses: actions/upload-artifact@v4
        with:
          name: daily-metrics
          path: audit-log/cost/daily/
```

---

### Workflow 2: Daily Cost Aggregation
**File:** `.github/workflows/cost-attribution-daily.yml` (~250 lines)

```yaml
name: Cost Attribution — Daily Aggregation
on:
  schedule:
    - cron: "0 3 * * *"  # Daily at 03:00 UTC
  workflow_dispatch:
jobs:
  aggregate:
    runs-on: [self-hosted, mac-studio, arm64]
    steps:
      - uses: actions/checkout@v4
      - run: python scripts/cost-aggregator.py ...
      - run: python scripts/dashboard-cost-generator.py ...
      - run: git add docs/cost-attribution-dashboard.md && git commit -m "docs: update cost attribution dashboard" && git push
```

---

### Workflow 3: Monthly Cost Review
**File:** `.github/workflows/cost-review-issue.yml` (~180 lines)

```yaml
name: Cost Review — Monthly Issue
on:
  schedule:
    - cron: "0 9 1 * *"  # First day of month at 09:00 UTC
jobs:
  create-review:
    runs-on: [self-hosted, mac-studio, arm64]
    steps:
      - uses: actions/checkout@v4
      - name: Generate monthly review
        run: |
          python scripts/cost-optimization-recommender.py
          cat cost-review-body.md
      - name: Create GitHub issue
        run: gh issue create --title "💰 Monthly Cost Review" --body-file cost-review-body.md
```

---

## Data Model

### Event (JSONL)
```json
{
  "timestamp": "2026-05-25T14:30:00Z",
  "workflow_id": 12345,
  "workflow_name": "gap-dashboard",
  "job_id": 67890,
  "job_name": "generate-dashboard",
  "run_number": 42,
  "run_id": 98765,
  "status": "completed",
  "duration_seconds": 1800,
  "runner_type": "self-hosted:mac",
  "runner_label": "mac-studio",
  "cost_model_version": "1.0",
  "cost_estimate": 0.19,
  "tags": {
    "team": "platform",
    "project": "gap-analysis",
    "environment": "ci",
    "criticality": "high",
    "cost_center": "engineering"
  }
}
```

### Aggregation (JSON)
```json
{
  "timestamp": "2026-05-25T03:00:00Z",
  "period_start": "2026-05-01T00:00:00Z",
  "period_end": "2026-05-25T23:59:59Z",
  "period_days": 25,
  "summary": {
    "total_cost": 4500.00,
    "average_daily_cost": 180.00,
    "projected_monthly_cost": 5400.00,
    "projected_annual_cost": 64800.00,
    "total_runs": 850,
    "average_cost_per_run": 5.29
  },
  "by_team": {
    "platform": { "cost": 1500.00, "runs": 150, "pct": 33 },
    "data": { "cost": 1200.00, "runs": 120, "pct": 27 },
    "services": { "cost": 900.00, "runs": 200, "pct": 20 },
    "web": { "cost": 600.00, "runs": 250, "pct": 13 },
    "ops": { "cost": 300.00, "runs": 130, "pct": 7 }
  },
  "by_project": {...},
  "by_workflow": {...},
  "expensive_workflows": [
    { "name": "batch-job-executor-kubernetes", "cost": 450, "runs": 30 }
  ],
  "trends": {
    "daily": [
      { "date": "2026-05-01", "cost": 150 },
      { "date": "2026-05-02", "cost": 180 }
    ]
  }
}
```

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Cost data inaccuracy | MEDIUM | HIGH | Validate against GitHub invoices weekly |
| Workflow tagging missed | MEDIUM | MEDIUM | Automated checks in CI for untagged workflows |
| Metric collection fails | LOW | MEDIUM | Retry logic, daily validation, alerting |
| Data storage costs | LOW | LOW | Archive old data to cold storage |
| Team resistance | MEDIUM | MEDIUM | Clear communication of benefits, transparency |

---

## Success Metrics

### Implementation Phase
- [ ] 100% workflows tagged (52/52)
- [ ] Daily collection success rate > 95%
- [ ] Cost accuracy within ±10%
- [ ] Zero data loss in JSONL trail

### Dashboard Phase
- [ ] Cost attribution dashboard live
- [ ] Insights section populated
- [ ] Team dashboards available
- [ ] Monthly review working

### Adoption Phase
- [ ] All teams using cost tags
- [ ] Cost reduction decisions made
- [ ] ROI: $1,000+ monthly insights
- [ ] Dashboard visited weekly by teams

---

## Deliverables Checklist

### Scripts (4 files, ~1,300 lines)
- [ ] `tag-workflows-for-cost.py` (250 lines)
- [ ] `cost-metrics-collector.py` (350 lines)
- [ ] `cost-aggregator.py` (400 lines)
- [ ] `dashboard-cost-generator.py` (300 lines)

### Workflows (3 files, ~630 lines)
- [ ] `.github/workflows/cost-metrics-daily.yml` (200 lines)
- [ ] `.github/workflows/cost-attribution-daily.yml` (250 lines)
- [ ] `.github/workflows/cost-review-issue.yml` (180 lines)

### Configuration (2 files, ~150 lines)
- [ ] `config/cost-mapping.json` (workflow → team)
- [ ] `config/cost-model.json` (rates by runner type)

### Documentation (2 files, ~600 lines)
- [ ] `docs/cost-attribution-dashboard.md` (auto-generated)
- [ ] `docs/cost-attribution-guide.md` (operational guide)

### Data Artifacts (Continuous)
- [ ] `audit-log/cost/events.jsonl` (append-only trail)
- [ ] `org-cost-attribution.json` (daily report)
- [ ] `cost-by-*.csv` (daily exports)

**Total Phase 5B Effort:** ~1,300 lines code + 600 lines docs + 3 workflows

---

## Next Steps

### Immediate (This Week)
1. Review Phase 5B plan with team
2. Design cost tag schema (finalize)
3. Create cost-mapping.json configuration
4. Set up audit-log/cost/ directory structure

### Implementation (Week of May 11)
1. Develop & test tagging script
2. Develop & test metrics collector
3. Tag all workflows
4. Set up daily workflows

### Validation (Week of May 18)
1. Develop aggregation script
2. Validate cost accuracy
3. Create dashboards
4. Set up monthly reviews

### Launch (Week of May 25)
1. Deploy all components
2. Announce to teams
3. Monitor for issues
4. Gather feedback

---

## Related Documentation

- `PHASE_5_ADVANCED_AUTOMATION_OUTLINE.md` — Phase 5 overview
- `PHASE_5A_KUBERNETES_DEPLOYMENT.md` — Phase 5A (completed)
- `cost-model-reference.md` — Cost rates & calculation (TBD)
- `cost-attribution-guide.md` — User guide for teams (TBD)

---

**Phase 5B: Cost Attribution — Ready for Implementation** 

Next: Develop cost tagging script and begin instrumentation.
