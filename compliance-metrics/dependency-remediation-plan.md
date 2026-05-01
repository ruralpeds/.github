# Dependency Remediation Plan - Q3 2026

Date: 2026-05-01
Owner: Compliance + Platform Engineering

## Objective

Close dependency risks identified in the Q3 dependency audit with deadlines by severity.

## Remediation Policy

1. Critical risk: remediation target within 30 days.
2. High risk: remediation target within 60 days.
3. Medium risk: remediation target within 90 days.
4. Low risk: schedule in normal maintenance cycle.

## Workstream

1. Inventory completion for all scoped repositories.
2. Classification and risk scoring.
3. Replacement or upgrade implementation.
4. Verification and closure evidence.

## Action Tracker

| Item ID | Repository | Dependency | Risk | Action | Owner | Due Date | Status |
|---|---|---|---|---|---|---|---|
| DRP-001 | ruralpeds/pedneoSim.jl | pending-discovery | Medium | Complete repo-local inventory and classify dependencies | Compliance | 2026-05-15 | Open |
| DRP-002 | ruralpeds/pediatric-cds | pending-discovery | Medium | Complete repo-local inventory and classify dependencies | Compliance | 2026-05-15 | Open |
| DRP-003 | ruralpeds/audit-service | pending-discovery | Medium | Complete repo-local inventory and classify dependencies | Compliance | 2026-05-15 | Open |

## Closure Criteria

1. No unresolved Prohibited dependencies remain in clinical-path repositories.
2. All Requires Review dependencies have explicit disposition.
3. Compliance evidence is archived in compliance-metrics.
