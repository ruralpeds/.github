// Pediatric Emergency Medicine Textbook Data
// Auto-generated from textbook content — Volume I & II chapters + appendices
// This module provides structured textbook content for the Textbook tab

export const textbookMeta = {
    title: 'Pediatric Emergency Medicine in the Rural Emergency Department',
    subtitle: 'A Comprehensive Physician Education Guide to Stabilization and Management of Critical Pediatric Illness in the First 24 Hours Prior to Transfer',
    year: 2025,
    disclaimer: 'FOR PHYSICIAN EDUCATION PURPOSES — This guide is intended as an educational reference and does not replace clinical judgment, institutional protocols, or consultation with pediatric specialists.',
};

export const chapters = [
  {
    id: 'ch01',
    number: '1',
    title: `Introduction — Pediatric Emergency Care in the Rural Setting`,
    sections: [
      {
        id: '1.1',
        heading: `The Challenge of Rural Pediatric Emergency Medicine`,
        content_html: `<p>Pediatric emergencies represent a disproportionate challenge for rural and Critical Access Hospital (CAH) emergency departments. Children comprise approximately 20–30% of all emergency department visits nationwide, yet rural EDs often see critically ill children infrequently — sometimes only a handful of true pediatric emergencies per year. This low volume creates a dangerous expertise gap: physicians and nurses who are highly competent in adult emergency medicine may lack the confidence, muscle memory, and cognitive frameworks needed to rapidly stabilize a critically ill child.</p>
<p>The consequences of this gap are measurable. Studies consistently demonstrate that children treated at non-pediatric-specialized facilities have higher rates of adverse events, medication errors, and delayed recognition of clinical deterioration. Rural facilities face compounding challenges including limited pediatric-specific equipment, lack of on-site subspecialty consultation, prolonged transport times to tertiary pediatric centers (often 60–180+ minutes by ground or air), and staffing models that may not include providers with recent pediatric critical care experience.</p>
<p>This textbook is designed specifically for the rural emergency physician who must bridge that gap. Its scope is deliberately focused on the first 24 hours of care — the period from initial presentation through stabilization and transfer to a pediatric facility. The goal is not to replicate a PICU manual, but to provide the practical, evidence-based guidance needed to keep a critically ill child alive and physiologically optimized during what is often the most dangerous window of their illness.</p>`,
      },
      {
        id: '1.2',
        heading: `Scope and Philosophy of This Guide`,
        content_html: `<p>This guide covers the most common and most dangerous pediatric emergencies encountered in the rural ED, organized by organ system and disease process. Each chapter follows a consistent framework:</p>
<ul><li>Recognition: How to identify the condition quickly, including atypical presentations</li></ul>
<ul><li>Stabilization: Step-by-step management priorities in the first 60 minutes</li></ul>
<ul><li>Ongoing Management: Hour-by-hour care through the first 24 hours</li></ul>
<ul><li>Monitoring: What to watch for, how often, and what changes mandate escalation</li></ul>
<ul><li>Transfer Considerations: When to call, what information to transmit, and how to prepare for transport</li></ul>
<ul><li>Pitfalls and Pearls: Common errors specific to the rural setting and practical workarounds</li></ul>
<p>The philosophical approach is anchored in several principles:</p>
<ul><li><strong>Stabilize, do not diagnose prematurely.</strong> In the rural ED with limited diagnostics, the priority is physiologic stabilization. Treat what you can identify and support what you cannot yet define.</li></ul>
<ul><li><strong>Call early, call often.</strong> Pediatric critical care telemedicine and transfer center consultation should be activated at the earliest suspicion of a critically ill child, not after all local options have been exhausted.</li></ul>
<ul><li><strong>Weight-based precision matters.</strong> Pediatric medication errors are overwhelmingly dose-related. Every medication, fluid bolus, and equipment selection must be weight-based.</li></ul>
<ul><li><strong>Anticipate deterioration.</strong> Children compensate remarkably well until they decompensate catastrophically. The window between "looking okay" and cardiac arrest can be minutes.</li></ul>
<ul><li><strong>Families are your allies.</strong> Parents know their child. Their concern, even when you cannot yet identify the pathology, should be taken seriously.</li></ul>`,
      },
      {
        id: '1.3',
        heading: `How to Use This Guide`,
        content_html: `<p>Each clinical chapter is designed to be used in two ways. First, as a study resource for ongoing education — physicians should review chapters systematically to build and maintain cognitive frameworks for pediatric emergencies. Second, as a rapid reference during active resuscitations — key decision points, medication doses, and critical actions are highlighted in colored boxes throughout each chapter for quick scanning under pressure.</p>
<div class="alert alert-warning">CLINICAL PEARL Keep a printed copy of the Broselow tape reference, weight-based drug dosing sheets, and your facility’s pediatric transfer contact numbers physically attached to your resuscitation cart. In a crisis, scrolling through an app costs seconds you may not have.</div>`,
      },
      {
        id: '1.4',
        heading: `The Pediatric Assessment Triangle (PAT)`,
        content_html: `<p>The single most important tool for the rural emergency physician evaluating a potentially critically ill child is the Pediatric Assessment Triangle (PAT). This is a rapid, across-the-room assessment that takes 30–60 seconds and requires no equipment. It evaluates three domains:</p>
<table><thead><tr><th>Domain</th><th>What You Assess</th><th>Abnormal Findings</th></tr></thead><tbody><tr><td>Appearance (TICLS)</td><td>Tone, Interactiveness, Consolability, Look/Gaze, Speech/Cry</td><td>Limp, unresponsive to parents, inconsolable, glassy-eyed stare, weak or high-pitched cry</td></tr><tr><td>Work of Breathing</td><td>Respiratory rate/effort, airway sounds, positioning</td><td>Nasal flaring, retractions (intercostal, subcostal, suprasternal), grunting, tripod positioning, stridor, wheezing audible without stethoscope, head bobbing in infants</td></tr><tr><td>Circulation to Skin</td><td>Skin color, presence of bleeding</td><td>Pallor, mottling, cyanosis (central vs. peripheral), petechiae/purpura, diaphoresis</td></tr></tbody></table>
<p>The PAT generates a clinical impression that directs the urgency and type of intervention needed:</p>
<table><thead><tr><th>PAT Pattern</th><th>Appearance</th><th>Breathing</th><th>Circulation</th><th>Clinical Impression</th></tr></thead><tbody><tr><td>Stable</td><td>Normal</td><td>Normal</td><td>Normal</td><td>May still be ill, but compensating well</td></tr><tr><td>Respiratory Distress</td><td>Normal</td><td>Abnormal</td><td>Normal</td><td>Primary respiratory problem, child compensating</td></tr><tr><td>Respiratory Failure</td><td>Abnormal</td><td>Abnormal</td><td>Normal</td><td>Respiratory decompensation; imminent threat</td></tr><tr><td>Shock (Compensated)</td><td>Normal</td><td>Normal</td><td>Abnormal</td><td>Perfusion deficit; BP may still be normal</td></tr><tr><td>Shock (Decompensated)</td><td>Abnormal</td><td>Normal/Abnormal</td><td>Abnormal</td><td>Perfusion failure; hypotension likely</td></tr><tr><td>CNS/Metabolic</td><td>Abnormal</td><td>Normal</td><td>Normal</td><td>Primary neurologic or metabolic problem</td></tr><tr><td>Cardiopulmonary Failure</td><td>Abnormal</td><td>Abnormal</td><td>Abnormal</td><td>Arrest imminent; immediate intervention</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL POINT In pediatrics, hypotension is a late and ominous sign. By the time a child is hypotensive, they have lost 25–40% of their blood volume or are in severe distributive shock. Do not wait for hypotension to diagnose shock — tachycardia, delayed capillary refill (>3 seconds), altered mental status, and cool/mottled extremities are the early warning signs.</div>`,
      },
      {
        id: '1.5',
        heading: `Age-Based Vital Sign Reference`,
        content_html: `<p>Interpretation of pediatric vital signs requires age-specific norms. The following table provides reference ranges. Remember that fever, pain, crying, and anxiety all elevate heart rate and respiratory rate — always reassess after addressing these factors.</p>
<table><thead><tr><th>Age</th><th>Heart Rate</th><th>Respiratory Rate</th><th>Systolic BP (5th %ile)</th><th>Weight (est.)</th></tr></thead><tbody><tr><td>Neonate (0–28 days)</td><td>120–160</td><td>30–60</td><td>60 mmHg</td><td>3–4 kg</td></tr><tr><td>Infant (1–12 mo)</td><td>100–160</td><td>25–45</td><td>70 mmHg</td><td>4–10 kg</td></tr><tr><td>Toddler (1–3 yr)</td><td>90–150</td><td>20–30</td><td>70 + (age yr x 2)</td><td>10–15 kg</td></tr><tr><td>Preschool (4–5 yr)</td><td>80–140</td><td>20–25</td><td>70 + (age yr x 2)</td><td>15–20 kg</td></tr><tr><td>School Age (6–12 yr)</td><td>70–120</td><td>15–20</td><td>70 + (age yr x 2)</td><td>20–40 kg</td></tr><tr><td>Adolescent (13+ yr)</td><td>60–100</td><td>12–20</td><td>90 mmHg</td><td>40–70 kg</td></tr></tbody></table>
<div class="alert alert-warning">WEIGHT ESTIMATION In emergencies when an actual weight is unavailable: Use Broselow tape as first-line method. If unavailable, use the formula: Weight (kg) \\= (Age in years x 2) + 8 for children 1–10 years. For infants \\<1 year: (Age in months x 0.5) + 4\\. Always obtain an actual weight as soon as clinically feasible and recalculate all doses.</div>`,
      },
      {
        id: '1.6',
        heading: `The ABCDE Approach to Pediatric Stabilization`,
        content_html: `<p>Every critically ill child should be assessed and stabilized using the ABCDE framework. In the rural ED, this structured approach prevents the cognitive overload that leads to missed interventions.</p>
<h4>A — Airway</h4>
<p>Assess for patency: Is the child phonating? Is there stridor, gurgling, or snoring? Position the airway (sniffing position for infants, jaw thrust if trauma suspected). Suction as needed. If the airway is not maintainable with positioning and basic maneuvers, prepare for advanced airway management. In children, this decision must be made early — a child in respiratory failure will progress to arrest faster than an adult.</p>
<div class="alert alert-danger">AIRWAY CAUTION Pediatric airways differ from adult airways in critical ways: The larynx is more anterior and cephalad. The epiglottis is omega-shaped and floppy (especially in infants). The narrowest point in children under 8 years is the subglottic space (cricoid ring), not the vocal cords. The trachea is short — right mainstem intubation is common. Always confirm ETT placement with quantitative waveform capnography.</div>
<h4>B — Breathing</h4>
<p>Assess rate, effort, auscultatory findings, and oxygen saturation. Provide supplemental oxygen for SpO2 \\<94% (or \\<90% in some neonatal contexts). Key interventions: high-flow nasal cannula (HFNC), non-rebreather mask, bag-valve-mask (BVM) ventilation with appropriate-sized mask and pop-off valve awareness. For BVM, use the E-C clamp technique and ensure a good seal — the most common cause of failed BVM ventilation is an inadequate seal, not equipment failure.</p>
<h4>C — Circulation</h4>
<p>Assess heart rate, blood pressure, capillary refill time, skin color/temperature, and mental status. Establish IV/IO access. The first-line fluid bolus for most forms of pediatric shock is 20 mL/kg of isotonic crystalloid (NS or LR), given over 5–20 minutes depending on acuity, and reassessed after each bolus. If two boluses fail to produce clinical improvement, escalate to vasoactive support and consult pediatric critical care.</p>
<div class="alert alert-danger">IO ACCESS If IV access is not obtained within 90 seconds or two attempts in a critically ill child, proceed immediately to intraosseous (IO) access. The proximal tibia (anteromedial surface, 1–2 cm below the tibial tuberosity) is the preferred site in children of all ages. IO access provides a reliable route for all resuscitation medications and fluids.</div>
<h4>D — Disability (Neurologic Status)</h4>
<p>Rapid neurologic assessment includes AVPU (Alert, Verbal, Pain, Unresponsive), pupil size and reactivity, and blood glucose level. Glucose is a critical and frequently missed intervention in pediatric emergencies. Neonates and infants have minimal glycogen stores and become hypoglycemic rapidly during stress. Check point-of-care glucose on every critically ill child. Treat hypoglycemia immediately:</p>
<ul><li>Neonates: D10W at 2 mL/kg IV</li></ul>
<ul><li>Infants/Children: D25W at 2–4 mL/kg IV (or D10W at 5 mL/kg)</li></ul>
<ul><li>Adolescents: D50W at 1–2 mL/kg IV (max 25 g)</li></ul>
<h4>E — Exposure/Environment</h4>
<p>Fully expose the child to identify injuries, rashes (petechiae/purpura suggesting meningococcemia), signs of abuse, or other pathology. Then immediately cover and actively warm. Hypothermia is a lethal enemy in pediatric resuscitation — children have a high surface area-to-volume ratio and lose heat rapidly. Use warm blankets, overhead warmers, warm IV fluids, and keep the room temperature elevated. Hypothermia worsens coagulopathy, acidosis, and myocardial dysfunction.</p>`,
      },
      {
        id: '1.7',
        heading: `Transfer and Telemedicine Considerations`,
        content_html: `<p>The decision to transfer a critically ill child should be made early and revisited continuously. Rural emergency physicians should have a low threshold for activating transfer resources, as the logistics of pediatric transport (team dispatch, travel time, weather delays) can add 2–4+ hours to definitive care.</p>
<p>Key principles for transfer:</p>
<ol><li>Activate transfer as soon as you suspect a child may exceed your facility’s capability. Do not wait for diagnostic certainty.</li></ol>
<ol><li>Contact the receiving pediatric facility’s transfer center (not the general ED). Most children’s hospitals have a dedicated transfer coordination line.</li></ol>
<ol><li>Utilize pediatric telemedicine when available. Many children’s hospitals offer real-time video consultation with pediatric emergency medicine or PICU physicians.</li></ol>
<ol><li>Prepare a structured handoff: Use I-PASS or SBAR format. Include age, weight, presenting complaint, vital signs (include trends), interventions performed with timing and response, current infusions/drips, airway status, and working diagnosis.</li></ol>
<ol><li>Continue active stabilization and management during the transfer wait. The child’s condition may change and new interventions may be needed.</li></ol>
<ol><li>Prepare the child for transport: Secure all lines, confirm ETT position if intubated, ensure adequate sedation/analgesia, and prepare medications for the transport duration.</li></ol>
<div class="alert alert-warning">TRANSFER TIP Create a pre-formatted transfer checklist specific to your facility that includes: transport team contact numbers, helicopter landing zone coordinates/procedures, nearest children’s hospital transfer center numbers, standard handoff format, and a list of pediatric medications/equipment to send with the patient.</div>`,
      },
    ],
  },
  {
    id: 'ch02',
    number: '2',
    title: `Respiratory Emergencies`,
    sections: [
      {
        id: '2.1',
        heading: `Croup (Laryngotracheobronchitis)`,
        content_html: `<h4>Pathophysiology and Epidemiology</h4>
<p>Croup is a viral infection causing inflammation and edema of the subglottic airway. It is most commonly caused by parainfluenza viruses (types 1 and 3), though RSV, influenza, adenovirus, and human metapneumovirus can also be causative. Peak incidence occurs between 6 months and 3 years of age, with a seasonal predominance in fall and early winter. Boys are affected slightly more often than girls.</p>
<p>The pediatric subglottic space is the narrowest portion of the airway in children under 8 years. Even 1 mm of circumferential edema reduces the cross-sectional area by approximately 44% in an infant, compared to only about 20% in an adult. This explains why croup can be life-threatening in young children while being merely a nuisance in older patients.</p>
<h4>Clinical Presentation</h4>
<p>The classic presentation is a 1–3 day prodrome of rhinorrhea and low-grade fever, followed by the sudden onset of a barking, seal-like cough, hoarseness, and inspiratory stridor. Symptoms classically worsen at night. The Westley Croup Score is used to grade severity:</p>
<table><thead><tr><th>Feature</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4–5</th></tr></thead><tbody><tr><td>Stridor</td><td>None</td><td>With agitation</td><td>At rest</td><td>—</td><td>—</td></tr><tr><td>Retractions</td><td>None</td><td>Mild</td><td>Moderate</td><td>Severe</td><td>—</td></tr><tr><td>Air Entry</td><td>Normal</td><td>Decreased</td><td>Markedly decreased</td><td>—</td><td>—</td></tr><tr><td>Cyanosis</td><td>None</td><td>—</td><td>—</td><td>—</td><td>With agitation / At rest (4/5)</td></tr><tr><td>Level of Consciousness</td><td>Normal</td><td>—</td><td>—</td><td>—</td><td>— / Altered (5)</td></tr></tbody></table>
<p>Scoring: Mild (0–2), Moderate (3–5), Severe (6–11), Imminent respiratory failure (12–17).</p>
<h4>Management in the Rural ED</h4>
<p><strong>Mild Croup (Westley 0–2):</strong> Single dose of oral dexamethasone 0.6 mg/kg (max 16 mg). Observe for 2–4 hours. Most children can be discharged with return precautions if they demonstrate improvement and are tolerating oral fluids.</p>
<p><strong>Moderate Croup (Westley 3–5):</strong> Dexamethasone 0.6 mg/kg PO/IM/IV (max 16 mg) PLUS nebulized racemic epinephrine 0.5 mL of 2.25% solution in 3 mL NS (or L-epinephrine 0.5 mL/kg of 1:1000 solution, max 5 mL). Observe for minimum 2–4 hours after last epinephrine dose to monitor for rebound. If repeat epinephrine needed, consider admission.</p>
<p><strong>Severe Croup (Westley 6+):</strong> Dexamethasone 0.6 mg/kg IV/IM. Nebulized racemic epinephrine; may repeat every 15–20 minutes for up to 3 doses. Blow-by or humidified oxygen for hypoxemia. Minimize agitation (keep child with parent, avoid unnecessary procedures). If no improvement with repeated epinephrine, prepare for potential advanced airway. Consult pediatric critical care and initiate transfer.</p>
<div class="alert alert-danger">CRITICAL: CROUP RED FLAGS The following features suggest an alternative diagnosis or a critically severe presentation requiring immediate escalation: Drooling or difficulty swallowing (consider epiglottitis, retropharyngeal abscess), toxic appearance with high fever, no response to epinephrine treatments, rapid onset without prodrome, age \\<6 months or >6 years (atypical age raises concern for bacterial tracheitis, foreign body, or anatomic lesion).</div>
<div class="alert alert-warning">RURAL PEARL If nebulized racemic epinephrine is not available in your pharmacy, use standard L-epinephrine 1:1000 (1 mg/mL): dose is 0.5 mL/kg (max 5 mL) via nebulizer. This is equally effective and much more commonly stocked.</div>`,
      },
      {
        id: '2.2',
        heading: `Bronchiolitis`,
        content_html: `<h4>Pathophysiology and Epidemiology</h4>
<p>Bronchiolitis is the leading cause of hospitalization for infants under 12 months of age in the United States. It is caused by viral infection of the small airways (bronchioles), leading to inflammation, mucus production, and epithelial necrosis with resultant airway obstruction. Respiratory syncytial virus (RSV) is the most common cause, accounting for 50–80% of cases, but rhinovirus, human metapneumovirus, parainfluenza, influenza, and adenovirus are also implicated.</p>
<p>Peak season is November through March in temperate climates. The illness is most dangerous in infants under 3 months, premature infants, and those with congenital heart disease, chronic lung disease, or immunodeficiency.</p>
<h4>Clinical Presentation</h4>
<p>The typical course begins with 2–3 days of URI symptoms (rhinorrhea, cough, low-grade fever), followed by progressive lower respiratory tract involvement: tachypnea, wheezing, crackles, retractions, and feeding difficulty. The illness typically peaks in severity on days 3–5 and resolves over 1–2 weeks. Apnea may be the presenting sign in very young infants (\\<2 months), particularly in former premature infants.</p>
<h4>Risk Stratification</h4>
<p>Not all bronchiolitis requires hospitalization. The following features indicate higher acuity:</p>
<ul><li>Age \\<3 months (or \\<6 weeks — highest risk for apnea)</li></ul>
<ul><li>Gestational age \\<37 weeks</li></ul>
<ul><li>Hemodynamically significant congenital heart disease</li></ul>
<ul><li>Chronic lung disease or immunodeficiency</li></ul>
<ul><li>Sustained SpO2 \\<90–92% on room air</li></ul>
<ul><li>Significant respiratory distress (moderate-severe retractions, grunting, nasal flaring)</li></ul>
<ul><li>Dehydration or inability to maintain adequate oral hydration</li></ul>
<ul><li>Apneic episodes</li></ul>
<ul><li>Toxic appearance</li></ul>
<h4>Evidence-Based Management</h4>
<p>The 2014 AAP Clinical Practice Guideline (reaffirmed 2022) emphasizes supportive care. The evidence strongly supports the following approach:</p>
<p><strong>Effective interventions:</strong></p>
<ul><li>Nasal suctioning: Gentle bulb or catheter suctioning to clear the nares before feeds and when visibly obstructed. This is particularly important in obligate nose-breathing infants.</li></ul>
<ul><li>Supplemental oxygen: For sustained SpO2 \\<90%. The AAP guideline uses 90% as the threshold; many institutions use 90–92%. Intermittent desaturations during sleep in an otherwise well-appearing infant should not drive oxygen therapy.</li></ul>
<ul><li>IV or NG fluid hydration: When oral intake is insufficient (generally \\<50–75% of normal). Isotonic fluids (NS or LR) for boluses; D5 0.45% NS or D5 NS at maintenance rate for ongoing hydration.</li></ul>
<ul><li>High-Flow Nasal Cannula (HFNC): Increasingly used as a first-line respiratory support for moderate-severe bronchiolitis. Typical starting flow rates are 1–2 L/kg/min. HFNC provides mild CPAP effect, dead-space washout, and humidified/heated gas delivery. Studies demonstrate reduced rates of intubation and PICU transfer.</li></ul>
<p><strong>Interventions NOT recommended (no evidence of benefit):</strong></p>
<ul><li>Albuterol/salbutamol: No benefit in bronchiolitis. Viral bronchiolitis involves mucus plugging and edema, not bronchospasm. A trial is reasonable in the first episode of wheezing in an older infant (>6 months) with family history of atopy, but should be discontinued if no objective improvement is observed.</li></ul>
<ul><li>Systemic corticosteroids: No benefit in typical bronchiolitis. Do not prescribe routinely.</li></ul>
<ul><li>Antibiotics: Not indicated unless there is a documented concurrent bacterial infection.</li></ul>
<ul><li>Chest physiotherapy: Not effective and may increase distress.</li></ul>
<ul><li>Nebulized hypertonic saline: The AAP guideline recommends against use in the ED setting; may have modest benefit in inpatient stay >72 hours, but evidence is limited.</li></ul>
<div class="alert alert-info">APNEA ALERT Infants \\<6 weeks of age, those born at \\<37 weeks gestational age, and those with a history of apneic episodes are at significantly increased risk for apnea with bronchiolitis. These infants require continuous cardiorespiratory monitoring and should be managed in a setting with capability for emergent intubation. Transfer to a higher level of care should be strongly considered.</div>
<h4>HFNC Protocol for Rural EDs</h4>
<p>HFNC has become a game-changer for rural EDs managing bronchiolitis, as it can prevent the need for intubation and PICU-level care. Suggested protocol:</p>
<ol><li>Start at 2 L/kg/min (max 8–10 L/min for infants, up to 20–40 L/min for older children depending on device)</li></ol>
<ol><li>FiO2 starting at 0.30–0.50 to maintain SpO2 >90–92%</li></ol>
<ol><li>Reassess at 60–90 minutes: evaluate respiratory rate, work of breathing, SpO2, and heart rate</li></ol>
<ol><li>If improving: continue current settings; wean FiO2 first, then flow rate as tolerated</li></ol>
<ol><li>If not improving: increase flow to maximum device capability; if still deteriorating, prepare for escalation (CPAP or intubation) and initiate transfer</li></ol>
<ol><li>Failure criteria (initiate transfer and prepare for advanced intervention): RR not decreasing or increasing, persistent/worsening retractions, rising FiO2 requirement, desaturation events, apnea, altered mental status</li></ol>`,
      },
      {
        id: '2.3',
        heading: `Asthma Exacerbation`,
        content_html: `<h4>Epidemiology and Pathophysiology</h4>
<p>Asthma is the most common chronic disease of childhood, affecting approximately 6–8% of children in the United States. Acute exacerbations are a leading cause of pediatric ED visits and hospitalizations. In the rural setting, asthma management is complicated by limited access to subspecialty care, higher rates of poverty and environmental exposures (agricultural dust, smoke, mold), and longer distances from emergency care.</p>
<p>An acute exacerbation involves bronchospasm, airway inflammation, and mucus hypersecretion leading to progressive airflow obstruction. The physiologic consequences include air trapping, ventilation-perfusion mismatch, increased work of breathing, and in severe cases, respiratory muscle fatigue progressing to respiratory failure.</p>
<h4>Severity Assessment</h4>
<table><thead><tr><th>Parameter</th><th>Mild</th><th>Moderate</th><th>Severe</th><th>Imminent Arrest</th></tr></thead><tbody><tr><td>Mental Status</td><td>Normal, may be agitated</td><td>Agitated</td><td>Agitated or drowsy</td><td>Drowsy, confused</td></tr><tr><td>Speaks in</td><td>Sentences</td><td>Phrases</td><td>Words only</td><td>Unable to speak</td></tr><tr><td>Respiratory Rate</td><td>Mildly increased</td><td>Increased</td><td>Markedly increased</td><td>Paradoxical/slowing</td></tr><tr><td>Accessory Muscles</td><td>None</td><td>Some use</td><td>Severe retractions</td><td>Paradoxical breathing</td></tr><tr><td>Wheezing</td><td>End-expiratory</td><td>Throughout expiration</td><td>Inspiration + expiration</td><td>Absent (silent chest)</td></tr><tr><td>SpO2</td><td>>95%</td><td>90–95%</td><td>\\<90%</td><td>\\<90%</td></tr><tr><td>Peak Flow (if able)</td><td>>70% predicted</td><td>50–70%</td><td>\\<50%</td><td>Unable to perform</td></tr></tbody></table>
<div class="alert alert-info">SILENT CHEST A "silent chest" (absent wheezing) in a child with respiratory distress is an ominous sign indicating such severe bronchoconstriction that air movement is minimal. This child is in imminent respiratory arrest. Immediate aggressive intervention is required.</div>
<h4>Step-by-Step ED Management</h4>
<p><strong>First 0–15 minutes (all patients):</strong></p>
<ol><li>Continuous SpO2 monitoring. Supplemental O2 to maintain SpO2 >92%.</li></ol>
<ol><li>Albuterol 2.5 mg (if \\<20 kg) or 5 mg (if >20 kg) via nebulizer; or 4–8 puffs via MDI with spacer. In severe cases, use continuous nebulization: 10–15 mg/hour.</li></ol>
<ol><li>Ipratropium bromide 250–500 mcg nebulized, mixed with the first 3 albuterol treatments (every 20 minutes). No benefit beyond the first hour.</li></ol>
<ol><li>Systemic corticosteroids: Dexamethasone 0.6 mg/kg PO/IV/IM (max 16 mg) x1 dose OR Prednisolone 1–2 mg/kg PO (max 60 mg). Dexamethasone has the advantage of a single dose replacing a 5-day prednisone course.</li></ol>
<p><strong>If no improvement after initial hour (moderate-severe):</strong></p>
<ul><li>Continue albuterol q20 minutes or transition to continuous nebulization</li></ul>
<ul><li>Magnesium sulfate 25–75 mg/kg IV (max 2 g) over 20–30 minutes. This is a smooth muscle relaxant with good evidence for preventing hospitalization in severe asthma. Monitor for hypotension during infusion.</li></ul>
<ul><li>Consider IV access if not already established</li></ul>
<ul><li>Chest X-ray is NOT routinely indicated unless you suspect pneumothorax, pneumonia, or foreign body</li></ul>
<p><strong>Severe/Refractory asthma (non-responsive to above):</strong></p>
<ul><li>Epinephrine 0.01 mg/kg (1:1000) IM (max 0.5 mg) — can be repeated every 15–20 minutes x3</li></ul>
<ul><li>Terbutaline 10 mcg/kg IV loading dose, then 0.1–10 mcg/kg/min continuous infusion</li></ul>
<ul><li>IV aminophylline: loading dose 5–7 mg/kg IV over 20–30 minutes, then continuous infusion 0.5–1 mg/kg/hr (requires drug level monitoring; consider only if PICU consultation supports it)</li></ul>
<ul><li>Ketamine 1–2 mg/kg IV for sedation if intubation required (has bronchodilatory properties)</li></ul>
<ul><li>BiPAP/CPAP may be attempted as a bridge: settings typically IPAP 10–16, EPAP 5–8, with albuterol in-line</li></ul>
<div class="alert alert-danger">INTUBATION WARNING Intubating a child in status asthmaticus is extremely high-risk and should be considered a last resort. The combination of air trapping, bronchospasm, and positive pressure ventilation can lead to dynamic hyperinflation, hemodynamic collapse, and cardiac arrest. If intubation is necessary: use ketamine for induction (1–2 mg/kg IV), use a cuffed ETT, start with low tidal volumes (6–8 mL/kg), long expiratory times (I:E ratio 1:4 or 1:5), and tolerate permissive hypercapnia (pH >7.20). Consult pediatric critical care BEFORE intubating if at all possible.</div>
<h4>Disposition and Transfer</h4>
<p>Discharge criteria: sustained improvement for 60+ minutes after last albuterol treatment, SpO2 >92% on room air, tolerating oral intake, reliable family with access to medications and follow-up. All other children — particularly those requiring continuous albuterol, magnesium, or any IV therapy — should be admitted or transferred.</p>`,
      },
      {
        id: '2.4',
        heading: `Epiglottitis`,
        content_html: `<p>Though dramatically reduced by Hib vaccination, epiglottitis still occurs sporadically due to non-typeable H. influenzae, Streptococcus species, Staphylococcus aureus (including MRSA), and thermal/chemical injury. The rural physician must maintain vigilance.</p>
<h4>Classic Presentation — The 4 D’s</h4>
<ul><li><strong>Dysphagia:</strong> Difficulty swallowing; drooling is prominent</li></ul>
<ul><li><strong>Dysphonia:</strong> Muffled, "hot potato" voice (not hoarse like croup)</li></ul>
<ul><li><strong>Drooling:</strong> Inability to manage secretions</li></ul>
<ul><li><strong>Distress:</strong> Anxious, tripod positioning, prefers sitting upright</li></ul>
<p>Additional distinguishing features: High fever (often >39°C), toxic appearance, rapid onset (hours, not days), NO barking cough (differentiates from croup), patient prefers to sit leaning forward with jaw thrust ("sniffing position").</p>
<div class="alert alert-danger">CRITICAL MANAGEMENT PRINCIPLES DO NOT examine the throat or lay the child supine. DO NOT send to radiology unless the child is stable and accompanied by a physician prepared to manage the airway. DO NOT agitate the child with blood draws or IV placement. The single most important action is to maintain a calm environment and prepare for definitive airway management. Call for your most experienced airway provider, prepare surgical airway equipment, and activate transfer to a center with pediatric ENT/anesthesia. If the child arrests or has complete obstruction, perform direct laryngoscopy and intubate with a tube 0.5–1.0 size smaller than predicted; if unable to intubate, perform needle cricothyrotomy (\\< 8–12 years) or surgical cricothyrotomy (>12 years).</div>
<p>Medical management once airway is secured: Ceftriaxone 50–100 mg/kg IV (max 2 g) plus vancomycin 15 mg/kg IV if MRSA is suspected. Dexamethasone 0.5 mg/kg IV may help reduce edema. Transfer to pediatric ICU.</p>`,
      },
      {
        id: '2.5',
        heading: `Foreign Body Aspiration`,
        content_html: `<h4>Epidemiology</h4>
<p>Foreign body aspiration (FBA) is most common in children aged 1–3 years. The most frequently aspirated objects are food items (hot dogs, grapes, nuts, popcorn, hard candy) and small household objects (beads, button batteries, toy parts). FBA remains a leading cause of accidental death in children under 5\\.</p>
<h4>Presentation Patterns</h4>
<p>The classic history is a witnessed choking episode followed by coughing, gagging, or respiratory distress. However, up to 40% of cases lack a witnessed event, and the diagnosis may be delayed days to weeks. Consider FBA in any child with:</p>
<ul><li>Acute onset coughing or choking (with or without witnessed event)</li></ul>
<ul><li>Unilateral wheezing (the single most specific physical finding)</li></ul>
<ul><li>Recurrent or non-resolving pneumonia, especially in the same lobe</li></ul>
<ul><li>Persistent cough without other explanation</li></ul>
<ul><li>Asymmetric breath sounds</li></ul>
<h4>Management</h4>
<p><strong>Active choking (complete obstruction):</strong></p>
<ul><li>Infant (\\<1 year): 5 back blows + 5 chest thrusts, alternating until object is expelled or infant becomes unresponsive</li></ul>
<ul><li>Child (>1 year): Abdominal thrusts (Heimlich maneuver) until object expelled or child becomes unresponsive</li></ul>
<ul><li>If unresponsive: Begin CPR, look for visible object with each jaw opening for rescue breaths, attempt removal with Magill forceps only if visible</li></ul>
<p><strong>Suspected but not actively choking:</strong></p>
<ul><li>Keep the child calm; avoid maneuvers that may convert a partial to complete obstruction</li></ul>
<ul><li>Chest X-ray (inspiratory and expiratory or bilateral decubitus views): Look for unilateral hyperinflation (air trapping), mediastinal shift, or radiopaque foreign body. Note: most aspirated objects are radiolucent.</li></ul>
<ul><li>CT chest or virtual bronchoscopy if high clinical suspicion with negative X-ray</li></ul>
<ul><li>Rigid bronchoscopy is the definitive diagnostic and therapeutic procedure; transfer to a center with pediatric bronchoscopy capability</li></ul>`,
      },
      {
        id: '2.6',
        heading: `Bacterial Tracheitis`,
        content_html: `<p>Bacterial tracheitis (also called pseudomembranous croup) is an uncommon but life-threatening infection of the trachea, typically following a viral URI or croup. The causative organism is most often Staphylococcus aureus (including MRSA), with Moraxella catarrhalis and Streptococcus pneumoniae also implicated.</p>
<h4>Key Features</h4>
<p>Presents as a child with croup-like symptoms that fail to improve with standard therapy, often with escalating fever, increasing toxicity, and copious purulent secretions. The classic patient is a child treated for croup who develops high fever and worsening stridor despite dexamethasone and racemic epinephrine.</p>
<h4>Management</h4>
<ul><li>Secure the airway early — these children frequently require intubation due to thick secretions and tracheal edema</li></ul>
<ul><li>Frequent ETT suctioning after intubation (secretions may obstruct the tube)</li></ul>
<ul><li>Broad-spectrum antibiotics: Ceftriaxone 50–100 mg/kg IV PLUS Vancomycin 15 mg/kg IV (for MRSA coverage)</li></ul>
<ul><li>Do NOT rely on racemic epinephrine — it will not address the underlying infection or purulent obstruction</li></ul>
<ul><li>Transfer to PICU with pediatric ENT capability</li></ul>`,
      },
      {
        id: '2.7',
        heading: `Pertussis (Whooping Cough)`,
        content_html: `<p>Pertussis remains an important consideration in the rural ED, particularly in communities with lower vaccination rates. Bordetella pertussis causes a prolonged coughing illness that can be life-threatening in young infants.</p>
<h4>Three Phases</h4>
<ul><li><strong>Catarrhal Phase (1–2 weeks):</strong> Indistinguishable from a typical URI. Rhinorrhea, mild cough, low-grade fever. This is the most contagious period.</li></ul>
<ul><li><strong>Paroxysmal Phase (2–8 weeks):</strong> Characteristic paroxysms of rapid coughing followed by the "whoop" (forced inspiratory effort against a closed glottis). Post-tussive emesis is common. Infants \\<3 months may NOT whoop — instead they present with apnea, cyanosis, or bradycardia.</li></ul>
<ul><li><strong>Convalescent Phase (weeks to months):</strong> Gradual resolution of cough.</li></ul>
<h4>Management</h4>
<p>For infants \\<3 months with pertussis: Admit for continuous cardiorespiratory monitoring. Apnea is the primary life-threatening complication. Azithromycin 10 mg/kg/day x 5 days is the antibiotic of choice. These infants should be transferred to a facility with pediatric ICU capability. For older children and adolescents: Azithromycin for treatment and post-exposure prophylaxis. Hospitalization based on severity of paroxysms and ability to maintain hydration.</p>`,
      },
    ],
  },
  {
    id: 'ch03',
    number: '3',
    title: `Pneumonia`,
    sections: [
      {
        id: '3.1',
        heading: `Overview and Epidemiology`,
        content_html: `<p>Community-acquired pneumonia (CAP) is one of the most common serious infections in childhood, with an annual incidence of approximately 15–40 cases per 1,000 children under 5 years in the United States. While most pediatric pneumonia is viral and self-limited, bacterial pneumonia can progress rapidly to respiratory failure, sepsis, and death — particularly in infants and children with comorbidities. In the rural ED, the challenge lies in identifying which children require aggressive intervention versus supportive care and outpatient management.</p>`,
      },
      {
        id: '3.2',
        heading: `Etiology by Age Group`,
        content_html: `<table><thead><tr><th>Age Group</th><th>Most Common Viral</th><th>Most Common Bacterial</th><th>Atypical</th></tr></thead><tbody><tr><td>Neonates (\\<28 days)</td><td>RSV, CMV</td><td>Group B Strep, E. coli, Listeria, Klebsiella</td><td>Chlamydia trachomatis</td></tr><tr><td>1–3 months</td><td>RSV, Parainfluenza</td><td>S. pneumoniae, S. aureus, Chlamydia trachomatis</td><td>—</td></tr><tr><td>4 months – 5 years</td><td>RSV, Rhinovirus, Influenza, Parainfluenza, hMPV</td><td>S. pneumoniae (\\#1), H. influenzae, S. aureus, Group A Strep</td><td>Mycoplasma (increasing >2 yr)</td></tr><tr><td>5–18 years</td><td>Influenza, Adenovirus</td><td>S. pneumoniae, S. aureus, Group A Strep</td><td>Mycoplasma pneumoniae (\\#1), Chlamydia pneumoniae</td></tr></tbody></table>`,
      },
      {
        id: '3.3',
        heading: `Clinical Assessment`,
        content_html: `<p>The diagnosis of pneumonia in children is primarily clinical. The following features increase the probability of bacterial pneumonia:</p>
<ul><li>Fever >39°C (102.2°F) with abrupt onset</li></ul>
<ul><li>Tachypnea (most sensitive sign in young children): RR >60 in infants \\<2 months, >50 in infants 2–12 months, >40 in children 1–5 years, >20 in children >5 years</li></ul>
<ul><li>Focal crackles or decreased breath sounds on auscultation</li></ul>
<ul><li>Grunting (indicates alveolar disease and the child is auto-PEEPing)</li></ul>
<ul><li>Pleuritic chest pain (older children)</li></ul>
<ul><li>Abdominal pain (referred from diaphragmatic irritation — may be the presenting complaint in lower lobe pneumonia)</li></ul>
<div class="alert alert-info">ATYPICAL PRESENTATIONS Lower lobe pneumonia in children frequently presents as abdominal pain, sometimes with vomiting, and may be misdiagnosed as appendicitis or gastroenteritis. Always consider chest X-ray in a febrile child with abdominal pain, especially if the abdominal exam does not fully explain the severity of illness. Neonatal pneumonia may present only as poor feeding, temperature instability, or apnea.</div>`,
      },
      {
        id: '3.4',
        heading: `Diagnostic Workup`,
        content_html: `<p>In the rural ED with limited laboratory resources, the following stratified approach is practical:</p>
<p><strong>For all suspected pneumonia:</strong></p>
<ul><li>SpO2 measurement (single most important prognostic marker)</li></ul>
<ul><li>Chest X-ray (PA and lateral if possible; AP in younger children) — not required for all suspected pneumonia in well-appearing children >3 months with mild symptoms, but recommended for moderate-severe illness, hospitalization consideration, or diagnostic uncertainty</li></ul>
<p><strong>For moderate-severe pneumonia or children being admitted:</strong></p>
<ul><li>CBC with differential (leukocytosis with left shift suggests bacterial etiology)</li></ul>
<ul><li>CRP and/or procalcitonin (procalcitonin >0.25–0.5 ng/mL suggests bacterial infection)</li></ul>
<ul><li>Blood culture (positive in only \\~2–5% of CAP, but identifies organism and susceptibilities)</li></ul>
<ul><li>Point-of-care glucose and electrolytes</li></ul>
<ul><li>Respiratory viral panel if available (influenza testing at minimum during season)</li></ul>
<p><strong>For complicated or severely ill patients:</strong></p>
<ul><li>Blood gas (capillary or venous) for respiratory failure assessment</li></ul>
<ul><li>Lactate (marker of tissue hypoperfusion in pneumonia with sepsis)</li></ul>
<ul><li>Consider pleural ultrasound or CT if parapneumonic effusion/empyema suspected (unresponsive to antibiotics, persistent fever, large effusion on CXR)</li></ul>`,
      },
      {
        id: '3.5',
        heading: `Antibiotic Selection`,
        content_html: `<h4>Outpatient (Mild, Well-Appearing, >3 months)</h4>
<table><thead><tr><th>Age / Scenario</th><th>First-Line</th><th>Alternative / Penicillin Allergy</th><th>Duration</th></tr></thead><tbody><tr><td>3 mo – 5 yr, presumed bacterial</td><td>Amoxicillin 90 mg/kg/day divided BID (max 4 g/day)</td><td>Cefdinir 14 mg/kg/day divided BID or Azithromycin 10 mg/kg day 1, then 5 mg/kg days 2–5</td><td>7–10 days (5 days for azithromycin)</td></tr><tr><td>>5 yr, suspected atypical</td><td>Azithromycin 10 mg/kg day 1 (max 500 mg), then 5 mg/kg days 2–5 (max 250 mg)</td><td>Doxycycline (if >8 yr): 2–4 mg/kg/day divided BID (max 200 mg/day)</td><td>5 days (azithro) or 7–10 days (doxy)</td></tr><tr><td>>5 yr, suspected typical bacterial</td><td>High-dose amoxicillin 90 mg/kg/day BID (max 4 g/day)</td><td>Same as above plus add azithromycin for dual coverage</td><td>7–10 days</td></tr></tbody></table>
<h4>Inpatient (Moderate-Severe, or \\<3 months)</h4>
<table><thead><tr><th>Age / Scenario</th><th>First-Line IV</th><th>If MRSA Suspected</th><th>Notes</th></tr></thead><tbody><tr><td>Neonates (\\<28 days)</td><td>Ampicillin 50 mg/kg q6–8h + Gentamicin 4–5 mg/kg q24h</td><td>Add Vancomycin 15 mg/kg q6–8h</td><td>Treat as neonatal sepsis; see Chapter 5</td></tr><tr><td>1–3 months</td><td>Ampicillin 50 mg/kg q6h (or Ceftriaxone 50–75 mg/kg q24h)</td><td>Add Vancomycin 15 mg/kg q6–8h</td><td>Consider Chlamydia if afebrile with staccato cough — add azithromycin</td></tr><tr><td>>3 months, uncomplicated</td><td>Ampicillin 50 mg/kg IV q6h (max 2 g/dose)</td><td>Add Vancomycin or Clindamycin</td><td>First-line per IDSA/PIDS guidelines; Ceftriaxone if ampicillin-resistant organisms suspected</td></tr><tr><td>>3 months, complicated (empyema, necrotizing)</td><td>Ceftriaxone 50–100 mg/kg IV q24h (max 2 g/day) + Vancomycin 15 mg/kg IV q6h</td><td>Ensure Vancomycin trough 15–20</td><td>Consult pediatric ID/surgery; chest tube if significant empyema; consider fibrinolytic therapy</td></tr></tbody></table>`,
      },
      {
        id: '3.6',
        heading: `Complicated Pneumonia: Parapneumonic Effusion and Empyema`,
        content_html: `<p>Approximately 1–7% of children hospitalized with CAP develop parapneumonic effusion, and a subset of these progress to empyema (purulent fluid in the pleural space). Suspect this when a child with pneumonia develops persistent or recurrent fever despite 48–72 hours of appropriate antibiotics, or when the CXR shows significant opacification or meniscus sign.</p>
<p>Management approach:</p>
<ol><li>Confirm with ultrasound (readily available bedside in most EDs; more sensitive than CXR for effusion size, septations, and echogenicity)</li></ol>
<ol><li>Small effusion (\\<10 mm on decubitus or ultrasound): Continue antibiotics and monitor</li></ol>
<ol><li>Moderate-large effusion or clinical deterioration: Thoracentesis for diagnostic and therapeutic purposes. Send fluid for cell count, Gram stain, culture, pH, glucose, LDH, and protein</li></ol>
<ol><li>Empyema (purulent fluid, pH \\<7.2, glucose \\<40 mg/dL, LDH >1000): Chest tube drainage and consult pediatric surgery. Transfer to a facility with pediatric surgical capability if not available locally.</li></ol>`,
      },
      {
        id: '3.7',
        heading: `Monitoring and Transfer Criteria`,
        content_html: `<p>Children admitted for pneumonia in a rural Level II or CAH setting should be monitored closely for:</p>
<ul><li>Worsening respiratory status (increasing oxygen requirement, work of breathing, or respiratory rate)</li></ul>
<ul><li>Hemodynamic instability (signs of sepsis progression)</li></ul>
<ul><li>Failure to improve clinically after 48–72 hours of appropriate antibiotics</li></ul>
<ul><li>Development of complications (effusion, empyema, lung abscess)</li></ul>
<p>Transfer to a children’s hospital should be initiated for: any child requiring respiratory support beyond supplemental oxygen or HFNC at maximum flow for your device, hemodynamic instability requiring vasoactive medications, empyema or complicated parapneumonic effusion requiring surgical intervention, neonatal pneumonia with any instability, and any case where clinical trajectory is not improving.</p>`,
      },
    ],
  },
  {
    id: 'ch04',
    number: '4',
    title: `Sepsis and Septic Shock`,
    sections: [
      {
        id: '4.1',
        heading: `Definitions and Epidemiology`,
        content_html: `<p>Pediatric sepsis is a leading cause of morbidity and mortality in children worldwide. In the United States, severe sepsis affects approximately 75,000 children annually, with an overall mortality rate of 5–10% that rises dramatically with delays in recognition and treatment. The 2024 Surviving Sepsis Campaign (SSC) International Guidelines for the Management of Septic Shock and Sepsis-Associated Organ Dysfunction in Children provide the most current evidence-based framework.</p>
<p>Key definitions:</p>
<ul><li><strong>Sepsis:</strong> Life-threatening organ dysfunction caused by a dysregulated host response to infection. In children, this is identified by suspected or confirmed infection PLUS evidence of organ dysfunction (altered mental status, cardiovascular dysfunction, respiratory dysfunction, renal or hepatic impairment, hematologic derangement, or elevated lactate).</li></ul>
<ul><li><strong>Septic Shock:</strong> Sepsis with cardiovascular dysfunction persisting despite adequate fluid resuscitation — manifested by hypotension, need for vasoactive medications, or ongoing evidence of poor perfusion (altered mentation, prolonged capillary refill, diminished pulses, mottled/cool extremities, decreased urine output, or elevated lactate).</li></ul>`,
      },
      {
        id: '4.2',
        heading: `Early Recognition — The Golden Hour`,
        content_html: `<p>The single most important factor in pediatric sepsis outcomes is time to recognition and initiation of treatment. Every hour of delay in appropriate antibiotic administration is associated with a measurable increase in mortality. The rural physician must have a low threshold for suspecting sepsis.</p>
<div class="alert alert-info">SEPSIS SCREENING — THINK SEPSIS WHEN YOU SEE: Fever or hypothermia (especially in neonates/infants) + any of the following: Tachycardia out of proportion to fever, altered mental status (irritability, lethargy, poor interaction), delayed capillary refill (>3 seconds) or flash capillary refill (\\<1 second), mottled or cool extremities with warm trunk, tachypnea out of proportion to apparent respiratory pathology, petechial or purpuric rash, unexplained metabolic acidosis or elevated lactate, decreased urine output, or any infant \\<60 days with fever ≥38.0°C (100.4°F).</div>
<p>The Pediatric Assessment Triangle is again invaluable: an abnormal appearance + abnormal circulation \\= shock until proven otherwise. Do not wait for hypotension — it is a late sign in children and indicates decompensated shock with up to 40% volume loss.</p>`,
      },
      {
        id: '4.3',
        heading: `The Pediatric Sepsis Bundle — First 60 Minutes`,
        content_html: `<p>The following bundle should be initiated within 60 minutes of sepsis recognition. In the rural ED, begin as soon as sepsis is suspected — do not wait for confirmatory labs.</p>
<h4>Minute 0–15: Recognition and Access</h4>
<ol><li>Recognize sepsis: Use screening criteria above. Activate the team.</li></ol>
<ol><li>Measure: SpO2, temperature, capillary refill, blood pressure, heart rate, respiratory rate</li></ol>
<ol><li>Obtain vascular access: Two large-bore peripheral IVs. If unable within 90 seconds or 2 attempts, proceed immediately to IO access.</li></ol>
<ol><li>Draw labs simultaneously with access: Blood culture (ideally before antibiotics, but do NOT delay antibiotics for culture), CBC, CMP, lactate, blood gas (venous or capillary), coagulation studies, blood glucose. Point-of-care lactate and glucose are priority if rapid labs unavailable.</li></ol>
<ol><li>Supplemental oxygen: Apply immediately, target SpO2 >94%</li></ol>
<h4>Minute 0–30: Antibiotics</h4>
<p>Administer broad-spectrum IV antibiotics as rapidly as possible, ideally within 30 minutes of recognition:</p>
<table><thead><tr><th>Age Group</th><th>Empiric Antibiotic Regimen</th><th>Key Considerations</th></tr></thead><tbody><tr><td>Neonates (0–28 days)</td><td>Ampicillin 50 mg/kg IV + Gentamicin 4–5 mg/kg IV (or Cefotaxime 50 mg/kg if available)</td><td>Covers GBS, E. coli, Listeria. Add Acyclovir 20 mg/kg IV if HSV suspected (vesicles, seizures, liver dysfunction, maternal history)</td></tr><tr><td>Infants 29–60 days</td><td>Ampicillin 50 mg/kg IV + Ceftriaxone 50 mg/kg IV (or Cefotaxime if \\<28 days)</td><td>Age-based risk for both neonatal and community pathogens</td></tr><tr><td>Infants/Children 3 mo – 18 yr</td><td>Ceftriaxone 50–100 mg/kg IV (max 2 g)</td><td>Add Vancomycin 15 mg/kg IV if: MRSA risk, indwelling device, rapidly progressive skin infection, critical illness. Add Metronidazole if intra-abdominal source.</td></tr><tr><td>Immunocompromised</td><td>Cefepime 50 mg/kg IV (max 2 g) + Vancomycin 15 mg/kg IV</td><td>Broadest coverage for resistant organisms; add antifungal if prolonged neutropenia</td></tr></tbody></table>
<div class="alert alert-info">ANTIBIOTIC TIMING If obtaining vascular access is delayed, give antibiotics via IO immediately. If IO is also delayed, give IM ceftriaxone (50 mg/kg, max 1 g per injection site). The goal is antibiotic administration within the FIRST HOUR. Each hour of delay increases mortality.</div>
<h4>Minute 0–60: Fluid Resuscitation</h4>
<p>Fluid resuscitation is the cornerstone of initial septic shock management:</p>
<ol><li>First bolus: 10–20 mL/kg of isotonic crystalloid (NS or LR) over 5–20 minutes. Use 10 mL/kg if concerned about cardiac dysfunction or fluid overload.</li></ol>
<ol><li>Reassess after EACH bolus: heart rate, capillary refill, blood pressure, mental status, urine output, liver size (hepatomegaly may indicate fluid overload or cardiac dysfunction)</li></ol>
<ol><li>Repeat boluses: Up to 40–60 mL/kg in the first hour if shock persists and there are no signs of fluid overload (new or worsening hepatomegaly, new rales, worsening respiratory distress)</li></ol>
<ol><li>Stop or slow fluids if: new hepatomegaly develops, new rales, worsening oxygenation, or evidence of myocardial dysfunction</li></ol>
<div class="alert alert-info">FLUID BALANCE The 2024 SSC guidelines emphasize a more measured approach to fluid resuscitation than earlier guidelines. While initial boluses of 10–20 mL/kg remain standard, the previous recommendation of up to 60 mL/kg in the first hour has been tempered by evidence that excessive fluid resuscitation is harmful. Reassess after EVERY bolus and look for signs of fluid overload. Children with suspected myocarditis or cardiac dysfunction should receive smaller, more cautious boluses.</div>`,
      },
      {
        id: '4.4',
        heading: `Fluid-Refractory Shock: Vasoactive Medications`,
        content_html: `<p>If a child remains in shock after 40–60 mL/kg of fluid resuscitation (or less if signs of fluid overload develop), vasoactive medications must be initiated. This can and should be done in the rural ED while awaiting transfer.</p>
<h4>Vasopressor/Inotrope Selection</h4>
<table><thead><tr><th>Agent</th><th>Dose Range</th><th>Primary Effect</th><th>When to Choose</th></tr></thead><tbody><tr><td>Epinephrine</td><td>0.05–0.3 mcg/kg/min</td><td>Inotropy + vasoconstriction</td><td>FIRST-LINE for cold shock (cool extremities, prolonged cap refill, weak pulses). Most versatile agent.</td></tr><tr><td>Norepinephrine</td><td>0.05–2 mcg/kg/min</td><td>Vasoconstriction + mild inotropy</td><td>FIRST-LINE for warm shock (bounding pulses, flash cap refill, wide pulse pressure). Also effective for cold shock.</td></tr><tr><td>Dopamine</td><td>5–20 mcg/kg/min</td><td>Dose-dependent inotropy/vasoconstriction</td><td>Alternative if epinephrine/norepinephrine unavailable. Less predictable response in children.</td></tr><tr><td>Dobutamine</td><td>2–20 mcg/kg/min</td><td>Inotropy with mild vasodilation</td><td>Cardiogenic component of shock with adequate BP. May worsen hypotension.</td></tr><tr><td>Vasopressin</td><td>0.0003–0.002 units/kg/min</td><td>Vasoconstriction (non-adrenergic)</td><td>Adjunct for catecholamine-refractory shock</td></tr><tr><td>Milrinone</td><td>0.25–0.75 mcg/kg/min</td><td>Inotropy + vasodilation (PDE3 inhibitor)</td><td>Cardiogenic shock; requires loading dose (50 mcg/kg over 10–60 min); causes hypotension</td></tr></tbody></table>
<div class="alert alert-warning">PERIPHERAL VASOPRESSOR USE In the rural ED where central line placement may not be feasible or safe, dilute vasopressors CAN be given through a well-functioning peripheral IV or IO for short-term use (\\<24 hours). Epinephrine and norepinephrine are the preferred agents. Monitor the IV site every 15 minutes for extravasation. The risk of brief peripheral administration is far lower than the risk of untreated shock.</div>
<h4>Mixing and Running Vasopressors in the Rural ED</h4>
<p>A practical challenge in rural EDs is that vasoactive drips are not pre-mixed or commonly used. A reliable mixing formula:</p>
<p><strong>Epinephrine infusion:</strong> 0.6 x weight (kg) \\= mg of epinephrine to add to enough NS to make 100 mL total volume. Then, 1 mL/hr \\= 0.1 mcg/kg/min. Start at 0.5 mL/hr (0.05 mcg/kg/min) and titrate.</p>
<p><strong>Norepinephrine infusion:</strong> Same formula as above. 0.6 x weight (kg) \\= mg of norepinephrine to add to 100 mL NS. 1 mL/hr \\= 0.1 mcg/kg/min.</p>
<p>Alternatively, many facilities now stock pre-filled syringes or use standardized concentration charts. Check with your pharmacy.</p>`,
      },
      {
        id: '4.5',
        heading: `Ongoing Monitoring and Goals`,
        content_html: `<p>After the initial resuscitation, ongoing monitoring targets guide therapy titration:</p>
<table><thead><tr><th>Parameter</th><th>Target</th><th>How Often</th></tr></thead><tbody><tr><td>Heart Rate</td><td>Trending toward age-normal</td><td>Continuous</td></tr><tr><td>Blood Pressure</td><td>MAP >5th percentile + (age x 1.5) in mmHg for children >1 month</td><td>Every 5–15 min during active resuscitation; every 30–60 min once stable</td></tr><tr><td>Capillary Refill</td><td>\\<3 seconds</td><td>With each assessment</td></tr><tr><td>Mental Status</td><td>Improving to baseline</td><td>With each assessment</td></tr><tr><td>Urine Output</td><td>>1 mL/kg/hr (infants/children); >0.5 mL/kg/hr (adolescents)</td><td>Foley catheter; measure hourly</td></tr><tr><td>Lactate</td><td>Trending downward; target \\<2 mmol/L</td><td>Recheck at 2–4 hours, then every 4–6 hours</td></tr><tr><td>SpO2</td><td>>94%</td><td>Continuous</td></tr><tr><td>Glucose</td><td>Maintain >70 mg/dL (>45 mg/dL in neonates)</td><td>Every 1–2 hours during active resuscitation</td></tr></tbody></table>`,
      },
      {
        id: '4.6',
        heading: `Special Populations`,
        content_html: `<h4>Neonatal Sepsis (\\<28 days)</h4>
<p>Neonatal sepsis deserves special emphasis because of its high mortality, atypical presentation, and unique microbiology. Neonates may present with only temperature instability (hypothermia is more concerning than fever), poor feeding, lethargy, irritability, apnea, or subtle changes that parents describe as the baby "not acting right." Fever in a neonate (temp ≥38.0°C/100.4°F) is a medical emergency until proven otherwise.</p>
<p>Workup for febrile neonate \\<28 days includes: blood culture, CBC, CMP, urinalysis with culture (catheterized specimen), lumbar puncture (CSF cell count, glucose, protein, culture, HSV PCR), and consideration of HSV testing. Empiric antibiotics: Ampicillin + Gentamicin. Add Acyclovir 20 mg/kg IV q8h if any concern for HSV (vesicular lesions, seizures, abnormal LFTs, CSF pleocytosis, maternal history of HSV). All febrile neonates should be admitted and most should be transferred to a facility with neonatal intensive care.</p>
<h4>Febrile Infants 29–60 Days</h4>
<p>This age group represents a management challenge. The Rochester criteria, Boston criteria, Philadelphia criteria, and more recently the PECARN Febrile Infant Rule and Step-by-Step approach have been developed to risk-stratify these infants. In the rural ED, the safest approach is:</p>
<ul><li>Full sepsis workup (blood culture, UA with culture, consider LP)</li></ul>
<ul><li>Empiric IV antibiotics (Ampicillin + Ceftriaxone, or Ceftriaxone alone in well-appearing infants >28 days based on your risk stratification tool)</li></ul>
<ul><li>Admission for observation in most cases; transfer to pediatric facility if LP abnormal, ill-appearing, or any concern</li></ul>`,
      },
      {
        id: '4.7',
        heading: `Transfer Considerations for Sepsis`,
        content_html: `<p>Initiate transfer to a pediatric ICU for any child with septic shock, fluid-refractory shock, need for vasoactive medications, multi-organ dysfunction, or any child where the clinical trajectory is concerning despite initial interventions. Before transport, ensure:</p>
<ul><li>Two functioning vascular access sites (IV and/or IO)</li></ul>
<ul><li>Vasoactive infusions are stable and running through a reliable line</li></ul>
<ul><li>Airway is secure (intubate before transport if airway compromise is present or expected)</li></ul>
<ul><li>Blood products are available if needed (packed RBCs if Hgb \\<7 g/dL with hemodynamic instability)</li></ul>
<ul><li>All antibiotics are dosed and documented</li></ul>
<ul><li>Glucose is checked and stable</li></ul>
<ul><li>Parents are informed and updated</li></ul>`,
      },
    ],
  },
  {
    id: 'ch05',
    number: '5',
    title: `Shock — Classification, Recognition, and Management`,
    sections: [
      {
        id: '5.1',
        heading: `Overview of Pediatric Shock`,
        content_html: `<p>Shock is defined as a clinical state of inadequate oxygen delivery to meet metabolic demands of tissues. In children, shock is classified by the underlying mechanism, each requiring a distinct management approach. The rural emergency physician must rapidly identify the type of shock to direct appropriate therapy — the wrong intervention (e.g., large-volume fluid resuscitation in cardiogenic shock) can be lethal.</p>`,
      },
      {
        id: '5.2',
        heading: `Classification and Differentiation`,
        content_html: `<table><thead><tr><th>Type</th><th>Mechanism</th><th>Key Clinical Features</th><th>Common Causes</th></tr></thead><tbody><tr><td>Hypovolemic</td><td>Decreased preload from volume loss</td><td>Tachycardia, delayed cap refill, cool/pale skin, dry mucous membranes, decreased UOP, sunken fontanelle (infants), postural changes</td><td>Dehydration (GI losses), hemorrhage (trauma, GI bleed), burns, third-spacing</td></tr><tr><td>Distributive</td><td>Vasodilation with relative hypovolemia</td><td>Warm shock: bounding pulses, flash cap refill, wide pulse pressure. Cold shock (late): vasoconstriction, mottling. Fever or hypothermia.</td><td>Sepsis (\\#1), anaphylaxis, neurogenic (spinal cord injury), adrenal insufficiency</td></tr><tr><td>Cardiogenic</td><td>Pump failure</td><td>Tachycardia, hepatomegaly, JVD, gallop rhythm, pulmonary edema/rales, poor perfusion, cardiomegaly on CXR</td><td>Myocarditis, cardiomyopathy, dysrhythmias (SVT), congenital heart disease, acute valvular disease</td></tr><tr><td>Obstructive</td><td>Mechanical obstruction to blood flow</td><td>Variable; may mimic cardiogenic shock. Consider with trauma, post-procedure, or sudden deterioration</td><td>Tension pneumothorax, cardiac tamponade, massive PE, ductal-dependent congenital heart lesion</td></tr></tbody></table>`,
      },
      {
        id: '5.3',
        heading: `Hypovolemic Shock`,
        content_html: `<p>Hypovolemic shock is the most common form of shock in pediatric patients worldwide. In the rural ED, the most common etiologies are severe dehydration from gastroenteritis and hemorrhage from trauma.</p>
<h4>Management Priorities</h4>
<ol><li>Establish IV/IO access and draw labs</li></ol>
<ol><li>Isotonic crystalloid bolus: 20 mL/kg over 5–20 minutes; reassess after each bolus</li></ol>
<ol><li>Hemorrhagic shock: Transition to blood products early. Packed RBCs 10–20 mL/kg if Hgb \\<7 g/dL or ongoing blood loss with hemodynamic instability. In massive hemorrhage, activate massive transfusion protocol (1:1:1 ratio of pRBC:FFP:platelets)</li></ol>
<ol><li>Identify and control source of volume loss: External hemorrhage (direct pressure), GI hemorrhage (consult surgery/GI), surgical bleeding (transfer to surgical center)</li></ol>
<ol><li>Target: normalization of heart rate, capillary refill \\<3 seconds, improved mental status, urine output >1 mL/kg/hr</li></ol>`,
      },
      {
        id: '5.4',
        heading: `Cardiogenic Shock`,
        content_html: `<p>Cardiogenic shock in children is less common than hypovolemic or distributive shock but carries high mortality. The key distinction is that these patients are volume-overloaded, not volume-depleted.</p>
<div class="alert alert-danger">CARDIOGENIC SHOCK RED FLAGS Suspect cardiogenic shock when a child in shock has: hepatomegaly, JVD (difficult to assess in infants), rales/crackles, gallop rhythm on auscultation, cardiomegaly on CXR, lack of improvement or worsening with fluid boluses, or a new murmur. Point-of-care echocardiography, if available, is invaluable.</div>
<h4>Management</h4>
<ul><li>Fluid resuscitation should be cautious: 5–10 mL/kg boluses with frequent reassessment. Stop if hepatomegaly worsens or respiratory distress increases.</li></ul>
<ul><li>Inotropic support: Epinephrine 0.05–0.3 mcg/kg/min or Dobutamine 5–20 mcg/kg/min. Milrinone may be used if blood pressure is adequate (inodilator).</li></ul>
<ul><li>Diuretics: Furosemide 1 mg/kg IV for pulmonary edema after inotropes are initiated</li></ul>
<ul><li>Correct underlying cause: Adenosine for SVT, cardioversion for unstable tachydysrhythmias, prostaglandin E1 for ductal-dependent lesions in neonates</li></ul>
<ul><li>Transfer to pediatric cardiology/PICU facility is mandatory</li></ul>
<h4>Prostaglandin E1 (Alprostadil) for Neonatal Cardiac Emergencies</h4>
<p>Any neonate (\\<28 days, but can present up to 6–8 weeks) presenting with shock, cyanosis, or respiratory distress unresponsive to standard therapy should be suspected of having a ductal-dependent congenital heart lesion. Prostaglandin E1 (PGE1) can be lifesaving.</p>
<p><strong>Indications:</strong> Suspected ductal-dependent congenital heart disease (cyanosis unresponsive to oxygen, shock in a neonate without clear infectious source, differential cyanosis, absent femoral pulses).</p>
<p><strong>Dose:</strong> Start at 0.05–0.1 mcg/kg/min IV continuous infusion. Once ductus is open (clinical improvement), may decrease to 0.01–0.05 mcg/kg/min.</p>
<p><strong>Critical side effect:</strong> Apnea occurs in \\~10–12% of neonates on PGE1. Be prepared to intubate before or immediately after starting the infusion. Have BVM at bedside and intubation equipment ready.</p>`,
      },
      {
        id: '5.5',
        heading: `Obstructive Shock`,
        content_html: `<h4>Tension Pneumothorax</h4>
<p>Presents with acute respiratory distress, unilateral absent breath sounds, tracheal deviation (away from affected side — late sign), hypotension, and distended neck veins. In the setting of trauma or positive pressure ventilation, this diagnosis is clinical and treatment should not be delayed for imaging.</p>
<p><strong>Treatment:</strong> Immediate needle decompression: 14–18 gauge angiocatheter at the 2nd intercostal space, midclavicular line (or 4th–5th intercostal space, anterior axillary line). Follow with chest tube placement. In children, use an appropriately sized chest tube: 10–12 Fr for infants, 16–20 Fr for children, 24–32 Fr for adolescents.</p>
<h4>Cardiac Tamponade</h4>
<p>Presents with Beck’s triad: hypotension, distended neck veins, and muffled heart sounds (often difficult to appreciate in a noisy ED). Pulsus paradoxus (>10 mmHg drop in systolic BP during inspiration) may be present. Causes include penetrating trauma, post-cardiac surgery, malignancy, and rarely, severe pericarditis.</p>
<p><strong>Treatment:</strong> Emergent pericardiocentesis if hemodynamically unstable. Ultrasound-guided subxiphoid approach is preferred. Aspirate as little as 10–20 mL to see dramatic hemodynamic improvement. Fluid resuscitation while preparing for pericardiocentesis can temporize. Definitive management requires transfer to a surgical center.</p>`,
      },
    ],
  },
  {
    id: 'ch06',
    number: '6',
    title: `Anaphylaxis`,
    sections: [
      {
        id: '6.1',
        heading: `Definition and Epidemiology`,
        content_html: `<p>Anaphylaxis is a severe, potentially fatal systemic allergic reaction that is rapid in onset. The lifetime prevalence in the US is estimated at 1.6–5.1%. The most common triggers in children are foods (peanuts, tree nuts, milk, eggs, shellfish), insect stings (Hymenoptera), medications (antibiotics, NSAIDs), and latex. In up to 20% of cases, no trigger is identified (idiopathic anaphylaxis). Fatality rates are low (estimated 0.7–2% of anaphylaxis cases) but are directly related to delayed administration of epinephrine.</p>`,
      },
      {
        id: '6.2',
        heading: `Diagnostic Criteria`,
        content_html: `<p>Anaphylaxis is highly likely when ANY ONE of the following criteria is met:</p>
<ol><li>Acute onset (minutes to hours) of illness involving SKIN/MUCOSAL tissue (hives, flushing, lip/tongue swelling) PLUS at least one of: respiratory compromise (dyspnea, wheezing, stridor, hypoxia) OR reduced blood pressure/signs of end-organ dysfunction (hypotonia, syncope, incontinence)</li></ol>
<ol><li>Two or more of the following occurring rapidly after exposure to a LIKELY allergen: skin/mucosal involvement, respiratory compromise, reduced BP or associated symptoms, persistent GI symptoms (crampy abdominal pain, vomiting)</li></ol>
<ol><li>Reduced blood pressure after exposure to a KNOWN allergen for that patient</li></ol>
<div class="alert alert-danger">CRITICAL CONCEPT Anaphylaxis can occur WITHOUT skin findings in up to 10–20% of cases. Respiratory or cardiovascular symptoms after allergen exposure should trigger consideration of anaphylaxis even without hives or angioedema. Do not wait for "classic" presentation — give epinephrine for suspected anaphylaxis.</div>`,
      },
      {
        id: '6.3',
        heading: `Immediate Management — Epinephrine First`,
        content_html: `<p>Epinephrine is the ONLY first-line treatment for anaphylaxis. There are no contraindications to epinephrine in anaphylaxis. Delayed administration is the primary risk factor for fatal anaphylaxis.</p>
<table><thead><tr><th>Step</th><th>Action</th><th>Details</th></tr></thead><tbody><tr><td>1</td><td>EPINEPHRINE IM</td><td>Epinephrine 1:1000 (1 mg/mL): 0.01 mg/kg IM (max 0.5 mg) into the mid-anterolateral thigh. May repeat every 5–15 minutes x2–3 if symptoms persist.</td></tr><tr><td>2</td><td>Position</td><td>Supine with legs elevated (Trendelenburg) if hypotensive. If respiratory distress predominates, allow semi-upright. If vomiting, recovery position.</td></tr><tr><td>3</td><td>Remove trigger</td><td>Discontinue IV medications, remove insect stinger (scrape, do not squeeze)</td></tr><tr><td>4</td><td>Supplemental O2</td><td>High-flow O2 via non-rebreather mask (10–15 L/min)</td></tr><tr><td>5</td><td>IV access + fluids</td><td>Two large-bore IVs; NS bolus 20 mL/kg rapidly for hypotension. May repeat.</td></tr><tr><td>6</td><td>Albuterol</td><td>2.5–5 mg nebulized for persistent bronchospasm</td></tr><tr><td>7</td><td>Adjuncts (SECOND-LINE)</td><td>Diphenhydramine 1 mg/kg IV/IM (max 50 mg), Famotidine 0.25 mg/kg IV (max 20 mg), Methylprednisolone 1–2 mg/kg IV (max 125 mg) or Dexamethasone 0.15–0.6 mg/kg IV</td></tr></tbody></table>
<div class="alert alert-info">COMMON ERRORS IN ANAPHYLAXIS MANAGEMENT USING ANTIHISTAMINES INSTEAD OF EPINEPHRINE: Diphenhydramine treats hives, NOT anaphylaxis. It does not prevent or reverse airway edema, bronchospasm, or cardiovascular collapse. USING SUBCUTANEOUS INSTEAD OF INTRAMUSCULAR EPINEPHRINE: IM injection provides faster and higher peak plasma levels. Always give IM into the lateral thigh. DELAY: The most common fatal error is waiting to see if symptoms progress before giving epinephrine. Give it early.</div>`,
      },
      {
        id: '6.4',
        heading: `Refractory Anaphylaxis`,
        content_html: `<p>If a child fails to respond to 2–3 doses of IM epinephrine:</p>
<ul><li>Epinephrine IV infusion: 0.1–1 mcg/kg/min (mix as for septic shock dosing: 0.6 x weight in kg \\= mg of epinephrine in 100 mL NS; 1 mL/hr \\= 0.1 mcg/kg/min)</li></ul>
<ul><li>Aggressive IV fluid resuscitation: Anaphylaxis causes massive third-spacing; patients may require 40–80 mL/kg of crystalloid</li></ul>
<ul><li>Glucagon 20–30 mcg/kg IV (max 1 mg) for patients on beta-blockers who are refractory to epinephrine (rare in pediatrics but important in adolescents)</li></ul>
<ul><li>Prepare for advanced airway management — airway edema may progress rapidly</li></ul>
<ul><li>Transfer to PICU</li></ul>`,
      },
      {
        id: '6.5',
        heading: `Biphasic Reaction`,
        content_html: `<p>A biphasic reaction (recurrence of symptoms after initial resolution without re-exposure) occurs in approximately 1–20% of anaphylaxis cases, typically within 1–72 hours (most within 8–10 hours). Because of this risk, all children treated for anaphylaxis should be observed for a minimum of 4–6 hours (some guidelines recommend up to 8–12 hours for severe reactions). Factors associated with higher risk of biphasic reaction include severe initial presentation, delayed epinephrine administration, and need for multiple epinephrine doses.</p>`,
      },
      {
        id: '6.6',
        heading: `Discharge Planning`,
        content_html: `<p>Upon discharge, every child treated for anaphylaxis should receive:</p>
<ul><li>Epinephrine auto-injector prescription (EpiPen Jr 0.15 mg for children 10–25 kg; EpiPen 0.3 mg for children >25 kg) — prescribe 2 auto-injectors</li></ul>
<ul><li>Written anaphylaxis action plan</li></ul>
<ul><li>Education on auto-injector use (demonstrate with trainer device)</li></ul>
<ul><li>Referral to allergist within 2–4 weeks</li></ul>
<ul><li>Medical alert identification recommendation</li></ul>
<ul><li>Clear return precautions: return immediately for any recurrence of symptoms</li></ul>`,
      },
    ],
  },
  {
    id: 'ch07',
    number: '7',
    title: `Dehydration and Fluid Management`,
    sections: [
      {
        id: '7.1',
        heading: `Epidemiology`,
        content_html: `<p>Acute gastroenteritis (AGE) with dehydration is one of the most common pediatric ED presentations worldwide and is the leading cause of pediatric hypovolemic shock in non-trauma settings. In the United States, AGE accounts for approximately 1.5 million outpatient visits and 200,000 hospitalizations annually in children under 5\\. In the rural setting, distance from care may mean that children present with more advanced dehydration than in urban areas.</p>`,
      },
      {
        id: '7.2',
        heading: `Clinical Assessment of Dehydration Severity`,
        content_html: `<table><thead><tr><th>Clinical Sign</th><th>Mild (3–5%)</th><th>Moderate (6–9%)</th><th>Severe (>10%)</th></tr></thead><tbody><tr><td>Mental Status</td><td>Normal, alert</td><td>Restless, irritable</td><td>Lethargic, obtunded</td></tr><tr><td>Thirst</td><td>Drinks normally or slightly increased</td><td>Eager to drink</td><td>Unable to drink or too lethargic</td></tr><tr><td>Heart Rate</td><td>Normal</td><td>Increased</td><td>Markedly increased; thready</td></tr><tr><td>Blood Pressure</td><td>Normal</td><td>Normal to orthostatic</td><td>Hypotension</td></tr><tr><td>Respiratory Pattern</td><td>Normal</td><td>Deep, may be increased</td><td>Deep and rapid (Kussmaul)</td></tr><tr><td>Eyes</td><td>Normal</td><td>Slightly sunken</td><td>Deeply sunken</td></tr><tr><td>Tears</td><td>Present</td><td>Decreased</td><td>Absent</td></tr><tr><td>Mucous Membranes</td><td>Moist</td><td>Dry, sticky</td><td>Parched, cracked</td></tr><tr><td>Skin Turgor</td><td>Normal</td><td>Decreased (tenting)</td><td>Markedly decreased</td></tr><tr><td>Capillary Refill</td><td>\\<2 seconds</td><td>2–3 seconds</td><td>>3 seconds; mottled</td></tr><tr><td>Fontanelle (infants)</td><td>Normal</td><td>Slightly sunken</td><td>Markedly sunken</td></tr><tr><td>Urine Output</td><td>Slightly decreased</td><td>Oliguria</td><td>Anuria for >6–8 hours</td></tr></tbody></table>
<div class="alert alert-warning">CLINICAL TIP The most reliable individual clinical signs for moderate-severe dehydration are: prolonged capillary refill (>2 seconds), abnormal skin turgor, and altered mental status. Using a combination of signs is more accurate than any single finding. A recent weight (if available) compared to current weight is the gold standard for quantifying percent dehydration.</div>`,
      },
      {
        id: '7.3',
        heading: `Laboratory Evaluation`,
        content_html: `<p>Not all dehydrated children require laboratory evaluation. Consider labs for:</p>
<ul><li>Moderate-severe dehydration</li></ul>
<ul><li>Children requiring IV fluids</li></ul>
<ul><li>Age \\<6 months</li></ul>
<ul><li>Clinical presentation inconsistent with simple gastroenteritis (no vomiting/diarrhea history)</li></ul>
<ul><li>Concern for alternative diagnosis (DKA, adrenal crisis, inborn error of metabolism)</li></ul>
<p>When obtained, the panel should include: BMP (sodium, potassium, chloride, bicarbonate, BUN, creatinine, glucose), blood gas (for acid-base status), and urinalysis. Serum bicarbonate \\<17 mEq/L correlates with moderate-severe dehydration. BUN elevation is an early and sensitive marker.</p>`,
      },
      {
        id: '7.4',
        heading: `Rehydration Strategies`,
        content_html: `<h4>Oral Rehydration Therapy (ORT)</h4>
<p>ORT is the preferred method for mild-moderate dehydration and is underutilized in the ED. WHO/AAP guidelines recommend ORT as first-line therapy:</p>
<ul><li>Use commercially available oral rehydration solutions (Pedialyte, Enfalyte). Avoid fruit juices, sports drinks, and soda — these are hyper-osmolar and can worsen diarrhea.</li></ul>
<ul><li>Mild dehydration: 50 mL/kg over 4 hours, plus replacement of ongoing losses (10 mL/kg per diarrheal stool or episode of emesis)</li></ul>
<ul><li>Moderate dehydration: 100 mL/kg over 4 hours, plus ongoing loss replacement</li></ul>
<ul><li>Technique: Small, frequent volumes (5–10 mL every 2–5 minutes by syringe, cup, or spoon). Ondansetron (0.15 mg/kg IV/PO, max 4 mg) prior to ORT attempt significantly improves success in vomiting children.</li></ul>
<h4>Intravenous Rehydration</h4>
<p>IV fluids are indicated for: severe dehydration, hemodynamic instability, altered mental status, failure of ORT, ongoing losses exceeding oral replacement capacity, inability to tolerate oral fluids, and specific diagnoses requiring IV therapy (DKA, HUS, pyloric stenosis).</p>
<p><strong>Rapid Rehydration Protocol (for isonatremic dehydration without shock):</strong></p>
<ol><li>NS or LR bolus 20 mL/kg over 1 hour</li></ol>
<ol><li>Reassess: If improved, transition to maintenance + deficit replacement</li></ol>
<ol><li>If still dehydrated, repeat bolus 20 mL/kg</li></ol>
<ol><li>If shock: manage per shock protocols (Chapter 5)</li></ol>
<p><strong>Maintenance + Deficit Replacement:</strong></p>
<p>Calculate maintenance rate using the Holliday-Segar method:</p>
<ul><li>First 10 kg: 100 mL/kg/day (4 mL/kg/hr)</li></ul>
<ul><li>Second 10 kg: 50 mL/kg/day (2 mL/kg/hr)</li></ul>
<ul><li>Each additional kg: 20 mL/kg/day (1 mL/kg/hr)</li></ul>
<p>Deficit volume (mL) \\= estimated % dehydration x weight (kg) x 10\\. Replace deficit over 24 hours (subtract any bolus volume already given) in addition to maintenance. Use isotonic fluid (NS or LR) for the first 12–24 hours; switch to D5-0.45% NS or D5-NS with 20 mEq/L KCl once the patient is urinating and potassium is known to be non-elevated.</p>`,
      },
      {
        id: '7.5',
        heading: `Electrolyte Derangements`,
        content_html: `<h4>Hyponatremia (Na \\<135 mEq/L)</h4>
<p>Hyponatremic dehydration is more common in children receiving hypotonic fluids during illness (water, diluted formula, tea). Management: correct the deficit with isotonic saline. Sodium should not be corrected faster than 8–10 mEq/L per 24 hours to avoid osmotic demyelination syndrome. Symptomatic hyponatremia (seizures, altered mental status) with Na \\<120 mEq/L: 3% hypertonic saline 2–5 mL/kg IV over 10–20 minutes; may repeat once. Target a 4–6 mEq/L rise initially.</p>
<h4>Hypernatremia (Na >145 mEq/L)</h4>
<p>Hypernatremic dehydration occurs when free water losses exceed sodium losses (fever, inadequate fluid intake, diabetes insipidus). This is particularly dangerous because rapid correction can cause cerebral edema. Correct sodium at a rate no faster than 0.5 mEq/L/hr (or 10–12 mEq/L per 24 hours). Use isotonic fluids initially for resuscitation; then switch to a mildly hypotonic fluid (D5-0.45% NS) and monitor sodium every 4–6 hours. Clinically, these children may appear less dehydrated than they are because the intravascular space is relatively preserved.</p>
<h4>Hypokalemia (K \\<3.5 mEq/L) and Hyperkalemia (K >5.5 mEq/L)</h4>
<p>Hypokalemia is common with prolonged vomiting and diarrhea. Replace by adding KCl 20–40 mEq/L to IV fluids once urine output is confirmed. For hyperkalemia (seen in renal failure, DKA, hemolysis, or adrenal insufficiency): calcium gluconate 100 mg/kg IV for cardiac stabilization, insulin 0.1 unit/kg with D25W 2 mL/kg for cellular shift, sodium bicarbonate 1–2 mEq/kg if acidotic, nebulized albuterol, and kayexalate or patiromer for GI elimination. Monitor ECG continuously for peaked T waves, widened QRS, and dysrhythmias.</p>`,
      },
    ],
  },
  {
    id: 'ch08',
    number: '8',
    title: `Status Epilepticus and Seizures`,
    sections: [
      {
        id: '8.1',
        heading: `Definitions`,
        content_html: `<p>Status epilepticus (SE) is defined as continuous seizure activity lasting >5 minutes or two or more seizures without return to baseline consciousness between episodes. This is a time-critical neurologic emergency — the longer the seizure persists, the more resistant it becomes to treatment and the greater the risk of permanent neuronal injury. The Neurocritical Care Society and American Epilepsy Society guidelines define stages based on time:</p>
<table><thead><tr><th>Stage</th><th>Time</th><th>Recommended Action</th></tr></thead><tbody><tr><td>Early SE</td><td>5–10 min</td><td>First-line benzodiazepine</td></tr><tr><td>Established SE</td><td>10–30 min</td><td>Second-line antiseizure medication</td></tr><tr><td>Refractory SE</td><td>>30 min</td><td>Third-line continuous infusion; intubation likely needed</td></tr><tr><td>Super-Refractory SE</td><td>>24 hours</td><td>Ongoing seizures despite 24+ hours of anesthetic infusion</td></tr></tbody></table>`,
      },
      {
        id: '8.2',
        heading: `Emergent Management Protocol`,
        content_html: `<h4>Minute 0–5: Stabilize and First-Line Benzodiazepine</h4>
<ol><li>ABCs: Position, suction, supplemental oxygen, place on continuous monitoring</li></ol>
<ol><li>Check glucose (POC): Treat hypoglycemia immediately if present</li></ol>
<ol><li>Give first-line benzodiazepine (choose based on access):</li></ol>
<table><thead><tr><th>Route</th><th>Medication</th><th>Dose</th><th>Onset</th></tr></thead><tbody><tr><td>IV/IO (preferred)</td><td>Lorazepam</td><td>0.1 mg/kg IV (max 4 mg/dose)</td><td>1–2 min</td></tr><tr><td>IV/IO (alternative)</td><td>Diazepam</td><td>0.2 mg/kg IV (max 10 mg)</td><td>1–3 min</td></tr><tr><td>IM (no IV access)</td><td>Midazolam</td><td>0.2 mg/kg IM (max 10 mg)</td><td>3–5 min</td></tr><tr><td>Intranasal</td><td>Midazolam</td><td>0.2 mg/kg IN (max 10 mg; use concentrated formulation 5 mg/mL)</td><td>3–5 min</td></tr><tr><td>Rectal</td><td>Diazepam</td><td>0.5 mg/kg PR (max 20 mg)</td><td>5–10 min</td></tr></tbody></table>
<p>May repeat benzodiazepine once at 5 minutes if seizure continues.</p>
<h4>Minute 5–20: Second-Line Agent (if seizure persists after 2 benzodiazepine doses)</h4>
<table><thead><tr><th>Medication</th><th>Dose</th><th>Administration</th><th>Notes</th></tr></thead><tbody><tr><td>Levetiracetam (Keppra)</td><td>40–60 mg/kg IV (max 4500 mg)</td><td>Over 15 minutes</td><td>Preferred by many centers; fewer hemodynamic effects. Excellent safety profile.</td></tr><tr><td>Fosphenytoin</td><td>20 mg PE/kg IV (max 1500 mg PE)</td><td>Rate: 3 mg PE/kg/min (max 150 mg PE/min)</td><td>Cardiac monitoring required. Contraindicated with known cardiac conduction defects.</td></tr><tr><td>Phenobarbital</td><td>20 mg/kg IV</td><td>Rate: 1–2 mg/kg/min</td><td>Risk of respiratory depression, especially after benzodiazepines. May need to intubate.</td></tr><tr><td>Valproic Acid</td><td>20–40 mg/kg IV (max 3000 mg)</td><td>Over 5–10 minutes</td><td>Avoid in suspected metabolic disease, hepatic failure, age \\<2 yr without known epilepsy</td></tr></tbody></table>
<h4>Minute 20–60: Refractory Status Epilepticus</h4>
<p>If seizures continue despite two benzodiazepine doses and a second-line agent, this is refractory SE. Actions:</p>
<ul><li>Prepare for and perform endotracheal intubation (seizure activity causes aspiration risk, and third-line agents cause respiratory depression)</li></ul>
<ul><li>Begin continuous infusion of one of the following (PICU consultation strongly recommended before initiating):</li></ul>
<ul><li>Midazolam infusion: 0.2 mg/kg bolus, then 0.05–2 mg/kg/hr continuous infusion</li></ul>
<ul><li>Pentobarbital: 5–15 mg/kg loading dose, then 0.5–5 mg/kg/hr infusion (requires continuous EEG monitoring and hemodynamic support)</li></ul>
<ul><li>Propofol: 1–2 mg/kg bolus, then 1–5 mg/kg/hr (avoid prolonged use in children due to propofol infusion syndrome risk)</li></ul>
<ul><li>Initiate transfer to a pediatric ICU with continuous EEG monitoring capability</li></ul>`,
      },
      {
        id: '8.3',
        heading: `Diagnostic Evaluation`,
        content_html: `<p>While managing the seizure, consider the underlying cause:</p>
<ul><li>Glucose (already obtained): hypoglycemia is a treatable cause</li></ul>
<ul><li>Electrolytes: hyponatremia, hypocalcemia, hypomagnesemia</li></ul>
<ul><li>Toxicology screen: intentional or accidental ingestion is a common cause of new-onset seizures in toddlers</li></ul>
<ul><li>CBC, cultures, lumbar puncture: if infection/meningitis suspected (fever + seizure, especially in young infants)</li></ul>
<ul><li>CT head (non-contrast): trauma, mass lesion, hemorrhage, hydrocephalus — obtain emergently if focal neurologic deficit, signs of elevated ICP, non-accidental trauma suspected, or first-time seizure with no clear trigger</li></ul>
<ul><li>Anticonvulsant levels: if child on established medications</li></ul>`,
      },
      {
        id: '8.4',
        heading: `Febrile Seizures`,
        content_html: `<p>Febrile seizures are the most common seizure type in children, occurring in 2–5% of children aged 6 months to 5 years. They are typically benign but are terrifying for families.</p>
<table><thead><tr><th>Feature</th><th>Simple Febrile Seizure</th><th>Complex Febrile Seizure</th></tr></thead><tbody><tr><td>Duration</td><td>\\<15 minutes</td><td>>15 minutes OR recurrent in 24 hours</td></tr><tr><td>Type</td><td>Generalized tonic-clonic</td><td>Focal features</td></tr><tr><td>Post-ictal</td><td>Returns to baseline \\<1 hour</td><td>Prolonged post-ictal or Todd’s paralysis</td></tr><tr><td>Workup Needed</td><td>Identify fever source; labs/imaging generally not needed if >12 months and well-appearing</td><td>More extensive workup: consider LP if \\<12 months, labs, possibly imaging</td></tr><tr><td>Prognosis</td><td>Excellent; 30% recurrence risk</td><td>Slightly increased risk of epilepsy (\\~4–6% vs 1% general population)</td></tr></tbody></table>
<div class="alert alert-warning">FAMILY COUNSELING Parents of children with febrile seizures need reassurance and education. Key points: febrile seizures do not cause brain damage, most children outgrow them by age 5, antipyretics do not prevent febrile seizures (but treat for comfort), and the risk of developing epilepsy after a simple febrile seizure is only slightly higher than the general population (\\~2% vs 1%).</div>`,
      },
    ],
  },
  {
    id: 'ch09',
    number: '9',
    title: `Diabetic Ketoacidosis (DKA)`,
    sections: [
      {
        id: '9.1',
        heading: `Overview`,
        content_html: `<p>DKA is the most common endocrine emergency in children and the leading cause of morbidity and mortality in children with Type 1 diabetes mellitus (T1DM). In the United States, approximately 30–40% of newly diagnosed T1DM patients present in DKA. Rural areas may have even higher rates of DKA at presentation due to delayed diagnosis. The mortality rate of DKA is 0.15–0.3%, with cerebral edema being the most common fatal complication.</p>`,
      },
      {
        id: '9.2',
        heading: `Diagnostic Criteria`,
        content_html: `<p>DKA is defined by the triad of:</p>
<ul><li>Hyperglycemia: blood glucose >200 mg/dL</li></ul>
<ul><li>Metabolic acidosis: venous pH \\<7.3 or serum bicarbonate \\<15 mEq/L</li></ul>
<ul><li>Ketonemia or ketonuria</li></ul>
<table><thead><tr><th>Severity</th><th>pH</th><th>Bicarbonate</th><th>Clinical Features</th></tr></thead><tbody><tr><td>Mild</td><td>7.2–7.3</td><td>10–15 mEq/L</td><td>Alert, tolerating fluids, mild tachypnea</td></tr><tr><td>Moderate</td><td>7.1–7.2</td><td>5–10 mEq/L</td><td>Kussmaul respirations, vomiting, may be drowsy</td></tr><tr><td>Severe</td><td>\\<7.1</td><td>\\<5 mEq/L</td><td>Obtunded, Kussmaul or respiratory depression, hemodynamic compromise</td></tr></tbody></table>`,
      },
      {
        id: '9.3',
        heading: `Initial Management in the Rural ED`,
        content_html: `<div class="alert alert-info">CEREBRAL EDEMA RISK Cerebral edema is the most feared complication of DKA management in children, occurring in approximately 0.5–1% of DKA episodes with a mortality rate of 20–25%. Risk factors include: younger age (\\<5 years), new-onset diabetes, severe acidosis at presentation, higher initial BUN, and failure of sodium to rise appropriately during treatment. Rapid correction of hyperglycemia and excessive early fluid administration have been associated with increased risk, though causality remains debated. The 2024 ISPAD and PECARN FLUID trial data inform current fluid recommendations.</div>
<h4>Hour 0–1: Initial Stabilization</h4>
<ol><li>ABC assessment and monitoring: continuous cardiac monitor, SpO2, vital signs q15–30 min</li></ol>
<ol><li>Establish 2 IV sites; draw labs: glucose, BMP, VBG, CBC, UA, betahydroxybutyrate, HbA1c</li></ol>
<ol><li>Calculate corrected sodium: Corrected Na \\= Measured Na + \\[1.6 x ((Glucose – 100) / 100)\\]. Sodium should rise as glucose falls — a falling corrected sodium during treatment is a risk factor for cerebral edema.</li></ol>
<ol><li>Initial fluid bolus: NS 10–20 mL/kg over 1 hour ONLY if hemodynamically compromised. The PECARN FLUID trial found no significant difference in neurologic outcomes between faster and slower rehydration rates, but most current guidelines recommend avoiding rapid boluses unless shock is present.</li></ol>
<ol><li>DO NOT give insulin bolus. DO NOT start insulin until potassium is known and ≥3.5 mEq/L.</li></ol>
<ol><li>If potassium \\<3.5 mEq/L: give potassium replacement before starting insulin</li></ol>
<ol><li>Neurologic assessment: GCS at baseline and q1h during treatment; any decline mandates immediate evaluation for cerebral edema</li></ol>
<h4>Hour 1+: Fluid and Insulin Management</h4>
<p><strong>IV Fluids:</strong> After initial bolus (if given), begin rehydration with NS or LR at 1.5–2x maintenance rate. Total fluid replacement should be planned over 24–48 hours. When glucose falls to 250–300 mg/dL, change fluids to D5-0.45% NS (or D10 if needed) to prevent hypoglycemia while continuing insulin.</p>
<p><strong>Insulin:</strong> Begin regular insulin continuous infusion at 0.05–0.1 units/kg/hr (most guidelines now recommend starting at 0.05 units/kg/hr in children). Do NOT give insulin bolus. Target glucose decline of 50–100 mg/dL per hour. If glucose falls faster than 100 mg/dL/hr, increase dextrose concentration rather than decreasing insulin (the insulin is treating the ketoacidosis, not the hyperglycemia).</p>
<p><strong>Potassium:</strong> Virtually all DKA patients are total-body potassium depleted, even if initial serum K is normal or elevated. Once insulin is started, potassium will shift intracellularly and may drop precipitously. Add KCl 20–40 mEq/L to IV fluids as soon as K is confirmed \\<5.5 mEq/L and the patient is urinating. Monitor K every 1–2 hours during active treatment.</p>
<p><strong>Bicarbonate:</strong> DO NOT give sodium bicarbonate routinely. It is rarely indicated and may worsen cerebral edema risk. Consider only for life-threatening hyperkalemia with cardiac dysrhythmia or pH \\<6.9 with hemodynamic compromise.</p>`,
      },
      {
        id: '9.4',
        heading: `Cerebral Edema: Recognition and Emergency Treatment`,
        content_html: `<p>Warning signs of cerebral edema during DKA treatment (typically 4–12 hours after treatment initiation):</p>
<ul><li>Headache (especially new or worsening)</li></ul>
<ul><li>Altered mental status, confusion, or irritability beyond what is expected</li></ul>
<ul><li>Decline in GCS score</li></ul>
<ul><li>Abnormal posturing (decorticate/decerebrate)</li></ul>
<ul><li>Pupillary changes (unequal, fixed, or dilated)</li></ul>
<ul><li>Cushing’s triad: hypertension, bradycardia, irregular respirations</li></ul>
<ul><li>Seizures</li></ul>
<div class="alert alert-info">EMERGENCY TREATMENT OF CEREBRAL EDEMA If cerebral edema is suspected: (1) Elevate head of bed to 30 degrees. (2) Reduce IV fluid rate to minimum maintenance. (3) Mannitol 0.5–1 g/kg IV over 15–20 minutes OR Hypertonic saline (3%) 2.5–5 mL/kg IV over 10–15 minutes. (4) Intubate ONLY if absolutely necessary (avoid hyperventilation, which worsens cerebral perfusion). If you must intubate, target normocarbia. (5) Emergent CT head. (6) IMMEDIATE transfer to a pediatric ICU.</div>`,
      },
    ],
  },
  {
    id: 'ch10',
    number: '10',
    title: `Meningitis and Encephalitis`,
    sections: [
      {
        id: '10.1',
        heading: `Overview`,
        content_html: `<p>Bacterial meningitis remains a life-threatening emergency with a mortality rate of 5―10% and significant morbidity (hearing loss, neurologic sequelae) in 15–25% of survivors. While the incidence has decreased dramatically with conjugate vaccines (Hib, pneumococcal, meningococcal), cases continue to occur, particularly in under-immunized populations, neonates, and immunocompromised children. The rural physician must maintain a high index of suspicion because early treatment dramatically improves outcomes.</p>`,
      },
      {
        id: '10.2',
        heading: `Etiology by Age`,
        content_html: `<table><thead><tr><th>Age</th><th>Most Common Bacterial</th><th>Viral</th><th>Other Considerations</th></tr></thead><tbody><tr><td>Neonates (\\<28 days)</td><td>Group B Streptococcus, E. coli, Listeria monocytogenes</td><td>HSV, Enterovirus</td><td>HSV meningitis/encephalitis has high mortality if untreated</td></tr><tr><td>1–3 months</td><td>GBS, E. coli, S. pneumoniae, N. meningitidis, Listeria</td><td>HSV, Enterovirus</td><td>Transition zone: both neonatal and community pathogens</td></tr><tr><td>3 months – 18 years</td><td>S. pneumoniae (\\#1), N. meningitidis</td><td>Enterovirus, Arboviruses, HSV</td><td>Partially treated meningitis may have atypical CSF findings</td></tr></tbody></table>`,
      },
      {
        id: '10.3',
        heading: `Clinical Presentation`,
        content_html: `<p>The classic triad of fever, headache, and nuchal rigidity is present in only \\~50% of children with bacterial meningitis. Infants are particularly difficult because they present with non-specific signs:</p>
<p><strong>Infants (\\<12 months):</strong> Fever or hypothermia, irritability (paradoxical irritability — worse when held), lethargy, poor feeding, bulging fontanelle (late sign), seizures, apnea. Classic meningeal signs (Kernig, Brudzinski) are unreliable in infants.</p>
<p><strong>Older children/adolescents:</strong> Fever, severe headache, vomiting, photophobia, nuchal rigidity, altered mental status, seizures. Petechial or purpuric rash (classic for N. meningitidis but can occur with other organisms).</p>
<div class="alert alert-info">MENINGOCOCCAL DISEASE Neisseria meningitidis can cause fulminant sepsis with purpura fulminans (rapidly progressive purpuric rash with DIC). This can progress from initial symptoms to death in \\<24 hours. If petechiae/purpura are present with fever: give antibiotics immediately (ceftriaxone 100 mg/kg IV, max 2 g), do not wait for LP. Start aggressive fluid resuscitation for shock. This is a true emergency.</div>`,
      },
      {
        id: '10.4',
        heading: `Diagnostic Workup`,
        content_html: `<p><strong>Lumbar puncture (LP)</strong> is the diagnostic gold standard. However, LP should be DEFERRED if:</p>
<ul><li>Hemodynamic instability (stabilize first)</li></ul>
<ul><li>Signs of elevated ICP (papilledema, focal neurologic deficits, altered consciousness with decorticate/decerebrate posturing, irregular respirations)</li></ul>
<ul><li>Coagulopathy (platelets \\<50,000, INR >1.4)</li></ul>
<ul><li>Skin infection at LP site</li></ul>
<p><strong>If LP must be deferred:</strong> Give empiric antibiotics immediately. Do not delay antibiotics waiting for LP. Blood cultures should be obtained before antibiotics when possible. LP can be performed later when clinically safe.</p>
<p>CSF interpretation:</p>
<table><thead><tr><th>Parameter</th><th>Normal</th><th>Bacterial Meningitis</th><th>Viral Meningitis</th><th>HSV Encephalitis</th></tr></thead><tbody><tr><td>WBC (cells/mcL)</td><td>\\<5 (neonates \\<20)</td><td>1000–10,000+</td><td>50–1000</td><td>10–1000</td></tr><tr><td>Cell Type</td><td>Lymphocytes</td><td>Neutrophil predominance</td><td>Lymphocyte predominance (may be neutrophil early)</td><td>Lymphocyte/RBC predominance</td></tr><tr><td>Protein (mg/dL)</td><td>\\<45 (neonates \\<150)</td><td>>100</td><td>50–100</td><td>Elevated</td></tr><tr><td>Glucose (mg/dL)</td><td>>40 (or >60% serum glucose)</td><td>\\<40 (or \\<40% serum)</td><td>Normal</td><td>Normal to low</td></tr><tr><td>Gram Stain</td><td>No organisms</td><td>Positive in 60–90%</td><td>Negative</td><td>Negative</td></tr></tbody></table>`,
      },
      {
        id: '10.5',
        heading: `Empiric Antibiotic Therapy`,
        content_html: `<table><thead><tr><th>Age</th><th>Empiric Regimen</th><th>Key Notes</th></tr></thead><tbody><tr><td>Neonates (\\<28 days)</td><td>Ampicillin 75–100 mg/kg IV q6h + Cefotaxime 50 mg/kg IV q6–8h (or Gentamicin) + Acyclovir 20 mg/kg IV q8h</td><td>Always cover HSV in neonates. If Cefotaxime unavailable, use Ceftriaxone in neonates >7 days.</td></tr><tr><td>1–3 months</td><td>Ampicillin 75 mg/kg IV q6h + Ceftriaxone 50 mg/kg IV q12h + Vancomycin 15 mg/kg IV q6h</td><td>Ampicillin for Listeria coverage; Vancomycin for resistant pneumococcus</td></tr><tr><td>>3 months</td><td>Ceftriaxone 50 mg/kg IV q12h (max 2 g/dose) + Vancomycin 15 mg/kg IV q6h (max 1 g/dose)</td><td>Consider Dexamethasone 0.15 mg/kg IV q6h x 4 days (given 15–30 min BEFORE first antibiotic dose; strongest evidence for H. influenzae, some evidence for pneumococcal meningitis)</td></tr></tbody></table>`,
      },
      {
        id: '10.6',
        heading: `HSV Encephalitis`,
        content_html: `<p>Herpes simplex virus encephalitis deserves special emphasis because it is rapidly fatal without treatment (mortality >70% untreated) but has dramatically improved outcomes with early acyclovir (mortality \\~20%, with further improvement the earlier treatment is initiated).</p>
<p>Suspect HSV encephalitis in:</p>
<ul><li>Any neonate with fever, seizures, lethargy, vesicular skin lesions, or abnormal LFTs</li></ul>
<ul><li>Any infant/child with encephalitis (fever + altered mental status + focal neurologic signs or seizures)</li></ul>
<ul><li>CSF showing lymphocytic pleocytosis with RBCs and elevated protein</li></ul>
<ul><li>Temporal lobe abnormality on CT or MRI</li></ul>
<p><strong>Treatment:</strong> Acyclovir 20 mg/kg IV q8h (neonates) or 10 mg/kg IV q8h (older children) for 14–21 days. Ensure adequate hydration to prevent acyclovir nephrotoxicity.</p>`,
      },
    ],
  },
  {
    id: 'ch11',
    number: '11',
    title: `Pediatric Trauma Stabilization`,
    sections: [
      {
        id: '11.1',
        heading: `Overview`,
        content_html: `<p>Trauma is the leading cause of death in children aged 1–18 years in the United States. Rural areas face disproportionate trauma burden due to agricultural injuries, ATV/UTV accidents, longer transport times, and limited access to pediatric surgical and critical care resources. The rural ED physician must be prepared to perform the primary survey, identify life-threatening injuries, and stabilize the pediatric trauma patient for transfer to a pediatric trauma center.</p>`,
      },
      {
        id: '11.2',
        heading: `Primary Survey — ABCDE with Pediatric Modifications`,
        content_html: `<h4>A — Airway with C-Spine Protection</h4>
<p>Assume cervical spine injury in all significant trauma mechanisms. Maintain manual in-line stabilization. Pediatric considerations: large occiput in children \\<8 years causes neck flexion when supine on a flat backboard — use an occipital recess or pad under the torso to achieve neutral alignment. Airway management in trauma requires jaw thrust (not head tilt-chin lift) to avoid cervical motion.</p>
<h4>B — Breathing and Ventilation</h4>
<p>Immediately life-threatening thoracic injuries: tension pneumothorax, open pneumothorax ("sucking chest wound"), massive hemothorax, flail chest (rare in children due to compliant chest wall). Children can maintain oxygenation until sudden decompensation — intervene early based on mechanism and clinical trajectory.</p>
<h4>C — Circulation and Hemorrhage Control</h4>
<p>Direct pressure for external hemorrhage. Tourniquets for life-threatening extremity hemorrhage not controlled by direct pressure. Pediatric blood volume is approximately 80 mL/kg — what appears to be a small blood loss in absolute volume may represent a significant percentage of circulating volume. Femur fractures in children can sequester 250–500 mL of blood; pelvic fractures even more.</p>
<table><thead><tr><th>Class</th><th>Blood Loss (est.)</th><th>Heart Rate</th><th>BP</th><th>Mental Status</th><th>Intervention</th></tr></thead><tbody><tr><td>I</td><td>\\<15%</td><td>Normal or mild increase</td><td>Normal</td><td>Normal, anxious</td><td>Crystalloid</td></tr><tr><td>II</td><td>15–30%</td><td>Moderate increase</td><td>Normal (narrow pulse pressure)</td><td>Irritable, confused</td><td>Crystalloid, consider blood</td></tr><tr><td>III</td><td>30–40%</td><td>Marked increase</td><td>Decreased</td><td>Altered, lethargic</td><td>Crystalloid + blood products</td></tr><tr><td>IV</td><td>>40%</td><td>Tachycardia or bradycardia (agonal)</td><td>Profoundly decreased</td><td>Unresponsive</td><td>Massive transfusion protocol</td></tr></tbody></table>
<p><strong>Massive Transfusion Protocol (MTP):</strong> For children with hemorrhagic shock unresponsive to crystalloid: pRBC 10–20 mL/kg, FFP 10–20 mL/kg, and Platelets 5–10 mL/kg in a 1:1:1 ratio. Use O-negative or type-specific blood. Tranexamic acid (TXA) 15–20 mg/kg IV (max 1 g) over 10 minutes within 3 hours of injury, then 2 mg/kg/hr for 8 hours.</p>
<h4>D — Disability</h4>
<p>GCS (modified for pediatric age), pupils, and lateralizing signs. A GCS ≤8 mandates intubation for airway protection. Pediatric GCS modification: for verbal score in preverbal children, use cooing/babbling (5), irritable crying (4), crying to pain (3), moaning (2), none (1).</p>
<h4>E — Exposure and Environment</h4>
<p>Fully expose, rapidly assess, and cover immediately. Hypothermia prevention is critical in pediatric trauma patients — use warmed fluids, warming blankets, and elevated room temperature.</p>`,
      },
      {
        id: '11.3',
        heading: `Traumatic Brain Injury (TBI)`,
        content_html: `<p>TBI is the leading cause of trauma-related death in children. Management priorities in the rural ED:</p>
<ul><li>Maintain SpO2 >90% and systolic BP at age-appropriate normal (hypoxia and hypotension double mortality in TBI)</li></ul>
<ul><li>Elevate HOB 30 degrees (if no spinal injury concern) to promote venous drainage</li></ul>
<ul><li>Treat elevated ICP (signs: declining GCS, unequal pupils, Cushing’s triad): Hypertonic saline (3%) 2–5 mL/kg IV or Mannitol 0.5–1 g/kg IV</li></ul>
<ul><li>Avoid hyperventilation except as a temporizing measure for herniation (target PaCO2 35–40 mmHg; brief hyperventilation to PaCO2 30–35 for active herniation only)</li></ul>
<ul><li>CT head without contrast for all children with GCS \\<15 after trauma, loss of consciousness, mechanism of injury meeting PECARN criteria, or clinical concern</li></ul>
<ul><li>Transfer to a pediatric trauma center with neurosurgical capability</li></ul>`,
      },
      {
        id: '11.4',
        heading: `Abdominal Trauma`,
        content_html: `<p>Solid organ injury (spleen and liver most commonly) is the leading cause of intra-abdominal hemorrhage in children. The compliant pediatric abdominal wall provides less protection, and the relatively larger solid organs are more exposed. FAST exam (Focused Assessment with Sonography in Trauma) is useful for detecting free fluid but is operator-dependent. CT with IV contrast is the gold standard for characterizing injury. In the rural ED, the priority is to identify the child who needs operative intervention and transfer them urgently.</p>
<p>Signs of significant intra-abdominal injury: abdominal tenderness or distension, seat belt sign (ecchymosis across abdomen), handlebar sign (epigastric bruising), declining hemoglobin, hemodynamic instability unresponsive to fluid resuscitation. Most solid organ injuries in children are managed non-operatively at pediatric trauma centers.</p>`,
      },
      {
        id: '11.5',
        heading: `Non-Accidental Trauma (Child Abuse)`,
        content_html: `<p>The rural emergency physician must maintain a high index of suspicion for non-accidental trauma (NAT). Approximately 1,800 children die from abuse or neglect annually in the US, and many more suffer non-fatal injuries. Key red flags:</p>
<ul><li>Injuries inconsistent with reported mechanism or developmental stage</li></ul>
<ul><li>Multiple injuries in various stages of healing</li></ul>
<ul><li>Injuries in non-mobile infants ("if they can’t cruise, they can’t bruise")</li></ul>
<ul><li>Patterned injuries (loop marks, bite marks, cigarette burns)</li></ul>
<ul><li>Subdural hematomas in infants (especially bilateral) without adequate trauma history</li></ul>
<ul><li>Metaphyseal corner fractures ("bucket handle" fractures) — highly specific for abuse</li></ul>
<ul><li>Rib fractures in infants (especially posterior)</li></ul>
<ul><li>Delay in seeking medical care</li></ul>
<ul><li>Changing or inconsistent history between caregivers</li></ul>
<p>When NAT is suspected: Complete a skeletal survey (children \\<2 years), obtain labs (CBC, CMP, coagulation studies, lipase, UA), consult child protective services, and document findings meticulously with photographs. The physician is a mandated reporter — reporting suspected abuse is a legal obligation, not a clinical judgment.</p>`,
      },
    ],
  },
  {
    id: 'ch12',
    number: '12',
    title: `Additional Critical Pediatric Emergencies`,
    sections: [
      {
        id: '12.1',
        heading: `Acute Abdomen: Appendicitis`,
        content_html: `<p>Appendicitis is the most common surgical emergency in children, with a peak incidence between 10–19 years. In the rural ED, the challenge is timely diagnosis and transfer for surgical management. Children \\<5 years have higher rates of perforation at diagnosis (up to 80%) because their symptoms are often atypical and diagnosis is delayed.</p>
<h4>Classic vs. Atypical Presentation</h4>
<p>The classic progression — periumbilical pain migrating to the RLQ, followed by anorexia, nausea/vomiting, and low-grade fever — is present in only about 50–60% of children. Young children may present with irritability, refusal to walk, diffuse tenderness, or diarrhea. The Pediatric Appendicitis Score (PAS) and Alvarado Score help risk-stratify, but clinical judgment remains essential.</p>
<h4>Diagnostic Approach</h4>
<ul><li>Labs: CBC (WBC >10,000 with left shift supports but does not confirm), CRP (elevated in most cases by 12+ hours), UA (rule out UTI; mild pyuria can occur with pelvic appendicitis)</li></ul>
<ul><li>Imaging: Ultrasound is the first-line imaging modality in children (sensitivity 85–95%, specificity 90–98% in experienced hands). CT abdomen/pelvis with IV contrast if US is non-diagnostic and clinical suspicion remains moderate-high. MRI is increasingly used in pediatric centers but rarely available in rural EDs.</li></ul>
<ul><li>Point-of-care ultrasound (POCUS): Even a non-diagnostic RLQ ultrasound can be useful — a non-compressible, blind-ending tubular structure >6 mm with surrounding inflammation is diagnostic</li></ul>
<h4>Management in the Rural ED</h4>
<p>Once appendicitis is diagnosed or strongly suspected: NPO, IV fluids, pain control (morphine 0.1 mg/kg IV or ketorolac 0.5 mg/kg IV \\[max 30 mg\\] — analgesia does not mask surgical findings), antibiotics if perforation suspected (Ceftriaxone + Metronidazole or Piperacillin-Tazobactam), and transfer to a facility with pediatric surgery.</p>`,
      },
      {
        id: '12.2',
        heading: `Intussusception`,
        content_html: `<p>Intussusception is the most common cause of bowel obstruction in children aged 3 months to 6 years (peak 5–9 months). It occurs when a proximal segment of bowel telescopes into a distal segment, most commonly ileocolic.</p>
<h4>Classic Triad (present in \\<50% of cases)</h4>
<ul><li>Colicky abdominal pain (intermittent, severe episodes with pain-free intervals)</li></ul>
<ul><li>Vomiting (initially non-bilious, then bilious as obstruction progresses)</li></ul>
<ul><li>"Currant jelly" stools (blood and mucus — a LATE sign indicating mucosal ischemia)</li></ul>
<p>More commonly, the child presents with intermittent episodes of severe crying/pain with leg-drawing, lethargy or altered mental status between episodes (a classic pitfall — intussusception can present as altered mental status without obvious abdominal complaints), and a palpable sausage-shaped mass in the RUQ.</p>
<h4>Diagnosis and Management</h4>
<p>Ultrasound is the diagnostic modality of choice ("target sign" or "pseudokidney sign" on transverse and longitudinal views respectively; sensitivity and specificity both >95%). Air or hydrostatic enema under fluoroscopy is both diagnostic and therapeutic (success rate 80–95% for uncomplicated cases). In the rural ED without pediatric radiology capability for therapeutic enema: diagnose with ultrasound, provide IV fluid resuscitation, NPO, NG tube if vomiting, and transfer urgently to a facility with pediatric surgery and interventional radiology.</p>
<div class="alert alert-warning">SURGICAL EMERGENCIES Indications for surgical consultation/transfer rather than enema reduction: peritonitis on exam, free air on imaging (perforation), hemodynamic instability, prolonged symptoms (>48–72 hours), or multiple failed reduction attempts. Intussusception can recur in 5–10% of cases after successful reduction.</div>`,
      },
      {
        id: '12.3',
        heading: `Testicular Torsion`,
        content_html: `<p>Testicular torsion is a true urologic emergency with a 4–6 hour window for salvage before irreversible ischemic damage occurs. Peak incidence is bimodal: neonatal and peripubertal (12–18 years). In the rural setting, the time from symptom onset to definitive surgical management is often prolonged, making rapid diagnosis and transfer critical.</p>
<h4>Presentation</h4>
<p>Acute onset of severe, unilateral scrotal pain, often with nausea/vomiting. The affected testis is typically high-riding, with a transverse lie, and an absent cremasteric reflex (the most sensitive physical finding). Onset during sleep or physical activity is common. Distinguish from epididymitis (gradual onset, positive Prehn’s sign \\[relief with elevation\\], cremasteric reflex present) and torsion of the appendix testis (focal tenderness at the upper pole, "blue dot sign").</p>
<h4>Management</h4>
<p>If testicular torsion is clinically suspected:</p>
<ul><li>Urology consultation and OR booking should not wait for ultrasound confirmation</li></ul>
<ul><li>Doppler ultrasound can confirm absent or decreased blood flow, but a normal ultrasound does not exclude torsion if clinical suspicion is high</li></ul>
<ul><li>Manual detorsion may be attempted while awaiting surgery: "open the book" technique (rotate the affected testis laterally/outward). Successful detorsion is indicated by pain relief and return of normal testis position.</li></ul>
<ul><li>Transfer immediately to a facility with urologic surgical capability if not available locally</li></ul>
<ul><li>Time is testicle: >90% salvage if detorsion within 6 hours; \\<10% after 24 hours</li></ul>`,
      },
      {
        id: '12.4',
        heading: `Supraventricular Tachycardia (SVT)`,
        content_html: `<p>SVT is the most common symptomatic tachydysrhythmia in children. Heart rates are typically 220–280 bpm in infants and 150–250 bpm in older children. Prolonged SVT can lead to heart failure and cardiogenic shock, particularly in infants who may not manifest symptoms until they are in frank failure.</p>
<h4>Management Algorithm</h4>
<p><strong>Stable SVT (normal perfusion, normal mental status):</strong></p>
<ol><li>Vagal maneuvers first: ice to face (infants — place ice-water bag over face for 15–20 seconds), Valsalva maneuver or bearing down (older children), carotid sinus massage (adolescents). Do not use ocular pressure.</li></ol>
<ol><li>Adenosine: 0.1 mg/kg rapid IV push (max first dose 6 mg), followed immediately by a 5–10 mL NS rapid flush. Must be given as close to the heart as possible (antecubital or higher preferred). If no response, give 0.2 mg/kg (max 12 mg). Record a rhythm strip during administration.</li></ol>
<ol><li>If adenosine fails: consider procainamide 15 mg/kg IV over 30–60 min with continuous cardiac monitoring, or amiodarone 5 mg/kg IV over 20–60 min. Consult pediatric cardiology.</li></ol>
<p><strong>Unstable SVT (signs of shock, altered mental status, poor perfusion):</strong></p>
<p>Synchronized cardioversion: Start at 0.5–1 J/kg; if unsuccessful, increase to 2 J/kg. Sedate if possible (ketamine 1–2 mg/kg IV is ideal — rapid onset, maintains hemodynamics). If IV access is delayed, cardiovert without sedation in a critically unstable child.</p>`,
      },
      {
        id: '12.5',
        heading: `Acute Adrenal Crisis`,
        content_html: `<p>Adrenal crisis is an uncommon but lethal emergency that can present as refractory shock, particularly in children with known adrenal insufficiency (congenital adrenal hyperplasia, chronic corticosteroid use) who experience physiologic stress (illness, surgery, trauma). It can also be the presenting feature of previously undiagnosed adrenal insufficiency.</p>
<h4>Recognition</h4>
<p>Suspect in any child with: refractory hypotension despite fluids and vasopressors, hypoglycemia + hyponatremia + hyperkalemia (classic electrolyte triad), hyperpigmentation, ambiguous genitalia in a neonate, or known adrenal insufficiency with acute illness.</p>
<h4>Treatment</h4>
<p><strong>Hydrocortisone stress dose:</strong> 2 mg/kg IV bolus (max 100 mg), then 25–50 mg/m²/day divided q6–8h. This is lifesaving and should be given empirically if adrenal crisis is suspected — do not wait for cortisol levels. Concurrent fluid resuscitation with D5-NS for hypoglycemia and volume depletion.</p>`,
      },
      {
        id: '12.6',
        heading: `Toxic Ingestions and Poisoning`,
        content_html: `<p>Accidental ingestion is the most common poisoning exposure in children, with peak incidence in 1–3 year olds. The rural ED must be prepared to manage the initial stabilization of common toxic ingestions while consulting Poison Control (1-800-222-1222).</p>
<h4>General Approach</h4>
<ol><li>Stabilize ABCs</li></ol>
<ol><li>Identify the toxidrome if possible (see table below)</li></ol>
<ol><li>Call Poison Control (1-800-222-1222) for every suspected ingestion</li></ol>
<ol><li>Decontamination: Activated charcoal 1 g/kg PO (max 50 g) if ingestion was within 1–2 hours and the child is alert with intact airway. Contraindicated with caustics, hydrocarbons, or altered mental status.</li></ol>
<ol><li>Specific antidotes as indicated (see below)</li></ol>
<h4>Common Toxidromes</h4>
<table><thead><tr><th>Toxidrome</th><th>Signs</th><th>Common Agents</th><th>Antidote</th></tr></thead><tbody><tr><td>Anticholinergic</td><td>"Hot as a hare, blind as a bat, dry as a bone, red as a beet, mad as a hatter"</td><td>Diphenhydramine, atropine, jimsonweed, tricyclics</td><td>Physostigmine (use with caution)</td></tr><tr><td>Cholinergic</td><td>SLUDGE/DUMBELS: Salivation, Lacrimation, Urination, Defecation, GI distress, Emesis, Bradycardia</td><td>Organophosphates, carbamates</td><td>Atropine + Pralidoxime</td></tr><tr><td>Opioid</td><td>CNS depression, respiratory depression, miosis</td><td>Oxycodone, fentanyl, heroin, methadone</td><td>Naloxone 0.1 mg/kg IV (max 2 mg); may repeat</td></tr><tr><td>Sympathomimetic</td><td>Tachycardia, hypertension, hyperthermia, mydriasis, diaphoresis, agitation</td><td>Amphetamines, cocaine, ephedrine</td><td>Benzodiazepines for agitation/seizures; avoid beta-blockers</td></tr><tr><td>Sedative-Hypnotic</td><td>CNS depression, respiratory depression, normal pupils, hypothermia</td><td>Benzodiazepines, barbiturates, ethanol</td><td>Flumazenil (benzos only; caution with chronic use/seizure risk)</td></tr></tbody></table>
<h4>Critical Pediatric Ingestions Requiring Immediate Action</h4>
<ul><li><strong>Acetaminophen:</strong> N-acetylcysteine (NAC) 150 mg/kg IV over 1 hour (loading), then 50 mg/kg over 4 hours, then 100 mg/kg over 16 hours. Treat based on Rumack-Matthew nomogram; if level unavailable, treat empirically for significant ingestion (>150 mg/kg).</li></ul>
<ul><li><strong>Iron:</strong> Deferoxamine 15 mg/kg/hr IV for serum iron >500 mcg/dL or symptomatic with levels >350. Whole bowel irrigation with GoLYTELY for tablets.</li></ul>
<ul><li><strong>Calcium Channel Blockers/Beta-Blockers:</strong> Glucagon 0.05–0.1 mg/kg IV (beta-blockers), High-dose insulin euglycemia therapy (CCBs): Regular insulin 1 unit/kg bolus then 0.5–1 unit/kg/hr with dextrose infusion. IV calcium, vasopressors. These ingestions can be rapidly fatal.</li></ul>
<ul><li><strong>Tricyclic Antidepressants:</strong> Sodium bicarbonate 1–2 mEq/kg IV bolus for QRS widening (>100 ms). Continuous cardiac monitoring. Seizures treated with benzodiazepines.</li></ul>
<ul><li><strong>Button Battery Ingestion:</strong> Emergent removal if in esophagus (can cause esophageal perforation within 2 hours). Honey 10 mL PO every 10 minutes while awaiting endoscopy if >12 months old and \\<12 hours since ingestion. X-ray to confirm location.</li></ul>`,
      },
    ],
  },
  {
    id: 'ch13',
    number: '13',
    title: `Burns`,
    sections: [
      {
        id: '13.1',
        heading: `Epidemiology and Classification`,
        content_html: `<p>Burns are a major cause of morbidity in children, with scalds (hot liquid) being the most common mechanism in children under 5 and flame burns predominating in older children and adolescents. In the rural setting, agricultural burns, wood stove injuries, and delayed access to burn centers are additional considerations.</p>
<h4>Burn Depth Classification</h4>
<table><thead><tr><th>Depth</th><th>Appearance</th><th>Sensation</th><th>Healing</th></tr></thead><tbody><tr><td>Superficial (1st degree)</td><td>Red, dry, no blisters, blanches</td><td>Painful</td><td>3–7 days, no scarring</td></tr><tr><td>Superficial Partial (2nd degree)</td><td>Pink/red, moist, blisters, blanches</td><td>Very painful</td><td>7–21 days, minimal scarring</td></tr><tr><td>Deep Partial (2nd degree)</td><td>White/red, may not blanch, less moisture</td><td>Decreased sensation</td><td>3–8 weeks, scarring likely; may need grafting</td></tr><tr><td>Full Thickness (3rd degree)</td><td>White, brown, or charred; dry, leathery, no blanching</td><td>Insensate</td><td>Will not heal without grafting</td></tr></tbody></table>`,
      },
      {
        id: '13.2',
        heading: `Burn Size Estimation`,
        content_html: `<p>The Lund-Browder chart is the most accurate method for estimating total body surface area (TBSA) in children because it accounts for the proportionally larger head and smaller extremities of young children. The "rule of nines" is less accurate in children. As a rapid estimate, the child’s palm (including fingers) represents approximately 1% TBSA.</p>`,
      },
      {
        id: '13.3',
        heading: `Fluid Resuscitation — Parkland Formula (Modified for Children)`,
        content_html: `<p>For burns >10% TBSA in children (>20% in adults):</p>
<p><strong>Parkland Formula:</strong> 4 mL x weight (kg) x %TBSA burned \\= total crystalloid volume for first 24 hours. Give half of this volume in the first 8 hours from the time of burn (not from time of arrival), and the other half over the next 16 hours. Use LR as the resuscitation fluid.</p>
<p><strong>Maintenance fluids in addition:</strong> Children \\<30 kg also require maintenance fluids with dextrose (D5-LR or D5-NS at Holliday-Segar rates) because they do not have adequate glycogen stores to sustain glucose during the stress response.</p>
<p><strong>Goal:</strong> Urine output 1 mL/kg/hr for children \\<30 kg; 0.5–1 mL/kg/hr for children >30 kg. Adjust fluid rate to maintain this target. Over-resuscitation is as dangerous as under-resuscitation (causes compartment syndrome, pulmonary edema, abdominal compartment syndrome).</p>`,
      },
      {
        id: '13.4',
        heading: `Transfer Criteria to Burn Center`,
        content_html: `<p>American Burn Association criteria for burn center referral in children:</p>
<ul><li>Partial thickness burns >10% TBSA</li></ul>
<ul><li>Full thickness burns of any size</li></ul>
<ul><li>Burns involving face, hands, feet, genitalia, perineum, or major joints</li></ul>
<ul><li>Electrical or chemical burns</li></ul>
<ul><li>Inhalation injury</li></ul>
<ul><li>Burns with significant co-existing trauma</li></ul>
<ul><li>Burns in children with significant comorbidities</li></ul>
<ul><li>Circumferential burns (risk of compartment syndrome; may need escharotomy)</li></ul>
<ul><li>Suspected non-accidental injury</li></ul>`,
      },
      {
        id: '13.5',
        heading: `Initial ED Management`,
        content_html: `<ul><li>Stop the burning process: remove clothing, irrigate chemical burns with copious water</li></ul>
<ul><li>Cool the burn with room-temperature water for 20 minutes (within 3 hours of injury). Do NOT use ice (causes vasoconstriction and worsens injury).</li></ul>
<ul><li>Cover with clean, dry dressings; apply Silvadene or Aquacel Ag to partial thickness burns</li></ul>
<ul><li>Pain management is critical: IV morphine 0.1 mg/kg or intranasal fentanyl 1.5 mcg/kg for moderate-severe burns. Ibuprofen 10 mg/kg PO for minor burns.</li></ul>
<ul><li>Tetanus prophylaxis if indicated</li></ul>
<ul><li>NPO if transfer anticipated (may need operative management)</li></ul>
<ul><li>Assess for inhalation injury: singed nasal hairs, carbonaceous sputum, hoarseness, stridor, facial burns. If present, early intubation is advisable before airway edema progresses.</li></ul>`,
      },
    ],
  },
  {
    id: 'ch14',
    number: '14',
    title: `Practical Considerations for the Rural ED`,
    sections: [
      {
        id: '14.1',
        heading: `Equipment Readiness`,
        content_html: `<p>The Emergency Medical Services for Children (EMSC) program has established guidelines for pediatric readiness in emergency departments. Rural and Critical Access Hospital EDs should maintain a minimum set of pediatric-specific equipment based on the National Pediatric Readiness Project recommendations. A Broselow tape or equivalent length-based resuscitation system should be immediately available in every resuscitation bay. Pediatric drug dosing sheets (pre-calculated or length-based) should be laminated and attached to the resuscitation cart.</p>
<h4>Minimum Pediatric Equipment by Category</h4>
<table><thead><tr><th>Category</th><th>Equipment</th><th>Sizes to Stock</th></tr></thead><tbody><tr><td>Airway</td><td>Oral/nasal airways, ETT (cuffed), laryngoscope blades, LMA, video laryngoscope, BVM</td><td>Infant through adult (full range)</td></tr><tr><td>Breathing</td><td>HFNC system, non-rebreather masks, nasal cannulas, nebulizer setup</td><td>Infant, pediatric, adult masks</td></tr><tr><td>Circulation</td><td>IV catheters, IO needles, syringe pumps, infusion pumps, Broselow tape</td><td>22–14 gauge IVs; IO: EZ-IO with PD and AD needles</td></tr><tr><td>Monitoring</td><td>Pediatric BP cuffs, SpO2 probes (infant/pediatric), cardiac leads, temperature</td><td>Neonatal through adult cuffs</td></tr><tr><td>Immobilization</td><td>Pediatric C-collars, backboards, splints</td><td>Infant, small child, large child, adult</td></tr><tr><td>Medications</td><td>Pre-calculated code cards, epinephrine, atropine, adenosine, dextrose (D10, D25), RSI medications, antibiotics</td><td>Weight-based dosing references</td></tr></tbody></table>`,
      },
      {
        id: '14.2',
        heading: `Pediatric Rapid Sequence Intubation (RSI)`,
        content_html: `<p>Intubation of the critically ill child is one of the highest-risk procedures performed in the rural ED. A structured approach reduces complications:</p>
<h4>Pre-Intubation Checklist</h4>
<ul><li><strong>ETT Size:</strong> Cuffed ETT size \\= (Age/4) + 3.5. Have one size smaller available. Cuffed ETTs are now preferred at all ages including neonates.</li></ul>
<ul><li><strong>ETT Depth:</strong> Depth of insertion (cm at lip) \\= ETT size x 3 (e.g., 4.0 ETT inserted to 12 cm at lip)</li></ul>
<ul><li><strong>Blade:</strong> Miller 0–1 for neonates/infants, Miller 2 or Mac 2 for children, Mac 3–4 for adolescents</li></ul>
<ul><li><strong>Suction:</strong> Working and within reach; Yankauer and catheter suction</li></ul>
<ul><li><strong>Pre-oxygenation:</strong> 3–5 minutes of high-flow O2 or HFNC/BVM; apneic oxygenation via nasal cannula at 5 L/min during attempt</li></ul>
<h4>RSI Medications</h4>
<table><thead><tr><th>Agent</th><th>Dose</th><th>Onset</th><th>Duration</th><th>Notes</th></tr></thead><tbody><tr><td>INDUCTION</td><td></td><td></td><td></td><td></td></tr><tr><td>Etomidate</td><td>0.3 mg/kg IV</td><td>15–45 sec</td><td>5–15 min</td><td>Hemodynamically stable; avoid in sepsis (adrenal suppression)</td></tr><tr><td>Ketamine</td><td>1–2 mg/kg IV</td><td>30–60 sec</td><td>10–20 min</td><td>Preferred in asthma, sepsis, hemodynamic instability. Bronchodilator.</td></tr><tr><td>Propofol</td><td>1–3 mg/kg IV</td><td>15–45 sec</td><td>5–10 min</td><td>Causes hypotension; avoid in hemodynamically unstable patients</td></tr><tr><td>PARALYTIC</td><td></td><td></td><td></td><td></td></tr><tr><td>Succinylcholine</td><td>1.5–2 mg/kg IV</td><td>30–60 sec</td><td>6–10 min</td><td>Caution: hyperkalemia risk in burns, crush, denervation, myopathies. Avoid in known hyperkalemia.</td></tr><tr><td>Rocuronium</td><td>1–1.2 mg/kg IV</td><td>60–90 sec</td><td>30–60 min</td><td>Safe in most conditions; can reverse with sugammadex 16 mg/kg if needed</td></tr></tbody></table>`,
      },
      {
        id: '14.3',
        heading: `Procedural Sedation in the Rural ED`,
        content_html: `<p>Ketamine is the procedural sedation agent of choice for most pediatric procedures in the rural ED:</p>
<ul><li><strong>Dose:</strong> 1–2 mg/kg IV over 1–2 minutes, or 4–5 mg/kg IM</li></ul>
<ul><li><strong>Onset:</strong> IV: 1 minute, IM: 3–5 minutes</li></ul>
<ul><li><strong>Duration:</strong> IV: 15–20 min, IM: 20–40 min</li></ul>
<ul><li><strong>Advantages:</strong> Maintains airway reflexes and respiratory drive, hemodynamically stable, provides analgesia + dissociation</li></ul>
<ul><li><strong>Side effects:</strong> Emergence reactions (less common in children than adults), emesis (pretreat with ondansetron), laryngospasm (rare; treat with positive pressure ventilation or succinylcholine 0.5 mg/kg if refractory)</li></ul>`,
      },
      {
        id: '14.4',
        heading: `Pain Management`,
        content_html: `<p>Pediatric pain is frequently undertreated in the ED. Use age-appropriate pain scales (FLACC for 0–7 years, Wong-Baker FACES for 3–12 years, Numeric Rating Scale for >8 years) and treat aggressively:</p>
<table><thead><tr><th>Pain Level</th><th>Recommended Agent(s)</th><th>Dose</th></tr></thead><tbody><tr><td>Mild</td><td>Ibuprofen +/- Acetaminophen</td><td>Ibuprofen 10 mg/kg PO q6h; Acetaminophen 15 mg/kg PO/PR q4h (max 75 mg/kg/day)</td></tr><tr><td>Moderate</td><td>Above + Intranasal Fentanyl</td><td>IN Fentanyl 1.5–2 mcg/kg (max 100 mcg); may repeat x1 at 10–15 min</td></tr><tr><td>Severe</td><td>IV Morphine or IV Fentanyl</td><td>Morphine 0.1 mg/kg IV q15–20 min PRN; Fentanyl 1 mcg/kg IV q30–60 min PRN</td></tr><tr><td>Topical/Local</td><td>LET gel, Lidocaine, Nerve blocks</td><td>LET (4% lidocaine, 0.1% epi, 0.5% tetracaine) for lacerations; Buffered lidocaine for injections</td></tr></tbody></table>
<div class="alert alert-warning">INTRANASAL FENTANYL Intranasal fentanyl (using a mucosal atomization device — MAD) is an excellent option in the rural ED because it requires no IV access, has rapid onset (5–10 minutes), and is safe and effective. It is particularly useful for fracture pain, burn dressing changes, and procedures where IV access is not yet established. Keep atomization devices stocked and staff trained.</div>`,
      },
      {
        id: '14.5',
        heading: `Communication with Families`,
        content_html: `<p>Caring for a critically ill child is devastating for families. The rural ED physician plays a unique role because the family may know you personally and the community is close-knit. Key principles:</p>
<ul><li>Assign a dedicated team member to be with the family during resuscitation, providing real-time updates</li></ul>
<ul><li>Use plain language: avoid jargon, explain what is happening and why</li></ul>
<ul><li>Offer families the option to be present during resuscitation (studies show this reduces anxiety and facilitates grieving if the outcome is poor)</li></ul>
<ul><li>Be honest about the situation and the plan: "Your child is very sick. We are doing everything we can here, and we have called the children’s hospital team to help us."</li></ul>
<ul><li>Document conversations with families thoroughly</li></ul>`,
      },
      {
        id: '14.6',
        heading: `Quality Improvement and Ongoing Education`,
        content_html: `<p>Maintaining pediatric competence in a low-volume rural ED requires deliberate, systematic effort:</p>
<ul><li>Conduct quarterly mock pediatric resuscitation drills (mock codes, sepsis drills, intubation practice)</li></ul>
<ul><li>Review every pediatric critical case as a multidisciplinary debrief within 72 hours</li></ul>
<ul><li>Maintain current PALS certification for all ED physicians and nurses</li></ul>
<ul><li>Utilize simulation-based training (even low-fidelity simulation with manikins is effective)</li></ul>
<ul><li>Participate in pediatric readiness assessments through the EMSC program</li></ul>
<ul><li>Establish and maintain telemedicine relationships with pediatric emergency medicine physicians</li></ul>
<ul><li>Keep clinical references accessible: pocket cards, laminated sheets on resuscitation carts, quick-reference apps</li></ul>`,
      },
      {
        id: '14.7',
        heading: `When to Transfer: Decision Framework`,
        content_html: `<p>A practical decision framework for the rural ED physician considering transfer:</p>
<table><thead><tr><th>Transfer Immediately</th><th>Consider Transfer (based on trajectory)</th><th>May Manage Locally</th></tr></thead><tbody><tr><td>Septic shock requiring vasopressors</td><td>Moderate-severe croup requiring >2 epinephrine treatments</td><td>Mild croup responding to dexamethasone</td></tr><tr><td>Status epilepticus refractory to 2nd-line agents</td><td>Pneumonia requiring HFNC at near-maximum settings</td><td>Mild-moderate bronchiolitis with adequate SpO2</td></tr><tr><td>Severe DKA (pH \\<7.1)</td><td>DKA responding to protocol but requires insulin infusion monitoring beyond local capability</td><td>Simple febrile seizure with clear source</td></tr><tr><td>Suspected meningitis with instability</td><td>Asthma requiring continuous nebulization or magnesium</td><td>Mild dehydration responding to ORT</td></tr><tr><td>Major trauma (GCS ≤8, hemodynamic instability)</td><td>Any ingestion with potential for delayed toxicity</td><td>Minor burns \\<5% TBSA, superficial</td></tr><tr><td>Suspected cardiac emergency (SVT unresponsive, myocarditis)</td><td>Any child where you feel uncomfortable with the clinical trajectory</td><td>Mild asthma responding to standard therapy</td></tr><tr><td>Any child requiring intubation or mechanical ventilation</td><td>Surgical emergencies (appendicitis, intussusception, torsion)</td><td>Uncomplicated UTI or skin infection</td></tr></tbody></table>
<div class="alert alert-warning">FINAL PRINCIPLE When in doubt, transfer. The risk of transferring a child who might have been managed locally is far lower than the risk of keeping a child who deteriorates beyond your facility’s capability. Your job in the rural ED is to keep the child alive and stable until definitive care is reached. Every action in the first 24 hours is directed toward that goal.</div>
<p># <strong>Appendices</strong></p>`,
      },
    ],
  },
  {
    id: 'ch15',
    number: '15',
    title: `Pediatric Cardiac Arrest and PALS Algorithms`,
    sections: [
      {
        id: '15.1',
        heading: `Epidemiology and Outcomes`,
        content_html: `<p>Pediatric cardiac arrest differs fundamentally from adult cardiac arrest. While adult arrests are predominantly cardiac in origin (acute MI, arrhythmia), the vast majority of pediatric arrests are <strong>secondary</strong> — resulting from progressive respiratory failure or circulatory shock that deteriorates to cardiopulmonary failure.</p>
<div class="alert alert-danger">CRITICAL: Most pediatric cardiac arrests are preventable. Early recognition and aggressive treatment of respiratory failure and shock BEFORE arrest is the single most important intervention in pediatric emergency medicine.</div>
<h4>Survival Statistics</h4>
<table><thead><tr><th>Setting</th><th>Survival to Discharge</th><th>Favorable Neurologic Outcome</th></tr></thead><tbody><tr><td>Out-of-Hospital Cardiac Arrest (OHCA)</td><td>8–12%</td><td>~5–8%</td></tr><tr><td>In-Hospital Cardiac Arrest (IHCA)</td><td>40–50%</td><td>~35%</td></tr></tbody></table>
<p>The dramatically better outcomes in IHCA reflect earlier recognition, monitored rhythms, and immediate access to interventions. In the rural ED, the goal is to replicate IHCA conditions as closely as possible: early detection, prepared teams, and rehearsed algorithms.</p>
<div class="alert alert-warning">CLINICAL PEARL: Prevention is greater than resuscitation. The child who never arrests has far better outcomes than the child who is resuscitated from arrest. Focus on recognizing and treating the pre-arrest state.</div>`,
      },
      {
        id: '15.2',
        heading: `BLS Sequence`,
        content_html: `<p>Based on the 2020 AHA Guidelines with 2025 updates. High-quality CPR is the foundation of all resuscitation — no drug or device can substitute for effective chest compressions.</p>
<h4>Infant BLS (Age &lt;1 Year)</h4>
<ul><li><strong>Confirm unresponsiveness:</strong> Tap sole of foot, flick heel — do not shake</li></ul>
<ul><li><strong>Pulse check:</strong> Brachial artery (medial upper arm), take no more than 10 seconds</li></ul>
<ul><li><strong>Compression technique:</strong> Two-thumb encircling hands technique (preferred, especially with 2 rescuers) or two-finger technique (single rescuer)</li></ul>
<ul><li><strong>Compression depth:</strong> At least 4 cm (1.5 inches), approximately one-third AP diameter</li></ul>
<ul><li><strong>Compression rate:</strong> 100–120 compressions per minute</li></ul>
<ul><li><strong>Compression-to-ventilation ratio:</strong> 30:2 (single rescuer) or 15:2 (two rescuers)</li></ul>
<h4>Child BLS (Age 1 Year to Puberty)</h4>
<ul><li><strong>Confirm unresponsiveness:</strong> Tap and shout</li></ul>
<ul><li><strong>Pulse check:</strong> Carotid or femoral artery, take no more than 10 seconds</li></ul>
<ul><li><strong>Compression technique:</strong> Heel of one hand (smaller child) or two hands (larger child), on lower half of sternum</li></ul>
<ul><li><strong>Compression depth:</strong> At least 5 cm (2 inches), approximately one-third AP diameter</li></ul>
<ul><li><strong>Compression rate:</strong> 100–120 compressions per minute</li></ul>
<ul><li><strong>Compression-to-ventilation ratio:</strong> 30:2 (single rescuer) or 15:2 (two rescuers)</li></ul>
<h4>CPR Quality Metrics</h4>
<div class="alert alert-danger">CRITICAL: High-quality CPR is the single most important determinant of survival. Focus on these five elements:</div>
<table><thead><tr><th>Metric</th><th>Target</th></tr></thead><tbody><tr><td>Rate</td><td>100–120/min</td></tr><tr><td>Depth</td><td>≥4 cm (infant), ≥5 cm (child)</td></tr><tr><td>Recoil</td><td>Allow full chest recoil between compressions — do not lean</td></tr><tr><td>Interruptions</td><td>Minimize — pauses &lt;10 seconds for pulse/rhythm checks</td></tr><tr><td>Compression fraction</td><td>&gt;80% of total arrest time should be compressions</td></tr></tbody></table>
<div class="alert alert-warning">CLINICAL PEARL: Push hard, push fast, allow full recoil, minimize interruptions. Rotate compressors every 2 minutes to prevent fatigue-related quality decline. Use a metronome or CPR feedback device if available.</div>`,
      },
      {
        id: '15.3',
        heading: `PALS Cardiac Arrest Algorithm`,
        content_html: `<p>The PALS cardiac arrest algorithm branches based on whether the rhythm is <strong>shockable</strong> or <strong>non-shockable</strong>. Rhythm analysis should occur every 2 minutes during CPR.</p>
<h4>Shockable Rhythms: VF / Pulseless VT (5–15% of Pediatric Arrests)</h4>
<div class="alert alert-danger">CRITICAL: Shockable rhythms have the best prognosis in pediatric arrest — rapid defibrillation is essential.</div>
<table><thead><tr><th>Step</th><th>Action</th><th>Details</th></tr></thead><tbody><tr><td>1</td><td>Defibrillate</td><td>2 J/kg (first shock)</td></tr><tr><td>2</td><td>CPR</td><td>Resume immediately for 2 minutes</td></tr><tr><td>3</td><td>Rhythm check → Defibrillate</td><td>4 J/kg (second shock)</td></tr><tr><td>4</td><td>CPR + Epinephrine</td><td>Resume CPR 2 min; Epinephrine 0.01 mg/kg IV/IO (0.1 mL/kg of 1:10,000) every 3–5 minutes</td></tr><tr><td>5</td><td>Rhythm check → Defibrillate</td><td>4–10 J/kg (max 10 J/kg or adult dose)</td></tr><tr><td>6</td><td>CPR + Antiarrhythmic</td><td>Amiodarone 5 mg/kg IV/IO (may repeat x2) OR Lidocaine 1 mg/kg IV/IO</td></tr><tr><td>7</td><td>Continue cycle</td><td>Shock → CPR 2 min → Epi q3-5min → Shock → CPR → consider antiarrhythmic</td></tr></tbody></table>
<h4>Non-Shockable Rhythms: Asystole / PEA (Most Common in Pediatric Arrest)</h4>
<table><thead><tr><th>Step</th><th>Action</th><th>Details</th></tr></thead><tbody><tr><td>1</td><td>CPR</td><td>Begin immediately, high-quality compressions</td></tr><tr><td>2</td><td>Epinephrine</td><td>0.01 mg/kg IV/IO every 3–5 minutes (give as soon as access obtained)</td></tr><tr><td>3</td><td>Rhythm check every 2 min</td><td>If shockable rhythm develops, move to shockable algorithm</td></tr><tr><td>4</td><td>Search for reversible causes</td><td>Treat H's and T's aggressively</td></tr></tbody></table>
<div class="alert alert-warning">CLINICAL PEARL: In PEA arrest, the key to survival is identifying and treating the underlying cause. Organized electrical activity without a pulse means something is preventing the heart from generating output — find it and fix it.</div>`,
      },
      {
        id: '15.4',
        heading: `H's and T's — Reversible Causes of Cardiac Arrest`,
        content_html: `<p>Systematic evaluation for reversible causes should occur during every rhythm check. In pediatric arrest, several causes are far more common than others.</p>
<h4>The H's</h4>
<table><thead><tr><th>Cause</th><th>Clues</th><th>Treatment</th></tr></thead><tbody><tr><td><strong>Hypovolemia</strong></td><td>Trauma, GI losses, dehydration history</td><td>20 mL/kg NS or LR bolus; blood products if hemorrhagic</td></tr><tr><td><strong>Hypoxia</strong></td><td>Cyanosis, respiratory history, airway obstruction</td><td>Optimize oxygenation and ventilation; secure airway</td></tr><tr><td><strong>Hydrogen ion (Acidosis)</strong></td><td>DKA, renal failure, sepsis, prolonged arrest</td><td>Treat underlying cause; consider sodium bicarbonate 1 mEq/kg</td></tr><tr><td><strong>Hypo/Hyperkalemia</strong></td><td>Renal failure, medications, ECG changes</td><td>Calcium, insulin/glucose, sodium bicarbonate for hyperK; IV potassium for hypoK</td></tr><tr><td><strong>Hypothermia</strong></td><td>Environmental exposure, drowning, neonates</td><td>Active rewarming; continue CPR until core temp &gt;32°C</td></tr><tr><td><strong>Hypoglycemia</strong></td><td>Neonates, diabetics, sepsis, liver disease</td><td>D10W 2–5 mL/kg (neonates/infants) or D25W 2–4 mL/kg (children)</td></tr></tbody></table>
<h4>The T's</h4>
<table><thead><tr><th>Cause</th><th>Clues</th><th>Treatment</th></tr></thead><tbody><tr><td><strong>Tension pneumothorax</strong></td><td>Unilateral absent breath sounds, tracheal deviation, trauma/asthma/ventilated</td><td>Needle decompression (2nd ICS MCL or 4th/5th ICS AAL) → chest tube</td></tr><tr><td><strong>Tamponade (cardiac)</strong></td><td>Muffled heart sounds, JVD, trauma, pericarditis</td><td>Pericardiocentesis; volume bolus as bridge</td></tr><tr><td><strong>Toxins</strong></td><td>Ingestion history, medication bottles, toxidromes</td><td>Specific antidotes; decontamination; call Poison Control</td></tr><tr><td><strong>Thrombosis (PE)</strong></td><td>Central line, immobility, hypercoagulable state</td><td>Alteplase; consider surgical/IR intervention</td></tr><tr><td><strong>Thrombosis (coronary)</strong></td><td>Kawasaki disease history, congenital anomaly</td><td>Heparin; cardiology consultation</td></tr><tr><td><strong>Trauma</strong></td><td>Mechanism history, physical exam findings</td><td>Address hemorrhage, pneumothorax, tamponade; massive transfusion</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL — RURAL ED TIP: The most common reversible causes in the rural pediatric arrest are: Hypoxia, Hypovolemia, Hypothermia, Hypoglycemia, and Tension pneumothorax. Address these first and systematically.</div>`,
      },
      {
        id: '15.5',
        heading: `Post-Cardiac Arrest Care`,
        content_html: `<p>After return of spontaneous circulation (ROSC), the focus shifts to preventing secondary injury and optimizing organ perfusion. Post-arrest care is as critical as the resuscitation itself.</p>
<h4>Post-ROSC Targets</h4>
<table><thead><tr><th>Parameter</th><th>Target</th><th>Rationale</th></tr></thead><tbody><tr><td>SpO2</td><td>94–99%</td><td>Avoid hyperoxia (causes oxidative injury); titrate FiO2 down once ROSC achieved</td></tr><tr><td>PaCO2</td><td>35–45 mmHg</td><td>Avoid hyperventilation (causes cerebral vasoconstriction and worsens neurologic injury)</td></tr><tr><td>Blood pressure</td><td>≥5th percentile for age</td><td>Fluid boluses 10–20 mL/kg; vasopressors (epinephrine or norepinephrine infusion) if needed</td></tr><tr><td>Temperature</td><td>TTM 32–34°C OR strict normothermia 36–37.5°C for 24 hours</td><td>THAPCA trials; avoid hyperthermia (&gt;37.5°C) in all cases</td></tr><tr><td>Glucose</td><td>80–180 mg/dL</td><td>Treat hypoglycemia aggressively; avoid hyperglycemia</td></tr><tr><td>Seizures</td><td>Monitor and treat aggressively</td><td>Subclinical seizures are common post-arrest; consider continuous EEG if available</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL: Do NOT hyperventilate post-arrest. This is a common error that worsens outcomes. Target normal ventilation rates and confirm with ETCO2 35–45 mmHg.</div>
<div class="alert alert-warning">CLINICAL PEARL: Prognostication after pediatric cardiac arrest should NOT occur before 72 hours. Multiple studies show that early prognostication is unreliable and leads to premature withdrawal of care. Communicate this to families: "It is too early to know the outcome."</div>`,
      },
      {
        id: '15.6',
        heading: `Neonatal Resuscitation — NRP`,
        content_html: `<p>Based on the NRP 8th Edition (2022) with 2025 updates. Approximately 10% of newborns require some resuscitation at birth; &lt;1% require extensive measures.</p>
<h4>Initial Steps (The Golden Minute)</h4>
<ul><li><strong>Warmth:</strong> Radiant warmer; polyethylene bag/wrap for infants &lt;32 weeks gestation</li></ul>
<ul><li><strong>Position airway:</strong> Neutral "sniffing" position; consider shoulder roll for preterm infants</li></ul>
<ul><li><strong>Clear airway:</strong> Only if obvious obstruction — routine suctioning no longer recommended</li></ul>
<ul><li><strong>Stimulate:</strong> Dry vigorously, rub back, flick soles — if no response, begin PPV</li></ul>
<ul><li><strong>Assess:</strong> Tone, breathing, heart rate (HR is the most important indicator)</li></ul>
<h4>Positive Pressure Ventilation (PPV)</h4>
<ul><li>Initiate if apneic, gasping, or HR &lt;100 bpm</li></ul>
<ul><li>Rate: 40–60 breaths per minute</li></ul>
<ul><li>FiO2: 21% for term infants, 21–30% for preterm — titrate to SpO2 targets</li></ul>
<h4>SpO2 Targets by Minute After Birth</h4>
<table><thead><tr><th>Time After Birth</th><th>Target SpO2</th></tr></thead><tbody><tr><td>1 minute</td><td>60–65%</td></tr><tr><td>2 minutes</td><td>65–70%</td></tr><tr><td>3 minutes</td><td>70–75%</td></tr><tr><td>4 minutes</td><td>75–80%</td></tr><tr><td>5 minutes</td><td>80–85%</td></tr><tr><td>10 minutes</td><td>85–95%</td></tr></tbody></table>
<h4>MR SOPA — Corrective Steps for Ineffective PPV</h4>
<p>If HR remains &lt;100 bpm after 30 seconds of PPV, apply MR SOPA before escalating:</p>
<table><thead><tr><th>Letter</th><th>Action</th></tr></thead><tbody><tr><td><strong>M</strong></td><td>Mask adjustment — ensure good seal, no air leak</td></tr><tr><td><strong>R</strong></td><td>Reposition — sniffing position, slight neck extension</td></tr><tr><td><strong>S</strong></td><td>Suction mouth then nose</td></tr><tr><td><strong>O</strong></td><td>Open mouth — open the mouth slightly, lift jaw forward</td></tr><tr><td><strong>P</strong></td><td>Pressure increase — increase PIP incrementally</td></tr><tr><td><strong>A</strong></td><td>Alternative airway — intubation or laryngeal mask</td></tr></tbody></table>
<h4>Chest Compressions and Epinephrine</h4>
<ul><li>If HR &lt;60 bpm despite effective ventilation for 30 seconds → begin compressions</li></ul>
<ul><li><strong>Compression-to-ventilation ratio:</strong> 3:1 (90 compressions + 30 breaths = 120 events per minute)</li></ul>
<ul><li><strong>FiO2:</strong> Increase to 100% during compressions</li></ul>
<ul><li>If HR remains &lt;60 bpm despite effective ventilation + compressions → <strong>Epinephrine</strong></li></ul>
<ul><li><strong>Epinephrine dose:</strong> 0.01–0.03 mg/kg IV/UVC (0.1–0.3 mL/kg of 1:10,000)</li></ul>
<ul><li>UVC (umbilical venous catheter) is the preferred access in the delivery room</li></ul>
<h4>Key NRP Changes (2022/2025)</h4>
<div class="alert alert-warning">CLINICAL PEARL: Important NRP updates to incorporate into practice:</div>
<ul><li><strong>ECG for heart rate monitoring:</strong> ECG is the most accurate method for HR assessment during resuscitation — apply 3-lead ECG early</li></ul>
<ul><li><strong>No sustained inflation:</strong> Initial sustained inflations are no longer recommended</li></ul>
<ul><li><strong>No routine meconium suction:</strong> Routine intubation and tracheal suctioning for meconium-stained amniotic fluid is no longer performed for vigorous OR non-vigorous infants</li></ul>
<ul><li><strong>Delayed cord clamping:</strong> 30–60 seconds for vigorous term and preterm infants when feasible</li></ul>
<ul><li><strong>Emphasis on ventilation:</strong> Effective PPV is the single most important intervention in neonatal resuscitation</li></ul>`,
      },
    ],
  },
  {
    id: 'ch16',
    number: '16',
    title: `Neonatal Emergencies Beyond Sepsis`,
    sections: [
      {
        id: '16.1',
        heading: `Hyperbilirubinemia`,
        content_html: `<p>Neonatal jaundice is the most common reason for hospital readmission in the first week of life. While usually benign, severe hyperbilirubinemia can cause irreversible neurotoxicity (kernicterus) if not identified and treated promptly.</p>
<h4>Pathophysiology</h4>
<p>Neonates produce bilirubin at 2–3 times the adult rate due to higher red blood cell volume, shorter RBC lifespan (70–90 days), and immature hepatic conjugation. Unconjugated (indirect) bilirubin is lipid-soluble and crosses the blood-brain barrier, causing neurotoxicity.</p>
<h4>Risk Factors for Severe Hyperbilirubinemia</h4>
<ul><li>Prematurity (&lt;38 weeks)</li></ul>
<ul><li>ABO or Rh incompatibility (direct Coombs positive)</li></ul>
<ul><li>G6PD deficiency</li></ul>
<ul><li>Exclusive breastfeeding with poor intake</li></ul>
<ul><li>Significant bruising (cephalohematoma, birth trauma)</li></ul>
<ul><li>East Asian ethnicity</li></ul>
<ul><li>Sibling with history of phototherapy</li></ul>
<h4>Assessment</h4>
<p>Use the <strong>Bhutani nomogram</strong> to plot total serum bilirubin (TSB) against age in hours and determine risk zone (low, low-intermediate, high-intermediate, high). Treatment thresholds are based on risk zone, gestational age, and presence of neurotoxicity risk factors.</p>
<h4>Treatment</h4>
<table><thead><tr><th>Intervention</th><th>Indications</th><th>Details</th></tr></thead><tbody><tr><td>Phototherapy</td><td>TSB at or above phototherapy threshold for age/risk</td><td>Intensive phototherapy (irradiance ≥30 uW/cm2/nm); maximize skin exposure; ensure adequate hydration</td></tr><tr><td>Exchange transfusion</td><td>TSB at exchange threshold, or TSB rising &gt;0.5 mg/dL/hr despite intensive phototherapy, or signs of acute bilirubin encephalopathy</td><td>Double-volume exchange (160 mL/kg); removes bilirubin and antibody-coated RBCs</td></tr></tbody></table>
<h4>Acute Bilirubin Encephalopathy (ABE) — Do Not Miss</h4>
<div class="alert alert-danger">CRITICAL: Recognize the signs of acute bilirubin encephalopathy — this is a neurologic emergency requiring immediate exchange transfusion:</div>
<ul><li><strong>Early:</strong> Lethargy, hypotonia, poor suck</li></ul>
<ul><li><strong>Intermediate:</strong> Irritability, hypertonia (especially retrocollis/opisthotonus), high-pitched cry, fever</li></ul>
<ul><li><strong>Advanced:</strong> Apnea, seizures, coma — may progress to chronic kernicterus (permanent choreoathetoid cerebral palsy, sensorineural hearing loss, upward gaze palsy)</li></ul>`,
      },
      {
        id: '16.2',
        heading: `Neonatal Hypoglycemia`,
        content_html: `<p>Neonatal hypoglycemia is a common and potentially dangerous metabolic emergency. The neonatal brain is exquisitely vulnerable to low glucose, and prolonged or severe hypoglycemia can cause permanent neurologic injury.</p>
<h4>Thresholds by Age</h4>
<table><thead><tr><th>Age</th><th>Action Threshold</th><th>Treatment Goal</th></tr></thead><tbody><tr><td>Birth to 4 hours</td><td>&lt;25 mg/dL</td><td>Feed and recheck; if unable to feed or symptomatic → IV dextrose</td></tr><tr><td>4–24 hours</td><td>&lt;35 mg/dL</td><td>Feed and recheck; IV dextrose if symptomatic or not responding</td></tr><tr><td>&gt;24 hours</td><td>&lt;45 mg/dL</td><td>Persistent hypoglycemia warrants evaluation for inborn errors</td></tr><tr><td>Symptomatic (any age)</td><td>&lt;45–50 mg/dL</td><td>Treat immediately with IV dextrose</td></tr></tbody></table>
<h4>Treatment</h4>
<div class="alert alert-danger">CRITICAL: Use D10W for neonatal hypoglycemia — NEVER D50W or D25W in neonates. D50W and D25W are hyperosmolar and can cause rebound hypoglycemia, venous sclerosis, and tissue necrosis.</div>
<ul><li><strong>IV Dextrose bolus:</strong> D10W 2 mL/kg IV push over 1–2 minutes</li></ul>
<ul><li><strong>Maintenance infusion:</strong> D10W at GIR (glucose infusion rate) of 4–8 mg/kg/min</li></ul>
<ul><li><strong>GIR calculation:</strong> GIR (mg/kg/min) = [Dextrose concentration (%) x Rate (mL/hr)] / [Weight (kg) x 6]</li></ul>
<ul><li>Recheck glucose 15–30 minutes after bolus</li></ul>
<ul><li>If GIR &gt;10–12 mg/kg/min is required, consider hyperinsulinism or inborn error of metabolism — urgent endocrine/genetics consultation</li></ul>
<div class="alert alert-warning">CLINICAL PEARL: A quick formula for D10W rate: Weight (kg) x 4 x 6 / 10 = mL/hr to deliver GIR of 4 mg/kg/min. Double the rate for GIR of 8 mg/kg/min.</div>`,
      },
      {
        id: '16.3',
        heading: `Neonatal Abstinence Syndrome (NAS)`,
        content_html: `<p>NAS occurs in neonates exposed in utero to opioids (and less commonly other substances). Incidence has risen dramatically with the opioid epidemic. Symptoms typically begin 48–72 hours after birth (longer for methadone/buprenorphine).</p>
<h4>Assessment — Finnegan Score vs Eat-Sleep-Console</h4>
<table><thead><tr><th>Tool</th><th>Approach</th><th>Key Features</th></tr></thead><tbody><tr><td>Modified Finnegan Score</td><td>Assign numerical scores to 21 signs/symptoms every 3–4 hours</td><td>Traditional, widely used; pharmacotherapy if scores ≥8 on 3 consecutive assessments</td></tr><tr><td>Eat-Sleep-Console (ESC)</td><td>Functional assessment: Can the infant eat ≥1 oz, sleep ≥1 hour, be consoled within 10 min?</td><td>Newer, preferred approach; emphasizes non-pharmacologic care first; reduces opioid treatment by 50%</td></tr></tbody></table>
<h4>Management</h4>
<ul><li><strong>Non-pharmacologic (first-line for all infants):</strong> Rooming-in with mother, swaddling, skin-to-skin, low-stimulus environment, small frequent feeds, breastfeeding if appropriate (not contraindicated with methadone/buprenorphine if mother is in treatment and HIV-negative)</li></ul>
<ul><li><strong>Pharmacologic (if non-pharmacologic measures insufficient):</strong></li></ul>
<ul><li>First-line: Morphine 0.05–0.1 mg/kg PO every 3–4 hours, titrate based on scoring</li></ul>
<ul><li>Alternative: Methadone, buprenorphine (sublingual)</li></ul>
<ul><li>Adjunct for polydrug exposure: Phenobarbital or clonidine</li></ul>
<div class="alert alert-warning">CLINICAL PEARL: The Eat-Sleep-Console model has dramatically reduced pharmacotherapy rates and hospital stays for NAS. It shifts the focus from a numerical score to functional infant well-being and empowers the mother as the primary caregiver.</div>`,
      },
      {
        id: '16.4',
        heading: `Brief Resolved Unexplained Events (BRUE)`,
        content_html: `<p>BRUE (formerly ALTE — Apparent Life-Threatening Event) describes an episode in an infant &lt;1 year that is brief (&lt;1 minute), resolved at the time of evaluation, and unexplained after history and physical exam. The 2016 AAP guideline introduced a risk stratification approach.</p>
<h4>Risk Stratification</h4>
<table><thead><tr><th>Category</th><th>Criteria (ALL must be met for lower risk)</th><th>Management</th></tr></thead><tbody><tr><td><strong>Lower Risk</strong></td><td>Age &gt;60 days AND gestational age ≥32 weeks AND first event AND duration &lt;1 minute AND no CPR by trained provider AND no concerning history/exam</td><td>Educate caregivers, offer brief pulse oximetry monitoring; pertussis testing and 12-lead ECG may be considered; no routine labs, imaging, or admission required</td></tr><tr><td><strong>Higher Risk</strong></td><td>Any criterion NOT met: age ≤60 days, prematurity &lt;32 weeks, recurrent events, duration ≥1 minute, CPR required, or concerning features on exam</td><td>Further evaluation warranted: CBC, metabolic panel, UA, consider ECG, EEG, imaging, admission for monitoring; workup guided by clinical presentation</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL: BRUE is a diagnosis of exclusion. Red flags that suggest an underlying diagnosis: recurrent events, events during sleep, bruising or other signs of non-accidental trauma, abnormal vitals, abnormal neurologic exam.</div>
<div class="alert alert-warning">CLINICAL PEARL: In the rural ED, when in doubt about risk stratification, err on the side of observation and monitoring. Even lower-risk BRUE infants may benefit from a period of cardiorespiratory monitoring given the anxiety these events generate for families and the challenge of reliable follow-up in rural settings.</div>`,
      },
      {
        id: '16.5',
        heading: `Congenital Heart Disease (CHD) — ED Presentation and Stabilization`,
        content_html: `<p>Congenital heart disease affects approximately 1 in 100 live births. Critical CHD (requiring intervention in the first year of life) occurs in about 25% of those. Many are now detected by prenatal ultrasound or newborn pulse oximetry screening, but some present undiagnosed to the ED in the first days to weeks of life.</p>
<h4>Presentation Patterns</h4>
<table><thead><tr><th>Presentation</th><th>Pathophysiology</th><th>Examples</th><th>Typical Age</th></tr></thead><tbody><tr><td><strong>Cyanosis</strong></td><td>Right-to-left shunt or parallel circulation with inadequate mixing</td><td>Tetralogy of Fallot, Transposition of Great Arteries (TGA), Truncus Arteriosus, Total Anomalous Pulmonary Venous Return (TAPVR)</td><td>Hours to days</td></tr><tr><td><strong>Shock / Cardiovascular collapse</strong></td><td>Ductal-dependent systemic blood flow — duct closes and systemic perfusion fails</td><td>Hypoplastic Left Heart Syndrome (HLHS), Critical Coarctation of Aorta, Interrupted Aortic Arch, Critical Aortic Stenosis</td><td>Days 3–14 (as ductus closes)</td></tr><tr><td><strong>Tachypnea / Heart failure</strong></td><td>Left-to-right shunt with pulmonary overcirculation</td><td>Large VSD, AVSD, PDA</td><td>Weeks 2–6 (as PVR drops)</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL: The neonate who presents in shock at 1–2 weeks of age with poor perfusion and metabolic acidosis — think ductal-dependent lesion FIRST. Start PGE1 immediately; do not wait for echocardiography confirmation.</div>
<h4>Prostaglandin E1 (PGE1 / Alprostadil) — Lifesaving Intervention</h4>
<ul><li><strong>Dose:</strong> 0.05–0.1 mcg/kg/min IV continuous infusion; may reduce to 0.01–0.05 mcg/kg/min once ductus reopens</li></ul>
<ul><li><strong>Side effects:</strong> Apnea (12%), hypotension, fever, flushing — be prepared to intubate</li></ul>
<ul><li><strong>Rural ED key:</strong> Start PGE1 if ductal-dependent lesion suspected; do NOT wait for cardiology or echo confirmation. The risks of delay far exceed the risks of the medication.</li></ul>
<h4>Hyperoxia Test</h4>
<p>Differentiates cardiac from pulmonary cyanosis:</p>
<ul><li>Place infant on 100% FiO2 for 10 minutes</li></ul>
<ul><li>Obtain ABG (right radial / preductal preferred)</li></ul>
<ul><li>PaO2 &gt;200 mmHg → pulmonary cause likely (good response to O2)</li></ul>
<ul><li>PaO2 &lt;100 mmHg (especially &lt;70) → cardiac cause likely (fixed right-to-left shunt)</li></ul>
<ul><li>PaO2 100–200 mmHg → indeterminate, requires further evaluation</li></ul>
<div class="alert alert-warning">CLINICAL PEARL: In the rural ED, any cyanotic neonate not improving with supplemental oxygen should be presumed to have CHD until proven otherwise. Start PGE1, obtain pre- and post-ductal SpO2, call the pediatric cardiology/transport team, and prepare for intubation in case of PGE1-induced apnea.</div>`,
      },
    ],
  },
  {
    id: 'ch17',
    number: '17',
    title: `Hematologic and Oncologic Emergencies`,
    sections: [
      {
        id: '17.1',
        heading: `Sickle Cell Disease Crises`,
        content_html: `<p>Sickle cell disease (SCD) is the most common hemoglobinopathy in the US. Children with SCD present to the ED with a variety of acute complications, each requiring specific management.</p>
<h4>Vaso-Occlusive Crisis (VOC)</h4>
<ul><li>Most common SCD emergency; pain from microvascular occlusion by sickled RBCs</li></ul>
<ul><li>Common sites: bones (dactylitis in infants), chest, abdomen, back</li></ul>
<ul><li><strong>Management:</strong></li></ul>
<ul><li>Rapid triage — pain assessment within 15 minutes, first analgesic within 30 minutes</li></ul>
<ul><li>IV morphine 0.1–0.15 mg/kg every 15–20 minutes until pain controlled (or equivalent opioid)</li></ul>
<ul><li>IV ketorolac 0.5 mg/kg (max 30 mg) as adjunct</li></ul>
<ul><li>IV fluids: maintenance rate (avoid overhydration which worsens ACS)</li></ul>
<ul><li>Incentive spirometry every 2 hours while awake to prevent ACS</li></ul>
<h4>Acute Chest Syndrome (ACS)</h4>
<div class="alert alert-danger">CRITICAL: ACS is the leading cause of death in SCD. Any child with SCD presenting with fever, chest pain, cough, tachypnea, or new infiltrate on CXR has ACS until proven otherwise.</div>
<ul><li><strong>Diagnostic criteria:</strong> New pulmonary infiltrate + at least one of: fever, respiratory symptoms, chest pain, hypoxia</li></ul>
<ul><li><strong>Management:</strong></li></ul>
<ul><li>Ceftriaxone 50–75 mg/kg IV (covers typical pathogens including S. pneumoniae)</li></ul>
<ul><li>Azithromycin 10 mg/kg IV/PO (covers atypical pathogens — Mycoplasma, Chlamydia)</li></ul>
<ul><li>Simple transfusion to Hgb 10 g/dL (do not exceed 10 — risk of hyperviscosity)</li></ul>
<ul><li>Supplemental O2 to maintain SpO2 ≥95%</li></ul>
<ul><li>Incentive spirometry, bronchodilators if wheezing</li></ul>
<ul><li>Exchange transfusion for severe ACS (rapidly worsening, PaO2 &lt;70 mmHg)</li></ul>
<h4>Splenic Sequestration</h4>
<ul><li>Acute pooling of blood in the spleen; can cause life-threatening hypovolemic shock within hours</li></ul>
<ul><li><strong>Clues:</strong> Rapidly enlarging spleen, acute drop in Hgb ≥2 g/dL from baseline, tachycardia, pallor</li></ul>
<ul><li><strong>Management:</strong> Transfuse in small aliquots (5 mL/kg pRBC) as autotransfusion from the spleen will occur simultaneously — large-volume transfusion risks hyperviscosity when sequestered blood re-enters circulation</li></ul>
<h4>Stroke</h4>
<ul><li>Children with SCD have a 300-fold increased stroke risk; peak incidence age 2–9 years</li></ul>
<ul><li><strong>Signs:</strong> Hemiparesis, speech changes, facial droop, altered mental status, seizures</li></ul>
<ul><li><strong>Management:</strong> Exchange transfusion (target HbS &lt;30%) — this is the definitive treatment</li></ul>
<ul><li>Do NOT give tPA (ischemic stroke in SCD is from sickling, not thromboembolism)</li></ul>
<ul><li>Simple transfusion to Hgb 10 g/dL as bridge while arranging exchange</li></ul>
<h4>Aplastic Crisis</h4>
<ul><li>Caused by Parvovirus B19 infection which halts erythropoiesis for 7–10 days</li></ul>
<ul><li><strong>Clues:</strong> Severe anemia (Hgb may drop to 2–3 g/dL), low reticulocyte count, preceding viral illness</li></ul>
<ul><li><strong>Management:</strong> Transfuse pRBC cautiously; usually self-limited over 1–2 weeks as parvovirus clears</li></ul>
<div class="alert alert-warning">CLINICAL PEARL: Always compare the current hemoglobin to the patient's known baseline. In SCD, a hemoglobin of 7 may be normal for one patient and a crisis-level drop for another. The reticulocyte count is equally important: a low retic in SCD is always concerning.</div>`,
      },
      {
        id: '17.2',
        heading: `Febrile Neutropenia`,
        content_html: `<p>Febrile neutropenia is a life-threatening emergency in immunocompromised children, most commonly those receiving chemotherapy. The absence of neutrophils means the child cannot mount an adequate inflammatory response, so infections progress rapidly with minimal signs.</p>
<h4>Definitions</h4>
<ul><li><strong>Neutropenia:</strong> ANC (Absolute Neutrophil Count) &lt;500/uL, or ANC &lt;1000/uL and expected to drop below 500</li></ul>
<ul><li><strong>Fever:</strong> Single temperature ≥38.3°C (101°F) or ≥38.0°C (100.4°F) sustained for 1 hour</li></ul>
<h4>Management</h4>
<div class="alert alert-danger">CRITICAL: Cefepime 50 mg/kg IV (max 2g) within 60 minutes of triage — this is a door-to-antibiotic metric comparable to STEMI door-to-balloon time. Every hour of delay increases mortality.</div>
<table><thead><tr><th>Action</th><th>Details</th></tr></thead><tbody><tr><td>Antibiotics</td><td>Cefepime 50 mg/kg IV (max 2g) STAT; add vancomycin if hemodynamically unstable, mucositis, cellulitis, or central line infection suspected</td></tr><tr><td>Blood cultures</td><td>Peripheral AND from each central line lumen BEFORE antibiotics — but do NOT delay antibiotics for cultures</td></tr><tr><td>Labs</td><td>CBC with differential, CMP, lactate, blood cultures, UA</td></tr><tr><td>Assessment</td><td>Source-directed physical exam; examine skin, mucous membranes, perianal area (visually only), central line sites</td></tr><tr><td>Fluids</td><td>NS 20 mL/kg if any signs of sepsis or poor perfusion</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL: Do NOT perform rectal exams, rectal temperatures, or administer rectal medications in neutropenic patients. Mucosal disruption can introduce enteric organisms into the bloodstream, causing rapidly fatal gram-negative sepsis.</div>
<div class="alert alert-warning">CLINICAL PEARL: The neutropenic child may look deceptively well because they cannot generate the inflammatory response that produces typical infection signs (erythema, pus, induration). A soft abdomen does not exclude intra-abdominal catastrophe. Fever may be the ONLY sign of sepsis.</div>`,
      },
      {
        id: '17.3',
        heading: `Tumor Lysis Syndrome (TLS)`,
        content_html: `<p>TLS results from massive release of intracellular contents during tumor cell death, either spontaneous or treatment-related. Most common in high-grade lymphomas (Burkitt) and acute leukemias (ALL with high WBC count).</p>
<h4>Metabolic Derangements</h4>
<table><thead><tr><th>Abnormality</th><th>Mechanism</th><th>Consequence</th></tr></thead><tbody><tr><td>Hyperuricemia</td><td>Nucleic acid breakdown → purines → uric acid</td><td>Uric acid nephropathy, acute kidney injury</td></tr><tr><td>Hyperkalemia</td><td>Release of intracellular potassium</td><td>Cardiac arrhythmia, cardiac arrest</td></tr><tr><td>Hyperphosphatemia</td><td>Release of intracellular phosphate</td><td>Calcium-phosphate precipitation → renal damage, hypocalcemia</td></tr><tr><td>Hypocalcemia</td><td>Calcium binds to excess phosphate</td><td>Tetany, seizures, cardiac arrhythmia</td></tr></tbody></table>
<h4>Management</h4>
<ul><li><strong>Aggressive IV hydration:</strong> D5 1/4 NS or D5 1/2 NS at 200 mL/m2/hr (2–3 times maintenance) — goal is high urine output to flush metabolites</li></ul>
<ul><li><strong>Rasburicase:</strong> 0.15–0.2 mg/kg IV single dose — recombinant urate oxidase that rapidly converts uric acid to allantoin (highly soluble)</li></ul>
<ul><li><strong>Treat hyperkalemia aggressively:</strong> Calcium gluconate for cardiac membrane stabilization, insulin/glucose, sodium bicarbonate, kayexalate, dialysis if refractory</li></ul>
<ul><li><strong>Monitor:</strong> Q4–6h electrolytes (K, Ca, Phos, uric acid), renal function, urine output, cardiac monitoring</li></ul>
<ul><li><strong>Avoid:</strong> Potassium in IV fluids, phosphorus supplements, alkalinization of urine if using rasburicase</li></ul>
<div class="alert alert-danger">CRITICAL: Rasburicase is contraindicated in G6PD deficiency — causes severe hemolytic anemia and methemoglobinemia. Screen for G6PD before administration when possible, but do not delay treatment in life-threatening TLS.</div>
<div class="alert alert-warning">CLINICAL PEARL: In the rural ED, TLS may present as a child with a new cancer diagnosis who is acutely ill with renal failure, cardiac arrhythmia, or seizures. Start aggressive hydration immediately, check electrolytes, treat hyperkalemia, and arrange emergent transfer to a pediatric oncology center.</div>`,
      },
      {
        id: '17.4',
        heading: `Superior Vena Cava (SVC) and Mediastinal Mass Syndrome`,
        content_html: `<p>Anterior mediastinal masses (most commonly T-cell ALL/lymphoma) can cause life-threatening compression of the airway and great vessels. This is one of the most dangerous scenarios in pediatric oncology.</p>
<div class="alert alert-danger">CRITICAL — DO NOT sedate, paralyze, or lay the patient supine. Loss of spontaneous respiratory effort or upright positioning can cause FATAL airway collapse that may be impossible to overcome with intubation or surgical airway.</div>
<h4>Pathophysiology</h4>
<p>A large anterior mediastinal mass compresses the trachea, mainstem bronchi, SVC, and/or pulmonary artery. When the patient is upright and breathing spontaneously, negative intrathoracic pressure during inspiration keeps the airway open. Under anesthesia/paralysis, loss of muscle tone + positive pressure ventilation + supine positioning can cause complete airway obstruction.</p>
<h4>Signs and Symptoms</h4>
<ul><li>Orthopnea — cannot tolerate lying flat (the hallmark symptom)</li></ul>
<ul><li>Stridor, wheezing, cough worse when supine</li></ul>
<ul><li>Facial/neck swelling, plethora, JVD (SVC compression)</li></ul>
<ul><li>Headache, visual changes (venous congestion)</li></ul>
<ul><li>Syncope, especially with Valsalva</li></ul>
<h4>Management Principles</h4>
<table><thead><tr><th>DO</th><th>DO NOT</th></tr></thead><tbody><tr><td>Keep patient upright at all times</td><td>Do NOT lay patient supine</td></tr><tr><td>Allow spontaneous breathing</td><td>Do NOT sedate or give anxiolytics</td></tr><tr><td>Supplemental O2 as needed</td><td>Do NOT paralyze — muscle relaxants can be fatal</td></tr><tr><td>Obtain CT chest to define mass</td><td>Do NOT intubate unless absolutely unavoidable</td></tr><tr><td>Start dexamethasone 0.5–1 mg/kg if lymphoma suspected (may shrink mass rapidly)</td><td>Do NOT perform general anesthesia</td></tr><tr><td>Arrange emergent transfer to pediatric oncology center with ECMO capability</td><td>Do NOT perform a biopsy that requires sedation/anesthesia</td></tr></tbody></table>
<div class="alert alert-warning">CLINICAL PEARL: If you must secure the airway, consider awake fiber-optic intubation with the patient sitting upright. Have a rigid bronchoscope and ECMO team available if possible. In the rural ED, this realistically means emergent transfer — do not attempt general anesthesia locally.</div>`,
      },
    ],
  },
  {
    id: 'ch18',
    number: '18',
    title: `Drowning and Submersion Injuries`,
    sections: [
      {
        id: '18.1',
        heading: `Epidemiology`,
        content_html: `<p>Drowning is the <strong>leading cause of injury-related death in children ages 1–4 years</strong> and the second leading cause in children ages 5–14 years. In the US, approximately 1,000 children die from drowning annually, with another 8,000 ED visits for non-fatal submersion injuries.</p>
<h4>Key Epidemiologic Points</h4>
<ul><li>Peak age: 1–4 years (toddlers) — swimming pools, bathtubs</li></ul>
<ul><li>Second peak: Adolescent males — open water, risk-taking behavior, alcohol</li></ul>
<ul><li>Bathtub drowning in infants: always consider non-accidental trauma/neglect</li></ul>
<ul><li>Rural areas: farm ponds, irrigation ditches, livestock tanks add unique risks</li></ul>
<ul><li>Male-to-female ratio: approximately 3:1</li></ul>
<ul><li>Even brief submersion (&lt;1 minute) can be fatal in toddlers</li></ul>
<div class="alert alert-warning">CLINICAL PEARL: In the rural setting, drowning may involve farm ponds, livestock water troughs, irrigation ditches, and septic pits in addition to pools and bathtubs. Always consider water contamination (agricultural chemicals, sewage) in the management plan.</div>`,
      },
      {
        id: '18.2',
        heading: `Pathophysiology`,
        content_html: `<p>The pathophysiology of drowning is fundamentally about <strong>hypoxia</strong>. Regardless of water type (fresh vs salt), the primary insult is oxygen deprivation, with the duration and severity of hypoxia being the main determinant of outcome.</p>
<h4>Sequence of Events</h4>
<ul><li><strong>Submersion → laryngospasm</strong> (initial reflex, brief)</li></ul>
<ul><li><strong>Aspiration of water</strong> → surfactant washout and dilution → alveolar collapse and atelectasis</li></ul>
<ul><li><strong>Pulmonary edema</strong> → V/Q mismatch → intrapulmonary shunt → hypoxemia</li></ul>
<ul><li><strong>Progressive hypoxia</strong> → lactic acidosis → myocardial dysfunction → cardiac arrest</li></ul>
<h4>Additional Pathophysiology</h4>
<ul><li><strong>Hypothermia:</strong> Common in cold water submersion; may be protective in some cases (cold water drowning in children has reported survivals even after prolonged submersion) but also causes coagulopathy, arrhythmia, and cardiac instability</li></ul>
<ul><li><strong>Surfactant washout:</strong> Both fresh and salt water damage surfactant, leading to ARDS-like picture with diffuse atelectasis and poor compliance</li></ul>
<ul><li><strong>Cerebral hypoxic-ischemic injury:</strong> The brain is the organ most vulnerable to hypoxic damage; neurologic outcome is the primary determinant of overall prognosis</li></ul>
<div class="alert alert-warning">CLINICAL PEARL: The old distinction between "fresh water" and "salt water" drowning is clinically irrelevant. Management is the same regardless of water type. The critical factor is the duration and severity of hypoxia.</div>`,
      },
      {
        id: '18.3',
        heading: `Prognostic Factors`,
        content_html: `<p>Prognostic assessment helps guide the intensity of resuscitation and family communication. However, no single factor is perfectly predictive, and neurologically intact survival has been reported even in cases with poor prognostic indicators — particularly in cold water drowning.</p>
<h4>Prognostic Indicators</h4>
<table><thead><tr><th>Factor</th><th>Better Prognosis</th><th>Worse Prognosis</th></tr></thead><tbody><tr><td>Submersion duration</td><td>&lt;5 minutes</td><td>&gt;10 minutes (especially &gt;25 minutes unless ice water)</td></tr><tr><td>Time to effective CPR</td><td>&lt;10 minutes</td><td>&gt;25 minutes of CPR without ROSC</td></tr><tr><td>Water temperature</td><td>Cold/ice water (may be neuroprotective)</td><td>Warm water</td></tr><tr><td>Initial pH</td><td>&gt;7.1</td><td>&lt;7.0 (severe acidosis)</td></tr><tr><td>Initial GCS</td><td>&gt;5</td><td>GCS 3 (especially with fixed dilated pupils)</td></tr><tr><td>Initial cardiac rhythm</td><td>Sinus rhythm present</td><td>Asystole in the ED</td></tr><tr><td>Pupillary response</td><td>Reactive pupils</td><td>Fixed and dilated (but may be due to hypothermia — be cautious)</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL: "No one is dead until they are warm and dead." In hypothermic drowning, continue resuscitation until the patient is rewarmed to a core temperature of at least 32°C (90°F). Hypothermia may mimic death with fixed dilated pupils and absent brainstem reflexes, yet neurologically intact survival is possible.</div>
<div class="alert alert-warning">CLINICAL PEARL: The combination of submersion &gt;10 minutes + CPR &gt;25 minutes + initial pH &lt;7.0 + GCS 3 carries an extremely poor prognosis for meaningful neurologic recovery. However, use caution in cold water drowning where hypothermia may be neuroprotective.</div>`,
      },
      {
        id: '18.4',
        heading: `ED Management`,
        content_html: `<p>Management of the drowning victim focuses on treating hypoxia, managing the ARDS-like pulmonary injury, rewarming if hypothermic, and preventing secondary brain injury.</p>
<h4>Airway and Breathing</h4>
<ul><li>All symptomatic patients need supplemental oxygen</li></ul>
<ul><li>For intubated patients, use ARDS-like ventilation strategy:</li></ul>
<ul><li><strong>Tidal volume:</strong> 6–8 mL/kg ideal body weight (lung-protective ventilation)</li></ul>
<ul><li><strong>PEEP:</strong> Start 5–10 cmH2O, titrate upward as needed to maintain oxygenation (often need 8–15 cmH2O due to surfactant washout)</li></ul>
<ul><li>Plateau pressure &lt;30 cmH2O</li></ul>
<ul><li>If severe, consider higher PEEP (up to 15–20 cmH2O) or prone positioning</li></ul>
<h4>Circulation</h4>
<ul><li>Treat hypothermia-related arrhythmias with rewarming</li></ul>
<ul><li>Standard PALS algorithms for cardiac arrest</li></ul>
<ul><li>Volume resuscitation as needed</li></ul>
<h4>Rewarming (if Hypothermic)</h4>
<table><thead><tr><th>Core Temp</th><th>Rewarming Strategy</th></tr></thead><tbody><tr><td>&gt;34°C (mild)</td><td>Passive: remove wet clothing, warm blankets, warm environment</td></tr><tr><td>30–34°C (moderate)</td><td>Active external: forced warm air (Bair Hugger), warm IV fluids (40–42°C)</td></tr><tr><td>&lt;30°C (severe)</td><td>Active internal: warm IV fluids, warm humidified O2, bladder/gastric lavage with warm saline; consider ECMO if available and in cardiac arrest</td></tr></tbody></table>
<h4>Additional Management</h4>
<ul><li><strong>C-spine precautions:</strong> If diving injury, trauma suspected, or mechanism unknown</li></ul>
<ul><li><strong>Antibiotics:</strong> NOT routinely indicated — start only if signs of infection develop or contaminated water (sewage, agricultural runoff)</li></ul>
<ul><li><strong>Steroids:</strong> NOT recommended — no evidence of benefit in drowning</li></ul>
<ul><li><strong>NGT/OGT:</strong> Decompress stomach (swallowed water common, impairs ventilation)</li></ul>
<div class="alert alert-warning">CLINICAL PEARL: Do not prophylactically give antibiotics or steroids to drowning victims. Neither has shown benefit. Start antibiotics only if clinical signs of pneumonia develop (typically 48–72 hours post-event, with new fever, worsening infiltrates, and purulent secretions).</div>`,
      },
      {
        id: '18.5',
        heading: `Disposition`,
        content_html: `<p>Disposition decisions in drowning depend on the clinical status at the time of ED evaluation and the trajectory over the observation period.</p>
<h4>Disposition Guidelines</h4>
<table><thead><tr><th>Category</th><th>Criteria</th><th>Disposition</th></tr></thead><tbody><tr><td><strong>Asymptomatic</strong></td><td>Normal exam, normal SpO2 on room air, no respiratory symptoms, asymptomatic after brief submersion</td><td>Observe 4–8 hours in ED; if remains asymptomatic, may discharge with return precautions. "Secondary drowning" (delayed pulmonary edema) is rare but possible up to 24 hours.</td></tr><tr><td><strong>Symptomatic — Mild</strong></td><td>Cough, mild tachypnea, mildly decreased SpO2 responsive to low-flow O2</td><td>Observe 8–24 hours; admit if not improving or worsening</td></tr><tr><td><strong>Symptomatic — Moderate/Severe</strong></td><td>Significant respiratory distress, hypoxia requiring high-flow O2 or NIPPV, altered mental status</td><td>PICU admission / transfer</td></tr><tr><td><strong>Critical</strong></td><td>Required CPR, intubated, hypothermia &lt;32°C, GCS ≤8, persistent hemodynamic instability</td><td>PICU admission / transfer — requires mechanical ventilation, targeted temperature management, neuroprotective care</td></tr></tbody></table>
<div class="alert alert-warning">CLINICAL PEARL: All symptomatic drowning victims should be observed for a minimum of 8 hours. In the rural ED with limited monitoring capability, err on the side of longer observation or transfer for any child with persistent symptoms. Inform families about the rare but real possibility of delayed pulmonary edema and strict return precautions.</div>`,
      },
    ],
  },
  {
    id: 'ch19',
    number: '19',
    title: `Musculoskeletal Emergencies`,
    sections: [
      {
        id: '19.1',
        heading: `Fracture Principles — Salter-Harris Classification`,
        content_html: `<p>Pediatric fractures differ from adult fractures due to the presence of the growth plate (physis). The Salter-Harris classification system describes fractures involving the physis and predicts both treatment approach and prognosis for growth disturbance.</p>
<h4>Salter-Harris Classification</h4>
<table><thead><tr><th>Type</th><th>Pattern</th><th>Frequency</th><th>Prognosis</th><th>Key Points</th></tr></thead><tbody><tr><td><strong>I</strong></td><td>Through the physis (growth plate) only</td><td>~6%</td><td>Excellent</td><td>X-ray may be NORMAL — diagnosed clinically by tenderness over the growth plate; treat as fracture if suspected</td></tr><tr><td><strong>II</strong></td><td>Through physis + metaphysis (Thurston-Holland fragment)</td><td>~75% (most common)</td><td>Excellent</td><td>Most common type; triangular metaphyseal fragment is pathognomonic</td></tr><tr><td><strong>III</strong></td><td>Through physis + epiphysis (intra-articular)</td><td>~8%</td><td>Good if anatomically reduced</td><td>Intra-articular fracture; requires anatomic reduction (often surgical)</td></tr><tr><td><strong>IV</strong></td><td>Through metaphysis + physis + epiphysis</td><td>~10%</td><td>Fair — higher risk of growth arrest</td><td>Crosses all zones; requires surgical fixation for anatomic alignment</td></tr><tr><td><strong>V</strong></td><td>Crush injury to the physis</td><td>~1% (rare)</td><td>Poor — high risk of growth arrest</td><td>Often diagnosed retrospectively when growth arrest occurs; initial X-ray may be normal</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL: A Salter-Harris Type I fracture may have a completely normal X-ray. If a child has point tenderness over a growth plate after injury, treat as a fracture (splint and refer to orthopedics) regardless of X-ray findings. Clinical diagnosis takes precedence.</div>
<div class="alert alert-warning">CLINICAL PEARL: Remember "SALTR" — Straight across (I), Above (II), Lower/below (III), Through everything (IV), Rammed/crushed (V). Types III and IV are intra-articular and generally require surgical management. All Salter-Harris fractures need orthopedic follow-up within 7–10 days.</div>`,
      },
      {
        id: '19.2',
        heading: `Supracondylar Humerus Fractures`,
        content_html: `<p>Supracondylar humerus fractures are the <strong>most common elbow fracture in children</strong> (peak age 5–7 years) and the most common fracture requiring surgical intervention. They carry significant risk of neurovascular injury.</p>
<h4>Gartland Classification</h4>
<table><thead><tr><th>Type</th><th>Description</th><th>Management</th></tr></thead><tbody><tr><td><strong>I</strong></td><td>Non-displaced; posterior fat pad sign may be only radiographic finding</td><td>Long arm posterior splint, elbow at 60–90 degrees flexion; orthopedic follow-up 5–7 days</td></tr><tr><td><strong>II</strong></td><td>Displaced with intact posterior cortex (hinged)</td><td>Closed reduction and percutaneous pinning (most cases); if well-reduced may splint</td></tr><tr><td><strong>III</strong></td><td>Completely displaced, no cortical contact</td><td>Urgent/emergent closed reduction and percutaneous pinning; high risk for neurovascular compromise</td></tr></tbody></table>
<h4>Neurovascular Assessment — Critical</h4>
<div class="alert alert-danger">CRITICAL: Perform and document a thorough neurovascular exam BEFORE and AFTER any reduction or splinting. Nerve injuries occur in 10–20% of displaced supracondylar fractures.</div>
<table><thead><tr><th>Nerve</th><th>Motor Test</th><th>Sensory Test</th><th>Most Common Injury Pattern</th></tr></thead><tbody><tr><td><strong>AIN (Anterior Interosseous Nerve)</strong></td><td>Make "OK" sign (pinch thumb to index finger tip)</td><td>No sensory component</td><td>Most common nerve injury overall; extension-type fracture</td></tr><tr><td><strong>Median Nerve</strong></td><td>Thumb opposition, wrist flexion</td><td>Thenar eminence, palmar thumb/index/middle</td><td>Extension-type fracture (posteromedial displacement)</td></tr><tr><td><strong>Radial Nerve</strong></td><td>Wrist and finger extension ("thumbs up")</td><td>Dorsal first web space</td><td>Extension-type fracture (posterolateral displacement)</td></tr><tr><td><strong>Ulnar Nerve</strong></td><td>Finger abduction/adduction, cross fingers</td><td>Little finger, ulnar hand</td><td>Flexion-type fracture (rare, ~2% of supracondylar)</td></tr></tbody></table>
<h4>Volkmann Contracture — Do Not Miss</h4>
<div class="alert alert-danger">CRITICAL: Volkmann ischemic contracture is the most feared complication — irreversible forearm compartment syndrome from brachial artery injury. Signs: increasing pain (especially with passive finger extension), forearm swelling, absent radial pulse, hand pallor/cyanosis. This is a SURGICAL EMERGENCY requiring fasciotomy.</div>
<div class="alert alert-warning">CLINICAL PEARL: The posterior fat pad sign on lateral elbow X-ray indicates an intra-articular effusion (hemarthrosis) and should be treated as an occult fracture in the setting of trauma. The anterior fat pad ("sail sign") is normal if small, but abnormal if elevated/enlarged.</div>`,
      },
      {
        id: '19.3',
        heading: `Compartment Syndrome`,
        content_html: `<p>Compartment syndrome is a limb-threatening emergency caused by elevated pressure within a closed fascial compartment, leading to compromised perfusion and ultimately ischemic necrosis of muscle and nerve. In children, it most commonly follows long bone fractures (especially tibia and forearm).</p>
<h4>The 6 P's — With Pediatric Caveats</h4>
<table><thead><tr><th>Classic Sign</th><th>Description</th><th>Pediatric Caveat</th></tr></thead><tbody><tr><td><strong>Pain</strong></td><td>Pain out of proportion to injury; worsened by passive stretch of muscles in the compartment</td><td>This is the earliest and most reliable sign in verbal children</td></tr><tr><td><strong>Pressure</strong></td><td>Compartment feels tense and firm on palpation</td><td>Helpful but subjective</td></tr><tr><td><strong>Paresthesias</strong></td><td>Numbness, tingling in distribution of nerves traversing the compartment</td><td>Pre-verbal children cannot report this</td></tr><tr><td><strong>Pallor</strong></td><td>Pale or dusky appearance of affected limb</td><td>Late finding</td></tr><tr><td><strong>Paralysis</strong></td><td>Inability to move fingers/toes</td><td>Late finding — if present, significant ischemic damage has occurred</td></tr><tr><td><strong>Pulselessness</strong></td><td>Absent distal pulses</td><td>Very late finding — pulses may be present even with compartment syndrome</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL — THE 3 A's IN PRE-VERBAL CHILDREN: In young children who cannot describe symptoms, watch for the 3 A's: (1) Agitation / inconsolable crying, (2) Anxiety with increasing analgesic requirement, (3) Analgesia that is ineffective despite escalating doses. Increasing pain medication requirement in a child with a fracture is compartment syndrome until proven otherwise.</div>
<h4>Diagnosis and Management</h4>
<ul><li><strong>Compartment pressure measurement:</strong> Normal &lt;10 mmHg; concerning &gt;30 mmHg or within 30 mmHg of diastolic blood pressure (delta pressure)</li></ul>
<ul><li><strong>Fasciotomy indication:</strong> Compartment pressure within 30 mmHg of diastolic blood pressure (e.g., if diastolic is 60 mmHg and compartment pressure is &gt;30 mmHg → fasciotomy)</li></ul>
<ul><li><strong>Immediate actions:</strong> Remove all circumferential dressings/casts/splints, keep extremity at heart level (not elevated — elevation reduces perfusion pressure), IV analgesia</li></ul>
<ul><li><strong>Definitive treatment:</strong> Emergent fasciotomy — irreversible muscle damage begins at 6 hours of ischemia</li></ul>
<div class="alert alert-warning">CLINICAL PEARL: Do NOT elevate the affected extremity in suspected compartment syndrome — this reduces arterial perfusion pressure and worsens ischemia. Keep the limb at the level of the heart. Also, the presence of a palpable pulse does NOT rule out compartment syndrome — tissue ischemia occurs at pressures well below those needed to obliterate arterial flow.</div>`,
      },
      {
        id: '19.4',
        heading: `Septic Arthritis`,
        content_html: `<p>Septic arthritis is a surgical emergency — delay in diagnosis and treatment leads to permanent joint destruction. The hip is the most common and most dangerous joint affected in children, as increased intra-articular pressure can compromise the femoral head blood supply.</p>
<h4>Septic Arthritis vs Transient Synovitis — Differentiation</h4>
<table><thead><tr><th>Feature</th><th>Septic Arthritis</th><th>Transient Synovitis</th></tr></thead><tbody><tr><td>Onset</td><td>Acute, over hours</td><td>Gradual, over days</td></tr><tr><td>Fever</td><td>High (&gt;38.5°C common)</td><td>Low-grade or absent</td></tr><tr><td>Weight-bearing</td><td>Refuses to bear weight</td><td>May limp but often bears weight</td></tr><tr><td>ROM</td><td>Severely limited, painful in all directions</td><td>Some limitation, less painful</td></tr><tr><td>Appearance</td><td>Ill-appearing, toxic</td><td>Well-appearing</td></tr><tr><td>WBC</td><td>Often &gt;12,000</td><td>Usually normal</td></tr><tr><td>ESR</td><td>Often &gt;40 mm/hr</td><td>Usually &lt;20 mm/hr</td></tr><tr><td>CRP</td><td>Often &gt;2.0 mg/dL</td><td>Usually &lt;2.0 mg/dL</td></tr></tbody></table>
<h4>Kocher Criteria (for Hip Joint)</h4>
<p>Originally developed to differentiate septic arthritis from transient synovitis of the hip:</p>
<table><thead><tr><th>Criteria</th><th>Number Present</th><th>Predicted Probability of Septic Arthritis</th></tr></thead><tbody><tr><td>1. Non-weight-bearing on affected side</td><td>0 of 4</td><td>&lt;0.2%</td></tr><tr><td>2. ESR &gt;40 mm/hr</td><td>1 of 4</td><td>3%</td></tr><tr><td>3. Fever &gt;38.5°C</td><td>2 of 4</td><td>40%</td></tr><tr><td>4. WBC &gt;12,000/uL</td><td>3 of 4</td><td>93%</td></tr><tr><td></td><td>4 of 4</td><td>99%</td></tr></tbody></table>
<h4>Management</h4>
<ul><li><strong>Antibiotics:</strong></li></ul>
<ul><li>First-line: Cefazolin 25–30 mg/kg IV (covers S. aureus, most common pathogen)</li></ul>
<ul><li>Add ceftriaxone 50 mg/kg IV if age &lt;5 years or unimmunized (covers Kingella kingae)</li></ul>
<ul><li>Add vancomycin 15 mg/kg IV if MRSA prevalence is high in your area or child is critically ill</li></ul>
<ul><li><strong>Joint aspiration:</strong> Diagnostic AND therapeutic — send for cell count, Gram stain, culture, glucose, protein</li></ul>
<ul><li>Synovial WBC &gt;50,000 with &gt;90% PMNs is highly suggestive of septic arthritis</li></ul>
<ul><li><strong>Surgical washout:</strong> Indicated for ALL hip joint septic arthritis (emergent orthopedic consultation) and for other joints not responding to aspiration and antibiotics</li></ul>
<div class="alert alert-danger">CRITICAL: Septic arthritis of the HIP is a surgical emergency. Elevated intra-articular pressure can occlude the retinacular blood supply to the femoral head, causing avascular necrosis. Do NOT delay orthopedic consultation for hip septic arthritis. Start IV antibiotics immediately and arrange emergent surgical washout/drainage.</div>
<div class="alert alert-warning">CLINICAL PEARL: In the rural ED, if you suspect septic arthritis of the hip and cannot perform joint aspiration, start IV antibiotics immediately (cefazolin +/- ceftriaxone +/- vancomycin) and arrange emergent transfer to a facility with pediatric orthopedic capability. Do not delay antibiotics waiting for aspiration or imaging.</div>`,
      },
    ],
  },
  {
    id: 'ch20',
    number: '20',
    title: `Skin and Soft Tissue Infections`,
    sections: [
      {
        id: '20.1',
        heading: `Cellulitis — Periorbital vs Orbital`,
        content_html: `<p>Cellulitis in pediatric patients ranges from straightforward skin infections to life-threatening deep-space infections. The critical distinction in the head and neck is between <strong>periorbital (preseptal)</strong> and <strong>orbital (postseptal)</strong> cellulitis, as the latter is a surgical emergency with risk of vision loss and cavernous sinus thrombosis.</p>
<table><thead><tr><th>Feature</th><th>Periorbital (Preseptal)</th><th>Orbital (Postseptal)</th></tr></thead><tbody><tr><td>Location</td><td>Anterior to orbital septum</td><td>Posterior to orbital septum</td></tr><tr><td>Eyelid Edema/Erythema</td><td>Present</td><td>Present (often severe)</td></tr><tr><td>Proptosis</td><td>Absent</td><td>Present</td></tr><tr><td>Extraocular Movement</td><td>Normal, painless</td><td>Limited, painful (ophthalmoplegia)</td></tr><tr><td>Visual Acuity</td><td>Normal</td><td>May be decreased</td></tr><tr><td>Pain with Eye Movement</td><td>Absent</td><td>Present</td></tr><tr><td>Fever/Toxicity</td><td>Low-grade or absent</td><td>High fever, ill-appearing</td></tr><tr><td>Imaging</td><td>Usually not needed</td><td>CT orbits with contrast — look for subperiosteal abscess</td></tr><tr><td>Management</td><td>Oral antibiotics (amoxicillin-clavulanate), close follow-up</td><td>IV antibiotics (vancomycin + ceftriaxone or ampicillin-sulbactam), ophthalmology + ENT consult, possible surgical drainage</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL POINT Orbital cellulitis is a surgical emergency. Cavernous sinus thrombosis can result from posterior extension of infection. Any child with proptosis, ophthalmoplegia, decreased visual acuity, or bilateral eye involvement requires emergent CT imaging and surgical consultation. Do not delay imaging or consultation for orbital cellulitis.</div>`,
      },
      {
        id: '20.2',
        heading: `Abscess — Incision and Drainage`,
        content_html: `<p>Skin abscesses are among the most common pediatric soft tissue infections, with MRSA prevalence varying by region (30–70% of community-acquired skin infections in many areas).</p>
<h4>I&D Technique</h4>
<ul><li>Procedural sedation or local anesthesia (consider intranasal fentanyl or ketamine for anxious children)</li><li>Prep with chlorhexidine or povidone-iodine</li><li>Linear incision over point of maximum fluctuance, full length of abscess cavity</li><li>Express purulent material, break up loculations with blunt dissection (hemostat)</li><li>Irrigate cavity with normal saline</li><li>Loosely pack with iodoform gauze if cavity >2 cm (optional — evidence supports both packing and no packing)</li><li>Apply sterile dressing; wound check in 48 hours</li></ul>
<h4>Post-I&D Antibiotics</h4>
<p>Not routinely needed for simple, well-drained abscesses. <strong>Prescribe antibiotics when:</strong></p>
<ul><li>Abscess >2 cm</li><li>Surrounding cellulitis present</li><li>Immunocompromised patient</li><li>Multiple lesions or recurrent abscesses</li><li>Systemic signs of infection (fever, tachycardia)</li></ul>
<p><strong>MRSA-directed therapy:</strong></p>
<ul><li>TMP-SMX 4–6 mg/kg/dose (TMP component) PO BID x 7 days</li><li>Clindamycin 10 mg/kg/dose PO TID x 7 days (check local resistance patterns — D-test for inducible resistance)</li></ul>`,
      },
      {
        id: '20.3',
        heading: `Necrotizing Fasciitis`,
        content_html: `<p>Necrotizing fasciitis (NF) is a rapidly progressive, life-threatening soft tissue infection that spreads along fascial planes. While rare in children, mortality is high (20–40%) and directly correlates with time to surgical intervention.</p>
<div class="alert alert-danger">CRITICAL POINT Necrotizing fasciitis is a clinical diagnosis. Do NOT delay surgical consultation for imaging. Pain out of proportion to exam findings is the hallmark early finding.</div>
<h4>Key Clinical Features</h4>
<ul><li><strong>Pain out of proportion</strong> to visible skin changes (most important early sign)</li><li>Rapid progression of erythema/edema (mark borders and recheck hourly)</li><li>Dusky or gray skin discoloration</li><li>Crepitus on palpation (subcutaneous gas — late finding)</li><li>Hemorrhagic bullae (late finding)</li><li>Systemic toxicity: high fever, tachycardia, hypotension</li><li>Wooden-hard induration of subcutaneous tissue</li></ul>
<h4>Management</h4>
<ul><li><strong>Antibiotics:</strong> Vancomycin 15 mg/kg IV + Piperacillin-tazobactam 100 mg/kg (pip component) IV + Clindamycin 10–13 mg/kg IV (clindamycin added for toxin suppression)</li><li><strong>Emergent surgical debridement</strong> — this is the definitive treatment</li><li>Aggressive fluid resuscitation for associated septic shock</li><li>Serial exams and repeat debridement as needed</li></ul>
<div class="alert alert-warning">CLINICAL PEARL Imaging (CT or MRI) may show fascial thickening, fluid tracking, or subcutaneous gas, but <strong>normal imaging does not rule out necrotizing fasciitis</strong>. If clinical suspicion is high, proceed directly to surgical exploration. Time to OR is the single most important prognostic factor.</div>`,
      },
      {
        id: '20.4',
        heading: `Kawasaki Disease`,
        content_html: `<p>Kawasaki disease (KD) is an acute systemic vasculitis of unknown etiology that predominantly affects children under 5 years. It is the leading cause of acquired heart disease in children in the developed world due to its propensity to cause coronary artery aneurysms.</p>
<h4>Classic Diagnostic Criteria</h4>
<p><strong>Fever ≥5 days</strong> PLUS ≥4 of the following 5 criteria:</p>
<ul><li>Bilateral non-exudative conjunctival injection (limbal sparing)</li><li>Oral mucosal changes (strawberry tongue, cracked/erythematous lips, oropharyngeal erythema)</li><li>Extremity changes (erythema/edema of hands and feet acutely; periungual desquamation in convalescent phase)</li><li>Polymorphous rash (maculopapular, diffuse erythroderma, or erythema multiforme-like — NOT vesicular)</li><li>Cervical lymphadenopathy (≥1.5 cm, usually unilateral)</li></ul>
<div class="alert alert-warning">CLINICAL PEARL Incomplete Kawasaki disease is common in infants <6 months, who are at highest risk for coronary complications. Consider KD in any infant with prolonged unexplained fever, even without classic criteria. Check inflammatory markers (CRP, ESR) and echocardiogram. Infants may present with only fever and irritability.</div>
<h4>Treatment</h4>
<table><thead><tr><th>Phase</th><th>Medication</th><th>Dose</th><th>Duration/Notes</th></tr></thead><tbody><tr><td>Acute</td><td>IVIG</td><td>2 g/kg IV</td><td>Single infusion over 10–12 hours</td></tr><tr><td>Acute</td><td>High-dose Aspirin</td><td>80–100 mg/kg/day divided Q6h</td><td>Until afebrile x 48–72 hours</td></tr><tr><td>Convalescent</td><td>Low-dose Aspirin</td><td>3–5 mg/kg/day once daily</td><td>6–8 weeks minimum (longer if coronary changes present)</td></tr></tbody></table>
<h4>Echocardiogram Schedule</h4>
<ul><li>At diagnosis (baseline)</li><li>1–2 weeks after treatment</li><li>6–8 weeks after onset</li><li>More frequently if coronary abnormalities detected</li></ul>
<div class="alert alert-danger">CRITICAL POINT Do not withhold IVIG while waiting for echocardiogram results. Treatment within the first 10 days of illness significantly reduces coronary artery aneurysm risk from 25% to <5%. If diagnosis is suspected, treat and arrange cardiology follow-up.</div>`,
      },
    ],
  },
  {
    id: 'ch21',
    number: '21',
    title: `Environmental Emergencies`,
    sections: [
      {
        id: '21.1',
        heading: `Hypothermia`,
        content_html: `<p>Pediatric hypothermia carries significant morbidity and mortality, particularly in infants who have a high surface area-to-volume ratio and limited thermogenic capacity. Classification and management are based on core temperature.</p>
<table><thead><tr><th>Severity</th><th>Core Temperature</th><th>Clinical Features</th><th>Rewarming Strategy</th></tr></thead><tbody><tr><td>Mild</td><td>32–35°C (89.6–95°F)</td><td>Shivering, tachycardia, tachypnea, confusion, poor coordination</td><td>Passive external rewarming: remove wet clothing, warm blankets, warm environment, warm oral fluids if alert</td></tr><tr><td>Moderate</td><td>28–32°C (82.4–89.6°F)</td><td>Shivering ceases, bradycardia, atrial dysrhythmias, lethargy progressing to stupor, pupils dilated</td><td>Active external rewarming: forced warm air blankets (Bair Hugger), warm IV fluids (40–42°C), heating pads to trunk/groin/axillae</td></tr><tr><td>Severe</td><td><28°C (<82.4°F)</td><td>Loss of consciousness, VF/asystole risk, fixed dilated pupils, pulmonary edema, absent reflexes</td><td>Active core rewarming: warm IV fluids, warm humidified oxygen, warm peritoneal/pleural lavage, consider ECMO/cardiopulmonary bypass if available</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL POINT "A patient is NOT dead until they are WARM and dead." Do not pronounce death in a hypothermic patient until core temperature has been rewarmed to ≥32°C and resuscitation efforts have failed. Hypothermia is neuroprotective — remarkable neurologic recovery has been documented even after prolonged arrest in hypothermic children (especially cold water submersion).</div>
<h4>Key Management Principles</h4>
<ul><li>Handle gently — rough handling can precipitate VF in moderate/severe hypothermia</li><li>Remove wet clothing immediately</li><li>Monitor core temperature continuously (esophageal or rectal probe — not tympanic/axillary)</li><li>Rewarm at 1–2°C per hour to avoid rewarming shock</li><li>Defibrillation may be ineffective below 30°C — attempt once, then focus on rewarming before repeat attempts</li><li>Withhold vasopressors below 30°C (drug metabolism severely impaired)</li><li>Monitor for "afterdrop" — continued core temperature decline after rewarming begins due to cold peripheral blood returning to core</li></ul>`,
      },
      {
        id: '21.2',
        heading: `Heat Illness — Heat Exhaustion and Heat Stroke`,
        content_html: `<p>Pediatric heat illness ranges from mild heat exhaustion to life-threatening heat stroke. Children are particularly vulnerable due to higher metabolic rate, greater surface area-to-mass ratio, lower sweat rate, and dependence on caregivers for hydration and environment control.</p>
<table><thead><tr><th>Feature</th><th>Heat Exhaustion</th><th>Heat Stroke</th></tr></thead><tbody><tr><td>Core Temperature</td><td>38–40°C (100.4–104°F)</td><td>>40°C (>104°F)</td></tr><tr><td>Mental Status</td><td>Fatigue, headache, nausea, dizziness — CNS intact</td><td>CNS dysfunction: confusion, seizures, combativeness, coma</td></tr><tr><td>Skin</td><td>Diaphoretic, pale</td><td>May be dry (classic) or diaphoretic (exertional)</td></tr><tr><td>Management</td><td>Remove from heat, oral/IV hydration, rest, cooling measures, monitor</td><td>Immediate cold water immersion (CWI), aggressive IV fluids, target temp <39°C within 30 minutes</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL POINT Heat stroke is a medical emergency with mortality up to 50% if treatment is delayed. The single most important intervention is rapid cooling. Cold water immersion (CWI) is the gold standard — submerge to neck in ice water bath. If CWI unavailable: ice packs to axillae/groin/neck + misting with fans + cold IV fluids. Target core temperature <39°C within 30 minutes of arrival.</div>
<h4>Complications to Monitor</h4>
<ul><li><strong>Rhabdomyolysis:</strong> Check CK, BMP, urinalysis for myoglobinuria; aggressive IV hydration</li><li><strong>DIC:</strong> Monitor CBC, fibrinogen, D-dimer, PT/PTT</li><li><strong>Hepatic failure:</strong> Monitor LFTs (may be delayed 24–72 hours)</li><li><strong>Acute kidney injury:</strong> Monitor UOP, creatinine, potassium</li><li><strong>Cerebral edema:</strong> Serial neurologic exams, consider CT if altered mental status persists after cooling</li></ul>`,
      },
      {
        id: '21.3',
        heading: `Envenomation`,
        content_html: `<p>Envenomation emergencies in pediatric patients require rapid species identification and appropriate antivenom administration when indicated. Children receive proportionally larger venom loads relative to body mass, which can lead to more severe envenomation syndromes.</p>
<h4>Pit Viper Envenomation (Rattlesnake, Copperhead, Cottonmouth)</h4>
<ul><li>Local effects: pain, swelling, ecchymosis progressing proximally — mark and time leading edge of swelling</li><li>Systemic effects: coagulopathy (check PT/INR, fibrinogen, platelets), hypotension, metallic taste, perioral paresthesias</li><li><strong>Antivenom:</strong> CroFab (crotalidae polyvalent immune Fab) — 4–6 vials IV initial dose; or Anavip (F(ab')2) — 10 vials IV initial dose</li><li>Repeat dosing if progression continues</li></ul>
<div class="alert alert-danger">CRITICAL POINT For pit viper bites: Do NOT apply tourniquet. Do NOT incise the wound. Do NOT attempt suction. Do NOT apply ice. These interventions worsen outcomes. Remove constrictive jewelry/clothing, immobilize the extremity at heart level, and administer antivenom.</div>
<h4>Black Widow Spider (Latrodectus)</h4>
<ul><li>Local pain progressing to regional/diffuse muscle cramping, rigidity, and pain</li><li>Autonomic instability: hypertension, tachycardia, diaphoresis</li><li>Treatment: Pain management (opioids, benzodiazepines), Latrodectus antivenin for severe symptoms (respiratory distress, uncontrolled hypertension, severe pain unresponsive to analgesics)</li></ul>
<h4>Brown Recluse Spider (Loxosceles)</h4>
<ul><li>Initial painless bite progressing to erythema, central pallor/vesicle, then necrotic eschar over days</li><li>Systemic loxoscelism (rare in children): hemolytic anemia, DIC, rhabdomyolysis, renal failure</li><li>Treatment: Wound care, tetanus prophylaxis, analgesics. No US-approved antivenin available. Dapsone sometimes used but evidence is limited. Surgical debridement only after demarcation (not early)</li></ul>
<h4>Hymenoptera (Bees, Wasps, Fire Ants)</h4>
<ul><li>Local reactions: pain, erythema, swelling at sting site — supportive care, ice, antihistamines</li><li>Large local reactions: swelling >10 cm — oral steroids may help, not predictive of future anaphylaxis</li><li><strong>Anaphylaxis:</strong> Treat per standard anaphylaxis protocol — epinephrine 0.01 mg/kg IM (1:1,000) is first-line</li><li>Prescribe epinephrine auto-injector (0.15 mg for <30 kg, 0.3 mg for ≥30 kg) for any child with systemic allergic reaction to Hymenoptera</li><li>Refer to allergy for venom immunotherapy evaluation</li></ul>`,
      },
    ],
  },
  {
    id: 'ch22',
    number: '22',
    title: `Pediatric Psychiatric Emergencies`,
    sections: [
      {
        id: '22.1',
        heading: `Overview — The Growing Crisis`,
        content_html: `<p>Pediatric mental health emergencies have increased dramatically, with a <strong>>50% increase in mental health-related ED visits</strong> among children and adolescents over the past decade. This crisis disproportionately affects rural communities, where access to outpatient mental health services is severely limited, leading to the ED becoming the de facto safety net for acute psychiatric presentations.</p>
<p>Key challenges for rural ED physicians:</p>
<ul><li>Limited or no on-site psychiatric consultation</li><li>Prolonged boarding times (often 24–72+ hours) while awaiting psychiatric bed placement</li><li>Lack of designated safe spaces for psychiatric patients in the ED</li><li>Staff unfamiliarity with pediatric psychiatric assessment and management</li><li>Telepsychiatry availability varies widely by region and time of day</li></ul>
<p>Despite these challenges, the rural ED physician must be prepared to assess risk, initiate stabilization, ensure safety, and coordinate disposition for pediatric psychiatric emergencies.</p>`,
      },
      {
        id: '22.2',
        heading: `Suicidal Ideation and Self-Harm`,
        content_html: `<p>Suicide is the second leading cause of death in children aged 10–24 years. Every child presenting with suicidal ideation, self-harm, or concerning behavioral changes requires systematic risk assessment.</p>
<h4>Columbia Suicide Severity Rating Scale (C-SSRS) — Screening Questions</h4>
<ul><li><strong>Question 1:</strong> Have you wished you were dead or wished you could go to sleep and not wake up?</li><li><strong>Question 2:</strong> Have you had any actual thoughts of killing yourself?</li><li><strong>Question 3:</strong> Have you been thinking about how you might do this?</li><li><strong>Question 4:</strong> Have you had any intention of acting on these thoughts?</li><li><strong>Question 5:</strong> Have you started to work out or worked out the details of how to kill yourself?</li><li><strong>Question 6:</strong> Have you done anything, started to do anything, or prepared to do anything to end your life?</li></ul>
<p>Any "yes" response to questions 3–6 indicates high risk.</p>
<h4>High-Risk Features</h4>
<ul><li>Specific plan with access to means (especially <strong>firearm access</strong> — leading method of completed suicide in youth)</li><li>Prior suicide attempt (strongest predictor of future attempt)</li><li>Recent discharge from psychiatric facility</li><li>Substance intoxication</li><li>LGBTQ+ youth (4x higher risk than peers)</li><li>History of abuse/neglect or recent loss</li><li>Social isolation, bullying</li></ul>
<h4>ED Management</h4>
<ul><li><strong>1:1 observation</strong> — continuous visual monitoring by designated staff</li><li>Remove all potential means of self-harm from the environment (ligature points, sharps, medications, belts, cords)</li><li><strong>Means restriction counseling</strong> with caregivers — specifically address firearm safety (secure storage or temporary removal from home)</li><li>Medical clearance: focused history/exam, consider toxicology screen if ingestion suspected</li><li>Telepsychiatry consultation when available</li><li>If disposition is discharge: documented safety plan, crisis hotline numbers (988 Suicide & Crisis Lifeline), outpatient follow-up within 72 hours, caregiver education on means restriction</li></ul>
<div class="alert alert-danger">CRITICAL POINT Asking about suicide does NOT increase suicidal ideation — it reduces it. Screen every adolescent presenting with behavioral complaints, substance use, or vague somatic complaints. Direct, nonjudgmental questioning saves lives.</div>`,
      },
      {
        id: '22.3',
        heading: `Acute Agitation Management`,
        content_html: `<p>Acute agitation in the pediatric ED requires a stepwise approach prioritizing de-escalation before pharmacologic intervention and pharmacologic intervention before physical restraint.</p>
<h4>De-escalation Principles</h4>
<ul><li>Approach calmly with non-threatening body language (open hands, no crossed arms)</li><li>Speak in low, calm tone — use the patient's name</li><li>Offer choices and autonomy ("Would you like to sit here or there?")</li><li>Remove audience/stimulation — quiet room, dim lights</li><li>Acknowledge the patient's distress without judgment</li><li>Set clear, simple limits with consistent follow-through</li><li>Involve parents/caregivers when helpful (not always — sometimes the relationship is the trigger)</li></ul>
<h4>Pharmacologic Management</h4>
<table><thead><tr><th>Medication</th><th>Dose</th><th>Route</th><th>Notes</th></tr></thead><tbody><tr><td>Olanzapine (first-line)</td><td>0.1 mg/kg (max 10 mg)</td><td>PO/IM</td><td>Preferred first-line — fast onset, effective for both psychotic and non-psychotic agitation. Do NOT combine with benzodiazepines (respiratory depression risk)</td></tr><tr><td>Diphenhydramine</td><td>1 mg/kg (max 50 mg)</td><td>PO/IM/IV</td><td>Mild sedation, useful adjunct, low risk profile</td></tr><tr><td>Lorazepam</td><td>0.05–0.1 mg/kg (max 2 mg)</td><td>PO/IM/IV</td><td>Preferred for substance-related agitation and known seizure risk. Monitor respiratory status</td></tr><tr><td>Haloperidol</td><td>0.025–0.05 mg/kg (max 5 mg)</td><td>PO/IM</td><td>Second-line typical antipsychotic. Monitor QTc. Risk of dystonia — have diphenhydramine available</td></tr><tr><td>Ketamine (last resort)</td><td>1–2 mg/kg IV or 4 mg/kg IM</td><td>IV/IM</td><td>Reserved for severe, refractory agitation with imminent danger. Rapid onset, reliable IM absorption. Monitor for laryngospasm, emergence reactions</td></tr></tbody></table>
<h4>Physical Restraint Guidelines</h4>
<div class="alert alert-danger">CRITICAL POINT Physical restraint is a last resort when the patient poses imminent danger to self or others and all de-escalation and pharmacologic measures have failed or are not feasible. NEVER use prone restraint — risk of positional asphyxia and death. Supine or lateral positioning only.</div>
<ul><li>Use the minimum restraint necessary for the shortest duration possible</li><li>Continuous monitoring: respiratory status, circulation of restrained extremities, mental status</li><li>Reassess need for restraints every 15 minutes (every 1 hour by physician)</li><li>Document indication, attempts at de-escalation, type of restraint, and reassessment</li><li>Offer food, water, toileting at regular intervals</li></ul>`,
      },
      {
        id: '22.4',
        heading: `Eating Disorders — Acute Medical Complications`,
        content_html: `<p>Children and adolescents with eating disorders (anorexia nervosa, bulimia nervosa, ARFID) may present to the ED with acute medical complications that require emergent stabilization. The ED physician must recognize the medical severity and initiate appropriate management.</p>
<h4>Cardiac Complications</h4>
<ul><li><strong>Bradycardia:</strong> HR <50 bpm is common in severe malnutrition — reflects decreased metabolic demand and cardiac muscle wasting</li><li><strong>QTc prolongation:</strong> Increases risk of torsades de pointes and sudden cardiac death</li><li>Orthostatic hypotension and syncope</li><li>Pericardial effusion (rare but reported)</li></ul>
<h4>Metabolic Complications</h4>
<ul><li>Hypokalemia (from purging — vomiting or laxative abuse)</li><li>Hypophosphatemia, hypomagnesemia</li><li>Metabolic alkalosis (vomiting) or acidosis (laxative abuse)</li><li>Hypoglycemia in severe restriction</li></ul>
<h4>Refeeding Syndrome</h4>
<div class="alert alert-danger">CRITICAL POINT Refeeding syndrome can be fatal. It occurs when malnourished patients are fed too rapidly, causing intracellular shift of phosphorus, magnesium, and potassium. Monitor electrolytes (Phos, Mg, K) every 6–12 hours during initial refeeding. Start caloric repletion slowly and advance gradually.</div>
<h4>Admission Criteria</h4>
<table><thead><tr><th>Parameter</th><th>Admit if:</th></tr></thead><tbody><tr><td>Heart Rate</td><td><50 bpm</td></tr><tr><td>Systolic Blood Pressure</td><td><90 mmHg</td></tr><tr><td>QTc Interval</td><td>>500 ms</td></tr><tr><td>Potassium</td><td><3.0 mEq/L</td></tr><tr><td>Phosphorus</td><td><3.0 mg/dL</td></tr><tr><td>Temperature</td><td><35.5°C (96°F)</td></tr><tr><td>Blood Glucose</td><td><60 mg/dL</td></tr><tr><td>BMI</td><td><75% median BMI for age/sex</td></tr><tr><td>Weight Loss</td><td>>10% in 1 month or >25% total</td></tr><tr><td>Syncope or Presyncope</td><td>Present</td></tr><tr><td>Suicidal Ideation</td><td>Present</td></tr></tbody></table>`,
      },
    ],
  },
  {
    id: 'ch23',
    number: '23',
    title: `UTI and Acute Kidney Injury`,
    sections: [
      {
        id: '23.1',
        heading: `Pediatric Urinary Tract Infections`,
        content_html: `<p>UTI is one of the most common serious bacterial infections in febrile young children. Accurate diagnosis requires proper specimen collection — contaminated specimens lead to inappropriate antibiotic use and unnecessary imaging.</p>
<div class="alert alert-danger">CRITICAL POINT For non-toilet-trained children, urine specimens for culture MUST be obtained by catheterization or suprapubic aspiration. NEVER use a bag specimen for UTI diagnosis — contamination rates exceed 60%, leading to false-positive cultures, unnecessary antibiotics, and unnecessary imaging workups.</div>
<h4>Specimen Collection by Age</h4>
<ul><li><strong>Non-toilet-trained:</strong> Urethral catheterization (preferred) or suprapubic aspiration (gold standard but more invasive)</li><li><strong>Toilet-trained:</strong> Clean-catch midstream specimen (after proper cleaning)</li></ul>
<h4>UA Interpretation</h4>
<ul><li>Positive leukocyte esterase OR nitrites suggests UTI (nitrites more specific but less sensitive — many pediatric pathogens do not reduce nitrates)</li><li>Pyuria (>5 WBC/hpf on microscopy) supports diagnosis</li><li>Bacteriuria on microscopy increases specificity</li><li>Negative UA does not completely rule out UTI in young febrile infants — send culture regardless if clinical suspicion is high</li></ul>
<h4>Treatment</h4>
<table><thead><tr><th>Diagnosis</th><th>Antibiotic</th><th>Dose</th><th>Duration</th><th>Notes</th></tr></thead><tbody><tr><td>Cystitis (lower UTI)</td><td>Cephalexin</td><td>25–50 mg/kg/day divided BID-QID</td><td>3–5 days</td><td>For uncomplicated lower tract infection in toilet-trained children</td></tr><tr><td>Pyelonephritis (febrile UTI)</td><td>Ceftriaxone IV then oral step-down</td><td>50 mg/kg/day IV (max 2g), then cephalexin or cefixime PO</td><td>10–14 days total</td><td>IV until afebrile 24–48h and tolerating oral, then complete course PO</td></tr><tr><td>Complicated/septic UTI</td><td>Ceftriaxone or Ampicillin + Gentamicin</td><td>Standard dosing</td><td>10–14 days</td><td>For ill-appearing infants or concern for urosepsis</td></tr></tbody></table>
<h4>Follow-up Imaging</h4>
<ul><li>Renal/bladder ultrasound: Recommended for all children 2 months–2 years with first febrile UTI</li><li>VCUG: Consider for recurrent UTI, abnormal ultrasound, or atypical pathogens</li></ul>`,
      },
      {
        id: '23.2',
        heading: `Hemolytic Uremic Syndrome (HUS)`,
        content_html: `<p>Hemolytic uremic syndrome (HUS) is the most common cause of acute kidney injury in young children. The classic triad is microangiopathic hemolytic anemia (MAHA), thrombocytopenia, and acute kidney injury. It typically follows Shiga toxin-producing E. coli (STEC) O157:H7 infection presenting as bloody diarrhea.</p>
<h4>Classic Triad</h4>
<ul><li><strong>Microangiopathic hemolytic anemia (MAHA):</strong> Schistocytes on smear, elevated LDH, low haptoglobin, indirect hyperbilirubinemia, Coombs-negative</li><li><strong>Thrombocytopenia:</strong> Often <60,000/mm³, consumption-mediated</li><li><strong>Acute kidney injury:</strong> Oliguria/anuria, elevated creatinine, hematuria, proteinuria</li></ul>
<div class="alert alert-danger">CRITICAL POINT Two absolute rules in STEC-associated HUS: (1) Do NOT give antibiotics for STEC diarrhea — antibiotics increase Shiga toxin release and worsen HUS risk. (2) Do NOT transfuse platelets unless there is life-threatening hemorrhage — platelet transfusion fuels the thrombotic microangiopathy and worsens organ damage.</div>
<h4>Management</h4>
<ul><li>Supportive care is the mainstay — most children recover with supportive management alone</li><li>Strict fluid balance: avoid overhydration (may worsen AKI) and dehydration</li><li>Monitor electrolytes, BUN/Cr, CBC, reticulocyte count, LDH every 6–12 hours</li><li>Transfuse pRBCs for hemoglobin <6–7 g/dL or symptomatic anemia</li><li>Dialysis (peritoneal or hemodialysis) for: severe oliguria/anuria, refractory hyperkalemia, severe fluid overload, uremic symptoms</li><li>Seizure precautions — CNS involvement occurs in 20–30% of cases</li><li>Monitor for hypertension — treat as needed</li></ul>`,
      },
      {
        id: '23.3',
        heading: `Acute Kidney Injury (AKI)`,
        content_html: `<p>Acute kidney injury in children requires prompt recognition, identification of the underlying cause, and management to prevent progression to severe renal failure.</p>
<h4>KDIGO Classification</h4>
<table><thead><tr><th>Stage</th><th>Serum Creatinine Criteria</th><th>Urine Output Criteria</th></tr></thead><tbody><tr><td>Stage 1</td><td>1.5–1.9x baseline OR ≥0.3 mg/dL increase</td><td><0.5 mL/kg/h for 6–12 hours</td></tr><tr><td>Stage 2</td><td>2.0–2.9x baseline</td><td><0.5 mL/kg/h for ≥12 hours</td></tr><tr><td>Stage 3</td><td>≥3.0x baseline OR ≥4.0 mg/dL OR initiation of RRT</td><td><0.3 mL/kg/h for ≥24 hours OR anuria ≥12 hours</td></tr></tbody></table>
<h4>Etiology by Category</h4>
<ul><li><strong>Pre-renal (most common in children):</strong> Dehydration, hemorrhage, sepsis, heart failure — responds to volume repletion</li><li><strong>Intrinsic renal:</strong> ATN (from prolonged pre-renal state), glomerulonephritis, HUS, interstitial nephritis, nephrotoxins</li><li><strong>Post-renal (obstructive):</strong> Posterior urethral valves, ureteropelvic junction obstruction, nephrolithiasis, tumor</li></ul>
<h4>Management Priorities</h4>
<ul><li>Identify and treat underlying cause</li><li>Optimize volume status — fluid challenge for pre-renal, restrict fluids if oliguric/anuric after volume optimization</li><li><strong>Avoid nephrotoxins:</strong> NSAIDs, aminoglycosides, IV contrast (when possible), ACE inhibitors</li><li>Manage hyperkalemia aggressively (see DKA chapter for calcium, insulin/glucose, kayexalate, albuterol)</li><li>Monitor electrolytes, acid-base status, fluid balance every 4–6 hours</li><li>Renal dose-adjust all medications</li><li>Nephrology consultation for Stage 2–3 AKI or any child potentially requiring dialysis</li></ul>`,
      },
    ],
  },
  {
    id: 'ch24',
    number: '24',
    title: `Pediatric Procedural Quick Reference`,
    sections: [
      {
        id: '24.1',
        heading: `Intraosseous (IO) Access`,
        content_html: `<p>Intraosseous access is the most reliable emergent vascular access in critically ill children when peripheral IV access cannot be obtained within 90 seconds or two attempts.</p>
<h4>Preferred Site</h4>
<p>Proximal tibia — anteromedial flat surface, 1–2 cm below the tibial tuberosity. Avoid the growth plate. Alternative sites: distal tibia (medial malleolus), distal femur, proximal humerus (in older children/adolescents).</p>
<h4>EZ-IO Needle Selection</h4>
<table><thead><tr><th>Patient Size</th><th>Needle</th><th>Color</th></tr></thead><tbody><tr><td>3–39 kg (PD needle)</td><td>15 mm, 15 gauge</td><td>Pink</td></tr><tr><td>≥40 kg (AD needle)</td><td>25 mm, 15 gauge</td><td>Blue</td></tr><tr><td>Excessive tissue (ELD needle)</td><td>45 mm, 15 gauge</td><td>Yellow</td></tr></tbody></table>
<h4>Key Points</h4>
<ul><li><strong>All ACLS/PALS medications can be given IO</strong> — same dose as IV</li><li>Fluids may need to be given under pressure (pressure bag or push-pull technique) due to bony resistance</li><li>Flush with 5–10 mL NS after each medication administration</li><li>Maximum dwell time: <strong>24 hours</strong></li><li>Obtain standard vascular access and remove IO as soon as feasible</li><li>Complications: extravasation (most common — confirm placement by aspirating marrow), compartment syndrome (rare), osteomyelitis (rare with <24h use), fat embolism (theoretical)</li></ul>
<div class="alert alert-warning">CLINICAL PEARL Lidocaine 0.5 mg/kg IO (preservative-free, slow push over 60 seconds) can reduce pain of IO infusion in conscious patients. Allow 60 seconds to take effect before flushing or administering medications.</div>`,
      },
      {
        id: '24.2',
        heading: `Umbilical Venous Catheter (UVC) Insertion`,
        content_html: `<p>UVC insertion is a critical neonatal resuscitation skill. The umbilical vein provides rapid, reliable central venous access in the first minutes to days of life.</p>
<h4>Catheter Selection</h4>
<table><thead><tr><th>Newborn Weight</th><th>Catheter Size</th></tr></thead><tbody><tr><td><3.5 kg</td><td>3.5 Fr single-lumen</td></tr><tr><td>≥3.5 kg</td><td>5 Fr single- or double-lumen</td></tr></tbody></table>
<h4>Technique</h4>
<ul><li>Clean the cord stump with chlorhexidine or povidone-iodine</li><li>Cut the cord 1–2 cm above the abdominal wall with a scalpel — identify the vessels: <strong>one large, thin-walled vein at the 12 o'clock position</strong> and two smaller, thick-walled arteries</li><li>Pre-fill the catheter with normal saline and attach to a stopcock</li><li>Gently insert the catheter into the umbilical vein — advance <strong>4–5 cm</strong> (until blood returns freely)</li><li>Aspirate to confirm blood return, then flush</li><li>Secure with a purse-string suture and tape bridge</li></ul>
<h4>Confirmation</h4>
<ul><li><strong>X-ray confirmation:</strong> Tip should be at the junction of the IVC and right atrium (T8–T10 vertebral level)</li><li>If tip is in the portal system (directed laterally on X-ray), pull back to just inside the abdominal wall (emergency position — 2–3 cm insertion depth)</li></ul>
<div class="alert alert-warning">CLINICAL PEARL In emergent situations during neonatal resuscitation, inserting just enough to get blood return (2–4 cm) is sufficient for medication and fluid administration. Do not delay resuscitation for ideal catheter positioning — confirm position with X-ray when the infant is stabilized.</div>`,
      },
      {
        id: '24.3',
        heading: `Lumbar Puncture (LP) in Infants`,
        content_html: `<p>Lumbar puncture is essential for diagnosing meningitis in infants and young children. Proper technique and interpretation are critical.</p>
<h4>Technique</h4>
<ul><li><strong>Position:</strong> Seated (preferred — wider interspinous space, improved CSF yield) or lateral decubitus with maximal hip/knee flexion. Avoid excessive neck flexion in infants — can compromise airway</li><li><strong>Landmark:</strong> L3-L4 or L4-L5 interspace (palpate the intercristal line — iliac crests mark approximately L4)</li><li><strong>Needle:</strong> 22-gauge, 1.5-inch for infants, 2.5-inch for older children; stylet in place during insertion</li><li>Advance slowly with stylet — remove stylet frequently to check for CSF flow (you may not feel a "pop" in infants)</li><li>Collect 1 mL per tube, minimum 4 tubes: tube 1 (cell count), tube 2 (glucose/protein), tube 3 (culture/Gram stain), tube 4 (cell count for comparison)</li></ul>
<h4>Traumatic Tap Correction</h4>
<p>If blood is present in the CSF (traumatic tap), use the following correction to interpret WBC count:</p>
<ul><li><strong>Subtract 1 WBC for every 500–1,000 RBCs</strong> in the CSF</li><li>Compare tube 1 to tube 4 — true SAH has non-clearing RBCs, while traumatic tap typically clears</li><li>CSF protein is unreliable in a traumatic tap (blood adds ~1 mg/dL protein per 1,000 RBCs)</li></ul>
<h4>Normal CSF Values</h4>
<table><thead><tr><th>Parameter</th><th>Neonates (0–28 days)</th><th>Infants/Children</th></tr></thead><tbody><tr><td>WBC</td><td>0–30/mm³ (up to 60% PMNs acceptable)</td><td>0–5/mm³ (should be lymphocyte-predominant)</td></tr><tr><td>Protein</td><td>20–170 mg/dL</td><td>15–45 mg/dL</td></tr><tr><td>Glucose</td><td>34–119 mg/dL</td><td>40–80 mg/dL</td></tr><tr><td>CSF:Serum Glucose Ratio</td><td colspan="2"><strong><0.6 is abnormal</strong> (suggestive of bacterial infection)</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL POINT Never delay antibiotic administration for LP. If the child is critically ill, give antibiotics first and perform LP when the patient is stable. CSF cultures may remain positive for hours after antibiotic administration. Blood cultures should also be obtained before antibiotics when feasible.</div>`,
      },
      {
        id: '24.4',
        heading: `Chest Tube Insertion (Tube Thoracostomy)`,
        content_html: `<p>Chest tube insertion is indicated for pneumothorax, hemothorax, empyema, or large pleural effusions causing respiratory compromise in pediatric patients.</p>
<h4>Tube Size by Age</h4>
<table><thead><tr><th>Age Group</th><th>Tube Size (French)</th></tr></thead><tbody><tr><td>Neonate</td><td>10–12 Fr</td></tr><tr><td>Infant (1–12 months)</td><td>12–16 Fr</td></tr><tr><td>Child (1–8 years)</td><td>16–24 Fr</td></tr><tr><td>Adolescent (>8 years)</td><td>24–32 Fr</td></tr></tbody></table>
<p>Use larger tubes for hemothorax/empyema (viscous fluid) and smaller tubes for pneumothorax (air).</p>
<h4>Insertion Technique</h4>
<ul><li><strong>Site:</strong> Triangle of safety — 4th or 5th intercostal space, anterior to the mid-axillary line</li><li>Position patient supine with ipsilateral arm above head (or seated and leaning forward for older children)</li><li>Prep and drape; local anesthesia with lidocaine (skin, subcutaneous tissue, periosteum, and parietal pleura)</li><li>Make a 2–3 cm incision over the <strong>rib below</strong> the target interspace (to create a subcutaneous tunnel)</li><li>Use blunt dissection (Kelly clamp) through intercostal muscles — always go <strong>over the superior border of the rib</strong> (neurovascular bundle runs along inferior border)</li><li>Pop through parietal pleura, confirm with rush of air or fluid</li><li>Guide the tube posteriorly and superiorly (for air) or posteriorly and inferiorly (for fluid)</li><li>Connect to underwater seal drainage system</li><li>Secure with suture and occlusive dressing</li><li><strong>Confirm placement with chest X-ray</strong></li></ul>
<div class="alert alert-danger">CRITICAL POINT Never use a trocar for chest tube insertion in children — risk of lung and mediastinal injury is unacceptably high. Always use blunt dissection technique.</div>`,
      },
      {
        id: '24.5',
        heading: `Needle Cricothyrotomy`,
        content_html: `<p>Needle cricothyrotomy is the emergent surgical airway technique for children under 8–12 years of age (surgical cricothyrotomy is preferred in adolescents/adults). It is a temporizing measure for the "cannot intubate, cannot oxygenate" scenario.</p>
<h4>Equipment</h4>
<ul><li><strong>14- or 16-gauge angiocatheter</strong> (largest available)</li><li>3 mL syringe attached for aspiration during insertion</li><li>Jet ventilation setup (if available) or improvised: connect catheter hub to 3 mL syringe barrel, attach ETT adapter (7.0 mm ETT adapter fits 3 mL syringe), connect to BVM or wall oxygen</li></ul>
<h4>Technique</h4>
<ul><li>Position: neck extended (unless cervical spine precaution)</li><li>Identify the cricothyroid membrane (between thyroid and cricoid cartilages)</li><li>Stabilize the larynx with non-dominant hand</li><li>Insert the angiocatheter at a <strong>45-degree angle</strong> (caudal direction) through the cricothyroid membrane, aspirating continuously</li><li>Aspiration of air confirms tracheal placement</li><li>Advance the catheter over the needle, remove the needle</li><li>Connect to oxygen source</li></ul>
<h4>Jet Ventilation</h4>
<ul><li><strong>1 second ON (insufflation), 4 seconds OFF (passive exhalation)</strong></li><li>This provides oxygenation but <strong>limited CO2 clearance</strong> — CO2 will gradually rise</li><li>This is a <strong>temporizing measure for 30–45 minutes maximum</strong></li><li>Definitive airway must be established urgently (surgical airway by experienced provider, or tracheostomy by surgeon)</li></ul>
<div class="alert alert-danger">CRITICAL POINT Needle cricothyrotomy provides oxygenation but NOT adequate ventilation. Barotrauma is a major risk if exhalation time is insufficient. Ensure the 1:4 ratio (1 second on, 4 seconds off) and keep jet pressures at minimum effective levels. This buys time — it does not replace a definitive airway.</div>`,
      },
      {
        id: '24.6',
        heading: `Pericardiocentesis`,
        content_html: `<p>Emergency pericardiocentesis is indicated for cardiac tamponade — a life-threatening condition where pericardial fluid accumulation impairs cardiac filling, causing obstructive shock. In the rural ED, this is most commonly encountered in trauma, but can occur with pericarditis, post-cardiac surgery, malignancy, or renal failure.</p>
<h4>Indications for Emergency Pericardiocentesis</h4>
<ul><li>Beck's triad: hypotension, muffled heart sounds, JVD (full triad present in only ~30% of cases)</li><li>PEA arrest with pericardial effusion on bedside ultrasound</li><li>Hemodynamic instability with known/suspected pericardial effusion</li></ul>
<h4>Technique — Subxiphoid Approach</h4>
<ul><li><strong>Position:</strong> Semi-upright (45°) to allow fluid to pool inferiorly and anteriorly</li><li><strong>Ultrasound-guided</strong> (strongly preferred — improves success rate and reduces complications)</li><li>Insert an 18-gauge spinal needle (or angiocatheter) just to the left of the xiphoid process</li><li>Direct the needle <strong>toward the left shoulder at a 30–45 degree angle</strong> from the skin</li><li>Advance slowly, aspirating continuously</li><li>Aspiration of non-clotting blood (pericardial blood has been defibrinated) confirms pericardial entry</li><li>If blood clots, the needle is likely in the cardiac chamber — withdraw slightly</li><li>Aspirate as much fluid as possible</li></ul>
<div class="alert alert-warning">CLINICAL PEARL Removal of as little as 10–20 mL of pericardial fluid can produce dramatic hemodynamic improvement in tamponade. Do not be surprised by significant improvement with seemingly small volume drainage — the pericardial pressure-volume curve is steep.</div>
<h4>Post-Procedure</h4>
<ul><li>If using angiocatheter: leave catheter in place, aspirate periodically, secure to chest wall</li><li>Repeat echocardiogram to assess for re-accumulation</li><li>Definitive management (pericardial window, surgical repair) requires transfer to a center with cardiothoracic surgery capability</li></ul>`,
      },
    ],
  },
  {
    id: 'appendices',
    number: 'A-I',
    title: `Appendices — Quick Reference Tables`,
    sections: [
      {
        id: 'App.A',
        heading: `Quick Reference — Weight-Based Emergency Medications`,
        content_html: `<p>The following are approximate doses. Always verify weight and dosing.</p>
<table><thead><tr><th>Medication</th><th>Indication</th><th>Dose</th><th>Route</th><th>Max Dose</th></tr></thead><tbody><tr><td>Epinephrine (1:10,000)</td><td>Cardiac arrest</td><td>0.01 mg/kg (0.1 mL/kg)</td><td>IV/IO</td><td>1 mg</td></tr><tr><td>Epinephrine (1:1,000)</td><td>Anaphylaxis</td><td>0.01 mg/kg</td><td>IM</td><td>0.5 mg</td></tr><tr><td>Adenosine</td><td>SVT</td><td>0.1 mg/kg, then 0.2 mg/kg</td><td>Rapid IV push</td><td>6 mg, then 12 mg</td></tr><tr><td>Amiodarone</td><td>VF/pVT, refractory SVT</td><td>5 mg/kg</td><td>IV/IO</td><td>300 mg</td></tr><tr><td>Atropine</td><td>Symptomatic bradycardia</td><td>0.02 mg/kg</td><td>IV/IO</td><td>0.5 mg (min 0.1 mg)</td></tr><tr><td>Dextrose (D10)</td><td>Hypoglycemia (neonates)</td><td>2–5 mL/kg</td><td>IV</td><td>Per response</td></tr><tr><td>Dextrose (D25)</td><td>Hypoglycemia (children)</td><td>2–4 mL/kg</td><td>IV</td><td>Per response</td></tr><tr><td>Lorazepam</td><td>Seizures</td><td>0.1 mg/kg</td><td>IV</td><td>4 mg</td></tr><tr><td>Midazolam</td><td>Seizures (no IV)</td><td>0.2 mg/kg</td><td>IM or IN</td><td>10 mg</td></tr><tr><td>Ceftriaxone</td><td>Sepsis/meningitis</td><td>50–100 mg/kg</td><td>IV/IM</td><td>2–4 g</td></tr><tr><td>Naloxone</td><td>Opioid reversal</td><td>0.1 mg/kg</td><td>IV/IM/IN</td><td>2 mg (may repeat)</td></tr><tr><td>Ondansetron</td><td>Nausea/vomiting</td><td>0.15 mg/kg</td><td>IV/PO</td><td>4 mg</td></tr><tr><td>Hydrocortisone</td><td>Adrenal crisis</td><td>2 mg/kg</td><td>IV</td><td>100 mg</td></tr><tr><td>Mannitol</td><td>Cerebral edema</td><td>0.5–1 g/kg</td><td>IV over 15–20 min</td><td>Per response</td></tr><tr><td>3% Hypertonic Saline</td><td>Cerebral edema/hyponatremia</td><td>2–5 mL/kg</td><td>IV over 10–20 min</td><td>Per response</td></tr></tbody></table>`,
      },
      {
        id: 'App.B',
        heading: `Age-Based ETT and Equipment Sizing`,
        content_html: `<table><thead><tr><th>Age</th><th>Weight (est.)</th><th>Cuffed ETT Size</th><th>Depth (cm at lip)</th><th>Laryngoscope Blade</th><th>Suction Catheter</th></tr></thead><tbody><tr><td>Premature</td><td>1–3 kg</td><td>2.5–3.0</td><td>7–9</td><td>Miller 0</td><td>6–8 Fr</td></tr><tr><td>Newborn</td><td>3–4 kg</td><td>3.0–3.5</td><td>9–10.5</td><td>Miller 0–1</td><td>8 Fr</td></tr><tr><td>6 months</td><td>7 kg</td><td>3.5</td><td>10.5</td><td>Miller 1</td><td>8 Fr</td></tr><tr><td>1 year</td><td>10 kg</td><td>3.5–4.0</td><td>10.5–12</td><td>Miller 1</td><td>8–10 Fr</td></tr><tr><td>2 years</td><td>12 kg</td><td>4.0</td><td>12</td><td>Miller 1–2</td><td>10 Fr</td></tr><tr><td>4 years</td><td>16 kg</td><td>4.5</td><td>13.5</td><td>Miller 2 / Mac 2</td><td>10 Fr</td></tr><tr><td>6 years</td><td>20 kg</td><td>5.0</td><td>15</td><td>Miller 2 / Mac 2</td><td>10–12 Fr</td></tr><tr><td>8 years</td><td>25 kg</td><td>5.5</td><td>16.5</td><td>Mac 2–3</td><td>12 Fr</td></tr><tr><td>10 years</td><td>30 kg</td><td>6.0</td><td>18</td><td>Mac 2–3</td><td>12 Fr</td></tr><tr><td>12 years</td><td>40 kg</td><td>6.0–6.5</td><td>18–19.5</td><td>Mac 3</td><td>12–14 Fr</td></tr><tr><td>14+ years</td><td>50+ kg</td><td>7.0–7.5</td><td>21–22.5</td><td>Mac 3–4</td><td>14 Fr</td></tr></tbody></table>`,
      },
      {
        id: 'App.C',
        heading: `Key Contact Numbers and Resources`,
        content_html: `<p>Pre-fill this section with your facility’s specific contact information:</p>
<table><thead><tr><th>Resource</th><th>Contact Number</th><th>Notes</th></tr></thead><tbody><tr><td>Regional Children’s Hospital Transfer Center</td><td>________________</td><td>Primary transfer destination</td></tr><tr><td>Pediatric Critical Care Telemedicine</td><td>________________</td><td>For real-time consultation</td></tr><tr><td>Poison Control Center</td><td>1-800-222-1222</td><td>24/7 national hotline</td></tr><tr><td>Burn Center</td><td>________________</td><td>Regional burn center</td></tr><tr><td>Child Protective Services</td><td>________________</td><td>State/county CPS hotline</td></tr><tr><td>Air Medical Transport</td><td>________________</td><td>Helicopter/fixed-wing service</td></tr><tr><td>Ground Critical Care Transport</td><td>________________</td><td>Pediatric transport team</td></tr><tr><td>Blood Bank</td><td>________________</td><td>Emergency release protocol</td></tr></tbody></table>`,
      },
      {
        id: 'App.D',
        heading: `Recommended Reading and Resources`,
        content_html: `<ul><li>AAP/AHA PALS Provider Manual (current edition)</li></ul>
<ul><li>Neonatal Resuscitation Program (NRP) Textbook (8th Edition, 2022)</li></ul>
<ul><li>Surviving Sepsis Campaign International Guidelines for Children (2024)</li></ul>
<ul><li>AAP Clinical Practice Guideline for Bronchiolitis (2014, reaffirmed 2022)</li></ul>
<ul><li>ISPAD Clinical Practice Consensus Guidelines for DKA Management</li></ul>
<ul><li>National Pediatric Readiness Project (EMSC): pedsready.org</li></ul>
<ul><li>American Burn Association: ameriburn.org</li></ul>
<ul><li>Broselow Pediatric Emergency Tape</li></ul>
<ul><li>PEMSoft (Pediatric Emergency Medicine Software)</li></ul>
<ul><li>MDCalc (clinical calculator app with pediatric tools)</li></ul>
<p><em>— End of Guide —</em></p>`,
      },
      {
        id: 'App.E',
        heading: `Pediatric GCS (Modified)`,
        content_html: `<p>The standard Glasgow Coma Scale requires modification for preverbal children. Use the Pediatric GCS (modified) for children under 2 years and the standard GCS for older children.</p>
<table><thead><tr><th>Domain</th><th>Score</th><th>Child (>2 years)</th><th>Infant (<2 years) Modification</th></tr></thead><tbody><tr><td rowspan="4">Eye Opening (E)</td><td>4</td><td>Spontaneous</td><td>Spontaneous</td></tr><tr><td>3</td><td>To voice</td><td>To voice</td></tr><tr><td>2</td><td>To pain</td><td>To pain</td></tr><tr><td>1</td><td>None</td><td>None</td></tr><tr><td rowspan="5">Verbal Response (V)</td><td>5</td><td>Oriented, converses</td><td>Coos, babbles (age-appropriate)</td></tr><tr><td>4</td><td>Confused</td><td>Irritable cry, consolable</td></tr><tr><td>3</td><td>Inappropriate words</td><td>Cries persistently to pain</td></tr><tr><td>2</td><td>Incomprehensible sounds</td><td>Moans, grunts to pain</td></tr><tr><td>1</td><td>None</td><td>None</td></tr><tr><td rowspan="6">Motor Response (M)</td><td>6</td><td>Obeys commands</td><td>Normal spontaneous movements</td></tr><tr><td>5</td><td>Localizes pain</td><td>Withdraws to touch</td></tr><tr><td>4</td><td>Withdraws from pain</td><td>Withdraws from pain</td></tr><tr><td>3</td><td>Abnormal flexion (decorticate)</td><td>Abnormal flexion (decorticate)</td></tr><tr><td>2</td><td>Extension (decerebrate)</td><td>Extension (decerebrate)</td></tr><tr><td>1</td><td>None</td><td>None</td></tr></tbody></table>
<div class="alert alert-warning">CLINICAL PEARL GCS ≤8 = comatose and indicates the need for definitive airway management. Best motor response is the most prognostically significant component. Always document the best response observed in each domain and the total score.</div>`,
      },
      {
        id: 'App.F',
        heading: `Pediatric Sepsis Screening Tool`,
        content_html: `<p>Systematic screening for sepsis in the pediatric ED improves early recognition and reduces time to intervention. The following criteria form a practical screening tool applicable to the rural ED setting.</p>
<h4>Screening Criteria</h4>
<table><thead><tr><th>Parameter</th><th>Abnormal Threshold (Age-Adjusted)</th></tr></thead><tbody><tr><td>Temperature</td><td>>38.5°C (101.3°F) or <36°C (96.8°F)</td></tr><tr><td>Heart Rate</td><td>>2 SD above normal for age (use vital sign reference table)</td></tr><tr><td>Respiratory Rate</td><td>>2 SD above normal for age</td></tr><tr><td>Mental Status</td><td>Altered: irritability, lethargy, confusion, decreased responsiveness</td></tr><tr><td>Capillary Refill</td><td>>3 seconds (central) or flash cap refill (<1 second)</td></tr><tr><td>Blood Pressure</td><td>SBP <5th percentile for age</td></tr><tr><td>Lactate</td><td>>2 mmol/L (if available)</td></tr><tr><td>Urine Output</td><td><1 mL/kg/h (infants) or <0.5 mL/kg/h (children)</td></tr></tbody></table>
<div class="alert alert-danger">CRITICAL POINT Suspected or confirmed <strong>INFECTION + ≥2 screening criteria = ACTIVATE SEPSIS BUNDLE</strong>. Do not wait for laboratory confirmation. Time to first antibiotic is the single most modifiable prognostic factor. Target: antibiotics within 60 minutes of recognition (ideally within 30 minutes).</div>
<h4>Initial Sepsis Bundle (First 60 Minutes)</h4>
<ul><li>Establish IV/IO access</li><li>Obtain blood culture (do not delay antibiotics for cultures)</li><li>Administer broad-spectrum antibiotics (ceftriaxone 50–100 mg/kg IV, add vancomycin if MRSA concern)</li><li>20 mL/kg NS bolus — reassess after each bolus, repeat up to 60 mL/kg in first hour</li><li>Point-of-care glucose — treat hypoglycemia immediately</li><li>Obtain lactate, CBC, BMP, blood gas</li><li>If fluid-refractory shock: start vasoactive infusion (epinephrine 0.05–0.3 mcg/kg/min)</li></ul>`,
      },
      {
        id: 'App.G',
        heading: `Pediatric Pain Scales`,
        content_html: `<p>Accurate pain assessment in children requires age-appropriate tools. Use the following scales based on patient age and developmental level.</p>
<h4>NIPS — Neonatal Infant Pain Scale (0–1 year)</h4>
<table><thead><tr><th>Parameter</th><th>0 Points</th><th>1 Point</th><th>2 Points</th></tr></thead><tbody><tr><td>Facial Expression</td><td>Relaxed</td><td>Grimace</td><td>—</td></tr><tr><td>Cry</td><td>No cry</td><td>Whimper</td><td>Vigorous crying</td></tr><tr><td>Breathing Pattern</td><td>Relaxed</td><td>Change in breathing</td><td>—</td></tr><tr><td>Arms</td><td>Relaxed/restrained</td><td>Flexed/extended</td><td>—</td></tr><tr><td>Legs</td><td>Relaxed/restrained</td><td>Flexed/extended</td><td>—</td></tr><tr><td>State of Arousal</td><td>Sleeping/awake calm</td><td>Fussy</td><td>—</td></tr></tbody></table>
<p>Score ≥4 indicates significant pain requiring intervention.</p>
<h4>FLACC — Face, Legs, Activity, Cry, Consolability (2 months–7 years)</h4>
<table><thead><tr><th>Category</th><th>0</th><th>1</th><th>2</th></tr></thead><tbody><tr><td>Face</td><td>No expression or smile</td><td>Occasional grimace or frown</td><td>Frequent/constant quivering chin, clenched jaw</td></tr><tr><td>Legs</td><td>Normal position or relaxed</td><td>Uneasy, restless, tense</td><td>Kicking or legs drawn up</td></tr><tr><td>Activity</td><td>Lying quietly, normal position</td><td>Squirming, shifting, tense</td><td>Arched, rigid, or jerking</td></tr><tr><td>Cry</td><td>No cry (awake or asleep)</td><td>Moans or whimpers</td><td>Crying steadily, screams</td></tr><tr><td>Consolability</td><td>Content, relaxed</td><td>Reassured by occasional touching/talking</td><td>Difficult to console or comfort</td></tr></tbody></table>
<p>Score 0 = relaxed/comfortable; 1–3 = mild discomfort; 4–6 = moderate pain; 7–10 = severe pain.</p>
<h4>Wong-Baker FACES Scale (3–12 years)</h4>
<p>Show the child the six faces (from smiling to crying) and ask them to choose the face that best describes how they feel. Scores range from 0 (no hurt) to 10 (hurts worst). This is a self-report tool — the child must choose, not the parent or provider.</p>
<h4>Numeric Rating Scale — NRS (>8 years)</h4>
<p>Ask the patient to rate their pain from 0 to 10, where 0 is no pain and 10 is the worst pain imaginable. Validated for children 8 years and older who can understand the numeric concept.</p>
<div class="alert alert-warning">CLINICAL PEARL Pain is the "5th vital sign." Assess and document pain at triage, before and after interventions, and at discharge. Oligoanalgesia (undertreatment of pain) remains prevalent in pediatric emergency medicine. Treat pain early and reassess frequently.</div>`,
      },
      {
        id: 'App.H',
        heading: `Fluid and Electrolyte Reference`,
        content_html: `<h4>Maintenance Fluids — Holliday-Segar Method</h4>
<table><thead><tr><th>Weight</th><th>Fluid Rate</th></tr></thead><tbody><tr><td>First 10 kg</td><td>100 mL/kg/day (4 mL/kg/hr)</td></tr><tr><td>Next 10 kg (11–20 kg)</td><td>50 mL/kg/day (2 mL/kg/hr)</td></tr><tr><td>Each additional kg (>20 kg)</td><td>20 mL/kg/day (1 mL/kg/hr)</td></tr></tbody></table>
<p>Example: 25 kg child = (10 x 100) + (10 x 50) + (5 x 20) = 1,600 mL/day = 67 mL/hr</p>
<h4>Dehydration Assessment and Deficit Replacement</h4>
<table><thead><tr><th>Severity</th><th>Weight Loss (Infants / Children)</th><th>Clinical Features</th><th>Fluid Deficit</th></tr></thead><tbody><tr><td>Mild</td><td>5% / 3%</td><td>Slightly dry mucous membranes, mildly decreased UOP</td><td>50 mL/kg (infants) / 30 mL/kg (children)</td></tr><tr><td>Moderate</td><td>10% / 6%</td><td>Dry mucous membranes, sunken eyes/fontanelle, tachycardia, decreased skin turgor, oliguria</td><td>100 mL/kg (infants) / 60 mL/kg (children)</td></tr><tr><td>Severe</td><td>15% / 9%</td><td>All above + altered mental status, cool/mottled extremities, hypotension, anuria</td><td>150 mL/kg (infants) / 90 mL/kg (children)</td></tr></tbody></table>
<h4>Sodium Correction</h4>
<ul><li><strong>Hyponatremia correction rate:</strong> Do NOT exceed 8–10 mEq/L per 24 hours (risk of osmotic demyelination syndrome)</li><li><strong>Hypernatremia correction rate:</strong> Do NOT exceed 10–12 mEq/L per 24 hours (risk of cerebral edema)</li><li><strong>Symptomatic hyponatremia (seizures/altered mental status):</strong> 3% NaCl 2–5 mL/kg IV over 10–20 minutes, may repeat</li></ul>
<h4>Corrected Sodium in DKA</h4>
<p><strong>Corrected Na = Measured Na + 1.6 x [(Glucose − 100) / 100]</strong></p>
<p>A corrected sodium that is not rising during DKA treatment suggests excessive free water and increases cerebral edema risk.</p>
<h4>Glucose Infusion Rate (GIR)</h4>
<p><strong>GIR (mg/kg/min) = [Dextrose% x Rate (mL/hr)] / [Weight (kg) x 6]</strong></p>
<p>Target GIR: Neonates 4–8 mg/kg/min; Infants/children 3–5 mg/kg/min.</p>
<h4>Estimated Blood Volume by Age</h4>
<table><thead><tr><th>Age</th><th>Estimated Blood Volume (mL/kg)</th></tr></thead><tbody><tr><td>Premature neonate</td><td>90–100</td></tr><tr><td>Term neonate</td><td>80–90</td></tr><tr><td>Infant (3–12 months)</td><td>75–80</td></tr><tr><td>Child (1–12 years)</td><td>70–75</td></tr><tr><td>Adolescent/Adult</td><td>65–70</td></tr></tbody></table>
<h4>Expected Urine Output by Age</h4>
<table><thead><tr><th>Age</th><th>Normal Urine Output</th></tr></thead><tbody><tr><td>Neonate/Infant</td><td>1–2 mL/kg/hr</td></tr><tr><td>Child</td><td>1 mL/kg/hr</td></tr><tr><td>Adolescent</td><td>0.5–1 mL/kg/hr</td></tr></tbody></table>`,
      },
      {
        id: 'App.I',
        heading: `Common Pediatric Antibiotic Dosing`,
        content_html: `<p>The following table provides weight-based dosing for the most commonly used antibiotics in pediatric emergency medicine. Always verify doses and adjust for renal/hepatic function as appropriate.</p>
<table><thead><tr><th>Antibiotic</th><th>Dose</th><th>Frequency</th><th>Route</th><th>Max Dose</th><th>Common Indications</th></tr></thead><tbody><tr><td>Amoxicillin</td><td>40–90 mg/kg/day</td><td>BID-TID</td><td>PO</td><td>3 g/day</td><td>AOM, sinusitis, strep pharyngitis, pneumonia (outpatient)</td></tr><tr><td>Amoxicillin-clavulanate</td><td>45–90 mg/kg/day (amoxicillin component)</td><td>BID</td><td>PO</td><td>3 g/day (amox)</td><td>AOM (refractory), sinusitis, bite wounds, periorbital cellulitis</td></tr><tr><td>Cephalexin</td><td>25–50 mg/kg/day</td><td>BID-QID</td><td>PO</td><td>4 g/day</td><td>UTI (cystitis), skin/soft tissue infections (MSSA)</td></tr><tr><td>Cefdinir</td><td>14 mg/kg/day</td><td>QD-BID</td><td>PO</td><td>600 mg/day</td><td>AOM, sinusitis, step-down from IV cephalosporin</td></tr><tr><td>Ceftriaxone</td><td>50–100 mg/kg/day</td><td>QD-BID</td><td>IV/IM</td><td>4 g/day</td><td>Meningitis, sepsis, pyelonephritis, pneumonia (inpatient)</td></tr><tr><td>Clindamycin</td><td>30–40 mg/kg/day</td><td>TID-QID</td><td>PO/IV</td><td>1.8 g/day (PO), 4.8 g/day (IV)</td><td>MRSA infections, dental infections, necrotizing fasciitis (toxin suppression)</td></tr><tr><td>TMP-SMX</td><td>8–12 mg/kg/day (TMP component)</td><td>BID</td><td>PO</td><td>320 mg TMP/day</td><td>UTI, MRSA skin infections, PCP prophylaxis</td></tr><tr><td>Azithromycin</td><td>10 mg/kg day 1, then 5 mg/kg days 2–5</td><td>QD</td><td>PO</td><td>500 mg day 1, 250 mg days 2–5</td><td>Atypical pneumonia, pertussis, strep (PCN allergy)</td></tr><tr><td>Vancomycin</td><td>15 mg/kg/dose</td><td>Q6h</td><td>IV</td><td>1 g/dose (60 mg/kg/day)</td><td>MRSA sepsis/meningitis, severe SSTI, CNS infections</td></tr><tr><td>Piperacillin-tazobactam</td><td>100 mg/kg/dose (pip component)</td><td>Q6-8h</td><td>IV</td><td>4 g pip/dose</td><td>Intra-abdominal infections, necrotizing fasciitis, febrile neutropenia</td></tr><tr><td>Metronidazole</td><td>30 mg/kg/day</td><td>TID</td><td>PO/IV</td><td>1.5 g/day</td><td>C. difficile, anaerobic infections, intra-abdominal (adjunct)</td></tr><tr><td>Gentamicin</td><td>2.5 mg/kg/dose (traditional) or 5–7 mg/kg (extended interval)</td><td>Q8h (traditional) or Q24h (extended)</td><td>IV</td><td>Per levels</td><td>Neonatal sepsis (with ampicillin), UTI (with ampicillin), synergy</td></tr><tr><td>Acyclovir</td><td>20 mg/kg/dose (neonatal HSV) or 10 mg/kg/dose (encephalitis)</td><td>Q8h</td><td>IV</td><td>Per indication</td><td>Neonatal HSV, HSV encephalitis, severe varicella</td></tr></tbody></table>
<div class="alert alert-warning">CLINICAL PEARL Always calculate pediatric antibiotic doses by weight — never use adult doses empirically. Verify maximum doses. Check local antibiograms for resistance patterns (especially MRSA prevalence and E. coli resistance to TMP-SMX in UTI). When in doubt, consult pharmacy or pediatric infectious disease.</div>`,
      },
    ],
  },
  {
    id: 'ch25',
    number: '25',
    title: `Pediatric Respiratory Scoring Systems`,
    sections: [
      {
        id: 'ch25-intro',
        heading: 'Introduction and Clinical Rationale',
        content_html: `<p>Respiratory distress is the most common reason for pediatric ED visits and hospitalizations in children under five, accounting for 20-30% of all pediatric ED encounters. Scoring systems provide a structured, semi-objective framework for assessing respiratory severity, guiding therapy, facilitating provider communication, and enabling quality benchmarking.</p>
<div class="alert alert-warning"><strong>Key Principle</strong> Pediatric respiratory scoring systems are NOT interchangeable. Each was developed for a specific population, disease process, and clinical context. Using a score outside its validated domain can lead to misclassification and inappropriate management.</div>
<h4>Core Principles of Respiratory Scoring</h4>
<ul>
<li>Rely primarily on clinical observation — enabling rapid bedside assessment</li>
<li>Use ordinal scales (typically 0-3 per component) summed to a total score</li>
<li>Higher scores uniformly indicate greater severity</li>
<li>Assess combinations of: respiratory rate, work of breathing, air exchange, oxygenation, and mental status</li>
<li>Serial assessments over time are more valuable than a single score</li>
<li>Reliability depends on training, standardized definitions, and consistent application</li>
</ul>`,
      },
      {
        id: 'ch25-pram',
        heading: 'PRAM — Pediatric Respiratory Assessment Measure (Asthma)',
        content_html: `<p>Developed by Chalut et al. (2000) at Montreal Children's Hospital for children aged 2-17 years with acute asthma. The most widely validated asthma severity score internationally (ICC 0.92). Endorsed by the Canadian Paediatric Society.</p>
<table class="ref-table"><tr><th>Component</th><th>0</th><th>1</th><th>2</th><th>3</th></tr>
<tr><td>Scalene Muscle Contraction</td><td>Absent</td><td>Present</td><td>—</td><td>—</td></tr>
<tr><td>Suprasternal Retractions</td><td>Absent</td><td>Present</td><td>—</td><td>—</td></tr>
<tr><td>Wheezing</td><td>Absent</td><td>Expiratory only</td><td>Insp & exp</td><td>Audible/silent chest</td></tr>
<tr><td>Air Entry</td><td>Normal</td><td>Decreased at bases</td><td>Widespread decrease</td><td>Absent/minimal</td></tr>
<tr><td>SpO2 on Room Air</td><td>≥ 95%</td><td>92-94%</td><td>< 92%</td><td>—</td></tr></table>
<h4>Severity Classification (Score Range 0-12)</h4>
<table class="ref-table"><tr><th>Severity</th><th>Score</th><th>Management</th></tr>
<tr><td>Mild</td><td>0-3</td><td>Outpatient; discharge with rescue inhaler</td></tr>
<tr><td>Moderate</td><td>4-7</td><td>ED treatment; reassess after interventions</td></tr>
<tr><td>Severe</td><td>8-12</td><td>High risk admission; ICU; continuous neb; IV magnesium</td></tr></table>
<h4>Strengths</h4>
<ul><li>Includes SpO2 as objective component</li><li>Excludes RR (intentional — poor interrater reliability)</li><li>Superior responsiveness to change vs PIS</li></ul>
<h4>Limitations</h4>
<ul><li>Less reliable in infants/toddlers (scalene assessment difficult)</li><li>SpO2 confounded by supplemental O2, altitude</li><li>Designed for asthma only — not validated for bronchiolitis</li></ul>`,
      },
      {
        id: 'ch25-pis',
        heading: 'PIS — Pulmonary Index Score (Asthma)',
        content_html: `<p>Assesses acute asthma using four clinical variables including respiratory rate. Each scored 0-3, total range 0-12.</p>
<table class="ref-table"><tr><th>Component</th><th>0</th><th>1</th><th>2</th><th>3</th></tr>
<tr><td>RR (< 6 yr)</td><td>≤ 30</td><td>31-45</td><td>46-60</td><td>> 60</td></tr>
<tr><td>RR (≥ 6 yr)</td><td>≤ 20</td><td>21-35</td><td>36-50</td><td>> 50</td></tr>
<tr><td>Wheezing</td><td>None</td><td>End-expiratory</td><td>Entire expiration</td><td>Insp & exp / silent</td></tr>
<tr><td>I:E Ratio</td><td>2:1</td><td>1:1</td><td>1:2</td><td>1:3</td></tr>
<tr><td>Accessory Muscles</td><td>None</td><td>Mild (+)</td><td>Moderate (++)</td><td>Maximal (+++)</td></tr></table>
<p><strong>Severity:</strong> Mild 0-3 | Moderate 4-7 | Severe 8-12</p>
<div class="alert alert-info"><strong>Limitation</strong> The I:E ratio is the most criticized component — subjective, difficult to teach, and shows poor interrater reliability. Does not incorporate SpO2.</div>`,
      },
      {
        id: 'ch25-pass',
        heading: 'PASS — Pediatric Asthma Severity Score',
        content_html: `<p>Developed by Kelly et al. (2004). Simplified three-component score for improved interrater reliability (kappa 0.84). Each component scored 1-3, total range 3-9.</p>
<table class="ref-table"><tr><th>Component</th><th>1</th><th>2</th><th>3</th></tr>
<tr><td>Wheezing</td><td>None/mild end-exp</td><td>Exp throughout or biphasic</td><td>Insp & exp, diminished, or absent</td></tr>
<tr><td>Work of Breathing</td><td>Normal/mildly increased</td><td>Moderate: retractions, nasal flaring</td><td>Severe: marked retractions, head bobbing</td></tr>
<tr><td>Prolongation of Expiration</td><td>Normal/mildly prolonged</td><td>Moderately prolonged (1:2)</td><td>Markedly prolonged (≥ 1:3)</td></tr></table>
<p><strong>Severity:</strong> Mild 3-4 | Moderate 5-6 | Severe 7-9</p>
<p>Best used in combination with SpO2 monitoring and clinical judgment due to absence of objective measures.</p>`,
      },
      {
        id: 'ch25-mpis',
        heading: 'MPIS — Modified Pulmonary Index Score (Asthma)',
        content_html: `<p>Developed by Carroll et al. (2005) to address PIS limitations. Replaces I:E ratio with SpO2 and adds heart rate. Six components scored 0-3, total range 0-18. Improved interrater reliability (kappa 0.78-0.89).</p>
<table class="ref-table"><tr><th>Component</th><th>0</th><th>1</th><th>2</th><th>3</th></tr>
<tr><td>HR (< 3 yr)</td><td>≤ 120</td><td>121-140</td><td>141-160</td><td>> 160</td></tr>
<tr><td>HR (≥ 3 yr)</td><td>≤ 100</td><td>101-120</td><td>121-140</td><td>> 140</td></tr>
<tr><td>RR (< 6 yr)</td><td>≤ 30</td><td>31-45</td><td>46-60</td><td>> 60</td></tr>
<tr><td>RR (≥ 6 yr)</td><td>≤ 20</td><td>21-35</td><td>36-50</td><td>> 50</td></tr>
<tr><td>Wheezing</td><td>None</td><td>End-expiratory</td><td>Entire expiration</td><td>Insp & exp or silent</td></tr>
<tr><td>Accessory Muscles</td><td>None</td><td>+</td><td>++</td><td>+++</td></tr>
<tr><td>SpO2</td><td>≥ 96%</td><td>93-95%</td><td>90-92%</td><td>< 90%</td></tr></table>
<p><strong>Severity:</strong> Mild 0-5 | Moderate 6-11 | Severe 12-18</p>`,
      },
      {
        id: 'ch25-rdai',
        heading: 'RDAI — Respiratory Distress Assessment Instrument (Bronchiolitis)',
        content_html: `<p>Developed by Lowell et al. (1987) specifically for bronchiolitis in infants. The most widely used bronchiolitis-specific scoring tool in research. Assesses wheezing (0-8) and retractions (0-9), total 0-17.</p>
<h4>Wheezing Domain</h4>
<table class="ref-table"><tr><th>Parameter</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr>
<tr><td>Expiration</td><td>None</td><td>End only</td><td>1/2</td><td>3/4</td><td>All</td></tr>
<tr><td>Inspiration</td><td>None</td><td>Part</td><td>All</td><td>—</td><td>—</td></tr>
<tr><td>Location</td><td>≤ 2 fields</td><td>—</td><td>≥ 3 fields</td><td>—</td><td>—</td></tr></table>
<h4>Retractions Domain (each 0-3: None / Mild / Moderate / Severe)</h4>
<ul><li>Supraclavicular</li><li>Intercostal</li><li>Subcostal</li></ul>
<p><strong>Severity:</strong> Mild ≤ 4 | Moderate 5-8 | Severe ≥ 9</p>
<div class="alert alert-info"><strong>Note</strong> Does not incorporate SpO2, respiratory rate, or feeding ability — all clinically relevant in bronchiolitis disposition decisions. ICC 0.69-0.81.</div>`,
      },
      {
        id: 'ch25-tal',
        heading: 'Modified Tal Score — Wang Bronchiolitis Severity Score',
        content_html: `<p>A simpler bronchiolitis score incorporating respiratory rate, retractions, wheezing, and general condition. Each component 0-3, total 0-12.</p>
<table class="ref-table"><tr><th>Component</th><th>0</th><th>1</th><th>2</th><th>3</th></tr>
<tr><td>Respiratory Rate</td><td>< 40</td><td>40-55</td><td>56-70</td><td>> 70</td></tr>
<tr><td>Wheezing</td><td>None</td><td>End-exp only</td><td>Entire exp</td><td>Insp & exp</td></tr>
<tr><td>Retractions</td><td>None</td><td>Intercostal only</td><td>Tracheosternal</td><td>Severe + nasal flaring</td></tr>
<tr><td>General Condition</td><td>Normal</td><td>Irritable, poor feeding</td><td>Lethargic</td><td>Apneic/obtunded</td></tr></table>
<p><strong>Severity:</strong> Mild 0-4 | Moderate 5-8 | Severe 9-12</p>
<p>Primary advantage: includes general condition (feeding/alertness), critical for bronchiolitis disposition. Some institutions replace general condition with SpO2 for objectivity.</p>`,
      },
      {
        id: 'ch25-westley',
        heading: 'Westley Croup Score',
        content_html: `<p>The most widely used and best-validated croup severity score (Westley et al. 1978). Used in virtually all major croup treatment RCTs. Five variables with asymmetric weighting, total 0-17.</p>
<table class="ref-table"><tr><th>Component</th><th>0</th><th>1</th><th>2</th><th>3-5</th></tr>
<tr><td>Stridor</td><td>None</td><td>With agitation</td><td>At rest</td><td>—</td></tr>
<tr><td>Retractions</td><td>None</td><td>Mild</td><td>Moderate</td><td>Severe (3)</td></tr>
<tr><td>Air Entry</td><td>Normal</td><td>Decreased</td><td>Markedly decreased</td><td>—</td></tr>
<tr><td>Cyanosis</td><td>None (0)</td><td>—</td><td>—</td><td>Agitation (4) / Rest (5)</td></tr>
<tr><td>Consciousness</td><td>Normal (0)</td><td>—</td><td>—</td><td>Altered (5)</td></tr></table>
<h4>Severity and Management</h4>
<table class="ref-table"><tr><th>Severity</th><th>Score</th><th>Management</th></tr>
<tr><td>Mild</td><td>≤ 2</td><td>Dexamethasone 0.6 mg/kg PO; discharge with education</td></tr>
<tr><td>Moderate</td><td>3-7</td><td>Dexamethasone; consider neb epinephrine; observe 2-4 hr</td></tr>
<tr><td>Severe</td><td>8-11</td><td>Neb epinephrine; dexamethasone; admission; continuous monitoring</td></tr>
<tr><td>Impending Failure</td><td>≥ 12</td><td>ICU; intubation preparation; ENT/anesthesia</td></tr></table>
<div class="alert alert-warning"><strong>Key Feature</strong> Weighted scoring — cyanosis (4-5 pts) and altered consciousness (5 pts) alone can indicate severe disease, appropriately reflecting the gravity of these late findings.</div>`,
      },
      {
        id: 'ch25-silverman',
        heading: 'Silverman-Andersen Score (Neonatal)',
        content_html: `<p>One of the oldest respiratory assessment tools (1956). Assesses five components of respiratory mechanics in neonates, each scored 0-2, total 0-10. Requires no equipment — valuable in resource-limited settings.</p>
<table class="ref-table"><tr><th>Component</th><th>0 (None)</th><th>1 (Moderate)</th><th>2 (Severe)</th></tr>
<tr><td>Chest Movement</td><td>Synchronized</td><td>Lag on inspiration</td><td>See-saw (paradoxical)</td></tr>
<tr><td>Intercostal Retractions</td><td>None</td><td>Just visible</td><td>Marked</td></tr>
<tr><td>Xiphoid Retractions</td><td>None</td><td>Just visible</td><td>Marked</td></tr>
<tr><td>Nasal Flaring</td><td>None</td><td>Minimal</td><td>Marked</td></tr>
<tr><td>Expiratory Grunt</td><td>None</td><td>With stethoscope</td><td>Audible</td></tr></table>
<p><strong>Severity:</strong> Mild 1-3 | Moderate 4-6 | Severe 7-10</p>`,
      },
      {
        id: 'ch25-downes',
        heading: 'Downes Score (Neonatal)',
        content_html: `<p>Originally developed in 1970 for neonatal RDS. Five components each scored 0-2, total 0-10. Guides respiratory support escalation decisions.</p>
<table class="ref-table"><tr><th>Component</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>Respiratory Rate</td><td>< 60</td><td>60-80</td><td>> 80</td></tr>
<tr><td>Cyanosis / SpO2</td><td>None / > 95%</td><td>In room air / 90-95%</td><td>In O2 / < 90%</td></tr>
<tr><td>Retractions</td><td>None</td><td>Mild</td><td>Severe</td></tr>
<tr><td>Grunting</td><td>None</td><td>With stethoscope</td><td>Audible</td></tr>
<tr><td>Air Entry</td><td>Normal</td><td>Decreased</td><td>Barely audible</td></tr></table>
<h4>Management Guidance</h4>
<table class="ref-table"><tr><th>Score</th><th>Severity</th><th>Action</th></tr>
<tr><td>0-3</td><td>Mild</td><td>Observation, supplemental O2</td></tr>
<tr><td>4-6</td><td>Moderate</td><td>CPAP consideration</td></tr>
<tr><td>7-10</td><td>Severe</td><td>Mechanical ventilation</td></tr></table>
<div class="alert alert-info"><strong>Rural Application</strong> In rural Level II nurseries without immediate neonatology access, the Downes Score provides structured escalation guidance and a framework for communicating severity during transport arrangements.</div>`,
      },
      {
        id: 'ch25-pards',
        heading: 'PALICC-2 PARDS Criteria (2023)',
        content_html: `<p>The PALICC-2 (2023) guidelines define severity stratification for Pediatric Acute Respiratory Distress Syndrome using objective oxygenation indices rather than clinical observation scores.</p>
<h4>Required Criteria</h4>
<ul>
<li>Known clinical insult within 7 days</li>
<li>New infiltrate(s) on chest imaging (bilateral)</li>
<li>Not fully explained by cardiac disease or fluid overload</li>
<li>PEEP ≥ 5 cmH2O (or CPAP ≥ 5 for non-invasive stratification)</li>
</ul>
<h4>Oxygenation-Based Severity</h4>
<table class="ref-table"><tr><th>Severity</th><th>OI (Invasive)</th><th>OSI (Non-invasive)</th><th>P/F Ratio</th></tr>
<tr><td>Mild</td><td>4 ≤ OI < 8</td><td>5 ≤ OSI < 7.5</td><td>200-300</td></tr>
<tr><td>Moderate</td><td>8 ≤ OI < 16</td><td>7.5 ≤ OSI < 12.3</td><td>100-200</td></tr>
<tr><td>Severe</td><td>OI ≥ 16</td><td>OSI ≥ 12.3</td><td>< 100</td></tr></table>
<p><strong>OI</strong> = (FiO2 × MAP × 100) / PaO2</p>
<p><strong>OSI</strong> = (FiO2 × MAP × 100) / SpO2 (when SpO2 ≤ 97%)</p>
<div class="alert alert-info"><strong>Community Setting Value</strong> The OSI metric allows severity stratification using pulse oximetry when ABG is not readily available.</div>`,
      },
      {
        id: 'ch25-comparison',
        heading: 'Comparative Analysis and Selection Guide',
        content_html: `<h4>Summary Comparison</h4>
<table class="ref-table"><tr><th>Score</th><th>Disease</th><th>Age</th><th>Components</th><th>Range</th><th>SpO2</th><th>RR</th><th>Reliability</th></tr>
<tr><td>PRAM</td><td>Asthma</td><td>2-17 yr</td><td>5</td><td>0-12</td><td>Yes</td><td>No</td><td>ICC 0.92</td></tr>
<tr><td>PIS</td><td>Asthma</td><td>All peds</td><td>4</td><td>0-12</td><td>No</td><td>Yes</td><td>Variable</td></tr>
<tr><td>PASS</td><td>Asthma</td><td>1-18 yr</td><td>3</td><td>3-9</td><td>No</td><td>No</td><td>κ 0.84</td></tr>
<tr><td>MPIS</td><td>Asthma</td><td>All peds</td><td>6</td><td>0-18</td><td>Yes</td><td>Yes</td><td>κ 0.78-0.89</td></tr>
<tr><td>RDAI</td><td>Bronchiolitis</td><td>< 2 yr</td><td>6</td><td>0-17</td><td>No</td><td>No</td><td>ICC 0.69-0.81</td></tr>
<tr><td>Mod. Tal</td><td>Bronchiolitis</td><td>< 2 yr</td><td>4</td><td>0-12</td><td>Variable</td><td>Yes</td><td>Moderate</td></tr>
<tr><td>Westley</td><td>Croup</td><td>6 mo-6 yr</td><td>5</td><td>0-17</td><td>No</td><td>No</td><td>Mod-Good</td></tr>
<tr><td>Silverman</td><td>Neonatal RD</td><td>Neonates</td><td>5</td><td>0-10</td><td>No</td><td>No</td><td>Good</td></tr>
<tr><td>Downes</td><td>Neonatal RD</td><td>Neonates</td><td>5</td><td>0-10</td><td>No</td><td>Yes</td><td>Good</td></tr></table>
<h4>Rural/Community Hospital Recommendations</h4>
<ul>
<li><strong>Asthma:</strong> PRAM (best validated, includes SpO2)</li>
<li><strong>Bronchiolitis:</strong> Modified Tal Score (simpler, includes general condition)</li>
<li><strong>Croup:</strong> Westley Croup Score (standard of care for all major RCTs)</li>
<li><strong>Neonatal:</strong> Silverman-Andersen (no equipment) or Downes (guides escalation)</li>
</ul>
<div class="alert alert-danger"><strong>Critical Reminder</strong> Disease specificity matters. Asthma scores emphasize wheezing and air exchange; croup scores prioritize stridor and upper airway signs; bronchiolitis scores account for crackles over wheezing; neonatal scores focus on chest wall mechanics and grunting. Using a score outside its validated disease context leads to misleading severity classifications.</div>`,
      },
    ],
  },
];


export function getChapter(id) {
    return chapters.find(ch => ch.id === id) || null;
}

export function getTableOfContents() {
    return chapters.map(ch => ({
        id: ch.id,
        number: ch.number,
        title: ch.title,
        sectionCount: ch.sections.length,
    }));
}

export function searchTextbook(query) {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const ch of chapters) {
        for (const sec of ch.sections) {
            // Strip HTML tags for plain text search
            const plainText = sec.content_html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
            if (plainText.toLowerCase().includes(lowerQuery) ||
                sec.heading.toLowerCase().includes(lowerQuery)) {
                results.push({
                    chapterId: ch.id,
                    chapterNumber: ch.number,
                    chapterTitle: ch.title,
                    sectionId: sec.id,
                    sectionHeading: sec.heading,
                    plainText: plainText,
                });
            }
        }
    }
    return results;
}
