//! ped-resus: Mode-aware resuscitation module.
//!
//! Wraps sci-clinical drug dosing and fluid calculations, adding:
//!   - Mode dispatch: NRP (neonatal) vs PALS (pediatric) drug lists
//!   - Mode-specific dose adjustments and warnings
//!   - Safety caps and minimum doses per protocol
//!
//! Actual pharmacokinetic calculations delegate to sci-clinical.

use serde::{Deserialize, Serialize};
use ped_core::ClinicalMode;

// =============================================================================
// Drug Dose Result
// =============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoseResult {
    pub drug: String,
    pub dose_mg: f64,
    pub dose_ml: Option<f64>,
    pub concentration: String,
    pub route: String,
    pub max_dose_mg: Option<f64>,
    pub is_capped: bool,
    pub warnings: Vec<String>,
    pub protocol: String, // "NRP" or "PALS"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FluidBolusResult {
    pub fluid_type: String,
    pub volume_ml: f64,
    pub ml_per_kg: f64,
    pub warnings: Vec<String>,
}

// =============================================================================
// Mode-Aware Drug Dosing
// =============================================================================

/// Calculate medication dose, dispatching to NRP or PALS formulary based on mode.
pub fn calculate_dose(
    drug: &str,
    weight_kg: f64,
    age_months: u16,
    mode: ClinicalMode,
) -> DoseResult {
    // TODO: When sci_clinical exposes a drug dosing API, delegate:
    //   let base_dose = sci_clinical::dosing::calculate(drug, weight_kg);
    //   Then apply mode-specific adjustments below.

    match mode {
        ClinicalMode::Neonatal => calculate_nrp_dose(drug, weight_kg),
        ClinicalMode::Pediatric => calculate_pals_dose(drug, weight_kg, age_months),
    }
}

/// NRP drug doses — neonatal resuscitation formulary
fn calculate_nrp_dose(drug: &str, weight_kg: f64) -> DoseResult {
    match drug.to_lowercase().as_str() {
        "epinephrine" | "epi" | "epinephrine_iv" => {
            // NRP: 0.01–0.03 mg/kg IV/IO
            let dose = (weight_kg * 0.02).min(1.0); // midpoint of range
            let low = weight_kg * 0.01;
            let high = weight_kg * 0.03;
            DoseResult {
                drug: "Epinephrine (1:10,000) IV/IO".into(),
                dose_mg: dose,
                dose_ml: Some(dose / 0.1),
                concentration: "0.1 mg/mL (1:10,000)".into(),
                route: "IV/UVC".into(),
                max_dose_mg: Some(1.0),
                is_capped: dose >= 1.0,
                protocol: "NRP".into(),
                warnings: vec![
                    format!("NRP dose range: {:.3}–{:.3} mg ({:.1}–{:.1} mL)", low, high, low/0.1, high/0.1),
                    "Preferred route: UV catheter. May give via IO.".into(),
                ],
            }
        }
        "epinephrine_ett" => {
            // NRP: 0.05–0.1 mg/kg via ETT (higher dose)
            let dose = weight_kg * 0.1;
            DoseResult {
                drug: "Epinephrine (1:10,000) ETT".into(),
                dose_mg: dose,
                dose_ml: Some(dose / 0.1),
                concentration: "0.1 mg/mL (1:10,000)".into(),
                route: "Endotracheal".into(),
                max_dose_mg: None,
                is_capped: false,
                protocol: "NRP".into(),
                warnings: vec![
                    "ETT route: NOT preferred. Use IV/UVC if available.".into(),
                    format!("ETT range: {:.3}–{:.3} mg", weight_kg * 0.05, weight_kg * 0.1),
                ],
            }
        }
        "volume_expansion" | "ns_bolus" => {
            let vol = weight_kg * 10.0; // NRP: 10 mL/kg
            DoseResult {
                drug: "Volume Expansion (NS or O-neg pRBC)".into(),
                dose_mg: 0.0,
                dose_ml: Some(vol),
                concentration: "0.9% NaCl or O-neg pRBC".into(),
                route: "IV/UVC over 5–10 min".into(),
                max_dose_mg: None,
                is_capped: false,
                protocol: "NRP".into(),
                warnings: vec![
                    "NRP: 10 mL/kg (not 20 mL/kg as in PALS)".into(),
                    "Administer over 5–10 minutes".into(),
                ],
            }
        }
        "dextrose" | "d10" => {
            let vol = weight_kg * 2.0; // 2 mL/kg D10W = 200 mg/kg glucose
            DoseResult {
                drug: "Dextrose (D10W)".into(),
                dose_mg: weight_kg * 200.0,
                dose_ml: Some(vol),
                concentration: "D10W (100 mg/mL glucose)".into(),
                route: "IV".into(),
                max_dose_mg: None,
                is_capped: false,
                protocol: "NRP".into(),
                warnings: vec![
                    "Use D10W only. D25W and D50W are contraindicated in neonates.".into(),
                ],
            }
        }
        _ => unknown_drug(drug, "NRP"),
    }
}

/// PALS drug doses — pediatric resuscitation formulary
fn calculate_pals_dose(drug: &str, weight_kg: f64, age_months: u16) -> DoseResult {
    match drug.to_lowercase().as_str() {
        "epinephrine" | "epi" => {
            let dose = (weight_kg * 0.01).min(1.0);
            DoseResult {
                drug: "Epinephrine (1:10,000)".into(),
                dose_mg: dose,
                dose_ml: Some(dose / 0.1),
                concentration: "0.1 mg/mL (1:10,000)".into(),
                route: "IV/IO".into(),
                max_dose_mg: Some(1.0),
                is_capped: weight_kg * 0.01 > 1.0,
                protocol: "PALS".into(),
                warnings: vec![],
            }
        }
        "amiodarone" => {
            let dose = (weight_kg * 5.0).min(300.0);
            DoseResult {
                drug: "Amiodarone".into(),
                dose_mg: dose,
                dose_ml: Some(dose / 50.0),
                concentration: "50 mg/mL".into(),
                route: "IV/IO".into(),
                max_dose_mg: Some(300.0),
                is_capped: weight_kg * 5.0 > 300.0,
                protocol: "PALS".into(),
                warnings: vec!["Administer over 20–60 min for perfusing rhythms".into()],
            }
        }
        "adenosine" | "adenosine_first" => {
            let dose = (weight_kg * 0.1).min(6.0);
            DoseResult {
                drug: "Adenosine (1st dose)".into(),
                dose_mg: dose,
                dose_ml: Some(dose / 3.0),
                concentration: "3 mg/mL".into(),
                route: "Rapid IV push with flush".into(),
                max_dose_mg: Some(6.0),
                is_capped: weight_kg * 0.1 > 6.0,
                protocol: "PALS".into(),
                warnings: vec!["Rapid push followed immediately by 5–10 mL NS flush".into()],
            }
        }
        "adenosine_second" => {
            let dose = (weight_kg * 0.2).min(12.0);
            DoseResult {
                drug: "Adenosine (2nd dose)".into(),
                dose_mg: dose,
                dose_ml: Some(dose / 3.0),
                concentration: "3 mg/mL".into(),
                route: "Rapid IV push with flush".into(),
                max_dose_mg: Some(12.0),
                is_capped: weight_kg * 0.2 > 12.0,
                protocol: "PALS".into(),
                warnings: vec!["Rapid push followed immediately by 5–10 mL NS flush".into()],
            }
        }
        "atropine" => {
            let calc = weight_kg * 0.02;
            let dose = calc.max(0.1).min(0.5);
            let mut warnings = vec![];
            if calc < 0.1 {
                warnings.push(format!("Calc dose {:.3} mg < min 0.1 mg; using minimum", calc));
            }
            DoseResult {
                drug: "Atropine".into(),
                dose_mg: dose,
                dose_ml: Some(dose / 0.1),
                concentration: "0.1 mg/mL".into(),
                route: "IV/IO".into(),
                max_dose_mg: Some(0.5),
                is_capped: calc > 0.5,
                protocol: "PALS".into(),
                warnings,
            }
        }
        "dextrose" | "d10" => {
            // PALS: D10W 5 mL/kg for infants, D25W 2 mL/kg for children
            let (vol, conc, conc_label) = if age_months < 12 {
                (weight_kg * 5.0, "D10W", "D10W (100 mg/mL)")
            } else {
                (weight_kg * 2.0, "D25W", "D25W (250 mg/mL)")
            };
            DoseResult {
                drug: format!("Dextrose ({})", conc),
                dose_mg: weight_kg * if age_months < 12 { 500.0 } else { 500.0 },
                dose_ml: Some(vol),
                concentration: conc_label.into(),
                route: "IV".into(),
                max_dose_mg: None,
                is_capped: false,
                protocol: "PALS".into(),
                warnings: if age_months < 12 {
                    vec!["Use D10W for infants < 12 months".into()]
                } else {
                    vec![]
                },
            }
        }
        _ => unknown_drug(drug, "PALS"),
    }
}

fn unknown_drug(drug: &str, protocol: &str) -> DoseResult {
    DoseResult {
        drug: drug.to_string(),
        dose_mg: 0.0,
        dose_ml: None,
        concentration: "Unknown".into(),
        route: "Unknown".into(),
        max_dose_mg: None,
        is_capped: false,
        protocol: protocol.into(),
        warnings: vec![format!("'{}' not found in {} formulary", drug, protocol)],
    }
}

// =============================================================================
// Fluid Bolus — mode-aware
// =============================================================================

/// Calculate fluid bolus volume. NRP uses 10 mL/kg, PALS uses 20 mL/kg default.
pub fn calculate_fluid_bolus(
    weight_kg: f64,
    fluid_type: &str,
    ml_per_kg: Option<f64>,
    mode: ClinicalMode,
) -> FluidBolusResult {
    let default_ml_per_kg = match mode {
        ClinicalMode::Neonatal => 10.0,  // NRP standard
        ClinicalMode::Pediatric => 20.0, // PALS standard
    };
    let dose = ml_per_kg.unwrap_or(default_ml_per_kg);
    let volume = weight_kg * dose;

    let fluid_name = match fluid_type {
        "normal_saline" | "ns" => "0.9% Normal Saline",
        "lactated_ringers" | "lr" => "Lactated Ringer's",
        "prbc" => "O-negative pRBC",
        other => other,
    };

    let mut warnings = vec![];
    if mode == ClinicalMode::Neonatal && dose > 10.0 {
        warnings.push("NRP standard is 10 mL/kg. Dose exceeds standard.".into());
    }
    if mode == ClinicalMode::Pediatric && dose > 20.0 {
        warnings.push("Bolus >20 mL/kg: reassess after each bolus for fluid overload".into());
    }
    if volume > 1000.0 {
        warnings.push(format!("Large volume ({:.0} mL): consider giving in divided doses", volume));
    }

    FluidBolusResult {
        fluid_type: fluid_name.into(),
        volume_ml: volume,
        ml_per_kg: dose,
        warnings,
    }
}

/// Get the complete drug list for a mode — used to populate the UI formulary.
pub fn get_drug_list(mode: ClinicalMode) -> Vec<&'static str> {
    match mode {
        ClinicalMode::Neonatal => vec![
            "epinephrine", "epinephrine_ett", "volume_expansion", "dextrose",
        ],
        ClinicalMode::Pediatric => vec![
            "epinephrine", "amiodarone", "adenosine", "adenosine_second",
            "atropine", "dextrose",
        ],
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_nrp_epi() {
        let d = calculate_dose("epinephrine", 3.5, 0, ClinicalMode::Neonatal);
        assert_eq!(d.protocol, "NRP");
        assert!((d.dose_mg - 0.07).abs() < 0.001);
    }

    #[test]
    fn test_pals_epi() {
        let d = calculate_dose("epinephrine", 10.0, 12, ClinicalMode::Pediatric);
        assert_eq!(d.protocol, "PALS");
        assert!((d.dose_mg - 0.1).abs() < 0.001);
    }

    #[test]
    fn test_nrp_fluid_bolus() {
        let f = calculate_fluid_bolus(3.5, "normal_saline", None, ClinicalMode::Neonatal);
        assert_eq!(f.ml_per_kg, 10.0); // NRP default
        assert!((f.volume_ml - 35.0).abs() < 0.1);
    }

    #[test]
    fn test_pals_fluid_bolus() {
        let f = calculate_fluid_bolus(10.0, "normal_saline", None, ClinicalMode::Pediatric);
        assert_eq!(f.ml_per_kg, 20.0); // PALS default
        assert!((f.volume_ml - 200.0).abs() < 0.1);
    }
}
