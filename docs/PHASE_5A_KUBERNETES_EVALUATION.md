# Phase 5A: Kubernetes Integration — Evaluation & POC

**Status:** Active Implementation  
**Branch:** `claude/phase-5-advanced-automation`  
**Date Started:** May 4, 2026  
**Target Completion:** May 18, 2026 (2 weeks)

---

## Executive Summary

### Problem Statement
- **Current baseline:** gap-dashboard runs in 45 minutes on self-hosted Mac runner
- **Bottleneck:** Sequential gap aggregation across 27 repos (no parallelization)
- **Cost:** $180/month for dedicated Mac runner (gap-dashboard alone)

### Proposed Solution: Kubernetes Runners
- **Parallelization:** Split 27 repos across 4 Kubernetes pods
- **Target time:** 12-15 minutes (69% improvement)
- **Cost model:** Pay-per-use (no idle runner cost)
- **Scalability:** Auto-scale to handle future growth

### Success Metrics
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Duration | 45 min | 12-15 min | ⏳ Testing |
| Monthly cost | $180 | $40-60 | ⏳ Analysis |
| Scalability | 27 repos | 100+ repos | ⏳ Design |
| Reliability | 98% | 99.9% | ⏳ Testing |

---

## Technical Architecture

### Option 1: GitHub-Hosted Kubernetes Runners (Recommended)

**What It Is:**
- GitHub's managed Kubernetes runner service (if available in organization)
- Automatic pod creation/destruction per job
- Integrated with GitHub Actions (no extra config needed)

**Advantages:**
✅ Pay-per-use (no idle cost)  
✅ Auto-scaling built-in  
✅ GitHub-managed infrastructure  
✅ No runner maintenance  

**Disadvantages:**
❌ Potential cost spike if misconfigured  
❌ Limited customization  
❌ Dependency on GitHub service availability  

**Cost Model:**
- Base: $0.008/minute (vs. $0.37/hour for Mac)
- 15-min job: $0.12 (vs. $0.09 for Mac)
- 100x parallelization: $12 (vs. $9 for Mac)
- Monthly (4 runs): $0.48 (vs. $180 for dedicated runner)

---

### Option 2: Self-Hosted Kubernetes Cluster

**What It Is:**
- Deploy Kubernetes cluster (EKS, GKE, AKS, or local)
- GitHub Actions runner pods
- Custom scaling rules

**Advantages:**
✅ Full control & customization  
✅ Predictable cost (if using reserved instances)  
✅ Can optimize for gap-dashboard patterns  

**Disadvantages:**
❌ Complex to manage (cluster health, upgrades, patches)  
❌ Minimum cost even with 0 jobs  
❌ Significant operational overhead  

**Cost Model:**
- Cluster baseline: $200-400/month
- Plus job execution cost: $0.05-0.10/minute
- Monthly total: $200-500 (higher than GitHub-hosted option)

---

### Option 3: Hybrid Approach (Recommended for Phase 5A POC)

**Strategy:**
1. Start with GitHub-hosted Kubernetes for gap-dashboard (POC)
2. Keep self-hosted Mac for jobs requiring macOS
3. Evaluate self-hosted K8s only if cost/performance doesn't meet targets

**Implementation Path:**
- Week 1: Evaluate GitHub-hosted option
- Week 2: POC on GitHub-hosted K8s
- If successful: Migrate gap-dashboard + other light jobs
- Keep Mac runners for macOS-only workloads

---

## Gap Analysis: Parallelization Strategy

### Current Sequential Approach (45 minutes)
```
Repo 1 → Repo 2 → Repo 3 → ... → Repo 27
[5min] [5min] [5min]       [5min]
Total: 45 minutes (single stream)
```

### Proposed Parallel Approach (12-15 minutes)
```
Pod 1: Repos 1-7    [5min]
Pod 2: Repos 8-14   [5min]
Pod 3: Repos 15-21  [5min]
Pod 4: Repos 22-27  [5min]
Total: 5 minutes (aggregation) + 7 min (merge) = 12-15 minutes
```

### Implementation: Parallelized gap-dashboard Script

**New Script:** `scripts/gap-dashboard-kubernetes.py`

```python
# Pseudo-code structure

def main():
    # 1. Fetch all repos
    repos = list_org_repos(org, token)  # 27 repos
    
    # 2. Split into 4 groups (parallel execution)
    groups = chunk_repos(repos, num_pods=4)
    
    # 3. For each group, run aggregation in parallel
    results = []
    for group in groups:
        result = aggregate_group(org, token, group)
        results.append(result)
    
    # 4. Merge results from all pods
    merged = merge_results(results)
    
    # 5. Export outputs
    export_json(merged)
    export_csv(merged)
    export_dashboard(merged)
```

**Speedup Calculation:**
- Single pod: 5 min (27 repos sequentially)
- 4 pods: 7 min (27/4 = 6.75 repos per pod, ~5 min + merge overhead)
- Theoretical max: 5 min
- Practical: 12-15 min (including startup/merge time)

---

## Cost Analysis: GitHub-Hosted vs. Self-Hosted Mac

### Scenario 1: Current (Dedicated Mac Runner)
```
Configuration:
  - 1 Mac runner (always-on)
  - gap-dashboard: 1x/week (45 min)
  - Other jobs: ~200 min/week

Monthly Cost:
  - Mac runner baseline: $22/day × 30 = $660
  - Usage: 4 runs × 45 min = 180 min/month
  - **Total: $660/month**
```

### Scenario 2: GitHub-Hosted Kubernetes (POC)
```
Configuration:
  - No persistent runners
  - gap-dashboard: 1x/week on K8s (15 min)
  - Other jobs: Keep on Mac runners

Monthly Cost:
  - gap-dashboard: 4 runs × 15 min × $0.008/min = $4.80
  - Other jobs: Keep on Mac (dynamic cost as-needed)
  - **Total: ~$40-80/month** (for gap-dashboard alone)
```

### Scenario 3: Hybrid (Recommended for Phase 5A)
```
Configuration:
  - 1 shared Mac runner (for all jobs)
  - gap-dashboard: 1x/week on K8s (15 min)
  - Other jobs: ~200 min/week on Mac

Monthly Cost:
  - Mac runner: $22/day × 30 = $660
  - gap-dashboard on K8s: $4.80
  - **Total: $664.80/month**
  - **Benefit: Proves K8s viability before migration**
```

### Long-Term (Phase 5 Complete)
```
Configuration:
  - Light jobs (gap-dashboard, analysis): K8s
  - macOS jobs: 1 shared Mac runner
  - Windows jobs: GitHub-hosted (if any)

Monthly Cost:
  - Mac runner (shared, lower usage): $300-400
  - K8s jobs (parallelized): $50-100
  - **Total: $350-500/month**
  - **Savings vs. current: 45-50%**
```

---

## Phase 5A Implementation Tasks

### Week 1: Research & Evaluation

**Task 1.1: Verify GitHub Actions Kubernetes Option**
- [ ] Check if organization has GitHub Actions Kubernetes runner access
- [ ] Review GitHub documentation on Kubernetes runners
- [ ] Contact GitHub support if needed (check billing, feature availability)
- [ ] Document findings

**Task 1.2: POC Environment Setup**
- [ ] Create test Kubernetes namespace (if using self-hosted K8s)
- [ ] Deploy GitHub Actions runner on Kubernetes
- [ ] Test basic job execution
- [ ] Document setup process

**Task 1.3: Cost Model Validation**
- [ ] Run gap-dashboard on K8s (measure actual runtime)
- [ ] Compare cost to Mac runner baseline
- [ ] Calculate break-even point
- [ ] Document cost model

**Deliverables:**
- `kubernetes-evaluation.md` (this document, expanded)
- `kubernetes-runner-config.yaml` (K8s runner definitions)
- Cost comparison spreadsheet
- Setup runbook

---

### Week 2: POC Implementation

**Task 2.1: Parallelized gap-dashboard Script**
- [ ] Create `scripts/gap-dashboard-kubernetes.py`
- [ ] Implement parallel repo aggregation (4 pods)
- [ ] Merge results from parallel runs
- [ ] Test locally with mock data
- [ ] Test on Kubernetes

**Task 2.2: Kubernetes Job Workflow**
- [ ] Create `.github/workflows/batch-job-executor.yml`
- [ ] Define Kubernetes pod template
- [ ] Implement job distribution logic
- [ ] Add result aggregation step
- [ ] Test end-to-end

**Task 2.3: Performance & Cost Measurement**
- [ ] Measure actual runtime (target: 12-15 min)
- [ ] Measure actual cost (target: < $5/run)
- [ ] Measure pod startup overhead
- [ ] Compare to Mac runner baseline
- [ ] Document results

**Task 2.4: Documentation**
- [ ] Architecture diagram (K8s runner topology)
- [ ] Runbook: How to deploy gap-dashboard on K8s
- [ ] Troubleshooting guide
- [ ] Performance tuning guide

**Deliverables:**
- `scripts/gap-dashboard-kubernetes.py` (parallelized aggregation)
- `.github/workflows/batch-job-executor.yml` (K8s job executor)
- Performance report (runtime, cost, resource usage)
- Complete documentation

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| K8s unavailable in org | MEDIUM | HIGH | Contact GitHub support early (Week 1) |
| Higher-than-expected cost | MEDIUM | MEDIUM | Test on small dataset first, measure carefully |
| Parallelization overhead | LOW | MEDIUM | Profile merge step, optimize if needed |
| Pod startup latency | MEDIUM | LOW | Cache container image, pre-warm if possible |
| Network issues between pods | LOW | LOW | Use Kubernetes service mesh if needed |

---

## Success Criteria (Go/No-Go Decision)

### Go Criteria (Proceed to Full Migration)
✅ Runtime < 15 minutes (vs. 45 min baseline)  
✅ Cost < $5 per run (vs. $27 for Mac runner)  
✅ 99%+ reliability (no failed runs)  
✅ Parallelization works as expected  

### No-Go Criteria (Stick with Mac Runners)
❌ Runtime > 20 minutes (no meaningful improvement)  
❌ Cost > $10 per run (not cost-effective)  
❌ Reliability < 95% (too many failures)  
❌ K8s not available in organization  

---

## Phase 5A Deliverables Checklist

- [ ] Kubernetes evaluation report (this document, expanded)
- [ ] `kubernetes-runner-config.yaml` — K8s runner definitions
- [ ] `scripts/gap-dashboard-kubernetes.py` — Parallelized aggregation (425 lines)
- [ ] `.github/workflows/batch-job-executor.yml` — K8s job executor (280 lines)
- [ ] Performance report (runtime, cost, resource comparison)
- [ ] Architecture diagram (K8s topology)
- [ ] Setup & troubleshooting runbook
- [ ] Cost model documentation

**Total Effort:** 80-120 hours  
**Team:** 1-2 engineers  
**Duration:** 2 weeks

---

## Decision Matrix: Kubernetes Runner Options

| Criteria | GitHub-Hosted K8s | Self-Hosted K8s | Hybrid (Recommended) |
|----------|-------------------|-----------------|----------------------|
| Cost | ✅ Lowest | ❌ High baseline | ✅ Best balance |
| Setup Complexity | ✅ Simple | ❌ Complex | ✅ Moderate |
| Scalability | ✅ Unlimited | ✅ Depends on cluster | ✅ Good |
| Customization | ❌ Limited | ✅ Full | ✅ Partial |
| Maintenance | ✅ None (GitHub) | ❌ Significant | ✅ Minimal |
| Risk | ⚠️ Vendor dependency | ✅ Full control | ✅ Low |
| **Recommendation** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## Next Steps

### Immediate (This Week)
1. Verify GitHub Actions Kubernetes option availability
2. Complete cost model analysis
3. Design parallel aggregation algorithm
4. Set up POC environment

### Following Week
1. Implement parallelized gap-dashboard script
2. Create Kubernetes job workflow
3. Run POC end-to-end
4. Measure performance & cost
5. Document findings

### Decision Point (End of Week 2)
- **If successful:** Migrate gap-dashboard to K8s, proceed to Phase 5B
- **If unsuccessful:** Document learnings, consider alternative approaches
- **If undecided:** Run extended POC with more jobs before scaling

---

## Related Documents

- `PHASE_5_ADVANCED_AUTOMATION_OUTLINE.md` — Phase 5 overview
- `docs/infrastructure-codification.md` — Runner configuration baseline
- `scripts/gap-dashboard-kubernetes.py` — Implementation (TBD)
- `.github/workflows/batch-job-executor.yml` — Job executor (TBD)

---

**Phase 5A: Kubernetes Integration — Ready to Implement**

Starting with Week 1 evaluation and research tasks.
