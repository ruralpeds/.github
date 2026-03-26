# Peds Project — Roadmap & To-Do List
_Generated: 2026-03-26 | Status assessment from active session_

---

## Architecture Status

### ✅ Completed
- SvelteKit + adapter-static PWA setup
- 9 SvelteKit decision trees with full data/viz separation
- `tree-schema.ts` typed schema + `tree-layout.ts` D3 math layer
- `knowledge/registry.json` with 100 entries, CLI management script
- 38 standalone D3 decision trees (static HTML)
- 60 Rust computation modules in rust-sci-core/sci-clinical
- IVF prescription engine in rust-sci-core (config/, crates/sci-clinical/src/ivf/)
- 28 education guide DOCX files
- 17 textbook DOCX files
- 22 education guides with INDEX.md

---

## 🔴 HIGH PRIORITY

### 1. Separate data from visualization in standalone HTML trees
**Problem:** All 38 standalone trees in `apps/web/static/decision-trees/*.html` are monolithic —
clinical data, D3 rendering, popup content, and CSS fused in a single file per tree.
Updating a dosing table means editing minified HTML.

**Plan:**
- Extract a shared `tree-engine.js` rendering library into `static/decision-trees/`
- Define a `TreeData` JSON schema for standalone trees
- Extract clinical data from each HTML into `*.json` sidecar files
- Each HTML becomes a thin loader: fetch JSON → pass to engine → render

**Files to create:**
- `apps/web/static/decision-trees/tree-engine.js` — shared D3 rendering engine
- `apps/web/static/decision-trees/tree-data/[name].json` — extracted data per tree
- `apps/web/static/decision-trees/tree-loader.html` — thin template loader

### 2. Build admin module
**Problem:** No admin module exists anywhere. Protocol updates require developer file edits.

**Plan:**
- Route at `apps/web/src/routes/admin/`
- Basic password guard (localStorage-based for offline PWA)
- Pages:
  - `/admin` — dashboard: content status, coverage gaps
  - `/admin/trees` — registry browser, edit metadata, mark status
  - `/admin/knowledge` — browse/edit knowledge registry entries
  - `/admin/content` — education guides, textbooks status
- No server required — reads from static JSON files, exports updated JSON

**Files to create:**
- `apps/web/src/routes/admin/+layout.svelte` — auth guard wrapper
- `apps/web/src/routes/admin/+page.svelte` — dashboard
- `apps/web/src/routes/admin/trees/+page.svelte` — tree registry
- `apps/web/src/routes/admin/knowledge/+page.svelte` — knowledge browser
- `apps/web/src/lib/stores/admin.ts` — admin state

### 3. Populate knowledge registry
**Problem:** Registry has 100 entries but is missing 26 education guides, 17 textbooks,
3 calculators, and all literature reviews.

**Current gaps:**
| Category | In Registry | Exist on Disk | Missing |
|---|---|---|---|
| Education guides | 2 | 28 DOCX | 26 |
| Textbooks | 0 | 17 DOCX | 17 |
| Calculators | 0 | 3 HTML | 3 |
| Literature reviews | 0 | 1 DOCX | 1 |
| Audio textbooks | 0 | Several | All |

**Plan:** Run batch import from `scripts/knowledge.sh` + manual entries for content
that doesn't match the auto-import pattern.

---

## 🟡 MEDIUM PRIORITY

### 4. Wire IVF calculator to rust-sci-core
The standalone `neonatal_ivf_prescription_calculator.html` uses hardcoded JS.
rust-sci-core now has the full IVF engine in `crates/sci-clinical/src/ivf/`.
Need: ped-wasm WASM bindings, WASM loader in the HTML, JSON config fetch.

### 5. Convert textbook-data.js → TypeScript TextbookSection schema
`apps/web/src/lib/data/textbook/textbook-data.js` is raw JS with no types.
Should match `TextbookSection` interface in `tree-schema.ts`.

### 6. Convert calculators-registry.js → TypeScript with WASM bindings
`apps/web/src/lib/data/calculators/calculators-registry.js` — no types, no WASM connection.

### 7. Connect knowledge registry to app UI
`/reference/knowledge` route with search, filter by category, and deep links to content.

### 8. Push pending Peds changes
IVF calculator HTML and REGISTRY.json update staged but not pushed.
Run: `cd Peds && git add -A && git commit && git push`

---

## 🟢 LOWER PRIORITY

### 9. Remaining high-priority decision trees
From MIGRATION_STATUS.md — most relevant to Level II nursery:
- Difficult Airway algorithm
- Neonatal Hypoglycemia
- Neonatal Seizures
- Neonatal EOS Sepsis pathway
- Respiratory Escalation / NIV Management

### 10. Complete renal.rs migration to rust-sci-core
dialysis params, RTA differentiation, TTKG, UACR/UPCR, FE-HCO3, FE-K, FE-P
(~725-line module, partially covered by existing renal.rs)

### 11. e2e test suite
Playwright tests for SvelteKit routes — nothing exists yet.

### 12. IVF sparkline matrix → Peds
`IVFSparklineMatrix.svelte` built but not yet integrated into the app's route structure.

---

## Notes for Future Sessions

- rust-sci-core IVF engine: `config/ivf_*.toml` + `crates/sci-clinical/src/ivf/`
  Push confirmed: `3cc1402..c91501e` on 2026-03-26
- IVF Prescription Calculator HTML: `neonatal_ivf_prescription_calculator.html` (68KB)
  Staged in Peds, not yet pushed as of 2026-03-26
- Knowledge system CLI: `./scripts/knowledge.sh` — has add/modify/list/search/validate/import commands
- Standalone tree format: `apps/web/static/decision-trees/REGISTRY.json` tracks all 38 trees
- Admin module: nothing exists — start from scratch at `src/routes/admin/`
