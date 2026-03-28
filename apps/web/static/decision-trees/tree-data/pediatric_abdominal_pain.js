// Clinical tree data — Pediatric Abdominal Pain Decision Tree
// Source: 
// Auto-extracted from pediatric_abdominal_pain_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric\nAbdominal Pain",icon:"🫄",type:"assessment",sub:"Appendicitis, intussusception, testicular/ovarian torsion",edge:"",
info:{tabs:["Age-Based Differential","Surgical vs Non-Surgical","Red Flags"],
t0:`<table class="dt"><thead><tr><th>Age</th><th>Common Surgical</th><th>Common Non-Surgical</th></tr></thead><tbody>
<tr><td><strong>0–2 yr</strong></td><td>Intussusception, incarcerated hernia, volvulus, Meckel</td><td>Colic, constipation, gastroenteritis, UTI, Henoch-Schönlein purpura</td></tr>
<tr><td><strong>2–5 yr</strong></td><td>Appendicitis (atypical presentation), intussusception</td><td>Constipation (#1), gastroenteritis, UTI, mesenteric lymphadenitis, pneumonia (referred pain)</td></tr>
<tr><td><strong>5–12 yr</strong></td><td>Appendicitis (#1 surgical), testicular/ovarian torsion</td><td>Constipation, gastroenteritis, functional abdominal pain, mesenteric lymphadenitis, UTI</td></tr>
<tr><td><strong>>12 yr</strong></td><td>Appendicitis, ovarian torsion, ectopic pregnancy</td><td>Constipation, gastroenteritis, mittelschmerz, ovarian cyst, PID, testicular torsion</td></tr>
</tbody></table>`,
t1:`<p><strong>Features suggesting surgical abdomen:</strong></p>
<ul><li>Bilious (green) vomiting — obstruction/volvulus</li>
<li>Localized peritoneal signs (rebound, guarding, rigidity)</li>
<li>RLQ pain with migration from periumbilical (classic appendicitis)</li>
<li>Non-reducible groin mass (incarcerated hernia)</li>
<li>Acute scrotal pain (testicular torsion — 6-hour window)</li>
<li>"Currant jelly" stools + colicky pain + vomiting (intussusception)</li>
<li>Distension with high-pitched bowel sounds (obstruction)</li></ul>`,
t2:`<div class="bx br">🚨 <strong>Don't-miss diagnoses:</strong></div>
<ul><li><strong>Appendicitis perforated:</strong> Diffuse peritonitis, high fever, toxic. Higher perforation rate in younger children (nearly 100% in &lt;3 yr because diagnosis is delayed).</li>
<li><strong>Testicular torsion:</strong> Acute onset, high-riding testis, absent cremasteric reflex. 6-hour window. Do NOT wait for US — if clinical suspicion is high → OR.</li>
<li><strong>Ovarian torsion:</strong> Sudden-onset unilateral pelvic/lower abdominal pain. US with Doppler (absent flow). Surgical detorsion (NOT oophorectomy — ovary often salvageable in peds).</li>
<li><strong>Ectopic pregnancy:</strong> ANY female of reproductive age with abdominal pain → urine hCG.</li></ul>`
},children:[
{name:"Appendicitis",icon:"🔴",type:"urgent",sub:"PAS score · US first · CT if US equivocal",edge:"RLQ pain\nmigration\nfever",
info:{tabs:["Pediatric Appendicitis Score","Imaging Algorithm","Management"],
t0:`<p><strong>Pediatric Appendicitis Score (PAS) — Samuel 2002:</strong></p>
<table class="rt"><thead><tr><th>Criteria</th><th>Points</th></tr></thead><tbody>
<tr><td>RLQ tenderness to cough/hop/percussion</td><td>2</td></tr>
<tr><td>Anorexia</td><td>1</td></tr>
<tr><td>Fever ≥38°C</td><td>1</td></tr>
<tr><td>Nausea/vomiting</td><td>1</td></tr>
<tr><td>RLQ tenderness</td><td>2</td></tr>
<tr><td>Migration of pain to RLQ</td><td>1</td></tr>
<tr><td>Leukocytosis >10,000</td><td>1</td></tr>
<tr><td>Left shift (PMN >7,500)</td><td>1</td></tr>
</tbody></table>
<p>PAS ≤3: low risk (~3%). PAS 4–6: equivocal → imaging. PAS ≥7: high risk (~78%) → surgical consult.</p>`,
t1:`<p><strong>Imaging approach (minimizing radiation):</strong></p>
<ol class="sl">
<li><strong>US abdomen (RLQ focused):</strong> First-line in pediatrics. Sensitivity 85–95% in experienced hands. Positive if: non-compressible, aperistaltic, &gt;6 mm diameter appendix, periappendiceal fluid/fat stranding.</li>
<li><strong>If US equivocal or non-visualized appendix + clinical concern persists:</strong> CT abdomen/pelvis WITH IV contrast (limited, low-dose protocol). OR repeat US in 6–12h with serial exams.</li>
<li><strong>MRI:</strong> Increasingly used (no radiation). Sensitivity/specificity comparable to CT. Limited by availability and need for cooperation/sedation in young children.</li>
</ol>
<div class="bx bg">✓ <strong>US-first strategy reduces CT use by 50–70%</strong> without missing appendicitis. Many pediatric institutions have achieved &lt;10% CT rates for appendicitis evaluation using US-first + serial exam protocols.</div>`,
t2:`<ul><li><strong>Non-perforated appendicitis:</strong> Appendectomy (laparoscopic preferred). Timing: within 24 hours. Antibiotics pre-op (cefoxitin or ceftriaxone + metronidazole).</li>
<li><strong>Non-operative management:</strong> Emerging evidence supports antibiotics alone for UNCOMPLICATED appendicitis (APPY randomized trial — non-inferiority to surgery with 30% failure rate at 1 year). NOT yet standard of care but increasingly discussed with families.</li>
<li><strong>Perforated with abscess:</strong> Interventional radiology drainage + IV antibiotics → interval appendectomy 6–8 weeks later. OR early appendectomy depending on institutional practice.</li>
<li><strong>Perforated with diffuse peritonitis:</strong> Emergent appendectomy + washout + IV antibiotics (pip-tazo or meropenem + fluconazole if fungal concern).</li></ul>`
}},
{name:"Intussusception",icon:"🌀",type:"emergency",sub:"3–36 months · Currant jelly · Air enema reduction",edge:"Colicky pain\n+ vomiting\n± bloody stool\n3mo–3yr",
info:{tabs:["Diagnosis","Air/Contrast Enema Reduction","Surgical Indications"],
t0:`<p><strong>Intussusception:</strong> Telescoping of proximal bowel into distal bowel. Ileocolic (95%) — ileum telescopes into cecum/colon. Peak age: 3–36 months (peak 5–9 months). Male > female 2:1.</p>
<p><strong>Classic triad (present in &lt;50%):</strong> Colicky intermittent abdominal pain + vomiting + "currant jelly" stools (blood + mucus). The child draws up legs with episodes of pain, then may appear well between episodes (initially).</p>
<p><strong>Diagnosis:</strong></p>
<ul><li><strong>US:</strong> "Target sign" (concentric rings on transverse view) / "pseudokidney sign" (longitudinal). Sensitivity &gt;98% in experienced hands. This is the FIRST-LINE imaging study.</li>
<li>AXR: may show paucity of gas in RLQ, soft tissue mass, small bowel obstruction pattern. Normal AXR does NOT exclude intussusception.</li></ul>`,
t1:`<p><strong>Air enema (pneumatic) reduction — first-line treatment:</strong></p>
<ul><li>Performed by radiologist under fluoroscopic guidance</li>
<li>Air insufflated into rectum via catheter. Pressure maintained at 80–120 mmHg. Goal: reflux of air into terminal ileum (confirms complete reduction).</li>
<li><strong>Success rate: 80–90%</strong> (higher if duration &lt;24h, no signs of perforation)</li>
<li><strong>Contraindications:</strong> Peritonitis, perforation (free air on AXR), hemodynamic instability, critically ill/septic child</li>
<li>Alternative: hydrostatic (saline or contrast) reduction under US guidance — increasingly used, no radiation</li>
<li>Post-reduction: observe 12–24h (recurrence rate 5–10% in first 24h; 10% overall)</li></ul>
<div class="bx bo">⚠️ <strong>Rule of 3's:</strong> Up to 3 attempts at reduction are reasonable if the intussusception is moving with each attempt (making progress). If no progress after 3 attempts → surgery.</div>`,
t2:`<ul><li>Failed enema reduction (3 attempts)</li>
<li>Perforation during reduction (rare, &lt;1%)</li>
<li>Peritonitis or hemodynamic instability on presentation</li>
<li>Pathologic lead point suspected (age &lt;3 months or >5 years, Meckel diverticulum, polyp, lymphoma — lead point found in ~10% of surgical cases)</li>
<li>Multiple recurrences (consider lead point resection)</li></ul>`
}},
{name:"Testicular /\nOvarian Torsion",icon:"⚠️",type:"emergency",sub:"6-hour window · Absent cremasteric reflex · Don't wait for US",edge:"Acute scrotal\nor pelvic pain",
info:{tabs:["Testicular Torsion","Ovarian Torsion"],
t0:`<p><strong>Testicular torsion:</strong> Twisting of the spermatic cord → venous then arterial occlusion → testicular ischemia. Bimodal peak: neonatal (extravaginal) and 12–18 years (intravaginal). SURGICAL EMERGENCY.</p>
<p><strong>Clinical diagnosis (do NOT delay for US if high suspicion):</strong></p>
<ul><li>Sudden onset severe unilateral scrotal pain (often awakens from sleep)</li>
<li>High-riding testis with horizontal lie ("bell-clapper deformity")</li>
<li><strong>Absent cremasteric reflex</strong> (most sensitive physical exam finding — 99% sensitivity)</li>
<li>Nausea/vomiting (30–50%)</li>
<li>NO relief with testicular elevation (negative Prehn sign — unreliable but classically taught)</li></ul>
<div class="bx br">🚨 <strong>Salvage rates by duration:</strong> &lt;6h = ~90–100% salvage. 6–12h = ~50%. 12–24h = ~20%. >24h = near 0%. Time is testicle. If clinical diagnosis is convincing → OR directly. Do NOT delay surgery waiting for a Doppler US that may take 1–2 hours to obtain.</div>
<p><strong>US with color Doppler:</strong> Absent or decreased flow to the affected testis. Sensitivity ~85–95%. Useful when diagnosis is uncertain (epididymitis, torsion of appendix testis). But a normal US does NOT exclude early torsion (flow may be transiently preserved).</p>`,
t1:`<p><strong>Ovarian torsion:</strong></p>
<ul><li>Peak age: 10–17 years (but can occur at any age, including neonatal)</li>
<li>Sudden-onset unilateral lower abdominal/pelvic pain + nausea/vomiting</li>
<li>Risk factors: ovarian cyst >5 cm, ovarian mass, prior torsion</li>
<li>US with Doppler: enlarged ovary + absent/decreased blood flow (but Doppler has limited sensitivity — ~60% — because dual blood supply means some flow may persist even with torsion)</li>
<li><strong>If clinical suspicion is high → surgical exploration even with normal Doppler</strong></li>
<li>Treatment: laparoscopic detorsion. DO NOT perform oophorectomy in pediatric patients — the ovary is usually salvageable even if it appears dusky/black (>90% recover function after detorsion). Cystectomy if mass present.</li></ul>
<div class="bx bg">✓ <strong>Ovarian salvage rates in pediatric torsion are much higher than historically believed.</strong> Even ovaries that appear necrotic at surgery usually recover. Oophorectomy should be avoided in children unless the ovary is clearly non-viable after detorsion and observation.</div>`
}}
]};
