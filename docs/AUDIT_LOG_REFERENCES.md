# Audit Logging Reference Documents & Standards

This document catalogs all reference materials, standards, and regulations that inform the enterprise audit logging system.

## Regulatory & Compliance Standards

### Healthcare-Specific

| Standard | Title | Scope | Key Requirements |
|----------|-------|-------|------------------|
| **HIPAA** | Health Insurance Portability and Accountability Act | PHI/ePHI Protection | Access controls, audit trails, breach notification |
| **HIPAA Security Rule** | 45 CFR § 164.312 | Technical Safeguards | Audit logs required for all PHI access |
| **HITECH Act** | Health Information Technology for Economic and Clinical Health | ePHI Breach Notification | Mandatory audit logging for covered entities |
| **HL7 FHIR** | Fast Healthcare Interoperability Resources | Clinical Data Exchange | Standard data format with auditability |

### Information Security

| Standard | Title | Scope | Key Requirements |
|----------|-------|-------|------------------|
| **NIST SP 800-66** | Guidelines for the Security of ePHI | Healthcare IT Security | Maps HIPAA requirements to NIST controls |
| **NIST SP 800-218** | Secure Software Development Framework | Supply Chain Security | Secure development and audit practices |
| **NIST SP 800-53** | Security and Privacy Controls | General Security | AC-2 (Account Management), AU (Audit & Accountability) |
| **NIST SP 800-171** | Protecting Controlled Unclassified Information | Cybersecurity Requirements | Detailed security control implementation |

### Software Security

| Standard | Title | Scope | Key Requirements |
|----------|-------|-------|------------------|
| **OWASP ASVS 4.0** | Application Security Verification Standard | Web Application Security | Logging, error handling, access control |
| **OWASP Top 10** | OWASP Top 10 Web Application Security Risks | Application Security | Covers injection, broken auth, sensitive data exposure |
| **OWASP Logging** | OWASP Logging Cheat Sheet | Secure Logging Practices | What to log, what not to log, PII redaction |
| **CWE/SANS Top 25** | Most Dangerous Software Weaknesses | Vulnerability Categories | Guides secure coding practices |

### Supply Chain & Provenance

| Standard | Title | Scope | Key Requirements |
|----------|-------|-------|------------------|
| **SLSA** | Supply-chain Levels for Software Artifacts | Software Provenance | Build integrity, artifact signing, traceability |
| **SBOM** | Software Bill of Materials | Dependency Tracking | Cyclonedx, SPDX formats for component inventory |
| **VEX** | Vulnerability Exploitability eXchange | Vulnerability Assessment | Communicate known vulnerabilities and status |

## GitHub-Specific References

### GitHub Actions Security

| Resource | URL | Topic |
|----------|-----|-------|
| Actions Security Hardening | https://docs.github.com/en/actions/security-guides | Securing workflows, secrets, permissions |
| OIDC Token in GitHub Actions | https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect | Artifact signing, OIDC-based identity |
| Encrypted Secrets | https://docs.github.com/en/actions/security-guides/encrypted-secrets | Managing secrets in workflows |
| Workflow Permissions | https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions | Least privilege for workflow permissions |
| Audit Logging | https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization | GitHub org-level audit logging |

### GitHub Repository Features

| Feature | Documentation | Purpose |
|---------|---------------|---------|
| CODEOWNERS | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners | Enforce review requirements for sensitive files |
| Branch Protection | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches | Require status checks before merge |
| Artifact Retention | https://docs.github.com/en/actions/managing-workflow-runs/removing-workflow-artifacts | Control artifact lifecycle |
| Environments | https://docs.github.com/en/actions/deployment/targeting-different-environments | Protect production deployments |

## Healthcare Data Standards

### HL7 & FHIR

| Resource | Link | Topic |
|----------|------|-------|
| HL7 FHIR R4 Specification | http://hl7.org/fhir/R4/ | Clinical data exchange standard |
| FHIR AuditEvent Resource | http://hl7.org/fhir/R4/auditevent.html | Structured audit event format |
| FHIR Security & Privacy | http://hl7.org/fhir/R4/security.html | Healthcare data security patterns |
| HL7 v2 Standard | http://www.hl7.org/implement/standards/product_brief.cfm?product_id=185 | Legacy healthcare messaging |

### Interoperability

| Standard | Scope | Use Case |
|----------|-------|----------|
| **Direct Secure Messaging** | HIPAA-compliant email | Direct provider-to-provider communication |
| **SFTP/FTPS** | Secure file transfer | EDI 834, 837 claim submissions |
| **HTTPS/TLS 1.2+** | Encrypted transport | All sensitive data in transit |
| **mTLS** | Mutual TLS authentication | Service-to-service authentication |

## Development Frameworks & Libraries

### Logging & Observability

| Technology | Type | Purpose | Docs |
|-----------|------|---------|------|
| OpenTelemetry | Standard | Unified logging, tracing, metrics | https://opentelemetry.io |
| Structured Logging | Pattern | JSON-formatted logs for parsing | https://www.kartar.net/2015/12/structured-logging/ |
| Jaeger | Tool | Distributed tracing | https://www.jaegertracing.io |
| Prometheus | Tool | Metrics collection | https://prometheus.io |
| ELK Stack | Stack | Elasticsearch, Logstash, Kibana | https://www.elastic.co/what-is/elk-stack |

### Audit & Security

| Library | Language | Purpose |
|---------|----------|---------|
| python-audit | Python | Comprehensive audit logging for Python apps |
| audit.js | Node.js | Audit logging middleware |
| java.util.logging | Java | Built-in Java logging framework |
| log4rs | Rust | Structured logging for Rust |
| serilog | C# | Structured logging library |

## Code Examples & Patterns

### Audit Event Emission

**Python Example:**
```python
import json
from datetime import datetime, timezone

def emit_audit_event(event_name: str, actor: str, target: str, outcome: str, details: dict = None):
    """Emit a structured audit event."""
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event_name,
        "actor": actor,
        "target": target,
        "outcome": outcome,
        "details": details or {}
    }
    # Log as JSON (never log full objects containing PHI)
    print(json.dumps(event))

# Usage
emit_audit_event(
    event_name="patient.record.accessed",
    actor="dr.smith@hospital.org",
    target="patient:12345",
    outcome="success"
)
```

**JavaScript Example:**
```javascript
function emitAuditEvent(eventName, actor, target, outcome, details = {}) {
  const event = {
    timestamp: new Date().toISOString(),
    event: eventName,
    actor: actor,
    target: target,
    outcome: outcome,
    details: details
  };
  
  // Log as JSON
  console.log(JSON.stringify(event));
  
  // Could also emit to audit service
  // auditService.log(event);
}

// Usage
emitAuditEvent('auth.login.succeeded', 'user@example.com', 'session:xyz', 'success');
```

## Build & Release Provenance

### Git Commit Metadata

Every audit entry captures:
- **Commit SHA**: Immutable identifier
- **Author**: Git user identity
- **Timestamp**: Commit creation time
- **Message**: Change description
- **Branch**: Development line

### GitHub Actions Metadata

Every build captures:
- **Run ID**: Unique workflow execution identifier
- **Run Number**: Sequence number per workflow
- **Workflow**: Workflow file name
- **Event**: Trigger type (push, pull_request, etc.)
- **Actor**: User or service account
- **Environment**: Runner OS and configuration

### Dependency Provenance

Captured for each build:
- **Lock Files**: package-lock.json, Cargo.lock, etc.
- **Timestamps**: When dependencies were resolved
- **Versions**: Pinned versions at build time
- **Hashes**: Integrity verification

## Audit Log Retention Policies

### Recommended Retention Periods

| Event Type | Retention Period | Justification |
|-----------|------------------|---------------|
| Standard Audit Events | 7 years | HIPAA requirement |
| Security/Access Events | 10 years | Regulatory requirement |
| Deployment/Release Events | 5 years | Support/incident investigation |
| Build Logs | 2 years | CI/CD troubleshooting |
| Code Review Records | 7 years | Compliance audit trail |

### Deletion & Purging

- Never delete audit records manually
- Use retention policies to auto-purge old entries
- Maintain archive copies for compliance hold
- Document purge procedures in runbooks

## Related Documentation in This Repository

### Main Documents

1. **[ENTERPRISE_AUDIT_LOGGING.md](./ENTERPRISE_AUDIT_LOGGING.md)**
   - Complete guide to audit logging system
   - Configuration details and usage examples
   - Access patterns and queries

2. **[AUDIT_LOG_SETUP_TEMPLATE.md](./AUDIT_LOG_SETUP_TEMPLATE.md)**
   - Quick-start template for new projects
   - Workflow configurations
   - Verification checklist

3. **[../HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md](../HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md)**
   - Enterprise healthcare repository standards
   - Audit logging as core requirement
   - Definition of done criteria

### Workflow Files

1. **[../../.github/workflows/audit-log.yml](../../.github/workflows/audit-log.yml)**
   - Reusable workflow for audit logging
   - Builds ledger and individual entries
   - Captures dependencies and metadata

2. **[../../.github/workflows/review-stamp.yml](../../.github/workflows/review-stamp.yml)**
   - Reusable workflow for recording reviews
   - Updates ledger with review dates
   - Maintains review history

### Compliance & Verification

1. **[../scripts/verify-audit-logging.sh](../scripts/verify-audit-logging.sh)**
   - Bash script to verify audit logging compliance
   - Checks all org repositories
   - Generates compliance reports

2. **[../scripts/check_compliance.py](../scripts/check_compliance.py)**
   - Python script for comprehensive repo scanning
   - Checks CI, audit, testing, and review configurations
   - Creates issues for non-compliant repos

## Legal & Regulatory References

### Official Sources

- **HHS HIPAA**: https://www.hhs.gov/hipaa/
- **NIST CSRC**: https://csrc.nist.gov/
- **HL7 International**: https://www.hl7.org/
- **GitHub Security**: https://docs.github.com/en/security
- **OWASP**: https://owasp.org/

### Guidance Documents

- **HIPAA Security Rule 45 CFR 164.312**
  - Specifically § 164.312(b): Audit controls
  - Requires logging of information system activity

- **NIST SP 800-66 Rev. 2**
  - Section 3: Technical Safeguards Implementation Guidance
  - Audit control mappings to HIPAA requirements

- **NIST SP 800-53 Rev. 5**
  - AU-2: Audit Events
  - AU-3: Audit Records
  - AC-2: Account Management

## Related Org Standards

This audit logging system supports compliance with:

- Internal security policies
- Data governance frameworks
- Incident response procedures
- Change management processes
- Release management standards
- Disaster recovery/business continuity

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2024-01-16 | Initial production version with dependency snapshots |
| 1.0 | 2023-12-01 | Basic audit logging framework |

## Maintenance

**Last Updated**: 2024-01-16  
**Maintained By**: Platform Engineering  
**Review Cycle**: Quarterly  

For updates to regulatory or standard references, contact the compliance team.

---

**Questions?** Contact `@timothyhartzog/platform-engineering`
