---
title: "Add SLSA provenance + attest-sbom to release pipeline"
phase: phase-02
slug: slsa-provenance-attest-sbom
preferred-agent: copilot
preflight-confirmation: true
estimated-complexity: m

depends-on:
  - pin-actions-sha

goal: >
  Every release artifact produced by `ruralpeds/*` gets a cryptographically
  signed SLSA v1.0 provenance attestation and a Sigstore-signed SBOM
  attestation, verifiable via `gh attestation verify`. Brings our posture to
  SLSA Build Level 3 and closes the FDA §524B pre-market cybersecurity
  expectation for binding SBOMs to artifacts.

acceptance-criteria:
  - "New reusable workflow `.github/workflows/reusable-slsa-provenance.yml` calls `actions/attest-build-provenance@v2`"
  - "Existing `reusable-sbom.yml` extended to call `actions/attest-sbom@v2` binding the SBOM to each artifact hash"
  - "Both workflows use keyless OIDC signing (no stored keys)"
  - "Release workflow gains a verification step that runs `gh attestation verify` against the emitted artifacts; fails the release if verification fails"
  - "docs/security/attestations.md explains: what provenance is, what SBOM attestation is, how downstream consumers verify, and the Rekor transparency-log URL pattern"
  - "A sample release in a scratch repo demonstrates end-to-end: attestation visible in the repo's Attestations tab, verifiable via gh CLI"

files-to-touch:
  - ".github/workflows/reusable-slsa-provenance.yml"
  - ".github/workflows/reusable-sbom.yml"
  - ".github/workflows/release.yml"
  - "docs/security/attestations.md"
  - "README.md"

files-not-to-touch:
  - "AGENTS.md"
  - "audit-log/**"
  - ".github/workflows/audit-log.yml"
  - "policies/rulesets/**"
  - "sbom/<any-released-version>/**"

tests-required: |
  - `actionlint` passes on all touched workflows.
  - A smoke-test release on a scratch repo produces attestations visible in the
    repo's Attestations API: `gh api repos/<scratch>/attestations/<subject-sha>`
    returns a non-empty list.
  - `gh attestation verify <artifact> --repo <scratch>` succeeds for the
    scratch release.

standards:
  - "SLSA v1.0 Build Level 3"
  - "FDA §524B (2023 Omnibus Act — Cyber Devices)"
  - "NIST SSDF PS.3 — archive and protect each software release"
  - "NIST SSDF PO.5.2 — use automation where practical"
  - "NTIA Minimum Elements for an SBOM (2021)"
  - "Executive Order 14028 §4"

rollback: >
  Disable the new workflows (comment out the call in `release.yml`). Existing
  artifacts remain signed; new ones fall back to unsigned. Downstream consumers
  can continue to operate since verification is advisory until the
  `org-clinical` ruleset gates on it (separate task).

labels:
  - "security"
  - "supply-chain"
  - "fda-524b"

---

## Context

The org already generates CycloneDX + SPDX SBOMs via `reusable-sbom.yml`. The
SBOMs are committed to `sbom/` and attached to releases — good, but not
**cryptographically bound** to the artifacts. A tampered artifact with an
unchanged SBOM would go undetected.

`actions/attest-build-provenance` emits a signed SLSA v1.0 statement binding
an artifact hash to the exact workflow run, commit, and builder identity.
`actions/attest-sbom` emits a signed in-toto SBOM statement binding the SBOM
file to the artifact hash. Both use Sigstore keyless signing via GitHub's
OIDC identity; signatures land in the Rekor transparency log. Consumers
verify offline with `gh attestation verify` or `cosign verify-attestation`.

This is what FDA reviewers increasingly expect for "Cyber Device" premarket
submissions under §524B and what supply-chain consumers (downstream hospitals,
integrators) will ask for under SBOM-sharing regimes.

## Approach

### 1. `reusable-slsa-provenance.yml`

New reusable workflow:

```yaml
on:
  workflow_call:
    inputs:
      subject-path:
        type: string
        required: true
        description: "Glob of artifacts to attest (e.g. 'dist/*.tar.gz')"
    outputs:
      attestation-url:
        value: ${{ jobs.provenance.outputs.attestation-url }}

permissions:
  id-token: write         # for OIDC
  attestations: write     # for writing attestation
  contents: read

jobs:
  provenance:
    runs-on: ubuntu-latest
    outputs:
      attestation-url: ${{ steps.attest.outputs.attestation-url }}
    steps:
      - uses: actions/checkout@<PINNED_SHA>  # pin per phase-01/task-02
        with: { persist-credentials: false }
      - name: Attest provenance
        id: attest
        uses: actions/attest-build-provenance@<PINNED_SHA>
        with:
          subject-path: ${{ inputs.subject-path }}
```

### 2. Extend `reusable-sbom.yml`

After the existing SBOM generation steps, add:

```yaml
- name: Attest SBOM
  uses: actions/attest-sbom@<PINNED_SHA>
  with:
    subject-path: ${{ inputs.subject-path }}
    sbom-path: "sbom/cyclonedx.json"
```

Requires `attestations: write` permission.

### 3. Modify `release.yml`

After build + provenance + SBOM-attest steps, add verification:

```yaml
- name: Verify attestations
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    set -euo pipefail
    for artifact in dist/*.tar.gz dist/*.whl dist/*.crate; do
      [ -f "$artifact" ] || continue
      echo "::group::Verifying $artifact"
      gh attestation verify "$artifact" --repo "$GITHUB_REPOSITORY"
      echo "::endgroup::"
    done
```

### 4. Document in `docs/security/attestations.md`

Cover:
- What provenance is (binds artifact → build process).
- What SBOM attestation is (binds artifact → components list).
- How a downstream consumer verifies:

  ```bash
  # Download artifact and attestation
  gh release download v1.2.3 -R ruralpeds/<repo> -p '*.tar.gz'
  gh attestation verify mypkg-1.2.3.tar.gz --repo ruralpeds/<repo>
  ```

- How to look up the Rekor entry: the `gh attestation verify` output includes
  a Rekor log index; show the URL pattern.
- Retention: attestations are first-class GitHub objects, retained with the
  repo.

## Verification for this task

Do the smoke test on a scratch repo (e.g. create `ruralpeds/attest-smoketest`):

1. Add a minimal `Cargo.toml` or `package.json`, build a trivial artifact.
2. Call the new workflows from a release trigger.
3. After release, run:

   ```bash
   gh attestation verify dist/smoketest-0.1.tar.gz --repo ruralpeds/attest-smoketest
   ```

   Expected output includes `✓ Verification succeeded!` and a Rekor log index.

4. Open `https://github.com/ruralpeds/attest-smoketest/attestations` and
   confirm the provenance + SBOM attestations are listed with their subject
   digests.

Paste the verify output into the PR description.

## Notes for the agent

- `actions/attest-build-provenance` and `actions/attest-sbom` versions change
  frequently; check for the latest when pinning. Use major-v2 at minimum —
  v1 is deprecated.
- Both actions require `permissions: id-token: write` and
  `permissions: attestations: write` on the calling job. If the calling
  workflow is reusable itself, those permissions must flow through.
- `gh attestation verify` without `--repo` tries the default repo inference;
  always pass `--repo` in CI for determinism.
- On large artifacts (> 1 GB), the sign-step can take minutes. Set a generous
  `timeout-minutes`.

## References

- GitHub: "Using artifact attestations to establish provenance for builds"
- SLSA v1.0 specification (slsa.dev)
- Sigstore / Fulcio / Rekor
- FDA: "Cybersecurity in Medical Devices — Quality System Considerations" (Sept 2023)
- Executive Order 14028 §4, §4(e), §4(n)
