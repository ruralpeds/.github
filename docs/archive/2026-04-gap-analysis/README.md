# Archived: Gap Analysis Materials (2026-04-23 baseline)

Archived 2026-04-28 as part of a refresh that produced:

- `docs/WORKFLOW_CATALOG.md` — authoritative catalog of all `.github/workflows/`
- `.gap-analysis/GAP_ANALYSIS.md` — current gap analysis for `ruralpeds/.github`

## What was archived

| File (in this folder) | Original location | Reason |
|---|---|---|
| `GAP_ANALYSIS_STANDARDS.md` | `docs/GAP_ANALYSIS_STANDARDS.md` | Superseded — content folded into `.gap-analysis/README.md` and the new gap analysis. Standard itself remains valid; restore if a fresh standalone copy is needed. |
| `GAP_ANALYSIS_QUICK_REFERENCE.md` | `docs/GAP_ANALYSIS_QUICK_REFERENCE.md` | Cheat sheet — kept for historical reference. Daily commands now live in `.gap-analysis/README.md`. |
| `GAP_ANALYSIS_template-example.md` | `templates/gap-analysis/GAP_ANALYSIS.md` | Old example data (rust-sci-core fictional gaps). The template directory is now empty pending a refreshed minimal template. |

## Why archive (not delete)

- Preserves the schema and worked examples for repos still bootstrapping `.gap-analysis/`.
- Maintains audit-log continuity: prior commits referenced these paths.
- Keeps a clean diff between the old standard and the next iteration.

## Restoring

```bash
git mv docs/archive/2026-04-gap-analysis/GAP_ANALYSIS_STANDARDS.md docs/
git mv docs/archive/2026-04-gap-analysis/GAP_ANALYSIS_QUICK_REFERENCE.md docs/
git mv docs/archive/2026-04-gap-analysis/GAP_ANALYSIS_template-example.md templates/gap-analysis/GAP_ANALYSIS.md
```
