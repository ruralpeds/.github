---
description: Debug a failed or surprising run of the Project Documentation workflow
agent: agent
---

The user has encountered a problem with the Project Documentation Automation workflow. Diagnose it systematically.

## Ask up front (only if missing)

- Which run is failing? A URL to the Actions run page is best.
- Is the failure happening on schedule, on manual dispatch, or both?
- What commit SHA is the workflow running against?

Do not ask more than two questions at a time.

## Diagnostic checklist

Walk through these in order and report what you find at each step. Stop as soon as you find the root cause.

### 1. Permission check

Open `.github/workflows/update-project-docs.yml` and confirm it declares:

```yaml
permissions:
  contents: write
  actions: read
```

If the repo lives in an org with restrictive defaults, the user may also need to flip **Settings → Actions → General → Workflow permissions** to "Read and write permissions." Symptom: the final `git push` step fails with a 403.

### 2. Branch protection

If the default branch requires PR review, the bot's direct push fails. Symptom: `push` step fails with "protected branch hook declined" or similar.

Fix options to offer the user:
- Replace the `Commit and push` step with `peter-evans/create-pull-request` so each run opens a PR.
- Add a branch-protection exception for the `github-actions[bot]` actor.

### 3. Cutoff resolution

Inspect the "Determine activity cutoff" step log. It prints the resolved cutoff and source (`manual` / `last_run` / `fallback`). If it always reports `fallback` when you expect `last_run`, the GitHub API call is failing silently — look for a `::warning::` line. Common causes:

- `GITHUB_TOKEN` scopes don't include `actions:read`. Check the `permissions:` block.
- The workflow filename in `determine_cutoff.py`'s env does not match the actual file. It must be `update-project-docs.yml`.

### 4. Project detection

Inspect the "Detect active projects" step output. If zero projects are found but the repo clearly has projects:

- The projects may not have recognized manifests. Run `ls` at each project dir and check against `PROJECT_MARKERS` in `detect_active_projects.py`.
- The parent directories may be in `EXCLUDE_DIRS` (e.g., a directory literally named `dist` or `build`).
- If a `.github/project-registry.json` exists, it overrides auto-discovery. Open it and verify the paths are correct.

If only some expected projects are flagged active, the issue is almost always the cutoff: run `git log --since=<cutoff> -- <project-path>` locally and confirm there are commits in that window.

### 5. Doc generation

If the "Update project documentation" step fails for one project but the workflow continues, that's expected behavior — look for the `::error::Failed to refresh ...` annotation, read the traceback, and fix the specific collector. Common causes:

- A project contains a file that isn't valid UTF-8 and a collector isn't using `errors="replace"`.
- A `Cargo.toml` or similar has an unusual structure that trips `_read_toml_deps`.
- The `git remote get-url origin` call fails in a repo with no `origin` remote (add a guard).

### 6. Commit and push

If there are no changes to commit, the step emits `::notice::No doc changes detected` and exits 0 — that's success, not a failure. This is correct behavior when no active project's content actually differs from what's already committed.

### 7. Marker integrity

If a user reports the READMEs growing each run (duplicated status blocks), confirm the idempotency of `update_marked_block`. Run locally:

```bash
python .github/scripts/update_project_docs.py
python .github/scripts/update_project_docs.py
grep -c 'AUTO-STATUS' <some-project>/README.md
# Must be exactly 2. If it's 4, the regex replace isn't matching.
```

### 8. LLM path

If `use_llm=true` was set but no prose summary appears in STATUS.md:

- Confirm `ANTHROPIC_API_KEY` is in repo secrets.
- Look for `::warning::Anthropic API error` lines.
- Non-zero HTTP status codes should be visible in the step log.

## Output

Post your diagnosis back to the user with:

- **Root cause** (one sentence).
- **Where you found it** (file and line, or Actions log line number).
- **Fix** (a proposed diff or concrete action).
- If you applied a fix, a PR link.

Do not apply fixes autonomously if the diagnosis points to user configuration (secrets, branch protection, org settings). For those, explain and hand back.
