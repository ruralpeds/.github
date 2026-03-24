# Pediatric Emergency Assistant — User Guide

**Clinical Decision Support for Pediatric & Neonatal Emergency Care**

Version 2.0 | Rust/WebAssembly | Fully Offline-Capable PWA

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dual-Mode System: Pediatric vs Neonatal](#2-dual-mode-system)
3. [Patient Setup](#3-patient-setup)
4. [Medications](#4-medications)
5. [Equipment Sizing](#5-equipment-sizing)
6. [Clinical Protocols](#6-clinical-protocols)
7. [Clinical Assessment Tools](#7-clinical-assessment-tools)
8. [Scoring Calculators (Unified Registry)](#8-scoring-calculators)
9. [Respiratory Scoring Systems](#9-respiratory-scoring-systems)
10. [Lab & Clinical Calculators](#10-lab--clinical-calculators)
11. [Checklists](#11-checklists)
12. [Textbook](#12-textbook)
13. [Contacts](#13-contacts)
14. [Reference Tables](#14-reference-tables)
15. [Admin Panel & Customization](#15-admin-panel--customization)
16. [Offline Use & Installation](#16-offline-use--installation)
17. [Technical Architecture](#17-technical-architecture)
18. [Appendix: Complete Calculator Reference](#appendix-complete-calculator-reference)

---

## 1. Getting Started

### What Is This App?

The Pediatric Emergency Assistant is a clinical decision support tool designed for physicians, nurses, and advanced practice providers managing critically ill pediatric and neonatal patients. It is purpose-built for:

- **Rural and Critical Access Hospital Emergency Departments**
- **Remote Emergency Departments** with limited pediatric specialist access
- **NICU and Nursery** settings requiring neonatal-specific tools
- **PICU** teams needing rapid organ dysfunction scoring
- **Transport teams** preparing patients for interfacility transfer

### Key Capabilities

- **70+ scoring calculators and clinical tools** across 9 clinical domains
- **Weight-based dosing** for 50+ emergency medications
- **21 clinical protocols** covering sepsis, trauma, cardiac arrest, DKA, and more
- **Equipment sizing** based on patient age and weight
- **Dual-mode interface** — switch between Pediatric (ED/PICU) and Neonatal (Nursery/NICU) views
- **Full offline operation** — runs entirely in your browser with no server required
- **Installable as a PWA** on phones, tablets, and desktops

### First Launch

1. Open the application in a modern browser (Chrome, Edge, Safari, Firefox)
2. The app will download and cache all assets (~650 KB total)
3. Choose your **mode** — Pediatric or Neonatal — using the mode bar at the top
4. Enter a **patient** in the Patient tab to unlock weight-based calculations
5. Navigate between tabs using the navigation bar

> **Important**: This tool is a clinical decision support reference. It does NOT replace clinical judgment, institutional protocols, or real-time specialist consultation. All doses should be verified by a second provider.

---

## 2. Dual-Mode System

### Overview

The application operates in two distinct modes that filter which calculators, scores, and tools are displayed:

| Feature | Pediatric Mode | Neonatal Mode |
|---------|---------------|---------------|
| **Target Users** | ED physicians, PICU teams | NICU nurses, neonatologists |
| **Color Accent** | Blue | Purple |
| **App Title** | Pediatric Emergency Assistant | Neonatal Emergency Assistant |
| **Subtitle** | Rural & Remote Resuscitation | Nursery / NICU |

### Switching Modes

The **mode bar** is located directly below the header and is always visible:

- Click **Pediatric** (ED / PICU) for the pediatric emergency view
- Click **Neonatal** (Nursery / NICU) for the neonatal-specific view
- The active mode is displayed as a badge (e.g., **PEDIATRIC MODE**)
- Your mode selection is saved automatically and persists across sessions

### What Changes Between Modes

**Neonatal-only calculators** (hidden in Pediatric mode):
- Apgar Score, SNAPPE-II, CRIB-II
- Modified Sarnat Staging (with cooling eligibility)
- Finnegan FNASS (Neonatal Abstinence)
- Silverman-Anderson (neonatal respiratory distress)
- Downes Score (neonatal respiratory distress)
- NIPS (Neonatal Infant Pain Scale)
- Corrected Age (for premature infants)

**Pediatric-only calculators** (hidden in Neonatal mode):
- PECARN TBI Decision Rule
- Pediatric Trauma Score (PTS)
- BIG Score (trauma mortality)
- Pediatric GCS
- PRAM Scoring

**Both modes** show:
- Sepsis scores (Phoenix, pSOFA, PELOD-2, PRISM-III, PIM-3)
- PEWS (Bedside and Brighton)
- OI/OSI, VIS, QTc
- FLACC, COMFORT-B, CAPD
- All bedside formulas (maintenance fluids, BSA, EBV, etc.)
- KDIGO AKI, Schwartz eGFR
- STRONGkids, Humpty Dumpty

### Customizing Mode Assignments

You can override which calculators appear in each mode via **Admin > Calculator Visibility**. See [Section 15](#15-admin-panel--customization) for details.

---

## 3. Patient Setup

### Setting Up a Patient

The Patient tab is the starting point. All weight-based calculations, equipment sizing, and protocol dosing depend on a valid patient context.

**Step 1: Select Patient Type**
- **Pediatric** — children aged 1 month to 18 years
- **Newborn** — neonates (hides the "Age in Years" field; age entered in months only)

**Step 2: Enter Age**
- **Age (Years)**: 0–18 (hidden for Newborn type)
- **Age (Months)**: 0–11

**Step 3: Select Weight Source**
- **Estimate from Age** — uses APLS weight estimation formulas:
  - Neonate (term): 3.5 kg average
  - 1–11 months: (Age in months + 9) / 2
  - 1–5 years: (Age in years x 2) + 8
  - 6–12 years: (Age in years x 3) + 7
  - 13+ years: adult-range dosing, max doses apply
- **Known / Measured Weight** — enter weight in kg directly
- **Broselow Tape Color** — select from standard Broselow colors:
  - Grey (3 kg), Pink (5 kg), Red (6 kg), Purple (8 kg), Yellow (10 kg), White (11 kg), Blue (13 kg), Orange (15 kg), Green (18 kg)

**Step 4: Calculate**

Press **"Set Patient & Calculate All Doses"**. This:
- Initializes the WASM engine with the patient context
- Calculates all weight-based medication doses
- Generates equipment sizing recommendations
- Unlocks all patient-dependent sections (Medications, Equipment, Protocols)
- Displays a patient banner at the top of the screen

### Patient Summary

After setting a patient, you'll see:
- **Patient Summary** — age, weight, estimation method, age category
- **Equipment Sizing** — ET tube size, laryngeal mask, chest tube, IV catheter, etc.
- **Team Activation Triggers** — indications for pediatric specialist activation

### Persistence

Patient data is saved to your browser's local storage and automatically restored on page reload. Use the **"Clear Patient"** or **"New Patient / Reset"** button to start fresh.

---

## 4. Medications

> Requires a patient to be set first.

### Features

- **50+ emergency medications** with weight-based dosing
- **Real-time search** — type to filter by medication name
- **Category filters** — quickly browse by clinical category:
  - Resuscitation, Cardiac, Seizure, Airway, Respiratory, Antibiotic, Vasoactive, Fluids, Neuro, Other

### Medication Display

Each medication card shows:
- Drug name and category
- Weight-based dose calculation
- Route(s) of administration
- Maximum dose limits
- Preparation/dilution instructions
- Clinical notes and warnings

### Customization

Medications can be customized via the Admin panel:
- Override dose descriptions, routes, max doses, concentrations
- Hide specific medications
- Add entirely custom medications
- See [Section 15](#15-admin-panel--customization) for details.

---

## 5. Equipment Sizing

> Requires a patient to be set first.

Provides age- and weight-based equipment sizing recommendations including:
- Endotracheal tube (cuffed and uncuffed)
- Laryngeal mask airway (LMA)
- Chest tube size
- Nasogastric tube
- Urinary catheter
- IV catheter gauge
- Central line size
- Suction catheter
- And more

---

## 6. Clinical Protocols

> Requires a patient to be set first for weight-based protocol dosing.

### Available Protocols (21)

Navigate between protocols using the sub-navigation bar:

| Protocol | Key Content |
|----------|------------|
| **Sepsis** | Surviving Sepsis Campaign 2024 bundle, fluid resuscitation, vasopressors |
| **RSI / Airway** | Rapid sequence intubation, drug selection, backup airway |
| **Status Epilepticus** | Benzodiazepine escalation, refractory seizure management |
| **Trauma** | Primary/secondary survey, hemorrhage control, FAST exam |
| **Cardiac** | PALS algorithms, defibrillation doses, post-ROSC care |
| **Respiratory** | Asthma, bronchiolitis, croup, pneumonia pathways |
| **DKA / Metabolic** | Two-bag method, insulin drip, cerebral edema monitoring |
| **Burns** | Parkland formula, wound care, escharotomy criteria |
| **Toxicology** | Antidote reference, decontamination, specific poisonings |
| **Acid-Base** | ABG interpretation, electrolyte corrections |
| **Hematology (Calc)** | RBC indices, transfusion calculations, coagulation |
| **Renal (Calc)** | eGFR, fractional excretion, fluid balance |
| **Cardiology (Calc)** | Cardiac output, hemodynamics, ECG interpretation |
| **Hematology (Protocol)** | Bleeding, transfusion thresholds, DIC |
| **Drowning** | Submersion injury management |
| **Musculoskeletal** | Fracture management, splinting |
| **Skin Infections** | Cellulitis, abscess, wound care |
| **Environmental** | Hypothermia, heat stroke, envenomation |
| **Psychiatric** | Behavioral crisis, acute agitation, safety |
| **Renal (Protocol)** | AKI management, fluid overload |
| **Procedures** | Procedural sedation, central lines, chest tubes |

Each protocol provides weight-based calculations specific to your patient context.

---

## 7. Clinical Assessment Tools

### Pediatric Assessment Triangle (PAT)

Rapid visual assessment with three components:
- **Appearance** — normal vs. abnormal (irritable, lethargic, poor tone)
- **Work of Breathing** — normal vs. abnormal (retractions, flaring, grunting)
- **Circulation to Skin** — normal vs. abnormal (pallor, mottling, cyanosis)

The system categorizes the patient into one of the PAT acuity categories and suggests an initial management approach.

### Glasgow Coma Scale (GCS)

- Standard GCS scoring (Eye 1–4, Verbal 1–5, Motor 1–6)
- **Infant modification** checkbox for children <2 years (adjusts verbal descriptors)
- Outputs: total score, severity classification, intubation recommendation

### Vital Signs Assessment

Enter measured vital signs:
- Heart Rate (bpm)
- Respiratory Rate (/min)
- Systolic Blood Pressure (mmHg)
- SpO2 (%)
- Temperature (°C)

The system compares each value against age-specific normal ranges and flags abnormalities.

### Burns TBSA Calculator (Lund-Browder)

Age-adjusted body surface area calculation for burns:
- Input burn percentages by body region (head, trunk, arms, legs, perineum)
- Accounts for age-specific surface area differences
- Outputs total TBSA percentage for fluid resuscitation planning

---

## 8. Scoring Calculators

The **Scoring Calculators** tab provides access to 40+ evidence-based clinical scoring systems, filtered by your active mode (Pediatric or Neonatal).

### How to Use

1. Navigate to the **Scoring Calculators** tab
2. Browse the card grid or use **search** to find a specific calculator
3. Filter by **category** using the category buttons (All, Sepsis, PEWS, Neonatal, etc.)
4. Click a calculator card to open its interactive form
5. Fill in the clinical values
6. Press **Calculate** to see results
7. Use the **Back** button to return to the grid

### Calculator Categories

#### Sepsis & Organ Dysfunction (5 calculators)

| Calculator | Score Range | Use Case |
|-----------|------------|----------|
| **Phoenix Sepsis Score** | 0–8 | 2024 international consensus pediatric sepsis criteria |
| **pSOFA** | 0–24 | Sequential organ failure assessment |
| **PELOD-2** | 0–33 | Logistic organ dysfunction for PICU mortality prediction |
| **PRISM III** | 0–74 | PICU mortality risk stratification |
| **PIM-3** | Mortality % | ICU admission mortality prediction |

#### Early Warning — PEWS (2 calculators)

| Calculator | Score Range | Use Case |
|-----------|------------|----------|
| **Bedside PEWS** | 0–28 | SickKids early deterioration detection |
| **Brighton PEWS** | 0–11 | Monaghan rapid bedside assessment |

#### Neonatal (7 calculators, Neonatal mode)

| Calculator | Score Range | Use Case |
|-----------|------------|----------|
| **Apgar Score** | 0–10 | Delivery room assessment at 1 and 5 minutes |
| **SNAPPE-II** | 0–162 | Neonatal acute physiology with perinatal extension |
| **CRIB-II** | Risk Score | Clinical Risk Index for Babies (<32 weeks GA) |
| **Modified Sarnat** | Stage 1–3 | HIE staging with hypothermia cooling eligibility |
| **Finnegan FNASS** | 0–45 | Neonatal abstinence scoring (NAS) |
| **Silverman-Anderson** | 0–10 | Neonatal respiratory distress retraction score |
| **Downes Score** | 0–10 | Modified neonatal respiratory distress assessment |

#### Respiratory / Cardiac (4 calculators)

| Calculator | Output | Use Case |
|-----------|--------|----------|
| **OI / OSI** | OI/OSI values | Oxygenation Index with PARDS severity classification |
| **VIS** | Score | Vasoactive-Inotropic Score for hemodynamic support quantification |
| **PRAM (Scoring)** | 0–12 | Pediatric Respiratory Assessment Measure for asthma |
| **Corrected QT (QTc)** | ms | Bazett and Fridericia formulas with interpretation |

#### Trauma (4 calculators, Pediatric mode)

| Calculator | Score Range | Use Case |
|-----------|------------|----------|
| **Pediatric GCS** | 3–15 | Glasgow Coma Scale with pediatric verbal modification |
| **Pediatric Trauma Score** | -6 to 12 | Triage scoring: <=8 indicates trauma center transport |
| **BIG Score** | 0–30+ | Base deficit + INR + GCS rapid mortality prediction |
| **PECARN TBI** | Risk Level | Head injury CT decision rule (age-stratified <2y and >=2y) |

#### Renal (2 calculators)

| Calculator | Output | Use Case |
|-----------|--------|----------|
| **Schwartz eGFR** | mL/min/1.73m² | Bedside equation with age-specific k-constant |
| **KDIGO AKI** | Stage 0–3 | Acute kidney injury staging by creatinine and urine output |

#### Pain & Sedation (4 calculators)

| Calculator | Score Range | Use Case |
|-----------|------------|----------|
| **FLACC** | 0–10 | Face/Legs/Activity/Cry/Consolability (2 months–7 years) |
| **NIPS** | 0–7 | Neonatal Infant Pain Scale (Neonatal mode) |
| **COMFORT-B** | 6–30 | Sedation assessment for ventilated children |
| **CAPD** | 0–32 | Cornell Assessment of Pediatric Delirium with subtype classification |

#### Bedside Formulas (9 calculators)

| Calculator | Output | Use Case |
|-----------|--------|----------|
| **Maintenance Fluids** | mL/hr | Holliday-Segar 4-2-1 rule |
| **Body Surface Area** | m² | Mosteller, Haycock, and DuBois formulas |
| **Estimated Blood Volume** | mL | Age-specific blood volume with max allowable blood loss |
| **ETT Sizing** | mm | Endotracheal tube size by age and weight |
| **Corrected Age** | weeks | For premature infants (Neonatal mode) |
| **Dehydration Calculator** | mL | Fluid deficit from percent dehydration |
| **Resuscitation Doses** | mg/mL/J | Weight-based emergency medication dosing |
| **Weight Estimation** | kg | APLS formulas by age |
| **Anion Gap** | mEq/L | With albumin correction and delta-delta analysis |

#### Nutritional / Safety (2 calculators)

| Calculator | Score Range | Use Case |
|-----------|------------|----------|
| **STRONGkids** | 0–5 | Nutritional risk screening |
| **Humpty Dumpty** | 7–23 | Pediatric fall risk assessment |

---

## 9. Respiratory Scoring Systems

The **Resp Scoring** tab provides 9 dedicated respiratory scoring systems with full reference tables, severity guides, and interactive calculators.

### Available Scores

| Score | Disease | Age Range | Score Range | Key Feature |
|-------|---------|-----------|-------------|-------------|
| **PRAM** | Asthma | 2–17 yr | 0–12 | Includes SpO2; ICC 0.92 |
| **PIS** | Asthma | All peds | 0–12 | Age-adjusted RR |
| **PASS** | Asthma | 1–18 yr | 3–9 | 3-component simplicity |
| **MPIS** | Asthma | All peds | 0–18 | Most comprehensive |
| **RDAI** | Bronchiolitis | <2 yr | 0–17 | Wheezing + retractions |
| **Modified Tal** | Bronchiolitis | <2 yr | 0–12 | Simple 4-component |
| **Westley Croup** | Croup | 6mo–6yr | 0–17 | Weighted cyanosis/consciousness |
| **Silverman-Anderson** | Neonatal RD | Neonates | 0–10 | Observation only, no equipment |
| **Downes** | Neonatal RD | Neonates | 0–10 | Includes SpO2 modification |

### Using Respiratory Scores

1. Select a score from the pill buttons at the top
2. Review the **reference table** showing component scoring criteria
3. Use the **interactive calculator** below the reference table
4. Select scores for each component from the dropdown menus
5. Press **Calculate Score** to see the result with severity classification and management recommendation

### Overview & Guide

The **"Overview & Guide"** button shows a comparison table of all scores, PARDS criteria (OI/OSI-based severity), and implementation considerations for choosing the right score for your clinical scenario.

---

## 10. Lab & Clinical Calculators

The **Lab Calculators** tab provides 36 interactive calculators organized into 4 clinical groups.

### Acid-Base (11 calculators)

- **ABG Interpretation** — primary disorder identification from pH, PaCO2, HCO3
- **Anion Gap** — with albumin-corrected normal range
- **Delta-Delta** — distinguishing mixed acid-base disorders
- **Winter's Formula** — expected PaCO2 from HCO3
- **Sodium Deficit** — mEq needed to correct hyponatremia
- **Corrected Na+ (Glucose)** — for hyperglycemia adjustment
- **Free Water Deficit** — for hypernatremia correction
- **Corrected Calcium** — albumin-adjusted total calcium
- **FENa** — prerenal vs intrinsic renal failure differentiation
- **Serum Osmolarity** — calculated vs measured for osmolar gap
- **Maintenance Fluids** — Holliday-Segar 4-2-1 rule (patient-dependent)

### Hematology (8 calculators)

- **RBC Indices** — MCV, MCH, MCHC from basic CBC
- **Anemia Assessment** — age-adjusted Hb classification
- **Reticulocyte Calculations** — corrected count and reticulocyte production index
- **PRBC Volume** — transfusion volume to reach target Hb
- **Iron Studies** — transferrin saturation and ferritin interpretation
- **Hemolysis Assessment** — haptoglobin, LDH, bilirubin pattern analysis
- **Coagulation Assessment** — PT/INR, aPTT, fibrinogen, D-dimer with age norms
- **Blood Volume** — age-specific estimated blood volume (patient-dependent)

### Renal (6 calculators)

- **eGFR (Schwartz)** — bedside Schwartz with age/sex-specific k-constant
- **FEK** — fractional excretion of potassium
- **TTKG** — transtubular potassium gradient
- **Urine Protein/Creatinine Ratio** — nephrotic vs nephritic classification
- **Fluid Deficit** — from percent dehydration (patient-dependent)
- **Urine Output Assessment** — mL/kg/hr with oliguria classification

### Cardiology (12 calculators)

- **Mean Arterial Pressure** — MAP from SBP and DBP
- **Cardiac Output (Fick)** — from VO2 and oxygen content difference
- **Cardiac Index** — CO normalized to BSA
- **SVR** — systemic vascular resistance
- **Qp/Qs Ratio** — pulmonary-to-systemic shunt quantification
- **LVEF** — left ventricular ejection fraction
- **Fractional Shortening** — M-mode echocardiographic assessment
- **QTc (Bazett)** — corrected QT interval
- **Modified Bernoulli** — pressure gradient from velocity
- **RVSP** — right ventricular systolic pressure estimation
- **Defibrillation Energy** — weight-based joules (patient-dependent)
- **Resuscitation Meds** — epinephrine, amiodarone dosing (patient-dependent)

### How to Use

1. Select a calculator group (Acid-Base, Hematology, Renal, Cardiology)
2. Choose a specific calculator from the sub-buttons
3. Enter the required lab values
4. Press **Calculate**
5. Results display with interpretation and clinical guidance

> Note: Calculators marked "patient-dependent" require a patient to be set first.

---

## 11. Checklists

### STABILIZE Framework

A structured approach to pediatric emergency stabilization:
- **S**ugar and safe — glucose check, environmental safety
- **T**emperature — thermoregulation
- **A**irway — assessment and management
- **B**reathing — ventilation support
- **I**ntervene — circulatory support
- **L**ab studies — point-of-care testing
- **I**ntervene (secondary) — targeted therapies
- **Z**ero in — definitive management
- **E**valuate — reassessment and transport readiness

### Pre-Transport Checklist

Weight-based preparation checklist for interfacility transport:
- Equipment and medications to prepare
- Documentation requirements
- Communication checklists
- Transport team activation criteria

### Procedure Checklists

Step-by-step checklists for common pediatric procedures.

---

## 12. Textbook

### Overview

The integrated textbook is a comprehensive physician education guide:

**Title**: *Pediatric Emergency Medicine in the Rural Emergency Department*

**Subtitle**: A Comprehensive Physician Education Guide to Stabilization and Management of Critical Pediatric Illness in the First 24 Hours Prior to Transfer

**Scope**: Designed for Rural and Critical Access Hospital Emergency Departments. Based on 2024–2025 AAP, AHA, ACEP, and EMSC Guidelines.

### Navigation

- **Table of Contents** — browse all chapters with section previews
- **Chapter View** — read individual chapters with previous/next navigation
- **Search** — real-time keyword search across all textbook content
- **Back to TOC** button — return to table of contents from any chapter

### Content Format

Each chapter contains:
- Numbered sections with structured clinical content
- Clinical pearls highlighted in colored boxes
- Evidence-based recommendations with guideline citations
- Practical management algorithms

---

## 13. Contacts

A customizable contact directory for your facility:

### Default Contacts

Pre-populated with common pediatric emergency resources:
- Pediatric specialist consultation lines
- Poison control
- Transport teams
- Regional trauma centers

### Customization

- **Edit** — click "Edit Contacts" to modify resource names, phone numbers, and notes
- **Add** — add new contacts specific to your facility
- **Reset** — restore default contact list
- All changes are saved to your browser's local storage

---

## 14. Reference Tables

Quick-access reference data that does not require a patient to be set:

### Age-Specific Vital Signs Reference

Normal ranges for HR, RR, SBP, DBP, and SpO2 by age group from neonate through adolescent.

### GCS Scale — Full Reference

Side-by-side comparison:
- **Adult/Child (>2 yr)** — standard verbal descriptors
- **Infant (<2 yr)** — modified verbal descriptors for pre-verbal patients

### Weight Estimation Formulas

APLS formulas organized by age group with clinical notes.

---

## 15. Admin Panel & Customization

The Admin tab contains three sub-panels for customizing the application.

### Calculator Visibility

Control which scoring calculators appear in each mode:

1. A table lists every scoring calculator grouped by category
2. Each calculator has checkboxes for **Neonatal** and **Pediatric** modes
3. Check/uncheck to show/hide calculators in each mode
4. Use the **search bar** to find specific calculators
5. Click **Reset to Defaults** to restore original mode assignments
6. Changes are saved automatically to your browser

**Use case**: If you want Apgar scores to also appear in Pediatric mode, simply check the "Pediatric" checkbox for the Apgar row.

### Medication Customization

Three sub-tabs for medication management:

**Edit Medications**
- Select any medication from the list
- Override: dose description, route, max dose, concentration, clinical notes
- Individual override removal

**Show/Hide**
- Toggle visibility of any medication
- Hidden medications won't appear in the Medications tab

**Add Custom**
- Create entirely new medications with full properties
- Custom medications appear alongside built-in ones

All medication overrides are saved to local storage and persist across sessions.

### Theme & Display

Customize the visual appearance:

**Built-in Themes**
- **Dark** (default) — navy/blue dark theme
- **Light Blue** — light background with blue accents
- **Darker** — pure black background for OLED screens

**Custom Theming**
- Edit individual CSS color variables (20+ colors)
- Create and save custom themes
- Upload a custom logo
- Customize the app banner

---

## 16. Offline Use & Installation

### Offline Capability

This application is designed for **zero-connectivity environments**:

- **First load**: Downloads ~650 KB of assets (HTML, CSS, JS, WASM binary)
- **Subsequent loads**: Instant from browser cache — no internet needed
- **All calculations run locally** in WebAssembly — no data is sent to any server
- **Complete patient data privacy** — nothing leaves your device
- **Automatic updates**: When connectivity returns, the app silently checks for updates

An **"OFFLINE MODE"** indicator appears when your device has no internet connection.

### Installing as a PWA

On supported browsers (Chrome, Edge, Safari):

1. Look for the **"Install App"** button in the header
2. Click it and confirm the installation prompt
3. The app will appear on your device's home screen / app launcher
4. Launches in standalone mode (no browser chrome)
5. Works identically to a native app, fully offline

### Build Expiration

The app includes a content freshness check:
- **< 6 months**: Current — no action needed
- **6–12 months**: Review recommended — guidelines may have updated
- **12–18 months**: Warning — review for updated clinical guidelines
- **> 18 months**: Critical — update immediately

Check the **About** tab for current build information and expiration status.

---

## 17. Technical Architecture

### How It Works

The application is built on two layers:

**1. Rust/WebAssembly Engine**
- All clinical calculations, drug dosing, equipment sizing, and protocol data are implemented in Rust
- Compiled to WebAssembly (WASM) for near-native performance in the browser
- The `CdsEngine` struct maintains patient context in WASM memory
- JSON-in/JSON-out pattern: all data exchange between JS and WASM uses JSON strings

**2. Vanilla JavaScript Frontend**
- No framework dependencies — pure HTML/CSS/JS
- ES module imports for code organization
- Service Worker for offline caching
- localStorage for persistent settings

### Session Memory

**Within a page session**: The WASM engine remembers the patient you set. All weight-based calculations use the stored patient context automatically.

**Across page refreshes**: WASM memory is cleared on page reload. The JavaScript layer saves patient data to localStorage and restores it automatically, so the experience is seamless.

**Scoring calculators** are stateless — they accept all inputs as JSON and don't depend on the patient context. This means you can calculate scores without setting a patient first.

### Data Privacy

- **No server communication** — all processing happens locally
- **No analytics or tracking** — the app collects no usage data
- **No patient data transmission** — everything stays on your device
- **localStorage only** — settings and patient data stored in your browser

---

## Appendix: Complete Calculator Reference

### All 70+ Calculators by Category

**Scoring Calculators (from unified registry):**

| # | Calculator | Category | Modes | Score Range |
|---|-----------|----------|-------|-------------|
| 1 | Phoenix Sepsis Score | Sepsis | Both | 0–8 |
| 2 | pSOFA | Sepsis | Both | 0–24 |
| 3 | PELOD-2 | Sepsis | Both | 0–33 |
| 4 | PRISM III | Sepsis | Both | 0–74 |
| 5 | PIM-3 | Sepsis | Both | Mortality % |
| 6 | Bedside PEWS | PEWS | Both | 0–28 |
| 7 | Brighton PEWS | PEWS | Both | 0–11 |
| 8 | Apgar Score | Neonatal | Neonatal | 0–10 |
| 9 | SNAPPE-II | Neonatal | Neonatal | 0–162 |
| 10 | CRIB-II | Neonatal | Neonatal | Risk Score |
| 11 | Modified Sarnat | Neonatal | Neonatal | Stage 1–3 |
| 12 | Finnegan FNASS | Neonatal | Neonatal | 0–45 |
| 13 | Silverman-Anderson | Neonatal | Neonatal | 0–10 |
| 14 | Downes Score | Neonatal | Neonatal | 0–10 |
| 15 | OI / OSI | Respiratory | Both | OI/OSI |
| 16 | VIS | Respiratory | Both | Score |
| 17 | PRAM (Scoring) | Respiratory | Pediatric | 0–12 |
| 18 | Corrected QT (QTc) | Respiratory | Both | ms |
| 19 | Pediatric GCS | Trauma | Pediatric | 3–15 |
| 20 | Pediatric Trauma Score | Trauma | Pediatric | -6 to 12 |
| 21 | BIG Score | Trauma | Pediatric | 0–30+ |
| 22 | PECARN TBI | Trauma | Pediatric | Risk Level |
| 23 | Schwartz eGFR | Renal | Both | mL/min/1.73m² |
| 24 | KDIGO AKI | Renal | Both | Stage 0–3 |
| 25 | FLACC | Pain | Both | 0–10 |
| 26 | NIPS | Pain | Neonatal | 0–7 |
| 27 | COMFORT-B | Pain | Both | 6–30 |
| 28 | CAPD | Pain | Both | 0–32 |
| 29 | Maintenance Fluids | Bedside | Both | mL/hr |
| 30 | Body Surface Area | Bedside | Both | m² |
| 31 | Estimated Blood Volume | Bedside | Both | mL |
| 32 | ETT Sizing | Bedside | Both | mm |
| 33 | Corrected Age | Bedside | Neonatal | weeks |
| 34 | Dehydration Calculator | Bedside | Both | mL |
| 35 | Resuscitation Doses | Bedside | Both | mg/mL/J |
| 36 | Weight Estimation | Bedside | Both | kg |
| 37 | Anion Gap | Bedside | Both | mEq/L |
| 38 | STRONGkids | Nutritional | Both | 0–5 |
| 39 | Humpty Dumpty | Nutritional | Both | 7–23 |

**Lab Calculators (from legacy system):**

| # | Calculator | Group |
|---|-----------|-------|
| 40 | ABG Interpretation | Acid-Base |
| 41 | Anion Gap (with albumin) | Acid-Base |
| 42 | Delta-Delta | Acid-Base |
| 43 | Winter's Formula | Acid-Base |
| 44 | Sodium Deficit | Acid-Base |
| 45 | Corrected Na+ | Acid-Base |
| 46 | Free Water Deficit | Acid-Base |
| 47 | Corrected Calcium | Acid-Base |
| 48 | FENa | Acid-Base |
| 49 | Serum Osmolarity | Acid-Base |
| 50 | Maintenance Fluids | Acid-Base |
| 51 | RBC Indices | Hematology |
| 52 | Anemia Assessment | Hematology |
| 53 | Reticulocyte Calculations | Hematology |
| 54 | PRBC Volume | Hematology |
| 55 | Iron Studies | Hematology |
| 56 | Hemolysis Assessment | Hematology |
| 57 | Coagulation Assessment | Hematology |
| 58 | Blood Volume | Hematology |
| 59 | eGFR (Schwartz) | Renal |
| 60 | FEK | Renal |
| 61 | TTKG | Renal |
| 62 | Urine Protein/Cr Ratio | Renal |
| 63 | Fluid Deficit | Renal |
| 64 | Urine Output Assessment | Renal |
| 65 | MAP | Cardiology |
| 66 | Cardiac Output (Fick) | Cardiology |
| 67 | Cardiac Index | Cardiology |
| 68 | SVR | Cardiology |
| 69 | Qp/Qs Ratio | Cardiology |
| 70 | LVEF | Cardiology |
| 71 | Fractional Shortening | Cardiology |
| 72 | QTc (Bazett) | Cardiology |
| 73 | Modified Bernoulli | Cardiology |
| 74 | RVSP | Cardiology |
| 75 | Defibrillation Energy | Cardiology |
| 76 | Resuscitation Meds | Cardiology |

**Respiratory Scores (from dedicated section):**

| # | Score | Disease | Age Range |
|---|-------|---------|-----------|
| 77 | PRAM | Asthma | 2–17 yr |
| 78 | PIS | Asthma | All peds |
| 79 | PASS | Asthma | 1–18 yr |
| 80 | MPIS | Asthma | All peds |
| 81 | RDAI | Bronchiolitis | <2 yr |
| 82 | Modified Tal | Bronchiolitis | <2 yr |
| 83 | Westley Croup | Croup | 6mo–6yr |
| 84 | Silverman-Anderson | Neonatal RD | Neonates |
| 85 | Downes | Neonatal RD | Neonates |

---

## Guideline Sources

This application incorporates guidelines from:

- AAP (American Academy of Pediatrics)
- AHA (American Heart Association) — PALS 2020/2025
- ACEP (American College of Emergency Physicians)
- EMSC (Emergency Medical Services for Children)
- Surviving Sepsis Campaign 2024 Pediatric Guidelines
- NRP (Neonatal Resuscitation Program) 8th Edition 2022/2025
- ISPAD DKA Guidelines
- PECARN (Pediatric Emergency Care Applied Research Network)
- PALICC-2 (Pediatric ARDS) 2023

---

*This guide corresponds to Pediatric Emergency Assistant v2.0. Content should be reviewed every 12 months. Guidelines may change.*
