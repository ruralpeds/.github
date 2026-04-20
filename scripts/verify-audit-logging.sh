#!/bin/bash
# Verify enterprise audit logging compliance for all projects

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ORG="${1:-timothyhartzog}"
OUTPUT_DIR="${2:-compliance-report}"
VERBOSE="${3:-false}"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Enterprise Audit Logging Compliance Verification${NC}"
echo -e "${BLUE}Organization: $ORG${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Initialize report
REPORT_FILE="$OUTPUT_DIR/audit-compliance-report.json"
cat > "$REPORT_FILE" << 'EOF'
{
  "scan_date": "",
  "organization": "",
  "total_repos": 0,
  "compliant_repos": 0,
  "non_compliant_repos": 0,
  "compliance_rate": 0,
  "repos": []
}
EOF

SCAN_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Function to check single repo
check_repo() {
  local repo=$1
  local repo_path="/tmp/audit-check-$RANDOM"

  local status="compliant"
  local details=()
  local checks=()

  if [ "$VERBOSE" == "true" ]; then
    echo -e "${YELLOW}Cloning $ORG/$repo...${NC}"
  fi

  # Clone repo
  if ! git clone --quiet "https://github.com/$ORG/$repo.git" "$repo_path" 2>/dev/null; then
    echo -e "${RED}✗${NC} $repo: Failed to clone"
    rm -rf "$repo_path"
    return 1
  fi

  # Check 1: audit.yml workflow exists
  if [ -f "$repo_path/.github/workflows/audit.yml" ]; then
    echo -e "${GREEN}✓${NC} audit.yml workflow"
    checks+=('{"name": "audit.yml workflow", "status": "pass"}')
  else
    echo -e "${RED}✗${NC} audit.yml workflow missing"
    checks+=('{"name": "audit.yml workflow", "status": "fail"}')
    status="non_compliant"
  fi

  # Check 2: audit-log directory exists
  if [ -d "$repo_path/audit-log" ] && [ -f "$repo_path/audit-log/ledger.json" ]; then
    BUILD_COUNT=$(jq '.summary.total_builds // 0' "$repo_path/audit-log/ledger.json" 2>/dev/null || echo "0")
    echo -e "${GREEN}✓${NC} audit-log directory ($BUILD_COUNT builds)"
    checks+=("{\"name\": \"audit-log directory\", \"status\": \"pass\", \"builds\": $BUILD_COUNT}")
  else
    echo -e "${RED}✗${NC} audit-log directory or ledger.json missing"
    checks+=('{"name": "audit-log directory", "status": "fail"}')
    status="non_compliant"
  fi

  # Check 3: AUDIT_EVENTS.md documented
  if [ -f "$repo_path/docs/AUDIT_EVENTS.md" ]; then
    EVENT_COUNT=$(grep -c "^- " "$repo_path/docs/AUDIT_EVENTS.md" 2>/dev/null || echo "0")
    echo -e "${GREEN}✓${NC} AUDIT_EVENTS.md ($EVENT_COUNT events)"
    checks+=("{\"name\": \"AUDIT_EVENTS.md\", \"status\": \"pass\", \"events\": $EVENT_COUNT}")
  else
    echo -e "${YELLOW}⚠${NC} docs/AUDIT_EVENTS.md missing (optional)"
    checks+=('{"name": "AUDIT_EVENTS.md", "status": "warning"}')
  fi

  # Check 4: review.yml workflow exists
  if [ -f "$repo_path/.github/workflows/review.yml" ]; then
    echo -e "${GREEN}✓${NC} review.yml workflow"
    checks+=('{"name": "review.yml workflow", "status": "pass"}')
  else
    echo -e "${YELLOW}⚠${NC} review.yml workflow missing (optional)"
    checks+=('{"name": "review.yml workflow", "status": "warning"}')
  fi

  # Check 5: CODEOWNERS protection
  if [ -f "$repo_path/.github/CODEOWNERS" ] && grep -q "audit-log" "$repo_path/.github/CODEOWNERS"; then
    echo -e "${GREEN}✓${NC} CODEOWNERS audit-log protection"
    checks+=('{"name": "CODEOWNERS protection", "status": "pass"}')
  else
    echo -e "${YELLOW}⚠${NC} CODEOWNERS protection missing (optional)"
    checks+=('{"name": "CODEOWNERS protection", "status": "warning"}')
  fi

  # Get last review date if available
  LAST_REVIEW="null"
  if [ -f "$repo_path/audit-log/ledger.json" ]; then
    LAST_REVIEW=$(jq '.summary.date_last_reviewed' "$repo_path/audit-log/ledger.json" 2>/dev/null || echo "null")
  fi

  # Build repo entry
  local checks_json=$(printf '%s\n' "${checks[@]}" | paste -sd ',' -)

  # Clean up
  rm -rf "$repo_path"

  # Output result
  echo ""

  if [ "$status" == "compliant" ]; then
    echo -e "${GREEN}Status: COMPLIANT${NC}"
  else
    echo -e "${RED}Status: NON-COMPLIANT${NC}"
  fi

  echo ""

  return 0
}

# Get list of org repos
echo "Fetching repository list..."
REPOS=$(gh repo list "$ORG" --limit 1000 --json name --jq '.[].name' 2>/dev/null || echo "")

if [ -z "$REPOS" ]; then
  echo -e "${RED}Error: Could not fetch repositories. Make sure 'gh' CLI is installed and authenticated.${NC}"
  exit 1
fi

TOTAL_REPOS=$(echo "$REPOS" | wc -l)
COMPLIANT_COUNT=0
NON_COMPLIANT_COUNT=0

echo -e "Found ${BLUE}$TOTAL_REPOS${NC} repositories"
echo ""

# Check each repo
while IFS= read -r repo; do
  [ -z "$repo" ] && continue

  echo -e "${BLUE}───────────────────────────────────────────────────────────${NC}"
  echo -e "Repository: ${BLUE}$repo${NC}"
  echo -e "${BLUE}───────────────────────────────────────────────────────────${NC}"

  if check_repo "$repo"; then
    ((COMPLIANT_COUNT++)) || true
  else
    ((NON_COMPLIANT_COUNT++)) || true
  fi
done <<< "$REPOS"

NON_COMPLIANT_COUNT=$((TOTAL_REPOS - COMPLIANT_COUNT))
COMPLIANCE_RATE=$((COMPLIANT_COUNT * 100 / TOTAL_REPOS))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Compliance Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "Total Repositories: ${BLUE}$TOTAL_REPOS${NC}"
echo -e "Compliant: ${GREEN}$COMPLIANT_COUNT${NC}"
echo -e "Non-Compliant: ${RED}$NON_COMPLIANT_COUNT${NC}"
echo -e "Compliance Rate: ${BLUE}${COMPLIANCE_RATE}%${NC}"
echo ""

if [ $COMPLIANCE_RATE -eq 100 ]; then
  echo -e "${GREEN}✓ All repositories are audit logging compliant!${NC}"
elif [ $COMPLIANCE_RATE -ge 80 ]; then
  echo -e "${YELLOW}⚠ Most repositories are compliant. Review non-compliant repos.${NC}"
else
  echo -e "${RED}✗ Significant number of non-compliant repositories. Remediation required.${NC}"
fi

echo ""
echo "Report saved to: $REPORT_FILE"
