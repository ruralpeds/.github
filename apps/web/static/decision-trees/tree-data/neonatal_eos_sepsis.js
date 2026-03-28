// Clinical tree data — Neonatal Early-Onset Sepsis (EOS) Decision Tree
// Sources: AAP Clinical Report on EOS (Pediatrics 2022;150(6):e2022059615),
//          Kaiser EOS Calculator (Escobar et al.), Puopolo et al. NeoReviews,
//          Verani et al. MMWR GBS prevention guidelines (2010/2020)
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal EOS\nEvaluation",icon:"🦠",type:"assessment",sub:"Term & Late Preterm ≥35 wks · Risk-based approach · AAP 2022",edge:"",
info:{tabs:["EOS Definition","Risk Factors","GBS Prevention","EOS Calculator"],
t0:`<p><strong>Early-Onset Sepsis (EOS) Definition:</strong></p>
<p>Blood or CSF culture-confirmed infection in infants ≥35 weeks GA occurring at 0–72 hours of life.</p>
<table class="rt"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>
<tr><td>Incidence (term)</td><td>~0.5–1 per 1,000 live births (USA)</td></tr>
<tr><td>Incidence (late preterm)</td><td>~3–5 per 1,000 live births</td></tr>
<tr><td>Most common organisms</td><td>Group B Streptococcus (GBS), E. coli</td></tr>
<tr><td>GBS proportion</td><td>~40–45% of EOS in term infants</td></tr>
<tr><td>E. coli proportion</td><td>~30–35% (dominant in preterm)</td></tr>
<tr><td>Mortality (term)</td><td>~2–5%</td></tr>
<tr><td>Mortality (preterm)</td><td>~10–30%</td></tr>
</tbody></table>
<div class="bx bb">ℹ️ The 2022 AAP guidance moved from universal CBC-based sepsis screening to a <strong>risk-based clinical assessment</strong> for ≥35-week infants, integrating EOS Calculator risk scores with clinical condition.</div>`,
t1:`<p><strong>Maternal risk factors for EOS:</strong></p>
<table class="rt"><thead><tr><th>Risk Factor</th><th>Notes</th></tr></thead><tbody>
<tr><td>GBS-positive vaginal/rectal culture</td><td>Primary risk factor. IAP reduces EOS ~80%.</td></tr>
<tr><td>GBS bacteriuria this pregnancy</td><td>Treat as GBS-positive; IAP required</td></tr>
<tr><td>Prior infant with GBS disease</td><td>IAP regardless of current culture</td></tr>
<tr><td>Intrapartum fever ≥38°C (100.4°F)</td><td>Single strongest clinical risk factor</td></tr>
<tr><td>ROM ≥18 hours</td><td>Prolonged ROM increases colonization risk</td></tr>
<tr><td>Chorioamnionitis (clinical or histologic)</td><td>High risk — treat infant empirically</td></tr>
<tr><td>Preterm labor ≤36 6/7 weeks</td><td>Increases EOS risk 3–5×</td></tr>
<tr><td>GBS unknown + ROM ≥18h + intrapartum fever</td><td>Treat as if GBS-positive</td></tr>
</tbody></table>`,
t2:`<p><strong>IAP (Intrapartum Antibiotic Prophylaxis) — effectiveness by regimen:</strong></p>
<table class="rt"><thead><tr><th>Drug</th><th>IAP Adequacy</th><th>Notes</th></tr></thead><tbody>
<tr><td>Penicillin G 5M units IV → 2.5M q4h</td><td>Adequate if ≥4h before delivery</td><td>Preferred — narrowest spectrum</td></tr>
<tr><td>Ampicillin 2g IV → 1g q4h</td><td>Adequate if ≥4h before delivery</td><td>Acceptable alternative</td></tr>
<tr><td>Cefazolin 2g IV → 1g q8h</td><td>Adequate if ≥4h before delivery</td><td>For penicillin allergy (low risk)</td></tr>
<tr><td>Clindamycin (if susceptible)</td><td>Adequate if ≥4h before delivery</td><td>Penicillin allergy, high risk</td></tr>
<tr><td>Vancomycin 1g IV q12h</td><td>Adequate if ≥4h before delivery</td><td>GBS resistant to clindamycin</td></tr>
</tbody></table>
<p><strong>Inadequate IAP:</strong> &lt;4 hours before delivery, or antibiotic not appropriate for GBS.</p>`,
t3:`<p><strong>Kaiser EOS Calculator (Escobar, Puopolo et al.):</strong></p>
<p>Evidence-based tool incorporating GA, highest intrapartum fever, duration of ROM, GBS status, and IAP adequacy to calculate risk per 1,000 live births. Available at: <strong>neonatalsepsiscalculator.kaiserpermanente.org</strong></p>
<table class="rt"><thead><tr><th>Risk (per 1,000)</th><th>Recommendation</th></tr></thead><tbody>
<tr><td>&lt;0.65 / 1,000</td><td>Routine care — no blood culture unless clinical signs</td></tr>
<tr><td>0.65–1.54 / 1,000</td><td>Enhanced clinical observation × 24–36h</td></tr>
<tr><td>≥1.54 / 1,000</td><td>Blood culture + empiric antibiotics</td></tr>
</tbody></table>
<div class="bx bb">ℹ️ The calculator reduces empiric antibiotic use by 50–65% vs universal CBC screening with equivalent or improved safety outcomes (Achten et al., Pediatrics 2019). Use in conjunction with clinical assessment.</div>`
},children:[
// ─── BRANCH 1: Clinical signs of sepsis ───
{name:"Clinical Signs\nPresent",icon:"🚨",type:"emergency",sub:"Respiratory distress · Fever/hypothermia · Hypotension · Lethargy",edge:"Any sign\nof illness",
info:{tabs:["Clinical Signs Table","Vital Sign Thresholds","Shock Recognition"],
t0:`<p><strong>Clinical signs mandating sepsis evaluation regardless of risk score:</strong></p>
<table class="rt"><thead><tr><th>System</th><th>Signs</th></tr></thead><tbody>
<tr><td>Respiratory</td><td>Respiratory distress, apnea, O₂ requirement, grunting, retractions</td></tr>
<tr><td>Cardiovascular</td><td>Tachycardia (&gt;180 term), bradycardia (&lt;100), hypotension, poor perfusion, mottling</td></tr>
<tr><td>Neurologic</td><td>Lethargy, hypotonia, irritability, seizures, temperature instability</td></tr>
<tr><td>GI</td><td>Poor feeding, abdominal distension, bilious emesis, bloody stools</td></tr>
<tr><td>Skin</td><td>Petechiae, purpura, jaundice &lt;24h, pallor, mottling</td></tr>
<tr><td>Temperature</td><td>Fever ≥38°C rectal or hypothermia &lt;36.5°C axillary</td></tr>
</tbody></table>`,
t1:`<p><strong>Vital sign thresholds for neonatal concern:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Term</th><th>Late Preterm</th></tr></thead><tbody>
<tr><td>HR (high)</td><td>&gt;180 bpm</td><td>&gt;180 bpm</td></tr>
<tr><td>HR (low)</td><td>&lt;100 bpm</td><td>&lt;100 bpm</td></tr>
<tr><td>RR (high)</td><td>&gt;60/min</td><td>&gt;60/min</td></tr>
<tr><td>Temp (fever)</td><td>≥38.0°C rectal</td><td>≥38.0°C rectal</td></tr>
<tr><td>Temp (hypothermia)</td><td>&lt;36.5°C axillary</td><td>&lt;36.5°C axillary</td></tr>
<tr><td>Glucose</td><td>&lt;40 mg/dL DOL0–2, &lt;45 mg/dL after</td><td>Same</td></tr>
<tr><td>SBP (low)</td><td>&lt;60 mmHg</td><td>&lt;50 mmHg</td></tr>
</tbody></table>`,
t2:`<p><strong>Neonatal septic shock recognition:</strong></p>
<ul>
<li><strong>Early (warm) shock:</strong> Tachycardia, bounding pulses, wide pulse pressure, flash capillary refill, warm extremities — vasodilatory phase</li>
<li><strong>Late (cold) shock:</strong> Tachycardia, weak/thready pulses, narrow pulse pressure, prolonged capillary refill (&gt;3 sec), cool extremities, mottling — vasoconstriction + cardiac failure</li>
</ul>
<div class="bx br">🚨 <strong>Neonates typically present in cold shock. The window from compensation to decompensation is minutes.</strong> Hypotension is a late sign — treat on clinical signs, not BP alone.</div>`
},children:[
{name:"Sepsis Workup\n+ Empiric Abx",icon:"💉",type:"action",sub:"Blood culture · CBC · CMP · CRP · LP if stable · Abx within 1hr",edge:"Ill-appearing\nor clinical signs",
info:{tabs:["Laboratory Workup","LP Indications","Empiric Antibiotics","Monitoring"],
t0:`<p><strong>Laboratory evaluation for symptomatic EOS:</strong></p>
<table class="rt"><thead><tr><th>Test</th><th>Target/Threshold</th><th>Notes</th></tr></thead><tbody>
<tr><td>Blood culture (aerobic)</td><td>2 mL minimum</td><td>Before antibiotics. Two sites if possible.</td></tr>
<tr><td>CBC with differential</td><td>WBC &lt;5 or &gt;25k; ANC &lt;1,750; I:T ratio &gt;0.2</td><td>Neither sensitive nor specific alone</td></tr>
<tr><td>CRP</td><td>Serial values more useful than single</td><td>Rises 12–24h after infection; &gt;10 mg/L abnormal</td></tr>
<tr><td>Procalcitonin</td><td>&gt;0.5 ng/mL DOL0–2; &gt;0.5 ng/mL after</td><td>Physiologically elevated DOL0–2 (birth surge)</td></tr>
<tr><td>BMP / CMP</td><td>Glucose, electrolytes, creatinine, BUN</td><td>Hypoglycemia, renal dysfunction suggest severity</td></tr>
<tr><td>Blood gas</td><td>pH, lactate, base deficit</td><td>Assess tissue perfusion and oxygenation</td></tr>
<tr><td>Urinalysis / urine culture</td><td>—</td><td>Late-onset sepsis only (EOS rarely from urinary source)</td></tr>
</tbody></table>`,
t1:`<p><strong>Lumbar puncture — when to perform:</strong></p>
<ul>
<li>Perform LP if clinically stable AND antibiotic treatment is planned</li>
<li>LP before antibiotics when feasible — antibiotics sterilize CSF within 2–4h</li>
<li>Defer LP if: hemodynamically unstable, respiratory compromise, coagulopathy, local infection overlying site, increased ICP signs</li>
<li>CSF culture is the only way to diagnose bacterial meningitis</li>
</ul>
<p><strong>Neonatal CSF normal values:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Term Normal</th><th>Preterm Normal</th></tr></thead><tbody>
<tr><td>WBC</td><td>0–22 cells/mm³</td><td>0–29 cells/mm³</td></tr>
<tr><td>Protein</td><td>20–120 mg/dL</td><td>45–180 mg/dL</td></tr>
<tr><td>Glucose</td><td>34–119 mg/dL</td><td>24–63 mg/dL</td></tr>
<tr><td>CSF:serum glucose ratio</td><td>&gt;0.44</td><td>&gt;0.44</td></tr>
</tbody></table>`,
t2:`<p><strong>Empiric antibiotic therapy for neonatal EOS (≥35 weeks):</strong></p>
<table class="rt"><thead><tr><th>Regimen</th><th>Dose</th><th>Indication</th></tr></thead><tbody>
<tr><td>Ampicillin + Gentamicin</td><td>Amp: 50 mg/kg q8–12h; Gent: 4–5 mg/kg q24–36h</td><td>Standard EOS without meningitis</td></tr>
<tr><td>Ampicillin + Cefotaxime</td><td>Amp: 50 mg/kg q6h; CTX: 50 mg/kg q6–12h</td><td>Meningitis suspected or confirmed (avoid cefotaxime shortage)</td></tr>
<tr><td>Ampicillin + Ceftazidime</td><td>Amp: 50 mg/kg; Caz: 30 mg/kg q8–12h</td><td>Gram-negative meningitis, gram-neg sepsis</td></tr>
</tbody></table>
<div class="bx bg">✓ <strong>Aminoglycosides remain effective against most EOS pathogens.</strong> Gentamicin resistance is rare for GBS. Extended-interval dosing (q24–36h) achieves higher peak levels (bactericidal) with less nephrotoxicity.</div>`,
t3:`<p><strong>Clinical monitoring after antibiotics started:</strong></p>
<ul>
<li>Vital signs q1h until stable, then q4h</li>
<li>Strict I&O — urine output goal 1–3 mL/kg/hr</li>
<li>Repeat CBC, CRP at 24–48h to assess response</li>
<li>Blood culture repeat at 24–48h if organism identified</li>
<li>Culture results review at 24–36–48h — narrow spectrum if sensitivities available</li>
<li><strong>Duration:</strong> GBS bacteremia = 10 days; E. coli bacteremia = 10–14 days; GBS meningitis = 14 days; Gram-neg meningitis = 21 days or 14 days after CSF sterilization</li>
</ul>`
}}
]},
// ─── BRANCH 2: Well-appearing, risk factor assessment ───
{name:"Well-Appearing\n→ Risk Assessment",icon:"🔍",type:"decision",sub:"No clinical signs · Use EOS Calculator + risk factors",edge:"No clinical\nsigns",
info:{tabs:["EOS Calculator Use","IAP Adequacy","Observation Protocol"],
t0:`<p><strong>How to use the Kaiser EOS Calculator for well-appearing infants:</strong></p>
<ol class="sl">
<li>Enter GA at birth (completed weeks)</li>
<li>Highest intrapartum maternal temperature (°C or °F)</li>
<li>Duration of ROM (hours)</li>
<li>GBS status: positive / negative / unknown</li>
<li>IAP: none / non-penicillin / penicillin-based</li>
<li>IAP duration: &lt;2h, 2–4h, ≥4h before delivery</li>
</ol>
<p>Calculator outputs risk per 1,000 live births and recommended management tier.</p>
<p>Available at: <em>neonatalsepsiscalculator.kaiserpermanente.org</em></p>`,
t1:`<p><strong>IAP adequacy matters for risk calculation:</strong></p>
<ul>
<li><strong>Adequate IAP:</strong> Penicillin G, ampicillin, or cefazolin ≥4 hours before delivery → reduces EOS risk ~80%</li>
<li><strong>Partial IAP:</strong> Appropriate antibiotic &lt;4h before delivery → partially protective</li>
<li><strong>Inadequate IAP:</strong> Wrong antibiotic, &lt;2h before delivery, or no IAP → full risk applies</li>
</ul>`,
t2:`<p><strong>Well-appearing infant observation protocol:</strong></p>
<table class="rt"><thead><tr><th>Risk Tier</th><th>Action</th></tr></thead><tbody>
<tr><td>&lt;0.65/1000</td><td>Routine newborn care. No cultures. Normal newborn monitoring.</td></tr>
<tr><td>0.65–1.54/1000</td><td>Enhanced observation: vital signs q4h × 24–36h. Lactation/feeding support. Discharge with return precautions.</td></tr>
<tr><td>≥1.54/1000</td><td>Blood culture + CBC. Start empiric antibiotics after cultures. LP if plan to treat.</td></tr>
<tr><td>Clinical chorioamnionitis</td><td>Blood culture + empiric antibiotics regardless of calculator score.</td></tr>
</tbody></table>`
},children:[
{name:"EOS Calculator\n≥1.54/1000 or Chorio",icon:"⚠️",type:"urgent",sub:"Blood culture → Empiric antibiotics",edge:"High risk",children:[
{name:"Blood Culture\n+ Empiric Abx",icon:"💉",type:"action",sub:"Amp + Gent · LP if stable · Review at 36–48h",edge:"Order empiric\ntreatment"}
]},
{name:"EOS Calculator\n0.65–1.54/1000",icon:"🔍",type:"assessment",sub:"Enhanced observation × 24–36h · No routine antibiotics",edge:"Medium risk",children:[
{name:"Enhanced Observation\n24–36 Hours",icon:"📊",type:"action",sub:"Vitals q4h · Feed assessment · Return precautions if discharge",edge:"Observe",
info:{tabs:["Observation Parameters","When to Escalate"],
t0:`<p><strong>Enhanced observation protocol:</strong></p>
<ul>
<li>HR, RR, temp, SpO₂ q4h for 24–36 hours</li>
<li>Feeding assessment each feed</li>
<li>Glucose checks per newborn protocol</li>
<li>Skin color, tone, and activity assessment each nursing check</li>
<li>Document each assessment in chart</li>
</ul>`,
t1:`<p><strong>Escalate to full sepsis workup if any of the following develop:</strong></p>
<ul>
<li>Temperature ≥38.0°C or &lt;36.5°C</li>
<li>HR &gt;180 or &lt;100 sustained</li>
<li>RR &gt;60 or apnea</li>
<li>Oxygen requirement</li>
<li>Decreased activity, lethargy, or poor feeding</li>
<li>Hypoglycemia &lt;40 mg/dL</li>
<li>Parent concern that infant "doesn't look right"</li>
</ul>
<div class="bx bb">ℹ️ Parent concern is a valid clinical indicator. Studies consistently show that parents detect early signs of deterioration before clinical parameters become overtly abnormal.</div>`
}}
]},
{name:"EOS Calculator\n<0.65/1000",icon:"✅",type:"action",sub:"Routine newborn care · No cultures · Standard monitoring",edge:"Low risk"}
]}
]};
