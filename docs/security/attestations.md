# Build Attestations

Every release artifact produced by `ruralpeds/*` carries two cryptographically signed attestations:

1. **Build provenance** — binds the artifact to the exact workflow run, commit SHA, and builder identity that produced it.
2. **SBOM attestation** — binds the Software Bill of Materials to the same artifact digest.

Both use Sigstore keyless signing. No keys are stored or rotated; GitHub's OIDC provider issues short-lived certificates via Fulcio. Signatures are recorded in the Rekor public transparency log.

---

## What Is Build Provenance?

Build provenance answers: *"Who built this artifact, from what source, using what process?"*

A SLSA v1.0 provenance attestation is a signed statement (in-toto format) that includes:

- The **repository** and **commit SHA** of the source code
- The **workflow** name, run ID, and runner environment
- The **SHA-256 digest** of every attested artifact
- A Rekor **log index** that makes the signature auditable and tamper-evident

If an attacker replaces the artifact binary after the release (e.g., by compromising a CDN or registry), the digest in the attestation will no longer match and `gh attestation verify` will fail.

---

## What Is SBOM Attestation?

An SBOM tells you *what's in* the artifact (packages, licenses, versions). An SBOM **attestation** cryptographically binds that SBOM file to the artifact it describes, so downstream consumers can verify:

1. The SBOM was generated for this exact binary (same digest).
2. The SBOM was signed by the same GitHub OIDC identity that built the binary.

This satisfies the FDA §524B requirement to provide SBOMs that are traceable to specific software releases.

---

## Workflows

| Workflow | Purpose |
|---|---|
| `reusable-slsa-provenance.yml` | Emits a signed SLSA v1.0 provenance attestation via `actions/attest-build-provenance` |
| `reusable-sbom.yml` (with `attest-sbom: true`) | Emits a signed SBOM attestation via `actions/attest-sbom` binding the CycloneDX SBOM to the artifact |
| `release.yml` (with `verify-attestations: true`) | Runs `gh attestation verify` as a post-release gate |

### Typical caller pattern

```yaml
jobs:
  build:
    runs-on: [self-hosted, macos]
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
      - name: Build
        run: make dist
      - uses: actions/upload-artifact@50769540e7f4bd5e21e526ee35c689e35e0d6874  # v4.4.0
        with:
          name: release-artifacts
          path: dist/

  sbom:
    needs: build
    uses: ruralpeds/.github/.github/workflows/reusable-sbom.yml@main
    with:
      attest-sbom: true
      subject-path: dist/*.tar.gz
      artifact-name: release-artifacts   # download from build job
    permissions:
      contents: write
      id-token: write
      attestations: write

  provenance:
    needs: build
    uses: ruralpeds/.github/.github/workflows/reusable-slsa-provenance.yml@main
    with:
      subject-path: dist/*.tar.gz
      artifact-name: release-artifacts   # download from build job
    permissions:
      id-token: write
      attestations: write

  release:
    needs: [sbom, provenance]
    uses: ruralpeds/.github/.github/workflows/release.yml@main
    with:
      verify-attestations: true   # gates on attestations being in the store
    permissions:
      contents: write
```

---

## Verifying Attestations

### Command-line verification

```bash
# Download the artifact from a release
gh release download v1.2.3 \
  -R ruralpeds/my-repo \
  -p '*.tar.gz'

# Verify SLSA provenance
gh attestation verify myapp-1.2.3.tar.gz \
  --repo ruralpeds/my-repo

# Expected output:
# ✓ Verification succeeded!
#
# The following policy criteria were met:
#   - SLSA Level 3 (or equivalent)
#   - Source: ruralpeds/my-repo
#   - Workflow: .github/workflows/release.yml
#   - Commit: <SHA>
```

### What successful output looks like

```
Loaded digest sha256:abc123... for file myapp-1.2.3.tar.gz

The following 2 attestation(s) were matched:
- Attestation #1
  - Subject:      myapp-1.2.3.tar.gz
  - Digest:       sha256:abc123...
  - GitHub repo:  ruralpeds/my-repo
  - Workflow:     .github/workflows/reusable-slsa-provenance.yml@refs/tags/v1.2.3
  - Commit:       <full-commit-sha>
  - Run ID:       12345678
  - Rekor log:    https://search.sigstore.dev/?logIndex=<index>

✓ Verification succeeded!
```

### Viewing the Rekor log entry

Every attestation is recorded in the Rekor public transparency log. The `gh attestation verify` output includes a log index. The Rekor entry URL follows this pattern:

```
https://search.sigstore.dev/?logIndex=<log-index>
```

The Rekor entry contains:
- The signed in-toto statement (attestation body)
- The Sigstore certificate chain (Fulcio CA → GitHub OIDC claim)
- The inclusion proof (Merkle path in the Rekor log)

### Verifying SBOM attestation

```bash
# Verify that the SBOM is bound to the artifact
gh attestation verify myapp-1.2.3.tar.gz \
  --repo ruralpeds/my-repo \
  --predicate-type https://spdx.dev/Document
```

---

## Browsing Attestations in the GitHub UI

Every attestation is a first-class GitHub object, retained with the repository.

Navigate to:
```
https://github.com/ruralpeds/<repo>/attestations
```

Or via the API:
```bash
gh api repos/ruralpeds/<repo>/attestations/<digest>
```

Where `<digest>` is the `sha256:<hex>` digest of the artifact.

---

## Retention

Attestations are retained as long as the repository exists. They are not subject to the 90-day artifact retention policy. GitHub stores attestation objects indefinitely for the lifetime of the repository.

---

## Regulatory Mapping

| Standard | Requirement | How attestations satisfy it |
|---|---|---|
| FDA §524B (Omnibus 2023) | SBOM required for Cyber Devices; SBOM must be traceable to the specific release | SBOM attestation cryptographically binds the SBOM to the artifact digest |
| EO 14028 §4 | Software supply chain transparency | SLSA provenance attestation published to Rekor public log |
| NIST SSDF PS.3.2 | Archive and protect each software release | Attestations are immutable GitHub objects; Rekor log is append-only |
| NIST SSDF PO.5.2 | Use automation where practical | Attestation generation is fully automated in CI/CD |
| SLSA v1.0 Build Level 3 | Provenance generated by a hosted build platform; signed with an ephemeral key | GitHub-hosted runners + Sigstore keyless OIDC signing |
| NTIA Minimum Elements | SBOM must be associated with the specific release artifact | `attest-sbom` embeds the artifact digest in the signed statement |

---

## Troubleshooting

**Verification fails with "no attestations found"**

The attestation job in CI may not have run, or the artifact you downloaded doesn't match the one that was attested. Confirm the artifact SHA-256:
```bash
sha256sum myapp-1.2.3.tar.gz
```
Compare against the digest shown in the release or the `gh attestation verify` error output.

**`gh attestation verify` returns "invalid certificate"**

This usually means the Sigstore certificate has a different OIDC claim than expected. The `--repo` flag must exactly match the `github.repository` value used during the build (`owner/repo`).

**`id-token: write` permission denied**

The calling workflow must grant `id-token: write` and `attestations: write`. For reusable workflows, these permissions must be listed in the calling job, not just the called workflow:

```yaml
jobs:
  provenance:
    uses: ruralpeds/.github/.github/workflows/reusable-slsa-provenance.yml@main
    permissions:
      id-token: write
      attestations: write
```
