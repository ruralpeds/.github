<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	// Emergency medication doses — weight-based (PALS 2020 / NRP 8th ed)
	const drugs = [
		{
			name: 'Epinephrine',
			category: 'Arrest / Anaphylaxis',
			routes: [
				{ route: 'Cardiac arrest (IV/IO)', dose: '0.01 mg/kg', conc: '0.1 mg/mL (1:10,000)', max: '1 mg', note: 'Repeat q3–5 min' },
				{ route: 'Anaphylaxis (IM)', dose: '0.01 mg/kg', conc: '1 mg/mL (1:1,000)', max: '0.5 mg', note: 'Lateral thigh; repeat in 5–15 min' },
				{ route: 'Infusion', dose: '0.1–1 mcg/kg/min', conc: 'Prepare per weight', max: '—', note: 'Start 0.1 mcg/kg/min; titrate to MAP' },
			]
		},
		{
			name: 'Atropine',
			category: 'Bradycardia',
			routes: [
				{ route: 'IV/IO', dose: '0.02 mg/kg', conc: '0.1 mg/mL', max: '0.5 mg (child) / 1 mg (adolescent)', note: 'Min dose 0.1 mg to avoid paradoxical bradycardia; repeat ×1' },
			]
		},
		{
			name: 'Adenosine',
			category: 'SVT',
			routes: [
				{ route: 'IV rapid push (1st dose)', dose: '0.1 mg/kg', conc: '3 mg/mL', max: '6 mg', note: 'Flush immediately with 10 mL NS; use proximal/central IV' },
				{ route: 'IV rapid push (2nd dose)', dose: '0.2 mg/kg', conc: '3 mg/mL', max: '12 mg', note: 'If no conversion after first dose' },
			]
		},
		{
			name: 'Amiodarone',
			category: 'VT / VF',
			routes: [
				{ route: 'Pulseless VT/VF (IV/IO)', dose: '5 mg/kg', conc: '50 mg/mL', max: '300 mg', note: 'Rapid push; can repeat ×2' },
				{ route: 'Stable VT (IV over 20–60 min)', dose: '5 mg/kg', conc: '1.5 mg/mL (diluted)', max: '300 mg', note: 'Monitor for hypotension; do not use with procainamide' },
			]
		},
		{
			name: 'Sodium Bicarbonate',
			category: 'Metabolic acidosis / Hyperkalemia',
			routes: [
				{ route: 'IV slow push', dose: '1 mEq/kg', conc: '0.5 mEq/mL (4.2% — for neonates) or 1 mEq/mL (8.4%)', max: '50 mEq', note: 'Neonates: use 4.2% only; confirm ventilation before giving' },
			]
		},
		{
			name: 'Calcium Chloride 10%',
			category: 'Hyperkalemia / Hypocalcemia / CCB overdose',
			routes: [
				{ route: 'IV slow push (over 5–10 min)', dose: '20 mg/kg (0.2 mL/kg)', conc: '100 mg/mL', max: '1 g (10 mL)', note: 'Tissue necrosis if extravasates — use large IV or IO' },
			]
		},
		{
			name: 'Dextrose',
			category: 'Hypoglycemia',
			routes: [
				{ route: 'D10W (neonates/infants < 3 mo)', dose: '2 mL/kg IV push', conc: '10% (0.1 g/mL)', max: '25 mL', note: 'Raises BG ~30–45 mg/dL; follow with dextrose infusion' },
				{ route: 'D25W (children)', dose: '2–4 mL/kg IV push', conc: '25% (0.25 g/mL)', max: '50 mL', note: 'Roughly 0.5–1 g/kg' },
				{ route: 'D50W (adolescents)', dose: '1–2 mL/kg IV push', conc: '50% (0.5 g/mL)', max: '50 mL (25 g)', note: 'Avoid peripheral IV if possible (vesicant)' },
			]
		},
		{
			name: 'Naloxone',
			category: 'Opioid reversal',
			routes: [
				{ route: 'IV/IO/IM/IN (respiratory arrest)', dose: '0.1 mg/kg', conc: '0.4 mg/mL', max: '2 mg', note: 'May repeat q2–3 min; intranasal: 0.1 mg/kg (max 2 mg) divided between nares' },
				{ route: 'IV (gradual reversal)', dose: '0.001–0.005 mg/kg', conc: '0.04 mg/mL (diluted)', max: '—', note: 'Titrate to adequate respirations; avoid acute withdrawal' },
			]
		},
		{
			name: 'Lorazepam',
			category: 'Seizures',
			routes: [
				{ route: 'IV/IO', dose: '0.1 mg/kg', conc: '2 mg/mL', max: '4 mg', note: 'Over 2 min; repeat ×1 in 5–10 min if needed' },
				{ route: 'IM', dose: '0.1 mg/kg', conc: '2 mg/mL', max: '4 mg', note: 'If no IV; onset 2–5 min' },
			]
		},
		{
			name: 'Midazolam',
			category: 'Seizures / Sedation',
			routes: [
				{ route: 'IM/IN (seizure)', dose: '0.2 mg/kg', conc: '5 mg/mL', max: '10 mg', note: 'Intranasal: split between nares; onset ~5 min' },
				{ route: 'IV (procedural)', dose: '0.05–0.1 mg/kg', conc: '1 mg/mL (diluted)', max: '5 mg', note: 'Titrate slowly; have reversal (flumazenil) available' },
			]
		},
		{
			name: 'Morphine',
			category: 'Analgesia',
			routes: [
				{ route: 'IV/IO slow push', dose: '0.05–0.1 mg/kg', conc: '1 mg/mL', max: '10 mg', note: 'Over 5–10 min; repeat q2–4 h' },
				{ route: 'IM', dose: '0.1–0.2 mg/kg', conc: '10 mg/mL', max: '15 mg', note: 'Slower onset than IV' },
			]
		},
		{
			name: 'Ketamine',
			category: 'Dissociative sedation / Analgesia',
			routes: [
				{ route: 'IV (PSA)', dose: '1–2 mg/kg', conc: '10 mg/mL', max: '—', note: 'Over 1–2 min; use 1 mg/kg for hemodynamically compromised' },
				{ route: 'IM (PSA)', dose: '4–5 mg/kg', conc: '50 mg/mL', max: '—', note: 'Onset 3–5 min; co-administer ondansetron' },
				{ route: 'RSI induction', dose: '1–2 mg/kg IV', conc: '10 mg/mL', max: '—', note: 'Preferred in bronchospasm/hemodynamic instability' },
			]
		},
		{
			name: 'Succinylcholine',
			category: 'RSI paralytic',
			routes: [
				{ route: 'IV/IO', dose: '2 mg/kg (infant/child) / 1.5 mg/kg (adolescent)', conc: '20 mg/mL', max: '150 mg', note: 'Onset 30–60 s; duration 5–10 min. Contraindicated in hyperkalemia, burns > 24 h, crush injury, NMD' },
			]
		},
		{
			name: 'Rocuronium',
			category: 'RSI paralytic',
			routes: [
				{ route: 'IV/IO (RSI dose)', dose: '1.2 mg/kg', conc: '10 mg/mL', max: '100 mg', note: 'Onset 60–90 s at RSI dose; reverse with sugammadex 16 mg/kg if needed' },
			]
		},
		{
			name: 'Diphenhydramine',
			category: 'Anaphylaxis adjunct / Dystonia',
			routes: [
				{ route: 'IV/IM', dose: '1 mg/kg', conc: '50 mg/mL', max: '50 mg', note: 'Give after epinephrine in anaphylaxis; not first-line' },
			]
		},
	];

	$: weightKg = $patient?.weightKg ?? null;

	function calcDose(doseStr: string, weight: number | null): string {
		if (!weight) return '—';
		// Parse simple "X mg/kg" or "X mL/kg" patterns
		const match = doseStr.match(/^([\d.]+)\s*(mg|mL|mEq|mcg|g)\/kg/);
		if (!match) return '—';
		const val = parseFloat(match[1]) * weight;
		const unit = match[2];
		return `${val % 1 === 0 ? val : val.toFixed(2)} ${unit}`;
	}
</script>

<svelte:head><title>Emergency Medication Dosing — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Emergency Medication Dosing</h1>
		<p class="subtitle">PALS 2020 · NRP 8th Ed · Weight-based doses · Max doses</p>
		{#if $hasPatient}
			<div class="patient-badge">Patient: {$weightDisplay} — doses calculated below</div>
		{/if}
	</div>

	{#if !$hasPatient}
		<div class="info-banner">
			Enter patient weight on the home page to see calculated doses alongside each drug.
		</div>
	{/if}

	{#each drugs as drug}
		<section class="drug-section">
			<div class="drug-header">
				<span class="drug-name">{drug.name}</span>
				<span class="drug-category">{drug.category}</span>
			</div>
			<div class="table-wrap">
				<table class="dose-table">
					<thead>
						<tr>
							<th>Route</th>
							<th>Dose (per kg)</th>
							{#if $hasPatient}<th class="calc-col">For {$weightDisplay}</th>{/if}
							<th>Concentration</th>
							<th>Max</th>
							<th>Notes</th>
						</tr>
					</thead>
					<tbody>
						{#each drug.routes as r}
							<tr>
								<td class="route-cell">{r.route}</td>
								<td class="mono-cell">{r.dose}</td>
								{#if $hasPatient}
									<td class="mono-cell calc-cell">{calcDose(r.dose, weightKg)}</td>
								{/if}
								<td class="mono-cell small">{r.conc}</td>
								<td class="mono-cell">{r.max}</td>
								<td class="note-cell">{r.note}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/each}

	<div class="disclaimer">
		<strong>⚠ Verify all doses</strong> against current PALS guidelines and your institution's formulary before administering. Weight-based calculations are estimates; always confirm with pharmacy for high-risk medications.
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.5rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.patient-badge {
		display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.7rem;
		background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 35%, transparent);
		border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem;
		color: var(--color-success, #22c55e);
	}
	.info-banner {
		padding: 0.65rem 1rem; background: var(--color-surface);
		border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);
		font-size: 0.82rem; color: var(--color-text-muted);
	}
	.drug-section { display: flex; flex-direction: column; gap: 0.4rem; }
	.drug-header { display: flex; align-items: baseline; gap: 0.75rem; }
	.drug-name { font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-text); }
	.drug-category { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-text-muted); padding: 0.1rem 0.5rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: 10px; }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.dose-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.dose-table th { padding: 0.45rem 0.75rem; text-align: left; font-size: 0.71rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; }
	.dose-table td { padding: 0.45rem 0.75rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.dose-table tr:last-child td { border-bottom: none; }
	.route-cell { font-size: 0.79rem; font-weight: 600; color: var(--color-text); white-space: nowrap; min-width: 160px; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); white-space: nowrap; }
	.calc-cell { color: var(--color-primary); font-weight: 600; }
	.small { font-size: 0.73rem; }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
	.calc-col { background: color-mix(in srgb, var(--color-primary) 6%, transparent); }
	.disclaimer { padding: 0.7rem 1rem; background: color-mix(in srgb, var(--color-warning, #f59e0b) 8%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-warning, #f59e0b) 30%, transparent); border-radius: var(--radius-sm); font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.5; }
	.disclaimer strong { color: var(--color-text); }
</style>
