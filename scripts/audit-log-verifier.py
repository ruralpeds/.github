#!/usr/bin/env python3
"""
Cryptographic Audit Trail Verifier

Verifies integrity of signed audit logs by validating:
1. HMAC signatures on each entry
2. Hash chain (previous_hash references)
3. No missing or out-of-order entries

Returns detailed report for compliance audits.
"""

import json
import hmac
import hashlib
from pathlib import Path
from typing import Dict, List
import argparse
from datetime import datetime
import sys


class AuditLogVerifier:
    """Verifies integrity of cryptographically signed audit logs."""

    def __init__(self, signing_key: str):
        """
        Initialize verifier with key.

        Args:
            signing_key: Secret key for HMAC verification
        """
        self.key = signing_key.encode() if isinstance(signing_key, str) else signing_key

    def verify_signature(self, entry: Dict) -> bool:
        """
        Verify HMAC-SHA256 signature on entry.

        Args:
            entry: Entry dict with signature field

        Returns:
            True if signature valid, False otherwise
        """
        if "signature" not in entry:
            return False

        stored_sig = entry["signature"]
        entry_copy = entry.copy()
        entry_copy.pop("signature")

        entry_json = json.dumps(entry_copy, sort_keys=True, separators=(',', ':'))
        expected_sig = hmac.new(
            self.key,
            entry_json.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(stored_sig, expected_sig)

    def compute_hash(self, entry: Dict) -> str:
        """
        Compute SHA256 hash of entry.

        Args:
            entry: Entry dict (signature will be excluded)

        Returns:
            SHA256 hash
        """
        entry_copy = entry.copy()
        entry_copy.pop("signature", None)
        entry_json = json.dumps(entry_copy, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(entry_json.encode()).hexdigest()

    def verify_integrity(self, audit_file: Path) -> Dict:
        """
        Verify complete audit trail integrity.

        Checks:
        1. All signatures valid
        2. Hash chain unbroken
        3. No missing entries (sequence numbers continuous)
        4. Timestamps monotonically increasing

        Args:
            audit_file: Path to signed JSONL audit file

        Returns:
            Report dict with validation results
        """
        results = {
            "valid": True,
            "entries_checked": 0,
            "tampering_detected": False,
            "errors": [],
            "warnings": [],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "file": str(audit_file)
        }

        if not audit_file.exists():
            results["valid"] = False
            results["errors"].append(f"Audit file not found: {audit_file}")
            return results

        previous_hash = None
        previous_sequence = -1
        previous_timestamp = None

        try:
            with open(audit_file, 'r') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue

                    try:
                        entry = json.loads(line)

                        # Verify signature
                        if not self.verify_signature(entry):
                            results["valid"] = False
                            results["errors"].append(
                                f"Line {line_num}: Invalid signature"
                            )
                            continue

                        # Verify hash chain
                        expected_prev_hash = entry.get("previous_hash")
                        if expected_prev_hash != (previous_hash or "genesis"):
                            results["valid"] = False
                            results["tampering_detected"] = True
                            results["errors"].append(
                                f"Line {line_num}: Hash chain broken (expected {previous_hash or 'genesis'}, got {expected_prev_hash})"
                            )
                            continue

                        # Verify sequence
                        sequence = entry.get("sequence")
                        if sequence is None:
                            results["errors"].append(f"Line {line_num}: Missing sequence")
                            results["valid"] = False
                        elif sequence != previous_sequence + 1 and previous_sequence >= 0:
                            results["valid"] = False
                            results["tampering_detected"] = True
                            results["errors"].append(
                                f"Line {line_num}: Sequence break (expected {previous_sequence + 1}, got {sequence})"
                            )

                        # Verify timestamp ordering
                        timestamp = entry.get("timestamp")
                        if timestamp and previous_timestamp:
                            if timestamp < previous_timestamp:
                                results["warnings"].append(
                                    f"Line {line_num}: Timestamp out of order"
                                )

                        # Update tracking
                        previous_hash = self.compute_hash(entry)
                        previous_sequence = sequence if sequence is not None else previous_sequence
                        previous_timestamp = timestamp
                        results["entries_checked"] += 1

                    except json.JSONDecodeError as e:
                        results["valid"] = False
                        results["errors"].append(f"Line {line_num}: JSON decode error: {e}")

        except Exception as e:
            results["valid"] = False
            results["errors"].append(f"File read error: {e}")

        return results


def main():
    parser = argparse.ArgumentParser(
        description="Verify integrity of cryptographically signed audit logs"
    )
    parser.add_argument("--input", required=True, help="Signed JSONL audit file")
    parser.add_argument("--key", required=False, help="Signing key (use env var in production)")
    parser.add_argument("--key-env", default="AUDIT_SIGNING_KEY", help="Environment variable for key")
    parser.add_argument("--output", help="Output verification report (JSON)")

    args = parser.parse_args()

    # Get signing key
    import os
    signing_key = args.key or os.environ.get(args.key_env)
    if not signing_key:
        print(f"❌ Error: Signing key not provided. Set {args.key_env} environment variable or use --key")
        sys.exit(1)

    # Verify audit trail
    verifier = AuditLogVerifier(signing_key)
    input_path = Path(args.input)

    print(f"🔍 Verifying audit trail integrity: {input_path}")
    results = verifier.verify_integrity(input_path)

    # Report results
    print(f"✅ Verified {results['entries_checked']} entries")

    if results["valid"]:
        print("✅ Audit trail integrity: VALID")
    else:
        print("❌ Audit trail integrity: INVALID")

    if results["errors"]:
        print(f"\n❌ {len(results['errors'])} errors found:")
        for error in results["errors"][:20]:
            print(f"  {error}")

    if results["warnings"]:
        print(f"\n⚠️  {len(results['warnings'])} warnings:")
        for warning in results["warnings"][:10]:
            print(f"  {warning}")

    # Output report if requested
    if args.output:
        output_path = Path(args.output)
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n📄 Report: {output_path}")

    # Exit with appropriate code
    sys.exit(0 if results["valid"] else 1)


if __name__ == "__main__":
    main()
