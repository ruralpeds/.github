// Clinical tree data — Pediatric Seizures & Status Epilepticus Decision Tree
// Source: 
// Auto-extracted from pediatric_seizures_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric Seizures\n& Status Epilepticus",icon:"⚡",type:"assessment",sub:"Febrile seizures, first-time seizure workup, status protocol",edge:"",
info:{tabs:["Approach","Classification","First-Time Seizure"],
t0:`<p>Seizures are the most common pediatric neurologic emergency. ~5% of children will have a seizure by age 16. Key decisions: Is this a seizure (vs. mimic)? Is this status epilepticus? Is there an underlying cause requiring immediate treatment?</p>`,
t1:`<table class="dt"><thead><tr><th>Type</th><th>Features</th><th>Common Ages</th></tr></thead><tbody>
<tr><td><strong>Febrile seizure (simple)</strong></td><td>Generalized tonic-clonic, &lt;15 min, single, with fever, age 6mo–5yr</td><td>6 months–5 years</td></tr>
<tr><td><strong>Febrile seizure (complex)</strong></td><td>Focal, >15 min, recurrent within 24h, or prolonged postictal</td><td>6 months–5 years</td></tr>
<tr><td><strong>Afebrile unprovoked</strong></td><td>No fever or acute precipitant — may be epilepsy</td><td>Any age</td></tr>
<tr><td><strong>Provoked</strong></td><td>Hypoglycemia, hyponatremia, toxic ingestion, head trauma, meningitis</td><td>Any age</td></tr>
<tr><td><strong>Status epilepticus</strong></td><td>≥5 min continuous seizure OR ≥2 seizures without return to baseline</td><td>Any age</td></tr>
</tbody></table>`,
t2:`<p><strong>First-time afebrile seizure workup:</strong></p>
<ol class="sl">
<li><strong>Glucose</strong> (STAT bedside) — most important reversible cause</li>
<li><strong>BMP</strong> (Na, K, Ca, Mg, glucose, BUN, Cr)</li>
<li><strong>If febrile + &lt;12 months:</strong> consider LP (meningitis may present as seizure without classic meningeal signs in infants)</li>
<li><strong>If prolonged or focal:</strong> Head CT (emergent) to rule out mass, hemorrhage, stroke</li>
<li><strong>EEG:</strong> outpatient within 24–48h for unprovoked first seizure (detects epileptiform activity in ~30%)</li>
<li><strong>MRI brain:</strong> outpatient for unprovoked afebrile seizure (structural cause found in ~15%)</li>
<li><strong>Toxicology screen</strong> if ingestion suspected</li>
</ol>
<div class="bx bg">✓ <strong>AAP 2011:</strong> Routine labs, EEG, and neuroimaging are NOT recommended for simple febrile seizures in well-appearing children 6–60 months. Reassurance and parent education are the main intervention.</div>`
},children:[
{name:"Simple Febrile\nSeizure",icon:"🌡️",type:"action",sub:"Age 6mo–5yr · Generalized · <15 min · Benign",edge:"Febrile +\ngeneralized\n< 15 min",
info:{tabs:["Management","Parent Counseling","When to Worry"],
t0:`<ul><li><strong>No workup needed</strong> for typical simple febrile seizure in a well-appearing child 6–60 months</li>
<li>No routine labs, LP, EEG, or imaging per AAP 2011</li>
<li>Evaluate the source of fever (otitis, UTI, viral illness) — treat the underlying infection</li>
<li>Acetaminophen/ibuprofen for comfort — but antipyretics do NOT prevent febrile seizures</li>
<li>No anti-epileptic medications indicated</li></ul>`,
t1:`<p><strong>Key parent education points:</strong></p>
<ul><li>"Febrile seizures are COMMON (2–5% of children) and BENIGN."</li>
<li>"They do NOT cause brain damage, developmental delay, or epilepsy."</li>
<li>"~30% will have another febrile seizure, but this does NOT mean your child has epilepsy."</li>
<li>"Risk of developing epilepsy is only slightly higher than the general population (~2% vs 1%)."</li>
<li>"If it happens again: lay child on their side, don't put anything in their mouth, time the seizure, call 911 if >5 minutes."</li>
<li>"Antipyretic medications (Tylenol/Motrin) treat fever for comfort but do NOT prevent seizures."</li></ul>`,
t2:`<p><strong>Red flags that suggest this is NOT a simple febrile seizure:</strong></p>
<ul><li>Age &lt;6 months or >5 years</li>
<li>Focal features (one-sided jerking, eye deviation to one side)</li>
<li>Duration >15 minutes</li>
<li>Multiple seizures within 24 hours</li>
<li>Prolonged postictal period (>30 min to return to baseline)</li>
<li>Meningeal signs (nuchal rigidity, Kernig, Brudzinski)</li>
<li>Prior neurologic abnormality</li>
<li>Recent antibiotic use (may mask meningitis)</li></ul>`
}},
{name:"Status\nEpilepticus",icon:"🔴",type:"emergency",sub:"≥5 min · Benzodiazepine FIRST · Time-based protocol",edge:"Seizure\n≥ 5 min",
info:{tabs:["Time-Based Protocol","Medications Table","Refractory Status"],
t0:`<p><strong>Pediatric Status Epilepticus — Time-Based Treatment Algorithm:</strong></p>
<ol class="sl">
<li><strong>0–5 min (Stabilization):</strong> ABCs. Glucose (STAT). Place on side. O₂. Monitor. IV access if possible.</li>
<li><strong>5 min (1st-line benzodiazepine):</strong> Midazolam 0.2 mg/kg IM/IN (max 10 mg) — preferred if no IV. OR Lorazepam 0.1 mg/kg IV (max 4 mg). OR Diazepam 0.2 mg/kg IV (max 10 mg) or 0.5 mg/kg PR (max 20 mg).</li>
<li><strong>10–15 min (2nd dose benzo if still seizing):</strong> Repeat same benzodiazepine × 1. Max 2 doses total.</li>
<li><strong>15–20 min (2nd-line ASM):</strong> Fosphenytoin 20 mg PE/kg IV over 10–20 min. OR Levetiracetam 40–60 mg/kg IV over 15 min (max 4500 mg). OR Valproic acid 20–40 mg/kg IV over 5 min (avoid in &lt;2 yr, hepatic disease, or suspected metabolic disorder).</li>
<li><strong>30+ min (Refractory — 3rd-line):</strong> Repeat 2nd-line agent OR proceed to RSI + continuous infusion.</li>
</ol>
<div class="bx br">🚨 <strong>RAMPART trial (Silbergleit et al., NEJM 2012):</strong> IM midazolam was SUPERIOR to IV lorazepam for prehospital status epilepticus (73% vs 63% seizure cessation before ED arrival) because it could be given faster (no IV needed). IM midazolam is first-line when IV is not available.</div>`,
t1:`<table class="rt"><thead><tr><th>Drug</th><th>Route</th><th>Dose</th><th>Max</th><th>Onset</th></tr></thead><tbody>
<tr><td><strong>Midazolam</strong></td><td>IM, IN, buccal</td><td>0.2 mg/kg</td><td>10 mg</td><td>2–5 min</td></tr>
<tr><td><strong>Lorazepam</strong></td><td>IV</td><td>0.1 mg/kg</td><td>4 mg/dose</td><td>2–3 min</td></tr>
<tr><td><strong>Diazepam</strong></td><td>IV or PR</td><td>0.2 mg/kg IV; 0.5 mg/kg PR</td><td>10 mg IV; 20 mg PR</td><td>1–3 min IV; 5–10 PR</td></tr>
<tr><td><strong>Fosphenytoin</strong></td><td>IV</td><td>20 mg PE/kg</td><td>1500 mg PE</td><td>10–20 min</td></tr>
<tr><td><strong>Levetiracetam</strong></td><td>IV</td><td>40–60 mg/kg</td><td>4500 mg</td><td>15 min</td></tr>
<tr><td><strong>Valproic acid</strong></td><td>IV</td><td>20–40 mg/kg</td><td>3000 mg</td><td>5 min</td></tr>
</tbody></table>`,
t2:`<p><strong>Refractory status (>30 min, failed 2 ASMs):</strong></p>
<ul><li><strong>RSI and intubation</strong> (protect airway; enable continuous infusions)</li>
<li><strong>Midazolam infusion:</strong> Load 0.2 mg/kg, then 0.1–0.4 mg/kg/hr titrate to EEG seizure suppression</li>
<li><strong>Pentobarbital infusion:</strong> Load 5–15 mg/kg, then 0.5–5 mg/kg/hr (for super-refractory; requires continuous EEG, hemodynamic support)</li>
<li><strong>Ketamine:</strong> 1–2 mg/kg bolus then 1–5 mg/kg/hr (emerging evidence; NMDA receptor antagonist)</li>
<li><strong>Continuous EEG monitoring</strong> required for all refractory status to guide titration</li>
<li><strong>Investigate aggressively:</strong> MRI, LP, metabolic workup, autoimmune encephalitis panel, toxicology — refractory status often has a treatable underlying cause</li></ul>`
}}
]};
