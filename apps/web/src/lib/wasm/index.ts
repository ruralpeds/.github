// =============================================================================
// WASM Bridge Layer — Mode-Aware with Structured Error Handling
//
// Every clinical function reads the current mode from the Svelte store and
// passes it to the Rust/WASM layer. The frontend never decides which
// protocol to use — that's Rust's job.
//
// Error handling: Rust returns `{ ok: T }` or `{ error: { code, message, ... } }`.
// This bridge unwraps that envelope and throws typed WasmError on failure.
// Consumers can catch WasmError and inspect `.code` for recovery logic.
//
// Dependency chain:
//   Svelte component → this bridge → ped-wasm (WASM) → ped-* → sci-* (rust-sci-core)
// =============================================================================

import { get } from 'svelte/store';
import { clinicalMode } from '$lib/stores/mode';
import type { ClinicalMode } from '$lib/stores/mode';
import { WasmError, unwrapWasmResult, wasmLoadError } from './errors';

// Re-export error types for consumers
export { WasmError } from './errors';
export type { WasmErrorCode, WasmErrorDetail } from './errors';

// ---------------------------------------------------------------------------
// WASM Module Lazy Loading
// ---------------------------------------------------------------------------

let wasmModule: any = null;
let wasmPromise: Promise<any> | null = null;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

async function getWasm(): Promise<any> {
	if (wasmModule) return wasmModule;
	if (!wasmPromise) {
		wasmPromise = (async () => {
			try {
				loadAttempts++;
				const mod = await import('ped-wasm');
				if (typeof mod.default === 'function') await mod.default();
				wasmModule = mod;
				return wasmModule;
			} catch (err) {
				// Allow retry on next call if below threshold
				if (loadAttempts < MAX_LOAD_ATTEMPTS) {
					wasmPromise = null;
				}
				throw wasmLoadError(err);
			}
		})();
	}
	return wasmPromise;
}

/** Get the current clinical mode, defaulting to 'pediatric' */
function currentMode(): ClinicalMode {
	return get(clinicalMode) || 'pediatric';
}

// ---------------------------------------------------------------------------
// Patient Session
// ---------------------------------------------------------------------------

export interface PatientSession {
	mode: string;
	weight_kg: number;
	age_months: number;
	sex: string;
	gestational_weeks: number | null;
	gestational_days: number | null;
	day_of_life: number | null;
	corrected_ga_weeks: number | null;
	vital_ranges: VitalSignRanges;
	equipment: EquipmentSizing;
	broselow: BrosColor | null;
}

export interface VitalSignRanges {
	heart_rate: [number, number];
	respiratory_rate: [number, number];
	systolic_bp: [number, number];
	diastolic_bp: [number, number];
	spo2_lower: number;
	temperature: [number, number];
}

export interface EquipmentSizing {
	ett_size: number;
	ett_cuffed: boolean;
	ett_depth_cm: number;
	lma_size: number;
	blade_type: string;
	blade_size: string;
	suction_catheter_fr: string;
	oral_airway_mm: string;
	nasal_airway_mm: string;
	chest_tube_fr: string;
	ng_tube_fr: string;
	foley_fr: string;
	iv_catheter_ga: string;
	io_needle: string;
	bp_cuff: string;
	mask_size: string;
}

export interface BrosColor {
	color_name: string;
	hex: string;
	estimated_age_range: string;
	ett_size: number;
	lma_size: number;
	defibrillation_joules: number;
	cardioversion_joules: number;
	ns_bolus_20_ml: number;
}

export interface DoseResult {
	drug: string;
	dose_mg: number;
	dose_ml: number | null;
	concentration: string;
	route: string;
	max_dose_mg: number | null;
	is_capped: boolean;
	warnings: string[];
	protocol: string;
}

export interface FluidBolusResult {
	fluid_type: string;
	volume_ml: number;
	ml_per_kg: number;
	warnings: string[];
}

export interface GrowthResult {
	percentile: number;
	z_score: number;
	curve_source: string;
}

// ---------------------------------------------------------------------------
// API Functions — all mode-aware, all with structured error handling
// ---------------------------------------------------------------------------

/**
 * Create a full patient session from banner input.
 * Mode is read from the store automatically.
 *
 * @throws {WasmError} on validation failure or WASM errors
 */
export async function createPatientSession(params: {
	weightKg: number;
	ageMonths: number;
	sex: 'male' | 'female';
	gestationalWeeks?: number | null;
	gestationalDays?: number | null;
	dayOfLife?: number | null;
}): Promise<PatientSession> {
	const wasm = await getWasm();
	const raw = wasm.create_patient_session(
		currentMode(),
		params.weightKg,
		params.ageMonths,
		params.sex,
		params.gestationalWeeks ?? undefined,
		params.gestationalDays ?? undefined,
		params.dayOfLife ?? undefined,
	);
	return unwrapWasmResult<PatientSession>(raw, 'create_patient_session');
}

/**
 * Get equipment sizing for current mode.
 *
 * @throws {WasmError} on validation failure or WASM errors
 */
export async function getEquipmentSizing(
	weightKg: number,
	ageMonths: number
): Promise<EquipmentSizing> {
	const wasm = await getWasm();
	const raw = wasm.get_equipment_sizing(currentMode(), weightKg, ageMonths);
	return unwrapWasmResult<EquipmentSizing>(raw, 'get_equipment_sizing');
}

/**
 * Get vital sign ranges for current mode.
 *
 * @throws {WasmError} on validation failure or WASM errors
 */
export async function getVitalRanges(ageMonths: number): Promise<VitalSignRanges> {
	const wasm = await getWasm();
	const raw = wasm.get_vital_ranges(currentMode(), ageMonths);
	return unwrapWasmResult<VitalSignRanges>(raw, 'get_vital_ranges');
}

/**
 * Calculate a single drug dose. Mode dispatches to NRP or PALS.
 *
 * @throws {WasmError} on validation failure or WASM errors
 */
export async function calculateDose(
	drug: string,
	weightKg: number,
	ageMonths: number
): Promise<DoseResult> {
	const wasm = await getWasm();
	const raw = wasm.calculate_dose(currentMode(), drug, weightKg, ageMonths);
	return unwrapWasmResult<DoseResult>(raw, 'calculate_dose');
}

/**
 * Calculate ALL resuscitation drug doses for the mode's formulary.
 *
 * @throws {WasmError} on validation failure or WASM errors
 */
export async function calculateAllDoses(
	weightKg: number,
	ageMonths: number
): Promise<DoseResult[]> {
	const wasm = await getWasm();
	const raw = wasm.calculate_all_doses(currentMode(), weightKg, ageMonths);
	return unwrapWasmResult<DoseResult[]>(raw, 'calculate_all_doses');
}

/**
 * Calculate fluid bolus. Mode sets default mL/kg (NRP=10, PALS=20).
 *
 * @throws {WasmError} on validation failure or WASM errors
 */
export async function calculateFluidBolus(
	weightKg: number,
	fluidType: string,
	mlPerKg?: number
): Promise<FluidBolusResult> {
	const wasm = await getWasm();
	const raw = wasm.calculate_fluid_bolus(currentMode(), weightKg, fluidType, mlPerKg ?? undefined);
	return unwrapWasmResult<FluidBolusResult>(raw, 'calculate_fluid_bolus');
}

/**
 * Get the drug list available in the current mode.
 *
 * @throws {WasmError} on WASM errors
 */
export async function getDrugList(): Promise<string[]> {
	const wasm = await getWasm();
	const raw = wasm.get_drug_list(currentMode());
	return unwrapWasmResult<string[]>(raw, 'get_drug_list');
}

/**
 * Calculate growth percentile. Dispatches to WHO or Fenton by mode/GA.
 *
 * @throws {WasmError} on validation failure or WASM errors
 */
export async function calculatePercentile(
	measurement: 'weight' | 'length' | 'head_circumference',
	value: number,
	ageMonths: number,
	sex: 'male' | 'female',
	gestationalWeeks?: number
): Promise<GrowthResult | null> {
	const wasm = await getWasm();
	const raw = wasm.calculate_percentile(
		currentMode(), measurement, value, ageMonths, sex,
		gestationalWeeks ?? undefined
	);
	return unwrapWasmResult<GrowthResult | null>(raw, 'calculate_percentile');
}

/**
 * Broselow classification (returns null in neonatal mode).
 *
 * @throws {WasmError} on validation failure or WASM errors
 */
export async function classifyBroselow(weightKg: number): Promise<BrosColor | null> {
	if (currentMode() === 'neonatal') return null;
	const wasm = await getWasm();
	const raw = wasm.classify_broselow(weightKg);
	return unwrapWasmResult<BrosColor>(raw, 'classify_broselow');
}

// ---------------------------------------------------------------------------
// Web Worker for expensive computations
// ---------------------------------------------------------------------------

let worker: Worker | null = null;
let requestId = 0;
const pendingRequests = new Map<number, { resolve: Function; reject: Function }>();

function getWorker(): Worker {
	if (!worker) {
		worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
		worker.onmessage = (event) => {
			const { id, result, error } = event.data;
			const pending = pendingRequests.get(id);
			if (pending) {
				pendingRequests.delete(id);
				if (error) {
					// Reconstruct WasmError if structured detail was passed
					if (error.code && error.function) {
						pending.reject(new WasmError(error));
					} else {
						pending.reject(new WasmError({
							code: 'UNKNOWN',
							message: typeof error === 'string' ? error : error.message || 'Unknown worker error',
							function: 'worker',
						}));
					}
				} else {
					pending.resolve(result);
				}
			}
		};
		worker.onerror = (event) => {
			// Reject all pending requests on unrecoverable worker error
			const err = new WasmError({
				code: 'WASM_LOAD_ERROR',
				message: `Worker crashed: ${event.message}`,
				function: 'worker',
			});
			for (const [id, pending] of pendingRequests) {
				pending.reject(err);
				pendingRequests.delete(id);
			}
			worker = null; // Allow recreation on next call
		};
	}
	return worker;
}

/**
 * Run an expensive WASM computation off the main thread.
 * Mode is passed through to the worker.
 *
 * @throws {WasmError} on worker or WASM errors
 */
export function computeInWorker<T>(fn: string, args: unknown[]): Promise<T> {
	return new Promise((resolve, reject) => {
		const id = ++requestId;
		pendingRequests.set(id, { resolve, reject });
		getWorker().postMessage({ id, fn, args: [currentMode(), ...args] });
	});
}
