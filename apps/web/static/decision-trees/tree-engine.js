/**
 * tree-engine.js
 * Shared D3 rendering engine for all standalone clinical decision trees.
 *
 * Usage:
 *   <script src="../tree-engine.js"></script>
 *   <script>
 *     fetch('tree-data/my_tree.json')
 *       .then(r => r.json())
 *       .then(data => PedsCDSTree.init(data));
 *   </script>
 *
 * The engine reads CSS custom properties at runtime so it automatically
 * inherits the theme from theme-bridge.js (clinical-light / clinical-dark /
 * high-contrast). No inline colours anywhere.
 *
 * TreeData JSON schema: see tree-data/SCHEMA.md
 */

/* global d3 */

const PedsCDSTree = (() => {
  'use strict';

  // ── Colour mappings (read CSS vars at render time) ──────────────────────
  const NODE_VARS = {
    emergency:  { bg: '--red',    border: '--red',    text: '#fff' },
    urgent:     { bg: '--orange', border: '--orange', text: '#fff' },
    decision:   { bg: '--yellow', border: '--yellow', text: '#0a0f1a' },
    action:     { bg: '--green',  border: '--green',  text: '#fff' },
    assessment: { bg: '--blue',   border: '--blue',   text: '#fff' },
    diagnosis:  { bg: '--purple', border: '--purple', text: '#fff' },
  };
  const FALLBACK = {
    emergency:'#EF4444', urgent:'#F97316', decision:'#EAB308',
    action:'#22C55E', assessment:'#3B82F6', diagnosis:'#A855F7',
  };

  function cssVar(name) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || null;
  }
  function nodeColor(type) {
    const vars = NODE_VARS[type] || NODE_VARS.assessment;
    return cssVar(vars.bg) || FALLBACK[type] || '#3B82F6';
  }

  // ── Node dimensions ────────────────────────────────────────────────────
  const NW = 200, NH = 62, NR = 10;   // width, height, corner-radius

  // ── State ──────────────────────────────────────────────────────────────
  let svg, g, zoom, treeData, nodeIdCounter = 0;

  // ── Legacy format detection & normalisation ───────────────────────────
  // Legacy .js files use: { name, icon, type, sub, edge, info:{tabs,t0..}, children:[node,...] }
  // Schema .json files use: { id, label, type, description, panels:[...], children:[{label,node},...] }

  function isLegacyNode(node) {
    return node && typeof node.name === 'string' && !node.label;
  }

  let _nodeIdSeq = 0;
  function normalizeLegacyNode(node) {
    const label = (node.name || '').replace(/\n/g, ' ');
    const id = node.id || ('node-' + (++_nodeIdSeq));
    const description = node.sub || undefined;

    // Convert info tabs → panels
    let panels;
    if (node.info && node.info.tabs) {
      panels = node.info.tabs.map((tabLabel, i) => ({
        label: tabLabel,
        type: 'html',
        content: { html: node.info['t' + i] || '' },
      }));
    }

    // Convert flat children → edge-wrapped children
    let children;
    if (node.children && node.children.length) {
      children = node.children.map(child => ({
        label: child.edge || '',
        node: normalizeLegacyNode(child),
      }));
    }

    return { id, label, type: node.type || 'assessment', description, panels, children };
  }

  function normalizeData(data) {
    // Legacy format: root is the data itself (no .root wrapper)
    if (isLegacyNode(data)) {
      return { title: (data.name || '').replace(/\n/g, ' '), root: normalizeLegacyNode(data) };
    }
    // Legacy format with root wrapper
    if (data.root && isLegacyNode(data.root)) {
      return { ...data, root: normalizeLegacyNode(data.root) };
    }
    return data;
  }

  // ── Init ───────────────────────────────────────────────────────────────
  function init(data) {
    treeData = normalizeData(data);
    document.title = treeData.title || data.title || 'Clinical Decision Tree';

    // Inject shell HTML
    document.body.insertAdjacentHTML('afterbegin', shellHtml(data));

    // Wire controls
    document.getElementById('cds-reset')?.addEventListener('click', resetZoom);
    document.getElementById('cds-expand')?.addEventListener('click', expandAll);
    document.getElementById('cds-collapse')?.addEventListener('click', collapseAll);
    document.getElementById('cds-close-popup')?.addEventListener('click', closePopup);
    document.getElementById('cds-popup-overlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closePopup();
    });

    // Back button — go to referrer or decision tree listing
    const backBtn = document.getElementById('cds-back');
    if (backBtn) {
      const ref = document.referrer;
      if (ref && new URL(ref).origin === location.origin && !ref.includes(location.pathname)) {
        backBtn.setAttribute('href', ref);
      } else {
        // Default: go to parent directory (decision-trees listing) or SvelteKit app
        backBtn.setAttribute('href', '/reference/decision-trees');
      }
    }

    // Measure header + banner and build tree after layout settles
    // Use double-rAF to ensure shell.js banner has been injected and laid out
    requestAnimationFrame(() => requestAnimationFrame(() => {
      adjustHeaderOffset();
      buildTree();
    }));

    // Education panel (if edu-links.js present)
    if (window.PedsEduLinks && data.educationTopics) {
      window.PedsEduLinks.init(data.educationTopics);
    }
  }

  // ── Shell HTML ─────────────────────────────────────────────────────────
  function shellHtml(data) {
    const sourceBadge = data.source
      ? `<span class="cds-source-badge">${data.source}</span>` : '';
    const legend = Object.entries(NODE_VARS).map(([type]) =>
      `<span class="cds-leg-item">
         <span class="cds-leg-dot" data-type="${type}"></span>${capitalize(type)}
       </span>`
    ).join('');

    return `
<div id="cds-header">
  <div class="cds-hdr-left">
    <a id="cds-back" class="cds-btn cds-back-btn" title="Back to Decision Trees">← Back</a>
    <div class="cds-hdr-title-wrap">
      <h1 id="cds-title">${data.title || ''}</h1>
      <div class="cds-hdr-meta">
        ${sourceBadge}
        ${data.version ? `<span class="cds-version-badge">v${data.version}</span>` : ''}
      </div>
      ${data.subtitle ? `<div class="cds-subtitle">${data.subtitle}</div>` : ''}
    </div>
  </div>
  <div class="cds-hdr-right">
    <button id="cds-reset" class="cds-btn" title="Reset zoom">⟲ Reset</button>
    <button id="cds-expand" class="cds-btn">⊞ Expand</button>
    <button id="cds-collapse" class="cds-btn">⊟ Collapse</button>
  </div>
</div>
<svg id="cds-svg"></svg>
<div id="cds-legend">${legend}</div>
<div id="cds-popup-overlay">
  <div id="cds-popup">
    <div id="cds-popup-header">
      <div id="cds-popup-icon"></div>
      <div id="cds-popup-title-wrap">
        <div id="cds-popup-type"></div>
        <div id="cds-popup-title"></div>
      </div>
      <button id="cds-close-popup">×</button>
    </div>
    <div id="cds-popup-tabs"></div>
    <div id="cds-popup-body"></div>
  </div>
</div>`;
  }

  // ── Build tree ─────────────────────────────────────────────────────────
  function buildTree() {
    const svgEl = document.getElementById('cds-svg');
    const hdr = document.getElementById('cds-header');
    const banner = document.getElementById('ped-shell-banner');
    const headerH = (hdr ? hdr.offsetHeight : 0) + (banner ? banner.offsetHeight : 0);
    svg = d3.select(svgEl)
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight - headerH);

    zoom = d3.zoom()
      .scaleExtent([0.2, 3])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);

    g = svg.append('g');

    // Convert tree data to d3-hierarchy
    const root = d3.hierarchy(treeData.root, n => n.children?.map(e => e.node) || []);

    // Attach edge labels onto child nodes from the original data edges
    function attachEdgeLabels(node, parent) {
      if (!parent) return;
      const edge = parent.data.children?.find(e => e.node === node.data);
      if (edge) node.data._edgeLabel = edge.label;
      (node.children || []).forEach(c => attachEdgeLabels(c, node));
    }
    (root.children || []).forEach(c => attachEdgeLabels(c, root));

    // Collapse all except first two levels by default
    root.each(d => {
      if (d.depth >= 2 && d.children) {
        d._children = d.children;
        d.children = null;
      }
    });

    root.x0 = 0; root.y0 = 0;
    update(root);

    // Initial zoom to fit
    const initTransform = d3.zoomIdentity.translate(80, window.innerHeight / 2 - 40).scale(0.88);
    svg.call(zoom.transform, initTransform);
  }

  // ── Update (enter/exit/transition) ────────────────────────────────────
  let updateRoot; // store root ref for expand/collapse

  function update(source) {
    if (!updateRoot) updateRoot = source.ancestors().at(-1);
    const root = updateRoot;

    const layout = d3.tree().nodeSize([NH + 48, NW + 120]);
    layout(root);

    const nodes = root.descendants();
    const links = root.links();

    // Transpose: x = vertical, y = horizontal
    nodes.forEach(d => { d.y = d.depth * (NW + 120); });

    // ── Links ──────────────────────────────────────────────────────────
    const link = g.selectAll('path.cds-link')
      .data(links, d => d.target.data.id || (d.target.data.id = ++nodeIdCounter));

    const linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'cds-link')
      .attr('d', () => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    link.merge(linkEnter).transition().duration(320)
      .attr('d', d => diagonal(d.source, d.target));

    link.exit().transition().duration(320)
      .attr('d', () => {
        const o = { x: source.x, y: source.y };
        return diagonal(o, o);
      }).remove();

    // Edge labels (with multiline support and background pills)
    g.selectAll('g.cds-edge-group').remove();
    links.forEach(l => {
      if (!l.target.data._edgeLabel) return;
      const cx = (l.source.y + l.target.y) / 2 + NW / 2;
      const cy = (l.source.x + l.target.x) / 2;
      const lines = l.target.data._edgeLabel.split('\n');
      const lineH = 13;
      const totalH = lines.length * lineH;
      const maxLen = Math.max(...lines.map(s => s.length));
      const pillW = Math.max(maxLen * 6.5 + 16, 40);
      const pillH = totalH + 10;

      const grp = g.append('g').attr('class', 'cds-edge-group')
        .attr('transform', `translate(${cx},${cy - totalH / 2})`);

      grp.append('rect').attr('class', 'cds-edge-pill')
        .attr('x', -pillW / 2).attr('y', -8)
        .attr('width', pillW).attr('height', pillH)
        .attr('rx', 6);

      const txt = grp.append('text').attr('class', 'cds-edge-label')
        .attr('text-anchor', 'middle');

      lines.forEach((line, i) => {
        txt.append('tspan')
          .attr('x', 0)
          .attr('dy', i === 0 ? '0.35em' : lineH)
          .text(line);
      });
    });

    // ── Nodes ──────────────────────────────────────────────────────────
    const node = g.selectAll('g.cds-node')
      .data(nodes, d => d.data.id || (d.data.id = ++nodeIdCounter));

    const nodeEnter = node.enter().append('g')
      .attr('class', 'cds-node')
      .attr('transform', `translate(${source.y0},${source.x0})`)
      .style('opacity', 0)
      .on('click', (_, d) => toggle(d));

    // Background rect
    nodeEnter.append('rect')
      .attr('class', 'cds-node-rect')
      .attr('x', 0).attr('y', -NH / 2)
      .attr('width', NW).attr('height', NH)
      .attr('rx', NR);

    // Icon + labels
    nodeEnter.append('text').attr('class', 'cds-node-icon')
      .attr('x', 18).attr('y', -2)
      .text(d => iconFor(d.data.type));

    nodeEnter.append('text').attr('class', 'cds-node-label')
      .attr('x', NW / 2).attr('y', -7);

    nodeEnter.append('text').attr('class', 'cds-node-desc')
      .attr('x', NW / 2).attr('y', 12);

    // ⓘ info button
    nodeEnter.filter(d => d.data.panels?.length)
      .append('g').attr('class', 'cds-info-btn')
      .attr('transform', `translate(${NW - 20}, ${-NH / 2 + 14})`)
      .on('click', (e, d) => { e.stopPropagation(); openPopup(d.data); })
      .call(g => {
        g.append('circle').attr('r', 9);
        g.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle').text('i');
      });

    // Expand indicator
    nodeEnter.append('text').attr('class', 'cds-expand-indicator')
      .attr('x', NW - 8).attr('y', 4);

    // Merge + transition
    const nodeUpdate = node.merge(nodeEnter);
    nodeUpdate.transition().duration(320)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('opacity', 1);

    nodeUpdate.select('.cds-node-rect')
      .attr('fill', d => nodeColor(d.data.type))
      .attr('fill-opacity', d => d._children ? 0.65 : 0.9)
      .attr('stroke', d => nodeColor(d.data.type));

    nodeUpdate.select('.cds-node-label')
      .text(d => truncate(d.data.label, 28));

    nodeUpdate.select('.cds-node-desc')
      .text(d => d.data.description ? truncate(d.data.description, 34) : '');

    nodeUpdate.select('.cds-expand-indicator')
      .text(d => d._children ? `▸ ${d._children.length}` : '');

    node.exit().transition().duration(320)
      .attr('transform', `translate(${source.y},${source.x})`)
      .style('opacity', 0).remove();

    // Store previous positions
    nodes.forEach(d => { d.x0 = d.x; d.y0 = d.y; });
  }

  // ── Toggle expand/collapse ─────────────────────────────────────────────
  function toggle(d) {
    if (d.children) { d._children = d.children; d.children = null; }
    else if (d._children) { d.children = d._children; d._children = null; }
    update(d);
  }

  function expandAll() {
    if (!updateRoot) return;
    updateRoot.each(d => { if (d._children) { d.children = d._children; d._children = null; } });
    update(updateRoot);
  }

  function collapseAll() {
    if (!updateRoot) return;
    updateRoot.each(d => {
      if (d.depth > 0 && d.children) { d._children = d.children; d.children = null; }
    });
    update(updateRoot);
  }

  // ── Zoom ───────────────────────────────────────────────────────────────
  function resetZoom() {
    svg.transition().duration(500)
      .call(zoom.transform,
        d3.zoomIdentity.translate(80, window.innerHeight / 2 - 40).scale(0.88));
  }

  // ── Popup ──────────────────────────────────────────────────────────────
  function openPopup(nodeData) {
    const overlay = document.getElementById('cds-popup-overlay');
    document.getElementById('cds-popup-title').textContent = nodeData.label;
    document.getElementById('cds-popup-type').textContent = (nodeData.type || '').toUpperCase();
    document.getElementById('cds-popup-icon').textContent = iconFor(nodeData.type);
    document.getElementById('cds-popup-icon').style.background = nodeColor(nodeData.type);

    const tabsEl = document.getElementById('cds-popup-tabs');
    const bodyEl = document.getElementById('cds-popup-body');
    tabsEl.innerHTML = '';
    bodyEl.innerHTML = '';

    const panels = nodeData.panels || [];
    panels.forEach((panel, i) => {
      const btn = document.createElement('button');
      btn.className = 'cds-tab' + (i === 0 ? ' active' : '');
      btn.textContent = panel.label;
      btn.onclick = () => {
        tabsEl.querySelectorAll('.cds-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bodyEl.innerHTML = renderPanel(panel);
      };
      tabsEl.appendChild(btn);
    });

    bodyEl.innerHTML = panels.length ? renderPanel(panels[0]) : '';
    overlay.classList.add('open');
  }

  function closePopup() {
    document.getElementById('cds-popup-overlay')?.classList.remove('open');
  }

  // Close popup on Escape key
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

  function renderPanel(panel) {
    switch (panel.type) {
      case 'list': {
        const c = panel.content;
        const title = c.title ? `<p class="cds-panel-title">${c.title}</p>` : '';
        const tag = c.ordered ? 'ol' : 'ul';
        const items = (c.items || []).map(i => `<li>${i}</li>`).join('');
        return `${title}<${tag}>${items}</${tag}>`;
      }
      case 'table': {
        const c = panel.content;
        const caption = c.caption ? `<caption>${c.caption}</caption>` : '';
        const headers = (c.headers || []).map(h => `<th>${h}</th>`).join('');
        const rows = (c.rows || []).map(r =>
          `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('');
        return `<table class="cds-panel-table">${caption}<thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
      }
      case 'text': {
        const c = panel.content;
        const source = c.source ? `<p class="cds-panel-source">${c.source}</p>` : '';
        return `<p>${c.body || ''}</p>${source}`;
      }
      case 'alert': {
        const c = panel.content;
        return `<div class="cds-panel-alert cds-alert-${c.severity}">
          <strong>${c.title || ''}</strong><p>${c.body || ''}</p></div>`;
      }
      case 'dosing': {
        const c = panel.content;
        const drugs = (c.drugs || []).map(d => `<li>${d}</li>`).join('');
        const notes = c.notes ? `<p class="cds-panel-note">${c.notes}</p>` : '';
        return `<ul>${drugs}</ul>${notes}`;
      }
      case 'html': {
        // Legacy format: raw HTML content from inline tree data
        return panel.content.html || '';
      }
      default:
        return `<p>${JSON.stringify(panel.content)}</p>`;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  function diagonal(s, d) {
    const mx = (s.y + d.y) / 2;
    return `M${s.y + NW},${s.x}C${mx + NW},${s.x} ${mx},${d.x} ${d.y},${d.x}`;
  }

  const ICONS = {
    emergency: '🚨', urgent: '⚠️', decision: '❓',
    action: '✅', assessment: '🔍', diagnosis: '🎯',
  };
  function iconFor(type) { return ICONS[type] || '●'; }
  function truncate(s, n) { return s && s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

  // ── CSS injection ──────────────────────────────────────────────────────
  const STYLES = `
#cds-header{position:fixed;top:0;left:0;right:0;z-index:200;background:var(--bg,#0b1121);
  border-bottom:1px solid var(--border,#334155);padding:10px 16px;
  display:flex;align-items:center;justify-content:space-between;gap:12px}
.cds-hdr-left{display:flex;align-items:center;gap:12px}
.cds-hdr-title-wrap{display:flex;flex-direction:column}
.cds-hdr-left h1{font-family:'DM Serif Display',serif;font-size:1.15rem;
  color:var(--accent,#38bdf8);margin:0;line-height:1.3}
.cds-subtitle{font-size:.72rem;color:var(--text2,#94a3b8);margin-top:1px}
.cds-hdr-meta{display:flex;gap:6px;margin-top:3px}
.cds-source-badge,.cds-version-badge{font-family:'IBM Plex Mono',monospace;
  font-size:.65rem;padding:.15rem .5rem;border-radius:4px;
  background:var(--surface,#1e293b);border:1px solid var(--border,#334155);
  color:var(--text2,#94a3b8)}
.cds-back-btn{text-decoration:none;white-space:nowrap;flex-shrink:0;
  font-size:.85rem;font-weight:600;padding:8px 16px;border-radius:8px;
  background:var(--accent,#38bdf8);color:#0b1121;border-color:var(--accent,#38bdf8);
  transition:all .15s}
.cds-back-btn:hover{filter:brightness(1.15);transform:translateX(-2px)}
.cds-btn{background:var(--surface,#1e293b);border:1px solid var(--border,#334155);
  color:var(--text,#e2e8f0);padding:6px 14px;border-radius:7px;
  font-family:'IBM Plex Sans',sans-serif;font-size:.75rem;cursor:pointer}
.cds-btn:hover{border-color:var(--accent,#38bdf8);color:var(--accent,#38bdf8)}
#cds-svg{width:100vw;height:calc(100vh - var(--cds-header-h,70px));margin-top:var(--cds-header-h,70px);cursor:grab}
#cds-svg:active{cursor:grabbing}
.cds-link{fill:none;stroke:var(--border,#334155);stroke-width:1.8;stroke-opacity:.85}
.cds-node-rect{rx:10;stroke-width:1.5;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25));
  transition:filter .2s}
.cds-node:hover .cds-node-rect{filter:brightness(1.2) drop-shadow(0 0 12px rgba(56,189,248,.3))}
.cds-node-label{font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:11px;
  fill:#fff;text-anchor:middle;pointer-events:none}
.cds-node-desc{font-family:'IBM Plex Sans',sans-serif;font-size:8.5px;
  fill:rgba(255,255,255,.65);text-anchor:middle;pointer-events:none}
.cds-node-icon{font-size:14px;text-anchor:middle;dominant-baseline:middle;pointer-events:none}
.cds-expand-indicator{font-family:'IBM Plex Mono',monospace;font-size:8px;
  fill:rgba(255,255,255,.5);text-anchor:end;dominant-baseline:middle;pointer-events:none}
.cds-edge-label{font-family:'IBM Plex Sans',sans-serif;font-size:10.5px;font-weight:600;
  fill:var(--yellow,#fbbf24)}
.cds-edge-pill{fill:var(--bg,#0b1121);fill-opacity:.88;stroke:var(--border,#334155);stroke-width:.75;stroke-opacity:.5}
.cds-info-btn circle{fill:rgba(255,255,255,.15);stroke:rgba(255,255,255,.4);stroke-width:1}
.cds-info-btn text{font-family:'IBM Plex Mono',monospace;font-size:10px;
  font-weight:700;fill:#fff;pointer-events:none}
.cds-info-btn:hover circle{fill:rgba(255,255,255,.3)}
#cds-legend{position:fixed;bottom:12px;left:12px;
  background:var(--surface,#1e293b);border:1px solid var(--border,#334155);
  border-radius:10px;padding:8px 14px;display:flex;gap:12px;flex-wrap:wrap;z-index:50}
.cds-leg-item{display:flex;align-items:center;gap:5px;
  font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--text2,#94a3b8)}
.cds-leg-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.cds-leg-dot[data-type=emergency]{background:#EF4444}
.cds-leg-dot[data-type=urgent]{background:#F97316}
.cds-leg-dot[data-type=decision]{background:#EAB308}
.cds-leg-dot[data-type=action]{background:#22C55E}
.cds-leg-dot[data-type=assessment]{background:#3B82F6}
.cds-leg-dot[data-type=diagnosis]{background:#A855F7}
#cds-popup-overlay{display:none;position:fixed;inset:0;
  background:rgba(0,0,0,.7);backdrop-filter:blur(6px);z-index:200;
  justify-content:center;align-items:center}
#cds-popup-overlay.open{display:flex}
#cds-popup{background:var(--bg2,#0f172a);border:1px solid var(--border,#334155);
  border-radius:14px;max-width:680px;width:94vw;max-height:86vh;overflow-y:auto;
  box-shadow:0 40px 100px rgba(0,0,0,.7)}
#cds-popup-header{padding:18px 22px 12px;border-bottom:1px solid var(--border,#334155);
  display:flex;align-items:flex-start;gap:12px;position:sticky;top:0;
  background:var(--bg2,#0f172a);z-index:1;border-radius:14px 14px 0 0}
#cds-popup-icon{width:42px;height:42px;border-radius:10px;display:flex;
  align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
#cds-popup-type{font-family:'IBM Plex Mono',monospace;font-size:10px;
  font-weight:600;color:var(--text2,#94a3b8);text-transform:uppercase;
  letter-spacing:.07em;margin-bottom:3px}
#cds-popup-title{font-family:'DM Serif Display',serif;font-size:1.2rem;
  color:var(--text,#e2e8f0)}
#cds-close-popup{margin-left:auto;background:var(--surface,#1e293b);
  border:1px solid var(--border,#334155);color:var(--text2,#94a3b8);
  font-size:1.1rem;cursor:pointer;width:30px;height:30px;border-radius:7px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0}
#cds-close-popup:hover{border-color:var(--accent,#38bdf8);color:var(--accent,#38bdf8)}
#cds-popup-tabs{display:flex;gap:0;border-bottom:1px solid var(--border,#334155);
  padding:0 22px;overflow-x:auto}
.cds-tab{background:none;border:none;color:var(--text2,#94a3b8);
  font-family:'IBM Plex Sans',sans-serif;font-size:11px;font-weight:600;
  padding:9px 12px;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s}
.cds-tab.active{color:var(--accent,#38bdf8);border-bottom-color:var(--accent,#38bdf8)}
#cds-popup-body{padding:16px 22px 28px;font-family:'IBM Plex Sans',sans-serif;
  font-size:13px;color:var(--text2,#94a3b8);line-height:1.65}
.cds-panel-title{font-weight:600;color:var(--text,#e2e8f0);margin-bottom:8px}
.cds-panel-note{font-size:11px;color:var(--text3,#64748b);margin-top:8px}
.cds-panel-source{font-family:'IBM Plex Mono',monospace;font-size:10px;
  color:var(--text3,#64748b);margin-top:6px}
.cds-panel-table{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0}
.cds-panel-table th{text-align:left;font-size:10px;font-weight:700;
  color:var(--accent,#38bdf8);padding:7px 10px;
  border-bottom:1.5px solid var(--border,#334155);text-transform:uppercase}
.cds-panel-table td{padding:6px 10px;border-bottom:1px solid var(--border,#334155);
  font-family:'IBM Plex Mono',monospace;font-size:11px}
.cds-panel-alert{border-radius:8px;padding:10px 14px;margin:8px 0;font-size:12px}
.cds-alert-emergency{background:var(--rbg,#2a1215);border:1px solid #EF4444;color:#f87171}
.cds-alert-urgent{background:var(--obg,#2a1a0a);border:1px solid #F97316;color:#fb923c}
.cds-alert-warning{background:var(--ybg,#2a2006);border:1px solid #EAB308;color:#fbbf24}
.cds-alert-info{background:var(--bbg,#0f1d3a);border:1px solid #3B82F6;color:#60a5fa}
#cds-popup-body ul,#cds-popup-body ol{padding-left:18px;margin:6px 0}
#cds-popup-body li{margin-bottom:4px}
/* Legacy HTML panel content classes (used by converted tree data) */
#cds-popup-body .rt{width:100%;border-collapse:collapse;margin:8px 0 12px;font-size:12px}
#cds-popup-body .rt th{text-align:left;font-size:9.5px;font-weight:700;color:var(--accent,#38bdf8);padding:8px 10px;border-bottom:1.5px solid var(--border,#334155);text-transform:uppercase;letter-spacing:.6px;background:rgba(56,189,248,.04)}
#cds-popup-body .rt td{padding:7px 10px;border-bottom:1px solid rgba(51,65,85,.3);color:var(--text,#e2e8f0);font-family:'IBM Plex Mono',monospace;font-size:11px}
#cds-popup-body .rt td:first-child{font-family:'IBM Plex Sans',sans-serif;font-weight:500;color:var(--text2,#94a3b8)}
#cds-popup-body .dt{width:100%;border-collapse:collapse;margin:6px 0 10px}
#cds-popup-body .dt th{text-align:left;font-size:9px;font-weight:700;color:var(--text2,#94a3b8);padding:6px 8px;border-bottom:1px solid var(--border,#334155);text-transform:uppercase}
#cds-popup-body .dt td{font-size:11px;padding:6px 8px;border-bottom:1px solid rgba(51,65,85,.2);color:var(--text,#e2e8f0);vertical-align:top;line-height:1.5}
#cds-popup-body .bx{border-radius:10px;padding:12px 16px;font-size:12px;line-height:1.6;margin:10px 0}
#cds-popup-body .bx strong{color:inherit}
#cds-popup-body .br{background:var(--rbg,#2a1215);border:1px solid rgba(248,113,113,.25);color:#f87171}
#cds-popup-body .bg{background:var(--gbg,#0a2a1a);border:1px solid rgba(74,222,128,.25);color:#4ade80}
#cds-popup-body .bb{background:var(--bbg,#0f1d3a);border:1px solid rgba(96,165,250,.25);color:#60a5fa}
#cds-popup-body .bo{background:var(--obg,#2a1a0a);border:1px solid rgba(251,146,60,.25);color:#fb923c}
#cds-popup-body .bp{background:var(--pbg,#1a0f2e);border:1px solid rgba(192,132,252,.25);color:#c084fc}
#cds-popup-body .sl{counter-reset:stp;list-style:none!important;padding:0;margin:8px 0}
#cds-popup-body .sl li{counter-increment:stp;padding:5px 0 5px 32px!important;position:relative;font-size:12px;color:var(--text2,#94a3b8);line-height:1.55}
#cds-popup-body .sl li::before{content:counter(stp)!important;position:absolute;left:0;top:4px;width:22px;height:22px;border-radius:50%;background:var(--surface,#1e293b);border:1px solid var(--border,#334155);text-align:center;line-height:22px;font-size:10px;font-weight:700;color:var(--accent,#38bdf8)}
`;

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  // ── Header offset management ────────────────────────────────────────
  function adjustHeaderOffset() {
    const hdr = document.getElementById('cds-header');
    const banner = document.getElementById('ped-shell-banner');
    if (hdr) {
      const bannerH = banner ? banner.offsetHeight : 0;
      hdr.style.top = bannerH + 'px';
      const totalH = bannerH + hdr.offsetHeight;
      document.documentElement.style.setProperty('--cds-header-h', totalH + 'px');
      if (svg) {
        svg.attr('width', window.innerWidth).attr('height', window.innerHeight - totalH);
      }
    } else if (svg) {
      svg.attr('width', window.innerWidth).attr('height', window.innerHeight);
    }
  }

  window.addEventListener('resize', adjustHeaderOffset);

  return { init, expandAll, collapseAll, resetZoom, openPopup, closePopup };
})();
