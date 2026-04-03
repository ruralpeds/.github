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
