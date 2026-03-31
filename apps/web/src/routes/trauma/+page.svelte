<script lang="ts">
	const trees = [
		{ name: 'Pediatric Trauma', file: 'pediatric_trauma_decision_tree.html', icon: '🚑' },
		{ name: 'Pediatric Burns', file: 'pediatric_burns_decision_tree.html', icon: '🔥' },
		{ name: 'Orthopedic Emergencies', file: 'pediatric_orthopedic_decision_tree.html', icon: '🦴' },
	];

	const primarySurvey = [
		{ step: 'A — Airway', content: 'C-spine precautions. Jaw thrust > head-tilt in trauma. RSI if GCS ≤ 8, unable to protect airway, or respiratory failure.' },
		{ step: 'B — Breathing', content: 'Tension PTX: needle decompression 2nd ICS MCL (or 4th–5th ICS AAL). Flail chest: positive-pressure ventilation. Open PTX: 3-sided occlusive dressing.' },
		{ step: 'C — Circulation', content: 'Hemorrhage control: direct pressure. IO if no IV in 60–90 s. Shock: 10–20 mL/kg LR/NS bolus (reassess). MTP for ongoing hemorrhage (1:1:1 pRBC:FFP:Plt).' },
		{ step: 'D — Disability', content: 'GCS, pupils, posturing. BSL. If GCS < 9 → intubate, HOB 30°, avoid hypotension (SBP ≥ 70 + 2× age).' },
		{ step: 'E — Exposure', content: 'Full exposure, maintain normothermia (warm blankets, warm fluids). FAST exam. Log-roll for spine assessment.' },
	];

	const gcs = [
		{ cat: 'Eye Opening', items: ['4 — Spontaneous', '3 — To voice', '2 — To pain', '1 — None'] },
		{ cat: 'Verbal (≥ 2 yr)', items: ['5 — Oriented', '4 — Confused', '3 — Inappropriate words', '2 — Sounds', '1 — None'] },
		{ cat: 'Verbal (< 2 yr)', items: ['5 — Coos, babbles', '4 — Irritable cries', '3 — Cries to pain', '2 — Moans to pain', '1 — None'] },
		{ cat: 'Motor', items: ['6 — Obeys commands', '5 — Localizes pain', '4 — Withdraws', '3 — Abnormal flexion', '2 — Extension', '1 — None'] },
	];

	const burnEstimate = [
		{ age: 'Infant (< 1 yr)', head: '18%', each_arm: '9%', each_leg: '13%', trunk_ant: '18%', trunk_post: '18%', genitalia: '1%' },
		{ age: 'Child (5 yr)', head: '13%', each_arm: '9%', each_leg: '16%', trunk_ant: '18%', trunk_post: '18%', genitalia: '1%' },
		{ age: 'Adult (≥ 15 yr)', head: '9%', each_arm: '9%', each_leg: '18%', trunk_ant: '18%', trunk_post: '18%', genitalia: '1%' },
	];

	const fluidResus = [
		{ label: 'Parkland formula (burns)', dose: '3–4 mL/kg/% TBSA LR over 24 h; half in first 8 h, half in next 16 h' },
		{ label: 'Hemorrhagic shock (initial)', dose: '10–20 mL/kg isotonic crystalloid; reassess after each bolus' },
		{ label: 'MTP activation threshold', dose: 'Shock index (HR/SBP) > 1.0 or estimated blood loss > 30–40% EBV' },
		{ label: 'TXA (< 3 h from injury)', dose: '15 mg/kg IV over 10 min (max 1 g), then 2 mg/kg/h × 8 h' },
		{ label: 'Blood products (MTP 1:1:1)', dose: 'pRBC : FFP : Plt = 1:1:1 ratio; consider cryoprecipitate if fibrinogen < 1.5 g/L' },
	];

	function openTree(file: string) { window.open(`/decision-trees/${file}`, '_blank'); }
</script>

<svelte:head><title>Trauma — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Pediatric Trauma</h1>
		<p class="subtitle">ATLS primary survey · TBI · Burns · Hemorrhage · Orthopedic emergencies</p>
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
		<h2 class="section-title">Primary Survey (ABCDE)</h2>
		<div class="survey-list">
			{#each primarySurvey as s}
				<div class="survey-row">
					<span class="survey-step">{s.step}</span>
					<span class="survey-content">{s.content}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Fluid & Blood Product Dosing</h2>
		<div class="dose-grid">
			{#each fluidResus as d}
				<div class="dose-card">
					<div class="dose-name">{d.label}</div>
					<div class="dose-val">{d.dose}</div>
				</div>
			{/each}
		</div>
	</section>

	<div class="two-col">
		<section>
			<h2 class="section-title">Glasgow Coma Scale</h2>
			<div class="gcs-grid">
				{#each gcs as cat}
					<div class="gcs-cat">
						<div class="gcs-cat-name">{cat.cat}</div>
						{#each cat.items as item}
							<div class="gcs-item">{item}</div>
						{/each}
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="section-title">TBSA by Age (Rule of Nines)</h2>
			<div class="table-wrap">
				<table class="clin-table">
					<thead>
						<tr><th>Age</th><th>Head</th><th>Each Arm</th><th>Each Leg</th><th>Trunk F/B</th></tr>
					</thead>
					<tbody>
						{#each burnEstimate as r}
							<tr>
								<td class="bold-cell">{r.age}</td>
								<td>{r.head}</td>
								<td>{r.each_arm}</td>
								<td>{r.each_leg}</td>
								<td>{r.trunk_ant}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="table-note">Palm method: patient's palm ≈ 1% TBSA (useful for irregular burns)</p>
		</section>
	</div>
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
	.survey-list { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.survey-row { display: grid; grid-template-columns: 200px 1fr; gap: 1rem; padding: 0.7rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.survey-row:last-child { border-bottom: none; }
	.survey-row:nth-child(odd) { background: var(--color-surface); }
	.survey-step { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.survey-content { font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.5; }
	.dose-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5rem; }
	.dose-card { padding: 0.75rem 1rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.dose-name { font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.3rem; }
	.dose-val { font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.5; }
	.two-col { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
	.gcs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
	.gcs-cat { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; }
	.gcs-cat-name { font-size: 0.78rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.4rem; }
	.gcs-item { font-family: var(--font-mono); font-size: 0.74rem; color: var(--color-text-muted); line-height: 1.6; }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.75rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-muted); }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); }
	.table-note { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
</style>
