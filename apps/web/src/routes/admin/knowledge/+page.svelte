<script lang="ts">
  import { onMount } from 'svelte';
  import {
    loadRegistries, filteredEntries, registryStats,
    adminSearch, activeCategory, isLoading,
    type KnowledgeEntry
  } from '$lib/stores/admin';

  onMount(() => loadRegistries());

  const CATEGORIES = [
    { id: 'all',              label: 'All' },
    { id: 'module',           label: '🔧 Modules' },
    { id: 'decision_tree',    label: '🌳 Trees' },
    { id: 'education_guide',  label: '📘 Guides' },
    { id: 'textbook',         label: '📖 Textbooks' },
    { id: 'audio_textbook',   label: '🎧 Audio' },
    { id: 'calculator',       label: '🧮 Calculators' },
    { id: 'literature_review',label: '🔬 Reviews' },
    { id: 'protocol',         label: '📋 Protocols' },
  ];

  function statusColor(status: string) {
    return status === 'active' ? '#4ade80' : status === 'draft' ? '#fbbf24' : '#64748b';
  }
</script>

<div class="page">
  <div class="page-hdr">
    <div>
      <h1>Knowledge Registry</h1>
      <p>{$registryStats?.total ?? 0} entries · single source of truth for all project artifacts</p>
    </div>
  </div>

  <!-- Category filter pills -->
  <div class="cat-pills">
    {#each CATEGORIES as cat}
      {@const count = cat.id === 'all'
        ? $registryStats?.total
        : $registryStats?.byCategory[cat.id] ?? 0}
      <button
        class="cat-pill"
        class:active={$activeCategory === cat.id}
        on:click={() => activeCategory.set(cat.id)}
      >
        {cat.label}
        {#if count !== undefined}
          <span class="pill-count">{count}</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Search -->
  <div class="toolbar">
    <input
      type="search"
      bind:value={$adminSearch}
      placeholder="Search by title, ID, or tag…"
      class="search-input"
    />
    <span class="result-count">{$filteredEntries.length} results</span>
  </div>

  {#if $isLoading}
    <p class="loading">Loading registry…</p>
  {:else}
    <div class="entry-grid">
      {#each $filteredEntries as entry}
        <div class="entry-card">
          <div class="entry-head">
            <span class="entry-cat">{entry.category}</span>
            <span class="entry-status" style="color:{statusColor(entry.status)}">{entry.status}</span>
          </div>
          <div class="entry-title">{entry.title}</div>
          <div class="entry-id">{entry.id}</div>
          {#if entry.description}
            <div class="entry-desc">{entry.description}</div>
          {/if}
          {#if entry.path}
            <div class="entry-path">{entry.path}</div>
          {/if}
          {#if entry.tags?.length}
            <div class="entry-tags">
              {#each (entry.tags ?? []).slice(0, 6) as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          {/if}
          <div class="entry-meta">
            {#if entry.created}
              <span>Created: {entry.created.slice(0,10)}</span>
            {/if}
          </div>
        </div>
      {/each}

      {#if $filteredEntries.length === 0}
        <div class="empty">No entries match your search.</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .page { max-width: 1100px; }
  .page-hdr { margin-bottom: 1.1rem; }
  .page-hdr h1 { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--text, #e2e8f0); }
  .page-hdr p  { font-size: .78rem; color: var(--text2, #94a3b8); margin-top: .25rem; }

  .cat-pills { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: 1rem; }
  .cat-pill { display: flex; align-items: center; gap: .4rem; padding: .3rem .8rem; border-radius: 20px; border: 1px solid var(--border, #334155); background: none; color: var(--text2, #94a3b8); font-family: 'IBM Plex Sans', sans-serif; font-size: .78rem; cursor: pointer; transition: all .13s; }
  .cat-pill:hover { border-color: var(--accent, #38bdf8); color: var(--text, #e2e8f0); }
  .cat-pill.active { background: var(--accent, #38bdf8); color: #000; border-color: var(--accent, #38bdf8); font-weight: 600; }
  .pill-count { font-family: 'IBM Plex Mono', monospace; font-size: .65rem; }

  .toolbar { display: flex; align-items: center; gap: .75rem; margin-bottom: 1rem; }
  .search-input { width: 100%; max-width: 400px; padding: .45rem .75rem; background: var(--surface, #1e293b); border: 1px solid var(--border, #334155); border-radius: 7px; color: var(--text, #e2e8f0); font-family: 'IBM Plex Sans', sans-serif; font-size: .83rem; outline: none; }
  .search-input:focus { border-color: var(--accent, #38bdf8); }
  .result-count { font-family: 'IBM Plex Mono', monospace; font-size: .72rem; color: var(--text3, #64748b); white-space: nowrap; }

  .loading { color: var(--text2, #94a3b8); font-family: 'IBM Plex Mono', monospace; font-size: .83rem; }

  .entry-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: .8rem; }
  .entry-card { background: var(--surface, #1e293b); border: 1px solid var(--border, #334155); border-radius: 10px; padding: .9rem 1rem; display: flex; flex-direction: column; gap: .3rem; transition: border-color .15s; }
  .entry-card:hover { border-color: var(--accent, #38bdf8); }

  .entry-head { display: flex; justify-content: space-between; align-items: center; }
  .entry-cat { font-family: 'IBM Plex Mono', monospace; font-size: .62rem; padding: .12rem .45rem; background: var(--bg, #0b1121); border: 1px solid var(--border, #334155); border-radius: 4px; color: var(--accent, #38bdf8); }
  .entry-status { font-family: 'IBM Plex Mono', monospace; font-size: .62rem; font-weight: 600; text-transform: uppercase; }

  .entry-title { font-family: 'DM Serif Display', serif; font-size: .95rem; color: var(--text, #e2e8f0); line-height: 1.35; }
  .entry-id { font-family: 'IBM Plex Mono', monospace; font-size: .65rem; color: var(--text3, #64748b); }
  .entry-desc { font-size: .76rem; color: var(--text2, #94a3b8); line-height: 1.55; }
  .entry-path { font-family: 'IBM Plex Mono', monospace; font-size: .65rem; color: var(--text3, #64748b); word-break: break-all; }

  .entry-tags { display: flex; gap: .3rem; flex-wrap: wrap; }
  .tag { font-family: 'IBM Plex Mono', monospace; font-size: .6rem; padding: .1rem .35rem; background: var(--bg, #0b1121); border: 1px solid var(--border, #334155); border-radius: 4px; color: var(--text3, #64748b); }

  .entry-meta { font-family: 'IBM Plex Mono', monospace; font-size: .62rem; color: var(--text3, #64748b); margin-top: .15rem; }

  .empty { padding: 2rem; text-align: center; color: var(--text3, #64748b); font-size: .82rem; grid-column: 1 / -1; }
</style>
