import { writable, derived, get } from 'svelte/store';
import { clinicalMode, modeConfig } from './mode';
import type { ClinicalMode } from './mode';
import { reportError } from './errors';
import { WasmError } from '$lib/wasm/errors';

// =============================================================================
// Patient Session Store — Mode-Aware
//
// The patient banner populates this store. Every clinical module reads from
// here. In neonatal mode, gestational age and birth weight are primary
// inputs. In pediatric mode, current weight and age in months drive
// calculations. The WASM bridge receives the appropriate parameters based
// on mode.
// =============================================================================

export interface PatientData {
	weightKg: number;
	ageMonths: number;
	sex: 'male' | 'female';
	gestationalWeeks: number | null;
	gestationalDays: number | null;
	birthWeightKg: number | null;
	dayOfLife: number | null;
	correctedGestationalWeeks: number | null;
	classification: WeightClassification | null;
	vitalRanges: VitalSignRange | null;
	equipmentSizing: EquipmentSizing | null;
}

export interface WeightClassification {
	broselow_color: string;
	estimated_age_range: string;
	ett_size: number;
	ett_depth_cm: number;
	lma_size: number;
	defibrillation_joules: number;
	cardioversion_joules: number;
}

export interface VitalSignRange {
	heart_rate: [number, number];
	respiratory_rate: [number, number];
	systolic_bp: [number, number];
	diastolic_bp: [number, number];
	spo2_lower: number;
}

export interface EquipmentSizing {
	ett_size: number;
	ett_depth_cm: number;
	lma_size: number;
	oral_airway: string;
	nasal_airway: string;
	blade_size: string;
	blade_type: string;
	suction_catheter: string;
	chest_tube: string;
	ng_tube: string;
	foley: string;
	iv_catheter: string;
	io_needle: string;
	bp_cuff: string;
}

const EMPTY_PATIENT: PatientData = {
	weightKg: 0, ageMonths: 0, sex: 'male',
	gestationalWeeks: null, gestationalDays: null,
	birthWeightKg: null, dayOfLife: null, correctedGestationalWeeks: null,
	classification: null, vitalRanges: null, equipmentSizing: null,
};

const STORAGE_KEY = 'ped-cds-patient';

function loadStoredPatient(): PatientData {
	if (typeof window === 'undefined') return EMPTY_PATIENT;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return EMPTY_PATIENT;
		return { ...EMPTY_PATIENT, ...JSON.parse(raw) };
	} catch { return EMPTY_PATIENT; }
}

function savePatient(data: PatientData): void {
	if (typeof window === 'undefined') return;
	try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

export const patient = writable<PatientData>(loadStoredPatient());
export const hasPatient = derived(patient, ($p) => $p.weightKg > 0);

export const weightDisplay = derived([patient, modeConfig], ([$p, $mc]) => {
	if ($p.weightKg <= 0) return '—';
	if ($mc?.weightUnit === 'g' && $p.weightKg < 10) {
		return `${Math.round($p.weightKg * 1000)} g`;
	}
	return `${$p.weightKg} kg`;
});

export const ageDisplay = derived([patient, clinicalMode], ([$p, $mode]) => {
	if ($p.ageMonths <= 0 && !$p.dayOfLife) return '—';
	if ($mode === 'neonatal') {
		if ($p.dayOfLife !== null && $p.dayOfLife >= 0) {
			return $p.dayOfLife === 0 ? 'DOL 0' : `DOL ${$p.dayOfLife}`;
		}
		if ($p.gestationalWeeks !== null) {
			const days = $p.gestationalDays || 0;
			return `${$p.gestationalWeeks}+${days} wk GA`;
		}
	}
	if ($p.ageMonths < 1) return 'Newborn';
	if ($p.ageMonths < 24) return `${$p.ageMonths} mo`;
	const years = Math.floor($p.ageMonths / 12);
	const months = $p.ageMonths % 12;
	return months > 0 ? `${years} yr ${months} mo` : `${years} yr`;
});

export const brosColor = derived(patient, ($p) => $p.classification?.broselow_color || null);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function loadPatient(input: {
	weightKg: number;
	ageMonths: number;
	sex: 'male' | 'female';
	gestationalWeeks?: number | null;
	gestationalDays?: number | null;
	birthWeightKg?: number | null;
	dayOfLife?: number | null;
}): Promise<void> {
	const mode = get(clinicalMode);
	let correctedGA: number | null = null;
	if (mode === 'neonatal' && input.gestationalWeeks && input.dayOfLife != null) {
		correctedGA = input.gestationalWeeks + Math.floor(input.dayOfLife / 7);
	}

	let classification = null;
	let vitalRanges = null;
	try {
		const { classifyBroselow, getVitalRanges } = await import('$lib/wasm');
		classification = await classifyBroselow(input.weightKg);
		vitalRanges = await getVitalRanges(input.ageMonths);
	} catch (err) {
		reportError(err);
		if (err instanceof WasmError && err.isValidationError) {
			// Validation errors mean the input is bad — don't silently proceed
			throw err;
		}
		// Infrastructure errors: proceed with partial data, error is already reported
	}

	const data: PatientData = {
		...EMPTY_PATIENT,
		weightKg: input.weightKg,
		ageMonths: input.ageMonths,
		sex: input.sex,
		gestationalWeeks: input.gestationalWeeks ?? null,
		gestationalDays: input.gestationalDays ?? null,
		birthWeightKg: input.birthWeightKg ?? null,
		dayOfLife: input.dayOfLife ?? null,
		correctedGestationalWeeks: correctedGA,
		classification,
		vitalRanges,
		equipmentSizing: null,
	};
	patient.set(data);
	savePatient(data);
}

export function clearPatient(): void {
	patient.set(EMPTY_PATIENT);
	if (typeof window !== 'undefined') {
		try { localStorage.removeItem(STORAGE_KEY); } catch {}
	}
}
