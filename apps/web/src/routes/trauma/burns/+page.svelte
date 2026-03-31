<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	const burnDepth = [
		{ depth: 'Superficial (1st degree)', appearance: 'Red, dry, painful. No blisters.', healing: '3–7 days', ibsa: 'NOT included in TBSA calculation' },
		{ depth: 'Partial thickness — superficial (2nd deg)', appearance: 'Wet, pink, blistered, very painful.', healing: '7–14 days', ibsa: 'Included' },
		{ depth: 'Partial thickness — deep (2nd deg)', appearance: 'Pale/mottled, decreased sensation, may blister.', healing: '> 21 days; often requires grafting', ibsa: 'Included' },
		{ depth: 'Full thickness (3rd degree)', appearance: 'White/brown/black, leathery, painless.', healing: 'Requires grafting', ibsa: 'Included' },
		{ depth: 'Fourth degree', appearance: 'Involves fascia, muscle, bone.', healing: 'Requires debridement/amputation', ibsa: 'Included' },
	];

	const tbsaByAge = [
		{ region: 'Head', infant: '18%', child5yr: '13%', adult: '9%' },
		{ region: 'Each arm', infant: '9%', child5yr: '9%', adult: '9%' },
		{ region: 'Trunk (anterior)', infant: '18%', child5yr: '18%', adult: '18%' },
		{ region: 'Trunk (posterior)', infant: '18%', child5yr: '18%', adult: '18%' },
		{ region: 'Each leg', infant: '13%', child5yr: '16%', adult: '18%' },
		{ region: 'Genitalia', infant: '1%', child5yr: '1%', adult: '1%' },
	];

	const fluidResus = [
		{ formula: 'Parkland formula (modified for pediatrics)', calc: '3–4 mL × kg × %TBSA (partial + full thickness)', timing: 'Half in first 8 h (from time of burn), remainder over next 16 h. Add maintenance fluids for children < 30 kg (Holliday-Segar).' },
		{ formula: 'Maintenance (add for < 30 kg)', calc: 'Holliday-Segar: 4 mL/kg/h first 10 kg + 2 mL/kg/h next 10 kg + 1 mL/kg/h remainder', timing: 'Run concurrently with Parkland resuscitation.' },
		{ formula: 'Colloid (after 8–12 h)', calc: '0.5 mL/kg/%TBSA (if not responding to crystalloid)', timing: 'Consider after initial 8–12 h; albumin 5% preferred.' },
		{ formula: 'Endpoint: urine output', calc: '0.5–1 mL/kg/h (children); 1 mL/kg/h (infants)', timing: 'Titrate fluids to achieve UO goal. Avoid over-resuscitation.' },
	];

	const burnCenter = [
		'TBSA ≥ 10% (partial or full thickness)',
		'Full thickness burns any size',
		'Burns involving face, hands, feet, genitalia, perineum, or major joints',
		'Circumferential burn (extremity or chest)',
		'Chemical or electrical burns',
		'Inhalation injury (singed nares, carbonaceous sputum, hoarse voice)',
		'Burns in children < 5 years',
		'Burns with concomitant trauma',
		'Suspected non-accidental burn (child abuse)',
	];

	const initialMgmt = [
		{ step: 'Stop the burning', detail: 'Remove clothing/jewelry. Cool burn with tepid (not cold) water × 20 min — cold water worsens hypothermia and vasoconstriction.' },
		{ step: 'Airway first', detail: 'Inhalation injury → early intubation (stridor, hoarseness, facial burns, singed nasal hairs, carbonaceous sputum). Avoid delays — edema closes airway rapidly.' },
		{ step: 'TBSA calculation', detail: 'Use age-appropriate chart (Lund & Browder preferred). Exclude superficial burns. Palm method: ~1% TBSA for irregular burns.' },
		{ step: 'IV access + fluids', detail: 'Two large-bore IVs (can go through burned tissue if needed). IO for pediatric arrest. Start Parkland resuscitation + maintenance.' },
		{ step: 'Pain management', detail: 'Morphine 0.05–0.1 mg/kg IV or intranasal; ketamine 0.5–1 mg/kg IV for dressing changes.' },
		{ step: 'Wound care', detail: 'Cover with clean moist dressings or cling film (no antiseptics yet). Keep patient warm. Bacitracin/silver sulfadiazine per burn center protocol.' },
		{ step: 'Burns center consultation', detail: 'See criteria left. Early call even for uncertain cases — burn specialists can guide initial management remotely.' },
	];

	$: weightKg = $patient?.weightKg ?? null;

	let tbsaInput = '';
	$: tbsaPercent = parseFloat(tbsaInput) || 0;

	function parkland(weight: number | null, tbsa: number): { total: string; first8h: string; next16h: string } {
		if (!weight || !tbsa) return { total: '—', first8h: '—', next16h: '—' };
		const total = 3.5 * weight * tbsa;
		return {
			total: `${total.toFixed(0)} mL`,
			first8h: `${(total / 2).toFixed(0)} mL`,
			next16h: `${(total / 2).toFixed(0)} mL`,
		};
	}

	function maintenance(weight: number | null): string {
		if (!weight) return '—';
		if (weight >= 30) return 'use adult Parkland only';
		let rate = 0;
		if (weight <= 10) rate = 4 * weight;
		else if (weight <= 20) rate = 40 + 2 * (weight - 10);
		else rate = 60 + 1 * (weight - 20);
		return `${rate.toFixed(0)} mL/h`;
	}

	$: calc = parkland(weightKg, tbsaPercent);
</script>

<svelte:head><title>Burns — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Pediatric Burns</h1>
		<p class="subtitle">TBSA estimation · Parkland formula · Inhalation injury · Burn center criteria</p>
		{#if $hasPatient}
			<div class="patient-badge">Patient: {$weightDisplay}</div>
		{/if}
	</div>

	<section>
		<h2 class="section-title">Initial Management Steps</h2>
		<div class="step-list">
			{#each initialMgmt as s, i}
				<div class="step-row">
					<span class="step-num">{i + 1}</span>
					<div>
						<div class="step-label">{s.step}</div>
						<div class="step-detail">{s.detail}</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">TBSA by Age (Rule of Nines)</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Body Region</th><th>Infant (&lt; 1 yr)</th><th>Child (5 yr)</th><th>Adult (≥ 15 yr)</th></tr></thead>
				<tbody>
					{#each tbsaByAge as r}
						<tr>
							<td class="bold-cell">{r.region}</td>
							<td class="mono-cell">{r.infant}</td>
							<td class="mono-cell">{r.child5yr}</td>
							<td class="mono-cell">{r.adult}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="table-note">Palm method: patient's palm (including fingers) ≈ 1% TBSA. Exclude superficial burns from TBSA calculation.</p>
	</section>

	<section>
		<h2 class="section-title">Fluid Resuscitation Calculator</h2>
		{#if $hasPatient}
			<div class="calc-form">
				<label class="calc-label">
					Enter %TBSA (partial + full thickness):
					<input type="number" bind:value={tbsaInput} min="0" max="100" placeholder="e.g. 15" class="calc-input" />
					<span class="calc-unit">%</span>
				</label>
			</div>
			{#if tbsaPercent > 0}
				<div class="result-grid">
					<div class="result-card"><div class="result-label">Total Parkland (first 24 h)</div><div class="result-val">{calc.total}</div></div>
					<div class="result-card"><div class="result-label">First 8 h (from burn)</div><div class="result-val">{calc.first8h}</div></div>
					<div class="result-card"><div class="result-label">Next 16 h</div><div class="result-val">{calc.next16h}</div></div>
					<div class="result-card"><div class="result-label">Maintenance rate (add if &lt; 30 kg)</div><div class="result-val">{maintenance(weightKg)}</div></div>
				</div>
				<p class="calc-note">Using 3.5 mL/kg/%TBSA. Titrate to UO 0.5–1 mL/kg/h. Adjust at 12–24 h based on clinical response.</p>
			{/if}
		{:else}
			<div class="info-banner">Enter patient weight on the home page to use the fluid calculator.</div>
		{/if}

		<div class="table-wrap" style="margin-top: 0.75rem">
			<table class="clin-table">
				<thead><tr><th>Formula</th><th>Calculation</th><th>Timing</th></tr></thead>
				<tbody>
					{#each fluidResus as f}
						<tr><td class="bold-cell">{f.formula}</td><td class="mono-cell">{f.calc}</td><td class="note-cell">{f.timing}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Burn Depth Classification</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Depth</th><th>Appearance</th><th>Healing</th><th>TBSA</th></tr></thead>
				<tbody>
					{#each burnDepth as b}
						<tr>
							<td class="bold-cell">{b.depth}</td>
							<td class="note-cell">{b.appearance}</td>
							<td class="note-cell">{b.healing}</td>
							<td class="note-cell">{b.ibsa}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Burn Center Referral Criteria (ABA)</h2>
		<div class="list-card">
			<ul class="crit-list">
				{#each burnCenter as c}
					<li>{c}</li>
				{/each}
			</ul>
		</div>
	</section>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.75rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.patient-badge { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.7rem; background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 35%, transparent); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-success, #22c55e); }
	.step-list { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.step-row { display: flex; gap: 1rem; align-items: flex-start; padding: 0.65rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.step-row:last-child { border-bottom: none; }
	.step-row:nth-child(odd) { background: var(--color-surface); }
	.step-num { font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem; color: var(--color-primary); width: 18px; flex-shrink: 0; }
	.step-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.2rem; }
	.step-detail { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.45; }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
	.table-note, .calc-note { font-size: 0.74rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
	.calc-form { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
	.calc-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--color-text-muted); }
	.calc-input { width: 80px; padding: 0.4rem 0.6rem; font-family: var(--font-mono); font-size: 0.9rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); }
	.calc-unit { font-family: var(--font-mono); font-size: 0.82rem; color: var(--color-text-muted); }
	.result-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
	.result-card { display: flex; flex-direction: column; align-items: center; padding: 0.65rem 1.1rem; background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-primary) 30%, var(--color-border-subtle)); border-radius: var(--radius-sm); min-width: 130px; }
	.result-label { font-size: 0.7rem; color: var(--color-text-muted); text-align: center; font-family: var(--font-mono); }
	.result-val { font-size: 1.1rem; font-family: var(--font-mono); font-weight: 700; color: var(--color-primary); margin-top: 0.2rem; }
	.info-banner { padding: 0.6rem 0.9rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--color-text-muted); }
	.list-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1rem; }
	.crit-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.crit-list li { font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.45; padding-left: 0.9rem; position: relative; }
	.crit-list li::before { content: '·'; position: absolute; left: 0; color: var(--color-primary); }
</style>
