# Runner Migration Quick Reference

**Last Updated:** 2026-05-04  
**Phase:** 3 - Complete  

## Summary

Successfully migrated **31 workflows** from `ubuntu-latest` to `[self-hosted, mac-studio, arm64]`.

## Runner Specifications

### Self-Hosted Mac (Primary - Always On)

```yaml
runs-on: [self-hosted, mac-studio, arm64]
```

**Use for:**
- All CI/CD pipelines
- Build jobs
- Docker builds
- Python/Node.js/Ruby tests
- Security scanning
- Signing/attestation
- Most automation scripts

**Characteristics:**
- Always online
- Apple Silicon (M-series) arm64
- Docker Desktop available
- Full tool ecosystem

### GitHub-Hosted Ubuntu (Remaining - Intentional)

```yaml
runs-on: ubuntu-latest
```

**Use for:**
- Hadolint (Dockerfile linting) - container.yml
- Trivy (vulnerability scanning) - container.yml
- Report aggregation - runner-health-check.yml

**Rationale:** Lightweight tasks that don't benefit from self-hosting; isolated execution.

### MacBook Pro (Secondary - Lid-Dependent)

```yaml
runs-on: [self-hosted, macbook-pro]
```

**Use for:**
- Optional/non-critical jobs
- Always include `continue-on-error: true`

**Characteristics:**
- Online only when lid is open
- Suitable as secondary runner
- Good for testing/staging workflows

## Migration Checklist

For **new workflows** that need ubuntu-latest:

- [ ] Check if job requires Linux kernel features (→ keep ubuntu)
- [ ] Check if job is lightweight lint/scan (→ keep ubuntu)
- [ ] Check if Docker/Python/tools needed (→ migrate to self-hosted)
- [ ] Test job on self-hosted Mac locally first
- [ ] Update `runs-on:` to `[self-hosted, mac-studio, arm64]`
- [ ] Verify job success in PR
- [ ] Remove ubuntu-latest from workflow

## Migrated Workflows (31 Total)

### Category 1: Simple Scripts (9 workflows)

| Workflow | Type | Status |
|---|---|---|
| audit-log | Python/shell | ✓ Migrated |
| audit-sign-envelope | Shell | ✓ Migrated |
| audit-verify | Shell | ✓ Migrated |
| dependency-audit-inventory | Python | ✓ Migrated |
| dependency-eol | Python | ✓ Migrated |
| gap-bootstrap-auto | Python | ✓ Migrated |
| hygiene | Shell | ✓ Migrated |
| org-dashboard | Python | ✓ Migrated |
| vuln-triage | Python | ✓ Migrated |

### Category 2: Language Tools (6 workflows)

| Workflow | Type | Status |
|---|---|---|
| code-quality | CodeQL | ✓ Migrated |
| ci-gap-status | Python CI | ✓ Migrated |
| deploy-tempo | Deployment | ✓ Migrated |
| gap-dashboard | Build | ✓ Migrated |
| gap-validate | Validation | ✓ Migrated |
| hipaa-compliance | Compliance | ✓ Migrated |

### Category 3: Advanced (16 workflows)

| Workflow | Type | Status |
|---|---|---|
| container (build) | Docker build | ✓ Migrated |
| reusable-container-sign | cosign | ✓ Migrated |
| copilot-setup-steps | Setup | ✓ Migrated |
| backfill-slsa-provenance | SLSA | ✓ Migrated |
| ehr-sandbox-validation | Validation | ✓ Migrated |
| release-gate | Release | ✓ Migrated |
| reusable-attest | Attestation | ✓ Migrated |
| reusable-chaos-test | Test | ✓ Migrated |
| reusable-gap-schema-check | Validation | ✓ Migrated |
| reusable-release | Release | ✓ Migrated |
| reusable-sbom | SBOM | ✓ Migrated |
| reusable-sign-artifact | Signing | ✓ Migrated |
| reusable-slsa-provenance | SLSA | ✓ Migrated |
| reusable-vex | VEX | ✓ Migrated |
| build-sprint-base | Build | ✓ Migrated |
| self-test | Test | ✓ Migrated |

## Verification

### Quick Status Check

```bash
# Count runner usage
grep -h "runs-on:" .github/workflows/*.yml | sort | uniq -c | sort -rn

# Expected output:
# 155 runs-on: [self-hosted, mac-studio, arm64]
# 19  runs-on: [self-hosted, macos]
# 15  ${{ fromJson(needs.resolve-runner.outputs.labels) }}
# 4   runs-on: [self-hosted, apple-silicon]
# 3   runs-on: ubuntu-latest  ← Intentional (hadolint, trivy, report)
```

### Health Check

```bash
# Run health check manually
gh workflow run runner-health-check.yml --repo ruralpeds/.github

# Monitor status
gh workflow view runner-health-check --repo ruralpeds/.github
```

## Troubleshooting

### Job Stuck in Queue

**Symptom:** Job waits indefinitely for runner

**Solution:**
1. Check runner is online: https://github.com/ruralpeds/.github/settings/actions/runners
2. Run health check: `gh workflow run runner-health-check.yml`
3. SSH to Mac and verify: `cd ~/actions-runner && ./run.sh`
4. Restart runner if needed

### Docker Not Available

**Symptom:** `docker: command not found`

**Solution:**
1. Verify Docker Desktop installed on Mac
2. Ensure Docker daemon running: `docker ps`
3. Restart Docker: `pkill Docker && open /Applications/Docker.app`
4. Re-run workflow

### Out of Disk Space

**Symptom:** Job fails with disk space error

**Solution:**
1. SSH to Mac: `df -h`
2. Clean Docker: `docker system prune -a -f`
3. Clear runner cache: `rm -rf ~/actions-runner/_work`
4. Re-run job

## Cost Tracking

**Before Phase 3:**
- ~44 ubuntu-latest jobs × $0.008/min = ~$81.65/month

**After Phase 3:**
- 3 ubuntu-latest jobs (hadolint, trivy, report) × $0.008/min = ~$1-5/month
- All others on self-hosted = $0/month metering

**Estimated Savings:** ~$920-968/year

## Monitoring

### Automated Health Checks

- Frequency: Every 6 hours
- Workflow: `runner-health-check.yml`
- Monitors: Disk, memory, CPU, Docker, required tools

### Manual Verification

```bash
# SSH to Mac Studio
ssh mac-studio

# Check runner status
ps aux | grep runner

# Monitor logs
tail -f /tmp/actions-runner.log

# Check system resources
df -h
vm_stat
top -l 1

# Verify tools
docker ps
python3 --version
node --version
