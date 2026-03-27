<script lang="ts">
  import { onMount } from 'svelte';
  import { loadRegistries, knowledgeRegistry, treeRegistry, isLoading } from '$lib/stores/admin';

  onMount(() => loadRegistries());

  // ── All known content (mirrors content/ directory) ────────────────────────
  const EDUCATION_GUIDES = [
    { num:'01',  title:'Newborn Nursery Care Guide',                    file:'01_newborn_nursery_care_guide.docx',               icon:'👶', tags:['level-i','level-ii','comprehensive'] },
    { num:'01b', title:'Newborn Nursery Care Vol II',                   file:'01b_newborn_nursery_care_guide_vol_ii.docx',        icon:'👶', tags:['hypoglycemia','jaundice','sepsis'] },
    { num:'02',  title:'Well Baby to Critical Care',                    file:'02_well_baby_to_critical_care.docx',               icon:'🏥', tags:['new-grad','level-ii','critical-care'] },
    { num:'02b', title:'Advanced Procedures Vol II',                    file:'02b_advanced_procedures_vol_ii.docx',              icon:'🔧', tags:['procedures','advanced'] },
    { num:'03',  title:'Level II Nursing Skills',                       file:'03_level_ii_nursing_skills.docx',                  icon:'💉', tags:['level-ii','nursing-skills'] },
    { num:'04',  title:'Advanced Critical Care Expansion',              file:'04_advanced_critical_care.docx',                   icon:'🚨', tags:['mechanical-ventilation','critical-care'] },
    { num:'05',  title:'Level I & II Standardized Care Pathway',       file:'05_level_i_ii_care_pathway.docx',                  icon:'📋', tags:['pathway','standardized'] },
    { num:'06',  title:'NICU Care Pathways Comparative',               file:'06_nicu_care_pathways_comparative.docx',           icon:'🔬', tags:['comparative','12-hospitals'] },
    { num:'07',  title:'Rural Level II Care Pathways Vol II',          file:'07_rural_care_pathways_vol_ii.docx',               icon:'🏡', tags:['rural','level-ii'] },
    { num:'08',  title:'Rural Neonatal Stabilization Flowsheet',       file:'08_rural_stabilization_flowsheet.docx',            icon:'📊', tags:['transport','stabilization','NRP','STABLE'] },
    { num:'08b', title:'GA-Specific Stabilization Cheat Sheets',       file:'08b_ga_stabilization_cheat_sheets.docx',           icon:'📄', tags:['cheat-sheet','GA-specific'] },
    { num:'09',  title:'NICU Non-Invasive Ventilation Guide',          file:'09_nicu_niv_guide.docx',                           icon:'💨', tags:['NIV','CPAP','HFNC','BiPAP'] },
    { num:'10',  title:'PB980 Ventilation Guide',                      file:'10_pb980_ventilation_guide.docx',                  icon:'🫁', tags:['PB980','ventilator','settings'] },
    { num:'11',  title:'Feeding & Nutrition 30–35 wk',                 file:'11_feeding_growth_nutrition_30_35wk.docx',         icon:'🍼', tags:['nutrition','feeding','growth','NEC'] },
    { num:'12',  title:'Quality Metrics in Newborn Nurseries',         file:'12_quality_metrics_nursery.docx',                  icon:'📈', tags:['quality','metrics','PubMed'] },
    { num:'13',  title:'Meconium / MSAF / MAS Guide',                  file:'13_meconium_msaf_mas_guide.docx',                  icon:'🌿', tags:['meconium','MAS','iNO','ECMO'] },
    { num:'13b', title:'NEC Prevention & Management',                  file:'13_nec_prevention_staging_management.docx',        icon:'🔴', tags:['NEC','Bell staging','surgery'] },
    { num:'14a', title:'Critical Care Stabilization',                  file:'14_critical_care_stabilization.docx',              icon:'🚑', tags:['stabilization','transport'] },
    { num:'14b', title:'IVH Prevention & Management',                  file:'14_ivh_prevention_classification_management.docx', icon:'🧠', tags:['IVH','intraventricular','preterm'] },
    { num:'15a', title:'BPD Definition, Prevention & Management',      file:'15_bpd_definition_prevention_management.docx',     icon:'🫁', tags:['BPD','bronchopulmonary','chronic-lung'] },
    { num:'15b', title:'Maternal Infections',                          file:'15_maternal_infections.docx',                      icon:'🤰', tags:['GBS','chorioamnionitis','TORCH'] },
    { num:'16a', title:'Neonatal Ventilation Decision Tree',           file:'16_neonatal_ventilation_decision_tree.docx',       icon:'💨', tags:['ventilation','decision-tree','NIV'] },
    { num:'16b', title:'ROP Screening & Management',                   file:'16_rop_screening_classification_management.docx',  icon:'👁', tags:['ROP','retinopathy','laser'] },
    { num:'17',  title:'Sepsis EOS & LOS — Comprehensive',            file:'17_sepsis_eos_los_fungal_comprehensive.docx',      icon:'🦠', tags:['EOS','LOS','fungal','sepsis'] },
    { num:'18',  title:'Jaundice & Hyperbilirubinemia',               file:'18_jaundice_bilirubin_pathophysiology_management.docx',icon:'🟡', tags:['jaundice','bilirubin','phototherapy','exchange'] },
    { num:'19',  title:'HIE & Therapeutic Hypothermia',               file:'19_hie_asphyxia_cooling_management.docx',          icon:'🧊', tags:['HIE','cooling','hypothermia','neuroprotection'] },
    { num:'20',  title:'PDA — Pathophysiology & Treatment',           file:'20_pda_pathophysiology_screening_treatment.docx',  icon:'❤', tags:['PDA','indomethacin','ibuprofen','ligation'] },
    { num:'21',  title:'PPHN — Pathophysiology & Therapy',           file:'21_pphn_pathophysiology_oxygenation_therapy.docx', icon:'🫀', tags:['PPHN','iNO','sildenafil','ECMO'] },
    { num:'22',  title:'NAS/NOWS Assessment & Management',             file:'22_nas_nows_assessment_scoring_management.docx',   icon:'🍼', tags:['NAS','NOWS','Finnegan','ESC','methadone'] },
  ];

  const TEXTBOOKS = [
    { title:'Neonatal Endocrine Abnormalities',     file:'neonatal_endocrine_abnormalities_textbook.docx',       icon:'⚗️', has_audio: true  },
    { title:'Neonatal FEN',                          file:'neonatal_fen_textbook.docx',                           icon:'💧', has_audio: false },
    { title:'Neonatal GI & Liver',                   file:'neonatal_gi_liver_textbook.docx',                      icon:'🔬', has_audio: false },
    { title:'Neonatal Hematology',                   file:'neonatal_hematology_textbook.docx',                    icon:'🩸', has_audio: false },
    { title:'Neonatal Infectious Diseases',          file:'neonatal_infectious_diseases_textbook.docx',           icon:'🦠', has_audio: false },
    { title:'Neonatal Neurology',                    file:'neonatal_neurology_textbook.docx',                     icon:'🧠', has_audio: false },
    { title:'Neonatal Pulmonary Disorders',          file:'neonatal_pulmonary_disorders_textbook.docx',           icon:'🫁', has_audio: true  },
    { title:'Neonatal Renal',                        file:'neonatal_renal_textbook.docx',                         icon:'🫘', has_audio: false },
    { title:'Neonatal Skin',                         file:'neonatal_skin_textbook.docx',                          icon:'🩹', has_audio: false },
    { title:'Neonatal Surgical Emergencies',         file:'neonatal_surgical_emergencies_textbook.docx',          icon:'🔪', has_audio: false },
    { title:'Neonatal Urology',                      file:'neonatal_urology_textbook.docx',                       icon:'🏥', has_audio: false },
    { title:'Neonatal Ventilation Decision Tree',    file:'neonatal_ventilation_decision_tree_textbook.docx',     icon:'💨', has_audio: true  },
    { title:'Critical Care Stabilization',           file:'critical_care_stabilization_textbook.docx',            icon:'🚨', has_audio: true  },
    { title:'Maternal Infections',                   file:'maternal_infections_textbook.docx',                    icon:'🤰', has_audio: true  },
  ];

  // Which decision trees are related to which education guides (by tag overlap)
  const TREE_LINKS: Record<string, string[]> = {
    'NIV':          ['neonatal_pulmonary','neonatal_respiratory_escalation'],
    'RDS':          ['neonatal_pulmonary'],
    'NEC':          ['neonatal_gi_liver'],
    'sepsis':       ['neonatal_infectious_diseases','neonatal_eos_sepsis'],
    'EOS':          ['neonatal_eos_sepsis'],
    'seizures':     ['neonatal_neurology','neonatal_seizures'],
    'jaundice':     ['neonatal_endocrine'],
    'IVH':          ['neonatal_neurology'],
    'PDA':          ['neonatal_cardiac_pda'],
    'cooling':      ['neonatal_neurology'],
    'ventilation':  ['neonatal_pulmonary','neonatal_respiratory_escalation'],
    'airway':       ['pediatric_difficult_airway'],
    'PPHN':         ['neonatal_pulmonary','neonatal_respiratory_escalation'],
  };

  let activeTab: 'guides' | 'textbooks' = 'guides';
  let filterText = '';

  $: guides = EDUCATION_GUIDES.filter(g =>
    !filterText || g.title.toLowerCase().includes(filterText.toLowerCase()) ||
    g.tags.some(t => t.toLowerCase().includes(filterText.toLowerCase()))
  );
  $: textbooks = TEXTBOOKS.filter(t =>
    !filterText || t.title.toLowerCase().includes(filterText.toLowerCase())
  );

  function getTreeLinks(tags: string[]): string[] {
    const links = new Set<string>();
    for (const tag of tags) {
      const related = TREE_LINKS[tag] ?? [];
      related.forEach(l => links.add(l));
    }
    return Array.from(links);
  }
</script>

<div class="page">
  <div class="page-hdr">
    <div>
      <h1>Content Library</h1>
      <p>{EDUCATION_GUIDES.length} education guides · {TEXTBOOKS.length} textbooks · cross-linked to decision trees</p>
    </div>
  </div>

  <!-- Tab + search row -->
  <div class="toolbar">
    <div class="tabs">
      <button class="tab" class:active={activeTab==='guides'}
        on:click={() => activeTab='guides'}>
        📘 Education Guides <span class="tc">{EDUCATION_GUIDES.length}</span>
      </button>
      <button class="tab" class:active={activeTab==='textbooks'}
        on:click={() => activeTab='textbooks'}>
        📖 Textbooks <span class="tc">{TEXTBOOKS.length}</span>
      </button>
    </div>
    <input
      type="search" bind:value={filterText}
      placeholder="Filter by title or tag…"
      class="search"
    />
  </div>

  {#if $isLoading}
    <p class="loading">Loading…</p>
  {:else if activeTab === 'guides'}
    <div class="content-grid">
      {#each guides as g}
        {@const treeLinks = getTreeLinks(g.tags)}
        <div class="content-card">
          <div class="card-head">
            <span class="card-icon">{g.icon}</span>
            <div class="card-info">
              <div class="card-num">{g.num}</div>
              <div class="card-title">{g.title}</div>
            </div>
            <span class="card-badge guide">Guide</span>
          </div>

          <div class="card-tags">
            {#each g.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>

          {#if treeLinks.length}
            <div class="tree-links">
              <span class="tree-links-label">Linked trees:</span>
              {#each treeLinks as treeId}
                <a
                  href="/decision-trees/{treeId}_decision_tree.html"
                  target="_blank"
                  class="tree-link"
                >🌳 {treeId.replace(/_/g,' ')}</a>
              {/each}
            </div>
          {/if}

          <div class="card-file">{g.file}</div>
        </div>
      {/each}
    </div>

  {:else}
    <div class="content-grid">
      {#each textbooks as tb}
        <div class="content-card">
          <div class="card-head">
            <span class="card-icon">{tb.icon}</span>
            <div class="card-info">
              <div class="card-title">{tb.title}</div>
              <div class="card-file">{tb.file}</div>
            </div>
            <div class="badge-col">
              <span class="card-badge textbook">Textbook</span>
              {#if tb.has_audio}
                <span class="card-badge audio">🎧 Audio</span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page { max-width: 1100px; }
  .page-hdr { margin-bottom: 1rem; }
  .page-hdr h1 { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--text, #e6edf3); }
  .page-hdr p  { font-size: .78rem; color: var(--text3, #6e7681); margin-top: .25rem; }

  .toolbar { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: 1.1rem; }
  .tabs { display: flex; gap: 0; background: var(--bg3, #161b22); border-radius: 8px; padding: 3px; }
  .tab { padding: .35rem .9rem; border-radius: 6px; border: none; background: none; color: var(--text2, #8b949e); font-family: 'IBM Plex Sans', sans-serif; font-size: .8rem; cursor: pointer; display: flex; align-items: center; gap: .35rem; transition: all .13s; }
  .tab.active { background: var(--bg4, #1c2330); color: var(--tx, #e6edf3); font-weight: 600; }
  .tc { font-family: 'IBM Plex Mono', monospace; font-size: .65rem; background: var(--bdr, #21262d); padding: .1rem .4rem; border-radius: 10px; }
  .search { flex: 1; max-width: 340px; padding: .42rem .75rem; background: var(--bg3, #161b22); border: 1px solid var(--bdr2, #30363d); border-radius: 7px; color: var(--tx, #e6edf3); font-family: 'IBM Plex Sans', sans-serif; font-size: .82rem; outline: none; }
  .search:focus { border-color: var(--accent, #58a6ff); }
  .loading { color: var(--text2, #8b949e); font-size: .83rem; }

  .content-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: .75rem; }

  .content-card { background: var(--bg2, #0d1117); border: 1px solid var(--bdr, #21262d); border-radius: 10px; padding: .9rem 1rem; display: flex; flex-direction: column; gap: .4rem; transition: border-color .15s; }
  .content-card:hover { border-color: var(--accent, #58a6ff); }

  .card-head { display: flex; align-items: flex-start; gap: .65rem; }
  .card-icon { font-size: 1.4rem; flex-shrink: 0; }
  .card-info { flex: 1; min-width: 0; }
  .card-num  { font-family: 'IBM Plex Mono', monospace; font-size: .62rem; color: var(--text3, #6e7681); }
  .card-title { font-family: 'DM Serif Display', serif; font-size: .92rem; color: var(--tx, #e6edf3); line-height: 1.3; }
  .badge-col { display: flex; flex-direction: column; gap: .25rem; align-items: flex-end; flex-shrink: 0; }

  .card-badge { font-family: 'IBM Plex Mono', monospace; font-size: .6rem; font-weight: 600; padding: .12rem .45rem; border-radius: 4px; white-space: nowrap; }
  .card-badge.guide    { background: rgba(88,166,255,.12); color: #79c0ff; border: 1px solid rgba(88,166,255,.3); }
  .card-badge.textbook { background: rgba(227,179,65,.12);  color: #e3b341; border: 1px solid rgba(227,179,65,.3); }
  .card-badge.audio    { background: rgba(210,168,255,.12); color: #d2a8ff; border: 1px solid rgba(210,168,255,.3); }

  .card-tags { display: flex; flex-wrap: wrap; gap: .3rem; }
  .tag { font-family: 'IBM Plex Mono', monospace; font-size: .6rem; padding: .1rem .35rem; background: var(--bg3, #161b22); border: 1px solid var(--bdr, #21262d); border-radius: 3px; color: var(--text3, #6e7681); }

  .tree-links { display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; font-size: .72rem; }
  .tree-links-label { color: var(--text3, #6e7681); white-space: nowrap; }
  .tree-link { color: var(--accent, #58a6ff); text-decoration: none; font-size: .7rem; padding: .1rem .35rem; border: 1px solid var(--accent, #58a6ff)44; border-radius: 4px; transition: background .13s; }
  .tree-link:hover { background: rgba(88,166,255,.1); }

  .card-file { font-family: 'IBM Plex Mono', monospace; font-size: .62rem; color: var(--text3, #6e7681); word-break: break-all; }
</style>
