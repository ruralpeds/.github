<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	const steps = [
		{ step: '1', label: 'Confirm indication', detail: 'Unstable tachycardia with pulse: SVT, VT, AF/flutter with hemodynamic compromise (altered mental status, hypotension, severe respiratory distress, chest pain).' },
		{ step: '2', label: 'Sedate if patient is conscious', detail: 'Ketamine 1–2 mg/kg IV or midazolam 0.05–0.1 mg/kg IV. Ensure airway management available.' },
		{ step: '3', label: 'Apply pads / paddles', detail: '< 10 kg: infant/pediatric pads. ≥ 10 kg: adult pads. Anterior–posterior placement preferred if time allows.' },
		{ step: '4', label: 'Select SYNCHRONIZED mode', detail: 'Confirm "SYNC" is active on defibrillator. The device will deliver shock on R wave — critical to avoid VF induction.' },
		{ step: '5', label: 'Set energy', detail: 'SVT: 0.5–1 J/kg. VT (pulse): 1 J/kg. AF: 1–2 J/kg. Increase to 2 J/kg if no conversion.' },
		{ step: '6', label: 'Confirm synchronization', detail: 'Look for sync markers (spikes) on QRS complexes on the defibrillator display. Re-enable sync after each shock (many devices revert to unsynchronized).' },
		{ step: '7', label: 'Clear and deliver shock', detail: '"Stand clear!" — visually confirm no personnel contact. Press both discharge buttons simultaneously if using paddles.' },
		{ step: '8', label: 'Reassess rhythm', detail: 'If no conversion: increase energy to 2 J/kg and repeat. Re-enable SYNC. Consider adenosine for SVT before repeat shock.' },
	];

	const energyCalc = [
		{ rhythm: 'SVT', initial: '0.5–1 J/kg', repeat: '2 J/kg', max: 'Typically < 100 J' },
		{ rhythm: 'VT (stable pulse)', initial: '1 J/kg', repeat: '2 J/kg', max: '—' },
		{ rhythm: 'VT (unstable)', initial: '1–2 J/kg', repeat: '2 J/kg', max: '—' },
		{ rhythm: 'Atrial flutter / AF', initial: '1–2 J/kg', repeat: '2 J/kg', max: '—' },
	];

	const pitfalls = [
		'Forgetting to re-enable SYNC after each shock — device reverts to unsynchronized mode',
		'Using unsynchronized mode with VT (pulse) — risks precipitating VF',
		'Inadequate sedation causing patient movement at time of discharge',
		'Poor pad contact — apply firm pressure; use gel if using paddles',
		'Not treating reversible cause — hypokalemia, hypomagnesemia can cause refractory VT',
		'Delaying cardioversion for stable SVT when adenosine available and child can cooperate',
	];

	$: weightKg = $patient?.weightKg ?? null;

	function joules(dose: string, weight: number | null): string {
		if (!weight) return '—';
		const rangeMatch = dose.match(/^([\d.]+)[–-]([\d.]+)\s*J\/kg/);
		if (rangeMatch) {
			const lo = Math.round(parseFloat(rangeMatch[1]) * weight);
			const hi = Math.round(parseFloat(rangeMatch[2]) * weight);
			return `${lo}–${hi} J`;
		}
		const match = dose.match(/^([\d.]+)\s*J\/kg/);
		if (match) return `${Math.round(parseFloat(match[1]) * weight)} J`;
		return '—';
	}
</script>

<svelte:head><title>Cardioversion — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Synchronized Cardioversion</h1>
		<p class="subtitle">Unstable SVT · VT with pulse · Step-by-step procedure · Energy dosing</p>
		{#if $hasPatient}
			<div class="patient-badge">Patient: {$weightDisplay}</div>
		{/if}
	</div>

	<section>
		<h2 class="section-title">Energy Dosing</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr>
						<th>Rhythm</th>
						<th>Initial</th>
						{#if $hasPatient}<th class="calc-col">Initial (patient)</th>{/if}
						<th>Repeat</th>
						{#if $hasPatient}<th class="calc-col">Repeat (patient)</th>{/if}
						<th>Max</th>
					</tr>
				</thead>
				<tbody>
					{#each energyCalc as e}
						<tr>
							<td class="bold-cell">{e.rhythm}</td>
							<td class="mono-cell">{e.initial}</td>
							{#if $hasPatient}<td class="mono-cell primary-cell">{joules(e.initial, weightKg)}</td>{/if}
							<td class="mono-cell">{e.repeat}</td>
							{#if $hasPatient}<td class="mono-cell primary-cell">{joules(e.repeat, weightKg)}</td>{/if}
							<td class="mono-cell">{e.max}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Procedure Steps</h2>
		<div class="sequence-list">
			{#each steps as s}
				<div class="seq-row" class:warn={s.step === '4' || s.step === '6'}>
					<span class="seq-num">{s.step}</span>
					<div>
						<div class="seq-label">{s.label}</div>
						<div class="seq-detail">{s.detail}</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Common Pitfalls</h2>
		<div class="pitfall-list">
			{#each pitfalls as p}
				<div class="pitfall-item">⚠ {p}</div>
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
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); white-space: nowrap; }
	.primary-cell { color: var(--color-primary); font-weight: 600; }
	.calc-col { background: color-mix(in srgb, var(--color-primary) 6%, transparent); }
	.sequence-list { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.seq-row { display: flex; gap: 1rem; align-items: flex-start; padding: 0.65rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.seq-row:last-child { border-bottom: none; }
	.seq-row:nth-child(odd) { background: var(--color-surface); }
	.seq-row.warn { background: color-mix(in srgb, var(--color-warning, #f59e0b) 8%, var(--color-surface)) !important; }
	.seq-num { font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem; color: var(--color-primary); width: 18px; flex-shrink: 0; }
	.seq-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.2rem; }
	.seq-detail { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.45; }
	.pitfall-list { display: flex; flex-direction: column; gap: 0.4rem; }
	.pitfall-item { font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.5; padding: 0.5rem 0.85rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
</style>
