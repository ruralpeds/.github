#!/usr/bin/env bash
# check_audit_events_md.sh — Validates docs/audit-events.md contains the required
# stable event name catalog for healthcare enterprise repositories.
#
# Usage: bash scripts/check_audit_events_md.sh [REPO_ROOT]
#
# Required events (from HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md §7.5):
#   auth.login.succeeded
#   auth.login.failed
#   user.role.changed
#   patient.record.viewed
#   patient.record.updated
#   patient.record.exported
#   admin.configuration.changed
#   deployment.production.approved
#
# The file is expected at: docs/audit-events.md
#
# Exits non-zero with actionable error messages if the catalog is missing or
# any required event is absent.

set -euo pipefail

REPO_ROOT="${1:-.}"
REPO_ROOT="$(cd "$REPO_ROOT" && pwd)"

AUDIT_FILE="$REPO_ROOT/docs/audit-events.md"

ERRORS=0

fail() {
  echo "::error::$1"
  ERRORS=$((ERRORS + 1))
}

echo "=== Audit Events Catalog Validation ==="
echo "Checking: $AUDIT_FILE"
echo ""

# --- File existence check ---
if [ ! -f "$AUDIT_FILE" ]; then
  fail "docs/audit-events.md does not exist. Create this file with a stable catalog of audit event names."
  echo ""
  echo "FAIL — audit events catalog missing."
  echo ""
  echo "Required events to include:"
  echo "  auth.login.succeeded"
  echo "  auth.login.failed"
  echo "  user.role.changed"
  echo "  patient.record.viewed"
  echo "  patient.record.updated"
  echo "  patient.record.exported"
  echo "  admin.configuration.changed"
  echo "  deployment.production.approved"
  exit 1
fi

# --- Non-empty check ---
if [ ! -s "$AUDIT_FILE" ]; then
  fail "docs/audit-events.md is empty. Populate it with the required audit event catalog."
fi

# --- Required event name checks ---
# Each event is checked by a grep on the literal dotted name. The name must
# appear in the file (typically as inline code, table cell, or list item).

check_event() {
  local event="$1"
  if grep -qF "$event" "$AUDIT_FILE"; then
    echo "  ✓ $event"
  else
    fail "Required event '$event' not found in docs/audit-events.md. Add it to the catalog."
  fi
}

echo "--- Checking required event names ---"
check_event "auth.login.succeeded"
check_event "auth.login.failed"
check_event "user.role.changed"
check_event "patient.record.viewed"
check_event "patient.record.updated"
check_event "patient.record.exported"
check_event "admin.configuration.changed"
check_event "deployment.production.approved"
echo ""

# --- Warn if no event name pattern matches standard naming convention ---
# Event names should follow the pattern: <domain>.<subject>.<verb>
# Check that at least 5 dotted event names exist to confirm a real catalog.
EVENT_COUNT=$(grep -oE '[a-z][a-z0-9_-]+\.[a-z][a-z0-9_-]+\.[a-z][a-z0-9_-]+' "$AUDIT_FILE" | wc -l || true)
if [ "$EVENT_COUNT" -lt 5 ]; then
  echo "::warning::docs/audit-events.md contains fewer than 5 dotted event names (domain.subject.verb). Consider expanding the catalog."
fi

echo "=== Results ==="
echo "Errors: $ERRORS"
echo ""

if [ "$ERRORS" -gt 0 ]; then
  echo "FAIL — audit events catalog validation failed."
  echo ""
  echo "Update docs/audit-events.md to include all required event names."
  echo "See HEALTHCARE_ENTERPRISE_REPO_BLUEPRINT.md §7.5 for guidance."
  exit 1
fi

echo "PASS — docs/audit-events.md passes all required checks."
exit 0
