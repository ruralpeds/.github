<script lang="ts">
	import { patient, hasPatient, weightDisplay } from '$lib/stores/patient';

	// ETT sizing: uncuffed = GA/4 + 3.5 for preterm, or weight-based
	const ettByWeight = [
		{ weight: '< 1 kg', ettUncuffed: '2.5', depth: '6–7', notes: 'Uncuffed only; verify by CXR (T2–T3 level)' },
		{ weight: '1–2 kg', ettUncuffed: '3.0', depth: '7–8', notes: 'Uncuffed preferred; consider 3.5 if > 1.8 kg' },
		{ weight: '2–3 kg', ettUncuffed: '3.0–3.5', depth: '8–9', notes: '' },
		{ weight: '3–4 kg (term)', ettUncuffed: '3.5', depth: '9–10', notes: 'Cuffed 3.0 acceptable in difficult airway' },
	];

	const medications = [
		{ drug: 'Atropine (premedication)', dose: '0.02 mg/kg IV', min: '0.1 mg', max: '0.5 mg', note: 'Prevents vagally-mediated bradycardia; give 1–2 min before laryngoscopy' },
		{ drug: 'Morphine (analgesia — if stable)', dose: '0.05–0.1 mg/kg IV slow', min: '—', max: '2 mg', note: 'For semi-elective intubation; avoid in hemodynamically unstable infants' },
		{ drug: 'Sucrose (non-pharm)', dose: '0.5–2 mL PO/buccal', min: '—', max: '—', note: '24% sucrose for procedural comfort in neonates < 31 days; evidence limited for intubation' },
		{ drug: 'Propofol (induction — if stable)', dose: '1–2 mg/kg IV slow', min: '—', max: '—', note: 'Use cautiously; can cause hypotension. Alternative: low-dose ketamine 0.5–1 mg/kg' },
		{ drug: 'Succinylcholine (paralytic)', dose: '2 mg/kg IV (neonate)', min: '—', max: '—', note: 'Preferred for rapid sequence in neonates; watch for hyperkalemia risk in congenital myopathies' },
	];

	const technique = [
		{ step: 'Position', detail: 'Neutral "sniffing" position — small roll under shoulders; avoid hyperextension (unlike adults)' },
		{ step: 'Blade', detail: 'Straight Miller blade preferred: size 0 (ELBW/< 28 wk), size 0–1 (28–34 wk), size 1 (term)' },
		{ step: 'Laryngoscopy', detail: 'Left hand holds blade; lift in axis of handle — do NOT rock. Lift epiglottis directly with straight blade. Visualize cords.' },
		{ step: 'ETT insertion', detail: 'Pass ETT through cords under direct vision; advance to vocal cord guide marker. Record lip marking (cm).' },
		{ step: 'Confirmation', detail: 'CO₂ colorimetric detector (yellow = exhaled CO₂); bilateral breath sounds; CXR within 30 min (tip at T2–T3). SpO₂ ≥ 90%.' },
		{ step: 'Secure tube', detail: 'Use adhesive tape anchored to dry cheeks (benzoin prep); document lip depth. Recheck depth after repositioning.' },
		{ step: 'Post-intubation', detail: 'Chest X-ray immediately. Set ventilator (PIP 16–20, PEEP 4–5, rate 40–60, FiO₂ to SpO₂ target). Sedation/analgesia.' },
	];

	const nrpIndications = [
		'Apnea or gasping despite stimulation',
		'Heart rate < 100 bpm despite PPV × 30 s',
		'Heart rate < 60 bpm (or not rising) despite PPV + chest compressions',
		'Congenital diaphragmatic hernia (immediate intubation — no BVM)',
		'Extremely preterm (< 25–26 wk) — anticipatory intubation',
		'Meconium + non-vigorous infant (ET suction of mouth/hypopharynx first)',
	];

	$: weightKg = $patient?.weightKg ?? null;

	function ettFromWeight(w: number | null): string {
		if (!w) return '—';
		if (w < 1) return '2.5 uncuffed';
		if (w < 2) return '3.0 uncuffed';
		if (w < 3) return '3.0–3.5 uncuffed';
		return '3.5 uncuffed';
	}

	function depthFromWeight(w: number | null): string {
		if (!w) return '—';
		// Gestational age not always available; use weight-based estimate
		if (w < 1) return '6–7 cm at lip';
		if (w < 2) return '7–8 cm at lip';
		if (w < 3) return '8–9 cm at lip';
		return '9–10 cm at lip';
	}
</script>

<svelte:head><title>Neonatal Intubation — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Neonatal Intubation</h1>
		<p class="subtitle">ETT sizing · NRP indications · Technique · Post-intubation ventilation</p>
		{#if $hasPatient}
			<div class="patient-badge">
				{$weightDisplay} — ETT: {ettFromWeight(weightKg)} · Depth: {depthFromWeight(weightKg)}
			</div>
		{/if}
	</div>

	<section>
		<h2 class="section-title">Indications for Intubation (NRP / NICU)</h2>
		<div class="list-card">
			<ul class="ind-list">
				{#each nrpIndications as ind}
					<li>{ind}</li>
				{/each}
			</ul>
		</div>
	</section>

	<section>
		<h2 class="section-title">ETT Size &amp; Depth by Birth Weight</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr><th>Weight</th><th>ETT (uncuffed)</th><th>Lip Depth (cm)</th><th>Notes</th></tr>
				</thead>
				<tbody>
					{#each ettByWeight as r}
						<tr>
							<td class="bold-cell">{r.weight}</td>
							<td class="mono-cell">{r.ettUncuffed}</td>
							<td class="mono-cell">{r.depth}</td>
							<td class="note-cell">{r.notes}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="table-note">Rule of thumb: Lip depth (cm) ≈ weight (kg) + 6. Confirm by CXR — tip at T2–T3, above carina.</p>
	</section>

	<section>
		<h2 class="section-title">Medications</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Drug</th><th>Dose</th><th>Min / Max</th><th>Notes</th></tr></thead>
				<tbody>
					{#each medications as m}
						<tr>
							<td class="bold-cell">{m.drug}</td>
							<td class="mono-cell">{m.dose}</td>
							<td class="mono-cell">{m.min} / {m.max}</td>
							<td class="note-cell">{m.note}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Intubation Technique</h2>
		<div class="technique-list">
			{#each technique as t}
				<div class="tech-row">
					<span class="tech-step">{t.step}</span>
					<span class="tech-detail">{t.detail}</span>
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
	.patient-badge { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.7rem; background: color-mix(in srgb, var(--color-success, #22c55e) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 35%, transparent); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-success, #22c55e); }
	.list-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1rem; }
	.ind-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.ind-list li { font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.45; padding-left: 0.9rem; position: relative; }
	.ind-list li::before { content: '·'; position: absolute; left: 0; color: var(--color-primary); }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); white-space: nowrap; }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
	.table-note { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
	.technique-list { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.tech-row { display: grid; grid-template-columns: 160px 1fr; gap: 1rem; padding: 0.65rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.tech-row:last-child { border-bottom: none; }
	.tech-row:nth-child(odd) { background: var(--color-surface); }
	.tech-step { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.tech-detail { font-size: 0.79rem; color: var(--color-text-muted); line-height: 1.45; }
</style>
