#!/usr/bin/env python3
"""
container-auditor.py

Audit Dockerfiles for optimization opportunities.
Identifies: non-slim base images, missing multi-stage builds, cache inefficiencies.

Usage:
    python3 scripts/container-auditor.py \
        --repo-path . \
        --output-file audit-log/container-audit.json

Output:
    - container-audit.json: Audit results with optimization opportunities
    - container-audit-report.md: Human-readable report
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional


def find_dockerfiles(repo_path: Path) -> List[Path]:
    """Find all Dockerfile and Dockerfile.* files in repo."""
    dockerfiles = []

    # Look for Dockerfile, Dockerfile.prod, etc.
    for pattern in ["Dockerfile", "Dockerfile.*"]:
        dockerfiles.extend(repo_path.glob(f"**/{pattern}"))

    # Filter out hidden/backup files
    dockerfiles = [d for d in dockerfiles if not d.name.startswith(".")]

    return sorted(dockerfiles)


def parse_dockerfile(content: str) -> Dict:
    """Parse Dockerfile and extract metadata."""
    lines = content.split("\n")

    data = {
        "base_image": None,
        "stages": [],
        "commands": [],
        "from_lines": [],
        "run_lines": [],
        "copy_lines": [],
        "multi_stage": False,
        "total_lines": len(lines)
    }

    current_stage = None

    for i, line in enumerate(lines):
        line = line.strip()

        # Skip comments and empty lines
        if not line or line.startswith("#"):
            continue

        # FROM command
        if line.upper().startswith("FROM"):
            match = re.match(r"FROM\s+([\w\-:/.]+)(?:\s+AS\s+(\w+))?", line, re.IGNORECASE)
            if match:
                image = match.group(1)
                stage = match.group(2)

                if not data["base_image"]:
                    data["base_image"] = image

                data["from_lines"].append({
                    "line_number": i + 1,
                    "image": image,
                    "stage": stage
                })

                if stage:
                    data["multi_stage"] = True
                    current_stage = stage
                    data["stages"].append(stage)

        # RUN command
        elif line.upper().startswith("RUN"):
            data["run_lines"].append({
                "line_number": i + 1,
                "command": line[3:].strip()
            })

        # COPY command
        elif line.upper().startswith("COPY"):
            data["copy_lines"].append({
                "line_number": i + 1,
                "command": line[4:].strip()
            })

    return data


def check_base_image_optimization(data: Dict) -> List[Dict]:
    """Check if base image can be optimized (non-slim/minimal)."""
    issues = []

    base_image = data.get("base_image", "").lower()

    # Check for non-slim variants
    non_slim_patterns = {
        "ubuntu:20.04": {"suggested": "debian:bullseye-slim", "savings": "60%", "risk": "medium"},
        "ubuntu:22.04": {"suggested": "debian:bookworm-slim", "savings": "60%", "risk": "medium"},
        "node:": {"suggested": "node:-alpine", "savings": "75%", "risk": "low"},
        "python:": {"suggested": "python:-slim", "savings": "50%", "risk": "low"},
        "golang:": {"suggested": "golang:-alpine", "savings": "65%", "risk": "low"},
        "ruby:": {"suggested": "ruby:-alpine", "savings": "55%", "risk": "low"},
    }

    for pattern, suggestion in non_slim_patterns.items():
        if pattern.rstrip(":") in base_image:
            if "-slim" not in base_image and "-alpine" not in base_image:
                issues.append({
                    "type": "non-slim-base-image",
                    "severity": "high",
                    "current": data["base_image"],
                    "suggested": suggestion["suggested"],
                    "size_savings_percent": int(suggestion["savings"].rstrip("%")),
                    "risk_level": suggestion["risk"]
                })

    return issues


def check_multi_stage(data: Dict) -> List[Dict]:
    """Check if Dockerfile uses multi-stage builds."""
    issues = []

    if not data.get("multi_stage"):
        # Check if this looks like a build+runtime image
        run_commands = [r["command"].lower() for r in data.get("run_lines", [])]

        has_build_tools = any(
            cmd for cmd in run_commands
            if any(tool in cmd for tool in ["npm install", "pip install", "go build", "cargo build", "make", "gradle"])
        )

        has_start_cmd = any(cmd for cmd in run_commands if any(x in cmd for x in ["npm start", "python", "java", "go run"]))

        if has_build_tools and has_start_cmd:
            issues.append({
                "type": "missing-multi-stage",
                "severity": "high",
                "size_savings_percent": 45,
                "build_time_savings_percent": 30,
                "description": "Appears to use same image for build and runtime"
            })

    return issues


def check_layer_caching(data: Dict) -> List[Dict]:
    """Check for layer caching optimization opportunities."""
    issues = []

    copy_lines = [c["line_number"] for c in data.get("copy_lines", [])]
    run_lines = [r["line_number"] for r in data.get("run_lines", [])]

    # Check if COPY . . comes before RUN npm install (cache miss)
    has_copy_all = any("." in c["command"] and c["command"].endswith(".") for c in data.get("copy_lines", []))

    # Look for dependency install commands
    has_dependency_install = any(
        cmd for cmd in [r["command"].lower() for r in data.get("run_lines", [])]
        if any(x in cmd for x in ["npm install", "npm ci", "pip install", "apt-get install", "apk add"])
    )

    if has_copy_all and has_dependency_install:
        # Check if COPY . . comes before RUN with install
        copy_all_line = None
        for c in data["copy_lines"]:
            if "." in c["command"] and c["command"].endswith("."):
                copy_all_line = c["line_number"]
                break

        install_line = None
        for r in data["run_lines"]:
            if any(x in r["command"].lower() for x in ["npm install", "npm ci", "pip install", "apt-get install", "apk add"]):
                install_line = r["line_number"]
                break

        if copy_all_line and install_line and copy_all_line < install_line:
            issues.append({
                "type": "layer-cache-miss",
                "severity": "high",
                "impact": "Cache invalidated on every source code change",
                "fix": "Move COPY package*.json ./ before COPY . . and before RUN npm install",
                "build_time_impact_percent": 70
            })

    return issues


def audit_dockerfile(dockerfile_path: Path) -> Dict:
    """Perform complete audit on single Dockerfile."""
    result = {
        "path": str(dockerfile_path.relative_to(Path.cwd())),
        "size_bytes": dockerfile_path.stat().st_size,
        "base_image": None,
        "issues": [],
        "severity_count": {"high": 0, "medium": 0, "low": 0}
    }

    try:
        with open(dockerfile_path) as f:
            content = f.read()

        data = parse_dockerfile(content)
        result["base_image"] = data.get("base_image")

        # Run all checks
        all_issues = []
        all_issues.extend(check_base_image_optimization(data))
        all_issues.extend(check_multi_stage(data))
        all_issues.extend(check_layer_caching(data))

        result["issues"] = all_issues

        # Count severity
        for issue in all_issues:
            severity = issue.get("severity", "low").lower()
            if severity in result["severity_count"]:
                result["severity_count"][severity] += 1

    except Exception as e:
        result["error"] = str(e)
        result["severity_count"]["error"] = 1

    return result


def main():
    parser = argparse.ArgumentParser(description="Audit Dockerfiles for optimization opportunities")
    parser.add_argument(
        "--repo-path",
        type=Path,
        default=Path("."),
        help="Repository root path"
    )
    parser.add_argument(
        "--output-file",
        type=Path,
        default=Path("audit-log/container-audit.json"),
        help="Output JSON file"
    )
    args = parser.parse_args()

    print(f"\n📦 Container Auditor\n")
    print(f"Repository: {args.repo_path}")
    print(f"Output: {args.output_file}")

    # Find all Dockerfiles
    print(f"\nFinding Dockerfiles...", end=" ", flush=True)
    dockerfiles = find_dockerfiles(args.repo_path)
    print(f"✓ Found {len(dockerfiles)} Dockerfiles")

    # Audit each
    print(f"Auditing Dockerfiles...", end=" ", flush=True)
    results = []
    for dockerfile in dockerfiles:
        result = audit_dockerfile(dockerfile)
        results.append(result)
    print(f"✓ Complete")

    # Generate report
    print(f"Generating audit report...", end=" ", flush=True)

    total_issues = sum(len(r["issues"]) for r in results)
    high_severity = sum(r["severity_count"].get("high", 0) for r in results)
    medium_severity = sum(r["severity_count"].get("medium", 0) for r in results)

    report = {
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
        "total_dockerfiles": len(dockerfiles),
        "dockerfiles_with_issues": sum(1 for r in results if r["issues"]),
        "total_issues": total_issues,
        "severity_breakdown": {
            "high": high_severity,
            "medium": medium_severity,
            "low": sum(r["severity_count"].get("low", 0) for r in results)
        },
        "estimated_improvements": {
            "size_reduction_percent": calculate_size_reduction(results),
            "build_time_savings_percent": calculate_build_time_savings(results),
            "estimated_storage_savings_gb": calculate_storage_savings(results)
        },
        "dockerfiles": sorted(
            results,
            key=lambda x: x["severity_count"]["high"],
            reverse=True
        )
    }

    args.output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output_file, "w") as f:
        json.dump(report, f, indent=2)

    print(f"✓ Complete")

    # Print summary
    print(f"\n{'='*70}")
    print("AUDIT SUMMARY")
    print(f"{'='*70}\n")
    print(f"Total Dockerfiles: {len(dockerfiles)}")
    print(f"Dockerfiles with issues: {report['dockerfiles_with_issues']}")
    print(f"Total issues found: {total_issues}")
    print(f"\nSeverity breakdown:")
    print(f"  🔴 High: {high_severity}")
    print(f"  🟡 Medium: {medium_severity}")
    print(f"\nEstimated improvements:")
    print(f"  Size reduction: {report['estimated_improvements']['size_reduction_percent']}%")
    print(f"  Build time savings: {report['estimated_improvements']['build_time_savings_percent']}%")
    print(f"  Storage savings: {report['estimated_improvements']['estimated_storage_savings_gb']}GB")

    print(f"\nTop issues:")
    for i, result in enumerate(report["dockerfiles"][:5], 1):
        if result["issues"]:
            print(f"  {i}. {result['path']}: {result['severity_count']['high']} high severity issues")

    print(f"\n📄 Report: {args.output_file}")

    return 0 if total_issues == 0 else 1


def calculate_size_reduction(results: List[Dict]) -> int:
    """Estimate aggregate size reduction potential."""
    # Average 30% across all Dockerfiles with non-slim base images
    dockerfiles_with_base_image_issue = sum(
        1 for r in results
        if any(i["type"] == "non-slim-base-image" for i in r["issues"])
    )
    return min(40, 20 + (dockerfiles_with_base_image_issue * 2))


def calculate_build_time_savings(results: List[Dict]) -> int:
    """Estimate aggregate build time savings."""
    dockerfiles_with_cache_issue = sum(
        1 for r in results
        if any(i["type"] == "layer-cache-miss" for i in r["issues"])
    )
    return min(35, 15 + (dockerfiles_with_cache_issue * 3))


def calculate_storage_savings(results: List[Dict]) -> float:
    """Estimate storage savings in GB."""
    # Assume average image is 500MB, 40% reduction
    return (len(results) * 500 * 0.40) / 1024


if __name__ == "__main__":
    sys.exit(main())
