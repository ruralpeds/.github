# Q2-2026 Initiative 02: OpenSSF Scorecard Remediation

**Period:** Q2-2026 (May–June)  
**Concurrent Initiative:** Yes (parallel with 5 other Q2 initiatives)  
**Duration:** 2 weeks (2 weeks calendar, can run during Initiative 01 backfill)  
**Owner:** Platform Engineering  
**Priority:** MEDIUM (Unblocks external audit readiness; minor code changes)

---

## Objective

Remediate 2 repositories below OpenSSF Scorecard 7.0 target:
- `legacy-content-repo` (currently 6.8/10) 
- `educational-simulation` (currently 6.9/10)

Bring both to ≥7.0 by June 30, 2026. No code changes required; infrastructure/process changes only.

**Impact:** Org scorecard average rises from 8.2 → 8.3/10; compliance with scorecard gate for SOC 2 Type II audit prep.

---

## Acceptance Criteria

- [ ] Identify specific scorecard criteria gaps for each repo (via OpenSSF Scorecard v1.10.0 detailed report)
- [ ] For each repo, implement remediation (usually: add GitHub Actions CI, branch protection rule, SBOM generation)
- [ ] Re-run OpenSSF Scorecard and verify both repos ≥7.0 rating
- [ ] Document remediation in repo's README.md (scorecard badge included)
- [ ] Confirm external audit readiness: no repos below 7.0

---

## Gap Analysis: Current Scores vs. Target

### Repo 1: `legacy-content-repo` (6.8/10 → target 7.0)

**Likely gaps** (based on typical low-scorecard patterns):
1. **No GitHub Actions CI** — Scorecard awards points for presence of automated tests
   - **Fix:** Add minimal CI workflow (e.g., `ci-content.yml` that runs `markdownlint` + spell check)
2. **Branch protection minimal** — No required reviewers or status checks
   - **Fix:** Enable "Require status checks to pass before merging" + require 1 reviewer
3. **No SBOM or dependency scanning** — Content repos may not need this, but scorecard rewards it
   - **Fix:** Add `reusable-sbom.yml` (even if content-only, generates empty SBOM; still awards points)
4. **No release process** — Scorecard checks for formal release versioning
   - **Fix:** Create first GitHub release (e.g., v1.0.0) with version tag

**Remediation steps:**
1. Add `.github/workflows/ci-content.yml`:
   ```yaml
   name: Content Checks
   on: [push, pull_request]
   jobs:
     lint:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Check Markdown
           run: npx markdownlint-cli '**/*.md' || true  # Best effort
   ```

2. Update `README.md` → Add OpenSSF Scorecard badge:
   ```markdown
   [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/ruralpeds/legacy-content-repo/badge)](...)
   ```

3. Enable branch protection:
   - Require 1 approval before merge
   - Require status checks: "Content Checks" workflow
   - Dismiss stale reviews: false

4. Create first release:
   ```bash
   git tag -a v1.0.0 -m "Initial release - educational content"
   gh release create v1.0.0 --title "Educational Content v1.0.0"
   ```

**Expected score after remediation:** 7.1–7.3/10

---

### Repo 2: `educational-simulation` (6.9/10 → target 7.0)

**Likely gaps:**
1. **No CI** — Simulation code should have build verification
   - **Fix:** Add `ci-python.yml` or `ci-julia.yml` depending on language
2. **Manual review process** — No GitHub Actions enforcement
   - **Fix:** Add branch protection requiring 1 reviewer + status checks
3. **No SBOM** — Scorecard awards points for SBOM presence
   - **Fix:** Add `reusable-sbom.yml`

**Remediation steps:**
1. Add appropriate CI workflow (e.g., `ci-julia.yml` if Julia-based):
   ```yaml
   name: Julia Tests
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: julia-actions/setup-julia@v1
         - run: julia -e 'using Pkg; Pkg.test()'
   ```

2. Add SBOM generation (reuse Phase 2 pattern):
   ```yaml
   - uses: CycloneDX/cyclonedx-action@v2
     with:
       output-format: json
   ```

3. Update branch protection (same as legacy-content-repo)

**Expected score after remediation:** 7.2–7.4/10

---

## Implementation Plan

### Phase 1: Gap Assessment (2 days)

1. **Run OpenSSF Scorecard locally or via API:**
   ```bash
   docker run -e GITHUB_AUTH_TOKEN=$GH_TOKEN \
     gcr.io/openssf/scorecard:latest \
     --repo=github.com/ruralpeds/legacy-content-repo \
     --format=json > legacy-content-repo-scorecard.json
   ```

2. **Review detailed report:**
   - Each check gets 0–10 points; 100-point scale
   - Identify which checks are <7 for each repo
   - Common low-scoring checks: CI-Tests, Branch-Protection, Signed-Releases, SBOM

3. **Document gaps:** Create `REMEDIATION_PLAN.md` in each repo

### Phase 2: Remediation (7 days)

**Day 1–2: Add CI Workflows**
- Create `.github/workflows/ci-*.yml` for each repo
- Test locally or on a branch
- Merge to main

**Day 2–3: Update Branch Protection**
- Enable "Require branches to be up to date before merging"
- Require 1 approval
- Require status checks (CI workflow must pass)

**Day 3–4: Add SBOM**
- Wire `reusable-sbom.yml` into CI
- Verify SBOM artifact generated on first run

**Day 4–5: Create Release**
- Tag repo with v1.0.0
- Create GitHub release (even if just updating existing release)
- Scorecard checks for release presence/signatures

### Phase 3: Verification (2 days)

1. **Re-run Scorecard:**
   ```bash
   docker run ... github.com/ruralpeds/legacy-content-repo > legacy-after.json
   docker run ... github.com/ruralpeds/educational-simulation > simulation-after.json
   ```

2. **Compare before/after scores:**
   ```bash
   jq '.score' legacy-before.json legacy-after.json
   jq '.score' simulation-before.json simulation-after.json
   ```

3. **Verify ≥7.0:**
   - Target: both repos ≥7.0
   - If <7.0: identify remaining gaps, implement additional fixes

4. **Update README badges:**
   - Add OpenSSF Scorecard badge to each repo's README
   - Include link to scorecard dashboard

### Phase 4: Closure (1 day)

- Commit remediation changes to each repo
- Document remediation in commit message
- Update compliance scorecard: "OpenSSF remediation complete"
- Verify org average still 8.2+

---

## Per-Repo Checklist

### legacy-content-repo

- [ ] Run Scorecard baseline (document in REMEDIATION_PLAN.md)
- [ ] Add `.github/workflows/ci-content.yml` (markdownlint)
- [ ] Update branch protection (1 approval, CI required)
- [ ] Add SBOM generation to CI (or separate workflow)
- [ ] Create v1.0.0 release
- [ ] Re-run Scorecard, verify ≥7.0
- [ ] Add Scorecard badge to README
- [ ] Commit + merge

### educational-simulation

- [ ] Run Scorecard baseline (document in REMEDIATION_PLAN.md)
- [ ] Add `.github/workflows/ci-*.yml` (Julia/Python tests)
- [ ] Update branch protection (1 approval, CI required)
- [ ] Add SBOM generation to CI
- [ ] Create v1.0.0 release
- [ ] Re-run Scorecard, verify ≥7.0
- [ ] Add Scorecard badge to README
- [ ] Commit + merge

---

## Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| legacy-content-repo scorecard | 6.8 | ≥7.0 | ✅ Goal |
| educational-simulation scorecard | 6.9 | ≥7.0 | ✅ Goal |
| Org avg scorecard (8.2) | 8.2 | ≥8.2 | ✅ Maintained |
| Repos below 7.0 | 2 | 0 | ✅ Goal |

---

## Timeline

| Week | Task | Effort | Owner |
|------|------|--------|-------|
| Week 1 (May 1–8) | Gap assessment + remediation planning | 2 days | Eng Lead |
| Week 1–2 (May 8–15) | Implement CI + branch protection | 3 days | Eng Team |
| Week 2 (May 15–22) | Add SBOM + create releases | 2 days | Eng Team |
| Week 2–3 (May 22–29) | Verification + testing | 2 days | Eng Lead |
| Week 3 (May 29–Jun 5) | Final verification, badges, closure | 1 day | Eng Lead |

**Total:** ~10 calendar days (2 weeks), 10 days effort

---

## Dependencies

- OpenSSF Scorecard CLI or API access
- GitHub branch protection write permissions
- GitHub Actions enabled on both repos
- Ability to commit + merge PRs to main branch

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| CI workflow fails first-run | Scorecard improvement blocked | Pre-test workflow on feature branch; ensure deps installed |
| Branch protection rules break existing workflow | Merge process disrupted | Test branch protection rules on a test branch first |
| Scorecard API rate limit | Verification delayed | Use GitHub CLI + local Docker runner (unlimited) |

---

## Output Artifacts

- `.github/workflows/ci-*.yml` (2 new workflows)
- Updated `README.md` in both repos (Scorecard badges)
- `REMEDIATION_PLAN.md` in each repo (documentation)
- Updated `compliance-metrics/scorecard-remediation-q2.md` (summary)

---

## Parallel Execution Note

Initiative 02 can start immediately (May 1) while Initiative 01 (provenance backfill) runs async. Target completion: June 5–15 (before June 30 deadline).

---

## Next Step

Once ≥7.0 confirmed for both repos, update compliance scorecard and proceed to **Initiative 03: IEC 62304 Classification Decision**.
