# Knowledge Management System

> Single source of truth for all knowledge artifacts in the Pediatric Emergency CDS project.

## Architecture

```
knowledge/
├── registry.json          ← Unified registry (single source of truth)
└── README.md              ← Quick-start guide

scripts/
└── knowledge.sh           ← CLI for add / modify / list / search / import / validate

.claude/skills/
└── knowledge.md           ← Claude skill: /knowledge — submit chat-created content

docs/
├── KNOWLEDGE.md           ← This document (full system documentation)
├── module_registry.json   ← Legacy module registry (upstream for module:* entries)
└── MODULE_REGISTRY.md     ← Auto-generated module index
```

## The Problem

Knowledge was scattered across five independent registries with no unified view:

| Registry | Location | Tracked |
|----------|----------|---------|
| Module Registry | `docs/module_registry.json` | 79 Rust modules |
| Calculator Registry | `apps/web/src/lib/data/calculators/calculators-registry.js` | 70+ calculators |
| Decision Tree Registry | `apps/web/static/decision-trees/REGISTRY.json` | 33 decision trees |
| Evidence Registry | `apps/web/src/lib/data/contacts/evidence-registry.json` | 30 protocols |
| Education Guide Index | `content/education-guides/INDEX.md` | 16+ guides |

Each had its own schema, no shared modification tracking, and no way to query across categories.

## The Solution

**`knowledge/registry.json`** — one JSON file with a unified schema that tracks every knowledge artifact with:

- **Creation date** and author (git, claude, or human author)
- **Full modification history** with timestamps, commit SHAs, authors, and summaries
- **Provenance** linking to source documents
- **Searchable tags** across all categories
- **Status tracking** (active, draft, deprecated)

## Entry Schema

```json
{
  "id": "category:slug",
  "category": "module | calculator | decision_tree | education_guide | textbook | audio_textbook | cheat_sheet | protocol | literature_review | source_document",
  "title": "Human-readable Title",
  "description": "Brief description of the artifact",
  "path": "relative/path/from/project/root",
  "created": "2026-03-26T00:00:00Z",
  "created_by": "git | claude | author",
  "created_commit": "abc123 or null",
  "modifications": [
    {
      "date": "2026-03-26T12:00:00Z",
      "commit": "def456 or null",
      "author": "claude",
      "summary": "What changed and why"
    }
  ],
  "source_documents": ["filename.docx"],
  "tags": ["searchable", "tags"],
  "status": "active"
}
```

### Category-Specific Fields

| Category | Extra Fields |
|----------|-------------|
| `decision_tree` | `education_links` (guides, textbooks, cheat_sheets), `evidence_refs` |
| `protocol` | `evidence_level` (A/B/C), `primary_references` (DOI, year, type) |
| `education_guide` | `format` (markdown, docx) |

## CLI Reference

```bash
# ─── Adding Knowledge ───────────────────────────────────────────

# Add a new entry
./scripts/knowledge.sh add \
  --category module \
  --id "module:new_calc" \
  --title "New Calculator Module" \
  --description "Calculates X using Y formula" \
  --path "src/protocols/new_calc.rs" \
  --tags "calculator,formula,pediatric" \
  --author claude

# Add with source document provenance
./scripts/knowledge.sh add \
  --category decision_tree \
  --id "decision_tree:difficult_airway" \
  --title "Difficult Airway Algorithm" \
  --path "apps/web/static/decision-trees/difficult_airway.html" \
  --tags "airway,intubation,emergency" \
  --source-docs "Pediatric_Respiratory_Support.docx" \
  --author claude

# ─── Tracking Modifications ─────────────────────────────────────

# Record a modification
./scripts/knowledge.sh modify \
  --id "module:acid_base" \
  --summary "Updated anion gap formula to use corrected albumin" \
  --author claude

# ─── Querying ────────────────────────────────────────────────────

# List all entries
./scripts/knowledge.sh list

# List by category
./scripts/knowledge.sh list --category decision_tree

# List by status
./scripts/knowledge.sh list --status draft

# Show single entry with full history
./scripts/knowledge.sh show module:acid_base

# Search across all fields
./scripts/knowledge.sh search "sepsis"
./scripts/knowledge.sh search "neonatal"

# ─── Bulk Import ─────────────────────────────────────────────────

# Import all modules from legacy registry
./scripts/knowledge.sh import-modules

# Import all decision trees from legacy registry
./scripts/knowledge.sh import-trees

# ─── Maintenance ─────────────────────────────────────────────────

# Validate registry structure
./scripts/knowledge.sh validate

# View statistics
./scripts/knowledge.sh stats
```

## Claude Skill: /knowledge

The `/knowledge` skill lets you submit knowledge created during Claude Code sessions directly into the registry.

### Usage

After creating or modifying knowledge artifacts in a Claude Code session, type:

```
/knowledge
```

Claude will:
1. Scan the conversation for new or modified artifacts
2. Register each one in `knowledge/registry.json` with proper metadata
3. Validate the registry
4. Show a summary of what was registered

### What Gets Registered

- New Rust modules written during the session
- New or updated decision trees
- New education guides or textbooks
- Modified clinical protocols
- New calculators or scoring systems
- Any content files created or significantly edited

### Example

```
User: Create a new drowning protocol decision tree

Claude: [creates the tree file]

User: /knowledge

Claude: Registered 1 new entry:
  decision_tree:drowning_protocol — "Drowning Protocol Decision Tree"
  Created: 2026-03-26T15:30:00Z | Author: claude
  Tags: drowning, submersion, resuscitation
  Registry validated. Total entries: 85
```

## Relationship to Legacy Registries

The unified registry **consolidates but does not replace** the domain-specific registries. Each legacy registry continues to serve its consumers:

```
docs/module_registry.json
  ├── Consumed by: MODULE_REGISTRY.md auto-generation, git post-commit hook
  └── Synced to: knowledge/registry.json (module:* entries)

apps/web/static/decision-trees/REGISTRY.json
  ├── Consumed by: edu-links.js, decision tree index page
  └── Synced to: knowledge/registry.json (decision_tree:* entries)

apps/web/src/lib/data/contacts/evidence-registry.json
  ├── Consumed by: frontend evidence display
  └── Synced to: knowledge/registry.json (protocol:* entries)

apps/web/src/lib/data/calculators/calculators-registry.js
  ├── Consumed by: calculator search/filter UI, WASM bindings
  └── Synced to: knowledge/registry.json (calculator:* entries)
```

**Import direction**: Legacy → Unified (via `import-modules`, `import-trees`)
**New entries**: Created in unified registry first, then propagated to domain registries as needed.

## Workflow

### Creating New Knowledge

1. Create the artifact (code, content, document)
2. Register it: `./scripts/knowledge.sh add ...` or use `/knowledge` in Claude Code
3. Commit both the artifact and the updated registry

### Modifying Existing Knowledge

1. Make the change
2. Record it: `./scripts/knowledge.sh modify --id <id> --summary "what changed"`
3. Commit both the change and the updated registry

### Periodic Sync

To pull in any modules or trees added outside this system:

```bash
./scripts/knowledge.sh import-modules
./scripts/knowledge.sh import-trees
./scripts/knowledge.sh validate
```

## ID Convention

| Category | Pattern | Example |
|----------|---------|---------|
| Module | `module:<slug>` | `module:acid_base` |
| Calculator | `calculator:<slug>` | `calculator:phoenix_sepsis` |
| Decision Tree | `decision_tree:<slug>` | `decision_tree:nrp_algorithm` |
| Education Guide | `education_guide:<number>` | `education_guide:01` |
| Textbook | `textbook:<slug>` | `textbook:critical_care` |
| Audio Textbook | `audio_textbook:<slug>` | `audio_textbook:critical_care` |
| Cheat Sheet | `cheat_sheet:<slug>` | `cheat_sheet:endocrine` |
| Protocol | `protocol:<slug>` | `protocol:evidence_sepsis` |
| Literature Review | `literature_review:<slug>` | `literature_review:nec_2024` |
| Source Document | `source_document:<slug>` | `source_document:rural_ed_guide` |

Slugs use `snake_case`, are concise, and match the artifact's primary identifier.
