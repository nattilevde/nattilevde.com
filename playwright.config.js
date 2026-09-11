import { defineConfig } from "@playwright/test";

// The 3D world renders through a software rasteriser in headless Chromium, so
// each browser is CPU-hungry. Running many at once starves them all and the
// world crawls, which shows up as timeouts rather than as real failures. CI
// runs one at a time with retries; locally we allow a couple, not one per core.
const ci = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  testIgnore: "release.spec.js",
  // Test-level sharding; workers still limit each CI runner to one browser.
  fullyParallel: true,
  workers: ci ? 1 : 2,
  retries: ci ? 2 : 0,
  timeout: ci ? 120000 : 60000,
  expect: { timeout: ci ? 30000 : 10000 },
  forbidOnly: ci,
  reporter: ci ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    trace: ci ? "retain-on-failure" : "off",
  },
  webServer: {
    command: "npm run dev -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !ci,
    timeout: 120000,
  },
});
