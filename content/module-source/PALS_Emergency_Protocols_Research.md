# Pediatric Emergency Algorithmic Protocols — Research Reference

> **RESEARCH COMPILATION** — Based on AHA/AAP 2025 Guidelines, Surviving Sepsis Campaign,
> NRP 8th/9th Edition, and current evidence-based recommendations.
> Compiled March 2026. For clinical decision support development use only.

---

## 1. PEDIATRIC CARDIAC ARREST (AHA PALS 2025)

### Algorithm Overview
Two parallel pathways based on initial rhythm analysis:

```
CARDIAC ARREST IDENTIFIED
  |
  v
Start CPR → Attach monitor/defibrillator → Rhythm check
  |                                            |
  |--- SHOCKABLE (VF / pVT) ------→ Shock pathway
  |--- NON-SHOCKABLE (Asystole/PEA) → No-shock pathway
```

### SHOCKABLE RHYTHM PATHWAY (VF / Pulseless VT)

| Step | Action | Details |
|------|--------|---------|
| 1 | Shock #1 | **2 J/kg** (biphasic or monophasic) |
| 2 | CPR | 2 minutes immediately after shock |
| 3 | Rhythm check | If still VF/pVT → continue |
| 4 | Shock #2 | **4 J/kg** |
| 5 | CPR | 2 minutes |
| 6 | Epinephrine | **0.01 mg/kg IV/IO** (0.1 mL/kg of 0.1 mg/mL); max **1 mg**; repeat q3-5 min |
| 7 | Rhythm check | If still VF/pVT → continue |
| 8 | Shock #3 | **4 J/kg** (may increase up to **10 J/kg**, not to exceed adult dose) |
| 9 | CPR | 2 minutes |
| 10 | Antiarrhythmic | **Amiodarone 5 mg/kg IV/IO** bolus (max 300 mg); may repeat x2 (max 150 mg subsequent) **OR Lidocaine 1 mg/kg IV/IO** |
| 11 | Continue cycle | Shock → CPR 2 min → Epi q3-5min → Antiarrhythmic after 3rd & 5th shocks |

### NON-SHOCKABLE RHYTHM PATHWAY (Asystole / PEA)

| Step | Action | Details |
|------|--------|---------|
| 1 | CPR | 2 minutes; obtain IV/IO access |
| 2 | Epinephrine | **0.01 mg/kg IV/IO** (max 1 mg) as soon as feasible |
| 3 | CPR | 2 minutes |
| 4 | Rhythm check | If non-shockable → continue CPR + epi q3-5 min |
| 5 | Advanced airway | Consider supraglottic or ETT |
| 6 | Continue cycle | CPR 2 min → rhythm check → epi q3-5 min; treat reversible causes |

### Drug Doses Summary — Cardiac Arrest

| Drug | Route | Dose | Max Single Dose | Repeat |
|------|-------|------|-----------------|--------|
| Epinephrine | IV/IO | **0.01 mg/kg** (0.1 mL/kg of 1:10,000) | 1 mg | Every 3-5 minutes |
| Epinephrine | ETT | **0.1 mg/kg** (0.1 mL/kg of 1:1,000) | 2.5 mg | If no IV/IO |
| Amiodarone | IV/IO | **5 mg/kg** bolus | 300 mg (1st), 150 mg (subsequent) | Up to 3 total doses |
| Lidocaine | IV/IO | **1 mg/kg** (alternative to amiodarone) | 100 mg | May repeat |

### Defibrillation Energy

| Shock | Energy | Maximum |
|-------|--------|---------|
| 1st shock | **2 J/kg** | — |
| 2nd shock | **4 J/kg** | — |
| Subsequent | **4-10 J/kg** | 10 J/kg or adult maximum dose |

### CPR Quality Targets (AHA 2025)

| Parameter | Target |
|-----------|--------|
| Compression rate | **100-120/min** |
| Compression depth (child) | **~2 inches** (~5 cm); at least 1/3 AP chest diameter |
| Compression depth (infant) | **~1.5 inches** (~4 cm); at least 1/3 AP chest diameter |
| Compression:ventilation (1 rescuer) | **30:2** |
| Compression:ventilation (2 rescuers, pre-pubertal) | **15:2** |
| Chest compression fraction | **≥60%** (target ≥80%) |
| Full chest recoil | Complete between compressions |
| Ventilation rate (with advanced airway) | 1 breath every 2-3 seconds (20-30/min) |
| Diastolic BP target (if arterial line) | >25 mmHg (infants), >30 mmHg (children) |

### Reversible Causes (H's and T's)
- **H's:** Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypoglycemia, Hypo/hyperkalemia, Hypothermia
- **T's:** Tension pneumothorax, Tamponade (cardiac), Toxins, Thrombosis (pulmonary), Thrombosis (coronary)

---

## 2. PEDIATRIC BRADYCARDIA WITH A PULSE (AHA PALS 2025)

### Algorithm

```
BRADYCARDIA IDENTIFIED (HR inappropriately slow for age)
  |
  v
Maintain airway, assist breathing, give O2 if SpO2 < 94%
Cardiac monitor, IV/IO access, 12-lead ECG if feasible
  |
  v
Identify and treat underlying cause
(hypoxia, hypothermia, head injury, heart block, drugs/toxins)
  |
  v
DECISION: Cardiopulmonary compromise?
(hypotension, altered mental status, signs of shock)
  |
  |--- NO → Observe, supportive care, consult cardiology
  |
  |--- YES ↓
  v
HR < 60/min despite adequate oxygenation and ventilation?
  |
  |--- YES → START CPR
  |
  v
PHARMACOTHERAPY:
  Epinephrine 0.01 mg/kg IV/IO q3-5 min
  Atropine 0.02 mg/kg IV/IO (if vagal tone or AV block)
  |
  v
If refractory → Consider transcutaneous pacing
  |
  v
If pulseless arrest develops → Go to Cardiac Arrest Algorithm
```

### Drug Doses — Bradycardia

| Drug | Dose | Min Dose | Max Single Dose | Notes |
|------|------|----------|-----------------|-------|
| **Epinephrine** | **0.01 mg/kg** IV/IO | — | 1 mg | Repeat q3-5 min; first-line for secondary bradycardia |
| **Atropine** | **0.02 mg/kg** IV/IO | **0.1 mg** | **0.5 mg** | May repeat once; first-line for vagal/AV block |

### When to Treat
- Symptomatic bradycardia with poor perfusion
- HR < 60/min with cardiopulmonary compromise despite oxygenation/ventilation
- Primary bradycardia (congenital heart block, post-surgical) vs. secondary (hypoxia, acidosis — treat the cause)

### Transcutaneous Pacing
- Rate: 10-20 bpm above intrinsic rate, or 60 bpm if no intrinsic rate
- Start at 0 mA, increase until electrical capture
- Ensure sedation/analgesia during pacing

---

## 3. PEDIATRIC TACHYCARDIA WITH A PULSE (AHA PALS 2025)

### Initial Assessment
```
TACHYCARDIA IDENTIFIED
  |
  v
ABCs, O2 if SpO2 < 95%, cardiac monitor, IV/IO, 12-lead ECG
  |
  v
DETERMINE QRS WIDTH
  |
  |--- NARROW COMPLEX (QRS ≤ 0.09 sec) → Likely SVT or sinus tachycardia
  |--- WIDE COMPLEX (QRS > 0.09 sec) → Possible VT
  |
  v
DETERMINE HEMODYNAMIC STABILITY
  |
  |--- UNSTABLE → Synchronized cardioversion
  |--- STABLE → Pharmacologic management
```

### Differentiating Sinus Tachycardia vs. SVT

| Feature | Sinus Tachycardia | SVT |
|---------|-------------------|-----|
| Rate (infant) | Usually < 220 bpm | Usually ≥ 220 bpm |
| Rate (child) | Usually < 180 bpm | Usually > 180 bpm |
| P waves | Present, normal, upright | Absent or abnormal |
| Rate variability | Variable | Fixed/not variable |
| Onset | Gradual | Abrupt |
| History | Fever, pain, dehydration | Often none |

### UNSTABLE PATIENT (any QRS width)

| Step | Action | Details |
|------|--------|---------|
| 1 | Synchronized cardioversion | **0.5-1 J/kg** |
| 2 | If ineffective | Increase to **2 J/kg** |
| 3 | Consider | Adenosine if IV available and does not delay cardioversion |
| 4 | Sedate | If patient conscious, sedate prior to cardioversion if time permits |

### STABLE — NARROW COMPLEX (probable SVT)

| Step | Action | Details |
|------|--------|---------|
| 1 | Vagal maneuvers | Ice to face (infant), bear-down/blow through straw (child) |
| 2 | Adenosine 1st dose | **0.1 mg/kg** rapid IV push (max **6 mg**); follow with rapid NS flush |
| 3 | Adenosine 2nd dose | **0.2 mg/kg** rapid IV push (max **12 mg**) if first dose ineffective |
| 4 | If refractory | Synchronized cardioversion or consult cardiology |
| 5 | Consider | IV sotalol (new in 2025 guidelines for refractory SVT), procainamide, or amiodarone with expert consultation |

### STABLE — WIDE COMPLEX (possible VT)

| Step | Action | Details |
|------|--------|---------|
| 1 | Expert consultation | Consult pediatric cardiology |
| 2 | If regular, monomorphic | May consider adenosine (diagnostic/therapeutic) |
| 3 | Amiodarone | **5 mg/kg IV** over 20-60 min |
| 4 | OR Procainamide | **15 mg/kg IV** over 30-60 min |
| 5 | Do NOT give | Amiodarone and procainamide together (risk of hypotension/QT prolongation) |

### Drug Doses — Tachycardia

| Drug | Dose | Max | Route | Notes |
|------|------|-----|-------|-------|
| **Adenosine (1st)** | **0.1 mg/kg** | 6 mg | Rapid IV push + flush | Must be rapid push, closest port to heart |
| **Adenosine (2nd)** | **0.2 mg/kg** | 12 mg | Rapid IV push + flush | If 1st dose ineffective |
| **Amiodarone** | **5 mg/kg** | 300 mg | IV over 20-60 min | For VT; do not give with procainamide |
| **Procainamide** | **15 mg/kg** | 1000 mg | IV over 30-60 min | Alternative to amiodarone |

### Synchronized Cardioversion Energy

| Attempt | Energy |
|---------|--------|
| 1st | **0.5-1 J/kg** |
| 2nd | **2 J/kg** |

---

## 4. NEONATAL RESUSCITATION (NRP 8th/9th Edition, ILCOR 2025)

### Algorithm — Step-by-Step

```
BIRTH
  |
  v
RAPID ASSESSMENT: Term? Good tone? Breathing/crying?
  |
  |--- YES to all → Routine care (delayed cord clamping 30-60 sec,
  |                  skin-to-skin, warm, dry)
  |
  |--- ANY NO ↓
  v
INITIAL STEPS (within "Golden Minute" — first 60 seconds):
  Warm (radiant warmer, plastic wrap if preterm)
  Dry and stimulate
  Position airway (neutral/sniffing position)
  Suction if needed (mouth then nose)
  |
  v
ASSESS: HR and breathing at 30 seconds
  |
  |--- Breathing, HR ≥ 100 → Post-resuscitation care
  |
  |--- Apnea/gasping OR HR < 100 ↓
  v
PPV (Positive Pressure Ventilation) — by 60 seconds of life
  Rate: 40-60 breaths/min
  FiO2: 21% for term; 21-30% for preterm ≤35 wk
  |
  v
ASSESS after 15 sec: Chest movement?
  |
  |--- NO → MR. SOPA corrective steps:
  |         M = Mask adjustment
  |         R = Reposition airway
  |         S = Suction mouth and nose
  |         O = Open mouth
  |         P = Pressure increase
  |         A = Alternative airway (LMA or ETT)
  |
  |--- YES → Continue PPV, reassess at 30 sec total
  v
AFTER 30 sec effective PPV:
  |
  |--- HR ≥ 100 → Continue monitoring
  |--- HR 60-99 → Continue PPV, reassess
  |--- HR < 60 ↓
  v
INTUBATION / ALTERNATIVE AIRWAY
  Consider LMA (≥34 wk, ≥1.5 kg) or ETT
  Increase FiO2 to 100%
  |
  v
CHEST COMPRESSIONS (if HR < 60 after 30 sec PPV with airway)
  Technique: Two-thumb encircling hands (from head of bed preferred)
  Location: Lower 1/3 of sternum
  Depth: 1/3 of AP chest diameter
  Ratio: 3:1 (3 compressions : 1 ventilation)
  Rate: 90 compressions + 30 ventilations = 120 events/min
  Cadence: "One-and-Two-and-Three-and-Breathe"
  |
  v
ASSESS after 60 sec of compressions: HR still < 60?
  |
  |--- YES ↓
  v
EPINEPHRINE
  IV/IO (preferred): 0.01-0.03 mg/kg (0.1-0.3 mL/kg of 1:10,000)
  ETT (if no IV/IO): 0.05-0.1 mg/kg (0.5-1 mL/kg of 1:10,000)
  Preferred IV access: Umbilical vein catheter (UVC)
  Repeat q3-5 min
  Flush with 3 mL NS after IV/IO dose
  |
  v
VOLUME EXPANSION (if suspected blood loss or no response to epi)
  Normal saline or O-negative blood: 10 mL/kg IV over 5-10 min
  |
  v
If no HR response by 20 min → Discuss redirection of care
```

### NRP Epinephrine Doses

| Route | Concentration | Dose | Volume | Max |
|-------|--------------|------|--------|-----|
| **IV/IO** (preferred) | 1:10,000 (0.1 mg/mL) | **0.01-0.03 mg/kg** | 0.1-0.3 mL/kg | Repeat q3-5 min |
| **ETT** (if no IV/IO) | 1:10,000 (0.1 mg/mL) | **0.05-0.1 mg/kg** | 0.5-1.0 mL/kg | While obtaining IV |

### Target Preductal SpO2 After Birth

| Time After Birth | Target SpO2 |
|------------------|-------------|
| 1 minute | 60-65% |
| 2 minutes | 65-70% |
| 3 minutes | 70-75% |
| 4 minutes | 75-80% |
| 5 minutes | 80-85% |
| 10 minutes | 85-95% |

> Avoid hyperoxia (SpO2 > 95%). Titrate FiO2 to achieve targets.

### ETT Size by Gestational Age

| Gestational Age | ETT Internal Diameter |
|-----------------|----------------------|
| < 28 weeks | 2.5 mm |
| 28-34 weeks | 3.0 mm |
| 34-38 weeks | 3.5 mm |
| > 38 weeks | 3.5-4.0 mm |

---

## 5. PEDIATRIC SEPSIS (Surviving Sepsis Campaign 2020 + Phoenix 2024)

### Diagnosis — Phoenix Sepsis Score (2024)
- Sepsis: Phoenix Score ≥ 2 in child with suspected infection
- Septic Shock: Sepsis criteria met + cardiovascular dysfunction (cardiovascular score ≥ 1)
- Domains scored: respiratory, cardiovascular, coagulation, neurological

### Algorithm

```
SUSPECTED SEPSIS / SEPTIC SHOCK
  |
  v
TIME ZERO (recognition)
  ├── Blood cultures (before antibiotics if possible)
  ├── Serum lactate
  ├── CBC, CMP, coagulation studies
  |
  v
ANTIBIOTICS:
  Septic shock → within 1 HOUR
  Sepsis without shock → within 3 HOURS
  Broad-spectrum, empiric; narrow when culture data available
  |
  v
FLUID RESUSCITATION (first 30-60 min):
  10-20 mL/kg isotonic crystalloid bolus (balanced crystalloid preferred)
  Reassess after EACH bolus (HR, BP, perfusion, mental status, urine output)
  May repeat to 40-60 mL/kg total in first hour
  STOP if signs of fluid overload (rales, hepatomegaly, worsening oxygenation)
  |
  v
REASSESS — still signs of shock?
  |
  |--- NO → Monitor, supportive care, ICU disposition
  |
  |--- YES ↓
  v
VASOACTIVE AGENTS (can start peripherally or IO):
  First-line: Epinephrine OR Norepinephrine (NOT dopamine)
  Begin after 40-60 mL/kg fluid OR sooner if fluid overload develops
  |
  v
REFRACTORY SHOCK:
  Add vasopressin OR further titrate catecholamines
  Consider hydrocortisone if catecholamine-resistant shock
  |
  v
ONGOING MANAGEMENT:
  Target MAP appropriate for age
  Reassess perfusion markers (lactate clearance, capillary refill, UOP)
  Avoid fluid overload — consider early vasoactive use
```

### Fluid Resuscitation Details

| Parameter | Recommendation |
|-----------|---------------|
| Fluid type | Balanced crystalloid (preferred) or NS |
| Bolus size | **10-20 mL/kg** per bolus |
| Total first hour | Up to **40-60 mL/kg** |
| Reassessment | After EACH bolus |
| Stop criteria | Fluid overload signs (rales, hepatomegaly, increased O2 requirement) |
| In settings without ICU | Limit fluid bolus to hypotensive patients only |

### Vasoactive Agents

| Agent | Role | Notes |
|-------|------|-------|
| **Epinephrine** | First-line | Cold shock (poor perfusion, low CO); can give peripherally |
| **Norepinephrine** | First-line | Warm shock (vasodilated, bounding pulses); can give peripherally |
| **Dopamine** | Second-line | Only if epi/norepi unavailable |
| **Vasopressin** | Adjunct | Catecholamine-refractory shock |
| **Hydrocortisone** | Adjunct | If fluid + vasopressor fails to restore hemodynamic stability |

### Antibiotic Timing

| Severity | Target |
|----------|--------|
| Septic shock | **Within 1 hour** of recognition |
| Sepsis (no shock) | **Within 3 hours** of recognition |

---

## 6. STATUS EPILEPTICUS

### Definition
- Convulsive seizure lasting ≥ 5 minutes, OR
- Two or more seizures without return to baseline between them

### Tiered Algorithm

```
TIME 0-5 MIN: STABILIZATION PHASE
  ABCs, O2, monitor, glucose check
  Position patient safely
  Obtain IV/IO access
  |
  v
TIME 0-10 MIN: FIRST-LINE — BENZODIAZEPINES
  |
  v
TIME 10-20 MIN: SECOND-LINE — ANTI-SEIZURE MEDICATIONS
  (if seizures persist after 2 appropriate BZD doses)
  |
  v
TIME 20-40 MIN: REFRACTORY STATUS EPILEPTICUS
  (if seizures persist after BZD + 1 second-line agent)
  |
  v
TIME > 40-60 MIN: SUPER-REFRACTORY SE
  (if seizures persist ≥ 24 hours after onset of anesthetic therapy)
```

### First-Line Benzodiazepines

| Drug | Route | Dose | Max Single Dose | Notes |
|------|-------|------|-----------------|-------|
| **Midazolam** | IM | **0.2 mg/kg** | **10 mg** | Preferred if no IV access |
| **Midazolam** | IN (intranasal) | **0.2 mg/kg** | **10 mg** | Split between nares |
| **Midazolam** | Buccal | **0.2 mg/kg** | **10 mg** | Alternative non-IV route |
| **Midazolam** | IV | **0.1-0.2 mg/kg** | **5 mg** | |
| **Lorazepam** | IV | **0.1 mg/kg** | **4 mg** | Preferred IV BZD in ED |
| **Diazepam** | IV | **0.15-0.2 mg/kg** | **10 mg** | |
| **Diazepam** | PR (rectal) | **0.5 mg/kg** | **20 mg** | If no IV and no midazolam |

- May repeat BZD x1 after 5 minutes if seizure continues
- Maximum 2 BZD doses before moving to second-line

### Second-Line Agents (10-20 min mark)

| Drug | Dose | Max | Infusion Rate | Notes |
|------|------|-----|---------------|-------|
| **Levetiracetam** | **60 mg/kg** IV | **3000-4500 mg** | Over 15 min | Increasingly preferred; safe profile |
| **Fosphenytoin** | **20 mg PE/kg** IV | **1500 mg PE** | Over 10-20 min | Monitor for cardiac arrhythmia |
| **Valproate (VPA)** | **20-40 mg/kg** IV | **3000 mg** | Over 5-10 min | Caution < 3 yr (hepatotoxicity risk); avoid if mitochondrial disorder suspected |
| **Phenobarbital** | **15-20 mg/kg** IV | **1000 mg** | Over 15-30 min | Monitor for respiratory depression and hypotension |

### Refractory SE (20-40 min mark)

| Drug | Loading Dose | Infusion Rate | Notes |
|------|-------------|---------------|-------|
| **Midazolam** continuous infusion | **0.2 mg/kg** bolus | **0.05-2 mg/kg/hr** (target 0.12-0.30 mg/kg/hr per 2025 data) | First-line for RSE |
| **Pentobarbital** | **5 mg/kg** bolus | **1-5 mg/kg/hr** | Titrate to EEG burst suppression |
| **Ketamine** | **1-2 mg/kg** bolus | **0.5-3 mg/kg/hr** (median ~2.4 mg/kg/hr) | Emerging evidence; 66% RSE control |
| **Propofol** | **1-2 mg/kg** bolus | **1-5 mg/kg/hr** | Avoid prolonged use in children (propofol infusion syndrome) |

### Monitoring
- Continuous EEG for all refractory SE; continue ≥ 24 hours
- Goal: Cessation of all clinical and electrical seizure activity
- Frequent glucose checks; treat hypoglycemia (dextrose 0.5-1 g/kg)

---

## 7. ANAPHYLAXIS

### Diagnosis (NIAID/FAAN Criteria)
Anaphylaxis likely when ANY ONE of the following:
1. Acute onset of illness involving skin/mucosal tissue AND respiratory compromise or hypotension
2. Two or more of: skin/mucosal involvement, respiratory, hypotension, persistent GI symptoms — after exposure to likely allergen
3. Hypotension after exposure to KNOWN allergen

### Algorithm

```
ANAPHYLAXIS RECOGNIZED
  |
  v
IMMEDIATE ACTIONS:
  Remove allergen if possible
  Call for help / activate emergency response
  Position: Supine with legs elevated (if tolerated; sitting if respiratory distress)
  |
  v
EPINEPHRINE IM (FIRST-LINE — DO NOT DELAY)
  0.01 mg/kg of 1:1,000 (1 mg/mL) IM mid-outer thigh
  Max: 0.3 mg (prepubertal child), 0.5 mg (teenager/adult)
  May repeat every 5-15 minutes as needed
  |
  v
ADJUNCTS (simultaneous):
  High-flow O2
  IV/IO access — 2 large-bore if possible
  Cardiac monitor, pulse oximetry
  |
  v
FLUID RESUSCITATION (if hypotension/poor perfusion):
  NS 20 mL/kg bolus (max 1 L/dose)
  Repeat as needed for cardiovascular instability
  |
  v
IF REFRACTORY (after 2+ doses IM epinephrine):
  Epinephrine infusion 0.1-1 mcg/kg/min IV
  |
  v
ADJUNCTIVE MEDICATIONS (second/third-line):
  Albuterol nebulized — for persistent bronchospasm
  H1-antihistamine (diphenhydramine 1 mg/kg, max 50 mg) — for urticaria/itch only
  H2-antihistamine (ranitidine/famotidine) — optional
  Corticosteroids (methylprednisolone 1-2 mg/kg, max 125 mg) — for biphasic prevention (unproven)
  Glucagon 20-30 mcg/kg IV (max 1 mg) — if on beta-blockers
  |
  v
OBSERVE 4+ HOURS minimum post last epinephrine
  Admit if: repeated epi doses, severe symptoms, biphasic reaction, or respiratory/hemodynamic instability
```

### Epinephrine Dosing — Anaphylaxis

| Route | Concentration | Dose | Max | Repeat |
|-------|--------------|------|-----|--------|
| **IM** (first-line) | 1:1,000 (1 mg/mL) | **0.01 mg/kg** | 0.3 mg (prepubertal), 0.5 mg (teen) | q5-15 min |
| **IV infusion** (refractory) | — | **0.1-1 mcg/kg/min** | Titrate to effect | Continuous |

### Auto-Injector Dosing by Weight

| Weight | Auto-injector Dose |
|--------|-------------------|
| < 15 kg | **0.1 mg** (Auvi-Q) |
| 15 to < 30 kg | **0.15 mg** (EpiPen Jr) |
| ≥ 30 kg | **0.3 mg** (EpiPen) |

### Adjunctive Medications Summary

| Drug | Dose | Max | Role |
|------|------|-----|------|
| **Albuterol** | 2.5-5 mg nebulized | Repeat PRN | Bronchospasm |
| **Diphenhydramine** | 1 mg/kg IV/IM/PO | 50 mg | Urticaria/itch only; NOT first-line |
| **Methylprednisolone** | 1-2 mg/kg IV | 125 mg | Theoretical biphasic prevention |
| **Glucagon** | 20-30 mcg/kg IV over 5 min | 1 mg | Beta-blocker refractory cases |
| **Magnesium sulfate** | 25-50 mg/kg IV | 2 g | Refractory bronchospasm |

### Key Points
- Epinephrine IM is THE treatment; antihistamines and steroids are NOT substitutes
- Do NOT delay epinephrine for any reason
- Biphasic reactions occur in 3-20% of cases (median 11 hours post-initial)
- Discharge with epinephrine auto-injector prescription + allergist referral

---

## 8. PEDIATRIC DKA

### Diagnosis
- Blood glucose > 200 mg/dL (> 11 mmol/L)
- Venous pH < 7.3 or serum bicarbonate < 15 mmol/L
- Ketonemia or ketonuria

### Severity Classification

| Severity | pH | Bicarbonate |
|----------|-----|-------------|
| Mild | 7.2-7.3 | 10-15 mmol/L |
| Moderate | 7.1-7.2 | 5-10 mmol/L |
| Severe | < 7.1 | < 5 mmol/L |

### Algorithm

```
DKA DIAGNOSED
  |
  v
INITIAL ASSESSMENT:
  ABCs, mental status (GCS), vital signs, weight
  Labs: glucose, BMP, VBG, beta-hydroxybutyrate, urinalysis
  2 IV lines, cardiac monitor
  |
  v
PHASE 1: INITIAL FLUID RESUSCITATION (0-1 hour)
  NS bolus 10-20 mL/kg over 20-30 min
  Repeat if hemodynamically unstable (max 30 mL/kg in first hour)
  |
  v
PHASE 2: ONGOING REHYDRATION (begins hour 1-2)
  Replace deficit over 24-48 hours (typically 36 hours)
  Maintenance + deficit replacement
  NS or balanced crystalloid initially
  Switch to D5 + 0.45-0.9% NS when glucose < 300 mg/dL
  Two-bag system for tighter glycemic control
  |
  v
INSULIN INFUSION (start 1 hour AFTER fluid resuscitation begins)
  NEVER give IV bolus of insulin
  Infuse ONLY if K+ > 3.0 mmol/L
  |
  v
POTASSIUM REPLACEMENT (after K+ level known and urine output confirmed)
  |
  v
MONITORING:
  Neuro checks q1h for first 12 hours
  BMP q2h, VBG q2-4h
  Corrected sodium trending up (good sign)
  |
  v
RESOLUTION CRITERIA:
  pH > 7.3, HCO3 > 17, glucose normalizing, anion gap closed
  Transition to subcutaneous insulin before stopping drip
```

### Insulin Dosing

| Parameter | Recommendation |
|-----------|---------------|
| Standard rate | **0.05-0.1 units/kg/hr** continuous infusion |
| Age < 5 years | Consider lower rate: **0.05 units/kg/hr** |
| Age ≥ 5 years | May use **0.1 units/kg/hr** |
| Minimum rate | **0.05 units/kg/hr** (do not go below unless truly hypoglycemic) |
| NO bolus | Never give IV insulin bolus |
| Start timing | 1 hour after beginning IV fluids |
| Prerequisite | K+ must be > **3.0 mmol/L** before starting insulin |
| Goal | Decrease glucose by 50-100 mg/dL/hr |

### Potassium Replacement

| Serum K+ | Action |
|----------|--------|
| > 5.5 mmol/L | Do NOT add K+ to fluids; recheck in 1-2 hrs |
| 3.5-5.5 mmol/L | Add **40 mEq/L** KCl (or mix KCl + KPhos) to IV fluids |
| 3.0-3.5 mmol/L | Add **40-50 mEq/L** K+; may need higher concentration |
| < 3.0 mmol/L | **REPLACE K+ BEFORE starting insulin**; give 0.5-1 mEq/kg over 1 hr with monitoring |

> Never give K+ as rapid IV bolus — risk of cardiac arrest.

### Fluid Management Details

| Phase | Fluid | Rate/Volume |
|-------|-------|-------------|
| Initial bolus | NS | 10-20 mL/kg over 20-30 min |
| Rehydration | NS or balanced crystalloid | Replace deficit over 24-48 hr |
| When glucose < 300 | D5 + 0.45-0.9% NS | Adjust dextrose to maintain glucose 150-250 |
| Two-bag system | Bag 1: NS (no dextrose), Bag 2: D10 + NS | Titrate ratio to control glucose |

### Cerebral Edema — Recognition & Treatment

**Warning Signs:**
- Headache, altered mental status, irritability
- Cushing triad (hypertension, bradycardia, irregular respirations)
- Pupil changes, posturing, seizures

**Risk Factors:**
- pH < 7.1, pCO2 < 20 mmHg
- > 50 mL/kg fluid in first 4 hours
- Age < 15 years, new-onset diabetes
- Severely dehydrated, hyperosmolar

**Treatment (do NOT delay for imaging):**

| Agent | Dose | Administration |
|-------|------|---------------|
| **Mannitol** | **0.5-1 g/kg** IV | Over 30 min; may repeat in 1 hr |
| **Hypertonic saline (3%)** | **5-10 mL/kg** IV | Over 30 min; may repeat in 1 hr |

- Elevate head of bed 30 degrees
- Reduce IV fluid rate
- Consider intubation if GCS deteriorating (avoid aggressive hyperventilation)
- Urgent neurosurgical/critical care consultation

### Do NOT Give
- Sodium bicarbonate (increases cerebral edema risk)
- IV insulin bolus

---

## 9. RAPID SEQUENCE INTUBATION (RSI) — Pediatric

### Pre-RSI Checklist
- **S**uction ready
- **O**xygen (preoxygenate 3-5 min; apneic oxygenation via NC during attempt)
- **A**irway equipment (ETT, blade, stylet, supraglottic airway backup)
- **P**harmacy (drugs drawn up, weight-based doses calculated)
- **M**onitoring (SpO2, ETCO2, cardiac monitor, BP)
- **E**mergency plan (failed airway algorithm, surgical airway kit)

### ETT Size Estimation

| Method | Formula |
|--------|---------|
| Uncuffed | (Age/4) + 4 |
| Cuffed | (Age/4) + 3.5 |
| Depth (oral) | ETT ID x 3 |

### Induction Agents

| Drug | Dose | Onset | Duration | Best For | Avoid In |
|------|------|-------|----------|----------|----------|
| **Ketamine** | **1-2 mg/kg** IV | 1-2 min | 5-15 min | Hypotension, asthma, sepsis | Relative: elevated ICP (older concern, now debated) |
| **Etomidate** | **0.2-0.4 mg/kg** IV (max 20 mg) | 30-60 sec | 3-5 min | Head injury, hemodynamically stable | Sepsis (adrenal suppression); children < 2 yr (less data) |
| **Propofol** | **0.5-2 mg/kg** IV | 30-60 sec | 5-10 min | Status epilepticus, elevated ICP | Hypotension, hypovolemia |
| **Midazolam** | **0.1-0.3 mg/kg** IV (max 5 mg) | 2-3 min | 15-30 min | Adjunct only; less predictable | As sole induction agent (unreliable) |

### Neuromuscular Blocking Agents

| Drug | Dose | Onset | Duration | Notes |
|------|------|-------|----------|-------|
| **Succinylcholine** | **1.5-2 mg/kg** IV (infant: 2 mg/kg) | 30-60 sec | 5-10 min | **Contraindications:** hyperkalemia, burns > 6 hr, crush injury, neuromuscular disease, malignant hyperthermia history, denervation injury |
| **Rocuronium** | **1-1.2 mg/kg** IV (max 100 mg) | 60-90 sec | 45-70 min | Most commonly used NMBA in pediatric RSI (78%); reversal with **sugammadex** 16 mg/kg if "can't intubate, can't ventilate" |
| **Vecuronium** | **0.1-0.2 mg/kg** IV | 2-3 min | 30-60 min | Slower onset; less preferred for RSI |

### Pretreatment Agents (Optional)

| Drug | Dose | Max | Indication |
|------|------|-----|------------|
| **Atropine** | **0.02 mg/kg** IV | 0.5 mg (min 0.1 mg) | Age < 1 yr; repeat laryngoscopy; succinylcholine use in young children |
| **Lidocaine** | **1 mg/kg** IV | 100 mg | Elevated ICP; reactive airway disease |
| **Fentanyl** | **1-2 mcg/kg** IV | 100 mcg | Blunt sympathetic response (head injury, cardiovascular disease) |

### Common Pediatric RSI Regimens by Scenario

| Scenario | Induction | Paralytic | Pretreatment |
|----------|-----------|-----------|--------------|
| **Standard** | Ketamine 1-2 mg/kg | Rocuronium 1.2 mg/kg | None or atropine (if < 1 yr) |
| **Head injury** | Etomidate 0.3 mg/kg | Rocuronium 1.2 mg/kg | Lidocaine 1 mg/kg + fentanyl 1-2 mcg/kg |
| **Sepsis / shock** | Ketamine 1-2 mg/kg (reduced dose in severe shock: 0.5-1 mg/kg) | Rocuronium 1.2 mg/kg | None |
| **Status asthmaticus** | Ketamine 1.5-2 mg/kg | Rocuronium 1.2 mg/kg | Lidocaine 1 mg/kg |
| **Status epilepticus** | Propofol 1-2 mg/kg OR Midazolam 0.2-0.3 mg/kg | Rocuronium 1.2 mg/kg | None |

### Post-Intubation
- Confirm placement: **ETCO2 waveform** (gold standard), chest rise, bilateral breath sounds
- Secure ETT; note depth at teeth/lip
- CXR for ETT position
- Initiate sedation/analgesia infusion (e.g., fentanyl 1-2 mcg/kg/hr + midazolam 0.1 mg/kg/hr)

---

## SOURCES

### AHA / PALS 2025 Guidelines
- [AHA 2025 Pediatric Cardiac Arrest Algorithm PDF](https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-PALS-CA-250123.pdf)
- [Part 8: Pediatric Advanced Life Support — 2025 AHA/AAP Guidelines (Circulation)](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001368)
- [Part 6: Pediatric Basic Life Support — 2025 AHA/AAP Guidelines (Circulation)](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001370)
- [AHA 2025 Pediatric Bradycardia Algorithm PDF](https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-PALS-Bradycardia-250121.pdf)
- [AHA 2025 Pediatric Tachyarrhythmia Algorithm PDF](https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-PALS-Tachyarrhythmia-250117.pdf)
- [PALS Algorithms Overview — acls-pals-bls.com](https://www.acls-pals-bls.com/algorithms/pals/)

### Neonatal Resuscitation
- [Neonatal Life Support: 2025 ILCOR CoSTR (Circulation)](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001363)
- [NRP Algorithm Guide — aclscertification.org](https://aclscertification.org/neonatal-resuscitation-algorithm/)
- [NRP 8th Edition Algorithm PDF](https://emlrc.org/wp-content/uploads/NRP-8th-ed-ITK_Algorithm.pdf)
- [2024 NRP Update — ABEM Key Advances](https://www.abem.org/wp-content/uploads/2024/07/key-advances_-nrp_clinical-policy-alert.pdf)

### Pediatric Sepsis
- [SSC Pediatric Guidelines 2020 (Pediatric Critical Care Medicine)](https://journals.lww.com/pccmjournal/fulltext/2020/02000/surviving_sepsis_campaign_international_guidelines.20.aspx)
- [Phoenix Sepsis Score 2024 — International Consensus Criteria](https://ilas.org.br/wp-content/uploads/2024/01/International-Consensus-Criteria-for-Pediatric-Sepsis-and-Septic-Shock-2024.pdf)
- [Pediatric Sepsis Diagnosis, Management — AAP Pediatrics 2024](https://publications.aap.org/pediatrics/article/153/1/e2023062967/196195/Pediatric-Sepsis-Diagnosis-Management-and-Sub)

### Status Epilepticus
- [Management of Pediatric Status Epilepticus (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4110742/)
- [Midazolam Infusions for Pediatric RSE — Frontiers in Pediatrics 2025](https://www.frontiersin.org/journals/pediatrics/articles/10.3389/fped.2025.1507325/full)
- [Status Epilepticus Guideline — Texas Children's Hospital](https://www.texaschildrens.org/sites/default/files/uploads/documents/outcomes/standards/Status%20Epilepticus%20Guideline%20Final.pdf)
- [Pediatric Status Epilepticus Key Advance — ABEM 2024](https://www.abem.org/wp-content/uploads/2024/10/Key-Advances_Pediatric-Status-Epilepticus_Practice-Advance.pdf)

### Anaphylaxis
- [CHOP Anaphylaxis Clinical Pathway (revised Nov 2024)](https://www.chop.edu/clinical-pathway/anaphylaxis-emergent-care-clinical-pathway)
- [AAP: Epinephrine for First-aid Management of Anaphylaxis (reaffirmed 2024)](https://publications.aap.org/pediatrics/article/139/3/e20164006/53753/Epinephrine-for-First-aid-Management-of)
- [Updated Anaphylaxis Guidelines: Infants and Children (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8236874/)
- [AAAAI 2023 Anaphylaxis in Practice Guide](https://www.aaaai.org/Aaaai/media/Media-Library-PDFs/Allergist%20Resources/Statements%20and%20Practice%20Parameters/Anaphylaxis-in-Practice-2023.pdf)

### Pediatric DKA
- [Barbara Davis Center 2024-2025 DKA Treatment Protocol](https://www.ucdenver.edu/docs/librariesprovider48/bdc-web-handouts/bdc_dkatreatmentprotocol_2024.pdf)
- [Current Recommendations — Canadian Paediatric Society](https://cps.ca/en/documents/position/current-recommendations-for-management-of-paediatric-diabetic-ketoacidosis)
- [BSPED DKA Guideline](https://www.bsped.org.uk/media/v2ydcuv0/bsped-dka-guideline-v3.pdf)
- [BC Children's Hospital DKA Protocol (Dec 2024)](https://www.bcchildrens.ca/sites/g/files/qpdaav156/files/2024-12/DKA-medical-protocol.pdf)

### Pediatric RSI
- [Current Practices and Safety of Medication Use During Pediatric RSI (PMC 2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10849688/)
- [RSI Drug Chart — UNC Pediatrics](https://www.med.unc.edu/pediatrics/cccp/wp-content/uploads/sites/1156/2021/02/RSI-drug-chart-final-6.9.16.pdf)
- [Rapid Sequence Intubation — LITFL](https://litfl.com/rapid-sequence-intubation-rsi/)
- [RSI — WikEM](https://wikem.org/wiki/Rapid_sequence_intubation)
