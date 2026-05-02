#!/usr/bin/env python3
"""
bootstrap_gap_analysis_new.py

Bootstraps the new .gap-analysis/ system across all Rust and Julia repos.

For each repo without .gap-analysis/:
  1. Creates .gap-analysis/ directory
  2. Copies template files (GAP_ANALYSIS.md, schema.md, .gitignore, build-ledger.jsonl)
  3. Commits and pushes a single commit per repo

Run locally:
  python3 scripts/bootstrap_gap_analysis_new.py --token ghp_... --org ruralpeds --dry-run
  python3 scripts/bootstrap_gap_analysis_new.py --token ghp_... --org ruralpeds  # actual bootstrap

Or via workflow with:
  python3 scripts/bootstrap_gap_analysis_new.py --token $GH_TOKEN --org ruralpeds
"""

import argparse
import base64
import json
import sys
import time
from datetime import datetime
from pathlib import Path

import requests


ORG = "ruralpeds"
TODAY = datetime.now().strftime("%Y-%m-%d")

# Repos to skip
SKIP_REPOS = {
    ".github",
    "gap-analysis-standard",
    "gap-dashboard",
}

# Template files to copy
TEMPLATE_FILES = {
    "GAP_ANALYSIS.md": "GAP_ANALYSIS.template.md",
    "schema.md": "schema.md",
    ".gitignore": ".gitignore.template",
    "build-ledger.jsonl": "build-ledger.template.jsonl",
}


def api(method: str, path: str, token: str, **kwargs) -> requests.Response:
    """Make GitHub API call."""
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
    """Encode to base64."""
    return base64.b64encode(text.encode()).decode()


def list_org_repos(org: str, token: str, language: str = None) -> list[dict]:
    """List all non-archived repos in org, optionally filtered by language."""
    repos = []
    page = 1
    while True:
        params = {
            "page": page,
            "per_page": 100,
            "type": "sources",
            "sort": "updated",
        }
        r = api("get", f"/orgs/{org}/repos", token, params=params)
        r.raise_for_status()
        data = r.json()
        if not data:
            break

        for repo in data:
            if repo["archived"]:
                continue
            if language and repo.get("language") != language:
                continue
            repos.append(repo)
        page += 1
    return repos


def get_file(org: str, repo: str, path: str, token: str) -> dict | None:
    """Return {sha, content} or None if file doesn't exist."""
    r = api("get", f"/repos/{org}/{repo}/contents/{path}", token)
    if r.status_code == 404:
        return None
    if r.status_code != 200:
        return None
    data = r.json()
    if isinstance(data, list):
        return None
    try:
        content = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
        return {"sha": data["sha"], "content": content}
    except Exception:
        return None


def create_or_update_file(
    org: str,
    repo: str,
    path: str,
    content: str,
    message: str,
    token: str,
    sha: str | None = None,
    branch: str = "main",
) -> bool:
    """Create or update a file. Returns True on success."""
    payload = {
        "message": message,
        "content": b64(content),
        "branch": branch,
    }
    if sha:
        payload["sha"] = sha

    r = api("put", f"/repos/{org}/{repo}/contents/{path}", token, json=payload)
    return r.status_code in (200, 201)


def get_template_content(template_name: str) -> str:
    """Read template file from disk."""
    path = Path(__file__).parent.parent / "templates" / "gap-analysis" / template_name
    if not path.exists():
        raise FileNotFoundError(f"Template not found: {path}")
    return path.read_text()


def customize_gap_analysis_md(repo_name: str, template_content: str) -> str:
    """Customize GAP_ANALYSIS.md template for the repo."""
    # Replace the generic placeholder with repo-specific header
    lines = template_content.split("\n")
    new_lines = []
    replaced_header = False

    for line in lines:
        if not replaced_header and line.startswith("# Gap Analysis"):
            new_lines.append(f"# Gap Analysis for `{repo_name}`")
            new_lines.append("")
            new_lines.append(f"**Repository:** `{repo_name}`")
            new_lines.append(f"**Last Updated:** {TODAY}")
            new_lines.append(f"**Maintainer:** [Unassigned]")
            replaced_header = True
            continue
        new_lines.append(line)

    return "\n".join(new_lines)


def bootstrap_repo(org: str, repo_name: str, token: str, dry_run: bool) -> dict:
    """Bootstrap .gap-analysis/ in a repo. Returns status."""
    result = {"repo": repo_name, "status": "skipped", "files": []}

    # Check if already has .gap-analysis/
    existing_gap = get_file(org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", token)
    if existing_gap:
        result["status"] = "already_bootstrapped"
        return result

    # Get default branch
    r = api("get", f"/repos/{org}/{repo_name}", token)
    if r.status_code != 200:
        result["status"] = "error"
        result["error"] = "Failed to get repo info"
        return result

    default_branch = r.json().get("default_branch", "main")

    if dry_run:
        result["status"] = "would_bootstrap"
        result["files"] = list(TEMPLATE_FILES.keys())
        return result

    # Create each file in .gap-analysis/
    try:
        for target_name, template_name in TEMPLATE_FILES.items():
            template_content = get_template_content(template_name)

            # Customize GAP_ANALYSIS.md
            if target_name == "GAP_ANALYSIS.md":
                template_content = customize_gap_analysis_md(repo_name, template_content)

            path = f".gap-analysis/{target_name}"
            success = create_or_update_file(
                org,
                repo_name,
                path,
                template_content,
                f"docs: add gap analysis tracking (org standard)\n\nBootstrapped from ruralpeds/.github/templates/gap-analysis/",
                token,
                branch=default_branch,
            )

            if success:
                result["files"].append(target_name)
            else:
                result["status"] = "error"
                result["error"] = f"Failed to create {target_name}"
                return result

        result["status"] = "bootstrapped"
        return result

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        return result


def main():
    parser = argparse.ArgumentParser(description="Bootstrap new .gap-analysis/ system")
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default=ORG, help="GitHub org")
    parser.add_argument("--dry-run", action="store_true", help="Dry run (show what would happen)")
    parser.add_argument("--repo", help="Bootstrap single repo (default: all)")
    args = parser.parse_args()

    print(f"\n📦 Bootstrapping .gap-analysis/ system\n")

    # Get repos to bootstrap
    if args.repo:
        repos_to_bootstrap = [args.repo]
        print(f"Bootstrapping single repo: {args.repo}\n")
    else:
        print("Discovering Rust and Julia repos...")
        rust_repos = list_org_repos(args.org, args.token, language="Rust")
        julia_repos = list_org_repos(args.org, args.token, language="Julia")

        all_repos = {r["name"]: r for r in rust_repos + julia_repos}
        repos_to_bootstrap = [r for r in all_repos.keys() if r not in SKIP_REPOS]

        print(f"  Found {len(rust_repos)} Rust repos")
        print(f"  Found {len(julia_repos)} Julia repos")
        print(f"  Total (after filtering): {len(repos_to_bootstrap)}\n")

    # Bootstrap each repo
    results = {
        "bootstrapped": [],
        "already_bootstrapped": [],
        "would_bootstrap": [],
        "errors": []
    }

    for i, repo_name in enumerate(repos_to_bootstrap, 1):
        print(f"[{i}/{len(repos_to_bootstrap)}] {repo_name}...", end=" ", flush=True)

        try:
            result = bootstrap_repo(args.org, repo_name, args.token, args.dry_run)

            if result["status"] == "bootstrapped":
                print(f"✓ BOOTSTRAPPED ({len(result['files'])} files)")
                results["bootstrapped"].append(result)
            elif result["status"] == "already_bootstrapped":
                print("already bootstrapped")
                results["already_bootstrapped"].append(repo_name)
            elif result["status"] == "would_bootstrap":
                print(f"→ WOULD bootstrap ({len(result['files'])} files)")
                results["would_bootstrap"].append(result)
            elif result["status"] == "skipped":
                print("skipped")
            else:
                print(f"❌ ERROR: {result.get('error', 'unknown')}")
                results["errors"].append(result)
        except Exception as e:
            print(f"❌ ERROR: {e}")
            results["errors"].append({"repo": repo_name, "error": str(e)})

    # Print summary
    print(f"\n{'='*70}")
    print("BOOTSTRAP SUMMARY")
    print(f"{'='*70}\n")

    print(f"✓ Bootstrapped:         {len(results['bootstrapped'])} repos")
    print(f"✓ Already done:         {len(results['already_bootstrapped'])} repos")
    print(f"→ Would bootstrap:      {len(results['would_bootstrap'])} repos (dry-run mode)")
    print(f"❌ Errors:              {len(results['errors'])} repos")

    if results["bootstrapped"]:
        print(f"\n✓ Successfully bootstrapped:")
        for item in results["bootstrapped"]:
            print(f"  - {item['repo']}")

    if results["errors"]:
        print(f"\n❌ Errors:")
        for item in results["errors"]:
            print(f"  - {item['repo']}: {item.get('error', 'unknown')}")

    # Save report
    report = {
        "timestamp": TODAY,
        "org": args.org,
        "dry_run": args.dry_run,
        "summary": {
            "bootstrapped": len(results["bootstrapped"]),
            "already_bootstrapped": len(results["already_bootstrapped"]),
            "would_bootstrap": len(results["would_bootstrap"]),
            "errors": len(results["errors"]),
        },
        "bootstrapped_repos": [item["repo"] for item in results["bootstrapped"]],
    }

    report_path = Path("/tmp/gap_bootstrap_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n📄 Report saved to: {report_path}")

    if args.dry_run:
        print("\n🔧 DRY RUN MODE: No changes made")
        print("\nTo proceed with bootstrap, run without --dry-run flag")

    return 0 if not results["errors"] else 1


if __name__ == "__main__":
    sys.exit(main())
