# Gap Analysis — Org Standard

> **Authoritative location:** `ruralpeds/.github/.gap-analysis/`
> **Last refreshed:** 2026-04-28
> **Owner:** Timothy Hartzog (@timothyhartzog)

A **living document system** for tracking feature gaps, architectural debt, and roadmap items across all `ruralpeds` repositories. Every gap is version-controlled, linked to code, and updates are auditable via git commit history.

**Single source of truth, distributed storage, standardized format, interface-agnostic access.**

## Why

- **Single source of truth** — no scattered Notion docs, Asana boards, or personal notes. Truth lives in git.
- **Audit trail** — every gap creation, status change, and completion is committed and auditable. Compliance-ready.
- **Cross-repo visibility** — one command shows all P0 gaps across the org.
- **Interface-agnostic** — works in Claude Desktop, Claude CLI, GitHub web UI, iOS (git clients + shortcuts).
- **Integrated with compliance** — auto-scanned weekly. Repos missing `.gap-analysis/` appear in compliance reports.
- **Offline-friendly** — no external database. Works in rural settings, unstable networks, air-gapped environments.

## File layout (every repo)

```
repo-root/
├── .gap-analysis/
│   ├── GAP_ANALYSIS.md     # the living document — version-controlled
│   ├── schema.md           # rules for this specific repo
│   ├── status.json         # auto-generated index — DO NOT commit
│   └── .gitignore          # ignores status.json
```

## Status enum (mandatory)

```
Not Started   Backlog   In Progress   Blocked   In Review   Completed   Archived
```

All gaps must be in one of these 7 states. No freestyle statuses. The validation workflow (`.github/workflows/gap-analysis-validate.yml`) enforces this on every push.

## Priority

```
P0 (Blocker)   blocks releases; security/compliance critical
P1 (Critical)  high impact; planned for next 1–3 months
P2 (High)      important; scheduled but not immediately urgent
P3 (Medium)    nice to have; lower priority
P4 (Low)       exploratory; maintenance; can defer indefinitely
```

P0/P1 gaps require an Owner and a Target Completion. Schema specifics live in `schema.md` of each repo.

## Required fields

```markdown
### GAP-NNN: [Feature name]
**Status**: [Not Started | Backlog | In Progress | Blocked | In Review | Completed | Archived]
**Priority**: [P0–P4]
**Owner**: [Name, email, or "[Unassigned]"]
**Target Completion**: [YYYY-MM-DD or "TBD"]

**Description**:
[What needs to be built and why.]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

**Related PRs**: [#N or "None"]
**Blocking Issues**: [#N or "None"]
**Blocked By**: [GAP-NNN or "None"]

**Last Status Update**: YYYY-MM-DD
- [Brief progress note.]
```

For Completed gaps, swap the heading to `### ✅ GAP-NNN: …` and replace the live fields with `Completed Date`, `PR`, and `Completion Notes`.

## Bootstrap a new repo (15 min)

```bash
cp -r ../.github/templates/gap-analysis .gap-analysis
# edit .gap-analysis/GAP_ANALYSIS.md — fill in your repo-specific gaps
git add .gap-analysis
git commit -m "docs: add gap analysis tracking (org standard)"
git push origin main
```

The two automation workflows then take over:

| Workflow | Trigger | What it does |
|---|---|---|
| `gap-analysis-validate.yml` | push/PR on `.gap-analysis/GAP_ANALYSIS.md` | Validates markdown syntax, status enum, gap-ID uniqueness |
| `gap-analysis-sync-index.yml` | merge to main on `.gap-analysis/` | Auto-generates `status.json` (do not commit) |
| `check-compliance.yml` | weekly Mon 07:00 UTC | Reports repos missing `.gap-analysis/` |

## Daily workflow (one-line summaries)

- **Start a gap:** change `Status: Backlog` → `In Progress`, update `Last Status Update`, commit.
- **Open a PR:** change `Status: In Progress` → `In Review`, add the PR number to `Related PRs`, commit.
- **Merge:** within one day, move the gap to `Completed Gaps`, fill `Completed Date` + `PR` + `Completion Notes`, commit.
- **Block a gap:** set `Status: Blocked`, populate `Blocked By`, leave a note in `Last Status Update`, commit.
- **Archive a gap:** move to `Archive` with a `Reason`, commit.

## Cross-repo queries

```bash
# All P0 gaps in the org
find ~/ruralpeds -name "GAP_ANALYSIS.md" -exec grep -l "P0 (Blocker)" {} \;

# Counts by status (all repos)
find ~/ruralpeds -name "status.json" -exec jq '.by_status' {} \; | jq -s 'add'

# Blocked gaps with no owner
find ~/ruralpeds -name "GAP_ANALYSIS.md" \
  -exec sh -c 'echo "=== {} ==="; grep -B2 "Owner.*Unassigned" "$1"' _ {} \;
```

## Gap analysis vs. GitHub Issues

| Aspect | Gap Analysis | GitHub Issues |
|---|---|---|
| Scope | Internal roadmap + architectural backlog | Bugs, feature requests, user-facing |
| Owner | Always assigned (P0/P1) | Optional |
| Audit trail | Git commits (immutable) | Editable / deletable |
| Cross-repo links | First-class via `Blocked By` | Harder (boards/projects) |
| Offline access | Yes | No |
| Compliance ready | Yes | Depends on export policy |

Use **issues** for bugs. Use **gaps** for roadmap.

## Templates

- `templates/gap-analysis/GAP_ANALYSIS.md` — clean starter with empty placeholders
- `templates/gap-analysis/schema.md` — repo-specific rules (cadence, ownership, naming, examples)
- `templates/gap-analysis/.gitignore` — ignores `status.json`

## Archived materials

The prior `docs/GAP_ANALYSIS_STANDARDS.md` and `docs/GAP_ANALYSIS_QUICK_REFERENCE.md` were folded into this README on 2026-04-28 and archived under [`docs/archive/2026-04-gap-analysis/`](../docs/archive/2026-04-gap-analysis/) for historical reference. During the May 2026 build/gap consolidation, duplicate working copies were removed from `docs/` and archived under [`docs/archive/2026-05-build-gap-analysis/`](../docs/archive/2026-05-build-gap-analysis/).

## Contact

- **System owner:** Timothy Hartzog (@timothyhartzog)
- **Escalation:** open an issue in `ruralpeds/.github` tagged `gap-analysis`
