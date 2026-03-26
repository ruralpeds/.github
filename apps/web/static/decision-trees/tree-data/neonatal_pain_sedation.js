// Clinical tree data — Neonatal Pain & Sedation Decision Tree
// Source: 
// Auto-extracted from neonatal_pain_sedation_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal Pain\n& Sedation",icon:"💊",type:"assessment",sub:"NPASS scoring, non-pharm first, opioid/sedation protocols",edge:"",
info:{tabs:["Pain Assessment","Non-Pharmacologic","Pharmacologic Overview"],
t0:`<p>Neonates DO experience pain — their neurologic pathways for pain transmission are functional by 20 weeks gestation. Untreated pain causes physiologic stress (↑ HR, ↑ BP, ↑ cortisol, ↑ catecholamines), altered brain development, and increased mortality in critically ill neonates.</p>
<p><strong>Pain assessment tools:</strong></p>
<table class="dt"><thead><tr><th>Tool</th><th>Population</th><th>Measures</th></tr></thead><tbody>
<tr><td><strong>NPASS</strong> (Neonatal Pain, Agitation & Sedation Scale)</td><td>All neonates including preterm</td><td>Crying/irritability, behavior/state, facial expression, extremity tone, vital signs. Score 0–10 for pain, 0 to -10 for sedation.</td></tr>
<tr><td><strong>PIPP-R</strong> (Premature Infant Pain Profile-Revised)</td><td>Preterm and term</td><td>GA correction, behavioral state, HR, SpO₂, brow bulge, eye squeeze, nasolabial furrow</td></tr>
<tr><td><strong>NIPS</strong> (Neonatal Infant Pain Scale)</td><td>Preterm and term</td><td>Facial expression, cry, breathing pattern, arms, legs, state of arousal</td></tr>
<tr><td><strong>CRIES</strong></td><td>Postoperative neonates</td><td>Crying, Requires O₂, Increased vitals, Expression, Sleeplessness</td></tr>
</tbody></table>`,
t1:`<p><strong>Non-pharmacologic interventions (ALWAYS first-line):</strong></p>
<ul><li><strong>Sucrose/glucose 24%:</strong> 0.1–0.5 mL on anterior tongue 2 min before painful procedure. Most studied non-pharm intervention. Reduces pain scores for heel sticks, venipuncture, IV insertion. Less effective for prolonged pain.</li>
<li><strong>Non-nutritive sucking:</strong> Pacifier during/after procedure. Synergistic with sucrose.</li>
<li><strong>Skin-to-skin (kangaroo care):</strong> Reduces pain response to heel sticks. Begin 15 min before procedure.</li>
<li><strong>Swaddling / facilitated tucking:</strong> Containment reduces physiologic stress response.</li>
<li><strong>Breastfeeding:</strong> During minor procedures — combines sucrose, sucking, skin-to-skin, and maternal comfort.</li></ul>
<div class="bx bg">✓ <strong>Sucrose 24% + non-nutritive sucking + swaddling</strong> is the evidence-based standard for minor procedural pain in all NICUs. Use for EVERY heel stick, venipuncture, and line placement.</div>`,
t2:`<table class="rt"><thead><tr><th>Agent</th><th>Indication</th><th>Dose</th><th>Key Considerations</th></tr></thead><tbody>
<tr><td><strong>Morphine</strong></td><td>Moderate-severe pain, post-op, ventilated</td><td>0.05–0.1 mg/kg IV q4h PRN or 10–20 µg/kg/hr infusion</td><td>Respiratory depression, hypotension, ileus, urinary retention. Slow onset (5–10 min).</td></tr>
<tr><td><strong>Fentanyl</strong></td><td>Severe pain, intubation, rapid onset needed</td><td>1–2 µg/kg IV q2–4h PRN or 1–3 µg/kg/hr infusion</td><td>Chest wall rigidity at high doses/rapid push. Faster onset than morphine. Less hypotension.</td></tr>
<tr><td><strong>Acetaminophen</strong></td><td>Mild-moderate pain, post-op adjunct</td><td>10–15 mg/kg PO/PR q6–8h (max 60 mg/kg/day term)</td><td>No respiratory depression. Good adjunct to reduce opioid need. IV available (Ofirmev).</td></tr>
<tr><td><strong>Midazolam</strong></td><td>Sedation, NOT analgesia (no pain relief)</td><td>0.05–0.1 mg/kg IV; 0.02–0.06 mg/kg/hr infusion</td><td>Anxiolysis/amnesia only. Hypotension. DOES NOT treat pain. Controversial in preterm (IVH concern from NOPAIN trial).</td></tr>
<tr><td><strong>Dexmedetomidine</strong></td><td>Sedation + mild analgesia</td><td>0.2–0.5 µg/kg/hr infusion</td><td>α₂-agonist. Less respiratory depression. Bradycardia is main side effect. Increasingly used in NICU.</td></tr>
</tbody></table>`
},children:[
{name:"Procedural Pain\nManagement",icon:"💉",type:"action",sub:"Sucrose + swaddling + NNS for minor procedures",edge:"Heel stick,\nIV, LP, etc.",
info:{tabs:["Minor Procedures","Major Procedures","Intubation"],
t0:`<p><strong>Minor procedures (heel stick, venipuncture, IV start, NG/OG placement):</strong></p>
<ol class="sl">
<li>Sucrose 24% 0.1–0.5 mL on tongue 2 min before procedure</li>
<li>Non-nutritive sucking (pacifier)</li>
<li>Swaddling or facilitated tucking</li>
<li>Skin-to-skin if possible and practical</li>
<li>Breastfeeding during procedure (if available and appropriate)</li>
</ol>`,
t1:`<p><strong>Major procedures (chest tube, central line, circumcision, lumbar puncture):</strong></p>
<ul><li>All non-pharm interventions PLUS:</li>
<li><strong>Chest tube:</strong> Fentanyl 1–2 µg/kg IV + local lidocaine 1% (0.5 mL max) infiltration</li>
<li><strong>Central line (PICC/UVC):</strong> Sucrose + swaddling minimum; consider fentanyl for PICC in awake infants</li>
<li><strong>Circumcision:</strong> Dorsal penile nerve block (DPNB) with lidocaine 1% without epi (0.8 mL per side) OR ring block + sucrose + pacifier. DPNB is the most effective intervention.</li>
<li><strong>LP:</strong> Sucrose + local EMLA cream (applied 60 min before) or lidocaine infiltration + facilitated tucking</li></ul>`,
t2:`<p><strong>Premedication for non-emergent intubation:</strong></p>
<ul><li><strong>AAP recommends premedication for ALL non-emergent intubations.</strong> Awake intubation without premedication causes pain, physiologic instability, IVH risk, and vocal cord injury.</li>
<li><strong>Recommended regimen:</strong> Atropine 0.02 mg/kg IV (prevents vagal bradycardia) + Fentanyl 2 µg/kg IV (analgesia) ± Succinylcholine 2 mg/kg IV or Rocuronium 1 mg/kg IV (paralysis)</li>
<li>Alternative: morphine 0.1 mg/kg IV (slower onset; give 5 min before attempt)</li>
<li><strong>Exception:</strong> Emergency intubation in the delivery room or acute deterioration — premedication not feasible, proceed immediately</li></ul>
<div class="bx bo">⚠️ <strong>Chest wall rigidity</strong> can occur with rapid fentanyl push — give slowly over 2–3 minutes. If rigidity occurs: naloxone 0.1 mg/kg IV or muscle relaxant (rocuronium).</div>`
}},
{name:"Postoperative\nPain Protocol",icon:"🏥",type:"action",sub:"Multimodal · Opioid + acetaminophen · Wean plan",edge:"After\nsurgery",
info:{tabs:["Multimodal Approach","Opioid Weaning"],
t0:`<p><strong>Multimodal postoperative pain management:</strong></p>
<ul><li><strong>Scheduled acetaminophen</strong> (10–15 mg/kg PO/PR q6h) — reduces opioid requirements by 20–30%</li>
<li><strong>Morphine or fentanyl</strong> for moderate-severe pain — titrate to NPASS score &lt;3</li>
<li><strong>Continuous infusion</strong> for first 24–48h for major surgery, then transition to PRN</li>
<li><strong>Non-pharm:</strong> Swaddling, positioning, skin-to-skin when safe, sucrose for procedures</li>
<li><strong>Regional anesthesia:</strong> Caudal block or wound infiltration when appropriate (reduces systemic opioid need)</li></ul>`,
t1:`<p><strong>Opioid weaning (after >5 days continuous use):</strong></p>
<ul><li>Wean 10–20% of total daily dose every 24–48 hours</li>
<li>Monitor for withdrawal signs (NPASS sedation/agitation scores, WAT-1 if available)</li>
<li>If withdrawal signs appear → increase back to last tolerated dose and slow the wean</li>
<li>Consider methadone conversion for prolonged opioid use (>7 days) — longer half-life allows smoother wean</li>
<li>Adjuncts for iatrogenic withdrawal: clonidine 0.5–1 µg/kg q4–6h, dexmedetomidine taper</li></ul>`
}},
{name:"Palliative Care\n& Comfort",icon:"🕊️",type:"action",sub:"Comfort measures · Family support · Symptom management",edge:"Goals of care\ndiscussion",
info:{tabs:["When to Involve","Symptom Management"],
t0:`<p><strong>Indications for neonatal palliative care consultation:</strong></p>
<ul><li>Lethal congenital anomalies (bilateral renal agenesis, anencephaly, trisomy 13/18 per family wishes)</li>
<li>Extreme prematurity at the border of viability (22–23 weeks) when family chooses comfort</li>
<li>Severe HIE with poor prognosis (Sarnat 3, devastating MRI findings)</li>
<li>Any infant where curative treatment is not achieving goals or causing suffering disproportionate to benefit</li>
<li>Palliative care is NOT "giving up" — it focuses on quality of life and can be concurrent with curative treatment</li></ul>`,
t1:`<p><strong>Comfort care symptom management:</strong></p>
<ul><li><strong>Pain/distress:</strong> Morphine 0.05–0.1 mg/kg IV/SQ q2–4h PRN. Goal = comfort, not sedation. No ceiling dose for comfort care.</li>
<li><strong>Dyspnea/air hunger:</strong> Morphine (reduces air hunger perception). Gentle O₂ by nasal cannula for comfort. Fan to face. Positioning.</li>
<li><strong>Secretions:</strong> Glycopyrrolate 5–10 µg/kg IV/SQ q4–6h. Gentle suctioning PRN.</li>
<li><strong>Seizures:</strong> Phenobarbital 20 mg/kg loading. Midazolam for refractory.</li>
<li><strong>Family support:</strong> Unlimited family presence, skin-to-skin, memory-making (photos, hand/footprints, naming ceremony, chaplain/spiritual care), bereavement support</li></ul>`
}}
]};
