/**
 * tests/e2e/global-setup.ts
 *
 * Runs before all test suites. Verifies the preview server is reachable.
 */
import type { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:4173';
  // Quick health check
  try {
    const res = await fetch(baseURL, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) console.warn(`Preview server returned ${res.status}`);
  } catch {
    console.warn(`Could not reach preview server at ${baseURL} — tests may fail`);
  }
}

export default globalSetup;
