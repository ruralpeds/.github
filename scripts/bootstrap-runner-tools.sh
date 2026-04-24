#!/usr/bin/env bash
# bootstrap-runner-tools.sh
# Install every tool the HIPAA + Audit reusable workflows expect on the
# Mac Studio runner. Run once per fresh runner host.

set -euo pipefail

echo "==> Checking Homebrew"
if ! command -v brew >/dev/null; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

echo "==> Installing core toolchain"
brew update
brew install --quiet \
    git \
    gh \
    jq \
    yq \
    python@3.12 \
    node \
    go \
    rustup-init \
    julia || true

echo "==> Installing compliance tools"
brew install --quiet \
    trufflesecurity/trufflehog/trufflehog \
    aquasecurity/trivy/trivy \
    syft \
    grype \
    cosign \
    semgrep \
    pre-commit \
    codeql || true   # codeql may fail on brew; see note below

echo "==> Python compliance libs (user install)"
python3 -m pip install --user --upgrade \
    pip \
    pyyaml ruamel.yaml python-dateutil \
    detect-secrets pip-audit \
    bandit safety \
    semgrep

echo "==> Rust toolchain + audit"
if ! command -v cargo >/dev/null; then
  rustup-init -y --default-toolchain stable --profile minimal
fi
source "$HOME/.cargo/env"
cargo install --quiet --locked cargo-audit cargo-deny || true

echo "==> Node audit helpers"
npm install -g --silent npm audit-ci license-checker

echo
echo "==> Sanity check"
for bin in trufflehog trivy syft cosign semgrep cargo audit jq yq gh; do
  if command -v "$bin" >/dev/null; then
    printf "  ✅ %-14s %s\n" "$bin" "$(command -v "$bin")"
  else
    printf "  ❌ %-14s MISSING\n" "$bin"
  fi
done

echo
echo "Notes:"
echo "  - CodeQL CLI: if brew install failed, download from"
echo "      https://github.com/github/codeql-action/releases"
echo "    and put the binary on PATH. The codeql/codeql-action@v3 actions"
echo "    will bootstrap it themselves in most cases."
echo "  - Julia package auditing is minimal; see Pkg.status() + StaleDeps.jl."
