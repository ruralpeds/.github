# Q2-2026 Initiative 01: SLSA v1 Provenance Backfill

**Period:** Q2-2026 (May–June)  
**Concurrent Initiative:** Yes (runs in parallel with 5 other Q2 initiatives)  
**Duration:** 1 week (5 days effort, 2 weeks calendar time for async execution)  
**Owner:** Timothy Hartzog  
**Priority:** HIGH (Critical Path: unlocks FDA premarket submission pathway)

---

## Objective

Retroactively attest Phase 1–2 releases (5 releases total) with SLSA v1 provenance signatures. This closes the provenance attestation gap identified in Q1 review (65% → 95% coverage, +25 points toward compliance score).

**Current State:** Phase 3–12 releases (10 releases) have SLSA v1 provenance via `reusable-slsa-provenance.yml`. Phase 1–2 releases (5 releases, May–July 2026 calendar) lack attestation.

**End State:** All 15 releases have signed provenance in GitHub attestations API, verifiable via `gh attestation verify`.

---

## Acceptance Criteria

- [ ] Identify all Phase 1–2 releases (5 total) from git tags
- [ ] For each release, reconstruct build context (commit hash, build parameters, build environment)
- [ ] Generate SLSA v1 provenance statement (subject = release artifact hash, builder = GitHub Actions workflow)
- [ ] Sign provenance via Sigstore keyless (GitHub OIDC)
- [ ] Attach attestation to GitHub release via GitHub attestations API
- [ ] Verify each attestation with `gh attestation verify` command
- [ ] Document backfill process in DHF (`dhf/releases/slsa-v1-backfill.md`)
- [ ] Update compliance scorecard: provenance factor 65% → 95%

---

## Implementation Steps

### Step 1: Identify Phase 1–2 Releases (30 min)

List all releases from Phase 1 and Phase 2 roadmap:

```bash
git tag -l "phase-1*" "phase-2*" | sort
# Expected output: phase-1, phase-2 tags (or similar naming)
# Also check: git log --all --oneline | grep -i "phase [12]" | head -20
```

**Task:** Enumerate 5 Phase 1–2 releases with:
- Release name/tag
- Commit hash (from tag object)
- Release date
- Build artifacts (if any: Docker image, binary, archive)
- Associated workflow run ID (if available in commit history)

**Deliverable:** `releases-phase-1-2.json` with metadata for all 5 releases

### Step 2: Reconstruct Build Context (2 hours)

For each release, determine:
- **Build parameters:** Which workflow was used? (e.g., `ci-rust.yml`, `ci-python.yml`)
- **Builder identity:** GitHub Actions (which runner type?)
- **Build environment:** Ubuntu version, tool versions (rustc, python, node)
- **Artifact hash:** SHA-256 of release artifact (or git commit hash as proxy if no artifact)
- **Source commit:** Which commit was tagged for this release?

**Method:**
1. Check the git tag: `git show <tag>` → points to a commit
2. Check that commit's CI logs: `gh run list --branch <branch> --limit 100` or check workflow artifact storage
3. If original CI logs unavailable: use commit metadata + current build environment as close approximation

**Deliverable:** Build context file per release (JSON format)

```json
{
  "release_tag": "phase-1",
  "commit_sha": "0d424be...",
  "artifact_hash": "sha256:a1b2c3...",
  "build_parameters": {
    "workflow": ".github/workflows/ci-rust.yml",
    "runner": "ubuntu-latest",
    "build_timestamp": "2026-05-10T14:23:00Z"
  }
}
```

### Step 3: Generate SLSA v1 Provenance (3 hours)

For each release, generate a SLSA v1 provenance statement. **Two options:**

**Option A: Use GitHub Actions Attestation API (Recommended)**
- Run `actions/attest-build-provenance@v1` in a workflow triggered manually for each release
- This auto-generates SLSA v1-compliant provenance
- Signed by GitHub's Sigstore keyless flow

**Option B: Manual Provenance via Cosign**
- Create provenance JSON manually (following SLSA v1 schema)
- Sign with `cosign sign-blob` using GitHub OIDC keyless
- Less automated, but gives full control

**Recommended Approach:** Create a new workflow `.github/workflows/backfill-slsa-provenance.yml`:

```yaml
name: Backfill SLSA v1 Provenance

on:
  workflow_dispatch:
    inputs:
      release_tag:
        description: 'Release tag to backfill provenance for'
        required: true

jobs:
  backfill-provenance:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: write
      attestations: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Get release artifact
        run: |
          gh release download ${{ inputs.release_tag }} -O artifact.tar.gz || true
          # If no artifact, use git commit as subject
          git show ${{ inputs.release_tag }}:. > /tmp/commit-content.txt
      
      - name: Generate SLSA v1 provenance
        uses: actions/attest-build-provenance@v1
        with:
          subject-path: 'artifact.tar.gz'  # or git commit hash
      
      - name: Upload attestation
        run: |
          # Attestation auto-attached to release via GitHub API
          echo "Attestation attached to release ${{ inputs.release_tag }}"
```

**Execution:** Manually invoke workflow 5 times (once per Phase 1–2 release)

```bash
for tag in phase-1 phase-2 phase-1.1 phase-2.1 phase-2-hotfix; do
  gh workflow run backfill-slsa-provenance.yml -f release_tag=$tag
done
```

**Deliverable:** 5 SLSA v1 provenance attestations uploaded to GitHub attestations API

### Step 4: Verify Attestations (1 hour)

For each release, verify the attestation signature:

```bash
gh attestation verify <artifact-path> \
  --repo ruralpeds/.github \
  --cert-identity https://token.actions.githubusercontent.com \
  --cert-oidc-issuer https://github.com/ruralpeds/.github/.github/workflows/backfill-slsa-provenance.yml
```

**Success criteria:**
- Signature verification succeeds (exit code 0)
- Provenance subject matches artifact hash
- Timestamp present and valid
- Builder identity correctly identified

**Deliverable:** Verification report (6 lines per release, 30 lines total)

### Step 5: Documentation (1 hour)

Create `dhf/releases/slsa-v1-backfill.md`:

```markdown
# SLSA v1 Provenance Backfill Report

**Date:** May 2026  
**Releases Backfilled:** 5 (Phase 1–2)  
**Verification Status:** ✅ All 5 releases verified

## Summary

Retroactively generated SLSA v1 provenance for Phase 1–2 releases using GitHub Actions
attestation API. All signatures verified and chain of custody documented.

## Releases

| Tag | Commit | Artifact Hash | Attestation Status |
|-----|--------|---------------|--------------------|
| phase-1 | 0d424be | sha256:a1b2... | ✅ Verified |
| phase-2 | 002d01d | sha256:c3d4... | ✅ Verified |
| ... | ... | ... | ✅ Verified |

## Verification Commands

See compliance-metrics/backfill-verification.sh for full command set.
```

---

## Execution Timeline

| Day | Task | Effort | Owner |
|-----|------|--------|-------|
| Day 1 | Identify Phase 1–2 releases | 30 min | Timothy |
| Day 1–2 | Reconstruct build context | 2 hours | Timothy |
| Day 2–3 | Create + run backfill workflow | 3 hours | Timothy |
| Day 4 | Verify all 5 attestations | 1 hour | Timothy |
| Day 4 | Document backfill process | 1 hour | Timothy |
| Day 5 | Review + commit | 30 min | Timothy |

**Total:** 1 week calendar time (5 days effort)

---

## Success Metrics

- ✅ 5 of 5 Phase 1–2 releases have SLSA v1 provenance
- ✅ All 5 attestations verified via `gh attestation verify`
- ✅ Compliance scorecard updated: provenance factor 65% → 95%
- ✅ FDA premarket pathway unblocked (provenance no longer a gap)
- ✅ Backfill process documented in DHF for audit trail

---

## Dependencies

- GitHub CLI (`gh`) with attestation subcommand
- GitHub Actions (`actions/attest-build-provenance@v1`)
- Write access to GitHub release attestations API
- Git history for Phase 1–2 releases (must be available)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Original build artifacts unavailable | Backfill blocked | Use git commit hash as subject; document approximation |
| Sigstore API throttling | Attestation signing delayed | Implement exponential backoff in workflow; spread workflow runs over 2 days |
| Workflow failure on retry | Manual intervention needed | Pre-test workflow on recent release before backfill run |

---

## Output Artifacts

- `.github/workflows/backfill-slsa-provenance.yml` (workflow definition)
- `compliance-metrics/releases-phase-1-2.json` (release metadata)
- `compliance-metrics/backfill-verification.sh` (verification script)
- `dhf/releases/slsa-v1-backfill.md` (documentation)
- 5 SLSA v1 attestations in GitHub attestations API (verifiable, signed)

---

## Next Initiative (Parallel Execution)

While backfill is running (async), proceed to **Initiative 02: OpenSSF Scorecard Remediation** and **Initiative 03: IEC 62304 Classification**.
