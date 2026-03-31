<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	const mtpTriggers = [
		'Shock index (HR ÷ SBP) > 1.0 sustained',
		'Estimated blood loss > 30–40% EBV (EBV = 80 mL/kg infant; 70 mL/kg child)',
		'Ongoing hemorrhage not responsive to 2 crystalloid boluses (20–40 mL/kg)',
		'Penetrating torso injury with hemodynamic instability',
		'Pelvic ring disruption with hemodynamic instability',
		'Traumatic arrest or near-arrest with exsanguination',
	];

	const products = [
		{ product: 'pRBC', dose: '10–15 mL/kg', note: 'Target Hgb > 7–8 g/dL (higher if cardiac/pulmonary compromise). CMV-negative for neonates.' },
		{ product: 'FFP', dose: '10–15 mL/kg', note: 'Target PT/INR < 1.5 × normal. Give 1:1 ratio with pRBC in MTP. Thaw time ~20 min — order early.' },
		{ product: 'Platelets', dose: '5–10 mL/kg (1 apheresis unit ≈ 4–6 mL/kg)', note: 'Target > 50,000 (> 100,000 for CNS injury or ongoing hemorrhage). 1:1:1 ratio in MTP.' },
		{ product: 'Cryoprecipitate', dose: '1 unit/5 kg (max 10 units)', note: 'For fibrinogen < 1.5–2.0 g/L. Contains fibrinogen, vWF, Factor VIII, XIII. Pool units per dose.' },
		{ product: 'TXA (tranexamic acid)', dose: '15 mg/kg IV over 10 min (max 1 g), then 2 mg/kg/h × 8 h (max 1 g maintenance)', note: 'Give within 3 h of injury. Anti-fibrinolytic. Evidence for peds trauma mortality benefit.' },
		{ product: 'Calcium chloride 10%', dose: '20 mg/kg (0.2 mL/kg)', note: 'Give after each 4 units of blood. Citrate in blood products chelates ionized calcium — monitor iCa.' },
	];

	const ratio = [
		{ component: 'pRBC', ratio: '1 unit', rationale: 'Oxygen-carrying capacity' },
		{ component: 'FFP', ratio: '1 unit', rationale: 'Coagulation factors' },
		{ component: 'Platelets', ratio: '1 unit', rationale: 'Platelet plug formation' },
	];

	const ebvRef = [
		{ age: 'Preterm neonate', ebv: '90–100 mL/kg' },
		{ age: 'Term neonate (< 1 month)', ebv: '80–90 mL/kg' },
		{ age: 'Infant (1–12 months)', ebv: '80 mL/kg' },
		{ age: 'Child (1–12 years)', ebv: '70–75 mL/kg' },
		{ age: 'Adolescent / Adult', ebv: '65–70 mL/kg' },
	];

	$: weightKg = $patient?.weightKg ?? null;

	function calcDose(dose: string, weight: number | null): string {
		if (!weight) return '—';
		const rangeMatch = dose.match(/^([\d.]+)[–-]([\d.]+)\s*(mL|mg)\/kg/);
		if (rangeMatch) {
			const lo = Math.round(parseFloat(rangeMatch[1]) * weight);
			const hi = Math.round(parseFloat(rangeMatch[2]) * weight);
			return `${lo}–${hi} ${rangeMatch[3]}`;
		}
		const match = dose.match(/^([\d.]+)\s*(mL|mg)\/kg/);
		if (match) return `${Math.round(parseFloat(match[1]) * weight)} ${match[2]}`;
		return '—';
	}

	function ebv(weight: number | null): string {
		if (!weight) return '—';
		const ml = weight < 0.1 ? weight * 95 : weight < 1 ? weight * 85 : weight < 12 ? weight * 80 : weight * 72;
		return `~${Math.round(ml)} mL`;
	}
</script>

<svelte:head><title>Blood Products — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Blood Products &amp; MTP</h1>
		<p class="subtitle">Massive transfusion protocol · Dosing · Estimated blood volume · TXA · Calcium replacement</p>
		{#if $hasPatient}
			<div class="patient-badge">
				{$weightDisplay} — EBV: {ebv(weightKg)}
			</div>
		{/if}
	</div>

	<section>
		<h2 class="section-title">MTP Activation Criteria</h2>
		<div class="list-card">
			<ul class="trigger-list">
				{#each mtpTriggers as t}
					<li>{t}</li>
				{/each}
			</ul>
		</div>
	</section>

	<section>
		<h2 class="section-title">1:1:1 Ratio (MTP Target)</h2>
		<div class="ratio-row">
			{#each ratio as r}
				<div class="ratio-card">
					<div class="ratio-component">{r.component}</div>
					<div class="ratio-num">{r.ratio}</div>
					<div class="ratio-reason">{r.rationale}</div>
				</div>
			{/each}
		</div>
		<p class="table-note">Goal: balanced component therapy approximating whole blood. Add cryoprecipitate for fibrinogen &lt; 1.5 g/L. Monitor labs (TEG/ROTEM if available).</p>
	</section>

	<section>
		<h2 class="section-title">Blood Product Dosing</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr>
						<th>Product</th>
						<th>Dose</th>
						{#if $hasPatient}<th class="calc-col">For {$weightDisplay}</th>{/if}
						<th>Notes</th>
					</tr>
				</thead>
				<tbody>
					{#each products as p}
						<tr>
							<td class="bold-cell">{p.product}</td>
							<td class="mono-cell">{p.dose}</td>
							{#if $hasPatient}<td class="mono-cell primary-cell">{calcDose(p.dose, weightKg)}</td>{/if}
							<td class="note-cell">{p.note}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Estimated Blood Volume (EBV) Reference</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Age</th><th>EBV</th></tr></thead>
				<tbody>
					{#each ebvRef as e}
						<tr><td class="bold-cell">{e.age}</td><td class="mono-cell">{e.ebv}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if $hasPatient}
			<div class="ebv-calc">Patient EBV (estimated): <strong>{ebv(weightKg)}</strong></div>
		{/if}
	</section>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.75rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.patient-badge { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.7rem; background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 35%, transparent); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-success, #22c55e); }
	.list-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1rem; }
	.trigger-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.trigger-list li { font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.45; padding-left: 0.9rem; position: relative; }
	.trigger-list li::before { content: '·'; position: absolute; left: 0; color: var(--color-primary); }
	.ratio-row { display: flex; gap: 1rem; flex-wrap: wrap; }
	.ratio-card { flex: 1; min-width: 120px; text-align: center; padding: 1rem; background: var(--color-surface); border: 1px solid color-mix(in srgb, var(--color-primary) 30%, var(--color-border-subtle)); border-radius: var(--radius-sm); }
	.ratio-component { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.ratio-num { font-size: 1.75rem; font-family: var(--font-mono); font-weight: 700; color: var(--color-primary); margin: 0.25rem 0; }
	.ratio-reason { font-size: 0.73rem; color: var(--color-text-muted); }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); white-space: nowrap; }
	.primary-cell { color: var(--color-primary); font-weight: 600; }
	.calc-col { background: color-mix(in srgb, var(--color-primary) 6%, transparent); }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
	.table-note { font-size: 0.74rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
	.ebv-calc { margin-top: 0.6rem; font-family: var(--font-mono); font-size: 0.82rem; color: var(--color-text-muted); }
	.ebv-calc strong { color: var(--color-primary); }
</style>
