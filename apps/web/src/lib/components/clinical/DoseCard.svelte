<script lang="ts">
	/**
	 * DoseCard — Displays a single medication dose with weight-based calculations.
	 * Receives pre-computed data from the WASM layer. Contains zero clinical logic.
	 */

	export let drug: string;
	export let doseMg: number;
	export let doseMl: number | null = null;
	export let concentration: string;
	export let route: string;
	export let maxDoseMg: number | null = null;
	export let isCapped: boolean = false;
	export let warnings: string[] = [];

	function fmt(n: number, decimals: number = 2): string {
		return n.toFixed(decimals).replace(/\.?0+$/, '');
	}
</script>

<div class="dose-card" class:dose-card--capped={isCapped}>
	<div class="dose-card__header">
		<h4 class="dose-card__drug">{drug}</h4>
		<span class="dose-card__route">{route}</span>
	</div>

	<div class="dose-card__body">
		<div class="dose-card__primary">
			<span class="dose-value">{fmt(doseMg)}</span>
			<span class="dose-unit">mg</span>
		</div>

		{#if doseMl !== null}
			<div class="dose-card__secondary">
				<span class="dose-value--ml">{fmt(doseMl)}</span>
				<span class="dose-unit--ml">mL</span>
				<span class="dose-conc">({concentration})</span>
			</div>
		{/if}

		{#if isCapped && maxDoseMg !== null}
			<div class="dose-card__cap">
				Capped at maximum: {fmt(maxDoseMg)} mg
			</div>
		{/if}
	</div>

	{#if warnings.length > 0}
		<div class="dose-card__warnings">
			{#each warnings as warning}
				<p class="dose-warning">⚠ {warning}</p>
			{/each}
		</div>
	{/if}
</div>

<style>
	.dose-card {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		padding: 1rem;
		transition: border-color 0.15s ease;
	}

	.dose-card--capped {
		border-left: 4px solid var(--color-warning);
	}

	.dose-card__header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.5rem;
	}

	.dose-card__drug {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.dose-card__route {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		background-color: var(--color-surface-inset);
		padding: 0.1rem 0.4rem;
		border-radius: var(--radius-sm);
	}

	.dose-card__body {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.dose-card__primary {
		display: flex;
		align-items: baseline;
		gap: 0.3rem;
	}

	.dose-value {
		font-family: var(--font-mono);
		font-size: 1.75rem;
		font-weight: 600;
		color: var(--color-text);
		line-height: 1;
	}

	.dose-unit {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.dose-card__secondary {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
	}

	.dose-value--ml {
		font-family: var(--font-mono);
		font-size: 1.15rem;
		font-weight: 500;
		color: var(--color-primary);
	}

	.dose-unit--ml {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-primary);
	}

	.dose-conc {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.dose-card__cap {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-warning);
		font-weight: 500;
		margin-top: 0.25rem;
	}

	.dose-card__warnings {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	.dose-warning {
		font-size: 0.8125rem;
		color: var(--color-urgent);
		line-height: 1.4;
		margin: 0.15rem 0;
	}
</style>
