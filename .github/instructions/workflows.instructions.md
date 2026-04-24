---
applyTo: ".github/workflows/**/*.yml"
---

# Instructions: GitHub Actions Workflows

When editing or creating workflows in `.github/workflows/`, apply these rules in addition to `AGENTS.md` and `.github/copilot-instructions.md`.

## Hard rules

- **Pin every `uses:` to a full 40-character commit SHA.** Never use `@main`, `@v1`, `@v1.2.3`, or any tag as the sole reference. The correct form is `uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2` — the SHA is authoritative; the trailing comment is for humans and Dependabot.
- **Never use `continue-on-error: true`** on a security, test, PHI scan, SBOM, or audit step. If a step is advisory, make that explicit in a separate `warning-only-*` job that doesn't block merge, and document why.
- **Never use `if: false`** to disable a job. Delete the job (and document the removal in the PR body) or fix it.
- **`permissions:` must be declared at the workflow level or per-job, always minimal.** Default to `permissions: contents: read`. Elevate only the specific permissions needed. Never use `permissions: write-all`.
- **No secrets in step output.** Do not `echo "$MY_SECRET"`, do not use secrets in conditional expressions visible in logs, do not `set -x` when a secret is in the environment.
- **No curl-bash.** Never `curl ... | bash` or `wget ... | sh`. Install via package manager, a pinned action, or a script you've committed.
- **Use `actions/checkout` with `persist-credentials: false`** unless the job must push back (only audit-log.yml and a handful of others do).
- **Concurrency required.** Every workflow declares a `concurrency:` block with `cancel-in-progress: true` for PR-triggered workflows (except release workflows).
- **Timeout required.** Every job declares `timeout-minutes:` with a realistic limit. Default 15 for CI, 45 for E2E, 60 for chaos/load.

## Structure

- Workflows in this `.github` org-template repo that are meant to be called by other repos use the `workflow_call:` trigger and live with the prefix `reusable-*.yml` or `ci-*.yml`.
- A workflow that scans all org repos lives here and uses `schedule:` + `workflow_dispatch:` triggers; these require a GitHub App token (see org secret `TH_BOT_APP_ID` / `TH_BOT_PRIVATE_KEY`), never a long-lived PAT.
- Every reusable workflow documents its `inputs:`, `secrets:`, and `outputs:` with comments.

## OIDC / cloud federation

- When authenticating to AWS, GCP, Azure, or other cloud providers, use OIDC (`id-token: write` permission + the provider's OIDC action). Never store long-lived cloud credentials in GitHub secrets.
- `cosign` signing uses keyless OIDC flow via Fulcio/Rekor. Do not configure cosign with a local private key unless explicitly tasked to.

## Before opening the PR

Run these locally (or in a scratch branch) and include the output in the PR:

- `actionlint` against every file you touched.
- `yamllint` (strict).
- For reusable workflows: a smoke test that calls the workflow from a scratch caller in a throwaway repo.
