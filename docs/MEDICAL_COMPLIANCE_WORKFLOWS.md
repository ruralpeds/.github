# Medical-Software Compliance Workflows

This document describes the three new workflows added in the `enterprise/p0-medical-compliance-workflows` branch:

- `reusable-phi-scan.yml` — HIPAA PHI scrubbing scanner
- `reusable-sbom.yml` — FDA/NTIA-compliant Software Bill of Materials
- `sync-rulesets.yml` — Governance-as-code ruleset applier

And the supporting files:

- `.github/phi-patterns.toml` — Healthcare PHI detection ruleset for gitleaks
- `policies/rulesets/signed-commits-main.json` — Baseline branch ruleset
- `docs/examples/medical-compliance.example.yml` — Caller template for clinical repos

---

## Regulatory mapping

| Workflow | Regulation | Citation |
|---|---|---|
| `reusable-phi-scan.yml` | HIPAA Security Rule | §164.312(b) audit controls |
| `reusable-phi-scan.yml` | HIPAA Privacy Rule | §164.502(a) minimum necessary |
| `reusable-phi-scan.yml` | HIPAA Breach Notification | §164.400–414 |
| `reusable-sbom.yml` | FDA Cyber Premarket | Section 524B (Sept 2023) |
| `reusable-sbom.yml` | Executive Order | 14028 (May 2021) |
| `reusable-sbom.yml` | NTIA | Minimum Elements for SBOM (July 2021) |
| `reusable-sbom.yml` | NIST SSDF | PS.3.2 archive & protect each release |
| `sync-rulesets.yml` | 21 CFR Part 11 | §11.70 signature/record linking |
| `sync-rulesets.yml` | NIST SSDF | PS.1.1 protect code from tampering |

---

## Quick start (per clinical repo)

1. Copy `docs/examples/medical-compliance.example.yml` to your repo as `.github/workflows/medical-compliance.yml`.
2. Commit.
3. Enable GitHub Advanced Security on the repo (required for SARIF code scanning uploads) — or set `upload-sarif: false` in the PHI-scan caller.
4. On first merge, the PHI scan runs against your diff. If it passes, you're good. If it fails, triage the findings per the scan summary.

---

## PHI Scanner: handling findings

The scanner uses the gitleaks engine with custom healthcare rules in `.github/phi-patterns.toml`. Possible outcomes:

### Clean result
No action needed.

### Findings — triage by category

**1. Real PHI accidentally committed**

This is a reportable breach under HIPAA §164.400–414. Process:
1. **Do NOT merge** the PR.
2. Rotate any credentials exposed alongside (if applicable).
3. Rewrite git history to remove the PHI (`git filter-repo` is recommended over `git filter-branch`).
4. Force-push the sanitized branch. (Note: signed-commits ruleset blocks non-fast-forward — use the bypass PR label `grant:history-rewrite` + documented approval.)
5. Log a **breach review** entry in the audit ledger of the repo. Record: date discovered, PHI type, breach notification required (yes/no), OCR notification decision with rationale.
6. Update `docs/breach-log.md` in the `Github-workflow` audit archive repo.

**2. Synthetic test data that looks like PHI**

This is the most common case. Example: `patient_name = "Jane Doe"` in a test fixture.

Remediation:
1. Add a marker comment adjacent: `// SYNTHETIC-DATA: approved by <reviewer> on <date>` (or `#` for Python/Julia/Ruby/etc.). The scanner's allowlist already recognizes this marker.
2. If the pattern still triggers, add a `.gitleaksignore` entry with a **justification comment**:

```
# Test fixture for vital signs parser — REQ-PEDS-042 — synthetic patient from Synthea — reviewed by timothyhartzog 2026-04-22
a1b2c3d4:src/tests/fixtures/vitals_test_data.json:42
```

The scanner validates that every ignore entry has a preceding justification comment. Unjustified suppressions fail the workflow.

**3. Pattern false positive (the regex is wrong)**

Open an issue against `ruralpeds/.github` to refine the rule in `phi-patterns.toml`. Include:
- The falsely-matched snippet (redacted)
- The rule ID (from the SARIF report)
- A proposed regex improvement

---

## SBOM: what gets scanned and output

The SBOM workflow uses Anchore's `sbom-action` (Syft backend) which understands:

- `package.json` / `package-lock.json` (Node/TypeScript)
- `pyproject.toml` / `requirements.txt` / `poetry.lock` (Python)
- `Cargo.toml` / `Cargo.lock` (Rust)
- `go.mod` / `go.sum` (Go)
- Julia `Manifest.toml` (via post-processing)
- OS packages (dpkg, rpm, apk)
- Docker images (when path is a container ref)

### Outputs committed to `sbom/` directory

```
sbom/
├── sbom.cyclonedx.json        # Primary FDA-preferred format
├── sbom.spdx.json             # Secondary (if both format selected)
├── licenses.txt               # Unique licenses present
└── generation-context.json    # Audit trail of when/where/how
```

### License denylist

Default denials: `GPL-3.0`, `AGPL-3.0`, `SSPL-1.0`, `Commons-Clause`, `BUSL-1.1`.

Rationale: these carry strong copyleft or usage restrictions that complicate commercial healthcare software distribution. For development-only dependencies, use `fail-on-license-deny: false` in the caller and perform manual review instead.

Override by forking `reusable-sbom.yml` or adding your own `reusable-license-scan.yml` with repo-specific policy.

---

## Ruleset Sync: how to add a new ruleset

1. Drop a new JSON file in `policies/rulesets/`.
2. Follow the GitHub REST API shape for [POST /repos/{owner}/{repo}/rulesets](https://docs.github.com/en/rest/repos/rules#create-a-repository-ruleset).
3. Open a PR. The ruleset is NOT applied until the PR merges (review gate).
4. After merge, `sync-rulesets.yml` runs on push and applies it to all org repos.
5. A governance ledger entry is appended to `audit-log/governance-ledger.jsonl` with every sync.

### Baseline ruleset: `signed-commits-main.json`

Enforces on `main`, `master`, and `release/*`:
- No deletion
- No force push (non-fast-forward blocked)
- Linear history required
- Signed commits required (cryptographic non-repudiation)
- PR required with ≥1 approver
- Stale reviews dismissed on new push
- Last-push approval required
- Review thread resolution required
- PHI scrubbing scan must pass before merge
- No automatic Copilot code review (human-only reviewers for clinical code)

---

## Dry-run mode

Before turning on the ruleset sync in production, validate what it would do:

```
gh workflow run "Sync Rulesets (Governance as Code)" \
  -f dry-run=true \
  -f target-repos="Peds"
```

Review the workflow summary and the `ruleset-sync-<run_id>` artifact. Only run without `dry-run` after confirming the diff is as expected.

---

## Cost and performance

| Workflow | Typical runtime | Notes |
|---|---|---|
| `reusable-phi-scan.yml` (diff) | 30–60s | Adds negligible cost to PR pipeline |
| `reusable-phi-scan.yml` (full-history) | 2–10 min | Weekly schedule keeps cost low |
| `reusable-sbom.yml` | 1–3 min | Only commits when SBOM actually changed |
| `sync-rulesets.yml` | 30–60s per ruleset × repo count | Weekly; idempotent |

Total additional compute: roughly **1–2 hours/week of GitHub Actions runner time** across the whole org. Well within the free tier for a personal account.

---

## Migration checklist for existing repos

- [ ] Copy `docs/examples/medical-compliance.example.yml` into repo
- [ ] Enable GitHub Advanced Security (for SARIF upload) OR set `upload-sarif: false`
- [ ] Add `sbom/` to `.gitignore` only if you DON'T want SBOMs committed (default is commit)
- [ ] Create an empty `.gitleaksignore` if you expect to have documented suppressions
- [ ] Add a `docs/data-classification.md` declaring whether the repo handles PHI
- [ ] Verify local commits are GPG-signed (`git config commit.gpgsign true`) before ruleset sync rolls out
- [ ] Add repo to `policies/rulesets/signed-commits-main.json` exclusion list if it is NOT a clinical repo
- [ ] Run `gh workflow run "Medical-Software Compliance"` manually to verify
