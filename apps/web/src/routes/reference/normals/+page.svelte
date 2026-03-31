<script lang="ts">
	const vitalSigns = [
		{ age: 'Premature (28–32 wk)', hr: '120–180', sbp: '35–55', dbp: '20–35', rr: '40–70', spo2: '91–95%', temp: '36.5–37.5°C' },
		{ age: 'Term neonate (0–28 d)', hr: '100–165', sbp: '60–80', dbp: '35–50', rr: '30–60', spo2: '93–100%', temp: '36.5–37.5°C' },
		{ age: 'Infant (1–12 mo)', hr: '100–150', sbp: '70–100', dbp: '50–65', rr: '25–50', spo2: '95–100%', temp: '36.5–38.0°C' },
		{ age: 'Toddler (1–3 yr)', hr: '90–140', sbp: '80–110', dbp: '50–70', rr: '20–30', spo2: '95–100%', temp: '36.5–38.0°C' },
		{ age: 'Preschool (3–6 yr)', hr: '80–120', sbp: '85–110', dbp: '55–70', rr: '18–25', spo2: '95–100%', temp: '36.5–38.0°C' },
		{ age: 'School age (6–12 yr)', hr: '70–110', sbp: '90–120', dbp: '55–75', rr: '15–20', spo2: '95–100%', temp: '36.5–38.0°C' },
		{ age: 'Adolescent (12–18 yr)', hr: '60–100', sbp: '100–130', dbp: '65–80', rr: '12–18', spo2: '95–100%', temp: '36.5–37.5°C' },
	];

	const labs = [
		{ test: 'Sodium', normal: '135–145 mEq/L', critical: '< 125 or > 155 mEq/L', notes: 'Hyponatremia most common dyselectrolytemia in pediatrics' },
		{ test: 'Potassium', normal: '3.5–5.5 mEq/L (infant: up to 6.0)', critical: '< 2.5 or > 6.5 mEq/L', notes: 'Higher normal in neonates; hemolysis falsely elevates' },
		{ test: 'Chloride', normal: '98–108 mEq/L', critical: '—', notes: 'Low in metabolic alkalosis; high in non-AG acidosis' },
		{ test: 'CO₂ (bicarbonate)', normal: '20–26 mEq/L (neonate: 16–24)', critical: '< 12 or > 32 mEq/L', notes: 'Reflects acid-base balance; low in metabolic acidosis' },
		{ test: 'Glucose', normal: '70–110 mg/dL (neonate: 45–125)', critical: '< 40 or > 400 mg/dL', notes: 'Neonatal hypoglycemia: < 45 mg/dL; infants: < 50 mg/dL' },
		{ test: 'Calcium (total)', normal: '8.5–10.5 mg/dL (neonate: 7.0–11.0)', critical: '< 6.5 or > 13 mg/dL', notes: 'Ionized Ca preferred: normal 1.1–1.4 mmol/L' },
		{ test: 'Magnesium', normal: '1.7–2.5 mg/dL', critical: '< 1.0 or > 5.0 mg/dL', notes: 'Deficiency often co-exists with hypokalemia' },
		{ test: 'Phosphorus', normal: '4.5–6.5 mg/dL (child); 3.0–4.5 (adolescent)', critical: '< 1.0 mg/dL', notes: 'Higher normal in neonates/infants' },
		{ test: 'BUN', normal: '5–20 mg/dL', critical: '> 100 mg/dL (uremia)', notes: 'BUN:Cr > 20 → pre-renal azotemia' },
		{ test: 'Creatinine', normal: 'Newborn 0.3–1.0; Infant < 0.4; Child 0.3–0.7; Adolescent 0.5–1.0 mg/dL', critical: '—', notes: 'Lower in children; eGFR better reflects renal function' },
		{ test: 'WBC', normal: 'Neonate 9–30 × 10³; Infant 6–17.5; Child 5–14.5 × 10³/μL', critical: '< 2.0 or > 30 × 10³/μL', notes: 'Neutropenia: ANC < 500 = severe' },
		{ test: 'Hemoglobin', normal: 'Neonate 14–24 g/dL; Infant 10–14; Child 11–16 g/dL', critical: '< 7 g/dL', notes: 'Physiologic nadir 6–8 wk (8–10 g/dL); lower at 2–3 mo' },
		{ test: 'Platelets', normal: '150,000–450,000/μL', critical: '< 50,000 (major bleeding risk)', notes: 'Thrombocytopenia: < 100,000; transfuse if < 10,000 or actively bleeding < 50,000' },
		{ test: 'PT/INR', normal: 'PT 11–13 s; INR 0.9–1.2', critical: 'INR > 2.5 (coagulopathy)', notes: 'Prolonged in liver disease, DIC, vitamin K deficiency' },
		{ test: 'Lactate', normal: '< 2.0 mmol/L', critical: '> 4.0 mmol/L (severe)', notes: '> 2.0 mmol/L = hyperlactatemia; trend matters as much as single value' },
	];

	const bloodGas = [
		{ param: 'pH', arterial: '7.35–7.45', venous: '7.32–7.42', notes: 'Neonatal arterial: 7.35–7.45 (slightly lower accepted 7.25–7.45)' },
		{ param: 'PaO₂', arterial: '80–100 mmHg', venous: '35–45 mmHg', notes: 'Neonates on room air: 50–70 mmHg acceptable' },
		{ param: 'PaCO₂', arterial: '35–45 mmHg', venous: '41–51 mmHg', notes: 'Preterm may target 45–55 mmHg (permissive hypercapnia)' },
		{ param: 'HCO₃', arterial: '22–26 mEq/L', venous: '23–27 mEq/L', notes: 'Neonates: 18–22 mEq/L acceptable (metabolic compensation)' },
		{ param: 'Base excess', arterial: '−2 to +2 mEq/L', venous: '−2 to +3 mEq/L', notes: '< −8 mEq/L = significant acidosis; > −16 = severe' },
		{ param: 'SpO₂ (pulse ox)', arterial: '95–100%', venous: '—', notes: 'Preterm: target 91–95%; term neonate: 93–97%' },
	];
</script>

<svelte:head><title>Normal Values — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Normal Values</h1>
		<p class="subtitle">Age-stratified vital signs · Lab reference ranges · Blood gas interpretation</p>
	</div>

	<section>
		<h2 class="section-title">Vital Signs by Age</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr><th>Age</th><th>HR (bpm)</th><th>SBP (mmHg)</th><th>DBP</th><th>RR (/min)</th><th>SpO₂</th><th>Temperature</th></tr>
				</thead>
				<tbody>
					{#each vitalSigns as r}
						<tr>
							<td class="bold-cell">{r.age}</td>
							<td class="mono-cell">{r.hr}</td>
							<td class="mono-cell">{r.sbp}</td>
							<td class="mono-cell">{r.dbp}</td>
							<td class="mono-cell">{r.rr}</td>
							<td class="mono-cell">{r.spo2}</td>
							<td class="mono-cell">{r.temp}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="table-note">Hypotension: SBP &lt; 70 + (2 × age years) for children 1–10 yr; &lt; 60 mmHg for term neonates; &lt; 90 mmHg for adolescents.</p>
	</section>

	<section>
		<h2 class="section-title">Common Lab Reference Ranges</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Test</th><th>Normal Range</th><th>Critical Value</th><th>Notes</th></tr></thead>
				<tbody>
					{#each labs as l}
						<tr>
							<td class="bold-cell">{l.test}</td>
							<td class="mono-cell">{l.normal}</td>
							<td class="mono-cell warn-cell">{l.critical}</td>
							<td class="note-cell">{l.notes}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Blood Gas Reference Ranges</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Parameter</th><th>Arterial</th><th>Venous</th><th>Notes</th></tr></thead>
				<tbody>
					{#each bloodGas as b}
						<tr>
							<td class="bold-cell">{b.param}</td>
							<td class="mono-cell">{b.arterial}</td>
							<td class="mono-cell">{b.venous}</td>
							<td class="note-cell">{b.notes}</td>
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
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); white-space: nowrap; }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); }
	.warn-cell { color: color-mix(in srgb, var(--color-warning, #f59e0b) 90%, var(--color-text-muted)); }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
	.table-note { font-size: 0.74rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
</style>
