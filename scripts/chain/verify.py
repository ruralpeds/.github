#!/usr/bin/env python3
"""Verify the integrity of the Merkle-chained audit log.

Validates:
  1. Monotonically increasing seq with no gaps
  2. prev_hash of entry N equals self_hash of entry N-1
  3. Recomputed self_hash matches the stored value
  4. Sigstore signature (when sigstore_bundle is present and --verify-sigs is set)

Usage:
    python scripts/chain/verify.py audit-log/chain.ndjson [--verify-sigs]

Exit 0 on fully valid chain, non-zero on any failure.
"""

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

GENESIS_PREV_HASH = "sha256:" + "0" * 64
PROGRESS_INTERVAL = 100


def canonical_json(obj: dict) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def sha256_hex(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def hashable_fields(entry: dict) -> dict:
    return {
        "seq": entry["seq"],
        "timestamp": entry["timestamp"],
        "event_type": entry["event_type"],
        "event_data": entry["event_data"],
        "prev_hash": entry["prev_hash"],
    }


def recompute_self_hash(entry: dict) -> str:
    return sha256_hex(canonical_json(hashable_fields(entry)))


def verify_cosign_signature(entry: dict) -> tuple[bool, str]:
    """Verify Sigstore signature for entry. Returns (ok, reason)."""
    bundle = entry.get("sigstore_bundle")
    if not bundle:
        return True, "unsigned (skipped)"

    with tempfile.NamedTemporaryFile(suffix=".payload", delete=False) as pf, \
         tempfile.NamedTemporaryFile(suffix=".bundle.json", delete=False, mode="w") as bf:
        signing_payload = canonical_json({"self_hash": entry["self_hash"]})
        pf.write(signing_payload)
        payload_path = pf.name
        json.dump(bundle, bf)
        bundle_path = bf.name

    try:
        result = subprocess.run(
            [
                "cosign", "verify-blob",
                f"--bundle={bundle_path}",
                "--certificate-oidc-issuer=https://token.actions.githubusercontent.com",
                "--certificate-identity-regexp=https://github.com/ruralpeds/",
                payload_path,
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            return True, "OK"
        return False, result.stderr.strip()[:200]
    finally:
        for p in [payload_path, bundle_path]:
            if os.path.exists(p):
                os.unlink(p)


def verify_chain(chain_path: Path, verify_sigs: bool = False) -> int:
    """Verify the chain. Returns 0 on success, 1 on failure."""
    if not chain_path.exists():
        print(f"Chain file not found: {chain_path}", file=sys.stderr)
        return 1

    errors = 0
    prev_self_hash = GENESIS_PREV_HASH
    expected_seq = 1
    entry_count = 0

    with open(chain_path, "rb") as f:
        for lineno, raw in enumerate(f, start=1):
            raw = raw.strip()
            if not raw:
                continue

            try:
                entry = json.loads(raw.decode("utf-8"))
            except json.JSONDecodeError as e:
                print(f"  ERROR line {lineno}: invalid JSON: {e}")
                errors += 1
                continue

            seq = entry.get("seq")

            if seq != expected_seq:
                print(f"  ERROR seq gap at line {lineno}: expected {expected_seq}, got {seq}")
                errors += 1
                if seq is not None:
                    expected_seq = seq + 1
                continue
            expected_seq = seq + 1

            stored_prev = entry.get("prev_hash")
            if stored_prev != prev_self_hash:
                print(
                    f"  ERROR seq={seq} (line {lineno}): prev_hash mismatch\n"
                    f"    stored : {stored_prev}\n"
                    f"    expected: {prev_self_hash}"
                )
                errors += 1

            stored_self = entry.get("self_hash")
            recomputed = recompute_self_hash(entry)
            if stored_self != recomputed:
                print(
                    f"  ERROR seq={seq} (line {lineno}): self_hash mismatch\n"
                    f"    stored  : {stored_self}\n"
                    f"    computed: {recomputed}"
                )
                errors += 1

            if verify_sigs and entry.get("sigstore_bundle"):
                ok, reason = verify_cosign_signature(entry)
                if not ok:
                    print(f"  ERROR seq={seq} (line {lineno}): signature invalid — {reason}")
                    errors += 1

            prev_self_hash = stored_self or recomputed
            entry_count += 1

            if entry_count % PROGRESS_INTERVAL == 0:
                print(f"  Verified {entry_count} entries...")

    if errors == 0:
        print(f"Chain OK: {entry_count} entries verified")
        if verify_sigs:
            print("  (signature verification: enabled)")
        return 0
    else:
        print(f"Chain FAILED: {errors} error(s) across {entry_count} entries", file=sys.stderr)
        return 1


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("chain", help="Path to chain.ndjson")
    parser.add_argument(
        "--verify-sigs",
        action="store_true",
        help="Verify Sigstore signatures (requires cosign on PATH)",
    )
    args = parser.parse_args()

    sys.exit(verify_chain(Path(args.chain), verify_sigs=args.verify_sigs))


if __name__ == "__main__":
    main()
