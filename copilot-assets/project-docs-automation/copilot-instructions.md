# GitHub Copilot instructions — Project Documentation Automation

This repository uses an automated documentation refresh workflow driven by `.github/workflows/update-project-docs.yml`. The workflow runs on a schedule, detects which sub-projects have had recent commits, and regenerates `README.md` status blocks and full `STATUS.md` files for those projects. When helping with this repository, keep the following in mind.

## What the system does

On each run the workflow:

1. Resolves a **cutoff timestamp** via `.github/scripts/determine_cutoff.py`. Order: manual `window_hours` input → `created_at` of the last successful run of this same workflow → fallback of 24 hours ago.
2. Identifies **projects** via `.github/scripts/detect_active_projects.py`. A project is any directory containing a recognized manifest (`Cargo.toml`, `pyproject.toml`, `Project.toml`, `package.json`, `go.mod`, etc.) or a `.project-marker` sentinel file. An explicit `.github/project-registry.json` file overrides auto-discovery.
3. For each **active** project (commits in the window), regenerates `<project>/STATUS.md`, updates the `<!-- AUTO-STATUS:START -->` / `<!-- AUTO-STATUS:END -->` block inside `<project>/README.md`, and writes a `<project>/.doc-meta.json` sidecar, via `.github/scripts/update_project_docs.py`.
4. Updates a **root-level dashboard** inside the `<!-- AUTO-PROJECTS:START -->` / `<!-- AUTO-PROJECTS:END -->` block of the repo's top-level `README.md`.
5. Commits all changes as `github-actions[bot]` with `[skip ci]` in the message.

## Files that are load-bearing

Do not rename, move, or delete these without updating all references:

- `.github/workflows/update-project-docs.yml` — the workflow
- `.github/scripts/determine_cutoff.py`
- `.github/scripts/detect_active_projects.py`
- `.github/scripts/update_project_docs.py`
- `.github/scripts/write_summary.py`
- `.github/scripts/requirements.txt`

The HTML-comment markers (`AUTO-STATUS:*` and `AUTO-PROJECTS:*`) are string-matched in `update_project_docs.py`. If you change one, change both.

## Conventions when editing the scripts

- All scripts target **Python 3.12** and must stay **standard-library-first**. The only allowed external dependency is `requests`, pinned in `.github/scripts/requirements.txt`. Don't add `gitpython`, `pygit2`, or anything that needs to compile.
- Scripts communicate with the workflow by **appending to `$GITHUB_OUTPUT`**, not by shelling out through stdout redirection. When `$GITHUB_OUTPUT` is unset (local dev), fall back to plain stdout `key=value`.
- Each script must **tolerate a missing or malformed input** and emit an Actions annotation (`::warning::` / `::error::`) rather than crashing the whole run. A single bad project should not sink the workflow.
- Use `subprocess.run([...], capture_output=True, text=True, check=False)` for git calls — never shell strings, never `check=True`.
- Preserve the three-level cutoff cascade in `determine_cutoff.py`: manual override → last successful run (via GitHub API) → 24-hour fallback. This is the contract that lets us skip a day without losing activity.
- Preserve the "nested projects are not double-counted" rule in `detect_active_projects.py`: once a directory is identified as a project, the walker does not recurse into it.
- Keep the README block-merge logic **idempotent**. Running the workflow twice in a row must not produce different content on the second run (beyond the refreshed timestamp).

## Conventions for the workflow YAML

- Keep `permissions:` minimal: `contents: write` for the commit, `actions: read` for the last-run query. Do not add `pull-requests: write` unless we switch to PR-based delivery.
- Keep the `concurrency:` group to prevent overlapping runs from stepping on each other's commits.
- The commit message always includes the cutoff ISO timestamp, the cutoff source, and a link back to the triggering run.
- The `[skip ci]` tag is belt-and-suspenders — the workflow doesn't trigger on `push`, but leave the tag in place in case we add that trigger later.

## Don't suggest

- **Don't** add a `push` trigger to the workflow. It would create feedback loops with its own commits.
- **Don't** switch to `actions/checkout@v3` or older. Stay on `v4`.
- **Don't** hard-code the list of projects in the scripts. Use either auto-discovery or `.github/project-registry.json`.
- **Don't** add `git push --force` anywhere. The bot should fast-forward or do nothing.
- **Don't** include secrets or tokens in commit messages, logs, or the job summary.

## When asked to add a new feature

If the user asks for a feature that would change the commit behavior, the detection heuristics, or the rendered output, propose the change in three layers in this order:

1. The rendering function in `update_project_docs.py` (`render_readme_block`, `render_status_md`, `build_root_dashboard`).
2. The data-gathering helpers (`collect_commits`, `language_breakdown`, `scan_todos`, etc.).
3. The workflow YAML only if a new input or permission is truly required.

## Related documentation

- `docs/PROJECT_DOC_AUTOMATION.md` — operator-facing documentation
- `.github/scripts/README.md` — script-by-script reference
- `.github/prompts/*.prompt.md` — reusable slash commands for Copilot Chat (install, customize, debug, add-to-registry)
