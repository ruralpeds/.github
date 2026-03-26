// Clinical tree data — Neonatal Renal Disorders Decision Tree
// Source: 
// Auto-extracted from neonatal_renal_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal Renal\nAssessment",icon:"🫘",type:"assessment",sub:"AKI, electrolytes, renal anomalies, RVT",edge:"",
info:{tabs:["Renal Physiology","Normal Values","When to Evaluate"],
t0:`<p>Neonatal renal physiology is unique: GFR at birth is very low (~20 mL/min/1.73m² in term; ~10 mL/min/1.73m² in preterm) and doubles by 2 weeks. Serum creatinine in the first 48h reflects MATERNAL Cr, not infant renal function. The nadir Cr at 1–4 weeks reflects true infant renal function.</p>
<ul><li>Normal UOP: >1 mL/kg/hr after first 24h (first 24h may be oliguria from normal transition)</li>
<li>Most neonates void within 24h of birth. Failure to void by 48h requires evaluation.</li></ul>`,
t1:`<table class="rt"><thead><tr><th>Parameter</th><th>Term</th><th>Preterm</th><th>Notes</th></tr></thead><tbody>
<tr><td>Serum Cr (birth)</td><td>0.6–1.0 mg/dL</td><td>0.6–1.2 mg/dL</td><td>Reflects MATERNAL Cr; not useful for infant assessment</td></tr>
<tr><td>Serum Cr (nadir, 1–4 wk)</td><td>0.2–0.4 mg/dL</td><td>0.3–0.9 mg/dL</td><td>THIS reflects infant GFR; varies by GA</td></tr>
<tr><td>GFR (term)</td><td>~20–40 mL/min/1.73m²</td><td>~10–20 mL/min/1.73m²</td><td>Doubles by 2 weeks; reaches adult levels by 1–2 years</td></tr>
<tr><td>UOP (after 24h)</td><td>>1 mL/kg/hr</td><td>>1 mL/kg/hr</td><td>Oliguria = &lt;0.5 mL/kg/hr after 48h; Anuria = no urine</td></tr>
<tr><td>Na</td><td>135–145 mEq/L</td><td>130–145 mEq/L</td><td>Preterm lose more Na (immature tubules); may need supplementation</td></tr>
<tr><td>K</td><td>3.5–5.5 mEq/L</td><td>3.5–6.5 mEq/L</td><td>Higher normal range in preterm; non-hemolyzed sample essential</td></tr>
</tbody></table>`,
t2:`<p><strong>Evaluate renal function when:</strong></p>
<ul><li>Oliguria (&lt;0.5 mL/kg/hr) or anuria after 48h of life</li>
<li>Rising creatinine (compared to expected decline from maternal levels)</li>
<li>Prenatal hydronephrosis or renal anomaly</li>
<li>Abdominal mass (MCDK, hydronephrosis, Wilms [rare neonatal])</li>
<li>Hypertension (renal artery thrombosis, coarctation, renal parenchymal disease)</li>
<li>Perinatal asphyxia (AKI in 30–50% of HIE infants)</li>
<li>Nephrotoxic medication exposure (aminoglycosides, NSAIDs, vancomycin)</li></ul>`
},children:[
{name:"Neonatal AKI",icon:"🔴",type:"emergency",sub:"AWAKEN study · Modified KDIGO · 20–30% NICU",edge:"Rising Cr or\noliguria",
info:{tabs:["Definition","Causes","Management"],
t0:`<p><strong>Neonatal AKI — Modified KDIGO Staging:</strong></p>
<table class="rt"><thead><tr><th>Stage</th><th>Serum Creatinine</th><th>Urine Output</th></tr></thead><tbody>
<tr><td>0</td><td>No change or rise &lt;0.3 mg/dL</td><td>≥1 mL/kg/hr</td></tr>
<tr><td>1</td><td>Rise ≥0.3 mg/dL within 48h</td><td>0.5–1 mL/kg/hr</td></tr>
<tr><td>2</td><td>Rise ≥200% from baseline</td><td>0.3–0.5 mL/kg/hr</td></tr>
<tr><td>3</td><td>Rise ≥300% from baseline OR Cr ≥2.5 OR dialysis</td><td>&lt;0.3 mL/kg/hr</td></tr>
</tbody></table>
<p><strong>AWAKEN study (2017):</strong> Largest neonatal AKI study (n=2,022). AKI occurred in ~30% of NICU patients. Even stage 1 AKI independently associated with mortality (OR 4.6).</p>`,
t1:`<table class="dt"><thead><tr><th>Type</th><th>Causes</th><th>Key Clue</th></tr></thead><tbody>
<tr><td><strong>Prerenal (most common)</strong></td><td>Dehydration, sepsis, hemorrhage, NEC, cardiac</td><td>FENa &lt;2.5% (term) or &lt;3% (preterm); BUN:Cr >20; responds to volume</td></tr>
<tr><td><strong>Intrinsic renal</strong></td><td>ATN (asphyxia, aminoglycosides), congenital anomalies (dysplasia, ARPKD)</td><td>FENa >3% (term) or >5% (preterm); muddy brown casts; does NOT respond to volume</td></tr>
<tr><td><strong>Postrenal (obstructive)</strong></td><td>PUV, bilateral UPJO, neurogenic bladder</td><td>Bilateral hydronephrosis on US; distended bladder; catheterization → large residual</td></tr>
</tbody></table>`,
t2:`<ol class="sl">
<li><strong>Identify and treat the cause:</strong> Volume for prerenal, catheterize for obstruction, stop nephrotoxins</li>
<li><strong>Fluid management:</strong> Insensible losses + UOP replacement. Avoid fluid overload (associated with worse outcomes in AKI).</li>
<li><strong>Hyperkalemia management:</strong> K >6.5 or ECG changes → Ca gluconate (cardiac protection), insulin/glucose, kayexalate, consider dialysis</li>
<li><strong>Nephrotoxin stewardship (Baby NINJA):</strong> Review all meds. Adjust aminoglycoside dosing. Avoid NSAIDs.</li>
<li><strong>Dialysis:</strong> Peritoneal dialysis (PD) is most common modality in neonates. Indications: refractory hyperkalemia, severe fluid overload, uremia, metabolic acidosis not responding to medical management.</li>
</ol>
<div class="bx bg">✓ <strong>Baby NINJA (Neonatal Injury Nephrotoxin Justified Avoidance):</strong> Nephrotoxin stewardship program that reduces AKI by systematically reviewing and minimizing nephrotoxic medication exposure in NICU patients.</div>`
}},
{name:"Renal Vein\nThrombosis",icon:"⚠️",type:"urgent",sub:"Flank mass + hematuria + thrombocytopenia",edge:"Flank mass\n+ hematuria",
info:{tabs:["Diagnosis","Management"],
t0:`<p><strong>Neonatal RVT:</strong> Triad = palpable flank mass + gross hematuria + thrombocytopenia. Risk factors: dehydration, sepsis, asphyxia, IDM, polycythemia, indwelling umbilical catheters, prothrombotic disorders.</p>
<ul><li>Left side more common (~70%) but may be bilateral (25%)</li>
<li>Diagnosis: renal US with Doppler (enlarged kidney, absent venous flow). May see extension into IVC.</li></ul>`,
t1:`<ul><li><strong>Supportive:</strong> Hydration, correct underlying cause (treat sepsis, correct dehydration)</li>
<li><strong>Anticoagulation:</strong> Controversial in neonates. Consider LMWH (enoxaparin 1.5 mg/kg SC q12h) if: IVC extension, bilateral RVT, or propagating clot. Monitor anti-Xa levels (target 0.5–1.0 U/mL).</li>
<li><strong>Thrombolysis:</strong> Rarely used; only for life-threatening bilateral RVT with renal failure.</li>
<li><strong>Follow-up:</strong> Serial renal US. Prothrombotic workup at 3–6 months (factor V Leiden, protein C/S, antithrombin). Long-term: monitor BP and renal function (affected kidney may atrophy).</li></ul>`
}},
{name:"Congenital Renal\nAnomalies",icon:"🔬",type:"diagnosis",sub:"MCDK, agenesis, ARPKD, dysplasia",edge:"Prenatal\nrenal anomaly",
info:{tabs:["MCDK","Renal Agenesis","ARPKD"],
t0:`<p><strong>MCDK (Multicystic Dysplastic Kidney):</strong></p>
<ul><li>Non-functioning kidney with multiple non-communicating cysts. No normal renal parenchyma.</li>
<li>Most common cystic renal disease in neonates</li>
<li>Usually unilateral. Contralateral kidney compensates (hypertrophy).</li>
<li>Management: observe (most involute over years). Monitor contralateral kidney (VUR in 15–25%). Nephrectomy rarely needed (if massive, hypertensive, or failing to involute).</li></ul>`,
t1:`<p><strong>Renal agenesis:</strong></p>
<ul><li><strong>Bilateral:</strong> Incompatible with life. Severe oligohydramnios → Potter sequence (pulmonary hypoplasia, compressed facies, limb deformities). No urine production.</li>
<li><strong>Unilateral:</strong> Compatible with normal life. Contralateral kidney compensates. Monitor for hypertension, proteinuria long-term. Counsel on renal protection (avoid contact sports, nephrotoxins).</li>
<li>Associated: VACTERL, genital anomalies (Müllerian in females), contralateral VUR</li></ul>`,
t2:`<p><strong>ARPKD (Autosomal Recessive Polycystic Kidney Disease):</strong></p>
<ul><li>PKHD1 gene mutation. Large, echogenic kidneys bilaterally on US. Cysts are microscopic (dilated collecting ducts), so kidneys appear diffusely echogenic rather than showing discrete cysts.</li>
<li>Neonatal presentation: bilaterally enlarged kidneys, oligohydramnios (severe → pulmonary hypoplasia), hypertension, renal insufficiency</li>
<li>Associated: congenital hepatic fibrosis (100% — Caroli disease/syndrome)</li>
<li>Management: blood pressure control, manage renal insufficiency, monitor for portal hypertension from hepatic fibrosis. ~30% require renal replacement therapy by age 10.</li></ul>`
}}
]};
