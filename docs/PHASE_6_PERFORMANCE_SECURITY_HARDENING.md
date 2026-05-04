# Phase 6: Performance & Security Hardening

**Status:** Planning Phase  
**Date:** May 4, 2026  
**Target Completion:** Q2-Q3 2026  
**Expected Impact:** 99.95%+ uptime, zero critical security vulnerabilities

---

## Overview

Phase 6 hardens Phase 5 infrastructure for production, focusing on:
- **Performance**: Sub-second dashboards, < 100ms API latency
- **Security**: Zero-trust architecture, encryption at rest/transit, audit compliance
- **Reliability**: 99.95%+ uptime, automated failover, disaster recovery
- **Compliance**: HIPAA/SOC2 audit readiness

**Estimated Effort:** 6-8 weeks  
**Expected Impact:** Enterprise-grade CI/CD platform

---

## Phase 6A: Performance Optimization

### Goals
- Dashboard latency: < 1 second (from current 5 minutes)
- API response time: < 100ms p95
- Cost aggregation: < 30 seconds
- Metrics query: < 500ms

### Problems to Solve

1. **Slow Dashboard Generation**
   - Current: 5 minutes (markdown rendering + aggregation)
   - Target: < 1 second (cached, incremental updates)

2. **Slow Metrics Queries**
   - Current: Full JSON aggregation on every query
   - Target: Time-series database with indexed queries

3. **Inefficient Event Detection**
   - Current: Evaluate all rules on every run (every 5 min)
   - Target: Streaming evaluation with event bus

4. **Bottleneck: JSONL Audit Trail**
   - Current: Full file scan for aggregation
   - Target: Database indexes for fast lookup

### Solutions

#### 6A1: Implement Time-Series Database

**Problem**: JSONL files are slow for time-series queries

**Solution**: Use PostgreSQL with time-series extensions (TimescaleDB) or ClickHouse

**Components**:
- `scripts/metrics-to-tsdb.py`: Migrate JSONL to TimescaleDB
- `scripts/tsdb-aggregator.py`: Fast aggregation queries
- Database schema: Optimized for metrics (timestamp, metric_name, value, tags)
- Migration workflow: Background job to import historical data

**Expected Impact**:
- Metrics query: 5 sec → 500ms
- Aggregation: 2 min → 30 sec
- Cost: ~$50/month for managed TimescaleDB

#### 6A2: Cache Layer for Dashboards

**Problem**: Regenerate dashboards every 30 minutes (expensive)

**Solution**: Redis cache with intelligent invalidation

**Components**:
- `scripts/dashboard-cache.py`: Cache management
- TTL strategy: 5 min for status, 30 min for performance
- Invalidation: Event-driven (alert detection invalidates status cache)
- Fallback: Serve stale cache if generation fails

**Expected Impact**:
- Dashboard latency: 5 min → 1 sec (from cache)
- Server load: 50% reduction

#### 6A3: Event Bus for Real-Time Updates

**Problem**: Polling-based detection is slow and inefficient

**Solution**: Event-driven architecture with message queue

**Components**:
- Message Queue: AWS SQS or RabbitMQ
- Event Publisher: Emit events from workflows
- Event Subscribers: Alert detector, dashboard cache invalidator
- Streaming processor: Real-time metric aggregation

**Expected Impact**:
- Alert MTTR: 1 min → 10 sec
- System responsiveness: Near real-time

#### 6A4: API Layer

**Problem**: No direct API access to metrics/costs

**Solution**: FastAPI/Flask service with OpenAPI docs

**Components**:
- `services/metrics-api.py`: REST API for metrics
  - GET /metrics/{workflow}?start=&end=
  - GET /costs/{team}?start=&end=
  - GET /alerts?severity=&resolved=
  - Supports filtering, pagination, JSON/CSV export

**Endpoints**:
```
GET /api/v1/metrics/workflows - List workflows
GET /api/v1/metrics/workflows/{id} - Workflow details
GET /api/v1/costs/teams - Cost by team
GET /api/v1/costs/teams/{id}/timeline - Cost timeline
GET /api/v1/alerts - List active alerts
POST /api/v1/alerts/{id}/acknowledge - Acknowledge alert
```

**Expected Impact**:
- Enable external tools to integrate
- Self-service cost/performance data
- API latency: < 100ms p95

---

## Phase 6B: Security Hardening

### Goals
- Zero-trust architecture: Verify every request
- Encryption: All data at rest (AES-256) and in transit (TLS 1.3)
- Audit: Immutable logs for compliance
- Access Control: RBAC with least privilege

### Problems to Solve

1. **JSONL Audit Trail Not Tamper-Proof**
   - Current: Plain text files, could be modified
   - Target: Append-only, cryptographically signed

2. **No Authentication for Dashboards/APIs**
   - Current: Public access to audit-log/
   - Target: OAuth2/OIDC with GitHub

3. **Secrets in Configuration**
   - Current: GitHub tokens, API keys in config files
   - Target: AWS Secrets Manager / HashiCorp Vault

4. **No Encryption of Sensitive Data**
   - Current: Cost data, metrics unencrypted
   - Target: AES-256 at rest, TLS 1.3 in transit

5. **Limited Audit Trail**
   - Current: Who triggered workflows unclear
   - Target: Complete audit log with user attribution

### Solutions

#### 6B1: Cryptographic Audit Trail

**Problem**: JSONL files can be tampered with

**Solution**: Append-only blockchain-like audit log with signatures

**Components**:
- `scripts/audit-log-signer.py`: Sign JSONL entries
  - SHA-256 hash of previous entry + current entry
  - HMAC with organization key
  - Makes any tampering detectable

- `scripts/audit-log-verifier.py`: Verify audit trail integrity
  - Validate chain of hashes
  - Detect missing/modified entries
  - Generate integrity report for compliance

**Format**:
```json
{
  "sequence": 12345,
  "timestamp": "2026-05-04T10:30:00Z",
  "event_type": "alert_triggered",
  "data": {...},
  "previous_hash": "abc123...",
  "signature": "hmac_sha256(...)"
}
```

**Expected Impact**:
- HIPAA/SOC2 compliance: Tamper-proof audit log
- Regulatory: Prove integrity of historical data
- Detection: Any modification detected immediately

#### 6B2: Authentication & Authorization

**Problem**: No authentication for dashboards/APIs

**Solution**: OAuth2 with GitHub, RBAC for access control

**Components**:
- OAuth2 Provider: GitHub Apps
- ID Token: JWT with organization claims
- Authorization Layer: Middleware checking scopes
- RBAC: Teams → Permissions mapping

**Access Levels**:
```
Public:     Dashboards (summary only)
Viewer:     Full dashboards, read-only API
Editor:     Can acknowledge alerts, update configs
Admin:      Full access, can modify rules
```

**Mapping**:
```
GitHub @ruralpeds/platform → Admin
GitHub @ruralpeds/sre → Editor
GitHub Org Members → Viewer
Public → Viewer (summary only)
```

**Implementation**:
- `services/auth-service.py`: OAuth2 handler
- Middleware for API authentication
- Dashboard auth gate

**Expected Impact**:
- Secure access to sensitive metrics/costs
- Compliance: Access control audit trail
- Multi-tenancy: Support multiple orgs

#### 6B3: Secrets Management

**Problem**: API keys in config files or environment variables

**Solution**: AWS Secrets Manager or HashiCorp Vault

**Components**:
- Secret Rotation: Automatic key rotation
- Access Control: IAM policies for who can read
- Audit: Log every access to secrets
- Injection: Runtime retrieval into workflows

**Secrets to Manage**:
- GitHub tokens (cost collector, event responder)
- Database credentials (TimescaleDB)
- API keys (external services)
- Signing keys (audit trail)

**Implementation**:
- `scripts/secret-manager.py`: Retrieve secrets at runtime
- Update workflows to use secrets manager
- GitHub Actions integration: Use OIDC for AWS auth

**Expected Impact**:
- Eliminate hardcoded credentials
- Automatic rotation prevents compromise
- Audit trail for compliance

#### 6B4: Data Encryption

**Problem**: Cost data, metrics unencrypted in storage and transit

**Solution**: Encryption at rest (AES-256) and in transit (TLS 1.3)

**At Rest**:
- Database encryption: TimescaleDB with encrypted disks
- File encryption: EBS volumes with KMS keys
- Archive encryption: S3 with server-side encryption

**In Transit**:
- TLS 1.3 for all APIs
- Require HTTPS, redirect HTTP
- Certificate pinning for critical services

**Implementation**:
- Database: Enable encryption in cloud provider
- S3/storage: Enable default encryption
- API: Enforce TLS 1.3 minimum
- Certificates: AWS Certificate Manager

**Expected Impact**:
- HIPAA/SOC2: Data protection at rest
- Security: Prevent data theft via network sniffing
- Compliance: Encryption proof for audits

#### 6B5: Vulnerability Management

**Problem**: Dependencies vulnerable to known CVEs

**Solution**: Automated scanning and patching

**Components**:
- `.github/workflows/security-scan.yml`: Weekly CVE scan
  - Scan Python dependencies (pip-audit)
  - Scan container images (trivy)
  - Scan IaC (checkov)
  - Report critical vulnerabilities

- `scripts/vuln-notifier.py`: Create issues for critical CVEs
  - Auto-create GitHub issue
  - Tag: security, urgent
  - Track remediation status

**Expected Impact**:
- Zero critical CVEs in production
- Quick patching (24-48 hours for critical)
- Compliance: Vulnerability management proof

---

## Phase 6C: Reliability & High Availability

### Goals
- Uptime: 99.95% (≤ 22 minutes/month downtime)
- RTO (Recovery Time Objective): 15 minutes
- RPO (Recovery Point Objective): 5 minutes

### Problems to Solve

1. **Single Points of Failure**
   - Current: Single Kubernetes cluster
   - Target: Multi-region failover

2. **No Backup Strategy**
   - Current: No daily backups
   - Target: Hourly snapshots, weekly archives

3. **No Load Balancing**
   - Current: Direct requests to single API
   - Target: Load balanced across multiple replicas

4. **No Monitoring of Monitoring**
   - Current: If observability breaks, no alerts
   - Target: Secondary monitoring system

### Solutions

#### 6C1: Multi-Region Deployment

**Problem**: Single cluster failure = total outage

**Solution**: Active-active multi-region with database replication

**Architecture**:
```
Region 1 (Primary)          Region 2 (Secondary)
├─ K8s Cluster             ├─ K8s Cluster
├─ TimescaleDB Primary     ├─ TimescaleDB Replica
└─ Cache (Redis)           └─ Cache (Redis)
       ↕ (replication)            ↕
       └─── Global Load Balancer ───┘
```

**Components**:
- `config/multi-region-setup.yaml`: CloudFormation/Terraform
- Database replication: PostgreSQL logical replication
- Cache replication: Redis cluster mode
- DNS failover: Route53 health checks

**Failover Logic**:
- Health checks every 30 seconds
- Automatic failover if primary down
- No manual intervention required

**Expected Impact**:
- Uptime: 99.9% → 99.95%
- Redundancy: No single point of failure
- Cost: ~2x infrastructure (acceptable for reliability)

#### 6C2: Backup & Disaster Recovery

**Problem**: No recovery from data loss

**Solution**: Hourly snapshots + weekly archives + point-in-time recovery

**Strategy**:
- Database snapshots: Hourly to S3 (keep 7 days)
- Transaction logs: Continuous WAL archiving
- Point-in-time recovery: Restore to any point in last 7 days
- Archive: Weekly to Glacier (keep 1 year)

**Components**:
- `scripts/backup-manager.py`: Automated backup/retention
- `workflows/backup-daily.yml`: Trigger hourly snapshots
- `scripts/disaster-recovery-test.py`: Monthly DR drills

**RTO/RPO**:
- RPO (Recovery Point Objective): 5 minutes
- RTO (Recovery Time Objective): 15 minutes

**Expected Impact**:
- Zero data loss in case of failure
- Compliance: Backup proof for audits
- Peace of mind: Tested recovery procedures

#### 6C3: Load Balancing & Scaling

**Problem**: Single API instance as bottleneck

**Solution**: Horizontal scaling with load balancing

**Components**:
- API replicas: 3-10 instances (auto-scale on CPU)
- Load Balancer: ALB (AWS) or Nginx Ingress
- Session management: Stateless (use Redis for session data)
- Database connection pooling: PgBouncer

**Expected Impact**:
- No single instance bottleneck
- Automatic scaling on demand
- Better resilience to instance failures

#### 6C4: Health Monitoring

**Problem**: If monitoring breaks, nobody knows

**Solution**: Secondary monitoring system

**Components**:
- Primary: Phase 5C observability platform
- Secondary: CloudWatch + PagerDuty
- Canary tests: Synthetic transactions every minute
- Status page: External status.io integration

**Canary Tests**:
- GET /api/v1/metrics/workflows (verify DB accessible)
- GET /dashboards (verify dashboard generation)
- Cost aggregation (verify pipeline running)

**Expected Impact**:
- Detect issues in monitoring system itself
- External status page: Customer visibility
- Faster incident detection

---

## Phase 6D: Compliance & Governance

### Goals
- HIPAA/SOC2 audit ready
- Zero security findings
- Automated compliance reporting

### Solutions

#### 6D1: Compliance Automation

**Components**:
- `scripts/compliance-report.py`: Generate SOC2 audit report
  - Access control audit
  - Encryption verification
  - Backup/recovery validation
  - Incident response metrics

- `workflows/compliance-check.yml`: Weekly compliance validation
  - Verify all configs encrypted
  - Check backup status
  - Validate access logs
  - Report findings

#### 6D2: Incident Response Procedures

**Enhancement to Phase 5 Runbooks**:
- Incident severity levels (Critical, High, Medium, Low)
- Escalation procedures
- Communication templates
- Post-incident review (blameless postmortem)

#### 6D3: Change Management

**Components**:
- `workflows/change-request.yml`: Require approval for:
  - Production deployments
  - Configuration changes
  - Secret rotation
- Approval from: Owner + Security team
- Audit trail: All changes logged and timestamped

---

## Implementation Timeline

### Week 1-2: Phase 6A (Performance)
- Day 1-2: Design time-series database
- Day 3-4: Implement metrics-to-tsdb migration
- Day 5-7: Cache layer + API layer

### Week 3-4: Phase 6B (Security)
- Day 1-2: Cryptographic audit trail
- Day 3-4: OAuth2 authentication
- Day 5-7: Secrets management + encryption

### Week 5-6: Phase 6C (Reliability)
- Day 1-3: Multi-region setup
- Day 4-5: Backup/disaster recovery
- Day 6-7: Load balancing + health monitoring

### Week 7-8: Phase 6D (Compliance)
- Day 1-2: Compliance automation
- Day 3-4: Incident response hardening
- Day 5-7: Testing + documentation

---

## Success Criteria

### Performance
- [ ] Dashboard latency < 1 second
- [ ] API latency < 100ms p95
- [ ] Cost aggregation < 30 seconds
- [ ] Metrics query < 500ms

### Security
- [ ] Zero critical CVEs
- [ ] 100% of data encrypted at rest
- [ ] 100% of traffic on TLS 1.3
- [ ] All access authenticated and authorized
- [ ] Audit trail tamper-proof

### Reliability
- [ ] Uptime 99.95%+
- [ ] RTO ≤ 15 minutes
- [ ] RPO ≤ 5 minutes
- [ ] Multi-region failover tested
- [ ] Monthly DR drills passing

### Compliance
- [ ] SOC2 audit ready
- [ ] HIPAA controls implemented
- [ ] Zero findings in security audit
- [ ] Automated compliance reporting

---

## Component Breakdown

| Phase | Scripts | Workflows | Config | Docs | Total |
|-------|---------|-----------|--------|------|-------|
| 6A | 4 | 2 | 2 | 2 | 10 |
| 6B | 3 | 2 | 3 | 2 | 10 |
| 6C | 3 | 2 | 2 | 2 | 9 |
| 6D | 2 | 2 | 1 | 3 | 8 |
| **Total** | **12** | **8** | **8** | **9** | **37** |

---

## Risk Mitigation

### Performance Risks
- Risk: Time-series DB migration loses data
- Mitigation: Parallel run with validation, rollback plan

### Security Risks
- Risk: Secrets exposed during rotation
- Mitigation: Use Secrets Manager, automatic rotation, audit access

### Reliability Risks
- Risk: Multi-region failover doesn't work
- Mitigation: Monthly DR drills, automated testing

---

## Cost Estimate

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| TimescaleDB | $50 | Managed, includes backups |
| Multi-region K8s | ~$2,000 | 2 regions, HA setup |
| Redis Cache | $100 | Managed cluster |
| AWS Secrets Manager | $20 | 100 secrets/month |
| Backup storage (S3) | $50 | 100GB retained |
| **Total Additional** | **~$2,220** | 15-20% cost increase |
| **Reduction from improvements** | -$500 | Reduced compute via caching |
| **Net Cost** | **~$1,700** | Worth it for 99.95% uptime + security |

---

## Next Steps

1. **Prioritize components** by impact and effort
2. **Start with 6B** (Security): Highest priority for production
3. **Follow with 6A** (Performance): Highest user impact
4. **Finish with 6C/6D** (Reliability/Compliance): Hardening

**Estimated timeline**: 6-8 weeks for complete Phase 6

---

**Next Phase**: Phase 7 - Cost Optimization & Advanced ML (beyond current roadmap)
