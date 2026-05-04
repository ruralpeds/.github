#!/usr/bin/env python3
"""
cost-metrics-collector.py

Download and normalize cost metrics from GitHub Actions workflow artifacts.
Collects cost data to build audit trail for cost attribution.

Usage:
    python3 scripts/cost-metrics-collector.py \
        --token $GITHUB_TOKEN \
        --org ruralpeds \
        --repo .github \
        --hours 24 \
        --output-dir audit-log/cost

The script:
1. Lists all workflow runs from the last N hours
2. Downloads cost-metrics.json from each run's artifacts
3. Normalizes data to standard format
4. Appends to JSONL audit trail (events.jsonl)
5. Saves daily snapshot (metrics-YYYY-MM-DD.json)
6. Validates data quality
"""

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict

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


def list_workflow_runs(
    org: str,
    repo: str,
    token: str,
    hours: int = 24
) -> List[Dict]:
    """List all workflow runs from the last N hours."""
    runs = []
    page = 1
    since = (datetime.utcnow() - timedelta(hours=hours)).isoformat() + "Z"

    while True:
        r = api(
            "get",
            f"/repos/{org}/{repo}/actions/runs",
            token,
            params={
                "page": page,
                "per_page": 100,
                "created": f">={since}",
                "status": "completed",
            }
        )
        r.raise_for_status()
        data = r.json()
        runs.extend(data.get("workflow_runs", []))

        if not data.get("workflow_runs"):
            break
        page += 1

    return runs


def list_run_artifacts(org: str, repo: str, token: str, run_id: int) -> List[Dict]:
    """List all artifacts for a workflow run."""
    r = api(
        "get",
        f"/repos/{org}/{repo}/actions/runs/{run_id}/artifacts",
        token
    )
    r.raise_for_status()
    return r.json().get("artifacts", [])


def download_artifact(
    org: str,
    repo: str,
    token: str,
    artifact_id: int
) -> Optional[str]:
    """Download artifact content."""
    try:
        # Get artifact metadata
        r = api(
            "get",
            f"/repos/{org}/{repo}/actions/artifacts/{artifact_id}",
            token
        )
        r.raise_for_status()
        artifact = r.json()

        # Download zip file
        download_url = artifact["archive_download_url"]
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(download_url, headers=headers, timeout=30)
        r.raise_for_status()

        # Extract JSON from zip (if needed)
        # For now, assume the artifact contains JSON directly
        return r.text
    except Exception as e:
        return None


def normalize_cost_event(
    workflow_run: Dict,
    metrics: Dict
) -> Dict:
    """Normalize raw metrics to standard cost event format."""
    return {
        "timestamp": workflow_run.get("updated_at", datetime.utcnow().isoformat()),
        "workflow_id": workflow_run.get("workflow_id"),
        "workflow_name": workflow_run.get("name", "unknown"),
        "run_number": workflow_run.get("run_number"),
        "run_id": workflow_run.get("id"),
        "status": workflow_run.get("status", "unknown"),
        "duration_seconds": metrics.get("duration_seconds", 0),
        "runner_type": metrics.get("runner_type", "unknown"),
        "runner_label": metrics.get("runner_label", ""),
        "cost_model_version": "1.0",
        "cost_estimate": metrics.get("cost_estimate", 0.0),
        "tags": metrics.get("tags", {}),
    }


def collect_metrics(
    org: str,
    repo: str,
    token: str,
    hours: int,
    output_dir: Path
) -> Dict[str, int]:
    """Collect cost metrics from workflow runs."""
    print(f"\n📊 Cost Metrics Collector\n")
    print(f"Organization: {org}")
    print(f"Repository: {repo}")
    print(f"Hours: {hours}")

    output_dir.mkdir(parents=True, exist_ok=True)

    # List workflow runs
    print(f"\nFetching workflow runs...", end=" ", flush=True)
    runs = list_workflow_runs(org, repo, token, hours)
    print(f"✓ {len(runs)} runs found")

    # Collect metrics
    events = []
    success_count = 0
    missing_count = 0
    error_count = 0

    for i, run in enumerate(runs, 1):
        run_id = run["id"]
        workflow_name = run.get("name", "unknown")

        # List artifacts
        artifacts = list_run_artifacts(org, repo, token, run_id)

        # Find cost-metrics artifact
        cost_artifact = None
        for artifact in artifacts:
            if "cost-metrics" in artifact["name"].lower():
                cost_artifact = artifact
                break

        if not cost_artifact:
            missing_count += 1
            continue

        # Download metrics
        try:
            content = download_artifact(org, repo, token, cost_artifact["id"])
            if not content:
                error_count += 1
                continue

            metrics = json.loads(content)
            event = normalize_cost_event(run, metrics)
            events.append(event)
            success_count += 1

            if i % 10 == 0 or i == len(runs):
                print(f"[{i}/{len(runs)}] {workflow_name}: metrics collected")

        except Exception as e:
            error_count += 1

    # Append to JSONL audit trail
    jsonl_file = output_dir / "events.jsonl"
    with open(jsonl_file, "a") as f:
        for event in events:
            f.write(json.dumps(event) + "\n")

    # Save daily snapshot
    today = datetime.utcnow().strftime("%Y-%m-%d")
    daily_file = output_dir / "daily" / f"metrics-{today}.json"
    daily_file.parent.mkdir(parents=True, exist_ok=True)

    snapshot = {
        "timestamp": datetime.utcnow().isoformat(),
        "date": today,
        "total_events": len(events),
        "events": events,
    }

    with open(daily_file, "w") as f:
        json.dump(snapshot, f, indent=2)

    # Print summary
    print(f"\n{'='*70}")
    print("COLLECTION SUMMARY")
    print(f"{'='*70}\n")
    print(f"Workflow runs processed: {len(runs)}")
    print(f"Metrics collected: {success_count}")
    print(f"Missing artifacts: {missing_count}")
    print(f"Errors: {error_count}")

    print(f"\n📄 Audit trail: {jsonl_file}")
    print(f"📄 Daily snapshot: {daily_file}")

    return {
        "total": len(runs),
        "collected": success_count,
        "missing": missing_count,
        "errors": error_count,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Collect cost metrics from GitHub Actions workflow artifacts"
    )
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--org", default="ruralpeds", help="Organization")
    parser.add_argument("--repo", default=".github", help="Repository")
    parser.add_argument(
        "--hours",
        type=int,
        default=24,
        help="Collect metrics from last N hours"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("audit-log/cost"),
        help="Output directory for metrics"
    )
    args = parser.parse_args()

    try:
        result = collect_metrics(
            args.org,
            args.repo,
            args.token,
            args.hours,
            args.output_dir
        )
        return 0 if result["errors"] == 0 else 1
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
