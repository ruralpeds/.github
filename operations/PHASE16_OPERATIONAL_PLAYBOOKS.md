# Phase 16: Operational Playbooks & Runbooks

**Status:** 📋 OPERATIONAL EXCELLENCE  
**Objective:** Establish runbooks, procedures, and playbooks for enterprise-scale healthcare software operations  
**Scope:** Infrastructure deployment, incident response, customer success, clinical integration, staff operations  
**Timeline:** Concurrent with Phases 9-15 (ongoing operational reference)

---

## Part 1: Infrastructure Deployment Playbooks

### 1.1 Production Deployment Runbook

**Deployment Checklist (Pre-Deployment):**

```
PRODUCTION DEPLOYMENT CHECKLIST

Environment: Production (us-east-1)
Service: alert-service v1.2.3
Deployer: [Name]
Date: [YYYY-MM-DD]
Approval: [Name], Director of Engineering

PRE-DEPLOYMENT (24 hours before)
─────────────────────────────────

☐ Code Review
  ☐ All PRs merged to main have 2+ approvals
  ☐ Security code scan (Bandit, SAST) passes
  ☐ Dependency scan (Safety) passes
  ☐ No critical/high vulnerabilities

☐ Testing
  ☐ Unit tests: >90% pass rate
  ☐ Integration tests: 100% pass rate
  ☐ Load tests: <2s p99 latency at 500 RPS
  ☐ Chaos engineering: Failover tests pass
  ☐ Security tests: Penetration test results reviewed

☐ Staging Validation
  ☐ Deployed to staging-us-east-1 (24h soak)
  ☐ Smoke tests pass on staging
  ☐ Performance metrics within baseline
  ☐ No errors in staging logs (>p99)
  ☐ Clinician acceptance testing sign-off

☐ Rollback Planning
  ☐ Previous version (1.2.2) tested and verified
  ☐ Rollback procedure documented and reviewed
  ☐ Database migration rollback plan (if applicable)
  ☐ Estimated RTO <5 minutes

☐ Communication
  ☐ Change notice sent to customers (24h before)
  ☐ On-call team briefed on changes
  ☐ Incident commander assigned
  ☐ War room Slack channel created (#deployment-alert-service-v1.2.3)

DEPLOYMENT WINDOW
─────────────────────────────────

Time: 02:00-04:00 UTC (least patient impact window)
Duration: Maximum 2 hours
On-Call Team:
  - Incident Commander: [Name]
  - Engineering Lead: [Name]
  - Database Admin: [Name]
  - Observability: [Name]

DEPLOYMENT STEPS
─────────────────────────────────

Step 1: Pre-flight Checks (15 min)
  ☐ kubectl cluster health: All nodes ready
  ☐ Database connectivity: All replicas healthy
  ☐ Redis cluster: All shards responsive
  ☐ Current baseline metrics recorded
    - Alert generation latency: ____ ms (p95)
    - API request latency: ____ ms (p95)
    - Error rate: ____%
    - Uptime: ____%

Step 2: Canary Deployment (30 min)
  ☐ Deploy to 10% of traffic (via Helm values)
  ☐ Monitor canary metrics (5 minute window)
    - Latency p95: within 10% of baseline
    - Error rate: <0.5%
    - Canary pod restart count: 0
  ☐ If metrics unhealthy → ROLLBACK

Step 3: Blue-Green Deployment (45 min)
  ☐ Deploy new version to 50% of traffic
  ☐ Monitor metrics (10 minute window)
    - All health checks passing
    - Error rate stable
    - Database query latency: <100ms (p95)
  ☐ If metrics unhealthy → ROLLBACK

Step 4: Full Rollout (15 min)
  ☐ Update load balancer to 100% new version
  ☐ Monitor for 5 minutes
  ☐ Scale down old version pods
  ☐ Final verification

POST-DEPLOYMENT (1 hour)
─────────────────────────────────

☐ Metrics Verification
  ☐ All metrics within expected range
  ☐ Alert accuracy: >95% sensitivity
  ☐ Alert latency: <2s p95
  ☐ API latency: <500ms p95
  ☐ Error rate: <0.1%

☐ Functional Validation
  ☐ Create test observation → Alert triggers
  ☐ Test EHR integration (Epic sandbox)
  ☐ Test mobile push notification
  ☐ Test escalation workflow

☐ Customer Notification
  ☐ "Deployment successful" message sent
  ☐ Customer support team notified
  ☐ Known issues documented (if any)
  ☐ Feature documentation updated

ROLLBACK PROCEDURE (If Needed)
─────────────────────────────────

☐ Decision to rollback: Incident Commander approval required
☐ Trigger rollback: kubectl rollout undo deployment/alert-service -n production
☐ Monitor rollback: Verify metrics return to baseline within 5 min
☐ Post-mortem: Root cause analysis within 24 hours
☐ Communication: Customer notification of issue + resolution

SIGN-OFF
─────────────────────────────────

Deployment Completed: ☐ Yes ☐ No
Successful: ☐ Yes ☐ No (if no, state reason):
_________________________________________________________________

Deployed By: _________________ Date: _____________ Time: _________
Verified By: _________________ Date: _____________ Time: _________
Incident Commander: __________ Date: _____________ Time: _________
```

**Deployment Automation (Helm + ArgoCD):**

```bash
#!/bin/bash
# deploy-to-prod.sh

set -e

SERVICE=$1
VERSION=$2
ENVIRONMENT=${3:-production}

if [ -z "$SERVICE" ] || [ -z "$VERSION" ]; then
    echo "Usage: ./deploy-to-prod.sh <service> <version> [environment]"
    exit 1
fi

echo "🚀 Starting deployment of $SERVICE:$VERSION to $ENVIRONMENT"

# Step 1: Verify image exists in ECR
echo "📦 Verifying image in ECR..."
IMAGE_URI="${ECR_REGISTRY}/${SERVICE}:${VERSION}"
aws ecr describe-images --repository-name "$SERVICE" --image-ids imageTag="$VERSION" \
    || { echo "❌ Image not found: $IMAGE_URI"; exit 1; }

# Step 2: Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."
kubectl cluster-info
kubectl get nodes
kubectl get pvc -n production

# Step 3: Canary deployment (10% traffic)
echo "🐦 Deploying canary (10% traffic)..."
helm upgrade --install "${SERVICE}-canary" "helm/${SERVICE}/" \
    --namespace production \
    --values "helm/${SERVICE}/values.yaml" \
    --values "helm/${SERVICE}/values-${ENVIRONMENT}.yaml" \
    --set image.tag="${VERSION}" \
    --set replicaCount=1 \
    --wait --timeout=5m

sleep 30

# Monitor canary metrics
echo "📊 Monitoring canary metrics..."
CANARY_ERROR_RATE=$(kubectl logs -n production -l app="${SERVICE}-canary" \
    --tail=1000 | grep -c "ERROR\|5[0-9][0-9]" || echo "0")

if [ "$CANARY_ERROR_RATE" -gt 50 ]; then
    echo "❌ Canary has high error rate, rolling back..."
    kubectl delete deployment "${SERVICE}-canary" -n production
    exit 1
fi

echo "✓ Canary deployment healthy"

# Step 4: Full rollout
echo "🎯 Rolling out to production (100% traffic)..."
helm upgrade --install "${SERVICE}" "helm/${SERVICE}/" \
    --namespace production \
    --values "helm/${SERVICE}/values.yaml" \
    --values "helm/${SERVICE}/values-${ENVIRONMENT}.yaml" \
    --set image.tag="${VERSION}" \
    --wait --timeout=10m

# Step 5: Verify
echo "✅ Verifying deployment..."
kubectl rollout status deployment/"${SERVICE}" -n production --timeout=5m

# Step 6: Cleanup canary
kubectl delete deployment "${SERVICE}-canary" -n production 2>/dev/null || true

echo "🎉 Deployment complete!"
echo "  Service: $SERVICE"
echo "  Version: $VERSION"
echo "  Environment: $ENVIRONMENT"
echo "  Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

### 1.2 Database Migration Runbook

```
DATABASE MIGRATION RUNBOOK

Migration: Add tenant-specific encryption keys to observations table
Type: Schema change with data migration
Estimated Duration: 4 hours
Estimated Downtime: 0 (online migration)
Rollback Risk: Low (reversible)

PRE-MIGRATION
─────────────

☐ Backup Strategy
  ☐ Full database snapshot taken (RDS snapshot)
  ☐ Snapshot ID: rds-snapshot-20260425-prod-pre-migration
  ☐ Backup verified and restorable
  ☐ PITR (point-in-time recovery) enabled (35 days)

☐ Read Replica Setup
  ☐ Read replica created (multi-AZ)
  ☐ Replica in sync with primary
  ☐ Will promote to primary during failover testing

☐ Performance Testing
  ☐ Migration scripts tested on staging
  ☐ Performance on 100M row table: _____ minutes
  ☐ Peak impact to production: < 10% latency increase
  ☐ Estimated I/O usage: ____ IOPS

☐ Communication
  ☐ "Scheduled maintenance" notice sent to customers
  ☐ Maintenance window: 01:00-05:00 UTC
  ☐ Support team on standby
  ☐ Incident commander assigned

MIGRATION PROCEDURE
───────────────────

Step 1: Pre-Migration Validation (15 min)
  ☐ Database size: SELECT pg_size_pretty(pg_database_size('platform_prod'));
  ☐ observations table rows: ________
  ☐ observations table size: ________
  ☐ CPU/Memory baseline: CPU ___%, Memory ___GB
  ☐ Replica lag: < 1 second

Step 2: Create New Column (30 min)
  PostgreSQL online migration (no lock):
  
  BEGIN;
  ALTER TABLE observations 
  ADD COLUMN encryption_key_version VARCHAR(50);
  COMMIT;
  
  Monitor: Max transaction time should be <30s

Step 3: Backfill Data (2 hours)
  Do NOT lock table during backfill. Use batching:
  
  DO $$
  DECLARE
      v_batch_size INTEGER := 10000;
      v_offset INTEGER := 0;
      v_total_rows INTEGER;
  BEGIN
      SELECT COUNT(*) INTO v_total_rows FROM observations;
      
      WHILE v_offset < v_total_rows LOOP
          UPDATE observations
          SET encryption_key_version = 'v1.0'
          WHERE ctid IN (
              SELECT ctid FROM observations 
              ORDER BY ctid LIMIT v_batch_size OFFSET v_offset
          );
          v_offset := v_offset + v_batch_size;
          
          IF v_offset % 100000 = 0 THEN
              RAISE NOTICE 'Processed %/%', v_offset, v_total_rows;
              COMMIT;
          END IF;
      END LOOP;
  END$$;
  
  Monitor:
  - Query latency trending: Should stay <100ms p95
  - Replica lag: Should stay <10 seconds
  - Application errors: Monitor CloudWatch for spikes

Step 4: Add Constraint (15 min)
  ALTER TABLE observations 
  ALTER COLUMN encryption_key_version SET NOT NULL;
  
  (Online in PostgreSQL 12+)

Step 5: Validate Migration (15 min)
  ☐ SELECT COUNT(*) FROM observations 
    WHERE encryption_key_version IS NULL;
    Result should be: 0
  
  ☐ Sample random rows:
    SELECT * FROM observations 
    WHERE encryption_key_version IS NULL 
    LIMIT 10;
    
  ☐ Index on new column (if needed):
    CREATE INDEX CONCURRENTLY idx_encryption_key_version 
    ON observations(encryption_key_version);

POST-MIGRATION
──────────────

☐ Verification (30 min)
  ☐ Application tests pass
  ☐ EHR integration working
  ☐ Mobile sync tests pass
  ☐ Alert generation latency: <2s p95
  ☐ No increase in error rate

☐ Monitoring (1 hour)
  ☐ Database query latency: Stable
  ☐ Replication lag: <1 second
  ☐ CPU/Memory: Back to baseline
  ☐ Application performance: Baseline

☐ Cleanup
  ☐ Remove temporary migration tables
  ☐ Update application code to use new column
  ☐ Deploy code changes (if needed)
  ☐ Snapshot database again (post-migration)

ROLLBACK PROCEDURE
───────────────────

If migration fails or causes issues:

Step 1: Immediate Actions
  ☐ STOP all INSERT/UPDATE operations (application failover)
  ☐ Promote read replica to primary (if primary is degraded)
  ☐ Notify incident commander + DBA

Step 2: Rollback Option A: Restore from Pre-Migration Snapshot
  ☐ Create new database from snapshot (rds-snapshot-20260425-prod-pre-migration)
  ☐ Update RDS endpoint DNS
  ☐ Verify application connectivity
  ☐ Estimated time: 30-60 minutes

Step 3: Rollback Option B: Reverse Migration (if partial completion)
  ☐ ALTER TABLE observations DROP COLUMN encryption_key_version;
  ☐ Verify table structure
  ☐ Deploy rolled-back application code
  ☐ Estimated time: 10-15 minutes

SIGN-OFF
──────────

Migration Completed: ☐ Yes ☐ No
Successful: ☐ Yes ☐ No
Migration Start: ___:___ UTC    End: ___:___ UTC
Rows Migrated: _________________
Issues Encountered: _____________________________________________
_________________________________________________________________

Executed By: _________________ Date: _____________ Time: _________
Verified By: _________________ Date: _____________ Time: _________
Incident Commander: __________ Date: _____________ Time: _________
```

---

## Part 2: Incident Response Procedures

### 2.1 Major Incident Playbook

```
MAJOR INCIDENT PLAYBOOK

Severity Level: SEV-1 (System down, affecting all hospitals)

INCIDENT SEVERITY DEFINITIONS
───────────────────────────────

SEV-1 (CRITICAL):
  - System completely down or unavailable to >50% hospitals
  - Data corruption or loss
  - Security breach
  - HIPAA/regulatory violation
  - Patient safety risk
  Response time: <5 minutes
  War room: Required
  Escalation: VP Engineering + CTO

SEV-2 (HIGH):
  - Partial outage (10-50% hospitals affected)
  - Degraded performance (latency >5s p95)
  - Feature unavailable but core alerting works
  - Potential data inconsistency
  Response time: <15 minutes
  War room: Optional
  Escalation: Engineering Lead + On-Call Manager

SEV-3 (MEDIUM):
  - Service degradation (<10% impact)
  - Non-critical feature broken
  - Performance issue (latency 2-5s p95)
  - Minor data quality issue
  Response time: <30 minutes
  War room: Not required
  Escalation: On-Call Engineer

SEV-4 (LOW):
  - Cosmetic issues
  - Non-urgent feature requests
  - Minor performance improvement needed
  Response time: <4 hours
  Escalation: Not required

INCIDENT ACTIVATION (SEV-1)
──────────────────────────────

☐ Detection
  - PagerDuty alert triggers (automated)
  - On-call engineer receives page
  - Customer report (Slack, support ticket)
  
☐ Immediate Actions (First 2 Minutes)
  ☐ Acknowledge PagerDuty alert
  ☐ Check status page (is.platform.local)
  ☐ Check #incidents Slack channel for ongoing incidents
  ☐ Join war room: #sev1-incident (auto-created)
  
☐ War Room Setup (Minutes 2-5)
  ☐ Start Zoom/video call (link in Slack channel)
  ☐ Incident Commander: Assume incident leadership
  ☐ Declare SEV-1: "SEV-1 INCIDENT: [Service] [Issue]"
  ☐ Record timeline in #sev1-incident (Slack threading)
  
☐ Initial Investigation (Minutes 5-15)
  ☐ Incident Commander: Assign roles
    - Lead Investigator (identify root cause)
    - Communications Lead (customer updates)
    - Remediation Lead (fix implementation)
  
  ☐ Lead Investigator: Check diagnostics
    - Application logs: kubectl logs -f deployment/alert-service
    - Metrics: Prometheus dashboard (latency, error rate, throughput)
    - Database: RDS performance insights (slow queries, locks)
    - Infrastructure: AWS console (instance health, network issues)
    - Recent changes: git log --oneline -20
  
  ☐ Identify preliminary root cause (RCA):
    ["Backend Error" | "Database Issue" | "Infrastructure" | "Third-party" | "Unknown"]
  
  ☐ Communications Lead: Status message
    "We are investigating elevated error rates affecting alert delivery.
     ETA for update: 10 minutes. Will post updates every 5 minutes."

REMEDIATION TRACKS (Parallel)
────────────────────────────────

Track A: Backend Service Issue (Most Common)
  ☐ Check recent deployments: kubectl rollout history deployment/alert-service
  ☐ If bad deploy within last 1 hour → ROLLBACK
    kubectl rollout undo deployment/alert-service
  ☐ Monitor metrics post-rollback (5 minutes)
  ☐ If issue persists → escalate to database/infrastructure tracks

Track B: Database Issue
  ☐ Check database metrics:
    - Active connections: Approaching limit?
    - Long-running queries: Any locks?
    - Replication lag: Primary/replica out of sync?
  ☐ Database admin actions:
    - Kill long-running queries: SELECT pg_terminate_backend(pid)
    - Increase connections if pool exhausted
    - Failover to replica if primary degraded
  ☐ Monitor query latency post-action (2 minutes)

Track C: Infrastructure Issue
  ☐ Check AWS CloudWatch
    - EC2 node health: Any crashed instances?
    - Network: High latency or packet loss?
    - Load balancer: All targets healthy?
  ☐ Infrastructure actions:
    - Scale up cluster if CPU/Memory constrained
    - Restart unhealthy pods
    - Check VPN connectivity (if on-premise)
  ☐ Monitor infrastructure metrics (2 minutes)

Track D: Third-party Dependency
  ☐ Check external service status pages:
    - AWS (api.aws.amazon.com/health)
    - Okta (status.okta.com)
    - Twilio (status.twilio.com)
  ☐ If third-party down:
    - Graceful degradation (disable optional integrations)
    - Notify customers of limited functionality
    - Wait for third-party recovery (monitor their status page)

ESCALATION DECISION TREE
──────────────────────────────

┌─ Service recovering on its own?
│  ├─ YES: Continue monitoring, stand by
│  └─ NO: Continue to remediation track
│
├─ Root cause identified?
│  ├─ YES: Implement fix based on track
│  └─ NO: Contact subject matter experts (SME)
│
├─ Is customer data at risk?
│  ├─ YES: Activate security incident response, notify legal
│  └─ NO: Continue to remediation
│
└─ Need external help?
   ├─ YES: Contact AWS TAM, vendor support, SME on-call
   └─ NO: Continue remediation

COMMUNICATION CADENCE
──────────────────────

Every 5 minutes (until resolved):
  - War room update: "Status: [investigation | remediation | recovery]"
  - Slack status update: @channel brief message
  - Customer notification: Status page update (brief)

Timeline example (SEV-1 incident):
  00:00 - PagerDuty alert, incident declared
  00:05 - Root cause identified (database lock)
  00:10 - Remediation started (kill long query)
  00:15 - Service recovering
  00:20 - Service fully recovered
  00:25 - Customer notification: "Issue resolved"
  04:00 - Post-mortem scheduled (4 hours post-incident)

POST-INCIDENT (Same Day)
──────────────────────────

☐ Immediate Actions (First 4 Hours)
  ☐ Write incident summary (5 bullet points)
  ☐ Document timeline (exact timestamps)
  ☐ Note customer impact (hours down, hospitals affected)
  ☐ Preliminary root cause (not final)
  ☐ Post to #incidents Slack with summary

☐ Incident Review (Within 24 Hours)
  ☐ Schedule post-mortem meeting
  ☐ Participants: Incident Commander, Lead Investigator, Eng Lead, Product, Ops
  ☐ Post-mortem template: https://wiki/post-mortem-template

☐ Resolution Verification (Within 48 Hours)
  ☐ Verify root cause fix deployed to production
  ☐ Confirm monitoring/alerting catches similar issues in future
  ☐ Action items assigned and tracked

RUNBOOK TEMPLATE (For On-Call)
─────────────────────────────────

Critical Issues Flowchart:
│
├─ Latency High (>5s p95)?
│  ├─ Check RDS: SELECT * FROM pg_stat_activity WHERE state='active';
│  ├─ Check API pods: kubectl top pods -n production
│  └─ Check network: ping -c 5 rds-endpoint.amazonaws.com
│
├─ Error Rate High (>1%)?
│  ├─ Check logs: kubectl logs -f deployment/alert-service | grep ERROR
│  ├─ Check recent deploy: kubectl rollout history
│  └─ Check config: kubectl get configmap alert-service-config
│
├─ Alerts Not Delivered?
│  ├─ Check alert generation: SELECT count(*) FROM alerts WHERE created_at > now() - interval '5 min';
│  ├─ Check notification queue: SELECT count(*) FROM notification_queue;
│  └─ Check EHR integration: curl -H "Auth: Bearer token" https://api/ehr-integration/health
│
└─ Data Integrity Issue?
   ├─ Check for data corruption: SELECT count(*) FROM observations WHERE value IS NULL;
   ├─ Check replication lag: SELECT slot_name, restart_lsn FROM pg_replication_slots;
   └─ STOP applications, contact DBA for investigation
```

### 2.2 Common Issues & Resolutions

```
COMMON ISSUES RESOLUTION GUIDE

ISSUE #1: Alert Latency High (>2 seconds p95)
──────────────────────────────────────────────

Symptoms:
  - AlertLatency metric in Grafana trending up
  - PagerDuty alert: "alert_delivery_latency > 5000ms"
  - Customers report slow alert response

Investigation:
  ☐ Check baseline latency (last 24 hours)
  ☐ Identify when spike started (correlate with deployments/changes)
  ☐ Check which hospitals affected (all or specific ones?)

Root Cause Checklist:
  ☐ Database query slow?
    psql> EXPLAIN ANALYZE SELECT * FROM observations 
          WHERE patient_id = 'xyz' ORDER BY timestamp DESC LIMIT 10;
    
  ☐ Cache miss causing repeated queries?
    redis> INFO stats | grep hits,misses
    
  ☐ Alert rule evaluation slow?
    Check rule complexity: Number of conditions, nested logic
    
  ☐ EHR integration slow?
    Check Epic/Cerner API response time
    
  ☐ Network latency high?
    Check VPC peering, inter-AZ latency

Remediation:
  Option A: Scale API pods (if CPU-bound)
    kubectl scale deployment alert-service --replicas=16
  
  Option B: Optimize database query
    CREATE INDEX idx_observations_patient_timestamp 
    ON observations(patient_id, timestamp DESC);
  
  Option C: Increase cache TTL (if safe)
    # Configuration change: observation_cache_ttl = 600s
  
  Option D: Simplify alert rules
    Review rules, remove unnecessary conditions
  
  Option E: Async EHR integration (if on critical path)
    Move EHR sync to background job, don't block alert response

Prevention:
  - Monitor alert latency continuously (dashboard)
  - Alert threshold: P95 > 3 seconds (SEV-2)
  - Load test new alert rules before production
  - Alert rule complexity limits (max 5 conditions per rule)

---

ISSUE #2: Database Connection Pool Exhausted
───────────────────────────────────────────────

Symptoms:
  - "Too many connections" error in logs
  - New connections failing
  - Existing connections hanging

Investigation:
  psql> SELECT count(*) FROM pg_stat_activity;
  psql> SELECT usename, application_name, state, query_start 
        FROM pg_stat_activity WHERE state != 'idle' ORDER BY query_start DESC;

Root Cause Checklist:
  ☐ Connection leak in application?
    Check for code not returning connections to pool
  
  ☐ Long-running query holding connections?
    SELECT (now() - query_start) as elapsed, query 
    FROM pg_stat_activity WHERE state = 'active' 
    ORDER BY query_start;
  
  ☐ Spike in traffic?
    Check traffic metrics (requests/sec)
  
  ☐ Replica replication lag?
    SELECT extract(epoch FROM (now() - pg_last_xact_replay_timestamp())) as lag;

Immediate Actions:
  ☐ Kill idle connections (safe):
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE state = 'idle' AND query_start < now() - interval '10 min';
  
  ☐ Kill long-running query (if safe):
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE state = 'active' AND query_start < now() - interval '1 hour';
  
  ☐ Increase connection pool (temporary):
    # pgBouncer: max_client_conn = 5000 (from 1000)

Permanent Fix:
  Option A: Optimize application code
    - Add connection timeout
    - Implement retry logic with backoff
    - Pool connection properly
  
  Option B: Increase RDS instance size
    - Scale up to r6i.2xlarge (64GB, higher max connections)
  
  Option C: Add read replicas
    - Distribute read queries across replicas
  
  Option D: Connection pool optimization
    - Reduce pgBouncer timeout
    - Implement statement-level connection pooling

---

ISSUE #3: Mobile App Push Notifications Not Delivering
─────────────────────────────────────────────────────────

Symptoms:
  - Users not receiving iOS/Android notifications
  - Notifications appear 5+ minutes late
  - Only some users affected

Investigation:
  ☐ Check notification queue:
    SELECT count(*) FROM notification_queue WHERE status = 'pending';
  
  ☐ Check APNs/FCM delivery:
    # iOS: Check Apple Push Notification Service logs
    # Android: Check Firebase Cloud Messaging dashboard
  
  ☐ Check device tokens:
    SELECT device_id, last_token_refresh FROM user_devices 
    WHERE device_os = 'ios' AND device_token IS NULL LIMIT 5;

Root Cause Checklist:
  ☐ Invalid device tokens?
    Many devices may have revoked push permissions
  
  ☐ Push service rate limit?
    APNs/FCM has rate limits (check service logs)
  
  ☐ Batch processing lag?
    Notification job stuck or failing?
  
  ☐ Network issue?
    VPN/firewall blocking APNs/FCM ports?

Remediation:
  Option A: Requeue failed notifications
    UPDATE notification_queue SET status = 'pending' 
    WHERE status = 'failed' AND created_at > now() - interval '1 hour';
    
    # Then trigger worker: POST /api/internal/notification-worker/process
  
  Option B: Refresh invalid device tokens
    # Identify inactive devices (no successful push in 7 days)
    # Manually trigger token refresh on mobile app
  
  Option C: Increase notification worker threads
    # Configuration: notification_worker_threads = 32 (from 8)
  
  Option D: Check APNs/FCM credentials
    # Verify certificates haven't expired
    openssl x509 -in apple-push-cert.pem -noout -dates

---

ISSUE #4: Alert Accuracy Low (<95% Sensitivity)
───────────────────────────────────────────────

Symptoms:
  - Clinicians reporting missed alerts
  - Patient deterioration alerts firing too late
  - ML model performance degraded

Investigation:
  ☐ Calculate sensitivity on recent data:
    SELECT 
        count(*) FILTER (WHERE alert_raised AND patient_deteriorated) as true_positives,
        count(*) FILTER (WHERE NOT alert_raised AND patient_deteriorated) as false_negatives,
        count(*) FILTER (WHERE alert_raised AND patient_deteriorated) * 100.0 / 
        (count(*) FILTER (WHERE alert_raised AND patient_deteriorated) + 
         count(*) FILTER (WHERE NOT alert_raised AND patient_deteriorated)) as sensitivity
    FROM observations_with_outcomes
    WHERE timestamp > now() - interval '7 days';
  
  ☐ Check model version in production:
    kubectl get configmap alert-service-config -o jsonpath='{.data.model_version}'
  
  ☐ Check for data drift:
    # Compare training data distribution vs production
    # e.g., mean HR in training vs mean HR today

Root Cause Checklist:
  ☐ Model degradation?
    Retraining overdue (>30 days)?
  
  ☐ Patient population changed?
    New cohort with different vital sign patterns?
  
  ☐ Sensor calibration drift?
    Vital sign monitors not calibrated recently?
  
  ☐ Threshold too high?
    Rule configured with high thresholds to reduce false positives?

Remediation:
  Option A: Retrain model immediately
    kubectl create job --from=cronjob/model-retraining model-retrain-urgent-$(date +%s) -n ml
  
  Option B: Adjust thresholds
    # Decrease P1 thresholds temporarily
    UPDATE alert_rules SET threshold = threshold * 0.95 WHERE severity = 'P1';
  
  Option C: Review and adjust alert rules
    # Check for overly restrictive "sustained" conditions
    # e.g., require 10 min of HR > 130 (maybe reduce to 5 min)
  
  Option D: Add more sensors
    # If missing data, collect more vital signs
    # Improve signal with redundancy

Prevention:
  - Continuous model monitoring (weekly sensitivity check)
  - Quarterly retraining with validation
  - Alert threshold review process (clinician + data scientist)
```

---

## Part 3: Customer Success Playbooks

### 3.1 Hospital Onboarding Runbook

```
HOSPITAL ONBOARDING RUNBOOK (90-Day Program)

Hospital: [Name]
Contact: [Title] - [Name] [Email] [Phone]
Account Manager: [Name]
Technical Lead: [Name]
Go-Live Date: [Date] (Target)
Subscription Tier: [Basic | Professional | Enterprise]

PHASE 1: KICKOFF (Week 1)
──────────────────────────

Objective: Align on scope, timeline, success metrics

Day 1: Initial Meeting
  ☐ Call with IT Director + Clinical Leadership
  ☐ Review goals and success metrics
  ☐ Identify key stakeholders (IT, Clinical, Security, Compliance)
  ☐ Discuss network requirements and infrastructure
  ☐ Document hospital-specific requirements

Day 2-3: Technical Discovery
  ☐ Meet with IT Operations team
  ☐ Audit current infrastructure
    - EHR system (Epic, Cerner, Athena)
    - Vital sign monitors (Philips, GE, Medtronic)
    - Network architecture and security
    - Compliance requirements (HIPAA, state-specific)
  ☐ Identify integration points
  ☐ Document any constraints or issues

Day 4-5: Implementation Planning
  ☐ Create detailed integration plan (Epic/Cerner adapter)
  ☐ Create deployment plan (phased rollout strategy)
  ☐ Define staff training schedule
  ☐ Create 90-day timeline with milestones
  ☐ Identify and assign action items

Deliverables:
  ☐ Hospital Onboarding Plan (document)
  ☐ Technical Implementation Roadmap
  ☐ 90-day Gantt chart
  ☐ Success Metrics Dashboard (draft)
  ☐ Stakeholder communication plan

PHASE 2: PREPARATION (Weeks 2-4)
──────────────────────────────────

Objective: Prepare hospital systems for deployment

Week 2: Network & Security Preparation
  Hospital IT:
    ☐ Network assessment (latency, bandwidth)
    ☐ Firewall rules for cloud connectivity
    ☐ VPN setup (if on-premise hybrid)
    ☐ SSL certificate provisioning
    ☐ Data encryption requirements
  
  Our Team:
    ☐ Provision hospital tenant in production
    ☐ Create hospital-specific encryption keys (KMS)
    ☐ Configure hospital IP whitelist
    ☐ Setup HIPAA logging (hospital-specific partition)

Week 3: EHR Integration Setup
  Hospital IT:
    ☐ Provision credentials for Epic/Cerner API
    ☐ Create service accounts for system integration
    ☐ Test API connectivity from our servers
    ☐ Sandbox environment setup (if available)
  
  Our Team:
    ☐ Deploy EHR adapter (Epic/Cerner/Athena specific)
    ☐ Test sandbox integration (100% success rate)
    ☐ Create alert routing rules (which department → which alert type)
    ☐ Map vital sign LOINC codes to hospital standards

Week 4: Device Integration Setup
  Hospital Clinical Engineering:
    ☐ Identify all vital sign monitors
    ☐ Configure monitor exports (network/direct protocol)
    ☐ Test connectivity from monitors to platform
  
  Our Team:
    ☐ Deploy device adapters (Philips, GE, Medtronic)
    ☐ Validate data ingestion (observations flowing correctly)
    ☐ Test alert generation with sample data

Deliverables:
  ☐ Network connectivity verified
  ☐ EHR integration sandbox tested (100% success)
  ☐ Device adapters deployed and validated
  ☐ Hospital-specific configuration completed
  ☐ Security audit sign-off

PHASE 3: PILOTING (Weeks 5-8)
───────────────────────────────

Objective: Validate platform with real patient data (limited rollout)

Week 5: Pilot Unit Selection & Training
  ☐ Select pilot unit (ICU recommended, 20-40 beds)
  ☐ Identify pilot users (3-5 clinicians)
  ☐ Conduct training session (2 hours)
    - Platform overview
    - Mobile app walkthrough
    - Alert interpretation
    - Escalation procedures
    - Troubleshooting
  ☐ Provide reference cards and documentation
  ☐ Schedule daily check-ins

Week 6: Production Rollout (Pilot Unit)
  ☐ Deploy to pilot unit only (via alert rules config)
  ☐ Monitor closely (daily metrics review)
    - Alert generation rate
    - Alert accuracy (vs clinician assessment)
    - False positive rate
    - System reliability
  ☐ Gather feedback (daily user feedback survey)
  ☐ Adjust thresholds based on feedback
  ☐ Document any issues

Week 7: Validation & Issue Resolution
  ☐ Review 1-week pilot data
  ☐ Calculate sensitivity/specificity
  ☐ Address any issues or concerns
  ☐ Refine alert rules based on clinical feedback
  ☐ Train additional unit staff

Week 8: Prepare for Full Rollout
  ☐ Plan full-hospital rollout (rolling deployment)
  ☐ Identify all end-user groups needing training
  ☐ Schedule training sessions
  ☐ Create communication plan for staff

Deliverables:
  ☐ Pilot program results (alert accuracy >95%)
  ☐ Clinical feedback summary
  ☐ Refined alert rules & thresholds
  ☐ Full rollout plan
  ☐ Staff training materials

PHASE 4: FULL ROLLOUT (Weeks 9-12)
───────────────────────────────────

Objective: Deploy across entire hospital

Week 9: Rollout to ICU/High Acuity Units
  ☐ Train ICU staff (all shift rotations)
  ☐ Deploy system (ICU units, ~100 beds)
  ☐ Daily monitoring and support
  ☐ Gather feedback, refine thresholds
  ☐ Track adoption metrics

Week 10: Rollout to Medical/Surgical Floors
  ☐ Train medical/surgical staff
  ☐ Deploy to medical/surgical floors (~300 beds)
  ☐ Support volume increases
  ☐ Refine alert rules
  ☐ Monitor for any issues

Week 11: Rollout to Remaining Units
  ☐ Deploy to remaining units (step-down, telemetry, etc.)
  ☐ Achieve full hospital coverage
  ☐ Complete all staff training
  ☐ Ensure all integrations working (EHR, devices)

Week 12: Stabilization & Handoff
  ☐ System stable (all critical issues resolved)
  ☐ Staff comfortable using platform
  ☐ Alert accuracy validated (>95%)
  ☐ Transition to steady-state support
  ☐ Conduct go-live retrospective

Success Metrics (End of Week 12):
  ☐ System uptime: >99.9%
  ☐ Alert delivery latency: <2s (p95)
  ☐ Alert accuracy: >95% sensitivity
  ☐ User adoption: >80% of eligible clinicians
  ☐ Support tickets: <5 per week
  ☐ Hospital team trained and confident

ONGOING SUPPORT (After Week 12)
────────────────────────────────

Monthly:
  ☐ Success metrics review (dashboard)
  ☐ Alert accuracy analysis (trending)
  ☐ Customer health check (quarterly)
  ☐ Clinical outcome tracking (lives saved, outcomes improved)

Quarterly:
  ☐ QBR (Quarterly Business Review) with hospital leadership
  ☐ Feature requests and roadmap alignment
  ☐ Pricing and expansion discussion

Annual:
  ☐ Contract renewal discussion
  ☐ Expansion to additional hospital network (if applicable)
  ☐ Technology refresh / platform upgrade discussion
```

### 3.2 Customer Issue Escalation Procedures

```
CUSTOMER ISSUE ESCALATION MATRIX

┌────────────────────────────────────────────────────────────┐
│ Issue Type    │ Severity │ Response │ Resolution │ Escalate│
├────────────────────────────────────────────────────────────┤
│ Alert not     │ SEV-1    │ <5 min   │ <1 hour    │ CTO     │
│ delivering    │ CRITICAL │ (24/7)   │            │         │
├────────────────────────────────────────────────────────────┤
│ False alerts  │ SEV-2    │ <15 min  │ <4 hours   │ Eng Lead│
│ causing fatigue│ HIGH    │ (business │            │         │
│               │          │ hours)   │            │         │
├────────────────────────────────────────────────────────────┤
│ EHR           │ SEV-2    │ <15 min  │ <2 hours   │ CTO     │
│ integration   │ HIGH     │          │            │         │
│ broken        │          │          │            │         │
├────────────────────────────────────────────────────────────┤
│ Mobile app    │ SEV-3    │ <1 hour  │ <8 hours   │ Eng Lead│
│ crash         │ MEDIUM   │ (business │            │         │
│               │          │ hours)   │            │         │
├────────────────────────────────────────────────────────────┤
│ Slow alerts   │ SEV-2    │ <15 min  │ <4 hours   │ Eng Lead│
│ (>5s latency) │ HIGH     │          │            │         │
├────────────────────────────────────────────────────────────┤
│ Feature       │ SEV-4    │ <4 hours │ <1 week    │ Product │
│ request       │ LOW      │ (business │            │ Manager │
│               │          │ hours)   │            │         │
├────────────────────────────────────────────────────────────┤
│ Training      │ SEV-3    │ <1 day   │ <1 week    │ Success │
│ request       │ MEDIUM   │          │            │ Manager │
├────────────────────────────────────────────────────────────┤
│ Billing       │ SEV-3    │ <1 day   │ <3 days    │ Finance │
│ question      │ MEDIUM   │          │            │ Manager │
└────────────────────────────────────────────────────────────┘

ESCALATION WORKFLOW
──────────────────

Level 1: Support Team (First Response)
  - Triage issue and determine severity
  - Check knowledge base for common issues
  - If resolvable: Fix and document
  - If not: Escalate to Level 2 with full context

Level 2: Engineering On-Call (Technical)
  - Investigate root cause
  - Implement temporary fix if urgent
  - Plan permanent fix
  - Communicate status to customer
  - If unresolved after 30 min: Escalate to Level 3

Level 3: Engineering Lead (Complex Issues)
  - Complex technical issues requiring architecture review
  - Multiple teams involved
  - If still unresolved: Escalate to Level 4

Level 4: CTO / VP Engineering (Strategic Escalations)
  - Issues affecting multiple customers
  - Potential regulatory implications
  - Product strategy decisions needed
  - Executive customer relationships at risk

ESCALATION COMMUNICATION
──────────────────────────

Initial Response (Within SLA):
  ☐ Acknowledge issue
  ☐ Confirm severity level
  ☐ Provide initial diagnosis
  ☐ Give estimated resolution time
  
  Example: "We've identified that alert latency is elevated due to
           database connection pool exhaustion. We're implementing
           a fix now and expect resolution within 30 minutes."

Update Cadence:
  - SEV-1: Every 5 minutes
  - SEV-2: Every 15 minutes
  - SEV-3: Every 1 hour
  - SEV-4: As needed (within 48 hours)

Resolution Communication:
  ☐ Confirm issue is resolved
  ☐ Describe root cause
  ☐ Explain permanent fix
  ☐ Provide prevention info for future
  
  Example: "We've resolved the alert latency by optimizing a database
           query that was causing connection pool exhaustion. We've also
           added monitoring to alert us if this happens again in the future."

Post-Incident Follow-up:
  - Survey: Customer satisfaction with resolution
  - Schedule: Debrief call (if major incident)
  - Deliverable: Root cause analysis document
```

---

## Part 4: Clinical Workflow Integration Guides

### 4.1 Clinician Onboarding Guide

```
CLINICIAN ONBOARDING GUIDE

Duration: 2 hours
Audience: Nurses, Physicians, Clinical Staff
Trainer: Clinical Success Manager + Experienced User

MODULE 1: PLATFORM OVERVIEW (20 minutes)
──────────────────────────────────────────

Learning Objectives:
  - Understand purpose and value of platform
  - Know key features and capabilities
  - Understand alert severity levels

Content:
  1. Why ClinicalGuard?
     - Detect patient deterioration earlier
     - Provide time for intervention
     - Reduce preventable complications
     - Outcome: 2-3% reduction in mortality
  
  2. How It Works
     - Continuous vital sign monitoring (8 parameters)
     - Real-time alert generation
     - Notification to clinical staff
     - Documentation of response
  
  3. Alert Severity Levels
     ┌──────┬────────────┬──────────────────────────┐
     │Level │ Color      │ Example                  │
     ├──────┼────────────┼──────────────────────────┤
     │ P1   │ RED        │ HR >130 sustained >10min │
     │      │ (Critical) │ → Notify immediately     │
     ├──────┼────────────┼──────────────────────────┤
     │ P2   │ YELLOW     │ Temp >39°C sustained 15min
     │      │ (Warning)  │ → Assess within 15 min  │
     ├──────┼────────────┼──────────────────────────┤
     │ P3   │ BLUE       │ Glucose declining        │
     │      │ (Info)     │ → Review at next rounds  │
     └──────┴────────────┴──────────────────────────┘

MODULE 2: MOBILE APP WALKTHROUGH (30 minutes)
────────────────────────────────────────────────

Learning Objectives:
  - Navigate mobile app interface
  - Respond to alerts
  - Document interventions
  - Understand offline capability

Features Covered:
  
  1. Home Screen
     - Active alerts by severity (P1, P2, P3)
     - Patient search bar
     - Shift summary (patients assigned to me)
  
  2. Alert Detail Screen
     - Alert reason (what triggered it)
     - Patient context (age, comorbidities, recent vitals)
     - Recommended action (clinical guidance)
     - Acknowledge / snooze / escalate buttons
  
  3. Patient Timeline
     - Vital sign graph (last 24 hours)
     - Alert history (what alerted and when)
     - Intervention log (what we did)
  
  4. Offline Mode
     - Alerts sync when connectivity restored
     - Interventions queued for transmission
     - "Offline mode enabled" indicator

Hands-On Practice:
  - Demo: Create test observation → trigger alert
  - Practice: Acknowledge alert and document intervention
  - Q&A: Common issues and troubleshooting

MODULE 3: WORKFLOW INTEGRATION (40 minutes)
──────────────────────────────────────────────

Learning Objectives:
  - Integrate into daily clinical workflow
  - Know when to trust vs. override system
  - Collaborate with other team members
  - Escalate appropriately

Workflow Scenarios:

  Scenario 1: P1 Alert (Red, Critical)
    ├─ You receive push notification + alarm tone
    ├─ You check patient immediately (within 2 minutes)
    ├─ You assess: Is alert justified?
    │  ├─ YES: Perform intervention (assessment, meds, monitor closer)
    │  └─ NO: Override alert (document reason)
    ├─ You acknowledge alert with notes ("Patient tachycardic due to pain")
    ├─ System: Escalate to charge nurse if not acknowledged within 5 min
    └─ Outcome: Alert tracked, can improve thresholds over time

  Scenario 2: Recurring P2 Alerts (Yellow, Warning)
    ├─ You notice same patient alerting multiple times daily
    ├─ You review alert reason: What's the pattern?
    ├─ You contact physician: "Should we adjust thresholds for this patient?"
    ├─ You contact us: "This patient's profile needs customization"
    └─ Outcome: We retrain ML model, reduce false alerts for this patient type

  Scenario 3: System Suggests Intervention (AI Recommendation)
    ├─ Alert includes: "Patient deteriorating → recommend assessment"
    ├─ You use this as ONE input among many
    ├─ You apply clinical judgment: Other signs? History?
    ├─ You determine: Yes, needs intervention (or No, false alarm)
    └─ Key: You're in charge, system is decision support

Escalation Protocol:
  
  Who to Contact:
    - App question or technical issue → Support team (chat in app)
    - Alert accuracy question → Clinical Success Manager
    - System down / not working → IT support (hospital phone)
  
  How to Escalate Alert:
    P1 → Charge nurse (tap "escalate" button)
    P2 → Physician (call, or escalate through app)
    P3 → Your regular rounds (review periodically)

MODULE 4: PRACTICE & QUESTIONS (30 minutes)
──────────────────────────────────────────────

Hands-On Practice:
  - Mobile app: Receive test alert, respond
  - Patient context: Review patient timeline
  - Offline mode: Simulate network disconnect
  - EHR integration: See alert pop up in Epic/Cerner

Q&A Forum:
  - "What if alert is wrong?" → You can override it
  - "What if I miss an alert?" → It escalates to supervisor
  - "How do I provide feedback?" → Your responses train the system
  - "What's my role?" → You're the expert, system is support

COMPETENCY ASSESSMENT (Required)
─────────────────────────────────

Readiness Quiz (10 questions, 80% passing):
  1. What color is a P1 alert? → RED
  2. What should you do for P1? → Assess immediately
  3. Can you override an alert? → YES
  4. How do offline interventions work? → Queue for sync
  5. Who escalates if you don't respond? → Charge nurse
  ... (5 more scenarios)

Hands-On Demonstration:
  - Receive alert → Acknowledge it → Document intervention
  - Clinician must demonstrate competency
  - Trainer signs off: "Competent for independent use"

REFERENCE MATERIALS
─────────────────────

Provided to Each Clinician:
  ☐ Quick Reference Card (laminated, bedside use)
  ☐ User Manual (PDF, digital)
  ☐ Frequently Asked Questions (troubleshooting)
  ☐ Clinical algorithm card (when to trust alerts)
  ☐ 24/7 support contact card

Quick Reference Card Example:
  ╔═══════════════════════════════════════════╗
  ║      CLINICALGUARD QUICK REFERENCE        ║
  ╠═══════════════════════════════════════════╣
  ║ P1 (RED) → Assess immediately             ║
  ║ P2 (YELLOW) → Assess within 15 minutes    ║
  ║ P3 (BLUE) → Review at next rounds         ║
  ║                                           ║
  ║ KEY ACTIONS:                              ║
  ║ 1. Tap alert to see patient context      ║
  ║ 2. Assess patient (don't trust system)   ║
  ║ 3. Perform intervention if needed        ║
  ║ 4. Tap "Acknowledge" + document action   ║
  ║ 5. Escalate if needed (tap "Escalate")   ║
  ║                                           ║
  ║ SUPPORT: In-app chat or 1-800-PLATFORM  ║
  ╚═══════════════════════════════════════════╝

REFRESHER TRAINING (Quarterly)
───────────────────────────────

Topics:
  - New features (quarterly updates)
  - Common mistakes (preventing alert fatigue)
  - Clinical outcomes (how are we doing?)
  - Feedback (what's working, what isn't)

Format:
  - 30-minute group session (incorporate into staff meeting)
  - Optional: 1-on-1 for struggling users
  - Outcome: Updated competency assessment
```

---

## Part 5: Disaster Recovery & Business Continuity

### 5.1 Disaster Recovery Plan

```
DISASTER RECOVERY PLAN (DRP)

Recovery Time Objective (RTO): 1 hour
Recovery Point Objective (RPO): 15 minutes

DISASTER SCENARIOS & RESPONSES
────────────────────────────────

SCENARIO 1: Complete Data Center Outage
────────────────────────────────────────
Trigger: Entire AWS us-east-1 region down (rare but possible)

Detection:
  ☐ Automated: CloudWatch alarms trigger across multiple services
  ☐ Manual: Customers report complete unavailability
  ☐ Time to detect: <2 minutes

Immediate Response (<5 minutes):
  ☐ Incident Commander declares SEV-1
  ☐ Initiate disaster recovery procedures
  ☐ Page on-call DBA + infrastructure team
  ☐ Start recovery runbook (this document)

Recovery Steps (Parallel):

  Step 1: Prepare Backup Infrastructure (15 min)
    ☐ Spin up RDS from latest snapshot
      rds-snapshot-prod-backup (refreshed hourly)
    ☐ Restore to new db.r6i.2xlarge instance (multi-AZ)
    ☐ Verify database integrity
  
  Step 2: Deploy Application (15 min)
    ☐ Deploy to backup region (us-west-2)
    ☐ Scale to match production capacity (32 API pods)
    ☐ Configure all services (configmaps, secrets)
  
  Step 3: Restore Data (15 min)
    ☐ Latest database snapshot: rds-snapshot-prod-backup
    ☐ S3 data: Already replicated across regions
    ☐ Verify no data loss
  
  Step 4: Switch Over (5 min)
    ☐ Update DNS: production endpoint → us-west-2
    ☐ Verify connectivity from hospitals
    ☐ Monitor for any issues

Timeline (Best Case):
  00:00 - Region down, incident declared
  00:05 - Recovery procedures started
  00:20 - Database restored in us-west-2
  00:35 - Application deployed and healthy
  00:50 - DNS switchover complete
  01:00 - Full recovery, service restored

RPO Impact:
  - Data loss: Last 15 minutes (acceptable)
  - Hospital impact: ~5 minutes of alerts missed (during switchover)
  - Patient impact: Minimal (medical decisions not in system yet)

Validation:
  ☐ Run disaster recovery drill quarterly
  ☐ Test backup restore (monthly)
  ☐ Verify RTO achievable (document results)

---

SCENARIO 2: Database Corruption / Data Loss
─────────────────────────────────────────────
Trigger: Accidental deletion, ransomware, logical corruption

Detection:
  ☐ Row count suddenly drops (monitoring alert)
  ☐ Data integrity check fails
  ☐ Customer reports "missing data"

Immediate Response (<15 minutes):
  ☐ STOP all write operations (failover to read-only)
  ☐ Declare SEV-1
  ☐ Page DBA
  ☐ Investigate scope of corruption
  ☐ Restore from pre-incident snapshot

Recovery Steps:

  Step 1: Scope Damage (10 min)
    ☐ Identify affected records
    SELECT COUNT(*) FROM observations WHERE deleted_at > NOW() - INTERVAL '1 hour';
    
    ☐ Quantify impact: How much data lost?
    ☐ Determine root cause: What happened?

  Step 2: Restore from Snapshot (20 min)
    ☐ Latest clean snapshot: Automatically tested daily
    ☐ Create point-in-time recovery (PITR)
    ☐ Restore to time just before incident
    ☐ Verify data integrity

  Step 3: Investigate & Prevent Recurrence (1 hour)
    ☐ What caused the issue?
    ☐ Were access controls sufficient?
    ☐ Add additional safeguards
    ☐ Document in post-mortem

RTO: 30 minutes (data restoration + validation)
RPO: 15 minutes (latest snapshot)

---

SCENARIO 3: Security Breach / Ransomware
───────────────────────────────────────────
Trigger: Unauthorized access, data exfiltration, encryption

Detection:
  ☐ IDS/IPS alert (suspicious traffic)
  ☐ Unexpected process running (ransomware)
  ☐ Customer reports unauthorized access
  ☐ Automated scanning detects malware

Immediate Response (<5 minutes):
  ☐ Declare SEV-1 SECURITY INCIDENT
  ☐ Isolate affected systems (network segmentation)
  ☐ Page: Security team, CTO, Legal, Communications
  ☐ Do NOT shut down systems (preserve logs for forensics)

Security Response:

  Step 1: Contain Breach (30 min)
    ☐ Isolate compromised servers from network
    ☐ Revoke all API credentials
    ☐ Block suspicious IP addresses
    ☐ Review access logs for extent of compromise
  
  Step 2: Eradicate Threat (2-4 hours)
    ☐ Forensic analysis (what was accessed?)
    ☐ Remove malware (rebuild from clean image)
    ☐ Verify all systems clean
    ☐ Re-enable compromised credentials
  
  Step 3: Recover (1-2 hours)
    ☐ Restore from uncompromised backup
    ☐ Verify data integrity
    ☐ Bring systems back online
  
  Step 4: Notify (Immediately)
    ☐ Notify affected customers (within 24 hours, per HIPAA)
    ☐ Notify regulatory authorities (HHS, state AG)
    ☐ Engage public relations

Legal/Compliance:
  ☐ HIPAA breach notification required (if PII accessed)
  ☐ Potential regulatory investigation
  ☐ Customer trust impact
  ☐ Insurance claim (cyber liability)

Prevention:
  ☐ Implement MFA for all admin access
  ☐ Network segmentation (prod isolated from dev)
  ☐ Regular vulnerability scanning + patching
  ☐ Employee security training
  ☐ Endpoint detection & response (EDR)

DISASTER RECOVERY TEST SCHEDULE
──────────────────────────────────

Quarterly Test: Full disaster recovery drill
  ☐ Simulate complete data center failure
  ☐ Restore from backup to alternate region
  ☐ Verify RTO achievable (1 hour target)
  ☐ Document results and issues
  ☐ Publish "drill successful" report to customers

Monthly Test: Database backup verification
  ☐ Restore latest snapshot to test environment
  ☐ Verify data integrity
  ☐ Check restore time accuracy
  ☐ Update RTO/RPO estimates if needed

Weekly Test: Automated backup testing
  ☐ S3 replication verified
  ☐ Database snapshot creation confirmed
  ☐ Backup integrity checked (via hash)

Annual Test: Full business continuity simulation
  ☐ Simulate 24-hour outage
  ☐ Test customer communication procedures
  ☐ Verify staff can work from alternate location
  ☐ Test all disaster recovery procedures
```

---

## Success Criteria for Phase 16

| Criterion | Target | Validation |
|-----------|--------|-----------|
| **Deployment Playbooks** | Ready for production | First deployment executed |
| **Incident Response** | <5 min SEV-1 response | Incident drill pass |
| **Customer Onboarding** | 90-day program | First hospital goes live |
| **Clinician Training** | >90% competency | Training assessments pass |
| **Disaster Recovery** | RTO <1 hour | Quarterly drill success |
| **Documentation** | Comprehensive runbooks | All scenarios covered |

---

**Status:** 📋 PHASE 16 OPERATIONAL PLAYBOOKS COMPLETE

**Next Milestone:** Production deployment (September 2026)

**Timeline:** Ongoing reference (Phases 9-15 concurrent execution)

**Strategic Objective:** Enable reliable, scalable operations for enterprise healthcare platform

---

**Last Updated:** April 25, 2026  
**Document Version:** 1.0 (Operational Framework Complete)  
**Maintained By:** Operations & Clinical Success Team
