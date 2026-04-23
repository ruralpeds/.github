#!/usr/bin/env python3
"""Sync canonical Copilot assets from central .github repo to one target repo.

Environment:
  CENTRAL_DIR  absolute path to the checkout of ruralpeds/.github
  TARGET_DIR   absolute path to the checkout of the target repo (e.g., Peds)
  TARGET_REPO  "owner/name" slug of the target
  DRY_RUN      "true" to skip the push/PR step (prints the diff only)
  GH_TOKEN     PAT with contents:write on the target (used by git push)

The script copies each canonical asset to its corresponding path in the
target repo. If content changes, a branch ``chore/sync-copilot-assets-YYYYMMDD``
is created and pushed. The human owner reviews and merges.

Never overwrites a target file that contains an AUTO-SYNC-OPT-OUT marker:

    <!-- AUTO-SYNC-OPT-OUT -->

That gives repo owners a per-file escape hatch when they've diverged
intentionally.
"""

from __future__ import annotations

import datetime as dt
import os
import shutil
import subprocess
import sys
from pathlib import Path

OPT_OUT_MARKER = "AUTO-SYNC-OPT-OUT"

# (central relative path, target relative path, description)
ASSETS: list[tuple[str, str, str]] = [
    (
        "copilot-assets/project-docs-automation/copilot-instructions.md",
        ".github/copilot-instructions.md",
        "Copilot repo-wide context for project-docs automation",
    ),
    (
        "copilot-assets/project-docs-automation/instructions/project-docs-scripts.instructions.md",
        ".github/instructions/project-docs-scripts.instructions.md",
        "Copilot path-specific rules for .github/scripts/**/*.py",
    ),
    (
        "copilot-assets/project-docs-automation/prompts/install-project-docs.prompt.md",
        ".github/prompts/install-project-docs.prompt.md",
        "/install-project-docs slash command",
    ),
    (
        "copilot-assets/project-docs-automation/prompts/customize-project-docs.prompt.md",
        ".github/prompts/customize-project-docs.prompt.md",
        "/customize-project-docs slash command",
    ),
    (
        "copilot-assets/project-docs-automation/prompts/debug-project-docs.prompt.md",
        ".github/prompts/debug-project-docs.prompt.md",
        "/debug-project-docs slash command",
    ),
    (
        "copilot-assets/project-docs-automation/prompts/add-project-to-registry.prompt.md",
        ".github/prompts/add-project-to-registry.prompt.md",
        "/add-project-to-registry slash command",
    ),
]


def _run(args: list[str], cwd: Path | None = None, check: bool = True,
         capture: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(
        args, cwd=str(cwd) if cwd else None,
        capture_output=capture, text=True, check=check,
    )


def _has_opt_out(path: Path) -> bool:
    if not path.exists():
        return False
    try:
        return OPT_OUT_MARKER in path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return False


def _detect_existing_instructions_section(path: Path) -> bool:
    """True if the target file already has our appended section.

    We write our content under `## Project Documentation Automation`
    whenever the target already has a pre-existing copilot-instructions.md
    with different primary content. On subsequent runs we want to REPLACE
    just that section, not re-append.
    """
    if not path.exists():
        return False
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return False
    return "## Project Documentation Automation" in text


def _merge_copilot_instructions(central_body: str, existing: str) -> str:
    """Replace the `## Project Documentation Automation` section if present;
    otherwise append it at the end."""
    marker = "## Project Documentation Automation"
    if marker in existing:
        # Replace from the marker to the next top-level `## ` or EOF.
        pre, _, rest = existing.partition(marker)
        # Find next top-level ## (a `## ` at start of line) after our section
        lines = rest.splitlines(keepends=True)
        end_idx = len(lines)
        for i, line in enumerate(lines[1:], start=1):  # skip the marker line itself
            if line.startswith("## ") and not line.startswith("## Project Documentation Automation"):
                end_idx = i
                break
        post = "".join(lines[end_idx:])
        return pre.rstrip() + "\n\n" + central_body.strip() + "\n\n" + post.lstrip()
    # No existing section — append under a horizontal rule.
    return existing.rstrip() + "\n\n---\n\n" + central_body.strip() + "\n"


def _sync_one(src: Path, dst: Path, is_copilot_instructions: bool,
              dry_run: bool) -> tuple[bool, str]:
    """Return (changed, status_message)."""
    dst.parent.mkdir(parents=True, exist_ok=True)

    if _has_opt_out(dst):
        return (False, f"skip (opt-out marker present): {dst}")

    central = src.read_text(encoding="utf-8")

    if is_copilot_instructions and dst.exists():
        existing = dst.read_text(encoding="utf-8", errors="replace")
        # Only merge/append if the target clearly has its own primary content
        # (more than a stub). Otherwise just overwrite.
        has_primary = len(existing.strip().splitlines()) > 5 and \
            "## Project Documentation Automation" not in existing[:200]
        if has_primary:
            new_content = _merge_copilot_instructions(central, existing)
        else:
            new_content = _merge_copilot_instructions(central, existing) \
                if "## Project Documentation Automation" in existing \
                else central
    else:
        new_content = central

    if dst.exists() and dst.read_text(encoding="utf-8", errors="replace") == new_content:
        return (False, f"unchanged: {dst}")

    if dry_run:
        return (True, f"WOULD UPDATE: {dst}")

    dst.write_text(new_content, encoding="utf-8")
    return (True, f"updated: {dst}")


def main() -> int:
    central_dir = Path(os.environ["CENTRAL_DIR"]).resolve()
    target_dir = Path(os.environ["TARGET_DIR"]).resolve()
    target_repo = os.environ["TARGET_REPO"]
    dry_run = (os.environ.get("DRY_RUN", "false") or "false").lower() == "true"

    print(f"Syncing into {target_repo}")
    print(f"  central: {central_dir}")
    print(f"  target:  {target_dir}")
    print(f"  dry_run: {dry_run}")
    print()

    changes: list[str] = []
    for src_rel, dst_rel, description in ASSETS:
        src = central_dir / src_rel
        dst = target_dir / dst_rel
        if not src.exists():
            print(f"::warning::missing in central: {src_rel}")
            continue
        is_copilot = dst_rel.endswith("copilot-instructions.md")
        changed, msg = _sync_one(src, dst, is_copilot, dry_run)
        prefix = "  CHG " if changed else "  ok  "
        print(f"{prefix}{description}")
        print(f"       {msg}")
        if changed:
            changes.append(dst_rel)

    if not changes:
        print("\nNo changes to push.")
        return 0

    if dry_run:
        print(f"\nDry run: {len(changes)} file(s) would change.")
        return 0

    # Stage, commit, push to a branch and open a PR via gh CLI.
    branch = f"chore/sync-copilot-assets-{dt.datetime.utcnow():%Y%m%d-%H%M%S}"

    _run(["git", "config", "user.name",  "github-actions[bot]"], cwd=target_dir)
    _run(["git", "config", "user.email",
          "41898282+github-actions[bot]@users.noreply.github.com"], cwd=target_dir)
    _run(["git", "checkout", "-b", branch], cwd=target_dir)
    _run(["git", "add"] + changes, cwd=target_dir)
    commit_msg = (
        "chore: sync Copilot assets from ruralpeds/.github\n\n"
        f"Files updated ({len(changes)}):\n"
        + "\n".join(f"  - {c}" for c in changes)
        + "\n\n"
        "Source of truth: https://github.com/ruralpeds/.github/tree/"
        "main/copilot-assets/\n\n"
        "To opt this repo's file out of future sync, add the marker\n"
        "`<!-- AUTO-SYNC-OPT-OUT -->` anywhere in the file."
    )
    _run(["git", "commit", "-m", commit_msg], cwd=target_dir)
    _run(["git", "push", "origin", branch], cwd=target_dir)

    # Open a PR via gh CLI (GH_TOKEN is already in env).
    pr_body = (
        f"Automated sync from `ruralpeds/.github`.\n\n"
        f"**Files updated:**\n"
        + "\n".join(f"- `{c}`" for c in changes)
        + "\n\n"
        "**To opt out** per-file: add `<!-- AUTO-SYNC-OPT-OUT -->` "
        "anywhere in the target file.\n\n"
        "**To opt this repo out entirely:** remove it from the `matrix.target` "
        "list in `.github/workflows/sync-copilot-assets.yml` of the central repo."
    )
    _run([
        "gh", "pr", "create",
        "--repo", target_repo,
        "--head", branch,
        "--base", "main",
        "--title", "chore: sync Copilot assets from central .github repo",
        "--body", pr_body,
    ], cwd=target_dir)

    print(f"\nOpened PR on {target_repo} from branch {branch}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
