<script lang="ts">
	const sections = [
		{
			label: 'Decision Trees',
			href: '/reference/decision-trees',
			icon: '🌳',
			desc: '41 interactive clinical decision trees — neonatal, pediatric, obstetric. Opens full-screen D3 visualization.',
			count: '41 trees',
		},
		{
			label: 'Calculators',
			href: '/reference/calculators',
			icon: '🧮',
			desc: 'Weight-based calculators: IVF prescription, Phoenix Sepsis Score, pSOFA, PECARN, and more.',
			count: '4+ calculators',
		},
		{
			label: 'Education Guides',
			href: '/reference/education',
			icon: '📘',
			desc: 'Comprehensive neonatal education guides, textbooks, and audio textbooks for Level II nursery.',
			count: '29 guides · 14 textbooks',
		},
		{
			label: 'Knowledge Registry',
			href: '/reference/knowledge',
			icon: '📚',
			desc: '150+ indexed artifacts — search by title, category, or tag across all project content.',
			count: '150 entries',
		},
	];
</script>

<svelte:head><title>Reference — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Clinical Reference</h1>
		<p class="subtitle">Decision trees · Calculators · Education guides · Knowledge registry</p>
	</div>

	<div class="section-grid">
		{#each sections as s}
			<a href={s.href} class="section-card">
				<div class="card-top">
					<span class="card-icon">{s.icon}</span>
					<span class="card-count">{s.count}</span>
				</div>
				<div class="card-name">{s.label}</div>
				<div class="card-desc">{s.desc}</div>
				<span class="card-cta">Browse →</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 2rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 0.85rem; }
	.section-card {
		display: flex; flex-direction: column; gap: 0.5rem; padding: 1.25rem;
		background: var(--color-surface); border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md); text-decoration: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.section-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-md); }
	.card-top { display: flex; justify-content: space-between; align-items: center; }
	.card-icon { font-size: 1.75rem; }
	.card-count {
		font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-text-muted);
		background: var(--color-surface-raised, var(--color-border-subtle));
		padding: 0.1rem 0.5rem; border-radius: 10px;
		border: 1px solid var(--color-border-subtle);
	}
	.card-name { font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-text); }
	.card-desc { font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.55; flex: 1; }
	.card-cta { font-size: 0.82rem; color: var(--color-primary); font-weight: 600; margin-top: 0.25rem; }
</style>
