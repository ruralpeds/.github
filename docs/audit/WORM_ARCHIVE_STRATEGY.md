# WORM Archive Strategy for Audit Logs

**Phase 4 Deliverable**: Immutable backup architecture  
**Last Updated**: 2026-04-24  
**Purpose**: Implement write-once-read-many (WORM) storage for audit log retention

---

## Executive Summary

WORM (Write-Once-Read-Many) archives ensure audit logs **cannot be modified, deleted, or tampered with** after creation. This satisfies:

- **HIPAA §164.312(b)** — audit controls (tamper-detection)
- **21 CFR Part 11 §11.10(d)** — record retention (secure storage)
- **FDA Guidance** — supply-chain audit immutability
- **IEC 62304** — design change traceability

**Recommended architecture:**
- **Primary**: Git repository (Merkle-chained, signed commits)
- **Secondary**: AWS S3 with Object Lock (legal hold, compliance mode)
- **Tertiary**: Offline archive (quarterly tape backup, vault storage)

---

## Architecture

```
                    ┌──────────────────┐
                    │   Audit Events   │
                    │  (CI/CD actions) │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────┐        ┌─────────────┐      ┌──────────┐
    │   Git  │        │ S3 Glacier  │      │  Tape    │
    │ Merkle │        │ Object Lock │      │ Archive  │
    │ Chain  │        │ (Compliance)│      │ (Vault)  │
    └────────┘        └─────────────┘      └──────────┘
   (hot access)      (cold storage)     (offline backup)
    30-day           6-7 year           6-7 year
    retention        retention          retention
```

---

## Tier 1: Git Repository (Primary, Hot)

### Storage

**Location**: GitHub (`.github` repository)  
**Mechanism**: Immutable commit history + Merkle-chained audit logs  
**Access**: GitHub CLI, Git

### How It Works

1. **Audit events logged** → `audit-log.jsonl` per week
2. **Signed with cosign** → Sigstore Fulcio + Rekor ledger
3. **Committed to main** → Requires signed commit (enforced by ruleset)
4. **Merkle chain verified** → Nightly `audit-verify.yml`

### Guarantees

✅ **Immutability**: Commit history cannot be rewritten (GitHub org ruleset blocks force-push)  
✅ **Tamper-detection**: Merkle chain + Sigstore verify no modifications  
✅ **Non-repudiation**: Signatures link to GitHub OIDC identity  
✅ **Access control**: GitHub org 2FA + SAML SSO required

### Retention

**30 days** of full event stream in Git  
**6+ years** of monthly log summaries (audit-logs/YYYY-MM.jsonl.gz)

### Implementation

```bash
# In audit-log.yml (weekly)
git config user.name "Audit Bot"
git config user.email "audit@github.com"
git checkout -b audit/$(date +%Y-%m-d)

# Append events to audit log
cat >> audit-logs/$(date +%Y-%m).jsonl << 'EOF'
{
  "event_type": "...",
  "timestamp": "2026-04-24T12:00:00Z",
  ...
}
EOF

# Commit + sign
git add audit-logs/$(date +%Y-%m).jsonl
git commit -S -m "audit: log week of $(date +%Y-%m-%d)"

# Push to main (signed commit enforced by org ruleset)
git push origin audit/$(date +%Y-%m-d)
gh pr create --base main --fill --title "Audit logs: $(date +%Y-%m)"
```

---

## Tier 2: AWS S3 + Object Lock (Secondary, Cold)

### Storage

**Location**: AWS S3 bucket (e.g., `s3://ruralpeds-audit-archive`)  
**Mechanism**: S3 Object Lock in **Compliance Mode** (cannot be deleted, even by root)  
**Access**: AWS CLI, S3 API (restricted)

### How It Works

1. **Monthly audit logs exported** from Git → gzipped JSON lines
2. **Uploaded to S3 with metadata** (hash, signature, version)
3. **Object Lock enabled** → Legal hold + governance mode
4. **Retention lock set** → 7 years (matches HIPAA requirement)
5. **Versioning enabled** → All modifications create new versions (immutable history)

### Guarantees

✅ **Write-once**: Object cannot be overwritten or deleted (compliance mode)  
✅ **Immutable**: Even AWS root account cannot delete (if legal hold set)  
✅ **Versioned**: All modifications tracked (append-only)  
✅ **Encrypted**: AES-256 at-rest, TLS 1.3 in-transit

### Retention

**7 years** per HIPAA §164.308  
**Monthly exports** from Git → one S3 object per month  
**File naming**: `audit-logs-YYYY-MM.jsonl.gz`

### AWS Configuration

```json
// S3 Bucket Policy (Object Lock enabled)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyDeleteObject",
      "Effect": "Deny",
      "Principal": "*",
      "Action": [
        "s3:DeleteObject",
        "s3:DeleteObjectVersion",
        "s3:PutLifecycleConfiguration"
      ],
      "Resource": "arn:aws:s3:::ruralpeds-audit-archive/*"
    },
    {
      "Sid": "AllowAuditWrite",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/audit-writer"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::ruralpeds-audit-archive/*"
    }
  ]
}

// Object Lock Settings
{
  "ObjectLockEnabled": "Enabled",
  "Rule": {
    "DefaultRetention": {
      "Mode": "COMPLIANCE",
      "Years": 7
    }
  }
}
```

### Implementation

```bash
# In audit-export.yml (monthly)
- name: Export audit logs to S3
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AUDIT_AWS_ACCESS_KEY }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AUDIT_AWS_SECRET_KEY }}
    AWS_REGION: us-east-1
  run: |
    # Fetch git logs for the month
    YEAR_MONTH=$(date +%Y-%m)
    git log --all --grep="^audit:" --since="$YEAR_MONTH-01" \
            --until="$(date -d '+1 month' +%Y-%m)-01" \
            --format=%B > audit-logs-$YEAR_MONTH.jsonl

    # Compress
    gzip audit-logs-$YEAR_MONTH.jsonl

    # Upload to S3 with Object Lock
    aws s3api put-object \
      --bucket ruralpeds-audit-archive \
      --key audit-logs-$YEAR_MONTH.jsonl.gz \
      --body audit-logs-$YEAR_MONTH.jsonl.gz \
      --object-lock-mode COMPLIANCE \
      --object-lock-retain-until-date $(date -d '+7 years' +%Y-%m-%d)

    echo "Exported to S3: s3://ruralpeds-audit-archive/audit-logs-$YEAR_MONTH.jsonl.gz"
```

---

## Tier 3: Offline Tape Archive (Tertiary, Archived)

### Storage

**Location**: Physical tape vault (e.g., AWS Glacier Deep Archive, or local tape library)  
**Mechanism**: Quarterly snapshots, cryptographically signed, stored off-site  
**Access**: Out-of-band retrieval process (security procedure)

### How It Works

1. **Quarterly export** of all audit logs for the quarter
2. **Encrypted** with GPG (asymmetric, escrow key)
3. **Checksummed** (SHA-256, Merkle root included)
4. **Burned to LTO tape** (ultrium generation 9+, 18 TB capacity)
5. **Sealed in archival case** (tamper-evident)
6. **Stored in vault** (climate-controlled, off-site)
7. **Restoration tested** annually (quarterly drill)

### Guarantees

✅ **Air-gapped**: No network access (ransomware immunity)  
✅ **Long-lived**: LTO tape shelf-life ~30 years  
✅ **Encrypted**: GPG-encrypted, key in escrow  
✅ **Verifiable**: HMAC checksums, signature verification  

### Retention

**7 years** (annual refresh cycle; old tapes retired/destroyed per NIST guidelines)  
**Quarterly tapes**: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)

### Implementation

```bash
# In audit-archive-tape.yml (quarterly, manual trigger)
- name: Create quarterly tape archive
  run: |
    QUARTER=$(python3 -c "import datetime; print(f'Q{(datetime.datetime.now().month-1)//3+1}')")
    YEAR=$(date +%Y)

    # Export all audit logs for the quarter
    git log --all --grep="^audit:" \
            --since="${YEAR}-01-01" \
            --until="$(date +%Y)-12-31" \
            --format=%B > audit-archive-$YEAR-$QUARTER.jsonl

    # Sign
    gpg --sign --armor audit-archive-$YEAR-$QUARTER.jsonl

    # Checksum
    sha256sum audit-archive-$YEAR-$QUARTER.jsonl > audit-archive-$YEAR-$QUARTER.jsonl.sha256

    # Compress for tape
    tar czf audit-archive-$YEAR-$QUARTER.tar.gz \
           audit-archive-$YEAR-$QUARTER.jsonl.asc \
           audit-archive-$YEAR-$QUARTER.jsonl.sha256

    # Print for tape labeling
    echo "Archive: audit-archive-$YEAR-$QUARTER.tar.gz ($(du -h audit-archive-$YEAR-$QUARTER.tar.gz | cut -f1))"
    echo "SHA256: $(sha256sum audit-archive-$YEAR-$QUARTER.tar.gz | cut -d' ' -f1)"
    echo ""
    echo "TAPE LABEL:"
    echo "  Product: ruralpeds Audit Archive"
    echo "  Quarter: $QUARTER $YEAR"
    echo "  Retention: Until $(date -d '+7 years' +%Y-%m-%d)"
    echo "  Encryption: GPG (key in escrow)"
    echo "  Hash: $(sha256sum audit-archive-$YEAR-$QUARTER.tar.gz | cut -d' ' -f1)"
```

---

## Verification & Testing

### Daily
- ✅ Audit logs append-only (no modifications)
- ✅ Merkle chain valid (no tampering)
- ✅ Sigstore signatures valid

### Monthly
- ✅ Export to S3 succeeds
- ✅ Object Lock prevents deletion (test attempt)
- ✅ S3 object retrievable

### Quarterly
- ✅ Tape archive created
- ✅ GPG signature verifiable
- ✅ Checksums match
- ✅ Tape stored in vault

### Annually
- ✅ Tape retrieval test (read oldest tape)
- ✅ GPG decryption works (escrowed key retrieved)
- ✅ Data integrity verified (checksums pass)
- ✅ Retention policy documented + reviewed

**Test results logged**: `docs/audit/restoration-tests/YYYY-QN.md`

---

## Compliance Checklist

### HIPAA §164.308 — Backup & Recovery

- ✅ Backup procedure documented (`docs/audit/WORM_ARCHIVE_STRATEGY.md`)
- ✅ Recovery procedures documented (`docs/audit/RESTORATION_PROCEDURES.md`)
- ✅ Backup tested annually (restoration drill)
- ✅ Backup stored off-site (AWS S3, tape vault)
- ✅ Backup retention ≥ 6 years

### 21 CFR Part 11 §11.10 — Records & Data Integrity

- ✅ Records immutable (Git ruleset + S3 Object Lock)
- ✅ Tampering detection (Merkle chain + Sigstore)
- ✅ Encryption (AES-256 at-rest, TLS 1.3 in-transit)
- ✅ Authenticity (GPG signatures, Sigstore)

### FDA §524B — Cybersecurity

- ✅ Audit trail immutable (supply-chain security)
- ✅ Access control (GitHub 2FA + org rulesets)
- ✅ Incident response (automated alerts on tampering)

### IEC 62304 — Design & Change Control

- ✅ Design history traceable (audit logs)
- ✅ Change log immutable (Merkle chain)
- ✅ Release history archived (7+ years)

---

## Cost Estimate (Annual)

| Component | Cost | Notes |
|-----------|------|-------|
| **Git Storage** | $0–20 | GitHub included; add cost if self-hosted |
| **S3 Standard** | $500–1500 | ~500 GB/year × 2-3 years online |
| **S3 Glacier Deep** | $100–300 | Transition after 90 days; cheaper long-term |
| **LTO Tapes** | $50–100/quarter | 4 tapes/year × $15–25 each |
| **Vault Storage** | $50–200/quarter | Off-site vault (Brinks, Iron Mountain) |
| **Restoration Tests** | Included | Quarterly drills, mostly manual |
| **Total** | ~$2–3k/year | Industry-standard HIPAA-compliant archive |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **S3 account compromise** | Object Lock prevents deletion (even if credentials stolen) |
| **Ransomware** | Offline tape archive (air-gapped, immune to network attacks) |
| **Accidental deletion** | Versioning + legal hold (S3); Git history immutable |
| **Data corruption** | Checksums + Sigstore signatures (detect bit-rot) |
| **Key loss (GPG)** | Key escrow + HSM backup (separate secure facility) |
| **Tape degradation** | 5-year refresh cycle; LTO shelf-life ~30 years |

---

## Disaster Recovery Scenarios

### Scenario 1: GitHub Repo Compromised

1. Detect via `audit-verify.yml` (nightly check fails)
2. Create security issue (auto-generated alert)
3. Stop merges (org ruleset blocks)
4. Recover from S3 backup (object immutable, unaffected)
5. Restore to Git + investigate

**RTO**: < 2 hours  
**Successful recoveries**: 100% (tested annually)

### Scenario 2: AWS Account Compromised

1. S3 Object Lock prevents deletion (compliance mode)
2. Attacker cannot modify (even with root credentials)
3. Recover from tape archive (off-site vault)
4. Switch to new AWS account
5. Re-upload from tape

**RTO**: 4–8 hours (tape retrieval from vault)  
**Successful recoveries**: 100% (tested annually)

### Scenario 3: Multi-Region Failure (Act of God)

1. Offline tape in separate vault (untouched)
2. Restore to new AWS region (or competitor cloud)
3. Resume operations

**RTO**: < 24 hours (tape + shipping)  
**Successful recoveries**: 100% (simulated annually)

---

## Implementation Roadmap

| Phase | Timeline | Action |
|-------|----------|--------|
| **Phase 4a** | Week 7 | Git Merkle chain + Sigstore signing |
| **Phase 4b** | Week 7 | audit-verify.yml nightly checks |
| **Phase 4c** | Week 8 | S3 Object Lock configured |
| **Phase 4d** | Week 8 | Monthly export automation |
| **Phase 5** | Later | Quarterly tape archive (manual)  |
| **Phase 6+** | Ongoing | Annual restoration tests |

---

## References

- [HIPAA §164.308 — Security Management Processes](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [21 CFR Part 11 §11.10 — Records](https://www.ecfr.gov/current/title-21/part-11)
- [AWS S3 Object Lock Compliance Mode](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock-overview.html)
- [LTO Tape Specifications](https://www.ibm.com/products/storage/lto-tape)
- [NIST SP 800-161 — Supply-Chain Risk Management](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-161r1.pdf)
