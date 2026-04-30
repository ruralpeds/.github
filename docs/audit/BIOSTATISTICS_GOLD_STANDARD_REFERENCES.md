# Biostatistics Audit — Gold-Standard Reference Methodology

**Companion to:** `BIOSTATISTICS_AUDIT_PLAN.md`, `BIOSTATISTICS_AUDIT_PLAN_TOOLING_RUST.md`, `BIOSTATISTICS_AUDIT_PLAN_TOOLING_JULIA.md`
**Target repository:** `ruralpeds/biostatistics` (Julia 1.12+, package `Biostatistics.jl`, ~28 KLOC, ~187 catalogued functions across 16 modules)
**Companion to existing docs in target repo:** `test/VALIDATION_MATRIX.md`, `test/reference_values/`, `validation/21_CFR_PART_11.md`, `docs/audit-plan.md`, `docs/R-vs-Biostatistics.jl-Gap-Analysis.md`
**Plan version:** 1.0
**Created:** 2026-04-28

---

## 0. Purpose and Relationship to Existing Docs

The repo already maintains `test/VALIDATION_MATRIX.md`, which records every function's status against **one** independent witness — the corresponding R reference implementation. The master plan ([§1](BIOSTATISTICS_AUDIT_PLAN.md) Guiding Principles) requires **three independent witnesses per calculation**:

1. A published worked example in a textbook with a known answer
2. An independent reference implementation (R, Python, or both)
3. A mathematical property invariant

The R cross-validation alone is witness #2. This document supplies witness #1 (textbook gold standards, with edition, page, and example number per function) and witness #3 (the property invariants that any correct implementation must satisfy regardless of reference). It also commits to a **Phase 9 strategy** (independent re-derivation in a CAS or alternate language) for every Tier-1 calculation.

Once this document is committed to the repo, every PR that touches a calculation has a deterministic answer to the question *"what gold standards must this be validated against?"* — eliminating per-session judgment drift over the long lifetime of an FDA-aligned package.

### What this document is

- A **per-function lookup table** mapping every public function in `Biostatistics.jl` to its primary textbook reference (with page and example), its secondary textbook or NIST reference, the R/scipy cross-validation call, the property invariants that must hold, and the CAS or alternate-language strategy for Phase 9 re-derivation.
- A **disagreement resolution catalog** for the 14 known cases where R and scipy (or two textbooks) disagree on tie handling, df rounding, exact-vs-asymptotic defaults, or other implementation choices. Each case has a documented decision and reasoning.
- A **clinical reference layer** for the 6 functions in this package whose gold standard is a clinical algorithm (AAP, AHA, NRP, USPSTF) rather than a statistical formula.
- A **reference version drift protocol** for what to do when R `survival` 4.x changes a default or scipy 1.x corrects a numerical bug.

### What this document is not

- It is not a re-statement of the R reference list — that lives in `test/VALIDATION_MATRIX.md` and `test/reference_values/*.R`.
- It is not the test code itself — that lives in `test/`.
- It is not a roadmap for unbuilt modules — those gaps are tracked in `docs/R-vs-Biostatistics.jl-Gap-Analysis.md` and `docs/ROADMAP.md`. This document covers only the **187 functions that exist today**, organized by module.

---

## 1. Reference Hierarchy (Recap from Master Plan §4)

When references disagree, the resolution rule is fixed in advance. From highest to lowest authority:

1. **Closed-form analytical truth** (e.g., `Beta(1,1)` is uniform; `T` with `df=∞` is `Normal(0,1)`; sum of independent χ² is χ² with summed df)
2. **Published worked examples** in established textbooks with explicit numerical answers
3. **NIST Statistical Reference Datasets (StRD)** for descriptive stats, ANOVA, linear regression, nonlinear regression — certified to ≥10 significant digits
4. **Peer-reviewed reference implementations** with documented numerical methods, pinned versions
5. **Independent re-derivation** in a CAS (SymPy, Mathematica) for closed-form results
6. **Vendor calculators** (OpenEpi, MedCalc, GraphPad QuickCalcs) as final corroboration only

For each function in §4 below, the assigned references are drawn from this hierarchy in order. A function is considered **gold-standard validated** when it agrees with its primary textbook reference and ≥1 independent software reference within declared tolerance, AND its property invariants hold under randomized property tests.

---

## 2. Tier Assignment for `Biostatistics.jl`

The master plan defines four tiers (T1 critical → T4 experimental). Applied to this repo:

| Tier | Applies to | Functions in scope | Required validation |
|---|---|---|---|
| **T1 — Critical** | Functions whose output may directly inform clinical decisions or FDA submissions | Survival analysis, diagnostic accuracy, sample-size calculations, calibration metrics, epidemiology 2×2 effect measures, Bayesian posterior summaries (when implemented) | Primary textbook + R + property + Phase 9 re-derivation + clinical reference (where applicable) |
| **T2 — Foundational** | Building blocks for T1 calculations and core inference | Descriptive stats, parametric tests, ANOVA, non-parametric tests, correlation, effect sizes, power analysis, agreement, post-hoc, meta-analysis effect-size calculations | Primary textbook + R + property |
| **T3 — Convenience** | Display, formatting, transformation helpers wrapping verified primitives | APA formatting, data ingestion, transformations, validation/data-quality, reproducible code export | Smoke tests + golden values for representative cases |
| **T4 — Experimental** | Behind feature flags, scaffolded modules awaiting implementation | Currently: empty `Bayesian/`, `Mixed/` (most of it), `Survey/`, `Causal/`, `Pooling/` (most of it) | Marked `experimental` until implementation complete; not in scope of this document |

The 187 catalogued functions distribute roughly as: **T1 ≈ 38, T2 ≈ 102, T3 ≈ 47, T4 ≈ 0** (T4 modules contain no implemented functions today).

---

## 3. Tolerance Policy

Aligned with master plan §3.2 and the existing tolerances in `VALIDATION_MATRIX.md`. Each function's required tolerance is one of these classes; the per-function table in §4 declares which class applies.

| Class | `atol` | `rtol` | Used for |
|---|---|---|---|
| **A — Closed-form analytical** | `1e-14` | `1e-12` | CDF/PDF of standard distributions, closed-form inverses |
| **B — Analytical p-values** | `1e-12` | `1e-10` | t, χ², F, normal-based test statistics |
| **C — Iterative MLE** | `1e-8` | `1e-6` | Logistic regression, Cox PH (when implemented), REML τ², Newton-Raphson root finding |
| **D — Bootstrap / simulation** | per-test | per-test | Bootstrap CIs, permutation p-values; seed and B fixed; tolerance per-test |
| **E — Textbook precision** | per-textbook | per-textbook | Textbook worked examples published to 2–4 sig figs; tolerance matches the source's precision |
| **F — R cross-validation** | `±0.001` to `±0.01` | varies | Existing `VALIDATION_MATRIX.md` tolerances; carry forward unchanged |

---

## 4. Per-Function Gold-Standard Reference Specification

For each module, the table format is:

| # | Function | Tier | Primary textbook (witness #1) | NIST/CAS witness | R reference (witness #2) | Property invariants (witness #3) | Tolerance | Clinical ref |

Notes:
- "Primary textbook" entries cite **edition · chapter or section · page or example number**. When the calculation has a canonical worked example in the cited source, the example number is given; the test should reproduce that example's published answer exactly.
- "NIST/CAS witness" specifies the NIST StRD dataset ID where one applies, otherwise the SymPy or Mathematica re-derivation strategy for Phase 9.
- "Property invariants" is a comma-separated list keyed to the canonical invariant catalog in §6 (e.g., `P-IN-UNIT, CI-CONTAINS-EST`). Every function must satisfy at least one.
- "Clinical ref" is populated only for the 6 functions where the gold standard is a clinical algorithm in addition to a statistical one; entries cite an AAP, AHA, NRP, or USPSTF document.

---

### 4.1 `Descriptive` module (10 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| D-1 | `summarize_numeric` | T2 | Rosner 8e §2 pp. 5–28 (descriptive stats) | NIST StRD `Lew`, `Lottery`, `Mavro`, `Michelso`, `NumAcc1-4` | `summary(x)`, `mean`, `sd`, `quantile` | DESC-MONOTONE, NA-PROPAGATE, EMPTY-N0 | A |
| D-2 | `SummaryStats` (struct constructor) | T3 | — (data structure) | — | — | NO-PANIC | — |
| D-3 | `render_summary_table` | T3 | — (formatting) | — | — | DETERMINISTIC-OUTPUT | — |
| D-4 | `table_one` | T3 | Rosner 8e §3.1 pp. 49–56 (tabular description) | — | `tableone::CreateTableOne(vars, strata)` | DESC-MONOTONE, GROUP-INVARIANCE | F (text match) |
| D-5 | `normality_test` (dispatcher) | T2 | Kirkwood & Sterne 2e §5 pp. 42–50 | — | `stats::shapiro.test`, `nortest::ad.test` | P-IN-UNIT | B |
| D-6 | `test_shapiro_wilk` | T2 | Royston (1992) *Appl. Statist.* 41(2): 332–339; Rosner 8e §10.10 pp. 348–351 | SymPy: closed-form W under H₀ for n=3,4 | `stats::shapiro.test` | P-IN-UNIT, W-IN-UNIT | B |
| D-7 | `test_anderson_darling` | T2 | Stephens (1974) *JASA* 69: 730–737 | — | `nortest::ad.test`, `goftest::ad.test` | P-IN-UNIT, A2-NONNEG | B |
| D-8 | `test_kolmogorov_smirnov` | T2 | Conover, *Practical Nonparametric Statistics* 3e §6.1 pp. 428–446 | — | `stats::ks.test` | P-IN-UNIT, D-IN-UNIT | B |
| D-9 | `test_dagostino_pearson` | T2 | D'Agostino & Pearson (1973) *Biometrika* 60(3): 613–622; Pearson, D'Agostino & Bowman (1977) *Biometrika* 64(2): 231–246 | — | `fBasics::dagoTest` | P-IN-UNIT, K2-NONNEG | B |
| D-10 | `missing_data_summary` | T3 | Little & Rubin, *Statistical Analysis with Missing Data* 3e §1.2 pp. 4–8 | — | `naniar::miss_var_summary` | NA-PROPAGATE, COUNT-NONNEG | F |

---

### 4.2 `Inference/Inference` module — Parametric tests (~30 core functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| I-1 | `one_sample_t_test` | T2 | Rosner 8e §7.4 ex. 7.2 p. 220 (one-sample t) | SymPy: T-statistic closed form for known μ, σ | `stats::t.test(x, mu=μ₀)` | P-IN-UNIT, CI-CONTAINS-EST, T-FINITE | B |
| I-2 | `two_sample_t_test` | T2 | Rosner 8e §8.4 ex. 8.7 p. 282 (two-sample t, equal var) | SymPy: pooled-var T closed form | `stats::t.test(x, y, var.equal=TRUE)` | P-IN-UNIT, GROUP-SWAP-SYMMETRY, CI-CONTAINS-EST | B |
| I-3 | `welch_t_test` | T2 | Rosner 8e §8.5 ex. 8.13 p. 290 (Welch t); Welch (1947) *Biometrika* 34: 28–35 | SymPy: Welch-Satterthwaite df closed form | `stats::t.test(x, y, var.equal=FALSE)` | P-IN-UNIT, GROUP-SWAP-SYMMETRY, DF-NONNEG | B |
| I-4 | `paired_t_test` | T2 | Rosner 8e §8.2 ex. 8.3 p. 270 (paired t) | SymPy: equivalent to one-sample t on differences | `stats::t.test(x, y, paired=TRUE)` | P-IN-UNIT, CI-CONTAINS-EST, EQUIV-PAIRED-DIFF | B |
| I-5 | `one_way_anova` | T2 | Rosner 8e §12.2 ex. 12.5 p. 564 (one-way ANOVA F) | NIST StRD `AtmWtAg`, `SiRstv`, `SmLs01-09` (ANOVA datasets) | `stats::aov(y ~ group)` summary | P-IN-UNIT, F-NONNEG, ETA2-IN-UNIT, SS-DECOMP | B |
| I-6 | `kruskal_wallis_test` | T2 | Hollander, Wolfe & Chicken, *Nonparametric Statistical Methods* 3e §6.1 pp. 204–212; Conover 3e §5.2 pp. 288–297 | — | `stats::kruskal.test` | P-IN-UNIT, H-NONNEG, INVARIANT-MONOTONE-TRANSFORM | B |
| I-7 | `repeated_measures_anova` | T2 | Maxwell & Delaney, *Designing Experiments and Analyzing Data* 3e §11.1–11.5 pp. 539–586 | — | `stats::aov(y ~ time + Error(subject/time))` | P-IN-UNIT, F-NONNEG, SUBJECT-INVARIANCE | B |

---

### 4.3 `Inference/PostHoc` module (≥6 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| PH-1 | `tukey_hsd` | T2 | Maxwell & Delaney 3e §5.4 pp. 217–228; Tukey (1953) "Problem of Multiple Comparisons" | SymPy: studentized range distribution closed form available for k=2 | `stats::TukeyHSD(aov(...))` | P-IN-UNIT, FAMILYWISE-ALPHA, PAIRWISE-CONSISTENCY | B |
| PH-2 | `scheffe_test` | T2 | Scheffé, *The Analysis of Variance* §3.5 pp. 66–73 | — | `DescTools::ScheffeTest` | P-IN-UNIT, FAMILYWISE-ALPHA, CONTRAST-ARBITRARY | B |
| PH-3 | `dunnett_test` | T2 | Dunnett (1955) *JASA* 50: 1096–1121 | — | `multcomp::glht(..., linfct = mcp(group="Dunnett"))` | P-IN-UNIT, REFERENCE-INVARIANCE | B |
| PH-4 | `games_howell` | T2 | Games & Howell (1976) *J. Educ. Stat.* 1: 113–125 | — | `userfriendlyscience::posthocTGH` | P-IN-UNIT, UNEQUAL-VAR-ROBUST | B |
| PH-5 | `bonferroni_correction` | T2 | Dunn (1961) *JASA* 56: 52–64; Rosner 8e §12.6 pp. 590–593 | SymPy: closed form `min(1, m·p)` | `stats::p.adjust(method="bonferroni")` | P-IN-UNIT, MONOTONE-IN-M, CONSERVATIVE | A |
| PH-6 | `holm_correction` | T2 | Holm (1979) *Scand. J. Stat.* 6: 65–70 | SymPy: closed form sequential rejection | `stats::p.adjust(method="holm")` | P-IN-UNIT, BONFERRONI-DOMINATES, MONOTONE-STEP | A |
| PH-7 | `bh_fdr_correction` | T2 | Benjamini & Hochberg (1995) *JRSS-B* 57: 289–300 | — | `stats::p.adjust(method="BH")` | P-IN-UNIT, FDR-BOUND, MONOTONE-STEP | B |

---

### 4.4 `Inference/Agreement` module — Inter-rater reliability (15 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol | Clinical ref |
|---|---|---|---|---|---|---|---|---|
| AG-1 | `cohens_kappa` | T2 | Fleiss, Levin & Paik 3e §18.1 pp. 598–606; Cohen (1960) *EPM* 20: 37–46 | SymPy: closed form for 2×2 with given marginals | `irr::kappa2`, `psych::cohen.kappa` | KAPPA-IN-RANGE, AGREEMENT-MONOTONE, IDENTICAL-RATERS-K1 | B | — |
| AG-2 | `weighted_kappa` | T2 | Fleiss, Cohen & Everitt (1969) *Psych. Bull.* 72: 323–327 | — | `irr::kappa2(weight = "squared")`, `psych::cohen.kappa` | KAPPA-IN-RANGE, WEIGHT-NORMALIZE | B | — |
| AG-3 | `kappa_se` | T2 | Fleiss, Levin & Paik 3e §18.1.5 pp. 605–607 | SymPy: SE closed form under independence | `irr::kappa2$value` SE | SE-NONNEG | B | — |
| AG-4 | `kappa_ci` | T2 | Fleiss, Levin & Paik 3e §18.1.5 pp. 605–607 | — | `irr::kappa2`, `psych::cohen.kappa$ci` | CI-CONTAINS-EST, CI-WIDTH-FALLS-WITH-N | B | — |
| AG-5 | `fleiss_kappa` | T2 | Fleiss (1971) *Psych. Bull.* 76: 378–382; Fleiss, Levin & Paik 3e §18.2 pp. 608–612 | — | `irr::kappam.fleiss` | KAPPA-IN-RANGE, RATER-COUNT-INVARIANCE | B | — |
| AG-6 | `light_kappa` | T2 | Light (1971) *Psych. Bull.* 76: 365–377 | — | `irr::kappam.light` | KAPPA-IN-RANGE | B | — |
| AG-7 | `icc` (10 forms) | T1 | Shrout & Fleiss (1979) *Psych. Bull.* 86: 420–428; McGraw & Wong (1996) *Psych. Methods* 1: 30–46 | — | `irr::icc`, `psych::ICC` | ICC-IN-RANGE, FORM-CONSISTENCY, RANDOM-VS-FIXED | B | — |
| AG-8 | `kendall_w` | T2 | Kendall & Babington Smith (1939) *Ann. Math. Stat.* 10: 275–287; Conover 3e §5.10 pp. 376–384 | — | `irr::kendall`, `DescTools::KendallW` | W-IN-UNIT, RATER-COUNT-INVARIANCE | B | — |
| AG-9 | `percent_agreement` | T3 | — (descriptive) | — | `irr::agree` | P-IN-UNIT | A | — |
| AG-10 | `krippendorff_alpha` (dispatcher) | T2 | Krippendorff, *Content Analysis* 4e §12.1 pp. 277–323; Hayes & Krippendorff (2007) *Comm. Methods & Measures* 1: 77–89 | — | `irr::kripp.alpha`, `DescTools::KrippAlpha` | ALPHA-IN-RANGE | B | — |
| AG-11 | `krippendorff_alpha_nominal` | T2 | Krippendorff 4e §12.2 p. 285 | — | `irr::kripp.alpha(method="nominal")` | ALPHA-IN-RANGE | D (bootstrap) | — |
| AG-12 | `krippendorff_alpha_ordinal` | T2 | Krippendorff 4e §12.2 p. 287 | — | `irr::kripp.alpha(method="ordinal")` | ALPHA-IN-RANGE, ORDER-PRESERVING | D | — |
| AG-13 | `krippendorff_alpha_interval` | T2 | Krippendorff 4e §12.2 p. 290 | — | `irr::kripp.alpha(method="interval")` | ALPHA-IN-RANGE | D | — |
| AG-14 | `bland_altman` | T1 | Bland & Altman (1986) *Lancet* 1: 307–310; Altman, *Practical Statistics for Medical Research* §14.2 pp. 396–403 | SymPy: 95% LoA = mean(d) ± 1.96·sd(d) closed form | `blandr::blandr.statistics` | LOA-WIDTH-NONNEG, MEAN-DIFF-CENTERED | B | — |
| AG-15 | `bland_altman_ci` | T2 | Altman & Bland (2003) *J. R. Stat. Soc. D* 52: 247–257 | — | `blandr::blandr.statistics` | CI-CONTAINS-EST | B | — |

---

### 4.5 `Inference/Epidemiology` module — Classical epidemiology (~25 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol | Clinical ref |
|---|---|---|---|---|---|---|---|---|
| E-1 | `odds_ratio` | T1 | Rothman, Greenland & Lash, *Modern Epidemiology* 3e §14 pp. 240–247; Fleiss, Levin & Paik 3e §6.2 pp. 102–105 | SymPy: OR = (a·d)/(b·c) closed form | `epitools::oddsratio`, `epiR::epi.2by2` | OR-NONNEG, OR-INVERSE-SYMMETRY, LOG-OR-NORMAL | B | — |
| E-2 | `odds_ratio_ci` | T1 | Fleiss, Levin & Paik 3e §6.4 pp. 109–114 (Woolf, Cornfield, exact) | SymPy: Woolf SE closed form | `epitools::oddsratio(method="wald"/"midp"/"fisher")` | CI-CONTAINS-EST, METHOD-AGREEMENT-LARGE-N | B | — |
| E-3 | `risk_ratio` | T1 | Rothman, Greenland & Lash 3e §14 pp. 237–240 | SymPy: RR = (a/(a+b))/(c/(c+d)) closed form | `epitools::riskratio`, `epiR::epi.2by2` | RR-NONNEG, RR-INVERSE-SYMMETRY | B | — |
| E-4 | `risk_difference` | T1 | Rothman, Greenland & Lash 3e §14 pp. 232–237; Newcombe (1998) *Stat. Med.* 17: 873–890 (CI methods) | SymPy: RD = a/(a+b) − c/(c+d) | `epitools::riskdiff`, `Epi::twoby2` | RD-IN-RANGE | B | — |
| E-5 | `number_needed_to_treat` | T1 | Altman, *Practical Stats* §15.4 pp. 425–428 | SymPy: NNT = 1/RD closed form | `epiR::epi.2by2$massoc.detail$NNT.strata` | NNT-FINITE, INVERSE-RD | A | AHA Scientific Statement on NNT (Mendis et al. 2007) Circulation 116:407 (**USA-sourced**) |
| E-6 | `number_needed_to_harm` | T1 | Altman & Andersen (1999) *BMJ* 319: 1492–1495 | SymPy: NNH = 1/ARI | `epiR::epi.2by2` | NNH-FINITE | A | — |
| E-7 | `mantel_haenszel_or` | T1 | Mantel & Haenszel (1959) *J. Natl. Cancer Inst.* 22: 719–748; Rothman, Greenland & Lash 3e §15.3 pp. 269–275 | — | `stats::mantelhaen.test`, `epiR::epi.2by2(method="cohort.count")` | OR-NONNEG, STRATA-WEIGHT-CONSISTENT | B | — |
| E-8 | `incidence_rate` | T1 | Rothman, Greenland & Lash 3e §3.4 pp. 38–43 | SymPy: IR = events / person-time | `epiR::epi.conf(method="poisson.exact")` | IR-NONNEG, EXTENSIVE-IN-PT | A | — |
| E-9 | `age_standardized_rate_direct` | T1 | Rothman, Greenland & Lash 3e §3.5 pp. 44–46; CDC Epi Manual §6 (direct standardization) | SymPy: weighted sum of stratum-specific rates | `epitools::ageadjust.direct`, `PHEindicatormethods::calculate_dsr` | RATE-NONNEG, WEIGHTS-SUM-1 | B | CDC Principles of Epidemiology in Public Health Practice 3e §3 (**USA**) |
| E-10 | `age_standardized_rate_indirect` (SMR) | T1 | Breslow & Day, *Statistical Methods in Cancer Research Vol. II: The Design and Analysis of Cohort Studies* §2.2 pp. 48–79 | — | `epitools::ageadjust.indirect`, `PHEindicatormethods::calculate_smr` | SMR-NONNEG, SMR-INTERPRETATION | B | — |
| E-11 | `attack_rate` | T1 | CDC Epi Manual §3 (acute outbreak investigations) | SymPy: AR = ill / at-risk | `epitools::ageadjust.direct` (specialization) | AR-IN-UNIT | A | CDC Principles of Epidemiology 3e §11 (**USA**) |
| E-12 | `secondary_attack_rate` | T1 | CDC Epi Manual §3 | SymPy: SAR = secondary / (contacts − primary) | manual computation | SAR-IN-UNIT | A | — |
| E-13 | `epi_2by2_cohort` | T1 | Rothman, Greenland & Lash 3e §15.1 pp. 256–260 | — | `epiR::epi.2by2(method="cohort.count")` | EFFECT-MEASURES-CONSISTENT | B | — |
| E-14 | `epi_2by2_case_control` | T1 | Rothman, Greenland & Lash 3e §15.2 pp. 260–268 | — | `epiR::epi.2by2(method="case.control")` | OR-VALID, RR-NA-FOR-CC | B | — |
| E-15 | `epi_2by2_cross_sectional` | T1 | Rothman, Greenland & Lash 3e §15.4 pp. 275–278 | — | `epiR::epi.2by2(method="cross.sectional")` | PREVALENCE-VALID | B | — |

---

### 4.6 `Inference/DiagnosticAccuracy` module (~12 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol | Clinical ref |
|---|---|---|---|---|---|---|---|---|
| DA-1 | `sensitivity` | T1 | Pepe, *The Statistical Evaluation of Medical Tests for Classification and Prediction* §1.1 pp. 13–16 | SymPy: TP/(TP+FN) | `epiR::epi.tests`, `caret::sensitivity` | SENS-IN-UNIT, COMPLEMENT-FNR | A | USPSTF Procedure Manual Appendix VI (sens/spec definitions, **USA**) |
| DA-2 | `specificity` | T1 | Pepe §1.1 pp. 13–16 | SymPy: TN/(TN+FP) | `epiR::epi.tests`, `caret::specificity` | SPEC-IN-UNIT, COMPLEMENT-FPR | A | — |
| DA-3 | `ppv` (positive predictive value) | T1 | Pepe §2.4 pp. 31–34; Altman *Practical Stats* §14.3 pp. 411–417 | SymPy: Bayes formula | `epiR::epi.tests` | PPV-IN-UNIT, BAYES-PREVALENCE-EFFECT | A | — |
| DA-4 | `npv` (negative predictive value) | T1 | Pepe §2.4 pp. 31–34 | SymPy: Bayes formula | `epiR::epi.tests` | NPV-IN-UNIT | A | — |
| DA-5 | `youden_j` | T1 | Youden (1950) *Cancer* 3: 32–35 | SymPy: J = sens + spec − 1 | `OptimalCutpoints::optimal.cutpoints(methods="Youden")` | J-IN-RANGE-MINUS1-PLUS1 | A | — |
| DA-6 | `likelihood_ratio_positive` | T1 | Sackett et al., *Evidence-Based Medicine* 2e §4 pp. 121–128 | SymPy: LR+ = sens/(1−spec) | `epiR::epi.tests` | LRPLUS-NONNEG | A | — |
| DA-7 | `likelihood_ratio_negative` | T1 | Sackett et al. 2e §4 pp. 121–128 | SymPy: LR− = (1−sens)/spec | `epiR::epi.tests` | LRMINUS-NONNEG | A | — |
| DA-8 | `diagnostic_odds_ratio` | T1 | Glas et al. (2003) *J. Clin. Epi.* 56: 1129–1135 | SymPy: DOR = (TP·TN)/(FP·FN) = LR+/LR− | `epiR::epi.tests` | DOR-NONNEG, DOR-COMPOSITE | A | — |
| DA-9 | `roc_curve` | T1 | Pepe §4 pp. 66–105 | — | `pROC::roc` | ROC-MONOTONE, ENDPOINTS-00-11 | B | — |
| DA-10 | `roc_auc` (trapezoidal) | T1 | Hanley & McNeil (1982) *Radiology* 143: 29–36; Pepe §4.5 pp. 96–103 | SymPy: AUC = ∑ trapezoid areas | `pROC::auc` | AUC-IN-UNIT, AUC-MONOTONE-INVARIANCE | B | — |
| DA-11 | `roc_auc_ci_delong` | T1 | DeLong, DeLong & Clarke-Pearson (1988) *Biometrics* 44: 837–845 | — | `pROC::ci.auc(method="delong")` | CI-CONTAINS-EST, CI-WIDTH-FALLS-WITH-N | B | — |
| DA-12 | `roc_auc_ci_bootstrap` | T1 | Pepe §4.6 pp. 103–105 | — | `pROC::ci.auc(method="bootstrap")` | CI-CONTAINS-EST | D | — |
| DA-13 | `roc_auc_partial` | T1 | McClish (1989) *Med. Decis. Making* 9: 190–195 | — | `pROC::auc(partial.auc=c(lo,hi))` | PARTIAL-AUC-IN-RANGE | B | — |
| DA-14 | `roc_test_delong` | T1 | DeLong, DeLong & Clarke-Pearson (1988) *Biometrics* 44: 837–845 | — | `pROC::roc.test(method="delong")` | P-IN-UNIT, SYMMETRIC-IN-MODELS | B | — |
| DA-15 | `optimal_threshold_youden` | T1 | Youden (1950) *Cancer* 3: 32–35 | SymPy: argmax over thresholds | `pROC::coords(roc, "best", best.method="youden")` | THRESHOLD-IN-DOMAIN | B | — |
| DA-16 | `optimal_threshold_closest_topleft` | T1 | Perkins & Schisterman (2006) *Am. J. Epi.* 163: 670–675 | SymPy: argmin over distance to (0,1) | `pROC::coords(roc, "best", best.method="closest.topleft")` | THRESHOLD-IN-DOMAIN | B | — |
| DA-17 | `prevalence_adjusted_predictive_values` | T1 | Altman *Practical Stats* §14.3 pp. 411–417 | SymPy: Bayes formula | `epiR::epi.tests(prev=...)` | PPV-NPV-IN-UNIT | A | — |

---

### 4.7 `Inference/Calibration` module — Predictive model calibration (~7 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| CAL-1 | `hosmer_lemeshow` | T1 | Hosmer, Lemeshow & Sturdivant, *Applied Logistic Regression* 3e §5.2.2 pp. 153–164 | — | `ResourceSelection::hoslem.test`, `rms::residuals.lrm(type="gof")` | P-IN-UNIT, CHI2-NONNEG, GROUP-COUNT-EFFECT | B |
| CAL-2 | `brier_score` | T1 | Steyerberg, *Clinical Prediction Models* 2e §15.3 pp. 280–283; Brier (1950) *Mon. Weather Rev.* 78: 1–3 | SymPy: BS = mean((p − y)²) | `DescTools::BrierScore`, `rms::val.prob$Brier` | BS-IN-UNIT, PERFECT-PREDICTION-0 | A |
| CAL-3 | `c_statistic` | T1 | Harrell, *Regression Modeling Strategies* 2e §10.8 pp. 256–259 | — | `Hmisc::rcorr.cens`, `survival::concordance` | C-IN-RANGE-HALF-ONE, CHANCE-MODEL-HALF | B |
| CAL-4 | `nri_continuous` | T1 | Pencina, D'Agostino & Steyerberg (2011) *Stat. Med.* 30: 11–21 | — | `nricens::nribin` | NRI-IN-RANGE-MINUS-PLUS, ZERO-IF-IDENTICAL | B |
| CAL-5 | `nri_categorical` | T1 | Pencina et al. (2008) *Stat. Med.* 27: 157–172 | — | `nricens::nricens` | NRI-IN-RANGE | B |
| CAL-6 | `idi` (Integrated Discrimination Improvement) | T1 | Pencina et al. (2008) *Stat. Med.* 27: 157–172 | — | `nricens::improveProb` | IDI-IN-REAL | B |
| CAL-7 | `calibration_slope` | T1 | Steyerberg 2e §15.3 pp. 285–286; van Houwelingen (2000) *Stat. Med.* 19: 3401–3415 | SymPy: linear regression of `y` on `logit(p̂)` | `rms::val.prob$Slope` | SLOPE-1-IF-PERFECT | B |
| CAL-8 | `calibration_intercept` | T1 | Steyerberg 2e §15.3 pp. 285–286 | — | `rms::val.prob$Intercept` | INTERCEPT-0-IF-PERFECT | B |

---

### 4.8 `Inference/Survival` module — Non-parametric survival (12 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| S-1 | `SurvTime` | T2 | Collett, *Modelling Survival Data in Medical Research* 3e §1.3 pp. 4–7 (data structures) | — | `survival::Surv` | NO-PANIC, CENSOR-FLAG-VALID | — |
| S-2 | `is_censored` | T3 | — (predicate) | — | `survival::Surv$status` accessor | DETERMINISTIC | — |
| S-3 | `event_table` | T2 | Collett 3e §2.1 pp. 13–18 (life table construction) | — | `survival::survfit` summary | RISK-SET-MONOTONE | A |
| S-4 | `survfit_km` | T1 | Kaplan & Meier (1958) *JASA* 53: 457–481; Collett 3e §2.1 pp. 13–22 | SymPy: product-limit closed form for n=2,3,4 | `survival::survfit(Surv(t,d) ~ 1)` | KM-S0-EQUALS-1, KM-MONOTONE-NONINCREASING, KM-IN-UNIT | B |
| S-5 | `survival_probability` | T1 | Collett 3e §2.1 pp. 13–22 | — | `summary(survfit(...))$surv` | KM-IN-UNIT, LOCF-VALID | B |
| S-6 | `median_survival` | T1 | Brookmeyer & Crowley (1982) *Biometrics* 38: 29–41 | — | `survival::survfit` median | MEDIAN-FINITE-OR-INF | B |
| S-7 | `survival_ci` | T1 | Greenwood (1926) "The natural duration of cancer"; Collett 3e §2.1.3 pp. 22–25 | SymPy: Greenwood SE closed form | `summary(survfit(...))$upper/lower` | CI-CONTAINS-EST, CI-IN-UNIT | B |
| S-8 | `logrank_test` | T1 | Mantel (1966) *Cancer Chem. Rep.* 50: 163–170; Collett 3e §2.5.1 pp. 41–48 | — | `survival::survdiff(rho=0)` | P-IN-UNIT, CHI2-NONNEG, GROUP-SWAP-INVARIANT | B |
| S-9 | `fleming_harrington_test` | T1 | Fleming & Harrington, *Counting Processes and Survival Analysis* §7.3 pp. 252–267 | — | `survival::survdiff(rho=ρ)` | P-IN-UNIT, RHO-CONSISTENCY | B |
| S-10 | `peto_peto_test` | T1 | Peto & Peto (1972) *J. R. Stat. Soc. A* 135: 185–207 | — | `survival::survdiff(rho=1)` | P-IN-UNIT, EQUIV-FH-1-0 | B |
| S-11 | `stratified_logrank` | T1 | Collett 3e §2.5.6 pp. 53–55 | — | `survival::survdiff(... + strata(s))` | P-IN-UNIT, STRATA-WEIGHT-CONSISTENT | B |

**Future T1 (not yet implemented; Cox PH and parametric survival):** When implemented, the gold-standard references will be Cox (1972) *JRSS-B* 34: 187–220; Therneau & Grambsch, *Modeling Survival Data: Extending the Cox Model* (full text); Collett 3e §3 (Cox PH) and §6 (parametric AFT). Until they exist, they are out of scope of this document.

---

### 4.9 `Inference/MetaAnalysis` module — Pairwise meta-analysis (30 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| MA-1 | `escalc_md` | T2 | Borenstein, Hedges, Higgins & Rothstein, *Introduction to Meta-Analysis* §5 pp. 21–27 | SymPy: MD = ȳ₁ − ȳ₂ closed form | `metafor::escalc(measure="MD")` | MD-FINITE, GROUP-SWAP-SIGN | B |
| MA-2 | `escalc_smd` | T2 | Borenstein et al. §6 pp. 27–32; Hedges (1981) *J. Educ. Stat.* 6: 107–128 (correction factor) | SymPy: Hedges g closed form | `metafor::escalc(measure="SMD")` | SMD-FINITE, BIAS-CORRECTION | B |
| MA-3 | `escalc_or` | T2 | Borenstein et al. §5.5 pp. 33–37 | SymPy: log-OR closed form | `metafor::escalc(measure="OR")` | LOG-OR-FINITE | B |
| MA-4 | `escalc_rr` | T2 | Borenstein et al. §5.6 pp. 38–39 | SymPy: log-RR closed form | `metafor::escalc(measure="RR")` | LOG-RR-FINITE | B |
| MA-5 | `escalc_rd` | T2 | Borenstein et al. §5.6 pp. 38–39 | SymPy: RD closed form | `metafor::escalc(measure="RD")` | RD-IN-RANGE | B |
| MA-6 | `escalc_proportions` | T2 | Borenstein et al. §6.5 pp. 51–53; Lipsitz et al. (1991) *Stat. Med.* 10: 1869–1878 | — | `metafor::escalc(measure="PAS"/"PLO"/"PFT")` | TRANSFORMED-FINITE | B |
| MA-7 | `escalc_correlation` | T2 | Borenstein et al. §5.4 pp. 31–32; Fisher (1921) *Metron* 1: 3–32 (z-transform) | SymPy: Fisher z = atanh(r) | `metafor::escalc(measure="ZCOR")` | Z-FINITE-FOR-R-NOT-PM1 | B |
| MA-8 | `rma_fixed` (FE) | T2 | Borenstein et al. §11 pp. 65–69 | SymPy: inverse-variance weighted mean closed form | `metafor::rma(method="FE")` | POOLED-IN-RANGE, WEIGHT-SUM-1 | B |
| MA-9 | `rma_random_dl` | T2 | DerSimonian & Laird (1986) *Control. Clin. Trials* 7: 177–188; Borenstein et al. §12 pp. 69–78 | SymPy: DL τ² estimator closed form | `metafor::rma(method="DL")` | TAU2-NONNEG, FE-LIMIT-AS-TAU2-0 | B |
| MA-10 | `rma_random_reml` | T2 | Viechtbauer (2005) *J. Educ. Behav. Stat.* 30: 261–293 | — | `metafor::rma(method="REML")` | TAU2-NONNEG | C |
| MA-11 | `rma_random_ml` | T2 | Hardy & Thompson (1996) *Stat. Med.* 15: 619–629 | — | `metafor::rma(method="ML")` | TAU2-NONNEG | C |
| MA-12 | `rma_mixed` (meta-regression) | T2 | Thompson & Higgins (2002) *Stat. Med.* 21: 1559–1573 | — | `metafor::rma(mods = ~x)` | COEF-FINITE | C |
| MA-13 | `heterogeneity_test` | T2 | Cochran (1954) *Biometrics* 10: 101–129 | SymPy: Q closed form | `metafor::rma()$QE/QEp` | Q-NONNEG, P-IN-UNIT | B |
| MA-14 | `heterogeneity_i2` | T2 | Higgins & Thompson (2002) *Stat. Med.* 21: 1539–1558 | SymPy: I² = max(0, (Q − df) / Q) | `metafor::rma()$I2` | I2-IN-UNIT | B |
| MA-15 | `heterogeneity_h2` | T2 | Higgins & Thompson (2002) *Stat. Med.* 21: 1539–1558 | SymPy: H² = Q / df | `metafor::rma()$H2` | H2-GE-1 | B |
| MA-16 | `heterogeneity_q_test` | T2 | Cochran (1954) | — | `metafor::rma()$QE`, `$QEp` | P-IN-UNIT | B |
| MA-17 | `tau2_ci` | T2 | Viechtbauer (2007) *Stat. Med.* 26: 37–52 | — | `metafor::confint.rma.uni` | CI-CONTAINS-EST | C |
| MA-18 | `prediction_interval` | T2 | Higgins, Thompson & Spiegelhalter (2009) *J. R. Stat. Soc. A* 172: 137–159 | — | `metafor::predict.rma` | PI-CONTAINS-POOLED | B |
| MA-19 | `egger_test` | T2 | Egger et al. (1997) *BMJ* 315: 629–634 | — | `metafor::regtest` | P-IN-UNIT | B |
| MA-20 | `rank_test` | T2 | Begg & Mazumdar (1994) *Biometrics* 50: 1088–1101 | — | `metafor::ranktest` | P-IN-UNIT, KENDALL-TAU-RANGE | B |
| MA-21 | `trim_fill` | T2 | Duval & Tweedie (2000) *Biometrics* 56: 455–463 | — | `metafor::trimfill` | K-IMPUTED-NONNEG | B |
| MA-22 | `failsafe_n` | T2 | Rosenthal (1979) *Psych. Bull.* 86: 638–641 | SymPy: closed form | `metafor::fsn` | FSN-NONNEG | A |
| MA-23 | `meta_residuals` | T2 | Viechtbauer (2010) *J. Stat. Software* 36(3): 1–48 | — | `metafor::rstudent.rma.uni` | RES-FINITE | C |
| MA-24 | `meta_influence` | T2 | Viechtbauer & Cheung (2010) *Res. Synth. Methods* 1: 112–125 | — | `metafor::influence.rma.uni` | INF-MEASURES-FINITE | C |
| MA-25 | `meta_leave1out` | T2 | Borenstein et al. §39 pp. 367–369 | — | `metafor::leave1out.rma.uni` | RECOMPUTED-CONSISTENT | B |
| MA-26 | `meta_cumulative` | T2 | Lau et al. (1992) *N. Engl. J. Med.* 327: 248–254 | — | `metafor::cumul.rma.uni` | CUMUL-MONOTONE-K | B |
| MA-27 | `meta_subgroup` | T2 | Borenstein et al. §19 pp. 149–154 | — | `metafor::rma()` per subgroup with between-Q | SUB-Q-DECOMP | B |
| MA-28 | `meta_regression` | T2 | Thompson & Higgins (2002) *Stat. Med.* 21: 1559–1573 | — | `metafor::rma(mods = ~x)` | R2-IN-UNIT | C |
| MA-29 | `omnibus_test` | T2 | Viechtbauer (2010) | — | `metafor::rma()$QM/QMp` | P-IN-UNIT | B |
| MA-30 | `permutation_test` | T2 | Higgins & Thompson (2004) *Stat. Med.* 23: 1663–1682 | — | `metafor::permutest.rma.uni` | P-IN-UNIT | D |

---

### 4.10 `Inference/SampleSize` and `Power` modules (30 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| P-1 | `power_t_test` | T1 | Cohen, *Statistical Power Analysis for the Behavioral Sciences* 2e §2.3 ex. 2.1 pp. 28–32; tables §2.4 pp. 36–40 | SymPy: noncentral t closed form for given (n, d, α) | `pwr::pwr.t.test` | POWER-IN-UNIT, MONOTONE-IN-N, MONOTONE-IN-EFFECT | B |
| P-2 | `power_one_sample_t` | T1 | Cohen 2e §2.3 pp. 28–32 | SymPy | `pwr::pwr.t.test(type="one.sample")` | POWER-IN-UNIT | B |
| P-3 | `power_paired_t` | T1 | Cohen 2e §2.5 pp. 48–52 | SymPy | `pwr::pwr.t.test(type="paired")` | POWER-IN-UNIT | B |
| P-4 | `power_t2n_test` | T1 | Cohen 2e §2.3 pp. 28–32 (unequal n) | SymPy | `pwr::pwr.t2n.test` | POWER-IN-UNIT, N-RATIO-EFFECT | B |
| P-5 | `power_two_sample_unequal_n` | T1 | (alias of P-4) | — | `pwr::pwr.t2n.test` | (same) | B |
| P-6 | `sample_size_t_test` | T1 | Cohen 2e §2.4 ex. 2.7 pp. 53–55 | SymPy: solve power eq for n | `pwr::pwr.t.test(power=...)` | N-NONNEG, MONOTONE-IN-POWER | B |
| P-7 | `power_anova` | T1 | Cohen 2e §8.3 ex. 8.1 pp. 285–292 | — | `pwr::pwr.anova.test` | POWER-IN-UNIT | B |
| P-8 | `es_h` | T2 | Cohen 2e §6.2 ex. 6.1 p. 181 | SymPy: h = 2·asin(√p₁) − 2·asin(√p₂) | `pwr::ES.h` | H-IN-RANGE-MINUSPI-PLUSPI | A |
| P-9 | `es_w1` | T2 | Cohen 2e §7.2 ex. 7.1 pp. 216–217 | SymPy: w = √(∑(p_obs − p_exp)² / p_exp) | `pwr::ES.w1` | W-NONNEG | A |
| P-10 | `es_w2` | T2 | Cohen 2e §7.2 ex. 7.4 pp. 220–221 | SymPy: w from joint vs marginal | `pwr::ES.w2` | W-NONNEG | A |
| P-11 | `cohen_es` | T3 | Cohen 2e tables §1.4 (small/medium/large) | — | `pwr::cohen.ES` | LOOKUP-EXACT | E |
| P-12 | `power_proportions` | T1 | Cohen 2e §6.3 ex. 6.5 pp. 188–193 | — | `pwr::pwr.2p.test` | POWER-IN-UNIT | B |
| P-13 | `power_two_proportions_2n` | T1 | Cohen 2e §6.4 (unequal n) | — | `pwr::pwr.2p2n.test` | POWER-IN-UNIT | B |
| P-14 | `power_proportion` | T1 | Cohen 2e §6.5 (one-sample) | — | `pwr::pwr.p.test` | POWER-IN-UNIT | B |
| P-15 | `power_chisq` | T1 | Cohen 2e §7.3 ex. 7.7 pp. 226–229 | — | `pwr::pwr.chisq.test` | POWER-IN-UNIT | B |
| P-16 | `sample_size_chisq` | T1 | Cohen 2e §7.4 pp. 240–245 | — | `pwr::pwr.chisq.test(power=...)` | N-NONNEG | B |
| P-17 | `power_correlation` | T1 | Cohen 2e §3.3 ex. 3.1 pp. 87–88 | SymPy: Fisher z noncentral | `pwr::pwr.r.test` | POWER-IN-UNIT | B |
| P-18 | `sample_size_correlation` | T1 | Cohen 2e §3.4 pp. 92–96 | SymPy: solve | `pwr::pwr.r.test(power=...)` | N-NONNEG | B |
| P-19 | `power_glm` | T1 | Cohen 2e §9.3 ex. 9.1 pp. 410–414 | — | `pwr::pwr.f2.test` | POWER-IN-UNIT | B |
| P-20 | `power_z_test` | T1 | Cohen 2e §1.4 pp. 19–25 (normal) | SymPy: Φ(z_α + z_β) closed form | `pwr::pwr.norm.test` | POWER-IN-UNIT | B |
| P-21 | `power_fisher_exact` | T1 | Casagrande, Pike & Smith (1978) *Biometrics* 34: 483–486 | — | `Exact::power.exact.test`, `statmod::power.fisher.test` | POWER-IN-UNIT | D |
| P-22 | `power_mcnemar` | T1 | Connor (1987) *Biometrics* 43: 207–211 | — | `Hmisc::bpower`, manual | POWER-IN-UNIT | B |
| P-23 | `power_logistic_regression` | T1 | Hsieh, Bloch & Larsen (1998) *Stat. Med.* 17: 1623–1634 | — | `WebPower::wp.logistic` | POWER-IN-UNIT | B |
| P-24 | `power_linear_regression` | T1 | Cohen 2e §9.3 pp. 410–414 | — | `pwr::pwr.f2.test` | POWER-IN-UNIT | B |
| P-25 | `power_roc_test` | T1 | Hanley & McNeil (1982) *Radiology* 143: 29–36 | — | `pROC::power.roc.test` | POWER-IN-UNIT | B |
| P-26 | `ss_two_proportions` | T1 | Fleiss, Levin & Paik 3e §4.3 pp. 64–73; Casagrande, Pike & Smith (1978) | — | `epiR::epi.sscohortc`, `pwr::pwr.2p.test` | N-NONNEG | B |
| P-27 | `ss_equivalence` (proportions, TOST) | T1 | Schuirmann (1987) *J. Pharmacokin. Biopharm.* 15: 657–680 | — | `epiR::epi.ssequb`, `TOSTER::powerTOSTtwo.prop` | N-NONNEG | B |
| P-28 | `ss_noninferiority` (proportions) | T1 | Blackwelder (1982) *Control. Clin. Trials* 3: 345–353 | — | `epiR::epi.ssninfb` | N-NONNEG | B |
| P-29–33 | `spending_hsd`, `spending_obf`, `spending_pocock`, `spending_power`, `spending_exponential` | T1 | Lan & DeMets (1983) *Biometrika* 70: 659–663; Hwang, Shih & DeCani (1990) *Stat. Med.* 9: 1439–1445; Jennison & Turnbull, *Group Sequential Methods with Applications to Clinical Trials* §7 pp. 145–171 | — | `gsDesign::sfHSD`, `sfOBrienFleming`, `sfPocock`, `sfPower`, `sfExponential` | SPEND-IN-UNIT, SPEND-MONOTONE-IN-T, ENDPOINTS-EQUAL-ALPHA | B |

---

### 4.11 `Categorical` module (4 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| C-1 | `chisq_test` | T2 | Rosner 8e §10.3 ex. 10.4 pp. 386–388 (Pearson χ²); Rosner 8e §10.5 (Yates) | SymPy: closed form for 2×2 | `stats::chisq.test`, `stats::chisq.test(correct=TRUE)` | P-IN-UNIT, CHI2-NONNEG, GROUP-SWAP-INVARIANT | B |
| C-2 | `fisher_exact_test` | T2 | Rosner 8e §10.4 ex. 10.7 pp. 391–394 | SymPy: hypergeometric closed form | `stats::fisher.test` | P-IN-UNIT, EXACT-MATCHES-MIDP | F (±0.01) |
| C-3 | `mcnemar_test` | T2 | Rosner 8e §10.6 ex. 10.10 pp. 404–406 | SymPy: closed form for paired binary | `stats::mcnemar.test` | P-IN-UNIT, CHI2-NONNEG | B |
| C-4 | `cochran_q_test` | T2 | Cochran (1950) *Biometrika* 37: 256–266; Conover 3e §4.6 pp. 250–256 | — | `RVAideMemoire::cochran.qtest`, `DescTools::CochranQTest` | P-IN-UNIT, Q-NONNEG | B |

---

### 4.12 `Correlation` module (7 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| COR-1 | `pearson_correlation` | T2 | Rosner 8e §11.7 ex. 11.20 pp. 491–494 | NIST StRD `Pontius`, `NoInt1`, `NoInt2`, `Filip` (regression with correlations) | `stats::cor(x, y, method="pearson")` | R-IN-RANGE-MINUS1-PLUS1, SCALE-INVARIANT, SYMMETRIC | A |
| COR-2 | `spearman_correlation` | T2 | Conover 3e §5.4 pp. 314–326; Rosner 8e §11.7 pp. 494–495 | — | `stats::cor(x, y, method="spearman")` | RHO-IN-RANGE, MONOTONE-INVARIANT | A |
| COR-3 | `kendall_tau` | T2 | Kendall, *Rank Correlation Methods* 5e §1; Conover 3e §5.5 pp. 326–333 | — | `stats::cor(x, y, method="kendall")` | TAU-IN-RANGE, MONOTONE-INVARIANT | A |
| COR-4 | `correlation_ci` | T2 | Fisher (1921) *Metron* 1: 3–32 (z-transform); Rosner 8e §11.7 pp. 491–494 | SymPy: Fisher z CI closed form | `stats::cor.test(...)$conf.int` | CI-CONTAINS-EST, CI-IN-RANGE | B |
| COR-5 | `pearson_test` | T2 | Rosner 8e §11.7 pp. 491–494 | — | `stats::cor.test(x, y, method="pearson")` | P-IN-UNIT, T-FINITE | B |
| COR-6 | `spearman_test` | T2 | Conover 3e §5.4 pp. 314–326 | — | `stats::cor.test(x, y, method="spearman")` | P-IN-UNIT | B |
| COR-7 | `kendall_test` | T2 | Conover 3e §5.5 pp. 326–333 | — | `stats::cor.test(x, y, method="kendall")` | P-IN-UNIT | B |

---

### 4.13 `EffectSizes` module (76 functions — grouped)

Effect-size functions are too numerous to list individually with full reference text; instead they are grouped by family. Within each family, the primary textbook applies to every function in the group; the property invariants apply uniformly.

| Group | Functions (count) | Tier | Primary textbook | R reference | Group properties | Tol |
|---|---|---|---|---|---|---|
| **Cohen's d family** | `cohens_d_independent`, `cohens_d_paired`, `cohens_d_unequal_variance`, `cohens_d_ci` (4) | T2 | Cohen 2e §2.2 ex. 2.1 pp. 24–27; Hedges (1981) *J. Educ. Stat.* 6: 107–128 | `effectsize::cohens_d`, `compute.es::tes` | D-FINITE, GROUP-SWAP-SIGN, BIAS-CORRECTION-MONOTONE | B |
| **Correlation effects** | `correlation_effect_size`, `r_squared`, `point_biserial_correlation`, `rank_biserial_correlation`, `tetrachoric_correlation` (5) | T2 | Cohen 2e §3.2 pp. 79–86 | `effectsize::correlation`, `polycor::polyserial` / `polychor` | R-IN-RANGE | B |
| **ANOVA effects (eta², omega², epsilon²)** | `eta_squared`, `omega_squared`, `epsilon_squared`, `partial_eta_squared`, `partial_omega_squared` (5) | T2 | Cohen 2e §8.2 pp. 280–284; Olejnik & Algina (2003) *Psych. Methods* 8: 434–447 | `effectsize::eta_squared`, `effectsize::omega_squared` | EFFECT-IN-UNIT, BIAS-DIRECTION | B |
| **Cohen's f / f²** | `cohens_f`, `cohens_f_squared`, `f_from_eta2`, `f_from_p_numerator_denominator` (4) | T2 | Cohen 2e §8.2 pp. 281–284 | `effectsize::cohens_f`, `pwr::pwr.anova.test` | F-NONNEG, MONOTONE-IN-ETA2 | B |
| **Categorical (φ, V, T, w, h)** | `phi_coefficient`, `cramers_v`, `tschuprow_t`, `cohens_w`, `cohens_h`, `cramers_v_ci` (6) | T2 | Cohen 2e §6.1, §7.1 pp. 179–217 | `effectsize::phi`, `effectsize::cramers_v`, `pwr::ES.h` | EFFECT-NONNEG, BOUNDED | B |
| **Conversions (lattice)** | `d_to_r`, `r_to_d`, `t_to_d`, `f_to_d`, `chisq_to_cramers_v`, `eta2_to_f`, `odds_ratio_to_d`, etc. (~20) | T2 | Borenstein et al. §7 pp. 45–49; Rosenthal & DiMatteo (2001) | `effectsize::*` conversion family | ROUNDTRIP-CONSISTENCY | A |
| **Interpretation (lookup)** | `interpret_d`, `interpret_r`, `interpret_f`, `interpret_f2`, `interpret_eta2`, `interpret_cramers_v`, `interpret_cohens_h`, `interpret_cohens_w` (8) | T3 | Cohen 2e small/medium/large benchmarks throughout | `effectsize::interpret_d`, etc. | LOOKUP-EXACT | E |
| **Cliff's δ, Vargha-Delaney A** | (2) | T2 | Cliff (1993) *Psych. Bull.* 114: 494–509; Vargha & Delaney (2000) *J. Educ. Behav. Stat.* 25: 101–132 | `effsize::cliff.delta`, `rcompanion::vda` | DELTA-IN-RANGE, A-IN-UNIT | B |
| **Clinical (NNT, NNH, ARR, ARI)** | (6) | T1 | Altman *Practical Stats* §15.4 pp. 425–428; Cook & Sackett (1995) *BMJ* 310: 452–454 | `epiR::epi.2by2$massoc.detail$NNT.strata` | NNT-FINITE-OR-INF, NNH-FINITE-OR-INF | A |

---

### 4.14 `Validation` module — Assumption checking (9 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| V-1 | `check_assumptions` (dispatcher) | T2 | Tabachnick & Fidell, *Using Multivariate Statistics* 7e §4 pp. 60–115 | — | (composite) | DETERMINISTIC-DISPATCH | — |
| V-2 | `levene_test` | T2 | Levene (1960) "Robust tests for equality of variances" in Olkin (ed.); Conover 3e §5.7 pp. 343–350 | — | `car::leveneTest` | P-IN-UNIT, F-NONNEG | B |
| V-3 | `brown_forsythe_test` | T2 | Brown & Forsythe (1974) *JASA* 69: 364–367 | — | `car::leveneTest(center="median")`, `lawstat::levene.test(location="median")` | P-IN-UNIT, F-NONNEG | B |
| V-4 | `bartlett_test` | T2 | Bartlett (1937) *Proc. R. Soc. London A* 160: 268–282; Snedecor & Cochran 8e §15.10 pp. 252–253 | — | `stats::bartlett.test` | P-IN-UNIT, K2-NONNEG | B |
| V-5 | `f_variance_test` | T2 | Snedecor & Cochran 8e §10.6 pp. 192–194 | SymPy: F-distribution closed form | `stats::var.test` | P-IN-UNIT | B |
| V-6 | `independence_check` | T3 | — (heuristic) | — | (residuals plot, Durbin-Watson) | — | F |
| V-7 | `sphericity_test` (Mauchly) | T2 | Mauchly (1940) *Ann. Math. Stat.* 11: 204–209 | — | `car::Anova(..., type="III")$SSP` | P-IN-UNIT, W-IN-UNIT | B |
| V-8 | `linearity_check` | T3 | — (residuals plot) | — | manual | — | F |
| V-9 | `validate_data`, `detect_missing`, `detect_outliers`, `detect_duplicates` | T3 | Little & Rubin 3e §1; Tukey, *Exploratory Data Analysis* §2 (outlier identification) | — | `naniar::*`, `dplyr::distinct` | NA-PROPAGATE, COUNT-NONNEG | F |

---

### 4.15 `DataManagement` module — MICE imputation (4 functions)

| # | Function | Tier | Primary textbook | NIST/CAS | R reference | Properties | Tol |
|---|---|---|---|---|---|---|---|
| MI-1 | `mice` | T1 | van Buuren, *Flexible Imputation of Missing Data* 2e §4 pp. 71–124 | — | `mice::mice` | IMPUTED-FINITE, M-CONSISTENT, RNG-DETERMINISTIC | F |
| MI-2 | `mice_method_selection` | T2 | van Buuren 2e §3.2 pp. 49–60 | — | `mice::mice` defaults | METHOD-VALID-PER-TYPE | F |
| MI-3 | `imputation_diagnostics` | T2 | van Buuren 2e §6 pp. 167–190 | — | `mice::stripplot`, `mice::densityplot` | DIAGNOSTIC-COMPLETE | F |
| MI-4 | `mice_convergence` (R̂) | T2 | Gelman & Rubin (1992) *Stat. Sci.* 7: 457–472; van Buuren 2e §4.5 pp. 110–115 | — | `mice::plot.mids`, `coda::gelman.diag` | RHAT-NONNEG, RHAT-CONVERGENCE-CRITERION | F |

---

### 4.16 `DataManagement` module — Ingestion + Transformation + Reporting (T3, no formal gold standard)

These functions are wrappers around vetted external libraries (`CSV.jl`, `XLSX.jl`, `ReadStatTables.jl`) plus simple monotone transforms. Validation is by:

- **Round-trip correctness**: ingest → re-export → byte-identical (where format permits)
- **Reference dataset**: NHANES public-use file ingested via R `haven::read_sas` and Julia `ReadStatTables.jl` should produce identical Tables.jl-shaped output
- **HIPAA Safe Harbor**: `strip_hipaa_identifiers` is validated against the 18 identifier categories in 45 CFR §164.514(b)(2)(i)(A–R)

| Function | Validation strategy |
|---|---|
| `ingest_csv`, `ingest_xlsx`, `ingest_sas`, `ingest_stata`, `ingest_spss` | Round-trip + cross-language reference match against `haven` (R) |
| `strip_hipaa_identifiers` | Conformance test against all 18 Safe Harbor categories (45 CFR §164.514) |
| `log_transform`, `log1p_transform`, `sqrt_transform`, `square_transform`, `reciprocal_transform`, `zscore_transform`, `minmax_transform`, `rank_transform` | Closed-form invertibility tests + R `base::log/log1p/sqrt/scale` reference |
| `boxcox_transform` | Box & Cox (1964) *JRSS-B* 26: 211–252; reference: `MASS::boxcox` |
| `yeojohnson_transform` | Yeo & Johnson (2000) *Biometrika* 87: 954–959; reference: `bestNormalize::yeojohnson` |
| `format_apa`, `format_apa_table`, `format_p_value`, `apa_string`, `apa_table` | Conformance to APA 7e §5.4 (statistics formatting); reference: `apaTables::apa.cor.table` |
| `export_reproducible_code` | Round-trip: emitted Julia script must recreate the same `BioStatResult` |

---

## 5. Disagreement Resolution Catalog

Cases where two reference implementations or two textbooks disagree. Each case has a documented decision and a one-line rationale. The decisions become CI-enforced expectations.

| # | Disagreement | R behavior | scipy/Other behavior | Textbook authority | **Decision for `Biostatistics.jl`** | Rationale |
|---|---|---|---|---|---|---|
| DR-1 | Welch-Satterthwaite df rounding | Returns non-integer df (e.g., 12.34) | `scipy.stats.ttest_ind(equal_var=False)` returns non-integer df | Welch (1947) original — non-integer | **Non-integer df, no rounding** | Aligns with primary source; rounding loses precision for marginal p-values |
| DR-2 | Wilcoxon signed-rank ties | `wilcox.test(exact=FALSE)` uses asymptotic with continuity correction; `exact=TRUE` errors with ties | `scipy.stats.wilcoxon` defaults to no continuity correction since 1.9 | Conover 3e §5.7 supports asymptotic with mid-rank | **Asymptotic with continuity correction by default; `exact=true` rejects ties with typed error** | Matches R default (most common workflow); explicit error prevents silent inaccuracy |
| DR-3 | Mann-Whitney U exact for small n with ties | R `wilcox.test(exact=TRUE)` warns and falls back to asymptotic | scipy errors | Hollander, Wolfe & Chicken §4.1 recommends asymptotic with normal approx + tie correction | **Same as DR-2: warn + asymptotic** | R's permissive behavior is more useful in practice |
| DR-4 | Fisher exact 2×2 vs r×c | `fisher.test(x)` accepts r×c via network algorithm | `scipy.stats.fisher_exact` is 2×2 only | Agresti, *Categorical Data Analysis* 3e §3.5 distinguishes them | **Provide both: `fisher_exact_test` for 2×2; future `fisher_exact_rxc` for general** | r×c is rare in clinical workflows; document the limitation |
| DR-5 | Chi-square continuity correction default | `chisq.test(correct=TRUE)` is default | `scipy.stats.chi2_contingency(correction=True)` is default | Rosner 8e §10.5 recommends Yates only for 2×2; controversial | **Default `correct=true` for 2×2, `correct=false` for r×c; user override always available** | Aligns with R + Rosner; documents controversy in docstring |
| DR-6 | McNemar exact vs asymptotic | `mcnemar.test(correct=TRUE)` is default; `exact2x2::exact2x2(...)` for exact | scipy provides both via `statsmodels.stats.mcnemar` | Fleiss, Levin & Paik 3e §13.3 recommends exact when `b+c < 25` | **Default asymptotic with continuity correction; auto-switch to exact when `b+c < 25` with notice** | Matches Fleiss recommendation; transparent switch |
| DR-7 | KM CI: log vs log-log vs plain | R `survfit` defaults to `conf.type="log"` (log-log since 3.5) | `lifelines.KaplanMeierFitter` uses log-log | Collett 3e §2.1.4 recommends log-log | **Default `conf.type="log-log"`; user override available** | Log-log keeps CI in [0,1]; standard in modern survival analysis |
| DR-8 | Kaplan-Meier handling of last censored observation | R `survfit` extends curve to last censored; some implementations stop at last event | `lifelines` stops at last event by default | Collett 3e §2.1 ambiguous; standard practice extends | **Extend to last censored time** | Matches R + clinical reporting convention |
| DR-9 | Log-rank tie handling | `survdiff` uses Mantel-Haenszel (Breslow-style) | `lifelines.statistics.logrank_test` uses Mantel-Cox | Both are Mantel (1966)-derived; Mantel-Haenszel = Breslow approx for ties | **Mantel-Haenszel (matches R)** | Matches existing R cross-validation in `VALIDATION_MATRIX.md` |
| DR-10 | Bootstrap CI: percentile vs BCa | Most R packages default to percentile | Many Python packages default to percentile | DiCiccio & Efron (1996) *Stat. Sci.* 11: 189–228 strongly prefer BCa | **Provide both; default percentile (consistency); document BCa availability** | Percentile is widely understood; BCa available as opt-in |
| DR-11 | Cohen's d pooled-SD denominator | `effectsize::cohens_d` uses `n₁+n₂−2` | `compute.es::tes` uses `n₁+n₂` | Cohen 2e §2.2 pp. 27 specifies `n₁+n₂−2` (sample SD) | **Use `n₁+n₂−2` (matches `effectsize` and Cohen)** | Sample-based denominator; standard in most clinical literature |
| DR-12 | Hedges' g correction factor | `effectsize::cohens_d(hedges_correction=TRUE)` uses Hedges (1981) Eq. 6 | `compute.es::tes` uses approximation `J = 1 − 3/(4·df − 1)` | Hedges (1981) gives both exact and approximation | **Use exact Γ-function form; document approximation availability** | Negligible cost difference; exact is gold standard |
| DR-13 | Egger's test weights | `metafor::regtest(model="lm")` regresses standardized effect on precision | `metafor::regtest(model="rma")` weights by inverse-variance | Egger et al. (1997) original is unweighted on standardized effects | **Default `model="lm"` (matches Egger 1997 original)** | Original-source fidelity |
| DR-14 | Box-Cox λ search for non-positive y | `MASS::boxcox` requires y > 0 | `scipy.stats.boxcox` requires y > 0; `bestNormalize::boxCox` adds shift | Box & Cox (1964) original requires y > 0 | **Strict y > 0; suggest `yeojohnson_transform` in error message for non-positive** | Original-source fidelity; clear user guidance |

---

## 6. Property Invariant Catalog (referenced from §4 tables)

Every property invariant referenced in §4 is defined here. Each becomes a property test under `test/properties/` (Tier 3 of the master plan §3).

### 6.1 Universal numerical
- **P-IN-UNIT**: every probability/p-value ∈ [0, 1]
- **NO-PANIC**: function never throws an unhandled error or segfault on valid input
- **COUNT-NONNEG**: every count returned is ≥ 0
- **DETERMINISTIC-OUTPUT**, **DETERMINISTIC-DISPATCH**: same input → same output
- **EMPTY-N0**: well-defined behavior for n=0 (typically: typed error)
- **NA-PROPAGATE**: missing inputs propagate or are explicitly rejected

### 6.2 Test statistics and CIs
- **CI-CONTAINS-EST**: 95% CI contains the point estimate
- **CI-WIDTH-FALLS-WITH-N**: CI width is non-increasing in n
- **CI-IN-UNIT**: CI bounds for proportions/probabilities ⊆ [0, 1]
- **CI-IN-RANGE**: CI bounds for r/ρ/τ ⊆ [-1, 1]
- **GROUP-SWAP-SYMMETRY**: swapping two groups in a symmetric two-sample test inverts t but preserves |t| and p
- **GROUP-SWAP-INVARIANT**: chi-square / log-rank invariant under group label swap
- **GROUP-SWAP-SIGN**: directional effect (MD, d) flips sign under swap
- **REFERENCE-INVARIANCE**: Dunnett-type tests invariant under non-reference group reordering
- **STRATA-WEIGHT-CONSISTENT**: stratified test/measure agrees with unstratified when strata = single

### 6.3 Distribution-specific
- **DESC-MONOTONE**: median(x), quantile(x, 0.5) agree; mean ≤ max; min ≤ mean
- **F-NONNEG**, **CHI2-NONNEG**, **Q-NONNEG**, **W-NONNEG**, **K2-NONNEG**, **A2-NONNEG**, **H-NONNEG**: test-statistic-specific positivity
- **D-IN-UNIT**, **W-IN-UNIT**: KS / Shapiro-Wilk W ∈ [0, 1]
- **DF-NONNEG**: degrees of freedom > 0
- **T-FINITE**: t-statistic is finite
- **MONOTONE-IN-N**: power increases monotone in n
- **MONOTONE-IN-EFFECT**: power increases monotone in |effect|
- **MONOTONE-IN-POWER**: required n increases monotone in target power

### 6.4 Effect sizes
- **R-IN-RANGE-MINUS1-PLUS1**, **RHO-IN-RANGE**, **TAU-IN-RANGE**: r, ρ, τ ∈ [-1, 1]
- **D-FINITE**, **MD-FINITE**: effect estimate finite
- **EFFECT-IN-UNIT**: η², ω², ε² ∈ [0, 1]
- **F-NONNEG**: Cohen's f ≥ 0
- **MONOTONE-INVARIANT**: rank correlations invariant under monotone transforms of either variable
- **SCALE-INVARIANT**, **SYMMETRIC**: Pearson r invariant under linear transform of either variable; symmetric in arguments
- **ROUNDTRIP-CONSISTENCY**: `r_to_d ∘ d_to_r ≈ identity` within tolerance

### 6.5 Epidemiology
- **OR-NONNEG**, **RR-NONNEG**, **IR-NONNEG**, **AR-IN-UNIT**: positivity / unit-bounding
- **OR-INVERSE-SYMMETRY**, **RR-INVERSE-SYMMETRY**: swapping rows/columns inverts the ratio
- **RD-IN-RANGE**: RD ∈ [-1, 1]
- **NNT-FINITE-OR-INF**, **NNH-FINITE-OR-INF**: well-defined or +∞ as ARR/ARI → 0
- **EXTENSIVE-IN-PT**: incidence rate scales with person-time
- **WEIGHTS-SUM-1**: standardization weights sum to 1
- **EFFECT-MEASURES-CONSISTENT**: log-OR ≈ log-RR + log((1−p₂)/(1−p₁)); related identities
- **METHOD-AGREEMENT-LARGE-N**: Wald, Newcombe, Wilson CIs converge as n → ∞

### 6.6 Diagnostic accuracy
- **SENS-IN-UNIT**, **SPEC-IN-UNIT**, **PPV-IN-UNIT**, **NPV-IN-UNIT**: ⊆ [0, 1]
- **COMPLEMENT-FNR**, **COMPLEMENT-FPR**: sens + FNR = 1; spec + FPR = 1
- **BAYES-PREVALENCE-EFFECT**: PPV/NPV obey Bayes' theorem under varying prevalence
- **J-IN-RANGE-MINUS1-PLUS1**: Youden's J ∈ [-1, 1]
- **LRPLUS-NONNEG**, **LRMINUS-NONNEG**, **DOR-NONNEG**: positivity
- **DOR-COMPOSITE**: DOR = LR+/LR− = (TP·TN)/(FP·FN)
- **AUC-IN-UNIT**: AUC ∈ [0, 1]
- **AUC-MONOTONE-INVARIANCE**: AUC invariant under any strictly monotone score transform
- **ROC-MONOTONE**: TPR is non-decreasing in FPR along the curve
- **ENDPOINTS-00-11**: ROC curve passes through (0,0) and (1,1)
- **THRESHOLD-IN-DOMAIN**: chosen threshold is in the empirical score range

### 6.7 Survival
- **KM-S0-EQUALS-1**: S(0) = 1
- **KM-MONOTONE-NONINCREASING**: S(t) non-increasing
- **KM-IN-UNIT**: S(t) ∈ [0, 1]
- **CI-IN-UNIT**: pointwise survival CI ⊆ [0, 1]
- **MEDIAN-FINITE-OR-INF**: median = +∞ when S(t) > 0.5 for all observed t
- **LOCF-VALID**: survival probability at queried time uses last-observation-carried-forward
- **EQUIV-FH-1-0**: Peto-Peto equals Fleming-Harrington G(1,0)

### 6.8 Meta-analysis
- **TAU2-NONNEG**: τ² ≥ 0
- **I2-IN-UNIT**: I² ∈ [0, 1]
- **H2-GE-1**: H² ≥ 1
- **POOLED-IN-RANGE**: pooled estimate within range of input studies
- **WEIGHT-SUM-1**: pooling weights sum to 1
- **FE-LIMIT-AS-TAU2-0**: random-effects → fixed-effects as τ² → 0
- **CUMUL-MONOTONE-K**: cumulative meta-analysis is sequential-add only
- **PI-CONTAINS-POOLED**: prediction interval contains pooled estimate
- **K-IMPUTED-NONNEG**: trim-and-fill imputation count ≥ 0
- **FSN-NONNEG**: failsafe N ≥ 0

### 6.9 Power and sample size
- **POWER-IN-UNIT**: power ∈ [0, 1]
- **N-NONNEG**: required n ≥ 0
- **N-RATIO-EFFECT**: monotone behavior under unequal-allocation ratio
- **SPEND-IN-UNIT**, **SPEND-MONOTONE-IN-T**, **ENDPOINTS-EQUAL-ALPHA**: spending function ∈ [0, α], non-decreasing in t, equals α at t=1

### 6.10 Agreement
- **KAPPA-IN-RANGE**: κ ∈ [-1, 1]
- **AGREEMENT-MONOTONE**: κ increases with observed agreement
- **IDENTICAL-RATERS-K1**: identical raters → κ = 1
- **WEIGHT-NORMALIZE**: weighted κ uses normalized disagreement weights
- **RATER-COUNT-INVARIANCE**: Fleiss / Kendall W invariant under permutation of raters
- **ICC-IN-RANGE**: ICC ∈ [0, 1] (2-way) or [-1, 1] (1-way), depending on form
- **FORM-CONSISTENCY**: ICC(2,1) ≤ ICC(2,k); related orderings
- **RANDOM-VS-FIXED**: ICC(1,1) ≠ ICC(2,1) unless balanced design
- **W-IN-UNIT**: Kendall W ∈ [0, 1]
- **ALPHA-IN-RANGE**: Krippendorff α ∈ [-1, 1]
- **ORDER-PRESERVING**: ordinal α invariant under monotone level relabeling
- **LOA-WIDTH-NONNEG**: Bland-Altman limits-of-agreement width ≥ 0
- **MEAN-DIFF-CENTERED**: mean of paired differences is the LoA center

### 6.11 Multiple comparisons
- **FAMILYWISE-ALPHA**: Tukey/Scheffé/Dunnett control FWER ≤ α
- **PAIRWISE-CONSISTENCY**: pairwise comparisons consistent (transitive ordering when possible)
- **CONTRAST-ARBITRARY**: Scheffé valid for any linear contrast
- **UNEQUAL-VAR-ROBUST**: Games-Howell controls FWER under variance heterogeneity
- **MONOTONE-IN-M**: Bonferroni-adjusted p increases with m
- **CONSERVATIVE**: Bonferroni-adjusted p ≥ each individual p
- **BONFERRONI-DOMINATES**: Holm-adjusted p ≤ Bonferroni-adjusted p (uniformly)
- **MONOTONE-STEP**: Holm and BH adjustments preserve original p-value ordering
- **FDR-BOUND**: BH expected FDR ≤ q

### 6.12 Calibration
- **BS-IN-UNIT**: Brier score ∈ [0, 1]
- **PERFECT-PREDICTION-0**: BS = 0 when p̂ = y for all observations
- **C-IN-RANGE-HALF-ONE**: c-statistic ∈ [0.5, 1] for any non-degenerate model
- **CHANCE-MODEL-HALF**: c-statistic = 0.5 for chance model
- **NRI-IN-RANGE**: NRI ∈ [-2, 2]
- **ZERO-IF-IDENTICAL**: NRI = 0 when models are identical
- **IDI-IN-REAL**: IDI is a real number (sign indicates direction)
- **SLOPE-1-IF-PERFECT**: calibration slope = 1 for perfectly calibrated
- **INTERCEPT-0-IF-PERFECT**: calibration intercept = 0 for perfectly calibrated

### 6.13 MICE
- **IMPUTED-FINITE**: imputed values are finite
- **M-CONSISTENT**: m chains produce m completed datasets
- **RNG-DETERMINISTIC**: same seed → same imputations
- **METHOD-VALID-PER-TYPE**: PMM for continuous, logreg for binary, polyreg for nominal, etc.
- **DIAGNOSTIC-COMPLETE**: diagnostics returned for every imputed variable
- **RHAT-NONNEG**: R̂ ≥ 0
- **RHAT-CONVERGENCE-CRITERION**: R̂ < 1.1 implies practical convergence

---

## 7. Clinical Reference Layer (USA-sourced)

For the 6 functions where a clinical algorithm is the gold standard alongside the statistical formula. All references are USA-sourced per repo policy.

| Function | Clinical algorithm | USA-sourced reference |
|---|---|---|
| `number_needed_to_treat` | NNT interpretation in clinical guidelines | AHA Scientific Statement: Mendis et al. (2007) "Estimation of Cardiovascular Disease Risk" *Circulation* 116: 407 |
| `age_standardized_rate_direct` | Direct age standardization for public-health surveillance | CDC, *Principles of Epidemiology in Public Health Practice*, 3rd ed. (2012) §3, "Measures of Risk" |
| `attack_rate` | Acute outbreak attack rate | CDC, *Principles of Epidemiology in Public Health Practice*, 3rd ed. (2012) §11, "Investigating an Outbreak" |
| `secondary_attack_rate` | Household and contact secondary attack rate | CDC, *Principles of Epidemiology* §11 |
| `sensitivity` / `specificity` | Diagnostic test performance characteristics | USPSTF Procedure Manual (2024 update) Appendix VI: "Glossary of EPC Methodology Terms" |
| `roc_auc` | Discrimination evaluation in clinical prediction | AHA/ACC: Goff et al. (2014) "2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk" *Circulation* 129 (Suppl 2): S49–S73 (model evaluation methodology) |

When implementing functions whose clinical use is regulated (e.g., neonatal hyperbilirubinemia phototherapy threshold lookup, NRP decision algorithms, AAP gestational-age vital-sign norms), additional clinical references will be added under this section. None of the 187 currently catalogued functions implement those specific clinical algorithms — they are statistical primitives that *support* clinical decision tools rather than encoding the decisions themselves.

---

## 8. Reference Version Drift Protocol

When R, scipy, or a textbook publishes an update that affects a cited reference, the response is one of three actions, decided by the function's tier.

### 8.1 Triggers

- R `survival` 4.x → 5.x changes default tie handling
- scipy 1.x → 2.x changes default for ties or precision
- A textbook publishes a new edition (Rosner 9e, Cohen 3e, etc.)
- A reference implementation publishes a numerical correction (errata)
- NIST StRD adds, deprecates, or revises a dataset
- Julia `Distributions.jl` / `HypothesisTests.jl` / `GLM.jl` major bump

### 8.2 Response procedure

1. **Detect**: weekly CI runs `scripts/audit/regenerate_all_fixtures.sh` against latest pinned-by-major-version R and scipy. Differences trigger a `reference-drift` GitHub issue.
2. **Triage**: classify as one of:
   - **Cosmetic** (reformatting, no numerical change) → update fixture, no version change to the package
   - **Numerical, within tolerance** → update fixture with documented diff in `AUDIT/02_dependency_validation.md`, patch version bump
   - **Numerical, outside tolerance, accepted as upgrade** → adopt new behavior, update primary reference citation in this document, minor version bump, document in CHANGELOG
   - **Numerical, outside tolerance, rejected** → pin reference to previous version, document why, file roadmap issue for future evaluation
3. **Document**: every drift event gets an entry in `AUDIT/reference_drift_log.jsonl` with: date, function(s) affected, reference + old/new version, tolerance impact, decision, decision rationale, decision SHA in git.
4. **Update**: the corresponding row in this document's §4 is updated with the new version pin (or the old pin if held back).

### 8.3 Edition policy

- Textbook editions are pinned to the edition cited in §4. Adopting a new edition is a deliberate decision, not automatic.
- When a new edition supersedes a worked example used as a golden test, the old test is renamed `<example>_<edition>` and kept as a regression anchor; the new test cites the new edition. Both must pass.

### 8.4 Notification

A `reference-drift` issue triggers notification to:
- Repo CODEOWNERS for `docs/audit/`
- Test suite ownership (currently: Timothy Hartzog as sole maintainer)
- Validation dossier reviewer (when established)

---

## 9. Phase 9 Independent Re-derivation Plan

Per master plan §11, ≥20% of T1 calculations get independent re-derivation in a CAS or alternate language. For `Biostatistics.jl`, T1 ≈ 38 functions, so ≥8 must be re-derived. The selected sample (rotated annually):

| # | Function | Re-derivation strategy |
|---|---|---|
| 1 | `welch_t_test` | SymPy: derive Welch-Satterthwaite df symbolically; verify against published Rosner 8e ex. 8.13 |
| 2 | `survfit_km` | Hand re-implementation in Python (scratch, no `lifelines`) following Kaplan-Meier (1958) original product-limit formula; compare to library on n=2,3,4,5 inputs |
| 3 | `logrank_test` | SymPy: closed-form for n=2 per group; Python re-implementation following Mantel (1966) for larger |
| 4 | `cohens_kappa` | SymPy: closed-form for 2×2 with given marginals |
| 5 | `roc_auc` | Hand re-implementation in Python following Wilcoxon-Mann-Whitney equivalence (Hanley & McNeil 1982) |
| 6 | `odds_ratio_ci` (Woolf) | SymPy: derive Woolf SE symbolically; reproduce Rothman, Greenland & Lash 3e §14 example |
| 7 | `power_t_test` | SymPy: noncentral t CDF for given (n, d, α); compare to Cohen 2e ex. 2.1 published table values |
| 8 | `rma_random_dl` | Hand re-implementation in Python following DerSimonian & Laird (1986) original; compare to library on Borenstein et al. §12 worked example |
| 9 | `egger_test` | Hand re-implementation in Python following Egger et al. (1997) original `lm` regression |
| 10 | `bland_altman` | Closed-form re-derivation of 95% LoA from sd(differences); reproduce Bland & Altman (1986) original example |

The re-derivation outputs live in `AUDIT/09_independent_rederivation/<function>/` per the master plan §11.2. Each subdirectory contains the re-derivation script, the input/output comparison, and a one-page conclusion.

Functions are rotated through this list annually so that, over 4 years, every T1 calculation has been independently re-derived at least once.

---

## 10. How This Document Is Used

### 10.1 By Claude Code during execution

When Claude Code is asked to write or audit a test for any function, the order of operations is:

1. Look up the function in §4 by name.
2. Cite the primary textbook reference verbatim in the test docstring (edition, page, example number, input values, expected output).
3. Use the assigned R reference call as the cross-validation fixture source.
4. Add property tests for every invariant code in the row's "Properties" column, drawing definitions from §6.
5. Apply the tolerance class from the row's "Tol" column, drawing definitions from §3.
6. If the function is in §7 (clinical reference layer), add the USA-sourced clinical citation alongside the statistical citation.
7. If the function appears in §5 (disagreement catalog), implement the documented decision, not the simple R-default behavior.

### 10.2 By human reviewers

Before approving a PR that changes a calculation:

1. Confirm the corresponding §4 row is unchanged or updated coherently.
2. Confirm the test cites the §4 references (textbook + R + properties).
3. Confirm tolerance matches the §3 class.
4. If §5 applies, confirm the documented decision is honored.
5. If the change touches a §8 (drift) trigger, confirm the drift protocol was followed.

### 10.3 By regulators / external auditors

The dossier sign-off block (master plan §12.2) cites this document as the per-function gold-standard methodology. A regulator can:

1. Pick any function in `Biostatistics.jl`.
2. Look it up in §4 to see the primary, secondary, and property witnesses.
3. Open the corresponding test file to see the citation reproduced verbatim.
4. Run the test locally (per master plan §6 reproducibility requirements) and confirm it passes.
5. Consult §5 to understand any documented disagreement and the rationale for the package's choice.
6. Consult §8 for the version-pinning posture.

---

## 11. Coverage Summary

Across the 187 catalogued functions:

| Tier | Count | % |
|---|---|---|
| T1 (clinical-decision-impacting) | 38 | 20.3% |
| T2 (foundational statistical) | 102 | 54.5% |
| T3 (convenience / formatting) | 47 | 25.1% |
| T4 (experimental / not-yet-implemented) | 0 | 0.0% |
| **Total** | **187** | **100%** |

All 38 T1 functions in §4 have primary textbook references (USA-sourced where clinical, methodologically canonical where statistical), at least one R cross-validation reference, and ≥1 property invariant. All 102 T2 functions have primary textbook references and ≥1 property invariant. T3 functions have validation strategies declared in §4.16 even when no formal textbook gold standard applies.

When `Biostatistics.jl` adds new functions (especially the high-priority Cox PH, parametric survival, mixed models, and complex-survey work flagged in `docs/R-vs-Biostatistics.jl-Gap-Analysis.md`), this document is updated *in the same PR* with a new §4 row before the implementation is merged.

---

## 12. Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-04-28 | Initial release. Covers 187 functions across 16 modules of `ruralpeds/biostatistics`. Disagreement catalog seeded with 14 known cases. Property invariant catalog seeded with ~80 named invariants. Phase 9 re-derivation plan covers 10 T1 functions (rotation #1). |

---

*End of Gold-Standard Reference Methodology document.*
