# Dependency Policy Implementation Guide

## Purpose

This guide explains how repositories implement the organization dependency policy in `policies/dependencies.md`.

## Inputs and Evidence

Each in-scope repository should produce or reference:

1. A dependency inventory from native manifests and SBOM tooling.
2. License and vulnerability evidence for each dependency.
3. Maintenance signals for direct and critical transitive packages.
4. BAA status for vendors that may process regulated data.

## Classification Workflow

1. Build or refresh the inventory.
2. Enrich each dependency row with license, maintenance, vulnerability, and BAA fields.
3. Assign one of three dispositions: Approved, Requires Review, or Prohibited.
4. Record unresolved findings in the remediation plan.
5. Review results with compliance and engineering owners.

## Repository Expectations

Repositories that are regulated, device-related, or clinical-path should:

1. Run inventory generation on a defined schedule.
2. Preserve dependency evidence in `compliance-metrics/`.
3. Open remediation work for Prohibited dependencies.
4. Reassess dependencies whenever a new package is introduced or risk posture changes materially.

## Review Questions

Use these prompts during classification:

1. Is the license acceptable for organizational use and distribution?
2. Is the dependency actively maintained?
3. Are any critical or high vulnerabilities unresolved?
4. Could the dependency expose PHI or affect regulated records?
5. Is a BAA required, and if so, has it been executed?

## Approval and Escalation

1. Approved dependencies may continue in normal maintenance.
2. Requires Review dependencies need explicit disposition before they become assumed-safe defaults.
3. Prohibited dependencies require replacement, removal, or time-bound exception approval.

Escalate immediately when:

1. A critical vulnerability is disclosed.
2. A dependency becomes unmaintained.
3. A licensing conflict is discovered.
4. A vendor handling regulated data lacks required contractual assurances.

## Artifact Set

The current dependency audit artifact set is:

1. `compliance-metrics/dependency-inventory-q3-2026.csv`
2. `compliance-metrics/dependency-risk-assessment.md`
3. `compliance-metrics/dependency-remediation-plan.md`
4. `policies/dependencies.md`

## Standards Touched

This implementation supports:

1. NIST SP 800-218 (SSDF v1.1) supply-chain review and dependency governance.
2. FDA Section 524B software transparency and software pedigree expectations.
3. ISO 13485 supplier control and document-control practices.
