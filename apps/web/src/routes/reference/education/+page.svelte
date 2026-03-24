<script lang="ts">
	let activeTab: 'cheat-sheets' | 'textbooks' | 'audio' = 'cheat-sheets';

	interface EducationItem {
		topic: string;
		icon: string;
		cheatSheet: string;
		textbook: string;
		audioTextbook: string;
	}

	const items: EducationItem[] = [
		{ topic: 'Pulmonary Disorders', icon: '🫁', cheatSheet: 'neonatal_pulmonary_disorders_cheat_sheet.docx', textbook: 'neonatal_pulmonary_disorders_textbook.docx', audioTextbook: 'neonatal_pulmonary_disorders_audio_textbook.docx' },
		{ topic: 'Infectious Diseases', icon: '🦠', cheatSheet: 'neonatal_infectious_diseases_cheat_sheet.docx', textbook: 'neonatal_infectious_diseases_textbook.docx', audioTextbook: 'neonatal_infectious_diseases_audio_textbook.docx' },
		{ topic: 'Hematology', icon: '🩸', cheatSheet: 'neonatal_hematology_cheat_sheet.docx', textbook: 'neonatal_hematology_textbook.docx', audioTextbook: 'neonatal_hematology_audio_textbook.docx' },
		{ topic: 'Neurology', icon: '🧠', cheatSheet: 'neonatal_neurology_cheat_sheet.docx', textbook: 'neonatal_neurology_textbook.docx', audioTextbook: 'neonatal_neurology_audio_textbook.docx' },
		{ topic: 'Fluids, Electrolytes & Nutrition', icon: '💧', cheatSheet: 'neonatal_fen_cheat_sheet.docx', textbook: 'neonatal_fen_textbook.docx', audioTextbook: 'neonatal_fen_audio_textbook.docx' },
		{ topic: 'GI & Liver', icon: '🔬', cheatSheet: 'neonatal_gi_liver_cheat_sheet.docx', textbook: 'neonatal_gi_liver_textbook.docx', audioTextbook: 'neonatal_gi_liver_audio_textbook.docx' },
		{ topic: 'Endocrine Abnormalities', icon: '⚗️', cheatSheet: 'neonatal_endocrine_abnormalities_cheat_sheet.docx', textbook: 'neonatal_endocrine_abnormalities_textbook.docx', audioTextbook: 'neonatal_endocrine_abnormalities_audio_textbook.docx' },
		{ topic: 'Renal', icon: '🫘', cheatSheet: 'neonatal_renal_cheat_sheet.docx', textbook: 'neonatal_renal_textbook.docx', audioTextbook: 'neonatal_renal_audio_textbook.docx' },
		{ topic: 'Surgical Emergencies', icon: '🔪', cheatSheet: 'neonatal_surgical_emergencies_cheat_sheet.docx', textbook: 'neonatal_surgical_emergencies_textbook.docx', audioTextbook: 'neonatal_surgical_emergencies_audio_textbook.docx' },
		{ topic: 'Skin & Dermatology', icon: '🩹', cheatSheet: 'neonatal_skin_cheat_sheet.docx', textbook: 'neonatal_skin_textbook.docx', audioTextbook: 'neonatal_skin_audio_textbook.docx' },
		{ topic: 'Urology', icon: '🏥', cheatSheet: 'neonatal_urology_cheat_sheet.docx', textbook: 'neonatal_urology_textbook.docx', audioTextbook: 'neonatal_urology_audio_textbook.docx' },
	];

	const tabMeta = {
		'cheat-sheets': { label: 'Cheat Sheets', icon: '📋', desc: '2–4 page laminated quick-reference cards for bedside use', pathPrefix: '/education/cheat-sheets/' },
		'textbooks': { label: 'Textbooks', icon: '📖', desc: 'Comprehensive referenced education guides (15,000–40,000+ words)', pathPrefix: '/education/textbooks/' },
		'audio': { label: 'Audio Textbooks', icon: '🎧', desc: 'Narration-optimized versions for Speechify or TTS conversion', pathPrefix: '/education/audio-textbooks/' },
	};

	function getFile(item: EducationItem, tab: typeof activeTab): string {
		if (tab === 'cheat-sheets') return item.cheatSheet;
		if (tab === 'textbooks') return item.textbook;
		return item.audioTextbook;
	}

	function downloadUrl(item: EducationItem, tab: typeof activeTab): string {
		return tabMeta[tab].pathPrefix + getFile(item, tab);
	}
</script>

<svelte:head>
	<title>Education Guides — PED CDS</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Neonatal Education Guides</h1>
		<p class="page-desc">
			11 neonatal topics, each with three formats: a laminated cheat sheet for the bedside,
			a comprehensive referenced textbook, and an audio-optimized version for TTS narration.
		</p>
	</div>

	<!-- Tabs -->
	<div class="tabs">
		{#each Object.entries(tabMeta) as [key, meta]}
			<button
				class="tab"
				class:active={activeTab === key}
				on:click={() => activeTab = key}
			>
				<span class="tab__icon">{meta.icon}</span>
				<span class="tab__label">{meta.label}</span>
			</button>
		{/each}
	</div>

	<!-- Tab description -->
	<p class="tab-desc">{tabMeta[activeTab].desc}</p>

	<!-- Content grid -->
	<div class="grid">
		{#each items as item}
			<a
				href={downloadUrl(item, activeTab)}
				download
				class="card"
			>
				<span class="card__icon">{item.icon}</span>
				<div class="card__content">
					<span class="card__topic">{item.topic}</span>
					<span class="card__file">{getFile(item, activeTab)}</span>
				</div>
				<span class="card__dl">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M8 2v8m0 0l-3-3m3 3l3-3M2 12h12" />
					</svg>
				</span>
			</a>
		{/each}
	</div>

	<!-- Format comparison -->
	<div class="format-info">
		<h2 class="format-title">Format Comparison</h2>
		<div class="format-grid">
			<div class="format-card">
				<span class="format-card__icon">📋</span>
				<h3>Cheat Sheets</h3>
				<p>2–4 page quick-reference. Designed for printing and laminating. Key decision points, dosing tables, and critical values at a glance.</p>
			</div>
			<div class="format-card">
				<span class="format-card__icon">📖</span>
				<h3>Textbooks</h3>
				<p>Full education guides with pathophysiology, evidence-based management, clinical pearls, and PubMed/AAP references. 15,000–40,000+ words per topic.</p>
			</div>
			<div class="format-card">
				<span class="format-card__icon">🎧</span>
				<h3>Audio Textbooks</h3>
				<p>Optimized for text-to-speech narration (Speechify, etc.). Same clinical content reformatted for auditory learning — ideal for commute study.</p>
			</div>
		</div>
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 900px;
	}

	.page-title {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		color: var(--color-text);
	}

	.page-desc {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	/* Tabs */
	.tabs {
		display: flex;
		gap: 0.25rem;
		background: var(--color-surface-inset);
		padding: 0.3rem;
		border-radius: var(--radius-md);
		width: fit-content;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.1s, color 0.1s;
	}

	.tab.active {
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: var(--shadow-sm);
	}

	.tab__icon {
		font-size: 1rem;
	}

	.tab-desc {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Grid */
	.grid {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.card {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.card__icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.card__content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.card__topic {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.card__file {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	.card__dl {
		color: var(--color-text-muted);
		flex-shrink: 0;
		transition: color 0.15s;
	}

	.card:hover .card__dl {
		color: var(--color-primary);
	}

	/* Format comparison */
	.format-info {
		margin-top: 1rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-border-subtle);
	}

	.format-title {
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-bottom: 1rem;
	}

	.format-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.75rem;
	}

	.format-card {
		padding: 1rem;
		background: var(--color-surface-inset);
		border-radius: var(--radius-md);
	}

	.format-card__icon {
		font-size: 1.5rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.format-card h3 {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.3rem;
	}

	.format-card p {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	@media (max-width: 640px) {
		.tabs {
			width: 100%;
		}
		.tab {
			flex: 1;
			justify-content: center;
		}
	}
</style>
