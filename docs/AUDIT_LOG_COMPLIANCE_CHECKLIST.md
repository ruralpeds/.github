# Enterprise Audit Logging Compliance Checklist

Use this checklist to verify that your enterprise projects meet all audit logging requirements.

## Pre-Implementation Checklist

### Initial Assessment

- [ ] **Audit Logging Need Identified**: Determined that project requires audit logging (most enterprise projects do)
- [ ] **Stakeholders Aligned**: Security, compliance, and development teams agree on requirements
- [ ] **Retention Policy Defined**: Determined how long audit records must be retained
- [ ] **Access Controls Planned**: Identified who should access audit logs
- [ ] **Incident Response Updated**: Documented how audit logs are used in incident investigation

### Planning & Documentation

- [ ] **Architecture Reviewed**: Understand audit log schema v2.0
- [ ] **Data Classification Complete**: Identified what audit events to log
- [ ] **References Gathered**: Have access to HIPAA, NIST, HL7 FHIR docs if healthcare-related
- [ ] **Stakeholder Training**: Team understands audit logging requirements and usage

## Implementation Checklist

### Workflow Setup

- [ ] **audit.yml Workflow Created**: `.github/workflows/audit.yml` added to project
  - [ ] Runs on push to main/develop
  - [ ] Runs on pull_request
  - [ ] Supports manual trigger with reviewer input
  - [ ] Has correct permissions (contents: write)
  
- [ ] **review.yml Workflow Created**: `.github/workflows/review.yml` added to project
  - [ ] Triggers via workflow_dispatch
  - [ ] Accepts reviewer name input
  - [ ] Accepts optional review notes
  - [ ] Has correct permissions (contents: write)

### Directory & File Structure

- [ ] **audit-log/ Directory**: Created and committed to version control
  - [ ] `audit-log/ledger.json` exists
  - [ ] Contains valid JSON
  - [ ] Schema version 2.0 declared
  
- [ ] **Documentation Files**: Created
  - [ ] `docs/AUDIT_EVENTS.md` documented
  - [ ] All application audit events listed
  - [ ] Format follows standard
  
- [ ] **CODEOWNERS Updated**: `.github/CODEOWNERS`
  - [ ] `audit-log/` protected
  - [ ] Review required for audit changes

### Git Configuration

- [ ] **Commit History**: Initial audit workflow commits present
- [ ] **Branch Protection**: Audit workflows can write to protected branches
  - [ ] Automation account added to branch exceptions if needed
  - [ ] Bypass approval for audit workflow verified
  
- [ ] **Workflows Verified**:
  - [ ] At least one audit entry created
  - [ ] Workflow runs showing in Actions tab
  - [ ] No permission errors in logs

## First Run Verification

### Initial Build Audit Entry

After first successful run, verify:

- [ ] **Build Entry Created**: `audit-log/YYYYMMDDHHMMSS_SHA.json` exists
- [ ] **Ledger Updated**: `audit-log/ledger.json` contains new build
- [ ] **Metadata Captured**:
  - [ ] Build timestamp is ISO 8601 format
  - [ ] Commit SHA matches HEAD
  - [ ] Branch name is correct
  - [ ] Actor field shows correct user/bot
  - [ ] Workflow event type recorded

- [ ] **Commit References Valid**:
  - [ ] commit_url links to actual GitHub commit
  - [ ] run_url links to Actions run
  - [ ] tree_url links to correct tree state
  - [ ] compare_url shows diff

- [ ] **Dependencies Captured** (if applicable):
  - [ ] `dependencies.node-npm` populated (if package-lock.json exists)
  - [ ] `dependencies.python-requirements` populated (if requirements.txt exists)
  - [ ] `dependencies.rust-Cargo` populated (if Cargo.lock exists)
  - [ ] Other language lock files captured

### Summary Fields Populated

- [ ] **Summary Generated**: `ledger.json.summary` contains:
  - [ ] `total_builds`: Correct count (should be 1 initially)
  - [ ] `first_build`: Matches first entry timestamp
  - [ ] `last_build`: Matches latest entry timestamp
  - [ ] `date_created`: Repository creation date
  - [ ] `date_last_modified`: Latest commit date
  - [ ] `date_last_reviewed`: null (initially)
  - [ ] `contributors`: Array includes current committer

## Ongoing Compliance Checklist

### Weekly Checks

- [ ] **Audit Workflow Running**: No failed audit-log.yml runs
  - [ ] Check Actions tab for failures
  - [ ] Review error logs if failures occur
  - [ ] Fix issues (e.g., permission problems)

- [ ] **Build Entries Created**: New entries for recent commits
  - [ ] Number of builds matches commits (approximately)
  - [ ] Timestamps are reasonable
  - [ ] No duplicate entries

### Monthly Audit Review

- [ ] **Data Completeness**: All expected entries present
  - [ ] No missing date ranges
  - [ ] All critical builds logged
  - [ ] Metadata fields populated

- [ ] **Quality Check**:
  - [ ] No corrupted JSON entries
  - [ ] No malformed timestamps
  - [ ] Commit references still valid

- [ ] **Access Validation**:
  - [ ] Only authorized users can modify audit-log/
  - [ ] Modification history is clean
  - [ ] No suspicious edits

- [ ] **Reviews Recorded**: If reviews conducted
  - [ ] Review entries in review_history array
  - [ ] Reviewer names and dates present
  - [ ] Review notes captured

### Quarterly Compliance Audit

- [ ] **Documentation Current**: 
  - [ ] docs/AUDIT_EVENTS.md updated with any new events
  - [ ] CODEOWNERS includes audit files
  - [ ] README references audit logging

- [ ] **Retention Policy Enforced**:
  - [ ] Total builds <= configured retention
  - [ ] Old entries purged appropriately
  - [ ] Archive copies maintained if required

- [ ] **Regulatory Alignment**:
  - [ ] Standards references reviewed
  - [ ] Any regulatory changes addressed
  - [ ] Compliance gaps identified and planned

- [ ] **Team Knowledge**:
  - [ ] Team knows how to access audit logs
  - [ ] Team can query logs with jq
  - [ ] Incident response procedures updated

### Annual Certification

- [ ] **Full Audit Conducted**:
  - [ ] Audit ledger exported
  - [ ] Data completeness verified
  - [ ] No tampering detected
  - [ ] Integrity validated

- [ ] **Compliance Documentation**:
  - [ ] Certification form completed
  - [ ] Signed by appropriate authority
  - [ ] Archived per retention policy

- [ ] **Trending Analysis**:
  - [ ] Build frequency analysis
  - [ ] Contributor analysis
  - [ ] Review coverage assessment

- [ ] **Future Planning**:
  - [ ] Retention policy adequacy reviewed
  - [ ] Capacity planning if needed
  - [ ] Process improvements identified

## Audit Queries - Verification Steps

### Validate Audit Completeness

Run these queries to verify everything is working:

#### 1. Check Total Build Count

```bash
# Should match approximately your commit count
cat audit-log/ledger.json | jq '.summary.total_builds'
```

**Expected**: Number > 0 and growing with each build

#### 2. Verify Date Fields

```bash
# All date fields should be present and in ISO 8601 format
cat audit-log/ledger.json | jq '.summary | {date_created, date_last_modified, date_last_reviewed}'
```

**Expected**: Dates in YYYY-MM-DDTHH:MM:SSZ format or null if not reviewed yet

#### 3. Check Contributor Tracking

```bash
# Should list all developers who committed
cat audit-log/ledger.json | jq '.summary.contributors'
```

**Expected**: Array of GitHub usernames

#### 4. Validate Commit References

```bash
# Spot check that references are valid
cat audit-log/ledger.json | jq '.builds[0].references'
```

**Expected**: All URLs should be valid GitHub URLs

#### 5. Verify Dependency Snapshots

```bash
# Check that dependencies are being captured
cat audit-log/ledger.json | jq '.builds[0] | has("dependencies")'
```

**Expected**: true

#### 6. Confirm Review History Structure

```bash
# Should be empty initially, populated after reviews
cat audit-log/ledger.json | jq '.review_history // "no reviews yet"'
```

**Expected**: Empty array or array of review objects

## Issue Resolution Checklist

### Audit Workflow Not Running

- [ ] Check GitHub Actions permission settings
- [ ] Verify workflow syntax is correct
- [ ] Check branch protection doesn't block automation
- [ ] Verify runner has access to GitHub API
- [ ] Check for secrets or environment variable issues

### Missing Build Entries

- [ ] Verify workflow runs completed successfully
- [ ] Check for push failures in workflow logs
- [ ] Ensure commits actually pushed to tracked branch
- [ ] Check retention policy didn't purge entries
- [ ] Validate git configuration is correct

### Corrupted Ledger

- [ ] Backup current ledger.json
- [ ] Check recent commits for corruption
- [ ] Rebuild from individual entry files if needed
- [ ] Validate JSON structure with jq
- [ ] Contact platform engineering if unable to recover

### Review Not Recorded

- [ ] Verify review.yml workflow exists
- [ ] Check that reviewer parameter was provided
- [ ] Verify workflow completed successfully
- [ ] Check ledger for review_history array
- [ ] Validate date_last_reviewed was updated

### Permission Denied Errors

- [ ] Verify `permissions: contents: write` in workflow
- [ ] Check branch protection settings
- [ ] Ensure automation account is authorized
- [ ] Verify CODEOWNERS doesn't block automation
- [ ] Test with `git push` manually if needed

## Documentation Checklist

### Required Documentation

- [ ] **ENTERPRISE_AUDIT_LOGGING.md**: Complete guide present
- [ ] **AUDIT_LOG_SETUP_TEMPLATE.md**: Setup instructions available
- [ ] **AUDIT_LOG_REFERENCES.md**: Standards references documented
- [ ] **docs/AUDIT_EVENTS.md**: Catalog of project audit events
- [ ] **README.md**: References audit logging features

### Additional Documentation

- [ ] **Runbook**: How to access and analyze audit logs
- [ ] **Incident Response**: How audit logs are used in investigations
- [ ] **Data Classification**: What audit data is captured
- [ ] **Access Control**: Who can access audit logs
- [ ] **Retention Schedule**: How long logs are retained

## Training & Awareness Checklist

- [ ] **Team Training Completed**: All developers understand audit logging
- [ ] **On-Call Training**: On-call engineers know how to access audit logs
- [ ] **Incident Response**: Incident response team trained on audit log analysis
- [ ] **Compliance Team**: Compliance staff understand audit log structure
- [ ] **New Hire Onboarding**: Audit logging included in onboarding docs

## Sign-Off & Certification

### Compliance Sign-Off

By completing this checklist, certify:

- **Date Completed**: ____________________
- **Completed By**: ____________________
- **Title/Role**: ____________________
- **Organization**: ____________________

### Review & Approval

- [ ] **Development Lead**: Reviewed and approved
- [ ] **Security Team**: Reviewed and approved
- [ ] **Compliance Officer**: Reviewed and approved
- [ ] **CTO/Engineering Manager**: Reviewed and approved

### Certification Statement

The audit logging system for this project has been implemented, tested, and verified to:

- [ ] Meet all enterprise requirements
- [ ] Capture build dates, modification dates, and review dates
- [ ] Maintain complete reference materials (dependencies, commits, GitHub links)
- [ ] Comply with applicable standards and regulations
- [ ] Support incident investigation and forensic analysis

**Certification Date**: ____________________

**Next Review Date**: ____________________

---

## Related Documents

- [ENTERPRISE_AUDIT_LOGGING.md](./ENTERPRISE_AUDIT_LOGGING.md) - Main guide
- [AUDIT_LOG_SETUP_TEMPLATE.md](./AUDIT_LOG_SETUP_TEMPLATE.md) - Setup instructions
- [AUDIT_LOG_REFERENCES.md](./AUDIT_LOG_REFERENCES.md) - Standards reference
- [../../.github/workflows/audit-log.yml](../../.github/workflows/audit-log.yml) - Workflow source
- [../../.github/workflows/review-stamp.yml](../../.github/workflows/review-stamp.yml) - Review workflow source

## Support

For questions or issues with this checklist:

1. Review the main [ENTERPRISE_AUDIT_LOGGING.md](./ENTERPRISE_AUDIT_LOGGING.md) guide
2. Check the [AUDIT_LOG_REFERENCES.md](./AUDIT_LOG_REFERENCES.md) for standards
3. Contact: `@timothyhartzog/platform-engineering`

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-16  
**Maintained By**: Platform Engineering
