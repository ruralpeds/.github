<script lang="ts">
	const quickLinks = [
		{
			label: 'IVF Sparkline Matrix',
			href: '/neonatal/ivf-matrix',
			icon: '💧',
			desc: 'GA-stratified fluid rate sparklines across day of life — all conditions',
			badge: 'Interactive',
			badgeColor: '#3b82f6',
		},
		{
			label: 'Respiratory Support',
			href: '/neonatal/respiratory',
			icon: '🫁',
			desc: 'CPAP titration, surfactant criteria, NIV escalation, HFOV',
		},
		{
			label: 'Fluid & Glucose',
			href: '/neonatal/fluids',
			icon: '🍬',
			desc: 'GIR calculation, dextrose gel, hypoglycemia protocol',
		},
		{
			label: 'Level II Protocols',
			href: '/neonatal/level-ii',
			icon: '📋',
			desc: 'Admission criteria, care bundles, escalation thresholds',
		},
		{
			label: 'Thermoregulation',
			href: '/neonatal/thermoregulation',
			icon: '🌡️',
			desc: 'Isolette targets, warming protocols, hypothermia management',
		},
		{
			label: 'Jaundice',
			href: '/neonatal/jaundice',
			icon: '🟡',
			desc: 'Bilirubin thresholds, phototherapy criteria, exchange indications',
		},
		{
			label: 'Growth Charts',
			href: '/neonatal/growth',
			icon: '📈',
			desc: 'Fenton 2013 and WHO curves, z-score calculation',
		},
	];

	const trees = [
		{ name: 'NRP Resuscitation', file: 'nrp_resuscitation_decision_tree.html', icon: '⚡', category: 'Resuscitation' },
		{ name: 'Pulmonary Disorders', file: 'neonatal_pulmonary_decision_tree.html', icon: '🫁', category: 'Respiratory' },
		{ name: 'Resp Escalation & NIV', file: 'neonatal_respiratory_escalation_decision_tree.html', icon: '💨', category: 'Respiratory' },
		{ name: 'Early-Onset Sepsis', file: 'neonatal_eos_sepsis_decision_tree.html', icon: '🦠', category: 'Infectious' },
		{ name: 'Seizures', file: 'neonatal_seizures_decision_tree.html', icon: '🧠', category: 'Neuro' },
		{ name: 'Glucose Management', file: 'neonatal_glucose_management_decision_tree.html', icon: '🍬', category: 'FEN' },
		{ name: 'Fluids, Electrolytes & Nutrition', file: 'neonatal_fen_decision_tree.html', icon: '💧', category: 'FEN' },
		{ name: 'Cardiac / PDA', file: 'neonatal_cardiac_pda_decision_tree.html', icon: '❤️', category: 'Cardiac' },
		{ name: 'Hematology', file: 'neonatal_hematology_decision_tree.html', icon: '🩸', category: 'Hematology' },
		{ name: 'Neurology', file: 'neonatal_neurology_decision_tree.html', icon: '🧠', category: 'Neuro' },
		{ name: 'GI & Liver', file: 'neonatal_gi_liver_decision_tree.html', icon: '🔬', category: 'GI' },
		{ name: 'Transport', file: 'neonatal_transport_decision_tree.html', icon: '🚑', category: 'Transport' },
	];

	function openTree(file: string) {
		window.open(`/decision-trees/${file}`, '_blank');
	}
</script>

<svelte:head><title>Neonatal — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Neonatal Clinical Support</h1>
		<p class="subtitle">Level II nursery · Late preterm 32–36 weeks · Stabilization · Transport</p>
	</div>

	<!-- Quick access tools -->
	<section>
		<h2 class="section-title">Clinical Tools</h2>
		<div class="tool-grid">
			{#each quickLinks as link}
				<a href={link.href} class="tool-card">
					<span class="tool-icon">{link.icon}</span>
					<div class="tool-body">
						<div class="tool-name">
							{link.label}
							{#if link.badge}
								<span class="tool-badge" style="background:{link.badgeColor}18;color:{link.badgeColor};border-color:{link.badgeColor}44">
									{link.badge}
								</span>
							{/if}
						</div>
						<div class="tool-desc">{link.desc}</div>
					</div>
					<span class="tool-arrow">→</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- IVF Calculator shortcut -->
	<section class="ivf-banner">
		<div class="ivf-banner-left">
			<span class="ivf-icon">💉</span>
			<div>
				<div class="ivf-title">Neonatal IVF Prescription Calculator</div>
				<div class="ivf-desc">Weight-based IVF prescription: fluid rate, GIR, fluid type, enteral offset, calorie tracking. Powered by rust-sci-core.</div>
			</div>
		</div>
		<a href="/decision-trees/neonatal_ivf_prescription_calculator.html" target="_blank" class="ivf-btn">
			Open Calculator ↗
		</a>
	</section>

	<!-- Decision trees -->
	<section>
		<h2 class="section-title">Decision Trees <span class="count">{trees.length}</span></h2>
		<div class="tree-grid">
			{#each trees as tree}
				<button class="tree-card" on:click={() => openTree(tree.file)}>
					<span class="tree-icon">{tree.icon}</span>
					<div class="tree-body">
						<span class="tree-name">{tree.name}</span>
						<span class="tree-cat">{tree.category}</span>
					</div>
					<span class="tree-arrow">↗</span>
				</button>
			{/each}
			<a href="/reference/decision-trees" class="tree-card tree-more">
				<span class="tree-icon">🌳</span>
				<div class="tree-body">
					<span class="tree-name">All 41 decision trees</span>
					<span class="tree-cat">Full reference library →</span>
				</div>
			</a>
		</div>
	</section>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 2rem; }
	.hero { padding-bottom: 0.5rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title {
		font-size: 1rem; font-weight: 600; color: var(--color-text-secondary);
		font-family: var(--font-body); margin-bottom: 0.85rem;
		display: flex; align-items: center; gap: 0.5rem;
	}
	.count {
		font-family: var(--font-mono); font-size: 0.75rem;
		background: var(--color-surface); border: 1px solid var(--color-border-subtle);
		padding: 0.1rem 0.45rem; border-radius: 10px; color: var(--color-text-muted);
	}

	/* Tool grid */
	.tool-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.6rem; }
	.tool-card {
		display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
		background: var(--color-surface); border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md); text-decoration: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.tool-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
	.tool-icon { font-size: 1.5rem; flex-shrink: 0; }
	.tool-body { flex: 1; min-width: 0; }
	.tool-name {
		font-size: 0.875rem; font-weight: 600; color: var(--color-text);
		display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;
	}
	.tool-badge {
		font-family: var(--font-mono); font-size: 0.6rem; font-weight: 600;
		padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid;
	}
	.tool-desc { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 0.2rem; line-height: 1.4; }
	.tool-arrow { color: var(--color-text-muted); font-size: 1rem; transition: color 0.15s, transform 0.15s; }
	.tool-card:hover .tool-arrow { color: var(--color-primary); transform: translateX(3px); }

	/* IVF banner */
	.ivf-banner {
		display: flex; align-items: center; justify-content: space-between; gap: 1rem;
		flex-wrap: wrap; padding: 1rem 1.25rem;
		background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
		border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
		border-radius: var(--radius-md);
	}
	.ivf-banner-left { display: flex; align-items: center; gap: 0.85rem; }
	.ivf-icon { font-size: 1.75rem; }
	.ivf-title { font-size: 0.9rem; font-weight: 600; color: var(--color-text); }
	.ivf-desc { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 0.2rem; max-width: 480px; }
	.ivf-btn {
		padding: 0.5rem 1.1rem; background: var(--color-primary); color: #000;
		border-radius: var(--radius-sm); text-decoration: none; font-size: 0.82rem;
		font-weight: 600; white-space: nowrap; transition: opacity 0.15s;
	}
	.ivf-btn:hover { opacity: 0.88; }

	/* Tree grid */
	.tree-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.45rem; }
	.tree-card {
		display: flex; align-items: center; gap: 0.65rem; padding: 0.65rem 0.9rem;
		background: var(--color-surface); border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-sm); cursor: pointer; text-align: left;
		font-family: var(--font-body); text-decoration: none;
		transition: border-color 0.15s; width: 100%;
	}
	.tree-card:hover { border-color: var(--color-primary); }
	.tree-more { border-style: dashed; }
	.tree-icon { font-size: 1.1rem; flex-shrink: 0; }
	.tree-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
	.tree-name { font-size: 0.83rem; font-weight: 600; color: var(--color-text); }
	.tree-cat { font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-text-muted); }
	.tree-arrow { font-size: 0.9rem; color: var(--color-text-muted); }
</style>
