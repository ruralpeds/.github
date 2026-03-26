---
name: knowledge
description: Submit knowledge created in Claude chats into the unified knowledge registry
user_invocable: true
---

# /knowledge — Submit Knowledge to Registry

You are managing the unified knowledge registry for the Pediatric Emergency CDS project. The registry is at `knowledge/registry.json` and is the **single source of truth** for all knowledge artifacts.

## When invoked

1. **Identify what knowledge was created or modified** in the current conversation. Look for:
   - New Rust modules, calculators, decision trees, education guides, textbooks, cheat sheets, protocols, literature reviews, or source documents
   - Modifications to existing knowledge artifacts
   - New clinical content, algorithms, or evidence

2. **For each new artifact**, add an entry to `knowledge/registry.json` using the management script:
   ```bash
   ./scripts/knowledge.sh add \
     --category <category> \
     --id "<category>:<slug>" \
     --title "Human-readable Title" \
     --description "Brief description" \
     --path "relative/path/from/project/root" \
     --tags "tag1,tag2,tag3" \
     --author claude
   ```

   Valid categories: `module`, `calculator`, `decision_tree`, `education_guide`, `textbook`, `audio_textbook`, `cheat_sheet`, `protocol`, `literature_review`, `source_document`

3. **For each modified artifact**, record the modification:
   ```bash
   ./scripts/knowledge.sh modify \
     --id "<category>:<slug>" \
     --summary "What was changed" \
     --author claude
   ```

4. **If unsure what was created**, scan the conversation for:
   - Files written or edited (check paths against existing registry entries)
   - New content directories or documents
   - Clinical protocols or algorithms discussed and implemented

5. **After registering**, run validation:
   ```bash
   ./scripts/knowledge.sh validate
   ```

6. **Show the user** what was registered:
   ```bash
   ./scripts/knowledge.sh stats
   ```

## Registry Entry Schema

Every entry needs at minimum:
- `id`: `category:slug` format (e.g., `module:sepsis`, `decision_tree:nrp_algorithm`)
- `category`: One of the valid categories above
- `title`: Human-readable name
- `created`: Auto-set to current timestamp
- `created_by`: Set to `claude` for chat-created content
- `status`: `active` (default), `draft`, or `deprecated`

## ID Naming Convention

- Use snake_case for slugs: `module:acid_base`, `decision_tree:neonatal_glucose`
- Prefix with category: `module:`, `calculator:`, `decision_tree:`, `education_guide:`, etc.
- Keep slugs concise but descriptive

## Important Rules

- **Never create duplicate IDs** — check with `./scripts/knowledge.sh show <id>` first
- **Always include tags** — they power search functionality
- **Track provenance** — if content came from a source document, include it via `--source-docs`
- **Record every modification** — even small changes get a modification entry with a summary
- The registry is the single source of truth. If content exists but isn't registered, register it.

## Bulk Import

If the conversation created many artifacts, you can also directly edit `knowledge/registry.json` to add entries in batch, following the existing schema exactly. Always validate after bulk edits.
