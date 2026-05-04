# Phase 5A: Kubernetes Deployment Guide

**Purpose:** Deploy GitHub Actions runners on Kubernetes for parallelized gap-dashboard execution  
**Target Audience:** DevOps/Infrastructure engineers  
**Time to Deploy:** 30-45 minutes (first-time setup)  
**Prerequisites:** Kubernetes cluster (EKS, GKE, AKS, or local K3s)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Testing](#testing)
7. [Rollback](#rollback)
8. [Scaling Considerations](#scaling-considerations)

---

## Prerequisites

### Required
- [ ] Kubernetes cluster (v1.20+) with kubectl access
- [ ] GitHub Personal Access Token (PAT) with `admin:repo_hook`, `repo`, `workflow` scopes
- [ ] Docker or container runtime on cluster
- [ ] `kubectl` CLI installed locally
- [ ] Python 3.8+ for testing scripts

### Cluster Requirements
- **Compute:** Minimum 4 CPU cores, 8 GB RAM available
- **Storage:** 20 GB ephemeral storage per pod
- **Network:** Outbound HTTPS access to GitHub API (api.github.com)
- **Container Registry:** Access to `ghcr.io` (GitHub Container Registry)

### Permissions
- Cluster admin access (to create namespace, RBAC roles)
- GitHub organization admin access (to register self-hosted runner)

---

## Architecture Overview

### Kubernetes Components

```
┌─────────────────────────────────────────────────────────────┐
│ Kubernetes Cluster (github-actions namespace)              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ GitHub Actions Runner Deployment (replica: 1-10)    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  Pod 0 (Pod)             Pod 1 (Pod)                │  │
│  │  ┌──────────┐             ┌──────────┐              │  │
│  │  │ Runner   │             │ Runner   │              │  │
│  │  │ Container│             │ Container│              │  │
│  │  │ (2 CPU,  │             │ (2 CPU,  │              │  │
│  │  │  4 GB)   │             │  4 GB)   │              │  │
│  │  └──────────┘             └──────────┘              │  │
│  │                                                       │  │
│  │  Pod 2 (Pod)             Pod 3 (Pod)                │  │
│  │  ┌──────────┐             ┌──────────┐              │  │
│  │  │ Runner   │             │ Runner   │              │  │
│  │  │ Container│             │ Container│              │  │
│  │  │ (2 CPU,  │             │ (2 CPU,  │              │  │
│  │  │  4 GB)   │             │  4 GB)   │              │  │
│  │  └──────────┘             └──────────┘              │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ▲                                  │
│                          │ Managed by                       │
│                          │ HorizontalPodAutoscaler          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Service (runner-service)                            │  │
│  │ ClusterIP: 10.x.x.x:8080 (for metrics)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │
         │ Pull from GitHub API
         │
         ▼
    GitHub.com (api.github.com)
    - Register self-hosted runner
    - Receive job assignments
    - Upload artifacts
```

### Workflow Execution Flow

```
GitHub Actions Workflow Trigger
         │
         ▼
GitHub Actions (main org)
         │
         ├─ Matrix job: pod_index = [0, 1, 2, 3]
         │
         ├─ Job 0: "runs-on: [self-hosted, kubernetes, linux-x64]"
         │  └─ Scheduled to Pod 0
         │     └─ Runs gap-dashboard-kubernetes.py --pod-index 0
         │
         ├─ Job 1: "runs-on: [self-hosted, kubernetes, linux-x64]"
         │  └─ Scheduled to Pod 1
         │     └─ Runs gap-dashboard-kubernetes.py --pod-index 1
         │
         ├─ Job 2: "runs-on: [self-hosted, kubernetes, linux-x64]"
         │  └─ Scheduled to Pod 2
         │     └─ Runs gap-dashboard-kubernetes.py --pod-index 2
         │
         └─ Job 3: "runs-on: [self-hosted, kubernetes, linux-x64]"
            └─ Scheduled to Pod 3
               └─ Runs gap-dashboard-kubernetes.py --pod-index 3
         │
         ▼ (all pods run in parallel, ~5 min each)
         
Pods complete, upload artifacts
         │
         ▼
Merge Job: "merge-pod-results"
         │
         ├─ Download artifacts from all pods
         ├─ Run gap-dashboard-kubernetes.py --merge
         └─ Generate org-dashboard-gaps.json
         │
         ▼
Total Time: 12-15 minutes (vs. 45 min sequential)
```

---

## Step-by-Step Deployment

### Phase 1: Cluster Preparation (5 minutes)

#### 1.1: Verify Cluster Access
```bash
# Test cluster connectivity
kubectl cluster-info
kubectl get nodes
kubectl version --short

# Expected output: Active cluster with at least 1 node
```

#### 1.2: Create Namespace
```bash
# Create github-actions namespace
kubectl create namespace github-actions
kubectl label namespace github-actions name=github-actions

# Verify namespace created
kubectl get namespace github-actions
kubectl describe namespace github-actions
```

#### 1.3: Create GitHub Token Secret
```bash
# Create GitHub Personal Access Token (if not already done)
# Go to: https://github.com/settings/tokens
# Scopes: repo, workflow, admin:repo_hook
# Copy token to: $GITHUB_TOKEN

export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxx"

# Create Kubernetes secret
kubectl create secret generic github-token \
  --from-literal=token=$GITHUB_TOKEN \
  -n github-actions

# Verify secret created
kubectl get secrets -n github-actions
kubectl describe secret github-token -n github-actions
```

---

### Phase 2: Runner Deployment (10 minutes)

#### 2.1: Deploy Runner Manifest
```bash
# Option A: Deploy using kubectl apply (simplest)
kubectl apply -f config/kubernetes-runner-config.yaml

# Option B: Deploy with custom values
kubectl apply -f config/kubernetes-runner-config.yaml \
  --namespace=github-actions

# Verify deployment created
kubectl get deployment -n github-actions
kubectl get pods -n github-actions
```

#### 2.2: Wait for Pods to Start
```bash
# Monitor pod startup (watch mode)
kubectl get pods -n github-actions -w

# Wait for pods to reach "Running" state (30-60 seconds)
# Expected output:
# NAME                                    READY   STATUS    RESTARTS
# github-actions-runner-xxxxxxxxxxxxx-0   1/1     Running   0
```

#### 2.3: Verify Pod Logs
```bash
# Check runner initialization logs
kubectl logs -n github-actions -l app=github-actions-runner --tail=50

# Expected logs:
# - "Configuring the GitHub Actions Runner"
# - "Adding GitHub Actions Runner configuration"
# - "Runner ready to accept jobs"

# If stuck on "Configuring", verify GitHub token secret:
kubectl get secrets -n github-actions github-token
```

---

### Phase 3: GitHub Registration (10 minutes)

#### 3.1: Register Self-Hosted Runner
```bash
# Go to GitHub organization settings:
# https://github.com/organizations/ruralpeds/settings/actions/runners/new

# Steps:
# 1. Select "Linux"
# 2. Select "X64" (or ARM64 if on Apple Silicon)
# 3. Copy the "Configure" command
# 4. Don't run it - we'll do it in Kubernetes

# Alternatively, use GitHub CLI:
gh auth login
gh api \
  -H "Accept: application/vnd.github+json" \
  /orgs/ruralpeds/actions/runners \
  --input - << 'EOF'
{
  "name": "k8s-runner-pod-0",
  "runner_group_id": 1
}
EOF
```

#### 3.2: Check Runner Registration
```bash
# Verify runner appears in GitHub organization
gh api \
  -H "Accept: application/vnd.github+json" \
  /orgs/ruralpeds/actions/runners

# Expected output:
# {
#   "total_count": 1,
#   "runners": [
#     {
#       "id": 123,
#       "name": "k8s-runner-pod-0",
#       "status": "online",
#       "busy": false
#     }
#   ]
# }
```

---

### Phase 4: Validation (5 minutes)

#### 4.1: Check Pod-to-GitHub Connection
```bash
# View pod logs (runner should connect to GitHub)
kubectl logs -n github-actions -l app=github-actions-runner -f

# Wait for logs like:
# "Successfully registered with GitHub"
# "Waiting for Jobs"
```

#### 4.2: Verify Labels
```bash
# Check that runner has correct labels in GitHub
gh api \
  -H "Accept: application/vnd.github+json" \
  /orgs/ruralpeds/actions/runners/self-hosted \
  --jq '.runners[] | {name, labels}'

# Expected output:
# {
#   "name": "k8s-runner-pod-0",
#   "labels": ["self-hosted", "kubernetes", "linux-x64"]
# }
```

#### 4.3: Test Job Execution
```bash
# Create a test workflow
cat > .github/workflows/test-k8s-runner.yml << 'EOF'
name: Test Kubernetes Runner

on: workflow_dispatch

jobs:
  test:
    runs-on: [self-hosted, kubernetes, linux-x64]
    steps:
      - name: Check environment
        run: |
          echo "Running on Kubernetes!"
          uname -a
          free -h
          df -h
      - name: List GitHub workspace
        run: ls -la $GITHUB_WORKSPACE
EOF

# Push workflow to main
git add .github/workflows/test-k8s-runner.yml
git commit -m "test: add K8s runner test workflow"
git push origin main

# Trigger workflow
gh workflow run test-k8s-runner.yml --ref main

# Monitor execution
gh run list --workflow=test-k8s-runner.yml --limit=1
gh run view <RUN_ID>

# Expected: Job completes successfully on K8s runner
```

---

## Verification

### Checklist: Successful Deployment

```bash
# 1. Namespace created
kubectl get namespace github-actions
# Expected: NAME: github-actions, STATUS: Active

# 2. GitHub token secret exists
kubectl get secret github-token -n github-actions
# Expected: NAME: github-token, TYPE: Opaque

# 3. Deployment created
kubectl get deployment -n github-actions
# Expected: NAME: github-actions-runner, READY: 1/1

# 4. Pods running
kubectl get pods -n github-actions
# Expected: NAME: github-actions-runner-XXXXX, READY: 1/1, STATUS: Running

# 5. Service exists
kubectl get service -n github-actions
# Expected: NAME: runner-service, TYPE: ClusterIP

# 6. HPA configured
kubectl get hpa -n github-actions
# Expected: NAME: runner-hpa, TARGETS: CPU%, MINPODS: 1, MAXPODS: 10

# 7. Runner registered in GitHub
gh api /orgs/ruralpeds/actions/runners \
  --jq '.runners | length'
# Expected: >= 1 (runner online)

# 8. Test workflow passed
gh run list --workflow=test-k8s-runner.yml --conclusion=success
# Expected: At least 1 successful run
```

---

## Troubleshooting

### Problem: Pods stuck in "Pending" state

**Symptoms:**
```bash
kubectl get pods -n github-actions
# STATUS: Pending
# REASON: Insufficient resources / Unschedulable
```

**Root Causes & Fixes:**
```bash
# Check node capacity
kubectl describe nodes
# Look for: "Allocatable" resources

# Check pod events
kubectl describe pod -n github-actions <POD_NAME>
# Look for "Insufficient cpu" / "Insufficient memory"

# Solution: Add more nodes or reduce resource limits
kubectl patch deployment github-actions-runner -n github-actions \
  --type='json' -p='[
    {"op": "replace", "path": "/spec/template/spec/containers/0/resources/requests/cpu", "value":"1"},
    {"op": "replace", "path": "/spec/template/spec/containers/0/resources/requests/memory", "value":"2Gi"}
  ]'
```

### Problem: Runner not connecting to GitHub

**Symptoms:**
```bash
kubectl logs -n github-actions -l app=github-actions-runner
# ERROR: "Could not resolve host: api.github.com"
# ERROR: "Failed to register with GitHub"
```

**Root Causes & Fixes:**
```bash
# 1. Check network connectivity
kubectl exec -it -n github-actions <POD_NAME> -- \
  curl -v https://api.github.com

# 2. Verify token secret
kubectl get secret github-token -n github-actions -o jsonpath='{.data.token}' | base64 -d

# 3. Test token validity
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user

# 4. Check firewall/network policies
kubectl get networkpolicy -n github-actions
kubectl describe networkpolicy runner-network-policy -n github-actions

# 5. Temporarily disable network policy (for testing)
kubectl delete networkpolicy runner-network-policy -n github-actions
```

### Problem: Jobs not being assigned to runner

**Symptoms:**
```bash
# Workflow waiting but no job assigned
gh run view <RUN_ID>
# STATUS: waiting for runner
```

**Root Causes & Fixes:**
```bash
# 1. Check runner status in GitHub
gh api /orgs/ruralpeds/actions/runners \
  --jq '.runners[] | {name, status, busy, labels}'

# 2. Check workflow labels match runner labels
cat .github/workflows/batch-job-executor-kubernetes.yml | grep "runs-on"
# Expected: "runs-on: [self-hosted, kubernetes, linux-x64]"

# 3. Verify runner sees jobs (check logs)
kubectl logs -n github-actions -l app=github-actions-runner -f
# Expected: "Listening for Jobs..."

# 4. If runner offline, restart pod
kubectl rollout restart deployment/github-actions-runner -n github-actions

# 5. Re-register runner if needed
kubectl delete pod -n github-actions -l app=github-actions-runner
# (Deployment will create new pod automatically)
```

---

## Testing

### Test 1: Single Pod Execution (5 minutes)

```bash
# Run gap-dashboard on single pod (no parallelization)
python scripts/gap-dashboard-kubernetes.py \
  --token $GITHUB_TOKEN \
  --org ruralpeds \
  --num-pods 1 \
  --pod-index 0 \
  --output /tmp/gap-results-test.json

# Verify output
cat /tmp/gap-results-test.json | jq '.summary'

# Expected output:
# {
#   "total_gaps": 200+,
#   "repos_processed": 27,
#   "by_priority": {
#     "P0": 5,
#     "P1": 15,
#     "P2": 40,
#     "P3": 100,
#     "P4": 40
#   }
# }
```

### Test 2: Parallel Execution via Workflow (15-20 minutes)

```bash
# Trigger batch-job-executor workflow
gh workflow run batch-job-executor-kubernetes.yml \
  --ref main

# Monitor workflow progress
gh run watch $(gh run list --workflow=batch-job-executor-kubernetes.yml -1 --json databaseId --jq .[].databaseId)

# Expected: All 4 pods complete in ~12-15 minutes

# Verify merged results
gh run download $(gh run list --workflow=batch-job-executor-kubernetes.yml -1 --json databaseId --jq .[].databaseId) \
  -n gap-dashboard-merged

# Check final statistics
cat gap-results/org-dashboard-gaps.json | jq '.summary'
```

### Test 3: Performance Measurement (1 minute)

```bash
# Check metrics from last run
gh run download $(gh run list --workflow=batch-job-executor-kubernetes.yml -1 --json databaseId --jq .[].databaseId) \
  -n kubernetes-metrics

# View performance metrics
cat kubernetes-metrics/kubernetes-metrics.json | jq '.'

# Expected output:
# {
#   "duration_minutes": 15,
#   "total_gaps": 200+,
#   "pods_used": 4,
#   "estimated_speedup": 3,
#   "cost_kubernetes": 0.12,
#   "cost_savings": 0.15
# }
```

---

## Rollback

### If Something Goes Wrong: Quick Rollback

```bash
# Option 1: Delete the entire namespace (nuclear option)
kubectl delete namespace github-actions

# Option 2: Scale deployment to 0 (quick disable)
kubectl scale deployment github-actions-runner \
  -n github-actions --replicas=0

# Option 3: Restart pods
kubectl rollout restart deployment/github-actions-runner \
  -n github-actions

# Option 4: Full cleanup
kubectl delete -f config/kubernetes-runner-config.yaml

# Unregister runner from GitHub
gh api \
  -X DELETE \
  -H "Accept: application/vnd.github+json" \
  /orgs/ruralpeds/actions/runners/<RUNNER_ID>

# Verify rollback
kubectl get namespace github-actions
# Expected: Error (namespace not found)

gh api /orgs/ruralpeds/actions/runners
# Expected: Runner gone
```

---

## Scaling Considerations

### Scaling Up: Handle More Jobs

```bash
# Increase HPA max replicas
kubectl patch hpa runner-hpa -n github-actions \
  --type='json' -p='[
    {"op": "replace", "path": "/spec/maxReplicas", "value": 20}
  ]'

# Increase resource quota
kubectl patch resourcequota github-actions-quota -n github-actions \
  --type='json' -p='[
    {"op": "replace", "path": "/spec/hard/pods", "value": "20"}
  ]'

# Monitor scaling
kubectl get hpa -n github-actions -w
# Watch TARGETS and REPLICAS columns
```

### Scaling Down: Reduce Cost

```bash
# Decrease HPA max replicas
kubectl patch hpa runner-hpa -n github-actions \
  --type='json' -p='[
    {"op": "replace", "path": "/spec/maxReplicas", "value": 5}
  ]'

# Wait for scale-down (300 seconds by default)
kubectl get pods -n github-actions -w
```

---

## Cost Optimization Tips

### 1. Use Spot/Preemptible Instances
```yaml
# Add to pod affinity/topology in kubernetes-runner-config.yaml
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      preference:
        matchExpressions:
        - key: cloud.google.com/gke-preemptible
          operator: In
          values: ["true"]
```

### 2. Scale Down During Off-Hours
```bash
# Set scale-down policy in HPA
kubectl patch hpa runner-hpa -n github-actions \
  --type='json' -p='[
    {"op": "replace", "path": "/spec/behavior/scaleDown/stabilizationWindowSeconds", "value": 60}
  ]'
```

### 3. Monitor Costs
```bash
# Check pod metrics
kubectl top pods -n github-actions

# Track resource usage trends
kubectl get events -n github-actions --sort-by='.lastTimestamp'
```

---

## Monitoring & Maintenance

### Daily Checks
```bash
# Pod health
kubectl get pods -n github-actions

# Resource usage
kubectl top pods -n github-actions

# Runner status in GitHub
gh api /orgs/ruralpeds/actions/runners
```

### Weekly Tasks
```bash
# Check for pod restarts
kubectl get pods -n github-actions -o jsonpath='{.items[*].status.containerStatuses[*].restartCount}'

# Review logs for errors
kubectl logs -n github-actions -l app=github-actions-runner --tail=200 | grep -i error

# Verify HPA is scaling correctly
kubectl describe hpa -n github-actions
```

### Monthly Tasks
```bash
# Update runner image to latest
kubectl patch deployment github-actions-runner -n github-actions \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"runner","image":"ghcr.io/actions/actions-runner:latest"}]}}}}'

# Clean up old artifacts
kubectl delete pvc -n github-actions --all

# Review cost trends
# (Check audit-log/kubernetes/daily/ for metrics)
```

---

## Next Steps

1. **Deploy using this guide** (30-45 min)
2. **Run test workflow** (5 min)
3. **Monitor performance** (first 2 weeks)
4. **Decide**: Proceed to Phase 5B (Cost Attribution) if targets met
5. **Document learnings** in Phase 5A retrospective

---

## Support & Questions

- **Kubernetes issues:** Check cluster logs (`kubectl logs`)
- **GitHub registration issues:** Check runner secret (`kubectl get secret`)
- **Performance issues:** Monitor HPA and resource usage
- **Questions:** See `docs/PHASE_5A_KUBERNETES_EVALUATION.md` for architecture decisions

---

**Deployment Complete!** 🎉

Once verified, your gap-dashboard should run in **12-15 minutes** on Kubernetes (vs. 45 min on Mac).

Proceed to Phase 5B: Cost Attribution when ready.
