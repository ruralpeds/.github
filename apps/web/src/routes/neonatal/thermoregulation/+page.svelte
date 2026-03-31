<script lang="ts">
	const isoletteTargets = [
		{ ga: '< 28 wk', dol0_1: '35.0–36.0 °C', dol2_7: '34.0–35.5 °C', dol7_plus: '33.0–35.0 °C', notes: 'Servo-mode: skin probe 36.5 °C target' },
		{ ga: '28–30 wk', dol0_1: '34.0–35.0 °C', dol2_7: '33.5–34.5 °C', dol7_plus: '32.5–34.0 °C', notes: 'Humidity 70–80% first week' },
		{ ga: '31–33 wk', dol0_1: '33.5–34.5 °C', dol2_7: '33.0–34.0 °C', dol7_plus: '32.0–33.5 °C', notes: '' },
		{ ga: '34–36 wk', dol0_1: '33.0–34.0 °C', dol2_7: '32.5–33.5 °C', dol7_plus: '32.0–33.0 °C', notes: 'Transition to open crib when > 1800 g + maintaining temp' },
		{ ga: 'Term', dol0_1: '32.5–33.5 °C', dol2_7: 'Open crib', dol7_plus: 'Open crib', notes: 'Skin-to-skin; avoid drafts' },
	];

	const hypothermiaRisk = [
		{ condition: 'Extreme prematurity (< 28 wk)', interventions: ['Polyethylene wrap immediately at delivery', 'Exothermic mattress under wrap', 'Prewarmed OR / delivery room ≥ 26 °C', 'Warm humidified gases for ventilation', 'Delayed cord clamping in stabilized infant'] },
		{ condition: 'Moderate prematurity (28–34 wk)', interventions: ['Hat on immediately', 'Warm blankets', 'Prewarmed isolette', 'Minimize exposure during procedures', 'Warm radiant warmer for resuscitation'] },
		{ condition: 'Intrapartum asphyxia (≥ 36 wk)', interventions: ['Avoid active warming if HIE suspected — target 36.5 °C until assessment', 'Withhold warming to 37 °C pending HIE evaluation', 'Do NOT cause hyperthermia (worsens brain injury)', 'Therapeutic cooling protocol if eligible'] },
	];

	const coolingCriteria = [
		{ criterion: 'Gestational age', value: '≥ 36 0/7 weeks' },
		{ criterion: 'Birth weight', value: '≥ 1800 g' },
		{ criterion: 'Age at initiation', value: '< 6 hours of age' },
		{ criterion: 'Sentinel event OR cord/first-hour gas', value: 'pH < 7.0 OR base deficit ≥ 16 mEq/L' },
		{ criterion: 'If blood gas borderline (pH 7.01–7.15 or BD 10–15)', value: 'AND Apgar ≤ 5 at 10 min OR need for resuscitation at 10 min' },
		{ criterion: 'Neurological exam (Thompson score)', value: 'Moderate–severe encephalopathy (Thompson score ≥ 7 or clinical HIE criteria)' },
		{ criterion: 'Cooling target', value: 'Rectal/esophageal temp 33.0–34.0 °C for 72 hours, then rewarm over 6 h' },
	];

	const openCribTransition = [
		{ criterion: 'Weight', value: '≥ 1600–1800 g (institution-dependent; most use 1800 g)' },
		{ criterion: 'Temp stability', value: 'Maintains axillary temp 36.5–37.5 °C in fully open isolette (isolette air temp ≤ 28–30 °C) for 24 h' },
		{ criterion: 'Feeding', value: 'Tolerating enteral feeds; no active sepsis' },
		{ criterion: 'Method', value: 'Dress in 2–3 layers + hat; recheck temp in 30–60 min; return to isolette if temp < 36.3 °C' },
	];

	const hyperthermiaManagement = [
		{ cause: 'Environmental overheating', management: 'Reduce isolette/warmer temperature; fan air; remove extra layers' },
		{ cause: 'Infection / fever', management: 'Blood culture; consider antibiotics; antipyretics generally avoided in neonates < 3 months' },
		{ cause: 'Dehydration', management: 'Assess fluid balance; increase IVF rate; check weight trend' },
		{ cause: 'Phototherapy', management: 'Monitor temp closely; increase fluids by 10%' },
		{ cause: 'HIE overheating', management: 'CRITICAL — hyperthermia worsens neurotoxicity; target ≤ 37.0 °C strictly' },
	];
</script>

<svelte:head><title>Thermoregulation — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Neonatal Thermoregulation</h1>
		<p class="subtitle">Isolette targets · Cold stress prevention · Therapeutic cooling (HIE) · Open crib transition</p>
	</div>

	<section>
		<h2 class="section-title">Isolette Temperature Targets by GA</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr><th>GA</th><th>DOL 0–1</th><th>DOL 2–7</th><th>DOL 7+</th><th>Notes</th></tr>
				</thead>
				<tbody>
					{#each isoletteTargets as r}
						<tr>
							<td class="bold-cell">{r.ga}</td>
							<td class="mono-cell">{r.dol0_1}</td>
							<td class="mono-cell">{r.dol2_7}</td>
							<td class="mono-cell">{r.dol7_plus}</td>
							<td>{r.notes}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="table-note">Servo-control mode preferred when available: skin probe on lateral abdomen, target 36.5 °C. Humidity ≥ 70–80% for ELBW first 7–10 days.</p>
	</section>

	<section>
		<h2 class="section-title">Hypothermia Risk — Prevention Bundles</h2>
		<div class="bundle-grid">
			{#each hypothermiaRisk as h}
				<div class="bundle-card">
					<div class="bundle-name">{h.condition}</div>
					<ul class="bundle-list">
						{#each h.interventions as i}
							<li>{i}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Therapeutic Hypothermia Eligibility (HIE)</h2>
		<div class="alert-box">
			<span class="alert-icon">⚠</span>
			<span>Must be initiated within <strong>6 hours</strong> of birth. All criteria must be met. Arrange immediate transport to NICU with cooling capability.</span>
		</div>
		<div class="param-table">
			{#each coolingCriteria as c}
				<div class="param-row">
					<span class="param-label">{c.criterion}</span>
					<span class="param-val">{c.value}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Open Crib Transition Criteria</h2>
		<div class="param-table">
			{#each openCribTransition as c}
				<div class="param-row">
					<span class="param-label">{c.criterion}</span>
					<span class="param-val">{c.value}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Hyperthermia — Causes &amp; Management</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Cause</th><th>Management</th></tr></thead>
				<tbody>
					{#each hyperthermiaManagement as h}
						<tr><td class="bold-cell">{h.cause}</td><td>{h.management}</td></tr>
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
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
	.clin-table th { padding: 0.55rem 0.9rem; text-align: left; font-size: 0.73rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-muted); line-height: 1.45; vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.77rem; }
	.table-note { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
	.bundle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.6rem; }
	.bundle-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1rem; }
	.bundle-name { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.5rem; }
	.bundle-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.bundle-list li { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; padding-left: 0.9rem; position: relative; }
	.bundle-list li::before { content: '·'; position: absolute; left: 0; color: var(--color-primary); }
	.alert-box {
		display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--color-warning, #f59e0b) 10%, var(--color-surface));
		border: 1px solid color-mix(in srgb, var(--color-warning, #f59e0b) 40%, transparent);
		border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--color-text-muted);
		line-height: 1.5; margin-bottom: 0.75rem;
	}
	.alert-icon { font-size: 1rem; flex-shrink: 0; }
	.alert-box strong { color: var(--color-text); }
	.param-table { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.param-row { display: grid; grid-template-columns: 280px 1fr; gap: 0.75rem; padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); }
	.param-row:last-child { border-bottom: none; }
	.param-row:nth-child(odd) { background: var(--color-surface); }
	.param-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.param-val { font-family: var(--font-mono); font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.5; }
</style>
