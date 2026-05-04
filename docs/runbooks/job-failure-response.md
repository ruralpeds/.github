# Runbook: Job Failure Response

## Alert Condition
High job failure rate detected (> 10% in 1 hour)

## Severity
🔴 Critical

## Immediate Actions (0-5 minutes)

1. **Acknowledge the alert**
   - Check Slack/email notifications
   - Mark incident as acknowledged in incident tracking

2. **Gather initial information**
   ```bash
   # Check which workflows are failing
   gh run list --status failure --limit 20
   
   # Get failure rate trend
   cat audit-log/observability/alerts/alerts-$(date +%Y-%m-%d).json | jq '.alerts[] | select(.rule == "high_failure_rate")'
   ```

3. **Check recent changes**
   - Review commits from last 30 minutes
   - Check for dependency updates or library version changes
   - Look for infrastructure changes

## Investigation (5-30 minutes)

1. **Identify which workflows are failing**
   ```bash
   # List recent failed runs
   gh run list --status failure --limit 50 --json name,conclusion,databaseId
   ```

2. **Check specific job logs**
   ```bash
   # Download logs from failing job
   gh run view <run-id> --log
   ```

3. **Common failure causes**
   - Network connectivity issues (timeout/connection refused)
   - Dependency unavailability (artifact server down, npm registry issues)
   - Resource exhaustion (OOM, disk full)
   - Flaky tests (intermittent failures)
   - Infrastructure issues (runner health, container startup)

## Remediation

### Network/Dependency Issues
- **Symptom**: Timeout errors, connection refused, 503 errors
- **Action**:
  ```bash
  # Check if external services are healthy
  curl -I https://registry.npmjs.org  # npm registry
  curl -I https://github.com         # GitHub API
  
  # Consider enabling retries in workflows
  ```
- **Timeline**: 10-15 minutes to resolve or fall back

### Resource Exhaustion
- **Symptom**: OOM killer messages, exit code 137, disk full errors
- **Action**:
  1. Check runner health: See `runner-health-recovery.md`
  2. Reduce parallel job count
  3. Increase runner resource limits

### Flaky Tests
- **Symptom**: Different tests fail in different runs, intermittent passes
- **Action**:
  1. Re-run the same commit to confirm flakiness
  2. Review test logs for timing issues
  3. Add retries to unstable test suites
  4. File issue to fix root cause

## Rollback Procedures

If a recent commit caused failures:
```bash
# Identify problematic commit
git log --oneline -10

# Revert if needed
git revert <commit-hash>
git push origin <branch>

# Or temporarily disable workflows
# Edit .github/workflows/ to add 'if: false'
```

## Verification

1. **Confirm fix**
   - Wait for next batch of runs to complete
   - Check failure rate returned to < 5%

2. **Post-incident**
   - Document root cause
   - Create tracking issue for prevention
   - Update monitoring thresholds if needed

## Escalation

If not resolved within 30 minutes:
- Contact infrastructure team
- Check status page for known issues
- Consider enabling maintenance mode

## Prevention

- Add health checks for external dependencies
- Implement exponential backoff with jitter
- Test infrastructure changes in staging first
- Monitor failure rates continuously

---

**Last Updated**: 2026-05-04  
**Runbook ID**: job-failure-response
