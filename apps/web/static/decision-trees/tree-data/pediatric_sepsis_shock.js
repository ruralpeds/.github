// Clinical tree data — Pediatric Sepsis & Shock Decision Tree
// Source: 
// Auto-extracted from pediatric_sepsis_shock_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric Sepsis\n& Shock",icon:"🩸",type:"assessment",sub:"Surviving Sepsis 2020 · Fluid vs vasopressor · Warm vs cold",edge:"",
info:{tabs:["Recognition","Surviving Sepsis Campaign","Phoenix Sepsis Criteria 2024"],
t0:`<p><strong>Pediatric sepsis recognition:</strong> Suspected or confirmed infection PLUS systemic inflammatory response OR organ dysfunction. Sepsis is a TIME-SENSITIVE emergency — every hour of delay in antibiotics increases mortality by 3–8%.</p>
<p><strong>Clinical signs:</strong></p>
<ul><li>Fever or hypothermia + tachycardia + tachypnea</li>
<li>Altered mental status (irritability, lethargy, confusion)</li>
<li>Prolonged capillary refill (>2 sec) OR flash capillary refill (&lt;1 sec)</li>
<li>Weak or bounding pulses</li>
<li>Mottled/cool/pale extremities OR warm flushed skin with widened pulse pressure</li>
<li>Decreased urine output (&lt;1 mL/kg/hr)</li></ul>`,
t1:`<p><strong>Surviving Sepsis Campaign 2020 — First Hour Bundle:</strong></p>
<ol class="sl">
<li><strong>Recognize:</strong> Screen for sepsis (fever/hypothermia + tachycardia + perfusion abnormality)</li>
<li><strong>Access:</strong> IV/IO within 5 minutes. Start fluid resuscitation.</li>
<li><strong>Antibiotics:</strong> Broad-spectrum within 1 hour of recognition (ideally within 30 min). Blood culture BEFORE if possible, but do NOT delay antibiotics.</li>
<li><strong>Fluids:</strong> NS or LR 10–20 mL/kg bolus over 5–20 min. Reassess after EACH bolus. May give up to 40–60 mL/kg in first hour. Monitor for fluid overload (hepatomegaly, crackles, worsening respiratory distress).</li>
<li><strong>Vasopressors:</strong> If shock persists after 40–60 mL/kg fluids, start vasopressor/inotrope (epinephrine or norepinephrine). CAN be given peripherally initially while central access is obtained.</li>
<li><strong>Steroids:</strong> Consider hydrocortisone 1–2 mg/kg IV if fluid-refractory AND catecholamine-resistant shock (suspect adrenal insufficiency).</li>
</ol>`,
t2:`<p><strong>Phoenix Sepsis Criteria (JAMA 2024):</strong></p>
<ul><li>New international consensus for pediatric sepsis and septic shock (replacing 2005 IPSCC criteria)</li>
<li>Based on the Phoenix Sepsis Score: points from 4 organ systems (respiratory, cardiovascular, coagulation, neurologic)</li>
<li>Sepsis = suspected infection + Phoenix Sepsis Score ≥2</li>
<li>Septic shock = sepsis + cardiovascular dysfunction (vasoactive requirement OR lactate >5 mmol/L)</li>
<li>Validated in >3 million pediatric encounters from 10 countries</li></ul>
<div class="bx bg">✓ <strong>Phoenix criteria simplify and standardize</strong> the definition of pediatric sepsis globally. They focus on organ dysfunction (the key prognostic driver) rather than SIRS criteria (which were overly sensitive and nonspecific).</div>`
},children:[
{name:"Fluid\nResuscitation",icon:"💧",type:"emergency",sub:"NS/LR 10–20 mL/kg boluses · Max 40–60 mL/kg/hr",edge:"Shock\nrecognized",
info:{tabs:["Fluid Protocol","Reassessment","FEAST Considerations"],
t0:`<ol class="sl">
<li><strong>NS or LR bolus 10–20 mL/kg</strong> over 5–20 minutes (push-pull syringe technique for fastest delivery)</li>
<li><strong>Reassess after EACH bolus:</strong> HR, BP, capillary refill, mental status, urine output</li>
<li><strong>Repeat up to 40–60 mL/kg in first hour</strong> if shock persists</li>
<li><strong>Monitor for fluid overload:</strong> hepatomegaly (check liver edge before and after boluses), new crackles, worsening respiratory distress, periorbital edema</li>
<li>If fluid overload develops or shock persists after 40–60 mL/kg → vasopressors</li>
</ol>`,
t1:`<p><strong>Reassessment targets after each bolus:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Target</th></tr></thead><tbody>
<tr><td>Heart rate</td><td>Trending toward normal for age</td></tr>
<tr><td>Blood pressure</td><td>MAP ≥ 5th percentile for age + adequate pulse pressure</td></tr>
<tr><td>Capillary refill</td><td>≤2 seconds</td></tr>
<tr><td>Mental status</td><td>Improving alertness</td></tr>
<tr><td>Urine output</td><td>≥1 mL/kg/hr</td></tr>
<tr><td>Lactate</td><td>Declining (if initially elevated)</td></tr>
</tbody></table>`,
t2:`<div class="bx bo">⚠️ <strong>FEAST trial (Maitland et al., NEJM 2011):</strong> In a resource-limited African setting, fluid boluses INCREASED mortality in febrile children with impaired perfusion (mostly malaria). This does NOT apply to well-resourced settings with ICU capability, but it highlights that fluid resuscitation must be MONITORED and TITRATED, not given reflexively. Reassess after every bolus.</div>`
}},
{name:"Warm vs Cold\nShock",icon:"🌡️",type:"decision",sub:"Cold = vasoconstricted · Warm = vasodilated · Different Rx",edge:"Perfusion\nassessment",
info:{tabs:["Differentiation","Vasopressor Selection"],
t0:`<table class="dt"><thead><tr><th>Feature</th><th>Cold Shock (most common in peds)</th><th>Warm Shock</th></tr></thead><tbody>
<tr><td>Extremities</td><td>Cool, mottled, pale</td><td>Warm, flushed</td></tr>
<tr><td>Capillary refill</td><td>Prolonged (>2 sec)</td><td>Flash (&lt;1 sec)</td></tr>
<tr><td>Pulses</td><td>Weak, thready</td><td>Bounding</td></tr>
<tr><td>Pulse pressure</td><td>Narrow</td><td>Wide</td></tr>
<tr><td>Pathophysiology</td><td>Low cardiac output, high SVR</td><td>High cardiac output, low SVR</td></tr>
<tr><td>Most common age</td><td>Infants and young children</td><td>Older children and adolescents</td></tr>
</tbody></table>`,
t1:`<table class="rt"><thead><tr><th>Shock Type</th><th>First-Line Vasopressor</th><th>Rationale</th></tr></thead><tbody>
<tr><td><strong>Cold shock</strong></td><td><strong>Epinephrine</strong> 0.05–0.3 µg/kg/min</td><td>Increases cardiac output (β₁ inotrope) + vasoconstriction (α₁). Preferred for low-output states.</td></tr>
<tr><td><strong>Warm shock</strong></td><td><strong>Norepinephrine</strong> 0.05–0.5 µg/kg/min</td><td>Primarily vasoconstriction (α₁) to increase SVR. Less chronotropic than epinephrine.</td></tr>
<tr><td><strong>Fluid-refractory + catecholamine-resistant</strong></td><td>Add <strong>vasopressin</strong> 0.0003–0.002 U/kg/min</td><td>Non-catecholamine vasopressor. Useful when catecholamines are failing.</td></tr>
<tr><td><strong>Low CO despite epinephrine</strong></td><td>Add <strong>milrinone</strong> 0.25–0.75 µg/kg/min</td><td>PDE3 inhibitor: inotrope + vasodilator (lusitrope). Improves CO and reduces afterload.</td></tr>
</tbody></table>
<div class="bx bb">ℹ️ <strong>Epinephrine and norepinephrine CAN be given through a peripheral IV</strong> while central access is being obtained. Do NOT delay vasopressors because a central line isn't in yet. Monitor the IV site for extravasation.</div>`
}},
{name:"Empiric\nAntibiotics",icon:"💊",type:"action",sub:"Within 1 hour · Blood culture first · Age-based",edge:"Infection\nsuspected",
info:{tabs:["Age-Based Regimens","Special Situations"],
t0:`<table class="rt"><thead><tr><th>Age</th><th>Empiric Regimen</th><th>Covers</th></tr></thead><tbody>
<tr><td><strong>0–28 days</strong></td><td>Ampicillin + Gentamicin (± cefotaxime if meningitis suspected)</td><td>GBS, E. coli, Listeria, Enterococcus</td></tr>
<tr><td><strong>29–90 days</strong></td><td>Ceftriaxone + Vancomycin (± Ampicillin if &lt;60 days for Listeria)</td><td>GBS, E. coli, S. pneumoniae, Listeria, S. aureus</td></tr>
<tr><td><strong>>90 days (community)</strong></td><td>Ceftriaxone ± Vancomycin</td><td>S. pneumoniae, N. meningitidis, S. aureus, GAS</td></tr>
<tr><td><strong>Nosocomial / immunocompromised</strong></td><td>Vancomycin + Meropenem (or Cefepime + Vancomycin)</td><td>MRSA, Pseudomonas, ESBL organisms</td></tr>
</tbody></table>
<div class="bx br">🚨 <strong>Antibiotics within 1 HOUR of sepsis recognition.</strong> Each hour delay = 3–8% increase in mortality. Obtain blood culture before antibiotics IF it can be done within minutes. Do NOT delay antibiotics waiting for labs or imaging.</div>`,
t1:`<p><strong>Special situations:</strong></p>
<ul><li><strong>Toxic shock syndrome (GAS or S. aureus):</strong> Add clindamycin (stops toxin production by inhibiting ribosomal protein synthesis). IVIG 1–2 g/kg for refractory TSS.</li>
<li><strong>Meningococcemia:</strong> Ceftriaxone high-dose. Dexamethasone 0.15 mg/kg q6h × 4 days (started before or with first antibiotic dose for H. flu meningitis; controversial for other organisms).</li>
<li><strong>Febrile neutropenia:</strong> Cefepime monotherapy (or meropenem). Add vancomycin if CLABSI suspected, mucositis, or hemodynamic instability.</li>
<li><strong>Suspected intra-abdominal source:</strong> Add metronidazole for anaerobic coverage (or use piperacillin-tazobactam or meropenem which cover anaerobes).</li></ul>`
}}
]};
