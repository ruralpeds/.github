/**
 * tests/e2e/visual-regression.test.ts
 *
 * Visual regression tests using Playwright screenshot comparison.
 * Captures screenshots of key pages and compares against baselines.
 *
 * First run creates baseline snapshots in tests/e2e/visual-regression.test.ts-snapshots/.
 * Subsequent runs compare against baselines and fail on visual differences.
 *
 * To update baselines: npx playwright test visual-regression --update-snapshots
 */

import { test, expect, goto, setMode } from './fixtures';

// Allow 2% pixel difference threshold for rendering variance
const SCREENSHOT_OPTIONS = {
  maxDiffPixelRatio: 0.02,
  threshold: 0.3,
};

// ── Home Page Snapshots ──────────────────────────────────────────────────────

test.describe('Visual Regression — Home', () => {
  test('home page — pediatric mode', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('home-pediatric.png', SCREENSHOT_OPTIONS);
  });

  test('home page — neonatal mode', async ({ page }) => {
    await setMode(page, 'neonatal');
    await goto(page, '/');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('home-neonatal.png', SCREENSHOT_OPTIONS);
  });
});

// ── Theme Snapshots ──────────────────────────────────────────────────────────

test.describe('Visual Regression — Themes', () => {
  test('home page — dark theme', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');

    // Switch to dark theme
    await page.locator('.theme-toggle__select').selectOption({ label: 'Clinical Dark' });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('home-dark-theme.png', SCREENSHOT_OPTIONS);
  });

  test('home page — high contrast theme', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');

    await page.locator('.theme-toggle__select').selectOption({ label: 'High Contrast' });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('home-high-contrast.png', SCREENSHOT_OPTIONS);
  });
});

// ── Clinical Route Snapshots ─────────────────────────────────────────────────

test.describe('Visual Regression — Clinical Routes', () => {
  test('reference knowledge page', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/reference/knowledge');
    await page.waitForSelector('.entry-card', { timeout: 5000 });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('reference-knowledge.png', SCREENSHOT_OPTIONS);
  });

  test('reference education page', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/reference/education');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('reference-education.png', SCREENSHOT_OPTIONS);
  });

  test('calculators page', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/reference/calculators');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('reference-calculators.png', SCREENSHOT_OPTIONS);
  });
});

// ── Decision Tree Snapshots ──────────────────────────────────────────────────

test.describe('Visual Regression — Decision Trees', () => {
  const trees = [
    { file: 'pals_algorithm_decision_tree.html', name: 'pals-tree' },
    { file: 'nrp_resuscitation_decision_tree.html', name: 'nrp-tree' },
    { file: 'neonatal_eos_sepsis_decision_tree.html', name: 'eos-sepsis-tree' },
  ];

  for (const { file, name } of trees) {
    test(`${name} renders consistently`, async ({ page }) => {
      await goto(page, `/decision-trees/${file}`);
      await page.locator('#tc').waitFor({ state: 'visible', timeout: 8000 });
      await page.locator('.ng').first().waitFor({ state: 'visible', timeout: 8000 });
      await page.waitForTimeout(1000); // D3 animations settle

      await expect(page).toHaveScreenshot(`${name}.png`, {
        ...SCREENSHOT_OPTIONS,
        maxDiffPixelRatio: 0.05, // Trees have more rendering variance
      });
    });
  }
});

// ── IVF Matrix Snapshots ─────────────────────────────────────────────────────

test.describe('Visual Regression — IVF Matrix', () => {
  test('IVF matrix at GA 28 weeks', async ({ page }) => {
    await setMode(page, 'neonatal');
    await goto(page, '/neonatal/ivf-matrix?week=28');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('ivf-matrix-28w.png', {
      ...SCREENSHOT_OPTIONS,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('IVF matrix at GA 36 weeks', async ({ page }) => {
    await setMode(page, 'neonatal');
    await goto(page, '/neonatal/ivf-matrix?week=36');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('ivf-matrix-36w.png', {
      ...SCREENSHOT_OPTIONS,
      maxDiffPixelRatio: 0.05,
    });
  });
});

// ── Admin Snapshots ──────────────────────────────────────────────────────────

test.describe('Visual Regression — Admin', () => {
  test('admin login page', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/admin');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('admin-login.png', SCREENSHOT_OPTIONS);
  });

  test('admin dashboard after login', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/admin');
    await page.locator('input').first().fill('1234');
    await page.locator('input').first().press('Enter');
    await page.waitForSelector('h1', { timeout: 3000 });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('admin-dashboard.png', SCREENSHOT_OPTIONS);
  });
});

// ── Mobile Snapshots ─────────────────────────────────────────────────────────

test.describe('Visual Regression — Mobile', () => {
  test('home page at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await setMode(page, 'pediatric');
    await goto(page, '/');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('home-mobile.png', SCREENSHOT_OPTIONS);
  });
});
