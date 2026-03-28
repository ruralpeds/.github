// Clinical tree data — Pediatric Respiratory Emergencies Decision Tree
// Source: 
// Auto-extracted from pediatric_respiratory_emergencies_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric\nRespiratory\nEmergencies",icon:"🫁",type:"assessment",sub:"Croup, bronchiolitis, asthma, foreign body, epiglottitis",edge:"",
info:{tabs:["Approach","Severity Assessment","Red Flags"],
t0:`<p>Respiratory complaints are the #1 reason for pediatric ED visits. Key is rapid assessment of severity and identifying the anatomical level of obstruction (upper vs lower airway) to guide treatment.</p>
<ul><li><strong>Upper airway (extrathoracic):</strong> Stridor (inspiratory), barking cough, hoarse voice → croup, epiglottitis, foreign body, angioedema</li>
<li><strong>Lower airway (intrathoracic):</strong> Wheezing (expiratory), prolonged expiration, air trapping → bronchiolitis, asthma, foreign body</li>
<li><strong>Parenchymal:</strong> Crackles, grunting, hypoxemia → pneumonia, ARDS</li></ul>`,
t1:`<table class="dt"><thead><tr><th>Severity</th><th>Signs</th><th>SpO₂</th><th>Disposition</th></tr></thead><tbody>
<tr><td><strong>Mild</strong></td><td>No retractions at rest; normal feeding; playful</td><td>>94%</td><td>Likely home with precautions</td></tr>
<tr><td><strong>Moderate</strong></td><td>Retractions at rest; some feeding difficulty; intermittent agitation</td><td>90–94%</td><td>ED observation; may need admission</td></tr>
<tr><td><strong>Severe</strong></td><td>Severe retractions, nasal flaring, grunting; unable to feed; exhaustion/lethargy</td><td>&lt;90%</td><td>Admission; consider ICU</td></tr>
<tr><td><strong>Impending failure</strong></td><td>Minimal air movement, cyanosis, bradycardia, altered mental status, silent chest</td><td>&lt;85%</td><td>🔴 IMMEDIATE intervention</td></tr>
</tbody></table>`,
t2:`<div class="bx br">🚨 <strong>Red flags requiring immediate intervention:</strong></div>
<ul><li>Altered mental status (lethargy, unresponsiveness)</li>
<li>Drooling + tripod positioning + toxic appearance (epiglottitis)</li>
<li>Complete inability to speak or cry</li>
<li>Cyanosis unresponsive to O₂</li>
<li>Bradycardia (ominous — indicates respiratory failure/impending arrest)</li>
<li>Silent chest in an asthmatic (no air movement = no wheezing)</li></ul>`
},children:[
{name:"Croup",icon:"🗣️",type:"decision",sub:"Viral laryngotracheitis · Barking cough · Dexamethasone",edge:"Stridor +\nbarking cough\nage 6mo–6yr",
info:{tabs:["Westley Score","Treatment","When to Worry"],
t0:`<p><strong>Westley Croup Score:</strong></p>
<table class="rt"><thead><tr><th>Feature</th><th>0</th><th>1</th><th>2</th><th>3–5</th></tr></thead><tbody>
<tr><td>Stridor</td><td>None</td><td>With agitation</td><td>At rest</td><td>—</td></tr>
<tr><td>Retractions</td><td>None</td><td>Mild</td><td>Moderate</td><td>Severe</td></tr>
<tr><td>Air entry</td><td>Normal</td><td>Decreased</td><td>Markedly decreased</td><td>—</td></tr>
<tr><td>Cyanosis</td><td>None</td><td>—</td><td>—</td><td>With agitation(4) / at rest(5)</td></tr>
<tr><td>Consciousness</td><td>Normal</td><td>—</td><td>—</td><td>—(5 = disoriented)</td></tr>
</tbody></table>
<p>Mild ≤2, Moderate 3–7, Severe ≥8</p>`,
t1:`<table class="rt"><thead><tr><th>Severity</th><th>Treatment</th></tr></thead><tbody>
<tr><td><strong>All croup (mild-severe)</strong></td><td><strong>Dexamethasone 0.6 mg/kg PO/IM × 1 dose</strong> (max 10 mg). Single dose. Reduces return visits, intubation, and admission. Works within 2–4h, lasts 48–72h.</td></tr>
<tr><td><strong>Moderate-severe</strong></td><td>+ <strong>Nebulized racemic epinephrine</strong> 0.5 mL of 2.25% in 3 mL NS. Observe 2–4h for rebound (stridor returns as epi wears off).</td></tr>
<tr><td><strong>Severe/impending failure</strong></td><td>+ Heliox (70:30 helium:oxygen) if available. Repeat nebulized epi. Prepare for intubation (use ETT 0.5–1 size smaller than predicted).</td></tr>
</tbody></table>
<div class="bx bg">✓ <strong>Dexamethasone 0.6 mg/kg PO × 1 dose for ALL croup</strong> — even mild. NNT=5 to prevent return to ED. Oral is preferred over IM (less painful, equally effective). Can mix with flavored syrup.</div>`,
t2:`<p><strong>Consider alternative diagnoses when:</strong></p>
<ul><li>Age &lt;6 months or >6 years (atypical age for croup)</li>
<li>No viral prodrome (sudden onset stridor → foreign body, angioedema)</li>
<li>High fever + toxic appearance + drooling (epiglottitis/bacterial tracheitis)</li>
<li>Recurrent croup (≥3 episodes → consider subglottic stenosis, hemangioma, tracheomalacia — ENT referral)</li>
<li>Not responding to standard treatment</li></ul>`
}},
{name:"Bronchiolitis",icon:"🫁",type:"action",sub:"RSV · <2 years · Supportive care · NICE/AAP guidelines",edge:"Wheezing +\nRSV season\n< 2 years",
info:{tabs:["Diagnosis","Evidence-Based Management","Admission Criteria"],
t0:`<p><strong>Bronchiolitis:</strong> Viral lower respiratory tract infection in children &lt;2 years. RSV is #1 cause (~70%). Peak season: November–March. Most common cause of hospitalization in infants &lt;1 year.</p>
<p><strong>Clinical diagnosis</strong> — no routine testing needed in typical presentation. RSV testing does NOT change management in most cases (testing mainly useful for cohorting in inpatient setting).</p>`,
t1:`<p><strong>AAP 2014 + 2023 Update — What WORKS and what DOESN'T:</strong></p>
<table class="dt"><thead><tr><th>Intervention</th><th>Recommendation</th><th>Evidence</th></tr></thead><tbody>
<tr><td><strong>Nasal suctioning</strong></td><td>✅ YES — first-line</td><td>Clears secretions; improves feeding and breathing</td></tr>
<tr><td><strong>Supplemental O₂</strong></td><td>✅ If SpO₂ &lt;90% persistently</td><td>Target ≥90%. Do NOT treat transient desaturations. Continuous pulse ox may increase LOS without benefit.</td></tr>
<tr><td><strong>IV/NG fluids</strong></td><td>✅ If unable to maintain hydration orally</td><td>Small frequent feeds; NG if needed</td></tr>
<tr><td><strong>HFNC</strong></td><td>✅ For moderate-severe (growing evidence)</td><td>May reduce intubation; PARIS trial showed reduced escalation to ICU</td></tr>
<tr><td><strong>Albuterol/bronchodilators</strong></td><td>❌ NOT recommended routinely</td><td>No consistent benefit. AAP recommends against routine use. A single monitored trial may be reasonable.</td></tr>
<tr><td><strong>Epinephrine (nebulized)</strong></td><td>❌ NOT recommended</td><td>No benefit for inpatient. May reduce admission from ED (controversial).</td></tr>
<tr><td><strong>Corticosteroids</strong></td><td>❌ NOT recommended</td><td>No benefit. Multiple large RCTs (Corneli et al., NEJM 2007). Do not give dexamethasone for bronchiolitis.</td></tr>
<tr><td><strong>Hypertonic saline (3%)</strong></td><td>❌ NOT recommended (inpatient); ⚠️ possible ED benefit</td><td>Does NOT reduce LOS for inpatients. May reduce admission from ED (modest evidence).</td></tr>
<tr><td><strong>Antibiotics</strong></td><td>❌ NOT unless concurrent bacterial infection</td><td>Viral illness; antibiotics do not help and promote resistance.</td></tr>
<tr><td><strong>CXR</strong></td><td>❌ NOT routinely</td><td>Leads to unnecessary antibiotic use. Obtain only if diagnostic uncertainty or suspected complication.</td></tr>
</tbody></table>
<div class="bx bg">✓ <strong>Bronchiolitis management is SUPPORTIVE:</strong> suctioning, supplemental O₂ if needed, hydration. The #1 evidence-based message: do LESS, not more.</div>`,
t2:`<p><strong>Admit when:</strong></p>
<ul><li>Persistent SpO₂ &lt;90% on room air</li>
<li>Moderate-severe respiratory distress not improving with suctioning</li>
<li>Inability to maintain oral hydration (dehydration risk)</li>
<li>Apnea (especially &lt;2 months or former preterm)</li>
<li>Age &lt;4 weeks (higher risk of severe disease)</li>
<li>Toxic appearance, high fever with concern for concurrent bacterial infection</li>
<li>Inadequate home observation capacity</li></ul>
<p><strong>Palivizumab (Synagis) prophylaxis:</strong> For eligible high-risk infants per AAP — preterm &lt;29 wk (&lt;1 year at start of RSV season), hemodynamically significant CHD, CLD of prematurity. Monthly IM injections during RSV season.</p>
<p><strong>Nirsevimab (Beyfortus):</strong> Long-acting monoclonal antibody; single dose for ALL infants &lt;8 months entering first RSV season (FDA approved 2023). Also for 8–19 month high-risk entering second season.</p>`
}},
{name:"Asthma\nExacerbation",icon:"💨",type:"urgent",sub:"Albuterol + ipratropium + systemic steroids",edge:"Wheezing +\nhx asthma\nor >2 years",
info:{tabs:["Severity Classification","ED Treatment Protocol","Disposition"],
t0:`<table class="rt"><thead><tr><th>Severity</th><th>Signs</th><th>PEF (if obtainable)</th><th>SpO₂</th></tr></thead><tbody>
<tr><td><strong>Mild</strong></td><td>Speaks in sentences, no retractions, end-expiratory wheeze</td><td>>70% predicted</td><td>>94%</td></tr>
<tr><td><strong>Moderate</strong></td><td>Speaks in phrases, moderate retractions, diffuse wheeze</td><td>40–70%</td><td>90–94%</td></tr>
<tr><td><strong>Severe</strong></td><td>Speaks in words, severe retractions, accessory muscles, agitation</td><td>&lt;40%</td><td>&lt;90%</td></tr>
<tr><td><strong>Life-threatening</strong></td><td>Unable to speak, exhaustion, silent chest, altered consciousness, bradycardia</td><td>Not obtainable</td><td>&lt;85%</td></tr>
</tbody></table>`,
t1:`<ol class="sl">
<li><strong>Albuterol nebulized:</strong> 2.5 mg (0.5 mL of 0.5%) for &lt;20 kg; 5 mg for >20 kg. Repeat q20 min × 3 (or continuous neb 10–15 mg/hr for severe).</li>
<li><strong>Ipratropium bromide:</strong> 0.5 mg nebulized with first 3 albuterol treatments (reduces admission in moderate-severe). No benefit after 3 doses.</li>
<li><strong>Systemic corticosteroid:</strong> Dexamethasone 0.6 mg/kg PO/IM × 1 (max 16 mg) — 1-dose dex is non-inferior to 5-day prednisolone and has better compliance. OR Prednisolone 1–2 mg/kg/day × 3–5 days.</li>
<li><strong>Magnesium sulfate:</strong> 25–75 mg/kg IV over 20 min (max 2g) for SEVERE not responding to above. Smooth muscle relaxant.</li>
<li><strong>Epinephrine IM:</strong> 0.01 mg/kg (1:1000) for impending respiratory failure (buys time while preparing intubation).</li>
<li><strong>Terbutaline:</strong> 10 µg/kg IV bolus then 0.1–10 µg/kg/min infusion for ICU-level refractory status asthmaticus.</li>
</ol>
<div class="bx br">🚨 <strong>Intubation in status asthmaticus is HIGH RISK.</strong> Bag ventilation is difficult (bronchospasm + air trapping). Ketamine 1–2 mg/kg IV is the preferred induction agent (bronchodilator properties). Use slow rates with long expiratory times post-intubation.</div>`,
t2:`<ul><li><strong>Discharge if:</strong> Sustained improvement after 1–3 hours, SpO₂ >94% RA, no/mild retractions, tolerating PO. Send with: albuterol MDI/neb + spacer, steroid course (or single-dose dex already given), asthma action plan, PCP follow-up in 3–5 days.</li>
<li><strong>Admit if:</strong> Persistent distress after 3 albuterol treatments, SpO₂ &lt;92% on RA, poor air exchange, prior severe exacerbation/ICU admission, unable to use inhaler at home.</li>
<li><strong>ICU if:</strong> Requiring continuous neb or IV bronchodilators, MgSO₄, altered mental status, impending respiratory failure.</li></ul>`
}},
{name:"Foreign Body\nAspiration",icon:"🔴",type:"emergency",sub:"Sudden choking · Unilateral wheeze · Rigid bronch",edge:"Sudden onset\nchoking or\nunilateral\nfindings",
info:{tabs:["Recognition","BLS Management","Imaging & Bronchoscopy"],
t0:`<p><strong>Foreign body aspiration:</strong> Peak age 1–3 years. Most common objects: peanuts, grapes, hot dogs, coins, small toy parts. Can lodge in larynx (complete obstruction → life-threatening), trachea, or bronchus (right > left due to anatomy).</p>
<ul><li><strong>Acute presentation:</strong> Sudden choking/gagging episode followed by cough, stridor (laryngeal), or unilateral wheeze (bronchial)</li>
<li><strong>Delayed presentation:</strong> Recurrent pneumonia in same lobe, persistent unilateral wheeze not responding to bronchodilators, chronic cough</li></ul>`,
t1:`<p><strong>Complete obstruction (unable to cough, cry, or breathe):</strong></p>
<table class="dt"><thead><tr><th>Age</th><th>Maneuver</th></tr></thead><tbody>
<tr><td><strong>Infant (&lt;1 year)</strong></td><td>5 back blows (heel of hand between scapulae, head down) alternating with 5 chest thrusts (2-finger technique, same location as CPR). NO abdominal thrusts (Heimlich) in infants.</td></tr>
<tr><td><strong>Child (>1 year)</strong></td><td>Abdominal thrusts (Heimlich maneuver): stand behind, fist above umbilicus, quick upward thrusts. Repeat until object expelled or child becomes unresponsive.</td></tr>
<tr><td><strong>If unresponsive</strong></td><td>Begin CPR. Before each ventilation attempt: look in mouth — if object visible, remove it. Do NOT perform blind finger sweeps.</td></tr>
</tbody></table>`,
t2:`<p><strong>Partial obstruction (able to cough/breathe):</strong></p>
<ul><li>Encourage coughing — the child's cough is more effective than any maneuver</li>
<li>Do NOT perform back blows or Heimlich on a child who can cough effectively</li>
<li>Monitor for deterioration to complete obstruction</li></ul>
<p><strong>Imaging:</strong></p>
<ul><li>CXR (inspiratory + expiratory or bilateral decubitus in young children): look for unilateral hyperinflation (air trapping), atelectasis, or visible radiopaque FB</li>
<li>Most aspirated food particles are RADIOLUCENT (not visible on X-ray). Normal CXR does NOT exclude FB aspiration.</li></ul>
<p><strong>Rigid bronchoscopy:</strong> Gold standard for diagnosis AND treatment. Performed under general anesthesia. Indicated when clinical suspicion is high regardless of CXR findings.</p>`
}},
{name:"Epiglottitis /\nBacterial Tracheitis",icon:"🔴",type:"emergency",sub:"Toxic + drooling + tripod · Do NOT examine throat",edge:"Toxic +\ndrooling +\nstridor",
info:{tabs:["Epiglottitis","Bacterial Tracheitis"],
t0:`<p><strong>Epiglottitis:</strong> Now rare due to Hib vaccine but still occurs (non-typeable H. flu, S. aureus, Strep). Can occur at any age. LIFE-THREATENING.</p>
<ul><li><strong>Classic presentation:</strong> Rapid onset (hours), high fever, toxic appearance, drooling (unable to swallow secretions), muffled "hot potato" voice, tripod positioning (leaning forward, neck extended), inspiratory stridor</li>
<li><strong>4 D's:</strong> Drooling, Dysphagia, Dysphonia, Distress</li></ul>
<div class="bx br">🚨 <strong>Do NOT examine the throat. Do NOT lay the child down. Do NOT agitate the child.</strong> Any of these can precipitate complete airway obstruction. Keep the child calm and upright. Call anesthesia/ENT for controlled airway management in the OR.</div>
<p><strong>Management:</strong></p>
<ol class="sl">
<li>Keep child calm and in position of comfort (usually sitting upright in parent's lap)</li>
<li>Supplemental humidified O₂ (blow-by, do NOT force mask)</li>
<li>Call anesthesia + ENT + pediatric ICU</li>
<li>Transport to OR for controlled intubation (inhalational induction preferred)</li>
<li>Have tracheostomy set available as backup</li>
<li>After airway secured: blood culture + IV antibiotics (ceftriaxone 50 mg/kg + vancomycin if MRSA concern)</li>
<li>Lateral neck X-ray (if time allows and child is stable): "thumbprint sign" (swollen epiglottis). But do NOT delay airway management for imaging.</li>
</ol>`,
t1:`<p><strong>Bacterial tracheitis (membranous croup):</strong></p>
<ul><li>Bacterial superinfection of the trachea, often following viral croup</li>
<li>S. aureus is the most common pathogen (including MRSA)</li>
<li>Presentation: child with croup-like illness that suddenly worsens — high fever, toxic appearance, copious thick purulent secretions, NOT responding to standard croup treatment</li>
<li>Differentiating from croup: more toxic, higher fever, purulent secretions, does not respond to racemic epinephrine</li>
<li>Management: intubation (often needed for thick secretions occluding airway), aggressive suctioning, IV antibiotics (vancomycin + ceftriaxone), PICU admission</li></ul>`
}}
]};
