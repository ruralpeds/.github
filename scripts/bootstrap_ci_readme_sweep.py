#!/usr/bin/env python3
"""
bootstrap_ci_readme_sweep.py

Sweeps all ruralpeds Rust and Julia repos and ensures each has:
  - .github/workflows/ci-gap-status.yml  (language-appropriate caller)
  - README.md gap-status markers         (<!-- gap-status-start/end -->)

Opens a single PR per repo with both changes when anything is missing.
Skips repos that are already fully set up.

Run via bootstrap-ci-readme-sweep.yml, or locally:
  python3 scripts/bootstrap_ci_readme_sweep.py --token ghp_... --org ruralpeds

Requires: Python 3.9+, requests (pip install requests)
"""

import argparse
import base64
import json
import sys
import textwrap
import time
from datetime import date
from pathlib import Path

import requests

ORG = "ruralpeds"
TODAY = str(date.today())

# Repos to unconditionally skip
SKIP_REPOS = {"gap-analysis-standard", "gap-dashboard"}

# CI workflow names by language
CI_WORKFLOW_NAMES = {
    "Rust":  "CI",
    "Julia": "Julia Tests",
}

README_MARKER_START = "<!-- gap-status-start -->"
README_MARKER_END   = "<!-- gap-status-end -->"

# Minimal README section to inject when markers are absent.
# Inserted after the first H1 heading if found, otherwise appended.
README_SECTION = """\

## Gap Analysis Status

<!-- gap-status-start -->
<!-- gap-status-end -->

"""


def ci_gap_status_content(language: str, repo_full: str) -> str:
    """Return ci-gap-status.yml content for the given language."""
    ci_name = CI_WORKFLOW_NAMES.get(language, "CI")
    return textwrap.dedent(f"""\
        name: CI → Gap Status

        # Auto-installed by bootstrap-ci-readme-sweep.yml
        # CI workflow monitored: "{ci_name}"

        on:
          workflow_run:
            workflows: ["{ci_name}"]
            types: [requested, completed]
            branches: ["gap/**", "gap-*"]
          push:
            branches: ["gap/**", "gap-*"]
          pull_request:
            types: [opened, synchronize, reopened]
            branches: [main, master]

        jobs:
          extract-gap-id:
            name: Extract GAP ID
            runs-on: ubuntu-latest
            timeout-minutes: 3
            outputs:
              gap_id:    ${{{{ steps.extract.outputs.gap_id }}}}
              ci_status: ${{{{ steps.map-status.outputs.ci_status }}}}
              branch:    ${{{{ steps.ctx.outputs.branch }}}}
              pr_number: ${{{{ steps.ctx.outputs.pr_number }}}}
              sha:       ${{{{ steps.ctx.outputs.sha }}}}
              run_id:    ${{{{ steps.ctx.outputs.run_id }}}}
            steps:
              - name: Resolve event context
                id: ctx
                run: |
                  if [ "${{{{ github.event_name }}}}" = "workflow_run" ]; then
                    echo "branch=${{{{ github.event.workflow_run.head_branch }}}}"   >> "$GITHUB_OUTPUT"
                    echo "sha=${{{{ github.event.workflow_run.head_sha }}}}"         >> "$GITHUB_OUTPUT"
                    echo "run_id=${{{{ github.event.workflow_run.id }}}}"            >> "$GITHUB_OUTPUT"
                    echo "pr_number="                                                >> "$GITHUB_OUTPUT"
                  elif [ "${{{{ github.event_name }}}}" = "pull_request" ]; then
                    echo "branch=${{{{ github.head_ref }}}}"                         >> "$GITHUB_OUTPUT"
                    echo "sha=${{{{ github.event.pull_request.head.sha }}}}"         >> "$GITHUB_OUTPUT"
                    echo "run_id=${{{{ github.run_id }}}}"                           >> "$GITHUB_OUTPUT"
                    echo "pr_number=${{{{ github.event.pull_request.number }}}}"     >> "$GITHUB_OUTPUT"
                  else
                    echo "branch=${{{{ github.ref_name }}}}"                         >> "$GITHUB_OUTPUT"
                    echo "sha=${{{{ github.sha }}}}"                                  >> "$GITHUB_OUTPUT"
                    echo "run_id=${{{{ github.run_id }}}}"                           >> "$GITHUB_OUTPUT"
                    echo "pr_number="                                                >> "$GITHUB_OUTPUT"
                  fi
              - name: Extract GAP ID
                id: extract
                env:
                  BRANCH:   ${{{{ steps.ctx.outputs.branch }}}}
                  PR_TITLE: ${{{{ github.event.pull_request.title || '' }}}}
                run: |
                  gap_id=$(python3 -c "
                  import re, os
                  m = re.search(r'GAP-\\\\d{{3,4}}', os.environ.get('BRANCH','')) or \\\\
                      re.search(r'GAP-\\\\d{{3,4}}', os.environ.get('PR_TITLE',''))
                  print(m.group(0) if m else '')
                  ")
                  echo "gap_id=$gap_id" >> "$GITHUB_OUTPUT"
              - name: Map event to CI status signal
                id: map-status
                run: |
                  event="${{{{ github.event_name }}}}"
                  conclusion="${{{{ github.event.workflow_run.conclusion }}}}"
                  wr_status="${{{{ github.event.workflow_run.status }}}}"
                  if [ "$event" = "push" ]; then
                    echo "ci_status=failed" >> "$GITHUB_OUTPUT"
                  elif [ "$event" = "pull_request" ]; then
                    echo "ci_status=started" >> "$GITHUB_OUTPUT"
                  elif [ "$event" = "workflow_run" ]; then
                    if [ "$wr_status" = "in_progress" ] || [ "$wr_status" = "queued" ]; then
                      echo "ci_status=started" >> "$GITHUB_OUTPUT"
                    elif [ "$conclusion" = "success" ]; then
                      echo "ci_status=passed" >> "$GITHUB_OUTPUT"
                    else
                      echo "ci_status=failed" >> "$GITHUB_OUTPUT"
                    fi
                  fi

          update-gap:
            name: Update gap status
            needs: extract-gap-id
            if: needs.extract-gap-id.outputs.gap_id != ''
            uses: ruralpeds/.github/.github/workflows/reusable-build-status.yml@main
            with:
              target_repo: ${{{{ github.repository }}}}
              gap_id:      ${{{{ needs.extract-gap-id.outputs.gap_id }}}}
              ci_status:   ${{{{ needs.extract-gap-id.outputs.ci_status }}}}
              branch:      ${{{{ needs.extract-gap-id.outputs.branch }}}}
              pr_number:   ${{{{ needs.extract-gap-id.outputs.pr_number }}}}
              sha:         ${{{{ needs.extract-gap-id.outputs.sha }}}}
              run_id:      ${{{{ needs.extract-gap-id.outputs.run_id }}}}
              actor:       ${{{{ github.actor }}}}
            secrets: inherit
    """)


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


def get_file(org: str, repo: str, path: str, token: str, ref: str = "") -> dict | None:
    params = {"ref": ref} if ref else {}
    r = api("get", f"/repos/{org}/{repo}/contents/{path}", token, params=params)
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
    payload: dict = {"message": message, "content": b64(content), "branch": branch}
    if sha:
        payload["sha"] = sha
    r = api("put", f"/repos/{org}/{repo}/contents/{path}", token, json=payload)
    if r.status_code in (200, 201):
        return True
    print(f"  ⚠️  PUT {path} → {r.status_code}: {r.text[:200]}")
    return False


def create_branch(org: str, repo: str, new_branch: str, base_sha: str, token: str) -> bool:
    r = api("post", f"/repos/{org}/{repo}/git/refs", token, json={
        "ref": f"refs/heads/{new_branch}",
        "sha": base_sha,
    })
    if r.status_code == 201:
        return True
    if r.status_code == 422 and "already exists" in r.text:
        return True  # branch exists — reuse it
    print(f"  ⚠️  create branch → {r.status_code}: {r.text[:200]}")
    return False


def get_default_branch_sha(org: str, repo: str, branch: str, token: str) -> str | None:
    r = api("get", f"/repos/{org}/{repo}/git/ref/heads/{branch}", token)
    if r.status_code != 200:
        return None
    return r.json()["object"]["sha"]


def create_pr(
    org: str, repo: str, head: str, base: str, title: str, body: str, token: str
) -> str | None:
    # Check if PR already exists for this head branch
    r = api("get", f"/repos/{org}/{repo}/pulls", token,
            params={"head": f"{org}:{head}", "state": "open"})
    if r.status_code == 200 and r.json():
        url = r.json()[0]["html_url"]
        print(f"  ℹ️  PR already exists: {url}")
        return url
    r = api("post", f"/repos/{org}/{repo}/pulls", token, json={
        "title": title,
        "body": body,
        "head": head,
        "base": base,
    })
    if r.status_code == 201:
        return r.json()["html_url"]
    print(f"  ⚠️  create PR → {r.status_code}: {r.text[:300]}")
    return None


def inject_readme_markers(readme_content: str) -> str:
    """Insert gap-status section after the first H1, or append to end."""
    lines = readme_content.splitlines(keepends=True)
    # Find first H1
    for i, line in enumerate(lines):
        if line.startswith("# "):
            # Insert after this line and any immediately following blank line
            insert_at = i + 1
            if insert_at < len(lines) and lines[insert_at].strip() == "":
                insert_at += 1
            return "".join(lines[:insert_at]) + README_SECTION + "".join(lines[insert_at:])
    # No H1 — append
    return readme_content.rstrip() + "\n" + README_SECTION


def bootstrap_repo(org: str, repo: str, language: str, token: str, dry_run: bool) -> dict:
    result: dict = {"repo": repo, "language": language, "status": "skipped", "actions": []}

    # ── Repo metadata ─────────────────────────────────────────────────────────
    r = api("get", f"/repos/{org}/{repo}", token)
    r.raise_for_status()
    meta = r.json()
    default_branch = meta.get("default_branch", "main")

    # ── Check current state ───────────────────────────────────────────────────
    existing_wf    = get_file(org, repo, ".github/workflows/ci-gap-status.yml", token)
    existing_readme = get_file(org, repo, "README.md", token)

    needs_workflow = existing_wf is None
    needs_markers  = (
        existing_readme is not None
        and README_MARKER_START not in existing_readme["content"]
    )

    if not needs_workflow and not needs_markers:
        result["status"] = "already_configured"
        return result

    if dry_run:
        result["status"] = "would_configure"
        if needs_workflow:
            result["actions"].append("install ci-gap-status.yml")
        if needs_markers:
            result["actions"].append("add README gap-status markers")
        return result

    # ── Create PR branch ──────────────────────────────────────────────────────
    base_sha = get_default_branch_sha(org, repo, default_branch, token)
    if not base_sha:
        result["status"] = "error"
        result["errors"] = ["could not resolve default branch SHA"]
        return result

    pr_branch = f"chore/ci-gap-readme-bootstrap-{TODAY}"
    if not create_branch(org, repo, pr_branch, base_sha, token):
        result["status"] = "error"
        result["errors"] = ["could not create PR branch"]
        return result

    errors = []

    # ── Install ci-gap-status.yml ─────────────────────────────────────────────
    if needs_workflow:
        wf_content = ci_gap_status_content(language, f"{org}/{repo}")
        ok = put_file(
            org, repo,
            ".github/workflows/ci-gap-status.yml",
            content=wf_content,
            message="chore(gap): install ci-gap-status.yml caller workflow",
            token=token,
            branch=pr_branch,
        )
        if ok:
            result["actions"].append("installed ci-gap-status.yml")
        else:
            errors.append("ci-gap-status.yml install failed")

    # ── Add README markers ────────────────────────────────────────────────────
    if needs_markers and existing_readme:
        updated_readme = inject_readme_markers(existing_readme["content"])
        ok = put_file(
            org, repo,
            "README.md",
            content=updated_readme,
            message="docs(gap): add gap-status section to README",
            token=token,
            sha=existing_readme["sha"],  # only valid on default branch; re-fetch if 409
            branch=pr_branch,
        )
        if ok:
            result["actions"].append("added README gap-status markers")
        else:
            # README sha conflict on the new branch — re-fetch from branch
            readme_on_branch = get_file(org, repo, "README.md", token, ref=pr_branch)
            if readme_on_branch and README_MARKER_START not in readme_on_branch["content"]:
                updated_readme = inject_readme_markers(readme_on_branch["content"])
                ok2 = put_file(
                    org, repo, "README.md",
                    content=updated_readme,
                    message="docs(gap): add gap-status section to README",
                    token=token,
                    sha=readme_on_branch["sha"],
                    branch=pr_branch,
                )
                if ok2:
                    result["actions"].append("added README gap-status markers (retry)")
                else:
                    errors.append("README markers add failed")

    # ── Open PR ───────────────────────────────────────────────────────────────
    if not errors:
        actions_list = "\n".join(f"- {a}" for a in result["actions"])
        pr_body = (
            "## Summary\n\n"
            "Auto-installed by `bootstrap-ci-readme-sweep.yml` in `ruralpeds/.github`.\n\n"
            f"**Changes:**\n{actions_list}\n\n"
            "## What this does\n\n"
            "- `ci-gap-status.yml` — listens for CI run events on `gap/*` branches and "
            "calls `reusable-build-status.yml` to advance the gap status "
            "(In the Air → Building → Committed).\n"
            "- `<!-- gap-status-start/end -->` markers in README — populated automatically "
            "every 30 min by the org-level `build-status-sweep.yml` with a live gap table.\n\n"
            "## Review checklist\n\n"
            "- [ ] CI workflow name in `ci-gap-status.yml` matches your repo's CI workflow "
            f"(`{CI_WORKFLOW_NAMES.get(language, 'CI')}` assumed for {language})\n"
            "- [ ] README gap-status section is in an appropriate location\n"
        )
        pr_url = create_pr(
            org, repo,
            head=pr_branch,
            base=default_branch,
            title="chore(gap): install CI gap status tracking + README markers",
            body=pr_body,
            token=token,
        )
        if pr_url:
            result["pr_url"] = pr_url
            result["actions"].append(f"opened PR: {pr_url}")
        else:
            errors.append("PR creation failed")

    result["status"] = "error" if errors else "configured"
    if errors:
        result["errors"] = errors
    return result


def list_repos_by_language(org: str, language: str, token: str) -> list[dict]:
    """Use GitHub search to find repos by primary language."""
    repos = []
    page = 1
    while True:
        r = api(
            "get", "/search/repositories", token,
            params={
                "q": f"org:{org} language:{language} archived:false",
                "per_page": 100,
                "page": page,
            },
        )
        r.raise_for_status()
        data = r.json()
        batch = data.get("items", [])
        repos.extend(batch)
        if len(repos) >= data.get("total_count", 0) or not batch:
            break
        page += 1
        time.sleep(1)  # search API secondary rate limit
    return repos


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Bootstrap CI gap status tracking in all Rust and Julia repos"
    )
    parser.add_argument("--token",   required=True, help="GitHub token with repo scope")
    parser.add_argument("--org",     default=ORG)
    parser.add_argument("--repo",    help="Target a single repo (owner/repo or just name)")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip",    nargs="*", default=[])
    args = parser.parse_args()

    skip = SKIP_REPOS | set(args.skip)

    print(f"\n{'DRY RUN — ' if args.dry_run else ''}CI Gap README Bootstrap Sweep")
    print(f"Org: {args.org}  |  Date: {TODAY}")
    print("─" * 60)

    if args.repo:
        repo_name = args.repo.split("/")[-1]
        # Detect language
        r = api("get", f"/repos/{args.org}/{repo_name}", args.token)
        r.raise_for_status()
        lang = r.json().get("language") or "Unknown"
        repos_to_process = [{"name": repo_name, "language": lang}]
    else:
        print("Fetching Rust repos …", flush=True)
        rust_repos  = list_repos_by_language(args.org, "Rust",  args.token)
        print(f"  {len(rust_repos)} Rust repos found")
        print("Fetching Julia repos …", flush=True)
        julia_repos = list_repos_by_language(args.org, "Julia", args.token)
        print(f"  {len(julia_repos)} Julia repos found\n")

        seen: set[str] = set()
        repos_to_process = []
        for repo in rust_repos:
            n = repo["name"]
            if n not in seen:
                seen.add(n)
                repos_to_process.append({"name": n, "language": "Rust"})
        for repo in julia_repos:
            n = repo["name"]
            if n not in seen:
                seen.add(n)
                repos_to_process.append({"name": n, "language": "Julia"})

    results = []
    for repo_data in repos_to_process:
        name = repo_data["name"]
        lang = repo_data["language"]

        if name in skip:
            print(f"  ⏭  {name} ({lang}) — skipped")
            continue

        print(f"  → {name} ({lang})", end="", flush=True)
        result = bootstrap_repo(args.org, name, lang, args.token, args.dry_run)
        results.append(result)

        icon = {
            "configured":         "✅",
            "already_configured": "✓",
            "would_configure":    "📋",
            "error":              "❌",
            "skipped":            "⏭",
        }.get(result["status"], "?")

        print(f" {icon} {result['status']}")
        for action in result.get("actions", []):
            print(f"       {action}")
        for err in result.get("errors", []):
            print(f"       ⚠️  {err}")

        time.sleep(0.5)

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "─" * 60)
    configured = [r for r in results if r["status"] == "configured"]
    already    = [r for r in results if r["status"] == "already_configured"]
    would      = [r for r in results if r["status"] == "would_configure"]
    errors     = [r for r in results if r["status"] == "error"]

    if args.dry_run:
        print(f"DRY RUN: {len(would)} would be configured, {len(already)} already done")
    else:
        print(f"Sweep complete:")
        print(f"  ✅  Configured (PR opened): {len(configured)}")
        print(f"  ✓   Already done:           {len(already)}")
        print(f"  ❌  Errors:                 {len(errors)}")
        if errors:
            print("\nFailed:")
            for r in errors:
                print(f"  {r['repo']}: {r.get('errors', [])}")

    report_path = Path("/tmp/ci_readme_sweep_report.json")
    report_path.write_text(json.dumps(results, indent=2))
    print(f"\nReport: {report_path}")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
