<script lang="ts">
	// AAP 2022 phototherapy thresholds (simplified — nomogram-based)
	// Risk stratification: neurotoxicity risk factors present or absent
	// Thresholds shown as TSB mg/dL at which to START phototherapy

	// Phototherapy START thresholds (mg/dL) — AAP 2022
	// Based on gestational age at birth and postnatal age in hours
	// Simplified from phototherapy nomogram
	const photoThresholds = [
		{ ga: '38–40 wk (low risk)', h24: '10', h48: '13', h72: '15', h96: '17', h120plus: '17' },
		{ ga: '38–40 wk (medium risk*)', h24: '8', h48: '11', h72: '13', h96: '15', h120plus: '15' },
		{ ga: '38–40 wk (high risk†)', h24: '6', h48: '9', h72: '11', h96: '13', h120plus: '13' },
		{ ga: '35–37 wk (low risk)', h24: '9', h48: '12', h72: '14', h96: '15', h120plus: '15' },
		{ ga: '35–37 wk (medium risk)', h24: '7', h48: '10', h72: '12', h96: '13', h120plus: '13' },
		{ ga: '35–37 wk (high risk)', h24: '5', h48: '8', h72: '10', h96: '11', h120plus: '11' },
	];

	// Exchange transfusion START thresholds ≈ phototherapy + 5 mg/dL (simplified)
	const exchangeThresholds = [
		{ ga: '≥ 38 wk, no risk factors', thresholds: 'Exchange if TSB ≥ 20–22 mg/dL despite intensive phototherapy OR TSB rising ≥ 0.5 mg/dL/h on intensive phototherapy' },
		{ ga: '35–37 wk, no risk factors', thresholds: 'Exchange if TSB ≥ 18–20 mg/dL' },
		{ ga: 'Any GA with isoimmune hemolysis / G6PD deficiency', thresholds: 'Exchange threshold lower by 2 mg/dL; escalate rapidly' },
		{ ga: 'Acute bilirubin encephalopathy (ABE)', thresholds: 'Immediate exchange regardless of TSB level' },
	];

	const riskFactors = [
		{ label: 'Medium / Higher risk factors', items: ['Isoimmune hemolytic disease (ABO, Rh, minor antigen)', 'G6PD deficiency', 'Asphyxia / sepsis / acidosis', 'Albumin < 3.0 g/dL', 'Gestational age 35–37 6/7 weeks'] },
		{ label: 'High-risk (lower thresholds)', items: ['All of above PLUS clinical signs of acute bilirubin encephalopathy (ABE): hypertonia, arching, retrocollis, opisthotonos, fever, high-pitched cry'] },
	];

	const phototherapyTechnique = [
		{ param: 'Intensive phototherapy', value: 'All visible skin exposed; bili-blanket below + overhead LED unit; eye protection required' },
		{ param: 'Irradiance target', value: '≥ 30 μW/cm²/nm at skin surface for intensive therapy' },
		{ param: 'Distance', value: 'Phototherapy unit as close to infant as safe per manufacturer (typically 10–15 cm for LED)' },
		{ param: 'Fluid management', value: 'Increase IVF by 10% during phototherapy; monitor for dehydration; avoid unnecessary breaks' },
		{ param: 'Rebound TSB', value: 'Check TSB 12–24 h after stopping phototherapy (especially preterm or hemolytic disease)' },
		{ param: 'Response monitoring', value: 'Recheck TSB 4–6 h after starting; 12–24 h after stable' },
	];

	const abeSigns = [
		'Lethargy, poor tone, poor suck',
		'High-pitched cry or irritability',
		'Hypertonia (arching, retrocollis, opisthotonos)',
		'Fever',
		'Opisthotonus, seizures (late/severe)',
	];

	const trees = [
		{ name: 'Neonatal Hematology', file: 'neonatal_hematology_decision_tree.html', icon: '🩸' },
	];

	function openTree(file: string) { window.open(`/decision-trees/${file}`, '_blank'); }
</script>

<svelte:head><title>Neonatal Jaundice — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Neonatal Jaundice &amp; Hyperbilirubinemia</h1>
		<p class="subtitle">AAP 2022 guidelines · Phototherapy thresholds · Exchange transfusion · ABE recognition</p>
	</div>

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

	<div class="alert-box urgent">
		<span class="alert-icon">⚠</span>
		<div>
			<strong>Acute Bilirubin Encephalopathy (ABE)</strong> — signs below require <strong>immediate exchange transfusion</strong> regardless of TSB level.
			<ul class="abe-list">
				{#each abeSigns as sign}
					<li>{sign}</li>
				{/each}
			</ul>
		</div>
	</div>

	<section>
		<h2 class="section-title">Phototherapy Start Thresholds — TSB (mg/dL) by Age</h2>
		<p class="source-note">Source: AAP Clinical Practice Guideline, Pediatrics 2022. Risk factors: isoimmune hemolysis, G6PD deficiency, asphyxia, sepsis, acidosis, albumin &lt; 3.0, GA 35–37 6/7 wk. *Medium risk = 1 factor. †High risk = ≥ 2 factors or ABE signs.</p>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr><th>GA / Risk</th><th>24 h</th><th>48 h</th><th>72 h</th><th>96 h</th><th>≥ 120 h</th></tr>
				</thead>
				<tbody>
					{#each photoThresholds as r}
						<tr>
							<td class="bold-cell">{r.ga}</td>
							<td class="mono-cell">{r.h24}</td>
							<td class="mono-cell">{r.h48}</td>
							<td class="mono-cell">{r.h72}</td>
							<td class="mono-cell">{r.h96}</td>
							<td class="mono-cell">{r.h120plus}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="table-note">These are simplified threshold values. Use the official AAP 2022 nomogram (hour-specific TSB curve) for clinical decision-making. Always assess risk factors before applying thresholds.</p>
	</section>

	<section>
		<h2 class="section-title">Exchange Transfusion Thresholds</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>GA / Condition</th><th>Exchange Trigger</th></tr></thead>
				<tbody>
					{#each exchangeThresholds as e}
						<tr><td class="bold-cell">{e.ga}</td><td>{e.thresholds}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Risk Factor Classification</h2>
		<div class="rf-grid">
			{#each riskFactors as rf}
				<div class="rf-card">
					<div class="rf-name">{rf.label}</div>
					<ul class="rf-list">
						{#each rf.items as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Phototherapy Technique</h2>
		<div class="param-table">
			{#each phototherapyTechnique as p}
				<div class="param-row">
					<span class="param-label">{p.param}</span>
					<span class="param-val">{p.value}</span>
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
	.tree-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tree-btn {
		padding: 0.45rem 1rem; background: var(--color-surface);
		border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);
		font-family: var(--font-body); font-size: 0.82rem; color: var(--color-text-muted);
		cursor: pointer; transition: border-color 0.15s, color 0.15s;
	}
	.tree-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.alert-box {
		display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.85rem 1rem;
		border-radius: var(--radius-sm); font-size: 0.82rem; line-height: 1.55;
	}
	.alert-box.urgent {
		background: color-mix(in srgb, var(--color-error, #f87171) 10%, var(--color-surface));
		border: 1px solid color-mix(in srgb, var(--color-error, #f87171) 40%, transparent);
		color: var(--color-text-muted);
	}
	.alert-icon { font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
	.alert-box strong { color: var(--color-text); }
	.abe-list { list-style: none; padding: 0; margin: 0.4rem 0 0; display: flex; flex-direction: column; gap: 0.15rem; }
	.abe-list li { padding-left: 0.9rem; position: relative; font-size: 0.79rem; }
	.abe-list li::before { content: '·'; position: absolute; left: 0; color: var(--color-error, #f87171); }
	.source-note { font-size: 0.75rem; color: var(--color-text-muted); font-style: italic; margin-bottom: 0.6rem; line-height: 1.5; }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
	.clin-table th { padding: 0.55rem 0.9rem; text-align: left; font-size: 0.73rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-muted); line-height: 1.45; vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.8rem; text-align: center; }
	.table-note { font-size: 0.74rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; line-height: 1.5; }
	.rf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.6rem; }
	.rf-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1rem; }
	.rf-name { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.5rem; }
	.rf-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.rf-list li { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; padding-left: 0.9rem; position: relative; }
	.rf-list li::before { content: '·'; position: absolute; left: 0; color: var(--color-primary); }
	.param-table { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.param-row { display: grid; grid-template-columns: 220px 1fr; gap: 0.75rem; padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); }
	.param-row:last-child { border-bottom: none; }
	.param-row:nth-child(odd) { background: var(--color-surface); }
	.param-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.param-val { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.5; }
</style>
