#!/usr/bin/env python3
"""Append an entry to the Merkle-chained audit log.

Each entry is cryptographically bound to the previous entry via prev_hash and
individually signed via Sigstore keyless OIDC (when --sign is passed).

Usage:
    python scripts/chain/append.py \\
        --event-type build.completed \\
        --event-data /tmp/event.json \\
        --chain audit-log/chain.ndjson \\
        [--sign]

Exit 0 on success, non-zero on error.
"""

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

GENESIS_PREV_HASH = "sha256:" + "0" * 64


def canonical_json(obj: dict) -> bytes:
    """Deterministic JSON: sorted keys, no insignificant whitespace, UTF-8."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def sha256_hex(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def hashable_fields(entry: dict) -> dict:
    """Extract only the fields that are hashed (deterministic subset)."""
    return {
        "seq": entry["seq"],
        "timestamp": entry["timestamp"],
        "event_type": entry["event_type"],
        "event_data": entry["event_data"],
        "prev_hash": entry["prev_hash"],
    }


def compute_self_hash(entry: dict) -> str:
    return sha256_hex(canonical_json(hashable_fields(entry)))


def read_last_entry(chain_path: Path) -> dict | None:
    if not chain_path.exists() or chain_path.stat().st_size == 0:
        return None
    last_line = ""
    with open(chain_path, "rb") as f:
        for line in f:
            stripped = line.strip()
            if stripped:
                last_line = stripped.decode("utf-8")
    return json.loads(last_line) if last_line else None


def sign_payload(payload_bytes: bytes) -> dict:
    """Sign payload with cosign keyless OIDC. Returns metadata dict."""
    with tempfile.NamedTemporaryFile(suffix=".payload", delete=False) as pf:
        pf.write(payload_bytes)
        payload_path = pf.name
    bundle_path = payload_path + ".bundle.json"
    try:
        result = subprocess.run(
            ["cosign", "sign-blob", "--yes", f"--bundle={bundle_path}", payload_path],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(f"cosign sign-blob stderr:\n{result.stderr}", file=sys.stderr)
            raise RuntimeError(f"cosign exited {result.returncode}")

        with open(bundle_path) as bf:
            bundle = json.load(bf)

        meta = {"sigstore_bundle": bundle}

        tlog = bundle.get("verificationMaterial", {}).get("tlogEntries", [])
        if tlog:
            log_index = tlog[0].get("logIndex")
            if log_index is not None:
                meta["rekor_log_index"] = int(log_index)

        cert_material = bundle.get("verificationMaterial", {}).get("certificate", {})
        raw_cert = cert_material.get("rawBytes")
        if raw_cert:
            import base64
            cert_pem = (
                "-----BEGIN CERTIFICATE-----\n"
                + base64.b64encode(base64.b64decode(raw_cert)).decode()
                + "\n-----END CERTIFICATE-----"
            )
            meta["signature_cert"] = cert_pem

        meta["signature_issuer"] = "https://token.actions.githubusercontent.com"
        meta["signature_subject"] = os.environ.get(
            "GITHUB_WORKFLOW_REF",
            os.environ.get("GITHUB_WORKFLOW", "unknown"),
        )
        return meta
    finally:
        for p in [payload_path, bundle_path]:
            if os.path.exists(p):
                os.unlink(p)


def append_entry(
    chain_path: Path,
    event_type: str,
    event_data: dict,
    sign: bool = False,
) -> dict:
    last = read_last_entry(chain_path)

    if last is None:
        seq = 1
        prev_hash = GENESIS_PREV_HASH
    else:
        seq = last["seq"] + 1
        prev_hash = last["self_hash"]

    entry = {
        "seq": seq,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "event_type": event_type,
        "event_data": event_data,
        "prev_hash": prev_hash,
    }

    entry["self_hash"] = compute_self_hash(entry)

    if sign:
        signing_payload = canonical_json({"self_hash": entry["self_hash"]})
        sig_meta = sign_payload(signing_payload)
        entry.update(sig_meta)
    else:
        entry["sigstore_bundle"] = None
        entry["rekor_log_index"] = None
        entry["signature_issuer"] = None
        entry["signature_subject"] = None

    chain_path.parent.mkdir(parents=True, exist_ok=True)
    with open(chain_path, "ab") as f:
        line = json.dumps(entry, sort_keys=False, separators=(",", ":")) + "\n"
        f.write(line.encode("utf-8"))

    return entry


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--event-type", required=True, help="Event type identifier")
    parser.add_argument("--event-data", required=True, help="Path to JSON event data file")
    parser.add_argument("--chain", required=True, help="Path to chain.ndjson file")
    parser.add_argument("--sign", action="store_true", help="Sign with Sigstore keyless OIDC")
    args = parser.parse_args()

    with open(args.event_data) as f:
        event_data = json.load(f)

    chain_path = Path(args.chain)
    entry = append_entry(chain_path, args.event_type, event_data, sign=args.sign)

    print(f"Appended seq={entry['seq']} event_type={entry['event_type']}")
    print(f"  self_hash={entry['self_hash']}")
    print(f"  prev_hash={entry['prev_hash']}")
    if entry.get("rekor_log_index") is not None:
        print(f"  rekor_log_index={entry['rekor_log_index']}")


if __name__ == "__main__":
    main()
