# Workflow Consolidation — `ruralpeds/.github`

Single source of truth for CI/CD across the `ruralpeds` org and (via
cross-owner calls) the `timothyhartzog` personal account. Reusable
workflows are hosted once; every repo calls them.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  ruralpeds/.github                         ← canonical org repo │
│                                                                │
│  .github/workflows/                                            │
│    ├── hipaa-compliance.yml      ← reusable (workflow_call)    │
│    ├── repo-audit.yml            ← reusable (workflow_call)    │
│    ├── required-compliance.yml   ← dispatcher (REQUIRED)       │
│    └── required-audit.yml        ← dispatcher (REQUIRED)       │
│                                                                │
│  scripts/                                                      │
│    ├── audit_engine.py                                         │
│    ├── phi_scan.py                                             │
│    └── coverage_gate.py                                        │
│                                                                │
│  config/                                                       │
│    ├── phi-patterns.yml          ← org-default PHI pack        │
│    └── semgrep-medical.yml       ← org-default SAST rules      │
│                                                                │
│  profile/README.md               ← org profile page            │
│  SECURITY.md, CONTRIBUTING.md    ← community health defaults   │
└────────────────────────┬───────────────────────────────────────┘
             ┌───────────┼───────────────────────┐
             │           │                       │
             ▼           ▼                       ▼
    ┌──────────────┐ ┌──────────────┐  ┌──────────────────────┐
    │ ruralpeds/   │ │ ruralpeds/   │  │ timothyhartzog/*     │
    │   Peds       │ │   Quality    │  │ (personal repos)     │
    │              │ │              │  │  Cross-owner call    │
    │ Gets REQUIRED│ │ Gets REQUIRED│  │  — needs .github     │
    │ workflows    │ │ workflows    │  │     to be public     │
    │ automatically│ │ automatically│  │                      │
    └──────┬───────┘ └──────┬───────┘  └──────────┬───────────┘
           │                │                     │
           ├────────────────┴─────────────────────┘
           ▼
    ┌────────────────────────────────────┐
    │ Mac Studio (36 GB)                 │
    │                                    │
    │  Org runner (scope=ruralpeds)      │
    │   Group: mac-studio-medical        │
    │   Labels: self-hosted, mac-studio, │
    │           arm64, medical           │
    │                                    │
    │  User runner (scope=timothyhartzog)│
    │   Labels: self-hosted, mac-studio, │
    │           arm64                    │
    └────────────────────────────────────┘
```

## What the org structure gives you

| Feature                          | How it helps                                                                 |
|----------------------------------|------------------------------------------------------------------------------|
| **Org-level required workflows** | Compliance + audit run on every `ruralpeds/*` repo, no opt-in needed         |
| **Org runner groups**            | One runner registration, all org repos can target it                         |
| **Org secrets**                  | `SLACK_WEBHOOK`, `CODECOV_TOKEN`, etc., set once — inherited everywhere      |
| **Org-level security features**  | Dependabot, secret scanning, CodeQL default setup can be enforced org-wide   |
| **Canonical `.github` repo**     | Holds community health files + reusable workflows in one convention-following place |

## Deployment order

### 1. Create `ruralpeds/.github`

```bash
gh repo create ruralpeds/.github --public --clone
cd .github

# The directory has to literally be named ".github" — that's how GitHub
# identifies the special repo, AND inside it workflows live at
# .github/workflows/. Yes, it's ".github/.github/workflows/". That's correct.

mkdir -p .github/workflows scripts config profile

# Copy reusable workflows
cp ../gh-workflows/reusable/hipaa-compliance.yml  .github/workflows/
cp ../gh-workflows/reusable/repo-audit.yml         .github/workflows/
cp ../gh-workflows/reusable/required-compliance.yml .github/workflows/
cp ../gh-workflows/reusable/required-audit.yml     .github/workflows/

# Copy supporting files
cp ../gh-workflows/scripts/audit_engine.py   scripts/
cp ../gh-workflows/scripts/phi_scan.py       scripts/
cp ../gh-workflows/scripts/coverage_gate.py  scripts/
cp ../gh-workflows/schemas/phi-patterns.yml  config/
cp ../gh-workflows/schemas/semgrep-medical.yml config/

# Org profile
cat > profile/README.md <<'EOF'
# ruralpeds

Clinical software and quality infrastructure for rural and Critical Access
Hospital pediatric care.
EOF

git add . && git commit -m "feat: initial org infrastructure" && git push
```

**Why public?** So `timothyhartzog/*` personal repos can reference the
reusable workflows across owner boundaries. Private is fine if you migrate
all callers into the org, but public is simpler. The workflow logic is
generic infrastructure, not proprietary.

### 2. Register required workflows (UI)

Navigate to `https://github.com/organizations/ruralpeds/settings/actions`
→ **Required workflows** → **Add workflow**:

| Field                | Value                                                      |
|----------------------|------------------------------------------------------------|
| Source repository    | `ruralpeds/.github`                                        |
| Ref                  | `main` (tighten to a tag like `v1.0.0` once stable)        |
| Workflow file path   | `.github/workflows/required-compliance.yml`                |
| Apply to             | All repositories (or Selected)                             |

Save, then repeat for `required-audit.yml`. Every matching repo now has
both workflows auto-injected into its Actions tab.

### 3. Set up org runner group

```bash
# Browser: https://github.com/organizations/ruralpeds/settings/actions/runner-groups
#   → New runner group
#   → Name: mac-studio-medical
#   → Repository access: All repositories (or Selected)
#   → Workflow access: All workflows (or restrict to the required ones)
```

Grab a registration token from
`https://github.com/organizations/ruralpeds/settings/actions/runners/new`,
then on the Mac Studio:

```bash
./setup-mac-studio-runner.sh \
    --scope org \
    --owner ruralpeds \
    --name  mac-studio-rp-1 \
    --token <REG_TOKEN> \
    --group mac-studio-medical \
    --labels 'self-hosted,mac-studio,arm64,medical'

./bootstrap-runner-tools.sh
```

For personal repos (`timothyhartzog/*`), register a second runner at user
scope. Don't try to share one runner across both — different namespaces,
different registration tokens:

```bash
./setup-mac-studio-runner.sh \
    --scope user \
    --owner timothyhartzog \
    --name  mac-studio-th-1 \
    --token <USER_REG_TOKEN> \
    --labels 'self-hosted,mac-studio,arm64'
```

With 36 GB unified memory you can run **both concurrently** (each runner
process is ~200 MB idle, jobs scale from there). Heavy Julia builds and
CodeQL can spike to 4–6 GB per job, so 2 parallel runners is the
comfortable sweet spot. Add a third only if you see sustained queueing.

### 4. Set org-level secrets

`https://github.com/organizations/ruralpeds/settings/secrets/actions` →
**New organization secret**:

- `SLACK_WEBHOOK` — for compliance failure pings
- `CODECOV_TOKEN` — if you adopt Codecov
- Any API keys needed by repos (scoped to specific repos if sensitive)

All repos in the org inherit these. Personal repos need their own copies
set at the account level.

### 5. Add per-repo caller files (where you want tighter defaults)

The org-level required workflow uses generic defaults. A repo can add its
own caller to *tighten* things (higher coverage threshold, stricter
fail-on, fda-class override). The per-repo workflow runs *in addition to*
the required one:

```bash
cd ~/path/to/ruralpeds/Peds
mkdir -p .github/workflows
cp ~/gh-workflows/caller-examples/compliance.yml .github/workflows/
cp ~/gh-workflows/caller-examples/audit.yml      .github/workflows/
# edit: classification, fda-class, coverage-threshold
git add .github/workflows && git commit -m "ci: tighten compliance defaults"
```

## Consolidation playbook (current → target)

Once the org infrastructure is live:

1. **Inventory.** For each repo: `gh workflow list` → classify existing
   workflows as
   - ✅ *Already obsolete* (covered by the org required workflow) — delete
   - ♻️ *Partially overlaps* — strip the overlapping jobs, keep only the
     repo-specific ones (build, deploy, package publish, etc.)
   - 🎯 *Repo-specific* — keep untouched
   - 🗑 *Dead* — delete

2. **Migrate ordering.** Do repos in this order to minimize risk:
   1. Low-stakes repos first (textbook/documentation repos) — validate
      the required workflows don't break anything
   2. Library repos (`BioStatistics.jl`, `rust-sci-core/*`)
   3. Clinical repos last (`Peds`, `Patient-simulation-julia`) — these
      have the highest sensitivity and need the most per-repo tuning

3. **Branch protection.** On `main` in each repo:
   - Require status checks: `Required — Compliance / hipaa`
   - Require status checks: `Required — Audit Log / audit`
   - Require signed commits (for Class II+ repos)
   - Require PRs (no direct pushes to main)

4. **Version pin.** Once `ruralpeds/.github` stabilizes, tag it
   (`git tag v1.0.0 && git push --tags`) and update the required-workflow
   registration to point to `v1.0.0` instead of `main`. This means
   changes to the central repo don't silently affect all repos.

## Per-repo classification cheatsheet

| Repo pattern                          | Namespace       | `classification`    | `fda-class` | `coverage` |
|---------------------------------------|-----------------|---------------------|-------------|------------|
| `Peds`                                | → ruralpeds     | clinical-software   | II          | 85         |
| `Patient-simulation-julia`, `PedNeoSim.jl` | → ruralpeds | clinical-software   | II          | 85         |
| `Quality-textbook-master-quarto`      | ruralpeds or personal | education     | none        | 0          |
| `BioStatistics.jl`                    | personal        | library             | none        | 80         |
| `rust-sci-core/*`                     | personal        | library             | none        | 80         |
| `modeling`, textbook repos            | personal        | documentation       | none        | 0          |
| `theology-analysis`                   | personal        | documentation       | none        | 0          |
| `Creative-writer`                     | personal        | library             | none        | 70         |
| `mlx-media-makers`                    | personal        | library             | none        | 70         |
| `Claude-artifacts`                    | personal        | research            | none        | 0          |

**Strong recommendation:** migrate `Peds`, `Patient-simulation-julia`,
and `PedNeoSim.jl` into `ruralpeds` before applying branch protection.
Clinical repos belong in the org both for the required-workflow
enforcement and for any future BAA/partnership/team-access scenarios.

## What's already hooked in for later

The reusable workflows expose outputs (`compliance-status`, `sbom-url`,
`status`, `last-reviewed`). Next workflows to build on top:

- **Release gate** — block tag-based releases unless compliance = pass
  and audit is fresh. One org-level required workflow on `release` event.
- **Org dashboard** — scheduled workflow in `ruralpeds/.github` that
  walks every repo via the GitHub API, fetches each `AUDIT.yaml`, and
  publishes a combined health dashboard to GitHub Pages. Red/yellow/green
  per repo. This is where the audit log really earns its keep.
- **FDA 510(k) bundle** — on tag push, gather SBOM + `AUDIT.yaml` + test
  coverage + SARIF into a signed zip ready for submission.
- **Dependabot auto-remediation** — when Dependabot opens a PR bumping a
  dependency, the compliance workflow validates; if it passes, auto-merge.
- **Stale-repo sweeper** — scheduled workflow that opens an issue in any
  repo whose `AUDIT.yaml` is more than the review interval old.

Say the word on any of these when you're ready.

## File layout of this bundle

```
gh-workflows/
├── reusable/                      ← goes into ruralpeds/.github/.github/workflows/
│   ├── hipaa-compliance.yml        ← reusable compliance gate
│   ├── repo-audit.yml              ← reusable audit log
│   ├── release-gate.yml            ← reusable release gate
│   ├── fda-bundle.yml              ← reusable 510(k) bundle builder
│   ├── required-compliance.yml     ← register as org required workflow
│   ├── required-audit.yml          ← register as org required workflow
│   ├── org-dashboard.yml           ← standalone scheduled (in .github repo)
│   └── stale-repo-sweeper.yml      ← standalone scheduled (in .github repo)
│
├── scripts/                       ← goes into ruralpeds/.github/scripts/
│   ├── audit_engine.py             ← engine for repo-audit workflow
│   ├── phi_scan.py                 ← engine for hipaa-compliance workflow
│   ├── coverage_gate.py            ← engine for hipaa-compliance workflow
│   ├── build_dashboard.py          ← engine for org-dashboard workflow
│   ├── stale_sweeper.py            ← engine for stale-repo-sweeper
│   ├── inventory_workflows.py      ← run once to catalog all workflows
│   ├── setup-mac-studio-runner.sh  ← install runner on Mac Studio
│   └── bootstrap-runner-tools.sh   ← install brew tools on runner host
│
├── schemas/                       ← goes into ruralpeds/.github/config/
│   ├── phi-patterns.yml
│   ├── semgrep-medical.yml
│   └── AUDIT.example.yaml         ← reference only; AUDIT.yaml lives per-repo
│
├── caller-examples/               ← drop into specific repos as needed
│   ├── compliance.yml              ← optional per-repo tightening
│   ├── audit.yml                   ← optional per-repo tightening
│   └── release.yml                 ← release gate + FDA bundle on tag
│
└── docs/
    ├── README.md                   ← this file
    ├── inventory.md                ← how to run the inventory
    └── org-required-workflows.md
```
