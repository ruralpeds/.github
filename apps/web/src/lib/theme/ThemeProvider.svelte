<script lang="ts">
	import { theme, isDark } from './store';
	import type { Theme } from './types';

	// Convert a Theme object to CSS custom property declarations
	function themeToCSSVars(t: Theme): string {
		const vars: string[] = [];

		// Colors
		for (const [key, value] of Object.entries(t.colors)) {
			// camelCase → kebab-case: surfaceRaised → surface-raised
			const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
			vars.push(`--color-${kebab}: ${value}`);
		}

		// Typography
		vars.push(`--font-heading: ${t.typography.fontHeading}`);
		vars.push(`--font-body: ${t.typography.fontBody}`);
		vars.push(`--font-mono: ${t.typography.fontMono}`);
		vars.push(`--line-height-body: ${t.typography.lineHeightBody}`);
		vars.push(`--line-height-heading: ${t.typography.lineHeightHeading}`);

		// Shadows
		for (const [key, value] of Object.entries(t.shadows)) {
			vars.push(`--shadow-${key}: ${value}`);
		}

		// Radii
		for (const [key, value] of Object.entries(t.radii)) {
			vars.push(`--radius-${key}: ${value}`);
		}

		return vars.join('; ');
	}

	$: cssVars = themeToCSSVars($theme);
	$: darkClass = $isDark ? 'theme-dark' : 'theme-light';
</script>

<div
	class="theme-root {darkClass}"
	style={cssVars}
	data-theme={$theme.id}
>
	<slot />
</div>

<style>
	.theme-root {
		/* Apply theme tokens to the root container */
		background-color: var(--color-background);
		color: var(--color-text);
		font-family: var(--font-body);
		line-height: var(--line-height-body);
		min-height: 100vh;
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	/* Scrollbar theming */
	.theme-root :global(::-webkit-scrollbar) {
		width: 8px;
		height: 8px;
	}
	.theme-root :global(::-webkit-scrollbar-track) {
		background: transparent;
	}
	.theme-root :global(::-webkit-scrollbar-thumb) {
		background-color: var(--color-scrollbar);
		border-radius: var(--radius-full);
	}
	.theme-root :global(::-webkit-scrollbar-thumb:hover) {
		background-color: var(--color-scrollbar-hover);
	}

	/* Global focus ring */
	.theme-root :global(:focus-visible) {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	/* Print theme override */
	@media print {
		.theme-root {
			background-color: #ffffff !important;
			color: #000000 !important;
		}
	}
</style>
