#!/usr/bin/env python3
"""Render BUILD.md from .build/manifest.yaml.

Used by .github/workflows/build-md-render.yml in every consumer repo.
Idempotent: re-running with no manifest change produces no diff (last_updated
is read from the manifest, not from `now()`).

Usage:
    python scripts/render_build_md.py \
        --manifest .build/manifest.yaml \
        --template templates/build-management/BUILD.template.md \
        --out BUILD.md
"""
from __future__ import annotations

import argparse
import datetime as dt
import sys
from collections import Counter
from pathlib import Path

try:
    from ruamel.yaml import YAML
except ImportError:
    sys.stderr.write("ruamel.yaml is required. pip install 'ruamel.yaml>=0.18,<0.19'\n")
    sys.exit(2)

STATUS_ORDER = ["building", "blocked", "approved", "planned", "built"]


def load_manifest(path: Path) -> dict:
    yaml = YAML(typ="safe")
    with path.open("r", encoding="utf-8") as f:
        data = yaml.load(f)
    if not isinstance(data, dict) or "features" not in data:
        raise SystemExit(f"{path}: invalid manifest (missing 'features')")
    return data


def status_emoji(status: str) -> str:
    return {
        "built": "✅",
        "building": "🔨",
        "approved": "📋",
        "planned": "💭",
        "blocked": "⛔",
    }.get(status, "?")


def feature_sort_key(f: dict):
    try:
        idx = STATUS_ORDER.index(f.get("status", "planned"))
    except ValueError:
        idx = 99
    return (idx, f.get("priority", "P9"), f.get("id", ""))


def render_table(features: list[dict]) -> str:
    rows = []
    for f in sorted(features, key=feature_sort_key):
        gap = f.get("gap_ref") or "—"
        pr = f"#{f['pr']}" if f.get("pr") else "—"
        built = f.get("built_at") or "—"
        owner = f.get("owner") or "—"
        rows.append(
            f"| `{f['id']}` | {f['name']} | {status_emoji(f['status'])} {f['status']} "
            f"| {f.get('priority', '—')} | {owner} | {gap} | {pr} | {built} |"
        )
    return "\n".join(rows) if rows else "| _(no features yet)_ | | | | | | | |"


def render_history(features: list[dict]) -> str:
    built = [f for f in features if f.get("status") == "built" and f.get("built_at")]
    built.sort(key=lambda f: f.get("built_at", ""), reverse=True)
    if not built:
        return "_No features built yet._"
    return "\n".join(
        f"- `{f['id']}` **{f['name']}** — built {f['built_at']}" for f in built
    )


def render(manifest: dict, template: str) -> str:
    features = manifest.get("features", [])
    counts = Counter(f.get("status", "planned") for f in features)
    last_rendered = manifest.get("last_updated") or dt.date.today().isoformat()

    out = template
    replacements = {
        "<REPO>": manifest.get("repo", "unknown/repo"),
        "<LAST_RENDERED>": str(last_rendered),
        "<COUNT_BUILT>": str(counts.get("built", 0)),
        "<COUNT_BUILDING>": str(counts.get("building", 0)),
        "<COUNT_APPROVED>": str(counts.get("approved", 0)),
        "<COUNT_PLANNED>": str(counts.get("planned", 0)),
        "<COUNT_BLOCKED>": str(counts.get("blocked", 0)),
        "<COUNT_TOTAL>": str(len(features)),
    }
    for k, v in replacements.items():
        out = out.replace(k, v)

    out = _replace_block(out, "FEATURE_TABLE", render_table(features))
    out = _replace_block(out, "BUILT_HISTORY", render_history(features))
    return out


def _replace_block(text: str, marker: str, body: str) -> str:
    begin = f"<!-- BEGIN: {marker} -->"
    end = f"<!-- END: {marker} -->"
    if begin not in text or end not in text:
        return text
    pre, _, rest = text.partition(begin)
    _, _, post = rest.partition(end)
    return f"{pre}{begin}\n{body}\n{end}{post}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True, type=Path)
    ap.add_argument("--template", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    args = ap.parse_args()

    manifest = load_manifest(args.manifest)
    template = args.template.read_text(encoding="utf-8")
    rendered = render(manifest, template)

    if args.out.exists() and args.out.read_text(encoding="utf-8") == rendered:
        print(f"{args.out}: no change")
        return 0
    args.out.write_text(rendered, encoding="utf-8")
    print(f"{args.out}: rendered ({len(manifest.get('features', []))} features)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
