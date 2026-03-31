<script lang="ts">
	const antibiotics = [
		{
			indication: 'Community-acquired sepsis (unknown source)',
			firstLine: 'Ceftriaxone 50–100 mg/kg/day IV q12–24h (max 2 g/dose)',
			alternative: 'Ampicillin-sulbactam 200 mg/kg/day (amp component) ÷ q6h',
			notes: 'Add vancomycin if MRSA suspected. Add metronidazole if intra-abdominal source.',
		},
		{
			indication: 'Neonatal sepsis — early onset (< 72 h)',
			firstLine: 'Ampicillin 100–200 mg/kg/day ÷ q8–12h + Gentamicin 4–5 mg/kg/dose q24–36h',
			alternative: 'Ampicillin + Cefotaxime 50 mg/kg/dose q12h (neonates < 7d) — avoid cefotaxime if possible (promotes resistance)',
			notes: 'GBS, E. coli, Listeria coverage. Check cultures at 36–48 h.',
		},
		{
			indication: 'Neonatal sepsis — late onset (≥ 72 h)',
			firstLine: 'Vancomycin 15 mg/kg/dose IV q8–12h + Gentamicin 4–5 mg/kg/dose q24–36h',
			alternative: 'Vancomycin + Cefotaxime for suspected meningitis',
			notes: 'CoNS most common in NICU. Adjust by culture/sensitivities at 48 h. Check vancomycin trough (target AUC/MIC 400–600).',
		},
		{
			indication: 'Meningitis (bacterial)',
			firstLine: 'Ceftriaxone 100 mg/kg/day ÷ q12h (max 2 g/dose q12h)',
			alternative: 'Cefotaxime 300 mg/kg/day ÷ q6–8h; add vancomycin 60 mg/kg/day ÷ q6h if PRSP suspected',
			notes: 'Dexamethasone 0.15 mg/kg q6h × 4 days (if H. influenzae or S. pneumoniae suspected, > 6 weeks). Start 15–30 min before or with first abx dose.',
		},
		{
			indication: 'Hospital-acquired / VAP / CLABSI',
			firstLine: 'Vancomycin 15 mg/kg/dose IV q6–8h + Cefepime 50 mg/kg/dose q8h (Pseudomonas coverage)',
			alternative: 'Piperacillin-tazobactam 300 mg/kg/day (pip component) ÷ q6–8h',
			notes: 'Adjust to culture. If CRKP/ESBL risk: meropenem 20 mg/kg/dose q8h.',
		},
		{
			indication: 'Intra-abdominal (peritonitis, NEC)',
			firstLine: 'Piperacillin-tazobactam 300 mg/kg/day ÷ q6–8h, or ampicillin + gentamicin + metronidazole',
			alternative: 'Meropenem for NEC with perforation or ESBL risk',
			notes: 'NEC: add ampicillin; ensure anaerobic coverage. Duration 7–10 days; shorter if source controlled.',
		},
		{
			indication: 'Toxic shock syndrome (TSS — GAS or Staph)',
			firstLine: 'Clindamycin 25–40 mg/kg/day ÷ q8h + Penicillin G 100,000–250,000 units/kg/day ÷ q4–6h',
			alternative: 'IVIG 1–2 g/kg × 1 for GAS TSS (adjunct)',
			notes: 'Clindamycin inhibits toxin production (ribosomal). Aggressive fluid resuscitation critical.',
		},
	];

	const dosingPearls = [
		{ drug: 'Ceftriaxone', note: 'Avoid in neonates < 28 days — displaces bilirubin from albumin. OK in older infants. Max 2 g/dose; 4 g/day for meningitis.' },
		{ drug: 'Vancomycin', note: 'Target AUC/MIC 400–600 (pharmacy-guided). Trough-only monitoring no longer recommended. Nephrotoxic with aminoglycosides.' },
		{ drug: 'Gentamicin', note: 'Once-daily dosing preferred (4–5 mg/kg q24–36h neonates; 7.5 mg/kg/day children). Trough < 1 mcg/mL. Synergistic with ampicillin for GBS.' },
		{ drug: 'Meropenem', note: 'Reserve for ESBL/CRKP or CNS infection requiring broad coverage. 20 mg/kg/dose q8h standard; 40 mg/kg/dose q8h for meningitis/CNS.' },
		{ drug: 'Antifungals (fluconazole)', note: 'Add for NICU patients with risk factors (TPN, VLBW, prolonged antibiotics, candida colonization). 6 mg/kg/dose q24h (loading) then 3–6 mg/kg/day.' },
	];
</script>

<svelte:head><title>Sepsis Antibiotic Dosing — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Sepsis Antibiotic Dosing</h1>
		<p class="subtitle">Empiric regimens by clinical syndrome · Neonatal coverage · Dosing pearls</p>
	</div>

	<div class="alert-box">
		<strong>Goal:</strong> Antibiotics within 60 minutes of septic shock recognition. Obtain blood cultures first <em>only if</em> this does not delay administration by &gt;10–15 min.
	</div>

	{#each antibiotics as a}
		<section class="abx-section">
			<div class="abx-header">{a.indication}</div>
			<div class="abx-body">
				<div class="abx-row">
					<span class="abx-label">First-line</span>
					<span class="abx-drug">{a.firstLine}</span>
				</div>
				<div class="abx-row">
					<span class="abx-label">Alternative</span>
					<span class="abx-drug">{a.alternative}</span>
				</div>
				{#if a.notes}
					<div class="abx-row notes-row">
						<span class="abx-label">Notes</span>
						<span class="abx-note">{a.notes}</span>
					</div>
				{/if}
			</div>
		</section>
	{/each}

	<section>
		<h2 class="section-title">Dosing Pearls</h2>
		<div class="pearl-grid">
			{#each dosingPearls as p}
				<div class="pearl-card">
					<div class="pearl-drug">{p.drug}</div>
					<div class="pearl-note">{p.note}</div>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.5rem; }
	.hero h1 { font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-text); }
	.subtitle { font-size: 0.9rem; color: var(--color-text-muted); margin-top: 0.35rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem; }
	.alert-box { padding: 0.7rem 1rem; background: color-mix(in srgb, var(--color-warning, #f59e0b) 8%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-warning, #f59e0b) 30%, transparent); border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.5; }
	.alert-box strong { color: var(--color-text); }
	.abx-section { border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.abx-header { padding: 0.6rem 1rem; background: var(--color-surface); font-size: 0.88rem; font-weight: 600; color: var(--color-text); border-bottom: 1px solid var(--color-border-subtle); }
	.abx-body { display: flex; flex-direction: column; }
	.abx-row { display: grid; grid-template-columns: 100px 1fr; gap: 0.75rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--color-border-subtle); }
	.abx-row:last-child { border-bottom: none; }
	.abx-row:nth-child(even) { background: color-mix(in srgb, var(--color-surface) 50%, transparent); }
	.notes-row { background: color-mix(in srgb, var(--color-primary) 4%, transparent) !important; }
	.abx-label { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 600; color: var(--color-text-muted); padding-top: 0.1rem; }
	.abx-drug { font-family: var(--font-mono); font-size: 0.79rem; color: var(--color-text-muted); line-height: 1.5; }
	.abx-note { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.45; font-style: italic; }
	.pearl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5rem; }
	.pearl-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.75rem 1rem; }
	.pearl-drug { font-size: 0.85rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.3rem; }
	.pearl-note { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.45; }
</style>
