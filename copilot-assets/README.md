# copilot-assets/

Canonical source-of-truth for GitHub Copilot assets that propagate to other repositories. These files **do not auto-inherit** from this `.github` repo the way community health files do — GitHub only inherits things like `CONTRIBUTING.md`, `ISSUE_TEMPLATE/`, and a few others automatically. `copilot-instructions.md`, `.github/instructions/*`, and `.github/prompts/*` must be present in each repo that wants them.

The `.github/workflows/sync-copilot-assets.yml` workflow in this central repo reads these files and opens a PR against each target repo listed in `.github/copilot-assets-targets.json` whenever any of them changes (or weekly on a schedule as a catch-up).

## Layout

```
copilot-assets/
└── project-docs-automation/
    ├── copilot-instructions.md                         # repo-wide Copilot context
    ├── instructions/
    │   └── project-docs-scripts.instructions.md        # path-specific rules
    └── prompts/
        ├── install-project-docs.prompt.md
        ├── customize-project-docs.prompt.md
        ├── debug-project-docs.prompt.md
        └── add-project-to-registry.prompt.md
```

## How sync works

1. The `sync-copilot-assets.yml` workflow runs on push to `copilot-assets/**`, weekly on a schedule, or manually via `workflow_dispatch`.
2. For each target repo in the matrix, it clones the target, copies the canonical files into place (merging `copilot-instructions.md` under a `## Project Documentation Automation` section if the target already has its own primary content), commits to a fresh branch, and opens a PR via `gh pr create`.
3. The owner reviews and merges on each target repo.

## Opting out

**Per-file opt-out:** add the marker `<!-- AUTO-SYNC-OPT-OUT -->` anywhere in the target file. The sync script checks for this string before overwriting; if present, it leaves the file alone.

**Per-repo opt-out:** remove the repo from the `matrix.target` list in `.github/workflows/sync-copilot-assets.yml` and from `.github/copilot-assets-targets.json`.

## Requirements

- Repo secret **`SYNC_PAT`** — a fine-grained PAT with `contents:write` and `pull-requests:write` on all the listed target repos. The default `GITHUB_TOKEN` can't push to other repos, so this is mandatory.
- `gh` CLI is pre-installed on GitHub-hosted runners, so no extra setup needed for PR creation.

## Why not use reusable workflows or org-level instructions?

- **Org-level Copilot instructions** (Settings → Copilot → Custom instructions) are only available to organization accounts. This is a user account, so that feature doesn't apply.
- **Reusable workflows** (`workflow_call`) could centralize the *execution* of `update-project-docs.yml`, but each target repo would still need a tiny stub to invoke it. The sync approach is simpler: one source of truth for all the Copilot context, and the actual workflow execution happens where the checkout already exists.
- **`.github/copilot-instructions.md` in a `.github` repo** does not auto-inherit to other repos — this is an [open GitHub feature request](https://github.com/orgs/community/discussions/184134), not working behavior.
