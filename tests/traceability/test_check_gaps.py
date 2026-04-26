"""Unit tests for scripts/traceability/check_gaps.py"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from traceability.check_gaps import check

FIXTURES = Path(__file__).parent / "fixtures"


def test_valid_minimal_passes():
    assert check(FIXTURES / "valid-minimal") == 0


def test_missing_test_fails():
    assert check(FIXTURES / "missing-test") == 1


def test_orphan_rc_fails():
    assert check(FIXTURES / "orphan-rc") == 1


def test_duplicate_id_fails():
    assert check(FIXTURES / "duplicate-id") == 1


def test_retired_req_tested_warns_but_passes():
    """Active test citing a retired req should warn but exit 0."""
    assert check(FIXTURES / "retired-req-tested") == 0


def test_empty_dhf(tmp_path):
    """An empty DHF directory (no YAML files) should pass."""
    (tmp_path / "requirements").mkdir()
    (tmp_path / "risk").mkdir()
    (tmp_path / "verification").mkdir()
    assert check(tmp_path) == 0


def test_draft_requirements_not_required_to_be_tested(tmp_path):
    (tmp_path / "requirements").mkdir()
    (tmp_path / "risk").mkdir()
    (tmp_path / "verification").mkdir()
    (tmp_path / "requirements" / "reqs.yaml").write_text(
        "version: '1.0'\nrequirements:\n  - id: SW-001\n    title: Draft req\n    status: draft\n"
    )
    (tmp_path / "risk" / "hazards.yaml").write_text("version: '1.0'\nhazards: []\n")
    (tmp_path / "verification" / "tests.yaml").write_text("version: '1.0'\ntests: []\n")
    assert check(tmp_path) == 0


def test_retired_requirements_not_required_to_be_tested(tmp_path):
    (tmp_path / "requirements").mkdir()
    (tmp_path / "risk").mkdir()
    (tmp_path / "verification").mkdir()
    (tmp_path / "requirements" / "reqs.yaml").write_text(
        "version: '1.0'\nrequirements:\n  - id: SW-001\n    title: Retired req\n    status: retired\n"
    )
    (tmp_path / "risk" / "hazards.yaml").write_text("version: '1.0'\nhazards: []\n")
    (tmp_path / "verification" / "tests.yaml").write_text("version: '1.0'\ntests: []\n")
    assert check(tmp_path) == 0


def test_serious_hazard_without_controls_fails(tmp_path):
    (tmp_path / "requirements").mkdir()
    (tmp_path / "risk").mkdir()
    (tmp_path / "verification").mkdir()
    (tmp_path / "requirements" / "reqs.yaml").write_text("version: '1.0'\nrequirements: []\n")
    (tmp_path / "risk" / "hazards.yaml").write_text(
        "version: '1.0'\nhazards:\n"
        "  - id: HZ-001\n    title: Serious uncontrolled\n"
        "    severity: serious\n    probability: probable\n    risk_level: unacceptable\n"
        "    controls: []\n    severity_residual: serious\n"
    )
    (tmp_path / "verification" / "tests.yaml").write_text("version: '1.0'\ntests: []\n")
    assert check(tmp_path) == 1


def test_negligible_hazard_without_controls_passes(tmp_path):
    (tmp_path / "requirements").mkdir()
    (tmp_path / "risk").mkdir()
    (tmp_path / "verification").mkdir()
    (tmp_path / "requirements" / "reqs.yaml").write_text("version: '1.0'\nrequirements: []\n")
    (tmp_path / "risk" / "hazards.yaml").write_text(
        "version: '1.0'\nhazards:\n"
        "  - id: HZ-001\n    title: Negligible hazard\n"
        "    severity: negligible\n    probability: incredible\n    risk_level: acceptable\n"
        "    controls: []\n"
    )
    (tmp_path / "verification" / "tests.yaml").write_text("version: '1.0'\ntests: []\n")
    assert check(tmp_path) == 0
