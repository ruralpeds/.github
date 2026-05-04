# Dependency Classification and Approval Policy

## Purpose

This policy defines how `ruralpeds/*` repositories classify, approve, and remediate third-party dependencies used in regulated and safety-relevant software.

This policy applies to:

1. Direct dependencies declared in manifest files.
2. Transitive dependencies included in build or runtime artifacts.
3. Hosted vendors or services that process regulated data or support regulated workflows.

## Classification Tiers

### Tier 1: Approved

A dependency is **Approved** when all of the following are true:

1. License is compatible with organizational use.
2. Package is actively maintained.
3. No unresolved critical vulnerabilities exist.
4. BAA or equivalent vendor assurance exists when the dependency or service handles regulated data.

### Tier 2: Requires Review

A dependency is **Requires Review** when one or more of the following are true:

1. License or maintenance metadata is incomplete.
2. Low or moderate vulnerabilities remain open with compensating controls.
3. Vendor assurance is pending or not applicable but data-handling impact must be reviewed.
4. Dependency is new to the organization and has not completed initial compliance review.

### Tier 3: Prohibited

A dependency is **Prohibited** when any of the following are true:

1. License is incompatible with organizational distribution or deployment.
2. Dependency is unmaintained beyond 24 months without documented exception.
3. Critical vulnerability remains unresolved and no acceptable mitigation exists.
4. Vendor or package introduces unacceptable PHI, security, or regulatory risk.

## Required Evidence Per Dependency

Every dependency in scope must have:

1. Name, ecosystem, and version or version range.
2. License identifier and compatibility decision.
3. Maintenance signal, including last release or equivalent activity indicator.
4. Vulnerability status with source of evidence.
5. BAA status when the dependency or service may touch regulated data.
6. Final disposition: Approved, Requires Review, or Prohibited.

## Approval Process for New Dependencies

Before a new dependency is adopted in a regulated or clinical-path repository:

1. Generate or update inventory evidence.
2. Review license, maintenance, and vulnerability status.
3. Assess PHI exposure and BAA requirements.
4. Assign an initial tier.
5. Record the decision in compliance evidence before merge.

New dependencies must not be merged as silently approved defaults.

## Remediation Expectations

When a dependency is not Approved:

1. **Critical risk:** remediate or remove within 30 days.
2. **High risk:** remediate within 60 days.
3. **Medium risk:** remediate within 90 days.
4. **Low risk:** schedule in normal maintenance cycle.

Prohibited dependencies require a tracked replacement, removal, or exception decision.

## Review Cadence

1. Inventory refresh runs at least monthly.
2. Dependency classification is reviewed quarterly for clinical and regulated repositories.
3. Any critical vulnerability triggers immediate reassessment outside the normal cadence.

## Required Artifacts

The dependency audit program maintains these artifacts:

1. `compliance-metrics/dependency-inventory-q3-2026.csv`
2. `compliance-metrics/dependency-risk-assessment.md`
3. `compliance-metrics/dependency-remediation-plan.md`
4. `docs/compliance/DEPENDENCY_POLICY.md`

## Standards Mapping

This policy supports:

1. NIST SP 800-218 (SSDF v1.1) supply-chain risk practices.
2. FDA Section 524B software security pedigree expectations.
3. ISO 13485 supplier and document control expectations.

## Exceptions

Any exception to this policy must:

1. Identify the dependency and affected repositories.
2. State the business and safety rationale.
3. Define compensating controls and expiration date.
4. Be approved by compliance and engineering owners.
