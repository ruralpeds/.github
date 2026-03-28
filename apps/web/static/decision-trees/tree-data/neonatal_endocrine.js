// Clinical tree data — Neonatal Endocrine Decision Tree
// Source: 
// Auto-extracted from neonatal_endocrine_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal Endocrine\nEvaluation",icon:"🧬",type:"assessment",sub:"Glucose, thyroid, adrenal, calcium, ambiguous genitalia",edge:"",
info:{tabs:["Overview","Newborn Screening","When to Evaluate"],
t0:`<p>Neonatal endocrine disorders encompass a range of conditions from common (neonatal hypoglycemia) to rare but critical (congenital adrenal hyperplasia). Many are detected through newborn screening before clinical presentation.</p>
<p><strong>Major neonatal endocrine conditions:</strong></p>
<ul><li>Neonatal hypoglycemia (most common endocrine-related problem)</li><li>Congenital hypothyroidism (most common preventable cause of intellectual disability)</li><li>Congenital adrenal hyperplasia (potentially life-threatening salt-wasting crisis)</li><li>Neonatal hypocalcemia (early vs late)</li><li>Disorders of sexual development (ambiguous genitalia)</li><li>Infant of diabetic mother (IDM) — hypoglycemia, macrosomia, organ effects</li></ul>`,
t1:`<p><strong>Endocrine conditions on the RUSP (Recommended Uniform Screening Panel):</strong></p>
<table class="rt"><thead><tr><th>Condition</th><th>Screen</th><th>Timing</th><th>Follow-up</th></tr></thead><tbody>
<tr><td>Congenital hypothyroidism</td><td>TSH ± T4</td><td>24–48h NBS</td><td>Confirm with serum TSH + free T4; start levothyroxine immediately</td></tr>
<tr><td>CAH (21-OHD)</td><td>17-OHP</td><td>24–48h NBS</td><td>Confirm with serum 17-OHP, electrolytes, cortisol; start hydrocortisone ± fludrocortisone</td></tr>
<tr><td>Galactosemia</td><td>GALT enzyme</td><td>24–48h NBS</td><td>Confirmatory enzyme + genetic testing; stop galactose/lactose immediately</td></tr>
</tbody></table>
<div class="bx bo">⚠️ <strong>NBS false positives:</strong> Preterm and critically ill neonates have higher false-positive rates for thyroid (low T4 from immaturity/sick euthyroid) and 17-OHP (cross-reactivity, prematurity). Always confirm abnormal NBS with serum testing.</div>`,
t2:`<p><strong>Evaluate endocrine system when:</strong></p>
<ul><li>Persistent or recurrent hypoglycemia (glucose &lt;45 mg/dL despite feeds)</li>
<li>Abnormal newborn screening results (elevated TSH, elevated 17-OHP)</li>
<li>Ambiguous genitalia at birth</li>
<li>Neonatal tetany or seizures (hypocalcemia)</li>
<li>Failure to thrive with feeding difficulty, constipation, prolonged jaundice (hypothyroidism)</li>
<li>Infant of diabetic mother (monitor glucose, calcium, Hct, cardiac)</li>
<li>Salt-wasting crisis: hyponatremia, hyperkalemia, dehydration, shock in first 1–3 weeks</li></ul>`
},children:[
// ═══ HYPOGLYCEMIA ═══
{name:"Neonatal\nHypoglycemia",icon:"🩸",type:"urgent",sub:"Glucose <45 mg/dL · AAP/PES guidelines",edge:"Low\nglucose",
info:{tabs:["Definition & Thresholds","Risk Groups","Management Algorithm","Persistent Hypoglycemia"],
t0:`<p><strong>Neonatal hypoglycemia:</strong> No universal consensus on exact threshold. Key guidelines:</p>
<table class="rt"><thead><tr><th>Guideline</th><th>Action Threshold</th><th>Target</th></tr></thead><tbody>
<tr><td>AAP 2011 (at-risk infants)</td><td>&lt;25 mg/dL (0–4h); &lt;35 mg/dL (4–24h)</td><td>>45 mg/dL by 24h of age</td></tr>
<tr><td>PES 2015</td><td>&lt;50 mg/dL (symptomatic or recurrent)</td><td>>60 mg/dL before meals (beyond 48h)</td></tr>
<tr><td>Sweet et al. (J Perinatol 2023)</td><td>Operational threshold &lt;45 mg/dL</td><td>Maintain >50 mg/dL</td></tr>
</tbody></table>
<div class="bx bb">ℹ️ <strong>Clinical approach:</strong> Treat symptomatic hypoglycemia regardless of number. For asymptomatic at-risk infants: follow AAP protocol — feed, recheck in 1 hour. Persistent glucose &lt;45 mg/dL despite feeds → IV dextrose.</div>`,
t1:`<p><strong>At-risk groups requiring glucose screening:</strong></p>
<table class="dt"><thead><tr><th>Group</th><th>Mechanism</th><th>Screening Duration</th></tr></thead><tbody>
<tr><td>SGA (&lt;10th percentile)</td><td>Low glycogen stores</td><td>First 24 hours</td></tr>
<tr><td>LGA (>90th percentile)</td><td>Hyperinsulinism from gestational DM exposure</td><td>First 12 hours</td></tr>
<tr><td>IDM (infant of diabetic mother)</td><td>Fetal hyperinsulinism (from maternal hyperglycemia)</td><td>First 12 hours</td></tr>
<tr><td>Late preterm (34–36+6 wk)</td><td>Immature glycogenolysis and gluconeogenesis</td><td>First 24 hours</td></tr>
<tr><td>Perinatal stress (asphyxia, sepsis, hypothermia)</td><td>Increased glucose consumption</td><td>Until stable</td></tr>
</tbody></table>`,
t2:`<p><strong>AAP-Based Management:</strong></p>
<ol class="sl">
<li><strong>Birth to 4 hours:</strong> Initial feed within 1 hour. Screen glucose 30 min after first feed. If &lt;25 mg/dL → IV D10W. If 25–40 → refeed/supplement, recheck in 1h. If >40 → continue feeds q2–3h, rescreen prior to next feed.</li>
<li><strong>4–24 hours:</strong> If glucose &lt;35 → IV D10W. If 35–45 → refeed, recheck. Goal: pre-feed glucose >45 mg/dL.</li>
<li><strong>IV glucose:</strong> D10W bolus 2 mL/kg (200 mg/kg) over 5–10 minutes, then continuous infusion starting at GIR 5–8 mg/kg/min.</li>
<li><strong>GIR formula:</strong> GIR (mg/kg/min) = IV rate (mL/h) × dextrose concentration (g/dL) / (weight (kg) × 6)</li>
<li><strong>Wean IV glucose gradually</strong> once glucose stable >50 mg/dL and infant tolerating feeds. Decrease GIR by 1–2 mg/kg/min every 6–12 hours.</li>
</ol>
<div class="bx br">🚨 <strong>Symptomatic hypoglycemia (seizures, apnea, cyanosis, jitteriness, lethargy):</strong> D10W 2 mL/kg IV STAT regardless of glucose value. Do NOT wait for lab confirmation.</div>`,
t3:`<p><strong>Suspect persistent hyperinsulinism if:</strong></p>
<ul><li>GIR requirement >10–12 mg/kg/min to maintain glucose >50</li>
<li>Hypoglycemia persisting beyond 48–72 hours of life</li>
<li>Detectable insulin at time of hypoglycemia (insulin >2 µU/mL when glucose &lt;50)</li>
<li>Inappropriately low free fatty acids (&lt;1.5 mmol/L) and ketones (&lt;1.8 mmol/L) during hypoglycemia</li>
<li>Glycemic response to glucagon (glucose rises >30 mg/dL after glucagon 0.5 mg IM)</li></ul>
<p><strong>Workup:</strong> Critical sample during hypoglycemia (glucose, insulin, cortisol, GH, FFA, β-hydroxybutyrate, lactate, ammonia). Diazoxide trial (5–15 mg/kg/day). Genetic testing (ABCC8/KCNJ11 most common). Endocrinology referral.</p>`
},children:[
{name:"Transient\nHypoglycemia",icon:"🍼",type:"action",sub:"IDM · SGA · Late preterm · Resolves 48–72h",edge:"Resolves with\nfeeds/IV",
info:{tabs:["Management","When to Escalate"],
t0:`<ul><li>Most neonatal hypoglycemia is transient and resolves within 48–72 hours</li>
<li>Feed early and often (q2–3h); supplement with formula if breast milk insufficient</li>
<li>Dextrose gel 40% 200 mg/kg buccal may prevent NICU admission (Sugar Babies Trial, NEJM 2013)</li>
<li>If IV needed: D10W at GIR 5–8 mg/kg/min; wean as tolerated</li></ul>
<div class="bx bg">✓ <strong>Dextrose gel 40% 200 mg/kg buccal:</strong> Applied to buccal mucosa and massaged. Reduces NICU admission by 50% and increases breastfeeding success. Safe, inexpensive, first-line for asymptomatic mild hypoglycemia.</div>`,
t1:`<p>Escalate to endocrine workup if:</p>
<ul><li>GIR >10 mg/kg/min needed</li><li>Glucose still &lt;50 after 48–72 hours</li><li>Recurrent hypoglycemia after stopping IV glucose</li><li>Large-for-gestational-age without maternal DM (suspect Beckwith-Wiedemann or congenital hyperinsulinism)</li></ul>`
}},
{name:"Persistent\nHyperinsulinism",icon:"⚠️",type:"emergency",sub:"GIR >10–12 · Diazoxide · Genetics",edge:"GIR >10\nor persists\n>72h",
info:{tabs:["Diagnosis","Treatment"],
t0:`<p><strong>Congenital hyperinsulinism (CHI):</strong> Most common cause of persistent neonatal hypoglycemia. Incidence ~1/25,000–50,000.</p>
<ul><li><strong>Critical sample:</strong> During hypoglycemia (glucose &lt;50): insulin, C-peptide, cortisol, GH, FFA, β-OHB, lactate</li>
<li>Diagnostic: detectable insulin (>2 µU/mL) when glucose &lt;50, with suppressed FFA and ketones</li>
<li>Glucagon stimulation test: glucose rises >30 mg/dL (confirms excess glycogen = insulin effect)</li>
<li>Genetics: ABCC8 (SUR1) and KCNJ11 (Kir6.2) = most common; determine focal vs diffuse disease</li></ul>`,
t1:`<ol class="sl">
<li><strong>Acute:</strong> High-dose IV dextrose (GIR 10–20+ mg/kg/min via central line; concentrations >D12.5% require central access)</li>
<li><strong>Glucagon:</strong> 0.5–1 mg IM/IV as rescue; or continuous infusion 5–10 µg/kg/hr</li>
<li><strong>Diazoxide:</strong> 5–15 mg/kg/day divided BID-TID (K-ATP channel opener; works in ~50%). Side effects: fluid retention (add chlorothiazide), hypertrichosis.</li>
<li><strong>Octreotide:</strong> 5–20 µg/kg/day SC q6–8h for diazoxide-unresponsive CHI</li>
<li><strong>Surgery:</strong> 18F-DOPA PET scan to localize focal vs diffuse. Focal = curative partial pancreatectomy. Diffuse = near-total pancreatectomy (last resort; causes DM).</li>
</ol>`
}}
]},
// ═══ CONGENITAL HYPOTHYROIDISM ═══
{name:"Congenital\nHypothyroidism",icon:"🦋",type:"urgent",sub:"NBS elevated TSH · Levothyroxine ASAP",edge:"Elevated\nTSH on NBS",
info:{tabs:["Definition","Confirmatory Workup","Treatment","Follow-up"],
t0:`<p><strong>Congenital hypothyroidism (CH):</strong> Most common preventable cause of intellectual disability. Incidence: ~1/2,000–4,000. NBS has transformed outcomes — early treatment prevents cognitive impairment.</p>
<p><strong>Causes:</strong></p>
<ul><li><strong>Thyroid dysgenesis (85%):</strong> Aplasia, hypoplasia, ectopic thyroid</li>
<li><strong>Dyshormonogenesis (10–15%):</strong> Enzyme defects in thyroid hormone synthesis (AR)</li>
<li><strong>Central CH (&lt;5%):</strong> Pituitary TSH deficiency (NOT detected by TSH-based NBS)</li>
<li><strong>Transient:</strong> Maternal iodine excess/deficiency, maternal antithyroid drugs, maternal blocking antibodies</li></ul>`,
t1:`<p><strong>When NBS is abnormal (elevated TSH):</strong></p>
<ol class="sl">
<li><strong>Serum TSH + free T4</strong> ASAP (do NOT wait for repeat NBS)</li>
<li><strong>If TSH >40 mU/L and/or FT4 low:</strong> start levothyroxine immediately, same day</li>
<li><strong>If TSH 10–40 mU/L with normal FT4:</strong> start treatment and repeat in 2 weeks; some are transient</li>
<li><strong>Thyroid US:</strong> evaluate anatomy (absent/ectopic/normal gland)</li>
<li><strong>Thyroid scan (I-123 or Tc-99m):</strong> optional; helps determine etiology (dysgenesis vs dyshormonogenesis)</li>
</ol>
<div class="bx br">🚨 <strong>DO NOT delay treatment waiting for imaging.</strong> Start levothyroxine the same day confirmatory labs show elevated TSH / low FT4. Every day of delay impacts neurodevelopment.</div>`,
t2:`<table class="rt"><thead><tr><th>Parameter</th><th>Protocol</th></tr></thead><tbody>
<tr><td>Drug</td><td>Levothyroxine (L-T4) ONLY (do NOT use T3 or combination)</td></tr>
<tr><td>Starting dose</td><td>10–15 µg/kg/day PO once daily</td></tr>
<tr><td>Target FT4</td><td>Upper half of normal range (1.4–2.3 ng/dL)</td></tr>
<tr><td>Target TSH</td><td>&lt;5 mU/L (ideally 0.5–2.0 mU/L)</td></tr>
<tr><td>Timing of dose</td><td>Empty stomach (30 min before feeds) for best absorption</td></tr>
<tr><td>Formulation</td><td>Crushed tablet in small amount of breast milk/water. Do NOT mix with soy formula (decreases absorption).</td></tr>
</tbody></table>`,
t3:`<ul><li>Recheck TSH + FT4 at 2 and 4 weeks after starting, then every 1–2 months for first 6 months, every 2–3 months to age 3</li>
<li>Adjust dose to keep FT4 in upper half of normal and TSH &lt;5</li>
<li>Re-evaluation at age 3: trial off levothyroxine for 4–6 weeks with repeat labs. If TSH rises → permanent CH; if normal → transient (25–40% of cases are transient)</li>
<li>Developmental monitoring: IQ is normal if treatment started within 2 weeks of birth</li></ul>`
}},
// ═══ CAH ═══
{name:"Congenital\nAdrenal Hyperplasia",icon:"⚡",type:"emergency",sub:"21-OHD · Salt-wasting crisis · Ambiguous genitalia",edge:"Elevated\n17-OHP or\nambiguous gen",
info:{tabs:["Definition","Salt-Wasting Crisis","Treatment","Ambiguous Genitalia"],
t0:`<p><strong>CAH (21-hydroxylase deficiency = 90–95% of cases):</strong> AR disorder of cortisol synthesis → ACTH elevation → adrenal hyperplasia → excess androgens. Incidence: ~1/15,000.</p>
<p><strong>Three forms:</strong></p>
<table class="dt"><thead><tr><th>Form</th><th>Cortisol</th><th>Aldosterone</th><th>Androgens</th><th>Presentation</th></tr></thead><tbody>
<tr><td><strong>Classic salt-wasting (75%)</strong></td><td>↓↓</td><td>↓↓</td><td>↑↑↑</td><td>Virilized female (ambiguous genitalia), salt-wasting crisis at 1–3 weeks</td></tr>
<tr><td><strong>Classic simple virilizing (25%)</strong></td><td>↓</td><td>Normal/↓</td><td>↑↑</td><td>Virilized female; males may be undetected at birth</td></tr>
<tr><td><strong>Non-classic (late-onset)</strong></td><td>Normal/↓</td><td>Normal</td><td>↑</td><td>Premature adrenarche, hirsutism in adolescence; NOT detected on NBS</td></tr>
</tbody></table>`,
t1:`<div class="bx br">🚨 <strong>Salt-wasting crisis is a LIFE-THREATENING EMERGENCY</strong> — typically presents at 1–3 weeks of life in unscreened males (females usually diagnosed earlier by ambiguous genitalia).</div>
<p><strong>Presentation:</strong> Hyponatremia (&lt;130), hyperkalemia (>6.0), dehydration, weight loss, vomiting, lethargy → shock → death if untreated.</p>
<p><strong>Emergency management:</strong></p>
<ol class="sl">
<li><strong>NS bolus 20 mL/kg</strong> — repeat PRN for shock resuscitation</li>
<li><strong>Hydrocortisone 25 mg IV STAT</strong> (stress dose; provides both glucocorticoid and mineralocorticoid activity at stress doses)</li>
<li><strong>D10W for hypoglycemia</strong> (cortisol deficiency → impaired gluconeogenesis)</li>
<li><strong>Treat hyperkalemia:</strong> Calcium gluconate (cardiac protection), insulin/glucose, kayexalate if severe</li>
<li><strong>Correct hyponatremia:</strong> NS replacement (correct slowly — no faster than 10–12 mEq/L/24h)</li>
<li><strong>Labs:</strong> 17-OHP, cortisol, ACTH, renin, aldosterone, electrolytes, glucose</li>
</ol>`,
t2:`<p><strong>Chronic management:</strong></p>
<table class="rt"><thead><tr><th>Medication</th><th>Dose</th><th>Purpose</th></tr></thead><tbody>
<tr><td>Hydrocortisone</td><td>10–15 mg/m²/day divided TID</td><td>Cortisol replacement + ACTH suppression → decreases androgen excess</td></tr>
<tr><td>Fludrocortisone</td><td>0.05–0.2 mg/day</td><td>Mineralocorticoid replacement (salt-wasting form)</td></tr>
<tr><td>NaCl supplementation</td><td>1–2 g/day (in feeds)</td><td>Infants have high salt requirements; breast milk is low in sodium</td></tr>
</tbody></table>
<p><strong>Stress dosing:</strong> Triple the hydrocortisone dose during illness/fever. IM hydrocortisone (25–50 mg) for vomiting/inability to take PO. Medic-Alert bracelet.</p>`,
t3:`<p><strong>Ambiguous genitalia in 46,XX female with CAH:</strong></p>
<ul><li>Virilization from excess androgens: clitoromegaly, labial fusion, urogenital sinus</li>
<li>Prader staging I–V (I = mild clitoromegaly; V = complete male phenotype)</li>
<li>Internal structures are FEMALE (uterus, ovaries, fallopian tubes present)</li>
<li>Gender assignment: 46,XX with CAH are raised female (fertility preserved)</li>
<li>Surgical considerations: feminizing genitoplasty (timing and extent are evolving topics)</li></ul>
<div class="bx bo">⚠️ <strong>A virilized 46,XX female with CAH may be mistakenly assigned male at birth.</strong> Before sex assignment in ANY infant with ambiguous genitalia: obtain karyotype, pelvic US (uterus present?), 17-OHP, electrolytes. Endocrinology and genetics consultation URGENTLY.</div>`
}},
// ═══ HYPOCALCEMIA ═══
{name:"Neonatal\nHypocalcemia",icon:"🦴",type:"decision",sub:"Early (<72h) vs Late (>72h) · Seizures",edge:"Low calcium\nor tetany",
info:{tabs:["Definition","Early vs Late","Treatment","DiGeorge"],
t0:`<p><strong>Neonatal hypocalcemia:</strong> Total calcium &lt;8.0 mg/dL (term) or &lt;7.0 mg/dL (preterm), OR ionized calcium &lt;4.0 mg/dL (&lt;1.0 mmol/L). Ionized Ca is more reliable than total Ca (not affected by albumin).</p>
<table class="rt"><thead><tr><th>Parameter</th><th>Normal Term</th><th>Normal Preterm</th><th>Hypocalcemia</th></tr></thead><tbody>
<tr><td>Total Ca</td><td>8.5–10.5 mg/dL</td><td>7.0–10.0 mg/dL</td><td>&lt;8.0 (term) or &lt;7.0 (preterm)</td></tr>
<tr><td>Ionized Ca</td><td>4.4–5.4 mg/dL (1.1–1.35 mmol/L)</td><td>4.0–5.0 mg/dL</td><td>&lt;4.0 mg/dL (&lt;1.0 mmol/L)</td></tr>
</tbody></table>`,
t1:`<table class="dt"><thead><tr><th>Type</th><th>Timing</th><th>Causes</th><th>Features</th></tr></thead><tbody>
<tr><td><strong>Early</strong></td><td>&lt;72h</td><td>Prematurity (#1), IDM, perinatal asphyxia, maternal hyperparathyroidism, maternal vitamin D deficiency</td><td>Often asymptomatic. If symptomatic: jitteriness, tremor, seizures, apnea.</td></tr>
<tr><td><strong>Late</strong></td><td>>72h (typically day 5–10)</td><td>High-phosphate formula (cow's milk), hypoparathyroidism (DiGeorge), maternal vitamin D deficiency, hypomagnesemia</td><td>More likely symptomatic: seizures, tetany, stridor (laryngospasm), prolonged QTc</td></tr>
</tbody></table>`,
t2:`<p><strong>Treatment:</strong></p>
<ul><li><strong>Symptomatic (seizures/tetany):</strong> Calcium gluconate 10% — 1–2 mL/kg (100–200 mg/kg) IV slow push over 10–20 minutes with cardiac monitoring. STOP if bradycardia occurs.</li>
<li><strong>Maintenance:</strong> Calcium gluconate 200–800 mg/kg/day divided q6h PO or via continuous IV</li>
<li><strong>Hypomagnesemia:</strong> If calcium is not correcting → check Mg. Hypomagnesemia prevents PTH secretion. Magnesium sulfate 25–50 mg/kg IV over 20 min.</li>
<li><strong>Vitamin D:</strong> If vitamin D deficiency suspected: calcitriol 0.05–0.1 µg/kg/day</li></ul>
<div class="bx br">🚨 <strong>IV calcium MUST be given slowly with cardiac monitoring.</strong> Rapid infusion → bradycardia, cardiac arrest. If extravasation occurs → severe tissue necrosis and calcification. Use central line if possible.</div>`,
t3:`<p><strong>DiGeorge Syndrome (22q11.2 deletion):</strong></p>
<ul><li>Most common cause of congenital hypoparathyroidism</li>
<li>CATCH-22 mnemonic: Cardiac defects (conotruncal: TOF, truncus, IAA), Abnormal facies, Thymic aplasia/hypoplasia, Cleft palate, Hypocalcemia/Hypoparathyroidism, 22q11.2 deletion</li>
<li>Diagnosis: FISH or microarray for 22q11.2 deletion</li>
<li>T-cell lymphopenia from thymic hypoplasia (check lymphocyte subsets; avoid live vaccines if severely immunodeficient)</li>
<li>Management: calcium + calcitriol supplementation; cardiac surgery as needed; immunology evaluation; developmental follow-up</li></ul>`
}},
// ═══ IDM ═══
{name:"Infant of\nDiabetic Mother",icon:"🤰",type:"decision",sub:"Hypoglycemia · Macrosomia · Multi-organ effects",edge:"Maternal\nDM history",
info:{tabs:["Pathophysiology","Complications","Monitoring Protocol"],
t0:`<p><strong>IDM pathophysiology:</strong> Maternal hyperglycemia → fetal hyperglycemia (glucose crosses placenta) → fetal hyperinsulinism → macrosomia, organomegaly, metabolic derangements at birth when glucose supply is cut.</p>
<p>Risk correlates with maternal glycemic control: pregestational DM (type 1/2) has higher risk than well-controlled gestational DM.</p>`,
t1:`<table class="dt"><thead><tr><th>Complication</th><th>Mechanism</th><th>Incidence</th><th>Management</th></tr></thead><tbody>
<tr><td><strong>Hypoglycemia</strong></td><td>Fetal hyperinsulinism persists after birth</td><td>25–50%</td><td>Per hypoglycemia protocol; usually transient (12–48h)</td></tr>
<tr><td><strong>Macrosomia (LGA)</strong></td><td>Insulin = growth factor</td><td>15–45%</td><td>Birth injury risk (shoulder dystocia, brachial plexus)</td></tr>
<tr><td><strong>Polycythemia</strong></td><td>Hyperinsulinemia → ↑ O₂ consumption → fetal hypoxia → ↑ EPO</td><td>5–10%</td><td>Monitor Hct; PET if symptomatic or Hct ≥70%</td></tr>
<tr><td><strong>Hypocalcemia</strong></td><td>Functional hypoparathyroidism</td><td>20–50%</td><td>Monitor iCa; treat if symptomatic</td></tr>
<tr><td><strong>Hypomagnesemia</strong></td><td>Maternal Mg loss from osmotic diuresis</td><td>10–30%</td><td>Check Mg if Ca not correcting</td></tr>
<tr><td><strong>Cardiac</strong></td><td>Hypertrophic cardiomyopathy (septal hypertrophy), VSD, TGA</td><td>HCM 30%; CHD 5×</td><td>Echo if murmur or symptoms; HCM usually resolves by 6 months</td></tr>
<tr><td><strong>Respiratory</strong></td><td>Delayed surfactant maturation; RDS</td><td>Variable</td><td>Surfactant therapy if indicated</td></tr>
<tr><td><strong>Hyperbilirubinemia</strong></td><td>Polycythemia → increased RBC breakdown</td><td>25%</td><td>Per AAP phototherapy guidelines</td></tr>
</tbody></table>`,
t2:`<ul><li>Glucose screening: at 1h, 2h, 4h, 8h, 12h after birth (at minimum)</li>
<li>Feed within first hour</li>
<li>Calcium (iCa) at 12–24 hours</li>
<li>Hematocrit at 4–6 hours (polycythemia check)</li>
<li>Bilirubin per AAP protocol</li>
<li>Cardiac assessment: auscultation; echo if murmur, cardiomegaly on CXR, or symptoms</li>
<li>Watch for birth injuries if LGA: clavicle fracture, brachial plexus palsy</li></ul>`
}}
]};
