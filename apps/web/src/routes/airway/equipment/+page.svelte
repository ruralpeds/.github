<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	const ettTable = [
		{ age: 'Premature', weight: '< 1 kg', ettUncuffed: '2.5', ettCuffed: '—', depth: '6–7', blade: 'Miller 0', note: '' },
		{ age: 'Newborn (< 1 mo)', weight: '3–4 kg', ettUncuffed: '3.5', ettCuffed: '3.0', depth: '9–10', blade: 'Miller 0–1', note: '' },
		{ age: '6 months', weight: '6–7 kg', ettUncuffed: '3.5', ettCuffed: '3.0', depth: '10–11', blade: 'Miller 1', note: '' },
		{ age: '1 year', weight: '8–10 kg', ettUncuffed: '4.0', ettCuffed: '3.5', depth: '11–12', blade: 'Miller 1 / Mac 1', note: '' },
		{ age: '2 years', weight: '12 kg', ettUncuffed: '4.5', ettCuffed: '4.0', depth: '12–13', blade: 'Miller 1–2 / Mac 1', note: '' },
		{ age: '4 years', weight: '16 kg', ettUncuffed: '5.0', ettCuffed: '4.5', depth: '14', blade: 'Miller 2 / Mac 2', note: '' },
		{ age: '6 years', weight: '20 kg', ettUncuffed: '5.5', ettCuffed: '5.0', depth: '15', blade: 'Mac 2', note: '' },
		{ age: '8 years', weight: '25 kg', ettUncuffed: '6.0', ettCuffed: '5.5', depth: '16', blade: 'Mac 2–3', note: '' },
		{ age: '10 years', weight: '32 kg', ettUncuffed: '6.5', ettCuffed: '6.0', depth: '17', blade: 'Mac 3', note: 'Cuffed ETT preferred ≥ 8 yr' },
		{ age: '12 years', weight: '40 kg', ettUncuffed: '7.0', ettCuffed: '6.5', depth: '18', blade: 'Mac 3', note: '' },
		{ age: 'Adult (female)', weight: '—', ettUncuffed: '—', ettCuffed: '7.0–7.5', depth: '21', blade: 'Mac 3', note: '' },
		{ age: 'Adult (male)', weight: '—', ettUncuffed: '—', ettCuffed: '7.5–8.0', depth: '23', blade: 'Mac 3–4', note: '' },
	];

	const formulas = [
		{ label: 'ETT size (uncuffed)', formula: '(Age ÷ 4) + 4' },
		{ label: 'ETT size (cuffed)', formula: '(Age ÷ 4) + 3.5' },
		{ label: 'ETT depth at lip (cm)', formula: '(Age ÷ 2) + 12  |  or  weight (kg) + 6 (neonates)' },
		{ label: 'Suction catheter (Fr)', formula: 'ETT size (mm) × 2' },
		{ label: 'LMA size', formula: '< 5 kg=1 · 5–10=1.5 · 10–20=2 · 20–30=2.5 · 30–50=3 · 50–70=4 · > 70=5' },
		{ label: 'Nasopharyngeal airway', formula: 'Diameter: ETT size − 1; Length (cm): tip of nose to tragus' },
		{ label: 'Oropharyngeal airway', formula: 'Flange at corner of mouth, tip to angle of mandible' },
		{ label: 'NG/OG tube (Fr)', formula: '(Age in yr + 16) ÷ 2  |  Neonates: 5–8 Fr; infants: 8; child: 10–12' },
		{ label: 'Foley catheter (Fr)', formula: '2× ETT size' },
		{ label: 'Chest tube (Fr)', formula: 'Pleural effusion/pneumothorax: 4× ETT size. Haemothorax: 5–6× ETT' },
		{ label: 'Defibrillation pads', formula: 'Infant pads < 10 kg; adult pads ≥ 10 kg' },
		{ label: 'BP cuff width', formula: '40% of mid-upper arm circumference' },
	];

	$: weightKg = $patient?.weightKg ?? null;
	$: ageMonths = $patient?.ageMonths ?? null;

	function getRow(weight: number | null, age: number | null) {
		if (!weight && !age) return null;
		if (weight !== null) {
			if (weight < 1) return ettTable[0];
			if (weight <= 5) return ettTable[1];
			if (weight <= 8) return ettTable[2];
			if (weight <= 11) return ettTable[3];
			if (weight <= 14) return ettTable[4];
			if (weight <= 18) return ettTable[5];
			if (weight <= 22) return ettTable[6];
			if (weight <= 28) return ettTable[7];
			if (weight <= 36) return ettTable[8];
			if (weight <= 45) return ettTable[9];
		}
		return null;
	}

	$: row = getRow(weightKg, ageMonths);
</script>

<svelte:head><title>Equipment Sizing — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Airway Equipment Sizing</h1>
		<p class="subtitle">ETT · LMA · Blades · NG tubes · Chest tubes · Weight and age-based formulas</p>
		{#if $hasPatient && row}
			<div class="patient-badge">
				{$weightDisplay} — ETT {row.ettCuffed !== '—' ? row.ettCuffed + ' cuffed' : row.ettUncuffed + ' uncuffed'} · Depth {row.depth} cm · {row.blade}
			</div>
		{/if}
	</div>

	<section>
		<h2 class="section-title">Sizing Formulas</h2>
		<div class="formula-grid">
			{#each formulas as f}
				<div class="formula-row">
					<span class="formula-label">{f.label}</span>
					<span class="formula-val">{f.formula}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">ETT &amp; Equipment by Age / Weight</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr><th>Age</th><th>Weight</th><th>ETT Uncuffed</th><th>ETT Cuffed</th><th>Depth (lip)</th><th>Blade</th><th>Notes</th></tr>
				</thead>
				<tbody>
					{#each ettTable as r}
						<tr class:active-row={row === r}>
							<td class="bold-cell">{r.age}</td>
							<td class="mono-cell">{r.weight}</td>
							<td class="mono-cell">{r.ettUncuffed}</td>
							<td class="mono-cell">{r.ettCuffed}</td>
							<td class="mono-cell">{r.depth}</td>
							<td class="mono-cell">{r.blade}</td>
							<td class="note-cell">{r.note}</td>
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
	.patient-badge { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.7rem; background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 35%, transparent); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-success, #22c55e); }
	.formula-grid { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.formula-row { display: grid; grid-template-columns: 220px 1fr; gap: 0.75rem; padding: 0.5rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); }
	.formula-row:last-child { border-bottom: none; }
	.formula-row:nth-child(odd) { background: var(--color-surface); }
	.formula-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.formula-val { font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.5; }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.active-row td { background: color-mix(in srgb, var(--color-primary) 8%, transparent); }
	.active-row .bold-cell { color: var(--color-primary); }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); white-space: nowrap; }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); }
</style>
