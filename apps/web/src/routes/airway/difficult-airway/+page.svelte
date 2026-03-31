<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	const failedAirwayAlgorithm = [
		{ step: '1', label: 'Pre-oxygenate', detail: 'BVM 100% O₂ × 3–5 min; apneic oxygenation via NC 5–15 L/min if available' },
		{ step: '2', label: 'First attempt (best attempt)', detail: 'Video laryngoscopy preferred; direct only if VL unavailable. Use BURP/bimanual laryngoscopy. Give RSI drugs, SALAD technique if vomiting.' },
		{ step: '3', label: 'Attempt fails — declare "difficult airway"', detail: 'Call for help; begin rescue oxygenation via BVM; limit total laryngoscopy attempts to ≤ 3' },
		{ step: '4', label: 'Can oxygenate with BVM?', detail: 'YES → Non-emergency path. NO → Emergency path (CICO — Cannot Intubate Cannot Oxygenate)' },
		{ step: '5a', label: 'Non-emergency path (can oxygenate)', detail: 'Supraglottic airway (LMA/iGel) → awake/cooperative: fiberoptic or video-guided; pediatric specialist if available; consider surgical airway if all fail' },
		{ step: '5b', label: 'Emergency path (CICO)', detail: 'Attempt SGA × 1. If fails: needle cricothyrotomy (< 10 yr) or surgical cricothyrotomy (≥ 10 yr / adolescent). Jet ventilation via needle cric.' },
		{ step: '6', label: 'Surgical airway', detail: 'Needle cric (< 10 yr): 14–16G angiocath through CTM, aspirate air, attach 3 mL syringe → ETT 3.0 adapter → BVM. Surgical (≥ 10 yr): vertical skin, horizontal CTM, bougie, 6.0 cuffed ETT.' },
	];

	const sgaSizing = [
		{ size: 'LMA 1', weight: '< 5 kg', volume: '4 mL' },
		{ size: 'LMA 1.5', weight: '5–10 kg', volume: '7 mL' },
		{ size: 'LMA 2', weight: '10–20 kg', volume: '10 mL' },
		{ size: 'LMA 2.5', weight: '20–30 kg', volume: '14 mL' },
		{ size: 'LMA 3', weight: '30–50 kg', volume: '20 mL' },
		{ size: 'LMA 4', weight: '50–70 kg', volume: '30 mL' },
		{ size: 'LMA 5', weight: '> 70 kg', volume: '40 mL' },
	];

	const difficultAirwayPredictors = [
		{ mnemonic: 'LEMON', items: ['L — Look externally (trauma, obesity, receding chin, large tongue)', 'E — Evaluate 3-3-2 rule (mouth open 3 fingers, hyoid-chin 3 fingers, thyroid-floor 2 fingers)', 'M — Mallampati score (III/IV predicts difficulty)', 'O — Obstruction / Obesity', 'N — Neck mobility (C-spine precautions)'] },
		{ mnemonic: 'DOPES (post-intubation deterioration)', items: ['D — Displacement of ETT', 'O — Obstruction (mucus plug, secretions)', 'P — Pneumothorax', 'E — Equipment failure', 'S — Stacking / Auto-PEEP'] },
	];

	$: weightKg = $patient?.weightKg ?? null;

	function getLMA(weight: number | null): string {
		if (!weight) return '—';
		if (weight < 5) return 'LMA 1 (4 mL)';
		if (weight < 10) return 'LMA 1.5 (7 mL)';
		if (weight < 20) return 'LMA 2 (10 mL)';
		if (weight < 30) return 'LMA 2.5 (14 mL)';
		if (weight < 50) return 'LMA 3 (20 mL)';
		if (weight < 70) return 'LMA 4 (30 mL)';
		return 'LMA 5 (40 mL)';
	}
</script>

<svelte:head><title>Difficult Airway — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Difficult Airway</h1>
		<p class="subtitle">Failed airway algorithm · CICO rescue · Surgical airway · Supraglottic devices</p>
		{#if $hasPatient}
			<div class="patient-badge">Patient: {$weightDisplay} — LMA: {getLMA(weightKg)}</div>
		{/if}
	</div>

	<div class="alert-box">
		<strong>CICO Emergency:</strong> Cannot Intubate, Cannot Oxygenate — proceed directly to surgical airway. Do not delay for additional intubation attempts.
	</div>

	<section>
		<h2 class="section-title">Difficult Airway Algorithm</h2>
		<div class="sequence-list">
			{#each failedAirwayAlgorithm as s}
				<div class="seq-row" class:cico={s.step === '5b' || s.step === '6'}>
					<span class="seq-num">{s.step}</span>
					<div class="seq-body">
						<div class="seq-label">{s.label}</div>
						<div class="seq-detail">{s.detail}</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<div class="two-col">
		<section>
			<h2 class="section-title">Supraglottic Airway (LMA) Sizing</h2>
			{#if $hasPatient}
				<div class="calc-banner">Patient LMA: <strong>{getLMA(weightKg)}</strong></div>
			{/if}
			<div class="table-wrap">
				<table class="clin-table">
					<thead><tr><th>LMA Size</th><th>Weight</th><th>Cuff Volume</th></tr></thead>
					<tbody>
						{#each sgaSizing as r}
							<tr class:highlight-row={weightKg && r.weight.includes('-') ? false : weightKg && getLMA(weightKg).startsWith(r.size)}>
								<td class="bold-cell">{r.size}</td>
								<td class="mono-cell">{r.weight}</td>
								<td class="mono-cell">{r.volume}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section>
			<h2 class="section-title">Airway Difficulty Predictors</h2>
			{#each difficultAirwayPredictors as m}
				<div class="mnemonic-card">
					<div class="mnemonic-title">{m.mnemonic}</div>
					<ul class="mnemonic-list">
						{#each m.items as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</section>
	</div>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.75rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.patient-badge { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.7rem; background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 35%, transparent); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-success, #22c55e); }
	.alert-box { padding: 0.75rem 1rem; background: color-mix(in srgb, var(--color-error, #f87171) 10%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-error, #f87171) 40%, transparent); border-radius: var(--radius-sm); font-size: 0.83rem; color: var(--color-text-muted); line-height: 1.5; }
	.alert-box strong { color: var(--color-text); }
	.sequence-list { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.seq-row { display: flex; align-items: flex-start; gap: 1rem; padding: 0.7rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.seq-row:last-child { border-bottom: none; }
	.seq-row:nth-child(odd) { background: var(--color-surface); }
	.seq-row.cico { background: color-mix(in srgb, var(--color-error, #f87171) 8%, var(--color-surface)); border-color: color-mix(in srgb, var(--color-error, #f87171) 20%, var(--color-border-subtle)); }
	.seq-num { font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: var(--color-primary); width: 20px; flex-shrink: 0; }
	.seq-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.2rem; }
	.seq-detail { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.45; }
	.two-col { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
	.calc-banner { padding: 0.4rem 0.75rem; background: color-mix(in srgb, var(--color-primary) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 0.6rem; }
	.calc-banner strong { color: var(--color-primary); }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-muted); }
	.clin-table tr:last-child td { border-bottom: none; }
	.highlight-row td { background: color-mix(in srgb, var(--color-primary) 8%, transparent); color: var(--color-primary) !important; font-weight: 600; }
	.bold-cell { font-weight: 600; color: var(--color-text); }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; }
	.mnemonic-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 0.5rem; }
	.mnemonic-title { font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem; }
	.mnemonic-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
	.mnemonic-list li { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; padding-left: 0.9rem; position: relative; }
	.mnemonic-list li::before { content: '·'; position: absolute; left: 0; color: var(--color-primary); }
</style>
