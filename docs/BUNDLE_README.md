# Agentic Copilot Bundle for `ruralpeds/.github`

Drop-in infrastructure that turns your 12-phase enterprise roadmap into an
agentic pipeline: write a task file → the seeder creates a GitHub issue →
`@copilot` (or Claude Code, Codex, Cursor) picks it up → the agent opens a
PR on an `agent/` branch → automated guardrails enforce your clinical and
regulatory rules → a human reviews → merge → the audit ledger records
everything.

## What's in this bundle

| File | What it does |
|---|---|
| `AGENTS.md` | Universal cross-agent contract. Hard refusals in §1 are non-overridable. |
| `.github/copilot-instructions.md` | Copilot's primary instruction file. Three operating modes: inline, review, coding-agent. |
| `.github/instructions/workflows.instructions.md` | Auto-applied when the agent touches `.github/workflows/**/*.yml`. |
| `.github/instructions/dhf.instructions.md` | Auto-applied under `dhf/**`. Hardens against IEC 62304 documentation mistakes. |
| `.github/instructions/security.instructions.md` | Auto-applied under auth/authz/audit/security/crypto paths. |
| `.github/instructions/tests.instructions.md` | Auto-applied under `tests/**`. Property-based, PHI-leak, coverage rules. |
| `.github/ISSUE_TEMPLATE/agent-task.yml` | Structured form for filing agent-ready tasks by hand. |
| `.github/workflows/copilot-setup-steps.yml` | Pre-installs Node/Python/Go/Rust/Julia/cosign/syft/grype/FHIR validator in the agent's env. |
| `.github/workflows/copilot-task-guardrails.yml` | Runs on every agent PR. Enforces AGENTS.md §4.3 (forbidden paths), §3 (PR description), Class-B/C human-review requirement, PHI scan, required-check preservation. |
| `.github/workflows/seed-roadmap-issues.yml` | Weekly cron + on-demand; reads `copilot-tasks/`, files issues idempotently. |
| `.github/mcp-config.json` | MCP server config — GitHub API, FHIR validator, org docs. |
| `scripts/seed_issues.py` | Python script the seed workflow invokes. |
| `copilot-tasks/README.md` + `_schema.md` | Task-file authoring guide. |
| `copilot-tasks/phase-01-*/task-*.md` | Three concrete phase-01 tasks, ready to go. |
| `copilot-tasks/phase-02-*/task-01-slsa-provenance-attest-sbom.md` | SLSA Build L3 + FDA §524B. |
| `copilot-tasks/phase-04-*/task-01-merkle-chain-audit-ledger.md` | Sigstore-signed Merkle-chained audit log. |
| `copilot-tasks/phase-06-*/task-01-iec62304-traceability-workflow.md` | Full DHF scaffold + traceability CI. |
| `copilot-tasks/phase-08-*/task-01-sci-resilience-crate.md` | Resilience patterns as a shared Rust crate. |
| `docs/AGENT_WORKFLOW.md` | End-to-end human walkthrough. |
| `INSTALL.md` | How to drop this into your `.github` repo. |

## Quick start

```bash
# 1. Clone your .github repo and cd in
git clone https://github.com/ruralpeds/.github.git && cd .github
git checkout -b agentic-pipeline-bootstrap

# 2. Copy this bundle's contents on top
cp -a <this-bundle>/. .

# 3. Read INSTALL.md end to end before committing.
$EDITOR INSTALL.md

# 4. Pin the <PINNED_SHA> placeholders in the workflow files.
# 5. Commit, push, open a PR, review it yourself carefully.

# 6. After merge, kick off the seeder:
gh workflow run seed-roadmap-issues.yml \
  -f phase=phase-01 -f dry-run=true -R ruralpeds/.github

# 7. When dry-run looks right, do it live:
gh workflow run seed-roadmap-issues.yml \
  -f phase=phase-01 -f dry-run=false -f assign-to=copilot \
  -R ruralpeds/.github
```

## Design principles

1. **Task files are the contract.** Every unit of agent work is a
   markdown file with YAML frontmatter. The agent, the seeder, and the
   guardrails all read the same file.
2. **Guardrails are code, not policy documents.** Rules in `AGENTS.md` that
   matter (forbidden paths, required sections, class-B/C review) are
   enforced in `copilot-task-guardrails.yml`. They cannot be bypassed by
   an agent or a human.
3. **Scope is narrow.** `files-to-touch` is an allow-list. Single-purpose
   PRs are the default; drive-by fixes are a separate task.
4. **Humans stay in the loop where it matters.** Class B/C repos require
   human review. Clinical-judgment tasks are never filed as agent tasks.
   The roadmap owner writes the task files; the agent executes them.
5. **Everything is audited.** Every agent PR emits an audit event. Phase-04
   upgrades this to a Sigstore-signed Merkle chain with nightly
   verification.

## Compatibility

The `AGENTS.md` + `.github/copilot-instructions.md` + path-scoped
`instructions/` pattern works out of the box with:

- **GitHub Copilot** (chat, review, coding agent)
- **Claude Code** (reads `AGENTS.md` and `CLAUDE.md`; optionally symlink
  `CLAUDE.md → AGENTS.md`)
- **OpenAI Codex** (reads `AGENTS.md`; pass `--agents-file AGENTS.md` on CLI)
- **Cursor** (reads `.cursorrules` — duplicate or symlink to `AGENTS.md`)
- **Windsurf** (similar; reads `.windsurfrules` or repo instructions)

The task files are agent-neutral. Any agent that can be assigned to a
GitHub issue can work them.

## Questions?

Read `docs/AGENT_WORKFLOW.md` for the end-to-end narrative.

Contributions to this bundle: PR against `ruralpeds/.github` with the
`infra` label.
