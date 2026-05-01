# Dependency Risk Assessment - Q3 2026

Date: 2026-05-01
Scope: Third-party dependencies for clinical-path repositories.

## Summary

This initial assessment captures baseline findings and a triage framework.
Inventory source: compliance-metrics/dependency-inventory-q3-2026.csv.

Status:

1. Baseline inventory generation for this repository: complete.
2. External clinical repository inventory: pending repository-local execution.
3. Final risk rating: provisional until external repos are scanned.

## Risk Tiers

1. Approved: actively maintained, acceptable license, no critical vulnerabilities, BAA available when required.
2. Requires Review: incomplete metadata, low/moderate vulnerabilities, or BAA unclear.
3. Prohibited: incompatible license, unmaintained package, unresolved critical vulnerability.

## Initial Findings

1. Current repository dependencies are classified as Requires Review until license and vulnerability metadata are fully enriched.
2. Clinical repositories remain pending discovery in this workspace and are tracked as action items.

## Priority Actions

1. Run inventory scripts inside each scoped clinical repository.
2. Enrich each dependency row with license and vulnerability evidence.
3. Mark Tier as Approved, Requires Review, or Prohibited.
4. Open remediation tasks for any Prohibited dependencies.

## Evidence Required Per Dependency

1. License identifier and policy compatibility decision.
2. Last release date or maintenance signal.
3. Known vulnerabilities and fix status.
4. BAA status for vendors handling regulated data.

## Exit Criteria

1. 100 percent of dependencies in scope have non-placeholder metadata.
2. All Prohibited items have tracked replacement plans.
3. Risk summary approved by compliance and engineering owners.
