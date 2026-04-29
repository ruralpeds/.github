# Claude Code Gap Analysis Protocol

**Status:** Mandatory contract for all coding agents (Claude Code, Copilot, Codex, Cursor) operating in `ruralpeds` repositories.
**Version:** v1.0 (2026-04-28)
**Companion to:** `GAP_ANALYSIS_LIFECYCLE.md`

---

## 0. TL;DR for Claude

```
On entering any ruralpeds repo:
  1. cat .gap-analysis/CLAUDE.md          ← read this first
  2. cat .gap-analysis/GAP_ANALYSIS.md    ← know the active gaps
  3. cat .gap-analysis/SUGGESTIONS.md     ← know what's been proposed but not yet picked up

Before writing any code:
  - If working on an existing gap: branch as gap/NNN-slug
  - If proposing new work:         append to SUGGESTIONS.md, do NOT add to GAP_ANALYSIS.md

While working:
  - Every commit footer:  Refs: GAP-NNN
  - PR title:             GAP-NNN: <description>

After every session:
  - If new gaps spotted:  append to SUGGESTIONS.md (one entry per gap)
  - Never edit:           build-ledger.jsonl, status.json (workflows own these)
```

---

## 1. The five files Claude touches

| File | Read | Write |
|---|---|---|
| `.gap-analysis/CLAUDE.md` | **Always, first** | Never |
| `.gap-analysis/GAP_ANALYSIS.md` | Always, second | Only when triaging or recording status updates that workflows can't (e.g. `Blocked`, `Archived`) |
| `.gap-analysis/SUGGESTIONS.md` | Always, third | **Append-only**, structured entries |
| `.gap-analysis/schema.md` | When unclear about repo-specific rules | Never (changes go through PR review) |
| `.gap-analysis/build-ledger.jsonl` | When auditing | **Never** (workflow-owned) |
| `.gap-analysis/status.json` | When summarizing org state | **Never** (workflow-owned) |

Two files Claude **never** writes by hand: `build-ledger.jsonl` and `status.json`. They are produced by the org-level reusable workflow. A pre-commit hook rejects manual edits.

---

## 2. The session protocol

### 2.1 Session start

```
[Claude opens repo]
  ↓
  Step 1: Read .gap-analysis/CLAUDE.md
          (per-repo instructions: which gaps are active, special conventions)
  ↓
  Step 2: Read .gap-analysis/GAP_ANALYSIS.md
          (the current state; do not re-summarize unless asked)
  ↓
  Step 3: Read .gap-analysis/SUGGESTIONS.md
          (so Claude doesn't double-propose what's already there)
  ↓
  Step 4: Acknowledge the user's request and map it to:
            (a) An existing GAP-NNN  →  branch gap/NNN-slug
            (b) An existing suggestion → confirm with user, then promote to a gap before branching
            (c) Something new        →  append to SUGGESTIONS.md and ask user to triage
            (d) Out of scope         →  say so; do not start work
```

### 2.2 During work

- **Branch:** `git checkout -b gap/NNN-short-slug`. The branch name is what the workflow uses to flip the gap to `In Progress`. Get this right.
- **Commits:** Every commit message ends with `Refs: GAP-NNN`. Multi-gap PRs are discouraged; if unavoidable, use `Refs: GAP-NNN, GAP-MMM`.
- **Touching files outside the gap's stated `files-to-touch`:** stop and explain. Either narrow the scope or open a follow-up suggestion.

### 2.3 Session end

If the work surfaced new gaps (almost always does), append them to `SUGGESTIONS.md` using the format in §4. **Do not** edit `GAP_ANALYSIS.md` to add them. Triage is a human decision (or a separate explicit triage session).

---

## 3. What Claude is allowed to write to `GAP_ANALYSIS.md`

**Allowed:**

- Updating the `**Last Status Update**:` date and adding a status-update bullet for an existing gap
- Setting status to `Blocked` with a documented reason (workflows can't infer this)
- Adding `Implementation Notes` as work progresses
- Marking acceptance-criteria checkboxes when criteria are demonstrably met (commit + test reference)

**Disallowed (workflow-owned):**

- Setting status to `In Progress` (the branch-opened workflow does this)
- Setting status to `In Review` (the PR-opened workflow does this)
- Setting status to `Completed` (the PR-merged workflow does this)
- Adding new `### GAP-NNN:` headers (humans triage from `SUGGESTIONS.md`)

If Claude tries to do a workflow-owned mutation, the validate workflow will catch it on PR (the `from`/`to` won't match the ledger event sequence).

---

## 4. SUGGESTIONS.md entry format

```markdown
## sug-YYYY-MM-DD-claude-NNN
**Proposed by:** Claude Code (session YYYY-MM-DD HH:MM)
**During work on:** GAP-NNN  (or "exploratory" if not tied to a gap)
**Category:** Discovered During Work | Audit Finding | User Request | Compliance | Technical Debt | Research

**Title:** <one-line title>

**Rationale:**
<2–6 sentences explaining why this should become a gap. Be specific. Cite file paths or PR numbers.>

**Proposed priority:** P0 | P1 | P2 | P3 | P4 (with one-line justification)
**Estimated effort:** <small | medium | large> (or hours/days/weeks)
**Related gaps:** GAP-NNN (parent), GAP-MMM (depends-on), etc.
**Files likely touched:** src/foo.rs, tests/foo_test.rs

**Status:** Pending triage
```

The suggestion ID format is `sug-YYYY-MM-DD-{author}-{NNN}` where `{author}` is `claude`, `copilot`, `human`, etc. and `{NNN}` is a per-day counter. The bootstrap workflow does not enforce this; it's a convention.

---

## 5. When Claude proposes priorities

Be honest. Don't inflate priorities to make the work feel more urgent.

| If you'd say | Use |
|---|---|
| "this blocks a release scheduled this month" | P0 |
| "this is blocking a 1–3 month roadmap item" | P1 |
| "this is on the roadmap but flexible" | P2 |
| "this would be nice and we'd do it eventually" | P3 |
| "this is a research direction" | P4 |

If unsure, use P3. The triage step will adjust.

---

## 6. Multi-gap PRs

Discouraged. If unavoidable, the PR title takes the *primary* gap (`GAP-042: ...`) and the body lists the others (`Also closes: GAP-118, GAP-119`). The workflow's PR parser picks up all referenced gaps and updates each.

Mixing gap work with non-gap work in the same PR is **not allowed**. Non-gap work needs its own gap (or its own suggestion → triage → gap path).

---

## 7. Branch hygiene

- Cut from `main`. Do not chain gap branches off other gap branches unless `Blocked By` explicitly documents it.
- One gap per branch. If you discover the work needs to split, close the current branch's PR as draft and open a new gap (via `SUGGESTIONS.md`).
- Stale gap branches (no commits in 14 days, no merged PR) are flagged by the audit workflow and a comment is posted to the gap's status section.

---

## 8. Conflicts with workflow-set values

If a workflow set `Status: In Progress` after your branch was created, and you locally edit it back to `Backlog`, the validate workflow will reject the PR. **Don't fight the workflow.** If you genuinely need to revert a status, document it in `SUGGESTIONS.md` and let a human decide.

---

## 9. Claude's per-repo `CLAUDE.md`

Every repo has a `.gap-analysis/CLAUDE.md` (also a top-level `CLAUDE.md` may exist; the gap-analysis one is scoped to gap work). It contains:

- The repo's primary language and toolchain
- The repo-specific gap conventions from `schema.md`
- A pointer to the org-level `GAP_ANALYSIS_LIFECYCLE.md`
- A short list of `Known Active Areas` so Claude knows where the energy is

Keep this file up to date. Stale `CLAUDE.md` is the most common source of agent confusion.

---

## 10. What success looks like

In a steady-state repo:

- A user asks Claude to do something
- Claude reads the three gap files
- Claude either picks up an existing `Backlog` gap, promotes a triaged suggestion, or proposes a new suggestion and asks for confirmation
- Claude branches as `gap/NNN-slug`, commits, opens a PR titled `GAP-NNN: ...`
- The workflows handle every status transition; Claude never has to edit status fields
- The PR merges; the gap moves to `Completed`; the ledger has a clean event chain
- Any new gaps that surfaced are sitting in `SUGGESTIONS.md` ready for triage

If a session ends without a single edit to `GAP_ANALYSIS.md` from Claude, that's a sign the system is working.

---

## 11. Anti-patterns (don't do these)

- ❌ Adding a new `### GAP-NNN:` block during a coding session (use `SUGGESTIONS.md`)
- ❌ Editing `build-ledger.jsonl` or `status.json` directly
- ❌ Branch named `feature/foo` or `fix-bug` (must be `gap/NNN-slug`)
- ❌ Commit footer missing `Refs: GAP-NNN`
- ❌ PR title missing the `GAP-NNN:` prefix
- ❌ Marking acceptance criteria checked when tests don't actually pass
- ❌ Setting `Status: Completed` to "save the workflow some work" — the workflow IS the source of truth for that transition
