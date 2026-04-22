---
description: Customize the Project Documentation Automation for this repo's conventions
agent: agent
---

Help the user customize the Project Documentation Automation system for this repository. Ask them which of these axes they want to change, then make precise edits to `.github/scripts/update_project_docs.py` (and, only if necessary, `.github/workflows/update-project-docs.yml`). Respect all rules in `.github/copilot-instructions.md` and `.github/instructions/project-docs-scripts.instructions.md`.

## Customization axes

1. **What counts as a project?**
   - Add to or remove from `PROJECT_MARKERS` in `detect_active_projects.py`.
   - Add to `EXCLUDE_DIRS` to blacklist build / cache directories.
   - Or commit an explicit `.github/project-registry.json` (see `/add-project-to-registry`).

2. **What shows up in the README status block?**
   - Edit `render_readme_block` in `update_project_docs.py`. Keep it short — the full breakdown goes in `STATUS.md`.
   - Markers (`<!-- AUTO-STATUS:START -->` / `<!-- AUTO-STATUS:END -->`) must not change, or older projects' READMEs will lose their blocks.

3. **What shows up in STATUS.md?**
   - Edit `render_status_md` in `update_project_docs.py`.
   - Add a new section by writing a helper that returns lines, then calling it inside `render_status_md`.

4. **What's in the root-level dashboard?**
   - Edit `build_root_dashboard` in `update_project_docs.py`.
   - Columns must be in the same order as the Markdown table header they emit.

5. **Schedule and triggers**
   - Edit `on.schedule.cron` in the workflow YAML. Default is `0 6 * * *` (06:00 UTC).
   - Do **not** add a `push:` trigger — it will feedback-loop with the bot's own commits.

6. **Language breakdown**
   - Add or remove entries in `EXT_TO_LANG` in `update_project_docs.py`.
   - If a new language should not inflate LOC, exclude its extension from `source_exts` inside `loc_estimate`.

7. **LLM-generated summary paragraph**
   - Toggle via the `use_llm` workflow input. Requires `ANTHROPIC_API_KEY` secret.
   - The model is pinned in `llm_summary`. Keep token budget small; a short paragraph is the contract.

## Workflow

1. **Discover the intent.** If the user hasn't told you which axis, ask them to pick one from the list above.
2. **Read before writing.** Open the target file and understand the surrounding function before editing. Don't add imports at the top without checking the import block already present.
3. **Edit surgically.** Use the smallest diff that achieves the goal.
4. **Verify.** After each edit, run:

   ```bash
   python -m py_compile .github/scripts/update_project_docs.py
   ```

   If you added a new output field, run the three-step local dry run documented in `docs/PROJECT_DOC_AUTOMATION.md` to confirm it renders.

5. **Explain.** Summarize what changed, what file(s), and what the user will see differently on the next run.

## Guard rails

- Never silently change the HTML-comment marker strings.
- Never replace `subprocess.run(..., check=False)` with `check=True` — one bad project must not fail the whole run.
- Never add a dependency outside the standard library and `requests`. If a customization genuinely requires one, tell the user what it is and why, and let them decide.
