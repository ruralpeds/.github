// Clinical tree data — Obstetric Emergencies Decision Tree
// Source: 
// Auto-extracted from obstetric_emergencies_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Obstetric\nEmergencies",icon:"🩸",type:"assessment",sub:"PPH, eclampsia, cord prolapse, uterine rupture",edge:"",
info:{tabs:["Overview","When to Activate","MTP Activation"],
t0:`<p>Obstetric emergencies that a rural hospital nursery/ED team may encounter. Even if OB manages the mother, the nursery team must be ready for the potentially compromised neonate. Understanding maternal conditions informs neonatal resuscitation preparation.</p>
<p><strong>Critical obstetric emergencies:</strong></p>
<ul><li>Postpartum hemorrhage (PPH) — #1 cause of maternal mortality worldwide</li>
<li>Eclampsia — seizures in preeclampsia</li>
<li>Cord prolapse — emergent delivery</li>
<li>Placental abruption — maternal hemorrhage + fetal distress</li>
<li>Uterine rupture — catastrophic hemorrhage</li>
<li>Amniotic fluid embolism — sudden cardiovascular collapse</li></ul>`,
t1:`<p><strong>Activate emergency response when:</strong></p>
<ul><li>EBL >500 mL (vaginal) or >1000 mL (cesarean) — BUT don't wait for a number; treat clinical signs</li>
<li>Maternal HR >110, BP &lt;90/60, altered mental status</li>
<li>Ongoing active bleeding not controlled by initial measures</li>
<li>Eclamptic seizure</li>
<li>Cord prolapse identified</li>
<li>Suspected uterine rupture (sudden pain, loss of fetal HR, cessation of contractions)</li></ul>`,
t2:`<p><strong>Massive Transfusion Protocol (MTP) activation criteria:</strong></p>
<ul><li>Estimated blood loss >1500 mL or ongoing hemorrhage</li>
<li>Hemodynamic instability despite initial resuscitation</li>
<li>Anticipated need for >4 units pRBCs</li>
<li>Typically: pRBC:FFP:platelets in 1:1:1 ratio</li>
<li>Tranexamic acid (TXA) 1g IV within 3 hours of hemorrhage onset (WOMAN trial)</li></ul>`
},children:[
{name:"Postpartum\nHemorrhage",icon:"🔴",type:"emergency",sub:">500 mL vaginal · >1000 mL cesarean · Atony #1",edge:"Excessive\nbleeding\nafter delivery",
info:{tabs:["Causes (4 T's)","Uterine Atony Protocol","Medications","Escalation"],
t0:`<p><strong>The 4 T's of PPH:</strong></p>
<table class="rt"><thead><tr><th>T</th><th>Cause</th><th>% of PPH</th><th>Management</th></tr></thead><tbody>
<tr><td><strong>Tone</strong></td><td>Uterine atony</td><td>~70–80%</td><td>Bimanual massage, uterotonics, tamponade</td></tr>
<tr><td><strong>Trauma</strong></td><td>Laceration, hematoma, uterine rupture, inversion</td><td>~20%</td><td>Repair laceration, surgical exploration</td></tr>
<tr><td><strong>Tissue</strong></td><td>Retained placenta, retained clot</td><td>~10%</td><td>Manual removal, uterine curettage</td></tr>
<tr><td><strong>Thrombin</strong></td><td>Coagulopathy (DIC, dilutional, pre-existing)</td><td>~1%</td><td>Replace factors (FFP, cryo, plts), treat cause</td></tr>
</tbody></table>`,
t1:`<ol class="sl">
<li><strong>Bimanual uterine massage</strong> — vigorous fundal massage. Most effective immediate intervention for atony.</li>
<li><strong>Empty bladder</strong> (Foley catheter) — full bladder prevents uterine contraction</li>
<li><strong>Oxytocin</strong> 10–40 units in 1L LR, run wide open (or 10 units IM if no IV)</li>
<li><strong>Methylergonovine (Methergine)</strong> 0.2 mg IM (contraindicated in hypertension)</li>
<li><strong>Carboprost (Hemabate, 15-methyl PGF2α)</strong> 0.25 mg IM q15min (max 8 doses; contraindicated in asthma)</li>
<li><strong>Misoprostol</strong> 800–1000 µg rectally (available everywhere, no contraindications)</li>
<li><strong>Tranexamic acid (TXA)</strong> 1g IV over 10 min (give within 3 hours; WOMAN trial showed 20% reduction in death from bleeding)</li>
<li><strong>Uterine tamponade</strong> — Bakri balloon or condom catheter filled with 300–500 mL NS</li>
</ol>`,
t2:`<table class="rt"><thead><tr><th>Drug</th><th>Dose/Route</th><th>Mechanism</th><th>Contraindications</th></tr></thead><tbody>
<tr><td>Oxytocin</td><td>10–40 U in 1L IV; or 10 U IM</td><td>Uterotonic</td><td>None absolute; bolus can cause hypotension</td></tr>
<tr><td>Methylergonovine</td><td>0.2 mg IM q2–4h</td><td>Ergot alkaloid → sustained contraction</td><td>Hypertension, preeclampsia</td></tr>
<tr><td>Carboprost (PGF2α)</td><td>0.25 mg IM q15min (max 8)</td><td>Prostaglandin → myometrial contraction</td><td>Asthma (bronchospasm)</td></tr>
<tr><td>Misoprostol</td><td>800–1000 µg PR</td><td>Prostaglandin analog</td><td>None absolute (can use in asthma and HTN)</td></tr>
<tr><td>Tranexamic acid</td><td>1g IV over 10 min</td><td>Antifibrinolytic</td><td>Active thromboembolic disease</td></tr>
</tbody></table>`,
t3:`<p><strong>Escalation if medical management fails:</strong></p>
<ul><li><strong>Uterine tamponade balloon</strong> (Bakri, BT-Cath, or Foley with 60 mL balloon)</li>
<li><strong>Uterine compression sutures</strong> (B-Lynch suture) — surgical</li>
<li><strong>Uterine artery ligation</strong> — surgical</li>
<li><strong>Internal iliac artery ligation</strong> — surgical</li>
<li><strong>Uterine artery embolization</strong> (interventional radiology — if available)</li>
<li><strong>Hysterectomy</strong> — definitive, life-saving, last resort</li></ul>
<div class="bx br">🚨 <strong>In a rural hospital:</strong> Know your capabilities. If uterotonics + tamponade fail and hemorrhage continues → activate MTP, resuscitate aggressively, and transfer EMERGENTLY to a surgical center. Do NOT delay transfer hoping medications will work. Hemorrhage kills fast.</div>`
}},
{name:"Eclampsia",icon:"⚡",type:"emergency",sub:"Seizures in preeclampsia · MgSO₄ first-line",edge:"Seizure in\npregnant or\npostpartum",
info:{tabs:["Definition","MgSO₄ Protocol","Delivery Decision"],
t0:`<p><strong>Eclampsia:</strong> New-onset tonic-clonic seizures in a woman with preeclampsia (HTN + proteinuria or end-organ dysfunction after 20 weeks). Can occur antepartum (53%), intrapartum (19%), or POSTPARTUM (28% — up to 6 weeks after delivery).</p>
<ul><li>Preeclampsia with severe features: BP ≥160/110, thrombocytopenia &lt;100K, Cr >1.1, elevated LFTs (>2× normal), pulmonary edema, visual/cerebral symptoms</li>
<li>HELLP syndrome: Hemolysis + Elevated Liver enzymes + Low Platelets</li></ul>`,
t1:`<p><strong>Magnesium Sulfate Protocol:</strong></p>
<table class="rt"><thead><tr><th>Phase</th><th>Dose</th><th>Route</th><th>Rate</th></tr></thead><tbody>
<tr><td><strong>Loading</strong></td><td>4–6 g</td><td>IV</td><td>Over 15–20 minutes</td></tr>
<tr><td><strong>Maintenance</strong></td><td>1–2 g/hour</td><td>IV continuous</td><td>Continue 24h after last seizure or delivery</td></tr>
<tr><td><strong>Recurrent seizure</strong></td><td>2 g IV bolus</td><td>IV</td><td>Over 5 minutes</td></tr>
</tbody></table>
<p><strong>Monitoring during MgSO₄:</strong></p>
<ul><li>Mg level q4–6h (therapeutic 4–7 mg/dL)</li>
<li>Deep tendon reflexes q1–2h (loss of DTR = first sign of toxicity at ~7–10 mg/dL)</li>
<li>Respiratory rate (respiratory depression at ~10–15 mg/dL)</li>
<li>UOP (≥30 mL/hr — Mg is renally excreted)</li>
<li><strong>Antidote:</strong> Calcium gluconate 1g IV over 3 min for Mg toxicity (respiratory depression, loss of DTR, cardiac arrest at >15 mg/dL)</li></ul>
<div class="bx bo">⚠️ <strong>Neonatal effects of maternal MgSO₄:</strong> Hypotonia, respiratory depression, hyporeflexia, feeding difficulty. The NRP team should be alerted when the mother is on MgSO₄. Have NRP equipment and calcium gluconate available.</div>`,
t2:`<p><strong>Delivery is the DEFINITIVE treatment for preeclampsia/eclampsia.</strong></p>
<ul><li>≥37 weeks: deliver after stabilization</li>
<li>34–37 weeks with severe features: deliver after MgSO₄ + steroids if time allows</li>
<li>&lt;34 weeks: stabilize, steroids for fetal lung maturity if possible, delivery if maternal condition deteriorates</li>
<li>Eclamptic seizure at any GA: stabilize with MgSO₄, then deliver (vaginal or cesarean depending on obstetric factors)</li></ul>`
}},
{name:"Cord Prolapse",icon:"🔴",type:"emergency",sub:"Elevate presenting part · Emergent cesarean",edge:"Cord visible\nor palpable\nin vagina",
info:{tabs:["Recognition","Emergency Management"],
t0:`<p><strong>Umbilical cord prolapse:</strong> The cord descends past the presenting fetal part into the vagina or beyond the cervix. Compression of the cord between the fetus and pelvis causes fetal hypoxia → bradycardia → death if not delivered emergently.</p>
<ul><li>Overt prolapse: cord visible at introitus or in vagina</li>
<li>Occult prolapse: cord alongside presenting part (diagnosed by prolonged variable decelerations on fetal monitor)</li>
<li>Risk factors: malpresentation (transverse, footling breech), polyhydramnios, PROM at high station, multiple gestation, long cord</li></ul>`,
t1:`<ol class="sl">
<li><strong>Call for EMERGENT cesarean delivery</strong> — goal: delivery within minutes</li>
<li><strong>Hand in vagina:</strong> Examiner places hand in vagina and elevates the presenting part OFF the cord continuously. DO NOT let go until delivery.</li>
<li><strong>Trendelenburg or knee-chest position:</strong> Uses gravity to shift fetus away from pelvis/cord</li>
<li><strong>Fill bladder:</strong> Rapid instillation of 500–750 mL NS via Foley catheter elevates the presenting part. Can buy time if immediate cesarean is not possible.</li>
<li><strong>Handle cord minimally:</strong> Do NOT push cord back in. Wrap in warm saline-soaked gauze to prevent vasospasm. Avoid excessive handling.</li>
<li><strong>Tocolysis:</strong> Terbutaline 0.25 mg SQ may reduce contractions and cord compression while preparing for cesarean.</li>
<li><strong>Continuous fetal monitoring:</strong> FHR is the guide. Persistent severe bradycardia = ongoing compression.</li>
<li><strong>NRP team on standby:</strong> Expect a compromised neonate. Full resuscitation preparation.</li>
</ol>
<div class="bx br">🚨 <strong>The hand elevating the presenting part must NOT be removed until the cesarean incision is being made.</strong> This person rides with the patient to the OR. Cord compression for even seconds can cause fetal hypoxia.</div>`
}},
{name:"Placental Abruption\n/ Uterine Rupture",icon:"⚠️",type:"emergency",sub:"Maternal hemorrhage + fetal distress",edge:"Painful vaginal\nbleeding or\nsudden collapse",
info:{tabs:["Abruption","Uterine Rupture","Neonatal Implications"],
t0:`<p><strong>Placental abruption:</strong> Premature separation of the placenta from the uterine wall. Occurs in ~1% of pregnancies. Maternal hemorrhage (may be concealed or revealed) + fetal distress.</p>
<ul><li><strong>Presentation:</strong> Painful vaginal bleeding (classic), rigid/tender uterus ("woody" uterus), fetal distress/demise, DIC</li>
<li><strong>Concealed abruption:</strong> Blood trapped behind placenta — no visible bleeding but uterus is tense and fetus is in distress. This is MORE dangerous because blood loss is underestimated.</li>
<li><strong>Management:</strong> Emergent delivery (vaginal if imminent, cesarean if not). Large-bore IV access ×2. Type and crossmatch 4–6 units. MTP if massive hemorrhage. Treat DIC (FFP, cryo, plts).</li></ul>`,
t1:`<p><strong>Uterine rupture:</strong></p>
<ul><li>Most commonly: prior cesarean scar rupture during TOLAC (trial of labor after cesarean)</li>
<li>Risk: ~0.5–0.7% for one prior low transverse; higher for classical scar</li>
<li><strong>Signs:</strong> Sudden severe abdominal pain, loss of fetal heart tones, cessation of contractions, change in abdominal contour, vaginal bleeding, maternal hemodynamic collapse</li>
<li><strong>Management:</strong> Emergent cesarean delivery + surgical repair or hysterectomy. Massive hemorrhage resuscitation.</li></ul>
<div class="bx br">🚨 <strong>Loss of fetal heart tones + sudden maternal pain during TOLAC = uterine rupture until proven otherwise.</strong> Emergent cesarean within minutes is life-saving for both mother and baby.</div>`,
t2:`<p><strong>Neonatal team preparation:</strong></p>
<ul><li>Both abruption and uterine rupture produce acutely asphyxiated neonates</li>
<li>Full NRP team at delivery with: warm towels, T-piece/bag-mask, intubation equipment, UVC supplies, epinephrine drawn up, O-neg pRBCs available</li>
<li>Expect: severe perinatal depression (low Apgar, acidosis), need for full resuscitation, possible hemorrhagic anemia (transfusion-ready)</li>
<li>HIE protocol should be considered if significant perinatal asphyxia — begin passive cooling if criteria met</li></ul>`
}}
]};
