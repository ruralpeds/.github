<script lang="ts">
	const calcs = [
		{ name: 'Pediatric IVF Management', file: 'pediatric_ivf_calculator.html', icon: '💧', desc: 'Holliday-Segar, dehydration, burns, fluid restriction, fluid composition' },
		{ name: 'IVF Educational Reference', file: 'pediatric_ivf_educational.html', icon: '📖', desc: 'Teaching mode with clinical reasoning and guideline context' },
		{ name: 'Electrolyte & Special Populations', file: 'pediatric_electrolyte_calculator.html', icon: '⚗️', desc: 'Na/K/Ca/Mg/PO4 correction, DKA fluids, burn resuscitation, renal dosing' },
	];

	function openCalc(file: string) {
		window.open(`/calculators/${file}`, '_blank');
	}
</script>

<svelte:head><title>Calculators — PED CDS</title></svelte:head>

<div class="page">
	<h1 class="title">Interactive Calculators</h1>
	<p class="desc">Weight-based clinical calculators with real-time computation, charts, and guideline references. Each opens as a standalone full-screen tool.</p>

	<div class="grid">
		{#each calcs as calc}
			<button class="card" on:click={() => openCalc(calc.file)}>
				<span class="card__icon">{calc.icon}</span>
				<div class="card__content">
					<span class="card__name">{calc.name}</span>
					<span class="card__desc">{calc.desc}</span>
				</div>
				<span class="card__arrow">↗</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.5rem; }
	.title { font-family: var(--font-heading); font-size: 1.5rem; color: var(--color-text); }
	.desc { font-size: 0.9375rem; color: var(--color-text-muted); max-width: 640px; line-height: 1.5; }
	.grid { display: flex; flex-direction: column; gap: 0.5rem; max-width: 600px; }
	.card { display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.25rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); cursor: pointer; text-align: left; font-family: var(--font-body); transition: border-color 0.15s, box-shadow 0.15s; width: 100%; }
	.card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
	.card__icon { font-size: 1.75rem; flex-shrink: 0; }
	.card__content { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
	.card__name { font-size: 0.9375rem; font-weight: 600; color: var(--color-text); }
	.card__desc { font-size: 0.8125rem; color: var(--color-text-muted); line-height: 1.4; }
	.card__arrow { font-size: 1rem; color: var(--color-text-muted); transition: color 0.15s, transform 0.15s; }
	.card:hover .card__arrow { color: var(--color-primary); transform: translate(2px, -2px); }
</style>
