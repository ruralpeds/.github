#!/usr/bin/env python3
"""Interactive wizard to set GitHub org custom repository properties.

Usage:
    python scripts/set-properties.py <owner>/<repo>
    python scripts/set-properties.py --dry-run ruralpeds/.github
    python scripts/set-properties.py --set iec62304-class=class-b ruralpeds/my-repo
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path

SCHEMA_PATH = Path(__file__).parent.parent / "policies" / "custom-properties" / "schema.yaml"
API_BASE = "https://api.github.com"


def gh_token() -> str:
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if not token:
        sys.exit("Error: set GH_TOKEN or GITHUB_TOKEN environment variable.")
    return token


def api_request(method: str, path: str, body=None, token: str = "") -> dict:
    url = f"{API_BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()) if r.length else {}
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        sys.exit(f"GitHub API error {e.code}: {body_text}")


def load_schema() -> list[dict]:
    try:
        import yaml  # type: ignore
        return yaml.safe_load(SCHEMA_PATH.read_text())["properties"]
    except ImportError:
        import json as _j
        # Fallback: load the JSON variant
        json_path = SCHEMA_PATH.parent.parent / "custom-properties.json"
        return _j.loads(json_path.read_text())["properties"]


def get_current_values(owner: str, repo: str, token: str) -> dict[str, str]:
    data = api_request("GET", f"/repos/{owner}/{repo}/properties/values", token=token)
    return {p["property_name"]: p["value"] for p in data} if isinstance(data, list) else {}


def prompt_value(prop: dict, current: str | None) -> str | None:
    name = prop["name"]
    allowed = [v["name"] for v in prop.get("allowed_values", [])]
    value_type = prop.get("value_type", "string")

    print(f"\n  {'─'*60}")
    print(f"  Property : {name}")
    print(f"  Type     : {value_type}")
    print(f"  Description: {prop.get('description', '').strip()}")
    if current is not None:
        print(f"  Current  : {current}")
    if allowed:
        print(f"  Options  : {', '.join(allowed)}")
    default = prop.get("default")
    prompt_suffix = f" [{current or default}]" if (current or default) else ""

    while True:
        raw = input(f"  Value{prompt_suffix}: ").strip()
        if not raw:
            return current or (str(default) if default is not None else None)
        if value_type == "true_false" and raw.lower() not in ("true", "false"):
            print("  → Enter 'true' or 'false'")
            continue
        if allowed and raw not in allowed:
            print(f"  → Must be one of: {', '.join(allowed)}")
            continue
        return raw


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", help="owner/repo to update")
    parser.add_argument("--dry-run", action="store_true", help="Print changes without applying")
    parser.add_argument(
        "--set",
        action="append",
        metavar="KEY=VALUE",
        dest="overrides",
        help="Set a specific property non-interactively (repeatable)",
    )
    args = parser.parse_args()

    if "/" not in args.repo:
        sys.exit("Error: repo must be in owner/repo format")
    owner, repo = args.repo.split("/", 1)

    token = gh_token()
    schema = load_schema()
    current = get_current_values(owner, repo, token)

    print(f"\nSetting custom properties for {owner}/{repo}")
    print(f"{'─'*62}")

    # Build override map from --set flags
    overrides: dict[str, str] = {}
    for kv in (args.overrides or []):
        if "=" not in kv:
            sys.exit(f"--set requires KEY=VALUE format, got: {kv}")
        k, v = kv.split("=", 1)
        overrides[k] = v

    updates: list[dict] = []

    if overrides:
        # Non-interactive mode
        for prop in schema:
            name = prop["name"]
            if name in overrides:
                updates.append({"property_name": name, "value": overrides[name]})
    else:
        # Interactive mode
        for prop in schema:
            name = prop["name"]
            value = prompt_value(prop, current.get(name))
            if value is not None:
                updates.append({"property_name": name, "value": value})

    if not updates:
        print("\nNo changes to apply.")
        return

    print("\n  Changes to apply:")
    for u in updates:
        old = current.get(u["property_name"], "(not set)")
        print(f"    {u['property_name']}: {old!r} → {u['value']!r}")

    if args.dry_run:
        print("\n[dry-run] No changes written.")
        return

    confirm = input("\nApply? [y/N]: ").strip().lower()
    if confirm != "y":
        print("Aborted.")
        return

    api_request(
        "PATCH",
        f"/repos/{owner}/{repo}/properties/values",
        body={"properties": updates},
        token=token,
    )
    print(f"\n✅ Properties updated on {owner}/{repo}")


if __name__ == "__main__":
    main()
