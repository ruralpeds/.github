// Clinical tree data — Neonatal Cardiac / PDA Decision Tree
// Source: 
// Auto-extracted from neonatal_cardiac_pda_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal Cardiac\nAssessment",icon:"❤️",type:"assessment",sub:"CHD screening, PDA, ductal-dependent lesions, prostaglandin",edge:"",
info:{tabs:["Overview","Critical Pulse Ox Screening","When to Suspect CHD"],
t0:`<p>Congenital heart disease (CHD) affects ~1% of live births (~40,000/year in US). Critical CHD (requiring surgery or catheter intervention in the first year) affects ~25% of those. Newborn screening with pulse oximetry detects many critical CHDs before clinical deterioration.</p>
<p><strong>Key neonatal cardiac presentations:</strong></p>
<ul><li>Cyanosis (central, not improving with O₂ = right-to-left shunt)</li>
<li>Heart failure (tachypnea, hepatomegaly, poor feeding, failure to thrive)</li>
<li>Shock / cardiovascular collapse (ductal-dependent lesion as PDA closes)</li>
<li>Murmur (may or may not indicate significant disease)</li>
<li>Pre/post-ductal SpO₂ difference</li></ul>`,
t1:`<p><strong>Critical Congenital Heart Disease (CCHD) Pulse Oximetry Screening:</strong></p>
<ol class="sl">
<li><strong>Timing:</strong> After 24 hours of age (or before discharge if earlier). Both right hand (pre-ductal) AND either foot (post-ductal).</li>
<li><strong>PASS:</strong> SpO₂ ≥95% in BOTH extremities AND ≤3% difference between them</li>
<li><strong>FAIL:</strong> SpO₂ &lt;90% in either extremity → immediate evaluation</li>
<li><strong>REPEAT:</strong> SpO₂ 90–94% in either, OR >3% difference → repeat in 1 hour × up to 3 attempts. If still failing → evaluate.</li>
</ol>
<p><strong>CCHD targets detected:</strong> HLHS, pulmonary atresia, TOF, TAPVR, TGA, tricuspid atresia, truncus arteriosus. Sensitivity ~75–80%. Does NOT reliably detect coarctation, ASD, VSD.</p>
<div class="bx bo">⚠️ <strong>Pulse ox screening does NOT detect ALL CHD.</strong> Normal screening does NOT rule out significant heart disease. Clinical assessment remains essential. Coarctation is the most commonly missed critical CHD by pulse ox.</div>`,
t2:`<p><strong>Clinical signs suggesting CHD in a neonate:</strong></p>
<ul><li>Central cyanosis NOT improving with supplemental O₂ (hyperoxia test: PaO₂ remains &lt;150 mmHg on 100% FiO₂ = intracardiac shunt)</li>
<li>Shock or cardiovascular collapse at 2–7 days of life (as PDA closes → ductal-dependent lesion unmasked)</li>
<li>Tachypnea WITHOUT significant respiratory distress ("happy tachypnea" = left-to-right shunt or TAPVR)</li>
<li>Absent or weak femoral pulses (coarctation)</li>
<li>Hepatomegaly (right heart failure)</li>
<li>Single loud S2 (suggests univentricular physiology or pulmonary hypertension)</li>
<li>Pre/post-ductal SpO₂ gradient >3% (right-to-left ductal shunting)</li></ul>`
},children:[
{name:"PDA\nManagement",icon:"🔴",type:"decision",sub:"Ibuprofen vs acetaminophen vs conservative",edge:"Preterm +\necho-confirmed\nPDA",
info:{tabs:["Hemodynamic Significance","Treatment Options","Conservative Approach"],
t0:`<p><strong>Hemodynamically significant PDA (hsPDA) criteria:</strong></p>
<ul><li>PDA diameter >1.5 mm/kg on echo</li>
<li>LA:Ao ratio >1.5 (left atrial enlargement from volume overload)</li>
<li>Diastolic flow reversal in descending aorta</li>
<li>Clinical signs: widened pulse pressure, bounding pulses, hypotension (low diastolic), increased ventilatory support, pulmonary edema, feeding intolerance</li></ul>
<div class="bx bb">ℹ️ <strong>Not all PDAs need treatment.</strong> There is growing evidence that many PDAs in preterm infants close spontaneously. The trend is toward conservative management with selective treatment of hsPDA causing clinical deterioration.</div>`,
t1:`<table class="rt"><thead><tr><th>Agent</th><th>Dose</th><th>Efficacy</th><th>Side Effects</th></tr></thead><tbody>
<tr><td><strong>Ibuprofen (IV)</strong></td><td>10 mg/kg, then 5 mg/kg × 2 doses q24h</td><td>~70–80% closure</td><td>Renal impairment, GI perforation (especially with steroids), platelet dysfunction</td></tr>
<tr><td><strong>Ibuprofen (PO)</strong></td><td>10 mg/kg, then 5 mg/kg × 2 doses q24h</td><td>Equal or superior to IV</td><td>Same but possibly less renal toxicity</td></tr>
<tr><td><strong>Acetaminophen (IV/PO)</strong></td><td>15 mg/kg q6h × 3–7 days</td><td>~60–70% closure</td><td>Fewer renal/GI effects. Hepatotoxicity rare at standard doses. Growing evidence base.</td></tr>
<tr><td><strong>Indomethacin (IV)</strong></td><td>0.2 mg/kg, then 0.1–0.25 mg/kg × 2 q12–24h</td><td>~70% closure</td><td>More renal toxicity than ibuprofen. Reduced cerebral blood flow. Less used now.</td></tr>
</tbody></table>
<p><strong>Surgical/catheter ligation:</strong> Reserved for medical treatment failure with persistent hemodynamic compromise. Transcatheter closure increasingly available for larger preterm infants.</p>`,
t3:`<p><strong>Conservative ("watchful waiting") approach:</strong></p>
<ul><li>Emerging evidence supports conservative management for many preterm PDAs</li>
<li>PDA-TOLERATE trial (J Pediatr 2019): Early treatment of moderate PDA did NOT reduce BPD/death vs conservative</li>
<li>Strategy: fluid restriction (130–150 mL/kg/day), PEEP optimization, permissive hypercapnia, diuretics PRN</li>
<li>Treat only if: escalating respiratory support attributable to PDA, hemodynamic instability, or failure to advance feeds</li>
<li>Many PDAs close spontaneously by 36–40 weeks PMA</li></ul>
<div class="bx bg">✓ <strong>Trend in neonatology is toward LESS aggressive PDA treatment.</strong> Many centers have adopted conservative protocols and seen no increase in adverse outcomes.</div>`
}},
{name:"Ductal-Dependent\nLesions",icon:"🔴",type:"emergency",sub:"Prostaglandin E1 · Do NOT let PDA close",edge:"Cyanosis or\nshock at\n2–7 days",
info:{tabs:["Types","Prostaglandin Protocol","Stabilization"],
t0:`<p><strong>Ductal-dependent lesions:</strong> CHDs that require an open PDA to maintain either pulmonary blood flow (cyanotic) or systemic blood flow.</p>
<table class="dt"><thead><tr><th>Type</th><th>Depends on PDA For</th><th>Examples</th><th>Presentation</th></tr></thead><tbody>
<tr><td><strong>Ductal-dependent pulmonary</strong></td><td>Pulmonary blood flow (R→L through PDA to lungs)</td><td>Critical PS, pulmonary atresia, severe TOF, tricuspid atresia</td><td>Cyanosis, low SpO₂ that WORSENS as PDA closes (day 2–7)</td></tr>
<tr><td><strong>Ductal-dependent systemic</strong></td><td>Systemic blood flow (L→R through PDA to aorta)</td><td>HLHS, critical coarctation, interrupted aortic arch, critical AS</td><td>Shock, absent femoral pulses, metabolic acidosis, gray/mottled as PDA closes</td></tr>
<tr><td><strong>Ductal-dependent mixing</strong></td><td>Mixing of oxygenated and deoxygenated blood</td><td>TGA (d-TGA without VSD)</td><td>Severe cyanosis; may need balloon atrial septostomy (Rashkind)</td></tr>
</tbody></table>`,
t1:`<p><strong>Prostaglandin E1 (Alprostadil) Protocol:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Protocol</th></tr></thead><tbody>
<tr><td>Starting dose</td><td>0.05–0.1 µg/kg/min IV continuous infusion</td></tr>
<tr><td>Maintenance (once PDA open)</td><td>Wean to 0.01–0.03 µg/kg/min (lowest effective dose)</td></tr>
<tr><td>Response time</td><td>Minutes to hours for cyanotic lesions; may take longer for coarctation</td></tr>
<tr><td>Route</td><td>Peripheral IV acceptable initially; central line preferred for transport</td></tr>
</tbody></table>
<div class="bx br">🚨 <strong>PGE1 side effect: APNEA.</strong> Occurs in 10–20% of neonates, especially &lt;2 kg. Have intubation equipment at bedside. Many centers electively intubate before transport on PGE1.</div>
<p><strong>Other side effects:</strong> Fever (common, not necessarily infection), hypotension (vasodilation), flushing, jitteriness, diarrhea. Long-term: cortical hyperostosis (>4 weeks of use).</p>`,
t2:`<ol class="sl">
<li><strong>START PGE1 immediately</strong> if ductal-dependent lesion suspected (do NOT wait for echo confirmation if clinical picture is suggestive)</li>
<li><strong>Intubation equipment at bedside</strong> (apnea risk). Consider elective intubation for transport.</li>
<li><strong>IV access ×2</strong> — one dedicated for PGE1 infusion</li>
<li><strong>Avoid supplemental O₂ in excess</strong> — high FiO₂ promotes PDA closure (the opposite of what you want)</li>
<li><strong>Echocardiogram</strong> — confirm anatomy. If not available locally, describe findings to pediatric cardiology by phone.</li>
<li><strong>EMERGENT transfer to pediatric cardiac center</strong></li>
<li><strong>Monitor:</strong> SpO₂ (pre and post-ductal), BP (4-limb if coarctation suspected), blood gas, lactate</li>
</ol>`
}},
{name:"CCHD Pulse Ox\nScreening",icon:"📊",type:"action",sub:"≥24h age · Right hand + foot · ≥95%",edge:"Routine\nnewborn\nscreening",
info:{tabs:["Protocol","Failed Screen Algorithm"],
t0:`<p><strong>CCHD Screening Protocol (AAP/AHA):</strong></p>
<ol class="sl">
<li>Perform at ≥24 hours of age (or before discharge if earlier)</li>
<li>Measure SpO₂ on right hand (pre-ductal) AND either foot (post-ductal) simultaneously or sequentially</li>
<li>Use motion-tolerant pulse oximeter with neonatal probe</li>
<li>Record both values and calculate difference</li>
</ol>
<table class="rt"><thead><tr><th>Result</th><th>Criteria</th><th>Action</th></tr></thead><tbody>
<tr><td>✅ PASS</td><td>≥95% in both AND ≤3% difference</td><td>Routine care. Screen complete.</td></tr>
<tr><td>🔄 REPEAT</td><td>90–94% in either OR >3% difference</td><td>Repeat in 1 hour. Up to 3 total attempts.</td></tr>
<tr><td>❌ FAIL</td><td>&lt;90% in either extremity at any time, OR 3 consecutive repeats in 90–94% range / >3% difference</td><td>Immediate evaluation (see below)</td></tr>
</tbody></table>`,
t1:`<p><strong>Failed CCHD screen evaluation:</strong></p>
<ol class="sl">
<li><strong>Clinical assessment:</strong> Respiratory distress? Murmur? Femoral pulses? Color? Perfusion?</li>
<li><strong>Echocardiogram</strong> — urgent</li>
<li><strong>CXR</strong> — heart size, pulmonary vascularity, lung fields</li>
<li><strong>4-extremity BP</strong> — gradient >20 mmHg upper vs lower = coarctation</li>
<li><strong>Hyperoxia test:</strong> Place on 100% FiO₂ for 10 min → obtain ABG. PaO₂ &lt;150 mmHg = likely intracardiac shunt (CHD). PaO₂ >200 mmHg = likely pulmonary disease.</li>
<li><strong>If CHD confirmed:</strong> pediatric cardiology consultation, PGE1 if ductal-dependent lesion, transfer to cardiac center</li>
</ol>
<div class="bx bb">ℹ️ <strong>Most common cause of failed CCHD screen = transition physiology or pulmonary disease, NOT CHD.</strong> But EVERY failed screen requires evaluation. Do not dismiss based on "the baby looks fine."</div>`
}},
{name:"Neonatal\nArrhythmias",icon:"💓",type:"urgent",sub:"SVT most common · Adenosine · Vagal maneuvers",edge:"Abnormal\nheart rate\nor rhythm",
info:{tabs:["SVT","Bradycardia","Heart Block"],
t0:`<p><strong>Supraventricular Tachycardia (SVT):</strong> Most common neonatal arrhythmia. HR typically 220–300 bpm (regular, narrow complex). May present as heart failure if sustained.</p>
<p><strong>Treatment:</strong></p>
<ol class="sl">
<li><strong>Vagal maneuvers:</strong> Ice bag to face (diving reflex) × 15–20 sec. Do NOT use carotid massage or ocular pressure in neonates.</li>
<li><strong>Adenosine:</strong> 0.1 mg/kg rapid IV push (followed by rapid NS flush). Increase by 0.05 mg/kg increments to max 0.3 mg/kg. Use the most proximal IV site. Record rhythm strip during administration.</li>
<li><strong>If unstable (shock/heart failure):</strong> Synchronized cardioversion 0.5–1 J/kg → 2 J/kg if first attempt fails.</li>
<li><strong>Maintenance:</strong> Propranolol 1–2 mg/kg/day PO divided TID, or flecainide, or amiodarone for recurrent SVT.</li>
</ol>`,
t1:`<p><strong>Neonatal bradycardia:</strong></p>
<ul><li>Sinus bradycardia: HR &lt;80–100 bpm. Causes: hypothermia, hypoxia, vagal (suctioning, NG placement), medications (maternal β-blockers), raised ICP, hypothyroidism.</li>
<li>Treatment: treat the underlying cause. Atropine 0.02 mg/kg IV for symptomatic bradycardia. Epinephrine if unstable.</li></ul>`,
t2:`<p><strong>Congenital Complete Heart Block (CCHB):</strong></p>
<ul><li>Ventricular rate 40–80 bpm with AV dissociation</li>
<li><strong>Causes:</strong> Maternal anti-SSA/Ro or anti-SSB/La antibodies (neonatal lupus) in ~60%. Structural CHD (L-TGA, AV canal defects) in ~40%.</li>
<li>Neonatal lupus: may also have characteristic annular skin rash, hepatitis, cytopenias. Heart block is permanent; other manifestations are transient.</li>
<li><strong>Management:</strong> If hemodynamically stable: monitor, may tolerate. If symptomatic (HR &lt;55, heart failure, hydrops): isoproterenol infusion → temporary pacing → permanent pacemaker (epicardial).</li>
<li><strong>All pregnant women with anti-SSA/Ro antibodies:</strong> serial fetal echo starting at 16 weeks for early detection.</li></ul>`
}}
]};
