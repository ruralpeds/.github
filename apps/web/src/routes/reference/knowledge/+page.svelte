<script lang="ts">
	import { onMount } from 'svelte';

	// ── Types ──────────────────────────────────────────────────────────────
	interface KnowledgeEntry {
		id: string;
		category: string;
		title: string;
		description?: string;
		path?: string;
		status: string;
		tags?: string[];
		created?: string;
	}

	interface Registry {
		entries: Record<string, KnowledgeEntry>;
		categories: Record<string, string>;
		last_updated: string;
	}

	// ── State ──────────────────────────────────────────────────────────────
	let registry: Registry | null = null;
	let loading = true;
	let error = '';
	let searchQuery = '';
	let activeCategory = 'all';

	// Category display config
	const CATEGORY_META: Record<string, { icon: string; label: string; color: string }> = {
		all:               { icon: '🗂',  label: 'All',               color: 'var(--color-primary)' },
		module:            { icon: '🔧',  label: 'Rust Modules',       color: '#3b82f6' },
		decision_tree:     { icon: '🌳',  label: 'Decision Trees',      color: '#22c55e' },
		education_guide:   { icon: '📘',  label: 'Education Guides',    color: '#a855f7' },
		textbook:          { icon: '📖',  label: 'Textbooks',           color: '#f59e0b' },
		audio_textbook:    { icon: '🎧',  label: 'Audio Textbooks',     color: '#ec4899' },
		calculator:        { icon: '🧮',  label: 'Calculators',         color: '#14b8a6' },
		literature_review: { icon: '🔬',  label: 'Literature Reviews',  color: '#f97316' },
		protocol:          { icon: '📋',  label: 'Protocols',           color: '#ef4444' },
	};

	// ── Load registry ──────────────────────────────────────────────────────
	onMount(async () => {
		try {
			const res = await fetch('/knowledge/registry.json');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			registry = await res.json();
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	});

	// ── Derived ────────────────────────────────────────────────────────────
	$: allEntries = registry ? Object.values(registry.entries) : [];

	$: categoryCounts = allEntries.reduce((acc: Record<string, number>, e) => {
		acc[e.category] = (acc[e.category] || 0) + 1;
		return acc;
	}, {});

	$: filteredEntries = allEntries.filter(e => {
		const matchCat  = activeCategory === 'all' || e.category === activeCategory;
		const q = searchQuery.toLowerCase();
		const matchText = !q
			|| e.title.toLowerCase().includes(q)
			|| e.id.toLowerCase().includes(q)
			|| (e.tags || []).some(t => t.toLowerCase().includes(q))
			|| (e.description || '').toLowerCase().includes(q);
		return matchCat && matchText;
	});

	// ── Helpers ────────────────────────────────────────────────────────────
	function catMeta(cat: string) {
		return CATEGORY_META[cat] ?? { icon: '📄', label: cat, color: 'var(--color-text-muted)' };
	}

	function buildLink(entry: KnowledgeEntry): string | null {
		if (!entry.path) return null;
		if (entry.category === 'decision_tree') {
			return `/decision-trees/${entry.path.split('/').pop()}`;
		}
		if (entry.category === 'calculator') {
			const file = entry.path.split('/').pop();
			if (file) return `/decision-trees/${file}`;
		}
		return null;
	}

	function formatDate(iso?: string): string {
		if (!iso) return '';
		return iso.slice(0, 10);
	}
</script>

<svelte:head><title>Knowledge Registry — PED CDS</title></svelte:head>

<div class="page">

	<!-- Header -->
	<div class="page-hdr">
		<div>
			<h1>Knowledge Registry</h1>
			<p class="sub">
				{allEntries.length} artifacts across {Object.keys(categoryCounts).length} categories
				{#if registry?.last_updated}
					· Updated {formatDate(registry.last_updated)}
				{/if}
			</p>
		</div>
	</div>

	{#if loading}
		<div class="loading">
			<span class="spinner"></span> Loading registry…
		</div>

	{:else if error}
		<div class="error-box">Failed to load registry: {error}</div>

	{:else}

		<!-- Search -->
		<div class="search-row">
			<div class="search-wrap">
				<span class="search-icon">🔍</span>
				<input
					type="search"
					bind:value={searchQuery}
					placeholder="Search by title, ID, or tag…"
					class="search-input"
				/>
				{#if searchQuery}
					<button class="search-clear" on:click={() => searchQuery = ''}>×</button>
				{/if}
			</div>
			<span class="result-count">
				{filteredEntries.length} result{filteredEntries.length !== 1 ? 's' : ''}
			</span>
		</div>

		<!-- Category filter pills -->
		<div class="cat-row">
			<button
				class="cat-pill"
				class:active={activeCategory === 'all'}
				on:click={() => activeCategory = 'all'}
			>
				<span>🗂</span>
				All
				<span class="pill-count">{allEntries.length}</span>
			</button>
			{#each Object.keys(categoryCounts).sort() as cat}
				{@const meta = catMeta(cat)}
				<button
					class="cat-pill"
					class:active={activeCategory === cat}
					style="--pill-col:{meta.color}"
					on:click={() => activeCategory = cat}
				>
					<span>{meta.icon}</span>
					{meta.label}
					<span class="pill-count">{categoryCounts[cat]}</span>
				</button>
			{/each}
		</div>

		<!-- Entry grid -->
		{#if filteredEntries.length === 0}
			<div class="empty">
				<span>🔍</span>
				<p>No entries match "{searchQuery}"</p>
				<button class="clear-btn" on:click={() => { searchQuery = ''; activeCategory = 'all'; }}>
					Clear filters
				</button>
			</div>
		{:else}
			<div class="entry-grid">
				{#each filteredEntries as entry}
					{@const meta  = catMeta(entry.category)}
					{@const link  = buildLink(entry)}
					{@const tags  = (entry.tags ?? []).slice(0, 5)}

					<div class="entry-card" class:has-link={!!link}>
						<!-- Category accent strip -->
						<div class="card-accent" style="background:{meta.color}"></div>

						<div class="card-body">
							<!-- Head row -->
							<div class="card-head">
								<span class="cat-chip" style="color:{meta.color};background:{meta.color}18;border-color:{meta.color}44">
									{meta.icon} {meta.label}
								</span>
								<span class="status-dot" class:active={entry.status === 'active'}
									title="Status: {entry.status}">
								</span>
							</div>

							<!-- Title -->
							<div class="card-title">{entry.title}</div>

							<!-- ID -->
							<div class="card-id">{entry.id}</div>

							<!-- Description -->
							{#if entry.description}
								<div class="card-desc">{entry.description}</div>
							{/if}

							<!-- Tags -->
							{#if tags.length}
								<div class="card-tags">
									{#each tags as tag}
										<button
											class="tag"
											on:click|stopPropagation={() => {
												searchQuery = tag;
												activeCategory = 'all';
											}}
										>{tag}</button>
									{/each}
								</div>
							{/if}

							<!-- Footer -->
							<div class="card-footer">
								{#if entry.created}
									<span class="card-date">{formatDate(entry.created)}</span>
								{/if}
								{#if link}
									<a href={link} target="_blank" class="card-open" on:click|stopPropagation>
										Open ↗
									</a>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

	{/if}
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 1.25rem; }

	.page-hdr h1 { font-family: var(--font-heading); font-size: 1.5rem; color: var(--color-text); }
	.sub { font-size: 0.82rem; color: var(--color-text-muted); margin-top: 0.25rem; }

	/* Loading */
	.loading { display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-muted); font-size: 0.875rem; }
	.spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--color-border-subtle); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.error-box { background: color-mix(in srgb, var(--color-error) 10%, transparent); border: 1px solid var(--color-error); border-radius: var(--radius-sm); padding: 0.75rem 1rem; color: var(--color-error); font-size: 0.875rem; }

	/* Search */
	.search-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
	.search-wrap { position: relative; flex: 1; max-width: 440px; }
	.search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); font-size: 0.875rem; pointer-events: none; }
	.search-input { width: 100%; padding: 0.5rem 2.25rem 0.5rem 2.25rem; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); color: var(--color-text); font-family: var(--font-body); font-size: 0.875rem; outline: none; transition: border-color 0.15s; }
	.search-input:focus { border-color: var(--color-primary); }
	.search-clear { position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-text-muted); font-size: 1rem; line-height: 1; padding: 0 0.2rem; }
	.result-count { font-size: 0.78rem; color: var(--color-text-muted); white-space: nowrap; font-family: var(--font-mono); }

	/* Category pills */
	.cat-row { display: flex; gap: 0.4rem; flex-wrap: wrap; }
	.cat-pill { display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.8rem; border-radius: 20px; border: 1px solid var(--color-border-subtle); background: none; color: var(--color-text-muted); font-family: var(--font-body); font-size: 0.78rem; cursor: pointer; transition: all 0.13s; white-space: nowrap; }
	.cat-pill:hover { border-color: var(--color-primary); color: var(--color-text); }
	.cat-pill.active { background: var(--pill-col, var(--color-primary)); color: #fff; border-color: var(--pill-col, var(--color-primary)); font-weight: 600; }
	.pill-count { font-family: var(--font-mono); font-size: 0.68rem; opacity: 0.8; }

	/* Empty state */
	.empty { text-align: center; padding: 3rem 1rem; color: var(--color-text-muted); display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
	.empty span { font-size: 2rem; }
	.empty p { font-size: 0.9rem; }
	.clear-btn { font-size: 0.8rem; color: var(--color-primary); background: none; border: 1px solid var(--color-primary); border-radius: var(--radius-sm); padding: 0.35rem 0.85rem; cursor: pointer; margin-top: 0.25rem; }

	/* Grid */
	.entry-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem; }

	/* Card */
	.entry-card { background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; transition: border-color 0.15s, box-shadow 0.15s; }
	.entry-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); }
	.card-accent { height: 3px; flex-shrink: 0; }
	.card-body { padding: 0.85rem; display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }

	/* Card internals */
	.card-head { display: flex; align-items: center; justify-content: space-between; }
	.cat-chip { font-size: 0.68rem; font-weight: 600; padding: 0.12rem 0.45rem; border-radius: 4px; border: 1px solid; }
	.status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-border-subtle); }
	.status-dot.active { background: #22c55e; }
	.card-title { font-family: var(--font-heading); font-size: 0.95rem; color: var(--color-text); line-height: 1.35; }
	.card-id { font-family: var(--font-mono); font-size: 0.65rem; color: var(--color-text-muted); }
	.card-desc { font-size: 0.75rem; color: var(--color-text-muted); line-height: 1.5; }
	.card-tags { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.15rem; }
	.tag { font-family: var(--font-mono); font-size: 0.6rem; padding: 0.1rem 0.35rem; background: var(--color-surface-raised, var(--color-border-subtle)); border: 1px solid var(--color-border-subtle); border-radius: 3px; color: var(--color-text-muted); cursor: pointer; transition: color 0.1s; }
	.tag:hover { color: var(--color-primary); border-color: var(--color-primary); }
	.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 0.45rem; }
	.card-date { font-family: var(--font-mono); font-size: 0.62rem; color: var(--color-text-muted); }
	.card-open { font-size: 0.75rem; color: var(--color-primary); text-decoration: none; padding: 0.18rem 0.55rem; border: 1px solid var(--color-primary); border-radius: 4px; transition: background 0.13s; }
	.card-open:hover { background: color-mix(in srgb, var(--color-primary) 12%, transparent); }
</style>
