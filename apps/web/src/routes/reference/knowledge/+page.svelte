<script lang="ts">
	import { onMount } from 'svelte';
	import {
		knowledgeSummary,
		knowledgeItems,
		createKnowledgeItem,
		initKnowledgeSystem,
		deleteKnowledgeItem,
		updateKnowledgeItem,
		filterKnowledgeItems,
		exportKnowledgeJSON,
		exportKnowledgeCSV,
		KNOWLEDGE_CATEGORY_LABELS,
		KNOWLEDGE_STATUS_LABELS,
	} from '$lib/knowledge';
	import type { KnowledgeItem, KnowledgeCategory, KnowledgeStatus } from '$lib/knowledge';
	import PubMedSearchPanel from './PubMedSearchPanel.svelte';
	import LogViewer from './LogViewer.svelte';

	let activeTab: 'dashboard' | 'items' | 'pubmed' | 'logs' = 'dashboard';
	let filterCategory: KnowledgeCategory | '' = '';
	let filterStatus: KnowledgeStatus | '' = '';
	let filterDomain = '';
	let searchQuery = '';
	let showAddForm = false;
	let editingItem: KnowledgeItem | null = null;

	// Add/Edit form fields
	let formTitle = '';
	let formCategory: KnowledgeCategory = 'other';
	let formDomain = '';
	let formStatus: KnowledgeStatus = 'new';
	let formSummary = '';
	let formAuthors = '';
	let formJournal = '';
	let formPmid = '';
	let formDoi = '';
	let formUrl = '';
	let formTags = '';
	let formGuidelineBody = '';
	let formVersion = '';
	let formPublishedAt = '';
	let formNotes = '';

	$: filteredItems = filterKnowledgeItems({
		category: filterCategory || undefined,
		status: filterStatus || undefined,
		domain: filterDomain || undefined,
		search: searchQuery || undefined,
	});

	$: summary = $knowledgeSummary;

	onMount(() => {
		initKnowledgeSystem();
	});

	function resetForm() {
		formTitle = '';
		formCategory = 'other';
		formDomain = '';
		formStatus = 'new';
		formSummary = '';
		formAuthors = '';
		formJournal = '';
		formPmid = '';
		formDoi = '';
		formUrl = '';
		formTags = '';
		formGuidelineBody = '';
		formVersion = '';
		formPublishedAt = '';
		formNotes = '';
		showAddForm = false;
		editingItem = null;
	}

	function openAddForm() {
		resetForm();
		showAddForm = true;
	}

	function openEditForm(item: KnowledgeItem) {
		editingItem = item;
		formTitle = item.title;
		formCategory = item.category;
		formDomain = item.domain;
		formStatus = item.status;
		formSummary = item.summary;
		formAuthors = item.authors.join('; ');
		formJournal = item.journal || '';
		formPmid = item.pmid || '';
		formDoi = item.doi || '';
		formUrl = item.url || '';
		formTags = item.tags.join(', ');
		formGuidelineBody = item.guidelineBody || '';
		formVersion = item.version || '';
		formPublishedAt = item.publishedAt ? item.publishedAt.split('T')[0] : '';
		formNotes = item.notes;
		showAddForm = true;
	}

	function handleSubmit() {
		if (!formTitle.trim()) return;

		const data = {
			title: formTitle.trim(),
			category: formCategory,
			domain: formDomain.trim() || 'general',
			source: { type: 'manual' as const, fetchedAt: null, query: null },
			publishedAt: formPublishedAt ? new Date(formPublishedAt).toISOString() : null,
			summary: formSummary.trim(),
			guidelineBody: formGuidelineBody.trim() || null,
			pmid: formPmid.trim() || null,
			doi: formDoi.trim() || null,
			authors: formAuthors ? formAuthors.split(';').map((a: string) => a.trim()).filter(Boolean) : [],
			journal: formJournal.trim() || null,
			tags: formTags ? formTags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
			status: formStatus,
			version: formVersion.trim() || null,
			url: formUrl.trim() || null,
			relatedTreeId: null,
			notes: formNotes.trim(),
		};

		if (editingItem) {
			updateKnowledgeItem(editingItem.id, data);
		} else {
			createKnowledgeItem(data);
		}

		resetForm();
	}

	function handleDelete(id: string, title: string) {
		if (confirm(`Delete "${title}"? This cannot be undone.`)) {
			deleteKnowledgeItem(id);
		}
	}

	function handleExport(format: 'json' | 'csv') {
		const content = format === 'json' ? exportKnowledgeJSON() : exportKnowledgeCSV();
		const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `knowledge-export-${new Date().toISOString().split('T')[0]}.${format}`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function formatDate(iso: string): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('en-US', {
			year: 'numeric', month: 'short', day: 'numeric',
		});
	}

	function formatDateTime(iso: string): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleString('en-US', {
			year: 'numeric', month: 'short', day: 'numeric',
			hour: '2-digit', minute: '2-digit',
		});
	}

	function statusColor(status: KnowledgeStatus): string {
		const colors: Record<KnowledgeStatus, string> = {
			'new': 'var(--color-info, #3b82f6)',
			'under-review': 'var(--color-warning, #f59e0b)',
			'approved': 'var(--color-success, #10b981)',
			'integrated': 'var(--color-primary, #6366f1)',
			'superseded': 'var(--color-text-muted, #9ca3af)',
			'archived': 'var(--color-text-muted, #6b7280)',
		};
		return colors[status];
	}
</script>

<svelte:head>
	<title>Knowledge Management — PED CDS</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Knowledge Management</h1>
		<p class="page-desc">
			Track clinical knowledge sources, monitor PubMed for new articles and practice guidelines,
			and maintain an auditable log of all knowledge operations.
		</p>
	</div>

	<!-- Tabs -->
	<div class="tabs">
		<button class="tab" class:active={activeTab === 'dashboard'} on:click={() => activeTab = 'dashboard'}>
			<span class="tab__icon">📊</span><span class="tab__label">Dashboard</span>
		</button>
		<button class="tab" class:active={activeTab === 'items'} on:click={() => activeTab = 'items'}>
			<span class="tab__icon">📚</span><span class="tab__label">Knowledge Items</span>
		</button>
		<button class="tab" class:active={activeTab === 'pubmed'} on:click={() => activeTab = 'pubmed'}>
			<span class="tab__icon">🔬</span><span class="tab__label">PubMed Search</span>
		</button>
		<button class="tab" class:active={activeTab === 'logs'} on:click={() => activeTab = 'logs'}>
			<span class="tab__icon">📝</span><span class="tab__label">Activity Logs</span>
		</button>
	</div>

	<!-- ================================================================== -->
	<!-- DASHBOARD TAB -->
	<!-- ================================================================== -->
	{#if activeTab === 'dashboard'}
		<div class="dashboard">
			<div class="stat-grid">
				<div class="stat-card">
					<div class="stat-value">{summary.totalItems}</div>
					<div class="stat-label">Total Items</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">{summary.byStatus['new'] || 0}</div>
					<div class="stat-label">New / Unreviewed</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">{summary.byStatus['under-review'] || 0}</div>
					<div class="stat-label">Under Review</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">{summary.byStatus['integrated'] || 0}</div>
					<div class="stat-label">Integrated</div>
				</div>
				<div class="stat-card">
					<div class="stat-value">{summary.savedSearches}</div>
					<div class="stat-label">Saved Searches</div>
				</div>
				<div class="stat-card accent">
					<div class="stat-value">{summary.searchesDueForRun}</div>
					<div class="stat-label">Searches Due</div>
				</div>
			</div>

			{#if Object.keys(summary.byCategory).length > 0}
				<div class="section">
					<h2 class="section-title">By Category</h2>
					<div class="tag-list">
						{#each Object.entries(summary.byCategory) as [cat, count]}
							<span class="tag">{KNOWLEDGE_CATEGORY_LABELS[cat] || cat} <strong>{count}</strong></span>
						{/each}
					</div>
				</div>
			{/if}

			{#if Object.keys(summary.byDomain).length > 0}
				<div class="section">
					<h2 class="section-title">By Domain</h2>
					<div class="tag-list">
						{#each Object.entries(summary.byDomain) as [domain, count]}
							<span class="tag">{domain} <strong>{count}</strong></span>
						{/each}
					</div>
				</div>
			{/if}

			{#if summary.recentlyModified.length > 0}
				<div class="section">
					<h2 class="section-title">Recently Modified</h2>
					<div class="recent-list">
						{#each summary.recentlyModified.slice(0, 5) as item}
							<div class="recent-item">
								<span class="recent-title">{item.title}</span>
								<span class="recent-meta">
									<span class="badge" style="background:{statusColor(item.status)}">{KNOWLEDGE_STATUS_LABELS[item.status]}</span>
									{formatDate(item.modifiedAt)}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if summary.lastLogEntries.length > 0}
				<div class="section">
					<h2 class="section-title">Recent Activity</h2>
					<div class="log-mini">
						{#each summary.lastLogEntries.slice(0, 8) as entry}
							<div class="log-mini__entry log-mini--{entry.level}">
								<span class="log-mini__time">{formatDateTime(entry.timestamp)}</span>
								<span class="log-mini__action">{entry.action.replace(/_/g, ' ')}</span>
								<span class="log-mini__msg">{entry.message}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

	<!-- ================================================================== -->
	<!-- KNOWLEDGE ITEMS TAB -->
	<!-- ================================================================== -->
	{:else if activeTab === 'items'}
		<div class="items-view">
			<div class="toolbar">
				<button class="btn btn--primary" on:click={openAddForm}>+ Add Item</button>
				<div class="toolbar__filters">
					<input type="search" placeholder="Search..." bind:value={searchQuery} class="input input--search" />
					<select bind:value={filterCategory} class="input input--select">
						<option value="">All Categories</option>
						{#each Object.entries(KNOWLEDGE_CATEGORY_LABELS) as [key, label]}
							<option value={key}>{label}</option>
						{/each}
					</select>
					<select bind:value={filterStatus} class="input input--select">
						<option value="">All Statuses</option>
						{#each Object.entries(KNOWLEDGE_STATUS_LABELS) as [key, label]}
							<option value={key}>{label}</option>
						{/each}
					</select>
					<input type="text" placeholder="Domain..." bind:value={filterDomain} class="input input--sm" />
				</div>
				<div class="toolbar__actions">
					<button class="btn btn--ghost" on:click={() => handleExport('json')}>Export JSON</button>
					<button class="btn btn--ghost" on:click={() => handleExport('csv')}>Export CSV</button>
				</div>
			</div>

			{#if showAddForm}
				<div class="modal-overlay" on:click={resetForm} on:keydown={(e) => e.key === 'Escape' && resetForm()}>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div class="modal" on:click|stopPropagation role="dialog" aria-label={editingItem ? 'Edit knowledge item' : 'Add knowledge item'}>
						<h2 class="modal__title">{editingItem ? 'Edit' : 'Add'} Knowledge Item</h2>
						<form on:submit|preventDefault={handleSubmit} class="form">
							<div class="form-row">
								<label class="form-label">Title *
									<input type="text" bind:value={formTitle} required class="input" placeholder="Article or guideline title" />
								</label>
							</div>
							<div class="form-row form-row--2col">
								<label class="form-label">Category
									<select bind:value={formCategory} class="input">
										{#each Object.entries(KNOWLEDGE_CATEGORY_LABELS) as [key, label]}
											<option value={key}>{label}</option>
										{/each}
									</select>
								</label>
								<label class="form-label">Status
									<select bind:value={formStatus} class="input">
										{#each Object.entries(KNOWLEDGE_STATUS_LABELS) as [key, label]}
											<option value={key}>{label}</option>
										{/each}
									</select>
								</label>
							</div>
							<div class="form-row form-row--2col">
								<label class="form-label">Domain
									<input type="text" bind:value={formDomain} class="input" placeholder="e.g., resuscitation, sepsis" />
								</label>
								<label class="form-label">Guideline Body
									<input type="text" bind:value={formGuidelineBody} class="input" placeholder="e.g., AAP, AHA, WHO" />
								</label>
							</div>
							<div class="form-row form-row--2col">
								<label class="form-label">PMID
									<input type="text" bind:value={formPmid} class="input" placeholder="PubMed ID" />
								</label>
								<label class="form-label">DOI
									<input type="text" bind:value={formDoi} class="input" placeholder="10.xxxx/..." />
								</label>
							</div>
							<div class="form-row form-row--2col">
								<label class="form-label">Published Date
									<input type="date" bind:value={formPublishedAt} class="input" />
								</label>
								<label class="form-label">Version
									<input type="text" bind:value={formVersion} class="input" placeholder="e.g., 8th Edition" />
								</label>
							</div>
							<div class="form-row">
								<label class="form-label">Authors <span class="hint">(semicolon-separated)</span>
									<input type="text" bind:value={formAuthors} class="input" placeholder="Smith J; Doe A; ..." />
								</label>
							</div>
							<div class="form-row form-row--2col">
								<label class="form-label">Journal
									<input type="text" bind:value={formJournal} class="input" placeholder="Journal name" />
								</label>
								<label class="form-label">URL
									<input type="url" bind:value={formUrl} class="input" placeholder="https://..." />
								</label>
							</div>
							<div class="form-row">
								<label class="form-label">Tags <span class="hint">(comma-separated)</span>
									<input type="text" bind:value={formTags} class="input" placeholder="neonatal, guideline, 2025" />
								</label>
							</div>
							<div class="form-row">
								<label class="form-label">Summary / Abstract
									<textarea bind:value={formSummary} class="input input--textarea" rows="4" placeholder="Brief summary or abstract..."></textarea>
								</label>
							</div>
							<div class="form-row">
								<label class="form-label">Notes
									<textarea bind:value={formNotes} class="input input--textarea" rows="2" placeholder="Internal notes..."></textarea>
								</label>
							</div>
							<div class="form-actions">
								<button type="button" class="btn btn--ghost" on:click={resetForm}>Cancel</button>
								<button type="submit" class="btn btn--primary">{editingItem ? 'Save Changes' : 'Add Item'}</button>
							</div>
						</form>
					</div>
				</div>
			{/if}

			<div class="items-count">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</div>
			{#if filteredItems.length === 0}
				<div class="empty-state">
					<p>No knowledge items yet.</p>
					<p>Add items manually or import from PubMed searches.</p>
				</div>
			{:else}
				<div class="items-table-wrap">
					<table class="items-table">
						<thead>
							<tr>
								<th>Title</th>
								<th>Category</th>
								<th>Domain</th>
								<th>Status</th>
								<th>Created</th>
								<th>Modified</th>
								<th>PMID</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredItems as item (item.id)}
								<tr>
									<td class="cell-title">
										<div class="item-title">{item.title}</div>
										{#if item.authors.length > 0}
											<div class="item-authors">{item.authors.slice(0, 3).join(', ')}{item.authors.length > 3 ? ' et al.' : ''}</div>
										{/if}
										{#if item.tags.length > 0}
											<div class="item-tags">
												{#each item.tags as tag}
													<span class="mini-tag">{tag}</span>
												{/each}
											</div>
										{/if}
									</td>
									<td>{KNOWLEDGE_CATEGORY_LABELS[item.category]}</td>
									<td>{item.domain}</td>
									<td><span class="badge" style="background:{statusColor(item.status)}">{KNOWLEDGE_STATUS_LABELS[item.status]}</span></td>
									<td class="cell-date">{formatDate(item.createdAt)}</td>
									<td class="cell-date">{formatDate(item.modifiedAt)}</td>
									<td>
										{#if item.pmid}
											<a href="https://pubmed.ncbi.nlm.nih.gov/{item.pmid}/" target="_blank" rel="noopener">{item.pmid}</a>
										{:else}—{/if}
									</td>
									<td class="cell-actions">
										<button class="btn btn--sm btn--ghost" on:click={() => openEditForm(item)}>Edit</button>
										<button class="btn btn--sm btn--danger" on:click={() => handleDelete(item.id, item.title)}>Del</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

	<!-- ================================================================== -->
	<!-- PUBMED SEARCH TAB -->
	<!-- ================================================================== -->
	{:else if activeTab === 'pubmed'}
		<PubMedSearchPanel />

	<!-- ================================================================== -->
	<!-- LOGS TAB -->
	<!-- ================================================================== -->
	{:else if activeTab === 'logs'}
		<LogViewer />
	{/if}
</div>

<style>
	.page { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
	.page-header { margin-bottom: 1.5rem; }
	.page-title { font-family: var(--font-heading, sans-serif); font-size: 1.75rem; font-weight: 700; color: var(--color-text, #1a1a2e); margin: 0 0 0.5rem; }
	.page-desc { color: var(--color-text-secondary, #64748b); font-size: 0.9rem; line-height: 1.5; margin: 0; }
	.tabs { display: flex; gap: 0.25rem; border-bottom: 2px solid var(--color-border, #e2e8f0); margin-bottom: 1.5rem; }
	.tab { display: flex; align-items: center; gap: 0.375rem; padding: 0.625rem 1rem; background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; cursor: pointer; font-size: 0.875rem; font-weight: 500; color: var(--color-text-muted, #94a3b8); transition: color 0.15s, border-color 0.15s; }
	.tab:hover { color: var(--color-text, #1a1a2e); }
	.tab.active { color: var(--color-primary, #6366f1); border-bottom-color: var(--color-primary, #6366f1); }
	.tab__icon { font-size: 1rem; }
	.stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
	.stat-card { background: var(--color-surface, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-md, 8px); padding: 1rem; text-align: center; }
	.stat-card.accent { border-color: var(--color-primary, #6366f1); background: color-mix(in srgb, var(--color-primary, #6366f1) 5%, var(--color-surface, #f8fafc)); }
	.stat-value { font-size: 2rem; font-weight: 700; color: var(--color-text, #1a1a2e); font-family: var(--font-mono, monospace); }
	.stat-label { font-size: 0.75rem; color: var(--color-text-muted, #94a3b8); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.25rem; }
	.section { margin-bottom: 1.5rem; }
	.section-title { font-size: 1rem; font-weight: 600; color: var(--color-text, #1a1a2e); margin: 0 0 0.75rem; }
	.tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tag { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.75rem; background: var(--color-surface, #f1f5f9); border: 1px solid var(--color-border, #e2e8f0); border-radius: 9999px; font-size: 0.8125rem; color: var(--color-text-secondary, #64748b); }
	.tag strong { color: var(--color-text, #1a1a2e); }
	.recent-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.recent-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--color-surface, #f8fafc); border-radius: var(--radius-sm, 6px); font-size: 0.8125rem; }
	.recent-title { font-weight: 500; color: var(--color-text, #1a1a2e); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.recent-meta { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; color: var(--color-text-muted, #94a3b8); font-size: 0.75rem; }
	.badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; color: #fff; font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
	.log-mini { display: flex; flex-direction: column; gap: 0.25rem; }
	.log-mini__entry { display: grid; grid-template-columns: 140px 120px 1fr; gap: 0.5rem; padding: 0.375rem 0.5rem; font-size: 0.75rem; font-family: var(--font-mono, monospace); border-left: 3px solid var(--color-border, #e2e8f0); background: var(--color-surface, #f8fafc); }
	:global(.log-mini--error) { border-left-color: var(--color-emergency, #ef4444) !important; }
	:global(.log-mini--warn) { border-left-color: var(--color-warning, #f59e0b) !important; }
	:global(.log-mini--info) { border-left-color: var(--color-info, #3b82f6) !important; }
	:global(.log-mini--debug) { border-left-color: var(--color-text-muted, #94a3b8) !important; }
	.log-mini__time { color: var(--color-text-muted, #94a3b8); }
	.log-mini__action { color: var(--color-text-secondary, #64748b); font-weight: 600; }
	.log-mini__msg { color: var(--color-text, #1a1a2e); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
	.toolbar__filters { display: flex; gap: 0.5rem; flex: 1; flex-wrap: wrap; }
	.toolbar__actions { display: flex; gap: 0.5rem; }
	.items-count { font-size: 0.8125rem; color: var(--color-text-muted, #94a3b8); margin-bottom: 0.5rem; }
	.items-table-wrap { overflow-x: auto; }
	.items-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
	.items-table th { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid var(--color-border, #e2e8f0); color: var(--color-text-secondary, #64748b); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
	.items-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--color-border-subtle, #f1f5f9); vertical-align: top; }
	.items-table tr:hover td { background: var(--color-surface, #f8fafc); }
	.cell-title { max-width: 320px; }
	.item-title { font-weight: 500; color: var(--color-text, #1a1a2e); }
	.item-authors { font-size: 0.75rem; color: var(--color-text-muted, #94a3b8); margin-top: 0.125rem; }
	.item-tags { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.25rem; }
	.mini-tag { padding: 0 0.375rem; background: var(--color-surface, #f1f5f9); border-radius: 4px; font-size: 0.6875rem; color: var(--color-text-muted, #94a3b8); }
	.cell-date { white-space: nowrap; font-size: 0.75rem; color: var(--color-text-muted, #94a3b8); }
	.cell-actions { white-space: nowrap; }
	.input { padding: 0.375rem 0.625rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-sm, 6px); font-size: 0.8125rem; color: var(--color-text, #1a1a2e); background: var(--color-bg, #fff); font-family: inherit; width: 100%; }
	.input:focus { outline: 2px solid var(--color-primary, #6366f1); outline-offset: -1px; }
	.input--search { max-width: 200px; }
	.input--select { max-width: 180px; width: auto; }
	.input--sm { max-width: 140px; }
	.input--textarea { resize: vertical; }
	.btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.875rem; border: 1px solid transparent; border-radius: var(--radius-sm, 6px); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: background 0.15s, color 0.15s; font-family: inherit; }
	.btn--primary { background: var(--color-primary, #6366f1); color: #fff; border-color: var(--color-primary, #6366f1); }
	.btn--primary:hover { filter: brightness(1.1); }
	.btn--ghost { background: transparent; color: var(--color-text-secondary, #64748b); border-color: var(--color-border, #e2e8f0); }
	.btn--ghost:hover { background: var(--color-surface, #f8fafc); }
	.btn--danger { background: transparent; color: var(--color-emergency, #ef4444); border-color: var(--color-emergency, #ef4444); }
	.btn--danger:hover { background: color-mix(in srgb, var(--color-emergency, #ef4444) 10%, transparent); }
	.btn--sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
	.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
	.modal { background: var(--color-bg, #fff); border-radius: var(--radius-md, 8px); padding: 1.5rem; max-width: 640px; width: 100%; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); }
	.modal__title { font-size: 1.25rem; font-weight: 700; margin: 0 0 1rem; color: var(--color-text, #1a1a2e); }
	.form { display: flex; flex-direction: column; gap: 0.75rem; }
	.form-row { display: flex; flex-direction: column; }
	.form-row--2col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
	.form-label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary, #64748b); }
	.hint { font-weight: 400; color: var(--color-text-muted, #94a3b8); }
	.form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
	.empty-state { text-align: center; padding: 3rem 1rem; color: var(--color-text-muted, #94a3b8); }
	.empty-state p { margin: 0.25rem 0; }
</style>
