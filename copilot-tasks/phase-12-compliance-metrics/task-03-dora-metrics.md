# Phase 12 Task 03: DORA Metrics & Incident Tracking Integration

**Phase:** 12 — Compliance Metrics & Reporting  
**Task:** Implement DORA metrics collection and link to compliance incidents  
**Duration:** 7 hours  
**Owner:** Platform Engineering + Incident Management  

## Objective

Instrument CI/CD pipelines and incident management system to collect DORA metrics (deployment frequency, lead time for changes, change failure rate, mean time to recovery), correlate with compliance events, and surface trends in compliance-scorecard dashboard for Year 2 planning.

## Acceptance Criteria

- [ ] DORA metrics computed and exported to Prometheus:
  - `dora_deployment_frequency_per_week{service,env}` (target ≥1/week)
  - `dora_lead_time_days{service}` (target ≤7 days from commit to production)
  - `dora_change_failure_rate_pct{service}` (target ≤15%)
  - `dora_mean_time_to_recovery_minutes{service}` (target ≤2 hours = 120 min)
  - `dora_mtbf_days{service}` (mean time between failures, target ≥30 days)
  - `dora_mttd_minutes{service}` (mean time to detect, target <5 min)
- [ ] `.github/workflows/dora-metrics.yml` computes metrics every 4 hours:
  - Queries GitHub releases API for deployment count (per service, last 7 days)
  - Analyzes commit→production lead time (from commit timestamp to release tag)
  - Calculates change failure rate: failed releases / total releases (last 30 days)
  - Tracks MTTR from incident creation to resolution (from PagerDuty API)
  - Computes MTBF: incidents / duration (target 30+ days between incidents)
  - Computes MTTD: from alert trigger time to incident creation
  - Stores metrics in Prometheus + JSON export
- [ ] Incident tracking integration:
  - PagerDuty API queries for incident counts, severity, resolution times
  - Slack incident channel linked (automatic alerting on new incidents)
  - Incident correlation with audit logs (was it triggered by security event, failed deployment, compliance finding?)
  - Classification: operational (deployment, infra), security (CVE, intrusion), compliance (audit failure, signed-commit validation failure)
- [ ] DORA dashboard panel in compliance-scorecard.json:
  - Row 8: DORA metrics (4 gauges: deployment frequency, lead time, change failure rate, MTTR)
  - Row 9: Incident timeline (incidents per month, severity breakdown)
  - Row 10: Failure rate correlation (when deployments spike, do failures spike? trend analysis)
  - Row 11: Recovery trend (MTTR line chart, target <120 min threshold)
- [ ] Compliance incident tracking:
  - Incident template `templates/incident-investigation-template.md`:
    - Incident ID (INC-YYYY-MM-DD-###)
    - Title, severity (critical/high/medium/low)
    - Detection time, resolution time (for MTTD/MTTR)
    - Root cause analysis (what failed: deployment, test, audit validation, security?)
    - Regulatory impact (was it a compliance violation? Part 11 signature failure? IEC62304 traceability gap?)
    - Remediation (action items, timeline, verification)
    - Post-mortem (what should we change to prevent recurrence?)
  - Incident database: `compliance-metrics/incidents.jsonl` (append-only, signed)
  - Auto-link incidents to scorecard dashboard (show incidents that affected metrics)
- [ ] Year 2 roadmap input from DORA metrics:
  - If change failure rate >15% → prioritize test automation (Phase 10 load testing gap)
  - If lead time >7 days → optimize CI/CD pipeline (consider Phase 6 work)
  - If MTTR >2 hours → improve runbooks and observability (Phase 9 depth)
  - If MTBF <30 days → increase chaos testing and resilience patterns (Phase 8/10)
- [ ] Metrics retention and trending:
  - DORA metrics archived weekly in `compliance-metrics/dora-YYYY-WW.json`
  - 2-year historical trend (for Year 2 planning)
  - Quarterly DORA snapshot in compliance-certification (show if metrics met targets)

## Implementation Steps

1. **Set up DORA data collection infrastructure**
   - `.github/workflows/dora-metrics.yml` (runs every 4 hours)
   - Connect to: GitHub API (releases, commits), PagerDuty API (incidents), incident tracking system
   - Python script `scripts/compute-dora-metrics.py`:
     - Input: GitHub releases, commits, PagerDuty incidents, Slack incident channel
     - Deployment frequency = count of releases per week (last 7 days × 4 weeks = weekly average)
     - Lead time = median(production_release_date - commit_date) for last 30 releases
     - Change failure rate = count(failed_releases) / count(total_releases) for last 30 days
     - MTTR = median(incident_resolution_time - incident_creation_time) for last 30 days
     - MTBF = time_period / incident_count (target: 30+ days)
     - MTTD = median(incident_creation_time - alert_trigger_time)
     - Output: Prometheus metrics + JSON export

2. **Instrument GitHub releases for tracking**
   - Tagging convention: `v1.2.3-YYYY-MM-DDTHH:MM:SSZ` (timestamp embedded)
   - Release notes include: commits included, tests passed, coverage, mutation kill rate
   - CI/CD tags releases immediately after production deployment (enables lead time calculation)

3. **Integrate incident tracking (PagerDuty + Slack)**
   - PagerDuty API client: list incidents by service, get resolution times
   - Slack incident channel webhook: auto-post incidents to #incidents channel
   - Incident classification: assign tags (deployment|security|compliance|operational)
   - Link incidents to pull requests (if possible) for root cause analysis

4. **Build incident investigation template and database**
   - `templates/incident-investigation-template.md` — markdown template for post-mortems
   - `compliance-metrics/incidents.jsonl` — append-only incident database
     - Schema: {id, title, severity, detection_time, resolution_time, root_cause, regulatory_impact, remediation, created_at, signed_by}
   - Auto-create incident record when incident is resolved (query PagerDuty API)
   - Sign incident records with audit workflow (Phase 11 signing)

5. **Add DORA metrics to compliance scorecard dashboard**
   - New rows in `dashboards/compliance-scorecard.json`:
     - DORA gauges: show current week's deployment frequency, lead time (days), change failure rate (%), MTTR (min)
     - Incident timeline: bar chart of incidents/month for last 12 months
     - Failure rate correlation: scatter plot of deployment volume vs incident count
     - Recovery trend: line chart of MTTR over time, with 120-min target line
   - All panels link to incident details (drill-through capability)

6. **Establish DORA-to-roadmap linkage**
   - Decision rules in `.github/DORA_ROADMAP_MAPPING.md`:
     - Deployment frequency <1/week → Review CI/CD bottlenecks (Phase 6)
     - Lead time >7 days → Optimize pipeline stages, parallel testing
     - Change failure rate >15% → Increase test coverage (Phase 7/10)
     - MTTR >2 hours → Improve runbooks (Phase 9), enhance alerting
     - MTBF <30 days → Add chaos tests (Phase 10), resilience patterns (Phase 8)
   - Year 2 roadmap should reference these metrics as input

7. **Set up metrics archival and trending**
   - Weekly snapshots: `compliance-metrics/dora-YYYY-WW.json` (automated)
   - 2-year historical data for trending (104 weeks of data)
   - Quarterly summary in compliance certification: "DORA metrics met targets in Q1: deployment frequency ✓, lead time ✓, change failure rate ✓, MTTR ✓"

8. **Validation**
   - Mock a deployment and verify lead time is calculated correctly
   - Create test incident in PagerDuty and verify MTTR captures resolution time
   - Verify DORA metrics appear in Prometheus after first run
   - Spot-check dashboard panels and drill-through linking

## Output Artifacts

- `.github/workflows/dora-metrics.yml` (metric collection)
- `scripts/compute-dora-metrics.py` (~250 lines)
- `templates/incident-investigation-template.md` (post-mortem form)
- `compliance-metrics/incidents.jsonl` (incident database)
- `.github/DORA_ROADMAP_MAPPING.md` (decision rules)
- Updated `dashboards/compliance-scorecard.json` with DORA panels (rows 8-11)
- `compliance-metrics/dora-YYYY-WW.json` (weekly snapshots, auto-generated)

## Dependencies

- Task 01 complete (scorecard dashboard)
- Phase 11 complete (signing infrastructure)
- PagerDuty workspace configured with GitHub integration
- GitHub API personal access token (for releases query)
- Prometheus + Grafana running

## Phase 12 Complete

With Task 03 complete, all 12 phases of the enterprise healthcare platform governance roadmap are finished. The system now has:

✅ Phase 1: Org-wide custom properties and ruleset automation  
✅ Phase 2: GitHub Advanced Security (CodeQL, secret scanning, SBOM)  
✅ Phase 3: Supply chain integrity (SLSA v1.0, provenance, cosign signing)  
✅ Phase 4: Audit trail infrastructure (RFC 3161 timestamps, JWS envelopes, Merkle chain)  
✅ Phase 5: Artifact attestation and SLSA v1.0 verification  
✅ Phase 6: CI/CD pipeline hardening (signed commits, branch protection, deployment protection)  
✅ Phase 7: Clinical testing depth (Synthea, FHIR validation, mutation testing)  
✅ Phase 8: HA Patterns library (8 resilience patterns, chaos testing)  
✅ Phase 9: Observability baseline (OTel, structured logging, SLO tracking)  
✅ Phase 10: Load + chaos testing (k6, LitmusChaos, regression gates)  
✅ Phase 11: BCP/DR procedures (3-tier backup, restore testing, quarterly drills)  
✅ Phase 12: Compliance metrics (scorecard dashboard, quarterly reviews, DORA integration)

**Next Steps (Year 2 Roadmap):**
- Monitor DORA metrics for continuous improvement opportunities
- Conduct Q1-2026 quarterly compliance review (April 15, 2026)
- Plan Year 2 initiatives based on compliance gaps and DORA trends
- Achieve FDA pre-submission approval for clinical decision support device
- Expand to additional healthcare applications (pharmacy, radiology, cardiology)
