# Clinical Decision Tree Schema v1.0

**Hartzog.ai Clinical Decision Support — JSON Content Standard**

This folder contains the schema specification and authoring tools for all interactive clinical decision trees in the Peds project.

## Contents

| File | Purpose |
|------|---------|
| `SKILL.md` | Claude skill — instructs Claude how to author new tree JSON files |
| `assets/clinical-decision-tree-schema-v1.json` | JSON Schema Draft 2020-12 meta-schema (validates all tree instances) |
| `assets/clinical-decision-tree-example-neonatal-rds.json` | Fully annotated reference example (Neonatal Respiratory Distress, 10 nodes) |
| `references/schema-reference.md` | Field reference, enum values, node types, routing types |

## Design Principles

- **Content/Display separation** — `clinical_content` and `routing` hold clinical truth; `display_hints` are purely for the D3 renderer (CDS v3 standard)
- **Education-first** — every node has a 4-tab education popup (definitions, key points, evidence, alerts)
- **Terminal cheatsheets** — endpoint nodes include laminated-card-style quick reference + textbook link
- **Evidence-anchored** — all clinical claims reference `evidence_base{}` entries with PMIDs/DOIs
- **US guidelines only** — AAP, AHA, NRP, ACOG sources required

## Tree File Locations

Decision tree JSON files live alongside the HTML renderers:
```
apps/web/static/decision-trees/{tree-id}.html      ← D3 renderer
content/clinical-decision-tree-schema/             ← this schema
```

## Schema Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-03-31 | Initial release — neonatal/pediatric/rural-ED focus |
