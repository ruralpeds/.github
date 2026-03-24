import { useState, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from "recharts";

// ════════════════════════════════════════════════════════════
// EDUCATIONAL CONTENT DATABASE — Keyed by topic ID
// Each entry: { title, category, content (array of sections) }
// ════════════════════════════════════════════════════════════

const EDU = {
  aap2018: {
    title: "AAP 2018 Maintenance IVF Guideline",
    cat: "Guideline",
    icon: "📋",
    sections: [
      { h: "What Changed?", t: "For 60 years (1957–2018), pediatric IVF practice was based on the Holliday-Segar formula which calculated electrolyte needs from human milk composition — producing D5 0.2% NaCl, a fluid that is 78% electrolyte-free water. The AAP 2018 guideline ended this practice after evidence of preventable hyponatremic deaths." },
      { h: "The Evidence", t: "17 randomized controlled trials involving 2,455 patients demonstrated that isotonic fluids (0.9% NaCl or balanced crystalloids) significantly reduced hospital-acquired hyponatremia compared to hypotonic fluids. The NNT was 7.5 to prevent one case of hyponatremia." },
      { h: "Key Action Statement", t: "Children aged 28 days to 18 years requiring maintenance IVF should receive ISOTONIC solutions with appropriate KCl and dextrose. This is a Grade B (Strong) recommendation. Acceptable fluids: D5NS, D5LR, or D5 Plasma-Lyte." },
      { h: "Why Hypotonic Fluids Were Dangerous", t: "Hospitalized children have non-osmotic ADH stimulation from pain, nausea, surgery, fever, and illness. ~30% of febrile hospitalized children meet SIADH criteria. Elevated ADH impairs free-water excretion. When hypotonic fluids deliver large volumes of electrolyte-free water that kidneys cannot clear, dilutional hyponatremia results. Children are especially vulnerable due to their larger brain-to-skull ratio." },
      { h: "Exceptions", t: "The guideline explicitly EXCLUDES: neonates <28 days, cardiac disease, hepatic disease, renal disease, neurosurgical patients, DKA, and burns. These populations require disease-specific protocols." },
      { h: "Clinical Pearl", t: "Even with isotonic fluids, hyponatremia still occurred in 0–23% of patients in the trials. Serial sodium monitoring (starting at 6–12h) remains essential. The guideline did NOT find increased hypernatremia with isotonic fluids." },
    ],
    refs: ["Feld LG et al. Pediatrics 2018;142(6):e20183083. PMID: 30478247", "Moritz ML, Ayus JC. Pediatrics 2003;111(2):227-230. PMID: 12563043"]
  },
  hollidaySegar: {
    title: "Holliday-Segar Formula (4-2-1 Rule)",
    cat: "Calculation",
    icon: "🧮",
    sections: [
      { h: "Origin", t: "Published in 1957 by Holliday and Segar in Pediatrics. They calculated water needs from caloric expenditure: 1 mL of water per 1 kcal metabolized. Their key insight was that metabolic rate correlates with body surface area, not body weight — but they created a weight-based approximation for clinical convenience." },
      { h: "The 4-2-1 Rule (Hourly)", t: "• First 10 kg: 4 mL/kg/hr\n• Next 10 kg (11–20 kg): 2 mL/kg/hr\n• Each kg above 20 kg: 1 mL/kg/hr\n\nExample: 25 kg child = 40 + 20 + 5 = 65 mL/hr" },
      { h: "Daily Calculation", t: "• First 10 kg: 100 mL/kg/day\n• Next 10 kg: 50 mL/kg/day\n• Each kg above 20 kg: 20 mL/kg/day\n\nExample: 25 kg child = 1000 + 500 + 100 = 1600 mL/day" },
      { h: "When to Modify", t: "INCREASE (+12% per °C above 37°C): fever, burns, high-output states\nDECREASE to 2/3: SIADH, post-operative (ADH elevation persists ≥3 days), increased ICP, heart failure\nDECREASE to 1/2: severe SIADH, anuria (insensible losses only = ~400 mL/m²/day)" },
      { h: "Obesity Consideration", t: "Use IDEAL body weight for obese patients. Adipose tissue has ~10% water content versus ~73% for lean tissue. The original formula was derived from non-obese caloric expenditure. Maximum daily cap is ~2,400 mL/day for large adolescents." },
      { h: "Important Limitation", t: "The Holliday-Segar formula estimates WATER needs only. The original electrolyte estimate (3 mEq Na/100 kcal from breast milk composition) led to hypotonic fluid use — which the AAP 2018 guideline now rejects. Use the formula for RATE, but choose ISOTONIC fluid for composition." },
    ],
    refs: ["Holliday MA, Segar WE. Pediatrics 1957;19(5):823-832. PMID: 13431307"]
  },
  resuscitation: {
    title: "Fluid Resuscitation & Septic Shock",
    cat: "Emergency",
    icon: "🚨",
    sections: [
      { h: "Surviving Sepsis Campaign 2020 (Pediatric)", t: "In RESOURCE-RICH settings with ICU: 10–20 mL/kg isotonic crystalloid over 5–20 minutes. Reassess after each bolus. May repeat up to 40–60 mL/kg in the first hour. If shock persists → fluid-refractory → start vasopressors (epinephrine for cold shock, norepinephrine for warm shock)." },
      { h: "The FEAST Trial (2011) — Context Matters", t: "Maitland et al. randomized 3,141 febrile children in East Africa. Mortality was HIGHER with bolus fluids: 10.5% (saline bolus) vs 7.3% (no bolus) — a 45% relative increase. BUT: 57% had malaria, no ICU/ventilator support existed. This applies to resource-LIMITED settings, not resource-rich. SSC 2020 now differentiates recommendations by setting." },
      { h: "Balanced Crystalloids vs Normal Saline", t: "The SMART trial (2018, 15,802 adults) showed balanced crystalloids reduced the composite of death/RRT/persistent renal dysfunction: 14.3% vs 15.4% (OR 0.90). Mechanism: NS delivers 154 mEq/L chloride (50% above plasma) causing hyperchloremic acidosis, renal vasoconstriction, and reduced GFR. SSC 2020 'suggests' balanced crystalloids over NS (weak recommendation)." },
      { h: "Cold vs Warm Shock", t: "COLD SHOCK (most common in children, ~60–80%): Low cardiac output, high SVR. Signs: cool/mottled extremities, weak pulses, prolonged cap refill. Treat: epinephrine.\nWARM SHOCK (~20%): High cardiac output, low SVR. Signs: warm/flushed skin, bounding pulses, flash cap refill. Treat: norepinephrine." },
      { h: "When to Stop Bolusing", t: "Fluid overload signs: hepatomegaly, new rales, periorbital edema, weight gain >10%, gallop rhythm, worsening oxygenation, rising CVP. POCUS may help: IVC collapsibility <50% suggests adequate volume; lung B-lines suggest overload." },
      { h: "Clinical Pearl", t: "The first hour is the 'golden hour' of sepsis. Every hour of delay in antibiotic administration increases mortality by ~8%. Fluid resuscitation should happen SIMULTANEOUSLY with antibiotic administration — not sequentially." },
    ],
    refs: ["Weiss SL et al. Pediatr Crit Care Med 2020;21(2):e52-e106. PMID: 32032273", "Maitland K et al. NEJM 2011;364(26):2483-2495. PMID: 21615299", "Semler MW et al. NEJM 2018;378(9):829-839. PMID: 29485925"]
  },
  dehydration: {
    title: "Pediatric Dehydration Assessment & Correction",
    cat: "Assessment",
    icon: "💧",
    sections: [
      { h: "Severity Classification", t: "Mild (3–5%): slightly dry mouth, mild thirst, normal vitals\nModerate (6–9%): dry mucous membranes, tachycardia, decreased skin turgor, sunken eyes, decreased tears, cap refill 2–3 sec\nSevere (≥10%): very dry, marked tachycardia, mottled/cool skin, absent tears, cap refill >3s, lethargy, hypotension (LATE)" },
      { h: "Best Clinical Signs (Steiner 2004)", t: "No single sign is diagnostic. Best individual likelihood ratios for ≥5% dehydration:\n• Prolonged capillary refill: LR+ 4.1\n• Abnormal skin turgor: LR+ 2.5\n• Abnormal respiratory pattern: LR+ 2.0\nGorelick 4-item scale (≥2 of: dry MM, no tears, ill appearance, cap refill >2s) = ≥5% dehydrated." },
      { h: "Oral Rehydration is FIRST LINE", t: "ORT is successful in >90% of mild-moderate dehydration. WHO ORS (245 mOsm/L): Na 75, K 20, glucose 75 mmol/L. Dose: 50 mL/kg (mild) to 75–100 mL/kg (moderate) over 4 hours. Small frequent sips if vomiting. Ondansetron 0.15 mg/kg PO reduces IV need from 31% to 14% (Freedman, NEJM 2006)." },
      { h: "IV Deficit Replacement Formula", t: "Deficit (mL) = % dehydration × weight (kg) × 10\nExample: 5% dehydrated, 15 kg child = 5 × 15 × 10 = 750 mL deficit\n\nPhase 1: Resuscitate (20 mL/kg NS bolus if hemodynamically unstable)\nPhase 2: Replace 50% of remaining deficit over first 8h + 1/3 daily maintenance\nPhase 3: Replace remaining 50% over next 16h + 2/3 daily maintenance" },
      { h: "Sodium-Specific Correction Rates — CRITICAL SAFETY", t: "HYPERNATREMIC (Na >150): Correct ≤0.5 mEq/L per hour (≤10–12 mEq/L per 24h). Use D5 0.45NS or D5 0.2NS. Target 48–72h total correction. Brain generates idiogenic osmoles that take days to dissipate — rapid correction shifts water INTO brain cells → cerebral edema.\n\nHYPONATREMIC (Na <130): Correct ≤8–10 mEq/L in first 24h. Rapid correction → osmotic demyelination syndrome (ODS). For seizures: 3% NaCl 3–5 mL/kg over 10–20 min." },
      { h: "Clinical Pearl", t: "The most common mistake is overestimating dehydration severity. Steiner's meta-analysis showed clinical assessment has only moderate accuracy. When in doubt, try ORT first — it works in the vast majority of cases and avoids the risks and costs of IV access." },
    ],
    refs: ["Steiner MJ et al. JAMA 2004;291(22):2746-2754. PMID: 15187057", "Freedman SB et al. NEJM 2006;354(16):1698-1705. PMID: 16625009", "Gorelick MH et al. Pediatrics 1997;99(5):E6. PMID: 9113963"]
  },
  periop: {
    title: "Perioperative Fluid Management",
    cat: "Surgical",
    icon: "🏥",
    sections: [
      { h: "NPO Deficit Calculation", t: "Deficit = Maintenance rate × hours NPO\nModern fasting guidelines (ESA 2022): clear fluids up to 1–2 hours pre-op, breast milk 4h, formula/solids 6h. This reduces NPO deficits substantially versus traditional midnight NPO." },
      { h: "Furman Replacement Method", t: "Replace NPO deficit: 50% in 1st hour, 25% in 2nd hour, 25% in 3rd hour.\nMany modern anesthesiologists now simply give 20–40 mL/kg isotonic crystalloid during surgery + PACU without formal deficit calculation." },
      { h: "Intraoperative Fluids", t: "Run at 2/3 to full maintenance rate with isotonic crystalloid (LR preferred). Third-space losses vary by surgery type:\n• Minor (hernia, circumcision): 2–4 mL/kg/hr\n• Moderate (orthopedic, urologic): 4–6 mL/kg/hr\n• Major (abdominal, thoracic): 6–10 mL/kg/hr" },
      { h: "Blood Loss Management", t: "Estimated blood volumes by age: neonate 80–90 mL/kg, infant 80 mL/kg, child 70–75 mL/kg, adolescent 65–70 mL/kg. Transfusion trigger: Hgb 7–8 g/dL (TRIPICU trial). Replace with crystalloid 3:1 or colloid/PRBCs 1:1." },
      { h: "Post-Operative", t: "Use D5NS + KCl 20 mEq/L at maintenance rate (isotonic per AAP 2018). ADH elevation persists ≥3 days post-surgery → hypotonic fluids are dangerous post-operatively. Transition to oral as early as possible." },
      { h: "Pediatric ERAS", t: "Enhanced Recovery After Surgery in children emphasizes: shortened fasting, goal-directed fluid therapy, early oral intake, minimized opioids, and early mobilization. Reduces LOS and complications." },
    ],
    refs: ["Rove KO et al. Paediatr Anaesth 2018;28(6):482-492. PMID: 29752858", "Lacroix J et al. NEJM 2007;356(16):1609-1619. PMID: 17442904"]
  },
  dka: {
    title: "DKA Fluid Management",
    cat: "Endocrine",
    icon: "🩸",
    sections: [
      { h: "DKA Classification", t: "Mild: pH 7.2–7.3, bicarb 10–15\nModerate: pH 7.1–7.2, bicarb 5–10\nSevere: pH <7.1, bicarb <5\n\nAll require IV insulin AND fluid resuscitation. Key: fix the dehydration and acidosis, NOT just the glucose." },
      { h: "Initial Fluid (ISPAD 2022)", t: "NS 10–20 mL/kg bolus over 20–30 minutes ONLY if hemodynamically compromised. Avoid aggressive bolusing (>40 mL/kg total). After stabilization: 1–1.5× maintenance rate, with deficit replaced evenly over 24–48 hours." },
      { h: "The Two-Bag System", t: "Two bags connected via Y-connector, both running through the same IV at a constant total rate:\n• Bag 1: NS + KCl (NO dextrose)\n• Bag 2: D10 + NS + KCl\nTitrate the RATIO to maintain BG 150–250 mg/dL while continuing insulin to clear ketones. Response time drops from ~42 min (traditional bag changes) to ~1 min." },
      { h: "PECARN FLUID Trial (2018) — Paradigm Shift", t: "Kuppermann et al. randomized 1,255 children in a 2×2 factorial: rapid vs slow rehydration × 0.9% vs 0.45% NaCl. Result: NO significant difference in GCS decline or clinically apparent brain injury with ANY approach. This challenges 20+ years of dogma about aggressive fluids causing cerebral edema in DKA." },
      { h: "Cerebral Edema: What We Now Know", t: "Occurs in 0.5–1% of pediatric DKA with 21–25% mortality. Current understanding: cerebral injury is caused by neuroinflammation and ischemia-reperfusion AT PRESENTATION, not osmotic fluid shifts from treatment. Risk factors: younger age, new-onset diabetes, severe acidosis, elevated BUN.\n\nMuir Criteria (92% sensitive, 96% specific):\nDiagnostic: abnormal motor/verbal response to pain, decorticate/decerebrate posture, CN palsy, abnormal breathing\nMajor: altered mentation, sustained HR deceleration, age-inappropriate incontinence\nMinor: vomiting, headache, lethargy, DBP >90 mmHg, age <5yr" },
      { h: "Treatment of Cerebral Edema", t: "Mannitol 0.5–1 g/kg IV over 15–20 min OR 3% NaCl 2.5–5 mL/kg over 10–15 min. Elevate HOB 30°. Reduce fluid rate by 1/3. Avoid aggressive hyperventilation. CT scan when stable." },
    ],
    refs: ["Kuppermann N et al. NEJM 2018;378(24):2275-2287. PMID: 29897851", "Glaser N et al. ISPAD 2022. PMID: 36250645", "Glaser N et al. NEJM 2001;344(4):264-269. PMID: 11172153"]
  },
  siadhCsw: {
    title: "SIADH vs Cerebral Salt Wasting",
    cat: "Neurosurgical",
    icon: "🧠",
    sections: [
      { h: "Why This Matters — Opposite Treatments", t: "Both present with hyponatremia, elevated urine Na (>40 mEq/L), and low serum osmolality. But:\n• SIADH → RESTRICT fluids (50–67% maintenance)\n• CSW → EXPAND volume with NS (1.5–2× maintenance)\n\nTreating CSW with restriction worsens hypovolemia and threatens cerebral perfusion. Getting this wrong is dangerous." },
      { h: "SIADH Diagnostic Criteria", t: "• Serum osmolality <280 mOsm/kg\n• Urine osmolality >100 mOsm/kg (inappropriately concentrated)\n• Urine Na >40 mEq/L\n• Euvolemic or slightly hypervolemic (normal skin turgor, no edema, normal BP)\n• Normal thyroid, adrenal, renal function\n• No diuretic use" },
      { h: "CSW Diagnostic Criteria", t: "Labs LOOK like SIADH but:\n• Patient is HYPOVOLEMIC (dry mucous membranes, tachycardia, orthostatic hypotension, weight loss)\n• POLYURIA (high urine output despite hyponatremia)\n• Negative fluid balance\n• BUN may be elevated (hemoconcentration)\n• Low CVP" },
      { h: "The FEurate Test — Most Reliable Differentiator", t: "Fractional excretion of uric acid (FEurate):\n• SIADH: Elevated during hyponatremia but NORMALIZES (4–11%) after Na correction\n• CSW: Remains ELEVATED (>11%) even after Na correction\n\nThis is the single most reliable discriminator when volume status is ambiguous." },
      { h: "If Uncertain — Default to CSW Treatment", t: "When the diagnosis is unclear, treat as CSW (volume expansion with NS). This is SAFER because:\n1. Volume expansion won't harm a euvolemic SIADH patient as much as restriction harms a hypovolemic CSW patient\n2. Response to treatment is diagnostic — if Na improves with NS, it's likely CSW; if it worsens, switch to restriction for SIADH" },
      { h: "Hypertonic Saline (3% NaCl) for Emergencies", t: "For hyponatremic seizures or severe neurologic symptoms:\n3–5 mL/kg over 10–20 minutes. This raises Na ~4–6 mEq/L acutely and reliably stops seizures when anticonvulsants alone fail.\n\nCRITICAL: Total correction must NOT exceed 8–10 mEq/L in 24 hours (chronic hyponatremia) to prevent osmotic demyelination syndrome (ODS)." },
    ],
    refs: ["Bardanzellu F et al. Pediatr Nephrol 2022;37(7):1469-1478. PMID: 34468821", "Sarnaik AP et al. Crit Care Med 1991;19(6):758-762. PMID: 2055051"]
  },
  burns: {
    title: "Burns Fluid Resuscitation in Children",
    cat: "Trauma",
    icon: "🔥",
    sections: [
      { h: "Parkland Formula", t: "4 mL × body weight (kg) × %TBSA burned = total 24-hour volume of Lactated Ringer's\n\nDeliver: FIRST HALF in the first 8 hours from TIME OF BURN (not time of presentation), SECOND HALF over the next 16 hours.\n\nCritical: Calculate from TIME OF BURN, not arrival to ED." },
      { h: "Pediatric Modification", t: "Children <20 kg have limited glycogen stores and are prone to hypoglycemia. ADD maintenance fluids with D5LR alongside Parkland resuscitation volume.\n\nTotal = Parkland volume (LR) + Maintenance volume (D5LR)" },
      { h: "Galveston Formula (Alternative for Children)", t: "5,000 mL/m² TBSA burned + 2,000 mL/m² total BSA\n\nMay be more physiologic for children given their higher body surface area-to-mass ratio. Accounts for both burn losses AND maintenance needs in a single formula." },
      { h: "TBSA Estimation — Use Lund-Browder", t: "Children's proportions differ from adults:\n• Head: 19% (infant) vs 7% (adult)\n• Lower extremity: 14% (infant) vs 18% (adult)\n• Palmar surface of child's hand ≈ 1% TBSA\n\nNEVER use the 'Rule of Nines' in children <14 years — it is inaccurate." },
      { h: "Urine Output Targets", t: "Pediatric UOP goal: 1–2 mL/kg/hr (HIGHER than adults at 0.5–1 mL/kg/hr). This is the PRIMARY titration endpoint.\n\nIf UOP too low: increase rate by 25%. If UOP too high: decrease rate by 25%. Avoid overcorrection in either direction." },
      { h: "Fluid Creep — Avoid Over-Resuscitation", t: "Fluid creep = administering more than calculated Parkland volumes. Causes:\n• Abdominal compartment syndrome\n• Pulmonary edema\n• Extremity compartment syndrome\n• Orbital compartment syndrome\n\nColloids (5% albumin) after 12–24h may reduce total crystalloid requirements." },
    ],
    refs: ["Romanowski KS, Palmieri TL. Burns Trauma 2017;5:26. PMID: 28795058", "Saffle JIL. J Burn Care Res 2007;28(3):382-395. PMID: 17438489"]
  },
  cardiac: {
    title: "Post-Cardiac Surgery Fluid Management",
    cat: "Cardiac",
    icon: "❤️",
    sections: [
      { h: "Why Restrict?", t: "Cardiopulmonary bypass (CPB) triggers a massive systemic inflammatory response: complement activation (C3a, C5a), cytokine release (IL-6, IL-8, TNF-α), and endothelial injury → CAPILLARY LEAK SYNDROME. Fluid shifts from intravascular to interstitial space → tissue edema despite intravascular depletion." },
      { h: "Standard Protocol", t: "50–75% of maintenance for first 24–48 hours post-bypass. Use concentrated fluids: D10 0.45NS or D10NS to maximize caloric support in restricted volumes. Reassess daily." },
      { h: "Fluid Overload is Dangerous", t: "~50% of infants develop >10% fluid overload after cardiac surgery. This is independently associated with:\n• Increased mortality\n• Prolonged mechanical ventilation\n• Acute kidney injury\n• Longer ICU/hospital stay" },
      { h: "Diuretic Strategy", t: "Furosemide 0.5–1 mg/kg IV q6–12h (bolus) or 0.1–0.4 mg/kg/hr (continuous infusion) when hemodynamically stable. Target net NEGATIVE fluid balance by POD 2–3.\n\nProphylactic peritoneal dialysis post-CPB may outperform furosemide in preventing fluid overload (Kwiatkowski, JAMA Pediatr 2017)." },
      { h: "Colloid Considerations", t: "5% albumin (10–20 mL/kg) for persistent hypotension unresponsive to crystalloid bolus. Fresh frozen plasma if coagulopathy present. Blood products for Hgb <8–10 (higher threshold post-cardiac vs general surgery)." },
    ],
    refs: ["Lex DJ et al. Pediatr Crit Care Med 2016;17(4):307-314. PMID: 26890200", "Kwiatkowski DM et al. JAMA Pediatr 2017;171(4):357-364. PMID: 28241247"]
  },
  renal: {
    title: "Renal Disease & Nephrotic Syndrome",
    cat: "Nephrology",
    icon: "🫘",
    sections: [
      { h: "Nephrotic Syndrome — Don't Over-Hydrate", t: "Nephrotic patients are INTRAVASCULARLY depleted but TOTAL BODY OVERLOADED. Aggressive IV crystalloid worsens third-spacing and edema without improving intravascular volume." },
      { h: "Albumin-Furosemide Protocol", t: "For symptomatic edema (respiratory distress, scrotal/labial swelling, skin breakdown):\n1. 25% albumin 0.5–1 g/kg IV over 2–4 hours\n2. Furosemide 1–2 mg/kg IV given IMMEDIATELY after albumin completes\n\nAlbumin transiently raises oncotic pressure → mobilizes interstitial fluid → furosemide then excretes it. Albumin WITHOUT furosemide risks acute pulmonary edema." },
      { h: "FeNa Guides Volume Status", t: "FeNa <0.2%: Intravascular volume DEPLETED → needs albumin expansion before diuretics\nFeNa ≥0.2%: Intravascular volume adequate → safe for diuretics alone (Kapur et al. 2009)" },
      { h: "Acute Kidney Injury (AKI)", t: "Restrict fluids to: Insensible losses (~400 mL/m²/day) + measured urine output\nWithhold potassium until serum K⁺ known\nUse D10W or D10 0.2NS (avoid NS if hyperchloremic)\nFluid overload >10% body weight → 4.34× mortality increase in critically ill children" },
      { h: "Chronic Kidney Disease (CKD)", t: "Individualize based on GFR, volume status, electrolytes:\n• Avoid NS in hyperchloremic acidosis (use LR or bicarb)\n• Restrict K⁺ and phosphorus in advanced CKD\n• May need free-water restriction or expansion depending on stage" },
    ],
    refs: ["Kapur G et al. CJASN 2009;4(5):907-913. PMID: 19406963", "Alobaidi R et al. JAMA Pediatr 2018;172(3):257-268. PMID: 29356810"]
  },
  fluidTypes: {
    title: "IV Fluid Types & Composition",
    cat: "Pharmacology",
    icon: "💉",
    sections: [
      { h: "Isotonic Crystalloids (Recommended for Maintenance)", t: "0.9% NaCl (Normal Saline): Na 154, Cl 154, Osm 308. Simple, widely available, but high chloride load → risk of hyperchloremic metabolic acidosis with large volumes.\n\nLactated Ringer's: Na 130, Cl 109, K 4, Ca 2.7, Lactate 28, Osm 273. More physiologic chloride content. Contains small amounts of K and Ca — safe in most patients but avoid mixing with citrated blood products.\n\nPlasma-Lyte: Na 140, Cl 98, K 5, Osm 294. Closest to plasma composition. No Ca (safe with blood products). Uses acetate/gluconate as buffer." },
      { h: "Hypotonic Solutions (Use With Caution)", t: "D5 0.45% NaCl: Na 77. Previously standard maintenance. NOW: only for specific dysnatremia correction (hypernatremic dehydration).\n\nD5 0.2% NaCl: Na 34. Very hypotonic. High risk for hospital-acquired hyponatremia. Rarely indicated.\n\nD5W: Na 0. Physiologically equivalent to FREE WATER after glucose metabolism. Useful for free-water deficit correction in hypernatremia." },
      { h: "Hypertonic Solutions", t: "3% NaCl: Na 513, Osm 1026. Emergency treatment for symptomatic hyponatremia (seizures). Also used for raised ICP. Dose: 3–5 mL/kg over 10–20 min.\n\nIMPORTANT: Dextrose is a 'hidden' tonicity modifier. D5W has actual osmolality 252, but EFFECTIVE osmolality of ~0 because glucose is metabolized intracellularly. D5NS (560 mOsm/L in the bag) functions as isotonic (~308 mOsm/L effective) after glucose metabolism." },
      { h: "Potassium Supplementation Rules", t: "Maintenance: 1–2 mEq/kg/day (typically 20 mEq/L in maintenance fluids)\nNEVER give as IV push — cardiac arrest risk\nMax peripheral concentration: 40 mEq/L\nMax central line concentration: 60–80 mEq/L\nMax infusion rate: 0.5 mEq/kg/hr with cardiac monitoring\nAlways confirm adequate UOP before adding K⁺ to fluids" },
    ],
    refs: ["Feld LG et al. Pediatrics 2018;142(6):e20183083", "Semler MW et al. SMART Trial. NEJM 2018;378:829-839"]
  },
  naCorrection: {
    title: "Sodium Correction Safety Limits",
    cat: "Safety",
    icon: "⚠️",
    sections: [
      { h: "Hypernatremia (Na >150)", t: "Correction rate: ≤0.5 mEq/L per HOUR (≤10–12 mEq/L per 24 hours)\nTotal correction time: 48–72 hours\nFluid: D5 0.45NS or D5 0.2NS\nCheck Na every 4–6 hours during correction\n\nRisk of rapid correction: CEREBRAL EDEMA. Brain cells generate idiogenic osmoles (myo-inositol, taurine, glutamine) that take up to 36 DAYS to fully dissipate. Rapid Na correction shifts water into brain cells faster than osmoles can exit." },
      { h: "Hyponatremia (Na <130)", t: "Correction rate: ≤8–10 mEq/L in first 24 hours\nFluid: Isotonic (NS) for most cases\nFor seizures: 3% NaCl 3–5 mL/kg over 10–20 min (can repeat once)\nCheck Na every 2–4 hours during active correction\n\nRisk of rapid correction: OSMOTIC DEMYELINATION SYNDROME (ODS). Myelin in the central pons is particularly vulnerable to osmotic stress. Presents 2–6 days after over-correction with dysarthria, dysphagia, quadriplegia, locked-in syndrome." },
      { h: "Free Water Deficit (Hypernatremia)", t: "FWD (L) = 0.6 × Weight (kg) × [(Na/140) − 1]\nReplace slowly over 48–72h using D5W or D5 0.2NS." },
      { h: "Sodium Deficit (Hyponatremia)", t: "Na deficit (mEq) = 0.6 × Weight (kg) × (Desired Na − Current Na)\nUse NS or 3% NaCl depending on severity and symptoms." },
      { h: "Clinical Decision Point", t: "The SPEED of onset determines SPEED of correction:\n• ACUTE (<48h onset): Can correct faster (up to 1–2 mEq/L/hr initially) because brain has not yet adapted\n• CHRONIC (>48h or unknown): MUST correct slowly to avoid ODS\n• When in doubt, assume CHRONIC and correct slowly" },
    ],
    refs: ["Lee JH et al. NEJM 1994;331:439-442. PMID: 8035845", "Sarnaik AP et al. Crit Care Med 1991;19(6):758-762. PMID: 2055051"]
  }
};

// ════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════

export default function PedIVFEducational() {
  const [weight, setWeight] = useState(15);
  const [activeTopic, setActiveTopic] = useState(null);
  const [view, setView] = useState("tree");

  const maint = useMemo(() => {
    if (weight <= 0) return { hr: 0, day: 0 };
    let d = weight <= 10 ? weight * 100 : weight <= 20 ? 1000 + (weight-10)*50 : 1500 + (weight-20)*20;
    return { hr: Math.round((d/24)*10)/10, day: Math.round(d) };
  }, [weight]);

  const openEdu = useCallback((id) => setActiveTopic(id), []);
  const closeEdu = useCallback(() => setActiveTopic(null), []);

  const topic = activeTopic ? EDU[activeTopic] : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(155deg, #06090f 0%, #0c1220 50%, #080c16 100%)", color: "#d4dce8", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 16, position: "relative" }}>

      {/* ═══ MODAL OVERLAY ═══ */}
      {topic && (
        <div onClick={closeEdu} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f1629", border: "1px solid #1e2d4a", borderRadius: 14, maxWidth: 640, width: "100%", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a2236", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: 20, marginRight: 8 }}>{topic.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#60a5fa", background: "rgba(59,130,246,0.15)", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{topic.cat}</span>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#e8edf5", margin: "6px 0 0", lineHeight: 1.3 }}>{topic.title}</h2>
              </div>
              <button onClick={closeEdu} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2236", borderRadius: 6, color: "#5a6b82", fontSize: 16, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
            </div>

            {/* Modal Body — Scrollable */}
            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
              {/* Patient-specific calculation badge */}
              <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 14, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 10, color: "#34d399" }}>
                <span><strong>Patient:</strong> {weight} kg</span>
                <span><strong>Maint:</strong> {maint.hr} mL/hr ({maint.day} mL/day)</span>
                <span><strong>Bolus 20:</strong> {Math.round(weight*20)} mL</span>
                <span><strong>2/3 Maint:</strong> {Math.round(maint.day*2/3)} mL/day</span>
              </div>

              {topic.sections.map((s, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#e8edf5", margin: "0 0 5px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 5, background: "rgba(59,130,246,0.15)", color: "#60a5fa", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
                    {s.h}
                  </h4>
                  <div style={{ fontSize: 12, color: "#8892a8", lineHeight: 1.7, whiteSpace: "pre-line", paddingLeft: 26 }}>{s.t}</div>
                </div>
              ))}

              {/* References */}
              {topic.refs && (
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #1a2236" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#5a6b82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Key References</div>
                  {topic.refs.map((r, i) => (
                    <div key={i} style={{ fontSize: 10, color: "#4b5a70", lineHeight: 1.5, marginBottom: 3 }}>
                      <span style={{ color: "#60a5fa" }}>[{i+1}]</span> {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "10px 20px", borderTop: "1px solid #1a2236", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: "#3b4a63" }}>For educational and clinical reference — not a substitute for clinical judgment</span>
              <button onClick={closeEdu} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid #3b82f6", background: "rgba(59,130,246,0.15)", color: "#60a5fa", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <h1 style={{ fontSize: 19, fontWeight: 700, color: "#e8edf5", margin: 0 }}>Pediatric IVF Clinical Decision Support</h1>
        <p style={{ fontSize: 10, color: "#4b5a70", margin: "3px 0 0" }}>AAP 2018 • SSC 2020 • ISPAD 2022 — Tap any <span style={{ color: "#60a5fa" }}>Learn</span> button for educational content</p>
      </div>

      {/* Weight + View Toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 140px" }}>
          <label style={{ fontSize: 9, color: "#5a6b82", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 3 }}>Patient Weight (kg)</label>
          <input type="number" value={weight} min={2} max={120} step={0.5} onChange={e => setWeight(Number(e.target.value))} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #1a2236", background: "#0a0f1e", color: "#e8edf5", fontSize: 14, fontWeight: 600, boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["tree","topics","calc"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${view===v?"#3b82f6":"#1a2236"}`, background: view===v?"rgba(59,130,246,0.12)":"rgba(10,15,30,0.6)", color: view===v?"#60a5fa":"#5a6b82", fontSize: 10, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{v === "tree" ? "Decision Tree" : v === "topics" ? "Topic Library" : "Quick Calc"}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          <Pill c="#10b981">{maint.hr} mL/hr</Pill>
          <Pill c="#3b82f6">{maint.day} mL/day</Pill>
        </div>
      </div>

      {/* ═══ DECISION TREE VIEW ═══ */}
      {view === "tree" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <TreeNode c="#3b82f6" tag="ASSESS" title="Child Requires IV Fluids (1mo–18yr)" sub="Evaluate: hemodynamics, hydration, NPO status, serum Na/K/Glc/Cr, UOP" edu="aap2018" onLearn={openEdu} />

          <TreeNode c="#ef4444" tag="DECISION" title="Hemodynamically Unstable?" sub="Shock, severe dehydration, or hemodynamic compromise" edu="resuscitation" onLearn={openEdu} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <TreeNode c="#ef4444" tag="YES → BOLUS" title={`NS/LR 20 mL/kg = ${Math.round(weight*20)} mL`} sub={`Over 5–20 min. Repeat ×3. Max ${Math.round(weight*60)} mL before pressors.`} edu="resuscitation" onLearn={openEdu} small />
              <TreeNode c="#f59e0b" tag="REASSESS" title="Fluid-Responsive?" sub="If no: epinephrine (cold) or norepinephrine (warm shock)" edu="resuscitation" onLearn={openEdu} small />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <TreeNode c="#10b981" tag="NO → STABLE" title="Standard Maintenance" sub={`D5NS + KCl 20 mEq/L at ${maint.hr} mL/hr (${maint.day} mL/day)`} edu="aap2018" onLearn={openEdu} small />
              <TreeNode c="#8b5cf6" tag="SPECIAL?" title="Check for Special Populations" sub="DKA · Neuro · Cardiac · Burns · Renal" edu="hollidaySegar" onLearn={openEdu} small />
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: "#5a6b82", textAlign: "center", margin: "4px 0" }}>▼ Special Population Pathways ▼</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <TreeNode c="#8b5cf6" tag="DKA" title="1–1.5× Maintenance" sub={`${Math.round(maint.day)}–${Math.round(maint.day*1.5)} mL/day. 2-bag system. PECARN: rate doesn't matter.`} edu="dka" onLearn={openEdu} small />
            <TreeNode c="#3b82f6" tag="NEURO" title="SIADH vs CSW" sub={`SIADH: restrict to ${Math.round(maint.day*0.5)}–${Math.round(maint.day*0.67)} mL/day. CSW: EXPAND with NS.`} edu="siadhCsw" onLearn={openEdu} small />
            <TreeNode c="#ef4444" tag="CARDIAC" title="50–75% Maintenance" sub={`${Math.round(maint.day*0.5)}–${Math.round(maint.day*0.75)} mL/day ×48h. Capillary leak post-CPB.`} edu="cardiac" onLearn={openEdu} small />
            <TreeNode c="#f97316" tag="BURNS" title="Parkland: 4×kg×%TBSA" sub="Half in first 8h from burn time. Add maint if <20kg. UOP 1–2 mL/kg/hr." edu="burns" onLearn={openEdu} small />
            <TreeNode c="#06b6d4" tag="RENAL" title="IWL + UOP Only" sub={`Insensible: ~400 mL/m²/day. Nephrotic: albumin + lasix, NOT bolus crystalloid.`} edu="renal" onLearn={openEdu} small />
          </div>

          <TreeNode c="#f59e0b" tag="DEHYDRATION" title="Dehydration Correction Pathway" sub={`Mild (ORT): ${Math.round(weight*50)} mL/4h | Moderate: deficit ${Math.round(5*weight*10)} mL | Severe: 20 mL/kg bolus then deficit`} edu="dehydration" onLearn={openEdu} />

          <TreeNode c="#ef4444" tag="SAFETY" title="Na Correction Rate Limits" sub="Hypernatremic: ≤0.5 mEq/L/hr. Hyponatremic: ≤8–10 mEq/L/24h. Seizures: 3% NaCl 3–5 mL/kg." edu="naCorrection" onLearn={openEdu} />

          <TreeNode c="#10b981" tag="MONITOR" title="Ongoing Assessment" sub="BMP q12–24h. Strict I&O. Daily weights. UOP 1–2 mL/kg/hr. Transition to PO when able." edu="hollidaySegar" onLearn={openEdu} />
        </div>
      )}

      {/* ═══ TOPIC LIBRARY VIEW ═══ */}
      {view === "topics" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
          {Object.entries(EDU).map(([id, t]) => (
            <button key={id} onClick={() => openEdu(id)} style={{ background: "rgba(12,18,32,0.8)", border: "1px solid #1a2236", borderRadius: 10, padding: 14, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{t.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#60a5fa", background: "rgba(59,130,246,0.12)", padding: "2px 7px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.cat}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e8edf5", marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 10, color: "#5a6b82" }}>{t.sections.length} educational sections · {t.refs?.length || 0} references</div>
            </button>
          ))}
        </div>
      )}

      {/* ═══ QUICK CALC VIEW ═══ */}
      {view === "calc" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <QCalc title="Maintenance (4-2-1)" rows={[
            ["Full maintenance", `${maint.hr} mL/hr (${maint.day} mL/day)`, "#10b981"],
            ["2/3 maintenance", `${(maint.hr*2/3).toFixed(1)} mL/hr (${Math.round(maint.day*2/3)} mL/day)`, "#f59e0b"],
            ["1/2 maintenance", `${(maint.hr/2).toFixed(1)} mL/hr (${Math.round(maint.day/2)} mL/day)`, "#f59e0b"],
            ["1.5× maintenance", `${(maint.hr*1.5).toFixed(1)} mL/hr (${Math.round(maint.day*1.5)} mL/day)`, "#3b82f6"],
          ]} eduId="hollidaySegar" onLearn={openEdu} />
          <QCalc title="Bolus Volumes" rows={[
            ["10 mL/kg", `${Math.round(weight*10)} mL`, "#f59e0b"],
            ["20 mL/kg", `${Math.round(weight*20)} mL`, "#ef4444"],
            ["Max (60 mL/kg)", `${Math.round(weight*60)} mL`, "#ef4444"],
          ]} eduId="resuscitation" onLearn={openEdu} />
          <QCalc title="Dehydration Deficits" rows={[
            ["3% (mild)", `${Math.round(3*weight*10)} mL`, "#10b981"],
            ["5% (mild)", `${Math.round(5*weight*10)} mL`, "#10b981"],
            ["7% (moderate)", `${Math.round(7*weight*10)} mL`, "#f59e0b"],
            ["10% (severe)", `${Math.round(10*weight*10)} mL`, "#ef4444"],
          ]} eduId="dehydration" onLearn={openEdu} />
          <QCalc title="DKA" rows={[
            ["Initial bolus (10)", `${Math.round(weight*10)} mL NS`, "#f59e0b"],
            ["1.5× maint rate", `${(maint.hr*1.5).toFixed(1)} mL/hr`, "#8b5cf6"],
            ["Insulin 0.1 U/kg/hr", `${(weight*0.1).toFixed(1)} U/hr`, "#8b5cf6"],
          ]} eduId="dka" onLearn={openEdu} />
          <QCalc title="Burns (20% TBSA)" rows={[
            ["Parkland 24h", `${Math.round(4*weight*20)} mL LR`, "#f97316"],
            ["First 8h rate", `${Math.round(4*weight*20/16)} mL/hr`, "#ef4444"],
            ["Next 16h rate", `${Math.round(4*weight*20/32)} mL/hr`, "#f59e0b"],
          ]} eduId="burns" onLearn={openEdu} />
          <QCalc title="3% NaCl (Hypertonic)" rows={[
            ["Seizure dose (3 mL/kg)", `${Math.round(weight*3)} mL`, "#ef4444"],
            ["Max dose (5 mL/kg)", `${Math.round(weight*5)} mL`, "#ef4444"],
            ["Expected Na rise/mL/kg", "~1 mEq/L", "#8b5cf6"],
          ]} eduId="naCorrection" onLearn={openEdu} />
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 9, color: "#1e2d3e" }}>
        Pediatric IVF CDS with Integrated Education v1.0 — AAP 2018 / SSC 2020 / ISPAD 2022 — For educational and clinical reference
      </div>
    </div>
  );
}

// ════════ COMPONENTS ════════

function Pill({ children, c }) {
  return <span style={{ padding: "3px 9px", borderRadius: 5, border: `1px solid ${c}30`, background: `${c}10`, color: c, fontSize: 10, fontWeight: 600 }}>{children}</span>;
}

function TreeNode({ c, tag, title, sub, edu, onLearn, small }) {
  return (
    <div style={{ background: `${c}06`, border: `1px solid ${c}18`, borderRadius: small ? 8 : 10, padding: small ? "8px 10px" : "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: c, background: `${c}15`, padding: "1px 6px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{tag}</span>
          <span style={{ fontSize: small ? 11 : 12, fontWeight: 600, color: "#e8edf5" }}>{title}</span>
        </div>
        <div style={{ fontSize: small ? 9 : 10, color: "#6b7a94", lineHeight: 1.4 }}>{sub}</div>
      </div>
      {edu && (
        <button onClick={() => onLearn(edu)} style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid #3b82f640", background: "rgba(59,130,246,0.1)", color: "#60a5fa", fontSize: 9, fontWeight: 700, cursor: "pointer", flexShrink: 0, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
          Learn ›
        </button>
      )}
    </div>
  );
}

function QCalc({ title, rows, eduId, onLearn }) {
  return (
    <div style={{ background: "rgba(12,18,32,0.8)", border: "1px solid #1a2236", borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h4 style={{ fontSize: 12, fontWeight: 600, color: "#e8edf5", margin: 0 }}>{title}</h4>
        {eduId && <button onClick={() => onLearn(eduId)} style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid #3b82f640", background: "rgba(59,130,246,0.08)", color: "#60a5fa", fontSize: 8, fontWeight: 700, cursor: "pointer" }}>Learn ›</button>}
      </div>
      {rows.map(([label, val, color], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: i < rows.length-1 ? "1px solid #111827" : "none" }}>
          <span style={{ fontSize: 10, color: "#6b7a94" }}>{label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>{val}</span>
        </div>
      ))}
    </div>
  );
}
