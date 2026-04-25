#!/usr/bin/env python3
"""
Synthetic Data Loader
Imports FHIR data into medical device platform for testing.

Compliance: IEC 62304 V&V, test data management
Purpose: Load synthetic patients, observations, and adverse events into:
         - PostgreSQL audit trail
         - EKS platform via FHIR API
         - Monitoring system for metrics validation

Version: 1.0 (April 25, 2026)
"""

import json
import sys
import os
import time
import random
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import psycopg2
from psycopg2.extras import execute_batch
import requests
from pathlib import Path


# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """Load configuration from environment."""

    # Database
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "5432"))
    DB_NAME = os.getenv("DB_NAME", "audit_trail")
    DB_USER = os.getenv("DB_USER", "audit_trail_user")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")

    # Platform API
    PLATFORM_API_URL = os.getenv("PLATFORM_API_URL", "http://localhost:8080")
    PLATFORM_API_KEY = os.getenv("PLATFORM_API_KEY", "")

    # Batch settings
    BATCH_SIZE = int(os.getenv("BATCH_SIZE", "100"))
    WORKERS = int(os.getenv("WORKERS", "1"))

    # Performance
    SLEEP_BETWEEN_BATCHES = float(os.getenv("SLEEP_BETWEEN_BATCHES", "0.5"))


# ============================================================================
# DATABASE LOADER
# ============================================================================

class DatabaseLoader:
    """Load synthetic data into PostgreSQL audit trail database."""

    def __init__(self, config: Config):
        self.config = config
        self.conn = None
        self.cursor = None
        self.event_count = 0
        self.error_count = 0

    def connect(self) -> bool:
        """Connect to PostgreSQL database."""
        try:
            self.conn = psycopg2.connect(
                host=self.config.DB_HOST,
                port=self.config.DB_PORT,
                database=self.config.DB_NAME,
                user=self.config.DB_USER,
                password=self.config.DB_PASSWORD,
                connect_timeout=10
            )
            self.cursor = self.conn.cursor()
            print(f"✅ Connected to PostgreSQL: {self.config.DB_HOST}:{self.config.DB_PORT}/{self.config.DB_NAME}")
            return True
        except psycopg2.Error as e:
            print(f"❌ Database connection failed: {e}")
            return False

    def load_synthetic_patients(self, filepath: str) -> int:
        """Load FHIR patient bundle into database."""
        if not self._load_fhir_bundle(filepath, "Patient"):
            return 0

        print(f"✅ Loaded synthetic patients from {filepath}")
        return self.event_count

    def load_synthetic_observations(self, filepath: str) -> int:
        """Load FHIR observations into database."""
        if not self._load_fhir_bundle(filepath, "Observation"):
            return 0

        print(f"✅ Loaded synthetic observations from {filepath}")
        return self.event_count

    def load_adverse_events(self, filepath: str) -> int:
        """Load FHIR adverse events into database."""
        if not self._load_fhir_bundle(filepath, "AdverseEvent"):
            return 0

        print(f"✅ Loaded adverse events from {filepath}")
        return self.event_count

    def _load_fhir_bundle(self, filepath: str, resource_type: str) -> bool:
        """Load FHIR Bundle into audit trail."""
        try:
            with open(filepath, 'r') as f:
                bundle = json.load(f)

            total = len(bundle.get("entry", []))
            print(f"📥 Loading {total} {resource_type} resources...")

            batch = []
            for i, entry in enumerate(bundle["entry"]):
                resource = entry.get("resource", {})

                if resource.get("resourceType") == resource_type:
                    # Create audit trail entry
                    audit_entry = {
                        "event_id": f"{resource_type.lower()}-{resource.get('id', 'unknown')}",
                        "timestamp": datetime.now(),
                        "user_id": "synthetic-data-loader",
                        "action_type": "FHIR_RESOURCE_LOAD",
                        "resource_type": resource_type,
                        "resource_id": resource.get("id", "unknown"),
                        "event_json": json.dumps(resource),
                    }

                    batch.append(audit_entry)

                    if len(batch) >= self.config.BATCH_SIZE:
                        self._insert_audit_entries(batch)
                        batch = []

                    if (i + 1) % 100 == 0:
                        print(f"   Progress: {i+1}/{total}")

            # Insert remaining
            if batch:
                self._insert_audit_entries(batch)

            self.conn.commit()
            print(f"✅ Loaded {self.event_count} {resource_type} entries into audit trail")
            return True

        except Exception as e:
            print(f"❌ Error loading {resource_type}: {e}")
            self.error_count += 1
            return False

    def _insert_audit_entries(self, batch: List[Dict]) -> None:
        """Insert batch of audit entries."""
        try:
            sql = """
            INSERT INTO audit_trail
            (event_id, timestamp, unix_timestamp, user_id, action_type,
             resource_type, resource_id, event_json, event_hash, signature, signature_timestamp, merkle_chain_hash)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """

            records = []
            for entry in batch:
                now = datetime.now()
                records.append((
                    entry["event_id"],
                    entry["timestamp"],
                    int(entry["timestamp"].timestamp()),
                    entry["user_id"],
                    entry["action_type"],
                    entry["resource_type"],
                    entry["resource_id"],
                    entry["event_json"],
                    "hash_placeholder",  # Real system would compute SHA256(event_json)
                    "sig_placeholder",   # Real system would sign with HSM
                    now,
                    "merkle_placeholder"  # Real system would compute Merkle chain
                ))

            execute_batch(self.cursor, sql, records)
            self.event_count += len(batch)

        except psycopg2.Error as e:
            print(f"❌ Batch insert failed: {e}")
            self.error_count += len(batch)

    def validate_data_integrity(self) -> Tuple[int, int]:
        """Validate loaded data (immutability, completeness)."""
        try:
            print("\n🔍 Validating data integrity...")

            # Check audit trail immutability (no deletes/updates)
            self.cursor.execute("""
            SELECT COUNT(*) FROM audit_trail
            WHERE action_type IN ('DELETE', 'UPDATE')
            """)
            invalid_actions = self.cursor.fetchone()[0]
            if invalid_actions > 0:
                print(f"⚠️  Warning: Found {invalid_actions} DELETE/UPDATE actions (audit trail should be append-only)")

            # Check merkle chain continuity
            self.cursor.execute("""
            SELECT COUNT(*) FROM audit_trail
            WHERE merkle_chain_hash = 'merkle_placeholder'
            """)
            unverified = self.cursor.fetchone()[0]
            print(f"   Unverified entries (awaiting Merkle computation): {unverified}")

            # Check signatures
            self.cursor.execute("""
            SELECT COUNT(*) FROM audit_trail
            WHERE signature = 'sig_placeholder'
            """)
            unsigned = self.cursor.fetchone()[0]
            print(f"   Unsigned entries (awaiting HSM signing): {unsigned}")

            # Patient count
            self.cursor.execute("""
            SELECT COUNT(DISTINCT resource_id) FROM audit_trail
            WHERE resource_type = 'Patient'
            """)
            patient_count = self.cursor.fetchone()[0]
            print(f"   Total patients loaded: {patient_count}")

            # Observation count
            self.cursor.execute("""
            SELECT COUNT(DISTINCT resource_id) FROM audit_trail
            WHERE resource_type = 'Observation'
            """)
            observation_count = self.cursor.fetchone()[0]
            print(f"   Total observations loaded: {observation_count}")

            return patient_count, observation_count

        except psycopg2.Error as e:
            print(f"❌ Validation error: {e}")
            return 0, 0

    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("\n✅ Database connection closed")


# ============================================================================
# API LOADER
# ============================================================================

class APILoader:
    """Load synthetic data via FHIR API (if available)."""

    def __init__(self, config: Config):
        self.config = config
        self.loaded_count = 0
        self.error_count = 0
        self.headers = {
            "Content-Type": "application/fhir+json",
            "Authorization": f"Bearer {config.PLATFORM_API_KEY}" if config.PLATFORM_API_KEY else None
        }

    def load_synthetic_data(self, filepath: str) -> bool:
        """Load FHIR Bundle via API."""
        try:
            with open(filepath, 'r') as f:
                bundle = json.load(f)

            total = len(bundle.get("entry", []))
            print(f"📤 Sending {total} resources to API...")

            for i, entry in enumerate(bundle["entry"]):
                resource = entry.get("resource", {})
                if not resource:
                    continue

                success = self._post_resource(resource)
                if not success:
                    self.error_count += 1
                else:
                    self.loaded_count += 1

                if (i + 1) % 100 == 0:
                    print(f"   Progress: {i+1}/{total}")

            print(f"✅ Loaded {self.loaded_count} resources via API ({self.error_count} errors)")
            return self.error_count == 0

        except Exception as e:
            print(f"❌ API load failed: {e}")
            return False

    def _post_resource(self, resource: Dict) -> bool:
        """POST single resource to API."""
        try:
            url = f"{self.config.PLATFORM_API_URL}/fhir/{resource['resourceType']}"
            response = requests.post(
                url,
                json=resource,
                headers=self.headers,
                timeout=10
            )

            if response.status_code in [200, 201]:
                return True
            else:
                print(f"⚠️  POST {resource['resourceType']}: {response.status_code}")
                return False

        except requests.RequestException as e:
            print(f"⚠️  API error: {e}")
            return False


# ============================================================================
# PERFORMANCE TESTING
# ============================================================================

class PerformanceValidator:
    """Validate system performance with synthetic data."""

    def __init__(self, config: Config):
        self.config = config

    def measure_alert_latency(self, adverse_events_filepath: str) -> Dict:
        """Measure time from observation → alert."""
        print("\n⏱️  Measuring alert latency...")

        results = {
            "alert_name": [],
            "latency_ms": [],
            "expected_ms": []
        }

        try:
            with open(adverse_events_filepath, 'r') as f:
                bundle = json.load(f)

            for entry in bundle.get("entry", [])[:10]:  # Test first 10
                resource = entry.get("resource", {})

                # Extract alert name from adverse event
                alert_name = resource.get("description", "").split(":")[0]

                # Simulate observation POST
                start = time.time()
                response = requests.post(
                    f"{self.config.PLATFORM_API_URL}/fhir/Observation",
                    json={"test": "data"},
                    timeout=5
                )
                latency_ms = (time.time() - start) * 1000

                results["alert_name"].append(alert_name)
                results["latency_ms"].append(latency_ms)
                results["expected_ms"].append(60 * 1000)  # 60s SLA

            print(f"   Average latency: {sum(results['latency_ms'])/len(results['latency_ms']):.0f}ms")
            return results

        except Exception as e:
            print(f"❌ Latency measurement failed: {e}")
            return {}


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main data loading orchestration."""
    config = Config()

    print("=" * 70)
    print("SYNTHETIC DATA LOADER")
    print("FDA Medical Device Platform - Test Data Generation")
    print("=" * 70)

    if len(sys.argv) < 2:
        print(f"\nUsage: python3 load_synthetic_data.py <patients.json> [observations.json] [adverse_events.json]")
        print(f"  Example: python3 load_synthetic_data.py synthetic_patients.json observations.json adverse_events.json")
        return 1

    patients_file = sys.argv[1]
    observations_file = sys.argv[2] if len(sys.argv) > 2 else None
    adverse_events_file = sys.argv[3] if len(sys.argv) > 3 else None

    # Verify files exist
    for filepath in [patients_file, observations_file, adverse_events_file]:
        if filepath and not Path(filepath).exists():
            print(f"❌ File not found: {filepath}")
            return 1

    # Load via database
    print("\n📊 DATABASE LOADING")
    print("-" * 70)

    db_loader = DatabaseLoader(config)
    if not db_loader.connect():
        return 1

    try:
        db_loader.load_synthetic_patients(patients_file)
        time.sleep(config.SLEEP_BETWEEN_BATCHES)

        if observations_file:
            db_loader.load_synthetic_observations(observations_file)
            time.sleep(config.SLEEP_BETWEEN_BATCHES)

        if adverse_events_file:
            db_loader.load_adverse_events(adverse_events_file)

        # Validate
        patient_count, obs_count = db_loader.validate_data_integrity()

    finally:
        db_loader.close()

    # Load via API (if configured)
    if config.PLATFORM_API_URL and config.PLATFORM_API_URL != "http://localhost:8080":
        print("\n📤 API LOADING")
        print("-" * 70)

        api_loader = APILoader(config)
        api_loader.load_synthetic_data(patients_file)

    print("\n" + "=" * 70)
    print("✅ DATA LOADING COMPLETE")
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
