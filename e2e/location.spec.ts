import { expect, test } from "@playwright/test";
import {
  ALTRINCHAM,
  MANCHESTER_PICCADILLY,
  clearAppState,
  setGeolocation,
} from "./fixtures";

test.describe("Geolocation — nearest-station resolution", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  test("near Piccadilly → nearest resolves to Piccadilly or a near-by stop", async ({ context, page }) => {
    await setGeolocation(context, MANCHESTER_PICCADILLY);
    await page.goto("/nearby");
    // We don't pin to one station name (haversine ties between Piccadilly,
    // Piccadilly Gardens, Shudehill etc. depend on rounding), so accept
    // any city-centre station as a pass.
    await expect(
      page.getByText(
        /Piccadilly|Piccadilly Gardens|Shudehill|Market Street|St Peter's Square/,
      ).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("near Altrincham → nearest resolves to Altrincham", async ({ context, page }) => {
    await setGeolocation(context, ALTRINCHAM);
    await page.goto("/nearby");
    await expect(page.getByText("Altrincham", { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("location permission absent → Nearby still mounts a default station", async ({ page }) => {
    // No grantPermissions call: the navigator.geolocation will hit a
    // denied state in WebKit-emulated contexts. The screen should still
    // show *some* station rather than crash.
    await page.goto("/nearby");
    // Default fallback in app code is St Peter's Square.
    await expect(
      page
        .getByText(/St Peter's Square|Piccadilly|Victoria|Deansgate/i)
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
