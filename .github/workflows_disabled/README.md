# CI/CD Pipeline: Automated SDLC Gates

**Purpose:** Automate IEC 62304 software development lifecycle with 8 compliance gates  
**Compliance:** IEC 62304, CFR Part 11, HIPAA, SLSA v1.0  
**Version:** 1.0 (April 25, 2026)

---

## Overview: 8 SDLC Gates Automated

The CI/CD pipeline implements all 8 approval gates from the SDLC Release Runbook:

| Gate | Phase | Trigger | Workflow | Status |
|------|-------|---------|----------|--------|
| 1 | Design Input | PR created | Code review, requirements traceability | ✅ Automated |
| 2 | Implementation | PR updated | Unit tests ≥80%, static analysis, database migration validation | ✅ Automated |
| 3 | Verification | Before merge | Integration tests, audit trail verification | ✅ Automated |
| 4 | Validation | Before merge | System tests (FHIR, EHR), compliance verification | ✅ Automated |
| 5 | Release | PR merged to main | Build artifact, SBOM, SLSA signing, deploy staging | ✅ Automated |
| 6 | Approval Gate | After staging deployment | Manual approval (release manager + compliance) | ⏸️ Manual step |
| 7 | Production Deployment | After approval | Blue-green deployment, health checks | ✅ Automated |
| 8 | Post-Release Monitoring | After production | Metrics verification, incident alerts | ✅ Automated |

---

## Workflow Files

### 1. **01-build-and-test.yml** (Gates 1-2: Design & Implementation)

**Triggers:**
- PR created/updated (any branch, changes to src/tests)
- Push to main (automatic after merge)

**Jobs:**

#### Code Review (Gate 1)
```bash
✓ PR description required
✓ Labels recommended (design-reviewed, implementation, etc.)
✓ References requirement (issue #, RFC, IEC 62304 §)
```

#### Unit Tests (Gate 2)
```bash
✓ Pytest coverage ≥80%
✓ All tests pass
✓ Coverage badge generated
```

#### Static Analysis
```bash
✓ Code format: Black
✓ Import order: isort
✓ Linting: Pylint (score ≥8.0)
✓ Type checking: MyPy (--strict mode)
✓ Security: Bandit (bans insecure patterns)
```

#### Dependency Scanning
```bash
✓ Snyk: Checks for vulnerable packages
✓ Trivy: Container image vulnerabilities
```

#### Database Validation
```bash
✓ Runs all migrations on test database
✓ Verifies immutability constraint exists
✓ Verifies audit trail columns present
✓ Verifies role-based access control
```

**Failure Behavior:**
- ❌ Code review failure → PR blocked
- ❌ Unit tests failure → PR blocked
- ⚠️ Static analysis warnings → PR allowed (suggestions only)
- ⚠️ Dependency warnings → PR allowed (alert shown)
- ❌ Database validation failure → PR blocked

---

### 2. **02-integration-system-tests.yml** (Gates 3-4: V&V)

**Triggers:**
- PR updated (any branch, changes to src/tests/infrastructure)

**Jobs:**

#### Integration Tests (Gate 3)
```bash
Services:
  - PostgreSQL (audit trail database)
  - Redis (caching)

Tests:
✓ API endpoints respond
✓ Database queries work
✓ Audit trail inserts succeed
✓ Audit trail immutability enforced
```

#### System Tests (Gate 4)
```bash
Tests:
✓ FHIR US Core 6.1 compliance
✓ Patient resource structure
✓ Observation (vitals) resources
✓ Medication resources
✓ EHR export (FHIR format)
✓ EHR import (OAuth validation)
```

#### Compliance Verification
```bash
IEC 62304:
✓ Design traceability matrix (requirement → design → tests)

CFR Part 11:
✓ Immutable storage implemented
✓ Digital signatures present
✓ Encrypted transport configured
✓ User authentication implemented
✓ Access control in place
✓ Audit logging enabled

HIPAA:
✓ AES-256-GCM encryption configured
✓ MFA requirement enabled
✓ TLS configured
```

#### Security Scanning
```bash
✓ Trivy container scan
✓ Blocks on CRITICAL vulnerabilities
✓ Allows HIGH (requires review)
```

**Failure Behavior:**
- ❌ Integration test failure → PR blocked
- ❌ System test failure → PR blocked
- ⚠️ Compliance warnings → PR allowed (audit trail)

---

### 3. **03-release-and-deploy.yml** (Gates 5-8: Release & Deployment)

**Triggers:**
- Push to main (after all gates 1-4 pass)
- Manual dispatch (specify staging/production)

**Jobs:**

#### Build Artifact
```bash
1. Determine version (git tag or timestamp)
2. Build Docker image
3. Push to container registry (ghcr.io)
4. Enable Docker BuildKit for layer caching
5. Return image digest (immutable reference)
```

#### SBOM Generation (CycloneDX)
```bash
1. Generate SBOM with Syft (container layers)
2. Generate SBOM with CycloneDX (Python dependencies)
3. Validate all components listed
4. Upload as artifact
```

#### SLSA v1.0 Provenance
```bash
1. Use slsa-framework/slsa-github-generator
2. Generate provenance in SLSA format
3. Include:
   - Builder identity (GitHub Actions)
   - Build invocation (workflow run)
   - Source commit hash
   - All dependencies
   - Build instructions
   - Build output digest

Signing:
4. Install Cosign (Sigstore)
5. Sign image with GitHub OIDC token (keyless)
   - No keys stored; ephemeral token from GitHub
6. Verify signature works
```

#### Vulnerability Scanning
```bash
✓ Trivy scans final image
✓ Blocks on CRITICAL
✓ Allows HIGH (logged for manual review)
```

#### Deploy to Staging
```bash
1. Update EKS kubeconfig (staging environment)
2. kubectl set image (rolling update)
3. kubectl rollout status (wait for completion)
4. Run smoke tests
   - Health check endpoint
   - Basic API connectivity
   - Database connectivity
5. Success → Ready for manual approval
```

#### Manual Approval for Production
```bash
Environment: production
Required approvers: Release Manager, Compliance Officer
Approval required: YES (blocks further deployment)
```

#### Deploy to Production (Blue-Green)
```bash
1. AWS credentials with production role
2. Deploy new version to "green" deployment
3. Run health checks on green
4. Switch traffic from blue → green
5. Kubernetes service selector updates
6. Old (blue) deployment remains for rollback
```

#### Monitoring & Metrics
```bash
1. Wait 2 minutes for metrics to stabilize
2. Check error rate (should stay <1%)
3. Alert if rate elevated
4. Prometheus integration
5. Slack notification with deployment status
```

---

## Security Features

### 1. **Keyless Code Signing (Cosign + GitHub OIDC)**

**What it does:**
- Container images signed without storing keys in secrets
- Uses ephemeral GitHub OIDC token
- Can verify signature with: `cosign verify --certificate-oidc-issuer`

**Benefits:**
- ✅ No key management (GitHub handles it)
- ✅ Keys never exposed in logs
- ✅ Audit trail (GitHub token issued for specific workflow run)
- ✅ Complies with SLSA v1.0 keyless signing requirement

### 2. **SBOM (Software Bill of Materials)**

**Contents:**
- All container base layers
- All Python dependencies (from requirements.txt)
- Version numbers for all components
- License information
- Checksums for integrity

**Purpose:**
- Transparency: Know exactly what's in the build
- Vulnerability tracking: Trace CVEs to specific components
- FDA evidence: Show supply chain integrity
- License compliance: Verify no GPL/unlicensed code

### 3. **SLSA v1.0 Provenance**

**Includes:**
```json
{
  "builder": "https://github.com/slsa-framework/slsa-github-generator",
  "buildType": "https://github.com/slsa-framework/github-actions-buildtypes/workflow/v1",
  "invocation": {
    "configSource": "https://github.com/.../workflows/03-release-and-deploy.yml",
    "parameters": {...},
    "environment": {...}
  },
  "buildConfig": {
    "steps": [...]
  },
  "materials": [
    {"uri": "git+https://github.com/.../commit/abc123", "digest": {...}}
  ],
  "byproducts": {
    "buildLog": "https://github.com/actions/runs/12345"
  }
}
```

**Verification:**
```bash
# Anyone can verify:
slsa-verifier verify-image ghcr.io/company/platform:v1.0.0 \
  --provenance-path provenance.json \
  --source-uri https://github.com/company/platform
```

---

## Gate Failure Handling

### Critical Gate Failures (Blocks Merge)

| Gate | Failure | Action |
|------|---------|--------|
| 1 | Missing PR description | ❌ Block until fixed |
| 2 | Unit tests <80% coverage | ❌ Block until fixed |
| 2 | Database migration error | ❌ Block until fixed |
| 3 | Integration test failure | ❌ Block until fixed |
| 4 | System test failure | ❌ Block until fixed |
| 5 | Vulnerability (CRITICAL) | ❌ Block deployment |

### Non-Critical Warnings (Allow with Documentation)

| Gate | Warning | Action |
|------|---------|--------|
| 2 | Pylint score <9.0 | ⚠️ Log as comment, allow merge |
| 2 | Bandit finds issues | ⚠️ Log as comment, allow merge |
| 3 | Compliance check finds gaps | ⚠️ Log as comment, allow merge |
| 4 | Vulnerability (HIGH) | ⚠️ Log as comment, allow merge |

---

## Usage Examples

### Example 1: Create a Pull Request (Gates 1-4)

```bash
# 1. Create feature branch
git checkout -b feature/fhir-sync

# 2. Make changes
vim src/fhir_integration.py
pytest tests/unit/test_fhir.py  # ✅ Passes locally

# 3. Commit and push
git add src/ tests/
git commit -m "feat: Add FHIR sync endpoint"
git push origin feature/fhir-sync

# 4. Create PR on GitHub
# GitHub Actions automatically runs:
# ✅ Code review checks (Gate 1)
# ✅ Unit tests (Gate 2)
# ✅ Static analysis
# ✅ Integration tests (Gate 3)
# ✅ System tests (Gate 4)

# Once all pass → PR can be merged
```

### Example 2: Merge to Main (Gate 5)

```bash
# PR is approved, all gates passing
# Click "Merge" button on GitHub

# GitHub Actions automatically:
# ✅ Build Docker image
# ✅ Generate SBOM
# ✅ Sign with Cosign (keyless)
# ✅ Scan for vulnerabilities
# ✅ Deploy to staging
# ✅ Run smoke tests

# If all pass → Ready for manual production approval
```

### Example 3: Manual Production Deployment (Gates 6-8)

```bash
# After staging verification is complete:
# 1. Release manager goes to GitHub Actions
# 2. Clicks "Approve and deploy to production"

# GitHub Actions automatically:
# ✅ Blue-green deployment
# ✅ Health checks
# ✅ Traffic switch
# ✅ Monitoring

# Deployment complete!
```

---

## Monitoring & Alerting Integration

### Workflow Status Checks

All PRs require passing checks before merge:

```bash
# Required checks:
- build-and-test / code-review
- build-and-test / unit-tests
- build-and-test / static-analysis
- integration-system-tests / integration-tests
- integration-system-tests / system-tests
- integration-system-tests / compliance-verification
```

### Slack Notifications

Deployments send notifications:

```
🚀 Release: v20260425-abc123
Build: ✅
Staging Deploy: ✅
Production Deploy: ⏳ Awaiting approval
```

### GitHub Actions Dashboard

View all workflow runs:
- `Actions` tab → Filter by workflow
- `Deployments` tab → View deployment history
- `Security` tab → View scan results

---

## Cost & Performance

### GitHub Actions Usage

```
Per workflow run:
- Code review: 2 minutes (free tier)
- Unit tests: 5 minutes (free tier)
- Integration tests: 10 minutes (free tier)
- System tests: 15 minutes (free tier)
- Build & sign: 5 minutes (free tier)

Total: ~40 minutes per PR
Free tier: 2,000 minutes/month (enough for ~50 PRs)

Cost: $0.008/minute after free tier
Estimated monthly: $150 for active development
```

### Optimization Tips

1. **Cache Docker layers:**
   - `cache-from: type=gha` (GitHub Actions Cache)
   - Saves ~3 minutes per build

2. **Parallel jobs:**
   - Code review + static analysis run in parallel
   - Saves ~5 minutes per PR

3. **Matrix builds:**
   - Python 3.9, 3.10, 3.11 in parallel (optional)
   - Only if multi-version support needed

---

## Compliance Mapping

### IEC 62304 §5 (Software Development)

| Phase | Gate | Evidence | Automated |
|-------|------|----------|-----------|
| §5.2 Requirements | 1 | PR description + traceability | ✅ Check |
| §5.3 Design | 2 | Code review + static analysis | ✅ Check |
| §5.4 Implementation | 2 | Unit tests ≥80% + linting | ✅ Check |
| §5.5 Verification | 3 | Integration tests | ✅ Check |
| §5.6 Validation | 4 | System tests + compliance | ✅ Check |
| §5.7 Release | 5 | SBOM + SLSA + signature | ✅ Check |

### CFR Part 11 (Electronic Records)

| Requirement | Evidence | Where |
|---|---|---|
| §11.10 Data Integrity | Immutability test (Gate 3) | Integration tests |
| §11.70 Audit Trail | Audit trail validation (Gate 3) | Integration tests |
| §11.100 Authentication | MFA check (Gate 4) | Compliance verification |
| §11.200 Signatures | Cosign signature (Gate 5) | Build & sign |

### HIPAA Security Rule

| Control | Evidence | Verification |
|---|---|---|
| §164.312(a)(2)(ii) Encryption | AES-256-GCM config check (Gate 4) | Compliance verification |
| §164.312(b) Audit Controls | Audit trail check (Gate 3) | Integration tests |

---

## Troubleshooting

### Workflow Failures

**Unit tests fail locally but pass in CI?**
```bash
# Run tests in Docker to match CI environment
docker build -t test . --target test
docker run test pytest tests/unit -v
```

**SBOM validation fails?**
```bash
# Check SBOM has components
python3 -c "import json; sbom=json.load(open('sbom.json')); print(f'Components: {len(sbom[\"components\"])}')"
```

**Cosign signature verification fails?**
```bash
# Ensure you're using correct image digest
cosign verify --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  ghcr.io/company/platform@sha256:abc123...
```

---

## References

- **SLSA Framework:** https://slsa.dev/
- **Cosign Documentation:** https://github.com/sigstore/cosign
- **GitHub Actions:** https://docs.github.com/actions
- **IEC 62304:** https://www.iec.ch/webstore/publication/21090
- **CFR Part 11:** https://www.ecfr.gov/current/title-21/part-11

---

## Support

For workflow issues:
1. Check `Actions` tab for detailed logs
2. Review GitHub Actions documentation
3. Check workflow file syntax: `actions/github-script`
4. File issue in repository (tag: @platform-team)

Last Updated: April 25, 2026
