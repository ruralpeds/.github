// Clinical tree data — Neonatal Infectious Diseases Decision Tree
// Source: 
// Auto-extracted from neonatal_infectious_diseases_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal Infection\nSuspected",icon:"🦠",type:"assessment",sub:"Clinical signs or risk factors for infection",edge:"",
info:{tabs:["When to Evaluate","Risk Factors","Key Lab Values","Blood Culture Principles"],
t0:`<p>Neonatal infection evaluation is triggered by clinical signs, maternal risk factors, or both. Neonatal sepsis remains a leading cause of morbidity and mortality, especially in preterm infants.</p>
<p><strong>Clinical signs prompting evaluation:</strong></p>
<ul><li>Temperature instability (fever >38°C OR hypothermia <36.5°C — hypothermia is MORE common in neonates than fever)</li>
<li>Respiratory distress: tachypnea, grunting, retractions, oxygen requirement</li>
<li>Hemodynamic instability: tachycardia, bradycardia, hypotension, poor perfusion, CRT >3 sec</li>
<li>Feeding intolerance: poor feeding, vomiting, abdominal distension, ileus</li>
<li>Neurologic: lethargy, irritability, hypotonia, seizures, bulging fontanelle</li>
<li>Skin: pallor, mottling, cyanosis, petechiae, jaundice</li>
<li>Metabolic: hypoglycemia, hyperglycemia, metabolic acidosis</li></ul>
<div class="bx bo">⚠️ <strong>Neonatal sepsis can present with subtle, nonspecific signs.</strong> "The baby just doesn't look right" from an experienced nurse is a legitimate reason to evaluate. Have a low threshold for sepsis workup in preterm infants.</div>`,
t1:`<p><strong>Maternal/Perinatal Risk Factors for EOS:</strong></p>
<ul><li>GBS colonization (positive or unknown status)</li>
<li>Prolonged rupture of membranes (PROM >18 hours)</li>
<li>Maternal intrapartum fever (>38.0°C / 100.4°F)</li>
<li>Chorioamnionitis (clinical or histologic)</li>
<li>Preterm delivery (&lt;37 weeks — strongest risk factor)</li>
<li>Inadequate intrapartum antibiotic prophylaxis (IAP)</li>
<li>Prior infant with invasive GBS disease</li>
<li>GBS bacteriuria during current pregnancy</li>
<li>Maternal UTI or other infection</li></ul>
<p><strong>Risk Factors for LOS:</strong></p>
<ul><li>Prematurity / VLBW (&lt;1500g)</li>
<li>Central venous catheters (PICC, UVC)</li>
<li>Prolonged TPN</li>
<li>Prolonged broad-spectrum antibiotics</li>
<li>Mechanical ventilation</li>
<li>Surgical NEC or other GI pathology</li>
<li>Prolonged NICU stay</li></ul>`,
t2:`<table class="rt"><thead><tr><th>Lab</th><th>Normal Neonatal</th><th>Interpretation</th></tr></thead><tbody>
<tr><td>WBC</td><td>9,000–30,000/µL (term)</td><td>Both leukocytosis AND leukopenia concerning; leukopenia (&lt;5,000) is more specific for sepsis</td></tr>
<tr><td>ANC</td><td>Varies by GA/age (Schmutz)</td><td>Neutropenia (marrow exhaustion) is a BAD sign; more specific than neutrophilia</td></tr>
<tr><td>I:T ratio</td><td>&lt;0.2</td><td>>0.2 sensitive (~80%) but NOT specific (~30%) for sepsis</td></tr>
<tr><td>CRP</td><td>&lt;1.0 mg/dL</td><td>Rises 6–12h after infection onset. Serial CRP at 24–48h more useful. Negative predictive value excellent at 24–48h.</td></tr>
<tr><td>Procalcitonin</td><td>&lt;0.5 ng/mL (after 24h)</td><td>Rises 2–4h (faster than CRP). Physiologic peak at 24h of life limits day-1 utility. Best at 24–48h.</td></tr>
<tr><td>Blood culture</td><td>No growth</td><td>Gold standard. Minimum 1 mL from peripheral site. Most EOS pathogens positive within 24–36h.</td></tr>
<tr><td>CSF</td><td>WBC &lt;20–30/µL (term); protein &lt;150 mg/dL; glucose >50% serum</td><td>Neonatal CSF norms are different from older children. Traumatic tap complicates interpretation.</td></tr>
</tbody></table>`,
t3:`<p><strong>Blood Culture Best Practices:</strong></p>
<ol class="sl">
<li><strong>Volume matters:</strong> Minimum 1 mL (ideally 2 mL). Inadequate volume is the #1 reason for false-negative cultures. Low inocula in neonatal bacteremia means more volume = higher sensitivity.</li>
<li><strong>Timing:</strong> Ideally BEFORE antibiotics, but do NOT delay antibiotics for culture if infant is critically ill.</li>
<li><strong>Site:</strong> Peripheral venipuncture preferred. If central line in place, obtain both a peripheral AND a central line culture (differential time-to-positivity helps diagnose CLABSI).</li>
<li><strong>Incubation:</strong> Most significant neonatal pathogens (GBS, E. coli, S. aureus) are positive within 24–36 hours of incubation. By 48 hours, the vast majority of true pathogens are detected.</li>
<li><strong>Interpretation:</strong> CoNS in a single culture is often a contaminant but can be a true pathogen in VLBW with central lines. Two positive cultures from separate sites increases confidence.</li>
</ol>
<div class="bx bg">✓ <strong>The Kaiser EOS Calculator (neonatalsepsiscalculator.kaiserpermanente.org)</strong> can help estimate EOS risk and guide workup decisions for late-preterm/term infants ≥34 weeks. AAP 2023 supports its use as an alternative approach.</div>`
},
children:[
// ═══════ BRANCH 1: EARLY-ONSET SEPSIS ═══════
{name:"Early-Onset\nSepsis (EOS)",icon:"⚡",type:"urgent",sub:"< 72 hours of life",edge:"< 72h\nof age",
info:{tabs:["Definition","Pathogens","AAP 2023 Approaches","Empiric Antibiotics"],
t0:`<p><strong>Early-onset sepsis (EOS)</strong> = systemic infection occurring within the first 72 hours of life (some define as &lt;7 days). Incidence: ~0.5/1,000 live births (term); up to 10–20/1,000 in VLBW. Acquired vertically from maternal genital tract flora during labor and delivery.</p>
<p><strong>Mortality:</strong> Overall ~3% in term infants; up to 25–50% in preterm/VLBW. GBS EOS mortality ~2–3%; E. coli EOS mortality ~10–15%, higher with meningitis.</p>`,
t1:`<table class="dt"><thead><tr><th>Pathogen</th><th>% of EOS</th><th>Key Features</th></tr></thead><tbody>
<tr><td><strong>Group B Streptococcus (GBS)</strong></td><td>~40%</td><td>#1 cause overall. Prevented by IAP. Presents as sepsis, pneumonia, or meningitis.</td></tr>
<tr><td><strong>E. coli</strong></td><td>~25–30%</td><td>#1 cause in VLBW. K1 capsule = meningitis. Increasing ampicillin resistance (~50%).</td></tr>
<tr><td><strong>Listeria monocytogenes</strong></td><td>~5%</td><td>Maternal exposure (unpasteurized dairy, deli meats). Presents like GBS. Treat with ampicillin (NOT cephalosporins).</td></tr>
<tr><td><strong>Other Gram-negatives</strong></td><td>~10%</td><td>Klebsiella, Enterobacter, H. influenzae (non-typeable)</td></tr>
<tr><td><strong>Other Gram-positives</strong></td><td>~5–10%</td><td>Enterococcus, S. pneumoniae, viridans strep</td></tr>
</tbody></table>`,
t2:`<p><strong>AAP 2023 Clinical Report — Three Acceptable Approaches for EOS Risk Assessment in Infants ≥34 Weeks:</strong></p>
<table class="dt"><thead><tr><th>Approach</th><th>Method</th><th>Pros</th><th>Cons</th></tr></thead><tbody>
<tr><td><strong>1. Categorical Risk Factor</strong></td><td>Evaluate/treat based on presence of specific risk factors (chorioamnionitis, inadequate IAP, etc.)</td><td>Simple, familiar, widely used</td><td>Overtreats many well-appearing infants; up to 5–15% of births evaluated</td></tr>
<tr><td><strong>2. Multivariate Risk Calculator (Kaiser EOS Calc)</strong></td><td>Uses GA, maternal temp, GBS status, ROM duration, type of IAP → calculates individual EOS risk</td><td>More precise; reduces unnecessary evaluations by 40–60%</td><td>Requires serial clinical exams at 6, 12, 24h; cannot be used if antibiotics already given</td></tr>
<tr><td><strong>3. Clinical Condition at Birth</strong></td><td>Observe ALL infants; intervene only for clinical illness</td><td>Most conservative; least intervention in well-appearing infants</td><td>Requires robust serial examination infrastructure; may delay treatment in subtle presentations</td></tr>
</tbody></table>
<div class="bx bb">ℹ️ <strong>All three approaches are acceptable per AAP 2023.</strong> The Kaiser EOS Calculator and enhanced clinical observation reduce antibiotic exposure compared to the traditional categorical approach.</div>`,
t3:`<p><strong>EOS Empiric Antibiotic Regimen:</strong></p>
<table class="rt"><thead><tr><th>Regimen</th><th>Coverage</th><th>Dosing</th></tr></thead><tbody>
<tr><td><strong>Ampicillin + Gentamicin</strong></td><td>GBS, Listeria, most E. coli, Enterococcus</td><td>Amp: 50 mg/kg q12h (sepsis) or 100 mg/kg q8h (meningitis). Gent: 4–5 mg/kg q24–36h (check levels).</td></tr>
</tbody></table>
<p><strong>Key principles:</strong></p>
<ul><li>Ampicillin + gentamicin is the STANDARD first-line for EOS in all guidelines</li>
<li>Ampicillin covers GBS AND Listeria (cephalosporins do NOT cover Listeria)</li>
<li>Gentamicin provides synergy with ampicillin for GBS and covers most Gram-negatives</li>
<li>If meningitis suspected or confirmed: add cefotaxime (or ceftriaxone in term infants >7 days) for enhanced CNS penetration against Gram-negatives</li>
<li><strong>Duration if culture-negative at 36–48h + clinically well:</strong> STOP antibiotics. No benefit from prolonged empiric therapy. Prolonged antibiotics in culture-negative infants increase NEC, late-onset sepsis, and mortality risk.</li></ul>
<div class="bx br">🚨 <strong>Do NOT use ceftriaxone in neonates &lt;28 days or with hyperbilirubinemia.</strong> Ceftriaxone displaces bilirubin from albumin and can cause fatal kernicterus. Also forms precipitates with calcium-containing solutions.</div>`
},children:[
{name:"GBS Sepsis /\nPneumonia",icon:"🔵",type:"diagnosis",sub:"#1 EOS pathogen · IAP preventable",edge:"GBS+\nor unknown",
info:{tabs:["GBS Disease","IAP Guidelines","GBS Meningitis"],
t0:`<p><strong>GBS Early-Onset Disease:</strong></p>
<ul><li>Presents within first 24–48h (often within 6–12h)</li>
<li>Acquired from maternal GBS colonization during labor/delivery</li>
<li>Presentations: bacteremia without focus (~65%), pneumonia (~25%), meningitis (~10%)</li>
<li>GBS pneumonia: indistinguishable from RDS on chest X-ray (bilateral ground-glass opacities)</li>
<li>Mortality: ~2–3% overall; higher in preterm</li>
<li>Prevention: IAP with penicillin G or ampicillin ≥4h before delivery reduces EOS by ~80%</li></ul>`,
t1:`<p><strong>Intrapartum Antibiotic Prophylaxis (IAP) — 2019 ACOG/AAP Guidelines:</strong></p>
<p><strong>Indications for IAP:</strong></p>
<ul><li>Positive GBS screen (vaginal-rectal swab at 36–37 weeks)</li>
<li>GBS bacteriuria during current pregnancy</li>
<li>Previous infant with invasive GBS disease</li>
<li>Unknown GBS status AND any of: preterm labor &lt;37 wk, PROM ≥18h, intrapartum fever ≥38.0°C</li></ul>
<p><strong>Adequate IAP:</strong> Penicillin G 5M units IV then 2.5–3M q4h, OR Ampicillin 2g IV then 1g q4h, given ≥4 hours before delivery. Inadequate IAP = &lt;4 hours or no IAP given when indicated.</p>
<table class="rt"><thead><tr><th>Penicillin Allergy</th><th>Risk</th><th>Agent</th></tr></thead><tbody>
<tr><td>Low risk (rash only)</td><td>Low anaphylaxis</td><td>Cefazolin 2g IV then 1g q8h</td></tr>
<tr><td>High risk (anaphylaxis, angioedema)</td><td>High</td><td>Clindamycin 900mg IV q8h (if GBS susceptible) or Vancomycin 20mg/kg IV q8h</td></tr>
</tbody></table>`,
t2:`<p><strong>GBS Meningitis:</strong></p>
<ul><li>~10% of GBS EOS; higher proportion in LOS GBS</li>
<li>CSF: ↑ WBC (often >100/µL, neutrophil predominance), ↑ protein, ↓ glucose</li>
<li>Treatment: Ampicillin (100 mg/kg q8h for meningitis dosing) + Gentamicin × ≥14–21 days</li>
<li>Repeat LP at 24–48h to document CSF sterilization (especially for GBS meningitis)</li>
<li>Complications: cerebral abscess, ventriculitis, subdural empyema, hydrocephalus</li>
<li>Neuroimaging: MRI at 7–10 days and before discharge</li>
<li>Hearing screen before discharge (aminoglycoside exposure + meningitis risk)</li></ul>`
}},
{name:"E. coli / Gram-\nNegative Sepsis",icon:"🔴",type:"emergency",sub:"#1 in VLBW · K1 capsule = meningitis",edge:"Gram-neg\non culture",
info:{tabs:["E. coli EOS","Ampicillin Resistance","Gram-Neg Meningitis"],
t0:`<ul><li>#1 cause of EOS in VLBW infants; #2 overall after GBS</li>
<li>E. coli K1 capsular polysaccharide = meningitis-associated virulence factor</li>
<li>Mortality: 10–15% overall; up to 30–40% with meningitis</li>
<li>Increasing ampicillin resistance (~50% in many US centers)</li>
<li>Clinical presentation: often fulminant with rapid deterioration, shock, DIC</li></ul>`,
t1:`<p><strong>Ampicillin-Resistant E. coli:</strong></p>
<ul><li>~50% of neonatal E. coli isolates are ampicillin-resistant in US NICUs</li>
<li>This does NOT change empiric therapy — ampicillin + gentamicin remains first-line because gentamicin covers most resistant E. coli, and ampicillin is needed for GBS/Listeria</li>
<li>Once E. coli is identified and sensitivities are available, narrow to most appropriate agent</li>
<li>ESBL-producing E. coli: increasing concern; may require meropenem</li></ul>`,
t2:`<p><strong>Gram-Negative Meningitis Protocol:</strong></p>
<ol class="sl">
<li>Ampicillin + Cefotaxime (preferred over gentamicin for CNS penetration)</li>
<li>Repeat LP at 24–48h to document sterilization</li>
<li>If CSF NOT sterile at 48h → consider broadening coverage, evaluate for abscess/ventriculitis</li>
<li>Duration: minimum 21 days (or 21 days from first sterile CSF, whichever longer)</li>
<li>MRI brain at 7–10 days and before discharge</li>
<li>Monitor for complications: abscess (10–15%), ventriculitis, hydrocephalus, subdural collection</li>
</ol>
<div class="bx br">🚨 <strong>Gram-negative meningitis carries 20–30% mortality and >50% long-term neurologic morbidity.</strong> Early, aggressive therapy with CSF-penetrating antibiotics and serial LP monitoring is critical.</div>`
}}
]},
// ═══════ BRANCH 2: LATE-ONSET SEPSIS ═══════
{name:"Late-Onset\nSepsis (LOS)",icon:"🏥",type:"urgent",sub:"> 72 hours of life",edge:"> 72h\nof age",
info:{tabs:["Definition","Pathogens","Empiric Antibiotics","Prevention"],
t0:`<p><strong>Late-onset sepsis (LOS):</strong> systemic infection after 72 hours of life (some define >7 days). Incidence: 10–20% of VLBW NICU patients. Acquired nosocomially (NICU environment, central lines, GI tract translocation) or from the community.</p>
<p>LOS has different microbiology than EOS — Gram-positive organisms (especially CoNS) predominate in nosocomial LOS, while community-acquired LOS may be caused by GBS (late-late disease), E. coli, or other pathogens.</p>`,
t1:`<table class="dt"><thead><tr><th>Pathogen</th><th>% of LOS</th><th>Source</th><th>Key Features</th></tr></thead><tbody>
<tr><td><strong>CoNS (S. epidermidis)</strong></td><td>~40–50%</td><td>Skin/central lines</td><td>#1 overall. Often indolent. Can be contaminant — need 2 positive cultures or 1 culture + clinical signs. Low mortality (~2%) but high morbidity.</td></tr>
<tr><td><strong>S. aureus (MSSA/MRSA)</strong></td><td>~10–15%</td><td>Skin/lines/nares</td><td>More virulent than CoNS. Skin abscesses, osteomyelitis, endocarditis possible. MRSA requires vancomycin.</td></tr>
<tr><td><strong>E. coli / Klebsiella / Pseudomonas</strong></td><td>~15–20%</td><td>GI translocation/lines</td><td>Higher mortality (~15–20%). Often associated with NEC. MDR organisms increasing.</td></tr>
<tr><td><strong>Candida species</strong></td><td>~5–10%</td><td>GI/skin/lines</td><td>Highest mortality (~20–30%). Risk factors: extreme prematurity, prolonged Abx, TPN, central lines. Thrombocytopenia often precedes positive culture.</td></tr>
<tr><td><strong>Enterococcus</strong></td><td>~5%</td><td>GI tract</td><td>E. faecalis (ampicillin sensitive) and E. faecium (often VRE). Intrinsically resistant to cephalosporins.</td></tr>
<tr><td><strong>GBS (late-late)</strong></td><td>~5%</td><td>Mucosal colonization</td><td>Late GBS disease (7–89 days). Meningitis more common than in EOS. Not prevented by IAP.</td></tr>
</tbody></table>`,
t2:`<p><strong>LOS Empiric Antibiotic Regimen:</strong></p>
<table class="rt"><thead><tr><th>Regimen</th><th>Coverage</th><th>When</th></tr></thead><tbody>
<tr><td><strong>Vancomycin + Gentamicin</strong></td><td>MRSA, CoNS, Gram-negatives</td><td>Standard first-line for nosocomial LOS</td></tr>
<tr><td>Vancomycin + Cefepime</td><td>Above + Pseudomonas</td><td>If Pseudomonas concern (GI pathology, prior colonization)</td></tr>
<tr><td>Meropenem ± Vancomycin</td><td>Broadest (ESBL, Pseudomonas)</td><td>Fulminant sepsis, MDR organisms</td></tr>
<tr><td>+ Fluconazole or Amphotericin B</td><td>Candida</td><td>Extreme prematurity + lines + prolonged Abx + TPN</td></tr>
</tbody></table>
<p><strong>Duration:</strong></p>
<ul><li>Culture-negative at 36–48h + clinically well → STOP antibiotics</li>
<li>Bacteremia: 7–10 days from first negative culture</li>
<li>Meningitis: 14–21 days (Gram-pos) or 21+ days (Gram-neg)</li>
<li>Osteomyelitis/endocarditis: 4–6 weeks</li></ul>`,
t3:`<p><strong>LOS Prevention Bundle:</strong></p>
<ul><li><strong>Central line bundle:</strong> Hand hygiene, maximal barrier precautions at insertion, chlorhexidine skin prep (caution &lt;26 wk — skin injury), optimal site selection, daily reassessment of line necessity, prompt removal when no longer needed</li>
<li><strong>Antibiotic stewardship:</strong> Stop empiric antibiotics at 36–48h if culture-negative. Avoid prolonged empiric courses. Narrow spectrum based on culture data.</li>
<li><strong>Fluconazole prophylaxis:</strong> Consider for infants &lt;1000g birth weight in NICUs with high Candida rates (>5% invasive candidiasis incidence). 3–6 mg/kg twice weekly.</li>
<li><strong>Breast milk:</strong> Human milk reduces NEC and LOS risk. Prioritize maternal breast milk. Donor milk if unavailable.</li>
<li><strong>Skin-to-skin care:</strong> Kangaroo care reduces LOS risk</li>
<li><strong>Probiotics:</strong> Evidence supports reduction in NEC and possibly LOS in VLBW; not universally adopted in US</li></ul>`
},children:[
{name:"CoNS /\nS. aureus",icon:"🟣",type:"diagnosis",sub:"Gram-positive · Central line associated",edge:"Gram-pos\ncocci",
info:{tabs:["CoNS vs Contaminant","MRSA Management","CLABSI Evaluation"],
t0:`<p><strong>CoNS: pathogen or contaminant?</strong></p>
<table class="dt"><thead><tr><th>Feature</th><th>True Pathogen</th><th>Likely Contaminant</th></tr></thead><tbody>
<tr><td>Number of positive cultures</td><td>≥2 from separate sites or times</td><td>1 single culture</td></tr>
<tr><td>Clinical signs</td><td>Fever, feeding intolerance, apnea, bradycardia, metabolic instability</td><td>Well-appearing infant</td></tr>
<tr><td>Central line present</td><td>Yes (supports true infection)</td><td>May or may not have line</td></tr>
<tr><td>Time to positivity</td><td>&lt;24–36 hours</td><td>Often >36 hours</td></tr>
<tr><td>Inflammatory markers</td><td>CRP elevated, WBC changes</td><td>Normal CRP/WBC</td></tr>
</tbody></table>
<div class="bx bb">ℹ️ <strong>If in doubt, treat as real and reassess.</strong> A sick preterm infant with a CoNS-positive culture and central line should be treated as a true CLABSI until proven otherwise.</div>`,
t1:`<p><strong>MRSA Neonatal Sepsis:</strong></p>
<ul><li>Vancomycin is first-line for MRSA. Target trough 10–15 µg/mL (non-CNS) or 15–20 µg/mL (CNS).</li>
<li>AUC/MIC monitoring increasingly preferred over trough-based dosing</li>
<li>Evaluate for metastatic foci: skin abscesses, osteomyelitis, endocarditis (echocardiogram), deep-tissue abscess</li>
<li>Duration: minimum 14 days for S. aureus bacteremia. Longer if metastatic disease.</li>
<li>Consider linezolid if vancomycin failure or VISA/VRSA (extremely rare in neonates)</li></ul>`,
t2:`<p><strong>CLABSI Workup:</strong></p>
<ol class="sl">
<li>Blood cultures: both peripheral AND central line (calculate differential time-to-positivity: central >2h before peripheral = likely CLABSI)</li>
<li>CRP/PCT, CBC with differential</li>
<li>Evaluate line site for erythema, drainage, tenderness</li>
<li>If CLABSI confirmed: can attempt antibiotic lock therapy for CoNS with salvageable line. For S. aureus, Candida, or Gram-negatives: REMOVE THE LINE.</li>
<li>Repeat cultures 48–72h after antibiotics to document clearance</li>
</ol>`
}},
{name:"Candida /\nFungal Sepsis",icon:"🍄",type:"emergency",sub:"Highest mortality · Extreme preterm",edge:"Yeast on\nsmear/culture",
info:{tabs:["Risk Factors","Diagnosis","Treatment","Prophylaxis"],
t0:`<p><strong>Invasive candidiasis risk factors (nearly all required):</strong></p>
<ul><li>Extreme prematurity (&lt;28 weeks or &lt;1000g)</li>
<li>Central venous catheter in place</li>
<li>Prolonged broad-spectrum antibiotics (&gt;5–7 days)</li>
<li>TPN (glucose is a Candida growth substrate)</li>
<li>Postnatal corticosteroids</li>
<li>Abdominal surgery / NEC</li></ul>
<p><strong>Mortality: 20–30%.</strong> Neurodevelopmental impairment in 50%+ of survivors.</p>`,
t1:`<p><strong>Diagnostic workup when Candida suspected:</strong></p>
<ol class="sl">
<li><strong>Blood culture</strong> (may take 48–72h to grow; sensitivity only ~50%)</li>
<li><strong>Urine culture</strong> (catheterized) — renal candidiasis in 5–10%</li>
<li><strong>Thrombocytopenia</strong> (often the earliest lab finding — falling plts precede positive culture)</li>
<li><strong>CSF</strong> — LP recommended for ALL neonates with candidemia (CNS involvement in ~15%)</li>
<li><strong>Ophthalmologic exam</strong> — Candida endophthalmitis</li>
<li><strong>Renal US</strong> — fungal balls in collecting system</li>
<li><strong>Echocardiogram</strong> — fungal endocarditis (especially with central lines)</li>
</ol>`,
t2:`<p><strong>Treatment:</strong></p>
<ul><li><strong>First-line: Amphotericin B deoxycholate 1 mg/kg/day IV</strong> (preferred in neonates over lipid formulations for most infections)</li>
<li><strong>Alternative: Fluconazole 12 mg/kg/day IV</strong> (if isolate is susceptible; NOT for C. krusei or C. glabrata)</li>
<li><strong>Duration:</strong> Minimum 14 days after last positive blood culture AND resolution of all signs/symptoms</li>
<li><strong>REMOVE ALL CENTRAL LINES</strong> — essential for clearance. Do NOT attempt salvage.</li>
<li>Repeat cultures q48–72h until negative</li>
<li>End-organ evaluation: eye exam, renal US, echo, CSF</li></ul>
<div class="bx br">🚨 <strong>LINE REMOVAL IS NON-NEGOTIABLE.</strong> Candida forms biofilm on catheters. Antifungal therapy alone without line removal has significantly higher mortality and treatment failure.</div>`,
t3:`<p><strong>Fluconazole Prophylaxis:</strong></p>
<ul><li>Consider for infants &lt;1000g in NICUs with invasive candidiasis incidence >5%</li>
<li>Dose: 3–6 mg/kg IV/PO twice weekly during central line use or until 6 weeks of age</li>
<li>Evidence: multiple RCTs show 80–90% reduction in invasive candidiasis; NNT ~10</li>
<li>Concern: emergence of fluconazole-resistant Candida (C. parapsilosis resistance rising)</li>
<li>Monitor LFTs periodically</li></ul>`
}},
{name:"Gram-Negative\nLOS",icon:"⚠️",type:"urgent",sub:"E. coli, Klebsiella, Pseudomonas · NEC-associated",edge:"Gram-neg\nrods",
info:{tabs:["Common Organisms","MDR Concerns","NEC-Associated Sepsis"],
t0:`<table class="dt"><thead><tr><th>Organism</th><th>Source</th><th>Mortality</th><th>Notes</th></tr></thead><tbody>
<tr><td>E. coli</td><td>GI translocation, UTI</td><td>15–20%</td><td>K1 capsule = meningitis. ESBL increasingly common.</td></tr>
<tr><td>Klebsiella</td><td>GI tract, NICU environment</td><td>15–25%</td><td>High ESBL rates in many NICUs. Can cause outbreaks.</td></tr>
<tr><td>Pseudomonas</td><td>Environment, water, GI</td><td>30–50%</td><td>Highest Gram-neg mortality. Needs anti-pseudomonal coverage.</td></tr>
<tr><td>Enterobacter</td><td>GI tract</td><td>15–20%</td><td>Intrinsically resistant to cephalothin/cefazolin. Inducible AmpC β-lactamase.</td></tr>
<tr><td>Serratia</td><td>NICU environment</td><td>15–25%</td><td>Associated with outbreaks. Intrinsic AmpC resistance.</td></tr>
</tbody></table>`,
t1:`<p><strong>Multi-Drug Resistant (MDR) Gram-Negatives:</strong></p>
<ul><li><strong>ESBL producers (E. coli, Klebsiella):</strong> Resistant to 3rd-gen cephalosporins. Treat with meropenem.</li>
<li><strong>AmpC producers (Enterobacter, Serratia, Citrobacter):</strong> May develop resistance to 3rd-gen cephalosporins during therapy ("inducible AmpC"). Use 4th-gen cephalosporin (cefepime) or meropenem.</li>
<li><strong>CRE (carbapenem-resistant Enterobacteriaceae):</strong> Rare in neonates but increasing. May require novel agents (ceftazidime-avibactam, colistin).</li></ul>
<div class="bx bo">⚠️ <strong>Know your NICU's local antibiogram.</strong> Empiric regimens should be tailored to local resistance patterns. What works at one center may be inadequate at another.</div>`,
t2:`<p><strong>NEC-Associated Sepsis:</strong></p>
<ul><li>NEC is a major cause of late-onset Gram-negative sepsis in VLBW infants</li>
<li>Organisms: polymicrobial (E. coli, Klebsiella, Enterobacter, Enterococcus, anaerobes)</li>
<li>Falling platelets + abdominal distension + metabolic acidosis = NEC until proven otherwise</li>
<li>Empiric: vancomycin + meropenem (or pip-tazo) ± metronidazole (anaerobic coverage)</li>
<li>Surgical NEC (perforation): even broader coverage, surgical consultation</li></ul>`
}}
]},
// ═══════ BRANCH 3: NEONATAL HSV ═══════
{name:"Neonatal HSV",icon:"🔥",type:"emergency",sub:"EMERGENCY — acyclovir within 1 hour",edge:"Vesicles or\nHSV concern",
info:{tabs:["Classification","Diagnosis","Treatment","When to Suspect"],
t0:`<p><strong>Neonatal herpes simplex virus (HSV)</strong> = potentially devastating infection. Incidence: ~1/3,200 deliveries. Highest risk: primary maternal genital HSV near delivery (30–50% neonatal transmission vs &lt;2% with recurrent HSV).</p>
<p><strong>Three clinical presentations:</strong></p>
<table class="dt"><thead><tr><th>Type</th><th>% of Cases</th><th>Timing</th><th>Features</th><th>Mortality (untreated)</th></tr></thead><tbody>
<tr><td><strong>SEM</strong> (skin, eye, mouth)</td><td>~45%</td><td>5–14 days</td><td>Vesicular skin lesions, keratoconjunctivitis, oral ulcers</td><td>Low if treated; risk of dissemination if delayed</td></tr>
<tr><td><strong>CNS</strong></td><td>~30%</td><td>8–17 days</td><td>Seizures, lethargy, poor feeding, CSF pleocytosis, temporal lobe on MRI</td><td>~50% untreated; ~6% with acyclovir</td></tr>
<tr><td><strong>Disseminated</strong></td><td>~25%</td><td>5–12 days</td><td>Multi-organ failure: hepatitis (↑ ALT/AST), DIC, pneumonitis, shock. May or may NOT have skin vesicles.</td><td>~85% untreated; ~30% with acyclovir</td></tr>
</tbody></table>
<div class="bx br">🚨 <strong>39% of disseminated HSV have NO skin lesions at presentation.</strong> Absence of vesicles does NOT rule out neonatal HSV. Consider in any sepsis-like illness unresponsive to antibiotics.</div>`,
t1:`<p><strong>Diagnostic workup:</strong></p>
<ol class="sl">
<li><strong>HSV PCR</strong> (blood) — for disseminated disease</li>
<li><strong>HSV PCR</strong> (CSF) — for CNS disease. May be negative early; repeat at 3–5 days if initially negative but suspicion remains.</li>
<li><strong>Surface cultures/PCR</strong> — swabs from mouth, nasopharynx, conjunctivae, rectum, and any vesicle/skin lesion (viral culture or PCR)</li>
<li><strong>LFTs</strong> (ALT, AST) — markedly elevated in disseminated (can be >1000 U/L)</li>
<li><strong>Coagulation studies</strong> — DIC in disseminated</li>
<li><strong>CSF</strong> — pleocytosis (WBC >20, lymphocyte predominant), elevated protein, normal glucose, HSV PCR</li>
<li><strong>MRI brain</strong> — temporal lobe involvement classic for HSV encephalitis</li>
<li><strong>Ophthalmologic exam</strong> — HSV keratoconjunctivitis</li>
</ol>`,
t2:`<p><strong>Treatment — START IMMEDIATELY, do NOT wait for results:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Protocol</th></tr></thead><tbody>
<tr><td>Drug</td><td><strong>Acyclovir 20 mg/kg IV q8h</strong></td></tr>
<tr><td>SEM disease duration</td><td>14 days</td></tr>
<tr><td>CNS disease duration</td><td>21 days (repeat CSF HSV PCR near end; if still positive, continue until negative)</td></tr>
<tr><td>Disseminated duration</td><td>21 days (same as CNS)</td></tr>
<tr><td>Suppressive therapy</td><td>Oral acyclovir 300 mg/m²/dose TID × 6 months after IV course (for CNS and SEM disease — HERPET trial, Kimberlin et al., NEJM 2011)</td></tr>
</tbody></table>
<div class="bx bg">✓ <strong>Suppressive oral acyclovir for 6 months</strong> after IV treatment improved neurodevelopmental outcomes in CNS disease and reduced skin recurrences in SEM disease (HERPET trial). Monitor ANC — neutropenia is the main side effect.</div>`,
t3:`<p><strong>When to suspect neonatal HSV (even without vesicles):</strong></p>
<ul><li>Sepsis-like illness unresponsive to antibiotics at 24–48h</li>
<li>Unexplained liver failure / markedly elevated transaminases in a neonate</li>
<li>DIC + hepatitis + shock in first 2 weeks of life</li>
<li>CSF pleocytosis (especially lymphocytic) with negative bacterial cultures</li>
<li>Seizures in a term infant without an obvious cause</li>
<li>Vesicular skin lesions at ANY time in the first month</li>
<li>Maternal history of genital herpes (but often no history — 60–80% of mothers of HSV-infected neonates have NO known HSV history)</li></ul>
<div class="bx br">🚨 <strong>START ACYCLOVIR EMPIRICALLY.</strong> Do not wait for PCR results. If HSV is on the differential, start acyclovir 20 mg/kg IV q8h immediately. The cost of missing neonatal HSV is catastrophic.</div>`
},children:[
{name:"SEM Disease",icon:"💧",type:"action",sub:"Skin/eye/mouth · Acyclovir 14 days",edge:"Vesicles\nonly",
info:{tabs:["Management","Progression Risk"],
t0:`<ul><li>Vesicular skin lesions (clusters or scattered), keratoconjunctivitis, oral ulcers</li>
<li>Acyclovir 20 mg/kg IV q8h × 14 days</li>
<li>Followed by oral acyclovir 300 mg/m² TID × 6 months</li>
<li>Ophthalmology consult for eye involvement (topical trifluridine or ganciclovir gel)</li>
<li>Monitor ANC during oral suppressive therapy</li></ul>`,
t1:`<div class="bx bo">⚠️ <strong>SEM disease can progress to CNS or disseminated disease if treatment is delayed.</strong> 70% of SEM will progress without acyclovir. Early treatment has dramatically reduced mortality and progression.</div>`
}},
{name:"CNS / \nDisseminated",icon:"🧠",type:"emergency",sub:"Acyclovir 21 days · High mortality",edge:"Seizures, hepatitis,\nshock, or DIC",
info:{tabs:["CNS Disease","Disseminated Disease","Monitoring"],
t0:`<ul><li>Seizures (focal or generalized), lethargy, poor feeding, irritability, bulging fontanelle</li>
<li>CSF: pleocytosis, elevated protein, HSV PCR positive (may be negative early — repeat at 3–5 days)</li>
<li>MRI: temporal lobe involvement classic; may also show diffuse cerebral edema</li>
<li>Acyclovir 20 mg/kg IV q8h × 21 days</li>
<li>Repeat CSF HSV PCR near end of therapy — if still positive, continue IV acyclovir until negative</li>
<li>Oral suppressive acyclovir × 6 months after IV course</li></ul>`,
t1:`<ul><li><strong>Multi-organ failure:</strong> hepatitis (ALT/AST >1000), DIC, pneumonitis, adrenal hemorrhage, shock</li>
<li>Skin vesicles present in only ~60% — <strong>absence does NOT exclude disseminated HSV</strong></li>
<li>Acyclovir 20 mg/kg IV q8h × 21 days</li>
<li>Aggressive supportive care: mechanical ventilation, pressors, blood products for DIC</li>
<li>Mortality: ~30% even with acyclovir; >85% without treatment</li></ul>`,
t2:`<p><strong>Monitoring during and after treatment:</strong></p>
<ul><li>Renal function (Cr, BUN) — acyclovir can cause crystalline nephropathy; ensure adequate hydration</li>
<li>ANC — monitor weekly during IV, then monthly during oral suppression. Hold if ANC &lt;500.</li>
<li>Repeat CSF HSV PCR at end of 21-day IV course (for CNS/disseminated)</li>
<li>Ophthalmologic exam at diagnosis and follow-up</li>
<li>Hearing screen</li>
<li>Neurodevelopmental follow-up for CNS disease</li></ul>`
}}
]},
// ═══════ BRANCH 4: TORCH / CONGENITAL INFECTIONS ═══════
{name:"TORCH /\nCongenital Infections",icon:"🤰",type:"decision",sub:"In utero acquired infections",edge:"Congenital\ninfection\nconcern",
info:{tabs:["Overview","When to Evaluate","TORCH Workup","Key Differences"],
t0:`<p><strong>TORCH</strong> = Toxoplasmosis, Other (syphilis, varicella, parvovirus B19, Zika), Rubella, Cytomegalovirus, Herpes simplex. These infections are acquired in utero (transplacentally) and can cause a spectrum of congenital anomalies, growth restriction, and chronic disease.</p>
<p><strong>Common clinical features across TORCH infections:</strong> SGA/IUGR, hepatosplenomegaly, jaundice (direct hyperbilirubinemia), thrombocytopenia, petechiae/purpura ("blueberry muffin" rash), microcephaly, intracranial calcifications, chorioretinitis, sensorineural hearing loss.</p>`,
t1:`<p><strong>Evaluate for congenital infection when:</strong></p>
<ul><li>SGA/IUGR without other explanation (especially symmetric IUGR)</li>
<li>Hepatosplenomegaly at birth</li>
<li>Direct (conjugated) hyperbilirubinemia</li>
<li>Thrombocytopenia ± petechiae/purpura at birth</li>
<li>Microcephaly or intracranial calcifications on prenatal US</li>
<li>Hydrops fetalis</li>
<li>Maternal seroconversion or known exposure during pregnancy</li>
<li>Abnormal ophthalmologic exam (chorioretinitis)</li>
<li>"Blueberry muffin" rash (dermal extramedullary hematopoiesis)</li></ul>`,
t2:`<p><strong>Standard TORCH Workup:</strong></p>
<ol class="sl">
<li><strong>CMV urine PCR</strong> (within 21 days of birth — after 21 days, cannot distinguish congenital from postnatal acquisition)</li>
<li><strong>RPR/VDRL</strong> (maternal AND infant) + <strong>treponemal test</strong> (FTA-ABS IgM if available)</li>
<li><strong>Toxoplasma IgM and IgG</strong> (infant serum) + PCR if available</li>
<li><strong>Rubella IgM</strong> (infant serum)</li>
<li><strong>HSV PCR</strong> (blood and surface swabs) if clinical concern</li>
<li><strong>Parvovirus B19 PCR</strong> if hydrops or severe anemia</li>
<li><strong>Head CT or MRI</strong> — intracranial calcifications, ventriculomegaly, structural anomalies</li>
<li><strong>Ophthalmologic exam</strong> — chorioretinitis</li>
<li><strong>Hearing screen</strong> (ABR preferred over OAE for congenital infections)</li>
<li><strong>LFTs, CBC with diff, total/direct bilirubin</strong></li>
</ol>`,
t3:`<table class="dt"><thead><tr><th>Infection</th><th>Calcifications</th><th>Hearing Loss</th><th>Eye Findings</th><th>Unique Features</th></tr></thead><tbody>
<tr><td><strong>CMV</strong></td><td>Periventricular</td><td>YES (progressive)</td><td>Chorioretinitis</td><td>#1 congenital infection; microcephaly; petechiae</td></tr>
<tr><td><strong>Toxo</strong></td><td>Diffuse/scattered</td><td>Rare</td><td>Chorioretinitis (macular)</td><td>Classic triad: hydrocephalus, chorioretinitis, calcifications</td></tr>
<tr><td><strong>Rubella</strong></td><td>Rare</td><td>YES</td><td>Cataracts, glaucoma</td><td>Cardiac (PDA, PS), "blueberry muffin"</td></tr>
<tr><td><strong>Syphilis</strong></td><td>No</td><td>YES (late)</td><td>Rare neonatal</td><td>Rhinitis (snuffles), hepatitis, osteochondritis, rash</td></tr>
<tr><td><strong>HSV</strong></td><td>Rare (temporal)</td><td>Possible</td><td>Keratoconjunctivitis</td><td>Vesicles, hepatitis, DIC (see HSV branch)</td></tr>
<tr><td><strong>Zika</strong></td><td>Subcortical</td><td>Possible</td><td>Macular scarring</td><td>Severe microcephaly, arthrogryposis</td></tr>
</tbody></table>`
},children:[
{name:"Congenital\nCMV",icon:"🔬",type:"diagnosis",sub:"#1 congenital infection · Urine PCR <21 days",edge:"CMV urine\nPCR +",
info:{tabs:["Epidemiology","Symptomatic vs Asymptomatic","Treatment","Hearing"],
t0:`<ul><li><strong>#1 congenital infection worldwide:</strong> ~0.5–1% of all live births (30,000–40,000/year in US)</li>
<li>~10–15% symptomatic at birth; ~85–90% asymptomatic at birth</li>
<li>Of asymptomatic: ~10–15% will develop SNHL by age 5 years</li>
<li>CMV is the #1 non-genetic cause of sensorineural hearing loss in children</li>
<li><strong>Diagnosis must be made within 21 days of birth</strong> (CMV urine or saliva PCR). After 21 days, cannot distinguish congenital from postnatal acquisition.</li></ul>`,
t1:`<p><strong>Symptomatic (~10–15% at birth):</strong> petechiae, hepatosplenomegaly, jaundice (direct), thrombocytopenia, microcephaly, periventricular calcifications, IUGR/SGA, chorioretinitis, SNHL.</p>
<p><strong>Asymptomatic (~85–90%):</strong> Normal exam at birth but at risk for late-onset SNHL (10–15%) and developmental delays. Identified by universal CMV screening (increasingly adopted in US states) or triggered by failed hearing screen.</p>`,
t2:`<p><strong>Treatment (for symptomatic congenital CMV):</strong></p>
<ul><li><strong>Valganciclovir 16 mg/kg PO BID × 6 months</strong> (CASG trial, Kimberlin et al., NEJM 2015)</li>
<li>Start within first month of life for best outcomes</li>
<li>Improved hearing and neurodevelopmental outcomes at 12 and 24 months vs placebo</li>
<li><strong>Monitor:</strong> CBC (neutropenia is the main toxicity — occurs in ~20%; hold if ANC &lt;500), LFTs monthly, CMV viral load</li>
<li>Treatment for asymptomatic CMV with isolated SNHL: increasingly considered but evidence is evolving. Discuss with ID.</li></ul>
<div class="bx bg">✓ <strong>Multiple US states now mandate universal CMV screening</strong> (Minnesota, Utah, Connecticut, others). Positive newborn hearing screen should trigger CMV testing within 21 days of birth.</div>`,
t3:`<p><strong>Hearing surveillance:</strong></p>
<ul><li>ABR at birth (preferred over OAE — higher sensitivity for neural hearing loss)</li>
<li>Audiologic follow-up every 3–6 months until age 3, then annually until age 6</li>
<li>Congenital CMV hearing loss can be PROGRESSIVE and LATE-ONSET (appear months to years after birth)</li>
<li>Even asymptomatic congenital CMV carries 10–15% risk of SNHL</li></ul>`
}},
{name:"Congenital\nSyphilis",icon:"🔴",type:"emergency",sub:"Rising incidence · CDC 2024 guidelines",edge:"RPR/VDRL +\nor maternal hx",
info:{tabs:["Epidemiology","Clinical Features","CDC Evaluation","Treatment"],
t0:`<p><strong>Congenital syphilis is SURGING in the US:</strong></p>
<ul><li>CDC 2023 data: ~3,882 cases, a >900% increase since 2012</li>
<li>Driven by: inadequate prenatal care, maternal substance use disorder, lack of timely testing and treatment</li>
<li>Preventable with maternal screening and penicillin treatment during pregnancy</li>
<li><strong>All pregnant women should be screened at first prenatal visit.</strong> Re-screen at 28 weeks and delivery in high-risk populations.</li></ul>`,
t1:`<p><strong>Early congenital syphilis (first 2 years):</strong></p>
<ul><li>Rhinitis ("snuffles") — earliest sign, often bloody/purulent nasal discharge</li>
<li>Maculopapular rash (palms and soles), condylomata lata</li>
<li>Hepatosplenomegaly, hepatitis (↑ direct bili, ↑ transaminases)</li>
<li>Thrombocytopenia, anemia (Coombs-negative hemolysis)</li>
<li>Osteochondritis/periostitis on long bone X-rays (metaphyseal changes)</li>
<li>Generalized lymphadenopathy</li>
<li>Nephrotic syndrome</li>
<li>Pseudoparalysis (Parrot paralysis — painful limb movement from periostitis)</li></ul>`,
t2:`<p><strong>CDC 2024 Evaluation Scenarios:</strong></p>
<table class="dt"><thead><tr><th>Scenario</th><th>Infant Evaluation</th><th>Treatment</th></tr></thead><tbody>
<tr><td>Mother adequately treated >30 days before delivery + infant well + nontreponemal titer &lt;4× maternal</td><td>Physical exam; RPR/VDRL</td><td>Benzathine penicillin G 50,000 U/kg IM × 1 dose</td></tr>
<tr><td>Mother inadequately treated or treated &lt;30 days before delivery</td><td>Full evaluation: RPR, CBC, LFTs, CSF-VDRL, long bone X-rays</td><td>Aqueous crystalline penicillin G 50,000 U/kg IV q12h (≤7 days) or q8h (>7 days) × 10 days</td></tr>
<tr><td>Mother untreated or treatment unknown</td><td>Full evaluation (same as above)</td><td>Aqueous crystalline penicillin G 50,000 U/kg IV × 10 days</td></tr>
<tr><td>Infant with clinical/lab/radiographic evidence of disease</td><td>Full evaluation + any additional as indicated</td><td>Aqueous crystalline penicillin G 50,000 U/kg IV × 10 days</td></tr>
</tbody></table>`,
t3:`<p><strong>Treatment details:</strong></p>
<ul><li><strong>Aqueous crystalline penicillin G:</strong> 50,000 units/kg IV q12h (age ≤7 days) or q8h (age >7 days) × 10 days</li>
<li><strong>Alternative:</strong> Procaine penicillin G 50,000 units/kg IM daily × 10 days (if adherence to IV regimen cannot be ensured)</li>
<li><strong>Follow-up:</strong> Nontreponemal titers (RPR/VDRL) at 2, 4, 6, and 12 months. Titers should decline and become nonreactive by 6–12 months. If not declining → re-evaluate and re-treat.</li>
<li>If CSF abnormalities: repeat LP at 6 months. Reactive CSF-VDRL or persistent pleocytosis → re-treat.</li></ul>
<div class="bx br">🚨 <strong>Congenital syphilis is 100% preventable</strong> with prenatal screening and maternal treatment. Every missed case represents a healthcare system failure. Screen early, screen often in high-risk populations.</div>`
}},
{name:"Toxoplasmosis /\nRubella / Other",icon:"🔍",type:"diagnosis",sub:"Toxo triad · Rubella cardiac · Zika microcephaly",edge:"Other TORCH\nserologies",
info:{tabs:["Toxoplasmosis","Rubella","Zika","Parvovirus B19"],
t0:`<p><strong>Congenital Toxoplasmosis:</strong></p>
<ul><li>Caused by Toxoplasma gondii (cat feces, undercooked meat, contaminated soil)</li>
<li><strong>Classic triad:</strong> hydrocephalus, chorioretinitis, diffuse intracranial calcifications</li>
<li>Most infants (70–90%) are asymptomatic at birth but develop sequelae later (chorioretinitis, developmental delay, hearing loss)</li>
<li><strong>Diagnosis:</strong> Toxoplasma IgM and IgA (infant); IgG avidity; PCR (blood, CSF)</li>
<li><strong>Treatment:</strong> Pyrimethamine + sulfadiazine + leucovorin × 12 months (even if asymptomatic at birth). Improves outcomes significantly.</li>
<li>Add folinic acid (leucovorin) to prevent marrow suppression from pyrimethamine</li></ul>`,
t1:`<p><strong>Congenital Rubella Syndrome (CRS):</strong></p>
<ul><li>Rare in US due to vaccination, but occurs in unvaccinated populations</li>
<li><strong>Classic triad:</strong> sensorineural deafness, cardiac defects (PDA, peripheral PS), cataracts/glaucoma</li>
<li>Other: "blueberry muffin" rash, hepatosplenomegaly, thrombocytopenia, microcephaly, meningoencephalitis</li>
<li>Highest risk: maternal infection in first trimester (>80% fetal infection rate with >85% risk of defects)</li>
<li>Diagnosis: rubella IgM (infant), viral culture (nasopharynx, urine)</li>
<li>Treatment: supportive (no antiviral). Infants can shed virus for months — isolation precautions.</li>
<li><strong>Prevention:</strong> MMR vaccination (contraindicated in pregnancy; women should wait 4 weeks after vaccination before conceiving)</li></ul>`,
t2:`<p><strong>Congenital Zika Syndrome:</strong></p>
<ul><li>Severe microcephaly with partially collapsed skull</li>
<li>Thin cerebral cortex, subcortical calcifications</li>
<li>Macular scarring, focal pigmentary changes</li>
<li>Congenital contractures (arthrogryposis)</li>
<li>Marked neurologic impairment</li>
<li>Diagnosis: Zika virus PCR (infant blood/urine), IgM serology</li>
<li>Treatment: supportive. No antiviral available.</li></ul>`,
t3:`<p><strong>Congenital Parvovirus B19:</strong></p>
<ul><li>Tropism for erythroid precursors → severe fetal anemia → hydrops fetalis</li>
<li>Greatest risk: maternal infection at 13–20 weeks gestation</li>
<li>Fetal loss rate: ~5–9% with maternal infection</li>
<li>Hydrops: diagnosed prenatally on US (ascites, pleural effusions, skin edema)</li>
<li>Treatment: intrauterine transfusion for fetal hydrops. Neonatal: supportive + pRBC transfusion if anemic.</li>
<li>Most survivors do well with appropriate management</li></ul>`
}}
]},
// ═══════ BRANCH 5: MENINGITIS ═══════
{name:"Neonatal\nMeningitis",icon:"🧠",type:"emergency",sub:"LP for all confirmed bacteremia",edge:"Meningitis\nsuspected",
info:{tabs:["When to LP","CSF Interpretation","Treatment by Organism","Complications"],
t0:`<p><strong>Indications for lumbar puncture in neonates:</strong></p>
<ul><li>All infants with confirmed bacteremia (positive blood culture) — meningitis coexists in ~15–25%</li>
<li>Clinical signs of meningitis: seizures, bulging fontanelle, altered mental status, irritability/lethargy disproportionate to systemic illness</li>
<li>Critically ill infants with suspected sepsis (if stable enough for LP)</li>
<li>Abnormal inflammatory markers with clinical concern</li></ul>
<p><strong>When to DEFER LP:</strong></p>
<ul><li>Hemodynamically unstable — stabilize first, then LP ASAP</li>
<li>Thrombocytopenia &lt;50K or coagulopathy — correct first if possible</li>
<li>Start empiric meningitis-dose antibiotics WITHOUT LP if LP must be deferred. Do NOT delay antibiotics waiting for LP.</li></ul>`,
t1:`<table class="rt"><thead><tr><th>CSF Parameter</th><th>Normal Term</th><th>Normal Preterm</th><th>Bacterial Meningitis</th></tr></thead><tbody>
<tr><td>WBC</td><td>&lt;20–30/µL</td><td>&lt;30/µL</td><td>Usually >100/µL (neutrophil predominant)</td></tr>
<tr><td>Protein</td><td>&lt;150 mg/dL</td><td>&lt;200 mg/dL</td><td>Usually >200 mg/dL</td></tr>
<tr><td>Glucose</td><td>>50% of serum</td><td>>50% of serum</td><td>&lt;50% of serum (often &lt;30 mg/dL)</td></tr>
<tr><td>Gram stain</td><td>No organisms</td><td>No organisms</td><td>Positive in ~60–80%</td></tr>
<tr><td>Culture</td><td>No growth</td><td>No growth</td><td>Positive in 80–90%</td></tr>
</tbody></table>
<div class="bx bo">⚠️ <strong>Traumatic LP (bloody tap) complicates interpretation.</strong> Correction formula: subtract 1 WBC for every 500–1000 RBCs. Send CSF for culture regardless — a bloody CSF can still grow organisms. Also send HSV PCR and enteroviral PCR when indicated.</div>`,
t2:`<table class="dt"><thead><tr><th>Organism</th><th>Antibiotic</th><th>Duration</th><th>Special Notes</th></tr></thead><tbody>
<tr><td><strong>GBS</strong></td><td>Amp 100mg/kg q8h + Gent (synergy)</td><td>14–21 days</td><td>Repeat LP at 24–48h for sterilization</td></tr>
<tr><td><strong>E. coli / Gram-neg</strong></td><td>Cefotaxime + Amp (or Gent)</td><td>≥21 days (or 21d from first sterile CSF)</td><td>Repeat LP at 48h. If not sterile → broaden. MRI at 7–10d.</td></tr>
<tr><td><strong>Listeria</strong></td><td>Amp + Gent</td><td>≥21 days</td><td>Listeria is NOT covered by cephalosporins</td></tr>
<tr><td><strong>S. aureus</strong></td><td>Nafcillin or Vanc (if MRSA)</td><td>21–28 days</td><td>Evaluate for endocarditis, osteomyelitis</td></tr>
<tr><td><strong>Candida</strong></td><td>Amphotericin B + flucytosine</td><td>≥21 days after CSF sterilization</td><td>Remove ALL central lines</td></tr>
</tbody></table>`,
t3:`<p><strong>Complications of neonatal meningitis:</strong></p>
<ul><li><strong>Brain abscess:</strong> 10–15% of Gram-neg meningitis. Suspect if CSF not sterilizing or clinical deterioration. Diagnosis: MRI with contrast. May require neurosurgical drainage.</li>
<li><strong>Ventriculitis:</strong> Infection of the ventricular system. Suspect if poor clinical response. May need intraventricular antibiotics.</li>
<li><strong>Subdural effusion/empyema:</strong> Suspect if enlarging head circumference, bulging fontanelle, or persistent fever.</li>
<li><strong>Hydrocephalus:</strong> From inflammatory obstruction. Serial HC measurements and cranial US.</li>
<li><strong>SNHL:</strong> Hearing screen before discharge and at follow-up.</li>
<li><strong>Neurodevelopmental impairment:</strong> 20–50% of survivors of bacterial meningitis. Long-term developmental follow-up essential.</li></ul>
<div class="bx bp">🔬 <strong>ALL neonates with bacterial meningitis need:</strong> repeat LP at 24–48h, neuroimaging (MRI preferred), hearing evaluation, and long-term neurodevelopmental follow-up.</div>`
},children:[
{name:"LP Interpretation\n& Management",icon:"📋",type:"action",sub:"Repeat LP at 24–48h · MRI at 7–10d",edge:"CSF\nobtained",
info:{tabs:["Interpreting Results","Serial LP Protocol"],
t0:`<p><strong>CSF Result Interpretation:</strong></p>
<ul><li>WBC >30 with neutrophil predominance + low glucose + high protein = strongly suggestive of bacterial meningitis</li>
<li>Lymphocytic pleocytosis with normal glucose = consider viral (enterovirus, HSV) or partially treated bacterial</li>
<li>Xanthochromia or elevated RBCs = traumatic tap vs subarachnoid hemorrhage</li>
<li>Normal CSF does NOT completely exclude meningitis if LP was performed early or infant was pretreated with antibiotics</li></ul>
<div class="bx bb">ℹ️ <strong>Send CSF for:</strong> cell count/diff, protein, glucose, Gram stain, bacterial culture, AND HSV PCR if any clinical concern for HSV. Also consider enteroviral PCR if viral meningitis is in the differential.</div>`,
t1:`<ol class="sl">
<li>Initial LP at time of sepsis evaluation</li>
<li>Repeat LP at 24–48h after starting antibiotics to document CSF sterilization</li>
<li>If CSF NOT sterile at 48h: broaden antibiotic coverage, obtain MRI brain with contrast (evaluate for abscess, ventriculitis, empyema)</li>
<li>End-of-treatment LP: consider for Gram-negative meningitis to confirm sterilization before stopping antibiotics</li>
<li>MRI brain at 7–10 days of treatment and before discharge</li>
</ol>`
}}
]}
]
};
