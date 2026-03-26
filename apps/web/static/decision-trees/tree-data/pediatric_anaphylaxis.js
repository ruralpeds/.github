// Clinical tree data — Pediatric Anaphylaxis Decision Tree
// Source: 
// Auto-extracted from pediatric_anaphylaxis_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Pediatric\nAnaphylaxis",icon:"⚠️",type:"emergency",sub:"Epinephrine IM FIRST · Biphasic reaction · Autoinjector",edge:"",
info:{tabs:["Diagnosis","Epinephrine Protocol","Post-Treatment"],
t0:`<p><strong>Anaphylaxis diagnostic criteria (WAO/EAACI):</strong> Acute onset (minutes to hours) with involvement of ≥2 organ systems after exposure to a likely allergen:</p>
<ul><li><strong>Skin/mucosal:</strong> Urticaria, flushing, angioedema, pruritus (present in ~80–90%)</li>
<li><strong>Respiratory:</strong> Stridor, wheezing, dyspnea, hypoxia, throat tightness</li>
<li><strong>Cardiovascular:</strong> Hypotension, tachycardia, syncope, altered mental status</li>
<li><strong>GI:</strong> Nausea, vomiting, abdominal pain, diarrhea</li></ul>
<p><strong>OR:</strong> Acute hypotension after known allergen exposure (even without skin findings — anaphylaxis can occur WITHOUT urticaria in ~10–20%).</p>`,
t1:`<div class="bx br">🚨 <strong>EPINEPHRINE IM is the FIRST and MOST IMPORTANT treatment.</strong> There is NO contraindication to epinephrine in anaphylaxis. Delay in epinephrine is the #1 factor associated with fatal anaphylaxis. Give it FIRST, before anything else.</div>
<table class="rt"><thead><tr><th>Parameter</th><th>Protocol</th></tr></thead><tbody>
<tr><td><strong>Drug</strong></td><td>Epinephrine 1:1000 (1 mg/mL) — THIS is the IM concentration</td></tr>
<tr><td><strong>Dose</strong></td><td>0.01 mg/kg IM (max 0.3 mg for &lt;30 kg; max 0.5 mg for >30 kg)</td></tr>
<tr><td><strong>Site</strong></td><td>Anterolateral thigh (vastus lateralis) — BEST absorption</td></tr>
<tr><td><strong>Repeat</strong></td><td>Every 5–15 min if symptoms persist or recur. Most patients need only 1–2 doses.</td></tr>
<tr><td><strong>Autoinjector</strong></td><td>EpiPen Jr 0.15 mg (&lt;30 kg) or EpiPen 0.3 mg (≥30 kg)</td></tr>
</tbody></table>
<p><strong>Adjunct medications (give AFTER epinephrine, NOT instead of):</strong></p>
<ul><li>Normal saline bolus 20 mL/kg for hypotension</li>
<li>Albuterol nebulized for bronchospasm</li>
<li>H1-blocker: diphenhydramine 1 mg/kg IV/IM (max 50 mg) — treats urticaria, does NOT treat anaphylaxis</li>
<li>H2-blocker: famotidine 0.25 mg/kg IV (max 20 mg) — adjunct</li>
<li>Dexamethasone 0.6 mg/kg (max 10 mg) PO/IV — may prevent biphasic reaction (limited evidence)</li></ul>`,
t2:`<ul><li><strong>Observation:</strong> Minimum 4–6 hours after symptoms resolve. 8–12+ hours if severe or required multiple doses of epinephrine.</li>
<li><strong>Biphasic reaction:</strong> Recurrence of symptoms 1–72 hours (usually 4–12 hours) after initial resolution. Occurs in 5–20%. Higher risk with severe initial reaction or delayed epinephrine.</li>
<li><strong>Discharge with:</strong> Epinephrine autoinjector prescription (with training on use), allergy action plan, referral to allergist, education on allergen avoidance, medical alert bracelet recommendation.</li>
<li><strong>Follow-up:</strong> Allergist within 2–4 weeks for trigger identification, skin testing/IgE testing, immunotherapy consideration.</li></ul>`
},children:[
{name:"Epinephrine IM\n& Resuscitation",icon:"💉",type:"emergency",sub:"0.01 mg/kg IM · Repeat q5–15 min · Fluids for shock",edge:"Anaphylaxis\nconfirmed",
info:{tabs:["Step-by-Step","Refractory Anaphylaxis"],
t0:`<ol class="sl">
<li><strong>Epinephrine 0.01 mg/kg IM</strong> (1:1000) into anterolateral thigh. FIRST. IMMEDIATELY.</li>
<li><strong>Position:</strong> Supine with legs elevated (Trendelenburg) if hypotensive. Sitting up if respiratory distress predominates. Do NOT stand patient up (distributive shock → cardiac arrest on standing).</li>
<li><strong>Call for help.</strong> Activate code/rapid response.</li>
<li><strong>O₂:</strong> High-flow via non-rebreather mask.</li>
<li><strong>IV access:</strong> Large-bore. Start NS 20 mL/kg bolus for hypotension.</li>
<li><strong>Albuterol neb</strong> for wheeze/bronchospasm.</li>
<li><strong>Repeat epinephrine q5–15 min</strong> if symptoms persist.</li>
<li><strong>Monitor continuously:</strong> SpO₂, BP, HR, respiratory status.</li>
</ol>`,
t1:`<p><strong>Refractory anaphylaxis (not responding to IM epinephrine ×2–3):</strong></p>
<ul><li><strong>Epinephrine infusion:</strong> 0.1–1 µg/kg/min IV (mix 1 mg in 250 mL NS = 4 µg/mL). Titrate to BP and symptoms.</li>
<li><strong>Aggressive fluids:</strong> Up to 60–80 mL/kg in the first hour for distributive shock.</li>
<li><strong>Vasopressin:</strong> 0.01–0.04 U/min IV for catecholamine-resistant shock.</li>
<li><strong>Glucagon:</strong> 20–30 µg/kg IV (max 1 mg) for patients on β-blockers (β-blockers block epinephrine's effect; glucagon bypasses β-receptor and increases cAMP directly).</li>
<li><strong>Intubation:</strong> Early if angioedema is progressing or stridor is worsening (delayed intubation in anaphylaxis can be impossible due to airway edema — surgical airway may be needed).</li></ul>`
}}
]};
