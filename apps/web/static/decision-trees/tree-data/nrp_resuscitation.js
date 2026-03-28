// Clinical tree data — Neonatal Resuscitation (NRP) Decision Tree
// Source: 
// Auto-extracted from nrp_resuscitation_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal\nResuscitation (NRP)",icon:"👶",type:"assessment",sub:"NRP 8th Edition 2020/2025 · MR SOPA · Golden minute",edge:"",
info:{tabs:["Initial Assessment","The Golden Minute","Key Changes in NRP 8th Ed"],
t0:`<p><strong>NRP Initial Assessment — Three Questions (within 30 seconds):</strong></p>
<ol class="sl">
<li><strong>Term gestation?</strong> (≥35 weeks)</li>
<li><strong>Good muscle tone?</strong></li>
<li><strong>Breathing or crying?</strong></li>
</ol>
<p>If YES to all three → routine care (delayed cord clamping, skin-to-skin, dry and stimulate).</p>
<p>If NO to any → proceed to initial steps: warm, dry, stimulate, position airway, clear secretions if needed, assess breathing and HR.</p>`,
t1:`<p><strong>The Golden Minute:</strong> Within the first 60 seconds of life, the initial steps should be completed and the first HR assessment made. If HR &lt;100 or not breathing effectively → begin PPV.</p>
<p><strong>Initial steps (30 seconds):</strong></p>
<ul><li>Provide warmth (radiant warmer; plastic wrap for &lt;32 wk)</li>
<li>Dry and stimulate (rub back, flick soles)</li>
<li>Position airway (slight neck extension, "sniffing" position)</li>
<li>Suction ONLY if secretions are obstructing airway (routine suctioning NOT recommended)</li>
<li>Assess breathing and HR (pulse ox on right hand pre-ductal; cardiac monitor for HR)</li></ul>`,
t2:`<p><strong>Key NRP 8th Edition (2020) updates:</strong></p>
<ul><li>Cardiac monitor (ECG) recommended for accurate HR assessment during resuscitation (pulse ox can be delayed/inaccurate)</li>
<li>Initial FiO₂: 21% for ≥35 wk; 21–30% for &lt;35 wk (titrate to SpO₂ targets)</li>
<li>Routine suctioning of vigorous meconium-stained infants NOT recommended (changed from prior)</li>
<li>Intubation and tracheal suctioning ONLY if non-vigorous + airway obstruction suspected</li>
<li>Umbilical cord management: DCC ≥30–60 sec for vigorous term and preterm infants</li>
<li>Epinephrine IV (UVC) preferred over ET route</li>
<li>Laryngeal mask (LMA) can be used as alternative airway if intubation unsuccessful for infants ≥34 wk</li></ul>`
},children:[
{name:"PPV Initiation\n& MR SOPA",icon:"🌬️",type:"emergency",sub:"HR <100 or apnea → PPV within 60 sec",edge:"HR <100\nor apnea",
info:{tabs:["PPV Technique","MR SOPA","SpO₂ Targets"],
t0:`<p><strong>When to start PPV:</strong> HR &lt;100 bpm AND/OR apnea/gasping despite initial steps. Start within 60 seconds of birth.</p>
<p><strong>PPV technique:</strong></p>
<ul><li>Rate: 40–60 breaths/min ("squeeze-two-three, squeeze-two-three")</li>
<li>Initial PIP: 20–25 cmH₂O (term); may need 30+ for first breaths to establish FRC</li>
<li>FiO₂: Start 21% for ≥35 wk; 21–30% for &lt;35 wk</li>
<li>Mask: proper size covers nose and mouth, not eyes; achieve good seal</li>
<li>T-piece resuscitator preferred (delivers consistent PEEP + PIP)</li>
<li>Assess chest rise with each breath — adjust technique if no chest rise</li></ul>`,
t1:`<p><strong>MR SOPA — Ventilation Corrective Steps (if chest is NOT rising):</strong></p>
<ol class="sl">
<li><strong>M</strong> — Mask adjustment: reapply, ensure seal, hold jaw forward</li>
<li><strong>R</strong> — Reposition: slight neck extension ("sniffing position"), shoulder roll</li>
<li><strong>S</strong> — Suction mouth then nose (clear secretions if obstructing)</li>
<li><strong>O</strong> — Open mouth: open baby's mouth wider, jaw thrust</li>
<li><strong>P</strong> — Pressure increase: increase PIP by 5–10 cmH₂O (up to 30–40)</li>
<li><strong>A</strong> — Alternative Airway: intubation or LMA (if still no chest rise after above steps)</li>
</ol>
<div class="bx br">🚨 <strong>If PPV is being given and HR is NOT improving → the most common problem is ineffective ventilation.</strong> Go through MR SOPA systematically before moving to chest compressions. Effective ventilation is the single most important intervention in neonatal resuscitation.</div>`,
t2:`<p><strong>Target pre-ductal SpO₂ by minute after birth (NRP 2020):</strong></p>
<table class="rt"><thead><tr><th>Time (minutes)</th><th>Target SpO₂</th></tr></thead><tbody>
<tr><td>1 min</td><td>60–65%</td></tr>
<tr><td>2 min</td><td>65–70%</td></tr>
<tr><td>3 min</td><td>70–75%</td></tr>
<tr><td>4 min</td><td>75–80%</td></tr>
<tr><td>5 min</td><td>80–85%</td></tr>
<tr><td>10 min</td><td>85–95%</td></tr>
</tbody></table>
<p><em>Titrate FiO₂ to these targets. It is NORMAL for SpO₂ to be in the 60s at 1 minute. Do not give 100% O₂ unless HR remains &lt;60 despite effective PPV + compressions.</em></p>`
}},
{name:"Chest\nCompressions",icon:"💓",type:"emergency",sub:"HR <60 despite effective PPV × 30 sec",edge:"HR <60\nafter 30s\neffective PPV",
info:{tabs:["Technique","Coordination with PPV","When to Stop"],
t0:`<p><strong>Indication:</strong> HR &lt;60 bpm despite 30 seconds of EFFECTIVE PPV (confirmed chest rise, corrected MR SOPA issues).</p>
<p><strong>Two-thumb technique (preferred):</strong></p>
<ul><li>Two thumbs on lower third of sternum, just below the intermammary line</li>
<li>Hands encircle the chest, fingers supporting the back</li>
<li>Compress one-third of the AP diameter of the chest</li>
<li>3:1 ratio: 3 compressions to 1 ventilation (90 compressions + 30 breaths per minute = "one-and-two-and-three-and-breathe")</li></ul>
<div class="bx bg">✓ <strong>Two-thumb encircling technique generates higher BP and coronary perfusion pressure</strong> than the two-finger technique. It is the preferred method per NRP 2020.</div>`,
t1:`<p><strong>Coordinated CPR (3:1):</strong></p>
<ul><li>"One-and-two-and-three-and-BREATHE" — 120 events per minute (90 compressions + 30 breaths)</li>
<li>The BREATH should be given during the pause after every 3rd compression</li>
<li>Ensure chest fully recoils between compressions</li>
<li>FiO₂ should be increased to 100% when compressions begin</li>
<li>Reassess HR every 60 seconds (use cardiac monitor for continuous HR)</li></ul>`,
t2:`<p><strong>Stop compressions when:</strong></p>
<ul><li>HR rises above 60 bpm → continue PPV alone</li>
<li>HR rises above 100 bpm → assess for spontaneous breathing; may wean PPV</li>
<li>If HR remains &lt;60 after 60 seconds of coordinated CPR → EPINEPHRINE</li></ul>`
}},
{name:"Epinephrine &\nVolume",icon:"💉",type:"emergency",sub:"HR <60 despite PPV + compressions",edge:"HR still <60\nafter CPR",
info:{tabs:["Epinephrine","IV Access (UVC)","Volume Resuscitation"],
t0:`<p><strong>Epinephrine — NRP Dosing:</strong></p>
<table class="rt"><thead><tr><th>Route</th><th>Dose</th><th>Concentration</th><th>Notes</th></tr></thead><tbody>
<tr><td><strong>IV (UVC preferred)</strong></td><td>0.01–0.03 mg/kg (0.1–0.3 mL/kg)</td><td>1:10,000 (0.1 mg/mL)</td><td>PREFERRED route. Faster onset. Can repeat q3–5 min.</td></tr>
<tr><td><strong>ET (if no IV access)</strong></td><td>0.05–0.1 mg/kg (0.5–1 mL/kg)</td><td>1:10,000 (0.1 mg/mL)</td><td>Higher dose needed. Less reliable absorption. Use while obtaining IV access.</td></tr>
</tbody></table>
<p><strong>Key points:</strong></p>
<ul><li>Concentration is 1:10,000 (NOT 1:1,000 — the higher concentration is for IM in anaphylaxis, NOT for NRP)</li>
<li>Give rapidly via UVC. Follow with NS flush (0.5–1 mL).</li>
<li>Repeat every 3–5 minutes if HR remains &lt;60</li>
<li>Reassess ventilation and compressions effectiveness between doses</li></ul>
<div class="bx br">🚨 <strong>Before giving epinephrine, ensure ventilation is EFFECTIVE.</strong> The most common reason for persistent bradycardia is inadequate ventilation, not the need for medications.</div>`,
t1:`<p><strong>Emergency UVC Placement:</strong></p>
<ol class="sl">
<li>Cut cord 1–2 cm from skin if not already done</li>
<li>Identify the single large thin-walled umbilical VEIN (vs two smaller thick-walled arteries)</li>
<li>Insert 3.5 or 5 Fr single-lumen catheter into vein</li>
<li>Advance just until blood return (2–4 cm — do NOT advance deeply in emergency setting)</li>
<li>Secure with purse-string suture or tape</li>
<li>Administer epinephrine and fluids</li>
</ol>
<p><em>In the delivery room, a "low-lying" UVC (just past the abdominal wall, 2–4 cm) is acceptable for emergency medication administration. Formal positioning for ongoing use requires X-ray confirmation (tip at T8–T10).</em></p>`,
t2:`<p><strong>Volume resuscitation during NRP:</strong></p>
<ul><li><strong>Indication:</strong> Suspected acute blood loss (abruption, cord prolapse, FMH) with signs of shock (pallor, weak pulses, poor perfusion despite effective resuscitation)</li>
<li><strong>Volume:</strong> Normal saline 10 mL/kg IV over 5–10 minutes. May repeat.</li>
<li><strong>Alternative:</strong> O-negative pRBCs 10 mL/kg (if blood loss is the suspected cause and NS is not improving perfusion)</li>
<li><strong>Do NOT give volume routinely</strong> — only for suspected hypovolemia. Routine volume in asphyxiated infants without blood loss may worsen outcomes.</li></ul>`
}},
{name:"Special\nCircumstances",icon:"⚡",type:"decision",sub:"Preterm, meconium, air leak, ethics",edge:"Specific\nscenarios",
info:{tabs:["Preterm Resuscitation","Meconium (NRP 2020)","Periviability Ethics"],
t0:`<p><strong>Preterm-specific resuscitation (< 32 weeks):</strong></p>
<ul><li><strong>Plastic wrap/bag:</strong> Do NOT dry. Place body (below neck) in food-grade plastic bag or wrap immediately to reduce heat loss and TEWL.</li>
<li><strong>Thermal:</strong> Radiant warmer + plastic wrap + hat + warm delivery room (target 23–25°C / 74–77°F)</li>
<li><strong>FiO₂:</strong> Start at 21–30% (NOT 100%). Titrate to SpO₂ targets.</li>
<li><strong>CPAP:</strong> If breathing spontaneously: start CPAP 5–7 cmH₂O (T-piece resuscitator). Avoid routine intubation.</li>
<li><strong>Surfactant:</strong> If intubated for respiratory failure, give early surfactant. LISA if available and infant breathing on CPAP.</li>
<li><strong>Delayed cord clamping:</strong> 30–60 seconds for preterm not requiring immediate resuscitation</li>
<li><strong>Gentle handling:</strong> Minimize stimulation, keep head midline, avoid rapid position changes (IVH prevention)</li></ul>`,
t1:`<p><strong>Meconium-stained amniotic fluid (NRP 2020):</strong></p>
<ul><li><strong>Vigorous infant</strong> (breathing, good tone, HR >100): routine care. Do NOT intubate for suctioning. Suction mouth and nose only if secretions are obstructing the airway.</li>
<li><strong>Non-vigorous infant</strong> (not breathing, poor tone, HR &lt;100): proceed with initial steps (warm, dry, stimulate, position). Begin PPV if not breathing. Intubation and tracheal suctioning ONLY if the airway appears obstructed and PPV is ineffective.</li>
<li><strong>KEY CHANGE from prior NRP:</strong> Routine intubation and tracheal suctioning of meconium is NO LONGER recommended, even for non-vigorous infants, UNLESS the airway is obstructed.</li></ul>
<div class="bx bg">✓ <strong>This is a major departure from older practice.</strong> The emphasis is on establishing effective ventilation quickly, not on suctioning. Evidence showed no benefit from routine tracheal suctioning for meconium.</div>`,
t2:`<p><strong>Periviability (22–25 weeks) — Ethical Framework:</strong></p>
<ul><li><strong>22 weeks:</strong> Resuscitation is generally not recommended per most US centers, but may be offered based on individual circumstances (weight, sex, singleton, antenatal steroids). Comfort care as default; active resuscitation by parental request at select centers.</li>
<li><strong>23 weeks:</strong> Survival ~25–35% with active treatment (wide variation by center). Moderate-severe NDI in ~40–50% of survivors. Shared decision-making with parents is essential.</li>
<li><strong>24 weeks:</strong> Survival ~40–60%. Active resuscitation is standard of care at most centers unless parents choose comfort care after counseling.</li>
<li><strong>25 weeks:</strong> Survival ~60–75%. Resuscitation is standard.</li></ul>
<p><strong>Antenatal counseling should include:</strong> Center-specific survival data, expected morbidities (BPD, IVH, NEC, ROP, NDI), NICU course, long-term outcomes, and the option of comfort care. Use visual aids and decision support tools. Multiple conversations before delivery when possible.</p>
<div class="bx bb">ℹ️ <strong>Antenatal steroids significantly improve outcomes at every GA from 23–34 weeks.</strong> The single most impactful prenatal intervention. Betamethasone 12 mg IM × 2 doses 24h apart (or dexamethasone 6 mg IM × 4 doses 12h apart).</div>`
}}
]};
