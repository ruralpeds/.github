# Security Testing Framework: OWASP Top 10 & FDA Security Validation

**Purpose:** Comprehensive penetration testing and security vulnerability assessment  
**Compliance:** OWASP Top 10 (2021), FDA 510(k) security requirements, HIPAA §164.312, CFR Part 11  
**Version:** 1.0 (April 25, 2026)

---

## Quick Start

### 1. Run Complete Security Test Suite

```bash
cd testing/security-testing
python3 run_security_test.py results
```

**Output:** `security_test_results.json` with detailed vulnerability report

### 2. Run Specific Test Categories

```bash
# OWASP Top 10 only
python3 -c "from owasp_top_10_tests import OWASPTester; OWASPTester('http://localhost:8080', 'token', {}).run_all_tests()"

# API Security only
python3 -c "from api_security_tests import APISecurityTester; APISecurityTester('http://localhost:8080', 'token').run_all_tests()"

# Database Security only
python3 -c "from database_security_tests import DatabaseSecurityTester; DatabaseSecurityTester('localhost', 5432, 'audit_trail', 'user', 'pass').run_all_tests()"
```

### 3. Review Results

```bash
cat results/security_test_results.json | jq '.summary'
cat results/security_test_results.json | jq '.owasp_top_10'
```

---

## OWASP Top 10 Testing (A01-A10)

### A01: Broken Access Control (CWE-284)

**What we test:**
- Unauthenticated access to protected endpoints
- Horizontal privilege escalation (access peer data)
- Vertical privilege escalation (user access admin features)

**Success criteria:**
```
❌ FAIL - Unauthenticated access returns 200 OK
✅ PASS - Unauthenticated access returns 401 Unauthorized
❌ FAIL - User can access other patient records
✅ PASS - User can only access own records (403/404 on others)
```

**Remediation:**
- Validate JWT on all protected endpoints
- Check user ownership of resources before returning
- Use role-based access control (RBAC)
- Implement fine-grained authorization

---

### A02: Cryptographic Failures (CWE-327)

**What we test:**
- Unencrypted data in transit (no TLS)
- Sensitive data in logs (passwords, tokens)
- Weak encryption algorithms

**Success criteria:**
```
❌ FAIL - API accessible via plain HTTP
✅ PASS - HTTP redirects to HTTPS
❌ FAIL - Passwords appear in pod logs
✅ PASS - Logs have no sensitive data patterns
```

**Remediation:**
- Enforce HTTPS (TLS 1.2+) on all endpoints
- Redact passwords, API keys, tokens in logs
- Use AES-256-GCM for sensitive data encryption
- Implement log redaction middleware

---

### A03: Injection (CWE-89, CWE-90, CWE-78)

**What we test:**
- SQL injection in query parameters
- LDAP injection in authentication
- OS command injection

**Success criteria:**
```
SQL Injection:
  ❌ FAIL - Query: SELECT * FROM users WHERE name = '' OR '1'='1'
  ✅ PASS - Use parameterized queries: SELECT * FROM users WHERE name = %s

Command Injection:
  ❌ FAIL - os.system(f"cat {user_file}") with user input
  ✅ PASS - subprocess.run(["cat", user_file], check=True)
```

**Remediation:**
- Use parameterized queries (e.g., psycopg2 with %s placeholders)
- Validate and escape all user input
- Use library functions, never shell commands
- Implement input validation for type/length/format

---

### A04: Insecure Design (CWE-345)

**What we test:**
- Missing rate limiting (DoS risk)
- Missing CSRF protection
- Weak session management

**Success criteria:**
```
Rate Limiting:
  ❌ FAIL - 100 rapid requests all succeed
  ✅ PASS - 50th request returns HTTP 429 (Too Many Requests)

CSRF Protection:
  ❌ FAIL - POST accepted without CSRF token
  ✅ PASS - POST rejected without valid CSRF token
```

**Remediation:**
- Implement rate limiting (100 req/min per IP)
- Add CSRF tokens to state-changing operations
- Use secure session cookies (Secure, HttpOnly, SameSite)

---

### A05: Broken Authentication (CWE-287)

**What we test:**
- Weak password policies
- Session fixation attacks
- Credential stuffing vulnerabilities

**Success criteria:**
```
Password Strength:
  ❌ FAIL - Accept password "123"
  ✅ PASS - Reject passwords <12 chars, require mixed case + numbers + special

Session Fixation:
  ❌ FAIL - Session ID same before and after login
  ✅ PASS - New session ID generated after login
```

**Remediation:**
- Enforce strong passwords (12+ chars, upper/lower/numbers/special)
- Regenerate session IDs after login
- Implement account lockout (5 failed attempts)
- Use multi-factor authentication (MFA)

---

### A06: Sensitive Data Exposure (CWE-200)

**What we test:**
- PHI in query strings (should be POST body)
- Unencrypted storage of credentials
- Sensitive data in error messages

**Success criteria:**
```
Query String PHI:
  ❌ FAIL - GET /api/patients?ssn=123-45-6789
  ✅ PASS - POST /api/patients with SSN in body, never in URL

Sensitive in Errors:
  ❌ FAIL - Error: "Database password incorrect"
  ✅ PASS - Error: "Authentication failed"
```

**Remediation:**
- Move sensitive parameters from URLs to POST body
- Use generic error messages
- Encrypt all PHI at rest (AES-256-GCM)
- Hash passwords with bcrypt (12+ rounds)

---

## API Security Testing

### JWT / Token Security

**Tests performed:**
1. Invalid token signature — rejected ✅
2. Expired token — rejected ✅
3. Token without `exp` claim — rejected ✅
4. Token with modified payload — rejected ✅

**Success criteria:**
```json
{
  "test_id": "JWT-001",
  "test_name": "Invalid JWT signature",
  "result": "PASS - Invalid signature rejected",
  "passed": true
}
```

**Remediation:**
- Verify JWT signature on every request
- Validate `exp` claim and reject expired tokens
- Require `sub` (subject) and `iat` (issued at) claims
- Use HS256 or RS256 (never HS512)

---

### Authorization Controls

**Tests performed:**
1. User accessing admin endpoints (should be denied)
2. User viewing other user's patient data (should be denied)
3. Public endpoints accessible without auth ✅

**Success criteria:**
```
GET /admin/users → 403 Forbidden (non-admin user)
GET /fhir/Patient/999 → 403/404 (another user's data)
GET /health → 200 OK (public endpoint)
```

**Remediation:**
- Validate user role before accessing protected resources
- Check user ID against resource ownership
- Use RBAC with role → permission mapping
- Log authorization failures for audit trail

---

### Input Validation

**Tests performed:**
1. Oversized payload (100MB) — rejected
2. Malformed JSON — rejected with 400 error
3. Type confusion (string for integer) — rejected

**Success criteria:**
```
POST with 100MB payload → 413 Payload Too Large
POST with invalid JSON → 400 Bad Request
POST with wrong types → 400 Bad Request
```

**Remediation:**
- Set max payload size (e.g., 10MB)
- Validate JSON structure
- Enforce type validation (OpenAPI schemas)
- Use web framework validation (e.g., Pydantic)

---

### Security Headers

**Tests performed:**
1. X-Content-Type-Options: nosniff ✅ (MIME sniffing protection)
2. X-Frame-Options: DENY/SAMEORIGIN ✅ (Clickjacking protection)
3. Content-Security-Policy ✅ (XSS protection)
4. Strict-Transport-Security ✅ (HTTPS enforcement)

**Required headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; script-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Remediation:**
- Add security headers middleware to all API responses
- Set max-age to 1 year (31536000 seconds)
- Enforce HTTPS for all resources

---

## Database Security Testing

### SQL Injection Protection

**Tests performed:**
1. Parameterized query validation
2. Comment-based injection prevention (`' -- `)
3. UNION-based injection prevention

**Success criteria:**
```
Query: SELECT * FROM users WHERE id = %s
Payload: ' OR '1'='1'
Result: No records returned (payload treated as literal)

Test result: ✅ PASS - Parameterized queries used
```

**Remediation:**
- Use parameterized queries (psycopg2 with `%s`)
- Never concatenate user input into SQL
- Validate input length/format before query
- Use prepared statements (compile once, execute many)

---

### Privilege Escalation Prevention

**Tests performed:**
1. Application user is not superuser
2. Application user cannot CREATE objects in other schemas
3. Application user has minimal privileges

**Success criteria:**
```
SELECT usesuper FROM pg_user WHERE usename = 'app_user'
Result: false (not superuser) ✅

CREATE TABLE public.test → ERROR: permission denied ✅
```

**Remediation:**
- Create application user without superuser privilege
- Grant only CONNECT and USAGE on application schema
- Revoke CREATE on public schema
- Use database role separation (app role vs admin role)

---

### Encryption at Rest

**Tests performed:**
1. SSN stored encrypted (not plaintext)
2. Credentials encrypted with AES-256
3. No plaintext secrets in configuration

**Success criteria:**
```
SELECT data_type FROM information_schema.columns
WHERE table_name = 'patients' AND column_name = 'ssn'
Result: bytea (encrypted) ✅

Not: text (plaintext) ❌
```

**Remediation:**
- Use PGP encryption for sensitive columns
- Use AWS KMS for key management
- Encrypt data before inserting into database
- Use transparent data encryption (TDE) if available

---

### Audit Trail Integrity (CFR Part 11 §11.10)

**Tests performed:**
1. Audit trail records are immutable (no UPDATE/DELETE)
2. Hash chain for tampering detection (Merkle chain)
3. Server-generated timestamps (no client modification)

**Success criteria:**
```
UPDATE audit_trail SET action = 'TAMPERED' → ERROR: permission denied ✅

hash_previous_record column exists → ✅ (hash chain implemented)

created_at DEFAULT CURRENT_TIMESTAMP → ✅ (server-generated)
```

**Remediation (CFR Part 11 Requirements):**
- Create audit_trail table as immutable (GRANT SELECT only)
- Implement hash chain: hash_current = SHA256(id || timestamp || action || hash_previous)
- Add trigger to verify hash chain before INSERT
- Log all access attempts (including reads)
- Archive audit trail to immutable storage (S3 with MFA Delete)

---

### Connection Security

**Tests performed:**
1. SSL/TLS required for database connections
2. Cipher suite validation (TLS 1.2+)
3. Certificate pinning (if applicable)

**Success criteria:**
```
Try to connect with sslmode=disable → ERROR: SSL required ✅

Connection only accepts TLS 1.2+ → ✅
```

**Remediation:**
- Set sslmode=require in PostgreSQL connection strings
- Use AWS RDS with SSL enabled
- Require TLS 1.2+ in security groups
- Use certificate pinning for production environments

---

## Security Test Results Interpretation

### Result Categories

```json
{
  "test_id": "A01-1-unauth-access",
  "vulnerability": "A01:2021 Broken Access Control",
  "risk_level": "CRITICAL",
  "result": "PASS - Properly rejected",
  "is_vulnerable": false,
  "notes": "Correctly requires authentication"
}
```

**Risk Levels:**
- **CRITICAL**: Could lead to data breach, legal liability, patient harm
- **HIGH**: Significant security weakness, exploitable
- **MEDIUM**: Potential vulnerability, requires mitigation
- **LOW**: Defense-in-depth, nice-to-have fix

### Vulnerability Remediation Workflow

1. **Identify:** Test detects vulnerability (is_vulnerable: true)
2. **Assess:** Determine risk level and business impact
3. **Fix:** Implement remediation per test recommendations
4. **Verify:** Re-run test to confirm fix
5. **Archive:** Save results for FDA audit trail

---

## Compliance Mapping

### FDA 510(k) Security Requirements

| Requirement | Test Category | Evidence |
|-------------|---------------|----------|
| Authentication | A05 + API-001 | JWT validation, password policy |
| Authorization | A01 + AUTHZ-002 | RBAC, resource ownership checks |
| Encryption (transit) | A02 + API-004 | TLS required, HSTS header |
| Encryption (rest) | A02 + ENC-001 | SSN/credentials encrypted |
| Audit trail | AUDIT-001 to AUDIT-003 | Immutable, hash chain, server timestamps |
| Input validation | A03 + INPUT-001 | Parameterized queries, type validation |
| Error handling | A06 + API-002 | Generic error messages, no PHI |

### HIPAA §164.312 Security Rule

| Control | Implementation |
|---------|-----------------|
| Access controls (§164.312(a)(2)(i)) | JWT + RBAC |
| Encryption (§164.312(a)(2)(ii)) | TLS + AES-256 |
| Audit controls (§164.312(b)) | Immutable audit trail |
| Integrity (§164.312(c)(1)) | Hash chain, checksums |
| Transmission security (§164.312(e)) | TLS 1.2+ |

### CFR Part 11 Electronic Records

| Requirement | Implementation |
|-------------|-----------------|
| Authenticity (§11.70) | Digital signatures in audit trail |
| Integrity (§11.70) | Hash chain, immutable storage |
| Non-repudiation (§11.70) | Audit trail with user ID + timestamp |
| Accuracy (§11.100) | Server-generated timestamps |
| Completeness (§11.200) | Archive all audit entries |

---

## Example: Full Security Test Run

```bash
# 1. Start API and database
docker-compose up -d

# 2. Run security tests
python3 run_security_test.py results

# 3. Check results
cat results/security_test_results.json | jq '.summary'
{
  "status": "PASS",
  "ready_for_submission": true
}

# 4. Archive for FDA submission
tar czf security_test_results_20260425.tar.gz results/
aws s3 cp security_test_results_20260425.tar.gz s3://fda-compliance-archive/

# 5. Create compliance report
# From test results, generate FDA submission evidence
```

---

## Troubleshooting

### Test: "Cannot connect to API"

```bash
# Check API is running
curl http://localhost:8080/health

# Check firewall
netstat -tuln | grep 8080

# Check API logs
kubectl logs -n platform platform-api-0
```

### Test: "Database connection failed"

```bash
# Test database connectivity
psql -h localhost -U audit_trail_user -d audit_trail -c "SELECT 1"

# Check PostgreSQL logs
kubectl logs -n platform postgres-0

# Verify connection string
export DB_HOST=localhost DB_PORT=5432 DB_NAME=audit_trail DB_USER=audit_trail_user
```

### Test: "JWT validation failed"

```bash
# Generate valid test token
python3 -c "
import jwt
import time
token = jwt.encode({'sub': 'test', 'exp': int(time.time()) + 3600}, 'secret', 'HS256')
print(f'Bearer {token}')
"

# Test with valid token
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/fhir/Patient
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Security Tests
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run security tests
        run: |
          cd testing/security-testing
          python3 run_security_test.py results
      - name: Check results
        run: |
          python3 -c "
          import json
          with open('results/security_test_results.json') as f:
            data = json.load(f)
          if not data['summary']['ready_for_submission']:
            exit(1)
          "
      - name: Archive results
        uses: actions/upload-artifact@v2
        with:
          name: security-test-results
          path: results/
```

---

## Phase 6 Week 5-6 Timeline

```
Week 5: OWASP Top 10 & API Security
  Monday: Implement A01-A03 tests
  Tuesday: Implement A04-A06 tests
  Wednesday: API security tests (JWT, headers, validation)
  Thursday: Run tests, document findings

Week 6: Database & Audit Trail Security
  Monday: Database security tests (SQL injection, privilege)
  Tuesday: Encryption and audit trail tests
  Wednesday: Integration testing, fix vulnerabilities
  Thursday: Final validation, FDA submission package
```

---

**Last Updated:** April 25, 2026  
**Next Review:** May 16, 2026  
**Maintained By:** Platform Engineering
