---
name: clinical-decision-tree
description: Generate JSON files for clinical decision trees in the Hartzog.ai Clinical Decision Tree standard. Use this skill whenever the user wants to CREATE, AUTHOR, or CONVERT clinical content into a decision tree JSON file for rural emergency, neonatal, or pediatric medicine settings. Triggers on: "create a decision tree for", "build a CDS tree on", "new decision tree about", "convert this protocol to a decision tree", "write a CDT for", "make a JSON for the decision tree", "clinical decision support JSON for", or any combination of clinical protocol + decision tree / flowchart / CDS. Also triggers when the user says "make a new tree" or "add a tree for [topic]" — this skill handles all clinical decision tree JSON authoring. Always use this skill when a NEW decision tree file needs to be written or a clinical protocol needs to be structured as machine-readable JSON.
---

# Clinical Decision Tree Skill

Produces complete, validated JSON files conforming to the **Clinical Decision Tree Schema v1.0.0** (`assets/clinical-decision-tree-schema-v1.json`).

## Before Starting

1. **Read `references/schema-reference.md`** — contains all field names, allowed enum values, required fields, and structural patterns. Do this before authoring any tree.
2. **Read `assets/clinical-decision-tree-example-neonatal-rds.json`** for a fully annotated working example if needed for structure reference.

---

## Workflow

### Step 1 — Understand the Clinical Topic

Gather from the user or determine from context:
- **Topic**: What clinical condition or decision process does this tree address?
- **Specialty**: neonatology / pediatric-emergency / rural-emergency / etc.
- **Population**: Age, gestational age, weight range; exclusions
- **Entry scenario**: What clinical presentation triggers this tree?
- **Complexity**: How many decision nodes? (Simple = 3–5 nodes; Complex = 6–15+ nodes)
- **Guideline sources**: What AAP/AHA/other US guidelines should inform this tree?

If information is missing, search PubMed for current guidelines before authoring.

### Step 2 — Sketch the Node Map

Before writing JSON, mentally (or explicitly) map the tree:
```
entry-node → decision-node-1 → [branch-A → action-node → terminal-A]
                              → [branch-B → assessment-node → decision-node-2 → ...]
```
Identify:
- Entry node (exactly 1)
- All decision branches and their conditions
- All action nodes (interventions)
- All terminal nodes (end states requiring cheatsheets)
- Education popup content for each node

### Step 3 — Build the JSON

Always output a **complete, valid JSON file** — not pseudocode or snippets.

Follow this authoring order:
1. `schema_version` → `"1.0.0"`
2. `tree{}` — metadata block
3. `glossary{}` — define all key terms used in nodes
4. `evidence_base{}` — cite all guidelines and key references with PMIDs/DOIs
5. `nodes{}` — build node by node in flow order (entry → terminal)
6. `display_config{}` — set theme and banner

### Step 4 — Quality Checklist

Before finalizing, verify:

**Clinical content**
- [ ] Every `evidence_ref` string has a matching key in `evidence_base`
- [ ] Every `glossary_ref` string has a matching key in `glossary`
- [ ] Every `next_node_id` in routing matches an actual node key in `nodes`
- [ ] `entry_node_id` in `tree{}` matches an actual entry-type node
- [ ] All terminal nodes have `terminal_content` with cheatsheet + textbook_link
- [ ] Every cheatsheet has `immediate_actions` (minimum 1 item)
- [ ] Drug dosing in `medications[]` is weight-based (mg/kg) for pediatric/neonatal trees
- [ ] ICD-10 codes are valid (use ICD-10 Codes tool if available)
- [ ] All `guideline_sources` are US-based organizations

**Schema compliance**
- [ ] All `id` fields are kebab-case (`[a-z0-9-]+`)
- [ ] `routing.type === "end"` for all terminal nodes
- [ ] Education popup tabs do not exceed `maxItems` limits (definitions ≤5, key_points ≤5)
- [ ] `display_hints.urgency_level` matches node semantic type
- [ ] `clinical_pearls` ≤ 6 items, `common_pitfalls` ≤ 5 items

**Separation of concerns**
- [ ] NO display information in `clinical_content` or `routing`
- [ ] NO clinical logic in `display_hints`
- [ ] Display rendering entirely contained in `display_hints` and `display_config`

---

## Node Authoring Guide

### entry node
- `type: "entry"`
- `routing.type: "single"` → leads to first decision or assessment
- Contains initial assessment_items (vitals, history)
- Education popup: overview of condition and red flags

### decision node
- `type: "decision"` + `urgency_level: "decision"` (yellow)
- `routing.type: "binary"` or `"conditional"`
- `routing.question` = clinical question the clinician is answering
- Each branch has: `id`, `label`, `short_label` (≤20 chars), `condition`, `next_node_id`, `urgency`
- Education popup: definitions of terms used in criteria; clinical pearls for this decision point

### assessment node
- `type: "assessment"` + `urgency_level: "assessment"` (blue)
- `clinical_content.assessment_items[]` with normal ranges and critical values
- `routing.type: "scored"` when using a validated score (Downes, APGAR, PELOD, etc.)
- For scored routing, `diagnostic_criteria.score_thresholds[].next_node_id` drives routing

### action node
- `type: "action"` + `urgency_level: "urgent"` or `"emergency"`
- `clinical_content.actions[]` — numbered, ordered
- Each action has `urgency: "immediate"` | `"urgent"` | `"routine"`
- Drug actions include `dosing{}` block with weight-based dosing
- Education popup: definitions + key points + evidence tab

### terminal node
- `type: "terminal"`
- `routing.type: "end"` — no further routing
- MUST have `terminal_content.cheatsheet{}` and `terminal_content.textbook_link{}`
- Cheatsheet follows laminated pocket card standard: diagnosis → actions → meds → monitoring → disposition → pearls → pitfalls → family communication
- `textbook_link.path` is relative to `tree.textbook_base_url`; use `repo_path` for Peds GitHub repo reference

---

## Clinical Standards

### Drug Dosing
- Always weight-based (`dose_per_kg`) for neonatal and pediatric trees
- Include `dose_min`, `dose_max`, and `max_single_dose` where applicable
- Specify `concentration` and `preparation` for high-risk medications
- `route` must match enum: `IV | IM | PO | ET | IO | SC | IN | topical | inhaled | intratracheal`

### SpO2 Targets (NRP 2021 / AHA 2025)
- Neonatal (0–24h): 90–95% preductal
- After first hour: 90–95%
- Avoid SpO2 > 95% in premature/near-term (retinopathy/lung injury risk)

### Disposition
- Level II nursery → `"Level-II-nursery"`
- Transfer indication → `"transport-NICU"` or `"NICU-III"`
- Always include `criteria_to_upgrade` and `consult_required` in terminal cheatsheets

### Evidence
- Use US-based sources only (AAP, AHA, ACOG, ABP, NRP, AAP/AHA guidelines)
- Prefer PMID and DOI when available
- `evidence_level` uses Oxford CEBM: `1a|1b|2a|2b|3|4|5|expert-consensus|guideline`

---

## Site Integration

### Textbook Links
The Peds site serves education guides at:
```
https://hartzog.ai/textbook{path}{#section_anchor}
```
`textbook_base_url` in `tree{}` = `"https://hartzog.ai/textbook"`

Repo paths in `content/education-guides/` follow the naming pattern:
```
content/education-guides/{NN}-{slug}.docx
```

### Decision Tree Rendering
Decision tree HTML files are saved to:
```
apps/web/static/decision-trees/{tree-id}.html
```
The JSON content file is the source of truth; the HTML renderer reads it.

---

## Output Format

Always output a complete `.json` file — never pseudocode or partial JSON.

File naming: `{tree-id}-v{major}.{minor}.{patch}.json`

Save to `/mnt/user-data/outputs/{tree-id}-v1.0.0.json` and present to user.

If the GitHub PAT is available in memory, optionally offer to push to `timothyhartzog/Peds` at the appropriate path per `textbook_link.repo_path`.

---

## Common Mistakes to Avoid

1. **Circular routing** — trace every path from entry_node_id to ensure it reaches a terminal
2. **Orphan nodes** — every node except entry must be reachable from at least one branch
3. **Missing default_next_node_id** — conditional routing MUST have a fallback
4. **Display logic in clinical content** — colors, icons, layout belong in `display_hints` only
5. **Inline definitions instead of glossary_ref** — prefer `glossary_ref` to keep content DRY
6. **Non-US guidelines** — all guideline_sources must be US organizations
7. **Missing textbook_link** — every terminal node must have a textbook_link pointing to an education guide in the Peds repo

---

## Quick Reference — Minimum Valid Tree Structure

```json
{
  "schema_version": "1.0.0",
  "tree": {
    "id": "example-tree",
    "title": "Example Tree",
    "specialty": "rural-emergency",
    "population": { "description": "…" },
    "entry_node_id": "entry-main",
    "version": "1.0.0",
    "guideline_sources": [{ "organization": "AAP", "title": "…" }],
    "last_reviewed": "2025-01-01",
    "textbook_base_url": "https://hartzog.ai/textbook"
  },
  "nodes": {
    "entry-main": {
      "id": "entry-main",
      "type": "entry",
      "title": "Entry: Presenting Problem",
      "clinical_content": { "summary": "…" },
      "routing": { "type": "single", "next_node_id": "terminal-outcome" }
    },
    "terminal-outcome": {
      "id": "terminal-outcome",
      "type": "terminal",
      "title": "Diagnosis / Disposition",
      "clinical_content": { "summary": "…" },
      "routing": { "type": "end" },
      "terminal_content": {
        "cheatsheet": {
          "diagnosis": { "label": "Confirmed Dx" },
          "immediate_actions": [{ "order": 1, "action": "…" }]
        },
        "textbook_link": {
          "title": "Education Guide Title",
          "path": "/topic-slug"
        }
      }
    }
  }
}
```
