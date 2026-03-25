#!/usr/bin/env python3
"""
PED CDS Education Build System
================================
Monitors two source folders for new DOCX education files,
deploys them to the static site, registers new topics in the
website, and keeps a timestamped build log.

FOLDER LAYOUT
-------------
build-queue/
  to-build/              ← drop DOCX files here to deploy/update
  built/                 ← processed files are moved here

add-education/
  incoming/              ← drop NEW topic DOCX files here
  educational-material/  ← processed files are moved here

FILE NAMING CONVENTION
----------------------
Files must follow the pattern:
  <topic_key>_cheat_sheet.docx
  <topic_key>_textbook.docx
  <topic_key>_audio_textbook.docx

Examples:
  neonatal_pulmonary_disorders_cheat_sheet.docx
  pediatric_sepsis_textbook.docx
  critical_care_stabilization_audio_textbook.docx

Topic keys starting with neonatal_/newborn_/maternal_ → neonatal mode
Topic keys starting with pediatric_/pals_             → pediatric mode

USAGE
-----
  python scripts/build_education.py            # process all new files once
  python scripts/build_education.py --watch    # watch mode, poll every 30 s
  python scripts/build_education.py --status   # print recent build log
  python scripts/build_education.py --dry-run  # show what would happen, no changes
"""

import os
import sys
import json
import shutil
import hashlib
import argparse
import re
from datetime import datetime
from pathlib import Path


# ─────────────────────────────────────────────
#  PATHS
# ─────────────────────────────────────────────
ROOT       = Path(__file__).parent.parent.resolve()
STATIC     = ROOT / "apps" / "web" / "static"
EDUCATION  = STATIC / "education"
INDEX_HTML = STATIC / "index.html"
EDU_INDEX  = EDUCATION / "index.html"
BUILD_LOG  = ROOT / "build-log.json"

TO_BUILD   = ROOT / "build-queue" / "to-build"
BUILT      = ROOT / "build-queue" / "built"
INCOMING   = ROOT / "add-education" / "incoming"
PROCESSED  = ROOT / "add-education" / "educational-material"


# ─────────────────────────────────────────────
#  CONSTANTS
# ─────────────────────────────────────────────
# Maps filename suffix → (static subfolder, eduMode key)
SUFFIX_TO_FOLDER = {
    "_cheat_sheet.docx":    ("cheat-sheets",    "cs"),
    "_textbook.docx":       ("textbooks",        "tb"),
    "_audio_textbook.docx": ("audio-textbooks",  "au"),
}

ICON_MAP = {
    "pulmonary": "🫁",  "respiratory": "🫁",
    "infectious": "🦠", "infection": "🦠",
    "hematology": "🩸", "blood": "🩸",
    "neurology": "🧠",  "seizure": "🧠",
    "fen": "💧",        "fluid": "💧",   "electrolyte": "💧",
    "gi": "🔬",         "liver": "🔬",   "gastro": "🔬",
    "endocrine": "⚗️",  "glucose": "⚗️", "dka": "⚗️",
    "renal": "🫘",      "kidney": "🫘",
    "surgical": "🔪",   "surgery": "🔪",
    "skin": "🩹",       "derm": "🩹",
    "urology": "🏥",    "urine": "🏥",
    "critical": "🚨",   "resuscitation": "🚨",
    "pals": "⚡",       "nrp": "⚡",
    "maternal": "🤰",   "obstetric": "🤰",
    "ventilation": "💨","airway": "💨",
    "cardiac": "❤️",    "heart": "❤️",
    "trauma": "🚑",
    "sepsis": "🩸",     "shock": "🩸",
    "anaphylaxis": "⚠️",
    "burn": "🔥",
    "toxicology": "☠️",
    "psychiatric": "🧩","psych": "🧩",
    "ortho": "🦴",      "fracture": "🦴",
    "pain": "💊",       "sedation": "💊",
    "transport": "🚑",
    "discharge": "🏠",  "screening": "🧬",
    "nows": "💊",       "nas": "💊",
    "ophthalmology": "👁️", "rop": "👁️",
    "siadh": "🧪",      "csw": "🧪",
}


# ─────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────
def file_md5(path: Path) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def load_log() -> dict:
    if BUILD_LOG.exists():
        with open(BUILD_LOG, encoding="utf-8") as f:
            return json.load(f)
    return {"builds": []}


def save_log(log: dict):
    with open(BUILD_LOG, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)


def is_new_file(filename: str, src_path: Path, log: dict) -> bool:
    """Return True if file has never been built or its content has changed."""
    prior = [b for b in log["builds"] if b["filename"] == filename]
    if not prior:
        return True
    return prior[-1]["md5"] != file_md5(src_path)


def parse_docx_filename(filename: str):
    """
    Parse a DOCX filename into (topic_key, edu_key, static_folder).
    Returns None if the filename doesn't match the expected convention.
    """
    for suffix, (folder, edu_key) in SUFFIX_TO_FOLDER.items():
        if filename.lower().endswith(suffix):
            topic_key = filename[: -len(suffix)]
            return topic_key, edu_key, folder
    return None


def infer_mode(topic_key: str) -> str:
    """Guess neonatal vs pediatric from the topic key prefix."""
    k = topic_key.lower()
    if any(k.startswith(p) for p in ("neonatal_", "newborn_", "maternal_", "nrp_")):
        return "neonatal"
    if any(k.startswith(p) for p in ("pediatric_", "pals_")):
        return "pediatric"
    # Fallback heuristic
    if "neonatal" in k or "newborn" in k or "maternal" in k:
        return "neonatal"
    return "pediatric"


def friendly_name(topic_key: str) -> str:
    """Convert snake_case topic key to a readable display name."""
    name = topic_key
    for prefix in ("neonatal_", "newborn_", "pediatric_"):
        if name.lower().startswith(prefix):
            name = name[len(prefix):]
            break
    return name.replace("_", " ").title()


def guess_icon(topic_key: str) -> str:
    lower = topic_key.lower()
    for kw, icon in ICON_MAP.items():
        if kw in lower:
            return icon
    return "📋"


# ─────────────────────────────────────────────
#  WEBSITE REGISTRATION
# ─────────────────────────────────────────────
def topic_in_main_index(topic_key: str) -> bool:
    if not INDEX_HTML.exists():
        return False
    return f'cs:"{topic_key}"' in INDEX_HTML.read_text(encoding="utf-8")


def add_to_main_index(topic_key: str, mode: str, dry_run: bool) -> bool:
    """
    Insert a new entry into the eduTopics array in apps/web/static/index.html.
    Finds the closing ]; that ends eduTopics and inserts just before it.
    """
    if not INDEX_HTML.exists():
        return False
    content = INDEX_HTML.read_text(encoding="utf-8")
    if f'cs:"{topic_key}"' in content:
        return False   # already registered

    name = friendly_name(topic_key)
    icon = guess_icon(topic_key)
    entry = (
        f'  {{m:"{mode}",n:"{name}",i:"{icon}",'
        f'cs:"{topic_key}",tb:"{topic_key}",au:"{topic_key}"}},\n'
    )

    # Find the closing ]; of eduTopics (it's the ]; just before "var BROSELOW")
    broselow_pos = content.find("var BROSELOW")
    if broselow_pos == -1:
        return False
    close_bracket = content.rfind("];", 0, broselow_pos)
    if close_bracket == -1:
        return False

    new_content = content[:close_bracket] + entry + content[close_bracket:]
    if not dry_run:
        INDEX_HTML.write_text(new_content, encoding="utf-8")
    return True


def topic_in_edu_index(topic_key: str) -> bool:
    if not EDU_INDEX.exists():
        return False
    return f'k:"{topic_key}"' in EDU_INDEX.read_text(encoding="utf-8")


def add_to_edu_index(topic_key: str, dry_run: bool) -> bool:
    """
    Insert a new entry into the topics array in apps/web/static/education/index.html.
    """
    if not EDU_INDEX.exists():
        return False
    content = EDU_INDEX.read_text(encoding="utf-8")
    if f'k:"{topic_key}"' in content:
        return False

    name = friendly_name(topic_key)
    icon = guess_icon(topic_key)
    entry = f'  {{n:"{name}",i:"{icon}",k:"{topic_key}"}},\n'

    # Find the closing ]; of the topics array (it's the first ]; after "var topics=[")
    topics_start = content.find("var topics=[")
    if topics_start == -1:
        return False
    topics_end = content.find("];", topics_start)
    if topics_end == -1:
        return False

    new_content = content[:topics_end] + entry + content[topics_end:]
    if not dry_run:
        EDU_INDEX.write_text(new_content, encoding="utf-8")
    return True


# ─────────────────────────────────────────────
#  CORE PROCESSING
# ─────────────────────────────────────────────
def process_file(src: Path, source_queue: str, log: dict, dry_run: bool) -> dict:
    """
    Process one DOCX file. Returns a result dict describing what happened.

    source_queue: "to-build" | "add-education"
    """
    filename = src.name
    result = {
        "filename": filename,
        "source_queue": source_queue,
        "status": None,    # "built" | "skipped" | "error"
        "reason": "",
        "actions": [],
    }

    parsed = parse_docx_filename(filename)
    if parsed is None:
        result["status"] = "error"
        result["reason"] = (
            "Filename does not match convention "
            "(*_cheat_sheet.docx / *_textbook.docx / *_audio_textbook.docx)"
        )
        return result

    topic_key, edu_key, static_folder = parsed

    if not is_new_file(filename, src, log):
        result["status"] = "skipped"
        result["reason"] = "MD5 unchanged — already built"
        return result

    md5 = file_md5(src)
    mode = infer_mode(topic_key)
    static_dest_dir = EDUCATION / static_folder
    static_dest     = static_dest_dir / filename

    # ── 1. Copy DOCX to static site ──────────────────────────────────────
    if not dry_run:
        static_dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, static_dest)
    result["actions"].append(f"copied → {static_dest.relative_to(ROOT)}")

    # ── 2. Register in website (only for add-education queue) ────────────
    registered_main  = False
    registered_edu   = False
    if source_queue == "add-education":
        if not topic_in_main_index(topic_key):
            registered_main = add_to_main_index(topic_key, mode, dry_run)
            if registered_main:
                result["actions"].append(f"registered in index.html (mode={mode})")

        if not topic_in_edu_index(topic_key):
            registered_edu = add_to_edu_index(topic_key, dry_run)
            if registered_edu:
                result["actions"].append("registered in education/index.html")

    # ── 3. Move source file to done folder ───────────────────────────────
    done_dir = BUILT if source_queue == "to-build" else PROCESSED
    moved_to = done_dir / filename
    if moved_to.exists():
        # Avoid clobbering existing file — add timestamp
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        moved_to = done_dir / f"{src.stem}_{ts}{src.suffix}"
    if not dry_run:
        done_dir.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(moved_to))
    result["actions"].append(f"moved  → {moved_to.relative_to(ROOT)}")

    # ── 4. Append to build log ───────────────────────────────────────────
    log_entry = {
        "filename":            filename,
        "topic_key":           topic_key,
        "edu_key":             edu_key,
        "static_folder":       static_folder,
        "mode":                mode,
        "source_queue":        source_queue,
        "md5":                 md5,
        "built_at":            datetime.now().isoformat(timespec="seconds"),
        "static_dest":         str(static_dest.relative_to(ROOT)),
        "moved_to":            str(moved_to.relative_to(ROOT)),
        "registered_main_index": registered_main,
        "registered_edu_index":  registered_edu,
        "dry_run":             dry_run,
    }
    if not dry_run:
        log["builds"].append(log_entry)

    result["status"]   = "built"
    result["log_entry"] = log_entry
    return result


# ─────────────────────────────────────────────
#  SCAN + BUILD
# ─────────────────────────────────────────────
def scan_and_build(dry_run: bool = False):
    """Scan both queues, process new files, save log."""
    log = load_log()

    # Ensure all directories exist
    for d in [TO_BUILD, BUILT, INCOMING, PROCESSED]:
        d.mkdir(parents=True, exist_ok=True)

    queue = [
        (f, "to-build")      for f in sorted(TO_BUILD.glob("*.docx"))
    ] + [
        (f, "add-education") for f in sorted(INCOMING.glob("*.docx"))
    ]

    if not queue:
        print("Nothing to do — no DOCX files found in either queue folder.")
        return

    results = [process_file(f, q, log, dry_run) for f, q in queue]

    if not dry_run:
        save_log(log)

    # ── Print summary ──
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    tag = " [DRY RUN]" if dry_run else ""
    print(f"\n{'═'*64}")
    print(f"  PED CDS Build System{tag}  —  {ts}")
    print(f"{'═'*64}")

    n_built   = sum(1 for r in results if r["status"] == "built")
    n_skipped = sum(1 for r in results if r["status"] == "skipped")
    n_errors  = sum(1 for r in results if r["status"] == "error")

    for r in results:
        sym   = {"built": "✓", "skipped": "–", "error": "✗"}[r["status"]]
        queue = "[to-build]" if r["source_queue"] == "to-build" else "[add-edu] "
        print(f"\n  {sym} {queue}  {r['filename']}")
        if r["status"] == "built":
            for action in r["actions"]:
                print(f"      {action}")
        elif r["status"] in ("skipped", "error"):
            print(f"      {r['reason']}")

    print(f"\n{'─'*64}")
    print(f"  Built: {n_built}   Skipped: {n_skipped}   Errors: {n_errors}")
    print(f"{'═'*64}\n")


# ─────────────────────────────────────────────
#  STATUS / LOG VIEWER
# ─────────────────────────────────────────────
def show_status(limit: int = 25):
    log = load_log()
    builds = [b for b in log["builds"] if not b.get("dry_run")]
    if not builds:
        print("Build log is empty — no files have been processed yet.")
        return

    print(f"\n{'═'*72}")
    print(f"  PED CDS Build Log  —  {len(builds)} total entries  (showing last {limit})")
    print(f"{'═'*72}")
    print(f"  {'Built At':<21}  {'Queue':<12}  {'Mode':<10}  File")
    print(f"  {'─'*20}  {'─'*11}  {'─'*9}  {'─'*30}")

    for b in builds[-limit:]:
        ts     = b.get("built_at", "?")[:19]
        queue  = b.get("source_queue", "?")
        mode   = b.get("mode", "?")
        fname  = b.get("filename", "?")
        extras = []
        if b.get("registered_main_index"):
            extras.append("★ main")
        if b.get("registered_edu_index"):
            extras.append("★ edu")
        extra_str = f"  ({', '.join(extras)})" if extras else ""
        print(f"  {ts}  {queue:<12}  {mode:<10}  {fname}{extra_str}")

    print(f"{'═'*72}\n")


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="PED CDS Education Build System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--watch", action="store_true",
        help="Watch mode: scan every 30 seconds until Ctrl+C",
    )
    parser.add_argument(
        "--status", action="store_true",
        help="Print the recent build log and exit",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Show what would happen without making any changes",
    )
    parser.add_argument(
        "--log-limit", type=int, default=25, metavar="N",
        help="Number of log entries to show with --status (default 25)",
    )
    args = parser.parse_args()

    if args.status:
        show_status(limit=args.log_limit)
        return

    if args.watch:
        import time
        print("Watch mode active — scanning every 30 s. Press Ctrl+C to stop.\n")
        try:
            while True:
                scan_and_build(dry_run=args.dry_run)
                time.sleep(30)
        except KeyboardInterrupt:
            print("\nWatch mode stopped.")
        return

    scan_and_build(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
