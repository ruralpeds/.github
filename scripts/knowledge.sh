#!/usr/bin/env bash
#
# knowledge.sh — Manage the unified knowledge registry
#
# Usage:
#   ./scripts/knowledge.sh <command> [options]
#
# Commands:
#   add          Add a new knowledge entry
#   modify       Record a modification to an existing entry
#   list         List entries (optionally filtered)
#   show         Show a single entry by ID
#   search       Search entries by tag, title, or description
#   validate     Validate registry structure
#   import-modules   Import from docs/module_registry.json
#   import-trees     Import from decision-trees/REGISTRY.json
#   stats        Show registry statistics
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REGISTRY="$PROJECT_ROOT/knowledge/registry.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Ensure jq is available
check_jq() {
  if ! command -v jq &>/dev/null; then
    echo -e "${RED}Error: jq is required but not installed.${NC}" >&2
    echo "Install with: apt-get install jq / brew install jq" >&2
    exit 1
  fi
}

# Get current ISO 8601 timestamp
now_iso() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Get current git commit hash (short)
current_commit() {
  git -C "$PROJECT_ROOT" rev-parse HEAD 2>/dev/null || echo "null"
}

# Update the last_updated field
touch_registry() {
  local tmp
  tmp=$(mktemp)
  jq --arg ts "$(now_iso)" '.last_updated = $ts' "$REGISTRY" > "$tmp" && mv "$tmp" "$REGISTRY"
}

# ─── ADD ─────────────────────────────────────────────────────────────────────

cmd_add() {
  local category="" id="" title="" description="" path="" tags="" author="claude" status="active"
  local source_docs="" commit=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --category)    category="$2";     shift 2 ;;
      --id)          id="$2";           shift 2 ;;
      --title)       title="$2";        shift 2 ;;
      --description) description="$2";  shift 2 ;;
      --path)        path="$2";         shift 2 ;;
      --tags)        tags="$2";         shift 2 ;;
      --author)      author="$2";       shift 2 ;;
      --status)      status="$2";       shift 2 ;;
      --source-docs) source_docs="$2";  shift 2 ;;
      --commit)      commit="$2";       shift 2 ;;
      *) echo -e "${RED}Unknown option: $1${NC}" >&2; exit 1 ;;
    esac
  done

  # Validate required fields
  if [[ -z "$category" || -z "$id" || -z "$title" ]]; then
    echo -e "${RED}Error: --category, --id, and --title are required${NC}" >&2
    echo "Usage: knowledge.sh add --category module --id module:new --title \"Title\" [--description \"...\"] [--path \"...\"] [--tags \"t1,t2\"] [--author claude] [--source-docs \"doc1.docx,doc2.docx\"]" >&2
    exit 1
  fi

  # Check for duplicate
  if jq -e --arg id "$id" '.entries[$id]' "$REGISTRY" &>/dev/null; then
    echo -e "${RED}Error: Entry '$id' already exists. Use 'modify' to update it.${NC}" >&2
    exit 1
  fi

  # Resolve commit
  if [[ -z "$commit" ]]; then
    commit=$(current_commit)
  fi

  # Build tags array
  local tags_json="[]"
  if [[ -n "$tags" ]]; then
    tags_json=$(echo "$tags" | tr ',' '\n' | jq -R . | jq -s .)
  fi

  # Build source_documents array
  local docs_json="[]"
  if [[ -n "$source_docs" ]]; then
    docs_json=$(echo "$source_docs" | tr ',' '\n' | jq -R . | jq -s .)
  fi

  # Build entry
  local tmp
  tmp=$(mktemp)
  jq --arg id "$id" \
     --arg cat "$category" \
     --arg title "$title" \
     --arg desc "$description" \
     --arg path "$path" \
     --arg created "$(now_iso)" \
     --arg author "$author" \
     --arg commit "$commit" \
     --argjson tags "$tags_json" \
     --argjson docs "$docs_json" \
     --arg status "$status" \
     '.entries[$id] = {
        id: $id,
        category: $cat,
        title: $title,
        description: $desc,
        path: $path,
        created: $created,
        created_by: $author,
        created_commit: (if $commit == "null" then null else $commit end),
        modifications: [],
        source_documents: $docs,
        tags: $tags,
        status: $status
      }' "$REGISTRY" > "$tmp" && mv "$tmp" "$REGISTRY"

  touch_registry
  echo -e "${GREEN}Added:${NC} $id ($title)"
  echo -e "  Category: $category | Created: $(now_iso) | Author: $author"
}

# ─── MODIFY ──────────────────────────────────────────────────────────────────

cmd_modify() {
  local id="" summary="" author="claude" commit=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --id)      id="$2";      shift 2 ;;
      --summary) summary="$2"; shift 2 ;;
      --author)  author="$2";  shift 2 ;;
      --commit)  commit="$2";  shift 2 ;;
      *) echo -e "${RED}Unknown option: $1${NC}" >&2; exit 1 ;;
    esac
  done

  if [[ -z "$id" || -z "$summary" ]]; then
    echo -e "${RED}Error: --id and --summary are required${NC}" >&2
    echo "Usage: knowledge.sh modify --id module:acid_base --summary \"Updated formula\" [--author claude]" >&2
    exit 1
  fi

  # Check entry exists
  if ! jq -e --arg id "$id" '.entries[$id]' "$REGISTRY" &>/dev/null; then
    echo -e "${RED}Error: Entry '$id' not found${NC}" >&2
    exit 1
  fi

  if [[ -z "$commit" ]]; then
    commit=$(current_commit)
  fi

  local tmp
  tmp=$(mktemp)
  jq --arg id "$id" \
     --arg date "$(now_iso)" \
     --arg commit "$commit" \
     --arg author "$author" \
     --arg summary "$summary" \
     '.entries[$id].modifications += [{
        date: $date,
        commit: (if $commit == "null" then null else $commit end),
        author: $author,
        summary: $summary
      }]' "$REGISTRY" > "$tmp" && mv "$tmp" "$REGISTRY"

  touch_registry
  echo -e "${GREEN}Modified:${NC} $id"
  echo -e "  Summary: $summary | Author: $author | Date: $(now_iso)"
}

# ─── LIST ────────────────────────────────────────────────────────────────────

cmd_list() {
  local category="" status_filter=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --category) category="$2"; shift 2 ;;
      --status)   status_filter="$2"; shift 2 ;;
      *) echo -e "${RED}Unknown option: $1${NC}" >&2; exit 1 ;;
    esac
  done

  local filter=".entries | to_entries[]"
  if [[ -n "$category" ]]; then
    filter="$filter | select(.value.category == \"$category\")"
  fi
  if [[ -n "$status_filter" ]]; then
    filter="$filter | select(.value.status == \"$status_filter\")"
  fi

  echo -e "${CYAN}Knowledge Registry Entries${NC}"
  echo "─────────────────────────────────────────────────────────────"
  printf "%-40s %-18s %-12s %s\n" "ID" "CATEGORY" "STATUS" "TITLE"
  echo "─────────────────────────────────────────────────────────────"

  jq -r "[$filter] | sort_by(.value.created) | reverse | .[] |
    \"\(.key)\t\(.value.category)\t\(.value.status)\t\(.value.title)\"" "$REGISTRY" |
  while IFS=$'\t' read -r eid ecat estat etitle; do
    printf "%-40s %-18s %-12s %s\n" "$eid" "$ecat" "$estat" "$etitle"
  done

  local count
  count=$(jq "[$filter] | length" "$REGISTRY")
  echo "─────────────────────────────────────────────────────────────"
  echo -e "${GREEN}Total: $count entries${NC}"
}

# ─── SHOW ────────────────────────────────────────────────────────────────────

cmd_show() {
  local id="${1:-}"
  if [[ -z "$id" ]]; then
    echo -e "${RED}Error: Entry ID required${NC}" >&2
    echo "Usage: knowledge.sh show module:acid_base" >&2
    exit 1
  fi

  if ! jq -e --arg id "$id" '.entries[$id]' "$REGISTRY" &>/dev/null; then
    echo -e "${RED}Error: Entry '$id' not found${NC}" >&2
    exit 1
  fi

  echo -e "${CYAN}Knowledge Entry: $id${NC}"
  echo "─────────────────────────────────────────────────────────────"
  jq --arg id "$id" '.entries[$id]' "$REGISTRY" | jq -C .

  # Show modification count
  local mod_count
  mod_count=$(jq --arg id "$id" '.entries[$id].modifications | length' "$REGISTRY")
  echo ""
  echo -e "Modifications: ${YELLOW}$mod_count${NC}"
}

# ─── SEARCH ──────────────────────────────────────────────────────────────────

cmd_search() {
  local query="${1:-}"
  if [[ -z "$query" ]]; then
    echo -e "${RED}Error: Search query required${NC}" >&2
    echo "Usage: knowledge.sh search \"sepsis\"" >&2
    exit 1
  fi

  local lquery
  lquery=$(echo "$query" | tr '[:upper:]' '[:lower:]')

  echo -e "${CYAN}Search: \"$query\"${NC}"
  echo "─────────────────────────────────────────────────────────────"
  printf "%-40s %-18s %s\n" "ID" "CATEGORY" "TITLE"
  echo "─────────────────────────────────────────────────────────────"

  jq -r --arg q "$lquery" '
    .entries | to_entries[] |
    select(
      (.key | ascii_downcase | contains($q)) or
      (.value.title | ascii_downcase | contains($q)) or
      (.value.description | ascii_downcase | contains($q)) or
      (.value.tags | map(ascii_downcase) | any(contains($q)))
    ) |
    "\(.key)\t\(.value.category)\t\(.value.title)"
  ' "$REGISTRY" |
  while IFS=$'\t' read -r eid ecat etitle; do
    printf "%-40s %-18s %s\n" "$eid" "$ecat" "$etitle"
  done
}

# ─── VALIDATE ────────────────────────────────────────────────────────────────

cmd_validate() {
  echo -e "${CYAN}Validating knowledge registry...${NC}"
  local errors=0

  # Check JSON validity
  if ! jq empty "$REGISTRY" 2>/dev/null; then
    echo -e "${RED}FAIL: Invalid JSON${NC}"
    exit 1
  fi
  echo -e "${GREEN}  JSON structure: valid${NC}"

  # Check required top-level fields
  for field in schema_version project last_updated categories entries; do
    if ! jq -e ".$field" "$REGISTRY" &>/dev/null; then
      echo -e "${RED}  FAIL: Missing top-level field: $field${NC}"
      errors=$((errors + 1))
    fi
  done
  echo -e "${GREEN}  Top-level fields: present${NC}"

  # Check each entry
  local valid_categories="module calculator decision_tree education_guide textbook audio_textbook cheat_sheet protocol literature_review source_document"
  local entry_count=0
  local missing_fields=0

  for id in $(jq -r '.entries | keys[]' "$REGISTRY"); do
    entry_count=$((entry_count + 1))
    for req_field in id category title created status; do
      if ! jq -e --arg id "$id" --arg f "$req_field" '.entries[$id][$f] // empty' "$REGISTRY" &>/dev/null; then
        echo -e "${RED}  FAIL: $id missing required field: $req_field${NC}"
        missing_fields=$((missing_fields + 1))
      fi
    done

    # Check category is valid
    local cat
    cat=$(jq -r --arg id "$id" '.entries[$id].category' "$REGISTRY")
    if ! echo "$valid_categories" | grep -qw "$cat"; then
      echo -e "${YELLOW}  WARN: $id has unknown category: $cat${NC}"
    fi

    # Check id matches key
    local entry_id
    entry_id=$(jq -r --arg id "$id" '.entries[$id].id' "$REGISTRY")
    if [[ "$id" != "$entry_id" ]]; then
      echo -e "${RED}  FAIL: Key '$id' does not match entry id '$entry_id'${NC}"
      errors=$((errors + 1))
    fi
  done

  echo -e "${GREEN}  Entries checked: $entry_count${NC}"
  if [[ $missing_fields -gt 0 ]]; then
    echo -e "${YELLOW}  Missing fields: $missing_fields${NC}"
  fi

  if [[ $errors -eq 0 ]]; then
    echo -e "${GREEN}Registry is valid.${NC}"
  else
    echo -e "${RED}Registry has $errors error(s).${NC}"
    exit 1
  fi
}

# ─── IMPORT MODULES ─────────────────────────────────────────────────────────

cmd_import_modules() {
  local src="$PROJECT_ROOT/docs/module_registry.json"
  if [[ ! -f "$src" ]]; then
    echo -e "${RED}Error: Module registry not found at $src${NC}" >&2
    exit 1
  fi

  echo -e "${CYAN}Importing from module_registry.json...${NC}"
  local count=0

  for mod_path in $(jq -r '.modules | keys[]' "$src"); do
    local slug
    slug=$(basename "$mod_path" .rs)
    local id="module:$slug"

    # Skip if already exists
    if jq -e --arg id "$id" '.entries[$id]' "$REGISTRY" &>/dev/null; then
      continue
    fi

    local title desc created created_commit last_mod last_mod_commit
    desc=$(jq -r --arg p "$mod_path" '.modules[$p].description // ""' "$src")
    created=$(jq -r --arg p "$mod_path" '.modules[$p].created // ""' "$src")
    created_commit=$(jq -r --arg p "$mod_path" '.modules[$p].created_commit // "null"' "$src")
    last_mod=$(jq -r --arg p "$mod_path" '.modules[$p].last_modified // ""' "$src")
    last_mod_commit=$(jq -r --arg p "$mod_path" '.modules[$p].last_modified_commit // "null"' "$src")
    title=$(echo "$slug" | sed 's/_/ /g; s/\b\(.\)/\u\1/g')

    # Build source docs array
    local docs_json
    docs_json=$(jq --arg p "$mod_path" '.modules[$p].source_documents // []' "$src")

    # Build modifications array
    local mods_json="[]"
    if [[ "$last_mod" != "$created" && -n "$last_mod" ]]; then
      mods_json=$(jq -n --arg d "$last_mod" --arg c "$last_mod_commit" \
        '[{date: $d, commit: (if $c == "null" then null else $c end), author: "git", summary: "Module modification tracked by git post-commit hook"}]')
    fi

    local tmp
    tmp=$(mktemp)
    jq --arg id "$id" \
       --arg title "$title" \
       --arg desc "$desc" \
       --arg path "$mod_path" \
       --arg created "$created" \
       --arg cc "$created_commit" \
       --argjson docs "$docs_json" \
       --argjson mods "$mods_json" \
       '.entries[$id] = {
          id: $id,
          category: "module",
          title: $title,
          description: $desc,
          path: $path,
          created: $created,
          created_by: "git",
          created_commit: (if $cc == "null" then null else $cc end),
          modifications: $mods,
          source_documents: $docs,
          tags: [],
          status: "active"
        }' "$REGISTRY" > "$tmp" && mv "$tmp" "$REGISTRY"

    count=$((count + 1))
  done

  touch_registry
  echo -e "${GREEN}Imported $count new module entries${NC}"
}

# ─── IMPORT TREES ────────────────────────────────────────────────────────────

cmd_import_trees() {
  local src="$PROJECT_ROOT/apps/web/static/decision-trees/REGISTRY.json"
  if [[ ! -f "$src" ]]; then
    echo -e "${RED}Error: Decision tree registry not found at $src${NC}" >&2
    exit 1
  fi

  echo -e "${CYAN}Importing from decision tree REGISTRY.json...${NC}"
  local count=0

  # Trees is an array of objects with .id field
  local tree_count
  tree_count=$(jq '.trees | length' "$src")

  for i in $(seq 0 $((tree_count - 1))); do
    local tree_id
    tree_id=$(jq -r ".trees[$i].id" "$src")
    local id="decision_tree:$tree_id"

    # Skip if already exists
    if jq -e --arg id "$id" '.entries[$id]' "$REGISTRY" &>/dev/null; then
      continue
    fi

    local title filename created tags_json edu_json
    title=$(jq -r ".trees[$i].title // \"\"" "$src")
    filename=$(jq -r ".trees[$i].filename // \"\"" "$src")
    created=$(jq -r ".trees[$i].created // \"2026-03-24\"" "$src")
    tags_json=$(jq ".trees[$i].tags // []" "$src")
    edu_json=$(jq ".trees[$i].education_links // {}" "$src")

    local tree_path="apps/web/static/decision-trees/${filename}"

    local tmp
    tmp=$(mktemp)
    jq --arg id "$id" \
       --arg title "$title" \
       --arg path "$tree_path" \
       --arg created "${created}T00:00:00Z" \
       --argjson tags "$tags_json" \
       --argjson edu "$edu_json" \
       '.entries[$id] = {
          id: $id,
          category: "decision_tree",
          title: $title,
          description: $title,
          path: $path,
          created: $created,
          created_by: "claude",
          created_commit: null,
          modifications: [],
          source_documents: [],
          tags: $tags,
          education_links: $edu,
          status: "active"
        }' "$REGISTRY" > "$tmp" && mv "$tmp" "$REGISTRY"

    count=$((count + 1))
  done

  touch_registry
  echo -e "${GREEN}Imported $count new decision tree entries${NC}"
}

# ─── STATS ───────────────────────────────────────────────────────────────────

cmd_stats() {
  echo -e "${CYAN}Knowledge Registry Statistics${NC}"
  echo "─────────────────────────────────────────────────────────────"
  echo -e "Schema version: $(jq -r '.schema_version' "$REGISTRY")"
  echo -e "Last updated:   $(jq -r '.last_updated' "$REGISTRY")"
  echo ""

  echo "Entries by category:"
  jq -r '
    .entries | to_entries | group_by(.value.category) |
    map({category: .[0].value.category, count: length}) |
    sort_by(.count) | reverse | .[] |
    "  \(.category): \(.count)"
  ' "$REGISTRY"

  echo ""
  local total
  total=$(jq '.entries | length' "$REGISTRY")
  local total_mods
  total_mods=$(jq '[.entries[].modifications | length] | add // 0' "$REGISTRY")
  echo -e "Total entries:       ${GREEN}$total${NC}"
  echo -e "Total modifications: ${YELLOW}$total_mods${NC}"

  echo ""
  echo "Entries by status:"
  jq -r '
    .entries | to_entries | group_by(.value.status) |
    map({status: .[0].value.status, count: length}) | .[] |
    "  \(.status): \(.count)"
  ' "$REGISTRY"

  echo ""
  echo "Entries by author:"
  jq -r '
    .entries | to_entries | group_by(.value.created_by) |
    map({author: .[0].value.created_by, count: length}) | .[] |
    "  \(.author): \(.count)"
  ' "$REGISTRY"
}

# ─── MAIN ────────────────────────────────────────────────────────────────────

main() {
  check_jq

  if [[ ! -f "$REGISTRY" ]]; then
    echo -e "${RED}Error: Registry not found at $REGISTRY${NC}" >&2
    echo "Run from project root or ensure knowledge/registry.json exists." >&2
    exit 1
  fi

  local cmd="${1:-help}"
  shift || true

  case "$cmd" in
    add)            cmd_add "$@" ;;
    modify)         cmd_modify "$@" ;;
    list)           cmd_list "$@" ;;
    show)           cmd_show "$@" ;;
    search)         cmd_search "$@" ;;
    validate)       cmd_validate "$@" ;;
    import-modules) cmd_import_modules ;;
    import-trees)   cmd_import_trees ;;
    stats)          cmd_stats ;;
    help|--help|-h)
      echo "Usage: knowledge.sh <command> [options]"
      echo ""
      echo "Commands:"
      echo "  add              Add a new knowledge entry"
      echo "  modify           Record a modification to an existing entry"
      echo "  list             List entries (--category, --status filters)"
      echo "  show <id>        Show a single entry"
      echo "  search <query>   Search by tag, title, or description"
      echo "  validate         Validate registry structure"
      echo "  import-modules   Import from docs/module_registry.json"
      echo "  import-trees     Import from decision-trees/REGISTRY.json"
      echo "  stats            Show registry statistics"
      ;;
    *)
      echo -e "${RED}Unknown command: $cmd${NC}" >&2
      echo "Run 'knowledge.sh help' for usage." >&2
      exit 1
      ;;
  esac
}

main "$@"
