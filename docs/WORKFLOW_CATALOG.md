# Workflow Catalog — `ruralpeds/.github`

> **Generated:** 2026-04-28 · **Source of truth:** `.github/workflows/` (75 files) + `workflows/` (2 files)
> **Owner:** Timothy Hartzog (@timothyhartzog)
> **Refresh cadence:** Quarterly, or on any net add/remove of a workflow

This catalog is the canonical index of every CI/CD, governance, and compliance workflow shipped from this org-level `.github` repo. Each entry lists the trigger surface, the regulation/standard it maps to, and how downstream repos consume it.

For *how to call* a reusable workflow, see [`USING_REUSABLE_WORKFLOWS.md`](USING_REUSABLE_WORKFLOWS.md).
For the SDLC gate-by-gate narrative, see [`.github/workflows/README.md`](../.github/workflows/README.md).

---

## At-a-glance counts

| Bucket | Count |
|---|---:|
| SDLC gate workflows (`01-`, `02-`, `03-`) | 3 |
| Reusable language CI (`ci-*.yml`) | 7 |
| Reusable security & supply chain | 14 |
| Reusable compliance (HIPAA / IEC 62304 / 21 CFR Part 11 / ISO 14971 / FDA) | 13 |
| Audit ledger & e-signature | 6 |
| Org governance & scheduled scans | 12 |
| Gap analysis & traceability | 4 |
| Release orchestration | 5 |
| Copilot & agent guardrails | 3 |
| Other (docs, dashboard, mac-runner, repo-bootstrap) | 8 |
| **Total in `.github/workflows/`** | **75** |
| Strays in `/workflows/` (not picked up by Actions) | 2 |

---

## 1 · SDLC Gate Workflows

These three numbered workflows implement the 8-gate IEC 62304 SDLC pipeline (see `.github/workflows/README.md` for gate-by-gate description).

| File | Triggers | Gates | What it does |
|---|---|---|---|
| `01-build-and-test.yml` | `pull_request`, `push` | 1, 2 | Code review + ≥80% unit-test coverage + static analysis (Black, isort, Pylint, MyPy, Bandit) + Snyk/Trivy dep-scan + DB migration validation |
| `02-integration-system-tests.yml` | `pull_request` | 3, 4 | Integration tests (Postgres, Redis, audit-trail immutability) + system tests (FHIR US Core 6.1, EHR export/import) + CFR Part 11 / HIPAA verification + Trivy container scan |
| `03-release-and-deploy.yml` | `push` to main, `workflow_dispatch` | 5–8 | Build → Syft/CycloneDX SBOM → SLSA v1 provenance → Cosign keyless sign → Trivy → deploy staging → manual approval → blue-green production → post-deploy metrics |

---

## 2 · Reusable Language CI

`workflow_call` only — caller repos invoke from their own `.github/workflows/ci.yml`.

| File | Stack | Notable steps |
|---|---|---|
| `ci-node.yml` | Node.js | lint, typecheck, test, build, npm audit |
| `ci-python.yml` | Python | ruff, mypy, bandit, pytest + coverage |
| `ci-rust.yml` | Rust | fmt, clippy, cargo test/audit, tarpaulin |
| `ci-go.yml` | Go | golangci-lint, vet, gosec, race-enabled tests |
| `ci-julia.yml` | Julia | JuliaFormatter + Pkg.test (note: triggered on `push`/`pull_request`, not `workflow_call`) |
| `ci-julia-react.yml` | Julia + React + Playwright | full-stack pipeline used by PedNeoSim |
| `ci-content.yml` | Markdown / docs | link-check, lint |
| `reusable-ci-julia.yml` | Julia | dedicated `workflow_call` variant |
| `reusable-ci-rust.yml` | Rust | dedicated `workflow_call` variant |

---

## 3 · Reusable Security & Supply Chain

| File | Standard | Purpose |
|---|---|---|
| `security-scan.yml` | OWASP Top 10, CWE Top 25 | Semgrep SAST + TruffleHog secrets + Syft SBOM + Grype CVE scan + supply-chain checks |
| `code-quality.yml` | Generic | CodeQL, dependency review, license compliance, repo hygiene |
| `reusable-security.yml` | Generic | dep-review wrapper for PR events |
| `reusable-sbom.yml` | FDA 524B / EO 14028 | CycloneDX 1.5 + SPDX 2.3, license denylist, commits to `sbom/` |
| `reusable-slsa.yml` | NIST SSDF PS.3.2 | SLSA Level 3 build provenance via slsa-github-generator → `.intoto.jsonl` signed via Sigstore |
| `reusable-slsa-provenance.yml` | SLSA v1.0 | Newer SLSA v1 attestation generator (used by `backfill-slsa-provenance.yml`) |
| `reusable-attest.yml` | CISA SSDF | Lighter-weight `actions/attest-build-provenance` build attestations |
| `reusable-sign-artifact.yml` | 21 CFR Part 11 §11.70, HIPAA §164.312(c)(1) | Cosign keyless artifact signing (OIDC → Fulcio → Rekor) |
| `reusable-container-sign.yml` | 21 CFR Part 11 §11.70 | Cosign keyless **image** signing variant |
| `reusable-container-scan.yml` | NIST SSDF RV.1.1, FDA Cyber | Dual-scanner Trivy + Grype for images / OCI / binaries |
| `reusable-license-scan.yml` | ISO 13485 §7.2.1 | Deep license analysis with runtime-vs-dev classification |
| `reusable-vex.yml` | NIST SSDF | VEX document generation for SBOM consumers |
| `reusable-secret-scan-report.yml` | Generic | Weekly aggregated secret-scan report |
| `reusable-phi-scan.yml` | HIPAA §164.312(b) | gitleaks + healthcare pattern catalog → SARIF to code scanning |
| `container.yml` | Generic | Hadolint + multi-platform build + GHCR push + Trivy + attestation |

---

## 4 · Reusable Compliance — Healthcare & Medical Device

| File | Standard | Purpose |
|---|---|---|
| `hipaa-compliance.yml` | HIPAA Security Rule | Reusable HIPAA gate aggregator |
| `reusable-iec62304-traceability.yml` | IEC 62304 §5.1.5 / §7 | URS → SDS → tests traceability check |
| `reusable-rtm.yml` | GAMP 5 §4.2 / IEC 62304 §5.2 | Requirements Traceability Matrix → `traceability/rtm.json` + `rtm.md` |
| `reusable-risk-file.yml` | ISO 14971:2019 / IEC 62304 §7 | Aggregates `hazard:*` issues → `risk/hazard-analysis.md` + `risk-summary.json` |
| `reusable-fhir-validation.yml` | HL7 FHIR US Core 6.1 | Validates FHIR resources against US Core IG |
| `reusable-contract.yml` | 42 CFR Part 170 | FHIR + OpenAPI contract testing via Redocly |
| `reusable-synthea-fixtures.yml` | Test data | Generates synthetic patient FHIR bundles |
| `reusable-mutation.yml` | FDA CSA / IEC 62304 §5.5.3 | Multi-language mutation testing (cargo-mutants, mutmut, Stryker) |
| `reusable-mutation-test.yml` | FDA CSA | Weekly scheduled variant |
| `reusable-chaos-test.yml` | Resilience / DR | LitmusChaos scenarios; weekly schedule + on-demand |
| `reusable-validation-export.yml` | GAMP 5 §4.2 / IEC 62304 §5.8 / 21 CFR 820.30(j) | Packages SBOM + risk + RTM + docs into validation bundle |
| `fda-bundle.yml` | FDA 510(k) | Reusable workflow that assembles full 510(k) submission bundle |
| `release-gate.yml` | IEC 62304 §5.8 | Release-time gate enforcing AUDIT.yaml age + signed manifest URL |

---

## 5 · Audit Ledger & E-Signature

| File | Standard | Purpose |
|---|---|---|
| `audit-log.yml` | Generic enterprise audit | Build → `audit-log/ledger.json` (date_created, date_modified, dependency snapshots, commit refs) |
| `audit-sign-envelope.yml` | 21 CFR Part 11 §11.70 | Sigstore-signed envelopes wrapping release-approval events |
| `audit-verify.yml` | 21 CFR Part 11 §11.10 | Daily Merkle-chain verification (scheduled) + manual dispatch |
| `review-stamp.yml` | Generic | v1 reviewer stamp (workflow_dispatch + workflow_call) |
| `review-stamp-v2.yml` | 21 CFR Part 11 §11.50 / §11.70 / §11.200 | Controlled-vocabulary `meaning`, tree-hash binding, signed git tag, JSONL ledger |
| `repo-audit.yml` | Generic | Reusable per-repo audit aggregator |

---

## 6 · Org Governance & Scheduled Scans

All run on `schedule:` and most can be triggered with `workflow_dispatch`.

| File | Cron / cadence | Purpose |
|---|---|---|
| `sync-rulesets.yml` | Mon 05:00 UTC | Apply `policies/rulesets/*.json` to every org repo via GitHub API |
| `repo-scanner.yml` | Mon 06:00 UTC | Bootstrap missing CI workflows into all org repos via PR |
| `check-compliance.yml` | Mon 07:00 UTC | Scan all repos for required CI/audit/Playwright/review-stamp; open issue if non-compliant |
| `playwright-audit.yml` | Mon 08:00 UTC | Visual audit of org Actions status |
| `custom-properties-audit.yml` | Mon 09:00 UTC | Audit repos missing required custom properties |
| `dependency-eol.yml` | Monthly (1st @ 10:00) | endoflife.date check; opens issue when runtime cycle approaches EOL |
| `vuln-triage.yml` | Daily 11:00 UTC | Dependabot alert SLA enforcement (7d/30d/90d/180d by severity) |
| `org-dashboard.yml` | schedule + push + dispatch | Generates org-health dashboard |
| `stale-repo-sweeper.yml` | schedule + dispatch | Flags inactive repos |
| `seed-roadmap-issues.yml` | schedule + dispatch | Seeds roadmap initiative issues |
| `hygiene.yml` | schedule + dispatch | Repo hygiene check (README, LICENSE, SECURITY, etc.) |
| `sync-copilot-assets.yml` | schedule + push + dispatch | Syncs Copilot assets to target repos per `copilot-assets-targets.json` |
| `test-mac-runner.yml` | schedule + dispatch | Validates macOS runner availability |
| `origin-label.yml` | `pull_request`, `workflow_call` | FDA GMLP / EU AI Act — required `origin:*` label on every PR |
| `copilot-task-guardrails.yml` | `pull_request` | Agent PR guardrails (size limits, paths, AI session summary) |
| `copilot-setup-steps.yml` | `workflow_dispatch` | Bootstraps Copilot assets in a repo |
| `required-audit.yml` | push + schedule + dispatch | "Required" status check enforcing audit log presence |
| `required-compliance.yml` | push + pull_request | "Required" status check enforcing compliance file presence |
| `reusable-repo-standards.yml` | `workflow_call` | Reusable repo-standards gate |

---

## 7 · Gap Analysis & Traceability

| File | Trigger | Purpose |
|---|---|---|
| `gap-analysis-validate.yml` | push/PR on `.gap-analysis/GAP_ANALYSIS.md` | Validates markdown syntax, status enum, gap-ID uniqueness |
| `gap-analysis-sync-index.yml` | push to main on `.gap-analysis/` | Auto-generates `status.json` aggregate index |
| `reusable-iec62304-traceability.yml` | `workflow_call` | URS↔SDS↔test traceability check (also listed under §4) |
| `reusable-rtm.yml` | `workflow_call` | Requirements Traceability Matrix (also listed under §4) |

The Python helper `scripts/traceability/check_gaps.py` is invoked by `gap-analysis-validate.yml`; tests live in `tests/traceability/test_check_gaps.py`.

---

## 8 · Release Orchestration

| File | Purpose |
|---|---|
| `release.yml` | Conventional-commit changelog + semver bump + GitHub release |
| `reusable-release.yml` | One-button release: release-please PR → build → SBOM → SLSA → cosign → validation export → audit |
| `release-gate.yml` | Pre-release gate (manifest URL + AUDIT.yaml freshness) |
| `backfill-slsa-provenance.yml` | Retroactive SLSA v1 attestation for Phase 1–2 releases |
| `reusable-docs.yml` | Reusable docs build/publish |

---

## 9 · Standalone files in `/workflows/` (NOT picked up by Actions)

GitHub Actions only loads workflows from `.github/workflows/`. The two files in the top-level `workflows/` directory are NOT executed:

| File | Status | Comparison |
|---|---|---|
| `workflows/audit-sign-envelope.yml` | **Stray copy** | 326 lines vs. 326 lines in `.github/workflows/audit-sign-envelope.yml` — content differs |
| `workflows/reusable-iec62304-traceability.yml` | **Stray copy** | 405 lines vs. 189 lines in `.github/workflows/reusable-iec62304-traceability.yml` — substantially different |

Tracked as **GAP-002** in `.gap-analysis/GAP_ANALYSIS.md` (deduplicate or remove).

---

## 10 · Weekly schedule overview (UTC)

| Time (Mon) | Workflow | Purpose |
|---|---|---|
| 05:00 | `sync-rulesets.yml` | Apply governance rulesets |
| 06:00 | `repo-scanner.yml` | Bootstrap missing CI |
| 07:00 | `check-compliance.yml` | Org compliance scan |
| 08:00 | `playwright-audit.yml` | Visual Actions audit |
| 09:00 | `custom-properties-audit.yml` | Custom-property audit |
| Daily 11:00 | `vuln-triage.yml` | Dependabot SLA enforcement |
| Monthly 1st 10:00 | `dependency-eol.yml` | Runtime EOL check |

---

## 11 · How to consume from a downstream repo

**Pin to a SHA, not `@main`** for any workflow that runs in a regulated context.

```yaml
jobs:
  ci:
    uses: ruralpeds/.github/.github/workflows/ci-python.yml@<commit-sha>
    with:
      python-versions: '["3.11", "3.12"]'
  audit:
    uses: ruralpeds/.github/.github/workflows/audit-log.yml@<commit-sha>
    permissions:
      contents: write
```

See `INSTALL.md` and `docs/USING_REUSABLE_WORKFLOWS.md` for the full pattern (permissions, secrets, custom-property prerequisites).

---

## 12 · Maintenance

| Action | Cadence | Owner |
|---|---|---|
| Re-generate workflow counts | On every workflow add/remove | PR author |
| Verify mappings to standards | Quarterly | Compliance Officer |
| Reconcile `/workflows/` strays | One-time, then enforce via CI | Platform Eng |
| Confirm SHA pins in caller repos | Quarterly | Platform Eng |

Open an issue tagged `workflow-catalog` in `ruralpeds/.github` for additions, corrections, or rename requests.
