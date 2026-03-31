<script lang="ts">
	const primarySurvey = [
		{ step: 'A — Airway + C-spine', actions: ['Jaw thrust (not head-tilt) in trauma', 'C-spine immobilization until cleared', 'Suction and clear foreign body', 'If unable to protect: RSI with in-line stabilization'] },
		{ step: 'B — Breathing', actions: ['Inspect, palpate, auscultate', 'Tension PTX: hyperresonance, absent breath sounds, tracheal deviation, JVD → needle decompression', 'Open PTX: 3-sided occlusive dressing', 'Flail chest with respiratory failure → intubation and PPV', 'SpO₂, ETCO₂ if intubated'] },
		{ step: 'C — Circulation', actions: ['Hemorrhage control: direct pressure, tourniquet (extremity)', 'IV/IO access × 2 (large-bore)', 'Bolus 10–20 mL/kg isotonic crystalloid; reassess after each bolus', 'If unresponsive to 2 boluses → MTP activation, blood products', 'FAST exam: free fluid in abdomen/pelvis/pericardium'] },
		{ step: 'D — Disability (Neuro)', actions: ['GCS (E + V + M)', 'Pupil size and reactivity', 'Focal deficits', 'Glucose (treat hypoglycemia)', 'If GCS ≤ 8: intubate (prevent aspiration + herniation)'] },
		{ step: 'E — Exposure', actions: ['Remove all clothing for full assessment', 'Log-roll for spinal exam (maintain axial immobilization)', 'Rectal tone if spinal injury suspected', 'Prevent hypothermia: warm blankets, warmed IVF', 'FAST or eFAST exam'] },
	];

	const secondarySurvey = [
		{ region: 'Head', findings: 'Battle sign, raccoon eyes (delayed), scalp lacerations (significant blood loss), facial instability, CSF rhinorrhea/otorrhea, pupil changes' },
		{ region: 'Neck', findings: 'Cervical spine tenderness, tracheal deviation, JVD, subcutaneous emphysema, penetrating injury, carotid bruit' },
		{ region: 'Chest', findings: 'Crepitus, rib tenderness, flail segment, breath sound asymmetry, pericardial rub, cardiac contusion (dysrhythmia, elevated troponin)' },
		{ region: 'Abdomen', findings: 'Seat belt sign (lap belt injury → bowel perforation, chance fracture), peritoneal signs, flank ecchymosis (retroperitoneal), distension' },
		{ region: 'Pelvis', findings: 'Stability on lateral compression (do NOT rock repeatedly — dislodges clot); pelvic ring instability → binder, IR consult, angioembolization' },
		{ region: 'Extremities', findings: 'Long bone fractures, vascular injury (6 Ps), compartment syndrome, open fractures (antibiotics within 3 h, OR within 6 h)' },
		{ region: 'Perineum / Rectum', findings: 'Urethral injury (blood at meatus, perineal hematoma, high-riding prostate → retrograde urethrogram before Foley). Rectal tone for spinal cord assessment.' },
		{ region: 'Back', findings: 'Log-roll essential; spinal tenderness, paraspinal hematoma, flank bruising (renal injury)' },
	];

	const pediatricPearls = [
		{ pearl: 'Airway anatomy', detail: 'Larger occiput causes neck flexion — pad shoulders to achieve neutral position. Floppy epiglottis. Subglottic narrowing is narrowest airway point (not vocal cords).' },
		{ pearl: 'Respiratory compensation', detail: 'Children increase rate before depth — tachypnea is an early warning sign. Respiratory failure can be sudden.' },
		{ pearl: 'Shock without hypotension', detail: 'Children maintain BP until >30–40% blood loss. Tachycardia + poor perfusion = shock. Do NOT wait for hypotension.' },
		{ pearl: 'Solid organ injury', detail: 'Liver and spleen injuries usually managed non-operatively in hemodynamically stable children. Lower rib fractures more commonly → solid organ injury than in adults (ribs more elastic).' },
		{ pearl: 'Non-accidental trauma (NAT)', detail: 'Consider in: injury inconsistent with history, delayed presentation, multiple injuries at different stages of healing, posterior rib fractures, subdural without impact.' },
		{ pearl: 'Spinal cord injury without radiographic abnormality (SCIWORA)', detail: 'Normal X-ray/CT does not exclude spinal cord injury in children. MRI required if neuro deficit. Maintain immobilization.' },
	];

	const vitals = [
		{ age: 'Newborn', hr: '100–160', sbp: '60–80', rr: '30–60' },
		{ age: '1–12 months', hr: '100–150', sbp: '70–90', rr: '25–50' },
		{ age: '1–3 years', hr: '90–140', sbp: '80–105', rr: '20–30' },
		{ age: '3–6 years', hr: '80–120', sbp: '85–110', rr: '18–25' },
		{ age: '6–12 years', hr: '70–110', sbp: '90–120', rr: '15–22' },
		{ age: '12–18 years', hr: '60–100', sbp: '100–130', rr: '12–18' },
	];
</script>

<svelte:head><title>Trauma Assessment — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Pediatric Trauma Assessment</h1>
		<p class="subtitle">ATLS primary survey · Secondary survey · Pediatric-specific pearls · Vital sign reference</p>
	</div>

	<section>
		<h2 class="section-title">Primary Survey (ABCDE)</h2>
		<div class="survey-list">
			{#each primarySurvey as s}
				<div class="survey-section">
					<div class="survey-step">{s.step}</div>
					<ul class="survey-actions">
						{#each s.actions as a}
							<li>{a}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Secondary Survey — Head-to-Toe</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Region</th><th>Key Findings to Assess</th></tr></thead>
				<tbody>
					{#each secondarySurvey as r}
						<tr><td class="bold-cell">{r.region}</td><td class="note-cell">{r.findings}</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2 class="section-title">Pediatric Trauma Pearls</h2>
		<div class="pearl-list">
			{#each pediatricPearls as p}
				<div class="pearl-card">
					<div class="pearl-title">{p.pearl}</div>
					<div class="pearl-detail">{p.detail}</div>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Normal Vital Signs by Age</h2>
		<div class="table-wrap">
			<table class="clin-table">
				<thead><tr><th>Age</th><th>HR (bpm)</th><th>SBP (mmHg)</th><th>RR (/min)</th></tr></thead>
				<tbody>
					{#each vitals as v}
						<tr>
							<td class="bold-cell">{v.age}</td>
							<td class="mono-cell">{v.hr}</td>
							<td class="mono-cell">{v.sbp}</td>
							<td class="mono-cell">{v.rr}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="table-note">Hypotension = SBP &lt; 70 + (2 × age in years) for children 1–10 yr. Tachycardia is an earlier, more sensitive shock indicator than hypotension.</p>
	</section>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.75rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.survey-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.survey-section { display: grid; grid-template-columns: 220px 1fr; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.survey-step { font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: var(--color-primary); padding-top: 0.1rem; }
	.survey-actions { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; }
	.survey-actions li { font-size: 0.79rem; color: var(--color-text-muted); line-height: 1.45; padding-left: 0.85rem; position: relative; }
	.survey-actions li::before { content: '·'; position: absolute; left: 0; color: var(--color-primary); }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
	.clin-table th { padding: 0.5rem 0.8rem; text-align: left; font-size: 0.72rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--color-border-subtle); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); white-space: nowrap; }
	.mono-cell { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); }
	.note-cell { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
	.table-note { font-size: 0.74rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
	.pearl-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.5rem; }
	.pearl-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.8rem 1rem; }
	.pearl-title { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.3rem; }
	.pearl-detail { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; }
</style>
