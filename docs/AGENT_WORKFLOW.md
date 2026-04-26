# How the Agentic Workflow Works (End to End)

This document describes — in human terms — how an idea moves from "we should
harden secret scanning" to "merged PR that did it" without the roadmap owner
touching the keyboard for most of the journey.

## The four primitives

1. **Task file** — a markdown file under `copilot-tasks/phase-NN-*/task-*.md`
   with YAML frontmatter that fully specifies one reviewable unit of work.
2. **GitHub issue** — auto-generated from the task file, assigned to an
   agent.
3. **Agent PR** — what the agent produces. Branch named
   `agent/<phase>/<slug>-<issue#>`.
4. **Guardrails workflow** — automatically runs on every agent PR and
   enforces the rules in `AGENTS.md`.

Everything else (CI, PHI scan, SBOM, audit logging) already exists; the
agent's PR flows through the same pipeline as any human PR, plus the extra
agent-specific guardrails.

## The five-layer instruction stack

Agents (Copilot, Claude Code, Codex, Cursor) read instructions from five
layers, stricter wins on safety-critical rules, narrower wins on style:

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. AGENTS.md §1 (hard refusals)                                     │
│    Non-overridable. PHI, compliance bypass, force-push, etc.        │
├─────────────────────────────────────────────────────────────────────┤
│ 2. The triggering issue's body                                      │
│    Task-specific rules. "Only modify X.", "Use Y approach."         │
├─────────────────────────────────────────────────────────────────────┤
│ 3. Path-scoped .github/instructions/*.md                            │
│    Auto-applied based on file path via `applyTo:` frontmatter.      │
├─────────────────────────────────────────────────────────────────────┤
│ 4. AGENTS.md §2..§13 + .github/copilot-instructions.md              │
│    Repo-wide conventions.                                           │
├─────────────────────────────────────────────────────────────────────┤
│ 5. Per-agent defaults (Copilot, Claude Code, etc.)                  │
│    Baseline behavior.                                               │
└─────────────────────────────────────────────────────────────────────┘
```

## Walkthrough: "pin all actions to SHAs"

### Step 1 — Task file exists

Already written: `copilot-tasks/phase-01-platform-hardening/task-02-pin-actions-sha.md`.
The frontmatter declares:

- `slug: pin-actions-sha`
- `files-to-touch: [.github/workflows/**/*.yml, .github/dependabot.yml]`
- `acceptance-criteria: [...]`
- `preflight-confirmation: false`

### Step 2 — Seed the issue

A human (or the weekly cron) triggers `seed-roadmap-issues.yml`:

```
Actions → "Seed Roadmap Issues" → Run workflow
  phase: phase-01
  dry-run: false
  assign-to: copilot
```

`scripts/seed_issues.py` walks `copilot-tasks/phase-01-*/`, sees the task,
checks for an existing issue with the canonical title, finds none, creates
a new issue titled `[agent-task] phase-01/pin-actions-sha: Pin all workflow
actions to 40-char SHAs` with labels `agent-task`, `phase:01`,
`task:pin-actions-sha`, `security`, `supply-chain`, `quick-win` and assigns
it to `@copilot`.

### Step 3 — Copilot picks it up

GitHub Copilot coding agent is notified via its issue-assignment webhook.
It spins up an ephemeral environment. The `copilot-setup-steps.yml` workflow
runs first to pre-install Node, Python, Go, Rust, Julia, actionlint,
yamllint, cosign, syft, grype, FHIR validator. The agent now has a ready
environment.

### Step 4 — The agent reads context

Before editing a single file:

1. Reads `AGENTS.md` (universal rules).
2. Reads `.github/copilot-instructions.md` (Copilot operating modes).
3. Reads `.github/instructions/workflows.instructions.md` because its
   `applyTo: .github/workflows/**/*.yml` pattern matches the files it plans
   to touch.
4. Reads the linked task file (`task-02-pin-actions-sha.md`) end to end.
5. Reads the current state of the workflows it's about to change.

### Step 5 — The agent acts

It runs (inside its sandboxed environment):

```bash
npm install --global pin-github-action@1.x
find .github/workflows -name '*.yml' -print0 | \
  xargs -0 -n1 pin-github-action --allow-empty-actions-list
```

Adds `.github/dependabot.yml` per the task body. Runs `actionlint` — clean.
Runs the verification grep — empty. Runs `yamllint --strict` — clean.

### Step 6 — The agent opens a PR

Branch: `agent/phase-01/pin-actions-sha-<issue#>`.

Commits (Conventional Commits + `Refs:` footer):

```
security: pin all workflow actions to SHAs

Replaces tag-based `uses:` with commit-SHA pins; adds Dependabot
config for github-actions ecosystem. Eliminates the last Scorecard
Pinned-Dependencies gap.

Refs: #<issue>
```

PR description fills every section of the template:

- **Summary**: 2 sentences.
- **Files Changed**: every touched workflow + dependabot.yml.
- **Acceptance Criteria**: every box checked, with output of the grep and
  actionlint pasted in.
- **Tests**: `actionlint` run + `yamllint` run.
- **Audit Events**: none.
- **Security Implications**: "Reduces supply-chain attack surface. No new
  surface added. Failure mode is Dependabot no longer auto-upgrading, which
  is acceptable (we review Dependabot PRs)."
- **Standards Touched**: NIST SSDF PW.4, Scorecard Pinned-Dependencies, SLSA
  v1.0 build.
- **Rollback**: Revert the merge commit.
- **Agent Self-Check**: every box checked.

Labels: `agent:copilot`, `phase:01`, `task:pin-actions-sha`, `class:<repo-class>`,
`review:human-required` (or `cooling-off-ok` per task).

### Step 7 — Guardrails run

`copilot-task-guardrails.yml` fires on PR open:

- **detect-agent** — sees `agent/` branch prefix, marks `is-agent=true`,
  fetches the repo's custom properties, sees `iec62304-class=not-applicable`
  (this is the `.github` repo, not clinical), `data-classification=internal`.
- **forbidden-paths** — diffs the PR. No files under `audit-log/`, `dhf/risk/`,
  `policies/rulesets/`, etc. Passes.
- **required-compliance-checks-preserved** — grep for added
  `continue-on-error: true` or `if: false` in the modified required-check
  workflows. None found. Passes.
- **pr-description-complete** — every required section present. Passes.
- **phi-scan-on-diff** — runs the reusable PHI scanner over the diff. Clean
  (workflow YAML has no PHI patterns).
- **class-bc-needs-human** — skipped because repo is not Class B/C and not
  phi-active.
- **audit-log-agent-pr** — emits a summary JSON to the run's step summary.

All green.

### Step 8 — Regular CI runs

The normal `ci-*.yml` workflows also run. CodeQL, Scorecard, etc. All green.

### Step 9 — Human review

The PR is now assigned for human review per CODEOWNERS. The reviewer sees:

- A clean, single-purpose PR.
- Every file's change is a one-line pinning.
- The PR body has the verification evidence baked in.
- All checks green.

Reviewer approves, merges.

### Step 10 — Audit trail

The `audit-log.yml` workflow runs on merge-to-main, appending a new entry
to the Merkle chain in `audit-log/chain.ndjson` (after phase-04/task-01
lands) with Sigstore-signed hash of this PR's commit. The issue auto-closes
via the `Refs: #<issue>` footer.

### Step 11 — Done

The roadmap owner opens the issue tracker a week later and sees:

- `agent-task` label: 6 closed PRs, 2 in review, 4 queued.
- Weekly audit report: every agent PR's guardrail evaluation.
- Scorecard score for `.github`: +12 points on Pinned-Dependencies.

Total roadmap-owner keyboard time for this task: 30 seconds (clicking
"Run workflow" on the seeder).

## Why this works

- **Task files are the contract.** They are tighter than free-form issues
  and far tighter than "give Copilot the roadmap and see what it does."
- **Guardrails are enforced, not advisory.** The `copilot-task-guardrails.yml`
  is a required status check; a PR cannot merge if it violates
  AGENTS.md §4.3 even if every human reviewer approves.
- **The agent can refuse.** `AGENTS.md §1` gives explicit refusal paths; the
  agent can comment `BLOCKED:` or `RISK:` on an issue without failing.
- **Every action leaves evidence.** The guardrails workflow emits an audit
  event for every agent PR, whether it merges or not. This is your
  regulatory-grade paper trail.
- **Scope is bounded.** `files-to-touch` is an allow-list; anything outside
  it that gets modified is flagged. Small, reviewable PRs are the default,
  not the exception.

## What to do when things break

### The agent misbehaves

- **Takes too broad a scope**: task file's `files-to-touch` was too loose.
  Tighten it, close the PR, reopen the task.
- **Asks too many clarifying questions**: the task file lacks context.
  Add a longer `## Context` section.
- **Gives up (`BLOCKED:`)**: check the comment; usually a real blocker
  (missing dependency, property not yet set, permission). Address and
  re-assign.
- **Produces a PR that doesn't pass guardrails**: the guardrails are doing
  their job. The feedback loop is: read the guardrail failure → update the
  task file so the next task doesn't trip the same rule → re-assign.

### You want to add a new kind of task

1. Write the task file under a new phase directory (or existing).
2. Commit it.
3. Run `seed-roadmap-issues.yml`.
4. Assign to `@copilot` (or let the seeder do it).

### You want to add a new guardrail

1. Extend `copilot-task-guardrails.yml` with a new job.
2. Document the new rule in `AGENTS.md`.
3. Announce in `ruralpeds/.github` README so contributors (human and
   agent) know.

## The 30-day ramp-up

- **Week 1**: seed only phase-01 tasks. Assign one at a time. Watch the PRs
  closely. Tighten AGENTS.md and task files based on what you see.
- **Week 2**: seed phase-01 remainder + phase-02. Assign in batches of 3.
  Review guardrail logs, not just PRs.
- **Week 3**: seed phase-03 + phase-04. Start letting small Class A PRs
  use `cooling-off-ok` (self-review after 24h) instead of mandatory human
  review. Track the cooling-off-ok miss rate.
- **Week 4**: full steam. Every phase has active agent work. Weekly review
  of the agent metrics dashboard (how many PRs, merge rate, guardrail-fail
  rate, lines-per-PR average).

Within 90 days the roadmap owner is mostly writing task files and reviewing,
not implementing.
