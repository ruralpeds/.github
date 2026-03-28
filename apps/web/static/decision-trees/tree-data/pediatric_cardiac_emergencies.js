// Clinical tree data — Pediatric Cardiac Emergencies Decision Tree
// Source: 
// Auto-extracted from pediatric_cardiac_emergencies_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric Cardiac\nEmergencies",icon:"❤️",type:"assessment",sub:"SVT, myocarditis, Kawasaki, syncope evaluation",edge:"",
info:{tabs:["Approach","ECG Interpretation Basics","When to Get an Echo"],
t0:`<p>Pediatric cardiac emergencies range from rhythm disturbances (SVT, VT) to inflammatory conditions (myocarditis, Kawasaki) to structural crises (decompensated CHD). Key is recognizing cardiac vs non-cardiac causes of symptoms.</p>`,
t1:`<p><strong>Pediatric ECG — key differences from adult:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Neonate/Infant</th><th>Child (1–12 yr)</th><th>Significance</th></tr></thead><tbody>
<tr><td>Heart rate</td><td>100–160</td><td>70–120</td><td>Tachycardia thresholds are age-dependent</td></tr>
<tr><td>Axis</td><td>+90 to +180° (right axis)</td><td>+0 to +90° (normalizes)</td><td>Right axis is NORMAL in neonates (RV dominance)</td></tr>
<tr><td>QRS duration</td><td>&lt;80 ms</td><td>&lt;100 ms</td><td>Narrow QRS; prolonged = bundle branch block or toxicity</td></tr>
<tr><td>QTc</td><td>&lt;460 ms</td><td>&lt;440 ms</td><td>>470 ms concerning for Long QT syndrome</td></tr>
<tr><td>T waves V1</td><td>Upright first 48h, then inverted</td><td>Inverted until adolescence</td><td>Upright T in V1 after 48h in child = RVH until proven otherwise</td></tr>
</tbody></table>`,
t2:`<p><strong>Indications for urgent echocardiogram:</strong></p>
<ul><li>Suspected myocarditis (new heart failure, troponin elevated, arrhythmia)</li>
<li>Kawasaki disease (coronary artery evaluation)</li>
<li>Decompensated/newly diagnosed CHD</li>
<li>Pericardial effusion suspected (muffled heart sounds, JVD, low voltages on ECG)</li>
<li>Cardiomegaly on CXR</li>
<li>Unexplained shock not responding to fluids (cardiogenic shock)</li>
<li>New murmur in a symptomatic child</li></ul>`
},children:[
{name:"SVT\nManagement",icon:"⚡",type:"emergency",sub:"Narrow complex >220 (infant) >180 (child) · Adenosine",edge:"Narrow complex\ntachycardia\nregular",
info:{tabs:["Diagnosis","Treatment Algorithm"],
t0:`<p><strong>SVT:</strong> Most common pathologic tachyarrhythmia in children. HR typically 220–300 in infants, 180–250 in older children. Regular, narrow complex (QRS &lt;0.09 sec). Absent P waves or retrograde P waves.</p>
<p><strong>Distinguish from sinus tachycardia:</strong></p>
<table class="dt"><thead><tr><th>Feature</th><th>SVT</th><th>Sinus Tachycardia</th></tr></thead><tbody>
<tr><td>Rate</td><td>>220 infant, >180 child (fixed)</td><td>Usually &lt;220 infant, &lt;180 child (variable)</td></tr>
<tr><td>P waves</td><td>Absent or abnormal</td><td>Normal, upright in II</td></tr>
<tr><td>Rate variability</td><td>Fixed rate, abrupt onset/offset</td><td>Varies with activity/fever/crying</td></tr>
<tr><td>History</td><td>Often no preceding illness</td><td>Fever, dehydration, pain, anemia</td></tr>
</tbody></table>`,
t1:`<ol class="sl">
<li><strong>Stable patient → vagal maneuvers:</strong> Ice bag to face × 15–20 sec (elicits diving reflex). Older children: bear down/Valsalva. Do NOT use carotid massage or eyeball pressure.</li>
<li><strong>If vagal fails → Adenosine:</strong> 0.1 mg/kg IV rapid push (max 6 mg) → if no conversion, 0.2 mg/kg (max 12 mg). Use MOST PROXIMAL IV. Rapid push followed immediately by 5–10 mL NS flush. Record rhythm strip during administration.</li>
<li><strong>If adenosine fails or no IV → consider:</strong> Synchronized cardioversion 0.5–1 J/kg → 2 J/kg</li>
<li><strong>Unstable (hypotension, poor perfusion, AMS) → immediate synchronized cardioversion:</strong> 0.5–1 J/kg → 2 J/kg. Sedate if time allows (ketamine 1–2 mg/kg IV).</li>
<li><strong>Maintenance therapy (after conversion):</strong> Cardiology consult. Propranolol 1–2 mg/kg/day PO TID (infants). Older children: flecainide, sotalol, or ablation referral.</li>
</ol>
<div class="bx bb">ℹ️ <strong>Adenosine has a 6–10 second half-life.</strong> It MUST be given as a rapid push through the most proximal IV possible, followed immediately by a large NS flush. The "2-syringe technique" with a stopcock is recommended.</div>`
}},
{name:"Myocarditis",icon:"💔",type:"emergency",sub:"Viral · New heart failure · Troponin ↑ · Cardiogenic shock",edge:"New HF +\narrhythmia +\ntroponin ↑",
info:{tabs:["Diagnosis","Management","Prognosis"],
t0:`<p><strong>Myocarditis:</strong> Inflammation of the myocardium, most commonly viral (coxsackievirus B, adenovirus, parvovirus B19, SARS-CoV-2). Can present from subtle to fulminant cardiogenic shock.</p>
<p><strong>Presentation spectrum:</strong></p>
<ul><li>Viral prodrome (fever, URI, GI illness) days to weeks before cardiac symptoms</li>
<li>Heart failure: tachycardia, tachypnea, hepatomegaly, poor feeding (infants), exercise intolerance (older)</li>
<li>Chest pain (older children)</li>
<li>Arrhythmias (VT, heart block, SVT)</li>
<li>Sudden cardiac arrest (rare but devastating first presentation)</li></ul>
<p><strong>Workup:</strong> Troponin (elevated), BNP/NT-proBNP (elevated), CXR (cardiomegaly), ECG (low voltages, ST changes, arrhythmias), Echo (decreased LV function, +/- pericardial effusion), cardiac MRI (gold standard — late gadolinium enhancement).</p>`,
t1:`<ul><li><strong>Supportive:</strong> PICU monitoring. Restrict fluids (NOT fluid resuscitation — this is CARDIOGENIC shock, not distributive). Diuretics (furosemide). Inotropes (milrinone preferred — inotropy + vasodilation; avoid high-dose catecholamines which increase myocardial O₂ demand).</li>
<li><strong>Arrhythmia management:</strong> Amiodarone for VT. Temporary pacing for heart block.</li>
<li><strong>IVIG:</strong> 2 g/kg — modest evidence for benefit; widely used.</li>
<li><strong>Mechanical support:</strong> ECMO for fulminant myocarditis with refractory cardiogenic shock (bridge to recovery or transplant). Pediatric myocarditis has HIGHER ECMO survival than adult (~60–80%).</li>
<li><strong>Heart transplant:</strong> If no recovery of function after weeks of support.</li></ul>
<div class="bx bg">✓ <strong>Fulminant myocarditis (rapid-onset severe HF) paradoxically has BETTER long-term prognosis than acute myocarditis</strong> — if the patient survives the acute phase (with ECMO support if needed), the majority have complete LV recovery. Aggressive early mechanical support is justified.</div>`,
t2:`<ul><li>~60% of pediatric myocarditis patients recover completely</li>
<li>~20% develop chronic dilated cardiomyopathy</li>
<li>~10–15% require transplant</li>
<li>~5–10% mortality (higher in fulminant without ECMO support)</li>
<li>Exercise restriction: minimum 3–6 months after diagnosis, with serial echo and stress testing before return to sports</li></ul>`
}},
{name:"Kawasaki\nDisease",icon:"🌡️",type:"urgent",sub:"5 days fever + 4/5 criteria · IVIG before day 10 · Echo",edge:"Prolonged\nfever +\nmucocutaneous\nfindings",
info:{tabs:["Diagnostic Criteria","Treatment","Coronary Artery Follow-up"],
t0:`<p><strong>Kawasaki Disease diagnostic criteria — fever ≥5 days PLUS ≥4 of 5:</strong></p>
<ol class="sl">
<li><strong>Bilateral bulbar conjunctival injection</strong> (non-exudative, limbal sparing)</li>
<li><strong>Oral mucous membrane changes:</strong> strawberry tongue, red cracked lips, oropharyngeal erythema</li>
<li><strong>Polymorphous rash</strong> (NOT vesicular — maculopapular, erythema multiforme-like, or diffuse erythroderma)</li>
<li><strong>Extremity changes:</strong> Acute: erythema/edema of hands/feet. Subacute: periungual desquamation (peeling around nails at weeks 2–3)</li>
<li><strong>Cervical lymphadenopathy</strong> (≥1.5 cm, usually unilateral, least common criterion)</li>
</ol>
<p><strong>Incomplete Kawasaki:</strong> Fever ≥5 days + 2–3 criteria + elevated inflammatory markers (CRP ≥3.0 mg/dL or ESR ≥40) + supporting labs (albumin &lt;3.0, anemia, elevated ALT, plts >450K after day 7, WBC >15K, urine WBC >10/hpf). Treat the same as complete KD.</p>
<div class="bx br">🚨 <strong>Kawasaki is the #1 cause of acquired heart disease in children in developed countries.</strong> Untreated, 25% develop coronary artery aneurysms. With timely IVIG, this drops to &lt;5%.</div>`,
t1:`<p><strong>Treatment:</strong></p>
<ul><li><strong>IVIG 2 g/kg IV</strong> as a SINGLE infusion over 10–12 hours. Give BEFORE day 10 of illness for maximum benefit (but give even after day 10 if still febrile or with ongoing inflammation).</li>
<li><strong>Aspirin:</strong> High-dose 80–100 mg/kg/day divided QID until afebrile × 48–72h, then low-dose 3–5 mg/kg/day (antiplatelet) for 6–8 weeks (or longer if coronary abnormalities).</li>
<li><strong>Refractory KD (persistent/recurrent fever 36h after IVIG):</strong> Second dose IVIG 2 g/kg, OR IV methylprednisolone 2 mg/kg/day × 3 days, OR infliximab 5 mg/kg IV.</li></ul>`,
t2:`<p><strong>Echocardiogram schedule:</strong></p>
<table class="rt"><thead><tr><th>Timing</th><th>Purpose</th></tr></thead><tbody>
<tr><td>At diagnosis (baseline)</td><td>Coronary artery dimensions, LV function, valvular regurgitation, pericardial effusion</td></tr>
<tr><td>2 weeks after onset</td><td>Coronary artery changes may first appear</td></tr>
<tr><td>6–8 weeks</td><td>Maximum coronary dilation typically occurs by 4–6 weeks; confirms resolution or persistence</td></tr>
<tr><td>Ongoing (if abnormal)</td><td>Serial echo per cardiology based on aneurysm size/z-score; may need CT angiography or catheterization</td></tr>
</tbody></table>
<p><strong>Coronary artery classification (z-scores):</strong></p>
<ul><li>Normal: z-score &lt;2.0</li>
<li>Dilation: z-score 2.0–2.5</li>
<li>Small aneurysm: z-score 2.5–5.0</li>
<li>Medium aneurysm: z-score 5.0–10.0 or absolute 5–8 mm</li>
<li>Giant aneurysm: z-score ≥10.0 or absolute ≥8 mm → highest risk for thrombosis, stenosis, MI. Lifelong anticoagulation.</li></ul>`
}},
{name:"Syncope\nEvaluation",icon:"🫠",type:"decision",sub:"Vasovagal vs cardiac · ECG all patients · Red flags",edge:"LOC episode",
info:{tabs:["Benign vs Concerning","Workup","Red Flags for Cardiac Syncope"],
t0:`<table class="dt"><thead><tr><th>Feature</th><th>Vasovagal (Benign)</th><th>Cardiac (Dangerous)</th></tr></thead><tbody>
<tr><td>Trigger</td><td>Prolonged standing, heat, pain, blood draw, emotional stress</td><td>During exercise, swimming, startling noise (LQTS), none</td></tr>
<tr><td>Prodrome</td><td>Lightheadedness, nausea, tunneling vision, warmth, diaphoresis</td><td>Sudden onset with NO prodrome, or palpitations before LOC</td></tr>
<tr><td>Duration</td><td>Brief (&lt;1 min), rapid recovery</td><td>May be prolonged; may have seizure-like activity (convulsive syncope)</td></tr>
<tr><td>Position</td><td>Upright (standing or sitting)</td><td>Any position including supine or during exertion</td></tr>
<tr><td>Family hx</td><td>Often positive for fainting</td><td>Sudden death &lt;50 yr, LQTS, HCM, Brugada, arrhythmias</td></tr>
</tbody></table>`,
t1:`<ul><li><strong>ALL syncope:</strong> ECG (look for QTc prolongation, WPW, Brugada, HCM, heart block)</li>
<li><strong>If typical vasovagal with normal ECG:</strong> Reassurance, hydration, counter-pressure maneuvers. No further workup needed.</li>
<li><strong>If concerning features:</strong> Echo (HCM, ARVC, coronary anomalies), Holter monitor or event recorder, exercise stress test (exertional syncope), tilt table test (recurrent unexplained syncope)</li>
<li><strong>If family history of sudden death:</strong> ECG + echo + cardiology referral regardless of presentation</li></ul>`,
t2:`<div class="bx br">🚨 <strong>Red flags for cardiac syncope (requires cardiology workup):</strong></div>
<ul><li>Syncope DURING exercise (not after — after exercise is usually vasovagal)</li>
<li>Syncope while swimming or in water</li>
<li>Syncope triggered by sudden loud noise or emotional startle (catecholaminergic polymorphic VT or LQTS)</li>
<li>Syncope in the supine position</li>
<li>Chest pain or palpitations immediately before syncope</li>
<li>Family history of sudden cardiac death &lt;50 years, LQTS, HCM, Brugada, or unexplained drowning</li>
<li>Abnormal ECG (prolonged QTc >470 ms, WPW pattern, Brugada pattern, heart block, significant ventricular ectopy)</li>
<li>Known structural heart disease</li></ul>`
}}
]};
