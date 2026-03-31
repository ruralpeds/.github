<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	const energyDoses = [
		{ intervention: 'Defibrillation — initial', dose: '2 J/kg', subsequent: '4 J/kg', max: '10 J/kg or adult max (200 J biphasic)', note: 'Pulseless VF / pVT. Deliver shock as soon as defibrillator available. Resume CPR immediately after.' },
		{ intervention: 'Synchronized cardioversion — initial', dose: '0.5–1 J/kg', subsequent: '2 J/kg', max: '—', note: 'Unstable SVT, unstable VT with pulse. Synchronize to R wave. Sedate if possible.' },
		{ intervention: 'Synchronized cardioversion (AF)', dose: '1–2 J/kg', subsequent: '—', max: '—', note: 'Rare in children; synchronize carefully' },
	];

	const padSelection = [
		{ size: 'Infant pads / pediatric paddles', use: '< 10 kg (< ~1 year)', position: 'One pad on right chest below clavicle; one on left side below axilla (anterior-posterior preferred for small infants)' },
		{ size: 'Adult pads / paddles', use: '≥ 10 kg', position: 'Standard adult placement: right chest below clavicle + left lateral chest (V5 position)' },
	];

	const palsArrestSequence = [
		{ step: '1', action: 'Confirm pulseless / unresponsive', detail: 'If rhythm is VF or pVT → immediate defibrillation' },
		{ step: '2', action: 'Apply pads, charge to 2 J/kg', detail: 'Continue CPR while charging (load-distributing band or standard 2-min CPR)' },
		{ step: '3', action: 'Clear and deliver shock', detail: 'Say "Clear!" — confirm no contact before discharge' },
		{ step: '4', action: 'Resume CPR immediately (2 min)', detail: 'Do not pause to check rhythm post-shock; continue 30:2 or 15:2 for 2-rescuer pediatric CPR' },
		{ step: '5', action: 'Check rhythm — if still VF/VT', detail: 'Charge to 4 J/kg; give epinephrine 0.01 mg/kg IV/IO; shock again' },
		{ step: '6', action: 'Continue cycles with amiodarone', detail: 'Amiodarone 5 mg/kg IV/IO after 3rd shock (or lidocaine 1 mg/kg as alternative)' },
		{ step: '7', action: 'Treat reversible causes (Hs & Ts)', detail: 'Hypoxia, Hypovolemia, Hypo/hyperkalemia, Hypothermia, Hydrogen ion; Tamponade, Tension PTX, Toxins, Thrombosis' },
	];

	const hAndTs = [
		{ h: 'Hypoxia', tx: 'BVM → intubation; 100% O₂' },
		{ h: 'Hypovolemia', tx: '20 mL/kg NS bolus; blood if trauma' },
		{ h: 'Hypo/hyperkalemia', tx: 'K⁺ panel; CaCl₂, bicarb, insulin/dextrose for hyperK' },
		{ h: 'Hypothermia', tx: 'Active rewarming; continue CPR until warm' },
		{ h: 'Hydrogen ion (acidosis)', tx: 'Sodium bicarbonate 1 mEq/kg; optimize ventilation' },
		{ h: 'Tamponade', tx: 'Pericardiocentesis' },
		{ h: 'Tension PTX', tx: 'Needle decompression 2nd ICS MCL' },
		{ h: 'Toxins', tx: 'Identify and antidote; consider lipid emulsion' },
		{ h: 'Thrombosis (PE/coronary)', tx: 'tPA if confirmed; ECMO if refractory' },
	];

	$: weightKg = $patient?.weightKg ?? null;

	function calcJ(doseStr: string, weight: number | null): string {
		if (!weight) return '—';
		const match = doseStr.match(/^([\d.]+)\s*J\/kg/);
		if (!match) {
			// "0.5–1 J/kg" range
			const rangeMatch = doseStr.match(/^([\d.]+)[–-]([\d.]+)\s*J\/kg/);
			if (rangeMatch) {
				const lo = (parseFloat(rangeMatch[1]) * weight).toFixed(0);
				const hi = (parseFloat(rangeMatch[2]) * weight).toFixed(0);
				return `${lo}–${hi} J`;
			}
			return '—';
		}
		return `${(parseFloat(match[1]) * weight).toFixed(0)} J`;
	}
</script>

<svelte:head><title>Defibrillation — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Defibrillation &amp; Cardioversion</h1>
		<p class="subtitle">PALS 2020 · Energy dosing · Pad selection · VF/pVT arrest algorithm</p>
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
						<th>Intervention</th>
						<th>Initial Dose</th>
						{#if $hasPatient}<th class="calc-col">Initial (patient)</th>{/if}
						<th>Subsequent</th>
						{#if $hasPatient}<th class="calc-col">Subsequent (patient)</th>{/if}
						<th>Max</th>
						<th>Notes</th>
					</tr>
				</thead>
				<tbody>
					{#each energyDoses as e}
						<tr>
							<td class="bold-cell">{e.intervention}</td>
							<td class="mono-cell">{e.dose}</td>
							{#if $hasPatient}<td class="mono-cell primary-cell">{calcJ(e.dose, weightKg)}</td>{/if}
							<td class="mono-cell">{e.subsequent}</td>
							{#if $hasPatient}<td class="mono-cell primary-cell">{calcJ(e.subsequent, weightKg)}</td>{/if}
							<td class="small-cell">{e.max}</td>
							<td class="note-cell">{e.note}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Pad / Paddle Selection</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Pad Size</th><th>Use When</th><th>Placement</th></tr></thead>
				<tbody>
					{#each padSelection as p}
						<tr>
							<td class="bold-cell">{p.size}</td>
							<td class="mono-cell">{p.use}</td>
							<td class="note-cell">{p.position}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">VF / pVT Arrest Sequence (PALS)</h2>
		<div class="sequence-list">
			{#each palsArrestSequence as s}
				<div class="seq-row">
					<span class="seq-num">{s.step}</span>
					<div class="seq-body">
						<div class="seq-action">{s.action}</div>
						<div class="seq-detail">{s.detail}</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Reversible Causes — Hs &amp; Ts</h2>
		<div class="ht-grid">
			{#each hAndTs as h}
				<div class="ht-card">
					<div class="ht-cause">{h.h}</div>
					<div class="ht-tx">{h.tx}</div>
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
	.patient-badge {
		display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.7rem;
		background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 35%, transparent);
		border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem;
		color: var(--color-success, #22c55e);
	}
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); white-space: nowrap; }
	.primary-cell { color: var(--color-primary); font-weight: 600; }
	.small-cell { font-family: var(--font-mono); font-size: 0.73rem; color: var(--color-text-muted); }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
	.calc-col { background: color-mix(in srgb, var(--color-primary) 6%, transparent); }
	.sequence-list { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.seq-row { display: flex; align-items: flex-start; gap: 1rem; padding: 0.7rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.seq-row:last-child { border-bottom: none; }
	.seq-row:nth-child(odd) { background: var(--color-surface); }
	.seq-num { font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: var(--color-primary); width: 18px; flex-shrink: 0; margin-top: 0.1rem; }
	.seq-action { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.2rem; }
	.seq-detail { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.45; }
	.ht-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.45rem; }
	.ht-card { padding: 0.65rem 0.9rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.ht-cause { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.25rem; }
	.ht-tx { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; }
</style>
