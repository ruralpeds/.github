# Audit Event Type Registry

**Phase 4 Deliverable**: Canonical event types for immutable audit logging  
**Last Updated**: 2026-04-24  
**Purpose**: Define which events are logged, their attributes, and their regulatory significance

---

## Overview

This registry documents **every event type** that should be recorded in the immutable audit ledger (`audit-log.yml`). Each event has:

- **Event Type ID** — canonical identifier (e.g., `code-merged`, `release-published`)
- **Description** — what happened
- **Attributes** — required fields (actor, timestamp, artifact digest, etc.)
- **Regulatory Drivers** — which standards require this event
- **Retention** — how long to keep (HIPAA: ≥6 years)

---

## Event Categories

Events are grouped by lifecycle stage:

1. **Code Events** — commits, PRs, merges
2. **Build Events** — CI/CD execution, artifact generation
3. **Release Events** — version tagging, artifact signing, publication
4. **Security Events** — vulnerability scans, access grants, key rotations
5. **Audit Events** — log rotation, chain verification, archive snapshot
6. **Compliance Events** — rule changes, property assignments, policy updates

---

## Code Events

### `commit-signed`

**What**: Signed commit created on main branch  
**When**: After commit lands on main (via PR merge)  
**Attributes**:
```json
{
  "event_type": "commit-signed",
  "timestamp": "2026-04-24T12:30:00Z",
  "actor": "github.com/user/id",
  "commit_sha": "abc123def...",
  "commit_message": "feat: add validation",
  "repository": "ruralpeds/repo-name",
  "signature_algorithm": "SHA256-RSA",
  "signer_key_id": "ABCD1234...",
  "gpg_fingerprint": "0x...",
  "signature_verified": true
}
```

**Why**: 
- NIST SP 800-218 (SSDF PO.3) — source authenticity
- 21 CFR Part 11 §11.70(i) — record signatures
- FDA §524B — supply-chain integrity

**Retention**: 6+ years

---

### `pr-created`

**What**: Pull request opened for code review  
**When**: PR created  
**Attributes**:
```json
{
  "event_type": "pr-created",
  "timestamp": "2026-04-24T10:15:00Z",
  "actor": "github.com/user/id",
  "pr_number": 123,
  "pr_title": "feat: add feature",
  "repository": "ruralpeds/repo-name",
  "source_branch": "feature/xyz",
  "target_branch": "main",
  "files_changed": 5,
  "additions": 42,
  "deletions": 12
}
```

**Why**: 
- IEC 62304 — design review traceability
- FDA §524B — change log

**Retention**: 6+ years (device repos)

---

### `pr-reviewed`

**What**: Code review approval/request-changes on PR  
**When**: Reviewer submits review  
**Attributes**:
```json
{
  "event_type": "pr-reviewed",
  "timestamp": "2026-04-24T11:45:00Z",
  "actor": "github.com/reviewer/id",
  "pr_number": 123,
  "repository": "ruralpeds/repo-name",
  "review_status": "approved|requested-changes|commented",
  "review_comment_count": 3,
  "review_body": "Looks good, tested locally"
}
```

**Why**: 
- IEC 62304 — design review evidence
- 21 CFR Part 11 §11.50 — approval records

**Retention**: 6+ years (device repos)

---

### `pr-merged`

**What**: Pull request merged to main  
**When**: PR merge button clicked  
**Attributes**:
```json
{
  "event_type": "pr-merged",
  "timestamp": "2026-04-24T12:00:00Z",
  "actor": "github.com/merger/id",
  "pr_number": 123,
  "repository": "ruralpeds/repo-name",
  "merge_commit_sha": "merge123...",
  "merge_method": "squash|rebase|merge",
  "reviewer_count": 2,
  "reviewers": ["user1", "user2"]
}
```

**Why**: 
- NIST SP 800-218 (SSDF PS.3) — change control
- 21 CFR Part 11 §11.50 — approval evidence
- Audit trail for compliance

**Retention**: 6+ years (all repos)

---

## Build Events

### `build-started`

**What**: CI/CD workflow execution initiated  
**When**: GitHub Actions workflow triggered  
**Attributes**:
```json
{
  "event_type": "build-started",
  "timestamp": "2026-04-24T12:01:00Z",
  "repository": "ruralpeds/repo-name",
  "workflow_name": "CI",
  "run_id": "123456789",
  "trigger": "push|pull_request|schedule",
  "branch": "main",
  "commit_sha": "abc123..."
}
```

**Why**: 
- NIST SP 800-218 — build environment audit
- FDA §524B — build provenance

**Retention**: 90 days (non-critical), 6+ years (device repos)

---

### `build-completed`

**What**: CI/CD workflow finished (success or failure)  
**When**: Workflow concludes  
**Attributes**:
```json
{
  "event_type": "build-completed",
  "timestamp": "2026-04-24T12:15:00Z",
  "repository": "ruralpeds/repo-name",
  "run_id": "123456789",
  "conclusion": "success|failure|cancelled",
  "duration_seconds": 840,
  "checks_passed": ["lint", "test", "security"],
  "checks_failed": []
}
```

**Why**: 
- NIST SP 800-218 — build completeness
- Compliance verification

**Retention**: 90 days (non-critical), 6+ years (device repos)

---

### `sbom-generated`

**What**: Software Bill of Materials created  
**When**: `reusable-sbom.yml` completes  
**Attributes**:
```json
{
  "event_type": "sbom-generated",
  "timestamp": "2026-04-24T12:16:00Z",
  "repository": "ruralpeds/repo-name",
  "sbom_format": "cyclonedx|spdx",
  "sbom_path": "sbom/sbom.cyclonedx.json",
  "component_count": 127,
  "sbom_sha256": "hash...",
  "license_violations": []
}
```

**Why**: 
- FDA §524B — SBOM requirement
- NIST SP 800-218 (PS.3) — artifact inventory
- Supply-chain risk assessment

**Retention**: 6+ years (FDA), forever (device repos)

---

### `slsa-provenance-generated`

**What**: SLSA v1.0 build provenance attestation created  
**When**: `reusable-slsa-provenance.yml` completes  
**Attributes**:
```json
{
  "event_type": "slsa-provenance-generated",
  "timestamp": "2026-04-24T12:17:00Z",
  "repository": "ruralpeds/repo-name",
  "artifact_sha256": "hash...",
  "provenance_path": ".attestation",
  "provenance_sha256": "hash...",
  "builder_id": "github.com/actions/runner",
  "signed_by": "sigstore-fulcio"
}
```

**Why**: 
- SLSA v1.0 — supply-chain security
- NIST SP 800-218 (PO.3) — provenance
- FDA §524B — build integrity

**Retention**: 6+ years (device repos)

---

## Release Events

### `release-created`

**What**: GitHub Release published  
**When**: Release tag created + release notes published  
**Attributes**:
```json
{
  "event_type": "release-created",
  "timestamp": "2026-04-24T14:00:00Z",
  "repository": "ruralpeds/repo-name",
  "release_tag": "v1.2.3",
  "release_name": "1.2.3 Stable",
  "release_notes": "...",
  "author": "github.com/user/id",
  "assets": ["app.tar.gz", "sbom.json", ".attestation"],
  "is_prerelease": false
}
```

**Why**: 
- Compliance version tracking
- HIPAA §164.308 — release control
- IEC 62304 — software release process

**Retention**: Forever

---

### `container-image-signed`

**What**: Container image signed with cosign  
**When**: `reusable-container-sign.yml` completes  
**Attributes**:
```json
{
  "event_type": "container-image-signed",
  "timestamp": "2026-04-24T14:02:00Z",
  "repository": "ruralpeds/repo-name",
  "image_uri": "ghcr.io/ruralpeds/app:v1.2.3",
  "image_digest": "sha256:...",
  "signature_algorithm": "sigstore-fulcio",
  "signed_by": "github-oidc",
  "rekor_uuid": "..."
}
```

**Why**: 
- SLSA v1.0 — container integrity
- FDA §524B — artifact signing
- Supply-chain transparency

**Retention**: 6+ years (device repos)

---

### `vex-document-generated`

**What**: OpenVEX vulnerability assessment document created  
**When**: `reusable-vex.yml` completes  
**Attributes**:
```json
{
  "event_type": "vex-document-generated",
  "timestamp": "2026-04-24T14:03:00Z",
  "repository": "ruralpeds/repo-name",
  "vex_path": "vex/vex.json",
  "vex_sha256": "hash...",
  "assessments_count": 5,
  "not_affected_count": 2,
  "affected_count": 2,
  "fixed_count": 1,
  "under_investigation_count": 0
}
```

**Why**: 
- FDA §524B — vulnerability disclosure
- CISA/NTIA VEX spec — risk communication
- Supply-chain risk management

**Retention**: 6+ years (regulated repos)

---

## Security Events

### `secret-scan-completed`

**What**: Secret scanning workflow finishes  
**When**: `reusable-phi-scan.yml` or gitleaks completes  
**Attributes**:
```json
{
  "event_type": "secret-scan-completed",
  "timestamp": "2026-04-24T12:10:00Z",
  "repository": "ruralpeds/repo-name",
  "scan_type": "phi|gitleaks|custom",
  "secrets_found": 0,
  "phi_patterns_detected": 0,
  "scan_result": "pass|fail"
}
```

**Why**: 
- HIPAA §164.312(a)(2) — access control
- 21 CFR Part 11 — secure records
- Compliance verification

**Retention**: 6+ years (ePHI repos)

---

### `codeql-scan-completed`

**What**: CodeQL SAST analysis finishes  
**When**: GitHub CodeQL scan completes  
**Attributes**:
```json
{
  "event_type": "codeql-scan-completed",
  "timestamp": "2026-04-24T12:12:00Z",
  "repository": "ruralpeds/repo-name",
  "alerts_found": 3,
  "severity_critical": 0,
  "severity_high": 1,
  "severity_medium": 2,
  "scan_result": "pass|fail"
}
```

**Why**: 
- NIST SP 800-218 (PS.3) — secure practices
- OWASP ASVS — vulnerability scanning

**Retention**: 90 days (archive old), 6+ years (device)

---

## Audit Events

### `audit-log-rotated`

**What**: Audit log file rotated (new commit, archive old)  
**When**: Weekly or after size limit  
**Attributes**:
```json
{
  "event_type": "audit-log-rotated",
  "timestamp": "2026-04-24T00:00:00Z",
  "log_period": "2026-04-17 to 2026-04-24",
  "event_count": 247,
  "log_file": "audit-logs/2026-04.jsonl",
  "merkle_root_hash": "hash...",
  "signature": "...",
  "archive_path": "s3://backup-bucket/audit-logs/2026-04.jsonl.gz"
}
```

**Why**: 
- HIPAA §164.312(b) — audit controls
- 21 CFR Part 11 §11.10(d) — record retention
- Immutability proof

**Retention**: Forever + WORM

---

### `audit-chain-verified`

**What**: Nightly Merkle-chain integrity check passes  
**When**: `audit-verify.yml` runs (nightly)  
**Attributes**:
```json
{
  "event_type": "audit-chain-verified",
  "timestamp": "2026-04-25T01:00:00Z",
  "check_result": "pass|fail",
  "logs_verified": 1247,
  "chain_integrity": "valid|invalid",
  "tampering_detected": false,
  "missing_events": 0,
  "next_root_hash": "hash..."
}
```

**Why**: 
- HIPAA §164.312(b) — audit controls
- 21 CFR Part 11 §11.10(d) — tamper detection
- Compliance assurance

**Retention**: Forever

---

## Compliance Events

### `custom-property-assigned`

**What**: Repository property assigned (data-class, criticality, etc.)  
**When**: Property set in GitHub UI or API  
**Attributes**:
```json
{
  "event_type": "custom-property-assigned",
  "timestamp": "2026-04-24T10:00:00Z",
  "repository": "ruralpeds/repo-name",
  "property_name": "criticality",
  "property_value": "clinical-decision",
  "assigned_by": "github.com/user/id",
  "previous_value": "experimental"
}
```

**Why**: 
- Governance audit trail
- Compliance tracking

**Retention**: Forever

---

### `ruleset-enforcement-blocked-merge`

**What**: Organization ruleset prevented PR merge  
**When**: Ruleset check fails and blocks merge  
**Attributes**:
```json
{
  "event_type": "ruleset-enforcement-blocked-merge",
  "timestamp": "2026-04-24T12:45:00Z",
  "repository": "ruralpeds/repo-name",
  "pr_number": 125,
  "ruleset_name": "org-device",
  "failed_check": "required-status-checks|required-signatures|...",
  "reason": "VEX document missing"
}
```

**Why**: 
- Enforcement evidence
- Compliance audit

**Retention**: 6+ years (device repos)

---

## Event Attributes (Standard)

**All events include:**

| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| `event_type` | string | `code-merged` | Canonical event ID |
| `timestamp` | ISO 8601 | `2026-04-24T12:00:00Z` | When (UTC) |
| `repository` | string | `ruralpeds/repo-name` | Which repo |
| `actor` | string (URL) | `github.com/user/id` | Who did it |
| `event_id` | UUID | `550e8400-e29b...` | Unique identifier |

**Signed payload includes:**
| Field | Type | Purpose |
|-------|------|---------|
| `signature` | base64 | Sigstore signature |
| `signature_timestamp` | ISO 8601 | When signed |
| `certificate_identity` | URL | Signer identity |
| `rekor_uuid` | UUID | Rekor ledger reference |

---

## Retention Policy

| Category | Critical? | Retention | Archive |
|----------|-----------|-----------|---------|
| **Code Events** | All repos | 6+ years | WORM S3 |
| **Build Events** | Device repos | 6+ years | WORM S3 |
| **Release Events** | All repos | Forever | WORM S3 |
| **Security Events** | ePHI repos | 6+ years | WORM S3 |
| **Audit Events** | All repos | Forever | WORM S3 |
| **Compliance Events** | All repos | Forever | WORM S3 |

---

## Regulatory Alignment

| Event Type | HIPAA | 21 CFR §11 | IEC 62304 | FDA §524B | NIST SSDF | SLSA |
|------------|-------|-----------|-----------|-----------|-----------|------|
| commit-signed | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| pr-reviewed | ✓ | ✓ | ✓ | — | ✓ | — |
| pr-merged | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| sbom-generated | — | — | — | ✓ | ✓ | ✓ |
| slsa-provenance-generated | — | — | — | ✓ | ✓ | ✓ |
| secret-scan-completed | ✓ | ✓ | — | — | ✓ | — |
| audit-chain-verified | ✓ | ✓ | — | — | — | — |

---

## Implementation

**In audit-log.yml:**
```yaml
- name: Log event
  run: |
    cat >> audit-log.jsonl <<EOF
    {
      "event_type": "code-merged",
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "repository": "${{ github.repository }}",
      "actor": "github.com/${{ github.actor }}/id",
      "pr_number": ${{ github.event.pull_request.number }},
      ...
    }
    EOF

    # Sign with cosign
    cosign sign-blob audit-log.jsonl > audit-log.jsonl.sig
```

**In audit-verify.yml:**
```yaml
- name: Verify Merkle chain
  run: |
    # Download audit logs
    git fetch --all --tags
    
    # Verify chain integrity
    python3 scripts/audit_verify.py audit-logs/ --check-merkle --verify-signatures
```

---

## References

- [HIPAA Audit Controls (§164.312(b))](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [21 CFR Part 11 §11.10](https://www.ecfr.gov/current/title-21/part-11)
- [IEC 62304 §5.3 — Software release process](https://www.iec.ch/webstore/webstore.exe?A=viewed_recently)
- [FDA §524B Cybersecurity Guidance](https://www.fda.gov/media/161865/download)
- [NIST SP 800-218 — SSDF](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf)
- [SLSA Framework](https://slsa.dev/spec/v1.0/)
