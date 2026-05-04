# Build Status Sweep Execution Guide

**Workflow:** `build-status-sweep.yml`  
**Optimized:** 2026-05-02 (Event-driven + Daily sync)  

---

## Trigger Matrix

| Trigger | When it fires | Primary scope | Notes |
|---|---|---|---|
| `pull_request` | PR opened or synchronized on `main`, `master`, `develop`, or `release/**` | Event repo only | Immediate "started" signal for GAP-linked work |
| `workflow_run` | `ci-rust.yml`, `ci-julia.yml`, or `self-test.yml` completes | Workflow repo only | Converts CI completion into `started`, `passed`, or `failed` |
| `schedule` | Daily at `0 6 * * *` | Full discovery | Catches missed events and reconciles drift |
| `workflow_dispatch` | Manual operator run | One repo or all repos | Supports dry-run and README-skip remediation flows |

### Manual inputs

| Input | Purpose |
|---|---|
| `target_repo` | Limit the sweep to a single `owner/repo` |
| `dry_run` | Show intended actions without updating gaps or READMEs |
| `skip_readme` | Apply gap status changes without refreshing README tables |

---

## Execution Scenarios

### Scenario 1: Event-Driven (Pull Request)

**Trigger:** Developer opens PR with `GAP-042` in branch name

```
Timeline:
─────────────────────────────────────────────────────────────────

T+0s    PR #234 opened: "GAP-042: Implement FHIR validation"
           Branch: feature/gap-042-fhir-validation
           │
           └─→ Webhook: pull_request.opened
               │
               └─→ GitHub Actions triggered: build-status-sweep

T+5s    Job: discover (runs-on: self-hosted, mac-studio, arm64)
        │
        ├─ Generate GitHub App token ..................... 1s
        │
        ├─ Determine target repos ........................ 2s
        │  ├─ TRIGGER = "pull_request"
        │  ├─ PR_REPO = "ruralpeds/app"
        │  └─ repos = "ruralpeds/app"
        │  
        │  📌 Event-driven (pull_request): targeting ruralpeds/app
        │
        ├─ Build sweep matrix ............................. 3s
        │  ├─ Check: .gap-analysis/GAP_ANALYSIS.md exists? ✓
        │  ├─ List PRs for ruralpeds/app
        │  │  └─ Found: PR #234 (feature/gap-042-fhir-validation)
        │  │     Gap ID extracted: GAP-042
        │  │
        │  ├─ Query CI status for branch
        │  │  └─ Latest run: ci-rust.yml on feature/gap-042-fhir-validation
        │  │     Status: in_progress
        │  │     → CI signal: "started"
        │  │
        │  └─ Generate matrix entry
        │     {
        │       "repo": "ruralpeds/app",
        │       "gap_id": "GAP-042",
        │       "ci_status": "started",
        │       "branch": "feature/gap-042-fhir-validation",
        │       "pr_number": "234",
        │       "sha": "abc123def456...",
        │       "run_id": "7891234567"
        │     }
        │
        └─ Log trigger mode & API savings ................ 1s
           ✅ Trigger: pull_request event (PR opened/updated)
              Expected API calls: ~15-20 (event-driven)
              vs. 30-min polling: ~25 calls × 48/day = 1,200/day
              Savings: ~98% reduction

T+8s    Job: update-gap-status (matrix job, max-parallel: 4)
        │
        └─ For each matrix entry (1 in this case):
           │
           ├─ Gap ID: GAP-042
           ├─ Repo: ruralpeds/app
           ├─ CI Status: "started"
           │
           └─ Call: reusable-build-status.yml@main
              ├─ Purpose: Update gap status in target repo
              ├─ Action: Commit status change to .gap-analysis/build-ledger.jsonl
              └─ Status change: "In the Air" → "Building"

T+12s   Job: refresh-readmes (depends on update-gap-status)
        │
        └─ For each repo with gap analysis:
           │
           ├─ Repo: ruralpeds/app
           │
           └─ Call: reusable-readme-gap-status.yml@main
              ├─ Purpose: Refresh README gap-status table
              ├─ Action: Update content between <!-- gap-status-start/end -->
              └─ Updates: Gap table with latest status "Building"

T+15s   ✅ WORKFLOW COMPLETE
        │
        └─ Total runtime: ~15 seconds
           API calls made: ~18
           Gap status updated: GAP-042
           README updated: ✓

User sees on PR:
  ✅ build-status-sweep / discover (passing)
  ✅ build-status-sweep / update-gap-status (passing)
  ✅ build-status-sweep / refresh-readmes (passing)
  
  Gap status: "Building" (CI in progress)
```

### Scenario 2: Event-Driven (CI Completion)

**Trigger:** CI workflow completes (ci-rust.yml success)

```
Timeline:
─────────────────────────────────────────────────────────────────

T+0s    ci-rust.yml completes on feature/gap-042-fhir-validation
        Conclusion: "success" ✓
        │
        └─→ Webhook: workflow_run.completed
            Type: "completed"
            Repo: ruralpeds/app
            │
            └─→ GitHub Actions triggered: build-status-sweep

T+5s    Job: discover
        │
        ├─ Determine target repos
        │  ├─ TRIGGER = "workflow_run"
        │  ├─ WF_REPO = "ruralpeds/app"
        │  └─ repos = "ruralpeds/app"
        │  
        │  📌 Event-driven (workflow_run): targeting ruralpeds/app
        │
        ├─ Build sweep matrix
        │  ├─ Query latest CI status for feature/gap-042-fhir-validation
        │  │  └─ Status: completed
        │  │     Conclusion: success
        │  │     → CI signal: "passed"
        │  │
        │  └─ Generate matrix entry
        │     {
        │       "repo": "ruralpeds/app",
        │       "gap_id": "GAP-042",
        │       "ci_status": "passed",
        │       "branch": "feature/gap-042-fhir-validation",
        │       ...
        │     }
        │
        └─ Log trigger mode & API savings
           ✅ Trigger: workflow_run event (CI completed)
              Expected API calls: ~10-15 (immediate response)
              Savings: ~98% reduction

T+8s    Job: update-gap-status
        │
        └─ Call reusable-build-status.yml
           └─ Status change: "Building" → "Committed"
              Action: Commit to .gap-analysis/build-ledger.jsonl
              Note: Gap status shows "Ready for review" (all gates passed)

T+12s   Job: refresh-readmes
        │
        └─ Update README gap-status table
           └─ Status: "Committed" ✓

T+15s   ✅ WORKFLOW COMPLETE
        │
        └─ Total runtime: ~15 seconds
           API calls: ~12
           Gap status: "Committed" (ready to merge)
```

### Scenario 3: Scheduled (Daily Sync)

**Trigger:** 6 AM UTC every day

```
Timeline:
─────────────────────────────────────────────────────────────────

06:00 UTC (1 AM EST / 10 PM PST)
│
└─→ Cron trigger: "0 6 * * *"
    │
    └─→ GitHub Actions triggered: build-status-sweep

T+5s    Full discovery mode (all Rust/Julia repos)
        │
        └─ Results: 4 repos with gap analysis
           ├─ rust-sci-core
           ├─ biostatistics
           ├─ app
           └─ PedNeoSim.jl

T+20s   Process 5 gap items:
        │
        ├─ GAP-015 (rust-sci-core): "passed" → "Committed"
        ├─ GAP-042 (app): "passed" → "Committed"
        ├─ GAP-043 (app): "in_progress" → "Building"
        ├─ GAP-044 (app): "failed" → "In the Air"
        └─ GAP-100 (PedNeoSim.jl): "started" → "Building"

T+30s   Refresh all 4 README gap-status tables

T+35s   ✅ WORKFLOW COMPLETE
        │
        └─ API calls: ~28 (full discovery)
           Repos checked: 4
           Gaps updated: 5
           READMEs updated: 4
```

### Scenario 4: Manual Remediation (workflow_dispatch)

**Trigger:** Operator runs manual dispatch for a single repo after suspected event drift

```
Timeline:
─────────────────────────────────────────────────────────────────

T+0s    Operator triggers workflow_dispatch
        Inputs:
          target_repo = "ruralpeds/app"
          dry_run     = true
          skip_readme = false
        │
        └─→ GitHub Actions triggered: build-status-sweep

T+5s    Job: discover
        │
        ├─ Detect manual override
        │  └─ repos = "ruralpeds/app"
        │
        ├─ Check .gap-analysis/GAP_ANALYSIS.md exists
        │  └─ ✓ targeted repo eligible
        │
        └─ Build single-repo matrix
           └─ Emits candidate status transitions for review

T+10s   Job: update-gap-status
        │
        └─ dry_run = true
           ├─ Calculates intended status transitions
           ├─ Prints actions instead of mutating .gap-analysis/
           └─ No commit pushed

T+14s   Job: refresh-readmes
        │
        └─ README refresh plan shown, but no repo mutations applied

T+16s   ✅ WORKFLOW COMPLETE
        │
        └─ Operator reviews output and reruns with:
           dry_run = false
           skip_readme = true|false as needed
```

**Best use cases:**

1. Reconcile a repo after a missed webhook.
2. Preview impact before touching multiple gap statuses.
3. Repair gap state without waiting for the next daily sync.

---

## Cost Comparison: Old vs. New

### Before (30-minute polling)
- **Frequency:** 48x/day (every 30 minutes)
- **Runtime:** 2 min × 48 = 96 min/day
- **API calls:** 25 × 48 = 1,200 calls/day
- **Monthly:** 2,880 min (48 GitHub Actions hours)

### After (Event-driven + Daily sync)
- **Frequency:** ~15x/day (event-driven) + 1x/day (scheduled)
- **Runtime:** 2 min × 15 + 3 min × 1 = 33 min/day
- **API calls:** 15 × 15 + 25 = 250 calls/day
- **Monthly:** 990 min (17 GitHub Actions hours)

### Savings
- **Runtime:** 65% reduction (1,890 min/month saved)
- **API calls:** 79% reduction (28,500 calls/month)
- **Status freshness:** Real-time (vs. 15-min average delay)

---

## Implementation Notes

1. The sweep only acts on repos that actually contain `.gap-analysis/GAP_ANALYSIS.md`.
2. GAP IDs are extracted from either branch names or PR titles using `GAP-\d{3,4}`.
3. CI signals map to lifecycle states through `reusable-build-status.yml`:
   - `started` → `Building`
   - `passed` → `Committed`
   - `failed` → `In the Air`
4. README refresh is a separate phase and can be skipped during manual remediation.
5. The `.github` repo is included in discovery so the org repo's own gap lifecycle stays in sync with `self-test.yml`.

---

**Document Control**
- Version: 1.0
- Status: Published
- Last Updated: 2026-05-04
