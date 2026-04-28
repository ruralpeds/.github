---
applyTo: "**"
---

# Instructions: Asking for Review

When an agent (Claude Code, Copilot, Codex, Cursor, or any tool) asks the human reviewer for a decision during a review or while building toward a review, follow these rules in addition to `AGENTS.md` §10 (Escalation paths).

## Hard rule

**One question at a time.** When prompting for a review or for input that influences the next step of the work, the agent asks a single, focused question and stops. Do not batch multiple unrelated questions. Do not present a numbered list of decisions and ask the reviewer to answer all of them in one reply.

This applies to:

- Comments on a PR or issue.
- Mid-task `ASK:` escalations (per AGENTS.md §10).
- Inline messages in the chat / IDE / agent transcript when work is paused awaiting input.

## Why

- A reviewer answering five questions at once tends to skip context, misread #2 because they were thinking about #4, and produce ambiguous answers that the agent then has to re-ask.
- One question = one cycle = one auditable decision. This matches the audit-trail discipline used everywhere else in this org (one event, one signature, one ledger entry).
- It forces the agent to prioritize: which decision unblocks the most work right now?

## How

1. Pick the **single highest-leverage question** — the one whose answer most changes what you do next.
2. Phrase it so it can be answered in one sentence (yes/no, A vs B, or a short value).
3. Provide just enough context that the reviewer can answer cold without scrolling: relevant file paths, the two options you're choosing between, and what each one implies.
4. Stop. Wait for the answer before posing the next question.
5. If a follow-up question becomes necessary, ask it as a new turn after the first answer lands.

## Anti-patterns

❌ "Should I (1) merge the duplicate workflow files, (2) delete `/workflows/`, (3) rename `ci-julia.yml`, and (4) add a CI check? Let me know what you think."

✅ "Of the two `audit-sign-envelope.yml` copies, the one in `.github/workflows/` is older by 3 commits but has more recent SHA pins. Should I treat that one as canonical and delete `/workflows/audit-sign-envelope.yml`?"

❌ "I have a few questions: a) which tests should I prioritize, b) should we use SHA pins now or later, c) is GAP-005 P1 or P2?"

✅ "Should the SHA-pin migration ship in the same PR as the duplicate-workflow cleanup, or as a follow-up?"

## Exceptions

- A **status update** (no question, just "here's where I am") may include multiple bullets — that's a report, not a question.
- A **structured form** explicitly requested by the reviewer (e.g. "fill out this checklist") is a single question (the checklist) even if it has multiple fields.
- An **emergency** (production incident, secret leak, audit-chain tamper) can include a brief impact summary plus the one decision needed — but still only one decision.

## Version

`review.instructions.md` v1.0 — 2026-04-28
