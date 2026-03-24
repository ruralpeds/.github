import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// adapter-static for offline-first PWA deployment
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html', // SPA fallback for client-side routing
			precompress: true
		}),
		alias: {
			'$lib': './src/lib',
			'ped-wasm': './wasm-pkg'  // Points to wasm-pack output
		}
	}
};

export default config;
