#!/usr/bin/env python3
"""
Cryptographic Audit Trail Signer

Signs JSONL audit entries with HMAC-SHA256 and creates hash chain.
Enables tamper-proof audit logs for compliance (HIPAA/SOC2).

Format:
{
  "sequence": 12345,
  "timestamp": "2026-05-04T10:30:00Z",
  "event_type": "alert_triggered",
  "data": {...},
  "previous_hash": "abc123...",
  "signature": "hmac_sha256(...)"
}
"""

import json
import hmac
import hashlib
from pathlib import Path
from typing import Dict, Optional
import argparse
from datetime import datetime
import sys


class AuditLogSigner:
    """Signs audit trail entries with cryptographic signatures."""

    def __init__(self, signing_key: str):
        """
        Initialize signer with key.

        Args:
            signing_key: Secret key for HMAC operations (use from Secrets Manager in production)
        """
        self.key = signing_key.encode() if isinstance(signing_key, str) else signing_key

    def sign_entry(self, event: Dict, previous_hash: Optional[str] = None) -> Dict:
        """
        Add cryptographic signature to audit entry.

        Args:
            event: Event dict with sequence, timestamp, event_type, data
            previous_hash: Hash of previous entry for chain verification

        Returns:
            Signed entry dict with signature and previous_hash
        """
        # Create entry structure without signature
        entry = {
            "sequence": event["sequence"],
            "timestamp": event["timestamp"],
            "event_type": event["event_type"],
            "data": event["data"],
            "previous_hash": previous_hash or "genesis"
        }

        # Sign with HMAC-SHA256
        entry_json = json.dumps(entry, sort_keys=True, separators=(',', ':'))
        signature = hmac.new(
            self.key,
            entry_json.encode(),
            hashlib.sha256
        ).hexdigest()

        entry["signature"] = signature
        return entry

    def compute_hash(self, entry: Dict) -> str:
        """
        Compute SHA256 hash of signed entry.

        Args:
            entry: Signed entry dict

        Returns:
            SHA256 hash of entry
        """
        entry_copy = entry.copy()
        entry_copy.pop("signature", None)  # Hash doesn't include signature
        entry_json = json.dumps(entry_copy, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(entry_json.encode()).hexdigest()

    def sign_file(self, input_file: Path, output_file: Path) -> Dict:
        """
        Sign all entries in JSONL audit trail.

        Args:
            input_file: Path to input JSONL file
            output_file: Path to output signed JSONL file

        Returns:
            Summary dict with entries_signed, errors
        """
        results = {
            "entries_signed": 0,
            "errors": [],
            "output_file": str(output_file)
        }

        previous_hash = None

        try:
            with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
                for line_num, line in enumerate(infile, 1):
                    line = line.strip()
                    if not line:
                        continue

                    try:
                        event = json.loads(line)

                        # Sign entry
                        signed_entry = self.sign_entry(event, previous_hash)

                        # Write signed entry
                        outfile.write(json.dumps(signed_entry) + '\n')

                        # Compute hash for next entry
                        previous_hash = self.compute_hash(signed_entry)
                        results["entries_signed"] += 1

                    except json.JSONDecodeError as e:
                        error = f"Line {line_num}: JSON decode error: {e}"
                        results["errors"].append(error)
                    except KeyError as e:
                        error = f"Line {line_num}: Missing required field: {e}"
                        results["errors"].append(error)

        except Exception as e:
            results["errors"].append(f"File operation failed: {e}")

        return results


def main():
    parser = argparse.ArgumentParser(
        description="Sign JSONL audit trail entries with cryptographic signatures"
    )
    parser.add_argument("--input", required=True, help="Input JSONL file")
    parser.add_argument("--output", required=True, help="Output signed JSONL file")
    parser.add_argument("--key", required=False, help="Signing key (use env var in production)")
    parser.add_argument("--key-env", default="AUDIT_SIGNING_KEY", help="Environment variable for key")

    args = parser.parse_args()

    # Get signing key
    import os
    signing_key = args.key or os.environ.get(args.key_env)
    if not signing_key:
        print(f"❌ Error: Signing key not provided. Set {args.key_env} environment variable or use --key")
        sys.exit(1)

    # Sign audit trail
    signer = AuditLogSigner(signing_key)
    input_path = Path(args.input)
    output_path = Path(args.output)

    print(f"📝 Signing audit trail: {input_path}")
    results = signer.sign_file(input_path, output_path)

    # Report results
    print(f"✅ Signed {results['entries_signed']} entries")
    if results["errors"]:
        print(f"⚠️  {len(results['errors'])} errors encountered:")
        for error in results["errors"][:10]:
            print(f"  - {error}")
        sys.exit(1)

    print(f"📄 Output: {results['output_file']}")


if __name__ == "__main__":
    main()
