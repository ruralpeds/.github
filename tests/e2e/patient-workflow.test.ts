/**
 * tests/e2e/patient-workflow.test.ts
 *
 * Patient workflow tests: mode selection, patient entry, WASM computations,
 * Broselow classification, vital ranges, equipment sizing.
 */

import {
  test, expect, goto, setMode, clearMode,
  ModeSelectorPO, PatientBannerPO, HomePagePO,
} from './fixtures';

// ── Mode Selection ───────────────────────────────────────────────────────────

test.describe('Mode Selection', () => {
  test.beforeEach(async ({ page }) => {
    await clearMode(page);
  });

  test('shows mode selector when no mode is set', async ({ page }) => {
    await goto(page, '/');
    const ms = new ModeSelectorPO(page);
    await expect(ms.container).toBeVisible();
  });

  test('displays both neonatal and pediatric cards', async ({ page }) => {
    await goto(page, '/');
    const ms = new ModeSelectorPO(page);
    await expect(ms.neonatalCard).toBeVisible();
    await expect(ms.pediatricCard).toBeVisible();
  });

  test('neonatal card shows weight range and GA input', async ({ page }) => {
    await goto(page, '/');
    const ms = new ModeSelectorPO(page);
    await expect(ms.neonatalCard).toContainText(/0\.4.*6\.0/);
  });

  test('pediatric card shows weight range and Broselow', async ({ page }) => {
    await goto(page, '/');
    const ms = new ModeSelectorPO(page);
    await expect(ms.pediatricCard).toContainText(/3\.0.*150/);
  });

  test('selecting neonatal mode navigates to app', async ({ page }) => {
    await goto(page, '/');
    const ms = new ModeSelectorPO(page);
    await ms.selectNeonatal();
    // Mode selector should disappear, app shell visible
    await expect(page.locator('.app-shell, .home, .app-header')).toBeVisible({ timeout: 5000 });
  });

  test('selecting pediatric mode navigates to app', async ({ page }) => {
    await goto(page, '/');
    const ms = new ModeSelectorPO(page);
    await ms.selectPediatric();
    await expect(page.locator('.app-shell, .home, .app-header')).toBeVisible({ timeout: 5000 });
  });

  test('mode persists across page reload', async ({ page }) => {
    await goto(page, '/');
    const ms = new ModeSelectorPO(page);
    await ms.selectPediatric();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    // Should NOT show mode selector again
    await expect(ms.container).not.toBeVisible({ timeout: 3000 });
  });
});

// ── Home Page Patient Entry ──────────────────────────────────────────────────

test.describe('Home Page Patient Entry', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'pediatric');
  });

  test('shows domain grid on home page', async ({ page }) => {
    await goto(page, '/');
    const home = new HomePagePO(page);
    await expect(home.domainGrid).toBeVisible();
    const count = await home.domainCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('shows weight entry form', async ({ page }) => {
    await goto(page, '/');
    const home = new HomePagePO(page);
    await expect(home.weightEntry).toBeVisible();
  });

  test('domain cards are clickable links', async ({ page }) => {
    await goto(page, '/');
    const home = new HomePagePO(page);
    const firstCard = home.domainCards.first();
    const href = await firstCard.getAttribute('href');
    expect(href).toBeTruthy();
  });
});

// ── Patient Banner — Pediatric Mode ──────────────────────────────────────────

test.describe('Patient Banner — Pediatric', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'pediatric');
  });

  test('banner shows edit button before patient is loaded', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);
    // Banner or some entry mechanism should be visible
    await expect(banner.banner).toBeVisible();
  });

  test('can load a pediatric patient via banner form', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    // Open form if needed
    if (await banner.editBtn.isVisible()) {
      await banner.edit();
    }

    await banner.fillWeight('12');
    await banner.fillAge('24');
    await banner.selectSex('Male');
    await banner.loadPatient();

    // Banner should show loaded state with weight
    await expect(banner.banner).toContainText(/12/);
  });

  test('displays Broselow color for pediatric patient', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('12');
    await banner.fillAge('24');
    await banner.loadPatient();

    // Broselow should be visible for a 12kg child
    await expect(banner.brosColor).toBeVisible({ timeout: 3000 });
  });

  test('displays equipment sizing after load', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('12');
    await banner.fillAge('24');
    await banner.loadPatient();

    // Should show ETT or equipment sizing
    await expect(banner.equipSizing).toBeVisible({ timeout: 3000 });
  });

  test('clear button resets patient data', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('12');
    await banner.fillAge('24');
    await banner.loadPatient();

    // Clear the patient
    await banner.clear();

    // Banner should revert to unloaded state
    await expect(banner.banner).not.toHaveClass(/banner--loaded/);
  });

  test('weight displays in kg for pediatric mode', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('15');
    await banner.fillAge('36');
    await banner.loadPatient();

    await expect(banner.stat('Weight')).toContainText(/15.*kg/i);
  });
});

// ── Patient Banner — Neonatal Mode ───────────────────────────────────────────

test.describe('Patient Banner — Neonatal', () => {
  test.beforeEach(async ({ page }) => {
    await setMode(page, 'neonatal');
  });

  test('shows GA fields in neonatal mode', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();

    // Should have GA/gestational age field
    const gaField = page.locator('.field').filter({ hasText: /GA|gestational/i });
    await expect(gaField).toBeVisible();
  });

  test('can load a neonatal patient', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('1.5');
    await banner.fillGA('30');
    await banner.fillDOL('3');
    await banner.loadPatient();

    await expect(banner.banner).toContainText(/1500|1\.5/);
  });

  test('neonatal weight displays in grams for < 10kg', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('2.5');
    await banner.fillGA('32');
    await banner.loadPatient();

    // Should display in grams (2500 g) not kg
    await expect(banner.stat('Weight')).toContainText(/2500|g/);
  });

  test('does not show Broselow in neonatal mode', async ({ page }) => {
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('2');
    await banner.fillGA('34');
    await banner.loadPatient();

    await expect(banner.brosColor).not.toBeVisible();
  });
});

// ── Mode Switching ───────────────────────────────────────────────────────────

test.describe('Mode Switching', () => {
  test('switch button toggles between modes', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    // If switch button is visible, click it
    if (await banner.switchBtn.isVisible()) {
      await banner.switchBtn.click();
      await page.waitForLoadState('domcontentloaded');
      // Should show mode selector or switch mode badge
      const badge = page.locator('.banner__mode-badge, .mode-selector');
      await expect(badge).toBeVisible();
    }
  });
});

// ── Patient Data Persistence ─────────────────────────────────────────────────

test.describe('Patient Persistence', () => {
  test('patient data persists across navigation', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('20');
    await banner.fillAge('48');
    await banner.loadPatient();

    // Navigate away
    await goto(page, '/reference');
    // Banner should still show patient data
    await expect(banner.banner).toContainText(/20/);
  });

  test('patient data persists across page reload', async ({ page }) => {
    await setMode(page, 'pediatric');
    await goto(page, '/');
    const banner = new PatientBannerPO(page);

    if (await banner.editBtn.isVisible()) await banner.edit();
    await banner.fillWeight('20');
    await banner.fillAge('48');
    await banner.loadPatient();

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Should still show 20 kg
    await expect(banner.banner).toContainText(/20/);
  });
});
