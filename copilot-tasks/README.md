# `copilot-tasks/` — Machine-Readable Roadmap Tasks

This directory is the **source of truth** for every roadmap item the agentic pipeline can execute. The `seed-roadmap-issues.yml` workflow reads these files and creates GitHub issues from them; each issue can then be assigned to `@copilot` (or another agent) to work on.

## Layout

```
copilot-tasks/
├── README.md                (you are here)
├── _schema.md               (canonical schema for task files)
├── phase-01-platform-hardening/
│   ├── task-01-secret-scanning-push-protection.md
│   ├── task-02-pin-actions-sha.md
│   ├── task-03-custom-properties.md
│   └── ...
├── phase-02-supply-chain/
│   └── ...
├── phase-04-audit-depth/
├── phase-06-iec62304/
└── phase-08-ha-patterns/
```

Phases map 1-to-1 to the phases in `ENTERPRISE_ROADMAP.md`. Task numbering is sequential within a phase; gaps are fine when a task is retired.

## File naming

```
task-<NN>-<kebab-case-slug>.md
```

The `<NN>` is a zero-padded sequence, used only for sort order — the `seed_issues.py` script keys on the slug, not the number.

## File contents

Every task file has **YAML frontmatter** (machine-readable) followed by **a Markdown body** (human-readable context the agent reads). See `_schema.md` for the full schema.

Minimal example:

```markdown
---
title: "Pin all workflow actions to 40-char SHAs"
phase: phase-01
slug: pin-actions-sha
preferred-agent: copilot
preflight-confirmation: false

goal: >
  Replace every `uses: owner/repo@<tag>` in `.github/workflows/**/*.yml`
  with `uses: owner/repo@<sha>  # <tag>` so supply-chain posture matches
  NIST SSDF PW.4.

acceptance-criteria:
  - "Every uses: line in .github/workflows/**/*.yml references a 40-char SHA"
  - "Each pinned line has a trailing ` # <tag>` comment for Dependabot"
  - "actionlint passes against all modified files"
  - "A new Dependabot config entry exists for github-actions ecosystem"

files-to-touch:
  - ".github/workflows/**/*.yml"
  - ".github/dependabot.yml"

files-not-to-touch:
  - "AGENTS.md"
  - "policies/**"
  - "audit-log/**"

tests-required: |
  - Run `actionlint` against every modified workflow; output must be clean.
  - Run `yamllint --strict` against every modified workflow.

standards:
  - "NIST SSDF PW.4"
  - "OpenSSF Scorecard: Pinned-Dependencies"
  - "SLSA v1.0 — build requirements"

rollback: >
  Revert the merge commit; Dependabot will continue to work with tag refs.

labels:
  - "security"
  - "supply-chain"
---

## Context

GitHub Actions resolved by mutable tag (`@v4`, `@main`) can be hijacked by the action's maintainer or a repo compromise. Pinning to a 40-char commit SHA removes that risk.

The `pin-github-action` CLI automates the pinning. Install and run:

```bash
npm install -g pin-github-action
find .github/workflows -name '*.yml' -print -exec pin-github-action {} \;
```

Then commit the result with message `security: pin all workflow actions to SHAs`.

## Verification

After pinning, this command must return empty output:

```bash
grep -rE 'uses:\s+[^@]+@(v?[0-9]|main|master|latest)' .github/workflows/
```
```

## Lifecycle of a task

```
   author writes task file
          │
          ▼
  task committed to main
          │
          ▼
  seed-roadmap-issues.yml runs (on schedule or on demand)
          │
          ▼
  GitHub issue created, labeled, optionally assigned to @copilot
          │
          ▼
  Copilot coding agent picks it up
          │
          ▼
  Agent opens PR on branch agent/<phase>/<slug>-<issue#>
          │
          ▼
  copilot-task-guardrails.yml enforces AGENTS.md rules
          │
          ▼
  Reusable CI + PHI + SBOM + CodeQL + Scorecard run
          │
          ▼
  Human reviewer (required for Class B/C) approves
          │
          ▼
  Merge → audit-log.yml appends to Merkle chain → issue closes
```

## Who writes task files?

- **The roadmap owner** (you) — for strategic phases.
- **Other humans** — PRs against this directory are reviewed like any other PR.
- **Agents** — agents MAY NOT add task files except via a human-reviewed PR explicitly scoped to that.

Writing good task files is the highest-leverage activity in this system: a clear task file turns a vague idea into a 1–3 hour agent run.

## Dry-running

From any clone:

```bash
GH_TOKEN=$(gh auth token) python scripts/seed_issues.py \
    --repo ruralpeds/.github \
    --phase phase-01 \
    --dry-run
```

This prints what would be created without touching the issue tracker.
