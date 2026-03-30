// Clinical tree data — Pediatric Difficult Airway Decision Tree
// Sources: Difficult Airway Society (DAS) Pediatric Guidelines 2015,
//          AAP/AHA PALS 2020/2025, Walls & Murphy Manual of Emergency Airway Management 5th ed.,
//          Pediatric Difficult Intubation (PeDI) Collaborative data
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric\nDifficult Airway",icon:"🌬️",type:"assessment",sub:"Anticipated or unanticipated difficulty · DIVA · CICO rescue",edge:"",
info:{tabs:["DIVA Prediction","Anatomic Predictors","Pre-Oxygenation","Equipment Checklist"],
t0:`<p><strong>Difficult Intubation in Very young children and Adolescents (DIVA) Score:</strong></p>
<p>Validated predictor of difficult direct laryngoscopy in children. Score ≥1 = seek expert help.</p>
<table class="rt"><thead><tr><th>Variable</th><th>Score</th></tr></thead><tbody>
<tr><td>Age &lt;1 year</td><td>+1</td></tr>
<tr><td>Weight &lt;10 kg</td><td>+1</td></tr>
<tr><td>History of difficult airway</td><td>+2</td></tr>
<tr><td>Syndromic features (Down, Treacher Collins, Pierre Robin, etc.)</td><td>+2</td></tr>
<tr><td>Mallampati III or IV</td><td>+1</td></tr>
<tr><td>Restricted mouth opening (&lt;3 cm / &lt;3 finger widths)</td><td>+1</td></tr>
<tr><td>Short/thick neck</td><td>+1</td></tr>
<tr><td>Abnormal airway anatomy (mass, trauma, burn)</td><td>+2</td></tr>
</tbody></table>
<p>DIVA ≥1: Anticipate difficulty. Senior/anesthesia help. Video laryngoscopy preferred. Have surgical airway plan.</p>`,
t1:`<p><strong>Anatomic features predicting pediatric difficult airway:</strong></p>
<ul>
<li><strong>Micrognathia / retrognathia:</strong> Pierre Robin sequence, Treacher Collins, Noonan — tongue base obstructs pharynx</li>
<li><strong>Macroglossia:</strong> Beckwith-Wiedemann, Down syndrome, hypothyroidism, mucopolysaccharidoses — tongue obstructs view</li>
<li><strong>Short trachea / cervical instability:</strong> Down syndrome (atlanto-axial instability), Klippel-Feil — avoid neck extension</li>
<li><strong>Airway mass:</strong> Cystic hygroma, hemangioma, abscess, foreign body — may distort or occlude airway</li>
<li><strong>Cervical hematoma / angioedema:</strong> Rapidly expanding — emergent surgical airway may be only option</li>
<li><strong>Burns / inhalation injury:</strong> Progressive edema — intubate early before swelling closes airway</li>
<li><strong>Infant anatomy:</strong> Larger occiput (sniffing position essential), anterior larynx, floppy omega epiglottis, shorter trachea</li>
</ul>`,
t2:`<p><strong>Pre-oxygenation strategies:</strong></p>
<ul>
<li><strong>Non-rebreather mask:</strong> 15 L/min × 3–5 min — achieves ~90% FiO₂. First-line for elective RSI.</li>
<li><strong>High-flow nasal cannula (HFNC):</strong> 1–2 L/kg/min (max 60 L/min) — maintains apneic oxygenation during laryngoscopy. Use during intubation attempts to extend safe apnea time to 10+ min in adults; less studied in children but physiologically sound.</li>
<li><strong>BVM + PEEP:</strong> If poor mask seal or desaturation — gentle BVM ventilation with PEEP valve (5 cmH₂O). Minimizes gastric insufflation with proper technique.</li>
<li><strong>Positioning:</strong> Infants — shoulder roll ("sniffing position"). Children &gt;2 yr — head elevated 20–30° ("ramping") reduces pharyngeal collapse.</li>
<li><strong>Target:</strong> SpO₂ ≥94% (ideally ≥98%) before laryngoscopy. Abort attempt at SpO₂ &lt;90%.</li>
</ul>
<div class="bx bb">ℹ️ <strong>Apneic oxygenation:</strong> Nasal cannula 1 L/kg/min (max 15 L/min) placed under the mask during pre-oxygenation, left in place during attempt. Demonstrated safe apnea window of 6–9 minutes in obese adults; recommended in pediatric guidelines.</div>`,
t3:`<p><strong>Difficult Airway Cart — minimum pediatric equipment:</strong></p>
<table class="rt"><thead><tr><th>Item</th><th>Sizes</th></tr></thead><tbody>
<tr><td>Video laryngoscope (Glidescope, C-MAC)</td><td>Pediatric blades (Macs 0–3, Miller 0–2)</td></tr>
<tr><td>Laryngeal Mask Airway (LMA)</td><td>1, 1.5, 2, 2.5, 3 (weight-based)</td></tr>
<tr><td>Laryngeal Mask Airway — Intubating (ILMA / Air-Q)</td><td>2.0, 2.5 if intubation through LMA planned</td></tr>
<tr><td>Fiberoptic bronchoscope / flexible video scope</td><td>Pediatric 2.8–3.5 mm OD</td></tr>
<tr><td>Cricothyrotomy kit</td><td>Needle cric (14G), surgical cric set</td></tr>
<tr><td>Bougie / stylet</td><td>Coude-tip bougie (10–14 Fr)</td></tr>
<tr><td>ETT variety pack</td><td>2.5–7.0 cuffed + uncuffed</td></tr>
<tr><td>Waveform capnography</td><td>Colorimetric + quantitative</td></tr>
<tr><td>Surgical airway plan</td><td>ENT / surgeon notified if anticipated difficulty</td></tr>
</tbody></table>`
},children:[
// ─── Branch 1: Anticipated Difficult Airway ───
{name:"Anticipated\nDifficult Airway",icon:"⚠️",type:"urgent",sub:"DIVA ≥1 · Syndromic · Airway mass · Burns",edge:"Known or\nsuspected",
info:{tabs:["Awake Preparation","Team Activation","Ketamine Awake Technique","Surgical Standby"],
t0:`<p><strong>Anticipated difficult airway — principles:</strong></p>
<ol class="sl">
<li>Activate airway team early — senior anesthesiologist / pediatric ENT surgeon</li>
<li>Plan A (primary), Plan B (backup), Plan C (rescue surgical) before induction</li>
<li>Preserve spontaneous ventilation until airway secured when possible</li>
<li>Avoid paralytics if mask ventilation uncertain — can't paralyze what you can't intubate</li>
<li>Have surgical airway team and kit immediately available</li>
<li>Consider awake intubation under topical anesthesia in older cooperative children</li>
</ol>
<div class="bx br">🚨 <strong>DO NOT give neuromuscular blockade until you confirm you can mask ventilate.</strong> Paralysis + inability to intubate = CICO (Can't Intubate Can't Oxygenate) emergency.</div>`,
t1:`<p><strong>Team activation for anticipated difficult pediatric airway:</strong></p>
<ul>
<li>Attend/senior anesthesiologist or pediatric anesthesia (phone/telemedicine if unavailable)</li>
<li>Pediatric ENT or general surgery — for surgical airway standby</li>
<li>Respiratory therapy — ventilator, CPAP equipment set-up</li>
<li>2nd intubating provider (for attempt #2)</li>
<li>Code team if not already present</li>
<li>Ensure difficult airway cart at bedside and open</li>
<li>Consider transfer to higher-level facility if team not available and time permits</li>
</ul>`,
t2:`<p><strong>Ketamine-assisted awake/semi-awake intubation technique:</strong></p>
<p>Useful when spontaneous ventilation must be preserved (e.g., supraglottic mass, severe craniofacial anomaly).</p>
<ol class="sl">
<li>Ketamine 0.5–1 mg/kg IV slowly (dissociative dose — maintains airway reflexes and spontaneous breathing)</li>
<li>Glycopyrrolate 0.01 mg/kg IV (reduces secretions)</li>
<li>Topical anesthetic spray to oropharynx (Cetacaine, lidocaine 4%)</li>
<li>Nasal or oral airway adjunct if needed</li>
<li>Video laryngoscopy or flexible bronchoscope under direct vision</li>
<li>Confirm tube placement with waveform capnography before paralysis</li>
</ol>
<div class="bx bg">✓ <strong>Ketamine preserves respiratory drive and pharyngeal tone.</strong> Unlike propofol or opioids, it maintains spontaneous breathing at dissociative doses — critical safety margin for the difficult airway.</div>`,
t3:`<p><strong>Surgical airway team on standby — indications:</strong></p>
<ul>
<li>Airway mass that may enlarge rapidly (cystic hygroma, abscess, expanding hematoma)</li>
<li>Severe orofacial trauma making oral/nasal approach impossible</li>
<li>Prior failed attempts + failed rescue LMA</li>
<li>Significant tracheal deviation (mediastinal mass)</li>
<li>Known laryngeal/tracheal stenosis</li>
</ul>
<p>Surgical team should be in the room (not just "available") for highest-risk cases. Brief them on Plan C before induction.</p>`
},children:[
{name:"Awake/Semi-Awake\nVideoLaryngoscopy",icon:"📷",type:"action",sub:"Ketamine 0.5–1 mg/kg · VL preferred · Fiberoptic backup",edge:"Primary\nplan A",
info:{tabs:["VL Technique","LMA as Bridge","Fiberoptic"],
t0:`<p><strong>Video Laryngoscopy — Pediatric Technique:</strong></p>
<ul>
<li>Choose blade: hyperangulated (Glidescope, C-MAC D-blade) for anticipated difficult airway; standard geometry (C-MAC 2–4, Macs 1–3) for normal anatomy</li>
<li>Insert midline, advance to vallecula or epiglottis</li>
<li>Elevate larynx gently — avoid levering on teeth/gums</li>
<li>Stylet is mandatory for hyperangulated blades — hockey-stick bend</li>
<li>Watch the screen, not the mouth. Have assistant retract tongue/cheek if needed.</li>
<li>Once ETT passes through cords, advance 2–3 cm, then remove stylet</li>
<li>Confirm with waveform capnography (gold standard)</li>
</ul>`,
t1:`<p><strong>LMA as Bridge to Intubation or Oxygenation:</strong></p>
<table class="rt"><thead><tr><th>Weight</th><th>LMA Size</th><th>Cuff Vol</th></tr></thead><tbody>
<tr><td>&lt;5 kg</td><td>1</td><td>4 mL</td></tr>
<tr><td>5–10 kg</td><td>1.5</td><td>7 mL</td></tr>
<tr><td>10–20 kg</td><td>2</td><td>10 mL</td></tr>
<tr><td>20–30 kg</td><td>2.5</td><td>14 mL</td></tr>
<tr><td>30–50 kg</td><td>3</td><td>20 mL</td></tr>
<tr><td>&gt;50 kg</td><td>4–5</td><td>30 mL</td></tr>
</tbody></table>
<p>An intubating LMA (Air-Q, ILMA) allows fiberoptic-guided ETT placement through the supraglottic device while maintaining oxygenation.</p>`,
t2:`<p><strong>Flexible Fiberoptic Bronchoscope (FOB) technique:</strong></p>
<ul>
<li>Best for anticipated difficult airway with cooperative patient or under ketamine</li>
<li>Pre-load ETT onto bronchoscope (smallest scope that fits the ETT lumen)</li>
<li>Advance scope transorally or transnasally to vocal cords</li>
<li>Visualize cords, advance past into trachea — confirm carina</li>
<li>Slide ETT over scope into trachea, remove scope</li>
<li>Confirm with waveform capnography</li>
</ul>
<p>If scope not available: video laryngoscopy through LMA (intubating LMA preferred) is an acceptable alternative.</p>`
}}
]},
// ─── Branch 2: Unanticipated Difficult Airway (RSI) ───
{name:"Unanticipated\nDifficult Airway",icon:"🚨",type:"emergency",sub:"Failed direct laryngoscopy · SpO₂ dropping",edge:"RSI →\nfailed attempt",
info:{tabs:["RSI Checklist","Optimize Position","Call for Help"],
t0:`<p><strong>RSI Pre-attempt checklist (before every intubation):</strong></p>
<ol class="sl">
<li>SOAP-ME: Suction (on, yankauer at hand), Oxygen (NRB + NC for apneic oxygenation), Airway (bag, mask sizes), Positioning (sniffing/ramped), Monitoring (SpO₂, ETCO₂, BP)</li>
<li>ETT size calculated (Age/4+4 uncuffed, Age/4+3.5 cuffed); sizes ±0.5 available</li>
<li>Backup: one size smaller + LMA + bougie at bedside</li>
<li>Two IVs or IO confirmed and patent</li>
<li>RSI medications drawn up and labeled</li>
<li>Video laryngoscope available — use for all pediatric RSI if available</li>
</ol>`,
t1:`<p><strong>Optimizing position for each attempt:</strong></p>
<ul>
<li><strong>Infants (&lt;2 yr):</strong> Neutral sniffing position. Shoulder roll under scapulae (not neck). Large occiput naturally elevates head.</li>
<li><strong>Children &gt;2 yr:</strong> Ramped position — blankets under occiput and shoulders until external auditory meatus aligns with sternal notch.</li>
<li><strong>HEENT:</strong> External laryngeal manipulation (ELM) — assistant pushes larynx backward, upward, rightward (BURP or ELM). May improve view by 1–2 Cormack grades.</li>
<li><strong>If obese:</strong> Maximize head elevation. Increase PEEP during preoxygenation.</li>
</ul>`,
t2:`<p><strong>Call for help — escalate immediately after 2nd failed attempt:</strong></p>
<ul>
<li>Second provider to attempt with different device</li>
<li>Anesthesiologist / senior physician</li>
<li>ENT / surgical team for CICO rescue</li>
<li>Telemedicine/phone consultation if subspecialists unavailable</li>
<li>Consider transfer if stable enough (difficult airway management requires team)</li>
</ul>
<div class="bx br">🚨 <strong>3-attempt rule:</strong> If 3 laryngoscopy attempts fail (including video), do NOT attempt a 4th. Move immediately to LMA or surgical rescue. Multiple failed attempts cause progressive airway edema and bleeding that worsens conditions.</div>`
},children:[
{name:"Attempt #1\nVideo Laryngoscopy",icon:"📷",type:"action",sub:"Optimize position · BURP · Bougie",edge:"RSI drugs\ngiven",
info:{tabs:["ETT Sizing","Cormack-Lehane Grade","Confirm Placement"],
t0:`<table class="rt"><thead><tr><th>Age</th><th>Uncuffed ETT</th><th>Cuffed ETT</th><th>Depth (lip)</th></tr></thead><tbody>
<tr><td>Preterm &lt;28w</td><td>2.5</td><td>—</td><td>6–7 cm</td></tr>
<tr><td>Term (0–3 mo)</td><td>3.0–3.5</td><td>3.0</td><td>9–10 cm</td></tr>
<tr><td>1 yr</td><td>3.5–4.0</td><td>3.5</td><td>11 cm</td></tr>
<tr><td>2 yr</td><td>4.5</td><td>4.0</td><td>12–13 cm</td></tr>
<tr><td>4 yr</td><td>5.0</td><td>4.5</td><td>14 cm</td></tr>
<tr><td>6 yr</td><td>5.5</td><td>5.0</td><td>15–16 cm</td></tr>
<tr><td>8 yr</td><td>6.0</td><td>5.5</td><td>17 cm</td></tr>
<tr><td>10 yr</td><td>6.5</td><td>6.0</td><td>18 cm</td></tr>
<tr><td>12 yr</td><td>7.0</td><td>6.5</td><td>19–20 cm</td></tr>
</tbody></table>`,
t1:`<p><strong>Cormack-Lehane Laryngoscopic View Grade:</strong></p>
<table class="rt"><thead><tr><th>Grade</th><th>View</th><th>Strategy</th></tr></thead><tbody>
<tr><td>I</td><td>Full view of cords</td><td>Routine intubation</td></tr>
<tr><td>II</td><td>Posterior cords/arytenoids visible</td><td>Bougie-assisted often helpful</td></tr>
<tr><td>IIb</td><td>Only arytenoids visible</td><td>Bougie mandatory; BURP/ELM</td></tr>
<tr><td>III</td><td>Only epiglottis visible</td><td>Video laryngoscopy + bougie; LMA bridge</td></tr>
<tr><td>IV</td><td>No laryngeal structures</td><td>Surgical airway if CICO</td></tr>
</tbody></table>`,
t2:`<p><strong>ETT placement confirmation — in order of reliability:</strong></p>
<ol class="sl">
<li><strong>Waveform capnography (gold standard):</strong> Persistent CO₂ waveform = tracheal placement. Flat waveform = esophageal.</li>
<li><strong>SpO₂:</strong> Rising/maintained — reassuring. Falling — re-examine.</li>
<li><strong>Direct laryngoscopy:</strong> Confirm ETT passes through cords under visualization.</li>
<li><strong>Bilateral breath sounds:</strong> Auscultate axillae + epigastrium. Absent = esophageal or right-main stem.</li>
<li><strong>Chest rise:</strong> Should be symmetric.</li>
<li><strong>CXR:</strong> ETT tip should be 2 cm above carina (confirm within 30 min).</li>
</ol>
<div class="bx br">🚨 Colorimetric CO₂ detectors unreliable if &lt;15 kg or &lt;5 breaths given. Always use quantitative waveform capnography.</div>`
},children:[
{name:"View Grade I–II\nIntubate",icon:"✅",type:"action",sub:"Advance ETT · Confirm waveform CO₂ · Secure tube",edge:"Good view"},
{name:"View Grade III–IV\nBougie + Reposition",icon:"⚠️",type:"urgent",sub:"Bougie first · BURP · ELM · One more attempt",edge:"Poor view",children:[
{name:"Success\nETT Placed",icon:"✅",type:"action",sub:"Confirm CO₂ · Secure tube · CXR",edge:"ETT through\ncords"},
{name:"Failed Attempt #2\nLMA Rescue",icon:"🚨",type:"emergency",sub:"LMA immediately · Oxygenate · Do not attempt 3rd DL",edge:"Still failed",children:[
{name:"LMA Ventilates\n→ Stable",icon:"🫁",type:"action",sub:"Maintain oxygenation · Defer intubation · Expert help",edge:"SpO₂ rising",
info:{tabs:["Defer Intubation","Intubation Through LMA"],
t0:`<p>If LMA provides adequate oxygenation:</p>
<ul>
<li>Do NOT attempt further laryngoscopy — maintain LMA until help arrives</li>
<li>Consider whether intubation is truly necessary vs maintaining LMA with controlled ventilation</li>
<li>Transfer to higher-level facility if stable with LMA in place</li>
<li>Wake patient if opioids can be reversed and urgency is not life-threatening</li>
</ul>`,
t1:`<p>Intubation through intubating LMA (Air-Q / ILMA):</p>
<ol class="sl"><li>Place intubating LMA (size by weight)</li><li>Ventilate to confirm oxygenation</li><li>Fiberoptic bronchoscope or lighted stylet through LMA → locate cords</li><li>Advance ETT over scope through LMA → into trachea</li><li>Confirm CO₂. Remove LMA leaving ETT in place.</li></ol>`
}},
{name:"CICO — Cannot\nOxygenate",icon:"🆘",type:"emergency",sub:"SpO₂ <80% falling · Surgical airway NOW",edge:"SpO₂ falling",
info:{tabs:["Needle Cricothyrotomy","Surgical Cricothyrotomy","Post-Cric Care"],
t0:`<p><strong>Needle Cricothyrotomy (preferred in &lt;8 years):</strong></p>
<p>The cricotracheal membrane is too small for surgical cric in children &lt;8 years. Use needle technique.</p>
<ol class="sl">
<li>Identify cricothyroid membrane (between thyroid and cricoid cartilage)</li>
<li>14G angiocath perpendicular → angled 45° caudally → advance into trachea (loss of resistance)</li>
<li>Confirm with aspiration of air</li>
<li>Connect to ENFLOW jet ventilation or bag via 3 mL syringe barrel + 7.0 ETT connector</li>
<li>Jet ventilation: 1 breath per 4–5 seconds, short inspiratory time (0.5 sec), watch chest rise</li>
<li>Maximum use: 30–45 minutes (CO₂ accumulates). Transition to surgical airway ASAP.</li>
</ol>
<div class="bx br">🚨 CO₂ rises with needle cric — this is oxygenation only, not ventilation. It buys 20–30 minutes max. Definitive surgical airway or intubation must follow.</div>`,
t1:`<p><strong>Surgical Cricothyrotomy (&gt;8–10 years / &gt;40 kg):</strong></p>
<p>Scalpel-bougie-tube (SBT) technique:</p>
<ol class="sl">
<li>Identify and stabilize larynx with non-dominant hand</li>
<li>Horizontal stab incision through skin AND cricothyroid membrane (one motion)</li>
<li>Dilate with tracheal hook or dilator</li>
<li>Insert bougie into trachea (confirms position)</li>
<li>Railroad cuffed ETT (6.0) over bougie into trachea</li>
<li>Inflate cuff, connect ventilator, confirm CO₂</li>
</ol>`,
t2:`<p><strong>Post-cricothyrotomy management:</strong></p>
<ul>
<li>CXR immediately — confirm tube position</li>
<li>ENT/surgical consultation for definitive tracheostomy (within 24–72h)</li>
<li>Ventilate with lung-protective settings (TV 6 mL/kg, PEEP 5)</li>
<li>Document procedure, tube size, and any complications</li>
<li>Family communication — explain emergency procedure</li>
</ul>`
}
}
]}
]}
]}
]}
]};
