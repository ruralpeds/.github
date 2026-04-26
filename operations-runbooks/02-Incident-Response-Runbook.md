# Operational Runbook 2: Incident Response & Escalation

**Purpose:** Procedures for responding to production incidents  
**Scope:** System failures, security events, adverse events  
**Audience:** On-call engineers, compliance, clinical team  
**Version:** 1.0  
**Last Updated:** April 25, 2026

---

## Incident Classification & Response Times

| Severity | Description | Response Time | Resolution SLA | Examples |
|---|---|---|---|---|
| **P1 (Critical)** | Patient safety risk | 15 minutes | 1 hour | Auth bypass, incorrect alert, system down |
| **P2 (High)** | Degraded function | 1 hour | 4 hours | Slow vital sign sync, audit trail lag |
| **P3 (Medium)** | Minor issue | 4 hours | 24 hours | UI bug, missing log entry |
| **P4 (Low)** | Cosmetic/documentation | 24 hours | 1 week | Typo, outdated comment |

---

## P1: Critical Incident Response (15 min response)

### Step 1: Declare Incident

```bash
# 1. Activate incident response protocol
echo "🚨 INCIDENT: $(date +%s): $DESCRIPTION" >> /var/log/incident.log

# 2. Page on-call engineer (immediately)
curl -X POST https://pagerduty.example.com/incidents \
  -H "Authorization: Token token=" \
  -d "{\"incident_key\": \"prod-auth-bypass\", \"severity\": \"critical\"}"

# 3. Notify clinical team (Slack)
curl -X POST https://slack.com/api/chat.postMessage \
  -d "channel=#incidents" \
  -d "text=🚨 CRITICAL INCIDENT: System authentication bypass detected"

# 4. Notify compliance officer (email + call)
echo "URGENT: Production incident requires immediate attention" | mail -s "P1 Incident: Auth Bypass" compliance@company.com
```

### Step 2: Assess Impact (First 5 minutes)

**Questions to answer:**
1. Is patient safety at risk? (YES → escalate to clinical immediately)
2. How many users affected?
3. How long has issue existed?
4. Are patient records exposed?

**Example: Authentication Bypass**

```bash
# Check how many unauthorized accesses occurred
SELECT COUNT(*) FROM audit_trail 
WHERE action_type='login_success' 
AND digital_signature IS NULL  # Invalid signature = unauthorized
AND timestamp > NOW() - INTERVAL 30 MINUTES;

# Output: 247 unauthorized accesses in last 30 min 😱

# Immediate action: Block the vulnerability
# (See "Containment" below)
```

### Step 3: Containment (First 15 minutes)

**Goal:** Stop the bleeding immediately

**Option A: Fix in Code (Fast)**
```bash
# If fix is obvious (e.g., disable broken feature):
git checkout -b hotfix/auth-bypass
# ... fix code ...
docker build -t ghcr.io/company/platform:hotfix .
kubectl set image deployment/platform platform=ghcr.io/company/platform:hotfix -n production

# Deploy takes ~5 minutes
```

**Option B: Disable Feature (Faster)**
```bash
# If code fix not ready: temporarily disable the vulnerable feature
kubectl set env deployment/platform FEATURE_AUTH_BYPASS=false -n production

# Takes ~2 minutes; buys time for proper fix
```

**Option C: Rollback (Fastest)**
```bash
# If feature is brand new: rollback to previous version
PREVIOUS_VERSION=$(git describe --tags $(git rev-list --tags --max-count=2) | tail -n 1)

kubectl set image deployment/platform \
  platform=ghcr.io/company/platform:${PREVIOUS_VERSION} \
  -n production

# Takes ~3 minutes
```

### Step 4: Investigation (Ongoing, 15-60 minutes)

**Root Cause Analysis:**

```bash
# 1. Get timeline of events
SELECT timestamp, action_type, user_id, context 
FROM audit_trail 
WHERE resource_id LIKE 'auth%' 
AND timestamp > NOW() - INTERVAL 1 HOUR
ORDER BY timestamp DESC;

# 2. Identify vulnerability
# E.g., "Missing signature verification on session tokens"

# 3. Check if exposed data
SELECT COUNT(DISTINCT user_id) FROM audit_trail
WHERE action_type='unauthorized_access' 
AND timestamp > NOW() - INTERVAL 30 MINUTES;

# 4. Determine: Can attackers still exploit this?
# Check if fix/rollback actually prevents attack
```

### Step 5: Communication (Continuous)

**Update cadence:** Every 15 minutes to stakeholders

```bash
# Update Slack channel
curl -X POST https://slack.com/api/chat.postMessage \
  -d "channel=#incidents" \
  -d "text=**Incident Update** (15 min in)
- Status: INVESTIGATING
- Impact: 247 unauthorized accesses detected
- Action: Feature disabled; working on permanent fix
- ETA: 30 minutes to full resolution"
```

### Step 6: Resolution

```bash
# Once permanent fix deployed:

# 1. Verify fix works
./scripts/smoke_tests.sh
./scripts/security_tests.sh

# 2. Confirm no more attacks
SELECT COUNT(*) FROM audit_trail 
WHERE action_type='unauthorized_access' 
AND timestamp > NOW() - INTERVAL 5 MINUTES;
# Output: 0 (good!)

# 3. Monitor metrics
# Watch: authentication success rate, error logs, audit trail

# 4. Declare incident resolved
curl -X POST https://pagerduty.example.com/incidents/{incident_id}/acknowledge \
  -d "status=resolved"

echo "✅ INCIDENT RESOLVED: $(date)" >> /var/log/incident.log
```

### Step 7: Post-Mortem (Within 24 Hours)

**Document:**
1. What failed?
2. Why did we not catch it in testing?
3. What process failed?
4. How do we prevent this in future?
5. Corrective actions

**Example Post-Mortem:**

```markdown
# Post-Mortem: Auth Bypass Incident

## Timeline
- 14:23 UTC: Auth bypass feature deployed (v1.1.5)
- 14:47 UTC: First unauthorized access detected
- 15:02 UTC: Incident declared (P1)
- 15:17 UTC: Feature disabled
- 15:45 UTC: Rollback completed; incident resolved

## Root Cause
Signature verification was accidentally disabled in Line 234 of auth_handler.py:
```
// WRONG: ❌
// if verify_signature(token):  // This line was commented out!
//    return True

// CORRECT: ✅
if verify_signature(token):
    return True
else:
    raise InvalidSignature()
```

## Why We Didn't Catch It
- Code review: Reviewer missed the commented-out line
- Tests: Our test suite mocked signature verification, so test still passed
- Static analysis: No rule to detect commented-out critical code

## Corrective Actions
1. **Immediate:** Add pre-commit hook to reject commented-out critical code
2. **Short-term:** Add test that verifies signature verification cannot be bypassed
3. **Long-term:** Add static analysis tool to detect suspicious patterns
```

---

## P2: High Priority Incident (1 hour response)

### Quick Checklist

- [ ] Declare incident (Slack/PagerDuty)
- [ ] Assess: Is patient safety at risk?
- [ ] Investigate root cause
- [ ] Implement fix or workaround
- [ ] Deploy & monitor
- [ ] Update stakeholders every 30 min
- [ ] Post-mortem within 24 hours

**Example P2: Audit Trail Falling Behind**

```bash
# Monitor: Audit trail lag (should be <1 sec)
SELECT TIMESTAMPDIFF(SECOND, MAX(timestamp), NOW()) as lag_seconds
FROM audit_trail;

# If lag > 5 seconds: trigger P2
# Root cause: Database is slow due to heavy load
# Fix: Add database index or increase connection pool
```

---

## P3: Medium Priority (4 hour response)

- Acknowledge within 4 hours
- Fix within 24 hours
- Update daily

---

## Security Incident Specific: Response

### If Vulnerability Detected

```bash
# 1. Assess: Is this being actively exploited?
SELECT COUNT(*) as attempts FROM audit_trail
WHERE action_type='failed_security_check'
AND timestamp > NOW() - INTERVAL 1 HOUR;

# 2. If YES (actively exploited):
#    Escalate to P1; see P1 procedure above

# 3. If NO (not yet exploited):
#    Follow P2/P3 process (depends on severity)

# 4. Always: Create security fix (not public yet)
git checkout -b security/vuln-description
# ... implement fix ...

# 5. Coordinate: Responsible disclosure
#    - Notify CISA/FDA if required
#    - Brief clinical team on patient risk
#    - Schedule coordinated public disclosure

# 6. Deploy fix quietly (with release notes mentioning security)
```

---

## Escalation Paths

### Chain of Command

```
Severity  Response     Notify           Timeline
──────────────────────────────────────────────
P1        On-call      - Eng Lead       5 min
          Engineer     - CTO            10 min
          🔴 Page      - Compliance     15 min
          Immediately  - Clinical Team  15 min
          
P2        On-call      - Eng Lead       30 min
          Engineer     - Compliance     1 hour
          🟠 Alert     - (Clinical if needed)
          
P3        Assigned     - (Async)        4 hours
          🟡 Ticket    - Daily standup
          
P4        Backlog      - (Issue only)   
          🟢 Issue
```

### Compliance Escalation (Always Notify If)

- Patient safety at risk (P1)
- Data exposure occurred
- Audit trail tampered with
- FDA requirement violation
- Regulatory reporting needed (MDR)

```bash
# Compliance notification template
TO: compliance@company.com
SUBJECT: URGENT - Incident Escalation

Description: [incident]
Risk to Patient: [yes/no]
Data Exposed: [patient count]
Regulatory Impact: [yes/no]
Recommended Action: [action]

Next steps: [next step]
```

---

## Monitoring & Alerting

### Alerts That Trigger P1 Response

| Alert | Threshold | Action |
|---|---|---|
| System Down | API error rate >5% | Page on-call |
| Auth Failure | >10 failed auth/min | Page on-call |
| Audit Trail Lag | >10 seconds | Page on-call |
| Database Error | Any critical | Page on-call |
| Adverse Event | Any device-caused | Notify clinical team |

**Example Alert Rules (Prometheus)**

```yaml
groups:
  - name: critical_alerts
    rules:
      - alert: AuthenticationBypassDetected
        expr: rate(auth_failures_total[5m]) > 0.1
        for: 1m
        annotations:
          severity: P1
          action: Page on-call engineer immediately
      
      - alert: AuditTrailTampering
        expr: audit_chain_integrity_status == "TAMPERED"
        annotations:
          severity: P1
          action: Page on-call + compliance officer
```

---

## Summary

This runbook provides:
✅ P1 critical incident response (15 min)  
✅ Root cause investigation  
✅ Communication procedures  
✅ Escalation paths  
✅ Post-mortem process  
✅ Security incident handling  

**Key principle:** Patient safety is always priority #1.
