"""Unit tests for scripts/traceability/build_matrix.py"""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from traceability.build_matrix import build_matrix, load_dhf, render_html

FIXTURES = Path(__file__).parent / "fixtures"


def test_load_dhf_valid_minimal():
    reqs, hazards, tests = load_dhf(FIXTURES / "valid-minimal")
    assert len(reqs) == 2
    assert len(hazards) == 1
    assert len(tests) == 2


def test_build_matrix_structure():
    reqs, hazards, tests = load_dhf(FIXTURES / "valid-minimal")
    matrix = build_matrix(reqs, hazards, tests)
    assert "requirements" in matrix
    assert "hazards" in matrix
    assert "summary" in matrix
    assert "generated_at" in matrix


def test_build_matrix_tested_flag():
    reqs, hazards, tests = load_dhf(FIXTURES / "valid-minimal")
    matrix = build_matrix(reqs, hazards, tests)
    req_rows = {r["id"]: r for r in matrix["requirements"]}
    assert req_rows["SW-001"]["tested"] is True
    assert req_rows["SW-002"]["tested"] is True


def test_build_matrix_untested_requirement():
    reqs, hazards, tests = load_dhf(FIXTURES / "missing-test")
    matrix = build_matrix(reqs, hazards, tests)
    req_rows = {r["id"]: r for r in matrix["requirements"]}
    assert req_rows["SW-001"]["tested"] is True
    assert req_rows["SW-002"]["tested"] is False


def test_build_matrix_summary_counts():
    reqs, hazards, tests = load_dhf(FIXTURES / "valid-minimal")
    matrix = build_matrix(reqs, hazards, tests)
    s = matrix["summary"]
    assert s["total_requirements"] == 2
    assert s["tested_requirements"] == 2
    assert s["total_hazards"] == 1
    assert s["hazards_controlled"] == 1


def test_render_html_produces_string():
    reqs, hazards, tests = load_dhf(FIXTURES / "valid-minimal")
    matrix = build_matrix(reqs, hazards, tests)
    html = render_html(matrix, "test-v1.0")
    assert isinstance(html, str)
    assert len(html) > 100


def test_render_html_contains_ids():
    reqs, hazards, tests = load_dhf(FIXTURES / "valid-minimal")
    matrix = build_matrix(reqs, hazards, tests)
    html = render_html(matrix, "HEAD")
    assert "SW-001" in html
    assert "HZ-001" in html


def test_render_html_is_parseable_as_html():
    """Smoke test: rendered HTML should at least have the basic structure."""
    reqs, hazards, tests = load_dhf(FIXTURES / "valid-minimal")
    matrix = build_matrix(reqs, hazards, tests)
    html = render_html(matrix, "HEAD")
    assert "<!DOCTYPE html>" in html
    assert "<table>" in html
    assert "</html>" in html


def test_build_matrix_emits_json(tmp_path):
    from traceability.build_matrix import main
    import subprocess, sys
    result = subprocess.run(
        [sys.executable, "-m", "traceability.build_matrix",
         "--dhf", str(FIXTURES / "valid-minimal"),
         "--version", "test",
         "--out", str(tmp_path)],
        cwd=str(Path(__file__).parent.parent.parent / "scripts"),
        capture_output=True, text=True
    )
    assert result.returncode == 0
    json_file = tmp_path / "traceability-matrix.json"
    html_file = tmp_path / "traceability-matrix.html"
    assert json_file.exists()
    assert html_file.exists()
    matrix = json.loads(json_file.read_text())
    assert matrix["summary"]["total_requirements"] == 2
