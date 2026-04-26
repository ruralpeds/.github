# Business Continuity & Disaster Recovery — Procedures & Testing

**Scope:** Phase 11 (Weeks 21-22) — Backup/restore automation, DR drills, RTO/RPO validation.

**Goal:** Recover from any failure (GitHub compromise, AWS account breach, datacenter failure) within documented RTO/RPO targets.

---

## Recovery Targets by Service Tier

| Tier | RPO | RTO | Failure | Strategy |
|------|-----|-----|---------|----------|
| Mission-critical (audit, FHIR gateway) | 5 min | 30 min | GitHub breached | Multi-region active/passive |
| Clinical-decision | 15 min | 2 hr | AWS region down | Warm standby (region 2) |
| Clinical-support | 1 hr | 8 hr | Database corrupted | Backup/restore + test |
| Reference/content | 24 hr | 72 hr | Repo deleted | Weekly snapshot |

---

## Backup Strategy (3-Tier)

### Tier 1: Hot (Git)
- What: Audit logs + source code
- Where: Git repos (GitHub primary + backup remote)
- Retention: 12 months
- RTO: < 5 min (just fetch from backup remote)

### Tier 2: Warm (S3/Blob)
- What: Database snapshots + audit logs + SBOM + VEX
- Where: AWS S3 Object Lock (Governance) + Glacier transition
- Retention: 7 years (HIPAA §164.316(b)(2))
- RTO: 1-2 hours (restore from snapshot)
- Cost: $500-1500/year

### Tier 3: Cold (Archive)
- What: Quarterly snapshots + encrypted archives
- Where: LTO tape (offline vault) or Glacier Deep Archive
- Retention: 30+ years
- RTO: > 24 hours (restore from tape, physically retrieve)
- Cost: $500-800/year

---

## Backup-Restore Testing

### Weekly Test (Automated)

```bash
#!/bin/bash
# scripts/weekly-restore-test.sh

set -e

echo "=== Weekly Database Restore Test ==="

# Create temporary test database
TEST_DB="test_restore_$(date +%Y%m%d_%H%M%S)"

# Download latest S3 backup
aws s3 cp s3://healthcare-backups/postgres/latest.sql.gz - | gunzip | \
    psql -h localhost -U backup_restore -d postgres -c "CREATE DATABASE $TEST_DB"

# Restore
psql -h localhost -U backup_restore -d $TEST_DB < /tmp/latest.sql

# Validate: run smoke tests
python3 tests/smoke_test.py --db $TEST_DB --verbose

echo "✅ Restore test passed in $(( SECONDS / 60 )) minutes"

# Cleanup
psql -h localhost -U backup_restore -d postgres -c "DROP DATABASE $TEST_DB"

# Log result to audit
curl -X POST http://localhost:3000/api/audit-events \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "backup_restore_test_completed",
    "status": "passed",
    "duration_seconds": '${SECONDS}',
    "database": "postgres"
  }'
```

### Quarterly DR Drill (Manual)

```markdown
## Q2 2026 DR Drill — 2026-04-24

### Scenario
AWS us-east-1 region becomes unavailable. RTO: 30 min.

### Prerequisites
- Warm standby in us-west-2 ready (standby DB synced, traffic rules prepared)
- All team members notified (on-call + manager)
- Runbook reviewed in last 7 days

### Execution (30 min)

#### Phase 1: Detection (5 min)
- [ ] Health check detects us-east-1 down
- [ ] Alert fires: "Region us-east-1 degraded"
- [ ] On-call acknowledges

#### Phase 2: Failover (15 min)
- [ ] Activate warm standby (us-west-2)
- [ ] Update DNS to point to standby
- [ ] Verify services responding from us-west-2
- [ ] Check: no data loss since last sync (usually < 5 min)

#### Phase 3: Validation (10 min)
- [ ] Run smoke tests from us-west-2
- [ ] Verify all endpoints responding
- [ ] Check audit logs: no gaps
- [ ] Monitor error rates (should be < 1%)

### Results
- Total time to restore: 18 minutes (RTO target: 30 min) ✅
- Data lost since last sync: 2 minutes ✅ (RPO target: 15 min)
- Errors during failover: 0 ✅
- Post-incident review: 2026-04-25 (team)

### Post-Drill Checklist
- [ ] Update documentation with learnings
- [ ] Identify any gaps in automation
- [ ] Schedule fixes for Q3
- [ ] Notify compliance (audit trail of DR success)
```

---

## Recovery Procedures

### Database Restore

```bash
# 1. Identify latest clean backup
aws s3 ls s3://healthcare-backups/postgres/daily/ | sort | tail -1

# 2. Create new temporary database
createdb test_recovery

# 3. Restore from backup
aws s3 cp s3://healthcare-backups/postgres/2026-04-24.sql.gz - | gunzip | \
    psql -d test_recovery

# 4. Validate data integrity
psql -d test_recovery <<'SQL'
  SELECT COUNT(*) FROM patients;  -- Should match expected count
  SELECT COUNT(*) FROM audit_events WHERE timestamp > NOW() - INTERVAL '24 hours';
SQL

# 5. Switch production to restored database
ALTER DATABASE production RENAME TO production_corrupted;
ALTER DATABASE test_recovery RENAME TO production;

# 6. Verify with smoke tests
pytest tests/smoke_test.py --verbose
```

### Git Recovery

```bash
# If primary GitHub repo is deleted
git remote add backup <backup-remote-url>
git fetch backup
git reset --hard backup/main

# Verify audit history intact
git log --oneline | head -20
```

### Audit Log Recovery

```bash
# Restore audit logs from S3
aws s3 cp s3://healthcare-backups/audit-logs/2026-04-24.jsonl.gz - | gunzip > audit-restore.jsonl

# Verify chain integrity (Merkle chain)
python3 scripts/verify_audit_chain.py audit-restore.jsonl

# Append to current audit log if valid
cat audit-restore.jsonl >> audit-logs/2026-04.jsonl
```

---

## RTO/RPO Validation

### Metric Tracking

```python
# scripts/track_rto_rpo.py

import json
from datetime import datetime

def log_backup_event(event_type, service, duration_seconds, status):
    event = {
        "event_type": event_type,  # backup_started, backup_completed, restore_started, restore_completed
        "service": service,
        "timestamp": datetime.now().isoformat(),
        "duration_seconds": duration_seconds,
        "status": status  # success, failed
    }
    
    with open("logs/backup_rto_rpo.jsonl", "a") as f:
        f.write(json.dumps(event) + "\n")

# Track backup speed
backup_start = time.time()
backup_database()
backup_duration = time.time() - backup_start
log_backup_event("backup_completed", "postgres", backup_duration, "success")

# Track restore speed
restore_start = time.time()
restore_database()
restore_duration = time.time() - restore_start
log_backup_event("restore_completed", "postgres", restore_duration, "success")

# Analyze RTO trends
def analyze_rto_trends():
    restore_times = []
    with open("logs/backup_rto_rpo.jsonl") as f:
        for line in f:
            event = json.loads(line)
            if event["event_type"] == "restore_completed":
                restore_times.append(event["duration_seconds"])
    
    return {
        "mean": statistics.mean(restore_times),
        "p95": numpy.percentile(restore_times, 95),
        "max": max(restore_times),
        "min": min(restore_times)
    }
```

---

## Automated Backup Schedule

```yaml
# Backup schedule (Kubernetes CronJob)

apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 */6 * * *"  # Every 6 hours
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: backup-tool:latest
              env:
                - name: DB_HOST
                  value: postgres.default.svc.cluster.local
                - name: S3_BUCKET
                  value: healthcare-backups
              command:
                - ./backup-database.sh
          restartPolicy: OnFailure

---

apiVersion: batch/v1
kind: CronJob
metadata:
  name: restore-validation
spec:
  schedule: "0 3 * * 0"  # Weekly Sunday 3 AM UTC
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: restore-test
              image: backup-tool:latest
              command:
                - ./weekly-restore-test.sh
          restartPolicy: OnFailure
```

---

## Compliance Documentation

Every DR drill must be documented:

```markdown
# Q2 2026 DR Drill Report

**Date:** 2026-04-24  
**Participants:** Timothy Hartzog (on-call), Sarah Martinez (backup on-call)  
**Scenario:** AWS us-east-1 region failure  
**Duration:** 18 minutes (target: 30 min)  
**Status:** ✅ PASS

### Recovery Metrics
- RTO achieved: 18 min (target: 30 min)
- RPO: 2 min data loss (target: 15 min)
- Errors during failover: 0
- Data integrity: ✅ Verified

### Lessons Learned
1. DNS failover took 3 min (can optimize with faster TTL)
2. Warm standby DB was out of sync by 2 min (increase sync frequency to 1 min)

### Actions
- [ ] Update DNS TTL from 5 min to 30 sec
- [ ] Increase standby sync from 5 min to 1 min
- [ ] Next DR drill: Q3 2026-07-24

### Approvals
- Operator: Timothy Hartzog, 2026-04-24 15:30 UTC
- Compliance: Jane Smith, 2026-04-24 15:45 UTC
```

---

## Deliverables (Phase 11)

- [ ] Backup-restore procedures documented
- [ ] 3-tier backup architecture (hot/warm/cold)
- [ ] Weekly automated restore test
- [ ] Quarterly DR drill schedule + runbooks
- [ ] RTO/RPO metrics tracking (backup_rto_rpo.jsonl)
- [ ] Recovery procedures for each failure mode
- [ ] DR drill report template
- [ ] Compliance documentation

