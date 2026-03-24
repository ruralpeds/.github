# Pediatric Emergency CDS

Clinical Decision Support for Pediatric Emergency Medicine in the Rural Emergency Department.

## Architecture

```
Frontend:  SvelteKit + D3.js + svelte-maplibre
Compute:   Rust/WASM via wasm-pack
Science:   rust-sci-core (git dependency, pulled at build time)
Delivery:  Static PWA (offline-first)
Theming:   CSS custom properties with runtime switching
```

**Dependency chain:**
```
SvelteKit UI → WASM bridge → ped-wasm → ped-* crates → rust-sci-core (sci-*)
                                                          ↓
                                              github.com/timothyhartzog/rust-sci-core
                                              ├── sci-units      (unit conversions)
                                              ├── sci-stats      (statistical functions)
                                              ├── sci-clinical   (clinical calculations)
                                              ├── sci-growth     (growth chart curves)
                                              └── sci-wasm       (wasm bindings)
```

**Key principles:**
- rust-sci-core owns all clinical math. ped-* crates are thin mode-aware wrappers.
- Mode (neonatal/pediatric) is set once in the UI and flows through every computation.
- No clinical math in JavaScript. No DOM rendering in Rust.
- Cargo pulls rust-sci-core from GitHub on `wasm-pack build`. No vendoring needed.

## Quick Start

```bash
# Build WASM
cd crates/ped-wasm
wasm-pack build --target web --out-dir ../../apps/web/wasm-pkg

# Start dev server
cd apps/web
npm install
npm run dev
```

## Project Structure

```
pediatric-ed-cds/
├── apps/web/               # SvelteKit frontend
│   └── src/
│       ├── lib/
│       │   ├── components/  # Reusable UI components
│       │   ├── theme/       # Token-based theming system
│       │   ├── wasm/        # WASM bridge layer
│       │   ├── stores/      # Svelte stores (patient session, etc.)
│       │   └── d3/          # D3 utilities and helpers
│       └── routes/          # Clinical domain routes
├── crates/                  # Rust workspace
│   ├── ped-core/            # Shared types, weight classification, vital ranges
│   ├── ped-resus/           # Resuscitation drug dosing, fluid calculations
│   ├── ped-airway/          # Airway management algorithms
│   ├── ped-sepsis/          # Sepsis pathways
│   ├── ped-neonatal/        # Neonatal-specific logic
│   ├── ped-cardiac/         # Cardiac emergency algorithms
│   ├── ped-trauma/          # Trauma assessment calculations
│   └── ped-wasm/            # wasm-bindgen entry point
└── Cargo.toml               # Rust workspace root
```

## Theming

The app ships with three presets: Clinical Light (default), Clinical Dark, and High Contrast. Custom themes can be created as JSON objects — see `apps/web/src/lib/theme/CUSTOM_THEMES.md`.

**Safety rule:** Clinical severity colors (red=emergency, orange=urgent, yellow=warning, green=stable) are constant across all themes for patient safety.

## Offline Support

All clinical calculators work without network connectivity. The WASM bundle, static assets, and fonts are cached by the service worker on first load.
