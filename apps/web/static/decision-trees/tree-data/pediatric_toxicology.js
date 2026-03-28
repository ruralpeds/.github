// Clinical tree data — Pediatric Toxicology Decision Tree
// Source: 
// Auto-extracted from pediatric_toxicology_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric\nToxicology",icon:"☠️",type:"assessment",sub:"Ingestion algorithm, acetaminophen, antidotes, toxidromes",edge:"",
info:{tabs:["Approach","Toxidromes","Key Phone Numbers"],
t0:`<p><strong>Approach to the pediatric poisoning/ingestion:</strong></p>
<ol class="sl">
<li><strong>Stabilize (ABCs):</strong> Airway protection (intubate if GCS &lt;8 or unable to protect), breathing, circulation (IV fluids/pressors for hypotension)</li>
<li><strong>Identify the toxin:</strong> Pill bottles, witness accounts, toxidrome pattern, medication list. Bring containers to ED.</li>
<li><strong>Call Poison Control:</strong> 1-800-222-1222 (available 24/7). They guide evaluation, decontamination, and treatment decisions.</li>
<li><strong>Decontamination:</strong> Activated charcoal 1 g/kg PO (max 50g) if: within 1–2 hours of ingestion, alert and protecting airway, potentially toxic ingestion. NOT for: caustics, hydrocarbons, metals, altered mental status, or late presentation.</li>
<li><strong>Labs:</strong> Acetaminophen and salicylate levels (screen ALL intentional ingestions regardless of reported substance), BMP, glucose, ECG, VBG, ethanol, urine drug screen</li>
</ol>`,
t1:`<table class="dt"><thead><tr><th>Toxidrome</th><th>Signs</th><th>Agents</th><th>Treatment</th></tr></thead><tbody>
<tr><td><strong>Anticholinergic</strong></td><td>"Hot as a hare, dry as a bone, red as a beet, blind as a bat, mad as a hatter." Tachycardia, mydriasis, dry skin, urinary retention, hyperthermia, delirium.</td><td>Diphenhydramine, atropine, jimsonweed, TCA</td><td>Physostigmine 0.02 mg/kg IV (for severe delirium/seizures)</td></tr>
<tr><td><strong>Cholinergic</strong></td><td>SLUDGE/BBB: Salivation, Lacrimation, Urination, Defecation, GI distress, Emesis + Bradycardia, Bronchospasm, Bronchorrhea</td><td>Organophosphates, nerve agents, carbamates</td><td>Atropine 0.05 mg/kg IV (no max; titrate to dry secretions) + Pralidoxime 25–50 mg/kg IV</td></tr>
<tr><td><strong>Sympathomimetic</strong></td><td>Tachycardia, hypertension, hyperthermia, mydriasis, diaphoresis, agitation, seizures</td><td>Cocaine, amphetamines, MDMA, pseudoephedrine</td><td>Benzodiazepines (midazolam/lorazepam). Avoid β-blockers with cocaine.</td></tr>
<tr><td><strong>Opioid</strong></td><td>CNS depression, respiratory depression, miosis ("pinpoint pupils"), bradycardia</td><td>Morphine, fentanyl, heroin, methadone, oxycodone</td><td>Naloxone 0.1 mg/kg IV/IM/IN (max 2 mg; repeat q2–3 min). Goal = adequate breathing, NOT full arousal.</td></tr>
<tr><td><strong>Sedative-hypnotic</strong></td><td>CNS depression, normal vitals, normal pupils, ataxia, slurred speech</td><td>Benzodiazepines, barbiturates, ethanol, GHB</td><td>Supportive. Flumazenil 0.01 mg/kg IV for pure benzo OD (caution: may cause seizures in chronic benzo users)</td></tr>
</tbody></table>`,
t2:`<ul><li><strong>Poison Control:</strong> 1-800-222-1222 (US — available 24/7, free, expert toxicology guidance)</li>
<li><strong>Call for:</strong> Dose assessment, need for ED evaluation, decontamination advice, specific antidote dosing, observation duration, disposition</li>
<li><strong>ALWAYS call Poison Control</strong> for: any symptomatic ingestion, any intentional ingestion, any ingestion of a potentially lethal substance, any ingestion in a child &lt;6 years</li></ul>`
},children:[
{name:"Acetaminophen\nOD",icon:"💊",type:"emergency",sub:"Rumack-Matthew nomogram · NAC within 8 hours",edge:"APAP ingestion\nor level drawn",
info:{tabs:["Rumack-Matthew","NAC Protocol","Special Situations"],
t0:`<p><strong>Rumack-Matthew Nomogram:</strong></p>
<ul><li>Plot 4-hour (or later) acetaminophen level against hours post-ingestion</li>
<li>Treatment line starts at 150 µg/mL at 4 hours (some institutions use the lower 100 µg/mL "150 line")</li>
<li>If level is ABOVE the treatment line → start NAC</li>
<li>If level is BELOW → low risk, may observe</li>
<li>Do NOT draw level before 4 hours post-ingestion (peak absorption not yet reached)</li>
<li>If time of ingestion unknown → treat empirically with NAC while awaiting level</li></ul>
<div class="bx br">🚨 <strong>NAC (N-Acetylcysteine) is virtually 100% hepatoprotective if given within 8 hours of ingestion.</strong> After 8 hours, efficacy declines significantly. If in doubt, start NAC and consult Poison Control.</div>`,
t1:`<table class="rt"><thead><tr><th>Route</th><th>Protocol</th></tr></thead><tbody>
<tr><td><strong>IV NAC (Acetadote)</strong></td><td>150 mg/kg over 1 hour → 50 mg/kg over 4 hours → 100 mg/kg over 16 hours (total 21 hours). Preferred for: vomiting, unable to tolerate PO, fulminant hepatic failure, pregnancy.</td></tr>
<tr><td><strong>PO NAC (Mucomyst)</strong></td><td>140 mg/kg loading, then 70 mg/kg q4h × 17 additional doses (total 72 hours). Mix in cola to mask taste/smell. Administer with antiemetic (ondansetron 0.15 mg/kg IV).</td></tr>
</tbody></table>
<p><strong>Monitoring:</strong> APAP level q4h until declining, LFTs (AST/ALT) at baseline and q12–24h, INR, Cr, glucose, serial clinical assessment.</p>`,
t2:`<p><strong>Special situations:</strong></p>
<ul><li><strong>Chronic/repeated supratherapeutic ingestion:</strong> Nomogram does NOT apply (designed for single acute ingestion). Check LFTs + APAP level. If elevated LFTs or APAP >10 µg/mL → start NAC. Consult toxicology.</li>
<li><strong>Extended-release APAP:</strong> Draw levels at 4h AND 8h (may have delayed peak).</li>
<li><strong>Co-ingestion with anticholinergic:</strong> Delayed gastric emptying → delayed APAP absorption → draw serial levels.</li>
<li><strong>Fulminant hepatic failure:</strong> Coagulopathy (INR >2), encephalopathy, renal failure, acidosis, hypoglycemia. Continue IV NAC continuously. Consult hepatology/transplant center. King's College criteria for transplant evaluation.</li></ul>`
}},
{name:"Common\nAntidotes",icon:"💉",type:"action",sub:"Key antidote reference table",edge:"Toxin\nidentified",
info:{tabs:["Antidote Table"],
t0:`<table class="rt"><thead><tr><th>Toxin</th><th>Antidote</th><th>Dose</th></tr></thead><tbody>
<tr><td>Acetaminophen</td><td>N-Acetylcysteine (NAC)</td><td>150 mg/kg IV load (see protocol above)</td></tr>
<tr><td>Opioids</td><td>Naloxone</td><td>0.1 mg/kg IV/IM/IN (max 2 mg); repeat q2–3 min</td></tr>
<tr><td>Benzodiazepines</td><td>Flumazenil</td><td>0.01 mg/kg IV (max 0.2 mg); use with caution</td></tr>
<tr><td>Organophosphates</td><td>Atropine + Pralidoxime</td><td>Atropine 0.05 mg/kg; 2-PAM 25–50 mg/kg</td></tr>
<tr><td>Iron</td><td>Deferoxamine</td><td>15 mg/kg/hr IV (for serum Fe >500 or symptomatic)</td></tr>
<tr><td>Methanol/ethylene glycol</td><td>Fomepizole (or ethanol)</td><td>15 mg/kg IV load, then 10 mg/kg q12h</td></tr>
<tr><td>Beta-blockers</td><td>Glucagon</td><td>0.05–0.15 mg/kg IV (max 5 mg)</td></tr>
<tr><td>Calcium channel blockers</td><td>Calcium + High-dose insulin</td><td>CaCl 20 mg/kg IV; Insulin 1 U/kg/hr + dextrose</td></tr>
<tr><td>Digoxin</td><td>DigiFab</td><td>Based on level/dose ingested; contact Poison Control</td></tr>
<tr><td>TCAs</td><td>Sodium bicarbonate</td><td>1–2 mEq/kg IV bolus for QRS >100 ms or arrhythmia</td></tr>
<tr><td>Carbon monoxide</td><td>100% O₂ (or hyperbaric O₂)</td><td>NRB mask; HBO for COHb >25% or neurologic symptoms</td></tr>
<tr><td>Cyanide</td><td>Hydroxocobalamin</td><td>70 mg/kg IV (max 5g)</td></tr>
</tbody></table>`
}}
]};
