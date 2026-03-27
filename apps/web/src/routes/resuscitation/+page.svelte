<script lang="ts">
	const svelteRoutes = [
		{ label: 'NRP Algorithm', href: '/resuscitation/nrp', icon: '👶', desc: 'Neonatal Resuscitation Program — golden minute, PPV, chest compressions, epinephrine', mode: 'neonatal' },
		{ label: 'PALS Algorithms', href: '/resuscitation/pals', icon: '⚡', desc: 'Pediatric Advanced Life Support — cardiac arrest, bradycardia, tachycardia, post-arrest', mode: 'pediatric' },
		{ label: 'Anaphylaxis', href: '/resuscitation/anaphylaxis', icon: '🚨', desc: 'Epinephrine dosing, antihistamines, airway management, biphasic risk', mode: 'pediatric' },
		{ label: 'Bradycardia', href: '/resuscitation/bradycardia', icon: '💔', desc: 'PALS bradycardia algorithm — atropine, pacing, epinephrine', mode: 'pediatric' },
		{ label: 'Tachycardia', href: '/resuscitation/tachycardia', icon: '💓', desc: 'SVT vs VT differentiation, adenosine, cardioversion', mode: 'pediatric' },
		{ label: 'Status Epilepticus', href: '/resuscitation/status-epilepticus', icon: '🧠', desc: 'Benzodiazepine escalation, phenobarbital, levetiracetam, refractory management', mode: 'pediatric' },
		{ label: 'DKA', href: '/resuscitation/dka', icon: '📊', desc: 'Fluid deficit, insulin, electrolyte replacement, cerebral edema monitoring', mode: 'pediatric' },
	];

	const treeLinks = [
		{ name: 'NRP Resuscitation', file: 'nrp_resuscitation_decision_tree.html', icon: '⚡' },
		{ name: 'PALS Algorithm', file: 'pals_algorithm_decision_tree.html', icon: '⚡' },
		{ name: 'Pediatric Sepsis & Shock', file: 'pediatric_sepsis_shock_decision_tree.html', icon: '🩸' },
		{ name: 'Pediatric Anaphylaxis', file: 'pediatric_anaphylaxis_decision_tree.html', icon: '🚨' },
	];

	function openTree(file: string) { window.open(`/decision-trees/${file}`, '_blank'); }
</script>

<svelte:head><title>Resuscitation — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Resuscitation</h1>
		<p class="subtitle">NRP · PALS · Medication dosing · Emergency algorithms · 2025 guidelines</p>
	</div>

	<section>
		<h2 class="section-title">Clinical Protocols</h2>
		<div class="route-grid">
			{#each svelteRoutes as r}
				<a href={r.href} class="route-card">
					<span class="route-icon">{r.icon}</span>
					<div class="route-body">
						<div class="route-name">{r.label}</div>
						<div class="route-desc">{r.desc}</div>
					</div>
					<span class="route-arrow">→</span>
				</a>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Decision Trees</h2>
		<div class="tree-row">
			{#each treeLinks as t}
				<button class="tree-btn" on:click={() => openTree(t.file)}>
					{t.icon} {t.name} ↗
				</button>
			{/each}
		</div>
	</section>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.75rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.route-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 0.6rem; }
	.route-card {
		display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem;
		background: var(--color-surface); border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md); text-decoration: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.route-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
	.route-icon { font-size: 1.5rem; flex-shrink: 0; }
	.route-body { flex: 1; }
	.route-name { font-size: 0.88rem; font-weight: 600; color: var(--color-text); }
	.route-desc { font-size: 0.77rem; color: var(--color-text-muted); margin-top: 0.2rem; line-height: 1.4; }
	.route-arrow { color: var(--color-text-muted); transition: color 0.15s, transform 0.15s; }
	.route-card:hover .route-arrow { color: var(--color-primary); transform: translateX(3px); }
	.tree-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tree-btn {
		padding: 0.45rem 1rem; background: var(--color-surface);
		border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);
		font-family: var(--font-body); font-size: 0.82rem; color: var(--color-text-muted);
		cursor: pointer; transition: border-color 0.15s, color 0.15s;
	}
	.tree-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
</style>
