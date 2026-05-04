# Phase 6B: Security Hardening — Implementation Plan

**Status:** Implementation  
**Date:** May 4, 2026  
**Duration:** 2 weeks  
**Priority:** Critical (Phase 6B is highest priority)

---

## Overview

Phase 6B implements five security hardening components in priority order:

1. **Cryptographic Audit Trail** (days 1-3)
2. **Secrets Management** (days 3-5)
3. **Encryption at Rest & Transit** (days 5-7)
4. **Authentication & Authorization** (days 7-10)
5. **Vulnerability Scanning** (days 10-14)

---

## Component 1: Cryptographic Audit Trail

### Problem
Current JSONL audit trail can be modified without detection. Compliance requires immutable, tamper-proof logs.

### Solution
Append-only blockchain-style audit log with cryptographic signatures.

### Implementation

**`scripts/audit-log-signer.py`** (200 lines)
```python
class AuditLogSigner:
    def __init__(self, signing_key_path: str):
        self.key = load_key(signing_key_path)
        
    def sign_entry(self, event: Dict) -> Dict:
        """Add signature to audit entry"""
        # Get previous entry's hash
        previous_hash = self._get_previous_hash()
        
        # Create entry without signature
        entry = {
            "sequence": event["sequence"],
            "timestamp": event["timestamp"],
            "event_type": event["event_type"],
            "data": event["data"],
            "previous_hash": previous_hash
        }
        
        # Sign with HMAC-SHA256
        signature = hmac.new(
            self.key,
            json.dumps(entry).encode(),
            hashlib.sha256
        ).hexdigest()
        
        entry["signature"] = signature
        return entry
    
    def _get_previous_hash(self) -> str:
        """Get hash of previous entry"""
        # Read last line from audit trail
        # Compute SHA256 of that entry
        pass
```

**`scripts/audit-log-verifier.py`** (200 lines)
```python
class AuditLogVerifier:
    def verify_integrity(self, audit_file: Path) -> Dict:
        """Verify audit trail integrity"""
        results = {
            "valid": True,
            "entries_checked": 0,
            "tampering_detected": False,
            "errors": []
        }
        
        previous_hash = None
        
        for i, entry in enumerate(read_jsonl(audit_file)):
            # Verify signature
            if not self._verify_signature(entry):
                results["valid"] = False
                results["errors"].append(f"Line {i}: Invalid signature")
            
            # Verify hash chain
            if entry.get("previous_hash") != previous_hash:
                results["valid"] = False
                results["errors"].append(f"Line {i}: Hash chain broken")
            
            # Update for next iteration
            previous_hash = self._compute_hash(entry)
            results["entries_checked"] += 1
        
        if results["errors"]:
            results["tampering_detected"] = True
        
        return results
```

**Workflow: `workflows/audit-trail-signing.yml`**
- Runs daily
- Signs all new audit entries
- Verifies integrity of entire trail
- Alerts on tampering detected

### Success Criteria
- [ ] All audit entries signed
- [ ] Hash chain unbroken
- [ ] Tampering detection working
- [ ] Daily verification passing

---

## Component 2: Secrets Management

### Problem
API keys, GitHub tokens, database credentials in environment variables or config files. Risk of exposure.

### Solution
AWS Secrets Manager for secure storage, rotation, audit.

### Implementation

**`scripts/secret-manager.py`** (150 lines)
```python
class SecretManager:
    def __init__(self, region: str = "us-east-1"):
        self.client = boto3.client("secretsmanager", region_name=region)
    
    def get_secret(self, secret_name: str) -> str:
        """Retrieve secret from Secrets Manager"""
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            if "SecretString" in response:
                return response["SecretString"]
            else:
                return base64.b64decode(response["SecretBinary"])
        except Exception as e:
            raise ValueError(f"Failed to retrieve {secret_name}: {e}")
    
    def rotate_secret(self, secret_name: str, new_value: str):
        """Rotate a secret to new value"""
        # Update secret value
        self.client.put_secret_value(
            SecretId=secret_name,
            SecretString=new_value
        )
        # Version is automatically created
    
    def get_secret_value(self, secret_name: str, version_id: str = None) -> str:
        """Get specific version of secret"""
        if version_id:
            response = self.client.get_secret_value(
                SecretId=secret_name,
                VersionId=version_id
            )
        else:
            response = self.client.get_secret_value(SecretId=secret_name)
        
        return response["SecretString"]
    
    def list_versions(self, secret_name: str) -> List[Dict]:
        """List all versions of a secret"""
        response = self.client.list_secret_version_ids(SecretId=secret_name)
        return response["Versions"]
```

**Secrets to Create**:
```bash
# GitHub token for workflows
aws secretsmanager create-secret --name github-token

# Database credentials
aws secretsmanager create-secret --name db-user
aws secretsmanager create-secret --name db-password

# Signing keys
aws secretsmanager create-secret --name audit-signing-key

# API keys
aws secretsmanager create-secret --name slack-webhook-token
aws secretsmanager create-secret --name pagerduty-token
```

**Workflow: `workflows/secret-rotation.yml`**
- Runs monthly
- Rotates GitHub token
- Rotates database credentials
- Updates all references
- Verifies connectivity

### Success Criteria
- [ ] All secrets in Secrets Manager
- [ ] No hardcoded credentials in repo
- [ ] Automatic rotation working
- [ ] Access audit trail complete

---

## Component 3: Encryption at Rest & Transit

### Problem
Cost data, metrics, alerts stored unencrypted. Traffic over unencrypted channels.

### Solution
- At Rest: AES-256 encryption on all storage
- In Transit: TLS 1.3 on all connections

### Implementation

**Database Encryption**:
```bash
# Enable encryption on TimescaleDB
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';

# Encrypt existing tables
CREATE EXTENSION pgcrypto;
ALTER TABLE metrics ADD COLUMN data_encrypted bytea;
UPDATE metrics SET data_encrypted = pgp_sym_encrypt(
  data::text, 
  get_secret('encryption-key')
);
```

**S3 Bucket Encryption**:
```bash
# Enable default encryption
aws s3api put-bucket-encryption \
  --bucket audit-log-backup \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

**TLS Configuration**:
- API requires HTTPS (redirect HTTP)
- TLS 1.3 minimum
- Certificate pinning for critical APIs
- Regular certificate renewal

### Success Criteria
- [ ] Database encryption enabled
- [ ] S3 buckets encrypted
- [ ] All APIs on HTTPS only
- [ ] TLS 1.3 enforced

---

## Component 4: Authentication & Authorization

### Problem
No authentication on dashboards/APIs. Anyone with URL access can view sensitive cost/performance data.

### Solution
OAuth2 with GitHub, RBAC for access control.

### Implementation

**`services/auth-service.py`** (250 lines)
```python
class AuthService:
    def __init__(self, github_app_id: str, client_secret: str):
        self.github_app_id = github_app_id
        self.client_secret = client_secret
    
    def get_auth_url(self, state: str) -> str:
        """Generate GitHub OAuth URL"""
        params = {
            "client_id": self.github_app_id,
            "redirect_uri": "https://app.example.com/auth/callback",
            "state": state,
            "scope": "read:org read:user"
        }
        return f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    
    def exchange_code(self, code: str) -> Dict:
        """Exchange code for access token"""
        response = requests.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": self.github_app_id,
                "client_secret": self.client_secret,
                "code": code
            },
            headers={"Accept": "application/json"}
        )
        return response.json()
    
    def get_user_info(self, access_token: str) -> Dict:
        """Get GitHub user info"""
        response = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        return response.json()
    
    def get_user_orgs(self, access_token: str) -> List[str]:
        """Get GitHub organizations user belongs to"""
        response = requests.get(
            "https://api.github.com/user/orgs",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        return [org["login"] for org in response.json()]
    
    def create_jwt_token(self, user_info: Dict, orgs: List[str]) -> str:
        """Create JWT with user claims"""
        claims = {
            "sub": user_info["login"],
            "aud": "dashboard-api",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=24),
            "orgs": orgs,
            "email": user_info.get("email")
        }
        return jwt.encode(
            claims,
            get_secret("jwt-signing-key"),
            algorithm="HS256"
        )
```

**Authorization Roles**:
```json
{
  "roles": {
    "public": {
      "permissions": ["read:dashboard-summary"]
    },
    "viewer": {
      "permissions": ["read:dashboard", "read:api:metrics"]
    },
    "editor": {
      "permissions": ["read:dashboard", "read:api:metrics", "write:alerts"]
    },
    "admin": {
      "permissions": ["*"]
    }
  },
  "mappings": {
    "github-org:ruralpeds": "admin",
    "github-team:ruralpeds/sre": "editor",
    "public": "public"
  }
}
```

### Success Criteria
- [ ] OAuth2 configured with GitHub
- [ ] JWT tokens working
- [ ] Role-based access control enforced
- [ ] Public users see summary only

---

## Component 5: Vulnerability Scanning

### Problem
No automated detection of CVEs in dependencies or container images.

### Solution
Weekly automated scanning with CVE detection and issue creation.

### Implementation

**`workflows/security-scan.yml`**
```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  scan-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Scan Python dependencies
        run: |
          pip install pip-audit
          pip-audit --desc > /tmp/python-audit.txt
          
      - name: Report vulns
        run: |
          if grep -q "CRITICAL\|HIGH" /tmp/python-audit.txt; then
            cat /tmp/python-audit.txt
            exit 1
          fi

  scan-containers:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Scan container images
        run: |
          # Scan all Dockerfiles
          for dockerfile in $(find . -name Dockerfile); do
            trivy config "$dockerfile" > /tmp/trivy-report.json
          done

  scan-iac:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Scan IaC
        run: |
          pip install checkov
          checkov -d . --framework terraform,yaml > /tmp/iac-scan.json

  report:
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Create vulnerability issue
        if: failure()
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          gh issue create \
            --title "Security: CVEs detected in dependencies" \
            --label "security" \
            --label "urgent" \
            --body "CVEs detected. Review scan results above."
```

### Success Criteria
- [ ] Weekly scans running
- [ ] CVEs detected and reported
- [ ] Issues created for critical CVEs
- [ ] Zero critical CVEs in production

---

## Deployment Checklist

### Prerequisites
- [ ] AWS account with Secrets Manager access
- [ ] GitHub OAuth app configured
- [ ] TLS certificates ready
- [ ] Database backup created
- [ ] Rollback plan documented

### Deployment Steps

1. **Deploy Cryptographic Audit Trail** (Day 1-3)
   ```bash
   python3 scripts/audit-log-signer.py --input audit-log/events.jsonl
   python3 scripts/audit-log-verifier.py --input audit-log/events.jsonl
   gh workflow run audit-trail-signing.yml
   ```

2. **Configure Secrets Manager** (Day 3-5)
   ```bash
   # Create all secrets
   for secret in github-token db-user db-password jwt-signing-key; do
     aws secretsmanager create-secret --name $secret
   done
   
   # Test retrieval
   python3 scripts/secret-manager.py --get github-token
   ```

3. **Enable Encryption** (Day 5-7)
   ```bash
   # Database encryption
   psql << EOF
   ALTER SYSTEM SET ssl = on;
   SELECT pg_reload_conf();
   EOF
   
   # S3 encryption
   aws s3api put-bucket-encryption ...
   ```

4. **Deploy Authentication** (Day 7-10)
   ```bash
   # Configure GitHub OAuth app
   # Deploy auth-service.py
   # Update API to require auth tokens
   # Test OAuth flow
   ```

5. **Enable Vulnerability Scanning** (Day 10-14)
   ```bash
   gh workflow run security-scan.yml
   # Verify issues created for any CVEs
   ```

### Rollback Plan
- Secrets Manager → Environment variables (temporary)
- Encryption → Turn off (data remains encrypted)
- Auth → Disable (public access, logged)
- Audit trail → Keep old format

### Validation
- [ ] All secrets retrievable
- [ ] Database encrypted and queryable
- [ ] OAuth flow working (test user)
- [ ] Audit trail verified
- [ ] No broken functionality

---

## Success Metrics

- Zero critical CVEs
- 100% of connections on TLS 1.3
- All secrets in Secrets Manager
- Audit trail tamper-proof
- All users authenticated

---

**Next Phase**: 6A (Performance Optimization)
