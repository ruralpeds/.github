/**
 * PED CDS Theme Bridge
 * 
 * Include this script in any standalone HTML page (decision trees, calculators)
 * to inherit the theme choice from the main SvelteKit app.
 * 
 * Reads `ped-cds-theme` from localStorage and applies CSS custom properties.
 * Also adds a floating theme toggle so users can switch without returning to the app.
 * 
 * Usage: <script src="../theme-bridge.js"></script>  (from subdirectory)
 */

(function() {
  'use strict';

  var STORAGE_KEY = 'ped-cds-theme';
  var DEFAULT = 'clinical-light';

  var themes = {
    'clinical-light': {
      '--bg': '#FAFAF9', '--bg2': '#FFFFFF', '--surface': '#FFFFFF',
      '--surface2': '#F5F5F4', '--border': '#D6D3D1', '--border2': '#E7E5E4',
      '--text': '#1C1917', '--text2': '#44403C', '--text3': '#78716C',
      '--accent': '#1D4ED8', '--accent2': '#0891B2',
      '--red': '#DC2626', '--rbg': '#FEF2F2',
      '--orange': '#EA580C', '--obg': '#FFF7ED',
      '--yellow': '#CA8A04', '--ybg': '#FEFCE8',
      '--green': '#16A34A', '--gbg': '#F0FDF4',
      '--blue': '#2563EB', '--bbg': '#EFF6FF',
      '--purple': '#7C3AED', '--pbg': '#F5F3FF',
      '--shadow': 'rgba(28,25,23,0.08)',
      '--popbg': '#FFFFFF', '--popborder': '#D6D3D1',
      '--tabbg': '#F5F5F4', '--tabactive': '#1D4ED8',
      '--tabtext': '#78716C', '--tabtextactive': '#FFFFFF',
      '--inputbg': '#FFFFFF', '--inputborder': '#D6D3D1',
      isDark: false
    },
    'clinical-dark': {
      '--bg': '#0b1121', '--bg2': '#0f172a', '--surface': '#1e293b',
      '--surface2': '#111827', '--border': '#334155', '--border2': '#1e293b',
      '--text': '#e2e8f0', '--text2': '#94a3b8', '--text3': '#64748b',
      '--accent': '#38bdf8', '--accent2': '#22d3ee',
      '--red': '#f87171', '--rbg': '#2a1215',
      '--orange': '#fb923c', '--obg': '#2a1a0a',
      '--yellow': '#fbbf24', '--ybg': '#2a2006',
      '--green': '#4ade80', '--gbg': '#0a2a1a',
      '--blue': '#60a5fa', '--bbg': '#0f1d3a',
      '--purple': '#c084fc', '--pbg': '#1a0f2e',
      '--shadow': 'rgba(0,0,0,0.3)',
      '--popbg': '#0f172a', '--popborder': '#334155',
      '--tabbg': '#1e293b', '--tabactive': '#38bdf8',
      '--tabtext': '#64748b', '--tabtextactive': '#0b1121',
      '--inputbg': '#111827', '--inputborder': '#334155',
      isDark: true
    },
    'high-contrast': {
      '--bg': '#FFFFFF', '--bg2': '#FFFFFF', '--surface': '#FFFFFF',
      '--surface2': '#F3F4F6', '--border': '#000000', '--border2': '#6B7280',
      '--text': '#000000', '--text2': '#1F2937', '--text3': '#374151',
      '--accent': '#1D4ED8', '--accent2': '#0E7490',
      '--red': '#DC2626', '--rbg': '#FEF2F2',
      '--orange': '#EA580C', '--obg': '#FFF7ED',
      '--yellow': '#CA8A04', '--ybg': '#FEFCE8',
      '--green': '#16A34A', '--gbg': '#F0FDF4',
      '--blue': '#2563EB', '--bbg': '#EFF6FF',
      '--purple': '#7C3AED', '--pbg': '#F5F3FF',
      '--shadow': 'rgba(0,0,0,0.15)',
      '--popbg': '#FFFFFF', '--popborder': '#000000',
      '--tabbg': '#F3F4F6', '--tabactive': '#1D4ED8',
      '--tabtext': '#374151', '--tabtextactive': '#FFFFFF',
      '--inputbg': '#FFFFFF', '--inputborder': '#000000',
      isDark: false
    }
  };

  function getThemeId() {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT; }
    catch(e) { return DEFAULT; }
  }

  function applyTheme(id) {
    var t = themes[id] || themes[DEFAULT];
    var root = document.documentElement;
    for (var k in t) {
      if (k === 'isDark') continue;
      root.style.setProperty(k, t[k]);
    }
    // Set body background and color directly for pages that don't use vars
    document.body.style.backgroundColor = t['--bg'];
    document.body.style.color = t['--text'];

    // Update toggle button if present
    var btn = document.getElementById('ped-theme-toggle');
    if (btn) {
      btn.textContent = t.isDark ? '☀️' : '🌙';
      btn.title = 'Switch to ' + (t.isDark ? 'light' : 'dark') + ' theme';
    }

    try { localStorage.setItem(STORAGE_KEY, id); } catch(e) {}
  }

  function cycleTheme() {
    var order = ['clinical-light', 'clinical-dark', 'high-contrast'];
    var current = getThemeId();
    var idx = order.indexOf(current);
    var next = order[(idx + 1) % order.length];
    applyTheme(next);
  }

  // Create floating toggle button
  function createToggle() {
    var btn = document.createElement('button');
    btn.id = 'ped-theme-toggle';
    btn.onclick = cycleTheme;
    btn.style.cssText = 'position:fixed;top:14px;right:14px;z-index:300;width:36px;height:36px;border-radius:50%;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px var(--shadow);transition:all .2s;';
    document.body.appendChild(btn);
  }

  // Apply on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      applyTheme(getThemeId());
      createToggle();
    });
  } else {
    applyTheme(getThemeId());
    createToggle();
  }

  // Expose for external use
  window.pedTheme = { apply: applyTheme, cycle: cycleTheme, get: getThemeId };
})();
