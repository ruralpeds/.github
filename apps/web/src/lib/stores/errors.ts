import { writable, derived } from 'svelte/store';
import { WasmError } from '$lib/wasm/errors';
import type { WasmErrorCode } from '$lib/wasm/errors';

// =============================================================================
// WASM Error Store
//
// Centralized store for surfacing WASM boundary errors to the UI.
// Components subscribe to this store to show error banners, inline warnings,
// or recovery prompts. Errors auto-expire after a configurable timeout.
// =============================================================================

export interface StoredError {
	id: number;
	error: WasmError;
	dismissed: boolean;
	timestamp: number;
}

const ERROR_TTL_MS = 30_000; // Errors auto-expire after 30 seconds
let nextId = 0;

const errorStore = writable<StoredError[]>([]);

/** Active (non-dismissed, non-expired) errors */
export const activeErrors = derived(errorStore, ($errors) => {
	const now = Date.now();
	return $errors.filter(
		(e) => !e.dismissed && now - e.timestamp < ERROR_TTL_MS
	);
});

/** Whether there are any active errors */
export const hasErrors = derived(activeErrors, ($errors) => $errors.length > 0);

/** Most recent active error (for banner display) */
export const latestError = derived(activeErrors, ($errors) =>
	$errors.length > 0 ? $errors[$errors.length - 1] : null
);

/** Count of active validation errors (recoverable by user) */
export const validationErrorCount = derived(activeErrors, ($errors) =>
	$errors.filter((e) => e.error.code === 'VALIDATION_ERROR').length
);

/**
 * Report a WASM error to the store. Accepts either a WasmError or any Error.
 * Returns the stored error ID for programmatic dismissal.
 */
export function reportError(err: unknown): number {
	const wasmErr =
		err instanceof WasmError
			? err
			: new WasmError({
					code: 'UNKNOWN',
					message: err instanceof Error ? err.message : String(err),
					function: 'unknown',
				});

	const id = ++nextId;
	const stored: StoredError = {
		id,
		error: wasmErr,
		dismissed: false,
		timestamp: Date.now(),
	};

	errorStore.update((errors) => {
		// Deduplicate: if same code+function is already active, replace it
		const filtered = errors.filter(
			(e) =>
				e.dismissed ||
				e.error.code !== wasmErr.code ||
				e.error.wasmFunction !== wasmErr.wasmFunction
		);
		return [...filtered, stored];
	});

	return id;
}

/** Dismiss a specific error by ID */
export function dismissError(id: number): void {
	errorStore.update((errors) =>
		errors.map((e) => (e.id === id ? { ...e, dismissed: true } : e))
	);
}

/** Dismiss all active errors */
export function dismissAllErrors(): void {
	errorStore.update((errors) =>
		errors.map((e) => ({ ...e, dismissed: true }))
	);
}

/** Clear all errors (including dismissed) */
export function clearErrors(): void {
	errorStore.set([]);
}

/**
 * Wrap an async WASM call with automatic error reporting.
 * Returns the result on success, or undefined on failure (after reporting).
 */
export async function withErrorReporting<T>(
	fn: () => Promise<T>,
	fallback?: T
): Promise<T | undefined> {
	try {
		return await fn();
	} catch (err) {
		reportError(err);
		return fallback;
	}
}
