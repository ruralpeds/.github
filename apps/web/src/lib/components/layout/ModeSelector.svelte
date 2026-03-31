<script lang="ts">
	import { selectMode, MODE_CONFIGS } from '$lib/stores/mode';
	import type { ClinicalMode } from '$lib/stores/mode';

	function choose(mode: string) {
		selectMode(mode as ClinicalMode);
	}
</script>

<div class="mode-selector">
	<div class="mode-selector__inner">
		<div class="mode-header">
			<h1 class="mode-title">
				<span class="title-mark">PED</span>
				<span class="title-cds">CDS</span>
			</h1>
			<p class="mode-subtitle">Pediatric Emergency Medicine<br />Clinical Decision Support</p>
			<p class="mode-prompt">Select clinical mode to begin</p>
		</div>

		<div class="mode-cards">
			{#each Object.entries(MODE_CONFIGS) as [key, config]}
				<button
					class="mode-card"
					on:click={() => choose(key)}
				>
					<span class="mode-card__icon">{config.icon}</span>
					<div class="mode-card__content">
						<h2 class="mode-card__title">{config.label}</h2>
						<p class="mode-card__desc">{config.description}</p>
					</div>
					<div class="mode-card__meta">
						<span class="meta-item">
							Weight: {config.weightRange.minKg}–{config.weightRange.maxKg} {config.weightUnit}
						</span>
						{#if config.showGestationalAge}
							<span class="meta-item">Gestational age input</span>
						{/if}
						{#if config.useBroselow}
							<span class="meta-item">Broselow color coding</span>
						{/if}
					</div>
					<div class="mode-card__arrow">→</div>
				</button>
			{/each}
		</div>

		<p class="mode-footer">
			Mode can be changed at any time from the patient banner.
		</p>
	</div>
</div>

<style>
	.mode-selector {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background-color: var(--color-background);
	}

	.mode-selector__inner {
		max-width: 640px;
		width: 100%;
	}

	.mode-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.mode-title {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.35rem;
		margin-bottom: 0.75rem;
	}

	.title-mark {
		font-family: var(--font-heading);
		font-size: 2.5rem;
		color: var(--color-primary);
		letter-spacing: -0.03em;
	}

	.title-cds {
		font-family: var(--font-mono);
		font-size: 1.25rem;
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.mode-subtitle {
		font-size: 1.05rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-bottom: 1.5rem;
	}

	.mode-prompt {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.mode-cards {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.mode-card {
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto auto;
		gap: 0 1rem;
		align-items: start;
		padding: 1.25rem 1.5rem;
		background-color: var(--color-surface);
		border: 2px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-body);
		transition: border-color 0.15s ease, box-shadow 0.2s ease, transform 0.1s ease;
		width: 100%;
	}

	.mode-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
		transform: translateY(-1px);
	}

	.mode-card:active {
		transform: translateY(0);
	}

	.mode-card__icon {
		font-size: 2.25rem;
		grid-row: 1 / 3;
		align-self: center;
	}

	.mode-card__content {
		grid-column: 2;
		grid-row: 1;
	}

	.mode-card__title {
		font-family: var(--font-heading);
		font-size: 1.35rem;
		color: var(--color-text);
		margin: 0 0 0.2rem;
	}

	.mode-card__desc {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.4;
		margin: 0;
	}

	.mode-card__meta {
		grid-column: 2;
		grid-row: 2;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.5rem;
	}

	.meta-item {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-text-muted);
		background-color: var(--color-surface-inset);
		padding: 0.15rem 0.45rem;
		border-radius: var(--radius-sm);
	}

	.mode-card__arrow {
		grid-column: 3;
		grid-row: 1 / 3;
		align-self: center;
		font-size: 1.5rem;
		color: var(--color-text-muted);
		transition: color 0.15s, transform 0.15s;
	}

	.mode-card:hover .mode-card__arrow {
		color: var(--color-primary);
		transform: translateX(3px);
	}

	.mode-footer {
		text-align: center;
		margin-top: 1.5rem;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}
</style>
