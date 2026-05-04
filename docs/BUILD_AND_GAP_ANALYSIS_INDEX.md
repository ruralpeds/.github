# Build and Gap Analysis Index

This document is the single entry point for build-status and gap-analysis material in `ruralpeds/.github`.

## Core Status and Operating Documents

| Area | Document | Purpose |
|---|---|---|
| Live gap backlog | [`../.gap-analysis/GAP_ANALYSIS.md`](../.gap-analysis/GAP_ANALYSIS.md) | Current repository gap inventory, priorities, owners, and status notes |
| Gap standard | [`../.gap-analysis/README.md`](../.gap-analysis/README.md) | Organization standard for `.gap-analysis/` structure and workflow |
| Gap schema | [`../.gap-analysis/schema.md`](../.gap-analysis/schema.md) | Repo-specific rules for gap tracking and validation |
| Build status execution | [`../BUILD_STATUS_SWEEP_EXECUTION_GUIDE.md`](../BUILD_STATUS_SWEEP_EXECUTION_GUIDE.md) | End-to-end execution guide for CI-driven build status updates |
| Repo overview | [`../README.md`](../README.md) | High-level workflow inventory and gap-status integration points |

## Gap Analysis Guidance

| Document | Purpose |
|---|---|
| [`GAP_ANALYSIS_WORKFLOWS.md`](GAP_ANALYSIS_WORKFLOWS.md) | Automation model for bootstrap, validation, notifications, and release gating |
| [`GAP_ANALYSIS_LIFECYCLE.md`](GAP_ANALYSIS_LIFECYCLE.md) | Status transitions and expected lifecycle of a gap |
| [`GAP_ANALYSIS_GOVERNANCE_INTEGRATION.md`](GAP_ANALYSIS_GOVERNANCE_INTEGRATION.md) | How gap analysis ties into governance and compliance workflows |
| [`GAP_ANALYSIS_SLACK_SETUP.md`](GAP_ANALYSIS_SLACK_SETUP.md) | Notification and collaboration setup for gap-analysis operations |
| [`gap-analysis-metrics.md`](gap-analysis-metrics.md) | Metrics and reporting notes for the gap-analysis system |

## Key Automation and Evidence Files

| Path | Purpose |
|---|---|
| [`../.gap-analysis/build-ledger.jsonl`](../.gap-analysis/build-ledger.jsonl) | Append-only build-status ledger for gap transitions |
| [`../workflows/gap-dashboard.yml`](../workflows/gap-dashboard.yml) | Dashboard workflow for gap-status reporting surfaces |
| [`../scripts/gap_lifecycle.py`](../scripts/gap_lifecycle.py) | Core lifecycle automation for gap status transitions |
| [`../scripts/consolidate_gap_analysis.py`](../scripts/consolidate_gap_analysis.py) | Consolidation helper for gap-analysis data |
| [`../scripts/aggregate_gaps.py`](../scripts/aggregate_gaps.py) | Aggregates gap records for reporting |
| [`../scripts/validate_gap_format.py`](../scripts/validate_gap_format.py) | Validation logic for gap-analysis structure |
| [`../scripts/gap_sync_coordinator.py`](../scripts/gap_sync_coordinator.py) | Synchronizes gap-analysis state across automation flows |

## Build and Gap Status Workflow Surfaces

The most relevant workflow surfaces in this repository are:

1. CI-driven gap status updates documented in [`../BUILD_STATUS_SWEEP_EXECUTION_GUIDE.md`](../BUILD_STATUS_SWEEP_EXECUTION_GUIDE.md).
2. Gap status embedding in `README.md` via `<!-- gap-status-start -->` markers.
3. Gap validation and synchronization described in [`GAP_ANALYSIS_WORKFLOWS.md`](GAP_ANALYSIS_WORKFLOWS.md).

## Suggested Reading Order

1. Start with [`../README.md`](../README.md).
2. Review [`../.gap-analysis/GAP_ANALYSIS.md`](../.gap-analysis/GAP_ANALYSIS.md) for live work.
3. Use [`../BUILD_STATUS_SWEEP_EXECUTION_GUIDE.md`](../BUILD_STATUS_SWEEP_EXECUTION_GUIDE.md) for build-status behavior.
4. Use the documents in this folder for governance, lifecycle, and operational detail.

## Archived and Superseded Documents

The following standalone docs were archived during consolidation because their content overlaps active entry points:

1. [`archive/2026-05-build-gap-analysis/GAP_ANALYSIS_QUICK_REFERENCE.md`](archive/2026-05-build-gap-analysis/GAP_ANALYSIS_QUICK_REFERENCE.md)
2. [`archive/2026-05-build-gap-analysis/GAP_ANALYSIS_STANDARDS.md`](archive/2026-05-build-gap-analysis/GAP_ANALYSIS_STANDARDS.md)
3. [`archive/2026-05-build-gap-analysis/README.md`](archive/2026-05-build-gap-analysis/README.md)
