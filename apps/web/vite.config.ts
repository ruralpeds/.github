import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
	plugins: [
		wasm(),
		topLevelAwait(),
		sveltekit()
	],
	build: {
		target: 'esnext'
	},
	optimizeDeps: {
		exclude: ['ped-wasm']
	},
	server: {
		fs: {
			// Allow serving WASM files from the workspace root
			allow: ['..', '../..']
		}
	}
});
