// =============================================================================
// WASM Web Worker
// Runs expensive computations off the main thread.
// Receives: { id, fn, args }
// Sends:    { id, result } or { id, error }
// =============================================================================

let wasm: any = null;

async function initWasm() {
	if (wasm) return wasm;
	const mod = await import('ped-wasm');
	if (typeof mod.default === 'function') {
		await mod.default();
	}
	wasm = mod;
	return wasm;
}

self.onmessage = async (event: MessageEvent) => {
	const { id, fn, args } = event.data;

	try {
		const mod = await initWasm();
		const func = mod[fn];
		if (typeof func !== 'function') {
			throw new Error(`WASM function "${fn}" not found`);
		}
		const result = func(...args);
		self.postMessage({ id, result });
	} catch (err: any) {
		self.postMessage({ id, error: err.message || 'Unknown WASM worker error' });
	}
};
