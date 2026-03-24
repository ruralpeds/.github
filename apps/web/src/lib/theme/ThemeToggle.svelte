<script lang="ts">
	import { allThemes, activeThemeId, setTheme } from './store';
	import type { Theme } from './types';

	let themes: Record<string, Theme>;
	let currentId: string;

	$: themes = $allThemes;
	$: currentId = $activeThemeId;

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		setTheme(target.value);
	}
</script>

<div class="theme-toggle">
	<label for="theme-select" class="theme-toggle__label">
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			aria-hidden="true"
		>
			<!-- Sun/moon icon -->
			<circle cx="8" cy="8" r="3" />
			<path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
		</svg>
		Theme
	</label>
	<select
		id="theme-select"
		value={currentId}
		on:change={handleChange}
		class="theme-toggle__select"
	>
		{#each Object.values(themes) as t (t.id)}
			<option value={t.id}>{t.name}</option>
		{/each}
	</select>
</div>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.theme-toggle__label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.8125rem;
		font-family: var(--font-body);
		color: var(--color-text-secondary);
		white-space: nowrap;
		cursor: pointer;
	}

	.theme-toggle__select {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background-color: var(--color-surface);
		color: var(--color-text);
		cursor: pointer;
		transition: border-color 0.15s ease;
	}

	.theme-toggle__select:hover {
		border-color: var(--color-border-strong);
	}
</style>
