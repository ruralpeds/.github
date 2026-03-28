// Clinical tree data — Neonatal Urological Disorders Decision Tree
// Source: 
// Auto-extracted from neonatal_urological_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal Urologic\nAssessment",icon:"🫘",type:"assessment",sub:"Prenatal hydronephrosis, UTI, genital anomalies",edge:"",
info:{tabs:["Overview","Prenatal Hydronephrosis","UTD Classification"],
t0:`<p>Neonatal urologic conditions are commonly detected prenatally on maternal ultrasound (hydronephrosis is the most common prenatal anomaly). Postnatal evaluation confirms severity and guides management. Key conditions: hydronephrosis/UPJO, VUR, PUV, MCDK, hypospadias, cryptorchidism, neonatal UTI.</p>`,
t1:`<p><strong>Prenatal hydronephrosis:</strong> Detected in 1–5% of pregnancies. Most are transient/physiologic. Postnatal evaluation is key.</p>
<ul><li>Mild ANH (APD 4–7 mm): resolves in ~80%. Postnatal US at 48h+ (NOT in first 48h — falsely normal from relative dehydration).</li>
<li>Moderate (7–15 mm): postnatal US at 48h–7 days. Higher risk of persistent pathology.</li>
<li>Severe (>15 mm) or bilateral: postnatal US within 48h. Voiding cystourethrogram (VCUG) if concern for VUR or PUV.</li></ul>
<div class="bx bo">⚠️ <strong>Do NOT obtain postnatal US in the first 48h unless SEVERE bilateral hydronephrosis or suspected PUV.</strong> Relative oliguria/dehydration in the first 48h can falsely normalize the US. Wait until 48h–7 days for accurate assessment.</div>`,
t2:`<p><strong>Urinary Tract Dilation (UTD) Classification System (replacing SFU):</strong></p>
<table class="rt"><thead><tr><th>UTD Grade</th><th>Prenatal APRPD</th><th>Postnatal Features</th><th>Risk of Pathology</th></tr></thead><tbody>
<tr><td>P1 / A1 (low risk)</td><td>4–<7 mm (2nd tri) / 7–<10 mm (3rd tri)</td><td>Central calyceal dilation only</td><td>~12% need intervention</td></tr>
<tr><td>P2-3 / A2-3 (high risk)</td><td>≥7 mm (2nd) / ≥10 mm (3rd)</td><td>Peripheral calyceal dilation, parenchymal abnormality, ureteral dilation, or abnormal bladder</td><td>~45% need intervention</td></tr>
</tbody></table>`
},children:[
{name:"Hydronephrosis /\nUPJO",icon:"💧",type:"decision",sub:"UTD classification · Postnatal US at 48h+",edge:"Prenatal\nhydronephrosis",
info:{tabs:["Evaluation","UPJO Management","Follow-up"],
t0:`<ol class="sl">
<li><strong>Postnatal US at 48h–7 days</strong> (wait for adequate hydration/UOP)</li>
<li><strong>If resolved/mild (UTD A1):</strong> Repeat US at 1–3 months. If still normal → discharge from follow-up or one more US at 6–12 months.</li>
<li><strong>If persistent moderate-severe (UTD A2-3):</strong> VCUG to rule out VUR. MAG3 renal scan (diuretic renogram) to assess obstruction and differential function.</li>
<li><strong>Prophylactic antibiotics:</strong> Controversial. Consider amoxicillin 20 mg/kg/day for UTD A2-3 pending workup. AAP does not universally recommend.</li>
</ol>`,
t1:`<p><strong>UPJO (Ureteropelvic Junction Obstruction):</strong></p>
<ul><li>Most common cause of significant neonatal hydronephrosis</li>
<li>MAG3 scan: T½ washout >20 min = obstructed; differential function <40% on affected side = concerning</li>
<li><strong>Surgical indication (pyeloplasty):</strong> Worsening hydronephrosis, declining differential function (<40%), symptomatic (UTI, pain), or massive dilation</li>
<li>Many mild-moderate UPJO resolve with observation alone (50–70% of initially observed patients avoid surgery)</li></ul>`,
t2:`<table class="dt"><thead><tr><th>UTD Grade</th><th>Follow-up US</th><th>Additional Studies</th></tr></thead><tbody>
<tr><td>A1 (low risk)</td><td>1–3 months, then 6–12 months if stable</td><td>None unless worsening</td></tr>
<tr><td>A2-3 (high risk)</td><td>1 month, then q3–6 months</td><td>VCUG + MAG3 renal scan</td></tr>
</tbody></table>`
}},
{name:"Posterior\nUrethral Valves",icon:"🔴",type:"emergency",sub:"Males only · Bilateral hydro · Bladder distension",edge:"Bilateral hydro\n+ thick bladder\n+ male",
info:{tabs:["Diagnosis","Emergency Management","Prognosis"],
t0:`<p><strong>PUV (Posterior Urethral Valves):</strong> Obstructive tissue folds in the posterior urethra of MALES. Most common cause of severe obstructive uropathy in children. Incidence: ~1/5,000–8,000 males.</p>
<ul><li><strong>Prenatal:</strong> Bilateral hydronephrosis, distended thick-walled bladder ("keyhole sign"), oligohydramnios (severe = pulmonary hypoplasia risk)</li>
<li><strong>Postnatal:</strong> Poor urinary stream or dribbling, palpable distended bladder, bilateral flank masses (hydronephrotic kidneys), respiratory distress (pulmonary hypoplasia), renal failure (elevated Cr)</li></ul>`,
t1:`<ol class="sl">
<li><strong>Bladder catheterization (5–8 Fr feeding tube)</strong> — IMMEDIATE. Decompresses the urinary tract. Cr begins to fall. Leave catheter in place.</li>
<li><strong>Monitor for post-obstructive diuresis</strong> — massive polyuria (up to 10–20 mL/kg/hr) after decompression. Replace fluid losses mL-for-mL with 0.45% NS + 20 mEq/L KCl. Monitor electrolytes q4–6h.</li>
<li><strong>Renal function monitoring:</strong> Serum Cr at birth reflects maternal Cr. The NADIR Cr at 1–4 weeks after decompression predicts long-term renal function. Nadir Cr <0.8 mg/dL = generally favorable. Nadir Cr >1.0 = high risk of CKD/ESRD.</li>
<li><strong>Definitive treatment:</strong> Primary valve ablation (cystoscopic fulguration) when infant is large enough (usually 2–4 weeks, ~3 kg). Vesicostomy if too small for cystoscopy.</li>
</ol>
<div class="bx br">🚨 <strong>PUV is a urologic EMERGENCY at birth.</strong> A feeding tube (5–8 Fr) placed into the bladder decompresses the entire urinary tract. Do NOT use a Foley catheter initially (balloon may obstruct the already compromised bladder neck).</div>`,
t2:`<ul><li>~30% will develop ESRD by adolescence despite early treatment</li>
<li>Bladder dysfunction is common (myogenic failure from chronic overdistension)</li>
<li>Long-term follow-up: serial renal function, US, urodynamics, blood pressure monitoring</li>
<li>"VURD" syndrome (Valves, Unilateral Reflux, Dysplasia) — unilateral renal dysplasia may actually be "protective" for the contralateral kidney by acting as a pop-off valve</li></ul>`
}},
{name:"Vesicoureteral\nReflux (VUR)",icon:"🔄",type:"diagnosis",sub:"VCUG diagnosis · Grading I–V · Abx prophylaxis",edge:"UTI or\nVCUG positive",
info:{tabs:["Grading","Management","AAP UTI Guidelines"],
t0:`<table class="rt"><thead><tr><th>Grade</th><th>Description</th><th>Spontaneous Resolution</th></tr></thead><tbody>
<tr><td>I</td><td>Reflux into non-dilated ureter only</td><td>~80%</td></tr>
<tr><td>II</td><td>Reflux into renal pelvis, no dilation</td><td>~60–80%</td></tr>
<tr><td>III</td><td>Mild ureteral/pelvic dilation, mild calyceal blunting</td><td>~50%</td></tr>
<tr><td>IV</td><td>Moderate dilation, calyceal blunting</td><td>~10–20%</td></tr>
<tr><td>V</td><td>Massive dilation, tortuous ureter, severe calyceal clubbing</td><td>~5%</td></tr>
</tbody></table>`,
t1:`<ul><li><strong>Low grade (I–III):</strong> Observation ± antibiotic prophylaxis. High spontaneous resolution rate. RIVUR trial: CAP (TMP-SMX) reduced UTI recurrence by 50% but did NOT prevent renal scarring.</li>
<li><strong>High grade (IV–V):</strong> Antibiotic prophylaxis. Consider surgery if breakthrough febrile UTIs or new renal scarring.</li>
<li><strong>Surgery:</strong> Ureteral reimplantation (open or robotic) or endoscopic injection (Deflux). Success >95% for open reimplant.</li></ul>`,
t2:`<p><strong>AAP 2023 Febrile UTI Guidelines:</strong></p>
<ul><li>First febrile UTI age 2–24 months: renal/bladder US. VCUG NOT routinely recommended after first UTI unless US is abnormal or atypical UTI features.</li>
<li>Recurrent febrile UTI: VCUG indicated</li>
<li>Neonatal UTI: VCUG recommended (high prevalence of VUR and PUV in neonates with UTI)</li></ul>`
}},
{name:"Hypospadias /\nCryptorchidism",icon:"🔵",type:"action",sub:"Do NOT circumcise hypospadias · Orchiopexy by 6–12 mo",edge:"Genital\nexam finding",
info:{tabs:["Hypospadias","Cryptorchidism","Ambiguous Genitalia"],
t0:`<p><strong>Hypospadias:</strong> Urethral meatus located on ventral surface of penis (not at tip). Incidence: ~1/200–300 males.</p>
<ul><li>Classification: distal/glanular (70–80%), midshaft (15%), proximal/penoscrotal (5–10%)</li>
<li><strong>NEVER circumcise a baby with hypospadias</strong> — the foreskin is needed for surgical repair (tubularized incised plate urethroplasty, Snodgrass procedure)</li>
<li>Repair: typically 6–12 months of age. Single-stage for most distal/midshaft. Proximal may need staged repair.</li>
<li>Associated: chordee (ventral curvature), undescended testis. If severe hypospadias + bilateral cryptorchidism → evaluate for DSD (karyotype, 17-OHP, US for uterus).</li></ul>`,
t1:`<p><strong>Cryptorchidism (undescended testis):</strong></p>
<ul><li>Incidence: 3–5% of term males at birth; 1% at 6 months (many descend spontaneously by 3–6 months)</li>
<li>Distinguish: true UDT (never in scrotum) vs retractile (can be manipulated into scrotum and stays temporarily)</li>
<li><strong>Orchiopexy:</strong> Recommended by 6–12 months of age (AUA/AAP). Earlier surgery preserves fertility potential and reduces malignancy risk.</li>
<li>If bilateral non-palpable testes: evaluate for anorchia (hCG stimulation test, AMH level, karyotype) or DSD</li></ul>
<div class="bx bo">⚠️ <strong>Bilateral non-palpable testes + hypospadias → MUST rule out DSD (46,XX CAH virilized female).</strong> Karyotype, 17-OHP, pelvic US for uterus. DO NOT assign sex until evaluation is complete.</div>`,
t2:`<p><strong>Ambiguous genitalia evaluation:</strong></p>
<ol class="sl">
<li>Karyotype (STAT FISH for X/Y)</li>
<li>17-OHP (CAH — most common cause of 46,XX DSD)</li>
<li>Electrolytes (salt-wasting CAH crisis)</li>
<li>Pelvic/abdominal US (uterus present? Gonads?)</li>
<li>Testosterone, DHT, AMH</li>
<li>Endocrinology + genetics + urology/surgery consultation</li>
<li>Do NOT assign sex until evaluation is complete. Use neutral terms with family.</li>
</ol>`
}},
{name:"Neonatal UTI",icon:"🦠",type:"urgent",sub:"Catheterized UA/UCx · E. coli #1 · Rule out PUV",edge:"Fever or\nsepsis-like\nillness",
info:{tabs:["Diagnosis","Treatment","Post-UTI Imaging"],
t0:`<ul><li><strong>Neonatal UTI:</strong> More common in males (unlike older children). E. coli is #1 pathogen. Often presents as sepsis-like illness.</li>
<li><strong>Diagnosis requires catheterized or suprapubic specimen</strong> (bag specimens have unacceptable contamination rates in neonates)</li>
<li>UA: positive leukocyte esterase or nitrites (nitrites may be negative in neonates — fast bladder transit time). WBC >5/hpf on microscopy.</li>
<li>Culture: ≥50,000 CFU/mL of single organism from catheterized specimen; ≥10,000 from SPA</li></ul>`,
t1:`<ul><li><strong>Neonatal UTI = IV antibiotics initially</strong> (treat as presumed sepsis in the first month of life)</li>
<li>Empiric: Ampicillin + Gentamicin (covers GBS + E. coli)</li>
<li>Narrow based on culture/sensitivity</li>
<li>Duration: 7–14 days total (may transition to PO after clinical improvement)</li>
<li>Blood culture (bacteremia in ~5–10% of neonatal UTI)</li></ul>`,
t2:`<p><strong>Post-UTI imaging in neonates:</strong></p>
<ul><li><strong>Renal/bladder US:</strong> All neonates after first UTI</li>
<li><strong>VCUG:</strong> Recommended for all neonatal UTIs (high prevalence of VUR and PUV). Perform after UTI is treated and urine is sterile.</li>
<li><strong>Males with abnormal US:</strong> MUST rule out PUV (thick bladder wall, bilateral hydro, dilated posterior urethra on VCUG)</li></ul>`
}}
]};
