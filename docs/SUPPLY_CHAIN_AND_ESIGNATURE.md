# Supply-Chain Attestation & 21 CFR Part 11 E-Signatures

This document covers four new workflows added in the `enterprise/p1-supply-chain-esig` branch:

- `reusable-slsa.yml` — SLSA Level 3 build provenance
- `reusable-sign-artifact.yml` — cosign keyless artifact signing
- `reusable-attest.yml` — GitHub-native build attestations (lighter-weight SLSA alternative)
- `review-stamp-v2.yml` — 21 CFR Part 11 compliant electronic signatures

Together with the P0 `reusable-sbom.yml`, these form the complete supply-chain evidence package that hospitals and regulators increasingly demand.

---

## The four-part supply-chain evidence package

For every release of a clinical repo, the following four artifacts travel together:

| Artifact | Answers the question | Produced by |
|---|---|---|
| `sbom.cyclonedx.json` | **What's in this release?** — exact component inventory | `reusable-sbom.yml` |
| `slsa.intoto.jsonl` | **How was this built?** — who, what workflow, what source, what ref | `reusable-slsa.yml` |
| `<artifact>.sig.bundle` | **Is this the real binary?** — cryptographic signature | `reusable-sign-artifact.yml` |
| `esignatures.jsonl` entry | **Who approved this release and with what meaning?** | `review-stamp-v2.yml` |

Plus the reviewable manifest already present: `audit-log/ledger.json` (build/review history).

---

## SLSA L3 vs. GitHub Attestations: which to use?

| Criterion | `reusable-slsa.yml` | `reusable-attest.yml` |
|---|---|---|
| SLSA level achieved | L3 (certified) | L2 baseline, up to L3 with hardened setup |
| Verification tool | `slsa-verifier` (official SLSA community tool) | `gh attestation verify` (GitHub CLI) |
| Standalone file? | Yes — `.intoto.jsonl` travels with the release | Yes — stored on GitHub |
| Regulated-context acceptability | ✅ Preferred for FDA submissions | ✅ Acceptable for most healthcare contracts |
| Learning curve | Higher (requires understanding of base64 subjects) | Lower (one-liner) |
| Recommended for | Category 5 custom clinical releases | Category 4 libraries, developer tools |

**Rule of thumb:** Use `reusable-slsa.yml` for the `Peds` clinical decision-support releases. Use `reusable-attest.yml` for `BioStatistics.jl`, `rust-sci-core`, and other library releases.

You can also run both — they produce non-overlapping evidence.

---

## Example: full compliance release workflow

Drop into a clinical repo as `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags: ["v*"]

permissions:
  contents: read

jobs:
  # 1. Build the artifact(s)
  build:
    runs-on: ubuntu-latest
    outputs:
      hashes: ${{ steps.hash.outputs.hashes }}
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: make dist
      - name: Compute artifact hashes (base64 for SLSA)
        id: hash
        run: |
          cd dist
          # SHA-256 hashes of each artifact, base64-encoded as SLSA expects
          HASHES=$(sha256sum * | base64 -w0)
          echo "hashes=$HASHES" >> "$GITHUB_OUTPUT"
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  # 2. SBOM (from P0)
  sbom:
    needs: build
    uses: timothyhartzog/.github/.github/workflows/reusable-sbom.yml@main
    with:
      sbom-format: cyclonedx
      commit-sbom: true
      attach-to-release: true
    permissions:
      contents: write

  # 3. SLSA L3 provenance
  provenance:
    needs: build
    permissions:
      id-token: write
      contents: write
      actions: read
    uses: timothyhartzog/.github/.github/workflows/reusable-slsa.yml@main
    with:
      artifacts-hash-base64: ${{ needs.build.outputs.hashes }}
      upload-assets: true

  # 4. cosign keyless signatures
  sign:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: write
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: timothyhartzog/.github/.github/workflows/reusable-sign-artifact.yml@main
        with:
          artifact-paths: |
            dist/*.whl
            dist/*.tar.gz

  # 5. Audit ledger
  audit:
    if: always()
    needs: [build, sbom, provenance, sign]
    uses: timothyhartzog/.github/.github/workflows/audit-log.yml@main
    with:
      include-deps: true
    permissions:
      contents: write
```

After this runs, the release has: artifact(s), SBOM, SLSA attestation, cosign signatures — all discoverable in the GitHub Release UI and verifiable by an external party.

---

## Example: e-signature on a CAPA closure

When closing a CAPA in the `Github-workflow` archive repo:

```bash
gh workflow run "Review Stamp v2 (21 CFR Part 11 E-Signature)" \
  --repo timothyhartzog/Github-workflow \
  -f reviewer=timothyhartzog \
  -f meaning=capa-closed \
  -f notes="CAPA-2026-003: effectiveness confirmed via 90-day observation; no recurrence observed; linked PR #42."
```

Result:
- A signed Git tag `review/<sha>/<reviewer>/capa-closed/<ts>` is created
- The e-signature is logged to `audit-log/esignatures.jsonl`
- A human-readable entry is appended to `audit-log/esignatures.md`
- The audit trail satisfies 21 CFR Part 11 §11.50, §11.70, §11.10(e)

### Controlled-vocabulary meanings

The `meaning` input accepts only these values (enforced by the workflow):

| Value | Use case |
|---|---|
| `verified` | Content reviewed and understood |
| `approved` | Approved for merge to main |
| `approved-release` | Approved for release to production |
| `risk-accepted` | Residual risk formally accepted |
| `deviation-approved` | Deviation from spec approved |
| `capa-closed` | CAPA effectiveness confirmed |
| `access-reviewed` | Quarterly access review completed |
| `policy-approved` | Policy change approved |
| `urs-approved` | User requirement approved |
| `design-approved` | Design specification approved |

To add a new meaning, PR against `review-stamp-v2.yml` — requires the policy review process so the controlled vocabulary itself stays governed.

---

## Verification examples (for your hospital partners)

Ship this section to any hospital IT / procurement team that asks about supply-chain integrity:

### Verify SBOM
```bash
# SBOM travels with the release; just download and open
gh release download <tag> --repo timothyhartzog/<repo> --pattern 'sbom*'
jq '.metadata' sbom.cyclonedx.json
```

### Verify SLSA provenance
```bash
# Install slsa-verifier
go install github.com/slsa-framework/slsa-verifier/v2/cli/slsa-verifier@v2.6.0

slsa-verifier verify-artifact <artifact> \
  --provenance-path <artifact>.intoto.jsonl \
  --source-uri github.com/timothyhartzog/<repo> \
  --source-tag <tag>
```

### Verify cosign signature
```bash
cosign verify-blob <artifact> \
  --bundle <artifact>.sig.bundle \
  --certificate-identity-regexp \
    '^https://github\.com/timothyhartzog/<repo>/\.github/workflows/.*@refs/tags/<tag>$' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

### Verify GitHub attestation
```bash
gh attestation verify <artifact> --repo timothyhartzog/<repo>
```

### Verify e-signature tag
```bash
# The tag's message includes all §11.50 signature manifestations
git show <review-tag>
```

---

## Regulatory mapping summary

| Regulation | Citation | Workflow satisfying |
|---|---|---|
| FDA Premarket Cybersecurity | Section 524B | `reusable-sbom.yml` + `reusable-slsa.yml` + `reusable-sign-artifact.yml` |
| Executive Order 14028 | §4(e) | `reusable-sbom.yml` + `reusable-slsa.yml` |
| NIST SSDF | PS.2.1 integrity | `reusable-sign-artifact.yml` |
| NIST SSDF | PS.3.2 archive & protect | `reusable-slsa.yml` + `reusable-sbom.yml` |
| 21 CFR Part 11 | §11.50(a)(1-3) | `review-stamp-v2.yml` |
| 21 CFR Part 11 | §11.70 signature/record linking | `review-stamp-v2.yml` (tree hash + signed tag) |
| 21 CFR Part 11 | §11.10(e) audit trail | `review-stamp-v2.yml` (esignatures.jsonl) |
| 21 CFR Part 11 | §11.200 MFA | `review-stamp-v2.yml` (org 2FA enforcement) |
| HIPAA | §164.312(c)(1) integrity | `reusable-sign-artifact.yml` |
| HIPAA | §164.312(b) audit controls | `review-stamp-v2.yml` |
| CISA SSDF Attestation Common Form | Mar 2024 | `reusable-slsa.yml` + `reusable-attest.yml` |
| EU Cyber Resilience Act | (est. 2027) | Full stack |

---

## Adoption plan

| Phase | Repos | Workflows |
|---|---|---|
| Pilot | `BioStatistics.jl` | `reusable-attest.yml` on releases |
| Expansion | `rust-sci-core`, `PedNeoSim.jl` | Add `reusable-sbom.yml` + `reusable-attest.yml` |
| Full compliance | `Peds` | All four P1 workflows on every release |
| Migration | `Github-workflow` | `review-stamp-v2.yml` for CAPA closures, policy approvals, access reviews |

Non-clinical repos (`theology-analysis`, `Claude-artifacts`) do not need these workflows but may adopt for uniformity.

---

## What changes vs. review-stamp v1

`review-stamp.yml` (v1) is preserved for backward compatibility. It continues to work for non-regulated review logging.

`review-stamp-v2.yml` adds:
1. **Controlled-vocabulary `meaning` input** — rejects freeform strings; must be one of 10 defined values
2. **Required 2FA advisory** — relies on GitHub org-level 2FA policy
3. **Tree-hash capture** — cryptographically links the signature to the file-tree state at the moment of signing
4. **Signed Git tag** — creates a first-class, fetchable, tamper-evident record of the signing event
5. **Separate JSONL ledger** — `esignatures.jsonl` distinct from build ledger
6. **Printed name retrieval** — pulls the reviewer's real name from GitHub API for §11.50(a)(1)
7. **Full regulatory envelope** — each entry lists the exact 21 CFR Part 11 sections it satisfies

Migration: Category 4/5 repos should replace v1 references with v2 over the next release cycle. No automated migration required; v1 entries remain valid historical records.
