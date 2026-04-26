"""Unit tests for scripts/chain/verify.py"""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from chain.append import GENESIS_PREV_HASH, append_entry, compute_self_hash
from chain.verify import verify_chain


def build_chain(tmp_path, n: int) -> Path:
    chain = tmp_path / "chain.ndjson"
    for i in range(n):
        event_type = "chain.genesis" if i == 0 else "build.completed"
        append_entry(chain, event_type, {"i": i}, sign=False)
    return chain


# ── clean chain ───────────────────────────────────────────────────────────────

def test_verify_single_genesis_entry(tmp_path):
    chain = build_chain(tmp_path, 1)
    assert verify_chain(chain) == 0


def test_verify_three_entries(tmp_path):
    chain = build_chain(tmp_path, 3)
    assert verify_chain(chain) == 0


def test_verify_ten_entries(tmp_path):
    chain = build_chain(tmp_path, 10)
    assert verify_chain(chain) == 0


# ── tampered payload ──────────────────────────────────────────────────────────

def test_verify_detects_tampered_event_type(tmp_path):
    chain = build_chain(tmp_path, 3)
    lines = chain.read_bytes().splitlines()
    entry = json.loads(lines[1])
    entry["event_type"] = "build.tampered"
    lines[1] = json.dumps(entry, separators=(",", ":")).encode()
    chain.write_bytes(b"\n".join(lines) + b"\n")
    assert verify_chain(chain) != 0


def test_verify_detects_tampered_event_data(tmp_path):
    chain = build_chain(tmp_path, 3)
    lines = chain.read_bytes().splitlines()
    entry = json.loads(lines[1])
    entry["event_data"]["injected"] = "malicious"
    lines[1] = json.dumps(entry, separators=(",", ":")).encode()
    chain.write_bytes(b"\n".join(lines) + b"\n")
    assert verify_chain(chain) != 0


def test_verify_detects_tampered_timestamp(tmp_path):
    chain = build_chain(tmp_path, 2)
    lines = chain.read_bytes().splitlines()
    entry = json.loads(lines[0])
    entry["timestamp"] = "1970-01-01T00:00:00.000Z"
    lines[0] = json.dumps(entry, separators=(",", ":")).encode()
    chain.write_bytes(b"\n".join(lines) + b"\n")
    assert verify_chain(chain) != 0


# ── prev_hash mismatch ────────────────────────────────────────────────────────

def test_verify_detects_prev_hash_mismatch(tmp_path):
    chain = build_chain(tmp_path, 3)
    lines = chain.read_bytes().splitlines()
    entry = json.loads(lines[1])
    entry["prev_hash"] = "sha256:" + "a" * 64
    # Update self_hash to be consistent with the modified prev_hash
    # but still report as a break because the hash chain is broken
    lines[1] = json.dumps(entry, separators=(",", ":")).encode()
    chain.write_bytes(b"\n".join(lines) + b"\n")
    assert verify_chain(chain) != 0


# ── seq gaps ──────────────────────────────────────────────────────────────────

def test_verify_detects_missing_entry(tmp_path):
    chain = build_chain(tmp_path, 4)
    lines = chain.read_bytes().splitlines(keepends=True)
    # Remove line at index 2 (seq=3)
    del lines[2]
    chain.write_bytes(b"".join(lines))
    assert verify_chain(chain) != 0


def test_verify_detects_duplicate_seq(tmp_path):
    chain = build_chain(tmp_path, 3)
    lines = chain.read_bytes().splitlines()
    # Duplicate the second entry (seq=2)
    lines.insert(2, lines[1])
    chain.write_bytes(b"\n".join(lines) + b"\n")
    assert verify_chain(chain) != 0


# ── file / edge cases ────────────────────────────────────────────────────────

def test_verify_missing_file(tmp_path):
    chain = tmp_path / "nonexistent.ndjson"
    assert verify_chain(chain) != 0


def test_verify_empty_file(tmp_path):
    chain = tmp_path / "chain.ndjson"
    chain.write_bytes(b"")
    # An empty chain is considered valid (nothing to verify)
    assert verify_chain(chain) == 0


def test_verify_invalid_json_line(tmp_path):
    chain = tmp_path / "chain.ndjson"
    chain.write_bytes(b'{"seq":1,"bad":\n')
    assert verify_chain(chain) != 0


# ── integration: append then verify ──────────────────────────────────────────

def test_append_then_verify_roundtrip(tmp_path):
    chain = tmp_path / "chain.ndjson"
    for i in range(5):
        append_entry(chain, "build.completed", {"n": i}, sign=False)
    assert verify_chain(chain) == 0


def test_corrupt_then_verify_fails(tmp_path):
    chain = tmp_path / "chain.ndjson"
    for i in range(3):
        append_entry(chain, "build.completed", {"n": i}, sign=False)

    # Corrupt the second entry
    lines = chain.read_bytes().splitlines()
    entry = json.loads(lines[1])
    entry["event_data"]["n"] = 999
    lines[1] = json.dumps(entry, separators=(",", ":")).encode()
    chain.write_bytes(b"\n".join(lines) + b"\n")

    assert verify_chain(chain) != 0
