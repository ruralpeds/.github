---
title: "Create Nightly Audit Log Integrity Verification (audit-verify.yml)"
phase: phase-04
slug: audit-verify-workflow
preferred-agent: copilot
preflight-confirmation: false

goal: >
  Create audit-verify.yml workflow to run nightly, verify Merkle-chain 
  integrity, check for tampering, and alert on corruption or attacks.
  Provides automated tamper-detection with human alerting.

acceptance-criteria:
  - "audit-verify.yml workflow created and runs nightly (cron)"
  - "Fetches all audit logs from git history"
  - "Reconstructs Merkle tree + verifies chain integrity"
  - "Verifies Sigstore signatures on all log entries"
  - "Detects tampering: missing entries, modified events, future-dated entries"
  - "On failure: creates GitHub issue (critical security alert)"
  - "On success: logs verification event to audit-log"
  - "Generates verification report (JSON artifact)"
  - "Manual trigger via workflow_dispatch for testing"

files-to-touch:
  - ".github/workflows/audit-verify.yml"
  - "audit-log.jsonl" (append verification event on success)

files-not-to-touch:
  - "copilot-tasks/**"
  - "policies/**"

tests-required: |
  - Trigger manually: `gh workflow run audit-verify.yml`
  - Verify: Merkle chain reconstructed correctly
  - Verify: Signatures verified (cosign passes)
  - Verify: Report artifact uploaded
  - Corrupt test: modify an audit event
  - Trigger verify: should detect tampering
  - Verify: GitHub issue created (security alert)
  - Verify: PR merges blocked (manual; org-wide) during security incident

standards:
  - "HIPAA §164.312(b) — audit controls + tamper detection"
  - "21 CFR Part 11 §11.10(d) — record integrity + cryptographic verification"
  - "FDA Guidance — supply-chain incident response"

rollback: >
  Delete audit-verify.yml.
  Merkle-chain remains immutable in git (unsigned verification only).
  Manual audits can still verify integrity.

labels:
  - "audit"
  - "phase-04"
  - "security"
  - "automation"

---

## Context

**Merkle chain** proves immutability when working (hashes chain correctly).  
**audit-verify.yml** proves it daily and alerts if chain breaks.

### Tampering Scenarios (Detected by audit-verify)

1. **Deletion**: Attacker deletes old audit entry → Merkle chain breaks
2. **Modification**: Attacker changes timestamp in entry → hash breaks downstream
3. **Replay**: Attacker copies old event → timestamp sanity check fails
4. **Out-of-order**: Attacker reorders events → previous_hash no longer matches

### Verification Process

```
1. Fetch all audit logs from git
2. Parse JSON lines
3. Reconstruct Merkle tree:
   H1 = SHA256(Event1)
   H2 = SHA256(Event2 + H1)
   H3 = SHA256(Event3 + H2)
   ... (all events)
4. Verify each event's previous_hash matches computed value
5. Verify all signatures with cosign (offline verification)
6. Detect anomalies:
   - Future-dated events
   - Missing sequence numbers
   - Duplicate entries
   - Invalid JSON
7. If all pass → Report success
8. If any fail → Alert (create GitHub issue, block merges)
```

## Verification Workflow Components

### Fetch Phase
- Clone repo with full history
- Extract audit events from all commits
- Count total events

### Merkle Phase
- Load events in chronological order
- For each event:
  - Hash = SHA256(event + previous_hash)
  - Verify: event.previous_hash == computed_previous
  - If mismatch: FAIL + alert
- Print final root hash (for comparison)

### Signature Phase
- For each event with cosign signature:
  - `cosign verify-blob --signature ... event`
  - If invalid: FAIL + alert
- Check all signatures link to GitHub OIDC

### Anomaly Phase
- Timestamp sanity: all timestamps ≤ now
- Duplicates: no two events with same ID
- Continuity: no gaps in event sequence
- Schema: all required fields present

### Alert Phase
- If failures: create GitHub issue
  - Title: "🚨 SECURITY: Audit Log Tampering Detected"
  - Body: list all anomalies found
  - Labels: security, critical, audit
  - Assignee: @timothyhartzog (for investigation)

## Implementation Notes

**Key decisions:**
1. **Schedule**: Nightly at 1 AM UTC (low traffic, predictable)
2. **Retention**: Report artifact kept 90 days (compliance + trend)
3. **Alert**: Create GitHub issue (visible, blocks merges via workflow check)
4. **Idempotent**: Can run multiple times (doesn't modify state)

## Verification Checklist

- [ ] audit-verify.yml created in .github/workflows/
- [ ] Runs on schedule (nightly) + workflow_dispatch
- [ ] Fetches all audit logs from git
- [ ] Merkle chain verification implemented (previous_hash checks)
- [ ] Sigstore signature verification implemented (cosign)
- [ ] Tamper detection: missing entries, modified events, timestamps
- [ ] Test: manual trigger works
- [ ] Test: corruption detection works (intentional tampering test)
- [ ] Test: GitHub issue created on failure
- [ ] Test: Report artifact uploaded

## References

- [.github/workflows/audit-verify.yml](../../.github/workflows/audit-verify.yml) — full implementation
- [Merkle Tree Verification](https://en.wikipedia.org/wiki/Merkle_tree#Verification)
- [cosign Verification](https://docs.sigstore.dev/cosign/verify/)
- [HIPAA §164.312(b) Audit Controls](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
