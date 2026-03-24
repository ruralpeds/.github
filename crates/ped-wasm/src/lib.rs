//! ped-wasm: WebAssembly entry point for the Pediatric Emergency CDS.
//!
//! This crate exposes all clinical functions to the SvelteKit frontend via
//! wasm-bindgen. Every function accepts a `mode` parameter ("neonatal" or
//! "pediatric") so the frontend's mode store drives computation dispatch.
//!
//! Computation flow:
//!   SvelteKit → ped-wasm (WASM boundary) → ped-* crates → sci-* crates (rust-sci-core)
//!
//! Build: wasm-pack build --target web --out-dir ../../apps/web/wasm-pkg

use wasm_bindgen::prelude::*;
use ped_core::{ClinicalMode, Sex};

// =============================================================================
// Helpers
// =============================================================================

fn parse_mode(mode: &str) -> ClinicalMode {
    match mode {
        "neonatal" | "neo" => ClinicalMode::Neonatal,
        _ => ClinicalMode::Pediatric,
    }
}

fn parse_sex(sex: &str) -> Sex {
    match sex {
        "female" | "f" => Sex::Female,
        _ => Sex::Male,
    }
}

// =============================================================================
// Patient Session — creates a complete patient context from banner input
// =============================================================================

/// Create a full patient session with computed vitals, equipment, and classification.
/// This is called once when the user clicks "Load Patient" in the banner.
/// Returns a PatientSession object with everything the UI needs.
#[wasm_bindgen]
pub fn create_patient_session(
    mode: &str,
    weight_kg: f64,
    age_months: u16,
    sex: &str,
    gestational_weeks: Option<u16>,
    gestational_days: Option<u16>,
    day_of_life: Option<u16>,
) -> JsValue {
    let session = ped_core::PatientSession::new(
        parse_mode(mode),
        weight_kg,
        age_months,
        parse_sex(sex),
        gestational_weeks,
        gestational_days,
        day_of_life,
    );
    serde_wasm_bindgen::to_value(&session).unwrap_or(JsValue::NULL)
}

// =============================================================================
// Equipment Sizing
// =============================================================================

/// Get mode-appropriate equipment sizing for a weight/age.
#[wasm_bindgen]
pub fn get_equipment_sizing(mode: &str, weight_kg: f64, age_months: u16) -> JsValue {
    let result = ped_core::get_equipment_sizing(weight_kg, age_months, parse_mode(mode));
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

/// Get Broselow classification (pediatric mode only).
/// Returns null in neonatal mode.
#[wasm_bindgen]
pub fn classify_broselow(weight_kg: f64) -> JsValue {
    let result = ped_core::classify_broselow(weight_kg);
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

// =============================================================================
// Vital Signs
// =============================================================================

/// Get age-appropriate vital sign normal ranges, adjusted for mode.
#[wasm_bindgen]
pub fn get_vital_ranges(mode: &str, age_months: u16) -> JsValue {
    let result = ped_core::get_vital_ranges(age_months, parse_mode(mode));
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

// =============================================================================
// Drug Dosing (ped-resus) — mode dispatches to NRP or PALS
// =============================================================================

/// Calculate a single drug dose. Mode determines NRP vs PALS formulary.
#[wasm_bindgen]
pub fn calculate_dose(mode: &str, drug: &str, weight_kg: f64, age_months: u16) -> JsValue {
    let result = ped_resus::calculate_dose(drug, weight_kg, age_months, parse_mode(mode));
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

/// Calculate all resuscitation drug doses for a patient at once.
/// Returns an array of DoseResult objects for the mode's full formulary.
#[wasm_bindgen]
pub fn calculate_all_doses(mode: &str, weight_kg: f64, age_months: u16) -> JsValue {
    let m = parse_mode(mode);
    let drugs = ped_resus::get_drug_list(m);
    let results: Vec<_> = drugs
        .iter()
        .map(|d| ped_resus::calculate_dose(d, weight_kg, age_months, m))
        .collect();
    serde_wasm_bindgen::to_value(&results).unwrap_or(JsValue::NULL)
}

/// Calculate fluid bolus volume. Mode sets default mL/kg (NRP=10, PALS=20).
#[wasm_bindgen]
pub fn calculate_fluid_bolus(
    mode: &str,
    weight_kg: f64,
    fluid_type: &str,
    ml_per_kg: Option<f64>,
) -> JsValue {
    let result = ped_resus::calculate_fluid_bolus(weight_kg, fluid_type, ml_per_kg, parse_mode(mode));
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

/// Get the list of available drugs for a mode.
#[wasm_bindgen]
pub fn get_drug_list(mode: &str) -> JsValue {
    let list = ped_resus::get_drug_list(parse_mode(mode));
    serde_wasm_bindgen::to_value(&list).unwrap_or(JsValue::NULL)
}

// =============================================================================
// Growth Charts (sci-growth via ped-core)
// =============================================================================

/// Calculate growth percentile. Dispatches to WHO or Fenton based on mode/GA.
#[wasm_bindgen]
pub fn calculate_percentile(
    mode: &str,
    measurement: &str,
    value: f64,
    age_months: u16,
    sex: &str,
    gestational_weeks: Option<u16>,
) -> JsValue {
    let result = ped_core::calculate_percentile(
        parse_mode(mode),
        measurement,
        value,
        age_months,
        parse_sex(sex),
        gestational_weeks,
    );
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

// =============================================================================
// Direct sci-* access for calculations not yet wrapped by ped-* crates
// =============================================================================

// These functions expose rust-sci-core directly for calculations that don't
// need mode-aware wrapping. As ped-* crates grow, move these into the
// appropriate crate.

// Example: unit conversion
// #[wasm_bindgen]
// pub fn convert_temp(value: f64, from: &str, to: &str) -> f64 {
//     sci_units::temperature::convert(value, from, to)
// }

// Example: statistical calculation
// #[wasm_bindgen]
// pub fn z_score_to_percentile(z: f64) -> f64 {
//     sci_stats::normal::cdf(z)
// }

// =============================================================================
// Future module exports — uncomment as ped-* crates are implemented
// =============================================================================

// ped-airway (Phase 3, Week 6–7)
// #[wasm_bindgen]
// pub fn calculate_rsi_doses(mode: &str, weight_kg: f64, age_months: u16) -> JsValue { ... }

// ped-sepsis (Phase 3, Week 8–9)
// #[wasm_bindgen]
// pub fn calculate_sepsis_score(mode: &str, params: JsValue) -> JsValue { ... }

// ped-neonatal (Phase 3, Week 8–9)
// #[wasm_bindgen]
// pub fn calculate_gestational_age(lmp_date: &str) -> JsValue { ... }
// pub fn calculate_surfactant_dose(weight_kg: f64, product: &str) -> JsValue { ... }

// ped-cardiac (Phase 3, Week 10–11)
// #[wasm_bindgen]
// pub fn calculate_cardioversion_energy(mode: &str, weight_kg: f64, rhythm: &str) -> JsValue { ... }

// ped-trauma (Phase 3, Week 10–11)
// #[wasm_bindgen]
// pub fn calculate_gcs(eye: u8, verbal: u8, motor: u8) -> JsValue { ... }
// pub fn estimate_burn_bsa(mode: &str, age_months: u16, regions: JsValue) -> JsValue { ... }
