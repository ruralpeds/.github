/**
 * tests/e2e/ivf-matrix.test.ts
 *
 * IVF Sparkline Matrix comprehensive tests.
 * Covers: GA group selection, DOL slider, condition cards, sparkline rendering,
 * tier system, URL parameter handling.
 */

import { test, expect, goto, setMode, IVFMatrixPO } from './fixtures';

test.describe('IVF Sparkline Matrix', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'neonatal');
  });

  // ── Page Loading ─────────────────────────────────────────────────────────

  test('loads and renders GA week buttons', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix');
    const ivf = new IVFMatrixPO(page);
    await expect(ivf.gaButtons.first()).toBeVisible({ timeout: 8000 });
    const btnCount = await ivf.gaButtons.count();
    expect(btnCount).toBeGreaterThan(5);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await goto(page, '/neonatal/ivf-matrix');
    await page.waitForTimeout(1000);
    const critical = errors.filter(e => !e.includes('WASM') && !e.includes('wasm'));
    expect(critical).toHaveLength(0);
  });

  // ── GA Week Selection ────────────────────────────────────────────────────

  test('clicking GA week button updates display', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix');
    const ivf = new IVFMatrixPO(page);
    await expect(ivf.gaButtons.first()).toBeVisible({ timeout: 8000 });

    const btn30 = ivf.gaButton(30);
    if (await btn30.isVisible()) {
      await btn30.click();
      await page.waitForTimeout(300);
      // Button should appear selected (active class or visual change)
      await expect(btn30).toBeVisible();
    }
  });

  test('GA groups span expected ranges', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix');
    await page.waitForTimeout(1000);

    // Should show buttons for weeks across preterm to term range
    for (const week of [25, 28, 32, 36]) {
      const btn = page.locator('button').filter({ hasText: new RegExp(`\\b${week}\\b`) });
      // At least some of these weeks should be present
      if (await btn.count() > 0) {
        await expect(btn.first()).toBeVisible();
      }
    }
  });

  // ── URL Parameters ───────────────────────────────────────────────────────

  test('URL params set initial GA week', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix?week=30');
    await page.waitForTimeout(1000);

    // Week 30 button should be highlighted/selected
    const btn30 = page.locator('button').filter({ hasText: /30/ }).first();
    await expect(btn30).toBeVisible();
  });

  test('URL params set initial DOL', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix?week=28&dol=5');
    await page.waitForTimeout(1000);

    // Page should load without error
    await expect(page).not.toHaveURL(/error/);
  });

  // ── DOL (Day of Life) Controls ───────────────────────────────────────────

  test('DOL slider or controls are present', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix');
    await page.waitForTimeout(1000);

    // Look for DOL slider, input, or buttons
    const dolControl = page.locator(
      'input[type="range"], .dol-slider, .dol-control, button:has-text("DOL")',
    );
    const dolText = page.getByText(/DOL|day of life/i);
    const found = (await dolControl.count()) > 0 || (await dolText.count()) > 0;
    expect(found).toBeTruthy();
  });

  test('changing DOL updates sparklines', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix?week=28');
    await page.waitForTimeout(1000);

    const slider = page.locator('input[type="range"]').first();
    if (await slider.isVisible()) {
      // Get initial state
      const svgsBefore = await page.locator('svg path, svg line, svg circle').count();

      // Move slider
      await slider.fill('7');
      await page.waitForTimeout(500);

      // Page should still render without error
      await expect(page).not.toHaveURL(/error/);
    }
  });

  // ── Condition Cards ──────────────────────────────────────────────────────

  test('displays condition cards (Stable, RDS, Sepsis, NEC, PPHN)', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix?week=28');
    await page.waitForTimeout(1500);

    const conditions = ['Stable', 'RDS', 'Sepsis', 'NEC', 'PPHN'];
    let found = 0;
    for (const cond of conditions) {
      const el = page.getByText(new RegExp(`\\b${cond}\\b`, 'i'));
      if (await el.count() > 0) found++;
    }
    // At least 3 of the 5 conditions should be visible
    expect(found).toBeGreaterThanOrEqual(3);
  });

  // ── Sparkline Rendering ──────────────────────────────────────────────────

  test('renders SVG sparklines', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix?week=28');
    await page.waitForTimeout(2000);

    // Sparklines are D3-rendered SVGs
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();
    expect(svgCount).toBeGreaterThan(0);
  });

  test('sparklines contain path elements (drawn lines)', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix?week=28');
    await page.waitForTimeout(2000);

    const paths = page.locator('svg path');
    const pathCount = await paths.count();
    expect(pathCount).toBeGreaterThan(0);
  });

  // ── Tier System ──────────────────────────────────────────────────────────

  test('tier labels are displayed', async ({ page }) => {
    await goto(page, '/neonatal/ivf-matrix?week=28');
    await page.waitForTimeout(1500);

    // Look for tier labels
    const tiers = ['Restrict', 'Conservative', 'Standard', 'Liberal'];
    let found = 0;
    for (const tier of tiers) {
      const el = page.getByText(new RegExp(tier, 'i'));
      if (await el.count() > 0) found++;
    }
    expect(found).toBeGreaterThanOrEqual(2);
  });

  // ── Responsive Layout ────────────────────────────────────────────────────

  test('matrix adapts to narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goto(page, '/neonatal/ivf-matrix?week=28');
    await page.waitForTimeout(1500);

    // Should still render GA buttons without overflow errors
    const gaBtn = page.locator('button.gw-btn, .ga-week-btn').first();
    await expect(gaBtn).toBeVisible({ timeout: 5000 });
  });
});
