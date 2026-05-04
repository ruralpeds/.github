# Gap Analysis for `ruralpeds/.github`

**Repository:** `ruralpeds/.github`
**Last Updated:** 2026-04-28
**Maintainer:** Timothy Hartzog (@timothyhartzog)
**Predecessor:** [`docs/archive/2026-04-gap-analysis/`](../docs/archive/2026-04-gap-analysis/) (snapshot of standards, quick-reference, and template-example as of 2026-04-23)

---

## Overview

This is the org-level `.github` repo: ~75 reusable workflows under `.github/workflows/`, governance rulesets, custom-property catalog, audit ledger plumbing, DHF templates, and IEC 62304 / 21 CFR Part 11 / HIPAA / SLSA scaffolding consumed by every downstream repo in the org.

Strategic focus this iteration: **close the gaps surfaced by the new [`docs/WORKFLOW_CATALOG.md`](../docs/WORKFLOW_CATALOG.md) audit** — duplicated workflow files, missing CI on the org repo itself, and unfinished follow-throughs from the Year 2 roadmap (SLSA backfill verification, FMEA quarterly cadence, post-market go-live).

---

## Active Gaps

### GAP-001: Restore the gap-analysis template after archival

**Status**: Completed
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-05-05

**Description**:
`templates/gap-analysis/GAP_ANALYSIS.md` was moved into `docs/archive/2026-04-gap-analysis/` on 2026-04-28 because its example data (rust-sci-core) was stale. Downstream repos still need a copy-pasteable template; the standards docs were also archived. Restore a clean template + minimal standards reference under `.gap-analysis/` so the documented bootstrap path (`cp -r ../.github/templates/gap-analysis .gap-analysis`) keeps working.

**Acceptance Criteria**:
- [x] Old materials archived under `docs/archive/2026-04-gap-analysis/`
- [x] New `templates/gap-analysis/GAP_ANALYSIS.template.md` (clean, no fictional gaps)
- [x] New `templates/gap-analysis/schema.md`
- [x] New `templates/gap-analysis/.gitignore.template` (ignores `status.json`)
- [ ] `.gap-analysis/README.md` linking to standards & quick reference — deferred to GAP-011
- [ ] Update `CONTRIBUTING.md` and `INSTALL.md` references — deferred to GAP-011

**Related PRs**: #50
**Blocked By**: None
**Last Status Update**: 2026-04-28
- Status → **Completed** (PR #50 merged @ `6bd230c` by @copilot)
- Status → **In Review** (workflow: pr_opened — branch `copilot/feat-gap-analysis-rollout` — by @copilot)
- Archive complete; new gap analysis (this file) and `WORKFLOW_CATALOG.md` published; template restoration deferred to follow-up PR so this commit stays focused.

---

### GAP-002: Reconcile stray top-level `/workflows/` directory

**Status**: Not Started
**Priority**: P1 (Critical)
**Owner**: [Unassigned]
**Target Completion**: 2026-05-15

**Description**:
Two files live in `/workflows/` at the repo root: `audit-sign-envelope.yml` and `reusable-iec62304-traceability.yml`. GitHub Actions only loads workflows from `.github/workflows/`, so these are **not executed**. Both have a counterpart in `.github/workflows/` with **different content** (the traceability file diverges by 216 lines — 405 vs 189). This is a silent-drift hazard for IEC 62304 traceability and 21 CFR Part 11 audit signing.

**Acceptance Criteria**:
- [ ] Diff each pair; decide which version is canonical
- [ ] Merge canonical content into `.github/workflows/<file>.yml`
- [ ] Delete `/workflows/` (or replace with a `README.md` redirecting readers to `.github/workflows/`)
- [ ] Add a CI check (e.g. `hygiene.yml`) that fails if `/workflows/*.yml` reappears
- [ ] Confirm no caller repo references `ruralpeds/.github/workflows/...@...` (only `ruralpeds/.github/.github/workflows/...@...` is valid)

**Implementation Notes**:
- Run `diff workflows/audit-sign-envelope.yml .github/workflows/audit-sign-envelope.yml` and `diff workflows/reusable-iec62304-traceability.yml .github/workflows/reusable-iec62304-traceability.yml`
- For traceability: the 405-line variant is likely newer; verify with `git log --follow`

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28
- Discovered during workflow-catalog audit (see [`docs/WORKFLOW_CATALOG.md` §9](../docs/WORKFLOW_CATALOG.md#9--standalone-files-in-workflows-not-picked-up-by-actions)).

---

### GAP-003: This `.github` repo has no CI of its own

**Status**: Not Started
**Priority**: P1 (Critical)
**Owner**: [Unassigned]
**Target Completion**: 2026-05-22

**Description**:
The `.github` org repo ships 75 reusable workflows used by every other repo, but **none of them run on this repo's own pushes/PRs** beyond `gap-analysis-validate.yml`, `copilot-task-guardrails.yml`, `origin-label.yml`, and the scheduled audits. There is no `actionlint`, no Markdown link-check, no shellcheck for `scripts/`, no JSON-schema validation for `policies/custom-properties.json` or `policies/rulesets/*.json`. A broken workflow YAML can ship to main and break every consumer org-wide before anyone notices.

**Acceptance Criteria**:
- [ ] Add `.github/workflows/self-test.yml` that on push/PR runs:
  - [x] `actionlint` against every file in `.github/workflows/`
  - [x] `yamllint` against `.github/workflows/`, `policies/rulesets/`, `infrastructure/kubernetes/`
  - [x] `jq -e .` against `policies/custom-properties.json` and every `policies/rulesets/*.json`
  - [x] Markdown link-check on top-level docs (or at minimum `WORKFLOW_CATALOG.md`, `README.md`, `INSTALL.md`)
  - [x] `python -m pytest tests/` (audit-verify, traceability)
- [x] Add it as a required status check via `policies/rulesets/`
- [x] Document in `WORKFLOW_CATALOG.md` §6

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-05-04
- Added repo-targeted governance support via `governance-profile`, `policies/rulesets/org-github-repo-main.json`, and the updated origin-label policy so `Self-Test (.github org repo)` can be required on `.github` `main` without leaking repo-only checks into shared org rulesets.
- `self-test.yml` now runs on all `push` / `pull_request` events for this repo, adds `shellcheck` coverage for `scripts/`, and uses a portable temp-file config for Markdown link-checking. `docs/WORKFLOW_CATALOG.md` now documents the workflow, and targeted local validation passed for `actionlint`, `yamllint`, `shellcheck`, Markdown link-check, and `pytest tests/`.

---

### GAP-004: SLSA v1 backfill verification not yet automated end-to-end

**Status**: Backlog
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-05-31

**Description**:
`backfill-slsa-provenance.yml` and `compliance-metrics/slsa-attestation-execution-log.md` show the Phase 1–2 retroactive runs landed, and `dhf/slsa-v1-backfill-report.md` documents results. But there is no scheduled job that runs `gh attestation verify` against every release in `compliance-metrics/releases-phase-1-2.json` and reports drift. Year 2 roadmap (`YEAR_2_ROADMAP.md` Q2 item 1) marks this complete based on attestation API write — verification is the missing leg.

**Acceptance Criteria**:
- [ ] New scheduled workflow `attestation-verify.yml` (weekly Mon 06:30 UTC) that:
  - [ ] Reads `compliance-metrics/releases-phase-1-2.json`
  - [ ] Runs `gh attestation verify` for each release artifact digest
  - [ ] Posts results to `audit-log/attestation-verification.jsonl`
  - [ ] Opens an issue if any release fails verification
- [ ] Wire output into `org-dashboard.yml` provenance-coverage tile
- [ ] Update `WORKFLOW_CATALOG.md` §3 and §6

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---

### GAP-005: Quarterly FMEA review automation

**Status**: Backlog
**Priority**: P2 (High)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-07-15

**Description**:
Year 2 roadmap Q3 commits to a quarterly Failure Mode & Effects Analysis review per ISO 14971. `reusable-risk-file.yml` aggregates `hazard:*` issues into `risk/hazard-analysis.md`, but there is **no scheduled trigger** that opens the quarterly review issue, nor a check that residual-risk acceptance signatures are <90 days old at release time. `release-gate.yml` enforces `AUDIT.yaml` age but not residual-risk-acceptance age.

**Acceptance Criteria**:
- [ ] Scheduled workflow opens an FMEA-review issue on the 1st of each quarter (Jan/Apr/Jul/Oct)
- [ ] `release-gate.yml` extended to fail when `risk/residual-risk-acceptance.yaml` is >90 days old
- [ ] Template added under `templates/dhf/fmea-quarterly-review.md`
- [ ] Documented in `docs/medical-device/IEC_62304_DHF_PATTERN.md`

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---

### GAP-006: Post-market surveillance go-live (pilot → operational)

**Status**: In Progress
**Priority**: P2 (High)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-12-31

**Description**:
`post-market-tracker.yml` exists but has **no `on:` triggers** in the file head — it is effectively dormant. `dhf/post-market/` and `operations/PHASE7_POST_MARKET_SURVEILLANCE.md` define the procedures; the workflow needs to wire issue-opening, JSONL append to `dhf/post-market/complaints.jsonl`, and Slack notification per the Q2 pilot plan.

**Acceptance Criteria**:
- [ ] Add `on: { issues: { types: [opened, labeled] } }` to `post-market-tracker.yml` filtered to label `post-market`
- [ ] Append event stub to `dhf/post-market/complaints.jsonl` with deterministic event ID
- [ ] Slack notification to `#compliance-alerts` on new post-market events (gated by `SLACK_WEBHOOK_URL` secret)
- [ ] `post-market-event.md` issue template with the fields defined in `YEAR_2_ROADMAP.md` Q2 item 5
- [ ] Audit-log entry within 5 minutes of issue creation (verified by `audit-verify.yml`)
- [ ] Catalog entry added to `WORKFLOW_CATALOG.md` §6

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28
- Workflow file present but headless — needs trigger wiring before go-live.

---

### GAP-007: Pin every reusable workflow caller example to a SHA

**Status**: Not Started
**Priority**: P2 (High)
**Owner**: [Unassigned]
**Target Completion**: 2026-06-15

**Description**:
`README.md` and `docs/USING_REUSABLE_WORKFLOWS.md` show `uses: ruralpeds/.github/.github/workflows/<name>.yml@main` in every example. Pinning to `@main` means any change to this repo immediately ships to all consumers — counter to the SLSA / NIST SSDF guidance the same workflows enforce, and counter to `policies/rulesets/` (which already requires signed commits but not pinned uses). Dependabot is configured (`.github/dependabot.yml`) but the docs still teach `@main`.

**Acceptance Criteria**:
- [ ] Replace every `@main` example in `README.md`, `INSTALL.md`, and `docs/USING_REUSABLE_WORKFLOWS.md` with `@<commit-sha>` placeholder + a one-line note pointing readers at Dependabot
- [ ] Add a `hygiene.yml` check that flags `@main` / `@master` in any caller repo's workflow file (warning, not failure, for the first iteration)
- [ ] Document SHA-pin policy in `docs/security/attestations.md`

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---

### GAP-008: `ci-julia.yml` trigger surface inconsistent with sibling CI workflows

**Status**: Not Started
**Priority**: P3 (Medium)
**Owner**: [Unassigned]
**Target Completion**: 2026-06-30

**Description**:
Every other `ci-<lang>.yml` is `workflow_call`-only. `ci-julia.yml` runs on `push` + `pull_request`, which means it executes on this `.github` repo itself (where there is no Julia code), wasting minutes. There is also a separate `reusable-ci-julia.yml` that *is* `workflow_call`-only, creating consumer confusion.

**Acceptance Criteria**:
- [ ] Decide: collapse to one file (preferred) or document both clearly
- [ ] Remove `push` / `pull_request` triggers from `ci-julia.yml`, or rename it to `julia-self-test.yml` if it is intentionally self-running
- [ ] Update `README.md` and `WORKFLOW_CATALOG.md` §2

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---

### GAP-009: README workflow table is duplicated and references both `timothyhartzog/.github` and `ruralpeds/.github`

**Status**: Not Started
**Priority**: P3 (Medium)
**Owner**: [Unassigned]
**Target Completion**: 2026-06-30

**Description**:
`README.md` lines 9–50 list every workflow twice (once under `timothyhartzog/.github`, once under `ruralpeds/.github`) and lines 185–294 repeat several blocks. With `WORKFLOW_CATALOG.md` now the source of truth, the README should shrink to a pointer + the 2–3 most commonly copied snippets.

**Acceptance Criteria**:
- [ ] Replace the duplicated table with a one-paragraph summary + link to `docs/WORKFLOW_CATALOG.md`
- [ ] Decide canonical org name (`ruralpeds` per the rest of the repo); replace `timothyhartzog` examples or document as legacy aliases
- [ ] Keep the "Example Usage" snippets (Node + Julia + Python + review-stamp + security)

**Related PRs**: None
**Blocked By**: GAP-007 (do the SHA-pin update at the same time)
**Last Status Update**: 2026-04-28

---

### GAP-010: SOC 2 / HITRUST evidence collection not yet wired to ledger

**Status**: Backlog
**Priority**: P2 (High)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-10-15

**Description**:
Year 2 roadmap Q4 commits to initiating SOC 2 Type II / HITRUST CSF audit. Evidence collection today relies on manual scrape of `audit-log/`, `compliance-metrics/`, `dhf/`. There is no scheduled "evidence-pack" workflow that bundles required artifacts (audit chain, e-signatures, SBOMs, SLSA attestations, RTM, FMEA) for the auditor.

**Acceptance Criteria**:
- [ ] New `reusable-audit-evidence-pack.yml` taking `period-start` / `period-end` inputs
- [ ] Output: signed tarball with `audit-log/ledger.json`, `audit-log/esignatures.jsonl`, latest SBOMs, SLSA attestations, latest `traceability/rtm.json`, latest `risk/hazard-analysis.md`
- [ ] Cosign-signed; uploaded to S3 Object Lock bucket per `infrastructure/terraform/`
- [ ] Documented in `docs/compliance/PART_11_EVIDENCE.md`

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---

### GAP-011: AGENTS.md / CONTRIBUTING.md still reference moved gap-analysis paths

**Status**: Not Started
**Priority**: P3 (Medium)
**Owner**: [Unassigned]
**Target Completion**: 2026-05-12

**Description**:
After the 2026-04-28 archive move, any link to `docs/GAP_ANALYSIS_STANDARDS.md` or `docs/GAP_ANALYSIS_QUICK_REFERENCE.md` is now a 404. The standards doc itself listed several "See Also" links that need updating once GAP-001 lands.

**Acceptance Criteria**:
- [ ] `git grep -nE 'GAP_ANALYSIS_(STANDARDS|QUICK_REFERENCE)\.md'` returns zero hits outside `docs/archive/`
- [ ] All survivors point at the new template + `.gap-analysis/README.md`

**Related PRs**: None
**Blocked By**: GAP-001
**Last Status Update**: 2026-04-28

---

### GAP-012: No coverage threshold enforcement in this repo's own scripts

**Status**: Backlog
**Priority**: P3 (Medium)
**Owner**: [Unassigned]
**Target Completion**: 2026-07-31

**Description**:
`scripts/` and `tests/` carry the gap-analysis validator, traceability checker, audit-verify helpers — code that gates regulated repos. There is no coverage gate on these scripts themselves. If GAP-003 lands first, fold this into the same self-test workflow.

**Acceptance Criteria**:
- [ ] `pytest --cov=scripts --cov-fail-under=80` in the new self-test workflow
- [ ] Coverage badge written to `docs/metrics/`
- [ ] Document in `tests/README.md` (create if missing)

**Related PRs**: None
**Blocked By**: GAP-003
**Last Status Update**: 2026-04-28

---

### GAP-013: Repo-specific branch protection and PR origin policy for `ruralpeds/.github`

**Status**: Backlog
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-05-22

**Description**:
`Self-Test (.github org repo)` and the stricter PR-origin policy are specific to this org-governance repository and cannot be added to the shared org-wide rulesets without breaking other repos that do not run those checks. Add a repo-targeting custom property, a repo-specific ruleset for `main`, and an updated `origin-label.yml` policy so Copilot-, Claude-, and human-authored PRs are consistently labeled and gated in `ruralpeds/.github`.

**Acceptance Criteria**:
- [x] Add a custom property in `policies/custom-properties.json` that can target the `.github` repository without requiring repo-only checks org-wide
- [x] Add a repo-specific ruleset under `policies/rulesets/` targeting `ruralpeds/.github` `main`
- [x] Require `Self-Test (.github org repo)` and `Verify origin label` in that repo-specific ruleset
- [x] Update `.github/workflows/origin-label.yml` so the allowed labels align with Copilot / Claude / human PR attribution
- [x] Add automatic origin-label assignment for common agent/human PR signals without weakening the existing enforcement
- [x] Document the repo-specific ruleset and labeling policy in repo docs

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-05-04
- Added optional `governance-profile` targeting to the property schemas, created `org-github-repo-main.json`, standardized PR origin labels around Copilot / Claude / human and related automation labels, and documented the policy in `docs/governance/pr-origin-labels.md`. Targeted validation passed for the changed JSON, YAML, workflow, gap-analysis, and docs surfaces.
- Promoted from `sug-2026-05-04-copilot-001` to unblock the repo-specific ruleset needed after GAP-003 surfaced `.github`-only required checks.

---

### GAP-014: Enforce one-agent-per-branch branch and PR guardrails

**Status**: Backlog
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-05-23

**Description**:
Branch naming, PR titles, and origin labels are documented, but neither Copilot nor Claude is mechanically blocked from reusing an existing branch, omitting ownership metadata, or opening malformed PRs. Add a dedicated guardrail layer for `ruralpeds/.github` so every gap PR declares a primary agent, uses a valid `gap/NNN-*` branch, uses a valid `GAP-NNN:` title, and keeps the `origin:*` label consistent with the declared owner.

**Acceptance Criteria**:
- [x] Add a required PR template section for `agent-ownership` with `primary_agent` and `gap`
- [x] Add a workflow that fails PRs when branch names do not match `gap/NNN-slug`
- [x] Add a workflow that fails PRs when titles do not match `GAP-NNN: ...`
- [x] Enforce that the `agent-ownership` block exists and the declared gap matches the branch/title gap number
- [x] Enforce that the declared `primary_agent` aligns with the single `origin:*` label
- [x] Update the existing agent guardrails so Copilot/Claude PRs are detected from the new metadata path
- [x] Add the new guardrail check to the `.github` repo-specific ruleset and document the policy

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-05-04
- Added `.github/PULL_REQUEST_TEMPLATE.md`, created `agent-branch-guardrails.yml`, taught `origin-label.yml` and `copilot-task-guardrails.yml` to understand the new ownership metadata path, required `Validate agent branch PR` in the repo-specific ruleset, and documented the policy. Targeted actionlint, yamllint, ruleset JSON, gap-format, and markdown-link-check validation passed for the GAP-014 surfaces.
- Promoted from `sug-2026-05-04-copilot-002` to prevent Copilot and Claude from sharing branches or opening malformed gap PRs.

---

## Completed Gaps (Last 90 Days)

### ✅ GAP-000: Refresh gap analysis & build a workflow catalog

**Status**: Completed
**Completed Date**: 2026-04-28
**PR**: (this PR)
**Completion Notes**:
Archived `docs/GAP_ANALYSIS_STANDARDS.md`, `docs/GAP_ANALYSIS_QUICK_REFERENCE.md`, and `templates/gap-analysis/GAP_ANALYSIS.md` (with example data) into `docs/archive/2026-04-gap-analysis/` plus a README explaining the move and restoration commands. Authored `docs/WORKFLOW_CATALOG.md` cataloging all 75 workflows under `.github/workflows/` plus the 2 strays under `/workflows/`, mapping each to its triggers, regulation, and consumer pattern. This `GAP_ANALYSIS.md` replaces the old example with concrete gaps grounded in the catalog audit.

---

## Roadmap by Quarter

| Gap | Q2 2026 (May–Jun) | Q3 2026 (Jul–Sep) | Q4 2026 (Oct–Dec) |
|---|---|---|---|
| GAP-001 Restore template | ✓ Target May 5 | | |
| GAP-002 Reconcile `/workflows/` | ✓ Target May 15 | | |
| GAP-003 Self-CI for `.github` | ✓ Target May 22 | | |
| GAP-004 SLSA-verify automation | ✓ Target May 31 | | |
| GAP-005 FMEA quarterly | | ✓ Target Jul 15 | |
| GAP-006 Post-market go-live | ✓ pilot continuing | ✓ ramp | ✓ Target Dec 31 |
| GAP-007 SHA-pin docs | ✓ Target Jun 15 | | |
| GAP-008 ci-julia consolidation | | ✓ Target Jun 30 | |
| GAP-009 README simplification | | ✓ Target Jun 30 | |
| GAP-010 SOC 2 evidence pack | | | ✓ Target Oct 15 |
| GAP-011 Doc back-references | ✓ Target May 12 | | |
| GAP-012 Coverage gate on scripts | | ✓ Target Jul 31 | |

---

## Dependencies

| Gap | Depends On | Notes |
|---|---|---|
| GAP-009 | GAP-007 | Update README pinning + dedup in one PR |
| GAP-011 | GAP-001 | Need new template paths to redirect to |
| GAP-012 | GAP-003 | Same workflow file |

---

## How to update

See [`docs/archive/2026-04-gap-analysis/GAP_ANALYSIS_STANDARDS.md`](../docs/archive/2026-04-gap-analysis/GAP_ANALYSIS_STANDARDS.md) for the full prior standard. Key rules:

1. Statuses: `Not Started`, `Backlog`, `In Progress`, `Blocked`, `In Review`, `Completed`, `Archived` — strict enum, validated by `gap-analysis-validate.yml`
2. `status.json` is auto-generated by `gap-analysis-sync-index.yml` — do not commit it (see `.gitignore`)
3. Update `Last Status Update` whenever a status changes; commit with `docs: GAP-NNN <verb>`
