# Contributing to ruralpeds

## Before you open a PR

1. Run the compliance workflow locally or via `act` if possible.
2. Update `.github/AUDIT.yaml` via the audit workflow with
   `mark-reviewed: true` when appropriate.
3. Sign your commits (`git commit -S`). The compliance workflow
   enforces signatures for FDA Class II+ repos.
4. Include an entry in `CHANGELOG.md` (if present) for user-visible
   behavior changes.

## Branch protection

- Direct pushes to `main` are blocked in most repos.
- PRs require the `Required — Compliance` and `Required — Audit Log`
  checks to pass.
- For clinical-software repos, PRs also require review from a
  designated clinical reviewer.

## Code of conduct

Treat contributors and patients with equal respect. Harmful content or
conduct — including disclosure of real patient data, even as 'examples' —
will result in removal from the project.

