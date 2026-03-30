/**
 * tests/e2e/fixtures.ts
 *
 * Shared test fixtures, helpers, and page object models for Playwright E2E tests.
 */

import { test as base, expect, type Page, type Locator } from '@playwright/test';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Navigate and wait for SvelteKit hydration. */
export async function goto(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/** Collect console errors during a callback, filtering known WASM noise. */
export async function collectConsoleErrors(
  page: Page,
  fn: () => Promise<void>,
): Promise<string[]> {
  const errors: string[] = [];
  const handler = (msg: import('@playwright/test').ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  page.on('console', handler);
  await fn();
  page.off('console', handler);
  return errors.filter(e => !e.includes('WASM') && !e.includes('wasm'));
}

/** Wait for an SVG with rendered nodes (D3 tree). */
export async function waitForD3Tree(page: Page, timeout = 8000) {
  await page.locator('#tc').waitFor({ state: 'visible', timeout });
  await page.locator('.ng').first().waitFor({ state: 'visible', timeout });
}

// ── Page Object: Mode Selector ───────────────────────────────────────────────

export class ModeSelectorPO {
  constructor(private page: Page) {}

  get container() { return this.page.locator('.mode-selector'); }
  get neonatalCard() { return this.page.locator('.mode-card').filter({ hasText: 'Neonatal' }); }
  get pediatricCard() { return this.page.locator('.mode-card').filter({ hasText: 'Pediatric' }); }

  async selectNeonatal() {
    await this.neonatalCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectPediatric() {
    await this.pediatricCard.click();
    await this.page.waitForLoadState('networkidle');
  }
}

// ── Page Object: Patient Banner ──────────────────────────────────────────────

export class PatientBannerPO {
  constructor(private page: Page) {}

  get banner() { return this.page.locator('.banner'); }
  get editBtn() { return this.page.locator('.btn-edit'); }
  get clearBtn() { return this.page.locator('.btn-clear'); }
  get switchBtn() { return this.page.locator('.btn-switch'); }
  get loadBtn() { return this.page.locator('.btn-load'); }
  get modeBadge() { return this.page.locator('.banner__mode-badge'); }
  get stats() { return this.page.locator('.banner__stat'); }
  get brosColor() { return this.page.locator('.banner__broselow'); }
  get equipSizing() { return this.page.locator('.banner__equip'); }

  stat(label: string) {
    return this.page.locator('.banner__stat').filter({ hasText: new RegExp(label, 'i') });
  }

  async edit() { await this.editBtn.click(); }
  async clear() { await this.clearBtn.click(); }

  async fillWeight(val: string) {
    const input = this.page.locator('.field').filter({ hasText: /weight/i }).locator('.field-input');
    await input.fill(val);
  }

  async fillAge(val: string) {
    const input = this.page.locator('.field').filter({ hasText: /age/i }).locator('.field-input');
    await input.fill(val);
  }

  async selectSex(val: 'Male' | 'Female') {
    const select = this.page.locator('.field-select');
    await select.selectOption(val);
  }

  async fillGA(weeks: string) {
    const input = this.page.locator('.field').filter({ hasText: /GA|gestational/i }).locator('.field-input').first();
    await input.fill(weeks);
  }

  async fillDOL(val: string) {
    const input = this.page.locator('.field').filter({ hasText: /DOL|day of life/i }).locator('.field-input');
    await input.fill(val);
  }

  async loadPatient() {
    await this.loadBtn.click();
    await this.page.waitForTimeout(500); // WASM computation time
  }
}

// ── Page Object: Home Page ───────────────────────────────────────────────────

export class HomePagePO {
  constructor(private page: Page) {}

  get hero() { return this.page.locator('.hero'); }
  get domainGrid() { return this.page.locator('.domain-grid'); }
  get domainCards() { return this.page.locator('.domain-card'); }
  get weightEntry() { return this.page.locator('.weight-entry'); }
  get loadPatientBtn() { return this.page.locator('.btn.btn--primary').filter({ hasText: /load patient/i }); }
  get patientLoaded() { return this.page.locator('.patient-loaded'); }
  get loadError() { return this.page.locator('.load-error'); }

  domainCard(title: string) {
    return this.page.locator('.domain-card').filter({ hasText: new RegExp(title, 'i') });
  }

  async fillWeightField(val: string) {
    await this.page.locator('.weight-entry input[type="number"]').first().fill(val);
  }

  async fillAgeField(val: string) {
    await this.page.locator('.weight-entry input[type="number"]').nth(1).fill(val);
  }
}

// ── Page Object: Clinical Nav ────────────────────────────────────────────────

export class ClinicalNavPO {
  constructor(private page: Page) {}

  get nav() { return this.page.locator('.clinical-nav'); }
  get sections() { return this.page.locator('.nav-section'); }

  section(label: string) {
    return this.page.locator('.nav-section').filter({ hasText: new RegExp(label, 'i') });
  }

  sectionHeader(label: string) {
    return this.page.locator('.nav-section__header').filter({ hasText: new RegExp(label, 'i') });
  }

  child(label: string) {
    return this.page.locator('.nav-child').filter({ hasText: new RegExp(label, 'i') });
  }

  activeSection() {
    return this.page.locator('.nav-section.active');
  }
}

// ── Page Object: Theme Toggle ────────────────────────────────────────────────

export class ThemeTogglePO {
  constructor(private page: Page) {}

  get select() { return this.page.locator('.theme-toggle__select'); }

  async switchTheme(name: string) {
    await this.select.selectOption({ label: name });
    await this.page.waitForTimeout(200); // transition time
  }

  async getCurrentTheme(): Promise<string> {
    return await this.select.inputValue();
  }
}

// ── Page Object: IVF Matrix ─────────────────────────────────────────────────

export class IVFMatrixPO {
  constructor(private page: Page) {}

  get gaButtons() { return this.page.locator('button.gw-btn, .ga-week-btn'); }
  get conditionCards() { return this.page.locator('.condition-card, .cond-card'); }

  gaButton(week: number) {
    return this.page.locator('button').filter({ hasText: new RegExp(`^${week}$`) });
  }

  dolSlider() {
    return this.page.locator('input[type="range"]');
  }
}

// ── Admin login helper ───────────────────────────────────────────────────────

export async function adminLogin(page: Page, pin = '1234') {
  await goto(page, '/admin');
  const pinInput = page.locator('input[type="password"], input[type="text"]').first();
  await pinInput.fill(pin);
  await pinInput.press('Enter');
  await page.waitForSelector('h1', { timeout: 3000 });
}

// ── Set clinical mode via localStorage ───────────────────────────────────────

export async function setMode(page: Page, mode: 'neonatal' | 'pediatric') {
  await page.addInitScript((m) => {
    localStorage.setItem('ped-cds-mode', JSON.stringify(m));
  }, mode);
}

export async function clearMode(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('ped-cds-mode');
    localStorage.removeItem('ped-cds-patient');
  });
}

// ── Screenshot helper ────────────────────────────────────────────────────────

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `tests/e2e/screenshots/${name}.png`,
    fullPage: true,
  });
}

// ── Re-exports ───────────────────────────────────────────────────────────────

export { expect };
export const test = base;
