<script lang="ts">
	const trees = [
		{ name: 'Neonatal Transport', file: 'neonatal_transport_decision_tree.html', icon: '🚑' },
		{ name: 'Obstetric Emergencies', file: 'obstetric_emergencies_decision_tree.html', icon: '🤱' },
		{ name: 'NRP Resuscitation', file: 'nrp_resuscitation_decision_tree.html', icon: '👶' },
	];

	const stableProgram = [
		{ letter: 'S — Sugar & Safe Care', content: 'Blood glucose ≥ 40 mg/dL (neonate ≥ 45 mg/dL); IV access; patient identification; infection prevention.' },
		{ letter: 'T — Temperature', content: 'Axillary temp 36.5–37.5 °C; plastic wrap/hat for < 32 wk; servo-controlled isolette target; avoid hyperthermia (worsens HIE).' },
		{ letter: 'A — Airway', content: 'Patent airway confirmed; ETT position × CXR (T2–T3); CO₂ 35–45 mmHg; SpO₂ 90–95% (preterm); vent settings documented.' },
		{ letter: 'B — Blood Pressure', content: 'MAP ≥ gestational age in weeks (rule of thumb); treat with volume (10 mL/kg NS) then dopamine 5–10 mcg/kg/min.' },
		{ letter: 'L — Lab Work', content: 'CBC, BMP, blood culture, CXR, blood gas. Glucose every 30–60 min until stable. Type & screen if surgical candidate.' },
		{ letter: 'E — Emotional Support', content: 'Explain situation to family. Secure parent contact information. Provide transport team contact number. Obtain consents.' },
	];

	const transportCriteria = [
		{
			category: 'Respiratory',
			conditions: ['FiO₂ > 0.4 on CPAP/ventilator', 'Recurrent apnea requiring stimulation > 3×/shift', 'Respiratory distress unresponsive to CPAP', 'Suspected or confirmed air leak (PTX, PIE)'],
		},
		{
			category: 'Cardiovascular',
			conditions: ['Suspected congenital heart disease', 'Persistent pulmonary hypertension (PPHN)', 'Shock unresponsive to volume and first-line vasopressors', 'Significant arrhythmia'],
		},
		{
			category: 'Neurological',
			conditions: ['Seizures not controlled with first-line anticonvulsants', 'Suspected HIE (requires whole-body cooling eligibility evaluation)', 'Meningomyelocele or other neural tube defect', 'Intraventricular hemorrhage grade III–IV on US'],
		},
		{
			category: 'Surgical',
			conditions: ['Suspected NEC with perforation or Stage III', 'Abdominal wall defect (omphalocele, gastroschisis)', 'Tracheo-esophageal fistula', 'Intestinal obstruction'],
		},
		{
			category: 'Other',
			conditions: ['< 32 weeks gestational age (most Level II nurseries)', 'Birth weight < 1500 g', 'Hydrops fetalis', 'Metabolic crisis / inborn error of metabolism'],
		},
	];

	const preTx = [
		{ task: 'Airway secured?', note: 'Document ETT size, depth, CO₂ confirmation, SpO₂ target' },
		{ task: 'IV/IO/UAC/UVC access', note: 'Minimum 2 functioning lines; tape all connections' },
		{ task: 'Glucose 40–150 mg/dL', note: 'Running dextrose drip; documented GIR' },
		{ task: 'Temperature 36.5–37.5 °C', note: 'Isolette prewarmed; plastic wrap for ELBW' },
		{ task: 'Active medications listed', note: 'Dose, rate, concentration on written order' },
		{ task: 'Blood products available', note: 'PRBC if Hgb < 8 and deteriorating; FFP/Plt if coagulopathy' },
		{ task: 'Family consent & contact', note: 'Consent signed; family phone number given to transport team' },
		{ task: 'Records copied', note: 'Prenatal labs, delivery note, postnatal labs, imaging sent with infant' },
	];

	function openTree(file: string) { window.open(`/decision-trees/${file}`, '_blank'); }
</script>

<svelte:head><title>Transport — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Neonatal &amp; Pediatric Transport</h1>
		<p class="subtitle">STABLE program · Transport criteria · Pre-transport stabilization checklist</p>
	</div>

	<section>
		<h2 class="section-title">Decision Trees</h2>
		<div class="tree-row">
			{#each trees as t}
				<button class="tree-btn" on:click={() => openTree(t.file)}>
					{t.icon} {t.name} ↗
				</button>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">STABLE Program — Pre-Transport Checklist</h2>
		<div class="stable-list">
			{#each stableProgram as s}
				<div class="stable-row">
					<span class="stable-letter">{s.letter}</span>
					<span class="stable-content">{s.content}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Pre-Transport Documentation Checklist</h2>
		<div class="checklist">
			{#each preTx as item}
				<div class="check-row">
					<span class="check-box" aria-hidden="true">☐</span>
					<span class="check-task">{item.task}</span>
					<span class="check-note">{item.note}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Transport Criteria by System</h2>
		<div class="criteria-grid">
			{#each transportCriteria as cat}
				<div class="criteria-card">
					<div class="crit-heading">{cat.category}</div>
					<ul class="crit-list">
						{#each cat.conditions as c}
							<li>{c}</li>
						{/each}
					</ul>
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
	.tree-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tree-btn {
		padding: 0.45rem 1rem; background: var(--color-surface);
		border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);
		font-family: var(--font-body); font-size: 0.82rem; color: var(--color-text-muted);
		cursor: pointer; transition: border-color 0.15s, color 0.15s;
	}
	.tree-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.stable-list { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.stable-row { display: grid; grid-template-columns: 240px 1fr; gap: 1rem; padding: 0.7rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.stable-row:last-child { border-bottom: none; }
	.stable-row:nth-child(odd) { background: var(--color-surface); }
	.stable-letter { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.stable-content { font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.5; }
	.checklist { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.check-row { display: grid; grid-template-columns: 20px 200px 1fr; gap: 0.75rem; align-items: start; padding: 0.6rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.check-row:last-child { border-bottom: none; }
	.check-row:nth-child(odd) { background: var(--color-surface); }
	.check-box { font-size: 1rem; color: var(--color-text-muted); }
	.check-task { font-size: 0.82rem; font-weight: 600; color: var(--color-text); }
	.check-note { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; }
	.criteria-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.6rem; }
	.criteria-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1rem; }
	.crit-heading { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.5rem; }
	.crit-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.crit-list li { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; padding-left: 0.9rem; position: relative; }
	.crit-list li::before { content: '·'; position: absolute; left: 0; color: var(--color-primary); }
</style>
