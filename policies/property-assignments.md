# Repository Property Assignments

**Phase 3 Deliverable**: Manual property sweep & assignment  
**Last Updated**: 2026-04-24  
**Purpose**: Assign custom properties to all repos in ruralpeds org

---

## How Properties Work

Each repo in the `ruralpeds` org gets 6 custom properties:

| Property | Type | Options | Purpose |
|----------|------|---------|---------|
| `data-classification` | select | public, internal, synthetic, phi-capable, phi-active | ePHI/PII sensitivity |
| `criticality` | select | experimental, reference, clinical-support, clinical-decision, device | Business criticality |
| `iec62304-class` | select | not-applicable, class-a, class-b, class-c | Medical device safety class |
| `regulated` | true/false | true, false | Is it FDA-regulated? |
| `primary-stack` | select | julia, rust, node, python, go, content, polyglot | Tech stack |
| `baa-required` | true/false | true, false | Needs HIPAA BAA? |

These trigger organization-level rulesets:
- **org-baseline** — all repos
- **org-clinical** — where criticality ≥ clinical-support
- **org-device** — where iec62304-class ∈ {B, C} OR regulated = true
- **org-phi-active** — where data-classification = phi-active

---

## Known Repos & Suggested Properties

### Proposed ruralpeds Repositories

**Note**: This list is based on `ENTERPRISE_ROADMAP.md` references and publicly-available repo names. Adjust as needed.

#### Clinical/Medical Device Software

| Repo | data-class | criticality | iec62304 | regulated | stack | baa | rationale |
|------|------------|-------------|----------|-----------|-------|-----|-----------|
| `PedNeoSim.jl` | synthetic | clinical-decision | class-c | true | julia | true | Neonatal simulator; class-C device (ventilator control); FDA path |
| `CDS-peds-{xxx}` | phi-capable | clinical-decision | class-b | true | polyglot | true | Clinical decision support; class-B (non-serious injury) |
| `rust-sci-core` | internal | clinical-support | not-applicable | false | rust | false | Scientific library; not directly regulated; educational use |
| `BioStatistics.jl` | internal | reference | not-applicable | false | julia | false | Statistics library; educational/reference |

#### Web/API Services

| Repo | data-class | criticality | iec62304 | regulated | stack | baa | rationale |
|------|------------|-------------|----------|-----------|-------|-----|-----------|
| `fhir-gateway` (hypothetical) | phi-capable | clinical-support | not-applicable | false | node/rust | true | FHIR API gateway; BAA-covered but not device |
| `patient-portal` (hypothetical) | phi-capable | clinical-support | not-applicable | false | node | true | Patient-facing UI; BAA-covered |
| `audit-dashboard` (hypothetical) | internal | clinical-support | not-applicable | false | node | false | Audit log visualization; internal only |

#### Educational/Content

| Repo | data-class | criticality | iec62304 | regulated | stack | baa | rationale |
|------|------------|-------------|----------|-----------|-------|-----|-----------|
| `Pediatrics-textbook` (hypothetical) | public | reference | not-applicable | false | content | false | Educational material; public |
| `Clinical-protocols` (hypothetical) | internal | clinical-support | not-applicable | false | content | false | Internal protocols; not FDA-regulated |

#### Tools/Infrastructure

| Repo | data-class | criticality | iec62304 | regulated | stack | baa | rationale |
|------|------------|-------------|----------|-----------|-------|-----|-----------|
| `.github` (this repo) | internal | reference | not-applicable | false | content | false | Org governance; non-clinical |
| `mlx-media-makers` | internal | experimental | not-applicable | false | polyglot | false | Media tools; non-clinical |
| `character-architect` | internal | experimental | not-applicable | false | node | false | UI tool; non-clinical |

---

## Assignment Instructions

### For Repos You Own (Timothy Hartzog)

1. **Navigate to each repo's settings**
   - Repo → Settings → Custom properties (near the bottom)

2. **Assign 6 properties** for each repo using the table above

3. **Double-check**:
   - ✅ All 6 properties assigned
   - ✅ `primary-stack` matches actual codebase
   - ✅ `regulated` = true only if pursuing FDA clearance
   - ✅ `iec62304-class` matches device safety class (or not-applicable)
   - ✅ `baa-required` = true only if HIPAA BAA needed

### Example: PedNeoSim.jl

```
data-classification: phi-active
  (reason: neonatal simulator; may be used with real patient data in training)

criticality: clinical-decision
  (reason: simulator output influences clinical decision-making)

iec62304-class: class-c
  (reason: neonatal ventilator control; death/serious injury possible)

regulated: true
  (reason: pursuing FDA SaMD clearance)

primary-stack: julia
  (reason: primary language is Julia)

baa-required: true
  (reason: may process synthetic ePHI in training scenarios)
```

---

## Rulesets Enforcement

Once properties are assigned, rulesets auto-enforce:

### org-baseline (All repos)
- ✅ Signed commits required
- ✅ ≥1 reviewer (self-review after 24h allowed for solo-dev)
- ✅ No force-push to main
- ✅ Status check: lint

### org-clinical (If criticality ∈ {clinical-support, clinical-decision, device})
- ✅ 2 reviewers required
- ✅ PHI scan passing
- ✅ SBOM, CodeQL, Scorecard passing
- ✅ Resolved review threads

### org-device (If iec62304-class ∈ {B, C} OR regulated = true)
- ✅ 2 reviewers + code owner approval
- ✅ Last-push approval required
- ✅ IEC 62304 traceability check passing
- ✅ VEX document required on release
- ✅ Linear history (no force-push)

### org-phi-active (If data-classification = phi-active)
- ✅ 2 reviewers + code owner
- ✅ PHI scan mandatory
- ✅ Audit log integrity check
- ✅ Environment protection for prod deployments

---

## Common Mistakes to Avoid

❌ **Don't do:**
- Set `regulated: true` for all clinical repos (only if FDA clearance path is active)
- Set `iec62304-class: class-b` without actual device integration
- Set `phi-active` for repos that only handle synthetic data (use `phi-capable` instead)
- Skip any property (all 6 are required)

✅ **Do:**
- Be conservative: if unsure, ask
- Use `phi-capable` for infrastructure that *could* handle ePHI but doesn't today
- Use `class-a` for non-critical, informational-only device software
- Update properties as repo criticality changes

---

## Timeline

| Week | Task |
|------|------|
| **Week 5 (Phase 3 start)** | Properties defined in org settings + rulesets created |
| **Week 5–6** | Manual property sweep (assign properties to all repos) |
| **Week 6 (Phase 3 end)** | Rulesets active + all repos compliant |

---

## Verification

After assignment, verify:

```bash
# Check a repo's properties via GitHub CLI
gh api repos/ruralpeds/PedNeoSim.jl --jq '.custom_properties'

# Should return:
# {
#   "data_classification": "phi-active",
#   "criticality": "clinical-decision",
#   "iec62304_class": "class-c",
#   "regulated": "true",
#   "primary_stack": "julia",
#   "baa_required": "true"
# }
```

---

## FAQ

**Q: What if a repo doesn't fit the categories?**  
A: Err on the side of *stricter* properties. Better to have unnecessary checks than to miss a critical repo.

**Q: Can I change properties later?**  
A: Yes. Rulesets re-evaluate on every PR. Changing properties immediately changes ruleset enforcement.

**Q: What if a repo fails a ruleset check?**  
A: You can't merge until the check passes (e.g., 2 reviewers). Rulesets are blocking.

**Q: Who can assign properties?**  
A: Org owners + repo admins. In ruralpeds, that's you (Timothy Hartzog).

---

## References

- [GitHub Custom Properties](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-your-organization)
- [GitHub Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Property-Based Ruleset Targeting](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository#using-properties-to-target-rulesets)
