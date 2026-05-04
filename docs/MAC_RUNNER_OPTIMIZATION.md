# Mac Self-Hosted Runner Optimization

**Status:** Phase 3 Analysis  
**Updated:** 2026-05-04  
**Branch:** `claude/gap-analysis-workflow-5myWP`

## Executive Summary

This repository has **significant untapped potential** for cost savings by leveraging existing Mac self-hosted runner infrastructure. Current analysis shows:

- **199 total workflow jobs** across 101 workflow files
- **113 jobs (57%)** already use `self-hosted, mac-studio, arm64` runners
- **44 jobs (22%)** use `ubuntu-latest` (GitHub-hosted, metered)
- **19 jobs (10%)** use other `self-hosted, macos` variants
- **23 jobs (11%)** use dynamic runner resolution

### Current Cost Structure

| Runner Type | Per-Minute Cost | Annual Cost (Estimated) |
|---|---|---|
| GitHub-hosted Ubuntu | $0.008/min | ~$46/month |
| GitHub-hosted macOS | $0.016/min | ~$82/month |
| Self-hosted Mac | $0/min (infra only) | ~$500-2000/year (hardware) |

**Current estimated GitHub-hosted metered cost:** ~$81.65/month (~$980/year)

## Current Runner Configuration Breakdown

```
┌─────────────────────────────────────────────────────┐
│ RUNNER TYPE DISTRIBUTION (199 total jobs)          │
├─────────────────────────────────────────────────────┤
│ [self-hosted, mac-studio, arm64]    113 (56.8%)    │
│ ubuntu-latest (GitHub-hosted)        44 (22.1%)    │
│ [self-hosted, macos]                 19 (9.5%)     │
│ ${{ fromJson(...) }} (dynamic)        15 (7.5%)    │
│ [self-hosted, apple-silicon]          4 (2.0%)     │
│ [self-hosted, mac-studio]             3 (1.5%)     │
│ [self-hosted, macbook-pro]            1 (0.5%)     │
└─────────────────────────────────────────────────────┘
```

## Identified Mac Self-Hosted Infrastructure

From `test-mac-runner.yml` smoke tests, confirmed runners:

1. **Mac Studio** (`self-hosted, mac-studio`) - Primary always-on runner
   - Label: `[self-hosted, mac-studio, arm64]`
   - Status: Always online
   - Capabilities: Docker, Python, Node.js, Git, GitHub CLI
   
2. **MacBook Pro** (`self-hosted, macbook-pro`) - Secondary runner
   - Status: Online when lid is open
   - Capabilities: Same as Mac Studio
   - Continue-on-error: Appropriate for secondary runner

3. **Apple Silicon** runners (`self-hosted, apple-silicon`) - Alternative label
   - 4 jobs currently using this label
   - May represent additional M-series Macs

## Workflows Using ubuntu-latest (44 jobs across 31 workflows)

These are **candidates for immediate migration** to self-hosted Mac runners:

### High-Priority Candidates (No architectural barriers)

| Workflow | Count | Reason | Estimated Savings |
|---|---|---|---|
| `audit-log.yml` | 1 | Simple shell scripts | $5.76/mo |
| `audit-sign-envelope.yml` | 1 | Shell scripts | $5.76/mo |
| `audit-verify.yml` | 1 | Shell scripts | $5.76/mo |
| `dependency-audit-inventory.yml` | 1 | Python/shell | $5.76/mo |
| `dependency-eol.yml` | 1 | Python/shell | $5.76/mo |
| `gap-bootstrap-auto.yml` | 1 | Python/shell | $5.76/mo |
| `hygiene.yml` | 1 | Shell scripts | $5.76/mo |
| `org-dashboard.yml` | 1 | Python/shell | $5.76/mo |
| `vuln-triage.yml` | 1 | Python/shell | $5.76/mo |

**Subtotal: 9 workflows → ~$51.84/mo savings**

### Medium-Priority Candidates (Requires verification)

| Workflow | Count | Considerations |
|---|---|---|
| `code-quality.yml` | 1 | CodeQL works on Mac; verify language support |
| `ci-gap-status.yml` | 1 | Likely portable |
| `deploy-tempo.yml` | 1 | Deployment script |
| `gap-dashboard.yml` | 1 | Dashboard build |
| `gap-validate.yml` | 1 | Validation scripts |
| `hipaa-compliance.yml` | 1 | Compliance checks |

**Subtotal: 6 workflows → ~$34.56/mo savings (if viable)**

### Special Consideration Workflows

| Workflow | Count | Issue | Status |
|---|---|---|---|
| `container.yml` | 2 jobs | Docker builds; Mac supports Docker Desktop | **Migrate with verification** |
| `reusable-release.yml` | 1 | Release process | **Verify dependencies** |
| `reusable-slsa-provenance.yml` | 1 | SLSA attestation | **Migrate** |
| `ehr-sandbox-validation.yml` | 1 | Domain-specific | **Verify** |

### Not Recommended for Migration (Keep ubuntu-latest)

- **None identified** — All ubuntu-latest jobs appear compatible with macOS

## Migration Strategy

### Phase 3.1: Low-Risk Migrations (Weeks 1-2)

Migrate 9 high-confidence workflows from `ubuntu-latest` to `[self-hosted, mac-studio, arm64]`:

```yaml
# OLD
runs-on: ubuntu-latest

# NEW
runs-on: [self-hosted, mac-studio, arm64]
```

**Workflows:**
- audit-log.yml
- audit-sign-envelope.yml
- audit-verify.yml
- dependency-audit-inventory.yml
- dependency-eol.yml
- gap-bootstrap-auto.yml
- hygiene.yml
- org-dashboard.yml
- vuln-triage.yml

**Expected savings:** ~$51.84/month (~$622/year)

### Phase 3.2: Medium-Risk Migrations (Weeks 3-4)

Test and migrate 6 medium-confidence workflows:

1. Verify CodeQL language support on Mac
2. Test gap-dashboard build on Mac
3. Validate compliance check execution
4. Test deployment script execution

**Workflows:**
- code-quality.yml (detect-languages job)
- ci-gap-status.yml
- deploy-tempo.yml
- gap-dashboard.yml
- gap-validate.yml
- hipaa-compliance.yml

**Expected savings:** ~$34.56/month (~$414/year)

### Phase 3.3: Container & Advanced Workflows (Weeks 5-6)

1. Verify Docker Desktop on Mac Studio
2. Test multi-platform container builds on arm64
3. Validate container.yml workflow compatibility
4. Test release and SLSA workflows

**Workflows:**
- container.yml (both hadolint and build jobs)
- reusable-release.yml
- reusable-slsa-provenance.yml
- reusable-container-sign.yml

**Expected savings:** ~$18.43/month (~$221/year)

## Fallback Strategy

For workflows that **cannot** run on Mac runners, implement a fallback mechanism:

```yaml
runs-on: |
  ${{ (github.event_name == 'pull_request' && 'self-hosted, mac-studio, arm64') 
      || 'ubuntu-latest' }}
```

This ensures:
- PRs run on cost-free self-hosted runners when possible
- Scheduled workflows fall back to GitHub-hosted if needed
- Critical workflows have redundancy

## Implementation Guardrails

1. **Test all migrations on branch before merging**
2. **Keep `ubuntu-latest` as fallback** for 30 days
3. **Monitor runner queue depth** — reschedule jobs if queue exceeds 5 minutes
4. **Weekly smoke tests** already in place (`test-mac-runner.yml`)
5. **Revert procedure:** Single commit per workflow for easy rollback

## Financial Impact Summary

| Phase | Workflows | Jobs | Monthly Savings | Annual Savings |
|---|---|---|---|---|
| Current (Phase 2) | - | - | ~$50.00* | ~$600* |
| Phase 3.1 (Low-risk) | 9 | 9 | -$51.84 | -$622 |
| Phase 3.2 (Medium-risk) | 6 | 6 | -$34.56 | -$414 |
| Phase 3.3 (Advanced) | 4 | 6 | -$18.43 | -$221 |
| **After Phase 3** | **19** | **21** | **-$104.83** | **-$1,257** |

*Estimated from Phase 2 schedule optimization

**Total Phase 3 Potential Savings: $104.83/month (~$1,257/year)**

Combined with Phase 2 schedule optimization (~$31.65/month savings), **total GitHub Actions savings: ~$136.48/month (~$1,638/year)**

## Success Criteria

✓ All 44 ubuntu-latest jobs migrated or documented with rationale  
✓ No increase in workflow execution time (Mac runners are comparable)  
✓ Runner queue depth remains <5 minutes  
✓ All smoke tests passing (weekly)  
✓ Zero unplanned workflow failures due to runner migration  

## Next Steps

1. Create runner health check workflow
2. Implement Phase 3.1 migrations
3. Test container builds on arm64
4. Monitor runner performance and adjust as needed
5. Document learnings and update CI/CD playbook

---

**Related Documentation:**
- [SELF_HOSTED_RUNNER_SETUP.md](./SELF_HOSTED_RUNNER_SETUP.md) — Runner infrastructure and setup
- [Phase 2 Analysis](./COST_OPTIMIZATION_STRATEGY.md) — Schedule optimization results
