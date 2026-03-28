/**
 * apps/web/src/lib/wasm/ivf.ts
 *
 * TypeScript interface to the Rust IVF prescription engine exposed via
 * ped-wasm. All functions are async and return typed results.
 *
 * The WASM module must be loaded before calling these functions.
 * Use the standard getWasm() pattern from wasm/index.ts.
 *
 * Computation chain:
 *   Svelte/HTML → ivf.ts → ped-wasm (WASM) → sci-clinical::ivf → TOML config
 */

import { WasmError, unwrapWasmResult } from './errors';
export { WasmError };

// ── Lazy WASM loader (shared with index.ts pattern) ──────────────────────────
let wasmModule: any = null;
let wasmPromise: Promise<any> | null = null;

async function getWasm(): Promise<any> {
	if (wasmModule) return wasmModule;
	if (!wasmPromise) {
		wasmPromise = (async () => {
			const mod = await import('ped-wasm');
			if (typeof mod.default === 'function') await mod.default();
			wasmModule = mod;
			return wasmModule;
		})();
	}
	return wasmPromise;
}

// ── Input types ────────────────────────────────────────────────────────────
export interface IvfPatientContext {
	/** Current weight in **grams** — NICU scale entry unit. Converted to kg internally. */
	weight_grams: number;
	/** Gestational age at birth (22–42 weeks). */
	gestational_age_weeks: number;
	/** Postnatal day of life. 0 = day of birth. */
	day_of_life: number;
	/** 'stable' | 'rds' | 'sepsis' | 'nec' | 'pphn' | 'postop' */
	condition: string;
	/** 'isolette' | 'warmer' | 'photo1' | 'photo2' */
	environment: string;
	/** Dextrose percentage: 5, 10, 12.5, 15, or 20. */
	dextrose_percent: number;
}

export interface IvfNutritionInput {
	/** Net IV fluid volume after subtracting enteral intake (mL/day). */
	net_ivf_ml_day: number;
	/** IV fat emulsion dose (g/kg/day). 0 = not ordered. */
	ivfe_dose_g_kg_day: number;
	/** IVFE concentration: 10, 20, or 30 (%). */
	ivfe_percent: number;
	/** TPN amino acid (protein) dose (g/kg/day). */
	aa_dose_g_kg_day: number;
	/** Total enteral kcal/day from all oral/tube sources. */
	enteral_kcal_day: number;
	/** Total enteral volume (mL/day). */
	enteral_ml_day: number;
}

// ── Output types ───────────────────────────────────────────────────────────
export type FluidTier = 'Restrict' | 'Conservative' | 'Standard' | 'Liberal' | 'VeryLiberal';
export type GirStatus = 'DangerLow' | 'Low' | 'Normal' | 'High' | 'DangerHigh';
export type AdditiveStatus = 'Add' | 'Hold' | 'Caution';
export type AlertSeverity = 'Info' | 'Warning' | 'Danger';

export interface IvfPrescription {
	// Patient summary
	weight_grams: number;
	weight_kg: number;
	gestational_age_weeks: number;
	day_of_life: number;
	ga_group_id: string;
	ga_group_label: string;

	// Core fluid
	protocol_rate_ml_kg_day: number;
	target_rate_ml_kg_day: number;
	total_fluid_ml_day: number;
	pump_rate_ml_hr: number;
	fluid_tier: FluidTier;
	fluid_tier_label: string;
	rate_range: [number, number];

	// GIR
	gir_mg_kg_min: number;
	gir_status: GirStatus;

	// Optional calorie breakdown (populated by calculate_with_nutrition)
	calorie_breakdown: CalorieBreakdown | null;

	// Electrolyte recommendations
	recommended_additives: AdditiveRecommendation[];

	// Clinical alerts
	clinical_alerts: ClinicalAlert[];
}

export interface CalorieBreakdown {
	from_dextrose_kcal_kg: number;
	from_ivfe_kcal_kg: number;
	from_amino_acids_kcal_kg: number;
	from_enteral_kcal_kg: number;
	total_kcal_kg_day: number;
	total_kcal_day: number;
	ivfe_ml_day: number;
	protein_total_g_day: number;
}

export interface AdditiveRecommendation {
	electrolyte: string;
	dose_range: string;
	status: AdditiveStatus;
	clinical_note: string;
}

export interface ClinicalAlert {
	severity: AlertSeverity;
	message: string;
}

export interface IvfeResult {
	ml_per_day: number;
	ml_per_hr: number;
	kcal_per_day: number;
}

export interface FeedResult {
	ml_per_day: number;
	kcal_per_day: number;
}

// ── API functions ──────────────────────────────────────────────────────────

/**
 * Calculate the base IVF prescription (fluid rate, GIR, electrolytes, alerts).
 * Weight is passed in grams; internally converted to kg.
 *
 * @throws {WasmError} on validation failure
 */
export async function ivfCalculate(ctx: IvfPatientContext): Promise<IvfPrescription> {
	const wasm = await getWasm();
	const raw = wasm.ivf_calculate(JSON.stringify(ctx));
	return unwrapWasmResult<IvfPrescription>(raw, 'ivf_calculate');
}

/**
 * Add nutrition layer to a base prescription.
 * Populates calorie_breakdown with kcal from dextrose, IVFE, AA, and enteral feeds.
 *
 * @throws {WasmError} on validation failure
 */
export async function ivfCalculateWithNutrition(
	base: IvfPrescription,
	nutrition: IvfNutritionInput,
): Promise<IvfPrescription> {
	const wasm = await getWasm();
	const raw = wasm.ivf_calculate_with_nutrition(
		JSON.stringify(base),
		JSON.stringify(nutrition),
	);
	return unwrapWasmResult<IvfPrescription>(raw, 'ivf_calculate_with_nutrition');
}

/**
 * Apply a manual fluid rate override.
 * Recalculates pump rate, GIR, and fluid tier for the new rate.
 *
 * @throws {WasmError} on validation failure
 */
export async function ivfApplyRateOverride(
	base: IvfPrescription,
	manualRateMlKgDay: number,
	dextrosePercent: number,
): Promise<IvfPrescription> {
	const wasm = await getWasm();
	const raw = wasm.ivf_apply_rate_override(
		JSON.stringify(base),
		manualRateMlKgDay,
		dextrosePercent,
	);
	return unwrapWasmResult<IvfPrescription>(raw, 'ivf_apply_rate_override');
}

/**
 * Calculate IVFE (IV fat emulsion) pump parameters.
 *
 * @throws {WasmError} on validation failure
 */
export async function ivfIvfeParams(
	doseGKgDay: number,
	weightGrams: number,
	concentrationPct: number,
): Promise<IvfeResult> {
	const wasm = await getWasm();
	const raw = wasm.ivf_ivfe_params(doseGKgDay, weightGrams, concentrationPct);
	return unwrapWasmResult<IvfeResult>(raw, 'ivf_ivfe_params');
}

/**
 * Calculate bolus enteral feed volume and kcal.
 *
 * @throws {WasmError} on WASM errors
 */
export async function ivfBolusFeedKcal(
	feedType: string,
	mlPerFeed: number,
	feedsPerDay: number,
): Promise<FeedResult> {
	const wasm = await getWasm();
	const raw = wasm.ivf_bolus_feed_kcal(feedType, mlPerFeed, feedsPerDay);
	return unwrapWasmResult<FeedResult>(raw, 'ivf_bolus_feed_kcal');
}

/**
 * Calculate continuous enteral feed volume and kcal.
 *
 * @throws {WasmError} on WASM errors
 */
export async function ivfContinuousFeedKcal(
	feedType: string,
	mlPerHr: number,
): Promise<FeedResult> {
	const wasm = await getWasm();
	const raw = wasm.ivf_continuous_feed_kcal(feedType, mlPerHr);
	return unwrapWasmResult<FeedResult>(raw, 'ivf_continuous_feed_kcal');
}

// ── Utility: check if WASM is available ───────────────────────────────────

/**
 * Check whether the ped-wasm module is loaded and ready.
 * The IVF calculator HTML uses this to show an engine badge.
 */
export function isWasmReady(): boolean {
	return wasmModule !== null;
}

/**
 * Pre-warm the WASM module. Call on page load so the first recalc()
 * doesn't pay the initialization latency cost.
 */
export async function warmWasm(): Promise<boolean> {
	try {
		await getWasm();
		return true;
	} catch {
		return false;
	}
}
