/**
 * tests/e2e/navigation.test.ts
 *
 * Navigation, routing, and layout tests.
 * Covers: app shell, sidebar nav, domain routes, mode-filtered navigation.
 */

import { test, expect, goto, setMode, ClinicalNavPO } from './fixtures';

// ── App Shell ────────────────────────────────────────────────────────────────

test.describe('App Shell', () => {
  test('renders header with logo', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.logo-mark')).toHaveText('PED');
    await expect(page.locator('.logo-text')).toHaveText('CDS');
  });

  test('renders subtitle', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    await expect(page.locator('.header-subtitle')).toContainText('Pediatric Emergency');
  });

  test('renders sidebar navigation', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    const nav = new ClinicalNavPO(page);
    await expect(nav.nav).toBeVisible();
  });

  test('renders main content area', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    await expect(page.locator('.app-main')).toBeVisible();
  });
});

// ── Sidebar Navigation ──────────────────────────────────────────────────────

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'pediatric');
  });

  test('shows all clinical domains in pediatric mode', async ({ page }) => {
    await goto(page, '/');
    const nav = new ClinicalNavPO(page);
    for (const domain of ['Resuscitation', 'Airway', 'Sepsis', 'Reference']) {
      await expect(nav.sectionHeader(domain)).toBeVisible();
    }
  });

  test('highlights active section on navigation', async ({ page }) => {
    await goto(page, '/resuscitation');
    const nav = new ClinicalNavPO(page);
    await expect(nav.section('Resuscitation')).toHaveClass(/active/);
  });

  test('expands children for active section', async ({ page }) => {
    await goto(page, '/resuscitation');
    const nav = new ClinicalNavPO(page);
    const children = nav.section('Resuscitation').locator('.nav-children');
    await expect(children).toBeVisible();
  });

  test('clicking section header navigates to hub page', async ({ page }) => {
    await goto(page, '/');
    const nav = new ClinicalNavPO(page);
    await nav.sectionHeader('Reference').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/reference/);
  });

  test('clicking child link navigates to sub-route', async ({ page }) => {
    await goto(page, '/reference');
    const nav = new ClinicalNavPO(page);
    await nav.child('Decision Trees').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/reference\/decision-trees/);
  });
});

// ── Neonatal Mode Navigation ─────────────────────────────────────────────────

test.describe('Neonatal Mode Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'neonatal');
  });

  test('shows neonatal domain in sidebar', async ({ page }) => {
    await goto(page, '/');
    const nav = new ClinicalNavPO(page);
    await expect(nav.sectionHeader('Neonatal')).toBeVisible();
  });

  test('IVF Sparkline Matrix is visible in neonatal nav', async ({ page }) => {
    await goto(page, '/neonatal');
    const nav = new ClinicalNavPO(page);
    await expect(nav.child('IVF Sparkline Matrix')).toBeVisible();
  });
});

// ── All Hub Routes Load ──────────────────────────────────────────────────────

test.describe('Hub Pages Load', () => {
  const hubRoutes = [
    { path: '/resuscitation', label: 'Resuscitation' },
    { path: '/airway', label: 'Airway' },
    { path: '/sepsis', label: 'Sepsis' },
    { path: '/reference', label: 'Reference' },
  ];

  for (const { path, label } of hubRoutes) {
    test(`${label} hub page loads`, async ({ page }) => {
      await setMode(page, 'pediatric');
      await goto(page, path);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page).not.toHaveURL(/error/);
    });
  }
});

// ── Deep Routes Load ─────────────────────────────────────────────────────────

test.describe('Deep Clinical Routes', () => {
  const routes = [
    { path: '/resuscitation/nrp', label: 'NRP', mode: 'neonatal' as const },
    { path: '/resuscitation/pals', label: 'PALS', mode: 'pediatric' as const },
    { path: '/resuscitation/anaphylaxis', label: 'Anaphylaxis', mode: 'pediatric' as const },
    { path: '/resuscitation/bradycardia', label: 'Bradycardia', mode: 'pediatric' as const },
    { path: '/resuscitation/tachycardia', label: 'Tachycardia', mode: 'pediatric' as const },
    { path: '/resuscitation/status-epilepticus', label: 'Status Epilepticus', mode: 'pediatric' as const },
    { path: '/resuscitation/dka', label: 'DKA', mode: 'pediatric' as const },
    { path: '/airway/rapid-sequence', label: 'RSI', mode: 'pediatric' as const },
    { path: '/sepsis/pathway', label: 'Sepsis Pathway', mode: 'pediatric' as const },
    { path: '/neonatal/ivf-matrix', label: 'IVF Matrix', mode: 'neonatal' as const },
    { path: '/reference/decision-trees', label: 'Decision Trees', mode: 'pediatric' as const },
    { path: '/reference/calculators', label: 'Calculators', mode: 'pediatric' as const },
    { path: '/reference/education', label: 'Education', mode: 'pediatric' as const },
    { path: '/reference/knowledge', label: 'Knowledge', mode: 'pediatric' as const },
  ];

  for (const { path, label, mode } of routes) {
    test(`${label} route (${mode}) loads without error`, async ({ page }) => {
      await setMode(page, mode);
      await goto(page, path);
      await expect(page.locator('h1, svg, .hero')).toBeVisible({ timeout: 8000 });
      await expect(page).not.toHaveURL(/error/);
    });
  }
});

// ── Logo Navigates Home ──────────────────────────────────────────────────────

test.describe('Logo Navigation', () => {
  test('clicking logo returns to home', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/reference/knowledge');
    await page.locator('.app-logo').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL('/');
  });
});
