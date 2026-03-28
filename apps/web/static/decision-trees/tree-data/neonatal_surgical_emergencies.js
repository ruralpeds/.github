// Clinical tree data — Neonatal Surgical Emergencies Decision Tree
// Source: 
// Auto-extracted from neonatal_surgical_emergencies_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal Surgical\nEmergency",icon:"🔪",type:"assessment",sub:"Acute surgical conditions in the newborn",edge:"",
info:{tabs:["STAB-Transport","Urgency Classification","Pre-Op Stabilization"],
t0:`<p><strong>STAB-Transport mnemonic</strong> for pre-transport stabilization of neonatal surgical emergencies:</p>
<ul><li><strong>S</strong> — Suction: OG/NG to continuous or intermittent suction (decompress stomach/bowel)</li>
<li><strong>T</strong> — Temperature: Maintain normothermia (plastic wrap for gastroschisis/omphalocele, warmer, hat)</li>
<li><strong>A</strong> — Access & Antibiotics: IV access (PIV ×2 or UVC), empiric broad-spectrum antibiotics, fluid resuscitation</li>
<li><strong>B</strong> — Breathing: Secure airway if needed (intubate for CDH — NO bag-mask), SpO₂ monitoring</li>
<li><strong>Transport</strong>: Arrange EMERGENT transfer to pediatric surgical center (Level III/IV NICU)</li></ul>`,
t1:`<table class="dt"><thead><tr><th>Urgency</th><th>Conditions</th><th>Timing</th></tr></thead><tbody>
<tr><td><strong>🔴 Immediate (&lt;2h)</strong></td><td>Volvulus, gastroschisis (exposed bowel), tension pneumothorax, ruptured omphalocele, tracheoesophageal fistula (aspiration), NEC perforation</td><td>Surgery or definitive procedure within hours</td></tr>
<tr><td><strong>🟠 Urgent (2–24h)</strong></td><td>CDH (after stabilization), bowel atresias (after decompression), incarcerated hernia, testicular torsion, imperforate anus (high)</td><td>Surgery within 24h after stabilization</td></tr>
<tr><td><strong>🟡 Semi-urgent (24–72h)</strong></td><td>Omphalocele (intact), pyloric stenosis (after correction of alkalosis), meconium ileus (medical management first)</td><td>Can be optimized before surgery</td></tr>
</tbody></table>`,
t2:`<p><strong>Universal pre-op stabilization for ALL neonatal surgical conditions:</strong></p>
<ol class="sl">
<li><strong>OG/NG tube to suction</strong> (Replogle tube for EA/TEF — double-lumen for continuous suction)</li>
<li><strong>IV access</strong> — PIV ×2 preferred; UVC if needed for emergent access</li>
<li><strong>Fluid resuscitation:</strong> NS or LR 10–20 mL/kg bolus PRN for perfusion. Maintenance D10W-based fluids.</li>
<li><strong>NPO</strong> — start IV fluids and TPN planning</li>
<li><strong>Broad-spectrum antibiotics:</strong> Ampicillin + gentamicin (for most); add metronidazole for bowel perforation/NEC</li>
<li><strong>Temperature control:</strong> Radiant warmer, hat, plastic wrap for exposed viscera</li>
<li><strong>Labs:</strong> CBC, BMP, blood gas, coags, T&S (anticipate transfusion)</li>
<li><strong>Imaging:</strong> AXR (±lateral decubitus), additional as needed (UGI, US, echo for associated anomalies)</li>
<li><strong>Parental communication:</strong> Explain condition, urgency, need for transfer</li>
</ol>`
},children:[
// ═══ ABDOMINAL WALL DEFECTS ═══
{name:"Gastroschisis /\nOmphalocele",icon:"🫁",type:"emergency",sub:"Exposed viscera · Bowel bag · 2–3× fluids",edge:"Abdominal wall\ndefect",
info:{tabs:["Gastroschisis vs Omphalocele","DR Management","Fluid Management","Associated Anomalies"],
t0:`<table class="dt"><thead><tr><th>Feature</th><th>Gastroschisis</th><th>Omphalocele</th></tr></thead><tbody>
<tr><td>Defect location</td><td>Right of umbilicus (paraumbilical)</td><td>Through umbilicus (midline)</td></tr>
<tr><td>Covering membrane</td><td><strong>NO</strong> (bowel exposed to amniotic fluid)</td><td><strong>YES</strong> (peritoneal sac — unless ruptured)</td></tr>
<tr><td>Contents</td><td>Small bowel (occasionally stomach, colon)</td><td>Bowel, liver, other organs possible</td></tr>
<tr><td>Associated anomalies</td><td>~10% (mostly intestinal atresia)</td><td>~50–70% (cardiac, Beckwith-Wiedemann, trisomy 13/18, pentalogy of Cantrell)</td></tr>
<tr><td>Bowel condition</td><td>Matted, edematous, shortened (chemical peritonitis from amniotic fluid)</td><td>Generally normal (protected by sac)</td></tr>
<tr><td>Incidence</td><td>~1/2,000–4,000 (increasing)</td><td>~1/5,000–10,000</td></tr>
</tbody></table>`,
t1:`<p><strong>Delivery Room Management:</strong></p>
<ol class="sl">
<li><strong>Bowel bag:</strong> Place exposed bowel into a sterile, pre-warmed bowel bag (or sterile saline-moistened gauze covered with plastic wrap). The bag extends from the chest to below the defect, keeping bowel moist and warm.</li>
<li><strong>Position:</strong> Right lateral decubitus (reduces mesenteric kinking). Support bowel to prevent vascular compromise.</li>
<li><strong>OG tube to suction</strong> — decompress stomach to reduce bowel distension</li>
<li><strong>Temperature control:</strong> Massive evaporative and radiant heat loss from exposed bowel. Plastic wrap, warm environment, hat.</li>
<li><strong>DO NOT attempt to reduce bowel into the abdomen</strong> — risk of vascular compromise, perforation, and abdominal compartment syndrome.</li>
</ol>`,
t2:`<div class="bx br">🚨 <strong>Gastroschisis requires 2–3× maintenance IV fluids</strong> due to massive third-space losses from exposed bowel. These infants are at HIGH risk for dehydration and hypovolemia. Fluid resuscitation is often the most critical aspect of initial management.</div>
<ul><li>Start at 150–200 mL/kg/day of D10W-based crystalloid</li>
<li>NS boluses 10–20 mL/kg PRN for signs of hypovolemia</li>
<li>Monitor UOP closely (target ≥1 mL/kg/hr)</li>
<li>Replace ongoing losses (weigh dressings if possible)</li>
<li>Omphalocele with intact sac: fluid losses much less; standard fluids adequate</li></ul>`,
t3:`<p><strong>Associated anomaly screening:</strong></p>
<table class="dt"><thead><tr><th>Defect</th><th>Screening</th></tr></thead><tbody>
<tr><td>Gastroschisis</td><td>Intestinal atresia (10% — found at surgery). Rarely associated with other anomalies. Routine echo/renal US not required unless indicated.</td></tr>
<tr><td>Omphalocele</td><td>Echocardiogram (cardiac defects in 20–50%). Karyotype (trisomy 13, 18). Renal US (urogenital anomalies). Glucose monitoring (Beckwith-Wiedemann hypoglycemia). Full physical exam for Pentalogy of Cantrell if midline upper omphalocele.</td></tr>
</tbody></table>`
}},
// ═══ EA/TEF ═══
{name:"Esophageal Atresia\n/ TEF",icon:"🔴",type:"emergency",sub:"Replogle tube · Head-up · VACTERL screen",edge:"Unable to\npass OG tube\nor drooling",
info:{tabs:["Types","Diagnosis","Stabilization","VACTERL"],
t0:`<p><strong>EA/TEF classification (Gross):</strong></p>
<table class="rt"><thead><tr><th>Type</th><th>Description</th><th>% of Cases</th></tr></thead><tbody>
<tr><td>A</td><td>Pure EA, no fistula</td><td>8%</td></tr>
<tr><td>B</td><td>EA with proximal TEF</td><td>1%</td></tr>
<tr><td><strong>C</strong></td><td><strong>EA with distal TEF</strong></td><td><strong>85%</strong></td></tr>
<tr><td>D</td><td>EA with proximal AND distal TEF</td><td>2%</td></tr>
<tr><td>E (H-type)</td><td>TEF without EA</td><td>4%</td></tr>
</tbody></table>`,
t1:`<ul><li><strong>Prenatal:</strong> Polyhydramnios (absent swallowing), absent stomach bubble on US</li>
<li><strong>Postnatal:</strong> Excessive drooling/secretions, choking/cyanosis with first feed, inability to pass OG/NG tube (coils in proximal pouch on X-ray)</li>
<li><strong>X-ray:</strong> OG tube coiled in upper pouch. Gas in stomach/bowel = distal TEF present (type C). Gasless abdomen = pure EA without distal fistula (type A).</li></ul>`,
t2:`<ol class="sl">
<li><strong>Replogle tube</strong> (10 Fr double-lumen sump) in proximal esophageal pouch to CONTINUOUS suction — prevents aspiration of pooled secretions</li>
<li><strong>Head-up position</strong> (30–45°) — reduces reflux of gastric acid through distal TEF into lungs</li>
<li><strong>NPO</strong> — nothing by mouth</li>
<li><strong>IV fluids</strong> — maintenance D10W</li>
<li><strong>Avoid positive-pressure ventilation if possible</strong> — air preferentially enters stomach through TEF → gastric distension → aspiration risk → respiratory compromise. If intubation needed, place ETT distal to fistula (may need bronchoscopy).</li>
<li><strong>Antibiotics</strong> if aspiration suspected</li>
</ol>
<div class="bx br">🚨 <strong>If the Replogle is not on continuous suction, secretions will pool and be aspirated.</strong> The Replogle tube is the single most important stabilization tool for EA/TEF. Ensure it is functioning at all times during transport and pre-op.</div>`,
t3:`<p><strong>VACTERL Association — screen for ALL components:</strong></p>
<table class="rt"><thead><tr><th>Letter</th><th>Anomaly</th><th>Screening</th><th>Incidence with EA</th></tr></thead><tbody>
<tr><td><strong>V</strong></td><td>Vertebral</td><td>Spine X-ray or US</td><td>~10%</td></tr>
<tr><td><strong>A</strong></td><td>Anorectal (imperforate anus)</td><td>Physical exam</td><td>~10%</td></tr>
<tr><td><strong>C</strong></td><td>Cardiac</td><td>Echocardiogram</td><td>~15–25%</td></tr>
<tr><td><strong>T</strong></td><td>Tracheoesophageal</td><td>This IS the presenting anomaly</td><td>100%</td></tr>
<tr><td><strong>E</strong></td><td>Esophageal atresia</td><td>This IS the presenting anomaly</td><td>100%</td></tr>
<tr><td><strong>R</strong></td><td>Renal</td><td>Renal US</td><td>~15%</td></tr>
<tr><td><strong>L</strong></td><td>Limb (radial ray)</td><td>Physical exam, hand/forearm X-ray</td><td>~10%</td></tr>
</tbody></table>
<div class="bx bb">ℹ️ <strong>≥3 VACTERL components = VACTERL association.</strong> Echo and renal US are mandatory before EA repair. Determine aortic arch side (right arch in 2.5% — affects surgical approach).</div>`
}},
// ═══ INTESTINAL ATRESIAS ═══
{name:"Intestinal\nAtresias",icon:"🔗",type:"urgent",sub:"Duodenal · Jejunoileal · Colonic · Double-bubble",edge:"Obstruction\npattern on\nAXR",
info:{tabs:["Types","Duodenal Atresia","Jejunoileal Atresia","Stabilization"],
t0:`<table class="dt"><thead><tr><th>Type</th><th>Location</th><th>X-ray</th><th>Associations</th></tr></thead><tbody>
<tr><td><strong>Duodenal atresia</strong></td><td>2nd part of duodenum (at ampulla of Vater)</td><td>Double bubble (dilated stomach + dilated proximal duodenum), NO distal gas</td><td>Trisomy 21 (30%), annular pancreas, cardiac anomalies, malrotation</td></tr>
<tr><td><strong>Jejunoileal atresia</strong></td><td>Jejunum or ileum</td><td>Multiple dilated loops with air-fluid levels; "triple bubble" if proximal jejunal</td><td>Often vascular accident in utero; associated with gastroschisis, CF</td></tr>
<tr><td><strong>Colonic atresia</strong></td><td>Rare; any segment</td><td>Massive proximal dilation</td><td>Associated with Hirschsprung, gastroschisis</td></tr>
</tbody></table>`,
t1:`<p><strong>Duodenal Atresia:</strong></p>
<ul><li><strong>Double bubble sign:</strong> Pathognomonic on AXR. Two gas-filled structures (stomach and dilated proximal duodenum) with NO gas distally.</li>
<li><strong>Prenatal:</strong> Polyhydramnios (50%), double bubble on prenatal US</li>
<li><strong>Bilious vomiting</strong> in first 24–48h (obstruction is distal to ampulla in 85%)</li>
<li><strong>Trisomy 21:</strong> Present in 30% — send karyotype/microarray. Also screen echo for cardiac anomalies.</li>
<li><strong>Surgery:</strong> Diamond-shaped duodenoduodenostomy (bypass; NOT resection — ampulla is at the obstruction site). Urgent but not emergent — stabilize first.</li></ul>`,
t2:`<p><strong>Jejunoileal Atresia:</strong></p>
<ul><li>Caused by in utero mesenteric vascular accident (not a failure of recanalization like duodenal atresia)</li>
<li>Types: I (membrane), II (fibrous cord), IIIa (mesenteric gap), IIIb (apple-peel/Christmas tree — high morbidity), IV (multiple atresias)</li>
<li>AXR: multiple dilated loops, air-fluid levels, absence of distal gas</li>
<li>Contrast enema: microcolon (unused colon) confirms distal obstruction</li>
<li>Surgery: resection of atretic segment with primary anastomosis. Apple-peel (IIIb) = high risk of short bowel syndrome.</li></ul>`,
t3:`<ol class="sl">
<li><strong>NPO + OG/NG to suction</strong> — decompress proximal bowel</li>
<li><strong>IV fluids:</strong> D10W maintenance + NS boluses PRN for dehydration</li>
<li><strong>Correct electrolyte losses</strong> (proximal obstruction → loss of HCl from vomiting → hypochloremic metabolic alkalosis)</li>
<li><strong>Antibiotics if concerned for perforation or sepsis</strong></li>
<li><strong>Associated anomaly screening:</strong> Karyotype (duodenal atresia + T21), echo, sweat chloride/CF screening (jejunoileal)</li>
</ol>`
}},
// ═══ PYLORIC STENOSIS ═══
{name:"Pyloric\nStenosis",icon:"🍼",type:"urgent",sub:"2–6 weeks · Projectile emesis · Correct alkalosis FIRST",edge:"Non-bilious\nprojectile\nemesis 2–6 wk",
info:{tabs:["Diagnosis","Metabolic Correction","Pyloromyotomy"],
t0:`<p><strong>Infantile Hypertrophic Pyloric Stenosis:</strong> Progressive hypertrophy of the pyloric muscle causing gastric outlet obstruction. Incidence: 1–3/1,000. Male:female 4:1. Firstborn males at highest risk.</p>
<ul><li><strong>Age of onset:</strong> 2–6 weeks (rarely presents in the first week)</li>
<li><strong>Classic presentation:</strong> Progressive, projectile, NON-BILIOUS emesis. Hungry after vomiting ("hungry vomiter"). Visible gastric peristaltic waves on exam. Palpable "olive" in RUQ/epigastrium (pathognomonic but found in only ~30%).</li>
<li><strong>Ultrasound diagnostic criteria:</strong> Pyloric muscle thickness ≥3 mm, pyloric channel length ≥15 mm</li>
<li><strong>UGI:</strong> "String sign" (elongated pyloric channel), "shoulder sign" (hypertrophied muscle indenting antrum)</li></ul>`,
t1:`<div class="bx br">🚨 <strong>Pyloric stenosis is a MEDICAL emergency before it is a surgical one.</strong> The hypochloremic, hypokalemic metabolic alkalosis MUST be corrected before anesthesia. Operating on an alkalotic infant risks life-threatening apnea during induction.</div>
<p><strong>Metabolic derangement:</strong> Loss of HCl from persistent vomiting → hypochloremic metabolic alkalosis with paradoxical aciduria (kidneys excrete H+ to retain K+ when both are low).</p>
<p><strong>Correction protocol:</strong></p>
<ol class="sl">
<li>IV NS + 20–40 mEq/L KCl (once voiding) at 1.5–2× maintenance</li>
<li>Check BMP every 4–6h until corrected</li>
<li><strong>Targets for surgery:</strong> CO₂ (bicarb) ≤30 mEq/L, Cl ≥100 mEq/L, K ≥3.5 mEq/L, pH ≤7.45</li>
<li>Correction typically takes 12–48 hours</li>
</ol>`,
t2:`<p><strong>Ramstedt Pyloromyotomy:</strong></p>
<ul><li>Definitive treatment. Longitudinal incision through the hypertrophied pyloric muscle down to (but NOT through) the submucosa.</li>
<li>Can be performed open (RUQ transverse incision) or laparoscopically</li>
<li><strong>Complication:</strong> Duodenal perforation (mucosal breach) — test with air insufflation intraoperatively. If recognized and repaired intraoperatively, outcomes are good.</li>
<li><strong>Post-op feeds:</strong> Ad lib feeding starting 4–6 hours post-op. Emesis in the first 24h is common and self-limited (edema at pyloromyotomy site). Do NOT delay feeds.</li>
<li>Discharge typically within 24 hours</li></ul>`
}},
// ═══ TESTICULAR TORSION ═══
{name:"Neonatal\nTesticular Torsion",icon:"⚠️",type:"emergency",sub:"Extravaginal · Often prenatal · 6-hour window",edge:"Firm, dark,\nnon-transillum\nscrotum",
info:{tabs:["Neonatal vs Older","Diagnosis","Management"],
t0:`<p><strong>Neonatal testicular torsion</strong> is almost always <strong>extravaginal</strong> (torsion of the entire spermatic cord and tunica vaginalis) — different from intravaginal torsion in older boys.</p>
<ul><li>Often occurs prenatally (70–80% present at birth with necrotic testis)</li>
<li>Bilateral in ~10–20% (catastrophic — risk of anorchia)</li>
<li>Prenatal torsion: firm, non-tender, dark/discolored, non-transilluminating scrotum at birth — usually unsalvageable</li>
<li>Postnatal torsion (20–30%): acute scrotal swelling, erythema, tenderness — potentially salvageable if &lt;6 hours</li></ul>`,
t1:`<ul><li>Clinical diagnosis (US may help but should NOT delay surgical exploration)</li>
<li>Doppler US: absent blood flow to affected testis. However, a normal-appearing US does NOT exclude early torsion.</li>
<li>Transillumination: negative (solid mass) vs hydrocele (positive)</li>
<li><strong>If postnatal onset with acute symptoms: surgical exploration is EMERGENT</strong> — do not delay for imaging</li></ul>`,
t2:`<p><strong>Surgical approach:</strong></p>
<ul><li><strong>Prenatal torsion (present at birth, necrotic):</strong> Debate exists. Many centers perform urgent exploration to: (1) confirm diagnosis, (2) perform orchiopexy of the contralateral testis to prevent bilateral loss. Timing controversial — some advocate immediate, others semi-urgent.</li>
<li><strong>Postnatal torsion (acute onset):</strong> EMERGENT scrotal exploration. Detorsion if viable → orchiopexy (fix testis to prevent recurrence). If necrotic → orchiectomy. ALWAYS fix the contralateral testis (pexy) at the same operation.</li></ul>
<div class="bx br">🚨 <strong>Bilateral neonatal testicular torsion</strong> (synchronous or asynchronous) is the most devastating scenario — results in anorchia. Contralateral orchiopexy at the time of exploration for unilateral torsion is essential to prevent bilateral loss.</div>`
}},
// ═══ INGUINAL HERNIA ═══
{name:"Inguinal\nHernia",icon:"🔵",type:"urgent",sub:"Incarceration risk · Repair before discharge",edge:"Groin\nswelling",
info:{tabs:["Neonatal Hernia","Incarceration","Timing of Repair"],
t0:`<p><strong>Indirect inguinal hernia in neonates:</strong> Patent processus vaginalis allowing bowel/omentum/ovary/fallopian tube to enter the inguinal canal. Incidence: 1–5% of term; up to 30% of VLBW. Male >> female. Right > left > bilateral.</p>
<ul><li>Presents as an intermittent or persistent bulge in the groin/scrotum (males) or labia (females)</li>
<li>Increases with crying, straining, Valsalva</li>
<li>Usually reducible with gentle pressure</li></ul>`,
t1:`<div class="bx br">🚨 <strong>Incarcerated hernia = SURGICAL EMERGENCY.</strong> Bowel trapped in the hernia sac → venous congestion → arterial compromise → strangulation → necrosis. Also risk of testicular ischemia from compression of spermatic cord vessels.</div>
<p><strong>Signs of incarceration:</strong> Irreducible bulge, tenderness, erythema of overlying skin, irritability, vomiting, abdominal distension.</p>
<p><strong>Management of incarceration:</strong></p>
<ol class="sl">
<li>Attempt gentle manual reduction (Trendelenburg position, gentle sustained pressure, ± sedation with small dose of morphine or midazolam)</li>
<li>If reduction successful: schedule repair within 24–48 hours (high recurrence risk)</li>
<li>If reduction fails: EMERGENT surgical exploration</li>
<li>Check for testicular viability (Doppler US if concern for ischemia)</li>
</ol>`,
t2:`<p><strong>Timing of repair:</strong></p>
<ul><li>Full-term with reducible hernia: repair within 2 weeks of diagnosis (or before NICU discharge)</li>
<li>Preterm in NICU: repair before discharge — many centers wait until infant approaches term GA to reduce anesthesia risk, but prolonged delay increases incarceration risk</li>
<li>History of incarceration: repair within 24–48h after successful reduction</li>
<li>Technique: open inguinal herniotomy (high ligation of processus vaginalis). Laparoscopic approach increasingly used.</li>
<li>Contralateral exploration: controversial. Some centers explore contralaterally in all infants &lt;1 year; others use laparoscopy to inspect the contralateral internal ring.</li></ul>`
}}
]};
