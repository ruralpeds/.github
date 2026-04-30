# Sprint Standard for Claude → Copilot Agent Workflows

> **Last Updated**: 2026-04-29
> **Governance Level**: Recommended for all `ruralpeds/*` repos
> **Status**: v1.0
> **Builds on**: `AGENTS.md` (universal agent contract), `copilot-tasks/_schema.md` (task file format), `seed_issues.py` (issue seeder)

## What this document is

A **repeatable pattern** for turning a Claude-authored build plan into a sequence of GitHub Copilot agent sprints, executed inside a reproducible VS Code + Docker devcontainer environment.

The pattern has three layers, each addressed by a separate document or directory in this organization repo:

| Layer | Artifact | Purpose |
|---|---|---|
| **Plan** | `<REPO>_BUILD_PLAN.md` (committed to the target repo's root) | Single Claude-authored markdown file describing the full multi-sprint build, with explicit phases and acceptance checks. |
| **Sprints** | `copilot-tasks/phase-NN-*/task-*.md` files (committed to the target repo) | Machine-readable task files generated from the plan, one per executable unit, conforming to `_schema.md`. |
| **Runtime** | `.devcontainer/devcontainer.json` (committed to the target repo) | VS Code dev container so every sprint runs in identical Docker-based tooling whether driven by a human, the cloud agent, or VS Code agent mode. |

Three commands take a freshly Claude-authored plan to a running fleet of agent sprints:

```bash
ruralpeds-sprint init <repo>            # add devcontainer + plan scaffolding
ruralpeds-sprint plan-to-tasks <plan>   # convert plan markdown → copilot-tasks/*.md
ruralpeds-sprint kickoff <repo>         # seed issues + assign @copilot
```

Those three commands are the thin wrapper this standard adds on top of existing org tooling. The rest is policy.

## Why this exists

The org already has excellent infrastructure for individual Copilot tasks (the `copilot-tasks/` schema, `seed_issues.py`, the guardrail workflow). What was missing was an **end-to-end sprint pattern** that connects three things which had been informal:

1. **How a Claude-generated build plan becomes a series of sprints.** Previously: a person hand-translated a plan into task files. Now: deterministic, with a converter that enforces the schema.
2. **How sprints run in VS Code.** Previously: each developer's IDE setup was their own. Now: a versioned devcontainer pinned to specific tool versions so VS Code Copilot agent mode and the cloud agent see the same environment.
3. **How sprint dependencies are encoded so agents don't start prematurely.** Previously: prose hints in issue bodies. Now: the existing `depends-on:` frontmatter field enforced by the seeder, plus a phase-locking gate in the guardrails workflow.

This standard is **additive**. It does not replace `AGENTS.md`, the gap analysis lifecycle, or the existing copilot-tasks schema. It composes them into a sprint loop.

## The sprint loop

```
        ┌─────────────────────────────────┐
        │  1. Author build plan           │
        │     (Claude, in this app)       │
        │     → <REPO>_BUILD_PLAN.md      │
        └──────────────┬──────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────┐
        │  2. Plan → tasks                │
        │     ruralpeds-sprint            │
        │       plan-to-tasks <plan>      │
        │     → copilot-tasks/*.md        │
        └──────────────┬──────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────┐
        │  3. Commit plan + tasks +       │
        │     devcontainer to main        │
        └──────────────┬──────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────┐
        │  4. Kickoff                     │
        │     ruralpeds-sprint kickoff    │
        │     → seed_issues.py runs       │
        │     → issues assigned @copilot  │
        └──────────────┬──────────────────┘
                       │
                       ▼
   ┌───────────────────┴───────────────────┐
   │                                       │
   ▼                                       ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│ Cloud agent (PR per  │   │ VS Code agent mode (devcon-  │
│ issue, GitHub-hosted │   │ tainer; same Docker runtime  │
│ Actions runner)      │   │ as cloud agent)              │
└──────────┬───────────┘   └──────────┬───────────────────┘
           │                          │
           └──────────────┬───────────┘
                          ▼
        ┌─────────────────────────────────┐
        │  5. Human review per PR         │
        │     guardrails workflow gates   │
        │     merge                       │
        └──────────────┬──────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────┐
        │  6. Sprint retro                │
        │     update plan + close phase   │
        │     gap-analysis lifecycle      │
        └─────────────────────────────────┘
```

Steps 1-3 are author-side. Step 4 is one command. Steps 5-6 are review and retro.

## Sprint definition (what is a "sprint" in this standard)

A **sprint** is the agent-execution of one phase of the build plan. A phase is a numbered section of the plan that has its own acceptance check and that the plan's author has marked as a sprint boundary. Concretely:

- A sprint maps to one `copilot-tasks/phase-NN-<slug>/` directory.
- A sprint contains one or more task files (typically 1-15).
- A sprint has at most one parallelizable batch (the "fan-out" — see §6).
- A sprint completes when all its tasks' PRs are merged AND the phase's acceptance check passes.

This is the same definition used informally in the `copilot-tasks/phase-01-platform-hardening/` etc. directories, just made explicit.

## Build plan requirements

Any markdown file authored as a Claude build plan and intended to feed this pipeline must have the following structure. The `plan-to-tasks` converter is fail-loud: missing sections cause the conversion to abort with a precise error.

### Required sections, in order

```
# <title>

## 0. Why this design          (free prose, recommended)
## 1. Repository layout         (file tree as fenced ``` block)
## 2. <Architecture sections>   (any number, free prose)
...
## N-2. Phased build            (REQUIRED — must contain "### Phase 0", "### Phase 1", ...)
## N-1. Agent execution prompts (OPTIONAL — used as fallback task body if a phase has no body)
## N.   Acceptance criteria     (REQUIRED — converted to a final sprint that runs the smoke checks)
```

### Required per-phase content

Inside the "Phased build" section, every `### Phase NN — <name>` heading must contain:

- **A numbered list of steps** (becomes the task body's `## Approach` section).
- **A "Done check:"** line at the end (becomes the `acceptance-criteria:` frontmatter).
- **Optionally** a "Depends on:" line ("Phase N-1 merged") that becomes `depends-on:`.
- **Optionally** a "Parallelizable across <list>" line — the converter will fan that phase out into one task per item.

### Example

The plan format we used for `hospital-economics-rust` (`HFE_UI_BUILD_PLAN.md`) is the canonical reference. New plans should clone its structure.

## Task file mapping

The converter applies this mapping from plan markdown to `copilot-tasks/` task files:

| Plan element | Task frontmatter field |
|---|---|
| `### Phase NN — <name>` heading text | `title:` |
| Phase number `NN` (zero-padded) | `phase: phase-NN` |
| Slug from heading | `slug:` |
| Numbered list under heading | Body `## Approach` section |
| `Done check: <text>` | `acceptance-criteria:` (one item) |
| `Depends on: <text>` | `depends-on:` |
| Plan's `## 1. Repository layout` files mentioned in the phase | `files-to-touch:` (best-effort glob extraction) |
| Plan's hard rules in `### Hard rules` (if present) | Body `## Context` section |
| Plan-level standards (CMS FY2026, IEC 62304, etc.) | `standards:` |
| `Parallelizable across <a, b, c>` | One task file per item; suffix `-<item>` on slug |
| Default | `preferred-agent: copilot`, `requires-human-after: review`, `estimated-complexity: m` |

The converter is **deterministic and idempotent** — running it twice on the same plan produces the same task files (modulo whitespace). Already-existing task files are diffed and overwritten only if the phase content has changed; manual edits to a task file are detected via a `# converter-managed: false` comment that pins it.

## Devcontainer runtime

The runtime layer is a single `.devcontainer/devcontainer.json` file plus a `Dockerfile` derived from a base image this org maintains. It is committed to the target repo, not to `ruralpeds/.github`, so each repo can pin language-specific tool versions while inheriting the org base.

### Goals

1. **Identical environment** for VS Code agent mode, the cloud agent (which runs in GitHub Actions), and a human contributor on a fresh checkout.
2. **No secrets baked in.** The container assumes a GitHub PAT is supplied via the IDE's GitHub auth or, in CI, via the workflow's `GITHUB_TOKEN`.
3. **Pre-warmed toolchains.** Rust, Node, Python, Julia, and `wasm-pack` ready on first open. Cold start of a sprint should not require any installs.
4. **Reproducible by SHA.** Base image pinned by digest, language toolchains pinned by exact version.

### Base image

The org provides a base image at `ghcr.io/ruralpeds/sprint-base:<tag>` containing:

- Ubuntu 24.04 (matches GitHub Actions `ubuntu-latest`)
- Rust stable + `wasm-pack` + `wasm32-unknown-unknown` target
- Node 22 LTS + `pnpm` + `npm`
- Python 3.12 + `uv` + `pipx`
- Julia 1.11
- `gh` CLI, `act` (for local workflow runs), `pre-commit`
- VS Code `code-server` extensions auto-installed: GitHub Copilot, GitHub Pull Requests, Rust Analyzer, Tauri, ESLint, Prettier, Julia, Python, Pylance

Repos extend this image only when they need something out-of-band (e.g., heavy ML deps). 90% of repos use the base directly.

### Required `devcontainer.json` fields

The template at `templates/sprint-bundle/.devcontainer/devcontainer.json` enforces the minimum. The required fields are:

- `image` pinned to a digest, not a tag
- `features` list pinned by version
- `customizations.vscode.extensions` list (Copilot, Pull Requests, language-specific)
- `postCreateCommand` set to `./scripts/devcontainer-postcreate.sh` (a repo-local script)
- `remoteUser` set to `vscode` (never `root`)
- `mounts` for the GitHub auth socket so `gh` works without re-auth

## Cloud agent vs VS Code agent mode

Both consume the same task files; the difference is where they run.

| Aspect | Cloud agent (`@copilot` on issue) | VS Code agent mode (chat in IDE) |
|---|---|---|
| Trigger | Issue assignment | Chat command |
| Runtime | GitHub Actions ephemeral runner | Local devcontainer |
| Speed | Slower (cold start), unattended | Faster, interactive |
| Best for | Sequential phases (0-5), parallel fan-out (phase 6) | Tricky single tasks, debug after a failed cloud-agent PR |
| Network | Restricted by org allowlist | Same allowlist policy enforced via firewall in devcontainer |
| Secrets | Workflow secrets only | User's gh auth token only |

Recommended pattern: **cloud agent does the bulk; VS Code agent mode is the rescue lever** when a cloud-agent PR drifts and a comment-driven iteration isn't converging.

## Phase locking

To prevent the cloud agent from starting Phase 1 before Phase 0 is merged, this standard relies on the existing `copilot-task-guardrails.yml` workflow plus one new convention:

1. The `depends-on:` frontmatter field on a task lists task slugs that must be merged first.
2. The seeder script reads `depends-on:` and labels the issue `blocked:awaiting-<slug>` if any dependency is not yet merged.
3. The cloud agent is configured (in `.github/copilot-instructions.md` of the target repo) to refuse to start work on issues with a `blocked:*` label.
4. When the depended-upon PR merges, a workflow strips the `blocked:awaiting-<slug>` label from any issue depending on it; if no `blocked:*` labels remain, the issue is free for the agent.

This is a soft lock — humans can override it by removing the label manually. It exists to catch the common case where someone runs the kickoff script and 9 sprints fire simultaneously.

## Parallel fan-out

Phases marked `Parallelizable across <list>` produce one task per list item. They share `phase: phase-NN` but have distinct slugs. They each `depends-on:` the previous sequential phase. They do **not** depend on each other, so they all unblock simultaneously when the previous phase merges. This is how the 7 domains of Phase 6 in the HFE plan run in parallel.

The cap is **8 simultaneous agent sessions per repo**. The seeder enforces this by labeling tasks beyond the 8th with `queued:phase-NN` and the unblocking workflow promotes them to active as earlier ones merge.

## Branch naming

Conforms to the existing `AGENTS.md` §3 rule:

```
agent/<phase>/<slug>-<short-issue-#>
```

Example: `agent/phase-06/finance-127`. The cloud agent generates this automatically; VS Code agent mode is reminded by the devcontainer's `postCreateCommand` which prints the convention on shell open.

## PR review and merge

The standard does not change the PR review rules in `AGENTS.md` §3. It only adds two recommendations:

- **Always click "Approve and run workflows" the first time.** Cloud-agent PRs require explicit approval before CI runs.
- **Use the sprint retro template** at `docs/SPRINT_RETRO_TEMPLATE.md` after each phase merges, even if the retro is just one sentence ("clean run, no notes").

## Sprint retro

After a phase merges, the author creates a brief retro in the target repo at `docs/sprint-retros/phase-NN-<slug>.md`. The template is short on purpose. Its only required fields:

- What went well
- What needed re-prompting (and the prompt that fixed it)
- What you would change in the plan if you authored it again
- Whether to keep the same phase boundaries next time

The retros feed back into improving the **plan-authoring rubric** that Claude uses for the next plan. We collect them at the org level under `docs/sprint-retros-corpus/` once a quarter for prompt refinement.

## Adoption

A repo adopts this standard by running:

```bash
gh repo clone ruralpeds/.github /tmp/ruralpeds-github
/tmp/ruralpeds-github/scripts/sprint-init.sh <my-repo-path>
```

Which copies `templates/sprint-bundle/` into the repo, validates that `AGENTS.md` is referenced, and opens a PR titled `chore: adopt sprint-standard v1`.

## Versioning

This standard is versioned. v1.0 is the initial release. Backwards-incompatible changes (e.g., the converter's frontmatter mapping) require a major bump and an `UPGRADE.md` entry.

## See also

- `AGENTS.md` — universal agent contract (precedence over this document on safety items).
- `copilot-tasks/_schema.md` — canonical task file schema.
- `docs/CLAUDE_CODE_GAP_PROTOCOL.md` — gap-analysis lifecycle, complementary to sprints.
- `docs/AGENT_WORKFLOW.md` — broader agent workflow that this sprint pattern fits into.
