# Q3-2026 Initiative 05: Third-Party Dependency Audit

**Duration:** 2 weeks (September 1–14)  
**Owner:** Timothy Hartzog (Compliance Officer)  
**Priority:** MEDIUM (Closes supply chain risk gap)

---

## Objective

Audit all third-party dependencies in clinical device repos (PedNeoSim.jl, pediatric-cds, audit-service). Classify each dependency: approved (has BAA), requires-review, or prohibited (GPL/unsupported). Document dependency policy and flag high-risk packages.

**Current State:** Dependencies managed ad-hoc; no formal approval process; no risk classification.

**End State:**
- All dependencies classified (approved/review/prohibited)
- BAA coverage verified for regulated data handling
- High-risk packages identified (unmaintained, vulnerabilities)
- Dependency policy published (policies/dependencies.md)
- Remediation plan for non-compliant dependencies

---

## Scope

### PedNeoSim.jl (Julia)
- Project.toml dependencies (core + test)
- Transitive dependencies (full dependency tree)
- Expected: 20–40 direct dependencies

### Pediatric-CDS (Python/Node)
- requirements.txt / package.json
- Transitive dependencies
- Expected: 30–50 direct dependencies

### Audit-Service (Go/Rust)
- go.mod / Cargo.toml
- Transitive dependencies
- Expected: 15–30 direct dependencies

---

## Classification Criteria

### Tier 1: Approved (Green ✅)
- Has vendor Business Associate Agreement (BAA)
- Actively maintained (updates within 12 months)
- No critical vulnerabilities
- Examples: AWS, Microsoft, Okta, standard libraries

### Tier 2: Requires Review (Yellow ⚠️)
- No BAA but acceptable for regulated use
- Actively maintained but new
- Low severity vulnerabilities
- Examples: Popular open-source (React, NumPy, etc.)
- Action: Code review for potential PHI exposure

### Tier 3: Prohibited (Red ❌)
- GPL or incompatible licenses (proprietary conflict)
- Unmaintained (no updates >24 months)
- Critical vulnerabilities + vendor unresponsive
- Examples: Abandoned projects, GPL-3.0 licensed
- Action: Replace or remove from clinical path

---

## Audit Process

### Step 1: Dependency Inventory (Days 1–2)
- Extract all direct dependencies from manifest files
- Use SBOM tools (syft, trivy) to generate full dependency tree
- Output: `compliance-metrics/dependency-inventory-q3-2026.csv`

### Step 2: Classification (Days 3–5)
- Research each dependency (license, maintenance status, vulnerabilities)
- Determine BAA coverage (contact vendor if uncertain)
- Assign Tier (1/2/3)
- Output: `policies/dependencies-classified.xlsx`

### Step 3: Risk Assessment (Days 6–7)
- For Tier 2: Code audit for PHI exposure
- For Tier 3: Identify replacement or removal path
- Output: `compliance-metrics/dependency-risk-assessment.md`

### Step 4: Remediation Plan (Days 8–10)
- For each Tier 3: Define replacement strategy
- Set deadlines: Critical (30 days), High (60 days), Medium (90 days)
- Output: `compliance-metrics/dependency-remediation-plan.md`

### Step 5: Policy & Documentation (Days 11–14)
- Publish dependency policy: `policies/dependencies.md`
- Create approval workflow (new dependencies require review)
- Document escalation path
- Output: `docs/compliance/DEPENDENCY_POLICY.md`

---

## High-Risk Package Examples (Likely Findings)

| Package | Language | Risk | Action |
|---------|----------|------|--------|
| Unmaintained ML library | Python | No updates 3+ years | Replace with maintained fork |
| GPL-3 licensed utility | Any | License conflict | Remove or replace with Apache/MIT |
| Zero-day CVE published | Any | Critical | Immediate update or patch |
| Vendor bankruptcy | Any | No support | Migrate to alternative |

---

## Success Metrics

| Metric | Success Criteria |
|--------|-----------------|
| Coverage | 100% of dependencies classified |
| Approved | ≥90% Tier 1/2 (non-prohibited) |
| High-Risk | <5% Tier 3 remaining after remediation |
| Policy | Dependency policy published + adopted |
| Compliance | All clinical repos pass dependency audit |

---

## Deliverables

- [ ] `compliance-metrics/dependency-inventory-q3-2026.csv` (full tree)
- [ ] `policies/dependencies-classified.xlsx` (classification matrix)
- [ ] `compliance-metrics/dependency-risk-assessment.md` (risk analysis)
- [ ] `compliance-metrics/dependency-remediation-plan.md` (action plan)
- [ ] `policies/dependencies.md` (published policy)
- [ ] `docs/compliance/DEPENDENCY_POLICY.md` (implementation guide)

---

## Compliance Impact

- Closes SSDF v1.1 §PO4.2 gap (supply chain risk)
- Enables FDA submission (software security pedigree)
- Supports ISO 13485 QMS (supplier management)

---

## Timeline

| Day | Activity |
|-----|----------|
| Sep 1–2 | Dependency inventory |
| Sep 3–5 | Classification |
| Sep 6–7 | Risk assessment |
| Sep 8–10 | Remediation planning |
| Sep 11–14 | Policy + documentation |

---

**Initiative Q3-5 completes supply chain security framework for FDA premarket submission.**

