# ruralpeds sprint-base v1
# Built and pushed to ghcr.io/ruralpeds/sprint-base:v1 by
# .github/workflows/build-sprint-base.yml. Consumed by every repo's
# .devcontainer/devcontainer.json across the ruralpeds org.
#
# Design notes:
# - Base image is the official VS Code dev container Ubuntu 24.04 image, which
#   already provides the `vscode` user, sudo, and Oh-My-Zsh defaults.
# - All language toolchains are installed for the `vscode` user, never root.
# - Versions are pinned via ARG so renovate/dependabot can bump them.
# - hadolint passes at warning threshold.

# hadolint ignore=DL3007
FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

ARG NODE_VERSION=22
ARG RUST_VERSION=stable
ARG JULIA_VERSION=1.11.3

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# ─── System deps ──────────────────────────────────────────────────────────────
# hadolint ignore=DL3008
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        build-essential pkg-config curl wget git ca-certificates \
        libssl-dev libffi-dev zlib1g-dev \
        postgresql-client \
        jq ripgrep fd-find bat \
        shellcheck yamllint \
        python3-full python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

# ─── GitHub CLI ───────────────────────────────────────────────────────────────
# hadolint ignore=DL3008,DL4006
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
        > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends gh \
    && rm -rf /var/lib/apt/lists/*

# ─── Node + pnpm ──────────────────────────────────────────────────────────────
# hadolint ignore=DL3008
RUN curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g --no-fund --no-audit pnpm@latest pin-github-action

# ─── Python tooling (system-wide) ─────────────────────────────────────────────
# hadolint ignore=DL3013
RUN pip install --break-system-packages --no-cache-dir \
        uv \
        pipx \
        pre-commit \
        ruff \
        black \
        mypy \
        pytest \
        pyyaml

# ─── act (local GitHub Actions runner) ────────────────────────────────────────
RUN curl --proto '=https' --tlsv1.2 -fsSL \
        https://raw.githubusercontent.com/nektos/act/master/install.sh \
        | bash -s -- -b /usr/local/bin

# Switch to the dev container user for all language toolchain installs.
USER vscode
ENV HOME=/home/vscode

# ─── Rust + wasm-pack + wasm32 target ─────────────────────────────────────────
RUN curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs \
        | sh -s -- -y --default-toolchain "${RUST_VERSION}" --profile default \
    && /home/vscode/.cargo/bin/rustup target add wasm32-unknown-unknown
ENV PATH=/home/vscode/.cargo/bin:${PATH}

RUN cargo install --locked --quiet \
        wasm-pack \
        wasm-bindgen-cli \
        cargo-watch \
        cargo-edit \
        cargo-audit \
        cargo-deny

# ─── Julia (juliaup, user-scoped) ─────────────────────────────────────────────
RUN curl -fsSL https://install.julialang.org \
        | sh -s -- --yes --default-channel "${JULIA_VERSION}"
ENV PATH=/home/vscode/.juliaup/bin:${PATH}

# ─── Workspace ────────────────────────────────────────────────────────────────
WORKDIR /workspaces

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD bash -c 'rustc --version >/dev/null \
              && node --version >/dev/null \
              && python3 --version >/dev/null \
              && julia --version >/dev/null'

LABEL org.opencontainers.image.source=https://github.com/ruralpeds/.github
LABEL org.opencontainers.image.description="ruralpeds sprint runtime base"
LABEL org.opencontainers.image.licenses=MIT
LABEL org.opencontainers.image.documentation=https://github.com/ruralpeds/.github/blob/main/docs/SPRINT_STANDARD.md
