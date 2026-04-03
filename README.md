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
| security-scan.yml | SAST (Semgrep), secret detection, SBOM, supply chain | `uses: timothyhartzog/.github/.github/workflows/security-scan.yml@main` |
| code-quality.yml | CodeQL, dependency review, license compliance, repo hygiene | `uses: timothyhartzog/.github/.github/workflows/code-quality.yml@main` |
| release.yml | Conventional commit changelog, semver bumps, GitHub releases | `uses: timothyhartzog/.github/.github/workflows/release.yml@main` |
| container.yml | Docker build, Hadolint, Trivy scan, GHCR push, attestation | `uses: timothyhartzog/.github/.github/workflows/container.yml@main` |

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

### Security Scanning (security-scan.yml)
- **SAST**: Semgrep with OWASP Top 10 + CWE Top 25 rulesets, SARIF upload to GitHub Security
- **Secret detection**: TruffleHog scans full git history for verified credentials/keys/tokens
- **Sensitive file detection**: Flags `.env`, `*.pem`, `*.key`, credentials files
- **SBOM generation**: Syft produces SPDX + CycloneDX bills of materials for every build
- **Vulnerability scanning**: Grype scans SBOM for known CVEs, fails on Critical severity
- **Supply chain checks**: Flags unpinned GitHub Actions, missing lockfiles, `.gitignore` gaps

### Code Quality & Compliance (code-quality.yml)
- **CodeQL**: Deep semantic analysis across JS/TS, Python, Go, Java, C/C++, Ruby — auto-detects languages
- **Dependency review**: Blocks PRs introducing high-severity vulnerabilities or forbidden licenses
- **License compliance**: Scans Node, Python, and Rust dependencies against configurable allow/deny lists
- **Repository hygiene**: Checks for README, LICENSE, SECURITY.md, CODEOWNERS, CI workflows
- **Code inspection**: Flags large files, debug statements in production code, tech debt markers

### Release Automation (release.yml)
- Parses conventional commits (`feat:`, `fix:`, `feat!:`) to determine semver bump
- Auto-generates categorized changelog (breaking changes, features, fixes, contributors)
- Updates version in `package.json`, `Cargo.toml`, `pyproject.toml`, `VERSION`
- Creates annotated git tag and GitHub release with changelog body
- Supports manual override (major/minor/patch), draft releases, prereleases
- Outputs version, tag, and release URL for downstream jobs

### Container (container.yml)
- **Hadolint**: Lints Dockerfile for best practices before building
- **Multi-platform builds**: Supports `linux/amd64`, `linux/arm64`, etc. via QEMU + Buildx
- **Smart tagging**: Semver tags (`v1`, `v1.2`, `v1.2.3`), branch tags, SHA tags, `latest` on main
- **GHCR push**: Builds and pushes to `ghcr.io/<org>/<repo>` with GHA layer caching
- **Build attestation**: SLSA provenance attestation pushed alongside image
- **Trivy scan**: Scans built image for CVEs, uploads SARIF to GitHub Security tab, fails on critical/high
- **OCI labels**: Embeds source URL, revision, and build timestamp in image metadata

### Audit Logging
- Every build tracked in `audit-log/ledger.json` per repo
- Records: date created, date modified, commit SHA, author, branch, tag
- Full references: commit URL, run URL, tree URL, compare URL
- Dependency snapshots included
- Contributor tracking
- Retention-limited (default 500 entries) to prevent unbounded growth
- Individual entry files for easy access

## Auto-Bootstrap

`repo-scanner.yml` runs weekly — scans all org repos, creates PRs with CI/testing/audit workflows.

Trigger manually: `gh workflow run "Scan & Bootstrap All Repos" --repo timothyhartzog/.github`

Requires `REPO_SETUP_TOKEN` secret (fine-grained PAT with Contents + PRs + Workflows permissions).

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

### Security & compliance (every repo should include this)
```yaml
name: Security
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 7 * * 1"  # Weekly Monday scan
jobs:
  security:
    uses: timothyhartzog/.github/.github/workflows/security-scan.yml@main
    permissions:
      security-events: write
      contents: read
  quality:
    uses: timothyhartzog/.github/.github/workflows/code-quality.yml@main
    permissions:
      security-events: write
      contents: read
      pull-requests: write
```

### Release (manual trigger)
```yaml
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
    uses: timothyhartzog/.github/.github/workflows/release.yml@main
    with:
      release-type: ${{ inputs.release-type }}
    permissions:
      contents: write
```

### Container (repos with Dockerfile)
```yaml
name: Container
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  container:
    uses: timothyhartzog/.github/.github/workflows/container.yml@main
    with:
      platforms: "linux/amd64,linux/arm64"
    permissions:
      contents: read
      packages: write
      attestations: write
      id-token: write
      security-events: write
```
