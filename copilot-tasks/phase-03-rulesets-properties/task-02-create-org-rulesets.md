---
title: "Create Organization-Level Rulesets (Property-Based Targeting)"
phase: phase-03
slug: create-org-rulesets
preferred-agent: copilot
preflight-confirmation: false

goal: >
  Create 4 organization-level rulesets in GitHub that auto-enforce governance
  rules based on custom properties. Rulesets are property-aware and scale to
  all repos without manual configuration per repo.

acceptance-criteria:
  - "org-baseline ruleset created and active (all repos)"
  - "org-clinical ruleset created and active (criticality ≥ clinical-support)"
  - "org-device ruleset created and active (iec62304-class ∈ {B,C} OR regulated=true)"
  - "org-phi-active ruleset created and active (data-classification=phi-active)"
  - "All rulesets use property-based targeting (not hardcoded repo lists)"
  - "Rulesets enforce: signed commits, required reviewers, status checks, linear history"
  - "No manual per-repo rulesets needed (org-level only)"
  - "Enforcement level: 'Active' (blocking)"

files-to-touch:
  - "policies/rulesets/org-baseline.json"
  - "policies/rulesets/org-clinical.json"
  - "policies/rulesets/org-device.json"
  - "policies/rulesets/org-phi-active.json"

files-not-to-touch:
  - "Workflows"
  - "copilot-tasks/**"

tests-required: |
  - Navigate to Org Settings → Repository → Rulesets
  - Verify all 4 rulesets created and in "Active" state
  - Check org-baseline: applies to all repos (no property filter)
  - Check org-clinical: targets criticality=clinical-support/clinical-decision/device
  - Check org-device: targets iec62304-class=class-b OR class-c OR regulated=true
  - Check org-phi-active: targets data-classification=phi-active
  - Create a test PR in a repo with property assignment; verify ruleset enforces
  - Verify: unsigned commit is rejected, need 2 reviewers for clinical, etc.

standards:
  - "GitHub Platform — organization-level rulesets"
  - "ENTERPRISE_ROADMAP.md Part 2.2 — org-level rulesets with property targeting"

rollback: >
  Delete all 4 org rulesets from GitHub UI.
  Existing repo-level rulesets continue to work.
  No data loss.

labels:
  - "governance"
  - "phase-03"
  - "github-platform"
  - "automation"

---

## Context

**Organization rulesets** let you define rules once at the org level that auto-apply to matching repos.

**Property-based targeting** means:
- Don't hardcode repo lists ("apply to PedNeoSim AND CDS-peds-xyz")
- Instead: "apply where criticality ≥ clinical-decision"
- When you add a new device repo and set its property, ruleset auto-applies

### Current state

- ✅ Phase 1: Individual repos may have repo-level rulesets
- ❌ No org-level governance
- ❌ Rules don't scale (adding a new clinical repo = manual work)

### What we're building

**4 org-level rulesets:**

| Ruleset | Target | Rules |
|---------|--------|-------|
| **org-baseline** | All repos | Signed commits, 1 reviewer, no force-push |
| **org-clinical** | criticality ≥ clinical-support | 2 reviewers, PHI + SBOM + CodeQL checks, linear history |
| **org-device** | iec62304-class ∈ {B, C} OR regulated=true | 2 reviewers + code owner, IEC 62304 + VEX checks |
| **org-phi-active** | data-classification = phi-active | HIPAA-specific: PHI scan, audit log check, env protection |

### Ruleset Enforcement Hierarchy

```
org-baseline (lightest)
      ↓
org-clinical (medium — adds 2 reviewers, more checks)
      ↓
org-device (strict — code owner, IEC 62304, VEX)
      ↓
org-phi-active (HIPAA-focused — audit log, env protection)
```

If a repo matches multiple rulesets (e.g., criticality=clinical-decision AND data-classification=phi-active):
→ All matching rulesets apply (union of rules)

## Rulesets Specification

### org-baseline
**Target**: All repos (no property filter)
**Rules**:
- Signed commits required (SSH or GPG)
- ≥1 approving review
- No force-push to default branch
- Status check: lint

### org-clinical
**Target**: `criticality` ∈ {clinical-support, clinical-decision, device}
**Rules**:
- All org-baseline rules +
- ≥2 approving reviews
- Required status checks: ci, PHI scan, SBOM, CodeQL, Scorecard
- Linear history (no fast-forward reverts)

### org-device
**Target**: `iec62304-class` ∈ {class-b, class-c} OR `regulated` = true
**Rules**:
- All org-clinical rules +
- Code owner approval required
- Last-push approval (re-approve after new commits)
- Required status checks: IEC 62304 traceability, VEX
- Non-dismissible review (stale reviews don't auto-dismiss)

### org-phi-active
**Target**: `data-classification` = phi-active
**Rules**:
- ≥2 approving reviews (incl. code owner)
- Required status checks: PHI scan, audit log integrity
- Environment protection for prod deployments (manual approval)
- No stale review dismissal

## How to Create (GitHub UI)

1. Org Settings → Repository → Rulesets
2. Click "New organization ruleset"
3. Fill in:
   - Name: `org-baseline` (etc.)
   - Target: `Branches` (default)
   - Enforcement: `Active` (blocking)
   - Conditions: Properties (if applicable)
4. Add rules:
   - Required signatures (SSH + GPG)
   - Require pull request before merging
   - Required status checks
   - Non-fast-forward
   - etc.
5. Save

(Or use GitHub API/GraphQL to create from `policies/rulesets/*.json`)

## Verification Checklist

- [ ] All 4 rulesets visible in org settings, enforcement=Active
- [ ] org-baseline shows "(applied to all repositories)"
- [ ] org-clinical shows property targeting: criticality
- [ ] org-device shows property targeting: iec62304-class, regulated
- [ ] org-phi-active shows property targeting: data-classification
- [ ] Create test PR in a clinical repo:
  - Unsigned commit rejected? ✅
  - Only 1 reviewer not enough? ✅
  - All checks pass before merge? ✅

## References

- [GitHub Rulesets Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Property-Based Ruleset Targeting](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository#using-properties-to-target-rulesets)
- [Policies/rulesets/](../policies/rulesets/) — ruleset JSON definitions

## Phase 3 Follow-Up

After rulesets created → Task 03: Property assignment sweep
