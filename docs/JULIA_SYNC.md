# Julia Mirror Sync — Peds → pedsedu-jl

## Overview

Every push to `main` on **timothyhartzog/Peds** automatically creates a
structured GitHub Issue in **timothyhartzog/pedsedu-jl** with a task
checklist mapping each new or modified file to its Julia equivalent.

This keeps the two repositories in sync: everything that exists in the
Rust/SvelteKit codebase has a corresponding Julia implementation (or a
tracked task to build one).

## How It Works

```
┌──────────────┐    push to main    ┌────────────────────┐
│   Peds repo  │ ─────────────────→ │  GitHub Actions    │
│  (Rust/Svelte)│                   │  sync-julia-tasks  │
└──────────────┘                    └─────────┬──────────┘
                                              │
                                    analyses git diff
                                    categorises files
                                              │
                                              ▼
                                   ┌─────────────────────┐
                                   │  pedsedu-jl repo     │
                                   │  (new Issue created) │
                                   └─────────────────────┘
```

### Categories Tracked

| Category | Peds Source | Julia Target | Label |
|---|---|---|---|
| 🦀 Crates | `crates/ped-*/src/*.rs` | `src/*.jl` modules | `rust-to-julia` |
| 🔗 WASM | `crates/ped-wasm/`, `src/lib/wasm/` | Pure-Julia functions | `wasm-port` |
| 🌳 Decision Trees | `static/decision-trees/*.html` | Julia tree data structures | `decision-tree` |
| 📚 Content | `content/**/*.docx` / `*.md` | Direct copy + index rebuild | `content-sync` |
| 🖥️ Components | `apps/web/src/**/*.svelte` / `*.ts` | Julia web equiv (Genie.jl) | `rust-to-julia` |
| 🗂️ Knowledge | `knowledge/registry.json` | `registry.json` sync | `content-sync` |
| 🧪 Tests | `tests/`, crate tests | `test/runtests.jl` | `tests` |
| ⚙️ Config | `Cargo.toml`, CI workflows | `Project.toml`, CI | `config` |

### Issue Structure

Each auto-created issue includes:

1. **Commit reference** — link back to the exact Peds commit
2. **Categorised task lists** — checkboxes for every file to mirror
3. **Function extraction** — for Rust crates, lists every `pub fn` that needs a Julia port
4. **Mapping reference table** — quick lookup of Peds path → Julia path
5. **Implementation notes** — guidance on how to translate each category

## Setup (One-Time)

### 1. Create a Personal Access Token (PAT)

You need a PAT with `repo` scope that has access to **both** repositories.

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Create a **Fine-grained token** (or classic) with:
   - **Repository access:** `timothyhartzog/Peds` and `timothyhartzog/pedsedu-jl`
   - **Permissions:** `Issues: Read & Write`, `Contents: Read`
3. Copy the token

### 2. Add the Secret to the Peds Repo

1. Go to `https://github.com/timothyhartzog/Peds/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `CROSS_REPO_PAT`
4. Value: paste the PAT from step 1
5. Click **Add secret**

### 3. Verify

Push any change to `main`. The workflow should:
- Appear in the **Actions** tab
- Create issue labels in pedsedu-jl (first run)
- Create a structured issue with task checkboxes

## Manual Backfill

To generate issues for commits that predate the automation:

1. Go to **Actions → Manual Julia Sync**
2. Click **Run workflow**
3. Set `base_ref` and `head_ref` to the commit range you want
4. Optionally enable **dry run** to preview without creating an issue

### Examples

```bash
# All changes in the last 5 commits
base_ref: HEAD~5
head_ref: HEAD

# All changes since a specific tag or commit
base_ref: v1.0.0
head_ref: HEAD

# Changes between two commits
base_ref: abc1234
head_ref: def5678
```

## Files

```
.github/workflows/
├── sync-julia-tasks.yml    # Auto-trigger on push to main
└── manual-julia-sync.yml   # Manual dispatch for backfills
scripts/
└── sync_julia_tasks.py     # Diff analyser + issue creator
docs/
└── JULIA_SYNC.md           # This file
```

## Filtering

The script skips noise files:
- `.gitignore`, `LICENSE`, `.vscode/`
- `package-lock.json`, `node_modules/`
- `.DS_Store`
- `docs/TODO.md` (internal tracker)

If **all** changed files are noise, no issue is created.

## Troubleshooting

| Problem | Fix |
|---|---|
| Workflow doesn't trigger | Ensure the push is to `main` branch |
| "GH_TOKEN not set" | Add `CROSS_REPO_PAT` secret to Peds repo settings |
| "Failed to create issue: 404" | PAT needs `repo` scope on pedsedu-jl |
| "Failed to create issue: 403" | PAT may be expired — regenerate it |
| No issue created | All files may have been filtered as noise |
| Labels not created | PAT needs write access to pedsedu-jl issues |

## Customisation

### Adding New Categories

Edit `CATEGORIES` in `scripts/sync_julia_tasks.py`:

```python
Category(
    key="my_category",
    label="My Category → Julia Equivalent",
    emoji="🆕",
    julia_action="Description of what to do in Julia",
    patterns=[r"^path/pattern/"],
),
```

### Changing Skip Patterns

Edit `SKIP_PATTERNS` in the same file to add or remove files from filtering.

### Changing Labels

Edit `label_map` in `main()` and `label_configs` in `ensure_labels_exist()`.
