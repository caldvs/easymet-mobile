import { expect, test } from "@playwright/test";
import {
  clearAppState,
  mockDisruptionsFailure,
  mockMetrolinksEmpty,
  mockMetrolinksFailure,
} from "./fixtures";

test.describe("Network failures — graceful degradation", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  test("disruptions endpoint returns 503 → Home still mounts (bell visible)", async ({ page }) => {
    await mockDisruptionsFailure(page, 503);
    await page.goto("/");
    // Bell always renders, even when the endpoint failed.
    await expect(page.getByLabel(/network updates/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("metrolinks endpoint returns 500 → Nearby shows error copy", async ({ page }) => {
    await mockMetrolinksFailure(page, 500);
    await page.goto("/nearby");
    // The "Couldn't reach Metrolink data" string is what Nearby shows on
    // departure-fetch failure. Loose match so a small copy change doesn't
    // break the test.
    await expect(page.getByText(/Couldn't reach Metrolink data/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("metrolinks returns empty value array → no upcoming trams", async ({ page }) => {
    await mockMetrolinksEmpty(page);
    await page.goto("/nearby");
    // The empty-state copy adapts to time-of-day (overnight, late
    // night, first-trams, mid-service gap) — what's universal is the
    // "See Updates" CTA the notice always renders.
    await expect(page.getByLabel(/see network updates/i)).toBeVisible({ timeout: 15_000 });
  });

  test("both endpoints failing simultaneously → Home still renders", async ({ page }) => {
    await mockDisruptionsFailure(page, 503);
    await mockMetrolinksFailure(page, 502);
    await page.goto("/");
    // Even with both APIs down, the Home shell must paint — bell visible
    // in the header and the empty-state CTA shows for a no-pins user.
    await expect(page.getByLabel(/network updates/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Pin your daily stops")).toBeVisible();
  });
});
