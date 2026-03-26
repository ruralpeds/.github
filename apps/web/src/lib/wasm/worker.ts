// =============================================================================
// WASM Web Worker — Structured Error Handling
//
// Runs expensive computations off the main thread.
// Receives: { id, fn, args }
// Sends:    { id, result } on success (result is unwrapped from WASM envelope)
//           { id, error }  on failure (error is a WasmErrorDetail object)
// =============================================================================

let wasm: any = null;
let loadError: string | null = null;

async function initWasm() {
	if (wasm) return wasm;
	if (loadError) throw new Error(loadError);

	try {
		const mod = await import('ped-wasm');
		if (typeof mod.default === 'function') {
			await mod.default();
		}
		wasm = mod;
		return wasm;
	} catch (err: any) {
		loadError = err.message || 'Failed to load WASM module in worker';
		throw err;
	}
}

/** Check if a raw WASM result is an error envelope */
function isErrorEnvelope(raw: unknown): raw is { error: Record<string, unknown> } {
	return (
		typeof raw === 'object' &&
		raw !== null &&
		'error' in raw &&
		typeof (raw as any).error === 'object'
	);
}

/** Unwrap the WASM result envelope in the worker context */
function unwrapResult(raw: unknown, fn: string): unknown {
	if (raw === null || raw === undefined) {
		return {
			__isWasmError: true,
			code: 'COMPUTATION_ERROR',
			message: 'WASM returned null',
			function: fn,
		};
	}

	if (isErrorEnvelope(raw)) {
		return {
			__isWasmError: true,
			...(raw as any).error,
		};
	}

	if (typeof raw === 'object' && 'ok' in (raw as any)) {
		return (raw as any).ok;
	}

	// Legacy/raw value
	return raw;
}

self.onmessage = async (event: MessageEvent) => {
	const { id, fn, args } = event.data;

	try {
		const mod = await initWasm();
		const func = mod[fn];
		if (typeof func !== 'function') {
			self.postMessage({
				id,
				error: {
					code: 'WASM_FUNCTION_NOT_FOUND',
					message: `WASM function "${fn}" not found in module`,
					function: fn,
				},
			});
			return;
		}

		const raw = func(...args);
		const result = unwrapResult(raw, fn);

		// If unwrapResult returned a tagged error, send as error
		if (typeof result === 'object' && result !== null && (result as any).__isWasmError) {
			const { __isWasmError, ...errorDetail } = result as any;
			self.postMessage({ id, error: errorDetail });
		} else {
			self.postMessage({ id, result });
		}
	} catch (err: any) {
		self.postMessage({
			id,
			error: {
				code: 'WASM_LOAD_ERROR',
				message: err.message || 'Unknown WASM worker error',
				function: fn,
			},
		});
	}
};
