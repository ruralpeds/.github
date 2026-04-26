---
title: "Configure WORM Archive (AWS S3 Object Lock, Glacier, Tape)"
phase: phase-04
slug: worm-archive-s3
preferred-agent: copilot
preflight-confirmation: true

goal: >
  Implement write-once-read-many (WORM) archive strategy for long-term audit 
  log retention. Set up AWS S3 Object Lock (compliance mode), Glacier archival,
  and offline tape backup procedures. Satisfy HIPAA 6-year + FDA indefinite 
  retention requirements.

acceptance-criteria:
  - "AWS S3 bucket created with Object Lock enabled (Compliance mode)"
  - "Object Lock retention set to 7 years (HIPAA § 6 years + buffer)"
  - "Legal hold enabled (prevents deletion even after retention expires)"
  - "S3 versioning enabled (immutable history of all changes)"
  - "Lifecycle policy: transition to Glacier after 90 days (cost optimization)"
  - "Monthly export workflow created (audit-export.yml)"
  - "Encryption: AES-256 at-rest, TLS 1.3 in-transit (verified)"
  - "IAM role created: audit-writer (least-privilege, write-only)"
  - "docs/audit/WORM_ARCHIVE_STRATEGY.md complete"
  - "Quarterly tape archive procedure documented"
  - "Annual restoration test schedule established"
  - "Cost estimate: ~$2-3k/year (documented)"

files-to-touch:
  - ".github/workflows/audit-export.yml" (new)
  - "docs/audit/WORM_ARCHIVE_STRATEGY.md"
  - "docs/audit/RESTORATION_PROCEDURES.md" (new)
  - "docs/audit/restoration-tests/" (yearly test logs)

files-not-to-touch:
  - "copilot-tasks/**"
  - "policies/**"

tests-required: |
  - Create test S3 bucket with Object Lock
  - Upload test object with 7-year retention
  - Attempt deletion: should fail ✅
  - Attempt overwrite: should fail (new version OK) ✅
  - Attempt restore: should succeed ✅
  - Test Glacier transition: wait 1 day, verify object transitions
  - Test IAM role: write succeeds, delete fails ✅
  - Document restoration procedure (quarterly drill template)
  - Annual restoration test: retrieve old tape (if available)

standards:
  - "HIPAA §164.308 — backup & recovery"
  - "21 CFR Part 11 §11.10(d) — record retention"
  - "FDA §524B — supply-chain audit trail"
  - "AWS Best Practices — S3 Object Lock for compliance"

rollback: >
  Delete S3 bucket (requires legal hold removal first).
  Git repo remains primary (no data loss).
  Recommendation: keep archive as second layer (low cost).

labels:
  - "audit"
  - "phase-04"
  - "compliance"
  - "backup"
  - "infrastructure"

---

## Context

**HIPAA §164.308(a)(7)(ii)(B)** requires backup procedures.  
**21 CFR Part 11 §11.10(d)** requires secure, immutable record storage.  
**FDA §524B** requires indefinite audit trail retention (supply-chain).

**Git repo** is primary (hot, mutable by commit).  
**S3 Object Lock** is secondary (cold, immutable).  
**Tape archive** is tertiary (air-gapped, offline, 30-year shelf-life).

## WORM Archive Tiers

### Tier 1: Git (Primary, Hot)
- 30-day event stream
- Merkle-chained, signed with Sigstore
- Nightly integrity checks (audit-verify.yml)
- **RTO**: < 2 hours (immediate)
- **Cost**: $0–20/year

### Tier 2: S3 Object Lock (Secondary, Cold)
- Monthly snapshots, 7-year retention
- AES-256 at-rest, compliance mode (no deletion)
- Automatic Glacier transition after 90 days
- **RTO**: < 4 hours (S3 retrieval)
- **Cost**: ~$500–1500/year

### Tier 3: Tape Archive (Tertiary, Offline)
- Quarterly snapshots, 30-year shelf-life
- GPG-encrypted, air-gapped (ransomware-immune)
- Off-site vault storage
- **RTO**: < 24 hours (tape retrieval from vault)
- **Cost**: ~$500–800/year

## What You're Configuring

### 1. AWS S3 Bucket

```bash
# Create bucket
aws s3api create-bucket \
  --bucket ruralpeds-audit-archive \
  --region us-east-1

# Enable versioning (immutable history)
aws s3api put-bucket-versioning \
  --bucket ruralpeds-audit-archive \
  --versioning-configuration Status=Enabled

# Enable Object Lock (compliance mode, 7-year retention)
aws s3api put-object-lock-configuration \
  --bucket ruralpeds-audit-archive \
  --object-lock-configuration \
    "ObjectLockEnabled=Enabled,Rule={DefaultRetention={Mode=COMPLIANCE,Years=7}}"

# Enable legal hold (cannot delete even after retention expires)
aws s3api put-object-legal-hold \
  --bucket ruralpeds-audit-archive \
  --key audit-logs-2026-04.jsonl.gz \
  --legal-hold Status=ON

# Encrypt at-rest (AES-256)
aws s3api put-bucket-encryption \
  --bucket ruralpeds-audit-archive \
  --server-side-encryption-configuration \
    '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'

# Deny deletion (bucket policy)
aws s3api put-bucket-policy \
  --bucket ruralpeds-audit-archive \
  --policy file://s3-bucket-policy.json
```

### 2. Lifecycle Policy (Glacier Archival)

```json
{
  "Rules": [
    {
      "Id": "archive-after-90-days",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### 3. IAM Role: audit-writer

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::ruralpeds-audit-archive/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::ruralpeds-audit-archive/*"
    },
    {
      "Effect": "Deny",
      "Action": [
        "s3:DeleteObject",
        "s3:DeleteObjectVersion"
      ],
      "Resource": "arn:aws:s3:::ruralpeds-audit-archive/*"
    }
  ]
}
```

### 4. Monthly Export Workflow

Create `.github/workflows/audit-export.yml`:
```yaml
name: Monthly Audit Export to S3
on:
  schedule:
    - cron: "0 0 1 * *"  # 1st of each month, midnight UTC
  workflow_dispatch:

jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Export to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AUDIT_AWS_ACCESS_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AUDIT_AWS_SECRET_KEY }}
        run: |
          YEAR_MONTH=$(date +%Y-%m)
          git log --all --format=%B > audit-logs-$YEAR_MONTH.jsonl
          gzip audit-logs-$YEAR_MONTH.jsonl
          
          aws s3api put-object \
            --bucket ruralpeds-audit-archive \
            --key audit-logs-$YEAR_MONTH.jsonl.gz \
            --body audit-logs-$YEAR_MONTH.jsonl.gz \
            --object-lock-mode COMPLIANCE \
            --object-lock-retain-until-date $(date -d '+7 years' +%Y-%m-%d)
```

### 5. Tape Archive Procedure (Quarterly)

See: docs/audit/WORM_ARCHIVE_STRATEGY.md § Tier 3

## Verification Checklist

- [ ] S3 bucket created: `ruralpeds-audit-archive`
- [ ] Object Lock enabled: Compliance mode, 7-year retention
- [ ] Versioning enabled: all versions immutable
- [ ] Legal hold enabled: survives retention expiration
- [ ] Lifecycle policy: Glacier after 90 days
- [ ] Encryption: AES-256 at-rest (verified via bucket config)
- [ ] IAM role: audit-writer (write-only, no delete)
- [ ] Test: PutObject succeeds, DeleteObject fails ✅
- [ ] Test: Retrieve object succeeds ✅
- [ ] Backup: scheduled monthly export (audit-export.yml)
- [ ] Tape: quarterly archive procedure documented
- [ ] Restoration: test procedure documented + scheduled annually

## Cost Analysis

| Component | Usage | Cost/Month | Notes |
|-----------|-------|-----------|-------|
| **S3 Storage** | ~50 GB/yr × 7 yr = 350 GB | $8–12 | Standard tier (90 days) |
| **Glacier** | ~400 GB | $4–6 | After 90-day transition |
| **Requests** | ~12/month | <$1 | Monthly export PUT |
| **Total S3** | — | ~$15–20/mo | ~$180–240/year |
| **Tape** | 4 × $20 | $80/yr | LTO-9 tapes, $20 ea |
| **Vault** | Off-site | $50–200/mo | Iron Mountain, etc. |
| **Total** | — | ~$250–300/mo | ~$3k–3.6k/year |

## Compliance Checklist

### HIPAA §164.308 — Backup & Recovery
- ✅ Backup procedure documented (WORM_ARCHIVE_STRATEGY.md)
- ✅ Recovery procedure documented (RESTORATION_PROCEDURES.md)
- ✅ Backup tested annually (quarterly drills)
- ✅ Off-site storage (AWS S3, tape vault)
- ✅ Retention ≥ 6 years (configured 7 years)

### 21 CFR Part 11 §11.10(d) — Records & Retention
- ✅ Secure storage (S3 Object Lock, encryption)
- ✅ Immutable (no deletion, legal hold)
- ✅ Tamper-evident (Merkle chain, Sigstore)
- ✅ Retention indefinite (7 years + tape archive)

## References

- [docs/audit/WORM_ARCHIVE_STRATEGY.md](../../docs/audit/WORM_ARCHIVE_STRATEGY.md) — full strategy
- [AWS S3 Object Lock Docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock-overview.html)
- [AWS Glacier Deep Archive](https://aws.amazon.com/s3/storage-classes/glacier/)
- [HIPAA §164.308(a)(7) Backup](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [21 CFR Part 11 §11.10](https://www.ecfr.gov/current/title-21/part-11)
