# Setting Up Gap Analysis Workflows

**Status:** Complete  
**Last Updated:** 2026-05-04

This guide provides step-by-step instructions for deploying the automated gap analysis workflows to the ruralpeds organization.

---

## What Was Set Up

### 1. Auto Bootstrap Workflow
**File:** `.github/workflows/gap-bootstrap-auto.yml`

Automatically discovers and bootstraps Rust/Julia repos without `.gap-analysis/`.

**Features:**
- Scheduled monthly (first of month, 3 AM EST)
- Manual trigger via `workflow_dispatch`
- Dry run mode for testing
- Creates GitHub issue with results
- Uploads detailed JSON report as artifact

**Manual Trigger:**
```
GitHub UI → Actions → "Auto Bootstrap Gap Analysis — Monthly" → Run workflow
```

### 2. Gap Format Validation Workflow
**File:** `.github/workflows/gap-validate.yml`

Validates gap analysis format in each repository's PR/push workflow.

**Runs when:** `.gap-analysis/` files are modified
**Validates:**
- Status enum values
- Priority values (P0-P4)
- Gap ID format and uniqueness
- Required fields (Status, Priority, Owner, Target Completion)
- P0/P1 gaps have owners and target dates
- Supporting files (schema.md, .gitignore, build-ledger.jsonl)
- JSONL format integrity

**Blocks merge:** Yes (required check)

### 3. Reusable Schema Check Workflow
**File:** `.github/workflows/reusable-gap-schema-check.yml`

Can be called from individual repos' CI to validate gap schema.

**Usage in repo:**
```yaml
gap-schema-check:
  if: hashFiles('.gap-analysis/GAP_ANALYSIS.md') != ''
  uses: ruralpeds/.github/.github/workflows/reusable-gap-schema-check.yml@main
```

### 4. Validation Script
**File:** `scripts/validate_gap_format.py`

Standalone Python script for local validation or CI integration.

**Usage:**
```bash
python3 scripts/validate_gap_format.py --repo . --strict --json-report report.json
```

---

## Deployment Checklist

- [x] Create `gap-bootstrap-auto.yml` workflow
- [x] Create `gap-validate.yml` workflow
- [x] Create `reusable-gap-schema-check.yml` workflow
- [x] Create `validate_gap_format.py` script
- [x] Update `CONTRIBUTING.md` with gap analysis guidelines
- [x] Create `docs/GAP_ANALYSIS_WORKFLOWS.md` documentation
- [x] Test validation script locally
- [x] Commit all changes to `claude/gap-analysis-workflow-5myWP` branch

---

## Quick Start

### For Organization Maintainers

1. **Merge this branch** to main when ready:
   ```bash
   git checkout main
   git pull origin main
   git merge --no-ff claude/gap-analysis-workflow-5myWP
   ```

2. **Trigger first bootstrap** (optional, or wait for monthly schedule):
   - Go to GitHub Actions in `ruralpeds/.github`
   - Click "Auto Bootstrap Gap Analysis — Monthly"
   - Click "Run workflow"
   - (Optional) Check "Dry run" to preview changes

3. **Monitor** the bootstrap:
   - Workflow will create or update an issue with results
   - Check artifacts for detailed report

### For Individual Repo Maintainers

1. **Validation runs automatically** when you modify `.gap-analysis/` files
2. **If validation fails:**
   - Check the workflow output for errors
   - Fix `.gap-analysis/GAP_ANALYSIS.md` or other files
   - Push changes (workflow re-runs automatically)

3. **Test locally** (optional):
   ```bash
   # From your repo root
   python3 ../../.github/scripts/validate_gap_format.py --strict
   ```

---

## Configuration

### Bootstrap Workflow Settings

Modify `gap-bootstrap-auto.yml` if you need to:

- **Change schedule:** Edit the `cron` line (currently `0 8 1 * *` = 1st of month, 8 AM UTC = 3 AM EST)
- **Change target org:** Edit `--org ruralpeds` in the script call
- **Skip certain repos:** Edit `SKIP_REPOS` in `scripts/bootstrap_gap_analysis_new.py`
- **Modify templates:** Edit files in `templates/gap-analysis/`

### Validation Workflow Settings

Modify `gap-validate.yml` if you need to:

- **Change trigger paths:** Edit `paths:` in the `on:` section
- **Add new checks:** Add steps to the validation job
- **Change runner:** Edit `runs-on:` (currently `ubuntu-latest`)
- **Modify error/warning behavior:** Update validation script calls

### Validation Script Strictness

For stricter validation in CI, add `--strict` flag to script calls:

```yaml
- name: Validate (strict)
  run: python3 scripts/validate_gap_format.py --repo . --strict
```

Strict mode treats warnings as errors.

---

## Monitoring and Maintenance

### Monthly Bootstrap Execution

The workflow runs automatically on the 1st of each month. To check results:

1. Go to `ruralpeds/.github` repository
2. Click "Actions" → "Auto Bootstrap Gap Analysis — Monthly"
3. Check the latest workflow run
4. Review the GitHub issue created with results

### Validation Workflow Metrics

Track validation issues by:

1. Searching for failed validation checks in PR list
2. Looking for workflow runs with errors in the "Actions" tab
3. Checking the JSON report in workflow artifacts

### Handling Bootstrap Failures

If the bootstrap workflow fails:

1. Check the workflow run output for specific error
2. Common issues:
   - Rate limiting (retry after 1 hour)
   - Network timeouts (rerun the workflow)
   - Missing template files (check `templates/gap-analysis/`)
3. If persistent, open an issue in `ruralpeds/.github`

### Handling Validation Failures

If validation fails in a PR:

1. Read the workflow output for the specific error
2. Identify which gap(s) have issues
3. Fix according to the validation rules (see `docs/GAP_ANALYSIS_WORKFLOWS.md`)
4. Push changes (validation re-runs automatically)

---

## Testing

### Test the Bootstrap Workflow

**Dry run mode** (preview without changes):
```
GitHub Actions → "Auto Bootstrap Gap Analysis" → Run workflow → Dry run: true
```

**Single repo mode** (bootstrap just one repo):
```
GitHub Actions → "Auto Bootstrap Gap Analysis" → Run workflow → Single repo: rust-sci-core
```

### Test the Validation Workflow

**Locally:**
```bash
# From any repo with .gap-analysis/
python3 ../../.github/scripts/validate_gap_format.py --repo .

# With JSON report
python3 ../../.github/scripts/validate_gap_format.py --repo . --json-report /tmp/report.json

# Strict mode
python3 ../../.github/scripts/validate_gap_format.py --repo . --strict
```

**In CI:** Make a test PR that modifies `.gap-analysis/` files and check the validation workflow

---

## Troubleshooting

### "Workflow not found" when running

**Cause:** Workflows haven't been pushed to the repository yet.

**Solution:** Merge the branch to main:
```bash
git checkout main
git pull
git merge claude/gap-analysis-workflow-5myWP
git push
```

### Bootstrap finds 0 repos to bootstrap

**Cause:** All Rust/Julia repos already have `.gap-analysis/`.

**Solution:** This is expected. Check if the repos that should be bootstrapped are:
- Rust or Julia language
- Not archived
- Don't already have `.gap-analysis/GAP_ANALYSIS.md`

### Validation passes locally but fails in CI

**Cause:** Different environment or cached validation.

**Solution:**
1. Push an empty commit: `git commit --allow-empty -m "Re-run validation"`
2. Or re-run the workflow from Actions tab
3. Check for whitespace/encoding issues in edited files

### "Permission denied" when pushing bootstrap commits

**Cause:** GitHub App token doesn't have sufficient permissions.

**Solution:**
- Check that `TH_BOT_APP_ID` and `TH_BOT_PRIVATE_KEY` secrets are configured
- Verify the bot has write access to the repos
- Check bot permissions in the organization settings

---

## Documentation Reference

- **[GAP_ANALYSIS_WORKFLOWS.md](./GAP_ANALYSIS_WORKFLOWS.md)** — Detailed workflow documentation
- **[GAP_ANALYSIS_LIFECYCLE.md](./GAP_ANALYSIS_LIFECYCLE.md)** — Full lifecycle standard
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** — Contributing guidelines with gap analysis section
- **[scripts/validate_gap_format.py](../scripts/validate_gap_format.py)** — Validation script with inline docs
- **[scripts/bootstrap_gap_analysis_new.py](../scripts/bootstrap_gap_analysis_new.py)** — Bootstrap script

---

## Next Steps

### Immediate (if not already done)

1. Merge branch to main
2. Trigger first bootstrap (or wait for monthly schedule)
3. Monitor results in GitHub issue

### Short Term (Week 1-2)

1. Ensure all existing repos have `.gap-analysis/` (via bootstrap or manual creation)
2. Review any validation failures and fix
3. Update repo branch protection rules to require validation check

### Medium Term (Month 1-2)

1. Monitor monthly bootstrap runs
2. Collect feedback from repo maintainers
3. Iterate on validation rules if needed
4. Update documentation based on real-world usage

---

## Support

For questions, issues, or feature requests:

1. Open an issue in `ruralpeds/.github` with label `gap-analysis`
2. Include:
   - What you were trying to do
   - What happened
   - Expected behavior
   - Steps to reproduce (if bug)

3. Tag: @timothyhartzog

---

**Branch:** claude/gap-analysis-workflow-5myWP  
**Status:** Ready for merge to main  
**Last Updated:** 2026-05-04
