#!/usr/bin/env bash
# Install the build-management scaffold into the current repo.
#
# Usage (from a consumer repo root):
#   curl -fsSL https://raw.githubusercontent.com/ruralpeds/.github/main/scripts/install-build-management.sh | bash
#
# Idempotent: skips files that already exist (use --force to overwrite).
set -euo pipefail

FORCE="${1:-}"
BASE="https://raw.githubusercontent.com/ruralpeds/.github/main/templates/build-management"
WF="https://raw.githubusercontent.com/ruralpeds/.github/main/templates/build-management/workflows"

repo_slug="$(git remote get-url origin 2>/dev/null | sed -E 's#(git@|https://)github.com[:/]##; s#\.git$##' || echo 'unknown/repo')"

mkdir -p .build .github/workflows .gap-analysis

fetch() {
  local url="$1" dest="$2"
  if [[ -f "$dest" && "$FORCE" != "--force" ]]; then
    echo "  skip   $dest (exists; pass --force to overwrite)"
    return 0
  fi
  curl -fsSL "$url" -o "$dest"
  echo "  wrote  $dest"
}

echo "Installing build-management scaffold for $repo_slug ..."
fetch "$BASE/.build/manifest.yaml"            .build/manifest.yaml
fetch "$BASE/.build/schema.json"              .build/schema.json
fetch "$BASE/BUILD.template.md"               BUILD.md
fetch "$WF/build-md-render.yml"               .github/workflows/build-md-render.yml
fetch "$WF/reusable-build-manifest-caller.yml" .github/workflows/build-manifest-caller.yml
fetch "$WF/gap-analysis-request.yml"          .github/workflows/gap-analysis-request.yml

# Stamp repo slug into manifest if still placeholder
if grep -q "ruralpeds/REPO_NAME" .build/manifest.yaml 2>/dev/null; then
  sed -i.bak "s#ruralpeds/REPO_NAME#${repo_slug}#" .build/manifest.yaml && rm .build/manifest.yaml.bak
  echo "  stamped repo slug: $repo_slug"
fi

# Seed empty ledger if missing
[[ -f .gap-analysis/build-ledger.jsonl ]] || cat > .gap-analysis/build-ledger.jsonl <<EOF
{"\$schema": "https://github.com/ruralpeds/.github/blob/main/docs/GAP_ANALYSIS_LIFECYCLE.md", "\$comment": "Workflow-owned. Do not edit by hand.", "\$created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF

cat <<EOF

Done. Next steps:
  1. Edit .build/manifest.yaml — replace the FEAT-001 example.
  2. git add .build BUILD.md .github/workflows .gap-analysis/build-ledger.jsonl
  3. git commit -m "chore: bootstrap build-management"
  4. Open a PR. build-md-render will regenerate BUILD.md.
  5. Order a gap analysis from the Actions tab → "Gap Analysis — Order".
EOF
