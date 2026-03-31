<script lang="ts">
	const trees = [
		{ name: 'Pulmonary Disorders', file: 'neonatal_pulmonary_decision_tree.html', icon: '🫁' },
		{ name: 'Respiratory Escalation & NIV', file: 'neonatal_respiratory_escalation_decision_tree.html', icon: '💨' },
		{ name: 'NRP Resuscitation', file: 'nrp_resuscitation_decision_tree.html', icon: '⚡' },
	];

	const cpapSettings = [
		{ param: 'Starting CPAP pressure', value: '5–6 cmH₂O (term); 5–7 cmH₂O (preterm)' },
		{ param: 'FiO₂ target (preterm < 34 wk)', value: 'SpO₂ 91–95%; PaO₂ 50–80 mmHg' },
		{ param: 'FiO₂ target (term/late preterm)', value: 'SpO₂ 93–97%' },
		{ param: 'CPAP failure → intubate if', value: 'FiO₂ > 0.4; apnea unresponsive; pH < 7.20 with PaCO₂ > 60; OI ≥ 13' },
		{ param: 'HFNC flow rates', value: '2–8 L/min; max effective PEEP ~ 4 cmH₂O at high flows' },
	];

	const surfactant = [
		{ indication: 'INSURE (INtubate-SURfactant-Extubate)', criteria: '< 32 wk; FiO₂ 0.25–0.40 on CPAP; early within 2 h of age' },
		{ indication: 'LISA / MIST', criteria: '< 32 wk on CPAP; thin catheter technique; avoids full intubation' },
		{ indication: 'Rescue surfactant', criteria: 'Any GA with OI ≥ 10 or FiO₂ > 0.35 on CPAP or MV; administer if not given prophylactically' },
		{ indication: 'Repeat dose', criteria: 'FiO₂ > 0.30 4–6 h after first dose; max 2–3 doses depending on agent' },
	];

	const surfactantDosing = [
		{ drug: 'Beractant (Survanta)', dose: '100 mg/kg (4 mL/kg)', route: 'IT instillation × 4 aliquots' },
		{ drug: 'Calfactant (Infasurf)', dose: '105 mg/kg (3 mL/kg)', route: 'IT instillation × 2 aliquots' },
		{ drug: 'Poractant alfa (Curosurf)', dose: '100–200 mg/kg (1.25–2.5 mL/kg)', route: 'IT bolus (preferred for LISA)' },
		{ drug: 'Lucinactant (Surfaxin)', dose: '175 mg/kg (5.8 mL/kg)', route: 'IT instillation × 4 aliquots' },
	];

	const oiThresholds = [
		{ oi: '< 10', action: 'Conventional management (CPAP or MV at moderate settings)' },
		{ oi: '10–15', action: 'Surfactant if not given; optimize MV; consider iNO' },
		{ oi: '15–20', action: 'iNO (start 20 ppm); HFOV if on conventional MV' },
		{ oi: '≥ 25', action: 'Escalate iNO; sildenafil; consider ECMO referral' },
		{ oi: '≥ 40 (persistent)', action: 'ECMO criteria met — immediate referral to ECMO center' },
	];

	const ventSettings = [
		{ param: 'PIP initial', value: '16–20 cmH₂O (preterm); 20–25 cmH₂O (term)' },
		{ param: 'PEEP', value: '4–6 cmH₂O standard; 6–8 cmH₂O with PPHN' },
		{ param: 'Rate', value: '30–60 bpm (synchronised preferred)' },
		{ param: 'Ti', value: '0.3–0.4 s (preterm); 0.35–0.45 s (term)' },
		{ param: 'Tidal volume target', value: '4–6 mL/kg — use volume-guarantee if available' },
		{ param: 'SpO₂ alarms (preterm)', value: 'Low 88%, High 95%' },
	];

	function openTree(file: string) { window.open(`/decision-trees/${file}`, '_blank'); }
</script>

<svelte:head><title>Neonatal Respiratory — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Neonatal Respiratory Support</h1>
		<p class="subtitle">CPAP · Surfactant therapy · Ventilator settings · OI thresholds · PPHN</p>
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

	<div class="two-col">
		<section>
			<h2 class="section-title">CPAP &amp; HFNC Settings</h2>
			<div class="param-table">
				{#each cpapSettings as p}
					<div class="param-row">
						<span class="param-label">{p.param}</span>
						<span class="param-val">{p.value}</span>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="section-title">Conventional Ventilator Settings</h2>
			<div class="param-table">
				{#each ventSettings as p}
					<div class="param-row">
						<span class="param-label">{p.param}</span>
						<span class="param-val">{p.value}</span>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<section>
		<h2 class="section-title">Surfactant Indications</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Strategy</th><th>Criteria</th></tr></thead>
				<tbody>
					{#each surfactant as s}
						<tr><td class="bold-cell">{s.indication}</td><td>{s.criteria}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Surfactant Dosing</h2>
		<div class="dose-grid">
			{#each surfactantDosing as d}
				<div class="dose-card">
					<div class="dose-name">{d.drug}</div>
					<div class="dose-amount">{d.dose}</div>
					<div class="dose-route">{d.route}</div>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Oxygenation Index (OI) Thresholds</h2>
		<p class="formula-line">OI = (MAP × FiO₂ × 100) ÷ PaO₂</p>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>OI Range</th><th>Action</th></tr></thead>
				<tbody>
					{#each oiThresholds as o}
						<tr><td class="oi-cell">{o.oi}</td><td>{o.action}</td></tr>
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
	.tree-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tree-btn {
		padding: 0.45rem 1rem; background: var(--color-surface);
		border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);
		font-family: var(--font-body); font-size: 0.82rem; color: var(--color-text-muted);
		cursor: pointer; transition: border-color 0.15s, color 0.15s;
	}
	.tree-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
	.two-col { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
	.param-table { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.param-row { display: grid; grid-template-columns: 220px 1fr; gap: 0.75rem; padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); }
	.param-row:last-child { border-bottom: none; }
	.param-row:nth-child(odd) { background: var(--color-surface); }
	.param-label { font-size: 0.79rem; font-weight: 600; color: var(--color-text); }
	.param-val { font-family: var(--font-mono); font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.5; }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
	.clin-table th { padding: 0.55rem 0.9rem; text-align: left; font-size: 0.73rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-muted); line-height: 1.45; vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); }
	.oi-cell { font-family: var(--font-mono); font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.dose-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.5rem; }
	.dose-card { padding: 0.75rem 1rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.dose-name { font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.3rem; }
	.dose-amount { font-family: var(--font-mono); font-size: 0.85rem; color: var(--color-primary); font-weight: 600; }
	.dose-route { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.2rem; }
	.formula-line { font-family: var(--font-mono); font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 0.6rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.5rem 0.9rem; display: inline-block; }
</style>
