# Task File Schema

Every file under `copilot-tasks/phase-NN-*/task-*.md` MUST conform to this schema.
`seed_issues.py` parses the frontmatter; `copilot-task-guardrails.yml` reads
some fields (e.g. `files-not-to-touch`) when evaluating PRs.

## Frontmatter (YAML)

```yaml
# ─── Required ────────────────────────────────────────────────────────────
title: string              # Short description. Becomes issue title suffix.
phase: string              # "phase-NN" — must match the containing directory prefix.
slug: string               # kebab-case; must match filename suffix (task-NN-<slug>.md).
goal: string               # Two sentences max, plain language, why this matters.

acceptance-criteria:       # list[string] — Testable outcomes.
  - "..."                  # One per line. All must be checked before PR merge.

files-to-touch:            # list[string] — Explicit allow-list.
  - "path/or/glob"         # Globs acceptable (handled in PR review).

files-not-to-touch:        # list[string] — Explicit deny-list, additive to AGENTS.md §4.3.
  - "..."

tests-required: string     # Markdown-friendly description of test additions.

rollback: string           # One sentence: how to revert.

# ─── Optional ────────────────────────────────────────────────────────────
preferred-agent: string    # "copilot" | "claude-code" | "codex" | "any". Default: "copilot".

preflight-confirmation: bool  # If true, agent must list planned changes and wait
                              # for a human comment before editing. Default: false.

standards:                 # list[string] — Regulatory/industry standards cited.
  - "NIST SSDF PW.4"
  - "HIPAA §164.312(b)"

labels:                    # list[string] — Extra labels beyond the seeder defaults.
  - "security"

estimated-complexity:      # "xs" | "s" | "m" | "l" — rough sizing, optional.
                           # xs=<1h, s=1-3h, m=3-8h, l=>8h (if l, consider splitting).

depends-on:                # list[string] — slugs of other tasks that must complete first.
  - "custom-properties"

authorizes:                # list[string] — explicit paths NORMALLY forbidden by AGENTS.md
                           # that THIS task exceptionally permits. Guardrails honor this.
  - ".github/workflows/audit-log.yml"   # only if task IS about audit-log.yml

requires-human-after:      # "review" | "merge" | "deploy" — where a human must re-enter.
                           # Default: "review".

risk-controls:             # list[string] — IEC 62304 RC-### IDs this task implements.
  - "RC-007"

requirement-ids:           # list[string] — SW-### IDs this task satisfies.
  - "SW-042"
```

## Body (Markdown)

After the `---` frontmatter fence, free-form markdown. Conventionally:

1. **## Context** — what the agent needs to know that isn't in the frontmatter.
2. **## Approach** — (optional) suggested approach; agent may deviate with reason.
3. **## Verification** — exact commands the agent should run to verify; these often become the PR's "Tests run locally" log.
4. **## References** — links to standards sections, prior PRs, GitHub docs, etc.

## Conventions

- **Plain text ASCII** — no curly quotes, em-dashes outside prose, or other fancy unicode that might confuse YAML parsers.
- **Concrete examples** over abstract description — the agent can work from an example of the change; it cannot always work from a description.
- **Fail-closed tests** — tests should fail if the change is reverted, not just not-run.
- **Bound scope** — if you're describing the task and it grows past 400 lines of diff, split it.
