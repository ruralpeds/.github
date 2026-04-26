# Gap Analysis Quick Reference

> **Print this. Pin it to your desk.**

## Setup (One-Time)

```bash
# In your repo root
cp -r ../.github/templates/gap-analysis .gap-analysis
git add .gap-analysis
git commit -m "docs: add gap analysis (org standard)"
git push origin main
```

## Common Commands

### View all gaps in your repo
```bash
cat .gap-analysis/GAP_ANALYSIS.md
```

### View only active gaps
```bash
sed -n '/^## Active Gaps/,/^## Completed Gaps/p' .gap-analysis/GAP_ANALYSIS.md
```

### Find P0 gaps
```bash
grep -A 1 "^### GAP-" .gap-analysis/GAP_ANALYSIS.md | grep -B 1 "P0 (Blocker)"
```

### Find unassigned P1 gaps
```bash
grep -B 2 "Owner\]: \[Unassigned\]" .gap-analysis/GAP_ANALYSIS.md | grep "P1 (Critical)"
```

### Count gaps by status
```bash
cat .gap-analysis/status.json | jq '.by_status'
```

### Find blocked gaps
```bash
rg "Status.*Blocked" .gap-analysis/ -A 5
```

## Daily Workflow

### Starting a gap (moving from Backlog → In Progress)

1. **Check the gap**
   ```bash
   cat .gap-analysis/GAP_ANALYSIS.md | grep -A 20 "^### GAP-001"
   ```

2. **Update status**
   ```markdown
   ### GAP-001: [Feature]
   **Status**: In Progress    # Changed from "Backlog"
   **Last Status Update**: 2026-04-23
   - Starting implementation; focusing on Acceptance Criterion 1 first
   ```

3. **Commit**
   ```bash
   git add .gap-analysis/GAP_ANALYSIS.md
   git commit -m "docs: start GAP-001"
   git push
   ```

### Opening a PR for a gap

1. **Create feature branch**
   ```bash
   git checkout -b feat/gap-001-cardiometabolic-risk
   ```

2. **Implement feature**
   ```bash
   # ... write code, tests, docs
   git commit -m "feat: implement Framingham calculator (closes GAP-001)"
   ```

3. **Update gap status to "In Review"**
   ```markdown
   ### GAP-001: sci-clinical cardiometabolic risk
   **Status**: In Review
   **Related PRs**: #42
   ```
   
   Commit this in the PR (or on main before merge).

4. **Push and open PR**
   ```bash
   git push origin feat/gap-001-cardiometabolic-risk
   # Open PR on GitHub
   # PR title: feat: cardiometabolic risk (closes GAP-001)
   ```

5. **After merge** (same day or next day):
   ```markdown
   ## Completed Gaps (Last 90 Days)
   
   ### ✅ GAP-001: sci-clinical cardiometabolic risk
   **Status**: Completed
   **Completed Date**: 2026-05-12
   **PR**: #42
   **Completion Notes**: Implemented Framingham, ACC/AHA, ASCVD equations. Validated against published tables. 18 unit tests.
   ```
   
   Commit: `git commit -m "docs: mark GAP-001 complete"`

### Marking a gap as blocked

```markdown
### GAP-002: Rosenbrock solver
**Status**: Blocked
**Blocked By**: GAP-005 (interval sampling improvements)

**Last Status Update**: 2026-04-23
- Waiting for sci-probability interval updates (issue #127). Cannot proceed until GMRES linear solver is available.
```

### Unblocking a gap

```markdown
### GAP-002: Rosenbrock solver
**Status**: In Progress    # Changed from "Blocked"
**Blocked By**: None       # Changed from "GAP-005"

**Last Status Update**: 2026-04-24
- GAP-005 merged! Rosenbrock23/34 implementation starting this week.
```

### Archiving a gap (decided not to do)

Move to "Completed Gaps" section:

```markdown
## Completed Gaps (Last 90 Days)

### 🗑️ GAP-XXX: [Feature]
**Status**: Archived
**Archived Date**: 2026-06-15
**Reason**: Deprioritized in Q3 roadmap review. Revisit if customer demand increases.
```

## Status Cheat Sheet

```
NOT STARTED → BACKLOG → IN PROGRESS → [IN REVIEW] → COMPLETED
                            ↓
                         BLOCKED ────────→ back to IN PROGRESS
```

**Status Values**:
- `Not Started` — Planning phase, not yet started
- `Backlog` — Approved to build, waiting for capacity
- `In Progress` — Currently being worked on
- `Blocked` — Work stopped; waiting for external dependency
- `In Review` — PR is open; awaiting merge
- `Completed` — Merged to main
- `Archived` — Decision not to implement

## Priority Cheat Sheet

```
P0 (Blocker)   → Blocks releases, zero-day vulnerabilities, compliance issues
P1 (Critical)  → High impact, planned for next 1–3 months
P2 (High)      → Important, scheduled but not immediately urgent
P3 (Medium)    → Nice to have, lower priority
P4 (Low)       → Exploratory, future-proofing, can defer
```

## Tips & Tricks

### Search across all org repos for a specific gap
```bash
cd ~/ruralpeds
find . -name "GAP_ANALYSIS.md" -exec grep -l "GAP-001" {} \;
```

### Get gap summary (count by status)
```bash
find ~/ruralpeds -name "status.json" -exec cat {} \; | \
  jq '.by_status | to_entries | sort_by(-.value)'
```

### Find all your assigned gaps
```bash
find ~/ruralpeds -name "GAP_ANALYSIS.md" -exec grep -l "Owner\]: Timothy Hartzog" {} \;
```

### Export all gaps to CSV (for spreadsheet)
```bash
python3 << 'EOF'
import json
import glob

for status_file in glob.glob("~/ruralpeds/*/.gap-analysis/status.json"):
    with open(status_file) as f:
        data = json.load(f)
        for gap in data['gaps']:
            print(f"{gap['id']},{gap['status']},{gap['priority']},{gap['owner']}")
EOF
```

### Create a weekly reminder
Add to your calendar (every Monday):
```
☐ Update gap analysis statuses
  - Check .gap-analysis/GAP_ANALYSIS.md in all my repos
  - Update status for any gaps that changed
  - Mark any P0 gaps as having a target date
```

## GitHub Actions Behavior

| Action | When | What Happens |
|--------|------|--------------|
| **Validation** | Every push to `.gap-analysis/GAP_ANALYSIS.md` | Checks syntax, status enums, gap ID uniqueness; fails PR if invalid |
| **Index sync** | Merge to main on `.gap-analysis/` change | Auto-generates `status.json` (aggregate by status) |
| **Compliance scan** | Weekly Mon 07:00 UTC | Scans all org repos; reports missing `.gap-analysis/` |

**Important**: `status.json` is auto-generated. Do NOT commit it. It's in `.gitignore`.

## Common Mistakes

❌ **Don't do this:**

```markdown
**Status**: in progress           # ← should be "In Progress" (enum is strict)
**Owner**: timothy                # ← use full name or email
**Blocked By**: I'm waiting      # ← should reference GAP-XXX, not free text
**Target Completion**: Soon      # ← should be YYYY-MM-DD
- Implementing stuff             # ← too vague; be specific
```

✅ **Do this instead:**

```markdown
**Status**: In Progress
**Owner**: Timothy Hartzog
**Blocked By**: GAP-005 (sci-probability interval sampling)
**Target Completion**: 2026-06-15
- Completed trait definition; now validating Framingham coefficients against published values
```

## When in Doubt

- **Check the standard**: `docs/GAP_ANALYSIS_STANDARDS.md` in `ruralpeds/.github`
- **Check the schema**: `.gap-analysis/schema.md` in your repo
- **Check examples**: Look at `rust-sci-core/.gap-analysis/GAP_ANALYSIS.md` or `modeling/.gap-analysis/`
- **Ask**: Open an issue in `ruralpeds/.github` tagged `gap-analysis`

## Links

- [Full Standard](GAP_ANALYSIS_STANDARDS.md)
- [Organization .github Repo](https://github.com/ruralpeds/.github)
- [Workflows](../.github/workflows/)
  - `gap-analysis-validate.yml`
  - `gap-analysis-sync-index.yml`
