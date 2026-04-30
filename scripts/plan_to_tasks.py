#!/usr/bin/env python3
"""plan_to_tasks.py — Convert a Claude-authored build plan into copilot-tasks/*.md files.

The plan must follow the structure documented in docs/SPRINT_STANDARD.md §"Build plan
requirements". This script:

  1. Parses the plan markdown.
  2. Locates the "Phased build" section and walks each "### Phase NN — <name>" subsection.
  3. For each phase, extracts: the numbered step list, the "Done check:" line, the optional
     "Depends on:" line, and the optional "Parallelizable across <a, b, c>" line.
  4. Emits one task file per phase (or per fan-out item) into <repo>/copilot-tasks/phase-NN-<slug>/
     conforming to copilot-tasks/_schema.md.
  5. Idempotent: existing files with body comment `# converter-managed: false` are skipped.
     All other existing files are diffed and overwritten only if content has changed.

Usage:
    python plan_to_tasks.py --plan PATH --target-repo PATH [--dry-run]
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from textwrap import dedent
from typing import Any

import yaml


@dataclass
class Phase:
    number: str  # "00", "01", ...
    name: str  # "Bootstrap"
    slug: str  # "bootstrap"
    steps: list[str] = field(default_factory=list)
    done_check: str = ""
    depends_on: list[str] = field(default_factory=list)
    parallel_items: list[str] = field(default_factory=list)
    raw_body: str = ""


PHASE_HEADER_RE = re.compile(r"^### Phase (\d+)\s*[—\-:]\s*(.+?)\s*$", re.MULTILINE)
DONE_CHECK_RE = re.compile(
    r"(?:^|\n)\s*(?:[-*]\s*)?\*{0,2}Done check:?\*{0,2}\s*(.+?)(?:\n|$)",
    re.IGNORECASE,
)
DEPENDS_ON_RE = re.compile(r"Depends on:\s*(.+?)(?:\n|$)", re.IGNORECASE)
PARALLEL_RE = re.compile(
    r"[Pp]arallelizable[^\n]*?(?:across|over|by)\s+(?:the\s+)?(?:\d+\s+)?(?:agents?|domains?|items?)?[,:]?\s*(?:one per\s+)?([a-z][\w\s,/-]*?)(?:\n|\.|$)",
    re.IGNORECASE,
)
PARALLEL_LIST_RE = re.compile(
    r"^Parallel(?:izable)? (?:across|over|by) (?:the (?:following|seven|eight|nine|ten))?[:\s]+(.+?)$",
    re.IGNORECASE | re.MULTILINE,
)
NUMBERED_STEP_RE = re.compile(r"^\s*(\d+)\.\s+(.+?)$", re.MULTILINE)


def slugify(name: str) -> str:
    """Convert a phase name to a kebab-case slug, capped at ~30 chars."""
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    # Truncate after a reasonable length, ending on a word boundary.
    if len(s) > 30:
        cut = s[:30].rsplit("-", 1)[0]
        s = cut if cut else s[:30]
    return s


def find_phased_build_section(text: str) -> str:
    """Locate the section containing the Phased build content.

    We accept any heading whose text contains 'Phased build' or 'Phases' as the marker.
    Returns the text from that heading to the next ## heading.
    """
    pattern = re.compile(
        r"^##\s+\d+\.\s+(?:Phased\s+build|Phases?).*?$",
        re.MULTILINE | re.IGNORECASE,
    )
    m = pattern.search(text)
    if not m:
        raise ValueError(
            "Plan is missing a '## N. Phased build' section (required). "
            "See docs/SPRINT_STANDARD.md §'Build plan requirements'."
        )
    start = m.start()
    next_h2 = re.search(r"^##\s+\d+\.\s+", text[m.end() :], re.MULTILINE)
    end = m.end() + (next_h2.start() if next_h2 else len(text) - m.end())
    return text[start:end]


def parse_phase_block(num: str, name: str, body: str) -> Phase:
    slug = slugify(name)

    # Done check
    dc = DONE_CHECK_RE.search(body)
    done_check = dc.group(1).strip() if dc else ""
    if not done_check:
        raise ValueError(
            f"Phase {num} ({name}) is missing a 'Done check:' line. "
            "Every phase must declare a testable done condition."
        )

    # Depends on
    depends_on: list[str] = []
    do = DEPENDS_ON_RE.search(body)
    if do:
        # "Phase 0 merged" -> phase number; we'll resolve to slugs in the linker step.
        m = re.search(r"phase\s*(\d+)", do.group(1), re.IGNORECASE)
        if m:
            depends_on = [f"PHASE-{int(m.group(1)):02d}"]

    # Parallel fan-out — three detection strategies, in order of preference:
    # 1. Explicit marker line: `Fan out across: a, b, c`
    # 2. Prose: "Parallelizable across <list>"
    # 3. Loop in kickoff prose: "for X in a b c d"
    parallel_items: list[str] = []
    fan_out_re = re.compile(r"^Fan[- ]out across:\s*(.+?)$", re.IGNORECASE | re.MULTILINE)
    fo = fan_out_re.search(body)
    if fo:
        parallel_items = [s.strip() for s in re.split(r"[,;]| and ", fo.group(1)) if s.strip()]
    else:
        pl = PARALLEL_LIST_RE.search(body)
        if pl:
            parallel_items = [s.strip() for s in re.split(r"[,;]| and ", pl.group(1)) if s.strip()]
        else:
            # Fall back to detecting bash for-loops in the body.
            loop_re = re.compile(r"for\s+\w+\s+in\s+([a-z][\w\s-]+?);\s*do", re.IGNORECASE)
            lo = loop_re.search(body)
            if lo:
                parallel_items = [s.strip() for s in lo.group(1).split() if s.strip()]

    # Numbered steps
    steps = [m.group(2).strip() for m in NUMBERED_STEP_RE.finditer(body)]

    return Phase(
        number=num.zfill(2),
        name=name,
        slug=slug,
        steps=steps,
        done_check=done_check,
        depends_on=depends_on,
        parallel_items=parallel_items,
        raw_body=body.strip(),
    )


def parse_phases(text: str) -> list[Phase]:
    section = find_phased_build_section(text)
    phases: list[Phase] = []
    headers = list(PHASE_HEADER_RE.finditer(section))
    for i, h in enumerate(headers):
        start = h.end()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(section)
        body = section[start:end].strip()
        phases.append(parse_phase_block(h.group(1), h.group(2).strip(), body))
    if not phases:
        raise ValueError("No '### Phase NN' subsections found in 'Phased build' section.")
    return phases


def resolve_depends(phases: list[Phase]) -> None:
    """Resolve PHASE-NN tokens in depends_on to actual task slugs."""
    by_num = {p.number: p for p in phases}
    for p in phases:
        new_deps: list[str] = []
        for d in p.depends_on:
            m = re.match(r"PHASE-(\d+)", d)
            if m and m.group(1) in by_num:
                target = by_num[m.group(1)]
                if target.parallel_items:
                    # Depend on every fan-out child.
                    for item in target.parallel_items:
                        new_deps.append(f"phase-{target.number}-{target.slug}-{slugify(item)}")
                else:
                    new_deps.append(f"phase-{target.number}-{target.slug}")
            else:
                new_deps.append(d)
        p.depends_on = new_deps


def render_task_file(
    phase: Phase,
    item: str | None,
    standards: list[str],
    plan_path: str,
) -> tuple[str, str]:
    """Render (filename, content) for a single task file."""
    if item:
        slug = f"{phase.slug}-{slugify(item)}"
        title = f"[Phase {phase.number}/{item}] {phase.name}"
        approach_extra = f"\nThis task is the **{item}** fan-out of phase {phase.number}.\n"
    else:
        slug = phase.slug
        title = f"[Phase {phase.number}] {phase.name}"
        approach_extra = ""

    frontmatter: dict[str, Any] = {
        "title": title,
        "phase": f"phase-{phase.number}",
        "slug": slug,
        "preferred-agent": "copilot",
        "preflight-confirmation": False,
        "goal": phase.name,
        "acceptance-criteria": [phase.done_check],
        "files-to-touch": ["**"],  # Plan-level; task files may narrow this manually.
        "files-not-to-touch": [
            "AGENTS.md",
            ".github/copilot-instructions.md",
            "audit-log/**",
            "policies/**",
            "dhf/**",
        ],
        "tests-required": "Per the Done check in the issue body. CI must be green.",
        "rollback": "Revert the merge commit on this PR.",
        "estimated-complexity": "m",
    }
    if phase.depends_on:
        frontmatter["depends-on"] = phase.depends_on
    if standards:
        frontmatter["standards"] = standards

    fm_yaml = yaml.safe_dump(frontmatter, sort_keys=False, default_flow_style=False).strip()

    body = f"""---
{fm_yaml}
---

## Context

This task is generated from the plan at `{plan_path}`. Read that plan in full
before editing. The plan is the source of truth for architecture, file layout,
and acceptance criteria.

Standing rules from `AGENTS.md` and `.github/copilot-instructions.md` apply
and take precedence over anything in this task body if there is conflict.
{approach_extra}

## Approach

Execute the following steps in order. Stop after this phase. Do not start
the next phase even if it appears unblocked.

"""
    if phase.steps:
        for i, step in enumerate(phase.steps, 1):
            body += f"{i}. {step}\n"
    else:
        body += f"_No explicit steps in the plan for this phase. Use the plan section verbatim._\n\n```\n{phase.raw_body}\n```\n"

    body += f"""

## Verification

```bash
# Replace with the exact done-check command(s) from the plan.
# Done check from plan: {phase.done_check}
```

## References

- Build plan: `{plan_path}`
- Org standards: `AGENTS.md`, `.github/copilot-instructions.md`
- Task schema: `copilot-tasks/_schema.md`
"""

    filename = f"task-{phase.number}-{slug}.md"
    return filename, body


def write_tasks(
    phases: list[Phase],
    target_repo: Path,
    plan_path: str,
    standards: list[str],
    dry_run: bool,
) -> None:
    base = target_repo / "copilot-tasks"
    base.mkdir(parents=True, exist_ok=True)

    for phase in phases:
        phase_dir = base / f"phase-{phase.number}-{phase.slug}"
        phase_dir.mkdir(parents=True, exist_ok=True)

        items: list[str | None] = phase.parallel_items if phase.parallel_items else [None]
        for item in items:
            filename, content = render_task_file(phase, item, standards, plan_path)
            path = phase_dir / filename

            if path.exists():
                existing = path.read_text(encoding="utf-8")
                if "# converter-managed: false" in existing:
                    print(f"[skip] {path} (pinned)")
                    continue
                if existing == content:
                    print(f"[ok]   {path} (unchanged)")
                    continue
                action = "update"
            else:
                action = "create"

            if dry_run:
                print(f"[{action}] {path} (dry-run)")
            else:
                path.write_text(content, encoding="utf-8")
                print(f"[{action}] {path}")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--plan", required=True, help="Path to the build plan markdown file.")
    p.add_argument("--target-repo", required=True, help="Path to the target repo root.")
    p.add_argument(
        "--standards",
        default="",
        help="Comma-separated list of standards (e.g., 'CMS FY2026,IEC 62304').",
    )
    p.add_argument("--dry-run", action="store_true", help="Print what would be written.")
    args = p.parse_args()

    plan_path = Path(args.plan).resolve()
    target_repo = Path(args.target_repo).resolve()
    if not plan_path.exists():
        print(f"error: plan not found: {plan_path}", file=sys.stderr)
        return 2
    if not target_repo.is_dir():
        print(f"error: target repo not a directory: {target_repo}", file=sys.stderr)
        return 2

    text = plan_path.read_text(encoding="utf-8")
    phases = parse_phases(text)
    resolve_depends(phases)
    standards = [s.strip() for s in args.standards.split(",") if s.strip()]

    print(f"Found {len(phases)} phases in {plan_path.name}:")
    for ph in phases:
        suffix = f" (×{len(ph.parallel_items)} fan-out)" if ph.parallel_items else ""
        deps = f" depends-on={ph.depends_on}" if ph.depends_on else ""
        print(f"  phase-{ph.number} {ph.slug}{suffix}{deps}")

    write_tasks(phases, target_repo, str(plan_path.relative_to(target_repo) if target_repo in plan_path.parents else plan_path), standards, args.dry_run)
    return 0


if __name__ == "__main__":
    sys.exit(main())
