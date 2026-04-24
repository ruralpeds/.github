import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  outputDir: "./playwright-results",
  timeout: 60_000,
  retries: 1,
  workers: 2,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: "https://github.com",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
