---
title: "Build IEC 62304 traceability workflow and DHF scaffold"
phase: phase-06
slug: iec62304-traceability-workflow
preferred-agent: copilot
preflight-confirmation: true
estimated-complexity: l

depends-on:
  - custom-properties

goal: >
  Produce a reusable workflow that, for any repo with `iec62304-class` set to
  class-a/b/c, reads requirement/hazard/test-map YAML files, verifies every
  requirement is implemented and tested, every hazard has a risk control,
  every risk control has code and test, and fails the PR if any gap exists.
  Also build the initial DHF scaffold that the workflow reads.

acceptance-criteria:
  - "`.github/workflows/reusable-iec62304-traceability.yml` generated, callable from any clinical repo"
  - "`scripts/traceability/build_matrix.py` parses dhf/**/*.yaml and emits traceability-matrix.json and traceability-matrix.html"
  - "`scripts/traceability/check_gaps.py` returns exit 0 only if every SW-### has >=1 test and every HZ-### has >=1 RC-###"
  - "A template DHF skeleton under `templates/dhf/` that can be copied into any new clinical repo"
  - "Schemas validated: `policies/dhf/schemas/requirements.schema.json`, `hazard-analysis.schema.json`, `unit-test-map.schema.json`"
  - "`docs/compliance/dhf-guide.md` explains the whole flow"
  - "A sample repo (e.g., a fork or scratch repo labeled `class-b`) demonstrates the workflow passing and failing with deliberate gaps"

files-to-touch:
  - ".github/workflows/reusable-iec62304-traceability.yml"
  - "scripts/traceability/build_matrix.py"
  - "scripts/traceability/check_gaps.py"
  - "scripts/traceability/templates/matrix.html.j2"
  - "policies/dhf/schemas/requirements.schema.json"
  - "policies/dhf/schemas/hazard-analysis.schema.json"
  - "policies/dhf/schemas/unit-test-map.schema.json"
  - "templates/dhf/requirements/software-requirements.yaml"
  - "templates/dhf/risk/hazard-analysis.yaml"
  - "templates/dhf/verification/unit-test-map.yaml"
  - "templates/dhf/classification.md"
  - "templates/dhf/README.md"
  - "docs/compliance/dhf-guide.md"

files-not-to-touch:
  - "AGENTS.md"
  - "audit-log/**"
  - ".github/workflows/audit-log.yml"
  - "policies/rulesets/**"

tests-required: |
  - Unit tests under `tests/traceability/`:
    - parses a valid requirements.yaml
    - rejects duplicate SW-### IDs
    - rejects hazard with severity but no probability
    - check_gaps succeeds on a fully-mapped fixture
    - check_gaps fails with correct line references on:
      * requirement with no test
      * hazard with no risk control
      * risk control not cited in any requirement
      * test citing a retired requirement
  - Integration test: build_matrix.py on a fixture emits HTML that opens
    in a browser (smoke-render only, no assertion on visuals) and JSON
    that parses as a valid traceability matrix.
  - `actionlint .github/workflows/reusable-iec62304-traceability.yml`.

standards:
  - "IEC 62304 §5.2 (Software requirements analysis)"
  - "IEC 62304 §5.3 (Software architectural design)"
  - "IEC 62304 §5.5 (Software unit implementation and verification)"
  - "IEC 62304 §5.6 (Software integration and integration testing)"
  - "IEC 62304 §5.7 (Software system testing)"
  - "ISO 14971 §7.1 (Risk control option analysis)"
  - "ISO 14971 §7.4 (Risk control measure implementation)"
  - "FDA Guidance: Content of Premarket Submissions for Device Software Functions (2023)"

rollback: >
  Mark the reusable workflow as skippable via input flag; existing repos
  that call it continue to call, but new repos can bypass. DHF template
  remains as reference material.

labels:
  - "compliance"
  - "iec62304"
  - "iso14971"
  - "clinical"

requires-human-after: review

---

## Context

IEC 62304 §5 requires a documented lifecycle where every software requirement
can be traced to implementing code and verifying tests, and every hazard
identified under ISO 14971 has risk-control measures. In practice this is
done with a spreadsheet or — in a code-as-docs world — with YAML files the
CI pipeline reads.

This task builds that pipeline. After it lands, any clinical repo that wants
to credibly support a 510(k) submission, a notified body review, or an
internal audit has the evidence structure in place.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  dhf/                          (the evidence)               │
│  ├── requirements/software-requirements.yaml                │
│  ├── risk/hazard-analysis.yaml                              │
│  ├── verification/unit-test-map.yaml                        │
│  └── classification.md                                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  src/**/*                      (annotations in code)        │
│  /// @requirement SW-042                                    │
│  /// @risk-control RC-007                                   │
│  fn validate_ga(ga: GestationalAge) -> Result<...>          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  tests/**/*                    (test-to-req mapping)        │
│  @requirement("SW-042")                                     │
│  def test_rejects_below_22w(): ...                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  reusable-iec62304-traceability.yml                         │
│  1. build_matrix.py   → JSON + HTML                         │
│  2. check_gaps.py     → exit 0 or fail with gap list        │
│  3. uploads matrix as workflow artifact                     │
│  4. on-PR: comments summary on the PR                       │
└─────────────────────────────────────────────────────────────┘
```

## Approach

### 1. Schemas (`policies/dhf/schemas/*.json`)

JSON Schema for each DHF YAML. Used by `build_matrix.py` to validate inputs
and by the editor (via YAML Language Server `# yaml-language-server: $schema=...`
hint at the top of each file) to give IDE autocomplete.

Key fields per `dhf.instructions.md`. Require:
- `id` pattern `SW-\d{3,}` for software requirements
- `id` pattern `HZ-\d{3,}` for hazards
- `id` pattern `RC-\d{3,}` for risk controls
- severity ∈ {negligible, minor, serious, critical, catastrophic}
- probability ∈ {frequent, probable, occasional, remote, improbable, incredible}

### 2. `build_matrix.py`

Input: `dhf/` directory.
Output:
- `dhf/releases/<version>/traceability-matrix.json` — machine-readable.
- `dhf/releases/<version>/traceability-matrix.html` — human-readable, single file with embedded CSS, sortable table (plain `<table>` + small JS).

Each row of the matrix:
```
SW-###  | title | parent SYS-### | implemented? | implemented-in | tests (list) | test-pass-rate | risk-controls | status
```

Plus a second table for hazards:
```
HZ-### | title | severity | probability | risk-level | controls (list) | controls-covered? | residual-risk
```

### 3. `check_gaps.py`

Rules (each failure prints a specific line number in the YAML + file):

- Every non-retired `SW-###` with status != `draft` must have at least one entry in `unit-test-map.yaml` listing it under `verifies:`.
- Every `SW-###` with `implemented: location: <path>` must have that path exist in the repo and the specified symbol must be annotated with the matching `@requirement` (language-dispatch: parse comments for Rust/Python/Julia/TypeScript/Go).
- Every `HZ-###` with residual severity ≥ serious must have at least one `RC-###` in `controls:` with that RC implemented (searched in code annotations).
- Every `RC-###` cited from a hazard must be cited from at least one `SW-###` in the requirements file.
- No duplicate IDs anywhere.
- No test citing a retired requirement (warn, don't fail — encourage cleanup).

Exit codes:
- 0: all checks pass
- 1: hard gap (missing test, missing RC, invalid ID)
- 2: schema/parse error (bad YAML, wrong types)

### 4. `reusable-iec62304-traceability.yml`

```yaml
on:
  workflow_call:
    inputs:
      dhf-path:
        type: string
        default: "dhf"
      fail-on-gap:
        type: boolean
        default: true
      version:
        type: string
        default: "HEAD"

permissions:
  contents: read
  pull-requests: write

jobs:
  traceability:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@<PINNED_SHA>
        with: { persist-credentials: false }
      - uses: actions/setup-python@<PINNED_SHA>
        with: { python-version: "3.12" }
      - run: pip install pyyaml jsonschema jinja2
      - name: Build traceability matrix
        run: |
          python scripts/traceability/build_matrix.py \
            --dhf ${{ inputs.dhf-path }} \
            --version ${{ inputs.version }} \
            --out dhf/releases/${{ inputs.version }}/
      - name: Check gaps
        id: gaps
        run: |
          python scripts/traceability/check_gaps.py --dhf ${{ inputs.dhf-path }}
        continue-on-error: ${{ !inputs.fail-on-gap }}
      - name: Upload matrix
        uses: actions/upload-artifact@<PINNED_SHA>
        with:
          name: traceability-matrix
          path: dhf/releases/${{ inputs.version }}/
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # compose a markdown summary from traceability-matrix.json and post as comment
          python scripts/traceability/pr_comment.py --pr ${{ github.event.pull_request.number }}
```

### 5. DHF template

Under `templates/dhf/` — what `scripts/bootstrap-dhf.sh <target-repo>` copies
into a new clinical repo. Every file is minimally populated with:
- An example SW-001 requirement with fake-but-realistic content.
- An example HZ-001 hazard with its RC-001.
- An example test-map binding SW-001 to a nonexistent test (so `check_gaps`
  fails on the template, forcing the user to replace stubs before the first
  release).
- A README explaining the layout.

### 6. `docs/compliance/dhf-guide.md`

Full user-facing guide:
- How to classify a repo (ref phase-06 task on classification wizard, when
  that lands).
- How to populate the YAML files, with an annotated example.
- Conventions for annotating code.
- How the workflow fits into CI.
- How to cut a release with DHF bound (forward ref to phase-06 release task).
- Common pitfalls: retired vs. deleted requirements, ID reuse, coverage
  vs. traceability (they're different).

## Test strategy

Fixtures under `tests/traceability/fixtures/`:
- `valid-minimal/` — 2 reqs, 1 hazard, 1 RC, all tested. Passes.
- `missing-test/` — SW-002 has no test entry. check_gaps fails at SW-002.
- `orphan-rc/` — RC-003 cited by a hazard but no requirement cites it. check_gaps fails.
- `duplicate-id/` — two SW-001 entries. check_gaps fails with line refs.
- `retired-req-tested/` — test cites a retired req. check_gaps warns (exit 0 with warning).

Run with `pytest tests/traceability/`.

## Notes for the agent

- This task touches many files; the diff will likely exceed 400 lines.
  That's acceptable here because the task is inherently cohesive — schemas,
  parser, tests, workflow, docs form one unit. However, if the diff grows
  past 1000 lines, SPLIT: into (schemas + template) as task-01 and (workflow
  + check_gaps + docs) as task-02.
- Annotation parsing is language-specific. Start with Python and Rust
  (regex over `//` and `#` comments). Julia and TypeScript can be follow-up
  tasks. Document clearly which languages are supported in the first release.
- The HTML matrix does not need to be pretty. A plain sortable table with
  good colors for pass/fail status is enough. Use a tiny vendored JS library
  like `tablesorter` or write 20 lines of vanilla JS — do not pull in
  jQuery or React.

## References

- IEC 62304:2006+A1:2015
- ISO 14971:2019
- FDA: "Content of Premarket Submissions for Device Software Functions"
  (June 2023, final guidance)
- FDA: "Cybersecurity in Medical Devices: Quality System Considerations"
  (Sept 2023)
- AAMI TIR45 — Guidance on the use of Agile practices in the development of medical device software
- NTIA: Framing Software Component Transparency (SBOM minimum elements)
