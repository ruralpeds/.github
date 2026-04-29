#!/usr/bin/env python3
"""seed_issues.py — Convert copilot-tasks/phase-NN-*/task-*.md into GitHub issues.

Each task file has YAML frontmatter describing the task; this script:

  1. Walks copilot-tasks/ (optionally filtered to one phase).
  2. For each task file, computes a stable canonical title.
  3. Checks whether an open or closed-within-90d issue exists for that title.
  4. If not, files a new issue using the agent-task template fields.
  5. Optionally assigns the new issue to a user (e.g. 'copilot').

Run via .github/workflows/seed-roadmap-issues.yml, or locally:

    GH_TOKEN=... python scripts/seed_issues.py --phase all --repo ruralpeds/.github

The script only READS when --dry-run is set. Otherwise it calls `gh issue create`
via subprocess. Never fails the workflow on a single task's failure; it reports
and continues.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from textwrap import dedent
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parent.parent
TASKS_DIR = ROOT / "copilot-tasks"


@dataclass
class Task:
    phase: str  # e.g. "phase-01-platform-hardening"
    slug: str  # e.g. "pin-actions-sha"
    path: Path
    frontmatter: dict[str, Any]
    body: str

    @property
    def phase_num(self) -> str:
        m = re.match(r"phase-(\d+)", self.phase)
        return m.group(1) if m else "00"

    @property
    def title(self) -> str:
        short = self.frontmatter.get("title", self.slug)
        return f"[agent-task] {self.phase}/{self.slug}: {short}"

    @property
    def labels(self) -> list[str]:
        base = [
            "agent-task",
            f"phase:{self.phase_num}",
            f"task:{self.slug}",
        ]
        extra = self.frontmatter.get("labels", []) or []
        return sorted(set(base + extra))

    @property
    def preferred_agent(self) -> str:
        return self.frontmatter.get("preferred-agent", "copilot")


def parse_task(path: Path) -> Task | None:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.DOTALL)
    if not m:
        print(f"[skip] {path} — no frontmatter", file=sys.stderr)
        return None
    try:
        fm = yaml.safe_load(m.group(1))
    except yaml.YAMLError as e:
        print(f"[skip] {path} — bad yaml: {e}", file=sys.stderr)
        return None
    if not isinstance(fm, dict):
        print(f"[skip] {path} — frontmatter is not a mapping", file=sys.stderr)
        return None
    phase = path.parent.name
    slug = fm.get("slug") or path.stem.split("-", 1)[1] if path.stem.startswith("task-") else path.stem
    return Task(phase=phase, slug=slug, path=path, frontmatter=fm, body=m.group(2).strip())


def discover(phase_filter: str) -> list[Task]:
    tasks: list[Task] = []
    if not TASKS_DIR.exists():
        print(f"[error] {TASKS_DIR} does not exist", file=sys.stderr)
        return tasks
    for phase_dir in sorted(TASKS_DIR.iterdir()):
        if not phase_dir.is_dir() or not phase_dir.name.startswith("phase-"):
            continue
        if phase_filter != "all" and phase_dir.name != phase_filter and not phase_dir.name.startswith(phase_filter):
            continue
        for task_file in sorted(phase_dir.glob("task-*.md")):
            t = parse_task(task_file)
            if t is not None:
                tasks.append(t)
    return tasks


def render_body(t: Task, repo: str) -> str:
    fm = t.frontmatter
    acceptance = fm.get("acceptance-criteria", [])
    allowed = fm.get("files-to-touch", [])
    forbidden = fm.get("files-not-to-touch", [])
    tests = fm.get("tests-required", "See task file.")
    standards = fm.get("standards", [])
    rollback = fm.get("rollback", "Revert the merge commit.")
    preflight = fm.get("preflight-confirmation", False)

    def bullets(items: Any) -> str:
        if isinstance(items, list):
            return "\n".join(f"- {x}" for x in items) or "_(none)_"
        return str(items)

    def checkboxes(items: Any) -> str:
        if isinstance(items, list):
            return "\n".join(f"- [ ] {x}" for x in items) or "_(none)_"
        return str(items)

    out = dedent(
        f"""\
        <!-- seeded-from: {t.path.relative_to(ROOT)} -->

        **Phase:** `{t.phase}` &nbsp;•&nbsp; **Slug:** `{t.slug}` &nbsp;•&nbsp; **Preferred agent:** `{t.preferred_agent}`

        **Linked task file:** [`{t.path.relative_to(ROOT)}`](../blob/main/{t.path.relative_to(ROOT).as_posix()})

        **Preflight confirmation required:** `{str(preflight).lower()}`

        ---

        ## Goal

        {fm.get("goal", "(no goal stated — see task file)")}

        ## Acceptance criteria

        {checkboxes(acceptance)}

        ## Files the agent may modify

        {bullets(allowed)}

        ## Files the agent MUST NOT modify

        {bullets(forbidden)}

        Additionally, all paths listed in `AGENTS.md §4.3` are forbidden.

        ## Tests required

        {tests}

        ## Standards touched

        {bullets(standards)}

        ## Rollback

        {rollback}

        ---

        ### Task body

        {t.body}

        ---

        ### Agent execution contract

        1. Read `AGENTS.md`, `.github/copilot-instructions.md`, and every `.github/instructions/*.md` whose `applyTo` pattern matches any file you'll touch.
        2. Read the linked task file in full.
        3. Branch: `agent/{t.phase_num}/{t.slug}-<this-issue-number>`.
        4. One task per PR. Split follow-ups into new issues.
        5. Every acceptance criterion must be checked or explicitly explained before opening the PR.
        6. Fill the PR description template in full (see `.github/copilot-instructions.md`).
        7. If blocked, comment `ASK:`, `BLOCKED:`, `RISK:`, `SPLIT:`, or `DONE-PARTIAL:` per `AGENTS.md §10` and stop.

        _Issue auto-seeded from `{t.path.relative_to(ROOT)}` by `seed_issues.py`._
        """
    )
    return out


def existing_issue(repo: str, title: str) -> str | None:
    """Return issue number if an open or recently-closed issue with this exact title exists."""
    try:
        out = subprocess.run(
            [
                "gh",
                "issue",
                "list",
                "--repo",
                repo,
                "--state",
                "all",
                "--search",
                f'"{title}" in:title',
                "--limit",
                "5",
                "--json",
                "number,title,state,closedAt",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        data = json.loads(out.stdout)
        for row in data:
            if row["title"] == title:
                return str(row["number"])
    except subprocess.CalledProcessError as e:
        print(f"[warn] gh issue list failed: {e.stderr}", file=sys.stderr)
    return None


def create_issue(repo: str, task: Task, assign_to: str | None) -> str | None:
    body = render_body(task, repo)
    cmd = [
        "gh",
        "issue",
        "create",
        "--repo",
        repo,
        "--title",
        task.title,
        "--body",
        body,
    ]
    for lbl in task.labels:
        cmd.extend(["--label", lbl])
    if assign_to:
        cmd.extend(["--assignee", assign_to])
    try:
        out = subprocess.run(cmd, check=True, capture_output=True, text=True)
        url = out.stdout.strip()
        print(f"[created] {task.title} → {url}")
        return url
    except subprocess.CalledProcessError as e:
        print(f"[error] creating {task.title}: {e.stderr}", file=sys.stderr)
        return None


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--phase", default="all")
    p.add_argument("--repo", required=True)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--assign-to", default="")
    args = p.parse_args()

    tasks = discover(args.phase)
    print(f"Discovered {len(tasks)} task file(s) for phase filter {args.phase!r}")

    if not args.dry_run:
        # Collect every label that will be needed and ensure it exists in the repo.
        # gh label create --force is idempotent: creates if absent, updates if present.
        all_labels: set[str] = set()
        for t in tasks:
            all_labels.update(t.labels)
        # Standard label colour map — unknown labels get a neutral grey.
        colour_map = {
            "agent-task": "0075ca",
        }
        print(f"==> Ensuring {len(all_labels)} label(s) exist in {args.repo}...")
        for lbl in sorted(all_labels):
            colour = colour_map.get(lbl, "ededed")
            try:
                subprocess.run(
                    ["gh", "label", "create", lbl,
                     "--repo", args.repo,
                     "--color", colour,
                     "--force"],
                    check=True, capture_output=True, text=True,
                )
            except subprocess.CalledProcessError as e:
                print(f"[warn] could not ensure label {lbl!r}: {e.stderr.strip()}", file=sys.stderr)

    created = 0
    skipped = 0
    for t in tasks:
        if existing := existing_issue(args.repo, t.title):
            print(f"[skip] existing issue #{existing} for {t.title!r}")
            skipped += 1
            continue
        if args.dry_run:
            print(f"[dry-run] would create: {t.title}")
            continue
        if create_issue(args.repo, t, args.assign_to or None):
            created += 1

    print(f"\nSummary: created={created} skipped-existing={skipped} total-tasks={len(tasks)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
