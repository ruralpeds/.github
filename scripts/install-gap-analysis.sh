#!/usr/bin/env bash
#
# install-gap-analysis.sh
#
# Single-repo convenience wrapper around bootstrap_gap_analysis.py.
# Use this to install (or refresh) the gap-analysis system on one repo
# you already have checked out locally.
#
# Usage:
#   ./install-gap-analysis.sh                # current directory, dry-run preview
#   ./install-gap-analysis.sh --apply        # actually write files + commit
#   ./install-gap-analysis.sh --apply --push # also push branch + open PR
#   ./install-gap-analysis.sh /path/to/repo --apply
#
# Requirements:
#   - python3 (3.10+)
#   - git
#   - gh CLI (only required for --push)
#   - GH_TOKEN or GITHUB_TOKEN env var (only required for --push)
#
# This script assumes the ruralpeds/.github repo (containing the templates
# and bootstrap_gap_analysis.py) is checked out at one of:
#   - $RURALPEDS_GITHUB_DIR (env var, highest priority)
#   - ~/Documents/github/.github
#   - ~/repo-cleanup/workspace/.github
# Set RURALPEDS_GITHUB_DIR if your checkout is elsewhere.

set -euo pipefail

# ---- locate ruralpeds/.github checkout (source of templates + script) ----
locate_github_repo() {
    if [[ -n "${RURALPEDS_GITHUB_DIR:-}" && -d "$RURALPEDS_GITHUB_DIR" ]]; then
        echo "$RURALPEDS_GITHUB_DIR"
        return 0
    fi
    for candidate in \
        "$HOME/Documents/github/.github" \
        "$HOME/repo-cleanup/workspace/.github" \
        "$HOME/Documents/github/ruralpeds-.github" \
    ; do
        if [[ -d "$candidate/templates/gap-analysis" \
              && -f "$candidate/scripts/bootstrap_gap_analysis.py" ]]; then
            echo "$candidate"
            return 0
        fi
    done
    return 1
}

# ---- arg parsing ----
TARGET_REPO="$(pwd)"
APPLY=false
PUSH=false
BRANCH="bootstrap/gap-analysis-v1"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --apply)
            APPLY=true
            shift
            ;;
        --push)
            PUSH=true
            APPLY=true   # --push implies --apply
            shift
            ;;
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        --help|-h)
            sed -n '2,25p' "$0"
            exit 0
            ;;
        -*)
            echo "Unknown flag: $1" >&2
            exit 2
            ;;
        *)
            TARGET_REPO="$1"
            shift
            ;;
    esac
done

# ---- resolve absolute path of target repo ----
if [[ ! -d "$TARGET_REPO" ]]; then
    echo "Target repo does not exist: $TARGET_REPO" >&2
    exit 2
fi
TARGET_REPO="$(cd "$TARGET_REPO" && pwd)"

if [[ ! -d "$TARGET_REPO/.git" ]]; then
    echo "Not a git repository: $TARGET_REPO" >&2
    exit 2
fi

REPO_NAME="$(basename "$TARGET_REPO")"

# ---- locate templates ----
if ! GITHUB_REPO_DIR="$(locate_github_repo)"; then
    cat >&2 <<EOF
ERROR: cannot locate ruralpeds/.github checkout.

Looked in:
  \$RURALPEDS_GITHUB_DIR (unset or invalid)
  ~/Documents/github/.github
  ~/repo-cleanup/workspace/.github
  ~/Documents/github/ruralpeds-.github

Either:
  1. Clone the repo:
       git clone https://github.com/ruralpeds/.github.git ~/Documents/github/.github
  2. Or set RURALPEDS_GITHUB_DIR to your existing checkout location.
EOF
    exit 3
fi

TEMPLATES_DIR="$GITHUB_REPO_DIR/templates/gap-analysis"
BOOTSTRAP_PY="$GITHUB_REPO_DIR/scripts/bootstrap_gap_analysis.py"

echo "==> Target repo:      $TARGET_REPO ($REPO_NAME)"
echo "==> Templates:        $TEMPLATES_DIR"
echo "==> Bootstrap script: $BOOTSTRAP_PY"
echo "==> Branch:           $BRANCH"
echo "==> Mode:             $([[ "$APPLY" == true ]] && echo APPLY || echo DRY-RUN)"
[[ "$PUSH" == true ]] && echo "==> Will push + PR"
echo

# ---- preflight: warn if already on a non-main branch with uncommitted changes ----
cd "$TARGET_REPO"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ -n "$(git status --porcelain)" ]]; then
    echo "WARNING: target repo has uncommitted changes on branch '$CURRENT_BRANCH'." >&2
    echo "         Stash or commit them before running with --apply." >&2
    if [[ "$APPLY" == true ]]; then
        echo "         Aborting." >&2
        exit 4
    fi
fi

# ---- preflight: confirm gh CLI + token present if --push ----
if [[ "$PUSH" == true ]]; then
    if ! command -v gh >/dev/null 2>&1; then
        echo "ERROR: --push requires the GitHub CLI (gh). Install from https://cli.github.com" >&2
        exit 5
    fi
    if [[ -z "${GH_TOKEN:-}${GITHUB_TOKEN:-}" ]]; then
        echo "ERROR: --push requires GH_TOKEN or GITHUB_TOKEN env var to be set." >&2
        exit 5
    fi
fi

# ---- assemble bootstrap args ----
ARGS=(
    "$BOOTSTRAP_PY"
    --repo "$REPO_NAME"
    --workspace "$(dirname "$TARGET_REPO")"
    --templates-dir "$TEMPLATES_DIR"
    --branch "$BRANCH"
)

if [[ "$APPLY" != true ]]; then
    ARGS+=( --dry-run )
fi

if [[ "$PUSH" != true ]]; then
    ARGS+=( --no-pr )
fi

# ---- run ----
echo "==> Running: python3 ${ARGS[*]}"
echo
python3 "${ARGS[@]}"

echo
echo "==> Done."
if [[ "$APPLY" != true ]]; then
    echo "    (dry-run — re-run with --apply to actually write files)"
elif [[ "$PUSH" != true ]]; then
    echo "    Files committed on branch '$BRANCH'. Push manually when ready:"
    echo "      git push -u origin $BRANCH"
    echo "      gh pr create --title 'Bootstrap gap-analysis system' --body-file ..."
fi
