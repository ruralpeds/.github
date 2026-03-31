<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	const dosingRows = [
		{ phase: 'Initial (critical/duct closed)', dose: '0.05–0.1 mcg/kg/min', note: 'Higher doses to reopen duct; monitor closely for apnea' },
		{ phase: 'Maintenance (duct open)', dose: '0.01–0.05 mcg/kg/min', note: 'Lowest effective dose once SpO₂/perfusion stabilized' },
		{ phase: 'Maximum', dose: '0.4 mcg/kg/min', note: 'Rarely needed; higher doses ↑ adverse effects without added benefit' },
	];

	const sideEffects = [
		{ effect: 'Apnea', frequency: '~20% (higher doses)', management: 'Have bag-mask at bedside; many centers intubate electively before transport; reduce dose if possible' },
		{ effect: 'Fever', frequency: 'Common', management: 'Monitor temperature; treat with acetaminophen if needed' },
		{ effect: 'Hypotension', frequency: 'Common at higher doses', management: 'Volume bolus 10 mL/kg NS; reduce dose; vasopressors if needed' },
		{ effect: 'Flushing / vasodilation', frequency: 'Common', management: 'Expected; monitor BP' },
		{ effect: 'Seizures', frequency: 'Rare', management: 'EEG monitoring; avoid in neonates with suspected HIE (PGE1 may increase seizure risk)' },
		{ effect: 'Bradycardia', frequency: 'Uncommon', management: 'Reduce dose; atropine 0.02 mg/kg if hemodynamically significant' },
		{ effect: 'Diarrhea / GI motility', frequency: 'With higher doses', management: 'Hold feeds; NG tube for decompression' },
		{ effect: 'Cortical hyperostosis', frequency: 'Chronic use > 4 wk', management: 'Radiographic changes; reversible on discontinuation' },
	];

	const preparation = [
		{ step: 'Concentration', detail: 'Alprostadil 500 mcg/mL ampule (standard) or 0.5 mg/mL. Dilute to working concentration per hospital protocol.' },
		{ step: 'Common preparation', detail: '1 mcg/kg/mL: Add 1 mcg/kg to 1 mL → gives 1 mcg/kg/mL. Infusion at 1 mL/h = 1 mcg/kg/min. Adjust rate for desired dose.' },
		{ step: 'Alternative', detail: 'Some centers: (weight kg × 0.03) mg in 50 mL NS → 1 mL/h = 0.01 mcg/kg/min. Follow local pharmacy standard.' },
		{ step: 'Compatibility', detail: 'Compatible with NS, D5W. Avoid direct sunlight (light-sensitive). Use within 24 h of preparation.' },
		{ step: 'Access', detail: 'Peripheral IV, IO, UVC, or PICC. Avoid arterial lines for infusion. Extravasation: tissue injury — ensure good IV site.' },
	];

	const monitoring = [
		'SpO₂ continuous (target depends on lesion — see ductal-dependent page)',
		'HR and BP every 15–30 min during initiation',
		'Respiratory rate + work of breathing — apnea monitoring',
		'Temperature every 2–4 h',
		'Blood gas at 30–60 min after starting (confirm ductal effect)',
		'Blood glucose every 1–2 h',
		'Have intubation equipment and bag-mask at bedside at all times',
	];

	$: weightKg = $patient?.weightKg ?? null;

	function calcRate(dosePerKgPerMin: number, weight: number | null, concMcgPerMl: number): string {
		if (!weight) return '—';
		const ratePerHour = (dosePerKgPerMin * weight * 60) / concMcgPerMl;
		return `${ratePerHour.toFixed(2)} mL/h`;
	}
</script>

<svelte:head><title>Prostaglandin E1 — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Prostaglandin E1 (Alprostadil)</h1>
		<p class="subtitle">Ductal-dependent CHD · Dosing · Side effects · Preparation · Monitoring</p>
		{#if $hasPatient}
			<div class="patient-badge">Patient: {$weightDisplay}</div>
		{/if}
	</div>

	<div class="alert-box">
		<strong>Apnea risk:</strong> Occurs in ~20% of neonates receiving PGE1. Always have bag-mask ventilation available at bedside. Consider elective intubation before transport.
	</div>

	<section>
		<h2 class="section-title">Dosing</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr>
						<th>Phase</th>
						<th>Dose (mcg/kg/min)</th>
						{#if $hasPatient}<th class="calc-col">Rate at 1 mcg/mL (patient)</th>{/if}
						<th>Notes</th>
					</tr>
				</thead>
				<tbody>
					{#each dosingRows as d}
						<tr>
							<td class="bold-cell">{d.phase}</td>
							<td class="mono-cell">{d.dose}</td>
							{#if $hasPatient}
								<td class="mono-cell primary-cell">
									{#if d.dose.includes('–')}
										{@const parts = d.dose.match(/([\d.]+)[–-]([\d.]+)/)}
										{#if parts}
											{calcRate(parseFloat(parts[1]), weightKg, 1)}–{calcRate(parseFloat(parts[2]), weightKg, 1)}
										{/if}
									{:else}
										{@const num = d.dose.match(/[\d.]+/)}
										{#if num}{calcRate(parseFloat(num[0]), weightKg, 1)}{/if}
									{/if}
								</td>
							{/if}
							<td class="note-cell">{d.note}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="table-note">Rate calculated assuming concentration of 1 mcg/mL. Adjust proportionally for different concentrations.</p>
	</section>

	<section>
		<h2 class="section-title">Preparation</h2>
		<div class="prep-list">
			{#each preparation as p}
				<div class="prep-row">
					<span class="prep-label">{p.step}</span>
					<span class="prep-detail">{p.detail}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Side Effects &amp; Management</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Effect</th><th>Frequency</th><th>Management</th></tr></thead>
				<tbody>
					{#each sideEffects as s}
						<tr>
							<td class="bold-cell">{s.effect}</td>
							<td class="note-cell">{s.frequency}</td>
							<td class="note-cell">{s.management}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Monitoring Checklist</h2>
		<div class="monitor-list">
			{#each monitoring as m}
				<div class="monitor-item">☐ {m}</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.75rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.patient-badge { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.7rem; background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 35%, transparent); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-success, #22c55e); }
	.alert-box { padding: 0.8rem 1rem; background: color-mix(in srgb, var(--color-error, #f87171) 10%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-error, #f87171) 40%, transparent); border-radius: var(--radius-sm); font-size: 0.83rem; color: var(--color-text-muted); line-height: 1.5; }
	.alert-box strong { color: var(--color-text); }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); }
	.primary-cell { color: var(--color-primary); font-weight: 600; }
	.calc-col { background: color-mix(in srgb, var(--color-primary) 6%, transparent); }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
	.table-note { font-size: 0.74rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
	.prep-list { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.prep-row { display: grid; grid-template-columns: 180px 1fr; gap: 0.75rem; padding: 0.6rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.prep-row:last-child { border-bottom: none; }
	.prep-row:nth-child(odd) { background: var(--color-surface); }
	.prep-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.prep-detail { font-family: var(--font-mono); font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.5; }
	.monitor-list { display: flex; flex-direction: column; gap: 0.35rem; }
	.monitor-item { font-size: 0.8rem; color: var(--color-text-muted); padding: 0.45rem 0.85rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); line-height: 1.45; }
</style>
