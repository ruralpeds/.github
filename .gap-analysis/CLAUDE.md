# Claude Code — Gap Analysis Instructions for `ruralpeds/.github`

> Read this file **first** when entering this repository.
> Org-level standard: [`GAP_ANALYSIS_LIFECYCLE.md`](https://github.com/ruralpeds/.github/blob/main/docs/GAP_ANALYSIS_LIFECYCLE.md)
> Org-level Claude contract: [`CLAUDE_CODE_GAP_PROTOCOL.md`](https://github.com/ruralpeds/.github/blob/main/docs/CLAUDE_CODE_GAP_PROTOCOL.md)

---

## Repo at a glance

- **Primary language:** Markdown, YAML, Python, TypeScript
- **Toolchain:** python3 scripts, shell tooling, Node.js/Playwright
- **CI status checks (required to merge):** Gap Analysis Validate, org governance and compliance checks as configured by this repo's rulesets
- **IEC 62304 class:** not applicable (org-governance repository)

---

## Your session protocol (every time)

```
1. Read .gap-analysis/GAP_ANALYSIS.md     ← know the active gaps
2. Read .gap-analysis/SUGGESTIONS.md      ← know what's already been proposed
3. Decide: am I working on a known gap, promoting a suggestion, or proposing a new one?
4. If working on a known gap:
     - git checkout -b gap/NNN-slug
     - commits end with "Refs: GAP-NNN"
     - PR title starts with "GAP-NNN:"
5. If proposing new work:
     - APPEND to .gap-analysis/SUGGESTIONS.md (do NOT add to GAP_ANALYSIS.md)
     - Ask the user to triage before branching
6. End-of-session sweep:
     - Spot any new gaps during the work? Append to SUGGESTIONS.md.
```

---

## Files you can write to in this repo

| File | Write? |
|---|---|
| `.gap-analysis/GAP_ANALYSIS.md` | **Restricted** — only `Blocked`/`Archived` status, status-update notes, acceptance-criteria checkboxes |
| `.gap-analysis/SUGGESTIONS.md` | **Append-only**, structured entries (see CLAUDE_CODE_GAP_PROTOCOL.md §4) |
| `.gap-analysis/CLAUDE.md` (this file) | Only via PR review |
| `.gap-analysis/schema.md` | Only via PR review |
| `.gap-analysis/build-ledger.jsonl` | **Never** — workflow-owned |
| `.gap-analysis/status.json` | **Never** — workflow-owned |

---

## Branch and commit conventions (this repo)

- Branch name: `gap/NNN-short-kebab-slug`
- Commit footer: `Refs: GAP-NNN` (every commit on a gap branch)
- PR title: `GAP-NNN: <description>` (parser uses the prefix)

---

## Repo-specific notes

### Active focus areas

- **Workflow hygiene**: reconcile duplicated or stray workflow files and keep `.github/workflows/` authoritative (see GAP-002).
- **Org repo self-test coverage**: this repo ships reusable workflows and governance assets, so breakage here propagates org-wide (see GAP-003).
- **Compliance follow-through automation**: SLSA verification, FMEA cadence, and post-market operationalization are active governance themes (see GAP-004 through GAP-006).

### Things to know

- This is the source repo for reusable workflows, rulesets, templates, and audit/governance tooling used across `ruralpeds`.
- Changes under `.github/workflows/`, `policies/`, `audit-log/`, and DHF/compliance surfaces can have organization-wide impact; stay tightly scoped to the active gap.
- `docs/WORKFLOW_CATALOG.md` and `.gap-analysis/GAP_ANALYSIS.md` are the fastest orientation points when a task touches workflow inventory or governance drift.

### Files to read for orientation (besides gap-analysis files)

- `README.md`
- `AGENTS.md`
- `docs/WORKFLOW_CATALOG.md`
- `.github/workflows/README.md`

---

## What workflows automate (so you don't have to)

You **do not** edit these manually; they happen via the org-level reusable workflow:

| Trigger | Workflow action |
|---|---|
| You push branch `gap/NNN-...` | Status → `In Progress`, ledger event `branch_opened` |
| You open PR titled `GAP-NNN: ...` | Status → `In Review`, ledger event `pr_opened`, PR # added to gap |
| The PR merges to `main` | Status → `Completed`, ledger event `pr_merged`, `status.json` regenerated |
| Weekly cron | Audit: ledger ↔ doc ↔ git history must agree; drift opens an issue |

---

## When to push back on a request

If the user asks you to do work that conflicts with this protocol — for example, "just add a section to `GAP_ANALYSIS.md` for what we're doing" — explain that:

1. New gaps should land in `SUGGESTIONS.md` first
2. Status transitions are workflow-owned
3. Bypassing this breaks the org-wide audit and the dashboard

Then offer the right path.
