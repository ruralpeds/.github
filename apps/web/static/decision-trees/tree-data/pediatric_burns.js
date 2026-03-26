// Clinical tree data — Pediatric Burns Decision Tree
// Source: 
// Auto-extracted from pediatric_burns_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric Burns\nManagement",icon:"🔥",type:"assessment",sub:"Parkland formula · Burn depth · Transfer criteria · Abuse screening",edge:"",
info:{tabs:["Burn Assessment","Depth Classification","Lund-Browder Chart"],
t0:`<p><strong>Initial burn assessment (ABCDE first):</strong></p>
<ul><li>Airway: facial burns, singed nasal hairs, soot in mouth, hoarse voice, stridor → EARLY intubation (airway edema progresses rapidly; delayed intubation may be impossible)</li>
<li>Breathing: circumferential chest burn → escharotomy if restricting ventilation. CO poisoning (100% O₂, check COHb).</li>
<li>Circulation: large-bore IV (through burned skin if necessary), fluid resuscitation</li>
<li>Disability: assess for associated trauma, altered mental status (CO, cyanide, associated injury)</li>
<li>Exposure: remove all clothing/jewelry. Cool running water × 20 min (within 3h of burn). DO NOT use ice (worsens injury + hypothermia risk).</li></ul>`,
t1:`<table class="rt"><thead><tr><th>Depth</th><th>Appearance</th><th>Sensation</th><th>Healing</th></tr></thead><tbody>
<tr><td><strong>Superficial (1st degree)</strong></td><td>Red, dry, no blisters (sunburn)</td><td>Painful</td><td>3–5 days, no scarring</td></tr>
<tr><td><strong>Superficial partial (2nd, superficial)</strong></td><td>Pink, moist, clear blisters, blanches</td><td>Very painful</td><td>7–14 days, minimal scarring</td></tr>
<tr><td><strong>Deep partial (2nd, deep)</strong></td><td>White/mottled, hemorrhagic blisters, less blanching</td><td>Reduced sensation</td><td>3–8 weeks, significant scarring; may need grafting</td></tr>
<tr><td><strong>Full thickness (3rd degree)</strong></td><td>White/brown/charred, leathery, waxy, does NOT blanch</td><td>Painless (nerves destroyed)</td><td>Will NOT heal without grafting; contracture risk</td></tr>
</tbody></table>`,
t2:`<p><strong>Pediatric TBSA estimation:</strong> Children have proportionally LARGER heads and SMALLER legs than adults. Use the Lund-Browder chart (NOT the Rule of 9s, which is inaccurate for children &lt;10 years).</p>
<p><strong>Quick estimate:</strong> The child's palm (including fingers) = ~1% TBSA. Useful for scattered/irregular burns.</p>
<p><strong>Lund-Browder adjustments by age:</strong></p>
<table class="rt"><thead><tr><th>Body Part</th><th>0–1 yr</th><th>1–4 yr</th><th>5–9 yr</th><th>10–14 yr</th></tr></thead><tbody>
<tr><td>Head</td><td>19%</td><td>17%</td><td>13%</td><td>11%</td></tr>
<tr><td>Each thigh</td><td>5.5%</td><td>6.5%</td><td>8%</td><td>8.5%</td></tr>
<tr><td>Each leg (below knee)</td><td>5%</td><td>5%</td><td>5.5%</td><td>6%</td></tr>
</tbody></table>
<p><em>Note: Only count 2nd-degree and deeper burns for TBSA calculation. Do NOT include superficial (1st-degree) burns.</em></p>`
},children:[
{name:"Fluid\nResuscitation",icon:"💧",type:"emergency",sub:"Parkland formula · Urine output guided · >10% TBSA",edge:"≥10% TBSA\n(2nd degree+)",
info:{tabs:["Parkland Formula","Monitoring","Maintenance Fluids"],
t0:`<p><strong>Parkland Formula (for burns ≥10% TBSA in children):</strong></p>
<p><strong>Total fluid in first 24h = 3–4 mL × weight (kg) × %TBSA</strong></p>
<ul><li>Give FIRST HALF in the first 8 hours (from TIME OF BURN, not time of arrival)</li>
<li>Give SECOND HALF over the next 16 hours</li>
<li>Use Lactated Ringer's (preferred) or NS</li>
<li>This is a STARTING point — titrate to urine output</li></ul>
<p><strong>Example:</strong> 20 kg child, 25% TBSA burn: 4 × 20 × 25 = 2000 mL. Give 1000 mL in first 8h (125 mL/hr), then 1000 mL over next 16h (62.5 mL/hr).</p>
<div class="bx bo">⚠️ <strong>The Parkland formula is a GUIDE, not a prescription.</strong> Titrate fluid rate to urine output. UOP is the best real-time indicator of adequacy of resuscitation.</div>`,
t1:`<p><strong>Targets:</strong></p>
<table class="rt"><thead><tr><th>Parameter</th><th>Target</th></tr></thead><tbody>
<tr><td>Urine output (children)</td><td>1–2 mL/kg/hr</td></tr>
<tr><td>Urine output (infants &lt;30 kg)</td><td>1 mL/kg/hr</td></tr>
<tr><td>Heart rate</td><td>Normal for age</td></tr>
<tr><td>Mean arterial pressure</td><td>Age-appropriate</td></tr>
<tr><td>Mental status</td><td>Alert and comfortable</td></tr>
</tbody></table>
<p><strong>Foley catheter:</strong> Required for all burns ≥15–20% TBSA to monitor UOP accurately.</p>`,
t2:`<p><strong>CHILDREN also need MAINTENANCE fluids (with dextrose) in addition to Parkland resuscitation:</strong></p>
<ul><li>Children &lt;20 kg have low glycogen stores → risk of hypoglycemia if only given LR without dextrose</li>
<li>Add D5LR or D5 0.45%NS as maintenance in addition to Parkland resuscitation fluids</li>
<li>Monitor glucose q4–6h in young children with significant burns</li></ul>
<div class="bx bb">ℹ️ <strong>This is a key difference from adult burn resuscitation.</strong> Adults get only Parkland LR. Children need Parkland LR PLUS dextrose-containing maintenance fluids to prevent hypoglycemia.</div>`
}},
{name:"Burn Center\nTransfer Criteria",icon:"🏥",type:"decision",sub:"ABA criteria · When to transfer",edge:"Assessment\ncomplete",
info:{tabs:["ABA Transfer Criteria","Stabilization for Transfer"],
t0:`<p><strong>American Burn Association (ABA) Transfer Criteria — transfer to a verified burn center:</strong></p>
<ul><li>Partial-thickness burns >10% TBSA</li>
<li>Burns involving face, hands, feet, genitalia, perineum, major joints</li>
<li>Full-thickness (3rd-degree) burns of any size</li>
<li>Electrical burns (including lightning)</li>
<li>Chemical burns</li>
<li>Inhalation injury</li>
<li>Burns with pre-existing medical conditions complicating management</li>
<li>Burns with associated trauma (if burn is the most significant injury)</li>
<li><strong>Burns in children</strong> at hospitals without qualified pediatric capability</li>
<li>Burns requiring special social, emotional, or rehabilitative intervention (including NAT)</li></ul>`,
t1:`<ol class="sl">
<li>ABCs secured (intubate early if inhalation injury suspected)</li>
<li>Parkland fluids running (LR ± maintenance D5)</li>
<li>Foley catheter (if ≥15% TBSA)</li>
<li>NG tube (if ≥20% TBSA or transferring by air — ileus common)</li>
<li>Pain management (morphine 0.1 mg/kg IV titrated)</li>
<li>Wounds covered with clean dry sheets (NOT wet — hypothermia risk). NO topical agents until burn center evaluates.</li>
<li>Tetanus prophylaxis (if not up to date)</li>
<li>Documentation: burn diagram with TBSA estimate, fluid totals given, time of injury</li>
<li>Keep patient WARM during transport (hypothermia is a major threat in pediatric burns)</li>
</ol>`
}},
{name:"Burns &\nChild Abuse",icon:"🔍",type:"urgent",sub:"Immersion pattern · Cigarette · NAT screening",edge:"Concerning\nhistory or\npattern",
info:{tabs:["Suspicious Burn Patterns","Evaluation"],
t0:`<p><strong>Burns suspicious for non-accidental trauma:</strong></p>
<ul><li><strong>Immersion burns:</strong> Symmetric, sharply demarcated "stocking" or "glove" distribution on hands/feet. Buttock/perineal scald burns with sparing of skin folds (held in flexion while immersed). "Donut-hole" pattern on buttocks (center spared where skin pressed against tub bottom).</li>
<li><strong>Cigarette burns:</strong> Circular, uniform, 7–8 mm diameter, full-thickness. Usually multiple, on hands, feet, or buttocks.</li>
<li><strong>Iron/contact burns:</strong> Patterned burns matching an object (iron, curling iron, lighter, stove grate). Usually full-thickness with sharp borders.</li>
<li><strong>History red flags:</strong> Burn "pattern" does not match history, delay in seeking care, multiple family explanations, prior ED visits, other injuries (bruises, fractures)</li></ul>
<div class="bx br">🚨 <strong>In children &lt;3 years, scald burns are the most common abusive burn.</strong> Any scald burn in a child &lt;3 years should be assessed for consistency between the history and the injury pattern. Mandatory reporting if suspicion exists.</div>`,
t1:`<ul><li>Full skin exam (undress completely — look for other injuries)</li>
<li>Skeletal survey if &lt;2 years</li>
<li>Document burn pattern precisely (photographs with ruler, body diagrams)</li>
<li>Social work consult</li>
<li>CPS report if reasonable suspicion</li>
<li>Assess siblings/other children in the home</li></ul>`
}}
]};
