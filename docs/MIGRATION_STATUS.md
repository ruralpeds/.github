# Migration Status: Pediatric_emergency_CDS → Peds + rust-sci-core

Last updated: 2026-03-24

## Architecture

```
OLD: Pediatric_emergency_CDS (monolithic Rust/Leptos app)
  ↓ Split into:
NEW: rust-sci-core/sci-clinical    (pure computation, no UI, no JSON wrapping)
NEW: Peds (SvelteKit + WASM)       (UI, decision trees, textbook, clinical content)
```

---

## Computation Migration (→ rust-sci-core/sci-clinical)

### ✅ Already in sci-clinical before migration
| Module | Coverage |
|---|---|
| acid_base.rs | Winter's, delta-delta, Henderson-Hasselbalch, SID, base excess |
| scoring.rs | Phoenix, pSOFA, PELOD-2, PRISM-III, PIM-3 |
| neonatal.rs | Apgar, ETT sizing, NRP epi/NS, surfactant, caffeine |
| neonatal_scoring.rs | SNAPPE-II, CRIB-II, Sarnat, Finnegan, Silverman, Downes |
| emergency.rs | PALS cardiac arrest/bradycardia/tachycardia/sepsis, NRP, RSI, status epilepticus, anaphylaxis, DKA |
| trauma.rs | Pediatric GCS, PTS, BIG, PECARN, RTS, SIPA, Lund-Browder |
| renal.rs | Schwartz eGFR, FENa, FEUrea, KDIGO AKI |
| fluids.rs | Holliday-Segar, 4-2-1, GIR, fluid deficit |
| ventilation.rs | Tidal volume, compliance, driving pressure, MAP |
| oxygenation.rs | OI, OSI, P/F, S/F, A-a gradient, PARDS |
| pain_sedation.rs | FLACC, NIPS, COMFORT-B, CAPD |
| pews.rs | Bedside PEWS, Brighton PEWS |
| hemodynamics.rs | MAP, shock index, CPP, blood volume |
| nutrition.rs | Caloric/protein requirements, TPN, Schofield |
| dosing.rs | Weight-based dosing, infusion rates, surfactant |
| anthropometrics.rs | BSA (3 formulas), BMI, corrected GA, weight velocity |
| conversions.rs | Lab unit conversions, anion gap, corrected Na/Ca, osmolality |

### ✅ Added in this migration (2026-03-24, commit b5a0c97)
| Module | Lines | Source |
|---|---|---|
| cardiology.rs | 290 | protocols/cardiology_calc.rs + pediatric_cardiology.rs |
| hematology.rs | 248 | protocols/hematology_calc.rs |
| neonatal_fluids.rs | 230 | protocols/neonatal_ivf.rs |
| respiratory_scoring.rs | 188 | protocols/respiratory_scoring.rs |
| respiratory_support.rs | 270 | respiratory_cds/*.rs |
| fluid_electrolyte.rs | 256 | protocols/fluid_electrolyte_acidbase.rs |

### ⬜ Remaining computation (low priority — mostly covered by existing modules)
| Old Module | Lines | Status |
|---|---|---|
| protocols/renal_calc.rs | 725 | Partially covered by renal.rs. Missing: dialysis params, RTA differentiation, TTKG, UACR/UPCR, FE-HCO3, FE-K, FE-P |
| respiratory_cds/calculations.rs | 434 | Covered by oxygenation.rs + ventilation.rs + respiratory_support.rs |
| respiratory_cds/ventilator.rs | 247 | Covered by respiratory_support.rs (initial_vent_settings, ardsnet_peep_for_fio2) |
| respiratory_cds/medications.rs | 216 | Dosing covered by dosing.rs + emergency.rs |
| respiratory_cds/monitoring.rs | 130 | Clinical protocol text → Peds data layer |
| scoring/*.rs wrappers | 5382 | JSON wrappers around sci-clinical functions. Not needed — ped-wasm calls sci-clinical directly |

---

## Content Migration (→ Peds repo)

### ✅ Migrated (2026-03-24)
| Content | Files | Location in Peds |
|---|---|---|
| Textbook data | 1 (2,039 lines) | apps/web/src/lib/data/textbook/ |
| Calculator registry | 1 (1,352 lines) | apps/web/src/lib/data/calculators/ |
| Contacts template | 1 | apps/web/src/lib/data/contacts/ |
| Evidence registry | 1 | apps/web/src/lib/data/contacts/ |
| Education guides | 42 files (DOCX + MD) | content/education-guides/ |
| Module source docs | 14 files | content/module-source/ |
| Legacy decision trees | 7 files (HTML + JSX) | content/decision-trees-legacy/ |
| Clinical flowcharts | 3 HTML files | content/flowcharts-legacy/ |
| Documentation | 4 files | docs/ |

### ✅ New Decision Trees Created (9 total)
| Tree | Mode | Route |
|---|---|---|
| NRP Algorithm (8th Ed) | Neonatal | /resuscitation/nrp |
| PALS Cardiac Arrest | Pediatric | /resuscitation/pals |
| PALS Bradycardia with Pulse | Pediatric | /resuscitation/bradycardia |
| PALS Tachycardia with Pulse | Pediatric | /resuscitation/tachycardia |
| RSI Protocol | Pediatric | /airway/rapid-sequence |
| Sepsis First-Hour Bundle | Pediatric | /sepsis/pathway |
| Status Epilepticus | Both | /resuscitation/status-epilepticus |
| DKA Protocol | Pediatric | /resuscitation/dka |
| Anaphylaxis | Both | /resuscitation/anaphylaxis |

### ⬜ Decision Trees Still Needed (from old protocol modules)
| Protocol | Old Source | Priority |
|---|---|---|
| PALS Bradycardia | emergency.rs | High |
| PALS Tachycardia | emergency.rs | High |
| Difficult Airway | (new) | High |
| DKA Protocol | protocols/metabolic.rs | High |
| Status Epilepticus | protocols/neuro.rs | High |
| Anaphylaxis | emergency.rs | High |
| Burns / Parkland | protocols/burns.rs | Medium |
| Trauma Assessment | protocols/trauma.rs | Medium |
| Toxicology / Antidotes | protocols/toxicology.rs | Medium |
| Neonatal Hypoglycemia | protocols/neonatal.rs | High (neonatal) |
| Neonatal Seizures | protocols/neonatal.rs | High (neonatal) |
| Neonatal Sepsis (EOS) | protocols/neonatal.rs | High (neonatal) |
| Ductal-Dependent CHD | protocols/neonatal.rs | Medium (neonatal) |
| Respiratory Escalation | respiratory_cds/*.rs | Medium |
| NIV Management | respiratory_cds/*.rs | Medium |
| Neonatal IVF Management | protocols/neonatal_ivf.rs | Medium (neonatal) |
| Drowning | protocols/drowning.rs | Low |
| Psychiatric Emergency | protocols/psychiatric.rs | Low |
| Skin Infections | protocols/skin_infections.rs | Low |
| Environmental | protocols/environmental.rs | Low |
| Musculoskeletal | protocols/musculoskeletal.rs | Low |
| Procedures | protocols/procedures.rs | Low |

### ⬜ Content Conversion Needed
| Item | Status |
|---|---|
| Convert textbook-data.js → TypeScript TextbookSection format | Pending |
| Convert calculators-registry.js → TypeScript with WASM bindings | Pending |
| Convert legacy HTML decision trees → DecisionTree JSON schema | Pending |
| Index education DOCX files into TextbookViewer content | Pending |

---

## Infrastructure Not Migrated (intentionally)
| Item | Reason |
|---|---|
| Tauri desktop wrapper (src-tauri/) | Replaced by Capacitor/Tauri integration in Phase 4 |
| Docker/nginx deployment | Replaced by adapter-static PWA deployment |
| Playwright e2e tests | Will be rewritten for SvelteKit |
| Module registry scripts | Not needed — Peds uses tree registry pattern |
| Google Cloud hosting plan | Deployment strategy TBD |
