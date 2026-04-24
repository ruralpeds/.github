#!/usr/bin/env python3
"""
coverage_gate.py — enforce minimum code coverage.

Supports cobertura XML and lcov.info. Exits 1 if coverage < threshold.
"""
import argparse, re, sys, xml.etree.ElementTree as ET
from pathlib import Path


def cobertura_pct(path: Path) -> float:
    root = ET.parse(path).getroot()
    return float(root.attrib["line-rate"]) * 100


def lcov_pct(path: Path) -> float:
    hit = total = 0
    for line in path.read_text().splitlines():
        if line.startswith("LH:"): hit   += int(line[3:])
        if line.startswith("LF:"): total += int(line[3:])
    return 100.0 * hit / total if total else 0.0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", required=True, type=Path)
    ap.add_argument("--min",  required=True, type=float)
    args = ap.parse_args()

    if args.file.suffix == ".xml":
        pct = cobertura_pct(args.file)
    elif args.file.name.endswith(".info") or args.file.suffix == ".info":
        pct = lcov_pct(args.file)
    else:
        # try cobertura first, fall back to lcov
        try:   pct = cobertura_pct(args.file)
        except: pct = lcov_pct(args.file)

    status = "PASS" if pct >= args.min else "FAIL"
    marker = "" if pct >= args.min else "::error::"
    print(f"{marker}Coverage {pct:.2f}% vs minimum {args.min}% — {status}")
    return 0 if pct >= args.min else 1


if __name__ == "__main__":
    sys.exit(main())
