#!/usr/bin/env python3
"""
build_dashboard.py — build a static health dashboard for an org.

Walks every repo in the target org, pulls:
  • .github/AUDIT.yaml (for classification, last_reviewed, compliance flags)
  • latest compliance workflow run (via check-runs)
  • latest SBOM artifact age
  • branch protection status
  • open security alerts count (where API available)

Emits:
  _site/index.html           — human dashboard
  _site/data.json            — machine-readable version
  _site/repos/<repo>.html    — per-repo detail page
  _site/style.css

Relies on `gh api` for authenticated requests.
"""

from __future__ import annotations

import argparse
import base64
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dateutil.parser import parse as parse_dt
import yaml


def gh(path: str, jq: str | None = None) -> Any:
    cmd = ["gh", "api", "-H", "Accept: application/vnd.github+json", path]
    if jq:
        cmd += ["--jq", jq]
    try:
        out = subprocess.check_output(cmd, text=True, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        if "404" in (e.stderr or ""):
            return None
        print(f"WARN: {path}: {e.stderr.strip()}", file=sys.stderr)
        return None
    return json.loads(out) if out.strip() else None


def gh_paginate(path: str) -> list:
    results: list = []
    page = 1
    while True:
        sep = "&" if "?" in path else "?"
        chunk = gh(f"{path}{sep}per_page=100&page={page}")
        if not chunk:
            break
        results.extend(chunk)
        if len(chunk) < 100:
            break
        page += 1
    return results


def load_audit(org: str, repo: str) -> dict | None:
    data = gh(f"repos/{org}/{repo}/contents/.github/AUDIT.yaml")
    if not data:
        data = gh(f"repos/{org}/{repo}/contents/.github/AUDIT.yml")
    if not data or data.get("type") != "file":
        return None
    try:
        return yaml.safe_load(base64.b64decode(data["content"]).decode())
    except Exception:
        return None


def latest_compliance(org: str, repo: str, default_branch: str) -> dict:
    runs = gh(f"repos/{org}/{repo}/actions/runs"
              f"?branch={default_branch}&status=completed&per_page=20")
    if not runs:
        return {"status": "none"}
    for r in runs.get("workflow_runs", []):
        name = (r.get("name") or "").lower()
        if "compliance" in name or "hipaa" in name:
            return {
                "status":    r["conclusion"],
                "run_id":    r["id"],
                "url":       r["html_url"],
                "created":   r["created_at"],
            }
    return {"status": "none"}


def classify(audit: dict | None, lang: str | None) -> dict:
    if audit and audit.get("metadata", {}).get("classification"):
        return {"classification": audit["metadata"]["classification"]}
    if lang in ("Julia", "Rust", "Python", "TypeScript", "JavaScript"):
        return {"classification": "library"}
    return {"classification": "unknown"}


def freshness(audit: dict | None, interval_days: int = 180) -> dict:
    if not audit or "metadata" not in audit:
        return {"state": "missing", "age_days": None}
    last = audit["metadata"].get("last_reviewed")
    if not last:
        return {"state": "missing", "age_days": None}
    age = (datetime.now(timezone.utc) - parse_dt(last)).days
    state = "fresh" if age <= interval_days else ("stale" if age <= interval_days * 2 else "overdue")
    return {"state": state, "age_days": age, "last_reviewed": last}


def collect(org: str) -> list[dict]:
    repos = gh_paginate(f"orgs/{org}/repos?type=all")
    out = []
    for r in repos:
        if r.get("archived"):
            continue
        name = r["name"]
        print(f"  · {org}/{name}", file=sys.stderr)
        audit = load_audit(org, name)
        bp = gh(f"repos/{org}/{name}/branches/{r['default_branch']}/protection") or {}
        entry = {
            "name":       name,
            "full_name":  r["full_name"],
            "url":        r["html_url"],
            "description": r.get("description"),
            "language":   r.get("language"),
            "visibility": r.get("visibility"),
            "pushed_at":  r["pushed_at"],
            "created_at": r["created_at"],
            "classification": classify(audit, r.get("language"))["classification"],
            "audit":      audit.get("metadata", {}) if audit else {},
            "compliance_flags": audit.get("compliance", {}) if audit else {},
            "sources_count": len(audit.get("sources", [])) if audit else 0,
            "freshness":  freshness(audit),
            "compliance_run": latest_compliance(org, name, r["default_branch"]),
            "branch_protection": bool(bp),
            "bp_signed_commits": bp.get("required_signatures", {}).get("enabled", False),
        }
        out.append(entry)
    out.sort(key=lambda x: (
        {"missing": 0, "overdue": 1, "stale": 2, "fresh": 3}[x["freshness"]["state"]],
        x["name"]
    ))
    return out


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><title>ruralpeds — Health Dashboard</title>
<link rel="stylesheet" href="style.css">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head><body>
<header>
  <h1>ruralpeds — Repository Health</h1>
  <p class="gen">Generated {{ generated_at }} · {{ repos|length }} repos</p>
</header>

<section class="summary">
  <div class="card fresh">{{ counts.fresh }}<span>Fresh</span></div>
  <div class="card stale">{{ counts.stale }}<span>Stale</span></div>
  <div class="card overdue">{{ counts.overdue }}<span>Overdue</span></div>
  <div class="card missing">{{ counts.missing }}<span>No audit</span></div>
</section>

<section class="filters">
  <input id="q" placeholder="Filter by name…" oninput="filter()">
  <select id="cls" onchange="filter()">
    <option value="">All classifications</option>
    {% for c in classifications %}<option>{{ c }}</option>{% endfor %}
  </select>
</section>

<table id="grid">
<thead><tr>
  <th>Repo</th><th>Class</th><th>Audit</th><th>Compliance</th>
  <th>BP</th><th>FDA</th><th>Sources</th><th>Last push</th>
</tr></thead>
<tbody>
{% for r in repos %}
<tr data-cls="{{ r.classification }}">
  <td><a href="{{ r.url }}">{{ r.name }}</a>
      <div class="desc">{{ r.description or "" }}</div></td>
  <td>{{ r.classification }}</td>
  <td class="f-{{ r.freshness.state }}">
      {% if r.freshness.age_days is not none %}{{ r.freshness.age_days }}d{% else %}—{% endif %}
  </td>
  <td class="c-{{ r.compliance_run.status }}">
      {% if r.compliance_run.status != 'none' %}
      <a href="{{ r.compliance_run.url }}">{{ r.compliance_run.status }}</a>
      {% else %}—{% endif %}
  </td>
  <td>{{ '✓' if r.branch_protection else '✗' }}
      {{ '🔒' if r.bp_signed_commits else '' }}</td>
  <td>{{ r.compliance_flags.fda_class or '—' }}</td>
  <td>{{ r.sources_count }}</td>
  <td class="mono">{{ r.pushed_at[:10] }}</td>
</tr>
{% endfor %}
</tbody></table>

<script>
function filter(){
  const q = document.getElementById('q').value.toLowerCase();
  const c = document.getElementById('cls').value;
  for (const row of document.querySelectorAll('#grid tbody tr')) {
    const name = row.querySelector('td').innerText.toLowerCase();
    const cls = row.dataset.cls;
    row.style.display = (!q || name.includes(q)) && (!c || cls === c) ? '' : 'none';
  }
}
</script>
</body></html>"""

CSS = """*{box-sizing:border-box}body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;margin:0;padding:2rem;color:#1a1a1a;background:#fafafa}
header{margin-bottom:1.5rem}h1{margin:0 0 .25rem;font-size:1.5rem}
.gen{color:#666;font-size:.85rem;margin:0}
.summary{display:flex;gap:1rem;margin-bottom:1.5rem}
.card{flex:1;padding:1rem;border-radius:6px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.08);font-size:2rem;font-weight:700;display:flex;flex-direction:column;align-items:flex-start}
.card span{font-size:.75rem;font-weight:500;color:#666;margin-top:.25rem;text-transform:uppercase;letter-spacing:.05em}
.card.fresh{color:#16a34a}.card.stale{color:#ca8a04}.card.overdue,.card.missing{color:#dc2626}
.filters{margin-bottom:1rem;display:flex;gap:.5rem}
.filters input,.filters select{padding:.5rem;border:1px solid #ddd;border-radius:4px;font:inherit}
.filters input{flex:1}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.08)}
th,td{padding:.65rem .75rem;text-align:left;border-bottom:1px solid #f0f0f0;vertical-align:top}
th{background:#f7f7f7;font-weight:600;font-size:.8rem;text-transform:uppercase;letter-spacing:.03em;color:#555}
tr:last-child td{border-bottom:none}
.desc{color:#888;font-size:.8rem;margin-top:.15rem;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.f-fresh{color:#16a34a;font-weight:600}.f-stale{color:#ca8a04;font-weight:600}
.f-overdue,.f-missing{color:#dc2626;font-weight:600}
.c-success{color:#16a34a}.c-failure{color:#dc2626}.c-cancelled,.c-skipped{color:#888}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.8rem;color:#555}
a{color:#0969da;text-decoration:none}a:hover{text-decoration:underline}"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--org",      required=True)
    ap.add_argument("--output",   required=True, type=Path)
    ap.add_argument("--template", required=False, type=Path,
                    help="optional template dir — if absent, use built-in")
    args = ap.parse_args()

    print(f"▶ Collecting {args.org}", file=sys.stderr)
    repos = collect(args.org)

    counts = {"fresh": 0, "stale": 0, "overdue": 0, "missing": 0}
    for r in repos:
        counts[r["freshness"]["state"]] += 1

    classifications = sorted({r["classification"] for r in repos})

    from jinja2 import Template
    html = Template(HTML_TEMPLATE).render(
        repos=repos, counts=counts,
        classifications=classifications,
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    )

    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "index.html").write_text(html)
    (args.output / "style.css").write_text(CSS)
    (args.output / "data.json").write_text(json.dumps({
        "org": args.org,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "counts": counts,
        "repos": repos,
    }, indent=2, default=str))

    print(f"✓ Wrote {args.output}/index.html ({len(repos)} repos)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
