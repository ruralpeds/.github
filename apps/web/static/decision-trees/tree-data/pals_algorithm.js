// Clinical tree data — PALS Algorithm Decision Tree
// Source: 
// Auto-extracted from pals_algorithm_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"PALS\nAlgorithm",icon:"💓",type:"assessment",sub:"Pediatric Advanced Life Support · Cardiac arrest · Post-arrest",edge:"",
info:{tabs:["BLS Assessment","Shockable vs Non-Shockable","Key Medications"],
t0:`<p><strong>Pediatric BLS Assessment (C-A-B):</strong></p>
<ol class="sl">
<li><strong>Check responsiveness:</strong> Tap and shout. If unresponsive → activate emergency response.</li>
<li><strong>Check breathing and pulse simultaneously</strong> (max 10 seconds). Carotid (child) or brachial/femoral (infant).</li>
<li><strong>No pulse (or unsure) → start CPR immediately:</strong> Push hard (≥⅓ AP depth), push fast (100–120/min), allow full recoil, minimize interruptions.</li>
<li><strong>Compression-to-ventilation ratio:</strong> 30:2 (single rescuer) or 15:2 (two rescuers for pediatrics). 2 breaths over 1 second each.</li>
<li><strong>AED/defibrillator:</strong> Apply as soon as available. Analyze rhythm. Shock if indicated.</li>
</ol>
<p><strong>High-quality CPR targets:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Target</th></tr></thead><tbody>
<tr><td>Compression rate</td><td>100–120/min</td></tr>
<tr><td>Compression depth</td><td>≥⅓ AP diameter (~1.5 inches infant, ~2 inches child)</td></tr>
<tr><td>Chest recoil</td><td>Allow FULL recoil between compressions</td></tr>
<tr><td>Interruptions</td><td>&lt;10 seconds for rhythm check/shock</td></tr>
<tr><td>Ventilation rate (with advanced airway)</td><td>1 breath every 2–3 seconds (20–30/min) — do NOT hyperventilate</td></tr>
</tbody></table>`,
t1:`<table class="dt"><thead><tr><th>Rhythm</th><th>Treatment</th></tr></thead><tbody>
<tr><td><strong>Shockable: VF / pulseless VT</strong></td><td>CPR → Shock 2 J/kg → CPR 2 min → Shock 4 J/kg → Epi + CPR 2 min → Shock 4–10 J/kg → Amiodarone/Lidocaine + CPR → repeat</td></tr>
<tr><td><strong>Non-shockable: Asystole / PEA</strong></td><td>CPR → Epi q3–5 min → CPR 2 min → check rhythm → repeat. Identify and treat reversible causes (H's and T's).</td></tr>
</tbody></table>
<p><strong>H's and T's (reversible causes):</strong></p>
<ul><li><strong>H's:</strong> Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypo/hyperkalemia, Hypothermia, Hypoglycemia</li>
<li><strong>T's:</strong> Tension pneumothorax, Tamponade (cardiac), Toxins, Thrombosis (pulmonary/coronary)</li></ul>
<div class="bx bg">✓ <strong>In pediatric cardiac arrest, asystole/PEA is far more common than VF/VT</strong> (~85% non-shockable). Most pediatric arrests are RESPIRATORY in origin → airway/breathing management is critical.</div>`,
t2:`<table class="rt"><thead><tr><th>Drug</th><th>Dose</th><th>Route</th><th>Indication</th></tr></thead><tbody>
<tr><td><strong>Epinephrine</strong></td><td>0.01 mg/kg (0.1 mL/kg of 1:10,000)</td><td>IV/IO q3–5 min</td><td>All cardiac arrest rhythms</td></tr>
<tr><td><strong>Amiodarone</strong></td><td>5 mg/kg IV/IO (max 300 mg)</td><td>Bolus (can repeat ×2)</td><td>Shock-refractory VF/pVT</td></tr>
<tr><td><strong>Lidocaine</strong></td><td>1 mg/kg IV/IO</td><td>Bolus, then 20–50 µg/kg/min</td><td>Alternative to amiodarone for VF/pVT</td></tr>
<tr><td><strong>Adenosine</strong></td><td>0.1 mg/kg (max 6 mg), then 0.2 mg/kg (max 12 mg)</td><td>Rapid IV push</td><td>SVT (with pulse)</td></tr>
<tr><td><strong>Atropine</strong></td><td>0.02 mg/kg (min 0.1 mg, max 0.5 mg)</td><td>IV/IO</td><td>Symptomatic bradycardia</td></tr>
<tr><td><strong>Calcium chloride 10%</strong></td><td>20 mg/kg (0.2 mL/kg)</td><td>Slow IV/IO</td><td>Hyperkalemia, hypocalcemia, Ca-channel blocker OD</td></tr>
<tr><td><strong>Sodium bicarbonate</strong></td><td>1 mEq/kg</td><td>Slow IV/IO</td><td>Severe acidosis, hyperkalemia, TCA OD</td></tr>
<tr><td><strong>Dextrose</strong></td><td>0.5–1 g/kg (D10W 5–10 mL/kg)</td><td>IV/IO</td><td>Hypoglycemia</td></tr>
</tbody></table>`
},children:[
{name:"Cardiac Arrest\n(Non-Shockable)",icon:"⚫",type:"emergency",sub:"Asystole / PEA · CPR + Epi q3–5min · H's and T's",edge:"Asystole\nor PEA",
info:{tabs:["Algorithm","H's and T's Detail"],
t0:`<ol class="sl">
<li><strong>High-quality CPR</strong> — immediately, 15:2 (two rescuers)</li>
<li><strong>IV/IO access</strong> — IO if IV not obtained within 60–90 seconds</li>
<li><strong>Epinephrine 0.01 mg/kg IV/IO</strong> — give ASAP for non-shockable rhythms (earlier epi = better outcomes). Repeat every 3–5 minutes.</li>
<li><strong>Advanced airway</strong> (ETT or supraglottic) when feasible without prolonged CPR interruption. Once placed: continuous compressions + 1 breath every 2–3 seconds.</li>
<li><strong>Check rhythm every 2 minutes</strong> (pulse check &lt;10 seconds)</li>
<li><strong>Search for and treat reversible causes</strong> (H's and T's)</li>
<li>If rhythm changes to shockable → switch to shockable algorithm</li>
</ol>`,
t1:`<table class="dt"><thead><tr><th>Cause</th><th>Clue</th><th>Treatment</th></tr></thead><tbody>
<tr><td><strong>Hypovolemia</strong></td><td>#1 cause in peds. Trauma, GI loss, sepsis.</td><td>NS/LR 20 mL/kg bolus. Blood if hemorrhagic.</td></tr>
<tr><td><strong>Hypoxia</strong></td><td>#1 cause of peds arrest overall. Respiratory failure → arrest.</td><td>Effective ventilation with 100% O₂. Confirm ETT placement.</td></tr>
<tr><td><strong>Hypothermia</strong></td><td>Submersion, exposure.</td><td>Active warming. Continue CPR until rewarmed to 32°C. "Not dead until warm and dead."</td></tr>
<tr><td><strong>Hyperkalemia</strong></td><td>Renal failure, DKA, rhabdomyolysis. Peaked T waves on ECG.</td><td>CaCl 20 mg/kg, NaHCO₃ 1 mEq/kg, insulin/glucose, albuterol.</td></tr>
<tr><td><strong>Tension pneumothorax</strong></td><td>Unilateral absent breath sounds, tracheal deviation, distended neck veins.</td><td>Needle decompression (2nd ICS MCL or 4th ICS AAL) → chest tube.</td></tr>
<tr><td><strong>Tamponade</strong></td><td>Muffled heart sounds, distended neck veins, hypotension (Beck's triad).</td><td>Pericardiocentesis (subxiphoid approach).</td></tr>
<tr><td><strong>Toxins</strong></td><td>History/scene/bottles. Toxidrome pattern.</td><td>Specific antidote. NaHCO₃ for TCA (wide QRS). Lipid emulsion for local anesthetic toxicity.</td></tr>
</tbody></table>`
}},
{name:"Cardiac Arrest\n(Shockable)",icon:"⚡",type:"emergency",sub:"VF / pulseless VT · Defibrillation + Epi + Amiodarone",edge:"VF or\npulseless VT",
info:{tabs:["Algorithm","Defibrillation"],
t0:`<ol class="sl">
<li><strong>CPR while applying defibrillator pads</strong></li>
<li><strong>Shock #1:</strong> 2 J/kg (biphasic)</li>
<li><strong>Resume CPR immediately × 2 minutes</strong> (do NOT check rhythm/pulse between shock and CPR)</li>
<li><strong>Check rhythm. If still VF/pVT → Shock #2:</strong> 4 J/kg</li>
<li><strong>Resume CPR × 2 min. Epinephrine 0.01 mg/kg IV/IO</strong> (give during CPR after 2nd shock)</li>
<li><strong>Check rhythm. If still VF/pVT → Shock #3:</strong> 4–10 J/kg (max 10 J/kg or adult dose)</li>
<li><strong>Resume CPR × 2 min. Amiodarone 5 mg/kg IV/IO bolus</strong> (or Lidocaine 1 mg/kg)</li>
<li><strong>Continue cycle:</strong> CPR → rhythm check → shock if VF/pVT → epi q3–5 min → amiodarone (can repeat ×2, max total 15 mg/kg)</li>
</ol>`,
t1:`<p><strong>Defibrillation principles:</strong></p>
<ul><li>Pad placement: anterior-posterior (preferred in infants) or anterior-lateral</li>
<li>Use pediatric pads/attenuator for children &lt;8 years or &lt;25 kg if available. If not available, use adult pads — DO NOT withhold defibrillation because pediatric pads aren't available.</li>
<li>Escalate energy: 2 J/kg → 4 J/kg → 4–10 J/kg. Maximum: 10 J/kg or adult maximum dose (200–360 J biphasic).</li>
<li>Minimize time between last compression and shock delivery (&lt;10 seconds)</li>
<li>Resume CPR IMMEDIATELY after shock — do not pause to check rhythm (the shock stuns the heart; it needs perfusion from CPR to restart).</li></ul>
<div class="bx bb">ℹ️ <strong>Pediatric VF/pVT is uncommon (~15% of arrests) but has BETTER outcomes than asystole/PEA when defibrillated promptly.</strong> Survival to discharge with shockable rhythm: 25–35% vs 5–10% for non-shockable.</div>`
}},
{name:"Post-Cardiac\nArrest Care",icon:"🏥",type:"action",sub:"TTM · Avoid hyperthermia · Hemodynamic support",edge:"ROSC\nachieved",
info:{tabs:["Post-ROSC Checklist","TTM","Neuroprognostication"],
t0:`<ol class="sl">
<li><strong>Airway/ventilation:</strong> Confirm ETT. Target SpO₂ 94–99% (avoid hyperoxia). Target normocapnia (PaCO₂ 35–45).</li>
<li><strong>Hemodynamics:</strong> Maintain age-appropriate BP. Fluid boluses for hypotension. Vasopressors/inotropes PRN (epinephrine or dopamine). Target MAP ≥5th percentile for age.</li>
<li><strong>Temperature:</strong> Targeted Temperature Management (TTM). Avoid hyperthermia (>37.5°C) — associated with worse neurologic outcomes. Active cooling to 32–34°C for 24–48h is reasonable for comatose patients (extrapolated from adult data; THAPCA trial).</li>
<li><strong>Glucose:</strong> Avoid hypo- and hyperglycemia. Target 80–180 mg/dL.</li>
<li><strong>Seizure monitoring:</strong> Continuous EEG if comatose. Treat clinical/electrographic seizures aggressively.</li>
<li><strong>Labs:</strong> Blood gas, lactate (trending), electrolytes, glucose, CBC, troponin, renal/hepatic function.</li>
<li><strong>12-lead ECG:</strong> Assess for ST changes, QTc, arrhythmias</li>
<li><strong>Echo:</strong> LV function, pericardial effusion, structural anomalies</li>
</ol>`,
t1:`<p><strong>THAPCA Trial (Moler et al., NEJM 2015 & 2017):</strong></p>
<ul><li>Out-of-hospital arrest: therapeutic hypothermia (33°C × 48h) vs normothermia (36.8°C) → no significant difference in survival with favorable neurologic outcome (20% vs 12%, p=0.14). Trend toward benefit but underpowered.</li>
<li>In-hospital arrest: therapeutic hypothermia vs normothermia → no difference.</li>
<li><strong>Current recommendation:</strong> Either TTM at 32–34°C for 48h OR active maintenance of normothermia (36–37.5°C) are acceptable. PREVENT HYPERTHERMIA (>37.5°C) — this IS associated with worse outcomes.</li></ul>`,
t2:`<p><strong>Neuroprognostication after pediatric cardiac arrest:</strong></p>
<ul><li>No single test reliably predicts outcome in the first 24–72h</li>
<li>Use MULTIMODAL approach: clinical exam (brainstem reflexes, GCS trajectory), EEG (reactive vs burst-suppression vs flat), neuroimaging (MRI diffusion at 3–7 days), somatosensory evoked potentials (absent N20 = poor prognosis), biomarkers (neuron-specific enolase)</li>
<li>Wait ≥72 hours after ROSC (longer if TTM used) before making definitive prognostic statements</li>
<li>Pediatric patients have BETTER neuroplasticity and recovery potential than adults — be cautious about early withdrawal of care</li></ul>`
}}
]};
