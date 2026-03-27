# Peds Project — Roadmap & To-Do List
_Last updated: 2026-03-26 | All planned tracks complete_

---

## ✅ Completed (all sessions)

| Commit | What |
|---|---|
| b3a9662 | Admin module (3 pages), knowledge registry 100→150, tree-engine.js |
| 77d2d9f | Track A: 36/36 trees data/viz separated, 37 data files |
| f065db9 | Track B: ped-wasm IVF bindings, ivf.ts, HTML progressive enhancement, CI |
| 06387d0 | Track C: textbook-types.ts, calculators-registry.ts, /reference/knowledge |
| 4f1845f | Track D: 4 new trees (Difficult Airway, EOS Sepsis, Seizures, Resp Escalation) |
| 37c2248 | Next Phase: admin/content, IVF sparkline route, e2e tests, renal.rs extension |
| (this)  | Continue: reference page +6 trees, 5 domain index pages, patient store wired |

---

## ✅ rust-sci-core

| Commit | What |
|---|---|
| c91501e | IVF prescription engine (3 TOML configs + 4 Rust modules) |
| f3cc1d0 | renal.rs: 336→801 lines — FE-HCO3/K/P, TTKG, UAG, RTA classification, PD Kt/V, PET |

---

## 🟡 REMAINING

### WASM build (needed for IVF calculator WASM engine)
CI workflow exists at .github/workflows/build-wasm.yml.
Trigger: push any change to crates/ → CI auto-builds, commits wasm-pkg/.
Local: `wasm-pack build --target web --out-dir apps/web/wasm-pkg --release crates/ped-wasm`

### Stub routes in the nav that have no implementation yet
Several ClinicalNav links point to routes that need SvelteKit pages:
- /neonatal/level-ii, /neonatal/thermoregulation, /neonatal/respiratory
- /neonatal/fluids, /neonatal/jaundice, /neonatal/growth
- /airway/difficult-airway, /airway/neonatal-intubation, /airway/equipment
- /resuscitation/dosing, /resuscitation/defibrillation
- /sepsis/fluids, /sepsis/antibiotics
- /cardiac (domain), /trauma (domain), /transport (domain)
- /reference/formulary, /reference/normals, /reference/equipment

These are content pages that need clinical content authoring.

### ped-neonatal crate
crates/ped-neonatal/src/lib.rs is a stub (placeholder).
Should expose GA calculation, surfactant dosing, and neonatal-specific
clinical functions as WASM bindings.

### e2e tests — needs Playwright installed
tests/e2e/smoke.test.ts exists + playwright.config.ts exist.
Run: cd apps/web && npm install -D @playwright/test && npx playwright install

---

## Key Reference

- Peds repo: timothyhartzog/Peds (branch: main)
- rust-sci-core repo: timothyhartzog/rust-sci-core (branch: main)
- Admin PIN: 1234 (localStorage, change via admin.ts changePin())
- WASM build CI: .github/workflows/build-wasm.yml
- Tree data files: apps/web/static/decision-trees/tree-data/ (37 files)
- Knowledge registry: knowledge/registry.json (150 entries)
- Decision trees: REGISTRY.json (41 trees)
