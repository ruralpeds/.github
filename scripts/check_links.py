#!/usr/bin/env python3
"""
PED CDS — Link & Asset Integrity Checker
=========================================
Audits every internal reference in the static site and produces a
timestamped, self-contained HTML report.

Checks:
  • Decision tree files registered in index.html and decision-trees/index.html
  • Cross-links between decision tree pages (sidebar navigation)
  • Calculator pages registered in calculators/index.html and main index
  • Education DOCX files (cheat-sheets / textbooks / audio-textbooks)
  • Topic consistency between main index.html and education/index.html
  • Orphaned files (on disk but not referenced anywhere)
  • Shared resource integrity (shell.js, theme-bridge.js, manifest.json)

Usage:
    python scripts/check_links.py                 # generate link-report.html
    python scripts/check_links.py --out foo.html  # custom output path
    python scripts/check_links.py --open          # open in browser when done
    python scripts/check_links.py --console       # console output only
"""

import os
import re
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path

# ─────────────────────────────────────────────────────────────
#  ROOT PATHS
# ─────────────────────────────────────────────────────────────
ROOT   = Path(__file__).parent.parent.resolve()
STATIC = ROOT / "apps" / "web" / "static"
EDU    = STATIC / "education"
DT_DIR = STATIC / "decision-trees"
CALC   = STATIC / "calculators"

INDEX       = STATIC / "index.html"
EDU_INDEX   = EDU    / "index.html"
DT_INDEX    = DT_DIR / "index.html"
CALC_INDEX  = CALC   / "index.html"
SHELL_JS    = STATIC / "shell.js"
THEME_JS    = STATIC / "theme-bridge.js"
VIEWER_HTML = EDU    / "viewer.html"


# ─────────────────────────────────────────────────────────────
#  ISSUE
# ─────────────────────────────────────────────────────────────
class Issue:
    def __init__(self, level, category, title, detail="", source=None, target=None):
        self.level    = level       # "error" | "warn" | "info"
        self.category = category
        self.title    = title
        self.detail   = detail
        self.source   = _rel(source)
        self.target   = _rel(target)

    def to_dict(self):
        return dict(level=self.level, category=self.category,
                    title=self.title, detail=self.detail,
                    source=self.source, target=self.target)


def _rel(p):
    if p is None:
        return None
    if isinstance(p, Path):
        try:
            return str(p.relative_to(ROOT))
        except ValueError:
            return str(p)
    return str(p)


# ─────────────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────────────
def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def extract_section(html: str, start_marker: str, end_marker: str) -> str:
    """Extract substring between two markers (inclusive of neither)."""
    s = html.find(start_marker)
    if s == -1:
        return ""
    s += len(start_marker)
    e = html.find(end_marker, s)
    return html[s:e] if e != -1 else html[s:]


def js_strings(fragment: str, key: str) -> list:
    """Extract all  key:"value"  values from a JS fragment."""
    return re.findall(rf'{re.escape(key)}:"([^"]+)"', fragment)


def href_values(html: str) -> list:
    """Extract all href= and src= values."""
    return (re.findall(r'href="([^"]+)"', html) +
            re.findall(r"href='([^']+)'", html) +
            re.findall(r'src="([^"]+)"',  html))


def is_external(url: str) -> bool:
    return url.startswith(("http://", "https://", "//", "data:"))


def resolve(base: Path, href: str) -> Path:
    return (base.parent / href).resolve()


def file_ok(path: Path) -> bool:
    return path.exists() and path.is_file()


# ─────────────────────────────────────────────────────────────
#  SHARED RESOURCE CHECK
# ─────────────────────────────────────────────────────────────
def check_shared_resources(issues):
    CAT = "Shared Resources"
    for res in [SHELL_JS, THEME_JS]:
        if not file_ok(res):
            issues.append(Issue("error", CAT,
                f"Missing: {res.name}",
                f"Critical shared JS expected at static/{res.name}.",
                target=res))
        elif res.stat().st_size < 100:
            issues.append(Issue("warn", CAT,
                f"Suspiciously small: {res.name}",
                f"Only {res.stat().st_size} bytes — may be empty or truncated.",
                target=res))

    manifest = STATIC / "manifest.json"
    if not file_ok(manifest):
        issues.append(Issue("warn", CAT, "manifest.json missing",
                             "PWA manifest not found.", target=manifest))


# ─────────────────────────────────────────────────────────────
#  DECISION TREES
# ─────────────────────────────────────────────────────────────
def check_decision_trees(issues):
    CAT = "Decision Trees"

    if not file_ok(INDEX):
        issues.append(Issue("error", CAT, "index.html missing", target=INDEX))
        return

    main_html = read(INDEX)

    # ── Extract neoTrees + pedsTrees arrays from main index.html ─────────
    # Arrays are  neoTrees=[...];  and  pedsTrees=[...];  before eduTopics
    neo_section  = extract_section(main_html, "var neoTrees = [",  "];")
    peds_section = extract_section(main_html, "var pedsTrees = [", "];")
    combined_dt  = neo_section + peds_section
    dt_fs_main   = js_strings(combined_dt, "f")
    # Keep only bare decision-tree filenames (calculators have "./" prefix)
    dt_fs_main = [f for f in dt_fs_main if f.endswith(".html") and "/" not in f]

    referenced_from_main = set(dt_fs_main)
    for f in dt_fs_main:
        ref_path = DT_DIR / f
        if not file_ok(ref_path):
            issues.append(Issue("error", CAT,
                f"Missing DT: {f}",
                f"Listed in index.html → decision-trees/{f} does not exist.",
                source=INDEX, target=ref_path))

    # ── decision-trees/index.html (uses href= not f: keys) ───────────────
    referenced_from_dt_index = set()
    if not file_ok(DT_INDEX):
        issues.append(Issue("warn", CAT,
            "decision-trees/index.html missing", target=DT_INDEX))
    else:
        dt_index_html = read(DT_INDEX)
        for href in href_values(dt_index_html):
            if is_external(href) or href.startswith("#") or "/" in href:
                continue
            if not href.endswith(".html") or href == "index.html":
                continue
            referenced_from_dt_index.add(href)
            ref_path = DT_DIR / href
            if not file_ok(ref_path):
                issues.append(Issue("error", CAT,
                    f"Missing DT: {href}",
                    f"Linked in decision-trees/index.html — file does not exist.",
                    source=DT_INDEX, target=ref_path))

        # Consistency between main index and DT index
        only_main = referenced_from_main - referenced_from_dt_index
        only_dt   = referenced_from_dt_index - referenced_from_main
        for f in sorted(only_main):
            issues.append(Issue("warn", CAT,
                f"DT in main only: {f}",
                "In index.html decisionTrees but not in decision-trees/index.html.",
                source=INDEX))
        for f in sorted(only_dt):
            issues.append(Issue("warn", CAT,
                f"DT in DT-index only: {f}",
                "In decision-trees/index.html but not in main index.html.",
                source=DT_INDEX))

    # ── Orphaned DT files ─────────────────────────────────────────────────
    all_referenced = referenced_from_main | referenced_from_dt_index
    for f in sorted(DT_DIR.glob("*.html")):
        if f.name == "index.html":
            continue
        if f.name not in all_referenced:
            issues.append(Issue("warn", CAT,
                f"Orphaned DT: {f.name}",
                f"decision-trees/{f.name} exists on disk but is not referenced in either index.",
                target=f))

    # ── Cross-links inside each DT file ──────────────────────────────────
    all_dt_on_disk = {f.name for f in DT_DIR.glob("*.html")}
    for dt_file in sorted(DT_DIR.glob("*.html")):
        html = read(dt_file)
        for href in href_values(html):
            if is_external(href) or href.startswith("#"):
                continue
            target = resolve(dt_file, href)
            if not target.exists():
                issues.append(Issue("error", CAT,
                    f"Broken link in {dt_file.name}: {href}",
                    f"href='{href}' resolves to {_rel(target)} — file not found.",
                    source=dt_file, target=target))


# ─────────────────────────────────────────────────────────────
#  CALCULATORS
# ─────────────────────────────────────────────────────────────
def check_calculators(issues):
    CAT = "Calculators"

    if not file_ok(CALC_INDEX):
        issues.append(Issue("error", CAT, "calculators/index.html missing", target=CALC_INDEX))
        return

    # calculators/index.html uses href= links directly
    calc_html = read(CALC_INDEX)
    referenced = set()
    for href in href_values(calc_html):
        if is_external(href) or href.startswith("#") or href == "../":
            continue
        if href.endswith(".html") and "/" not in href:
            referenced.add(href)
            ref_path = CALC / href
            if not file_ok(ref_path):
                issues.append(Issue("error", CAT,
                    f"Missing calculator: {href}",
                    f"Linked in calculators/index.html — file does not exist.",
                    source=CALC_INDEX, target=ref_path))

    # Main index calculators (f: with ./calculators/ prefix, in var calcs=[...])
    if file_ok(INDEX):
        main_html = read(INDEX)
        calcs_section = extract_section(main_html, "var calcs = [", "];")
        for f in js_strings(calcs_section, "f"):
            if not f.endswith(".html"):
                continue
            if f.startswith("./calculators/") or f.startswith("calculators/"):
                ref_path = (STATIC / f.lstrip("./")).resolve()
                if not file_ok(ref_path):
                    issues.append(Issue("error", CAT,
                        f"Missing calculator (from main): {Path(f).name}",
                        f"Listed in index.html as '{f}' — file not found.",
                        source=INDEX, target=ref_path))

    # Orphaned calculator files
    disk_files = {f.name for f in CALC.glob("*.html")}
    for name in sorted(disk_files - referenced - {"index.html"}):
        issues.append(Issue("info", CAT,
            f"Orphaned calculator: {name}",
            f"calculators/{name} exists but is not linked in calculators/index.html.",
            target=CALC / name))

    # Internal links in each calculator file
    for calc_file in sorted(CALC.glob("*.html")):
        html = read(calc_file)
        for href in href_values(html):
            if is_external(href) or href.startswith("#"):
                continue
            target = resolve(calc_file, href)
            if not target.exists():
                issues.append(Issue("error", CAT,
                    f"Broken link in {calc_file.name}: {href}",
                    f"href='{href}' → {_rel(target)} — file not found.",
                    source=calc_file, target=target))


# ─────────────────────────────────────────────────────────────
#  EDUCATION
# ─────────────────────────────────────────────────────────────
def check_education(issues):
    CAT = "Education"

    FORMATS = {
        "cs": (EDU / "cheat-sheets",    "_cheat_sheet.docx"),
        "tb": (EDU / "textbooks",        "_textbook.docx"),
        "au": (EDU / "audio-textbooks",  "_audio_textbook.docx"),
    }

    if not file_ok(INDEX):
        return

    main_html = read(INDEX)

    # ── Parse eduTopics array (scoped to avoid FMTS variable false positives) ──
    edu_section = extract_section(main_html, "var eduTopics = [", "];")
    cs_keys = js_strings(edu_section, "cs")
    tb_keys = js_strings(edu_section, "tb")
    au_keys = js_strings(edu_section, "au")

    # ── Check each registered topic has its DOCX files ───────────────────
    for key in cs_keys:
        for ftype, ref_keys in [("cs", cs_keys), ("tb", tb_keys), ("au", au_keys)]:
            if key not in ref_keys:
                continue
            folder, suffix = FORMATS[ftype]
            docx = folder / f"{key}{suffix}"
            if not file_ok(docx):
                issues.append(Issue("error", CAT,
                    f"Missing DOCX [{ftype}]: {key}",
                    f"Registered in eduTopics but {_rel(docx)} does not exist.",
                    source=INDEX, target=docx))

    # ── education/index.html consistency ─────────────────────────────────
    if not file_ok(EDU_INDEX):
        issues.append(Issue("error", CAT,
            "education/index.html missing", target=EDU_INDEX))
    else:
        edu_html = read(EDU_INDEX)
        # topics array is scoped between "var topics=[" and "];"
        topics_section = extract_section(edu_html, "var topics=[", "];")
        edu_keys = js_strings(topics_section, "k")
        edu_set  = set(edu_keys)
        main_set = set(cs_keys)

        for key in sorted(main_set - edu_set):
            issues.append(Issue("warn", CAT,
                f"Topic in main only: {key}",
                "In index.html eduTopics but not in education/index.html topics array.",
                source=INDEX))

        for key in sorted(edu_set - main_set):
            issues.append(Issue("warn", CAT,
                f"Topic in edu/index only: {key}",
                "In education/index.html topics array but not in main index.html eduTopics.",
                source=EDU_INDEX))

        # Each edu topic should have all 3 DOCX files
        for key in edu_keys:
            for ftype, (folder, suffix) in FORMATS.items():
                docx = folder / f"{key}{suffix}"
                if not file_ok(docx):
                    issues.append(Issue("warn", CAT,
                        f"Missing DOCX [{ftype}]: {key}",
                        f"In education/index.html but {_rel(docx)} is absent.",
                        source=EDU_INDEX, target=docx))

    # ── Orphaned DOCX files ───────────────────────────────────────────────
    for ftype, (folder, suffix) in FORMATS.items():
        if not folder.exists():
            issues.append(Issue("warn", CAT,
                f"Folder missing: education/{folder.name}", target=folder))
            continue
        ref_keys = cs_keys if ftype == "cs" else (tb_keys if ftype == "tb" else au_keys)
        for docx in sorted(folder.glob(f"*{suffix}")):
            key = docx.name[: -len(suffix)]
            if key not in ref_keys:
                issues.append(Issue("info", CAT,
                    f"Orphaned DOCX [{ftype}]: {docx.name}",
                    f"{_rel(docx)} exists but no eduTopics entry references it.",
                    target=docx))

    # ── viewer.html ───────────────────────────────────────────────────────
    if not file_ok(VIEWER_HTML):
        issues.append(Issue("error", CAT,
            "education/viewer.html missing", target=VIEWER_HTML))
    else:
        for href in href_values(read(VIEWER_HTML)):
            if is_external(href) or href.startswith("#") or "docxPath" in href or "'" in href:
                continue
            target = resolve(VIEWER_HTML, href)
            if not target.exists():
                issues.append(Issue("error", CAT,
                    f"Broken link in viewer.html: {href}",
                    f"href='{href}' → {_rel(target)} — not found.",
                    source=VIEWER_HTML, target=target))


# ─────────────────────────────────────────────────────────────
#  RUN ALL CHECKS
# ─────────────────────────────────────────────────────────────
def run_checks() -> list:
    issues = []
    check_shared_resources(issues)
    check_decision_trees(issues)
    check_calculators(issues)
    check_education(issues)
    return issues


# ─────────────────────────────────────────────────────────────
#  HTML REPORT
# ─────────────────────────────────────────────────────────────
_CSS = """
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
:root{
  --bg:#FAFAF9;--surface:#FFF;--border:#E7E5E4;--text:#1C1917;--text2:#44403C;--text3:#78716C;
  --accent:#1D4ED8;
  --red:#DC2626;--red-bg:#FEF2F2;--red-b:rgba(220,38,38,.25);
  --amber:#B45309;--amber-bg:#FFFBEB;--amber-b:rgba(180,83,9,.25);
  --blue:#1D4ED8;--blue-bg:#EFF6FF;--blue-b:rgba(29,78,216,.25);
  --green:#166534;--green-bg:#F0FDF4;--green-b:rgba(22,101,52,.25);
  --shadow:rgba(28,25,23,.06);
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'IBM Plex Sans',system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:14px;line-height:1.5}
.page{max-width:1100px;margin:0 auto;padding:28px 20px 72px}
h1{font-family:'DM Serif Display',Georgia,serif;font-size:1.75rem;margin-bottom:.2rem}
.subtitle{color:var(--text3);font-size:.875rem;margin-bottom:1.75rem}
/* Summary cards */
.summary{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px}
.scard{flex:1;min-width:130px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:12px;text-align:center;cursor:pointer;transition:all .12s;user-select:none}
.scard:hover{box-shadow:0 2px 8px var(--shadow)}
.scard .num{font-size:2.25rem;font-weight:700;line-height:1}
.scard .lbl{font-size:.6875rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-top:4px}
.scard.err .num{color:var(--red)} .scard.warn .num{color:var(--amber)}
.scard.info .num{color:var(--blue)} .scard.ok .num{color:var(--green)}
.scard.active{outline:2px solid var(--accent)}
/* Controls */
.controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:18px}
.fbtn{padding:6px 14px;border-radius:20px;border:1px solid var(--border);background:var(--surface);
  color:var(--text2);font-family:inherit;font-size:.8125rem;font-weight:600;cursor:pointer;transition:.12s}
.fbtn.active{background:var(--accent);color:#fff;border-color:var(--accent)}
.fbtn:hover:not(.active){border-color:var(--text2)}
.search{margin-left:auto;padding:7px 12px;border:1px solid var(--border);border-radius:8px;
  font-family:inherit;font-size:.8125rem;background:var(--surface);color:var(--text);min-width:220px}
.search:focus{outline:none;border-color:var(--accent)}
.stats-bar{font-size:.8125rem;color:var(--text3);margin-bottom:8px}
/* Group */
.group-hdr{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;
  color:var(--text3);margin:20px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:8px}
.gcnt{background:rgba(0,0,0,.07);color:var(--text2);padding:1px 7px;border-radius:10px;font-size:.7rem}
/* Issue card */
.issue{border-radius:10px;border:1px solid;padding:12px 14px;margin-bottom:6px;transition:.12s}
.issue.error{background:var(--red-bg);border-color:var(--red-b)}
.issue.warn {background:var(--amber-bg);border-color:var(--amber-b)}
.issue.info {background:var(--blue-bg);border-color:var(--blue-b)}
.ihead{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap}
.badge{font-size:.625rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;
  padding:2px 7px;border-radius:4px;flex-shrink:0;line-height:1.4}
.badge.error{background:var(--red);color:#fff}
.badge.warn{background:var(--amber);color:#fff}
.badge.info{background:var(--blue);color:#fff}
.catbadge{font-size:.6875rem;font-weight:600;color:var(--text3);
  background:rgba(0,0,0,.055);padding:2px 7px;border-radius:4px;flex-shrink:0}
.ititle{font-weight:600;font-size:.9rem;flex:1;min-width:0}
.idetail{font-size:.8125rem;color:var(--text2);margin-top:3px}
.paths{margin-top:6px;display:flex;flex-direction:column;gap:3px}
.prow{display:flex;align-items:baseline;gap:6px;font-size:.75rem}
.plbl{color:var(--text3);flex-shrink:0;width:32px}
.pval{font-family:'IBM Plex Mono',monospace;font-size:.7375rem;background:rgba(0,0,0,.055);
  padding:2px 7px;border-radius:4px;word-break:break-all;cursor:pointer;transition:.12s;display:inline-block}
.pval:hover{background:rgba(0,0,0,.11)}
.pval.copied{background:var(--green-bg);color:var(--green)}
/* Empty state */
.empty{text-align:center;padding:56px 24px;color:var(--text3);background:var(--surface);
  border:1px solid var(--border);border-radius:12px;margin-top:8px}
.empty .ico{font-size:2.5rem;display:block;margin-bottom:10px}
"""

_JS = r"""
var ALL = __DATA__;
var lvl = 'all', q = '';

function re() {
  var vis = ALL.filter(function(i) {
    if (lvl !== 'all' && i.level !== lvl) return false;
    if (q) {
      var s = q.toLowerCase();
      return ['title','detail','source','target','category'].some(function(k){
        return (i[k]||'').toLowerCase().includes(s);
      });
    }
    return true;
  });
  var list = document.getElementById('list');
  document.getElementById('statsbar').textContent =
    vis.length + ' issue' + (vis.length !== 1 ? 's' : '') + ' shown';
  if (!vis.length) {
    list.innerHTML = '<div class="empty"><span class="ico">✅</span>No issues match the current filter.</div>';
    return;
  }
  var groups = {};
  vis.forEach(function(i){ (groups[i.category] = groups[i.category]||[]).push(i); });
  var html = '';
  Object.keys(groups).sort().forEach(function(cat) {
    html += '<div class="group-hdr">' + h(cat) + '<span class="gcnt">' + groups[cat].length + '</span></div>';
    groups[cat].forEach(function(i) { html += card(i); });
  });
  list.innerHTML = html;
}

function card(i) {
  var paths = '';
  if (i.source) paths += row('from', i.source);
  if (i.target) paths += row('→',    i.target);
  return '<div class="issue ' + i.level + '">' +
    '<div class="ihead">' +
    '<span class="badge ' + i.level + '">' + i.level + '</span>' +
    '<span class="catbadge">' + h(i.category) + '</span>' +
    '<span class="ititle">' + h(i.title) + '</span>' +
    '</div>' +
    (i.detail ? '<div class="idetail">' + h(i.detail) + '</div>' : '') +
    (paths ? '<div class="paths">' + paths + '</div>' : '') +
    '</div>';
}

function row(lbl, val) {
  return '<div class="prow"><span class="plbl">' + h(lbl) + '</span>' +
    '<span class="pval" onclick="cp(this)">' + h(val) + '</span></div>';
}

function h(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function cp(el) {
  navigator.clipboard.writeText(el.textContent).then(function(){
    el.classList.add('copied');
    setTimeout(function(){ el.classList.remove('copied'); }, 1300);
  });
}

function setLvl(l) {
  lvl = l;
  document.querySelectorAll('.fbtn').forEach(function(b){
    b.classList.toggle('active', b.dataset.l === l);
  });
  document.querySelectorAll('.scard').forEach(function(c){
    c.classList.toggle('active', c.dataset.l === l);
  });
  re();
}

document.getElementById('search').addEventListener('input', function(e){
  q = e.target.value.trim(); re();
});

// Counters
var errs  = ALL.filter(function(i){return i.level==='error'}).length;
var warns = ALL.filter(function(i){return i.level==='warn'}).length;
var infos = ALL.filter(function(i){return i.level==='info'}).length;
document.getElementById('cnt-err').textContent  = errs;
document.getElementById('cnt-warn').textContent = warns;
document.getElementById('cnt-info').textContent = infos;
var ok = document.getElementById('cnt-ok');
var ol = document.getElementById('lbl-ok');
if (errs === 0 && warns === 0 && infos === 0) {
  ok.textContent = '✓'; ok.style.color = 'var(--green)'; ol.textContent = 'All Clear';
} else if (errs === 0 && warns === 0) {
  ok.textContent = infos; ol.textContent = 'Info Only';
} else if (errs === 0) {
  ok.textContent = warns; ok.style.color = 'var(--amber)'; ol.textContent = 'Warnings';
} else {
  ok.textContent = errs; ok.style.color = 'var(--red)'; ol.textContent = 'Errors Found';
}

re();
"""

_HTML = """\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PED CDS — Link Check Report</title>
<style>{CSS}</style>
</head>
<body>
<div class="page">
  <h1>Link &amp; Asset Check</h1>
  <p class="subtitle">PED CDS &mdash; {TIMESTAMP} &mdash; {TOTAL} issues scanned</p>

  <div class="summary">
    <div class="scard err" data-l="error" onclick="setLvl('error')">
      <div class="num" id="cnt-err">0</div><div class="lbl">Errors</div>
    </div>
    <div class="scard warn" data-l="warn" onclick="setLvl('warn')">
      <div class="num" id="cnt-warn">0</div><div class="lbl">Warnings</div>
    </div>
    <div class="scard info" data-l="info" onclick="setLvl('info')">
      <div class="num" id="cnt-info">0</div><div class="lbl">Info</div>
    </div>
    <div class="scard ok" data-l="all" onclick="setLvl('all')">
      <div class="num" id="cnt-ok">&mdash;</div><div class="lbl" id="lbl-ok">Status</div>
    </div>
  </div>

  <div class="controls">
    <button class="fbtn active" data-l="all"   onclick="setLvl('all')">All</button>
    <button class="fbtn"        data-l="error"  onclick="setLvl('error')">Errors</button>
    <button class="fbtn"        data-l="warn"   onclick="setLvl('warn')">Warnings</button>
    <button class="fbtn"        data-l="info"   onclick="setLvl('info')">Info</button>
    <input id="search" class="search" type="search" placeholder="Search issues, paths, categories…">
  </div>
  <div class="stats-bar" id="statsbar"></div>
  <div id="list"></div>
</div>
<script>{JS}</script>
</body>
</html>
"""


def generate_report(issues: list, out_path: Path):
    ts    = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data  = json.dumps([i.to_dict() for i in issues], ensure_ascii=False)
    js    = _JS.replace("__DATA__", data)
    html  = (_HTML
             .replace("{CSS}", _CSS)
             .replace("{JS}", js)
             .replace("{TIMESTAMP}", ts)
             .replace("{TOTAL}", str(len(issues))))
    out_path.write_text(html, encoding="utf-8")


# ─────────────────────────────────────────────────────────────
#  CONSOLE SUMMARY
# ─────────────────────────────────────────────────────────────
def print_summary(issues: list, out_path: Path):
    errs  = [i for i in issues if i.level == "error"]
    warns = [i for i in issues if i.level == "warn"]
    infos = [i for i in issues if i.level == "info"]
    W = 66
    print(f"\n{'═'*W}")
    print(f"  PED CDS Link Check — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'═'*W}")
    print(f"  {'Errors:':<12}{len(errs)}")
    print(f"  {'Warnings:':<12}{len(warns)}")
    print(f"  {'Info:':<12}{len(infos)}")

    for level, label, items in [("error","ERRORS",errs),("warn","WARNINGS",warns),("info","INFO",infos)]:
        if not items:
            continue
        sym = {"error":"✗","warn":"⚠","info":"ℹ"}[level]
        print(f"\n  {'─'*62}")
        print(f"  {label}")
        print(f"  {'─'*62}")
        for i in items:
            print(f"  {sym} [{i.category}] {i.title}")
            if i.detail:  print(f"      {i.detail}")
            if i.source:  print(f"      from: {i.source}")
            if i.target:  print(f"      →     {i.target}")

    if not issues:
        print(f"\n  ✓ No issues found — everything looks clean!")

    print(f"\n{'═'*W}")
    print(f"  HTML report → {_rel(out_path)}")
    print(f"{'═'*W}\n")


# ─────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="PED CDS Link & Asset Integrity Checker")
    ap.add_argument("--out",     default="link-report.html",
                    help="Output path for HTML report (default: link-report.html)")
    ap.add_argument("--open",    action="store_true",
                    help="Open report in browser when done")
    ap.add_argument("--console", action="store_true",
                    help="Print full console output only, skip HTML report")
    args = ap.parse_args()

    out_path = (ROOT / args.out).resolve()

    print("Scanning…")
    issues = run_checks()

    if not args.console:
        generate_report(issues, out_path)

    print_summary(issues, out_path if not args.console else None)

    if args.open and not args.console:
        import webbrowser
        webbrowser.open(out_path.as_uri())


if __name__ == "__main__":
    main()
