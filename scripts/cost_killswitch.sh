#!/usr/bin/env bash
# Disables high-cost workflows across the ruralpeds org based on a chosen preset.
# Designed for both local use (with `gh` already authenticated) and CI use
# (with $GH_TOKEN exported from a GitHub App or PAT).
#
# Usage:
#   scripts/cost_killswitch.sh --target codeql-heavy
#   scripts/cost_killswitch.sh --target all --dry-run
#
# Targets:
#   codeql-heavy           Disable CodeQL in biostatistics-rust, rust-sci-core, Peds
#   rust-sci-core-extras   Disable bench/copilot/validation-parity in rust-sci-core
#   cancel-running         Cancel in-progress + queued runs in top-burning repos
#   all                    Run all three of the above

set -euo pipefail

ORG="${ORG:-ruralpeds}"
TARGET=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)   TARGET="$2"; shift 2 ;;
    --dry-run)  DRY_RUN=true; shift ;;
    --org)      ORG="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,15p' "$0"; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$TARGET" ]]; then
  echo "::error::--target is required (codeql-heavy | rust-sci-core-extras | cancel-running | all)" >&2
  exit 2
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "::error::gh CLI not found. Install GitHub CLI or run from a workflow." >&2
  exit 2
fi

run() {
  if $DRY_RUN; then
    echo "DRY-RUN: $*"
  else
    eval "$@"
  fi
}

disable_workflow() {
  local repo="$1" wf="$2"
  if gh workflow list -R "$ORG/$repo" --all --json name,path -q '.[].name' 2>/dev/null | grep -Fxq "$wf"; then
    run "gh workflow disable \"$wf\" -R \"$ORG/$repo\""
    echo "  -> disabled: $wf in $ORG/$repo"
  elif gh workflow list -R "$ORG/$repo" --all --json path -q '.[].path' 2>/dev/null | grep -Fq "/$wf"; then
    run "gh workflow disable \"$wf\" -R \"$ORG/$repo\""
    echo "  -> disabled: $wf in $ORG/$repo (matched by filename)"
  else
    echo "  -- skip: $wf not found in $ORG/$repo"
  fi
}

cancel_active_runs() {
  local repo="$1"
  for status in in_progress queued; do
    local ids
    ids=$(gh run list -R "$ORG/$repo" --status "$status" --limit 50 --json databaseId -q '.[].databaseId' 2>/dev/null || true)
    if [[ -n "$ids" ]]; then
      while read -r id; do
        [[ -z "$id" ]] && continue
        run "gh run cancel $id -R \"$ORG/$repo\""
        echo "  -> cancelled run $id ($status) in $ORG/$repo"
      done <<< "$ids"
    fi
  done
}

do_codeql_heavy() {
  echo "== Target: codeql-heavy =="
  for repo in biostatistics-rust rust-sci-core Peds; do
    disable_workflow "$repo" "CodeQL"
    disable_workflow "$repo" "codeql.yml"
  done
}

do_rust_sci_core_extras() {
  echo "== Target: rust-sci-core-extras =="
  for wf in "bench.yml" "validation-parity.yml" "copilot" "copilot-pull-request-reviewer"; do
    disable_workflow "rust-sci-core" "$wf"
  done
}

do_cancel_running() {
  echo "== Target: cancel-running =="
  for repo in biostatistics-rust rust-sci-core Peds Rural-quality-julia Graphmaster \
              rural-hospital-modeling-julia-master biostatistics; do
    cancel_active_runs "$repo"
  done
}

case "$TARGET" in
  codeql-heavy)         do_codeql_heavy ;;
  rust-sci-core-extras) do_rust_sci_core_extras ;;
  cancel-running)       do_cancel_running ;;
  all)
    do_codeql_heavy
    do_rust_sci_core_extras
    do_cancel_running
    ;;
  *)
    echo "::error::Unknown target: $TARGET" >&2
    exit 2 ;;
esac

if $DRY_RUN; then
  echo "Dry-run complete. Re-run without --dry-run to apply."
else
  echo "Done."
fi
