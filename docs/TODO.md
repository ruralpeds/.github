# Peds Project — Roadmap & To-Do List
_Last updated: 2026-03-26 | Commit f065db9 (Track B) + Track C in progress_

---

## ✅ Completed

| Track | Commit | What |
|---|---|---|
| High Priority #1 — Knowledge registry population | b3a9662 | 100→150 entries |
| High Priority #2 — Admin module | b3a9662 | /admin, /admin/trees, /admin/knowledge |
| High Priority #3 — Data/viz separation foundation | b3a9662 | tree-engine.js + loader template + first JSON |
| **Track A — All 36 trees migrated** | 77d2d9f | 36/36 trees · 37 data files · 450KB clinical data extracted |
| **Track B — IVF WASM integration** | f065db9 | ped-wasm bindings, ivf.ts, HTML progressive enhancement, CI |
| **Track C — TS types + knowledge UI** | (this session) | textbook-types.ts, calculators-registry.ts, /reference/knowledge |

---

## 🟡 REMAINING MEDIUM PRIORITY

### Wire IVF to WASM — needs actual wasm-pack build
CI workflow exists (.github/workflows/build-wasm.yml). To trigger:
- Push to main with changes to crates/ — CI auto-builds and commits wasm-pkg/
- OR: `wasm-pack build --target web --out-dir apps/web/wasm-pkg --release crates/ped-wasm`
Once wasm-pkg/ exists, the HTML calculator auto-upgrades to WASM engine on load.

### Admin content page (/admin/content)
Education guides + textbooks status with associated tree links.
Files: apps/web/src/routes/admin/content/+page.svelte

---

## 🟢 LOWER PRIORITY

### New clinical decision trees (Level II nursery gaps)
- Difficult Airway algorithm
- Neonatal EOS Sepsis pathway
- Neonatal Seizures
- Respiratory Escalation / NIV titration

### Complete renal.rs migration to rust-sci-core
dialysis params, RTA, TTKG, UACR/UPCR, FE-HCO3, FE-K, FE-P

### e2e test suite
Playwright tests for SvelteKit routes

### IVF sparkline matrix integration
IVFSparklineMatrix.svelte built but not in app route structure

---

## Session Notes (2026-03-26)

**rust-sci-core IVF push:** `3cc1402..c91501e`
**Peds pushes:**
- b3a9662 — admin module + knowledge registry + tree-engine.js
- 77d2d9f — Track A: all 36 trees data/viz separated
- f065db9 — Track B: ped-wasm IVF bindings + ivf.ts + HTML + CI

**Data files location:** apps/web/static/decision-trees/tree-data/
**Admin PIN default:** 1234 (change via admin.ts changePin())
**WASM build:** .github/workflows/build-wasm.yml auto-triggers on crates/ changes
