# OpenSSF Scorecard Remediation Plan — Q2-2026

**Initiative:** Q2-2026 Initiative 02: OpenSSF Scorecard Remediation  
**Duration:** 2 weeks (May 1–22, 2026)  
**Owner:** Platform Engineering Team  
**Target:** Both repos ≥7.0 by June 30, 2026

---

## Objective

Remediate 2 repositories below OpenSSF Scorecard 7.0 target:
- `legacy-content-repo` (currently 6.8/10) → target 7.0+
- `educational-simulation` (currently 6.9/10) → target 7.0+

**Success Metric:** Org average scorecard maintained at 8.2+; zero repos below 7.0

---

## Gap Analysis & Remediation Strategy

### Repo 1: legacy-content-repo (6.8 → 7.0+)

**Current Score:** 6.8/10

**Identified Gaps:**
1. ❌ **No CI Pipeline** — Scorecard awards points for automated testing
2. ❌ **Minimal Branch Protection** — No required status checks
3. ❌ **No SBOM Generation** — Scorecard rewards dependency tracking
4. ❌ **No Release Process** — Missing formal release versioning

**Remediation Steps:**

| Step | Action | Artifact | Status |
|------|--------|----------|--------|
| 1 | Deploy CI workflow | `.github/workflows/ci-content.yml` | ✅ Created |
| 2 | Enable branch protection | Require 1 approval + CI checks | ⏳ Pending |
| 3 | Add SBOM generation | Inline in CI workflow | ✅ Created |
| 4 | Create v1.0.0 release | Git tag + GitHub release | ⏳ Pending |

**Expected Score After Remediation:** 7.1–7.3/10

### Repo 2: educational-simulation (6.9 → 7.0+)

**Current Score:** 6.9/10

**Identified Gaps:**
1. ❌ **No Automated Tests** — Missing CI test execution
2. ❌ **Manual Review Only** — No automated enforcement
3. ❌ **No SBOM** — Dependency tracking missing
4. ❌ **No Release Management** — Missing version tags

**Remediation Steps:**

| Step | Action | Artifact | Status |
|------|--------|----------|--------|
| 1 | Deploy Julia CI | `.github/workflows/ci-julia.yml` | ✅ Created |
| 2 | Enable branch protection | Require 1 approval + CI checks | ⏳ Pending |
| 3 | Add SBOM generation | Integrated in Julia CI | ✅ Created |
| 4 | Create v1.0.0 release | Git tag + GitHub release | ⏳ Pending |

**Expected Score After Remediation:** 7.2–7.4/10

---

## Implementation Phase

### Phase 1: Infrastructure Setup (Week 1, May 1–8)

**Task 1.1: Deploy CI Workflows** (2 days)
- ✅ Created `.github/workflows/ci-content.yml` for legacy-content-repo
- ✅ Created `.github/workflows/ci-julia.yml` for educational-simulation
- Status: Ready for merge to main

**Task 1.2: Test Workflow Execution** (1 day)
- Trigger workflows on pull requests to verify execution
- Verify artifacts (SBOM, reports) are generated

**Task 1.3: Baseline Scorecard Assessment** (1 day)
- Run OpenSSF Scorecard for both repos
- Document current scores and gaps
- Identify any additional remediation needs

### Phase 2: Branch Protection & SBOM (Week 2, May 8–15)

**Task 2.1: Enable Branch Protection** (1 day)
- `legacy-content-repo`:
  - Require 1 approval
  - Require status checks: "Content Checks" (ci-content.yml)
  - Dismiss stale reviews: enabled

- `educational-simulation`:
  - Require 1 approval
  - Require status checks: "Julia Tests" (ci-julia.yml)
  - Dismiss stale reviews: enabled

**Task 2.2: Verify SBOM Generation** (1 day)
- Run CI workflows and confirm SBOM artifacts generated
- Review SBOM format (CycloneDX 1.4)

### Phase 3: Release Management (Week 2–3, May 15–22)

**Task 3.1: Create v1.0.0 Releases** (1 day)
- `legacy-content-repo`:
  ```bash
  git tag -a v1.0.0 -m "Initial release - educational content"
  gh release create v1.0.0 \
    --title "Educational Content v1.0.0" \
    --notes "Initial release of educational reference material"
  ```

- `educational-simulation`:
  ```bash
  git tag -a v1.0.0 -m "Initial release - reference implementation"
  gh release create v1.0.0 \
    --title "Educational Simulation v1.0.0" \
    --notes "Initial release of neonatal growth simulator"
  ```

### Phase 4: Verification & Badges (Week 3, May 22–29)

**Task 4.1: Re-run OpenSSF Scorecard** (1 day)
- Execute scorecard for both repos
- Verify both score ≥7.0
- Document before/after comparison

**Task 4.2: Add Scorecard Badges** (1 day)
- Update README.md in both repos with OpenSSF badge:
  ```markdown
  [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/ruralpeds/legacy-content-repo/badge)](https://securityscorecards.dev/viewer/?uri=github.com/ruralpeds/legacy-content-repo)
  ```

---

## Per-Repo Implementation Checklist

### legacy-content-repo

- [x] CI workflow created (ci-content.yml)
- [x] SBOM generation integrated
- [ ] Branch protection enabled (1 approval + CI)
- [ ] v1.0.0 release created
- [ ] Scorecard re-run ≥7.0 verified
- [ ] README badge added
- [ ] Pull request merged to main

### educational-simulation

- [x] CI workflow created (ci-julia.yml)
- [x] SBOM generation integrated
- [ ] Branch protection enabled (1 approval + CI)
- [ ] v1.0.0 release created
- [ ] Scorecard re-run ≥7.0 verified
- [ ] README badge added
- [ ] Pull request merged to main

---

## Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| legacy-content-repo score | 6.8 | ≥7.0 | ⏳ In Progress |
| educational-simulation score | 6.9 | ≥7.0 | ⏳ In Progress |
| Org avg scorecard | 8.2 | ≥8.2 | ✅ Target |
| Repos below 7.0 | 2 | 0 | ⏳ In Progress |
| CI workflows deployed | 0 | 2 | ✅ Complete |
| SBOM generation | 0 | 2 | ✅ Complete |

---

## Timeline & Effort

| Week | Phase | Task | Days | Owner |
|------|-------|------|------|-------|
| Week 1 (May 1–8) | 1: Infrastructure | Deploy workflows, test, baseline | 3 | Eng Lead |
| Week 2 (May 8–15) | 2: Protection & SBOM | Branch protection, verify SBOM | 2 | Eng Team |
| Week 2–3 (May 15–22) | 3: Releases | Create v1.0.0 releases | 1 | Eng Team |
| Week 3 (May 22–29) | 4: Verification | Re-score, badges, merge | 2 | Eng Lead |

**Total:** 2 weeks calendar (8 days effort)

---

## Dependencies

- ✅ GitHub Actions enabled on both repos
- ✅ GitHub branch protection write permissions
- ✅ OpenSSF Scorecard CLI or API access
- ✅ Write access to README files

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| CI workflow fails first-run | Scorecard improvement blocked | Pre-test on branch before merge |
| Branch protection breaks existing workflow | Development disrupted | Test on test branch first |
| Scorecard API rate limit | Verification delayed | Use local Docker runner |

---

## Completion Criteria

- ✅ Both repos have passing CI workflows
- ✅ Branch protection configured and enforced
- ✅ SBOM artifacts generated and validated
- ✅ v1.0.0 releases created for both repos
- ✅ OpenSSF Scorecard ≥7.0 for both repos
- ✅ README badges added and displaying
- ✅ All changes committed to main branch

---

## Next Steps

1. **Week 1:** Deploy workflows and verify CI execution
2. **Week 2:** Enable branch protection and SBOM generation
3. **Week 2–3:** Create releases for both repos
4. **Week 3:** Final scorecard verification and badge integration
5. **Week 4:** Complete Q2 OpenSSF verification (complete by June 15)

---

## Approval & Signature

**Initiative Owner:** Platform Engineering Lead  
**Status:** Implementation In Progress  
**Target Completion:** June 5–15, 2026

Initiative Q2-2026-02: OpenSSF Scorecard Remediation launched.

---

## Reference Documents

- **Initiative Plan:** `copilot-tasks/q2-2026-initiatives/initiative-02-openssf-remediation.md`
- **CI-Content Workflow:** `.github/workflows/ci-content.yml`
- **CI-Julia Workflow:** `.github/workflows/ci-julia.yml`
- **Compliance Target:** Q2 score ≥87/100
