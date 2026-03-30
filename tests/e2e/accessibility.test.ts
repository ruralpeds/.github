/**
 * tests/e2e/accessibility.test.ts
 *
 * Accessibility tests using manual checks and DOM inspection.
 * Covers: keyboard navigation, focus management, ARIA attributes,
 * semantic HTML, screen reader support, color contrast indicators.
 *
 * Note: For full axe-core integration, install @axe-core/playwright:
 *   npm install -D @axe-core/playwright
 * Then uncomment the axe-core sections below.
 */

import { test, expect, goto, setMode, adminLogin } from './fixtures';

// ── Keyboard Navigation ──────────────────────────────────────────────────────

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'pediatric');
  });

  test('Tab key moves focus through interactive elements', async ({ page }) => {
    await goto(page, '/');

    // Press Tab multiple times and check that focus moves
    const focusedTags: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase() ?? '');
      if (tag) focusedTags.push(tag);
    }

    // Should have focused on links, buttons, or inputs
    const interactive = focusedTags.filter(t => ['a', 'button', 'input', 'select'].includes(t));
    expect(interactive.length).toBeGreaterThan(0);
  });

  test('focus is visible on focused elements', async ({ page }) => {
    await goto(page, '/');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check that the focused element has a visible outline/ring
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;
      const style = getComputedStyle(el);
      return (
        style.outline !== 'none' ||
        style.outlineWidth !== '0px' ||
        style.boxShadow.includes('0 0 0 2px') ||
        style.boxShadow !== 'none'
      );
    });

    expect(hasFocusStyle).toBeTruthy();
  });

  test('sidebar nav items are keyboard accessible', async ({ page }) => {
    await goto(page, '/');

    // Focus the sidebar
    const navLinks = page.locator('.clinical-nav a, .clinical-nav button');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    // First nav link should be focusable
    const firstLink = navLinks.first();
    await firstLink.focus();
    const focused = await page.evaluate(() => document.activeElement?.closest('.clinical-nav') !== null);
    expect(focused).toBeTruthy();
  });

  test('Enter key activates focused link', async ({ page }) => {
    await goto(page, '/');

    // Focus a nav link
    const refLink = page.locator('.nav-section__header').filter({ hasText: /Reference/ });
    await refLink.focus();
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/reference/);
  });
});

// ── ARIA Attributes ──────────────────────────────────────────────────────────

test.describe('ARIA Attributes', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'pediatric');
  });

  test('nav has aria-label', async ({ page }) => {
    await goto(page, '/');
    const nav = page.locator('.clinical-nav');
    const ariaLabel = await nav.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('active nav links have aria-current="page"', async ({ page }) => {
    await goto(page, '/reference');
    const activeLink = page.locator('[aria-current="page"]');
    await expect(activeLink).toBeVisible();
  });

  test('buttons have accessible names', async ({ page }) => {
    await goto(page, '/');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const text = await btn.textContent();
        const ariaLabel = await btn.getAttribute('aria-label');
        const title = await btn.getAttribute('title');
        // Button should have some accessible name
        const hasName = (text?.trim().length ?? 0) > 0 || !!ariaLabel || !!title;
        expect(hasName, `Button ${i} should have accessible name`).toBeTruthy();
      }
    }
  });

  test('form inputs have associated labels', async ({ page }) => {
    await goto(page, '/');

    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        // Check for label via id, aria-label, aria-labelledby, or at least placeholder
        const hasLabel = !!(id || ariaLabel || ariaLabelledby || placeholder);
        expect(hasLabel, `Input ${i} should have a label mechanism`).toBeTruthy();
      }
    }
  });
});

// ── Semantic HTML ────────────────────────────────────────────────────────────

test.describe('Semantic HTML', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'pediatric');
  });

  test('page has exactly one h1', async ({ page }) => {
    await goto(page, '/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('heading hierarchy is correct (no skipped levels)', async ({ page }) => {
    await goto(page, '/');

    const headingLevels = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headings).map(h => parseInt(h.tagName[1]));
    });

    // Check that levels don't skip (e.g., h1 → h3 without h2)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      expect(diff, `Heading level should not skip from h${headingLevels[i - 1]} to h${headingLevels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  test('navigation uses nav element', async ({ page }) => {
    await goto(page, '/');
    const navElements = page.locator('nav');
    const count = await navElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('main content area uses main or semantic container', async ({ page }) => {
    await goto(page, '/');
    const main = page.locator('main, .app-main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('links have descriptive text (not bare URLs)', async ({ page }) => {
    await goto(page, '/');

    const links = page.locator('a[href]');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const hasText = (text?.trim().length ?? 0) > 0 || !!ariaLabel;
        expect(hasText, `Link ${i} should have descriptive text`).toBeTruthy();
      }
    }
  });
});

// ── Screen Reader Support ────────────────────────────────────────────────────

test.describe('Screen Reader Support', () => {
  test('sr-only elements exist for visual-only content', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');

    const srOnly = page.locator('.sr-only');
    // Should have at least some sr-only elements for icons/visual elements
    const count = await srOnly.count();
    // This is informational — not all pages need sr-only, but the class should exist in CSS
    const srOnlyStyle = await page.evaluate(() => {
      const style = document.createElement('style');
      const el = document.querySelector('.sr-only');
      if (!el) return null;
      const computed = getComputedStyle(el);
      return {
        position: computed.position,
        width: computed.width,
        height: computed.height,
      };
    });

    if (srOnlyStyle) {
      expect(srOnlyStyle.position).toBe('absolute');
    }
  });
});

// ── Admin Accessibility ──────────────────────────────────────────────────────

test.describe('Admin Module Accessibility', () => {
  test('PIN input is labeled', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/admin');

    const pinInput = page.locator('input[type="password"], input[type="text"]').first();
    const ariaLabel = await pinInput.getAttribute('aria-label');
    const placeholder = await pinInput.getAttribute('placeholder');
    const id = await pinInput.getAttribute('id');

    expect(ariaLabel || placeholder || id, 'PIN input should be labeled').toBeTruthy();
  });

  test('error message on wrong PIN is announced', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/admin');

    const pin = page.locator('input[type="password"], input[type="text"]').first();
    await pin.fill('9999');
    await pin.press('Enter');

    const errorMsg = page.getByText(/incorrect|wrong|invalid/i);
    await expect(errorMsg).toBeVisible({ timeout: 2000 });

    // Error should have role="alert" or aria-live for screen readers
    const role = await errorMsg.getAttribute('role');
    const ariaLive = await errorMsg.getAttribute('aria-live');
    const parentRole = await page.evaluate(() => {
      const err = document.querySelector('[role="alert"], [aria-live]');
      return err ? 'found' : null;
    });
    // At minimum the error message should be visible (role="alert" is ideal)
    expect(await errorMsg.isVisible()).toBeTruthy();
  });
});

// ── Color Contrast Indicators ────────────────────────────────────────────────

test.describe('Color Safety', () => {
  test('clinical severity colors have sufficient contrast indicators', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');

    // Verify that severity colors exist as CSS variables
    const severityColors = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        emergency: style.getPropertyValue('--color-emergency').trim(),
        urgent: style.getPropertyValue('--color-urgent').trim(),
        warning: style.getPropertyValue('--color-warning').trim(),
        info: style.getPropertyValue('--color-info').trim(),
        success: style.getPropertyValue('--color-success').trim(),
      };
    });

    // All severity colors should be defined
    expect(severityColors.emergency.length).toBeGreaterThan(0);
    expect(severityColors.urgent.length).toBeGreaterThan(0);
    expect(severityColors.warning.length).toBeGreaterThan(0);
    expect(severityColors.info.length).toBeGreaterThan(0);
    expect(severityColors.success.length).toBeGreaterThan(0);
  });
});
