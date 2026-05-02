#!/usr/bin/env python3
"""
bootstrap_gaps_sweep.py
Rural Peds Gap Analysis Standard v1.0

Sweeps every non-archived ruralpeds repo and ensures each has:
  - GAPS.md at repo root
  - .github/workflows/gaps.yml calling the org reusable workflow

Strategy per repo:
  1. Check if gaps.yml already exists — skip if so (already bootstrapped).
  2. If GAPS.md missing: create a minimal one via the GitHub Contents API.
  3. Create .github/workflows/gaps.yml via the GitHub Contents API.
  4. If CLAUDE.md exists: append the gap-analysis block if not present.
  All three changes go in a single commit to the default branch.

Run from the Mac Studio runner via bootstrap-gaps-sweep.yml, or locally:
  python3 scripts/bootstrap_gaps_sweep.py --token ghp_... --org ruralpeds

Requires: Python 3.9+, requests library (pip install requests)
"""

import argparse
import base64
import json
import sys
import time
from datetime import date
from pathlib import Path

import requests

ORG = "ruralpeds"
# reusable-gap-lifecycle.yml was removed; all callers now use reusable-gap-analysis.yml
WORKFLOW_CALLER = "ruralpeds/.github/.github/workflows/reusable-gap-analysis.yml@main"
SPEC_URL = "https://github.com/ruralpeds/gap-analysis-standard/blob/main/SPEC.md"
RAW_STD = "https://raw.githubusercontent.com/ruralpeds/gap-analysis-standard/main/templates"

# Repos to unconditionally skip (infrastructure, meta, or non-content)
SKIP_REPOS = {
    ".github",
    "gap-analysis-standard",
    "gap-dashboard",
}

TODAY = str(date.today())


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
        print(f"  ⏳ Rate limited — sleeping {wait}s", flush=True)
        time.sleep(wait)
        r = getattr(requests, method)(url, headers=headers, timeout=30, **kwargs)
    return r


def b64(text: str) -> str:
    return base64.b64encode(text.encode()).decode()


def get_file(org: str, repo: str, path: str, token: str) -> dict | None:
    """Return {sha, content_decoded} or None if file doesn't exist."""
    r = api("get", f"/repos/{org}/{repo}/contents/{path}", token)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    data = r.json()
    content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
    return {"sha": data["sha"], "content": content}


def put_file(
    org: str,
    repo: str,
    path: str,
    content: str,
    message: str,
    token: str,
    sha: str | None = None,
    branch: str = "main",
) -> bool:
    payload: dict = {
        "message": message,
        "content": b64(content),
        "branch": branch,
    }
    if sha:
        payload["sha"] = sha
    r = api("put", f"/repos/{org}/{repo}/contents/{path}", token, json=payload)
    if r.status_code in (200, 201):
        return True
    print(f"  ⚠️  PUT {path} → {r.status_code}: {r.text[:200]}")
    return False


def gaps_md_template(repo_name: str) -> str:
    return f"""\
# Gaps — {repo_name}

> **Standard:** Rural Peds Gap Analysis Standard v1.0
> **Spec:** {SPEC_URL}
> **Last updated:** {TODAY}

---

## Active

| ID | Title | Priority | Category | Created | Notes |
|----|-------|----------|----------|---------|-------|
| GAP-001 | Seed this file with real gaps for {repo_name} | P1 | general | {TODAY} | Replace this placeholder row |

---

## Completed

| ID | Title | Priority | Category | Completed | PR |
|----|-------|----------|----------|-----------|-----|

---

## Abandoned

| ID | Title | Reason |
|----|-------|--------|
"""


def gaps_yml_content() -> str:
    return f"""\
name: Gap Analysis Lifecycle

# Per-repo caller — all logic lives in the reusable workflow at ruralpeds/.github.

on:
  create:
  pull_request:
    types: [opened, edited, reopened, closed]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  branch_opened:
    if: github.event_name == 'create' && github.event.ref_type == 'branch' && startsWith(github.event.ref, 'gap/')
    uses: {WORKFLOW_CALLER}
    with:
      event: branch_opened
      branch_ref: ${{{{ github.event.ref }}}}
      actor: ${{{{ github.actor }}}}
    secrets: inherit

  pr_opened:
    if: github.event_name == 'pull_request' && (github.event.action == 'opened' || github.event.action == 'reopened')
    uses: {WORKFLOW_CALLER}
    with:
      event: pr_opened
      pr_number: ${{{{ github.event.pull_request.number }}}}
      actor: ${{{{ github.actor }}}}
    secrets: inherit

  pr_edited:
    if: github.event_name == 'pull_request' && github.event.action == 'edited'
    uses: {WORKFLOW_CALLER}
    with:
      event: pr_edited
      pr_number: ${{{{ github.event.pull_request.number }}}}
      actor: ${{{{ github.actor }}}}
    secrets: inherit

  pr_merged:
    if: github.event_name == 'pull_request' && github.event.action == 'closed' && github.event.pull_request.merged == true
    uses: {WORKFLOW_CALLER}
    with:
      event: pr_merged
      pr_number: ${{{{ github.event.pull_request.number }}}}
      merge_sha: ${{{{ github.event.pull_request.merge_commit_sha }}}}
      actor: ${{{{ github.actor }}}}
    secrets: inherit

  pr_closed_unmerged:
    if: github.event_name == 'pull_request' && github.event.action == 'closed' && github.event.pull_request.merged == false
    uses: {WORKFLOW_CALLER}
    with:
      event: pr_closed_unmerged
      pr_number: ${{{{ github.event.pull_request.number }}}}
      actor: ${{{{ github.actor }}}}
    secrets: inherit
"""


CLAUDE_MD_BLOCK = f"""\

---

## Gap Analysis

This repo follows the Rural Peds Gap Analysis Standard v1.0.
Spec: {SPEC_URL}

- **Canonical list:** `.gap-analysis/GAP_ANALYSIS.md` at repo root — read this first at
  the start of every session.
- **When starting work:** check the Active table for P0/P1 gaps before picking up new work.
- **When completing work:** include `Closes GAP-NNN` in the PR body. The gap-lifecycle
  workflow automatically moves the row from Active → Completed on merge.
- **When adding a gap:** open a branch named `gap/NNN-short-title` and push. The workflow
  will create the row automatically; alternatively add it manually with the next sequential
  `GAP-NNN` ID, Priority (P0/P1/P2/P3), and Category
  (safety/quality/content/infrastructure/docs/research/teaching/creative/general).
- **Never edit** the Completed or Abandoned tables manually — the workflow owns those.
- **Cross-repo refs:** use `ruralpeds/<repo>#GAP-NNN` syntax in the Notes column.
- **Priority guidance:** P0 = blocking, P1 = this sprint, P2 = next sprint, P3 = backlog.
"""


def bootstrap_repo(org: str, repo: str, token: str, dry_run: bool) -> dict:
    result = {"repo": repo, "status": "skipped", "actions": []}

    # ── Check if already bootstrapped ────────────────────────────────────────
    # Accept either the modern name (gap-analysis-lifecycle.yml) or the legacy
    # name (gaps.yml) as evidence the repo has already been bootstrapped.
    existing_workflow = (
        get_file(org, repo, ".github/workflows/gap-analysis-lifecycle.yml", token)
        or get_file(org, repo, ".github/workflows/gaps.yml", token)
    )
    if existing_workflow:
        result["status"] = "already_bootstrapped"
        return result

    if dry_run:
        result["status"] = "would_bootstrap"
        result["actions"] = ["create GAPS.md", "create .github/workflows/gap-analysis-lifecycle.yml", "append CLAUDE.md block"]
        return result

    # ── Determine default branch ──────────────────────────────────────────────
    r = api("get", f"/repos/{org}/{repo}", token)
    r.raise_for_status()
    default_branch = r.json().get("default_branch", "main")

    errors = []

    # ── GAPS.md ───────────────────────────────────────────────────────────────
    existing_gaps = get_file(org, repo, "GAPS.md", token)
    if existing_gaps is None:
        ok = put_file(
            org, repo, "GAPS.md",
            content=gaps_md_template(repo),
            message=f"chore: bootstrap GAPS.md (gap analysis standard v1.0)",
            token=token,
            branch=default_branch,
        )
        if ok:
            result["actions"].append("created GAPS.md")
        else:
            errors.append("GAPS.md create failed")
    else:
        result["actions"].append("GAPS.md already exists")

    # ── gap-analysis-lifecycle.yml ────────────────────────────────────────────
    # Re-fetch in case it appeared in a race; also accept legacy gaps.yml.
    existing_workflow = (
        get_file(org, repo, ".github/workflows/gap-analysis-lifecycle.yml", token)
        or get_file(org, repo, ".github/workflows/gaps.yml", token)
    )
    if existing_workflow is None:
        ok = put_file(
            org, repo, ".github/workflows/gap-analysis-lifecycle.yml",
            content=gaps_yml_content(),
            message="chore: add gap analysis lifecycle workflow (gap analysis standard v1.0)",
            token=token,
            branch=default_branch,
        )
        if ok:
            result["actions"].append("created .github/workflows/gap-analysis-lifecycle.yml")
        else:
            errors.append("gap-analysis-lifecycle.yml create failed")
    else:
        result["actions"].append("gap-analysis-lifecycle.yml already exists")

    # ── CLAUDE.md snippet ─────────────────────────────────────────────────────
    claude_md = get_file(org, repo, "CLAUDE.md", token)
    if claude_md and "## Gap Analysis" not in claude_md["content"]:
        updated = claude_md["content"].rstrip() + CLAUDE_MD_BLOCK
        ok = put_file(
            org, repo, "CLAUDE.md",
            content=updated,
            message="chore: append gap analysis block to CLAUDE.md",
            token=token,
            sha=claude_md["sha"],
            branch=default_branch,
        )
        if ok:
            result["actions"].append("updated CLAUDE.md")
        else:
            errors.append("CLAUDE.md update failed")
    elif claude_md and "## Gap Analysis" in claude_md["content"]:
        result["actions"].append("CLAUDE.md already has gap block")

    result["status"] = "error" if errors else "bootstrapped"
    if errors:
        result["errors"] = errors
    return result


def list_repos(org: str, token: str) -> list[dict]:
    repos = []
    page = 1
    while True:
        r = api("get", f"/orgs/{org}/repos", token,
                params={"per_page": 100, "page": page, "type": "all"})
        r.raise_for_status()
        batch = r.json()
        if not batch:
            break
        repos.extend(batch)
        page += 1
        if len(batch) < 100:
            break
    return repos


def main() -> int:
    parser = argparse.ArgumentParser(description="Bootstrap gap analysis standard across all ruralpeds repos")
    parser.add_argument("--token", required=True, help="GitHub PAT with repo scope")
    parser.add_argument("--org", default=ORG, help=f"GitHub org (default: {ORG})")
    parser.add_argument("--dry-run", action="store_true", help="Print what would happen without making changes")
    parser.add_argument("--repo", help="Bootstrap a single named repo only (for testing)")
    parser.add_argument("--skip", nargs="*", default=[], help="Additional repo names to skip")
    args = parser.parse_args()

    skip = SKIP_REPOS | set(args.skip)

    print(f"\n{'DRY RUN — ' if args.dry_run else ''}Gap Analysis Bootstrap Sweep")
    print(f"Org: {args.org}  |  Date: {TODAY}")
    print("─" * 60)

    if args.repo:
        repos_to_process = [{"name": args.repo, "archived": False}]
    else:
        print("Fetching repo list...", flush=True)
        all_repos = list_repos(args.org, args.token)
        repos_to_process = [r for r in all_repos if not r.get("archived", False)]
        print(f"Found {len(all_repos)} repos, {len(repos_to_process)} active\n")

    results = []
    for repo_data in repos_to_process:
        name = repo_data["name"]
        if name in skip:
            print(f"  ⏭  {name} — skipped (in skip list)")
            continue

        print(f"  → {name}", end="", flush=True)
        result = bootstrap_repo(args.org, name, args.token, args.dry_run)
        results.append(result)

        status_icon = {
            "bootstrapped": "✅",
            "already_bootstrapped": "✓",
            "would_bootstrap": "📋",
            "skipped": "⏭",
            "error": "❌",
        }.get(result["status"], "?")

        actions_str = ", ".join(result.get("actions", []))
        print(f" {status_icon} {result['status']}")
        if actions_str:
            print(f"       {actions_str}")
        if "errors" in result:
            for e in result["errors"]:
                print(f"       ⚠️  {e}")

        time.sleep(0.3)  # avoid secondary rate limits

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "─" * 60)
    bootstrapped = [r for r in results if r["status"] == "bootstrapped"]
    already = [r for r in results if r["status"] == "already_bootstrapped"]
    would = [r for r in results if r["status"] == "would_bootstrap"]
    errors = [r for r in results if r["status"] == "error"]

    if args.dry_run:
        print(f"DRY RUN complete: {len(would)} would be bootstrapped, {len(already)} already done")
    else:
        print(f"Sweep complete:")
        print(f"  ✅ Bootstrapped:       {len(bootstrapped)}")
        print(f"  ✓  Already done:       {len(already)}")
        print(f"  ❌ Errors:             {len(errors)}")
        if errors:
            print("\nFailed repos:")
            for r in errors:
                print(f"  {r['repo']}: {r.get('errors', [])}")

    # Write JSON report
    report_path = Path("/tmp/gap_sweep_report.json")
    report_path.write_text(json.dumps(results, indent=2))
    print(f"\nFull report: {report_path}")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
