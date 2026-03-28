// Clinical tree data — Newborn Discharge Readiness Decision Tree
// Source: 
// Auto-extracted from newborn_discharge_readiness_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Newborn Discharge\nReadiness",icon:"🏠",type:"assessment",sub:"Car seat, NBS, hearing, bilirubin, safe sleep, follow-up",edge:"",
info:{tabs:["AAP Discharge Criteria","Screening Checklist","Parent Education"],
t0:`<p><strong>AAP Recommended Discharge Criteria for Healthy Term Newborns:</strong></p>
<ul><li>Physiologic stability ≥12 hours (temp, HR, RR normal in open crib)</li>
<li>Successful feeding established (at least 2 successful feeds; weight loss &lt;7%)</li>
<li>At least one stool and one void documented</li>
<li>No significant jaundice (or bilirubin in low-risk zone with follow-up plan)</li>
<li>Newborn screening specimen collected (ideally ≥24h of age)</li>
<li>Hearing screen completed and documented</li>
<li>CCHD pulse oximetry screen passed</li>
<li>Hepatitis B vaccine administered (or plan documented if parent declines)</li>
<li>Vitamin K administered</li>
<li>Circumcision site stable (if applicable)</li>
<li>Car seat available and properly installed</li>
<li>Follow-up appointment scheduled within 24–48 hours of discharge</li>
<li>Parent education completed (see tab 3)</li></ul>`,
t1:`<table class="rt"><thead><tr><th>Screen</th><th>Timing</th><th>Status</th><th>Action if Abnormal</th></tr></thead><tbody>
<tr><td>Newborn metabolic screen (NBS)</td><td>24–48h of age</td><td>☐ Collected</td><td>Repeat per state protocol if &lt;24h. Abnormal → state lab contacts PCP.</td></tr>
<tr><td>Hearing screen (OAE or ABR)</td><td>Before discharge</td><td>☐ Pass / ☐ Refer</td><td>Refer → outpatient audiology by 1 month; diagnosis by 3 months; intervention by 6 months (JCIH 1-3-6 goals).</td></tr>
<tr><td>CCHD pulse ox</td><td>≥24h or before DC</td><td>☐ Pass / ☐ Fail</td><td>Fail → echo, evaluation (see cardiac tree)</td></tr>
<tr><td>Bilirubin risk assessment</td><td>Before discharge</td><td>☐ Low risk / ☐ Follow-up</td><td>Plot on Bhutani hour-specific nomogram. High-intermediate or high risk zone → follow-up TSB within 24h.</td></tr>
<tr><td>Hepatitis B vaccine</td><td>&lt;24h of age</td><td>☐ Given / ☐ Declined</td><td>If mother HBsAg+ → HBIG + HepB within 12h. If unknown → HepB within 12h + expedite maternal testing.</td></tr>
<tr><td>Vitamin K</td><td>Within 6h of birth</td><td>☐ Given / ☐ Refused</td><td>If refused: document counseling, offer oral vitamin K as alternative, flag chart.</td></tr>
</tbody></table>`,
t2:`<p><strong>Essential parent education before discharge:</strong></p>
<ul><li><strong>Safe sleep:</strong> Back to sleep, firm flat surface, no soft bedding/pillows/bumpers/toys, room-share (not bed-share) × 6 months minimum, pacifier at sleep</li>
<li><strong>Feeding:</strong> Breastfeed q2–3h (8–12×/day); adequate output (by day 4: ≥6 wet + 3–4 stools/day); signs of adequate intake (satisfied after feeds, gaining weight)</li>
<li><strong>Jaundice:</strong> When to call (yellowing of chest/abdomen/limbs, poor feeding, lethargy, dark urine, pale stools)</li>
<li><strong>When to seek care:</strong> Fever ≥100.4°F (38°C), poor feeding, excessive sleepiness, breathing difficulty, persistent vomiting, fewer wet diapers</li>
<li><strong>Car seat safety:</strong> Rear-facing in back seat. Harness snug at chest clip level. No bulky coats under harness.</li>
<li><strong>Follow-up:</strong> PCP visit within 24–48h of discharge (sooner if high-risk for jaundice or feeding issues)</li></ul>
<div class="bx bo">⚠️ <strong>Fever ≥100.4°F (38°C) in the first 30 days of life = ED evaluation and full sepsis workup.</strong> Parents must understand this is an EMERGENCY — do not give Tylenol and wait.</div>`
},children:[
{name:"Bilirubin Risk\nAssessment",icon:"🌕",type:"decision",sub:"Bhutani nomogram · Follow-up timing",edge:"Pre-discharge\nbili check",
info:{tabs:["Bhutani Zones","Follow-Up Schedule"],
t0:`<p><strong>Bhutani hour-specific bilirubin nomogram:</strong> Plot pre-discharge TSB or TcB against infant's age in hours. Four risk zones determine follow-up timing.</p>
<table class="rt"><thead><tr><th>Zone</th><th>Risk</th><th>Follow-up TSB</th></tr></thead><tbody>
<tr><td>Low risk (below 40th percentile)</td><td>~0% develop significant hyperbili</td><td>Routine PCP visit (48–72h)</td></tr>
<tr><td>Low-intermediate (40th–75th)</td><td>~2%</td><td>Within 48h</td></tr>
<tr><td>High-intermediate (75th–95th)</td><td>~13%</td><td>Within 24h</td></tr>
<tr><td>High risk (>95th percentile)</td><td>~40%</td><td>Within 12–24h; consider delaying discharge</td></tr>
</tbody></table>`,
t1:`<p><strong>Discharge timing and bilirubin follow-up:</strong></p>
<table class="dt"><thead><tr><th>Discharge Age</th><th>Follow-up TSB/TcB</th></tr></thead><tbody>
<tr><td>&lt;24 hours</td><td>By 72 hours of age</td></tr>
<tr><td>24–48 hours</td><td>By 96 hours (within 2 days)</td></tr>
<tr><td>48–72 hours</td><td>By 120 hours (within 2 days)</td></tr>
</tbody></table>
<p><em>Adjust earlier if risk factors: DAT+, preterm 35–37 wk, sibling with phototherapy, exclusive breastfeeding with difficulty, East Asian ethnicity, significant bruising/cephalhematoma.</em></p>`
}},
{name:"Car Seat\nTesting",icon:"🚗",type:"action",sub:"Required for <37 wk · 90-min observation",edge:"Preterm or\nlow birth wt",
info:{tabs:["Who Needs Testing","Protocol"],
t0:`<p><strong>AAP recommends pre-discharge car seat tolerance screening for:</strong></p>
<ul><li>All infants born &lt;37 weeks gestational age</li>
<li>Infants with history of apnea, bradycardia, or desaturation</li>
<li>Low birth weight infants (&lt;2500g)</li>
<li>Infants with conditions affecting airway/breathing (Pierre Robin, laryngomalacia, hypotonia)</li></ul>`,
t1:`<ol class="sl">
<li>Place infant in their own car seat (semi-reclined at ~45°)</li>
<li>Monitor SpO₂, HR, and respiratory effort continuously for 90–120 minutes (or the duration of the planned first car ride home, whichever is longer)</li>
<li><strong>PASS:</strong> No desaturation &lt;90%, no bradycardia &lt;80, no apnea for 90 min</li>
<li><strong>FAIL:</strong> Any of above events → try repositioning → retest. If still failing → car bed (supine) as alternative. Retest before discharge.</li>
<li>Document pass/fail and car seat/bed type used</li>
</ol>
<div class="bx bb">ℹ️ <strong>A car bed (flat-lying position) is an acceptable alternative</strong> for infants who fail car seat testing. Some car bed models are FAA-approved for airplane travel as well.</div>`
}},
{name:"Safe Sleep\nCounseling",icon:"🛏️",type:"action",sub:"ABCs of safe sleep · SIDS prevention",edge:"Every\ndischarge",
info:{tabs:["ABCs","Modeling in Hospital"],
t0:`<p><strong>ABCs of Safe Sleep (AAP 2022 Updated Guidelines):</strong></p>
<ul><li><strong>A</strong>lone — baby sleeps alone in their own sleep space (no bed-sharing, no other children/pets/adults in sleep surface)</li>
<li><strong>B</strong>ack — always on their back for every sleep (supine). Not side, not prone.</li>
<li><strong>C</strong>rib — firm, flat surface (crib, bassinet, play yard) that meets CPSC safety standards. No inclined sleepers (recalled). No soft bedding, pillows, bumper pads, stuffed animals, loose blankets.</li></ul>
<p><strong>Additional AAP 2022 recommendations:</strong></p>
<ul><li>Room-sharing (same room, separate surface) for at least first 6 months</li>
<li>Offer pacifier at sleep once breastfeeding is established</li>
<li>Avoid overheating (room 68–72°F; dress in one more layer than adult)</li>
<li>No commercial devices claiming to reduce SIDS (monitors, positioners, wedges)</li>
<li>Tummy time when AWAKE and supervised to prevent plagiocephaly and promote development</li></ul>`,
t1:`<p><strong>Model safe sleep in the hospital:</strong></p>
<ul><li>Place infant supine in bassinet for every sleep — this is what parents will replicate at home</li>
<li>Remove all extra blankets, hats, and positioning devices from the bassinet after initial assessment</li>
<li>Use a sleep sack instead of loose blankets</li>
<li>If a parent is found bed-sharing or placing infant prone → educate without judgment, reposition, document counseling</li>
<li>Capture "teachable moments" — the hospital stay is the single best opportunity to establish safe sleep habits</li></ul>
<div class="bx br">🚨 <strong>SIDS remains the leading cause of postneonatal infant death in the US.</strong> Safe sleep counseling at every discharge saves lives. Model it. Teach it. Document it.</div>`
}}
]};
