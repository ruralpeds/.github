# Gap-Analysis System — Org-Wide Rollout Playbook

**Audience:** repo owner (Timothy)
**Scope:** all ~68 repositories under the `ruralpeds` GitHub organization
**Source repo:** `ruralpeds/.github` (templates + reusable workflow + scripts)
**Target system version:** v1.0 (see `docs/GAP_ANALYSIS_LIFECYCLE.md`)

---

## What this rollout delivers

After completion, every repo under `ruralpeds` has:

1. A `.gap-analysis/` directory with the same six files (GAP_ANALYSIS.md,
   SUGGESTIONS.md, CLAUDE.md, schema.md, build-ledger.jsonl, status.json,
   .gitignore).
2. Two thin caller workflows in `.github/workflows/` that delegate to the
   org-level reusable workflow `ruralpeds/.github/.github/workflows/reusable-gap-analysis.yml`.
3. Identical lifecycle behavior across repos: a branch named `gap/NNN-…`
   automatically flips the gap to **In Progress**; opening a PR titled
   `GAP-NNN: …` flips it to **In Review**; merging to `main` flips it to
   **Completed** and appends an event to `build-ledger.jsonl`. A weekly
   audit checks all three sources (doc, ledger, git) for drift.
4. A protocol that Claude Code (and any other coding agent) follows on every
   session: read three files first, propose work via SUGGESTIONS.md, never
   touch workflow-managed fields, use `gap/NNN-…` branches.

---

## Phase 0 — One-time prep (do this once, on Mac Studio)

### 0.1 Land the new files in `ruralpeds/.github`

The system itself is delivered as a set of files that go into the
`ruralpeds/.github` repo. You need to commit them there first, because every
other repo's caller workflow references the reusable workflow at
`ruralpeds/.github/.github/workflows/reusable-gap-analysis.yml@main`.

```bash
cd ~/Documents/github/.github      # your local checkout of ruralpeds/.github
git checkout -b feat/gap-analysis-v1

# Copy files from this delivery (assuming you unpacked the bundle to ~/Downloads/gap-system/)
cp -r ~/Downloads/gap-system/docs/*                 docs/
cp -r ~/Downloads/gap-system/templates/gap-analysis templates/
cp    ~/Downloads/gap-system/.github/workflows/reusable-gap-analysis.yml \
                                                     .github/workflows/
cp    ~/Downloads/gap-system/scripts/gap_lifecycle.py            scripts/
cp    ~/Downloads/gap-system/scripts/bootstrap_gap_analysis.py   scripts/
cp    ~/Downloads/gap-system/scripts/install-gap-analysis.sh     scripts/
chmod +x scripts/install-gap-analysis.sh

# Apply the patch to copilot-instructions.md (insert section 8 — see patch file)
$EDITOR copilot-instructions.md
# Use copilot-instructions.patch.md as the source for the new section.

git add -A
git commit -m "feat(gap-analysis): v1.0 lifecycle system + templates + reusable workflow

Implements the unified gap-analysis + build-ledger system specified in
docs/GAP_ANALYSIS_LIFECYCLE.md. Provides:

- canonical lifecycle spec (docs/GAP_ANALYSIS_LIFECYCLE.md)
- agent contract (docs/CLAUDE_CODE_GAP_PROTOCOL.md)
- per-repo templates (templates/gap-analysis/*)
- org-level reusable workflow (.github/workflows/reusable-gap-analysis.yml)
- lifecycle CLI (scripts/gap_lifecycle.py)
- bootstrap installer (scripts/bootstrap_gap_analysis.py)
- single-repo install wrapper (scripts/install-gap-analysis.sh)
- copilot-instructions section 8 referencing the new contract

Resolves GAP-001 (templates restoration).

Refs: GAP-001"

git push -u origin feat/gap-analysis-v1
gh pr create --fill
```

Merge this PR before continuing. Nothing else works until the reusable
workflow is on `main` of `ruralpeds/.github`.

### 0.2 Set up your local rollout workspace

```bash
mkdir -p ~/repo-cleanup/workspace
cd ~/repo-cleanup/workspace

# Make sure GH CLI is authenticated and gh auth status shows ruralpeds org access
gh auth status
gh auth refresh -s repo,workflow,write:org

# Export a token for the bootstrap script (separate var from your shell PAT)
export GH_TOKEN="$(gh auth token)"
```

### 0.3 Generate the repo list

```bash
gh repo list ruralpeds --limit 200 \
    --json name,isArchived,defaultBranchRef \
    --jq '.[] | select(.isArchived == false) | .name' \
    | sort > ~/repo-cleanup/repos-active.txt

wc -l ~/repo-cleanup/repos-active.txt
```

Review the list and split into tiers (next section).

---

## Phase 1 — Pilot on a single low-stakes repo

**Goal:** verify the install path end-to-end on one repo before touching the
fleet. Pick a repo that is small, has recent activity (so the workflow has a
chance to fire on a test branch), and where a noisy first PR is acceptable.

**Recommended pilot:** `ruralpeds/Claude-artifacts` — high activity, low
external visibility, easy to revert.

### 1.1 Dry-run install

```bash
cd ~/repo-cleanup/workspace
git clone https://github.com/ruralpeds/Claude-artifacts.git
cd Claude-artifacts

# Dry-run first
~/Documents/github/.github/scripts/install-gap-analysis.sh
```

You should see a preview of files that would be created. Nothing is written.

### 1.2 Apply locally, review, push manually

```bash
~/Documents/github/.github/scripts/install-gap-analysis.sh --apply
git log --oneline -5
git diff main..bootstrap/gap-analysis-v1 --stat
```

Inspect the diff. You should see:
- new directory `.gap-analysis/` with 7 files
- new files `.github/workflows/gap-analysis-lifecycle.yml` and
  `.github/workflows/gap-analysis-audit.yml`
- no other changes

If the diff looks right, push and open a PR:

```bash
git push -u origin bootstrap/gap-analysis-v1
gh pr create \
    --title "Bootstrap gap-analysis system v1.0" \
    --body "Installs the .gap-analysis/ directory and lifecycle workflows per ruralpeds/.github docs/GAP_ANALYSIS_LIFECYCLE.md. No code changes."
```

Merge after review.

### 1.3 Smoke test the lifecycle

After the bootstrap PR is merged:

```bash
git checkout main && git pull
```

Add one real gap manually to verify the workflow fires:

1. Edit `.gap-analysis/GAP_ANALYSIS.md`. Add a new entry under **Active
   Gaps** with `Status: Backlog`, ID `GAP-001`, e.g. "Add README badge for
   build status".
2. Commit on `main`:
   ```bash
   git add .gap-analysis/GAP_ANALYSIS.md
   git commit -m "chore(gap): seed GAP-001"
   git push
   ```
3. Create the work branch — the workflow should flip Status to In Progress:
   ```bash
   git checkout -b gap/001-readme-build-badge
   # (do whatever the gap describes)
   git push -u origin gap/001-readme-build-badge
   ```
   Within ~30 seconds, GitHub Actions should run `branch_opened` and you'll
   see a new commit on the branch from `github-actions[bot]` updating the
   gap status.
4. Open a PR:
   ```bash
   gh pr create --title "GAP-001: add README build badge" \
                --body "Closes: GAP-001"
   ```
   Workflow should flip Status to In Review and add `Related PRs: #N`.
5. Merge the PR. Workflow should flip Status to Completed, move the entry
   to **Completed Gaps**, and append a `pr_merged` event to
   `build-ledger.jsonl`.

If any step misbehaves, **stop the rollout** and debug before proceeding.
Common issues:
- Reusable workflow not yet on `main` of `ruralpeds/.github` (Phase 0.1
  not merged).
- Workflow lacks `contents: write` permission (check `permissions:` block in
  the caller workflows — already set in templates, but check for org-level
  policy overrides at Settings → Actions → General).
- `GITHUB_TOKEN` from a fork PR — fork PRs cannot trigger writes; this is
  expected and the merged PR will reconcile state.

---

## Phase 2 — High-priority active repos

**Goal:** install on the four or five repos you actually work in daily, so
the system starts paying back immediately.

**Tier 2 list (suggested):**
1. `ruralpeds/Peds` (clinical decision support, very active)
2. `ruralpeds/rust-sci-core` (workspace, multiple crates)
3. `timothyhartzog/Patient-simulation-julia` → migrate to `ruralpeds` first if
   not done, then install
4. `ruralpeds/theology-analysis`
5. one more of your choice

For each, follow the same loop:

```bash
cd ~/repo-cleanup/workspace
git clone https://github.com/ruralpeds/<repo>.git
cd <repo>
~/Documents/github/.github/scripts/install-gap-analysis.sh --apply --push
```

`--push` auto-opens the PR via `gh`. Review, merge, smoke-test exactly as in
Phase 1.3 with one real gap. After all tier-2 repos are green for ~48 hours,
proceed to Phase 3.

---

## Phase 3 — Sweep the remaining ~60 repos

**Goal:** get the system installed everywhere with minimum hand-holding.

### 3.1 Bulk install via the org-wide bootstrap script

```bash
cd ~/repo-cleanup
export GH_TOKEN="$(gh auth token)"

# Build the input list, excluding repos already done
comm -23 \
    <(sort repos-active.txt) \
    <(echo -e "Claude-artifacts\nPeds\nrust-sci-core\nPatient-simulation-julia\ntheology-analysis" | sort) \
    > repos-tier3.txt

wc -l repos-tier3.txt

# Dry-run the whole tier first
python3 ~/Documents/github/.github/scripts/bootstrap_gap_analysis.py \
    --org ruralpeds \
    --repos-file repos-tier3.txt \
    --workspace ~/repo-cleanup/workspace \
    --templates-dir ~/Documents/github/.github/templates/gap-analysis \
    --dry-run \
    2>&1 | tee bootstrap-tier3-dryrun.log

# Review the log. If it looks clean, run for real:
python3 ~/Documents/github/.github/scripts/bootstrap_gap_analysis.py \
    --org ruralpeds \
    --repos-file repos-tier3.txt \
    --workspace ~/repo-cleanup/workspace \
    --templates-dir ~/Documents/github/.github/templates/gap-analysis \
    2>&1 | tee bootstrap-tier3-apply.log
```

This will, for each repo:
1. Clone (or pull) into `~/repo-cleanup/workspace/<repo>/`
2. Create branch `bootstrap/gap-analysis-v1`
3. Copy templates with `<repo-name>` substituted
4. Commit
5. Push
6. Open a PR via `gh`

Expect ~5–10 seconds per repo for clone, ~20–30 seconds total per repo for
the full cycle. 60 repos ≈ 20–30 minutes wall clock.

### 3.2 Triage failures

The script is idempotent — re-running it on a repo where the branch already
exists will skip cleanly. Watch the log for these patterns:

| Symptom | Likely cause | Fix |
|---|---|---|
| `gh: command not found` | gh CLI missing | install via `brew install gh` |
| `HTTP 401` from `gh pr create` | token lacks `repo` scope | `gh auth refresh -s repo,workflow` |
| `repository is empty` | repo has no commits on default branch | skip — bootstrap requires a base |
| `branch already exists` | prior partial run | safe to ignore; PR was already opened |
| `permission denied` on push | repo is read-only / archived | exclude from `repos-tier3.txt` |

Save failed repos to `repos-failed.txt`, fix the underlying issue, and re-run
the bootstrap with `--repos-file repos-failed.txt`.

### 3.3 Merge the bootstrap PRs

Browse `https://github.com/pulls?q=is%3Apr+is%3Aopen+org%3Aruralpeds+author%3A%40me+head%3Abootstrap%2Fgap-analysis-v1`
to see all open bootstrap PRs.

For pure-content repos (no CI) the PRs will all be green. For repos with
strict CI, you may need to add `[skip ci]` to the merge commit if the
bootstrap commit doesn't match unrelated linting rules — `gh pr merge --squash`
is the simplest path.

To merge them in batch (after spot-checking 3–4 manually first):

```bash
gh pr list --search "is:open author:@me head:bootstrap/gap-analysis-v1" \
    --json number,headRepository \
    --jq '.[] | "\(.headRepository.name) \(.number)"' \
    | while read repo num; do
        echo "Merging $repo PR #$num"
        gh pr merge --repo "ruralpeds/$repo" "$num" --squash --auto
    done
```

---

## Phase 4 — Verify and stabilize

### 4.1 Run the audit on every repo

After all bootstrap PRs are merged, the weekly cron will run on the next
Monday at 13:00 UTC, but you can trigger it manually now:

```bash
gh workflow run gap-analysis-audit.yml --repo ruralpeds/Peds
# ...repeat for each repo, or:
while read repo; do
    gh workflow run gap-analysis-audit.yml --repo "ruralpeds/$repo" || true
done < ~/repo-cleanup/repos-active.txt
```

After ~5 minutes, check the audit results:

```bash
while read repo; do
    status=$(gh run list --repo "ruralpeds/$repo" \
                --workflow gap-analysis-audit.yml --limit 1 \
                --json conclusion --jq '.[0].conclusion' 2>/dev/null)
    echo "$status  $repo"
done < ~/repo-cleanup/repos-active.txt | sort | tee audit-status.txt
```

Repos with `conclusion: success` (or `null` if still running) are healthy.
Repos with `failure` need investigation — most often this is a placeholder
gap left in the template that was never filled in, or a manual edit to a
workflow-managed field. Open the failing audit run, read the JSON output of
`gap_lifecycle.py audit`, and fix.

### 4.2 Update repo CLAUDE.md / AGENTS.md to reference the new system

For repos that already have a top-level `CLAUDE.md` or `AGENTS.md`, add a
single line near the top:

```markdown
**Gap analysis:** see `.gap-analysis/CLAUDE.md` for the per-session protocol
and `https://github.com/ruralpeds/.github/blob/main/docs/GAP_ANALYSIS_LIFECYCLE.md`
for the canonical lifecycle.
```

You can do this in the same bootstrap PR for repos where the file already
exists; for repos without one, add it ad-hoc as you next work in that repo.

---

## Phase 5 — Operational habits going forward

Once the system is live, here's the day-to-day rhythm:

**When you (or Claude Code) think of a new piece of work:**
- It goes into `.gap-analysis/SUGGESTIONS.md` first, never directly into
  `GAP_ANALYSIS.md`. Suggestion ID format:
  `sug-YYYY-MM-DD-<author>-NNN`.

**When you triage a suggestion into a real gap:**
- Promote it manually (or run `python3 scripts/gap_lifecycle.py promote
  --suggestion-id sug-…`) — this moves it to `GAP_ANALYSIS.md` with
  `Status: Backlog` and assigns the next `GAP-NNN` ID.

**When you start work:**
- `git checkout -b gap/NNN-short-slug` — that branch name is what the
  workflow keys on. Workflow flips Status to **In Progress**.

**When you open a PR:**
- Title `GAP-NNN: <one-line>`, body includes `Closes: GAP-NNN`. Workflow
  flips to **In Review**, sets `Related PRs: #N`.

**When the PR merges:**
- Workflow flips to **Completed**, moves entry to Completed Gaps section,
  appends `pr_merged` event to `build-ledger.jsonl`.

**Every Monday:**
- Audit cron runs in every repo. If it fails, you'll get a notification.
  Drift is fixed by re-running `gap_lifecycle.py audit --fix` (manual
  reconciliation) on the affected repo.

**When Claude Code starts a session:**
- Per the protocol in `docs/CLAUDE_CODE_GAP_PROTOCOL.md`, it reads
  `.gap-analysis/CLAUDE.md`, `.gap-analysis/GAP_ANALYSIS.md`, and
  `.gap-analysis/SUGGESTIONS.md` first — every time. It proposes new work
  via SUGGESTIONS.md, only writes to allowed sections, and uses `gap/NNN-…`
  branches.

---

## Rollback plan (just in case)

If something goes catastrophically wrong on a repo:

1. **Disable the lifecycle workflow only:**
   Settings → Actions → Disable `gap-analysis-lifecycle.yml`. Status fields
   stop auto-updating; the rest of the repo is untouched.

2. **Revert the bootstrap PR:**
   `gh pr revert <number>` — removes `.gap-analysis/` directory cleanly.
   Templates and workflows are gone; nothing else in the repo is affected.

3. **Revert the entire system (all repos):**
   Revert the org-level `feat/gap-analysis-v1` PR in `ruralpeds/.github`.
   This deletes the reusable workflow; per-repo caller workflows then fail
   silently (no status updates) but do not break anything else. You can
   then run `bootstrap_gap_analysis.py --revert` (not yet implemented —
   manual `git rm -r .gap-analysis/` per repo for now).

The system is designed so the worst-case failure mode is "status fields
stop updating automatically" — never "repo is broken".

---

## Quick reference

| Action | Command |
|---|---|
| Install on current dir (dry-run) | `~/.../scripts/install-gap-analysis.sh` |
| Install on current dir (apply) | `~/.../scripts/install-gap-analysis.sh --apply` |
| Install + push + PR | `~/.../scripts/install-gap-analysis.sh --apply --push` |
| Bulk install (dry-run) | `bootstrap_gap_analysis.py --org ruralpeds --repos-file ... --dry-run` |
| Bulk install (apply) | `bootstrap_gap_analysis.py --org ruralpeds --repos-file ...` |
| Trigger audit | `gh workflow run gap-analysis-audit.yml --repo ruralpeds/<repo>` |
| Local audit | `python3 scripts/gap_lifecycle.py audit` (in repo root) |
| Manual status sync | `python3 scripts/gap_lifecycle.py sync-index` |
| Promote suggestion | `python3 scripts/gap_lifecycle.py promote --suggestion-id sug-…` |

---

## What this rollout closes / opens in `ruralpeds/.github`'s own GAP_ANALYSIS

**Closes:**
- `GAP-001` — gap-analysis templates restoration (templates now under
  `templates/gap-analysis/`).

**Opens (suggested follow-ups, file as new gaps after Phase 0.1 merges):**
- `GAP-005` — implement `gap_lifecycle.py promote` subcommand fully (current
  v1 stubs the manual-promotion flow).
- `GAP-006` — add `bootstrap_gap_analysis.py --revert` for clean uninstall.
- `GAP-007` — org-wide dashboard: aggregate `status.json` from every repo
  into a single `ruralpeds/.github/dashboard.json` updated nightly.
- `GAP-008` — extend audit to cross-reference `build-ledger.jsonl` against
  `git log` of `main` for orphan-merge detection.
- `GAP-009` — backfill `build-ledger.jsonl` for historical merges in active
  repos (last 90 days), to seed velocity metrics.
