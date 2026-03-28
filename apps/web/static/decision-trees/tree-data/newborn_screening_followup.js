// Clinical tree data — Newborn Screening Follow-Up Decision Tree
// Source: 
// Auto-extracted from newborn_screening_followup_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Newborn Screening\nFollow-Up",icon:"🧬",type:"assessment",sub:"RUSP conditions · Urgent vs non-urgent · Action algorithms",edge:"",
info:{tabs:["Overview","Urgency Classification","When Results Arrive"],
t0:`<p><strong>Newborn screening (NBS)</strong> identifies presymptomatic infants with treatable conditions. The Recommended Uniform Screening Panel (RUSP) includes ~35 core conditions and ~25 secondary conditions. Most results are available within 5–7 days of collection.</p>
<p><strong>Critical NBS workflow:</strong></p>
<ul><li>Specimen collected at 24–48 hours of age (optimal timing)</li>
<li>If collected &lt;24h (early discharge): many states require a REPEAT screen at 1–2 weeks</li>
<li>Preterm/NICU infants: may need repeat screens due to higher false-positive rates</li>
<li>Results go to the ordering provider (birthing hospital or PCP) AND the state NBS program</li>
<li><strong>Abnormal results require IMMEDIATE action</strong> — the state lab typically calls for critical results, but the PCP/hospital must also have a reliable system to receive and act on results</li></ul>`,
t1:`<table class="dt"><thead><tr><th>Urgency</th><th>Conditions</th><th>Timeline</th></tr></thead><tbody>
<tr><td><strong>🔴 EMERGENT (same day)</strong></td><td>Galactosemia (stop lactose NOW), CAH salt-wasting, MSUD, MCAD (fasting risk), organic acidemias (MMA, PA), urea cycle defects (OTC, CPS)</td><td>Contact family IMMEDIATELY. Stop breastfeeding if galactosemia. ER evaluation. Specialist consult same day.</td></tr>
<tr><td><strong>🟠 URGENT (24–48h)</strong></td><td>Congenital hypothyroidism, biotinidase deficiency, severe hemoglobinopathies (SCD), tyrosinemia, PKU</td><td>Confirmatory labs within 24–48h. Start treatment as soon as confirmed. Specialist referral within days.</td></tr>
<tr><td><strong>🟡 PROMPT (1–2 weeks)</strong></td><td>Cystic fibrosis (carrier screen positive → sweat test), mild hemoglobin variants (traits), hearing screen refer</td><td>Schedule confirmatory testing. Genetic counseling. Not immediately life-threatening.</td></tr>
</tbody></table>`,
t2:`<p><strong>When you receive an abnormal NBS result:</strong></p>
<ol class="sl">
<li><strong>Identify the condition and its urgency level</strong> (see table above)</li>
<li><strong>Contact the family immediately</strong> (phone, not letter) for emergent/urgent results</li>
<li><strong>Arrange confirmatory testing</strong> per the specific condition (serum levels, enzyme assays, genetic testing)</li>
<li><strong>Institute any IMMEDIATE dietary/medical changes</strong> (e.g., stop galactose for galactosemia, start levothyroxine for CH)</li>
<li><strong>Refer to specialist</strong> (metabolic genetics, endocrine, hematology, pulmonology per condition)</li>
<li><strong>Document</strong> notification time, actions taken, follow-up plan</li>
</ol>
<div class="bx br">🚨 <strong>A system failure in NBS follow-up can be fatal.</strong> Ensure your practice has a RELIABLE process to: (1) receive results, (2) flag abnormals, (3) contact families, (4) arrange confirmatory testing, and (5) track completion. Do not assume "no news is good news" — verify that results were received.</div>`
},children:[
{name:"Metabolic\nEmergencies",icon:"🔴",type:"emergency",sub:"Galactosemia · MSUD · UCD · Organic acidemias",edge:"Emergent\nNBS result",
info:{tabs:["Galactosemia","MSUD/Organic Acidemias","Urea Cycle Defects"],
t0:`<p><strong>Galactosemia (classic — GALT deficiency):</strong></p>
<ul><li>NBS: elevated galactose-1-phosphate, deficient GALT enzyme activity</li>
<li><strong>STOP ALL LACTOSE/GALACTOSE IMMEDIATELY</strong> — no breast milk, no standard formula. Switch to soy-based or elemental formula.</li>
<li>If untreated: E. coli sepsis (week 1–2), liver failure, cataracts, intellectual disability, death</li>
<li>Confirmatory: GALT enzyme activity + galactose-1-phosphate level + GALT gene sequencing</li>
<li>Even with dietary treatment: long-term complications include speech/language delays, ovarian insufficiency (females), tremor</li></ul>
<div class="bx br">🚨 <strong>A neonate with a positive galactosemia screen who is breastfeeding must be switched to soy formula IMMEDIATELY — before confirmatory results.</strong> Every feeding with lactose causes progressive hepatic and renal damage.</div>`,
t1:`<p><strong>MSUD (Maple Syrup Urine Disease):</strong></p>
<ul><li>Branched-chain amino acid (leucine, isoleucine, valine) metabolism disorder</li>
<li>NBS: elevated leucine</li>
<li>Presents day 3–7: poor feeding, lethargy, "maple syrup" or "burnt sugar" odor, encephalopathy, seizures, cerebral edema</li>
<li>EMERGENT: reduce leucine immediately (IV dextrose to suppress catabolism, special BCAA-free formula, dialysis if encephalopathic)</li></ul>
<p><strong>Organic acidemias (MMA, PA, IVA):</strong></p>
<ul><li>NBS: elevated C3-acylcarnitine (MMA/PA), elevated C5 (IVA)</li>
<li>Present in first week: vomiting, lethargy, metabolic acidosis with elevated anion gap, hyperammonemia, pancytopenia</li>
<li>EMERGENT: NPO (stop protein), IV D10W at high GIR (suppress catabolism), carnitine supplementation, bicarbonate for acidosis, dialysis if hyperammonemia >400</li></ul>`,
t2:`<p><strong>Urea Cycle Defects (OTC, CPS, ASS, ASL):</strong></p>
<ul><li>NBS: elevated citrulline (ASS, ASL) or low citrulline (OTC, CPS). NOTE: OTC deficiency may NOT be detected on NBS in female carriers.</li>
<li>Present day 2–5: initially well, then progressive lethargy, vomiting, respiratory alkalosis (from hyperventilation stimulated by ammonia), then encephalopathy, seizures, coma</li>
<li><strong>Ammonia level is KEY:</strong> >100 µmol/L concerning; >200 = emergent; >400 = dialysis. Normal neonatal ammonia &lt;100 µmol/L.</li>
<li>EMERGENT: NPO (stop all protein), IV D10W + lipid (calories without protein), sodium benzoate 250 mg/kg IV + sodium phenylacetate 250 mg/kg IV (Ammonul), arginine IV, hemodialysis if ammonia >400 or not falling</li></ul>
<div class="bx br">🚨 <strong>Hyperammonemia is a NEUROLOGIC EMERGENCY.</strong> Ammonia >200 µmol/L for >12h → irreversible brain damage. Aggressive treatment including dialysis must not be delayed. Transfer to a metabolic center urgently.</div>`
}},
{name:"Endocrine &\nHemoglobin",icon:"🟠",type:"urgent",sub:"CH · CAH · SCD · PKU",edge:"Urgent\nNBS result",
info:{tabs:["Congenital Hypothyroidism","Sickle Cell Disease","PKU"],
t0:`<p><strong>Congenital hypothyroidism (see Endocrine tree for full detail):</strong></p>
<ul><li>NBS: elevated TSH (primary screen) or low T4 (in states using T4 screening)</li>
<li>Confirmatory: serum TSH + free T4. If TSH >40 and/or FT4 low → start levothyroxine SAME DAY.</li>
<li>Dose: 10–15 µg/kg/day PO. Target FT4 in upper half of normal.</li>
<li>IQ is normal if treatment started within 2 weeks of birth.</li></ul>`,
t1:`<p><strong>Sickle Cell Disease:</strong></p>
<ul><li>NBS: hemoglobin electrophoresis pattern. FS = sickle cell disease (HbSS). FSC = HbSC disease. FSA = sickle beta-thalassemia.</li>
<li>FAS = sickle TRAIT (carrier) — counsel family but no medical emergency</li>
<li><strong>For SCD (FS, FSC):</strong></li>
<li>Penicillin prophylaxis starting by 2 months of age (125 mg PO BID until age 5) — prevents pneumococcal sepsis which is leading cause of death in young SCD</li>
<li>Pneumococcal vaccination (PCV15 + PPSV23) on schedule + extra doses</li>
<li>Hematology referral by 2 months</li>
<li>Hydroxyurea: increasingly started in infancy (BABY HUG trial — reduces pain crises, dactylitis, ACS)</li>
<li>Parental education: fever >101°F = ED immediately (splenic dysfunction → overwhelming sepsis risk); splenic sequestration (teach parents to palpate spleen)</li></ul>`,
t2:`<p><strong>Phenylketonuria (PKU):</strong></p>
<ul><li>NBS: elevated phenylalanine (Phe) level</li>
<li>Confirmatory: plasma amino acids (Phe >360 µmol/L or >6 mg/dL)</li>
<li>Treatment: low-phenylalanine diet + medical formula (Phe-free amino acid formula) started within first 2 weeks</li>
<li>Untreated: severe intellectual disability, seizures, behavioral problems, musty odor, eczema, fair skin/hair (decreased melanin from low tyrosine)</li>
<li>With dietary treatment from birth: normal intelligence and development</li>
<li>Maternal PKU: women with PKU must be on strict diet before and during pregnancy to prevent fetal damage (microcephaly, CHD)</li></ul>`
}},
{name:"Cystic Fibrosis\n& Other Prompt",icon:"🟡",type:"action",sub:"IRT → sweat test · Hearing follow-up",edge:"Prompt\nNBS result",
info:{tabs:["CF Screening Path","Hearing Screen"],
t0:`<p><strong>CF NBS screening algorithm:</strong></p>
<ol class="sl">
<li><strong>Immunoreactive trypsinogen (IRT)</strong> elevated on NBS (>95–99th percentile)</li>
<li>Many states then test for CFTR mutations on the same NBS specimen (IRT/DNA algorithm)</li>
<li>If 1 or 2 CFTR mutations found → <strong>sweat chloride test</strong> (gold standard)</li>
<li>Sweat chloride ≥60 mmol/L = CF diagnosis. 30–59 = intermediate (may be CF or CFTR-related disorder). &lt;30 = CF unlikely.</li>
<li>Sweat test should be performed at an accredited CF Foundation care center by 2 weeks of age for positive NBS</li>
</ol>
<p><strong>Elevated IRT alone (no mutations found):</strong> May be false positive (common), CF carrier, or rare CFTR mutation not on the panel. Repeat IRT or sweat test per state protocol.</p>`,
t1:`<p><strong>Hearing screen follow-up (JCIH 1-3-6 goals):</strong></p>
<ul><li><strong>1 month:</strong> Screening completed (before discharge; if "refer" → outpatient rescreening by 1 month)</li>
<li><strong>3 months:</strong> Audiologic diagnosis confirmed (ABR-based diagnostic testing)</li>
<li><strong>6 months:</strong> Intervention initiated (hearing aids, early intervention services, consider cochlear implant evaluation if severe-profound)</li>
<li>Risk factors requiring follow-up even if initial screen passes: NICU >5 days, ototoxic medications (aminoglycosides, furosemide), hyperbilirubinemia requiring exchange, congenital CMV, family history of childhood hearing loss, craniofacial anomalies</li></ul>
<div class="bx bb">ℹ️ <strong>Congenital CMV is the #1 non-genetic cause of sensorineural hearing loss.</strong> Many states now mandate CMV testing for infants who fail newborn hearing screen (CMV urine PCR within 21 days of birth). Hearing loss from CMV can be progressive and late-onset — serial audiologic monitoring is essential even if initial hearing is normal.</div>`
}}
]};
