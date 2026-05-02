#!/usr/bin/env python3
"""
hybrid_gap_consolidation.py

Hybrid gap consolidation strategy:
1. Archive root-level gap files to .gap-analysis/archive/
2. Add TODO section to new .gap-analysis/GAP_ANALYSIS.md pointing to archives
3. Let teams manually review and extract gaps into proper GAP-NNN structure

Run locally:
  python3 scripts/hybrid_gap_consolidation.py --token ghp_... --org ruralpeds --dry-run
  python3 scripts/hybrid_gap_consolidation.py --token ghp_... --org ruralpeds
"""

import argparse
import base64
import json
import sys
from datetime import datetime
from pathlib import Path

import requests


ORG = "ruralpeds"
TODAY = datetime.now().strftime("%Y-%m-%d")

# Target repos with root-level gap files
TARGET_REPOS = {
    "Evidence-based-julia": "GAP_ANALYSIS.md",
    "Geo-julia": "GAP_ANALYSIS.md",
    "WeatherMed.jl": "GAP_ANALYSIS.md",
    "Rural-quality-julia": "GAP_ANALYSIS.md",
    "Textbook": "GAPS.md",
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


def b64(text: str) -> str:
    """Encode to base64."""
    return base64.b64encode(text.encode()).decode()


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


def extract_summary(content: str, max_chars: int = 500) -> str:
    """Extract a summary from the content."""
    lines = content.split("\n")
    summary = []

    for line in lines[:30]:  # First 30 lines
        stripped = line.strip()
        if stripped and not stripped.startswith("#"):
            summary.append(stripped)
        if len("\n".join(summary)) > max_chars:
            break

    return "\n".join(summary[:5]) if summary else "(no summary available)"


def consolidate_repo(
    org: str,
    repo_name: str,
    old_filename: str,
    token: str,
    dry_run: bool,
) -> dict:
    """Consolidate gap files using hybrid approach."""
    result = {
        "repo": repo_name,
        "status": "skipped",
        "old_file": old_filename,
        "actions": [],
    }

    # Get default branch
    r = api("get", f"/repos/{org}/{repo_name}", token)
    if r.status_code != 200:
        result["status"] = "error"
        result["error"] = "Failed to get repo info"
        return result

    default_branch = r.json().get("default_branch", "main")

    # Read old gap file
    old_file = get_file(org, repo_name, old_filename, token)
    if not old_file:
        result["status"] = "not_found"
        return result

    old_content = old_file["content"]
    old_size = len(old_content)

    if old_size == 0:
        result["status"] = "empty"
        return result

    if dry_run:
        result["status"] = "would_consolidate"
        result["actions"] = [
            f"Archive {old_filename} → .gap-analysis/archive/",
            "Add TODO section to .gap-analysis/GAP_ANALYSIS.md",
            "Commit with consolidation message",
        ]
        result["old_file_size"] = old_size
        return result

    try:
        # 1. Create archive file
        archive_path = f".gap-analysis/archive/{old_filename}.archived"
        archive_content = f"""# Archived Gap Analysis
**Original file:** `{old_filename}`
**Archived date:** {TODAY}
**Reason:** Consolidated into .gap-analysis/GAP_ANALYSIS.md system
**Size:** {old_size} bytes

---

## Summary

{extract_summary(old_content)}

---

## Full Original Content

{old_content}
"""

        success = create_or_update_file(
            org,
            repo_name,
            archive_path,
            archive_content,
            f"chore(gap): archive legacy {old_filename}",
            token,
            branch=default_branch,
        )

        if not success:
            result["status"] = "error"
            result["error"] = f"Failed to archive {old_filename}"
            return result

        result["actions"].append(f"Archived {old_filename}")

        # 2. Read new gap file and add TODO section
        new_file = get_file(org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", token)
        if not new_file:
            result["status"] = "error"
            result["error"] = "New .gap-analysis/GAP_ANALYSIS.md not found"
            return result

        new_content = new_file["content"]

        # Add TODO section before the "How to update" section
        todo_section = f"""---

## Legacy Gap Analysis — Pending Review

⚠️ **ACTION REQUIRED:** This repo has a legacy gap analysis document that needs consolidation.

**Legacy file:** `{old_filename}`
**Status:** Archived to `.gap-analysis/archive/{old_filename}.archived`
**Next steps:**
1. Review `.gap-analysis/archive/{old_filename}.archived`
2. Extract key gaps and create proper GAP-NNN entries above
3. Use the format from schema.md for consistency
4. Delete this section once complete

---

"""

        # Insert TODO before "How to update" section
        if "## How to update" in new_content:
            new_content = new_content.replace(
                "## How to update",
                todo_section + "## How to update"
            )
        else:
            # If no "How to update" section, append at the end
            new_content += "\n" + todo_section

        success = create_or_update_file(
            org,
            repo_name,
            ".gap-analysis/GAP_ANALYSIS.md",
            new_content,
            f"chore(gap): add TODO for legacy {old_filename} consolidation",
            token,
            sha=new_file["sha"],
            branch=default_branch,
        )

        if not success:
            result["status"] = "error"
            result["error"] = "Failed to update .gap-analysis/GAP_ANALYSIS.md"
            return result

        result["actions"].append("Added TODO section to .gap-analysis/GAP_ANALYSIS.md")
        result["status"] = "consolidated"
        result["old_file_size"] = old_size
        return result

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        return result


def main():
    parser = argparse.ArgumentParser(
        description="Hybrid consolidation: archive old files + add TODOs to new documents"
    )
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default=ORG, help="GitHub org")
    parser.add_argument("--dry-run", action="store_true", help="Dry run (show what would happen)")
    parser.add_argument("--repo", help="Consolidate single repo (default: all target repos)")
    args = parser.parse_args()

    print(f"\n📦 Hybrid Gap Consolidation (Archive + TODO)\n")

    # Determine repos to process
    if args.repo:
        if args.repo not in TARGET_REPOS:
            print(f"❌ {args.repo} not in target repos")
            return 1
        repos_to_process = {args.repo: TARGET_REPOS[args.repo]}
        print(f"Consolidating single repo: {args.repo}\n")
    else:
        repos_to_process = TARGET_REPOS
        print(f"Found {len(TARGET_REPOS)} repos with root-level gap files\n")

    # Process each repo
    results = {
        "consolidated": [],
        "would_consolidate": [],
        "not_found": [],
        "empty": [],
        "errors": [],
    }

    for i, (repo_name, old_filename) in enumerate(repos_to_process.items(), 1):
        print(f"[{i}/{len(repos_to_process)}] {repo_name}...", end=" ", flush=True)

        try:
            result = consolidate_repo(args.org, repo_name, old_filename, args.token, args.dry_run)

            if result["status"] == "consolidated":
                size_kb = result.get("old_file_size", 0) / 1024
                print(f"✓ CONSOLIDATED ({size_kb:.1f}KB archived)")
                results["consolidated"].append(result)
            elif result["status"] == "would_consolidate":
                size_kb = result.get("old_file_size", 0) / 1024
                print(f"→ WOULD consolidate ({size_kb:.1f}KB → archive)")
                results["would_consolidate"].append(result)
            elif result["status"] == "not_found":
                print("not found")
                results["not_found"].append(repo_name)
            elif result["status"] == "empty":
                print("empty")
                results["empty"].append(repo_name)
            else:
                print(f"❌ ERROR: {result.get('error', 'unknown')}")
                results["errors"].append(result)

        except Exception as e:
            print(f"❌ ERROR: {e}")
            results["errors"].append({"repo": repo_name, "error": str(e)})

    # Print summary
    print(f"\n{'='*70}")
    print("HYBRID CONSOLIDATION SUMMARY")
    print(f"{'='*70}\n")

    print(f"✓ Consolidated:         {len(results['consolidated'])} repos")
    print(f"→ Would consolidate:    {len(results['would_consolidate'])} repos (dry-run mode)")
    print(f"- Not found:            {len(results['not_found'])} repos")
    print(f"- Empty:                {len(results['empty'])} repos")
    print(f"❌ Errors:              {len(results['errors'])} repos")

    # Show details
    if results["consolidated"] or results["would_consolidate"]:
        print(f"\n{'='*70}")
        print("CONSOLIDATION DETAILS")
        print(f"{'='*70}\n")

        for item in results["consolidated"] + results["would_consolidate"]:
            repo = item["repo"]
            old_file = item["old_file"]
            size_kb = item.get("old_file_size", 0) / 1024

            print(f"\n📦 {repo}")
            print(f"  Legacy file: {old_file} ({size_kb:.1f}KB)")
            print(f"  Actions:")
            for action in item.get("actions", []):
                print(f"    → {action}")
            print(f"  Team TODO:")
            print(f"    1. Review .gap-analysis/archive/{old_file}.archived")
            print(f"    2. Extract key gaps into proper GAP-NNN entries")
            print(f"    3. Delete TODO section when complete")

    if results["errors"]:
        print(f"\n❌ Errors:")
        for item in results["errors"]:
            print(f"  - {item['repo']}: {item.get('error', 'unknown')}")

    # Save report
    report = {
        "timestamp": TODAY,
        "org": args.org,
        "dry_run": args.dry_run,
        "strategy": "hybrid (archive + todo)",
        "summary": {
            "consolidated": len(results["consolidated"]),
            "would_consolidate": len(results["would_consolidate"]),
            "not_found": len(results["not_found"]),
            "empty": len(results["empty"]),
            "errors": len(results["errors"]),
        },
        "consolidated_repos": [
            {
                "repo": item["repo"],
                "old_file": item["old_file"],
                "archived_to": f".gap-analysis/archive/{item['old_file']}.archived",
                "size_bytes": item.get("old_file_size", 0),
                "actions": item.get("actions", []),
            }
            for item in results["consolidated"] + results["would_consolidate"]
        ],
    }

    report_path = Path("/tmp/gap_hybrid_consolidation_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n📄 Report saved to: {report_path}")

    if args.dry_run:
        print("\n🔧 DRY RUN MODE: No changes made")
        print("To proceed with hybrid consolidation, run without --dry-run flag")

    return 0 if not results["errors"] else 1


if __name__ == "__main__":
    sys.exit(main())
