#!/usr/bin/env bash
# adopt-devcontainer.sh
# Installs the ruralpeds standard devcontainer into any repo.
# Run from the repo root. Works on macOS and Linux.
#
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/ruralpeds/.github/main/scripts/adopt-devcontainer.sh)
# Or locally:
#   bash scripts/adopt-devcontainer.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
REPO_NAME="$(basename "$REPO_ROOT")"

echo "======================================================"
echo "ruralpeds devcontainer adoption"
echo "Repo: $REPO_NAME"
echo "Root: $REPO_ROOT"
echo "======================================================"

# Detect stack from repo contents
detect_stack() {
  local stack="rust"
  [[ -f "$REPO_ROOT/Project.toml" ]] && stack="julia"
  [[ -f "$REPO_ROOT/package.json" ]] && stack="node"
  [[ -f "$REPO_ROOT/pyproject.toml" || -f "$REPO_ROOT/setup.py" ]] && stack="python"
  [[ -f "$REPO_ROOT/Cargo.toml" ]] && stack="rust"
  # Mixed stacks
  [[ -f "$REPO_ROOT/Cargo.toml" && -f "$REPO_ROOT/Project.toml" ]] && stack="rust-julia"
  echo "$stack"
}

STACK=$(detect_stack)
echo "Detected stack: $STACK"

# Create .devcontainer directory
mkdir -p "$REPO_ROOT/.devcontainer"

# Write devcontainer.json
cat > "$REPO_ROOT/.devcontainer/devcontainer.json" << DEVJSON
{
  "name": "${REPO_NAME} dev",
  "image": "mcr.microsoft.com/devcontainers/rust:1-bullseye",
  "runArgs": ["--dns", "8.8.8.8", "--dns", "8.8.4.4"],
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": { "version": "latest" },
    "ghcr.io/devcontainers/features/node:1": { "version": "20" },
    "ghcr.io/devcontainers/features/python:1": { "version": "3.11" },
    "ghcr.io/devcontainers/features/docker-in-docker:2": { "version": "latest", "moby": true }
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "GitHub.copilot",
        "GitHub.copilot-chat",
        "GitHub.vscode-pull-request-github",
        "GitHub.vscode-github-actions",
        "rust-lang.rust-analyzer",
        "tamasfe.even-better-toml",
        "serayuzgur.crates",
        "vadimcn.vscode-lldb",
        "julialang.language-julia",
        "ms-python.python",
        "ms-python.vscode-pylance",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "redhat.vscode-yaml",
        "yzhang.markdown-all-in-one"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "rust-analyzer.checkOnSave": true,
        "rust-analyzer.cargo.buildScripts.enable": true,
        "github.copilot.enable": { "*": true, "yaml": true, "markdown": true },
        "github.copilot.chat.agent.enabled": true,
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    },
    "codespaces": { "openFiles": ["AGENTS.md", "README.md"] }
  },
  "remoteUser": "vscode",
  "workspaceFolder": "/workspaces/${REPO_NAME}",
  "mounts": [
    "source=${REPO_NAME}-cargo-cache,target=/home/vscode/.cargo/registry,type=volume",
    "source=${REPO_NAME}-cargo-git,target=/home/vscode/.cargo/git,type=volume"
  ],
  "postCreateCommand": "bash .devcontainer/postcreate.sh 2>&1 | tee /tmp/postcreate.log",
  "containerEnv": {
    "RUST_BACKTRACE": "1",
    "GH_TOKEN": "\${localEnv:GH_TOKEN}"
  },
  "forwardPorts": [3000, 5173, 8080],
  "hostRequirements": { "cpus": 4, "memory": "8gb", "storage": "32gb" }
}
DEVJSON

echo "✅ .devcontainer/devcontainer.json written"

# Write postcreate.sh
cat > "$REPO_ROOT/.devcontainer/postcreate.sh" << 'POSTCREATE'
#!/usr/bin/env bash
set -euo pipefail
echo "==> ruralpeds postcreate starting..."

# Rust
rustup target add wasm32-unknown-unknown 2>/dev/null || true
rustup component add clippy rustfmt rust-src 2>/dev/null || true
cargo install cargo-audit     --locked 2>/dev/null || true
cargo install cargo-tarpaulin --locked 2>/dev/null || true
cargo install cargo-watch     --locked 2>/dev/null || true
cargo install cargo-nextest   --locked 2>/dev/null || true

# Dioxus CLI (only if pedneoSim-ui or Dioxus.toml present)
[[ -f Dioxus.toml || -d crates/pedneoSim-ui ]] && \
  cargo install dioxus-cli --locked 2>/dev/null || true

# Python
pip install --quiet --break-system-packages pyyaml requests httpx rich 2>/dev/null || true

# Node / Playwright
npm install -g playwright 2>/dev/null || true

echo "==> postcreate complete."
POSTCREATE
chmod +x "$REPO_ROOT/.devcontainer/postcreate.sh"
echo "✅ .devcontainer/postcreate.sh written"

# Write poststart.sh
cat > "$REPO_ROOT/.devcontainer/poststart.sh" << 'POSTSTART'
#!/usr/bin/env bash
# Runs every time the container starts (not just on create).
# Keep lightweight — only env setup, no installs.
echo "ruralpeds devcontainer ready."
gh auth status 2>/dev/null || echo "GH_TOKEN not set — set it in your shell env or devcontainer secrets."
POSTSTART
chmod +x "$REPO_ROOT/.devcontainer/poststart.sh"
echo "✅ .devcontainer/poststart.sh written"

# Add cloud watchdog workflow
mkdir -p "$REPO_ROOT/.github/workflows"
cat > "$REPO_ROOT/.github/workflows/sprint-cloud-watchdog.yml" << 'WATCHDOG'
name: Sprint Cloud Watchdog
on:
  schedule:
    - cron: '*/10 * * * *'
  workflow_dispatch:
    inputs:
      dry_run:
        type: boolean
        default: false
      phase_override:
        type: string
        default: ''

jobs:
  watchdog:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
      - name: Run cloud watchdog
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          REPO: ${{ github.repository }}
          DRY_RUN: ${{ inputs.dry_run || 'false' }}
          PHASE_OVERRIDE: ${{ inputs.phase_override || '' }}
        run: |
          echo "Cloud watchdog running for $REPO at $(date -u)"
          # Full watchdog logic lives in ruralpeds/.github — fetch and run
          curl -fsSL https://raw.githubusercontent.com/ruralpeds/.github/main/scripts/cloud_watchdog.py \
            | python3 - || echo "Watchdog complete."
WATCHDOG
echo "✅ .github/workflows/sprint-cloud-watchdog.yml written"

# Git commit
cd "$REPO_ROOT"
git add .devcontainer/ .github/workflows/sprint-cloud-watchdog.yml 2>/dev/null || true
git commit -m "chore: adopt ruralpeds devcontainer standard v2

- .devcontainer/devcontainer.json (mcr.microsoft.com/devcontainers/rust:1-bullseye)
  - DNS fix (8.8.8.8) for Docker Desktop compatibility
  - Codespaces-ready hostRequirements
  - All ruralpeds extensions pre-installed
- .devcontainer/postcreate.sh (Rust targets, cargo tools, dioxus-cli, python, playwright)
- .devcontainer/poststart.sh (lightweight env check)
- .github/workflows/sprint-cloud-watchdog.yml (10-min scheduled auto-merge)

Works in: Docker Desktop local · GitHub Codespaces · GitHub Actions
Stack detected: ${STACK}

Adopted from ruralpeds/.github templates/sprint-bundle/" 2>/dev/null && \
  echo "✅ Committed" || echo "ℹ️  Nothing new to commit"

echo ""
echo "======================================================"
echo "Done. To start:"
echo "  Local:      code $REPO_ROOT  → Reopen in Container"
echo "  Codespaces: github.com/ruralpeds/${REPO_NAME} → Code → Codespaces → New"
echo "======================================================"
