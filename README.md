# ruralpeds/.github — Org-Level CI & Compliance Automation

Reusable GitHub Actions workflows, regulatory compliance tooling, audit logging, and governance-as-code for the `ruralpeds` organization. Built for clinical and scientific software operating under HIPAA, GAMP 5, FDA 524B, 21 CFR Part 11, IEC 62304, and ISO 14971.

> **Agent reference:** Read [`AGENTS.md`](AGENTS.md) before making any change to this repository. It is the authoritative cross-agent contract.

---

## Table of Contents

1. [Language CI Workflows](#language-ci-workflows)
2. [Compliance & Regulatory Workflows](#compliance--regulatory-workflows)
3. [Audit & Electronic Signatures](#audit--electronic-signatures)
4. [Org Governance](#org-governance)
5. [Scheduled Workflows](#scheduled-workflows)
6. [Org Custom Repository Properties](#org-custom-repository-properties)
7. [GitHub App Setup](#github-app-setup)
8. [Example Caller Configs](#example-caller-configs)

---

## Language CI Workflows

All reusable workflows are called with `uses: ruralpeds/.github/.github/workflows/<name>.yml@main`.

| Workflow | Purpose |
|----------|---------|
| `ci-node.yml` | Node.js: lint, typecheck, test, build, security audit |
| `ci-python.yml` | Python: ruff, mypy, bandit, pytest with coverage |
| `ci-rust.yml` | Rust: rustfmt, clippy, cargo test/audit, tarpaulin coverage |
| `ci-go.yml` | Go: golangci-lint, vet, gosec, race-enabled tests |
| `ci-julia.yml` | Julia: JuliaFormatter, Aqua, JET, Pkg.test with coverage |
| `ci-julia-react.yml` | Julia + React + Playwright: full-stack CI |
| `e2e-playwright.yml` | Playwright E2E: multi-browser, sharding, traces, screenshots |
| `container.yml` | Docker: Hadolint lint, multi-platform build, Trivy scan, GHCR push, SLSA attestation |
| `release.yml` | Conventional-commits release: semver bump, changelog, GitHub release |

**Key features across CI workflows:**
- Matrix testing across multiple language versions
- Coverage reports uploaded as artifacts
- Timeout guards and retry logic on network operations
- Failed-test artifacts (traces, screenshots, JUnit XML) auto-uploaded

---

## Compliance & Regulatory Workflows

| Workflow | Regulatory mapping | Purpose |
|----------|--------------------|---------|
| `reusable-phi-scan.yml` | HIPAA §164.312(b) | Gitleaks scan for HIPAA 18 Safe Harbor identifiers; SARIF to code scanning |
| `reusable-sbom.yml` | FDA 524B / EO 14028 | CycloneDX 1.5 + SPDX 2.3 SBOM; license denylist; committed to `sbom/` |
| `reusable-slsa.yml` | FDA 524B / NIST SSDF PS.3.2 | SLSA Level 3 build provenance via slsa-github-generator + Sigstore |
| `reusable-slsa-provenance.yml` | NIST SSDF PS.3.2 | Lightweight SLSA provenance for non-release builds |
| `reusable-sign-artifact.yml` | 21 CFR Part 11 §11.70 / HIPAA §164.312(c)(1) | cosign keyless signing (OIDC → Fulcio → Rekor) |
| `reusable-attest.yml` | CISA SSDF Attestation | GitHub-native build attestations via `actions/attest-build-provenance` |
| `reusable-container-sign.yml` | 21 CFR Part 11 §11.70 | cosign container image signing |
| `reusable-container-scan.yml` | NIST SSDF RV.1.1 / FDA Cyber | Dual-scanner (Trivy + Grype) for Docker images and OCI artifacts; SARIF upload |
| `reusable-license-scan.yml` | ISO 13485 §7.2.1 | Runtime-vs-dev license classification; graduated policy enforcement |
| `reusable-mutation.yml` | FDA CSA / IEC 62304 §5.5.3 | Mutation testing (cargo-mutants / mutmut / Stryker); test adequacy scoring |
| `reusable-mutation-test.yml` | IEC 62304 §5.5.3 | Alternate mutation-test entry point |
| `reusable-contract.yml` | 42 CFR Part 170 / HL7 FHIR US Core | FHIR US Core IG validation; OpenAPI validation via Redocly |
| `reusable-fhir-validation.yml` | HL7 FHIR | HAPI validator for FHIR resource payloads |
| `reusable-rtm.yml` | GAMP 5 §4.2 / IEC 62304 §5.2 | Requirements Traceability Matrix — scans PRs/commits/tests for requirement IDs; produces `traceability/rtm.json` and gap report |
| `reusable-iec62304-traceability.yml` | IEC 62304 §5 | IEC 62304 lifecycle traceability checks |
| `reusable-risk-file.yml` | ISO 14971:2019 / IEC 62304 §7 | Aggregates hazard-labeled issues into `risk/hazard-analysis.md` + `risk-summary.json` |
| `reusable-vex.yml` | FDA Cyber / VEX | Vulnerability Exploitability eXchange document generation |
| `reusable-validation-export.yml` | GAMP 5 §4.2 / IEC 62304 §5.8 / 21 CFR 820.30(j) | Packages SBOM + risk + RTM + docs into a validation bundle |
| `reusable-release.yml` | IEC 62304 §5.8 | Full regulated release: release-please → SBOM → SLSA → cosign → validation export → audit |
| `reusable-secret-scan-report.yml` | HIPAA §164.312(b) | Secret scanning report with SARIF output |
| `reusable-security.yml` | NIST SSDF | Composite security scan: Semgrep SAST, TruffleHog secrets, Grype CVE |
| `reusable-synthea-fixtures.yml` | HIPAA / test data | Generates synthetic patient fixtures via Synthea |
| `reusable-chaos-test.yml` | IEC 62304 §5.7 | Chaos/fault-injection testing |
| `reusable-docs.yml` | IEC 62304 §5.2 | Documentation generation and validation |
| `reusable-repo-standards.yml` | NIST SSDF | Repo hygiene: README, CODEOWNERS, SECURITY.md, CI workflow checks |
| `origin-label.yml` | FDA GMLP / EU AI Act / NIST AI RMF | Required status check — verifies `origin:*` label; validates AI session summary for `ai-authored` and `agentic` PRs |
| `hipaa-compliance.yml` | HIPAA | Composite HIPAA compliance check |
| `required-compliance.yml` | IEC 62304 | Required compliance gate for regulated repos |
| `required-audit.yml` | 21 CFR Part 11 | Required audit-log check gate |
| `release-gate.yml` | IEC 62304 §5.8 | Release readiness gate |
| `fda-bundle.yml` | FDA 524B / 21 CFR 820 | Assembles FDA submission bundle |

### PHI Scrubbing detail

`reusable-phi-scan.yml` scans commits, PRs, and (on schedule) full history for the HIPAA 18 Safe Harbor identifiers (§164.514(b)(2)(i)):
- SSN, MRN, DOB, names, phone numbers, addresses, insurance IDs, NPIs, device serials
- PHI embedded in log statements
- Clinical codes (ICD-10/SNOMED) paired with patient identifiers
- False-positive allowlist via `.gitleaksignore` (justification required per entry)

Configuration: `.github/phi-patterns.toml` at the org level. Override per-repo via the `config-path` input.

### Supply-chain evidence package

Every regulated release produces four artifacts that travel together:

1. **SBOM** (`reusable-sbom.yml`) — CycloneDX 1.5 + SPDX 2.3, committed to `sbom/`
2. **SLSA provenance** (`reusable-slsa.yml`) — `.intoto.jsonl` signed via Sigstore
3. **Artifact signature** (`reusable-sign-artifact.yml`) — cosign keyless, logged to Rekor
4. **Electronic signature** (`review-stamp-v2.yml`) — 21 CFR Part 11 e-sig with controlled vocabulary

See [`docs/SUPPLY_CHAIN_AND_ESIGNATURE.md`](docs/SUPPLY_CHAIN_AND_ESIGNATURE.md) for verification instructions.

---

## Audit & Electronic Signatures

| Workflow | Purpose |
|----------|---------|
| `audit-log.yml` | Build audit ledger — timestamps, commit SHA, author, branch, dep snapshots; committed to `audit-log/` |
| `audit-verify.yml` | Verifies audit-log integrity (hash chain) |
| `audit-sign-envelope.yml` | Signs the audit-log envelope |
| `review-stamp.yml` | Records a named reviewer + notes in the build ledger (`audit-log/ledger.json`) |
| `review-stamp-v2.yml` | 21 CFR Part 11-compliant e-signature: controlled-vocabulary meaning, tree-hash binding, signed Git tag, JSONL ledger |

### `review-stamp-v2.yml` — 21 CFR Part 11 features

- **Controlled vocabulary** — 10 defined `meaning` values (verified, approved, risk-accepted, capa-closed, …) per §11.50(a)(3)
- **Tree-hash binding** — signature cryptographically linked to file tree state per §11.70
- **Signed Git tag** — first-class tamper-evident record per §11.70
- **Printed name** — retrieved from GitHub API per §11.50(a)(1)
- **MFA enforcement** — delegated to GitHub org 2FA policy per §11.200
- **JSONL ledger** — `audit-log/esignatures.jsonl`, separate from build ledger, streaming-friendly

Trigger a review stamp:
```bash
gh workflow run "Review Stamp" \
  -f reviewer="alice.qa" \
  -f notes="Verified: all tests pass, PHI scan clean, approved for release"
```

---

## Org Governance

| Workflow | Schedule / Trigger | Purpose |
|----------|--------------------|---------|
| `sync-rulesets.yml` | Mon 05:00 UTC | Applies `policies/rulesets/*.json` to every org repo via GitHub API |
| `custom-properties-audit.yml` | Mon 09:00 UTC | Audits repos missing required custom properties |
| `check-compliance.yml` | Mon 07:00 UTC | Scans all repos for CI/audit/compliance coverage; creates issue on gaps |
| `repo-scanner.yml` | Mon 06:00 UTC | Auto-bootstraps missing CI workflows via PRs |
| `stale-repo-sweeper.yml` | scheduled | Flags or archives inactive repos |
| `playwright-audit.yml` | Mon 08:00 UTC | Visual audit of org Actions status — screenshots + `audit-summary.html` |
| `repo-audit.yml` | scheduled | Repo hygiene audit |
| `org-dashboard.yml` | scheduled | Org-wide compliance dashboard |
| `vuln-triage.yml` | daily 11:00 UTC | Dependabot-alert triage with SLAs (Critical 7d / High 30d / Medium 90d / Low 180d) |
| `dependency-eol.yml` | 1st of month 10:00 UTC | EOL check via endoflife.date; opens issue when platforms approach end-of-life |
| `post-market-tracker.yml` | scheduled | Post-market surveillance issue tracking |
| `gap-analysis-sync-index.yml` | push / schedule | Generates `.gap-analysis/status.json` and commits it |
| `gap-analysis-validate.yml` | push / PR | Validates gap-analysis entries |
| `reusable-gap-lifecycle.yml` | reusable | Gap lifecycle management |
| `bootstrap-gaps-sweep.yml` | manual | Bulk-seeds gap-analysis entries |
| `seed-roadmap-issues.yml` | manual | Seeds roadmap issues from `copilot-tasks/` |
| `copilot-task-guardrails.yml` | PR / push on `agent/*` | Extra compliance checks on agent-authored PRs |
| `sync-copilot-assets.yml` | push | Syncs Copilot asset files across repos |
| `origin-label.yml` | PR | Enforces `origin:*` label on every PR |
| `hygiene.yml` | push / PR | General repo hygiene checks |
| `readme-refresh.yml` | Mon 10:00 UTC / manual | Regenerates README via Copilot (GitHub Models); opens PR for human review |

### Governance-as-code (`sync-rulesets.yml`)

Ruleset definitions live under version control in `policies/rulesets/*.json`. The baseline ruleset `signed-commits-main.json` enforces:
- Required signed commits (cryptographic non-repudiation for 21 CFR Part 11 §11.70)
- Linear history (no force pushes, no deletions)
- 1+ required reviewer; stale reviews dismissed on push
- PHI scrubbing scan required as a merge gate
- Code scanning must pass (blocks high+ findings from phi-scan category)

---

## Scheduled Workflows

| UTC Time | Workflow | Purpose |
|----------|----------|---------|
| Mon 05:00 | `sync-rulesets.yml` | Apply governance rulesets |
| Mon 06:00 | `repo-scanner.yml` | Bootstrap missing CI via PRs |
| Mon 07:00 | `check-compliance.yml` | Compliance scan, open issue on gaps |
| Mon 08:00 | `playwright-audit.yml` | Visual Actions status audit |
| Mon 09:00 | `custom-properties-audit.yml` | Custom properties audit |
| Daily 11:00 | `vuln-triage.yml` | Vulnerability SLA triage |
| 1st of month 10:00 | `dependency-eol.yml` | Platform EOL check |
| Mon 10:00 | `readme-refresh.yml` | Auto-refresh README via Copilot; opens a PR for human review |

---

## Org Custom Repository Properties

Every repository carries six metadata properties that drive automated governance decisions — rulesets, audit depth, DHF scaffolding, and more:

| Property | Values | Approval |
|---|---|---|
| `data-classification` | `public` / `internal` / `synthetic` / `phi-capable` / `phi-active` | self-serve |
| `criticality` | `experimental` / `reference` / `clinical-support` / `clinical-decision` / `device` | self-serve |
| `iec62304-class` | `not-applicable` / `class-a` / `class-b` / `class-c` | clinical-lead |
| `regulated` | `true` / `false` | clinical-lead |
| `primary-stack` | `julia` / `rust` / `node` / `python` / `go` / `content` / `polyglot` | self-serve |
| `baa-required` | `true` / `false` | self-serve |

Set properties interactively:
```bash
export GH_TOKEN=$(gh auth token)
python scripts/set-properties.py ruralpeds/my-repo
```

See [`docs/governance/custom-properties.md`](docs/governance/custom-properties.md) for downstream effects and change approval requirements.

---

## GitHub App Setup

`sync-rulesets.yml` and org-scanning workflows use a `ruralpeds-bot` GitHub App token (short-lived) rather than a long-lived PAT. To configure:

1. Create a GitHub App named `ruralpeds-bot` with permissions:
   - Contents: Read & Write
   - Pull Requests: Read & Write
   - Workflows: Write
   - Issues: Read & Write
   - Metadata: Read
2. Generate a private key; store in org secrets as `TH_BOT_PRIVATE_KEY`.
3. Store the App ID in org variables as `TH_BOT_APP_ID`.
4. Install the app on all repos in the org.
5. Revoke the long-lived PAT after the first successful App-token run.
6. Log the rotation in `audit-log/governance-ledger.jsonl`.

---

## Example Caller Configs

All examples use `ruralpeds/.github/.github/workflows/<name>.yml@main`.

### Node.js project with Playwright E2E

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  ci:
    uses: ruralpeds/.github/.github/workflows/ci-node.yml@main
    with:
      package-manager: "pnpm"
      node-versions: '["18", "20"]'
  e2e:
    uses: ruralpeds/.github/.github/workflows/e2e-playwright.yml@main
    with:
      package-manager: "pnpm"
      start-command: "pnpm dev"
      browsers: '["chromium", "firefox", "webkit"]'
      shards: 3
  audit:
    uses: ruralpeds/.github/.github/workflows/audit-log.yml@main
    permissions:
      contents: write
```

### Julia + React project

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  ci:
    uses: ruralpeds/.github/.github/workflows/ci-julia-react.yml@main
    with:
      julia-version: "1"
      julia-working-directory: "backend"
      frontend-working-directory: "frontend"
      e2e-working-directory: "e2e"
      e2e-start-command: "bash scripts/dev.sh"
      e2e-browsers: '["chromium", "firefox", "webkit"]'
    permissions:
      contents: write
```

### Python project

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  ci:
    uses: ruralpeds/.github/.github/workflows/ci-python.yml@main
    with:
      python-versions: '["3.11", "3.12"]'
  audit:
    uses: ruralpeds/.github/.github/workflows/audit-log.yml@main
    permissions:
      contents: write
```

### Clinical repo with PHI scan + SBOM

```yaml
# .github/workflows/compliance.yml
name: Compliance
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 7 * * 1"
jobs:
  phi:
    uses: ruralpeds/.github/.github/workflows/reusable-phi-scan.yml@main
    permissions:
      security-events: write
      contents: read
  sbom:
    uses: ruralpeds/.github/.github/workflows/reusable-sbom.yml@main
    permissions:
      contents: write
      id-token: write
```

### Regulated release with full supply-chain evidence

```yaml
# .github/workflows/release.yml
name: Release
on:
  workflow_dispatch:
    inputs:
      release-type:
        type: choice
        options: [auto, major, minor, patch]
        default: auto
jobs:
  release:
    uses: ruralpeds/.github/.github/workflows/reusable-release.yml@main
    with:
      release-type: ${{ inputs.release-type }}
    permissions:
      contents: write
      id-token: write
      packages: write
      attestations: write
```

### Record a 21 CFR Part 11 electronic signature

```yaml
# .github/workflows/review.yml
name: Review Stamp
on:
  workflow_dispatch:
    inputs:
      reviewer:
        description: "Reviewer name (printed per §11.50(a)(1))"
        required: true
      meaning:
        description: "Signature meaning (approved/verified/risk-accepted/…)"
        required: true
      notes:
        required: false
jobs:
  stamp:
    uses: ruralpeds/.github/.github/workflows/review-stamp-v2.yml@main
    with:
      reviewer: ${{ inputs.reviewer }}
      meaning: ${{ inputs.meaning }}
      notes: ${{ inputs.notes }}
    permissions:
      contents: write
      id-token: write
```
