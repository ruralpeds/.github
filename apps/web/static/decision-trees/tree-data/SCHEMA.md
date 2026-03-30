# Tree Data JSON Schema
# Used by tree-engine.js for all standalone clinical decision trees

Every tree is a single `.json` file. Load with:
```js
fetch('tree-data/my_tree.json').then(r => r.json()).then(data => PedsCDSTree.init(data));
```

## Top-level fields

```json
{
  "id": "unique-tree-id",
  "title": "Display title in header",
  "subtitle": "Optional subtitle (guideline, patient population, etc.)",
  "version": "1.0",
  "source": "AHA PALS 2025",
  "mode": "neonatal | pediatric | both",
  "educationTopics": ["topic-id-1"],
  "root": { /* TreeNode */ }
}
```

## TreeNode

```json
{
  "id": "node-id",
  "label": "Short label (≤ 32 chars shown in node)",
  "type": "emergency | urgent | decision | action | assessment | diagnosis",
  "description": "Optional one-line description shown below label",
  "panels": [ /* ReferencePanel[] — shown in ⓘ popup */ ],
  "children": [ /* TreeEdge[] */ ]
}
```

## TreeEdge

```json
{
  "label": "Yes / No / HR < 60 / etc.",
  "node": { /* TreeNode */ }
}
```

## ReferencePanel types

### list
```json
{ "label": "Tab name", "type": "list",
  "content": { "title": "Optional heading", "items": ["item1","item2"], "ordered": false } }
```

### table
```json
{ "label": "Dosing", "type": "table",
  "content": { "headers": ["Drug","Dose","Route"], "rows": [["Epinephrine","0.01 mg/kg","IV/IO"]], "caption": "optional" } }
```

### text
```json
{ "label": "Protocol", "type": "text",
  "content": { "body": "Paragraph text here.", "source": "AAP NRP 8th Ed" } }
```

### alert
```json
{ "label": "Alerts", "type": "alert",
  "content": { "severity": "emergency | urgent | warning | info", "title": "Alert heading", "body": "Alert body." } }
```

### dosing
```json
{ "label": "Dosing", "type": "dosing",
  "content": { "drugs": ["Epinephrine 0.01 mg/kg IV/IO"], "notes": "Repeat q3–5 min" } }
```

### html (legacy / rich content)
```json
{ "label": "Tab name", "type": "html",
  "content": { "html": "<p>Raw HTML content rendered directly in popup.</p>" } }
```
Used for migrated legacy tree data with rich tabbed education panels.
Supports CSS classes: `.rt` (reference table), `.dt` (data table), `.bx` (info box),
`.br/.bg/.bb/.bo/.bp` (colored boxes), `.sl` (step list).
