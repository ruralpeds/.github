#!/usr/bin/env bash
# postcreate.sh — runs ONCE after the container is first built.
# Auto-detects what's in the repo and bootstraps accordingly.
# Never exits non-zero — every step is advisory.

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
echo ""
echo "==> ruralpeds dev container: post-create setup"
echo ""

# ─── gh auth ──────────────────────────────────────────────────────────────────
if gh auth status >/dev/null 2>&1; then
  echo "✓ gh CLI: authenticated as $(gh api user --jq .login 2>/dev/null || echo unknown)"
else
  echo "⚠ gh CLI: not authenticated — run 'gh auth login' in the terminal"
fi

# ─── pre-commit ───────────────────────────────────────────────────────────────
if [[ -f .pre-commit-config.yaml ]]; then
  echo "==> Installing pre-commit hooks..."
  pre-commit install --install-hooks || echo "⚠ pre-commit install failed (non-fatal)"
fi

# ─── Rust ─────────────────────────────────────────────────────────────────────
if [[ -f Cargo.toml ]]; then
  echo "==> Rust workspace detected"
  echo "    $(rustc --version 2>/dev/null || echo 'rustc not found')"
  cargo fetch --locked 2>/dev/null || cargo fetch 2>/dev/null || echo "⚠ cargo fetch failed (non-fatal)"

  # Build WASM target if hfe-wasm or similar crate present
  if find . -name "Cargo.toml" -exec grep -l "wasm-bindgen" {} \; 2>/dev/null | grep -q .; then
    echo "    WASM crate detected — wasm-pack available at: $(which wasm-pack)"
  fi
fi

# ─── Node / pnpm ──────────────────────────────────────────────────────────────
# Check root, ui/, apps/react-next/, apps/web/
for NODE_DIR in . ui apps/react-next apps/web desktop; do
  if [[ -f "${NODE_DIR}/package.json" ]]; then
    echo "==> Node project detected: ${NODE_DIR}/"
    if command -v pnpm >/dev/null && [[ -f "${NODE_DIR}/pnpm-lock.yaml" ]]; then
      pnpm install --frozen-lockfile --prefix "${NODE_DIR}" \
        || echo "⚠ pnpm install failed in ${NODE_DIR}/ (non-fatal)"
    elif [[ -f "${NODE_DIR}/package-lock.json" ]]; then
      npm --prefix "${NODE_DIR}" ci \
        || echo "⚠ npm ci failed in ${NODE_DIR}/ (non-fatal)"
    fi
  fi
done

# ─── Python ───────────────────────────────────────────────────────────────────
if [[ -f pyproject.toml ]]; then
  echo "==> Python project detected"
  uv sync 2>/dev/null || echo "⚠ uv sync failed (non-fatal)"
elif [[ -f requirements.txt ]]; then
  echo "==> Python requirements.txt detected"
  pip install --user -r requirements.txt 2>/dev/null || echo "⚠ pip install failed (non-fatal)"
fi

# ─── Julia ────────────────────────────────────────────────────────────────────
if [[ -f Project.toml ]]; then
  echo "==> Julia project detected — $(julia --version 2>/dev/null || echo 'julia not found')"
  julia --project=. -e 'using Pkg; Pkg.instantiate()' \
    || echo "⚠ Julia Pkg.instantiate failed (non-fatal)"
fi

echo ""
echo "==> post-create done. Open Copilot Chat (Cmd+Shift+I) to start."
echo ""
