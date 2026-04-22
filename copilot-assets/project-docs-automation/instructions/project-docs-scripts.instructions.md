---
applyTo: ".github/scripts/**/*.py"
---

# Project docs scripts — editing rules

These Python scripts run inside GitHub Actions on `ubuntu-latest` with Python 3.12. They are invoked in sequence by `.github/workflows/update-project-docs.yml` and communicate via environment variables in and `$GITHUB_OUTPUT` out.

## Hard rules

- Standard library first. The **only** permitted third-party import is `requests`, pinned in `requirements.txt`. If you find yourself wanting `gitpython`, `pygit2`, `pydantic`, `tomlkit`, etc., stop — use `subprocess`, `urllib`, `json`, or `tomllib` (already handled, 3.11+).
- Python 3.12 syntax is fine (PEP 604 unions, `match` statements, etc.). Do not bump the `actions/setup-python` version without updating the workflow.
- Every script must run **locally without `$GITHUB_OUTPUT` set** — fall back to printing `key=value` lines to stdout. This is required for the dry-run documented in `docs/PROJECT_DOC_AUTOMATION.md`.
- Never use `subprocess` with `shell=True` or string commands. Always pass `args` as a list, with `capture_output=True`, `text=True`, `check=False`.
- Never `raise` out of `main()` on recoverable errors — emit `::warning::` to stderr and continue. The only conditions that should return a non-zero exit code are: required env var missing, JSON input malformed, or *every* project failed (in `update_project_docs.py`).

## Input / output contract

Each script is called as a step and appends to `$GITHUB_OUTPUT` instead of relying on stdout redirection. If you add a new output, it must:

1. Use `snake_case` keys.
2. Be JSON-encoded if it's a list or dict; plain string otherwise.
3. Be documented in the script's module docstring.

## Git shelling conventions

When you call `git`, always include `--no-show-signature` to avoid verbose output, and always include `--pretty=format:...` rather than relying on default output. The record-separator trick used in `collect_commits` (`\x1e` between records, `\x1f` between fields) is there because commit subjects contain newlines and pipes — keep it.

## README block-merge logic

`update_marked_block` in `update_project_docs.py` must remain **idempotent**. Running it twice in a row on the same text must produce identical output (modulo the refreshed timestamp inside the body). Test manually:

```bash
python .github/scripts/update_project_docs.py
python .github/scripts/update_project_docs.py
# marker count must stay at 2, not 4
grep -c 'AUTO-STATUS' README.md
```

## Language detection

If you add a language to `EXT_TO_LANG`, also think about whether files in that language should count toward the LOC estimate (most source languages yes; `Markdown`, `JSON`, `YAML`, `TOML` are explicitly excluded because they inflate LOC without representing code).

## TODO scanning

The regex `\b(TODO|FIXME|HACK|XXX)\b` is scanned across recognized source files. If you extend it, keep it **word-bounded** — otherwise you'll hit false positives in minified CSS and similar.

## Dependency parsing

`_read_toml_deps` prefers `tomllib` (3.11+), falls back to `tomli` if present, and finally uses a naive regex-free line scraper. Don't reverse this order — the tomllib path produces structurally correct results; the fallback is a last resort.

## Adding a new collector

If you add a new data collector (e.g. "count test files"), wire it up in `process_project`, add the corresponding key to the `meta` dict, render it in `render_status_md` (never the README block — keep that short), and include it in `.doc-meta.json`.
