<script lang="ts">
	import { clinicalMode } from '$lib/stores/mode';

	interface TreeEntry {
		name: string;
		file: string;
		icon: string;
		mode: 'neonatal' | 'pediatric' | 'both';
		category: string;
	}

	const allTrees: TreeEntry[] = [
		// === NEONATAL ===
		{ name: 'NRP Resuscitation', file: 'nrp_resuscitation_decision_tree.html', icon: '⚡', mode: 'neonatal', category: 'Resuscitation' },
		{ name: 'Cardiac / PDA', file: 'neonatal_cardiac_pda_decision_tree.html', icon: '❤️', mode: 'neonatal', category: 'Cardiac' },
		{ name: 'Pulmonary', file: 'neonatal_pulmonary_decision_tree.html', icon: '🫁', mode: 'neonatal', category: 'Respiratory' },
		{ name: 'Infectious Diseases', file: 'neonatal_infectious_diseases_decision_tree.html', icon: '🦠', mode: 'neonatal', category: 'Infectious Disease' },
		{ name: 'Fluids, Electrolytes & Nutrition', file: 'neonatal_fen_decision_tree.html', icon: '💧', mode: 'neonatal', category: 'FEN' },
		{ name: 'Neurology', file: 'neonatal_neurology_decision_tree.html', icon: '🧠', mode: 'neonatal', category: 'Neuro' },
		{ name: 'Hematology', file: 'neonatal_hematology_decision_tree.html', icon: '🩸', mode: 'neonatal', category: 'Hematology' },
		{ name: 'Endocrine', file: 'neonatal_endocrine_decision_tree.html', icon: '⚗️', mode: 'neonatal', category: 'Endocrine' },
		{ name: 'GI / Liver', file: 'neonatal_gi_liver_decision_tree.html', icon: '🔬', mode: 'neonatal', category: 'GI' },
		{ name: 'Renal', file: 'neonatal_renal_decision_tree.html', icon: '🫘', mode: 'neonatal', category: 'Renal' },
		{ name: 'Surgical Emergencies', file: 'neonatal_surgical_emergencies_decision_tree.html', icon: '🔪', mode: 'neonatal', category: 'Surgical' },
		{ name: 'Ophthalmology (ROP)', file: 'neonatal_ophthalmology_decision_tree.html', icon: '👁️', mode: 'neonatal', category: 'Ophthalmology' },
		{ name: 'Skin / Dermatology', file: 'neonatal_skin_decision_tree.html', icon: '🩹', mode: 'neonatal', category: 'Skin' },
		{ name: 'Urological', file: 'neonatal_urological_decision_tree.html', icon: '🏥', mode: 'neonatal', category: 'Urology' },
		{ name: 'Pain & Sedation', file: 'neonatal_pain_sedation_decision_tree.html', icon: '💉', mode: 'neonatal', category: 'Pain' },
		{ name: 'Transport', file: 'neonatal_transport_decision_tree.html', icon: '🚑', mode: 'neonatal', category: 'Transport' },
		{ name: 'NOWS / NAS', file: 'neonatal_nows_nas_decision_tree.html', icon: '💊', mode: 'neonatal', category: 'Substance Exposure' },
		{ name: 'Newborn Discharge Readiness', file: 'newborn_discharge_readiness_decision_tree.html', icon: '🏠', mode: 'neonatal', category: 'Discharge' },
		{ name: 'Newborn Screening Follow-up', file: 'newborn_screening_followup_decision_tree.html', icon: '🔍', mode: 'neonatal', category: 'Screening' },
		{ name: 'Obstetric Emergencies', file: 'obstetric_emergencies_decision_tree.html', icon: '🤰', mode: 'neonatal', category: 'Obstetric' },
		{ name: 'Shoulder Dystocia', file: 'shoulder_dystocia_decision_tree.html', icon: '👶', mode: 'neonatal', category: 'Obstetric' },

		// === PEDIATRIC ===
		{ name: 'PALS Algorithm', file: 'pals_algorithm_decision_tree.html', icon: '⚡', mode: 'pediatric', category: 'Resuscitation' },
		{ name: 'Sepsis & Shock', file: 'pediatric_sepsis_shock_decision_tree.html', icon: '🩸', mode: 'pediatric', category: 'Sepsis' },
		{ name: 'Respiratory Emergencies', file: 'pediatric_respiratory_emergencies_decision_tree.html', icon: '🫁', mode: 'pediatric', category: 'Respiratory' },
		{ name: 'Cardiac Emergencies', file: 'pediatric_cardiac_emergencies_decision_tree.html', icon: '❤️', mode: 'pediatric', category: 'Cardiac' },
		{ name: 'Trauma', file: 'pediatric_trauma_decision_tree.html', icon: '🚑', mode: 'pediatric', category: 'Trauma' },
		{ name: 'Seizures / Status Epilepticus', file: 'pediatric_seizures_decision_tree.html', icon: '🧠', mode: 'pediatric', category: 'Neuro' },
		{ name: 'DKA', file: 'pediatric_dka_decision_tree.html', icon: '📊', mode: 'pediatric', category: 'Endocrine' },
		{ name: 'Anaphylaxis', file: 'pediatric_anaphylaxis_decision_tree.html', icon: '🚨', mode: 'pediatric', category: 'Allergy' },
		{ name: 'Burns', file: 'pediatric_burns_decision_tree.html', icon: '🔥', mode: 'pediatric', category: 'Burns' },
		{ name: 'Toxicology', file: 'pediatric_toxicology_decision_tree.html', icon: '☠️', mode: 'pediatric', category: 'Toxicology' },
		{ name: 'Abdominal Pain', file: 'pediatric_abdominal_pain_decision_tree.html', icon: '🤢', mode: 'pediatric', category: 'GI' },
		{ name: 'Orthopedic Emergencies', file: 'pediatric_orthopedic_decision_tree.html', icon: '🦴', mode: 'pediatric', category: 'Orthopedic' },
		{ name: 'Psychiatric Emergencies', file: 'pediatric_psychiatric_emergencies_decision_tree.html', icon: '🧩', mode: 'pediatric', category: 'Psychiatric' },
		{ name: 'SIADH vs CSW', file: 'pediatric_siadh_csw_decision_tree.html', icon: '🧪', mode: 'pediatric', category: 'Fluids/Electrolytes' },
	];

	$: mode = $clinicalMode;
	$: filteredTrees = mode
		? allTrees.filter(t => t.mode === mode || t.mode === 'both')
		: allTrees;

	$: neonatalTrees = allTrees.filter(t => t.mode === 'neonatal');
	$: pediatricTrees = allTrees.filter(t => t.mode === 'pediatric');

	function openTree(file: string) {
		window.open(`/decision-trees/${file}`, '_blank');
	}
</script>

<svelte:head>
	<title>Decision Trees — PED CDS</title>
</svelte:head>

<div class="page">
	<h1 class="page-title">Clinical Decision Trees</h1>
	<p class="page-desc">
		{filteredTrees.length} interactive decision trees with tabbed reference panels, clinical evidence, and medication dosing.
		Each tree opens as a standalone full-screen D3 visualization.
	</p>

	{#if !mode || mode === 'neonatal'}
		<section class="tree-section">
			<h2 class="section-title">
				<span class="section-icon">👶</span>
				Neonatal ({neonatalTrees.length} trees)
			</h2>
			<div class="tree-grid">
				{#each neonatalTrees as tree}
					<button class="tree-card" on:click={() => openTree(tree.file)}>
						<span class="tree-card__icon">{tree.icon}</span>
						<div class="tree-card__content">
							<span class="tree-card__name">{tree.name}</span>
							<span class="tree-card__cat">{tree.category}</span>
						</div>
						<span class="tree-card__arrow">↗</span>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	{#if !mode || mode === 'pediatric'}
		<section class="tree-section">
			<h2 class="section-title">
				<span class="section-icon">🧒</span>
				Pediatric ({pediatricTrees.length} trees)
			</h2>
			<div class="tree-grid">
				{#each pediatricTrees as tree}
					<button class="tree-card" on:click={() => openTree(tree.file)}>
						<span class="tree-card__icon">{tree.icon}</span>
						<div class="tree-card__content">
							<span class="tree-card__name">{tree.name}</span>
							<span class="tree-card__cat">{tree.category}</span>
						</div>
						<span class="tree-card__arrow">↗</span>
					</button>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.page-title {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		color: var(--color-text);
	}

	.page-desc {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		max-width: 640px;
		line-height: 1.5;
	}

	.tree-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-body);
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.section-icon {
		font-size: 1.25rem;
	}

	.tree-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.5rem;
	}

	.tree-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-body);
		transition: border-color 0.15s, box-shadow 0.15s;
		width: 100%;
	}

	.tree-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.tree-card__icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.tree-card__content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.tree-card__name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.tree-card__cat {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	.tree-card__arrow {
		font-size: 1rem;
		color: var(--color-text-muted);
		transition: color 0.15s, transform 0.15s;
	}

	.tree-card:hover .tree-card__arrow {
		color: var(--color-primary);
		transform: translate(2px, -2px);
	}

	@media (max-width: 640px) {
		.tree-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
