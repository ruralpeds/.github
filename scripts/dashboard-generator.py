#!/usr/bin/env python3
"""
dashboard-generator.py

Generate markdown dashboards from aggregated metrics and alerts.
Creates three main dashboards: Status, Performance, and Health.

Dashboards:
  1. Status: Queue depth, job success rate, runner status, recent alerts
  2. Performance: Duration percentiles, slowest workflows, regression detection
  3. Health: Runner uptime, job failure rates, health score

Usage:
    python3 scripts/dashboard-generator.py \
        --metrics-file audit-log/observability/aggregated/aggregated-2026-05-25.json \
        --alerts-file audit-log/observability/alerts/alerts-2026-05-25.json \
        --output-dir audit-log/observability/dashboards

Output:
    - dashboard-status.md
    - dashboard-performance.md
    - dashboard-health.md
    - dashboard-summary.md (index)
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional


def load_json(file_path: Path) -> Dict:
    """Load JSON file."""
    if not file_path.exists():
        print(f"⚠️  File not found: {file_path}")
        return {}

    try:
        with open(file_path) as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️  Error loading {file_path}: {e}")
        return {}


def format_duration(seconds: float) -> str:
    """Format duration in human-readable format."""
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        return f"{seconds/60:.1f}m"
    else:
        return f"{seconds/3600:.1f}h"


def format_bytes(bytes_val: int) -> str:
    """Format bytes in human-readable format."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_val < 1024:
            return f"{bytes_val:.1f}{unit}"
        bytes_val /= 1024
    return f"{bytes_val:.1f}TB"


def generate_status_dashboard(metrics: Dict, alerts: Dict, output_file: Path) -> None:
    """Generate status dashboard."""
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    markdown = f"""# Status Dashboard

**Last Updated:** {timestamp}

## Summary

| Metric | Value |
|--------|-------|
| Total Runs | {metrics.get('summary', {}).get('total_runs', 0)} |
| Success Rate | {100 - metrics.get('summary', {}).get('overall_failure_rate_percent', 0):.1f}% |
| Failure Rate | {metrics.get('summary', {}).get('overall_failure_rate_percent', 0):.1f}% |
| Failures | {metrics.get('summary', {}).get('total_failure', 0)} |

## Active Alerts

| Severity | Count |
|----------|-------|
| 🔴 Critical | {alerts.get('critical_count', 0)} |
| 🟡 Warning | {alerts.get('warning_count', 0)} |

"""

    if alerts.get('alerts'):
        markdown += "### Alert Details\n\n"
        for alert in alerts['alerts'][:10]:
            rule = alert.get('rule', 'unknown')
            severity = alert.get('severity', 'unknown')
            details = alert.get('details', {})

            icon = "🔴" if severity == "critical" else "🟡"
            markdown += f"- **{icon} {rule}**: {rule.replace('_', ' ').title()}\n"

            for key, value in details.items():
                key_display = key.replace('_', ' ').title()
                markdown += f"  - {key_display}: {value}\n"
            markdown += "\n"

    markdown += f"""## System Health

| Metric | Value |
|--------|-------|
| Disk Usage | {metrics.get('system_health', {}).get('disk_usage_max_percent', 0):.1f}% |
| Memory (Max) | {metrics.get('system_health', {}).get('memory_usage_max_kb', 0) / (1024*1024):.2f}GB |

"""

    with open(output_file, "w") as f:
        f.write(markdown)


def generate_performance_dashboard(metrics: Dict, output_file: Path) -> None:
    """Generate performance dashboard."""
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    markdown = f"""# Performance Dashboard

**Last Updated:** {timestamp}

## Overall Performance

| Metric | Value |
|--------|-------|
| Median Duration | {format_duration(metrics.get('summary', {}).get('duration_percentiles', {}).get('p50', 0))} |
| P95 Duration | {format_duration(metrics.get('summary', {}).get('duration_percentiles', {}).get('p95', 0))} |
| P99 Duration | {format_duration(metrics.get('summary', {}).get('duration_percentiles', {}).get('p99', 0))} |
| Max Duration | {format_duration(metrics.get('summary', {}).get('duration_percentiles', {}).get('max', 0))} |

## Workflow Performance

"""

    workflows = metrics.get('workflows', {})
    for i, (workflow, data) in enumerate(
        sorted(workflows.items(), key=lambda x: x[1].get('total_runs', 0), reverse=True)[:10],
        1
    ):
        duration = data.get('duration', {})
        regression = data.get('regression_detection', {})

        markdown += f"### {i}. {workflow}\n\n"
        markdown += "| Metric | Value |\n"
        markdown += "|--------|-------|\n"
        markdown += f"| Runs | {data.get('total_runs', 0)} |\n"
        markdown += f"| Median | {format_duration(duration.get('p50', 0))} |\n"
        markdown += f"| P95 | {format_duration(duration.get('p95', 0))} |\n"
        markdown += f"| P99 | {format_duration(duration.get('p99', 0))} |\n"

        if regression.get('regression_detected'):
            status = "🔴 CRITICAL" if regression.get('severity') == 'critical' else "🟡 WARNING"
            markdown += f"| Regression | {status} (+{regression.get('increase_percent', 0)}%) |\n"

        markdown += "\n"

    with open(output_file, "w") as f:
        f.write(markdown)


def generate_health_dashboard(metrics: Dict, output_file: Path) -> None:
    """Generate health dashboard."""
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    # Calculate health score
    failure_rate = metrics.get('summary', {}).get('overall_failure_rate_percent', 0)
    disk_usage = metrics.get('system_health', {}).get('disk_usage_max_percent', 0)

    health_score = 100
    if failure_rate > 10:
        health_score -= 30
    elif failure_rate > 5:
        health_score -= 15
    elif failure_rate > 1:
        health_score -= 5

    if disk_usage > 90:
        health_score -= 30
    elif disk_usage > 80:
        health_score -= 15

    health_score = max(0, min(100, health_score))

    # Health status
    if health_score >= 90:
        health_status = "🟢 Healthy"
    elif health_score >= 70:
        health_status = "🟡 Degraded"
    else:
        health_status = "🔴 Critical"

    markdown = f"""# Health Dashboard

**Last Updated:** {timestamp}

## Overall Health

| Metric | Value |
|--------|-------|
| Health Score | {health_score}/100 |
| Status | {health_status} |

## Reliability Metrics

| Metric | Value |
|--------|-------|
| Failure Rate | {failure_rate:.1f}% |
| Success Count | {metrics.get('summary', {}).get('total_success', 0)} |
| Failure Count | {metrics.get('summary', {}).get('total_failure', 0)} |

## System Resources

| Metric | Value |
|--------|-------|
| Disk Usage | {metrics.get('system_health', {}).get('disk_usage_max_percent', 0):.1f}% |
| Memory (Peak) | {metrics.get('system_health', {}).get('memory_usage_max_kb', 0) / (1024*1024):.2f}GB |

## Workflow Health

"""

    workflows = metrics.get('workflows', {})
    for workflow, data in sorted(
        workflows.items(),
        key=lambda x: x[1].get('failure_count', 0),
        reverse=True
    )[:5]:
        failure_rate_wf = data.get('failure_rate_percent', 0)
        icon = "🔴" if failure_rate_wf > 10 else "🟡" if failure_rate_wf > 5 else "🟢"

        markdown += f"- **{icon} {workflow}**: {failure_rate_wf:.1f}% failure rate ({data.get('failure_count', 0)}/{data.get('total_runs', 0)} failed)\n"

    markdown += f"""

## Recommendations

"""

    if failure_rate > 10:
        markdown += "- 🔴 **Critical**: Job failure rate is high. Investigate recent failures in alert logs.\n"
    elif failure_rate > 5:
        markdown += "- 🟡 **Warning**: Job failure rate is above normal. Monitor for trending failures.\n"

    if disk_usage > 90:
        markdown += "- 🔴 **Critical**: Disk usage is critical. Clean up old artifacts and logs.\n"
    elif disk_usage > 80:
        markdown += "- 🟡 **Warning**: Disk usage is high. Consider cleanup or expansion.\n"

    with open(output_file, "w") as f:
        f.write(markdown)


def generate_summary_dashboard(metrics: Dict, alerts: Dict, output_file: Path) -> None:
    """Generate summary/index dashboard."""
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    markdown = f"""# CI/CD Observability Platform

**Last Updated:** {timestamp}

## Overview

This dashboard provides real-time visibility into GitHub Actions infrastructure health, performance, and cost.

## Quick Status

| Component | Status | Details |
|-----------|--------|---------|
| Job Success Rate | {"🟢" if metrics.get('summary', {}).get('overall_failure_rate_percent', 0) < 5 else "🟡" if metrics.get('summary', {}).get('overall_failure_rate_percent', 0) < 10 else "🔴"} | {100 - metrics.get('summary', {}).get('overall_failure_rate_percent', 0):.1f}% |
| System Health | {"🟢" if metrics.get('system_health', {}).get('disk_usage_max_percent', 0) < 80 else "🟡" if metrics.get('system_health', {}).get('disk_usage_max_percent', 0) < 90 else "🔴"} | {metrics.get('system_health', {}).get('disk_usage_max_percent', 0):.1f}% disk |
| Active Alerts | {"🟢" if alerts.get('critical_count', 0) == 0 else "🟡" if alerts.get('warning_count', 0) > 0 else "🔴"} | {alerts.get('critical_count', 0)} critical, {alerts.get('warning_count', 0)} warning |

## Dashboards

- **[Status Dashboard](dashboard-status.md)** - Queue depth, job success, runner status, active alerts
- **[Performance Dashboard](dashboard-performance.md)** - Duration trends, slowest workflows, regressions
- **[Health Dashboard](dashboard-health.md)** - System health, resource usage, reliability metrics

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Runs (24h) | {metrics.get('summary', {}).get('total_runs', 0)} |
| Success Rate | {100 - metrics.get('summary', {}).get('overall_failure_rate_percent', 0):.1f}% |
| P95 Job Duration | {format_duration(metrics.get('summary', {}).get('duration_percentiles', {}).get('p95', 0))} |
| Disk Usage | {metrics.get('system_health', {}).get('disk_usage_max_percent', 0):.1f}% |

## Recent Activity

- Total metrics collected: {metrics.get('metric_count', 0)}
- Active workflows: {len(metrics.get('workflows', {}))}
- Active alerts: {alerts.get('alert_count', 0)}

---

*For detailed troubleshooting, see runbooks in the [docs/runbooks](../runbooks/) directory.*
"""

    with open(output_file, "w") as f:
        f.write(markdown)


def main():
    parser = argparse.ArgumentParser(description="Generate observability dashboards")
    parser.add_argument(
        "--metrics-file",
        type=Path,
        help="Aggregated metrics JSON file"
    )
    parser.add_argument(
        "--alerts-file",
        type=Path,
        help="Alerts JSON file"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("audit-log/observability/dashboards"),
        help="Output directory for dashboards"
    )
    parser.add_argument(
        "--date",
        default=datetime.utcnow().strftime("%Y-%m-%d"),
        help="Date for dashboard file naming"
    )
    args = parser.parse_args()

    # Set default file paths if not provided
    if not args.metrics_file:
        args.metrics_file = Path(f"audit-log/observability/aggregated/aggregated-{args.date}.json")
    if not args.alerts_file:
        args.alerts_file = Path(f"audit-log/observability/alerts/alerts-{args.date}.json")

    print(f"\n📊 Dashboard Generator\n")
    print(f"Metrics file: {args.metrics_file}")
    print(f"Alerts file: {args.alerts_file}")

    # Load data
    print(f"Loading metrics...", end=" ", flush=True)
    metrics = load_json(args.metrics_file)
    print(f"✓ Complete")

    print(f"Loading alerts...", end=" ", flush=True)
    alerts = load_json(args.alerts_file)
    print(f"✓ Complete")

    # Generate dashboards
    args.output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Generating dashboards...", end=" ", flush=True)

    generate_status_dashboard(metrics, alerts, args.output_dir / "dashboard-status.md")
    generate_performance_dashboard(metrics, args.output_dir / "dashboard-performance.md")
    generate_health_dashboard(metrics, args.output_dir / "dashboard-health.md")
    generate_summary_dashboard(metrics, alerts, args.output_dir / "dashboard-summary.md")

    print(f"✓ Complete")

    # Print summary
    print(f"\n{'='*70}")
    print("DASHBOARD GENERATION SUMMARY")
    print(f"{'='*70}\n")

    print(f"📄 Status Dashboard: {args.output_dir / 'dashboard-status.md'}")
    print(f"📄 Performance Dashboard: {args.output_dir / 'dashboard-performance.md'}")
    print(f"📄 Health Dashboard: {args.output_dir / 'dashboard-health.md'}")
    print(f"📄 Summary Dashboard: {args.output_dir / 'dashboard-summary.md'}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
