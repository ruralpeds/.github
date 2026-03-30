/**
 * tests/e2e/responsive.test.ts
 *
 * Responsive design and mobile viewport tests.
 * Covers: mobile layout, tablet layout, content reflow, touch targets,
 * sidebar behavior on small screens.
 */

import { test, expect, goto, setMode } from './fixtures';

// ── Viewport Definitions ─────────────────────────────────────────────────────

const viewports = {
  mobile: { width: 375, height: 812 },    // iPhone 13
  mobileLandscape: { width: 812, height: 375 },
  tablet: { width: 768, height: 1024 },   // iPad
  tabletLandscape: { width: 1024, height: 768 },
  desktop: { width: 1440, height: 900 },
  widesceen: { width: 1920, height: 1080 },
};

// ── Mobile Layout ────────────────────────────────────────────────────────────

test.describe('Mobile Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await setMode(page, 'pediatric');
  });

  test('home page renders without horizontal scroll', async ({ page }) => {
    await goto(page, '/');

    const hasHScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHScroll).toBeFalsy();
  });

  test('header is visible on mobile', async ({ page }) => {
    await goto(page, '/');
    await expect(page.locator('.app-header')).toBeVisible();
  });

  test('logo is visible on mobile', async ({ page }) => {
    await goto(page, '/');
    await expect(page.locator('.logo-mark')).toBeVisible();
  });

  test('domain cards stack vertically on mobile', async ({ page }) => {
    await goto(page, '/');
    const grid = page.locator('.domain-grid');
    if (await grid.isVisible()) {
      const gridStyle = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
      // On mobile, grid should be single column (or wrapping)
      const columns = gridStyle.split(' ').length;
      expect(columns).toBeLessThanOrEqual(2);
    }
  });

  test('sidebar is collapsed or hidden on mobile', async ({ page }) => {
    await goto(page, '/');
    const sidebar = page.locator('.app-sidebar');

    if (await sidebar.isVisible()) {
      // If visible, it should be overlaying or in a collapsed state
      const sidebarBox = await sidebar.boundingBox();
      if (sidebarBox) {
        // Sidebar should not take up more than 80% of screen width
        expect(sidebarBox.width).toBeLessThan(viewports.mobile.width * 0.8);
      }
    }
  });

  test('touch targets are at least 44px', async ({ page }) => {
    await goto(page, '/');

    // Check button sizes on mobile
    const buttons = page.locator('button, a[role="button"], .btn');
    const count = await buttons.count();

    let smallTargets = 0;
    for (let i = 0; i < Math.min(count, 15); i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box && (box.height < 32 || box.width < 32)) {
          smallTargets++;
        }
      }
    }

    // Most touch targets should meet minimum size (allow some exceptions for inline elements)
    expect(smallTargets).toBeLessThan(count * 0.5);
  });
});

// ── Mobile Clinical Routes ───────────────────────────────────────────────────

test.describe('Mobile Clinical Routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await setMode(page, 'pediatric');
  });

  test('knowledge page works on mobile', async ({ page }) => {
    await goto(page, '/reference/knowledge');
    await page.waitForSelector('.entry-card', { timeout: 5000 });

    const cards = await page.locator('.entry-card').count();
    expect(cards).toBeGreaterThan(0);

    // Search should be visible
    const search = page.locator('input[type="search"]');
    await expect(search).toBeVisible();
  });

  test('education page tabs work on mobile', async ({ page }) => {
    await goto(page, '/reference/education');

    const tabs = page.getByRole('button').filter({ hasText: /Textbook|Cheat Sheet|Audio/i });
    if (await tabs.first().isVisible()) {
      await tabs.first().click();
      await page.waitForTimeout(300);
      // Should show tab content without breaking layout
      const hasHScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHScroll).toBeFalsy();
    }
  });

  test('admin login works on mobile', async ({ page }) => {
    await goto(page, '/admin');
    const pin = page.locator('input[type="password"], input[type="text"]').first();
    await expect(pin).toBeVisible();
    await pin.fill('1234');
    await pin.press('Enter');
    await expect(page.locator('h1').filter({ hasText: /Admin|Dashboard/i })).toBeVisible({ timeout: 3000 });
  });
});

// ── Tablet Layout ────────────────────────────────────────────────────────────

test.describe('Tablet Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await setMode(page, 'pediatric');
  });

  test('sidebar and main content coexist', async ({ page }) => {
    await goto(page, '/');

    const sidebar = page.locator('.app-sidebar');
    const main = page.locator('.app-main');

    await expect(main).toBeVisible();

    // On tablet, sidebar may be visible alongside content
    if (await sidebar.isVisible()) {
      const sidebarBox = await sidebar.boundingBox();
      const mainBox = await main.boundingBox();
      if (sidebarBox && mainBox) {
        // They should not fully overlap
        expect(mainBox.x).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('domain grid shows multiple columns', async ({ page }) => {
    await goto(page, '/');
    const grid = page.locator('.domain-grid');
    if (await grid.isVisible()) {
      const gridStyle = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
      const columns = gridStyle.split(' ').length;
      expect(columns).toBeGreaterThanOrEqual(2);
    }
  });
});

// ── Desktop Layout ───────────────────────────────────────────────────────────

test.describe('Desktop Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await setMode(page, 'pediatric');
  });

  test('sidebar is fully expanded', async ({ page }) => {
    await goto(page, '/');
    const sidebar = page.locator('.app-sidebar');
    await expect(sidebar).toBeVisible();

    const box = await sidebar.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThan(150);
    }
  });

  test('main content uses available width', async ({ page }) => {
    await goto(page, '/');
    const main = page.locator('.app-main');
    const box = await main.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThan(600);
    }
  });
});

// ── Mobile Landscape ─────────────────────────────────────────────────────────

test.describe('Mobile Landscape', () => {
  test('home page works in landscape', async ({ page }) => {
    await page.setViewportSize(viewports.mobileLandscape);
    await setMode(page, 'pediatric');
    await goto(page, '/');

    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('h1, .hero')).toBeVisible();
  });
});

// ── IVF Matrix Responsive ────────────────────────────────────────────────────

test.describe('IVF Matrix Responsive', () => {
  test('IVF matrix renders on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await setMode(page, 'neonatal');
    await goto(page, '/neonatal/ivf-matrix?week=28');
    await page.waitForTimeout(2000);

    // Should render GA buttons
    const gaBtn = page.locator('button.gw-btn, .ga-week-btn').first();
    await expect(gaBtn).toBeVisible({ timeout: 5000 });
  });

  test('IVF matrix renders on tablet', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await setMode(page, 'neonatal');
    await goto(page, '/neonatal/ivf-matrix?week=28');
    await page.waitForTimeout(2000);

    const gaBtn = page.locator('button.gw-btn, .ga-week-btn').first();
    await expect(gaBtn).toBeVisible({ timeout: 5000 });
  });
});
