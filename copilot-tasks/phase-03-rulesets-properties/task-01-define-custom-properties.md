---
title: "Define & Enable Custom Repository Properties"
phase: phase-03
slug: define-custom-properties
preferred-agent: copilot
preflight-confirmation: false

goal: >
  Create and enable custom repository properties in GitHub org settings.
  Define 6 properties: data-classification, criticality, iec62304-class, 
  regulated, primary-stack, baa-required.
  These properties will drive property-based rulesets in Phase 3.

acceptance-criteria:
  - "All 6 custom properties defined in ruralpeds org settings"
  - "Each property has correct type (single_select or true_false)"
  - "All allowed values documented in org settings"
  - "Property definitions match policies/custom-properties.json exactly"
  - "Properties visible in repo settings for every repo"
  - "Org settings shows all properties with descriptions"
  - "GitHub CLI can query properties: `gh api repos/ruralpeds/{repo} --jq '.custom_properties'`"

files-to-touch:
  - "policies/custom-properties.json" (reference only; not a GitHub file)
  - "policies/property-assignments.md"

files-not-to-touch:
  - "Workflows"
  - "copilot-tasks/**"
  - "docs/**"

tests-required: |
  - Navigate to Organization Settings → Repository → Custom properties
  - Verify all 6 properties created with correct types
  - Verify allowed values match spec
  - Check 1-2 repos: repo settings show custom properties section
  - Test via GitHub CLI: gh api repos/ruralpeds/.github --jq '.custom_properties'
  - Test property query: filter repos by primary-stack value

standards:
  - "GitHub Platform best practices — custom properties for governance"
  - "ENTERPRISE_ROADMAP.md Part 2.1 — custom repository properties"

rollback: >
  Delete all 6 custom properties from org settings.
  (Rulesets created in Phase 3 will fail to evaluate, but won't block merges.)

labels:
  - "governance"
  - "phase-03"
  - "github-platform"
  - "automation"

---

## Context

Custom properties let you **classify** repos at the organization level. Once defined, they:
1. Show up in every repo's settings (team can assign values)
2. Drive org-level rulesets (Phase 3) — e.g., "2 reviewers if criticality ≥ clinical-decision"
3. Enable metrics — "How many Class-C device repos do we have?"

### Current state

- ❌ No custom properties defined
- ❌ All repos treated equally (same ruleset applied to PedNeoSim and a toy project)
- ❌ No programmatic way to ask "which repos handle ePHI?"

### What we're building

**6 custom properties** (org-level configuration):

1. **data-classification** (single-select)
   - public, internal, synthetic, phi-capable, phi-active
   - Drives: HIPAA audit controls, encryption requirements, BAA

2. **criticality** (single-select)
   - experimental, reference, clinical-support, clinical-decision, device
   - Drives: review requirements, testing depth, deployment controls

3. **iec62304-class** (single-select)
   - not-applicable, class-a, class-b, class-c
   - Drives: traceability matrix, mutation testing, VEX requirements

4. **regulated** (true/false)
   - Is FDA clearance being pursued?
   - Drives: VEX attestation, SBOM attachment, release sign-off

5. **primary-stack** (single-select)
   - julia, rust, node, python, go, content, polyglot
   - Drives: which CI workflow to use (ci-julia.yml, ci-rust.yml, etc.)

6. **baa-required** (true/false)
   - Does service/repo require HIPAA Business Associate Agreement?
   - Drives: BAA compliance checklist in PRs

## How to Apply

**Steps in GitHub UI:**

1. Org Settings → Repository → Custom properties
2. Click "New property" for each of the 6
3. Fill in:
   - Name (exactly as in spec)
   - Description (human-readable)
   - Type (single_select or true_false)
   - Default value (if any)
   - Allowed values (for single_select)
4. Save each

**Automation path (future):**
Could use GitHub GraphQL API to automate, but manual UI is fine for Phase 3.

## Verification Checklist

- [ ] Org settings shows all 6 properties
- [ ] Types match spec (4 single_select, 2 true_false)
- [ ] Open a repo, go to Settings → Custom properties, verify section exists
- [ ] Try `gh api repos/ruralpeds/.github --jq '.custom_properties'` (empty until Phase 3 assignment)
- [ ] Document properties in org wiki or docs (optional)

## References

- [GitHub Custom Properties Docs](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-your-organization)
- [Policies/custom-properties.json](../policies/custom-properties.json) — full spec
- [ENTERPRISE_ROADMAP.md Part 2.1](../../ENTERPRISE_ROADMAP.md) — why these properties

## Phase 3 Follow-Up

After properties are defined → Task 02: Create org-level rulesets
