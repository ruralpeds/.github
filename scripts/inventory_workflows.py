#!/usr/bin/env python3
"""
inventory_workflows.py
──────────────────────
Walk every repo under one or more GitHub owners (user or org) and dump:
  • Repo metadata (visibility, language, size, timestamps, topics, archived)
  • Branch-protection rules (requires 'admin' perms or rule-visibility API)
  • Security-feature status (secret-scanning, dependabot, code-scanning)
  • Secret & variable names (values are never exposed by the API)
  • Every .github/workflows/*.yml file (path, sha, bytes, content, parsed)
  • Key repo files if present (.github/AUDIT.yaml, SECURITY.md, CITATION.cff,
    CITATIONS.md, first 1 KB of README)
  • Registered self-hosted runners (org + repo scope where accessible)
  • Org-level data for owners where type=org: runner groups, org secrets names,
    required workflows registration

Outputs one big JSON blob. Share the JSON back in the chat so it can be
analyzed repo-by-repo for the consolidation plan.

Usage
─────
    # inventory both namespaces (default)
    python3 inventory_workflows.py

    # pick specific owners
    python3 inventory_workflows.py --owners timothyhartzog,ruralpeds

    # include private repos you don't own but have access to
    python3 inventory_workflows.py --include-collab

    # redact patterns that look like secrets in workflow content
    python3 inventory_workflows.py --redact   # recommended before sharing

Requires
────────
    • gh CLI authenticated: `gh auth status` must succeed
    • Python 3.9+
    • PyYAML    (pip install pyyaml)

The script uses `gh api` under the hood (inherits your auth + respects rate
limits automatically).
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    print("Missing dependency: pip install pyyaml", file=sys.stderr)
    sys.exit(2)


# ────────────────────────────────────────────────────────────────── gh wrapper

class GhError(RuntimeError):
    pass


def gh(path: str, *, method: str = "GET", paginate: bool = False,
       allow_404: bool = True, jq: str | None = None) -> Any:
    """Invoke `gh api` and return parsed JSON (or None on 404)."""
    cmd = ["gh", "api", "-H", "Accept: application/vnd.github+json",
           "-H", "X-GitHub-Api-Version: 2022-11-28", "-X", method]
    if paginate:
        cmd.append("--paginate")
    if jq:
        cmd += ["--jq", jq]
    cmd.append(path)
    try:
        out = subprocess.check_output(cmd, text=True, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        err = (e.stderr or "").lower()
        if allow_404 and ("404" in err or "not found" in err):
            return None
        if "403" in err and "rate limit" in err:
            print("Rate-limited; sleeping 60s …", file=sys.stderr)
            time.sleep(60)
            return gh(path, method=method, paginate=paginate,
                      allow_404=allow_404, jq=jq)
        raise GhError(f"{path} → {e.stderr.strip()}") from e
    if not out.strip():
        return None
    # --paginate concatenates arrays across pages; parse carefully
    if paginate:
        # gh --paginate yields one JSON value per page concatenated; join safely
        try:
            return json.loads(out)
        except json.JSONDecodeError:
            # array-per-page: wrap in brackets
            chunks = [json.loads(c) for c in re.findall(r'\[.*?\](?=\[|\s*$)', out, re.S)]
            merged: list = []
            for c in chunks:
                merged.extend(c if isinstance(c, list) else [c])
            return merged
    return json.loads(out)


def check_auth() -> None:
    try:
        subprocess.check_output(["gh", "auth", "status"], stderr=subprocess.STDOUT)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("gh CLI not authenticated. Run: gh auth login", file=sys.stderr)
        sys.exit(2)


# ────────────────────────────────────────────────────────────────── redaction

SECRET_PATTERNS = [
    (re.compile(r'sk-ant-(?:api|admin)[0-9a-zA-Z_-]{20,}'),  '[REDACTED_ANTHROPIC_KEY]'),
    (re.compile(r'\bsk-(?:proj-)?[A-Za-z0-9]{40,}\b'),       '[REDACTED_OPENAI_KEY]'),
    (re.compile(r'\b(ghp_|gho_|ghu_|ghs_|ghr_)[A-Za-z0-9]{36,}\b'), '[REDACTED_GH_TOKEN]'),
    (re.compile(r'\b(AKIA|ASIA)[0-9A-Z]{16}\b'),             '[REDACTED_AWS_KEY]'),
    (re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]+?-----END [A-Z ]*PRIVATE KEY-----'),
                                                             '[REDACTED_PEM_PRIVATE_KEY]'),
    (re.compile(r'xox[baprs]-[A-Za-z0-9-]{10,}'),            '[REDACTED_SLACK_TOKEN]'),
]


def redact(text: str) -> tuple[str, int]:
    hits = 0
    for pat, repl in SECRET_PATTERNS:
        text, n = pat.subn(repl, text)
        hits += n
    return text, hits


# ────────────────────────────────────────────────────────────────── per-repo

WORKFLOW_DIR = ".github/workflows"
TARGET_FILES = [
    ".github/AUDIT.yaml",
    ".github/AUDIT.yml",
    ".github/phi-patterns.yml",
    "SECURITY.md",
    "CITATION.cff",
    "CITATIONS.md",
    "REFERENCES.md",
    "SOURCES.md",
]


def b64_decode(content: str) -> str:
    try:
        return base64.b64decode(content).decode("utf-8", errors="replace")
    except Exception:
        return ""


def fetch_file(owner: str, repo: str, path: str) -> dict | None:
    data = gh(f"repos/{owner}/{repo}/contents/{path}")
    if not data or data.get("type") != "file":
        return None
    return {
        "path":      data["path"],
        "sha":       data.get("sha"),
        "size":      data.get("size"),
        "content":   b64_decode(data.get("content", "")),
        "html_url":  data.get("html_url"),
    }


def list_workflows(owner: str, repo: str) -> list[str]:
    listing = gh(f"repos/{owner}/{repo}/contents/{WORKFLOW_DIR}")
    if not isinstance(listing, list):
        return []
    return [item["path"] for item in listing
            if item.get("type") == "file"
            and item["name"].endswith((".yml", ".yaml"))]


def parse_workflow(content: str) -> dict:
    """Best-effort parse; never fails."""
    try:
        doc = yaml.safe_load(content) or {}
        jobs = doc.get("jobs", {}) or {}
        uses_external = []
        runs_on = set()
        for jname, j in jobs.items():
            if not isinstance(j, dict):
                continue
            if "uses" in j:
                uses_external.append(j["uses"])
            ro = j.get("runs-on")
            if isinstance(ro, str):
                runs_on.add(ro)
            elif isinstance(ro, list):
                runs_on.update(x for x in ro if isinstance(x, str))
            for step in j.get("steps", []) or []:
                if isinstance(step, dict) and "uses" in step:
                    uses_external.append(step["uses"])
        return {
            "name":          doc.get("name"),
            "on":            doc.get("on") or doc.get(True),  # yaml bare 'on:' can parse as True
            "job_count":     len(jobs),
            "job_names":     list(jobs.keys()),
            "uses_external": sorted(set(uses_external)),
            "runs_on":       sorted(runs_on),
            "has_reusable":  any(isinstance(j, dict) and "uses" in j for j in jobs.values()),
        }
    except Exception as e:
        return {"parse_error": str(e)}


def inventory_repo(owner: str, repo_meta: dict, *,
                   do_redact: bool = False) -> dict:
    repo = repo_meta["name"]
    full = f"{owner}/{repo}"
    print(f"  · {full}", file=sys.stderr, flush=True)

    out: dict[str, Any] = {
        "name":             repo,
        "full_name":        full,
        "visibility":       repo_meta.get("visibility"),
        "default_branch":   repo_meta.get("default_branch"),
        "primary_language": repo_meta.get("language"),
        "size_kb":          repo_meta.get("size"),
        "pushed_at":        repo_meta.get("pushed_at"),
        "created_at":       repo_meta.get("created_at"),
        "updated_at":       repo_meta.get("updated_at"),
        "description":      repo_meta.get("description"),
        "topics":           repo_meta.get("topics", []),
        "archived":         repo_meta.get("archived", False),
        "fork":             repo_meta.get("fork", False),
        "html_url":         repo_meta.get("html_url"),
        "errors":           [],
        "redactions":       0,
    }

    # ── branch protection ──
    branch = out["default_branch"]
    if branch:
        bp = gh(f"repos/{full}/branches/{branch}/protection")
        if bp:
            out["branch_protection"] = {
                "enforce_admins":       bp.get("enforce_admins", {}).get("enabled"),
                "required_status_checks": bp.get("required_status_checks"),
                "required_pull_request_reviews": bp.get("required_pull_request_reviews"),
                "required_signatures":  bp.get("required_signatures", {}).get("enabled"),
                "required_linear_history": bp.get("required_linear_history", {}).get("enabled"),
                "allow_force_pushes":   bp.get("allow_force_pushes", {}).get("enabled"),
            }
        else:
            out["branch_protection"] = None

    # ── security features ──
    out["security_features"] = {
        "secret_scanning":      (repo_meta.get("security_and_analysis", {})
                                 .get("secret_scanning", {}).get("status")),
        "secret_scanning_push": (repo_meta.get("security_and_analysis", {})
                                 .get("secret_scanning_push_protection", {}).get("status")),
        "dependabot_alerts":    (repo_meta.get("security_and_analysis", {})
                                 .get("dependabot_security_updates", {}).get("status")),
    }

    # ── secrets & variables (names only) ──
    sec = gh(f"repos/{full}/actions/secrets") or {}
    var = gh(f"repos/{full}/actions/variables") or {}
    out["actions_secrets"]   = [s["name"] for s in sec.get("secrets", [])]
    out["actions_variables"] = [v["name"] for v in var.get("variables", [])]

    # ── self-hosted runners ──
    runners = gh(f"repos/{full}/actions/runners") or {}
    out["repo_runners"] = [
        {"name": r["name"], "os": r.get("os"), "labels":
         [l["name"] for l in r.get("labels", [])], "status": r.get("status")}
        for r in runners.get("runners", [])
    ]

    # ── workflows ──
    workflows: list[dict] = []
    try:
        for wf_path in list_workflows(owner, repo):
            f = fetch_file(owner, repo, wf_path)
            if not f:
                continue
            content = f["content"]
            red_count = 0
            if do_redact:
                content, red_count = redact(content)
                out["redactions"] += red_count
            parsed = parse_workflow(f["content"])
            workflows.append({
                "path":    f["path"],
                "sha":     f["sha"],
                "size":    f["size"],
                "parsed":  parsed,
                "content": content,
                "redaction_hits": red_count,
            })
    except GhError as e:
        out["errors"].append(f"workflows: {e}")
    out["workflows"] = workflows

    # ── target files ──
    other_files: dict[str, dict] = {}
    for tf in TARGET_FILES:
        f = fetch_file(owner, repo, tf)
        if f:
            content = f["content"]
            if do_redact:
                content, n = redact(content)
                out["redactions"] += n
            # keep small; truncate README-ish content
            if len(content) > 10_000:
                content = content[:10_000] + f"\n\n[truncated — full size {len(f['content'])} bytes]"
            other_files[tf] = {
                "sha": f["sha"],
                "size": f["size"],
                "content": content,
            }
    # README snippet
    readme = gh(f"repos/{full}/readme")
    if readme:
        raw = b64_decode(readme.get("content", ""))
        snippet = raw[:1500]
        if do_redact:
            snippet, _ = redact(snippet)
        other_files["README"] = {
            "sha":     readme.get("sha"),
            "size":    readme.get("size"),
            "content": snippet,
        }
    out["other_files"] = other_files

    return out


# ────────────────────────────────────────────────────────────────── per-owner

def list_repos(owner: str, include_collab: bool = False) -> tuple[str, list[dict]]:
    """Return (owner_type, [repo_meta…]). Handles user vs org."""
    info = gh(f"users/{owner}")
    if not info:
        raise GhError(f"Owner {owner} not found")
    otype = info.get("type", "").lower()   # "user" or "organization"

    if otype == "organization":
        repos = gh(f"orgs/{owner}/repos?per_page=100&type=all", paginate=True)
    else:
        if include_collab:
            # Repos where user has access (owned + collaborator)
            repos = gh(f"user/repos?per_page=100&affiliation=owner,collaborator",
                       paginate=True)
            repos = [r for r in (repos or [])
                     if r.get("owner", {}).get("login") == owner]
        else:
            repos = gh(f"users/{owner}/repos?per_page=100&type=owner",
                       paginate=True)

    return otype, (repos or [])


def org_extras(owner: str) -> dict:
    """Grab org-scope data: runner groups, org secrets/vars, required workflows."""
    out: dict[str, Any] = {}
    rg = gh(f"orgs/{owner}/actions/runner-groups")
    if rg:
        out["runner_groups"] = [
            {"id": g["id"], "name": g["name"],
             "default": g.get("default"),
             "visibility": g.get("visibility"),
             "allows_public_repositories": g.get("allows_public_repositories"),
             "restricted_to_workflows": g.get("restricted_to_workflows"),
             "selected_workflows": g.get("selected_workflows", [])}
            for g in rg.get("runner_groups", [])
        ]
    runners = gh(f"orgs/{owner}/actions/runners")
    if runners:
        out["org_runners"] = [
            {"name": r["name"], "os": r.get("os"),
             "labels": [l["name"] for l in r.get("labels", [])],
             "status": r.get("status"),
             "runner_group_id": r.get("runner_group_id")}
            for r in runners.get("runners", [])
        ]
    sec = gh(f"orgs/{owner}/actions/secrets")
    if sec:
        out["org_secrets"] = [s["name"] for s in sec.get("secrets", [])]
    var = gh(f"orgs/{owner}/actions/variables")
    if var:
        out["org_variables"] = [v["name"] for v in var.get("variables", [])]
    # Required workflows (preview API; may require admin scope)
    req = gh(f"orgs/{owner}/actions/required_workflows")
    if req:
        out["required_workflows"] = req.get("required_workflows", [])
    return out


# ────────────────────────────────────────────────────────────────── main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--owners", default="timothyhartzog,ruralpeds",
                    help="comma-separated list of users/orgs to inventory")
    ap.add_argument("--output", default="gh-inventory.json",
                    help="output path (default: gh-inventory.json)")
    ap.add_argument("--include-collab", action="store_true",
                    help="include repos you collaborate on but don't own")
    ap.add_argument("--redact", action="store_true",
                    help="redact secret-like patterns before writing (recommended for sharing)")
    ap.add_argument("--workers", type=int, default=6,
                    help="parallel repo fetch workers (default 6)")
    ap.add_argument("--skip-archived", action="store_true",
                    help="skip archived repos")
    args = ap.parse_args()

    check_auth()
    owners = [o.strip() for o in args.owners.split(",") if o.strip()]

    result: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generator":    "inventory_workflows.py/1.0",
        "owners_requested": owners,
        "redacted":    args.redact,
        "namespaces":  {},
    }

    totals = {"repos": 0, "workflows": 0, "with_audit": 0,
              "with_branch_protection": 0, "redactions": 0, "errors": 0}

    for owner in owners:
        print(f"\n▶ Inventorying {owner}", file=sys.stderr)
        try:
            otype, repos = list_repos(owner, include_collab=args.include_collab)
        except GhError as e:
            print(f"  ! {e}", file=sys.stderr)
            result["namespaces"][owner] = {"error": str(e)}
            continue

        if args.skip_archived:
            repos = [r for r in repos if not r.get("archived")]

        ns: dict[str, Any] = {"type": otype, "repo_count": len(repos), "repos": []}
        if otype == "organization":
            ns["org_scope"] = org_extras(owner)

        print(f"  {len(repos)} repos", file=sys.stderr)

        with ThreadPoolExecutor(max_workers=args.workers) as ex:
            futures = {ex.submit(inventory_repo, owner, r, do_redact=args.redact): r
                       for r in repos}
            for fut in as_completed(futures):
                try:
                    ns["repos"].append(fut.result())
                except Exception as e:
                    r = futures[fut]
                    ns["repos"].append({"name": r["name"], "error": str(e)})
                    totals["errors"] += 1

        # sort repos alphabetically for stable diffing
        ns["repos"].sort(key=lambda r: r.get("name", ""))

        # tally
        for r in ns["repos"]:
            totals["repos"] += 1
            totals["workflows"]    += len(r.get("workflows", []))
            totals["redactions"]   += r.get("redactions", 0)
            if r.get("other_files", {}).get(".github/AUDIT.yaml") or \
               r.get("other_files", {}).get(".github/AUDIT.yml"):
                totals["with_audit"] += 1
            if r.get("branch_protection"):
                totals["with_branch_protection"] += 1
            if r.get("errors"):
                totals["errors"] += len(r["errors"])

        result["namespaces"][owner] = ns

    result["summary"] = totals

    Path(args.output).write_text(json.dumps(result, indent=2, default=str))
    print(f"\n✓ Wrote {args.output}", file=sys.stderr)
    print(f"  repos:     {totals['repos']}", file=sys.stderr)
    print(f"  workflows: {totals['workflows']}", file=sys.stderr)
    print(f"  with AUDIT.yaml: {totals['with_audit']}", file=sys.stderr)
    print(f"  with branch protection: {totals['with_branch_protection']}", file=sys.stderr)
    print(f"  redactions: {totals['redactions']}", file=sys.stderr)
    print(f"  errors: {totals['errors']}", file=sys.stderr)
    size_mb = Path(args.output).stat().st_size / 1e6
    print(f"  output size: {size_mb:.2f} MB", file=sys.stderr)
    if size_mb > 20:
        print("  ⚠  File is large; consider --redact and/or zipping before upload", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
