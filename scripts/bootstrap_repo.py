#!/usr/bin/env python3
"""
bootstrap_repo.py — Analyze a target repo and generate CI/testing/audit workflows.

Usage: python bootstrap_repo.py <target_path> <templates_path> <dry_run>

Detects language/framework, copies appropriate reusable workflow callers,
and sets up audit logging for the target repository.
"""

import json
import os
import sys
from pathlib import Path


def detect_languages(target: Path) -> dict:
    """Detect languages and frameworks in the target repo."""
    detected = {}

    # Node.js
    pkg_json = target / "package.json"
    if pkg_json.exists():
        try:
            pkg = json.loads(pkg_json.read_text())
            deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
            pm = "npm"
            if (target / "yarn.lock").exists():
                pm = "yarn"
            elif (target / "pnpm-lock.yaml").exists():
                pm = "pnpm"
            detected["node"] = {
                "package_manager": pm,
                "has_playwright": "playwright" in deps or "@playwright/test" in deps,
                "has_typescript": "typescript" in deps,
            }
        except (json.JSONDecodeError, OSError):
            detected["node"] = {"package_manager": "npm", "has_playwright": False, "has_typescript": False}

    # Python
    if any((target / f).exists() for f in ["pyproject.toml", "setup.py", "setup.cfg", "requirements.txt"]):
        detected["python"] = {}

    # Rust
    if (target / "Cargo.toml").exists():
        detected["rust"] = {}

    # Go
    if (target / "go.mod").exists():
        detected["go"] = {}

    # Julia
    if (target / "Project.toml").exists():
        detected["julia"] = {}

    # Docker
    if (target / "Dockerfile").exists() or (target / "docker-compose.yml").exists() or (target / "docker-compose.yaml").exists():
        detected["docker"] = {
            "has_dockerfile": (target / "Dockerfile").exists(),
            "has_compose": (target / "docker-compose.yml").exists() or (target / "docker-compose.yaml").exists(),
        }

    return detected


def generate_ci_workflow(lang: str, config: dict) -> str:
    """Generate a workflow caller for the given language."""
    org = "timothyhartzog"

    if lang == "node":
        pm = config.get("package_manager", "npm")
        workflow = f"""name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    uses: {org}/.github/.github/workflows/ci-node.yml@main
    with:
      package-manager: "{pm}"
"""
        if config.get("has_typescript"):
            workflow += "      run-typecheck: true\n"
        return workflow

    if lang == "python":
        return f"""name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    uses: {org}/.github/.github/workflows/ci-python.yml@main
"""

    if lang == "rust":
        return f"""name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    uses: {org}/.github/.github/workflows/ci-rust.yml@main
"""

    if lang == "go":
        return f"""name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    uses: {org}/.github/.github/workflows/ci-go.yml@main
"""

    if lang == "julia":
        return f"""name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    uses: {org}/.github/.github/workflows/ci-julia.yml@main
"""

    return ""


def generate_playwright_workflow(config: dict) -> str:
    """Generate Playwright E2E workflow caller."""
    org = "timothyhartzog"
    pm = config.get("package_manager", "npm")
    return f"""name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    uses: {org}/.github/.github/workflows/e2e-playwright.yml@main
    with:
      package-manager: "{pm}"
      browsers: '["chromium", "firefox"]'
      retries: 2
"""


def generate_audit_workflow() -> str:
    """Generate audit log workflow caller."""
    org = "timothyhartzog"
    return f"""name: Audit Log
on:
  push:
    branches: [main]
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  audit:
    uses: {org}/.github/.github/workflows/audit-log.yml@main
    permissions:
      contents: write
"""


def generate_release_workflow() -> str:
    """Generate release workflow caller."""
    org = "timothyhartzog"
    return f"""name: Release
on:
  workflow_dispatch:
    inputs:
      release-type:
        description: "Release type"
        type: choice
        options: [auto, major, minor, patch]
        default: auto

jobs:
  release:
    uses: {org}/.github/.github/workflows/release.yml@main
    with:
      release-type: ${{{{ inputs.release-type }}}}
    permissions:
      contents: write
"""


def generate_container_workflow() -> str:
    """Generate container build/scan workflow caller."""
    org = "timothyhartzog"
    return f"""name: Container
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  container:
    uses: {org}/.github/.github/workflows/container.yml@main
    permissions:
      contents: read
      packages: write
      attestations: write
      id-token: write
      security-events: write
"""


def generate_security_workflow() -> str:
    """Generate security scan workflow caller."""
    org = "timothyhartzog"
    return f"""name: Security
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 7 * * 1"

jobs:
  security:
    uses: {org}/.github/.github/workflows/security-scan.yml@main
    permissions:
      security-events: write
      contents: read
  quality:
    uses: {org}/.github/.github/workflows/code-quality.yml@main
    permissions:
      security-events: write
      contents: read
      pull-requests: write
"""


def main():
    if len(sys.argv) < 3:
        print("Usage: bootstrap_repo.py <target_path> <templates_path> [dry_run]")
        sys.exit(1)

    target = Path(sys.argv[1]).resolve()
    templates = Path(sys.argv[2]).resolve()
    dry_run = sys.argv[3].lower() == "true" if len(sys.argv) > 3 else False

    if not target.exists():
        print(f"::error::Target path does not exist: {target}")
        sys.exit(1)

    detected = detect_languages(target)
    if not detected:
        print(f"No supported languages detected in {target}")
        set_output("changes", "false")
        return

    print(f"Detected languages: {', '.join(detected.keys())}")

    workflows_dir = target / ".github" / "workflows"
    changes = False

    for lang, config in detected.items():
        ci_content = generate_ci_workflow(lang, config)
        if not ci_content:
            continue

        ci_file = workflows_dir / f"ci-{lang}.yml"
        if not ci_file.exists():
            if not dry_run:
                workflows_dir.mkdir(parents=True, exist_ok=True)
                ci_file.write_text(ci_content)
                print(f"  Created {ci_file.relative_to(target)}")
            else:
                print(f"  [dry-run] Would create {ci_file.relative_to(target)}")
            changes = True

        # Playwright for Node projects
        if lang == "node" and config.get("has_playwright"):
            pw_file = workflows_dir / "e2e-playwright.yml"
            if not pw_file.exists():
                pw_content = generate_playwright_workflow(config)
                if not dry_run:
                    pw_file.write_text(pw_content)
                    print(f"  Created {pw_file.relative_to(target)}")
                else:
                    print(f"  [dry-run] Would create {pw_file.relative_to(target)}")
                changes = True

    # Audit log workflow
    audit_file = workflows_dir / "audit-log.yml"
    if not audit_file.exists():
        if not dry_run:
            workflows_dir.mkdir(parents=True, exist_ok=True)
            audit_file.write_text(generate_audit_workflow())
            print(f"  Created {audit_file.relative_to(target)}")
        else:
            print(f"  [dry-run] Would create {audit_file.relative_to(target)}")
        changes = True

    # Container workflow (for repos with Dockerfiles)
    if "docker" in detected and detected["docker"].get("has_dockerfile"):
        container_file = workflows_dir / "container.yml"
        if not container_file.exists():
            if not dry_run:
                workflows_dir.mkdir(parents=True, exist_ok=True)
                container_file.write_text(generate_container_workflow())
                print(f"  Created {container_file.relative_to(target)}")
            else:
                print(f"  [dry-run] Would create {container_file.relative_to(target)}")
            changes = True

    # Release workflow (all repos)
    release_file = workflows_dir / "release.yml"
    if not release_file.exists():
        if not dry_run:
            workflows_dir.mkdir(parents=True, exist_ok=True)
            release_file.write_text(generate_release_workflow())
            print(f"  Created {release_file.relative_to(target)}")
        else:
            print(f"  [dry-run] Would create {release_file.relative_to(target)}")
        changes = True

    # Security & code quality workflow (runs on ALL repos)
    security_file = workflows_dir / "security.yml"
    if not security_file.exists():
        if not dry_run:
            workflows_dir.mkdir(parents=True, exist_ok=True)
            security_file.write_text(generate_security_workflow())
            print(f"  Created {security_file.relative_to(target)}")
        else:
            print(f"  [dry-run] Would create {security_file.relative_to(target)}")
        changes = True

    set_output("changes", "true" if changes else "false")
    print(f"\nChanges detected: {changes}")


def set_output(name: str, value: str):
    """Set GitHub Actions output."""
    output_file = os.environ.get("GITHUB_OUTPUT")
    if output_file:
        with open(output_file, "a") as f:
            f.write(f"{name}={value}\n")
    else:
        print(f"  OUTPUT: {name}={value}")


if __name__ == "__main__":
    main()
