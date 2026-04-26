#!/usr/bin/env python3
"""
API Security Testing Framework
Validates authentication, authorization, and API-specific security controls.

Compliance: OWASP API Top 10, FDA 510(k) security, HIPAA §164.312
Purpose: Comprehensive API security validation before FDA submission
Version: 1.0 (April 25, 2026)
"""

import requests
import json
import jwt
import time
from typing import Dict, List, Tuple
from dataclasses import dataclass
from urllib.parse import urljoin


@dataclass
class APISecurityTest:
    """API security test result."""
    test_id: str
    test_name: str
    endpoint: str
    method: str
    risk_level: str
    description: str
    result: str = "PENDING"
    passed: bool = False
    details: str = ""


class APISecurityTester:
    """Test API security controls."""

    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.api_key = api_key
        self.test_results = []

    # ========================================================================
    # JWT / Token Security
    # ========================================================================

    def test_jwt_validation(self) -> List[APISecurityTest]:
        """Test JWT token security."""
        results = []

        # Test 1: Invalid token signature
        test = APISecurityTest(
            test_id="JWT-001",
            test_name="Invalid JWT signature",
            endpoint="/fhir/Patient",
            method="GET",
            risk_level="CRITICAL",
            description="Accepts JWT with invalid signature"
        )

        try:
            # Create JWT with wrong secret
            invalid_token = jwt.encode(
                {"sub": "user123", "iat": time.time()},
                "wrong_secret",
                algorithm="HS256"
            )

            resp = requests.get(
                urljoin(self.api_url, "/fhir/Patient"),
                headers={"Authorization": f"Bearer {invalid_token}"},
                timeout=5
            )

            if resp.status_code == 401:
                test.passed = True
                test.result = "PASS - Invalid signature rejected"
            else:
                test.result = "FAIL - VULNERABLE"
                test.details = f"Invalid token accepted (HTTP {resp.status_code})"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 2: Expired token
        test = APISecurityTest(
            test_id="JWT-002",
            test_name="Expired JWT acceptance",
            endpoint="/fhir/Patient",
            method="GET",
            risk_level="CRITICAL",
            description="Accepts JWT with expired timestamp"
        )

        try:
            # Create expired JWT
            expired_token = jwt.encode(
                {"sub": "user123", "iat": time.time() - 86400, "exp": time.time() - 3600},
                "secret",
                algorithm="HS256"
            )

            resp = requests.get(
                urljoin(self.api_url, "/fhir/Patient"),
                headers={"Authorization": f"Bearer {expired_token}"},
                timeout=5
            )

            if resp.status_code == 401:
                test.passed = True
                test.result = "PASS - Expired token rejected"
            else:
                test.result = "FAIL - VULNERABLE"
                test.details = f"Expired token accepted (HTTP {resp.status_code})"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 3: Missing exp claim
        test = APISecurityTest(
            test_id="JWT-003",
            test_name="JWT missing expiration",
            endpoint="/fhir/Patient",
            method="GET",
            risk_level="HIGH",
            description="JWT without exp claim accepted"
        )

        try:
            # Token without expiration
            no_exp_token = jwt.encode(
                {"sub": "user123"},
                "secret",
                algorithm="HS256"
            )

            resp = requests.get(
                urljoin(self.api_url, "/fhir/Patient"),
                headers={"Authorization": f"Bearer {no_exp_token}"},
                timeout=5
            )

            if resp.status_code == 401:
                test.passed = True
                test.result = "PASS - Token without exp rejected"
            else:
                test.result = "FAIL - VULNERABLE"
                test.details = "JWT without expiration accepted"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    # ========================================================================
    # Authorization
    # ========================================================================

    def test_authorization_controls(self) -> List[APISecurityTest]:
        """Test authorization (role-based access control)."""
        results = []

        # Test 1: User can access admin endpoints
        test = APISecurityTest(
            test_id="AUTHZ-001",
            test_name="Regular user accessing admin endpoint",
            endpoint="/admin/users",
            method="GET",
            risk_level="CRITICAL",
            description="Non-admin user can access admin endpoints"
        )

        try:
            resp = requests.get(
                urljoin(self.api_url, "/admin/users"),
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=5
            )

            if resp.status_code == 403:
                test.passed = True
                test.result = "PASS - Admin endpoint protected"
            elif resp.status_code == 200:
                test.result = "FAIL - VULNERABLE"
                test.details = "Non-admin user accessed admin endpoint"
            else:
                test.result = "PASS - Access denied"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 2: User can view other user's data
        test = APISecurityTest(
            test_id="AUTHZ-002",
            test_name="User accessing peer's patient data",
            endpoint="/fhir/Patient/999",
            method="GET",
            risk_level="CRITICAL",
            description="User can view another user's patient records"
        )

        try:
            resp = requests.get(
                urljoin(self.api_url, "/fhir/Patient/999"),
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=5
            )

            if resp.status_code in [403, 404]:
                test.passed = True
                test.result = "PASS - Data isolation enforced"
            elif resp.status_code == 200:
                test.result = "FAIL - VULNERABLE"
                test.details = "User accessed peer's patient data"
            else:
                test.result = "PASS - Access denied"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    # ========================================================================
    # API Input Validation
    # ========================================================================

    def test_input_validation(self) -> List[APISecurityTest]:
        """Test API input validation."""
        results = []

        # Test 1: Oversized payload
        test = APISecurityTest(
            test_id="INPUT-001",
            test_name="Oversized payload handling",
            endpoint="/fhir/Patient",
            method="POST",
            risk_level="MEDIUM",
            description="API accepts extremely large payloads (DoS risk)"
        )

        try:
            # Create 100MB payload
            large_payload = {"resourceType": "Patient", "data": "X" * (100 * 1024 * 1024)}

            resp = requests.post(
                urljoin(self.api_url, "/fhir/Patient"),
                json=large_payload,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=5
            )

            if resp.status_code == 413:
                test.passed = True
                test.result = "PASS - Oversized payload rejected"
            elif resp.status_code == 201:
                test.result = "FAIL - VULNERABLE"
                test.details = "Accepted 100MB payload (DoS risk)"
            else:
                test.result = "PASS - Request rejected"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 2: Malformed JSON
        test = APISecurityTest(
            test_id="INPUT-002",
            test_name="Malformed JSON handling",
            endpoint="/fhir/Patient",
            method="POST",
            risk_level="LOW",
            description="API properly rejects malformed JSON"
        )

        try:
            # Send invalid JSON
            resp = requests.post(
                urljoin(self.api_url, "/fhir/Patient"),
                data="{'invalid': json}",  # Invalid JSON
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                timeout=5
            )

            if resp.status_code == 400:
                test.passed = True
                test.result = "PASS - Malformed JSON rejected"
            else:
                test.result = "FAIL"
                test.details = f"Unexpected response: {resp.status_code}"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 3: Type confusion
        test = APISecurityTest(
            test_id="INPUT-003",
            test_name="Type validation (string for integer)",
            endpoint="/fhir/Patient",
            method="POST",
            risk_level="MEDIUM",
            description="API accepts wrong data types in fields"
        )

        try:
            # Send string where integer expected
            resp = requests.post(
                urljoin(self.api_url, "/fhir/Observation"),
                json={
                    "resourceType": "Observation",
                    "value": "not_a_number"  # Should be numeric
                },
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=5
            )

            if resp.status_code == 400:
                test.passed = True
                test.result = "PASS - Type validation enforced"
            elif resp.status_code == 201:
                test.result = "FAIL - VULNERABLE"
                test.details = "Type validation not enforced"
            else:
                test.result = "PASS"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    # ========================================================================
    # Response Headers
    # ========================================================================

    def test_security_headers(self) -> List[APISecurityTest]:
        """Test security headers."""
        results = []

        # Test 1: X-Content-Type-Options
        test = APISecurityTest(
            test_id="HEADERS-001",
            test_name="X-Content-Type-Options header",
            endpoint="/",
            method="GET",
            risk_level="MEDIUM",
            description="Missing X-Content-Type-Options: nosniff header"
        )

        try:
            resp = requests.get(urljoin(self.api_url, "/"), timeout=5)

            if resp.headers.get("X-Content-Type-Options") == "nosniff":
                test.passed = True
                test.result = "PASS - Header present and correct"
            else:
                test.result = "FAIL - VULNERABLE"
                test.details = f"Header value: {resp.headers.get('X-Content-Type-Options', 'missing')}"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 2: X-Frame-Options
        test = APISecurityTest(
            test_id="HEADERS-002",
            test_name="X-Frame-Options header (clickjacking)",
            endpoint="/",
            method="GET",
            risk_level="MEDIUM",
            description="Missing X-Frame-Options header (clickjacking risk)"
        )

        try:
            resp = requests.get(urljoin(self.api_url, "/"), timeout=5)

            if resp.headers.get("X-Frame-Options") in ["DENY", "SAMEORIGIN"]:
                test.passed = True
                test.result = "PASS - Clickjacking protected"
            else:
                test.result = "FAIL - VULNERABLE"
                test.details = f"Header value: {resp.headers.get('X-Frame-Options', 'missing')}"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 3: Content-Security-Policy
        test = APISecurityTest(
            test_id="HEADERS-003",
            test_name="Content-Security-Policy header",
            endpoint="/",
            method="GET",
            risk_level="MEDIUM",
            description="Missing Content-Security-Policy header (XSS risk)"
        )

        try:
            resp = requests.get(urljoin(self.api_url, "/"), timeout=5)

            if "Content-Security-Policy" in resp.headers:
                test.passed = True
                test.result = "PASS - CSP configured"
            else:
                test.result = "FAIL"
                test.details = "CSP header missing (XSS mitigation)"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 4: Strict-Transport-Security
        test = APISecurityTest(
            test_id="HEADERS-004",
            test_name="Strict-Transport-Security header",
            endpoint="/",
            method="GET",
            risk_level="HIGH",
            description="Missing HSTS header (downgrade attack risk)"
        )

        try:
            resp = requests.get(urljoin(self.api_url, "/"), timeout=5)

            if "Strict-Transport-Security" in resp.headers:
                test.passed = True
                test.result = "PASS - HSTS enabled"
            else:
                test.result = "FAIL - VULNERABLE"
                test.details = "HSTS header missing"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    # ========================================================================
    # API Rate Limiting & DoS Protection
    # ========================================================================

    def test_dos_protection(self) -> List[APISecurityTest]:
        """Test DoS protection mechanisms."""
        results = []

        # Test 1: Rate limiting
        test = APISecurityTest(
            test_id="DOS-001",
            test_name="Rate limiting enforcement",
            endpoint="/fhir/Patient",
            method="GET",
            risk_level="HIGH",
            description="No rate limiting on API endpoints"
        )

        try:
            rate_limited = False
            for i in range(100):
                resp = requests.get(
                    urljoin(self.api_url, "/fhir/Patient"),
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=1
                )
                if resp.status_code == 429:
                    rate_limited = True
                    break

            if rate_limited:
                test.passed = True
                test.result = "PASS - Rate limiting active"
            else:
                test.result = "FAIL - VULNERABLE"
                test.details = "100 rapid requests not rate-limited"
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    def run_all_tests(self) -> Dict:
        """Run all API security tests."""
        print("\n" + "=" * 70)
        print("API SECURITY TESTING")
        print("=" * 70)

        all_tests = []

        print("\n🔍 Testing JWT security...")
        all_tests.extend(self.test_jwt_validation())

        print("🔍 Testing authorization controls...")
        all_tests.extend(self.test_authorization_controls())

        print("🔍 Testing input validation...")
        all_tests.extend(self.test_input_validation())

        print("🔍 Testing security headers...")
        all_tests.extend(self.test_security_headers())

        print("🔍 Testing DoS protection...")
        all_tests.extend(self.test_dos_protection())

        # Summarize
        passed = [t for t in all_tests if t.passed]
        failed = [t for t in all_tests if not t.passed]

        print("\n" + "=" * 70)
        print("API SECURITY SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {len(all_tests)}")
        print(f"✅ Passed: {len(passed)}")
        print(f"❌ Failed: {len(failed)}")

        if failed:
            print("\n⚠️  FAILED TESTS:")
            for test in failed:
                print(f"  - {test.test_id}: {test.test_name}")
                if test.details:
                    print(f"    Details: {test.details}")

        return {
            "timestamp": time.time(),
            "total_tests": len(all_tests),
            "passed": len(passed),
            "failed": len(failed),
            "tests": [
                {
                    "test_id": t.test_id,
                    "test_name": t.test_name,
                    "endpoint": t.endpoint,
                    "method": t.method,
                    "risk_level": t.risk_level,
                    "result": t.result,
                    "passed": t.passed,
                    "details": t.details
                }
                for t in all_tests
            ]
        }
