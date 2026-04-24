---
title: "Upgrade audit ledger to Merkle chain with Sigstore signing"
phase: phase-04
slug: merkle-chain-audit-ledger
preferred-agent: copilot
preflight-confirmation: true
estimated-complexity: l

depends-on:
  - pin-actions-sha

goal: >
  Upgrade the append-only `audit-log/ledger.json` to a Merkle-chained ndjson
  log where each entry is cryptographically bound to the previous and
  individually signed via Sigstore keyless OIDC. Add a nightly verification
  workflow that replays the chain and fails loudly on tamper. This task
  authorizes modification of `audit-log/**` and `.github/workflows/audit-log.yml`
  because it IS the task to upgrade them.

acceptance-criteria:
  - "`audit-log/chain.ndjson` format defined with prev_hash / self_hash / signature fields"
  - "`.github/workflows/audit-log.yml` writes to `chain.ndjson` (new entry appended) in addition to existing ledger.json"
  - "Each appended entry has a valid Sigstore keyless signature verifiable via cosign"
  - "`scripts/chain/append.py` + `scripts/chain/verify.py` implement the canonical form"
  - "`.github/workflows/audit-verify.yml` runs nightly, replays the chain, and opens a critical issue on failure"
  - "`docs/compliance/audit-chain.md` documents the format, verification command, and incident-response on a broken chain"
  - "The existing `audit-log/ledger.json` is preserved and continues to be updated during a two-release transition period"

files-to-touch:
  - "audit-log/chain.ndjson"                       # new file, initial genesis entry
  - "audit-log/GENESIS.md"                          # human-readable genesis note
  - "scripts/chain/append.py"
  - "scripts/chain/verify.py"
  - ".github/workflows/audit-log.yml"
  - ".github/workflows/audit-verify.yml"
  - "docs/compliance/audit-chain.md"

files-not-to-touch:
  - "AGENTS.md"
  - "policies/rulesets/**"
  - "dhf/risk/**"

authorizes:
  - "audit-log/**"
  - ".github/workflows/audit-log.yml"

tests-required: |
  - Unit tests for `append.py` and `verify.py` under `tests/chain/`:
    - genesis entry creation
    - append preserves prev_hash = prior self_hash
    - verify on clean chain returns 0
    - verify on chain with modified payload returns non-zero at the broken link
    - verify on chain with missing entry (gap) returns non-zero
    - verify on chain with invalid signature returns non-zero
  - Integration test: run append three times in a scratch workspace; run verify;
    corrupt one line; run verify; confirm failure at the right line.
  - `actionlint` passes on the two workflows.

standards:
  - "HIPAA §164.312(b) — audit controls"
  - "HIPAA §164.312(c)(1) — integrity"
  - "21 CFR Part 11 §11.10(e) — audit trails"
  - "NIST SP 800-92 — log management"
  - "ISO 27001 A.12.4.2 — protection of log information"

rollback: >
  Roll back to the prior audit-log workflow (keeps ledger.json). The chain
  file remains but is frozen; the audit-verify workflow returns early with a
  notice that chain-appending has been disabled.

labels:
  - "compliance"
  - "audit"
  - "cryptography"

requires-human-after: review

---

## Context

The current `audit-log/ledger.json` is committed with every build — the commit
itself is signed (required by the ruleset), and the ledger is append-only by
convention. That's a good foundation, but it has two gaps:

1. **No cryptographic chaining** — if the ledger.json file is rewritten in
   a later commit (force-push is blocked, but a normal commit that replaces
   the content would look legitimate to anyone only checking HEAD), there's
   nothing inside the ledger itself that detects it.
2. **No per-entry signature** — the commit signature proves who wrote the
   commit, not who wrote each individual entry. A single poisoned commit
   could insert multiple forged entries.

The Merkle chain closes both gaps: each entry hashes the previous, and each
entry is independently signed by the GitHub OIDC identity of the workflow run.
Verification replays the chain and validates every signature — any alteration
breaks the chain at a specific line.

## Chain entry format

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
    "run_id": 12345678,
    "actor": "timothyhartzog",
    "result": "success",
    "artifacts": ["...hashes..."],
    "dependencies_hash": "sha256:..."
  },
  "prev_hash": "sha256:a1b2c3d4e5f6...",
  "self_hash": "sha256:d4e5f6a1b2c3...",
  "signature": "MEUCIQD...",
  "signature_cert": "-----BEGIN CERTIFICATE-----\n...",
  "signature_issuer": "https://token.actions.githubusercontent.com",
  "signature_subject": "https://github.com/ruralpeds/.github/.github/workflows/audit-log.yml@refs/heads/main",
  "rekor_log_index": 98765432
}
```

Where:

- `self_hash` = `sha256(canonical_json({seq, timestamp, event_type, event_data, prev_hash}))`.
- Canonical JSON: UTF-8, no insignificant whitespace, keys sorted lexicographically, numbers in shortest form.
- `signature` = Sigstore keyless signature of `self_hash` via `cosign sign-blob`.
- `signature_cert` = Fulcio-issued short-lived cert, included inline for offline verification.
- `rekor_log_index` = index in the public Sigstore Rekor transparency log.

The **genesis entry** (`seq: 1`) has `prev_hash: "sha256:0000...0000"` and
`event_type: "chain.genesis"`. Its `event_data` names the repo, the chain
policy version, and the human who initialized it.

## Approach

### 1. `scripts/chain/append.py`

Called by the audit-log workflow. Signature:

```bash
python scripts/chain/append.py \
  --event-type build.completed \
  --event-data /tmp/event.json \
  --chain audit-log/chain.ndjson \
  --sign
```

Responsibilities:
- Read last line of chain; extract `seq` and `self_hash`.
- Construct new entry with `seq+1` and `prev_hash = last.self_hash`.
- Compute `self_hash` over canonical JSON of `{seq, timestamp, event_type, event_data, prev_hash}`.
- If `--sign`: call `cosign sign-blob --yes --output-signature - --output-certificate -` with the self_hash as input, capture signature + cert.
- Append the full entry as one ndjson line.
- Commit (the workflow handles the push).

### 2. `scripts/chain/verify.py`

Called by `audit-verify.yml` nightly. Signature:

```bash
python scripts/chain/verify.py audit-log/chain.ndjson
```

Returns exit code 0 on fully-valid chain, non-zero with a line-pointer on failure.

Responsibilities:
- Parse each line as JSON (ndjson).
- Validate `seq` is monotonically increasing, no gaps.
- Validate `prev_hash` of line N equals `self_hash` of line N-1.
- Recompute `self_hash` from canonical JSON; must match stored value.
- Verify `signature` against `self_hash` using `cosign verify-blob` with `--certificate-identity-regexp` matching the expected workflow subject.
- Print progress every 100 entries for large chains.

### 3. `.github/workflows/audit-log.yml` changes

Add a new step after the existing ledger.json write:

```yaml
- name: Append to Merkle chain
  run: |
    jq -n --arg sha "$GITHUB_SHA" --arg ref "$GITHUB_REF" \
          --arg run "$GITHUB_RUN_ID" --arg actor "$GITHUB_ACTOR" \
          --arg repo "$GITHUB_REPOSITORY" --arg wf "$GITHUB_WORKFLOW" \
      '{repo:$repo, sha:$sha, ref:$ref, workflow:$wf, run_id:$run, actor:$actor}' \
      > /tmp/event.json
    python scripts/chain/append.py \
      --event-type build.completed \
      --event-data /tmp/event.json \
      --chain audit-log/chain.ndjson \
      --sign
  env:
    COSIGN_EXPERIMENTAL: "1"     # keyless flow
```

Require `permissions: id-token: write` on the job for Sigstore OIDC.

### 4. `.github/workflows/audit-verify.yml` (new)

Nightly at 03:00 UTC + on-demand dispatch:

```yaml
name: Audit Chain Verify
on:
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch: {}

permissions:
  contents: read
  issues: write

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@<PINNED_SHA>
        with: { persist-credentials: false }
      - uses: actions/setup-python@<PINNED_SHA>
        with: { python-version: "3.12" }
      - name: Install cosign
        run: |
          curl -sSfLO https://github.com/sigstore/cosign/releases/download/v2.4.1/cosign-linux-amd64
          chmod +x cosign-linux-amd64
          sudo mv cosign-linux-amd64 /usr/local/bin/cosign
      - name: Verify chain
        run: python scripts/chain/verify.py audit-log/chain.ndjson
      - name: Open issue on failure
        if: failure()
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh issue create \
            --title "🚨 Audit chain verification FAILED — $(date -u +%F)" \
            --label "incident,audit,critical" \
            --body "The nightly audit chain verify failed. See the run logs. Do not merge any PRs until resolved."
```

### 5. Docs

`docs/compliance/audit-chain.md`:
- Format spec (the block above).
- Verification command for a user:
  ```bash
  python scripts/chain/verify.py audit-log/chain.ndjson
  ```
- What to do if verify fails:
  - Do NOT attempt to "fix" the chain by rewriting.
  - Open an incident issue.
  - Snapshot the current chain to `audit-log/broken/<date>/`.
  - Investigate the history. A break means either a bug in the append path,
    a force-push slipped through, or a malicious commit landed.
  - Resolution involves a human-authored genesis entry continuing a new chain
    with a `chain.reseed` event pointing to the last-known-good seq.
- Retention policy: chain.ndjson in repo (hot, 12 months), weekly snapshots
  to S3 Object Lock (warm, 7 years), deep archive (cold, indefinite).

## Testing strategy

Unit tests under `tests/chain/test_append.py` and `tests/chain/test_verify.py`:

```python
def test_append_genesis(tmp_path):
    chain = tmp_path / "chain.ndjson"
    append(chain_path=chain, event_type="chain.genesis", event_data={...}, sign=False)
    lines = chain.read_text().splitlines()
    assert len(lines) == 1
    entry = json.loads(lines[0])
    assert entry["seq"] == 1
    assert entry["prev_hash"] == "sha256:" + "0"*64

def test_append_chains_correctly(tmp_path):
    # append genesis
    # append second
    # assert entry2["prev_hash"] == entry1["self_hash"]
    ...

def test_verify_detects_tampered_payload(tmp_path):
    # build valid 3-entry chain
    # modify entry 2's event_data
    # assert verify() returns non-zero with pointer to line 2
    ...

def test_verify_detects_gap(tmp_path):
    # build chain with seq 1, 2, 4 (missing 3)
    # assert verify fails at line 3
    ...

def test_verify_detects_prev_hash_mismatch(tmp_path):
    # build valid chain
    # change entry 2's prev_hash to arbitrary value
    # assert verify fails at line 2
    ...
```

Run without `--sign` in CI for speed; a separate `@signed` marked integration
test runs the full cosign path once.

## Verification

After merge:

1. The next run of `audit-log.yml` (via a trivial commit) must append a
   genuine entry to `chain.ndjson` with a real Sigstore signature.
2. Running `python scripts/chain/verify.py audit-log/chain.ndjson` must
   return exit 0.
3. A deliberate tamper test:
   ```bash
   sed -i 's/build.completed/build.tampered/' audit-log/chain.ndjson
   python scripts/chain/verify.py audit-log/chain.ndjson; echo $?
   # expect non-zero exit + clear error message pointing to tampered line
   git checkout audit-log/chain.ndjson
   ```
4. The nightly verify job runs green.

## Notes for the agent

- Canonical JSON: use `json.dumps(..., sort_keys=True, separators=(',', ':'))`
  as the canonical form for hashing. Watch for float precision; if you need
  floats in event_data, serialize them as strings.
- `cosign sign-blob` with `--yes` is non-interactive and uses the ambient
  OIDC token. Test locally with `COSIGN_IDENTITY_TOKEN=$(gh auth token)` ONLY
  for local smoke; production uses GitHub's OIDC.
- `rekor_log_index` is returned by cosign in a separate output stream; parse
  from stderr or use the json output format of cosign 2.4+.
- Be defensive about unicode: hash before encoding, encode as UTF-8 without
  BOM, never use `str.encode("utf-8-sig")`.

## References

- Sigstore / cosign docs: keyless signing, Rekor
- RFC 8785 (JSON Canonicalization Scheme) — reference but we use a simpler form
- HIPAA §164.312(b) — audit controls
- 21 CFR Part 11 §11.10(e) — secure, computer-generated, time-stamped audit trails
- Linux Foundation: "Sigstore Keyless: Cosigning Without Keys"
