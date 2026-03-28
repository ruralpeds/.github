// Clinical tree data — Neonatal Seizures Decision Tree
// Sources: AAP/AES Neonatal Seizures Clinical Report (Pediatrics 2023),
//          ILAE Neonatal Seizures Classification 2021,
//          Glass et al. Lancet Neurology review,
//          Shellhaas et al. Neonatal Seizure Recognition & Management
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal\nSeizures",icon:"🧠",type:"assessment",sub:"Recognition · Etiology · AEDs · Monitoring · Prognosis",edge:"",
info:{tabs:["Seizure Classification","Recognition vs Jitteriness","Etiology Overview","EEG Monitoring"],
t0:`<p><strong>ILAE 2021 Neonatal Seizure Classification:</strong></p>
<table class="rt"><thead><tr><th>Type</th><th>Features</th><th>EEG Correlation</th></tr></thead><tbody>
<tr><td>Focal clonic</td><td>Rhythmic jerking of one body part; face, arm, or leg; may migrate</td><td>Usually EEG-correlated</td></tr>
<tr><td>Focal tonic</td><td>Sustained posturing of one limb; eye deviation</td><td>Variable EEG correlation</td></tr>
<tr><td>Epileptic spasms</td><td>Sudden flexion/extension jerk, often in clusters; may look like Moro</td><td>EEG: may show ictal pattern or hypsarrhythmia</td></tr>
<tr><td>Myoclonic</td><td>Single or brief repetitive jerks; focal or generalized</td><td>Variable</td></tr>
<tr><td>Automatisms</td><td>Oral movements, pedaling, swimming, eye blinking without clonic activity</td><td>Often EEG-correlated</td></tr>
<tr><td>Subclinical</td><td>No visible motor manifestation; EEG only</td><td>EEG-only — only detectable with monitoring</td></tr>
</tbody></table>
<div class="bx bb">ℹ️ <strong>Electroclinical dissociation</strong> after treatment: Antiseizure medications may suppress clinical manifestations (motor activity) while EEG seizures continue. EEG monitoring is essential to assess treatment response.</div>`,
t1:`<p><strong>Seizure vs Jitteriness — differential table:</strong></p>
<table class="rt"><thead><tr><th>Feature</th><th>Seizure</th><th>Jitteriness</th></tr></thead><tbody>
<tr><td>Eye movement</td><td>Tonic deviation or clonic blinking</td><td>Eyes normal, no deviation</td></tr>
<tr><td>Response to stimulus</td><td>Not suppressible</td><td>Stimulation may provoke; holding stops it</td></tr>
<tr><td>Movement quality</td><td>Clonic or tonic, not oscillatory</td><td>Oscillatory, equal movement each direction</td></tr>
<tr><td>Autonomic changes</td><td>HR/BP changes, apnea, color changes</td><td>Usually none</td></tr>
<tr><td>Suppression by restraint</td><td>Not suppressed</td><td>Stops when extremity is held</td></tr>
<tr><td>Associated with what</td><td>May occur at rest or with stimulation</td><td>Often stimulus-provoked; hypoglycemia, drug withdrawal, hypocalcemia</td></tr>
</tbody></table>`,
t2:`<p><strong>Common etiologies of neonatal seizures (by frequency):</strong></p>
<table class="rt"><thead><tr><th>Etiology</th><th>Frequency</th><th>Key Clue</th></tr></thead><tbody>
<tr><td>Hypoxic-Ischemic Encephalopathy (HIE)</td><td>40–50%</td><td>Depressed at birth, perinatal asphyxia history</td></tr>
<tr><td>Ischemic stroke / Cerebral sinovenous thrombosis</td><td>10–15%</td><td>Focal clonic seizures; MRI diagnostic</td></tr>
<tr><td>Intracranial hemorrhage (IVH, SDH, SAH)</td><td>10–15%</td><td>Traumatic delivery, coagulopathy; neuroimaging</td></tr>
<tr><td>Metabolic (hypoglycemia, hypocalcemia, hypomagnesemia)</td><td>5–10%</td><td>Point-of-care glucose/electrolytes immediately</td></tr>
<tr><td>Bacterial meningitis / encephalitis</td><td>5–10%</td><td>Fever, WBC abnormalities; CSF essential</td></tr>
<tr><td>Genetic / Structural brain malformation</td><td>5%</td><td>MRI + genetics panel</td></tr>
<tr><td>Pyridoxine-dependent epilepsy</td><td>&lt;1%</td><td>Refractory seizures; trial of pyridoxine</td></tr>
</tbody></table>`,
t3:`<p><strong>Continuous EEG (cEEG) monitoring:</strong></p>
<p>Standard of care for neonates with known or suspected seizures.</p>
<ul>
<li>Amplitude-integrated EEG (aEEG): single or dual channel, bedside, continuous — useful for trend monitoring but misses focal seizures in 30–50% of cases</li>
<li>Full multichannel EEG: 8–16 electrodes — highest sensitivity/specificity; required for electroclinical dissociation detection</li>
<li>Duration: minimum 24h after last clinical seizure; extend if subclinical seizures suspected or background abnormal</li>
<li>Electrographic seizure burden: high burden (&gt;30 min/hr) associated with worse outcome — goal is seizure burden reduction, not just clinical suppression</li>
</ul>
<div class="bx bb">ℹ️ <strong>30–55% of neonatal electrographic seizures are subclinical</strong> — detectable only on EEG. Without monitoring, these go untreated. Remote EEG interpretation via telemedicine is available at many centers.</div>`
},children:[
// ─── BRANCH 1: Immediate management ───
{name:"Immediate\nManagement",icon:"🚨",type:"emergency",sub:"Stabilize ABCs · POC glucose · IV access · First-line AED",edge:"Seizure\nobserved",
info:{tabs:["Stabilization Steps","Metabolic Correction First","AED Overview"],
t0:`<p><strong>Immediate actions for neonatal seizure (first 5 minutes):</strong></p>
<ol class="sl">
<li>Airway: position, suction, 100% O₂ if SpO₂ &lt;94%</li>
<li>Breathing: assess RR, work of breathing, BVM if apneic</li>
<li>Circulation: HR, BP, capillary refill, IV/IO access</li>
<li>Point-of-care glucose IMMEDIATELY — treat if &lt;40 mg/dL</li>
<li>Continuous SpO₂, HR, BP, temperature monitoring</li>
<li>Get EEG monitoring ordered/placed</li>
<li>Blood work: glucose, Ca, Mg, Na, BMP, CBC, blood culture, blood gas, LFTs</li>
<li>History: perinatal course, Apgars, maternal GBS/fever/ROM, medications, family history</li>
</ol>`,
t1:`<p><strong>Correct metabolic causes BEFORE antiseizure medications:</strong></p>
<table class="rt"><thead><tr><th>Metabolic Cause</th><th>Threshold</th><th>Treatment</th></tr></thead><tbody>
<tr><td>Hypoglycemia</td><td>&lt;40 mg/dL (DOL0–2); &lt;45 mg/dL (after)</td><td>D10W 2 mL/kg IV bolus → D10W infusion at GIR 6–8 mg/kg/min</td></tr>
<tr><td>Hypocalcemia</td><td>Total Ca &lt;7.0 mg/dL or iCa &lt;1.0 mmol/L</td><td>Calcium gluconate 100–200 mg/kg IV slow push (over 5–10 min, monitor HR); continuous infusion 200–800 mg/kg/day</td></tr>
<tr><td>Hypomagnesemia</td><td>Mg &lt;1.5 mg/dL</td><td>Magnesium sulfate 25–50 mg/kg IV over 15–20 min; repeat q6–12h PRN; often coexists with hypocalcemia</td></tr>
<tr><td>Hyponatremia</td><td>Na &lt;125 mEq/L with symptoms</td><td>3% NaCl 2–4 mL/kg IV over 30 min (raise Na by 4–6 mEq/L); target correction rate ≤12 mEq/L/day</td></tr>
</tbody></table>`,
t2:`<p><strong>Antiseizure drug overview for neonatal seizures:</strong></p>
<table class="rt"><thead><tr><th>Drug</th><th>Mechanism</th><th>Response Rate</th><th>Notes</th></tr></thead><tbody>
<tr><td>Phenobarbital</td><td>GABA-A enhancement</td><td>~40–50%</td><td>First-line. IV preferred. Long half-life (80–100h in neonates).</td></tr>
<tr><td>Levetiracetam</td><td>SV2A modulation</td><td>~35–50%</td><td>Second-line (NEOLEV2 trial). Well-tolerated. Renal dosing if AKI.</td></tr>
<tr><td>Fosphenytoin / Phenytoin</td><td>Na-channel blockade</td><td>~30–40%</td><td>Third-line. Cardiac monitoring required. Avoid in premature.</td></tr>
<tr><td>Midazolam infusion</td><td>GABA-A / benzodiazepine</td><td>~75% rescue</td><td>Refractory status. Respiratory depression — intubation likely needed.</td></tr>
<tr><td>Pyridoxine</td><td>GABA synthesis cofactor</td><td>Diagnostic/curative if deficiency</td><td>Give if refractory to 3 AEDs. 50–100 mg IV during EEG recording.</td></tr>
</tbody></table>`
},children:[
{name:"Treat Metabolic\nCause If Found",icon:"💉",type:"action",sub:"D10W bolus · Calcium gluconate · Mag sulfate",edge:"Metabolic\ncause found",children:[
{name:"Seizures Resolve\nWith Correction",icon:"✅",type:"action",sub:"Continue correction · Monitor glucose · EEG confirmation",edge:"Seizures stop"}
]},
{name:"No Metabolic\nCause → Phenobarbital",icon:"💊",type:"urgent",sub:"Phenobarbital 20 mg/kg IV over 15–30 min",edge:"Metabolic labs\nnormal/corrected",
info:{tabs:["Phenobarbital Dosing","Loading Protocol","Monitoring"],
t0:`<p><strong>Phenobarbital loading dose and monitoring:</strong></p>
<table class="rt"><thead><tr><th>Dose</th><th>Notes</th></tr></thead><tbody>
<tr><td>Initial load: 20 mg/kg IV</td><td>Infuse over 15–30 min. Rate ≤1–2 mg/kg/min.</td></tr>
<tr><td>Repeat load: 10–20 mg/kg IV</td><td>If seizures persist after 15–30 min. Max total: 40 mg/kg.</td></tr>
<tr><td>Maintenance: 3–5 mg/kg/day</td><td>Start 12–24h after loading. Once or twice daily dosing.</td></tr>
<tr><td>Target level: 20–40 mcg/mL</td><td>Check trough at 24–48h. Levels not reliably predictive of efficacy.</td></tr>
</tbody></table>`,
t1:`<p><strong>Administration protocol:</strong></p>
<ol class="sl">
<li>Confirm IV/IO access patent — extravasation causes tissue necrosis</li>
<li>Draw up 20 mg/kg, dilute in NS to &lt;10 mg/mL concentration</li>
<li>Infuse over 15–30 minutes — not as a bolus</li>
<li>Monitor SpO₂, HR, and BP continuously during infusion</li>
<li>Have BVM ready — apnea risk especially with previous benzodiazepine</li>
<li>Assess for seizure cessation clinically + on EEG 15 minutes after dose</li>
</ol>`,
t2:`<p><strong>Monitoring during phenobarbital administration:</strong></p>
<ul>
<li>Continuous pulse oximetry — hypoxemia common</li>
<li>BP q5 min — hypotension possible especially with concurrent benzos or opioids</li>
<li>RR q5 min — apnea risk 5–10%; have BVM and resuscitation drugs at bedside</li>
<li>Assess neurologic state at 15 and 30 minutes post-dose</li>
<li>EEG: check ictal burden at 30 minutes to assess response</li>
</ul>`
},children:[
{name:"Seizures Persist\n→ Levetiracetam",icon:"💊",type:"urgent",sub:"Levetiracetam 40–60 mg/kg IV over 15–30 min",edge:"Seizures persist\nafter PB",
info:{tabs:["LEV Dosing","NEOLEV2 Evidence"],
t0:`<p><strong>Levetiracetam (LEV) for neonatal seizures:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>
<tr><td>Loading dose</td><td>40–60 mg/kg IV over 15–30 min</td></tr>
<tr><td>Maintenance</td><td>30–45 mg/kg/day divided q8–12h IV or PO</td></tr>
<tr><td>Renal adjustment</td><td>Reduce dose 25–50% if GFR &lt;30 or oliguria</td></tr>
<tr><td>Key advantage</td><td>No cardiac toxicity, no respiratory depression, minimal sedation</td></tr>
</tbody></table>`,
t1:`<p><strong>NEOLEV2 Randomized Controlled Trial (Glass et al., JAMA 2019):</strong></p>
<ul>
<li>Compared LEV 40 mg/kg to phenobarbital 20 mg/kg as first-line for neonatal seizures</li>
<li>Response to first drug: Phenobarbital 80% vs LEV 28% (p&lt;0.001)</li>
<li>Phenobarbital remains more efficacious as first-line</li>
<li>LEV used as second-line when PB fails: response rate ~35–50%</li>
<li>LEV has better safety profile: less respiratory depression, less sedation</li>
</ul>
<div class="bx bb">ℹ️ <strong>Many centers now use PB+LEV sequentially.</strong> Loading both drugs gives ~60–70% cumulative efficacy for EEG seizure control vs ~40–50% for PB alone.</div>`
},children:[
{name:"Seizures Persist\n→ Third-Line",icon:"🚨",type:"emergency",sub:"Fosphenytoin OR Midazolam infusion · Pyridoxine trial",edge:"Refractory",
info:{tabs:["Fosphenytoin","Midazolam Infusion","Pyridoxine Trial"],
t0:`<p><strong>Fosphenytoin (third-line):</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Dose / Notes</th></tr></thead><tbody>
<tr><td>Load</td><td>15–20 mg PE/kg IV over 15–20 min (max 1–3 mg PE/kg/min)</td></tr>
<tr><td>Maintenance</td><td>4–8 mg PE/kg/day divided q8–12h</td></tr>
<tr><td>Monitoring</td><td>Continuous cardiac monitor — arrhythmia risk. Check BP q5 min during infusion.</td></tr>
<tr><td>Caution</td><td>Avoid in preterm &lt;34 wk. Cardiac toxicity if infused too fast.</td></tr>
</tbody></table>`,
t1:`<p><strong>Midazolam continuous infusion (refractory status epilepticus):</strong></p>
<ul>
<li>Load: 0.1–0.2 mg/kg IV over 2–5 min</li>
<li>Infusion: 0.05–0.4 mg/kg/hr — titrate to EEG seizure cessation</li>
<li>Requires intubation in most cases — significant respiratory depression</li>
<li>Short-term use only — tachyphylaxis develops; wean over 24–48h</li>
<li>PICU or equivalent level monitoring required</li>
</ul>`,
t2:`<p><strong>Pyridoxine (vitamin B6) empiric trial:</strong></p>
<p>For any infant with refractory neonatal seizures unresponsive to 3 AEDs, perform pyridoxine trial:</p>
<ul>
<li><strong>Dose:</strong> 50–100 mg IV pyridoxine during EEG recording</li>
<li><strong>Response:</strong> EEG seizure cessation within 30 minutes = diagnostic of pyridoxine-dependent epilepsy (ALDH7A1 mutation)</li>
<li><strong>Treat with:</strong> Pyridoxine 15–30 mg/kg/day PO lifelong if responsive</li>
<li><strong>Also consider:</strong> Pyridoxal-5-phosphate (PLP) 50 mg/kg/day in 3 divided doses for pyridoxamine phosphate oxidase deficiency (PLP-responsive epilepsy)</li>
</ul>
<div class="bx bb">ℹ️ Pyridoxine-dependent epilepsy is rare (&lt;1/100,000 births) but treatable and fatal without treatment. A brief trial carries minimal risk and identifies a curable cause.</div>`
}
}
]}
]}
]},
// ─── BRANCH 2: Workup after stabilization ───
{name:"Etiologic\nWorkup",icon:"🔬",type:"decision",sub:"Neuroimaging · Genetics · LP · Metabolic panel",edge:"After acute\nseizure control",
info:{tabs:["Neuroimaging","Genetic Workup","LP / CSF","Monitoring Duration"],
t0:`<p><strong>Neuroimaging for neonatal seizures:</strong></p>
<ul>
<li><strong>Cranial ultrasound:</strong> Rapid bedside tool. Best for IVH, periventricular leukomalacia, large cerebral lesions. Misses cortical lesions, ischemic stroke.</li>
<li><strong>MRI brain (preferred):</strong> Gold standard. Best performed at DOL 3–5 for HIE (allows T2/DWI changes to evolve). MRI with spectroscopy for metabolic disease.</li>
<li><strong>MRI timing for stroke:</strong> Within 24–72h for acute ischemic stroke (DWI shows early change)</li>
<li><strong>CT head:</strong> Reserved for acute trauma evaluation (faster than MRI in emergency)</li>
</ul>`,
t1:`<p><strong>Genetic and metabolic workup for unexplained neonatal seizures:</strong></p>
<ul>
<li>Comprehensive metabolic panel including ammonia, lactate, pyruvate (metabolic disease)</li>
<li>Urine organic acids, plasma amino acids, urine sulfocysteine (metabolic epilepsy)</li>
<li>Cerebrospinal fluid: amino acids, glucose (CSF:serum ratio), neurotransmitters if metabolic epilepsy suspected</li>
<li>Gene panel (neonatal epilepsy panel): KCNQ2, SCN2A, KCNT1, CDKL5, STXBP1, ALDH7A1 — high-yield for early-onset epileptic encephalopathy</li>
<li>Chromosomal microarray for dysmorphic features + seizures</li>
</ul>`,
t2:`<p><strong>LP indications and timing:</strong></p>
<ul>
<li>Perform if infection possible, if first LP deferred due to instability</li>
<li>CSF for: culture (bacterial, viral), cell count/differential/protein/glucose</li>
<li>CSF for HSV PCR — HSV encephalitis presents with seizures DOL 2–21; empiric acyclovir if vesicles, maternal HSV, or CSF pleocytosis</li>
<li>Pyridoxine-responsive: CSF pipecolic acid, alpha-AASA (diagnostic for ALDH7A1)</li>
</ul>
<div class="bx br">🚨 <strong>Neonatal HSV encephalitis:</strong> Mortality 50%+ if untreated. Give empiric acyclovir 60 mg/kg/day (q8h) for any neonate with unexplained seizures + fever, CSF pleocytosis, or skin/mouth/eye vesicles until HSV PCR returns.</div>`,
t3:`<p><strong>How long to maintain EEG monitoring:</strong></p>
<ul>
<li>Continuous EEG for minimum 24h after last clinical seizure</li>
<li>Extend monitoring if: background severely abnormal, electroclinical dissociation suspected, AED given with incomplete response</li>
<li>Discharge EEG: standard clinical EEG before discharge to document interictal background</li>
<li>Background pattern prognostically important: normal background = good prognosis; burst-suppression = poor prognosis</li>
</ul>`
}
}
]};
