import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "release.spec.js",
  workers: 1,
  timeout: 90000,
  use: { baseURL: "http://127.0.0.1:4176", headless: true },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4176",
    url: "http://127.0.0.1:4176",
    reuseExistingServer: false,
  },
});
