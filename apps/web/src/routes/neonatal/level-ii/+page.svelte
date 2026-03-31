<script lang="ts">
	const admissionCriteria = [
		{ category: 'Gestational Age', criteria: '32 0/7 – 36 6/7 weeks (late preterm / moderate preterm); > 34 wk at most Level IIs without subspecialty backup' },
		{ category: 'Birth Weight', criteria: '1500–2500 g; some centers accept > 1200 g with stable respiratory status' },
		{ category: 'Respiratory', criteria: 'Transient tachypnea, mild–moderate RDS requiring CPAP ≤ 35% FiO₂; no sustained apnea requiring MV' },
		{ category: 'Hypoglycemia', criteria: 'Persistent hypoglycemia requiring IV dextrose; GIR need < 8–10 mg/kg/min' },
		{ category: 'Jaundice', criteria: 'Phototherapy; not requiring exchange transfusion' },
		{ category: 'Temperature Instability', criteria: 'Requiring incubator/isolette support' },
		{ category: 'Feeding', criteria: 'Nasogastric/orogastric tube feeds; inability to establish oral feeds' },
		{ category: 'Sepsis workup', criteria: 'Rule-out sepsis requiring IV antibiotics; clinical stability' },
		{ category: 'Post-surgical', criteria: 'Post-op care for minor surgical conditions; not requiring ICU-level monitoring' },
	];

	const escalationThresholds = [
		{ condition: 'Respiratory', threshold: 'FiO₂ > 0.35–0.40 on CPAP; recurrent apnea (> 3 stimulations/shift or requiring bag-mask); pCO₂ > 60 with pH < 7.25; OI ≥ 13' },
		{ condition: 'Hemodynamic', threshold: 'MAP < GA (weeks) or SBP < 40 mmHg; shock signs unresponsive to 20 mL/kg NS; HR < 80 or > 200 with clinical deterioration' },
		{ condition: 'Neurological', threshold: 'Seizures requiring > first-line benzodiazepine; GCS decline; HIE criteria met (≥ 36 wk, cord pH < 7.0 or base deficit > 16)' },
		{ condition: 'Glucose', threshold: 'GIR requirement > 10–12 mg/kg/min; persistent hypoglycemia (< 45 mg/dL) despite optimized IVF' },
		{ condition: 'Surgical emergency', threshold: 'NEC Stage II–III; abdominal wall defect; gastroschisis; intestinal obstruction' },
		{ condition: 'Extreme prematurity', threshold: '< 32 weeks (or < 1500 g) — requires NICU level of care' },
	];

	const careBundles = [
		{
			bundle: 'CLABSI Prevention',
			items: ['Hand hygiene before line access', 'Maximal sterile barrier on insertion', 'Daily line necessity review', 'Chlorhexidine skin prep (≥ 28 wk)', 'Antimicrobial dressing change per protocol'],
		},
		{
			bundle: 'VAP Prevention',
			items: ['HOB 30° unless contraindicated', 'Oral care every 4–6 hours', 'Inline suctioning', 'ETT cuff pressure 20–25 cmH₂O', 'Extubation readiness assessment daily'],
		},
		{
			bundle: 'ROP Screening',
			items: ['< 30 wk: first screen at 4 weeks chronological', '30–36 wk: first screen at 4 weeks CA or 31 wk PMA (whichever later)', 'Screen by ophthalmology familiar with zone/stage', 'Anti-VEGF or laser if zone I–II stage 3+ or plus disease'],
		},
		{
			bundle: 'Developmental Care',
			items: ['Skin-to-skin / kangaroo care ≥ 1 h/day', 'Clustered cares to minimize stimulation', 'Supine positioning with boundaries/nesting', 'Dim lighting and noise reduction', 'Non-nutritive sucking during tube feeds'],
		},
	];

	const monitoring = [
		{ param: 'SpO₂ alarms (< 34 wk)', target: 'Low 88–90% / High 94–95%' },
		{ param: 'SpO₂ alarms (≥ 34 wk)', target: 'Low 92–94% / High 97–98%' },
		{ param: 'HR', target: '100–170 bpm; evaluate bradycardia < 80 bpm' },
		{ param: 'Temperature (isolette)', target: '36.5–37.5 °C axillary' },
		{ param: 'Blood glucose', target: '50–150 mg/dL; check pre-feed until stable' },
		{ param: 'Blood pressure (MAP)', target: 'MAP ≥ GA in weeks (rough guide); confirm with clinical perfusion assessment' },
		{ param: 'Weight', target: 'Daily; expect 5–10% loss first week, regain by DOL 10–14' },
		{ param: 'Head circumference', target: 'Weekly; target ~1 cm/week once stable' },
	];

	const trees = [
		{ name: 'Neonatal Transport', file: 'neonatal_transport_decision_tree.html', icon: '🚑' },
		{ name: 'Early-Onset Sepsis', file: 'neonatal_eos_sepsis_decision_tree.html', icon: '🦠' },
		{ name: 'Respiratory Escalation', file: 'neonatal_respiratory_escalation_decision_tree.html', icon: '💨' },
	];

	function openTree(file: string) { window.open(`/decision-trees/${file}`, '_blank'); }
</script>

<svelte:head><title>Level II Protocols — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Level II Nursery Protocols</h1>
		<p class="subtitle">Admission criteria · Escalation thresholds · Monitoring targets · Care bundles</p>
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
		<h2 class="section-title">Admission Criteria</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Category</th><th>Criteria for Level II Admission</th></tr></thead>
				<tbody>
					{#each admissionCriteria as a}
						<tr><td class="bold-cell">{a.category}</td><td>{a.criteria}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Escalation Thresholds (Transfer to Level III/IV NICU)</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>System</th><th>Transfer Trigger</th></tr></thead>
				<tbody>
					{#each escalationThresholds as e}
						<tr><td class="bold-cell">{e.condition}</td><td>{e.threshold}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Monitoring Targets</h2>
		<div class="param-table">
			{#each monitoring as m}
				<div class="param-row">
					<span class="param-label">{m.param}</span>
					<span class="param-val">{m.target}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Evidence-Based Care Bundles</h2>
		<div class="bundle-grid">
			{#each careBundles as b}
				<div class="bundle-card">
					<div class="bundle-name">{b.bundle}</div>
					<ul class="bundle-list">
						{#each b.items as item}
							<li>{item}</li>
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
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
	.clin-table th { padding: 0.55rem 0.9rem; text-align: left; font-size: 0.73rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-muted); line-height: 1.5; vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.param-table { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.param-row { display: grid; grid-template-columns: 260px 1fr; gap: 0.75rem; padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); }
	.param-row:last-child { border-bottom: none; }
	.param-row:nth-child(odd) { background: var(--color-surface); }
	.param-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.param-val { font-family: var(--font-mono); font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.5; }
	.bundle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.6rem; }
	.bundle-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.85rem 1rem; }
	.bundle-name { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.5rem; }
	.bundle-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.3rem; }
	.bundle-list li { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; padding-left: 0.9rem; position: relative; }
	.bundle-list li::before { content: '·'; position: absolute; left: 0; color: var(--color-primary); }
</style>
