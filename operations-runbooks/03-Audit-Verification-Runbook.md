# Operational Runbook 3: Daily Audit Trail Verification

**Purpose:** Verify integrity of audit trail; detect tampering within 24 hours  
**Scope:** Daily chain verification, periodic integrity checks  
**Audience:** Compliance officer, IT ops, security team  
**Version:** 1.0  
**Last Updated:** April 25, 2026  
**Schedule:** Every day at 2:00 AM UTC

---

## Daily Verification Procedure (2 AM UTC)

### Step 1: Initiate Chain Verification

```bash
# Scheduled job (via cron or Kubernetes CronJob)
0 2 * * * /usr/local/bin/verify_audit_chain.sh

# Alternatively (manual run for testing)
python3 scripts/verify_audit_chain.py
```

### Step 2: Verify Merkle-Chain Integrity

```python
# File: scripts/verify_audit_chain.py

from datetime import datetime, timedelta
import hashlib
import json
import sqlite3

class AuditChainVerifier:
    def verify_daily(self):
        """
        Verify audit trail chain integrity.
        
        Process:
        1. Get all events since yesterday
        2. Recalculate Merkle hashes
        3. Compare with stored hashes
        4. Report any discrepancies
        """
        
        # Get events from last 24 hours
        events = self.db.execute("""
            SELECT event_id, timestamp, event_json, merkle_chain_hash, 
                   signature, previous_event_id
            FROM audit_trail
            WHERE timestamp > NOW() - INTERVAL 1 DAY
            ORDER BY timestamp ASC
        """)
        
        print(f"📋 Daily Audit Verification: {datetime.utcnow().isoformat()}")
        print(f"   Checking {len(events)} events from last 24 hours\n")
        
        # Verify each event
        previous_hash = None
        tampered_events = []
        
        for event in events:
            # Recalculate expected hash
            event_json = json.loads(event["event_json"])
            expected_hash = hashlib.sha256(
                (json.dumps(event_json, sort_keys=True) + (previous_hash or ""))
                .encode()
            ).hexdigest()
            
            stored_hash = event["merkle_chain_hash"]
            
            # Compare
            if expected_hash != stored_hash:
                print(f"   ❌ TAMPERING DETECTED in event {event['event_id']}")
                tampered_events.append({
                    "event_id": event["event_id"],
                    "timestamp": event["timestamp"],
                    "expected_hash": expected_hash,
                    "stored_hash": stored_hash
                })
            else:
                print(f"   ✓ {event['event_id']}: chain hash valid")
            
            # Also verify digital signature
            if not self._verify_digital_signature(event):
                print(f"   ❌ SIGNATURE INVALID: {event['event_id']}")
                tampered_events.append({
                    "event_id": event["event_id"],
                    "issue": "signature_invalid"
                })
            
            previous_hash = stored_hash
        
        # Results
        print(f"\n{'='*60}")
        if tampered_events:
            print(f"🚨 CRITICAL: {len(tampered_events)} events tampered!")
            return False
        else:
            print(f"✅ PASSED: All {len(events)} events verified intact")
            return True
```

### Step 3: Record Verification Result

```sql
INSERT INTO audit_chain_verification 
(verification_timestamp, start_event_id, end_event_id, total_events, 
 chain_integrity_status, verification_notes, verified_by)
VALUES (
    NOW(),
    (SELECT event_id FROM audit_trail ORDER BY timestamp ASC LIMIT 1),
    (SELECT event_id FROM audit_trail ORDER BY timestamp DESC LIMIT 1),
    (SELECT COUNT(*) FROM audit_trail WHERE timestamp > NOW() - INTERVAL 1 DAY),
    'VALID',  -- or 'TAMPERED' if issues found
    'Daily chain verification passed',
    'system'
);
```

### Step 4: Alert on Tampering (If Detected)

```bash
# If tampering detected, trigger critical alert

if [ "$VERIFICATION_STATUS" == "TAMPERED" ]; then
    # 1. IMMEDIATE: Page compliance officer
    curl -X POST https://pagerduty.example.com/incidents \
      -d "{
        \"incident_key\": \"audit-trail-tampering\",
        \"severity\": \"critical\",
        \"title\": \"Audit Trail Tampering Detected\"
      }"
    
    # 2. Notify compliance & security
    curl -X POST https://slack.com/api/chat.postMessage \
      -d "channel=#incidents" \
      -d "text=🚨 CRITICAL: Audit trail tampering detected!
      \nTampered events: [event_ids]
      \nNext: Investigate immediately; preserve forensic evidence"
    
    # 3. Freeze the system (prevent further writes to audit trail)
    # This is conservative: assume attacker is still active
    kubectl set env deployment/platform AUDIT_TRAIL_FREEZE=true
    
    # 4. Email compliance officer
    mail -s "CRITICAL: Audit Trail Tampering" compliance@company.com << 'EOF'
    URGENT INCIDENT: Audit Trail Integrity Violation
    
    Tampered events detected during daily verification at $(date).
    
    IMMEDIATE ACTIONS REQUIRED:
    1. Notify CEO/CTO/compliance officer (already paged)
    2. Preserve forensic evidence (database snapshot)
    3. Investigate root cause (who/how did tampering occur?)
    4. Determine patient safety impact
    5. Decide: Continue operations or halt?
    6. Prepare FDA notification (likely required)
    
    Contact: on-call engineer
    EOF
fi
```

---

## Weekly Deep-Dive (Every Monday 9 AM UTC)

### Step 1: Comprehensive Chain Audit

**What to check beyond daily:**
- Signature certificate chain (are signing keys still valid?)
- Digital signature algorithm strength
- Random sampling of 100+ events (not just last 24 hours)

```bash
# Weekly verification script
python3 scripts/verify_audit_weekly.py

# Output example:
# ✅ Daily Verifications (7 days): 7/7 PASSED
# ✅ Signature Certificates: All valid, expires in 89 days
# ✅ Random sampling (150 events): All verified intact
# ✅ Audit trail size: 1.2M events, 4.5 GB
# ✅ Oldest event: 2026-04-18 (7 days old)
# ✅ Weekly Status: PASSED
```

### Step 2: Audit Trail Metrics Report

```bash
# Generate weekly metrics
SELECT 
    DATE_TRUNC('day', timestamp) as day,
    COUNT(*) as events,
    COUNT(DISTINCT user_id) as users,
    COUNT(DISTINCT action_type) as action_types
FROM audit_trail
WHERE timestamp > NOW() - INTERVAL 7 DAYS
GROUP BY day
ORDER BY day DESC;

# Output:
# Day         | Events | Users | Action Types
# ────────────┼────────┼───────┼──────────────
# 2026-04-25  | 18,234 | 24    | 38
# 2026-04-24  | 19,105 | 26    | 35
# 2026-04-23  | 17,456 | 22    | 40
# ...
```

### Step 3: Compliance Metrics Report

**Questions to answer:**
1. Are all sensitive operations logged?
2. Is audit trail accessible to authorized users only?
3. Have any suspicious patterns emerged?

```sql
-- Find sensitive events not logged (should return 0)
SELECT COUNT(*) as potential_missing_logs
FROM (
    SELECT DISTINCT resource_id
    FROM patient_records
    WHERE modified_date > NOW() - INTERVAL 7 DAYS
) pr
WHERE NOT EXISTS (
    SELECT 1 FROM audit_trail
    WHERE resource_id LIKE CONCAT('Patient-', pr.resource_id)
    AND action_type IN ('data_modified', 'data_accessed', 'data_exported')
);

-- Find unauthorized access attempts (should be minimal)
SELECT COUNT(*) as unauthorized_attempts
FROM audit_trail
WHERE action_type = 'unauthorized_access_attempt'
AND timestamp > NOW() - INTERVAL 7 DAYS;

-- Check audit trail access (only compliance should query)
SELECT user_id, COUNT(*) as audit_queries
FROM audit_trail
WHERE action_type = 'audit_trail_queried'
AND timestamp > NOW() - INTERVAL 7 DAYS
GROUP BY user_id;
```

### Step 4: Weekly Report to Compliance Officer

```markdown
# Weekly Audit Trail Report
**Week of April 18-24, 2026**

## Summary
- ✅ Chain Verification: 7/7 passed (daily)
- ✅ Signature Certificates: All valid
- ✅ Random Sampling: 150/150 events verified intact
- ✅ Access Control: All queries from authorized users
- ✅ Overall Status: COMPLIANT

## Metrics
- Total Events Logged: 132,590
- Unique Users: 28
- Event Types: 47
- Audit Trail Size: 4.5 GB
- Growth Rate: ~19K events/day

## Notable Events
- 6 failed authentication attempts (mitigated by rate limiting)
- 0 unauthorized access attempts
- 0 data integrity violations
- 3 user permission changes (all logged & approved)

## Alerts
- None this week
- Trend: Normal operation

## Recommendations
- Continue current logging levels
- Archive events >30 days old (compliance retention met)
- Monitor storage growth (currently 4.5 GB, projected 6.8 GB by June)

---
Prepared by: Compliance Officer  
Date: 2026-04-25  
Next Report: 2026-05-02
```

---

## Monthly Audit (Quarterly for FDA)

### Step 1: Full Chain Re-verification

```bash
# Re-verify entire chain from inception (expensive operation)
python3 scripts/verify_audit_full_chain.py

# This checks: Every single event (millions) to ensure 
# no tampering has occurred at any point in history

# Expected runtime: 30-60 minutes
# Output: PASSED / FAILED with detailed log
```

### Step 2: Regulatory Compliance Report

**Prepare for FDA inspection:**
- Complete audit trail dump (sanitized)
- Verification results
- Access control audit
- Digital signature verification

```bash
# Generate FDA-ready report
python3 scripts/generate_fda_audit_report.py --month=april --year=2026

# Creates:
# - audit_trail_april_2026_sanitized.csv (PII redacted)
# - verification_report_april_2026.json
# - access_control_audit_april_2026.json
# - signature_verification_april_2026.json
```

### Step 3: Archive & Long-Term Storage

```bash
# Archive events older than 90 days
python3 scripts/archive_audit_trail.py \
  --before=2026-01-26 \
  --destination=s3://audit-archive/

# Archive contains:
# - Compressed audit log (gzip)
# - Verification certificates
# - Metadata manifest
# - Checksum for integrity

# Original events deleted (compliance requirement: prevent tampering)
```

---

## Emergency: Restore from Backup

**If tampering confirmed and audit trail compromised:**

```bash
# 1. Halt all system operations
kubectl set env deployment/platform SYSTEM_STATE=HALTED

# 2. Retrieve backup (maintained separately from production DB)
aws s3 cp s3://audit-backups/daily/2026-04-25-audit-trail.sql.gz .
gunzip audit-trail.sql.gz

# 3. Restore to separate verification database
mysql audit_trail_restore < audit-trail.sql

# 4. Verify backup integrity (was backup itself tampered?)
python3 scripts/verify_backup_integrity.py audit-trail.sql
# Must get PASSED before trusting backup

# 5. Forensic analysis (without touching production DB)
# - When was tampering first detected?
# - Which events were modified?
# - Who had access during that time?
# - What was the attack vector?

# 6. Notify FDA (if any patient safety impact)
# - Prepare MDR if applicable
# - Document timeline of incident
```

---

## Troubleshooting

### Problem: Verification Fails on Old Events

```bash
# Root causes:
# 1. Key rotation: Old events signed with old key
# 2. Historical data: Partial corruption in backup

# Resolution:
# 1. Check key rotation history
SELECT * FROM key_rotation_log ORDER BY rotation_date DESC;

# 2. Verify: Is this an old event or recent event?
SELECT timestamp FROM audit_trail WHERE event_id='evt-xyz';

# 3. If old event: Expected (keys rotated)
#    If recent: ALERT! Investigate tampering
```

### Problem: Verification Hangs on Large Chain

```bash
# Issue: Database is slow, verification timeout

# Fix 1: Add index to audit_trail
CREATE INDEX idx_timestamp ON audit_trail(timestamp);

# Fix 2: Verify in batches instead of all-at-once
python3 scripts/verify_audit_chain.py --batch_size=100000

# Fix 3: Run on read replica (doesn't lock main DB)
python3 scripts/verify_audit_chain.py --db=read-replica
```

---

## Summary

This runbook provides:
✅ Daily chain verification (2 AM UTC)  
✅ Weekly deep-dive audit (Monday 9 AM)  
✅ Monthly full-chain verification  
✅ Quarterly FDA compliance report  
✅ Emergency: Restore from backup  
✅ Troubleshooting procedures  

**Key metric:** Tampering detected within 24 hours maximum.

**FDA benefit:** Continuous compliance monitoring ensures device integrity.
