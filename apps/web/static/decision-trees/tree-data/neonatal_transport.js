// Clinical tree data — Neonatal Transport Stabilization Decision Tree
// Source: 
// Auto-extracted from neonatal_transport_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal Transport\nStabilization",icon:"🚑",type:"assessment",sub:"STABLE program · Pre-transport checklist · Communication",edge:"",
info:{tabs:["STABLE Mnemonic","Pre-Transport Checklist","Communication"],
t0:`<p><strong>STABLE Program (Pre-Transport / Post-Resuscitation Stabilization):</strong></p>
<ul><li><strong>S</strong> — Sugar & Safe care (maintain glucose >50 mg/dL; D10W infusion)</li>
<li><strong>T</strong> — Temperature (maintain 36.5–37.5°C; plastic wrap for VLBW; heated transport isolette)</li>
<li><strong>A</strong> — Airway (secure airway — intubate if needed; confirm ETT position; set ventilator; SpO₂ monitoring)</li>
<li><strong>B</strong> — Blood pressure (NS bolus 10 mL/kg for hypotension; consider dopamine if persistent; treat acidosis)</li>
<li><strong>L</strong> — Lab work (blood gas, glucose, CBC, blood type, lactate; send with the baby)</li>
<li><strong>E</strong> — Emotional support (communicate with parents; allow them to see/touch baby before transport; contact info exchange)</li></ul>`,
t1:`<ol class="sl">
<li><strong>Airway secured:</strong> ETT confirmed with CO₂ detector + CXR. Backup ETT taped to isolette. Bag-valve ready.</li>
<li><strong>Vascular access:</strong> ×2 (PIV, UVC, or IO). All infusions secured and labeled.</li>
<li><strong>Monitoring:</strong> Continuous SpO₂, HR, temp probe. BP cuff on arm.</li>
<li><strong>Medications prepared:</strong> Epinephrine drawn up (0.1 mL/kg of 1:10,000). Surfactant if indicated. PGE1 running if ductal-dependent.</li>
<li><strong>Labs sent and copies with baby:</strong> Blood gas, glucose, CBC, T&S, any pending results.</li>
<li><strong>OG/NG tube:</strong> Placed and on suction for surgical conditions.</li>
<li><strong>Thermal:</strong> Pre-warmed transport isolette. Hat. Plastic wrap for &lt;32 wk.</li>
<li><strong>Documentation packet:</strong> Maternal history, delivery details, Apgar scores, resuscitation performed, meds given, all labs, consent for transport, insurance info.</li>
<li><strong>Receiving center called:</strong> SBAR handoff, ETA communicated, accepting attending and bed confirmed.</li>
<li><strong>Family:</strong> Parents see baby, photos taken, receiving hospital contact info provided.</li>
</ol>`,
t2:`<p><strong>SBAR Communication to Receiving Center:</strong></p>
<ul><li><strong>S</strong>ituation: "I'm calling about a [GA] week infant born at [time] with [primary problem]."</li>
<li><strong>B</strong>ackground: Maternal history, prenatal care, delivery type, complications, resuscitation performed.</li>
<li><strong>A</strong>ssessment: Current vitals, respiratory support, access, labs, current condition.</li>
<li><strong>R</strong>ecommendation: "We need [level of care]. Transport team ETA is [time]. Anything additional you'd like us to do before transport?"</li></ul>
<div class="bx bb">ℹ️ <strong>Call the receiving center EARLY — before you've finished stabilization.</strong> They can provide real-time guidance, prepare resources, and activate the transport team while you stabilize.</div>`
},children:[
{name:"Condition-Specific\nTransport Prep",icon:"📋",type:"action",sub:"Condition-specific pre-transport checklists",edge:"By diagnosis",
info:{tabs:["Surgical Conditions","Respiratory","Cardiac","Neuro"],
t0:`<table class="dt"><thead><tr><th>Condition</th><th>Critical Pre-Transport Actions</th></tr></thead><tbody>
<tr><td><strong>CDH</strong></td><td>Intubate (NO bag-mask). OG to suction. Gentle vent (PIP &lt;25). Pre-ductal SpO₂ monitoring.</td></tr>
<tr><td><strong>Gastroschisis</strong></td><td>Bowel bag. Right lateral position. OG to suction. 2–3× maintenance IV fluids. Temperature control.</td></tr>
<tr><td><strong>EA/TEF</strong></td><td>Replogle tube to continuous suction (CRITICAL). Head-up 30°. Avoid PPV if possible.</td></tr>
<tr><td><strong>Omphalocele (intact)</strong></td><td>Saline-moistened gauze + plastic wrap over sac. OG. Standard fluids (less loss than gastroschisis).</td></tr>
<tr><td><strong>Volvulus</strong></td><td>OG to suction. IV fluids + NS boluses. NPO. Call surgery at receiving hospital BEFORE departure.</td></tr>
<tr><td><strong>NEC perforation</strong></td><td>OG to suction. Broad-spectrum Abx (vanc + meropenem + metronidazole). Volume resuscitation. Left lateral decubitus XR for free air.</td></tr>
</tbody></table>`,
t1:`<table class="dt"><thead><tr><th>Condition</th><th>Key Actions</th></tr></thead><tbody>
<tr><td><strong>Severe RDS</strong></td><td>Surfactant before transport if intubated and available. CPAP if spontaneously breathing. SpO₂ 90–95% (preterm).</td></tr>
<tr><td><strong>MAS + PPHN</strong></td><td>Gentle ventilation. Avoid agitation (sedation PRN). If iNO available on transport, start at 20 ppm. Pre/post-ductal SpO₂.</td></tr>
<tr><td><strong>Pneumothorax</strong></td><td>Needle decompression if tension. Chest tube if ongoing air leak. Confirm re-expansion on CXR before departure.</td></tr>
</tbody></table>`,
t2:`<table class="dt"><thead><tr><th>Condition</th><th>Key Actions</th></tr></thead><tbody>
<tr><td><strong>Ductal-dependent CHD</strong></td><td>PGE1 running (0.05–0.1 µg/kg/min). Intubation equipment ready (apnea risk). Consider elective intubation. Avoid high FiO₂.</td></tr>
<tr><td><strong>SVT</strong></td><td>Adenosine drawn up. Cardioversion capability (defibrillator with pads). Continuous ECG monitoring.</td></tr>
<tr><td><strong>TGA</strong></td><td>PGE1 + may need urgent balloon atrial septostomy at receiving center (communicate this need).</td></tr>
</tbody></table>`,
t3:`<table class="dt"><thead><tr><th>Condition</th><th>Key Actions</th></tr></thead><tbody>
<tr><td><strong>HIE (for TH)</strong></td><td>Passive cooling (turn off warmer, remove hat). Continuous rectal/esophageal temp monitoring. Target 33–34°C. Avoid overcooling &lt;32°C. aEEG if available.</td></tr>
<tr><td><strong>Seizures</strong></td><td>Phenobarbital loaded. Glucose checked and corrected. Midazolam drawn up for rescue.</td></tr>
<tr><td><strong>Meningitis</strong></td><td>Antibiotics already running (meningitis dosing). LP can be done at receiving center if not yet performed.</td></tr>
</tbody></table>`
}},
{name:"Equipment\nChecklist",icon:"🧰",type:"action",sub:"Transport isolette contents · Medication kit",edge:"Before\ndeparture",
info:{tabs:["Equipment","Medication Kit"],
t0:`<p><strong>Transport Isolette Equipment Checklist:</strong></p>
<ul><li>☐ Pre-warmed isolette with battery backup</li>
<li>☐ Cardiorespiratory monitor + SpO₂ (pre and post-ductal capable)</li>
<li>☐ Transport ventilator (or T-piece resuscitator with PEEP valve)</li>
<li>☐ Oxygen tank (full, with flow meter)</li>
<li>☐ Air tank (for blended FiO₂) or oxygen blender</li>
<li>☐ Suction device (battery or mechanical)</li>
<li>☐ Self-inflating bag + masks (preterm and term sizes)</li>
<li>☐ Laryngoscope (Miller 0 and 1 blades) + spare batteries</li>
<li>☐ ETT (sizes 2.5, 3.0, 3.5) + stylets + CO₂ detector</li>
<li>☐ LMA (size 1) as backup airway</li>
<li>☐ IV pump(s) with tubing and spare batteries</li>
<li>☐ UVC/UAC supplies</li>
<li>☐ Chest tube kit (8 Fr) + needle decompression supplies</li>
<li>☐ Blood gas syringe</li>
<li>☐ Glucometer + lancets</li>
<li>☐ Surfactant (refrigerated)</li>
<li>☐ Plastic wrap / polyethylene bags (for &lt;32 wk)</li></ul>`,
t1:`<p><strong>Transport Medication Kit:</strong></p>
<table class="rt"><thead><tr><th>Medication</th><th>Concentration</th><th>Why</th></tr></thead><tbody>
<tr><td>Epinephrine</td><td>1:10,000 (0.1 mg/mL)</td><td>NRP / cardiac arrest</td></tr>
<tr><td>Normal saline</td><td>0.9% NS, 50–100 mL bags</td><td>Volume resuscitation</td></tr>
<tr><td>D10W</td><td>250 mL bag</td><td>Glucose management</td></tr>
<tr><td>Prostaglandin E1</td><td>500 µg/mL (diluted per protocol)</td><td>Ductal-dependent CHD</td></tr>
<tr><td>Phenobarbital</td><td>65 or 130 mg/mL</td><td>Seizures</td></tr>
<tr><td>Morphine</td><td>1 mg/mL</td><td>Analgesia/sedation</td></tr>
<tr><td>Midazolam</td><td>1 mg/mL</td><td>Seizures (rescue), sedation</td></tr>
<tr><td>Surfactant</td><td>Poractant alfa (Curosurf) or similar</td><td>RDS</td></tr>
<tr><td>Adenosine</td><td>3 mg/mL</td><td>SVT</td></tr>
<tr><td>Atropine</td><td>0.1 mg/mL</td><td>Bradycardia, premedication</td></tr>
<tr><td>Vitamin K</td><td>1 mg/0.5 mL</td><td>If not given at birth</td></tr>
<tr><td>Ampicillin / Gentamicin</td><td>Reconstituted per weight</td><td>Suspected sepsis</td></tr>
</tbody></table>`
}}
]};
