# Audit Chain Genesis

This file documents the initialization of the Merkle-chained audit log for `ruralpeds/.github`.

## Genesis entry

| Field | Value |
|---|---|
| seq | 1 |
| event_type | `chain.genesis` |
| timestamp | 2026-04-26T00:00:00.000Z |
| initialized_by | claude-code-agent (issue #23) |
| chain_policy_version | 1.0 |

## Chain format

Each line of `audit-log/chain.ndjson` is a compact JSON object with:

- `seq` — monotonically increasing integer starting at 1
- `timestamp` — ISO 8601 UTC
- `event_type` — dot-separated type identifier (e.g. `build.completed`)
- `event_data` — arbitrary JSON payload specific to the event type
- `prev_hash` — `sha256:<hex>` of the previous entry's `self_hash`; genesis uses `sha256:000...000`
- `self_hash` — `sha256(<canonical JSON of {seq, timestamp, event_type, event_data, prev_hash}>)`
- `sigstore_bundle` — Sigstore bundle JSON for keyless OIDC signature, or `null` for unsigned entries
- `rekor_log_index` — Rekor transparency log index, or `null` for unsigned entries
- `signature_issuer` — OIDC issuer URL, or `null` for unsigned entries
- `signature_subject` — GitHub workflow ref, or `null` for unsigned entries

## Transition note

Entries appended before the CI signing step was active (seq 1) have `sigstore_bundle: null`.
These entries are validated by hash-chain integrity only. All entries appended by the
`audit-log.yml` workflow after the issue #23 merge are cryptographically signed.

## Verification

```bash
# Hash-chain only (no cosign required)
python scripts/chain/verify.py audit-log/chain.ndjson

# Hash-chain + Sigstore signature verification
python scripts/chain/verify.py audit-log/chain.ndjson --verify-sigs
```
