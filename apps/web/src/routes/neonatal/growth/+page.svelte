<script lang="ts">
	// Fenton 2013 preterm growth chart reference ranges (approximate medians)
	// Weight (grams) 50th percentile by GA
	const fentonWeight = [
		{ ga: 22, p3: 390, p10: 440, p50: 530, p90: 650, p97: 730 },
		{ ga: 24, p3: 480, p10: 550, p50: 680, p90: 830, p97: 940 },
		{ ga: 26, p3: 620, p10: 710, p50: 900, p90: 1110, p97: 1260 },
		{ ga: 28, p3: 810, p10: 940, p50: 1175, p90: 1450, p97: 1650 },
		{ ga: 30, p3: 1100, p10: 1250, p50: 1550, p90: 1900, p97: 2150 },
		{ ga: 32, p3: 1400, p10: 1600, p50: 1990, p90: 2430, p97: 2750 },
		{ ga: 34, p3: 1800, p10: 2050, p50: 2500, p90: 3030, p97: 3400 },
		{ ga: 36, p3: 2200, p10: 2500, p50: 3000, p90: 3600, p97: 4000 },
		{ ga: 38, p3: 2600, p10: 2900, p50: 3400, p90: 4100, p97: 4550 },
		{ ga: 40, p3: 2800, p10: 3150, p50: 3700, p90: 4400, p97: 4900 },
	];

	const growthTargets = [
		{ category: 'Weight gain (stable preterm)', target: '15–20 g/kg/day (ELBW); 20–30 g/day (LBW/moderate preterm)' },
		{ category: 'Head circumference', target: '~0.5–1.0 cm/week once past initial phase' },
		{ category: 'Length', target: '~0.8–1.0 cm/week' },
		{ category: 'Term-equivalent target', target: 'Weight at 50th percentile for corrected age' },
		{ category: 'SGA definition', target: 'Birth weight < 10th percentile for GA (Fenton 2013)' },
		{ category: 'LGA definition', target: 'Birth weight > 90th percentile for GA' },
		{ category: 'IUGR concern', target: '< 3rd percentile OR crossing down ≥ 2 major percentile lines' },
	];

	const correctedAge = [
		{ scenario: 'Formula', value: 'Corrected age = chronological age (weeks) − weeks premature' },
		{ scenario: '28-week infant at 4 months (16 wk) CA', value: '16 − 12 = 4 weeks corrected; use 1-month milestones' },
		{ scenario: 'Use corrected age for', value: 'Growth plotting, developmental milestones, immunization catch-up schedule (up to 2–3 years CA)' },
		{ scenario: 'Correction stop', value: 'Weight: 24–36 months CA; Head: 18–24 months; Length: 40 months' },
	];

	const nutritionTargets = [
		{ param: 'Caloric intake (preterm)', value: '110–130 kcal/kg/day (enteral); 105–115 kcal/kg/day (PN)' },
		{ param: 'Protein (preterm)', value: '3.5–4.5 g/kg/day; reduce to 3.0 g/kg/day near term' },
		{ param: 'Enteral lipid', value: '5–7 g/kg/day; start at 0.5–1 g/kg/day PN lipids and advance' },
		{ param: 'Iron supplementation', value: '2 mg/kg/day elemental Fe when on full enteral feeds; continue until 12 months CA' },
		{ param: 'Vitamin D', value: '400 IU/day when on > 50% enteral feeds or discharge' },
		{ param: 'Fortification', value: 'Human milk fortifier (HMF) added to breast milk at > 100 mL/kg/day feeds for < 34 wk or < 1800 g' },
	];

	const whoMilestones = [
		{ milestone: 'Gross motor', ages: '2 mo: head control prone; 4 mo: rolls; 6 mo: sits with support; 9 mo: pulls to stand; 12 mo: walks with support; 15 mo: walks independently' },
		{ milestone: 'Fine motor', ages: '3 mo: hands unfisted; 6 mo: transfers objects; 9 mo: pincer grasp emerging; 12 mo: neat pincer; 18 mo: stacks 3 blocks' },
		{ milestone: 'Language', ages: '2 mo: social smile; 4 mo: coos; 6 mo: babbles; 9 mo: mama/dada non-specific; 12 mo: 1–2 words; 18 mo: 10 words; 24 mo: 50+ words, 2-word phrases' },
		{ milestone: 'Social', ages: '2 mo: recognizes caregiver; 6 mo: stranger anxiety begins; 9–12 mo: joint attention; 12 mo: waves bye-bye; 18 mo: symbolic play' },
	];
</script>

<svelte:head><title>Neonatal Growth — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Neonatal Growth &amp; Nutrition</h1>
		<p class="subtitle">Fenton 2013 chart · WHO curves · Corrected age · Nutrition targets · Developmental milestones</p>
	</div>

	<section>
		<h2 class="section-title">Fenton 2013 Weight Percentiles by GA (grams)</h2>
		<p class="source-note">Source: Fenton TR, Kim JH. BMC Pediatrics 2013. For preterm infants. Transition to WHO charts at 40 weeks PMA.</p>
		<div class="table-wrap">
			<table class="clin-table">
				<thead>
					<tr><th>GA (wk)</th><th>3rd</th><th>10th</th><th>50th</th><th>90th</th><th>97th</th></tr>
				</thead>
				<tbody>
					{#each fentonWeight as r}
						<tr>
							<td class="bold-cell">{r.ga}</td>
							<td class="mono-cell">{r.p3.toLocaleString()}</td>
							<td class="mono-cell">{r.p10.toLocaleString()}</td>
							<td class="mono-cell highlight">{r.p50.toLocaleString()}</td>
							<td class="mono-cell">{r.p90.toLocaleString()}</td>
							<td class="mono-cell">{r.p97.toLocaleString()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="table-note">These are approximate median values. Use formal Fenton 2013 or Intergrowth-21st charts for plotting. Values in grams.</p>
	</section>

	<div class="two-col">
		<section>
			<h2 class="section-title">Growth Targets</h2>
			<div class="param-table">
				{#each growthTargets as g}
					<div class="param-row">
						<span class="param-label">{g.category}</span>
						<span class="param-val">{g.target}</span>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="section-title">Corrected Age Calculation</h2>
			<div class="param-table">
				{#each correctedAge as c}
					<div class="param-row">
						<span class="param-label">{c.scenario}</span>
						<span class="param-val">{c.value}</span>
					</div>
				{/each}
			</div>
		</section>
	</div>

	<section>
		<h2 class="section-title">Nutrition Targets (Preterm)</h2>
		<div class="param-table">
			{#each nutritionTargets as n}
				<div class="param-row">
					<span class="param-label">{n.param}</span>
					<span class="param-val">{n.value}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="section-title">Developmental Milestones (Corrected Age)</h2>
		<p class="source-note">Apply corrected age when monitoring milestones in preterm infants up to 3 years.</p>
		<div class="milestone-grid">
			{#each whoMilestones as m}
				<div class="milestone-card">
					<div class="milestone-domain">{m.milestone}</div>
					<div class="milestone-ages">{m.ages}</div>
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
	.source-note { font-size: 0.75rem; color: var(--color-text-muted); font-style: italic; margin-bottom: 0.6rem; line-height: 1.5; }
	.table-wrap { overflow-x: auto; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); }
	.clin-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
	.clin-table th { padding: 0.55rem 0.9rem; text-align: left; font-size: 0.73rem; font-weight: 600; color: var(--color-text-secondary); background: var(--color-surface); border-bottom: 1px solid var(--color-border-subtle); }
	.clin-table td { padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-muted); vertical-align: top; }
	.clin-table tr:last-child td { border-bottom: none; }
	.bold-cell { font-weight: 600; color: var(--color-text); }
	.mono-cell { font-family: var(--font-mono); font-size: 0.8rem; text-align: right; }
	.mono-cell.highlight { color: var(--color-primary); font-weight: 600; }
	.table-note { font-size: 0.74rem; color: var(--color-text-muted); margin-top: 0.5rem; font-style: italic; }
	.two-col { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
	.param-table { display: flex; flex-direction: column; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden; }
	.param-row { display: grid; grid-template-columns: 200px 1fr; gap: 0.75rem; padding: 0.55rem 0.9rem; border-bottom: 1px solid var(--color-border-subtle); }
	.param-row:last-child { border-bottom: none; }
	.param-row:nth-child(odd) { background: var(--color-surface); }
	.param-label { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
	.param-val { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.5; }
	.milestone-grid { display: flex; flex-direction: column; gap: 0.5rem; }
	.milestone-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 0.75rem 1rem; display: grid; grid-template-columns: 130px 1fr; gap: 0.75rem; align-items: start; }
	.milestone-domain { font-size: 0.82rem; font-weight: 600; color: var(--color-text); }
	.milestone-ages { font-size: 0.77rem; color: var(--color-text-muted); line-height: 1.55; }
</style>
