# Task 3: Release Package & Quarterly Review

**Status**: Phase 6, Week 12 End  
**Objective**: Create first release (v1.0) with DHF package; establish quarterly review process  
**Preflight Confirmation**: false  
**Dependencies**: Task 2 (traceability matrix complete, coverage ≥95%)

---

## What You'll Do

1. **Create Release Package**
   - [ ] Create `dhf/releases/v1.0/` directory
   - [ ] Generate `release-note.md`:
     - [ ] Change summary (ventilator simulation, dose calc, validation)
     - [ ] Known issues (if any)
     - [ ] Migration guide (first release: N/A)
     - [ ] Testing performed (unit, integration, validation)
   - [ ] Generate `build-info.json`:
     - [ ] Build timestamp
     - [ ] Commit SHA
     - [ ] Build duration
     - [ ] Build environment (GitHub Actions runner)
     - [ ] Signer identity (timothyhartzog)
   - [ ] Copy/symlink artifacts:
     - [ ] `sbom.json` (from Phase 2 workflow)
     - [ ] `vex.json` (from Phase 3 workflow)
     - [ ] `provenance.intoto.jsonl` (from Phase 2 SLSA workflow)
   - [ ] Generate `traceability-matrix.html` (from Phase 6 workflow)
   - [ ] Package test evidence:
     - [ ] `test-evidence.zip` containing:
       - [ ] Unit test results (JUnit XML)
       - [ ] Coverage report (lcov, cobertura)
       - [ ] Integration test logs
       - [ ] Validation test screenshots (Playwright)

2. **Create Release Checklist**
   - [ ] Create `dhf/releases/v1.0/RELEASE_CHECKLIST.md`
   - [ ] Sections: Code Review, Testing, Documentation, Traceability, Compliance
   - [ ] All items checked ✅
   - [ ] E-signature obtained via `audit-sign-envelope.yml` (Phase 5)
   - [ ] Audit log entry created with Part 11 signature

3. **Create Release Branch & Tag**
   - [ ] Branch: `release/v1.0` (or direct to main if no staging needed)
   - [ ] Tag: `v1.0` (signed commit + tag)
   - [ ] Push to origin
   - [ ] Create GitHub Release with release notes

4. **Establish Quarterly Review Process**
   - [ ] Create `dhf/review-schedule.md` with quarterly dates:
     - [ ] Q2 2026 (July 24, 2026)
     - [ ] Q3 2026 (Oct 24, 2026)
     - [ ] Q4 2026 (Jan 24, 2027)
     - [ ] Q1 2027 (Apr 24, 2027)
   - [ ] Create review checklist:
     - [ ] Requirements: any new ones? Any obsolete?
     - [ ] Hazards: any new hazards discovered?
     - [ ] Risk controls: still implemented? Any failures?
     - [ ] Residual risk: still acceptable?
     - [ ] Tests: comprehensive? Any gaps?
     - [ ] Code changes: all linked to requirements?
     - [ ] Incidents: any customer complaints (check complaints.jsonl)
     - [ ] Next review date: 90 days out

5. **Conduct Q2 Review**
   - [ ] Review all requirements, hazards, controls, tests
   - [ ] Document findings in `dhf/review-schedule.md`
   - [ ] Create signed audit log entry (DHF-2026-Q2 event)
   - [ ] Approve: "All items reviewed. Residual risk acceptable. No new issues."
   - [ ] Sign with `audit-sign-envelope.yml`

6. **Create Post-Market Complaint Template**
   - [ ] Create `dhf/post-market/complaints.jsonl` (initially empty)
   - [ ] Create GitHub issue template `post-market-event.yml` with:
     - [ ] Event date
     - [ ] Severity (per hazard analysis scale)
     - [ ] Suspected affected versions
     - [ ] Patient harm (yes/no/unknown)
     - [ ] Data sources
     - [ ] Initial assessment
     - [ ] Next review date

---

## Files to Create

| File | Content |
|------|---------|
| `dhf/releases/v1.0/release-note.md` | Change summary, known issues, testing done |
| `dhf/releases/v1.0/build-info.json` | Build metadata (timestamp, SHA, signer) |
| `dhf/releases/v1.0/traceability-matrix.html` | Generated from Phase 6 workflow |
| `dhf/releases/v1.0/RELEASE_CHECKLIST.md` | All ✅ items before release |
| `dhf/releases/v1.0/test-evidence.zip` | All test results + coverage + validation |
| `dhf/review-schedule.md` | Quarterly review dates + checklist |
| `dhf/post-market/complaints.jsonl` | Post-market surveillance log (append-only) |
| `.github/ISSUE_TEMPLATE/post-market-event.yml` | Issue template for complaints |

---

## Acceptance Criteria

- ✅ Release package complete (all artifacts in `dhf/releases/v1.0/`)
- ✅ Release notes clear and comprehensive
- ✅ All test evidence collected + packaged
- ✅ Release tag created (signed)
- ✅ GitHub Release published
- ✅ Quarterly review schedule established + Q2 review completed
- ✅ Q2 review signed with Part 11 signature
- ✅ Audit log entry created
- ✅ Post-market complaint template in place
- ✅ All DHF artifacts retained ≥ 7 years (via S3 + tape archive from Phase 4)

---

## Estimated Effort

- Release package: ~1.5 hours (collect + organize artifacts)
- Release checklist: ~30 min
- Git tag + release: ~30 min
- Quarterly review: ~1 hour
- Review documentation + signature: ~30 min
- Post-market template: ~30 min

**Total**: ~4 hours
