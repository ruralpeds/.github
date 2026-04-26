#!/usr/bin/env python3
"""Check IEC 62304 traceability gaps in DHF YAML files.

Rules:
  1. Every non-retired, non-draft SW-### must have >= 1 active test in unit-test-map.yaml
  2. Every HZ-### with residual severity >= serious must have >= 1 risk control
  3. Every RC-### cited from a hazard must be cited by >= 1 SW-### requirement
  4. No duplicate IDs (across all files)
  5. WARN (not fail): active test cites a retired requirement

Exit codes:
  0 — all checks pass (warnings may still be printed)
  1 — hard gap (missing test, missing RC, orphan RC)
  2 — schema / parse error

Usage:
    python scripts/traceability/check_gaps.py --dhf dhf
"""

import argparse
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("PyYAML is required: pip install pyyaml")

SERIOUS_AND_ABOVE = {"serious", "critical", "catastrophic"}


def load_yaml(path: Path) -> dict:
    with open(path) as f:
        return yaml.safe_load(f) or {}


def load_dhf(dhf_path: Path) -> tuple[list[dict], list[dict], list[dict]]:
    reqs, hazards, tests = [], [], []
    for f in sorted(dhf_path.glob("requirements/*.yaml")):
        data = load_yaml(f)
        for r in data.get("requirements", []):
            r.setdefault("_source", str(f))
            reqs.append(r)
    for f in sorted(dhf_path.glob("risk/*.yaml")):
        data = load_yaml(f)
        for h in data.get("hazards", []):
            h.setdefault("_source", str(f))
            hazards.append(h)
    for f in sorted(dhf_path.glob("verification/*.yaml")):
        data = load_yaml(f)
        for t in data.get("tests", []):
            t.setdefault("_source", str(f))
            tests.append(t)
    return reqs, hazards, tests


def check(dhf_path: Path) -> int:
    try:
        reqs, hazards, tests = load_dhf(dhf_path)
    except Exception as e:
        print(f"ERROR parsing DHF files: {e}", file=sys.stderr)
        return 2

    errors: list[str] = []
    warnings: list[str] = []

    # ── Check 1: duplicate IDs ─────────────────────────────────────────────
    seen_ids: dict[str, str] = {}
    for r in reqs:
        rid = r.get("id", "")
        if rid in seen_ids:
            errors.append(f"Duplicate ID {rid!r} in {r['_source']} (first seen in {seen_ids[rid]})")
        else:
            seen_ids[rid] = r["_source"]

    for h in hazards:
        hid = h.get("id", "")
        if hid in seen_ids:
            errors.append(f"Duplicate ID {hid!r} in {h['_source']} (first seen in {seen_ids[hid]})")
        else:
            seen_ids[hid] = h["_source"]
        for c in h.get("controls", []):
            rc_id = c["id"] if isinstance(c, dict) else c
            rc_src = f"{h['_source']}[{hid}.controls]"
            if rc_id in seen_ids and not rc_id.startswith("RC-"):
                errors.append(f"Duplicate ID {rc_id!r} at {rc_src}")
            elif rc_id not in seen_ids:
                seen_ids[rc_id] = rc_src

    for t in tests:
        tid = t.get("id", "")
        if tid in seen_ids:
            errors.append(f"Duplicate ID {tid!r} in {t['_source']} (first seen in {seen_ids[tid]})")
        else:
            seen_ids[tid] = t["_source"]

    # ── Build lookup tables ────────────────────────────────────────────────
    req_by_id: dict[str, dict] = {r["id"]: r for r in reqs if "id" in r}
    retired_sw = {r["id"] for r in reqs if r.get("status") == "retired"}

    tested_sw: dict[str, list[str]] = {}
    for t in tests:
        if t.get("status", "active") == "retired":
            continue
        for sw_id in t.get("verifies", []):
            tested_sw.setdefault(sw_id, []).append(t["id"])

    rc_to_sw: dict[str, list[str]] = {}
    for r in reqs:
        for rc in r.get("risk_controls", []):
            rc_to_sw.setdefault(rc, []).append(r["id"])

    # ── Check 2: every active SW must have a test ─────────────────────────
    for r in reqs:
        sw_id = r.get("id", "")
        status = r.get("status", "active")
        if status in ("retired", "draft"):
            continue
        if sw_id not in tested_sw:
            errors.append(
                f"MISSING TEST: {sw_id} ({r.get('title', '')!r}) "
                f"in {r['_source']} has no active test in unit-test-map.yaml"
            )

    # ── Check 3: serious+ hazards must have controls ──────────────────────
    for h in hazards:
        hz_id = h.get("id", "")
        residual = h.get("severity_residual", h.get("severity", "negligible"))
        controls = h.get("controls", [])
        rc_ids = [c["id"] if isinstance(c, dict) else c for c in controls]
        if residual in SERIOUS_AND_ABOVE and not rc_ids:
            errors.append(
                f"MISSING CONTROL: {hz_id} ({h.get('title', '')!r}) "
                f"has residual severity={residual!r} but no risk controls in {h['_source']}"
            )

    # ── Check 4: every RC cited by a hazard must be cited by a SW req ─────
    for h in hazards:
        hz_id = h.get("id", "")
        for c in h.get("controls", []):
            rc_id = c["id"] if isinstance(c, dict) else c
            if rc_id not in rc_to_sw:
                errors.append(
                    f"ORPHAN CONTROL: {rc_id} cited by {hz_id} ({h['_source']}) "
                    f"is not referenced by any SW-### requirement"
                )

    # ── Check 5 (warn): active test cites retired requirement ─────────────
    for t in tests:
        if t.get("status", "active") == "retired":
            continue
        for sw_id in t.get("verifies", []):
            if sw_id in retired_sw:
                warnings.append(
                    f"WARN: Test {t['id']} ({t['_source']}) "
                    f"cites retired requirement {sw_id} — consider updating"
                )

    for w in warnings:
        print(w)

    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        return 1

    tested_count = sum(1 for r in reqs if r.get("status") == "active" and r.get("id") in tested_sw)
    active_count = sum(1 for r in reqs if r.get("status") == "active")
    print(
        f"All checks passed: {active_count} active requirements "
        f"({tested_count} tested), {len(hazards)} hazards"
    )
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dhf", default="dhf", help="Path to DHF directory")
    args = parser.parse_args()
    sys.exit(check(Path(args.dhf)))


if __name__ == "__main__":
    main()
