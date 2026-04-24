# Using Reusable Workflows from `ruralpeds/.github`

This document explains how downstream repositories adopt the healthcare enterprise
standards defined in this repo by adding thin wrapper workflows.

All heavy lifting (linting, testing, security scans, governance checks) lives
here in `ruralpeds/.github`. Each consuming repo only needs a few small
wrapper files.

---

## Prerequisites

1. Your repo is owned by (or forked under) the `timothyhartzog` account.
2. You have `AGENTS.md`, `SECURITY.md`, `CONTRIBUTING.md`, `README.md`, and the
   required `docs/` files as described in
   [`HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md`](../HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md).
   Run `bash scripts/check_repo_standards.sh` locally to see what is missing.
3. `docs/audit-events.md` contains the required event catalog entries. Run
   `bash scripts/check_audit_events_md.sh` locally to verify.

---

## Standard wrapper workflows

Create the following files in your repository's `.github/workflows/` directory.
Each file is a thin wrapper that calls the corresponding reusable workflow here.

---

### `ci.yml` — Continuous Integration

#### Rust project

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  ci:
    uses: ruralpeds/.github/.github/workflows/reusable-ci-rust.yml@main
    with:
      toolchain: stable
      run-nightly: false       # set true to also run tests on nightly
      run-clippy: true
      run-fmt: true
      working-directory: .
      upload-test-report: true
```

#### Julia project (back-end only)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  ci:
    uses: ruralpeds/.github/.github/workflows/reusable-ci-julia.yml@main
    with:
      julia-version: "1"
      # Uncomment to test across multiple versions:
      # julia-versions: '["1.9", "1"]'
      run-format-check: true
      working-directory: .
      upload-coverage: true
```

#### Julia + React + Playwright project (standard)

For full-stack Julia projects with a React front-end, Observable JS charts, and
Playwright E2E testing, use the combined workflow. See
[`JULIA_REACT_PROJECT_STANDARD.md`](JULIA_REACT_PROJECT_STANDARD.md) for the
complete standard.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    uses: timothyhartzog/.github/.github/workflows/ci-julia-react.yml@main
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

---

### `security.yml` — Security Scanning

```yaml
# .github/workflows/security.yml
name: Security

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: "0 6 * * 1"   # weekly on Monday at 06:00 UTC

permissions:
  contents: read

jobs:
  security:
    uses: ruralpeds/.github/.github/workflows/reusable-security.yml@main
    with:
      run-dependency-review: true
      dependency-review-fail-on-severity: high
      # To enable CodeQL SAST, set run-codeql: true and grant security-events: write
      # run-codeql: true
      # codeql-languages: '["python"]'
    # Uncomment if enabling CodeQL:
    # permissions:
    #   contents: read
    #   security-events: write
```

---

### `docs.yml` — Documentation Quality

```yaml
# .github/workflows/docs.yml
name: Docs

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  docs:
    uses: ruralpeds/.github/.github/workflows/reusable-docs.yml@main
    with:
      docs-directory: docs
      run-markdown-lint: true
      run-link-check: true
      run-required-docs-check: true
```

---

### `repo-standards.yml` — Repository Governance Gate

```yaml
# .github/workflows/repo-standards.yml
name: Repo Standards

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  standards:
    uses: ruralpeds/.github/.github/workflows/reusable-repo-standards.yml@main
    with:
      run-audit-events-check: true
      run-pinning-advisory: true
```

---

## What each workflow checks

| Workflow | Checks |
|---|---|
| `reusable-ci-rust.yml` | `rustfmt`, `clippy -D warnings`, `cargo test` (stable + optional nightly), test artifact upload |
| `reusable-ci-julia.yml` | `JuliaFormatter`, `Pkg.instantiate`, `Pkg.test` (version matrix), LCOV coverage |
| `reusable-security.yml` | Dependency review (blocks HIGH+ CVEs on PRs), secret pattern advisory, optional CodeQL |
| `reusable-docs.yml` | `markdownlint`, `lychee` link check, required governance files |
| `reusable-repo-standards.yml` | All required files, `docs/audit-events.md` catalog, unpinned actions advisory |

---

## Required docs checklist

Before the `repo-standards` gate will pass, your repo must contain:

```
README.md
AGENTS.md
SECURITY.md
CONTRIBUTING.md
docs/audit-events.md          ← must include all required event names
docs/data-classification.md
docs/architecture.md
docs/threat-model.md
docs/observability.md
docs/testing-strategy.md
docs/release-process.md
docs/playwright-strategy.md
docs/incident-response.md
docs/fhir-integration.md
```

See [`HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md`](../HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md)
for the expected content of each file.

---

## `docs/audit-events.md` minimum required entries

The `check_audit_events_md.sh` script validates that the following event names
appear in the catalog (from Blueprint §7.5):

```
auth.login.succeeded
auth.login.failed
user.role.changed
patient.record.viewed
patient.record.updated
patient.record.exported
admin.configuration.changed
deployment.production.approved
```

Event names must follow the pattern `<domain>.<subject>.<verb>`.

---

## Local validation

Run these scripts locally before opening a PR:

```bash
# Check governance files and docs structure
bash scripts/check_repo_standards.sh

# Check audit events catalog
bash scripts/check_audit_events_md.sh
```

Both scripts exit 0 on success and print `::error::` annotations on failure,
matching the GitHub Actions annotation format.
