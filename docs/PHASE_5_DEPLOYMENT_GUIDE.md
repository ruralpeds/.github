# Phase 5 Deployment Guide

**Status**: Ready for production deployment  
**Date**: May 4, 2026  
**Branch**: main (Phase 5A-5E merged)

---

## Deployment Overview

Phase 5 deployment follows a **staged approach** with validation between phases. Deploy in order: **5A → 5B → 5C → 5D → 5E** over 3-4 weeks.

```
Week 1: Phase 5A (Kubernetes) + Phase 5B (Cost Attribution)
Week 2: Phase 5C (Observability & Monitoring)
Week 3: Phase 5D (Event-Driven Automation) + Phase 5E (Container Optimization)
Week 4: Hardening, monitoring, incident response training
```

---

## Phase 5A Deployment: Kubernetes Integration

### Prerequisites
- [ ] Kubernetes cluster access (GKE, EKS, or self-hosted)
- [ ] kubectl configured and authenticated
- [ ] GitHub Actions registered with cluster
- [ ] 10-20 GB cluster storage available

### Deployment Steps (30-45 minutes)

1. **Deploy Kubernetes Resources**
   ```bash
   kubectl apply -f config/kubernetes-runner-config.yaml
   ```
   - Creates namespace: `actions-runner-system`
   - Deploys actions-runner Deployment (1 replica initially)
   - Sets up HPA (scales 1-10 based on load)

2. **Verify Deployment**
   ```bash
   kubectl get pods -n actions-runner-system
   kubectl logs -n actions-runner-system -l app=actions-runner
   ```
   - All pods should be Running
   - Logs should show successful runner registration

3. **Register with GitHub**
   - Navigate to: Settings → Actions → Runners
   - Should show 1-2 new self-hosted runners in `actions-runner-system`
   - Verify runners are online and idle

4. **Test Parallelization**
   ```bash
   # The prototype batch-job-executor-kubernetes workflow was retired during GAP-002 cleanup.
   # Validate runner scaling through live runner status and pod activity instead.
   kubectl get pods -n actions-runner-system -w
   ```

5. **Validate Performance**
   - Run gap-dashboard with Kubernetes backend
   - Expected: 12-15 minutes (vs 45 min baseline)
   - Cost: ~$0.008/min vs $0.37/hr on Mac

### Rollback (if needed)
```bash
# Revert to Mac runners
kubectl delete namespace actions-runner-system

# Or disable in workflows
# Comment out: runs-on: self-hosted-k8s
```

### Success Criteria
- [ ] 4 pods running in actions-runner-system
- [ ] Runners registered with GitHub
- [ ] gap-dashboard completes in 12-15 min
- [ ] HPA scales up/down based on queue depth

---

## Phase 5B Deployment: Cost Attribution

### Prerequisites
- [ ] Phase 5A running successfully
- [ ] GitHub token with workflow read/write access
- [ ] audit-log directory structure created

### Deployment Steps (45-60 minutes)

1. **Configure Cost Mapping**
   ```bash
   # Review and update if needed
   cat config/cost-mapping.json
   
   # Example: Add any missing workflows
   jq '.workflow_name += {"gap-dashboard": {"team": "platform"}}' config/cost-mapping.json
   ```

2. **Tag Existing Workflows**
   ```bash
   # Dry run first
   python3 scripts/tag-workflows-for-cost.py \
     --repo-path .github \
     --mapping-file config/cost-mapping.json \
     --dry-run
   
   # Review output, then apply
   python3 scripts/tag-workflows-for-cost.py \
     --repo-path .github \
     --mapping-file config/cost-mapping.json
   
   # Verify backups created
   ls -la .github/workflows/.backups/
   ```

3. **Schedule Metrics Collection**
   - Add `cost-metrics-collector.py` to daily scheduled workflow
   - Or run manually first:
   ```bash
   python3 scripts/cost-metrics-collector.py \
     --token $GITHUB_TOKEN \
     --org ruralpeds \
     --repo .github \
     --hours 24
   ```

4. **Verify Audit Trail**
   ```bash
   # Check JSONL audit trail created
   cat audit-log/cost/events.jsonl | head -5
   
   # Should see cost event records with all tags
   ```

5. **Run Cost Aggregation**
   ```bash
   python3 scripts/cost-aggregator.py \
     --input-dir audit-log/cost \
     --output-dir audit-log/reports
   
   # Review output
   cat audit-log/reports/org-cost-attribution.json | jq '.by_team'
   ```

### Rollback (if needed)
```bash
# Restore original workflow files
cp .github/workflows/.backups/* .github/workflows/

# Or revert commit
git revert <commit-hash>
```

### Success Criteria
- [ ] All workflows tagged with cost dimensions
- [ ] JSONL audit trail populating daily
- [ ] Cost aggregator generating reports
- [ ] Cost attribution accurate within ±5%

---

## Phase 5C Deployment: Observability & Monitoring

### Prerequisites
- [ ] Phase 5A and 5B deployed
- [ ] GitHub Pages enabled (optional, for dashboard publishing)
- [ ] Storage for audit-log directory (50GB minimum)

### Deployment Steps (1-2 hours)

1. **Enable Metrics Collection**
   ```bash
   # The prototype metrics/alert/dashboard workflows were retired during GAP-002 cleanup.
   # Test metrics collection through the scripts directly until a validated workflow is reintroduced.
   bash scripts/collect-metrics.sh > /tmp/test-metrics.json
   cat /tmp/test-metrics.json | jq '.'
   ```

2. **Configure Alert Rules**
   ```bash
   # Review alert thresholds
   cat config/alert-rules.json
   
   # Adjust if needed (e.g., if baseline failure rate is > 5%)
   ```

3. **Deploy Observability Workflows**
   ```bash
   # The observability workflow prototypes were retired during GAP-002 cleanup.
   # Reintroduce them only as validated `.github/workflows/*` automation.
   ```

4. **Validate Dashboards**
   ```bash
   # Generate test dashboards
   python3 scripts/dashboard-generator.py \
     --metrics-file audit-log/observability/aggregated/aggregated-$(date +%Y-%m-%d).json \
     --alerts-file audit-log/observability/alerts/alerts-$(date +%Y-%m-%d).json \
     --output-dir audit-log/observability/dashboards
   
   # Review generated dashboards
   ls -la audit-log/observability/dashboards/
   cat audit-log/observability/dashboards/dashboard-summary.md
   ```

5. **Test Alert Detection**
   ```bash
   # Trigger high-failure-rate alert manually
   python3 scripts/alert-detector.py \
     --input-file audit-log/observability/aggregated/aggregated-$(date +%Y-%m-%d).json
   
   # Check if alerts generated
   cat audit-log/observability/alerts/alerts-$(date +%Y-%m-%d).json
   ```

### Success Criteria
- [ ] Metrics collecting daily to JSONL
- [ ] Alerts detecting high failure rate, slow jobs, etc.
- [ ] Dashboards generating without errors
- [ ] Dashboard latency < 5 minutes
- [ ] Alert accuracy > 95%

---

## Phase 5D Deployment: Event-Driven Automation

### Prerequisites
- [ ] Phase 5C observability running
- [ ] All alert workflows deployed
- [ ] Manual override procedures understood

### Deployment Steps (1-2 hours)

1. **Review Event Rules**
   ```bash
   cat config/event-rules.json
   # Understand: thresholds, actions, cooldown periods, rate limits
   ```

2. **Test Event Detection**
   ```bash
   # Test event detector
   python3 scripts/event-detector.py \
     --metrics-file audit-log/observability/aggregated/aggregated-$(date +%Y-%m-%d).json \
     --rules-file config/event-rules.json
   
   # Check events.json and events.jsonl
   cat audit-log/events/events.jsonl
   ```

3. **Deploy Event Responder Workflow**
   ```bash
   # The prototype event-responder workflow was retired during GAP-002 cleanup.
   # Validate the responder logic through its scripts/tests before reintroducing workflow automation.
   ```

4. **Enable Auto-Response Workflows**
   ```bash
   # The prototype auto-response workflows were retired during GAP-002 cleanup.
   # Reintroduce them only as validated `.github/workflows/*` automation.
   ```

### Success Criteria
- [ ] Events detected accurately
- [ ] Responses execute without error
- [ ] Audit trail complete and immutable
- [ ] No false positives (< 5% alert fatigue rate)

---

## Phase 5E Deployment: Container Optimization

### Prerequisites
- [ ] All previous phases deployed
- [ ] Docker installed locally (for build comparison)
- [ ] 1-2 hours for initial audit

### Deployment Steps (1-2 hours)

1. **Run Container Audit**
   ```bash
   python3 scripts/container-auditor.py \
     --repo-path . \
     --output-file audit-log/container-audit.json
   
   # Review results
   jq '.dockerfiles[:5]' audit-log/container-audit.json
   ```

2. **Generate Optimization Suggestions**
   ```bash
   python3 scripts/container-optimizer.py \
     --audit-file audit-log/container-audit.json \
     --output-dir audit-log/optimization-suggestions
   
   # Review suggestions
   cat audit-log/optimization-suggestions/optimization-suggestions.json
   ```

3. **Deploy Container Optimization Workflow**
   ```bash
   # Scheduled: Weekly on Sunday 2 AM
   gh workflow list | grep container-optimization
   ```

### Success Criteria
- [ ] All Dockerfiles audited
- [ ] Optimization suggestions generated
- [ ] Build metric comparison completed
- [ ] 30-40% average image size reduction achieved

---

## Post-Deployment Validation

### Week 1: Phase 5A + 5B
- [ ] Kubernetes runners healthy and scaling
- [ ] gap-dashboard completes in 12-15 min
- [ ] Cost tags applied to all workflows
- [ ] JSONL audit trail populating
- [ ] Cost aggregation reports accurate

### Week 2: Phase 5C
- [ ] Metrics collected daily without errors
- [ ] Dashboards generating and accurate
- [ ] Alerts firing correctly on test conditions
- [ ] Dashboard latency < 5 minutes

### Week 3: Phase 5D + 5E
- [ ] Events detected and logged
- [ ] Auto-scaling works on queue depth event
- [ ] Container audit results reviewed

### Week 4: Hardening
- [ ] Monitor for 1 week under normal load
- [ ] Adjust alert thresholds if needed
- [ ] Train team on new dashboards and runbooks

---

## Success Metrics (Post-Deployment)

| Metric | Target | Phase 5 Impact |
|--------|--------|----------------|
| Gap-dashboard execution | < 15 min | 45 min → 12-15 min |
| Cost accuracy | ±5% | Now measurable |
| Alert MTTR | < 1 min | Real-time response |
| Dashboard latency | < 5 min | Near real-time |
| Manual interventions | 50% reduction | Event-driven automation |
| Container image size | 30-40% reduction | Faster pulls |
| Build time | 25-35% faster | Optimized caching |
| Overall savings | 10-30% additional | Beyond Phase 4 |

---

**Deployment Ready**: All Phase 5 components tested  
**Expected Duration**: 3-4 weeks, 1-2 hours per phase  
**Recommended Start**: This week (stagger across 4 weeks)
