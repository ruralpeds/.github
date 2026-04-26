# Regulatory & Standards Applicability Map

**Companion to:** `ENTERPRISE_ROADMAP.md` (Part 1)  
**Purpose:** Map each regulatory framework to the custom repository properties that trigger its controls  
**Updated:** 2026-04-24  
**Scope:** `ruralpeds/*` organization

---

## How to Use This Map

Every repo in `ruralpeds` has **custom properties** (set in GitHub org settings). This map shows which **standards** apply based on those properties, and what **controls** must be in place.

### Example

If a repo has:
- `data-classification: phi-active`
- `criticality: clinical-decision`
- `iec62304-class: class-b`
- `regulated: true`

Then it must satisfy:
1. HIPAA Security Rule (auth, audit, encryption)
2. HIPAA §164.312(b) — audit controls
3. NIST SP 800-66 — HIPAA implementation
4. 21 CFR Part 11 — GxP records (if producing regulated records)
5. IEC 62304 Class B (traceability, testing, DHF)
6. ISO 13485 (design controls if applicable)
7. FDA Section 524B (SBOM, supply-chain risk)

### Custom Properties Reference

| Property | Type | Values | Default | Required |
|----------|------|--------|---------|----------|
| `data-classification` | single-select | public, internal, synthetic, phi-capable, phi-active | internal | ✅ |
| `criticality` | single-select | experimental, reference, clinical-support, clinical-decision, device | experimental | ✅ |
| `iec62304-class` | single-select | not-applicable, class-a, class-b, class-c | not-applicable | ✅ |
| `regulated` | true-false | true/false | false | ✅ |
| `primary-stack` | single-select | julia, rust, node, python, go, content, polyglot | — | ✅ |
| `baa-required` | true-false | true/false | false | ✅ |

---

## Standards Applicability Matrix

### HIPAA (Health Insurance Portability & Accountability Act)

**When it applies:** `data-classification in {phi-capable, phi-active}`

**Key implications:**
- **45 CFR §164.308** — Administrative safeguards (access control, security awareness, incident response)
- **45 CFR §164.310** — Physical safeguards (facility access)
- **45 CFR §164.312** — Technical safeguards (access, encryption, audit controls)

**Controls required:**
- [ ] Access control: role-based, least-privilege, periodic review
- [ ] Audit log: immutable, tamper-evident (Merkle chain recommended)
- [ ] Encryption: in-transit (TLS 1.3+), at-rest (AES-256)
- [ ] Transmission security: secure channels, digital certificates
- [ ] Contingency planning: backup/restore procedures, RTO ≤ 2 hr
- [ ] Business associate agreements (if using 3rd-party services)

**Workflows/checks enforced:**
- `reusable-phi-scan.yml` — gitleaks + HIPAA Safe Harbor patterns
- `audit-log.yml` — immutable ledger with Merkle chain
- `sync-rulesets.yml` → `org-phi-active` ruleset (requires environment protection for prod)

---

### HIPAA §164.312(b) — Audit Controls

**When it applies:** Any repo touching ePHI (directly or indirectly)

**Key requirement:**
> Implement hardware, software, and procedural mechanisms that record and examine activity in information systems containing or using ePHI.

**Controls required:**
- [ ] Comprehensive audit trail: every data access, modification, deletion
- [ ] Log attributes: timestamp, user ID, action, before/after values, outcome
- [ ] Retention: ≥ 6 years per regulation
- [ ] Tamper evidence: cryptographic chaining (Merkle), no retroactive edits
- [ ] Non-repudiation: digital signatures on critical events
- [ ] Access by minimum necessary: logs must not be accessible to all staff

**Workflows/checks enforced:**
- `audit-log.yml` → records all CI events, deps, code changes
- `audit-verify.yml` → nightly Merkle-chain integrity check
- `review-stamp.yml` → cosign-signed approval records for sensitive ops

---

### NIST SP 800-66 Rev. 2 — Implementing HIPAA Security Rule

**When it applies:** `data-classification in {phi-capable, phi-active}`

**Key implications:**
Maps HIPAA §164 requirements to concrete technical controls. Use as implementation checklist.

**Sample mappings:**
| HIPAA Rule | NIST Control | Implementation |
|-----------|-------------|-----------------|
| §164.312(a)(2)(i) — User ID | SC-2 | GitHub SAML SSO + 2FA required |
| §164.312(a)(2)(ii) — Emergency access | AC-4 | Break-glass procedure + audit logging |
| §164.312(b) — Audit controls | AU-2/AU-3 | Immutable log with Merkle chain |
| §164.312(c)(2) — Encryption | SC-7/SC-28 | TLS 1.3+ in-transit, AES-256 at-rest |

**Workflows/checks enforced:**
- Org-level: 2FA required, SAML SSO configured, signed commits enforced
- Repo-level: PHI scan, encryption at-rest validation, break-glass audit

---

### NIST SP 800-218 (SSDF v1.1) — Secure Software Development

**When it applies:** All software (baseline)

**Key practices:**
- **PO (Prepare the Organization)**: security roles, training, risk assessment
- **PS (Protect Software)**: access control, authentication, audit
- **PO (Prepare Organization)**: supply-chain risk, third-party review
- **PV (Produce Well-Secured Software)**: secure design, code review, testing

**Controls required:**
- [ ] Secure design review checklist + architecture threat modeling
- [ ] Security code review: peer review of every commit touching security
- [ ] Automated testing: SAST (CodeQL), DAST (Playwright), dependency scan
- [ ] Signed commits + reviewed PRs before merge
- [ ] Artifact provenance: SLSA L3 (signed build info + source)
- [ ] Bill of Materials: SBOM (CycloneDX/SPDX)

**Workflows/checks enforced:**
- `ci-*.yml` — CodeQL scanning, dependency audit, signed commits required
- `reusable-sbom.yml` — CycloneDX/SPDX SBOM generation
- `reusable-slsa-provenance.yml` — signed build provenance
- `sync-rulesets.yml` → org-baseline (2+ reviewers for critical repos)

---

### 21 CFR Part 11 — Electronic Records; Electronic Signatures

**When it applies:** `regulated: true` AND software produces GxP-regulated records

**Examples:** PedNeoSim.jl (clinical simulation), any device firmware path

**Key requirements (§11.50–11.70):**
- Records: Legible, accurate, complete, permanently retained
- Signatures: Associate meaning/intent with action; non-repudiable
- System validation: IQ/OQ/PQ (Installation, Operational, Performance)
- Training: Documented user training + competency assessment
- Audit trail: Secure, computer-generated, independent record

**Controls required:**
- [ ] Digital signatures: cryptographic (cosign/Sigstore) on release artifacts
- [ ] Signature binding: user ID, timestamp, statement of meaning ("I am approving this release for patient use")
- [ ] Record metadata: hash, signature value, signature time, signer cert chain
- [ ] System IQ/OQ: GitHub Actions runner configuration, build script validation
- [ ] PQ: Baseline performance metrics (build time, artifact integrity) established and monitored
- [ ] Audit trail: Release approval chain + cosign signatures recorded immutably

**Workflows/checks enforced:**
- `reusable-slsa-provenance.yml` — signed release artifacts
- `review-stamp.yml` — cosign-signed approval records (proposed)
- `release.yml` — requires 2 reviewers + explicit signature of approval
- `audit-log.yml` — immutable ledger of all release decisions

---

### IEC 62304 — Software Lifecycle Processes (Medical Devices)

**When it applies:** `iec62304-class in {class-a, class-b, class-c}` OR `regulated: true`

**Software Safety Classes:**
- **Class A** — No injury possible (e.g., display-only, non-critical logs)
- **Class B** — Non-serious injury (e.g., dose calculation, alarm logic)
- **Class C** — Death or serious injury possible (e.g., infusion pump, ventilator control)

**Key processes:**
1. **Software Safety Plan** — classification, risk strategy, communication plan
2. **Software Requirements Specification (SRS)** — functional & non-functional
3. **Software Architecture Design** — decomposition, interfaces, safety mechanisms
4. **Software Unit Implementation** — code standards, review, testing
5. **Software Integration Testing** — inter-unit verification
6. **Software System Testing** — end-to-end, safety cases
7. **Software Release** — version control, release notes, traceability
8. **Problem Resolution** — bug tracking, change management

**Controls required (Class B minimum):**
- [ ] Design History File (DHF): all lifecycle artifacts in `dhf/` directory
- [ ] Traceability matrix: requirement ID ↔ design ↔ test case
- [ ] Code review: peer review of all changes
- [ ] Unit testing: ≥ 80% line coverage (statement), structural testing
- [ ] Integration testing: API contracts, module interfaces
- [ ] System testing: end-to-end scenarios, hazard mitigation testing
- [ ] Risk management: FMEA, hazard analysis, risk controls documented
- [ ] Version control: commit history preserved, releases tagged
- [ ] Release documentation: version, build info, test results, known issues

**Workflows/checks enforced:**
- `reusable-iec62304-traceability.yml` (proposed) — requirement matrix validation
- `ci-*.yml` → code coverage gates (Class B: ≥80%, Class C: ≥85%)
- `reusable-mutation-test.yml` (proposed) — kill-rate gate for Class C
- `audit-log.yml` → DHF integrity: no deletion of `dhf/` files
- `sync-rulesets.yml` → org-device ruleset (2 reviewers, VEX required on release)

---

### ISO 13485 — Medical Device Quality Management System

**When it applies:** `regulated: true` AND planning to commercialize or certify

**Key requirements:**
- **Design control** — from concept through commercial release
- **Design History File (DHF)** — evidence of design process
- **Risk management** — ISO 14971 hazard analysis
- **Management responsibility** — quality policy, resource allocation
- **Document control** — change management, version control
- **Product realization** — design review, verification, validation

**Controls required:**
- [ ] DHF as organizational artifact (in `dhf/`, linked from repo)
- [ ] Design reviews: preliminary (concept), critical (high-risk areas), release
- [ ] Design verification: does it meet spec? (unit/integration testing)
- [ ] Design validation: does it meet user needs? (clinical testing, Synthea fixtures)
- [ ] Change control: document rationale, review, approval for all design changes
- [ ] Traceability: requirements → design → tests → risk controls

**Workflows/checks enforced:**
- `reusable-iec62304-traceability.yml` — design/requirement/test matrix
- `audit-log.yml` → DHF change log (who, what, when, why)
- `ci-*.yml` → design review checklist in PR template

---

### FDA Section 524B (Cybersecurity in Medical Devices)

**When it applies:** `regulated: true` AND planning pre-market submission to FDA

**Key requirements (2023 guidance):**
- Software Bill of Materials (SBOM) — in FDA submission
- Vulnerability management plan — how you ID/address post-market CVEs
- Reasonable assurance of cybersecurity — threat modeling, mitigations
- Coordinated disclosure — responsible vulnerability reporting path

**Controls required:**
- [ ] SBOM: CycloneDX/SPDX format, attached to release, ≤ 3 months old
- [ ] Vulnerability tracking: CVE tracking spreadsheet or tool, with remediation status
- [ ] Threat model: documented in `dhf/risk/threat-model.md`, updated annually
- [ ] Incident response: security.txt or security email published
- [ ] Scorecard: OpenSSF Scorecard score tracked + trend
- [ ] Supply-chain risk: documented vendor assessment, 3rd-party components

**Workflows/checks enforced:**
- `reusable-sbom.yml` — SBOM attached to every release
- `reusable-slsa-provenance.yml` — signed provenance for FDA traceability
- `reusable-vex.yml` (Phase 2) — OpenVEX document for vulnerability assessment
- `check-compliance.yml` → flags SBOM staleness, missing vulnerability plan

---

### ISO 14971 — Risk Management (Medical Devices)

**When it applies:** `regulated: true` OR `iec62304-class: class-b` or higher

**Key processes:**
1. **Risk analysis** — identify hazards, probability, severity
2. **Risk evaluation** — acceptable vs. unacceptable
3. **Risk control** — design/mitigation measures
4. **Residual risk evaluation** — does mitigation work?
5. **Risk management review** — periodic update

**Controls required:**
- [ ] Risk Management File (RMF): in `dhf/risk/`
- [ ] Hazard list: documented, prioritized by FMEA severity × probability
- [ ] Risk matrix: unacceptable → control measure → residual risk acceptable
- [ ] FMEA (Failure Mode & Effects Analysis): systematic coverage
- [ ] Design FMEA (DFMEA) + Process FMEA (PFMEA): for architecture + CI/CD
- [ ] Risk control evidence: design decisions linked to hazards
- [ ] Traceability: hazard ID → test case → release notes (known limitations)

**Workflows/checks enforced:**
- `audit-log.yml` → no deletion of `dhf/risk/` files
- `reusable-iec62304-traceability.yml` → hazard ID ↔ test case links validated
- `ci-*.yml` → pytest/unittest with hazard-driven test naming (`test_hazard_X_Y_Z`)

---

### FDA Predetermined Change Control Plan (PCCP)

**When it applies:** `regulated: true` AND software uses AI/ML

**Key requirement:**
For FDA-cleared AI/ML devices, define modifications that can be made post-clearance without new 510(k):
- **Within PCCP scope** → allowed automatically
- **Outside PCCP scope** → requires new submission

**Controls required:**
- [ ] PCCP document: in `dhf/ai-ml/PCCP.md`
- [ ] Modification categories: data retraining, threshold adjustment, I/O format change, etc.
- [ ] Governance: who approves, how tested, release cadence
- [ ] Monitoring: metrics tracked to detect out-of-distribution performance

**Workflows/checks enforced:**
- `audit-log.yml` → modification log linked to PCCP categories
- Custom: ML model versioning, test harness for regression detection

---

### HITRUST CSF (Common Security Framework)

**When it applies:** `regulated: true` AND optional but pursuing certification

**Key scope:**
Certifiable framework harmonizing HIPAA/NIST/ISO. Used by payers, health plans, HIEs.

**Certification path:**
- CSF v9.2 alignment → 22 control categories
- Self-assessment or 3rd-party audit
- Annual recertification

**Controls required:**
Implement baseline + Phase 2 (supply-chain) — covers ≈60% of HITRUST footprint.

**Workflows/checks enforced:**
- `check-compliance.yml` → maps to HITRUST categories

---

### SOC 2 Type II (Service Organization Control)

**When it applies:** `criticality >= clinical-support` AND offering any service to external parties

**Key commitments:**
- **Trust Service Criteria**: Security, Availability, Processing Integrity, Confidentiality, Privacy
- **Annual attestation** by independent auditor

**Controls required (Phase 2 + Phase 3):**
- Baseline compliance with all above standards
- Service Level Objective (SLO) tracking
- Change management + code review + testing documented
- Incident response procedures + evidence
- Vendor management (BAA for 3rd-party services)

**Workflows/checks enforced:**
- `reusable-slo-check.yml` (proposed) — SLO tracking + alerts
- `sync-rulesets.yml` → required sign-off process for changes

---

### HL7 FHIR R4 / R5

**When it applies:** `data-classification: {internal, phi-capable, phi-active}` AND exchanging healthcare data

**Key requirements:**
- **US Core 6.1+** profiles for ambulatory + inpatient
- **USCDI v4** (US Core Data for Interoperability) — mandatory minimum elements
- **Conformance** to FHIR validation + terminology binding

**Controls required:**
- [ ] FHIR profile alignment: US Core, custom profiles in `fhir/profiles/`
- [ ] Terminology: SNOMED CT, LOINC, RxNorm binding in code
- [ ] Validation: HAPI FHIR validator in CI
- [ ] Documentation: CapabilityStatement (RESTful capabilities), operation definitions

**Workflows/checks enforced:**
- `reusable-fhir-validation.yml` (proposed) — HAPI FHIR validator
- `reusable-synthea-fixtures.yml` (proposed) — synthetic FHIR patient data for testing

---

### WCAG 2.2 AA (Web Content Accessibility Guidelines)

**When it applies:** `criticality >= clinical-support` AND has clinician or patient-facing UI

**Key requirements:**
- **Level A**: Must (baseline)
- **Level AA**: Should (recommended)
- **Level AAA**: May (enhanced)

**Common failures:**
- Missing alt text on images
- Color-only differentiation
- Keyboard navigation broken
- Poor contrast ratios
- Unlabeled form fields

**Controls required:**
- [ ] Automated: axe-core, Pa11y in Playwright suite
- [ ] Manual: keyboard navigation, screen-reader test
- [ ] Fix cadence: accessibility bugs treated as P1 (critical)

**Workflows/checks enforced:**
- `e2e-playwright.yml` → axe-core integration (automated checks)
- `reusable-accessibility.yml` (proposed) — Pa11y static scan

---

### OWASP ASVS 4.0.3 (Application Security Verification Standard)

**When it applies:** `criticality >= clinical-support` AND has web/API service

**Security levels:**
- **Level 1** — CMS, brochures (basic)
- **Level 2** — Web apps, APIs (standard)
- **Level 3** — High-value apps, healthcare (advanced)

**For clinical apps: target Level 2 minimum**
- Authentication (strong session mgmt, password policy)
- Access control (RBAC, attribute-based)
- Input validation (no injection, XSS, XXE)
- Output encoding
- Cryptography (data protection)
- Error handling (no info leakage)
- Logging & monitoring

**Workflows/checks enforced:**
- `ci-*.yml` → SAST (CodeQL, Bandit) for injection patterns
- `e2e-playwright.yml` → DAST checks (OWASP Top 10)
- `reusable-secret-scan.yml` (existing) → gitleaks for hardcoded secrets

---

### OpenSSF Scorecard

**When it applies:** All repos (baseline best practice)

**Scoring:**
- 10-point scale per control (0 = fail, 10 = pass)
- 17 controls: signed-commits, code-review, pinned-dependencies, binary-artifacts, etc.
- Score range: 0–170

**Target:** ≥ 120 (good), ≥ 140 (excellent)

**Controls required (Phase 1–2):**
- Signed commits (enforced by org ruleset)
- Code review (2 reviewers for clinical, 1 for experimental)
- Pinned dependencies (actions, language package managers)
- SBOM (reusable-sbom.yml)
- Provenance attestation (SLSA, Phase 2)
- Vulnerability scanning (CodeQL, Dependabot)

**Workflows/checks enforced:**
- `reusable-scorecard.yml` (proposed) — weekly scan + trending

---

### SLSA v1.0 (Supply-chain Levels for Software Artifacts)

**When it applies:** All repos publishing artifacts (releases, container images)

**Maturity levels:**
- **Level 0** — No provenance
- **Level 1** — Provenance exists, not fully automated
- **Level 2** — Automated build, source control authenticated
- **Level 3** — Signed provenance, build platform hardened
- **Level 4** — Isolated build + cryptographic verification

**Target:** Level 3 (reasonable for solo/small teams)

**Controls required (Phase 2):**
- [ ] Build provenance: signed statement of inputs/outputs/builder
- [ ] Source control: commits signed + reviewed before merge
- [ ] Access control: limited to maintainers, no external commits to main
- [ ] Artifact integrity: container images signed + verified on pull

**Workflows/checks enforced:**
- `reusable-slsa-provenance.yml` → generate signed provenance
- `reusable-container-sign.yml` → cosign keyless signing
- `sync-rulesets.yml` → enforce signed commits, limited main access

---

## Implementation Timeline

| Phase | Focus | Standards Addressed | Repos Enabled |
|-------|-------|-------------------|---|
| **Phase 1** | Baseline security (weeks 1–2) | NIST SSDF PO/PS basics, OpenSSF Scorecard | All (experimental+) |
| **Phase 2** | Supply chain (weeks 3–4) | SLSA L3, FDA §524B SBOM, CISA VEX | All (experimental+) |
| **Phase 3** | Governance (weeks 5–6) | Custom properties, org-rulesets | Clinical-support+ |
| **Phase 4** | Audit immutability (weeks 7–8) | HIPAA §164.312(b), 21 CFR §11 | ePHI-capable repos |
| **Phase 5** | E-signatures (weeks 9–10) | 21 CFR Part 11 §11.50–70 | GxP-regulated repos |
| **Phase 6** | IEC 62304 (weeks 11–12) | IEC 62304, ISO 14971 | Class B/C devices |
| **Phase 7** | Clinical validation (weeks 13–14) | HL7 FHIR, WCAG AA | Clinical-decision+ |
| **Phase 8–12** | HA, observability, BCP/DR, metrics | All standards in continuous operation | All |

---

## FAQ

**Q: My repo doesn't fit neatly into one classification.**  
A: Set `primary-stack` to reflect the dominant language/concern. Additional annotations in repo README/AGENTS.md are fine.

**Q: How often should we re-assess standards?**  
A: Annually or when FDA/regulatory guidance updates. Track in `docs/compliance/standards-review.md`.

**Q: Can we get a compliance report?**  
A: Yes — Phase 12 (Metrics) generates a compliance scorecard showing coverage by standard & property.

**Q: What if a repo is very experimental?**  
A: Set `criticality: experimental`, `regulated: false`, `data-classification: public`. It bypasses most controls; audits are still useful for learning.

---

## References

- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html) — 45 CFR Parts 160 & 164
- [NIST SP 800-218 (SSDF)](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf) — Secure Software Development
- [21 CFR Part 11](https://www.ecfr.gov/current/title-21/part-11) — Electronic Records, E-Signatures
- [IEC 62304](https://www.iec.ch/webstore/webstore.exe?A=viewed_recently) — Medical Device Software Lifecycle
- [ISO 13485](https://www.iso.org/standard/59752.html) — Medical Device QMS
- [FDA Section 524B Guidance](https://www.fda.gov/media/161865/download) — Cybersecurity in Medical Devices
- [OpenVEX Specification](https://openvex.dev/) — Vulnerability Exploitability eXchange
- [SLSA Framework](https://slsa.dev/spec/v1.0/) — Supply-chain Levels for Software Artifacts
- [HL7 FHIR R4 US Core](https://www.hl7.org/fhir/us/core/) — US Core Implementation Guide
- [OpenSSF Scorecard](https://securityscorecards.dev/) — Supply-chain Risk Assessment
