---
title: "Property Assignment Sweep Across All Repos"
phase: phase-03
slug: property-assignment-sweep
preferred-agent: copilot
preflight-confirmation: true

goal: >
  Assign 6 custom properties to every repo in ruralpeds organization.
  Properties classify repos by criticality, data handling, regulation, stack.
  Once assigned, org-level rulesets auto-enforce matching rules.

acceptance-criteria:
  - "All repos in ruralpeds org have 6 properties assigned"
  - "Properties match suggested assignments in policies/property-assignments.md"
  - "No property left unassigned (all 6 required per repo)"
  - "Properties reflect actual repo characteristics (stack, criticality, regulation)"
  - "Query via GitHub CLI returns all properties for each repo"
  - "Rulesets actively enforce (check 3-5 repos with test PRs)"

files-to-touch:
  - "policies/property-assignments.md" (update with actual assignments + notes)

files-not-to-touch:
  - "Workflows"
  - "copilot-tasks/**"

tests-required: |
  - List all repos: `gh repo list ruralpeds --json name`
  - For each repo, assign 6 properties via repo Settings → Custom properties
  - Query a repo: `gh api repos/ruralpeds/{repo} --jq '.custom_properties'`
  - Create a test PR in 3-5 repos (vary by criticality):
    - Experimental repo: should need 1 reviewer
    - Clinical repo: should need 2 reviewers + checks
    - Device repo: should need code owner + VEX
  - Verify property-based targeting works (rulesets respond to property values)

standards:
  - "ENTERPRISE_ROADMAP.md Part 2.1 — custom properties"

rollback: >
  Clear all custom property assignments from all repos.
  (Properties + rulesets remain; enforcement pauses until re-assignment.)

labels:
  - "governance"
  - "phase-03"
  - "github-platform"
  - "automation"

---

## Context

This is the **manual property assignment** task. It's the "blocking" step where you classify every repo in your org.

### Current state

- ✅ Custom properties defined (Phase 3 Task 1)
- ✅ Org-level rulesets created (Phase 3 Task 2)
- ❌ No repos have properties assigned
- ❌ Rulesets are enabled but have no targets

### What you're doing

Assigning 6 properties to each repo in ruralpeds:

```
PedNeoSim.jl:
  - data-classification: phi-active
  - criticality: clinical-decision
  - iec62304-class: class-c
  - regulated: true
  - primary-stack: julia
  - baa-required: true

mlx-media-makers:
  - data-classification: internal
  - criticality: experimental
  - iec62304-class: not-applicable
  - regulated: false
  - primary-stack: polyglot
  - baa-required: false
```

Once assigned → org-clinical ruleset auto-applies to PedNeoSim, org-baseline applies to mlx-media-makers.

## How to Assign Properties

### Via GitHub UI (slowest, but visual)

1. Open repo → Settings → Custom properties
2. Click each property
3. Select value from dropdown
4. Save

### Via GitHub CLI (faster)

```bash
# Per repo:
gh repo view ruralpeds/PedNeoSim.jl --web  # Opens UI, assign manually
# (No CLI command to set properties yet; GitHub is building this)
```

### Via GitHub GraphQL API (fastest, scriptable)

Coming in GitHub CLI 2.X. For now, use UI.

## Assignment Strategy

**Suggested order:**
1. Device/regulated repos first (highest priority)
   - PedNeoSim.jl
   - Any clinical-decision repos
2. Clinical-support repos next
   - Portal/API repos
3. Everything else
   - Content, tools, experimental

**Time estimate:** 2-3 minutes per repo × N repos

## Reference: All Known ruralpeds Repos

(From ENTERPRISE_ROADMAP.md references + standard org repos)

| Repo | Suggested Properties | Notes |
|------|---------------------|-------|
| `.github` | internal / experimental / not-applicable / false / content / false | Governance |
| `PedNeoSim.jl` | phi-active / clinical-decision / class-c / true / julia / true | Medical device simulator |
| `rust-sci-core` | internal / clinical-support / not-applicable / false / rust / false | Scientific lib |
| `BioStatistics.jl` | internal / reference / not-applicable / false / julia / false | Statistics |
| (your other repos) | ??? | Check each one |

**If unsure**, ask (Preflight confirmation = true for this task).

## Verification

After assignment:

```bash
# Check one repo
gh api repos/ruralpeds/.github --jq '.custom_properties'

# Expected output:
# {
#   "data_classification": "internal",
#   "criticality": "experimental",
#   "iec62304_class": "not-applicable",
#   "regulated": false,
#   "primary_stack": "content",
#   "baa_required": false
# }
```

Test rulesets with a PR:
1. Create test branch in a clinical repo
2. Push unsigned commit
3. Expect: "Commit signatures required" error ✅
4. Force-push same branch → main
5. Expect: "Force-push not allowed" ✅

## Common Mistakes

❌ **Don't:**
- Skip a property (all 6 required)
- Assign `regulated: true` speculatively (only if FDA path is active)
- Mix up `phi-capable` (infrastructure) vs `phi-active` (processes real ePHI)

✅ **Do:**
- Err on the side of stricter classification
- Use `experimental` for prototypes
- Update properties as repos evolve

## FAQ

**Q: How do I find all repos in the org?**
```bash
gh repo list ruralpeds --json name --limit 1000
```

**Q: Can I bulk-assign properties?**
Not yet in GitHub CLI. Manual UI or GraphQL API (not documented yet).

**Q: What if I assigned properties wrong?**
Reassign them. Rulesets re-evaluate immediately.

**Q: When does this task end?**
When every repo has all 6 properties assigned.

## References

- [Policies/property-assignments.md](../property-assignments.md) — repo-by-repo guide
- [GitHub Custom Properties Docs](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-your-organization)
