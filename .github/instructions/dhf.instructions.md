---
applyTo: "dhf/**"
---

# Instructions: Design History File (IEC 62304 / ISO 14971)

**STOP.** Files under `dhf/` are regulated documentation. Read this whole file before making any change.

## Absolute rules

- **Never edit anything under `dhf/risk/`.** Hazard analysis, risk controls, and residual-risk documents require a named clinical reviewer and a formal risk-review cycle. Not overridable by task instruction.
- **Never edit `dhf/classification.md`** (the software safety class). This is set once per repo by a human and changes only via a full re-classification event.
- **Never delete a released version directory** under `dhf/releases/<version>/`. Released artifacts are immutable evidence. Append only.
- **Never change requirement IDs.** `SW-###`, `SYS-###`, `UN-###`, `RC-###`, `HZ-###` are stable identifiers referenced from source code, tests, and audit records. New requirements get new IDs (monotonically increasing); old IDs are retired, never renumbered or reused.

## What you may do

- Add new requirements to `dhf/requirements/software-requirements.yaml` with a new `SW-###` ID greater than the current maximum.
- Add new test-to-requirement mappings in `dhf/verification/unit-test-map.yaml` or `integration-map.yaml`.
- Update status fields (`implemented`, `verified`, `released-in`) on existing requirements when the corresponding code/test lands — but only if the code/test lands in the same PR.
- Add new release directories under `dhf/releases/<version>/` when cutting a release (release workflow responsibility; an agent should almost never do this directly).

## Schema for `software-requirements.yaml`

```yaml
requirements:
  - id: SW-042
    title: "Validate gestational age input range"
    parent: SYS-011
    description: >
      The function MUST reject gestational age inputs outside the range 22w0d..44w6d
      and MUST emit a clinical.input.rejected audit event with the offending value hashed.
    type: functional           # functional | interface | safety | performance
    priority: high             # low | medium | high | critical
    risk-controls: [RC-007]
    implemented:
      location: "src/gestational_age.rs:validate_ga"
      commit: 3f4a1b...
      date: 2026-04-23
    verified:
      tests:
        - "tests/unit/test_ga_validation.rs::test_rejects_below_22w"
        - "tests/unit/test_ga_validation.rs::test_rejects_above_44w6d"
      date: 2026-04-23
    released-in: "v1.4.0"
    status: released           # draft | implemented | verified | released | retired
    references:
      - "AAP Perinatal Guidelines 8th ed. Ch 3"
      - "ACOG Committee Opinion 700"
```

## Schema for `unit-test-map.yaml`

```yaml
mappings:
  - test: "tests/unit/test_ga_validation.rs::test_rejects_below_22w"
    verifies: [SW-042]
    type: boundary-value
    last-run: 2026-04-23
    last-result: passed
```

## When adding a new requirement

1. Assign the next `SW-###` ID (look for max, add 1).
2. Link to a parent system or user requirement.
3. Write the requirement as a single `MUST`/`MUST NOT`/`SHOULD` statement, testable in isolation.
4. Identify applicable risk controls (ask in the PR if unclear — do not invent RC-### IDs).
5. If adding in the same PR as the implementation: fill `implemented` and `verified` fields.
6. If not: leave as `status: draft` with those fields empty. A follow-up PR fills them.

## When modifying existing source that is annotated `@requirement SW-###`

- The requirement's `implemented.commit` and `implemented.date` must be updated in the same PR.
- If the behavior change affects the requirement statement itself, the requirement must be retired (`status: retired`) and a new ID issued. Never silently change requirement text — that breaks audit trail.
- A note is added to `dhf/requirements/history.md` describing the retirement rationale.

## PRs touching `dhf/` always

- Include the label `dhf-change`.
- Are reviewed by `@ruralpeds/clinical` (not just `@ruralpeds/engineering`).
- Have commit type `dhf:` per Conventional Commits.
- Include in PR body the standards cited: `IEC 62304 §<section>`, `ISO 14971 §<section>`.
