import { defineConfig, devices } from "@playwright/test";

// Playwright runs against the Expo Web build. Note: this validates the
// browser rendering of the app, not the native iOS/Android UI — haptics,
// native maps, BlurView, native splash, gesture handlers, etc. behave
// differently or no-op on web. Useful for catching layout regressions,
// navigation bugs, and form/text behaviour.

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "list" : "html",
  use: {
    baseURL: "http://localhost:8081",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    // `PW_SLOW_MO=500 npm run test:e2e -- --headed` slows each action down
    // by 500ms so you can watch the suite play out at human speed.
    launchOptions: {
      slowMo: Number(process.env.PW_SLOW_MO) || 0,
    },
  },
  projects: [
    {
      name: "mobile-safari-emulated",
      use: { ...devices["iPhone 14"] },
    },
  ],
  webServer: {
    command: "npx expo start --web --port 8081",
    url: "http://localhost:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
