# Phase 12 Task 01: Compliance Scorecard Dashboard Implementation

**Phase:** 12 — Compliance Metrics & Reporting  
**Task:** Build real-time compliance scorecard dashboard (Grafana + automation)  
**Duration:** 8 hours  
**Owner:** Platform Engineering  

## Objective

Implement a real-time compliance scorecard dashboard in Grafana that computes the 9-factor compliance score across all repos, displays OpenSSF Scorecard per repo, and surfaces trends over time. Dashboard must refresh every 2 hours and integrate with Phase 11 audit logs.

## Acceptance Criteria

- [ ] Grafana dashboard `dashboards/compliance-scorecard.json` created with:
  - Real-time compliance score (9-factor weighted) at organization level
  - Per-repo breakdown (data-classification, iec62304-class, regulated status)
  - OpenSSF Scorecard trends (target ≥7.0 for clinical-decision repos)
  - Vulnerability posture (0 critical CVEs, SBOM staleness)
  - Test quality breakdown by class (coverage %, mutation kill rate %)
  - SLO compliance timeline (availability, latency, error rate)
- [ ] `.github/workflows/reusable-compliance-scorecard.yml` computes scores every 2 hours
  - Fetches CodeQL scan counts (minimum 2 scans/month)
  - Aggregates SBOM present status from dependabot/renovate
  - Counts signed commits from audit logs
  - Parses code coverage reports (target by class)
  - Reads mutation test results
  - Queries OpenSSF Scorecard API
  - Validates IEC 62304 traceability completion
  - Outputs JSON to `compliance-metrics/scores-YYYY-MM-DD.json`
- [ ] Prometheus metrics exported:
  - `compliance_score{org,threshold}` (0-100)
  - `codeql_scan_count{repo,org}` (minimum 2/month)
  - `sbom_present{repo,org}` (0/1 binary)
  - `signed_commits_pct{repo,org}` (0-100)
  - `code_coverage_pct{repo,class}` (target A:70%, B:85%, C:95%)
  - `mutation_kill_rate_pct{repo,class}` (target A:0%, B:70%, C:85%)
  - `openssh_scorecard_rating{repo,org}` (0-100)
  - `audit_completeness_pct{org}` (100% expected)
  - `slo_availability_pct{service}` (target 99.9%)
- [ ] Grafana alerting rules:
  - Score drop >5 points → warning (1h threshold)
  - Critical CVE found → immediate alert
  - SBOM stale >30 days → warning
  - OpenSSF Scorecard <7.0 (clinical-decision repos) → alert
  - Audit completeness <100% → critical
- [ ] Dashboard linked from `.github/README.md` with access instructions
- [ ] All metrics persisted to Prometheus + exported as JSON for quarterly review

## Implementation Steps

1. **Set up Grafana data sources** (if not already present)
   - Prometheus: `http://prometheus:9090`
   - Loki: `http://loki:3100` (for audit logs)
   - JSON API plugin for OpenSSF Scorecard fetching

2. **Create metrics export workflow**
   - `.github/workflows/reusable-compliance-scorecard.yml`
   - Runs every 2 hours on schedule
   - Python script: `scripts/compute-compliance-score.py`
     - Input: GitHub Custom Properties API, CodeQL scan history, SBOM count, audit logs, OpenSSF API
     - Calculate weighted score: (15% signed commits + 10% CodeQL + 10% SBOM + 10% provenance + 10% PHI scan + 15% code coverage + 10% mutation kill rate + 10% audit completeness + 10% IEC62304 traceability)
     - Validate thresholds per class (A/B/C)
     - Output JSON with timestamp, repo list, overall score, vulnerability summary
   - Prometheus pushgateway integration for metric export

3. **Build Grafana dashboard**
   - `dashboards/compliance-scorecard.json` (Grafana v10+)
   - Row 1: Overall score gauge (red <70%, yellow 70-85%, green >85%)
   - Row 2: Per-repo grid (name, class, score, status)
   - Row 3: OpenSSF Scorecard trends (line chart by repo, 90-day history)
   - Row 4: CVE/vulnerability heatmap (repo vs severity)
   - Row 5: Test quality breakdown (coverage % by class as grouped bars, mutation kill rate)
   - Row 6: SLO compliance timeline (availability % line, P95 latency, error rate)
   - Row 7: Audit log status (completeness %, events in last 24h, failed validations)
   - All panels: 2h refresh, drill-through to repo-specific dashboards

4. **Wire alerting rules**
   - `monitoring/compliance-alerts.yml` (Prometheus rules)
   - Score drop alert: `(compliance_score{} < 85) for 1h`
   - Critical CVE alert: `vulnerability_severity == "critical"`
   - SBOM stale: `time(now) - sbom_last_update > 30d`
   - OpenSSF low: `openssh_scorecard_rating < 7.0 AND repo_class == "clinical-decision"`
   - Audit gap: `audit_completeness_pct < 100`
   - Send to Slack channel #compliance-alerts + PagerDuty for critical

5. **Create dashboard documentation**
   - Explain each metric (calculation, thresholds, interpretation)
   - Link to docs/metrics/COMPLIANCE_METRICS.md
   - Add runbook for score drop (investigate which factor regressed)
   - Add runbook for CVE/SBOM remediation

6. **Validation**
   - Manually verify first scorecard computation
   - Validate metrics appear in Prometheus after first run
   - Test dashboard queries and panel rendering
   - Confirm alerting rule triggers correctly

## Output Artifacts

- `.github/workflows/reusable-compliance-scorecard.yml` (workflow definition)
- `scripts/compute-compliance-score.py` (score computation logic, ~150 lines)
- `dashboards/compliance-scorecard.json` (Grafana dashboard, exportable)
- `monitoring/compliance-alerts.yml` (Prometheus alerting rules)
- `compliance-metrics/scores-YYYY-MM-DD.json` (per-run output)
- Updated `.github/README.md` with dashboard link and metric definitions

## Dependencies

- Phase 9 complete (OpenTelemetry, structured logging)
- Phase 11 complete (audit logs in `audit-logs/YYYY-MM.jsonl`)
- Grafana 10+ with Prometheus data source
- Prometheus with pushgateway (for metric export)
- GitHub Custom Properties configured (data-classification, iec62304-class, regulated, etc.)

## Next Task

→ **Task 02: Quarterly Compliance Review Process** — Formalize quarterly meeting cadence, compliance trend analysis, and Year 2 roadmap planning based on scorecard.
