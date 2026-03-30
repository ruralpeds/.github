<script lang="ts">
	const modules = [
		{
			tag: 'ventilator',
			icon: '🫁',
			label: 'Ventilator Management',
			color: 'var(--blue)',
			bg: 'var(--bbg)',
			border: 'rgba(96,165,250,.3)',
			desc: 'ARDSnet lung-protective ventilation, auto-PEEP, dyssynchrony, liberation, and neonatal OI/OSI.',
			scenarios: [
				{ id: 'vent_01', title: 'Moderate ARDS — Post-Intubation',            diff: 'Intermediate' },
				{ id: 'vent_02', title: 'Severe ARDS — Prone Positioning',             diff: 'Advanced'     },
				{ id: 'vent_03', title: 'Ventilator Dyssynchrony',                     diff: 'Intermediate' },
				{ id: 'vent_04', title: 'Ventilator Liberation — SBT',                 diff: 'Intermediate' },
				{ id: 'vent_05', title: 'COPD — Auto-PEEP and Permissive Hypercapnia', diff: 'Advanced'     },
				{ id: 'vent_06', title: 'Pediatric RSV — OI/OSI/ECMO Threshold',       diff: 'Advanced'     },
			]
		},
		{
			tag: 'electrolytes',
			icon: '⚗️',
			label: 'Electrolyte Emergencies',
			color: 'var(--purple)',
			bg: 'var(--pbg)',
			border: 'rgba(192,132,252,.3)',
			desc: 'Sodium disorders, hyperkalemia EKG changes, Mg-K co-depletion, post-thyroidectomy hypocalcemia, and neonatal TPN electrolytes.',
			scenarios: [
				{ id: 'elyte_01', title: 'Hyponatremia — Active Seizure',            diff: 'Advanced'     },
				{ id: 'elyte_02', title: 'Chronic Hyponatremia — SIADH',             diff: 'Intermediate' },
				{ id: 'elyte_03', title: 'Hypernatremia — Free Water Deficit',       diff: 'Intermediate' },
				{ id: 'elyte_04', title: 'Hyperkalemia — EKG Changes',               diff: 'Advanced'     },
				{ id: 'elyte_05', title: 'Neonatal Hypokalemia — TPN',               diff: 'Intermediate' },
				{ id: 'elyte_06', title: 'Hypomagnesemia — Refractory Hypokalemia',  diff: 'Intermediate' },
				{ id: 'elyte_07', title: 'Hypocalcemia — Post-Thyroidectomy',        diff: 'Advanced'     },
				{ id: 'elyte_08', title: 'Mixed AGMA + Non-AG Acidosis',             diff: 'Advanced'     },
			]
		},
		{
			tag: 'acidbase',
			icon: '🧪',
			label: 'Acid-Base Interpretation',
			color: 'var(--yellow)',
			bg: 'var(--ybg)',
			border: 'rgba(251,191,36,.3)',
			desc: '6-step ABG interpretation — DKA, RTA, mixed disorders, respiratory alkalosis DDx, and lactic acidosis resuscitation targets.',
			scenarios: [
				{ id: 'acid_01', title: 'DKA — Complete 6-Step ABG',          diff: 'Intermediate' },
				{ id: 'acid_02', title: 'Non-AG Acidosis — RTA vs. Diarrhea', diff: 'Intermediate' },
				{ id: 'acid_03', title: 'Mixed Disorder — COPD + Diuretics',  diff: 'Advanced'     },
				{ id: 'acid_04', title: 'Respiratory Alkalosis — DDx',        diff: 'Introductory' },
				{ id: 'acid_05', title: 'Lactic Acidosis — Septic Shock',     diff: 'Advanced'     },
			]
		},
		{
			tag: 'fluids',
			icon: '💧',
			label: 'Fluid Resuscitation & Emergency Dosing',
			color: 'var(--green)',
			bg: 'var(--gbg)',
			border: 'rgba(74,222,128,.3)',
			desc: 'Pediatric septic shock PALS bundle, vasopressor selection, catecholamine-resistant shock, RSI drug dosing, and drip rate calculations.',
			scenarios: [
				{ id: 'peds_sepsis_01', title: 'Pediatric Septic Shock — First-Hour Bundle',          diff: 'Intermediate' },
				{ id: 'peds_sepsis_02', title: 'Fluid-Refractory Shock — Vasopressor Initiation',     diff: 'Advanced'     },
				{ id: 'peds_sepsis_03', title: 'Catecholamine-Resistant Shock — ECMO Threshold',      diff: 'Advanced'     },
				{ id: 'ed_dosing_01',   title: 'Pediatric RSI — Induction and Paralytic Selection',   diff: 'Intermediate' },
				{ id: 'ed_dosing_02',   title: 'Vasopressor Drip Setup — Norepinephrine Calculation', diff: 'Intermediate' },
			]
		},
		{
			tag: 'neonatal',
			icon: '👶',
			label: 'Neonatal Stabilization',
			color: 'var(--orange)',
			bg: 'var(--obg)',
			border: 'rgba(251,146,60,.3)',
			desc: 'Neonatal respiratory support (CPAP, surfactant, OI monitoring) and hyperbilirubinemia management with AAP 2022 thresholds.',
			scenarios: [
				{ id: 'neo_resp_01', title: '33-Week RDS — CPAP Setup and Surfactant Decision',          diff: 'Intermediate' },
				{ id: 'neo_resp_02', title: '28-Week CPAP Failure — OI Monitoring and ECMO Approach',    diff: 'Advanced'     },
				{ id: 'bili_01',     title: '38-Week Newborn — Rising Bilirubin and Phototherapy',       diff: 'Intermediate' },
				{ id: 'bili_02',     title: '35-Week Late Preterm — Exchange Transfusion Decision',      diff: 'Advanced'     },
			]
		},
	];

	const diffColors: Record<string, { color: string; bg: string }> = {
		Introductory: { color: 'var(--green)',  bg: 'var(--gbg)' },
		Intermediate: { color: 'var(--yellow)', bg: 'var(--ybg)' },
		Advanced:     { color: 'var(--red)',    bg: 'var(--rbg)' },
	};
</script>

<svelte:head><title>Simulations — PED CDS</title></svelte:head>

<div class="page">
	<div class="hero">
		<h1>Clinical Simulations</h1>
		<p class="subtitle">
			Interactive patient scenarios for rural ED and Level II nursery providers.
			Each simulation runs fully offline — no server required.
		</p>
	</div>

	<div class="stats-row">
		<div class="stat"><span class="stat-val">28</span><span class="stat-label">Scenarios</span></div>
		<div class="stat"><span class="stat-val">5</span><span class="stat-label">Modules</span></div>
		<div class="stat"><span class="stat-val">52</span><span class="stat-label">Decision Points</span></div>
		<div class="stat"><span class="stat-val">100%</span><span class="stat-label">Offline</span></div>
	</div>

	{#each modules as mod (mod.tag)}
		<section class="module-section" id={mod.tag}>
			<div class="module-header" style="color:{mod.color}">
				<span class="module-icon">{mod.icon}</span>
				<div>
					<h2>{mod.label}</h2>
					<p class="module-desc">{mod.desc}</p>
				</div>
			</div>

			<div class="scenario-grid">
				{#each mod.scenarios as s (s.id)}
					{@const dc = diffColors[s.diff] ?? diffColors.Intermediate}
					<a
						href="/static/simulations/{s.id}_simulation.html"
						target="_blank"
						rel="noopener"
						class="scenario-card"
						style="--card-border:{mod.border};--card-hover:{mod.color}"
					>
						<div class="card-diff">
							<span class="badge" style="background:{dc.bg};color:{dc.color};border:1px solid {dc.color}40">
								{s.diff}
							</span>
						</div>
						<div class="card-title">{s.title}</div>
						<div class="card-cta">Launch simulation →</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}

	<div class="disclaimer">
		<strong>⚠ Educational use only.</strong>
		These simulations are for training and self-assessment.
		They are not clinical decision support tools and must not replace clinical judgment or specialist consultation.
		All formulas reference published guidelines — citations available within each simulation.
	</div>
</div>

<style>
	.page { padding: 24px 28px; max-width: 1080px; overflow-y: auto; }
	.hero { margin-bottom: 24px; }
	h1 { font-family: var(--font-serif, 'DM Serif Display', serif); font-size: 32px; color: var(--text); margin-bottom: 6px; }
	.subtitle { font-size: 14px; color: var(--text2); line-height: 1.6; max-width: 680px; }
	.stats-row { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
	.stat { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 24px; text-align: center; min-width: 100px; }
	.stat-val { display: block; font-family: var(--font-mono, 'IBM Plex Mono', monospace); font-size: 28px; font-weight: 500; color: var(--accent); }
	.stat-label { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; }
	.module-section { margin-bottom: 36px; }
	.module-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
	.module-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
	h2 { font-family: var(--font-serif, 'DM Serif Display', serif); font-size: 22px; margin-bottom: 4px; }
	.module-desc { font-size: 13px; color: var(--text2); line-height: 1.5; }
	.scenario-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
	.scenario-card { display: block; text-decoration: none; background: var(--surface); border: 1px solid var(--card-border, var(--border)); border-radius: 10px; padding: 16px; transition: all 0.2s ease; }
	.scenario-card:hover { border-color: var(--card-hover, var(--accent)); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,.3); }
	.card-diff { margin-bottom: 8px; }
	.badge { display: inline-block; padding: 2px 9px; border-radius: 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; }
	.card-title { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.4; margin-bottom: 10px; }
	.card-cta { font-size: 11px; color: var(--text3); font-family: var(--font-mono, 'IBM Plex Mono', monospace); }
	.scenario-card:hover .card-cta { color: var(--accent); }
	.disclaimer { margin-top: 32px; padding: 14px 18px; background: var(--ybg, #2a2006); border: 1px solid rgba(251,191,36,.3); border-radius: 10px; font-size: 12px; color: var(--text2); line-height: 1.6; }
	.disclaimer strong { color: var(--yellow, #fbbf24); }
</style>
