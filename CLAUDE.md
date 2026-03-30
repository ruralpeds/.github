# Peds — Pediatric Emergency Decision Support

## Project Structure

- `apps/web/` — SvelteKit web application
- `apps/web/static/decision-trees/` — Standalone clinical decision trees
- `apps/web/static/decision-trees/tree-engine.js` — Shared D3 rendering engine for ALL standalone trees
- `apps/web/static/decision-trees/tree-data/*.json` — Disease-specific tree data (clinical content only)
- `apps/web/src/lib/d3/` — D3 layout utilities and schema types for Svelte-rendered trees
- `apps/web/src/lib/data/trees/` — TypeScript tree definitions for inline Svelte routes

## Decision Tree Architecture

All standalone decision trees use a shared architecture:

1. **`tree-engine.js`** — Single shared rendering engine. Handles D3 layout, pan/zoom, collapse/expand, popups, theming. Edit this to change behavior for ALL trees.
2. **`tree-data/*.json`** — Disease-specific JSON data files. Edit these for clinical content/scoring. One file per tree.
3. **`*_decision_tree.html`** — Thin loader pages that fetch JSON and call `PedsCDSTree.init(data)`. All identical except the JSON filename.

**Do NOT put rendering logic in tree data files.** Keep clinical content (nodes, edges, panels) in JSON and rendering in the shared engine.

## Creating New Decision Trees

When creating a new decision tree, create a JSON file in `apps/web/static/decision-trees/tree-data/` following this schema:

### Top-level structure
```json
{
  "id": "unique-tree-id",
  "title": "Display Title in Header",
  "subtitle": "Optional — guideline, patient population, etc.",
  "version": "1.0",
  "source": "AHA PALS 2025",
  "mode": "neonatal | pediatric | both",
  "educationTopics": ["topic-id-1"],
  "root": { /* TreeNode — see below */ }
}
```

### TreeNode
```json
{
  "id": "unique-node-id",
  "label": "Short label (shown in node box, max ~32 chars)",
  "type": "emergency | urgent | decision | action | assessment | diagnosis",
  "description": "Optional one-line description shown below label in node",
  "panels": [ /* ReferencePanel[] — tabbed popup content shown when clicking info button */ ],
  "children": [ /* TreeEdge[] — branching paths */ ]
}
```

**Node types and their clinical meaning:**
- `emergency` (red) — Immediate life-threatening action
- `urgent` (orange) — Time-sensitive intervention
- `decision` (yellow) — Clinical assessment/branching point (use this for Yes/No questions)
- `action` (green) — Therapeutic action
- `assessment` (blue) — Evaluation/monitoring step
- `diagnosis` (purple) — Diagnostic conclusion

### TreeEdge (branching paths)
```json
{
  "label": "Yes / No / HR < 60 / Shockable / etc.",
  "node": { /* TreeNode */ }
}
```
The `label` is displayed on the connecting line between parent and child nodes. Use clear clinical decision labels.

### ReferencePanel types (tabbed popup content)

**list** — Bulleted or numbered list
```json
{ "label": "Tab Name", "type": "list",
  "content": { "title": "Optional heading", "items": ["item1", "item2"], "ordered": false } }
```

**table** — Data table with headers
```json
{ "label": "Dosing", "type": "table",
  "content": { "headers": ["Drug", "Dose", "Route"], "rows": [["Epinephrine", "0.01 mg/kg", "IV/IO"]], "caption": "optional" } }
```

**text** — Paragraph with optional citation
```json
{ "label": "Protocol", "type": "text",
  "content": { "body": "Paragraph text here.", "source": "AAP NRP 8th Ed" } }
```

**alert** — Color-coded alert box
```json
{ "label": "Alerts", "type": "alert",
  "content": { "severity": "emergency | urgent | warning | info", "title": "Alert heading", "body": "Alert body." } }
```

**dosing** — Drug dosing list
```json
{ "label": "Dosing", "type": "dosing",
  "content": { "drugs": ["Epinephrine 0.01 mg/kg IV/IO q3-5 min"], "notes": "Repeat every 3-5 minutes" } }
```

### Complete minimal example
```json
{
  "id": "example-tree",
  "title": "Example Clinical Decision Tree",
  "version": "1.0",
  "source": "Example Guideline 2025",
  "mode": "pediatric",
  "root": {
    "id": "start",
    "label": "Patient Presents",
    "type": "assessment",
    "description": "Initial clinical assessment",
    "panels": [
      { "label": "Workup", "type": "list", "content": { "items": ["Vital signs", "Point-of-care labs", "Physical exam"] } }
    ],
    "children": [
      {
        "label": "Criteria met?",
        "node": {
          "id": "decision-1",
          "label": "Meets Criteria?",
          "type": "decision",
          "description": "Evaluate against clinical criteria",
          "children": [
            {
              "label": "Yes",
              "node": {
                "id": "treat",
                "label": "Start Treatment",
                "type": "action",
                "description": "Initiate protocol",
                "panels": [
                  { "label": "Protocol", "type": "list", "content": { "title": "Steps", "items": ["Step 1", "Step 2"], "ordered": true } }
                ]
              }
            },
            {
              "label": "No",
              "node": {
                "id": "observe",
                "label": "Observe & Reassess",
                "type": "assessment",
                "description": "Monitor and re-evaluate in 30 min"
              }
            }
          ]
        }
      }
    ]
  }
}
```

### After creating the JSON, create the HTML loader

Copy `tree-loader-template.html` and change the `DATA_FILE` path:
```js
const DATA_FILE = 'tree-data/your_new_tree.json';
```

Or create a minimal HTML file:
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Your Tree Title</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#0b1121;--bg2:#0f172a;--surface:#1e293b;--border:#334155;--text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;--accent:#38bdf8;--red:#f87171;--rbg:#2a1215;--orange:#fb923c;--obg:#2a1a0a;--yellow:#fbbf24;--ybg:#2a2006;--green:#4ade80;--gbg:#0a2a1a;--blue:#60a5fa;--bbg:#0f1d3a;--purple:#c084fc;--pbg:#1a0f2e}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'IBM Plex Sans',sans-serif;background:var(--bg);color:var(--text);overflow:hidden;height:100vh;width:100vw}
#loading{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;font-family:'IBM Plex Mono',monospace;font-size:.9rem;color:#94a3b8;background:#0b1121}
.spinner{width:36px;height:36px;border:3px solid #334155;border-top-color:#38bdf8;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div id="loading"><div class="spinner"></div><span>Loading clinical data...</span></div>
<script src="tree-engine.js"></script>
<script>
  fetch('tree-data/your_new_tree.json')
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(data => { document.getElementById('loading').remove(); PedsCDSTree.init(data); })
    .catch(err => { document.getElementById('loading').innerHTML = '<div style="color:#f87171;text-align:center"><div style="font-size:1.5rem;margin-bottom:.5rem">Warning</div><div>Failed to load tree data</div><div style="font-size:.75rem;margin-top:.5rem;color:#64748b">' + err.message + '</div></div>'; });
</script>
<script src="../theme-bridge.js"></script>
<script src="../shell.js"></script>
<script src="../edu-links.js"></script>
</body>
</html>
```
