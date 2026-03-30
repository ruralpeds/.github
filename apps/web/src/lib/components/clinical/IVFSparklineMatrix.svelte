<script lang="ts">
  /**
   * IVFSparklineMatrix.svelte
   * ──────────────────────────
   * Sparkline decision matrix with a GA-at-birth banner selector.
   *
   * Banner: individual gestational age weeks (22–40) grouped by category.
   * Selecting a week filters the grid to show only the 5 condition
   * sparkline cards for that GA group.
   *
   * DOL slider cross-highlights all visible sparklines simultaneously,
   * updating rate readouts, tier badges, and progress bars reactively.
   *
   * Data source: Vermont Oxford Network, AAP, Cloherty & Stark 8th ed.
   *
   * Usage:
   *   <IVFSparklineMatrix initialWeek={28} initialDol={1} />
   */
  import { onMount, tick } from 'svelte';
  import { select, selectAll } from 'd3-selection';
  import { scaleLinear } from 'd3-scale';
  import { area, line, curveCatmullRom } from 'd3-shape';

  const d3 = { select, scaleLinear, area, line, curveCatmullRom };

  // ── Props ──────────────────────────────────────────────────────────
  export let initialWeek: number = 28;
  export let initialDol: number  = 1;

  // ── Types ──────────────────────────────────────────────────────────
  interface GaGroup {
    id: string;
    label: string;
    shortLabel: string;
    col: string;
    weeks: number[];
    infoText: string;
  }

  interface Condition {
    id: string;
    col: string;
    mod: number;
    note: string;
    modNote: string;
  }

  // ── Clinical data ──────────────────────────────────────────────────
  const GA_GROUPS: GaGroup[] = [
    { id:'<25',   label:'< 25 wks',  shortLabel:'EXT PRETERM',  col:'#79c0ff', weeks:[22,23,24],
      infoText:'Extreme preterms have highly permeable skin and immature kidneys — massive insensible losses mandate aggressive fluid escalation. Isolette humidity ≥80%. Monitor Na q6–8h.' },
    { id:'25-27', label:'25–27 wks', shortLabel:'V. PRETERM',   col:'#56d364', weeks:[25,26,27],
      infoText:'Very preterm infants still have significant transepidermal water loss. Target weight loss 2–3%/day for first 5–7 days. Caffeine usually started DOL 1–2.' },
    { id:'28-29', label:'28–29 wks', shortLabel:'PRETERM',      col:'#e3b341', weeks:[28,29],
      infoText:'Skin barrier improving but IWL remains elevated. Surfactant therapy and caffeine initiation influence fluid strategy. Enteral feeds begin once hemodynamically stable.' },
    { id:'30-32', label:'30–32 wks', shortLabel:'MOD PRETERM',  col:'#f78166', weeks:[30,31,32],
      infoText:'More standardized management possible. Enteral feeds typically advance DOL 1–2, reducing IV requirements. Watch for hypoglycemia with dextrose titration.' },
    { id:'33-34', label:'33–34 wks', shortLabel:'LATE PRETERM', col:'#d2a8ff', weeks:[33,34],
      infoText:'Late preterm physiology closer to term but thermal regulation and feeding coordination immature. Phototherapy risk higher — increase fluids accordingly.' },
    { id:'35-36', label:'35–36 wks', shortLabel:'NEAR TERM',    col:'#ff7b72', weeks:[35,36],
      infoText:'Near-term infants usually transition to full enteral feeds within 3–5 days, rapidly reducing IV requirements. Standard fluid restriction applies after DOL 3.' },
    { id:'37+',   label:'≥ 37 wks',  shortLabel:'TERM',         col:'#ffa657', weeks:[37,38,39,40],
      infoText:'Term neonates require minimal IVF beyond 24–48 hours. Breastfeeding or formula drives fluid management once established. Watch for hypernatremia if feeds delayed.' },
  ];

  const DOL_VALUES = [0,1,2,3,4,5,6,7,10,14,21,28];

  const BASE_RATES: Record<string, number[]> = {
    '<25':   [80, 90, 100,110,120,130,140,150,155,160,155,150],
    '25-27': [80, 85,  95,105,115,125,135,145,150,155,150,145],
    '28-29': [70, 80,  90,100,110,120,130,140,145,150,145,140],
    '30-32': [70, 80,  85, 95,105,115,125,135,140,145,140,135],
    '33-34': [65, 75,  80, 90,100,110,120,130,135,140,135,130],
    '35-36': [60, 70,  80, 85, 95,105,115,125,130,135,130,125],
    '37+':   [60, 65,  75, 85, 90,100,110,120,125,130,125,120],
  };

  const CONDITIONS: Condition[] = [
    { id:'Stable', col:'#56d364', mod:  0,
      note:'<strong>Standard protocol.</strong> Titrate to 1–3 mL/kg/hr UO and 2–3% weight loss/day for first 5–7 days.',
      modNote:'No modifier — base rate' },
    { id:'RDS',    col:'#79c0ff', mod: 15,
      note:'<strong>RDS increases insensible losses.</strong> Add 10–20 mL/kg/d. Excessive fluids worsen pulmonary edema.',
      modNote:'+15 mL/kg/d for respiratory losses' },
    { id:'Sepsis', col:'#e3b341', mod: 15,
      note:'<strong>Sepsis drives capillary leak.</strong> Bolus 10 mL/kg NS judiciously, then reassess hemodynamics.',
      modNote:'+15 mL/kg/d for capillary leak' },
    { id:'NEC',    col:'#ff7b72', mod:-20,
      note:'<strong>NEC mandates restriction + bowel rest.</strong> Limit 60–80 mL/kg/d. Electrolytes q4–6h.',
      modNote:'−20 mL/kg/d · NPO · strict restriction' },
    { id:'PPHN',   col:'#d2a8ff', mod: 10,
      note:'<strong>PPHN requires hemodynamic support</strong> without overload. Cautious expansion for hypovolemia only.',
      modNote:'+10 mL/kg/d for hemodynamic support' },
  ];

  const TIERS = [
    { label:'Restrict',     shortLabel:'RESTRICT', col:'#388bfd', bg:'rgba(56,139,253,.15)',  range:'60–80'   },
    { label:'Conservative', shortLabel:'CONSERV.', col:'#3dc9b0', bg:'rgba(61,201,176,.15)',  range:'80–100'  },
    { label:'Standard',     shortLabel:'STANDARD', col:'#56d364', bg:'rgba(86,211,100,.15)',  range:'100–120' },
    { label:'Liberal',      shortLabel:'LIBERAL',  col:'#e3b341', bg:'rgba(227,179,65,.15)',  range:'120–140' },
    { label:'Very Liberal', shortLabel:'VERY LIB.', col:'#f78166', bg:'rgba(247,129,102,.15)',range:'140–160' },
  ];

  // ── Helpers ────────────────────────────────────────────────────────
  const WEEK_TO_GROUP: Record<number, string> = {};
  GA_GROUPS.forEach(g => g.weeks.forEach(w => (WEEK_TO_GROUP[w] = g.id)));

  function tierIdx(r: number): number { return r < 80 ? 0 : r < 100 ? 1 : r < 120 ? 2 : r < 140 ? 3 : 4; }

  function getRateAtDol(gaId: string, dol: number, condMod: number): number {
    const idx = Math.max(0, DOL_VALUES.findIndex(d => d >= dol));
    return Math.max(55, Math.min(170, BASE_RATES[gaId][Math.min(idx, 11)] + condMod));
  }

  function getRateAtIdx(gaId: string, di: number, condMod: number): number {
    return Math.max(55, Math.min(170, BASE_RATES[gaId][di] + condMod));
  }

  function dolPhase(dol: number): string {
    if (dol <= 2)  return 'Transitional (DOL 0–2)';
    if (dol <= 7)  return 'Early neonatal (DOL 3–7)';
    if (dol <= 14) return 'Late neonatal I (DOL 8–14)';
    if (dol <= 21) return 'Late neonatal II (DOL 15–21)';
    return 'Post-neonatal (DOL 22–28)';
  }

  // ── State ──────────────────────────────────────────────────────────
  let selectedWeek: number = initialWeek;
  let currentDol: number   = initialDol;

  $: selectedGaId    = WEEK_TO_GROUP[selectedWeek] ?? '28-29';
  $: selectedGroup   = GA_GROUPS.find(g => g.id === selectedGaId)!;
  $: stableRate      = getRateAtDol(selectedGaId, currentDol, 0);
  $: maxRate         = getRateAtDol(selectedGaId, currentDol, 20);
  $: minRate         = getRateAtDol(selectedGaId, currentDol, -20);

  // ── Sparkline SVG refs ─────────────────────────────────────────────
  let sparkRefs: SVGSVGElement[] = [];

  $: if (sparkRefs.length) drawAllSparklines();

  onMount(() => {
    drawAllSparklines();
  });

  async function drawAllSparklines() {
    await tick();
    CONDITIONS.forEach((cond, ci) => {
      if (sparkRefs[ci]) drawSparkline(ci, cond);
    });
  }

  function drawSparkline(ci: number, cond: Condition) {
    const svgEl = sparkRefs[ci];
    if (!svgEl) return;

    const W = svgEl.clientWidth || 280;
    const H = 72;
    const P = { t: 8, r: 6, b: 8, l: 6 };
    const iW = W - P.l - P.r;
    const iH = H - P.t - P.b;

    d3.select(svgEl).selectAll('*').remove();

    const pts = DOL_VALUES.map((d, di) => ({
      dol: d,
      rate: getRateAtIdx(selectedGaId, di, cond.mod),
    }));

    const xS = d3.scaleLinear().domain([0, 28]).range([P.l, P.l + iW]);
    const yS = d3.scaleLinear().domain([55, 170]).range([P.t + iH, P.t]);
    const svg = d3.select(svgEl);

    // Tier zone shading
    [55, 80, 100, 120, 140, 170].slice(0, -1).forEach((lo, i) => {
      svg.append('rect')
        .attr('x', P.l).attr('y', yS([80, 100, 120, 140, 170][i]))
        .attr('width', iW).attr('height', yS(lo) - yS([80, 100, 120, 140, 170][i]))
        .attr('fill', TIERS[i].col + '07');
    });

    // Area
    svg.append('path').datum(pts)
      .attr('d', d3.area<{ dol: number; rate: number }>()
        .x(d => xS(d.dol)).y0(P.t + iH).y1(d => yS(d.rate))
        .curve(d3.curveCatmullRom.alpha(0.5))
      )
      .attr('fill', cond.col + '18');

    // Line
    svg.append('path').datum(pts)
      .attr('d', d3.line<{ dol: number; rate: number }>()
        .x(d => xS(d.dol)).y(d => yS(d.rate))
        .curve(d3.curveCatmullRom.alpha(0.5))
      )
      .attr('fill', 'none').attr('stroke', cond.col)
      .attr('stroke-width', 1.8).attr('stroke-linecap', 'round');

    // Current DOL marker
    const nearPt = pts.reduce((prev, p) =>
      Math.abs(p.dol - currentDol) < Math.abs(prev.dol - currentDol) ? p : prev
    );

    svg.append('line')
      .attr('x1', xS(nearPt.dol)).attr('x2', xS(nearPt.dol))
      .attr('y1', P.t).attr('y2', P.t + iH)
      .attr('stroke', cond.col).attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2').attr('opacity', .55);

    svg.append('circle')
      .attr('cx', xS(nearPt.dol)).attr('cy', yS(nearPt.rate))
      .attr('r', 4.5).attr('fill', cond.col)
      .attr('stroke', '#0d1117').attr('stroke-width', 2);

    // Label
    const tCol = TIERS[tierIdx(nearPt.rate)].col;
    const lblX = xS(nearPt.dol) + (xS(nearPt.dol) > iW * .65 ? -32 : 8);
    svg.append('text')
      .attr('x', lblX).attr('y', yS(nearPt.rate) - 6)
      .attr('font-family', 'JetBrains Mono, monospace').attr('font-size', '8.5px')
      .attr('font-weight', '700').attr('fill', tCol).text(nearPt.rate);
  }
</script>

<!-- ═══ TEMPLATE ════════════════════════════════════════ -->
<div class="matrix-root">

  <!-- GA Banner -->
  <div class="ga-banner">
    <div class="ga-banner-lbl">Gestational Age at Birth</div>
    <div class="ga-weeks-scroll">
      {#each GA_GROUPS as group}
        <div class="ga-group-section">
          <div class="ga-group-lbl" style="color:{group.col}">{group.shortLabel}</div>
          <div class="ga-group-weeks">
            {#each group.weeks as wk}
              <button
                class="gw-btn"
                class:active={selectedWeek === wk}
                style="--col:{group.col}"
                on:click={() => { selectedWeek = wk; drawAllSparklines(); }}
              >
                <span class="gw-num" style="color:{selectedWeek === wk ? group.col : undefined}">
                  {wk}<span class="gw-w">w</span>
                </span>
                <span class="gw-sub">{wk >= 37 ? 'term' : 'wks'}</span>
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- DOL Bar -->
  <div class="dol-bar">
    <span class="dol-lbl">Day of Life</span>
    <div class="dol-slider-col">
      <div class="dol-slider-row">
        <span class="dol-edge">0</span>
        <input
          type="range" min="0" max="28"
          bind:value={currentDol}
          on:input={drawAllSparklines}
          style="--col:{selectedGroup?.col ?? '#58a6ff'}"
          class="dol-range"
        />
        <span class="dol-edge">28</span>
      </div>
      <div class="dol-ticks">
        <span>DOL 0</span><span>DOL 7</span><span>DOL 14</span><span>DOL 21</span><span>DOL 28</span>
      </div>
    </div>
    <div class="dol-readout" style="color:{selectedGroup?.col ?? '#58a6ff'}">DOL {currentDol}</div>
    <span class="dol-phase">{dolPhase(currentDol)}</span>
  </div>

  <!-- GA Info Strip -->
  {#if selectedGroup}
    <div class="ga-strip" style="border-bottom:1px solid #21262d">
      <div>
        <div class="ga-strip-title" style="color:{selectedGroup.col}">
          {selectedWeek} Weeks GA
        </div>
        <div style="display:flex;align-items:center;gap:.5rem;margin-top:.3rem">
          <span class="ga-group-tag" style="color:{selectedGroup.col};border-color:{selectedGroup.col}44;background:{selectedGroup.col}15">
            {selectedGroup.label}
          </span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:.65rem;color:#6e7681">{selectedGroup.shortLabel}</span>
        </div>
      </div>
      <p class="ga-strip-info">{selectedGroup.infoText}</p>
      <div class="ga-strip-stats">
        <div class="ga-strip-stat">
          <span class="gs-val" style="color:{selectedGroup.col}">{stableRate}</span>
          <span class="gs-lbl">Stable · DOL {currentDol}</span>
        </div>
        <div class="ga-strip-stat">
          <span class="gs-val" style="color:#f78166">{maxRate}</span>
          <span class="gs-lbl">Max (liberal)</span>
        </div>
        <div class="ga-strip-stat">
          <span class="gs-val" style="color:#388bfd">{minRate}</span>
          <span class="gs-lbl">Min (restrict)</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Card Grid -->
  <div class="card-grid">
    {#each CONDITIONS as cond, ci}
      {@const curRate = getRateAtDol(selectedGaId, currentDol, cond.mod)}
      {@const t = tierIdx(curRate)}
      {@const tier = TIERS[t]}
      {@const pct = Math.round(((curRate - 55) / (170 - 55)) * 100)}
      {@const allRates = DOL_VALUES.map((_, di) => getRateAtIdx(selectedGaId, di, cond.mod))}
      {@const rateMin = Math.min(...allRates)}
      {@const rateMax = Math.max(...allRates)}

      <div class="s-card" style="--cc:{cond.col}">
        <div class="s-card-accent" style="background:{cond.col}"></div>
        <div class="s-card-body">
          <!-- Header -->
          <div class="sc-hdr">
            <span class="sc-cond" style="color:{cond.col}">{cond.id}</span>
            <span class="sc-tier" style="color:{tier.col};border-color:{tier.col}55;background:{tier.bg}">
              {tier.shortLabel}
            </span>
          </div>
          <!-- Modifier -->
          <div class="sc-modifier">
            <span class="sc-mod-val" class:pos={cond.mod > 0} class:neg={cond.mod < 0}>
              {cond.mod > 0 ? '+' : ''}{cond.mod} mL/kg/d
            </span>
            <span class="sc-mod-note">{cond.modNote}</span>
          </div>
          <!-- Sparkline -->
          <div class="sc-svg-bg">
            <svg bind:this={sparkRefs[ci]} width="100%" height="72" />
            <div class="sc-dol-row">
              <span>DOL 0</span><span>DOL 28</span>
            </div>
          </div>
          <!-- Rate readout -->
          <div class="sc-rate-row">
            <span class="sc-rate" style="color:{tier.col}">{curRate}</span>
            <span class="sc-rate-unit">mL/kg/day at DOL {currentDol}</span>
          </div>
          <!-- Bar -->
          <div class="sc-bar-wrap">
            <span class="sc-bar-edge">55</span>
            <div class="sc-bar-track">
              <div class="sc-bar-fill" style="width:{pct}%;background:{tier.col}"></div>
            </div>
            <span class="sc-bar-edge">170</span>
            <span class="sc-bar-pct">{pct}%</span>
          </div>
          <!-- Range info -->
          <div class="sc-meta">
            <span>Range: <strong style="color:{cond.col}">{rateMin}–{rateMax}</strong> mL/kg/d</span>
            <span>Tier: <strong style="color:{tier.col}">{tier.range}</strong></span>
          </div>
          <!-- Clinical note -->
          <div class="sc-note">{@html cond.note}</div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  /* ── Root ───────────────────────────────────────────── */
  .matrix-root {
    background: #080c12;
    color: #e6edf3;
    font-family: 'Libre Franklin', sans-serif;
    border-radius: 10px;
    overflow: hidden;
  }

  /* ── GA Banner ──────────────────────────────────────── */
  .ga-banner {
    background: #0d1117;
    border-bottom: 1px solid #21262d;
    padding: .85rem 1.5rem 0;
  }
  .ga-banner-lbl {
    font-family: 'JetBrains Mono', monospace;
    font-size: .6rem; text-transform: uppercase;
    letter-spacing: .1em; color: #6e7681; margin-bottom: .55rem;
  }
  .ga-weeks-scroll {
    display: flex; overflow-x: auto; gap: 0; scrollbar-width: none;
  }
  .ga-weeks-scroll::-webkit-scrollbar { display: none; }
  .ga-group-section {
    display: flex; flex-direction: column;
    border-right: 1px solid #21262d;
    padding-right: 2px; margin-right: 2px;
    flex-shrink: 0;
  }
  .ga-group-section:last-child { border-right: none; }
  .ga-group-lbl {
    font-family: 'JetBrains Mono', monospace;
    font-size: .52rem; text-transform: uppercase;
    letter-spacing: .06em; padding: .15rem .6rem 0;
  }
  .ga-group-weeks { display: flex; }

  .gw-btn {
    display: flex; flex-direction: column; align-items: center;
    justify-content: flex-end; gap: .15rem;
    padding: .5rem .6rem .65rem; border: none;
    border-bottom: 3px solid transparent; background: none;
    cursor: pointer; min-width: 52px; flex-shrink: 0;
    transition: background .14s, border-color .14s;
  }
  .gw-btn:hover { background: #161b22; }
  .gw-btn.active {
    background: #161b22;
    border-bottom-color: var(--col);
  }
  .gw-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: .88rem; font-weight: 700; color: #8b949e;
    line-height: 1; transition: color .14s;
  }
  .gw-w { font-size: .5em; opacity: .6; }
  .gw-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: .55rem; color: #6e7681; line-height: 1;
  }
  .gw-btn.active .gw-sub { color: var(--col); opacity: .7; }

  /* ── DOL Bar ─────────────────────────────────────────── */
  .dol-bar {
    background: #0d1117;
    border-bottom: 1px solid #21262d;
    padding: .7rem 1.5rem;
    display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  }
  .dol-lbl {
    font-family: 'JetBrains Mono', monospace;
    font-size: .62rem; text-transform: uppercase;
    letter-spacing: .07em; color: #6e7681; white-space: nowrap;
  }
  .dol-slider-col { display: flex; flex-direction: column; gap: .2rem; flex: 1; min-width: 180px; max-width: 380px; }
  .dol-slider-row { display: flex; align-items: center; gap: .55rem; }
  .dol-edge { font-family: 'JetBrains Mono', monospace; font-size: .62rem; color: #6e7681; }
  .dol-range {
    flex: 1; height: 4px; appearance: none;
    background: #30363d; border-radius: 2px; outline: none; cursor: pointer;
  }
  .dol-range::-webkit-slider-thumb {
    appearance: none; width: 15px; height: 15px; border-radius: 50%;
    background: var(--col, #58a6ff); border: 2px solid #080c12;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--col, #58a6ff) 25%, transparent);
    cursor: pointer;
  }
  .dol-ticks {
    display: flex; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: .54rem; color: #6e7681; padding: 0 10px;
  }
  .dol-readout { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 700; }
  .dol-phase {
    font-family: 'JetBrains Mono', monospace; font-size: .65rem;
    color: #6e7681; background: #161b22; border: 1px solid #30363d;
    padding: .22rem .65rem; border-radius: 20px; white-space: nowrap;
  }

  /* ── GA Strip ────────────────────────────────────────── */
  .ga-strip {
    background: #161b22;
    padding: .85rem 1.5rem;
    display: flex; align-items: flex-start; gap: 1.25rem; flex-wrap: wrap;
  }
  .ga-strip-title { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; font-style: italic; }
  .ga-group-tag {
    font-family: 'JetBrains Mono', monospace; font-size: .65rem;
    font-weight: 600; padding: .18rem .6rem; border-radius: 4px; border: 1px solid;
  }
  .ga-strip-info {
    font-size: .73rem; color: #6e7681; line-height: 1.6;
    max-width: 360px; flex: 1;
    border-left: 2px solid rgba(255,255,255,.08);
    padding-left: .75rem;
  }
  .ga-strip-stats {
    display: flex; gap: 1.1rem; flex-wrap: wrap; margin-left: auto;
  }
  .ga-strip-stat { text-align: right; }
  .gs-val { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 700; display: block; line-height: 1; }
  .gs-lbl { font-size: .62rem; color: #6e7681; display: block; margin-top: .15rem; }

  /* ── Card Grid ───────────────────────────────────────── */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    padding: 1.1rem 1.5rem 2rem;
    background: #080c12;
  }

  /* ── Sparkline Card ─────────────────────────────────── */
  .s-card {
    background: #0d1117;
    border: 1px solid #21262d;
    border-radius: 10px; overflow: hidden;
    transition: border-color .2s, box-shadow .2s, transform .15s;
  }
  .s-card:hover {
    border-color: var(--cc);
    box-shadow: 0 0 0 1px var(--cc) inset, 0 6px 24px rgba(0,0,0,.4);
    transform: translateY(-2px);
  }
  .s-card-accent { height: 3px; }
  .s-card-body { padding: .9rem; }

  /* Card header */
  .sc-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: .5rem; }
  .sc-cond { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; }
  .sc-tier {
    font-family: 'JetBrains Mono', monospace; font-size: .6rem; font-weight: 600;
    padding: .16rem .55rem; border-radius: 12px; border: 1px solid; letter-spacing: .03em;
  }

  /* Modifier */
  .sc-modifier {
    display: flex; align-items: center; gap: .4rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: .65rem; color: #6e7681; margin-bottom: .65rem; flex-wrap: wrap;
  }
  .sc-mod-val {
    font-weight: 600; padding: .1rem .4rem; border-radius: 4px; background: #161b22;
  }
  .sc-mod-val.pos { color: #f78166; }
  .sc-mod-val.neg { color: #79c0ff; }
  .sc-mod-note { font-size: .6rem; color: #6e7681; }

  /* SVG area */
  .sc-svg-bg {
    background: #161b22; border-radius: 5px;
    padding: .4rem .4rem .2rem; margin-bottom: .7rem;
  }
  .sc-dol-row {
    display: flex; justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: .54rem; color: #6e7681; padding: 0 2px; margin-top: .1rem;
  }

  /* Rate readout */
  .sc-rate-row { display: flex; align-items: baseline; gap: .4rem; margin-bottom: .4rem; }
  .sc-rate { font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; line-height: 1; }
  .sc-rate-unit { font-family: 'JetBrains Mono', monospace; font-size: .68rem; color: #6e7681; }

  /* Bar */
  .sc-bar-wrap { display: flex; gap: .4rem; align-items: center; margin-bottom: .45rem; }
  .sc-bar-edge { font-family: 'JetBrains Mono', monospace; font-size: .6rem; color: #6e7681; }
  .sc-bar-track { flex: 1; height: 5px; background: #21262d; border-radius: 3px; overflow: hidden; }
  .sc-bar-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
  .sc-bar-pct { font-family: 'JetBrains Mono', monospace; font-size: .62rem; color: #6e7681; min-width: 32px; text-align: right; }

  /* Meta row */
  .sc-meta {
    display: flex; gap: .9rem; flex-wrap: wrap;
    font-family: 'JetBrains Mono', monospace;
    font-size: .65rem; color: #6e7681; margin-bottom: .45rem;
  }

  /* Clinical note */
  .sc-note {
    font-size: .7rem; color: #6e7681; line-height: 1.55;
    border-top: 1px solid #21262d; padding-top: .5rem;
  }
  .sc-note :global(strong) { color: #8b949e; font-weight: 600; }
</style>
