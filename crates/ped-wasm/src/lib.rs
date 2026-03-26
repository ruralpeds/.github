//! ped-wasm: WebAssembly entry point for the Pediatric Emergency CDS.
//!
//! This crate exposes all clinical functions to the SvelteKit frontend via
//! wasm-bindgen. Every function accepts a `mode` parameter ("neonatal" or
//! "pediatric") so the frontend's mode store drives computation dispatch.
//!
//! Error handling: All public functions return a structured WasmResult envelope
//! `{ ok: T }` on success or `{ error: { code, message, context } }` on failure.
//! The frontend WASM bridge unwraps these into typed results or WasmError throws.
//!
//! Computation flow:
//!   SvelteKit → ped-wasm (WASM boundary) → ped-* crates → sci-* crates (rust-sci-core)
//!
//! Build: wasm-pack build --target web --out-dir ../../apps/web/wasm-pkg

use serde::Serialize;
use wasm_bindgen::prelude::*;
use ped_core::{ClinicalMode, Sex};

// =============================================================================
// Structured Error Envelope
// =============================================================================

/// Error codes passed across the WASM boundary.
/// The frontend maps these to user-facing messages and recovery actions.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum WasmErrorCode {
    /// Input failed validation (weight out of range, unknown drug, etc.)
    ValidationError,
    /// Serialization between Rust and JS failed
    SerializationError,
    /// A computation produced an unexpected result (NaN, overflow, etc.)
    ComputationError,
    /// The requested function or feature is not yet implemented
    NotImplemented,
}

#[derive(Debug, Clone, Serialize)]
pub struct WasmError {
    pub code: WasmErrorCode,
    pub message: String,
    /// The function that produced this error
    pub function: String,
    /// Key-value pairs of input parameters for debugging
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub context: Vec<(String, String)>,
}

/// Envelope type serialized across the WASM boundary.
/// The frontend checks for the presence of `ok` vs `error` fields.
#[derive(Debug, Serialize)]
#[serde(untagged)]
enum WasmResult<T: Serialize> {
    Ok { ok: T },
    Err { error: WasmError },
}

/// Serialize a successful result into a JS-compatible envelope.
fn wasm_ok<T: Serialize>(value: &T, function: &str) -> JsValue {
    match serde_wasm_bindgen::to_value(&WasmResult::Ok { ok: value }) {
        Ok(js) => js,
        Err(e) => wasm_err(
            WasmErrorCode::SerializationError,
            &format!("Failed to serialize result: {}", e),
            function,
            vec![],
        ),
    }
}

/// Serialize an error into a JS-compatible envelope.
fn wasm_err(
    code: WasmErrorCode,
    message: &str,
    function: &str,
    context: Vec<(String, String)>,
) -> JsValue {
    let err = WasmResult::<()>::Err {
        error: WasmError {
            code,
            message: message.to_string(),
            function: function.to_string(),
            context,
        },
    };
    // If even error serialization fails, fall back to a plain JS error string
    serde_wasm_bindgen::to_value(&err).unwrap_or_else(|_| {
        JsValue::from_str(&format!("{{\"error\":{{\"code\":\"SERIALIZATION_ERROR\",\"message\":\"{}\",\"function\":\"{}\"}}}}", message, function))
    })
}

// =============================================================================
// Input Validation
// =============================================================================

fn validate_weight(weight_kg: f64, function: &str) -> Option<JsValue> {
    if weight_kg.is_nan() || weight_kg.is_infinite() {
        return Some(wasm_err(
            WasmErrorCode::ValidationError,
            "Weight must be a finite number",
            function,
            vec![("weight_kg".into(), format!("{}", weight_kg))],
        ));
    }
    if weight_kg <= 0.0 {
        return Some(wasm_err(
            WasmErrorCode::ValidationError,
            "Weight must be greater than 0",
            function,
            vec![("weight_kg".into(), format!("{}", weight_kg))],
        ));
    }
    if weight_kg > 300.0 {
        return Some(wasm_err(
            WasmErrorCode::ValidationError,
            "Weight exceeds maximum (300 kg)",
            function,
            vec![("weight_kg".into(), format!("{}", weight_kg))],
        ));
    }
    None
}

fn validate_age(age_months: u16, function: &str) -> Option<JsValue> {
    if age_months > 216 {
        return Some(wasm_err(
            WasmErrorCode::ValidationError,
            "Age exceeds maximum (216 months / 18 years)",
            function,
            vec![("age_months".into(), format!("{}", age_months))],
        ));
    }
    None
}

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
/// Returns a WasmResult envelope with PatientSession or structured error.
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
    let func = "create_patient_session";
    if let Some(err) = validate_weight(weight_kg, func) { return err; }
    if let Some(err) = validate_age(age_months, func) { return err; }

    let session = ped_core::PatientSession::new(
        parse_mode(mode),
        weight_kg,
        age_months,
        parse_sex(sex),
        gestational_weeks,
        gestational_days,
        day_of_life,
    );
    wasm_ok(&session, func)
}

// =============================================================================
// Equipment Sizing
// =============================================================================

/// Get mode-appropriate equipment sizing for a weight/age.
#[wasm_bindgen]
pub fn get_equipment_sizing(mode: &str, weight_kg: f64, age_months: u16) -> JsValue {
    let func = "get_equipment_sizing";
    if let Some(err) = validate_weight(weight_kg, func) { return err; }
    if let Some(err) = validate_age(age_months, func) { return err; }

    let result = ped_core::get_equipment_sizing(weight_kg, age_months, parse_mode(mode));
    wasm_ok(&result, func)
}

/// Get Broselow classification (pediatric mode only).
/// Returns null in neonatal mode.
#[wasm_bindgen]
pub fn classify_broselow(weight_kg: f64) -> JsValue {
    let func = "classify_broselow";
    if let Some(err) = validate_weight(weight_kg, func) { return err; }

    let result = ped_core::classify_broselow(weight_kg);
    wasm_ok(&result, func)
}

// =============================================================================
// Vital Signs
// =============================================================================

/// Get age-appropriate vital sign normal ranges, adjusted for mode.
#[wasm_bindgen]
pub fn get_vital_ranges(mode: &str, age_months: u16) -> JsValue {
    let func = "get_vital_ranges";
    if let Some(err) = validate_age(age_months, func) { return err; }

    let result = ped_core::get_vital_ranges(age_months, parse_mode(mode));
    wasm_ok(&result, func)
}

// =============================================================================
// Drug Dosing (ped-resus) — mode dispatches to NRP or PALS
// =============================================================================

/// Calculate a single drug dose. Mode determines NRP vs PALS formulary.
#[wasm_bindgen]
pub fn calculate_dose(mode: &str, drug: &str, weight_kg: f64, age_months: u16) -> JsValue {
    let func = "calculate_dose";
    if let Some(err) = validate_weight(weight_kg, func) { return err; }
    if let Some(err) = validate_age(age_months, func) { return err; }

    if drug.trim().is_empty() {
        return wasm_err(
            WasmErrorCode::ValidationError,
            "Drug name cannot be empty",
            func,
            vec![],
        );
    }

    let result = ped_resus::calculate_dose(drug, weight_kg, age_months, parse_mode(mode));
    wasm_ok(&result, func)
}

/// Calculate all resuscitation drug doses for a patient at once.
/// Returns an array of DoseResult objects for the mode's full formulary.
#[wasm_bindgen]
pub fn calculate_all_doses(mode: &str, weight_kg: f64, age_months: u16) -> JsValue {
    let func = "calculate_all_doses";
    if let Some(err) = validate_weight(weight_kg, func) { return err; }
    if let Some(err) = validate_age(age_months, func) { return err; }

    let m = parse_mode(mode);
    let drugs = ped_resus::get_drug_list(m);
    let results: Vec<_> = drugs
        .iter()
        .map(|d| ped_resus::calculate_dose(d, weight_kg, age_months, m))
        .collect();
    wasm_ok(&results, func)
}

/// Calculate fluid bolus volume. Mode sets default mL/kg (NRP=10, PALS=20).
#[wasm_bindgen]
pub fn calculate_fluid_bolus(
    mode: &str,
    weight_kg: f64,
    fluid_type: &str,
    ml_per_kg: Option<f64>,
) -> JsValue {
    let func = "calculate_fluid_bolus";
    if let Some(err) = validate_weight(weight_kg, func) { return err; }

    if fluid_type.trim().is_empty() {
        return wasm_err(
            WasmErrorCode::ValidationError,
            "Fluid type cannot be empty",
            func,
            vec![],
        );
    }

    if let Some(rate) = ml_per_kg {
        if rate <= 0.0 || rate.is_nan() || rate.is_infinite() {
            return wasm_err(
                WasmErrorCode::ValidationError,
                "mL/kg must be a positive finite number",
                func,
                vec![("ml_per_kg".into(), format!("{}", rate))],
            );
        }
    }

    let result = ped_resus::calculate_fluid_bolus(weight_kg, fluid_type, ml_per_kg, parse_mode(mode));
    wasm_ok(&result, func)
}

/// Get the list of available drugs for a mode.
#[wasm_bindgen]
pub fn get_drug_list(mode: &str) -> JsValue {
    let func = "get_drug_list";
    let list = ped_resus::get_drug_list(parse_mode(mode));
    wasm_ok(&list, func)
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
    let func = "calculate_percentile";
    if let Some(err) = validate_age(age_months, func) { return err; }

    if value.is_nan() || value.is_infinite() || value <= 0.0 {
        return wasm_err(
            WasmErrorCode::ValidationError,
            "Measurement value must be a positive finite number",
            func,
            vec![
                ("measurement".into(), measurement.to_string()),
                ("value".into(), format!("{}", value)),
            ],
        );
    }

    let valid_measurements = ["weight", "length", "head_circumference"];
    if !valid_measurements.contains(&measurement) {
        return wasm_err(
            WasmErrorCode::ValidationError,
            &format!(
                "Unknown measurement type '{}'. Expected one of: {}",
                measurement,
                valid_measurements.join(", ")
            ),
            func,
            vec![("measurement".into(), measurement.to_string())],
        );
    }

    let result = ped_core::calculate_percentile(
        parse_mode(mode),
        measurement,
        value,
        age_months,
        parse_sex(sex),
        gestational_weeks,
    );

    // calculate_percentile returns Option<GrowthResult> — None means no data available
    match result {
        Some(r) => wasm_ok(&r, func),
        None => wasm_ok(&Option::<ped_core::GrowthResult>::None, func),
    }
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

// =============================================================================
// Neonatal IVF Prescription Calculator
// =============================================================================
//
// Exposes the full sci-clinical::ivf engine to JavaScript.
// All clinical protocol values live in TOML config files — not in source code.
// The WASM module ships with embedded defaults (include_str! at compile time).
// Pass custom TOML strings via ivf_with_custom_config() for runtime hot-update.
//
// Call pattern from JS:
//   const rx = JSON.parse(wasm.ivf_calculate(JSON.stringify({ weight_grams, ... })));
//   const full = JSON.parse(wasm.ivf_calculate_with_nutrition(JSON.stringify(rx), JSON.stringify(nutrition)));

use sci_clinical::ivf::{IvfCalculator, PatientContext, NutritionInput};
use sci_clinical::ivf::config::IvfConfig;

/// Calculate the base IVF prescription from patient context.
///
/// Input JSON:
/// ```json
/// {
///   "weight_grams": 1200,            // grams — NICU scale entry unit
///   "gestational_age_weeks": 28,
///   "day_of_life": 2,
///   "condition": "stable",           // stable|rds|sepsis|nec|pphn|postop
///   "environment": "isolette",       // isolette|warmer|photo1|photo2
///   "dextrose_percent": 10.0
/// }
/// ```
///
/// Returns `{ ok: IvfPrescription }` or `{ error: WasmError }`.
#[wasm_bindgen]
pub fn ivf_calculate(ctx_json: &str) -> JsValue {
    let func = "ivf_calculate";
    let ctx: PatientContext = match serde_json::from_str(ctx_json) {
        Ok(c) => c,
        Err(e) => return wasm_err(
            WasmErrorCode::ValidationError,
            &format!("Invalid patient context JSON: {}", e),
            func,
            vec![("input_length".into(), ctx_json.len().to_string())],
        ),
    };
    let calc = IvfCalculator::with_defaults();
    match calc.calculate(&ctx) {
        Ok(rx) => wasm_ok(&rx, func),
        Err(e) => wasm_err(
            WasmErrorCode::ValidationError,
            &e.to_string(),
            func,
            vec![
                ("weight_grams".into(), ctx.weight_grams.to_string()),
                ("ga_weeks".into()    , ctx.gestational_age_weeks.to_string()),
                ("dol".into()         , ctx.day_of_life.to_string()),
            ],
        ),
    }
}

/// Add the full nutrition layer to a base prescription.
///
/// `base_rx_json` — JSON string from a previous `ivf_calculate` call.
///
/// `nutrition_json`:
/// ```json
/// {
///   "net_ivf_ml_day": 80.0,
///   "ivfe_dose_g_kg_day": 2.0,
///   "ivfe_percent": 20.0,
///   "aa_dose_g_kg_day": 2.5,
///   "enteral_kcal_day": 54.0,
///   "enteral_ml_day": 80.0
/// }
/// ```
///
/// Returns `{ ok: IvfPrescription }` (with calorie_breakdown populated).
#[wasm_bindgen]
pub fn ivf_calculate_with_nutrition(base_rx_json: &str, nutrition_json: &str) -> JsValue {
    use sci_clinical::ivf::IvfPrescription;
    let func = "ivf_calculate_with_nutrition";
    let base: IvfPrescription = match serde_json::from_str(base_rx_json) {
        Ok(r) => r,
        Err(e) => return wasm_err(
            WasmErrorCode::ValidationError,
            &format!("Invalid base prescription JSON: {}", e),
            func, vec![],
        ),
    };
    let nutrition: NutritionInput = match serde_json::from_str(nutrition_json) {
        Ok(n) => n,
        Err(e) => return wasm_err(
            WasmErrorCode::ValidationError,
            &format!("Invalid nutrition input JSON: {}", e),
            func, vec![],
        ),
    };
    let calc = IvfCalculator::with_defaults();
    let full_rx = calc.calculate_with_nutrition(&base, &nutrition);
    wasm_ok(&full_rx, func)
}

/// Apply a manual fluid rate override (clinician adjusts from protocol default).
///
/// Returns updated `{ ok: IvfPrescription }` with recalculated pump rate, GIR, tier.
#[wasm_bindgen]
pub fn ivf_apply_rate_override(
    base_rx_json: &str,
    manual_rate_ml_kg_day: f64,
    dextrose_percent: f64,
) -> JsValue {
    use sci_clinical::ivf::IvfPrescription;
    let func = "ivf_apply_rate_override";
    let base: IvfPrescription = match serde_json::from_str(base_rx_json) {
        Ok(r) => r,
        Err(e) => return wasm_err(
            WasmErrorCode::ValidationError,
            &format!("Invalid base prescription JSON: {}", e),
            func, vec![],
        ),
    };
    if manual_rate_ml_kg_day <= 0.0 || manual_rate_ml_kg_day > 250.0 {
        return wasm_err(
            WasmErrorCode::ValidationError,
            &format!("Rate {:.1} out of range (0–250 mL/kg/day)", manual_rate_ml_kg_day),
            func,
            vec![("rate".into(), manual_rate_ml_kg_day.to_string())],
        );
    }
    let calc = IvfCalculator::with_defaults();
    let rx = calc.apply_rate_override(&base, manual_rate_ml_kg_day, dextrose_percent);
    wasm_ok(&rx, func)
}

/// Calculate IVFE (IV fat emulsion) pump parameters.
///
/// Returns `{ ok: { ml_per_day, ml_per_hr, kcal_per_day } }`.
#[wasm_bindgen]
pub fn ivf_ivfe_params(
    dose_g_kg_day: f64,
    weight_grams: f64,
    concentration_pct: f64,
) -> JsValue {
    use sci_clinical::ivf::nutrition::ivfe_parameters;
    let func = "ivf_ivfe_params";
    if weight_grams < 100.0 || weight_grams > 8000.0 {
        return wasm_err(
            WasmErrorCode::ValidationError,
            &format!("Weight {:.0}g out of range (100–8000g)", weight_grams),
            func, vec![("weight_grams".into(), weight_grams.to_string())],
        );
    }
    let cfg = IvfConfig::embedded_defaults();
    let wt_kg = weight_grams / 1000.0;
    let (ml_day, ml_hr, kcal_day) = ivfe_parameters(dose_g_kg_day, wt_kg, concentration_pct, &cfg.nutrition);
    #[derive(serde::Serialize)]
    struct IvfeResult { ml_per_day: f64, ml_per_hr: f64, kcal_per_day: f64 }
    wasm_ok(&IvfeResult { ml_per_day: ml_day, ml_per_hr: ml_hr, kcal_per_day: kcal_day }, func)
}

/// Calculate bolus enteral feed totals.
///
/// Returns `{ ok: { ml_per_day, kcal_per_day } }`.
#[wasm_bindgen]
pub fn ivf_bolus_feed_kcal(
    feed_type: &str,
    ml_per_feed: f64,
    feeds_per_day: f64,
) -> JsValue {
    use sci_clinical::ivf::nutrition::BolusFeed;
    let func = "ivf_bolus_feed_kcal";
    let cfg  = IvfConfig::embedded_defaults();
    let feed = BolusFeed { feed_type: feed_type.to_string(), ml_per_feed, feeds_per_day };
    let ml_day   = feed.ml_per_day();
    let kcal_day = feed.kcal_per_day(&cfg.nutrition);
    #[derive(serde::Serialize)]
    struct FeedResult { ml_per_day: f64, kcal_per_day: f64 }
    wasm_ok(&FeedResult { ml_per_day: ml_day, kcal_per_day: kcal_day }, func)
}

/// Calculate continuous enteral feed totals.
///
/// Returns `{ ok: { ml_per_day, kcal_per_day } }`.
#[wasm_bindgen]
pub fn ivf_continuous_feed_kcal(feed_type: &str, ml_per_hr: f64) -> JsValue {
    use sci_clinical::ivf::nutrition::ContinuousFeed;
    let func = "ivf_continuous_feed_kcal";
    let cfg  = IvfConfig::embedded_defaults();
    let feed = ContinuousFeed { feed_type: feed_type.to_string(), ml_per_hr };
    let ml_day   = feed.ml_per_day();
    let kcal_day = feed.kcal_per_day(&cfg.nutrition);
    #[derive(serde::Serialize)]
    struct FeedResult { ml_per_day: f64, kcal_per_day: f64 }
    wasm_ok(&FeedResult { ml_per_day: ml_day, kcal_per_day: kcal_day }, func)
}
