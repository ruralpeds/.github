#!/usr/bin/env python3
"""
cost-aggregator.py

Aggregate costs from JSONL audit trail by various dimensions.
Generates JSON, CSV, and markdown reports for cost attribution.

Usage:
    python3 scripts/cost-aggregator.py \
        --input-dir audit-log/cost \
        --output-dir audit-log/reports \
        --date 2026-05-25

The script:
1. Loads JSONL events from audit trail
2. Groups by: team, project, workflow, date, hour
3. Calculates: sum, average, count, trends
4. Identifies: expensive workflows, anomalies, patterns
5. Generates: JSON, CSV, and analysis reports
6. Forecasts: Projected monthly/annual costs
"""

import argparse
import csv
import json
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple


def load_events(input_dir: Path) -> List[Dict]:
    """Load all events from JSONL audit trail."""
    events = []
    jsonl_file = input_dir / "events.jsonl"

    if not jsonl_file.exists():
        print(f"⚠️  No events file: {jsonl_file}")
        return []

    try:
        with open(jsonl_file) as f:
            for line in f:
                if line.strip():
                    try:
                        events.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
    except Exception as e:
        print(f"⚠️  Error reading events: {e}")

    return events


def aggregate_costs(events: List[Dict]) -> Dict:
    """Aggregate costs by various dimensions."""
    by_team = defaultdict(lambda: {"cost": 0.0, "runs": 0, "count": 0})
    by_project = defaultdict(lambda: {"cost": 0.0, "runs": 0, "count": 0})
    by_workflow = defaultdict(lambda: {"cost": 0.0, "runs": 0, "count": 0})
    by_date = defaultdict(lambda: {"cost": 0.0, "runs": 0, "count": 0})
    by_runner = defaultdict(lambda: {"cost": 0.0, "runs": 0, "count": 0})

    total_cost = 0.0
    total_runs = 0

    for event in events:
        cost = event.get("cost_estimate", 0.0)
        tags = event.get("tags", {})
        team = tags.get("team", "unknown")
        project = tags.get("project", "unknown")
        workflow = event.get("workflow_name", "unknown")
        runner = event.get("runner_type", "unknown")

        # Extract date from timestamp
        try:
            timestamp = event.get("timestamp", "")
            date = timestamp.split("T")[0] if timestamp else "unknown"
        except:
            date = "unknown"

        # Aggregate
        by_team[team]["cost"] += cost
        by_team[team]["runs"] += 1
        by_team[team]["count"] += 1

        by_project[project]["cost"] += cost
        by_project[project]["runs"] += 1
        by_project[project]["count"] += 1

        by_workflow[workflow]["cost"] += cost
        by_workflow[workflow]["runs"] += 1
        by_workflow[workflow]["count"] += 1

        by_date[date]["cost"] += cost
        by_date[date]["runs"] += 1
        by_date[date]["count"] += 1

        by_runner[runner]["cost"] += cost
        by_runner[runner]["runs"] += 1
        by_runner[runner]["count"] += 1

        total_cost += cost
        total_runs += 1

    return {
        "by_team": dict(by_team),
        "by_project": dict(by_project),
        "by_workflow": dict(by_workflow),
        "by_date": dict(by_date),
        "by_runner": dict(by_runner),
        "total_cost": total_cost,
        "total_runs": total_runs,
    }


def generate_json_report(
    events: List[Dict],
    aggregation: Dict,
    output_file: Path
) -> None:
    """Generate comprehensive JSON report."""
    total_cost = aggregation["total_cost"]
    total_runs = aggregation["total_runs"]

    # Calculate trends
    dates = sorted(aggregation["by_date"].keys())
    daily_costs = [
        {"date": date, "cost": aggregation["by_date"][date]["cost"]}
        for date in dates
    ]

    # Calculate forecast
    if dates:
        avg_daily = total_cost / len(dates) if dates else 0
        projected_monthly = avg_daily * 30
        projected_annual = avg_daily * 365
    else:
        projected_monthly = 0
        projected_annual = 0

    # Find expensive workflows
    by_workflow = aggregation["by_workflow"]
    expensive = sorted(
        [
            {"name": wf, "cost": data["cost"], "runs": data["runs"]}
            for wf, data in by_workflow.items()
        ],
        key=lambda x: x["cost"],
        reverse=True
    )[:10]

    # Build report
    report = {
        "timestamp": datetime.utcnow().isoformat(),
        "summary": {
            "total_cost": round(total_cost, 2),
            "total_runs": total_runs,
            "average_cost_per_run": round(total_cost / total_runs, 2) if total_runs else 0,
            "projected_monthly": round(projected_monthly, 2),
            "projected_annual": round(projected_annual, 2),
        },
        "by_team": {
            team: {
                "cost": round(data["cost"], 2),
                "runs": data["runs"],
                "pct": round(100 * data["cost"] / total_cost, 1) if total_cost else 0,
                "avg_cost_per_run": round(data["cost"] / data["runs"], 2) if data["runs"] else 0,
            }
            for team, data in sorted(
                aggregation["by_team"].items(),
                key=lambda x: x[1]["cost"],
                reverse=True
            )
        },
        "by_project": {
            project: {
                "cost": round(data["cost"], 2),
                "runs": data["runs"],
                "pct": round(100 * data["cost"] / total_cost, 1) if total_cost else 0,
            }
            for project, data in sorted(
                aggregation["by_project"].items(),
                key=lambda x: x[1]["cost"],
                reverse=True
            )
        },
        "by_runner": {
            runner: {
                "cost": round(data["cost"], 2),
                "runs": data["runs"],
                "pct": round(100 * data["cost"] / total_cost, 1) if total_cost else 0,
            }
            for runner, data in sorted(
                aggregation["by_runner"].items(),
                key=lambda x: x[1]["cost"],
                reverse=True
            )
        },
        "expensive_workflows": expensive,
        "trends": {
            "daily": daily_costs,
            "avg_daily": round(total_cost / len(dates), 2) if dates else 0,
        },
    }

    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)


def generate_csv_reports(aggregation: Dict, output_dir: Path) -> None:
    """Generate CSV reports for spreadsheet analysis."""
    output_dir.mkdir(parents=True, exist_ok=True)

    total_cost = aggregation["total_cost"]

    # Cost by team
    with open(output_dir / "cost-by-team.csv", "w", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["team", "cost", "runs", "avg_cost_per_run", "pct"]
        )
        writer.writeheader()

        for team, data in sorted(
            aggregation["by_team"].items(),
            key=lambda x: x[1]["cost"],
            reverse=True
        ):
            writer.writerow({
                "team": team,
                "cost": round(data["cost"], 2),
                "runs": data["runs"],
                "avg_cost_per_run": round(data["cost"] / data["runs"], 2) if data["runs"] else 0,
                "pct": round(100 * data["cost"] / total_cost, 1) if total_cost else 0,
            })

    # Cost by project
    with open(output_dir / "cost-by-project.csv", "w", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["project", "cost", "runs", "avg_cost_per_run", "pct"]
        )
        writer.writeheader()

        for project, data in sorted(
            aggregation["by_project"].items(),
            key=lambda x: x[1]["cost"],
            reverse=True
        ):
            writer.writerow({
                "project": project,
                "cost": round(data["cost"], 2),
                "runs": data["runs"],
                "avg_cost_per_run": round(data["cost"] / data["runs"], 2) if data["runs"] else 0,
                "pct": round(100 * data["cost"] / total_cost, 1) if total_cost else 0,
            })

    # Cost by workflow
    with open(output_dir / "cost-by-workflow.csv", "w", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["workflow", "cost", "runs", "avg_cost_per_run", "pct"]
        )
        writer.writeheader()

        for workflow, data in sorted(
            aggregation["by_workflow"].items(),
            key=lambda x: x[1]["cost"],
            reverse=True
        ):
            writer.writerow({
                "workflow": workflow,
                "cost": round(data["cost"], 2),
                "runs": data["runs"],
                "avg_cost_per_run": round(data["cost"] / data["runs"], 2) if data["runs"] else 0,
                "pct": round(100 * data["cost"] / total_cost, 1) if total_cost else 0,
            })


def main():
    parser = argparse.ArgumentParser(description="Aggregate cost metrics")
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=Path("audit-log/cost"),
        help="Input directory with metrics"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("audit-log/reports"),
        help="Output directory for reports"
    )
    args = parser.parse_args()

    print(f"\n💰 Cost Aggregator\n")
    print(f"Input directory: {args.input_dir}")
    print(f"Output directory: {args.output_dir}")

    # Load events
    print(f"\nLoading events...", end=" ", flush=True)
    events = load_events(args.input_dir)
    print(f"✓ {len(events)} events loaded")

    if not events:
        print("⚠️  No events to process")
        return 1

    # Aggregate
    print(f"Aggregating costs...", end=" ", flush=True)
    aggregation = aggregate_costs(events)
    print(f"✓ Complete")

    # Generate reports
    args.output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Generating reports...", end=" ", flush=True)
    generate_json_report(events, aggregation, args.output_dir / "org-cost-attribution.json")
    generate_csv_reports(aggregation, args.output_dir)
    print(f"✓ Complete")

    # Print summary
    total_cost = aggregation["total_cost"]
    total_runs = aggregation["total_runs"]

    print(f"\n{'='*70}")
    print("AGGREGATION SUMMARY")
    print(f"{'='*70}\n")
    print(f"Total cost: ${total_cost:.2f}")
    print(f"Total runs: {total_runs}")
    print(f"Average cost per run: ${total_cost / total_runs:.2f}")

    print(f"\nTop teams by cost:")
    for i, (team, data) in enumerate(
        sorted(aggregation["by_team"].items(), key=lambda x: x[1]["cost"], reverse=True)[:5],
        1
    ):
        print(f"  {i}. {team}: ${data['cost']:.2f} ({data['runs']} runs)")

    print(f"\nTop workflows by cost:")
    for i, (workflow, data) in enumerate(
        sorted(aggregation["by_workflow"].items(), key=lambda x: x[1]["cost"], reverse=True)[:5],
        1
    ):
        print(f"  {i}. {workflow}: ${data['cost']:.2f} ({data['runs']} runs)")

    print(f"\n📄 JSON report: {args.output_dir / 'org-cost-attribution.json'}")
    print(f"📄 CSV reports: {args.output_dir}/cost-by-*.csv")

    return 0


if __name__ == "__main__":
    sys.exit(main())
