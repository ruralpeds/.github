// Clinical tree data — Neonatal Ophthalmology Decision Tree
// Source: 
// Auto-extracted from neonatal_ophthalmology_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal\nOphthalmology",icon:"👁️",type:"assessment",sub:"ROP screening, red reflex, congenital cataracts, NLDO",edge:"",
info:{tabs:["Newborn Eye Exam","Red Reflex Screening","When to Refer"],
t0:`<p>The newborn eye exam is part of every standard newborn assessment. Key components: red reflex (Brückner test), pupillary response, gross structural inspection (lids, cornea size, globe symmetry), and assessment for tearing/discharge.</p>
<p><strong>Critical findings requiring urgent referral:</strong></p>
<ul><li>Absent or white (leukocoria) red reflex — retinoblastoma until proven otherwise</li>
<li>Congenital glaucoma triad: epiphora + photophobia + blepharospasm + enlarged cornea (buphthalmos)</li>
<li>Congenital cataract — surgical removal within 6–10 weeks for unilateral to prevent deprivation amblyopia</li>
<li>Proptosis, periorbital mass, or lid abnormality</li></ul>`,
t1:`<p><strong>Red Reflex Test (Brückner Test) — AAP Universal Screening:</strong></p>
<ul><li>Perform on ALL newborns before discharge, and at all well-child visits in the first year</li>
<li>Darkened room. Direct ophthalmoscope set to "0" diopters. Hold ~18 inches from infant's face. Observe bilateral red reflexes simultaneously.</li>
<li><strong>Normal:</strong> Symmetric, orange-red glow in both eyes simultaneously</li>
<li><strong>Abnormal:</strong> Absent reflex, white reflex (leukocoria), asymmetric reflexes, dark spots within the reflex</li></ul>
<div class="bx br">🚨 <strong>LEUKOCORIA (white pupillary reflex) = retinoblastoma until proven otherwise.</strong> Urgent ophthalmology referral within 24–48 hours. Other causes: congenital cataract, persistent fetal vasculature, Coats disease, ROP (advanced), toxocariasis. All require urgent evaluation.</div>`,
t2:`<p><strong>Urgent ophthalmology referral indications:</strong></p>
<ul><li>Abnormal red reflex (absent, white, asymmetric)</li>
<li>Cloudy/enlarged cornea (congenital glaucoma — buphthalmos)</li>
<li>Congenital ptosis covering visual axis (deprivation amblyopia risk)</li>
<li>Structural anomalies (microphthalmia, anophthalmia, coloboma)</li>
<li>Congenital Horner syndrome (ptosis + miosis → r/o neuroblastoma with chest/abd imaging)</li>
<li>Tearing + purulent discharge in first 24h (gonococcal ophthalmia — NOT NLDO, which presents later)</li></ul>`
},children:[
{name:"ROP Screening\n& Management",icon:"🔬",type:"urgent",sub:"<31 wk or <1500g · Type 1 = treat · ETROP/BEAT-ROP",edge:"Preterm\nNICU infant",
info:{tabs:["Screening Criteria","Classification","Treatment"],
t0:`<p><strong>ROP Screening Criteria (AAP/AAO/AAPOS 2018):</strong></p>
<ul><li>Birth weight ≤1500g, OR</li>
<li>Gestational age ≤30 weeks, OR</li>
<li>Selected infants 1500–2000g with unstable clinical course (per neonatologist)</li></ul>
<p><strong>Timing of first exam:</strong></p>
<table class="rt"><thead><tr><th>Gestational Age at Birth</th><th>First Exam at Postmenstrual Age</th><th>First Exam (Chronologic Age)</th></tr></thead><tbody>
<tr><td>22 weeks</td><td>31 weeks PMA</td><td>9 weeks</td></tr>
<tr><td>23–24 weeks</td><td>31 weeks PMA</td><td>7–8 weeks</td></tr>
<tr><td>25–28 weeks</td><td>31–33 weeks PMA</td><td>4–6 weeks</td></tr>
<tr><td>29–30 weeks</td><td>33–34 weeks PMA</td><td>4 weeks</td></tr>
</tbody></table>
<p><em>Whichever is LATER: the PMA age or chronologic age.</em></p>`,
t1:`<p><strong>International Classification of ROP (ICROP3):</strong></p>
<ul><li><strong>Zone:</strong> I (most posterior/severe) → II → III (most anterior/mild)</li>
<li><strong>Stage:</strong> 1 (demarcation line) → 2 (ridge) → 3 (ridge + extraretinal fibrovascular proliferation) → 4 (partial retinal detachment: 4A without fovea, 4B with fovea) → 5 (total retinal detachment)</li>
<li><strong>Plus disease:</strong> Dilation and tortuosity of posterior retinal vessels = indicates aggressive disease. "Pre-plus" is an intermediate category.</li>
<li><strong>Aggressive ROP (A-ROP):</strong> Rapidly progressive, posterior disease with prominent plus. Formerly "AP-ROP." Requires IMMEDIATE treatment.</li></ul>
<p><strong>Type 1 ROP (TREAT):</strong></p>
<ul><li>Zone I, any stage with plus</li>
<li>Zone I, stage 3 (with or without plus)</li>
<li>Zone II, stage 2 or 3 with plus</li></ul>
<p><strong>Type 2 ROP (OBSERVE):</strong></p>
<ul><li>Zone I, stage 1 or 2 without plus</li>
<li>Zone II, stage 3 without plus</li></ul>`,
t2:`<p><strong>Treatment options for Type 1 ROP:</strong></p>
<table class="dt"><thead><tr><th>Treatment</th><th>Mechanism</th><th>Evidence</th></tr></thead><tbody>
<tr><td><strong>Laser photocoagulation</strong></td><td>Ablates avascular retina → reduces VEGF production → stops neovascularization</td><td>ETROP trial (2003): early treatment of Type 1 ROP improved structural/visual outcomes vs observation. Gold standard for decades.</td></tr>
<tr><td><strong>Intravitreal anti-VEGF (bevacizumab)</strong></td><td>Binds VEGF → rapid regression of neovascularization</td><td>BEAT-ROP trial (2011): bevacizumab superior to laser for Zone I disease. RAINBOW trial (2019): ranibizumab showed promise. Increasingly used for Zone I/posterior Zone II disease.</td></tr>
</tbody></table>
<p><strong>Anti-VEGF considerations:</strong></p>
<ul><li>Faster treatment (single injection vs hours of laser)</li>
<li>Allows continued vascularization of peripheral retina (laser destroys it permanently)</li>
<li>BUT: requires prolonged follow-up (late recurrence in 10–20% at 8–16 weeks)</li>
<li>Systemic VEGF suppression concern (theoretical impact on developing organs) — long-term safety data still accumulating</li></ul>
<div class="bx bg">✓ <strong>SpO₂ targets 90–95% in preterm infants</strong> to reduce ROP risk. BOOST-II/COT/SUPPORT trials showed that higher SpO₂ targets (91–95%) increased ROP. Avoid sustained SpO₂ >95%.</div>`
}},
{name:"Congenital\nCataracts",icon:"🔵",type:"urgent",sub:"Leukocoria · Surgery <10 wk (unilateral) · Amblyopia risk",edge:"White reflex\nor opacity\nin lens",
info:{tabs:["Causes","Urgency","Management"],
t0:`<p><strong>Congenital cataracts:</strong> Opacity of the lens present at birth or developing in infancy. Incidence: ~3/10,000 live births. Bilateral in ~65%.</p>
<p><strong>Causes:</strong></p>
<table class="dt"><thead><tr><th>Category</th><th>Examples</th><th>% of Cases</th></tr></thead><tbody>
<tr><td><strong>Idiopathic</strong></td><td>No identifiable cause</td><td>~60%</td></tr>
<tr><td><strong>Hereditary</strong></td><td>Autosomal dominant most common (family history in 25%)</td><td>~25%</td></tr>
<tr><td><strong>Metabolic</strong></td><td>Galactosemia (oil droplet cataract — STOP lactose immediately), hypocalcemia, Lowe syndrome</td><td>~5%</td></tr>
<tr><td><strong>Infectious</strong></td><td>Congenital rubella (#1 infectious cause), CMV, toxoplasmosis, HSV, varicella</td><td>~5%</td></tr>
<tr><td><strong>Chromosomal</strong></td><td>Trisomy 21 (15% have cataracts), trisomy 13, Turner syndrome</td><td>~5%</td></tr>
</tbody></table>`,
t1:`<div class="bx br">🚨 <strong>TIMING IS CRITICAL for congenital cataracts.</strong> The visual system develops rapidly in early infancy. Dense cataracts blocking the visual axis cause deprivation amblyopia — irreversible if not treated early.</div>
<ul><li><strong>Unilateral dense cataract:</strong> Surgery by 6–10 weeks of life (some centers say 4–6 weeks) for best visual outcome</li>
<li><strong>Bilateral dense cataracts:</strong> Surgery by 8–10 weeks (slightly more flexibility than unilateral)</li>
<li><strong>Partial/small cataracts not blocking visual axis:</strong> May be observed with serial exams</li>
<li>After cataract removal: contact lens or IOL (intraocular lens) for optical correction + aggressive amblyopia patching therapy</li></ul>`,
t2:`<p><strong>Workup for bilateral congenital cataracts:</strong></p>
<ol class="sl">
<li>Ophthalmology referral URGENTLY</li>
<li>TORCH screen (rubella IgM, CMV urine PCR, toxoplasma IgM)</li>
<li>Galactosemia screen (urine reducing substances, GALT enzyme, newborn screen)</li>
<li>Calcium, phosphorus (hypocalcemia)</li>
<li>Urinalysis (amino acids — Lowe syndrome)</li>
<li>Karyotype if dysmorphic features</li>
<li>Family history and parental eye exam (hereditary cataracts)</li>
</ol>`
}},
{name:"Nasolacrimal Duct\nObstruction",icon:"💧",type:"action",sub:"NLDO · 90% resolve by 12 months · Massage · Probing if persistent",edge:"Tearing +\nmattering\nwithout\ninjection",
info:{tabs:["Diagnosis","Conservative Management","Probing"],
t0:`<p><strong>Congenital NLDO:</strong> Blocked nasolacrimal duct (failure of canalization of the valve of Hasner at the distal end). Most common cause of tearing in infants. Incidence: 5–20% of newborns. Usually unilateral (may be bilateral).</p>
<p><strong>Presentation:</strong> Excessive tearing (epiphora), mucoid/mucopurulent discharge collecting in the inner canthus ("mattering"), crusting of lashes — WITHOUT conjunctival injection. Symptoms often begin at 2–4 weeks of age (when tear production increases).</p>
<p><strong>Distinguish from:</strong></p>
<ul><li>Conjunctivitis (injection + purulent discharge + conjunctival erythema)</li>
<li>Congenital glaucoma (tearing + photophobia + enlarged cornea + blepharospasm)</li>
<li>Gonococcal ophthalmia neonatorum (profuse purulent discharge in first 1–5 days — EMERGENCY)</li></ul>`,
t1:`<p><strong>Conservative management (effective in ~90% by 12 months):</strong></p>
<ul><li><strong>Crigler massage:</strong> Place finger over the lacrimal sac (medial canthus area) and stroke firmly downward toward the nose. This increases hydrostatic pressure in the duct and may open the membranous obstruction at the valve of Hasner. Perform 2–3 times daily.</li>
<li><strong>Warm compresses</strong> and gentle cleaning of discharge from lashes</li>
<li><strong>Topical antibiotics</strong> (erythromycin or polymyxin B/trimethoprim drops) ONLY for episodes of acute dacryocystitis (erythema, swelling, tenderness over the lacrimal sac) — NOT for routine NLDO discharge</li>
<li>Reassurance: ~90% resolve spontaneously by 12 months with massage alone</li></ul>`,
t2:`<p><strong>Probing (if not resolved by 12 months):</strong></p>
<ul><li>Nasolacrimal duct probing under general anesthesia (or office probing in select centers)</li>
<li>Thin probe passed through the punctum → canaliculus → lacrimal sac → nasolacrimal duct → punctures through the membranous obstruction into the nose</li>
<li>Success rate: ~90% with single probing</li>
<li>If probing fails: repeat probing with silicone intubation (stent left in place 2–3 months) or balloon dacryoplasty</li>
<li>Dacryocystorhinostomy (DCR): surgical bypass, reserved for failed probing/intubation or bony obstruction</li></ul>`
}},
{name:"Ophthalmia\nNeonatorum",icon:"🔴",type:"emergency",sub:"Gonococcal = emergency · Chlamydial = systemic Abx",edge:"Purulent eye\ndischarge\nfirst 30 days",
info:{tabs:["Etiology by Timing","Gonococcal Emergency","Chlamydial Treatment"],
t0:`<table class="dt"><thead><tr><th>Timing</th><th>Organism</th><th>Features</th><th>Treatment</th></tr></thead><tbody>
<tr><td>Day 1</td><td>Chemical (silver nitrate)</td><td>Mild; self-limited. Rare now (erythromycin ointment used instead).</td><td>None; resolves 24–48h</td></tr>
<tr><td>Day 1–5</td><td><strong>N. gonorrhoeae</strong></td><td>PROFUSE purulent discharge, lid swelling, can perforate cornea in hours</td><td>🔴 EMERGENCY (see next tab)</td></tr>
<tr><td>Day 5–14</td><td><strong>C. trachomatis</strong></td><td>Mucopurulent discharge, lid swelling, may be mild initially</td><td>Systemic erythromycin</td></tr>
<tr><td>Day 1–14</td><td>Other bacteria (S. aureus, Strep, E. coli)</td><td>Variable purulence</td><td>Topical antibiotics; systemic if severe</td></tr>
<tr><td>Day 6–14</td><td>HSV</td><td>Vesicles on lids, serosanguinous discharge, dendritic keratitis</td><td>IV acyclovir (systemic HSV) + topical trifluridine</td></tr>
</tbody></table>`,
t1:`<div class="bx br">🚨 <strong>Gonococcal ophthalmia = SIGHT-THREATENING EMERGENCY.</strong> N. gonorrhoeae can penetrate INTACT corneal epithelium and cause perforation within hours. Treat BEFORE culture results are available.</div>
<p><strong>Treatment:</strong></p>
<ul><li><strong>Ceftriaxone 25–50 mg/kg IV or IM × 1 dose</strong> (max 125 mg)</li>
<li>Frequent saline irrigation of the eye (flush out purulent material q1h until discharge resolves)</li>
<li>Ophthalmology consult (slit lamp for corneal ulceration)</li>
<li>Evaluate and treat BOTH parents for gonorrhea and chlamydia</li>
<li>Report to public health</li></ul>`,
t2:`<p><strong>Chlamydial conjunctivitis treatment:</strong></p>
<ul><li><strong>Oral erythromycin 50 mg/kg/day divided QID × 14 days</strong> (SYSTEMIC treatment required — topical alone is insufficient and does not prevent chlamydial pneumonia)</li>
<li>~50% of infants with chlamydial conjunctivitis develop chlamydial pneumonia at 4–12 weeks if untreated</li>
<li>Monitor for pyloric stenosis (erythromycin in infants &lt;2 weeks — small increased risk; azithromycin 20 mg/kg/day × 3 days is an alternative but less studied in neonates)</li>
<li>Evaluate and treat BOTH parents for chlamydia</li></ul>`
}}
]};
