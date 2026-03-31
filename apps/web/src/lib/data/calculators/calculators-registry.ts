/**
 * apps/web/src/lib/data/calculators/calculators-registry.ts
 *
 * Typed TypeScript wrapper around calculators-registry.js.
 * Adds:
 *   - Compile-time type safety for all calculator definitions
 *   - WASM binding annotations linking each calculator to its ped-wasm function
 *   - Typed filter/search helpers
 *   - IVF calculator entry referencing the new rust-sci-core engine
 *
 * The raw JS data is imported and re-exported with type assertions.
 * Do NOT duplicate the data here — edit calculators-registry.js for content.
 */

import type { Calculator, CalculatorCategory } from '../textbook/textbook-types';
export type { Calculator, CalculatorField, CalculatorCategory } from '../textbook/textbook-types';

// ── Import raw JS registry ─────────────────────────────────────────────────
import {
	SCORING_CALCULATORS as _SCORING,
	getAllCalculators as _getAll,
	getCalculatorsForMode as _getForMode,
	getCategoriesForMode as _getCatsForMode,
	CATEGORY_LABELS as _LABELS,
} from './calculators-registry.js';

/** Typed access to all scoring calculators */
export const SCORING_CALCULATORS: Calculator[] = _SCORING as Calculator[];

/** Get all calculators (scoring + bedside) */
export function getAllCalculators(): Calculator[] {
	return _getAll() as Calculator[];
}

/** Filter by clinical mode and optional tab */
export function getCalculatorsForMode(
	mode: 'neonatal' | 'pediatric',
	tab: string = 'scoring-calcs'
): Calculator[] {
	return _getForMode(mode, tab) as Calculator[];
}

/** Get unique categories for a mode */
export function getCategoriesForMode(
	mode: 'neonatal' | 'pediatric',
	tab: string = 'scoring-calcs'
): CalculatorCategory[] {
	return _getCatsForMode(mode, tab) as CalculatorCategory[];
}

/** Human-readable category labels */
export const CATEGORY_LABELS: Record<string, string> = _LABELS;

// ── WASM function registry ─────────────────────────────────────────────────
// Maps calculator IDs to their ped-wasm function names.
// Keep in sync with crates/ped-wasm/src/lib.rs.

export interface WasmBinding {
	/** ped-wasm exported function name */
	fn: string;
	/** Input: keys from the calculator's fields */
	inputs: string[];
	/** Output: score field names */
	outputs: string[];
	/** Whether this binding is fully implemented in ped-wasm */
	implemented: boolean;
}

export const WASM_BINDINGS: Record<string, WasmBinding> = {
	// ── Sepsis ──────────────────────────────────────────────────────────────
	'phoenix-sepsis': {
		fn: 'calculate_phoenix_sepsis_json',
		inputs: ['pao2_fio2_ratio', 'spo2_fio2_ratio', 'on_invasive_mechanical_ventilation',
		         'on_vasoactive', 'lactate_mmol_l', 'systolic_bp', 'platelets', 'inr',
		         'd_dimer_mg_l', 'fibrinogen_mg_dl', 'gcs', 'suspected_infection',
		         'age_years', 'age_months'],
		outputs: ['score', 'sepsis', 'septic_shock', 'respiratory_points',
		          'cardiovascular_points', 'coagulation_points', 'neurological_points'],
		implemented: true,
	},
	'psofa': {
		fn: 'calculate_psofa_json',
		inputs: ['pao2_fio2_ratio', 'spo2_fio2_ratio', 'on_respiratory_support', 'platelets',
		         'bilirubin_mg_dl', 'alt_iu_l', 'map_mmhg', 'dopamine_mcg_kg_min',
		         'dobutamine_mcg_kg_min', 'epinephrine_mcg_kg_min', 'norepinephrine_mcg_kg_min',
		         'gcs', 'age_months'],
		outputs: ['score', 'respiratory_score', 'coagulation_score', 'hepatic_score',
		          'cardiovascular_score', 'neurological_score'],
		implemented: true,
	},

	// ── Neonatal ────────────────────────────────────────────────────────────
	'apgar': {
		fn: 'calculate_apgar_json',
		inputs: ['heart_rate', 'respiratory_effort', 'muscle_tone', 'reflex_irritability', 'color'],
		outputs: ['score', 'interpretation'],
		implemented: true,
	},
	'snappe-ii': {
		fn: 'calculate_snappe_ii_json',
		inputs: ['map_mmhg', 'lowest_temp_c', 'po2_fio2_ratio', 'lowest_serum_ph',
		         'multiple_seizures', 'urine_output_ml_kg_hr', 'birth_weight_g',
		         'small_for_ga', 'congenital_anomaly'],
		outputs: ['score', 'predicted_mortality_pct'],
		implemented: true,
	},
	'finnegan': {
		fn: 'calculate_finnegan_json',
		inputs: ['cry', 'sleep', 'moro_reflex', 'tremors', 'increased_tone', 'excoriation',
		         'myoclonic_jerks', 'generalized_seizures', 'sweating', 'fever',
		         'frequent_yawning', 'mottling', 'nasal_stuffiness', 'sneezing',
		         'nasal_flaring', 'respiratory_rate', 'excessive_sucking', 'poor_feeding',
		         'regurgitation', 'projectile_vomiting', 'loose_stools', 'watery_stools'],
		outputs: ['score', 'treatment_threshold', 'recommendation'],
		implemented: true,
	},

	// ── IVF Calculator (NEW — rust-sci-core engine) ──────────────────────────
	'neonatal-ivf-prescription': {
		fn: 'ivf_calculate',
		inputs: ['weight_grams', 'gestational_age_weeks', 'day_of_life',
		         'condition', 'environment', 'dextrose_percent'],
		outputs: ['target_rate_ml_kg_day', 'pump_rate_ml_hr', 'gir_mg_kg_min',
		          'fluid_tier', 'fluid_tier_label', 'clinical_alerts', 'recommended_additives'],
		implemented: true,
	},

	// ── Early Warning ───────────────────────────────────────────────────────
	'bedside-pews': {
		fn: 'calculate_pews_json',
		inputs: ['behavior', 'cardiovascular', 'respiratory', 'o2_use', 'nebulizer_use',
		         'emesis_since_surgery', 'age_months'],
		outputs: ['score', 'risk_level', 'recommendation'],
		implemented: true,
	},

	// ── Trauma ──────────────────────────────────────────────────────────────
	'pediatric-gcs': {
		fn: 'calculate_pediatric_gcs_json',
		inputs: ['eye_opening', 'verbal_response', 'motor_response', 'age_months'],
		outputs: ['total_score', 'eye_score', 'verbal_score', 'motor_score', 'interpretation'],
		implemented: true,
	},
	'pecarn-head': {
		fn: 'calculate_pecarn_head_json',
		inputs: ['age_months', 'gcs_14_or_15', 'altered_mental_status', 'loss_of_consciousness',
		         'scalp_hematoma', 'non_frontal', 'mechanism_severe', 'vomiting', 'palpable_skull_fx',
		         'basilar_skull_fx', 'acting_normally'],
		outputs: ['risk_level', 'ct_recommended', 'risk_pct', 'recommendation'],
		implemented: true,
	},
};

// ── IVF Calculator entry (supplements the JS registry) ────────────────────

export const IVF_CALCULATOR: Calculator = {
	id: 'neonatal-ivf-prescription',
	name: 'Neonatal IVF Prescription Calculator',
	category: 'neonatal',
	description: 'Weight-based IVF prescription: fluid rate, GIR, fluid type, enteral offset, calorie tracking',
	modes: ['neonatal'],
	fields: [
		{ name: 'weight_grams', label: 'Weight (grams)', step: '10', min: 100, max: 8000 },
		{ name: 'gestational_age_weeks', label: 'GA at Birth (weeks)', step: '1', min: 22, max: 42 },
		{ name: 'day_of_life', label: 'Day of Life', step: '1', min: 0, max: 365 },
		{ type: 'select', name: 'condition', label: 'Clinical Condition',
		  options: [
		    { value: 'stable', label: 'Stable' },
		    { value: 'rds',    label: 'RDS / Respiratory Distress' },
		    { value: 'sepsis', label: 'Sepsis / Infection' },
		    { value: 'nec',    label: 'NEC (Restrict)' },
		    { value: 'pphn',   label: 'PPHN / Hypoxia' },
		    { value: 'postop', label: 'Post-operative' },
		  ],
		},
		{ type: 'select', name: 'environment', label: 'Environment',
		  options: [
		    { value: 'isolette', label: 'Isolette / Incubator' },
		    { value: 'warmer',   label: 'Radiant Warmer' },
		    { value: 'photo1',   label: 'Single Phototherapy' },
		    { value: 'photo2',   label: 'Double Phototherapy' },
		  ],
		},
		{ name: 'dextrose_percent', label: 'Dextrose %', step: '2.5', min: 5, max: 20 },
	],
	wasmFn: 'ivf_calculate',
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Get the WASM binding for a calculator, if available */
export function getWasmBinding(calculatorId: string): WasmBinding | null {
	return WASM_BINDINGS[calculatorId] ?? null;
}

/** Check whether a calculator has an implemented WASM binding */
export function isWasmEnabled(calculatorId: string): boolean {
	return WASM_BINDINGS[calculatorId]?.implemented === true;
}

/** Get all calculators for a mode, including the IVF calculator */
export function getAllCalculatorsForMode(
	mode: 'neonatal' | 'pediatric'
): Calculator[] {
	const base = getAllCalculators().filter(c => c.modes.includes(mode));
	if (mode === 'neonatal') {
		// Add IVF calculator if not already present
		const hasIvf = base.some(c => c.id === 'neonatal-ivf-prescription');
		if (!hasIvf) base.push(IVF_CALCULATOR);
	}
	return base;
}
