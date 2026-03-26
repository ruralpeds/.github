<script lang="ts">
  import { onMount } from 'svelte';
  import {
    loadRegistries, registryStats, contentGaps,
    treeRegistry, knowledgeRegistry, isLoading, adminError
  } from '$lib/stores/admin';

  onMount(() => loadRegistries());

  const CATEGORY_LABELS: Record<string, string> = {
    module:            '🔧 Rust Modules',
    decision_tree:     '🌳 Decision Trees',
    education_guide:   '📘 Education Guides',
    textbook:          '📖 Textbooks',
    audio_textbook:    '🎧 Audio Textbooks',
    calculator:        '🧮 Calculators',
    literature_review: '🔬 Literature Reviews',
    protocol:          '📋 Protocols',
    source_document:   '📄 Source Documents',
  };

  const CATEGORY_GOALS: Record<string, number> = {
    module: 60, decision_tree: 38, education_guide: 28,
    textbook: 17, audio_textbook: 5, calculator: 5,
    literature_review: 3, protocol: 10, source_document: 15,
  };
</script>

<div class="dash">
  <div class="dash-hdr">
    <h1>Admin Dashboard</h1>
    <p>Peds Clinical Decision Support — content status &amp; coverage</p>
  </div>

  {#if $isLoading}
    <div class="loading">Loading registries…</div>
  {:else if $adminError}
    <div class="error-box">{$adminError}</div>
  {:else}

    <!-- ── Stats row ── -->
    {#if $registryStats}
      <div class="stats-row">
        <div class="stat-card accent">
          <div class="stat-val">{$registryStats.total}</div>
          <div class="stat-lbl">Total Knowledge Entries</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">{$treeRegistry?.trees.length ?? 0}</div>
          <div class="stat-lbl">Decision Trees</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">{$registryStats.byCategory['module'] ?? 0}</div>
          <div class="stat-lbl">Rust Modules</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">{$registryStats.byCategory['education_guide'] ?? 0}</div>
          <div class="stat-lbl">Education Guides</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">
            {$registryStats.byCategory['textbook'] ?? 0}
          </div>
          <div class="stat-lbl">Textbooks</div>
        </div>
      </div>
    {/if}

    <!-- ── Gap alerts ── -->
    {#if $contentGaps?.gaps.length}
      <div class="section">
        <h2 class="section-title">⚠️ Gaps &amp; Action Items</h2>
        <div class="gap-list">
          {#each $contentGaps.gaps as gap}
            <div class="gap-item gap-{gap.severity}">
              <div class="gap-msg">{gap.message}</div>
              <div class="gap-action">→ {gap.action}</div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- ── Category coverage bars ── -->
    {#if $registryStats}
      <div class="section">
        <h2 class="section-title">📊 Registry Coverage</h2>
        <div class="coverage-grid">
          {#each Object.entries(CATEGORY_LABELS) as [cat, label]}
            {@const count = $registryStats.byCategory[cat] ?? 0}
            {@const goal  = CATEGORY_GOALS[cat] ?? count}
            {@const pct   = Math.min(Math.round((count / goal) * 100), 100)}
            <div class="cov-row">
              <div class="cov-label">{label}</div>
              <div class="cov-bar-wrap">
                <div class="cov-bar" style="width:{pct}%;background:{pct>=100?'#22c55e':pct>60?'#3b82f6':'#f59e0b'}"></div>
              </div>
              <div class="cov-count">{count}/{goal}</div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- ── High priority to-dos ── -->
    <div class="section">
      <h2 class="section-title">🔴 High Priority Tasks</h2>
      <div class="todo-list">
        {#if $contentGaps}
          <div class="todo-item">
            <div class="todo-badge todo-high">HIGH</div>
            <div class="todo-body">
              <strong>Separate data from visualization</strong> in standalone HTML trees
              <div class="todo-detail">
                {$contentGaps.treesMono} trees still monolithic →
                migrate to <code>tree-data/*.json</code> + <code>tree-engine.js</code>
              </div>
            </div>
            <a href="/admin/trees" class="todo-btn">Manage →</a>
          </div>
        {/if}
        <div class="todo-item">
          <div class="todo-badge todo-high">HIGH</div>
          <div class="todo-body">
            <strong>Admin module</strong> — this module ✅ Now complete
          </div>
        </div>
        <div class="todo-item">
          <div class="todo-badge todo-done">DONE</div>
          <div class="todo-body">
            <strong>Knowledge registry population</strong> — 150 entries indexed
          </div>
        </div>
        <div class="todo-item">
          <div class="todo-badge todo-med">MED</div>
          <div class="todo-body">
            <strong>Wire IVF calculator to rust-sci-core WASM engine</strong>
            <div class="todo-detail">ped-wasm bindings needed for neonatal_ivf_prescription_calculator.html</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">ℹ️ Registry Info</h2>
      <div class="info-row">
        <span>Last updated:</span>
        <span>{$registryStats?.lastUpdated ?? '—'}</span>
      </div>
      <div class="info-row">
        <span>Tree registry last updated:</span>
        <span>{$treeRegistry?.last_updated ?? '—'}</span>
      </div>
    </div>

  {/if}
</div>

<style>
  .dash { max-width: 960px; }
  .dash-hdr { margin-bottom: 1.5rem; }
  .dash-hdr h1 { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: var(--text, #e2e8f0); }
  .dash-hdr p  { font-size: .8rem; color: var(--text2, #94a3b8); margin-top: .25rem; }

  .loading { color: var(--text2, #94a3b8); font-family: 'IBM Plex Mono', monospace; font-size: .85rem; }
  .error-box { background: rgba(239,68,68,.1); border: 1px solid #ef4444; border-radius: 8px; padding: .75rem 1rem; color: #f87171; font-size: .83rem; }

  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .8rem; margin-bottom: 1.5rem; }
  .stat-card { background: var(--surface, #1e293b); border: 1px solid var(--border, #334155); border-radius: 10px; padding: .9rem 1rem; }
  .stat-card.accent { border-color: var(--accent, #38bdf8); }
  .stat-val { font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace; font-size: 1.8rem; font-weight: 700; color: var(--accent, #38bdf8); line-height: 1; }
  .stat-lbl { font-size: .72rem; color: var(--text2, #94a3b8); margin-top: .25rem; }

  .section { margin-bottom: 1.75rem; }
  .section-title { font-family: 'IBM Plex Mono', monospace; font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: var(--text2, #94a3b8); margin-bottom: .75rem; }

  .gap-list { display: flex; flex-direction: column; gap: .5rem; }
  .gap-item { padding: .65rem .9rem; border-radius: 8px; border-left: 3px solid; }
  .gap-high { background: rgba(239,68,68,.08); border-color: #ef4444; }
  .gap-medium { background: rgba(245,158,11,.08); border-color: #f59e0b; }
  .gap-msg { font-size: .82rem; color: var(--text, #e2e8f0); font-weight: 500; }
  .gap-action { font-family: 'IBM Plex Mono', monospace; font-size: .72rem; color: var(--text2, #94a3b8); margin-top: .2rem; }

  .coverage-grid { display: flex; flex-direction: column; gap: .5rem; }
  .cov-row { display: grid; grid-template-columns: 200px 1fr 60px; align-items: center; gap: .75rem; }
  .cov-label { font-size: .78rem; color: var(--text2, #94a3b8); }
  .cov-bar-wrap { height: 6px; background: var(--border, #334155); border-radius: 3px; overflow: hidden; }
  .cov-bar { height: 100%; border-radius: 3px; transition: width .4s; }
  .cov-count { font-family: 'IBM Plex Mono', monospace; font-size: .72rem; color: var(--text2, #94a3b8); text-align: right; }

  .todo-list { display: flex; flex-direction: column; gap: .55rem; }
  .todo-item { display: flex; align-items: flex-start; gap: .75rem; padding: .7rem .9rem; background: var(--surface, #1e293b); border: 1px solid var(--border, #334155); border-radius: 8px; }
  .todo-badge { font-family: 'IBM Plex Mono', monospace; font-size: .6rem; font-weight: 700; padding: .15rem .5rem; border-radius: 4px; white-space: nowrap; flex-shrink: 0; }
  .todo-high { background: rgba(239,68,68,.15); color: #f87171; border: 1px solid #ef444455; }
  .todo-med  { background: rgba(245,158,11,.15); color: #fbbf24; border: 1px solid #f59e0b55; }
  .todo-done { background: rgba(34,197,94,.15);  color: #4ade80;  border: 1px solid #22c55e55; }
  .todo-body { flex: 1; font-size: .82rem; color: var(--text, #e2e8f0); }
  .todo-body strong { font-weight: 600; }
  .todo-detail { font-size: .73rem; color: var(--text2, #94a3b8); margin-top: .2rem; }
  .todo-detail code { font-family: 'IBM Plex Mono', monospace; font-size: .7rem; background: var(--bg, #0b1121); padding: .1rem .3rem; border-radius: 3px; }
  .todo-btn { font-size: .75rem; color: var(--accent, #38bdf8); text-decoration: none; flex-shrink: 0; align-self: center; }

  .info-row { display: flex; gap: 1rem; font-size: .78rem; color: var(--text2, #94a3b8); font-family: 'IBM Plex Mono', monospace; padding: .35rem 0; border-bottom: 1px solid var(--border, #334155); }
  .info-row span:first-child { color: var(--text3, #64748b); min-width: 200px; }
</style>
