# GitHub Copilot Instructions — ruralpeds

You are working inside a `ruralpeds/*` repository. The organization builds clinical and scientific software for healthcare. Treat everything in this repo as safety-relevant and regulatory-relevant unless a file explicitly marks it otherwise.

**Authoritative context:** Always read `AGENTS.md` at the repo root before proposing code. It contains the cross-agent contract and is strictly more authoritative than these Copilot-specific instructions.

**Also read, when relevant:**

- `.github/instructions/*.md` — path-scoped instructions that auto-apply based on file location.
- `copilot-tasks/phase-NN-*/task-*.md` — the machine-readable task file linked from any issue you're working on.
- `docs/compliance/STANDARDS_MAP.md` — which regulatory standards apply to this repo.
- `dhf/classification.md` — the repo's IEC 62304 software safety class, if present.
- `README.md` at the repo root.

## Operating modes

You may be invoked in one of three modes. Behavior differs.

### 1. Inline completion / chat

Short, surgical suggestions. Apply these instructions to every completion. Do not invent APIs; if unsure, say so.

### 2. Code review (PR review mode)

Look specifically for:

- Violations of hard refusals in `AGENTS.md §1`.
- PHI patterns in added/changed code or fixtures.
- Missing tests for behavior changes.
- Missing audit events for privileged or patient-impacting operations.
- Dependency additions that skip the approval path.
- Workflow changes that weaken required checks.
- Uncaught exceptions without correlation IDs.
- Logging statements that could leak identifiers.

Give concrete, line-referenced suggestions. Prefer "request changes" when any `AGENTS.md §1` rule is violated.

### 3. Coding agent (when assigned to an issue)

This is the fully autonomous mode. Before writing any code:

1. Read the linked task file end to end.
2. Read `AGENTS.md`.
3. Read every `.github/instructions/*.md` whose `applyTo` pattern matches any file you plan to touch.
4. List the files you intend to modify, as a comment on the issue, and wait for confirmation **only if** the task file's `preflight-confirmation` flag is `true`. Otherwise proceed.
5. Execute, test, and open a PR following `AGENTS.md §3`.

## Repository conventions

- Branch naming: `agent/<phase>/<slug>-<issue#>`. Example: `agent/phase-01/pin-actions-sha-42`.
- Commit style: Conventional Commits with `Refs: #<issue>` footer.
- PR titles: start with the type + short description, e.g. `security: pin all workflow actions to SHAs`.
- One task per PR. No drive-by fixes.

## Language-specific defaults (applied when you're in a matching file)

### Julia

- Formatter: `JuliaFormatter.jl` with the repo's `.JuliaFormatter.toml`.
- Static analysis: `JET.jl`, `Aqua.jl` — both should run clean.
- Every exported function needs a docstring with `# Arguments`, `# Returns`, `# Examples`.
- No global mutable state in packages.
- Use `@assert` for invariants only, never for input validation (may be disabled in `-O3`).

### Rust

- Formatter: `rustfmt` with default profile unless `rustfmt.toml` overrides.
- Lints: `cargo clippy -- -D warnings`.
- Prefer `Result<T, thiserror::Error>` over `anyhow` in library crates.
- All public fns have `///` doc comments.
- No `unsafe` without a `// SAFETY: <rationale>` comment above each use.
- No `unwrap()` or `expect()` in non-test code except where a panic is the correct behavior — then comment why.

### Python

- Formatter: `ruff format`. Linter: `ruff check` with strict config.
- Types: `mypy --strict`. Every public function has type hints.
- No `from module import *`.
- Use `pathlib.Path`, not `os.path`.
- Tests use `pytest`, not `unittest`.

### TypeScript/JavaScript

- Formatter: `prettier` with the repo's `.prettierrc`.
- Linter: `eslint` with strict TS ruleset.
- `strictNullChecks`, `noImplicitAny`, `strict` — all on.
- No `any`. Use `unknown` and narrow, or model the type.
- No `// @ts-ignore` without `// @ts-expect-error: <reason>` and an issue link.

### Go

- Formatter: `gofmt` or `gofumpt`. Linter: `golangci-lint` with the repo's `.golangci.yml`.
- All errors wrapped with context: `fmt.Errorf("doing X: %w", err)`.
- No `panic` outside `main.go` initialization.
- Context propagation mandatory: every function that does I/O takes `ctx context.Context` as the first argument.

## What not to do (Copilot-specific reminders)

- **Do not invent function names or package APIs.** If you're not sure a function exists, don't call it. Use the LSP/indexer to verify.
- **Do not delete tests to make CI green.** Ever.
- **Do not silence warnings** by suppressing them (`// eslint-disable`, `# type: ignore`, `@ts-ignore`, `allow(unused)`). Fix the underlying issue, or escalate with `RISK:` comment.
- **Do not introduce a new dependency** in the middle of a task. If a task needs one, open a separate dependency-add PR first.
- **Do not modify `AGENTS.md`, `.github/copilot-instructions.md`, or files under `policies/`** unless that is the explicit task.
- **Do not rewrite existing code stylistically** if the task is about something else. Respect the existing style; open a follow-up if you see real issues.
- **Do not emit non-ASCII quotes, em-dashes, or fancy unicode** in code unless the file is user-facing prose. Source code uses straight quotes.

## PR description auto-template

When you open a PR, fill this exactly:

```markdown
## Summary

<2-3 sentence plain-language summary>

## Files Changed

- `path/to/file` — <one-line rationale>

## Acceptance Criteria (from task-XX)

- [x] Criterion 1
- [x] Criterion 2
- [ ] Criterion 3 — <explanation of partial>

## Tests

- Added: `tests/path/to/new_test.ext`
- Modified: `tests/path/to/existing_test.ext`
- Run locally: `<exact command>` → green.

## Audit Events

- `event.name.changed` — added/modified/none

## Security Implications

- <list or "None; no auth/network/data-handling change">

## Standards Touched

- NIST SSDF <practice>, HIPAA §<section>, IEC 62304 §<section>

## Rollback

<one sentence>

## Agent Self-Check

- [x] Read AGENTS.md
- [x] Read task file
- [x] Read applicable instructions/*.md
- [x] Diff scoped per task
- [x] No forbidden files modified
- [x] Tests green locally
- [x] Lint/format/types green
- [x] Labels set
```

## Escalation

If you can't complete the task safely, comment on the issue with `ASK:`, `BLOCKED:`, `RISK:`, `SPLIT:`, or `DONE-PARTIAL:` per `AGENTS.md §10`, and stop. Do not work around. Do not bundle unrelated work. Do not rewrite requirements.
