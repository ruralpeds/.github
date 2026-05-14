# Consolidated Gap Analysis Dashboard

*Last Updated: 2026-05-14*

This document tracks all built and missing features (gaps) across all projects in the `ruralpeds` organization.

## Summary Table

| Repository | Missing Features (Active Gaps) | Built Features (Completed Gaps) |
|---|---|---|
| `Cds_core` | 4 | 0 |
| `graph_creation` | 4 | 0 |
| `document_cleaner` | 4 | 0 |
| `Graphmaster` | 4 | 0 |
| `Policyforge` | 4 | 0 |
| `agent-based-modeling` | 4 | 0 |
| `theograph` | 29 | 0 |
| `rust-sci-core` | 17 | 6 |
| `Juliasim` | 4 | 0 |
| `Peds` | 195 | 4 |
| `Julia-clinical` | 4 | 0 |
| `Julia-ai-notebook` | 4 | 0 |
| `PedsEdu-Jl` | 4 | 0 |
| `Hospital-economics` | 10 | 2 |
| `Rural-quality-julia` | 0 | 4 |
| `Patient-simulation-julia` | 4 | 0 |
| `Graphmaster-julia` | 29 | 11 |
| `Geo-julia` | 12 | 0 |
| `Evidence-based-julia` | 11 | 7 |
| `biostatistics-textbook-julia` | 4 | 0 |
| `.github` | 117 | 42 |
| `rural-hospital-modeling-julia-master` | 258 | 1 |
| `Textbook` | 4 | 0 |
| `WeatherMed.jl` | 83 | 0 |
| `Data-ingestion` | 8 | 1 |
| `biostatistics` | 5 | 4 |
| `Agents-julia` | 4 | 0 |
| `biostatistics-rust` | 33 | 0 |
| `Decision-trees-rust` | 4 | 0 |
| `data-injection-rust` | 4 | 0 |

---

## 📦 Repository: Cds_core

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: graph_creation

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: document_cleaner

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: Graphmaster

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: Policyforge

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: agent-based-modeling

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: theograph

### 🔴 Missing Features (Active Gaps)
#### 🟡 Minor Issues


#### # 1.5 Sparse Inline Documentation
- **Status:** 10/11 crates have lib-level doc comments (90%), but content depth varies
- **Examples of gaps:**
  - `theograph-db`: NativeGraphStore internals undocumented
  - `theograph-sci`: Force-directed layout algorithm lacks explanation
  - `theograph-wasm`: WASM binding strategy unclear


#### # 1.6 No Architecture Documentation
- **Content Needed:**
  - Data flow diagram (Bible text → ingestion → graph → API → frontend)
  - Database schema (SurrealDB + NativeGraphStore)
  - Module dependency graph
  - Performance bottlenecks and optimization strategies
  - Security model (authentication, authorization, input validation)

---


#### # 2.2 No Frontend Test Suite
- **Status:** No test output in frontend package.json scripts
- **Currently defined:** `"test": "vitest run"` but no test files found
  - Component unit tests
  - Route navigation tests
  - API client tests
  - Store/state management tests
  - Visual regression tests


#### # 2.3 No Python Service Tests
- **Status:** No tests for NLP/LLM services
  - Unit tests for LLM extractor
  - Integration tests with Anthropic API
  - Data loader validation tests
  - Service health/robustness tests


#### 🟡 Medium Issues


#### # 2.4 Incomplete Unit Test Coverage
- **Status:** Tests exist for core logic but coverage is uneven
- **Examples:**
  - ✅ `theograph-lexicon`: Morphology parser has tests
  - ✅ `theograph-search`: Tokenizer and embedding have tests
  - ✅ `theograph-ingest`: Key modules tested
  - ❌ `theograph-server`: Routes not tested
  - ❌ `theograph-models`: No edge/node type tests
  - ❌ `theograph-query`: Builder logic untested


#### # 2.5 No Performance Tests
- **Impact:** Cannot detect performance regressions
  - Graph traversal performance benchmarks
  - Search index performance tests
  - Large dataset loading tests
  - Memory profiling for WASM modules


#### # 2.6 No Test Documentation
- **Content Needed:**
  - How to run tests locally
  - CI/CD test pipeline explanation
  - Adding new tests (best practices)
  - Test data setup/fixtures

---


#### # 3.2 No Input Validation Documentation
- **Status:** Unclear requirements for API inputs
  - Query parameter validation rules
  - Limits (max result size, max query depth, etc.)
  - Character encoding requirements
  - Date/time format specifications
  - OSIS ID format documentation


#### # 3.3 No Rate Limiting / Authentication
- **Status:** No apparent security controls
  - API key/token authentication
  - Rate limiting configuration
  - CORS policy documentation
  - Input sanitization strategy
  - SQL injection prevention verification (using SurrealQL)


#### 🟡 Medium Issues


#### # 3.4 Incomplete Error Messages
- **Status:** Some error handling is too generic
- **Examples:**
  - Server returns generic "error" fields without actionable detail
  - SurrealQL errors may leak database details to frontend


#### # 3.5 No API Changelog
- **Content Needed:**
  - Version history (v1.0 release date, features)
  - Breaking changes log
  - Deprecation policy

---


#### # 4.2 No Configuration Validation
- **Solution:** Add startup checks that validate config before binding HTTP server


#### # 4.3 Database Configuration is Docker-Only
- **Status:** SurrealDB credentials hardcoded (`root:root`)
- **Issue:** No way to configure for non-Docker deployments

---


#### # 5.2 Incomplete Deployment Pipeline
- **Status:** deploy.yml exists but appears to publish to GitHub Pages (frontend only)
  - Backend deployment process
  - Database initialization on new deployment
  - Zero-downtime deployment strategy
  - Rollback procedures
  - Health checks beyond docker healthchecks


#### # 5.3 Database Migration Strategy Unclear
- **Status:** No documented migration process
- **Current approach:** JSON import on startup
  - How to add new data post-deployment
  - Schema evolution strategy (if using SurrealDB tables)
  - Data versioning
  - Backup/restore procedures


#### 🟡 Medium Issues


#### # 5.4 No Production Readiness Checklist
- **Content Needed:**
  - Security hardening steps
  - Performance tuning recommendations
  - Monitoring/alerting setup
  - Log aggregation strategy
  - Compliance considerations (GDPR, accessibility)


#### # 5.5 Docker Image Not Optimized
- **Status:** Multi-stage build used but not fully optimized
- **Issues:**
  - WASM modules may not be pre-compiled
  - Rust incremental builds not leveraged in CI

---


#### # 6.2 Limited Error Handling in Frontend
- **Status:** ErrorBoundary component exists but error recovery unclear
  - Fallback UI for API failures
  - Retry logic for failed requests
  - User-facing error messages (currently may show raw errors)
  - Offline mode handling


#### # 6.3 No Accessibility Documentation
- **Status:** Unknown compliance level
  - WCAG 2.1 level compliance target
  - Screen reader testing
  - Keyboard navigation testing
  - Color contrast verification

---


#### # 7.2 No Data Versioning
- **Status:** Unclear how to track data updates
  - Version numbering scheme
  - Changelog tracking
  - Schema versioning


#### # 7.3 Ingestion Pipeline Lacks Visibility
- **Status:** NLP ingestion pipeline exists but monitoring unclear
  - Progress tracking for long-running imports
  - Failure recovery procedures
  - Audit logs for what was imported/modified
  - Input sanitization (HTML, special characters)

---


#### # 8.2 No Performance Targets
- **Status:** No documented SLAs
  - API response time targets
  - Throughput expectations
  - Graph traversal performance targets
  - Search latency targets

- **Status:** No documentation on scalability
  - Estimated resource usage (CPU, RAM, disk)
  - Bottleneck analysis
  - Scaling strategies (horizontal, vertical)
  - Caching strategy documentation

---


#### # 9.2 No Version Management
- **Status:** All crates at 0.1.0
  - Semver versioning strategy
  - Release process documentation
  - Breaking change policy


#### # 9.3 Limited Code Organization in routes.rs
- **Status:** 1,687-line routes.rs file
- **Impact:** Hard to maintain, difficult to navigate
- **Suggestion:** Could be split into multiple module files by domain

---


#### # 10.2 Dependencies Not Audited
- **Status:** Large cargo ecosystem, audit unclear
  - `cargo audit` in CI/CD
  - Dependency update policy
  - Security advisory response process

---


### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: rust-sci-core

### 🔴 Missing Features (Active Gaps)
#### TIER 1: Critical Gaps (Must-Have for Rural Hospital Modeling)


#### # 1.1 Facility Type Classification
**What's needed:**
```rust
pub enum FacilityType {
    CriticalAccessHospital,          // CAH: 25 beds, 101% cost-based
    RuralEmergencyHospital,          // REH: 50 beds, ≤24h ALOS, monthly payment + 105% OPPS
    RuralReferralCenter,             // RRC: IPPS with rural wage index
    SoleCommunityHospital,           // SCH: IPPS with hospital-specific rate
    InpatientProspectivePayment,     // IPPS: Standard DRG-based
    Long_TermAcuteCareHospital,      // LTACH: Different DRG model
    PsychiatricHospital,             // Psych-specific
}

pub struct FacilityDesignation {
    facility_type: FacilityType,
    bed_count: BedCount,
    rural_location: bool,
    state_designation_date: Option<Date>,
    distance_from_nearest_hospital: Option<f64>,  // miles
    population_served: Option<u64>,
}
```

**Why important:**
- Different reimbursement models apply to different facility types
- CAH exemptions from quality programs only apply to designated CAHs
- REH has unique constraints (24-hour ALOS, no acute inpatient)
- REH-CAH conversion affects program eligibility (especially 340B)

**Impact:** Without this, all downstream calculations assume generic "hospital" — can't model CAH vs. REH scenarios.

---


#### # 1.2 CAH Cost-Based Reimbursement Model
**What's needed:**

```rust
/// CAH Reimbursement: 101% of reasonable and allowable costs
/// (Currently: 99% due to sequestration since 2013)
pub struct CAHCostBasedReimbursement {
    /// Total allowed costs for the cost reporting period
    pub allowed_costs: Currency,
    /// Reimbursement rate (1.01 pre-sequestration, 0.99 actual)
    pub reimbursement_rate: f64,
    /// Sequestration reduction (0.02 = 2% reduction)
    pub sequestration_rate: f64,
    /// Final Medicare payment
    pub medicare_payment: Currency,
}

impl CAHCostBasedReimbursement {
    /// Calculate CAH reimbursement with sequestration
    pub fn calculate(
        allowed_costs: Currency,
        sequestration_pct: f64,  // typically 0.02
    ) -> Self {
        let base_rate = 1.01;
        let adjusted_rate = base_rate * (1.0 - sequestration_pct);  // 0.99
        let payment = allowed_costs * adjusted_rate;
        
        Self {
            allowed_costs,
            reimbursement_rate: adjusted_rate,
            sequestration_rate: sequestration_pct,
            medicare_payment: payment,
        }
    }
}

/// CAH Bad Debt Reimbursement
pub struct CAHBadDebtAllowance {
    /// Amount of Medicare bad debt
    pub bad_debt: Currency,
    /// Percentage of net patient revenue
    pub as_pct_of_npr: f64,
    /// Average CAH bad debt: ~$154K or 0.4% of NPR
    /// (Higher than non-rural: 0.2% of NPR)
}

/// CAH Eligible costs by category
pub struct CAHCostReport {
    pub inpatient_acute_costs: Currency,
    pub swing_bed_costs: Currency,
    pub outpatient_costs: Currency,
    pub ambulance_costs: Option<Currency>,
    pub bad_debt: Currency,
    pub total_allowed_costs: Currency,
}
```

**Why important:**
- CAHs don't use DRG-based IPPS; they get reimbursed on actual costs
- Cost accounting is fundamental to CAH viability
- 99% (not 101%) reimbursement rate due to sequestration is different from advertised
- Bad debt reimbursement is ~0.4% of revenue for CAHs (higher than others)

---


#### # 1.3 REH Payment Model (Monthly Facility Payment + Enhanced OPPS)
**What's needed:**

```rust
/// REH (Rural Emergency Hospital) Reimbursement
/// Created by 2020 CHRONIC Act, effective 2021
pub struct REHPayment {
    /// Fixed monthly facility payment (CY2025: $285,625.90/month)
    pub monthly_facility_payment: Currency,
    /// OPPS services enhanced rate (105% vs. standard OPPS)
    pub opps_enhancement_rate: f64,  // 1.05
    /// Monthly recurring payment + service-based revenue
}

impl REHPayment {
    /// Calculate monthly facility payment with annual update
    pub fn monthly_facility_payment_cy_2025() -> Currency {
        Currency::try_new(285_625.90).unwrap()
    }

    /// Calculate OPPS service reimbursement (105% of standard rate)
    pub fn opps_service_payment(
        standard_opps_rate: Currency,
    ) -> Currency {
        standard_opps_rate * 1.05  // 5% enhancement
    }

    /// Annual total revenue estimate
    pub fn annual_revenue_estimate(
        monthly_facility: Currency,
        annual_opps_volume: Currency,
    ) -> Currency {
        (monthly_facility * 12.0) + annual_opps_volume
    }
}

/// REH Operational Constraints
pub struct REHConstraints {
    /// Average length of stay < 24 hours (observation/emergency only)
    pub max_average_los_hours: f64,  // < 24
    /// Cannot provide acute care inpatient services
    pub no_acute_inpatient: bool,
    /// 24-hour emergency department required
    pub emergency_24h_required: bool,
    /// Bed count limit
    pub max_beds: u32,  // 50
    /// Must have transfer agreement with Level I or II trauma center
    pub trauma_transfer_required: bool,
}
```

**Why important:**
- REH is fundamentally different from CAH in payment model (fixed monthly vs. cost-based)
- REH is newer (2021), rapidly growing rural hospital option
- REH has unique operational constraints (no acute inpatient, <24h ALOS)
- REH doesn't get 340B eligibility (critical gap vs. CAH)

---


#### # 1.4 Cost Accounting System (Step-Down Allocation)
**What's needed:**

```rust
/// Service department (indirect cost center)
pub struct ServiceDepartment {
    pub name: String,
    pub direct_costs: Currency,
    pub allocation_method: AllocationMethod,
}

/// Production department (revenue-generating)
pub struct ProductionDepartment {
    pub name: String,
    pub direct_costs: Currency,
    pub allocation_base: AllocationBase,  // bed days, charges, FTE, etc.
}

pub enum AllocationMethod {
    ByCharges,      // Allocate based on charges
    ByBedDays,      // By inpatient bed days
    ByFTE,          // By full-time equivalents (staffing)
    BySquareFeet,   // By facility space
    ByDirectCosts,  // By other departments' direct costs
}

pub enum AllocationBase {
    TotalCharges,
    BedDays,
    PatientDays,
    Procedures,
    FTE,
    SquareFeet,
}

/// Step-down cost allocation (sequential method)
/// Service departments allocated in descending cost order
/// Each department allocated once, then receives no further allocations
pub struct StepDownAllocation {
    /// Service departments in allocation order (highest cost first)
    pub service_depts_ordered: Vec<ServiceDepartment>,
    /// Production departments receiving allocations
    pub production_depts: Vec<ProductionDepartment>,
    /// Intermediate allocation matrix
    pub allocation_matrix: Vec<Vec<f64>>,
    /// Final allocated costs by production department
    pub final_allocated_costs: Vec<Currency>,
}

impl StepDownAllocation {
    /// Execute step-down allocation
    pub fn allocate(&self) -> Result<AllocationResult, CostError> {
        // 1. Allocate service dept 1 to all others
        // 2. Allocate service dept 2 (excluding 1) to remaining
        // 3. Continue until all service depts allocated
        // 4. Result: each production dept has total allocated cost
        todo!()
    }
}

/// Ratio of Cost to Charges (RCC) for OPPS calculation
/// RCC = Total cost / Total charges
pub struct RatioOfCostToCharges {
    pub department_costs: Currency,
    pub department_charges: Currency,
    pub rcc: f64,  // ratio
}

impl RatioOfCostToCharges {
    pub fn calculate(costs: Currency, charges: Currency) -> Self {
        let rcc = costs.value() / charges.value();
        Self {
            department_costs: costs,
            department_charges: charges,
            rcc,
        }
    }

    /// Apply RCC to derive cost from charge
    pub fn cost_from_charge(&self, charge: Currency) -> Currency {
        charge * self.rcc
    }
}
```

**Why important:**
- CAH cost-based reimbursement requires detailed cost accounting
- Step-down is Medicare standard for hospital cost allocation
- RCC methodology needed for Medicare cost reports
- Required to justify 101% cost-based reimbursement claims

---


#### TIER 2: Operational Gaps (Important for CAH/REH Modeling)


#### # 2.1 Operating Metrics (Bed Utilization, Occupancy, Census)
**What's needed:**

```rust
pub struct BedUtilizationMetrics {
    /// Licensed/certified beds
    pub licensed_beds: BedCount,
    /// Average daily census (patients in hospital on average day)
    pub average_daily_census: f64,
    /// Occupancy rate = ADC / licensed beds
    pub occupancy_rate: f64,
    /// Average length of stay (for acute beds)
    pub average_los_days: f64,
    /// Discharges per day (inpatient)
    pub daily_discharges: f64,
}

impl BedUtilizationMetrics {
    /// Calculate occupancy rate
    pub fn occupancy_rate(adc: f64, licensed_beds: u32) -> f64 {
        adc / licensed_beds as f64
    }

    /// Calculate discharges per day from ALOS and ADC
    pub fn discharges_per_day(adc: f64, los_days: f64) -> f64 {
        adc / los_days
    }

    /// CAH-specific: verify ALOS constraint (must be ≤ 96 hours)
    pub fn validate_cah_alos_constraint(&self) -> Result<(), CAHError> {
        let los_hours = self.average_los_days * 24.0;
        if los_hours <= 96.0 {
            Ok(())
        } else {
            Err(CAHError::AlosExceedsLimit { actual: los_hours })
        }
    }

    /// REH-specific: verify ALOS constraint (must be < 24 hours)
    pub fn validate_reh_alos_constraint(&self) -> Result<(), REHError> {
        let los_hours = self.average_los_days * 24.0;
        if los_hours < 24.0 {
            Ok(())
        } else {
            Err(REHError::AlosExceedsLimit { actual: los_hours })
        }
    }
}

pub struct SwingBedMetrics {
    /// Swing beds (count toward 25-bed CAH limit)
    pub swing_bed_count: BedCount,
    /// Average daily census in swing beds
    pub swing_adc: f64,
    /// Average length of stay for swing bed patients (SNF-level)
    pub swing_los_days: f64,
    /// Swing bed occupancy rate
    pub swing_occupancy_rate: f64,
}

/// Patient-mix modeling
pub struct CaseMixAnalysis {
    /// Average DRG relative weight (case mix index)
    pub case_mix_index: CaseMixIndex,
    /// Distribution of high-risk vs. routine cases
    pub case_type_distribution: CaseTypeDistribution,
    /// Comorbidity profile of patient population
    pub comorbidity_profile: ComorbidityProfile,
}

pub enum CaseType {
    Routine,
    HighRisk,
    Specialty,
    Transfer,
}

pub struct CaseTypeDistribution {
    pub routine_pct: f64,
    pub high_risk_pct: f64,
    pub specialty_pct: f64,
    pub transfer_pct: f64,
}
```

**Why important:**
- CAHs are constrained to 96-hour average ALOS; must monitor compliance
- REHs must maintain <24-hour average ALOS (no acute inpatient)
- Swing bed operations are key CAH revenue driver
- Case mix affects reimbursement (even in cost-based model, affects volume)

---


#### # 2.2 Rural-Specific Financial Metrics
**What's needed:**

```rust
/// Distance-based adjustments (rural hospitals)
pub struct RuralDistanceAdjustment {
    /// Distance from nearest hospital (miles)
    pub distance_miles: f64,
    /// CAH qualifier: must be 35+ miles on primary roads OR 15+ in mountains
    pub meets_cah_distance_requirement: bool,
    /// REH qualifier: rural location only
    pub rural_location: bool,
}

/// 340B Drug Pricing Program Participation
pub struct Drug340BProgram {
    /// CAHs are fully eligible for 340B program
    pub eligible: bool,
    /// Average savings: 25-50% on pharmaceuticals
    pub estimated_savings_rate: f64,  // 0.25 to 0.50
    /// Annual pharmaceutical cost
    pub annual_pharma_cost: Currency,
    /// Annual 340B savings
    pub annual_340b_savings: Currency,
    /// Critical note: REHs are NOT eligible for 340B
    pub rej_340b_ineligible: bool,
}

impl Drug340BProgram {
    pub fn calculate_savings(
        pharma_cost: Currency,
        savings_rate: f64,
    ) -> Currency {
        pharma_cost * savings_rate
    }

    /// Financial impact of CAH→REH conversion (loses 340B)
    pub fn conversion_impact(annual_pharma_cost: Currency) -> Currency {
        // Average savings lost: 25-50%, assume 37.5%
        annual_pharma_cost * 0.375
    }
}

/// CAH-specific supplemental payments
pub struct CAHSupplementalPayments {
    /// 100% outlier adjustment (unique to CAHs)
    pub outlier_adjustment: Option<Currency>,
    /// Medicare bad debt reimbursement (~0.4% of NPR)
    pub bad_debt_allowance: Currency,
    /// Potential GME (graduate medical education) adjustment
    pub gme_adjustment: Option<Currency>,
    /// DSH (disproportionate share) - typically minimal for CAHs
    pub dsh_adjustment: Option<Currency>,
}

/// Rural Hospital Financial Vulnerability Index
pub struct RuralFinancialVulnerability {
    /// Operating margin percentage
    pub operating_margin: f64,
    /// Days cash on hand
    pub days_cash_on_hand: f64,
    /// Debt-to-patient-revenue ratio
    pub debt_to_revenue_ratio: f64,
    /// Vulnerability score (0-100, higher = more vulnerable)
    pub vulnerability_score: u8,
}

impl RuralFinancialVulnerability {
    pub fn calculate_vulnerability(&self) -> u8 {
        // Composite metric based on margin, liquidity, leverage
        let margin_score = if self.operating_margin > 0.02 { 20 } else { 0 };
        let liquidity_score = if self.days_cash_on_hand > 40.0 { 20 } else { 0 };
        let leverage_score = if self.debt_to_revenue_ratio < 2.0 { 20 } else { 0 };
        (margin_score + liquidity_score + leverage_score) as u8
    }
}
```

**Why important:**
- 340B program savings are "vital" to CAH financial health (25-50% pharma savings)
- REH conversion eliminates 340B eligibility — major financial impact
- Rural locations qualify for distance-based adjustments and federal support
- Bad debt is higher for rural hospitals (0.4% vs. 0.2%)

---


#### # 2.3 CAH-to-REH Conversion Analysis
**What's needed:**

```rust
/// Financial impact analysis: CAH vs. REH designation
pub struct ConversionAnalysis {
    /// Current CAH financial metrics
    pub current_cah_metrics: CAHMetrics,
    /// Projected REH metrics
    pub projected_reh_metrics: REHMetrics,
    /// Financial impact (negative = worse under REH)
    pub incremental_impact: ConversionImpact,
}

pub struct CAHMetrics {
    /// Cost-based reimbursement (99% actual)
    pub base_medicare_payment: Currency,
    /// 340B program savings
    pub drug_340b_savings: Currency,
    /// Allowed bad debt reimbursement
    pub bad_debt: Currency,
    /// Acute care bed revenue
    pub acute_care_revenue: Currency,
    /// Swing bed revenue
    pub swing_bed_revenue: Currency,
    pub total_medicare_revenue: Currency,
}

pub struct REHMetrics {
    /// Fixed monthly facility payment ($285,625.90/month in 2025)
    pub monthly_facility_payment: Currency,
    /// OPPS-based emergency + outpatient (105% enhancement)
    pub enhanced_opps_revenue: Currency,
    /// Lost 340B savings (REHs NOT eligible)
    pub lost_340b_savings: Currency,
    /// No acute inpatient revenue
    pub no_acute_care_revenue: Currency,
    pub total_projected_revenue: Currency,
}

pub struct ConversionImpact {
    /// Change in Medicare revenue
    pub medicare_revenue_change: Currency,
    /// Lost 340B savings (negative impact)
    pub lost_340b_impact: Currency,
    /// Lost acute care discharges (revenue loss)
    pub lost_acute_revenue: Currency,
    /// Operational savings from reduced complexity (positive impact)
    pub operational_savings: Option<Currency>,
    /// Net financial impact
    pub net_financial_impact: Currency,
    /// Recommendation
    pub recommendation: String,
}

impl ConversionAnalysis {
    pub fn calculate_impact(
        cah: CAHMetrics,
        reh: REHMetrics,
    ) -> ConversionImpact {
        let revenue_change = reh.total_projected_revenue - cah.total_medicare_revenue;
        let lost_340b = cah.drug_340b_savings;  // All lost under REH
        let net = revenue_change - lost_340b;

        let recommendation = if net.value() < 0.0 {
            "Maintain CAH designation (REH conversion unfavorable)".to_string()
        } else {
            "REH conversion potentially viable".to_string()
        };

        ConversionImpact {
            medicare_revenue_change: revenue_change,
            lost_340b_impact: lost_340b,
            lost_acute_revenue: cah.acute_care_revenue,
            operational_savings: None,
            net_financial_impact: net,
            recommendation,
        }
    }
}
```

**Why important:**
- CAH to REH conversion is irreversible decision requiring careful analysis
- REH advantages: simpler operations, fixed monthly payment stability
- REH disadvantages: loss of 340B (major financial impact), loss of acute care revenue
- Financial modeling critical for board-level decision making

---


#### TIER 3: Analytical Gaps (Nice-to-Have, Enhances Decision Support)


#### # 3.1 Quality Metric Adjustments for CAH/REH
**What's needed:**

```rust
/// CAH exception/adjustment to quality programs
pub struct CAHQualityAdjustment {
    /// VBP: CAHs exempt from all three programs
    pub vbp_exempt: bool,
    /// HACRP: CAHs exempt
    pub hacrp_exempt: bool,
    /// HRRP: CAHs exempt
    pub hrrp_exempt: bool,
    /// REH: Eligible for applicable programs (emerging)
    pub reh_quality_eligible: bool,
}

/// Rare event monitoring for CAHs (G-chart method)
pub struct CahRareEventMonitoring {
    /// Using G-chart for rare events (CAH-specific method)
    pub monitoring_method: String,  // "G-chart"
    /// Control limits for rare events
    pub upper_control_limit: f64,
    pub lower_control_limit: f64,
    /// Typical CAH events monitored: SSI, CLABSI, etc.
}
```

---


#### # 3.2 Workforce & Staffing Analysis
**What's needed:**

```rust
/// CAH Rural Health Clinic (RHC) staffing
pub struct RuralHealthClinicStaffing {
    /// REH emergency department 24-hour staffing requirement
    pub ed_staffing_requirement: String,  // MD, NP, CRNA, or PA
    /// CAH average FTE by department
    pub fte_by_department: HashMap<String, f64>,
    /// Rural challenge: recruitment and retention
    pub turnover_rate: f64,
    pub wage_competitiveness_index: f64,
}

/// Medical staff model unique to rural hospitals
pub struct RuralMedicalStaffModel {
    /// Limited specialist availability
    pub available_specialties: Vec<String>,
    /// Reliance on visiting specialists
    pub visiting_specialist_model: bool,
    /// Telemedicine coverage for gaps
    pub telemedicine_coverage: bool,
}
```

---


#### # 3.3 Telehealth & Transfer Network Modeling
**What's needed:**

```rust
/// REH transfer network (required by regulation)
pub struct REHTransferNetwork {
    /// Level I trauma center transfer agreement (required)
    pub level1_trauma_partner: Option<String>,
    /// Level II trauma center transfer agreement (required)
    pub level2_trauma_partner: Option<String>,
    /// Average transfer distance (miles)
    pub avg_transfer_distance: f64,
    /// Average transfer time (minutes)
    pub avg_transfer_time: f64,
}

/// Telemedicine capacity modeling
pub struct TelemedicineCapacity {
    /// Number of telemedicine-capable examination rooms
    pub telehealth_rooms: u32,
    /// Specialist coverage available via telemedicine
    pub specialist_coverage_hours: f64,  // hours per week
    /// Cost of telemedicine platform
    pub telemedicine_platform_cost: Currency,
    /// Revenue from telemedicine services
    pub telemedicine_revenue: Currency,
}
```

---


#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
#### 1. Hospital Quality Programs (sci-quality-cms)
✅ **Implemented:**
- Value-Based Purchasing (VBP) - achievement/improvement scoring, payment multipliers
- Hospital Readmissions Reduction Program (HRRP) - readmission ratio, adjustment factors
- Hospital-Acquired Condition Reduction Program (HACRP) - HAC scoring, penalties
- Combined payment impact modeling - multiplicative adjustments across programs
- Mentions CAH exemption: `is_cah_exempt()` returns true (exempts from VBP, HACRP, HRRP)

**Limitations:**
- Generic CAH exemption flag; no facility type classification
- Doesn't reflect REH eligibility for these programs
- Doesn't model REH-specific quality metrics


#### 2. Financial Units (sci-units/financial.rs)
✅ **Implemented:**
- `Currency` — USD amounts with cent-level precision
- `ReimbursementRate` — payment rates with wage index adjustment, sequestration
- `CostPerUnit` — per-unit cost calculations
- `CaseMixIndex` — DRG case mix weighting
- `WageIndex` — geographic wage adjustment
- `DiscountRate` — for NPV/time-value calculations

**Limitations:**
- No CAH 101% cost-based rate type
- No distinction between IPPS rates vs. cost-based rates
- Wage index adjustments don't apply to CAHs (shouldn't be used)
- No REH-specific monthly facility payment type


#### 3. Time Value of Money (sci-finance-core/tvm.rs)
✅ **Comprehensive TVM Suite:**
- PV/FV calculations (lump sums, annuities, perpetuities, growing perpetuities)
- Payment, periods, and implicit rate solving
- Amortization schedules
- EAR/nominal conversions

**Limitations:**
- Generic financial tooling; not healthcare-specific
- Could be applied to capital budgeting but no rural hospital templates


#### 4. Options & Bond Pricing (sci-finance-core)
✅ **Advanced Fixed Income:**
- Black-Scholes-Merton option pricing with Greeks
- Bond pricing, duration, convexity, YTM
- Yield curve analysis

**Limitations:**
- Useful for hospital debt analysis but not rural-specific


#### 5. Portfolio Optimization (sci-finance-portfolio)
✅ **Markowitz MVO:**
- Min-variance, max-Sharpe, target-return portfolios
- Efficient frontier, risk parity
- CAPM, Fama-French factor models
- VaR, CVaR, Sharpe/Sortino/Treynor ratios

**Limitations:**
- General investment portfolio tools
- Could support rural hospital capital allocation across departments


#### 6. Bed Count & Population Units (sci-units/population.rs)
✅ **Implemented:**
- `BedCount` — facility bed capacity
- `HospitalizationRate`, `Prevalence`, `Incidence` — epidemiological rates

**Limitations:**
- BedCount is just a count; no occupancy, utilization, or swing bed modeling
- No length-of-stay constraints (CAH 96-hour max)
- No census or occupancy rate calculations

---



---

## 📦 Repository: Juliasim

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: Peds

### 🔴 Missing Features (Active Gaps)
- [ ] **Lumbar Puncture** (patient selection, positioning, opening pressure interpretation, meningitis rule-out flow)

- [ ] **Central Line Placement** (site selection by age/indication, PICC vs CVC vs tunneled, catheter-associated infection prevention)

- [ ] **Intubation** (equipment sizing by age, tube selection, post-intubation confirmation)

- [ ] **Cricothyrotomy** (emergency vs planned, scalpel vs needle, verification of tube placement)

- [ ] **Chest Tube/Thoracostomy** (pneumothorax vs hemothorax localization, tube size, removal criteria)

- [ ] **Intraosseous Infusion** (site selection, tibial vs humeral, complications recognition)

- [ ] **Urinary Catheterization** (clean-catch vs SPA vs transurethral, sterile technique, retention risk)

- [ ] **Finger Thoracostomy** (penetrating chest trauma, blood return interpretation)

- [ ] **Surgical Airway** (emergency vs planned, scalpel vs needle, post-cricothyrotomy anesthesia)

- [ ] **Resuscitative Hysterotomy** (pregnant cardiac arrest, perimortem cesarean criteria)

**Estimated impact**: +3-5% clinical utility; high training/credentialing value

---

*Why high priority*: Point-of-care ultrasound (POCUS) transforms ED decision-making in pediatrics; high-yield imaging has strong evidence.


- [ ] **POCUS for Shock** (IVC diameter, subclavian Doppler, cardiac contractility assessment)

- [ ] **Lung Ultrasound** (B-lines for pulmonary edema, pneumothorax sliding sign, consolidation)

- [ ] **Abdominal POCUS** (free fluid in trauma, pyloric muscle thickness, appendix diameter, intussusception)

- [ ] **Cardiac POCUS** (ejection fraction estimation, pericardial effusion, tamponade physiology)

- [ ] **FAST exam interpretation** (eFAST for pneumothorax, hemothorax, free abdominal fluid)

- [ ] **Renal Ultrasound** (hydronephrosis grading, renal size, echogenicity in AKI)

- [ ] **Testicular Ultrasound** (ischemia detection, torsion vs epididymitis)

**Estimated impact**: +5-8% clinical utility; high-impact for trauma, shock, acute abdomen

---


#### # 3. **Complex Multi-Drug Dosing & Interactions** (Partially Covered)
*Why high priority*: Polypharmacy in critically ill kids requires real-time reference; dosing errors are common.


- [ ] **Drug-Drug Interactions by Age** (CYP3A4 induction/inhibition, warfarin interactions, quinolone interactions)

- [ ] **Antibiotic Selection by Organ Function** (renal adjustment, hepatic adjustment, dialysis clearance)

- [ ] **Infusion Compatibility** (which IV medications can be co-administered; which require separate lines)

- [ ] **Renal Dose Adjustment Master Table** (eGFR → dosing modification across 50+ commonly used drugs)

- [ ] **Hepatic Dose Adjustment Master Table** (INR/liver synthetic function → drug selection/dose)

- [ ] **Medication Error Recognition & Management** (overdose recognition, antidote selection, poison control referral)

**Estimated impact**: +2-3% clinical utility; high error-prevention value

---


#### # 4. **Subspecialty Care Integration Pathways** (Partially Covered)
*Why high priority*: Pediatric critical care, cardiology, and ECMO pathways have unique decision-making.


- [ ] **ECMO Candidacy Assessment** (VA-ECMO for cardiac failure, VV-ECMO for respiratory failure, contraindications)

- [ ] **PICU Escalation Decision Tree** (when to transfer from ED/floor to PICU, severity of illness grading)

- [ ] **Extracorporeal Membrane Oxygenation (ECMO) Weaning** (circuit decannulation criteria, post-ECMO surveillance)

- [ ] **Mechanical Ventilation Weaning** (PEEP reduction, pressure support, spontaneous breathing trials)

- [ ] **Inotrope/Vasopressor Ladder** (dopamine vs epinephrine vs milrinone, titration by hemodynamics)

- [ ] **Pulmonary Hypertension Crisis** (inhaled nitric oxide, sildenafil, prostaglandins)

- [ ] **Critical Congenital Heart Disease Postnatal Course** (PGE weaning, surgical timing, Norwood procedure)

- [ ] **Organ Transplant Candidacy** (heart, lung, liver, kidney; contraindications)

**Estimated impact**: +3-5% clinical utility for critical care; strong referral/escalation value

---


#### # 5. **Poisoning & Toxidrome Workup** (Partially Covered)
*Why high priority*: Toxin identification by symptom cluster is high-stakes; many clinicians feel under-trained.


- [ ] **Toxidrome Identification by Symptom Cluster** (anticholinergic, cholinergic, sympathomimetic, etc.)

- [ ] **Heavy Metal Poisoning** (lead, mercury, arsenic; chelation agents)

- [ ] **Plant/Mushroom Poisoning** (toxic plants, Amanita phalloides, strychnine-like toxins)

- [ ] **Pesticide/Organophosphate Poisoning** (nerve agent exposure, atropine + pralidoxime)

- [ ] **Sedative/Hypnotic Overdose** (benzodiazepine, barbiturate, chloral hydrate reversal)

- [ ] **Stimulant Toxicity** (cocaine, amphetamine, synthetic cathinones; beta-blocker vs Ca-channel blocker management)

- [ ] **Anticholinergic vs Cholinergic Toxidrome** (atropine indications, cholinesterase reactivation)

- [ ] **Withdrawal Syndromes** (alcohol, opioid, benzodiazepine; CIWA/OARCI scoring)

**Estimated impact**: +1-2% clinical utility; high specialty training value for toxicology/toxidrome recognition

---


#### # 6. **Post-Discharge Follow-Up Protocols** (Partially Covered)
*Why high priority*: Reduces readmissions, improves safety netting, reduces liability; growing focus in pediatric care.


- [ ] **Post-Hospitalization Follow-Up Timing** (48h vs 1-week vs 2-week visits based on diagnosis)

- [ ] **Asthma Exacerbation Follow-Up** (step-up therapy verification, trigger identification, action plan review)

- [ ] **UTI Post-Treatment Imaging** (VCUG indications, renal ultrasound timing, prophylactic antibiotics)

- [ ] **Pneumonia Follow-Up** (repeat imaging criteria, persistent cough workup, aspirated foreign body rule-out)

- [ ] **Surgical Follow-Up After ED Discharge** (appendicitis vs conservative management, orthopedic reduction stability)

- [ ] **DKA Follow-Up** (insulin pump vs MDI, glucose targets, sick day management education)

- [ ] **Concussion Return-to-Activity** (phase-based progression, symptom exacerbation management)

- [ ] **Dehydration Rehydration Check** (weight restoration, urine output, continued losses)

- [ ] **Newborn Follow-Up After Early Discharge** (weight gain trajectory, feeding competence, jaundice rebound)

**Estimated impact**: +2-3% clinical utility; high safety/quality of care value

---


#### 🟠 **MEDIUM PRIORITY** (Specialty topics, lower frequency, or duplicative coverage)


#### # 7. **Rare Genetic & Metabolic Disorders** (Low coverage, high complexity)
*Why medium priority*: Rare disease diagnosis requires specialist referral; decision support is valuable but lower-frequency.


- [ ] **Mitochondrial Disease Screening** (MELAS, Leigh syndrome, muscle biopsy indications)

- [ ] **Organic Acidemias** (maple syrup urine disease, methylmalonic acidemia, treatment crisis)

- [ ] **Lysosomal Storage Diseases** (Gaucher, Niemann-Pick, neurologic decline trajectory)

- [ ] **Peroxisomal Disorders** (Zellweger spectrum, very-long-chain fatty acid testing)

- [ ] **Urea Cycle Disorders** (hyperammonemia crisis, protein restriction, lactulose/arginine)

- [ ] **Glycogen Storage Diseases** (hepatomegaly, hypoglycemia, dietary management)

- [ ] **Porphyrias** (acute intermittent porphyria, safe vs unsafe drugs)

- [ ] **Familial Hypercholesterolemia** (LDL targets, statin vs ezetimibe, lipoprotein apheresis)

**Estimated impact**: +0.5-1% clinical utility; strong specialist referral value

---


#### # 8. **Pediatric-Specific Oncology Emergencies** (Minimal coverage)
*Why medium priority*: Oncology patients commonly present to ED with emergencies; specialist integration needed.


- [ ] **Tumor Lysis Syndrome** (urate oxidase indications, hemodialysis triggers, electrolyte correction)

- [ ] **Chemotherapy Extravasation** (vesicant identification, local antidote application, surgical consultation)

- [ ] **Febrile Neutropenia in Cancer Patients** (empiric antibiotic selection, fungal prophylaxis)

- [ ] **Superior Vena Cava Syndrome** (airway obstruction risk, oncology-specific vs thrombosis)

- [ ] **Spinal Cord Compression** (malignancy-related, MRI urgency, dexamethasone, oncology consult)

- [ ] **Pericardial Effusion/Tamponade** (cancer-related, echo, pericardiocentesis criteria)

**Estimated impact**: +1-2% clinical utility; strong oncology integration value

---


#### # 9. **Advanced Supportive Care Topics** (Partially Covered)
*Why medium priority*: Comfort-focused care and symptom management deserve equal emphasis to resuscitative care.


- [ ] **Pediatric Palliative Care Symptom Management** (pain, dyspnea, delirium, anxiety in advanced illness)

- [ ] **End-of-Life Discussions** (prognosis disclosure, goals-of-care conversations, withdrawal of life support)

- [ ] **Bereavement Support** (follow-up after pediatric death, family meetings, memory box creation)

- [ ] **Perinatal Hospice** (congenital anomalies incompatible with life, family-centered birth planning)

- [ ] **Post-Traumatic Stress Screening** (PTSD in pediatric trauma survivors, early intervention referral)

**Estimated impact**: +1-2% clinical utility; strong palliative care, ethics, and family-centered value

---


#### # 10. **Health Equity & Underserved Population Protocols** (Not currently represented)
*Why medium priority*: Health disparities require targeted, culturally-tailored approaches.


- [ ] **Language-Concordant Pediatric Care** (interpreter use, consent in non-English speakers)

- [ ] **Uninsured/Underinsured Pediatric Management** (medication cost alternatives, free clinic navigation)

- [ ] **Pediatric Trauma in High-Violence Communities** (violence risk assessment, social work referral, safety planning)

- [ ] **Immigrant/Refugee Pediatric Health Screening** (vaccination status, TB exposure, mental health trauma)

- [ ] **LGBTQ+ Youth Health** (gender-affirming care, mental health screening, confidentiality)

- [ ] **Substance Exposure in Infants** (prenatal opioid/methamphetamine exposure, withdrawal management)

**Estimated impact**: +2-3% clinical utility; strong health equity and community health value

---


#### 🔵 **LOW PRIORITY** (Specialized, duplicative, or lower-frequency scenarios)


#### # 11. **Specialized Neonatal Topics** (6+ trees, well-covered)
- Already strong: NOWS/NAS, glucose management, transport, pain/sedation, thermoregulation
- **Could expand**: Neonatal abstinence in polysubstance exposure, maternal hepatitis integration


#### # 12. **Genetic Testing Decision-Making** (Low frequency, specialist-driven)
- Already have: Autism (genetics), primary immunodeficiency (genetic screening)
- **Could expand**: Exome sequencing indications, BRCA/hereditary cancer, familial cardiomyopathy genetic counseling
- **Status**: Better served by genetics specialist referral


#### # 13. **Rare Rheumatologic Conditions** (Well-covered by JIA, HSP, SLE, RF trees)
- Already strong: JIA, HSP vasculitis, lupus, reactive arthritis
- **Could expand**: Granulomatosis with polyangiitis (GPA), microscopic polyangiitis (MPA)
- **Status**: Low frequency; specialist referral often needed


#### # 14. **Mental Health Disorders in Comorbid Medical Illness** (Better served by integrated approach)
- Already have: Depression/suicide, anxiety, eating disorders, psychiatric emergencies, ADHD
- **Could expand**: PTSD in medically complex kids, adjustment disorder in chronic illness
- **Status**: Requires interdisciplinary team; single trees may oversimplify

---


#### **Coverage Closure Target**
- **Primary target**: Procedure-specific guidance (Phase 1)
- **Secondary target**: Bedside ultrasound (Phase 1)
- **Tertiary target**: Specialty care integration (Phase 2)

---


#### P1-5. No runtime error monitoring

No Sentry, no Datadog RUM, no client error reporter. The only telemetry
hooks are the static CF Functions `analytics.js` and `usage.js`, and
nothing in the React app calls them
(`grep -rn "fetch.*api/(analytics|usage)" apps/react-next/src` returns 0).
A pediatric emergency tool without crash visibility cannot be triaged after
incidents.


#### P1-6. No PWA / offline behavior despite e2e test

`tests/e2e/offline-pwa.test.ts` exists. Reality:

- No `apps/react-next/public/manifest.json`
- No service worker registered
- No offline cache strategy

Either implement (recommended given rural/no-signal use case the README
emphasizes) or remove the test so it stops giving false-positive coverage.


#### P1-7. No `error.tsx` / `not-found.tsx` boundaries

Next 16 surfaces unhandled errors as a generic stack page in production.
Add `apps/react-next/src/app/error.tsx`, `global-error.tsx`, and
`not-found.tsx` so a calculator/tree exception doesn't ship the user a
blank screen mid-resuscitation.

---


#### P2-2. PHI scanner is SSN-only

**File:** `.github/workflows/validation.yml:201-219`

Catches `\d{3}-\d{2}-\d{4}` only. Misses MRN-style identifiers, date-of-birth
+ name combinations, address blocks, ICD-10 + name pairs. For a system that
processes pediatric clinical scenarios, the scanner should at minimum check
date-of-birth patterns and warn on commit messages / fixture files that
combine a real-looking name with any 3-character ICD code.


#### P2-3. Lighthouse gate is non-blocking

**File:** `.github/workflows/validation.yml:171-200`

`continue-on-error: true` and gated on a `vite.config.*` / `next.config.*`
hash that may not match the monorepo layout. Performance budgets should be
enforced (LCP, TBT, CLS thresholds) given the offline/poor-signal target.


#### P2-4. Domain & canonical URL undefined

Deploy lands at `peds.pages.dev` (no custom domain in `wrangler.toml`).
`PRIVACY.md` and `TERMS.md` reference an unspecified domain. Before any
referral from clinical channels, register a custom domain, configure HSTS,
and update legal docs.


#### P2-5. Knowledge registry continues to drift

(Recap of GAP_ANALYSIS.md §2 with current numbers.) `last_updated` is
**2026-04-20T16:11:43Z**, eight days stale. On-disk vs registered:

| Category | On disk | Registered | Δ |
|---|---:|---:|---:|
| Cheat sheets (.docx) | 35 | 32 | −3 |
| Education guides (.docx) | 129 | 30 | **−99** |
| Textbooks (.docx) | 68 | 14 | **−54** |
| Audio textbooks (.docx) | 47 | 3 | **−44** |
| Decision trees (legacy HTML) | 158 | 36 | **−122** |
| Calculators (HTML) | 20 | 4 | **−16** |

Until the registry is regenerated by CI, every downstream count
(`audit-validate.yml`, `STATUS.md`, release notes) is wrong.


#### P2-6. Repo hygiene regressed

Yesterday's analysis flagged 50 `* 2.*` files. Today: **52**. Including
`.github/workflows/hygiene 2.yml` and `release-l2plus-textbook 2.yml`,
which `git diff` confirms are byte-identical to their canonical siblings —
GitHub Actions is running them in parallel.


#### P2-7. SQLite + Prisma in a static-export Cloudflare deploy

`apps/react-next/package.json` declares `better-sqlite3` and `@prisma/client`
as runtime deps. Neither runs in a static export, neither runs in CF Pages
Functions (no native modules), and the `prisma/schema.prisma` migrations
are not invoked by any workflow. Either remove these deps and the audit
DB story, or migrate to D1 / Durable Objects + drizzle.


#### P2-8. Three-branch flow recently merged but undocumented in CLAUDE.md

PR #88 ("Chore/three branch flow") landed yesterday. `CLAUDE.md` still
describes a single-`main` model. Either revert or document the new
`develop` / `staging` / `main` flow before contributors fork the next
branch.

---


#### # 1. **Procedure-Specific Educational Content** (0/10 topics)
**Need:** Detailed guidance on procedural complications, patient selection, technique variants


- [ ] Central Line Placement (PICC vs CVC vs tunneled, site selection, CLABSI prevention)

- [ ] Intubation Guide (equipment sizing by age, tube selection, post-intubation confirmation)

- [ ] Cricothyrotomy (emergency vs planned, scalpel vs needle, post-procedure management)

- [ ] Chest Tube Placement (pneumothorax vs hemothorax, size selection, removal criteria)

- [ ] Intraosseous Access (site selection, tibial vs humeral, complications)

- [ ] Urinary Catheterization (technique variants, retention risk, sterile approach)

- [ ] Lumbar Puncture (patient selection, CSF interpretation, meningitis rule-out)

- [ ] Surgical Airway (emergency indications, post-cricothyrotomy anesthesia)

- [ ] FAST Exam (free fluid assessment, pneumothorax detection)

- [ ] Arterial Line Placement (site selection, waveform interpretation, infection prevention)

**Impact:** High — procedural complications are common in emergency/critical care settings

---


#### # 2. **Advanced Bedside Ultrasound (POCUS) Topics** (0/7 topics)
**Need:** Point-of-care ultrasound guidance beyond basic principles


- [ ] IVC Assessment for Fluid Status (diameter measurement, collapsibility, respiration variation)

- [ ] Cardiac POCUS (ejection fraction estimation, pericardial effusion, tamponade physiology)

- [ ] Abdominal POCUS (free fluid in trauma, pyloric muscle thickness, appendix diameter)

- [ ] Testicular Ultrasound (ischemia detection, torsion vs epididymitis)

- [ ] Renal Ultrasound (hydronephrosis grading, AKI echogenicity patterns)

- [ ] Thyroid Ultrasound (nodule characterization, thyroiditis findings)

- [ ] Vascular Access Ultrasound (guide needle placement, vein visualization)

**Impact:** Medium-High — POCUS rapidly expanding in pediatric emergency medicine

---


#### # 3. **Specialty Care Escalation Pathways** (1/8 topics — ECMO only)
**Need:** Integration pathways for complex care coordination


- [ ] PICU Admission Criteria (severity of illness scoring, transfer timing)

- [ ] Mechanical Ventilation Weaning (PEEP reduction, spontaneous breathing trials, extubation readiness)

- [ ] ECMO Weaning Protocols (circuit decannulation criteria, post-ECMO surveillance)

- [ ] Inotrope/Vasopressor Selection (dopamine vs epinephrine vs milrinone, hemodynamic indications)

- [ ] Pulmonary Hypertension Crisis (inhaled nitric oxide, sildenafil, prostaglandin use)

- [ ] Critical CHD Postnatal Management (PGE weaning, surgical timing)

- [ ] Organ Transplant Candidacy (heart, lung, liver, kidney; absolute contraindications)

**Impact:** Medium — primarily for critical care/specialty clinicians, but important for ED-to-ICU handoff

---


#### # 4. **Post-Discharge Follow-Up Protocols** (0/9 topics)
**Need:** Safety netting and monitoring after acute illness discharge


- [ ] Asthma Exacerbation Follow-Up (step-up therapy verification, action plan review)

- [ ] UTI Post-Treatment Follow-Up (VCUG indications, antibiotic prophylaxis decision)

- [ ] Pneumonia Follow-Up (repeat imaging criteria, persistent cough workup)

- [ ] Surgical Discharge Follow-Up (appendicitis vs conservative management, orthopedic stability)

- [ ] DKA Follow-Up (insulin pump vs MDI, sick day management, glucose targets)

- [ ] Dehydration Rehydration Check (weight restoration, ongoing losses, urine output)

- [ ] Newborn Early Discharge Follow-Up (weight gain trajectory, jaundice rebound risk)

- [ ] Concussion Recovery Phases (return-to-activity progression, symptom exacerbation)

- [ ] Fracture Healing Follow-Up (alignment verification, weight-bearing progression)

**Impact:** Medium — reduces readmissions and improves safety netting

---


#### # 5. **Toxidrome-Specific Topics** (2/8 topics — basic coverage only)
**Need:** Detailed symptom-based identification and management


- [ ] Anticholinergic Toxidrome (atropine indications, specific poisonings)

- [ ] Cholinergic/Organophosphate Toxidrome (nerve agent exposure, pralidoxime use)

- [ ] Sympathomimetic Toxidrome (cocaine, amphetamines, synthetic cathinones)

- [ ] Sedative/Hypnotic Overdose (benzodiazepine, barbiturate, chloral hydrate reversal)

- [ ] Stimulant Toxicity (cocaine, amphetamine management, arrhythmia treatment)

- [ ] Withdrawal Syndromes (alcohol, opioid, benzodiazepine; CIWA/OARCI scoring)

**Impact:** Low-Medium — specialty topic but high training value for toxicology/emergency medicine

---


#### 🟡 **SIGNIFICANT GAPS** (Incomplete Coverage, 2-4 topics exist)


#### # 6. **Complex Drug Interactions & Dosing** (Partial coverage: 5 topics)
**Current:** Sepsis antibiotics, vasopressor dosing, DKA insulin  

- [ ] CYP450 Drug-Drug Interactions (enzyme inducers vs inhibitors, pediatric metabolism)

- [ ] Hepatic Dose Adjustment Master (INR-based, liver synthetic function)

- [ ] Renal Dose Adjustment Extended (50+ drugs, GFR-based calculation)

- [ ] Pediatric Medication Error Recognition (overdose identification, antidote selection)

- [ ] Drug Allergy & Desensitization (penicillin cross-reactivity, safe alternatives)

**Impact:** Medium — prevents medication errors but already partially covered by calculators

---


#### # 7. **Rare Genetic & Metabolic Disorders** (Minimal coverage: 2 topics)
**Current:** Basic neonatal jaundice, hypoglycemia  

- [ ] Mitochondrial Disease Screening (MELAS, Leigh syndrome, diagnostic workup)

- [ ] Organic Acidemias (maple syrup urine disease, methylmalonic acidemia)

- [ ] Lysosomal Storage Diseases (Gaucher, Niemann-Pick, diagnostic cascade)

- [ ] Urea Cycle Disorders (hyperammonemia crisis, protein restriction, ammonia lowering)

- [ ] Glycogen Storage Diseases (hepatomegaly patterns, dietary management)

- [ ] Porphyrias (acute intermittent porphyria, safe vs unsafe drugs)

**Impact:** Low — rare disease diagnosis requires specialist referral anyway

---


#### # 8. **Pediatric Oncology Emergencies** (Minimal coverage: 1 topic)
**Current:** Limited coverage  

- [ ] Tumor Lysis Syndrome (urate oxidase indications, hemodialysis triggers)

- [ ] Febrile Neutropenia in Cancer (empiric antibiotic selection, fungal prophylaxis)

- [ ] Chemotherapy Extravasation (vesicant identification, local antidote management)

- [ ] Superior Vena Cava Syndrome (oncology-specific vs thrombosis, airway risk)

- [ ] Spinal Cord Compression (malignancy-related, MRI urgency)

**Impact:** Low-Medium — valuable for oncology patients but specialist integration preferred

---


#### # 9. **Health Equity & Underserved Population Protocols** (0 topics)
**Need:** Culturally-tailored care approaches


- [ ] Language-Concordant Care (interpreter use, consent in non-English speakers)

- [ ] Uninsured/Underinsured Management (medication alternatives, free clinic navigation)

- [ ] Pediatric Trauma in High-Violence Communities (violence risk, safety planning)

- [ ] Immigrant/Refugee Health Screening (vaccination status, TB exposure, trauma)

- [ ] LGBTQ+ Youth Health (gender-affirming terminology, mental health screening)

- [ ] Prenatal Substance Exposure (opioid, methamphetamine, withdrawal management)

**Impact:** Medium-High — ethical imperative; affects vulnerable populations

---


#### # 10. **Palliative & End-of-Life Care** (0 topics)
**Need:** Comfort-focused care guidance


- [ ] Pediatric Palliative Care Symptom Management (pain, dyspnea, delirium, anxiety)

- [ ] Goals-of-Care Conversations (prognosis disclosure, shared decision-making)

- [ ] Withdrawal of Life Support (ethical framework, family support)

- [ ] Perinatal Hospice (congenital anomalies incompatible with life)

- [ ] Pediatric Bereavement Support (grief counseling, family meetings)

**Impact:** Low clinical frequency but **high ethical/quality of care value**

---


#### High-confidence diagnosis
1. API test expects older module exports (`routes`, `state`, `ws`) that are no longer re-exported in `pedneoSim-api` crate root.
2. Test dependencies are incomplete for current Axum/Tower versions.
3. Integration tests have drifted from current crate public API.


#### Recommended fix sequence
1. In `crates/pedneoSim-api/tests/test_ws_vitals_stream.rs`, import concrete module paths used by current crate layout (or explicitly re-export from `lib.rs`).
2. Add `tower` as a `[dev-dependencies]` entry in `crates/pedneoSim-api/Cargo.toml` if absent.
3. Update trait import to `use tower::util::ServiceExt;` for Axum router `oneshot`.
4. Re-run:
   - `cargo test -p pedneoSim-api --test test_ws_vitals_stream`
   - `cargo test --workspace`

---


#### Priority broken links to fix first
2. `.github/CONTRIBUTING.md -> ../CONTRIBUTOR_AGREEMENT.md` (contributor workflow blocker).
3. `validation/VALIDATION_SUMMARY_REPORT_TEMPLATE.md -> GAMP_5_ALIGNMENT.md` (compliance workflow blocker).

---


#### Target-state definition
- Green API test lane under 3-5 minutes.
- Zero broken local Markdown links in authored docs.
- Compliance and contributor docs fully resolvable.
- Warnings reduced to intentional/approved exceptions only.


#### 2-week closure plan
1. **Week 1:** repair API tests + add dev dependencies + introduce fast CI lane.
3. **Week 2:** feature-flag cleanup and warning elimination.
4. **Week 2:** documentation QA gate (automated markdown link checker in CI).

---


| **GAP-W3: No clinical calc dispatch layer** | P0 | Critical | No hook/service that says "for sepsis scoring, call WASM; otherwise JS fallback". Forms blindly use TypeScript functions. |

| **GAP-W4: No error boundary for WASM failures** | P1 | High | WASM init failure crashes app. Need graceful degradation to JS. |

| **GAP-W5: No WASM memory budgeting** | P1 | High | Linear module state (patient obj) could explode memory in multi-patient UI scenarios. No pooling/reuse logic. |


#### Web UI Calculation Entry Points (Audit)

**Forms/components that invoke clinical math:**
- `src/components/TreeViewer.tsx` — decision tree node scoring (none currently; Mermaid is display-only)
- `src/components/PatientBanner.tsx` — vital-range validation (hardcoded; should call `get_vital_ranges(age)`)
- `src/components/EduLinksPanel.tsx` — no calculations (metadata only)
- `src/app/trees/[treeId]/` — tree rendering (no scoring)

- Dosing: `calculate_dose`, `calculate_all_doses` (8 domain modules)
- Vitals: `get_vital_ranges`, `classify_broselow` (equipment sizing)
- Protocols: `calculate_sepsis_protocol`, `calculate_seizure_protocol`, etc. (5 clinical protocols)
- Growth: `calculate_percentile` (WHO/Fenton charts — stub)
- Neonatal: `ivf_*` functions (6 IV fluid functions)

**Action:** Inventory all components calling clinical math. Flag each with required WASM function.

---


#### Gap Analysis — Content Sync

| Gap | Priority | Severity | Notes |
|-----|----------|----------|-------|

| **GAP-C1: Registry completeness** | P0 | Critical | 117+ trees/textbooks/guides unregistered. `knowledge/registry.json` is stale. |

| **GAP-C2: Metadata enforcement** | P0 | Critical | DOCX files lack sibling `.meta.json` audit blocks. Fails `audit-validate.yml` on PR. |

| **GAP-C3: Duplicate decision trees** | P1 | High | Same tree in `/content/interactive-decision-trees/` AND `/apps/web/static/decision-trees/`. React-next fallback reads old copy. |

| **GAP-C5: Audio textbook metadata** | P1 | High | 16 audio textbooks on disk; 3 in registry. No automated sync from narration pipeline. |

| **GAP-C6: Content delivery CDN binding** | P2 | Medium | No `content.json` manifest for client-side discovery. Requires hardcoded tree list. |

| **GAP-C7: Textbook format normalization** | P2 | Medium | Mix of DOCX, MD, HTML. No unified rendering. |


#### Registry Schema Gaps

**`knowledge/registry.json` is incomplete for react-next:**

```json
{
  "entries": {
    "decision_tree:septic_shock": {
      "id": "decision_tree:septic_shock",
      "category": "decision_tree",
      "title": "...",
      "path": "content/interactive-decision-trees/septic_shock_decision_tree.json",
      "ui_entry_point": "trees/septic-shock",         // where is this tree served?
      "wasm_dependencies": ["calculate_sepsis_protocol"],  // which WASM functions needed?
      "validation_version": "2.1.0",                      // which validation schema?
      "audit_status": "complete" | "draft" | "failed"    // audit trail
    }
  }
}
```

**Action:** Extend registry schema to link content → WASM dependencies → UI routes.

---


| **GAP-WB4: WASM async init blocking** | P1 | High | Importing WASM synchronously at module load will block app startup. Need deferred init. |

| **GAP-WB5: No multi-WASM memory management** | P1 | High | If multiple domain crates (ped-neonatal, ped-sepsis, ped-cardiac) loaded separately, each gets own 1 GB memory. Need shared instance or pooling. |

| **GAP-WB6: Type bindings stale** | P1 | High | TypeScript typings for WASM exports not auto-synced. Manual `.d.ts` drift likely. |


**From tree-viewer perspective:**

| Calculation | Current Path | WASM Target | Gap |
|---|---|---|---|
| Sepsis scoring | JS (hardcoded array checks) | `calculate_sepsis_protocol(state)` | No dispatch hook; forms call JS directly |
| Equipment sizing | None; PatientBanner hardcoded | `get_equipment_sizing(weight)` | No Broselow sizing displayed |
| Dosing | Forms use hardcoded JSON lookup | `calculate_dose(drug, weight, mode)` | No dynamic form rendering; static JSON |
| Vital ranges | PatientBanner hardcoded age brackets | `get_vital_ranges(age, mode)` | No server-side validation |
| Growth percentile | None | `calculate_percentile(...)` (stub) | No growth chart display |
| IV fluid prescriptions | None; neonatal textbook only | `ivf_calculate(...)` | No calculator UI component |

**Action:** Build 5 wrapper hooks (`useSepsisCDS`, `useDosing`, `useIVF`, etc.) that query WASM or fallback to JS.

---


### 🟢 Built Features (Completed Gaps)
#### SPA Routing Configuration

**How _routes.json works**:
```json
{
  "include": ["/*"],           // All routes
  "exclude": ["/assets/*", ...]  // Except these = go to SvelteKit
}
```

**Result**:
- `/asthma` → SvelteKit renders
- `/dashboard` → SvelteKit renders
- `/assets/style.css` → Static file
- `/decision-trees/asthma.html` → Static file
- `/wasm-pkg/ped_wasm.wasm` → Static file

**Status**: ✅ Correctly configured


#### Security & Performance

**Headers Analysis**:

| Resource | Cache Control | Headers |
|----------|---|---|
| `/assets/*` | 31536000s (1yr) | Immutable |
| `/wasm-pkg/*` | 31536000s (1yr) | Immutable |
| `/decision-trees/*` | 86400s (1d) | Standard |
| `/*.html` | 3600s (1hr) | Revalidation |
| All | — | Security headers added |

**Security headers included**:
- `X-Frame-Options: SAMEORIGIN` — Prevent clickjacking
- `X-Content-Type-Options: nosniff` — Prevent MIME sniffing
- `X-XSS-Protection: 1; mode=block` — Block reflected XSS
- `Referrer-Policy: strict-origin-when-cross-origin` — Privacy
- `Permissions-Policy` — Restrict powerful APIs

**Status**: ✅ Industry standard, appropriate for health/clinical tool

---


From [`SIMULATION_GAP_ANALYSIS.json`](docs/archive/gap-analysis-2026-04/SIMULATION_GAP_ANALYSIS.json) the priority list was:

|---|---|---|
| `dka_simulator` | P0 | ✅ `content/simulations/dka_simulator.jsx` |
| `sepsis_simulator` | P1 | ❌ |
| `svt_simulator` | P1 | ❌ |
| `nrp_simulator` | P1 | ❌ |
| `ventilator_simulator` | P2 | ❌ |
| `asthma_simulator` | P2 | ❌ |
| `status_epilepticus_simulator` | P2 | ❌ |
| `trauma_simulator` | P2 | ❌ |

Some content lives in `Patient-simulation-julia` (the digital twin repo) —
import is wired through `import-simulations.yml` but the `to-build/` and
in this state.

---


- Old gap analyses moved to `docs/archive/gap-analysis-2026-04/` with a
  README index — none deleted.


---

## 📦 Repository: Julia-clinical

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: Julia-ai-notebook

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: PedsEdu-Jl

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: Hospital-economics

### 🔴 Missing Features (Active Gaps)
#### Domain A — Corporate finance & valuation depth (**weight: highest**)

| ID | Gap | Target module | Acceptance test sketch | P |
|---|---|---|---|---|
| A-01 | **Three-statement projection engine** (income statement + balance sheet + cash-flow statement, calibrated to a CMS HCRIS Worksheet S/G/A/B) is implied but not present as one composable struct. Currently `AnnualFinancials` exists but balance-sheet projection logic is fragmented. | New `src/finance/three_statement.jl` (or `packages/FinanceEngine/src/three_statement.jl`) | Given a Worksheet S-3 stub, project 5 yrs IS/BS/CF, prove BS balances each year, prove CF ties to IS+BS. | **P0** |
| A-02 | **Full DuPont decomposition** (3-factor + 5-factor) for nonprofit hospital margin: Net Margin × Asset Turnover × Equity Multiplier; plus 5-factor with EBIT/Sales × Sales/Assets × Assets/Equity × Tax Burden × Interest Burden adapted for tax-exempt entities. | `src/finance/dupont.jl` | Given AnnualFinancials + balance-sheet, return both decompositions; matches a hand-computed Moody's-style example to within 0.5 pp. | **P0** |
| A-03 | **Altman Z″-score** (private-firm variant, suitable for nonprofit hospitals) and **Beneish M-score** for earnings-quality screening of competitor / acquisition-target hospitals. | `src/finance/distress_scoring.jl` | Z″ on a known-distressed CAH (e.g., a closed hospital from CHQPR list) flags below 1.10. | **P0** |
| A-04 | **Cost of capital tailored to nonprofit / district / governmental hospitals**: tax-exempt municipal bond curve, AAA/AA/A/BBB rural-hospital spreads, levered/unlevered beta from FFY peer set, MADS (Maximum Annual Debt Service) covenant calculator. | Extend `capital_structure.jl` with `nonprofit_wacc`, `mads_headroom`, `synthetic_rating` | Given debt schedule + 5-yr operating projection, returns covenant headroom and synthetic Moody's rating. | **P0** |
| A-05 | **IRR, MIRR, profitability index, equivalent annual cost** — basic capital-budgeting ratios that should sit next to `npv` in `financial.jl`. | `financial.jl` | Standard textbook examples match. | **P1** |
| A-06 | **Real-options valuation on service lines** (option to expand OB, option to abandon inpatient, option to convert CAH→REH). Black-Scholes-Merton on continuous flows; binomial lattice for discrete decisions; Longstaff-Schwartz LSM for early-exercise paths. | `src/finance/real_options.jl` | REH conversion option valued > NPV of stay-as-CAH on stress scenarios; matches a known textbook closed-form on a toy. | **P0** |
| A-07 | **M&A / affiliation valuation engine**: standalone DCF + synergy DCF + integration-cost waterfall + accretion/dilution on the parent system + tax & 501(r) implications. The current `merger_integration_plan` in FinanceEngine is a planning template, not a valuation. | `src/finance/ma_valuation.jl` | Given two AnnualFinancials, returns deal NPV, synergy NPV, IRR to acquirer, breakeven multiple. | **P1** |
| A-08 | **LBO / restructuring model** — for distressed-hospital takeouts and REIT-leaseback scenarios increasingly relevant in rural markets. | `src/finance/lbo_model.jl` | Sources & uses balances; 5-yr IRR within 0.1 pp of a Damodaran textbook example. | **P2** |
| A-09 | **Treasury & liquidity stress test** — 13-week cash-flow forecast, days-cash-on-hand under shock scenarios, line-of-credit headroom. | `src/finance/treasury.jl` | 13-week forecast given AR aging + AP aging + payroll cycle; stress to 30/60/90-day Medicare-payment delays. | **P0** |
| A-10 | **Working-capital optimization** — AR cycle, AP cycle, inventory cycle, cash conversion cycle, target-DSO model. The `supply_chain.jl` covers inventory but not AR/AP. | `src/finance/working_capital.jl` | CCC = DSO + DIO − DPO; closed-form sensitivity to denials and aging buckets. | **P1** |


#### Domain B — Strategic & decision analytics (**weight: high**)

| ID | Gap | Target module | Acceptance test sketch | P |
|---|---|---|---|---|
| B-01 | **Balanced Scorecard / Strategy Map engine** — auto-compose 4-perspective (Financial / Customer / Internal / Learning) scorecard from existing metrics with cause-and-effect linkages. | `src/strategy/balanced_scorecard.jl` | Given a metrics dict, render scorecard table + mermaid strategy map. | **P1** |
| B-02 | **Porter Five Forces & SWOT structured outputs** for rural markets (low new-entrant threat but high payer power; thin substitutes but high regulatory pressure). Codify this as a JSON-driven framework so an analyst can produce a defensible competitive analysis. | `src/strategy/competitive.jl` | Inputs: HRR/HSA, payer mix, peer hospitals; outputs: 5-forces scoring with citations to AHA / RUPRI. | **P2** |
| B-03 | **Service-line portfolio optimization (Markowitz-style)** — frontier of expected margin vs margin variance across service lines, with capacity & community-need constraints. | `src/optimization/service_line_portfolio.jl` | Given service-line history (revenue, cost, volume), produce efficient frontier; integer-constrained variant for "open / close" decisions. | **P0** |
| B-05 | **Strategic scenario planning à la Wack/Schwartz** — three-scenario divergent futures (e.g., 340B repeal / Medicaid expansion in remaining states / Medicare physician-fee-schedule cuts); pre-computed scoring across all hospital decisions. | `src/strategy/scenario_planning.jl` | A scenario-by-decision payoff matrix is rendered. | **P2** |
| B-07 | **HRR/HSA-level competitive analytics**: market share, HHI, geographic-access overlap (currently `geographic_access.jl` exists; HHI does not). | Extend `analysis/network_economics.jl` | HHI computed for each HRR; trend over 5 yrs given Dartmouth Atlas + CMS POS. | **P1** |


#### Domain C — Operational & productivity analytics (**weight: high**)

| ID | Gap | Target module | Acceptance test sketch | P |
|---|---|---|---|---|
| C-01 | **Data Envelopment Analysis (DEA)** — DEA-CCR and DEA-BCC for efficiency frontier across peer rural hospitals. | `src/analytics/dea.jl` | Given peer DMUs (inputs: FTEs, beds, capital; outputs: discharges, ED visits, quality), return relative efficiency scores; replicate the Färe textbook example. | **P0** |
| C-02 | **Stochastic Frontier Analysis (SFA)** for cost efficiency with translog cost function. | `src/analytics/sfa.jl` | Half-normal inefficiency model; matches a published rural-hospital SFA paper to within reported coefficients. | **P1** |
| C-03 | **Variance analysis (price/volume/mix) for revenue cycle** — bridge from prior-period to current-period revenue with rate, volume, and case-mix-index components. | `src/finance/variance_analysis.jl` | Walk decomposition sums to total ΔRevenue exactly. | **P0** |
| C-04 | **Theory-of-Constraints bottleneck identification** for ED throughput, OR utilization, swing-bed flow. | `src/analytics/toc_bottleneck.jl` | Identifies the constraint resource and computes throughput dollars/hour. | **P2** |
| C-05 | **Time-Driven Activity-Based Costing (TDABC)** — current `activity_based_cost` uses traditional ABC. TDABC is the modern Kaplan/Anderson method. | Extend `cost_accounting.jl` | Capacity-cost rate per minute × time-equation = service cost; matches HBR example. | **P1** |
| C-06 | **Reciprocal-method cost allocation** (currently only step-down). MBA-grade cost-accounting expects all three: direct, step-down, reciprocal. | Extend `cost_accounting.jl` | Reciprocal allocation matrix solved via linear system; ties to step-down within rounding for non-cyclic dependency graphs. | **P1** |
| C-07 | **Productivity benchmarking against MGMA / AHA / Flex Monitoring** percentiles (FTE per AOB, OR turnover, RN HPPD, etc.) — `ratios.jl` does Flex 10 ratios but no peer benchmarking. | `src/analytics/peer_benchmarking.jl` | Given a CAH and a peer set (e.g., all CAHs <25 beds in the same region), return percentile bands per ratio. | **P0** |


#### Domain D — Risk & ML analytics (**weight: medium-high**)

| ID | Gap | Target module | Acceptance test sketch | P |
|---|---|---|---|---|
| D-01 | **Closure hazard model (Cox proportional hazards / parametric AFT)** in addition to the existing logistic Chartis model in `closure_ml.jl`. Time-to-closure is the natural target. | Extend `risk/closure_ml.jl` | Cox PH on Sheps Center closure dataset; concordance > 0.75. | **P1** |
| D-02 | **Gradient-boosted closure model (XGBoost/LightGBM via `MLJ.jl`)** as a higher-accuracy alternative to logistic. | `risk/closure_ml.jl` | AUC improvement over logistic on held-out test ≥ 0.05. | **P2** |
| D-04 | **Monte Carlo with copula-correlated inputs** — current MC uses independent draws. Real CFOs need correlated revenue/expense shocks (e.g., utilization down ⇒ revenue down ⇒ supply costs partly down). | Extend `simulation/montecarlo.jl` | Gaussian or t-copula on arbitrary marginals; correlation recovered to within 0.02. | **P0** |
| D-05 | **Value-at-Risk (VaR) and Expected Shortfall (CVaR)** on operating margin, days-cash-on-hand, and net assets. | `src/risk/var_cvar.jl` | 95% VaR and CVaR computed via historical, parametric, and MC methods; consistent within 5%. | **P1** |
| D-06 | **Scenario stress-testing à la Federal Reserve CCAR** — adverse and severely-adverse macro scenarios applied to hospital projections. | `src/risk/stress_test.jl` | Fed-style severe scenario applied to a 5-yr projection; reports breach years and recovery time. | **P1** |
| D-07 | **Natural disaster / climate stress test** — `disaster_resilience.jl` exists. Extend to NOAA SVI + climate-projection inputs. | Extend `risk/disaster_resilience.jl` | County-FIPS lookup of hurricane/wildfire/flood probability; integrates into closure-risk score. | **P2** |


#### Domain E — Reimbursement & policy analytics depth (**weight: high — distinguishes rural focus**)

| ID | Gap | Target module | Acceptance test sketch | P |
|---|---|---|---|---|
| E-04 | **Rural Health Clinic (RHC) AIR cap, Method II billing, productivity standards** — `rhc_optimization.jl` exists but does not model the AIR cap mechanism end-to-end nor the new RHC payment limit phase-in. | Extend `finance/rhc_optimization.jl` | Compute AIR vs cap; phase-in trajectory matches CAA 2021 schedule. | **P1** |
| E-06 | **MIPS / VBP / HRRP / HACRP scoring** — implemented metrics exist (`QualityMetrics.jl`) but the actual CMS scoring algorithms with current threshold tables are not implemented. | `src/policy/mips_vbp_hrrp.jl` | Given a hospital's measure scores, compute the % payment adjustment exactly per CMS spec. | **P0** |
| E-07 | **TEAM (Transforming Episode Accountability Model) bundled-payment program** — `team_bundled.jl` exists. Verify it's current with the FY2026 TEAM final rule (mandatory model starting Jan 2026). | Audit + extend `finance/team_bundled.jl` | Reproduce a TEAM target-price calculation per the CMS TEAM specifications manual. | **P0** |


#### Domain F — Reporting, decisioning, and presentation layer (**weight: medium**)

| ID | Gap | Target module | Acceptance test sketch | P |
|---|---|---|---|---|
| F-01 | **Board-ready packet generator** — auto-render a 12-page board PDF (cover, exec summary, scorecard, scenarios, risks, capital plan, payer-mix walk, productivity, quality, community impact, financials, appendix). Pure-Julia rendering chain: data assembled in Julia → `Weave.jl` (Markdown → LaTeX → PDF) **or** `Typst.jl` (Julia → Typst → PDF). Plot inserts use `Plots.jl` / `StatsPlots.jl` PDF/SVG output. | `src/visualization/board_packet.jl` (no external skill needed) | Given a fiscal year, produces a deterministic 12-page PDF; the same JSON input always produces a byte-identical PDF (timestamps masked). | **P0** |
| F-02 | **Rating-agency-style memo** (Moody's / Fitch format) — narrative + ratios + peer comparison + outlook. Pure-Julia output as **HTML (Stipple-rendered, downloadable)** plus **PDF (via Weave.jl or Typst.jl)**. No DOCX in the runtime path. | `src/visualization/rating_memo.jl` | Renders an HTML+PDF pair that mirrors the Moody's "Issuer Comment" structure. | **P1** |
| F-03 | **CFO 1-pager (weekly/monthly)** — single-screen KPI dashboard with sparklines, RAG status, and exception flags. | Extend `app/views/dashboard/` | Loads in <500 ms on the existing Stipple dashboard; passes Playwright spec. | **P0** |
| F-04 | **Sensitivity-tornado on every model** — exists for sensitivity analysis but not exposed uniformly across modules. | `src/visualization/tornado.jl` | A single API call `tornado(model, params)` returns sorted bars. | **P1** |
| F-05 | **Scenario diff/compare** — current scenario_persistence stores scenarios but has no diff. | Extend `scenario_persistence.jl` | Two scenarios → side-by-side delta table. | **P1** |
| F-06 | **CMS HCRIS auto-importer** — `test_hcris_parser` exists but no end-to-end CLI for "give me a CCN, get a fully populated AnnualFinancials." | `scripts/import_hcris.jl` | `julia scripts/import_hcris.jl --ccn 011300 --year 2024` populates the full data model. | **P0** |
| F-07 | **Federal Register / proposed-rule monitor** — pull IPPS, OPPS, PFS, REH, 340B proposed rules as soon as published; auto-recompute impact. | `scripts/fed_register_monitor.jl` | Given a date range, returns relevant rules with delta on hospital margin. | **P2** |

---


#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
#### 7.5 Package decomposition (revised for pure-Julia stack)

The §3 cross-cutting recommendation to split the umbrella becomes more important under the pure-Julia constraint, because the `RuralHospitalSim` umbrella currently bundles *both* the web app and the analytics. They should split:

| Package | Path | Purpose |
|---|---|---|
| `RuralCore.jl` | `packages/RuralCore` (exists) | Auth, audit, types, validation. No Genie / no Stipple deps. |
| `FinanceEngine.jl` | `packages/FinanceEngine` (exists, expand for Domain A & C) | All corporate-finance & cost-accounting math. No web deps. |
| `RuralReimbursement.jl` | **new** `packages/RuralReimbursement` | All Domain E payment math (CAH, REH, MA, RHC, 340B, MIPS/VBP/HRRP/HACRP, TEAM). No web deps. |
| `RuralAnalytics.jl` | **new** `packages/RuralAnalytics` | DEA, SFA, Cox PH, copula MC, Bayesian VBC, VaR/CVaR. No web deps. |
| `RuralStrategy.jl` | **new** `packages/RuralStrategy` | Balanced scorecard, real options, M&A valuation, scenario planning. No web deps. |
| `RuralReports.jl` | **new** `packages/RuralReports` | Weave/Typst templates, board packet, rating memo. Depends on the analytics packages but **not on Genie/Stipple**. |
| `RuralHospitalSim.jl` | repo root | The Genie/Stipple **application** that wires everything together. The only package that depends on web frameworks. |

This split has three concrete benefits in a pure-Julia stack:

1. The analytics packages can be `Pkg.add`ed by an external researcher who wants only the math (e.g., for a Pluto.jl notebook), without dragging in the entire web framework.
2. CI runs faster — only the application package needs Stipple/Genie precompile time.
3. JuliaHub publication is cleaner: each analytics package can be registered and cited independently in publications.


#### 7.6 Analyst self-service via Pluto.jl

Once the package decomposition is done, ship 4–6 reference **Pluto.jl notebooks** under `notebooks/`:

- `01_three_statement_model.jl` — drive A-01 from a CCN to a 5-yr projection.
- `02_dupont_and_distress.jl` — A-02, A-03 walkthrough.
- `03_cah_to_reh_real_options.jl` — A-06, E-02 decision under uncertainty.
- `04_service_line_portfolio.jl` — B-03 efficient frontier.
- `05_dea_efficiency.jl` — C-01 with a peer set.
- `06_mips_vbp_hrrp_impact.jl` — E-06 payment-program impact.

These are pure-Julia, browser-based, fully reactive, and serve as the analyst's "reproducible scenario" capability for §5 acceptance criterion #14.

---


---

## 📦 Repository: Rural-quality-julia

### 🔴 Missing Features (Active Gaps)
*No active gaps recorded.*

### 🟢 Built Features (Completed Gaps)
#### Gap 1+2 — SPC bridge: PCC dead-code + dev-branch pinning
**Closed:** 2026-04-08 (commit `7ceee25`, merged in `0caa960`)
**File added:** `src/RuralQualityAnalytics/spc_bridge.jl` (273 LOC)

Two coupled problems:

1. **PCC pinning fragility.** `compute_imr_chart`, `compute_p_chart`, etc.
   came exclusively from `PediatricClinicalCalc` on a dev branch. A
   force-push or branch deletion would have broken production silently.
2. **HealthcareSPC dead code.** Local implementations (`imr_chart`,
   `p_chart`, …) existed but were never called because the web layer used
   PCC's `compute_*` names instead.

Resolution: the bridge defines `compute_*` wrappers that activate the
HealthcareSPC implementations and shadow PCC's names (module-level
definitions take precedence over `using` imports). Web layer needed no
changes.

---


#### A1 — Surface canonicalized RuralQualityCore functions in Web API + UI
**Closed:** 2026-04-28 (commits `621284d`, `35d63ab`)

`A1 — Tier 1` exposed RQC's canonicalized functions through the JSON API
(`web/src/api_routes.jl`). `A1 T2.3` added direct + indirect
standardization panels to the Stipple UI. Both tasks were prerequisites
for clinical users to actually call the functions migrated in Pass-3
canonicalization without dropping into the Julia REPL.

---


#### Stabilization sweep — test coverage, CI matrix, `[sources]` SHA pin
**Closed:** 2026-04-28 (commit `8a14e6d`)

Brought test coverage above the threshold gate, expanded the CI matrix to
cover Julia 1.9 / 1.10 / 1.11 / 1.12, and pinned the `[sources]` block to
explicit SHAs to prevent the upstream-dev-branch class of failure that
motivated the SPC bridge.

---


#### Pass-3 canonicalization — duplicate upstream port
**Closed:** 2026-04-28 (commits `c29fb20`, `4a1ebb0`, `aec6240`)
**Detail:** see `PORTING_NOTES.md`

`HealthcareQuality/` and `QualityEngine/` (added April 27 in `c8f6118`)
duplicated work already in `src/RuralQualityCore/` from the April-23
hygiene sweep. Of ~5,000 LOC across both packages, only ~430 LOC was
genuinely new. That ~430 LOC was migrated into RQC
(`clinical_extras.jl`, `risk_adjustment.jl` append, `audit_log.jl`); the
duplicate packages were deleted; `PORTING_NOTES.md` was rewritten to
record the lesson.

End state: one canonical home for every function — `src/RuralQualityCore/`
or `src/HealthcareSPC/`, both reachable via `using RuralQualityAnalytics`.

---


---

## 📦 Repository: Patient-simulation-julia

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: Graphmaster-julia

### 🔴 Missing Features (Active Gaps)
#### 🔴 Critical Gaps: Structured Data Sources


#### # Relational Databases (0% Coverage)
- ❌ **PostgreSQL** - Most critical for enterprise data
- ❌ **MySQL/MariaDB** - Common in legacy systems
- ❌ **SQLite** - Useful for local/embedded data
- ❌ **SQL Server** - Enterprise Windows environments
- ❌ **Oracle** - Financial/legacy systems
- **Impact**: Cannot ingest structured data from 80% of enterprise sources
- **Why it matters**: Tables → Entity nodes, Foreign keys → Relationships


#### # NoSQL/Document Databases (0% Coverage)
- ❌ **MongoDB** - Document-oriented data
- ❌ **Cassandra** - Time-series/distributed data
- ❌ **DynamoDB** - AWS native database
- ❌ **Firestore** - Google Cloud database
- ❌ **Redis** - In-memory data store
- **Impact**: Cannot ingest unstructured/semi-structured data
- **Why it matters**: JSON documents directly → Graph entities


#### # Data Warehouses (0% Coverage)
- ❌ **Snowflake** - Cloud-native DW
- ❌ **BigQuery** - Google's data warehouse
- ❌ **Redshift** - AWS data warehouse
- ❌ **Databricks** - Lakehouse platform
- **Impact**: Cannot leverage structured analytics data
- **Why it matters**: Pre-computed aggregations → Domain-specific entities


#### # APIs & Data Services (Minimal Coverage)
- ⚠️ **Generic HTTP/REST** - Basic support (scraper only)
- ❌ **GraphQL** - No introspection or schema awareness
- ❌ **gRPC** - No support
- ❌ **Apache Kafka** - No streaming support
- ❌ **Message Queues** - No RabbitMQ, AWS SQS, etc.
- ❌ **OpenAPI/Swagger** - No schema-driven ingestion
- **Impact**: Cannot ingest real-time or schema-validated data
- **Why it matters**: APIs are primary data source for modern apps


#### # Cloud Storage (0% Coverage)
- ❌ **AWS S3** - Enterprise file storage
- ❌ **Google Cloud Storage** - Cloud-native storage
- ❌ **Azure Blob Storage** - Microsoft cloud
- ❌ **Dropbox API** - Personal/team storage
- **Impact**: Cannot leverage cloud-based document repositories
- **Why it matters**: S3 contains terabytes of enterprise data


#### # Specialized Formats (Minimal Coverage)
- ⚠️ **CSV** - No native support (parse as text, poor structure)
- ❌ **Excel (.xlsx)** - No support (DOCX-like, needs parsing)
- ❌ **Parquet** - No columnar format support
- ❌ **Avro** - No schema-aware serialization support
- ❌ **XML** - No structured XML parsing
- ❌ **YAML/TOML** - No configuration format support
- ❌ **Images** - No OCR or image content extraction
- ❌ **Audio** - No speech-to-text
- ❌ **Video** - No transcription or frame extraction
- **Impact**: Cannot ingest majority of data formats
- **Why it matters**: CSV/Excel/Parquet are primary data exchange formats


#### # Knowledge Sources (0% Coverage)
- ❌ **Wikipedia** - Public knowledge base (crawlable but not integrated)
- ❌ **Wikidata** - Structured knowledge
- ❌ **DBpedia** - Linked data knowledge base
- ❌ **ConceptNet** - Common sense knowledge
- ⚠️ **LLM-Generated Knowledge** - Can use APIs, but not native
- **Impact**: Cannot leverage external knowledge graphs
- **Why it matters**: Enriches domain-specific graphs with common knowledge

---


#### # Graph Export Formats (🔴 Critical)
- ❌ **GraphML** - Standard graph interchange format
- ❌ **RDF/Turtle** - Semantic web standard
- ❌ **Neo4j Cypher** - Property graph format
- ❌ **Cytoscape.js JSON** - Web visualization format
- ❌ **Gexf** - Graph visualization format
- **Impact**: Graph only usable within Julia ecosystem
- **Why it matters**: Interoperability with other tools


#### # Vector Store Exports (🔴 Critical)
- ⚠️ **Raw vectors** - Can export via API, not optimized
- ❌ **FAISS-compatible format** - Facebook AI vector search
- ❌ **Pinecone format** - Vector database format
- ❌ **Weaviate format** - Vector DB format
- ❌ **Milvus format** - Open-source vector DB
- ❌ **Chroma format** - Embedding database
- **Impact**: Vector indices locked into Julia system
- **Why it matters**: Vector exports enable downstream uses


#### # Structured Data Exports (🟡 Important)
- ⚠️ **CSV** - Partial via custom code
- ❌ **Parquet** - Columnar format for analytics
- ❌ **SQL INSERT statements** - Direct DB import
- ❌ **Document formats** - DOCX, PDF regeneration
- **Impact**: Results trapped in system
- **Why it matters**: Users need to consume results in external tools


#### # Document Outputs (🟡 Important)
- ⚠️ **Markdown** - Can export as text
- ❌ **HTML** - No HTML rendering
- ❌ **PDF** - No PDF generation
- ❌ **EPUB** - No e-book format
- **Impact**: Limited document output capabilities
- **Why it matters**: Users want readable documents

---


#### Chunking Strategy Gaps (🟡 Important)
- ⚠️ **Three strategies** - Sentence, Recursive, Semantic
- ❌ **Custom chunkers** - No plugin interface
- ❌ **Language-specific chunking** - Hard-coded for English
- ❌ **Domain-specific chunking** - No specialized rules
- **Impact**: Cannot adapt chunking to new domains
- **Why it matters**: Chunking is crucial and domain-specific


#### Metadata Schema (🟡 Important)
- ❌ **Flexible schema** - Hardcoded field extraction
- ❌ **Custom extractors** - No plugin system
- ❌ **Schema versioning** - No evolution path
- **Impact**: Schema changes require code modification
- **Why it matters**: Different domains have different metadata needs

---


#### 🔴 **1. Graph Visualization** — The #1 Gap
- **Backend**: Full MetaDiGraph with statistics available
- **UI**: None. Cannot visualize graph structure, relationships, or centrality
- **Impact**: Cannot explore knowledge interactively
- **Effort**: Medium (D3.js or Cytoscape integration)
- **Value**: Unlock core use case of knowledge exploration


#### 🔴 **2. RAG Pipeline Transparency** — Features Hidden
- **Backend**: 4 strategies (Basic, RRF, HyDE, GraphRAG) fully implemented
- **UI**: No strategy selection, context display, or reranking visibility
- **Impact**: Users can't see what's being retrieved or tune results
- **Effort**: Low-medium (expose existing API, add UI components)
- **Value**: Enable advanced search and debugging


#### 🔴 **3. Document Management** — No Upload UI
- **Backend**: Multi-format parsing, bulk processing, metadata extraction
- **UI**: No upload form, delete, archive, or search
- **Impact**: Must use API directly or command-line; no lifecycle management
- **Effort**: Medium (file upload handler + CRUD UI)
- **Value**: Enable self-service document ingestion


#### 🔴 **4. Analytics Dashboard** — Insights Hidden
- **Backend**: Centrality, communities, cross-domain links, metrics
- **UI**: None. No visualization of important nodes or graph insights
- **Impact**: Cannot understand graph structure or importance
- **Effort**: High (charting library + new pages)
- **Value**: Enable data-driven exploration


#### 🔴 **5. Configuration UI** — No Runtime Controls
- **Backend**: Tunable parameters for chunking, search, RAG, embeddings
- **UI**: None. Cannot change behavior without restarting
- **Impact**: Limited experimentation and optimization
- **Effort**: Medium (settings page + backend API)
- **Value**: Enable parameter experimentation

---


#### ❌ Not Covered (Entire Backend Subsystems Hidden)
- ❌ Graph visualization
- ❌ Advanced RAG (RRF, HyDE, GraphRAG)
- ❌ Centrality/community analysis
- ❌ Cross-domain link discovery
- ❌ Configuration management
- ❌ Namespace management
- ❌ Index management
- ❌ Audit log viewing

---


#### # 🔴 Knowledge Graph Operations
- **Graph visualization**: No visual representation of the graph structure
- **Node/edge inspection**: No way to drill into individual nodes or relationships
- **Path finding**: No shortest path or relationship path exploration
- **Graph filtering**: Cannot filter by node/edge type, domain, or custom criteria
- **Subgraph extraction**: No ability to export or analyze subgraphs
- **Relationship browsing**: No traversal of graph neighbors or multi-hop relationships


#### # 🔴 Advanced Search Features
- **Faceted search**: No filtering by document, concept, date, etc.
- **Aggregation**: No result grouping, clustering, or categorization
- **Relevance tuning**: No way to adjust search weights or strategies
- **Saved searches**: No bookmarking or history
- **Search analytics**: No tracking of popular queries or click-through rates


#### # 🔴 Document Management
- **Document deletion/archiving**: No lifecycle management
- **Document versioning**: No version history or rollback
- **Document search/filtering**: Cannot search/filter document list
- **Bulk operations**: No batch upload or processing
- **Document preview**: No in-UI document viewing

- **Strategy selection**: UI doesn't expose RRF, HyDE, GraphRAG strategies
- **Context inspection**: Cannot see what context was retrieved for a query
- **Reranking visualization**: No visibility into reranking results
- **Token budget display**: No visibility into context assembly

- **Centrality rankings**: No visualization of important nodes
- **Community visualization**: No community detection results UI
- **Cross-domain links**: No UI for exploring domain connections
- **Graph metrics dashboard**: No aggregated graph statistics


#### # 🔴 Configuration & Settings
- **Runtime configuration**: No UI for changing settings
- **Embedding provider selection**: No way to switch between providers
- **Model parameters**: No exposure of tunable parameters (top-k, temperature, etc.)
- **Chunking strategy selection**: Cannot change chunking behavior
- **Diagnostics thresholds**: No customizable health check thresholds

- **Namespace switching**: No UI for switching between namespaces
- **Namespace management**: Cannot create/delete namespaces from UI
- **Per-namespace dashboards**: No namespace-specific metrics


#### # 🔴 Advanced Admin Features
- **Index management**: No rebuild or optimization controls
- **Cache management**: No cache clearing or statistics
- **Backup/export**: No data export interface (API only)
- **Performance tuning**: No profiling or optimization UI
- **Resource limits**: No quota or rate limiting controls


#### # 🔴 Collaboration Features
- **User management**: No user accounts or permissions
- **Sharing**: No ability to share searches, graphs, or reports
- **Annotations**: No user notes or comments on results
- **Query templates**: No saved query patterns or templates

---


#### # 🟡 Limited Data Export
- **JSON-only export**: No CSV, Excel, or other formats
- **Full export only**: Cannot export filtered subsets
- **No scheduled exports**: No recurring export scheduling


#### # 🟡 Accessibility Issues
- **No keyboard shortcuts**: All navigation via mouse
- **Limited ARIA labels**: Screen reader support unclear
- **No dark mode toggle**: Theme hardcoded per session
- **No text sizing**: No zoom or font size controls


#### # 🟡 Mobile Experience
- **Desktop-only design**: Not optimized for mobile/tablet
- **Fixed widths**: May not adapt to small screens
- **No touch optimization**: Buttons/links may be too small

---


### 🟢 Built Features (Completed Gaps)
#### # Support Stack
| Category | Technology |
|----------|------------|
| **State Management** | React Context + TanStack Query |
| **Styling** | Tailwind CSS |
| **HTTP Client** | TanStack Query (with axios/fetch) |
| **Routing** | React Router v6 |
| **Type Safety** | TypeScript |
| **Build Tool** | Vite (fast, modern) |
| **Testing** | Vitest + React Testing Library |


#### Decision Rationale

**Why Observable.js is Perfect for This Project**:
1. **Exploratory Analytics**: Graphmaster is about knowledge discovery → Observable excels here
2. **Real-time Dashboards**: Observable's reactive model = live metrics without boilerplate
4. **Scientific Audience**: Observable designed for data scientists/researchers
5. **Zero Boilerplate**: Declare reactivity, not manage state manually

**Why Not Other Options**:
- ❌ **Plain React**: Would need separate charting library (Chart.js/Plotly) → Observable is better
- ❌ **Vue.js**: Smaller ecosystem, less visualization-focused than Observable
- ❌ **HTMX**: Can't build interactive visualizations and dashboards needed

---


#### Backend Integration Points
- **Vector search API**: React form component + Observable table for results
- **Graph operations**: Cytoscape.js + Observable for graph rendering and metrics
- **Diagnostics API**: Observable reactive components for live dashboard
- **Document API**: React file upload component + drag-drop handler
- **RAG Pipeline**: Observable for context window visualization and metrics
- **Analytics**: Observable for all charts (centrality, communities, trends)


#### Performance Considerations
- Observable.js handles data-driven rendering efficiently
- Graph visualization optimized with Cytoscape WebGL renderer for 100k+ nodes
- React lazy loading for pages with large datasets
- Intersection Observer for infinite scroll tables
- Service Worker for caching API responses
- React.memo for component memoization
- Observable cells update only when dependencies change


#### Complete Technology Stack


#### # Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18+ with TypeScript | Component architecture, type safety |
| **Visualization** | Observable.js | Reactive data visualization ecosystem |
| **Charting** | Vega-Lite (via Observable) | Declarative statistical graphics |
| **Graph Rendering** | Cytoscape.js | Knowledge graph visualization |
| **Tables** | React Table v8 (headless) | Flexible, powerful table component |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **State Management** | React Context + TanStack Query | Local + server state |
| **HTTP Client** | TanStack Query (axios/fetch) | Data fetching, caching, sync |
| **Routing** | React Router v6 | Client-side navigation |
| **Build Tool** | Vite | Lightning-fast development & builds |
| **Type Checking** | TypeScript 5+ | Full type safety |
| **Testing** | Vitest + React Testing Library | Unit & component tests |
| **Linting** | ESLint + Prettier | Code quality and formatting |


#### # Backend (Unchanged)
- **Language**: Julia 1.10+
- **Graph Storage**: MetaDiGraphs, JLD2 persistence
- **Vector Index**: HNSW, Flat Index
- **HTTP Server**: HTTP.jl
- **APIs**: RESTful endpoints (already defined)


#### # Integration Points
```
Frontend (React + Observable)
  ↓ (HTTP)
Backend REST API
  ├── /api/search (semantic + graph)
  ├── /api/documents (CRUD)
  ├── /api/graph/* (stats, search, visualization)
  ├── /api/diagnostics (health, metrics)
  ├── /api/errors (logging, replay)
  └── /api/namespaces (multi-tenancy)
  ↓
Julia Backend
  ├── Vector indexing
  ├── Knowledge graph construction
  ├── RAG pipeline
  ├── Analytics (centrality, communities, etc.)
  └── Error tracking & recovery
```


#### Development Environment Setup

```bash
# Frontend setup
npm create vite@latest graphmaster-ui -- --template react-ts
cd graphmaster-ui
npm install
npm install -D tailwindcss postcss autoprefixer
npm install @observablehq/plot vega vega-lite
npm install cytoscape react-cytoscape
npm install @tanstack/react-query @tanstack/react-table
npm install react-router-dom
npm run dev

# Julia backend (unchanged)
cd ../Graphmaster-julia
julia --project=. -e "using Pkg; Pkg.instantiate()"
julia scripts/serve.jl
```


#### Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Docker Container                │
├────────────────────┬────────────────────┤
│  Frontend (React)  │  Backend (Julia)   │
│  - /dist (static)  │  - Port 8080       │
│  - Port 3000       │  - HTTP API        │
├────────────────────┼────────────────────┤
│     Reverse Proxy (nginx)               │
├────────────────────┼────────────────────┤
│     Volume Mounts                       │
│  - /data (persistence)                  │
│  - /logs (audit trails)                 │
└─────────────────────────────────────────┘
```


#### Observable.js Integration Pattern

Observable.js integrates into React components seamlessly:

```typescript
// React component using Observable
import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";

export const CentralityChart = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plot = Plot.barX(data, {
      x: "centrality_score",
      y: "node_name",
      sort: { x: "descending" }
    }).plot();
    
    containerRef.current?.appendChild(plot);
    return () => plot.remove();
  }, [data]);

  return <div ref={containerRef} />;
};

// Or use Observable cells directly
export const DashboardMetrics = () => {
  const metrics = Observable.cells`
    data = fetch('/api/metrics').then(r => r.json())
    chart = Plot.line(data, { x: 'time', y: 'health' })
  `;
  
  return <div>{metrics.chart}</div>;
};
```

This pattern keeps Observable's reactivity while integrating into React's component model.

---


---

## 📦 Repository: Geo-julia

### 🔴 Missing Features (Active Gaps)
#### # 5. **Analysis Framework** (COMPLETE)
- Spatial operations (buffer, intersect, union, clip, dissolve)
- Statistical analysis (autocorrelation, hotspots, clustering, kriging)
- Modeling framework (training, prediction, cross-validation)
- Feature extraction and preprocessing
- Interpolation capabilities


#### # 6. **Visualization** (COMPLETE)
- Map rendering foundation
- Feature plotting
- Heatmap generation
- Cluster visualization
- Animated map support


#### # 7. **Workflow Orchestration** (COMPLETE)
- Pipeline creation and execution
- Step-based workflow management
- Pipeline templates:
  - Weather Analysis
  - Disaster Risk Assessment
  - Environmental Monitoring
  - Urban Planning


#### # 8. **Utilities** (COMPLETE)
- Comprehensive logging system
- Performance monitoring
- Helper functions (geospatial calculations, formatting)
- Configuration management
- JSON/file-based persistence

---


#### # 6. **Visualization Implementation** (MEDIUM)
**Status**: Stubs only  
**Gap**: create_basemap(), plot_features() don't render anything  
**Options**:
- Makie.jl for interactive maps
- PyPlot/GMT for static maps  
- Leaflet.jl web maps

**Effort**: 2 weeks


#### # 7. **Performance Optimization** (MEDIUM)
**Gaps**:
- No parallel processing implementation for batch operations
- No spatial indexing (R-tree, quadtree)
- No GPU acceleration for matrix operations

**Effort**: 2-3 weeks


#### # 8. **Authentication & Security** (MEDIUM)
**Gaps**:
- No API key management
- No OAuth2 implementation
- No data encryption
- No access control

**Effort**: 2 weeks

---


#### 🟠 Lower Priority - Enhancement Gaps


#### # 9. **Advanced Workflows** (LOW-MEDIUM)
**Gap**: Workflow pipeline exists but needs production templates  
**Needed**:
- Error recovery and retry logic
- Workflow persistence and resumption
- Dependency tracking
- Progress reporting

**Effort**: 2 weeks


#### # 10. **Time Series Analysis** (LOW-MEDIUM)
**Gaps**:
- No temporal trend analysis
- No seasonality detection
- No forecasting models
- Integration with TimeSeries.jl needed

**Effort**: 2 weeks


#### # 11. **Large-Scale Data Support** (LOW)
**Gaps**:
- No chunking for large files
- No streaming data ingestion
- No distributed processing
- Limited to single-machine memory

**Effort**: 3+ weeks


#### # 12. **Testing & Quality** (MEDIUM-HIGH PRIORITY)
**Critical Gap**: No test suite exists  
**Needed**:
- Unit tests for all functions
- Integration tests with real APIs (or mocks)
- Performance benchmarks
- Documentation tests

**Effort**: 3 weeks

---


### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: Evidence-based-julia

### 🔴 Missing Features (Active Gaps)
- [ ] Implement middleware-level rate limiting in `src/api/middleware.jl`:
  - Use an in-memory sliding-window counter keyed by IP + user_id
  - Default limits: 100 req/min per IP (unauthenticated), 300 req/min per user (authenticated)
  - POST `/reviews/:id/run` and `POST /batches` should be further limited to 10/min per user

- [ ] Return `429 Too Many Requests` with `Retry-After` header when limit is exceeded

- [ ] Log rate-limit violations at `WARN` level

- [ ] Document rate limit values in `API.md`


#### Files to change
- `src/api/middleware.jl`
- `src/api/routes.jl` (apply rate-limit middleware to relevant routes)
- `API.md`

---


#### Problem
Documented in `BUGS.md`: the export modal shows no progress while a large export is being generated (5+ minutes for large reviews). The UI appears frozen. Users have no feedback and may cancel or refresh the page, losing their export.


- [ ] Change the export endpoint to stream progress or use a two-step pattern:
  - `POST /reviews/:id/export-job?format=csv` → returns `{"job_id": "..."}` immediately
  - `GET /export-jobs/:id/status` → returns progress and download URL when ready

- [ ] Update the export modal in `web/src/pages/ReviewDetail.tsx` to show a progress spinner / "Generating export…" message while polling

- [ ] Add a timeout (e.g., 10 minutes) after which the export job is marked failed

- [ ] Alternatively (simpler): add a loading spinner that displays as soon as the user clicks Export, and an estimated time message


#### Files to change
- `src/api/routes.jl` (optional: add export job endpoints)
- `web/src/pages/ReviewDetail.tsx`

---


### 🟢 Built Features (Completed Gaps)
#### Risk
- Hardcoded salt means all password hashes are deterministic across all deployments.
- Non-cryptographic hash can be reversed with brute-force in seconds on modern hardware.
- Non-timing-safe comparison exposes a side-channel attack surface.


- [ ] Add `Argon2` or `SHA` (with PBKDF2) to `Project.toml`; prefer `Argon2.jl` (argon2id variant)

- [ ] Replace `hash_password` with a proper salted KDF (random salt per user, stored alongside hash)

- [ ] Replace `verify_password` with a constant-time comparison (e.g., `Argon2.verify`)

- [ ] Add a one-time migration that forces all existing users to reset their passwords on next login (set `password_reset_required = true` column)

- [ ] Update `src/db/schema.jl` if password column needs to be wider (Argon2 output is ~95 chars)


#### Files to change
- `src/auth/auth.jl`
- `Project.toml`
- `src/db/schema.jl` (if column width needs increasing)
- `src/db/user_repository.jl`

---


---

## 📦 Repository: biostatistics-textbook-julia

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: .github

### 🔴 Missing Features (Active Gaps)
- ✅ Gap ID format: `GAP-NNN` (numeric, 3–4 digits)
- ✅ Gap ID uniqueness: No duplicate IDs
- ✅ Status enum: Values from approved list
- ✅ Priority enum: [P0, P1, P2, P3, P4]
- ✅ Required fields per gap: Status, Priority, Owner, Target Completion
- ✅ JSONL format: Valid JSON on each line of build-ledger.jsonl


#### # Schema Enforcement
- ✅ `schema.md` exists and contains required sections
- ✅ `.gitignore` exists and ignores `status.json`
- ✅ P0/P1 gaps have assigned owners (not [Unassigned])
- ✅ P0/P1 gaps have target completion dates (not TBD)


#### Valid Status Values

The workflow accepts these status values:

```
Not Started
Backlog
In Progress
Blocked
In Review
Completed
Archived
(Legacy: In the Air, Building, Committed)
```


#### Status Update Cadence

Per the organization standard:
- **Minimum:** Weekly
- **Ideal:** On every PR merge
- **Never:** More than 2 weeks without update


#### Example: Valid Gap Entry

```markdown

#### GAP-001: Implement QuadraticSpline interpolation

**Status:** In Progress  
**Priority:** P1  
**Owner:** @alice  
**Target Completion:** 2026-06-30  

**Description:**  
Implement QuadraticSpline interpolation for CDC/WHO growth reference tables 
(0–19 years). Validate against NCHS published z-scores.

**Related PRs:**  
- #42 (WIP)
- #43 (In Review)

**Last Status Update:** 2026-05-02 — Coding phase, unit tests 95% done
```


#### Example: Invalid Gap Entry

```markdown

#### GAP-001: Implement QuadraticSpline interpolation

**Status:** In Development    # ❌ Invalid status (should be "In Progress")
**Priority:** CRITICAL        # ❌ Invalid priority (should be P0-P4)
**Owner:** [Unassigned]       # ⚠️  Warning: P1 gap needs owner
**Target Completion:** TBD    # ⚠️  Warning: P1 gap needs target date
```


#### Handling Validation Failures

If the workflow fails, the PR cannot merge. Check the workflow output:

1. **Format errors** (❌ blocks merge):
   - Invalid status/priority values
   - Duplicate gap IDs
   - Malformed JSONL

2. **Schema warnings** (⚠️ informational):

To fix:

1. Edit `.gap-analysis/GAP_ANALYSIS.md` according to the error message
2. Commit and push
3. Workflow re-runs automatically

---


    "❌[GAP-001]: Invalid status 'In Development'"
  ],
  "warnings": [
  ],
  "summary": {
    "error_count": 1,
    "warning_count": 1,
    "info_count": 5
  }
}
```

---


- Trigger `gap-bootstrap-auto` workflow in `ruralpeds/.github` with this repo name
- Or wait for next monthly run


#### "Duplicate gap IDs"

**Cause:** Two gaps with the same ID in the document.

**Solution:**

1. Identify the duplicates in `.gap-analysis/GAP_ANALYSIS.md`
2. Renumber one of them to the next available number
3. Commit and push


#### "Invalid status 'In Development'"

**Cause:** Status value is not in the approved enum.

**Solution:**
Change status to one of:
```
Not Started, Backlog, In Progress, Blocked, In Review, Completed, Archived
```


#### "build-ledger.jsonl: Invalid JSON on line 5"

**Cause:** A line in the ledger is not valid JSON.

**Solution:**

1. Open `.gap-analysis/build-ledger.jsonl`
2. Check line 5 for syntax errors
3. Consult `gap_lifecycle.py` or issue an event using its CLI


#### Workflow fails but changes look correct

**Cause:** Validation is stricter than expected, or outdated cache.

**Solutions:**
1. Re-run the workflow from the Actions tab
2. Push an empty commit to force re-run: `git commit --allow-empty -m "Re-run validation"`
3. Check for whitespace issues or special characters

---


#### Find P0 gaps
```bash

grep -A 1 "^### GAP-" .gap-analysis/GAP_ANALYSIS.md | grep -B 1 "P0 (Blocker)"
```


#### Find unassigned P1 gaps
```bash

grep -B 2 "Owner\]: \[Unassigned\]" .gap-analysis/GAP_ANALYSIS.md | grep "P1 (Critical)"
```


#### Count gaps by status
```bash

cat .gap-analysis/status.json | jq '.by_status'
```


#### Find blocked gaps
```bash

rg "Status.*Blocked" .gap-analysis/ -A 5
```


#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

3. Adds `.github/workflows/gap-analysis-lifecycle.yml` (caller)

4. Adds `.github/workflows/gap-analysis-audit.yml` (scheduled caller)

5. Ensures `gap-analysis-validate.yml` and `gap-analysis-sync-index.yml` are present

6. Commits to a `bootstrap/gap-analysis-v1` branch and opens a PR

All 68 repos converge to the same cycle.

---


#### Handling Validation Failures

If validation fails in a PR:

1. Read the workflow output for the specific error
2. Identify which gap(s) have issues
3. Fix according to the validation rules (see `docs/GAP_ANALYSIS_WORKFLOWS.md`)
4. Push changes (validation re-runs automatically)

---


#### GAP-001: [Feature name]

**Status**: Not Started
**Priority**: P2 (High)
**Owner**: [Unassigned]
**Target Completion**: YYYY-MM-DD

**Description**:

**Acceptance Criteria**:

#### 2. Aging Gap Detection (`gap_aging_check.py`)

Identifies gaps that need attention based on age thresholds.

**Detects:**
- Last Status Update > 30 days old
- P0/P1 gaps in "In Progress" > 60 days
- Gaps in "Blocked" status > 90 days

**Features:**
- Runs daily on schedule
- Event-driven for GAP_ANALYSIS.md changes
- JSON report output
- Feeds into notification system

---


#### 3. Notification System (`gap_notifications.py`)

Sends Slack notifications for gap events.

**Events:**
- New P0/P1 gaps created
- Gaps aging beyond thresholds
- Release blockers detected
- Gap ownership assignments

**Features:**
- Slack webhook integration
- Custom message formatting
- Multiple channel support
- Audit trail preservation

---


#### 4. Ownership Assignment (`gap_ownership.py`)

Suggests and assigns ownership for unassigned gaps.

**Suggestion Logic:**
- CODEOWNERS file patterns
- Repository maintainers
- Gap description analysis

**Features:**
- High-confidence suggestions (70%+)
- Fallback to primary maintainer
- Auto-assignment mode
- JSON suggestions report

---


#### 5. Notification Workflow (`gap-notifications.yml`)

Scheduled and event-driven notifications.

**Triggers:**
- **Scheduled:** Every day at 8 AM UTC
- **Event-driven:** When GAP_ANALYSIS.md changes

**Operations:**
- Runs `gap_aging_check.py`
- Sends Slack notifications
- Integrates with release gate

---


#### 6. Release Gate Workflow (`release-gate-gaps.yml`)

Reusable workflow for repos to enforce release gates.

**Inputs:**
- `tag` — Release tag
- `force_approval` — Override gate (boolean)
- `approval_reason` — Reason for override

**Outputs:**
- `gate_passed` — Boolean result
- `violations_count` — Number of violations
- `report_file` — JSON audit report path

**Artifacts:**
- Release gate report (30-day retention)

---


- [ ] Review your repo's GAP_ANALYSIS.md

- [ ] Update Last Status Update fields (at least weekly)

- [ ] Assign owners to all gaps

- [ ] Set realistic target completion dates for P1 gaps

**Questions?**

See [GAP_ANALYSIS_GOVERNANCE_INTEGRATION.md](GAP_ANALYSIS_GOVERNANCE_INTEGRATION.md) or contact @timothyhartzog.

Thanks,
Architecture Team

---


#### GAP-001: Restore the gap-analysis template after archival

**Status**: Completed
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-05-05

**Description**:

`templates/gap-analysis/GAP_ANALYSIS.md` was moved into `docs/archive/2026-04-gap-analysis/` on 2026-04-28 because its example data (rust-sci-core) was stale. Downstream repos still need a copy-pasteable template; the standards docs were also archived. Restore a clean template + minimal standards reference under `.gap-analysis/` so the documented bootstrap path (`cp -r ../.github/templates/gap-analysis .gap-analysis`) keeps working.

**Acceptance Criteria**:

- [x] Old materials archived under `docs/archive/2026-04-gap-analysis/`

- [x] New `templates/gap-analysis/GAP_ANALYSIS.template.md` (clean, no fictional gaps)

- [x] New `templates/gap-analysis/schema.md`

- [x] New `templates/gap-analysis/.gitignore.template` (ignores `status.json`)

- [ ] `.gap-analysis/README.md` linking to standards & quick reference — deferred to GAP-011

- [ ] Update `CONTRIBUTING.md` and `INSTALL.md` references — deferred to GAP-011

**Related PRs**: #50
**Blocked By**: None
**Last Status Update**: 2026-04-28
- Status → **Completed** (PR #50 merged @ `6bd230c` by @copilot)

- Status → **In Review** (workflow: pr_opened — branch `copilot/feat-gap-analysis-rollout` — by @copilot)
- Archive complete; new gap analysis (this file) and `WORKFLOW_CATALOG.md` published; template restoration deferred to follow-up PR so this commit stays focused.

---


#### GAP-002: Reconcile stray top-level `/workflows/` directory

**Status**: Not Started
**Priority**: P1 (Critical)
**Owner**: [Unassigned]
**Target Completion**: 2026-05-15

**Description**:
Two files live in `/workflows/` at the repo root: `audit-sign-envelope.yml` and `reusable-iec62304-traceability.yml`. GitHub Actions only loads workflows from `.github/workflows/`, so these are **not executed**. Both have a counterpart in `.github/workflows/` with **different content** (the traceability file diverges by 216 lines — 405 vs 189). This is a silent-drift hazard for IEC 62304 traceability and 21 CFR Part 11 audit signing.

**Acceptance Criteria**:

- [ ] Diff each pair; decide which version is canonical

- [ ] Merge canonical content into `.github/workflows/<file>.yml`

- [ ] Delete `/workflows/` (or replace with a `README.md` redirecting readers to `.github/workflows/`)

- [ ] Add a CI check (e.g. `hygiene.yml`) that fails if `/workflows/*.yml` reappears

- [ ] Confirm no caller repo references `ruralpeds/.github/workflows/...@...` (only `ruralpeds/.github/.github/workflows/...@...` is valid)

**Implementation Notes**:
- Run `diff workflows/audit-sign-envelope.yml .github/workflows/audit-sign-envelope.yml` and `diff workflows/reusable-iec62304-traceability.yml .github/workflows/reusable-iec62304-traceability.yml`
- For traceability: the 405-line variant is likely newer; verify with `git log --follow`

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28
- Discovered during workflow-catalog audit (see [`docs/WORKFLOW_CATALOG.md` §9](../docs/WORKFLOW_CATALOG.md#9--standalone-files-in-workflows-not-picked-up-by-actions)).

---


#### GAP-003: This `.github` repo has no CI of its own

**Status**: Not Started
**Priority**: P1 (Critical)
**Owner**: [Unassigned]
**Target Completion**: 2026-05-22

**Description**:

The `.github` org repo ships 75 reusable workflows used by every other repo, but **none of them run on this repo's own pushes/PRs** beyond `gap-analysis-validate.yml`, `copilot-task-guardrails.yml`, `origin-label.yml`, and the scheduled audits. There is no `actionlint`, no Markdown link-check, no shellcheck for `scripts/`, no JSON-schema validation for `policies/custom-properties.json` or `policies/rulesets/*.json`. A broken workflow YAML can ship to main and break every consumer org-wide before anyone notices.

**Acceptance Criteria**:

- [ ] Add `.github/workflows/self-test.yml` that on push/PR runs:
  - [ ] `actionlint` against every file in `.github/workflows/`
  - [ ] `yamllint` against `.github/workflows/`, `policies/rulesets/`, `infrastructure/kubernetes/`
  - [ ] `jq -e .` against `policies/custom-properties.json` and every `policies/rulesets/*.json`
  - [ ] Markdown link-check on top-level docs (or at minimum `WORKFLOW_CATALOG.md`, `README.md`, `INSTALL.md`)
  - [ ] `python -m pytest tests/` (audit-verify, traceability)

- [ ] Add it as a required status check via `policies/rulesets/`

- [ ] Document in `WORKFLOW_CATALOG.md` §6

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---


#### GAP-004: SLSA v1 backfill verification not yet automated end-to-end

**Status**: Backlog
**Priority**: P1 (Critical)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-05-31

**Description**:

**Acceptance Criteria**:

- [ ] New scheduled workflow `attestation-verify.yml` (weekly Mon 06:30 UTC) that:
  - [ ] Reads `compliance-metrics/releases-phase-1-2.json`
  - [ ] Runs `gh attestation verify` for each release artifact digest
  - [ ] Posts results to `audit-log/attestation-verification.jsonl`
  - [ ] Opens an issue if any release fails verification

- [ ] Wire output into `org-dashboard.yml` provenance-coverage tile

- [ ] Update `WORKFLOW_CATALOG.md` §3 and §6

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---


#### GAP-005: Quarterly FMEA review automation

**Status**: Backlog
**Priority**: P2 (High)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-07-15

**Description**:
Year 2 roadmap Q3 commits to a quarterly Failure Mode & Effects Analysis review per ISO 14971. `reusable-risk-file.yml` aggregates `hazard:*` issues into `risk/hazard-analysis.md`, but there is **no scheduled trigger** that opens the quarterly review issue, nor a check that residual-risk acceptance signatures are <90 days old at release time. `release-gate.yml` enforces `AUDIT.yaml` age but not residual-risk-acceptance age.

**Acceptance Criteria**:

- [ ] Scheduled workflow opens an FMEA-review issue on the 1st of each quarter (Jan/Apr/Jul/Oct)

- [ ] `release-gate.yml` extended to fail when `risk/residual-risk-acceptance.yaml` is >90 days old

- [ ] Template added under `templates/dhf/fmea-quarterly-review.md`

- [ ] Documented in `docs/medical-device/IEC_62304_DHF_PATTERN.md`

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---


#### GAP-006: Post-market surveillance go-live (pilot → operational)

**Status**: In Progress
**Priority**: P2 (High)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-12-31

**Description**:
`post-market-tracker.yml` exists but has **no `on:` triggers** in the file head — it is effectively dormant. `dhf/post-market/` and `operations/PHASE7_POST_MARKET_SURVEILLANCE.md` define the procedures; the workflow needs to wire issue-opening, JSONL append to `dhf/post-market/complaints.jsonl`, and Slack notification per the Q2 pilot plan.

**Acceptance Criteria**:

- [ ] Add `on: { issues: { types: [opened, labeled] } }` to `post-market-tracker.yml` filtered to label `post-market`

- [ ] Append event stub to `dhf/post-market/complaints.jsonl` with deterministic event ID

- [ ] Slack notification to `#compliance-alerts` on new post-market events (gated by `SLACK_WEBHOOK_URL` secret)

- [ ] `post-market-event.md` issue template with the fields defined in `YEAR_2_ROADMAP.md` Q2 item 5

- [ ] Audit-log entry within 5 minutes of issue creation (verified by `audit-verify.yml`)

- [ ] Catalog entry added to `WORKFLOW_CATALOG.md` §6

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28
- Workflow file present but headless — needs trigger wiring before go-live.

---


#### GAP-007: Pin every reusable workflow caller example to a SHA

**Status**: Not Started
**Priority**: P2 (High)
**Owner**: [Unassigned]
**Target Completion**: 2026-06-15

**Description**:
`README.md` and `docs/USING_REUSABLE_WORKFLOWS.md` show `uses: ruralpeds/.github/.github/workflows/<name>.yml@main` in every example. Pinning to `@main` means any change to this repo immediately ships to all consumers — counter to the SLSA / NIST SSDF guidance the same workflows enforce, and counter to `policies/rulesets/` (which already requires signed commits but not pinned uses). Dependabot is configured (`.github/dependabot.yml`) but the docs still teach `@main`.

**Acceptance Criteria**:

- [ ] Replace every `@main` example in `README.md`, `INSTALL.md`, and `docs/USING_REUSABLE_WORKFLOWS.md` with `@<commit-sha>` placeholder + a one-line note pointing readers at Dependabot

- [ ] Add a `hygiene.yml` check that flags `@main` / `@master` in any caller repo's workflow file (warning, not failure, for the first iteration)

- [ ] Document SHA-pin policy in `docs/security/attestations.md`

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---


#### GAP-008: `ci-julia.yml` trigger surface inconsistent with sibling CI workflows

**Status**: Not Started
**Priority**: P3 (Medium)
**Owner**: [Unassigned]
**Target Completion**: 2026-06-30

**Description**:
Every other `ci-<lang>.yml` is `workflow_call`-only. `ci-julia.yml` runs on `push` + `pull_request`, which means it executes on this `.github` repo itself (where there is no Julia code), wasting minutes. There is also a separate `reusable-ci-julia.yml` that *is* `workflow_call`-only, creating consumer confusion.

**Acceptance Criteria**:

- [ ] Decide: collapse to one file (preferred) or document both clearly

- [ ] Remove `push` / `pull_request` triggers from `ci-julia.yml`, or rename it to `julia-self-test.yml` if it is intentionally self-running

- [ ] Update `README.md` and `WORKFLOW_CATALOG.md` §2

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---


#### GAP-009: README workflow table is duplicated and references both `timothyhartzog/.github` and `ruralpeds/.github`

**Status**: Not Started
**Priority**: P3 (Medium)
**Owner**: [Unassigned]
**Target Completion**: 2026-06-30

**Description**:
`README.md` lines 9–50 list every workflow twice (once under `timothyhartzog/.github`, once under `ruralpeds/.github`) and lines 185–294 repeat several blocks. With `WORKFLOW_CATALOG.md` now the source of truth, the README should shrink to a pointer + the 2–3 most commonly copied snippets.

**Acceptance Criteria**:

- [ ] Replace the duplicated table with a one-paragraph summary + link to `docs/WORKFLOW_CATALOG.md`

- [ ] Decide canonical org name (`ruralpeds` per the rest of the repo); replace `timothyhartzog` examples or document as legacy aliases

- [ ] Keep the "Example Usage" snippets (Node + Julia + Python + review-stamp + security)

**Related PRs**: None

**Blocked By**: GAP-007 (do the SHA-pin update at the same time)
**Last Status Update**: 2026-04-28

---


#### GAP-010: SOC 2 / HITRUST evidence collection not yet wired to ledger

**Status**: Backlog
**Priority**: P2 (High)
**Owner**: Timothy Hartzog
**Target Completion**: 2026-10-15

**Description**:
Year 2 roadmap Q4 commits to initiating SOC 2 Type II / HITRUST CSF audit. Evidence collection today relies on manual scrape of `audit-log/`, `compliance-metrics/`, `dhf/`. There is no scheduled "evidence-pack" workflow that bundles required artifacts (audit chain, e-signatures, SBOMs, SLSA attestations, RTM, FMEA) for the auditor.

**Acceptance Criteria**:

- [ ] New `reusable-audit-evidence-pack.yml` taking `period-start` / `period-end` inputs

- [ ] Output: signed tarball with `audit-log/ledger.json`, `audit-log/esignatures.jsonl`, latest SBOMs, SLSA attestations, latest `traceability/rtm.json`, latest `risk/hazard-analysis.md`

- [ ] Cosign-signed; uploaded to S3 Object Lock bucket per `infrastructure/terraform/`

- [ ] Documented in `docs/compliance/PART_11_EVIDENCE.md`

**Related PRs**: None
**Blocked By**: None
**Last Status Update**: 2026-04-28

---


#### GAP-011: AGENTS.md / CONTRIBUTING.md still reference moved gap-analysis paths

**Status**: Not Started
**Priority**: P3 (Medium)
**Owner**: [Unassigned]
**Target Completion**: 2026-05-12

**Description**:

After the 2026-04-28 archive move, any link to `docs/GAP_ANALYSIS_STANDARDS.md` or `docs/GAP_ANALYSIS_QUICK_REFERENCE.md` is now a 404. The standards doc itself listed several "See Also" links that need updating once GAP-001 lands.

**Acceptance Criteria**:

- [ ] `git grep -nE 'GAP_ANALYSIS_(STANDARDS|QUICK_REFERENCE)\.md'` returns zero hits outside `docs/archive/`

- [ ] All survivors point at the new template + `.gap-analysis/README.md`

**Related PRs**: None

**Blocked By**: GAP-001
**Last Status Update**: 2026-04-28

---


#### GAP-012: No coverage threshold enforcement in this repo's own scripts

**Status**: Backlog
**Priority**: P3 (Medium)
**Owner**: [Unassigned]
**Target Completion**: 2026-07-31

**Description**:

`scripts/` and `tests/` carry the gap-analysis validator, traceability checker, audit-verify helpers — code that gates regulated repos. There is no coverage gate on these scripts themselves. If GAP-003 lands first, fold this into the same self-test workflow.

**Acceptance Criteria**:

- [ ] `pytest --cov=scripts --cov-fail-under=80` in the new self-test workflow

- [ ] Coverage badge written to `docs/metrics/`

**Related PRs**: None

**Blocked By**: GAP-003
**Last Status Update**: 2026-04-28

---



#### Find P0 gaps
```bash

grep -A 1 "^### GAP-" .gap-analysis/GAP_ANALYSIS.md | grep -B 1 "P0 (Blocker)"
```


#### Find unassigned P1 gaps
```bash

grep -B 2 "Owner\]: \[Unassigned\]" .gap-analysis/GAP_ANALYSIS.md | grep "P1 (Critical)"
```


#### Count gaps by status
```bash

cat .gap-analysis/status.json | jq '.by_status'
```


#### Find blocked gaps
```bash

rg "Status.*Blocked" .gap-analysis/ -A 5
```


### 🟢 Built Features (Completed Gaps)
- [ ] Criterion 1

- [ ] Criterion 2

- [ ] Criterion 3

**Related PRs**: [#123, #124, or "None"]
**Blocking Issues**: [#456, or "None"]

**Blocked By**: [GAP-002, or external constraint; or "None"]

**Last Status Update**: [YYYY-MM-DD]
- [Brief update on progress; what changed since last update?]
```


```markdown

#### ✅ GAP-NNN: [Feature name]
**Status**: Completed
**Completed Date**: [YYYY-MM-DD]
**PR**: [#123]
**Completion Notes**: [Why was this approach chosen? Any follow-ups?]
```


#### ✅ GAP-001: sci-clinical cardiometabolic risk stratification
**Status**: Completed
**Completed Date**: 2026-05-12
**PR**: #42
**Completion Notes**: Implemented Framingham and ACC/AHA pooled cohort equations. Validated against published test sets; added 18 unit tests covering edge cases.
```


Commit: `git commit -m "docs: mark GAP-001 as completed"`


   ### ✅ GAP-001: sci-clinical cardiometabolic risk
   **Status**: Completed
   **Completed Date**: 2026-05-12
   **PR**: #42
   **Completion Notes**: Implemented Framingham, ACC/AHA, ASCVD equations. Validated against published tables. 18 unit tests.
   ```
   

   Commit: `git commit -m "docs: mark GAP-001 complete"`


#### Marking a gap as blocked

```markdown

#### GAP-002: Rosenbrock solver
**Status**: Blocked

**Blocked By**: GAP-005 (interval sampling improvements)

**Last Status Update**: 2026-04-23
- Waiting for sci-probability interval updates (issue #127). Cannot proceed until GMRES linear solver is available.
```


#### Unblocking a gap

```markdown

#### GAP-002: Rosenbrock solver
**Status**: In Progress    # Changed from "Blocked"

**Blocked By**: None       # Changed from "GAP-005"

**Last Status Update**: 2026-04-24

- GAP-005 merged! Rosenbrock23/34 implementation starting this week.
```


#### Archiving a gap (decided not to do)


```markdown


#### 🗑️ GAP-XXX: [Feature]
**Status**: Archived
**Archived Date**: 2026-06-15
**Reason**: Deprioritized in Q3 roadmap review. Revisit if customer demand increases.
```


- [ ] Criterion 1 (specific, measurable)

- [ ] Criterion 2

- [ ] Criterion 3

**Implementation Notes**:
[Technical approach, dependencies, links to relevant references.]

**Related PRs**: None
**Blocking Issues**: None
**Blocked By**: None

**Last Status Update**: YYYY-MM-DD
- [Brief note on progress.]

---


Move finished gaps here; archive after 90 days.


#### ✅ GAP-X: [Feature name]

**Status**: Completed
**Completed Date**: YYYY-MM-DD
**PR**: #N

---


#### ✅ GAP-000: Refresh gap analysis & build a workflow catalog

**Status**: Completed
**Completed Date**: 2026-04-28
**PR**: (this PR)
**Completion Notes**:

Archived `docs/GAP_ANALYSIS_STANDARDS.md`, `docs/GAP_ANALYSIS_QUICK_REFERENCE.md`, and `templates/gap-analysis/GAP_ANALYSIS.md` (with example data) into `docs/archive/2026-04-gap-analysis/` plus a README explaining the move and restoration commands. Authored `docs/WORKFLOW_CATALOG.md` cataloging all 75 workflows under `.github/workflows/` plus the 2 strays under `/workflows/`, mapping each to its triggers, regulation, and consumer pattern. This `GAP_ANALYSIS.md` replaces the old example with concrete gaps grounded in the catalog audit.

---


- [ ] Criterion 1

- [ ] Criterion 2

- [ ] Criterion 3

**Related PRs**: [#123, #124, or "None"]
**Blocking Issues**: [#456, or "None"]

**Blocked By**: [GAP-002, or external constraint; or "None"]

**Last Status Update**: [YYYY-MM-DD]
- [Brief update on progress; what changed since last update?]
```


```markdown

#### ✅ GAP-NNN: [Feature name]
**Status**: Completed
**Completed Date**: [YYYY-MM-DD]
**PR**: [#123]
**Completion Notes**: [Why was this approach chosen? Any follow-ups?]
```


#### ✅ GAP-001: sci-clinical cardiometabolic risk stratification
**Status**: Completed
**Completed Date**: 2026-05-12
**PR**: #42
**Completion Notes**: Implemented Framingham and ACC/AHA pooled cohort equations. Validated against published test sets; added 18 unit tests covering edge cases.
```


Commit: `git commit -m "docs: mark GAP-001 as completed"`


   ### ✅ GAP-001: sci-clinical cardiometabolic risk
   **Status**: Completed
   **Completed Date**: 2026-05-12
   **PR**: #42
   **Completion Notes**: Implemented Framingham, ACC/AHA, ASCVD equations. Validated against published tables. 18 unit tests.
   ```
   

   Commit: `git commit -m "docs: mark GAP-001 complete"`


#### Marking a gap as blocked

```markdown

#### GAP-002: Rosenbrock solver
**Status**: Blocked

**Blocked By**: GAP-005 (interval sampling improvements)

**Last Status Update**: 2026-04-23
- Waiting for sci-probability interval updates (issue #127). Cannot proceed until GMRES linear solver is available.
```


#### Unblocking a gap

```markdown

#### GAP-002: Rosenbrock solver
**Status**: In Progress    # Changed from "Blocked"

**Blocked By**: None       # Changed from "GAP-005"

**Last Status Update**: 2026-04-24

- GAP-005 merged! Rosenbrock23/34 implementation starting this week.
```


#### Archiving a gap (decided not to do)


```markdown


#### 🗑️ GAP-XXX: [Feature]
**Status**: Archived
**Archived Date**: 2026-06-15
**Reason**: Deprioritized in Q3 roadmap review. Revisit if customer demand increases.
```


---

## 📦 Repository: rural-hospital-modeling-julia-master

### 🔴 Missing Features (Active Gaps)
#### Domain 2: Healthcare Workforce (Gap Score: 8.5/10)

**Why Critical**: Rural hospital closures correlate with physician shortage and nursing supply gaps; essential for staffing model validation.


| Gap | Source | Type | Frequency | Counties | Est. Records |
|-----|--------|------|-----------|----------|--------------|
| **Physician Workforce (NPI registry)** | CMS/NPPES | Specialty, training, location, practice arrangement | Quarterly | 3,140 | 1M+ physicians |
| **Nursing Workforce** | BLS OES + HRSA | RN, LPN supply by county (educational pipeline) | Quarterly | 3,140 | 62,800 |
| **Healthcare Employment by Occupation** | BLS OES | Detailed occupations (1-digit to 6-digit SOC) | Annually | 3,140 | 188,400 |
| **Physician Loan Forgiveness Participation** | HRSA NHSC | National Service Loan Repayment participation | Quarterly | 3,140 | 15,000+ providers |
| **Medical School & Residency Production** | AAMC/ACGME | Training pipeline by specialty & region | Annually | 50+ metros | 500+ training programs |
| **Allied Health Workforce** | BLS OES | Respiratory therapists, medical technologists, etc. | Annually | 3,140 | 188,400 |

**Example Use Case**: Build workforce supply-demand model for rural ICU staffing by linking physician supply, nurse supply, and hospital expansion indicators.

---


#### Domain 3: Clinical Quality & Health Outcomes (Gap Score: 8/10)

**Why Critical**: Model hospital quality trajectories and predict readmission risk; essential for value-based care modeling.


| Gap | Source | Type | Frequency | Counties | Est. Records |
|-----|--------|------|-----------|----------|--------------|
| **30-Day Readmission Rates** | CMS/HCQIS | Hospital readmission (heart attack, heart failure, COPD) | Quarterly | 3,140 | 62,800 |
| **Hospital Mortality Rates (Risk-Adjusted)** | CMS/HCQIS | In-hospital mortality by DRG, risk-adjusted | Quarterly | 3,140 | 62,800 |
| **Safety Indicators (HAC)** | CMS/HCQIS | Hospital-acquired conditions (CAUTI, CLABSI, SSI) | Quarterly | 3,140 | 125,600 |
| **Timely & Effective Care (TEC)** | CMS/HCQIS | Door-to-balloon, hand-off communication, antibiotic timing | Quarterly | 3,140 | 125,600 |
| **Patient Satisfaction (HCAHPS)** | CMS/HCQIS | Hospital Consumer Assessment (communication, cleanliness) | Quarterly | 3,140 | 188,400 |
| **ED Wait Times** | CMS | Emergency department metrics (left without being seen) | Quarterly | 3,140 | 62,800 |
| **Antibiotic Stewardship** | CDC/NHSN | Hospital antibiotic consumption, resistance | Quarterly | 2,000+ | 500,000+ records |
| **AHA Hospital Statistics (Annual Survey)** | AHA | Patient mix, utilization, financial (requires membership) | Annually | 3,140 | 31,400 |

**Example Use Case**: Predict hospital financial distress by linking quality decline (readmission↑, mortality↑) with payer mix and DRG severity shifts.

---


#### Domain 4: Social Determinants of Health (Gap Score: 7.5/10)

**Why Critical**: County-level SDoH predictors are essential for understanding patient population vulnerability and resource allocation.


| Gap | Source | Type | Frequency | Counties | Est. Records |
|-----|--------|------|-----------|----------|--------------|
| **Food Insecurity** | USDA NASS | Food desert mapping, food bank locations | Annually | 3,140 | 31,400 |
| **Neighborhood Walkability (Walk Score)** | Walk Score API | Pedestrian-friendly infrastructure index | Annually | 3,140 | 31,400 |
| **Transportation Access** | APTA/US DOT | Public transit availability, car-dependent zones | Annually | 3,140 | 31,400 |
| **Air Quality (AQI by county)** | EPA AirNow | PM2.5, ozone, NO₂ by county | Daily | 3,140 | 1.1M+ records/yr |
| **Drinking Water Safety (Violations)** | EPA Safe Drinking Water | Water system violations by county | Quarterly | 3,140 | 62,800 |
| **Housing Quality & Cost Burden** | Census/ACS + HUD | Overcrowding, cost-burdened households, homelessness | Annually | 3,140 | 31,400 |
| **Poverty & Income Distribution** | Census/ACS + Opportunity Atlas | Multi-dimensional poverty index | Annually | 3,140 | 31,400 |
| **Broadband Access & Digital Divide** | FCC/NTIA | Broadband availability, speeds by county | Annually | 3,140 | 31,400 |

**Example Use Case**: Model telehealth adoption barriers by linking broadband gaps with physician supply to identify vulnerable counties unsuitable for virtual-first models.

---


#### Domain 5: Financial & Reimbursement (Gap Score: 8/10)

**Why Critical**: Hospital financial sustainability depends on payer mix, DRG severity, and payment rates—core drivers of closure risk.


| Gap | Source | Type | Frequency | Counties | Est. Records |
|-----|--------|------|-----------|----------|--------------|
| **Medicare Reimbursement Rates (PPS)** | CMS/Physician Fee Sch. | DRG weights, geographic adjustment factors (GPCI) | Annually | 3,140 | 125,600 |
| **Medicaid Reimbursement Rates (by state)** | State Medicaid | Hospital DRG rates by state (highly variable) | Annually | 50 states | 50 records |
| **Inpatient Claims (anonymized)** | CMS/Research | Sample claims for cost estimation & severity | Annually | 3,140 | 5M+ records/yr |
| **Hospital Financial Reporting (CMS-2552)** | CMS/Medicare | Cost center accounting, margin analysis, capital costs | Annually | 3,140 | 31,400 |
| **Charity Care & Bad Debt** | IRS/Form 990 | Tax-exempt hospital write-offs by county | Annually | 3,140 | 31,400 |
| **DRG Severity & CMI Trends** | CMS/HCQIS | Case mix index by hospital, year (indicates patient acuity) | Annually | 3,140 | 31,400 |
| **Insurance Market Concentration** | HHS/Medical Loss Ratio | Payer competition, market share by county | Annually | 3,140 | 31,400 |

**Example Use Case**: Model hospital financial distress by estimating net revenue = (CMI × DRG weight × payment rate × volume) - operational costs, stratified by payer mix.

---


#### Domain 6: Epidemiology & Disease Burden (Gap Score: 7/10)

**Why Critical**: County-level disease burden forecasts essential for capacity planning, specialty staffing, and outbreak response.


| Gap | Source | Type | Frequency | Counties | Est. Records |
|-----|--------|------|-----------|----------|--------------|
| **Influenza-like Illness (ILI) Surveillance** | CDC/FluNet | County-level flu activity, testing rates | Weekly | 3,140 | 163,280/yr |
| **COVID-19 Variants & Wastewater** | CDC/Walgreens + EPA | Case rates, hospitalization, wastewater genomics | Daily | 3,140 | 1.1M+/yr |
| **Opioid Overdose Deaths** | CDC Wonder + SAMHSA | Opioid & fentanyl mortality, treatment capacity | Quarterly | 3,140 | 62,800 |
| **Mental Health Crisis Admissions** | SAMHSA | Substance use disorder treatment availability, admissions | Annually | 3,140 | 31,400 |
| **Communicable Disease Reporting (NEDSS)** | State Health Depts. | Mandatory disease reporting (varies by state) | Real-time | 50 states | Varies |
| **Vector-Borne Disease (Lyme, Dengue)** | CDC/ArboNet | Tick-borne & mosquito-borne disease by county | Quarterly | 3,140 | 62,800 |
| **Cancer Incidence & Mortality** | SEER/CDC WONDER | Age-adjusted cancer rates by site and county | Annually (2yr lag) | 3,140 | 62,800 |
| **Pregnancy & Maternal Health Outcomes** | CDC WONDER + March of Dimes | Preterm birth, maternal mortality, live birth rates | Annually | 3,140 | 62,800 |

**Example Use Case**: Forecast seasonal surge demand (flu, RSV, COVID) by linking county-level ILI rates with hospital bed availability to identify surge capacity gaps.

---


#### Domain 7: Spatial & Geographic Factors (Gap Score: 6.5/10)

**Why Critical**: Accurate travel-time analysis for access modeling; essential for rural care coordination design.


| Gap | Source | Type | Frequency | Counties | Est. Records |
|-----|--------|------|-----------|----------|--------------|
| **Travel Time to Nearest Hospital** | OSM/Mapbox + Routing | Drive-time matrix (60+ min, 120+ min) | Annually | 3,140 | 31,400+ |
| **Rural-Urban Interface (Census Blocks)** | Census Bureau | Fine-grained rural/urban classification | Decennial | 330M+ blocks | 330M records |
| **Medical Desert Mapping** | Derived (providers + access) | GIS-based physician/ED access score | Annually | 3,140 | 31,400 |
| **Interstate Corridor Proximity** | USGS | Distance to major logistics hubs, highways | Static | 3,140 | 3,140 |
| **Frontier County Classification** | Census/HRSA | Ultra-rural counties (<2 per 1000 sq mi) | Decennial | 400 | 400 |
| **Terrain & Accessibility Index** | USGS DEM | Elevation, topography complexity (affects access) | Static | 3,140 | 3,140 |

**Example Use Case**: Model telemedicine hub placement by overlaying travel-time barriers with specialist shortages, identifying optimal regional care centers.

---


#### Domain 8: Population Health & Risk Factors (Gap Score: 7.5/10)

**Why Critical**: Granular disease risk profiling for preventive care targeting and population health ROI modeling.


| Gap | Source | Type | Frequency | Counties | Est. Records |
|-----|--------|------|-----------|----------|--------------|
| **Smoking Prevalence (detailed)** | CDC Behavioral Risk Factor Surveillance | County-level smoking rates by age, gender, race | Annually | 3,140 | 31,400 |
| **Alcohol & Substance Use** | SAMHSA/NSDUH | Alcohol use disorder prevalence, substance abuse treatment | Annually | 3,140 | 31,400 |
| **Physical Activity (exercise access)** | BRFSS + EPA Parks | Parks/recreation availability, physical inactivity rates | Annually | 3,140 | 31,400 |
| **Hypertension Control Rates** | CDC Heart Disease & Stroke | BP control among diagnosed hypertensives | Annually | 3,140 | 31,400 |
| **Diabetes Control Metrics** | CDC Diabetes Prevention | HbA1c control, diabetes screening rates | Annually | 3,140 | 31,400 |
| **Preventive Screening Rates** | CDC/USPSTF | Cancer screening (breast, colorectal, cervical) by county | Annually | 3,140 | 31,400 |
| **Vaccination Coverage** | CDC/IIS (state-aggregated) | Immunization rates by age group, county | Quarterly | 3,140 | 62,800 |

**Example Use Case**: Build preventive care ROI model showing cost-benefit of rural screening campaigns by linking current control rates with intervention costs.

---


- [ ] **Integration**:
  - [ ] Add adapter export to `RuralData.jl`
  - [ ] Add to `build_county_panel()` dispatcher
  - [ ] Document expected output schema

- [ ] **Testing**:
  - [ ] Unit test: Mock API responses
  - [ ] Integration test: Fetch sample year, validate row/column counts

- [ ] **Documentation**:
  - [ ] Update this roadmap with completion date
  - [ ] Add example usage to README
  - [ ] Document any data limitations (suppression, lag, incomplete coverage)

---


#### Issue 2: API Rate Limits

**Problem**: CMS, Census APIs limit requests to 120/min.

**Solution**:
- Implement exponential backoff (1s → 2s → 4s → 8s)
- Batch requests (e.g., 50 counties per request)
- Cache responses to `data/cache/` with Git LFS


#### Issue 3: Temporal Alignment (Lag & Frequency Mismatch)

**Problem**: CDC data lags 1-2 years; BLS is monthly; Census is 5-year rolling.

**Solution**:
- Document effective date for each adapter
- Use forward-fill (carry last value) for annual-only sources
- Create `year_available(source)` metadata function


#### Issue 4: County Boundary Changes

**Problem**: County FIPS codes can change (splits, consolidations).

**Solution**:
- Validate against Census Bureau's county crosswalk
- Flag discontinued counties with effective date
- Map historical FIPS to current FIPS in lookup table

---


#### 3.3 Color Contrast Issues

**Status:** ⚠️ **MEDIUM** — Some text on colored backgrounds may not meet WCAG AA (4.5:1 for normal text).

**Examples:**
- Portal: `--text-muted: #6c757d` on `--bg-secondary: #f8f9fa` — may be <4.5:1
- Finance: Check blue backgrounds with white text

**To Fix:**
1. Use WebAIM contrast checker on all color combinations
2. Ensure WCAG AA minimum: 4.5:1 for normal text, 3:1 for large text
3. Document compliant pairs in theme.css

---


#### 5.2 No Form Validation Feedback

**Status:** 🔴 **HIGH** — Forms validate on submit but don't guide users.

**Findings:**
- Inputs have `type="number"` but no `aria-invalid` feedback
- Error messages appear in `.error-box` but no inline field styling
- No visual feedback for invalid state (red border, warning icon, etc.)

**To Fix:**
```html
<div class="form-group">
  <label for="npv-rate">Discount Rate</label>
  <input 
    id="npv-rate" 
    type="number" 
    class="form-input"
    min="0" max="1"
    aria-describedby="npv-rate-error"
  />
  <span id="npv-rate-error" class="form-feedback"></span>
</div>
```

CSS:
```css
.form-input.invalid {
  border-color: #dc2626;
  background-color: #fef2f2;
}
.form-feedback {
  display: none;
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.form-feedback.visible { display: block; }
```

---


#### 5.3 No Session State Persistence Across Reloads

**Status:** ⚠️ **MEDIUM** — Portal uses localStorage for session picker but apps don't maintain state.

**Findings:**
- Portal's resume banner uses localStorage — good
- Individual apps (Finance, Quality, ABM) don't save form inputs across reload
- User's work is lost if tab crashes or browser refreshes

**To Fix:**
1. **Client-side:** Save form state to localStorage on change:
   ```javascript
   const formData = new FormData(document.getElementById('myForm'));
   localStorage.setItem('financeAppState', JSON.stringify(Object.fromEntries(formData)));
   
   // On load:
   const saved = JSON.parse(localStorage.getItem('financeAppState') || '{}');
   Object.entries(saved).forEach(([key, val]) => {
     const el = document.getElementById(key);
     if (el) el.value = val;
   });
   ```

2. **Server-side (Future):** Implement Phase 7 Save/Load Scenarios:
   - Add `/api/scenario/save` endpoint
   - Add `/api/scenario/load/:id` endpoint
   - Wire UI buttons to persist/restore full session

---


#### 5.4 No Breadcrumb or Navigation History

**Status:** ⚠️ **MEDIUM** — Users have no clear way to navigate back to portal from an app.

**Findings:**
- Portal has nav links to textbooks, notebooks, education
- Apps have no back button or home link to portal
- If user lands on app directly (via URL), no navigation except browser back

**To Fix:**
1. Add breadcrumb or header to each app:
   ```html
   <header class="app-header">
     <a href="/">← Back to Portal</a>
     <h1>Finance Dashboard</h1>
   </header>
   ```

2. Update theme.css with `.app-header` styling
3. Consistent across all 12 apps

---


#### 6.2 No Frontend Architecture Documentation

- How apps connect to backend APIs
- Authentication and authorization (if any)
- Error handling patterns
- Data validation on client
- Testing requirements for HTML/JS

**To Create:**
1. **`docs/FRONTEND_ARCHITECTURE.md`** — Architecture guide:
   ```markdown
   ## API Communication Pattern
   
   All apps use fetch() to call JSON APIs:
   
   ```javascript
   const res = await fetch('/api/endpoint', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ ... })
   });
   const data = await res.json();
   if (!res.ok) { /* handle error */ }
   ```
   
   ## Error Handling Pattern
   
   Errors are returned as JSON:
   ```json
   { "error": true, "type": "validation_error", "message": "..." }
   ```
   
   Always check `res.ok` before using data.
   ```

---


#### 10.1 Portal — Textbooks & Notebooks Pages

**Status:** ⚠️ **PARTIAL** — Pages exist but may be incomplete.

**Findings:**
- `/textbooks` and `/notebooks` routes are defined in routes.jl
- Functions `textbooks_page_html()` and `notebooks_page_html()` exist
- **But:** No actual content linked — just scaffolding

**To Check:**
1. Load `http://localhost:8080/textbooks` in browser
2. Verify content displays (chapters list, links to resources)
3. If empty, populate with actual textbook structure

---


#### 10.2 Portal — QuantEcon Guides Page

**Status:** ⚠️ **PARTIAL** — Similar to textbooks/notebooks.

**To Fix:**
1. Populate `/education/quantecon` with guide listings
2. Link to QuantEcon learning resources

---


#### 11.2 Duplicate Function Definitions

**Status:** ❌ **ERROR** — Portal.jl has duplicate function definitions!

**Finding:**
```julia
# Line 46-321: First implementation of landing_page_html()
function landing_page_html()
  ...
end

# Line 322-364: Function textbooks_page_html()
# Line 365-410: Function notebooks_page_html()
# ... etc ...

# Line 916: DUPLICATE landing_page_html() ← ERROR!
function landing_page_html()
  ...
end

# Line 1033: DUPLICATE textbooks_page_html()
# Line 1061: DUPLICATE quantecon_guides_page_html()
```

**Impact:**
- Julia will use the last definition (line 916 version)
- If definitions differ, behavior is unpredictable
- May cause runtime errors if earlier version has complex logic

**To Fix:**
1. Identify which versions are correct
2. Delete duplicates
3. Consolidate into single definitions at appropriate locations

---


#### Phase 1 (High-Value Accessibility & Design — Week 2)
1. **Create unified design system** (`theme.css`, `components.css`) (8h)
2. **Add skip links and ARIA labels** to portal (3h)
3. **Connect form labels** to inputs across all apps (2h)
4. **Audit and fix color contrast** (2h)
5. **Add mobile nav toggle** to portal (1h)


#### Phase 2 (User Experience — Week 3)
1. **Add loading states** to all API calls (2h)
2. **Add form validation feedback** (2h)
3. **Implement localStorage session persistence** (4h)
4. **Add breadcrumbs/back navigation** to all apps (2h)


#### Phase 3 (Documentation — Week 4)
1. **Create UI style guide** (`docs/UI_STYLE_GUIDE.md`) (8h)
2. **Create frontend architecture guide** (4h)
3. **Create living component gallery** (`portal/public/style-guide/`) (4h)


#### Phase 4 (Advanced Features & Testing — Weeks 5+)
1. **Wire Save/Load Scenarios** UI in apps (6h)
2. **Wire Undo/Redo** buttons (4h)
3. **Add Playwright E2E tests** (6h)

---


#### Apps with Complete UIs in routes.jl

| App | File | Status | Lines | Key Features |
|-----|------|--------|-------|--------------|
| **ABM Validation** | `apps/abm_validation/src/routes.jl` | ✅ Complete | 540+ | Validation tests, benchmark comparison, statistical tables |
| **Batch Processing** | `apps/abm_batch_processing/src/routes.jl` | ✅ Complete | 380+ | Parameter sweeps, sensitivity analysis, tornado diagrams |
| **Data Import** | `apps/abm_data_import/src/routes.jl` | ✅ Complete | 270+ | Panel building, data preview, parameters extraction |
| **Causal Inference** | `apps/abm_causal_inference/src/routes.jl` | ✅ Complete | Loading placeholder | Served via `/causal` route |
| **Quality Integration** | `apps/abm_quality_integration/src/routes.jl` | ✅ Complete | Loading placeholder | Served via `/quality` route |


#### Architecture Pattern

These apps follow a **dynamic HTML rendering pattern**:

```
User visits http://localhost:8086
  ↓
Genie reads apps/abm_data_import/public/index.html
  ↓
index.html redirects to /data-import
  ↓
Route handler calls html(""" ... full HTML ... """)
  ↓
Complete UI rendered to browser
```

**Why this pattern?** Allows for:
- Server-side templating (can inject Julia data without client-side API call)
- Dynamic initialization
- Session state on page load

---


#### 8.2 Data Ingestion (RuralData)

Current adapters (8): BEA income, BLS LAUS, BLS QCEW, CDC PLACES, CDC WONDER, Census ACS, HRSA AHRF, USDA RUCC.

- **Phase 1:** CMS Provider of Services directory; Medicare DRG weights + GPCI; CMS HCQIS 30-day readmission & mortality; BLS OES detailed SOC healthcare employment.
- **Phase 2:** Expanded CDC PLACES metrics; CMS inpatient claims (research file); NPPES physician NPI registry; CDC opioid mortality detail.
- **Phase 3:** EPA AirNow air quality; OSM-based travel-time matrix; FCC broadband access; CDC ILI / FluNet surveillance.
- **Phase 4:** CMS-2552 cost reports; SEER cancer registry (DUA); state Medicaid claims; SAMHSA treatment locator; CDC wastewater surveillance.
- **Workforce:** nursing supply (BLS OES + HRSA), NHSC loan-forgiveness, AAMC / ACGME training pipeline, allied-health workforce.
- **SDoH:** food insecurity, walkability, transit access, drinking-water violations, housing cost burden, Opportunity Atlas.
- **Epi:** COVID wastewater / variants, mental-health crisis admissions, NEDSS communicable disease, ArboNet, maternal health.
- **Infrastructure:** synthetic-data fallback via AHRQ HCUP; DUA workflow for restricted CMS / SEER sources; FIPS crosswalk for boundary changes.


#### 8.3 Biostatistics Engine

- Mixed-effects models: LME, GLMM, GEE, HLM (critical for clustered rural data).
- Causal inference suite: propensity scores, IV, DiD, RDD, synthetic control, causal forests, mediation, sensitivity / e-value.
- MCMC + hierarchical Bayesian: Metropolis-Hastings, Gibbs, HMC, convergence diagnostics, posterior predictive checks.
- Regression expansion: Cox PH, negative binomial, multinomial / ordinal logistic, quantile, robust, LASSO / Ridge / ElasticNet, splines.
- Model diagnostics: residual / influence / collinearity / heteroscedasticity / autocorrelation, ROC / AUC, Hosmer-Lemeshow, Schoenfeld residuals.
- Native viz layer (Plots / StatsPlots / Makie): histograms, Q-Q, forest, KM, scree, biplot, trace.
- Educational materials: textbook chapters (Levels 1–3), Pluto / Jupyter tutorials, case studies, problem sets, assessments, glossary.
- Biostatistics app API: regression, survival, power, Bayesian endpoints; add two-way / RM ANOVA, post-hoc, Levene / Bartlett, trend tests.


#### 8.4 RuralData adapter completion

Adapters exist but archived analysis flagged incomplete `fetch_raw` / `parse_raw` / `standardize` methods. Re-verify each is production-ready (not skeleton):

- `bls_laus.jl` (81 lines)
- `bls_qcew.jl` (82 lines)
- `cdc_places.jl` (84 lines)
- `cdc_wonder.jl` (144 lines — fetch done; verify parse/standardize)
- `hrsa_ahrf.jl` (70 lines — verify parse + standardize pass-through)
- `usda_rucc.jl` (75 lines)
- `bea_income.jl` (117 lines)


#### 8.5 RuralSystems / CausalHealth

- `CausalHealth._placebo_p` — verify `Y1_post` path now computes the full Abadie placebo ratio.


#### 8.6 Pediatric clinical simulations (65 items)

Tier 1 — physiological simulators (P0, 4): Pediatric Sepsis / Septic Shock · NRP Neonatal Resuscitation · SVT Management · Status Epilepticus.

Tier 1 — physiological simulators (P1, 8): Asthma · Bronchiolitis · Neonatal Hypoglycemia · Febrile Infant · Pediatric Trauma · Anaphylaxis · Meningitis · Croup.

Tier 2 — clinical walkthroughs (P0/P1, 20): febrile-neonate · Kawasaki · MIS-C · CDH · MAS · sickle-cell VOC · new leukemia · NAT · acetaminophen OD · suicide risk · coarctation · myocarditis · pyloric stenosis · intussusception · UTI · GE dehydration · neonatal HSV · bronchiolitis admit · foreign body · CCHD screening.

Tier 2 — walkthroughs (P2, 18): DKA new-onset · CAH salt-wasting · thyroid storm · IEM decompensation · HSP · nephrotic · HUS · ITP · torsions · peritonsillar / retropharyngeal / orbital abscess · acute chest syndrome · BRUE · toxic ingestion · submersion · electrical burn.

Tier 3 — calculators (P0, 4): Weight-Based Drug Dosing · Fluid Deficit + Maintenance (Holliday-Segar) · Bhutani Bilirubin Nomogram · Glucose Infusion Rate.

Tier 3 — calculators (P1, 6): Growth Chart Plotter (WHO / CDC LMS) · ETT Size / Depth · Corrected Na / AG / Osm · BSA (Mosteller) · RSI Dosing · Continuous Infusion.

Tier 3 — calculators (P2, 5): Vaccine Catch-Up · Corrected Gestational Age · APGAR Timer / NRP SpO₂ · Renal Dosing · Burn Assessment (Lund-Browder + Parkland).

---


- [ ] Two-way/factorial ANOVA

- [ ] Repeated-measures ANOVA

- [ ] Post-hoc tests (Tukey HSD, Bonferroni, Scheffe)

- [ ] Tests for variance equality (Levene, Bartlett, Brown-Forsythe)

- [ ] Trend tests (Cochran-Armitage, Jonckheere-Terpstra)

- [ ] Goodness-of-fit tests beyond chi-square (Kolmogorov-Smirnov, Anderson-Darling, Shapiro-Wilk)

**Educational Priority:** Medium (advanced undergraduate → early PhD)

---


#### 1.2 Regression ✓ (Partial)

**Implemented:**
- OLS (ordinary least squares) with inference
- Logistic regression (binary outcomes)
- Poisson regression (count data)


- [ ] Negative binomial regression (overdispersed counts)

- [ ] Multinomial logistic regression (multi-class)

- [ ] Ordinal logistic regression (ordered categories)

- [ ] Survival regression (Cox PH, AFT models)

- [ ] Quantile regression (conditional quantiles)

- [ ] Robust regression (resistant to outliers)

- [ ] Model selection (stepwise, AIC/BIC, LASSO, Ridge, Elastic Net)

- [ ] Interaction & polynomial terms (polynomial regression, spline models)


- [ ] Residual diagnostics (residual plots, Q-Q plots, scale-location plots)

- [ ] Influence diagnostics (leverage, Cook's distance, DFBETA, DFFITS)

- [ ] Collinearity assessment (VIF, condition number)

- [ ] Goodness-of-fit tests

- [ ] Model comparison tests (likelihood ratio, Wald, score tests)

**Educational Priority:** High (essential for PhD research)

---


#### 1.3 Survival Analysis (Medium Coverage)

**Implemented:**
- Kaplan-Meier estimator (non-parametric survivor curves)
- Log-rank test (comparing survival curves)
- Hazard rate estimation


- [ ] **Cox proportional hazards model** (essential for adjusted survival analysis)

- [ ] Competing risks analysis

- [ ] Accelerated failure time (AFT) models

- [ ] Cumulative incidence curves

- [ ] Proportionality tests (Schoenfeld residuals)

- [ ] Mediation analysis (for mechanistic understanding)

**Why Critical for Rural Health:** Longitudinal patient follow-up, hospital readmission, disease progression studies—all common in rural health research.

**Educational Priority:** High (essential for PhD research)

---


#### 1.4 Epidemiology ✓ (Well-Covered)

**Implemented (8 measures):**
- Incidence rate
- Prevalence
- Relative risk (RR)
- Odds ratio (OR)
- Number needed to treat (NNT)
- Attributable risk (AR)
- Population attributable fraction (PAF)
- Risk ratios with confidence intervals


- [ ] Standardized mortality/morbidity ratios (SMR, SIR)

- [ ] Indirect/direct standardization

- [ ] Rate adjustment methods (Mantel-Haenszel)

- [ ] Interaction and confounding assessment

- [ ] Dose-response trends

- [ ] Screening performance metrics (sensitivity, specificity, ROC curves, AUC)

**Educational Priority:** Medium

---


#### 1.5 Power Analysis (Medium Coverage)

**Implemented (5 functions):**
- `sample_size_t_test` — sample size for t-tests
- `sample_size_proportion` — sample size for proportions
- `power_t_test` — power of t-tests
- `cohens_d` — effect size (Cohen's d)
- `interpret_cohens_d` — effect size interpretation
- `minimum_detectable_effect`


- [ ] Power for ANOVA designs

- [ ] Power for logistic/Poisson regression

- [ ] Power for survival analysis (Kaplan-Meier, Cox PH)

- [ ] Power for correlation tests

- [ ] Power for paired/clustered designs

- [ ] Power for multiple comparisons (correction for multiplicity)

- [ ] Effect size calculations beyond Cohen's d (odds ratio, relative risk, etc.)

- [ ] Precision analysis (confidence interval width)

**Educational Priority:** Medium (important for grant writing, study planning)

---


#### 1.6 Bayesian Inference (Medium Coverage)

**Implemented (4 conjugate models):**
- Beta-Binomial posterior (proportions)
- Normal-Normal posterior (means, known variance)
- Gamma-Poisson posterior (rates)
- Bayes factors for proportions


- [ ] **Markov Chain Monte Carlo (MCMC)** — essential for complex models
  - Metropolis-Hastings
  - Gibbs sampling
  - Hamiltonian Monte Carlo

- [ ] **Hierarchical/Multilevel Bayesian models** — critical for clustered/nested data

- [ ] Prior specification & sensitivity analysis

- [ ] Convergence diagnostics (trace plots, Gelman-Rubin statistic)

- [ ] Posterior predictive checks

- [ ] Model comparison (DIC, WAIC, marginal likelihood)

- [ ] Variational inference (faster approximation)

**Why Critical:** Rural healthcare data is inherently nested (patients within clinics within regions). Bayesian hierarchical models are state-of-the-art for this structure.

**Educational Priority:** Critical (PhD-level)

---


#### 1.7 Multivariate Analysis (Minimal Coverage)

**Implemented (3 methods):**
- Principal Component Analysis (PCA)
- Correlation heatmap data
- k-means clustering


- [ ] **Factor analysis & latent variable models** (for quality of life scores, latent disease severity)

- [ ] **Cluster diagnostics** (silhouette analysis, gap statistic, elbow plots)

- [ ] Hierarchical clustering (dendrograms, distance metrics)

- [ ] Discriminant analysis (LDA, QDA)

- [ ] Canonical correlation analysis

- [ ] Multidimensional scaling (MDS)

- [ ] Correspondence analysis (categorical data)

- [ ] Network analysis (disease surveillance networks)

**Educational Priority:** Medium → High (exploratory data analysis, latent variables)

---


#### 1.8 Mixed-Effects & Multilevel Models ⚠️ (NOT IMPLEMENTED)

**Critical Gap:** Rural healthcare data is naturally nested/clustered:
- Patients within hospitals
- Observations within patients (longitudinal)
- Facilities within regions/counties

**Not implemented:**

- [ ] **Linear mixed-effects models (LME)** — random intercepts & slopes

- [ ] **Generalized linear mixed models (GLMM)** — logistic, Poisson with random effects

- [ ] **Generalized estimating equations (GEE)** — marginal models for correlated data

- [ ] Hierarchical linear modeling (HLM)

- [ ] Multilevel mediation analysis

- [ ] Cross-level interactions

**Educational Priority:** **CRITICAL** (foundational for PhD research involving rural health systems)

**Example Use Cases:**
- Hospital readmission rates across rural facilities (facility random effect)
- Patient outcomes tracked longitudinally (patient random effect)
- Disease burden by county controlling for hospital variation (crossed random effects)

---


#### 1.9 Causal Inference ⚠️ (NOT IMPLEMENTED)

**Not implemented:**

- [ ] **Propensity score methods** (matching, stratification, regression adjustment, inverse probability weighting)

- [ ] **Instrumental variable estimation**

- [ ] **Difference-in-differences** (policy evaluation, natural experiments)

- [ ] **Regression discontinuity design**

- [ ] **Synthetic control methods**

- [ ] **Causal forests** (heterogeneous treatment effects)

- [ ] **Mediation analysis** (direct vs. indirect effects)

- [ ] **Sensitivity analysis** (unmeasured confounding, e-value)

**Educational Priority:** High → Critical (PhD-level, policy evaluation)

**Why for Rural Health:** Evaluating impact of policy changes, healthcare reforms, clinical interventions with observational data.

---


#### 1.10 Time-Series & Longitudinal Analysis (Minimal)

**Partially implemented in other packages:**
- Survival curves (BiostatsEngine)
- SEIR models (RuralSystems)

**Not implemented in BiostatsEngine:**

- [ ] **Linear regression with autocorrelation** (ARIMA, GARCH)

- [ ] **Generalized least squares (GLS)** for correlated errors

- [ ] **Growth curve models** (polynomials, nonlinear)

- [ ] **Joint models** (longitudinal + survival)

- [ ] **Functional data analysis** (continuous curves)

**Educational Priority:** Medium (applications-specific)

---


- [ ] Residual plots (vs. fitted, Q-Q, scale-location, residuals vs. leverage)

- [ ] Influence measures (Cook's distance, leverage, DFFITS, DFBETA)

- [ ] Collinearity diagnostics (VIF, condition index)

- [ ] Heteroscedasticity tests (Breusch-Pagan, White test)

- [ ] Autocorrelation tests (Durbin-Watson, Ljung-Box)

**Classification/Logistic diagnostics:**

- [ ] ROC curves & AUC

- [ ] Calibration plots

- [ ] Classification metrics (sensitivity, specificity, NPV, PPV)

- [ ] Hosmer-Lemeshow test

**Survival diagnostics:**

- [ ] Proportional hazards assumption (Schoenfeld residuals)

- [ ] Cox-Snell residuals

- [ ] Deviance residuals

**Bayesian diagnostics:**

- [ ] MCMC trace plots

- [ ] Gelman-Rubin convergence statistic

- [ ] Effective sample size (ESS)

- [ ] Posterior predictive checks

**Multivariate diagnostics:**

- [ ] Scree plots (PCA)

- [ ] Silhouette plots (clustering)

- [ ] Gap statistic (optimal clusters)

**Educational Priority:** Critical (model validation is essential for reproducible research)

---


- [ ] Histograms with density overlays

- [ ] Box plots, violin plots, strip plots

- [ ] Scatter plots with regression lines & confidence bands

- [ ] Correlation matrices (heatmaps, network graphs)

**Inferential:**

- [ ] Forest plots (meta-analysis, regression coefficients)

- [ ] Q-Q plots (normality assessment)

- [ ] Residual diagnostic plots (4-in-1 panels)

- [ ] Bland-Altman plots (agreement)

- [ ] ROC curves

**Survival:**

- [ ] Kaplan-Meier curves with confidence bands & at-risk tables

- [ ] Cumulative incidence curves

- [ ] Hazard function estimates

**Multivariate:**

- [ ] Scree plots (variance explained)

- [ ] Biplot (PCA with loadings)

- [ ] Dendrograms (hierarchical clustering)

- [ ] Silhouette plots

- [ ] t-SNE, UMAP visualizations

**Geographic/Spatial (for rural healthcare context):**

- [ ] Choropleth maps (disease burden by county)

- [ ] Spatial autocorrelation plots (Moran's I)

- [ ] Network graphs (healthcare facility referral patterns)

**Bayesian:**

- [ ] Trace plots (MCMC diagnostics)

- [ ] Posterior distribution plots

- [ ] Posterior predictive checks

**Educational Priority:** High (visualization is essential for communication & learning)

**Recommended Integration:**
- Use `Plots.jl` + `StatsPlots.jl` for base graphics
- Use `Makie.jl` for interactive 3D
- Consider `Pluto.jl` notebooks for interactive tutorials

---


#### # **Level 1: Beginner (Intro Statistics for Health Professions)**

- [ ] Types of data & measurement scales

- [ ] Descriptive statistics (mean, median, variance, SD)

- [ ] Distributions (normal, binomial, Poisson)

- [ ] Sampling & study designs

- [ ] Confidence intervals & standard errors
- **Interactive examples:** Generate data, compute summaries, visualize


#### # **Level 2: Intermediate (Biostatistics for Clinical Researchers)**

- [ ] Hypothesis testing framework (Type I/II errors, power)

- [ ] t-tests, ANOVA, chi-square tests

- [ ] Correlation & simple linear regression

- [ ] Logistic regression (binary outcomes)

- [ ] Survival analysis (Kaplan-Meier, log-rank)

- [ ] Power analysis for study planning
- **Guided case studies:** Real rural health datasets, interpret results, write-ups


#### # **Level 3: Advanced (PhD-Level Biostatistics)**

- [ ] Mixed-effects models (hierarchical data)

- [ ] Causal inference (propensity scores, IV)

- [ ] Bayesian methods & MCMC

- [ ] Model diagnostics & validation

- [ ] Multivariate methods (PCA, clustering, latent variables)

- [ ] Design & analysis of complex studies
- **Research projects:** Original analysis, peer review, publication


**Documentation:**

- [ ] Function reference with worked examples

- [ ] Concept glossary with definitions & formulas

- [ ] Vignettes (5-10 page deep dives into methods)

**Tutorials & Code Examples:**

- [ ] Interactive Pluto notebooks for each major topic

- [ ] Jupyter notebooks with narrative + code

- [ ] Video explanations (optional, recorded demos)

**Problem Sets & Exercises:**

- [ ] Beginner: Computational practice (data generation, summaries)

- [ ] Intermediate: Guided analysis (rural health datasets provided)

- [ ] Advanced: Research design (propose, analyze, critique)

**Case Studies:**

- [ ] Rural hospital readmission analysis (mixed-effects)

- [ ] County health disparities (multilevel, spatial)

- [ ] Telemedicine adoption intervention (causal inference)

- [ ] Disease surveillance (time-series, forecasting)

**Assessment:**

- [ ] Auto-graded quizzes

- [ ] Project rubrics

- [ ] Feedback templates for peer review

**Educational Priority:** **CRITICAL** (enables use of package for teaching)

---


- [ ] Normality: Shapiro-Wilk, Anderson-Darling, Kolmogorov-Smirnov (available)

- [ ] Homogeneity of variance: Levene, Bartlett, Brown-Forsythe

- [ ] Independence of observations (design review)

- [ ] Linearity (residual plots)

**Regression assumptions:**

- [ ] Linearity (partial regression plots)

- [ ] Homoscedasticity (Breusch-Pagan, White, scale-location plot)

- [ ] Normality of residuals

- [ ] Independence (Durbin-Watson, Ljung-Box for autocorrelation)

- [ ] Multicollinearity (VIF, tolerance, condition index)

- [ ] Influential observations (Cook's D, leverage, DFFITS)

**Survival analysis assumptions:**

- [ ] Proportional hazards (log-log plots, Schoenfeld residuals test)

- [ ] Censoring mechanism (MCAR, MAR, MNAR assessment)

**Bayesian assumptions:**

- [ ] Prior sensitivity (re-fit with different priors)

- [ ] MCMC convergence (trace plots, Gelman-Rubin < 1.05)

- [ ] Effective sample size (thin/low ESS → poor inference)

**Educational Priority:** High (essential for correct method selection)

---


#### Gaps

**Data cleaning:**

- [ ] Imputation methods (mean, median, KNN, MICE, multiple imputation)

- [ ] Outlier detection (univariate, multivariate, clustering)

- [ ] Duplicate detection & removal

**Data integration:**

- [ ] Merging datasets (joins, conflict resolution)

- [ ] Data quality metrics

- [ ] Record linkage (probabilistic matching)

**Longitudinal data:**

- [ ] Long-to-wide conversions

- [ ] Baseline normalization

- [ ] Time-varying covariates

**Educational Priority:** Medium (important but RuralData handles some)

---


- [ ] **API Reference** — complete function listing with examples

- [ ] **Method Guides** — "How to conduct X analysis" (tutorial style)

- [ ] **FAQ** — common questions & troubleshooting

- [ ] **Glossary** — statistical terms defined

- [ ] **Literature References** — citations to methods, papers

- [ ] **Algorithm Details** — mathematical formulations (for transparency)

**Educational Priority:** High

---


- [ ] Implement basic data visualization (diagnostic plots)

- [ ] Write beginner textbook chapter (Chapter 1: Data Types)


#### **Phase 2: Critical Methods (Weeks 3-6)**

- [ ] Implement linear mixed-effects models

- [ ] Implement generalized linear mixed models (GLMM)

- [ ] Implement propensity score methods (PSM)

- [ ] Add Cox proportional hazards regression

- [ ] Create intermediate textbook (Chapters 2-4)


#### **Phase 3: Advanced & Specialized (Weeks 7-10)**

- [ ] Implement MCMC-based Bayesian models

- [ ] Implement instrumental variables

- [ ] Implement difference-in-differences

- [ ] Add cluster diagnostics (silhouette, gap statistic)

- [ ] Create advanced textbook (Chapters 5-8)


#### **Phase 4: Integration & Polish (Weeks 11-12)**

- [ ] Extend biostatistics app with new APIs

- [ ] Add interactive tutorials (Pluto notebooks)

- [ ] Add case studies with rural health data

- [ ] Performance optimization

- [ ] Comprehensive documentation

---


#### 2.4 Quality App — 85% COMPLETE ✅

**Files:**  
- HTML: `apps/quality/public/index.html` (591 lines)
- API: `apps/quality/src/routes.jl` (8.6 KB)

**Features:**

| Feature | Status | Notes |
|---------|--------|-------|
| **SPC chart tabs** | ✅ Full | Run charts, I-MR, X̄-R, p-chart, CUSUM |
| **CMS measures tabs** | ✅ Full | O/E ratio, SIR, HCAHPS |
| **Data input (CSV)** | ✅ Full | Paste or upload sample data |
| **Chart rendering** | ✅ Full | Chart.js integration via CDN |
| **Tab navigation** | ✅ Full | Click to switch between chart types |
| **API routes** | ✅ Full | 8 SPC + CMS endpoints |
| **Error handling** | ✅ Good | Validation + meaningful messages |
| **Styling** | ⚠️ Partial | References `/css/app.css` which doesn't exist |


- **`/css/app.css` doesn't exist** — Quality app likely broken without this file
- No real-time chart updates (batch only)
- No alarm thresholds visualization
- No drill-down to raw data points
- No export charts to PNG/PDF

**Score: 85% Complete (minus broken CSS import)**

---


#### 3.3 ABM Quality Integration — 40% COMPLETE 🟡

**File:** `apps/abm_quality_integration/public/index.html` (42 lines)  
**Routes:** `apps/abm_quality_integration/src/routes.jl` (27 KB)

**Status:**

```html
<title>Loading...</title>
<div id="app">Loading...</div>
<script>/* React-like app mounting */"</script>
```

- Placeholder loading page
- API routes exist: `/api/quality/analyze`

**To Complete:**

1. Either build vanilla JS UI or integrate React/Vue
2. Fetch ABM results and quality metrics
3. Link to Quality SPC charts
4. Display integration summary

---


- [ ] Test keyboard navigation (Tab through all inputs)

- [ ] Verify color contrast ≥ 4.5:1
- **Effort:** 20-30 hours

**#5: Add Consistent Error/Loading UX**

- [ ] Add loading spinners to all API calls

- [ ] Add error toast messages

- [ ] Add success confirmations for mutations

- [ ] Add form disable-on-submit
- **Effort:** 10-15 hours


#### NICE TO HAVE (Enhancement)

**#6: Standardize on Chart.js**

- [ ] Replace custom Finance canvas with Chart.js

- [ ] Add charting to Batch Processing results
- **Effort:** 5-10 hours

**#7: Add Real-time Health Status (WebSocket)**

- [ ] Upgrade portal `/api/health` to WebSocket

- [ ] Update health indicator dots live
- **Effort:** 4-6 hours

**#8: Add Mobile Responsiveness**

- [ ] Test all apps on mobile (375px, 768px, 1024px)

- [ ] Fix layout issues
- **Effort:** 10-15 hours

---


### 🟢 Built Features (Completed Gaps)
#### 9.2 No Rate Limiting on API Endpoints (Client-Side)

**Status:** ✓ **PARTIAL** — Nginx has rate limiting; clients don't enforce limits.

**Findings:**
- Nginx config has `limit_req` zones (api: 10r/s, heavy: 2r/s)
- Apps don't throttle button clicks or prevent duplicate submissions

**To Fix:**
1. Disable button during request:
   ```javascript
   btn.disabled = true;
   const res = await fetch(url);
   btn.disabled = false;
   ```

2. Add client-side rate limiting utility:
   ```javascript
   const throttle = (fn, ms) => {
     let last = 0;
     return (...args) => {
       if (Date.now() - last >= ms) {
         fn(...args);
         last = Date.now();
       }
     };
   };
   ```

---



---

## 📦 Repository: Textbook

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: WeatherMed.jl

### 🔴 Missing Features (Active Gaps)
- [ ] Formal typed exception hierarchy (currently errors scattered across modules)

**From spec `types/` directory:**

- [ ] Modular type definitions (currently in `DataSchemas.jl`)

**Data Ingestion Services (only 2 of 17 implemented):**

- [ ] Open-Meteo service

- [ ] NEXRAD Level II/III service

- [ ] GOES-16/18/19 service

- [ ] METAR/TAF service

- [ ] SPC service

- [ ] NHC service

- [ ] USGS Water service

- [ ] EPA AirNow service

- [ ] NCEI CDO service

- [ ] HRRR service

- [ ] GFS/GEFS/CFS service

- [ ] NDFD service

- [ ] NOAA Buoys service

- [ ] NIFC Wildfire service

- [ ] Iowa Mesonet service

- [ ] NOAA AIGFS service

**Processing Modules (3 of 7 implemented):**

- [ ] Feature normalization

- [ ] Data enrichment pipeline

- [ ] Interpolation handlers

**Extreme Weather Tracking (0 of 9 modules):**

- [ ] Severe thunderstorm tracking

- [ ] Tornado tracking

- [ ] Hurricane tracking

- [ ] Flood risk assessment

- [ ] Fire risk assessment

- [ ] Winter weather tracking

- [ ] Heat wave tracking

- [ ] Air quality tracking

- [ ] Drought monitoring

**Hospital Integration (0 of 5 modules):**

- [ ] Supply chain forecasting (linked to ML models)

- [ ] Staffing impact prediction

- [ ] Facility stress assessment

- [ ] Clinical decision support

- [ ] Resource allocation

---


- [ ] AppHeader with theme toggle

- [ ] SideNav with active state tracking

- [ ] Footer with links/version

- [ ] Breadcrumb navigation

- [ ] Mobile menu

**Weather Display (8 components):**

- [ ] AlertBanner (prominent alert display)

- [ ] HourlyForecastRow

- [ ] DailyForecastCard

- [ ] RadarMap (NEXRAD visualization)

- [ ] SatelliteImagery

- [ ] WindArrow (directional display)

- [ ] PrecipitationChart

- [ ] UVIndex indicator

**Clinical/Hospital (10 components):**

- [ ] StaffingForecast

- [ ] SupplyAlertCard

- [ ] ICUCapacityGauge

- [ ] Triage QuickStart

- [ ] VentilatorAvailability

- [ ] MedicationStockStatus

- [ ] ElderCareRiskFlag

- [ ] MaternalHealthAlert

- [ ] TraumaLevelIndicator

- [ ] DisasterResponseStatus

**Data Visualization (8 components):**

- [ ] TimeSeriesChart

- [ ] ComparisonChart (multiple series)

- [ ] HeatmapCalendar

- [ ] RoseChart (directional data)

- [ ] SparklineChart (mini inline charts)

- [ ] GaugeChart (single metric)

- [ ] ChoroplethMap (geographic)

- [ ] SankeyDiagram (flow visualization)

**Utilities & Forms (9+ components):**

- [ ] FormInput with validation

- [ ] MultiSelect dropdown

- [ ] DateRangePicker

- [ ] SearchableComboBox

- [ ] ToastNotification

- [ ] ModalDialog

- [ ] LoadingSkeletons

- [ ] EmptyState

- [ ] ErrorBoundary


Per CLAUDE.md `src/hooks/`:


- [ ] **useWeatherData** — Fetch from API with caching, retry

- [ ] **useGeolocation** — Browser geolocation with permissions

- [ ] **useNotifications** — Toast/push notifications

- [ ] **useFormState** — Form state management with validation

- [ ] **useLocalStorage** — Persistent theme, user preferences

- [ ] **useWebSocket** — Real-time alert subscriptions

---


#### Tests

**Backend:**
- test/unit/test_DataValidation.jl
- test/unit/test_GeoSpatialOps.jl
- test/unit/test_NOAAWeatherService.jl
- test/unit/test_NWSAlertService.jl
- test/unit/test_TimeSeriesFeatures.jl

**Frontend:**
- frontend/src/lib/components/*/__tests__ (3 test files)


#### Documentation

- CLAUDE.md (project spec)
- QUICK_START.md
- MANUAL_SETUP_GUIDE.md
- Multiple PHASE_*_COMPLETION.md files
- Service-specific guides

---

**Report Generated:** April 13, 2026  
**Analyst:** Claude Code  
**Status:** Ready for implementation roadmap


### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: Data-ingestion

### 🔴 Missing Features (Active Gaps)
#### Phase 9 — Universal API Protocol Layer + Auth

| Protocol (planned) | Status | File |
|---|---|---|
| GraphQL | ✅ | `src/protocols/GraphQL.jl` |
| gRPC | ✅ | `src/protocols/GRPC.jl` |
| OData v4 | ✅ | `src/protocols/OData.jl` |
| SOAP / WSDL | ✅ | `src/protocols/SOAP.jl` |
| FHIR R4/R5 | ✅ | `src/protocols/FHIR.jl` |
| HL7 v2 over MLLP | ✅ | `src/protocols/HL7v2.jl` |
| X12 (835/837/270/271) | ✅ | `src/protocols/X12.jl` |
| WebSocket | ✅ | `src/protocols/WebSocket.jl` |
| SSE | ✅ | `src/protocols/SSE.jl` |
| **WebSub** | ❌ | Not implemented |
| **JSON:API** | ❌ | Not implemented |
| **HAL / HATEOAS** | ❌ | Not implemented |
| **RSS** | ⚠️ | Sitemap.jl handles RSS-style XML lightly; no dedicated module |

| Auth (planned) | Status | Note |
|---|---|---|
| OAuth2 (auth_code, PKCE, client_creds, device, refresh) | ⚠️ partial | Consolidated into `src/auth/AuthProviders.jl` rather than separate `OAuth2.jl` |
| OIDC (discovery + JWKS) | ⚠️ partial | In `AuthProviders.jl`; needs verification of full discovery flow |
| SAML | ❌ | Not visibly implemented |
| mTLS | ❌ | Not visibly implemented as a dedicated module |
| AWS SigV4 | ❌ | Not visibly implemented |
| Azure AAD | ❌ | Not visibly implemented |
| GCP IAM | ❌ | Not visibly implemented |
| HMAC | ⚠️ | Used inside admin audit log but no general-purpose `auth/HMAC.jl` |
| JWT bearer | ⚠️ | Likely in `AuthProviders.jl`; needs confirmation |
| SecretVault (file/env/Keychain/AWS-SSM/Vault) | ✅ | `src/auth/SecretVault.jl` |

**Major Phase 9 gap.** The v2 plan named 9 distinct auth modules. The merged
tree has only 2 files (`AuthProviders.jl` + `SecretVault.jl`). Either (a) the
9 providers are all implemented inside `AuthProviders.jl` as types — in which
case we need a code review to confirm and then update the plan to match the
flatter file layout — or (b) several providers (SAML, mTLS, AWS SigV4, Azure
verify per-provider coverage before declaring Phase 9 complete.

**Phase 9 exit criteria** demanded "OAuth2 all flows against test IdP" and
"GraphQL/gRPC/OData/SOAP/FHIR/HL7 parse golden fixtures." Golden fixtures and
IdP test harness presence not yet audited.


#### Phase 10 — Pipeline Orchestration + Storage Sinks

| Module (planned) | Status |
|---|---|
| `orchestration/Pipeline.jl` (DAG + scheduler) | ❌ |
| `orchestration/Watermark.jl` | ❌ |
| `orchestration/Idempotency.jl` | ❌ |
| `orchestration/DLQ.jl` | ❌ |
| `orchestration/Backfill.jl` | ❌ |
| `orchestration/IngestContext.jl` *(actually present)* | ✅ |
| `storage/ParquetSink.jl` | ❌ |
| `storage/PostgresSink.jl` | ❌ |
| `storage/S3Sink.jl` | ❌ |
| `storage/DeltaLite.jl` | ❌ |
| `storage/EnvelopeEncryption.jl` | ❌ |

**Status: not started.** Only `IngestContext.jl` (the PHI-gate carrier type)
exists, and it was authored as part of Phase 7 to give scrapers a place to
attach context. The DAG executor, watermarking, dedupe, DLQ, and all storage
sinks remain unwritten. This is the largest single gap in the main package.

**Critical for the "submodule" use case.** Downstream consumers
(`peds-cds-server` and others) will likely want a `PostgresSink` and a
`ParquetSink` early — the absence of these forces every consumer to roll
their own sink, defeating the point of a shared library. Recommend
prioritizing `PostgresSink.jl` (per ADR-0003 "Postgres-first") as the
**single highest-leverage next module**.


#### Phase 11 — Medical-Software Compliance Hardening

| Deliverable (planned) | Status |
|---|---|
| `governance/Lineage.jl` (OpenLineage emitter) | ❌ |
| `governance/DatasetCard.jl` | ❌ |
| `governance/SchemaRegistry.jl` | ❌ |
| `governance/PIIDetector.jl` | ❌ |
| `governance/Redactor.jl` | ❌ |
| `governance/LicenseRegistry.jl` | ❌ |
| `governance/ConsentLedger.jl` | ❌ |
| `observability/OTel.jl` | ❌ |
| `observability/PromExporter.jl` | ❌ |
| `observability/Healthz.jl` | ❌ |
| `observability/StructuredLog.jl` | ❌ |
| `compliance/IEC62304/` (plan, SRS, SAD, V&V matrix) | ❌ |
| `compliance/ISO14971/risk_register.yaml` | ❌ |
| `compliance/SaMD/risk_categorisation.md` | ❌ |
| `compliance/HIPAA/SRA.md` | ❌ (`docs/HIPAA_COMPLIANCE.md` exists but is design notes, not the SRA) |
| `compliance/HITRUST/crosswalk.csv` | ❌ |
| `compliance/SOC2/control_matrix.csv` | ❌ |
| `compliance/IEC62304/traceability.csv` + CI gate | ❌ |
| `security/ESignature.jl` (21 CFR Part 11 §11.10) | ❌ |
| CycloneDX SBOM in CI | ❌ |
| cosign-signed releases | ❌ |

**Status: not started.** The `docs/plan/` directory does carry forward-looking
plan addenda for IEC 62304 work products, threat model, risk register seed,
PHI mode, and integrator checklist — these are scaffolds, not the actual
artefacts the standards require. The trace-matrix CI gate (the headline gate


#### Phase 13 — Performance Hardening + v1.0.0 release

Not started. No `v0.x` tag yet on `main` (the `v0.3.0-alpha.1` and
`v0.4.0-alpha.1` markers are release-notes files, not git tags). Performance
targets (HTTP ≥2k req/s, HTML ≥500 docs/s/core, PDF ≥30 pp/s/core, PG bulk
≥200k rows/s, end-to-end overhead <8%) remain unmeasured against a published
baseline.

---


#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
#### Phase 12 — macOS Self-Hosted Runner & Workflows

| Workflow / asset (planned) | Status | Notes |
|---|---|---|
| `enterprise-ci.yml` (kept) | ✅ | Existing |
| `hygiene.yml` (kept) | ✅ | Existing |
| `mac-ci.yml` (NEW) | ✅ | Present |
| `mac-scrape-smoke.yml` (NEW, nightly) | ✅ | Present |
| `scripts/mac_runner_bootstrap.sh` | ✅ | Present |
| Runner labels `[self-hosted, macOS, ARM64, julia-1.10, ingest-runner]` | ⚠️ | Verify on actual runner registration |
| launchd plist for boot-survival | ⚠️ | In bootstrap script — needs runtime verification |
| `RUNBOOK.md` for runner tear-down/rebuild | ⚠️ | Referenced in plan; physical file presence not confirmed at root — needs check |

**Status: ~50%.** Bootstrap and the two CI/scrape workflows exist; the three
release-time workflows (perf, SBOM, compliance pack) are unwritten.


---

## 📦 Repository: biostatistics

### 🔴 Missing Features (Active Gaps)
#### F4 — Bayesian module deferral
`src/Bayesian/Bayesian.jl` is currently a Phase-13 scaffold (no live
Distributions usage beyond comments). When Phase 13 wires Turing.jl in,
Distributions priors and `MCMCChains.Chains` interop will be the natural
home — tracked in `docs/phases/PHASE_13_handoff.md`. Skipped from Phase
F to avoid prematurely shaping the public API.


#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
#### E3 — CategoricalArrays in Survey strata
`src/Survey/Designs.jl::svydesign` now promotes `String` / `Symbol`
strata columns to `CategoricalArray`. Stratum ordering follows
`CategoricalArrays.levels` (declared or first-seen) instead of `unique`'s
insertion order, which makes downstream tabular output and contrasts
match those produced by the rest of the package.


#### E4 — `cohort_timearrays` cohort exporter
`src/DataManagement/Longitudinal.jl::cohort_timearrays(df; time_col,
value_col, by)` returns a `Dict{String, TimeSeries.TimeArray}` keyed by
cohort label. This is the natural longitudinal-cohort export for
downstream plot generators (per-arm trajectory curves, NHANES-style
cohort overlays, etc.).


#### H3 — `test/VALIDATION_MATRIX.md` rollup


A new "StatsKit gap-analysis additions" section enumerates every
function added by Phases C/D/E/G alongside its source-of-truth
reference and the test file that validates it. Phase G exporters
are marked 🔄 (smoke-only) since their numerical content is
already validated upstream.


---

## 📦 Repository: Agents-julia

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: biostatistics-rust

### 🔴 Missing Features (Active Gaps)
#### GAP-001: `biostat-distributions-extended` — entire crate unimplemented (blocks Robust + Timeseries)

**Status:** Backlog
**Priority:** P1 (Critical)
**Owner:** Haiku agent (next sprint)
**Target Completion:** 2026-05-12

**Description:**
`biostat-distributions-extended` was scaffolded in Sprint 0.2 (2026-05-04) but contains zero implemented functions. The crate must provide 15 extended probability distributions — each with `pdf`, `cdf`, `ppf`, and `sample` — cross-validated against R (`extraDistr`, `actuar`, base R). Closing this gap unblocks `biostat-robust` (uses Gumbel/Laplace for contamination models) and `biostat-timeseries-basics` (uses Laplace/Logistic for residual modelling). Phase 1 cannot proceed past Week 2 without it.

**Acceptance Criteria:**

- [ ] 15 distributions implemented: Gumbel, Laplace, Logistic, Pareto, Weibull, Beta-prime, Dirichlet, Multinomial, Hypergeometric, Negative-Hypergeometric, Zero-inflated Poisson, Log-normal extended, Student-t non-central, Cauchy, Folded-normal

- [ ] Each distribution has `pdf`/`pmf`, `cdf`, `ppf`, and `sample` (where defined)

- [ ] R validation fixtures created in `validation/fixtures/r/distributions/` for each distribution

- [ ] All assertions use `assert_close!` with Class A/B tolerance (closed-form CDF/PPF)

- [ ] `cargo test --all-targets` exits 0; `cargo clippy` exits 0

- [ ] `CHANGELOG.md` updated

**Implementation Notes:**
R references: `extraDistr::dgumbel`, `extraDistr::dlaplace`, `stats::dlogis`, `actuar::dpareto`, `stats::dweibull`.
Sprints in PROGRAMMING_PLAN.md: 1.1–1.7.

**Files Likely Touched:**
- `crates/biostat-distributions-extended/src/` (all modules)
- `validation/fixtures/r/distributions/*.json`
- `crates/biostat-distributions-extended/tests/`
- `CHANGELOG.md`

**Related PRs:** None
**Blocked By:** None

**Blocking:** GAP-002, GAP-003
**Last Status Update:** 2026-05-05
- Sprint D.1: gap identified and documented; crate skeleton confirmed at 0 pub fns

---


#### GAP-002: `biostat-robust` — 5 function bodies unimplemented

**Status:** In Progress
**Priority:** P2 (High)
**Owner:** Haiku agent
**Target Completion:** 2026-05-19

**Description:**
`biostat-robust` has 5 public functions declared with `// TODO: Implement` bodies. The functions cover MAD, Winsorization, trimmed mean, M-estimator regression (IRLS), and sandwich (HC0) covariance. These are standard robust statistics primitives referenced in Phase 2 mixed-effects and econometrics sprints. Each must be cross-validated against R (`stats::mad`, `DescTools::Winsorize`, `MASS::rlm`, `sandwich::vcovHC`).

**Acceptance Criteria:**

- [ ] `mad()`, `winsorize()`, `trimmed_mean()` implemented and tested (R fixtures in `validation/fixtures/r/robust/`)

- [ ] `robust_regression()` (IRLS) implemented and tested against `MASS::rlm`

- [ ] `sandwich_covariance()` (HC0) implemented and tested against `sandwich::vcovHC`

- [ ] No `todo!()` or `unimplemented!()` remain in non-test code

- [ ] All assertions use `assert_close!` at Class D (iterative MLE) tolerance for IRLS

- [ ] `cargo test --all-targets` exits 0

**Implementation Notes:**
All 5 TODOs are in two files: `crates/biostat-robust/src/descriptive.rs` (lines 11, 23, 35) and `regression.rs` (lines 43, 81).
IRLS stopping criterion: `‖β_new − β_old‖_∞ < 1e-9`.
PROGRAMMING_PLAN.md sprints 1.8–1.11.

**Files Likely Touched:**
- `crates/biostat-robust/src/descriptive.rs`
- `crates/biostat-robust/src/regression.rs`
- `validation/fixtures/r/robust/*.json`
- `crates/biostat-robust/tests/`
- `CHANGELOG.md`

**Related PRs:** None

**Blocked By:** GAP-001 (distributions dependency for contamination models)
**Blocking:** None
**Last Status Update:** 2026-05-05
- Sprint D.1: gap documented; TODOs confirmed at lines 11, 23, 35 (descriptive.rs), 43, 81 (regression.rs)

---


#### GAP-003: `biostat-epi-extended` — 11 function bodies unimplemented

**Status:** In Progress
**Priority:** P2 (High)
**Owner:** Haiku agent
**Target Completion:** 2026-05-26

**Description:**
`biostat-epi-extended` has 11 `// TODO: Implement` stubs across three files. The 8 stubs in `tables.rs` are 2×2 table measures (RR, OR, RD, AR, PAR, NNT, NNH — and one additional measure). `stratified.rs` has the Mantel-Haenszel (CMH) test stub. `diagnostic.rs` has two stubs: a general diagnostic accuracy function and ROC-AUC computation. These are high-use functions cited in epidemiology modules and in the evidence validator pipeline.

**Acceptance Criteria:**

- [ ] All 8 `tables.rs` function bodies implemented (RR, OR, RD, AR, PAR, NNT, NNH + 1)

- [ ] `mantel_haenszel_rr` and/or `mantel_haenszel_or` implemented against `epiR::epi.2by2`

- [ ] `diagnostic_accuracy_table` and `roc_auc` implemented against `pROC::roc`

- [ ] R validation fixtures in `validation/fixtures/r/epi_extended/`

- [ ] No `todo!()` or `unimplemented!()` remain in non-test code

- [ ] `cargo test --all-targets` exits 0

**Implementation Notes:**
TODOs: `tables.rs` lines 34, 40, 46, 52, 61, 67, 73, 79 · `stratified.rs` line 22 · `diagnostic.rs` lines 22, 40.
R references: `epitools::riskratio`, `epitools::oddsratio`, `epiR::epi.2by2`, `pROC::roc`.
PROGRAMMING_PLAN.md sprints 1.12–1.19.

**Files Likely Touched:**
- `crates/biostat-epi-extended/src/tables.rs`
- `crates/biostat-epi-extended/src/stratified.rs`
- `crates/biostat-epi-extended/src/diagnostic.rs`
- `validation/fixtures/r/epi_extended/*.json`
- `crates/biostat-epi-extended/tests/`
- `CHANGELOG.md`

**Related PRs:** None

**Blocked By:** None (independent of GAP-001/GAP-002)
**Blocking:** None
**Last Status Update:** 2026-05-05
- Sprint D.1: gap documented; 11 TODOs confirmed across tables.rs, stratified.rs, diagnostic.rs

---


#### GAP-004: `biostat-timeseries-basics` — 11 function bodies unimplemented

**Status:** In Progress
**Priority:** P2 (High)
**Owner:** Haiku agent
**Target Completion:** 2026-06-02

**Description:**
`biostat-timeseries-basics` has 11 `// TODO: Implement` stubs covering the full time-series analysis surface: ACF/PACF/CCF, ADF and KPSS stationarity tests, ARIMA model fitting (CSS or Kalman filter), ARIMA forecasting + SE computation, and exponential smoothing (SES, Holt, Holt-Winters). This is the most complex Phase 1 gap and is split across 3 weeks (PROGRAMMING_PLAN.md sprints 1.20–1.31). All functions must be cross-validated against R base stats and the `tseries`/`forecast` packages.

**Acceptance Criteria:**

- [ ] `acf()`, `pacf()`, `ccf()` implemented against `stats::acf`, `stats::pacf`, `stats::ccf`

- [ ] `adf_test()` implemented against `tseries::adf.test`; `kpss_test()` against `tseries::kpss.test`

- [ ] `arima_fit()` (CSS method) implemented against `stats::arima`

- [ ] `arima_forecast()` and `arima_se()` implemented against `forecast::forecast`

- [ ] `exponential_smooth()` dispatches SES, Holt, Holt-Winters against `stats::HoltWinters`

- [ ] R validation fixtures in `validation/fixtures/r/timeseries/`

- [ ] No `todo!()` or `unimplemented!()` remain in non-test code

- [ ] `cargo test --all-targets` exits 0

**Implementation Notes:**
TODOs: `arima.rs` lines 40, 65, 75 · `stationarity.rs` lines 27, 45 · `correlation.rs` lines 14, 27, 39 · `smoothing.rs` lines 33, 37, 41.
ADF/KPSS tolerance class: G (textbook worked examples, 4 sig figs).
ARIMA tolerance class: D (iterative MLE, atol=1e-8).
PROGRAMMING_PLAN.md sprints 1.20–1.31.

**Files Likely Touched:**
- `crates/biostat-timeseries-basics/src/arima.rs`
- `crates/biostat-timeseries-basics/src/stationarity.rs`
- `crates/biostat-timeseries-basics/src/correlation.rs`
- `crates/biostat-timeseries-basics/src/smoothing.rs`
- `validation/fixtures/r/timeseries/*.json`
- `crates/biostat-timeseries-basics/tests/`
- `CHANGELOG.md`

**Related PRs:** None

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: Decision-trees-rust

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

## 📦 Repository: data-injection-rust

### 🔴 Missing Features (Active Gaps)
#### GAP-001: <one-line description>

**Status:** Backlog
**Priority:** P2 (High)
**Owner:** [Unassigned]
**Target Completion:** YYYY-MM-DD

**Description:**
<3–8 sentences. What is the gap? What problem does closing it solve? What is the scope?>

**Acceptance Criteria:**

- [ ] <Specific, verifiable criterion 1>

- [ ] <Specific, verifiable criterion 2>

- [ ] <Tests added/updated>

### 🟢 Built Features (Completed Gaps)
*No completed gaps recorded.*

---

