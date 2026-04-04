#!/usr/bin/env python3
"""
check_compliance.py — Org-wide CI/audit compliance scanner.

Queries the GitHub API for all repositories in an org and checks each one
for the presence of CI workflows, audit logging, Playwright testing, and
review stamps. Outputs a JSON compliance matrix and a human-readable report.

Usage:
    python check_compliance.py <org> [--token TOKEN] [--output OUTPUT_DIR]
"""

import argparse
import json
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path


REQUIRED_WORKFLOWS = {
    "ci": [
        ".github/workflows/ci-node.yml",
        ".github/workflows/ci-python.yml",
        ".github/workflows/ci-rust.yml",
        ".github/workflows/ci-go.yml",
        ".github/workflows/ci-julia.yml",
        ".github/workflows/ci.yml",
    ],
    "audit": [".github/workflows/audit-log.yml"],
    "playwright": [".github/workflows/e2e-playwright.yml"],
    "review": [".github/workflows/review-stamp.yml"],
}

LANG_FILES = {
    "node": ["package.json"],
    "python": ["pyproject.toml", "setup.py", "setup.cfg", "requirements.txt"],
    "rust": ["Cargo.toml"],
    "go": ["go.mod"],
    "julia": ["Project.toml"],
}


def gh_get(path: str, token: str) -> dict | list | None:
    """Make a GitHub API GET request."""
    url = f"https://api.github.com{path}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def gh_get_all_pages(path: str, token: str) -> list:
    """Fetch all pages of a paginated GitHub API endpoint."""
    results = []
    page = 1
    while True:
        sep = "&" if "?" in path else "?"
        data = gh_get(f"{path}{sep}per_page=100&page={page}", token)
        if not data:
            break
        if isinstance(data, list):
            results.extend(data)
            if len(data) < 100:
                break
        else:
            results.append(data)
            break
        page += 1
    return results


def get_repos(org: str, token: str) -> list[dict]:
    """List all non-archived repos for the org/user."""
    # Try org endpoint first, fall back to user endpoint
    try:
        repos = gh_get_all_pages(f"/orgs/{org}/repos?type=all", token)
    except urllib.error.HTTPError:
        repos = gh_get_all_pages(f"/users/{org}/repos?type=owner", token)
    return [r for r in repos if not r.get("archived", False) and r["name"] != ".github"]


def file_exists(owner: str, repo: str, path: str, token: str) -> bool:
    """Check if a file exists in a repo."""
    result = gh_get(f"/repos/{owner}/{repo}/contents/{path}", token)
    return result is not None


def detect_languages(owner: str, repo: str, token: str) -> list[str]:
    """Detect languages present in a repo by checking indicator files."""
    found = []
    for lang, files in LANG_FILES.items():
        for f in files:
            if file_exists(owner, repo, f, token):
                found.append(lang)
                break
    return found


def check_repo(owner: str, repo_name: str, token: str) -> dict:
    """Check a single repo for compliance."""
    languages = detect_languages(owner, repo_name, token)

    # Check which CI workflows are present
    has_ci = any(file_exists(owner, repo_name, p, token) for p in REQUIRED_WORKFLOWS["ci"])
    has_audit = any(file_exists(owner, repo_name, p, token) for p in REQUIRED_WORKFLOWS["audit"])
    has_playwright = any(file_exists(owner, repo_name, p, token) for p in REQUIRED_WORKFLOWS["playwright"])
    has_review = any(file_exists(owner, repo_name, p, token) for p in REQUIRED_WORKFLOWS["review"])

    # Check if audit ledger exists with review stamp
    ledger_raw = gh_get(f"/repos/{owner}/{repo_name}/contents/audit-log/ledger.json", token)
    date_last_reviewed = None
    date_created = None
    date_last_modified = None
    if ledger_raw and isinstance(ledger_raw, dict) and ledger_raw.get("encoding") == "base64":
        try:
            import base64
            content = base64.b64decode(ledger_raw["content"]).decode()
            ledger = json.loads(content)
            summary = ledger.get("summary", {})
            date_last_reviewed = summary.get("date_last_reviewed")
            date_created = summary.get("date_created")
            date_last_modified = summary.get("date_last_modified")
        except Exception:
            pass

    missing = []
    if not has_ci:
        missing.append("ci_workflow")
    if not has_audit:
        missing.append("audit_workflow")
    if languages and not date_last_reviewed:
        missing.append("review_stamp")

    return {
        "repo": repo_name,
        "languages": languages,
        "has_ci": has_ci,
        "has_audit": has_audit,
        "has_playwright": has_playwright,
        "has_review_stamp_workflow": has_review,
        "date_created": date_created,
        "date_last_modified": date_last_modified,
        "date_last_reviewed": date_last_reviewed,
        "missing": missing,
        "compliant": len(missing) == 0,
    }


def generate_html_report(results: list[dict], org: str, checked_at: str) -> str:
    """Generate an HTML compliance report."""
    rows = ""
    for r in results:
        status = "✅" if r["compliant"] else "❌"
        missing_str = ", ".join(r["missing"]) if r["missing"] else "—"
        langs = ", ".join(r["languages"]) if r["languages"] else "unknown"
        reviewed = r["date_last_reviewed"] or "never"
        rows += f"""
        <tr class="{'compliant' if r['compliant'] else 'non-compliant'}">
          <td><a href="https://github.com/{org}/{r['repo']}" target="_blank">{r['repo']}</a></td>
          <td>{status}</td>
          <td>{langs}</td>
          <td>{'✅' if r['has_ci'] else '❌'}</td>
          <td>{'✅' if r['has_audit'] else '❌'}</td>
          <td>{'✅' if r['has_playwright'] else '❌'}</td>
          <td>{reviewed[:10] if reviewed != 'never' else 'never'}</td>
          <td class="missing">{missing_str}</td>
        </tr>"""

    total = len(results)
    compliant = sum(1 for r in results if r["compliant"])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{org} — CI Compliance Report</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 2em; background: #f6f8fa; }}
    h1 {{ color: #24292f; }}
    .summary {{ background: #fff; border: 1px solid #d0d7de; border-radius: 6px; padding: 1em 2em; margin-bottom: 1.5em; display: flex; gap: 2em; }}
    .stat {{ text-align: center; }}
    .stat .number {{ font-size: 2em; font-weight: bold; color: #0969da; }}
    .stat .label {{ color: #57606a; font-size: 0.9em; }}
    table {{ width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #d0d7de; border-radius: 6px; overflow: hidden; }}
    th {{ background: #f6f8fa; padding: 0.6em 1em; text-align: left; border-bottom: 1px solid #d0d7de; font-size: 0.85em; color: #57606a; text-transform: uppercase; }}
    td {{ padding: 0.6em 1em; border-bottom: 1px solid #eaecef; font-size: 0.9em; }}
    tr:last-child td {{ border-bottom: none; }}
    .non-compliant td {{ background: #fff8f0; }}
    .missing {{ color: #cf222e; font-size: 0.85em; }}
    .checked-at {{ color: #57606a; font-size: 0.85em; margin-top: 1em; }}
  </style>
</head>
<body>
  <h1>🔍 {org} CI &amp; Audit Compliance Report</h1>
  <div class="summary">
    <div class="stat"><div class="number">{total}</div><div class="label">Repos Scanned</div></div>
    <div class="stat"><div class="number" style="color:#1a7f37">{compliant}</div><div class="label">Compliant</div></div>
    <div class="stat"><div class="number" style="color:#cf222e">{total - compliant}</div><div class="label">Non-Compliant</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Repository</th><th>Status</th><th>Languages</th>
        <th>CI</th><th>Audit</th><th>Playwright</th>
        <th>Last Reviewed</th><th>Missing</th>
      </tr>
    </thead>
    <tbody>{rows}
    </tbody>
  </table>
  <p class="checked-at">Report generated: {checked_at}</p>
</body>
</html>"""


def main():
    parser = argparse.ArgumentParser(description="Check CI/audit compliance for all org repos")
    parser.add_argument("org", help="GitHub org or username")
    parser.add_argument("--token", help="GitHub token (or set GITHUB_TOKEN env var)")
    parser.add_argument("--output", default="compliance-report", help="Output directory")
    parser.add_argument("--fail-on-non-compliant", action="store_true",
                        help="Exit with code 1 if any repos are non-compliant")
    args = parser.parse_args()

    import os
    token = args.token or os.environ.get("GITHUB_TOKEN") or os.environ.get("REPO_SETUP_TOKEN")
    if not token:
        print("::error::GitHub token required (--token or GITHUB_TOKEN env var)")
        sys.exit(1)

    org = args.org
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Scanning repos for: {org}")
    repos = get_repos(org, token)
    print(f"Found {len(repos)} active repos")

    results = []
    for repo in repos:
        name = repo["name"]
        print(f"  Checking {name}...", end=" ", flush=True)
        try:
            result = check_repo(org, name, token)
            results.append(result)
            status = "✅" if result["compliant"] else f"❌ missing: {', '.join(result['missing'])}"
            print(status)
        except Exception as e:
            print(f"ERROR: {e}")
            results.append({"repo": name, "error": str(e), "compliant": False, "missing": ["error"]})

    checked_at = datetime.now(timezone.utc).isoformat()

    # Write JSON report
    report = {
        "org": org,
        "checked_at": checked_at,
        "total": len(results),
        "compliant": sum(1 for r in results if r.get("compliant")),
        "repos": results,
    }
    json_path = output_dir / "compliance.json"
    json_path.write_text(json.dumps(report, indent=2) + "\n")
    print(f"\nJSON report: {json_path}")

    # Write HTML report
    html_path = output_dir / "compliance.html"
    html_path.write_text(generate_html_report(results, org, checked_at))
    print(f"HTML report: {html_path}")

    # Print summary table to stdout
    print(f"\n{'Repo':<40} {'CI':^4} {'Audit':^6} {'PW':^4} {'Reviewed':^12} Missing")
    print("-" * 90)
    for r in results:
        if "error" in r:
            print(f"{r['repo']:<40} ERROR: {r['error']}")
            continue
        reviewed = (r.get("date_last_reviewed") or "never")[:10]
        missing = ", ".join(r["missing"]) if r["missing"] else "—"
        print(
            f"{r['repo']:<40} "
            f"{'✅' if r['has_ci'] else '❌':^4} "
            f"{'✅' if r['has_audit'] else '❌':^6} "
            f"{'✅' if r['has_playwright'] else '❌':^4} "
            f"{reviewed:^12} {missing}"
        )

    non_compliant = [r["repo"] for r in results if not r.get("compliant")]
    if non_compliant:
        print(f"\n⚠️  {len(non_compliant)} non-compliant repos: {', '.join(non_compliant)}")

    # Set GitHub Actions outputs
    gha_output = os.environ.get("GITHUB_OUTPUT")
    if gha_output:
        with open(gha_output, "a") as f:
            f.write(f"total={len(results)}\n")
            f.write(f"compliant={sum(1 for r in results if r.get('compliant'))}\n")
            f.write(f"non_compliant={len(non_compliant)}\n")
            f.write(f"json_report={json_path}\n")
            f.write(f"html_report={html_path}\n")

    if args.fail_on_non_compliant and non_compliant:
        sys.exit(1)


if __name__ == "__main__":
    main()
