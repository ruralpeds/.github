#!/usr/bin/env bash
# start-sprint-task.sh — prep a branch for a sprint task and print the Copilot prompt.
#
# Usage (from repo root inside the devcontainer):
#   ./scripts/start-sprint-task.sh                    # auto-picks next unblocked task
#   ./scripts/start-sprint-task.sh <path/to/task.md>  # explicit task file
#
# What it does:
#   1. Finds the task (or uses the one you pass)
#   2. Reads phase + slug from frontmatter
#   3. Looks up the matching GitHub issue number
#   4. Creates and checks out branch: agent/<phase>/<slug>-<issue#>
#   5. Prints the exact Copilot Chat prompt to paste
#
# Requires: gh CLI authenticated, git, python3

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown/repo")

# ── 1. Find the task file ─────────────────────────────────────────────────────
TASK_FILE=""
if [[ $# -ge 1 && -f "$1" ]]; then
  TASK_FILE="$1"
else
  while IFS= read -r tf; do
    if ! grep -q "^depends-on:" "$tf" 2>/dev/null; then
      TASK_FILE="$tf"
      break
    fi
  done < <(find copilot-tasks -name "task-*.md" 2>/dev/null | sort -V)
fi

if [[ -z "$TASK_FILE" ]]; then
  echo "error: no unblocked task found in copilot-tasks/" >&2
  exit 1
fi

# ── 2. Read frontmatter ───────────────────────────────────────────────────────
PHASE=$(grep "^phase:" "$TASK_FILE" | sed "s/^phase: *//;s/'//g;s/\"//g" | head -1)
SLUG=$(grep  "^slug:"  "$TASK_FILE" | sed "s/^slug: *//;s/'//g;s/\"//g"  | head -1)
TITLE=$(grep "^title:" "$TASK_FILE" | sed "s/^title: *//;s/'//g;s/\"//g" | head -1)

if [[ -z "$PHASE" || -z "$SLUG" ]]; then
  echo "error: task file missing phase: or slug: frontmatter" >&2
  exit 1
fi

# ── 3. Look up GitHub issue number ───────────────────────────────────────────
echo "==> Looking up issue for: $TITLE"
ISSUE_NUM=$(gh issue list \
  --repo "$REPO" \
  --label "agent-task" \
  --state open \
  --search "$TITLE" \
  --json number,title \
  --jq ".[] | select(.title | test(\"${SLUG}\"; \"i\")) | .number" \
  2>/dev/null | head -1)

if [[ -z "$ISSUE_NUM" ]]; then
  # Fallback: search by slug in title
  ISSUE_NUM=$(gh issue list \
    --repo "$REPO" \
    --label "agent-task" \
    --state open \
    --json number,title \
    --jq ".[] | select(.title | test(\"${SLUG}\"; \"i\")) | .number" \
    2>/dev/null | head -1)
fi

if [[ -z "$ISSUE_NUM" ]]; then
  echo "⚠ Could not find issue number — using 0. Update branch name after finding it."
  ISSUE_NUM="0"
fi

# ── 4. Create and checkout branch ────────────────────────────────────────────
BRANCH="agent/${PHASE}/${SLUG}-${ISSUE_NUM}"

if git show-ref --quiet "refs/heads/$BRANCH"; then
  echo "==> Branch already exists — switching to: $BRANCH"
  git checkout "$BRANCH"
else
  echo "==> Creating branch: $BRANCH"
  git checkout -b "$BRANCH"
  git push -u origin "$BRANCH" 2>/dev/null || true
fi

REL_TASK="$(realpath --relative-to="$(git rev-parse --show-toplevel)" "$TASK_FILE" 2>/dev/null || echo "$TASK_FILE")"

# ── 5. Print Copilot prompt ───────────────────────────────────────────────────
echo ""
echo "╭──────────────────────────────────────────────────────────────────────────────╮"
echo "│  Ready — paste this into Copilot Chat (Agent mode)                          │"
echo "╰──────────────────────────────────────────────────────────────────────────────╯"
echo ""
cat << PROMPT
#file:${REL_TASK}
#file:AGENTS.md
#file:.github/copilot-instructions.md

You are working on branch \`${BRANCH}\` in repo \`${REPO}\`.
Tracking issue: #${ISSUE_NUM}

Work through the task file completely and autonomously:
1. Read the task file, AGENTS.md, and copilot-instructions.md before touching any file.
2. Implement every step in the ## Approach section.
3. Run the ## Verification commands. Fix failures and re-run until all pass.
4. Commit all changes to branch \`${BRANCH}\` using Conventional Commits.
   Each commit message must end with: Refs: #${ISSUE_NUM}
5. Push to origin/${BRANCH}.
6. Open a pull request from \`${BRANCH}\` to \`main\` with title:
   "${TITLE} (closes #${ISSUE_NUM})"
   Fill the PR body using the template in AGENTS.md §3.8.
7. Do not ask for confirmation at any step. Work autonomously until the PR is open.
PROMPT
echo ""
echo "  Branch: $BRANCH"
echo "  Issue:  https://github.com/${REPO}/issues/${ISSUE_NUM}"
echo ""
