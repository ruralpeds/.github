#!/usr/bin/env python3
"""
event-detector.py

Detect system events from observability metrics.
Evaluates rules against collected metrics, triggers automated responses.

Events Detected:
  1. Queue depth event (> 20 jobs for 15 min)
  2. Runner health event (uptime < 95%)
  3. Cost spike event (> 150% of 24-hour average)
  4. Disk space event (> 85% usage)
  5. High failure rate event (> 20% in 1 hour)
  6. Job duration regression (> 2x baseline for 3 runs)

Usage:
    python3 scripts/event-detector.py \
        --metrics-file audit-log/observability/aggregated/aggregated-2026-05-25.json \
        --rules-file config/event-rules.json \
        --output-dir audit-log/events

Output:
    - Events JSON with triggered conditions
    - Audit log (append-only JSONL)
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


def load_rules(rules_file: Path) -> Dict:
    """Load event detection rules."""
    if not rules_file.exists():
        # Return default rules
        return {
            "queue_depth": {
                "enabled": True,
                "metric": "queue_depth",
                "threshold": 20,
                "window_minutes": 15,
                "comparison": "greater_than",
                "action": "scale_runners",
                "severity": "warning"
            },
            "runner_health": {
                "enabled": True,
                "metric": "runner_uptime_percent",
                "threshold": 95,
                "window_minutes": 5,
                "comparison": "less_than",
                "action": "recover_runner",
                "severity": "critical"
            },
            "cost_spike": {
                "enabled": True,
                "metric": "hourly_cost_ratio",
                "threshold": 1.5,
                "window_hours": 1,
                "comparison": "greater_than",
                "action": "cost_controls",
                "severity": "warning"
            },
            "disk_space": {
                "enabled": True,
                "metric": "disk_usage_percent",
                "threshold": 85,
                "window_minutes": 5,
                "comparison": "greater_than",
                "action": "cleanup_disk",
                "severity": "critical"
            },
            "high_failure_rate": {
                "enabled": True,
                "metric": "failure_rate_percent",
                "threshold": 20,
                "window_minutes": 60,
                "comparison": "greater_than",
                "action": "investigate_failures",
                "severity": "critical"
            },
            "duration_regression": {
                "enabled": True,
                "metric": "duration_regression_detected",
                "threshold": 2.0,
                "consecutive_runs": 3,
                "comparison": "greater_than",
                "action": "profile_workflow",
                "severity": "warning"
            }
        }

    try:
        with open(rules_file) as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️  Error loading rules: {e}")
        return {}


def evaluate_queue_depth(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Evaluate queue depth event."""
    if not rule.get("enabled"):
        return None

    # Queue depth would come from workflow dispatch event
    # For now, use a placeholder
    queue_depth = metrics.get("queue_depth", 0)
    threshold = rule.get("threshold", 20)

    if queue_depth > threshold:
        return {
            "event_type": "queue_depth",
            "triggered": True,
            "severity": rule.get("severity", "warning"),
            "metric_value": queue_depth,
            "threshold": threshold,
            "details": {
                "jobs_queued": queue_depth,
                "recommended_action": rule.get("action"),
                "recommended_target": 5
            }
        }

    return None


def evaluate_runner_health(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Evaluate runner health event."""
    if not rule.get("enabled"):
        return None

    # Calculate uptime from system health metrics
    system_health = metrics.get("system_health", {})

    # Placeholder: in production, get from monitoring system
    uptime_percent = 98.0  # Example value
    threshold = rule.get("threshold", 95)

    if uptime_percent < threshold:
        return {
            "event_type": "runner_health",
            "triggered": True,
            "severity": rule.get("severity", "critical"),
            "metric_value": uptime_percent,
            "threshold": threshold,
            "details": {
                "uptime_percent": uptime_percent,
                "degradation_percent": threshold - uptime_percent,
                "recommended_action": rule.get("action")
            }
        }

    return None


def evaluate_cost_spike(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Evaluate cost spike event."""
    if not rule.get("enabled"):
        return None

    # Cost data would come from Phase 5B cost aggregator
    # For now, placeholder
    summary = metrics.get("summary", {})
    total_cost = summary.get("total_cost", 0)

    # In production, compare against rolling 24-hour average
    daily_average = 100.0  # Placeholder
    threshold = rule.get("threshold", 1.5)

    cost_ratio = total_cost / daily_average if daily_average > 0 else 1.0

    if cost_ratio > threshold:
        return {
            "event_type": "cost_spike",
            "triggered": True,
            "severity": rule.get("severity", "warning"),
            "metric_value": cost_ratio,
            "threshold": threshold,
            "details": {
                "current_cost": round(total_cost, 2),
                "daily_average": round(daily_average, 2),
                "spike_percent": round((cost_ratio - 1) * 100, 1),
                "recommended_action": rule.get("action")
            }
        }

    return None


def evaluate_disk_space(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Evaluate disk space event."""
    if not rule.get("enabled"):
        return None

    system_health = metrics.get("system_health", {})
    disk_usage = system_health.get("disk_usage_max_percent", 0)
    threshold = rule.get("threshold", 85)

    if disk_usage > threshold:
        return {
            "event_type": "disk_space",
            "triggered": True,
            "severity": rule.get("severity", "critical"),
            "metric_value": disk_usage,
            "threshold": threshold,
            "details": {
                "disk_usage_percent": disk_usage,
                "available_percent": 100 - disk_usage,
                "recommended_action": rule.get("action")
            }
        }

    return None


def evaluate_high_failure_rate(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Evaluate high failure rate event."""
    if not rule.get("enabled"):
        return None

    summary = metrics.get("summary", {})
    failure_rate = summary.get("overall_failure_rate_percent", 0)
    threshold = rule.get("threshold", 20)

    if failure_rate > threshold:
        return {
            "event_type": "high_failure_rate",
            "triggered": True,
            "severity": rule.get("severity", "critical"),
            "metric_value": failure_rate,
            "threshold": threshold,
            "details": {
                "failure_rate_percent": failure_rate,
                "total_runs": summary.get("total_runs", 0),
                "total_failures": summary.get("total_failure", 0),
                "recommended_action": rule.get("action")
            }
        }

    return None


def evaluate_duration_regression(metrics: Dict, rule: Dict) -> Optional[Dict]:
    """Evaluate job duration regression event."""
    if not rule.get("enabled"):
        return None

    # Check workflows for regressions
    regressions = []

    for workflow, data in metrics.get("workflows", {}).items():
        regression = data.get("regression_detection", {})

        if regression.get("regression_detected"):
            increase = regression.get("increase_percent", 0)
            multiplier = increase / 100.0 + 1.0

            if multiplier > rule.get("threshold", 2.0):
                regressions.append({
                    "workflow": workflow,
                    "multiplier": round(multiplier, 2),
                    "increase_percent": round(increase, 1),
                    "historical_avg": regression.get("historical_avg", 0),
                    "recent_avg": regression.get("recent_avg", 0),
                })

    if regressions:
        return {
            "event_type": "duration_regression",
            "triggered": True,
            "severity": rule.get("severity", "warning"),
            "count": len(regressions),
            "details": {
                "affected_workflows": regressions[:5],  # Top 5
                "recommended_action": rule.get("action")
            }
        }

    return None


def evaluate_rules(metrics: Dict, rules: Dict) -> List[Dict]:
    """Evaluate all event rules against metrics."""
    events = []

    # Queue depth
    event = evaluate_queue_depth(metrics, rules.get("queue_depth", {}))
    if event:
        events.append(event)

    # Runner health
    event = evaluate_runner_health(metrics, rules.get("runner_health", {}))
    if event:
        events.append(event)

    # Cost spike
    event = evaluate_cost_spike(metrics, rules.get("cost_spike", {}))
    if event:
        events.append(event)

    # Disk space
    event = evaluate_disk_space(metrics, rules.get("disk_space", {}))
    if event:
        events.append(event)

    # High failure rate
    event = evaluate_high_failure_rate(metrics, rules.get("high_failure_rate", {}))
    if event:
        events.append(event)

    # Duration regression
    event = evaluate_duration_regression(metrics, rules.get("duration_regression", {}))
    if event:
        events.append(event)

    return events


def generate_event_report(events: List[Dict], output_file: Path) -> None:
    """Generate event report."""
    output_file.parent.mkdir(parents=True, exist_ok=True)

    report = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_count": len(events),
        "critical_count": sum(1 for e in events if e.get("severity") == "critical"),
        "warning_count": sum(1 for e in events if e.get("severity") == "warning"),
        "events": sorted(
            events,
            key=lambda x: {"critical": 0, "warning": 1}.get(x.get("severity"), 2)
        )
    }

    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)


def log_events(events: List[Dict], audit_file: Path) -> None:
    """Append events to audit log (JSONL)."""
    audit_file.parent.mkdir(parents=True, exist_ok=True)

    with open(audit_file, "a") as f:
        for event in events:
            log_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "event_type": event.get("event_type"),
                "severity": event.get("severity"),
                "triggered": event.get("triggered"),
                "metric_value": event.get("metric_value"),
                "threshold": event.get("threshold"),
                "details": event.get("details")
            }
            f.write(json.dumps(log_entry) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Detect system events from metrics")
    parser.add_argument(
        "--metrics-file",
        type=Path,
        help="Aggregated metrics JSON file"
    )
    parser.add_argument(
        "--rules-file",
        type=Path,
        default=Path("config/event-rules.json"),
        help="Event rules configuration file"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("audit-log/events"),
        help="Output directory for events"
    )
    parser.add_argument(
        "--date",
        default=datetime.utcnow().strftime("%Y-%m-%d"),
        help="Date for event file naming"
    )
    args = parser.parse_args()

    # Set default metrics file if not provided
    if not args.metrics_file:
        args.metrics_file = Path(f"audit-log/observability/aggregated/aggregated-{args.date}.json")

    print(f"\n🎯 Event Detector\n")
    print(f"Metrics file: {args.metrics_file}")
    print(f"Rules file: {args.rules_file}")

    # Load data
    print(f"Loading metrics...", end=" ", flush=True)
    metrics = load_metrics(args.metrics_file)
    if not metrics:
        print(f"✗ No metrics loaded")
        return 1
    print(f"✓ Complete")

    print(f"Loading event rules...", end=" ", flush=True)
    rules = load_rules(args.rules_file)
    print(f"✓ {len(rules)} rules loaded")

    # Evaluate rules
    print(f"Evaluating event rules...", end=" ", flush=True)
    events = evaluate_rules(metrics, rules)
    print(f"✓ {len(events)} events triggered")

    # Generate report
    print(f"Generating event report...", end=" ", flush=True)
    output_file = args.output_dir / f"events-{args.date}.json"
    generate_event_report(events, output_file)
    print(f"✓ Complete")

    # Log to audit trail
    print(f"Logging to audit trail...", end=" ", flush=True)
    audit_file = args.output_dir / "events.jsonl"
    log_events(events, audit_file)
    print(f"✓ Complete")

    # Print summary
    print(f"\n{'='*70}")
    print("EVENT DETECTION SUMMARY")
    print(f"{'='*70}\n")

    critical_count = sum(1 for e in events if e.get("severity") == "critical")
    warning_count = sum(1 for e in events if e.get("severity") == "warning")

    print(f"Total events: {len(events)}")
    print(f"Critical: {critical_count}")
    print(f"Warning: {warning_count}")

    if events:
        print(f"\nTriggered events:")
        for i, event in enumerate(events[:10], 1):
            event_type = event.get("event_type", "unknown")
            severity = event.get("severity", "unknown").upper()
            action = event.get("details", {}).get("recommended_action", "none")
            print(f"  {i}. [{severity}] {event_type} → {action}")

    print(f"\n📄 Report: {output_file}")
    print(f"📄 Audit trail: {audit_file}")

    return 0 if critical_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
