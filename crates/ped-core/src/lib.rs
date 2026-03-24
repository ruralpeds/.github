//! ped-core: Mode-aware wrapper around rust-sci-core for the Pediatric Emergency CDS.
//!
//! This crate does NOT duplicate clinical math. It re-exports and composes functions
//! from sci-units, sci-clinical, and sci-growth, adding:
//!   - Clinical mode context (neonatal vs pediatric)
//!   - Equipment sizing lookup tables
//!   - Broselow classification (pediatric mode)
//!   - Neonatal-specific gestational age handling
//!
//! All underlying calculations come from rust-sci-core.

use serde::{Deserialize, Serialize};

// Re-export core types from rust-sci-core so downstream crates don't need
// to depend on sci-* directly for basic types.
pub use sci_units;
pub use sci_clinical;
pub use sci_growth;

// =============================================================================
// Clinical Mode
// =============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ClinicalMode {
    Neonatal,
    Pediatric,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Sex {
    Male,
    Female,
}

// =============================================================================
// Patient Session
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatientSession {
    pub mode: ClinicalMode,
    pub weight_kg: f64,
    pub age_months: u16,
    pub sex: Sex,

    // Neonatal-specific
    pub gestational_weeks: Option<u16>,
    pub gestational_days: Option<u16>,
    pub day_of_life: Option<u16>,
    pub corrected_ga_weeks: Option<u16>,

    // Computed from rust-sci-core
    pub vital_ranges: VitalSignRanges,
    pub equipment: EquipmentSizing,
    pub broselow: Option<BrosColor>,
}

impl PatientSession {
    pub fn new(
        mode: ClinicalMode,
        weight_kg: f64,
        age_months: u16,
        sex: Sex,
        gestational_weeks: Option<u16>,
        gestational_days: Option<u16>,
        day_of_life: Option<u16>,
    ) -> Self {
        // Corrected gestational age for neonatal mode
        let corrected_ga_weeks = match (mode, gestational_weeks, day_of_life) {
            (ClinicalMode::Neonatal, Some(ga), Some(dol)) => {
                Some(ga + dol / 7)
            }
            _ => None,
        };

        // Pull vital sign ranges from sci-clinical
        // TODO: Map to actual sci_clinical::get_vital_ranges() signature
        let vital_ranges = get_vital_ranges(age_months, mode);

        // Equipment sizing from weight
        let equipment = get_equipment_sizing(weight_kg, age_months, mode);

        // Broselow only in pediatric mode
        let broselow = match mode {
            ClinicalMode::Pediatric => Some(classify_broselow(weight_kg)),
            ClinicalMode::Neonatal => None,
        };

        Self {
            mode,
            weight_kg,
            age_months,
            sex,
            gestational_weeks,
            gestational_days,
            day_of_life,
            corrected_ga_weeks,
            vital_ranges,
            equipment,
            broselow,
        }
    }
}

// =============================================================================
// Vital Sign Ranges — delegates to sci-clinical
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VitalSignRanges {
    pub heart_rate: (u16, u16),
    pub respiratory_rate: (u16, u16),
    pub systolic_bp: (u16, u16),
    pub diastolic_bp: (u16, u16),
    pub spo2_lower: u16,
    pub temperature: (f64, f64),
}

/// Get age-appropriate vital sign ranges.
/// Wraps sci_clinical vital sign functions with mode-specific adjustments.
pub fn get_vital_ranges(age_months: u16, mode: ClinicalMode) -> VitalSignRanges {
    // TODO: Replace with actual sci_clinical API calls, e.g.:
    //   let hr = sci_clinical::vital_signs::heart_rate_range(age_months);
    //   let rr = sci_clinical::vital_signs::respiratory_rate_range(age_months);
    //   let bp = sci_clinical::vital_signs::blood_pressure_range(age_months);
    //
    // For now, using the same lookup table that will be migrated into sci-clinical.
    // Once sci-clinical exposes these functions, this match block gets replaced
    // with direct calls.

    let base = match age_months {
        0..=1 => VitalSignRanges {
            heart_rate: (100, 180), respiratory_rate: (30, 60),
            systolic_bp: (60, 80), diastolic_bp: (35, 55),
            spo2_lower: 92, temperature: (36.5, 37.5),
        },
        2..=5 => VitalSignRanges {
            heart_rate: (100, 160), respiratory_rate: (30, 55),
            systolic_bp: (65, 90), diastolic_bp: (35, 60),
            spo2_lower: 94, temperature: (36.5, 37.5),
        },
        6..=11 => VitalSignRanges {
            heart_rate: (90, 150), respiratory_rate: (25, 45),
            systolic_bp: (70, 95), diastolic_bp: (40, 65),
            spo2_lower: 94, temperature: (36.5, 37.5),
        },
        12..=35 => VitalSignRanges {
            heart_rate: (80, 140), respiratory_rate: (20, 35),
            systolic_bp: (75, 105), diastolic_bp: (45, 70),
            spo2_lower: 95, temperature: (36.5, 37.5),
        },
        36..=71 => VitalSignRanges {
            heart_rate: (70, 120), respiratory_rate: (18, 28),
            systolic_bp: (80, 110), diastolic_bp: (50, 75),
            spo2_lower: 95, temperature: (36.5, 37.5),
        },
        72..=143 => VitalSignRanges {
            heart_rate: (60, 110), respiratory_rate: (16, 24),
            systolic_bp: (85, 120), diastolic_bp: (55, 80),
            spo2_lower: 95, temperature: (36.5, 37.5),
        },
        _ => VitalSignRanges {
            heart_rate: (55, 100), respiratory_rate: (12, 20),
            systolic_bp: (90, 130), diastolic_bp: (60, 85),
            spo2_lower: 95, temperature: (36.5, 37.5),
        },
    };

    // Neonatal mode adjustments
    if mode == ClinicalMode::Neonatal {
        VitalSignRanges {
            // Neonates tolerate slightly lower SpO2 in first minutes
            spo2_lower: if age_months == 0 { 90 } else { base.spo2_lower },
            ..base
        }
    } else {
        base
    }
}

// =============================================================================
// Equipment Sizing — mode-aware
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EquipmentSizing {
    pub ett_size: f64,
    pub ett_cuffed: bool,
    pub ett_depth_cm: f64,
    pub lma_size: f64,
    pub blade_type: String,
    pub blade_size: String,
    pub suction_catheter_fr: String,
    pub oral_airway_mm: String,
    pub nasal_airway_mm: String,
    pub chest_tube_fr: String,
    pub ng_tube_fr: String,
    pub foley_fr: String,
    pub iv_catheter_ga: String,
    pub io_needle: String,
    pub bp_cuff: String,
    pub mask_size: String,
}

pub fn get_equipment_sizing(weight_kg: f64, age_months: u16, mode: ClinicalMode) -> EquipmentSizing {
    match mode {
        ClinicalMode::Neonatal => get_neonatal_equipment(weight_kg),
        ClinicalMode::Pediatric => get_pediatric_equipment(weight_kg, age_months),
    }
}

fn get_neonatal_equipment(weight_kg: f64) -> EquipmentSizing {
    // Neonatal sizing based on weight, not Broselow
    // TODO: Pull from sci_clinical::equipment::neonatal_sizing(weight_kg)
    // when that function is added to rust-sci-core
    let (ett, depth) = match weight_kg {
        w if w < 1.0 => (2.5, 6.5),
        w if w < 2.0 => (3.0, 7.5),
        w if w < 3.0 => (3.0, 8.5),
        w if w < 3.5 => (3.5, 9.0),
        _ => (3.5, 10.0),
    };

    EquipmentSizing {
        ett_size: ett,
        ett_cuffed: false, // Uncuffed for neonates
        ett_depth_cm: depth,
        lma_size: 1.0,
        blade_type: "Miller".into(),
        blade_size: if weight_kg < 2.5 { "00".into() } else { "0".into() },
        suction_catheter_fr: if weight_kg < 2.0 { "5–6 Fr".into() } else { "6–8 Fr".into() },
        oral_airway_mm: "000 (30mm)".into(),
        nasal_airway_mm: "N/A".into(),
        chest_tube_fr: if weight_kg < 2.0 { "8 Fr".into() } else { "10 Fr".into() },
        ng_tube_fr: if weight_kg < 2.0 { "5 Fr".into() } else { "8 Fr".into() },
        foley_fr: "5 Fr feeding tube".into(),
        iv_catheter_ga: "24 ga".into(),
        io_needle: "15mm EZ-IO (if available)".into(),
        bp_cuff: if weight_kg < 2.5 { "Neonatal size 1".into() } else { "Neonatal size 2".into() },
        mask_size: if weight_kg < 2.5 { "Preterm".into() } else { "Newborn".into() },
    }
}

fn get_pediatric_equipment(weight_kg: f64, age_months: u16) -> EquipmentSizing {
    // Pediatric: use Broselow weight-based + age-based formulas
    // TODO: Pull from sci_clinical::equipment::pediatric_sizing(weight_kg, age_months)
    let bros = classify_broselow(weight_kg);

    // ETT sizing: (age in years / 4) + 3.5 for cuffed
    let age_years = age_months as f64 / 12.0;
    let ett_cuffed_calc = (age_years / 4.0) + 3.5;
    let ett = bros.ett_size.max(ett_cuffed_calc.round() * 0.5 * 2.0); // round to nearest 0.5
    let use_cuffed = age_months >= 12; // Cuffed ETT generally for ≥1 year

    // ETT depth: 3x tube size for oral
    let depth = ett * 3.0;

    EquipmentSizing {
        ett_size: ett,
        ett_cuffed: use_cuffed,
        ett_depth_cm: depth,
        lma_size: bros.lma_size,
        blade_type: if age_months < 24 { "Miller".into() } else { "Mac or Miller".into() },
        blade_size: match weight_kg {
            w if w < 5.0 => "0".into(),
            w if w < 10.0 => "1".into(),
            w if w < 20.0 => "2".into(),
            _ => "3".into(),
        },
        suction_catheter_fr: format!("{} Fr", (ett * 2.0) as u16),
        oral_airway_mm: match weight_kg {
            w if w < 7.0 => "00 (40mm)".into(),
            w if w < 13.0 => "0 (50mm)".into(),
            w if w < 20.0 => "1 (60mm)".into(),
            w if w < 30.0 => "2 (70mm)".into(),
            _ => "3 (80mm)".into(),
        },
        nasal_airway_mm: match weight_kg {
            w if w < 10.0 => "12 Fr".into(),
            w if w < 20.0 => "16 Fr".into(),
            w if w < 30.0 => "20 Fr".into(),
            _ => "24–28 Fr".into(),
        },
        chest_tube_fr: match weight_kg {
            w if w < 5.0 => "10–12 Fr".into(),
            w if w < 12.0 => "16–20 Fr".into(),
            w if w < 25.0 => "20–24 Fr".into(),
            _ => "28–32 Fr".into(),
        },
        ng_tube_fr: match weight_kg {
            w if w < 5.0 => "5 Fr".into(),
            w if w < 12.0 => "8 Fr".into(),
            w if w < 30.0 => "10 Fr".into(),
            _ => "12–14 Fr".into(),
        },
        foley_fr: match weight_kg {
            w if w < 12.0 => "6–8 Fr".into(),
            w if w < 30.0 => "8–10 Fr".into(),
            _ => "10–12 Fr".into(),
        },
        iv_catheter_ga: match weight_kg {
            w if w < 5.0 => "24 ga".into(),
            w if w < 12.0 => "22–24 ga".into(),
            w if w < 30.0 => "20–22 ga".into(),
            _ => "18–20 ga".into(),
        },
        io_needle: match weight_kg {
            w if w < 40.0 => "15mm EZ-IO".into(),
            _ => "25mm EZ-IO".into(),
        },
        bp_cuff: match weight_kg {
            w if w < 5.0 => "Neonatal".into(),
            w if w < 12.0 => "Infant".into(),
            w if w < 20.0 => "Child small".into(),
            w if w < 40.0 => "Child".into(),
            _ => "Adult small".into(),
        },
        mask_size: match weight_kg {
            w if w < 5.0 => "Infant round".into(),
            w if w < 12.0 => "Infant/Toddler".into(),
            w if w < 25.0 => "Child".into(),
            _ => "Adult small".into(),
        },
    }
}

// =============================================================================
// Broselow Classification (Pediatric mode only)
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrosColor {
    pub color_name: String,
    pub hex: String,
    pub estimated_age_range: String,
    pub ett_size: f64,
    pub lma_size: f64,
    pub defibrillation_joules: f64,
    pub cardioversion_joules: f64,
    pub ns_bolus_20_ml: f64,
}

pub fn classify_broselow(weight_kg: f64) -> BrosColor {
    // TODO: If sci_clinical adds broselow classification, delegate to it:
    //   sci_clinical::broselow::classify(weight_kg)

    let (color, hex, age, ett, lma) = match weight_kg {
        w if w < 5.0  => ("Grey (Newborn)", "#9CA3AF", "0–2 mo",    3.0, 1.0),
        w if w < 7.0  => ("Pink",           "#F472B6", "2–4 mo",    3.5, 1.0),
        w if w < 9.0  => ("Red",            "#EF4444", "5–8 mo",    3.5, 1.5),
        w if w < 11.0 => ("Purple",         "#A855F7", "9–11 mo",   4.0, 1.5),
        w if w < 13.0 => ("Yellow",         "#EAB308", "1–2 yr",    4.0, 2.0),
        w if w < 16.0 => ("White",          "#D1D5DB", "2–3 yr",    4.5, 2.0),
        w if w < 19.0 => ("Blue",           "#3B82F6", "4–5 yr",    5.0, 2.0),
        w if w < 24.0 => ("Orange",         "#F97316", "6–7 yr",    5.5, 2.5),
        w if w < 30.0 => ("Green",          "#22C55E", "8–10 yr",   6.0, 3.0),
        _             => ("Adult",          "#6B7280", "11+ yr",    7.0, 4.0),
    };

    BrosColor {
        color_name: color.into(),
        hex: hex.into(),
        estimated_age_range: age.into(),
        ett_size: ett,
        lma_size: lma,
        defibrillation_joules: (weight_kg * 2.0).min(200.0),
        cardioversion_joules: (weight_kg * 1.0).min(100.0),
        ns_bolus_20_ml: weight_kg * 20.0,
    }
}

// =============================================================================
// Growth Chart Access — delegates to sci-growth
// =============================================================================

/// Calculate growth percentile using sci-growth curves.
/// Dispatches to WHO (pediatric) or Fenton (neonatal preterm) based on mode.
pub fn calculate_percentile(
    mode: ClinicalMode,
    measurement: &str,
    value: f64,
    age_months: u16,
    sex: Sex,
    gestational_weeks: Option<u16>,
) -> Option<GrowthResult> {
    // TODO: Wire to actual sci_growth API, e.g.:
    //
    // match mode {
    //     ClinicalMode::Neonatal => {
    //         let ga = gestational_weeks.unwrap_or(40);
    //         if ga < 37 {
    //             sci_growth::fenton::percentile(measurement, value, ga, sex)
    //         } else {
    //             sci_growth::who::percentile(measurement, value, age_months, sex)
    //         }
    //     }
    //     ClinicalMode::Pediatric => {
    //         sci_growth::who::percentile(measurement, value, age_months, sex)
    //     }
    // }

    // Placeholder until sci-growth API is finalized
    None
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrowthResult {
    pub percentile: f64,
    pub z_score: f64,
    pub curve_source: String, // "WHO", "Fenton", "Olsen"
}

// =============================================================================
// Tests
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_broselow_pink() {
        let b = classify_broselow(6.0);
        assert_eq!(b.color_name, "Pink");
        assert_eq!(b.ett_size, 3.5);
    }

    #[test]
    fn test_broselow_defib_cap() {
        let b = classify_broselow(120.0);
        assert_eq!(b.defibrillation_joules, 200.0);
    }

    #[test]
    fn test_neonatal_equipment() {
        let e = get_neonatal_equipment(1.5);
        assert_eq!(e.ett_size, 3.0);
        assert!(!e.ett_cuffed);
        assert_eq!(e.blade_type, "Miller");
    }

    #[test]
    fn test_pediatric_equipment() {
        let e = get_pediatric_equipment(12.0, 24);
        assert!(e.ett_cuffed); // ≥ 12 months
        assert_eq!(e.blade_size, "2");
    }

    #[test]
    fn test_patient_session_neonatal() {
        let s = PatientSession::new(
            ClinicalMode::Neonatal, 3.2, 0, Sex::Male,
            Some(36), Some(4), Some(2),
        );
        assert_eq!(s.corrected_ga_weeks, Some(36)); // 36 + 2/7 = 36
        assert!(s.broselow.is_none()); // no Broselow in neonatal mode
    }

    #[test]
    fn test_patient_session_pediatric() {
        let s = PatientSession::new(
            ClinicalMode::Pediatric, 12.0, 24, Sex::Female,
            None, None, None,
        );
        assert!(s.broselow.is_some());
        assert_eq!(s.broselow.unwrap().color_name, "Yellow");
    }
}
