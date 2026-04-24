# INSTALL — How to drop this bundle into `ruralpeds/.github`

This bundle is a set of files that together turn your roadmap into an agentic
pipeline: task files → auto-seeded issues → `@copilot`-worked PRs → guardrailed
merges → audit ledger.

## TL;DR

```bash
# 1. Clone your .github repo
git clone https://github.com/ruralpeds/.github.git
cd .github
git checkout -b agentic-pipeline-bootstrap

# 2. Copy the bundle contents
cp -r <path-to-this-bundle>/* .
cp -r <path-to-this-bundle>/.github/* .github/
cp <path-to-this-bundle>/.github/copilot-instructions.md .github/
cp <path-to-this-bundle>/AGENTS.md .

# 3. Review, commit, push
git add -A
git commit -m "feat: bootstrap agentic task pipeline (AGENTS.md + guardrails + seeder)"
git push -u origin agentic-pipeline-bootstrap

# 4. Open a PR and review it yourself carefully — this PR defines how
#    every future agent PR will be reviewed, so the bar is high.

# 5. Once merged, kick off the seeder:
gh workflow run seed-roadmap-issues.yml \
  -f phase=phase-01 \
  -f dry-run=true \
  -R ruralpeds/.github

# Inspect the dry-run output. If it looks right:
gh workflow run seed-roadmap-issues.yml \
  -f phase=phase-01 \
  -f dry-run=false \
  -f assign-to=copilot \
  -R ruralpeds/.github

# 6. Watch the first agent PR, learn, iterate on AGENTS.md and task files.
```

## What gets installed where

```
ruralpeds/.github/                               (your repo after install)
├── AGENTS.md                                    ← universal agent contract
├── .github/
│   ├── copilot-instructions.md                  ← Copilot primary instructions
│   ├── instructions/                            ← path-scoped (auto-apply)
│   │   ├── workflows.instructions.md
│   │   ├── dhf.instructions.md
│   │   ├── security.instructions.md
│   │   └── tests.instructions.md
│   ├── ISSUE_TEMPLATE/
│   │   └── agent-task.yml                       ← template for agent-ready issues
│   └── workflows/
│       ├── copilot-setup-steps.yml              ← agent environment preflight
│       ├── copilot-task-guardrails.yml          ← AGENTS.md enforcement
│       └── seed-roadmap-issues.yml              ← creates issues from task files
├── scripts/
│   └── seed_issues.py                           ← reads task files, creates issues
├── copilot-tasks/                               ← the task queue (source of truth)
│   ├── README.md
│   ├── _schema.md
│   ├── phase-01-platform-hardening/
│   │   ├── task-01-secret-scanning-push-protection.md
│   │   ├── task-02-pin-actions-sha.md
│   │   └── task-03-custom-properties.md
│   ├── phase-02-supply-chain/
│   │   └── task-01-slsa-provenance-attest-sbom.md
│   ├── phase-04-audit-depth/
│   │   └── task-01-merkle-chain-audit-ledger.md
│   ├── phase-06-iec62304/
│   │   └── task-01-iec62304-traceability-workflow.md
│   └── phase-08-ha-patterns/
│       └── task-01-sci-resilience-crate.md
└── docs/
    └── AGENT_WORKFLOW.md                        ← end-to-end human walkthrough
```

## Prerequisites

Before the pipeline can seed issues or have Copilot work them:

1. **GitHub Copilot Enterprise** (or Business + coding-agent preview) enabled
   for the org. Confirm at Organization settings → Copilot → Coding agent.

2. **Org-level custom properties defined** — without these, the
   `copilot-task-guardrails.yml` job falls back to `repo-class=unknown` and
   can't distinguish Class A from Class C. Phase-01 task-03 is itself the
   task that sets this up, so for bootstrap either:
   - Define the six properties by hand first via the GitHub UI, then run
     the seeder; or
   - Run the seeder and let the agent do task-03 as its first job — the
     guardrails will treat the repo as class-unknown (defaults to
     `review:human-required`, which is safe).

3. **`GITHUB_TOKEN` permissions** — your org setting
   "Workflow permissions" must allow `contents: read-write` and
   `pull-requests: write` at minimum for the seed workflow to create issues.

4. **Pin the action SHAs.** Every `<PINNED_SHA>` placeholder in the bundled
   workflows needs to be replaced with a real 40-char commit SHA before
   merge. You can do this in the bootstrap PR itself (run
   `pin-github-action` during review) or file it as your first agent task.

5. **CODEOWNERS** entries for the sensitive paths:
   ```
   /AGENTS.md                             @ruralpeds/security @ruralpeds/clinical
   /.github/copilot-instructions.md       @ruralpeds/security
   /.github/instructions/dhf.*            @ruralpeds/clinical
   /.github/instructions/security.*       @ruralpeds/security
   /policies/**                           @ruralpeds/security
   /audit-log/**                          @ruralpeds/security
   /copilot-tasks/**                      @ruralpeds/engineering
   ```

## Verification that install worked

Run these after merging the bootstrap PR:

```bash
# Files in the right place
test -f AGENTS.md
test -f .github/copilot-instructions.md
test -f .github/workflows/copilot-task-guardrails.yml
test -f .github/workflows/seed-roadmap-issues.yml
test -f scripts/seed_issues.py
ls copilot-tasks/phase-01-platform-hardening/

# Scripts run without error in dry-run
GH_TOKEN=$(gh auth token) python scripts/seed_issues.py \
  --repo ruralpeds/.github --phase phase-01 --dry-run

# Workflow is listable
gh workflow list -R ruralpeds/.github | grep -i seed
gh workflow list -R ruralpeds/.github | grep -i guardrail
```

## Rollout order (recommended)

1. **Week 0**: merge bootstrap PR. Pin SHAs. Set CODEOWNERS.
2. **Week 1**: run seeder for phase-01 only, dry-run. Review the preview
   output. Adjust task files if any frontmatter is off. Live-run.
3. **Week 1**: assign phase-01/task-01 (secret scanning) first — it's
   the simplest, safest agent task. Watch how the agent handles it.
4. **Week 2**: phase-01/task-02 (pin SHAs) and task-03 (custom properties).
   With properties in place, guardrails become fully effective.
5. **Week 3+**: phase-02 onwards. Work in batches, not a flood. Review
   guardrail logs, not just PRs.

## What NOT to do

- **Don't skip the bootstrap-PR review.** This PR defines the enforcement
  substrate. Every rule that makes it in here will bind every future agent
  PR.
- **Don't merge AGENTS.md without `@ruralpeds/clinical` review** if any
  repo in the org is clinical. They must sign off on §5 (clinical-software
  specifics) in particular.
- **Don't enable agent assignment in phi-active repos** until you've had
  ≥3 successful agent cycles on non-phi repos. Build the trust graph.
- **Don't rely on the agent to write new task files.** Tasks are authored
  by humans (the roadmap owner). Agents execute tasks; they don't define
  work.

## Support

Post-install questions, missing-file reports, or workflow tuning: open an
issue with the label `infra` in `ruralpeds/.github`.

Author: Timothy Hartzog, April 2026. Bundle version 1.0.
