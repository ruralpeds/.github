<script lang="ts">
	import {
		runFullSearch,
		getSavedSearches,
		addSavedSearch,
		deleteSavedSearch,
		executeSavedSearch,
		getSearchesDueForRun,
		PUBMED_SEARCH_TEMPLATES,
		buildGuidelineQuery,
	} from '$lib/knowledge/pubmed';
	import { importFromPubMed } from '$lib/knowledge/store';
	import type { PubMedResult, PubMedSavedSearch } from '$lib/knowledge/types';

	let adHocQuery = '';
	let adHocDomain = 'general';
	let adHocMaxResults = 20;
	let searchResults: PubMedResult[] = [];
	let isSearching = false;
	let searchError = '';
	let selectedResults = new Set<string>();

	let savedSearches: PubMedSavedSearch[] = getSavedSearches();
	let showSaveForm = false;
	let saveName = '';
	let saveDomain = 'general';
	let saveInterval = 7;

	// New search from template
	let showTemplates = false;

	async function handleSearch() {
		if (!adHocQuery.trim()) return;
		isSearching = true;
		searchError = '';
		searchResults = [];
		selectedResults = new Set();

		try {
			searchResults = await runFullSearch(adHocQuery, { maxResults: adHocMaxResults });
		} catch (err) {
			searchError = err instanceof Error ? err.message : 'Search failed';
		} finally {
			isSearching = false;
		}
	}

	function toggleResult(pmid: string) {
		if (selectedResults.has(pmid)) {
			selectedResults.delete(pmid);
		} else {
			selectedResults.add(pmid);
		}
		selectedResults = selectedResults; // trigger reactivity
	}

	function selectAll() {
		searchResults.forEach(r => selectedResults.add(r.pmid));
		selectedResults = selectedResults;
	}

	function deselectAll() {
		selectedResults = new Set();
	}

	function importSelected() {
		const toImport = searchResults.filter(r => selectedResults.has(r.pmid));
		if (toImport.length === 0) return;
		importFromPubMed(toImport, { domain: adHocDomain });
		selectedResults = new Set();
	}

	function importAll() {
		if (searchResults.length === 0) return;
		importFromPubMed(searchResults, { domain: adHocDomain });
	}

	function handleSaveSearch() {
		if (!adHocQuery.trim() || !saveName.trim()) return;
		addSavedSearch({
			name: saveName.trim(),
			query: adHocQuery.trim(),
			domain: saveDomain,
			intervalDays: saveInterval,
			enabled: true,
		});
		savedSearches = getSavedSearches();
		showSaveForm = false;
		saveName = '';
	}

	function handleDeleteSearch(id: string) {
		deleteSavedSearch(id);
		savedSearches = getSavedSearches();
	}

	async function handleRunSaved(id: string) {
		isSearching = true;
		searchError = '';
		try {
			searchResults = await executeSavedSearch(id);
			savedSearches = getSavedSearches();
			const search = savedSearches.find(s => s.id === id);
			if (search) {
				adHocQuery = search.query;
				adHocDomain = search.domain;
			}
		} catch (err) {
			searchError = err instanceof Error ? err.message : 'Search failed';
		} finally {
			isSearching = false;
		}
	}

	function applyTemplate(template: { name: string; query: string; domain: string }) {
		adHocQuery = template.query;
		adHocDomain = template.domain;
		showTemplates = false;
	}

	function handleGuidelineSearch() {
		const topic = prompt('Enter clinical topic (e.g., "neonatal resuscitation"):');
		if (!topic) return;
		const org = prompt('Organization filter (optional, e.g., "AAP", "AHA"):') || undefined;
		adHocQuery = buildGuidelineQuery(topic, org);
		adHocDomain = 'general';
	}

	function formatDate(iso: string | null): string {
		if (!iso) return 'Never';
		return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<div class="pubmed-panel">
	<!-- Ad-hoc search -->
	<div class="search-section">
		<h2 class="section-title">PubMed Search</h2>
		<div class="search-bar">
			<textarea
				bind:value={adHocQuery}
				class="input input--query"
				rows="3"
				placeholder='Enter PubMed query (e.g., "neonatal resuscitation"[MeSH] AND "practice guideline"[pt])'
			></textarea>
			<div class="search-controls">
				<label class="inline-label">
					Domain:
					<input type="text" bind:value={adHocDomain} class="input input--sm" placeholder="general" />
				</label>
				<label class="inline-label">
					Max:
					<select bind:value={adHocMaxResults} class="input input--xs">
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
					</select>
				</label>
				<button class="btn btn--primary" on:click={handleSearch} disabled={isSearching || !adHocQuery.trim()}>
					{isSearching ? 'Searching...' : 'Search PubMed'}
				</button>
				<button class="btn btn--ghost" on:click={() => showTemplates = !showTemplates}>Templates</button>
				<button class="btn btn--ghost" on:click={handleGuidelineSearch}>Guideline Builder</button>
			</div>
		</div>

		<!-- Templates dropdown -->
		{#if showTemplates}
			<div class="templates">
				<h3 class="templates__title">Pre-built Pediatric/Neonatal Searches</h3>
				<div class="templates__grid">
					{#each PUBMED_SEARCH_TEMPLATES as template}
						<button class="template-card" on:click={() => applyTemplate(template)}>
							<span class="template-name">{template.name}</span>
							<span class="template-domain">{template.domain}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Save this search -->
		{#if adHocQuery.trim()}
			<div class="save-row">
				{#if !showSaveForm}
					<button class="btn btn--ghost btn--sm" on:click={() => { showSaveForm = true; saveName = ''; saveDomain = adHocDomain; }}>
						Save this search for periodic re-run
					</button>
				{:else}
					<div class="save-form">
						<input type="text" bind:value={saveName} class="input" placeholder="Search name" />
						<input type="text" bind:value={saveDomain} class="input input--sm" placeholder="Domain" />
						<label class="inline-label">
							Every
							<select bind:value={saveInterval} class="input input--xs">
								<option value={1}>1 day</option>
								<option value={7}>7 days</option>
								<option value={14}>14 days</option>
								<option value={30}>30 days</option>
							</select>
						</label>
						<button class="btn btn--primary btn--sm" on:click={handleSaveSearch}>Save</button>
						<button class="btn btn--ghost btn--sm" on:click={() => showSaveForm = false}>Cancel</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Error -->
	{#if searchError}
		<div class="error-banner">{searchError}</div>
	{/if}

	<!-- Results -->
	{#if searchResults.length > 0}
		<div class="results-section">
			<div class="results-header">
				<h2 class="section-title">Results ({searchResults.length})</h2>
				<div class="results-actions">
					<button class="btn btn--ghost btn--sm" on:click={selectAll}>Select All</button>
					<button class="btn btn--ghost btn--sm" on:click={deselectAll}>Deselect All</button>
					<button class="btn btn--primary btn--sm" on:click={importSelected} disabled={selectedResults.size === 0}>
						Import Selected ({selectedResults.size})
					</button>
					<button class="btn btn--ghost btn--sm" on:click={importAll}>Import All</button>
				</div>
			</div>

			<div class="results-list">
				{#each searchResults as result (result.pmid)}
					<div class="result-card" class:selected={selectedResults.has(result.pmid)}>
						<label class="result-check">
							<input type="checkbox" checked={selectedResults.has(result.pmid)} on:change={() => toggleResult(result.pmid)} />
						</label>
						<div class="result-body">
							<div class="result-title">{result.title}</div>
							<div class="result-meta">
								{#if result.authors.length > 0}
									<span class="result-authors">{result.authors.slice(0, 3).join(', ')}{result.authors.length > 3 ? ' et al.' : ''}</span>
								{/if}
								<span class="result-journal">{result.journal}</span>
								<span class="result-date">{result.publishedAt}</span>
								<a href="https://pubmed.ncbi.nlm.nih.gov/{result.pmid}/" target="_blank" rel="noopener" class="result-pmid">PMID: {result.pmid}</a>
							</div>
							{#if result.publicationType.length > 0}
								<div class="result-types">
									{#each result.publicationType as pt}
										<span class="type-tag">{pt}</span>
									{/each}
								</div>
							{/if}
							{#if result.abstract}
								<details class="result-abstract">
									<summary>Abstract</summary>
									<p>{result.abstract}</p>
								</details>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Saved Searches -->
	<div class="saved-section">
		<h2 class="section-title">Saved Searches ({savedSearches.length})</h2>
		{#if savedSearches.length === 0}
			<p class="muted">No saved searches yet. Run a search above and save it for periodic monitoring.</p>
		{:else}
			<div class="saved-list">
				{#each savedSearches as search (search.id)}
					<div class="saved-card" class:due={!search.lastRunAt || (Date.now() - new Date(search.lastRunAt).getTime()) >= search.intervalDays * 86400000}>
						<div class="saved-info">
							<div class="saved-name">{search.name}</div>
							<div class="saved-meta">
								<span>{search.domain}</span>
								<span>Every {search.intervalDays}d</span>
								<span>Last: {formatDate(search.lastRunAt)}</span>
								<span>Results: {search.lastResultCount}</span>
								<span class="saved-status">{search.enabled ? 'Active' : 'Paused'}</span>
							</div>
						</div>
						<div class="saved-actions">
							<button class="btn btn--primary btn--sm" on:click={() => handleRunSaved(search.id)} disabled={isSearching}>Run Now</button>
							<button class="btn btn--danger btn--sm" on:click={() => handleDeleteSearch(search.id)}>Delete</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.pubmed-panel { display: flex; flex-direction: column; gap: 1.5rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text, #1a1a2e); margin: 0 0 0.75rem; }
	.search-bar { display: flex; flex-direction: column; gap: 0.75rem; }
	.search-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
	.inline-label { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--color-text-secondary, #64748b); }
	.input { padding: 0.375rem 0.625rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-sm, 6px); font-size: 0.8125rem; color: var(--color-text, #1a1a2e); background: var(--color-bg, #fff); font-family: inherit; }
	.input:focus { outline: 2px solid var(--color-primary, #6366f1); outline-offset: -1px; }
	.input--query { width: 100%; font-family: var(--font-mono, monospace); font-size: 0.8125rem; resize: vertical; }
	.input--sm { width: 120px; }
	.input--xs { width: 80px; }
	.btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.875rem; border: 1px solid transparent; border-radius: var(--radius-sm, 6px); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: background 0.15s; font-family: inherit; }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn--primary { background: var(--color-primary, #6366f1); color: #fff; border-color: var(--color-primary, #6366f1); }
	.btn--primary:hover:not(:disabled) { filter: brightness(1.1); }
	.btn--ghost { background: transparent; color: var(--color-text-secondary, #64748b); border-color: var(--color-border, #e2e8f0); }
	.btn--ghost:hover { background: var(--color-surface, #f8fafc); }
	.btn--danger { background: transparent; color: var(--color-emergency, #ef4444); border-color: var(--color-emergency, #ef4444); }
	.btn--sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
	.templates { background: var(--color-surface, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-md, 8px); padding: 1rem; }
	.templates__title { font-size: 0.875rem; font-weight: 600; margin: 0 0 0.75rem; color: var(--color-text, #1a1a2e); }
	.templates__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.5rem; }
	.template-card { display: flex; flex-direction: column; gap: 0.125rem; padding: 0.5rem 0.75rem; background: var(--color-bg, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-sm, 6px); cursor: pointer; text-align: left; transition: border-color 0.15s; }
	.template-card:hover { border-color: var(--color-primary, #6366f1); }
	.template-name { font-size: 0.8125rem; font-weight: 500; color: var(--color-text, #1a1a2e); }
	.template-domain { font-size: 0.6875rem; color: var(--color-text-muted, #94a3b8); }
	.save-row { padding-top: 0.25rem; }
	.save-form { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
	.error-banner { padding: 0.75rem 1rem; background: color-mix(in srgb, var(--color-emergency, #ef4444) 10%, var(--color-bg, #fff)); border: 1px solid var(--color-emergency, #ef4444); border-radius: var(--radius-sm, 6px); color: var(--color-emergency, #ef4444); font-size: 0.8125rem; }
	.results-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
	.results-actions { display: flex; gap: 0.375rem; }
	.results-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.result-card { display: flex; gap: 0.75rem; padding: 0.75rem; background: var(--color-surface, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-sm, 6px); transition: border-color 0.15s; }
	.result-card.selected { border-color: var(--color-primary, #6366f1); background: color-mix(in srgb, var(--color-primary, #6366f1) 5%, var(--color-surface, #f8fafc)); }
	.result-check { flex-shrink: 0; padding-top: 0.125rem; }
	.result-body { flex: 1; min-width: 0; }
	.result-title { font-weight: 500; font-size: 0.875rem; color: var(--color-text, #1a1a2e); line-height: 1.4; }
	.result-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.375rem; font-size: 0.75rem; color: var(--color-text-muted, #94a3b8); }
	.result-journal { font-style: italic; }
	.result-pmid { color: var(--color-primary, #6366f1); text-decoration: none; }
	.result-pmid:hover { text-decoration: underline; }
	.result-types { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.375rem; }
	.type-tag { padding: 0.0625rem 0.375rem; background: var(--color-bg, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 4px; font-size: 0.6875rem; color: var(--color-text-secondary, #64748b); }
	.result-abstract { margin-top: 0.5rem; font-size: 0.8125rem; }
	.result-abstract summary { cursor: pointer; color: var(--color-primary, #6366f1); font-weight: 500; }
	.result-abstract p { margin: 0.5rem 0 0; color: var(--color-text-secondary, #64748b); line-height: 1.5; white-space: pre-wrap; }
	.saved-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.saved-card { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--color-surface, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-sm, 6px); }
	.saved-card.due { border-left: 3px solid var(--color-primary, #6366f1); }
	.saved-name { font-weight: 500; font-size: 0.875rem; color: var(--color-text, #1a1a2e); }
	.saved-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem; font-size: 0.75rem; color: var(--color-text-muted, #94a3b8); }
	.saved-status { font-weight: 600; }
	.saved-actions { display: flex; gap: 0.375rem; flex-shrink: 0; }
	.muted { color: var(--color-text-muted, #94a3b8); font-size: 0.8125rem; }
</style>
