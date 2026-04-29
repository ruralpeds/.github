#!/usr/bin/env bash
# poststart.sh — runs every time the devcontainer starts.
# Quick reminders for human and agent contributors.
set -euo pipefail

cat <<'EOF'

╭──────────────────────────────────────────────────────────────╮
│  ruralpeds sprint runtime — ready                            │
│                                                              │
│  Sprint loop:                                                │
│    1. Read the build plan in the repo root.                  │
│    2. Pick an unblocked task in copilot-tasks/phase-NN-*/    │
│    3. For VS Code agent mode: use Copilot Chat → @copilot.   │
│    4. For cloud agent: assign the linked GitHub issue.       │
│    5. Branch convention: agent/<phase>/<slug>-<issue#>       │
│                                                              │
│  Standards (do not edit without an explicit task):           │
│    - AGENTS.md                                               │
│    - .github/copilot-instructions.md                         │
│    - copilot-tasks/_schema.md                                │
╰──────────────────────────────────────────────────────────────╯

EOF
