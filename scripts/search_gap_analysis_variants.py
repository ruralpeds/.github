#!/usr/bin/env python3
"""
search_gap_analysis_variants.py

Searches all Rust and Julia repos for gap analysis files with various naming conventions.

Looks for:
- GAPS.md, GAP_ANALYSIS.md, gap-analysis.md, gaps.md, gap_analysis.md
- .gap-analysis/ directory
- gaps/ directory
- Any file containing "gap" or "Gap" in root or .gap-analysis/
- Risk analysis files (hazard-analysis, risk-analysis, etc.)

Run locally:
  python3 scripts/search_gap_analysis_variants.py --token ghp_... --org ruralpeds
"""

import argparse
import json
import sys
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

# Pattern variants to search for
SEARCH_PATTERNS = {
    "root_level": [
        "GAPS.md",
        "GAP_ANALYSIS.md",
        "gap-analysis.md",
        "gaps.md",
        "gap_analysis.md",
        "Gap_Analysis.md",
        "Gap-Analysis.md",
        "GAPS.txt",
        "gaps.txt",
        "GAPS_TRACKING.md",
    ],
    "directories": [
        ".gap-analysis",
        "gaps",
        "gap-analysis",
        "gap_analysis",
    ],
    "risk_files": [
        "hazard-analysis.md",
        "hazard_analysis.md",
        "risk-analysis.md",
        "risk_analysis.md",
        "HAZARD.md",
        "RISK.md",
    ],
}


def api(method: str, path: str, token: str, **kwargs) -> requests.Response:
    """Make GitHub API call."""
    url = f"https://api.github.com{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    return getattr(requests, method)(url, headers=headers, timeout=30, **kwargs)


def list_org_repos(org: str, token: str, language: str = None) -> list[dict]:
    """List all non-archived repos in org."""
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


def search_repo_files(org: str, repo: str, token: str) -> dict:
    """Search a repo for gap analysis files with various names."""
    findings = {
        "repo": repo,
        "found": [],
        "root_level": [],
        "directories": [],
        "risk_files": [],
        "other_gap_files": [],
    }

    # Search root level files
    for filename in SEARCH_PATTERNS["root_level"]:
        r = api("get", f"/repos/{org}/{repo}/contents/{filename}", token)
        if r.status_code == 200:
            data = r.json()
            findings["root_level"].append({
                "name": filename,
                "type": "file",
                "size": data.get("size", 0),
                "sha": data.get("sha", ""),
            })
            findings["found"].append(f"✓ {filename}")

    # Check for directories
    for dirname in SEARCH_PATTERNS["directories"]:
        r = api("get", f"/repos/{org}/{repo}/contents/{dirname}", token)
        if r.status_code == 200:
            data = r.json()
            if isinstance(data, list):
                files = [f["name"] for f in data]
                findings["directories"].append({
                    "name": dirname,
                    "type": "directory",
                    "files": files,
                })
                findings["found"].append(f"✓ {dirname}/ ({len(files)} files)")

    # Check for risk/hazard files
    for filename in SEARCH_PATTERNS["risk_files"]:
        r = api("get", f"/repos/{org}/{repo}/contents/{filename}", token)
        if r.status_code == 200:
            data = r.json()
            findings["risk_files"].append({
                "name": filename,
                "type": "file",
                "size": data.get("size", 0),
            })
            findings["found"].append(f"✓ {filename}")

    # Search for any files with "gap" in .gap-analysis/ or gaps/ directories
    for dirname in [".gap-analysis", "gaps"]:
        r = api("get", f"/repos/{org}/{repo}/contents/{dirname}", token)
        if r.status_code == 200:
            try:
                data = r.json()
                if isinstance(data, list):
                    for item in data:
                        if item["type"] == "file":
                            findings["other_gap_files"].append({
                                "directory": dirname,
                                "name": item["name"],
                                "path": item["path"],
                            })
            except Exception:
                pass

    return findings


def main():
    parser = argparse.ArgumentParser(
        description="Search for gap analysis files with various naming conventions"
    )
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default=ORG, help="GitHub org")
    parser.add_argument("--repo", help="Search single repo (default: all)")
    args = parser.parse_args()

    print(f"\n🔍 Searching for gap analysis files with various naming conventions\n")

    # Get repos to search
    if args.repo:
        repos_to_search = [args.repo]
        print(f"Searching single repo: {args.repo}\n")
    else:
        print("Discovering Rust and Julia repos...")
        rust_repos = list_org_repos(args.org, args.token, language="Rust")
        julia_repos = list_org_repos(args.org, args.token, language="Julia")

        all_repos = {r["name"]: r for r in rust_repos + julia_repos}
        repos_to_search = [r for r in all_repos.keys() if r not in SKIP_REPOS]

        print(f"  Found {len(rust_repos)} Rust repos")
        print(f"  Found {len(julia_repos)} Julia repos")
        print(f"  Total: {len(repos_to_search)}\n")

    # Search each repo
    results = {
        "has_gap_analysis": [],
        "has_root_files": [],
        "has_directories": [],
        "has_risk_files": [],
        "has_other_gap_files": [],
        "no_gap_files": [],
    }

    for i, repo_name in enumerate(repos_to_search, 1):
        print(f"[{i}/{len(repos_to_search)}] {repo_name}...", end=" ", flush=True)

        try:
            findings = search_repo_files(args.org, repo_name, args.token)

            if findings["found"]:
                print(f"✓ FOUND ({len(findings['found'])} items)")
                results["has_gap_analysis"].append(findings)

                if findings["root_level"]:
                    results["has_root_files"].append(repo_name)
                if findings["directories"]:
                    results["has_directories"].append(repo_name)
                if findings["risk_files"]:
                    results["has_risk_files"].append(repo_name)
                if findings["other_gap_files"]:
                    results["has_other_gap_files"].append(repo_name)
            else:
                print("none found")
                results["no_gap_files"].append(repo_name)

        except Exception as e:
            print(f"ERROR: {e}")

    # Print summary
    print(f"\n{'='*70}")
    print("GAP ANALYSIS FILE SEARCH SUMMARY")
    print(f"{'='*70}\n")

    print(f"📂 Repos with gap analysis files:  {len(results['has_gap_analysis'])}")
    print(f"📄 Repos with root-level files:   {len(results['has_root_files'])}")
    print(f"📁 Repos with directories:        {len(results['has_directories'])}")
    print(f"⚠️  Repos with risk/hazard files: {len(results['has_risk_files'])}")
    print(f"🔍 Repos with other gap files:    {len(results['has_other_gap_files'])}")
    print(f"❌ Repos with NO gap files:       {len(results['no_gap_files'])}")

    # Show details
    if results["has_gap_analysis"]:
        print(f"\n{'='*70}")
        print("DETAILED FINDINGS")
        print(f"{'='*70}\n")

        for item in results["has_gap_analysis"]:
            repo = item["repo"]
            print(f"\n📦 {repo}")

            if item["root_level"]:
                print(f"  Root-level files:")
                for f in item["root_level"]:
                    print(f"    - {f['name']} ({f.get('size', 0)} bytes)")

            if item["directories"]:
                print(f"  Directories:")
                for d in item["directories"]:
                    print(f"    - {d['name']}/ ({len(d.get('files', []))} files)")
                    if d.get('files'):
                        for fname in d['files'][:5]:  # Show first 5 files
                            print(f"      - {fname}")

            if item["risk_files"]:
                print(f"  Risk/Hazard files:")
                for f in item["risk_files"]:
                    print(f"    - {f['name']}")

            if item["other_gap_files"]:
                print(f"  Other gap-related files:")
                for f in item["other_gap_files"]:
                    print(f"    - {f['directory']}/{f['name']}")

    if results["no_gap_files"]:
        print(f"\n❌ Repos with NO gap analysis files:")
        for repo in sorted(results["no_gap_files"]):
            print(f"  - {repo}")

    # Save report
    report = {
        "timestamp": TODAY,
        "org": args.org,
        "summary": {
            "with_gap_files": len(results["has_gap_analysis"]),
            "root_level": len(results["has_root_files"]),
            "directories": len(results["has_directories"]),
            "risk_files": len(results["has_risk_files"]),
            "other_gap_files": len(results["has_other_gap_files"]),
            "no_gap_files": len(results["no_gap_files"]),
        },
        "repos_with_files": [
            {
                "repo": item["repo"],
                "found": item["found"],
                "root_level": [f["name"] for f in item["root_level"]],
                "directories": [d["name"] for d in item["directories"]],
                "risk_files": [f["name"] for f in item["risk_files"]],
            }
            for item in results["has_gap_analysis"]
        ],
        "repos_without_files": results["no_gap_files"],
    }

    report_path = Path("/tmp/gap_search_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n📄 Full report saved to: {report_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
