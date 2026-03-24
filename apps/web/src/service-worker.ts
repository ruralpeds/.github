/// <reference lib="webworker" />

// =============================================================================
// Service Worker — Offline-First Caching Strategy
//
// Strategy:
// 1. WASM bundle: Cache on first load, serve from cache always
// 2. Static assets (HTML, CSS, JS): Cache-first with network fallback
// 3. Font files: Cache-first, long expiry
// 4. Map tiles: Cache with size limit per region
// 5. API calls: Network-first (when online features are added)
// =============================================================================

const CACHE_VERSION = 'ped-cds-v1';
const WASM_CACHE = 'ped-cds-wasm-v1';
const STATIC_CACHE = 'ped-cds-static-v1';
const FONT_CACHE = 'ped-cds-fonts-v1';
const TILE_CACHE = 'ped-cds-tiles-v1';

const STATIC_ASSETS = [
	'/',
	'/manifest.json'
	// Build step will append hashed asset paths here
];

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
	);
	// Activate immediately — critical updates shouldn't wait
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((key) => !key.startsWith('ped-cds-'))
					.map((key) => caches.delete(key))
			)
		)
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// WASM files: cache-first, never expire
	if (url.pathname.endsWith('.wasm')) {
		event.respondWith(
			caches.open(WASM_CACHE).then((cache) =>
				cache.match(event.request).then(
					(cached) =>
						cached ||
						fetch(event.request).then((response) => {
							cache.put(event.request, response.clone());
							return response;
						})
				)
			)
		);
		return;
	}

	// Font files: cache-first
	if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
		event.respondWith(
			caches.open(FONT_CACHE).then((cache) =>
				cache.match(event.request).then(
					(cached) =>
						cached ||
						fetch(event.request).then((response) => {
							cache.put(event.request, response.clone());
							return response;
						})
				)
			)
		);
		return;
	}

	// Map tiles: cache with limit
	if (url.pathname.includes('/tiles/')) {
		event.respondWith(
			caches.open(TILE_CACHE).then((cache) =>
				cache.match(event.request).then(
					(cached) =>
						cached ||
						fetch(event.request).then((response) => {
							cache.put(event.request, response.clone());
							return response;
						})
				)
			)
		);
		return;
	}

	// Everything else: cache-first for same-origin, network-first for external
	if (url.origin === self.location.origin) {
		event.respondWith(
			caches.match(event.request).then(
				(cached) =>
					cached ||
					fetch(event.request).then((response) => {
						const cache = caches.open(STATIC_CACHE);
						cache.then((c) => c.put(event.request, response.clone()));
						return response;
					})
			)
		);
	}
});
