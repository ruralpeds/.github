<script lang="ts">
	const protocols = [
		{
			label: 'Bradycardia',
			href: '/resuscitation/bradycardia',
			icon: '💔',
			desc: 'PALS bradycardia algorithm — atropine, pacing, epinephrine. HR < 60 with poor perfusion.',
		},
		{
			label: 'Tachycardia',
			href: '/resuscitation/tachycardia',
			icon: '💓',
			desc: 'SVT vs VT differentiation, adenosine dosing, synchronized cardioversion.',
		},
	];

	const trees = [
		{ name: 'Pediatric Cardiac Emergencies', file: 'pediatric_cardiac_emergencies_decision_tree.html', icon: '❤️' },
		{ name: 'Neonatal Cardiac / PDA', file: 'neonatal_cardiac_pda_decision_tree.html', icon: '👶' },
		{ name: 'PALS Algorithm', file: 'pals_algorithm_decision_tree.html', icon: '⚡' },
	];

	const arrhythmias = [
		{ rhythm: 'SVT', features: 'HR > 220 (infant) / > 180 (child), narrow complex, abrupt onset, P wave absent/retrograde', tx: 'Vagal → Adenosine 0.1 mg/kg IV (max 6 mg), double if ineffective (max 12 mg)' },
		{ rhythm: 'VT (stable)', features: 'Wide complex, rate 120–250, AV dissociation, fusion beats', tx: 'Amiodarone 5 mg/kg IV over 20–60 min or Procainamide 15 mg/kg IV' },
		{ rhythm: 'VT (unstable)', features: 'Wide complex + poor perfusion / pulseless', tx: 'Synchronized cardioversion 1 J/kg → 2 J/kg; if pulseless → PALS arrest' },
		{ rhythm: 'Complete Heart Block', features: 'AV dissociation, wide escape, bradycardia', tx: 'Atropine 0.02 mg/kg (min 0.1 mg); transcutaneous pacing; Epi if refractory' },
		{ rhythm: 'WPW / Pre-excitation', features: 'Delta wave, short PR, wide QRS; risk of rapid AF', tx: 'Avoid adenosine/digoxin in WPW+AF; use procainamide or cardioversion' },
	];

	const cardioversion = [
		{ label: 'Synchronized cardioversion', dose: '0.5–1 J/kg initial; 2 J/kg if no conversion' },
		{ label: 'Defibrillation (VF/pVT)', dose: '2 J/kg initial; 4 J/kg subsequent; max 10 J/kg or adult dose' },
		{ label: 'Adenosine', dose: '0.1 mg/kg IV rapid push (max 6 mg first dose); 0.2 mg/kg if no effect (max 12 mg)' },
		{ label: 'Amiodarone (VT/VF)', dose: '5 mg/kg IV over 20–60 min (stable VT); 5 mg/kg rapid push (pulseless VT/VF)' },
		{ label: 'Atropine (bradycardia)', dose: '0.02 mg/kg IV (min 0.1 mg, max 0.5 mg child / 1 mg adolescent)' },
		{ label: 'Epinephrine (arrest)', dose: '0.01 mg/kg (0.1 mL/kg of 0.1 mg/mL) IV/IO q3–5 min' },
	];

	function openTree(file: string) { window.open(`/decision-trees/${file}`, '_blank'); }
</script>

<svelte:head><title>Cardiac — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Cardiac Emergencies</h1>
		<p class="subtitle">Arrhythmias · Cardioversion · Congenital heart disease · PALS 2020</p>
	</div>

	<section>
		<h2 class="section-title">Protocols</h2>
		<div class="route-grid">
			{#each protocols as p}
				<a href={p.href} class="route-card">
					<span class="ri">{p.icon}</span>
					<div class="rb">
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
		<h2 class="section-title">Arrhythmia Recognition & Management</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr><th>Rhythm</th><th>Key Features</th><th>Treatment</th></tr>
				</thead>
				<tbody>
					{#each arrhythmias as r}
						<tr>
							<td class="rhythm-cell">{r.rhythm}</td>
							<td>{r.features}</td>
							<td class="tx-cell">{r.tx}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Drug Dosing Quick Reference</h2>
		<div class="dose-grid">
			{#each cardioversion as d}
				<div class="dose-card">
					<div class="dose-name">{d.label}</div>
					<div class="dose-val">{d.dose}</div>
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
	.route-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.6rem; }
	.route-card {
		display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem;
		background: var(--color-surface); border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md); text-decoration: none; transition: border-color 0.15s;
	}
	.route-card:hover { border-color: var(--color-primary); }
	.ri { font-size: 1.5rem; flex-shrink: 0; }
	.rb { flex: 1; }
	.rn { font-size: 0.88rem; font-weight: 600; color: var(--color-text); }
	.rd { font-size: 0.77rem; color: var(--color-text-muted); margin-top: 0.2rem; line-height: 1.4; }
	.ra { color: var(--color-text-muted); }
	.tree-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tree-btn {
		padding: 0.45rem 1rem; background: var(--color-surface);
		border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);
		font-family: var(--font-body); font-size: 0.82rem; color: var(--color-text-muted);
		cursor: pointer; transition: border-color 0.15s, color 0.15s;
	}
	.tree-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
	.clin-table th {
		padding: 0.6rem 0.9rem; text-align: left; font-size: 0.75rem; font-weight: 600;
		color: var(--color-text-secondary); background: var(--color-surface);
		border-bottom: 1px solid var(--color-border-subtle);
	}
	.clin-table td { padding: 0.6rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; line-height: 1.45; color: var(--color-text-muted); }
	.clin-table tr:last-child td { border-bottom: none; }
	.clin-table tbody tr:nth-child(odd) td { background: color-mix(in srgb, var(--color-surface) 60%, transparent); }
	.rhythm-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.tx-cell { font-family: var(--font-mono); font-size: 0.77rem; }
	.dose-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5rem; }
	.dose-card {
		padding: 0.75rem 1rem; background: var(--color-surface);
		border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);
	}
	.dose-name { font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.3rem; }
	.dose-val { font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.5; }
</style>
