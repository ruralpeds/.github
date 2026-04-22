# .github — Org-Level Automation

Reusable CI workflows, comprehensive testing, Playwright E2E, audit logging, and auto-bootstrap for all timothyhartzog repos.

## Workflows

| Workflow | Purpose | Call with |
|----------|---------|-----------|
| ci-node.yml | Node.js CI: lint, typecheck, test, build, security audit | `uses: timothyhartzog/.github/.github/workflows/ci-node.yml@main` |
| ci-python.yml | Python CI: ruff, mypy, bandit, pytest with coverage | `uses: timothyhartzog/.github/.github/workflows/ci-python.yml@main` |
| ci-rust.yml | Rust CI: fmt, clippy, cargo test/audit, tarpaulin coverage | `uses: timothyhartzog/.github/.github/workflows/ci-rust.yml@main` |
| ci-go.yml | Go CI: golangci-lint, vet, gosec, race-enabled tests | `uses: timothyhartzog/.github/.github/workflows/ci-go.yml@main` |
| ci-julia.yml | Julia CI: JuliaFormatter, Pkg.test with coverage | `uses: timothyhartzog/.github/.github/workflows/ci-julia.yml@main` |
| e2e-playwright.yml | Playwright E2E: multi-browser, sharding, traces, screenshots | `uses: timothyhartzog/.github/.github/workflows/e2e-playwright.yml@main` |
| audit-log.yml | Build audit ledger: dates, refs, deps, full provenance | `uses: timothyhartzog/.github/.github/workflows/audit-log.yml@main` |
| review-stamp.yml | Record a manual code review in the audit ledger | `uses: timothyhartzog/.github/.github/workflows/review-stamp.yml@main` |
| check-compliance.yml | Scan all org repos for missing CI/audit features | runs on schedule (Mon 7 AM UTC) |
| playwright-audit.yml | Playwright visual audit of org CI status | runs on schedule (Mon 8 AM UTC) |
| repo-scanner.yml | Auto-bootstrap CI workflows into all org repos | runs on schedule (Mon 6 AM UTC) |
| reusable-phi-scan.yml | **HIPAA §164.312(b)** — PHI scrubbing scan via gitleaks with healthcare pattern catalog; uploads SARIF to code scanning | `uses: timothyhartzog/.github/.github/workflows/reusable-phi-scan.yml@main` |
| reusable-sbom.yml | **FDA 524B / EO 14028** — CycloneDX + SPDX SBOM generation; license denylist enforcement; commits to `sbom/` | `uses: timothyhartzog/.github/.github/workflows/reusable-sbom.yml@main` |
| sync-rulesets.yml | **Governance-as-code** — applies JSON ruleset files in `policies/rulesets/` to every org repo via GitHub API | runs on schedule (Mon 5 AM UTC) |
| reusable-slsa.yml | **FDA 524B / NIST SSDF PS.3.2** — SLSA Level 3 build provenance via slsa-github-generator; produces `.intoto.jsonl` signed via Sigstore | `uses: timothyhartzog/.github/.github/workflows/reusable-slsa.yml@main` |
| reusable-sign-artifact.yml | **21 CFR Part 11 §11.70 / HIPAA §164.312(c)(1)** — cosign keyless artifact signing (OIDC → Fulcio → Rekor); no keys to rotate | `uses: timothyhartzog/.github/.github/workflows/reusable-sign-artifact.yml@main` |
| reusable-attest.yml | **CISA SSDF Attestation Common Form** — GitHub-native build attestations via `actions/attest-build-provenance`; lighter-weight SLSA alternative | `uses: timothyhartzog/.github/.github/workflows/reusable-attest.yml@main` |
| review-stamp-v2.yml | **21 CFR Part 11 §11.50, §11.70, §11.200** — electronic signatures with controlled-vocabulary meaning, tree-hash binding, signed git tag, JSONL ledger | `uses: timothyhartzog/.github/.github/workflows/review-stamp-v2.yml@main` |
| reusable-rtm.yml | **GAMP 5 §4.2 / IEC 62304 §5.2** — Requirements Traceability Matrix — scans PRs/commits/tests/issues for requirement IDs; produces `traceability/rtm.json` and `rtm.md` with gap report | `uses: timothyhartzog/.github/.github/workflows/reusable-rtm.yml@main` |
| reusable-container-scan.yml | **NIST SSDF RV.1.1 / FDA Cyber** — Dual-scanner (Trivy + Grype) for Docker images, OCI artifacts, and binaries; SARIF to code scanning | `uses: timothyhartzog/.github/.github/workflows/reusable-container-scan.yml@main` |
| reusable-license-scan.yml | **ISO 13485 §7.2.1 / IP risk** — Deep license analysis beyond SBOM baseline; runtime-vs-dev classification with graduated policy | `uses: timothyhartzog/.github/.github/workflows/reusable-license-scan.yml@main` |
| reusable-risk-file.yml | **ISO 14971:2019 / IEC 62304 §7** — Aggregates hazard-labeled issues into `risk/hazard-analysis.md` + `risk-summary.json`; compliance-flag enforcement; scaffolds RMP and residual-risk acceptance files | `uses: timothyhartzog/.github/.github/workflows/reusable-risk-file.yml@main` |
| dependency-eol.yml | **NIST SSDF RV.1.2 / FDA Cyber** — Monthly EOL check via endoflife.date; opens/updates tracking issue when runtime platform cycles approach EOL | runs monthly (1st 10 AM UTC) |
| vuln-triage.yml | **NIST SSDF RV.2** — Daily Dependabot-alert query with severity-based SLAs (Critical 7d / High 30d / Medium 90d / Low 180d); opens tracking issue on SLA breach | runs daily at 11 AM UTC |
| origin-label.yml | **FDA GMLP / EU AI Act / NIST AI RMF** — Required status check; verifies each PR carries exactly one `origin:*` label; validates AI session summary for `ai-authored` and `agentic` PRs; enforces PHI/credential negatives | required status check on clinical repos |
| reusable-mutation.yml | **FDA CSA / IEC 62304 §5.5.3** — Multi-language mutation testing (Rust/cargo-mutants, Python/mutmut, Node/Stryker); scores test adequacy beyond line coverage | `uses: timothyhartzog/.github/.github/workflows/reusable-mutation.yml@main` |
| reusable-contract.yml | **42 CFR Part 170 / HL7 FHIR US Core** — Validates FHIR resources against US Core IG; validates OpenAPI specs via Redocly CLI | `uses: timothyhartzog/.github/.github/workflows/reusable-contract.yml@main` |
| reusable-validation-export.yml | **GAMP 5 §4.2 / IEC 62304 §5.8 / 21 CFR 820.30(j)** — Packages SBOM + risk + RTM + docs into validation bundle; dispatches to `Github-workflow` archive via repository_dispatch | `uses: timothyhartzog/.github/.github/workflows/reusable-validation-export.yml@main` |
| reusable-release.yml | **IEC 62304 §5.8 / release governance** — One-button conventional-commits release: release-please PR → build → SBOM → SLSA → cosign → validation export → audit | `uses: timothyhartzog/.github/.github/workflows/reusable-release.yml@main` |

## Medical-Software Compliance Features

These workflows and policies are **specific to the HIPAA / GAMP 5 / FDA CSA / 21 CFR Part 11** regulatory environment. They are not required for non-clinical repos but are **mandatory** for any repo that may handle PHI or is part of a clinical decision-support path.

### PHI Scrubbing (`reusable-phi-scan.yml`)

Scans commits, pull requests, and (on schedule) full repository history for Protected Health Information patterns covered by HIPAA's 18 Safe Harbor identifiers (§164.514(b)(2)(i)):

- SSN, MRN, DOB, names, phone, address, insurance IDs, NPIs, device serials
- PHI in log statements (common accidental leak)
- Clinical codes (ICD-10 / SNOMED) paired with patient identifiers
- Custom false-positive allowlist via `.gitleaksignore` (justification required)

Configuration: `.github/phi-patterns.toml` at the org level. Override per-repo by providing a `config-path` input.

### SBOM Generation (`reusable-sbom.yml`)

Generates FDA 524B-compliant Software Bill of Materials per release:

- CycloneDX 1.5 JSON (primary, FDA-preferred)
- SPDX 2.3 JSON (optional)
- NTIA Minimum Elements covered
- License denylist (GPL-3.0, AGPL-3.0, SSPL, BUSL by default — configurable)
- Attached to GitHub Release, committed to `sbom/`, retained 90 days as workflow artifact
- Generation context JSON provides audit trail

### Governance as Code (`sync-rulesets.yml`)

Applies repository rulesets (signed commits, linear history, required reviewers, required status checks) to every org repo via the GitHub API. Ruleset definitions live under version control in `policies/rulesets/*.json` so governance changes are themselves auditable.

The baseline ruleset `signed-commits-main.json` enforces:
- Required signed commits (cryptographic non-repudiation for 21 CFR Part 11 §11.70)
- Linear history (no force pushes, no deletions)
- 1+ required reviewer on PR; stale reviews dismissed on push
- PHI scrubbing scan required as a merge gate
- Code scanning must pass (blocks high+ findings from phi-scan category)

### Supply-Chain Attestation Trio (P1)

For every release of a clinical repo, four artifacts travel together to form a complete supply-chain evidence package:

- **SBOM** (`reusable-sbom.yml`) — what's in it
- **SLSA provenance** (`reusable-slsa.yml`) — how it was built
- **Signatures** (`reusable-sign-artifact.yml`) — this is the real binary
- **E-signature** (`review-stamp-v2.yml`) — who approved it with what meaning

See `docs/SUPPLY_CHAIN_AND_ESIGNATURE.md` for the full workflow, caller example, verification instructions for hospital partners, and regulatory mapping.

### 21 CFR Part 11 Electronic Signatures (P1)

`review-stamp-v2.yml` upgrades the v1 review-stamp workflow with full 21 CFR Part 11 compliance:

- **Controlled-vocabulary `meaning`** — 10 defined values (verified, approved, risk-accepted, capa-closed, etc.) per §11.50(a)(3)
- **Tree-hash binding** — signature cryptographically linked to file state per §11.70
- **Signed Git tag** — first-class tamper-evident record of each signing event
- **Printed name** — reviewer's real name retrieved from GitHub API per §11.50(a)(1)
- **MFA enforcement** — delegated to GitHub org 2FA policy per §11.200
- **JSONL ledger** — `audit-log/esignatures.jsonl` separate from build ledger, streaming-friendly

### Migrating from PAT to GitHub App

The `sync-rulesets.yml` workflow prefers a `timothyhartzog-bot` GitHub App token (short-lived) over `REPO_SETUP_TOKEN` (long-lived PAT). To migrate:

1. Create a GitHub App named `timothyhartzog-bot` with permissions:
   - Contents: Read & Write
   - Pull Requests: Read & Write
   - Workflows: Write
   - Issues: Read & Write
   - Metadata: Read
2. Generate a private key; store in org secrets as `TH_BOT_PRIVATE_KEY`.
3. Store the App ID in org variables as `TH_BOT_APP_ID`.
4. Install on all repos in the org.
5. Revoke the long-lived PAT after the first successful App-token run.
6. Log the rotation in `audit-log/governance-ledger.jsonl`.

## Enterprise Audit Logging

### Mandatory for All Enterprise Projects

Every enterprise project must implement comprehensive audit logging:

- ✅ **Build Dates**: Every build creates an audit entry with timestamps
- ✅ **Modified Dates**: Track creation, last modification, and last review dates
- ✅ **Review Dates**: Record all code reviews with reviewer name and notes
- ✅ **Reference Materials**: Full dependency snapshots, commit history, and GitHub links

### Getting Started

1. **Quick Setup** (5 minutes): [AUDIT_LOG_SETUP_TEMPLATE.md](docs/AUDIT_LOG_SETUP_TEMPLATE.md)
2. **Complete Guide**: [ENTERPRISE_AUDIT_LOGGING.md](docs/ENTERPRISE_AUDIT_LOGGING.md)
3. **Standards & References**: [AUDIT_LOG_REFERENCES.md](docs/AUDIT_LOG_REFERENCES.md)

### Audit Log Features

| Feature | Description |
|---------|-------------|
| **Automatic Tracking** | Builds automatically logged in `audit-log/ledger.json` |
| **Dependency Snapshots** | Lock files captured: npm, pip, cargo, go.sum, Julia Manifest |
| **Review Stamps** | Manual review workflow records reviewer, date, and notes |
| **Full Provenance** | Git commit SHA, author, message, branch, and tag |
| **GitHub References** | Direct links to commits, runs, tree state, comparisons |
| **Retention Policies** | Configurable retention (default 500 builds) |
| **Searchable** | JSON format enables querying with jq or custom scripts |

### Compliance Verification

Check if your organization's repos are compliant:

```bash
# Verify all repos in your organization
./scripts/verify-audit-logging.sh timothyhartzog compliance-report
```

## Features

### Error Handling
- All workflows detect project configuration before running (no blind failures)
- Timeout guards on all test jobs
- Failed test artifacts (results, traces, screenshots) auto-uploaded
- Security scans fail only on HIGH severity (warnings for lower)
- Retry logic on network-dependent operations

### Testing
- Matrix testing across multiple language versions
- Coverage reports generated and uploaded as artifacts
- JUnit/XML test result output for CI integration
- Race condition detection (Go), doc tests (Rust), integration tests

### Playwright E2E
- Multi-browser support (Chromium, Firefox, WebKit)
- Parallel sharding for large test suites
- Automatic dev server startup and health checking
- Traces, screenshots, and videos captured on failure
- Configurable retries for flaky tests
- HTML report generation and merging across shards

### Playwright Audit (`playwright-audit.yml`)
- Runs weekly — navigates GitHub Actions pages for every org repo
- Captures screenshots of each repo's CI/Actions status
- Reads the compliance JSON report and generates `audit-summary.html`
- Uploads all screenshots + reports as workflow artifacts
- Local run: `AUDIT_ORG=timothyhartzog COMPLIANCE_JSON=compliance-report/compliance.json npm run audit`

### Audit Logging (`audit-log.yml`)
- Every build tracked in `audit-log/ledger.json` per repo
- Records: **date_created**, **date_modified**, **date_last_reviewed**, commit SHA, author, branch, tag
- Full references: commit URL, run URL, tree URL, compare URL
- Dependency snapshots included (package-lock.json, Cargo.lock, requirements.txt, etc.)
- Contributor tracking
- Retention-limited (default 500 entries) to prevent unbounded growth
- Individual entry files for easy access
- **Enterprise Standard**: All enterprise projects MUST use this system
- **Documentation**: See [ENTERPRISE_AUDIT_LOGGING.md](docs/ENTERPRISE_AUDIT_LOGGING.md)

### Review Stamps (`review-stamp.yml`)
- Records a named reviewer + optional notes in `audit-log/ledger.json`
- Updates `date_last_reviewed` on both the ledger summary and the latest build entry
- Full `review_history` array in the ledger for traceability
- Trigger via: `gh workflow run "Review Stamp" -f reviewer="your-name" -f notes="LGTM"`

### Compliance Checker (`check-compliance.yml` + `scripts/check_compliance.py`)
- Scans all org repos weekly and on demand
- Checks each repo for: CI workflow, audit-log workflow, Playwright config, review stamp
- Outputs JSON + HTML compliance reports as workflow artifacts
- Creates a GitHub issue listing non-compliant repos (if any)
- Local run: `python3 scripts/check_compliance.py timothyhartzog --output compliance-report`

### Auto-Bootstrap
`repo-scanner.yml` runs weekly — scans all org repos, creates PRs with CI/testing/audit workflows.

Trigger manually: `gh workflow run "Scan & Bootstrap All Repos" --repo timothyhartzog/.github`

Requires `REPO_SETUP_TOKEN` secret (fine-grained PAT with Contents + PRs + Workflows permissions).

## Weekly Schedule

| Time (UTC Mon) | Workflow | Purpose |
|---|---|---|
| 06:00 | repo-scanner.yml | Bootstrap missing CI workflows via PRs |
| 07:00 | check-compliance.yml | Scan all repos, create issue if non-compliant |
| 08:00 | playwright-audit.yml | Visual audit of org Actions status |

## Example Usage

### Node.js project with Playwright
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  ci:
    uses: timothyhartzog/.github/.github/workflows/ci-node.yml@main
    with:
      package-manager: "pnpm"
      node-versions: '["18", "20"]'
  e2e:
    uses: timothyhartzog/.github/.github/workflows/e2e-playwright.yml@main
    with:
      package-manager: "pnpm"
      start-command: "pnpm dev"
      browsers: '["chromium", "firefox", "webkit"]'
      shards: 3
  audit:
    uses: timothyhartzog/.github/.github/workflows/audit-log.yml@main
    permissions:
      contents: write
```

### Python project
```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    uses: timothyhartzog/.github/.github/workflows/ci-python.yml@main
    with:
      python-versions: '["3.11", "3.12"]'
  audit:
    uses: timothyhartzog/.github/.github/workflows/audit-log.yml@main
    permissions:
      contents: write
```

### Stamp a code review
```yaml
# .github/workflows/review.yml
name: Review Stamp

on:
  workflow_dispatch:
    inputs:
      reviewer:
        description: 'Name of the reviewer'
        required: true
        type: string
      notes:
        description: 'Review notes'
        required: false
        type: string

jobs:
  review:
    uses: timothyhartzog/.github/.github/workflows/review-stamp.yml@main
    with:
      reviewer: ${{ inputs.reviewer }}
      notes: ${{ inputs.notes }}
    permissions:
      contents: write
```

Then trigger via GitHub CLI:

```bash
gh workflow run "Review Stamp" \
  -f reviewer="alice.qa" \
  -f notes="LGTM: All tests pass, security checks OK, approved for production"
```

### Enterprise project with full audit logging

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

permissions:
  contents: read

jobs:
  # Your CI jobs here
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: make test

  # Add audit logging
  audit:
    if: always()
    needs: ci
    uses: timothyhartzog/.github/.github/workflows/audit-log.yml@main
    with:
      include-deps: true
      retention-entries: 500
    permissions:
      contents: write
```

After setup, view your audit log:

```bash
# See audit summary
cat audit-log/ledger.json | jq '.summary'

# List all builds
cat audit-log/ledger.json | jq -r '.builds[] | "\(.timestamp) \(.commit.short_sha) \(.commit.author)"'

# View review history
cat audit-log/ledger.json | jq '.review_history'

# Check last review date
cat audit-log/ledger.json | jq '.summary.date_last_reviewed'
```

