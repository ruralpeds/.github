#!/usr/bin/env bash
# sprint-kickoff.sh — seed GitHub issues from copilot-tasks/ and assign to @copilot.
#
# Usage:
#   sprint-kickoff.sh --repo <owner/repo> [--phase <NN>] [--dry-run]
#
# Requires: gh CLI authenticated, target repo cloned locally, `copilot-tasks/`
# directory populated (typically by plan_to_tasks.py).
#
# This script wraps the existing seed_issues.py from ruralpeds/.github so a
# single command kicks off either one phase or all phases at once.
set -euo pipefail

REPO=""
PHASE="all"
DRY_RUN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)    REPO="$2"; shift 2 ;;
    --phase)   PHASE="$2"; shift 2 ;;
    --dry-run) DRY_RUN="--dry-run"; shift ;;
    -h|--help)
      sed -n '2,12p' "$0"; exit 0 ;;
    *)
      echo "error: unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$REPO" ]]; then
  echo "error: --repo <owner/repo> is required" >&2
  exit 2
fi

# Sanity checks
if ! command -v gh >/dev/null; then
  echo "error: gh CLI not installed" >&2; exit 2
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh CLI not authenticated. Run: gh auth login" >&2; exit 2
fi
if [[ ! -d copilot-tasks ]]; then
  echo "error: copilot-tasks/ not found. Run plan_to_tasks.py first." >&2; exit 2
fi

# Locate seed_issues.py — prefer local, fall back to the org-level copy.
SEEDER=""
if [[ -f scripts/seed_issues.py ]]; then
  SEEDER="scripts/seed_issues.py"
elif [[ -d /tmp/ruralpeds-github/scripts ]]; then
  SEEDER="/tmp/ruralpeds-github/scripts/seed_issues.py"
else
  echo "info: cloning ruralpeds/.github for seed_issues.py..."
  gh repo clone ruralpeds/.github /tmp/ruralpeds-github -- --depth 1 >/dev/null
  SEEDER="/tmp/ruralpeds-github/scripts/seed_issues.py"
fi

echo "==> Seeding issues from copilot-tasks/ into $REPO (phase=$PHASE)..."
GH_TOKEN="$(gh auth token)" python3 "$SEEDER" \
  --phase "$PHASE" \
  --repo "$REPO" \
  --assign-to "copilot-swe-agent" \
  $DRY_RUN

echo "==> Done. View issues at: https://github.com/$REPO/issues?q=label%3Aagent-task"
