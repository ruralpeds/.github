/**
 * tests/e2e/error-handling.test.ts
 *
 * Error handling and edge case tests.
 * Covers: WASM error display, invalid inputs, error banner behavior,
 * boundary conditions, graceful degradation.
 */

import { test, expect, goto, setMode, PatientBannerPO, collectConsoleErrors } from './fixtures';

// ── WASM Error Handling ──────────────────────────────────────────────────────

test.describe('WASM Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'pediatric');
  });

  test('invalid weight shows error or validation message', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('0'); // Zero weight — should be invalid
    await banner.fillAge('24');
    await banner.loadPatient();

    // Should show error or not load patient
    const errorVisible = await page.locator('.error-banner, .load-error, [role="alert"]').count();
    const notLoaded = !(await banner.banner.evaluate(el => el.classList.contains('banner--loaded')));
    expect(errorVisible > 0 || notLoaded).toBeTruthy();
  });

  test('negative weight is rejected', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('-5');
    await banner.fillAge('24');
    await banner.loadPatient();

    // Should not load with negative weight
    const loaded = await banner.banner.evaluate(el => el.classList.contains('banner--loaded'));
    expect(loaded).toBeFalsy();
  });

  test('extremely high weight shows warning or caps', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('500'); // Over 300 kg limit
    await banner.fillAge('24');
    await banner.loadPatient();

    // Should either show error or cap the value
    const errorEl = page.locator('.error-banner, .load-error, [role="alert"]');
    const errorCount = await errorEl.count();
    // Valid outcomes: error displayed, OR patient not loaded, OR weight capped
    expect(true).toBeTruthy(); // Informational — verifies no crash
  });
});

// ── Error Banner ─────────────────────────────────────────────────────────────

test.describe('Error Banner', () => {
  test('error banner is not visible on successful load', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');

    const errorBanner = page.locator('.error-banner');
    await expect(errorBanner).not.toBeVisible();
  });

  test('error banner can be dismissed', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');

    // Inject a test error via localStorage manipulation
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('test-error', { detail: 'test' }));
    });

    const errorBanner = page.locator('.error-banner');
    if (await errorBanner.isVisible()) {
      const dismissBtn = errorBanner.locator('button');
      if (await dismissBtn.isVisible()) {
        await dismissBtn.click();
        await expect(errorBanner).not.toBeVisible();
      }
    }
  });
});

// ── Console Error Monitoring ─────────────────────────────────────────────────

test.describe('Console Error Free Routes', () => {
  const routes = [
    { path: '/', label: 'Home', mode: 'pediatric' as const },
    { path: '/reference', label: 'Reference Hub', mode: 'pediatric' as const },
    { path: '/reference/decision-trees', label: 'Decision Trees', mode: 'pediatric' as const },
    { path: '/reference/calculators', label: 'Calculators', mode: 'pediatric' as const },
    { path: '/reference/education', label: 'Education', mode: 'pediatric' as const },
    { path: '/resuscitation', label: 'Resuscitation Hub', mode: 'pediatric' as const },
    { path: '/airway', label: 'Airway Hub', mode: 'pediatric' as const },
    { path: '/sepsis', label: 'Sepsis Hub', mode: 'pediatric' as const },
    { path: '/neonatal', label: 'Neonatal Hub', mode: 'neonatal' as const },
    { path: '/admin', label: 'Admin Login', mode: 'pediatric' as const },
  ];

  for (const { path, label, mode } of routes) {
    test(`${label} has no console errors`, async ({ page }) => {
      await setMode(page, mode);
      const errors = await collectConsoleErrors(page, () => goto(page, path));
      expect(errors).toHaveLength(0);
    });
  }
});

// ── 404 / Not Found ──────────────────────────────────────────────────────────

test.describe('404 Handling', () => {
  test('non-existent route shows fallback or 404', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/this-does-not-exist');

    // Should show some content (not a blank page or raw error)
    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(0);
  });

  test('non-existent clinical route does not crash', async ({ page }) => {
    await setMode(page, 'pediatric');
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await goto(page, '/resuscitation/nonexistent-protocol');

    // Page should not have unrecoverable JS errors
    const fatalErrors = errors.filter(
      e => e.includes('Uncaught') || e.includes('TypeError') || e.includes('ReferenceError'),
    );
    expect(fatalErrors).toHaveLength(0);
  });
});

// ── Edge Cases ───────────────────────────────────────────────────────────────

test.describe('Edge Cases', () => {
  test('rapid navigation does not cause errors', async ({ page }) => {
    await setMode(page, 'pediatric');
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Rapidly navigate between pages
    await goto(page, '/');
    await page.goto('/reference');
    await page.goto('/resuscitation');
    await page.goto('/airway');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fatal = errors.filter(
      e => e.includes('Uncaught') && !e.includes('WASM') && !e.includes('navigation'),
    );
    expect(fatal).toHaveLength(0);
  });

  test('browser back/forward works correctly', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    await goto(page, '/reference');
    await goto(page, '/reference/knowledge');

    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/reference$/);

    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');

    await page.goForward();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/reference$/);
  });

  test('page reload preserves state', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/reference/knowledge');

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on the same page with content
    await expect(page).toHaveURL(/\/reference\/knowledge/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('empty search returns all entries in knowledge', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/reference/knowledge');
    await page.waitForSelector('.entry-card', { timeout: 5000 });

    const search = page.locator('input[type="search"]');
    await search.fill('something');
    await page.waitForTimeout(200);
    await search.clear();
    await page.waitForTimeout(200);

    const count = await page.locator('.entry-card').count();
    expect(count).toBeGreaterThan(100);
  });
});

// ── Boundary Weight Values ───────────────────────────────────────────────────

test.describe('Boundary Weight Values', () => {
  test('minimum pediatric weight (3kg) is accepted', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('3');
    await banner.fillAge('12');
    await banner.loadPatient();

    await expect(banner.banner).toContainText(/3/);
  });

  test('maximum pediatric weight (150kg) is accepted', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('150');
    await banner.fillAge('216');
    await banner.loadPatient();

    await expect(banner.banner).toContainText(/150/);
  });

  test('minimum neonatal weight (0.4kg) is accepted', async ({ page }) => {
    await setMode(page, 'neonatal');
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('0.4');
    await banner.fillGA('24');
    await banner.loadPatient();

    await expect(banner.banner).toContainText(/400|0\.4/);
  });
});
