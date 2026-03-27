// Clinical tree data — Neonatal Respiratory Escalation & NIV Decision Tree
// Sources: Sweet et al. European Consensus Guidelines 8th ed. 2023,
//          AAP NRP 8th Edition 2021, Fischer & Buhrer Cochrane Reviews,
//          SUPPORT Trial, CPAP-ARM trial, Vermont Oxford Network protocols
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Respiratory\nEscalation & NIV",icon:"💨",type:"assessment",sub:"CPAP → HFNC → BiPAP → Intubation · Surfactant · Titration",edge:"",
info:{tabs:["Respiratory Support Ladder","SpO₂ Targets","Surfactant Criteria","Extubation Readiness"],
t0:`<p><strong>Neonatal Respiratory Support Ladder — CPAP-first approach:</strong></p>
<table class="rt"><thead><tr><th>Level</th><th>Support Mode</th><th>Indication</th></tr></thead><tbody>
<tr><td>1</td><td>Supplemental O₂ (NC/mask)</td><td>Mild O₂ need, FiO₂ ≤0.35, no significant WOB</td></tr>
<tr><td>2</td><td>CPAP 5–8 cmH₂O</td><td>FiO₂ &gt;0.30–0.35, grunting, retractions; FIRST-LINE for preterm</td></tr>
<tr><td>3</td><td>HFNC (Heated humidified high-flow NC)</td><td>Weaning from CPAP; post-extubation support; some evidence for primary therapy</td></tr>
<tr><td>4</td><td>BiPAP / NIPPV</td><td>Apnea of prematurity; CPAP failure; post-extubation</td></tr>
<tr><td>5</td><td>Non-invasive HHFV (if available)</td><td>Rescue before intubation; center-specific</td></tr>
<tr><td>6</td><td>Intubation + MV</td><td>CPAP/NIV failure; apnea; FiO₂ &gt;0.40–0.50 on maximal NIV; hemodynamic compromise</td></tr>
<tr><td>7</td><td>HFOV / HFJV</td><td>Conventional MV failure; severe air leak; PPHN</td></tr>
<tr><td>8</td><td>iNO</td><td>PPHN with OI &gt;25; term/near-term infants</td></tr>
<tr><td>9</td><td>ECMO</td><td>OI &gt;40 despite maximal therapy; reversible cause</td></tr>
</tbody></table>`,
t1:`<p><strong>SpO₂ targets by gestational age and condition:</strong></p>
<table class="rt"><thead><tr><th>Population</th><th>Target SpO₂</th><th>Lower Alarm</th><th>Upper Alarm</th></tr></thead><tbody>
<tr><td>Preterm &lt;32 weeks</td><td>90–95%</td><td>89%</td><td>95%</td></tr>
<tr><td>Preterm 32–36 weeks</td><td>90–95%</td><td>89%</td><td>95%</td></tr>
<tr><td>Term ≥37 weeks</td><td>93–98%</td><td>92%</td><td>98%</td></tr>
<tr><td>PPHN (term)</td><td>95–99%</td><td>94%</td><td>99%</td></tr>
<tr><td>CDH (pre-operative)</td><td>80–95% permissive</td><td>75%</td><td>95%</td></tr>
<tr><td>Ductal-dependent CHD (pre-PGE)</td><td>75–85%</td><td>70%</td><td>85%</td></tr>
</tbody></table>
<div class="bx br">🚨 Sustained SpO₂ &gt;95% in preterm infants &lt;32 weeks significantly increases risk of ROP (retinopathy of prematurity), BPD, and mortality. BOOST-II, COT, and SUPPORT trials all confirm this. Set upper alarm at 95%.</div>`,
t2:`<p><strong>Surfactant administration criteria (European Consensus 2023):</strong></p>
<table class="rt"><thead><tr><th>GA</th><th>Threshold for Surfactant</th><th>Preferred Method</th></tr></thead><tbody>
<tr><td>&lt;28 weeks</td><td>FiO₂ &gt;0.25–0.30 on CPAP ≥6 cmH₂O</td><td>LISA or INSURE (if CPAP insufficient)</td></tr>
<tr><td>28–32 weeks</td><td>FiO₂ &gt;0.30–0.35 on CPAP ≥6 cmH₂O</td><td>LISA preferred over intubation + MV</td></tr>
<tr><td>32–36 weeks</td><td>FiO₂ &gt;0.40 on CPAP</td><td>INSURE or LISA</td></tr>
<tr><td>Any GA</td><td>Intubated for respiratory failure</td><td>Via ETT (instillation or INSURE)</td></tr>
</tbody></table>
<p><strong>Dose:</strong> Poractant alfa 200 mg/kg (2.5 mL/kg) preferred (superior to 100 mg/kg; Ramanathan NEJM 2005)</p>`,
t3:`<p><strong>Extubation readiness criteria:</strong></p>
<ul>
<li>FiO₂ ≤0.30–0.35 on conventional MV</li>
<li>MAP ≤8–10 cmH₂O on SIMV or ≤8 cmH₂O on CPAP mode</li>
<li>Regular respiratory effort with minimal apnea</li>
<li>Hemodynamically stable (no vasopressors, HR/BP stable)</li>
<li>Blood gas acceptable (pH ≥7.25, PaCO₂ ≤60, PaO₂ ≥50)</li>
<li>Caffeine on board (≥36h therapeutic loading complete)</li>
<li>No unresolved severe IVH or seizures</li>
<li>Post-extubation NIV prepared at bedside (CPAP or HFNC pre-set)</li>
</ul>
<div class="bx bg">✓ <strong>Extubate to CPAP, not to HFNC</strong> as primary post-extubation support in ELBW infants. Cochrane review 2022 shows CPAP superior to HFNC for post-extubation failure rate in &lt;28 week infants.</div>`
},children:[
// ─── CPAP ───
{name:"CPAP\nInitiation",icon:"🫁",type:"action",sub:"5–8 cmH₂O · FiO₂ titrated · Starting point for most preterm",edge:"Primary NIV\nfor RDS/preterm",
info:{tabs:["CPAP Settings","Interfaces","When CPAP Fails","Caffeine"],
t0:`<p><strong>CPAP initiation settings:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Starting Value</th><th>Range</th></tr></thead><tbody>
<tr><td>PEEP</td><td>6 cmH₂O</td><td>5–8 cmH₂O</td></tr>
<tr><td>FiO₂</td><td>0.21 or SpO₂-titrated</td><td>0.21–1.0</td></tr>
<tr><td>Gas flow</td><td>8–10 L/min</td><td>6–12 L/min</td></tr>
<tr><td>Temperature</td><td>37°C</td><td>36–38°C</td></tr>
<tr><td>Humidity</td><td>100% (33 mg H₂O/L)</td><td>—</td></tr>
</tbody></table>
<p><strong>CPAP weaning:</strong> Wean FiO₂ to 0.21 first. Then reduce PEEP by 1 cmH₂O steps to 5 cmH₂O. Trial off CPAP after tolerating PEEP 5 + FiO₂ 0.21 for ≥4–8h.</p>`,
t1:`<p><strong>CPAP interfaces:</strong></p>
<ul>
<li><strong>Prongs (binasal):</strong> Most effective — short, wide, soft prongs (Infant Flow, RAM cannula). Risk: nasal septal trauma with prolonged use.</li>
<li><strong>Mask:</strong> Alternative to prongs; better for brief use; less effective for long-term.</li>
<li><strong>Devices:</strong> Variable-flow (Infant Flow) provides more consistent pressure; bubble CPAP low-tech and effective</li>
<li><strong>Bubble CPAP:</strong> Cheap, effective, offline-friendly — water column set at CPAP level. Used widely in low-resource settings.</li>
</ul>`,
t2:`<p><strong>CPAP failure criteria — escalate to intubation:</strong></p>
<ul>
<li>FiO₂ &gt;0.40–0.50 despite CPAP ≥7–8 cmH₂O</li>
<li>Severe increasing work of breathing despite CPAP</li>
<li>Recurrent apnea unresponsive to stimulation or caffeine</li>
<li>pH &lt;7.20 or rising PaCO₂ &gt;65 mmHg with acidosis</li>
<li>Hemodynamic compromise</li>
<li>Uncontrolled air leak syndrome (pneumothorax)</li>
</ul>`,
t3:`<p><strong>Caffeine citrate — universal for preterm &lt;32 weeks:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Dose</th></tr></thead><tbody>
<tr><td>Loading dose</td><td>20 mg/kg IV/PO (of caffeine citrate)</td></tr>
<tr><td>Maintenance</td><td>5–10 mg/kg/day PO q24h (start 24h after load)</td></tr>
<tr><td>Therapeutic level</td><td>8–20 mg/L (not routinely measured)</td></tr>
<tr><td>Duration</td><td>Continue until 33–34 weeks postmenstrual age (or apnea-free ≥5–7 days)</td></tr>
</tbody></table>
<div class="bx bg">✓ Caffeine reduces apnea of prematurity, reduces MV duration, and at 18 months follow-up reduces rates of BPD and neurodevelopmental impairment (CAP trial, Schmidt et al., NEJM 2006).</div>`
},children:[
{name:"CPAP Adequate\n→ Monitor & Wean",icon:"✅",type:"action",sub:"Wean FiO₂ first · Then PEEP · Trial off when stable",edge:"SpO₂ 90–95%\non FiO₂ ≤0.30"},
{name:"CPAP +\nSurfactant (LISA)",icon:"💉",type:"urgent",sub:"FiO₂ >0.30 · LISA preferred · Infant stays on CPAP",edge:"FiO₂ >0.30–0.35\non CPAP",
info:{tabs:["LISA Procedure","After Surfactant"],
t0:`<p><strong>LISA (Less Invasive Surfactant Administration):</strong></p>
<ol class="sl">
<li>Confirm spontaneous breathing and adequate CPAP response (not paralyzed or apneic)</li>
<li>Premedication: Consider atropine 0.01 mg/kg IV + sucrose pacifier. Avoid paralysis/sedation if possible.</li>
<li>Direct laryngoscopy: Miller 0–1 blade, visualize cords</li>
<li>Insert thin catheter (16Fr feeding tube or LISA catheter) 1–2 cm below cords</li>
<li>Infuse surfactant slowly over 1–3 minutes (poractant 200 mg/kg, 2.5 mL/kg)</li>
<li>Remove catheter. Resume CPAP immediately.</li>
<li>Avoid BVM unless SpO₂ &lt;75% — positive pressure after LISA increases lung injury</li>
</ol>`,
t1:`<p><strong>Management after LISA/surfactant:</strong></p>
<ul>
<li>Expect FiO₂ drop within 30–60 minutes of surfactant</li>
<li>Wean FiO₂ actively as SpO₂ rises — avoid hyperoxia</li>
<li>Continue CPAP — do not remove until stable for ≥4h</li>
<li>Repeat surfactant dose in 6–12h if FiO₂ remains &gt;0.30 (poractant 100 mg/kg × 2–3 additional doses PRN)</li>
<li>If LISA not feasible: INSURE (INtubate, SURfactant, Extubate) — intubate briefly, give surfactant, extubate to CPAP within 30–60 min</li>
</ul>`
}},
{name:"CPAP Failure\n→ BiPAP/NIPPV",icon:"⬆️",type:"urgent",sub:"NIPPV 15–20/5 cmH₂O · Backup rate 40–60/min · For CPAP failure",edge:"Worsening on\nCPAP",
info:{tabs:["NIPPV Settings","vs CPAP Evidence"],
t0:`<p><strong>NIPPV / BiPAP initial settings:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Starting Value</th><th>Range</th></tr></thead><tbody>
<tr><td>PIP (inspiratory pressure)</td><td>15–18 cmH₂O</td><td>12–22 cmH₂O</td></tr>
<tr><td>PEEP (expiratory pressure)</td><td>5–6 cmH₂O</td><td>4–8 cmH₂O</td></tr>
<tr><td>Rate (backup)</td><td>40–60/min</td><td>20–60/min</td></tr>
<tr><td>Inspiratory time</td><td>0.3–0.4 sec</td><td>0.3–0.5 sec</td></tr>
<tr><td>FiO₂</td><td>Match CPAP FiO₂</td><td>0.21–1.0</td></tr>
</tbody></table>`,
t1:`<p><strong>NIPPV vs CPAP evidence:</strong></p>
<ul>
<li>NIPPV as post-extubation support reduces reintubation rate vs CPAP (Cochrane 2022: RR 0.72)</li>
<li>Primary therapy: NIPPV may reduce surfactant need vs CPAP, but evidence less clear</li>
<li>Synchronized NIPPV (SNIPPV) superior to non-synchronized for reducing reintubation</li>
<li>Apnea of prematurity: NIPPV reduces apnea episodes more effectively than CPAP alone</li>
</ul>`
},children:[
{name:"Intubation\nIndicated",icon:"🚨",type:"emergency",sub:"FiO₂ >0.50 · pH <7.20 · Apnea · Hemodynamic compromise",edge:"NIPPV fails\nor acute deterioration",
info:{tabs:["RSI Drugs Neonatal","Ventilator Settings","Surfactant via ETT","Blood Gas Targets"],
t0:`<p><strong>Neonatal RSI / intubation premedication:</strong></p>
<table class="rt"><thead><tr><th>Drug</th><th>Dose</th><th>Notes</th></tr></thead><tbody>
<tr><td>Atropine</td><td>0.01–0.02 mg/kg IV</td><td>Vagal blockade — prevents bradycardia during laryngoscopy. Min dose 0.1 mg.</td></tr>
<tr><td>Morphine</td><td>0.05–0.1 mg/kg IV slow</td><td>Analgesia/sedation. Avoid if hemodynamically unstable.</td></tr>
<tr><td>Fentanyl</td><td>1–4 mcg/kg IV slow</td><td>Faster onset than morphine. Less histamine release.</td></tr>
<tr><td>Succinylcholine</td><td>2 mg/kg IV (&lt;10 kg)</td><td>Depolarizing paralysis. Avoid if hyperkalemia, myopathies, burns, crush injury.</td></tr>
<tr><td>Rocuronium</td><td>1 mg/kg IV</td><td>Non-depolarizing. Reversible with sugammadex 16 mg/kg if needed.</td></tr>
<tr><td>Midazolam</td><td>0.05–0.1 mg/kg IV</td><td>Sedation. Causes hypotension — use with caution in hemodynamically unstable.</td></tr>
<tr><td>Ketamine</td><td>1–2 mg/kg IV</td><td>Hemodynamically stable sedation. Maintains airway reflexes. Avoid in suspected ↑ ICP.</td></tr>
</tbody></table>`,
t1:`<p><strong>Initial ventilator settings after neonatal intubation:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Starting Value</th><th>Target / Rationale</th></tr></thead><tbody>
<tr><td>Mode</td><td>SIMV + PS or A/C</td><td>Volume-targeted preferred (VTV reduces BPD)</td></tr>
<tr><td>Tidal volume (VT)</td><td>4–5 mL/kg</td><td>Volume-targeted; avoid &gt;6 mL/kg (volutrauma)</td></tr>
<tr><td>Rate</td><td>40–60/min</td><td>Age-appropriate; allow spontaneous breathing</td></tr>
<tr><td>PEEP</td><td>5 cmH₂O</td><td>Maintain FRC; increase for refractory hypoxemia</td></tr>
<tr><td>Ti</td><td>0.35–0.40 sec</td><td>Avoid air trapping — short Ti in preterm</td></tr>
<tr><td>FiO₂</td><td>0.40 start</td><td>Wean to SpO₂ target within minutes</td></tr>
</tbody></table>`,
t2:`<p><strong>Surfactant via endotracheal tube:</strong></p>
<p>Give immediately after intubation for RDS in preterm if not given via LISA previously.</p>
<ul>
<li>Poractant alfa 200 mg/kg (2.5 mL/kg) — instill via ETT; give in 2 halves with repositioning</li>
<li>Do NOT disconnect from ventilator to give surfactant — use inline adapter</li>
<li>Positive pressure assists distribution: give via manual breath OR ventilator during instillation</li>
<li>CXR within 1–2h post-surfactant to check ETT position and assess distribution</li>
</ul>`,
t3:`<p><strong>Blood gas targets on conventional mechanical ventilation:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Target</th><th>Notes</th></tr></thead><tbody>
<tr><td>pH</td><td>7.25–7.40</td><td>Permissive hypercapnia acceptable (7.20–7.25) to minimize vent pressures</td></tr>
<tr><td>PaCO₂</td><td>45–60 mmHg</td><td>Permissive: 45–65. Avoid &lt;35 (hypocapnia → IVH, PVL).</td></tr>
<tr><td>PaO₂</td><td>50–75 mmHg</td><td>Avoid sustained &gt;80 (hyperoxia) and &lt;45 (hypoxia)</td></tr>
<tr><td>SpO₂</td><td>90–95% (preterm)</td><td>93–98% for term. Upper alarm 95% for preterm.</td></tr>
<tr><td>Blood gas frequency</td><td>q4–8h until stable</td><td>After each ventilator change within 30–60 min</td></tr>
</tbody></table>
<div class="bx br">🚨 <strong>Avoid hypocapnia</strong> (PaCO₂ &lt;35 mmHg): Cerebral vasoconstriction → periventricular leukomalacia (PVL) and contributes to IVH in VLBW infants. Check ABG after ANY ventilator change.</div>`
},children:[
{name:"Refractory\n→ HFOV / iNO",icon:"🆘",type:"emergency",sub:"OI >20 · PPHN · Severe air leak · HFOV rescue",edge:"Conventional\nMV failing",
info:{tabs:["HFOV Settings","iNO Indications","ECMO Criteria"],
t0:`<p><strong>High-Frequency Oscillatory Ventilation (HFOV) settings:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Starting Value</th></tr></thead><tbody>
<tr><td>Mean Airway Pressure (MAP)</td><td>2–4 cmH₂O above last conventional MAP</td></tr>
<tr><td>Amplitude (ΔP)</td><td>Chest wiggle factor visible; start 2× MAP</td></tr>
<tr><td>Frequency (Hz)</td><td>10–15 Hz (preterm); 8–12 Hz (term)</td></tr>
<tr><td>I:E ratio</td><td>1:2 (inspiratory bias flow)</td></tr>
<tr><td>FiO₂</td><td>Match last conventional setting</td></tr>
</tbody></table>
<p>Optimize MAP on HFOV: CXR should show 8–9 ribs posterior at optimal lung volume.</p>`,
t1:`<p><strong>Inhaled Nitric Oxide (iNO) — indications and dosing:</strong></p>
<ul>
<li><strong>Indication:</strong> PPHN in term/near-term (&gt;34 weeks) infants. OI ≥25 despite optimal ventilation.</li>
<li><strong>Oxygenation Index (OI):</strong> (MAP × FiO₂ × 100) / PaO₂. OI &gt;25 = severe hypoxemia.</li>
<li><strong>Starting dose:</strong> 20 ppm. Response usually within 30–60 minutes.</li>
<li><strong>Titration:</strong> Down-titrate to 5 ppm if response. Wean slowly (5 → 1 ppm over hours/days).</li>
<li><strong>Abrupt discontinuation:</strong> May cause rebound pulmonary hypertension — wean slowly</li>
<li><strong>Not indicated:</strong> Preterm &lt;34 weeks (no benefit; NICHD trial), CDH (not routinely beneficial)</li>
</ul>`,
t2:`<p><strong>ECMO criteria for neonatal respiratory failure:</strong></p>
<ul>
<li>OI &gt;40 for 4+ hours despite maximal medical therapy</li>
<li>Predicted mortality &gt;80% on conventional therapy</li>
<li>Reversible cause of respiratory failure (MAS, PPHN, RDS, pneumonia)</li>
<li>GA ≥34 weeks (relative — center dependent); &lt;34 weeks very high bleeding risk</li>
<li>Weight ≥2 kg</li>
<li>No lethal malformation or chromosomal abnormality</li>
<li>Intracranial hemorrhage excluded (Grade I maximum as relative; Grade II–IV = contraindication)</li>
</ul>
<div class="bx bb">ℹ️ ECMO for neonatal respiratory failure has survival rate ~75–80% for MAS and PPHN. Transfer to ECMO-capable center (Level IV NICU) should be initiated before OI &gt;40 if possible — early referral improves outcomes.</div>`
}
}
]}
]}
]};
