#!/usr/bin/env bash
# Disables high-cost workflows across the ruralpeds org based on a chosen preset.
# Designed for both local use (with `gh` already authenticated) and CI use
# (with $GH_TOKEN exported from a GitHub App token).
#
# Usage:
#   scripts/cost_killswitch.sh --target rust-sci-core-extras
#   scripts/cost_killswitch.sh --target all --dry-run
#
# Targets:
#   rust-sci-core-extras   Disable bench/copilot/validation-parity in rust-sci-core
#   cancel-running         Cancel in-progress + queued runs in top-burning repos
#   all                    Run all of the above
#
# Note: disabling CodeQL or other required security controls is intentionally
# NOT a preset here. CodeQL is a non-bypassable compliance check; tune its
# triggers (push -> schedule + PR) in the workflow file instead.

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
      sed -n '2,17p' "$0"; exit 0 ;;
    *)
      echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$TARGET" ]]; then
  echo "::error::--target is required (rust-sci-core-extras | cancel-running | all)" >&2
  exit 2
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "::error::gh CLI not found. Install GitHub CLI or run from a workflow." >&2
  exit 2
fi

# Runs the given command directly (no eval). Honors --dry-run by printing
# the argv array instead of executing it. All callers must pass each arg
# separately, never a single quoted string.
run() {
  if $DRY_RUN; then
    printf 'DRY-RUN:'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

# Disable a workflow by exact name, ID, or filename. Reads the workflow list
# once and resolves to an exact path before calling `gh workflow disable`,
# avoiding the substring-match pitfall where a partial filename match
# triggered a disable call with an ambiguous identifier.
disable_workflow() {
  local repo="$1" wf="$2"
  local list_out err_out
  local tmp_err
  tmp_err=$(mktemp)
  if ! list_out=$(gh workflow list -R "$ORG/$repo" --all --json name,path 2>"$tmp_err"); then
    err_out=$(cat "$tmp_err")
    rm -f "$tmp_err"
    echo "  -- warn: cannot list workflows in $ORG/$repo: $err_out" >&2
    return 0
  fi
  rm -f "$tmp_err"

  # Find an exact match: name == wf, path basename == wf, or full path == wf.
  local exact_path
  exact_path=$(jq -r --arg wf "$wf" \
    '.[] | select(.name == $wf or .path == $wf or (.path | split("/") | last) == $wf) | .path' \
    <<<"$list_out" | head -1)

  if [[ -z "$exact_path" ]]; then
    echo "  -- skip: $wf not found in $ORG/$repo"
    return 0
  fi

  if ! run gh workflow disable "$exact_path" -R "$ORG/$repo"; then
    echo "  -- warn: failed to disable $exact_path in $ORG/$repo" >&2
    return 0
  fi
  echo "  -> disabled: $exact_path in $ORG/$repo"
}

cancel_active_runs() {
  local repo="$1"
  local status ids tmp_err
  for status in in_progress queued; do
    tmp_err=$(mktemp)
    if ! ids=$(gh run list -R "$ORG/$repo" --status "$status" --limit 50 \
                 --json databaseId -q '.[].databaseId' 2>"$tmp_err"); then
      echo "  -- warn: cannot list $status runs in $ORG/$repo: $(cat "$tmp_err")" >&2
      rm -f "$tmp_err"
      continue
    fi
    rm -f "$tmp_err"

    [[ -z "$ids" ]] && continue
    while read -r id; do
      [[ -z "$id" ]] && continue
      if ! run gh run cancel "$id" -R "$ORG/$repo"; then
        echo "  -- warn: failed to cancel run $id in $ORG/$repo" >&2
        continue
      fi
      echo "  -> cancelled run $id ($status) in $ORG/$repo"
    done <<< "$ids"
  done
}

do_rust_sci_core_extras() {
  echo "== Target: rust-sci-core-extras =="
  for wf in "bench.yml" "validation-parity.yml" "copilot.yml" "copilot-pull-request-reviewer.yml"; do
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
  codeql-heavy)
    echo "::error::codeql-heavy was removed. CodeQL is a non-bypassable security control;" >&2
    echo "::error::tune its triggers in the workflow file instead of disabling it." >&2
    exit 2 ;;
  rust-sci-core-extras) do_rust_sci_core_extras ;;
  cancel-running)       do_cancel_running ;;
  all)
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
