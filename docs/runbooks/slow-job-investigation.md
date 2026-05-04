# Runbook: Slow Job Investigation

## Alert Condition
Job duration exceeds 2x historical baseline for 3 consecutive runs

## Severity
🟡 Warning

## Immediate Actions (0-10 minutes)

1. **Identify the slow workflow**
   ```bash
   # Check alert details
   cat audit-log/observability/alerts/alerts-$(date +%Y-%m-%d).json | \
     jq '.alerts[] | select(.rule == "slow_jobs")'
   ```

2. **Get performance metrics**
   ```bash
   # View duration percentiles
   cat audit-log/observability/aggregated/aggregated-$(date +%Y-%m-%d).json | \
     jq '.workflows | to_entries | sort_by(.value.duration.avg) | reverse | .[0:5]'
   ```

3. **Identify baseline vs. recent**
   - Baseline: Historical average (what job normally takes)
   - Recent: Last 3 runs average
   - Regression: recent > baseline * 2

## Investigation (10-30 minutes)

1. **Check job logs for slowdown causes**
   ```bash
   # Get recent runs of the slow workflow
   gh run list --workflow <workflow-name> --limit 5 --json headSha,startedAt,updatedAt,databaseId
   
   # View detailed logs from slowest run
   gh run view <run-id> --log | grep -i "duration\|time\|slow\|wait\|cache"
   ```

2. **Identify bottlenecks**
   - **Dependency download**: Check package manager logs (npm, pip, etc.)
   - **Compilation**: Look for compiler/build tool logs
   - **Test execution**: Identify slow test suites
   - **Disk I/O**: Check for excessive read/write operations
   - **Network**: Look for timeout/slow download logs

3. **Check recent changes**
   ```bash
   # View commits since last fast run
   git log --oneline <slow-run-commit>..HEAD -- .github/workflows/
   
   # Check workflow file changes
   git diff <baseline-commit> .github/workflows/<workflow-file>.yml
   ```

## Common Causes & Remediation

### 1. Dependency Resolution Slow
**Symptom**: `npm install` / `pip install` taking 5+ minutes
- **Check**: `pip cache` size, npm registry issues
- **Fix**:
  ```yaml
  - name: Cache dependencies
    uses: actions/cache@v3
    with:
      path: ~/.cache/pip
      key: pip-${{ hashFiles('requirements.txt') }}
  ```

### 2. Build Cache Miss
**Symptom**: Compiler/bundler taking long time
- **Fix**:
  ```yaml
  - name: Build cache
    uses: actions/cache@v3
    with:
      path: build/
      key: build-${{ github.sha }}
      restore-keys: build-
  ```

### 3. Test Suite Expanded
**Symptom**: Test execution time increased
- **Investigation**:
  ```bash
  # Compare test results
  diff <baseline-test-output> <current-test-output>
  
  # Find slowest tests
  grep -i "duration\|time" <test-output> | sort -t: -k2 -rn | head -20
  ```
- **Fix**: Parallelize tests, remove flaky tests, optimize test fixtures

### 4. Network Slowness
**Symptom**: Downloads/API calls taking longer
- **Check**: Network traces, DNS resolution
- **Fix**: Add retry logic, increase timeout values

### 5. Runner Resource Constraints
**Symptom**: CPU/memory/disk usage at 100%
- **See**: `runner-health-recovery.md` for detailed steps
- **Quick Fix**: Reduce parallel job count, increase runner resources

## Performance Optimization

1. **Enable caching aggressively**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.cache
       key: cache-${{ runner.os }}-${{ hashFiles('**/lockfiles') }}
   ```

2. **Parallelize where possible**
   ```yaml
   strategy:
     matrix:
       test-group: [unit, integration, e2e]
   ```

3. **Use action caching for compiled outputs**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: dist/
       key: dist-${{ github.sha }}
   ```

## Verification

1. **Confirm improvement**
   - Wait for next 3 runs of workflow
   - Check that duration returns to baseline
   - Alert should resolve automatically

2. **Monitor for regression**
   - Watch performance dashboard
   - Set performance budget (max acceptable duration)

## Prevention

- Monitor job duration percentiles continuously
- Set performance regression gates in CI
- Profile slow jobs regularly
- Document expected duration for each workflow
- Archive performance data for trend analysis

---

**Last Updated**: 2026-05-04  
**Runbook ID**: slow-job-investigation
