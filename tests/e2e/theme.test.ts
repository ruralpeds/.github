/**
 * tests/e2e/theme.test.ts
 *
 * Theme system tests: light/dark/high-contrast switching,
 * CSS custom property application, clinical color safety.
 */

import { test, expect, goto, setMode, ThemeTogglePO } from './fixtures';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'pediatric');
  });

  // ── Theme Toggle Presence ──────────────────────────────────────────────

  test('theme toggle select is visible in header', async ({ page }) => {
    await goto(page, '/');
    const toggle = new ThemeTogglePO(page);
    await expect(toggle.select).toBeVisible();
  });

  test('toggle has multiple theme options', async ({ page }) => {
    await goto(page, '/');
    const toggle = new ThemeTogglePO(page);
    const options = toggle.select.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(3); // light, dark, high-contrast
  });

  // ── Theme Switching ────────────────────────────────────────────────────

  test('switching to dark theme changes background color', async ({ page }) => {
    await goto(page, '/');
    const toggle = new ThemeTogglePO(page);

    // Get initial background
    const initialBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim(),
    );

    // Switch to dark
    await toggle.switchTheme('Clinical Dark');
    await page.waitForTimeout(300);

    const darkBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim(),
    );

    expect(darkBg).not.toBe(initialBg);
  });

  test('switching to high contrast changes properties', async ({ page }) => {
    await goto(page, '/');
    const toggle = new ThemeTogglePO(page);

    await toggle.switchTheme('High Contrast');
    await page.waitForTimeout(300);

    // High contrast should have specific color properties set
    const textColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim(),
    );
    expect(textColor.length).toBeGreaterThan(0);
  });

  test('switching back to light theme restores original', async ({ page }) => {
    await goto(page, '/');
    const toggle = new ThemeTogglePO(page);

    const initialBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim(),
    );

    await toggle.switchTheme('Clinical Dark');
    await page.waitForTimeout(200);
    await toggle.switchTheme('Clinical Light');
    await page.waitForTimeout(200);

    const restoredBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim(),
    );

    expect(restoredBg).toBe(initialBg);
  });

  // ── Theme Persistence ──────────────────────────────────────────────────

  test('theme choice persists across reload', async ({ page }) => {
    await goto(page, '/');
    const toggle = new ThemeTogglePO(page);

    await toggle.switchTheme('Clinical Dark');
    await page.waitForTimeout(200);

    await page.reload();
    await page.waitForLoadState('networkidle');

    const currentTheme = await toggle.getCurrentTheme();
    expect(currentTheme).toContain('dark');
  });

  // ── Clinical Safety Colors ─────────────────────────────────────────────

  test('emergency color stays constant across themes', async ({ page }) => {
    await goto(page, '/');
    const toggle = new ThemeTogglePO(page);

    const getEmergencyColor = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--color-emergency').trim(),
      );

    const lightEmergency = await getEmergencyColor();

    await toggle.switchTheme('Clinical Dark');
    await page.waitForTimeout(200);
    const darkEmergency = await getEmergencyColor();

    await toggle.switchTheme('High Contrast');
    await page.waitForTimeout(200);
    const hcEmergency = await getEmergencyColor();

    // Emergency color should remain the same across all themes
    expect(lightEmergency).toBe(darkEmergency);
    expect(darkEmergency).toBe(hcEmergency);
  });

  test('warning color stays constant across themes', async ({ page }) => {
    await goto(page, '/');
    const toggle = new ThemeTogglePO(page);

    const getWarningColor = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim(),
      );

    const lightWarning = await getWarningColor();

    await toggle.switchTheme('Clinical Dark');
    await page.waitForTimeout(200);
    const darkWarning = await getWarningColor();

    expect(lightWarning).toBe(darkWarning);
  });

  // ── CSS Custom Properties ──────────────────────────────────────────────

  test('all expected CSS custom properties are set', async ({ page }) => {
    await goto(page, '/');

    const properties = [
      '--color-primary',
      '--color-text',
      '--color-surface',
      '--color-border',
      '--color-emergency',
      '--color-urgent',
      '--color-warning',
      '--color-info',
      '--color-success',
      '--font-heading',
      '--font-body',
      '--font-mono',
      '--radius-sm',
      '--radius-md',
    ];

    for (const prop of properties) {
      const value = await page.evaluate(
        (p) => getComputedStyle(document.documentElement).getPropertyValue(p).trim(),
        prop,
      );
      expect(value.length, `${prop} should have a value`).toBeGreaterThan(0);
    }
  });

  // ── Theme Transition ───────────────────────────────────────────────────

  test('theme transition completes without visual glitch', async ({ page }) => {
    await goto(page, '/');
    const toggle = new ThemeTogglePO(page);

    // Switch themes rapidly
    await toggle.switchTheme('Clinical Dark');
    await toggle.switchTheme('High Contrast');
    await toggle.switchTheme('Clinical Light');
    await page.waitForTimeout(500);

    // Page should still be in a valid state (no stuck transition)
    const transitioning = await page.evaluate(() =>
      document.documentElement.hasAttribute('data-theme-transitioning'),
    );
    expect(transitioning).toBeFalsy();
  });
});
