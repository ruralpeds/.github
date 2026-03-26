// Clinical tree data — SIADH vs Cerebral Salt Wasting
// Source: 
// Auto-extracted from pediatric_siadh_csw_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Hyponatremia\n(Na < 135)",icon:"🧪",type:"assessment",sub:"Serum Na < 135 · Low serum osmolality · Elevated urine Na",edge:"",
info:{tabs:["Initial Workup","Common Causes in Children","Correction Rate Safety"],
t0:`<p><strong>Hyponatremia workup:</strong></p>
<ol class="sl">
<li><strong>Confirm:</strong> Serum Na, serum osmolality (must be low, &lt;280 mOsm/kg), glucose (correct Na for hyperglycemia: add 1.6 mEq/L per 100 mg/dL glucose above 100)</li>
<li><strong>Urine studies:</strong> Urine Na, urine osmolality, urine specific gravity</li>
<li><strong>Volume status:</strong> Weight trend, I&O balance, CVP if available, HR, BP, skin turgor, mucous membranes</li>
<li><strong>Serum uric acid + FEurate:</strong> Critical for SIADH vs CSW differentiation</li>
<li><strong>Additional:</strong> BUN, creatinine, TSH, cortisol (rule out hypothyroidism, adrenal insufficiency)</li>
</ol>
<div class="bx br">🚨 <strong>If symptomatic</strong> (seizures, altered consciousness, headache): Treat FIRST with 3% NaCl 3-5 mL/kg over 10-20 min, THEN diagnose.</div>`,
t1:`<p><strong>Pediatric causes of hyponatremia:</strong></p>
<ul>
<li><strong>SIADH:</strong> CNS infections/tumors, pneumonia, positive-pressure ventilation, pain/nausea/stress, medications (SSRIs, carbamazepine, vincristine, cyclophosphamide)</li>
<li><strong>Cerebral salt wasting:</strong> Neurosurgery, TBI, subarachnoid hemorrhage, brain tumors, hydrocephalus</li>
<li><strong>Adrenal insufficiency:</strong> CAH, Addison disease, steroid withdrawal</li>
<li><strong>Hypothyroidism:</strong> Severe myxedema</li>
<li><strong>Hypotonic IVF:</strong> Iatrogenic — most common preventable cause (AAP 2018 guideline addressed this)</li>
<li><strong>GI losses + hypotonic replacement:</strong> Gastroenteritis with free water replacement</li>
</ul>`,
t2:`<div class="bx br">🚨 <strong>Correction rate limits — BRIGHT-LINE SAFETY RULES:</strong></div>
<table class="rt"><thead><tr><th>Scenario</th><th>Maximum Rate</th><th>Rationale</th></tr></thead><tbody>
<tr><td>Chronic hyponatremia (&gt;48 hr)</td><td><strong>≤8-10 mEq/L per 24 hours</strong></td><td>Prevents osmotic demyelination syndrome (ODS/CPM)</td></tr>
<tr><td>Acute hyponatremia (&lt;48 hr)</td><td><strong>≤12 mEq/L per 24 hours</strong></td><td>Faster correction safer because brain has not adapted</td></tr>
<tr><td>Hypernatremia correction</td><td><strong>≤0.5 mEq/L per hour (10-12/24h)</strong></td><td>Prevents cerebral edema from idiogenic osmole mismatch</td></tr>
</tbody></table>
<p>Check sodium every 2-4 hours during active correction. If correcting too fast, consider DDAVP 1-2 mcg IV to slow correction.</p>`
},children:[
{name:"Symptomatic?\n(seizures, AMS)",icon:"🚨",type:"decision",sub:"Headache, nausea, confusion, lethargy, seizures",edge:"Na < 135",
info:{tabs:["Symptoms by Severity","Why Children Are Vulnerable"],
t0:`<table class="rt"><thead><tr><th>Severity</th><th>Na Range</th><th>Symptoms</th></tr></thead><tbody>
<tr><td>Mild</td><td>130-134</td><td>Often asymptomatic, may have nausea, headache</td></tr>
<tr><td>Moderate</td><td>125-129</td><td>Nausea, vomiting, headache, confusion, lethargy</td></tr>
<tr><td>Severe</td><td>&lt;125</td><td>Seizures, obtundation, coma, respiratory arrest, cerebral herniation</td></tr>
</tbody></table>`,
t1:`<p>Children have a <strong>larger brain-to-skull ratio</strong> than adults, leaving less room for cerebral edema. Hyponatremic encephalopathy is more likely to cause herniation in children. Moritz and Ayus documented <strong>over 50 cases of neurologic morbidity including 26 deaths</strong> from hospital-acquired hyponatremia in children (PMID: 12563043).</p>`
},children:[
{name:"3% NaCl\nEmergent Bolus",icon:"💉",type:"emergency",sub:"3-5 mL/kg over 10-20 min · Raises Na ~4-6 mEq/L",edge:"YES —\nseizures/AMS",
info:{tabs:["3% NaCl Protocol","Peripheral IV Safety","Evidence"],
t0:`<ol class="sl">
<li><strong>3% NaCl: 3-5 mL/kg IV over 10-20 minutes</strong> (513 mEq/L Na)</li>
<li>Expected rise: ~4-6 mEq/L acutely</li>
<li>May repeat once if seizures persist after 15 min</li>
<li>Recheck Na immediately after bolus, then q2h</li>
<li>Once seizures stop, transition to slower correction protocol</li>
<li><strong>Total correction must not exceed 8-10 mEq/L in first 24 hours</strong> for chronic hyponatremia</li>
</ol>
<div class="bx br">🚨 Na deficit formula: <strong>Na deficit (mEq) = 0.6 × weight (kg) × (desired Na - current Na)</strong></div>`,
t1:`<p><strong>Peripheral IV administration of 3% NaCl is SAFE for emergent boluses.</strong> Brenkert et al. (PMID: 23283268) showed 87% of pediatric ED 3% NaCl doses were given peripherally without complications. Do NOT delay treatment waiting for central access.</p>`,
t2:`<p><strong>Evidence:</strong> Sarnaik et al. (PMID: 2055051) demonstrated that 3% NaCl 4-6 mL/kg boluses stopped hyponatremic seizures in all children, while conventional anticonvulsants alone failed in 13/28 cases. Hyponatremic seizures are a <strong>sodium problem, not a seizure problem</strong> — fix the sodium.</p>`
},children:[
{name:"Assess\nVolume Status",icon:"📊",type:"assessment",sub:"Weight trend · I&O · CVP · BUN · Clinical exam",edge:"Seizures\ncontrolled",
info:{tabs:["Volume Assessment","Key Labs"],
t0:`<p><strong>Volume status is THE critical differentiator between SIADH and CSW.</strong></p>
<ul>
<li><strong>Weight:</strong> Daily weights — gained weight suggests SIADH (dilutional); lost weight suggests CSW (salt wasting + dehydration)</li>
<li><strong>I&O:</strong> Negative fluid balance suggests CSW; positive/neutral suggests SIADH</li>
<li><strong>Heart rate / BP:</strong> Tachycardia and hypotension suggest hypovolemia (CSW)</li>
<li><strong>BUN:</strong> Low/dilutional in SIADH; elevated in CSW (hemoconcentration)</li>
<li><strong>Urine output:</strong> Decreased in SIADH; polyuria in CSW</li>
<li><strong>CVP:</strong> Normal/high in SIADH; low in CSW</li>
</ul>`,
t1:`<table class="rt"><thead><tr><th>Lab</th><th>SIADH</th><th>CSW</th></tr></thead><tbody>
<tr><td>Urine Na</td><td>&gt;40 mEq/L</td><td>&gt;40 mEq/L (SAME)</td></tr>
<tr><td>Urine Osm</td><td>&gt;100 mOsm/kg</td><td>&gt;100 mOsm/kg (SAME)</td></tr>
<tr><td>Serum uric acid</td><td>Low</td><td>Low (SAME)</td></tr>
<tr><td>24h urine Na excretion</td><td>~51 mmol/24h</td><td><strong>~394 mmol/24h</strong></td></tr>
<tr><td>FEurate (during hyponatremia)</td><td>Elevated (&gt;11%)</td><td>Elevated (&gt;11%) (SAME)</td></tr>
<tr><td><strong>FEurate AFTER Na corrected</strong></td><td><strong>Normalizes (4-11%)</strong></td><td><strong>Remains elevated (&gt;11%)</strong></td></tr>
</tbody></table>
<div class="bx bo">⚠️ <strong>FEurate after Na correction is the most reliable differentiator</strong> (Bardanzellu et al., Pediatr Nephrol 2022; PMID: 34468821).</div>`
}}]
},
{name:"Assess\nVolume Status",icon:"📊",type:"assessment",sub:"Weight trend · I&O · CVP · BUN · Clinical exam",edge:"NO —\nasymptomatic",
info:{tabs:["Evaluation Algorithm"],
t0:`<ol class="sl">
<li>Confirm true hypotonic hyponatremia (low serum osm, not pseudohyponatremia)</li>
<li>Check urine Na and urine osmolality</li>
<li>If urine Na &gt;40 AND urine osm &gt;100 → SIADH or CSW (need volume status to differentiate)</li>
<li>If urine Na &lt;20 → extrarenal losses or low effective circulating volume</li>
<li>Assess daily weight trend, I&O, BUN, CVP</li>
<li>Order serum uric acid and calculate FEurate</li>
</ol>`
}}
]},
{name:"SIADH vs CSW\nDifferentiation",icon:"⚖️",type:"decision",sub:"Both have: low Na, elevated UNa, low serum osm",edge:"Volume\nassessment",
info:{tabs:["Comparison Table","FEurate — The Key Test","When Uncertain"],
t0:`<table class="dt"><thead><tr><th>Parameter</th><th>SIADH</th><th>CSW</th></tr></thead><tbody>
<tr><td><strong>Volume status</strong></td><td>Euvolemic / hypervolemic</td><td><strong>Hypovolemic</strong></td></tr>
<tr><td>Body weight</td><td>Stable or increased</td><td><strong>Decreased</strong></td></tr>
<tr><td>Urine output</td><td>Decreased / normal</td><td><strong>Polyuria</strong></td></tr>
<tr><td>CVP</td><td>Normal / high</td><td><strong>Low</strong></td></tr>
<tr><td>BUN</td><td>Low (dilutional)</td><td><strong>Elevated</strong></td></tr>
<tr><td>Fluid balance</td><td>Positive / neutral</td><td><strong>Negative</strong></td></tr>
<tr><td>24h urine Na</td><td>~51 mmol/24h</td><td><strong>~394 mmol/24h</strong></td></tr>
<tr><td>FEurate after Na correction</td><td><strong>Normalizes (4-11%)</strong></td><td><strong>Remains &gt;11%</strong></td></tr>
<tr><td>Fluid restriction response</td><td>Improves</td><td><strong>WORSENS</strong></td></tr>
</tbody></table>`,
t1:`<p><strong>Fractional excretion of uric acid (FEurate)</strong> is calculated as:</p>
<p style="font-family:'IBM Plex Mono',monospace;font-size:14px;padding:8px;background:var(--surface);border-radius:6px;margin:8px 0">FEurate = (Urine uric acid × Serum Cr) / (Serum uric acid × Urine Cr) × 100</p>
<p><strong>During hyponatremia:</strong> Both SIADH and CSW show elevated FEurate (&gt;11%) — not helpful yet.</p>
<p><strong>After sodium is corrected to normal:</strong></p>
<ul>
<li><strong>SIADH:</strong> FEurate normalizes to 4-11% → confirms SIADH</li>
<li><strong>CSW:</strong> FEurate remains &gt;11% → confirms CSW</li>
</ul>
<div class="bx bg">✓ This is the <strong>single most reliable differentiator</strong> and should be checked once Na is corrected (Bardanzellu et al., PMID: 34468821).</div>`,
t2:`<div class="bx br">🚨 <strong>When uncertain between SIADH and CSW, treat as CSW.</strong> Volume expansion is safer than restriction in neurosurgical patients. Restricting fluids in a patient with CSW worsens hypovolemia and threatens cerebral perfusion.</div>
<p>Re-evaluate after 12-24 hours of NS infusion: if Na rises and patient improves → likely CSW. If Na fails to correct or worsens → likely SIADH, switch to restriction.</p>`
},children:[
{name:"SIADH\nConfirmed",icon:"💧",type:"diagnosis",sub:"Euvolemic · FEurate normalizes after Na correction",edge:"Euvolemic\nweight stable",
info:{tabs:["Treatment Protocol","Common Causes","Monitoring"],
t0:`<p><strong>SIADH management — RESTRICT fluids:</strong></p>
<ol class="sl">
<li><strong>Fluid restrict to 2/3 maintenance</strong> (first-line)</li>
<li>If Na not improving after 24-48h, restrict to <strong>1/2 maintenance</strong></li>
<li>Isotonic saline for any necessary IV access (do NOT use hypotonic)</li>
<li>Address underlying cause (treat infection, stop offending medications)</li>
<li>If refractory: consider salt tablets (1-2 g NaCl PO q6-8h) or loop diuretics</li>
<li>For severe refractory SIADH: <strong>tolvaptan</strong> (V2 receptor antagonist) — specialist consultation required</li>
</ol>
<div class="bx bo">⚠️ Fluid restriction in SIADH is therapeutic. But fluid restriction in CSW is <strong>DANGEROUS</strong> — always confirm diagnosis before restricting.</div>`,
t1:`<p><strong>Common pediatric SIADH causes:</strong></p>
<ul>
<li><strong>CNS:</strong> Meningitis, encephalitis, brain tumors, head trauma, neurosurgery, seizures</li>
<li><strong>Pulmonary:</strong> Pneumonia, bronchiolitis (especially RSV), positive-pressure ventilation, asthma</li>
<li><strong>Medications:</strong> SSRIs, carbamazepine, oxcarbazepine, vincristine, cyclophosphamide, desmopressin, opioids</li>
<li><strong>Other:</strong> Pain, nausea, stress, postoperative state (ADH elevated 3+ days post-op)</li>
</ul>
<p>~30% of hospitalized febrile children meet criteria for SIAD.</p>`,
t2:`<p><strong>Monitoring during SIADH treatment:</strong></p>
<ul>
<li>Na every 4-8 hours initially, then every 12-24 hours once stable</li>
<li>Daily weights (should stabilize or decrease)</li>
<li>Strict I&O</li>
<li>Urine specific gravity and osmolality</li>
<li>Ensure correction rate &lt;8-10 mEq/L per 24 hours</li>
</ul>`
}},
{name:"Cerebral Salt\nWasting",icon:"🧂",type:"diagnosis",sub:"Hypovolemic · Polyuria · FEurate stays elevated",edge:"Hypovolemic\nweight loss",
info:{tabs:["Treatment Protocol","Causes","Key Differences from SIADH"],
t0:`<p><strong>CSW management — EXPAND volume:</strong></p>
<ol class="sl">
<li><strong>0.9% NS at 1.5-2× maintenance</strong> — replace sodium and volume</li>
<li>If Na &lt;120 or symptomatic: <strong>3% NaCl at 0.5-1 mL/kg/hr</strong> continuous infusion (with q2h Na checks)</li>
<li><strong>Replace ongoing urinary sodium losses</strong> — measure 24h urine Na and replace mEq-for-mEq</li>
<li>Oral NaCl supplementation: 1-2 g PO q6-8h if tolerating oral</li>
<li>Fludrocortisone 0.05-0.2 mg PO daily (mineralocorticoid — promotes Na retention)</li>
<li>Monitor weight, urine output, Na closely</li>
</ol>
<div class="bx br">🚨 <strong>Treating CSW with fluid restriction (as you would SIADH) worsens hypovolemia and threatens cerebral perfusion.</strong> This is the highest-risk misdiagnosis in pediatric sodium management.</div>`,
t1:`<p><strong>CSW causes:</strong></p>
<ul>
<li><strong>Neurosurgery</strong> (most common) — especially posterior fossa, hypothalamic/pituitary region</li>
<li><strong>Traumatic brain injury</strong></li>
<li><strong>Subarachnoid hemorrhage</strong></li>
<li><strong>Brain tumors</strong> (craniopharyngioma, glioma)</li>
<li><strong>Hydrocephalus</strong></li>
<li><strong>Meningitis / encephalitis</strong></li>
</ul>
<p>Mechanism: Release of <strong>brain natriuretic peptide (BNP)</strong> and possibly other natriuretic factors from injured brain tissue causes renal sodium wasting and volume depletion.</p>`,
t2:`<div class="bx bo">⚠️ <strong>The critical difference:</strong> SIADH = too much water (dilutional). CSW = too little sodium (true depletion). Both show low Na and high urine Na — but the volume status and treatment are OPPOSITE.</div>
<p>In SIADH, ADH retains water → euvolemia/hypervolemia → restriction works.</p>
<p>In CSW, natriuretic peptides waste sodium → hypovolemia → expansion required.</p>
<p><strong>FEurate after correction resolves the ambiguity.</strong></p>`
}}
]},
{name:"Hypertonic Saline\nContinuous Infusion",icon:"⏱️",type:"urgent",sub:"3% NaCl 0.5-1 mL/kg/hr · Check Na q2h · Max 8-10 mEq/24h",edge:"Severe\nNa < 120",
info:{tabs:["Continuous Infusion Protocol","Rate Calculation","Overcorrection Rescue"],
t0:`<p><strong>3% NaCl continuous infusion for severe hyponatremia:</strong></p>
<ol class="sl">
<li>Start at <strong>0.5-1 mL/kg/hr</strong></li>
<li>Check Na every <strong>2 hours</strong></li>
<li>Target rise: <strong>1-2 mEq/L per hour</strong> initially, then slow</li>
<li><strong>Maximum total correction: 8-10 mEq/L in first 24 hours</strong></li>
<li>Once Na &gt;125 and asymptomatic, transition to isotonic maintenance and treat underlying cause</li>
</ol>`,
t1:`<p><strong>3% NaCl infusion rate calculation:</strong></p>
<p style="font-family:'IBM Plex Mono',monospace;font-size:13px;padding:8px;background:var(--surface);border-radius:6px;margin:8px 0">Rate (mL/hr) = Desired Na rise (mEq/hr) × TBW (L) / 513</p>
<p>Where TBW = 0.6 × weight (kg) for children</p>
<p>3% NaCl = 513 mEq/L Na</p>`,
t2:`<p><strong>If Na corrects too fast (&gt;10-12 mEq/L in 24h):</strong></p>
<ol class="sl">
<li><strong>Stop hypertonic saline immediately</strong></li>
<li>Switch to D5W to lower sodium back toward safe correction range</li>
<li><strong>DDAVP 1-2 mcg IV q8h</strong> — prevents further water excretion, effectively pauses correction</li>
<li>Target: bring Na back to no more than 8 mEq/L above the starting value for that 24-hour period</li>
<li>Osmotic demyelination syndrome risk is highest with chronic (&gt;48h) hyponatremia corrected too fast</li>
</ol>`
}}
]};
