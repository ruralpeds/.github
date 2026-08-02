# PR Origin Labels

This policy defines how pull requests in `ruralpeds/.github` are attributed so
Copilot-, Claude-, human-, and automation-originated work can be reviewed and
governed consistently.

---

## Required branch and PR metadata

Every gap PR in this repo must also satisfy:

1. Branch name matches `gap/NNN-short-slug`
2. PR title matches `GAP-NNN: short summary`
3. PR body contains an ownership block:

```md
<!-- agent-ownership -->
primary_agent: copilot
gap: GAP-014
<!-- /agent-ownership -->
```

The `primary_agent` value must align with the single `origin:*` label on the
PR.

---

## Required label

Every PR must carry **exactly one** `origin:*` label.

| Label | Use when |
|---|---|
| `origin:human` | The PR was prepared by a human without Copilot/Claude multi-step authorship |
| `origin:copilot` | GitHub Copilot or a Copilot coding agent produced the substantive change |
| `origin:claude` | Claude Code or another Claude-based coding agent produced the substantive change |
| `origin:dependabot` | The PR was opened by Dependabot |
| `origin:automation` | The PR was opened by a scheduled workflow or bot automation |
| `origin:external` | The PR was opened by an external contributor outside the org/collaborator set |

---

## Additional requirements for AI-origin PRs

PRs labeled `origin:copilot` or `origin:claude` must also include:

1. An `<!-- ai-session-summary --> ... <!-- /ai-session-summary -->` block in the PR body
2. A human-applied `review:verified-human-understood` label before merge

Required fields inside the session summary block:

- `agent:`
- `session_started:`
- `intent:`
- `phi_used_in_prompts:`
- `credentials_used_in_prompts:`
- `reviewer_will_verify:`

---

## Auto-label signals

`origin-label.yml` may automatically assign an origin label when the signal is
unambiguous:

- PR body contains `primary_agent: copilot` → `origin:copilot`
- PR body contains `primary_agent: claude` → `origin:claude`
- PR body contains `primary_agent: human` → `origin:human`
- PR body contains `agent: copilot` → `origin:copilot`
- PR body contains `agent: claude` → `origin:claude`
- PR body contains `agent: human` → `origin:human`
- Legacy branch names starting with `copilot/`, `claude/`, or `human/`
- Dependabot PRs → `origin:dependabot`
- External-contributor PRs → `origin:external`

If no unambiguous signal exists, the workflow fails and asks for a manual
label rather than guessing.

---

## Why this exists

- Distinguishes human vs agent-authored work during review
- Supports branch-protection rules that require origin attribution
- Makes Copilot and Claude PRs auditable without weakening human review
- Prevents multiple agents from sharing a branch without explicit ownership metadata
