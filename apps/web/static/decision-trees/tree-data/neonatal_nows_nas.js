// Clinical tree data — NOWS / NAS Decision Tree
// Auto-extracted from neonatal_nows_nas_decision_tree.html
// Edit this file to update clinical content without touching rendering code.

const TREE_DATA = {
  name: "Opioid-Exposed Neonate",
  type: "assess",
  sub: "Born to mother with OUD/prenatal opioid exposure",
  detail: "<strong>Admission Criteria:</strong> Any neonate with known or suspected prenatal opioid exposure. Obtain comprehensive maternal substance history (opioid type, dose, polysubstance use, MOUD status). Order urine/meconium drug screen. Begin minimum observation period: 4–7 days (methadone/buprenorphine), 3–5 days (heroin/short-acting opioids).<br><br><strong>Gestational Age Considerations:</strong><br>• 32–33⁶⁄₇ wk: Delayed onset 5–7d, confounded by prematurity signs, Finnegan not validated<br>• 34–36⁶⁄₇ wk: Intermediate severity, assess feeding maturity independently<br>• ≥37 wk: Standard pathway applies",
  children: [
    {
      name: "Begin Non-Pharmacologic Care Bundle",
      type: "treat",
      sub: "First-line for ALL opioid-exposed neonates",
      detail: "<strong>Mandatory first-line interventions:</strong><br>• Rooming-in with mother (reduces pharmacotherapy 63%)<br>• Skin-to-skin / kangaroo care<br>• Swaddling in fetal position<br>• Low-stimulation environment (dim, quiet, private room)<br>• Demand feeding q2–3h, small volumes<br>• Non-nutritive sucking (pacifier)<br>• Cluster care (minimize handling)<br>• Support breastfeeding if eligible<br>• Volunteer cuddlers when parent absent<br><br><strong>Continue throughout entire hospitalization regardless of pharmacotherapy status.</strong>",
      children: [
        {
          name: "ESC Assessment (Preferred)",
          type: "assess",
          sub: "Evaluate at every feeding/care time",
          detail: "<strong>Eat, Sleep, Console (ESC-NOW Trial, NEJM 2023):</strong><br><br><strong>EAT:</strong> Can infant eat ≥1 oz (or breastfeed well for ≥10 min)?<br><strong>SLEEP:</strong> Can infant sleep ≥1 hour undisturbed?<br><strong>CONSOLE:</strong> Can infant be consoled within 10 minutes?<br><br>If ALL three = YES → Continue non-pharmacologic care.<br>If ANY = NO after maximized non-pharm interventions → Team huddle → Consider pharmacotherapy.<br><br><strong>Key principle:</strong> ESC reduced pharmacotherapy from 52% to 19.5% and LOS by 6.7 days vs. Finnegan-based care.",
          children: [
            {
              name: "All 3 ESC Criteria Met?",
              type: "decide",
              sub: "Eat ≥1oz, Sleep ≥1hr, Console ≤10min",
              detail: "<strong>Assessment frequency:</strong> At every feeding/care time (~q3h).<br><br><strong>Critical: Optimize non-pharm interventions BEFORE scoring.</strong> Ensure swaddling, dim lights, pacifier, skin-to-skin have all been attempted. Parental presence is essential — 41% of assessment periods without a caregiver correlate with pharmacotherapy initiation.<br><br><strong>Document:</strong> Which specific ESC criterion failed, what non-pharmacologic interventions were attempted, and for how long.",
              children: [
                {
                  name: "YES — Continue Non-Pharm Care",
                  type: "wean",
                  sub: "Reassess at each feeding; observe ≥4–7 days",
                  detail: "<strong>80% of ESC-managed infants never need pharmacotherapy.</strong><br><br>Continue observation for minimum:<br>• Long-acting opioid exposure (methadone, buprenorphine): 5–7 days<br>• Short-acting opioid exposure (heroin, prescription opioids): 3–5 days<br>• Polysubstance: 7+ days (benzodiazepine withdrawal may be delayed)<br><br><strong>Discharge readiness:</strong> Feeding well, weight gaining ≥20g/day, stable vitals, 24h symptom-free, social work clearance, Plan of Safe Care completed.",
                  children: [
                    {
                      name: "Discharge Criteria Met",
                      type: "stop",
                      sub: "Safe discharge with follow-up plan",
                      detail: "<strong>Safe Discharge Checklist:</strong><br>• Feeding established (breast or bottle), gaining ≥20g/day<br>• 24–48h observation post-peak without deterioration<br>• Plan of Safe Care completed (CAPTA/CARA mandate)<br>• Pediatric follow-up within 48–72h<br>• Safe sleep education documented<br>• Car seat tolerance test if <37 wk GA<br>• Early Intervention referral placed<br>• Maternal MOUD provider coordination<br>• Social work assessment complete<br>• Hepatitis C testing at 18 months if exposed"
                    }
                  ]
                },
                {
                  name: "NO — Initiate Pharmacotherapy",
                  type: "decide",
                  sub: "Team huddle: select first-line agent",
                  detail: "<strong>Pharmacotherapy threshold (ESC):</strong> Inability to eat, sleep, or be consoled despite MAXIMAL non-pharmacologic interventions across ≥2 consecutive assessment periods.<br><br><strong>Team huddle includes:</strong> Attending physician/NP, bedside nurse, social worker, +/- pharmacist. Confirm all non-pharm measures exhausted. Document rationale.<br><br><strong>Agent selection factors:</strong><br>• Institutional experience and formulary<br>• Maternal opioid type (match receptor profile)<br>• Gestational age (affects PK)<br>• Polysubstance exposure pattern<br>• Anticipated outpatient wean feasibility",
                  children: [
                    {
                      name: "Morphine (Standard)",
                      type: "treat",
                      sub: "0.04–0.1 mg/kg PO q3–4h",
                      detail: "<strong>Morphine Oral Solution Protocol:</strong><br><br><strong>Starting dose:</strong> 0.05–0.06 mg/kg/dose PO q3h<br><strong>Max daily dose:</strong> 1.0–1.2 mg/kg/day<br><strong>Half-life:</strong> ~6.5 hours (neonatal)<br><br><strong>Preterm adjustment (32–36 wk):</strong><br>• Start at lower end: 0.04 mg/kg q4h<br>• Slower escalation (q24h increments)<br>• Extended monitoring for respiratory depression<br><br><strong>Advantages:</strong> Most evidence, familiar to nursing<br><strong>Disadvantages:</strong> q3–4h dosing = high nursing burden, difficult outpatient wean",
                      children: [
                        {
                          name: "Stabilized on Morphine?",
                          type: "decide",
                          sub: "ESC met × 24–48h at current dose",
                          detail: "<strong>Stabilization criteria:</strong><br>• All 3 ESC criteria consistently met for 24–48 hours<br>• OR Finnegan scores consistently <8 for 24–48 hours<br>• Adequate feeding and weight gain<br>• No supplemental dose (rescue) needed in 24h<br><br><strong>If NOT stabilized within 24–48 hours → Escalate dose</strong><br><strong>If stabilized → Begin wean</strong>",
                          children: [
                            {
                              name: "NOT Stable → Escalate",
                              type: "escalate",
                              sub: "Increase 0.01–0.04 mg/kg/dose q12–24h",
                              detail: "<strong>Morphine Escalation Protocol:</strong><br><br>• Increase by 0.01–0.04 mg/kg/dose (typically ~20% increases)<br>• Escalate no more frequently than every 12–24 hours<br>• Reassess after each dose increase × 3 doses<br><br><strong>Maximum before adjunct consideration:</strong> ~0.8–1.0 mg/kg/day<br><br><strong>If maximum dose reached and still not stabilized → ADD adjunctive therapy (do NOT switch primary agent)</strong>",
                              children: [
                                {
                                  name: "Max Dose Reached, Still Unstable?",
                                  type: "decide",
                                  sub: "≥0.8 mg/kg/day morphine, ESC still failing",
                                  detail: "<strong>Refractory withdrawal triggers:</strong><br>• Receiving ≥0.8–1.0 mg/kg/day morphine<br>• ESC criteria still not met after 48–72h at max dose<br>• Consider: polysubstance exposure not yet identified?<br>• Review maternal history for benzodiazepines, gabapentin, SSRIs<br>• Consider meconium/cord blood confirmatory testing<br><br><strong>Decision: Add adjunctive agent based on clinical phenotype</strong>",
                                  children: [
                                    {
                                      name: "Add Clonidine",
                                      type: "adjunct",
                                      sub: "1 mcg/kg PO q4h — for autonomic symptoms",
                                      detail: "<strong>Clonidine Protocol (Alpha-2 Agonist):</strong><br><br><strong>Dose:</strong> 1 mcg/kg PO q3–4h (0.5–1.5 mcg/kg range)<br><strong>Max:</strong> 2 mcg/kg/dose q4h<br><br><strong>Best for:</strong> Predominant autonomic symptoms — diaphoresis, diarrhea, vomiting, tachycardia, tremors<br><br><strong>Monitoring:</strong> HR and BP q4h; hold if HR <100 or MAP <40 mmHg<br><br><strong>Evidence:</strong> Agthe 2009 RCT: 27% shorter treatment duration. No-POPPY 2024: comparable to morphine as monotherapy.<br><br><strong>Wean:</strong> Decrease frequency (q3h→q6h→q12h→DC). Wean INPATIENT due to rebound hypertension risk."
                                    },
                                    {
                                      name: "Add Phenobarbital",
                                      type: "adjunct",
                                      sub: "Load 10–20 mg/kg → 2–8 mg/kg/day",
                                      detail: "<strong>Phenobarbital Protocol (GABA-A Agonist):</strong><br><br><strong>Loading dose:</strong> 10–20 mg/kg IV/PO (can split)<br><strong>Maintenance:</strong> 2–8 mg/kg/day ÷ q12–24h<br><strong>Target level:</strong> 15–30 mcg/mL<br><strong>Half-life:</strong> 41–114 hours (neonatal)<br><br><strong>PREFERRED for:</strong><br>• Opioid + benzodiazepine co-exposure<br>• Opioid + barbiturate co-exposure<br>• Polysubstance with prominent seizure risk<br><br><strong>Outpatient wean:</strong> Feasible — decrease 20% every 3–5 days. Check level before discharge.<br><br><strong>Cautions:</strong> Over-sedation, impaired suck, alcohol in some formulations, unknown long-term neurodevelopmental effects."
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              name: "Stable → Begin Wean",
                              type: "wean",
                              sub: "Decrease 10% of stabilizing dose q24–48h",
                              detail: "<strong>Morphine Weaning Protocol:</strong><br><br>• Decrease by 10% of the MAXIMUM stabilizing dose every 24–48 hours<br>• Some protocols use 10–20% reductions q24h<br>• Assess ESC criteria before each reduction step<br><br><strong>If ESC criteria fail during wean:</strong><br>→ Return to last effective dose<br>→ Re-stabilize × 24–48h<br>→ Resume wean at smaller decrements (10% instead of 20%)<br><br><strong>Discontinue morphine at:</strong> ≤0.02 mg/kg/dose<br><strong>Post-discontinuation observation:</strong> 24–48 hours minimum",
                              children: [
                                {
                                  name: "Wean Tolerated?",
                                  type: "decide",
                                  sub: "ESC criteria maintained during dose reduction",
                                  detail: "<strong>Wean tolerance assessment at each step:</strong><br><br><strong>TOLERATED:</strong> ESC criteria still all met 12–24h after dose reduction → continue wean schedule<br><br><strong>NOT TOLERATED:</strong> Any ESC criterion fails within 12–24h of reduction →<br>• Return to previous dose<br>• Re-stabilize 24–48h<br>• Slower wean (decrease by smaller increment)<br>• Consider: was a co-exposure missed?<br><br><strong>Typical total morphine course:</strong> 14–28 days",
                                  children: [
                                    {
                                      name: "YES → Continue Wean to Discontinuation",
                                      type: "wean",
                                      sub: "Continue 10% reductions → DC at ≤0.02 mg/kg",
                                      detail: "<strong>Final wean steps:</strong><br>• Continue 10% reductions q24–48h<br>• At dose ≤0.02 mg/kg → discontinue<br>• Observe 24–48h post-discontinuation<br>• Then proceed to discharge criteria assessment",
                                      children: [
                                        {
                                          name: "Discharge Assessment",
                                          type: "stop",
                                          sub: "24–48h post last dose, all criteria met",
                                          detail: "<strong>Post-pharmacotherapy discharge criteria:</strong><br>• 24–48h since last morphine dose<br>• ESC criteria met throughout observation<br>• Weight gain ≥20g/day<br>• Feeding well (breast or bottle)<br>• Plan of Safe Care finalized<br>• Follow-up in 48–72h<br>• Safe sleep education<br>• Early Intervention referral<br>• Developmental monitoring schedule reviewed with family"
                                        }
                                      ]
                                    },
                                    {
                                      name: "NO → Return to Last Effective Dose",
                                      type: "escalate",
                                      sub: "Re-stabilize 24–48h, then slower wean",
                                      detail: "<strong>Wean failure management:</strong><br>• Return to previous effective dose immediately<br>• Re-stabilize for 24–48h (ESC met consistently)<br>• Resume wean with SMALLER decrements (e.g., 10% instead of 20%)<br>• Extend time between reductions (q48h instead of q24h)<br>• If repeated wean failures → consider adding clonidine as adjunctive agent to facilitate wean"
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      name: "Methadone (Alternative)",
                      type: "treat",
                      sub: "0.05–0.1 mg/kg PO q8–12h",
                      detail: "<strong>Methadone Oral Solution Protocol:</strong><br><br><strong>Starting dose:</strong> 0.05–0.1 mg/kg/dose PO q12h (some: q8h)<br><strong>Max daily dose:</strong> 0.5–1.0 mg/kg/day<br><strong>Half-life:</strong> 16–25 hours (neonatal)<br><br><strong>Advantages over morphine:</strong><br>• Longer half-life → q8–12h dosing (less nursing burden)<br>• 14% shorter LOS in RCT (Davis 2018)<br>• More feasible outpatient wean<br><br><strong>Preterm adjustment:</strong> Start 0.05 mg/kg q12h; extended half-life in preterms requires caution<br><strong>Monitoring:</strong> Consider QTc at baseline and during escalation<br><br><strong>Wean:</strong> 10–20% reductions q24–48h. Extend to q24h dosing before DC.",
                      children: [
                        {
                          name: "Methadone Escalation / Wean",
                          type: "decide",
                          sub: "Same stabilize → escalate → wean logic",
                          detail: "<strong>Escalation:</strong> Increase by 0.02–0.05 mg/kg/dose q24h if ESC not met. Max ~1.0 mg/kg/day.<br><br><strong>Stabilization:</strong> ESC met × 48h at current dose.<br><br><strong>Wean:</strong> 10–20% reductions q24–48h. Monitor for delayed re-emergence (long half-life). Post-DC observation: 48–72h recommended (longer than morphine).<br><br><strong>Adjunctive therapy:</strong> Same criteria as morphine — add clonidine or phenobarbital if max dose reached without stabilization."
                        }
                      ]
                    },
                    {
                      name: "Buprenorphine SL (Emerging)",
                      type: "treat",
                      sub: "4.4–5.3 mcg/kg SL q8h",
                      detail: "<strong>Sublingual Buprenorphine Protocol:</strong><br><br><strong>Starting dose:</strong> 4.4–5.3 mcg/kg/dose SL q8h (13.2–15.9 mcg/kg/day)<br><strong>Max daily dose:</strong> 60 mcg/kg/day<br><strong>Half-life:</strong> ~20 hours<br><br><strong>BBORN Trial (Kraft, NEJM 2017):</strong><br>• Median treatment: 15d vs 28d (morphine), p<0.001<br>• Median LOS: 21d vs 33d, p<0.001<br><br><strong>Administration technique:</strong> Place measured volume under tongue using oral syringe; hold infant's mouth closed 1 min. Requires staff training.<br><br><strong>Cautions:</strong> Not FDA-approved for this indication. Original formulation contains 30% ethanol (ethanol-free formulation in development). Partial agonist pharmacology provides wide safety margin for respiratory depression.<br><br><strong>Wean:</strong> 10–15% reductions q24h after 48h stabilization. Post-DC observation: 48–72h.",
                      children: [
                        {
                          name: "Buprenorphine Escalation / Wean",
                          type: "decide",
                          sub: "Same logic; escalate to 60 mcg/kg/day max",
                          detail: "<strong>Escalation:</strong> Increase by ~25% of dose q24h if ESC not met. Max 60 mcg/kg/day.<br><br><strong>Wean:</strong> 10–15% reductions q24h. Discontinue at ≤4 mcg/kg/day. Post-DC observation 48–72h.<br><br><strong>If refractory:</strong> Add clonidine. Phenobarbital for polysubstance."
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: "Finnegan Scoring (Alternative)",
          type: "assess",
          sub: "21-item tool scored q2–4h",
          detail: "<strong>Modified Finnegan (FNASS):</strong><br><br>Score 21 domains across CNS, metabolic/vasomotor/respiratory, and GI categories every 2–4 hours.<br><br><strong>Treatment thresholds:</strong><br>• ≥8 on 3 consecutive scores → Initiate pharmacotherapy<br>• ≥12 on 2 consecutive scores → Initiate pharmacotherapy<br><br><strong>Limitations:</strong><br>• Poor inter-rater reliability (degrades without ongoing training)<br>• Not validated for preterm infants<br>• Requires disturbing infant to score (contradicts non-pharm care)<br>• Many scored items non-specific to opioid withdrawal<br>• Higher pharmacotherapy rates than ESC (~52%)<br><br><strong>Recommendation:</strong> Transition to ESC. If running both in parallel, use ESC for treatment decisions.",
          children: [
            {
              name: "Score ≥8 × 3 or ≥12 × 2?",
              type: "decide",
              sub: "Pharmacotherapy threshold reached",
              detail: "<strong>If threshold met:</strong> Follow same pharmacotherapy selection tree as ESC pathway (Morphine / Methadone / Buprenorphine).<br><br><strong>Wean triggers (Finnegan):</strong><br>• Scores consistently <8 for 24–48h → begin wean<br>• Wean by reducing dose 10–20% of max stabilizing dose q24–48h<br>• Discontinue when dose at minimum therapeutic level with scores <8 × 48h<br>• Observe 24–48h post-discontinuation<br><br><strong>All other decision nodes (escalation, adjunctive therapy, discharge) follow identical logic as ESC pathway.</strong>"
            }
          ]
        },
        {
          name: "Polysubstance? Atypical Presentation?",
          type: "decide",
          sub: "Consider co-exposures if atypical symptoms",
          detail: "<strong>Red flags for polysubstance exposure:</strong><br><br><strong>Opioid + Benzodiazepine:</strong> Biphasic withdrawal — initial opioid (24–72h) then delayed benzo (days–weeks). Add phenobarbital.<br><br><strong>Opioid + Gabapentin:</strong> Tongue thrusting, nystagmus, opisthotonos, rolling eyes. Does NOT respond to opioid treatment. Consider gabapentin 5 mg/kg q12h (Loudin 2017).<br><br><strong>Opioid + SSRI:</strong> Jitteriness, increased tone, tachypnea. Earlier onset, self-limited 48h. Supportive care usually sufficient.<br><br><strong>Opioid + Methamphetamine:</strong> May initially mask opioid withdrawal. Monitor for delayed presentation after stimulant effects wane.<br><br><strong>Iatrogenic (NICU):</strong> After >5 days continuous opioid/benzo infusion. Use WAT-1 score. Protocolized 10–20% daily wean.",
          children: [
            {
              name: "Gabapentin Exposure",
              type: "adjunct",
              sub: "Gabapentin 5 mg/kg PO q12h",
              detail: "<strong>Gabapentin for atypical gabapentin co-exposure withdrawal:</strong><br><br><strong>Dose:</strong> 5 mg/kg PO q12h<br>• 79% of gabapentin+opioid co-exposed infants show atypical phenotype<br>• Symptoms do NOT respond to standard opioid treatment<br>• Gabapentin administration resolves atypical symptoms<br>• Continue until symptoms resolve, then wean over 5–7 days<br><br><strong>Also treat concurrent opioid withdrawal with standard opioid protocol.</strong>"
            },
            {
              name: "Benzodiazepine Co-Exposure",
              type: "adjunct",
              sub: "Phenobarbital: Load 20 mg/kg → 5 mg/kg/day",
              detail: "<strong>Benzodiazepine co-exposure management:</strong><br><br>• 51% increased odds of pharmacotherapy (Sanlorenzo 2019)<br>• May cause delayed/biphasic withdrawal (benzo withdrawal peaks 7–14 days)<br>• <strong>Add phenobarbital</strong> as primary agent for benzo component<br>• Loading: 20 mg/kg IV/PO<br>• Maintenance: 5 mg/kg/day, target level 20–30 mcg/mL<br>• Monitor sedation closely — combined with opioid treatment<br>• Outpatient phenobarbital wean: 20% every 3–5 days<br>• Extend observation period to ≥7 days before discharge"
            }
          ]
        }
      ]
    }
  ]
};
