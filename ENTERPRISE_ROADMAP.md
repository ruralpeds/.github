# ruralpeds Enterprise Healthcare Platform — Comprehensive Upgrade Roadmap

**Companion to:** `HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md`
**Scope:** Organization-wide (`ruralpeds/*`) — security, testing, auditing, HIPAA, medical-software development, and high-performance/high-availability service architecture
**Posture:** Solo-owner clinical informatics org; many repos are clinical decision-support content, simulation (`PedNeoSim.jl`), scientific libraries (`rust-sci-core`, `BioStatistics.jl`), and textbook/education assets. Plan must scale from single-developer reality up to multi-team readiness.

---

## Part 0 — Current-State Snapshot

Your `ruralpeds/.github` repo already has an unusually strong foundation. Inventory of what's in place:

| Area | Asset | Status |
|------|-------|--------|
| Reusable CI | `ci-node.yml`, `ci-python.yml`, `ci-rust.yml`, `ci-go.yml`, `ci-julia.yml` | ✅ Shipped |
| E2E | `e2e-playwright.yml` | ✅ Shipped |
| Audit ledger | `audit-log.yml` + `review-stamp.yml` (JSON ledger with dep snapshots, retention) | ✅ Shipped |
| Compliance scan | `check-compliance.yml` + Python scanner, weekly + HTML report | ✅ Shipped |
| Visual audit | `playwright-audit.yml` (screenshots of Actions status weekly) | ✅ Shipped |
| Bootstrap | `repo-scanner.yml` (auto-PRs CI into new repos) | ✅ Shipped |
| PHI scanning | `reusable-phi-scan.yml` (gitleaks + 18 HIPAA Safe Harbor patterns, SARIF upload) | ✅ Shipped |
| SBOM | `reusable-sbom.yml` (CycloneDX 1.5 + SPDX 2.3, license denylist, FDA 524B-aligned) | ✅ Shipped |
| Governance-as-code | `sync-rulesets.yml` + `policies/rulesets/signed-commits-main.json` | ✅ Shipped |
| GitHub App migration path | `timothyhartzog-bot` plan documented | ⏳ Planned |
| Blueprint doc | `HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md` (824 lines, comprehensive) | ✅ Shipped |
| Hygiene workflow | `hygiene.yml` (68 repos reporting) | ✅ Shipped |
| Copilot guardrails | `copilot-instructions.md` | ✅ Shipped |

**This is an advanced baseline.** The gaps are not foundational — they are about *depth* (cryptographic attestation vs. plaintext ledger), *scope* (platform-level controls you don't yet exercise), and *healthcare specificity* (IEC 62304, FHIR validation, synthetic patient fixtures at scale).

### Identified gaps (addressed in this plan)

1. **Platform-level controls** — org-wide enforced MFA, SSO/SAML readiness, custom repository properties, org-level rulesets (beyond repo-level), required workflows.
2. **Supply-chain depth** — SBOM exists, but no signed provenance (SLSA L3), no cosign-signed containers, no in-toto attestations, no VEX documents.
3. **Secret management architecture** — relies on GitHub secrets + PAT. No OIDC federation to cloud KMS, no environment protection rules enumerated.
4. **Runner strategy** — all builds on GitHub-hosted runners. No ephemeral/hardened runners for any PHI-adjacent workloads (currently zero PHI in repos, but worth policy).
5. **IEC 62304 traceability** — no requirement-to-test matrix, no software safety class per repo, no design history file (DHF) pattern.
6. **Clinical validation** — Playwright and unit tests exist, but no FHIR validator, no HL7v2 conformance, no synthetic-patient fixture pipeline (Synthea), no clinical adversarial/edge-case test harness (dose calc boundaries, unit confusion, etc.).
7. **Audit immutability** — the JSON ledger is append-via-commit, which is good, but not cryptographically chained (Merkle) or WORM-backed.
8. **Electronic signatures (21 CFR Part 11 §11.50–11.70)** — commit signing covers non-repudiation, but no formal E-signature record with meaning/intent binding for clinical approvals.
9. **Risk management (ISO 14971)** — no FMEA or hazard-analysis artifacts in repo structure.
10. **HA/performance engineering** — no load testing in CI (k6/Locust), no chaos testing, no SLO/error-budget tracking, no resilience-patterns library (circuit breakers, bulkheads, idempotency keys).
11. **Observability standardization** — no org-wide OpenTelemetry baseline, no structured-logging schema, no trace-context propagation standard.
12. **Business continuity / DR** — no documented RPO/RTO targets, no backup-restore drill cadence.
13. **Post-market surveillance pattern** — no issue templates for suspected patient-safety events, no PSO (Patient Safety Organization) integration path.
14. **HIPAA BAA posture** — no document tracking which GitHub tier and which third-party services are BAA-covered vs. not.
15. **Developer experience / AI-agent** — `AGENTS.md`, devcontainer, Codespaces prebuilds not standardized org-wide.
16. **Metrics** — compliance checker reports presence/absence but there is no unified *scorecard* (OpenSSF Scorecard integration, DORA metrics, vulnerability MTTD/MTTR).

---

## Part 1 — Regulatory & Standards Baseline

Anchor every control that follows to a named standard. Each repo gets a custom property (see Part 2) declaring which of these apply.

| Framework | When it applies | Key implications for the repo |
|-----------|-----------------|-------------------------------|
| **HIPAA Security Rule** (45 CFR §164.308/310/312) | Any repo that could touch ePHI, even indirectly (CDS tooling, logs, analytics) | Access control, audit, integrity, transmission security, contingency planning |
| **HIPAA §164.312(b)** — audit controls | All of the above | Immutable audit logs; the current `audit-log.yml` covers the build-artifact side. App-level audit is a code requirement. |
| **NIST SP 800-66 Rev. 2** | HIPAA implementation guide | Maps directly to the controls above; use as the checklist |
| **NIST SP 800-218 (SSDF v1.1)** | All software | Already largely covered by CI + SBOM + signed commits; needs provenance attestation to fully close |
| **21 CFR Part 11** | Software producing GxP-regulated records (not all your repos, but PedNeoSim.jl and any device path will) | Signed records, E-signatures with intent, audit trails with before/after values, system validation, training records |
| **IEC 62304** | Software in a medical device or SaMD | Software safety class A/B/C, requirement traceability, unit verification, integration testing, software release process, problem resolution process, configuration management |
| **ISO 14971** | Medical devices | Risk management file, hazard analysis, risk control measures, residual risk evaluation |
| **ISO 13485** | Medical device QMS | Design controls, DHF, DMR, design reviews — organizational, not repo-only |
| **IEC 62366-1** | Medical device usability engineering | Use specification, use-related risk analysis, usability validation |
| **FDA Omnibus Act §524B (2023)** | "Cyber Devices" | SBOM required in pre-market submission, monitoring/identifying/addressing postmarket vulnerabilities, reasonable assurance of cybersecurity, coordinated disclosure |
| **FDA Predetermined Change Control Plan (PCCP)** | AI/ML-enabled devices | Define modifications ahead of clearance; governs post-release change |
| **HITRUST CSF** | Optional but recognized by payers | Certifiable control framework that harmonizes HIPAA/NIST/ISO |
| **SOC 2 Type II** | If any service is offered to external parties | Annual attestation; overlaps significantly with HITRUST |
| **HL7 FHIR R4 / R5** | Data exchange | US Core 6.1+ profiles; USCDI v4 alignment |
| **TEFCA / QHIN rules** | National-scale exchange (not near-term) | Know the path exists |
| **ONC HTI-1 final rule** | Certified health IT | Decision support intervention (DSI) transparency requirements; relevant for CDS repos |
| **WCAG 2.2 AA** | Any clinician- or patient-facing UI | Automated a11y gate in Playwright |
| **Section 508** | Federal-facing products | Aligns with WCAG AA |
| **OWASP ASVS 4.0.3** | Any web/API service | Map service repos to Level 2 minimum |
| **OWASP API Security Top 10 (2023)** | APIs | Targeted tests per category |
| **OpenSSF Scorecard** | All repos | Automate and gate on score improvements |
| **SLSA v1.0** | Build provenance | Target Level 3 for release artifacts |

**Action:** Create `docs/compliance/STANDARDS_MAP.md` in `.github` listing every standard above with a one-line applicability rule keyed to the custom property below.

---

## Part 2 — GitHub Platform Hardening (Org-level)

These are things you configure *once* at the organization level, not per repo. Several are free; some require GitHub Team or Enterprise Cloud.

### 2.1 Custom repository properties (free, GitHub Cloud)

Define these at `Organization Settings → Repository → Custom properties`. Every subsequent workflow can branch on them.

```yaml
# Proposed properties
data-classification:
  type: single-select
  values: [public, internal, synthetic, phi-capable, phi-active]
  default: internal
  required: true

criticality:
  type: single-select
  values: [experimental, reference, clinical-support, clinical-decision, device]
  default: experimental
  required: true

iec62304-class:
  type: single-select
  values: [not-applicable, class-a, class-b, class-c]
  default: not-applicable
  required: true

regulated:
  type: true-false
  default: false
  required: true

primary-stack:
  type: single-select
  values: [julia, rust, node, python, go, content, polyglot]
  required: true

baa-required:
  type: true-false
  default: false
```

With these in place, `sync-rulesets.yml` can apply stricter rulesets to `phi-active` or `class-b`/`class-c` repos automatically.

### 2.2 Org-level rulesets (migrate from per-repo)

GitHub now supports org-level rulesets with **property-based targeting** — this is the right mechanism for classification-driven governance.

Rulesets to create:

1. **`org-baseline`** — applies to all repos. Required signed commits, linear history, no force-push to default, 1 reviewer (self-review after 24 h allowed for solo-dev exception documented in `AGENTS.md`).
2. **`org-clinical`** — applies where `criticality ≥ clinical-support`. Adds: required status checks = {CI, PHI scan, SBOM, CodeQL, Scorecard}, required deployments (environment protection), block merge on open Dependabot alerts ≥ high.
3. **`org-device`** — applies where `iec62304-class in {class-b, class-c}` OR `regulated = true`. Adds: 2 reviewers (waivable only via documented DHF exception), required IEC 62304 traceability check, required VEX document on release, required hazard-analysis update check on any change touching `src/safety/**`.
4. **`org-phi-active`** — applies where `data-classification = phi-active`. Adds: enforced environment with manual approval for any deploy touching production, runner must be a self-hosted hardened runner (see 2.5), required BAA attestation file update on dependency addition.

### 2.3 Required workflows (GitHub Enterprise Cloud)

If/when you move to Enterprise Cloud, convert the current "bootstrap via PR" pattern to **required workflows** — workflows that run on every PR in scope without needing to be copied into each repo. This eliminates drift entirely.

Until then: the `repo-scanner.yml` + `check-compliance.yml` pattern is the correct stand-in. Worth adding a *drift detector* that flags repos whose copied CI file has diverged from the reusable-workflow caller template.

### 2.4 Enforced identity controls

- **2FA required for all members** — set at org level, no exceptions.
- **SAML SSO** — if/when you add collaborators, front the org with an IdP (Okta, Entra ID, Google Workspace). Required for BAA posture if expanding beyond solo.
- **SCIM** — automatic deprovisioning when someone leaves; required for any workforce-of-more-than-one HIPAA posture.
- **Personal Access Token policy** — restrict fine-grained PAT to specific repos; deprecate classic PATs entirely. Migration to the `timothyhartzog-bot` GitHub App (already planned) closes the last remaining long-lived PAT.
- **IP allowlist** — if all development is from known networks, enable it; for remote/travel access, use it in monitoring mode first.

### 2.5 Runner strategy

Current: 100% `ubuntu-latest` GitHub-hosted. Recommendation for tiered runner policy:

| Repo class | Runner | Rationale |
|------------|--------|-----------|
| `data-classification = public/internal/synthetic` | `ubuntu-latest` GitHub-hosted | Default |
| `data-classification = phi-capable` (code paths exist but no PHI in tests) | `ubuntu-latest` GitHub-hosted with **larger-runner** option if needed | Same |
| `data-classification = phi-active` | **ARC (Actions Runner Controller) on your K8s cluster**, ephemeral, private network, no egress except allowlist | Required if real PHI ever flows through a build — not current state, but architecture should be ready |
| Anything needing Julia parallel testing or Rust full-workspace | GitHub-hosted `ubuntu-latest-16-core` | Faster; still ephemeral |
| Apple-silicon inference (MLX) testing | **Self-hosted macOS ARM64** on your Mac Studio | Already part of your infra; set it up as a runner behind Tailscale if not already |

Add `runner-policy.md` under `.github/docs/` documenting this.

### 2.6 GitHub Advanced Security (GHAS) rollout

GHAS is free for public repos and paid for private. For clinical work the cost is justified.

- **CodeQL** — add `reusable-codeql.yml` that auto-detects languages and runs weekly + on-PR for changed files. Matrix for multi-language repos.
- **Secret scanning with push protection** — enable org-wide; this is the single largest ROI security control. Custom patterns for NPI numbers, MRN formats you use, local API tokens for your Mac Studio, Tailscale auth keys.
- **Dependabot** — version updates + security updates on all repos; group minor/patch PRs weekly to cut noise.
- **Dependency review action** — already mentioned in the blueprint; wire it into `org-clinical` ruleset as a required check.

### 2.7 Copilot governance

You're already using Copilot (and `copilot-instructions.md` exists). Tighten:

- **Enable "Exclude content from Copilot"** for any repo with `data-classification = phi-active`.
- **Policy: exclude `.env*`, `**/fixtures/real/**`, `**/phi/**` from Copilot indexing** across the org.
- **Add Copilot usage policy** to `AGENTS.md`: generated code must be reviewed by the author, cannot introduce dependencies without Dependabot/scan clearance, and must not disable audit or PHI scan middleware.

---

## Part 3 — Supply-Chain Security Depth (SLSA L3 Target)

You have SBOMs. The next four layers turn them into a defensible posture:

### 3.1 Build provenance — `reusable-slsa-provenance.yml`

Use GitHub's built-in **artifact attestations** (now GA) to generate SLSA v1 provenance:

```yaml
- uses: actions/attest-build-provenance@v1
  with:
    subject-path: 'dist/**'
```

Provenance binds the artifact hash to the exact workflow run, runner, commit, and build parameters. It's signed by GitHub's Sigstore-backed keyless flow. Verifiable offline with `gh attestation verify`.

### 3.2 Container image signing — `reusable-container-sign.yml`

`cosign sign` every container published to GHCR using keyless OIDC signing. Pair with `cosign verify` at pull time (admission webhook or `cosign verify-attestation` in deploy workflow).

### 3.3 SBOM attestation — extension of existing `reusable-sbom.yml`

Today the SBOM lives next to the release as a file. Add:

```yaml
- uses: actions/attest-sbom@v2
  with:
    subject-path: 'dist/release.tar.gz'
    sbom-path: 'sbom/cyclonedx.json'
```

Now the SBOM is cryptographically bound to the artifact. This is what FDA §524B reviewers increasingly expect for premarket submissions.

### 3.4 VEX (Vulnerability Exploitability eXchange)

Add `reusable-vex.yml`. For every CVE flagged by Dependabot/Trivy, produce a machine-readable VEX document (OpenVEX format) stating `not_affected`, `affected`, `fixed`, or `under_investigation` with justification. Commit under `vex/` and attach to releases. This is the other half of FDA §524B post-market cyber requirement — without it you can't tell reviewers which CVEs in your SBOM matter.

### 3.5 Dependency posture

- **Pin all GitHub Actions to SHAs**, not tags. The blueprint already hints at this (`uses: actions/checkout@<pinned-sha>`); the current reusable workflows mostly use `@main` or version tags. Run `pin-github-action` across every workflow and commit the diff.
- **Turn on Dependabot for Actions**, not just language deps, so SHAs get updated safely.
- **OpenSSF Scorecard workflow** — `reusable-scorecard.yml` runs weekly on every repo, uploads SARIF, and exposes a badge. Gate the `org-clinical` ruleset on `score ≥ 7.0`.
- **Trivy filesystem + image scan** on every release for CVE detection that complements GHAS Dependabot (catches OS-level deps, binary deps Dependabot misses).

### 3.6 License compliance

The SBOM workflow's license denylist is good. Add a **license policy file** (`policies/licenses.json`) rather than inline list so it's versioned and auditable. Expand the denylist for healthcare distribution contexts: add `RPSL`, `CPAL`, `Sleepycat`, `CDDL-1.0` (case-by-case).

---

## Part 4 — Medical Software Traceability (IEC 62304 + ISO 14971)

This is the largest genuine gap. Most of your repos won't need this (a textbook repo doesn't), but PedNeoSim.jl, the peds CDS repo, and any future device path do.

### 4.1 Per-repo Design History File (DHF) pattern

Proposed directory skeleton for clinical repos (added to the blueprint's §4 layout):

```
dhf/
├── requirements/
│   ├── user-needs.md          # UN-001, UN-002 ...
│   ├── system-requirements.yaml  # SYS-### → UN-###
│   └── software-requirements.yaml # SW-### → SYS-###
├── risk/
│   ├── hazard-analysis.yaml   # HZ-### with severity × probability
│   ├── risk-controls.yaml     # RC-### → HZ-###, → SW-###
│   └── residual-risk.md       # after controls, per ISO 14971 §7
├── architecture/
│   └── sw-architecture.md     # items + interfaces (IEC 62304 §5.3)
├── verification/
│   ├── unit-test-map.yaml     # test-case-id → SW-### requirement
│   ├── integration-map.yaml
│   └── system-test-map.yaml
├── validation/
│   └── clinical-validation.md
├── releases/
│   └── <version>/
│       ├── sbom.json          # symlink or copy from sbom/
│       ├── vex.json
│       ├── provenance.intoto.jsonl
│       ├── traceability-matrix.html  # auto-generated
│       ├── test-evidence.zip
│       └── release-note.md
└── post-market/
    ├── complaints.jsonl
    ├── cve-monitoring.md
    └── pccp.md                # Predetermined Change Control Plan (if AI/ML)
```

### 4.2 Traceability workflow — `reusable-iec62304-traceability.yml`

A new reusable workflow that, on every PR touching `dhf/` or `src/`:

1. Parses requirement YAML files.
2. Walks test files and extracts `@requirement("SW-###")` annotations (convention to define).
3. Walks risk files and extracts `@mitigates("RC-###")` annotations in code.
4. Builds a traceability matrix (requirement → code → test → risk control).
5. **Fails the PR** if:
   - Any SW-### requirement has zero test coverage.
   - Any SW-### has coverage < 100% line coverage on annotated functions.
   - Any RC-### has no corresponding code annotation.
   - Any hazard with residual severity ≥ "serious" has no RC-### mitigating it.
6. Publishes the matrix as an HTML artifact and an attestation-worthy JSON.

This is ~500 lines of Python plus a CI job. It transforms "we wrote tests" into "we can prove, for every requirement, what tests cover it and which risks it mitigates" — and that is the deliverable a notified body or FDA reviewer asks for.

### 4.3 Software safety classification workflow

A one-time classification wizard run per repo (as a GitHub Discussion template or a CLI command in `scripts/classify-repo.py`):

- Step 1: Can the software cause injury or damage to health? (No → Class A, done)
- Step 2: Can the injury be serious? (No → Class B; Yes → Class C)
- Output: writes the classification to the custom repo property `iec62304-class` and commits `dhf/classification.md` with rationale and date.

Higher class → stricter rulesets apply automatically (see Part 2.2).

### 4.4 Risk-management living document

`dhf/risk/hazard-analysis.yaml` schema:

```yaml
hazards:
  - id: HZ-001
    title: "Incorrect gestational-age calculation in growth chart"
    hazardous-situation: "Clinician sees wrong percentile curve"
    harm: "Missed growth failure; delayed diagnosis of FTT"
    severity: serious          # negligible | minor | serious | critical | catastrophic
    probability: remote        # frequent | probable | occasional | remote | improbable | incredible
    risk-level: medium         # computed by matrix
    detectability: low
    risk-priority: 12          # RPN if using FMEA
    controls:
      - RC-001  # input validation
      - RC-007  # unit-test coverage of GA boundary cases
      - RC-012  # warning banner "verify GA source"
    residual:
      severity: serious
      probability: improbable
      risk-level: low
      acceptable: true
      rationale: "Controls reduce probability two tiers; clinician verification is standard of care."
    references:
      - ISO 14971 §7.4
      - AAP neonatal growth chart guidance 2022
    date-reviewed: 2026-04-23
    reviewer: Timothy Hartzog MD
```

The traceability workflow above ingests this file too.

### 4.5 21 CFR Part 11 — electronic signatures

Commit signing gives you non-repudiation at the code level. What Part 11 actually requires is E-signatures *with meaning* — "I, Timothy Hartzog, approve this release for clinical use on 2026-04-23 because…". Propose a simple pattern:

- **`scripts/esign.py`** — an interactive CLI that:
  1. Prints the artifact hash, the commit hash, and the PR that produced it.
  2. Prompts for the signer's identity, intent (`approve-for-release`, `review-complete`, `hazard-analysis-reviewed`), and free-text meaning.
  3. Requires re-entry of a passphrase (second factor).
  4. Produces a signed JSON record (via GPG or `cosign sign-blob`) committed to `audit-log/esignatures/`.
  5. Appends a hash of the new record to a chained Merkle log (`audit-log/chain.ndjson`) so tampering with any earlier record breaks the chain.

This is 200 lines of code and it closes Part 11 §11.50 (signature manifestations) + §11.70 (signature/record linking) properly.

### 4.6 Post-market surveillance

- Add an issue template `post-market-event.yml` with fields: event date, severity (per your hazard analysis scale), suspected affected versions, patient harm (yes/no/unknown), data sources, initial assessment, next review date.
- Automation: on issue creation with label `post-market`, open a linked PR that appends a stub to `dhf/post-market/complaints.jsonl` and notifies via the compliance issue thread.
- Quarterly: generate a post-market summary report from the JSONL.

---

## Part 5 — Testing, Verification, Validation

You already have CI with unit tests across five languages and Playwright for E2E. The layers this adds:

### 5.1 Synthetic patient fixtures — `reusable-synthea-fixtures.yml`

Rather than handcrafting neonatal/pediatric synthetic charts, run [Synthea](https://github.com/synthetichealth/synthea) as part of the clinical-repo bootstrap with a pediatric module. Cache the generated FHIR bundles as an artifact and a released fixture set per test period. Every Playwright or FHIR integration test pulls from this set. Never a real patient, ever.

### 5.2 FHIR validation — `reusable-fhir-validation.yml`

For any repo that emits or consumes FHIR resources, run the [HL7 FHIR validator](https://github.com/hapifhir/org.hl7.fhir.core) against:

- All sample payloads under `tests/fixtures/fhir/`.
- US Core 6.1 profiles (or current USCDI version).
- Any custom profiles (StructureDefinitions) your repo declares.

Fail the build on `error` severity; warn on `warning`.

### 5.3 HL7v2 conformance

Where HL7v2 remains unavoidable (most EHR integrations), the [HAPI HL7v2](https://github.com/hapifhir/hapi-hl7v2) conformance profile check wired into the same workflow pattern.

### 5.4 Clinical adversarial/edge-case test harness

A thin framework — propose `crates/sci-clinical-proptests` or `src/clinicalproptests/` — that runs property-based tests against dose calculators, growth chart lookups, lab-value interpreters for:

- **Boundary values** — 0, negative (reject), unit overflow, `Inf`, `NaN`.
- **Unit confusion** — mL vs L, kg vs lb, °C vs °F. Each calc must declare its units and tests must exercise the confusion path.
- **Extreme ages** — 0-minute-old, 40-week-PMA, adult patient accidentally routed to peds calc.
- **Prescription errors** — tenfold-dose errors (common patient-safety event) must be caught by range guards.
- **Time-travel** — test dates at DST transitions, leap seconds, year 2038.

Use `QuickCheck`/`Hypothesis`/`proptest` in the respective languages. This is the test class that catches the most clinically-relevant defects and the rarest class actually written.

### 5.5 Mutation testing

One tier deeper than coverage. For Class B/C IEC 62304 repos, run `cargo-mutants` / `mutmut` / `Stryker` / `MutationTesting.jl` on safety-critical modules. Aim for mutation kill rate ≥ 80%. Runs weekly, not per-PR (it's slow).

### 5.6 Accessibility testing — `reusable-accessibility.yml`

`axe-core` wired into Playwright. Fail the build on any `serious` or `critical` WCAG violation. Clinician-facing UIs must hit WCAG 2.2 AA. Publish an HTML a11y report alongside Playwright results.

### 5.7 Load and performance baselines — `reusable-load-test.yml`

For any HTTP/API service:

- **k6** or **Locust** smoke-load on every release (sustained 100 RPS for 3 min, P95 latency and error-rate assertions).
- Results written to `perf/baseline.json`. PR fails if P95 regresses ≥ 15% or error-rate > 0.1%.
- Weekly soak (1 hour at 70% nominal load) via scheduled workflow with results archived per week.

### 5.8 Chaos testing — `reusable-chaos-test.yml`

For services deployed to K8s: inject pod kill, network latency, dependency timeout via LitmusChaos or Chaos Mesh in a dedicated environment. Not on every PR — on release candidates and on a weekly cadence. Each chaos run emits an audit event into the ledger.

### 5.9 Coverage gates

Minimum line coverage gate by class (from compliance policy):

| iec62304-class | Min line coverage | Min branch | Mutation |
|-----|-----|-----|-----|
| N/A (content, textbooks) | no gate | — | — |
| A | 70% | 60% | — |
| B | 85% | 75% | 70% kill rate |
| C | 95% | 90% | 85% kill rate |

---

## Part 6 — Audit, Traceability, and the Evidence Chain

The current `audit-log/ledger.json` is good for "what builds happened?" The extensions below turn it into a court-admissible-quality chain.

### 6.1 Merkle-chained, cryptographically-signed ledger

Replace `audit-log/ledger.json` (or supplement with) `audit-log/chain.ndjson` where each line is:

```json
{
  "seq": 1347,
  "timestamp": "2026-04-23T18:02:11Z",
  "event_type": "build.completed",
  "event_data": { ... existing ledger fields ... },
  "prev_hash": "sha256:a1b2c3...",
  "self_hash": "sha256:d4e5f6...",
  "signature": "base64-cosign-keyless-signature",
  "signature_issuer": "https://token.actions.githubusercontent.com",
  "signature_subject": "https://github.com/ruralpeds/<repo>/.github/workflows/audit-log.yml@refs/heads/main"
}
```

- `self_hash = sha256(canonical_json({seq, timestamp, event_type, event_data, prev_hash}))`
- `signature` via Sigstore keyless flow; verifiable offline.
- Any edit to any line invalidates all subsequent `prev_hash` values → tampering is detectable by a simple replay.

A nightly workflow (`audit-verify.yml`) replays the whole chain, verifies each signature, and fails (and opens a high-severity issue) if anything breaks.

### 6.2 WORM archive

Every week, the chain from the prior week is uploaded to **S3 Object Lock** (Governance mode) in a separate AWS account with cross-account-only delete perms, or the equivalent Azure Blob Storage immutability policy. This is your off-platform tamper-evident archive.

### 6.3 Event-type registry

Standardize audit event names across all clinical services. Propose `docs/audit-events.yaml` (canonical list):

```yaml
auth.login.succeeded
auth.login.failed
auth.mfa.challenged
auth.session.expired
auth.break_glass.invoked
user.role.granted
user.role.revoked
user.permission.changed
patient.record.viewed
patient.record.created
patient.record.updated
patient.record.exported
patient.record.printed
patient.record.deleted
clinical.order.placed
clinical.order.modified
clinical.order.signed
clinical.dose.calculated
clinical.override.reason_required
admin.config.changed
admin.feature_flag.toggled
deploy.production.approved
deploy.production.rolled_back
data.retention.purge_executed
data.backup.created
data.backup.restored_test
data.backup.restored_production
pccp.change.applied
```

Each event has: required fields, optional fields, severity, retention tier, PHI-allowed flag. Shared across services → queryable across services.

### 6.4 Audit log retention tiers

- **Hot** (`audit-log/chain.ndjson` in repo): 12 months.
- **Warm** (S3/Blob, Object Lock Governance): 7 years (HIPAA §164.316(b)(2)).
- **Cold** (archive tier): ≥ 7 years after termination of relationship where applicable.

---

## Part 7 — HIPAA & PHI Handling (Depth)

### 7.1 PHI scanning extension

`reusable-phi-scan.yml` already covers 18 Safe Harbor identifiers. Additions:

- **Named-entity recognition pass** on prose files (`.md`, `.qmd`, `.tex`, `.docx` in content repos). Use a small spaCy model; flag suspected names/addresses for manual review. False-positive handling via `.phi-allowlist.yaml` with required rationale per entry.
- **DICOM file detection** (`.dcm` or magic bytes) → block commit; you should never have a DICOM file in a repo unless it's a known-synthetic test fixture under `tests/fixtures/dicom/synthetic/`.
- **Scan uploaded Jupyter/Pluto notebooks** — notebooks frequently embed output cells with real data; scan JSON cells for PHI patterns on pre-commit and in CI.

### 7.2 Logging redaction standard

Every clinical service declares a `logging-redaction.yaml`:

```yaml
redact:
  fields:
    - patient.name
    - patient.mrn
    - patient.dob
    - patient.ssn
    - patient.address
    - patient.phone
    - patient.email
    - encounter.clinical_note
  operators:
    - hash-sha256      # replace with sha256(value + per-service salt)
    - truncate-4       # last 4 chars only
    - date-year-only
    - remove
```

Library per language implements the redaction middleware. Default is `remove`. A CI test (`test-log-redaction`) feeds a synthetic patient through the service and asserts no identifier appears in log output.

### 7.3 BAA and vendor tracking

Create `docs/compliance/VENDOR_BAA_REGISTRY.md`:

| Vendor / service | Category | PHI possible? | BAA status | Date signed | Notes |
|---|---|---|---|---|---|
| GitHub Enterprise Cloud | Source hosting + CI | Yes (source only, no PHI in repos per policy) | Available via Microsoft BAA under Enterprise Cloud | N/A — none | Not signed; no PHI stored |
| Sigstore / Fulcio | Signing | No | N/A | N/A | Public keyless signatures only |
| Anthropic API (Claude) | AI | Yes — if you ever send PHI | Available | TBD | You must execute a BAA *before* any PHI transits |
| HuggingFace Inference | AI | No — never send PHI | N/A | N/A | Policy: no PHI ever |
| GHCR | Container registry | No | GitHub BAA covers | — | Public images only |
| Codecov | Coverage | No (hash-only data) | Available | — | Currently free tier |
| Tailscale | VPN | Metadata only | Available | TBD | For Mac Studio access |

Review quarterly; the workflow `check-compliance.yml` already runs weekly — add a line-count check that `VENDOR_BAA_REGISTRY.md` has been edited in the last 90 days.

### 7.4 Encryption defaults

- **At rest**: customer-managed keys (CMK) for any datastore storing PHI. On AWS → KMS with rotation; on Azure → Key Vault-backed.
- **In transit**: TLS 1.3 only; TLS 1.2 allowed for legacy HL7v2 endpoints with documented exception; no plaintext anywhere including internal service-to-service.
- **Application-layer**: PHI-bearing fields encrypted with envelope encryption (per-field DEKs, KMS-managed KEKs) for defense-in-depth.

### 7.5 Break-glass pattern

A code pattern for break-glass access to elevated data, with required pre-requisites:

1. Identity re-verified (MFA challenge).
2. Justification text logged to `auth.break_glass.invoked` audit event.
3. Session-scoped, auto-expires in ≤ 1 hour.
4. Out-of-band notification to compliance officer (you) on invocation.
5. Quarterly review of break-glass events vs. justifications.

---

## Part 8 — High-Performance, High-Availability Architecture

This is where the roadmap expands from "a well-governed repo" to "a healthcare platform." The patterns below are what you standardize so that any new service reaches for them first.

### 8.1 Reference architecture

```
                ┌───────────────────────────────────────────────┐
                │                  Edge / CDN                   │
                │   (CloudFront / Fastly, WAF, Bot mgmt)        │
                └─────────────────┬─────────────────────────────┘
                                  │ TLS 1.3, mTLS for B2B
                ┌─────────────────▼─────────────────────────────┐
                │           API Gateway (Kong/Envoy)            │
                │  OAuth2/OIDC (SMART-on-FHIR), rate-limit,     │
                │  request signing, schema validation           │
                └─────────────────┬─────────────────────────────┘
                                  │
                ┌─────────────────▼─────────────────────────────┐
                │          Service Mesh (Istio/Linkerd)         │
                │  mTLS everywhere, circuit breakers, retries,  │
                │  traffic shifting, canary routing             │
                └────┬────────────┬──────────────┬──────────────┘
                     │            │              │
            ┌────────▼──┐   ┌─────▼────┐  ┌──────▼─────┐
            │ FHIR svc  │   │ CDS svc  │  │ Audit svc  │
            │ (Rust)    │   │ (Julia?) │  │ (Go)       │
            └────┬──────┘   └─────┬────┘  └──────┬─────┘
                 │                │              │
                 ▼                ▼              ▼
           ┌──────────┐     ┌──────────┐   ┌───────────┐
           │ Postgres │     │ Redis    │   │ Kafka /   │
           │ HA (3AZ) │     │ cluster  │   │ NATS JS   │
           │ Patroni  │     │          │   │ (events)  │
           └──────────┘     └──────────┘   └───────────┘
                 │                                │
                 ▼                                ▼
           ┌──────────┐                    ┌──────────┐
           │   KMS    │                    │ Audit    │
           │   (CMK)  │                    │ WORM     │
           └──────────┘                    └──────────┘

  Cross-cutting: OpenTelemetry (traces/metrics/logs) → Grafana/Tempo/Loki
                 Prometheus → Alertmanager → PagerDuty
                 All services emit audit events to Kafka → audit-svc
```

### 8.2 Service-level objectives (SLOs)

Every service declares `slo.yaml`:

```yaml
service: fhir-gateway
slos:
  - name: availability
    objective: 99.9           # three nines
    window: 30d
    sli:
      type: ratio
      success_query: 'sum(rate(http_requests_total{status!~"5.."}[5m]))'
      total_query:   'sum(rate(http_requests_total[5m]))'
    error_budget_policy:
      alert_at: 0.5           # alert when 50% of budget burnt
      freeze_releases_at: 0.9 # auto-freeze releases at 90% burn
  - name: latency_p95
    objective: 250            # ms
    window: 7d
  - name: phi_audit_completeness
    objective: 100.0          # no dropped audit events tolerated
    window: 1d
```

CI enforces file presence; Grafana dashboards auto-generated from the YAML.

### 8.3 Resilience patterns library

Publish a polyglot internal library (`ruralpeds/sci-resilience` or inside `rust-sci-core/sci-resilience`) implementing:

- Circuit breaker (Half-open state with exponential cooldown).
- Bulkhead (bounded concurrency per downstream).
- Retry with jittered exponential backoff + deadline propagation.
- Timeout everywhere (no unbounded calls, ever).
- Idempotency keys for every write endpoint.
- Request hedging for read-only latency-critical paths.
- Load shedding under CPU pressure (`load-average > N * cores` → return 503 with Retry-After).
- Graceful degradation (feature flags for non-critical paths).

Rust crate, Julia package, Python/Node wrappers — all share the same config shape.

### 8.4 Data layer HA

- **Postgres** via Patroni + etcd, 3 nodes across AZs, synchronous replication for writes, logical replication for read replicas.
- **Automated backup testing**: nightly restore-to-new-cluster test in a junk environment; failure fires high-severity page. Without restore tests, backups are theater.
- **PITR** (point-in-time recovery) retained for 35 days.
- **Cache**: Redis in Cluster mode, 6 nodes (3 primaries, 3 replicas), AUTH + TLS. Never trust cache for correctness — always source of truth in Postgres.
- **Event bus**: NATS JetStream (lighter) or Kafka (heavier, stronger ordering). All audit events go here → audit-svc → WORM.

### 8.5 FHIR Bulk Data and batch

For any population-level analytics path:

- Implement [FHIR Bulk Data Access IG](https://hl7.org/fhir/uv/bulkdata/) `$export` asynchronously.
- Use S3/Blob for output with presigned URLs, signed-URL expiration ≤ 15 min.
- Respect the client's `_since`/`_type` filters; log the full parameter set to audit.

### 8.6 Deployment strategies

- **Blue/green** for Class B services (every release provisions a new color; traffic shifted when green smoke-tests pass; old retained for instant rollback).
- **Canary** for Class C services (1% → 5% → 25% → 100% with automated rollback on SLO violation).
- **Feature flags** via OpenFeature (vendor-neutral spec) with a local provider by default, LaunchDarkly/Unleash optional. Every flag has an expiration date; CI fails if a flag is past its expiration without a removal PR.

### 8.7 Business continuity & DR

Document `docs/bcp/`:

| Service tier | RPO | RTO | DR strategy |
|---|---|---|---|
| Mission-critical (audit, FHIR gateway) | ≤ 5 min | ≤ 30 min | Multi-region active/passive with cross-region replication |
| Clinical-decision | ≤ 15 min | ≤ 2 hr | Warm standby in second region |
| Clinical-support | ≤ 1 hr | ≤ 8 hr | Backup/restore, tested quarterly |
| Reference/content | ≤ 24 hr | ≤ 72 hr | Backup/restore, tested annually |

Quarterly tabletop exercise documented in `docs/bcp/drills/YYYY-QN.md`.

### 8.8 Observability baseline

- **Traces**: OpenTelemetry SDK in every service. Trace-context propagation on every ingress/egress. Tail-sampling for 100% of error traces + 1% of success traces.
- **Metrics**: Prometheus conventions (counter/gauge/histogram). RED metrics (Rate, Errors, Duration) + USE (Utilization, Saturation, Errors) for infra.
- **Logs**: structured JSON only. Schema in `docs/observability/log-schema.json`. Mandatory fields: `timestamp`, `service`, `version`, `trace_id`, `span_id`, `level`, `event`, `actor_id`, `correlation_id`, `tenant_id`.
- **Alerts**: multi-window, multi-burn-rate against SLOs, not raw metrics.
- **Status page**: statuspage.io or home-rolled; auto-updated from alert state.

---

## Part 9 — New/Enhanced Reusable Workflows (Concrete List)

Consolidation of everything above. These go in `ruralpeds/.github/.github/workflows/`.

| Workflow | Status | Notes |
|---|---|---|
| `ci-node.yml` | exists | pin actions to SHA; add Scorecard |
| `ci-python.yml` | exists | add mypy strict mode for clinical repos |
| `ci-rust.yml` | exists | add `cargo-deny`, `cargo-audit`, `cargo-mutants` matrix for Class B/C |
| `ci-go.yml` | exists | `govulncheck`, `staticcheck` |
| `ci-julia.yml` | exists | add JET.jl, Aqua.jl strict |
| `e2e-playwright.yml` | exists | integrate axe-core |
| `audit-log.yml` | exists | **upgrade** to Merkle chain + Sigstore sign |
| `review-stamp.yml` | exists | **upgrade** to cosign-signed E-signature |
| `check-compliance.yml` | exists | expand checks to every item in this roadmap |
| `playwright-audit.yml` | exists | keep |
| `repo-scanner.yml` | exists | keep |
| `reusable-phi-scan.yml` | exists | add NER, DICOM, notebook scans |
| `reusable-sbom.yml` | exists | **upgrade** to attest-sbom (Sigstore-signed) |
| `sync-rulesets.yml` | exists | extend to property-based target routing |
| `reusable-codeql.yml` | **new** | multi-language, weekly + PR |
| `reusable-scorecard.yml` | **new** | OpenSSF Scorecard weekly, SARIF upload |
| `reusable-slsa-provenance.yml` | **new** | actions/attest-build-provenance |
| `reusable-container-sign.yml` | **new** | cosign keyless on every image push |
| `reusable-vex.yml` | **new** | OpenVEX document generation |
| `reusable-synthea-fixtures.yml` | **new** | generate + cache pediatric synthetic FHIR |
| `reusable-fhir-validation.yml` | **new** | HAPI FHIR validator against US Core |
| `reusable-hl7v2-conformance.yml` | **new** | HAPI HL7v2 profile check |
| `reusable-accessibility.yml` | **new** | axe-core, Pa11y for static content |
| `reusable-load-test.yml` | **new** | k6, P95 regression gate |
| `reusable-chaos-test.yml` | **new** | weekly, release-candidate only |
| `reusable-iec62304-traceability.yml` | **new** | requirement ↔ test ↔ risk matrix |
| `reusable-mutation-test.yml` | **new** | language-specific, weekly for Class B/C |
| `reusable-license-policy.yml` | **new** | reads `policies/licenses.json` |
| `audit-verify.yml` | **new** | nightly chain replay |
| `reusable-baa-check.yml` | **new** | validates `VENDOR_BAA_REGISTRY.md` freshness |
| `reusable-slo-check.yml` | **new** | validates `slo.yaml` presence + schema |
| `reusable-dr-drill.yml` | **new** | orchestrates quarterly restore test, logs result to ledger |

---

## Part 10 — Metrics, Scorecards, DORA

Create `ruralpeds/metrics` repo (or a `metrics/` folder in `.github`). Weekly job aggregates, via GitHub API + GHAS API + workflow artifacts:

- **Compliance score** per repo (current checker + new checks, weighted).
- **OpenSSF Scorecard** per repo.
- **DORA metrics**: deployment frequency, lead time for change, change failure rate, time to restore.
- **Vulnerability posture**: open CVEs by severity, MTTR, SBOM staleness.
- **Coverage** and **mutation kill rate** over time.
- **Audit completeness**: % of expected audit events actually emitted (spot-check via CI integration tests).
- **Breakdown by classification** custom property so you can see "my Class B repos have mean Scorecard 7.8, Class A at 6.1".

Render to `ruralpeds/ruralpeds.github.io/metrics/` as a Grafana or simple HTML dashboard. Public only if all data is non-PHI meta (it should be).

---

## Part 11 — Developer & AI-Agent Experience

### 11.1 Devcontainer baseline

`ruralpeds/.github/devcontainer-baseline/` with language-flavored subdirs; `repo-scanner.yml` copies the right one into any new repo. Preinstalled: formatter, linter, language version manager, pre-commit hooks, cosign, gh CLI.

### 11.2 Codespaces prebuilds

For repos you open frequently (modeling, rust-sci-core, Claude-artifacts), enable GitHub Codespaces prebuilds so you can spin up a hacking environment on a Chromebook or phone in < 30 seconds — useful for clinical-shift on-call scenarios.

### 11.3 Standardized `AGENTS.md`

Mandatory file in every clinical-criticality repo that tells Claude Code / Copilot:

- "This repo is `iec62304-class=B`. Never delete `dhf/`."
- "Every `src/` change must add or modify a test."
- "Never add a dependency without running the SBOM workflow locally first."
- "If you modify `dhf/risk/hazard-analysis.yaml`, a human review is required; open a Draft PR and request review."
- "Logs in this service must pass through the redaction middleware. Never `println!` a patient field."

### 11.4 Conventional Commits enforced

`commitlint` in CI. Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `security`, `compliance`, `dhf`, `hazard`. Required footer `Refs:` linking to requirement ID for Class B/C repos.

### 11.5 ADRs (Architecture Decision Records)

`docs/adr/` with [MADR](https://adr.github.io/madr/) template. Every significant architectural decision logged and linked from commit messages.

---

## Part 12 — Phased Roadmap (24 Weeks)

Scoped realistically for a solo clinical informatician. Weekly estimates assume ~5–8 focused hours; any week can slip and the next picks up.

| Phase | Weeks | Theme | Deliverables |
|---|---|---|---|
| 0 | Now | Baseline | This roadmap doc committed to `.github` alongside the blueprint. Custom properties (Part 2.1) defined. |
| 1 | 1–2 | Platform hardening — quick wins | Org 2FA required, PAT policy, `timothyhartzog-bot` GitHub App in production, secret scanning with push protection on, Scorecard workflow rolled out, all workflow actions pinned to SHAs. |
| 2 | 3–4 | Supply chain | `reusable-slsa-provenance.yml`, `reusable-container-sign.yml`, `reusable-vex.yml`, SBOM upgraded to attest-sbom. `STANDARDS_MAP.md` published. |
| 3 | 5–6 | Rulesets & properties | Repos labeled with custom properties (manual sweep). `org-baseline`, `org-clinical`, `org-device`, `org-phi-active` rulesets published. |
| 4 | 7–8 | Audit depth | Merkle chain + Sigstore-signed ledger live. `audit-verify.yml` nightly running. WORM archive configured. Event-type registry written. |
| 5 | 9–10 | E-signatures + Part 11 | `esign.py` CLI + workflow. Release sign-off process documented. |
| 6 | 11–12 | IEC 62304 starter | Pick 1 repo (propose `PedNeoSim.jl` or the Peds CDS repo) and fully stand up the DHF pattern end-to-end as a template. `reusable-iec62304-traceability.yml` working against that repo. |
| 7 | 13–14 | Clinical test depth | Synthea fixtures workflow, FHIR validation workflow, clinical adversarial proptest skeleton in `rust-sci-core`, axe-core wired into Playwright. |
| 8 | 15–16 | HA patterns library | `sci-resilience` crate/package published with circuit breaker, bulkhead, retry, idempotency, request hedging. First service (pick one) refactored to use it. |
| 9 | 17–18 | Observability baseline | OTel wired into first service. Log schema published. Grafana + Prom + Loki stack stood up (self-hosted on Mac Studio or low-cost cloud). |
| 10 | 19–20 | Load + chaos | `reusable-load-test.yml` with k6 live; baseline `perf/baseline.json` committed for first service. Chaos drill run and documented. |
| 11 | 21–22 | BCP/DR | Backup restore test automated. DR drill run, `docs/bcp/drills/2026-QX.md` written. RPO/RTO table validated against actual measurements. |
| 12 | 23–24 | Metrics + review | Metrics dashboard live. First quarterly compliance review meeting with yourself (seriously — write the minutes into the ledger). Roadmap updated for year 2. |

---

## Part 13 — Solo-Developer Adaptations

Most enterprise healthcare guidance assumes a team of 20+. Practical adaptations for a single-clinician-developer:

- **Four-eyes rule is still required** for Class B/C changes. Adaptations:
  - Self-review after ≥ 24-hour cooling-off period, documented as such in the review stamp (`reviewer: timothyhartzog-cooling-off`, `notes: "Self-reviewed after 26h; no findings."`) — acceptable for Class A, defensible-but-weaker for Class B, insufficient for Class C.
  - **AI-assisted review**: a Claude Code agent reviews the PR and posts findings; you then accept/reject. Log the AI review as a separate reviewer (`reviewer: claude-code-review-bot`, with the model + version in notes). Does not replace human review but documents that a second pair of eyes ran.
  - **External clinical peer review** for Class C — a named consulting peer who reviews quarterly release bundles. Their E-signature via `esign.py`.
- **Vendor BAA minimization** — keep to services that sign BAAs. Your current list is clean (no PHI in any vendor); maintain that discipline.
- **Single-person incident response** — write the runbook assuming *you* are oncall at 3 AM, on your phone, in a rural area with poor bandwidth. Design for that. Prebuilt Codespaces help here.
- **Training records** — HIPAA workforce training: you are your own workforce; document your completion of annual training (HealthStream, MedTrainer, or free HHS module) in `compliance/training-records/YYYY.md`.
- **Separation of duties** (Part 11 §11.10(d)) — hard when one person is dev, QA, and release manager. Mitigations: mandatory 24-h cooling-off; cryptographic binding of every promotion step; annual external audit.

---

## Part 14 — Acceptance Criteria for "Enterprise-Ready" (Revised)

A repo is enterprise-ready when every item below is ✅:

- [ ] Custom properties set (`data-classification`, `criticality`, `iec62304-class`, `regulated`, `primary-stack`, `baa-required`).
- [ ] Applicable org-level rulesets applied (inherited from property mapping).
- [ ] All GitHub Actions pinned to SHAs.
- [ ] CI green on every PR, with language-appropriate reusable workflow invoked.
- [ ] PHI scan green; any `.gitleaksignore` entry has a rationale.
- [ ] SBOM generated on release and cryptographically attested.
- [ ] Provenance attested on release artifacts.
- [ ] SARIF uploaded from CodeQL + Scorecard + PHI scan.
- [ ] Secret scanning + push protection confirmed active.
- [ ] Audit ledger initialized; Merkle chain verifiable.
- [ ] E-signature workflow invoked for the most recent release.
- [ ] `AGENTS.md`, `SECURITY.md`, `CONTRIBUTING.md`, `README.md` present and current (≤ 90 days).
- [ ] For Class B/C: `dhf/` populated, traceability matrix generated, coverage gate met, mutation gate met.
- [ ] For services: `slo.yaml`, `logging-redaction.yaml`, baseline `perf/baseline.json`, deployment strategy documented.
- [ ] For services processing PHI: encryption standards met, runner strategy applied, environment protection active.
- [ ] Post-market issue template installed (Class B/C).
- [ ] Quarterly review stamp in the ledger.

---

## Part 15 — What to Do This Week

If you want concrete next actions before anything else, in priority order:

1. **Enable org-wide secret scanning with push protection.** Single highest-ROI security control; one toggle.
2. **Pin all existing reusable-workflow `uses:` to SHAs.** Run `pin-github-action` locally, open a PR in `ruralpeds/.github`.
3. **Finish the `timothyhartzog-bot` GitHub App migration.** Removes the last long-lived PAT.
4. **Define the six custom properties** in org settings. Takes 15 min.
5. **Commit this roadmap** to `ruralpeds/.github/` as `ENTERPRISE_ROADMAP.md` next to the existing blueprint so both sit side by side.
6. **Tag one repo as Class B** (suggestion: `ruralpeds/PedNeoSim.jl`) and start the DHF scaffold there as the working template.
7. **Open an issue per phase** in `ruralpeds/.github` so the work is tracked, discoverable, and traceable into the audit ledger automatically.

---

*Document version: 1.0 — 2026-04-23*
*Author: generated for Timothy Hartzog MD (ruralpeds)*
*Next review: 2026-07-23*
