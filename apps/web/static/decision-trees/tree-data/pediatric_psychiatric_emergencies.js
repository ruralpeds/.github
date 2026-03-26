// Clinical tree data — Pediatric Psychiatric Emergencies Decision Tree
// Source: 
// Auto-extracted from pediatric_psychiatric_emergencies_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric Psychiatric\nEmergencies",icon:"🧠",type:"assessment",sub:"Suicidal ideation screening, acute agitation, safety planning",edge:"",
info:{tabs:["Approach","ASQ Screening","Medical Clearance"],
t0:`<p>Pediatric psychiatric emergencies are increasing dramatically — ED visits for mental health crises have risen >30% since 2019. Key presentations: suicidal ideation/attempt, acute agitation/aggression, psychosis, and acute anxiety/panic. The rural ED must be prepared to assess safety, provide initial stabilization, and arrange appropriate disposition.</p>
<p><strong>Key principle:</strong> Medical causes of psychiatric symptoms must be excluded FIRST (hypoglycemia, intoxication, head injury, infection, thyroid disease, autoimmune encephalitis).</p>`,
t1:`<p><strong>ASQ (Ask Suicide-Screening Questions) — validated for ED use in youth ≥10 years:</strong></p>
<ol class="sl">
<li>"In the past few weeks, have you wished you were dead?"</li>
<li>"In the past few weeks, have you felt that you or your family would be better off if you were dead?"</li>
<li>"In the past week, have you been having thoughts about killing yourself?"</li>
<li>"Have you ever tried to kill yourself?"</li>
</ol>
<p><strong>Scoring:</strong> YES to any question = positive screen → full safety assessment. NO to all = negative screen (but clinical judgment always applies).</p>
<p>If positive on Q1–Q3: "Are you having thoughts of killing yourself right now?" → If YES = acute safety risk → 1:1 observation, remove all means, immediate psychiatric evaluation.</p>
<div class="bx bg">✓ <strong>The ASQ is free, takes &lt;2 minutes, and has 97% sensitivity for identifying youth at risk.</strong> The Joint Commission recommends universal suicide screening in EDs. Available at: www.nimh.nih.gov/ASQ</div>`,
t2:`<p><strong>Medical clearance for psychiatric patients:</strong></p>
<ul><li>Vital signs (including glucose)</li>
<li>Focused history: onset, medications, substances, medical conditions, recent head injury</li>
<li>Physical exam: neurologic (especially mental status), signs of intoxication/withdrawal, signs of self-harm</li>
<li><strong>Routine labs are NOT required for all psychiatric presentations.</strong> AAP and ACEP recommend targeted testing based on clinical findings, NOT reflexive lab panels.</li>
<li>Consider labs when: altered mental status, first psychotic episode, ingestion concern, substance use, new-onset psychiatric symptoms without clear psychosocial precipitant, abnormal vital signs</li>
<li>Urine drug screen: obtain if substance use suspected, but do NOT delay psychiatric evaluation waiting for UDS results</li></ul>`
},children:[
{name:"Suicidal Ideation\n& Attempt",icon:"🔴",type:"emergency",sub:"ASQ → Safety assessment → Means restriction → Disposition",edge:"SI or\nattempt",
info:{tabs:["Safety Assessment","ED Management","Safety Planning"],
t0:`<p><strong>Full safety assessment after positive ASQ:</strong></p>
<ul><li><strong>Ideation:</strong> Passive ("wish I was dead") vs active ("thinking about killing myself"). If active: Is there a plan? Is there access to means? Is there intent to act?</li>
<li><strong>Plan specificity:</strong> Vague ("I'd take pills") vs specific ("I have 50 Tylenol in my backpack and plan to take them tonight"). More specific = higher risk.</li>
<li><strong>Access to means:</strong> Firearms in the home (strongest risk factor for completed suicide in youth), medications, sharps, bridges/heights</li>
<li><strong>Protective factors:</strong> Reasons for living, supportive family, engaged in treatment, future-oriented thinking</li>
<li><strong>Risk factors:</strong> Previous attempt (#1 risk factor), psychiatric diagnosis (depression, bipolar, psychosis), substance use, family conflict, bullying, LGBTQ+ identity (higher risk due to social stressors, not identity itself), recent loss/crisis, access to lethal means</li></ul>`,
t1:`<ol class="sl">
<li><strong>1:1 continuous observation</strong> (sitter) — patient should never be alone</li>
<li><strong>Remove ALL potential means of self-harm</strong> from the room (cords, sharps, medications, personal belongings). Use a ligature-risk assessment of the room.</li>
<li><strong>Patient in hospital gown</strong> (belongings secured). Search belongings for weapons/medications.</li>
<li><strong>Medical evaluation:</strong> Treat any injuries from attempt (overdose → toxicology management, lacerations → wound care). Medical clearance.</li>
<li><strong>Psychiatric consultation</strong> (in-person, telepsychiatry, or crisis line). If unavailable in rural ED: call 988 Suicide & Crisis Lifeline for professional guidance.</li>
<li><strong>Disposition:</strong> Inpatient psychiatric admission for high-risk patients (active plan with intent, recent serious attempt, psychosis, unable to safety plan). Discharge with safety plan for lower-risk patients with strong outpatient support.</li>
</ol>
<div class="bx bb">ℹ️ <strong>988 Suicide & Crisis Lifeline</strong> (call or text 988) provides 24/7 free crisis counseling and can guide rural ED providers on risk assessment and disposition when on-site psychiatry is unavailable.</div>`,
t2:`<p><strong>Stanley-Brown Safety Plan (evidence-based, recommended by VA/DOD and Joint Commission):</strong></p>
<ol class="sl">
<li><strong>Warning signs:</strong> "I know I'm in trouble when I feel/think/do ___"</li>
<li><strong>Internal coping strategies:</strong> Things I can do BY MYSELF to take my mind off problems (exercise, music, journaling, breathing exercises)</li>
<li><strong>People and social settings that provide distraction:</strong> Friends/family I can call or places I can go</li>
<li><strong>People I can ask for help:</strong> Trusted adults, therapist, school counselor (with contact info)</li>
<li><strong>Professionals and agencies:</strong> Therapist phone number, 988 Lifeline, Crisis Text Line (text HOME to 741741), local crisis center</li>
<li><strong>Making the environment safe:</strong> Reduce access to lethal means. <strong>Means restriction counseling with parents is the single most impactful ED intervention.</strong> Secure or remove firearms, lock up medications, remove sharps.</li>
</ol>
<div class="bx br">🚨 <strong>Means restriction counseling:</strong> Directly ask parents about firearms in the home. If yes, recommend temporary off-site storage (friend, relative, gun shop, law enforcement) during the crisis period. Reducing access to firearms reduces suicide deaths — this is the strongest evidence-based ED intervention for suicide prevention.</div>`
}},
{name:"Acute Agitation\n& Aggression",icon:"⚡",type:"urgent",sub:"De-escalation first · Least restrictive · PRN medications",edge:"Aggressive\nor agitated\nbehavior",
info:{tabs:["De-Escalation","Pharmacologic Management","Restraint"],
t0:`<p><strong>Verbal de-escalation (FIRST-LINE for all agitated patients):</strong></p>
<ul><li>Use a calm, low, slow voice. Introduce yourself by name.</li>
<li>Validate emotions: "I can see you're really upset. I want to help."</li>
<li>Offer choices: "Would you like to sit in this chair or that one?" (sense of control)</li>
<li>Set clear, simple limits: "I need you to be safe. I can't let you hurt yourself or others."</li>
<li>Remove audience/stimulation: dim lights, reduce noise, limit people in the room</li>
<li>Offer comfort measures: food, drink, blanket, music, phone call to trusted person</li>
<li>Allow personal space — do not corner, tower over, or touch without permission</li>
<li><strong>Most agitation can be managed with skilled de-escalation alone.</strong></li></ul>`,
t1:`<p><strong>When de-escalation fails and patient is at risk of harm:</strong></p>
<table class="rt"><thead><tr><th>Medication</th><th>Dose</th><th>Route</th><th>Onset</th><th>Notes</th></tr></thead><tbody>
<tr><td><strong>Olanzapine ODT</strong></td><td>2.5–5 mg (child); 5–10 mg (adolescent)</td><td>PO (dissolves on tongue)</td><td>15–30 min</td><td>First-line PO option. Do NOT combine IM olanzapine with IM benzodiazepines (respiratory depression risk).</td></tr>
<tr><td><strong>Diphenhydramine</strong></td><td>1 mg/kg (max 50 mg)</td><td>PO or IM</td><td>15–30 min PO; 10–15 IM</td><td>Safe, sedating. Good for younger children. Anticholinergic effects.</td></tr>
<tr><td><strong>Lorazepam</strong></td><td>0.05 mg/kg (max 2 mg)</td><td>PO, IM, or IV</td><td>5–15 min</td><td>Benzodiazepine. Risk of respiratory depression and paradoxical agitation in some children.</td></tr>
<tr><td><strong>Haloperidol + Lorazepam + Diphenhydramine ("B-52")</strong></td><td>Haldol 0.05 mg/kg + Ativan 0.05 mg/kg + Benadryl 1 mg/kg</td><td>IM</td><td>10–20 min</td><td>For severe agitation unresponsive to other measures. Monitor ECG (QTc with haloperidol). Dystonia risk → diphenhydramine is the antidote.</td></tr>
<tr><td><strong>Ketamine</strong></td><td>1–2 mg/kg IM; 0.5–1 mg/kg IV</td><td>IM or IV</td><td>3–5 min</td><td>For extreme agitation/violence when other agents fail. Dissociative dose. Airway management equipment at bedside.</td></tr>
</tbody></table>
<div class="bx bo">⚠️ <strong>Medication is a SUPPLEMENT to de-escalation, not a replacement.</strong> Always attempt verbal de-escalation first. Offer oral medication before IM. Use the least restrictive effective intervention.</div>`,
t2:`<p><strong>Physical restraint — LAST RESORT only:</strong></p>
<ul><li>Indicated ONLY when: patient is at imminent risk of harm to self or others AND all less restrictive measures have failed</li>
<li>Use trained team (minimum 4–5 staff for safe application)</li>
<li>Physician order required (face-to-face evaluation within 1 hour of initiation per CMS/TJC)</li>
<li>Continuous monitoring: vitals q15 min, circulation checks, neurovascular status of restrained extremities</li>
<li>Time-limited: reassess every 1 hour (children &lt;9 yr) or 2 hours (9–17 yr) for continued need. Remove restraints as soon as safe.</li>
<li>Document: reason for restraint, less restrictive measures attempted, patient's behavior, checks performed, time of removal</li>
<li><strong>Prone restraint is NEVER appropriate</strong> — risk of positional asphyxia</li></ul>`
}}
]};
