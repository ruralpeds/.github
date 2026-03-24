import { writable, derived } from 'svelte/store';

// =============================================================================
// Clinical Mode
//
// The user selects Neonatal or Pediatric on app launch (or from the banner).
// Mode determines:
//   - Which navigation sections are visible
//   - Which decision trees load
//   - Which Rust/WASM crate functions are called
//   - Default age/weight ranges and validation bounds
//   - Equipment sizing algorithms (neonatal vs pediatric)
//   - Drug formulary subset
//   - Normal value reference tables
// =============================================================================

export type ClinicalMode = 'neonatal' | 'pediatric';

export interface ModeConfig {
	label: string;
	shortLabel: string;
	icon: string;
	description: string;
	ageRange: { minMonths: number; maxMonths: number; defaultMonths: number };
	weightRange: { minKg: number; maxKg: number; defaultKg: number; stepKg: number };
	/** Route prefixes available in this mode */
	availableModules: string[];
	/** Broselow applicable */
	useBroselow: boolean;
	/** Default weight unit for display */
	weightUnit: 'kg' | 'g';
	/** Show gestational age input */
	showGestationalAge: boolean;
}

export const MODE_CONFIGS: Record<ClinicalMode, ModeConfig> = {
	neonatal: {
		label: 'Neonatal',
		shortLabel: 'Neo',
		icon: '👶',
		description: 'Birth to 28 days / Level I–II+ nursery and neonatal resuscitation',
		ageRange: { minMonths: 0, maxMonths: 1, defaultMonths: 0 },
		weightRange: { minKg: 0.4, maxKg: 6.0, defaultKg: 3.5, stepKg: 0.05 },
		availableModules: [
			'/resuscitation',
			'/airway',
			'/neonatal',
			'/cardiac',
			'/transport',
			'/reference',
		],
		useBroselow: false,
		weightUnit: 'g',
		showGestationalAge: true,
	},
	pediatric: {
		label: 'Pediatric',
		shortLabel: 'Peds',
		icon: '🧒',
		description: '1 month to 18 years / Pediatric emergency department',
		ageRange: { minMonths: 1, maxMonths: 216, defaultMonths: 24 },
		weightRange: { minKg: 3.0, maxKg: 150.0, defaultKg: 12.0, stepKg: 0.1 },
		availableModules: [
			'/resuscitation',
			'/airway',
			'/sepsis',
			'/cardiac',
			'/trauma',
			'/transport',
			'/reference',
		],
		useBroselow: true,
		weightUnit: 'kg',
		showGestationalAge: false,
	},
};

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY_MODE = 'ped-cds-mode';

function loadStoredMode(): ClinicalMode | null {
	if (typeof window === 'undefined') return null;
	try {
		const stored = localStorage.getItem(STORAGE_KEY_MODE);
		if (stored === 'neonatal' || stored === 'pediatric') return stored;
		return null;
	} catch {
		return null;
	}
}

function saveMode(mode: ClinicalMode): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY_MODE, mode);
	} catch {}
}

// ---------------------------------------------------------------------------
// Stores
// ---------------------------------------------------------------------------

/** Whether a mode has been selected this session. Null = show mode selector screen. */
export const clinicalMode = writable<ClinicalMode | null>(loadStoredMode());

/** Derived: the active mode configuration */
export const modeConfig = derived(clinicalMode, ($mode) => {
	if (!$mode) return null;
	return MODE_CONFIGS[$mode];
});

/** Derived: has mode been selected? */
export const hasMode = derived(clinicalMode, ($mode) => $mode !== null);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export function selectMode(mode: ClinicalMode): void {
	clinicalMode.set(mode);
	saveMode(mode);
}

export function clearMode(): void {
	clinicalMode.set(null);
	if (typeof window !== 'undefined') {
		try {
			localStorage.removeItem(STORAGE_KEY_MODE);
		} catch {}
	}
}
