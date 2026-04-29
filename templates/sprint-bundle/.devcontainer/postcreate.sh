#!/usr/bin/env bash
# postcreate.sh — runs once after the devcontainer is built.
# This is where per-repo setup happens (deps, hooks, sanity checks).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> ruralpeds sprint runtime: post-create"

# Verify gh auth is mounted and works.
if gh auth status >/dev/null 2>&1; then
  echo "✓ gh CLI authenticated as $(gh api user --jq .login)"
else
  echo "⚠ gh CLI is NOT authenticated. The cloud agent uses GITHUB_TOKEN automatically;"
  echo "  if you are a human contributor, run: gh auth login"
fi

# Install pre-commit hooks if config exists.
if [[ -f .pre-commit-config.yaml ]]; then
  pre-commit install --install-hooks
fi

# Language-specific bootstrap (each is a no-op if not applicable).
if [[ -f Cargo.toml ]]; then
  echo "==> Rust workspace detected"
  rustup show
  cargo fetch --locked || cargo fetch
fi

if [[ -f package.json ]]; then
  echo "==> Node project detected"
  if command -v pnpm >/dev/null && [[ -f pnpm-lock.yaml ]]; then
    pnpm install --frozen-lockfile
  elif [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
fi

if [[ -f ui/package.json ]]; then
  echo "==> ui/ workspace detected"
  ( cd ui && (command -v pnpm >/dev/null && [[ -f pnpm-lock.yaml ]] && pnpm install --frozen-lockfile || npm ci || npm install) )
fi

if [[ -f Project.toml ]]; then
  echo "==> Julia project detected"
  julia --project=. -e 'using Pkg; Pkg.instantiate()'
fi

if [[ -f pyproject.toml ]]; then
  echo "==> Python project detected"
  if command -v uv >/dev/null; then
    uv sync || true
  else
    pip install --user -e . || true
  fi
fi

echo "==> Done."
