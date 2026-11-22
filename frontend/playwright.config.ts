import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_FRONTEND_PORT ?? 3100);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const API_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:18081";
const channel =
  (process.env.E2E_BROWSER_CHANNEL as "msedge" | "chrome" | undefined) ??
  (process.platform === "win32" ? "msedge" : undefined);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup",
  globalTeardown: "./e2e/global-teardown",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    acceptDownloads: false,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel, viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: "node e2e/start-web.mjs",
    url: BASE_URL,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      ...process.env,
      API_PROXY_TARGET: API_URL,
      E2E_FRONTEND_PORT: String(PORT),
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
