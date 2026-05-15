import { expect, test } from "@playwright/test";
import { clearAppState } from "./fixtures";

// When a user deep-links straight into a pushed route (browser URL bar,
// shared link, bookmark), the navigation stack only contains that screen
// — so `router.back()` would no-op and strand them. Each pushed screen's
// Back affordance should detect the empty stack and fall back to Home.

test.describe("Deep-link Back fallback", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  test("Back on /station/[code] deep-link routes to Home", async ({ page }) => {
    await page.goto("/station/ANC");
    await page.getByLabel("Back").click();
    await page.waitForURL((url) => url.pathname === "/" || url.pathname === "", {
      timeout: 5_000,
    });
  });

  test("Back on /announcements deep-link routes to Home", async ({ page }) => {
    await page.goto("/announcements");
    await page.getByLabel("Back").click();
    await page.waitForURL((url) => url.pathname === "/" || url.pathname === "", {
      timeout: 5_000,
    });
  });
});
