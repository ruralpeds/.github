# Gap Analysis for ruralpeds/.github (Org Governance)

**Repository**: `ruralpeds/.github`
**Last Updated**: 2026-04-28
**Maintainer(s)**: Timothy Hartzog (Compliance Officer)
**Compliance score (Q1 2026 baseline)**: 82.5 / 100
**Q2 2026 target**: ≥ 87.0 / 100 by 2026-06-30

---

## Overview

This is the org-level governance repository: 74 reusable workflows, 7 ruleset
JSON files, 6 custom-property definitions, the Merkle-chained audit ledger,
infrastructure templates (K8s/Terraform/Prometheus/Grafana), the DHF scaffold,
and the compliance-metrics archive. Gaps tracked here are **org-governance
gaps** that move the compliance scorecard, harden supply-chain or audit
posture, or unblock the FDA 510(k) submission targeted for Q1 2027.

This document was rebuilt on 2026-04-28 (Q2 2026, week 1). Prior gap-analysis
content is indexed in `archive/README.md`.

---

## Active Gaps

### GAP-001: SLSA v1 provenance backfill for Phase 1–2 releases

**Status**: In Progress
**Priority**: P0 (Blocker)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-05-15
**Category**: Audit & evidence

**Description**:
Phase 1 and Phase 2 releases (5 total) lack SLSA v1 provenance attestation,
holding the supply-chain factor of the compliance scorecard at 65%. Backfill
attestation via `reusable-slsa-provenance.yml` retroactive run, publish to the
GitHub attestations API, and verify each release with `gh attestation verify`.

**Acceptance Criteria**:
- [ ] All 5 Phase 1–2 releases have SLSA v1 provenance in the attestations API
- [ ] `backfill-slsa-provenance.yml` workflow runs cleanly for each tag
- [ ] `gh attestation verify` passes for all 5 releases (output committed to
      `compliance-metrics/slsa-attestation-execution-log.md`)
- [ ] Supply-chain scorecard factor reaches ≥ 90%

**Implementation Notes**:
Workflow is in place (`backfill-slsa-provenance.yml`); execution is the
remaining work. Coordinate with Sigstore Fulcio/Rekor for keyless signing.

**Related PRs**: #39 (SLSA workflow), #48 (consolidation)
**Blocking Issues**: None
**Blocked By**: None

**Last Status Update**: 2026-04-28
- Backfill workflow merged in PR #39. Execution against Phase 1–2 tags pending
  scheduling.

---

### GAP-002: OpenSSF Scorecard remediation across org repos

**Status**: Backlog
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-06-15
**Category**: Compliance scorecard

**Description**:
Two org repos score below the 7.0/10 OpenSSF Scorecard target. Remediation
items typically include pinned action SHAs, branch-protection enablement,
SAST in CI, and dependency review. SHA pinning workflow already merged here
(#37) — needs propagation.

**Acceptance Criteria**:
- [ ] Both below-threshold repos rescored ≥ 7.0/10
- [ ] All clinical-class repos have GitHub Actions SHA-pinned (per #37)
- [ ] `policies/rulesets/signed-commits-main.json` applied to all clinical
      repos via `sync-rulesets.yml`
- [ ] Remediation log appended to `compliance-metrics/openssf-remediation-q2-2026.md`

**Related PRs**: #37 (SHA pinning), #48 (consolidation)
**Blocking Issues**: None
**Blocked By**: None

**Last Status Update**: 2026-04-28
- Pin-actions workflow shipped in #37. Remediation execution scheduled for
  Q2 weeks 2–3.

---

### GAP-003: IEC 62304 device classification — full org coverage

**Status**: In Progress
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog (Clinical Lead approval required)
**Target Completion**: 2026-05-30
**Category**: Ruleset / property

**Description**:
Custom property `iec62304-class` (values `not-applicable | class-a | class-b
| class-c`) must be set on every org repo. Current coverage is 62.5%; target
is 100%. The `custom-properties-audit.yml` workflow flags missing
classifications weekly; the `reusable-iec62304-traceability.yml` workflow
gates clinical repos on the result.

**Acceptance Criteria**:
- [ ] `iec62304-class` set on 100% of active org repos (target 18/18)
- [ ] Classification rationale logged in `dhf/CLASSIFICATION_ASSESSMENT.md` for
      each Class-B/C repo
- [ ] `custom-properties-audit.yml` reports zero missing values for two
      consecutive weekly runs

**Related PRs**: #38 (custom properties system), #41 (IEC 62304 traceability)
**Blocking Issues**: None
**Blocked By**: None

**Last Status Update**: 2026-04-28
- Custom properties + traceability workflow merged. Classification workshop
  with Clinical Lead scheduled before May 17.

---

### GAP-004: Chaos testing expansion (MTBF improvement)

**Status**: Not Started
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-06-30
**Category**: Workflow infrastructure

**Description**:
Current MTBF is 28.4 days; Year-2 target is ≥ 34 days. Expand chaos scenarios
beyond database failover and queue backpressure (already runbooked in
`docs/chaos-runbooks/`) to include cache eviction, network partition, and
clock skew. Each scenario must run via `reusable-chaos-test.yml` against a
staging cluster and produce a closure report.

**Acceptance Criteria**:
- [ ] 3 new chaos scenarios runbooked under `docs/chaos-runbooks/`
- [ ] Each scenario has a `reusable-chaos-test.yml` invocation in a downstream
      repo's release pipeline
- [ ] `chaos-results-q2-2026.md` updated with results
- [ ] Measured MTBF ≥ 34 days at Q2 close

**Related PRs**: #44 (chaos + post-market expansion)
**Blocking Issues**: None
**Blocked By**: GAP-001 (clean releases needed for chaos baseline)

**Last Status Update**: 2026-04-28
- Two scenarios in place from PR #44. Three more to author.

---

### GAP-005: Post-market surveillance framework operationalization

**Status**: In Progress
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-06-30
**Category**: Submission packaging

**Description**:
Post-market surveillance design exists (`docs/compliance/post-market-surveillance.md`,
`dhf/post-market/complaints.jsonl`, `post-market-tracker.yml`); operational
coverage is at 0% and must reach ≥ 70% by Q2 close. Required artefacts:
adverse-event intake, complaint triage, MDR-reportability decision tree,
quarterly post-market report.

**Acceptance Criteria**:
- [ ] `post-market-tracker.yml` running on schedule (weekly)
- [ ] `dhf/post-market/complaints.jsonl` schema validated by CI
- [ ] MDR-reportability decision tree merged under `docs/compliance/`
- [ ] First quarterly post-market report drafted in `compliance-metrics/`
- [ ] Operational coverage ≥ 70% per scorecard methodology

**Related PRs**: #44 (post-market pilot)
**Blocking Issues**: None
**Blocked By**: None

**Last Status Update**: 2026-04-28
- Pilot scaffold landed in #44. Operationalization is the remaining work.

---

### GAP-006: Maintenance-window optimization (availability ≥ 99.9%)

**Status**: Not Started
**Priority**: P2 (High)
**Owner**: [Unassigned]
**Target Completion**: 2026-06-30
**Category**: Workflow infrastructure

**Description**:
Current measured availability is 98.8%; Year-2 target is 99.9% (≤ 8.76 h/yr
unplanned downtime). Drivers identified: monthly maintenance window length,
synchronous DB migration steps, single-AZ failover gaps. Reduce window from
~2 h to ≤ 30 min via online schema migration tooling and zero-downtime
deploys (HPA + PDB already configured per `infrastructure/kubernetes/`).

**Acceptance Criteria**:
- [ ] Online schema migration documented in `docs/operations/`
- [ ] Maintenance window SOP rewritten under
      `operations-runbooks/`
- [ ] Multi-AZ verified via DR drill (logged in chaos results)
- [ ] Measured availability ≥ 99.9% over a rolling 30-day window

**Related PRs**: None
**Blocking Issues**: None
**Blocked By**: GAP-004 (chaos coverage informs DR readiness)

**Last Status Update**: 2026-04-28
- Initiative scoped; owner assignment pending.

---

### GAP-007: Compliance scorecard 82.5 → 87.0 by Q2 close

**Status**: In Progress
**Priority**: P0 (Blocker)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-06-30
**Category**: Compliance scorecard

**Description**:
Composite scorecard (6 factors: supply chain, code quality, device
classification, resilience, post-market, availability) sits at 82.5/100. Q2
target is 87.0+. This is an aggregating gap — closing GAP-001 through
GAP-006 is what moves the score; this gap exists as the rollup tracker.

**Acceptance Criteria**:
- [ ] Q2 weekly progress reports filed in
      `compliance-metrics/Q2-2026-week*-progress.md`
- [ ] Scorecard ≥ 87.0 at 2026-06-30 closure
- [ ] Closure report `Q2-2026-closure-jun30.md` filed and signed via
      `review-stamp-v2.yml`

**Related PRs**: rolls up #36, #37, #38, #39, #40, #41, #44, #48
**Blocking Issues**: None
**Blocked By**: GAP-001, GAP-002, GAP-003, GAP-004, GAP-005, GAP-006

**Last Status Update**: 2026-04-28
- Q1 baseline 82.5 confirmed. Q2 kickoff completed; six initiatives mapped to
  the six gaps above.

---

### GAP-008: qa-develop branch-protection ruleset rollout

**Status**: In Review
**Priority**: P2 (High)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-05-12
**Category**: Ruleset / property

**Description**:
PR #48 introduces `policies/rulesets/qa-develop-protection.json` and
parameterizes `${{ github.repository_owner }}` in `sync-rulesets.yml`. After
merge, the next scheduled sync (Mondays 05:00 UTC) needs to apply the new
ruleset to clinical repos that maintain a `qa-develop` integration branch.
Verify via API spot-check on three sampled repos.

**Acceptance Criteria**:
- [ ] PR #48 merged to `main`
- [ ] First scheduled `sync-rulesets.yml` run after merge completes green
- [ ] `qa-develop` ruleset applied on at least 3 sampled clinical repos
      (verified via `gh api /repos/<repo>/rulesets`)
- [ ] Audit ledger entry recorded for the rollout

**Related PRs**: #48
**Blocking Issues**: None
**Blocked By**: None

**Last Status Update**: 2026-04-28
- PR #48 open and awaiting review.

---

### GAP-009: Branch hygiene — delete merged source branches

**Status**: Blocked
**Priority**: P3 (Medium)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-05-30
**Category**: Branch / repo hygiene

**Description**:
20 source branches were consolidated into PR #48 but cannot be deleted from
the remote: the git proxy returns HTTP 403 on `git push --delete` and the
GitHub MCP server exposes no branch-deletion tool. Once #48 merges, delete
the branches from the GitHub UI or via a token-authenticated `gh api -X
DELETE /repos/ruralpeds/.github/git/refs/heads/<branch>` from a session that
has the necessary permission.

**Acceptance Criteria**:
- [ ] PR #48 merged
- [ ] All 20 listed branches deleted from origin (list in `archive/README.md`
      addendum)
- [ ] `stale-repo-sweeper.yml` reports zero merged-but-undeleted branches

**Related PRs**: #48
**Blocking Issues**: Git proxy 403 on delete; MCP lacks delete tool
**Blocked By**: GAP-008 (PR #48 must merge first)

**Last Status Update**: 2026-04-28
- Attempted bulk delete from session — blocked by 403. Manual cleanup needed.

---

### GAP-010: Audit-verify workflow — false-positive resolution rollout

**Status**: Completed
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-04-25 (met)
**Category**: Audit & evidence

**Description**:
Nightly Merkle-chain integrity check produced false positives on legitimate
ledger appends (#36). The fix replaces the over-strict reconstruction logic
with format validation plus an explicit pointer to the full Merkle/Sigstore
verifier in `scripts/chain/verify.py`.

Moved to **Completed Gaps** below.

---

## Completed Gaps (Last 90 Days)

### ✅ GAP-010: Audit-verify workflow false-positive resolution
**Status**: Completed
**Completed Date**: 2026-04-25
**PR**: #36
**Completion Notes**: Workflow `audit-verify.yml` rewritten to validate
governance-ledger format and delegate full Merkle/Sigstore verification to
`scripts/chain/verify.py`. False-positive rate dropped to 0 over 7 nightly
runs.

### ✅ GAP-011: Org custom repository properties system
**Status**: Completed
**Completed Date**: 2026-04-26
**PR**: #38
**Completion Notes**: Six properties (`data-classification`, `criticality`,
`iec62304-class`, `regulated`, `primary-stack`, `baa-required`) defined in
`policies/custom-properties/schema.yaml`; setter in
`scripts/set-properties.py`; weekly audit in `custom-properties-audit.yml`;
documentation in `docs/governance/custom-properties.md`.

### ✅ GAP-012: Pin all GitHub Actions to 40-char SHAs
**Status**: Completed
**Completed Date**: 2026-04-26
**PR**: #37
**Completion Notes**: 43 workflow files updated with SHA pins; Dependabot
configured to bump pinned SHAs (`.github/dependabot.yml`). Reduces supply-
chain attack surface and unblocks OpenSSF remediation (GAP-002).

### ✅ GAP-013: SLSA v1 provenance + SBOM attestation pipeline
**Status**: Completed
**Completed Date**: 2026-04-26
**PR**: #39
**Completion Notes**: Release pipeline now produces SLSA v1 provenance and
CycloneDX SBOM attestations on every tagged release. Documentation under
`docs/security/attestations.md`. Backfill execution tracked under GAP-001.

### ✅ GAP-014: Merkle-chain audit ledger with Sigstore signing
**Status**: Completed
**Completed Date**: 2026-04-26
**PR**: #40
**Completion Notes**: `scripts/chain/append.py` and `scripts/chain/verify.py`
implement append-only Merkle chain with Sigstore keyless signing per entry.
Test suite under `tests/chain/`. Powers GAP-010 verification.

### ✅ GAP-015: IEC 62304 traceability workflow + DHF scaffold
**Status**: Completed
**Completed Date**: 2026-04-27
**PR**: #41
**Completion Notes**: `reusable-iec62304-traceability.yml` builds the
requirement→design→test→risk traceability matrix on every clinical-repo
release; DHF directory scaffolded with templates. Test fixtures under
`tests/traceability/`. Drives GAP-003.

### ✅ GAP-016: Q2 chaos + post-market scaffolding
**Status**: Completed
**Completed Date**: 2026-04-27
**PR**: #44
**Completion Notes**: Two chaos runbooks (database failover, queue
backpressure), `reusable-chaos-test.yml`, `post-market-tracker.yml`, and
`post-market-event` issue template landed. Operationalization tracked under
GAP-004 and GAP-005.

---

## Roadmap by Quarter

| Gap ID | Feature | Q2 2026 | Q3 2026 | Q4 2026 |
|--------|---------|---------|---------|---------|
| GAP-001 | SLSA backfill | ✓ In Progress | | |
| GAP-002 | OpenSSF remediation | ✓ Backlog | | |
| GAP-003 | IEC 62304 classification 100% | ✓ In Progress | | |
| GAP-004 | Chaos expansion | ✓ Not Started | | |
| GAP-005 | Post-market operationalization | ✓ In Progress | | |
| GAP-006 | Availability 99.9% | ✓ Not Started | | |
| GAP-007 | Scorecard 82.5 → 87.0 | ✓ Rollup | | |
| GAP-008 | qa-develop ruleset rollout | ✓ In Review | | |
| GAP-009 | Branch hygiene | ✓ Blocked | | |

Q3 2026 will introduce the FDA pre-submission readiness gaps (ISO 14971 FMEA
formalization, FHIR US Core mapping, advanced observability, third-party
dependency audit). Q4 2026 covers QMS Veeva Vault rollout and submission
package finalization. Both quarters open new gap IDs at that time.

---

## Dependencies & Blocking Relationships

| Gap | Depends On | Status |
|-----|-----------|--------|
| GAP-004 (chaos) | GAP-001 (provenance baseline) | In Progress |
| GAP-006 (availability) | GAP-004 (chaos coverage) | Not Started |
| GAP-007 (scorecard rollup) | GAP-001..GAP-006 | All in flight |
| GAP-008 (qa-develop ruleset) | PR #48 merge | In Review |
| GAP-009 (branch hygiene) | GAP-008 + token with delete permission | Blocked |

---

## Archive (Decided Not To Do)

None to date. Earlier compliance documents in `compliance-metrics/` recorded
deprioritized items inline; from this point forward, archive entries land in
this section.

---

## Schema & Governance

For rules specific to **this repo**, see `schema.md`.
For organization-wide standards, see `docs/GAP_ANALYSIS_STANDARDS.md`.
For historical gap-analysis-equivalent content, see `archive/README.md`.

---

## Change Log

| Date | Change | Who |
|------|--------|-----|
| 2026-04-28 | Document rebuilt; 9 active + 7 completed gaps seeded from current state | Claude (org rebuild) |
