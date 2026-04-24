---
description: Install the Project Documentation Automation system into this repository
agent: agent
---

Install the Project Documentation Automation system into this repository. All the source files live in the `timothyhartzog/Claude-artifacts` repository under `project-docs-automation/`. Fetch them from `https://raw.githubusercontent.com/timothyhartzog/Claude-artifacts/main/project-docs-automation/<path>` and place them at the corresponding path in this repo **without the `project-docs-automation/` prefix**.

## Files to install

Copy each of these to the indicated destination. Create any missing parent directories. Preserve file permissions.

| Source (raw URL path) | Destination in this repo |
|---|---|
| `project-docs-automation/.github/workflows/update-project-docs.yml` | `.github/workflows/update-project-docs.yml` |
| `project-docs-automation/.github/scripts/determine_cutoff.py` | `.github/scripts/determine_cutoff.py` |
| `project-docs-automation/.github/scripts/detect_active_projects.py` | `.github/scripts/detect_active_projects.py` |
| `project-docs-automation/.github/scripts/update_project_docs.py` | `.github/scripts/update_project_docs.py` |
| `project-docs-automation/.github/scripts/write_summary.py` | `.github/scripts/write_summary.py` |
| `project-docs-automation/.github/scripts/requirements.txt` | `.github/scripts/requirements.txt` |
| `project-docs-automation/.github/scripts/README.md` | `.github/scripts/README.md` |
| `project-docs-automation/.github/copilot-instructions.md` | `.github/copilot-instructions.md` |
| `project-docs-automation/.github/instructions/project-docs-scripts.instructions.md` | `.github/instructions/project-docs-scripts.instructions.md` |
| `project-docs-automation/.github/prompts/install-project-docs.prompt.md` | `.github/prompts/install-project-docs.prompt.md` |
| `project-docs-automation/.github/prompts/customize-project-docs.prompt.md` | `.github/prompts/customize-project-docs.prompt.md` |
| `project-docs-automation/.github/prompts/debug-project-docs.prompt.md` | `.github/prompts/debug-project-docs.prompt.md` |
| `project-docs-automation/.github/prompts/add-project-to-registry.prompt.md` | `.github/prompts/add-project-to-registry.prompt.md` |
| `project-docs-automation/docs/PROJECT_DOC_AUTOMATION.md` | `docs/PROJECT_DOC_AUTOMATION.md` |

## If `.github/copilot-instructions.md` already exists

Do **not** overwrite it. Instead, append a new section titled `## Project Documentation Automation` containing the full body of the source instructions, preceded by a short link note: "See `docs/PROJECT_DOC_AUTOMATION.md` for the operator-facing docs."

## If this repo has existing projects

After copying the files, run `.github/scripts/detect_active_projects.py` with `CUTOFF_ISO` set to the current time minus 10 years (so every project is counted as having activity on first run), and report the list of detected projects back to the user. Ask whether they'd like an explicit `.github/project-registry.json` generated — if yes, write one with the discovered paths.

Dry-run example:

```bash
export CUTOFF_ISO="2015-01-01T00:00:00Z"
export FORCE_ALL=false
python .github/scripts/detect_active_projects.py
```

## Validation

After the install:

1. Confirm all files listed above exist with `ls -la` on each destination.
2. Run `python -m py_compile .github/scripts/*.py` — there should be no syntax errors.
3. Validate the workflow YAML with `python -c "import yaml; yaml.safe_load(open('.github/workflows/update-project-docs.yml'))"` — no exceptions.

## Output

Open a pull request titled `chore: install project documentation automation`. The PR body must include:

- a summary of what was installed,
- the list of projects detected (from the dry run),
- a link to `docs/PROJECT_DOC_AUTOMATION.md`,
- a one-line instruction telling the user to go to Actions → "Update Project Documentation" → "Run workflow" with `force_all: true` on first invocation to seed every project's `STATUS.md`.

## Do not

- Do not run `gh workflow run` yourself — let the user trigger the first run.
- Do not modify the user's existing `README.md` beyond adding the `<!-- AUTO-PROJECTS:START -->` / `<!-- AUTO-PROJECTS:END -->` block if it's absent. Leave the rest untouched.
- Do not add any secrets, tokens, or API keys to any file.
