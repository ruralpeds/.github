# Clinical Decision Tree Schema — Field Reference

Schema version: **1.0.0**  
Full spec: `assets/clinical-decision-tree-schema-v1.json`  
Annotated example: `assets/clinical-decision-tree-example-neonatal-rds.json`

---

## Top-Level Structure

```
tree.json
├── schema_version         "1.0.0"
├── tree {}                Metadata (id, title, specialty, population, entry_node_id, guideline_sources…)
├── glossary {}            Reusable term definitions (key → definition object)
├── evidence_base {}       Citation pool (key → reference object)
├── nodes {}               All nodes keyed by node.id
└── display_config {}      D3 rendering hints — no clinical content
```

---

## Node Types

| type        | Use when…                                          | CDS v3 color |
|-------------|-----------------------------------------------------|--------------|
| `entry`     | Starting node (exactly one per tree)               | blue         |
| `decision`  | Presenting a branching question to the clinician   | yellow       |
| `assessment`| Gathering data (labs, vitals, scoring)             | blue         |
| `action`    | Immediate clinical intervention required           | green        |
| `diagnosis` | Confirmed or working diagnosis                     | purple       |
| `terminal`  | End state with cheatsheet + textbook link          | varies       |

---

## Routing Types

| type          | When to use                                        | Required fields                          |
|---------------|-----------------------------------------------------|------------------------------------------|
| `end`         | Terminal nodes — no next node                      | (none)                                   |
| `single`      | One path forward, no branching                     | `next_node_id`                           |
| `binary`      | Yes/No question — two branches                     | `question`, `branches[2]`               |
| `conditional` | Multiple conditions evaluated in order             | `question`, `branches[]`, `default_next_node_id` |
| `scored`      | Score-based routing (e.g., Downes)                 | Uses `diagnostic_criteria.score_thresholds[].next_node_id` |
| `checklist`   | All items must be confirmed before proceeding      | `checklist_items[]`, `next_node_id`      |

---

## Education Popup Tabs

Each education popup has 4 optional tabs. Only include tabs with content — omit empty ones.

| Tab key       | Purpose                             | Max items |
|---------------|--------------------------------------|-----------|
| `definitions` | Key terms at this decision point    | 5         |
| `key_points`  | Clinical pearls (★)                 | 5         |
| `evidence`    | Guideline citations from evidence_base | unlimited |
| `alerts`      | Critical safety warnings (⚠)        | unlimited |

**Alert severity values:** `"warning"` | `"critical"` | `"informational"`

---

## Criterion Categories

`vital-sign` | `physical-exam` | `laboratory` | `imaging` | `history` | `clinical-score` | `gestational-age` | `weight` | `symptom` | `intervention-response` | `other`

---

## Action Categories

`airway` | `breathing` | `circulation` | `medication` | `lab-order` | `imaging-order` | `consultation` | `disposition` | `monitoring` | `iv-access` | `fluid` | `notify` | `documentation` | `other`

---

## Terminal Content Structure

```
terminal_content
├── cheatsheet
│   ├── diagnosis          { label, icd10_code, severity, one_liner }
│   ├── immediate_actions  [ { order, action, detail, urgency } ]
│   ├── medications        [ { drug, dose_per_kg, route, frequency… } ]
│   ├── monitoring_parameters [ { parameter, frequency, target, escalation_trigger } ]
│   ├── disposition        { level_of_care, criteria_to_upgrade[], consult_required[] }
│   ├── clinical_pearls    [ string ] (max 6)
│   ├── common_pitfalls    [ string ] (max 5)
│   └── family_communication  string
└── textbook_link
    ├── title              Full textbook document title
    ├── path               Relative to tree.textbook_base_url
    ├── section_anchor     HTML anchor #id
    ├── document_type      education-guide | textbook | cheat-sheet | etc.
    └── repo_path          Path in Peds GitHub repo
```

---

## Display Hints → CDS v3 Mapping

| urgency_level  | CDS v3 node color |
|----------------|-------------------|
| `emergency`    | red               |
| `urgent`       | orange            |
| `decision`     | yellow            |
| `action`       | green             |
| `assessment`   | blue              |
| `diagnosis`    | purple            |
| `informational`| grey              |

---

## Glossary Reference Pattern

Prefer referencing glossary keys over inline definitions:
```json
{ "glossary_ref": "RDS" }    // preferred — links to glossary.RDS
{ "term": "…", "definition": "…" }  // inline — only when not in glossary
```

---

## Evidence Base Reference Pattern

```json
{ "ref_key": "ref-nrp-2021", "annotation": "NRP 8th Ed: CPAP initiation thresholds" }
```
All `evidence_ref` strings in criterion, action, and key_point objects must match a key in `evidence_base`.

---

## Disposition Level of Care Values

`NICU-III` | `NICU-II` | `Level-II-nursery` | `ED-admit` | `ward` | `observation` | `discharge` | `transport-out` | `transport-NICU`

---

## Required vs Optional Fields Summary

### tree{} — Required
`id`, `title`, `specialty`, `population.description`, `entry_node_id`, `version`, `guideline_sources[].organization`, `guideline_sources[].title`, `last_reviewed`

### Node{} — Required
`id`, `type`, `title`, `clinical_content.summary`, `routing.type`

### Node{} — Required if type === "terminal"
`terminal_content.cheatsheet.diagnosis.label`, `terminal_content.cheatsheet.immediate_actions`, `terminal_content.textbook_link.title`, `terminal_content.textbook_link.path`

---

## File Naming Convention

```
{tree-id}-v{version}.json         // instance file
{tree-id}-v{version}-schema.json  // always reference schema-v1.0.0 in $schema
```

Example: `neonatal-respiratory-distress-v1.0.0.json`
