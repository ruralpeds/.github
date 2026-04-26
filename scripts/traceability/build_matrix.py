#!/usr/bin/env python3
"""Build IEC 62304 traceability matrix from DHF YAML files.

Reads dhf/requirements/*.yaml, dhf/risk/*.yaml, and dhf/verification/*.yaml;
validates against JSON schemas; emits traceability-matrix.json and
traceability-matrix.html.

Usage:
    python scripts/traceability/build_matrix.py \\
        --dhf dhf \\
        --version HEAD \\
        --out dhf/releases/HEAD/
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("PyYAML is required: pip install pyyaml")

try:
    import jsonschema
except ImportError:
    sys.exit("jsonschema is required: pip install jsonschema")

SCHEMA_DIR = Path(__file__).parent.parent.parent / "policies" / "dhf" / "schemas"

SEVERITY_ORDER = ["negligible", "minor", "serious", "critical", "catastrophic"]
SERIOUS_AND_ABOVE = {"serious", "critical", "catastrophic"}


def load_yaml(path: Path) -> dict | list:
    with open(path) as f:
        return yaml.safe_load(f)


def validate(data: dict, schema_path: Path, source: Path) -> None:
    schema = json.loads(schema_path.read_text())
    try:
        jsonschema.validate(data, schema)
    except jsonschema.ValidationError as e:
        print(f"  Schema error in {source}: {e.message} at {list(e.path)}")
        raise


def load_dhf(dhf_path: Path) -> tuple[list, list, list]:
    reqs, hazards, tests = [], [], []

    for f in sorted(dhf_path.glob("requirements/*.yaml")):
        data = load_yaml(f)
        validate(data, SCHEMA_DIR / "requirements.schema.json", f)
        reqs.extend(data.get("requirements", []))

    for f in sorted(dhf_path.glob("risk/*.yaml")):
        data = load_yaml(f)
        validate(data, SCHEMA_DIR / "hazard-analysis.schema.json", f)
        hazards.extend(data.get("hazards", []))

    for f in sorted(dhf_path.glob("verification/*.yaml")):
        data = load_yaml(f)
        validate(data, SCHEMA_DIR / "unit-test-map.schema.json", f)
        tests.extend(data.get("tests", []))

    return reqs, hazards, tests


def build_matrix(reqs: list, hazards: list, tests: list) -> dict:
    test_by_sw: dict[str, list[str]] = {}
    for t in tests:
        if t.get("status", "active") == "retired":
            continue
        for sw_id in t.get("verifies", []):
            test_by_sw.setdefault(sw_id, []).append(t["id"])

    rc_to_sw: dict[str, list[str]] = {}
    for req in reqs:
        for rc in req.get("risk_controls", []):
            rc_to_sw.setdefault(rc, []).append(req["id"])

    req_rows = []
    for req in reqs:
        sw_id = req["id"]
        tests_list = test_by_sw.get(sw_id, [])
        row = {
            "id": sw_id,
            "title": req.get("title", ""),
            "status": req.get("status", "active"),
            "parent": req.get("parent"),
            "risk_controls": req.get("risk_controls", []),
            "tests": tests_list,
            "tested": len(tests_list) > 0,
            "implemented": bool(req.get("implemented")),
        }
        req_rows.append(row)

    hazard_rows = []
    for hz in hazards:
        controls = hz.get("controls", [])
        rc_ids = [c["id"] if isinstance(c, dict) else c for c in controls]
        any_rc_in_sw = any(rc in rc_to_sw for rc in rc_ids)
        residual_severity = hz.get("severity_residual", hz.get("severity", ""))
        row = {
            "id": hz["id"],
            "title": hz.get("title", ""),
            "severity": hz.get("severity", ""),
            "probability": hz.get("probability", ""),
            "risk_level": hz.get("risk_level", ""),
            "controls": rc_ids,
            "controls_in_requirements": any_rc_in_sw,
            "severity_residual": residual_severity,
            "risk_level_residual": hz.get("risk_level_residual", ""),
        }
        hazard_rows.append(row)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "requirements": req_rows,
        "hazards": hazard_rows,
        "summary": {
            "total_requirements": len(req_rows),
            "tested_requirements": sum(1 for r in req_rows if r["tested"]),
            "total_hazards": len(hazard_rows),
            "hazards_controlled": sum(1 for h in hazard_rows if h["controls"]),
        },
    }


def render_html(matrix: dict, version: str) -> str:
    req_rows = ""
    for r in matrix["requirements"]:
        status_class = "pass" if r["tested"] else "fail"
        tests_cell = ", ".join(r["tests"]) if r["tests"] else "—"
        rc_cell = ", ".join(r["risk_controls"]) if r["risk_controls"] else "—"
        req_rows += (
            f"<tr>"
            f"<td>{r['id']}</td>"
            f"<td>{r['title']}</td>"
            f"<td>{r['status']}</td>"
            f"<td>{r['parent'] or '—'}</td>"
            f"<td class='{status_class}'>{tests_cell}</td>"
            f"<td>{rc_cell}</td>"
            f"</tr>\n"
        )

    hz_rows = ""
    for h in matrix["hazards"]:
        ctrl_class = "pass" if h["controls_in_requirements"] else "fail"
        controls_cell = ", ".join(h["controls"]) if h["controls"] else "—"
        hz_rows += (
            f"<tr>"
            f"<td>{h['id']}</td>"
            f"<td>{h['title']}</td>"
            f"<td>{h['severity']}</td>"
            f"<td>{h['probability']}</td>"
            f"<td>{h['risk_level']}</td>"
            f"<td class='{ctrl_class}'>{controls_cell}</td>"
            f"<td>{h['severity_residual']}</td>"
            f"<td>{h['risk_level_residual']}</td>"
            f"</tr>\n"
        )

    s = matrix["summary"]
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Traceability Matrix — {version}</title>
<style>
body{{font-family:system-ui,sans-serif;margin:2rem;color:#111}}
h1{{font-size:1.5rem}}h2{{font-size:1.2rem;margin-top:2rem}}
table{{border-collapse:collapse;width:100%;font-size:.875rem}}
th{{background:#2d3748;color:#fff;padding:.5rem .75rem;text-align:left}}
td{{padding:.4rem .75rem;border-bottom:1px solid #e2e8f0}}
tr:hover td{{background:#f7fafc}}
.pass{{color:#276749;font-weight:600}}
.fail{{color:#c53030;font-weight:600}}
.summary{{display:flex;gap:2rem;margin:1rem 0}}
.stat{{background:#edf2f7;border-radius:.5rem;padding:.75rem 1.25rem;text-align:center}}
.stat-value{{font-size:1.75rem;font-weight:700}}
.stat-label{{font-size:.75rem;color:#718096}}
</style>
<script>
function sortTable(n,el){{
  var t=el.closest('table'),rows=Array.from(t.querySelectorAll('tbody tr'));
  var asc=el.dataset.asc=el.dataset.asc!='1'?'1':'0';
  rows.sort((a,b)=>{{
    var av=a.cells[n].textContent,bv=b.cells[n].textContent;
    return asc=='1'?av.localeCompare(bv):bv.localeCompare(av);
  }});
  t.querySelector('tbody').append(...rows);
}}
</script>
</head>
<body>
<h1>IEC 62304 Traceability Matrix</h1>
<p><strong>Version:</strong> {version} &nbsp; <strong>Generated:</strong> {matrix['generated_at'][:19]}Z</p>
<div class="summary">
  <div class="stat"><div class="stat-value">{s['total_requirements']}</div><div class="stat-label">Requirements</div></div>
  <div class="stat"><div class="stat-value">{s['tested_requirements']}</div><div class="stat-label">Tested</div></div>
  <div class="stat"><div class="stat-value">{s['total_hazards']}</div><div class="stat-label">Hazards</div></div>
  <div class="stat"><div class="stat-value">{s['hazards_controlled']}</div><div class="stat-label">Controlled</div></div>
</div>

<h2>Software Requirements (IEC 62304 §5.2)</h2>
<table>
<thead><tr>
  <th onclick="sortTable(0,this)" style="cursor:pointer">ID ↕</th>
  <th>Title</th><th>Status</th><th>Parent</th>
  <th onclick="sortTable(4,this)" style="cursor:pointer">Tests ↕</th>
  <th>Risk Controls</th>
</tr></thead>
<tbody>{req_rows}</tbody>
</table>

<h2>Hazard Analysis (ISO 14971)</h2>
<table>
<thead><tr>
  <th onclick="sortTable(0,this)" style="cursor:pointer">ID ↕</th>
  <th>Title</th><th>Severity</th><th>Probability</th><th>Risk Level</th>
  <th onclick="sortTable(5,this)" style="cursor:pointer">Controls ↕</th>
  <th>Residual Severity</th><th>Residual Risk</th>
</tr></thead>
<tbody>{hz_rows}</tbody>
</table>
</body>
</html>"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dhf", default="dhf", help="Path to DHF directory")
    parser.add_argument("--version", default="HEAD", help="Version label for outputs")
    parser.add_argument("--out", required=True, help="Output directory")
    args = parser.parse_args()

    dhf_path = Path(args.dhf)
    out_path = Path(args.out)
    out_path.mkdir(parents=True, exist_ok=True)

    reqs, hazards, tests = load_dhf(dhf_path)
    matrix = build_matrix(reqs, hazards, tests)

    json_path = out_path / "traceability-matrix.json"
    html_path = out_path / "traceability-matrix.html"

    json_path.write_text(json.dumps(matrix, indent=2))
    html_path.write_text(render_html(matrix, args.version))

    s = matrix["summary"]
    print(
        f"Matrix written to {out_path}/\n"
        f"  Requirements: {s['total_requirements']} total, "
        f"{s['tested_requirements']} tested\n"
        f"  Hazards: {s['total_hazards']} total, "
        f"{s['hazards_controlled']} with controls"
    )


if __name__ == "__main__":
    main()
