/**
 * audit.spec.ts — Playwright audit of CI/Actions status for all org repos.
 *
 * Reads the compliance report JSON produced by check_compliance.py and
 * navigates to each repo's GitHub Actions page, capturing screenshots
 * and verifying workflow presence. Produces a visual audit trail.
 *
 * Environment variables:
 *   GITHUB_TOKEN   — Fine-grained PAT with repo read access (for API calls)
 *   AUDIT_ORG      — GitHub org/username to audit (default: timothyhartzog)
 *   COMPLIANCE_JSON — Path to compliance.json from check_compliance.py
 */

import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const ORG = process.env.AUDIT_ORG || "timothyhartzog";
const COMPLIANCE_JSON = process.env.COMPLIANCE_JSON || "compliance-report/compliance.json";

interface RepoResult {
  repo: string;
  has_ci: boolean;
  has_audit: boolean;
  has_playwright: boolean;
  has_review_stamp_workflow: boolean;
  date_created: string | null;
  date_last_modified: string | null;
  date_last_reviewed: string | null;
  languages: string[];
  missing: string[];
  compliant: boolean;
  error?: string;
}

interface ComplianceReport {
  org: string;
  checked_at: string;
  total: number;
  compliant: number;
  repos: RepoResult[];
}

function loadComplianceReport(): ComplianceReport | null {
  if (fs.existsSync(COMPLIANCE_JSON)) {
    try {
      return JSON.parse(fs.readFileSync(COMPLIANCE_JSON, "utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

// ---- Helper: navigate to a repo's Actions tab and take a screenshot ----
async function captureActionsPage(page: Page, org: string, repo: string): Promise<void> {
  await page.goto(`/${org}/${repo}/actions`, { waitUntil: "domcontentloaded" });
  // Wait for any recognizable Actions-page element. GitHub may render a workflow
  // list, a "no workflows" blankslate, or a generic heading depending on the repo.
  // We try each selector individually so Playwright gives a clear error if none match.
  for (const selector of [
    '[data-testid="workflow-list"]',
    ".blankslate",
    ".Box-header",
    "h2",
  ]) {
    try {
      await page.waitForSelector(selector, { timeout: 5_000 });
      return;
    } catch {
      // Try next selector
    }
  }
  // No selector matched — fall through and screenshot whatever is present
}

// ---- Tests ----

test.describe(`${ORG} — CI/Audit Compliance Audit`, () => {
  let report: ComplianceReport | null;

  test.beforeAll(() => {
    report = loadComplianceReport();
  });

  test("compliance report exists and is valid", async () => {
    expect(
      fs.existsSync(COMPLIANCE_JSON),
      `Compliance JSON not found at ${COMPLIANCE_JSON}. Run check_compliance.py first.`
    ).toBe(true);
    expect(report).not.toBeNull();
    expect(report!.org).toBe(ORG);
    expect(report!.repos.length).toBeGreaterThan(0);
  });

  test("all repos have CI workflows", async ({ page }) => {
    if (!report) test.skip();
    const missing = report!.repos.filter((r) => !r.has_ci && !r.error);
    for (const r of missing) {
      await captureActionsPage(page, ORG, r.repo);
      await page.screenshot({
        path: `playwright-results/missing-ci-${r.repo}.png`,
        fullPage: false,
      });
    }
    expect(
      missing.map((r) => r.repo),
      `Repos missing CI workflow`
    ).toEqual([]);
  });

  test("all repos have audit-log workflow", async ({ page }) => {
    if (!report) test.skip();
    const missing = report!.repos.filter((r) => !r.has_audit && !r.error);
    for (const r of missing) {
      await captureActionsPage(page, ORG, r.repo);
      await page.screenshot({
        path: `playwright-results/missing-audit-${r.repo}.png`,
        fullPage: false,
      });
    }
    expect(
      missing.map((r) => r.repo),
      `Repos missing audit-log workflow`
    ).toEqual([]);
  });

  test("all repos have been reviewed at least once", async ({ page }) => {
    if (!report) test.skip();
    const neverReviewed = report!.repos.filter(
      (r) => !r.date_last_reviewed && r.languages.length > 0 && !r.error
    );
    for (const r of neverReviewed) {
      await page.goto(`/${ORG}/${r.repo}`, { waitUntil: "domcontentloaded" });
      await page.screenshot({
        path: `playwright-results/never-reviewed-${r.repo}.png`,
        fullPage: false,
      });
    }
    expect(
      neverReviewed.map((r) => r.repo),
      `Repos that have never had a review stamp`
    ).toEqual([]);
  });

  test("snapshot: GitHub Actions status for each repo", async ({ page }) => {
    if (!report) test.skip();
    const resultsDir = "playwright-results/actions-snapshots";
    fs.mkdirSync(resultsDir, { recursive: true });

    const maxRepos = parseInt(process.env.AUDIT_MAX_REPOS || "20", 10);
    for (const r of report!.repos.slice(0, maxRepos)) {
      await captureActionsPage(page, ORG, r.repo);
      await page.screenshot({
        path: path.join(resultsDir, `${r.repo}.png`),
        fullPage: false,
      });
    }
  });

  test("generate audit summary HTML", async () => {
    if (!report) test.skip();

    const rows = report!.repos
      .map((r) => {
        const status = r.compliant ? "✅" : "❌";
        const missing = r.missing.length ? r.missing.join(", ") : "—";
        return `<tr>
          <td><a href="https://github.com/${ORG}/${r.repo}" target="_blank">${r.repo}</a></td>
          <td>${status}</td>
          <td>${r.languages.join(", ") || "?"}</td>
          <td>${r.has_ci ? "✅" : "❌"}</td>
          <td>${r.has_audit ? "✅" : "❌"}</td>
          <td>${r.has_playwright ? "✅" : "❌"}</td>
          <td>${r.date_last_reviewed ? r.date_last_reviewed.slice(0, 10) : "never"}</td>
          <td style="color:#cf222e;font-size:0.85em">${missing}</td>
        </tr>`;
      })
      .join("\n");

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${ORG} Playwright Audit</title>
<style>
  body{font-family:sans-serif;margin:2em;background:#f6f8fa}
  table{border-collapse:collapse;width:100%;background:#fff;border:1px solid #d0d7de}
  th,td{padding:.5em 1em;border-bottom:1px solid #eaecef;text-align:left}
  th{background:#f6f8fa;font-size:.8em;text-transform:uppercase;color:#57606a}
</style>
</head>
<body>
<h1>🎭 ${ORG} Playwright CI Audit</h1>
<p>Generated: ${new Date().toISOString()}</p>
<table>
<thead><tr><th>Repo</th><th>Status</th><th>Languages</th><th>CI</th><th>Audit</th><th>Playwright</th><th>Last Reviewed</th><th>Missing</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</body></html>`;

    fs.mkdirSync("playwright-results", { recursive: true });
    fs.writeFileSync("playwright-results/audit-summary.html", html);
    expect(fs.existsSync("playwright-results/audit-summary.html")).toBe(true);
  });
});
