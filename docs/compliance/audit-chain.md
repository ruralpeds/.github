# Merkle-Chain Audit Ledger

`audit-log/chain.ndjson` is an append-only Merkle-chained log where each entry is cryptographically bound to the previous and individually signed via Sigstore keyless OIDC. Verification replays the chain and validates every hash — any alteration breaks the chain at a specific line.

---

## Why a Merkle chain?

The `audit-log/ledger.json` file is commit-signed (required by the org ruleset), but two gaps remain:

1. **No cryptographic chaining** — a normal commit that replaces the file content is signed by git but undetected inside the ledger.
2. **No per-entry signature** — the commit signature proves who wrote the commit, not who wrote each individual entry.

The Merkle chain closes both gaps:
- Each entry hashes the previous (`prev_hash`), so any modification breaks all subsequent hashes.
- Each entry is independently signed by the GitHub OIDC identity of the workflow run, so insertion of a forged entry requires a valid Sigstore signature from the CI workflow identity.

---

## Entry format

Each line of `audit-log/chain.ndjson` is a single compact JSON object:

```json
{
  "seq": 1347,
  "timestamp": "2026-04-23T18:02:11.423Z",
  "event_type": "build.completed",
  "event_data": {
    "repo": "ruralpeds/PedNeoSim.jl",
    "sha": "3f4a1b7...",
    "ref": "refs/heads/main",
    "workflow": "ci-julia.yml",
    "run_id": "12345678",
    "actor": "timothyhartzog",
    "event": "push"
  },
  "prev_hash": "sha256:a1b2c3d4e5f6...",
  "self_hash": "sha256:d4e5f6a1b2c3...",
  "sigstore_bundle": { ... },
  "rekor_log_index": 98765432,
  "signature_issuer": "https://token.actions.githubusercontent.com",
  "signature_subject": "https://github.com/ruralpeds/.github/.github/workflows/audit-log.yml@refs/heads/main"
}
```

### Hash computation

`self_hash = sha256(canonical_json({seq, timestamp, event_type, event_data, prev_hash}))`

Where **canonical JSON** means: UTF-8, no insignificant whitespace, keys sorted lexicographically. In Python: `json.dumps(obj, sort_keys=True, separators=(',', ':'))`.

### Genesis entry

The first entry (`seq: 1`) has `prev_hash: "sha256:000...000"` (64 zeros) and `event_type: "chain.genesis"`. See `audit-log/GENESIS.md` for the initialization record.

### Unsigned entries

Entries appended before Sigstore signing was enabled have `sigstore_bundle: null`. These entries are validated by hash-chain integrity only. All entries produced by `audit-log.yml` after the issue #23 merge are cryptographically signed.

---

## Verification

### Hash chain only (fast, no external tools)

```bash
python scripts/chain/verify.py audit-log/chain.ndjson
```

Output: `Chain OK: N entries verified` or an error pinpointing the broken link.

### Hash chain + Sigstore signature verification

```bash
# Requires cosign on PATH (install: https://docs.sigstore.dev/cosign/system_config/installation/)
python scripts/chain/verify.py audit-log/chain.ndjson --verify-sigs
```

### Manual tamper test

```bash
# Corrupt a line
sed -i 's/build.completed/build.tampered/' audit-log/chain.ndjson

# Verify (expect non-zero + error pointing to broken line)
python scripts/chain/verify.py audit-log/chain.ndjson; echo "Exit: $?"

# Restore
git checkout audit-log/chain.ndjson
```

---

## Automated nightly check

`audit-verify.yml` runs at **03:00 UTC every night** and on `workflow_dispatch`.

| Step | Checks |
|---|---|
| Hash chain integrity | seq monotonicity, prev_hash linkage, self_hash recomputation |
| Sigstore signatures | cosign verify-blob for each signed entry |
| Issue creation | Opens a `critical` issue if hash chain fails; deduplicates by day |

The hash chain check is the hard gate. Signature failures are reported separately (some older entries are unsigned).

---

## Incident response: broken chain

If `audit-verify.yml` fails or `python scripts/chain/verify.py` returns non-zero:

**1. Do NOT attempt to "fix" the chain by rewriting.**
A chain break is a security event. Modifying the file to make hashes pass would destroy evidence.

**2. Snapshot the current chain.**
```bash
DATE=$(date -u +%Y%m%d)
cp audit-log/chain.ndjson audit-log/broken-${DATE}.ndjson
```

**3. Identify the broken link.**
```bash
python scripts/chain/verify.py audit-log/chain.ndjson
# Error output includes: seq=N (line M): self_hash mismatch
```

**4. Investigate the git history.**
```bash
# Find commits that touched chain.ndjson
git log --follow -p audit-log/chain.ndjson | head -200

# Check if any commits rewrote history (force push would show in reflog if available)
git reflog --all | grep chain.ndjson
```

**5. Freeze merges.**
No PRs should merge until the root cause is determined. A normal commit that replaces a chain entry would show as a distinct commit — identify the actor and commit SHA.

**6. Resolution.**
If the break is confirmed malicious: escalate to your security incident response plan.
If the break is a bug (e.g. corrupted write): document the break, create a new genesis-style `chain.reseed` entry pointing to the last-known-good seq, and continue appending from there. The broken segment remains in the file as evidence.

---

## Retention policy

| Tier | Storage | Retention |
|---|---|---|
| Hot (in-repo) | `audit-log/chain.ndjson` committed in git | Indefinite (while repo exists) |
| Warm | Weekly snapshots to S3 Object Lock | 7 years |
| Cold | Annual archive to Glacier Deep Archive | Indefinite |

Rekor log entries are retained by the Sigstore public Rekor instance indefinitely (append-only, public log).

---

## Regulatory mapping

| Standard | Requirement | How the chain satisfies it |
|---|---|---|
| HIPAA §164.312(b) | Audit controls | Tamper-evident append-only chain with nightly automated verification |
| HIPAA §164.312(c)(1) | Integrity | SHA-256 Merkle chain; any modification breaks subsequent hashes |
| 21 CFR Part 11 §11.10(e) | Secure, computer-generated, time-stamped audit trail | Keyless OIDC signature per entry; timestamp in canonical form |
| NIST SP 800-92 | Log management | Structured NDJSON; automated verification; retention tiers |
| ISO 27001 A.12.4.2 | Protection of log information | Cryptographic chaining prevents retroactive editing |
