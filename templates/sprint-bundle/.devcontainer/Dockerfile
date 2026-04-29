# ruralpeds / timothyhartzog universal dev container
#
# Builds locally — no GHCR auth required. Identical toolchain to the
# ruralpeds/sprint-base:v1 image plus a few extra Rust productivity tools.
#
# First build: ~8-12 min on Apple Silicon (downloads + compiles cargo tools).
# Subsequent starts: instant (Docker layer cache).
#
# Bump ARG values to update a toolchain version.

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
        clang lld \
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
    && npm install -g --no-fund --no-audit pnpm@latest

# ─── Python tooling ───────────────────────────────────────────────────────────
# hadolint ignore=DL3013
RUN pip install --break-system-packages --no-cache-dir \
        uv \
        pipx \
        pre-commit \
        ruff \
        black \
        mypy \
        pytest \
        pyyaml \
        requests

# Switch to the vscode user for all language toolchain installs.
USER vscode
ENV HOME=/home/vscode

# ─── Rust ─────────────────────────────────────────────────────────────────────
RUN curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs \
        | sh -s -- -y \
            --default-toolchain "${RUST_VERSION}" \
            --profile default \
            --component rust-src rust-analyzer clippy rustfmt \
    && /home/vscode/.cargo/bin/rustup target add \
        wasm32-unknown-unknown \
        wasm32-wasi

ENV PATH=/home/vscode/.cargo/bin:${PATH}

# ─── Cargo tools ──────────────────────────────────────────────────────────────
# Grouped into one RUN to share the registry cache layer.
RUN cargo install --locked --quiet wasm-pack \
 && cargo install --locked --quiet wasm-bindgen-cli \
 && cargo install --locked --quiet cargo-watch \
 && cargo install --locked --quiet cargo-edit \
 && cargo install --locked --quiet cargo-audit \
 && cargo install --locked --quiet cargo-deny \
 && cargo install --locked --quiet cargo-nextest \
 && cargo install --locked --quiet cargo-llvm-cov \
 && cargo install --locked --quiet bacon \
 && cargo install --locked --quiet just \
 && cargo install --locked --quiet taplo-cli \
 && cargo install --locked --quiet sqlx-cli --no-default-features --features rustls,sqlite,postgres

# ─── Julia ────────────────────────────────────────────────────────────────────
RUN curl -fsSL https://install.julialang.org \
        | sh -s -- --yes --default-channel "${JULIA_VERSION}"

ENV PATH=/home/vscode/.juliaup/bin:${PATH}

# ─── Shell config ─────────────────────────────────────────────────────────────
RUN echo 'export PATH=/home/vscode/.cargo/bin:/home/vscode/.juliaup/bin:$PATH' \
        >> /home/vscode/.bashrc \
    && echo 'export PATH=/home/vscode/.cargo/bin:/home/vscode/.juliaup/bin:$PATH' \
        >> /home/vscode/.zshrc

WORKDIR /workspaces

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD bash -c 'rustc --version && node --version && python3 --version'

LABEL org.opencontainers.image.source=https://github.com/ruralpeds/.github
LABEL org.opencontainers.image.description="ruralpeds universal dev container"
LABEL org.opencontainers.image.licenses=MIT
