# Self-Hosted Mac Runner Setup Guide

**Status:** Phase 3 Implementation Guide  
**Updated:** 2026-05-04  
**Audience:** DevOps, Infrastructure engineers

## Overview

This guide documents the setup and maintenance of self-hosted Mac runners for GitHub Actions in the ruralpeds organization. The goal is to minimize metered GitHub-hosted runner costs by leveraging available Mac infrastructure.

## Current Infrastructure

### Active Runners

```
┌──────────────────────────────────────────────────────────────┐
│ RUNNER INVENTORY                                              │
├──────────────────────────────────────────────────────────────┤
│ 1. Mac Studio (Always-on, Primary)                           │
│    Labels: [self-hosted, mac-studio, arm64]                 │
│    Arch: ARM64 (Apple Silicon M-series)                     │
│    Status: Always online                                     │
│    Configured: ✓                                             │
│                                                              │
│ 2. MacBook Pro (Secondary, Lid-dependent)                   │
│    Labels: [self-hosted, macbook-pro]                       │
│    Arch: Intel/Apple Silicon (verify)                       │
│    Status: Online when lid is open                          │
│    Configured: ✓                                             │
│                                                              │
│ 3. Apple Silicon (Potential additional runners)             │
│    Labels: [self-hosted, apple-silicon]                     │
│    Status: 4 jobs reference this label                      │
│    Configured: Needs verification                           │
└──────────────────────────────────────────────────────────────┘
```

## Installation & Setup

### Prerequisites

- macOS 10.15 or later
- 2+ GB RAM minimum (4+ GB recommended)
- 10+ GB free disk space
- Network connectivity
- GitHub account with admin access to ruralpeds organization

### Step 1: Install GitHub Actions Runner

On the Mac machine:

```bash
# Create runner directory
mkdir -p ~/actions-runner
cd ~/actions-runner

# Download latest runner (as of 2026-05, check for newer versions)
curl -o actions-runner-osx-arm64.tar.gz \
  -L https://github.com/actions/runner/releases/download/v2.x.x/actions-runner-osx-arm64.tar.gz

# Verify signature (recommended)
# curl -o actions-runner-osx-arm64.tar.gz.sha256 \
#   -L https://github.com/actions/runner/releases/download/v2.x.x/actions-runner-osx-arm64.tar.gz.sha256
# shasum -a 256 -c actions-runner-osx-arm64.tar.gz.sha256

# Extract
tar xzf actions-runner-osx-arm64.tar.gz

# Verify installation
./bin/Runner.Listener --version
```

**Note:** For Intel Macs, use `actions-runner-osx-x64.tar.gz` instead.

### Step 2: Register Runner with GitHub

```bash
cd ~/actions-runner

# Configure runner (interactive)
./config.sh --url https://github.com/ruralpeds \
            --token <REGISTRATION_TOKEN> \
            --name "mac-studio-runner-01" \
            --labels "self-hosted,mac-studio,arm64" \
            --work "_work" \
            --runnergroup "Default" \
            --replace

# Unattended setup (if preferred)
# ./config.sh --unattended --url https://github.com/ruralpeds \
#            --token <REGISTRATION_TOKEN> \
#            --name "mac-studio-runner-01" \
#            --labels "self-hosted,mac-studio,arm64"
```

**Where to find registration token:**
1. Navigate to: `https://github.com/organizations/ruralpeds/settings/actions/runners`
2. Click "New self-hosted runner"
3. Copy the token from the registration URL

### Step 3: Install as LaunchAgent (Always-On)

For **always-on runners** (like Mac Studio), install as a LaunchAgent:

```bash
# Copy the svc installer
cp ~/actions-runner/svc.sh ~/actions-runner/svc.sh.bak

# Create LaunchAgent plist
cat > ~/Library/LaunchAgents/com.github.actions.runner.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.github.actions.runner</string>
    <key>Program</key>
    <string>/Users/YOUR_USERNAME/actions-runner/run.sh</string>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/actions-runner.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/actions-runner.err</string>
    <key>KeepAlive</key>
    <dict>
      <key>SuccessfulExit</key>
      <false/>
    </dict>
  </dict>
</plist>
EOF

# Replace YOUR_USERNAME with actual username

# Install the LaunchAgent
launchctl load ~/Library/LaunchAgents/com.github.actions.runner.plist

# Verify it's running
launchctl list | grep actions.runner
```

**Alternative: Manual Start/Stop**

```bash
# Start runner manually
cd ~/actions-runner
./run.sh

# Stop runner (Ctrl+C in terminal or background process kill)
```

### Step 4: Verify Installation

```bash
# Check runner registration (on the GitHub org settings page)
# https://github.com/organizations/ruralpeds/settings/actions/runners

# Verify runner health
# From Actions tab in a workflow, check if runner shows as "online"

# Test runner with a workflow job (see health-check workflow below)
```

## Runner Configuration Best Practices

### Runner Labels Strategy

```yaml
# PRIMARY RUNNER (Always-on, primary)
Labels: [self-hosted, mac-studio, arm64]
Usecase: All critical CI/CD, builds, tests

# SECONDARY RUNNER (Online when lid open)
Labels: [self-hosted, macbook-pro]
Usecase: Non-critical jobs, optional runs

# ALTERNATIVE LABEL
Labels: [self-hosted, apple-silicon]
Usecase: Compatibility alias for arm64
```

### Workflow Selection

```yaml
# Use primary runner for critical paths
runs-on: [self-hosted, mac-studio, arm64]

# Use secondary for optional jobs
runs-on: [self-hosted, macbook-pro]

# Fallback pattern (if runner offline)
runs-on: |
  ${{ (contains(fromJson('["pull_request", "push"]'), github.event_name) &&
       'self-hosted, mac-studio, arm64') || 'ubuntu-latest' }}
```

## Maintenance & Health Monitoring

### Weekly Health Checks

The `test-mac-runner.yml` workflow provides automated smoke tests:

```bash
# Runs weekly on Mondays at 07:00 UTC
# Tests:
# - Runner connectivity
# - OS and CPU info
# - Required tools (git, gh, python3, node, docker)
# - Docker daemon status
# - GitHub CLI authentication

# Monitor at: https://github.com/ruralpeds/.github/actions/workflows/test-mac-runner.yml
```

### Manual Health Check

```bash
# SSH into Mac and verify:
hostname
uname -m
sw_vers
sysctl -n hw.logicalcpu
git --version
python3 --version
docker --version
docker ps  # Should not error

# Check runner logs
tail -f /tmp/actions-runner.log
tail -f /tmp/actions-runner.err
```

### Resource Monitoring

```bash
# Monitor disk space
df -h

# Monitor memory usage
vm_stat
memory_pressure

# Monitor CPU
top -l1

# Check Docker resources
docker stats

# Recommendations:
# - Keep >5% disk free for runner cache
# - Monitor if memory pressure exceeds 50%
# - Restart runner if CPU usage stays >90% for >10 minutes
```

### Runner Cleanup

```bash
# Remove old runner data (if needed)
cd ~/actions-runner
rm -rf _work/*

# Clear Docker images (if disk low)
docker system prune -a -f

# Rebuild runner cache
# (next job will recreate as needed)
```

## Troubleshooting

### Runner Won't Start

```bash
# Check logs
tail -50 /tmp/actions-runner.log
tail -50 /tmp/actions-runner.err

# Verify configuration
cat ~/actions-runner/.runner

# Re-register if needed
cd ~/actions-runner
./config.sh --url https://github.com/ruralpeds \
            --token <NEW_TOKEN> \
            --replace
```

### LaunchAgent Not Starting

```bash
# Check plist syntax
plutil -lint ~/Library/LaunchAgents/com.github.actions.runner.plist

# Try starting manually
launchctl start com.github.actions.runner

# Check logs
log show --predicate 'process == "launchd"' --last 1h
```

### Workflow Jobs Not Finding Runner

```bash
# Verify runner is registered
# https://github.com/organizations/ruralpeds/settings/actions/runners

# Check runner labels are correct
# They must EXACTLY match runs-on specification

# Verify runner is online
# In GitHub Actions UI, check runner status shows green/online

# If offline, SSH to Mac and check:
cd ~/actions-runner
./run.sh  # Try starting manually

# Check network connectivity
ping 8.8.8.8
curl https://api.github.com
```

### Docker Not Available on Mac

```bash
# Verify Docker Desktop is installed
docker --version

# If not installed, download from:
# https://www.docker.com/products/docker-desktop

# Ensure Docker daemon is running
docker ps

# If daemon not running, start it:
open /Applications/Docker.app
# Wait ~30 seconds for daemon to start

# Restart runner after Docker is running
cd ~/actions-runner
./run.sh
```

### High Memory Usage

```bash
# Monitor processes
ps aux | sort -k 3,3rn | head -10

# Large Docker images?
docker images --no-trunc

# Stale Docker containers?
docker ps -a

# Restart Docker
pkill Docker
open /Applications/Docker.app
```

## Security Best Practices

### 1. Network Isolation

- Keep runner on private network when possible
- Use firewall to restrict inbound connections
- Only allow GitHub's webhook IPs (if applicable)

### 2. Credentials Management

```bash
# NEVER commit credentials
# Always use GitHub Secrets for sensitive data

# Example workflow secret usage
# ${{ secrets.GITHUB_TOKEN }}  # Automatically provided
# ${{ secrets.API_KEY }}        # Org-level secret
# ${{ secrets.DEPLOYMENT_KEY }} # Environment secret
```

### 3. Audit & Logging

```bash
# Enable detailed runner logs
cd ~/actions-runner
./config.sh --url https://github.com/ruralpeds \
            --token <TOKEN> \
            --replace \
            --debugLogging

# Archive logs for audit
tar czf runner-logs-$(date +%Y%m%d).tar.gz \
    /tmp/actions-runner.log \
    /tmp/actions-runner.err
```

### 4. Regular Updates

```bash
# Check for runner updates weekly
# https://github.com/actions/runner/releases

# Update procedure:
cd ~/actions-runner
./config.sh --unattended \
            --url https://github.com/ruralpeds \
            --token <TOKEN> \
            --replace
```

## Runner Decommissioning

If a runner needs to be taken offline:

```bash
# On the Mac:
cd ~/actions-runner
./config.sh remove --token <REMOVAL_TOKEN>

# Or disable from GitHub:
# https://github.com/organizations/ruralpeds/settings/actions/runners
# Click runner → "Remove"

# Cleanup
rm -rf ~/actions-runner
launchctl unload ~/Library/LaunchAgents/com.github.actions.runner.plist
rm ~/Library/LaunchAgents/com.github.actions.runner.plist
```

## Scaling to Multiple Runners

For organizations scaling beyond a single Mac:

```bash
# Create runner groups
# https://github.com/organizations/ruralpeds/settings/actions/runner-groups

# Example multi-runner setup:
Mac Studio 1:  [self-hosted, mac-studio, arm64, mac-1]
Mac Studio 2:  [self-hosted, mac-studio, arm64, mac-2]
MacBook Pro:   [self-hosted, macbook-pro, mac-3]
iMac:          [self-hosted, apple-silicon, mac-4]

# Route jobs by availability
runs-on: [self-hosted, mac-studio, arm64]  # Gets mac-1 or mac-2
runs-on: [self-hosted, macbook-pro]        # Gets mac-3
```

## Performance Optimization

### Docker Layer Caching

```yaml
# Use buildx for efficient multi-platform builds
- uses: docker/setup-buildx-action@v3
  
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Concurrent Job Limits

```bash
# Control concurrent jobs on runner
# Edit ~/actions-runner/.env or config script
# Limit to 2-3 jobs for stability on Mac

# Monitor queue depth
# If jobs queue >5 minutes, consider adding runner
```

### Dependency Caching

```yaml
# Cache dependencies to speed up workflows
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
```

## Related Workflows

- `test-mac-runner.yml` — Weekly health checks
- `runner-health-check.yml` — (Coming) Continuous monitoring
- All CI workflows migrated in Phase 3

## References

- [GitHub Actions Self-Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [GitHub Actions Runner Releases](https://github.com/actions/runner/releases)
- [macOS Runner Documentation](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners#macos-runners)

---

**Next Steps:**
1. Verify current Mac runner setup
2. Create health monitoring workflow
3. Migrate workflows to self-hosted runners
4. Monitor performance and costs
