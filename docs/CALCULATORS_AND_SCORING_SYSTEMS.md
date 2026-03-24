# Pediatric Emergency CDS — Calculators & Scoring Systems

> **Maintenance note:** Update this file whenever a new calculator or scoring system is added to the project.  
> Add a row to the appropriate table and note the source file path.  
> Last updated: 2026-03-06

---

## Table of Contents

1. [Assessment & Triage Tools](#1-assessment--triage-tools)
2. [Acid-Base & Electrolytes](#2-acid-base--electrolytes)
3. [Fluid Management](#3-fluid-management)
4. [Renal Calculators](#4-renal-calculators)
5. [Hematology Calculators](#5-hematology-calculators)
6. [Cardiology Calculators](#6-cardiology-calculators)
7. [Echocardiography Calculators](#7-echocardiography-calculators)
8. [ECG Calculators](#8-ecg-calculators)
9. [Congenital Heart Disease Calculators](#9-congenital-heart-disease-calculators)
10. [Hemodynamic / Oxygen Delivery Calculators](#10-hemodynamic--oxygen-delivery-calculators)
11. [Respiratory Calculators](#11-respiratory-calculators)
12. [Respiratory Scoring Systems](#12-respiratory-scoring-systems)
13. [Dosing-Based Calculators](#13-dosing-based-calculators)
14. [Psychiatry (Screening Tools)](#14-psychiatry-screening-tools)

---

## 1. Assessment & Triage Tools

| Calculator / Score | Description | Source File |
|---|---|---|
| **Glasgow Coma Scale (GCS)** | Classic 3-domain score (Eye, Verbal, Motor). Infant-modified version also implemented. | `src/assessment.rs` |
| **Pediatric Assessment Triangle (PAT)** | Rapid appearance / work of breathing / circulation assessment to classify physiologic category | `src/assessment.rs` |
| **Burns TBSA (Lund-Browder)** | Age-adjusted total burn surface area estimation with paediatric head/leg correction | `src/assessment.rs` |

---

## 2. Acid-Base & Electrolytes

| Calculator / Score | Description | Source File |
|---|---|---|
| **Anion Gap** | Serum AG with albumin correction (Figge formula) | `src/protocols/acid_base.rs` |
| **Delta-Delta Ratio** | Identifies mixed metabolic disorders on top of elevated-AG metabolic acidosis | `src/protocols/acid_base.rs` |
| **Winter's Formula** | Expected pCO₂ compensation for metabolic acidosis | `src/protocols/acid_base.rs` |
| **ABG Interpretation** | Primary disorder classification, expected compensation, and clinical guidance | `src/protocols/acid_base.rs` |
| **Serum Osmolarity** | Calculated osmolarity with optional ethanol correction and osmol gap | `src/protocols/acid_base.rs` |
| **Urine Anion Gap** | For differentiating causes of non-anion-gap metabolic acidosis | `src/protocols/acid_base.rs` |
| **Urine Osmolar Gap** | Estimated vs. measured urine osmolality gap | `src/protocols/acid_base.rs` |
| **Corrected Sodium (Hyperglycemia)** | Sodium correction for elevated glucose | `src/protocols/acid_base.rs` |
| **Sodium Deficit** | Weight- and age-adjusted sodium replacement | `src/protocols/acid_base.rs` |
| **Free Water Deficit** | For hypernatraemia management | `src/protocols/acid_base.rs` |
| **Sodium Correction Rate** | Safe rate of correction, acute vs. chronic hyponatraemia | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Corrected Calcium** | Total calcium correction for hypoalbuminaemia | `src/protocols/acid_base.rs` |
| **Potassium Replacement** | Dose-per-serum-K protocol with ECG correlation | `src/protocols/acid_base.rs` |
| **Potassium Correction (Extended)** | pH-adjusted K replacement with infusion rate limits | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Magnesium Replacement** | Dosing by serum Mg level and weight | `src/protocols/acid_base.rs` |
| **Phosphorus Replacement** | IV phosphorus dosing by serum level and weight | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Calcium Replacement (IV)** | Dosing from ionized Ca, total Ca, albumin | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Fractional Excretion of Sodium (FENa)** | Pre-renal vs. intrinsic AKI discrimination | `src/protocols/acid_base.rs` |
| **Fractional Excretion of Urea (FEUrea)** | Pre-renal discrimination when patient on diuretics | `src/protocols/acid_base.rs` |
| **Fractional Excretion of Magnesium (FEMg)** | Renal vs. GI causes of hypomagnesaemia | `src/protocols/acid_base.rs` |
| **TmP/GFR (Tubular Maximum for Phosphate)** | Phosphate reabsorption threshold — screen for phosphate-wasting tubulopathies | `src/protocols/acid_base.rs` |
| **Strong Ion Difference (Stewart)** | SID approach to acid-base analysis | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Acid-Base Compensation Table** | Comprehensive expected compensations for all primary disorders | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Metabolic Alkalosis Compensation** | Expected pCO₂ compensation check | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Bartter vs. Gitelman Differentiation** | Urine Ca/Cr, serum Mg, clinical criteria to distinguish tubular disorders | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Schwartz eGFR** | Bedside Schwartz formula for GFR estimation from height and creatinine | `src/protocols/acid_base.rs` |

---

## 3. Fluid Management

| Calculator / Score | Description | Source File |
|---|---|---|
| **Maintenance Fluids (Holliday-Segar / 4-2-1 Rule)** | Standard weight-based maintenance fluid rate | `src/protocols/acid_base.rs` |
| **BSA-Based Maintenance Fluids** | Surface-area-based maintenance as alternative to Holliday-Segar | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Neonatal Maintenance (Postnatal-Day Adjusted)** | Day-of-life adjusted IWL and electrolyte needs for neonates | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Total Body Water Dynamics** | Age-specific TBW compartments (ICF / ECF fractions) | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Phased Dehydration Repair** | Isotonic / hypertonic / hypotonic deficit replacement protocol with phase calculation | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Oral Rehydration Therapy (ORT)** | Volume and schedule for oral rehydration by dehydration % | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Hypertonic Saline (3% NaCl) Dosing** | mEq and volume for symptomatic hyponatraemia | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Fluid Deficit** | mL deficit from weight + dehydration % | `src/protocols/renal_calc.rs` |
| **Insensible Water Loss Estimation** | Fever, ventilator, and radiant warmer adjustments | `src/protocols/fluid_electrolyte_acidbase.rs` |
| **Parkland Formula (Burns)** | 4 mL/kg/% TBSA formula with phase scheduling | `src/protocols/acid_base.rs`, `src/protocols/burns.rs` |

---

## 4. Renal Calculators

| Calculator / Score | Description | Source File |
|---|---|---|
| **eGFR (Comprehensive / Schwartz 2009)** | Updated Schwartz, bedside Schwartz, and CKiD equations | `src/protocols/renal_calc.rs` |
| **Creatinine Clearance (Measured)** | Timed urine collection CrCl with BSA correction | `src/protocols/renal_calc.rs` |
| **Fractional Excretion of Potassium (FEK)** | Renal K handling | `src/protocols/renal_calc.rs` |
| **Trans-Tubular Potassium Gradient (TTKG)** | Collecting duct K secretion assessment | `src/protocols/renal_calc.rs` |
| **Fractional Excretion of Phosphate (FEP)** | Phosphate-wasting nephropathy screen | `src/protocols/renal_calc.rs` |
| **Fractional Excretion of Bicarbonate (FEHCo₃)** | Proximal vs. distal RTA distinction | `src/protocols/renal_calc.rs` |
| **Urine Protein:Creatinine Ratio (UPCR)** | Age-adjusted proteinuria threshold and nephrotic/nephritic classification | `src/protocols/renal_calc.rs` |
| **Urine Albumin:Creatinine Ratio (UACR)** | Microalbuminuria screening | `src/protocols/renal_calc.rs` |
| **Free Water Clearance** | Electrolyte-free water excretion | `src/protocols/renal_calc.rs` |
| **Urine Output Assessment** | ml/kg/hr with oliguria / anuria thresholds by age | `src/protocols/renal_calc.rs` |
| **Dialysis Parameters (Kt/V)** | Urea reduction ratio and Kt/V for adequacy of dialysis | `src/protocols/renal_calc.rs` |
| **Kidney Size Estimation** | Age- and height-based normal kidney size | `src/protocols/renal_calc.rs` |
| **RTA Differentiation** | Type 1 / 2 / 4 RTA based on urine pH, serum K, urine AG, FEHCo₃ | `src/protocols/renal_calc.rs` |

---

## 5. Hematology Calculators

| Calculator / Score | Description | Source File |
|---|---|---|
| **RBC Indices (MCV, MCH, MCHC)** | Calculated from Hb, Hct, RBC count | `src/protocols/hematology_calc.rs` |
| **Reticulocyte Index & Corrected Reticulocyte Count** | Corrected retic count with maturation factor; production index | `src/protocols/hematology_calc.rs` |
| **Anemia Assessment** | Age-adjusted anaemia classification (WHO thresholds) | `src/protocols/hematology_calc.rs` |
| **Thalassaemia vs. Iron-Deficiency Discriminant Indices** | Mentzer index, England-Fraser index, RDW index, Green-King index | `src/protocols/hematology_calc.rs` |
| **Blood Volume Estimation** | Age-specific mL/kg blood volume | `src/protocols/hematology_calc.rs` |
| **Maximum Allowable Blood Loss (MABL)** | Surgical blood loss limit from starting Hct | `src/protocols/hematology_calc.rs` |
| **pRBC Transfusion Volume** | mL/kg to achieve target Hb | `src/protocols/hematology_calc.rs` |
| **Platelet Transfusion** | Dose and expected increment | `src/protocols/hematology_calc.rs` |
| **FFP Dose** | Standard dosing for coagulopathy reversal | `src/protocols/hematology_calc.rs` |
| **Iron Studies Interpretation** | Serum iron, TIBC, ferritin, transferrin saturation with interpretation | `src/protocols/hematology_calc.rs` |
| **Hemolysis Assessment** | Haptoglobin, LDH, indirect bilirubin, retic integrated interpretation | `src/protocols/hematology_calc.rs` |
| **Coagulation Assessment** | PT/INR, aPTT, fibrinogen, D-dimer age-adjusted interpretation | `src/protocols/hematology_calc.rs` |
| **CBC Reference Ranges** | Age-specific normal CBC values | `src/protocols/hematology_calc.rs` |

---

## 6. Cardiology Calculators

| Calculator / Score | Description | Source File |
|---|---|---|
| **Mean Arterial Pressure (MAP)** | MAP from SBP / DBP | `src/protocols/cardiology_calc.rs` |
| **Cardiac Output (Fick Method)** | CO from VO₂, Hb, saturations | `src/protocols/cardiology_calc.rs` |
| **Cardiac Index** | CO indexed to BSA | `src/protocols/cardiology_calc.rs` |
| **Stroke Volume & Stroke Volume Index** | SV and SVI with age-specific normals | `src/protocols/cardiology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |
| **SVR / SVRI** | Systemic vascular resistance and index | `src/protocols/cardiology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |
| **PVR / PVRI** | Pulmonary vascular resistance, index, and operability threshold | `src/protocols/cardiology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |
| **Oxygen Content (CaO₂)** | Hb × SaO₂ + dissolved O₂ | `src/protocols/cardiology_calc.rs` |
| **Oxygen Delivery (DO₂) & DO₂ Indexed** | Systemic O₂ delivery | `src/protocols/cardiology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |
| **O₂ Extraction Ratio** | VO₂ / DO₂ | `src/protocols/cardiology_calc.rs` |
| **Qp/Qs (Shunt Ratio)** | Saturations-based shunt calculation | `src/protocols/cardiology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |
| **Mixed Venous Saturation** | SVC / IVC weighted average | `src/protocols/cardiology_calc.rs` |
| **Step-Up Assessment** | Oxygen saturation step-up across chambers to localise L→R shunt | `src/protocols/pediatric_cardiology.rs` |
| **VO₂ (Calculated & Estimated)** | Measured Fick VO₂ and weight/BSA-based estimation | `src/protocols/pediatric_cardiology.rs` |
| **Defibrillation Energy** | 2–4 J/kg dosing | `src/protocols/cardiology_calc.rs` |
| **Resuscitation Medications** | PALS weight-based adrenaline, atropine, glucose | `src/protocols/cardiology_calc.rs` |
| **Estimated Blood Volume** | Age-specific mL/kg (neonate through adolescent) | `src/protocols/pediatric_cardiology.rs` |
| **ETT Size & Depth** | Age/weight formula with cuffed and uncuffed options | `src/protocols/pediatric_cardiology.rs` |
| **Heart Rate Reference Ranges** | Age-specific normal and abnormal HR bands | `src/protocols/cardiology_calc.rs` |
| **Blood Pressure Reference Ranges** | Age-specific normal BP (50th / 95th / 99th percentiles) | `src/protocols/cardiology_calc.rs` |

---

## 7. Echocardiography Calculators

| Calculator / Score | Description | Source File |
|---|---|---|
| **LV Ejection Fraction (Biplane)** | EF = (LVEDV – LVESV) / LVEDV | `src/protocols/cardiology_calc.rs` |
| **Fractional Shortening** | FS = (LVIDd – LVIDs) / LVIDd | `src/protocols/cardiology_calc.rs` |
| **Fractional Area Change (FAC)** | RV function metric | `src/protocols/pediatric_cardiology.rs` |
| **LV Mass** | Devereux formula with BSA-indexing | `src/protocols/cardiology_calc.rs` |
| **E/A Ratio** | Mitral inflow diastolic function, age-adjusted normals | `src/protocols/pediatric_cardiology.rs` |
| **E/E' Ratio** | Tissue Doppler–informed filling pressure, age-adjusted | `src/protocols/cardiology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |
| **Myocardial Performance Index (MPI / Tei Index)** | LV and RV global function; age-specific normals | `src/protocols/cardiology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |
| **Left Atrial Volume Index (LAVI)** | LA volume/BSA | `src/protocols/pediatric_cardiology.rs` |
| **TAPSE** | Tricuspid annular plane systolic excursion with age norms | `src/protocols/pediatric_cardiology.rs` |
| **S' Velocity (Tissue Doppler)** | RV systolic function | `src/protocols/pediatric_cardiology.rs` |
| **RVSP** | TR velocity mod-Bernoulli + RAP | `src/protocols/cardiology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |
| **RAP from IVC** | IVC diameter and collapsibility index | `src/protocols/pediatric_cardiology.rs` |
| **Modified Bernoulli** | Pressure gradient from peak Doppler velocity | `src/protocols/cardiology_calc.rs` |
| **Valve Area (Continuity Equation)** | AVA from LVOT diameter, VTI LVOT, VTI AV | `src/protocols/cardiology_calc.rs` |
| **Mitral Valve Area (Pressure Half-Time)** | MVA = 220 / PHT | `src/protocols/pediatric_cardiology.rs` |
| **Z-Score Calculator** | Echocardiographic measurement z-score from BSA | `src/protocols/pediatric_cardiology.rs` |
| **Predicted Aortic Root (Roman)** | BSA and age-adjusted normal aortic root | `src/protocols/pediatric_cardiology.rs` |
| **Cardiac Dimensions Reference** | Weight-based normal cardiac dimensions | `src/protocols/pediatric_cardiology.rs` |
| **Doppler Reference Values** | Normal Doppler velocities by site | `src/protocols/pediatric_cardiology.rs` |

---

## 8. ECG Calculators

| Calculator / Score | Description | Source File |
|---|---|---|
| **QTc (Bazett's Formula)** | QT corrected for RR; risk stratification (normal/borderline/prolonged) | `src/protocols/cardiology_calc.rs` |
| **ECG Reference by Age** | Normal intervals (PR, QRS, QT, QTc) and axis by age | `src/protocols/cardiology_calc.rs` |
| **Comprehensive ECG Reference** | QRS axis norms, T-wave norms, chamber enlargement criteria by age | `src/protocols/pediatric_cardiology.rs` |
| **ECG Heart Rate from R-R** | Rate from small/large squares or R-R interval | `src/protocols/pediatric_cardiology.rs` |
| **R/S Ratio Assessment** | V1 and V6 R/S ratio with age-adjusted interpretation | `src/protocols/pediatric_cardiology.rs` |
| **Ventricular Hypertrophy Assessment** | RVH / LVH / BVH criteria using voltage, T-wave, and axis | `src/protocols/pediatric_cardiology.rs` |

---

## 9. Congenital Heart Disease Calculators

| Calculator / Score | Description | Source File |
|---|---|---|
| **Nakata Index** | RPA + LPA cross-sectional area / BSA — pulmonary artery adequacy (pre-surgical) | `src/protocols/cardiology_calc.rs` |
| **McGoon Ratio** | (RPA + LPA) / DAO — PA adequacy for repair | `src/protocols/cardiology_calc.rs` |
| **Pp/Ps Ratio** | Pulmonary-to-systemic pressure ratio | `src/protocols/cardiology_calc.rs` |
| **Pulmonary Flow Index (PFI)** | Qp / BSA | `src/protocols/pediatric_cardiology.rs` |
| **Aortic Valve Index (AVI)** | AVA / BSA | `src/protocols/pediatric_cardiology.rs` |
| **RV/LV Pressure Ratio** | RV systolic / LV systolic for ventricular interaction | `src/protocols/pediatric_cardiology.rs` |
| **Cyanotic SaO₂** | Mixed saturation calculation for R→L shunts | `src/protocols/pediatric_cardiology.rs` |
| **Hyperoxia Test Interpretation** | PaO₂ response to 100% O₂ to distinguish cardiac vs. pulmonary cyanosis | `src/protocols/pediatric_cardiology.rs` |
| **Fontan Physiology Assessment** | Fontan pressure, LVEDP, SaO₂ interpretation | `src/protocols/pediatric_cardiology.rs` |
| **Catheterization Normal Values** | Reference pressures and saturations for normal cardiac cath | `src/protocols/cardiology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |

---

## 10. Hemodynamic / Oxygen Delivery Calculators

*(These overlap with Cardiology but focus on ICU/critical care)*

| Calculator / Score | Description | Source File |
|---|---|---|
| **P/F Ratio (PaO₂/FiO₂)** | ARDS severity threshold (≤200 = ARDS, ≤100 = severe) | `src/respiratory_cds/calculations.rs` |
| **S/F Ratio (SpO₂/FiO₂)** | Non-invasive P/F surrogate | `src/respiratory_cds/calculations.rs` |
| **Oxygenation Index (OI)** | MAP × FiO₂ × 100 / PaO₂ — PARDS and PPHN severity | `src/respiratory_cds/calculations.rs` |
| **Driving Pressure** | Plateau pressure − PEEP | `src/respiratory_cds/calculations.rs` |
| **Static Compliance** | Tidal volume / (Plateau – PEEP) | `src/respiratory_cds/calculations.rs` |
| **Minute Ventilation** | VT × RR | `src/respiratory_cds/calculations.rs` |
| **Tidal Volume (IBW-Based)** | 6–8 mL/kg ideal body weight | `src/respiratory_cds/calculations.rs` |
| **HFNC Flow Rate** | Weight-based starting flow (1–2 L/kg/min) | `src/respiratory_cds/calculations.rs` |

---

## 11. Respiratory Calculators

| Calculator / Score | Description | Source File |
|---|---|---|
| **ETT Size from Age** | Cole formula (cuffed and uncuffed) | `src/respiratory_cds/calculations.rs` |
| **HFNC Settings** | Age/weight categorical settings including flow, FiO₂ titration, weaning criteria | `src/respiratory_cds/models.rs`, `src/respiratory_cds/hfnc.rs` |
| **CPAP/BiPAP Settings** | Starting IPAP / EPAP / CPAP pressure by age | `src/respiratory_cds/cpap.rs`, `src/respiratory_cds/bipap.rs` |
| **Ventilator Settings Reference** | Normal lungs, ARDS, raised ICP mode-specific settings by age | `src/protocols/respiratory.rs` |
| **HFNC Escalation Criteria** | Clinical thresholds for escalation from HFNC | `src/respiratory_cds/hfnc.rs` |
| **RSI Medication Calculator** | Ketamine, rocuronium, succinylcholine, atropine, glycopyrrolate doses by weight | `src/protocols/rsi.rs` |
| **RSI Equipment Sizes** | ETT, LMA, blade, depth-at-lip by age/weight | `src/protocols/rsi.rs` |
| **Magnesium Sulfate (Asthma)** | 25–75 mg/kg (max 2 g) with monitoring parameters | `src/protocols/respiratory.rs` |
| **Continuous Albuterol Infusion** | 0.5 mg/kg/hr (max 15 mg/hr) | `src/protocols/respiratory.rs` |

---

## 12. Respiratory Scoring Systems

| Score | Condition | Domains | Range | Source File |
|---|---|---|---|---|
| **PRAM** (Pediatric Respiratory Assessment Measure) | Asthma | Scalene use, suprasternal retractions, wheeze, air entry, SpO₂ | 0–12 | `src/protocols/respiratory_scoring.rs` |
| **PIS** (Pulmonary Index Score) | Asthma | RR, wheeze, I:E ratio, accessory muscles | 0–15 | `src/protocols/respiratory_scoring.rs` |
| **PASS** (Pediatric Asthma Severity Score) | Asthma | Wheeze, work of breathing, expiratory prolongation | 3–9 | `src/protocols/respiratory_scoring.rs` |
| **M-PIS** (Modified Pulmonary Index Score) | Asthma | HR, RR, wheeze, accessory muscles, SpO₂ | 0–18 | `src/protocols/respiratory_scoring.rs` |
| **Westley Croup Score** | Croup / laryngotracheitis | Stridor, retractions, air entry, cyanosis, consciousness | 0–17 | `src/protocols/respiratory_scoring.rs` |
| **RDAI** (Respiratory Distress Assessment Instrument) | Bronchiolitis | Wheeze (3 domains), retraction (3 domains) | 0–17 | `src/protocols/respiratory_scoring.rs` |
| **Modified Tal Score** (Wang Bronchiolitis Score) | Bronchiolitis | RR, wheeze, retractions, general condition | 0–12 | `src/protocols/respiratory_scoring.rs` |
| **Silverman-Andersen Score** | Neonatal respiratory distress | Chest movement, IC retractions, xiphoid retractions, nasal flaring, expiratory grunt | 0–10 | `src/protocols/respiratory_scoring.rs` |
| **Downes Score** | Neonatal respiratory distress | RR, cyanosis/SpO₂, retractions, grunting, air entry | 0–10 | `src/protocols/respiratory_scoring.rs` |
| **PARDS Classification (PALICC-2)** | Paediatric ARDS | OI, OSI, P/F ratio on NIV/IMV, bilateral infiltrates criterion | Mild / Moderate / Severe | `src/protocols/respiratory_scoring.rs` |

---

## 13. Dosing-Based Calculators

*(Weight-based dosing calculators embedded within protocols)*

| Calculator | Protocol | Description | Source File |
|---|---|---|---|
| **Sepsis Antibiotic Dosing** | Sepsis | Age-stratified empiric antibiotic doses | `src/protocols/sepsis.rs` |
| **Vasoactive Agent Dosing** | Sepsis | Epinephrine and norepinephrine starting rates by weight | `src/protocols/sepsis.rs` |
| **Status Epilepticus Meds** | Neurology | Midazolam (IV/IN/IM), lorazepam, diazepam PR, levetiracetam, fosphenytoin, phenobarbital | `src/protocols/neuro.rs` |
| **DKA — Insulin Infusion Rate** | Metabolic | 0.05–0.1 units/kg/hr | `src/protocols/metabolic.rs` |
| **DKA — Cerebral Edema Treatment** | Metabolic | 3% NaCl and mannitol dosing | `src/protocols/metabolic.rs` |
| **Croup — Dexamethasone** | Respiratory | 0.6 mg/kg (max 16 mg) | `src/protocols/respiratory.rs` |
| **Kawasaki — IVIG & Aspirin** | Skin/Immunology | 2 g/kg IVIG; high-dose then low-dose aspirin | `src/protocols/skin_infections.rs` |
| **Antidotes** | Toxicology | Weight-based dosing for N-acetylcysteine, naloxone, flumazenil, CroFab, atropine, physostigmine, pyridoxine, digoxin Fab, and others | `src/protocols/toxicology.rs` |
| **Transfusion (pRBC, Platelets, FFP)** | Hematology/Cardiac | Weight-based transfusion volumes | `src/protocols/hematology_calc.rs`, `src/protocols/pediatric_cardiology.rs` |
| **Psychiatric Medication Calculator** | Psychiatry | Olanzapine, haloperidol, lorazepam, ketamine for acute agitation | `src/protocols/psychiatric.rs` |

---

## 14. Psychiatry (Screening Tools)

| Tool | Condition | Description | Source File |
|---|---|---|---|
| **Columbia Suicide Severity Rating Scale (C-SSRS)** | Suicidal Ideation | 5-question ideation screen with risk stratification | `src/protocols/psychiatric.rs` |

---

## Notes for Maintainers

- **To add a new calculator:** Add a row to the appropriate section above. Include the calculator name, a one-line description of what it computes, and the Rust source file where the function lives.
- **If a new category is needed:** Add a new `##` section and update the Table of Contents.
- **Source file convention:** Calculators returning scalar values or structured data live in `_calc.rs` files. Decision-support protocols with embedded dosing live in their eponymous protocol files.
- **Scoring systems:** All respiratory scoring systems are in `src/protocols/respiratory_scoring.rs`. Other categorical scores (GCS, PAT) live in `src/assessment.rs`.
