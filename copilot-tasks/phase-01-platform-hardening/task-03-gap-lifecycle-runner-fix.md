---
title: "Fix gap lifecycle workflows and register apple-silicon runners at org scope"
phase: phase-01
slug: gap-lifecycle-runner-fix
preferred-agent: copilot
preflight-confirmation: false
estimated-complexity: s

goal: >
  The gap lifecycle workflows introduced in commit 02b25cf have four
  standards violations and the runners are not registered at org scope.
  Fix all violations so the workflows pass actionlint and yamllint, use
  the GitHub App token for org API calls, and document the two manual
  runner registration commands.

acceptance-criteria:
  - "reusable-gap-lifecycle.yml: no curl at runtime; uses actions/checkout to fetch update_gaps.py from ruralpeds/.github"
  - "reusable-gap-lifecycle.yml: concurrency block present"
  - "reusable-gap-lifecycle.yml: timeout-minutes declared on every job"
  - "reusable-gap-lifecycle.yml: all uses: pinned to full 40-char SHA"
  - "bootstrap-gaps-sweep.yml: uses GitHub App token (TH_BOT_APP_ID / TH_BOT_PRIVATE_KEY) not GH_PAT"
  - "bootstrap-gaps-sweep.yml: concurrency block present"
  - "bootstrap-gaps-sweep.yml: timeout-minutes declared"
  - "bootstrap-gaps-sweep.yml: all uses: pinned to full 40-char SHA"
  - "ci-gap-tools.yml: concurrency block present, timeout-minutes declared, all uses: pinned"
  - "actionlint passes on all three workflow files with zero errors"
  - "yamllint strict passes on all three workflow files"
  - "docs/runners.md created documenting the two manual runner registration commands with apple-silicon label"

files-to-touch:
  - ".github/workflows/reusable-gap-lifecycle.yml"
  - ".github/workflows/bootstrap-gaps-sweep.yml"
  - ".github/workflows/ci-gap-tools.yml"
  - "docs/runners.md"

files-not-to-touch:
  - "AGENTS.md"
  - "audit-log/**"
  - "scripts/update_gaps.py"
  - "scripts/bootstrap_gaps_sweep.py"

tests-required: |
  Run before opening PR:
    actionlint .github/workflows/reusable-gap-lifecycle.yml
    actionlint .github/workflows/bootstrap-gaps-sweep.yml
    actionlint .github/workflows/ci-gap-tools.yml
    yamllint -d strict .github/workflows/reusable-gap-lifecycle.yml
    yamllint -d strict .github/workflows/bootstrap-gaps-sweep.yml
    yamllint -d strict .github/workflows/ci-gap-tools.yml
  Paste the full output in the PR description under "Lint output".

standards:
  - "NIST SSDF PW.4 -- use vetted software only (no runtime curl-bash)"
  - "OpenSSF Scorecard: Pinned-Dependencies"

rollback: >
  Revert the PR. The sweep workflow will remain untriggered; gap lifecycle
  workflows will fail to queue until runners are re-registered manually.

labels:
  - "infrastructure"
  - "runners"

authorizes:
  - ".github/workflows/reusable-gap-lifecycle.yml"
  - ".github/workflows/bootstrap-gaps-sweep.yml"
  - ".github/workflows/ci-gap-tools.yml"
  - "docs/runners.md"

requires-human-after: "review"

---

## Context

Three workflows were added in commit `02b25cf` to support the gap analysis
standard. They work logically but violate several rules in
`.github/instructions/workflows.instructions.md`:

**Violation 1 -- curl at runtime (hard rule: no curl-bash)**
`reusable-gap-lifecycle.yml` step "Run update_gaps.py" does:
```yaml
run: |
  curl -fsSL \
    https://raw.githubusercontent.com/ruralpeds/.github/main/scripts/update_gaps.py \
    -o /tmp/update_gaps.py
  python3 /tmp/update_gaps.py ...
```
This fetches an unversioned remote script and executes it. Fix: add a step
that checks out the ruralpeds/.github repo at a pinned ref and runs the
script from the checked-out path.

**Violation 2 -- missing concurrency blocks**
All three workflows are missing `concurrency:`. For reusable workflows called
on `pull_request` events this means multiple runs can stack and all commit to
GAPS.md in parallel.

**Violation 3 -- missing timeout-minutes**
No job declares `timeout-minutes:`. Add realistic values:
- gap-lifecycle jobs: 10 minutes
- bootstrap-sweep job: 30 minutes
- ci-gap-tools jobs: 10 minutes

**Violation 4 -- bootstrap-gaps-sweep uses PAT not GitHub App token**
The sweep calls the GitHub API across all org repos. The instructions say:
"workflows that scan all org repos use a GitHub App token (TH_BOT_APP_ID /
TH_BOT_PRIVATE_KEY), never a long-lived PAT."
Replace `secrets.GH_PAT || secrets.GITHUB_TOKEN` with a GitHub App token
generated via `tibdex/github-app-token` (or equivalent pinned action).

**Runner registration (manual -- document in docs/runners.md)**
Runners are not yet registered at org scope with the `apple-silicon` label.
Copilot cannot execute commands on the Mac Studio; document the two commands
the human must run.

---

## Approach

### 1. Fix reusable-gap-lifecycle.yml

Replace the curl step with a checkout of the `.github` repo:

```yaml
- name: Checkout ruralpeds/.github for scripts
  uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
  with:
    repository: ruralpeds/.github
    path: .gap-scripts
    persist-credentials: false

- name: Run update_gaps.py
  id: run
  run: |
    MERGED_DATE=$(echo "${{ github.event.pull_request.merged_at }}" | cut -c1-10)
    python3 .gap-scripts/scripts/update_gaps.py \
      --gaps-file "${{ inputs.gaps_file }}" \
      --pr-body "${{ github.event.pull_request.body }}" \
      --pr-number "${{ github.event.pull_request.number }}" \
      --merged-date "$MERGED_DATE"
```

Add concurrency at workflow level:
```yaml
concurrency:
  group: gap-lifecycle-${{ github.repository }}-${{ github.event.pull_request.number }}
  cancel-in-progress: false   # never cancel mid-write to GAPS.md
```

Add `timeout-minutes: 10` to the job.

### 2. Fix bootstrap-gaps-sweep.yml

Generate a GitHub App token before the sweep step:

```yaml
- name: Generate GitHub App token
  id: app-token
  uses: actions/create-github-app-token@31c86eb3b33c9b601a1f60f98dcbfd1d70f379b4  # v1.10.3
  with:
    app-id: ${{ secrets.TH_BOT_APP_ID }}
    private-key: ${{ secrets.TH_BOT_PRIVATE_KEY }}
    owner: ruralpeds

- name: Run bootstrap sweep
  env:
    GH_PAT: ${{ steps.app-token.outputs.token }}
  run: |
    python3 scripts/bootstrap_gaps_sweep.py \
      --token "$GH_PAT" \
      --org ruralpeds \
      ${{ inputs.dry_run == 'true' && '--dry-run' || '' }} \
      ${{ inputs.repo != '' && format('--repo {0}', inputs.repo) || '' }}
```

Add concurrency:
```yaml
concurrency:
  group: gap-bootstrap-sweep
  cancel-in-progress: false
```

Add `timeout-minutes: 30` to the job.

### 3. Fix ci-gap-tools.yml

Add concurrency:
```yaml
concurrency:
  group: ci-gap-tools-${{ github.ref }}
  cancel-in-progress: true
```

Add `timeout-minutes: 10` to each job.

Remove the `curl` fetch of the test file. Instead use a second checkout:
```yaml
- name: Checkout gap-analysis-standard for tests
  uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
  with:
    repository: ruralpeds/gap-analysis-standard
    path: .gap-standard
    persist-credentials: false

- name: Run tests
  run: |
    cp .gap-standard/actions/update-gaps/test_update_gaps.py /tmp/
    sed -i 's|sys.path.insert(0.*)|sys.path.insert(0, "scripts")|' /tmp/test_update_gaps.py
    cd scripts && pytest /tmp/test_update_gaps.py -v --tb=short
```

### 4. Create docs/runners.md

Document the two runner registration commands. The MAC_STUDIO and MACBOOK_PRO
sections each show the exact bash invocation of `scripts/setup-mac-studio-runner.sh`
with `--scope org`, `--group mac-studio-medical`, and
`--labels "self-hosted,mac-studio,arm64,apple-silicon"` (or `macbook-pro`
variant). Include where to get the registration token and how to verify
the runner appears at org scope.

---

## Verification

```bash
# Lint all three workflows
actionlint .github/workflows/reusable-gap-lifecycle.yml
actionlint .github/workflows/bootstrap-gaps-sweep.yml
actionlint .github/workflows/ci-gap-tools.yml

# YAML strict
yamllint -d strict .github/workflows/reusable-gap-lifecycle.yml
yamllint -d strict .github/workflows/bootstrap-gaps-sweep.yml
yamllint -d strict .github/workflows/ci-gap-tools.yml

# Confirm no curl lines remain in any workflow
grep -n "curl" .github/workflows/reusable-gap-lifecycle.yml \
              .github/workflows/bootstrap-gaps-sweep.yml \
              .github/workflows/ci-gap-tools.yml
# expected: no output

# Confirm concurrency present in all three
grep -l "concurrency" .github/workflows/reusable-gap-lifecycle.yml \
                      .github/workflows/bootstrap-gaps-sweep.yml \
                      .github/workflows/ci-gap-tools.yml
# expected: all three filenames printed

# Confirm timeout-minutes present in all three
grep -l "timeout-minutes" .github/workflows/reusable-gap-lifecycle.yml \
                          .github/workflows/bootstrap-gaps-sweep.yml \
                          .github/workflows/ci-gap-tools.yml
# expected: all three filenames printed
```

Paste the full output of every command in the PR description under
"Verification output". All commands must exit 0 with zero warnings.

## References

- `.github/instructions/workflows.instructions.md` -- hard rules that apply here
- `scripts/setup-mac-studio-runner.sh` -- existing runner setup script
- `scripts/update_gaps.py` -- the script being fetched (do not modify)
- `ruralpeds/gap-analysis-standard/SPEC.md` -- gap standard specification
- GitHub docs: Reusing workflows
- GitHub docs: Using a GitHub App token in actions (tibdex/github-app-token)
