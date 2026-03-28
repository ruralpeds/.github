<script lang="ts">
	const protocols = [
		{
			label: 'Sepsis Pathway',
			href: '/sepsis/pathway',
			icon: '🩸',
			desc: 'Recognition (PALS), fluid resuscitation, antibiotic selection, vasoactive support',
		},
	];

	const trees = [
		{ name: 'Pediatric Sepsis & Shock', file: 'pediatric_sepsis_shock_decision_tree.html', icon: '🩸' },
		{ name: 'Early-Onset Sepsis (Neonatal)', file: 'neonatal_eos_sepsis_decision_tree.html', icon: '🦠' },
		{ name: 'Neonatal Infectious Diseases', file: 'neonatal_infectious_diseases_decision_tree.html', icon: '🦠' },
	];

	const sepsisRef = [
		{ label: 'Fluid bolus (PALS)', value: '20 mL/kg isotonic NS or LR — repeat up to 60 mL/kg, reassess after each' },
		{ label: 'Fluid bolus (NRP)', value: '10 mL/kg NS over 5–10 min — more conservative in neonates' },
		{ label: 'Norepinephrine (1st line shock)', value: '0.05–2 mcg/kg/min IV — preferred for distributive shock' },
		{ label: 'Epinephrine (septic shock)', value: '0.05–1 mcg/kg/min IV — add if norepinephrine inadequate' },
		{ label: 'Dopamine', value: '5–20 mcg/kg/min IV — alternative 1st-line' },
		{ label: 'Hydrocortisone (refractory)', value: '2 mg/kg/day IV divided q6–8h — catecholamine-refractory or adrenal insufficiency' },
	];

	function openTree(f: string) { window.open(`/decision-trees/${f}`, '_blank'); }
</script>

<svelte:head><title>Sepsis — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Sepsis & Infectious Disease</h1>
		<p class="subtitle">Phoenix Sepsis · EOS pathway · Fluid resuscitation · Antibiotic stewardship</p>
	</div>

	<section>
		<h2 class="st">Protocols</h2>
		<div class="route-grid">
			{#each protocols as p}
				<a href={p.href} class="route-card">
					<span class="ri">{p.icon}</span>
					<div><div class="rn">{p.label}</div><div class="rd">{p.desc}</div></div>
					<span class="ra">→</span>
				</a>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="st">Decision Trees</h2>
		<div class="tree-row">
			{#each trees as t}
				<button class="tree-btn" on:click={() => openTree(t.file)}>{t.icon} {t.name} ↗</button>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="st">Vasoactive Quick Reference</h2>
		<div class="qr-table">
			{#each sepsisRef as r}
				<div class="qr-row">
					<span class="ql">{r.label}</span>
					<span class="qv">{r.value}</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.75rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.hero p { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.st { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.route-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 0.6rem; }
	.route-card {
		display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem;
		background: var(--color-surface); border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md); text-decoration: none; transition: border-color 0.15s;
	}
	.route-card:hover { border-color: var(--color-primary); }
	.ri { font-size: 1.5rem; flex-shrink: 0; }
	.rn { font-size: 0.88rem; font-weight: 600; color: var(--color-text); }
	.rd { font-size: 0.77rem; color: var(--color-text-muted); margin-top: 0.2rem; }
	.ra { color: var(--color-text-muted); margin-left: auto; }
	.tree-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tree-btn {
		padding: 0.45rem 1rem; background: var(--color-surface);
		border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);
		font-size: 0.82rem; color: var(--color-text-muted); cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
	}
	.tree-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.qr-table { border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.qr-row { display: grid; grid-template-columns: 220px 1fr; padding: 0.6rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); }
	.qr-row:last-child { border-bottom: none; }
	.qr-row:nth-child(odd) { background: var(--color-surface); }
	.ql { font-size: 0.8rem; font-weight: 600; color: var(--color-text-secondary); }
	.qv { font-family: var(--font-mono); font-size: 0.76rem; color: var(--color-text-muted); }
</style>
