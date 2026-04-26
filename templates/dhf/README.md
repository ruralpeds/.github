# DHF Template

This directory contains the Design History File (DHF) scaffold for IEC 62304-classified repositories.

## Quick start

```bash
# Copy this template into your clinical repo
cp -r templates/dhf/ <your-repo>/dhf/

# Edit classification.md with your software's class
# Edit requirements/software-requirements.yaml — replace SW-001 stub
# Edit risk/hazard-analysis.yaml — replace HZ-001 stub
# Edit verification/unit-test-map.yaml — replace UT-001 stub

# Check traceability gaps (install pyyaml jsonschema first)
python scripts/traceability/check_gaps.py --dhf dhf
```

## Directory structure

```
dhf/
├── requirements/
│   └── software-requirements.yaml   # IEC 62304 §5.2 — SW-NNN requirements
├── risk/
│   └── hazard-analysis.yaml         # ISO 14971 — HZ-NNN hazards + RC-NNN controls
├── verification/
│   └── unit-test-map.yaml           # IEC 62304 §5.5 — UT-NNN to SW-NNN mapping
└── classification.md                # IEC 62304 class A/B/C decision record
```

## ID conventions

| Prefix | Entity | Example |
|---|---|---|
| `SW-NNN` | Software requirement | `SW-001` |
| `SYS-NNN` | System requirement (parent) | `SYS-001` |
| `HZ-NNN` | Hazard | `HZ-001` |
| `RC-NNN` | Risk control | `RC-001` |
| `UT-NNN` | Unit test | `UT-001` |

Use at least 3 digits. Never reuse an ID — retire instead of deleting.

## Schemas

YAML files reference schemas for IDE validation. Install the YAML Language Server extension
and schemas are enforced as you type:

```
$schema: ../../../policies/dhf/schemas/requirements.schema.json
```

## CI integration

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

See `docs/compliance/dhf-guide.md` for complete documentation.
