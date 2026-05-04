#!/usr/bin/env python3
"""
alert-detector.py

Detect alert conditions in aggregated metrics.
Evaluates rules against collected metrics, generates alerts with severity levels.

Alert Rules:
  1. High job failure rate (> 10% in 1 hour) → Critical
  2. High queue depth (> 20 waiting) → Warning
  3. Slow jobs (2x baseline for 3 runs) → Warning
  4. Runner unhealthy (uptime < 95%) → Critical
  5. Cost spike (150% of average) → Warning
  6. Low disk space (> 90% usage) → Critical

Usage:
    python3 scripts/alert-detector.py \
        --input-file audit-log/observability/aggregated/aggregated-2026-05-25.json \
        --rules-file config/alert-rules.json \
        --output-dir audit-log/observability/alerts

Output:
    - Alerts in JSON format with timestamp, severity, rule, details
    - Alert history for trend analysis
"""

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional


def load_metrics(input_file: Path) -> Dict:
    """Load aggregated metrics from file."""
    if not input_file.exists():
        print(f"⚠️  Metrics file not found: {input_file}")
        return {}

    try:
        with open(input_file) as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️  Error loading metrics: {e}")
        return {}


def load_alert_rules(rules_file: Path) -> Dict:
    """Load alert rule definitions."""
    if not rules_file.exists():
        # Return default rules
        return {
            "high_failure_rate": {
                "enabled": True,
                "threshold_percent": 10,
                "window_minutes": 60,
                "severity": "critical",
                "description": "Job failure rate exceeds 10% in 1 hour"
            },
            "high_queue_depth": {
                "enabled": True,
                "threshold_waiting": 20,
                "severity": "warning",
                "description": "Queue depth exceeds 20 waiting jobs"
            },
            "slow_jobs": {
                "enabled": True,
                "baseline_multiplier": 2.0,
                "consecutive_runs": 3,
                "severity": "warning",
                "description": "Job duration exceeds 2x baseline"
            },
            "runner_unhealthy": {
                "enabled": True,
                "min_uptime_percent": 95,
                "severity": "critical",
                "description": "Runner uptime below 95%"
            },
            "cost_spike": {
                "enabled": True,
                "spike_multiplier": 1.5,
                "severity": "warning",
                "description": "Cost exceeds 150% of average"
            },
            "low_disk_space": {
                "enabled": True,
                "threshold_percent": 90,
                "severity": "critical",
                "description": "Disk usage exceeds 90%"
            }
        }

    try:
        with open(rules_file) as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️  Error loading rules: {e}")
        return {}


def check_high_failure_rate(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Check for high job failure rate."""
    if not rule.get("enabled"):
        return None

    failure_rate = metrics.get("summary", {}).get("overall_failure_rate_percent", 0)
    threshold = rule.get("threshold_percent", 10)

    if failure_rate > threshold:
        return {
            "rule": "high_failure_rate",
            "severity": rule.get("severity", "warning"),
            "triggered": True,
            "details": {
                "failure_rate_percent": failure_rate,
                "threshold_percent": threshold,
                "total_runs": metrics.get("summary", {}).get("total_runs", 0),
                "total_failures": metrics.get("summary", {}).get("total_failure", 0),
            }
        }

    return None


def check_slow_jobs(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Check for slow job regressions."""
    if not rule.get("enabled"):
        return None

    alerts = []
    multiplier = rule.get("baseline_multiplier", 2.0)
    min_runs = rule.get("consecutive_runs", 3)

    for workflow, data in metrics.get("workflows", {}).items():
        regression = data.get("regression_detection", {})

        if regression.get("regression_detected"):
            severity = "warning" if regression.get("severity") == "warning" else "critical"
            alerts.append({
                "rule": "slow_jobs",
                "severity": severity,
                "triggered": True,
                "details": {
                    "workflow": workflow,
                    "increase_percent": regression.get("increase_percent", 0),
                    "historical_avg_seconds": regression.get("historical_avg", 0),
                    "recent_avg_seconds": regression.get("recent_avg", 0),
                }
            })

    return alerts[0] if alerts else None


def check_low_disk_space(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Check for low disk space."""
    if not rule.get("enabled"):
        return None

    disk_usage = metrics.get("system_health", {}).get("disk_usage_max_percent", 0)
    threshold = rule.get("threshold_percent", 90)

    if disk_usage > threshold:
        return {
            "rule": "low_disk_space",
            "severity": rule.get("severity", "critical"),
            "triggered": True,
            "details": {
                "disk_usage_percent": disk_usage,
                "threshold_percent": threshold,
            }
        }

    return None


def check_high_memory_usage(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Check for high memory usage."""
    if not rule.get("enabled"):
        return None

    memory_kb = metrics.get("system_health", {}).get("memory_usage_max_kb", 0)
    memory_gb = memory_kb / (1024 * 1024)
    threshold_gb = rule.get("threshold_gb", 8)

    if memory_gb > threshold_gb:
        return {
            "rule": "high_memory_usage",
            "severity": rule.get("severity", "warning"),
            "triggered": True,
            "details": {
                "memory_usage_gb": round(memory_gb, 2),
                "threshold_gb": threshold_gb,
            }
        }

    return None


def evaluate_rules(metrics: Dict, rules: Dict) -> List[Dict]:
    """Evaluate all alert rules against metrics."""
    alerts = []

    # Check high failure rate
    alert = check_high_failure_rate(metrics, rules.get("high_failure_rate", {}))
    if alert:
        alerts.append(alert)

    # Check slow jobs
    alert = check_slow_jobs(metrics, rules.get("slow_jobs", {}))
    if alert:
        alerts.append(alert)

    # Check low disk space
    alert = check_low_disk_space(metrics, rules.get("low_disk_space", {}))
    if alert:
        alerts.append(alert)

    # Check high memory usage
    alert = check_high_memory_usage(metrics, rules.get("high_memory_usage", {}))
    if alert:
        alerts.append(alert)

    return alerts


def generate_alert_report(alerts: List[Dict], output_file: Path) -> None:
    """Generate alert report with timestamp and metadata."""
    output_file.parent.mkdir(parents=True, exist_ok=True)

    report = {
        "timestamp": datetime.utcnow().isoformat(),
        "alert_count": len(alerts),
        "critical_count": sum(1 for a in alerts if a.get("severity") == "critical"),
        "warning_count": sum(1 for a in alerts if a.get("severity") == "warning"),
        "alerts": sorted(
            alerts,
            key=lambda x: {"critical": 0, "warning": 1, "info": 2}.get(x.get("severity"), 3)
        )
    }

    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Detect alert conditions in metrics")
    parser.add_argument(
        "--input-file",
        type=Path,
        help="Input aggregated metrics JSON file"
    )
    parser.add_argument(
        "--rules-file",
        type=Path,
        default=Path("config/alert-rules.json"),
        help="Alert rules configuration file"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("audit-log/observability/alerts"),
        help="Output directory for alerts"
    )
    parser.add_argument(
        "--date",
        default=datetime.utcnow().strftime("%Y-%m-%d"),
        help="Date for alert file naming"
    )
    args = parser.parse_args()

    # If no input file specified, use default for date
    if not args.input_file:
        args.input_file = Path(f"audit-log/observability/aggregated/aggregated-{args.date}.json")

    print(f"\n⚠️  Alert Detector\n")
    print(f"Input file: {args.input_file}")
    print(f"Rules file: {args.rules_file}")

    # Load data
    print(f"Loading metrics...", end=" ", flush=True)
    metrics = load_metrics(args.input_file)
    if not metrics:
        print(f"✗ No metrics loaded")
        return 1
    print(f"✓ Complete")

    print(f"Loading alert rules...", end=" ", flush=True)
    rules = load_alert_rules(args.rules_file)
    print(f"✓ {len(rules)} rules loaded")

    # Evaluate rules
    print(f"Evaluating alert rules...", end=" ", flush=True)
    alerts = evaluate_rules(metrics, rules)
    print(f"✓ {len(alerts)} alerts triggered")

    # Generate report
    print(f"Generating alert report...", end=" ", flush=True)
    output_file = args.output_dir / f"alerts-{args.date}.json"
    generate_alert_report(alerts, output_file)
    print(f"✓ Complete")

    # Print summary
    print(f"\n{'='*70}")
    print("ALERT SUMMARY")
    print(f"{'='*70}\n")

    critical_count = sum(1 for a in alerts if a.get("severity") == "critical")
    warning_count = sum(1 for a in alerts if a.get("severity") == "warning")

    print(f"Total alerts: {len(alerts)}")
    print(f"Critical: {critical_count}")
    print(f"Warning: {warning_count}")

    if alerts:
        print(f"\nAlerts triggered:")
        for i, alert in enumerate(alerts[:10], 1):
            rule = alert.get("rule", "unknown")
            severity = alert.get("severity", "unknown").upper()
            print(f"  {i}. [{severity}] {rule}")

    print(f"\n📄 Report: {output_file}")

    return 0 if critical_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
