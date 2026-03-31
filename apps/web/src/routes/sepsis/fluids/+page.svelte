<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	const firstHourSteps = [
		{ time: '0–5 min', action: 'Recognize septic shock', detail: 'Altered mental status + perfusion abnormality (cold/warm shock). Do NOT require hypotension for diagnosis.' },
		{ time: '0–15 min', action: 'Vascular access', detail: 'IV or IO within 5 min if IV not achievable. Blood culture × 2 before antibiotics if possible (do not delay antibiotics > 1 h).' },
		{ time: '15 min', action: '1st bolus — 10–20 mL/kg isotonic crystalloid', detail: 'Push over 5–10 min. Reassess perfusion (capillary refill, HR, MAP, mental status) after each bolus.' },
		{ time: '30 min', action: '2nd bolus if still shock', detail: 'Repeat 10–20 mL/kg. Total bolus up to 40–60 mL/kg in first hour — reassess frequently. Stop if crackles, hepatomegaly, or worsening respiratory status.' },
		{ time: '60 min', action: 'Fluid-refractory shock → vasopressors', detail: 'If still in shock after 40–60 mL/kg: start dopamine or epinephrine. Intubate if needed (avoid propofol — use ketamine).' },
	];

	const vasopressors = [
		{ drug: 'Dopamine', dose: '5–20 mcg/kg/min', note: 'First-line if no IO/peripheral only. Dopaminergic effects < 5; beta at 5–10; alpha at > 10 mcg/kg/min.' },
		{ drug: 'Epinephrine (cold shock)', dose: '0.05–1 mcg/kg/min', note: 'Preferred for cold shock (vasoconstriction + inotropy). Start 0.05–0.1 mcg/kg/min.' },
		{ drug: 'Norepinephrine (warm shock)', dose: '0.05–2 mcg/kg/min', note: 'Preferred for distributive/warm shock. Potent vasoconstriction.' },
		{ drug: 'Vasopressin', dose: '0.0003–0.002 units/kg/min', note: 'Catecholamine-resistant warm shock. Fixed dose in neonates.' },
		{ drug: 'Dobutamine', dose: '5–20 mcg/kg/min', note: 'Add for depressed cardiac output/cold shock. Inotropy without vasoconstriction.' },
	];

	const shockTypes = [
		{ type: 'Cold shock', features: 'Prolonged CRT > 2 s, weak/thready pulse, cool/mottled extremities, narrow pulse pressure', tx: 'Epinephrine ± dopamine; consider milrinone for fluid-refractory + low CO' },
		{ type: 'Warm shock', features: 'CRT < 2 s (flash), bounding pulses, warm extremities, wide pulse pressure, low DBP', tx: 'Norepinephrine or vasopressin; avoid dopamine as monotherapy' },
		{ type: 'Mixed/refractory', features: 'Fluid-refractory + catecholamine-resistant', tx: 'Hydrocortisone 1–2 mg/kg/dose IV q6h; ECMO evaluation; source control' },
	];

	const mapTargets = [
		{ age: 'Neonates (< 28 days)', map: 'MAP ≥ 35–40 mmHg (goal: MAP ≥ GA in weeks)', sbp: '—' },
		{ age: 'Infants (1–12 mo)', map: '> 55 mmHg', sbp: '> 70 mmHg' },
		{ age: 'Children 1–10 yr', map: '> 65 mmHg', sbp: '70 + (age × 2) mmHg' },
		{ age: 'Children > 10 yr', map: '> 65 mmHg', sbp: '> 90 mmHg' },
	];

	$: weightKg = $patient?.weightKg ?? null;

	function bolus(weight: number | null, mlPerKg: number): string {
		if (!weight) return '—';
		return `${(weight * mlPerKg).toFixed(0)} mL`;
	}
</script>

<svelte:head><title>Sepsis Fluid Resuscitation — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Sepsis Fluid Resuscitation</h1>
		<p class="subtitle">PALS / Surviving Sepsis Campaign · First-hour bundle · Vasopressor titration · MAP targets</p>
		{#if $hasPatient}
			<div class="patient-badge">
				{$weightDisplay} — 10 mL/kg: {bolus(weightKg, 10)} · 20 mL/kg: {bolus(weightKg, 20)}
			</div>
		{/if}
	</div>

	<section>
		<h2 class="section-title">First-Hour Resuscitation Bundle</h2>
		<div class="sequence-list">
			{#each firstHourSteps as s}
				<div class="seq-row">
					<span class="seq-time">{s.time}</span>
					<div class="seq-body">
						<div class="seq-action">{s.action}</div>
						<div class="seq-detail">{s.detail}</div>
					</div>
				</div>
			{/each}
		</div>
		{#if $hasPatient}
			<div class="bolus-row">
				<div class="bolus-card"><span class="bolus-label">Bolus 10 mL/kg</span><span class="bolus-val">{bolus(weightKg, 10)}</span></div>
				<div class="bolus-card"><span class="bolus-label">Bolus 20 mL/kg</span><span class="bolus-val">{bolus(weightKg, 20)}</span></div>
				<div class="bolus-card"><span class="bolus-label">Max 40 mL/kg</span><span class="bolus-val">{bolus(weightKg, 40)}</span></div>
				<div class="bolus-card"><span class="bolus-label">Max 60 mL/kg</span><span class="bolus-val">{bolus(weightKg, 60)}</span></div>
			</div>
		{/if}
	</section>

	<section>
		<h2 class="section-title">Cold vs Warm Shock</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Shock Type</th><th>Clinical Features</th><th>Vasopressor Choice</th></tr></thead>
				<tbody>
					{#each shockTypes as s}
						<tr><td class="bold-cell">{s.type}</td><td class="note-cell">{s.features}</td><td class="note-cell">{s.tx}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Vasopressors</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Drug</th><th>Dose</th><th>Notes</th></tr></thead>
				<tbody>
					{#each vasopressors as v}
						<tr><td class="bold-cell">{v.drug}</td><td class="mono-cell">{v.dose}</td><td class="note-cell">{v.note}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">MAP Targets by Age</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Age</th><th>MAP Target</th><th>SBP Target</th></tr></thead>
				<tbody>
					{#each mapTargets as m}
						<tr><td class="bold-cell">{m.age}</td><td class="mono-cell">{m.map}</td><td class="mono-cell">{m.sbp}</td></tr>
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
	.patient-badge { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.7rem; background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 35%, transparent); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-success, #22c55e); }
	.sequence-list { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.seq-row { display: grid; grid-template-columns: 100px 1fr; gap: 1rem; padding: 0.65rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.seq-row:last-child { border-bottom: none; }
	.seq-row:nth-child(odd) { background: var(--color-surface); }
	.seq-time { font-family: var(--font-mono); font-size: 0.77rem; font-weight: 600; color: var(--color-primary); padding-top: 0.1rem; }
	.seq-action { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.2rem; }
	.seq-detail { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.45; }
	.bolus-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
	.bolus-card { display: flex; flex-direction: column; align-items: center; padding: 0.5rem 1rem; background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent); border-radius: var(--radius-sm); min-width: 110px; }
	.bolus-label { font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono); }
	.bolus-val { font-size: 1.1rem; font-family: var(--font-mono); font-weight: 700; color: var(--color-primary); }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
</style>
