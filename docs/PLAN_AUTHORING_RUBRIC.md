# Build Plan Authoring Rubric

> **Audience**: Claude (or a human author working with Claude) producing a build plan that will be converted into Copilot agent sprints.
> **Tooling**: `scripts/plan_to_tasks.py` consumes plans authored to this rubric.

A plan that follows this rubric converts cleanly into `copilot-tasks/*.md` files with no manual fix-ups. Plans that don't are still readable, but the converter will either complain or produce coarser task files that need editing.

## Required structure

```markdown
# <Project> — Comprehensive Build Plan

**Repo:** owner/repo
**Target:** ...
**Stack:** ...
**Buildable by:** Claude Haiku 4.5 in agentic mode, or GitHub Copilot Workspace / Copilot Agent

## 0. Why this design               (free prose, optional)

## 1. Repository layout             (REQUIRED — fenced code block with file tree)

## 2. ... up to ## N-2.             (architecture, design decisions, free prose)

## N-2. Phased build (REQUIRED)

### Phase 0 — Bootstrap
1. Step one.
2. Step two.

Done check: <one-line testable condition>

### Phase 1 — <name>
1. Step one.

Done check: <...>
Depends on: Phase 0 merged.

### Phase 6 — Replicate per calculator
Fan out across: finance, strategy, operations, risk

1. For each item, do X.

Done check: <...>
Depends on: Phase 5 merged.

## N-1. Agent execution prompts     (optional)

## N. Acceptance criteria           (REQUIRED — full-build done check)
```

## Required per-phase rules

| Element | Required? | Notes |
|---|---|---|
| `### Phase NN — <name>` | yes | NN is sequential, zero-padded by the converter. |
| Numbered step list | yes | Becomes the `## Approach` body section. |
| `Done check:` line | yes | Becomes `acceptance-criteria:` (one entry). |
| `Depends on:` line | when not phase 0 | "Phase N merged" → resolved to slug. |
| `Fan out across: <a, b, c>` line | when fanning out | Produces one task per item. |

## Conventions that produce cleaner output

1. **Short phase names.** They become slugs and filenames; under 30 chars is best. Use specific verbs ("WASM facade expansion", not "Foundation"). The converter truncates anything longer.
2. **One Done check per phase.** If you find yourself listing two, that's two phases.
3. **Explicit fan-out marker.** "Parallelizable" in prose works as a fallback, but the explicit `Fan out across: a, b, c` line is unambiguous and machine-readable.
4. **Hard rules in section 0.** A `### Hard rules` subsection in the early "Why this design" or "Architecture" sections gets propagated into the `## Context` section of every task file. Use it for things that apply globally (no Tailwind 4, no Next.js, USA-only citations, etc.).
5. **Don't put steps inside Markdown sub-bullets.** Top-level numbered list only. Nested bullets become commentary, not steps.

## Anti-patterns

- **Run-on phases.** A phase that takes more than a day to author tasks for is too big. Split it.
- **Vague Done checks.** "It works" is not a Done check. "`cargo test --workspace` passes" is.
- **Cross-phase coupling without explicit `Depends on:`.** The converter assumes phases are independent unless told otherwise.
- **Implicit fan-out.** Saying "this should be parallelized" without the marker line means it won't be. Be explicit.

## Example: a minimal valid plan

```markdown
# Tiny Calculator — Build Plan

## 1. Repository layout

```
calc/
├── src/main.rs
└── tests/
```

## 11. Phased build

### Phase 0 — Scaffold

1. `cargo new calc`.
2. Add a `tests/` directory with one passing test.

Done check: `cargo test` passes.

### Phase 1 — Add divide function

1. Implement `pub fn divide(a: f64, b: f64) -> Result<f64, String>`.
2. Test divide-by-zero returns Err.

Done check: `cargo test` passes including the new test.
Depends on: Phase 0 merged.

## 12. Acceptance criteria

`cargo test` and `cargo clippy -- -D warnings` both pass.
```

That plan parses cleanly and produces two task files.

## How the rubric is enforced

The converter (`plan_to_tasks.py`) is fail-loud:

- Missing `## Phased build` section → error.
- Phase missing `Done check:` → error.
- Phase header that doesn't match `### Phase NN — <name>` → silently skipped (so you can have non-phase subsections in the build section).

If the converter complains, fix the plan, not the converter.
