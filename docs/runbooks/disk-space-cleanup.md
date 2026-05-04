# Runbook: Disk Space Cleanup

## Alert Condition
Disk usage exceeds 90% on runner

## Severity
🔴 Critical

## Immediate Actions (0-5 minutes)

1. **Acknowledge alert**
   - Check which runner has low disk space
   ```bash
   cat audit-log/observability/alerts/alerts-$(date +%Y-%m-%d).json | \
     jq '.alerts[] | select(.rule == "low_disk_space")'
   ```

2. **Check current disk usage**
   ```bash
   # In affected runner/job logs
   df -h /
   du -sh /*
   ```

3. **Disable new jobs**
   - Consider pausing workflow runs on affected runner
   - Prevent cascading failures

## Quick Cleanup (5-15 minutes)

1. **Remove Docker images (if applicable)**
   ```bash
   docker image prune -af --filter "until=24h"
   ```

2. **Clear artifact cache**
   ```bash
   # Old job artifacts (if cached on runner)
   find /tmp -type f -atime +7 -delete
   
   # GitHub Actions cache
   gh actions-cache list --key-prefix "cache-" | cut -f1 | \
     xargs -I {} gh actions-cache delete {} --confirm
   ```

3. **Clean package manager caches**
   ```bash
   # npm cache
   npm cache clean --force
   
   # pip cache
   pip cache purge
   
   # apt cache
   sudo apt-get clean
   ```

4. **Remove old logs**
   ```bash
   # Find large log files
   find /var/log -name "*.log" -type f -size +100M -delete
   
   # Compress rotated logs
   gzip /var/log/*.1
   ```

## Deep Cleanup (15-45 minutes)

1. **Identify largest directories**
   ```bash
   du -sh /* | sort -rh | head -10
   
   # Find files larger than 500MB
   find / -size +500M -type f 2>/dev/null | head -20
   ```

2. **Remove unnecessary tools/libraries**
   ```bash
   # Remove old Java versions (if not needed)
   sudo apt-get remove -y openjdk-8-jdk openjdk-11-jdk
   
   # Remove unused language runtimes
   # Be careful - only remove if not needed by workflows
   ```

3. **Clear temporary directories**
   ```bash
   sudo rm -rf /tmp/*
   sudo rm -rf /var/tmp/*
   
   # VSCode extensions cache (if using GitHub Codespaces)
   rm -rf ~/.vscode-server/extensions/
   ```

4. **Remove old dependence installations**
   ```bash
   # Node modules from previous runs
   find ~/ -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null
   
   # Python virtual environments
   find ~/ -name "*.pyc" -delete
   find ~/ -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
   ```

## Workflow-Level Prevention

1. **Implement artifact cleanup in workflows**
   ```yaml
   - name: Clean up artifacts
     if: always()
     run: |
       rm -rf ./build
       rm -rf ./dist
       rm -rf ./node_modules
       rm -rf ./.pytest_cache
   ```

2. **Use GitHub Actions' built-in retention**
   ```yaml
   - uses: actions/upload-artifact@v4
     with:
       path: ./dist
       retention-days: 7  # Default is 90, set shorter
   ```

3. **Limit artifact size**
   ```yaml
   - name: Check artifact size
     run: |
       SIZE=$(du -s ./dist | cut -f1)
       MAX_SIZE=1048576  # 1GB in KB
       if [ $SIZE -gt $MAX_SIZE ]; then
         echo "Artifact too large: ${SIZE}KB > ${MAX_SIZE}KB"
         exit 1
       fi
   ```

## Long-term Solutions

1. **Increase runner disk size**
   - For self-hosted runners: expand volume
   - For GitHub-hosted: not configurable, use larger instances

2. **Cleanup policies**
   - Automated daily cleanup script
   - Age-based deletion (e.g., delete files > 30 days old)
   - Size-based limits (max 50GB per job)

3. **Monitoring**
   - Track disk usage trend
   - Alert when usage > 80%
   - Predictive alert when trending to 90%

## Verification

1. **Check disk usage improved**
   ```bash
   df -h /
   # Should show < 85% usage
   ```

2. **Verify jobs can run**
   - Trigger test workflow
   - Confirm it completes successfully

3. **Monitor for recurrence**
   - Check if disk fills up again
   - If so, investigate root cause

## Escalation

If disk remains > 85% after cleanup:
- Runner may be damaged or misconfigured
- Consider destroying and recreating runner
- Check for stuck processes: `du -sh /proc/*/cwd 2>/dev/null | sort -rh | head -5`

---

**Last Updated**: 2026-05-04  
**Runbook ID**: disk-space-cleanup
