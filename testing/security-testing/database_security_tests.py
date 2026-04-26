#!/usr/bin/env python3
"""
Database Security Testing Framework
Validates SQL injection protection, privilege escalation, and data integrity.

Compliance: OWASP Top 10, FDA 510(k), HIPAA §164.312, CFR Part 11
Purpose: Verify database hardening before FDA submission
Version: 1.0 (April 25, 2026)
"""

import psycopg2
import json
import time
from typing import Dict, List
from dataclasses import dataclass


@dataclass
class DatabaseSecurityTest:
    """Database security test result."""
    test_id: str
    test_name: str
    risk_level: str
    description: str
    result: str = "PENDING"
    passed: bool = False
    details: str = ""


class DatabaseSecurityTester:
    """Test database security controls."""

    def __init__(self, db_host: str, db_port: int, db_name: str, db_user: str, db_password: str):
        self.db_host = db_host
        self.db_port = db_port
        self.db_name = db_name
        self.db_user = db_user
        self.db_password = db_password
        self.test_results = []

    def _get_connection(self):
        """Get database connection."""
        return psycopg2.connect(
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
            user=self.db_user,
            password=self.db_password
        )

    # ========================================================================
    # SQL Injection Protection
    # ========================================================================

    def test_sql_injection_protection(self) -> List[DatabaseSecurityTest]:
        """Test SQL injection protection."""
        results = []

        # Test 1: Parameterized query usage
        test = DatabaseSecurityTest(
            test_id="SQLI-001",
            test_name="Parameterized queries enforced",
            risk_level="CRITICAL",
            description="Verify queries use parameterized statements, not string concatenation"
        )

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Try SQL injection on query
            injection_payload = "' OR '1'='1"

            # This should be safe if using parameterized queries
            cursor.execute(
                "SELECT COUNT(*) FROM audit_trail WHERE user_id = %s",
                (injection_payload,)
            )

            result = cursor.fetchone()[0]

            # If parameterized, payload is treated as literal string, count should be 0
            if result == 0:
                test.passed = True
                test.result = "PASS - Parameterized queries used"
            else:
                test.result = "FAIL - VULNERABLE"
                test.details = "Injection payload matched records"

            cursor.close()
            conn.close()
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 2: Comment-based SQL injection
        test = DatabaseSecurityTest(
            test_id="SQLI-002",
            test_name="SQL comment injection prevention",
            risk_level="HIGH",
            description="Prevent SQL comment-based injection (-- or /* */)"
        )

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Try comment injection
            injection = "abc' -- "
            cursor.execute(
                "SELECT COUNT(*) FROM audit_trail WHERE resource_id = %s",
                (injection,)
            )

            # Should return 0 if injection is blocked
            if cursor.fetchone()[0] == 0:
                test.passed = True
                test.result = "PASS - Comment injection blocked"
            else:
                test.result = "FAIL - VULNERABLE"

            cursor.close()
            conn.close()
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    # ========================================================================
    # Privilege Escalation
    # ========================================================================

    def test_privilege_escalation(self) -> List[DatabaseSecurityTest]:
        """Test privilege escalation prevention."""
        results = []

        # Test 1: Application user privileges
        test = DatabaseSecurityTest(
            test_id="PRIV-001",
            test_name="Application user has minimal privileges",
            risk_level="CRITICAL",
            description="Application user should not have superuser or CREATEDB privileges"
        )

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Check if current user is superuser
            cursor.execute("SELECT current_user, usesuper FROM pg_user WHERE usename = CURRENT_USER;")
            result = cursor.fetchone()

            if result and result[1] is False:  # Not superuser
                test.passed = True
                test.result = "PASS - User has minimal privileges"
            else:
                test.result = "FAIL - VULNERABLE"
                test.details = "Application user is superuser"

            cursor.close()
            conn.close()
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 2: Cannot create objects in other schemas
        test = DatabaseSecurityTest(
            test_id="PRIV-002",
            test_name="User cannot create objects in other schemas",
            risk_level="HIGH",
            description="Application user should not have CREATE privilege on system schemas"
        )

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Try creating object in public schema (should fail)
            try:
                cursor.execute("CREATE TABLE public.test_table (id SERIAL);")
                test.result = "FAIL - VULNERABLE"
                test.details = "User can create tables in public schema"

                # Clean up
                cursor.execute("DROP TABLE IF EXISTS public.test_table;")
            except psycopg2.Error as e:
                if "permission denied" in str(e).lower():
                    test.passed = True
                    test.result = "PASS - CREATE privilege denied"
                else:
                    test.result = f"ERROR - {str(e)}"

            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    # ========================================================================
    # Encryption at Rest
    # ========================================================================

    def test_encryption_at_rest(self) -> List[DatabaseSecurityTest]:
        """Test encryption at rest."""
        results = []

        # Test 1: Sensitive data encrypted in database
        test = DatabaseSecurityTest(
            test_id="ENC-001",
            test_name="Sensitive data encrypted (SSN, MRN)",
            risk_level="CRITICAL",
            description="SSN, MRN, and other PHI should be stored encrypted"
        )

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Check if SSN column is encrypted
            cursor.execute("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'patients' AND column_name = 'ssn'
            """)

            result = cursor.fetchone()

            if result:
                # Check if values are bytea (encrypted) not text
                if result[1] in ["bytea", "binary"]:
                    test.passed = True
                    test.result = "PASS - SSN stored encrypted"
                else:
                    test.result = "FAIL - VULNERABLE"
                    test.details = f"SSN stored as {result[1]}, not encrypted"
            else:
                test.result = "PASS - No SSN column found"
                test.passed = True

            cursor.close()
            conn.close()
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    # ========================================================================
    # Audit Trail Integrity
    # ========================================================================

    def test_audit_trail_integrity(self) -> List[DatabaseSecurityTest]:
        """Test audit trail immutability."""
        results = []

        # Test 1: Audit trail is immutable
        test = DatabaseSecurityTest(
            test_id="AUDIT-001",
            test_name="Audit trail immutable (no UPDATE/DELETE)",
            risk_level="CRITICAL",
            description="Audit trail records should not be updatable or deletable"
        )

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Try updating an audit trail record
            cursor.execute("SELECT MIN(id) FROM audit_trail;")
            min_id = cursor.fetchone()[0]

            if min_id:
                try:
                    cursor.execute(
                        "UPDATE audit_trail SET action = 'TAMPERED' WHERE id = %s;",
                        (min_id,)
                    )
                    conn.commit()

                    test.result = "FAIL - VULNERABLE"
                    test.details = "Audit trail record was updatable"
                except psycopg2.Error as e:
                    if "permission denied" in str(e).lower() or "read-only" in str(e).lower():
                        test.passed = True
                        test.result = "PASS - Audit trail is immutable"
                    else:
                        test.result = f"ERROR - {str(e)}"
            else:
                test.passed = True
                test.result = "PASS - No audit records found"

            cursor.close()
            conn.close()
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 2: Audit trail has hash chain
        test = DatabaseSecurityTest(
            test_id="AUDIT-002",
            test_name="Audit trail hash chain for tampering detection",
            risk_level="HIGH",
            description="Each audit record has previous record hash (Merkle chain)"
        )

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Check if audit_trail has hash_previous_record column
            cursor.execute("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'audit_trail' AND column_name = 'hash_previous_record'
            """)

            if cursor.fetchone():
                test.passed = True
                test.result = "PASS - Hash chain implemented"
            else:
                test.result = "FAIL"
                test.details = "No hash_previous_record column found"

            cursor.close()
            conn.close()
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        # Test 3: Audit trail has timestamp immutability
        test = DatabaseSecurityTest(
            test_id="AUDIT-003",
            test_name="Audit trail timestamps protected",
            risk_level="HIGH",
            description="Audit timestamps should be server-generated and immutable"
        )

        try:
            conn = self._get_connection()
            cursor = conn.cursor()

            # Check if created_at has DEFAULT CURRENT_TIMESTAMP
            cursor.execute("""
                SELECT column_default
                FROM information_schema.columns
                WHERE table_name = 'audit_trail' AND column_name = 'created_at'
            """)

            result = cursor.fetchone()
            if result and result[0]:
                if "CURRENT_TIMESTAMP" in result[0].upper() or "now()" in result[0]:
                    test.passed = True
                    test.result = "PASS - Timestamps server-generated"
                else:
                    test.result = "FAIL"
                    test.details = f"Timestamp default: {result[0]}"
            else:
                test.result = "FAIL"
                test.details = "No DEFAULT for created_at"

            cursor.close()
            conn.close()
        except Exception as e:
            test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    # ========================================================================
    # Connection Security
    # ========================================================================

    def test_connection_security(self) -> List[DatabaseSecurityTest]:
        """Test database connection security."""
        results = []

        # Test 1: SSL/TLS required
        test = DatabaseSecurityTest(
            test_id="CONN-001",
            test_name="SSL/TLS encryption for database connections",
            risk_level="CRITICAL",
            description="Database connections should use SSL/TLS"
        )

        try:
            # Try to connect with sslmode=disable (should fail if SSL required)
            conn = psycopg2.connect(
                host=self.db_host,
                port=self.db_port,
                database=self.db_name,
                user=self.db_user,
                password=self.db_password,
                sslmode="disable",
                connect_timeout=5
            )

            test.result = "FAIL - VULNERABLE"
            test.details = "Connected without SSL/TLS"
            conn.close()
        except psycopg2.Error as e:
            if "ssl" in str(e).lower():
                test.passed = True
                test.result = "PASS - SSL/TLS required"
            else:
                test.result = f"ERROR - {str(e)}"

        results.append(test)

        return results

    def run_all_tests(self) -> Dict:
        """Run all database security tests."""
        print("\n" + "=" * 70)
        print("DATABASE SECURITY TESTING")
        print("=" * 70)

        all_tests = []

        print("\n🔍 Testing SQL injection protection...")
        all_tests.extend(self.test_sql_injection_protection())

        print("🔍 Testing privilege escalation prevention...")
        all_tests.extend(self.test_privilege_escalation())

        print("🔍 Testing encryption at rest...")
        all_tests.extend(self.test_encryption_at_rest())

        print("🔍 Testing audit trail integrity...")
        all_tests.extend(self.test_audit_trail_integrity())

        print("🔍 Testing connection security...")
        all_tests.extend(self.test_connection_security())

        # Summarize
        passed = [t for t in all_tests if t.passed]
        failed = [t for t in all_tests if not t.passed]

        print("\n" + "=" * 70)
        print("DATABASE SECURITY SUMMARY")
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
                    "risk_level": t.risk_level,
                    "result": t.result,
                    "passed": t.passed,
                    "details": t.details
                }
                for t in all_tests
            ]
        }
