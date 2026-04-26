---
title: "Implement Keyless Container Image Signing (cosign)"
phase: phase-02
slug: container-sign-cosign
preferred-agent: copilot
preflight-confirmation: false

goal: >
  Create reusable-container-sign.yml workflow for keyless container image signing.
  Integrate with existing container.yml to sign images pushed to GHCR after each build.
  Enable supply-chain verification of container provenance.

acceptance-criteria:
  - "reusable-container-sign.yml exists and uses cosign v2.2.2+"
  - "Workflow uses GitHub OIDC + Sigstore Fulcio (keyless)"
  - "Images can be verified: cosign verify --certificate-identity-regexp=... <image>"
  - "Signed images include attestation reference"
  - "Signature recorded in audit log"
  - "Workflow callable from container.yml or standalone"
  - "Documentation includes verification command examples"
  - "Integrated with ci-*.yml templates for common stacks"

files-to-touch:
  - ".github/workflows/reusable-container-sign.yml"
  - ".github/workflows/container.yml"
  - "docs/compliance/STANDARDS_MAP.md"

files-not-to-touch:
  - "audit-log.yml"
  - "policies/**"
  - "copilot-tasks/**"

tests-required: |
  - Build a test container image locally
  - Push to GHCR (test repo)
  - Trigger reusable-container-sign.yml with image URI
  - Verify: cosign verify --certificate-identity-regexp=... passes
  - Verify: cosign tree shows signature attestation
  - Test in isolation (called from a different repo)

standards:
  - "NIST SP 800-218 (SSDF) PO.3 — Provenance verification"
  - "SLSA v1.0 Framework — signed container artifacts"
  - "FDA Section 524B — supply-chain security"

rollback: >
  Delete reusable-container-sign.yml; container.yml continues to push unsigned.
  Existing signed images remain valid (Rekor immutable).

labels:
  - "supply-chain"
  - "security"
  - "phase-02"
  - "sigstore"
  - "containers"

---

## Context

Container image signing with cosign (CNCF/Sigstore) provides cryptographic proof of:
- **Provenance**: which builder created this image?
- **Authenticity**: is this really from ruralpeds/ourapp?
- **Integrity**: has the image been tampered with?

**Keyless signing** (via OIDC) means:
- No need to manage/rotate private keys
- GitHub OIDC token + Sigstore Fulcio (CA) + Rekor (immutable ledger)
- Verifiable offline

### Current state

- ✅ container.yml builds + pushes images to GHCR
- ❌ Images are unsigned (anyone can claim to push one)
- ❌ No cryptographic proof of builder identity

### What we're building

**reusable-container-sign.yml** (new)
- Input: `image-uri` (e.g., ghcr.io/ruralpeds/myapp:latest)
- Step 1: Login to image registry (GHCR)
- Step 2: Install cosign
- Step 3: Sign with `cosign sign --yes <image>`
  - GitHub OIDC token automatic
  - Signature pushed to registry (OCI Image Spec)
- Step 4: Attach SBOM attestation (optional follow-up)
- Step 5: Output signed image digest + signature reference
- Step 6: Record to audit log

### Integration

**Integration point: after container.yml**

```
  ┌─────────────────────────┐
  │  container.yml (existing) │
  │  - Lint Dockerfile      │
  │  - Build image          │
  │  - Push to GHCR         │
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────────────────┐
  │ reusable-container-sign.yml (NEW)   │
  │ - Login to GHCR                     │
  │ - cosign sign (keyless)             │
  │ - Attach attestation                │
  │ - Record audit event                │
  └─────────────────────────────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  Release / Deployment   │
  │  Consumers can verify   │
  └─────────────────────────┘
```

**For callers:**

```yaml
# Typically in phase-01-platform-hardening or phase-02-supply-chain repos
on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    uses: ruralpeds/.github/.github/workflows/container.yml@main
    with:
      dockerfile: Dockerfile
      push: true

  sign:
    needs: build
    uses: ruralpeds/.github/.github/workflows/reusable-container-sign.yml@main
    with:
      image-uri: ghcr.io/${{ github.repository }}:${{ github.sha }}
```

## Verification checklist

- [ ] Install cosign: `cosign version`
- [ ] Run a test sign against a real GHCR image
- [ ] Verify with `cosign verify --certificate-identity-regexp=... <image>`
- [ ] Check Rekor ledger: `cosign verify --certificate-identity-regexp=... <image> | grep 'Verification successful'`
- [ ] Verify audit log entry created
- [ ] Test callable from multiple repos

## References

- [cosign Documentation](https://docs.sigstore.dev/cosign/overview/)
- [Sigstore Keyless Signing](https://docs.sigstore.dev/cosign/keyless/)
- [OCI Image Spec - Attachments](https://github.com/opencontainers/image-spec/blob/main/extensions/image-manifest.md)
- [SLSA v1.0 - Container Signing](https://slsa.dev/spec/v1.0/provenance-layout#container-image)
