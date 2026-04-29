#!/usr/bin/env bash
# poststart.sh — runs every time the devcontainer starts.
set -euo pipefail

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo "╭──────────────────────────────────────────────────────────────────────────────╮"
echo "│  ruralpeds sprint runtime — VS Code + Copilot agent mode                    │"
echo "╰──────────────────────────────────────────────────────────────────────────────╯"
echo ""

# ── Find the first unblocked task ────────────────────────────────────────────
# "Unblocked" = no depends-on line in frontmatter.
NEXT_TASK=""
if [[ -d copilot-tasks ]]; then
  while IFS= read -r taskfile; do
    if ! grep -q "^depends-on:" "$taskfile" 2>/dev/null; then
      NEXT_TASK="$taskfile"
      break
    fi
  done < <(find copilot-tasks -name "task-*.md" | sort -V)
fi

if [[ -n "$NEXT_TASK" ]]; then
  TITLE=$(grep "^title:" "$NEXT_TASK" 2>/dev/null | sed "s/^title: *//;s/'//g" | head -1)
  REPO_URL=$(gh repo view --json url -q .url 2>/dev/null || echo "")
  echo "  Next unblocked task:"
  echo "    $TITLE"
  echo "    $NEXT_TASK"
  echo ""
  echo "  Run it in Copilot agent mode:"
  echo "    1. Open Copilot Chat  (Cmd+Shift+I)"
  echo "    2. Set mode to 'Agent' in the dropdown"
  echo "    3. Paste this prompt:"
  echo ""
  echo "       #file:${NEXT_TASK}"
  echo "       Work through this task completely — read the task file, plan the"
  echo "       changes, implement them, run the Done check, and stop when it passes."
  echo ""
  [[ -n "$REPO_URL" ]] && echo "  Tracking issues: ${REPO_URL}/issues?q=label%3Aagent-task"
else
  echo "  No unblocked tasks found. All phases complete or waiting on open PRs."
fi

PLAN=$(ls *_BUILD_PLAN.md 2>/dev/null | head -1 || echo "")
[[ -n "$PLAN" ]] && echo "" && echo "  Build plan: $PLAN"
echo ""
echo "  Branch convention: agent/<phase>/<slug>-<issue#>"
echo ""
