// Clinical tree data — Pediatric DKA Management Decision Tree
// Source: 
// Auto-extracted from pediatric_dka_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric DKA\nManagement",icon:"💧",type:"assessment",sub:"Two-bag method · Cerebral edema protocol · Insulin drip",edge:"",
info:{tabs:["Diagnosis","Severity Classification","Cerebral Edema Risk"],
t0:`<p><strong>DKA diagnostic criteria:</strong></p>
<ul><li>Blood glucose >200 mg/dL (or known diabetes)</li>
<li>Venous pH &lt;7.30 or bicarbonate &lt;15 mEq/L</li>
<li>Ketonemia (β-hydroxybutyrate >3 mmol/L) or ketonuria</li></ul>`,
t1:`<table class="rt"><thead><tr><th>Severity</th><th>pH</th><th>Bicarb</th><th>Clinical</th></tr></thead><tbody>
<tr><td>Mild</td><td>7.20–7.30</td><td>10–15</td><td>Alert, mild dehydration</td></tr>
<tr><td>Moderate</td><td>7.10–7.20</td><td>5–10</td><td>Lethargic, moderate dehydration</td></tr>
<tr><td>Severe</td><td>&lt;7.10</td><td>&lt;5</td><td>Obtunded, severe dehydration, Kussmaul breathing</td></tr>
</tbody></table>`,
t2:`<div class="bx br">🚨 <strong>Cerebral edema:</strong> #1 cause of DKA mortality in children (0.5–1% of episodes; 21–24% mortality). Risk factors: younger age (&lt;5 yr), new-onset diabetes, severe acidosis, higher BUN, failure of Na to rise with treatment, excessive fluid boluses, rapid glucose decline, early insulin.</div>`
},children:[
{name:"Fluid\nResuscitation",icon:"💧",type:"action",sub:"NS 10–20 mL/kg bolus · 2-bag method · Slow correction",edge:"Dehydration\nassessment",
info:{tabs:["Initial Bolus","Two-Bag Method","Monitoring"],
t0:`<ol class="sl">
<li><strong>Initial bolus:</strong> NS 10–20 mL/kg over 1–2 hours. Repeat 10 mL/kg if still in shock. Total initial bolus should NOT exceed 40 mL/kg in first 4 hours (cerebral edema risk).</li>
<li><strong>Estimate dehydration:</strong> Mild DKA 5%, Moderate 7%, Severe 10%. Replace deficit over 24–48 hours (NOT rapidly).</li>
<li><strong>Maintenance + deficit replacement:</strong> Calculate total 24–48h fluid needs. Subtract bolus given. Deliver remainder evenly over 24–48 hours.</li>
</ol>
<div class="bx bo">⚠️ <strong>SLOW rehydration.</strong> Rapid fluid administration is the #1 modifiable risk factor for cerebral edema in pediatric DKA. Do NOT try to fully correct dehydration in the first 8–12 hours.</div>`,
t1:`<p><strong>Two-Bag Method (simplifies glucose management):</strong></p>
<ul><li><strong>Bag 1:</strong> NS (0.9% NaCl) + 20 mEq/L KCl + 20 mEq/L KPhos — NO dextrose</li>
<li><strong>Bag 2:</strong> D10 in NS + 20 mEq/L KCl + 20 mEq/L KPhos — WITH dextrose</li>
<li>Run both bags. Total rate = maintenance + deficit rate (calculated). Adjust the RATIO of Bag 1 to Bag 2 to maintain glucose 150–300 mg/dL without changing insulin rate.</li>
<li>Glucose falling too fast → increase Bag 2 proportion. Glucose too high → increase Bag 1.</li>
<li>Goal: glucose decline no faster than 50–100 mg/dL/hr</li></ul>`,
t2:`<ul><li>BMP (Na, K, Cl, CO₂, BUN, Cr, glucose) q1–2h initially, then q2–4h</li>
<li>Venous blood gas q2–4h (follow pH and bicarb trend)</li>
<li>Point-of-care glucose q1h</li>
<li>Neurologic checks q1h (GCS, pupils, headache, vomiting, altered mental status)</li>
<li><strong>Corrected sodium:</strong> Na should RISE as glucose falls. If Na is falling while glucose is falling → excess free water → cerebral edema risk. Na correction: add 1.6 mEq/L to measured Na for every 100 mg/dL glucose above 100.</li>
<li>Strict I&O with Foley if obtunded</li></ul>`
}},
{name:"Insulin\nDrip",icon:"💉",type:"action",sub:"0.05–0.1 U/kg/hr · Start 1–2h AFTER fluids",edge:"After initial\nbolus",
info:{tabs:["Protocol","When to Transition"],
t0:`<ol class="sl">
<li><strong>Do NOT bolus insulin.</strong> No IV insulin bolus in pediatric DKA (increases cerebral edema risk).</li>
<li><strong>Start insulin infusion 1–2 hours AFTER initial fluid bolus</strong> (NOT simultaneously).</li>
<li><strong>Rate:</strong> 0.05–0.1 units/kg/hour (start 0.1 for severe; 0.05 acceptable for mild-moderate and may reduce cerebral edema risk — PECARN DKA FLUID trial 2018).</li>
<li><strong>Do NOT stop insulin until acidosis resolves</strong> (pH >7.30, bicarb >15, anion gap closed). Add dextrose to IV fluids (two-bag method) to maintain glucose 150–300 while continuing insulin.</li>
<li><strong>Goal:</strong> Glucose decline 50–100 mg/dL/hr. If dropping faster → reduce insulin rate to 0.05 U/kg/hr and increase dextrose.</li>
</ol>`,
t1:`<p><strong>Transition to subcutaneous insulin when:</strong></p>
<ul><li>pH >7.30 and bicarb >15 (acidosis resolved)</li>
<li>Anion gap closed (&lt;12)</li>
<li>Patient tolerating oral fluids</li>
<li>Mentally alert</li>
<li><strong>Give first SQ insulin dose 30–60 minutes BEFORE stopping IV drip</strong> (overlap to prevent rebound DKA from insulin gap)</li>
<li>If new-onset diabetes: endocrinology consult for insulin regimen + education before discharge</li></ul>`
}},
{name:"Cerebral Edema\nProtocol",icon:"🧠",type:"emergency",sub:"Mannitol or hypertonic saline · Elevate head · Intubate",edge:"Headache,\nvomiting,\nAMS during\nDKA Rx",
info:{tabs:["Recognition","Emergency Treatment"],
t0:`<p><strong>Suspect cerebral edema when (during DKA treatment):</strong></p>
<ul><li>Headache (new or worsening)</li>
<li>Altered mental status (lethargy, confusion, irritability) after initial improvement</li>
<li>Vomiting (especially if wasn't vomiting before)</li>
<li>Decorticate or decerebrate posturing</li>
<li>Cushing triad (hypertension, bradycardia, irregular respirations)</li>
<li>Papilledema, unequal or fixed pupils</li>
<li>Decrease in GCS ≥2 points</li></ul>
<div class="bx br">🚨 <strong>Cerebral edema can progress to brain herniation within MINUTES.</strong> Treat empirically based on clinical suspicion. Do NOT wait for CT confirmation.</div>`,
t1:`<ol class="sl">
<li><strong>Elevate head of bed 30°</strong></li>
<li><strong>Reduce IV fluid rate by one-third</strong></li>
<li><strong>Mannitol 0.5–1 g/kg IV over 15–20 min</strong> (first-line) OR <strong>Hypertonic saline (3%) 2.5–5 mL/kg IV over 15–30 min</strong> (equally effective; may be preferred if hypotensive)</li>
<li>May repeat hyperosmolar therapy in 15–30 min if no improvement</li>
<li><strong>Intubate if GCS &lt;8</strong> (but avoid hyperventilation — only mild hyperventilation to PaCO₂ 30–35 if herniation signs; excessive hyperventilation worsens cerebral ischemia)</li>
<li><strong>CT head</strong> when stabilized</li>
<li><strong>Neurosurgery consult</strong> if evidence of herniation</li>
</ol>`
}},
{name:"Potassium\nManagement",icon:"🧂",type:"urgent",sub:"K falls with insulin · Replace early · ECG monitor",edge:"Electrolyte\nmanagement",
info:{tabs:["Protocol","Dangers"],
t0:`<p><strong>Potassium management in DKA:</strong></p>
<ul><li>Total body K is ALWAYS depleted in DKA (even if serum K appears normal or high)</li>
<li>Insulin drives K into cells → serum K drops rapidly after insulin is started</li>
<li><strong>Start K replacement with the FIRST liter of IV fluids</strong> (after initial bolus) as long as patient is voiding and K is not >5.5</li></ul>
<table class="rt"><thead><tr><th>Serum K</th><th>Action</th></tr></thead><tbody>
<tr><td>>6.0 mEq/L</td><td>HOLD K replacement. Recheck in 1h. ECG monitoring.</td></tr>
<tr><td>5.0–6.0</td><td>Start 20 mEq/L K in fluids</td></tr>
<tr><td>4.0–5.0</td><td>40 mEq/L K in fluids (20 KCl + 20 KPhos)</td></tr>
<tr><td>3.0–4.0</td><td>40–60 mEq/L K in fluids. Consider holding insulin until K >3.5.</td></tr>
<tr><td>&lt;3.0</td><td>60–80 mEq/L K + HOLD insulin until K >3.5. Cardiac monitoring. Consider central line for concentrated K.</td></tr>
</tbody></table>`,
t1:`<div class="bx br">🚨 <strong>Do NOT start insulin if K &lt;3.5 mEq/L.</strong> Insulin will drive K further down → fatal cardiac arrhythmia. Replace K first, then start insulin once K >3.5.</div>
<p><strong>Phosphate:</strong> Give half of K replacement as KPhos (prevents hypophosphatemia, which can cause respiratory muscle weakness, hemolytic anemia, rhabdomyolysis). Other half as KCl.</p>`
}}
]};
