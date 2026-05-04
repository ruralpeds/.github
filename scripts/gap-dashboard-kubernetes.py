#!/usr/bin/env python3
"""
gap-dashboard-kubernetes.py

Parallelized gap aggregation for Kubernetes deployment.
Splits 27 repos across multiple pods for 4x speedup (45 min → 12 min).

Usage:
    python3 scripts/gap-dashboard-kubernetes.py \
        --token ghp_... \
        --org ruralpeds \
        --num-pods 4 \
        --pod-index 0 \
        --output /tmp/gap-results-pod-0.json

Deployment:
    In Kubernetes batch job, run one container per pod:
    - Pod 0: repos 1-7
    - Pod 1: repos 8-14
    - Pod 2: repos 15-21
    - Pod 3: repos 22-27

    After all pods complete, run merge step to combine results.
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests


def api(method: str, path: str, token: str, **kwargs) -> requests.Response:
    """Make GitHub API call."""
    url = f"https://api.github.com{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    return getattr(requests, method)(url, headers=headers, timeout=30, **kwargs)


def list_org_repos(org: str, token: str) -> list[dict]:
    """List all non-archived repos in org."""
    repos = []
    page = 1
    while True:
        r = api("get", f"/orgs/{org}/repos", token, params={
            "page": page,
            "per_page": 100,
            "type": "sources",
            "sort": "updated",
        })
        r.raise_for_status()
        data = r.json()
        if not data:
            break
        repos.extend([r for r in data if not r["archived"]])
        page += 1
    return repos


def get_file_content(org: str, repo: str, path: str, token: str) -> Optional[str]:
    """Fetch file content from GitHub."""
    r = api("get", f"/repos/{org}/{repo}/contents/{path}", token)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    data = r.json()
    if isinstance(data, list):
        return None
    headers = {"Authorization": f"Bearer {token}"}
    raw_r = requests.get(data["download_url"], headers=headers, timeout=30)
    raw_r.raise_for_status()
    return raw_r.text


def extract_gaps_from_md(content: str, repo: str) -> list[dict]:
    """Extract all gaps from GAP_ANALYSIS.md."""
    gaps = []

    for match in re.finditer(
        r"^### ✅?\s?(GAP-\d{3,4}):\s*(.+?)(?=^### (?:✅\s)?GAP-|^## |^$)",
        content,
        re.MULTILINE | re.DOTALL
    ):
        block = match.group(0)
        gap_id = match.group(1)
        title = match.group(2).strip()

        # Extract fields
        priority_match = re.search(r"^\*\*Priority\*\*:\s*([P0-4])\b", block, re.MULTILINE)
        priority = priority_match.group(1) if priority_match else "P3"

        status_match = re.search(r"^\*\*Status\*\*:\s*(.+)$", block, re.MULTILINE)
        status = status_match.group(1).strip() if status_match else "Unknown"

        owner_match = re.search(r"^\*\*Owner\*\*:\s*(.+)$", block, re.MULTILINE)
        owner = owner_match.group(1).strip() if owner_match else "Unassigned"

        gaps.append({
            "gap_id": gap_id,
            "repo": repo,
            "title": title,
            "priority": priority,
            "owner": owner,
            "status": status,
        })

    return gaps


def chunk_repos(repos: list[dict], num_pods: int) -> list[list[dict]]:
    """Split repos into chunks for parallel processing."""
    chunk_size = (len(repos) + num_pods - 1) // num_pods
    chunks = []
    for i in range(num_pods):
        start = i * chunk_size
        end = start + chunk_size
        chunks.append(repos[start:end])
    return chunks


def aggregate_group(
    org: str,
    repos: list[dict],
    token: str,
    pod_index: int
) -> dict:
    """Aggregate gaps from a group of repos (run on single Kubernetes pod)."""
    print(f"\n📊 Pod {pod_index}: Processing {len(repos)} repos")

    all_gaps = []
    for i, repo in enumerate(repos, 1):
        repo_name = repo["name"]
        content = get_file_content(
            org, repo_name, ".gap-analysis/GAP_ANALYSIS.md", token
        )
        if not content:
            continue

        gaps = extract_gaps_from_md(content, repo_name)
        all_gaps.extend(gaps)

        if i % 2 == 0 or i == len(repos):
            print(f"  [{i}/{len(repos)}] {repo_name}: {len(gaps)} gaps")

    # Build summary for this pod
    summary = {
        "pod_index": pod_index,
        "total_gaps": len(all_gaps),
        "repos_processed": len(repos),
        "by_priority": {
            "P0": sum(1 for g in all_gaps if g["priority"] == "P0"),
            "P1": sum(1 for g in all_gaps if g["priority"] == "P1"),
            "P2": sum(1 for g in all_gaps if g["priority"] == "P2"),
            "P3": sum(1 for g in all_gaps if g["priority"] == "P3"),
            "P4": sum(1 for g in all_gaps if g["priority"] == "P4"),
        },
        "by_status": {
            "Not Started": sum(1 for g in all_gaps if "Not Started" in g["status"]),
            "In Progress": sum(1 for g in all_gaps if "In Progress" in g["status"]),
            "Completed": sum(1 for g in all_gaps if "Completed" in g["status"]),
            "Blocked": sum(1 for g in all_gaps if "Blocked" in g["status"]),
        },
    }

    print(f"  ✓ Pod {pod_index} complete: {len(all_gaps)} gaps found")

    return {
        "timestamp": datetime.now().isoformat(),
        "pod_index": pod_index,
        "summary": summary,
        "gaps": all_gaps,
    }


def merge_pod_results(pod_results: list[dict]) -> dict:
    """Merge results from all pods."""
    print(f"\n🔀 Merging results from {len(pod_results)} pods...")

    all_gaps = []
    total_repos = 0
    total_summary = {
        "P0": 0, "P1": 0, "P2": 0, "P3": 0, "P4": 0
    }
    total_status = {
        "Not Started": 0, "In Progress": 0, "Completed": 0, "Blocked": 0
    }

    for result in sorted(pod_results, key=lambda x: x["pod_index"]):
        pod_idx = result["pod_index"]
        summary = result["summary"]
        all_gaps.extend(result["gaps"])
        total_repos += summary["repos_processed"]

        for priority in ["P0", "P1", "P2", "P3", "P4"]:
            total_summary[priority] += summary["by_priority"][priority]

        for status in total_status:
            total_status[status] += summary["by_status"].get(status, 0)

        print(f"  Pod {pod_idx}: {summary['total_gaps']} gaps from {summary['repos_processed']} repos")

    merged = {
        "timestamp": datetime.now().isoformat(),
        "organization": "ruralpeds",
        "summary": {
            "total_gaps": len(all_gaps),
            "total_repos": total_repos,
            "by_priority": total_summary,
            "by_status": total_status,
            "pods": len(pod_results),
        },
        "gaps": all_gaps,
    }

    print(f"  ✓ Merge complete: {len(all_gaps)} total gaps")

    return merged


def main():
    parser = argparse.ArgumentParser(
        description="Parallelized gap aggregation for Kubernetes"
    )
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default="ruralpeds", help="Organization")
    parser.add_argument("--num-pods", type=int, default=4, help="Number of parallel pods")
    parser.add_argument(
        "--pod-index",
        type=int,
        help="Pod index (0-based). If omitted, runs single-pod mode"
    )
    parser.add_argument("--output", default="/tmp/gap-results.json", help="Output file")
    parser.add_argument(
        "--merge",
        action="store_true",
        help="Merge pod results (run after all pods complete)"
    )
    args = parser.parse_args()

    output_dir = Path(args.output).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n🚀 Gap Dashboard — Kubernetes Parallelized Aggregation\n")
    print(f"Organization: {args.org}")

    # Fetch repos
    print("Fetching repos...", end=" ", flush=True)
    repos = list_org_repos(args.org, args.token)
    print(f"✓ {len(repos)} repos found")

    if args.merge:
        # Merge mode: combine results from all pods
        print(f"\n🔀 Merge Mode: Combining {args.num_pods} pod results\n")

        pod_results = []
        for i in range(args.num_pods):
            pod_file = output_dir / f"gap-results-pod-{i}.json"
            if not pod_file.exists():
                print(f"  ⚠️  Pod {i} result not found: {pod_file}")
                continue

            with open(pod_file) as f:
                pod_results.append(json.load(f))

        if not pod_results:
            print("❌ No pod results found!")
            return 1

        merged = merge_pod_results(pod_results)

        # Write merged result
        output_path = Path(args.output)
        with open(output_path, "w") as f:
            json.dump(merged, f, indent=2)

        print(f"\n✓ Merged result: {output_path}")
        print(f"\n{'='*70}")
        print("MERGE SUMMARY")
        print(f"{'='*70}\n")
        print(f"Total gaps: {merged['summary']['total_gaps']}")
        print(f"By priority: "
              f"P0={merged['summary']['by_priority']['P0']} "
              f"P1={merged['summary']['by_priority']['P1']} "
              f"P2={merged['summary']['by_priority']['P2']} "
              f"P3={merged['summary']['by_priority']['P3']} "
              f"P4={merged['summary']['by_priority']['P4']}")
        print()

        return 0

    # Pod mode: aggregate group of repos
    if args.pod_index is None:
        # Single-pod mode (for testing)
        print(f"\n📌 Single-Pod Mode (all {len(repos)} repos in one process)\n")
        pod_results = [aggregate_group(args.org, repos, args.token, pod_index=0)]
    else:
        # Kubernetes mode: process single pod
        chunks = chunk_repos(repos, args.num_pods)
        if args.pod_index >= len(chunks):
            print(f"❌ Pod index {args.pod_index} out of range (0-{len(chunks)-1})")
            return 1

        print(f"\n📌 Pod Mode: Pod {args.pod_index} of {args.num_pods}\n")
        group = chunks[args.pod_index]
        pod_results = [aggregate_group(args.org, group, args.token, args.pod_index)]

    # Write pod result
    result = pod_results[0]
    if args.pod_index is not None:
        output_path = Path(args.output).parent / f"gap-results-pod-{args.pod_index}.json"
    else:
        output_path = Path(args.output)

    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n✓ Pod result: {output_path}")

    # Print summary
    summary = result["summary"]
    print(f"\n{'='*70}")
    print(f"POD {result['pod_index']} SUMMARY")
    print(f"{'='*70}\n")
    print(f"Total gaps: {summary['total_gaps']}")
    print(f"Repos processed: {summary['repos_processed']}")
    print(f"By priority: "
          f"P0={summary['by_priority']['P0']} "
          f"P1={summary['by_priority']['P1']} "
          f"P2={summary['by_priority']['P2']} "
          f"P3={summary['by_priority']['P3']} "
          f"P4={summary['by_priority']['P4']}")
    print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
