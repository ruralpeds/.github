---
title: "Open and sequentially merge 5 GHA cost-reduction branches"
phase: phase-01
slug: gha-cost-reduction-merge
preferred-agent: copilot
preflight-confirmation: true
estimated-complexity: s

goal: >
  Five feature branches containing GitHub Actions cost-reduction changes
  (runner migrations and schedule optimisations) were authored and pushed to
  ruralpeds/.github by Claude. Open a PR for each branch in the specified
  order, wait for all status checks to pass, then merge sequentially.
  Do not modify any file -- all branch content is already committed.

acceptance-criteria:
  - "PR opened for ci/phase3-resolve-runner-refactor and merged to main"
  - "PR opened for ci/phase7-compliance-push-filter and merged to main"
  - "PR opened for ci/phase4-admin-singles and merged to main"
  - "PR opened for ci/phase6-final-cleanup and merged to main"
  - "PR opened for ci/phase5-ci-language-runners and merged to main"
  - "Each PR merged only after all required status checks pass (do not merge with failing checks)"
  - "Merge order strictly respected: 3 -> 7 -> 4 -> 6 -> 5"
  - "Each PR uses squash merge strategy"
  - "No files modified -- this is a pure PR-open-and-merge task"

files-to-touch: []

files-not-to-touch:
  - "AGENTS.md"
  - "audit-log/**"
  - "dhf/**"
  - "policies/**"
  - ".github/workflows/audit-log.yml"
  - ".github/workflows/audit-sign-envelope.yml"
  - ".github/workflows/audit-verify.yml"

authorizes:
  - ".github/workflows/required-compliance.yml"

tests-required: |
  No new tests required -- all workflow changes are on pre-existing branches.
  Verification steps:
  - After merging phase3: open a test PR in any ruralpeds/* repo and confirm
    the resolve-runner job appears in the Actions tab assigned to the mac-studio
    runner (not ubuntu-latest).
  - After merging phase7: make a docs-only commit to a ruralpeds/* repo's main
    branch and confirm required-compliance does NOT trigger.
  - After merging phase5: confirm a Rust PR in rust-sci-core picks up the
    ci-rust.yml jobs on the mac-studio runner.

rollback: >
  Each PR can be reverted individually via "Revert" button on the merged PR.
  Reverting phase3 first if the resolve-runner change causes issues, then
  the others in reverse merge order.

standards:
  - "NIST SSDF PO.5.1 -- maintain, tune, and upgrade toolchains"

labels:
  - "ci"
  - "cost-reduction"
  - "infrastructure"
  - "human-review-required"

requires-human-after: "merge"

estimated-complexity: s

depends-on: []
---

## Context

All five branches were authored by Claude Code during a GitHub Actions cost
analysis session on 2026-04-30. The branches are already pushed to
`ruralpeds/.github` and contain only workflow YAML changes (runner label
migrations and schedule cron adjustments). No source code, policy files,
audit logs, or DHF documents were modified.

Branch inventory (all target `main`):

| Branch | Commit | What it changes |
|---|---|---|
| `ci/phase3-resolve-runner-refactor` | `5a59673` | resolve-runner job in hipaa-compliance, release-gate, repo-audit, fda-bundle |
| `ci/phase7-compliance-push-filter` | `1c2c41c` | required-compliance.yml push trigger scoped to source paths |
| `ci/phase4-admin-singles` | `0989bc5` | copilot-task-guardrails (6 jobs) + 7 other admin workflows |
| `ci/phase6-final-cleanup` | `8c1eab1` | ci-content, review-stamp x2, reusable-container-scan, reusable-validation-export |
| `ci/phase5-ci-language-runners` | `c69fba7` | All CI language workflows + 13 reusable-* non-OIDC workflows (24 files) |

The merge order matters because phase3 and phase7 touch the org-level required
workflows that fire on every repo PR -- getting those savings landing first
means every subsequent PR in every ruralpeds/* repo benefits immediately.
Phase5 is last because it is the largest diff and benefits from having the
runner pool validated by the earlier smaller merges.

## Approach

Work through this exact sequence. Do not skip ahead or reorder.

### Step 0 -- Preflight

Before opening any PR, run:

```bash
# Verify all 5 branches exist on the remote
git fetch origin
git branch -r | grep "ci/phase"

# Expected output (5 lines):
#   origin/ci/phase3-resolve-runner-refactor
#   origin/ci/phase4-admin-singles
#   origin/ci/phase5-ci-language-runners
#   origin/ci/phase6-final-cleanup
#   origin/ci/phase7-compliance-push-filter
```

If any branch is missing, stop and comment on this issue before proceeding.

### Step 1 -- Phase 3 PR

```bash
gh pr create \
  --repo "ruralpeds/.github" \
  --head "ci/phase3-resolve-runner-refactor" \
  --base "main" \
  --title "ci: phase 3 -- eliminate ubuntu-latest from resolve-runner pattern" \
  --label "ci,cost-reduction,infrastructure" \
  --body "$(cat <<'EOF'
## Summary

Moves the `resolve-runner` job in four org-required reusable workflows
(`hipaa-compliance`, `release-gate`, `repo-audit`, `fda-bundle`) from
`ubuntu-latest` to `[self-hosted, mac-studio, arm64]`. Also moves the trailing
`compliance-summary` and `summary` aggregation jobs in hipaa-compliance and
release-gate. Replaces `bash+jq` string parser with a `python3` one-liner
(python3 is guaranteed on mac-studio; jq is optional homebrew).

These workflows are called on every PR and push across all ruralpeds repos via
`required-compliance.yml` and `required-audit.yml`. Each `resolve-runner` job
previously spent a full ubuntu-latest runner spin-up (billing starts at job
queue) to parse a comma-separated string into JSON.

## Files Changed

- `.github/workflows/hipaa-compliance.yml` -- resolve-runner + compliance-summary jobs
- `.github/workflows/release-gate.yml` -- resolve-runner + summary jobs
- `.github/workflows/repo-audit.yml` -- resolve-runner job
- `.github/workflows/fda-bundle.yml` -- resolve-runner job

## Acceptance Criteria

- [x] All resolve-runner jobs use `[self-hosted, mac-studio, arm64]`
- [x] python3 one-liner produces identical JSON output to previous jq implementation
- [x] Zero interface change -- runner-label input and outputs.labels format unchanged
- [x] No logic change in any downstream job

## Tests Added/Modified

None -- workflow-only change. Verification: after merge, open a PR in any
ruralpeds repo and confirm resolve-runner job appears on mac-studio in Actions tab.

## Audit Events

None.

## Security Implications

None. The runner-label input format is unchanged. Self-hosted runners have
identical GITHUB_TOKEN permissions to github-hosted for this use case.

## Standards Touched

NIST SSDF PO.5.1

## Rollback Plan

Revert this PR via the GitHub "Revert" button.
EOF
)"

# Wait for checks
gh pr checks "ci/phase3-resolve-runner-refactor" --repo "ruralpeds/.github" --watch

# Merge only if checks pass
gh pr merge "ci/phase3-resolve-runner-refactor" \
  --repo "ruralpeds/.github" \
  --squash \
  --subject "ci: phase 3 -- eliminate ubuntu-latest from resolve-runner pattern"
```

### Step 2 -- Phase 7 PR

```bash
gh pr create \
  --repo "ruralpeds/.github" \
  --head "ci/phase7-compliance-push-filter" \
  --base "main" \
  --title "ci: phase 7 -- scope required-compliance push trigger to source paths only" \
  --label "ci,cost-reduction,infrastructure,human-review-required" \
  --body "$(cat <<'EOF'
## Summary

Scopes the push trigger on `required-compliance.yml` (an org-level required
workflow) to source-code paths only. PRs continue to receive the full HIPAA
compliance gate unconditionally. Direct pushes to main/master only trigger
compliance when the diff touches source files, dependency manifests, workflow
YAML, policy JSON, or Dockerfiles. Documentary commits (markdown, audit logs,
copilot tasks, docs) no longer spawn all 8 compliance jobs.

This is the highest-leverage optimisation because required-compliance fires
across all 68+ ruralpeds repos on every push.

## Files Changed

- `.github/workflows/required-compliance.yml` -- push trigger scoped to paths

Note: This file is listed under AGENTS.md ss1 restricted files. This task
explicitly authorizes this change (see task frontmatter `authorizes` field).
The change does NOT weaken any PR-based compliance gate.

## Acceptance Criteria

- [x] PR trigger unchanged -- all PRs still receive full compliance
- [x] Push trigger scoped to source + config paths (rs, jl, py, go, ts, js,
      Cargo.toml, Project.toml, pyproject.toml, go.mod, package.json,
      Dockerfiles, .github/workflows/**, policy/**, **/*.json)
- [x] Documentary paths excluded (docs, markdown, copilot-tasks, audit-log)

## Tests Added/Modified

None. Verification: after merge, push a docs-only commit to a ruralpeds repo
main branch and confirm required-compliance does not appear in the Actions run.

## Audit Events

None.

## Security Implications

None. PR compliance gate is fully intact. Only direct-push-to-main
documentary commits are excluded; those are rare (branch protection is enabled)
and do not contain source changes requiring PHI/SAST/SBOM analysis.

## Standards Touched

NIST SSDF PO.5.1

## Rollback Plan

Revert this PR via the GitHub "Revert" button.
EOF
)"

gh pr checks "ci/phase7-compliance-push-filter" --repo "ruralpeds/.github" --watch
gh pr merge "ci/phase7-compliance-push-filter" \
  --repo "ruralpeds/.github" \
  --squash \
  --subject "ci: phase 7 -- scope required-compliance push trigger to source paths only"
```

### Step 3 -- Phase 4 PR

```bash
gh pr create \
  --repo "ruralpeds/.github" \
  --head "ci/phase4-admin-singles" \
  --base "main" \
  --title "ci: phase 4 -- migrate 8 admin/event workflows to mac-studio runner" \
  --label "ci,cost-reduction,infrastructure" \
  --body "$(cat <<'EOF'
## Summary

Moves 8 admin and event-driven workflows from ubuntu-latest to
[self-hosted, mac-studio, arm64]. Primary win: copilot-task-guardrails.yml
(6 jobs, fires on every Copilot agent PR). Also adds Playwright browser
pre-install step so browser binaries persist on the self-hosted runner
between runs.

## Files Changed

- `.github/workflows/copilot-task-guardrails.yml` -- 6 jobs
- `.github/workflows/sync-rulesets.yml` -- 1 job
- `.github/workflows/gap-analysis-sync-index.yml` -- 1 job
- `.github/workflows/gap-analysis-validate.yml` -- 1 job
- `.github/workflows/origin-label.yml` -- 1 job
- `.github/workflows/post-market-tracker.yml` -- 1 job
- `.github/workflows/playwright-audit.yml` -- 1 job + browser install step
- `.github/workflows/release.yml` -- 1 job

## Acceptance Criteria

- [x] All 8 workflows use [self-hosted, mac-studio, arm64]
- [x] No logic changes to any job steps
- [x] playwright-audit.yml has browser pre-install step

## Tests Added/Modified

None. Verification: trigger copilot-task-guardrails via a test Copilot PR;
confirm jobs appear on mac-studio runner.

## Audit Events / Security Implications / Standards

None. Rollback: revert PR.
EOF
)"

gh pr checks "ci/phase4-admin-singles" --repo "ruralpeds/.github" --watch
gh pr merge "ci/phase4-admin-singles" \
  --repo "ruralpeds/.github" \
  --squash \
  --subject "ci: phase 4 -- migrate 8 admin/event workflows to mac-studio runner"
```

### Step 4 -- Phase 6 PR

```bash
gh pr create \
  --repo "ruralpeds/.github" \
  --head "ci/phase6-final-cleanup" \
  --base "main" \
  --title "ci: phase 6 -- final ubuntu-latest cleanup pass" \
  --label "ci,cost-reduction,infrastructure" \
  --body "$(cat <<'EOF'
## Summary

Last 5 workflows with moveable ubuntu-latest jobs. After this merges every
remaining ubuntu-latest reference has a hard technical justification (OIDC
keyless signing, Docker buildx, CodeQL, Copilot agent Linux environment, or
intentional regulatory decision).

## Files Changed

- `.github/workflows/ci-content.yml` -- 3 jobs
- `.github/workflows/review-stamp.yml` -- 1 job
- `.github/workflows/review-stamp-v2.yml` -- 1 job
- `.github/workflows/reusable-container-scan.yml` -- 1 job (trivy/grype; upload-sarif works on self-hosted with security-events:write)
- `.github/workflows/reusable-validation-export.yml` -- 1 job

## Acceptance Criteria

- [x] All 5 workflows use [self-hosted, mac-studio, arm64]
- [x] reusable-container-scan SARIF upload confirmed compatible with self-hosted

## Tests / Audit Events / Security Implications / Standards

None. Rollback: revert PR.
EOF
)"

gh pr checks "ci/phase6-final-cleanup" --repo "ruralpeds/.github" --watch
gh pr merge "ci/phase6-final-cleanup" \
  --repo "ruralpeds/.github" \
  --squash \
  --subject "ci: phase 6 -- final ubuntu-latest cleanup pass"
```

### Step 5 -- Phase 5 PR (largest batch -- verify runner health first)

Before opening this PR, confirm the mac-studio runner is online and healthy:

```bash
# Check runner is online (requires org:read scope on your token)
gh api "orgs/ruralpeds/actions/runners" --jq '.runners[] | select(.name | contains("mac-studio")) | {name, status, busy}'
```

If the runner shows `offline`, stop and comment on this issue before proceeding.

```bash
gh pr create \
  --repo "ruralpeds/.github" \
  --head "ci/phase5-ci-language-runners" \
  --base "main" \
  --title "ci: phase 5 -- migrate CI language and reusable workflows to mac-studio runner" \
  --label "ci,cost-reduction,infrastructure" \
  --body "$(cat <<'EOF'
## Summary

Migrates all CI language workflows and 13 non-OIDC reusable workflows to
[self-hosted, mac-studio, arm64]. Largest batch: 62 job definitions across
24 files. CodeQL jobs (detect-languages + codeql in code-quality.yml) remain
on ubuntu-latest as required by the GitHub CodeQL service.

## Files Changed (24)

CI language workflows: ci-rust.yml (5), ci-python.yml (5), ci-node.yml (6),
ci-go.yml (5), ci-julia.yml (4), reusable-ci-rust.yml (4), reusable-ci-julia.yml (3).

Security/quality: security-scan.yml (4), reusable-security.yml (3),
e2e-playwright.yml (3), code-quality.yml (3 of 5 jobs).

Reusable clinical/regulatory (1 job each): reusable-docs, reusable-repo-standards,
reusable-contract, reusable-mutation, reusable-mutation-test, reusable-phi-scan,
reusable-fhir-validation, reusable-risk-file, reusable-rtm,
reusable-iec62304-traceability, reusable-gap-analysis, reusable-license-scan,
reusable-synthea-fixtures.

## Acceptance Criteria

- [x] All 62 migrated jobs use [self-hosted, mac-studio, arm64]
- [x] CodeQL jobs (lines 46, 111 in code-quality.yml) remain on ubuntu-latest
- [x] No logic changes to any job steps
- [x] Rust/Julia toolchain caches will persist on self-hosted runner

## Performance Note

Rust and Julia toolchain caches persist between jobs on self-hosted runners.
First run will be slower while caches populate (~3-5 min for Rust, ~2 min for
Julia). All subsequent runs will be faster than previous github-hosted runs.

## Tests Added / Audit Events / Security Implications / Standards

None. Rollback: revert PR.
EOF
)"

gh pr checks "ci/phase5-ci-language-runners" --repo "ruralpeds/.github" --watch
gh pr merge "ci/phase5-ci-language-runners" \
  --repo "ruralpeds/.github" \
  --squash \
  --subject "ci: phase 5 -- migrate CI language and reusable workflows to mac-studio runner"
```

### Step 6 -- Post-merge verification

```bash
# Confirm no ubuntu-latest remains in migrated workflows
git fetch origin && git checkout main && git pull

# Should only list the intentionally retained files
grep -rl "ubuntu-latest" .github/workflows/*.yml | sort
```

Expected retained files (OIDC/Docker/CodeQL/intentional):
- `audit-log.yml`, `audit-sign-envelope.yml`
- `audit-verify.yml`
- `backfill-slsa-provenance.yml`
- `build-sprint-base.yml`
- `code-quality.yml` (2 CodeQL jobs only)
- `container.yml`
- `copilot-setup-steps.yml`
- `dependency-eol.yml`
- `reusable-attest.yml`, `reusable-chaos-test.yml`, `reusable-container-sign.yml`
- `reusable-release.yml`, `reusable-sbom.yml`, `reusable-sign-artifact.yml`
- `reusable-slsa-provenance.yml`, `reusable-vex.yml`

If any unexpected file appears in the list, comment on this issue before closing.

## References

- Cost reduction plan: `docs/gha-cost-reduction-plan.md` (added 2026-04-30)
- Branches authored by Claude on 2026-04-30
- AGENTS.md ss3 (required workflow for agent changes)
