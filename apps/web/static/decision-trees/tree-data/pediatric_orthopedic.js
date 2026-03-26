// Clinical tree data — Pediatric Orthopedic Emergencies Decision Tree
// Source: 
// Auto-extracted from pediatric_orthopedic_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric\nOrthopedic\nEmergencies",icon:"🦴",type:"assessment",sub:"Fractures, Salter-Harris, compartment syndrome, limp",edge:"",
info:{tabs:["Approach","Pediatric Fracture Principles","When to Image"],
t0:`<p>Pediatric orthopedic emergencies differ from adult injuries due to open growth plates, thick periosteum (more buckle/greenstick fractures), and greater remodeling potential. The key urgent/emergent conditions are: open fractures, compartment syndrome, septic joints, Salter-Harris injuries involving the physis, and neurovascular compromise.</p>
<p><strong>Critical orthopedic emergencies (time-sensitive):</strong></p>
<ul><li>Compartment syndrome — 6-hour window to fasciotomy</li>
<li>Open fracture — OR washout within 6–24 hours + IV antibiotics immediately</li>
<li>Septic arthritis — joint aspiration + IV antibiotics urgently</li>
<li>Fracture with neurovascular compromise — emergent reduction</li>
<li>Spinal cord injury — immobilization + emergent imaging</li></ul>`,
t1:`<p><strong>Unique pediatric fracture features:</strong></p>
<ul><li><strong>Growth plate (physis):</strong> Weakest link in the pediatric skeleton — ligamentous injuries are rare in children; the physis fails first. Salter-Harris classification is essential.</li>
<li><strong>Periosteum:</strong> Thicker and more biologically active → buckle (torus), greenstick, and plastic deformation fractures that don't occur in adults</li>
<li><strong>Remodeling:</strong> Children's bones can remodel significant angulation (especially near the physis and in the plane of joint motion). Younger child = more remodeling potential.</li>
<li><strong>Healing:</strong> Faster than adults — cast duration is shorter. Neonates heal in 2–3 weeks; young children 3–4 weeks; adolescents approach adult healing times.</li></ul>`,
t2:`<p><strong>Ottawa Ankle/Knee Rules apply to children ≥6 years.</strong> Below age 6, clinical judgment is needed.</p>
<ul><li>Point tenderness over the physis = presumed Salter-Harris fracture even if X-ray is normal (SH-I is radiographically occult)</li>
<li>Comparison views of the contralateral extremity can help interpret unfamiliar pediatric anatomy</li>
<li>If clinical suspicion is high and X-ray negative: splint and follow up in 7–10 days for repeat films (periosteal reaction confirms fracture)</li></ul>`
},children:[
{name:"Salter-Harris\nClassification",icon:"📊",type:"decision",sub:"Growth plate fractures · SALTR mnemonic",edge:"Physis\ninvolvement",
info:{tabs:["SALTR Classification","Management by Type","Growth Arrest Risk"],
t0:`<p><strong>SALTR Mnemonic:</strong></p>
<table class="rt"><thead><tr><th>Type</th><th>Pattern</th><th>Description</th><th>Frequency</th></tr></thead><tbody>
<tr><td><strong>I — Slip</strong></td><td>Through physis only</td><td>Fracture through the growth plate with NO visible fracture line on X-ray. Diagnosed clinically (tender over physis). X-ray may show widened physis or be normal.</td><td>~5–6%</td></tr>
<tr><td><strong>II — Above</strong></td><td>Physis + metaphyseal fragment</td><td>Most common SH type. Fracture through physis with a triangular metaphyseal fragment (Thurston-Holland fragment). Usually good prognosis.</td><td>~75%</td></tr>
<tr><td><strong>III — Lower (beLow)</strong></td><td>Physis + epiphyseal fragment</td><td>Intra-articular fracture through the epiphysis and physis. Requires anatomic reduction (often surgical) because it involves the joint surface AND physis.</td><td>~10%</td></tr>
<tr><td><strong>IV — Through (Transverse)</strong></td><td>Metaphysis + physis + epiphysis</td><td>Fracture crosses all three zones. ALWAYS requires surgical fixation (ORIF) for anatomic alignment of the physis and joint surface.</td><td>~10%</td></tr>
<tr><td><strong>V — Rammed (cRush)</strong></td><td>Compression/crush of physis</td><td>Rare. Diagnosed RETROSPECTIVELY when growth arrest is detected. Initial X-rays often normal. Worst prognosis for growth disturbance.</td><td>&lt;1%</td></tr>
</tbody></table>`,
t1:`<table class="dt"><thead><tr><th>Type</th><th>Treatment</th><th>Follow-up</th></tr></thead><tbody>
<tr><td>I</td><td>Splint/cast. Weight-bearing as tolerated. Orthopedic follow-up.</td><td>2–3 weeks. Growth monitoring X-ray at 6–12 months.</td></tr>
<tr><td>II</td><td>Closed reduction if displaced + cast. Most heal well.</td><td>3–4 weeks cast. Growth X-ray at 6–12 months.</td></tr>
<tr><td>III</td><td>Anatomic reduction required. Often ORIF. Ortho urgent.</td><td>Surgical follow-up. Close growth plate monitoring.</td></tr>
<tr><td>IV</td><td>ORIF always. Must restore physis and articular surface.</td><td>Surgical follow-up. High risk growth arrest → serial X-rays.</td></tr>
<tr><td>V</td><td>Often missed initially. Retrospective diagnosis.</td><td>Growth arrest almost certain. MRI of physis. Ortho long-term.</td></tr>
</tbody></table>`,
t2:`<table class="rt"><thead><tr><th>Type</th><th>Growth Arrest Risk</th><th>Notes</th></tr></thead><tbody>
<tr><td>I</td><td>~1–2%</td><td>Very low risk if non-displaced</td></tr>
<tr><td>II</td><td>~1–5%</td><td>Low; higher if distal femur or distal tibia</td></tr>
<tr><td>III</td><td>~10–15%</td><td>Higher due to physis + epiphysis involvement</td></tr>
<tr><td>IV</td><td>~20–30%</td><td>High; bone bridge across physis disrupts growth</td></tr>
<tr><td>V</td><td>~100%</td><td>Nearly always causes growth arrest</td></tr>
</tbody></table>
<div class="bx bo">⚠️ <strong>Distal femoral and distal tibial physes</strong> have the HIGHEST growth arrest rates regardless of SH type. These injuries deserve especially close follow-up with serial growth-monitoring X-rays.</div>`
}},
{name:"Compartment\nSyndrome",icon:"🔴",type:"emergency",sub:"6 P's · Fasciotomy within 6 hours · Pain out of proportion",edge:"Severe pain\nafter fracture\nor crush",
info:{tabs:["Diagnosis (6 P's)","Management","Pediatric Considerations"],
t0:`<p><strong>The 6 P's (in order of appearance):</strong></p>
<ol class="sl">
<li><strong>Pain</strong> — out of proportion to injury. Worst with PASSIVE STRETCH of muscles in the affected compartment. This is the EARLIEST and most reliable sign.</li>
<li><strong>Pressure</strong> — compartment feels tense/firm to palpation</li>
<li><strong>Paresthesia</strong> — "pins and needles," numbness (nerve ischemia)</li>
<li><strong>Pallor</strong> — pale or dusky appearance of the extremity</li>
<li><strong>Paralysis</strong> — inability to move digits (LATE sign — muscle necrosis already occurring)</li>
<li><strong>Pulselessness</strong> — loss of distal pulse (VERY LATE — means vascular compromise; compartment syndrome is diagnosed long before this)</li>
</ol>
<div class="bx br">🚨 <strong>Do NOT wait for all 6 P's.</strong> Pain out of proportion + pain with passive stretch is sufficient to diagnose clinically. Pulselessness and paralysis are LATE findings — irreversible damage is already occurring. The window for fasciotomy is ~6 hours from onset.</div>`,
t1:`<ol class="sl">
<li><strong>Remove ALL constrictive dressings, casts, splints</strong> — immediately bivalve the cast and spread it. This alone may reduce compartment pressure.</li>
<li><strong>Keep extremity at heart level</strong> (NOT elevated — elevation reduces perfusion pressure to the compartment)</li>
<li><strong>Compartment pressure measurement:</strong> Stryker needle or arterial line setup. Absolute pressure >30 mmHg or within 30 mmHg of diastolic BP (delta pressure &lt;30) = fasciotomy indication.</li>
<li><strong>EMERGENT fasciotomy</strong> — surgical decompression of ALL affected compartments. 4-compartment fasciotomy for leg (anterior, lateral, deep posterior, superficial posterior). 2-incision technique.</li>
<li><strong>Leave wounds OPEN</strong> — delayed primary closure or skin grafting in 3–7 days</li>
</ol>`,
t2:`<p><strong>Pediatric-specific considerations:</strong></p>
<ul><li>Children are LESS able to communicate pain — a crying, inconsolable child after a forearm or tibial fracture who is not improving with appropriate analgesia = suspect compartment syndrome</li>
<li><strong>Increasing analgesic requirements</strong> after a fracture is a RED FLAG</li>
<li>Supracondylar humerus fractures are the #1 fracture associated with compartment syndrome in children (forearm compartment syndrome from brachial artery injury)</li>
<li>Tibial shaft fractures are the #2 most common cause</li>
<li>Cast-related: a tight cast can cause compartment syndrome — if pain is worsening in a new cast, REMOVE THE CAST</li></ul>
<div class="bx bo">⚠️ <strong>The 3 A's of increasing concern in a child with a casted fracture:</strong> Increasing Analgesic requirements, Increasing Anxiety/agitation, Increasing ANgst from caregivers who say "something is wrong." Trust these signals.</div>`
}},
{name:"The Limping\nChild",icon:"🚶",type:"decision",sub:"Age-based differential · Kocher criteria · Imaging algorithm",edge:"Non-traumatic\nlimp or\nrefusal to\nbear weight",
info:{tabs:["Age-Based Differential","Kocher Criteria (Septic vs Transient)","Workup Algorithm"],
t0:`<p><strong>Differential by age:</strong></p>
<table class="dt"><thead><tr><th>Age</th><th>Most Common Causes</th></tr></thead><tbody>
<tr><td><strong>1–3 years</strong></td><td>Toddler's fracture (spiral tibial), septic arthritis, transient synovitis, osteomyelitis, child abuse (occult fracture), reactive arthritis</td></tr>
<tr><td><strong>4–10 years</strong></td><td>Transient synovitis (#1), septic arthritis, Legg-Calvé-Perthes disease (avascular necrosis of femoral head), osteomyelitis, JIA</td></tr>
<tr><td><strong>11–16 years</strong></td><td>SCFE (slipped capital femoral epiphysis), Osgood-Schlatter, osteochondritis dissecans, stress fracture, osteomyelitis, malignancy (leukemia, Ewing, osteosarcoma)</td></tr>
</tbody></table>
<div class="bx br">🚨 <strong>SCFE is an ORTHOPEDIC EMERGENCY.</strong> Obese/overweight adolescent with hip or knee pain (referred) + limited internal rotation of the hip = SCFE until proven otherwise. Frog-leg lateral X-ray of BOTH hips. NO weight bearing until orthopedic evaluation. Surgical pinning in situ.</div>`,
t1:`<p><strong>Kocher Criteria — Differentiating septic arthritis from transient synovitis of the hip:</strong></p>
<table class="rt"><thead><tr><th>Criteria</th><th>Points for Each</th></tr></thead><tbody>
<tr><td>Fever (>38.5°C / 101.3°F)</td><td>1</td></tr>
<tr><td>Non-weight-bearing</td><td>1</td></tr>
<tr><td>ESR >40 mm/hr</td><td>1</td></tr>
<tr><td>WBC >12,000/µL</td><td>1</td></tr>
</tbody></table>
<p><strong>Predicted probability of septic arthritis:</strong></p>
<table class="rt"><thead><tr><th>Kocher Score</th><th>Probability</th><th>Action</th></tr></thead><tbody>
<tr><td>0</td><td>&lt;0.2%</td><td>Observe; likely transient synovitis</td></tr>
<tr><td>1</td><td>3%</td><td>Observe with close follow-up</td></tr>
<tr><td>2</td><td>40%</td><td>Joint aspiration recommended</td></tr>
<tr><td>3</td><td>93%</td><td>Joint aspiration + presumptive treatment</td></tr>
<tr><td>4</td><td>99%</td><td>OR for I&D + IV antibiotics</td></tr>
</tbody></table>
<p><em>CRP >2.0 mg/dL has been proposed as a 5th criterion (Caird et al.), further improving discrimination.</em></p>`,
t2:`<ol class="sl">
<li><strong>X-rays</strong> of the affected area (AP + lateral; frog-leg lateral for hip)</li>
<li><strong>Labs:</strong> CBC, ESR, CRP. If Kocher score ≥2: joint aspiration (US-guided)</li>
<li><strong>Joint aspirate analysis:</strong> WBC >50,000 with >75% PMNs = septic until proven otherwise. Gram stain and culture. Crystal analysis (rare in peds).</li>
<li><strong>Ultrasound:</strong> Effusion present? (Sensitive for hip effusion but cannot distinguish septic from transient synovitis)</li>
<li><strong>MRI:</strong> Best for osteomyelitis, Perthes (early AVN), SCFE (if subtle), soft tissue abscess, bone marrow pathology (leukemia)</li>
<li><strong>Bone scan:</strong> If multifocal disease suspected (osteomyelitis with multiple sites)</li>
</ol>
<div class="bx bb">ℹ️ <strong>Transient synovitis of the hip</strong> is the MOST common cause of acute atraumatic limp in children age 3–10. Self-limited viral inflammation. NSAIDs + rest → resolves in 1–2 weeks. Key distinction from septic arthritis: afebrile or low-grade fever, not toxic-appearing, WBC/ESR/CRP normal or mildly elevated, can still bear some weight.</div>`
}},
{name:"Supracondylar\nHumerus Fracture",icon:"💪",type:"urgent",sub:"#1 pediatric elbow fracture · Gartland · Neurovasc check",edge:"Fall on\noutstretched\nhand + elbow",
info:{tabs:["Gartland Classification","Neurovascular Exam","Management"],
t0:`<p><strong>Supracondylar humerus fracture:</strong> Most common elbow fracture in children (60%). Peak age 5–7 years. FOOSH (fall on outstretched hand) mechanism. Extension type (98%) — distal fragment displaces posteriorly.</p>
<table class="rt"><thead><tr><th>Gartland Type</th><th>Description</th><th>Treatment</th></tr></thead><tbody>
<tr><td><strong>I</strong></td><td>Non-displaced. Posterior fat pad sign on lateral X-ray.</td><td>Long-arm cast/posterior splint × 3 weeks. Ortho follow-up.</td></tr>
<tr><td><strong>II</strong></td><td>Displaced with intact posterior cortex (hinged).</td><td>Closed reduction + casting (some) or percutaneous pinning (displaced IIA/IIB). Ortho.</td></tr>
<tr><td><strong>III</strong></td><td>Completely displaced, no cortical contact.</td><td>ORIF (closed reduction + percutaneous pinning under fluoro). Ortho EMERGENT.</td></tr>
</tbody></table>`,
t1:`<p><strong>Neurovascular exam is CRITICAL — document BEFORE and AFTER any reduction or splinting:</strong></p>
<table class="dt"><thead><tr><th>Nerve</th><th>Motor Test</th><th>Sensory Test</th></tr></thead><tbody>
<tr><td><strong>Anterior interosseous nerve (AIN)</strong></td><td>"OK sign" — thumb-to-index tip pinch (DIP flexion of thumb + index)</td><td>No sensory component</td></tr>
<tr><td><strong>Median nerve</strong></td><td>Thumb opposition</td><td>Palmar tip of index finger</td></tr>
<tr><td><strong>Radial nerve</strong></td><td>Wrist/finger extension ("thumbs up")</td><td>Dorsal first web space</td></tr>
<tr><td><strong>Ulnar nerve</strong></td><td>Finger abduction ("spread fingers apart")</td><td>Palmar tip of little finger</td></tr>
</tbody></table>
<p><strong>Vascular:</strong> Radial pulse (check capillary refill if weak pulse). If pulse absent after reduction → emergent vascular surgery consult. Check for forearm compartment syndrome (most feared complication).</p>
<div class="bx br">🚨 <strong>AIN injury is the most commonly injured nerve</strong> in extension-type supracondylar fractures. If the child cannot make an "OK sign" → document and inform orthopedics, but most AIN injuries recover spontaneously.</div>`,
t2:`<ul><li><strong>Type I:</strong> Posterior long-arm splint, elbow at 60–90° flexion (do NOT hyperflect — compromises vascular flow). Ortho follow-up in 5–7 days. Cast for 3 weeks total.</li>
<li><strong>Type II:</strong> Attempt closed reduction in ED if mildly displaced. Posterior splint. Many require percutaneous pinning within 24h.</li>
<li><strong>Type III:</strong> Emergent orthopedic consult. Splint in position of comfort. NPO (likely going to OR). Closed reduction + percutaneous pinning under fluoroscopy.</li>
<li><strong>Volkmann ischemic contracture:</strong> Devastating complication from missed forearm compartment syndrome → irreversible flexion contracture of forearm muscles. This is why neurovascular checks are paramount.</li></ul>`
}}
]};
