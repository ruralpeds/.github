# ruralpeds sprint-base v1
# Built and pushed to ghcr.io/ruralpeds/sprint-base:v1
# This image is consumed by every repo's .devcontainer/devcontainer.json.

FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

ARG NODE_VERSION=22
ARG RUST_VERSION=stable
ARG JULIA_VERSION=1.11.3
ARG PYTHON_VERSION=3.12

# System deps
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      build-essential pkg-config curl wget git ca-certificates \
      libssl-dev libffi-dev zlib1g-dev \
      postgresql-client \
      jq ripgrep fd-find bat \
      shellcheck yamllint \
    && rm -rf /var/lib/apt/lists/*

# Rust + wasm-pack + wasm32 target
USER vscode
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain ${RUST_VERSION} --profile default
ENV PATH=/home/vscode/.cargo/bin:$PATH
RUN rustup target add wasm32-unknown-unknown \
    && cargo install --locked wasm-pack wasm-bindgen-cli cargo-watch cargo-edit cargo-audit cargo-deny

# Node + pnpm
USER root
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@latest pin-github-action

# Python tools
RUN pip install --break-system-packages --no-cache-dir uv pipx pre-commit ruff black mypy pytest

# Julia
RUN curl -fsSL https://install.julialang.org | sh -s -- --yes --default-channel ${JULIA_VERSION}
ENV PATH=/root/.juliaup/bin:$PATH
USER vscode

# Local tools
USER root
RUN curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | bash -s -- -b /usr/local/bin

# GitHub CLI extensions used by sprint workflows
USER vscode
RUN gh extension install github/gh-copilot 2>/dev/null || true

WORKDIR /workspaces

LABEL org.opencontainers.image.source=https://github.com/ruralpeds/.github
LABEL org.opencontainers.image.description="ruralpeds sprint runtime base"
LABEL org.opencontainers.image.licenses=MIT
