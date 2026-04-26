# Design History File (DHF) Guide

This guide explains how to populate and maintain the DHF YAML files that feed the IEC 62304 traceability workflow.

---

## When do I need a DHF?

Any repository whose `iec62304-class` custom property is set to `class-a`, `class-b`, or `class-c` must maintain a DHF. See `docs/governance/custom-properties.md` for how to set this property and who can approve the change.

| Class | Risk | DHF scope |
|---|---|---|
| A | No injury possible | Traceability optional but encouraged |
| B | Non-serious injury possible | Full traceability required |
| C | Death or serious injury possible | Full traceability + additional risk controls |

---

## Quick start (new clinical repo)

```bash
# 1. Copy the DHF template into your repo
cp -r templates/dhf/ dhf/

# 2. Set the IEC 62304 class in classification.md
$EDITOR dhf/classification.md

# 3. Replace the stub requirements (SW-001) with real ones
$EDITOR dhf/requirements/software-requirements.yaml

# 4. Replace the stub hazard (HZ-001) with real hazards
$EDITOR dhf/risk/hazard-analysis.yaml

# 5. Map tests to requirements
$EDITOR dhf/verification/unit-test-map.yaml

# 6. Check for gaps (install pyyaml and jsonschema first)
python scripts/traceability/check_gaps.py --dhf dhf

# 7. Add to your CI workflow
```

Add to `.github/workflows/ci.yml`:

```yaml
traceability:
  uses: ruralpeds/.github/.github/workflows/reusable-iec62304-traceability.yml@main
  with:
    dhf-path: dhf
    fail-on-gap: true
  permissions:
    contents: read
    pull-requests: write
```

---

## DHF file structure

```
dhf/
├── classification.md                          # IEC 62304 class A/B/C decision record
├── requirements/
│   └── software-requirements.yaml            # SW-NNN requirements
├── risk/
│   └── hazard-analysis.yaml                  # HZ-NNN hazards + RC-NNN controls
└── verification/
    └── unit-test-map.yaml                     # UT-NNN tests → SW-NNN mapping
```

Multiple YAML files are supported in each directory. The traceability scripts merge them all.

---

## ID conventions

| Prefix | Entity | Pattern | Example |
|---|---|---|---|
| `SW-NNN` | Software requirement | `SW-\d{3,}` | `SW-001` |
| `SYS-NNN` | System requirement (parent) | `SYS-\d{3,}` | `SYS-001` |
| `HZ-NNN` | Hazard | `HZ-\d{3,}` | `HZ-001` |
| `RC-NNN` | Risk control | `RC-\d{3,}` | `RC-001` |
| `UT-NNN` | Unit test | `UT-\d{3,}` | `UT-001` |

**Rules:**
- Never delete an ID — mark it `status: retired` instead
- IDs must be unique across all files in the repo
- Use at least 3 digits; pad with leading zeros

---

## Writing good requirements (SW-NNN)

Good requirements are:
- **Verifiable** — you can write a test that definitively passes or fails
- **Atomic** — one requirement, one behavior
- **Implementation-independent** — describes WHAT, not HOW

```yaml
# Good:
- id: SW-001
  title: "System shall reject gestational age below 22 weeks"
  status: active
  risk_controls: [RC-001]

# Bad (not verifiable, too vague):
- id: SW-001
  title: "System should handle invalid inputs properly"
```

### Requirement statuses

| Status | Meaning |
|---|---|
| `draft` | Under authoring; not yet active; not required to be tested |
| `active` | Approved and in scope; must have at least one test |
| `retired` | No longer applies; must NOT be deleted |

---

## Risk analysis (HZ-NNN, RC-NNN)

Each hazard entry has:

1. **Initial risk** — severity × probability before any controls
2. **Risk controls** (RC-NNN) — measures that reduce risk
3. **Residual risk** — severity × probability after controls

```yaml
hazards:
  - id: HZ-001
    title: "Incorrect GA used in clinical calculation"
    severity: serious        # initial severity
    probability: occasional  # initial probability
    risk_level: alarp        # initial risk level
    controls:
      - id: RC-001
        title: "Input validation rejects GA < 22w"
        type: protective-measure  # inherent-safety | protective-measure | information-for-safety
    severity_residual: negligible
    probability_residual: incredible
    risk_level_residual: acceptable
```

**Traceability rule**: every `RC-NNN` cited in `hazard-analysis.yaml` must also appear in `software-requirements.yaml` under `risk_controls:` for at least one requirement. This ensures every risk control is implemented by testable code.

---

## Mapping tests to requirements (UT-NNN)

```yaml
tests:
  - id: UT-001
    title: "Test GA validation rejects below 22 weeks"
    file: "tests/test_validation.py"  # relative path
    symbol: "test_rejects_below_22w"  # test function name
    verifies:
      - SW-001
    status: active
```

A single test may verify multiple requirements. A single requirement may be verified by multiple tests.

---

## Common pitfalls

**Retired vs. deleted requirements**
Never delete `SW-NNN` entries. Mark them `status: retired`. The traceability script warns if an active test cites a retired requirement.

**ID reuse**
Never reuse a retired ID for a new requirement. The ID space is permanent.

**Coverage vs. traceability**
Code coverage (lines/branches executed) is not the same as traceability (requirements verified). A requirement may have 100% code coverage but no explicit test-to-requirement mapping. Both are required.

**Draft requirements**
Draft requirements are NOT required to have tests. Set `status: active` only when the requirement is approved and the corresponding test exists or is planned for the sprint.

**Orphan risk controls**
Every RC-NNN must be referenced by at least one SW-NNN. If a risk control is implemented but not tied to a requirement, add a requirement that captures the behavior and cites the RC.

---

## Running the traceability tools locally

```bash
# Install dependencies
pip install pyyaml jsonschema

# Check for gaps (exits non-zero if any gap found)
python scripts/traceability/check_gaps.py --dhf dhf

# Build the HTML + JSON traceability matrix
python scripts/traceability/build_matrix.py \
  --dhf dhf \
  --version HEAD \
  --out /tmp/matrix/
open /tmp/matrix/traceability-matrix.html
```

---

## How the CI workflow fits in

```
PR opened
    │
    ▼
reusable-iec62304-traceability.yml
    │
    ├── build_matrix.py → traceability-matrix.json + .html  (uploaded as artifact)
    │
    ├── check_gaps.py   → exits 0 (pass) or 1 (gaps)
    │       │
    │       └── if fail-on-gap=true: blocks PR merge
    │
    └── PR comment posted with gap count and report
```

The matrix artifact is retained 90 days and is attached to every PR and release run for audit purposes.

---

## Cutting a release with DHF bound

1. Ensure `check_gaps.py` exits 0 on the release branch.
2. The `reusable-release.yml` workflow generates and attaches the traceability matrix to the GitHub Release.
3. For class-b/c, the matrix artifact is also included in the validation export (`reusable-validation-export.yml`).
4. After release, commit the generated `dhf/releases/<version>/` directory to the DHF history.

---

## Phase dependencies

| Phase | DHF requirement |
|---|---|
| Phase 3 — Rulesets | `iec62304-class` must be set |
| Phase 6 — DHF scaffold | DHF files must exist and pass `check_gaps.py` |
| Phase 8 — HA patterns | Class ≥ `clinical-decision` or class-b/c |
