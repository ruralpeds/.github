#!/usr/bin/env python3
"""Propose new GAP-NNN and FEAT-NNN entries by diffing manifest vs. roadmap.

Heuristic, intentionally simple: pulls every Markdown heading at level 2-4 from
the roadmap files, lowercases and tokenises the manifest's existing feature
names, and proposes any roadmap heading that doesn't have a token overlap >=
0.5 with any existing feature.

The output is two patch fragments appended to GAP_ANALYSIS.md and manifest.yaml,
ready for the create-pull-request action to commit.

Run by: .github/workflows/gap-analysis-request.yml
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path

from ruamel.yaml import YAML


HEADING_RE = re.compile(r"^(#{2,4})\s+(.+?)\s*$", re.MULTILINE)


def tokenise(s: str) -> set[str]:
    return {t for t in re.findall(r"[a-z0-9]{3,}", s.lower())}


def overlap(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / min(len(a), len(b))


def next_id(existing: list[str], prefix: str) -> str:
    nums = [int(m.group(1)) for x in existing if (m := re.match(rf"^{prefix}-(\d+)$", x))]
    return f"{prefix}-{(max(nums) if nums else 0) + 1:03d}"


def load_manifest(path: Path) -> dict:
    yaml = YAML()
    yaml.preserve_quotes = True
    if not path.exists():
        return {"version": 1, "features": []}
    with path.open() as f:
        return yaml.load(f) or {"version": 1, "features": []}


def existing_gap_ids(gap_doc: Path) -> list[str]:
    if not gap_doc.exists():
        return []
    return re.findall(r"GAP-\d+", gap_doc.read_text())


def existing_feature_ids(manifest: dict) -> list[str]:
    return [f["id"] for f in manifest.get("features", [])]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scope", required=True)
    ap.add_argument("--roadmap-paths", required=True, help="comma-separated")
    ap.add_argument("--manifest", required=True, type=Path)
    ap.add_argument("--gap-doc", required=True, type=Path)
    args = ap.parse_args()

    manifest = load_manifest(args.manifest)
    feature_tokens = [tokenise(f.get("name", "")) for f in manifest.get("features", [])]

    proposals: list[tuple[str, str]] = []  # (heading, source-file)
    for raw in args.roadmap_paths.split(","):
        p = Path(raw.strip())
        if not p.exists():
            continue
        for m in HEADING_RE.finditer(p.read_text(encoding="utf-8", errors="ignore")):
            heading = m.group(2).strip()
            if len(heading) < 6 or heading.lower().startswith(("overview", "summary", "introduction")):
                continue
            tk = tokenise(heading)
            if any(overlap(tk, ft) >= 0.5 for ft in feature_tokens):
                continue
            proposals.append((heading, str(p)))

    # cap to keep PR readable
    proposals = proposals[:20]
    if not proposals:
        print("No new proposals — manifest already covers the roadmap.")
        return 0

    # Append to manifest
    yaml = YAML()
    yaml.preserve_quotes = True
    feat_ids = existing_feature_ids(manifest)
    for heading, source in proposals:
        fid = next_id(feat_ids, "FEAT")
        feat_ids.append(fid)
        manifest.setdefault("features", []).append({
            "id": fid,
            "name": heading,
            "description": f"Proposed from {source} via gap-analysis-request on {dt.date.today().isoformat()}.",
            "status": "planned",
            "priority": "P3",
            "owner": None,
            "gap_ref": None,
            "pr": None,
            "branch": None,
            "built_at": None,
            "acceptance": [],
        })
    manifest["last_updated"] = dt.date.today().isoformat()
    with args.manifest.open("w") as f:
        yaml.dump(manifest, f)

    # Append to GAP_ANALYSIS.md
    gap_ids = existing_gap_ids(args.gap_doc)
    block = ["\n\n---\n\n## Proposed by gap-analysis-request — " + dt.date.today().isoformat() + "\n",
             f"_Scope: {args.scope}_\n"]
    for heading, source in proposals:
        gid = next_id(gap_ids, "GAP")
        gap_ids.append(gid)
        block.append(
            f"\n### {gid}: {heading}\n\n"
            f"**Status**: Not Started\n"
            f"**Priority**: P3 (Medium)\n"
            f"**Owner**: [Unassigned]\n"
            f"**Source**: `{source}`\n\n"
            f"**Description**:\n"
            f"Auto-proposed because no feature in `.build/manifest.yaml` covers this roadmap item.\n\n"
            f"**Acceptance Criteria**:\n- [ ] Define\n- [ ] Implement\n- [ ] Verify\n"
        )
    args.gap_doc.parent.mkdir(parents=True, exist_ok=True)
    with args.gap_doc.open("a", encoding="utf-8") as f:
        f.write("".join(block))

    print(f"Proposed {len(proposals)} new features / gaps.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
