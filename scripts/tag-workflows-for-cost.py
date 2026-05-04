#!/usr/bin/env python3
"""
tag-workflows-for-cost.py

Add cost attribution tags to all GitHub Actions workflows.
Instruments workflows with team, project, environment, and cost center tags.

Tags are added as environment variables to each workflow:
  COST_TEAM: platform | data | services | web | ops
  COST_PROJECT: gap-analysis | audit-log | ... (repo name)
  COST_ENVIRONMENT: ci | staging | prod
  COST_CRITICALITY: high | medium | low
  COST_CENTER: engineering | devops | research

Usage:
    python3 scripts/tag-workflows-for-cost.py \
        --repo-path /path/to/.github \
        --mapping-file config/cost-mapping.json \
        --backup-dir .github/workflows/.backups

    # Or with defaults:
    python3 scripts/tag-workflows-for-cost.py

Output:
    - Tagged workflows (updated YAML files)
    - Backup directory: .github/workflows/.backups/
    - Report: tag-workflows-report.json
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, Optional
import copy

try:
    import yaml
except ImportError:
    print("Error: PyYAML not installed. Install with: pip install pyyaml")
    sys.exit(1)


def load_mapping(mapping_file: Path) -> Dict[str, Dict[str, str]]:
    """Load workflow-to-team mapping from JSON file."""
    if not mapping_file.exists():
        # Return default mapping
        return {
            "gap-dashboard": {
                "team": "platform",
                "project": "gap-analysis",
                "environment": "ci",
                "criticality": "high",
                "cost_center": "engineering",
            },
            "gap-notifications": {
                "team": "platform",
                "project": "gap-analysis",
                "environment": "ci",
                "criticality": "high",
                "cost_center": "engineering",
            },
            "deadline-breach-notification": {
                "team": "platform",
                "project": "gap-analysis",
                "environment": "ci",
                "criticality": "high",
                "cost_center": "engineering",
            },
            "batch-job-executor-kubernetes": {
                "team": "platform",
                "project": "gap-analysis",
                "environment": "ci",
                "criticality": "high",
                "cost_center": "engineering",
            },
        }

    try:
        with open(mapping_file) as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️  Failed to load mapping file: {e}")
        print("  Using default mapping")
        return {}


def get_workflow_tags(workflow_name: str, mapping: Dict) -> Dict[str, str]:
    """Get cost tags for a workflow."""
    if workflow_name in mapping:
        return mapping[workflow_name]

    # Default tags for unmapped workflows
    return {
        "team": "unknown",
        "project": "other",
        "environment": "ci",
        "criticality": "medium",
        "cost_center": "engineering",
    }


def create_cost_env_vars(tags: Dict[str, str]) -> Dict[str, str]:
    """Create environment variables from cost tags."""
    return {
        "COST_TEAM": tags.get("team", "unknown"),
        "COST_PROJECT": tags.get("project", "other"),
        "COST_ENVIRONMENT": tags.get("environment", "ci"),
        "COST_CRITICALITY": tags.get("criticality", "medium"),
        "COST_CENTER": tags.get("cost_center", "engineering"),
    }


def inject_cost_tags(workflow_dict: Dict, tags: Dict[str, str]) -> Dict:
    """Inject cost tags into workflow YAML structure."""
    # Create a copy to avoid modifying original
    workflow = copy.deepcopy(workflow_dict)

    # Get or create env section in workflow
    if "env" not in workflow:
        workflow["env"] = {}

    # Add cost tags (don't override existing)
    cost_env = create_cost_env_vars(tags)
    for key, value in cost_env.items():
        if key not in workflow["env"]:
            workflow["env"][key] = value

    # Optionally inject into each job as well (for better job-level visibility)
    if "jobs" in workflow and isinstance(workflow["jobs"], dict):
        for job_name, job_config in workflow["jobs"].items():
            if not isinstance(job_config, dict):
                continue
            if "env" not in job_config:
                job_config["env"] = {}

            for key, value in cost_env.items():
                if key not in job_config["env"]:
                    job_config["env"][key] = value

    return workflow


def tag_workflow_file(
    workflow_path: Path,
    mapping: Dict,
    backup_dir: Path,
    dry_run: bool = False
) -> Dict[str, any]:
    """Tag a single workflow file."""
    result = {
        "file": str(workflow_path.relative_to(workflow_path.parent.parent.parent)),
        "status": "unknown",
        "tags_added": {},
        "error": None,
    }

    try:
        # Read workflow file
        with open(workflow_path) as f:
            content = f.read()
            try:
                workflow = yaml.safe_load(content)
            except yaml.YAMLError as e:
                result["status"] = "error"
                result["error"] = f"Invalid YAML: {e}"
                return result

        # Get workflow name (from file or from 'name' field)
        workflow_name = workflow.get("name", workflow_path.stem)

        # Get tags for this workflow
        tags = get_workflow_tags(workflow_name, mapping)

        # Inject tags
        tagged_workflow = inject_cost_tags(workflow, tags)

        # Check if anything changed
        changed = yaml.safe_dump(tagged_workflow) != content

        if not changed:
            result["status"] = "unchanged"
            result["tags_added"] = tags
            return result

        if not dry_run:
            # Create backup
            backup_dir.mkdir(parents=True, exist_ok=True)
            backup_path = backup_dir / workflow_path.name
            with open(backup_path, "w") as f:
                f.write(content)

            # Write tagged workflow
            with open(workflow_path, "w") as f:
                yaml.safe_dump(tagged_workflow, f, default_flow_style=False, sort_keys=False)

        result["status"] = "tagged" if changed else "unchanged"
        result["tags_added"] = tags

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)

    return result


def main():
    parser = argparse.ArgumentParser(description="Add cost attribution tags to workflows")
    parser.add_argument(
        "--repo-path",
        type=Path,
        default=Path(".github"),
        help="Path to .github directory"
    )
    parser.add_argument(
        "--mapping-file",
        type=Path,
        default=Path("config/cost-mapping.json"),
        help="Cost mapping configuration file"
    )
    parser.add_argument(
        "--backup-dir",
        type=Path,
        default=Path(".github/workflows/.backups"),
        help="Directory for workflow backups"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without modifying files"
    )
    args = parser.parse_args()

    workflows_dir = args.repo_path / "workflows"
    if not workflows_dir.exists():
        print(f"❌ Workflows directory not found: {workflows_dir}")
        return 1

    print(f"\n📋 Cost Attribution Workflow Tagging\n")
    print(f"Workflows directory: {workflows_dir}")
    print(f"Mapping file: {args.mapping_file}")
    print(f"Dry run: {args.dry_run}\n")

    # Load mapping
    mapping = load_mapping(args.mapping_file)

    # Find all workflow files
    workflow_files = sorted(workflows_dir.glob("*.yml")) + sorted(workflows_dir.glob("*.yaml"))
    print(f"Found {len(workflow_files)} workflows\n")

    # Process each workflow
    results = []
    tagged_count = 0
    unchanged_count = 0
    error_count = 0

    for workflow_file in workflow_files:
        result = tag_workflow_file(workflow_file, mapping, args.backup_dir, args.dry_run)
        results.append(result)

        status_icon = {
            "tagged": "✅",
            "unchanged": "⚪",
            "error": "❌",
        }.get(result["status"], "❓")

        print(f"{status_icon} {result['file']}")

        if result["status"] == "tagged":
            tagged_count += 1
        elif result["status"] == "unchanged":
            unchanged_count += 1
        elif result["status"] == "error":
            error_count += 1
            print(f"    Error: {result['error']}")

        if result["tags_added"]:
            for key, value in result["tags_added"].items():
                print(f"    {key}: {value}")

    # Print summary
    print(f"\n{'='*70}")
    print("TAGGING SUMMARY")
    print(f"{'='*70}\n")
    print(f"Total workflows: {len(workflow_files)}")
    print(f"Tagged: {tagged_count}")
    print(f"Unchanged: {unchanged_count}")
    print(f"Errors: {error_count}")

    if args.dry_run:
        print(f"\n🔍 DRY RUN: No files modified")
    else:
        if tagged_count > 0:
            print(f"\n✅ Backups created: {args.backup_dir}")
        print(f"\n📄 Report saved: tag-workflows-report.json")

    # Write report
    report = {
        "timestamp": __import__("datetime").datetime.now().isoformat(),
        "dry_run": args.dry_run,
        "total": len(workflow_files),
        "tagged": tagged_count,
        "unchanged": unchanged_count,
        "errors": error_count,
        "workflows": results,
    }

    with open("tag-workflows-report.json", "w") as f:
        json.dump(report, f, indent=2)

    return 0 if error_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
