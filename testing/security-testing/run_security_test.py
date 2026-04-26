#!/usr/bin/env python3
"""
Security Testing Framework: OWASP Top 10 & FDA Security Validation
Comprehensive penetration testing before FDA 510(k) submission.

Compliance: OWASP Top 10 (2021), FDA 510(k), HIPAA §164.312, CFR Part 11
Purpose: Identify and verify remediation of critical security vulnerabilities
Version: 1.0 (April 25, 2026)
"""

import json
import sys
import os
import time
from pathlib import Path
from typing import Dict
from dataclasses import dataclass

from owasp_top_10_tests import OWASPTester
from api_security_tests import APISecurityTester
from database_security_tests import DatabaseSecurityTester


@dataclass
class SecurityTestConfig:
    """Security testing configuration."""
    # API
    api_url: str = os.getenv("PLATFORM_API_URL", "http://localhost:8080")
    api_key: str = os.getenv("PLATFORM_API_KEY", "")

    # Database
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "5432"))
    db_name: str = os.getenv("DB_NAME", "audit_trail")
    db_user: str = os.getenv("DB_USER", "audit_trail_user")
    db_password: str = os.getenv("DB_PASSWORD", "")


class SecurityTestExecutor:
    """Execute comprehensive security testing."""

    def __init__(self, config: SecurityTestConfig):
        self.config = config
        self.results = {
            "timestamp": time.time(),
            "owasp_top_10": None,
            "api_security": None,
            "database_security": None,
            "summary": {}
        }

    def run_all_tests(self) -> Dict:
        """Run all security tests."""
        print("\n" + "=" * 70)
        print("COMPREHENSIVE SECURITY TESTING FRAMEWORK")
        print("FDA 510(k) Medical Device Platform")
        print("=" * 70)

        # Run OWASP Top 10 tests
        print("\n" + "▶" * 35)
        print("PHASE 1: OWASP TOP 10 TESTING")
        print("▶" * 35)

        owasp_tester = OWASPTester(self.config.api_url, self.config.api_key, {})
        owasp_results = owasp_tester.run_all_tests()
        self.results["owasp_top_10"] = owasp_results

        # Run API security tests
        print("\n" + "▶" * 35)
        print("PHASE 2: API SECURITY TESTING")
        print("▶" * 35)

        api_tester = APISecurityTester(self.config.api_url, self.config.api_key)
        api_results = api_tester.run_all_tests()
        self.results["api_security"] = api_results

        # Run database security tests
        print("\n" + "▶" * 35)
        print("PHASE 3: DATABASE SECURITY TESTING")
        print("▶" * 35)

        db_tester = DatabaseSecurityTester(
            self.config.db_host,
            self.config.db_port,
            self.config.db_name,
            self.config.db_user,
            self.config.db_password
        )
        db_results = db_tester.run_all_tests()
        self.results["database_security"] = db_results

        # Generate summary
        self._generate_summary()

        return self.results

    def _generate_summary(self):
        """Generate summary of all security test results."""
        print("\n" + "=" * 70)
        print("SECURITY TEST SUMMARY")
        print("=" * 70)

        owasp = self.results["owasp_top_10"]
        api = self.results["api_security"]
        db = self.results["database_security"]

        total_tests = (owasp["total_tests"] + api["total_tests"] + db["total_tests"])
        total_passed = (owasp["passed"] + api["passed"] + db["passed"])
        total_vulnerable = owasp["vulnerable"] + (api["total_tests"] - api["passed"]) + (db["total_tests"] - db["passed"])

        print(f"\n📊 OVERALL RESULTS")
        print(f"  Total Tests: {total_tests}")
        print(f"  ✅ Passed: {total_passed}")
        print(f"  ❌ Failed: {total_vulnerable}")
        print(f"  Success Rate: {100 * total_passed / total_tests:.1f}%")

        print(f"\n📋 OWASP TOP 10")
        print(f"  Total Tests: {owasp['total_tests']}")
        print(f"  ✅ Passed: {owasp['passed']}")
        print(f"  ❌ Vulnerable: {owasp['vulnerable']}")

        print(f"\n📋 API SECURITY")
        print(f"  Total Tests: {api['total_tests']}")
        print(f"  ✅ Passed: {api['passed']}")
        print(f"  ❌ Failed: {api['total_tests'] - api['passed']}")

        print(f"\n📋 DATABASE SECURITY")
        print(f"  Total Tests: {db['total_tests']}")
        print(f"  ✅ Passed: {db['passed']}")
        print(f"  ❌ Failed: {db['total_tests'] - db['passed']}")

        # Critical vulnerabilities
        critical_vulns = [
            t for t in owasp["tests"]
            if t["risk_level"] == "CRITICAL" and t["is_vulnerable"]
        ]

        if critical_vulns:
            print(f"\n🚨 CRITICAL VULNERABILITIES FOUND ({len(critical_vulns)})")
            for vuln in critical_vulns[:5]:  # Show first 5
                print(f"  - {vuln['test_name']}")
                print(f"    CWE: {vuln['cwe_id']}")
                print(f"    Remediation: {vuln['remediation']}")

        # Recommendations
        print("\n" + "=" * 70)
        print("RECOMMENDATIONS")
        print("=" * 70)

        if total_vulnerable == 0:
            print("✅ All security tests PASSED - Ready for FDA submission")
            self.results["summary"]["status"] = "PASS"
            self.results["summary"]["ready_for_submission"] = True
        elif total_vulnerable <= 3:
            print("⚠️  Minor issues found - Remediate before submission")
            self.results["summary"]["status"] = "REVIEW"
            self.results["summary"]["ready_for_submission"] = False
        else:
            print("❌ Critical issues found - Remediation required before submission")
            self.results["summary"]["status"] = "FAIL"
            self.results["summary"]["ready_for_submission"] = False

        print(f"\nTotal Vulnerabilities: {total_vulnerable}")
        print("Next Steps:")
        print("  1. Review detailed test results in security_test_results.json")
        print("  2. Address critical vulnerabilities first")
        print("  3. Re-run security tests after fixes")
        print("  4. Archive results for FDA audit trail")

    def save_results(self, output_dir: str) -> str:
        """Save security test results to file."""
        results_file = f"{output_dir}/security_test_results.json"

        with open(results_file, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n✅ Results saved to {results_file}")
        return results_file


def main():
    """Main security testing orchestration."""
    if len(sys.argv) < 2:
        output_dir = "security_test_results"
    else:
        output_dir = sys.argv[1]

    os.makedirs(output_dir, exist_ok=True)

    config = SecurityTestConfig()

    executor = SecurityTestExecutor(config)
    results = executor.run_all_tests()

    executor.save_results(output_dir)

    # Determine exit code
    if results["summary"].get("status") == "PASS":
        return 0
    else:
        return 1


if __name__ == "__main__":
    sys.exit(main())
