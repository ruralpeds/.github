#!/usr/bin/env bash
# poststart.sh — runs every time the container starts.
# Never exits non-zero.

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT" 2>/dev/null || true

REPO_NAME="$(basename "$REPO_ROOT")"

echo ""
echo "╭──────────────────────────────────────────────────────────────────────────────╮"
printf  "│  %-76s│\n" "ruralpeds dev — ${REPO_NAME}"
echo   "│  VS Code + Copilot agent mode (Cmd+Shift+I → Agent)                         │"
echo "╰──────────────────────────────────────────────────────────────────────────────╯"
echo ""

# ─── Toolchain summary ────────────────────────────────────────────────────────
echo "  Toolchain:"
rustc --version 2>/dev/null | sed 's/^/    /' || true
node --version  2>/dev/null | xargs -I{} echo "    node {}" || true
julia --version 2>/dev/null | sed 's/^/    /' || true
python3 --version 2>/dev/null | sed 's/^/    /' || true
echo ""

# ─── Sprint task (if this is a sprint repo) ───────────────────────────────────
NEXT_TASK=""
if [[ -d "$REPO_ROOT/copilot-tasks" ]]; then
  while IFS= read -r taskfile; do
    if ! grep -q "^depends-on:" "$taskfile" 2>/dev/null; then
      NEXT_TASK="$taskfile"
      break
    fi
  done < <(find "$REPO_ROOT/copilot-tasks" -name "task-*.md" 2>/dev/null | sort -V)
fi

if [[ -n "$NEXT_TASK" ]]; then
  TITLE=$(grep "^title:" "$NEXT_TASK" 2>/dev/null \
    | sed "s/^title: *//;s/'//g;s/\"//g" | head -1)
  REL="$(realpath --relative-to="$REPO_ROOT" "$NEXT_TASK" 2>/dev/null \
    || echo "$NEXT_TASK")"
  echo "  ── Next sprint task ──────────────────────────────────────────────────────"
  echo "  $TITLE"
  echo "  $REL"
  echo ""
  echo "  Paste into Copilot Chat (Agent mode):"
  echo ""
  echo "    #file:${REL}"
  echo "    Work through this task completely. Read the task file, implement"
  echo "    all steps, run the Done check, and stop when it passes."
  echo ""
fi

# ─── Quick reference ─────────────────────────────────────────────────────────
PLAN=$(ls "$REPO_ROOT"/*_BUILD_PLAN.md 2>/dev/null | head -1 | xargs basename 2>/dev/null || true)
[[ -n "$PLAN" ]] && echo "  Build plan:         $PLAN"
echo "  Branch convention:  agent/<phase>/<slug>-<issue#>"
echo "  Test runner:        cargo nextest run"
echo "  Background watch:   bacon"
echo ""
