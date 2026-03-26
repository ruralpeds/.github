// Clinical tree data — Neonatal Fluid, Electrolyte & Nutrition Decision Tree
// Source: 
// Auto-extracted from neonatal_fen_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal FEN\nManagement",icon:"💧",type:"assessment",sub:"IV fluids, electrolytes, enteral nutrition, TPN",edge:"",
info:{tabs:["Fluid Physiology","Daily Fluid Rates","Electrolyte Timing"],
t0:`<p>Neonatal fluid and electrolyte management requires understanding of the unique transitional physiology. At birth, total body water is 75–80% in term and up to 90% in extremely preterm infants. The first 3–5 days involve a physiologic contraction diuresis — loss of extracellular fluid that results in expected weight loss (5–10% term, up to 10–15% preterm). This is NORMAL and should not be aggressively replaced.</p>
<div class="bx bb">ℹ️ <strong>Physiologic weight loss in first 5–7 days is expected and beneficial.</strong> 2024 data shows that allowing 5–12% weight loss in preterm infants is associated with decreased BPD. Aggressive fluid replacement to prevent weight loss may be harmful.</div>`,
t1:`<table class="rt"><thead><tr><th>Birth Weight</th><th>Day 1</th><th>Day 2</th><th>Day 3</th><th>Day 4+</th></tr></thead><tbody>
<tr><td>&lt; 750g</td><td>100–120 mL/kg</td><td>120–140</td><td>140–160</td><td>140–180</td></tr>
<tr><td>750–1000g</td><td>80–100</td><td>100–120</td><td>120–140</td><td>140–160</td></tr>
<tr><td>1000–1500g</td><td>60–80</td><td>80–100</td><td>100–120</td><td>120–150</td></tr>
<tr><td>1500–2500g</td><td>60–80</td><td>80–100</td><td>100–120</td><td>120–150</td></tr>
<tr><td>>2500g (term)</td><td>60–70</td><td>70–80</td><td>80–100</td><td>100–120</td></tr>
</tbody></table>
<p><em>Adjust based on: UOP (target 1–3 mL/kg/hr), serum Na (target 135–145), weight change, humidity level (high humidity in ELBW decreases IWL).</em></p>`,
t2:`<p><strong>When to add electrolytes to IV fluids:</strong></p>
<table class="rt"><thead><tr><th>Electrolyte</th><th>When to Start</th><th>Dose</th><th>Rationale</th></tr></thead><tbody>
<tr><td>Sodium</td><td>Day 2–3 (after onset of diuresis)</td><td>2–4 mEq/kg/day</td><td>Do NOT add Na on day 1 — allows physiologic contraction. Early Na → fluid retention → ↑ BPD risk.</td></tr>
<tr><td>Potassium</td><td>Day 2–3 (once voiding confirmed)</td><td>1–2 mEq/kg/day</td><td>NEVER add K until UOP is confirmed. Check serum K first — preterm infants prone to non-oliguric hyperkalemia.</td></tr>
<tr><td>Calcium</td><td>Day 1 (in TPN or D10W)</td><td>200–400 mg/kg/day Ca gluconate</td><td>Early hypocalcemia common, especially in preterm, IDM, asphyxia</td></tr>
</tbody></table>
<div class="bx br">🚨 <strong>NO sodium on day 1.</strong> NO potassium until voiding is confirmed. These are the two most important electrolyte principles in neonatal fluid management.</div>`
},children:[
{name:"Glucose\nManagement",icon:"🩸",type:"urgent",sub:"GIR formula · D10W standard · Hypo/hyperglycemia",edge:"Glucose\nabnormality",
info:{tabs:["GIR Calculation","Hypoglycemia Protocol","Hyperglycemia"],
t0:`<p><strong>Glucose Infusion Rate (GIR) — The Central Calculation:</strong></p>
<p><strong>GIR (mg/kg/min) = [IV rate (mL/hr) × dextrose concentration (g/dL)] / [weight (kg) × 6]</strong></p>
<p><strong>Example:</strong> 1.5 kg infant on D10W at 6 mL/hr: GIR = (6 × 10) / (1.5 × 6) = 60/9 = <strong>6.7 mg/kg/min</strong></p>
<table class="rt"><thead><tr><th>Clinical Scenario</th><th>Target GIR</th></tr></thead><tbody>
<tr><td>Normal term neonate</td><td>4–6 mg/kg/min</td></tr>
<tr><td>Preterm infant (VLBW)</td><td>5–8 mg/kg/min</td></tr>
<tr><td>Hypoglycemic infant</td><td>8–12+ mg/kg/min (may need central line for D12.5%+)</td></tr>
<tr><td>Hyperinsulinism</td><td>10–20+ mg/kg/min</td></tr>
</tbody></table>`,
t1:`<ol class="sl">
<li>Symptomatic: D10W 2 mL/kg IV bolus (200 mg/kg) over 5–10 min</li>
<li>Start continuous infusion: D10W at GIR 5–8 mg/kg/min</li>
<li>Recheck glucose 30 min after bolus and hourly until stable</li>
<li>If glucose remains &lt;50: increase GIR by 1–2 mg/kg/min every 30–60 min</li>
<li>If GIR >10–12 needed: consider central line for D12.5%–D20%. Evaluate for hyperinsulinism.</li>
<li>Wean GIR gradually (1–2 mg/kg/min per 6–12h) once stable on full feeds</li>
</ol>`,
t2:`<p><strong>Neonatal hyperglycemia:</strong> Glucose >150–180 mg/dL. Common in ELBW and sick infants (stress, steroids, sepsis, excessive glucose delivery).</p>
<ul><li><strong>First:</strong> Decrease GIR (lower dextrose concentration or rate). Target GIR 4–6.</li>
<li><strong>Second:</strong> If hyperglycemia persists despite GIR &lt;4 and infant needs nutrition → consider insulin infusion (0.01–0.1 units/kg/hr) with very close glucose monitoring q30–60min.</li>
<li><strong>Risks of persistent hyperglycemia:</strong> Osmotic diuresis, dehydration, IVH (hyperosmolarity), impaired wound healing</li>
<li><strong>Avoid:</strong> Aggressive insulin dosing (rebound hypoglycemia is dangerous and common)</li></ul>`
}},
{name:"Sodium\nDisorders",icon:"🧂",type:"decision",sub:"Hypo/hypernatremia · Context-dependent interpretation",edge:"Abnormal\nserum Na",
info:{tabs:["Hyponatremia","Hypernatremia","Interpretation Framework"],
t0:`<p><strong>Neonatal hyponatremia (Na &lt;130 mEq/L):</strong></p>
<table class="dt"><thead><tr><th>Timing</th><th>Most Common Cause</th><th>Mechanism</th><th>Treatment</th></tr></thead><tbody>
<tr><td><strong>First week</strong></td><td>Excess free water (iatrogenic or physiologic)</td><td>Fluid overload preventing normal contraction diuresis</td><td>RESTRICT fluids (not Na supplementation). Allow contraction diuresis.</td></tr>
<tr><td><strong>After first week</strong></td><td>Sodium depletion (renal losses in preterm)</td><td>Immature tubules cannot conserve Na; ongoing losses exceed intake</td><td>Increase Na supplementation (up to 4–6 mEq/kg/day in ELBW)</td></tr>
<tr><td><strong>Any time</strong></td><td>SIADH, adrenal insufficiency (CAH)</td><td>ADH excess (SIADH) or aldosterone deficiency (CAH)</td><td>Fluid restriction (SIADH). Hydrocortisone + fludrocortisone (CAH).</td></tr>
</tbody></table>
<div class="bx bo">⚠️ <strong>Hyponatremia in the first week = usually WATER excess, NOT sodium deficit.</strong> Do NOT give extra Na — RESTRICT fluids. After the first week, hyponatremia is usually from Na losses requiring supplementation.</div>`,
t1:`<p><strong>Neonatal hypernatremia (Na >150 mEq/L):</strong></p>
<ul><li><strong>Most common cause:</strong> Insufficient free water intake (especially in breastfed infants with inadequate milk production in first 3–5 days)</li>
<li><strong>ELBW infants:</strong> Massive insensible water loss (TEWL) from immature skin → hypernatremic dehydration. Most common in first 72h before humidity is optimized.</li>
<li><strong>Correct slowly:</strong> Na should decrease no faster than 0.5 mEq/L/hour or 10–12 mEq/L/24 hours. Rapid correction → cerebral edema → seizures.</li></ul>`,
t2:`<p><strong>Key principle:</strong> In the first week of life, sodium abnormalities are almost always WATER problems, not sodium problems.</p>
<ul><li>Hyponatremia (first week) = too much water → restrict fluids</li>
<li>Hypernatremia (first week) = too little water → increase free water</li>
<li>Hyponatremia (after first week) = too little sodium → supplement sodium</li></ul>`
}},
{name:"Enteral Nutrition\n& Fortification",icon:"🍼",type:"action",sub:"Breast milk priority · Fortification · ESPGHAN",edge:"Establishing\nfeeds",
info:{tabs:["Feeding Advancement","Human Milk Fortification","Protein Targets"],
t0:`<p><strong>Standardized feeding advancement protocol (reduces NEC):</strong></p>
<table class="rt"><thead><tr><th>Birth Weight</th><th>Start</th><th>Advance</th><th>Goal</th></tr></thead><tbody>
<tr><td>&lt;1000g</td><td>10–20 mL/kg/day (trophic)</td><td>10–20 mL/kg/day increases</td><td>150–160 mL/kg/day</td></tr>
<tr><td>1000–1500g</td><td>20–30 mL/kg/day</td><td>20–30 mL/kg/day</td><td>150–160 mL/kg/day</td></tr>
<tr><td>1500–2500g</td><td>30–60 mL/kg/day</td><td>20–30 mL/kg/day</td><td>150–160 mL/kg/day</td></tr>
<tr><td>>2500g (term)</td><td>Ad lib (breastfeed on demand or 60 mL/kg/day formula)</td><td>Per infant cues</td><td>~150–180 mL/kg/day</td></tr>
</tbody></table>
<div class="bx bg">✓ <strong>Maternal breast milk is first priority for ALL neonates.</strong> If unavailable for VLBW: pasteurized donor human milk. Formula only when human milk is unavailable or insufficient and donor milk is not an option.</div>`,
t1:`<p><strong>Human milk fortification (for preterm &lt;1500g):</strong></p>
<ul><li>Unfortified human milk provides ~67 kcal/dL and ~1.0–1.2 g/dL protein — insufficient for preterm growth</li>
<li><strong>Fortify when feeds reach 80–100 mL/kg/day</strong></li>
<li>Standard bovine-based fortifier (Enfamil HMF, Similac HMF): adds protein, calcium, phosphorus, vitamins, minerals. Brings to ~24 kcal/oz.</li>
<li>Exclusive human milk-based fortifier (Prolacta): for ELBW — may reduce NEC compared to bovine-based (limited evidence)</li>
<li>Target: 24 kcal/oz minimum; may need 26–28 kcal/oz for growth-restricted infants</li></ul>`,
t2:`<p><strong>ESPGHAN 2022 Protein Targets for Preterm Infants:</strong></p>
<table class="rt"><thead><tr><th>Weight</th><th>Protein Target</th><th>Caloric Target</th></tr></thead><tbody>
<tr><td>&lt;1000g</td><td>3.5–4.5 g/kg/day</td><td>110–135 kcal/kg/day</td></tr>
<tr><td>1000–1500g</td><td>3.5–4.0 g/kg/day</td><td>110–130 kcal/kg/day</td></tr>
<tr><td>1500–2500g</td><td>3.0–3.5 g/kg/day</td><td>110–130 kcal/kg/day</td></tr>
</tbody></table>
<p><strong>Growth monitoring:</strong> Target weight gain 15–20 g/kg/day after regaining birth weight. Head circumference 0.9–1.0 cm/week. Length 1.0–1.1 cm/week. Plot on Fenton or INTERGROWTH-21st charts.</p>`
}},
{name:"Parenteral\nNutrition (TPN)",icon:"💉",type:"action",sub:"Amino acids day 1 · Lipids day 1–2 · Monitoring",edge:"Unable to\nachieve full\nenteral feeds",
info:{tabs:["TPN Components","Starting Protocol","IFALD Prevention"],
t0:`<table class="rt"><thead><tr><th>Component</th><th>Start</th><th>Goal</th><th>Notes</th></tr></thead><tbody>
<tr><td>Amino acids</td><td>1.5–2 g/kg/day on DAY 1</td><td>3.5–4.0 g/kg/day</td><td>Early aggressive protein prevents catabolism. Advance 0.5–1 g/kg/day.</td></tr>
<tr><td>Dextrose</td><td>GIR 5–7 mg/kg/min</td><td>GIR 10–14 mg/kg/min</td><td>Advance based on glucose tolerance</td></tr>
<tr><td>Lipids (IL 20%)</td><td>1–2 g/kg/day on day 1–2</td><td>3.0–3.5 g/kg/day</td><td>Essential fatty acids + caloric density. SMOF lipid may reduce IFALD.</td></tr>
<tr><td>Calcium</td><td>Day 1</td><td>60–80 mg/kg/day</td><td>Prevent early hypocalcemia</td></tr>
<tr><td>Phosphorus</td><td>Day 1</td><td>40–60 mg/kg/day</td><td>Ca:P ratio ~1.3–1.7:1</td></tr>
<tr><td>Vitamins/TEs</td><td>Day 1</td><td>Standard neonatal MVI + trace elements</td><td>Zinc, copper, manganese, chromium, selenium</td></tr>
</tbody></table>`,
t1:`<ol class="sl">
<li><strong>Day 1:</strong> D10W with amino acids 2 g/kg/day + calcium. Start lipids 1 g/kg/day. Dextrose at GIR 5–7.</li>
<li><strong>Day 2:</strong> Advance amino acids to 3 g/kg/day. Lipids to 2 g/kg/day. Add phosphorus.</li>
<li><strong>Day 3–4:</strong> Amino acids to goal (3.5–4 g/kg/day). Lipids to 3 g/kg/day. Optimize dextrose for caloric density.</li>
<li><strong>Monitor:</strong> Daily electrolytes until stable; twice weekly triglycerides (hold lipids if TG >200); weekly LFTs, Ca/Phos, alkaline phosphatase</li>
<li><strong>Wean TPN as enteral feeds advance</strong> (typically 1:1 ratio — for each mL/kg/day of feeds gained, decrease TPN by same)</li>
</ol>`,
t2:`<p><strong>IFALD (Intestinal Failure-Associated Liver Disease) Prevention:</strong></p>
<ul><li>Occurs in 40–60% of infants on TPN >14 days</li>
<li><strong>Prevention strategies:</strong></li>
<li>Advance enteral feeds as rapidly as safely possible (even trophic feeds help)</li>
<li>Cycle TPN (off for 2–4 hours/day once tolerating some enteral feeds) — allows bile acid recycling</li>
<li>SMOFlipid (soy, MCT, olive, fish oil blend) — fish oil component (omega-3) reduces IFALD risk vs pure soy lipids. Use as first-line lipid emulsion where available.</li>
<li>Omegaven (pure fish oil) — for established IFALD; FDA-approved rescue therapy. Dramatically reverses cholestasis in many cases.</li>
<li>Minimize copper and manganese in TPN (hepatotoxic when cholestatic — excreted in bile)</li>
<li>Ursodiol (UDCA) 10–20 mg/kg/day — for established cholestasis (improves bile flow)</li></ul>
<div class="bx bg">✓ <strong>SMOFlipid as first-line TPN lipid emulsion</strong> reduces the incidence of IFALD compared to traditional soy-based Intralipid (multiple studies). Increasingly the standard of care in NICUs.</div>`
}},
{name:"Hyperkalemia\nEmergency",icon:"⚡",type:"emergency",sub:"K >6.5 or ECG changes · Cardiac protection first",edge:"K >6.5 mEq/L\nor ECG changes",
info:{tabs:["Diagnosis","Emergency Protocol","Non-oliguric Hyperkalemia"],
t0:`<p><strong>Confirm true hyperkalemia:</strong> Hemolyzed samples are the #1 cause of false elevation. If K >6.0 on capillary sample → confirm with a non-hemolyzed venous or arterial sample AND obtain an ECG simultaneously.</p>
<p><strong>ECG changes of hyperkalemia (progressive):</strong></p>
<ul><li>Peaked T waves (earliest sign) → 6.0–6.5</li>
<li>Prolonged PR interval → 6.5–7.0</li>
<li>Widened QRS → 7.0–8.0</li>
<li>Sine wave pattern → >8.0 (pre-arrest)</li>
<li>VF/asystole</li></ul>`,
t1:`<ol class="sl">
<li><strong>Cardiac protection (FIRST):</strong> Calcium gluconate 10% — 1–2 mL/kg IV over 5–10 min with cardiac monitoring. Stabilizes myocardial membranes. Does NOT lower K.</li>
<li><strong>Shift K intracellularly:</strong> Regular insulin 0.1 U/kg IV + D10W 2–5 mL/kg (give dextrose simultaneously to prevent hypoglycemia). Onset 15–30 min. Check glucose q15–30min.</li>
<li><strong>Albuterol nebulization:</strong> 0.15 mg/kg (max 2.5 mg) — β₂-agonist shifts K into cells. Onset 15–30 min.</li>
<li><strong>Sodium bicarbonate:</strong> 1–2 mEq/kg IV over 30 min if metabolic acidosis present. Shifts K into cells.</li>
<li><strong>Sodium polystyrene (Kayexalate):</strong> 1 g/kg PO or PR — exchanges Na for K in GI tract. Onset hours. Avoid in preterm (NEC risk).</li>
<li><strong>Dialysis:</strong> If refractory to medical management. Peritoneal dialysis most common in neonates.</li>
</ol>
<div class="bx br">🚨 <strong>CALCIUM FIRST.</strong> Calcium gluconate does not lower potassium — it protects the heart while you implement K-lowering therapies. Give it BEFORE insulin/glucose/albuterol.</div>`,
t2:`<p><strong>Non-oliguric hyperkalemia of prematurity:</strong></p>
<ul><li>Common in ELBW infants in first 48–72h of life (up to 50% of &lt;28 wk)</li>
<li>Mechanism: immature Na-K-ATPase → K shifts from intracellular to extracellular space. NOT from renal failure (UOP is normal).</li>
<li>Usually resolves by 72h as renal function and Na-K-ATPase mature</li>
<li>Management: same as other hyperkalemia if severe (K >7 or ECG changes). Avoid exogenous K in first 48–72h. Monitor K every 4–6 hours in ELBW.</li></ul>`
}}
]};
