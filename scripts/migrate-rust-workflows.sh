#!/usr/bin/env bash
# migrate-rust-workflows.sh
#
# Replaces per-repo local Rust workflow files with thin callers that delegate
# to the centralised reusable workflows in ruralpeds/.github.
#
# USAGE
#   ./migrate-rust-workflows.sh [--dry-run] [--repo <name>] [--no-pr]
#
# OPTIONS
#   --dry-run        Print what would be done; make no changes and open no PRs.
#   --repo <name>    Process only the named repo (e.g. rust-sci-core).
#                    Can be repeated. Default: all Rust repos.
#   --no-pr          Commit and push the branch but do not open a PR.
#   --branch <name>  Override the feature branch name (default: auto-generated).
#
# PREREQUISITES
#   - gh CLI installed and authenticated  (brew install gh && gh auth login)
#   - git installed
#   - bash 4+ (macOS ships bash 3; install via: brew install bash)
#
# NOTES
#   - The script clones each repo into a temp directory, applies changes,
#     and opens a draft PR. No repo on your Mac is modified.
#   - Workflows flagged as MANUAL (deploy-pages, desktop, validation, etc.)
#     are listed but not touched; they need per-repo review before migrating.
#   - For fuzz.yml the script inserts a placeholder fuzz-target; you must
#     edit the PR to supply the real target name before merging.
#
# EXAMPLES
#   # Dry-run everything first
#   ./migrate-rust-workflows.sh --dry-run
#
#   # Migrate one repo for real
#   ./migrate-rust-workflows.sh --repo rust-sci-core
#
#   # Migrate all repos but skip PR creation
#   ./migrate-rust-workflows.sh --no-pr

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

ORG="ruralpeds"
GITHUB_REPO="${ORG}/.github"
REUSABLE_REF="main"               # branch/tag of .github to pin callers against
BRANCH_PREFIX="chore/consolidate-rust-workflows"
PR_TITLE="ci(rust): replace local workflows with centralised reusable callers"

# All Rust repos to process (archived Computational_cds excluded)
ALL_REPOS=(
  rust-sci-core
  Graphmaster
  Cds_core
  Decision-trees-rust
  hospital-economics-rust
  agent-based-modeling
  document_cleaner
  biostatistics-rust
  graph_creation
  Policyforge
)

# ── Workflow mapping ───────────────────────────────────────────────────────────
#
# Format:  LOCAL_FILENAME -> REUSABLE_WORKFLOW + default inputs YAML block
#
# Entries with action=DELETE mean the local file is superseded and should be
# removed (its functionality is already covered by another reusable workflow).
#
# Entries with action=MANUAL are listed in the PR body as skipped items that
# need per-repo human review before migrating.

declare -A WORKFLOW_ACTION  # "REPLACE" | "DELETE" | "MANUAL"
declare -A WORKFLOW_REUSABLE
declare -A WORKFLOW_INPUTS   # YAML block to embed inside `with:`

# ── ci.yml → reusable-ci-rust.yml
WORKFLOW_ACTION[ci.yml]="REPLACE"
WORKFLOW_REUSABLE[ci.yml]="${GITHUB_REPO}/.github/workflows/reusable-ci-rust.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[ci.yml]="      # rust-version: stable
      # run-nightly: false
      # run-clippy: true
      # run-fmt: true
      # cargo-features: \"\"
      # test-timeout-minutes: 20"

# ── fuzz.yml → reusable-fuzz-rust.yml
WORKFLOW_ACTION[fuzz.yml]="REPLACE"
WORKFLOW_REUSABLE[fuzz.yml]="${GITHUB_REPO}/.github/workflows/reusable-fuzz-rust.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[fuzz.yml]="      fuzz-target: \"TODO_replace_with_actual_target_name\"
      fuzz-duration-seconds: 300
      # sanitizers: \"address\"
      # upload-corpus: true
      # fail-on-crash: true"

# ── bench.yml → reusable-bench-rust.yml
WORKFLOW_ACTION[bench.yml]="REPLACE"
WORKFLOW_REUSABLE[bench.yml]="${GITHUB_REPO}/.github/workflows/reusable-bench-rust.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[bench.yml]="      # bench-name: \"\"
      # regression-threshold-percent: 10
      # save-baseline: true
      # compare-baseline: true"

# ── msrv.yml → reusable-msrv-rust.yml
WORKFLOW_ACTION[msrv.yml]="REPLACE"
WORKFLOW_REUSABLE[msrv.yml]="${GITHUB_REPO}/.github/workflows/reusable-msrv-rust.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[msrv.yml]="      # msrv: \"\"   # reads from Cargo.toml rust-version by default
      # run-tests: true"

# ── semver.yml → reusable-semver-rust.yml
WORKFLOW_ACTION[semver.yml]="REPLACE"
WORKFLOW_REUSABLE[semver.yml]="${GITHUB_REPO}/.github/workflows/reusable-semver-rust.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[semver.yml]="      # baseline: \"registry\"
      # fail-on-breaking: true"

# ── supply-chain.yml → reusable-supply-chain-rust.yml
WORKFLOW_ACTION[supply-chain.yml]="REPLACE"
WORKFLOW_REUSABLE[supply-chain.yml]="${GITHUB_REPO}/.github/workflows/reusable-supply-chain-rust.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[supply-chain.yml]="      # check-advisories: true
      # check-licenses: true
      # check-bans: true
      # check-sources: true
      # fail-on-advisories: true"

# ── mutation.yml → reusable-mutation.yml
WORKFLOW_ACTION[mutation.yml]="REPLACE"
WORKFLOW_REUSABLE[mutation.yml]="${GITHUB_REPO}/.github/workflows/reusable-mutation.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[mutation.yml]="      language: \"rust\"
      # min-score: 70
      # fail-under-min: false"

# ── security.yml → reusable-security.yml
WORKFLOW_ACTION[security.yml]="REPLACE"
WORKFLOW_REUSABLE[security.yml]="${GITHUB_REPO}/.github/workflows/reusable-security.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[security.yml]="      run-dependency-review: true
      dependency-review-fail-on-severity: \"high\"
      run-codeql: false"

# ── codeql.yml → reusable-security.yml with CodeQL enabled
#    Rust is analysed as 'cpp' by CodeQL
WORKFLOW_ACTION[codeql.yml]="REPLACE"
WORKFLOW_REUSABLE[codeql.yml]="${GITHUB_REPO}/.github/workflows/reusable-security.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[codeql.yml]="      run-dependency-review: false
      run-codeql: true
      codeql-languages: '[\"cpp\"]'"

# ── release.yml → reusable-release.yml
WORKFLOW_ACTION[release.yml]="REPLACE"
WORKFLOW_REUSABLE[release.yml]="${GITHUB_REPO}/.github/workflows/reusable-release.yml@${REUSABLE_REF}"
WORKFLOW_INPUTS[release.yml]="      # add release-specific inputs here if required"

# ── coverage.yml → superseded by reusable-ci-rust.yml (has a coverage job)
WORKFLOW_ACTION[coverage.yml]="DELETE"

# ── copilot-task-guardrails.yml → superseded by org-level workflow
WORKFLOW_ACTION[copilot-task-guardrails.yml]="DELETE"

# ── Workflows that need per-repo human review before migrating
WORKFLOW_ACTION[deploy-pages.yml]="MANUAL"
WORKFLOW_ACTION[desktop.yml]="MANUAL"
WORKFLOW_ACTION[validation.yml]="MANUAL"
WORKFLOW_ACTION[copilot-build-gap.yml]="MANUAL"
WORKFLOW_ACTION[hygiene.yml]="MANUAL"

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'
BLU='\033[0;34m'; CYN='\033[0;36m'; RST='\033[0m'
info()    { echo -e "${BLU}[INFO]${RST}  $*"; }
success() { echo -e "${GRN}[OK]${RST}    $*"; }
warn()    { echo -e "${YLW}[WARN]${RST}  $*"; }
error()   { echo -e "${RED}[ERROR]${RST} $*" >&2; }
dry()     { echo -e "${CYN}[DRY]${RST}   $*"; }

# ── Argument parsing ───────────────────────────────────────────────────────────
DRY_RUN=false
NO_PR=false
BRANCH_OVERRIDE=""
SELECTED_REPOS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)   DRY_RUN=true ;;
    --no-pr)     NO_PR=true ;;
    --branch)    BRANCH_OVERRIDE="$2"; shift ;;
    --repo)      SELECTED_REPOS+=("$2"); shift ;;
    -h|--help)
      sed -n '/^# USAGE/,/^[^#]/p' "$0" | grep '^#' | sed 's/^# \?//'
      exit 0 ;;
    *) error "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

REPOS=("${SELECTED_REPOS[@]:-${ALL_REPOS[@]}}")
if [[ ${#SELECTED_REPOS[@]} -gt 0 ]]; then
  REPOS=("${SELECTED_REPOS[@]}")
else
  REPOS=("${ALL_REPOS[@]}")
fi

# ── Prerequisites ──────────────────────────────────────────────────────────────
check_prereqs() {
  local missing=0
  for cmd in gh git python3; do
    if ! command -v "$cmd" &>/dev/null; then
      error "Required command not found: $cmd"
      missing=$((missing + 1))
    fi
  done
  [[ $missing -gt 0 ]] && exit 1

  if ! gh auth status &>/dev/null; then
    error "gh CLI is not authenticated. Run: gh auth login"
    exit 1
  fi

  # Check org access
  if ! gh repo list "$ORG" --limit 1 &>/dev/null; then
    error "Cannot list repos for org '$ORG'. Check your gh auth scopes."
    exit 1
  fi

  success "Prerequisites OK (gh, git, python3)"
}

# ── Generate caller YAML for a given workflow ──────────────────────────────────
generate_caller() {
  local filename="$1"
  local reusable="${WORKFLOW_REUSABLE[$filename]}"
  local inputs_block="${WORKFLOW_INPUTS[$filename]:-}"
  local trigger_block

  # Infer a sensible trigger from the filename
  case "$filename" in
    ci.yml|codeql.yml)
      trigger_block='on:
  push:
    branches: [main]
  pull_request:
    branches: [main]' ;;
    fuzz.yml)
      trigger_block='on:
  schedule:
    - cron: "0 2 * * 1"   # weekly, Monday 02:00 UTC
  workflow_dispatch:' ;;
    bench.yml)
      trigger_block='on:
  push:
    branches: [main]
  workflow_dispatch:' ;;
    msrv.yml|semver.yml)
      trigger_block='on:
  push:
    branches: [main]
  pull_request:
    branches: [main]' ;;
    supply-chain.yml|security.yml)
      trigger_block='on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 6 * * 1"   # weekly advisory DB refresh' ;;
    mutation.yml)
      trigger_block='on:
  push:
    branches: [main]
  schedule:
    - cron: "0 3 * * 3"   # Wednesday 03:00 UTC' ;;
    release.yml)
      trigger_block='on:
  release:
    types: [published]' ;;
    coverage.yml)
      trigger_block='on:
  push:
    branches: [main]
  pull_request:
    branches: [main]' ;;
    *)
      trigger_block='on:
  push:
    branches: [main]
  pull_request:
    branches: [main]' ;;
  esac

  local with_block=""
  if [[ -n "$inputs_block" ]]; then
    with_block="
    with:
${inputs_block}"
  fi

  cat <<YAML
# This workflow is managed centrally via ${GITHUB_REPO}.
# Do not edit the job logic here — update the reusable workflow instead.
# Source of truth: https://github.com/${GITHUB_REPO}/blob/${REUSABLE_REF}/.github/workflows/$(basename "$reusable" | sed 's/@.*//')

${trigger_block}

jobs:
  call:
    uses: ${reusable}${with_block}
    secrets: inherit
YAML
}

# ── Process a single repo ──────────────────────────────────────────────────────
process_repo() {
  local repo="$1"
  local full_repo="${ORG}/${repo}"
  local branch="${BRANCH_OVERRIDE:-${BRANCH_PREFIX}-$(date +%Y%m%d)}"
  local workdir
  workdir="$(mktemp -d)"
  trap 'rm -rf "$workdir"' RETURN

  info "── Processing ${full_repo} ──"

  # Check repo exists and is not archived
  local archived
  archived=$(gh repo view "$full_repo" --json isArchived --jq '.isArchived' 2>/dev/null || echo "true")
  if [[ "$archived" == "true" ]]; then
    warn "Skipping $repo: repository is archived."
    return 0
  fi

  # Find all workflow files present in the repo
  local workflow_files
  workflow_files=$(gh api "repos/${full_repo}/contents/.github/workflows" \
    --jq '.[].name' 2>/dev/null || true)

  if [[ -z "$workflow_files" ]]; then
    info "No workflows found in ${full_repo} — skipping."
    return 0
  fi

  # Determine what we'd do
  local replacements=() deletions=() manuals=() unknowns=()
  while IFS= read -r f; do
    local action="${WORKFLOW_ACTION[$f]:-UNKNOWN}"
    case "$action" in
      REPLACE) replacements+=("$f") ;;
      DELETE)  deletions+=("$f") ;;
      MANUAL)  manuals+=("$f") ;;
      UNKNOWN) unknowns+=("$f") ;;
    esac
  done <<< "$workflow_files"

  if [[ ${#replacements[@]} -eq 0 && ${#deletions[@]} -eq 0 ]]; then
    info "Nothing to migrate in ${repo} (no mapped workflows found)."
    [[ ${#manuals[@]} -gt 0 ]] && warn "Manual review needed: ${manuals[*]}"
    [[ ${#unknowns[@]} -gt 0 ]] && warn "Unmapped workflows (no action defined): ${unknowns[*]}"
    return 0
  fi

  echo "  Replacements : ${replacements[*]:-none}"
  echo "  Deletions    : ${deletions[*]:-none}"
  echo "  Manual review: ${manuals[*]:-none}"
  echo "  Unknown      : ${unknowns[*]:-none}"

  if [[ "$DRY_RUN" == "true" ]]; then
    dry "Would create branch '${branch}', apply changes, and open PR in ${full_repo}."
    return 0
  fi

  # Clone the repo
  info "Cloning ${full_repo}…"
  gh repo clone "$full_repo" "$workdir/repo" -- --depth=1 -q

  pushd "$workdir/repo" > /dev/null

  # Create feature branch
  git checkout -b "$branch"

  local changed=false

  # Apply replacements
  for f in "${replacements[@]}"; do
    local caller_content
    caller_content="$(generate_caller "$f")"
    echo "$caller_content" > ".github/workflows/$f"
    git add ".github/workflows/$f"
    success "  Replaced .github/workflows/$f"
    changed=true
  done

  # Apply deletions
  for f in "${deletions[@]}"; do
    if [[ -f ".github/workflows/$f" ]]; then
      git rm -f ".github/workflows/$f"
      success "  Deleted  .github/workflows/$f (superseded by org-level workflow)"
      changed=true
    fi
  done

  if [[ "$changed" == "false" ]]; then
    info "No file changes made in ${repo} — nothing to commit."
    popd > /dev/null
    return 0
  fi

  # Commit
  git commit -m "$(printf 'ci(rust): replace local workflows with centralised reusable callers\n\nReplaces per-repo workflow files with thin callers that delegate to\nruralpeds/.github reusable workflows. This makes ruralpeds/.github the\nsingle source of truth for Rust CI patterns across the org.\n\nReplaced:\n%s\n\nDeleted (superseded by org-level workflow):\n%s\n\nPending manual review (not touched by this script):\n%s\n\nSee: https://github.com/ruralpeds/.github' \
    "$(printf '  - %s\n' "${replacements[@]:-none}")" \
    "$(printf '  - %s\n' "${deletions[@]:-none}")" \
    "$(printf '  - %s\n' "${manuals[@]:-none}")")"

  # Push
  git push -u origin "$branch" -q

  popd > /dev/null

  if [[ "$NO_PR" == "true" ]]; then
    success "Branch '${branch}' pushed to ${full_repo} — skipping PR (--no-pr)."
    return 0
  fi

  # Build PR body
  local manual_section=""
  if [[ ${#manuals[@]} -gt 0 ]]; then
    manual_section="
## Workflows needing manual review (not touched)
These files were **not modified** by the script and need per-repo review before migrating:
$(printf '- \`%s\`\n' "${manuals[@]}")
"
  fi

  local unknown_section=""
  if [[ ${#unknowns[@]} -gt 0 ]]; then
    unknown_section="
## Unrecognised workflow files (not touched)
$(printf '- \`%s\`\n' "${unknowns[@]}")
"
  fi

  gh pr create \
    --repo "$full_repo" \
    --title "$PR_TITLE" \
    --draft \
    --head "$branch" \
    --body "$(cat <<BODY
## Summary

Replaces per-repo workflow files with thin callers that delegate to
\`ruralpeds/.github\` reusable workflows. \`ruralpeds/.github\` is the single
source of truth; fixes and improvements are applied org-wide by updating
one file rather than every repo.

## Changes

### Replaced with reusable callers
$(printf '- \`%s\` → \`%s\`\n' $(for f in "${replacements[@]}"; do echo "$f" "${WORKFLOW_REUSABLE[$f]}"; done))

### Deleted (superseded by org-level workflow)
$(printf '- \`%s\`\n' "${deletions[@]:-_none_}")
${manual_section}${unknown_section}
## Before merging

- [ ] Verify CI passes on this branch
- [ ] For \`fuzz.yml\`: replace \`TODO_replace_with_actual_target_name\` with the real fuzz target
- [ ] Check that any repo-specific inputs (features, timeouts, MSRV) are set correctly in the caller \`with:\` block
- [ ] Confirm no secrets or env vars relied on locally are missing from the reusable workflow

## Reusable workflow reference

All reusable workflows live in [\`ruralpeds/.github\`](https://github.com/ruralpeds/.github/tree/${REUSABLE_REF}/.github/workflows).
BODY
)"

  success "PR opened in ${full_repo} (draft)."
}

# ── Main ───────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ruralpeds Rust Workflow Migration"
  [[ "$DRY_RUN" == "true" ]] && echo "  *** DRY RUN — no changes will be made ***"
  echo "  Repos: ${REPOS[*]}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  check_prereqs

  local failed=()
  for repo in "${REPOS[@]}"; do
    if ! process_repo "$repo"; then
      error "Failed to process ${repo}"
      failed+=("$repo")
    fi
    echo ""
  done

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [[ ${#failed[@]} -eq 0 ]]; then
    success "All repos processed successfully."
  else
    error "Failed repos: ${failed[*]}"
    exit 1
  fi
}

main "$@"
