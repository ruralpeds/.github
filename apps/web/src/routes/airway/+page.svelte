<script lang="ts">
	const protocols = [
		{
			label: 'Rapid Sequence Intubation',
			href: '/airway/rapid-sequence',
			icon: '⚡',
			desc: 'RSI drug selection, dosing by weight, SALAD technique, post-intubation care',
		},
	];

	const trees = [
		{ name: 'Pediatric Difficult Airway', file: 'pediatric_difficult_airway_decision_tree.html', icon: '🌬️' },
		{ name: 'NRP Resuscitation', file: 'nrp_resuscitation_decision_tree.html', icon: '👶' },
		{ name: 'Resp Escalation & NIV', file: 'neonatal_respiratory_escalation_decision_tree.html', icon: '💨' },
	];

	const quickRef = [
		{ label: 'ETT size', formula: 'Age/4 + 4 (uncuffed) · Age/4 + 3.5 (cuffed)' },
		{ label: 'ETT depth (lip)', formula: '(Age/2 + 12) cm' },
		{ label: 'Suction catheter', formula: 'ETT size × 2' },
		{ label: 'LMA size', formula: '<5 kg=1 · 5–10=1.5 · 10–20=2 · 20–30=2.5 · 30–50=3' },
		{ label: 'Cricoid pressure', formula: 'Selick maneuver — avoid if suspected C-spine injury' },
	];

	function openTree(file: string) { window.open(`/decision-trees/${file}`, '_blank'); }
</script>

<svelte:head><title>Airway — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Airway Management</h1>
		<p class="subtitle">RSI · Difficult airway · NIV · Equipment sizing · CICO rescue</p>
	</div>

	<section>
		<h2 class="section-title">Protocols</h2>
		<div class="route-grid">
			{#each protocols as p}
				<a href={p.href} class="route-card">
					<span class="ri">{p.icon}</span>
					<div>
						<div class="rn">{p.label}</div>
						<div class="rd">{p.desc}</div>
					</div>
					<span class="ra">→</span>
				</a>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Decision Trees</h2>
		<div class="tree-row">
			{#each trees as t}
				<button class="tree-btn" on:click={() => openTree(t.file)}>
					{t.icon} {t.name} ↗
				</button>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Quick Reference</h2>
		<div class="qr-table">
			{#each quickRef as q}
				<div class="qr-row">
					<span class="qr-label">{q.label}</span>
					<span class="qr-formula">{q.formula}</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.75rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.route-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 0.6rem; }
	.route-card {
		display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem;
		background: var(--color-surface); border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md); text-decoration: none;
		transition: border-color 0.15s;
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
		font-family: var(--font-body); font-size: 0.82rem; color: var(--color-text-muted); cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
	}
	.tree-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.qr-table { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.qr-row { display: grid; grid-template-columns: 160px 1fr; padding: 0.6rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); }
	.qr-row:last-child { border-bottom: none; }
	.qr-row:nth-child(odd) { background: var(--color-surface); }
	.qr-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text-secondary); }
	.qr-formula { font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-text-muted); }
</style>
