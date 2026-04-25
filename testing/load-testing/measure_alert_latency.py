#!/usr/bin/env python3
"""
Alert Latency Measurement
Measures time from observation submission to alert firing.

Compliance: IEC 62304 incident response validation, FDA 510(k) clinical safety
Purpose: Verify system meets response time SLAs:
         - Critical alerts (P1): <60 seconds (hypoglycemia, sepsis, respiratory failure)
         - High alerts (P2): <180 seconds (severe hypertension, arrhythmia)
         - Medium alerts (P3): <300 seconds (elevated heart rate, mild hypoxemia)

Version: 1.0 (April 25, 2026)
"""

import json
import time
import requests
import sys
from datetime import datetime
from typing import List, Dict, Tuple
from dataclasses import dataclass
from pathlib import Path
import statistics


# ============================================================================
# ALERT LATENCY TEST CASES
# ============================================================================

@dataclass
class AlertLatencyTest:
    """Single alert latency measurement."""
    scenario_name: str
    alert_type: str
    severity: str  # P1 (critical), P2 (high), P3 (medium)
    vital_thresholds: Dict[str, float]  # Vital → trigger value
    expected_alert_name: str
    expected_response_sla_seconds: int
    observation_payload: Dict

    def to_fhir_observation(self) -> Dict:
        """Generate FHIR Observation with vital values."""
        return {
            "resourceType": "Observation",
            "status": "final",
            "category": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    "code": "vital-signs"
                }]
            }],
            "effectiveDateTime": datetime.now().isoformat() + "Z",
            "valueQuantity": {
                "value": list(self.vital_thresholds.values())[0],
                "unit": "mg/dL"  # Example
            }
        }


# ============================================================================
# TEST SCENARIOS
# ============================================================================

def get_alert_latency_tests() -> List[AlertLatencyTest]:
    """Return all alert latency test scenarios."""
    return [
        # P1 CRITICAL (60 second SLA)
        AlertLatencyTest(
            scenario_name="Severe Hypoglycemia",
            alert_type="HYPOGLYCEMIA",
            severity="P1",
            vital_thresholds={"glucose": 35},  # <40 is critical
            expected_alert_name="SevereHypoglycemiaDetected",
            expected_response_sla_seconds=60,
            observation_payload={}
        ),

        AlertLatencyTest(
            scenario_name="Hyperglycemic Crisis",
            alert_type="HYPERGLYCEMIA",
            severity="P1",
            vital_thresholds={"glucose": 380},  # >350 indicates crisis
            expected_alert_name="HyperglycemicCrisisDetected",
            expected_response_sla_seconds=60,
            observation_payload={}
        ),

        AlertLatencyTest(
            scenario_name="Sepsis Detection",
            alert_type="SEPSIS",
            severity="P1",
            vital_thresholds={
                "heart_rate": 125,  # >90 SIRS
                "respiratory_rate": 28,  # >20
                "temperature": 39.1,  # >38
                "white_blood_cells": 18.5  # >11
            },
            expected_alert_name="SepsisAlertTriggered",
            expected_response_sla_seconds=60,
            observation_payload={}
        ),

        AlertLatencyTest(
            scenario_name="Respiratory Failure",
            alert_type="RESPIRATORY",
            severity="P1",
            vital_thresholds={
                "oxygen_saturation": 82,  # <85%
                "respiratory_rate": 7  # <8
            },
            expected_alert_name="RespiratoryFailureDetected",
            expected_response_sla_seconds=60,
            observation_payload={}
        ),

        AlertLatencyTest(
            scenario_name="Cardiac Arrhythmia",
            alert_type="ARRHYTHMIA",
            severity="P1",
            vital_thresholds={"heart_rate": 160},  # Rapid irregular
            expected_alert_name="IrregularHeartRhythmDetected",
            expected_response_sla_seconds=60,
            observation_payload={}
        ),

        AlertLatencyTest(
            scenario_name="Severe Hypertension",
            alert_type="HYPERTENSION",
            severity="P1",
            vital_thresholds={
                "blood_pressure_systolic": 215,  # >200
                "blood_pressure_diastolic": 125  # >120
            },
            expected_alert_name="SevereHypertensionDetected",
            expected_response_sla_seconds=60,
            observation_payload={}
        ),

        # P2 HIGH (180 second SLA)
        AlertLatencyTest(
            scenario_name="High Memory Usage",
            alert_type="RESOURCE",
            severity="P2",
            vital_thresholds={},
            expected_alert_name="HighMemoryUsage",
            expected_response_sla_seconds=180,
            observation_payload={}
        ),

        AlertLatencyTest(
            scenario_name="Elevated Heart Rate",
            alert_type="TACHYCARDIA",
            severity="P2",
            vital_thresholds={"heart_rate": 110},  # >100, not critical
            expected_alert_name="ElevatedHeartRate",
            expected_response_sla_seconds=180,
            observation_payload={}
        ),

        # P3 MEDIUM (300 second SLA)
        AlertLatencyTest(
            scenario_name="Mild Hypoxemia",
            alert_type="HYPOXEMIA",
            severity="P3",
            vital_thresholds={"oxygen_saturation": 92},  # 90-94%
            expected_alert_name="MildHypoxemiaDetected",
            expected_response_sla_seconds=300,
            observation_payload={}
        ),
    ]


# ============================================================================
# LATENCY MEASUREMENT
# ============================================================================

class AlertLatencyMeasurer:
    """Measure alert response latencies."""

    def __init__(self, api_url: str = "http://localhost:8080", api_key: str = ""):
        self.api_url = api_url
        self.headers = {
            "Content-Type": "application/fhir+json",
            "Authorization": f"Bearer {api_key}" if api_key else None
        }
        self.results = []

    def measure_alert_latency(self, test: AlertLatencyTest) -> Tuple[float, bool, str]:
        """
        Measure latency from observation POST to alert fired.

        Returns: (latency_seconds, passed_sla, status_message)
        """
        try:
            # Step 1: Record observation submission time
            submission_time = time.time()

            # Step 2: POST observation to API
            observation = test.to_fhir_observation()
            response = requests.post(
                f"{self.api_url}/fhir/Observation",
                json=observation,
                headers=self.headers,
                timeout=10
            )

            if response.status_code not in [200, 201]:
                return 0.0, False, f"Observation POST failed: {response.status_code}"

            observation_id = response.json().get("id", "unknown")

            # Step 3: Poll for alert (check every 100ms for up to 5 minutes)
            alert_fired_time = None
            max_poll_time = 300  # 5 minutes max
            poll_interval = 0.1  # 100ms

            start_poll = time.time()
            while time.time() - start_poll < max_poll_time:
                # Check if alert was fired (query alert logs or metrics)
                alert_response = requests.get(
                    f"{self.api_url}/api/alerts?observation_id={observation_id}",
                    headers=self.headers,
                    timeout=5
                )

                if alert_response.status_code == 200:
                    alerts = alert_response.json().get("alerts", [])
                    if alerts and alerts[0].get("name") == test.expected_alert_name:
                        alert_fired_time = time.time()
                        break

                time.sleep(poll_interval)

            # Step 4: Calculate latency
            if alert_fired_time is None:
                return max_poll_time, False, "Alert not fired within timeout"

            latency_seconds = alert_fired_time - submission_time
            passed_sla = latency_seconds <= test.expected_response_sla_seconds

            status = "✅ PASS" if passed_sla else "❌ FAIL"
            return latency_seconds, passed_sla, f"{status} ({latency_seconds:.2f}s vs {test.expected_response_sla_seconds}s SLA)"

        except requests.RequestException as e:
            return 0.0, False, f"API error: {e}"
        except Exception as e:
            return 0.0, False, f"Error: {e}"

    def run_all_tests(self) -> List[Dict]:
        """Run all alert latency tests."""
        tests = get_alert_latency_tests()
        results = []

        print("\n" + "=" * 70)
        print("ALERT LATENCY MEASUREMENT")
        print("=" * 70)

        for test in tests:
            print(f"\n📊 {test.scenario_name} ({test.severity})")
            latency, passed, message = self.measure_alert_latency(test)

            result = {
                "scenario": test.scenario_name,
                "alert_type": test.alert_type,
                "severity": test.severity,
                "latency_seconds": round(latency, 2),
                "sla_seconds": test.expected_response_sla_seconds,
                "passed": passed,
                "message": message
            }

            results.append(result)
            print(f"   {message}")

        return results

    def generate_summary(self, results: List[Dict]) -> Dict:
        """Generate latency summary."""
        p1_results = [r for r in results if r["severity"] == "P1"]
        p2_results = [r for r in results if r["severity"] == "P2"]
        p3_results = [r for r in results if r["severity"] == "P3"]

        def compute_stats(subset):
            if not subset:
                return None
            latencies = [r["latency_seconds"] for r in subset]
            return {
                "avg": round(statistics.mean(latencies), 2),
                "median": round(statistics.median(latencies), 2),
                "p95": round(sorted(latencies)[int(len(latencies) * 0.95)], 2),
                "p99": round(sorted(latencies)[int(len(latencies) * 0.99)], 2),
                "passed": sum(1 for r in subset if r["passed"]),
                "failed": sum(1 for r in subset if not r["passed"])
            }

        return {
            "total_tests": len(results),
            "passed": sum(1 for r in results if r["passed"]),
            "failed": sum(1 for r in results if not r["passed"]),
            "p1_critical": compute_stats(p1_results),
            "p2_high": compute_stats(p2_results),
            "p3_medium": compute_stats(p3_results),
            "all_results": results
        }


# ============================================================================
# REPORT GENERATION
# ============================================================================

def generate_latency_report(summary: Dict, output_file: str):
    """Generate alert latency report."""
    content = f"""
# Alert Latency Measurement Report

**Generated:** {datetime.now().isoformat()}

## Summary

| Category | Passed | Failed | Total |
|----------|--------|--------|-------|
| **P1 Critical** | {summary['p1_critical']['passed'] if summary['p1_critical'] else 0} | {summary['p1_critical']['failed'] if summary['p1_critical'] else 0} | {len([r for r in summary['all_results'] if r['severity'] == 'P1'])} |
| **P2 High** | {summary['p2_high']['passed'] if summary['p2_high'] else 0} | {summary['p2_high']['failed'] if summary['p2_high'] else 0} | {len([r for r in summary['all_results'] if r['severity'] == 'P2'])} |
| **P3 Medium** | {summary['p3_medium']['passed'] if summary['p3_medium'] else 0} | {summary['p3_medium']['failed'] if summary['p3_medium'] else 0} | {len([r for r in summary['all_results'] if r['severity'] == 'P3'])} |
| **TOTAL** | {summary['passed']} | {summary['failed']} | {summary['total_tests']} |

## P1 Critical Alerts (60 second SLA)

"""
    if summary['p1_critical']:
        content += f"""
**Statistics:**
- Average latency: {summary['p1_critical']['avg']}s
- Median latency: {summary['p1_critical']['median']}s
- p95 latency: {summary['p1_critical']['p95']}s
- p99 latency: {summary['p1_critical']['p99']}s

"""

    content += "\n## Detailed Results\n\n"
    for result in summary['all_results']:
        status = "✅ PASS" if result['passed'] else "❌ FAIL"
        content += f"### {result['scenario']} ({result['severity']})\n"
        content += f"- Alert Type: {result['alert_type']}\n"
        content += f"- Latency: {result['latency_seconds']}s (SLA: {result['sla_seconds']}s)\n"
        content += f"- Status: {status}\n\n"

    with open(output_file, 'w') as f:
        f.write(content)

    print(f"\n✅ Report saved to {output_file}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main alert latency measurement."""
    api_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
    api_key = sys.argv[2] if len(sys.argv) > 2 else ""
    output_file = "alert_latency_report.md"

    measurer = AlertLatencyMeasurer(api_url, api_key)
    results = measurer.run_all_tests()
    summary = measurer.generate_summary(results)

    # Print summary
    print(f"\n" + "=" * 70)
    print("ALERT LATENCY SUMMARY")
    print("=" * 70)
    print(f"\nTotal Tests: {summary['total_tests']}")
    print(f"Passed: {summary['passed']}")
    print(f"Failed: {summary['failed']}")

    if summary['p1_critical']:
        print(f"\nP1 Critical (60s SLA):")
        print(f"  Average: {summary['p1_critical']['avg']}s")
        print(f"  Median: {summary['p1_critical']['median']}s")
        print(f"  p95: {summary['p1_critical']['p95']}s")

    # Generate report
    generate_latency_report(summary, output_file)

    return 0 if summary['failed'] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
