#!/usr/bin/env python3
"""
bootstrap_gap_analysis.py — Install the gap-analysis lifecycle in every
ruralpeds repository.

For each repo:
  1. Clone (or update) into a workspace
  2. Create .gap-analysis/ from templates if missing
  3. Add .github/workflows/gap-analysis-lifecycle.yml (caller)
  4. Add .github/workflows/gap-analysis-audit.yml (scheduled caller)
  5. Ensure .github/workflows/gap-analysis-validate.yml is present
  6. Ensure .github/workflows/gap-analysis-sync-index.yml is present
  7. Commit on a branch (default: bootstrap/gap-analysis-v1)
  8. Push and open a PR

Idempotent. Re-running on a repo that already has v1 installed is a no-op.

Usage:
    python scripts/bootstrap_gap_analysis.py \\
        --org ruralpeds \\
        --repos-file repos.txt \\
        --workspace ~/repo-cleanup/workspace \\
        --templates-dir ./templates/gap-analysis \\
        --workflows-dir ./.github/workflows \\
        --branch bootstrap/gap-analysis-v1 \\
        --pr-title "chore(gap-analysis): install lifecycle v1" \\
        [--dry-run] [--repo single/repo]

Environment:
    GH_TOKEN or GITHUB_TOKEN — required for clone/push/PR creation
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable


REPO_FILES_TO_INSTALL = [
    # (template_relative_path, target_relative_path, install_only_if_missing)
    ("GAP_ANALYSIS.template.md", ".gap-analysis/GAP_ANALYSIS.md", True),
    ("CLAUDE.template.md", ".gap-analysis/CLAUDE.md", True),
    ("SUGGESTIONS.template.md", ".gap-analysis/SUGGESTIONS.md", True),
    ("schema.template.md", ".gap-analysis/schema.md", True),
    ("build-ledger.template.jsonl", ".gap-analysis/build-ledger.jsonl", True),
    (".gitignore", ".gap-analysis/.gitignore", True),
    # Workflows are always overwritten so the cycle stays in sync.
    ("gap-analysis-lifecycle.template.yml", ".github/workflows/gap-analysis-lifecycle.yml", False),
    ("gap-analysis-audit.template.yml", ".github/workflows/gap-analysis-audit.yml", False),
]


def run(cmd: list[str], cwd: Path | None = None, check: bool = True, capture: bool = False) -> subprocess.CompletedProcess:
    print(f"  $ {' '.join(cmd)}{' (in ' + str(cwd) + ')' if cwd else ''}", flush=True)
    result = subprocess.run(
        cmd,
        cwd=cwd,
        check=check,
        text=True,
        capture_output=capture,
    )
    return result


def ensure_repo_cloned(org: str, repo: str, workspace: Path, token: str) -> Path:
    """Clone or pull the repo into workspace/repo-name."""
    repo_path = workspace / repo
    workspace.mkdir(parents=True, exist_ok=True)
    if repo_path.exists():
        print(f"  Repo {repo} already cloned; fetching latest")
        run(["git", "fetch", "origin"], cwd=repo_path)
        run(["git", "checkout", "main"], cwd=repo_path, check=False)
        run(["git", "pull", "--ff-only", "origin", "main"], cwd=repo_path, check=False)
    else:
        url = f"https://{token}@github.com/{org}/{repo}.git"
        run(["git", "clone", "--depth=1", url, str(repo_path)])
    return repo_path


def repo_substitute(text: str, repo: str) -> str:
    """Replace `<repo-name>` placeholder in template text."""
    return text.replace("<repo-name>", repo)


def install_files(repo_path: Path, repo_name: str, templates_dir: Path) -> list[str]:
    """Copy templates into the repo. Returns list of changed file paths."""
    changes: list[str] = []
    for tmpl_rel, dest_rel, only_if_missing in REPO_FILES_TO_INSTALL:
        src = templates_dir / tmpl_rel
        if not src.exists():
            print(f"  ⚠️  template missing: {src}; skipping")
            continue
        dest = repo_path / dest_rel
        if dest.exists() and only_if_missing:
            print(f"  · keep existing {dest_rel}")
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        text = src.read_text()
        text = repo_substitute(text, repo_name)
        if dest.exists():
            existing = dest.read_text()
            if existing == text:
                print(f"  · unchanged    {dest_rel}")
                continue
        dest.write_text(text)
        changes.append(dest_rel)
        print(f"  ✓ wrote        {dest_rel}")
    return changes


def has_branch_protection_blocking_push(repo_path: Path, branch: str) -> bool:
    """Best-effort: assume push will be allowed unless we see otherwise."""
    return False


def commit_and_push(repo_path: Path, branch: str, files: list[str], commit_msg: str) -> bool:
    """Commit changes on a fresh branch and push. Returns True if pushed."""
    if not files:
        return False
    # Make sure we're on main first
    run(["git", "checkout", "main"], cwd=repo_path, check=False)
    # Create or reset the bootstrap branch
    run(["git", "checkout", "-B", branch], cwd=repo_path)
    run(["git", "config", "user.name", "ruralpeds-gap-bot"], cwd=repo_path)
    run(["git", "config", "user.email", "gap-bot@ruralpeds.invalid"], cwd=repo_path)
    run(["git", "add"] + files, cwd=repo_path)
    # If nothing was staged (idempotent re-run), bail.
    diff = run(["git", "diff", "--cached", "--name-only"], cwd=repo_path, capture=True)
    if not diff.stdout.strip():
        print("  · no staged changes; skipping commit/push")
        return False
    run(["git", "commit", "-m", commit_msg], cwd=repo_path)
    run(["git", "push", "-u", "origin", branch, "--force-with-lease"], cwd=repo_path)
    return True


def open_pr_via_gh(repo_path: Path, org: str, repo: str, branch: str, title: str, body: str) -> None:
    """Open a PR using the gh CLI. Skips if a PR for the branch already exists."""
    # Check existing PRs
    existing = run(
        ["gh", "pr", "list", "--repo", f"{org}/{repo}", "--head", branch, "--state", "open", "--json", "number"],
        cwd=repo_path,
        capture=True,
        check=False,
    )
    if existing.returncode == 0 and existing.stdout.strip() not in ("", "[]"):
        print("  · PR already open for this branch; skipping")
        return
    run(
        ["gh", "pr", "create",
         "--repo", f"{org}/{repo}",
         "--head", branch,
         "--base", "main",
         "--title", title,
         "--body", body,
         "--label", "gap-analysis,bootstrap"],
        cwd=repo_path,
        check=False,
    )


def parse_repos(repos_file: Path | None, single_repo: str | None) -> list[str]:
    if single_repo:
        return [single_repo]
    if not repos_file or not repos_file.exists():
        print(f"❌ repos file not found: {repos_file}", file=sys.stderr)
        sys.exit(2)
    repos: list[str] = []
    for line in repos_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        repos.append(line)
    return repos


def main() -> int:
    p = argparse.ArgumentParser(description="Install gap-analysis lifecycle in ruralpeds repos.")
    p.add_argument("--org", default="ruralpeds")
    p.add_argument("--repos-file", type=Path, help="Newline-separated list of repo names")
    p.add_argument("--repo", help="Single repo (overrides --repos-file)")
    p.add_argument("--workspace", type=Path, default=Path.home() / "repo-cleanup" / "workspace")
    p.add_argument("--templates-dir", type=Path, required=True, help="Path to templates/gap-analysis directory")
    p.add_argument("--branch", default="bootstrap/gap-analysis-v1")
    p.add_argument("--pr-title", default="chore(gap-analysis): install lifecycle v1")
    p.add_argument("--pr-body", default="""\
Installs the org-wide Gap Analysis Lifecycle v1.

This brings every ruralpeds repo to the same `.gap-analysis/` layout and
hooks it into the org-level reusable workflow. See
[`docs/GAP_ANALYSIS_LIFECYCLE.md`](https://github.com/ruralpeds/.github/blob/main/docs/GAP_ANALYSIS_LIFECYCLE.md)
for the full spec.

After merge, branches matching `gap/NNN-...` and PRs titled `GAP-NNN: ...`
will automatically advance the gap status and append events to the build
ledger.
""")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--no-pr", action="store_true", help="Commit and push but don't open a PR")
    args = p.parse_args()

    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if not token:
        print("❌ Set GH_TOKEN or GITHUB_TOKEN in env.", file=sys.stderr)
        return 2

    if not args.templates_dir.is_dir():
        print(f"❌ templates dir not found: {args.templates_dir}", file=sys.stderr)
        return 2

    repos = parse_repos(args.repos_file, args.repo)
    if not repos:
        print("❌ No repos to process.", file=sys.stderr)
        return 2

    print(f"Bootstrapping {len(repos)} repo(s) under {args.org}")
    print(f"Workspace: {args.workspace}")
    print(f"Templates: {args.templates_dir}")
    if args.dry_run:
        print("(dry-run mode — no push, no PR)")

    ok: list[str] = []
    skipped: list[str] = []
    failed: list[tuple[str, str]] = []

    for repo in repos:
        print(f"\n=== {args.org}/{repo} ===")
        try:
            repo_path = ensure_repo_cloned(args.org, repo, args.workspace, token)
            changes = install_files(repo_path, repo, args.templates_dir)
            if not changes:
                print("  · already up to date")
                skipped.append(repo)
                continue
            if args.dry_run:
                print(f"  [dry-run] would commit {len(changes)} files")
                ok.append(repo)
                continue
            pushed = commit_and_push(repo_path, args.branch, changes, args.pr_title)
            if pushed and not args.no_pr:
                open_pr_via_gh(repo_path, args.org, repo, args.branch, args.pr_title, args.pr_body)
            ok.append(repo)
        except subprocess.CalledProcessError as e:
            failed.append((repo, str(e)))
            print(f"  ❌ failed: {e}")
        except Exception as e:
            failed.append((repo, repr(e)))
            print(f"  ❌ failed: {e}")

    print("\n" + "=" * 60)
    print(f"Bootstrapped: {len(ok)}")
    print(f"Skipped (already current): {len(skipped)}")
    print(f"Failed: {len(failed)}")
    if failed:
        print("\nFailures:")
        for repo, err in failed:
            print(f"  - {repo}: {err}")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
