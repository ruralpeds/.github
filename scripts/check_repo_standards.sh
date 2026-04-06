#!/usr/bin/env bash
# check_repo_standards.sh — Validates repository structure and governance requirements.
#
# Usage: bash scripts/check_repo_standards.sh [REPO_ROOT]
#
# Checks that required governance files and docs exist at the expected paths.
# Exits non-zero with actionable error messages on any failure.
#
# Required files per the Healthcare Enterprise Repo Blueprint:
#   - AGENTS.md
#   - SECURITY.md
#   - CONTRIBUTING.md
#   - README.md
#   - docs/audit-events.md
#   - docs/data-classification.md
#   - docs/architecture.md
#   - docs/threat-model.md
#   - docs/observability.md
#   - docs/testing-strategy.md
#   - docs/release-process.md
#   - docs/playwright-strategy.md
#   - docs/incident-response.md
#   - docs/fhir-integration.md
#
# Optional (warnings only):
#   - .env.example
#   - copilot-instructions.md (checked at repo root and .github/copilot-instructions.md)

set -euo pipefail

REPO_ROOT="${1:-.}"
REPO_ROOT="$(cd "$REPO_ROOT" && pwd)"

ERRORS=0
WARNINGS=0

fail() {
  echo "::error::$1"
  ERRORS=$((ERRORS + 1))
}

warn() {
  echo "::warning::$1"
  WARNINGS=$((WARNINGS + 1))
}

require_file() {
  local path="$REPO_ROOT/$1"
  local description="${2:-$1}"
  if [ ! -f "$path" ]; then
    fail "Missing required file: $1 — $description"
  else
    echo "  ✓ $1"
  fi
}

warn_missing_file() {
  local path="$REPO_ROOT/$1"
  local description="${2:-$1}"
  if [ ! -f "$path" ]; then
    warn "Missing optional file: $1 — $description"
  else
    echo "  ✓ $1 (optional)"
  fi
}

echo "=== Repository Standards Check ==="
echo "Checking: $REPO_ROOT"
echo ""

echo "--- Governance files ---"
require_file "README.md" "Repository overview and entry point"
require_file "AGENTS.md" "Instructions for AI coding agents"
require_file "SECURITY.md" "Vulnerability reporting and secrets handling policy"
require_file "CONTRIBUTING.md" "Contribution guide including PR and test expectations"
echo ""

echo "--- Required documentation (docs/) ---"
require_file "docs/audit-events.md" "Stable catalog of audit event names (healthcare accountability)"
require_file "docs/data-classification.md" "PHI/ePHI handling rules and log redaction policy"
require_file "docs/architecture.md" "System architecture overview"
require_file "docs/threat-model.md" "Threat model and security analysis"
require_file "docs/observability.md" "Logging, tracing, metrics, and alerting strategy"
require_file "docs/testing-strategy.md" "Testing layers: unit, integration, contract, e2e, security"
require_file "docs/release-process.md" "Release and deployment governance"
require_file "docs/playwright-strategy.md" "Browser automation and e2e testing approach"
require_file "docs/incident-response.md" "Incident detection, response, and postmortem process"
require_file "docs/fhir-integration.md" "HL7 FHIR integration patterns and boundary contracts"
echo ""

echo "--- Optional / recommended files ---"
warn_missing_file ".env.example" "Template for required environment variables (no real secrets)"

# copilot-instructions.md may live at the repo root or in .github/
COPILOT_ROOT="$REPO_ROOT/copilot-instructions.md"
COPILOT_GITHUB="$REPO_ROOT/.github/copilot-instructions.md"
if [ -f "$COPILOT_ROOT" ] || [ -f "$COPILOT_GITHUB" ]; then
  echo "  ✓ copilot-instructions.md (optional)"
else
  warn "Missing optional file: copilot-instructions.md (checked repo root and .github/) — Copilot/agent instructions"
fi
echo ""

echo "=== Results ==="
echo "Errors   : $ERRORS"
echo "Warnings : $WARNINGS"
echo ""

if [ "$ERRORS" -gt 0 ]; then
  echo "FAIL — $ERRORS required file(s) missing."
  echo ""
  echo "To fix: add the missing files listed above."
  echo "See HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md for guidance on what each file should contain."
  exit 1
fi

echo "PASS — All required repository standards checks passed."
exit 0
