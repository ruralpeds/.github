// Clinical tree data — Neonatal Glucose Management Decision Tree (32–35 wk)
// Auto-extracted from neonatal_glucose_management_decision_tree.html
// Edit to update clinical content without touching rendering code.

const TREE_DATA = {
name:"32–35 wk Neonate\nBorn",icon:"👶",type:"assessment",sub:"All 32–35 wk neonates are at-risk for hypoglycemia",edge:"",
info:{tabs:["Risk Factors","Immediate Care","Evidence","Alerts"],
t0:`<p><strong>ALL neonates 32 0/7 – 35 6/7 weeks</strong> are inherently at-risk due to limited glycogen stores, immature counter-regulatory hormones, and high brain-to-body glucose demand.</p>
<table class="rt"><thead><tr><th>Risk Factor</th><th>Evidence</th></tr></thead><tbody>
<tr><td>SGA (&lt;10th %ile)</td><td>19.4% incidence; 53% of DOL2 cases</td></tr>
<tr><td>LGA (&gt;90th %ile)</td><td>Significant early severe hypoglycemia risk</td></tr>
<tr><td>IDM (insulin-treated GDM)</td><td>Independent on multivariate analysis</td></tr>
<tr><td>Maternal Hypertensive Disorders</td><td>OR 2.1 for hypoglycemia admission</td></tr>
<tr><td>Antenatal Betamethasone</td><td>82% maternal hyperglycemia; ↑ neonatal risk</td></tr>
<tr><td>Cesarean Delivery</td><td>Independent risk in SGA neonates</td></tr>
<tr><td>Hypothermia</td><td>aOR 2.10 for NICU transfer</td></tr>
<tr><td>Low 1-min Apgar (&lt;7)</td><td>Significant in SGA neonates</td></tr>
</tbody></table>`,
t1:`<p><strong>First 30 minutes:</strong></p><ul class="sl"><li>Skin-to-skin contact immediately</li><li>Thermoregulation (target axillary 36.5–37.5°C)</li><li>Encourage breastfeeding within 30–60 min</li><li>Assess: jitteriness, poor feeding, lethargy, apnea, seizures</li></ul>
<p><strong>First glucose:</strong> Within 1 hour of birth. Use validated POC device. Confirm &lt;25 mg/dL with lab glucose if available within 30 min — do NOT delay treatment.</p>`,
t2:`<div class="bx bb">ℹ️ <strong>AAP (Adamkin 2011):</strong> No specific glucose concentration reliably discriminates normal from abnormal. Early identification + prophylactic measures recommended.<br><span style="font-size:10px;opacity:.7">DOI: 10.1542/peds.2010-3851</span></div>
<div class="bx bb">ℹ️ <strong>Narasimhan et al. 2021:</strong> 84 US hospitals showed wide variation in definitions (&lt;25 to &lt;45), timing (30 min to 2 hr), and transfer criteria.<br><span style="font-size:10px;opacity:.7">DOI: 10.1542/hpeds.2020-004101</span></div>
<div class="bx bb">ℹ️ <strong>Cochrane (Edwards 2022):</strong> 40% dextrose gel ↑ correction (RR 1.08), ↓ separation (RR 0.54), ↑ breastfeeding (RR 1.10). No adverse events.<br><span style="font-size:10px;opacity:.7">DOI: 10.1002/14651858.CD011027.pub3</span></div>`,
t3:`<div class="bx br">🚨 <strong>Hypothermia–Hypoglycemia Link:</strong> Hypothermia accelerates glycogen depletion via non-shivering thermogenesis. Aggressive thermoregulation = prevention. (Kurz 2025, DOI: 10.1186/s40348-025-00204-1)</div>
<div class="bx br">🚨 <strong>Rural Setting:</strong> Establish transfer criteria BEFORE decompensation. Know transport times + NICU bed availability. Dextrose gel can eliminate transfers at Level 1 facilities (Deyo-Svendsen 2021, PMID: 33974766).</div>`
},children:[
{name:"First Glucose\nCheck ≤1 hr",icon:"🩸",type:"action",sub:"POC glucose before first feed",edge:"Screen\nall",
info:{tabs:["Screening Protocol","Timing Evidence","Measurement"],
t0:`<table class="rt"><thead><tr><th>Period</th><th>Frequency</th></tr></thead><tbody>
<tr><td>0–4 hours</td><td>Every 1 hour (before each feed)</td></tr>
<tr><td>4–24 hours</td><td>Pre-feed (Q2–3 hr)</td></tr>
<tr><td>24–48 hours</td><td>Pre-feed if borderline; d/c if ≥50 × 3</td></tr>
</tbody></table>`,
t1:`<div class="bx bb">ℹ️ <strong>Wang et al. 2023:</strong> 97% of hypoglycemic episodes in SGA neonates within first 2 hours. Lowest glucose at 1 hour.<br><span style="font-size:10px;opacity:.7">DOI: 10.1016/j.pedneo.2022.09.021</span></div>
<div class="bx bb">ℹ️ <strong>El-Khawam 2024:</strong> 3.1% of at-risk neonates had glucose ≤25 in first hour; 0.5% had ≤10 mg/dL.<br><span style="font-size:10px;opacity:.7">DOI: 10.1515/jpem-2023-0573</span></div>`,
t2:`<p>Use validated bedside glucose analyzer. Adult meters may be unreliable at low neonatal concentrations. Confirm critical value (&lt;25) with lab — do NOT delay treatment.</p>`
},children:[
{name:"SYMPTOMATIC\nAny Glucose <45",icon:"🚨",type:"emergency",sub:"Seizures, apnea, lethargy, poor feeding",edge:"Symptomatic",
info:{tabs:["Emergency Protocol","IV Dosing","Escalation","Transfer"],
t0:`<div class="bx br">🚨 <strong>SYMPTOMATIC HYPOGLYCEMIA = EMERGENCY</strong></div>
<ul class="sl"><li>D10W IV bolus: 2 mL/kg over 5–10 min</li><li>Start continuous D10W at GIR 5–8 mg/kg/min</li><li>Recheck glucose 15–30 min post-bolus</li><li>Titrate GIR to maintain ≥50 mg/dL</li><li>Do NOT use gel alone for symptomatic hypoglycemia</li></ul>`,
t1:`<table class="rt"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>
<tr><td>Bolus</td><td>D10W 2 mL/kg IV over 5–10 min</td></tr>
<tr><td>Initial GIR</td><td>5–8 mg/kg/min</td></tr>
<tr><td>GIR Formula</td><td>(Dex% × Rate mL/hr) / (6 × Wt kg)</td></tr>
<tr><td>D10W @ 80 mL/kg/day</td><td>GIR ≈ 5.6 mg/kg/min</td></tr>
<tr><td>Target</td><td>≥50 mg/dL</td></tr>
<tr><td>Monitor</td><td>Q30 min → Q1–2 hr once stable</td></tr>
</tbody></table>
<div class="bx br">🚨 NEVER use D25W or D50W in neonates (osmotic injury + rebound hypoglycemia)</div>`,
t2:`<p><strong>GIR &gt;10–12 → Hyperinsulinism workup:</strong></p>
<table class="rt"><thead><tr><th>Lab</th><th>Significance</th></tr></thead><tbody>
<tr><td>Insulin</td><td>Detectable during hypo = hyperinsulinism</td></tr>
<tr><td>C-peptide</td><td>Elevated: endogenous production</td></tr>
<tr><td>FFA</td><td>Suppressed: hyperinsulinism</td></tr>
<tr><td>BHB</td><td>Suppressed: no ketone generation</td></tr>
<tr><td>Cortisol / GH</td><td>Low: adrenal/GH deficiency</td></tr>
<tr><td>Ammonia, Lactate</td><td>Metabolic disease screen</td></tr>
</tbody></table>
<div class="bx bb">ℹ️ <strong>Al Housni 2022:</strong> Medication cohort max GIR 12.95 vs 6.77 mg/kg/min. Predictors: GDM, LGA, BG ≤1.5 mmol/L at 2hr.<br><span style="font-size:10px;opacity:.7">DOI: 10.7759/cureus.32197</span></div>`,
t3:`<div class="bx br">🚨 <strong>Transfer to Level III/IV when:</strong><ul><li>Seizures</li><li>Persistent symptomatic hypoglycemia</li><li>GIR &gt;12 mg/kg/min</li><li>Suspected hyperinsulinism</li><li>Unable to wean IV after 3–5 days</li></ul></div>
<div class="bx bg">✅ <strong>Continue Level II when:</strong><ul><li>Responding to gel + feeds</li><li>GIR &lt;10 with stable values</li><li>Asymptomatic throughout</li><li>Enteral feeds advancing, IV weaning within 24–48 hr</li></ul></div>`
},children:[
{name:"IV D10W Bolus\n2 mL/kg +\nGIR 5–8",icon:"💉",type:"emergency",sub:"Recheck 15–30 min post-bolus",edge:"IV\naccess",info:{tabs:["Protocol"],t0:`<ul class="sl"><li>D10W 2 mL/kg IV push over 5–10 min</li><li>Start continuous infusion immediately</li><li>Recheck glucose 15–30 min post-bolus</li><li>Titrate up 1–2 mg/kg/min if glucose remains low</li></ul>`},children:[
{name:"Stable ≥50\n→ Wean GIR\n10–20% Q6–12h",icon:"✅",type:"action",sub:"Advance enteral feeds; d/c IV when GIR <3",edge:"Stable",info:{tabs:["Weaning"],t0:`<p>Once ≥50 for ≥12 hr, wean GIR by 1–2 mg/kg/min (10–20%) every 6–12 hr. Check before each reduction. Advance enteral feeds. D/C IV when stable on full feeds with GIR &lt;3.</p>`}},
{name:"GIR >12\n→ Hyperinsulinism\nWorkup + Transfer",icon:"🔬",type:"diagnosis",sub:"Critical sample during hypoglycemia",edge:"Not\nresponding",info:{tabs:["Workup"],t0:`<p>Obtain critical sample during hypoglycemia. Start diazoxide 5–15 mg/kg/day if confirmed hyperinsulinism. Transfer to Level III/IV with endocrine access.</p>`}}
]}
]},
{name:"ASYMPTOMATIC\nGlucose <25\n(0–4 hr)",icon:"⚠️",type:"urgent",sub:"Immediate dextrose gel + feed",edge:"Asymp\n<25",
info:{tabs:["Management","Gel Dosing","Evidence"],
t0:`<ul class="sl"><li>40% dextrose gel 200 mg/kg buccally</li><li>Feed immediately — breast milk preferred</li><li>Recheck 30 min post-intervention</li><li>If &lt;25 after 2nd gel dose → IV D10W GIR 5–6</li></ul>`,
t1:`<table class="rt"><thead><tr><th>Weight</th><th>Volume 40% Gel</th></tr></thead><tbody>
<tr><td>1.5 kg</td><td>0.75 mL</td></tr>
<tr><td>2.0 kg</td><td>1.0 mL</td></tr>
<tr><td>2.5 kg</td><td>1.25 mL</td></tr>
<tr><td>3.0 kg</td><td>1.5 mL</td></tr>
</tbody></table>
<p>Dry buccal mucosa with gauze → apply gel to inner cheek → massage 1 min → feed immediately.</p>`,
t2:`<div class="bx bb">ℹ️ <strong>Cochrane (Edwards 2022):</strong> 40% gel probably ↑ correction, ↓ separation (RR 0.54), ↑ breastfeeding (RR 1.10). No adverse events. First-line for at-risk late preterm/term infants.<br><span style="font-size:10px;opacity:.7">DOI: 10.1002/14651858.CD011027.pub3</span></div>
<div class="bx bb">ℹ️ <strong>Makker 2018:</strong> NICU transfers 8.1% → 3.7%; breastfeeding 6% → 19%; charges halved.<br><span style="font-size:10px;opacity:.7">DOI: 10.1055/s-0038-1639338</span></div>
<div class="bx bg">✅ <strong>St Clair 2021:</strong> Dextrose gel does NOT alter neonatal gut microbiome.<br><span style="font-size:10px;opacity:.7">DOI: 10.1136/archdischild-2021-322757</span></div>`
},children:[
{name:"Gel 200 mg/kg\n+ Feed",icon:"🍼",type:"action",sub:"Recheck 30 min",edge:"Gel +\nfeed",info:{tabs:["Technique"],t0:`<ul class="sl"><li>Draw 0.5 mL/kg of 40% dextrose gel</li><li>Dry buccal mucosa with gauze</li><li>Apply to inner cheek</li><li>Massage 1 minute</li><li>Follow with breastfeeding or EBM</li><li>Recheck glucose 30 min later</li></ul>`},children:[
{name:"Recheck ≥25\n→ Continue\nQ1hr Screening",icon:"📊",type:"action",sub:"Target rising trajectory → ≥45 by 4 hr",edge:"≥25",info:{tabs:["Next"],t0:`<p>Continue pre-feed screening Q1hr for first 4 hours. Target: rising trajectory toward ≥45 by 4 hr. Gel + feed for subsequent lows.</p>`}},
{name:"Still <25\nAfter 2 Doses\n→ IV D10W",icon:"💉",type:"urgent",sub:"Failure of first-line therapy",edge:"Still\n<25",info:{tabs:["Escalation"],t0:`<p>Failure of 2 gel doses → IV D10W at GIR 5–6 mg/kg/min. Do not delay further. Continue enteral feeds alongside IV.</p>`}}
]}
]},
{name:"ASYMPTOMATIC\n25–39 mg/dL\n(0–4 hr)",icon:"⚡",type:"decision",sub:"Feed ± dextrose gel",edge:"Asymp\n25–39",
info:{tabs:["Management","Rural Evidence"],
t0:`<ul class="sl"><li>Feed immediately (breast milk preferred)</li><li>Consider adjunctive 40% gel 200 mg/kg</li><li>Recheck 30 min post-feed</li><li>&lt;25 → IV dextrose</li><li>25–39 not rising × 2 → consider IV</li><li>≥40 → continue screening</li></ul>`,
t1:`<div class="bx bg">✅ <strong>Deyo-Svendsen 2021 (Level 1 Rural):</strong> Protocolized screening + gel eliminated ALL IV dextrose use and NICU transfers (0/250 vs 7/310 pre-protocol).<br><span style="font-size:10px;opacity:.7">PMID: 33974766</span></div>
<div class="bx bb">ℹ️ <strong>Hammer 2018:</strong> Level 2 nursery toolkit → 6.5% ↑ exclusive breastfeeding, 5% ↓ intermediate care admissions.<br><span style="font-size:10px;opacity:.7">DOI: 10.1097/ANC.0000000000000527</span></div>`
},children:[
{name:"Feed + Gel\n→ Recheck\n30 min",icon:"🍼",type:"action",sub:"Goal: rising trajectory",edge:"Feed ±\ngel",info:{tabs:["Protocol"],t0:`<p>Feed first, then gel if available. Recheck 30 min. If ≥40 → pre-feed monitoring Q1–2hr.</p>`},children:[
{name:"Rising\n→ Pre-feed\nScreening",icon:"📈",type:"action",sub:"Target ≥45 by 4–12 hr, ≥50 by 24 hr",edge:"Rising",info:{tabs:["Targets"],t0:`<table class="rt"><thead><tr><th>Age</th><th>Target</th></tr></thead><tbody><tr><td>0–4 hr</td><td>≥25 (some: ≥40)</td></tr><tr><td>4–24 hr</td><td>≥35–45</td></tr><tr><td>24–48 hr</td><td>≥50 (PES)</td></tr></tbody></table><p>May d/c screening after 3 consecutive ≥50 on full feeds.</p>`}},
{name:"Not Rising × 2\n→ IV D10W",icon:"💉",type:"urgent",sub:"First-line failure after ~1 hr",edge:"Not\nrising",info:{tabs:["Escalation"],t0:`<p>If not rising above 25 or no upward trend after 2 cycles (~1 hour), start IV D10W at GIR 5–6 mg/kg/min.</p>`}}
]}
]},
{name:"ASYMPTOMATIC\n≥40 mg/dL\n(0–4 hr)",icon:"✅",type:"assessment",sub:"Continue monitoring",edge:"Asymp\n≥40",
info:{tabs:["Monitoring","Discharge"],
t0:`<table class="rt"><thead><tr><th>Age</th><th>Target</th></tr></thead><tbody>
<tr><td>0–4 hr</td><td>≥25 (some: ≥40)</td></tr>
<tr><td>4–24 hr</td><td>≥35–45</td></tr>
<tr><td>24–48 hr</td><td>≥50 (PES threshold)</td></tr>
</tbody></table>`,
t1:`<p><strong>D/C screening when:</strong></p><ul><li>3 consecutive pre-feed ≥50 mg/dL</li><li>Feeding well (breast or bottle)</li><li>Normothermic</li><li>Asymptomatic</li><li>≥24–48 hours old</li></ul>`
},children:[
{name:"Pre-feed Q2–3hr\nThrough 24 hr",icon:"📊",type:"action",sub:"If any value drops → re-enter branch",edge:"Monitor",info:{tabs:["Protocol"],t0:`<p>Continue pre-feed screening. If any value drops below threshold, re-enter appropriate branch. Support breastfeeding. Maintain thermoregulation.</p>`},children:[
{name:"3× ≥50\n→ D/C\nScreening",icon:"🎉",type:"action",sub:"Screening complete",edge:"Stable",info:{tabs:["Done"],t0:`<p>Screening complete. Ensure feeding adequacy, temperature stability, normal assessment before discharge.</p>`}},
{name:"Value Drops\n→ Re-enter\nBranch",icon:"🔄",type:"decision",sub:"Single recurrence: gel. Persistent: IV.",edge:"Drop",info:{tabs:["Re-assess"],t0:`<p>Any drop below threshold → re-enter at appropriate branch. Single recurrence: gel + feed. Persistent recurrence: IV dextrose.</p>`}}
]}
]}
]}
]};
