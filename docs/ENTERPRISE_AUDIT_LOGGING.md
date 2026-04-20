# Enterprise Audit Logging Guide

## Overview

This guide establishes the comprehensive audit logging standard for all enterprise projects in the organization. Every enterprise project must maintain an immutable audit log tracking build dates, modification dates, review dates, and all reference materials used during development.

## What Gets Tracked

### 1. **Build Dates & Metadata**
Every build generates an audit entry capturing:
- Build timestamp (ISO 8601 format)
- GitHub Actions run ID and run number
- Commit SHA and short SHA
- Branch name
- Triggering actor (user or service account)
- Event type (push, pull_request, workflow_dispatch, etc.)
- Runner OS and environment

### 2. **Modification Dates**
- **Date Created**: First commit timestamp
- **Date Modified**: Latest commit timestamp per build
- **Last Updated**: Most recent audit ledger update
- **Commit History**: Complete author and message tracking

### 3. **Review Dates & History**
- **Date Last Reviewed**: Most recent manual review timestamp
- **Review History**: Full array of all reviews with:
  - Reviewer name
  - Review timestamp (ISO 8601)
  - Review notes or LGTM message
  - Complete traceability chain

### 4. **Reference Materials**
All reference materials are captured and indexed:
- **Dependency Snapshots**: Complete lock files (package-lock.json, Cargo.lock, etc.)
- **Commit References**: Full commit messages with authors
- **Build Artifacts**: GitHub Actions run references and logs
- **GitHub URLs**: Direct links to commits, runs, tree state, and comparisons

## Architecture

### Storage Structure

```
audit-log/
├── ledger.json              # Central audit ledger for the repo
├── YYYYMMDDHHMMSS_SHA.json # Individual entry for each build
├── YYYYMMDDHHMMSS_SHA.json
└── ...
```

### Ledger Schema (v2.0)

```json
{
  "schema_version": "2.0",
  "created_at": "2024-01-15T10:30:00Z",
  "last_updated": "2024-01-16T14:45:00Z",
  "repository": "timothyhartzog/project-name",
  "builds": [
    {
      "id": "20240116144500_abc1234",
      "schema_version": "2.0",
      "timestamp": "2024-01-16T14:45:00Z",
      "repository": "timothyhartzog/project-name",
      "date_created": "2024-01-15T10:30:00Z",
      "date_modified": "2024-01-16T14:45:00Z",
      "date_last_reviewed": "2024-01-16T13:00:00Z",
      "build": {
        "run_id": "7891234567",
        "run_number": "42",
        "workflow": "CI",
        "event": "push",
        "actor": "alice.dev",
        "runner_os": "Linux"
      },
      "commit": {
        "sha": "abc12345678901234567890abcdef12345678901",
        "short_sha": "abc1234",
        "message": "feat: add patient search API",
        "author": "Alice Dev <alice@example.com>",
        "branch": "main",
        "tag": "v1.2.0"
      },
      "references": {
        "commit_url": "https://github.com/timothyhartzog/project-name/commit/abc1234...",
        "run_url": "https://github.com/timothyhartzog/project-name/actions/runs/7891234567",
        "tree_url": "https://github.com/timothyhartzog/project-name/tree/abc1234...",
        "compare_url": "https://github.com/timothyhartzog/project-name/compare/abc1234^...abc1234"
      },
      "dependencies": {
        "node-npm": {...},
        "python-requirements": "django==4.2.0\ndjango-rest==3.14.0\n...",
        "rust-Cargo": {...}
      },
      "status": "success"
    }
  ],
  "review_history": [
    {
      "reviewed_at": "2024-01-16T13:00:00Z",
      "reviewer": "bob.qa",
      "notes": "LGTM: All tests pass, security checks OK, ready for production"
    }
  ],
  "summary": {
    "total_builds": 42,
    "first_build": "2024-01-15T10:30:00Z",
    "last_build": "2024-01-16T14:45:00Z",
    "date_created": "2024-01-15T10:30:00Z",
    "date_last_modified": "2024-01-16T14:45:00Z",
    "date_last_reviewed": "2024-01-16T13:00:00Z",
    "contributors": ["alice.dev", "bob.dev", "charlie.infra"]
  }
}
```

## Integration for Enterprise Projects

### Step 1: Add Audit Log Workflow to Your Project

Create `.github/workflows/audit.yml` in your project:

```yaml
name: Audit Log

on:
  push:
    branches: [main, develop]
  pull_request:
  workflow_dispatch:
    inputs:
      reviewer:
        description: 'Reviewer name (for manual review stamp)'
        required: false
      review_notes:
        description: 'Review notes'
        required: false

jobs:
  audit:
    uses: timothyhartzog/.github/.github/workflows/audit-log.yml@main
    with:
      include-deps: true
      include-test-summary: false
      retention-entries: 500
      review-mode: false
      reviewer: ${{ github.event.inputs.reviewer }}
      review-notes: ${{ github.event.inputs.review_notes }}
    permissions:
      contents: write
```

### Step 2: Add Review Stamp Workflow (Optional)

For manual code reviews, create `.github/workflows/review.yml`:

```yaml
name: Review Stamp

on:
  workflow_dispatch:
    inputs:
      reviewer:
        description: 'Name of the reviewer'
        required: true
        type: string
      notes:
        description: 'Review notes (e.g., LGTM, approved for production)'
        required: false
        type: string

jobs:
  review:
    uses: timothyhartzog/.github/.github/workflows/review-stamp.yml@main
    with:
      reviewer: ${{ inputs.reviewer }}
      notes: ${{ inputs.notes }}
    permissions:
      contents: write
```

### Step 3: Document Audit Events

Create `docs/AUDIT_EVENTS.md` in your project:

```markdown
# Audit Events Catalog

This catalog defines all audit events emitted by this enterprise application.

## Authentication Events

- `auth.login.succeeded` - User successfully authenticated
- `auth.login.failed` - Authentication failure (invalid credentials)
- `auth.logout` - User logged out
- `auth.mfa.enabled` - Multi-factor authentication enabled
- `auth.mfa.disabled` - Multi-factor authentication disabled

## Data Access Events

- `patient.record.accessed` - Patient record viewed
- `patient.record.exported` - Patient data exported
- `patient.record.printed` - Patient record printed

## Authorization Events

- `user.role.changed` - User role or permissions changed
- `access.granted` - Access permission granted
- `access.denied` - Access permission denied
- `break_glass.activated` - Emergency access break-glass used

## Data Modification Events

- `patient.record.created` - New patient record created
- `patient.record.updated` - Patient record modified
- `patient.record.deleted` - Patient record deleted
- `patient.record.merged` - Patient records merged

## Administrative Events

- `admin.configuration.changed` - System configuration modified
- `admin.secrets.rotated` - Security credentials rotated
- `deployment.production.approved` - Production deployment approved
- `deployment.rolled_back` - Deployment rolled back

## Build & Release Events

- `build.started` - Build pipeline initiated
- `build.completed` - Build completed successfully
- `build.failed` - Build failed
- `release.created` - Release artifact created
- `release.deployed` - Release deployed to environment

## Compliance Events

- `compliance.check.passed` - Compliance validation passed
- `compliance.check.failed` - Compliance validation failed
- `audit.log.accessed` - Audit log accessed or exported
- `audit.log.retention.enforced` - Audit retention policy applied
```

## Audit Log Access & Queries

### View Ledger Summary

```bash
# See all builds and reviews in summary
cat audit-log/ledger.json | jq '.summary'

# Output:
# {
#   "total_builds": 42,
#   "first_build": "2024-01-15T10:30:00Z",
#   "last_build": "2024-01-16T14:45:00Z",
#   "date_created": "2024-01-15T10:30:00Z",
#   "date_last_modified": "2024-01-16T14:45:00Z",
#   "date_last_reviewed": "2024-01-16T13:00:00Z",
#   "contributors": ["alice.dev", "bob.dev"]
# }
```

### View All Build Dates

```bash
# List all builds with timestamps
cat audit-log/ledger.json | jq -r '.builds[] | "\(.timestamp) \(.commit.short_sha) \(.commit.message)"'
```

### View Modification History

```bash
# Show creation, modification, and review dates
cat audit-log/ledger.json | jq -r '.builds[] | {
  timestamp,
  sha: .commit.short_sha,
  created: .date_created,
  modified: .date_modified,
  reviewed: .date_last_reviewed
}'
```

### View Review History

```bash
# See all reviews performed
cat audit-log/ledger.json | jq '.review_history'
```

### Check Specific Build Entry

```bash
# View detailed entry for a specific build
cat audit-log/20240116144500_abc1234.json | jq '.'
```

### List All Dependencies for a Build

```bash
# Extract all dependency snapshots for a build
cat audit-log/20240116144500_abc1234.json | jq '.dependencies'
```

## Enforcement & Compliance

### Minimum Requirements for Enterprise Projects

Every enterprise project MUST:

1. ✅ **Enable audit-log.yml workflow** on all protected branches
2. ✅ **Maintain audit-log/ directory** in source control with full history
3. ✅ **Document audit events** in docs/AUDIT_EVENTS.md
4. ✅ **Record reviews** using review-stamp.yml workflow
5. ✅ **Retention policy**: Keep last 500 builds minimum
6. ✅ **Access control**: Limit audit log modifications to CI/CD automation
7. ✅ **Regular review**: Review audit logs at least monthly

### Audit Log Protection

The audit log directory should be protected:

```yaml
# .github/CODEOWNERS
audit-log/ @timothyhartzog/platform-engineering
docs/AUDIT_EVENTS.md @timothyhartzog/platform-engineering
docs/ENTERPRISE_AUDIT_LOGGING.md @timothyhartzog/platform-engineering
```

## Compliance Verification

### Check Audit Log Status

```bash
#!/bin/bash
# Verify enterprise project audit readiness

check_audit_log() {
  local repo_path=$1
  
  echo "=== Auditing $repo_path ==="
  
  # Check 1: audit-log.yml exists
  if [ -f "$repo_path/.github/workflows/audit.yml" ]; then
    echo "✓ audit.yml workflow found"
  else
    echo "✗ Missing .github/workflows/audit.yml"
  fi
  
  # Check 2: audit-log/ directory exists
  if [ -d "$repo_path/audit-log" ]; then
    echo "✓ audit-log/ directory found"
    
    # Check ledger exists
    if [ -f "$repo_path/audit-log/ledger.json" ]; then
      echo "✓ ledger.json found"
      
      # Show summary
      cat "$repo_path/audit-log/ledger.json" | jq '.summary'
    fi
  else
    echo "✗ Missing audit-log/ directory"
  fi
  
  # Check 3: AUDIT_EVENTS.md documented
  if [ -f "$repo_path/docs/AUDIT_EVENTS.md" ]; then
    echo "✓ docs/AUDIT_EVENTS.md found"
  else
    echo "✗ Missing docs/AUDIT_EVENTS.md"
  fi
}

check_audit_log "."
```

## Regular Maintenance

### Monthly Audit Review

Schedule monthly audits to:

1. Review all builds in ledger.json
2. Verify review dates are recent
3. Confirm all critical changes have reviews
4. Archive old entries if retention exceeded
5. Update AUDIT_EVENTS.md if new events added

### Annual Audit Certification

Each year, enterprise teams should:

1. Export full audit log
2. Validate completeness and accuracy
3. Confirm no audit tampering
4. Document compliance certifications
5. Archive audit snapshots for regulatory hold

## Accessing Audit Logs from GitHub

### View Through GitHub Web UI

1. Navigate to your repository
2. Go to **Actions** tab
3. Click **Audit Log** workflow
4. Open most recent successful run
5. Download audit artifacts

### View Through GitHub CLI

```bash
# List all audit log workflow runs
gh run list --workflow audit.yml -L 10

# Download latest audit artifacts
gh run download <run-id> -n audit-log

# View ledger directly
gh api repos/{owner}/{repo}/contents/audit-log/ledger.json --jq '.content' | base64 -d
```

## Troubleshooting

### Audit Log Not Updating

```bash
# Check recent git history
git log --oneline audit-log/ | head -10

# Verify workflow permissions
git show HEAD:.github/workflows/audit.yml | grep -A 3 "permissions:"

# Check for push failures in workflow run
gh run list --workflow audit.yml -L 1 --json conclusion
```

### Missing Build Entries

```bash
# Compare git history with audit entries
git log --oneline | wc -l
cat audit-log/ledger.json | jq '.summary.total_builds'

# Rebuild ledger if corrupted
git log --format=%H | while read sha; do
  git show $sha:audit-log/ledger.json 2>/dev/null
done | jq -s '.[0]'
```

## Reference Documents

### Standard References for Implementation

All enterprise projects should align with:

- **[HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)** - Healthcare data protection
- **[NIST SP 800-66 Rev. 2](https://csrc.nist.gov/publications/detail/sp/800-66/rev-2/final)** - HIPAA implementation guidance
- **[NIST SP 800-218](https://csrc.nist.gov/publications/detail/sp/800-218/final)** - Software supply chain security (SSDF)
- **[GitHub Actions Security](https://docs.github.com/en/actions/security-guides)** - Workflow security best practices
- **[HL7 FHIR Standard](https://www.hl7.org/fhir/)** - Healthcare interoperability
- **[OWASP Secure Logging](https://owasp.org/www-project-secure-logging/)** - Secure audit practices

## Getting Help

For questions about enterprise audit logging:

1. Check [ENTERPRISE_AUDIT_LOGGING.md](./ENTERPRISE_AUDIT_LOGGING.md) (this file)
2. Review [audit-log.yml workflow](../.github/workflows/audit-log.yml)
3. Review [review-stamp.yml workflow](../.github/workflows/review-stamp.yml)
4. Contact: `@timothyhartzog/platform-engineering`

---

**Last Updated**: 2024-01-16  
**Schema Version**: 2.0  
**Maintained By**: Platform Engineering
