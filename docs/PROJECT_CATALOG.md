# Peds — Project Catalog
_Generated: 2026-03-31 · Branch: `claude/next-phase-WQCVg` · Commit: `5073d09`_

---

## Overview

**Peds** is a clinical decision support (CDS) application for pediatric and neonatal emergency medicine, targeting rural emergency departments and Level II nurseries. It provides interactive decision trees, weight-based calculators, clinical education resources, and medical simulation scenarios.

- **Repository:** `timothyhartzog/Peds`
- **Primary audience:** Rural ED physicians, neonatal nurses, transport teams
- **Admin PIN:** `1234` (stored hashed in localStorage; changeable via admin panel)

---

## Monorepo Structure

```
Peds/
├── apps/web/                     — SvelteKit web application
├── crates/                       — Rust workspace (8 crates)
│   ├── ped-core/                 — Core clinical math (469 lines)
│   ├── ped-resus/                — Resuscitation algorithms (344 lines)
│   ├── ped-wasm/                 — WASM bindings for browser (610 lines)
│   ├── ped-airway/               — Airway stub (11 lines)
│   ├── ped-cardiac/              — Cardiac stub (11 lines)
│   ├── ped-neonatal/             — Neonatal stub (11 lines)
│   ├── ped-sepsis/               — Sepsis stub (11 lines)
│   └── ped-trauma/               — Trauma stub (11 lines)
├── content/                      — Education source files (DOCX)
├── docs/                         — Project documentation
├── knowledge/                    — Root knowledge registry (150 entries)
└── scripts/                      — Build and registry management scripts
```

### External Dependency
All clinical computation pulls from a separate repository at build time:

| Crate | Source |
|---|---|
| `sci-units`, `sci-stats`, `sci-clinical`, `sci-growth`, `sci-wasm` | `github.com/timothyhartzog/rust-sci-core` (branch: main) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | SvelteKit 2.x + TypeScript |
| Build tool | Vite 5 |
| Adapter | `@sveltejs/adapter-static` (static site) |
| Tree visualization | D3.js 7.8.5 (cdnjs) |
| Map rendering | MapLibre GL + svelte-maplibre |
| Compute backend | Rust + wasm-pack (WASM, optional — progressive enhancement) |
| Fonts | DM Serif Display · IBM Plex Sans · IBM Plex Mono |
| Testing | Playwright (config present; requires `npm install -D @playwright/test`) |

---

## Frontend Application (`apps/web/`)

### SvelteKit Routes (48 pages)

| Domain | Route | Description |
|---|---|---|
| Home | `/` | Patient entry form, domain card grid |
| **Resuscitation** | `/resuscitation` | Domain index |
| | `/resuscitation/pals` | PALS Cardiac Arrest tree |
| | `/resuscitation/bradycardia` | PALS Bradycardia tree |
| | `/resuscitation/tachycardia` | PALS Tachycardia tree |
| | `/resuscitation/nrp` | NRP Resuscitation tree |
| | `/resuscitation/dosing` | Weight-based emergency drug dosing table |
| | `/resuscitation/defibrillation` | Defibrillation/cardioversion energy dosing |
| | `/resuscitation/dka` | DKA protocol tree |
| | `/resuscitation/anaphylaxis` | Anaphylaxis protocol tree |
| | `/resuscitation/status-epilepticus` | Status epilepticus tree |
| **Airway** | `/airway` | Domain index |
| | `/airway/rapid-sequence` | RSI protocol tree |
| | `/airway/difficult-airway` | Difficult airway decision tree |
| | `/airway/equipment` | Broselow equipment sizing table |
| | `/airway/neonatal-intubation` | Neonatal intubation reference |
| **Sepsis** | `/sepsis` | Domain index |
| | `/sepsis/pathway` | Sepsis first-hour bundle tree |
| | `/sepsis/fluids` | Fluid resuscitation reference |
| | `/sepsis/antibiotics` | Empiric antibiotic dosing formulary |
| **Neonatal** | `/neonatal` | Domain index |
| | `/neonatal/ivf-matrix` | IVF Sparkline Matrix (GA-stratified fluid rates) |
| | `/neonatal/respiratory` | CPAP/HFNC/ventilator settings reference |
| | `/neonatal/fluids` | GIR calculation, hypoglycemia protocols |
| | `/neonatal/level-ii` | Level II admission criteria, escalation thresholds |
| | `/neonatal/thermoregulation` | Isolette targets, therapeutic cooling |
| | `/neonatal/jaundice` | AAP 2022 phototherapy thresholds |
| | `/neonatal/growth` | Fenton 2013 weight percentile reference |
| **Cardiac** | `/cardiac` | Domain index |
| | `/cardiac/arrhythmias` | Tabbed PALS arrhythmia trees |
| | `/cardiac/cardioversion` | Synchronized cardioversion dosing |
| | `/cardiac/ductal-dependent` | Ductal-dependent CHD reference |
| | `/cardiac/prostaglandin` | PGE1 dosing and management |
| **Trauma** | `/trauma` | Domain index |
| | `/trauma/assessment` | ATLS primary survey, GCS |
| | `/trauma/blood-products` | MTP triggers, blood product dosing |
| | `/trauma/burns` | TBSA Lund-Browder, Parkland formula |
| **Transport** | `/transport` | S.T.A.B.L.E. program, transport criteria, pre-transport checklist |
| **Reference** | `/reference` | Index to all reference content |
| | `/reference/decision-trees` | Browseable list of all 41 standalone trees |
| | `/reference/calculators` | Links to standalone calculator tools |
| | `/reference/education` | Tabbed cheat sheets / textbooks / audio textbooks |
| | `/reference/knowledge` | Searchable knowledge registry (115 entries) |
| | `/reference/normals` | Vital signs by age, lab normals, blood gas reference |
| | `/reference/equipment` | Broselow equipment sizing table |
| | `/reference/formulary` | Weight-based drug formulary (20+ categories) |
| **Simulations** | `/simulations` | 28-scenario MedSim platform |
| **Admin** | `/admin` | Dashboard with registry stats and content gap analysis |
| | `/admin/content` | Content library — 29 education guides + 14 textbooks |
| | `/admin/knowledge` | Searchable knowledge registry browser |
| | `/admin/trees` | Decision tree registry — migration status tracker |

### Key Components (`src/lib/components/clinical/`)

| Component | Purpose |
|---|---|
| `TreePage.svelte` | Renders inline D3 decision trees from JSON data |
| `ClinicalDecisionTree.svelte` | Lower-level D3 tree renderer |
| `IVFSparklineMatrix.svelte` | GA × DOL sparkline matrix for neonatal IVF rates |
| `AlertBanner.svelte` | Dismissible info/warning/emergency alert banners |
| `DoseCard.svelte` | Weight-based drug dose card |
| `TextbookViewer.svelte` | DOCX viewer component |

### Stores (`src/lib/stores/`)

| Store | Description |
|---|---|
| `patient.ts` | Patient demographics, weight, age, GA — persisted, weight-based dose computation |
| `mode.ts` | `clinicalMode`: `'neonatal' \| 'pediatric'` — drives content filtering |
| `admin.ts` | Admin auth (localStorage PIN), registry loading, content gap analysis |
| `errors.ts` | Global error state |

### Inline Decision Tree Data (`src/lib/data/trees/`) — 9 trees

These render inside SvelteKit routes via `TreePage.svelte`:

| File | Used in route |
|---|---|
| `pals-cardiac-arrest.json` | `/resuscitation/pals`, `/cardiac/arrhythmias` |
| `pals-bradycardia.json` | `/resuscitation/bradycardia`, `/cardiac/arrhythmias` |
| `pals-tachycardia.json` | `/resuscitation/tachycardia`, `/cardiac/arrhythmias` |
| `nrp-algorithm.json` | `/resuscitation/nrp` |
| `rsi-protocol.json` | `/airway/rapid-sequence` |
| `sepsis-pathway.json` | `/sepsis/pathway` |
| `dka-protocol.json` | `/resuscitation/dka` |
| `anaphylaxis.json` | `/resuscitation/anaphylaxis` |
| `status-epilepticus.json` | `/resuscitation/status-epilepticus` |

---

## Standalone Decision Trees (`apps/web/static/decision-trees/`) — 41 trees

All trees share a single rendering engine (`tree-engine.js`) with D3 layout, pan/zoom, collapse/expand, tabbed info popups, theming, and edu-links. Clinical data is fully separated into `tree-data/*.json`.

### Architecture Files

| File | Role |
|---|---|
| `tree-engine.js` | Shared D3 rendering engine for all standalone trees |
| `tree-loader-template.html` | Thin HTML loader template |
| `REGISTRY.json` | Machine-readable tree registry (41 entries, last updated 2026-03-27) |
| `d3.min.js` | Local D3 fallback |
| `../theme-bridge.js` | Theme system (3 themes: `clinical-dark`, `clinical-light`, `high-contrast`) |
| `../shell.js` | Patient banner, Broselow color, mode badge |
| `../edu-links.js` | Education resource slide-out panel |

### Neonatal Trees (25)

| ID | Title |
|---|---|
| `nrp_resuscitation` | Neonatal Resuscitation (NRP) |
| `neonatal_glucose_management` | Glucose Management (32–35 wk) |
| `neonatal_pulmonary` | Pulmonary Disorders |
| `neonatal_respiratory_escalation` | Respiratory Escalation & NIV |
| `neonatal_eos_sepsis` | Early-Onset Sepsis (EOS) |
| `neonatal_infectious_diseases` | Infectious Diseases |
| `neonatal_fen` | Fluid, Electrolyte & Nutrition |
| `neonatal_neurology` | Neurology |
| `neonatal_seizures` | Seizures |
| `neonatal_hematology` | Hematology |
| `neonatal_cardiac_pda` | Cardiac / PDA |
| `neonatal_endocrine` | Endocrine Abnormalities |
| `neonatal_gi_liver` | GI & Liver Disorders |
| `neonatal_renal` | Renal Disorders |
| `neonatal_surgical_emergencies` | Surgical Emergencies |
| `neonatal_ophthalmology` | Ophthalmology (ROP) |
| `neonatal_skin` | Skin & Dermatology |
| `neonatal_urological` | Urological Disorders |
| `neonatal_pain_sedation` | Pain & Sedation |
| `neonatal_transport` | Transport Stabilization |
| `neonatal_nows_nas` | NOWS / NAS |
| `newborn_discharge_readiness` | Newborn Discharge Readiness |
| `newborn_screening_followup` | Newborn Screening Follow-Up |
| `neonatal_ivf_prescription_calculator` | IVF Prescription Calculator (interactive) |
| (combined) | `neonatal_glucose_management_dt.json` — extended DT format (433 lines) |

### Obstetric Trees (2)

| ID | Title |
|---|---|
| `obstetric_emergencies` | Obstetric Emergencies |
| `shoulder_dystocia` | Shoulder Dystocia |

### Pediatric Trees (14)

| ID | Title |
|---|---|
| `pals_algorithm` | PALS Algorithm |
| `pediatric_difficult_airway` | Difficult Airway |
| `pediatric_sepsis_shock` | Sepsis & Shock |
| `pediatric_respiratory_emergencies` | Respiratory Emergencies |
| `pediatric_cardiac_emergencies` | Cardiac Emergencies |
| `pediatric_trauma` | Trauma |
| `pediatric_seizures` | Seizures & Status Epilepticus |
| `pediatric_dka` | DKA Management |
| `pediatric_anaphylaxis` | Anaphylaxis |
| `pediatric_burns` | Burns |
| `pediatric_toxicology` | Toxicology |
| `pediatric_abdominal_pain` | Abdominal Pain |
| `pediatric_orthopedic` | Orthopedic Emergencies |
| `pediatric_psychiatric_emergencies` | Psychiatric Emergencies |
| `pediatric_siadh_csw` | SIADH vs Cerebral Salt Wasting |

---

## Education Content (`apps/web/static/education/`)

### 14 Neonatal Topics (3 formats each = 42 files)

| Topic | Cheat Sheet | Textbook | Audio |
|---|---|---|---|
| Critical Care Stabilization | ✅ | ✅ | ✅ |
| Maternal Infections | ✅ | ✅ | ✅ |
| Neonatal Endocrine Abnormalities | ✅ | ✅ | ✅ |
| Neonatal FEN | ✅ | ✅ | ✅ |
| Neonatal GI & Liver | ✅ | ✅ | ✅ |
| Neonatal Hematology | ✅ | ✅ | ✅ |
| Neonatal Infectious Diseases | ✅ | ✅ | ✅ |
| Neonatal Neurology | ✅ | ✅ | ✅ |
| Neonatal Pulmonary Disorders | ✅ | ✅ | ✅ |
| Neonatal Renal | ✅ | ✅ | ✅ |
| Neonatal Skin & Dermatology | ✅ | ✅ | ✅ |
| Neonatal Surgical Emergencies | ✅ | ✅ | ✅ |
| Neonatal Urology | ✅ | ✅ | ✅ |
| Neonatal Ventilation Decision Tree | ✅ | ✅ | ✅ |

### 29 Numbered Education Guides (planned/draft)

Guides 01–22 (with sub-versions) indexed in the knowledge registry as `draft` status. Source content tracked in `apps/web/src/routes/admin/content/+page.svelte`. Files would live at `/education/{filename}.docx`.

---

## Standalone Calculators (`apps/web/static/calculators/`)

| File | Title |
|---|---|
| `pediatric_ivf_calculator.html` | Pediatric IVF Management (Holliday-Segar, dehydration, burns, restriction, composition) |
| `pediatric_ivf_educational.html` | IVF Educational Reference (teaching mode with clinical reasoning) |
| `pediatric_electrolyte_calculator.html` | Electrolyte & Special Populations (Na/K/Ca/Mg/PO4, DKA fluids, burn resuscitation, renal dosing) |

---

## Simulations (`apps/web/static/simulations/`) — 28 scenarios

All scenarios are standalone HTML files with a scoring engine, token badges, and NNT display.

| Module | Scenarios | IDs |
|---|---|---|
| Ventilator Management | 6 | `vent_01–06` |
| Electrolyte Emergencies | 8 | `elyte_01–08` |
| Acid-Base | 5 | `acid_01–05` |
| Pediatric Sepsis | 3 | `peds_sepsis_01–03` |
| ED Dosing | 2 | `ed_dosing_01–02` |
| Neonatal Respiratory | 2 | `neo_resp_01–02` |
| Bilirubin | 2 | `bili_01–02` |

---

## Rust Workspace (`crates/`)

| Crate | Lines | Status | Description |
|---|---|---|---|
| `ped-wasm` | 610 | Active | WASM bindings — exposes `sci-clinical` + IVF engine to browser JS |
| `ped-core` | 469 | Active | Core clinical math, pulls `sci-clinical` from rust-sci-core |
| `ped-resus` | 344 | Active | Resuscitation algorithm logic |
| `ped-airway` | 11 | Stub | Placeholder — not yet implemented |
| `ped-cardiac` | 11 | Stub | Placeholder — not yet implemented |
| `ped-neonatal` | 11 | Stub | Placeholder — should expose GA calc, surfactant dosing |
| `ped-sepsis` | 11 | Stub | Placeholder — not yet implemented |
| `ped-trauma` | 11 | Stub | Placeholder — not yet implemented |

**WASM build:** `wasm-pack build --target web --out-dir apps/web/wasm-pkg --release crates/ped-wasm`
CI workflow: `.github/workflows/build-wasm.yml` (triggers on push to `crates/`)

### rust-sci-core Modules (external — `timothyhartzog/rust-sci-core`)

60 Rust modules tracked in `knowledge/registry.json`. Includes: `acid_base`, `scoring` (Phoenix, pSOFA, PELOD-2), `neonatal`, `neonatal_scoring` (Finnegan, Silverman, Downes), `emergency` (PALS, NRP, RSI, DKA, anaphylaxis), `trauma` (PECARN, PTS, BIG, GCS), `renal`, `fluids`, `ventilation`, `oxygenation`, `pain_sedation`, `pews`, `hemodynamics`, `nutrition`, `dosing`, `anthropometrics`, `conversions`, and more.

---

## Knowledge Registries

Two separate registries exist:

### 1. `knowledge/registry.json` (root — source of truth for modules)
| Field | Value |
|---|---|
| Schema | `1.0.0` |
| Total entries | 150 |
| Last updated | 2026-03-26 |
| Breakdown | 60 modules · 36 decision trees · 30 education guides · 14 textbooks · 4 calculators · 3 audio textbooks · 1 literature review · 1 protocol · 1 source document |

### 2. `apps/web/static/knowledge/registry.json` (app-served — powers UI)
| Field | Value |
|---|---|
| Schema | `knowledge_registry_v1` |
| Total entries | 115 |
| Last updated | 2026-03-31 |
| Active | 86 (41 trees + 14 guides + 14 textbooks + 14 audio + 3 calculators) |
| Draft | 29 (planned education guides 01–22) |
| Serves | `/reference/knowledge` and `/admin/knowledge` |

---

## Git History Summary

| Date | Commit | Change |
|---|---|---|
| 2026-03-31 | `5073d09` | **feat:** add knowledge registry, mark all 41 trees JSON-migrated |
| 2026-03-31 | `5ec07d8` | **feat:** add Clinical Decision Tree Schema v1.0 (CLAUDE.md) |
| 2026-03-31 | `246eb53` | **feat:** fill all 17 missing sidebar nav routes across 6 domains |
| 2026-03-31 | `8f96e9a` | **feat:** add 9 missing clinical route pages (cardiac, trauma, transport, neonatal sub-pages) — PR #10 |
| 2026-03-31 | `591fd8c` | **fix:** resolve all TypeScript/ESLint errors |
| 2026-03-31 | `46c9743` | **test:** add automated GUI testing with Playwright |
| 2026-03-30 | `506412f` | **fix:** SvelteKit build, migrate trees to JSON, improve decision tree UX |
| 2026-03-30 | `dfeeab7` | **fix:** decision tree display and architecture overhaul — PR #8 |
| 2026-03-30 | `f27467d` | **feat:** scoring engine + token badges + NNT fix in all 28 simulation HTML files |
| 2026-03-30 | `ac241ac` | **feat:** add MedSim interactive simulation platform — 19 scenarios |

---

## Open Gaps / Next Steps

### High priority
| Gap | Notes |
|---|---|
| WASM build not run | `crates/ped-wasm` is ready; run `wasm-pack build` or push to `crates/` to trigger CI |
| `ped-neonatal` crate is a stub | Should expose GA calculations, surfactant dosing as WASM bindings |
| 5 domain crates are stubs | `ped-airway`, `ped-cardiac`, `ped-sepsis`, `ped-trauma`, `ped-neonatal` |

### Medium priority
| Gap | Notes |
|---|---|
| 29 numbered education guides (01–22) | Content planned, files not yet created; draft entries exist in knowledge registry |
| Education guide count delta | Root `knowledge/registry.json` has 36 trees; `REGISTRY.json` has 41 (5 trees added after last root registry update) |
| Playwright e2e tests | `playwright.config.ts` + test file exist; need `npm install -D @playwright/test && npx playwright install` |

### Low priority
| Gap | Notes |
|---|---|
| Phoenix Sepsis Score calculator | Tracked in `CALCULATORS_AND_SCORING_SYSTEMS.md`; `sci-clinical/scoring.rs` is implemented |
| `neonatal_glucose_management_dt.json` | 433-line extended DT format in tree-data/; currently no HTML loader specifically for it |
| `/simulations` route not in home domain grid | Simulations exist but aren't linked from the main domain cards |
