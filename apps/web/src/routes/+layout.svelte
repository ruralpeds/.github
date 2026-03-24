<script lang="ts">
	import { ThemeProvider, ThemeToggle } from '$lib/theme';
	import { hasMode } from '$lib/stores/mode';
	import ModeSelector from '$lib/components/layout/ModeSelector.svelte';
	import PatientBanner from '$lib/components/layout/PatientBanner.svelte';
	import ClinicalNav from '$lib/components/layout/ClinicalNav.svelte';
	import OfflineIndicator from '$lib/components/layout/OfflineIndicator.svelte';
	import '../app.css';
</script>

<ThemeProvider>
	{#if !$hasMode}
		<!-- No mode selected: show full-screen mode selector -->
		<ModeSelector />
	{:else}
		<!-- Mode selected: show main app shell -->
		<div class="app-shell">
			<header class="app-header">
				<div class="header-left">
					<a href="/" class="app-logo">
						<span class="logo-mark">PED</span>
						<span class="logo-text">CDS</span>
					</a>
					<span class="header-subtitle">Pediatric Emergency Decision Support</span>
				</div>
				<div class="header-right">
					<OfflineIndicator />
					<ThemeToggle />
				</div>
			</header>

			<PatientBanner />

			<div class="app-body">
				<aside class="app-sidebar">
					<ClinicalNav />
				</aside>
				<main class="app-main">
					<slot />
				</main>
			</div>
		</div>
	{/if}
</ThemeProvider>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.25rem;
		background-color: var(--color-surface);
		border-bottom: 1px solid var(--color-border-subtle);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-left {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.app-logo {
		text-decoration: none;
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
	}

	.logo-mark {
		font-family: var(--font-heading);
		font-size: 1.35rem;
		color: var(--color-primary);
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.logo-text {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.header-subtitle {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		display: none;
	}

	.app-body {
		display: flex;
		flex: 1;
	}

	.app-sidebar {
		width: 240px;
		flex-shrink: 0;
		background-color: var(--color-surface-inset);
		border-right: 1px solid var(--color-border-subtle);
		overflow-y: auto;
		padding: 1rem 0;
	}

	.app-main {
		flex: 1;
		padding: 1.5rem 2rem;
		overflow-y: auto;
		max-width: 1200px;
	}

	@media (max-width: 768px) {
		.app-sidebar { display: none; }
		.app-main { padding: 1rem; }
	}

	@media (min-width: 1024px) {
		.header-subtitle { display: inline; }
	}

	@media print {
		.app-header, .app-sidebar { display: none !important; }
		.app-main { padding: 0; max-width: 100%; }
	}
</style>
