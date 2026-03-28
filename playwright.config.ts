import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Peds CDS full E2E test suite.
 * https://playwright.dev/docs/test-configuration
 *
 * Test suites:
 *   smoke.test.ts          — Quick smoke tests (existing)
 *   navigation.test.ts     — Routing, nav, layout
 *   patient-workflow.test.ts — Mode selection, patient entry, WASM
 *   decision-trees.test.ts — D3 tree rendering, interaction, zoom/pan
 *   ivf-matrix.test.ts     — IVF sparkline matrix
 *   theme.test.ts          — Theme switching, CSS variables, clinical colors
 *   accessibility.test.ts  — Keyboard nav, ARIA, semantic HTML
 *   offline-pwa.test.ts    — Service worker, offline caching
 *   visual-regression.test.ts — Screenshot comparison baselines
 *   error-handling.test.ts — Edge cases, error display, boundary values
 *   responsive.test.ts     — Mobile/tablet/desktop layout
 *
 * Run all:   npx playwright test
 * Run suite: npx playwright test tests/e2e/navigation.test.ts
 * Update visual baselines: npx playwright test visual-regression --update-snapshots
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'html',

  /* Shared settings for all projects */
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },

  /* Test projects — Desktop + Mobile */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  /* Spin up the SvelteKit preview server before tests */
  webServer: {
    command: 'cd apps/web && npx vite preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  /* Snapshot / visual regression config */
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.3,
    },
  },
});
