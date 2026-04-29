# Claude Code — Gap Analysis Instructions for `<repo-name>`

> Read this file **first** when entering this repository.
> Org-level standard: [`GAP_ANALYSIS_LIFECYCLE.md`](https://github.com/ruralpeds/.github/blob/main/docs/GAP_ANALYSIS_LIFECYCLE.md)
> Org-level Claude contract: [`CLAUDE_CODE_GAP_PROTOCOL.md`](https://github.com/ruralpeds/.github/blob/main/docs/CLAUDE_CODE_GAP_PROTOCOL.md)

---

## Repo at a glance

- **Primary language:** <Rust | Julia | Python | TypeScript | Markdown>
- **Toolchain:** <cargo, Pkg.jl, uv, pnpm, etc.>
- **CI status checks (required to merge):** CI, Security, Repo Standards, Gap Analysis Validate
- **IEC 62304 class:** <A | B | C | not applicable>

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
  - Examples: `gap/042-rosenbrock-solver`, `gap/118-aap-bright-futures`
- Commit footer: `Refs: GAP-NNN` (every commit on a gap branch)
- PR title: `GAP-NNN: <description>` (parser uses the prefix)

---

## Repo-specific notes

<!-- Replace this block with repo-specific guidance. Examples below. -->

### Active focus areas

- **<Area 1>**: <one-line summary, link to relevant gap>
- **<Area 2>**: <one-line summary, link to relevant gap>

### Things to know

- <Repo-specific convention 1: e.g. "All ODE solvers must include benchmarks against Hairer test suite">
- <Repo-specific convention 2: e.g. "Audit-event names must be added to docs/audit-events.md before use">
- <Toolchain quirk: e.g. "Julia ≥1.10 required; Project.toml is the source of truth">

### Files to read for orientation (besides gap-analysis files)

- `README.md`
- `<other key entry-point file>`
- `<architecture or design doc>`

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
