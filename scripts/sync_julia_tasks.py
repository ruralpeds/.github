#!/usr/bin/env python3
"""
sync_julia_tasks.py — Peds → pedsedu-jl issue generator

Runs inside GitHub Actions after a push to timothyhartzog/Peds main.
Analyses the git diff, categorises every added/modified file, and opens
a single GitHub Issue in timothyhartzog/pedsedu-jl with a structured
task checklist so the Julia mirror stays in sync.

Environment variables (set by the workflow):
    GH_TOKEN      — PAT with repo scope on both repos
    PEDS_REPO     — owner/repo for the source (Peds)
    JULIA_REPO    — owner/repo for the target (pedsedu-jl)

Categories tracked:
    crates        — Rust library crates  →  Julia modules
    wasm          — WASM bindings        →  Julia FFI / pure-Julia ports
    decision-trees — clinical HTML trees →  Julia tree data structures
    content       — DOCX/MD guides       →  content sync
    components    — Svelte components     →  Julia web equivalents (Genie/Stipple)
    knowledge     — registry.json changes →  registry sync
    tests         — Rust/e2e tests       →  Julia test equivalents
    config        — Cargo.toml, CI, etc.  →  Project.toml / CI updates
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import textwrap
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import PurePosixPath

import requests

# ── Configuration ────────────────────────────────────────────

GH_TOKEN   = os.environ.get("GH_TOKEN", "")
PEDS_REPO  = os.environ.get("PEDS_REPO", "timothyhartzog/Peds")
JULIA_REPO = os.environ.get("JULIA_REPO", "timothyhartzog/pedsedu-jl")
API_BASE   = "https://api.github.com"

# Files/dirs to skip entirely (noise)
SKIP_PATTERNS = [
    r"^\.gitignore$",
    r"^LICENSE",
    r"^\.vscode/",
    r"^apps/web/package-lock\.json$",
    r"^apps/web/node_modules/",
    r"\.DS_Store$",
    r"^docs/TODO\.md$",        # internal tracker, not code
]

# ── Category definitions ─────────────────────────────────────

@dataclass
class Category:
    key: str
    label: str
    emoji: str
    julia_action: str
    patterns: list[str]
    files: list[str] = field(default_factory=list)

CATEGORIES = [
    Category(
        key="crates",
        label="Rust Crates → Julia Modules",
        emoji="🦀",
        julia_action="Create/update the equivalent Julia module in `src/`",
        patterns=[r"^crates/"],
    ),
    Category(
        key="wasm",
        label="WASM Bindings → Julia Functions",
        emoji="🔗",
        julia_action="Port the exported WASM function to a pure-Julia equivalent",
        patterns=[r"^crates/ped-wasm/", r"^apps/web/src/lib/wasm/"],
    ),
    Category(
        key="decision_trees",
        label="Decision Trees → Julia Tree Data",
        emoji="🌳",
        julia_action="Add the decision tree data to `content/interactive-decision-trees/` and create a Julia struct/parser",
        patterns=[
            r"^apps/web/static/decision-trees/",
            r"^content/interactive-decision-trees/",
        ],
    ),
    Category(
        key="content",
        label="Clinical Content → Content Sync",
        emoji="📚",
        julia_action="Sync the new content file to `content/` in pedsedu-jl and update ContentIndex",
        patterns=[
            r"^content/education-guides/",
            r"^content/textbooks/",
            r"^content/audio-textbooks/",
            r"^content/cheat-sheets/",
            r"^content/literature-reviews/",
            r"^content/module-source/",
        ],
    ),
    Category(
        key="components",
        label="Svelte Components → Julia Web Equivalents",
        emoji="🖥️",
        julia_action="Design the Julia/Genie.jl equivalent component or note as Svelte-only",
        patterns=[
            r"^apps/web/src/",
            r"\.svelte$",
            r"\.ts$",
        ],
    ),
    Category(
        key="knowledge",
        label="Knowledge Registry → Registry Sync",
        emoji="🗂️",
        julia_action="Update `registry.json` in pedsedu-jl and rebuild KnowledgeSync index",
        patterns=[
            r"^knowledge/",
            r"^docs/MODULE_REGISTRY",
        ],
    ),
    Category(
        key="tests",
        label="Tests → Julia Test Suite",
        emoji="🧪",
        julia_action="Write equivalent tests in `test/runtests.jl`",
        patterns=[
            r"^tests/",
            r"^crates/.*/tests/",
        ],
    ),
    Category(
        key="config",
        label="Build Config → Project.toml / CI",
        emoji="⚙️",
        julia_action="Update `Project.toml` deps or CI workflows in pedsedu-jl",
        patterns=[
            r"^Cargo\.toml$",
            r"^crates/.*/Cargo\.toml$",
            r"^\.github/workflows/",
            r"^playwright\.config",
        ],
    ),
]


# ── Helpers ──────────────────────────────────────────────────

def run(cmd: list[str]) -> str:
    """Run a git command and return stdout."""
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"⚠ Command failed: {' '.join(cmd)}", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
    return result.stdout.strip()


def get_changed_files() -> list[tuple[str, str]]:
    """
    Return [(status, filepath), ...] for the push.
    status: A = added, M = modified, D = deleted, R = renamed, etc.

    Supports manual override via SYNC_BASE_REF / SYNC_HEAD_REF env vars.
    """
    base_ref = os.environ.get("SYNC_BASE_REF", "").strip() or "HEAD~1"
    head_ref = os.environ.get("SYNC_HEAD_REF", "").strip() or "HEAD"

    # Resolve refs
    parent = run(["git", "rev-parse", base_ref])
    head   = run(["git", "rev-parse", head_ref])

    if not parent:
        # First commit — diff against empty tree
        parent = run(["git", "hash-object", "-t", "tree", "/dev/null"])
    if not head:
        head = "HEAD"

    print(f"🔍 Diffing {parent[:8]}..{head[:8]}")

    raw = run(["git", "diff", "--name-status", parent, head])
    if not raw:
        return []

    changes = []
    for line in raw.splitlines():
        parts = line.split("\t", 1)
        if len(parts) == 2:
            status, path = parts
            # Handle renames: R100\told\tnew
            if status.startswith("R"):
                # second tab-separated field is the new name
                subparts = line.split("\t")
                if len(subparts) >= 3:
                    path = subparts[2]
                status = "R"
            changes.append((status[0], path))

    return changes


def should_skip(filepath: str) -> bool:
    """Return True if the file is noise we don't track."""
    return any(re.search(p, filepath) for p in SKIP_PATTERNS)


def categorise(changes: list[tuple[str, str]]) -> dict[str, Category]:
    """Assign each changed file to one or more categories."""
    # Reset files lists
    for cat in CATEGORIES:
        cat.files = []

    for status, filepath in changes:
        if should_skip(filepath):
            continue

        matched = False
        for cat in CATEGORIES:
            if any(re.search(p, filepath) for p in cat.patterns):
                # Include status prefix for context
                label = {"A": "✨ NEW", "M": "✏️ MOD", "D": "🗑️ DEL", "R": "🔄 REN"}.get(status, status)
                cat.files.append(f"{label} `{filepath}`")
                matched = True

        if not matched:
            # Uncategorised — skip silently (README, misc docs, etc.)
            pass

    return {cat.key: cat for cat in CATEGORIES if cat.files}


def human_readable_path(filepath: str) -> str:
    """Extract a meaningful name from a file path."""
    p = PurePosixPath(filepath)
    stem = p.stem
    # Convert snake_case to Title Case
    return stem.replace("_", " ").title()


def extract_rust_functions(filepath: str) -> list[str]:
    """Extract pub fn signatures from a Rust file (best-effort)."""
    try:
        with open(filepath, "r") as f:
            content = f.read()
        fns = re.findall(r"pub\s+(?:async\s+)?fn\s+(\w+)\s*\(", content)
        return fns
    except Exception:
        return []


def build_issue_body(
    categories: dict[str, Category],
    commit_sha: str,
    commit_msg: str,
    commit_url: str,
) -> str:
    """Build a structured Markdown issue body."""

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    total_files = sum(len(c.files) for c in categories.values())

    lines = [
        f"## 🔄 Julia Mirror Task — {now}",
        "",
        f"> **Source commit:** [`{commit_sha[:8]}`]({commit_url})",
        f"> **Message:** {commit_msg}",
        f"> **Files changed:** {total_files}",
        "",
        "This issue was auto-generated by the `sync-julia-tasks` workflow. "
        "Each section below maps a change in **Peds** (Rust/SvelteKit) to the "
        "equivalent work needed in **pedsedu-jl** (Julia).",
        "",
        "---",
        "",
    ]

    for cat in categories.values():
        lines.append(f"### {cat.emoji} {cat.label}")
        lines.append("")
        lines.append(f"**Julia action:** {cat.julia_action}")
        lines.append("")

        for f in cat.files:
            lines.append(f"- [ ] {f}")

        lines.append("")

        # For crate changes, try to extract function signatures
        if cat.key == "crates":
            rust_files = [
                fp.strip().split("`")[1]
                for fp in cat.files
                if ".rs" in fp
            ]
            for rf in rust_files:
                fns = extract_rust_functions(rf)
                if fns:
                    lines.append(f"  **Public functions in `{rf}`:**")
                    for fn_name in fns:
                        lines.append(f"  - [ ] `{fn_name}()` → Julia equivalent")
                    lines.append("")

        lines.append("")

    # Mapping reference table
    lines.extend([
        "---",
        "",
        "### 📋 Quick Mapping Reference",
        "",
        "| Peds (Rust/Svelte) | pedsedu-jl (Julia) |",
        "|---|---|",
        "| `crates/ped-*/src/lib.rs` | `src/*.jl` modules |",
        "| `crates/ped-wasm/src/lib.rs` | Pure-Julia function ports |",
        "| `apps/web/static/decision-trees/*.html` | `content/interactive-decision-trees/` |",
        "| `content/education-guides/*.docx` | `content/education-guides/*.docx` |",
        "| `content/textbooks/*.docx` | `content/textbooks/*.docx` |",
        "| `content/audio-textbooks/*.docx` | `content/audio-textbooks/*.docx` |",
        "| `content/cheat-sheets/*.docx` | `content/cheat-sheets/*.docx` |",
        "| `knowledge/registry.json` | `registry.json` |",
        "| `tests/e2e/*.test.ts` | `test/runtests.jl` |",
        "| `Cargo.toml` | `Project.toml` |",
        "| `.github/workflows/*.yml` | `.github/workflows/*.yml` |",
        "",
        "---",
        "",
        "### 🏗️ Implementation Notes",
        "",
        "- **Rust crate → Julia module:** Each `pub fn` becomes a Julia function. "
        "Preserve the function name in `snake_case`. Match input/output types. "
        "Add docstrings with the same clinical context.",
        "- **WASM binding → Julia function:** No WASM needed in Julia — port the "
        "logic directly as a pure function. Add to `src/PedsEduJl.jl` exports.",
        "- **Decision tree HTML → Julia data:** Extract the clinical decision "
        "logic into a Julia-native data structure (`Dict`, `NamedTuple`, or "
        "custom struct). Consider JSON intermediate format.",
        "- **Content files:** Copy DOCX/MD files directly. Run "
        "`build_content_index()` after adding new files.",
        "- **Tests:** Mirror test cases. Use `@test` and `@testset` to match "
        "Rust `#[test]` blocks.",
        "",
        f"*Generated by [sync-julia-tasks.yml]"
        f"(https://github.com/{PEDS_REPO}/blob/main/.github/workflows/sync-julia-tasks.yml)*",
    ])

    return "\n".join(lines)


def create_github_issue(title: str, body: str, labels: list[str]) -> dict | None:
    """Create an issue in the Julia repo via GitHub API."""
    url = f"{API_BASE}/repos/{JULIA_REPO}/issues"
    headers = {
        "Authorization": f"token {GH_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    payload = {
        "title": title,
        "body": body,
        "labels": labels,
    }

    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    if resp.status_code == 201:
        data = resp.json()
        print(f"✅ Issue created: {data['html_url']}")
        return data
    else:
        print(f"❌ Failed to create issue: {resp.status_code}", file=sys.stderr)
        print(resp.text, file=sys.stderr)
        return None


def ensure_labels_exist(labels: list[str]) -> None:
    """Create issue labels in the Julia repo if they don't exist."""
    label_configs = {
        "sync-from-peds":    {"color": "1d76db", "description": "Auto-synced task from Peds repo"},
        "rust-to-julia":     {"color": "dea584", "description": "Rust code to port to Julia"},
        "content-sync":      {"color": "0e8a16", "description": "Content files to sync"},
        "decision-tree":     {"color": "d93f0b", "description": "Decision tree to mirror"},
        "wasm-port":         {"color": "f9d0c4", "description": "WASM binding to port"},
        "tests":             {"color": "bfd4f2", "description": "Test cases to write"},
        "config":            {"color": "c5def5", "description": "Build/CI config update"},
    }

    headers = {
        "Authorization": f"token {GH_TOKEN}",
        "Accept": "application/vnd.github+json",
    }

    for label in labels:
        if label not in label_configs:
            continue

        # Check if label exists
        url = f"{API_BASE}/repos/{JULIA_REPO}/labels/{label}"
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code == 404:
            # Create it
            cfg = label_configs[label]
            create_url = f"{API_BASE}/repos/{JULIA_REPO}/labels"
            payload = {"name": label, "color": cfg["color"], "description": cfg["description"]}
            requests.post(create_url, headers=headers, json=payload, timeout=15)
            print(f"  🏷️  Created label: {label}")


# ── Main ─────────────────────────────────────────────────────

def main():
    if not GH_TOKEN:
        print("❌ GH_TOKEN not set — cannot create issues.", file=sys.stderr)
        sys.exit(1)

    # Get commit info
    commit_sha = run(["git", "rev-parse", "HEAD"])
    commit_msg = run(["git", "log", "-1", "--pretty=%s"])
    commit_url = f"https://github.com/{PEDS_REPO}/commit/{commit_sha}"

    print(f"📦 Commit: {commit_sha[:8]} — {commit_msg}")

    # Get changed files
    changes = get_changed_files()
    if not changes:
        print("ℹ️  No file changes detected. Exiting.")
        sys.exit(0)

    print(f"📁 Files changed: {len(changes)}")

    # Categorise
    categories = categorise(changes)
    if not categories:
        print("ℹ️  No trackable changes (all noise/skipped). Exiting.")
        sys.exit(0)

    print(f"📊 Categories with changes: {', '.join(categories.keys())}")

    # Determine labels
    label_map = {
        "crates":         ["sync-from-peds", "rust-to-julia"],
        "wasm":           ["sync-from-peds", "wasm-port"],
        "decision_trees": ["sync-from-peds", "decision-tree"],
        "content":        ["sync-from-peds", "content-sync"],
        "components":     ["sync-from-peds", "rust-to-julia"],
        "knowledge":      ["sync-from-peds", "content-sync"],
        "tests":          ["sync-from-peds", "tests"],
        "config":         ["sync-from-peds", "config"],
    }

    all_labels = set()
    for key in categories:
        all_labels.update(label_map.get(key, ["sync-from-peds"]))
    all_labels = sorted(all_labels)

    # Build issue
    title = f"🔄 Mirror Peds → Julia: {commit_msg[:60]}"
    body = build_issue_body(categories, commit_sha, commit_msg, commit_url)

    print(f"\n{'='*60}")
    print(f"Issue title: {title}")
    print(f"Labels: {all_labels}")
    print(f"Body length: {len(body)} chars")
    print(f"{'='*60}\n")

    # Dry run — print and exit before any API calls
    dry_run = os.environ.get("DRY_RUN", "false").lower() == "true"
    if dry_run:
        print("🏃 DRY RUN — printing issue body without creating:\n")
        print(body)
        sys.exit(0)

    # Ensure labels exist (API call)
    ensure_labels_exist(all_labels)

    result = create_github_issue(title, body, all_labels)
    if result is None:
        sys.exit(1)


if __name__ == "__main__":
    main()
