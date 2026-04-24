---
title: "Define Event Registry & Upgrade audit-log.yml to Merkle-Chain + Sigstore"
phase: phase-04
slug: event-registry-merkle-chain
preferred-agent: copilot
preflight-confirmation: false

goal: >
  Create canonical event type registry (docs/audit/EVENT_TYPES.md).
  Upgrade existing audit-log.yml to: (1) log events with defined types,
  (2) build Merkle chain (hash chain of events), (3) sign with Sigstore cosign.
  Enable tamper-detection via Merkle chain verification.

acceptance-criteria:
  - "docs/audit/EVENT_TYPES.md complete with ≥20 event types defined"
  - "Each event type has: ID, description, attributes, regulatory drivers"
  - "audit-log.yml upgraded to include Merkle chaining (hash(prev + current))"
  - "Each audit log entry includes: event_type, timestamp, repository, actor, signature"
  - "Logs signed with cosign (Sigstore Fulcio) on every commit"
  - "Signatures verifiable: `cosign verify-blob --signature ... audit-log.jsonl`"
  - "audit-log.jsonl is append-only (no modifications, only appends)"
  - "Merkle root included in each log commit for chain verification"
  - "docs/audit/EVENT_TYPES.md linked from main STANDARDS_MAP.md"

files-to-touch:
  - ".github/workflows/audit-log.yml"
  - "docs/audit/EVENT_TYPES.md"
  - "docs/STANDARDS_MAP.md" (add link)
  - "audit-log.jsonl" (append events)

files-not-to-touch:
  - "copilot-tasks/**"
  - "policies/**"

tests-required: |
  - Trigger audit-log.yml manually (test commit)
  - Verify: audit-log.jsonl created with signed events
  - Verify: cosign signatures valid
  - Verify: Merkle root hash computed correctly
  - Verify: audit-log.jsonl.sig file created and valid
  - Trigger nightly run, verify log appends (no overwrites)
  - Verify: git log shows signed commits with "audit:" prefix

standards:
  - "HIPAA §164.312(b) — audit controls (immutability)"
  - "21 CFR Part 11 §11.10(d) — record integrity"
  - "FDA Guidance — audit trail immutability"
  - "IEC 62304 — design change traceability"

rollback: >
  Revert audit-log.yml to unsigned state.
  Existing signed entries remain in git (immutable).
  New entries logged unsigned (benign for compliance).

labels:
  - "audit"
  - "phase-04"
  - "sigstore"
  - "immutability"

---

## Context

The audit log is the **source of truth** for:
- Code changes (commits, PRs, merges)
- Releases (versions, artifacts, signatures)
- Security events (scans, violations, remediations)
- Compliance (rule changes, property assignments)

Currently: audit-log.yml logs events, but unsigned.  
Needed: **Merkle-chain signed events** to detect tampering.

### Merkle Chain Concept

A Merkle chain is a **hash chain** where each event includes the hash of the previous event:

```
Event 1: {"type": "commit-signed", ...}
  Hash: H1 = SHA256(Event1)

Event 2: {"type": "sbom-generated", "prev_hash": H1, ...}
  Hash: H2 = SHA256(Event2 + H1)

Event 3: {"type": "pr-merged", "prev_hash": H2, ...}
  Hash: H3 = SHA256(Event3 + H2)
```

If anyone modifies Event 1 → H1 changes → H2 becomes invalid → chain breaks.

### Signatures

Each log file is signed with **cosign** (Sigstore Fulcio):
- GitHub OIDC token → automatic
- No keys to manage
- Signature verifiable offline
- Recorded in Rekor (immutable ledger)

## What You're Building

### 1. Event Type Registry

`docs/audit/EVENT_TYPES.md` defines:
- Event type IDs (e.g., `code-merged`, `release-published`)
- Required attributes per type
- Regulatory drivers (HIPAA, 21 CFR, etc.)
- Retention policy

### 2. Merkle-Chained Audit Log

upgrade `audit-log.yml`:
```yaml
- name: Log event
  run: |
    # Get previous log file and compute root hash
    PREV_ROOT=$(tail -1 audit-log.jsonl | jq -r '.merkle_root // "0"*64')

    # Create event with hash chain
    cat >> audit-log.jsonl <<EOF
    {
      "event_type": "code-merged",
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "repository": "${{ github.repository }}",
      "actor": "github.com/${{ github.actor }}/id",
      "previous_hash": "$PREV_ROOT",
      ...
    }
    EOF

    # Sign with cosign
    cosign sign-blob --yes audit-log.jsonl > audit-log.jsonl.sig

    # Commit (ruleset enforces signed commit)
    git add audit-log.jsonl audit-log.jsonl.sig
    git commit -S -m "audit: log events for $(date +%Y-%m-%d)"
    git push origin main
```

## Verification Checklist

- [ ] EVENT_TYPES.md complete with ≥20 types
- [ ] Each type has: ID, description, attributes, drivers
- [ ] audit-log.yml updated with Merkle chaining
- [ ] Test run: events logged with prev_hash
- [ ] Test run: cosign signatures created
- [ ] Verify: `cosign verify-blob --signature ... audit-log.jsonl`
- [ ] Verify: git log shows signed commits
- [ ] Verify: audit-log.jsonl.sig in git repo

## References

- [docs/audit/EVENT_TYPES.md](../../docs/audit/EVENT_TYPES.md) — full registry
- [Merkle Trees](https://en.wikipedia.org/wiki/Merkle_tree) — cryptographic chaining
- [cosign — Signing & Verification](https://docs.sigstore.dev/cosign/signing/)
- [HIPAA §164.312(b)](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [21 CFR Part 11 §11.10](https://www.ecfr.gov/current/title-21/part-11)
