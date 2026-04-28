# Gap Analysis Lifecycle Standard

**Status:** Mandatory for all `ruralpeds` repositories
**Owner:** Timothy Hartzog (@timothyhartzog)
**Version:** v1.0 (2026-04-28)
**Supersedes:** `docs/archive/2026-04-gap-analysis/GAP_ANALYSIS_STANDARDS.md`

---

## 1. Purpose

A single, identical gap-analysis-and-build cycle for every repository in the `ruralpeds` org. The cycle is enforced by org-level reusable workflows so that updating the standard once updates all ~68 repos at the next workflow run.

**Goals:**

1. One living document per repo (`.gap-analysis/GAP_ANALYSIS.md`) that is **continuously** updated as work moves through branches and PRs.
2. Every state transition produces a machine-readable event in an append-only ledger.
3. Claude Code (and any other coding agent) reads this file first on every session and proposes additions through a structured back-channel.
4. The cycle is identical in every repo. There is no "but this repo does it differently."

---

## 2. The cycle

```
       ┌──────────────────────────────────────────────────────────────┐
       │                                                              │
       │   ┌────────────┐   triage    ┌──────────┐                    │
       │   │ SUGGESTIONS├────────────►│  Backlog │                    │
       │   │    .md     │             │ in       │                    │
       │   └────────────┘             │ GAP_ANAL │                    │
       │         ▲                    └────┬─────┘                    │
       │         │                         │                          │
       │  Claude appends                   │ git checkout -b          │
       │  during work                      │   gap/NNN-slug           │
       │         │                         ▼                          │
       │         │                    ┌────────────┐                  │
       │         │                    │ In Progress│                  │
       │         │                    └────┬───────┘                  │
       │         │                         │                          │
       │         │                         │ open PR titled           │
       │         │                         │   "GAP-NNN: ..."         │
       │         │                         ▼                          │
       │         │                    ┌────────────┐                  │
       │         │                    │ In Review  │                  │
       │         │                    └────┬───────┘                  │
       │         │                         │                          │
       │         │                         │ merge to main            │
       │         │                         ▼                          │
       │         │                    ┌────────────┐                  │
       │         │                    │ Completed  │                  │
       │         │                    └────────────┘                  │
       │         │                                                    │
       └─────────┴────────────────────────────────────────────────────┘
                Claude or human spots new gap during the work
```

Each transition writes one event line to `.gap-analysis/build-ledger.jsonl`.

---

## 3. Per-repo file layout (identical, every repo)

```
<repo-root>/
└── .gap-analysis/
    ├── GAP_ANALYSIS.md       # Living human-edited doc; workflows mutate status fields only
    ├── SUGGESTIONS.md        # Claude/agents append here; humans triage to GAP_ANALYSIS.md
    ├── CLAUDE.md             # Per-repo contract for coding agents (read first, write here)
    ├── schema.md             # Repo-specific overrides; references this standard
    ├── build-ledger.jsonl    # Append-only event log; machine-written
    ├── status.json           # Auto-generated index; machine-written
    └── .gitignore            # Ignores nothing today; placeholder for future caches
```

**No exceptions.** A repo without these files is non-compliant and shows up in the org-dashboard report.

---

## 4. Status enum (mandatory)

| Status | Meaning | Set by |
|---|---|---|
| `Not Started` | Listed but not yet planned | Human |
| `Backlog` | Planned but not yet picked up | Human |
| `In Progress` | A `gap/NNN-...` branch exists | **Workflow** (on branch creation) |
| `In Review` | A PR referencing `GAP-NNN` is open | **Workflow** (on PR open) |
| `Blocked` | Waiting on a documented dependency | Human |
| `Completed` | PR merged to main | **Workflow** (on merge) |
| `Archived` | Decided not to do; reason recorded | Human |

Free-text statuses are rejected by `gap-analysis-validate.yml`.

---

## 5. Priority enum (mandatory)

| Priority | Definition | Required for compliance |
|---|---|---|
| `P0 (Blocker)` | Blocks releases, fails compliance, breaks features | Owner + target date ≤ 30 days |
| `P1 (Critical)` | High impact; planned in next 1–3 months | Owner + target date ≤ 90 days |
| `P2 (High)` | Important; on the roadmap | Owner recommended |
| `P3 (Medium)` | Backlog; will happen eventually | None |
| `P4 (Low)` | Exploratory; may never happen | None |

---

## 6. Naming conventions (enforced by workflows)

### 6.1 Gap IDs

`GAP-NNN`, zero-padded, per-repo numbering, three digits.

`GAP-042` not `GAP-42`. `GAP-1042` only after sustained heavy use; never `GAP-cardiology` or other free-text suffixes.

### 6.2 Branch names

`gap/NNN-short-kebab-slug`

Examples:

```
gap/042-rosenbrock-solver
gap/007-fhir-feasibility-fix
gap/118-aap-bright-futures-coverage
```

Variants the workflow also accepts:

```
gap/NNN-slug-claude        ← agent-authored
gap/NNN-slug-followup      ← follow-up to a previously merged gap
```

### 6.3 Commit footers

Every commit in a `gap/NNN-...` branch must include this line in the footer:

```
Refs: GAP-NNN
```

### 6.4 PR titles

PR title must start with `GAP-NNN:` so the workflow can extract the ID without parsing the body.

```
GAP-042: Rosenbrock34 implicit solver for medium-stiff ODEs
```

PRs whose title doesn't match are flagged by the validate workflow but not blocked (a follow-up `edited` event lets the workflow re-link).

---

## 7. Event ledger (`build-ledger.jsonl`)

Append-only NDJSON. One line per event. **Workflows write only.** Humans never edit this file (a CI check rejects manual edits via diff).

### 7.1 Event types

```jsonc
// Branch created from main
{"ts":"2026-04-28T14:01:33Z","event":"branch_opened","gap":"GAP-042","branch":"gap/042-rosenbrock-solver","actor":"timothyhartzog","sha":"a1b2c3d"}

// PR opened referencing the gap
{"ts":"2026-04-29T11:14:02Z","event":"pr_opened","gap":"GAP-042","branch":"gap/042-rosenbrock-solver","pr":1234,"actor":"timothyhartzog"}

// Status changed by workflow (for audit trail)
{"ts":"2026-04-29T11:14:03Z","event":"status_changed","gap":"GAP-042","from":"In Progress","to":"In Review","trigger":"pr_opened","pr":1234}

// PR merged
{"ts":"2026-05-02T16:08:11Z","event":"pr_merged","gap":"GAP-042","pr":1234,"merge_sha":"e4f5a6b","actor":"timothyhartzog"}

// Status changed to Completed
{"ts":"2026-05-02T16:08:12Z","event":"status_changed","gap":"GAP-042","from":"In Review","to":"Completed","trigger":"pr_merged","pr":1234}

// Suggestion promoted to gap
{"ts":"2026-05-03T09:00:00Z","event":"suggestion_promoted","gap":"GAP-119","from_suggestion":"sug-2026-05-02-claude-001","actor":"timothyhartzog"}
```

### 7.2 Schema

| Field | Type | Required | Notes |
|---|---|---|---|
| `ts` | RFC3339 string | yes | UTC; emitted by the workflow |
| `event` | enum | yes | one of: `branch_opened`, `pr_opened`, `pr_edited`, `pr_merged`, `pr_closed_unmerged`, `status_changed`, `suggestion_appended`, `suggestion_promoted`, `gap_archived`, `audit_drift_detected` |
| `gap` | string | yes (except for some suggestion events) | `GAP-NNN` |
| `actor` | string | yes | GitHub login |
| Other fields | string/int | varies | event-dependent |

The audit script (`scripts/gap_lifecycle.py audit`) replays the ledger and verifies the resulting state matches `GAP_ANALYSIS.md` and the git branch/PR history. Drift produces a `audit_drift_detected` event and a CI failure.

---

## 8. Suggestions back-channel (`SUGGESTIONS.md`)

Where Claude Code (and humans) put **proposed** gaps without polluting `GAP_ANALYSIS.md`.

### 8.1 Format

```markdown
## sug-2026-05-02-claude-001
**Proposed by:** Claude Code (session 2026-05-02 14:00)
**During work on:** GAP-042
**Category:** Discovered During Work

**Title:** Add ODE event detection (root-finding) to sci-ode

**Rationale:**
While implementing Rosenbrock34, I noticed sci-ode has no event/root-finding API. This blocks any clinical simulation needing dose-event triggering.

**Proposed priority:** P1 (Critical)
**Estimated effort:** 2 weeks
**Related:** GAP-042 (parent), GAP-019 (clinical sim API)

**Status:** Pending triage
```

### 8.2 Triage

A human (or Claude Code in a triage session) moves an entry to `GAP_ANALYSIS.md` as a new `GAP-NNN` with `Status: Backlog`. The workflow then writes a `suggestion_promoted` ledger event and removes the entry from `SUGGESTIONS.md`.

Categories:

- `Discovered During Work` — found while working on another gap
- `Audit Finding` — surfaced by an automated audit
- `User Request` — feature request
- `Compliance` — required for IEC 62304/21 CFR Part 11/HIPAA/etc.
- `Technical Debt` — refactor/cleanup
- `Research` — exploratory; may not become a gap

---

## 9. The four workflows (every repo gets these)

### 9.1 `gap-analysis-validate.yml` *(exists)*

Runs on PR. Validates structure, IDs, statuses, priorities, P0/P1 ownership. **Unchanged.**

### 9.2 `gap-analysis-sync-index.yml` *(exists)*

Runs on push to `main`. Regenerates `status.json`. **Unchanged.**

### 9.3 `gap-analysis-lifecycle.yml` *(NEW — required addition)*

Single per-repo caller. Triggers on:

- `create` (branch creation) → calls reusable with `event=branch_opened`
- `pull_request` `[opened, edited, reopened]` → calls reusable with `event=pr_opened` or `pr_edited`
- `pull_request` `[closed]` (merged or not) → calls reusable with `event=pr_merged` or `pr_closed_unmerged`

Calls `ruralpeds/.github/.github/workflows/reusable-gap-analysis.yml@main`.

### 9.4 `gap-analysis-audit.yml` *(NEW — scheduled)*

Weekly cron. Calls `reusable-gap-analysis.yml` with `event=audit`. Replays the ledger, verifies consistency, opens an issue if drift found.

---

## 10. The reusable workflow

`ruralpeds/.github/.github/workflows/reusable-gap-analysis.yml`

A single workflow that all 68 repos call. Switches on `inputs.event` and dispatches to the appropriate Python helper command. Updates `GAP_ANALYSIS.md`, appends to `build-ledger.jsonl`, regenerates `status.json`, commits with `[skip ci]`, and pushes back to the branch.

**Inputs:**

```yaml
inputs:
  event:
    type: string
    required: true
    description: branch_opened|pr_opened|pr_edited|pr_merged|pr_closed_unmerged|audit
  gap_id:
    type: string
    description: Optional override; usually parsed from branch/PR
  pr_number:
    type: number
    description: PR number when applicable
  branch_ref:
    type: string
    description: Branch ref when applicable
```

All work is done by `scripts/gap_lifecycle.py` from `ruralpeds/.github`. Repos do not duplicate logic.

---

## 11. The Python helper (`scripts/gap_lifecycle.py`)

Single CLI with subcommands:

```bash
gap_lifecycle.py parse     <gap-analysis-md>          # → JSON of all gaps
gap_lifecycle.py advance   --gap GAP-042 --to "In Progress" --trigger branch_opened --branch gap/042-rosenbrock
gap_lifecycle.py link-pr   --gap GAP-042 --pr 1234
gap_lifecycle.py complete  --gap GAP-042 --pr 1234 --merge-sha e4f5a6b
gap_lifecycle.py audit     --repo .                   # ledger ↔ doc ↔ git history
gap_lifecycle.py promote   --suggestion sug-2026-05-02-claude-001 --new-gap GAP-119
gap_lifecycle.py extract-id --branch gap/042-rosenbrock-solver  # → "GAP-042"
gap_lifecycle.py extract-id --pr-title "GAP-042: ..."           # → "GAP-042"
```

All commands are idempotent. Workflows can re-run safely.

---

## 12. Claude Code contract

See `docs/CLAUDE_CODE_GAP_PROTOCOL.md` for the full contract. Summary:

1. **First action in every repo:** read `.gap-analysis/GAP_ANALYSIS.md`, `.gap-analysis/CLAUDE.md`, and `.gap-analysis/SUGGESTIONS.md`.
2. **If working on an existing gap:** create branch `gap/NNN-slug`. Include `Refs: GAP-NNN` in every commit footer. Title the PR `GAP-NNN: ...`.
3. **If proposing new work:** append a structured entry to `.gap-analysis/SUGGESTIONS.md`. Do **not** create a new `GAP-NNN` directly.
4. **At end of session:** if any new gaps were spotted during the work, append them to `SUGGESTIONS.md`.
5. **Never edit:** `build-ledger.jsonl` or `status.json` (workflows own these).

---

## 13. Rollout (org-wide)

Run `scripts/bootstrap_gap_analysis.py` from `ruralpeds/.github`:

```bash
python scripts/bootstrap_gap_analysis.py \
  --org ruralpeds \
  --repos-file repos.txt \
  --workspace ~/repo-cleanup/workspace
```

For each repo, the script:

1. Clones the repo
2. Adds `.gap-analysis/` directory with templates if missing
3. Adds `.github/workflows/gap-analysis-lifecycle.yml` (caller)
4. Adds `.github/workflows/gap-analysis-audit.yml` (scheduled caller)
5. Ensures `gap-analysis-validate.yml` and `gap-analysis-sync-index.yml` are present
6. Commits to a `bootstrap/gap-analysis-v1` branch and opens a PR

All 68 repos converge to the same cycle.

---

## 14. Compliance reporting

The org-dashboard workflow reads `status.json` from every repo and produces a single dashboard:

- Total gaps by status across the org
- P0/P1 gaps without owners
- Repos with stale gaps (no update in >2 weeks)
- Repos missing `.gap-analysis/`
- Audit drift events in the past week

Published to `ruralpeds/.github/dashboard/` on a daily schedule.

---

## 15. Versioning

This standard is versioned (v1.0 today). Changes go through a normal PR. Bumping the major version triggers an org-wide rollout via `bootstrap_gap_analysis.py --upgrade`.

---

## 16. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-04-28 | v1.0 | Initial standardized lifecycle | Timothy Hartzog |
