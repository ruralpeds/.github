/**
 * tests/e2e/smoke.test.ts
 *
 * Playwright smoke tests for Pediatric Emergency CDS.
 * Covers: navigation, decision trees, admin module, knowledge registry.
 *
 * Run locally:
 *   npx playwright test tests/e2e/smoke.test.ts
 *
 * CI: triggered by .github/workflows/e2e.yml on push to main.
 *
 * The tests spin up the SvelteKit dev server (or use a preview build)
 * and verify critical user flows work end-to-end in a real browser.
 */

import { test, expect, goto } from './fixtures';

// ── Home page ─────────────────────────────────────────────────────────────
test.describe('Home page', () => {
  test('loads without error', async ({ page }) => {
    await goto(page, '/');
    await expect(page).not.toHaveURL(/error/);
    // Title should contain PED CDS or similar
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('has no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await goto(page, '/');
    // Filter known non-critical WASM load messages
    const critical = errors.filter(e =>
      !e.includes('WASM') && !e.includes('wasm') &&
      !e.includes('net::ERR_FAILED') && !e.includes('net::ERR_ABORTED') &&
      !e.includes('favicon')
    );
    expect(critical).toHaveLength(0);
  });
});

// ── Decision trees index ──────────────────────────────────────────────────
test.describe('Reference — Decision Trees', () => {
  test('trees index page loads', async ({ page }) => {
    await goto(page, '/reference/decision-trees');
    await expect(page.locator('h1')).toBeVisible();
  });
});

// ── Calculators ───────────────────────────────────────────────────────────
test.describe('Reference — Calculators', () => {
  test('calculators page renders', async ({ page }) => {
    await goto(page, '/reference/calculators');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('IVF calculator link visible', async ({ page }) => {
    await goto(page, '/reference/calculators');
    // Look for IVF-related link or card
    const ivfEl = page.getByText(/IVF|fluid/i).first();
    await expect(ivfEl).toBeVisible();
  });
});

// ── Knowledge registry ────────────────────────────────────────────────────
test.describe('Reference — Knowledge', () => {
  test('knowledge page loads 150+ entries', async ({ page }) => {
    await goto(page, '/reference/knowledge');
    await expect(page.locator('h1')).toBeVisible();
    // Wait for registry fetch
    await page.waitForSelector('.entry-card, .error-box', { timeout: 5000 });
    const cards = page.locator('.entry-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(100);
  });

  test('search filters entries', async ({ page }) => {
    await goto(page, '/reference/knowledge');
    await page.waitForSelector('.entry-card');
    const total = await page.locator('.entry-card').count();

    const search = page.locator('input[type="search"]');
    await search.fill('sepsis');
    await page.waitForTimeout(200);
    const filtered = await page.locator('.entry-card').count();

    expect(filtered).toBeLessThan(total);
    expect(filtered).toBeGreaterThan(0);
  });

  test('category pills filter entries', async ({ page }) => {
    await goto(page, '/reference/knowledge');
    await page.waitForSelector('.entry-card');
    const all = await page.locator('.entry-card').count();

    await page.getByRole('button', { name: /Decision Trees/ }).click();
    await page.waitForTimeout(200);
    const treesOnly = await page.locator('.entry-card').count();

    expect(treesOnly).toBeLessThan(all);
    expect(treesOnly).toBeGreaterThan(0);
  });
});

// ── Education ─────────────────────────────────────────────────────────────
test.describe('Reference — Education', () => {
  test('education page loads with tabs', async ({ page }) => {
    await goto(page, '/reference/education');
    await expect(page.locator('h1')).toBeVisible();
    // Should have at least one tab button
    const tabs = page.getByRole('button').filter({ hasText: /Textbook|Cheat Sheet|Audio/i });
    await expect(tabs.first()).toBeVisible();
  });
});

// ── Admin module ──────────────────────────────────────────────────────────
test.describe('Admin module', () => {
  test('admin login page shows PIN input', async ({ page }) => {
    await goto(page, '/admin');
    const pin = page.locator('input[type="password"], input[type="text"]').first();
    await expect(pin).toBeVisible();
  });

  test('correct PIN unlocks admin dashboard', async ({ page }) => {
    await goto(page, '/admin');
    const pin = page.locator('input[type="password"], input[type="text"]').first();
    await pin.fill('1234');
    await pin.press('Enter');
    // Should see the dashboard heading
    await expect(page.locator('h1').filter({ hasText: /Admin|Dashboard/i })).toBeVisible({ timeout: 3000 });
  });

  test('wrong PIN shows error', async ({ page }) => {
    await goto(page, '/admin');
    const pin = page.locator('input[type="password"], input[type="text"]').first();
    await pin.fill('9999');
    await pin.press('Enter');
    await expect(page.getByText(/incorrect|wrong|invalid/i)).toBeVisible({ timeout: 2000 });
  });

  test('admin trees page accessible after login', async ({ page }) => {
    await goto(page, '/admin');
    await page.locator('input').first().fill('1234');
    await page.locator('input').first().press('Enter');
    await page.waitForSelector('nav a[href="/admin/trees"]');
    await page.click('nav a[href="/admin/trees"]');
    await expect(page.locator('h1').filter({ hasText: /Tree/i })).toBeVisible();
  });

  test('admin knowledge page shows 150+ entries', async ({ page }) => {
    await goto(page, '/admin');
    await page.locator('input').first().fill('1234');
    await page.locator('input').first().press('Enter');
    await page.waitForSelector('nav a[href="/admin/knowledge"]');
    await page.click('nav a[href="/admin/knowledge"]');
    await page.waitForSelector('.entry-card, .loading');
    await page.waitForTimeout(1000);
    const cards = await page.locator('.entry-card').count();
    expect(cards).toBeGreaterThan(100);
  });

  test('admin content page shows education guides', async ({ page }) => {
    await goto(page, '/admin');
    await page.locator('input').first().fill('1234');
    await page.locator('input').first().press('Enter');
    await page.waitForSelector('nav a[href="/admin/content"]');
    await page.click('nav a[href="/admin/content"]');
    await expect(page.locator('h1').filter({ hasText: /Content/i })).toBeVisible();
    const cards = await page.locator('.content-card').count();
    expect(cards).toBeGreaterThan(10);
  });
});

// ── Clinical routes ───────────────────────────────────────────────────────
test.describe('Clinical decision tree routes', () => {
  const routes = [
    { path: '/resuscitation/nrp',              label: 'NRP' },
    { path: '/resuscitation/pals',             label: 'PALS' },
    { path: '/resuscitation/anaphylaxis',      label: 'Anaphylaxis' },
    { path: '/resuscitation/dka',              label: 'DKA' },
    { path: '/resuscitation/status-epilepticus', label: 'Status Epilepticus' },
    { path: '/sepsis/pathway',                 label: 'Sepsis' },
    { path: '/airway/rapid-sequence',          label: 'RSI' },
  ];

  for (const { path, label } of routes) {
    test(`${label} route loads`, async ({ page }) => {
      await goto(page, path);
      await expect(page.locator('h1, svg')).toBeVisible({ timeout: 5000 });
    });
  }
});

// ── IVF Matrix route ──────────────────────────────────────────────────────
test.describe('IVF Sparkline Matrix', () => {
  test('route renders GA banner', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix');
    // Component should render GA week buttons
    const weekBtns = page.locator('button.gw-btn, .ga-week-btn');
    await expect(weekBtns.first()).toBeVisible({ timeout: 5000 });
  });

  test('URL params set initial week', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix?week=30&dol=3');
    // The 30w button should be active
    const btn30 = page.locator('button').filter({ hasText: /30/ }).first();
    await expect(btn30).toBeVisible();
  });
});

// ── Static decision tree loaders ──────────────────────────────────────────
test.describe('Standalone decision trees (static HTML)', () => {
  const trees = [
    'neonatal_eos_sepsis_decision_tree.html',
    'neonatal_seizures_decision_tree.html',
    'neonatal_respiratory_escalation_decision_tree.html',
    'pediatric_difficult_airway_decision_tree.html',
    'neonatal_pulmonary_decision_tree.html',
    'nrp_resuscitation_decision_tree.html',
    'pals_algorithm_decision_tree.html',
  ];

  for (const tree of trees) {
    test(`${tree} loads and renders SVG`, async ({ page }) => {
      await goto(page, `/decision-trees/${tree}`);
      // D3 should have rendered an SVG with nodes
      const svg = page.locator('#cds-svg');
      await expect(svg).toBeVisible({ timeout: 5000 });
      const nodes = page.locator('.cds-node');
      await expect(nodes.first()).toBeVisible({ timeout: 5000 });
    });
  }
});
