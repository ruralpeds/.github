#!/usr/bin/env python3
"""
metrics-aggregator.py

Aggregate raw job metrics into time-series data for dashboards and alerting.
Reads JSONL metrics from daily raw metrics file, aggregates by dimensions,
calculates percentiles and trends, detects regressions.

Usage:
    python3 scripts/metrics-aggregator.py \
        --input-dir audit-log/observability/daily \
        --output-dir audit-log/observability/aggregated \
        --date 2026-05-25

Output:
    - Aggregated metrics by workflow (timeseries)
    - Performance percentiles (p50, p95, p99)
    - Trend analysis with regression detection
    - System health metrics
"""

import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple
from statistics import median, quantiles


def load_raw_metrics(input_file: Path) -> List[Dict]:
    """Load raw metrics from JSONL file."""
    metrics = []

    if not input_file.exists():
        print(f"⚠️  No metrics file: {input_file}")
        return []

    try:
        with open(input_file) as f:
            for line in f:
                if line.strip():
                    try:
                        metrics.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
    except Exception as e:
        print(f"⚠️  Error reading metrics: {e}")

    return metrics


def aggregate_by_workflow(metrics: List[Dict]) -> Dict:
    """Aggregate metrics by workflow name."""
    by_workflow = defaultdict(lambda: {
        "durations": [],
        "success_count": 0,
        "failure_count": 0,
        "total_runs": 0,
        "total_memory_kb": 0,
        "total_cpu_time": 0,
        "disk_io_bytes": 0,
    })

    for metric in metrics:
        workflow = metric.get("workflow_name", "unknown")
        status = metric.get("job_status", "unknown")

        # Duration (elapsed_seconds)
        elapsed = metric.get("elapsed_seconds", 0)
        if elapsed > 0:
            by_workflow[workflow]["durations"].append(elapsed)

        # Status counters
        if status == "success":
            by_workflow[workflow]["success_count"] += 1
        elif status == "failure":
            by_workflow[workflow]["failure_count"] += 1

        by_workflow[workflow]["total_runs"] += 1

        # Resource metrics
        by_workflow[workflow]["total_memory_kb"] += metric.get("memory_peak_kb", 0)
        by_workflow[workflow]["total_cpu_time"] += metric.get("cpu_user_time", 0) + metric.get("cpu_system_time", 0)
        by_workflow[workflow]["disk_io_bytes"] += metric.get("disk_read_bytes", 0) + metric.get("disk_write_bytes", 0)

    return dict(by_workflow)


def calculate_percentiles(durations: List[float]) -> Dict:
    """Calculate p50, p95, p99 for durations."""
    if not durations:
        return {"p50": 0, "p95": 0, "p99": 0}

    sorted_durations = sorted(durations)
    return {
        "p50": round(median(sorted_durations), 2),
        "p95": round(sorted_durations[int(len(sorted_durations) * 0.95)], 2),
        "p99": round(sorted_durations[int(len(sorted_durations) * 0.99)], 2),
        "min": round(min(sorted_durations), 2),
        "max": round(max(sorted_durations), 2),
        "avg": round(sum(sorted_durations) / len(sorted_durations), 2),
    }


def detect_regression(durations: List[float], baseline: float = None) -> Dict:
    """Detect performance regressions in job duration."""
    if len(durations) < 3:
        return {"regression_detected": False, "severity": "none"}

    recent = durations[-3:]
    historical = durations[:-3]

    if not historical:
        return {"regression_detected": False, "severity": "none"}

    hist_avg = sum(historical) / len(historical)
    recent_avg = sum(recent) / len(recent)

    if recent_avg > hist_avg * 2:
        return {
            "regression_detected": True,
            "severity": "critical",
            "historical_avg": round(hist_avg, 2),
            "recent_avg": round(recent_avg, 2),
            "increase_percent": round((recent_avg / hist_avg - 1) * 100, 1),
        }
    elif recent_avg > hist_avg * 1.5:
        return {
            "regression_detected": True,
            "severity": "warning",
            "historical_avg": round(hist_avg, 2),
            "recent_avg": round(recent_avg, 2),
            "increase_percent": round((recent_avg / hist_avg - 1) * 100, 1),
        }

    return {"regression_detected": False, "severity": "none"}


def calculate_failure_rate(success: int, failure: int) -> float:
    """Calculate failure rate percentage."""
    total = success + failure
    if total == 0:
        return 0.0
    return round(100 * failure / total, 1)


def aggregate_system_health(metrics: List[Dict]) -> Dict:
    """Aggregate system health metrics."""
    if not metrics:
        return {}

    disk_usage = [m.get("disk_usage_percent", 0) for m in metrics if "disk_usage_percent" in m]
    memory_usage = [m.get("memory_rss_kb", 0) for m in metrics if "memory_rss_kb" in m]

    return {
        "disk_usage_avg_percent": round(sum(disk_usage) / len(disk_usage), 1) if disk_usage else 0,
        "disk_usage_max_percent": max(disk_usage) if disk_usage else 0,
        "memory_usage_avg_kb": round(sum(memory_usage) / len(memory_usage), 0) if memory_usage else 0,
        "memory_usage_max_kb": max(memory_usage) if memory_usage else 0,
    }


def generate_aggregation_report(
    aggregation: Dict,
    metrics: List[Dict],
    output_file: Path
) -> None:
    """Generate comprehensive aggregation report."""
    timestamp = datetime.utcnow().isoformat()

    # Build report
    report = {
        "timestamp": timestamp,
        "metric_count": len(metrics),
        "workflows": {},
        "system_health": aggregate_system_health(metrics),
        "summary": {
            "total_runs": sum(agg["total_runs"] for agg in aggregation.values()),
            "total_success": sum(agg["success_count"] for agg in aggregation.values()),
            "total_failure": sum(agg["failure_count"] for agg in aggregation.values()),
        }
    }

    # Workflow details
    for workflow, data in sorted(
        aggregation.items(),
        key=lambda x: x[1]["total_runs"],
        reverse=True
    ):
        durations = data["durations"]
        percentiles = calculate_percentiles(durations)
        regression = detect_regression(durations)

        report["workflows"][workflow] = {
            "total_runs": data["total_runs"],
            "success_count": data["success_count"],
            "failure_count": data["failure_count"],
            "failure_rate_percent": calculate_failure_rate(data["success_count"], data["failure_count"]),
            "duration": percentiles,
            "regression_detection": regression,
            "resource_usage": {
                "avg_memory_kb": round(data["total_memory_kb"] / data["total_runs"], 0) if data["total_runs"] else 0,
                "avg_cpu_time": round(data["total_cpu_time"] / data["total_runs"], 2) if data["total_runs"] else 0,
                "total_disk_io_bytes": data["disk_io_bytes"],
            }
        }

    # Add summary statistics
    all_durations = []
    for data in aggregation.values():
        all_durations.extend(data["durations"])

    if all_durations:
        report["summary"]["duration_percentiles"] = calculate_percentiles(all_durations)

    report["summary"]["overall_failure_rate_percent"] = calculate_failure_rate(
        report["summary"]["total_success"],
        report["summary"]["total_failure"]
    )

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Aggregate metrics into time-series data")
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=Path("audit-log/observability/daily"),
        help="Input directory with raw metrics"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("audit-log/observability/aggregated"),
        help="Output directory for aggregated metrics"
    )
    parser.add_argument(
        "--date",
        default=datetime.utcnow().strftime("%Y-%m-%d"),
        help="Date to aggregate metrics for"
    )
    args = parser.parse_args()

    print(f"\n📊 Metrics Aggregator\n")
    print(f"Input directory: {args.input_dir}")
    print(f"Output directory: {args.output_dir}")
    print(f"Date: {args.date}")

    # Load raw metrics
    print(f"\nLoading raw metrics...", end=" ", flush=True)
    input_file = args.input_dir / f"metrics-raw-{args.date}.jsonl"
    metrics = load_raw_metrics(input_file)
    print(f"✓ {len(metrics)} metrics loaded")

    if not metrics:
        print("⚠️  No metrics to aggregate")
        return 1

    # Aggregate by workflow
    print(f"Aggregating metrics...", end=" ", flush=True)
    aggregation = aggregate_by_workflow(metrics)
    print(f"✓ Complete")

    # Generate report
    print(f"Generating aggregation report...", end=" ", flush=True)
    output_file = args.output_dir / f"aggregated-{args.date}.json"
    generate_aggregation_report(aggregation, metrics, output_file)
    print(f"✓ Complete")

    # Print summary
    print(f"\n{'='*70}")
    print("AGGREGATION SUMMARY")
    print(f"{'='*70}\n")

    total_runs = sum(agg["total_runs"] for agg in aggregation.values())
    total_success = sum(agg["success_count"] for agg in aggregation.values())
    total_failure = sum(agg["failure_count"] for agg in aggregation.values())

    print(f"Total runs: {total_runs}")
    print(f"Success: {total_success}")
    print(f"Failure: {total_failure}")
    print(f"Failure rate: {calculate_failure_rate(total_success, total_failure)}%")

    print(f"\nTop workflows by runs:")
    for i, (workflow, data) in enumerate(
        sorted(aggregation.items(), key=lambda x: x[1]["total_runs"], reverse=True)[:5],
        1
    ):
        percentiles = calculate_percentiles(data["durations"])
        print(f"  {i}. {workflow}: {data['total_runs']} runs, {percentiles['avg']}s avg duration")

    print(f"\n📄 Report: {output_file}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
