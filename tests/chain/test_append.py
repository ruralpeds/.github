"""Unit tests for scripts/chain/append.py"""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from chain.append import (
    GENESIS_PREV_HASH,
    append_entry,
    canonical_json,
    compute_self_hash,
    hashable_fields,
    read_last_entry,
    sha256_hex,
)


def make_chain(tmp_path):
    return tmp_path / "chain.ndjson"


# ── canonical_json ────────────────────────────────────────────────────────────

def test_canonical_json_sorts_keys():
    obj = {"b": 2, "a": 1}
    result = canonical_json(obj)
    assert result == b'{"a":1,"b":2}'


def test_canonical_json_no_whitespace():
    obj = {"x": [1, 2, 3]}
    result = canonical_json(obj)
    assert b" " not in result


def test_canonical_json_deterministic():
    obj = {"z": 0, "m": "v", "a": True}
    assert canonical_json(obj) == canonical_json(obj)


# ── sha256_hex ────────────────────────────────────────────────────────────────

def test_sha256_hex_prefix():
    assert sha256_hex(b"hello").startswith("sha256:")


def test_sha256_hex_length():
    h = sha256_hex(b"test")
    assert len(h) == 7 + 64  # "sha256:" + 64 hex chars


def test_sha256_hex_known():
    import hashlib
    expected = "sha256:" + hashlib.sha256(b"abc").hexdigest()
    assert sha256_hex(b"abc") == expected


# ── genesis entry ─────────────────────────────────────────────────────────────

def test_append_genesis_creates_file(tmp_path):
    chain = make_chain(tmp_path)
    append_entry(chain, "chain.genesis", {"note": "test"}, sign=False)
    assert chain.exists()


def test_append_genesis_seq_is_1(tmp_path):
    chain = make_chain(tmp_path)
    entry = append_entry(chain, "chain.genesis", {}, sign=False)
    assert entry["seq"] == 1


def test_append_genesis_prev_hash(tmp_path):
    chain = make_chain(tmp_path)
    entry = append_entry(chain, "chain.genesis", {}, sign=False)
    assert entry["prev_hash"] == GENESIS_PREV_HASH


def test_append_genesis_self_hash_correct(tmp_path):
    chain = make_chain(tmp_path)
    entry = append_entry(chain, "chain.genesis", {"x": 1}, sign=False)
    expected = compute_self_hash(entry)
    assert entry["self_hash"] == expected


def test_append_genesis_written_as_ndjson(tmp_path):
    chain = make_chain(tmp_path)
    append_entry(chain, "chain.genesis", {}, sign=False)
    lines = [l for l in chain.read_bytes().split(b"\n") if l.strip()]
    assert len(lines) == 1
    parsed = json.loads(lines[0])
    assert parsed["seq"] == 1


# ── chaining ──────────────────────────────────────────────────────────────────

def test_second_entry_prev_hash_equals_first_self_hash(tmp_path):
    chain = make_chain(tmp_path)
    e1 = append_entry(chain, "chain.genesis", {}, sign=False)
    e2 = append_entry(chain, "build.completed", {"sha": "abc123"}, sign=False)
    assert e2["prev_hash"] == e1["self_hash"]


def test_seq_increments(tmp_path):
    chain = make_chain(tmp_path)
    for i in range(5):
        e = append_entry(chain, "build.completed", {"i": i}, sign=False)
        assert e["seq"] == i + 1


def test_three_entries_form_valid_chain(tmp_path):
    chain = make_chain(tmp_path)
    entries = []
    for i in range(3):
        entries.append(append_entry(chain, "build.completed", {"i": i}, sign=False))
    assert entries[1]["prev_hash"] == entries[0]["self_hash"]
    assert entries[2]["prev_hash"] == entries[1]["self_hash"]


def test_read_last_entry_returns_latest(tmp_path):
    chain = make_chain(tmp_path)
    for i in range(3):
        append_entry(chain, "event", {"i": i}, sign=False)
    last = read_last_entry(chain)
    assert last["seq"] == 3


def test_read_last_entry_empty_file(tmp_path):
    chain = make_chain(tmp_path)
    chain.write_bytes(b"")
    assert read_last_entry(chain) is None


def test_read_last_entry_missing_file(tmp_path):
    chain = make_chain(tmp_path)
    assert read_last_entry(chain) is None


# ── self_hash stability ───────────────────────────────────────────────────────

def test_self_hash_stable_across_calls(tmp_path):
    chain = make_chain(tmp_path)
    e = append_entry(chain, "event", {"a": 1}, sign=False)
    recomputed = compute_self_hash(e)
    assert e["self_hash"] == recomputed


def test_different_event_data_gives_different_hash(tmp_path):
    chain1, chain2 = make_chain(tmp_path / "c1.ndjson"), make_chain(tmp_path / "c2.ndjson")
    # Manually create two genesis entries with same seq/timestamp but different data
    from chain.append import GENESIS_PREV_HASH, compute_self_hash

    base = {"seq": 1, "timestamp": "2026-01-01T00:00:00.000Z", "event_type": "x",
            "prev_hash": GENESIS_PREV_HASH}
    e1 = {**base, "event_data": {"x": 1}}
    e2 = {**base, "event_data": {"x": 2}}
    e1["self_hash"] = compute_self_hash(e1)
    e2["self_hash"] = compute_self_hash(e2)
    assert e1["self_hash"] != e2["self_hash"]


# ── unsigned entry fields ─────────────────────────────────────────────────────

def test_unsigned_entry_has_null_bundle(tmp_path):
    chain = make_chain(tmp_path)
    e = append_entry(chain, "event", {}, sign=False)
    assert e["sigstore_bundle"] is None


def test_unsigned_entry_has_null_rekor(tmp_path):
    chain = make_chain(tmp_path)
    e = append_entry(chain, "event", {}, sign=False)
    assert e["rekor_log_index"] is None
