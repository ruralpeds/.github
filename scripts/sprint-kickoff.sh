#!/usr/bin/env bash
# sprint-kickoff.sh — seed GitHub issues from copilot-tasks/ as tracking issues.
#
# Usage:
#   sprint-kickoff.sh --repo <owner/repo> [--phase <NN>] [--assign-to <user>] [--dry-run]
#
# Default mode is LOCAL — issues are seeded for tracking but NOT assigned to the
# GitHub Copilot cloud agent. Work is done locally in a VS Code devcontainer with
# Copilot agent mode (Copilot Chat → autopilot). Pass --assign-to copilot-swe-agent
# to use the cloud agent instead.
#
# Requires: gh CLI authenticated, target repo cloned locally, `copilot-tasks/`
# directory populated (typically by plan_to_tasks.py).
set -euo pipefail

REPO=""
PHASE="all"
ASSIGN_TO=""
DRY_RUN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)      REPO="$2"; shift 2 ;;
    --phase)     PHASE="$2"; shift 2 ;;
    --assign-to) ASSIGN_TO="$2"; shift 2 ;;
    --dry-run)   DRY_RUN="--dry-run"; shift ;;
    -h|--help)   sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "error: unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$REPO" ]]; then
  echo "error: --repo <owner/repo> is required" >&2; exit 2
fi

if ! command -v gh >/dev/null; then
  echo "error: gh CLI not installed" >&2; exit 2
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh CLI not authenticated. Run: gh auth login" >&2; exit 2
fi
if [[ ! -d copilot-tasks ]]; then
  echo "error: copilot-tasks/ not found. Run plan_to_tasks.py first." >&2; exit 2
fi

# Locate seed_issues.py — prefer local copy, fall back to org-level.
SEEDER=""
if [[ -f scripts/seed_issues.py ]]; then
  SEEDER="scripts/seed_issues.py"
else
  echo "info: cloning ruralpeds/.github for seed_issues.py..."
  gh repo clone ruralpeds/.github /tmp/ruralpeds-github -- --depth 1 >/dev/null
  SEEDER="/tmp/ruralpeds-github/scripts/seed_issues.py"
fi

MODE="local (no cloud-agent assignment)"
[[ -n "$ASSIGN_TO" ]] && MODE="cloud agent → @${ASSIGN_TO}"

echo "==> Seeding issues from copilot-tasks/ into $REPO"
echo "    phase=$PHASE  mode=$MODE"

ASSIGN_ARG=""
[[ -n "$ASSIGN_TO" ]] && ASSIGN_ARG="--assign-to ${ASSIGN_TO}"

GH_TOKEN="$(gh auth token)" python3 "$SEEDER" \
  --phase "$PHASE" \
  --repo "$REPO" \
  $ASSIGN_ARG \
  $DRY_RUN

echo ""
echo "==> Issues seeded. View at:"
echo "    https://github.com/$REPO/issues?q=label%3Aagent-task"

if [[ -z "$ASSIGN_TO" ]]; then
  echo ""
  echo "==> LOCAL SPRINT MODE"
  echo "    1. Open this repo in VS Code:  code ."
  echo "    2. Reopen in container when prompted (uses .devcontainer/devcontainer.json)"
  echo "    3. Open Copilot Chat (Ctrl+Shift+I)"
  echo "    4. Pick the first unblocked task from copilot-tasks/ and paste its contents"
  echo "    5. Copilot agent mode will work through it autonomously"
  echo "    6. Review changes, run the Done check, commit, push, open PR"
  echo "    7. Close the tracking issue when PR merges"
fi
