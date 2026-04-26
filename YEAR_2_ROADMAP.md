# Year 2 Strategic Roadmap (2026)

**Owner:** Timothy Hartzog, Compliance Officer  
**Baseline:** Q1-2026 Compliance Review (April 24, 2026)  
**Duration:** 12 months (May 2026 – April 2027)  
**Framework:** Driven by compliance scorecard gaps, DORA metrics optimization, and FDA premarket pathway exploration  

---

## Executive Vision

Year 1 (12-week Phase 1–12 sprint) established a **foundational enterprise healthcare platform governance system** compliant with HIPAA, 21 CFR Part 11, and IEC 62304 standards.

Year 2 advances to **external validation, ecosystem integration, and device pathway readiness**:

1. **Eliminate remaining gaps** (provenance backfill, classification decision, post-market procedures)
2. **Formalize quality management system** (FMEA quarterly cycle, external audit preparation)
3. **Expand clinical capabilities** (EHR integration, FHIR ↔ local system mapping, advanced observability)
4. **Assess FDA device pathway** (premarket submission preparation, 510(k) vs. De Novo decision)
5. **Scale multi-region HA** (global failover, TEFCA/QHIN readiness, if expansion planned)

**Success Metrics:**
- ✅ Compliance score ≥90/100
- ✅ Zero critical CVEs in production
- ✅ DORA metrics all maintaining elite-tier performance
- ✅ External audit readiness (SOC 2 Type II or HITRUST CSF candidate)
- ✅ FDA premarket meeting completed (if device pathway proceeds)

---

## Year 2 Quarter Breakdown

### Q2-2026: Completion & Remediation (May – June)

**Theme:** Close Q1 gaps, formalize foundational processes.

#### Q2 Initiatives

**1. SLSA v1 Provenance Backfill** (1 week, High Priority)
- **Goal:** Bring Phase 1–2 releases (5 releases) to 100% SLSA v1 coverage
- **Owner:** Timothy Hartzog
- **Tasks:**
  - Backfill SLSA v1 attestation for Phase 1 & 2 releases via `reusable-slsa-provenance.yml` retroactive run
  - Publish attestations to GitHub attestations API
  - Verify via `gh attestation verify` for each release
- **Artifacts:** 100% Phase 1–2 releases in attestations API
- **Success:** Provenance factor increases from 65% → 90% (+25 points → score 85+)

**2. OpenSSF Scorecard Remediation** (2 weeks, Medium Priority)
- **Goal:** Bring 2 repos below 7.0 target to ≥7.0 rating
- **Owner:** Platform Engineering
- **Repos:** `legacy-content-repo` (6.8/10), `educational-simulation` (6.9/10)
- **Gaps:**
  - Missing GitHub Actions CI (→ add minimal CI workflow)
  - Branch protection minimal (→ require 1 reviewer)
  - No SBOM (→ add SBOM generation to CI)
- **Artifacts:** Updated workflows, branch protection rules, SBOM files
- **Success:** Both repos ≥7.0 by June 30
- **Contingency:** If remediation not viable (e.g., repo truly deprecated), formally mark as "excluded from scorecard" with documented justification

**3. IEC 62304 Classification Decision** (1 week, High Priority)
- **Goal:** Formal safety classification for 3 pending repos
- **Owner:** Timothy Hartzog + Domain Experts
- **Repos:** `legacy-content-repo`, `educational-simulation`, `reference-docs`
- **Process:**
  - Safety assessment meeting (1 hour): Is each repo capable of harming patient health?
  - Classification decision (likely Class A for all: no capability for harm, no traceability required)
  - Document decision in each repo's DHF under `dhf/classification.md`
  - Update GitHub Custom Property `iec62304-class` for each repo
- **Artifacts:** DHF classification docs, custom property updates, meeting minutes
- **Success:** All 3 repos have formal classification by May 31

**4. Chaos Testing Expansion** (2 weeks, Medium Priority)
- **Goal:** Increase chaos testing frequency to close MTBF gap (28.4 → 35+ days)
- **Owner:** Platform Engineering
- **Actions:**
  - Convert `reusable-chaos-test.yml` from weekly to bi-weekly schedule for services with MTBF <30 days
  - Expand chaos scenarios: add 2 new scenarios (database failover, message queue backpressure)
  - Enhance runbooks for each scenario (detection, recovery steps, escalation)
  - Execute 2 chaos runs on schedule; document findings
- **Artifacts:** Updated LitmusChaos manifests, runbooks, execution reports
- **Success:** MTBF improves to ≥30 days by Q3 start (July 1)

**5. Post-Market Surveillance Pilot** (3 weeks, Medium Priority)
- **Goal:** Wire adverse-event templates and complaint tracking into GitHub Issues
- **Owner:** Timothy Hartzog
- **Tasks:**
  - Create `post-market-event.md` issue template with fields: event date, severity, suspected versions, harm, assessment, next review
  - Create `post-market-complaints.jsonl` database schema in `dhf/post-market/`
  - Automation: on issue creation with label `post-market`, append stub to complaints JSONL
  - Set up Slack notification to #compliance-alerts on new post-market events
  - Pilot with 2 mock post-market events to verify workflow
- **Artifacts:** Issue template, automation workflow, sample data
- **Success:** Post-market issue creation → audit log entry ✓ within 5 min for 2 mock events

**6. Maintenance Window Optimization** (1 week, Low Priority)
- **Goal:** Adjust maintenance scheduling to avoid SLO monitoring windows
- **Owner:** Ops Lead (async input)
- **Action:** Publish Q2–Q4 maintenance calendar; align with off-peak periods (e.g., 2–4 AM UTC Sunday)
- **Success:** Zero maintenance-window SLO violations in Q2

**Q2 Deliverables:**
- ✅ SLSA v1 provenance 100% Phase 1–2 releases
- ✅ 2 repos remediated to ≥7.0 OpenSSF Scorecard
- ✅ 3 repos formally classified (IEC 62304)
- ✅ Bi-weekly chaos testing active
- ✅ Post-market surveillance pilot complete
- ✅ Updated maintenance calendar

**Q2 Compliance Score Target:** 87/100 (+5 points from Q1)

---

### Q3-2026: Formalization & Integration (Jul – Sep)

**Theme:** Establish quality management system, explore ecosystem integration.

#### Q3 Initiatives

**1. Risk Management Formalization** (4 weeks, High Priority)
- **Goal:** Establish quarterly Failure Mode & Effects Analysis (FMEA) review cycle per ISO 14971
- **Owner:** Timothy Hartzog + Domain Experts
- **Process:**
  - Baseline FMEA: document all known failure modes for clinical repos (dose calculation, patient ID mismatch, chart lookup errors, network timeouts)
  - Risk matrix: severity × probability → risk level
  - Risk controls: code-level controls, testing controls, UI controls, documentation controls
  - Residual risk assessment: after controls applied, is risk acceptable?
  - Quarterly review: any new failure modes? Any controls degrading? Residual risk still acceptable?
- **Artifacts:** FMEA spreadsheet (modes, effects, controls, residual risk), quarterly review meeting minutes
- **Success:** Completed Q3 baseline FMEA + first quarterly review by Sep 30
- **Integration:** Link FMEA to hazard-analysis.yaml in DHF; traceability.yml validates FMEA coverage

**2. EHR Integration Framework** (6 weeks, High Priority)
- **Goal:** Define FHIR → local system bidirectional mapping for clinical repos
- **Owner:** Timothy Hartzog + Clinical Domain Expert
- **Scope:** (Applies if PedNeoSim.jl or pediatric-cds interfaces with real EHR in Year 2 or 3)
- **Tasks:**
  - Document FHIR US Core 6.1 profiles used by each clinical repo
  - Define mapping: FHIR Observation (lab value) → local variable (serum creatinine mg/dL)
  - Identify impedance mismatches (e.g., FHIR dates are ISO 8601; local system may use epoch seconds)
  - Create FHIR ↔ local validation tests for each mapping
  - Plan EHR connectivity testing (sandbox EHR API, not production)
- **Artifacts:** Mapping documentation, test cases, sandbox integration plan
- **Success:** Mapping doc complete, 5+ validation tests written by Aug 31
- **Note:** Actual EHR connection deferred to Year 3 (pending device pathway decision)

**3. Advanced Observability Phase 2** (5 weeks, Medium Priority)
- **Goal:** Instrument service mesh (if K8s Istio deployed) and Tempo distributed tracing for multi-service visibility
- **Owner:** Platform Engineering
- **Tasks:**
  - Deploy Tempo (if not already) for long-term trace storage (vs. Jaeger development-only)
  - Wire Tempo to OpenTelemetry SDK as default production exporter
  - Add service mesh sidecar instrumentation (if Istio deployed): capture request/response metrics
  - Create Grafana dashboard: service dependency graph, inter-service latency, error rates across boundaries
  - Establish trace sampling SLO: 100% errors, 1% success, 10% high-latency (already defined in Phase 9; verify in production)
- **Artifacts:** Tempo deployment, sidecar config, Grafana dashboard, sampling rules
- **Success:** Tempo in production + 1 dashboard deployed by Aug 31

**4. FDA Premarket Readiness Assessment** (3 weeks, High Priority)
- **Goal:** Conduct internal readiness review for FDA premarket submission (if device pathway proceeds)
- **Owner:** Timothy Hartzog (Compliance Officer)
- **Process:**
  - Decision point: Does PedNeoSim.jl or pediatric-cds meet criteria for FDA device submission?
    - Criteria: capable of making clinical decisions, intended for use in clinical setting, required to ensure safety/effectiveness
  - If yes: prepare FDA premarket package
    - Summary of Software Controls & Compliance (SSCC) document
    - Traceability matrix (IEC 62304 §7)
    - SBOM + VEX documents
    - Cybersecurity risk assessment (FDA 2023 guidance)
    - FHIR conformance evidence (US Core 6.1)
    - Signed provenance attestations (SLSA v1)
    - Audit trail summary (12-month sample)
  - If no: defer to Year 3 or out-of-scope; document decision in meeting minutes
- **Artifacts:** Readiness assessment report, go/no-go decision, premarket package (if go)
- **Success:** Decision documented by Aug 15; if go, premarket package draft by Sep 30
- **FDA Action:** If ready, schedule pre-submission meeting with FDA (typically 1–2 month lead time)

**5. Third-Party Dependency Audit** (2 weeks, Low Priority)
- **Goal:** Formal assessment of all third-party dependencies for HIPAA/FDA suitability
- **Owner:** Platform Engineering + Compliance Officer
- **Process:**
  - Audit all dependencies in clinical repos (PedNeoSim.jl, pediatric-cds, audit-service)
  - For each dependency: vendor name, license, security posture (SBOM available?), update cadence, known CVEs
  - Classify: "approved" (vendor has BAA or HIPAA compliance statement), "requires review" (no vendor statement, but low-risk), "prohibited" (GPL, no vendor support, or security concerns)
  - Document in `policies/dependencies.md`
  - Flag any "requires review" or "prohibited" deps for remediation or vendor assessment
- **Artifacts:** Dependency audit spreadsheet, classification policy, remediation plan
- **Success:** Audit complete, policy published, any high-risk deps flagged for Q4 remediation

**Q3 Deliverables:**
- ✅ FMEA baseline + Q3 quarterly review
- ✅ EHR integration mapping documented + tested
- ✅ Tempo + advanced observability in production
- ✅ FDA premarket readiness decision + package (if go)
- ✅ Third-party dependency audit complete

**Q3 Compliance Score Target:** 89/100 (+2 points from Q2)

---

### Q4-2026: External Validation & Long-Term Planning (Oct – Dec)

**Theme:** Prepare for external audit, plan Year 3 expansion, strategic decisions.

#### Q4 Initiatives

**1. SOC 2 Type II or HITRUST CSF Audit Prep** (8 weeks, High Priority)
- **Goal:** Prepare organization for external compliance audit (SOC 2 or HITRUST)
- **Owner:** Timothy Hartzog (Compliance Officer)
- **Process:**
  - Select audit body: Big 4 accounting firm (SOC 2) or HITRUST assessor
  - Gap assessment: compare current controls to audit framework requirements
  - Evidence collection: gather documentation, logs, signed records, test results
  - Remediation: address any gaps found
  - Audit execution: 2–3 week audit period (typically Nov–Dec)
  - Post-audit: remediation of any findings
- **Expected Outcomes:**
  - SOC 2 Type II report (covers security, availability, confidentiality for 12-month period)
  - OR HITRUST CSF certification (higher-bar, more comprehensive, more expensive)
- **Success:** Audit initiated by Oct 15; findings documented by Dec 31
- **Note:** Actual report delivery may extend into Q1-2027

**2. Multi-Region HA Design** (6 weeks, Medium Priority, if expansion planned)
- **Goal:** Plan multi-region active-active failover architecture
- **Owner:** Platform Engineering
- **Applies If:** Organization plans to expand to multi-region deployment (not confirmed yet; depends on device pathway decision)
- **Scope:**
  - Database replication (PostgreSQL streaming replication to standby region)
  - Load balancing: geo-routing with health checks
  - Audit log distribution: replicate signed chain to warm storage in second region (S3 Object Lock)
  - Testing: chaos experiment across regions (network partition, region failure)
  - RTO/RPO: design for <5 min RTO, <1 min RPO for mission-critical services
- **Artifacts:** Architecture diagram, Terraform IaC, runbooks, chaos experiment scenarios
- **Success:** Design document + IaC drafted by Nov 30; pilot deployment plan for Q1-2027

**3. AI/ML Governance Framework** (4 weeks, Medium Priority, if AI/ML planned)
- **Goal:** Establish PCCP, model cards, drift detection for any AI/ML-enabled clinical components
- **Owner:** Timothy Hartzog + ML Domain Expert (if applicable)
- **Applies If:** Organization pursues AI/ML-enabled device (e.g., predictive growth curves, ML-assisted diagnosis)
- **Components:**
  - **PCCP (Predetermined Change Control Plan):** Define which model updates require FDA premarket review vs. postmarket change
  - **Model Card:** Document model training data, performance metrics, limitations, intended use
  - **Drift Detection:** Monitor model performance in production; alert if accuracy <95% baseline
  - **Retraining Workflow:** Procedure to collect new data, retrain, validate, deploy
  - **Validation Testing:** Performance metrics on held-out test set ≥95% accuracy
- **Artifacts:** PCCP document, model card template, drift detection dashboard, retraining playbook
- **Success:** Framework documented by Dec 15; if models exist, pilot drift detection by year-end

**4. Year 3 Strategic Planning** (4 weeks, High Priority)
- **Goal:** Assess device pathway decision, plan Year 3 focus areas
- **Owner:** Timothy Hartzog (Compliance Officer)
- **Decision Points:**
  - **Device Pathway Decision:** Pursue FDA 510(k) / De Novo for PedNeoSim.jl or pediatric-cds?
    - If yes: Year 3 focus on premarket submission, QMS formalization (ISO 13485), external audit completion
    - If no: Year 3 focus on ecosystem expansion (EHR integration, TEFCA/QHIN, multi-region, reference implementations)
  - **Team Expansion:** Will hiring happen? If so, onboarding training plan, governance delegation
  - **Long-Term Vision (Year 4+):** Market positioning, international expansion (Canada, EU CE mark?), PSO enrollment
- **Artifacts:** Strategic decision document, Year 3 roadmap (quarterly breakdown), resource/budget plan
- **Success:** Decision documented, Year 3 roadmap published by Dec 31

**5. Post-Market Surveillance Go-Live** (3 weeks, Medium Priority)
- **Goal:** Transition post-market surveillance from pilot to operational status
- **Owner:** Timothy Hartzog
- **Actions:**
  - Finalize adverse-event issue template and automation
  - Train team on post-market event classification and escalation
  - Integrate with quality management system (FMEA feedback loop)
  - Establish post-market monthly review meeting cadence
  - Document post-market procedures in DHF (`dhf/post-market/procedures.md`)
- **Artifacts:** Operational runbooks, team training, monthly review minutes
- **Success:** First monthly post-market review completed by Dec 31

**Q4 Deliverables:**
- ✅ SOC 2 Type II / HITRUST audit initiated + in progress
- ✅ Multi-region HA design document (if expansion planned)
- ✅ AI/ML governance framework (if applicable)
- ✅ Year 3 strategic roadmap published
- ✅ Post-market surveillance go-live

**Q4 Compliance Score Target:** 91/100 (+2 points from Q3)

---

## Year 2 Success Metrics

| Metric | Q1 Baseline | Year 2 Target | Status Path |
|--------|------------|--------------|------------|
| Compliance Score | 82.5/100 | ≥91/100 | Q2: 87, Q3: 89, Q4: 91 |
| Critical CVEs | 0 | 0 | Maintain zero through vulnerability scanning |
| Deployment Frequency | 2.3/week | ≥2/week | Sustain elite-tier pace |
| Lead Time | 4.2 days | ≤7 days | Maintain or improve |
| Change Failure Rate | 3.8% | ≤15% | Maintain elite-tier <5% |
| MTTR | 67 min | ≤2h | Maintain <2h |
| MTBF | 28.4 days | ≥30 days | Improve via chaos testing |
| OpenSSF Scorecard | 8.2/10 (2 repos below 7.0) | All ≥7.0 | Remediate 2 repos in Q2 |
| Provenance Coverage | 65% | 95%+ | Backfill Phase 1–2 in Q2 |
| SBOM Staleness | 18 days | <14 days | Increase update frequency |
| External Audit | None | SOC 2 Type II initiated | Execute audit in Q4 |
| FDA Readiness | Phase 2 (premarket ready) | Phase 2–3 (premarket or out-of-scope decision) | Readiness review in Q3 |

---

## Strategic Decision Checkpoints

### Checkpoint 1: End of Q2 (June 30, 2026)
- ✅ All Q1 compliance gaps closed (provenance, OpenSSF, classification)?
- → **If yes:** Proceed to Q3 formalization
- → **If no:** Extend Q3 remediation, adjust Year 2 timeline

### Checkpoint 2: End of Q3 (Sep 30, 2026)
- ✅ FDA premarket readiness assessment complete?
- → **If device pathway:** Proceed to Q4 audit prep + premarket package
- → **If non-device:** Proceed to Year 3 ecosystem expansion + reference implementations

### Checkpoint 3: End of Q4 (Dec 31, 2026)
- ✅ External audit initiated (SOC 2 Type II / HITRUST)?
- ✅ Year 3 strategic roadmap finalized?
- → **If yes:** Proceed to Year 3 execution
- → **If external audit delayed:** Set Year 1-2027 priority to complete it

---

## Resource & Budget Implications

### Estimated Year 2 Effort

| Phase | Effort (person-hours) | Owner | Q Allocation |
|-------|----------------------|-------|-------------|
| Q2 Gap Remediation | 120 | Timothy + Eng Team | Q2 |
| Q3 Formalization | 160 | Timothy + Domain Experts | Q3 |
| Q4 External Audit + Planning | 180 | Timothy + External Auditor | Q4 |
| **Total** | **460** | | **~11 weeks FTE** |

### External Costs (if applicable)

- **SOC 2 Type II Audit:** $15k–25k (Big 4 firm)
- **HITRUST CSF Certification:** $25k–50k (more comprehensive, longer timeline)
- **FDA Pre-Submission Meeting:** $5k–10k (legal + regulatory consultant)
- **EHR Sandbox Access:** $0–5k (vendor-dependent; often free for testing)

**Total estimated external costs:** $20k–80k (depending on audit choice and FDA pathway)

---

## Year 2 Roadmap Summary

**Theme:** From foundational governance → external validation + ecosystem integration

**Key Milestones:**
- Q2: Gap closure (SLSA, OpenSSF, classification, post-market)
- Q3: Quality management system formalization (FMEA, EHR integration, advanced observability)
- Q4: External audit preparation + Year 3 planning

**Critical Path:**
1. Provenance backfill (5 days) → Compliance score improves
2. IEC 62304 classification decision (3 days) → Clinical repos finalized
3. Post-market surveillance pilot (10 days) → Operational readiness
4. FDA readiness assessment (10 days) → Device pathway decision
5. External audit initiation (4 weeks of prep) → Q4 execution

**Success Definition:**
- ✅ Compliance score ≥91/100
- ✅ Zero critical CVEs maintained
- ✅ DORA metrics elite-tier sustained
- ✅ External audit initiated (SOC 2 or HITRUST)
- ✅ FDA premarket package ready (if device pathway) OR Year 3 ecosystem roadmap finalized (if non-device)

---

**Approved by:** Timothy Hartzog, Compliance Officer  
**Date:** April 24, 2026  
**Next Review:** Q2-2026 midpoint (June 15, 2026) for progress checkpoint
