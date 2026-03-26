// Clinical tree data — Neonatal GI & Liver Decision Tree
// Source: 
// Auto-extracted from neonatal_gi_liver_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
name:"Neonatal GI &\nLiver Assessment",icon:"🫄",type:"assessment",sub:"Feeding intolerance, emesis, distension, jaundice",edge:"",
info:{tabs:["Initial Evaluation","Alarm Signs","Abdominal X-ray Patterns"],
t0:`<p>GI complaints are among the most common reasons for evaluation in the nursery and NICU. The differential spans benign conditions (physiologic reflux, meconium plug) to surgical emergencies (malrotation/volvulus, NEC perforation).</p>
<p><strong>Key presenting symptoms:</strong></p>
<ul><li>Feeding intolerance (residuals, emesis, poor intake)</li>
<li>Bilious vomiting (GREEN = surgical emergency until proven otherwise)</li>
<li>Abdominal distension</li>
<li>Bloody stools (visible or occult)</li>
<li>Failure to pass meconium (>48h = abnormal in term)</li>
<li>Conjugated (direct) hyperbilirubinemia (neonatal cholestasis)</li>
<li>Hepatomegaly or hepatosplenomegaly</li></ul>`,
t1:`<div class="bx br">🚨 <strong>GI alarm signs requiring IMMEDIATE evaluation:</strong></div>
<ul><li><strong>Bilious (green) vomiting</strong> — malrotation/volvulus until proven otherwise. EMERGENT UGI series.</li>
<li><strong>Abdominal distension + bloody stools + metabolic acidosis</strong> — NEC</li>
<li><strong>Rigid/tender abdomen + hemodynamic instability</strong> — perforation, surgical abdomen</li>
<li><strong>Failure to pass meconium >48h (term)</strong> — Hirschsprung, meconium ileus, imperforate anus</li>
<li><strong>Double-bubble on X-ray</strong> — duodenal atresia (T21 association in 30%)</li></ul>`,
t2:`<table class="dt"><thead><tr><th>X-ray Pattern</th><th>Diagnosis</th><th>Action</th></tr></thead><tbody>
<tr><td>Double bubble (no distal gas)</td><td>Duodenal atresia</td><td>Surgical consult; OG decompression; R/O T21</td></tr>
<tr><td>Multiple dilated loops ("stack of coins")</td><td>Distal bowel obstruction (jejunal/ileal atresia, meconium ileus)</td><td>Surgical consult; contrast enema</td></tr>
<tr><td>Pneumatosis intestinalis (intramural air)</td><td>NEC</td><td>NPO, OG, Abx, serial imaging</td></tr>
<tr><td>Portal venous gas</td><td>Severe NEC</td><td>Surgical consult emergently</td></tr>
<tr><td>Pneumoperitoneum (free air)</td><td>Perforation (NEC, SIP, other)</td><td>EMERGENT surgical consult</td></tr>
<tr><td>Gasless abdomen</td><td>Proximal obstruction or ascites</td><td>UGI series or US</td></tr>
<tr><td>Normal gas pattern with distension</td><td>Ileus (sepsis, electrolyte, post-surgical)</td><td>Treat underlying cause</td></tr>
</tbody></table>`
},children:[
// ═══ NEC ═══
{name:"Necrotizing\nEnterocolitis",icon:"🔴",type:"emergency",sub:"Preterm · Pneumatosis · Bell staging",edge:"Preterm +\ndistension +\nbloody stools",
info:{tabs:["Definition & Risk","Bell Staging","Management","Prevention"],
t0:`<p><strong>NEC:</strong> Inflammatory intestinal necrosis primarily affecting preterm infants. Most common GI emergency in the NICU. Incidence: 5–10% of VLBW infants. Mortality: 20–30% overall; up to 50% for surgical NEC.</p>
<p><strong>Risk factors:</strong></p>
<ul><li>Prematurity (most important — inversely proportional to GA)</li>
<li>Formula feeding (breast milk is protective)</li>
<li>Intestinal ischemia (PDA, hypotension, polycythemia)</li>
<li>Abnormal bacterial colonization</li>
<li>Rapid advancement of feeds (controversial)</li></ul>
<p><strong>Classic triad:</strong> Abdominal distension + feeding intolerance (residuals/emesis) + bloody stools. PLUS: metabolic acidosis, thrombocytopenia (falling plts may precede clinical NEC by 24–48h), temperature instability, lethargy.</p>`,
t1:`<table class="rt"><thead><tr><th>Stage</th><th>Signs</th><th>Radiograph</th><th>Treatment</th></tr></thead><tbody>
<tr><td><strong>IA (Suspected)</strong></td><td>Temp instability, apnea/brady, residuals, mild distension, occult blood+</td><td>Normal or mild ileus</td><td>NPO, OG, Abx × 3 days, serial AXR q6–12h</td></tr>
<tr><td><strong>IB (Suspected)</strong></td><td>Same as IA + gross blood in stool</td><td>Same as IA</td><td>Same as IA</td></tr>
<tr><td><strong>IIA (Definite, mild)</strong></td><td>Same + absent bowel sounds, abdominal tenderness</td><td><strong>Pneumatosis intestinalis</strong> (intramural air) ± portal venous gas</td><td>NPO 7–14 days, Abx × 7–14 days, TPN, serial AXR q6h</td></tr>
<tr><td><strong>IIB (Definite, moderate)</strong></td><td>Same + abdominal cellulitis, RLQ mass, metabolic acidosis, thrombocytopenia</td><td>Pneumatosis + portal venous gas + possible ascites</td><td>Same as IIA + surgical consult, monitor for perforation</td></tr>
<tr><td><strong>IIIA (Advanced, no perf)</strong></td><td>Severe distension, peritonitis, hypotension, DIC, resp failure</td><td>Marked distension ± ascites, NO free air</td><td>Same + surgical consult, resuscitation, consider peritoneal drain or laparotomy</td></tr>
<tr><td><strong>IIIB (Advanced, perforation)</strong></td><td>Same as IIIA + signs of perforation</td><td><strong>Pneumoperitoneum</strong> (free air)</td><td>EMERGENT SURGERY: peritoneal drain or laparotomy</td></tr>
</tbody></table>`,
t2:`<p><strong>Medical Management (Bell Stage I–II):</strong></p>
<ol class="sl">
<li><strong>NPO</strong> — bowel rest for 7–14 days (Bell II) or 3 days (Bell I suspected)</li>
<li><strong>OG tube to continuous/intermittent suction</strong> — decompress</li>
<li><strong>IV antibiotics:</strong> Vancomycin + meropenem (or pip-tazo) ± metronidazole for 7–14 days</li>
<li><strong>TPN</strong> via central line for nutritional support during bowel rest</li>
<li><strong>Serial AXR</strong> every 6–12 hours (watch for free air, worsening pneumatosis, portal venous gas)</li>
<li><strong>Serial labs:</strong> CBC (thrombocytopenia trend), BMP (metabolic acidosis), blood gas, lactate, CRP</li>
<li><strong>Surgical consult</strong> for Bell Stage IIB and all Stage III</li>
</ol>
<p><strong>Surgical Indications:</strong></p>
<ul><li>Pneumoperitoneum (free air) — ABSOLUTE indication</li>
<li>Clinical deterioration despite maximal medical therapy</li>
<li>Fixed dilated loop on serial imaging (suggests necrotic segment)</li>
<li>Abdominal wall erythema (transmural necrosis)</li>
<li>Positive paracentesis (brown/feculent fluid)</li></ul>`,
t3:`<p><strong>NEC Prevention Bundle:</strong></p>
<table class="dt"><thead><tr><th>Intervention</th><th>Evidence</th><th>Recommendation</th></tr></thead><tbody>
<tr><td><strong>Human milk (maternal)</strong></td><td>50–80% reduction in NEC (multiple studies)</td><td>✅ MOST effective prevention strategy</td></tr>
<tr><td><strong>Donor human milk</strong></td><td>If maternal milk unavailable; reduces NEC vs formula</td><td>✅ Strongly recommended for VLBW</td></tr>
<tr><td><strong>Standardized feeding protocols</strong></td><td>~30% reduction in NEC with protocol-driven feeding advancement</td><td>✅ Every NICU should have one</td></tr>
<tr><td><strong>Probiotics</strong></td><td>Meta-analyses show 30–50% reduction in NEC and all-cause mortality</td><td>⚠️ Not universally adopted in US; used widely in Europe/Australia. Product quality/safety concerns (FDA warning after ProBiS death).</td></tr>
<tr><td><strong>Antenatal steroids</strong></td><td>Reduces NEC among other benefits</td><td>✅ Indirect prevention via maturation</td></tr>
<tr><td><strong>Lactoferrin</strong></td><td>ELFIN trial (NEJM 2019): no reduction in LOS or NEC with bovine lactoferrin</td><td>❌ NOT recommended based on ELFIN</td></tr>
</tbody></table>
<div class="bx bg">✓ <strong>Human milk is the single most effective NEC prevention strategy.</strong> Maternal breast milk is first priority. If unavailable, pasteurized donor human milk should be used for VLBW infants.</div>`
}},
// ═══ VOLVULUS ═══
{name:"Malrotation /\nVolvulus",icon:"🌀",type:"emergency",sub:"Bilious emesis = UGI STAT · 6-hour window",edge:"Bilious\nemesis",
info:{tabs:["Definition","Diagnosis","Surgical Emergency","Clinical Pearl"],
t0:`<p><strong>Malrotation with midgut volvulus:</strong> The bowel twists around the superior mesenteric artery (SMA) pedicle, causing complete obstruction and ischemia of the entire midgut (duodenum to transverse colon). Without urgent surgery, the entire midgut becomes necrotic → short bowel syndrome or death.</p>
<ul><li>Malrotation incidence: ~1/500 (most asymptomatic)</li>
<li>Volvulus: most commonly presents in first month of life</li>
<li><strong>Bilious (green) vomiting in a neonate = malrotation/volvulus until proven otherwise</strong></li>
<li>May present with acute deterioration: shock, bloody stools, metabolic acidosis, DIC</li></ul>`,
t1:`<ol class="sl">
<li><strong>Upper GI series (UGI)</strong> — study of choice. Normal: duodenojejunal junction (ligament of Treitz) crosses midline at the level of the pylorus (left of the spine, at or above the duodenal bulb). Malrotation: DJ junction does not cross midline or is inferiorly displaced. Volvulus: "corkscrew" pattern of distal duodenum/proximal jejunum.</li>
<li><strong>Abdominal X-ray:</strong> May show "double bubble" (proximal obstruction), gasless abdomen, or dilated stomach with paucity of distal gas. Normal AXR does NOT exclude volvulus.</li>
<li><strong>US:</strong> "Whirlpool sign" (SMA and SMV wrapped around each other) has high sensitivity. Can be used as initial screen in some centers.</li>
</ol>
<div class="bx br">🚨 <strong>A normal AXR does NOT rule out volvulus.</strong> If clinical suspicion is high (bilious emesis in a neonate), proceed to UGI series EMERGENTLY regardless of AXR findings.</div>`,
t2:`<p><strong>Ladd Procedure — EMERGENT:</strong></p>
<ol class="sl">
<li>Exploratory laparotomy (or laparoscopic approach in stable patients)</li>
<li>Counterclockwise detorsion of the volvulus</li>
<li>Division of Ladd bands (peritoneal bands crossing the duodenum)</li>
<li>Broadening of the mesenteric base</li>
<li>Appendectomy (appendix is malpositioned; future appendicitis would present atypically)</li>
<li>Placement of small bowel on the right, colon on the left (non-rotation position)</li>
<li>Assess bowel viability — if questionable, "second-look" laparotomy in 24–48h</li>
</ol>`,
t3:`<div class="bx br">🚨 <strong>BILIOUS VOMITING IN A NEONATE IS A SURGICAL EMERGENCY UNTIL PROVEN OTHERWISE.</strong> Do not attribute bilious emesis to "reflux" or "overfeeding." The time from volvulus to irreversible midgut necrosis can be as short as 6 hours. UGI series must be obtained EMERGENTLY — call radiology and surgery simultaneously.</div>`
}},
// ═══ NEONATAL CHOLESTASIS ═══
{name:"Neonatal\nCholestasis",icon:"🟡",type:"urgent",sub:"Direct bili >1.0 mg/dL · Biliary atresia Kasai <60d",edge:"Conjugated\nhyperbili-\nrubinemia",
info:{tabs:["Definition","Differential","Workup Algorithm","Biliary Atresia"],
t0:`<p><strong>Neonatal cholestasis:</strong> Direct (conjugated) bilirubin >1.0 mg/dL regardless of total bilirubin. Prevalence: ~1/2,500 live births. Presents with prolonged jaundice beyond 2 weeks, dark urine, pale/acholic (clay-colored) stools, hepatomegaly.</p>
<div class="bx bo">⚠️ <strong>ANY infant still jaundiced at 2 weeks of age should have a fractionated bilirubin (total + direct).</strong> This is the single most important screening step for biliary atresia and other causes of neonatal cholestasis. Breastmilk jaundice (indirect) is common and benign — but conjugated hyperbilirubinemia is ALWAYS pathologic.</div>`,
t1:`<table class="dt"><thead><tr><th>Category</th><th>Diagnoses</th><th>Key Features</th></tr></thead><tbody>
<tr><td><strong>Obstructive</strong></td><td>Biliary atresia (#1 surgical), choledochal cyst, biliary sludge/gallstones, inspissated bile syndrome</td><td>Acholic stools, ↑ GGT (biliary atresia), US findings</td></tr>
<tr><td><strong>Infectious</strong></td><td>CMV, UTI (E. coli), syphilis, herpes hepatitis, sepsis</td><td>TORCH features, ↑ WBC, cultures</td></tr>
<tr><td><strong>Metabolic/Genetic</strong></td><td>Alpha-1 antitrypsin deficiency (#1 metabolic), galactosemia, tyrosinemia, Alagille syndrome, cystic fibrosis, progressive familial intrahepatic cholestasis (PFIC)</td><td>Low alpha-1 level, reducing substances, succinylacetone, bile acid analysis</td></tr>
<tr><td><strong>Endocrine</strong></td><td>Hypothyroidism, panhypopituitarism</td><td>TSH, cortisol, GH</td></tr>
<tr><td><strong>TPN-associated</strong></td><td>IFALD (intestinal failure-associated liver disease)</td><td>Prolonged TPN >14 days, ↑ direct bili, ALT</td></tr>
<tr><td><strong>Idiopathic</strong></td><td>Idiopathic neonatal hepatitis (diagnosis of exclusion)</td><td>Giant cell hepatitis on biopsy; ~20% of cases</td></tr>
</tbody></table>`,
t2:`<p><strong>Neonatal Cholestasis Workup:</strong></p>
<ol class="sl">
<li><strong>Fractionated bilirubin</strong> (total + direct) — confirm direct >1.0</li>
<li><strong>LFTs:</strong> ALT, AST, GGT, alkaline phosphatase, albumin</li>
<li><strong>Abdominal US:</strong> Gallbladder size/presence, biliary tree dilation, choledochal cyst. In biliary atresia: absent or small gallbladder, triangular cord sign at porta hepatis.</li>
<li><strong>Infectious workup:</strong> CMV urine PCR (within 21 days), UA/UCx, TORCH serologies, blood culture</li>
<li><strong>Metabolic:</strong> Alpha-1 antitrypsin level + phenotype, newborn screen (galactosemia, CF), urine reducing substances, urine succinylacetone (tyrosinemia), serum bile acids, sweat chloride</li>
<li><strong>Thyroid:</strong> TSH, free T4</li>
<li><strong>HIDA scan:</strong> Hepatobiliary iminodiacetic acid scan. Non-excretion into bowel after 24h suggests biliary atresia (but not diagnostic — can also be non-excretion from severe intrahepatic cholestasis).</li>
<li><strong>Liver biopsy:</strong> Bile duct proliferation + bile plugs = biliary atresia. Giant cell hepatitis = neonatal hepatitis. Often needed for definitive diagnosis.</li>
<li><strong>Intraoperative cholangiogram:</strong> Gold standard for biliary atresia diagnosis. Performed at time of Kasai if suspicion is high.</li>
</ol>`,
t3:`<p><strong>Biliary Atresia — TIME IS CRITICAL:</strong></p>
<ul><li>Most common indication for liver transplant in children</li>
<li>Progressive fibro-obliterative destruction of extrahepatic bile ducts</li>
<li>Incidence: ~1/10,000–15,000 in US (higher in East Asia)</li>
<li><strong>Kasai portoenterostomy:</strong> Surgical creation of a roux-en-Y loop of jejunum anastomosed to the liver hilum, bypassing the obliterated bile ducts</li>
<li><strong>TIMING IS EVERYTHING:</strong><br>
— Kasai performed at &lt;30 days: ~80% achieve bile flow<br>
— Kasai at 30–60 days: ~50–60% achieve bile flow<br>
— Kasai at 60–90 days: ~30% achieve bile flow<br>
— Kasai after 90 days: rarely successful</li>
<li>Even with successful Kasai, ~50–70% will eventually need liver transplant (but Kasai buys critical time for growth before transplant)</li></ul>
<div class="bx br">🚨 <strong>Every day of delay in diagnosing biliary atresia worsens outcomes.</strong> The 2-week jaundice screen with fractionated bilirubin is the KEY intervention. Acholic stools + conjugated hyperbilirubinemia + absent/small gallbladder on US → URGENT referral to pediatric surgery/hepatology for cholangiogram/Kasai.</div>`
},children:[
{name:"Biliary Atresia\nKasai Procedure",icon:"🔪",type:"emergency",sub:"Kasai <60 days · Transplant bridge",edge:"No bile\nexcretion +\nbiopsy",
info:{tabs:["Kasai Protocol","Post-Kasai Management"],
t0:`<ol class="sl">
<li>Intraoperative cholangiogram confirms non-patent extrahepatic biliary tree</li>
<li>Dissection and excision of the fibrotic extrahepatic bile ducts</li>
<li>Roux-en-Y portoenterostomy: jejunal loop anastomosed to the liver hilum</li>
<li>Bile drainage assessed by stool color change (return of pigmented stools = success)</li>
</ol>`,
t1:`<ul><li><strong>Ursodeoxycholic acid (UDCA):</strong> 10–20 mg/kg/day — improves bile flow</li>
<li><strong>Prophylactic antibiotics:</strong> TMP-SMX for cholangitis prevention (Roux loop creates ascending infection risk)</li>
<li><strong>Fat-soluble vitamin supplementation:</strong> A, D, E, K (cholestasis impairs absorption)</li>
<li><strong>MCT-enriched formula:</strong> Medium-chain triglycerides absorbed without bile acids</li>
<li><strong>Monitor:</strong> Bilirubin trend, LFTs, nutritional status, growth</li>
<li><strong>Cholangitis episodes:</strong> Fever + rising bilirubin + leukocytosis → IV antibiotics covering Gram-negatives and anaerobes</li>
<li><strong>Transplant evaluation:</strong> If Kasai fails (persistent cholestasis) or progressive liver failure</li></ul>`
}},
{name:"Alpha-1 AT /\nMetabolic",icon:"🧬",type:"diagnosis",sub:"A1AT deficiency #1 metabolic cause",edge:"Low A1AT level\nor NBS positive",
info:{tabs:["Alpha-1 AT Deficiency","Other Metabolic"],
t0:`<p><strong>Alpha-1 antitrypsin (A1AT) deficiency:</strong></p>
<ul><li>Most common metabolic cause of neonatal cholestasis and most common genetic cause of liver disease in children</li>
<li>PiZZ phenotype = severe (homozygous Z allele). A1AT level typically &lt;50 mg/dL (normal 100–300).</li>
<li>Mechanism: misfolded Z protein accumulates in hepatocytes → liver damage. Also causes emphysema in adults (unrelated to liver mechanism).</li>
<li>Presentation: neonatal cholestasis (10–15% of PiZZ infants), later cirrhosis possible</li>
<li>Diagnosis: serum A1AT level + Pi phenotype or genotype</li>
<li>Treatment: supportive (vitamin supplementation, nutrition); liver transplant for progressive cirrhosis. NO liver-specific A1AT therapy currently available (augmentation therapy is for lung disease only).</li></ul>`,
t1:`<table class="dt"><thead><tr><th>Condition</th><th>NBS</th><th>Key Lab</th><th>Urgency</th></tr></thead><tbody>
<tr><td><strong>Galactosemia</strong></td><td>On RUSP</td><td>GALT enzyme; urine reducing substances</td><td>🔴 STOP lactose/galactose IMMEDIATELY (breast milk, standard formula); E. coli sepsis risk</td></tr>
<tr><td><strong>Tyrosinemia type 1</strong></td><td>Succinylacetone on NBS</td><td>Urine succinylacetone; ↑ AFP</td><td>🔴 Start nitisinone (NTBC) immediately; hepatic failure if untreated</td></tr>
<tr><td><strong>Cystic fibrosis</strong></td><td>IRT on NBS</td><td>Sweat chloride; CFTR genotype</td><td>🟠 Inspissated bile syndrome; meconium ileus</td></tr>
<tr><td><strong>Alagille syndrome</strong></td><td>Not on NBS</td><td>JAG1 mutation; characteristic facies, butterfly vertebrae, cardiac (peripheral PS)</td><td>🟡 Chronic cholestasis; bile duct paucity on biopsy</td></tr>
</tbody></table>`
}}
]},
// ═══ HYPERBILIRUBINEMIA ═══
{name:"Neonatal\nHyperbilirubinemia",icon:"🌕",type:"decision",sub:"2022 AAP guidelines · Phototherapy · Exchange",edge:"Jaundice\n(indirect)",
info:{tabs:["2022 AAP Guidelines","Phototherapy","Exchange Transfusion","Breastfeeding Jaundice"],
t0:`<p><strong>2022 AAP Clinical Practice Guideline (Kemper et al., Pediatrics 2022):</strong> Major update to hyperbilirubinemia management. Key changes from 2004:</p>
<ul><li>Phototherapy and exchange thresholds now explicitly based on gestational age (35, 36, 37, 38, 39, 40+ weeks) rather than broad categories</li>
<li>Neurotoxicity risk factors refined: isoimmune hemolytic disease, G6PD deficiency, asphyxia, sepsis, albumin &lt;3.0, significant lethargy</li>
<li>Escalation pathway: intensive phototherapy → IV immunoglobulin (for isoimmune hemolysis) → exchange transfusion</li>
<li>Universal bilirubin screening (TSB or TcB) before discharge recommended</li></ul>
<div class="bx bb">ℹ️ <strong>Use the AAP 2022 hour-specific phototherapy and exchange nomograms.</strong> Available on BiliTool app. Plot TSB against hour of life and GA-specific thresholds.</div>`,
t1:`<p><strong>Phototherapy:</strong></p>
<ul><li><strong>Mechanism:</strong> Blue-green light (wavelength 460–490 nm) converts unconjugated bilirubin in the skin to water-soluble photoisomers (lumirubin) that are excreted without hepatic conjugation</li>
<li><strong>Intensive phototherapy:</strong> Irradiance ≥30 µW/cm²/nm. Use LED panels. Maximize exposed skin area (diaper only). Place device as close to infant as manufacturer allows.</li>
<li><strong>Monitoring:</strong> Recheck TSB 4–6h after starting; then every 6–12h. Rebound TSB 12–24h after stopping.</li>
<li><strong>Discontinue:</strong> When TSB falls below the phototherapy threshold for the infant's age and risk level</li>
<li><strong>Side effects:</strong> Insensible water loss (increase fluids by 10–20%), bronze baby syndrome (if direct hyperbilirubinemia — relative contraindication), temperature instability, retinal exposure (use eye shields)</li></ul>`,
t2:`<p><strong>Exchange transfusion indications (2022 AAP):</strong></p>
<ul><li>TSB at or above exchange threshold on GA-specific nomogram</li>
<li>TSB rising >0.5 mg/dL/hour despite intensive phototherapy (suggests active hemolysis)</li>
<li>Signs of acute bilirubin encephalopathy (ABE) at ANY bilirubin level</li></ul>
<p><strong>Signs of ABE (Acute Bilirubin Encephalopathy):</strong></p>
<ul><li>Early: lethargy, hypotonia, poor feeding</li>
<li>Intermediate: irritability, hypertonia (retrocollis, opisthotonus), high-pitched cry, fever</li>
<li>Advanced: apnea, seizures, coma, death or chronic kernicterus</li></ul>
<div class="bx br">🚨 <strong>Acute bilirubin encephalopathy is a MEDICAL EMERGENCY.</strong> Start exchange transfusion immediately regardless of TSB level. Do NOT wait for lab results if clinical signs of ABE are present.</div>`,
t3:`<p><strong>Breastfeeding jaundice vs breast milk jaundice:</strong></p>
<table class="dt"><thead><tr><th>Feature</th><th>Breastfeeding Jaundice</th><th>Breast Milk Jaundice</th></tr></thead><tbody>
<tr><td>Timing</td><td>Days 2–5 (first week)</td><td>After day 5–7, peaks week 2–3</td></tr>
<tr><td>Mechanism</td><td>Inadequate intake → decreased stooling → ↑ enterohepatic circulation of bilirubin</td><td>Substance in breast milk (β-glucuronidase?) that increases bilirubin reabsorption</td></tr>
<tr><td>Management</td><td>Increase breastfeeding frequency (8–12×/day); supplementation if weight loss >10%; lactation support</td><td>Continue breastfeeding; may persist 4–12 weeks; benign; rarely requires phototherapy</td></tr>
<tr><td>Severity</td><td>Can be significant (dehydration + hyperbilirubinemia)</td><td>Usually mild; TSB rarely >20</td></tr>
</tbody></table>
<div class="bx bg">✓ <strong>Do NOT stop breastfeeding for breast milk jaundice.</strong> Benefits of breastfeeding far outweigh the mild, self-limited jaundice. Temporary supplementation may be needed for breastfeeding jaundice (inadequate intake) but breastfeeding should continue.</div>`
}},
// ═══ FEEDING INTOLERANCE ═══
{name:"Feeding\nIntolerance",icon:"🍼",type:"decision",sub:"Residuals · Emesis · Abdominal distension",edge:"Feeding\ndifficulty",
info:{tabs:["Assessment","Differential","Management"],
t0:`<p><strong>Feeding intolerance is common and often benign in neonates</strong> — but can be the first sign of serious disease (NEC, volvulus, sepsis). Key is distinguishing physiologic from pathologic.</p>
<p><strong>Evaluate:</strong></p>
<ul><li>Gastric residual volume (GRV): controversial metric. Many NICUs are moving away from routine GRV checks as they often lead to unnecessary feed interruptions. Clinical assessment is more important than GRV numbers.</li>
<li>Emesis character: non-bilious vs bilious (GREEN = surgical emergency). Blood-streaked = swallowed maternal blood vs GI bleed (Apt test).</li>
<li>Abdominal exam: soft/non-distended (reassuring) vs distended/tender/discolored (concerning)</li>
<li>Stool pattern: meconium passage, transition stools, bloody stools</li></ul>`,
t1:`<table class="dt"><thead><tr><th>Benign (common)</th><th>Concerning (evaluate further)</th></tr></thead><tbody>
<tr><td>Physiologic reflux/GER (no weight loss, no resp symptoms)</td><td>Bilious emesis (volvulus/obstruction)</td></tr>
<tr><td>Small gastric residuals with normal exam</td><td>Increasing residuals + distension + bloody stools (NEC)</td></tr>
<tr><td>Slow weight gain in first days (up to 7% loss normal)</td><td>Weight loss >10% (dehydration, inadequate intake)</td></tr>
<tr><td>Transitional stools (green/loose)</td><td>Bloody stools (NEC, allergic colitis, anal fissure)</td></tr>
<tr><td>Mild spit-up after feeds</td><td>Projectile non-bilious emesis (pyloric stenosis if 2–6 wk)</td></tr>
</tbody></table>`,
t2:`<ul><li><strong>If benign features:</strong> Continue feeds; optimize positioning; smaller, more frequent feeds; reassurance</li>
<li><strong>If concerning features:</strong> Make NPO, place OG to decompress, abdominal X-ray, CBC/CRP/blood culture, surgical consult if bilious emesis</li>
<li><strong>Cow's milk protein allergy (CMPA):</strong> Bloody stools in well-appearing term infant → trial of maternal dairy elimination (breastfed) or extensively hydrolyzed/amino acid formula. Improves in 48–72h.</li>
<li><strong>Pyloric stenosis:</strong> Progressive non-bilious, projectile emesis at 2–6 weeks. Palpable "olive" in RUQ. Ultrasound: pyloric muscle thickness >3 mm, length >15 mm. Treatment: pyloromyotomy (Ramstedt). Correct hypochloremic metabolic alkalosis FIRST.</li></ul>`
}},
// ═══ MECONIUM DISORDERS ═══
{name:"Meconium\nDisorders",icon:"🟤",type:"decision",sub:"Failure to pass meconium >48h · Meconium plug/ileus",edge:"Delayed\nmeconium\npassage",
info:{tabs:["Normal Passage","Differential","Hirschsprung Disease"],
t0:`<p><strong>Normal meconium passage:</strong> 99% of term infants pass meconium within 48 hours. Failure to pass by 48h in a term infant requires evaluation. Preterm infants may have delayed passage (up to 72h+) due to GI immaturity.</p>`,
t1:`<table class="dt"><thead><tr><th>Diagnosis</th><th>Key Features</th><th>Diagnosis</th><th>Treatment</th></tr></thead><tbody>
<tr><td><strong>Meconium plug syndrome</strong></td><td>Most common. Inspissated meconium plug in left colon. IDM, hypothyroidism, MgSO₄ exposure.</td><td>Contrast enema (diagnostic AND therapeutic)</td><td>Contrast enema usually curative. R/O Hirschsprung and CF.</td></tr>
<tr><td><strong>Meconium ileus</strong></td><td>~15% of CF patients present this way. Thick, sticky meconium obstructs terminal ileum.</td><td>AXR: "ground-glass" appearance in RLQ, no air-fluid levels. Contrast enema: microcolon.</td><td>Gastrografin enema (osmotic draws fluid into lumen). Surgery if complicated (volvulus, atresia, perforation).</td></tr>
<tr><td><strong>Hirschsprung disease</strong></td><td>Absence of ganglion cells in distal bowel → functional obstruction. Abdominal distension, delayed meconium, explosive stool after rectal exam.</td><td>Rectal suction biopsy (gold standard): absent ganglion cells + nerve trunk hypertrophy.</td><td>Pull-through procedure (Soave, Swenson, or Duhamel).</td></tr>
<tr><td><strong>Imperforate anus</strong></td><td>No visible anus on exam. Diagnosed at birth.</td><td>Physical exam. Invertogram or cross-table lateral. Look for VACTERL association.</td><td>High = colostomy → later repair. Low = primary perineal anoplasty.</td></tr>
</tbody></table>`,
t2:`<p><strong>Hirschsprung Disease:</strong></p>
<ul><li>Incidence: ~1/5,000 live births. Male:female 4:1. Associated with trisomy 21 (2–10% of T21).</li>
<li>Pathology: absence of ganglion cells in the myenteric (Auerbach) and submucosal (Meissner) plexuses, from the anus proximally for a variable distance. Rectosigmoid (75%), total colonic (10%).</li>
<li>Presentation: delayed meconium passage, abdominal distension, explosive stool after digital rectal exam (gush of gas and liquid stool when finger is withdrawn).</li>
<li><strong>Diagnosis:</strong> Rectal suction biopsy is gold standard (no anesthesia needed; bedside). Absent ganglion cells + hypertrophied nerve trunks + positive acetylcholinesterase staining.</li>
<li><strong>HAEC (Hirschsprung-Associated Enterocolitis):</strong> Life-threatening complication — explosive diarrhea, abdominal distension, fever, sepsis. Treat with rectal irrigations, IV antibiotics, fluid resuscitation. Can occur pre- or post-operatively.</li></ul>
<div class="bx br">🚨 <strong>HAEC is the leading cause of mortality in Hirschsprung disease.</strong> Fever + explosive diarrhea + distension in a child with known or suspected Hirschsprung = HAEC until proven otherwise. Start rectal irrigations and IV antibiotics immediately.</div>`
}}
]};
