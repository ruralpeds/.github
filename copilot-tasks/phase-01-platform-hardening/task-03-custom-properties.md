---
title: "Define org custom repository properties"
phase: phase-01
slug: custom-properties
preferred-agent: copilot
preflight-confirmation: false
estimated-complexity: s

goal: >
  Define six org-level custom repository properties and a workflow that
  enforces their presence on every repo. Without these, the rulesets
  in phase 3 have no way to target "only clinical repos" or "only phi-active".

acceptance-criteria:
  - "`policies/custom-properties/schema.yaml` defines the six properties with types, values, defaults"
  - "`.github/workflows/custom-properties-audit.yml` runs weekly, lists repos missing required properties, opens/updates a tracking issue"
  - "`docs/governance/custom-properties.md` documents each property, when to change it, who approves"
  - "README.md for `.github` repo includes a link to the properties doc"
  - "A helper script `scripts/set-properties.py <repo>` interactively sets properties using gh api"

files-to-touch:
  - "policies/custom-properties/schema.yaml"
  - ".github/workflows/custom-properties-audit.yml"
  - "docs/governance/custom-properties.md"
  - "scripts/set-properties.py"
  - "README.md"

files-not-to-touch:
  - "AGENTS.md"
  - "audit-log/**"
  - ".github/workflows/audit-log.yml"

tests-required: |
  - `actionlint .github/workflows/custom-properties-audit.yml` passes.
  - `python -c "import yaml; yaml.safe_load(open('policies/custom-properties/schema.yaml'))"` passes.
  - Dry-run the helper script against a test repo: `python scripts/set-properties.py --dry-run ruralpeds/.github`.

standards:
  - "NIST SSDF PO.1 — risk-based software security requirements"
  - "HITRUST 01.a — access control policy (classification precondition)"

rollback: >
  Delete the six properties from org settings (they don't affect existing
  workflows since no ruleset targets them yet).

labels:
  - "governance"

---

## Context

Custom repository properties are org-level metadata tags that every workflow,
ruleset, and script can read via `gh api repos/{owner}/{repo}/properties/values`.
They are the **routing layer** for every subsequent governance decision:

- Phase 3 rulesets target on `iec62304-class` and `data-classification`.
- Phase 4 audit depth varies by `criticality`.
- Phase 6 DHF scaffolding is gated on `iec62304-class != not-applicable`.
- Phase 8 HA patterns are required where `criticality ≥ clinical-decision`.

So this task is the keystone: nothing later works until this lands.

The six properties and their values:

```yaml
data-classification:
  values: [public, internal, synthetic, phi-capable, phi-active]
criticality:
  values: [experimental, reference, clinical-support, clinical-decision, device]
iec62304-class:
  values: [not-applicable, class-a, class-b, class-c]
regulated:
  values: [true, false]
primary-stack:
  values: [julia, rust, node, python, go, content, polyglot]
baa-required:
  values: [true, false]
```

## Approach

1. **Write `policies/custom-properties/schema.yaml`** — single source of truth
   for the property catalog.

2. **Write `.github/workflows/custom-properties-audit.yml`** — runs weekly on
   Mondays at 09:00 UTC:
   - Lists all repos via `gh api orgs/ruralpeds/repos --paginate`.
   - For each, fetches `gh api repos/ruralpeds/<name>/properties/values`.
   - Flags repos missing any required property.
   - Produces `reports/custom-properties-<date>.md`.
   - Opens or updates a tracking issue titled
     "Custom properties audit — YYYY-WW".

3. **Write `scripts/set-properties.py`** — interactive wizard:
   - Loads schema.
   - Prompts for each property (shows current value if set).
   - Calls `gh api --method PATCH repos/<repo>/properties/values -f ...`.
   - Writes an audit record to `audit-log/property-changes.jsonl`
     (since this IS authorized modification to `audit-log/`, the task's
     `authorizes:` frontmatter must include that path — but actually no,
     the script is *used by humans*, and the audit-log workflow handles
     the write. The script only proposes; it does not write the ledger.)

4. **Document** — `docs/governance/custom-properties.md` covers:
   - What each property means.
   - How to change it (via the script or the UI).
   - What happens downstream when each value changes (e.g., changing
     `iec62304-class` from `class-a` to `class-b` triggers new ruleset
     enforcement on the next `sync-rulesets.yml` run).
   - Who can change what (most are self-serve; `iec62304-class` and
     `regulated=true` require clinical-lead approval).

## Verification

After merge:

- Run the audit workflow manually: `gh workflow run custom-properties-audit.yml`.
- Confirm the tracking issue opens with the current gap list.
- Use the helper to set properties on a test repo (e.g., this one):

  ```bash
  python scripts/set-properties.py ruralpeds/.github
  ```

  Then:

  ```bash
  gh api repos/ruralpeds/.github/properties/values | jq
  ```

  must show all six properties set.

## Notes for the agent

- The `gh api --method PATCH .../properties/values` endpoint expects a body
  with a `properties` array of `{property_name, value}`. Double-check the
  API shape before generating the script.
- Org-level custom property definitions are created via the GitHub UI; the
  API creates the definitions too but requires admin permission. Document
  in the markdown doc that the one-time schema creation is a human action
  requiring org-owner.

## References

- GitHub docs: Managing custom properties for repositories
- GitHub API: Repository custom properties
