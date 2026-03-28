# Knowledge Registry

**Single source of truth** for all knowledge artifacts in the Pediatric Emergency CDS project.

## Overview

The knowledge registry (`registry.json`) unifies tracking of every knowledge artifact — modules, calculators, decision trees, education guides, textbooks, protocols, and evidence — into one schema with creation dates, modification history, provenance, and status.

## Registry Schema

Every entry follows this structure:

```json
{
  "id": "category:slug",
  "category": "module | calculator | decision_tree | education_guide | textbook | audio_textbook | cheat_sheet | protocol | literature_review | source_document",
  "title": "Human-readable title",
  "description": "Brief description of the knowledge artifact",
  "path": "Relative path from project root",
  "created": "ISO 8601 timestamp",
  "created_by": "git | claude | author",
  "created_commit": "SHA or null",
  "modifications": [
    {
      "date": "ISO 8601 timestamp",
      "commit": "SHA or null",
      "author": "git | claude | author",
      "summary": "What changed"
    }
  ],
  "source_documents": ["filename.docx"],
  "tags": ["searchable", "tags"],
  "status": "active | deprecated | draft"
}
```

### Category-Specific Fields

- **decision_tree**: `education_links`, `evidence_refs`
- **protocol**: `evidence_level`, `primary_references`
- **education_guide**: `format` (markdown, docx)

## Management

Use the management script:

```bash
# Add new knowledge entry
./scripts/knowledge.sh add --category module --id "module:new_calc" \
  --title "New Calculator" --path "src/protocols/new_calc.rs" \
  --description "Description" --tags "tag1,tag2"

# Record a modification
./scripts/knowledge.sh modify --id "module:acid_base" \
  --summary "Updated anion gap formula" --author claude

# Query entries
./scripts/knowledge.sh list                          # all entries
./scripts/knowledge.sh list --category decision_tree # by category
./scripts/knowledge.sh show module:acid_base         # single entry
./scripts/knowledge.sh search "sepsis"               # search by tag/title

# Validate registry
./scripts/knowledge.sh validate

# Import from existing registries
./scripts/knowledge.sh import-modules    # from docs/module_registry.json
./scripts/knowledge.sh import-trees      # from decision-trees/REGISTRY.json
```

## Claude Skill

Use `/knowledge` in Claude Code to submit knowledge created during Claude chats directly into the registry. See `.claude/skills/knowledge.md`.

## Relationship to Existing Registries

| Legacy Registry | Location | Status |
|-----------------|----------|--------|
| Module Registry | `docs/module_registry.json` | Upstream source for `module:*` entries |
| Decision Tree Registry | `apps/web/static/decision-trees/REGISTRY.json` | Upstream source for `decision_tree:*` entries |
| Evidence Registry | `apps/web/src/lib/data/contacts/evidence-registry.json` | Upstream source for `protocol:*` entries |
| Calculator Registry | `apps/web/src/lib/data/calculators/calculators-registry.js` | Upstream source for `calculator:*` entries |
| Education Guide Index | `content/education-guides/INDEX.md` | Upstream source for `education_guide:*` entries |

The unified registry consolidates all of these into one queryable, trackable format while preserving the originals for their domain-specific consumers.
