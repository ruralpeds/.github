#!/usr/bin/env bash
# poststart.sh — runs every time the devcontainer starts.
# Never exits non-zero.

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT" 2>/dev/null || true
REPO_NAME="$(basename "$REPO_ROOT")"

echo ""
echo "╭──────────────────────────────────────────────────────────────────────────────╮"
printf "│  %-76s│\n" "ruralpeds dev — ${REPO_NAME}"
echo "│  VS Code + Copilot agent mode                                               │"
echo "╰──────────────────────────────────────────────────────────────────────────────╯"
echo ""

# Toolchain versions
echo "  Toolchain:"
rustc  --version 2>/dev/null | sed 's/^/    /' || true
node   --version 2>/dev/null | xargs -I{} echo "    node {}" || true
python3 --version 2>/dev/null | sed 's/^/    /' || true
echo ""

# If this is a sprint repo, run start-sprint-task.sh to set up the branch
# and print the Copilot prompt.
if [[ -d "$REPO_ROOT/copilot-tasks" && -f "$REPO_ROOT/scripts/start-sprint-task.sh" ]]; then
  bash "$REPO_ROOT/scripts/start-sprint-task.sh" || true
else
  echo "  No sprint tasks found. Open Copilot Chat (Cmd+Shift+I) to start."
fi

PLAN=$(ls "$REPO_ROOT"/*_BUILD_PLAN.md 2>/dev/null | head -1 | xargs basename 2>/dev/null || true)
[[ -n "$PLAN" ]] && echo "  Build plan: $PLAN"
echo ""
