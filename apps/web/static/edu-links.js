/**
 * PED CDS Education Links Panel
 * 
 * Include this script in any decision tree HTML to add the 📚 Education
 * Resources slide-out panel with links to related education guides,
 * textbooks, audio textbooks, and cheat sheets.
 *
 * Reads REGISTRY.json to auto-map the current tree's filename to its
 * related education documents. Falls back to universal links if
 * registry load fails.
 *
 * Usage: <script src="../edu-links.js"></script>  (after theme-bridge.js)
 *
 * API:
 *   pedEdu.open()    — open the panel
 *   pedEdu.close()   — close the panel
 *   pedEdu.toggle()  — toggle the panel
 *   pedEdu.setBaseUrl(url) — change link base (default: relative to content/)
 */
(function(){
  'use strict';

  // ===== CONFIGURATION =====
  var REGISTRY_URL = './REGISTRY.json';
  var GITHUB_BASE = 'https://github.com/timothyhartzog/Peds/blob/main/content';
  
  // Education guide number → metadata
  var EDU_GUIDE_MAP = {
    '01':  { title: 'Comprehensive Newborn Nursery Care', file: '01_newborn_nursery_care_guide.docx' },
    '01b': { title: 'Nursery Care Guide Vol II (Extended)', file: '01b_newborn_nursery_care_guide_vol_ii.docx' },
    '02':  { title: 'Well Baby to Critical Care', file: '02_well_baby_to_critical_care.docx' },
    '02b': { title: 'Advanced Procedures Vol II', file: '02b_advanced_procedures_vol_ii.docx' },
    '03':  { title: 'Level II Nursing Skills', file: '03_level_ii_nursing_skills.docx' },
    '04':  { title: 'Advanced Critical Care', file: '04_advanced_critical_care.docx' },
    '05':  { title: 'Level I & II Care Pathway', file: '05_level_i_ii_care_pathway.docx' },
    '06':  { title: 'NICU Care Pathways Comparative', file: '06_nicu_care_pathways_comparative.docx' },
    '07':  { title: 'Rural Care Pathways Vol II', file: '07_rural_care_pathways_vol_ii.docx' },
    '08':  { title: 'Rural Stabilization Flowsheet', file: '08_rural_stabilization_flowsheet.docx' },
    '08b': { title: 'GA Stabilization Cheat Sheets', file: '08b_ga_stabilization_cheat_sheets.docx' },
    '09':  { title: 'NICU Non-Invasive Ventilation', file: '09_nicu_niv_guide.docx' },
    '10':  { title: 'PB 980 Ventilation Guide', file: '10_pb980_ventilation_guide.docx' },
    '11':  { title: 'Feeding, Growth & Nutrition 30–35 wk', file: '11_feeding_growth_nutrition_30_35wk.docx' },
    '12':  { title: 'Quality Metrics in Nurseries', file: '12_quality_metrics_nursery.docx' },
    '13':  { title: 'NEC Prevention & Management', file: '13_nec_prevention_staging_management.docx' },
    '14':  { title: 'IVH Prevention & Classification', file: '14_ivh_prevention_classification_management.docx' },
    '15':  { title: 'BPD Definition & Management', file: '15_bpd_definition_prevention_management.docx' },
    '16':  { title: 'ROP Screening & Classification', file: '16_rop_screening_classification_management.docx' },
    '17':  { title: 'Sepsis: EOS, LOS, Fungal', file: '17_sepsis_eos_los_fungal_comprehensive.docx' },
    '18':  { title: 'Jaundice & Bilirubin Management', file: '18_jaundice_bilirubin_pathophysiology_management.docx' },
    '19':  { title: 'HIE, Asphyxia & Cooling', file: '19_hie_asphyxia_cooling_management.docx' },
    '20':  { title: 'PDA Pathophysiology & Treatment', file: '20_pda_pathophysiology_screening_treatment.docx' },
    '21':  { title: 'PPHN & Oxygenation Therapy', file: '21_pphn_pathophysiology_oxygenation_therapy.docx' },
    '22':  { title: 'NAS/NOWS Assessment & Management', file: '22_nas_nows_assessment_scoring_management.docx' }
  };

  // Textbook/audio/cheat-sheet slug → display name
  var CONTENT_NAMES = {
    'critical_care_stabilization': 'Critical Care Stabilization',
    'maternal_infections': 'Maternal Infections',
    'neonatal_endocrine_abnormalities': 'Neonatal Endocrine Abnormalities',
    'neonatal_fen': 'Neonatal FEN (Fluids, Electrolytes, Nutrition)',
    'neonatal_gi_liver': 'Neonatal GI & Liver',
    'neonatal_hematology': 'Neonatal Hematology',
    'neonatal_infectious_diseases': 'Neonatal Infectious Diseases',
    'neonatal_neurology': 'Neonatal Neurology',
    'neonatal_pulmonary_disorders': 'Neonatal Pulmonary Disorders',
    'neonatal_renal': 'Neonatal Renal',
    'neonatal_skin': 'Neonatal Skin',
    'neonatal_surgical_emergencies': 'Neonatal Surgical Emergencies',
    'neonatal_urology': 'Neonatal Urology',
    'neonatal_ventilation_decision_tree': 'Neonatal Ventilation'
  };

  var baseUrl = '../../content'; // relative from decision-trees/ to content/
  var panelEl = null;
  var isOpen = false;

  // ===== DETECT CURRENT TREE =====
  function getCurrentFilename() {
    var path = window.location.pathname;
    var parts = path.split('/');
    return parts[parts.length - 1] || 'index.html';
  }

  // ===== BUILD PANEL HTML =====
  function buildPanel(treeEntry) {
    var el = document.createElement('div');
    el.id = 'ped-edu-panel';
    el.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:min(370px,85vw);background:var(--surface,#fff);border-left:1px solid var(--border,#ddd);z-index:280;transform:translateX(100%);transition:transform .35s ease;display:flex;flex-direction:column;box-shadow:-6px 0 24px var(--shadow,rgba(0,0,0,.1));font-family:"IBM Plex Sans",sans-serif;';

    var html = '';
    // Header
    html += '<div style="padding:14px 18px;border-bottom:1px solid var(--border,#ddd);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">';
    html += '<span style="font-family:\'DM Serif Display\',serif;font-size:15px;color:var(--accent,#2563eb)">📚 Education Resources</span>';
    html += '<button onclick="pedEdu.close()" style="background:none;border:none;color:var(--text2,#888);font-size:18px;cursor:pointer;padding:2px 6px">&times;</button>';
    html += '</div>';

    // Body
    html += '<div style="flex:1;overflow-y:auto;padding:14px 18px">';

    if (treeEntry) {
      var links = treeEntry.education_links || {};

      // Literature review
      if (treeEntry.literature_review) {
        html += sectionHeader('🔬 Literature Review');
        html += eduLink('📄', 'Literature Review', treeEntry.literature_review.split('/').pop(), baseUrl + '/literature-reviews/' + treeEntry.literature_review.split('/').pop(), 'lit');
      }

      // Education guides
      var guides = links.education_guides || [];
      if (guides.length > 0) {
        html += sectionHeader('📖 Education Guides');
        guides.forEach(function(num) {
          var g = EDU_GUIDE_MAP[num];
          if (g) html += eduLink('📗', g.title, g.file, baseUrl + '/education-guides/' + g.file, 'docx');
        });
      }

      // Textbooks
      var tbs = links.textbooks || [];
      if (tbs.length > 0) {
        html += sectionHeader('📕 Textbooks');
        tbs.forEach(function(slug) {
          var name = CONTENT_NAMES[slug] || slug;
          html += eduLink('📕', name, slug + '_textbook.docx', baseUrl + '/textbooks/' + slug + '_textbook.docx', 'docx');
        });
      }

      // Audio textbooks
      var audio = links.audio_textbooks || [];
      if (audio.length > 0) {
        html += sectionHeader('🎧 Audio Textbooks');
        audio.forEach(function(slug) {
          var name = CONTENT_NAMES[slug] || slug;
          html += eduLink('🎧', name + ' (Audio)', slug + '_audio_textbook.docx', baseUrl + '/audio-textbooks/' + slug + '_audio_textbook.docx', 'audio');
        });
      }

      // Cheat sheets
      var cs = links.cheat_sheets || [];
      if (cs.length > 0) {
        html += sectionHeader('⚡ Cheat Sheets');
        cs.forEach(function(slug) {
          var name = CONTENT_NAMES[slug] || slug;
          html += eduLink('📋', name, slug + '_cheat_sheet.docx', baseUrl + '/cheat-sheets/' + slug + '_cheat_sheet.docx', 'docx');
        });
      }

      // If no specific links found
      if (guides.length === 0 && tbs.length === 0 && audio.length === 0 && cs.length === 0 && !treeEntry.literature_review) {
        html += '<div style="text-align:center;padding:24px;color:var(--text3,#999);font-size:13px">No topic-specific education materials mapped yet.<br><br>General resources are available in the repository.</div>';
      }
    } else {
      html += '<div style="text-align:center;padding:24px;color:var(--text3,#999);font-size:13px">Loading registry…</div>';
    }

    // Universal links
    html += sectionHeader('🏥 Core References');
    html += eduLink('📗', 'Comprehensive Newborn Nursery Care', '01', baseUrl + '/education-guides/01_newborn_nursery_care_guide.docx', 'docx');
    html += eduLink('📗', 'Level I & II Care Pathway', '05', baseUrl + '/education-guides/05_level_i_ii_care_pathway.docx', 'docx');
    html += eduLink('📗', 'Rural Stabilization Flowsheet', '08', baseUrl + '/education-guides/08_rural_stabilization_flowsheet.docx', 'docx');

    html += '</div>';

    // Footer
    html += '<div style="padding:10px 18px;border-top:1px solid var(--border,#ddd);flex-shrink:0">';
    html += '<a href="' + GITHUB_BASE + '" target="_blank" rel="noopener" style="font-size:11px;color:var(--accent,#2563eb);text-decoration:none">📂 Browse full library on GitHub →</a>';
    html += '</div>';

    el.innerHTML = html;
    return el;
  }

  function sectionHeader(text) {
    return '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text3,#999);margin:16px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--border,#eee)">' + text + '</div>';
  }

  function eduLink(icon, title, desc, href, badge) {
    var badgeColors = {
      'docx': 'color:var(--blue,#2563eb);background:var(--bbg,rgba(37,99,235,.1))',
      'lit': 'color:var(--purple,#9333ea);background:var(--pbg,rgba(168,85,247,.1))',
      'audio': 'color:var(--green,#16a34a);background:var(--gbg,rgba(34,197,94,.1))',
      'html': 'color:var(--yellow,#ca8a04);background:var(--ybg,rgba(234,179,8,.1))'
    };
    var bc = badgeColors[badge] || badgeColors.docx;
    var badgeLabel = badge === 'lit' ? 'Literature Review' : badge === 'audio' ? 'Audio' : badge === 'html' ? 'Interactive' : 'DOCX';
    
    return '<a href="' + href + '" style="display:flex;align-items:flex-start;gap:8px;padding:7px 8px;margin:2px 0;border-radius:6px;text-decoration:none;color:var(--text,#333);font-size:12px;line-height:1.35;transition:background .15s" onmouseover="this.style.background=\'var(--surface2,#f5f5f4)\'" onmouseout="this.style.background=\'transparent\'">' +
      '<span style="font-size:14px;flex-shrink:0;margin-top:1px">' + icon + '</span>' +
      '<span style="display:flex;flex-direction:column">' +
        '<span style="font-weight:500;color:var(--text,#333)">' + title + '</span>' +
        '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;font-weight:600;padding:1px 5px;border-radius:3px;margin-top:3px;text-transform:uppercase;letter-spacing:.4px;width:fit-content;' + bc + '">' + badgeLabel + '</span>' +
      '</span></a>';
  }

  // ===== TOGGLE BUTTON =====
  function createToggle() {
    var btn = document.createElement('button');
    btn.id = 'ped-edu-toggle';
    btn.textContent = '📚';
    btn.title = 'Education Resources';
    btn.onclick = function() { pedEdu.toggle(); };
    btn.style.cssText = 'position:fixed;bottom:60px;right:14px;z-index:270;width:36px;height:36px;border-radius:50%;border:1px solid var(--border,#ddd);background:var(--surface,#fff);color:var(--text,#333);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px var(--shadow,rgba(0,0,0,.08));transition:all .2s;';
    document.body.appendChild(btn);
  }

  // ===== INIT =====
  function init() {
    var filename = getCurrentFilename();
    
    // Try to load registry
    fetch(REGISTRY_URL).then(function(r) { return r.json(); }).then(function(registry) {
      var entry = null;
      if (registry && registry.trees) {
        entry = registry.trees.find(function(t) { return t.filename === filename; });
      }
      mount(entry);
    }).catch(function() {
      mount(null);
    });
  }

  function mount(entry) {
    panelEl = buildPanel(entry);
    document.body.appendChild(panelEl);
    createToggle();
  }

  // ===== PUBLIC API =====
  var pedEdu = {
    open: function() { if (panelEl) { panelEl.style.transform = 'translateX(0)'; isOpen = true; } },
    close: function() { if (panelEl) { panelEl.style.transform = 'translateX(100%)'; isOpen = false; } },
    toggle: function() { isOpen ? pedEdu.close() : pedEdu.open(); },
    setBaseUrl: function(url) { baseUrl = url; }
  };
  window.pedEdu = pedEdu;

  // Close on Escape
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && isOpen) pedEdu.close(); });

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
