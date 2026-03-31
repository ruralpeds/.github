<script lang="ts">
	const lesions = [
		{
			category: 'Ductal-dependent systemic circulation (duct closes → shock)',
			lesions: [
				{ name: 'Hypoplastic left heart syndrome (HLHS)', features: 'Cyanosis + shock; systemic flow entirely duct-dependent; single functional ventricle' },
				{ name: 'Critical aortic stenosis', features: 'Shock when duct closes; poor LV function; narrow pulse pressure' },
				{ name: 'Coarctation of the aorta (critical)', features: 'Differential cyanosis; upper extremity hypertension, lower extremity weak/absent pulses; shock' },
				{ name: 'Interrupted aortic arch', features: 'Similar to coarctation but complete interruption; severe shock' },
			],
			management: 'PGE1 (alprostadil) to reopen/maintain ductus. Avoid 100% O₂ (worsens pulmonary overcirculation in HLHS). Target SpO₂ 75–85% in HLHS.',
		},
		{
			category: 'Ductal-dependent pulmonary circulation (duct closes → profound cyanosis)',
			lesions: [
				{ name: 'Pulmonary atresia (with/without VSD)', features: 'No pulmonary valve; severe cyanosis; duct is only source of pulmonary flow' },
				{ name: 'Critical pulmonary stenosis', features: 'Near-complete obstruction; neonatal cyanosis; small RV' },
				{ name: 'Tricuspid atresia (with PS)', features: 'Cyanosis; no flow through tricuspid valve; depends on ASD + ductus' },
				{ name: 'Tetralogy of Fallot (severe)', features: 'Cyanotic spells; pulmonary infundibular stenosis; duct-dependent in severe variants' },
			],
			management: 'PGE1 to maintain pulmonary blood flow. Supplement O₂ (target SpO₂ 80–90%). Avoid hyperventilation. Arrange urgent cardiology/surgery consult.',
		},
	];

	const presentation = [
		{ sign: 'Timing of presentation', detail: 'Typically day 2–5 of life as ductus arteriosus closes; occasionally up to 2–3 weeks' },
		{ sign: 'Cyanosis', detail: 'May be absent initially if mixing lesion; profound cyanosis with ductal-dependent pulmonary lesions' },
		{ sign: 'Shock signs', detail: 'Pallor, poor perfusion, weak/absent femoral pulses, acidosis — ductal-dependent systemic lesions' },
		{ sign: 'Differential cyanosis', detail: 'Pre-ductal SpO₂ (right hand) > post-ductal (feet) — coarctation; reverse in transposition with PPHN' },
		{ sign: 'Hyperoxia test', detail: 'Administer 100% O₂ × 10 min. PaO₂ < 150 mmHg despite FiO₂ 1.0 = cardiac cyanosis (not pulmonary). Do NOT delay PGE1 for this test if critically ill.' },
		{ sign: 'Murmur', detail: 'May be absent in critical CHD — absence of murmur does NOT exclude duct-dependent lesion' },
	];

	const pge1 = [
		{ param: 'Drug name', value: 'Alprostadil (Prostaglandin E1)' },
		{ param: 'Starting dose', value: '0.05–0.1 mcg/kg/min IV/IO infusion' },
		{ param: 'Effective dose range', value: '0.01–0.4 mcg/kg/min; titrate to SpO₂ and duct patency' },
		{ param: 'Onset of action', value: '15–30 min for ductal reopening' },
		{ param: 'Preparation', value: 'Alprostadil 500 mcg/mL ampule; dilute to 2–10 mcg/mL in D5W/NS. Check local pharmacy protocol.' },
		{ param: 'Side effects', value: 'Apnea (20% at high doses — most important!), fever, hypotension, flushing, seizures, diarrhea, cortical hyperostosis (chronic use)' },
		{ param: 'Apnea risk', value: 'Have bag-mask and intubation equipment at bedside. Many centers intubate electively before transport.' },
	];
</script>

<svelte:head><title>Ductal-Dependent CHD — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Ductal-Dependent Congenital Heart Disease</h1>
		<p class="subtitle">Recognition · PGE1 initiation · Lesion types · Stabilization before transfer</p>
	</div>

	<div class="alert-box">
		<strong>Suspected ductal-dependent CHD → Start PGE1 immediately.</strong> Do not delay for echocardiogram. Call pediatric cardiology and arrange emergency transfer to cardiac center.
	</div>

	<section>
		<h2 class="section-title">Clinical Presentation Clues</h2>
		<div class="pres-list">
			{#each presentation as p}
				<div class="pres-row">
					<span class="pres-label">{p.sign}</span>
					<span class="pres-detail">{p.detail}</span>
				</div>
			{/each}
		</div>
	</section>

	{#each lesions as group}
		<section>
			<h2 class="section-title">{group.category}</h2>
			<div class="lesion-grid">
				{#each group.lesions as l}
					<div class="lesion-card">
						<div class="lesion-name">{l.name}</div>
						<div class="lesion-feat">{l.features}</div>
					</div>
				{/each}
			</div>
			<div class="mgmt-banner">{group.management}</div>
		</section>
	{/each}

	<section>
		<h2 class="section-title">PGE1 (Alprostadil) Quick Reference</h2>
		<div class="pge-table">
			{#each pge1 as p}
				<div class="pge-row" class:warn-row={p.param === 'Apnea risk'}>
					<span class="pge-label">{p.param}</span>
					<span class="pge-val">{p.value}</span>
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
	.alert-box { padding: 0.8rem 1rem; background: color-mix(in srgb, var(--color-error, #f87171) 10%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-error, #f87171) 40%, transparent); border-radius: var(--radius-sm); font-size: 0.83rem; color: var(--color-text-muted); line-height: 1.5; }
	.alert-box strong { color: var(--color-text); }
	.pres-list { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.pres-row { display: grid; grid-template-columns: 200px 1fr; gap: 0.75rem; padding: 0.6rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.pres-row:last-child { border-bottom: none; }
	.pres-row:nth-child(odd) { background: var(--color-surface); }
	.pres-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.pres-detail { font-size: 0.79rem; color: var(--color-text-muted); line-height: 1.45; }
	.lesion-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.5rem; margin-bottom: 0.75rem; }
	.lesion-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.75rem 0.9rem; }
	.lesion-name { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.3rem; }
	.lesion-feat { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.4; }
	.mgmt-banner { padding: 0.65rem 1rem; background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent); border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.5; }
	.pge-table { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.pge-row { display: grid; grid-template-columns: 200px 1fr; gap: 0.75rem; padding: 0.6rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.pge-row:last-child { border-bottom: none; }
	.pge-row:nth-child(odd) { background: var(--color-surface); }
	.pge-row.warn-row { background: color-mix(in srgb, var(--color-error, #f87171) 8%, transparent) !important; }
	.pge-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.pge-val { font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.5; }
</style>
