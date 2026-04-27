# Org-level rulesets (`policies/rulesets/`)

These JSON files define [GitHub Repository Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) at the **organization level**. The `sync-rulesets.yml` workflow applies every `*.json` file here to every non-archived, non-fork repo in the org.

## Files

| File | Targets | Purpose |
|------|---------|---------|
| `org-baseline.json` | All repos | Baseline security: signed commits, ≥1 reviewer, no force-push to default |
| `signed-commits-main.json` | `main`, `master`, `release/*` | Strictest: signed commits, linear history, dismiss stale reviews, require last-push approval, PHI-scan required check |
| `qa-develop-protection.json` | `qa`, `develop` | Pre-production branch protection: PR + 1 review + linear history + no force-push + no deletion. Signed commits NOT required (those are reserved for `main`). |
| `org-clinical.json` | Property: `criticality ∈ {clinical-support, clinical-decision, device}` | 2 reviewers, signed commits, required CI/PHI/SBOM/CodeQL/Scorecard checks |
| `org-device.json` | Property: `iec62304-class ∈ {class-b, class-c}` | Stricter still — IEC 62304 traceability, hazard-analysis update enforcement |
| `org-fda-part11.json` | Property: `data-classification = phi-active` or regulated | Part 11 e-signatures, deployment approval gates |
| `org-phi-active.json` | Property: `data-classification = phi-active` | PHI-specific controls; environment manual approval |

## Three-branch flow

The `signed-commits-main.json` + `qa-develop-protection.json` pair together enforce the three-branch promotion model: `develop → qa → main`. See per-repo `docs/BRANCHING_MODEL.md` for the day-to-day workflow.

## How to apply

Changes to any file here trigger `.github/workflows/sync-rulesets.yml` on push to `main`. To apply manually:

1. **Actions tab** → **Sync Rulesets (Governance as Code)** → **Run workflow**
2. Optionally pick `dry-run: true` first to preview
3. Optionally specify `target-repos` (comma-separated) to limit scope

## Adding a new ruleset

1. Drop a `*.json` file in this directory following GitHub's [ruleset schema](https://docs.github.com/en/rest/repos/rules)
2. Set `enforcement: "evaluate"` initially to monitor without blocking
3. Open a PR; CI validates JSON shape
4. After merge, `sync-rulesets.yml` propagates it
5. Once you've verified no false positives, flip to `enforcement: "active"` in a follow-up PR
