# Q3-2026 Strategic Roadmap: Formalization & Integration

**Period:** July 1 – September 30, 2026  
**Baseline:** Q2-2026 completion (compliance score 87/100 expected)  
**Theme:** Quality management system formalization + ecosystem integration + FDA premarket readiness  
**Owner:** Timothy Hartzog (Compliance Officer) + Platform Engineering Team  

---

## Executive Overview

**Q3-2026 advances from operational compliance (Year 1) → institutional maturity (Year 2).**

Year 1 established the foundational governance system. Q2-2026 eliminated gaps. **Q3-2026 formalizes processes** (quarterly FMEA reviews, risk management living documents) and **integrates external systems** (EHR FHIR mapping, Tempo distributed tracing, FDA premarket assessment).

**Critical Outcome:** By end of Q3, organization will have made **formal go/no-go decision on FDA device pathway**. Device path → Year 3 QMS formalization. Non-device path → Year 3 ecosystem expansion.

---

## Q3-2026: 5 Key Initiatives

### Initiative Q3–1: ISO 14971 Risk Management Formalization (4 weeks)

**Objective:** Establish quarterly Failure Mode & Effects Analysis (FMEA) review cycle per ISO 14971 §7.

**Owner:** Timothy Hartzog (Compliance Officer) + Domain Experts  
**Duration:** 4 weeks (Jul 1–28)  
**Priority:** HIGH

**Current State:**
- Hazard analysis YAML exists for clinical repos (`dhf/risk/hazard-analysis.yaml`)
- Risk controls defined (`dhf/risk/risk-controls.yaml`)
- No formal quarterly review process established

**End State:**
- Baseline FMEA completed (identify all known failure modes)
- Risk matrix: severity × probability → risk level
- Residual risk assessments documented
- Quarterly review meeting cadence established (every quarter, starting Q3)
- First Q3 FMEA review executed by Jul 28

**Implementation Steps:**

1. **Week 1 (Jul 1–7):** Prepare FMEA spreadsheet template
   - Columns: Failure Mode ID, Description, Effects, Severity, Probability, Risk Level, Control, Residual Risk, Owner
   - Import existing hazards from `dhf/risk/hazard-analysis.yaml`
   - Target: 18–25 hazard modes for clinical repos

2. **Week 2 (Jul 8–14):** Baseline FMEA review meeting
   - 2-hour facilitated session (PedNeoSim.jl focus)
   - Identify all potential failure modes: dose calculation errors, patient ID mismatch, data loss, network failure, UI miscommunication
   - Map to existing controls in code
   - Assess residual risk post-control

3. **Week 3 (Jul 15–21):** Document & validate
   - Transcribe FMEA findings into `dhf/risk/fmea-baseline.xlsx`
   - Cross-reference with traceability matrix (ensure all controls are tested)
   - Identify any controls without test coverage → add tests or mitigate risk

4. **Week 4 (Jul 22–28):** Formal approval & schedule recurring review
   - FMEA review meeting minutes documented
   - Approval sign-off by Compliance Officer
   - Schedule Q4-2026 FMEA review (Oct 1–7)
   - Document process in `dhf/risk/fmea-process.md` (quarterly cadence, meeting structure, escalation rules)

**Deliverables:**
- `dhf/risk/fmea-baseline.xlsx` (comprehensive FMEA)
- `dhf/risk/fmea-process.md` (quarterly review process doc)
- Meeting minutes + approval sign-off
- Updated `dhf/risk/` with residual risk assessments

**Success Metrics:**
- ✅ Baseline FMEA complete (18+ hazard modes identified)
- ✅ All identified risks have risk level (severity × probability)
- ✅ All risks with residual level ≥ "medium" have controls
- ✅ Quarterly review process documented & scheduled

**Effort:** ~30 hours (Compliance Officer + domain expert)

---

### Initiative Q3–2: EHR Integration Framework (6 weeks)

**Objective:** Define FHIR US Core 6.1 ↔ local system bidirectional mapping for clinical repos (PedNeoSim.jl, pediatric-cds).

**Owner:** Timothy Hartzog (Compliance Officer) + Clinical Domain Expert  
**Duration:** 6 weeks (Jul 1–Aug 12)  
**Priority:** HIGH (if EHR integration planned; optional if Year 3+ timing)

**Current State:**
- FHIR validation tests in place (Phase 7)
- No formal EHR integration mapping documented
- No sandbox EHR API testing

**End State:**
- FHIR ↔ local system mapping document (5+ resource types mapped)
- 10+ integration validation tests created
- Sandbox EHR API connectivity validated
- EHR integration roadmap for Year 3 finalized

**Scope:**
- **Inbound (EHR → App):** Observation (lab value), Patient demographics, MedicationRequest (prescription)
- **Outbound (App → EHR):** RiskAssessment (clinical decision), DiagnosticReport (simulation results)

**Implementation Steps:**

1. **Week 1–2 (Jul 1–14):** FHIR Profile Review
   - Document US Core 6.1 profiles for each resource type
   - List required vs. optional elements
   - Identify coding systems (LOINC for labs, SNOMED for diagnoses)
   - Create mapping template

2. **Week 2–3 (Jul 15–28):** Develop Mapping Specification
   - For each resource: define local variable ↔ FHIR element mapping
   - Example: 
     ```
     Local: serum_creatinine_mg_dL (float)
     FHIR: Observation.value.valueQuantity.value (Quantity)
     Unit conversion: mg/dL → umol/L (if needed)
     Validation: range 0.5–2.0 mg/dL for pediatric patients
     ```
   - Create mapping matrix (5+ resources, 20+ elements)

3. **Week 3–4 (Jul 29–Aug 11):** Create Validation Tests
   - Build 10+ integration tests covering:
     - Happy path: lab value inbound → dose calculation → risk assessment outbound
     - Error paths: missing fields, invalid values, unit mismatches
     - Edge cases: extreme lab values, DST boundaries, pediatric-specific ranges
   - Tests use FHIR validator (HAPI) for payload validation
   - Sandbox EHR API connectivity: test vs. real (CMS FHIR sandbox, Epic sandbox, etc.)

4. **Week 4–5 (Aug 12–25):** Documentation & Roadmap
   - Write `docs/ehr-integration/FHIR_MAPPING.md` (comprehensive mapping spec)
   - Write `docs/ehr-integration/integration-roadmap.md` (Year 3 phasing)
   - Create issue templates for EHR integration work items
   - Plan sandbox testing cycle (monthly sync with EHR vendor)

5. **Week 6 (Aug 26–Sep 2):** Review & Approval
   - Domain expert review of mapping accuracy
   - Compliance officer sign-off (FHIR conformance, data governance)
   - Finalize roadmap for Year 3 EHR connectivity

**Deliverables:**
- `docs/ehr-integration/FHIR_MAPPING.md` (mapping specification)
- `docs/ehr-integration/integration-roadmap.md` (Year 3 plan)
- 10+ integration validation tests (FHIR + EHR sandbox)
- Meeting minutes + sign-off

**Success Metrics:**
- ✅ 5+ FHIR resources mapped (inbound + outbound)
- ✅ 10+ integration tests passing
- ✅ Sandbox EHR connectivity verified
- ✅ Year 3 EHR roadmap approved

**Effort:** ~40 hours (Compliance Officer + clinical domain expert)

---

### Initiative Q3–3: Advanced Observability Phase 2 (5 weeks)

**Objective:** Deploy Tempo for long-term trace storage; add service mesh instrumentation (if K8s deployed); create Grafana dependency graph dashboard.

**Owner:** Platform Engineering  
**Duration:** 5 weeks (Jul 8–Aug 12)  
**Priority:** MEDIUM

**Current State:**
- OpenTelemetry SDK integrated (Phase 9)
- Jaeger deployed for development tracing
- No long-term trace storage (Jaeger in-memory/ephemeral)
- No service mesh instrumentation

**End State:**
- Tempo deployed for persistent trace storage (>7-day retention)
- Service mesh sidecar instrumentation (if Istio deployed)
- Grafana dashboard showing service dependency graph
- Trace sampling rules enforced (100% errors, 1% success, 10% high-latency)

**Implementation Steps:**

1. **Week 1 (Jul 8–14):** Tempo Deployment
   - Deploy Tempo (replacement for Jaeger dev-only instance)
   - Configure storage backend (local disk for dev, S3 for prod)
   - Wire OpenTelemetry SDK exporter: replace `jaeger-exporter` → `tempo-exporter`
   - Verify traces flow to Tempo

2. **Week 2 (Jul 15–21):** Service Mesh Instrumentation (if applicable)
   - If Istio deployed: wire sidecar proxies to emit metrics + traces
   - Configure sampling rules in Istio (match OTel rules)
   - Instrument intra-cluster requests (service A → service B latency, error rates)

3. **Week 3 (Jul 22–28):** Grafana Visualization
   - Create dashboard: Service Dependency Graph
     - Nodes: microservices (API, auth, DB, audit)
     - Edges: request count, P95 latency, error rate
     - Filters: by service, by error type, by latency percentile
   - Create dashboard: Trace Detail View
     - Search traces by trace_id, span_id, service
     - Waterfall view of request path
     - Flame graph of slowest spans

4. **Week 4 (Jul 29–Aug 11):** Sampling Rules Validation
   - Verify sampling rules active:
     - 100% error traces captured
     - 1% of successful traces sampled
     - 10% of traces with P95+ latency sampled
   - Validate Tempo storage consumption (target: <100GB/month for single environment)

5. **Week 5 (Aug 12–19):** Documentation & Transition
   - Document Tempo deployment in `docs/observability/TEMPO_DEPLOYMENT.md`
   - Runbook: troubleshoot missing traces, adjust sampling, capacity planning
   - Decommission old Jaeger instance (if applicable)

**Deliverables:**
- Tempo deployment (K8s manifest or docker-compose)
- Grafana dashboards (service dependency, trace detail)
- Updated OTel SDK configuration
- Documentation + runbooks

**Success Metrics:**
- ✅ Traces stored in Tempo, queryable for 7+ days
- ✅ Service dependency graph renders correctly
- ✅ Sampling rules applied (can verify via Tempo UI)
- ✅ Storage footprint <100GB/month

**Effort:** ~30 hours (platform engineering)

---

### Initiative Q3–4: FDA Premarket Readiness Assessment (3 weeks)

**Objective:** Conduct internal assessment of FDA device pathway viability. Go/no-go decision on premarket submission for PedNeoSim.jl or pediatric-cds.

**Owner:** Timothy Hartzog (Compliance Officer)  
**Duration:** 3 weeks (Aug 1–21)  
**Priority:** HIGH (Critical decision point)

**Current State:**
- IEC 62304 framework complete
- SBOM + VEX documents ready
- SLSA v1 provenance (95%+ coverage after Q2 backfill)
- Audit trail immutable + signed
- Synthetic patient validation data available

**End State:**
- **Formal go/no-go decision** documented
- **If go:** Premarket package (SSCC, traceability, provenance, cybersecurity assessment)
- **If no:** Deferred pathway decision + Year 3 focus on ecosystem (non-device)

**Decision Framework:**

**Go Criteria (all must be true):**
1. ✅ IEC 62304 Class B/C traceability complete
2. ✅ SBOM + VEX complete (FDA §524B ready)
3. ✅ SLSA v1 provenance signed (supply chain integrity)
4. ✅ Cybersecurity risk assessment completed (FDA 2023 guidance)
5. ✅ Synthetic patient validation data available (clinical evidence)
6. ✅ Legal review completed (FDA pathway assessment)
7. ✅ Resource commitment confirmed (Year 2–3 QMS formalization)

**No Criteria (any one triggers no-go):**
- Resource constraints (cannot commit to QMS formalization)
- Clinical validation insufficient (synthetic data inadequate)
- Regulatory timeline unacceptable (>12 months to clearance)
- Business case unclear (device market timing, reimbursement)

**Implementation Steps:**

1. **Week 1 (Aug 1–7):** Readiness Checklist
   - Verify all regulatory artifacts prepared (SBOM, VEX, provenance, audit trail)
   - Review IEC 62304 traceability matrix (100% coverage?)
   - Assess synthetic patient validation adequacy (356 patients, 82 adversarial tests)
   - Compile evidence bundle

2. **Week 2 (Aug 8–14):** Go/No-Go Assessment Meeting
   - 2-hour facilitated session with stakeholders
   - Present evidence bundle (SBOM, traceability, synthetic validation, audit integrity)
   - Assess go criteria (1–7 above)
   - Make formal decision: **Device path (go) or non-device (no-go)?**
   - Document rationale for decision

3. **Week 3 (Aug 15–21):** Package Preparation (if go) or Roadmap Pivot (if no-go)
   - **If go:**
     - Assemble premarket package (SSCC, traceability matrix, VEX, provenance attestations)
     - Schedule FDA pre-submission meeting (target Q4 or Q1-2027)
     - Plan Year 3 activities (QMS formalization, design controls, CAPA system)
   - **If no-go:**
     - Pivot Year 3 roadmap to non-device focus (EHR integration, ecosystem, reference implementations)
     - Document business case for deferred device pathway (if applicable)
     - Update compliance scorecard: device path decision recorded

**Deliverables:**
- FDA Readiness Assessment Report (go/no-go + rationale)
- Premarket package (if go)
- Year 3 roadmap pivot (if no-go)
- Meeting minutes + stakeholder sign-off

**Success Metrics:**
- ✅ Formal go/no-go decision documented
- ✅ Stakeholder alignment confirmed
- ✅ Year 3 roadmap updated based on decision
- ✅ Regulatory path forward clear

**Effort:** ~20 hours (compliance officer + stakeholders)

---

### Initiative Q3–5: Third-Party Dependency Audit (2 weeks)

**Objective:** Formal assessment of all third-party dependencies in clinical repos for HIPAA/FDA suitability.

**Owner:** Platform Engineering + Compliance Officer  
**Duration:** 2 weeks (Sep 1–14)  
**Priority:** MEDIUM

**Scope:**
- Audit all dependencies in: PedNeoSim.jl, pediatric-cds, audit-service
- Classify: approved (BAA available), requires-review (no statement), prohibited (GPL, unsupported)
- Flag high-risk or long-neglected dependencies

**Implementation Steps:**

1. **Day 1–2:** Gather Dependency Lists
   - Extract full dependency tree (using sbom-tool, cargo tree, Julia Pkg)
   - For each dependency: vendor name, version, license, last update date, security posture

2. **Day 3–5:** Vendor Assessment
   - Check if vendor has HIPAA BAA / HIPAA Business Associate status
   - Check if vendor provides security documentation (SOC 2, ISO 27001, CVE response SLA)
   - Flag unmaintained packages (last update >2 years ago)

3. **Day 6–10:** Classification & Risk Assessment
   - Classify each dependency:
     - **Approved:** Vendor has BAA or credible HIPAA statement
     - **Requires-Review:** No vendor statement, but low-risk (small utility, well-maintained, MIT/Apache license)
     - **Prohibited:** GPL license, vendor unsupported, or known security issues
   - Create dependency audit spreadsheet

4. **Day 11–14:** Remediation Plan
   - Flag "requires-review" deps for vendor contact / assessment
   - Flag "prohibited" deps for replacement / removal
   - Document policy in `policies/dependencies.md`

**Deliverables:**
- `policies/dependencies.md` (classification policy + approved/prohibited lists)
- Dependency audit spreadsheet (all clinical repos)
- Remediation plan (for Q4 or Year 3)

**Success Metrics:**
- ✅ All clinical repo dependencies classified
- ✅ Zero "prohibited" dependencies in production
- ✅ All "requires-review" deps assessed or plan documented

**Effort:** ~15 hours (platform engineering + compliance)

---

## Q3-2026 Timeline & Milestones

```
July 1 ────────────────────────────────────────────── September 30

Initiative Q3-1 (FMEA)
  ├─ Jul 1–7: Prepare template
  ├─ Jul 8–14: Baseline FMEA review
  ├─ Jul 15–21: Document & validate
  └─ Jul 22–28: Approval + schedule
  └─ ✅ Complete by Jul 28

Initiative Q3-2 (EHR Integration)
  ├─ Jul 1–14: FHIR profile review
  ├─ Jul 15–28: Develop mapping
  ├─ Jul 29–Aug 11: Create tests
  ├─ Aug 12–25: Documentation
  └─ Aug 26–Sep 2: Review + approval
  └─ ✅ Complete by Sep 2

Initiative Q3-3 (Observability)
  ├─ Jul 8–14: Tempo deployment
  ├─ Jul 15–21: Service mesh (if applicable)
  ├─ Jul 22–28: Grafana dashboards
  ├─ Jul 29–Aug 11: Sampling validation
  └─ Aug 12–19: Documentation
  └─ ✅ Complete by Aug 19

Initiative Q3-4 (FDA Readiness)
  ├─ Aug 1–7: Readiness checklist
  ├─ Aug 8–14: Go/no-go assessment meeting
  └─ Aug 15–21: Package prep (if go) / pivot (if no-go)
  └─ ✅ Complete by Aug 21

Initiative Q3-5 (Dependency Audit)
  ├─ Sep 1–14: Audit + classification
  └─ ✅ Complete by Sep 14

September 15–30: Q3 closure, Q4 planning
  ├─ Compile Q3 assessment report
  ├─ Schedule Q3-2026 compliance review (Oct 1)
  └─ Prepare for Q4 (external audit, Year 3 roadmap)
```

---

## Q3-2026 Success Metrics

| Initiative | Target | Success Criteria |
|------------|--------|-----------------|
| Q3-1 (FMEA) | Quarterly review process active | Baseline FMEA + Q3 review complete + Q4 review scheduled |
| Q3-2 (EHR) | Mapping spec + validation tests | 5+ resources mapped, 10+ tests passing, sandbox verified |
| Q3-3 (Observability) | Tempo + service mesh instrumented | Traces stored 7+ days, dashboards queryable, sampling rules active |
| Q3-4 (FDA) | Go/no-go decision + roadmap pivot | Decision documented, stakeholder aligned, Year 3 path clear |
| Q3-5 (Dependency) | Audit complete, risks identified | All dependencies classified, remediation plan documented |

---

## Q3 Compliance Score Projection

**Baseline (Q2 expected):** 87/100

**Q3 improvements:**
- FMEA formalization (ISO 14971 maturity) → +1 point (audit completeness)
- EHR integration roadmap (regulatory readiness) → +1 point (device pathway clarity)
- Observability Phase 2 (operational maturity) → +0 points (already captured in Phase 9 baseline)
- FDA readiness decision (regulatory positioning) → +0 points (decision clarity, not score impact)
- Dependency audit (supply chain) → +1 point (third-party risk management)

**Q3-2026 Target Score:** 89/100 (from 87)

---

## Critical Decision: End of Q3 (Aug 21)

**FDA Device Pathway: Go or No-Go?**

**If GO (Device Path):**
- Year 3 focus: QMS formalization (ISO 13485), design controls, design history file expansion
- Timeline: FDA pre-submission meeting Q4-2026 or Q1-2027
- Resource commitment: dedicated regulatory affairs, quality assurance
- Success: 510(k) clearance or De Novo approval by Q4-2027

**If NO-GO (Non-Device Path):**
- Year 3 focus: Ecosystem expansion (EHR integration, TEFCA/QHIN readiness, reference implementations)
- No FDA premarket burden; continue existing compliance framework (HIPAA, OpenSSF)
- Resource commitment: developer time for EHR integration, reference ecosystem
- Success: Clinician-ready reference implementations, interoperability standards adoption

**This decision determines Year 3 roadmap.**

---

## Q3 Compliance Review Meeting

**Scheduled:** October 1, 2026 (after Q3 closure)

**Agenda:**
- Q3 initiative completion review (all 5 on track?)
- Compliance score assessment (87 → 89/100 achieved?)
- FDA device pathway decision review (go/no-go rationale)
- Year 3 roadmap approval (device path vs. non-device path)
- Q4-2026 planning (external audit, Year 3 initiation)

**Deliverables:**
- Q3-2026 compliance report + scorecard update
- FDA pathway decision document + Year 3 roadmap
- Q4-2026 execution plan (external audit scope + timing)

---

## Resource & Budget

**Q3-2026 Effort:** ~150 hours (~3.75 FTE-weeks)

| Role | Effort | Initiatives |
|------|--------|------------|
| Compliance Officer (Timothy H.) | 60 hours | Q3-1, Q3-2, Q3-4 |
| Platform Engineering | 60 hours | Q3-3, Q3-5 |
| Domain Experts | 20 hours | Q3-1, Q3-2 |
| **Total** | **150 hours** | **All 5** |

**External Costs:**
- FDA pre-submission meeting (if go): $5k–10k (legal/regulatory consultant)
- EHR vendor sandbox access (if applicable): $0–5k

---

## Approval & Sign-Off

**Q3-2026 Roadmap approved by:**
- Timothy Hartzog (Compliance Officer)
- Platform Engineering Lead
- Domain Experts (clinical context)

**Approval Date:** April 24, 2026  
**Effective Start:** July 1, 2026  
**Target Completion:** September 30, 2026  

---

**Q3-2026 roadmap finalizes institutional maturity and determines regulatory pathway (device vs. non-device). Critical decision point for Year 3 strategy.**

Commit: `[to be created with Q3 detailed plans]`
