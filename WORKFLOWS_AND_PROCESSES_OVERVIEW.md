# Workflows & Processes Overview

**Repository:** `ruralpeds/.github`  
**Purpose:** Org-level CI, compliance automation, audit logging, and governance for clinical and scientific software  
**Regulatory Scope:** HIPAA, GAMP 5, FDA 524B, 21 CFR Part 11, IEC 62304, ISO 14971  
**Last Updated:** 2026-05-02

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [SDLC Gate Framework](#sdlc-gate-framework)
3. [Workflow Categories](#workflow-categories)
4. [Language-Specific CI Workflows](#language-specific-ci-workflows)
5. [Compliance & Regulatory Workflows](#compliance--regulatory-workflows)
6. [Audit & Traceability Workflows](#audit--traceability-workflows)
7. [Organization Governance Workflows](#organization-governance-workflows)
8. [Scheduled & Automation Workflows](#scheduled--automation-workflows)
9. [Reusable Workflow Patterns](#reusable-workflow-patterns)
10. [Gap Analysis & Status Tracking](#gap-analysis--status-tracking)
11. [Integration Points](#integration-points)

---

## Executive Summary

The `ruralpeds/.github` repository contains **100+ GitHub Actions workflows** organized across multiple functional areas:

- **SDLC Gates:** 5-phase quality gates from design through deployment (IEC 62304 compliance)
- **Language CI:** Node.js, Python, Rust, Go, Julia with matrix testing and coverage tracking
- **Compliance:** HIPAA PHI scanning, FDA 524B SBOM generation, SLSA provenance, supply chain security
- **Audit & Signatures:** Electronic signature envelopes, audit logging, RTM (Requirements Traceability Matrix)
- **Org Governance:** Repository standards, configuration sync, automated sweeps and remediation
- **Gap Analysis:** Real-time CI status tracking, gap lifecycle management, sprint planning

**Key characteristics:**
- All primary workflows require **IEC 62304 compliance mapping**
- Audit trail and immutable logging throughout
- SLSA Level 3+ supply chain security
- Reusable workflow pattern for org-wide standardization
- Scheduled sweeps for continuous monitoring and remediation

---

## SDLC Gate Framework

The system implements a **5-phase SDLC quality gate framework** following IEC 62304:

| Phase | Workflow | Gate Name | Compliance | Triggers |
|-------|----------|-----------|-----------|----------|
| 1-2 | `01-build-and-test.yml` | Code Review & Design Input | IEC 62304 §5.3-5.4 | PR open, push to main |
| 3 | `02-integration-system-tests.yml` | Integration & System Testing | IEC 62304 §5.5 | PR open, push to main |
| 4 | `code-quality.yml` | Code Quality & Security | IEC 62304 §5.6 | PR open, daily scheduled |
| 5a | `release-gate.yml` | Release Gating | IEC 62304 §5.7 | Tag creation, workflow_dispatch |
| 5b | `03-release-and-deploy.yml` | Release & Deployment | IEC 62304 §5.7-5.8 | Tag push, workflow_dispatch |

### Gate Flow

```
PR Opened
    ↓
[Gate 1-2: Build & Test]
    ├─ Code review verification
    ├─ Static analysis (semgrep, SonarQube)
    ├─ Unit tests (≥80% coverage)
    └─ SARIF reporting
    ↓
[Gate 3: Integration & System Tests]
    ├─ Integration tests
    ├─ System tests
    ├─ Contract tests
    └─ E2E tests (Playwright)
    ↓
[Gate 4: Code Quality & Security]
    ├─ SAST (semgrep, bandit, clippy)
    ├─ Dependency audit
    ├─ License scan
    └─ Secret scanning
    ↓
PR Approved & Merged to main
    ↓
[Gate 5a: Release Gating]
    ├─ Changelog validation
    ├─ SBOM generation
    └─ Release readiness checks
    ↓
[Gate 5b: Release & Deploy]
    ├─ Version bumping
    ├─ Build artifacts
    ├─ SLSA provenance
    ├─ Artifact signing (cosign)
    ├─ Notary attestation
    └─ Deploy to staging/production
```

---

## Workflow Categories

### By Function

The workflows are organized into logical functional areas:

```
Workflows (100+)
├── SDLC Gates (5 main gates)
├── Language CI (9 workflows)
├── Compliance & Regulatory (20+ workflows)
├── Audit & Signatures (6+ workflows)
├── Organization Governance (15+ workflows)
├── Scheduled Automation (10+ workflows)
├── Reusable Utilities (60+ workflows)
└── Infrastructure & Deployment (5+ workflows)
```

### Total Workflow Count by Category

| Category | Count | Purpose |
|----------|-------|---------|
| Main SDLC Gates | 5 | Phase-gated quality gates |
| Language CI | 9 | Language-specific testing & coverage |
| Compliance & Regulatory | 25 | HIPAA, FDA, SLSA, IEC 62304 compliance |
| Audit & Traceability | 8 | Electronic signatures, audit logs, RTM |
| Org Governance | 18 | Repository standards, config sync |
| Scheduled Sweeps | 12 | Continuous monitoring, remediation |
| Reusable Utilities | 65 | Helper workflows for reuse across org |
| Infrastructure & Deployment | 7 | Infrastructure provisioning, deployment |
| **TOTAL** | **~149** | Complete org-level automation |

---

## Language-Specific CI Workflows

All language CI workflows follow a consistent pattern:
- **Matrix testing** across multiple language versions
- **Code quality checks** (lint, format, typecheck)
- **Security scanning** (bandit, cargo audit, npm audit, etc.)
- **Unit tests** with coverage reporting
- **Coverage artifacts** uploaded for tracking
- **Timeout guards** and retry logic on transient failures

### Node.js CI (`ci-node.yml`)

**Triggers:** PR to main/develop, push to main  
**Compliance:** IEC 62304 §5.3-5.4, OWASP Top 10

**Jobs:**
- ESLint + Prettier (lint & format)
- TypeScript type checking
- Jest unit tests (coverage ≥80%)
- npm audit (dependency security)
- SARIF upload to code scanning

**Outputs:**
- `coverage/coverage-final.json` artifact
- JUnit XML test results
- SARIF report

### Python CI (`ci-python.yml`)

**Triggers:** PR to main/develop, push to main  
**Compliance:** IEC 62304 §5.3-5.4, PEP 8 style

**Jobs:**
- Ruff linting & format check
- MyPy type checking
- Bandit security scanning
- Pytest unit tests (coverage ≥80%)
- Coverage badge generation

**Outputs:**
- `.coverage` artifact
- JUnit XML reports
- Bandit JSON report

### Rust CI (`ci-rust.yml`)

**Triggers:** PR to main/develop, push to main  
**Compliance:** IEC 62304 §5.3-5.4, MISRA-C equivalents

**Jobs:**
- `cargo fmt --check` (formatting)
- `cargo clippy` (linting with compiler plugins)
- `cargo test` (unit tests)
- `cargo audit` (dependency audit)
- Tarpaulin code coverage
- Optional fuzzing (via `reusable-fuzz-rust.yml`)

**Outputs:**
- Coverage report
- Clippy JSON report
- SARIF upload

### Go CI (`ci-go.yml`)

**Triggers:** PR to main/develop, push to main  
**Compliance:** IEC 62304 §5.3-5.4

**Jobs:**
- `gofmt -l` (format check)
- `golangci-lint` (comprehensive linting)
- `go vet` (built-in vet checks)
- `gosec` (security analysis)
- `go test -race` (race condition detection)

### Julia CI (`ci-julia.yml` + `ci-julia-react.yml`)

**Base workflow (`ci-julia.yml`):**
- JuliaFormatter (format check)
- Aqua.jl (code quality)
- JET.jl (static analysis)
- Pkg.test (unit tests with coverage)

**Full-stack variant (`ci-julia-react.yml`):**
- Julia + React + Playwright
- Client-side TypeScript testing
- E2E tests via Playwright
- Multi-browser coverage

### E2E Testing (`e2e-playwright.yml`)

**Triggers:** PR to main, push to main, schedule (6 AM daily)  
**Browsers:** Chrome, Firefox, WebKit (matrix)

**Features:**
- Parallel test sharding across 3+ workers
- Artifact capture: screenshots, traces, videos
- Failed test retry logic (up to 2 retries)
- JUnit XML reporting
- HAR file recording for request/response debugging

**Outputs:**
- Playwright traces (`.zip`)
- Screenshots and videos
- JUnit XML results

### Container CI (`container.yml`)

**Triggers:** PR to main/develop, push to main, workflow_dispatch  
**Compliance:** SLSA v1.0, NIST SSDF PS.4.1

**Jobs:**
1. **Hadolint:** Docker best practices linting
2. **Build:** Multi-platform (linux/amd64, linux/arm64)
3. **Trivy scan:** Container vulnerability scanning → SARIF
4. **Push to GHCR:** If authenticated
5. **SLSA attestation:** Generate Level 3 provenance

**Outputs:**
- Container image digest
- Trivy vulnerability report (SARIF)
- SLSA attestation (JSON)

### Release Workflow (`release.yml`)

**Triggers:** Manual workflow_dispatch on main  
**Standard:** Conventional commits (semantic versioning)

**Jobs:**
1. Validate commits follow conventional commit spec
2. Generate changelog from commits
3. Calculate next semantic version
4. Create GitHub release with changelog
5. Tag commit with version
6. Push release

**Outputs:**
- GitHub Release with tag
- Generated changelog
- Version number

---

## Compliance & Regulatory Workflows

### HIPAA & PHI Security

#### `reusable-phi-scan.yml` (IEC 62304 §5.3.3, HIPAA §164.312(b))

**Purpose:** Detect HIPAA 18 Safe Harbor identifiers in code

**Detection categories:**
- Patient names, addresses, birthdates
- Medical record numbers, account numbers
- Biometric identifiers, genetic markers
- Email addresses, phone numbers with context

**Scanning tools:**
- Gitleaks (custom patterns for healthcare identifiers)
- Semgrep (domain-specific healthcare rules)

**Output:** SARIF report uploaded to GitHub code scanning

**Failure handling:** Blocks PR if PHI detected; allows override with justification comment

#### `reusable-secret-scan-report.yml`

**Purpose:** Comprehensive secret scanning with audit trail

**Scanned secrets:**
- API keys, tokens (GitHub, AWS, Azure, GCP, etc.)
- Database credentials
- Private keys (RSA, EC, PGP)
- OAuth tokens, JWT secrets
- Slack/Datadog/PagerDuty tokens

**Features:**
- Gitleaks + custom patterns
- Entropy analysis
- Allowlist for known test fixtures
- Detailed SARIF output with remediation guidance
- Audit log entry for each scan

### FDA & Supply Chain Security

#### `reusable-sbom.yml` (FDA 524B, EO 14028, NIST SSDF PS.4.2)

**Purpose:** Generate Software Bill of Materials (SBOMs)

**Formats generated:**
- **CycloneDX 1.5:** XML/JSON format for supply chain transparency
- **SPDX 2.3:** Standardized format for license compliance

**Contents:**
- All direct dependencies (packages, versions, licenses)
- Transitive dependencies (full dependency tree)
- License information with SPDX identifiers
- Component hashes (SHA-256, SHA-512)

**Tools:**
- `cyclonedx-npm`, `cyclonedx-python`, `cargo-sbom`, etc.
- `syft` (container/image SBOM generation)

**Output:** SBOMs committed to `sbom/` directory
- `sbom-{version}.cyclonedx.json`
- `sbom-{version}.spdx.json`

**License denylist:** Checks against org-defined blocked licenses (GPL variants, AGPL, etc.)

#### `reusable-slsa.yml` + `reusable-slsa-provenance.yml` (NIST SSDF PS.3.2, FDA 524B)

**SLSA Level 3 Provenance:**

**Purpose:** Generate cryptographically signed build provenance

**Inputs captured:**
- Build materials (source code commit, branch)
- Build configuration (workflow file, inputs)
- Build environment (runner, OS, container)
- Build steps and outputs
- Timestamps

**Generation:**
- Uses `slsa-github-generator` for SLSA Level 3
- Sigstore integration for keyless signing (no secret key management)
- Attestation uploaded to Rekor transparency log

**Verification:**
```bash
slsa-verifier verify-artifact \
  --artifact-path app.tar.gz \
  --provenance provenance.intoto.jsonl \
  --source-uri github.com/ruralpeds/app
```

#### `reusable-supply-chain-rust.yml` (NIST SSDF PS.4.1, FDA 524B)

**Purpose:** Rust-specific supply chain security

**Actions:**
1. Dependency audit via `cargo audit`
2. License audit via `cargo license`
3. Outdated dependency check via `cargo outdated`
4. SBOM generation via `cargo sbom`
5. Yanked dependency detection
6. Dependency graph analysis

**Failure triggers:**
- Critical or high-severity vulnerabilities
- Denied licenses detected
- Outdated dependencies beyond max-age policy

### IEC 62304 Traceability

#### `reusable-rtm.yml` (IEC 62304 §5.1.2, Requirements Traceability Matrix)

**Purpose:** Maintain traceability between requirements, design, code, tests

**Inputs:**
- Requirements document (CSV, markdown)
- Design specifications
- Source code (for design element mapping)
- Test cases (for coverage mapping)

**Validation:**
- Each requirement has ≥1 design element mapped
- Each design element has ≥1 code reference mapped
- Each design element has ≥1 test case
- No orphaned design elements or tests

**Output:** RTM report with coverage statistics
- Requirement → Design → Code → Test traceability
- Coverage percentages
- Gap analysis

**Integration:** Can be triggered manually or as pre-release gate

#### `reusable-iec62304-traceability.yml`

**Purpose:** Medical device software lifecycle traceability

**Maps across:**
- IEC 62304 §5.1 Software Safety Plan
- §5.2 Software Requirements Specification
- §5.3 Software Design Specification
- §5.4 Software Unit Implementation & Verification
- §5.5 Software Integration & Integration Testing
- §5.6 Software System Testing
- §5.7 Software Release

**Outputs:**
- Traceability matrix (Excel/CSV)
- Gap report
- RACI matrix for roles
- Change request impact analysis

### License & Dependency Management

#### `reusable-license-scan.yml` (FDA 524B, NIST SSDF PS.4.2)

**Purpose:** License compliance and risk assessment

**Scanners:**
- FOSSA (commercial license intelligence)
- `license-check-and-add` (NPM)
- `poetry` license command (Python)
- `cargo-license` (Rust)
- `license_finder` (polyglot)

**Policy enforcement:**
- Denylist: GPL, AGPL, SSPL, and custom corporate bans
- Allowlist: Permitted licenses (Apache 2.0, MIT, BSD-3-Clause, etc.)
- Copyleft analysis: Flags GPL variants requiring source disclosure
- Commercial licensing: Detects non-open-source libraries

**Report:** JSON/HTML with license risk assessment

#### `dependency-eol.yml` (IEC 62304 §5.8, Maintenance)

**Purpose:** Track end-of-life dependencies

**Checks:**
- Python package EOL status (against PEP 387)
- Node.js package deprecation status
- Go module maintenance status
- Rust crate maturity (pre-1.0 warnings)

**Database:** Queries reputable EOL tracking services
- `endoflife.date` API
- Package registry deprecation flags
- Maintainer announcements

**Alert:** Flags dependencies approaching or past EOL

### Compliance Reporting

#### `check-compliance.yml` (FDA 21 CFR Part 11, HIPAA)

**Purpose:** Continuous compliance status checks

**Checks:**
1. HIPAA audit logging enabled
2. Encryption at rest/transit configured
3. Access controls properly configured
4. Data retention policies enforced
5. Incident response plan documented
6. Security training completion tracked

**Report:** Dashboard-ready JSON with compliance metrics

#### `hipaa-compliance.yml` (HIPAA §164.308, §164.312, §164.316)

**Purpose:** Comprehensive HIPAA compliance validation

**Administrative Safeguards (§164.308):**
- Authorization & workforce security
- Security training & awareness
- Security incident procedures
- Sanction policy
- Workforce security audit

**Physical Safeguards (§164.312):**
- Facility access controls
- Workstation security
- Device/media controls

**Technical Safeguards (§164.312):**
- Access control (authentication, authorization)
- Audit controls (logging)
- Integrity (checksums, digital signatures)
- Transmission security (encryption, VPN)

**Organizational Requirements (§164.308(a)(3)):**
- Documentation
- Delegation of authority
- Data integrity & encryption

**Output:** HIPAA compliance report with gap analysis

---

## Audit & Traceability Workflows

### Electronic Signatures & Envelope

#### `audit-sign-envelope.yml` (21 CFR Part 11 §11.70, HIPAA §164.312(c)(1))

**Purpose:** Create cryptographically signed audit envelopes

**Envelope contents:**
- Document/action metadata (timestamp, actor, action)
- Document hash (SHA-256)
- Signatory information (certificate, role)
- Digital signature (ECDSA via Sigstore Cosign)
- Previous envelope hash (immutable chain)

**Signing process:**
1. Create envelope JSON with document + metadata
2. Generate hash of envelope
3. Sign hash with cosign (OIDC Keyless signing)
4. Embed signature in envelope
5. Append to immutable ledger (Rekor)
6. Return envelope for audit log storage

**Verification:**
```bash
cosign verify-blob \
  --certificate envelope.crt \
  --signature envelope.sig \
  envelope.json
```

**Use cases:**
- Release approval signatures
- Change request signatures
- Security review signatures
- Compliance attestations

#### `audit-verify.yml` (21 CFR Part 11 §11.70(d), Signature Verification)

**Purpose:** Verify envelope signatures and detect tampering

**Verification steps:**
1. Extract signature from envelope
2. Reconstruct document hash
3. Verify signature against public key certificate
4. Check certificate chain against trusted roots
5. Validate timestamp is within acceptable range
6. Check for envelope chain integrity (previous hash matches)
7. Query Rekor for public transparency log entry

**Outputs:**
- Verification report (pass/fail per envelope)
- Tamper detection alerts
- Signature validity timeline
- Signer certificate details

**Failure scenarios:**
- Invalid signature
- Tampered content (hash mismatch)
- Expired or revoked certificate
- Rekor entry not found (missing transparency log)

### Audit Logging

#### `audit-log.yml` (HIPAA §164.312(b), IEC 62304 §5.7.3)

**Purpose:** Immutable audit logging for all regulatory events

**Events logged:**
- Release creation & deployment
- Security scan results
- Access control changes
- Configuration changes
- Data exports/backups
- User authentication & authorization
- Incident response actions

**Log format:**
```json
{
  "timestamp": "2026-05-02T15:30:45Z",
  "event_type": "release.created",
  "actor": "system/ci",
  "resource": "app@v2.3.1",
  "action": "release",
  "result": "success",
  "details": {...},
  "hash": "sha256:...",
  "previous_hash": "sha256:..."
}
```

**Storage:**
- Primary: Cloud audit logs (CloudTrail, Azure Audit Logs, etc.)
- Secondary: Immutable ledger (Rekor transparency log)
- Backup: Encrypted S3/blob storage with MFA delete

**Retention:** 7 years minimum (HIPAA requirement)

**Access:** Strictly audited; logging access is itself logged

#### `required-audit.yml`

**Purpose:** Mandatory audit logging enforcement

**Triggers:** Repository configuration changes, secrets rotation, access grant/revoke

**Validations:**
- Audit logging enabled
- Log retention >= 7 years
- Log immutability enforced
- Access controls on audit logs
- Audit log monitoring active

### Dashboard & Visualization

#### `audit-dashboard-sweep.yml` (Real-time compliance dashboard)

**Purpose:** Aggregate audit logs and compliance status into dashboard

**Scheduled:** Every 6 hours

**Collects:**
- Audit log entries from past 7 days
- Compliance status from all workflows
- Security scan results
- Deployment history
- Incident reports

**Generates:**
- JSON data feed for dashboard
- Compliance trend analysis
- KPI metrics (MTTR, release frequency, etc.)

---

## Organization Governance Workflows

### Repository Standards & Automation

#### `reusable-repo-standards.yml` (Org-wide standards enforcement)

**Purpose:** Enforce consistent repository configuration across org

**Validated:**
1. README.md exists and is not empty
2. CONTRIBUTING.md exists
3. CODE_OF_CONDUCT.md exists
4. LICENSE file present
5. `.gitignore` configured
6. Branch protection rules on main/develop
7. Required status checks configured
8. Dismiss stale PR reviews enabled
9. Require code review before merge (≥1 approval)
10. Require status checks to pass before merge
11. CODEOWNERS file configured (if multi-team)
12. Topics/labels configured
13. Description not empty
14. Visibility correct (public/private/internal)

**Auto-remediation:** Creates issues for missing items; optionally auto-creates boilerplate files

#### `repo-scanner.yml` (Repository inventory & compliance)

**Purpose:** Scan all org repositories for compliance issues

**Findings:**
- Outdated README (>6 months old)
- Missing CONTRIBUTING.md
- Unprotected branches
- Public secrets (in code or CI logs)
- Deprecated dependencies
- Missing security policy
- No recent commits (dormant repos)
- Missing CODEOWNERS

**Output:** Summary report; detailed findings per repo; remediation suggestions

#### `repo-audit.yml` (Historical audit trail)

**Purpose:** Maintain audit trail of repository changes

**Tracked:**
- Branch protection rule changes
- Collaborator access changes
- Secret scanning settings changes
- Deployment protection rule changes
- Custom property assignments

**Logs:** Immutable entries in audit log

### Configuration Sync & Governance

#### `sync-rulesets.yml` (Branch protection ruleset synchronization)

**Purpose:** Sync branch protection rulesets across org

**Synced rules:**
- Require code review (≥1 approval)
- Require status checks (CI gates)
- Require conversation resolution before merge
- Require deployment reviews
- Require signed commits (for sensitive repos)
- Restrict who can push to protected branches
- Dismiss stale reviews on push

**Targets:**
- main branch (most restrictive)
- develop branch (slightly less restrictive)
- release/* branches (gates for release candidates)
- hotfix/* branches (expedited gates for critical fixes)

**Update frequency:** Manual trigger or weekly sync

#### `sync-copilot-assets.yml` (Copilot automation synchronization)

**Purpose:** Sync Copilot task definitions and instructions

**Synced assets:**
- Copilot task templates (in `.github/copilot-tasks/`)
- Copilot instructions (in `copilot-instructions.md`)
- Inline agent comments in workflows
- Copilot action configurations

**Integration:** Allows Copilot to create PRs following org standards

#### `custom-properties-audit.yml` (Custom property tracking)

**Purpose:** Audit and enforce custom repository properties

**Properties tracked:**
- `team`: Which team owns the repo
- `platform`: Frontend, backend, CLI, library, etc.
- `language`: Primary language
- `maturity`: Prototype, MVP, stable, deprecated
- `compliance-level`: HIPAA, FDA 510(k), FDA IDE, research-only
- `soc2`: SOC 2 audit status
- `has-data-residency`: Data residency requirements

**Enforcement:** Blocks repo creation without required properties

### Sweeps & Remediation

#### `bootstrap-ci-readme-sweep.yml` (Auto-add README CI status markers)

**Purpose:** Add gap-status markers to README.md in all CI-tracked repos

**Action:** If README exists and markers missing:
1. Insert `<!-- gap-status-start -->` / `<!-- gap-status-end -->` markers
2. Commit with message "docs: add CI gap-status markers"
3. Create PR with explanation

#### `bootstrap-clinical-audit-sweep.yml` (Initialize clinical audit)

**Purpose:** Auto-initialize audit logging in repos

**Action:** If audit-log disabled:
1. Create `.healthcare/audit.yml` configuration
2. Enable audit logging in settings
3. Configure retention (7 years)
4. Create PR with setup instructions

#### `bootstrap-gaps-sweep.yml` (Gap analysis initialization)

**Purpose:** Initialize gap analysis for new repos

**Action:** If `.gap-analysis/GAP_ANALYSIS.md` missing:
1. Create gap analysis template
2. Initialize with repo-specific metadata
3. Set up CI gap tracking
4. Add to gap dashboard

#### `build-status-sweep.yml` (CI status aggregation)

**Purpose:** Scheduled sweep of all CI results, update gap status

**Frequency:** Every 30 minutes

**Process:**
1. List all repos with CI (Rust, Julia, `.github`)
2. Query latest CI run per repo
3. Determine gap status per latest run:
   - In Progress → "Building"
   - Success → "Committed"
   - Failure → "In the Air"
4. Fan out to `reusable-build-status.yml` for each repo
5. Commit status change to repo

#### `clinical-audit-sweep.yml` (Audit logging verification)

**Purpose:** Verify audit logging enabled and functioning

**Frequency:** Daily

**Checks per repo:**
- Audit logging enabled
- Audit logs being generated (new entries in past 24h)
- Log retention ≥ 7 years
- Access controls on audit logs
- Replication/backup functioning

**Alert:** Issues created for failing repos

#### `stale-repo-sweeper.yml` (Cleanup of dormant repos)

**Purpose:** Identify and archive stale repositories

**Criteria for staleness:**
- No commits in 12 months
- No open issues or PRs
- No recent activity (comments, status checks)

**Action:**
1. Add "stale" label
2. Create issue asking if repo should be archived
3. If no response in 30 days, archive repo
4. Log archive action to audit trail

#### `vulnerability-triage.yml` (Automated vuln response)

**Purpose:** Triage security vulnerabilities from dependency scanning

**Workflow:**
1. Collect all vulnerability reports (Dependabot, Trivy, etc.)
2. Deduplicate and prioritize by severity
3. Create GitHub issue per unique vulnerability
4. Attempt auto-fix with Dependabot/Renovate
5. Assign to on-call security team
6. Track time-to-remediation metric

---

## Scheduled & Automation Workflows

### Scheduled Compliance Checks

#### `dependency-audit-inventory.yml` (Dependency tracking)

**Frequency:** Weekly  
**Purpose:** Build inventory of all dependencies across org

**Collects from:**
- `package.json` (Node.js)
- `poetry.lock` / `requirements.txt` (Python)
- `Cargo.lock` (Rust)
- `go.mod` (Go)
- `Project.toml` (Julia)
- `Dockerfile` base images
- Container registries

**Generates:**
- Dependency graph (all repos)
- Dependency version matrix (version ranges used)
- Outdated dependency report
- License inventory
- Vulnerability report

**Outputs:** JSON feed consumed by compliance dashboard

#### `dependency-eol.yml` (EOL tracking)

**Frequency:** Weekly  
**Purpose:** Track dependencies approaching end-of-life

**Checks:**
- Python 3.8/3.9/3.10 EOL dates vs. current deployments
- Node.js LTS schedule (18, 20, 22)
- Go language EOL (3 minor versions supported)
- Rust MSRV (Minimum Supported Rust Version)
- Third-party package deprecation

**Alert:** Creates issues for dependencies reaching EOL in next 6 months

#### `gap-analysis-validate.yml` (Validates gap analysis documents)

**Frequency:** Daily  
**Purpose:** Ensure all repos have valid gap analysis

**Validations:**
- `.gap-analysis/GAP_ANALYSIS.md` file exists
- YAML frontmatter valid (metadata, owner, compliance level)
- Gap items properly formatted
- All referenced requirements exist
- No duplicate gap IDs

**Alert:** Creates issues for validation failures

#### `gap-analysis-sync-index.yml` (Gap index synchronization)

**Frequency:** Every 6 hours  
**Purpose:** Maintain searchable gap index

**Actions:**
1. Collect all gap analysis files from all repos
2. Extract gap items and metadata
3. Build searchable index (Elasticsearch, similar)
4. Sync with gap dashboard
5. Generate statistics (total gaps, distribution by type, etc.)

### Infrastructure & Deployment

#### `deploy-tempo.yml` (Deployment to Tempo environment)

**Purpose:** Automated deployment to Tempo (staging) environment

**Triggers:** Tag push (v*), manual workflow_dispatch

**Steps:**
1. Extract version from tag
2. Pull release artifacts
3. Verify SLSA provenance
4. Verify cosign signatures
5. Run smoke tests in staging
6. Generate deployment report
7. Notify deployment channel

#### `ehr-sandbox-validation.yml` (EHR sandbox integration testing)

**Purpose:** Validate EHR integrations against sandbox environments

**Integrated EHRs:**
- Epic (sandbox)
- Cerner (sandbox)
- Athenahealth (sandbox)
- SMART Health Links (reference implementation)

**Tests:**
- OAuth 2.0 / OIDC flows
- FHIR API conformance (R4, R5)
- CDS Hooks integration
- HL7 v2 message routing

**Report:** Conformance report with issues/warnings

#### `post-market-tracker.yml` (Post-market surveillance tracking)

**Purpose:** Track post-market medical device surveillance activities

**Tracked:**
- Adverse events and complaints
- Software updates/patches
- Field actions and recalls
- Trend analysis

**Compliance:** FDA postmarket surveillance requirements (21 CFR 806, 807)

### Code Review & Automation

#### `copilot-task-guardrails.yml` (Copilot task safety checks)

**Purpose:** Ensure Copilot tasks meet org standards before execution

**Checks:**
1. Task description complete and clear
2. Scope limited (won't modify multiple repos)
3. No destructive operations (delete, force-push)
4. Security-sensitive tasks flagged for manual review
5. Estimated time to completion < threshold
6. Required approvals obtained

**Approval flow:**
- Low-risk tasks: Auto-approved
- Medium-risk tasks: Lead engineer approval
- High-risk tasks: Security review + lead approval

#### `origin-label.yml` (Automated issue/PR origin labeling)

**Purpose:** Auto-label issues and PRs by origin (human, Copilot, Dependabot, etc.)

**Labels applied:**
- `origin:human` (manually created)
- `origin:copilot` (Copilot-generated)
- `origin:dependabot` (Dependabot)
- `origin:automation` (scheduled workflow)
- `origin:external` (external contributor)

**Usage:** Helps track origin of work, identify trends

#### `review-stamp.yml` + `review-stamp-v2.yml` (Code review attestation)

**Purpose:** Add review status stamps to PR descriptions

**Stamps added:**
```
✅ Code Review: APPROVED by @reviewer
✅ Security Review: APPROVED by @security-lead
⏳ Compliance Review: PENDING (assigned to @compliance-officer)
```

**Logic:**
- Stamps added automatically when reviews received
- Links to review comments
- Updates as review status changes
- Final summary when all reviews complete

**Integration:** Helps CI gates verify required reviews completed

### Content & Documentation

#### `ci-content.yml` (Content CI pipeline)

**Purpose:** Validate documentation and content

**Checks:**
- Markdown formatting (markdownlint)
- Spell check (aspell, cspell)
- Link validation (broken links)
- YAML frontmatter validation
- Image asset references valid

**Outputs:**
- Content validation report
- Suggested fixes

#### `readme-refresh.yml` (Auto-update README sections)

**Purpose:** Keep README.md in sync with generated content

**Updates:**
- Table of contents (auto-generated)
- Gap status table (from gap analysis)
- API documentation (from code)
- Changelog section (from release history)
- Contributors section (from GitHub)

**Process:**
1. Identify auto-generate sections (between markers)
2. Regenerate section content
3. Commit if changed
4. Create PR if changes significant

#### `seed-roadmap-issues.yml` (Seed roadmap items as GitHub issues)

**Purpose:** Auto-create GitHub issues from roadmap documents

**Source:** `ENTERPRISE_ROADMAP.md`, `YEAR_2_ROADMAP.md`

**Process:**
1. Parse roadmap markdown
2. Extract issues/tasks
3. Create GitHub issues with:
   - Description from roadmap
   - Label based on roadmap category
   - Milestone based on timeline
   - Linked to parent epic issue
4. Update roadmap with issue links

---

## Reusable Workflow Patterns

The org provides **60+ reusable workflows** (prefix `reusable-*`) for consumption by individual repositories via:

```yaml
jobs:
  test:
    uses: ruralpeds/.github/.github/workflows/reusable-ci-python.yml@main
    with:
      python-version: '3.11'
    secrets: inherit
```

### Categories of Reusable Workflows

| Category | Workflows | Examples |
|----------|-----------|----------|
| Language CI | 9 | `reusable-ci-python.yml`, `reusable-ci-rust.yml`, etc. |
| Compliance | 20+ | `reusable-phi-scan.yml`, `reusable-sbom.yml`, `reusable-slsa.yml` |
| Testing | 8 | `reusable-contract.yml`, `reusable-chaos-test.yml`, `reusable-mutation.yml` |
| Deployment | 5 | `reusable-release.yml`, `reusable-slsa-provenance.yml` |
| Quality Gates | 10+ | `reusable-security.yml`, `reusable-license-scan.yml`, `reusable-gap-analysis.yml` |
| Documentation | 3 | `reusable-docs.yml`, `reusable-readme-gap-status.yml` |
| Utilities | 15+ | `reusable-build-status.yml`, `reusable-container-scan.yml`, etc. |

### Example Reusable Workflows

#### `reusable-ci-python.yml`

**Inputs:**
- `python-version` (default: '3.11')
- `test-dir` (default: 'tests')
- `min-coverage` (default: 80)

**Features:**
- Matrix across Python 3.9, 3.10, 3.11
- Ruff, MyPy, Bandit
- pytest with coverage
- Coverage badge artifact

#### `reusable-contract.yml` (Contract testing)

**Purpose:** Consumer-driven contract testing

**Inputs:**
- `provider-repo` (e.g., `ruralpeds/api-backend`)
- `contract-dir` (e.g., `contracts/`)
- `pact-broker-url`

**Process:**
1. Provider publishes contracts (Pact format)
2. Consumer runs contract tests against published contracts
3. Verifies compatibility before integration
4. Reports to Pact broker

#### `reusable-mutation-test.yml` (Mutation testing)

**Purpose:** Validate test quality via mutation testing

**How it works:**
1. Generate code mutations (small syntactic changes)
2. Run test suite against each mutation
3. If tests still pass despite mutation, it's a "survived mutant" (bad test quality)
4. Report mutation score (% of mutants killed)

**Minimum threshold:** 80% mutation score

---

## Gap Analysis & Status Tracking

### Gap Lifecycle

The system tracks **gaps** (work items, requirements, features) through a lifecycle:

```
Backlog → Planned → In Progress → Ready for Review → Committed → Released
```

**Status transitions triggered by:**

| Trigger | Status | Meaning |
|---------|--------|---------|
| New PR/branch | **In the Air** | Work started, awaiting CI |
| CI queued/running | **Building** | CI actively running |
| CI success | **Committed** | Ready to merge (gates passed) |
| CI failure | **In the Air** | Reverted to in-progress (needs work) |
| Merged & released | **Released** | In production |

### Gap Analysis Files

Each repo maintains `.gap-analysis/GAP_ANALYSIS.md`:

```yaml
---
# Metadata
org: ruralpeds
repo: app
owner: platform-team
maturity: stable  # prototype, mvp, stable, deprecated
compliance-level: hipaa-required  # none, basic, soc2, hipaa-required, fda-510k, fda-ide
last-updated: 2026-05-02
---

# Gap Items
## Gap #1: Implement 2FA
- Requirement: AuthN-REQ-001
- Status: Committed
- CI: Passed (v2.3.0)
- Owner: @security-eng
- Target: Q2 2026

## Gap #2: FHIR R5 Upgrade
- Status: In Progress
- Branch: feature/fhir-r5-upgrade
- CI: Building (PR #234)
- Blocker: None
```

### Gap Status Dashboard

The `audit-dashboard-sweep.yml` generates a live dashboard with:
- Gap status distribution (pie chart)
- Status timeline (Gantt chart)
- Blocked gaps and blockers
- Owner workload distribution
- Velocity trends

---

## Integration Points

### GitHub Checks & Status Reporting

All workflows report status via GitHub Checks API:

```
Pull Request
├─ Status Checks
│  ├─ build/01-code-review ✅
│  ├─ test/01-unit-tests ✅
│  ├─ security/sast ⚠️ (1 warning)
│  ├─ compliance/phi-scan ✅
│  └─ deploy/staging-readiness 🔄 (pending)
└─ Reviews
   ├─ @code-reviewer APPROVED ✅
   ├─ @security-team COMMENTED
   └─ @compliance-officer PENDING
```

### SARIF Reporting

Security scanning workflows upload SARIF v2.1.0 reports to GitHub code scanning:
- Semgrep (SAST)
- Bandit (Python security)
- Trivy (container vulnerabilities)
- Gitleaks (secrets)
- License scanner (license violations)

Visible in: **Security** → **Code scanning** → **Alerts**

### Artifact Management

Workflows produce artifacts stored in GitHub Actions:

| Artifact | Retention | Access |
|----------|-----------|--------|
| Coverage reports | 30 days | Public (displayed in PR) |
| Test failures (traces, screenshots) | 7 days | Team only |
| Build artifacts | 90 days | Team only |
| SBOM (CycloneDX/SPDX) | ∞ (committed) | Public (in `sbom/` dir) |
| SLSA attestations | ∞ (in Rekor) | Public (in Rekor transparency log) |
| Signed artifacts | ∞ (in artifact store) | Team + audit trail |

### Rekor Transparency Log Integration

Immutable entries for:
- Release artifacts (SLSA provenance)
- Signed documents (envelope signatures)
- Audit events (policy violations, deployments)

Public verification possible via Rekor CLI:
```bash
rekor-cli search --artifact artifact.tar.gz
```

### Slack Integration (Optional)

Workflows can post to Slack channels:

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Release v2.3.0 deployed to production",
        "blocks": [...]
      }
```

---

## Workflow Invocation Patterns

### Pattern 1: Direct PR Trigger

```yaml
on:
  pull_request:
    branches: [main, develop]
    paths: ['src/**', '.github/workflows/01-*.yml']
```

→ Workflow runs automatically when PR opened or updated

### Pattern 2: Reusable Workflow Call

```yaml
jobs:
  test:
    uses: ruralpeds/.github/.github/workflows/reusable-ci-python.yml@main
    with:
      python-version: '3.11'
```

→ Called workflow inherits PR context, can report status

### Pattern 3: Scheduled Sweep

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
```

→ Runs on fixed schedule, fans out to multiple repos

### Pattern 4: Manual Dispatch

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment'
        type: choice
        options: [staging, production]
```

→ Operator can trigger with custom inputs

### Pattern 5: Event-Driven

```yaml
on:
  workflow_run:
    workflows: ['Build & Test']
    types: [completed]
```

→ Triggered when another workflow completes

---

## Key Performance Indicators (KPIs)

The system tracks metrics for compliance and process improvement:

| KPI | Target | Source |
|-----|--------|--------|
| **Build Pass Rate** | ≥95% | CI run success/failure |
| **Mean Time to Resolution (MTTR)** | <4 hours | Issue creation → closure |
| **Code Coverage** | ≥80% | Coverage reports |
| **Security Vulnerabilities Fixed (%) | 100% critical, 90% high | Dependency audit results |
| **Release Frequency** | 1-2 weeks | Release history |
| **Deployment Success Rate** | ≥99% | Release & deploy workflow |
| **Audit Log Completeness** | 100% | Audit log verification |
| **Compliance Check Pass Rate** | 100% | Compliance workflow results |

---

## Configuration Files

Key configuration files in this repository:

| File | Purpose |
|------|---------|
| `.yamllint.yml` | YAML linting rules for all workflows |
| `.github/dependabot.yml` | Dependabot configuration (auto-updates) |
| `.github/actionlint.yaml` | GitHub Actions linting rules |
| `config/semgrep-medical.yml` | Custom SAST rules for healthcare domain |
| `config/phi-patterns.yml` | PHI detection patterns for HIPAA |
| `policies/clinical-audit-schema.yaml` | Audit log schema definition |
| `policies/logging-redaction.yaml` | Data redaction rules for PII |
| `copilot-instructions.md` | Copilot agent instructions |
| `copilot-tasks/` | Copilot task templates |

---

## Best Practices for Workflow Development

### 1. Compliance Mapping

Every workflow should reference regulatory requirements:
```yaml
# GitHub Actions: [Description]
# Compliance: [Standard §Section] ([Requirement name])
# Purpose: [What this achieves]
```

### 2. Immutable Containers

All workflows use pinned action versions (commit SHA), not tags:
```yaml
uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4
```

### 3. Principle of Least Privilege

Minimize permissions for each job:
```yaml
jobs:
  analyze:
    permissions:
      contents: read
      security-events: write
      # NOT full `write-all`
```

### 4. Idempotency

Workflows must be safe to re-run:
- No duplicate artifact uploads
- Status updates are idempotent
- No accidental duplicate deployments

### 5. Audit Trail

Every significant action is logged:
- Deployment → audit log entry
- Configuration change → git commit + audit log
- Security decision → immutable envelope signature

---

## Roadmap & Future Enhancements

**Q2 2026:**
- [ ] Migrate to OpenSSF Scorecard for supply chain maturity
- [ ] Add AI-powered code review integration (Claude)
- [ ] Implement Software Delivery Performance (DORA) metrics dashboard

**Q3 2026:**
- [ ] FDA 510(k) pre-submission workflow automation
- [ ] Expand FHIR validation to R5 and Subscriptions-Backport
- [ ] Add ML-powered anomaly detection for security monitoring

**Q4 2026:**
- [ ] SOC 2 Type II continuous compliance dashboard
- [ ] Post-market surveillance analytics pipeline
- [ ] Regulatory change alert system (FDA, HHS announcements)

---

## Document Metadata

| Attribute | Value |
|-----------|-------|
| Created | 2026-05-02 |
| Last Updated | 2026-05-02 |
| Owner | `ruralpeds/platform-team` |
| Status | Active |
| Compliance | IEC 62304, HIPAA, FDA 524B, 21 CFR Part 11 |
| Access Level | Organization (public) |

---

**For questions or contributions, see [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md).**
