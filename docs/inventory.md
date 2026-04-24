# Running the Workflow Inventory

## TL;DR

```bash
# one-time setup
gh auth login                       # if not already
python3 -m pip install --user pyyaml

# run the inventory
cd ~/some-scratch-dir
curl -sL https://raw.githubusercontent.com/ruralpeds/.github/main/scripts/inventory_workflows.py \
   -o inventory_workflows.py
chmod +x inventory_workflows.py

./inventory_workflows.py \
    --owners timothyhartzog,ruralpeds \
    --output gh-inventory.json \
    --redact \
    --skip-archived
```

Then upload `gh-inventory.json` into the chat. If it's over ~20 MB, zip it
first: `zip gh-inventory.json.zip gh-inventory.json`.

## Before you share it

The `--redact` flag scrubs known secret patterns (Anthropic, OpenAI, AWS,
GitHub tokens, PEM keys, Slack tokens) from workflow content. The script
reports how many redactions happened at the end. Spot-check the file:

```bash
jq '.summary' gh-inventory.json
jq '.namespaces.timothyhartzog.repos[] | {name, workflow_count: (.workflows | length)}' gh-inventory.json | head -40
```

Open it in an editor and skim for anything sensitive that slipped through
(internal URLs, hospital names, server hostnames, real MRNs in test
fixtures, etc.). If you find something, re-run with a custom redaction or
edit the JSON before sharing.

## What the inventory covers

**Per repo** (both namespaces):
- Visibility, default branch, language, size, timestamps, topics, archived flag
- Branch protection rules on the default branch (status checks, admin
  enforcement, required PR reviews, required signatures, linear history,
  force-push policy)
- Security features (secret scanning, push protection, dependabot)
- Actions secrets and variables (names only — values are never exposed)
- Self-hosted runners registered at the repo level
- Every `.github/workflows/*.yml` file — path, sha, size, parsed metadata
  (name, triggers, jobs, uses references, runs-on targets), full content
- Presence and content of: `.github/AUDIT.yaml`, `.github/phi-patterns.yml`,
  `SECURITY.md`, `CITATION.cff`, `CITATIONS.md`, `REFERENCES.md`, `SOURCES.md`
- First 1.5 KB of the README (for classification hints)

**Org-only scope** (just for `ruralpeds`):
- Runner groups (with visibility + workflow restrictions)
- Org-level self-hosted runners
- Org Actions secrets and variables (names)
- Registered required workflows

**Global summary**:
- Total repo count, workflow count, repos with audit, repos with branch
  protection, redaction count, errors

## What I'll do with it

Once you paste it back or attach it to a message, I'll produce:

1. **Per-repo migration map** — three-column: *current workflows* → *what
   to delete because it's covered by the new required workflows* →
   *what needs to stay and why*.
2. **Risk-ordered consolidation plan** — which repos to migrate first
   (low-risk), which last (clinical / FDA). I'll match against the
   classification cheatsheet in the main README.
3. **Deprecated-action report** — any workflows still using `actions/*@v2`
   or similar old pins that should be bumped.
4. **Security-posture gap list** — repos without branch protection,
   without required signatures (where Class II+ demands it), without
   secret scanning, etc.
5. **Runner-label audit** — confirms your existing workflows can all
   target `mac-studio` / `arm64` once the runners are up, or flags the
   ones that need `ubuntu-latest` externally (e.g., for Pages deploy).
6. **Namespace migration list** — concrete set of repos to `gh repo
   transfer` from `timothyhartzog/*` to `ruralpeds/*`, with rationale.

## Troubleshooting

**"gh CLI not authenticated"**
→ `gh auth login` and pick "GitHub.com", HTTPS, login with web browser.

**"403 rate limit exceeded"**
→ The script auto-sleeps 60s and retries once. If it keeps hitting, you
probably have a massive repo list; reduce `--workers` to 2 or run the two
namespaces separately.

**"404 on /orgs/ruralpeds/actions/required_workflows"**
→ Expected if you haven't registered any required workflows yet; the
script handles it gracefully.

**Output file too large to share**
→ Zip it. If still too big, run with `--owners timothyhartzog` and
`--owners ruralpeds` separately and share each.

**Workflows contain truly confidential logic you can't share**
→ Edit specific files out of the JSON after generation. The structure is
just `namespaces → repos → workflows[]`; you can `jq 'del(.namespaces.X.repos[N].workflows[M].content)'`
to null specific contents while preserving metadata.
