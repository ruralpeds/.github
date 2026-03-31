<script lang="ts">
  import { onMount } from 'svelte';
  import { loadRegistries, treeRegistry, adminSearch, isLoading } from '$lib/stores/admin';

  onMount(() => loadRegistries());

  // Trees that have been migrated to JSON data layer (all 41 trees now have tree-data/*.json)
  const MIGRATED_TO_JSON = new Set([
    'neonatal_glucose_management', 'neonatal_cardiac_pda', 'neonatal_endocrine',
    'neonatal_fen', 'neonatal_gi_liver', 'neonatal_hematology', 'neonatal_infectious_diseases',
    'neonatal_neurology', 'neonatal_nows_nas', 'neonatal_pulmonary', 'neonatal_renal',
    'neonatal_skin', 'neonatal_surgical_emergencies', 'neonatal_transport', 'neonatal_urological',
    'neonatal_ophthalmology', 'neonatal_pain_sedation', 'newborn_discharge_readiness',
    'newborn_screening_followup', 'nrp_resuscitation', 'neonatal_eos_sepsis', 'neonatal_seizures',
    'neonatal_respiratory_escalation', 'neonatal_ivf_prescription_calculator',
    'obstetric_emergencies', 'shoulder_dystocia',
    'pals_algorithm', 'pediatric_abdominal_pain', 'pediatric_anaphylaxis', 'pediatric_burns',
    'pediatric_cardiac_emergencies', 'pediatric_dka', 'pediatric_orthopedic',
    'pediatric_psychiatric_emergencies', 'pediatric_respiratory_emergencies', 'pediatric_seizures',
    'pediatric_sepsis_shock', 'pediatric_siadh_csw', 'pediatric_toxicology', 'pediatric_trauma',
    'pediatric_difficult_airway',
  ]);

  $: trees = $treeRegistry?.trees ?? [];
  $: filtered = trees.filter(t =>
    !$adminSearch ||
    t.title.toLowerCase().includes($adminSearch.toLowerCase()) ||
    t.id.toLowerCase().includes($adminSearch.toLowerCase()) ||
    t.tags?.some(tag => tag.toLowerCase().includes($adminSearch.toLowerCase()))
  );

  $: migratedCount  = trees.filter(t => MIGRATED_TO_JSON.has(t.id)).length;
  $: monoCount      = trees.length - migratedCount;
  $: pctMigrated    = trees.length ? Math.round((migratedCount / trees.length) * 100) : 0;
</script>

<div class="page">
  <div class="page-hdr">
    <div>
      <h1>Decision Trees</h1>
      <p>{trees.length} trees registered · {migratedCount} migrated to JSON data layer · {monoCount} still monolithic</p>
    </div>
    <div class="progress-badge">
      <div class="progress-bar">
        <div class="progress-fill" style="width:{pctMigrated}%"></div>
      </div>
      <span>{pctMigrated}% data/viz separated</span>
    </div>
  </div>

  <div class="toolbar">
    <input
      type="search"
      bind:value={$adminSearch}
      placeholder="Search trees…"
      class="search-input"
    />
  </div>

  {#if $isLoading}
    <p class="loading">Loading…</p>
  {:else}
    <div class="tree-table">
      <div class="table-head">
        <span>Title</span>
        <span>Category</span>
        <span>Status</span>
        <span>Data Layer</span>
        <span>Actions</span>
      </div>

      {#each filtered as tree}
        {@const isMigrated = MIGRATED_TO_JSON.has(tree.id)}
        <div class="table-row" class:migrated={isMigrated}>
          <div class="row-title">
            <span class="row-id">{tree.id}</span>
            <span>{tree.title}</span>
            <div class="row-tags">
              {#each (tree.tags ?? []).slice(0,4) as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </div>
          <span class="row-cat cat-{tree.category}">{tree.category}</span>
          <span class="row-status status-{tree.status}">{tree.status}</span>
          <span class="row-layer" class:layer-done={isMigrated} class:layer-todo={!isMigrated}>
            {isMigrated ? '✅ JSON data file' : '⚠️ Monolithic HTML'}
          </span>
          <div class="row-actions">
            <a href="/decision-trees/{tree.filename}" target="_blank" class="action-btn">View</a>
            {#if !isMigrated}
              <span class="action-todo" title="Extract data to tree-data/{tree.id}.json">Migrate</span>
            {/if}
          </div>
        </div>
      {/each}

      {#if filtered.length === 0}
        <div class="empty">No trees match your search.</div>
      {/if}
    </div>

    <!-- Migration guide -->
    <div class="guide-box">
      <h3>📋 Migration Instructions</h3>
      <p>To separate a monolithic tree into data + engine:</p>
      <ol>
        <li>Extract the clinical data object from the HTML <code>&lt;script&gt;</code> tag</li>
        <li>Save it as <code>apps/web/static/decision-trees/tree-data/[id].json</code> matching the schema in <code>tree-data/SCHEMA.md</code></li>
        <li>Replace the HTML file content with the thin loader from <code>tree-loader-template.html</code></li>
        <li>Update <code>DATA_FILE</code> in the loader to point to the new JSON</li>
        <li>Mark the tree as migrated in this admin panel</li>
      </ol>
    </div>
  {/if}
</div>

<style>
  .page { max-width: 1100px; }
  .page-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: .75rem; }
  .page-hdr h1 { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--text, #e2e8f0); }
  .page-hdr p  { font-size: .78rem; color: var(--text2, #94a3b8); margin-top: .25rem; }

  .progress-badge { display: flex; flex-direction: column; align-items: flex-end; gap: .3rem; }
  .progress-bar { width: 180px; height: 6px; background: var(--border, #334155); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; background: #3b82f6; border-radius: 3px; transition: width .4s; }
  .progress-badge span { font-family: 'IBM Plex Mono', monospace; font-size: .7rem; color: var(--text2, #94a3b8); }

  .toolbar { margin-bottom: 1rem; }
  .search-input { width: 100%; max-width: 380px; padding: .45rem .75rem; background: var(--surface, #1e293b); border: 1px solid var(--border, #334155); border-radius: 7px; color: var(--text, #e2e8f0); font-family: 'IBM Plex Sans', sans-serif; font-size: .83rem; outline: none; }
  .search-input:focus { border-color: var(--accent, #38bdf8); }

  .loading { color: var(--text2, #94a3b8); font-family: 'IBM Plex Mono', monospace; font-size: .83rem; }

  .tree-table { border: 1px solid var(--border, #334155); border-radius: 10px; overflow: hidden; }
  .table-head, .table-row { display: grid; grid-template-columns: 2fr .7fr .6fr 1fr .6fr; gap: .75rem; padding: .65rem 1rem; align-items: center; }
  .table-head { background: var(--bg2, #0f172a); font-family: 'IBM Plex Mono', monospace; font-size: .65rem; text-transform: uppercase; letter-spacing: .07em; color: var(--text3, #64748b); border-bottom: 1px solid var(--border, #334155); }
  .table-row { border-bottom: 1px solid var(--border, #334155); background: var(--surface, #1e293b); transition: background .13s; }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: var(--bg2, #0f172a); }
  .table-row.migrated { background: rgba(34,197,94,.04); }

  .row-title { display: flex; flex-direction: column; gap: .2rem; min-width: 0; }
  .row-id { font-family: 'IBM Plex Mono', monospace; font-size: .65rem; color: var(--text3, #64748b); }
  .row-title > span:not(.row-id) { font-size: .82rem; color: var(--text, #e2e8f0); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-tags { display: flex; gap: .3rem; flex-wrap: wrap; margin-top: .15rem; }
  .tag { font-family: 'IBM Plex Mono', monospace; font-size: .6rem; padding: .1rem .35rem; background: var(--bg, #0b1121); border: 1px solid var(--border, #334155); border-radius: 4px; color: var(--text3, #64748b); }

  .row-cat { font-family: 'IBM Plex Mono', monospace; font-size: .7rem; padding: .15rem .45rem; border-radius: 5px; background: var(--bg, #0b1121); color: var(--text2, #94a3b8); }
  .row-status { font-family: 'IBM Plex Mono', monospace; font-size: .7rem; }
  .status-complete { color: #4ade80; }
  .status-draft    { color: #fbbf24; }

  .row-layer { font-size: .75rem; }
  .layer-done { color: #4ade80; }
  .layer-todo { color: #f59e0b; }

  .row-actions { display: flex; gap: .4rem; flex-wrap: wrap; }
  .action-btn { font-size: .72rem; color: var(--accent, #38bdf8); text-decoration: none; padding: .18rem .5rem; border: 1px solid var(--accent, #38bdf8); border-radius: 4px; }
  .action-btn:hover { background: rgba(56,189,248,.12); }
  .action-todo { font-family: 'IBM Plex Mono', monospace; font-size: .7rem; color: var(--text3, #64748b); cursor: default; padding: .18rem .5rem; border: 1px solid var(--border, #334155); border-radius: 4px; }

  .empty { padding: 1.5rem; text-align: center; color: var(--text3, #64748b); font-size: .82rem; }

  .guide-box { margin-top: 1.5rem; background: var(--bg2, #0f172a); border: 1px solid var(--border, #334155); border-radius: 10px; padding: 1.1rem 1.25rem; }
  .guide-box h3 { font-family: 'DM Serif Display', serif; font-size: 1rem; color: var(--text, #e2e8f0); margin-bottom: .65rem; }
  .guide-box p { font-size: .8rem; color: var(--text2, #94a3b8); margin-bottom: .5rem; }
  .guide-box ol { padding-left: 1.25rem; }
  .guide-box li { font-size: .8rem; color: var(--text2, #94a3b8); margin-bottom: .35rem; line-height: 1.6; }
  .guide-box code { font-family: 'IBM Plex Mono', monospace; font-size: .75rem; background: var(--surface, #1e293b); padding: .1rem .35rem; border-radius: 4px; color: var(--accent, #38bdf8); }
</style>
