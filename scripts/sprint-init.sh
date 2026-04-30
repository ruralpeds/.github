#!/usr/bin/env bash
# sprint-init.sh — adopt the sprint standard in a target repo.
#
# Usage:
#   sprint-init.sh <path-to-target-repo>
#
# This script:
#   1. Validates the target repo is a git repo with a clean working tree.
#   2. Creates a branch `chore/adopt-sprint-standard-v1`.
#   3. Copies the sprint-bundle template (devcontainer, scripts, README block).
#   4. Adds a `.github/copilot-instructions.md` reference if missing.
#   5. Opens a PR for human review.
#
# Idempotent: if files already exist with identical content, leaves them alone.
set -euo pipefail

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "usage: $0 <path-to-target-repo>" >&2
  exit 2
fi
TARGET="$(cd "$TARGET" && pwd)"

# Locate the bundle (in the same checkout this script lives in).
BUNDLE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/templates/sprint-bundle"

if [[ ! -d "$BUNDLE_ROOT" ]]; then
  echo "error: sprint-bundle template not found at $BUNDLE_ROOT" >&2
  exit 2
fi

cd "$TARGET"

# Pre-flight
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "error: $TARGET is not a git repo" >&2; exit 2
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: working tree is not clean. Commit or stash first." >&2; exit 2
fi

git fetch origin
DEFAULT_BRANCH="$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo main)"
git checkout "$DEFAULT_BRANCH"
git pull --ff-only

BRANCH="chore/adopt-sprint-standard-v1"
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "==> Branch $BRANCH already exists; switching to it."
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

# Copy bundle contents.
echo "==> Copying sprint-bundle template..."
cp -nr "$BUNDLE_ROOT"/.devcontainer .devcontainer 2>/dev/null || true
mkdir -p scripts && cp -n "$BUNDLE_ROOT"/scripts/* scripts/ 2>/dev/null || true
mkdir -p docs/sprint-retros
[[ -f "$BUNDLE_ROOT"/SPRINT_RETRO_TEMPLATE.md ]] && cp -n "$BUNDLE_ROOT"/SPRINT_RETRO_TEMPLATE.md docs/

# Mark scripts executable.
chmod +x .devcontainer/postcreate.sh .devcontainer/poststart.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true

# Ensure copilot-instructions.md references the standard.
mkdir -p .github
if [[ ! -f .github/copilot-instructions.md ]]; then
  cat > .github/copilot-instructions.md <<'EOF'
# Copilot agent instructions

This repo follows the ruralpeds sprint standard. See:
  - `docs/SPRINT_STANDARD.md` (org-level: ruralpeds/.github)
  - `AGENTS.md` (org-level: ruralpeds/.github)
  - The build plan committed at the repo root (`*_BUILD_PLAN.md`).

Before any change, read both. Standing rules:
- Branch convention: `agent/<phase>/<slug>-<issue#>`.
- One task per PR. Diffs under 400 lines.
- Tests required for every behavior change.
- Refuse work on issues labeled `blocked:*` until the label is removed.
EOF
fi

git add .devcontainer scripts docs .github
if git diff --cached --quiet; then
  echo "==> No changes to commit (already adopted)."
  exit 0
fi

git commit -m "chore: adopt sprint-standard v1

Adds .devcontainer/, scripts/sprint-kickoff.sh, scripts/plan_to_tasks.py,
docs/sprint-retros/, and a baseline .github/copilot-instructions.md.

Refs: ruralpeds/.github docs/SPRINT_STANDARD.md"

git push -u origin "$BRANCH"
gh pr create --fill --base "$DEFAULT_BRANCH" --title "chore: adopt sprint-standard v1" --body "$(cat <<'EOF'
Adopts the ruralpeds sprint standard v1.

This adds:
- `.devcontainer/` — VS Code dev container pinned to `ghcr.io/ruralpeds/sprint-base:v1`
- `scripts/plan_to_tasks.py` — converter from Claude build plan → copilot-tasks/*.md
- `scripts/sprint-kickoff.sh` — seeds GitHub issues from copilot-tasks/ and assigns @copilot
- `docs/sprint-retros/` — directory for per-phase retros
- `.github/copilot-instructions.md` — baseline (if not already present)

After merging, run:

```bash
# 1. Author a build plan in the repo root (via Claude)
# 2. Convert plan → tasks
python scripts/plan_to_tasks.py --plan MY_BUILD_PLAN.md --target-repo .
# 3. Commit the tasks
git add copilot-tasks && git commit -m "chore: add tasks for MY_BUILD_PLAN" && git push
# 4. Kickoff
./scripts/sprint-kickoff.sh --repo \$GITHUB_REPOSITORY
```

See `docs/SPRINT_STANDARD.md` in `ruralpeds/.github` for the full spec.
EOF
)"

echo "==> Done. Open the PR for review."
