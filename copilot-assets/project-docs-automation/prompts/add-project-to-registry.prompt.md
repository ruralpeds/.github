---
description: Add a directory to the project registry so it shows up in the documentation run
agent: agent
---

Add one or more directories to this repository's project registry so they are tracked by the Project Documentation Automation workflow. Use when the user has a directory that doesn't contain a recognized manifest file (e.g., a theology content folder, a docs-only folder, a data directory) but they still want it treated as a "project" for the purposes of STATUS.md generation.

## Steps

1. **Check for an existing registry.** Run `test -f .github/project-registry.json && cat .github/project-registry.json`. If it exists, read its current `projects` array. If it does not exist, you will create a new one.

2. **Confirm the directories with the user.** If the user has not told you which directory to add, ask. Once you have the path(s):

   - Normalize each to a relative path from the repo root (no leading `./`, no trailing `/`).
   - Reject any path that escapes the repo root or does not exist.

3. **Write the registry.** Merge with existing entries and deduplicate. Preserve existing entries unless the user explicitly asks to remove one.

   ```json
   {
     "projects": [
       ".",
       "apps/web",
       "packages/core",
       "content/book-of-deuteronomy"
     ]
   }
   ```

   The `.` entry means "track the repo root as a project." Include it only if it makes sense for this repo.

4. **Drop a sentinel file alternative (optional).** If the user prefers not to maintain a registry, offer to touch a `.project-marker` file inside each target directory instead. That's the other supported opt-in path — `detect_active_projects.py` treats any directory containing `.project-marker` as a project.

5. **Verify.** Run the dry-run documented in `docs/PROJECT_DOC_AUTOMATION.md`:

   ```bash
   export CUTOFF_ISO="$(date -u -d '10 years ago' +'%Y-%m-%dT%H:%M:%SZ')"
   python .github/scripts/detect_active_projects.py
   ```

   Confirm each path you just added shows up in the output.

6. **Commit.** Open a PR titled `chore: register <project-names> with documentation workflow`. The body should list the paths added, and note that the next scheduled run (or a manual `force_all: true` dispatch) will seed their `STATUS.md` files.

## Edge cases

- **If the registry has a trailing comma** or other JSON syntax error, do not silently rewrite. Report the error and ask the user whether to fix it.
- **If a target path already exists in the registry**, say so and do not duplicate.
- **If a target path is empty (no files)**, warn the user — `detect_active_projects.py` will still treat it as a project, but `update_project_docs.py` will produce a near-empty `STATUS.md`.
