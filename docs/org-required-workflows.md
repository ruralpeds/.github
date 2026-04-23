# Org-level required workflows for ruralpeds
#
# This file itself is NOT placed in a repo — it documents the configuration
# you set at:
#   https://github.com/organizations/ruralpeds/settings/actions
#   → Required workflows → Add workflow
#
# Required workflows force the named workflow to run on every push / PR to
# protected branches of the selected repos. Developers can't skip them or
# delete them — the workflow is injected by the org, not the repo.
#
# ────────────────────────────────────────────────────────────────────────
# Setup: after you've pushed ruralpeds/.github with the reusable workflows,
# add thin "dispatcher" workflows inside ruralpeds/.github that GitHub will
# inject into every target repo. These dispatchers just call the reusable
# workflows. Place them at:
#
#   ruralpeds/.github/.github/workflows/required-compliance.yml
#   ruralpeds/.github/.github/workflows/required-audit.yml
#
# Then register each in the org settings. Example dispatcher below:

# ═════════════════════════════════════════════════════════════════════════
# required-compliance.yml  — register this one as a REQUIRED workflow
# ═════════════════════════════════════════════════════════════════════════

name: Required — Compliance

on:
  pull_request:
    branches: [main, master]
  push:
    branches: [main, master]

jobs:
  hipaa:
    # Note: when used as a required workflow, the `uses:` path can be a
    # relative reference into the same .github repo.
    uses: ./.github/workflows/hipaa-compliance.yml
    with:
      # Defaults work for most repos; per-repo overrides go in that repo's
      # own .github/workflows/compliance.yml caller (which can set stricter
      # thresholds but cannot relax the required defaults).
      language: mixed
      phi-scan: true
      sbom: true
      coverage-threshold: 70      # relaxed floor; per-repo can raise
      fda-class: none
      runner-label: 'self-hosted,mac-studio,arm64'
      fail-on: high
    secrets:
      SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}   # inherited from org

# ═════════════════════════════════════════════════════════════════════════
# Registration steps (UI):
#
# 1. Push ruralpeds/.github with these dispatcher workflows
# 2. Go to Org → Settings → Actions → Required workflows
# 3. Click "Add workflow"
# 4. Source: ruralpeds/.github
#    Ref:    main (or a tag once stable)
#    Path:   .github/workflows/required-compliance.yml
# 5. Apply to: All repositories  (or Selected repositories)
# 6. Save
#
# Repeat for required-audit.yml
#
# Once saved, every matching repo automatically runs both workflows on every
# PR and push to protected branches. The workflows appear in repos' Actions
# tabs as "Required — Compliance" and "Required — Audit Log" and cannot be
# disabled or modified from the target repo.
# ═════════════════════════════════════════════════════════════════════════
