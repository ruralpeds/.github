// Clinical tree data — Shoulder Dystocia Decision Tree
// Source: 
// Auto-extracted from shoulder_dystocia_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Shoulder Dystocia\nManagement",icon:"🤰",type:"assessment",sub:"HELPERR mnemonic · Turtle sign · Time-critical",edge:"",
info:{tabs:["Recognition","Risk Factors","Documentation"],
t0:`<p><strong>Shoulder dystocia:</strong> Failure of the fetal shoulders to deliver spontaneously after delivery of the head. The anterior shoulder is impacted behind the maternal pubic symphysis. Incidence: 0.2–3% of vaginal deliveries. Unpredictable — 50% occur without identifiable risk factors.</p>
<p><strong>Recognition — "Turtle Sign":</strong> After delivery of the head, the chin retracts tightly against the perineum (head "turtles" back). The face may become plethoric/cyanotic. Gentle downward traction fails to deliver the anterior shoulder.</p>
<div class="bx br">🚨 <strong>TIME IS CRITICAL.</strong> Risk of injury increases significantly after 5 minutes. Head-to-body delivery interval >5 min associated with acidosis; >7 min associated with permanent injury. Call for help IMMEDIATELY.</div>`,
t1:`<p><strong>Risk factors (NOT predictive enough to alter delivery plan in most cases):</strong></p>
<ul><li>Macrosomia (>4000g, especially >4500g)</li>
<li>Maternal diabetes (fetal body disproportionately large relative to head)</li>
<li>Previous shoulder dystocia (recurrence rate 10–25%)</li>
<li>Maternal obesity</li>
<li>Post-term pregnancy</li>
<li>Prolonged second stage of labor</li>
<li>Operative vaginal delivery (vacuum, forceps)</li></ul>
<div class="bx bo">⚠️ <strong>50% of shoulder dystocia cases occur without ANY identifiable risk factors.</strong> Every delivery attendant must know the HELPERR mnemonic. It cannot be predicted or prevented — only managed.</div>`,
t2:`<p><strong>Documentation (after the event):</strong></p>
<ul><li>Time of head delivery and time of body delivery (head-to-body interval)</li>
<li>Which maneuvers were performed and in what order</li>
<li>Estimate of force used for traction</li>
<li>Fetal presentation (which shoulder was anterior)</li>
<li>Personnel present and when they arrived</li>
<li>Cord gases (arterial and venous)</li>
<li>Apgar scores</li>
<li>Neonatal assessment: clavicle (fracture?), brachial plexus function (Erb vs Klumpke), Moro reflex symmetry</li>
<li>Communicate with family about what happened — honest, compassionate, factual</li></ul>`
},children:[
{name:"HELPERR\nMnemonic",icon:"🔴",type:"emergency",sub:"Systematic maneuver sequence",edge:"Shoulder\nimpacted",
info:{tabs:["HELPERR Steps","McRoberts + Suprapubic","Rotational Maneuvers","Last Resort"],
t0:`<p><strong>HELPERR Mnemonic — perform in order:</strong></p>
<ol class="sl">
<li><strong>H</strong> — Help: Call for help (OB, anesthesia, pediatrics/NRP team, extra nursing). Announce "shoulder dystocia" clearly.</li>
<li><strong>E</strong> — Evaluate for Episiotomy: Consider if soft tissue is preventing maneuvers (episiotomy alone does NOT relieve bony dystocia but creates room for internal maneuvers).</li>
<li><strong>L</strong> — Legs: McRoberts maneuver (see next tab). First-line. Resolves ~40–50% alone.</li>
<li><strong>P</strong> — Pressure: Suprapubic pressure (NOT fundal pressure). Combined with McRoberts, resolves ~50–60%.</li>
<li><strong>E</strong> — Enter: Internal rotation maneuvers (Rubin II, Wood's screw). See rotational tab.</li>
<li><strong>R</strong> — Remove posterior arm: Sweep posterior arm across chest and deliver. Often highly effective.</li>
<li><strong>R</strong> — Roll: Gaskin maneuver (roll patient to all-fours position). Uses gravity and changes pelvic dimensions.</li>
</ol>
<div class="bx br">🚨 <strong>NEVER apply fundal pressure.</strong> Fundal pressure pushes the anterior shoulder further into the symphysis, worsening impaction and risking uterine rupture.</div>`,
t1:`<p><strong>McRoberts Maneuver (L in HELPERR):</strong></p>
<ul><li>Sharply flex maternal thighs onto abdomen (knees to chest)</li>
<li>Requires two assistants (one per leg)</li>
<li>Flattens the lumbar lordosis, rotates the pubic symphysis cephalad, and increases the AP diameter of the pelvis by ~1–2 cm</li>
<li>Success rate: ~40–50% as sole maneuver</li>
<li>First maneuver because it is fast, non-invasive, and highly effective</li></ul>
<p><strong>Suprapubic Pressure (P in HELPERR):</strong></p>
<ul><li>Applied by an assistant from the SIDE of the anterior shoulder</li>
<li>Steady downward and lateral pressure on the anterior shoulder to push it under the symphysis</li>
<li>NEVER press on the fundus — only suprapubic</li>
<li>Combined with McRoberts: resolves ~50–60%</li></ul>`,
t2:`<p><strong>Internal Rotation Maneuvers:</strong></p>
<ul><li><strong>Rubin II:</strong> Place hand behind the anterior shoulder and push it toward the fetal chest (adduction). This reduces the bisacromial diameter and rotates the shoulder out from behind the symphysis.</li>
<li><strong>Wood's Screw:</strong> Place hand on the anterior surface of the posterior shoulder and rotate the fetus 180° (like turning a screw). The posterior shoulder becomes anterior and delivers under the symphysis. May combine with Rubin II on the other shoulder for a "double screw" maneuver.</li>
<li><strong>Reverse Wood's Screw:</strong> Rotate in the opposite direction if Wood's fails.</li></ul>
<p><strong>Posterior Arm Delivery (R in HELPERR):</strong></p>
<ul><li>Insert hand along the posterior shoulder, find the posterior arm/elbow</li>
<li>Flex the elbow, sweep the forearm across the fetal chest, and deliver the posterior arm</li>
<li>This shortens the bisacromial diameter by the width of the arm (~3 cm)</li>
<li>Often very effective when rotational maneuvers fail</li>
<li>Risk: humerus fracture (heals well, preferred over brachial plexus injury)</li></ul>`,
t3:`<p><strong>Last Resort Maneuvers (if all above fail):</strong></p>
<ul><li><strong>Gaskin maneuver:</strong> Roll patient to hands-and-knees position. Changes pelvic dimensions and uses gravity. May allow posterior shoulder to deliver first. Not possible with epidural sometimes.</li>
<li><strong>Zavanelli maneuver:</strong> Replace the fetal head into the vagina (reverse restitution and then flexion), followed by emergent cesarean delivery. Associated with significant maternal and fetal morbidity. Absolute last resort.</li>
<li><strong>Intentional clavicle fracture:</strong> Direct pressure on the clavicle to fracture it, reducing bisacromial diameter. Difficult to perform intentionally. Heals rapidly.</li>
<li><strong>Symphysiotomy:</strong> Surgical division of the pubic symphysis. Almost never performed in developed countries. Significant maternal morbidity.</li></ul>
<div class="bx bo">⚠️ <strong>Zavanelli and symphysiotomy are extreme measures with significant morbidity.</strong> In practice, posterior arm delivery and rotational maneuvers resolve the vast majority of shoulder dystocia cases. Zavanelli is reported in fewer than 100 cases in the literature.</div>`
}},
{name:"Neonatal\nAssessment\nAfter SD",icon:"👶",type:"urgent",sub:"Brachial plexus · Clavicle fracture · Cord gases",edge:"After\ndelivery",
info:{tabs:["Immediate Assessment","Brachial Plexus Injury","Clavicle Fracture"],
t0:`<p><strong>Immediate neonatal assessment after shoulder dystocia:</strong></p>
<ol class="sl">
<li><strong>NRP resuscitation as needed</strong> — prolonged delivery may cause asphyxia</li>
<li><strong>Cord gases</strong> (arterial + venous) — document acid-base status</li>
<li><strong>Apgar scores</strong> at 1 and 5 minutes (and 10 if needed)</li>
<li><strong>Bilateral Moro reflex</strong> — asymmetry suggests brachial plexus injury</li>
<li><strong>Spontaneous arm movements</strong> — observe for asymmetry</li>
<li><strong>Palpate clavicles</strong> — crepitus or step-off = fracture</li>
<li><strong>Respiratory status</strong> — phrenic nerve injury (C3-5) can cause diaphragm paralysis</li>
<li><strong>Detailed exam documented within 1 hour of birth</strong></li>
</ol>`,
t1:`<p><strong>Brachial Plexus Injury:</strong></p>
<table class="dt"><thead><tr><th>Type</th><th>Nerve Roots</th><th>Presentation</th><th>Prognosis</th></tr></thead><tbody>
<tr><td><strong>Erb palsy (upper)</strong></td><td>C5–C6 (±C7)</td><td>"Waiter's tip" — arm adducted, internally rotated, elbow extended, forearm pronated, wrist flexed. Absent Moro on affected side.</td><td>~80–90% recover fully by 3–6 months. Poor prognostic sign: no biceps function by 3 months.</td></tr>
<tr><td><strong>Klumpke palsy (lower)</strong></td><td>C8–T1</td><td>Hand/wrist paralysis with claw hand. Forearm supinated. May have Horner syndrome (ptosis, miosis, anhidrosis) if T1 sympathetic fibers involved.</td><td>Less common (~2%). Poorer recovery rate than Erb.</td></tr>
<tr><td><strong>Total plexus palsy</strong></td><td>C5–T1</td><td>Complete flaccid paralysis of entire arm. No Moro, no grasp, no biceps.</td><td>Worst prognosis. May need surgical nerve grafting.</td></tr>
</tbody></table>
<p><strong>Management:</strong> Initial immobilization in adduction/internal rotation for 7–10 days (reduce traction on injured nerves). Physical therapy starting at 2–3 weeks. If no recovery by 3 months: MRI of plexus + neurosurgical consultation (nerve graft consideration at 3–6 months).</p>`,
t2:`<p><strong>Clavicle fracture:</strong></p>
<ul><li>Most common birth injury (~1–2% of all deliveries; higher with shoulder dystocia)</li>
<li>Diagnosis: palpable crepitus or step-off along clavicle; decreased movement of affected arm; asymmetric Moro; CXR confirms</li>
<li>Treatment: conservative. Pin the sleeve to the shirt for comfort. Heals with callus formation in 7–10 days. Excellent prognosis.</li>
<li>A palpable callus at 7–10 days is REASSURING, not concerning</li>
<li>Differentiate from brachial plexus injury: clavicle fracture = pain-limited movement (infant cries when arm moved); BPI = weakness-limited movement (no pain response, flaccid)</li></ul>`
}}
]};
