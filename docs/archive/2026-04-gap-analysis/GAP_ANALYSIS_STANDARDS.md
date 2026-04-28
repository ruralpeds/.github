# Gap Analysis Standards for ruralpeds Organization

> **Last Updated**: 2026-04-23
> **Governance Level**: Mandatory for all active repos
> **Compliance**: Audited weekly via GitHub Actions
> **Owner**: Timothy Hartzog (@timothyhartzog)

## What This Is

A **living document system** for tracking feature gaps, architectural debt, and roadmap items across all ~110 ruralpeds repositories. Every gap is version-controlled, linked to code, and updates are auditable via git commit history.

**Key principle**: Single source of truth, distributed storage, standardized format, interface-agnostic access.

## Why This Matters

- **Single source of truth**: No scattered Notion docs, Asana boards, or personal notes. Truth lives in git.
- **Audit trail**: Every gap creation, status change, and completion is committed and auditable. Compliance-ready.
- **Cross-repo visibility**: One command shows all P0 gaps across the org.
- **Interface-agnostic**: Works in Claude Desktop, Claude CLI, GitHub web UI, iOS (via git clients + shortcuts).
- **Integrated with compliance**: Auto-scanned weekly. Repos missing `.gap-analysis/` appear in compliance reports.
- **Offline-friendly**: No external database. Works in rural settings, unstable networks, air-gapped environments.

## File Structure (All Repos)

```
repo-root/
├── .gap-analysis/
│   ├── GAP_ANALYSIS.md           (the living document — version-controlled)
│   ├── schema.md                 (rules for this specific repo)
│   ├── status.json               (auto-generated index — DO NOT COMMIT)
│   └── .gitignore                (ignore status.json)
```

**That's it.** Minimal, consistent, auditable.

## Status Values (Mandatory)

```
Not Started    → Work hasn't begun
Backlog        → Planned but not yet started  
In Progress    → Actively being worked on
Blocked        → Waiting for something external (document what in "Blocked By" field)
In Review      → PR is open, awaiting merge to main
Completed      → Merged to main; move to "Completed Gaps" section
Archived       → Decided not to do (explain why in completion notes)
```

**All gaps must be in one of these 7 states.** No freestyle statuses.

## Priority Levels

```
P0 (Blocker)   → Blocks releases; core functionality; security/compliance critical
P1 (Critical)  → High impact; planned for next roadmap period (1–3 months)
P2 (High)      → Important; scheduled but not immediately urgent
P3 (Medium)    → Nice to have; lower priority
P4 (Low)       → Exploratory; maintenance; can defer indefinitely
```

**Priority should justify target completion date.** P0 gaps without a date within 30 days need review.

## Field Reference

### Required Fields (All Gaps)

```markdown
### GAP-NNN: [Feature name]
**Status**: [One of: Not Started, Backlog, In Progress, Blocked, In Review, Completed, Archived]
**Priority**: [P0–P4]
**Owner**: [Name, email, or "[Unassigned]"]
**Target Completion**: [YYYY-MM-DD, or "TBD" if in Backlog]

**Description**:
[What needs to be built? Why? What problem does it solve?]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Related PRs**: [#123, #124, or "None"]
**Blocking Issues**: [#456, or "None"]
**Blocked By**: [GAP-002, or external constraint; or "None"]

**Last Status Update**: [YYYY-MM-DD]
- [Brief update on progress; what changed since last update?]
```

### For Completed Gaps

```markdown
### ✅ GAP-NNN: [Feature name]
**Status**: Completed
**Completed Date**: [YYYY-MM-DD]
**PR**: [#123]
**Completion Notes**: [Why was this approach chosen? Any follow-ups?]
```

## Quick Start (15 minutes)

### 1. Get the template
```bash
cp -r ../.github/templates/gap-analysis .gap-analysis
```

### 2. Populate your gaps
Edit `.gap-analysis/GAP_ANALYSIS.md`:
- List everything you plan to build (next 3–6 months)
- Be specific: "Implement cardiometabolic risk calculator" not "Improve performance"
- Add acceptance criteria (checkboxes)
- Set owners and target dates for P0/P1 gaps

### 3. Commit and push
```bash
git add .gap-analysis
git commit -m "docs: add gap analysis tracking (org standard)"
git push origin main
```

### 4. GitHub Actions validates automatically
See `.github/workflows/gap-analysis-validate.yml` — it runs on every `.gap-analysis/` change.

## Workflow: From Gap to PR to Completion

### Phase 1: Gap Creation
```bash
# You (or Timothy) populate .gap-analysis/GAP_ANALYSIS.md with your backlog
# Commit, push — Actions validates syntax
git add .gap-analysis/GAP_ANALYSIS.md
git commit -m "docs: add GAP-001 cardiometabolic risk calculator"
git push
```

### Phase 2: Development
```bash
# Developer sees the gap
cat .gap-analysis/GAP_ANALYSIS.md | grep -A 20 "^### GAP-001"

# Create feature branch
git checkout -b feat/gap-001-cardiometabolic-risk

# Implement, commit
git commit -m "feat: implement Framingham risk calculator (closes GAP-001)"
git push origin feat/gap-001-cardiometabolic-risk
```

### Phase 3: PR Review
**Before opening PR:** Update `.gap-analysis/GAP_ANALYSIS.md` status:
```markdown
### GAP-001: sci-clinical cardiometabolic risk stratification
**Status**: In Review    # Changed from "In Progress"
**Related PRs**: #42
```

Commit this status change in the PR itself (or separate commit on main).

### Phase 4: Merge
```bash
# PR merges to main
# GitHub Actions (gap-analysis-sync-index.yml) auto-generates status.json
# status.json is NOT committed (it's in .gitignore)
```

### Phase 5: Mark Complete
Same day or next day, update `.gap-analysis/GAP_ANALYSIS.md`:
```markdown
# Move GAP-001 from "Active Gaps" to "Completed Gaps (Last 90 Days)"

## Completed Gaps (Last 90 Days)

### ✅ GAP-001: sci-clinical cardiometabolic risk stratification
**Status**: Completed
**Completed Date**: 2026-05-12
**PR**: #42
**Completion Notes**: Implemented Framingham and ACC/AHA pooled cohort equations. Validated against published test sets; added 18 unit tests covering edge cases.
```

Commit: `git commit -m "docs: mark GAP-001 as completed"`

## Automation: What GitHub Actions Do

| Workflow | Trigger | What It Does | Output |
|----------|---------|-------------|--------|
| **gap-analysis-validate.yml** | Push/PR to `.gap-analysis/GAP_ANALYSIS.md` | Validates markdown syntax, status enums, gap ID uniqueness | ✅/❌ on PR checks |
| **gap-analysis-sync-index.yml** | Merge to main on `.gap-analysis/GAP_ANALYSIS.md` | Parses markdown → generates `status.json` (aggregate) | Auto-commits `status.json` (via Actions) |
| **check-compliance.yml** (updated) | Weekly Mon 07:00 UTC | Scans all org repos; reports missing `.gap-analysis/` | GitHub issue + artifact |

**Important**: `status.json` is **auto-generated**. Do not commit it manually. Add to `.gitignore`.

## Cross-Repo Queries

### Find all P0 gaps in the org
```bash
find ~/ruralpeds -name "GAP_ANALYSIS.md" \
  -exec grep -l "P0 (Blocker)" {} \;
```

### Count gaps by status (all repos)
```bash
find ~/ruralpeds -name "status.json" -exec jq '.by_status' {} \; | \
  jq -s 'reduce .[] as $item ({}; . * $item)'
```

### Find blocked gaps with no owner
```bash
find ~/ruralpeds -name "GAP_ANALYSIS.md" \
  -exec sh -c 'echo "=== {} ==="; grep -B2 "Blocked.*\[Unassigned\]" "$1"' _ {} \;
```

### Using ripgrep (faster)
```bash
rg "^### GAP-" ~/ruralpeds --type md -A 5 | \
  grep -E "(GAP-|Status|Owner)" | grep -B1 "In Progress"
```

## Org-Level Compliance

- **Mandatory for**: All active repos with ongoing development
- **Optional for**: Archived repos, example repos, templates
- **Audit frequency**: Weekly (Monday 07:00 UTC via `check-compliance.yml`)
- **Non-compliance action**: GitHub issue created listing repos without `.gap-analysis/`; repos have **1 week** to add it

## Guidelines

### Good Gaps ✅

**Specific, actionable, measurable**

- "Implement CDC/WHO percentile interpolation with QuadraticSpline, validate against NCHS reference tables"
- "Add Rosenbrock34 implicit solver to sci-ode; benchmark against Hairer test suite (order 4 convergence)"
- "Competing risks support: Aalen-Johansen estimator, Gray's test, subdistribution hazards (Fine-Gray model)"

### Bad Gaps ❌

**Vague, unmeasurable, no acceptance criteria**

- "Improve performance" (no metrics; what's "better"?)
- "Refactor the codebase" (too broad; not actionable)
- "Research machine learning" (exploratory, not a deliverable)
- "Optimize code" (needs specific target: latency, memory, throughput?)

### Questions to Ask Before Adding a Gap

1. **Is this specific?** Can a developer understand exactly what to build in 2–3 sentences?
2. **Are acceptance criteria clear?** Can someone know when it's done (without ambiguity)?
3. **Does it have an owner** (if P0/P1)? Who's responsible? (You can't assign if you don't know.)
4. **Is the priority justified?** Why P0 vs P2? Does the roadmap reflect it?
5. **Is it blocked?** If so, what needs to happen first? When can you unblock it?

## FAQ

### Q: Should I version-control `status.json`?

**A:** No. Add to `.gap-analysis/.gitignore`. It's auto-generated by GitHub Actions; committing it creates merge conflicts and defeats the purpose.

### Q: Can gaps be cross-repo (e.g., "GAP-001 in rust-sci-core blocks GAP-042 in modeling")?

**A:** Yes. Use the **Blocked By** field:
```markdown
**Blocked By**: GAP-SCI-001 (repo: ruralpeds/rust-sci-core)
```

And link with a full GitHub URL in **Related PRs** if needed:
```markdown
**Related PRs**: https://github.com/ruralpeds/rust-sci-core/pull/123
```

### Q: How often should I update gaps?

**A:** 
- **At minimum**: Weekly (every Monday, or on your sprint review)
- **Ideal**: On every PR merge (update status if it changes)
- **When starting work**: Update status from "Backlog" → "In Progress"
- **When unblocking**: Update status from "Blocked" → "In Progress"

Set a team calendar reminder if needed.

### Q: Can we use GitHub Issues instead?

**A:** You *can*, but gap analysis is **not** issue tracking. 

| Aspect | Gap Analysis | GitHub Issues |
|--------|--------------|---------------|
| **Scope** | Internal roadmap + architectural backlog | Bug reports, feature requests, user-facing |
| **Owner** | Always assigned (P0/P1) | Assignee optional |
| **Audit trail** | Git commits (immutable) | GitHub issues (editable, deletable) |
| **Cross-repo** | Easy (link via "Blocked By") | Harder (need board, project, or custom linking) |
| **Offline access** | Yes (local .md file) | No (needs GitHub web) |
| **Compliance ready** | Yes (auditable, version-controlled) | Maybe (depends on export/archival policy) |

**Recommendation**: Use Issues for bugs. Use Gaps for roadmap.

### Q: What if a gap never gets done?

**A:** Move to **Archived** section with a note explaining why:
```markdown
### 🗑️ GAP-XXX: [Feature name]
**Status**: Archived
**Archived Date**: 2026-06-15
**Reason**: Deprioritized in Q3 in favor of GAP-042. May revisit in 2027 if customer demand increases.
```

This is valuable institutional memory. Don't delete; archive.

### Q: Can I have multiple owners?

**A:** List them comma-separated:
```markdown
**Owner**: Alice Chen, Bob Rodriguez
```

But ideally one **primary owner** (the person most responsible) and 1–2 supporting contributors.

### Q: How do I know if my gap is "P0" vs "P1"?

**A:** 

| Level | Definition | Example |
|-------|-----------|---------|
| **P0** | Blocks releases or critical path; security/compliance issue | HIPAA audit finding; broken test suite; zero-day vulnerability |
| **P1** | High impact; planned for next roadmap cycle (1–3 months) | Major feature; customer-blocking bug; architecture debt affecting velocity |
| **P2** | Important but not urgent; scheduled roadmap | Nice feature; technical debt with workaround; optimization (non-critical) |
| **P3** | Backlog; lower priority | Exploratory; future-proofing; minor UX improvement |
| **P4** | Nice-to-have; can defer | Experimental; "what if" ideas; far-future enhancements |

**Rule of thumb**: If it blocks revenue, compliance, or release, it's P0 or P1. If it affects next sprint, it's P1. Otherwise, P2–P4.

## Integration with Existing ruralpeds Infrastructure

| Your System | Integration Point |
|-------------|-------------------|
| **Audit logging** (`audit-log.yml`) | Gap completions are git commits, so they appear in `audit-log/ledger.json` |
| **Compliance scanning** (`check-compliance.yml`) | Added: scan for `.gap-analysis/` in all repos; report missing |
| **Review stamps** (`review-stamp.yml`) | Optional: could stamp gaps when reviewed |
| **PHI scanning** (`reusable-phi-scan.yml`) | No interaction (gaps are non-clinical metadata) |
| **SBOM generation** (`reusable-sbom.yml`) | No interaction |
| **Governance as code** (`sync-rulesets.yml`) | No direct interaction (but gap analysis is *itself* governance) |

## Contact & Governance

- **System Owner**: Timothy Hartzog (@timothyhartzog)
- **Last Review**: 2026-04-23
- **Next Review**: 2026-05-23 (monthly)
- **Escalation**: Open an issue in `ruralpeds/.github` tagged `gap-analysis`

---

## See Also

- [GAP_ANALYSIS_QUICK_REFERENCE.md](GAP_ANALYSIS_QUICK_REFERENCE.md) — Cheat sheet for daily use
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Contributor guidelines (gap analysis section)
- [.github/workflows/gap-analysis-validate.yml](../.github/workflows/gap-analysis-validate.yml) — Validation logic
- [.github/workflows/gap-analysis-sync-index.yml](../.github/workflows/gap-analysis-sync-index.yml) — Index generation
