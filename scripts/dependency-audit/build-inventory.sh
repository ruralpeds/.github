#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUTPUT_FILE="${ROOT_DIR}/compliance-metrics/dependency-inventory-q3-2026.csv"
RUN_TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
export RUN_TS

mkdir -p "${ROOT_DIR}/compliance-metrics"

cat >"${OUTPUT_FILE}" <<'CSV'
repo,ecosystem,dependency_name,version_spec,class,tier,license,maintained_status,vulnerability_status,baa_status,notes,observed_at
CSV

# Inventory this repository as a baseline data source.
if [[ -f "${ROOT_DIR}/package.json" ]]; then
  jq -r --arg run_ts "$RUN_TS" '
    [(.dependencies // {}), (.devDependencies // {})]
    | add
    | to_entries[]
    | ["ruralpeds/.github","npm",.key,.value,"template-infra","requires-review","unknown","unknown","unknown","not-applicable","local repo dependency; external clinical repos pending",$run_ts]
    | @csv
  ' "${ROOT_DIR}/package.json" >>"${OUTPUT_FILE}"
fi

# Add required initiative scope placeholders for external repositories.
cat >>"${OUTPUT_FILE}" <<CSV
ruralpeds/pedneoSim.jl,julia,pending-discovery,n/a,clinical,requires-review,unknown,unknown,unknown,unknown,run inventory in pedneoSim.jl repository,${RUN_TS}
ruralpeds/pediatric-cds,mixed,pending-discovery,n/a,clinical,requires-review,unknown,unknown,unknown,unknown,run inventory in pediatric-cds repository,${RUN_TS}
ruralpeds/audit-service,mixed,pending-discovery,n/a,clinical,requires-review,unknown,unknown,unknown,unknown,run inventory in audit-service repository,${RUN_TS}
CSV

echo "Wrote ${OUTPUT_FILE}"