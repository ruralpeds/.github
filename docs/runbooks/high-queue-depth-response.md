# Runbook: High Queue Depth Response

## Alert Condition
Queue depth exceeds 20 waiting jobs

## Severity
🟡 Warning

## Immediate Actions (0-10 minutes)

1. **Assess queue status**
   ```bash
   # Check pending workflow runs
   gh run list --status queued --limit 50 --json status,name,headSha
   
   # Count queued runs
   gh run list --status queued | wc -l
   ```

2. **Check runner availability**
   ```bash
   # List available runners
   gh actions-cache list  # Shows what's in runner cache
   
   # For self-hosted runners
   curl -s http://localhost:3000/runner/status 2>/dev/null || \
     echo "Self-hosted runner endpoint not available"
   ```

3. **Identify which workflows are queued**
   ```bash
   # See workflow breakdown
   gh run list --status queued --json name | jq -r '.[] | .name' | sort | uniq -c | sort -rn
   ```

## Investigation (10-30 minutes)

### Check Runner Availability
```bash
# How many runners are active?
gh api repos/{owner}/{repo}/actions/runners --jq '.runners | length'

# Check runner details
gh api repos/{owner}/{repo}/actions/runners \
  --jq '.runners[] | "\(.name): \(.status) (busy: \(.busy))"'
```

### Identify Root Cause

1. **All runners busy** → Need more capacity
2. **Some runners offline** → Health issue
3. **Workflow requires unavailable label** → Configuration issue
4. **Rate limiting** → GitHub throttling

## Remediation Strategies

### 1. Increase Runner Capacity (Kubernetes)
```bash
# If using Kubernetes:
kubectl scale deployment actions-runner -n actions-runner-system --replicas=10

# Wait for new runners to come online
kubectl get pods -n actions-runner-system -w
```

### 2. Cancel Low-Priority Jobs
```bash
# List all queued runs
gh run list --status queued --limit 100 --json databaseId,name

# Cancel specific low-priority runs
gh run cancel <run-id>

# Or cancel all for a specific workflow
gh run list --status queued --workflow <workflow-file> | \
  grep -oP 'actions/runs/\K[0-9]+' | \
  xargs -I {} gh run cancel {}
```

### 3. Rebalance Workflow Triggers

Check if too many workflows triggered simultaneously:
```bash
# Check workflow schedule overlap
grep -r "^[[:space:]]*-[[:space:]]*cron:" .github/workflows/ | \
  grep -oP '\*\s+\K[0-9 *]+' | sort | uniq -c | sort -rn
```

**Fix**: Stagger cron schedules to avoid thundering herd
```yaml
# Instead of all at same time (0 1 * * *)
# Spread them out:
jobs:
  workflow1:
    schedule: ['0 1 * * *']   # 1 AM
  workflow2:
    schedule: ['15 1 * * *']  # 1:15 AM
  workflow3:
    schedule: ['30 1 * * *']  # 1:30 AM
```

### 4. Optimize Job Concurrency

```yaml
# Limit concurrency to prevent overwhelming queue
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# Or implement max parallel jobs
strategy:
  max-parallel: 3
  matrix:
    # ...
```

### 5. Check for Stuck Runners

```bash
# Find runners not executing jobs
gh api repos/{owner}/{repo}/actions/runners \
  --jq '.runners[] | select(.busy == false) | "\(.name) (idle)"'

# Restart unresponsive runners (for self-hosted)
# Stop service
sudo systemctl stop github-actions-runner.service
# Start service
sudo systemctl start github-actions-runner.service
```

## Monitoring Queue Depth

1. **Real-time monitoring**
   ```bash
   # Watch queue depth continuously
   watch -n 5 'gh run list --status queued | wc -l'
   ```

2. **Set up alerts**
   - Alert at 15 jobs (warning before critical)
   - Alert at 30 jobs (critical, manual intervention needed)

3. **Dashboard metric**
   - Track queue depth over time
   - Identify patterns (e.g., queue spike at 2 AM)

## Prevention (Long-term)

1. **Right-size runner capacity**
   - Calculate average concurrent jobs
   - Provision for 2x peak load for headroom
   - Monitor queue depth weekly

2. **Auto-scaling configuration**
   ```yaml
   # For Kubernetes runners
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: actions-runner-hpa
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: actions-runner
     minReplicas: 3
     maxReplicas: 20
     metrics:
       - type: Resource
         resource:
           name: cpu
           target:
             type: Utilization
             averageUtilization: 80
   ```

3. **Job prioritization**
   - Mark jobs with priority labels
   - Cancel low-priority jobs if queue depth > threshold
   - Prioritize critical workflows (deployments, security scans)

## Verification

1. **Queue returned to normal**
   ```bash
   # Queue depth should be < 10
   gh run list --status queued | wc -l
   ```

2. **All runners healthy**
   ```bash
   # Check runner status
   gh api repos/{owner}/{repo}/actions/runners | jq '.runners[] | .status'
   # Should all be "online"
   ```

3. **Jobs running with normal latency**
   - Monitor job start time vs. queue time
   - Should be < 5 minutes queue + start time

## Escalation

If queue depth remains high after 1 hour:
- Contact infrastructure team
- Check for upstream issues (GitHub API, runner service)
- Consider temporary workflow pause for non-critical jobs

---

**Last Updated**: 2026-05-04  
**Runbook ID**: high-queue-depth-response
