# Build Management Template

Drop-in scaffold that gives every downstream repo a **single, always-current
view of what has been built and what still needs to be built**, joined to the
existing `.gap-analysis/` lifecycle.

## What you get

```
BUILD.md                                  # Human view (auto-generated, do not edit)
.build/
  manifest.yaml                           # Source of truth (machine-readable)
  schema.json                             # JSON Schema for manifest.yaml
.github/workflows/
  build-md-render.yml                     # Regenerate BUILD.md on every change
  reusable-build-manifest.yml             # Flip features to "built" on CI pass
  gap-analysis-request.yml                # Order a gap analysis (workflow_dispatch)
```

## Concepts

| Artifact | Owner | Edited by | Purpose |
|---|---|---|---|
| `.build/manifest.yaml` | repo maintainers + automation | humans add features; bots flip status | Truth |
| `BUILD.md` | automation only | regenerated from manifest | Human view |
| `.gap-analysis/GAP_ANALYSIS.md` | automation + humans | gap remediation tracking | Cross-references via `gap_ref` |
| `.gap-analysis/build-ledger.jsonl` | automation only | append-only event log | Audit |

## Feature lifecycle

```
planned ──▶ approved ──▶ building ──▶ built
                  │
                  └──▶ blocked
```

Transitions:

- **planned → approved**: PR merged that adds the feature to manifest.yaml
- **approved → building**: branch `feat/FEAT-NNN-*` opened, or label `feature:FEAT-NNN`
- **building → built**: CI passes on the PR (`reusable-build-manifest.yml`)
- **\* → blocked**: human edit referencing a `GAP-NNN` blocker

## Ordering a gap analysis

Run the **Gap Analysis Request** workflow from the Actions tab (or comment
`/gap-analysis` on an issue). It diffs `BUILD.md` against the repo's roadmap
docs and opens a PR that:

1. Adds proposed `GAP-NNN` entries to `.gap-analysis/GAP_ANALYSIS.md`
2. Adds proposed features to `.build/manifest.yaml` (status: `planned`)
3. Tags reviewers in `CODEOWNERS`

**Approval = merge.** A post-merge job promotes the new features to `approved`
and regenerates `BUILD.md`.

## Installing into a repo

```bash
# From the consumer repo root:
curl -fsSL https://raw.githubusercontent.com/ruralpeds/.github/main/scripts/install-build-management.sh | bash
```

Or manually:

```bash
cp -r ../.github/templates/build-management/.build .
cp ../.github/templates/build-management/BUILD.template.md BUILD.md
cp ../.github/templates/build-management/workflows/*.yml .github/workflows/
```

Then commit, open a PR, and let `build-md-render.yml` regenerate `BUILD.md` on
the next push.
