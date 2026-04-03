# .github — Org-Level Automation

Reusable CI workflows, testing, and auto-bootstrap for all timothyhartzog repos.

## Workflows

| Workflow | Call with |
|----------|-----------|
| ci-node.yml | `uses: timothyhartzog/.github/.github/workflows/ci-node.yml@main` |
| ci-rust.yml | `uses: timothyhartzog/.github/.github/workflows/ci-rust.yml@main` |
| ci-python.yml | `uses: timothyhartzog/.github/.github/workflows/ci-python.yml@main` |
| ci-julia.yml | `uses: timothyhartzog/.github/.github/workflows/ci-julia.yml@main` |
| ci-go.yml | `uses: timothyhartzog/.github/.github/workflows/ci-go.yml@main` |
| e2e-playwright.yml | `uses: timothyhartzog/.github/.github/workflows/e2e-playwright.yml@main` |
| audit-log.yml | `uses: timothyhartzog/.github/.github/workflows/audit-log.yml@main` |

## Auto-Bootstrap

repo-scanner.yml runs weekly — scans all repos, creates PRs with CI/testing/audit.

Trigger manually: `gh workflow run "Scan & Bootstrap All Repos" --repo timothyhartzog/.github`

Requires `REPO_SETUP_TOKEN` secret (fine-grained PAT with Contents + PRs + Workflows permissions).
