// =============================================================================
// WASM Error Types
//
// Structured error handling for the Rust ↔ Svelte boundary.
// Rust returns `{ ok: T }` or `{ error: { code, message, function, context } }`.
// This module unwraps that envelope and provides typed errors to consumers.
// =============================================================================

/** Error codes matching the Rust WasmErrorCode enum */
export type WasmErrorCode =
	| 'VALIDATION_ERROR'
	| 'SERIALIZATION_ERROR'
	| 'COMPUTATION_ERROR'
	| 'NOT_IMPLEMENTED'
	| 'WASM_LOAD_ERROR'
	| 'WASM_FUNCTION_NOT_FOUND'
	| 'UNKNOWN';

/** Raw error shape from the Rust WASM boundary */
export interface WasmErrorDetail {
	code: WasmErrorCode;
	message: string;
	function: string;
	context?: [string, string][];
}

/**
 * Typed error class for all WASM boundary failures.
 * Consumers can check `error instanceof WasmError` and inspect `.code`.
 */
export class WasmError extends Error {
	readonly code: WasmErrorCode;
	readonly wasmFunction: string;
	readonly context: Map<string, string>;
	readonly timestamp: number;

	constructor(detail: WasmErrorDetail) {
		super(`[${detail.code}] ${detail.function}: ${detail.message}`);
		this.name = 'WasmError';
		this.code = detail.code;
		this.wasmFunction = detail.function;
		this.context = new Map(detail.context || []);
		this.timestamp = Date.now();
	}

	/** Whether this error is due to bad input (recoverable by fixing inputs) */
	get isValidationError(): boolean {
		return this.code === 'VALIDATION_ERROR';
	}

	/** Whether this error is a transient/infrastructure issue */
	get isInfraError(): boolean {
		return (
			this.code === 'SERIALIZATION_ERROR' ||
			this.code === 'WASM_LOAD_ERROR' ||
			this.code === 'WASM_FUNCTION_NOT_FOUND'
		);
	}

	/** Structured JSON for logging or telemetry */
	toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			code: this.code,
			message: this.message,
			function: this.wasmFunction,
			context: Object.fromEntries(this.context),
			timestamp: this.timestamp,
		};
	}
}

/**
 * Unwrap a WASM result envelope `{ ok: T }` or `{ error: ... }`.
 * Returns the unwrapped value or throws a WasmError.
 */
export function unwrapWasmResult<T>(raw: unknown, callerFn: string): T {
	// Null/undefined from WASM means the function returned JsValue::NULL
	if (raw === null || raw === undefined) {
		throw new WasmError({
			code: 'COMPUTATION_ERROR',
			message: 'WASM returned null — possible serialization failure',
			function: callerFn,
		});
	}

	// Envelope check: is it our { ok } or { error } shape?
	if (typeof raw === 'object') {
		const envelope = raw as Record<string, unknown>;

		// Error envelope from Rust
		if ('error' in envelope && envelope.error) {
			const detail = envelope.error as WasmErrorDetail;
			throw new WasmError(detail);
		}

		// Success envelope from Rust
		if ('ok' in envelope) {
			return envelope.ok as T;
		}
	}

	// Legacy path: raw value without envelope (backwards compat during migration)
	return raw as T;
}

/**
 * Create a WasmError for WASM module loading failures.
 */
export function wasmLoadError(cause: unknown): WasmError {
	const msg = cause instanceof Error ? cause.message : String(cause);
	return new WasmError({
		code: 'WASM_LOAD_ERROR',
		message: `Failed to initialize WASM module: ${msg}`,
		function: 'getWasm',
	});
}

/**
 * Create a WasmError for missing WASM functions (worker dispatch).
 */
export function wasmFunctionNotFound(fn: string): WasmError {
	return new WasmError({
		code: 'WASM_FUNCTION_NOT_FOUND',
		message: `WASM function "${fn}" not found in module`,
		function: fn,
	});
}
