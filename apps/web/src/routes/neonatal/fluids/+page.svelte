<script lang="ts">
	const trees = [
		{ name: 'Glucose Management (32–35 wk)', file: 'neonatal_glucose_management_decision_tree.html', icon: '🍬' },
		{ name: 'Fluids, Electrolytes & Nutrition', file: 'neonatal_fen_decision_tree.html', icon: '💧' },
		{ name: 'Neonatal IVF Calculator', file: 'neonatal_ivf_prescription_calculator.html', icon: '💉' },
	];

	const fluidRates = [
		{ ga: '< 28 wk', dol0: '80–100', dol1: '100–120', dol2: '120–140', dol7: '140–160' },
		{ ga: '28–31 wk', dol0: '70–80', dol1: '80–100', dol2: '100–120', dol7: '130–150' },
		{ ga: '32–35 wk', dol0: '60–70', dol1: '70–90', dol2: '90–110', dol7: '120–140' },
		{ ga: '≥ 36 wk / Term', dol0: '60', dol1: '60–80', dol2: '80–100', dol7: '100–120' },
	];

	const girGuide = [
		{ state: 'Starting GIR', value: '4–6 mg/kg/min', note: 'Preterm; use 6–8 for IUGR, IDM' },
		{ state: 'Target GIR', value: '8–12 mg/kg/min', note: 'Full nutrition support' },
		{ state: 'Hypoglycemia rescue', value: 'Mini-bolus: D10W 2 mL/kg IV push, then increase GIR by 2 mg/kg/min', note: 'For BG < 40 mg/dL' },
		{ state: 'GIR formula', value: 'GIR = (Dextrose % × rate mL/hr × 1000) ÷ (weight kg × 60 × 180)', note: '' },
		{ state: 'Dextrose % formula', value: 'Dex % = (GIR × weight × 6) ÷ rate mL/hr', note: '' },
	];

	const hypoglycemiaThresholds = [
		{ age: 'First 4 hours', threshold: 'BG < 40 mg/dL', action: 'Feed (if tolerating); if symptomatic or unable to feed → D10W 2 mL/kg IV' },
		{ age: '4–24 hours', threshold: 'BG < 45 mg/dL', action: 'Feed or increase GIR; recheck in 30–60 min' },
		{ age: '> 24 hours', threshold: 'BG < 50 mg/dL', action: 'Optimize GIR/enteral feeds; evaluate for persistent hypoglycemia etiology' },
		{ age: 'Any age (symptomatic)', threshold: 'BG < 40 mg/dL + neuro signs', action: 'D10W 2 mL/kg bolus IV; increase GIR; endocrine consult if GIR > 12' },
		{ age: 'Target for NICU', threshold: 'BG 50–150 mg/dL', action: 'Maintain in euglycemic range; avoid hyperglycemia (BG > 150 → insulin in ELBW)' },
	];

	const electrolytes = [
		{ electrolyte: 'Sodium (Na)', timing: 'Add to IVF after urine output established (usually DOL 1–2)', target: '135–145 mEq/L', dose: '2–4 mEq/kg/day' },
		{ electrolyte: 'Potassium (K)', timing: 'Hold first 24–48 h; add after good UO and no hyperkalemia', target: '3.5–5.5 mEq/L', dose: '1–3 mEq/kg/day' },
		{ electrolyte: 'Calcium (Ca)', timing: 'Add to TPN from day 1 in preterm', target: 'iCa 1.1–1.4 mmol/L', dose: '50–75 mg/kg/day elemental Ca' },
		{ electrolyte: 'Phosphorus', timing: 'TPN from day 1; Ca:P ratio ≈ 1.3–1.7:1 by weight', target: 'P 4.5–8.0 mg/dL', dose: '1.3–2 mmol/kg/day' },
	];

	function openTree(file: string) { window.open(`/decision-trees/${file}`, '_blank'); }
</script>

<svelte:head><title>Neonatal Fluids & Glucose — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Neonatal Fluids &amp; Glucose</h1>
		<p class="subtitle">IVF rates · GIR calculation · Hypoglycemia protocol · Electrolyte supplementation</p>
	</div>

	<section>
		<h2 class="section-title">Tools &amp; Decision Trees</h2>
		<div class="tree-row">
			{#each trees as t}
				<button class="tree-btn" on:click={() => openTree(t.file)}>
					{t.icon} {t.name} ↗
				</button>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Starter IVF Rates by GA (mL/kg/day)</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr><th>GA at Birth</th><th>DOL 0</th><th>DOL 1</th><th>DOL 2</th><th>DOL 7+</th></tr>
				</thead>
				<tbody>
					{#each fluidRates as r}
						<tr>
							<td class="bold-cell">{r.ga}</td>
							<td>{r.dol0}</td>
							<td>{r.dol1}</td>
							<td>{r.dol2}</td>
							<td>{r.dol7}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="table-note">Adjust for phototherapy (+10%), radiant warmer (+20%), respiratory distress (+10–20%). Enteral feeds offset IVF mL-for-mL.</p>
	</section>

	<section>
		<h2 class="section-title">Glucose Infusion Rate (GIR)</h2>
		<div class="param-table">
			{#each girGuide as g}
				<div class="param-row">
					<span class="param-label">{g.state}</span>
					<span class="param-val">{g.value}{#if g.note} <span class="param-note">— {g.note}</span>{/if}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Hypoglycemia Management Thresholds</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Age / Timing</th><th>Threshold</th><th>Action</th></tr></thead>
				<tbody>
					{#each hypoglycemiaThresholds as h}
						<tr>
							<td class="bold-cell">{h.age}</td>
							<td class="mono-cell">{h.threshold}</td>
							<td>{h.action}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Electrolyte Supplementation in IVF/TPN</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Electrolyte</th><th>Timing</th><th>Target</th><th>Dose</th></tr></thead>
				<tbody>
					{#each electrolytes as e}
						<tr>
							<td class="bold-cell">{e.electrolyte}</td>
							<td>{e.timing}</td>
							<td class="mono-cell">{e.target}</td>
							<td class="mono-cell">{e.dose}</td>
						</tr>
					{/each}
				</tbody>
			</table>
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
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
	.clin-table th { padding: 0.55rem 0.9rem; text-align: left; font-size: 0.73rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-muted); line-height: 1.45; vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.77rem; }
	.table-note { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
	.param-table { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.param-row { display: grid; grid-template-columns: 240px 1fr; gap: 0.75rem; padding: 0.6rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); }
	.param-row:last-child { border-bottom: none; }
	.param-row:nth-child(odd) { background: var(--color-surface); }
	.param-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.param-val { font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.5; }
	.param-note { font-family: var(--font-body); font-size: 0.76rem; color: var(--color-text-muted); font-style: italic; }
</style>
