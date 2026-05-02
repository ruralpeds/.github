#!/usr/bin/env python3
"""
build_audit_dashboard.py
Rural Peds Clinical Audit Dashboard

Fetches every .clinical-audit/registry.yaml in the org (Rust + Julia repos),
aggregates stats, and writes a Markdown dashboard to stdout and optionally to
a file for committing back to ruralpeds/.github.

Usage:
  python3 scripts/build_audit_dashboard.py --token ghp_... [--output DASHBOARD.md]

Requires: Python 3.9+, requests (pip install requests)
"""

import argparse
import base64
import json
import re
import sys
import time
from datetime import date, datetime
from pathlib import Path

import requests

ORG = "ruralpeds"
TODAY = str(date.today())
SCANNER_VERSION = "clinical_audit_scanner v1.0"

SKIP_REPOS = {".github", "gap-analysis-standard", "gap-dashboard"}

# ─────────────────────────────────────────────────────────────────────────────
# GitHub API helpers
# ─────────────────────────────────────────────────────────────────────────────

def api(method: str, path: str, token: str, **kwargs) -> requests.Response:
    url = f"https://api.github.com{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    r = getattr(requests, method)(url, headers=headers, timeout=30, **kwargs)
    if r.status_code == 403 and "rate limit" in r.text.lower():
        reset = int(r.headers.get("X-RateLimit-Reset", time.time() + 60))
        wait = max(reset - int(time.time()), 5)
        print(f"  ⏳ Rate limited — sleeping {wait}s", file=sys.stderr, flush=True)
        time.sleep(wait)
        r = getattr(requests, method)(url, headers=headers, timeout=30, **kwargs)
    return r


def fetch_file(org: str, repo: str, path: str, token: str) -> str | None:
    r = api("get", f"/repos/{org}/{repo}/contents/{path}", token)
    if r.status_code == 404:
        return None
    if r.status_code != 200:
        return None
    data = r.json()
    return base64.b64decode(data["content"]).decode("utf-8", errors="replace")


def list_repos_by_language(org: str, languages: list[str], token: str) -> list[dict]:
    """Return list of {name, language} dicts for all non-archived repos."""
    all_repos: dict[str, dict] = {}
    page = 1
    while True:
        r = api("get", f"/orgs/{org}/repos", token,
                params={"per_page": 100, "page": page, "type": "all"})
        r.raise_for_status()
        batch = r.json()
        if not batch:
            break
        for repo in batch:
            if repo.get("archived"):
                continue
            lang = (repo.get("language") or "").lower()
            if lang in [l.lower() for l in languages]:
                name = repo["name"]
                if name not in all_repos:
                    all_repos[name] = {"name": name, "language": repo.get("language", "unknown")}
        page += 1
        if len(batch) < 100:
            break
    return list(all_repos.values())


# ─────────────────────────────────────────────────────────────────────────────
# Registry YAML parser
# Targeted parser for the known output of clinical_audit_scanner.py.
# No external deps.
# ─────────────────────────────────────────────────────────────────────────────

def _unquote(val: str) -> str:
    val = val.strip()
    if (val.startswith('"') and val.endswith('"')) or \
       (val.startswith("'") and val.endswith("'")):
        return val[1:-1]
    return val


def _parse_scalar(val: str) -> str | None:
    val = val.strip()
    if val in ("null", "~", ""):
        return None
    return _unquote(val)


def parse_registry(text: str) -> dict:
    """Parse a registry.yaml into a dict with a 'functions' list."""
    registry: dict = {
        "version": None,
        "repo": None,
        "language": None,
        "last_scanned": None,
        "generator": None,
        "functions": [],
    }

    lines = text.splitlines()
    i = 0
    current_fn: dict | None = None
    in_functions = False
    in_review = False
    in_validation = False
    in_dates = False
    in_references = False
    current_ref: dict | None = None

    def flush_fn():
        nonlocal current_fn
        if current_fn is not None:
            registry["functions"].append(current_fn)
        current_fn = None

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip blank lines and comments
        if not stripped or stripped.startswith("#"):
            i += 1
            continue

        indent = len(line) - len(line.lstrip())

        # Top-level scalars
        if indent == 0:
            in_functions = False
            in_review = False
            in_validation = False
            in_dates = False
            in_references = False
            current_ref = None

            if stripped == "functions:":
                flush_fn()
                in_functions = True
                i += 1
                continue

            if ":" in stripped:
                key, _, val = stripped.partition(":")
                key = key.strip()
                if key in registry and key != "functions":
                    registry[key] = _parse_scalar(val)

        # Function list entry (indent=2, starts with "- ")
        elif in_functions and indent == 2 and stripped.startswith("- "):
            flush_fn()
            in_review = False
            in_validation = False
            in_dates = False
            in_references = False
            current_ref = None
            current_fn = {
                "id": None, "name": None, "qualified": None, "file": None,
                "line_start": None, "category": None, "signature": None,
                "description": None,
                "dates": {"first_commit": None, "last_modified": None, "last_reviewed": None},
                "references": [],
                "validation": {
                    "has_tests": False, "test_files": [], "method": None,
                    "iec62304_class": None, "last_validated": None, "validation_notes": None,
                },
                "review": {"status": None, "reviewer": None, "reviewed_at": None, "notes": None},
            }
            # parse inline key after "- "
            rest = stripped[2:]
            if ":" in rest:
                key, _, val = rest.partition(":")
                key = key.strip()
                if key in current_fn:
                    current_fn[key] = _parse_scalar(val)

        # Function-level fields (indent=4)
        elif current_fn is not None and indent == 4:
            in_review = False
            in_validation = False
            in_dates = False
            in_references = False
            current_ref = None

            if stripped == "review:":
                in_review = True
            elif stripped == "validation:":
                in_validation = True
            elif stripped == "dates:":
                in_dates = True
            elif stripped == "references:":
                in_references = True
            elif ":" in stripped:
                key, _, val = stripped.partition(":")
                key = key.strip()
                if key in current_fn:
                    current_fn[key] = _parse_scalar(val)
                elif key == "line_start":
                    try:
                        current_fn["line_start"] = int(val.strip())
                    except ValueError:
                        pass

        # Sub-section fields (indent=6)
        elif current_fn is not None and indent == 6:
            if in_review and ":" in stripped:
                key, _, val = stripped.partition(":")
                current_fn["review"][key.strip()] = _parse_scalar(val)
            elif in_validation and ":" in stripped and not stripped.startswith("- "):
                key, _, val = stripped.partition(":")
                k = key.strip()
                if k == "has_tests":
                    current_fn["validation"]["has_tests"] = val.strip() == "true"
                elif k == "iec62304_class":
                    current_fn["validation"]["iec62304_class"] = _parse_scalar(val)
                elif k == "method":
                    current_fn["validation"]["method"] = _parse_scalar(val)
                elif k == "last_validated":
                    current_fn["validation"]["last_validated"] = _parse_scalar(val)
                elif k == "validation_notes":
                    current_fn["validation"]["validation_notes"] = _parse_scalar(val)
            elif in_dates and ":" in stripped:
                key, _, val = stripped.partition(":")
                current_fn["dates"][key.strip()] = _parse_scalar(val)
            elif in_references and stripped.startswith("- "):
                # start a new reference entry
                current_ref = {"type": None, "citation": None}
                registry["functions"]  # just to avoid unused warning
                rest = stripped[2:]
                if ":" in rest:
                    key, _, val = rest.partition(":")
                    current_ref[key.strip()] = _parse_scalar(val)
                current_fn["references"].append(current_ref)

        # Reference sub-fields (indent=8)
        elif current_fn is not None and indent == 8 and in_references and current_ref is not None:
            if ":" in stripped:
                key, _, val = stripped.partition(":")
                current_ref[key.strip()] = _parse_scalar(val)

        i += 1

    flush_fn()
    return registry


# ─────────────────────────────────────────────────────────────────────────────
# Aggregation
# ─────────────────────────────────────────────────────────────────────────────

def days_between(date_str_a: str | None, date_str_b: str | None) -> int | None:
    """Return (b - a).days, or None if either is missing."""
    if not date_str_a or not date_str_b:
        return None
    try:
        a = datetime.fromisoformat(date_str_a).date()
        b = datetime.fromisoformat(date_str_b).date()
        return (b - a).days
    except ValueError:
        return None


def is_stale(fn: dict) -> bool:
    """Approved function whose last_modified is newer than last_reviewed."""
    if fn["review"]["status"] != "approved":
        return False
    diff = days_between(fn["dates"].get("last_reviewed"), fn["dates"].get("last_modified"))
    return diff is not None and diff > 0


def days_pending(fn: dict) -> int | None:
    """Days since first_commit for a pending function."""
    if fn["review"]["status"] != "pending":
        return None
    return days_between(fn["dates"].get("first_commit"), TODAY)


def aggregate(registries: list[dict]) -> dict:
    totals = {
        "repos_with_registry": 0,
        "total_functions": 0,
        "by_status": {"pending": 0, "approved": 0, "flagged": 0, "not_applicable": 0},
        "by_category": {},
        "by_iec_class": {"A": 0, "B": 0, "C": 0, "unclassified": 0},
        "flagged": [],       # {repo, fn}
        "stale": [],         # {repo, fn}
        "long_pending": [],  # {repo, fn, days}
    }

    for reg in registries:
        if not reg.get("functions"):
            continue
        totals["repos_with_registry"] += 1
        repo_name = reg.get("repo", "unknown")

        for fn in reg["functions"]:
            totals["total_functions"] += 1

            status = fn["review"]["status"] or "pending"
            totals["by_status"][status] = totals["by_status"].get(status, 0) + 1

            cat = fn.get("category") or "unknown"
            totals["by_category"][cat] = totals["by_category"].get(cat, 0) + 1

            cls = fn["validation"].get("iec62304_class") or ""
            if cls in ("A", "B", "C"):
                totals["by_iec_class"][cls] += 1
            else:
                totals["by_iec_class"]["unclassified"] += 1

            if status == "flagged":
                totals["flagged"].append({"repo": repo_name, "fn": fn})

            if is_stale(fn):
                totals["stale"].append({"repo": repo_name, "fn": fn})

            dp = days_pending(fn)
            if dp is not None and dp > 30:
                totals["long_pending"].append({"repo": repo_name, "fn": fn, "days": dp})

    return totals


# ─────────────────────────────────────────────────────────────────────────────
# Markdown generation
# ─────────────────────────────────────────────────────────────────────────────

def pct(n: int, total: int) -> str:
    if total == 0:
        return "—"
    return f"{n / total * 100:.0f}%"


def repo_short(full: str) -> str:
    """ruralpeds/foo → foo"""
    return full.split("/")[-1] if "/" in full else full


def generate_markdown(registries: list[dict], totals: dict, scan_date: str) -> str:
    lines: list[str] = []

    # ── Header ────────────────────────────────────────────────────────────────
    lines += [
        f"# Clinical Audit Dashboard — {scan_date}",
        "",
        f"> Generated: {scan_date} &nbsp;|&nbsp; "
        f"Repos with registry: **{totals['repos_with_registry']}** &nbsp;|&nbsp; "
        f"Total functions tracked: **{totals['total_functions']}**",
        "",
    ]

    # ── Org summary ───────────────────────────────────────────────────────────
    tf = totals["total_functions"]
    bs = totals["by_status"]
    lines += [
        "## Org Summary",
        "",
        "| Status | Count | Share |",
        "|--------|------:|------:|",
        f"| Approved | {bs.get('approved', 0)} | {pct(bs.get('approved', 0), tf)} |",
        f"| Pending | {bs.get('pending', 0)} | {pct(bs.get('pending', 0), tf)} |",
        f"| Flagged | {bs.get('flagged', 0)} | {pct(bs.get('flagged', 0), tf)} |",
        f"| Not applicable | {bs.get('not_applicable', 0)} | {pct(bs.get('not_applicable', 0), tf)} |",
        f"| **Total** | **{tf}** | 100% |",
        "",
    ]

    # ── Per-repo table ────────────────────────────────────────────────────────
    lines += [
        "## Repositories",
        "",
        "| Repo | Lang | Functions | Approved | Pending | Flagged | Stale | Last Scanned |",
        "|------|------|----------:|---------:|--------:|--------:|------:|--------------|",
    ]
    for reg in sorted(registries, key=lambda r: r.get("repo", "")):
        fns = reg.get("functions", [])
        if not fns and not reg.get("last_scanned"):
            continue
        rname = repo_short(reg.get("repo", "unknown"))
        lang = reg.get("language", "?")
        total = len(fns)
        approved = sum(1 for f in fns if f["review"]["status"] == "approved")
        pending = sum(1 for f in fns if (f["review"]["status"] or "pending") == "pending")
        flagged = sum(1 for f in fns if f["review"]["status"] == "flagged")
        stale_count = sum(1 for f in fns if is_stale(f))
        scanned = reg.get("last_scanned") or "—"
        lines.append(
            f"| {rname} | {lang} | {total} | {approved} | {pending} | {flagged} | {stale_count} | {scanned} |"
        )
    lines.append("")

    # ── Needs attention ───────────────────────────────────────────────────────
    lines += ["## Needs Attention", ""]

    # Flagged
    lines += [f"### Flagged Functions ({len(totals['flagged'])})", ""]
    if totals["flagged"]:
        lines += [
            "| Repo | Function | Reviewer | Notes |",
            "|------|----------|----------|-------|",
        ]
        for item in totals["flagged"]:
            fn = item["fn"]
            reviewer = fn["review"]["reviewer"] or "—"
            notes = (fn["review"]["notes"] or "").replace("|", "\\|")[:60]
            lines.append(
                f"| {repo_short(item['repo'])} | `{fn['name']}` | {reviewer} | {notes} |"
            )
    else:
        lines.append("_No flagged functions._")
    lines.append("")

    # Stale reviews
    lines += [f"### Stale Reviews ({len(totals['stale'])})", ""]
    lines += [
        "> Approved functions where `last_modified` is newer than `last_reviewed`.",
        "",
    ]
    if totals["stale"]:
        lines += [
            "| Repo | Function | Last Reviewed | Last Modified |",
            "|------|----------|---------------|---------------|",
        ]
        for item in totals["stale"]:
            fn = item["fn"]
            reviewed = fn["dates"].get("last_reviewed") or "—"
            modified = fn["dates"].get("last_modified") or "—"
            lines.append(
                f"| {repo_short(item['repo'])} | `{fn['name']}` | {reviewed} | {modified} |"
            )
    else:
        lines.append("_No stale reviews._")
    lines.append("")

    # Long-pending
    lines += [f"### Long-Pending Reviews >30 days ({len(totals['long_pending'])})", ""]
    if totals["long_pending"]:
        lines += [
            "| Repo | Function | Category | First Commit | Days Pending |",
            "|------|----------|----------|--------------|-------------:|",
        ]
        for item in sorted(totals["long_pending"], key=lambda x: -x["days"]):
            fn = item["fn"]
            cat = fn.get("category") or "—"
            first = fn["dates"].get("first_commit") or "—"
            lines.append(
                f"| {repo_short(item['repo'])} | `{fn['name']}` | {cat} | {first} | {item['days']} |"
            )
    else:
        lines.append("_No functions pending >30 days._")
    lines.append("")

    # ── IEC 62304 class distribution ──────────────────────────────────────────
    ic = totals["by_iec_class"]
    lines += [
        "## IEC 62304 Class Distribution",
        "",
        "| Class | Description | Count | Share |",
        "|-------|-------------|------:|------:|",
        f"| A | No injury possible | {ic['A']} | {pct(ic['A'], tf)} |",
        f"| B | Non-serious injury possible | {ic['B']} | {pct(ic['B'], tf)} |",
        f"| C | Death/serious injury possible | {ic['C']} | {pct(ic['C'], tf)} |",
        f"| — | Unclassified | {ic['unclassified']} | {pct(ic['unclassified'], tf)} |",
        "",
    ]

    # ── Category distribution ─────────────────────────────────────────────────
    bc = totals["by_category"]
    lines += [
        "## Category Distribution",
        "",
        "| Category | Count | Share |",
        "|----------|------:|------:|",
    ]
    for cat, count in sorted(bc.items(), key=lambda x: -x[1]):
        lines.append(f"| {cat} | {count} | {pct(count, tf)} |")
    lines.append("")

    # ── Footer ────────────────────────────────────────────────────────────────
    lines += [
        "---",
        "",
        f"_Auto-generated by `build_audit_dashboard.py` on {scan_date}._  ",
        "_Source: `.clinical-audit/registry.yaml` in each repo._",
        "",
    ]

    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Generate org-wide clinical audit dashboard")
    parser.add_argument("--token", required=True, help="GitHub PAT with repo read scope")
    parser.add_argument("--org", default=ORG)
    parser.add_argument("--output", help="Write markdown to this file path (in addition to stdout)")
    parser.add_argument("--json-output", help="Write raw aggregated JSON to this path")
    parser.add_argument("--repo", help="Limit to a single repo name (for testing)")
    args = parser.parse_args()

    if args.repo:
        repos = [{"name": args.repo, "language": "unknown"}]
    else:
        print("Fetching repo list...", file=sys.stderr, flush=True)
        repos = list_repos_by_language(args.org, ["Rust", "Julia"], args.token)
        repos = [r for r in repos if r["name"] not in SKIP_REPOS]
        print(f"Found {len(repos)} Rust/Julia repos", file=sys.stderr)

    registries: list[dict] = []
    for repo_info in repos:
        name = repo_info["name"]
        print(f"  Fetching {name}...", file=sys.stderr, end="", flush=True)
        raw = fetch_file(args.org, name, ".clinical-audit/registry.yaml", args.token)
        if raw is None:
            print(" (no registry)", file=sys.stderr)
            continue
        try:
            reg = parse_registry(raw)
            reg.setdefault("repo", f"{args.org}/{name}")
            reg.setdefault("language", repo_info["language"])
            registries.append(reg)
            fn_count = len(reg.get("functions", []))
            print(f" {fn_count} function(s)", file=sys.stderr)
        except Exception as e:
            print(f" ERROR parsing: {e}", file=sys.stderr)
        time.sleep(0.1)

    print(f"\nAggregating {len(registries)} registries...", file=sys.stderr)
    totals = aggregate(registries)
    markdown = generate_markdown(registries, totals, TODAY)

    # Always write to stdout (captured by workflow as step summary)
    print(markdown)

    if args.output:
        Path(args.output).write_text(markdown)
        print(f"Wrote dashboard to {args.output}", file=sys.stderr)

    if args.json_output:
        report = {
            "generated": TODAY,
            "repos_scanned": len(registries),
            "totals": {
                k: v for k, v in totals.items()
                if k not in ("flagged", "stale", "long_pending")
            },
            "flagged_count": len(totals["flagged"]),
            "stale_count": len(totals["stale"]),
            "long_pending_count": len(totals["long_pending"]),
        }
        Path(args.json_output).write_text(json.dumps(report, indent=2))
        print(f"Wrote JSON report to {args.json_output}", file=sys.stderr)

    # Exit 1 if there are flagged functions — lets caller decide whether to fail
    return 1 if totals["by_status"].get("flagged", 0) > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
