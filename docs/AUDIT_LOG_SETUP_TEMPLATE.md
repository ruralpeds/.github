# Enterprise Project Audit Log Setup Template

This template provides a ready-to-use configuration for adding comprehensive audit logging to any enterprise project.

## Quick Setup (5 minutes)

### 1. Copy Audit Workflow

Copy this to `.github/workflows/audit.yml` in your project:

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

permissions:
  contents: read

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

### 2. Copy Review Stamp Workflow

Copy this to `.github/workflows/review.yml` in your project:

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

permissions:
  contents: read

jobs:
  review:
    uses: timothyhartzog/.github/.github/workflows/review-stamp.yml@main
    with:
      reviewer: ${{ inputs.reviewer }}
      notes: ${{ inputs.notes }}
    permissions:
      contents: write
```

### 3. Create Audit Events Documentation

Create `docs/AUDIT_EVENTS.md` in your project:

```markdown
# Audit Events Catalog

## Authentication & Access

- `auth.login.succeeded` - User login successful
- `auth.login.failed` - User login failed
- `auth.logout` - User logout
- `access.granted` - Access permission granted
- `access.denied` - Access permission denied
- `role.changed` - User role changed

## Data Operations

- `data.created` - New record created
- `data.updated` - Record modified
- `data.deleted` - Record deleted
- `data.accessed` - Record accessed or viewed
- `data.exported` - Data exported or downloaded

## Administrative

- `admin.config.changed` - Configuration changed
- `deployment.started` - Deployment initiated
- `deployment.completed` - Deployment finished
- `deployment.failed` - Deployment failed

## Compliance & Reviews

- `review.completed` - Code review completed
- `compliance.check.passed` - Compliance validation passed
- `compliance.check.failed` - Compliance validation failed

## Application-Specific Events

<!-- Add your application-specific events here -->
```

### 4. Update CODEOWNERS

Add to `.github/CODEOWNERS`:

```
# Audit logging
audit-log/ @timothyhartzog/platform-engineering
docs/AUDIT_EVENTS.md @timothyhartzog/platform-engineering
docs/ENTERPRISE_AUDIT_LOGGING.md @timothyhartzog/platform-engineering
```

### 5. Update README.md

Add to your project's `README.md`:

```markdown
## Audit Logging

This project maintains a comprehensive audit log of all builds, modifications, and reviews.

### View Audit Log

The audit log is stored in `audit-log/ledger.json`:

```bash
# See audit summary
cat audit-log/ledger.json | jq '.summary'

# List all builds
cat audit-log/ledger.json | jq -r '.builds[] | "\(.timestamp) \(.commit.short_sha) \(.commit.message)"'

# View review history
cat audit-log/ledger.json | jq '.review_history'
```

### Stamping a Code Review

To record a code review in the audit log:

```bash
gh workflow run "Review Stamp" \
  -f reviewer="your-name" \
  -f notes="LGTM: All tests pass, security checks OK"
```

For more details, see [ENTERPRISE_AUDIT_LOGGING.md](./docs/ENTERPRISE_AUDIT_LOGGING.md).
```

### 6. Commit and Push

```bash
git add .github/workflows/audit.yml .github/workflows/review.yml docs/AUDIT_EVENTS.md
git commit -m "feat: add enterprise audit logging"
git push origin main
```

## Verification Checklist

After setup, verify:

- [ ] `.github/workflows/audit.yml` exists
- [ ] `.github/workflows/review.yml` exists
- [ ] `docs/AUDIT_EVENTS.md` exists and is documented
- [ ] `.github/CODEOWNERS` includes audit log protection
- [ ] First audit workflow run completed successfully
- [ ] `audit-log/ledger.json` contains initial entry
- [ ] README.md documents how to view audit logs

## Configuration Options

### Audit Log Workflow Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include-deps` | boolean | true | Include dependency snapshots in audit entries |
| `include-test-summary` | boolean | false | Include test result summary |
| `retention-entries` | number | 500 | Maximum number of builds to keep (0 = unlimited) |
| `review-mode` | boolean | false | Mark run as a manual review |
| `reviewer` | string | "" | Name of reviewer (required if review-mode=true) |
| `review-notes` | string | "" | Optional notes for review stamp |

### Example: Custom Retention Policy

To keep only 100 recent builds:

```yaml
jobs:
  audit:
    uses: timothyhartzog/.github/.github/workflows/audit-log.yml@main
    with:
      retention-entries: 100  # Change from 500 to 100
```

### Example: Separate Audit Branch

To store audit logs on a separate branch (useful for large repos):

```yaml
jobs:
  audit:
    uses: timothyhartzog/.github/.github/workflows/audit-log.yml@main
    with:
      audit-branch: audit-logs  # Store on separate branch
```

## Dependency Tracking

The audit system automatically captures dependency snapshots for:

- **Node.js**: package-lock.json, yarn.lock
- **Python**: requirements.txt, pyproject.toml, Pipfile
- **Rust**: Cargo.lock
- **Go**: go.sum
- **Julia**: Manifest.toml

These are stored in each build entry under the `dependencies` field.

## Accessing Audit Data

### Local Machine

```bash
# View all builds
cat audit-log/ledger.json | jq '.builds[] | {timestamp, sha: .commit.short_sha, author: .commit.author}'

# Find builds by author
cat audit-log/ledger.json | jq '.builds[] | select(.commit.author | contains("alice")) | {timestamp, message: .commit.message}'

# Find builds by date range
cat audit-log/ledger.json | jq '.builds[] | select(.timestamp > "2024-01-01" and .timestamp < "2024-01-31")'
```

### GitHub Actions

```bash
# Download audit artifacts from recent run
gh run download --name audit-log

# List all audit workflow runs
gh run list --workflow audit.yml -L 20
```

### In CI/CD Pipelines

```yaml
- name: Query audit log
  run: |
    cat audit-log/ledger.json | jq '.summary'
```

## Common Use Cases

### Report: Last 30 Days of Activity

```bash
THIRTY_DAYS_AGO=$(date -u -d '30 days ago' +%Y-%m-%d)

cat audit-log/ledger.json | jq --arg cutoff "$THIRTY_DAYS_AGO" \
  '.builds[] | select(.timestamp > $cutoff) | {
    date: .timestamp,
    commit: .commit.short_sha,
    author: .commit.author,
    message: .commit.message
  }'
```

### Report: Last Review Date

```bash
cat audit-log/ledger.json | jq '.summary.date_last_reviewed'
```

### Report: All Contributors

```bash
cat audit-log/ledger.json | jq '.summary.contributors'
```

### Export Audit Log as CSV

```bash
cat audit-log/ledger.json | jq -r '.builds[] | [
  .timestamp,
  .commit.short_sha,
  .commit.author,
  .commit.message,
  .build.actor
] | @csv' > audit-export.csv
```

## Security & Best Practices

1. **Immutability**: Audit logs are version-controlled and commit-based
2. **Access Control**: Use `.github/CODEOWNERS` to protect audit directories
3. **Retention**: Configure retention to balance storage and compliance needs
4. **Privacy**: Ensure no PHI/ePHI is logged in commit messages or logs
5. **Regular Review**: Review audit logs monthly for suspicious activity

## Troubleshooting

### Audit Workflow Not Running

Check that the branch is protected and the workflow has correct permissions:

```yaml
permissions:
  contents: write
```

### Missing Build Entries

If builds aren't being recorded:

1. Verify workflow runs are completing successfully
2. Check GitHub Actions logs for errors
3. Ensure repository has write permissions for git

### Corrupt Ledger

If the ledger is corrupted, recreate it from individual entry files:

```bash
python3 << 'EOF'
import json, glob

files = sorted(glob.glob('audit-log/*.json'))
builds = []

for f in files:
  if 'ledger' not in f:
    try:
      data = json.load(open(f))
      builds.append(data)
    except: pass

ledger = {
  "schema_version": "2.0",
  "builds": builds,
  "summary": {
    "total_builds": len(builds),
    "first_build": builds[0]['timestamp'] if builds else None,
    "last_build": builds[-1]['timestamp'] if builds else None,
  }
}

json.dump(ledger, open('audit-log/ledger.json', 'w'), indent=2)
EOF
```

## Next Steps

1. ✅ Complete the 5-minute setup above
2. ✅ Run the first audit workflow
3. ✅ Verify audit-log/ledger.json is created
4. ✅ Add audit log to your .gitignore rules review
5. ✅ Document application-specific audit events
6. ✅ Set up monthly audit review process
7. ✅ Share audit log access with compliance/security teams

## Support

For questions or issues:

1. Review [ENTERPRISE_AUDIT_LOGGING.md](./ENTERPRISE_AUDIT_LOGGING.md)
2. Check [audit-log.yml source](../../.github/workflows/audit-log.yml)
3. Contact: `@timothyhartzog/platform-engineering`

---

**Last Updated**: 2024-01-16  
**Template Version**: 1.0
