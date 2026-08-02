# Suggestions Queue for `ruralpeds/.github`

> Proposed gaps awaiting triage.
> Coding agents (Claude Code, Copilot) **append** here. Do not add directly to `GAP_ANALYSIS.md`.
> Triage moves an entry to `GAP_ANALYSIS.md` as a new `GAP-NNN` (status: Backlog) and removes it from this file.
> Format spec: [`CLAUDE_CODE_GAP_PROTOCOL.md` §4](https://github.com/ruralpeds/.github/blob/main/docs/CLAUDE_CODE_GAP_PROTOCOL.md#4-suggestionsmd-entry-format).

---

## How to triage

1. Read the entry. Decide: gap, decline, or merge into existing gap.
2. If accept → copy into `GAP_ANALYSIS.md` as the next `GAP-NNN`, set Status to `Backlog`. Adjust priority if needed.
3. Either remove the entry from this file or move it to the **Triaged** section below with a one-line decision note.
4. Commit with message: `chore(gap-analysis): triage sug-XXXX → GAP-NNN`. The lifecycle workflow detects this and emits a `suggestion_promoted` ledger event.

---

## Pending Triage

<!--
Entries appear here in newest-first order. Use the format below.
Each entry must have a unique sug-ID: sug-YYYY-MM-DD-{author}-{NNN}
-->

<!-- (none yet) -->

---

## Triaged (last 30 days)

<!--
After triage, optionally move the entry here with a one-line decision note.
Quarterly cleanup removes entries older than 90 days.
-->

## sug-2026-05-04-copilot-002
**Decision:** Promoted to `GAP-014` on 2026-05-04.

## sug-2026-05-04-copilot-001
**Decision:** Promoted to `GAP-013` on 2026-05-04.

---

## Example entry (delete this once you have real entries)

> ### sug-2026-04-28-claude-001
> **Proposed by:** Claude Code (session 2026-04-28 14:00)
> **During work on:** GAP-042
> **Category:** Discovered During Work
>
> **Title:** Add ODE event detection (root-finding) to sci-ode
>
> **Rationale:**
> While implementing Rosenbrock34, noticed sci-ode has no event/root-finding API. This blocks any clinical simulation needing dose-event triggering. Hairer chapter II.6 describes the standard approach; SciPy's `solve_ivp(events=...)` is a useful API model.
>
> **Proposed priority:** P1 (Critical) — blocks clinical-sim API (GAP-019).
> **Estimated effort:** ~2 weeks
> **Related gaps:** GAP-042 (parent), GAP-019 (clinical-sim API depends on this)
> **Files likely touched:** `crates/sci-ode/src/events.rs`, `crates/sci-ode/tests/events.rs`
>
> **Status:** Pending triage
