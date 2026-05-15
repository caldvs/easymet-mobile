import { expect, test } from "@playwright/test";

// Smoke tests for the core navigation + journey-planning flow. These run
// against the Expo Web build and exercise the same RN components rendered
// via react-native-web. Native-only behaviours (haptics, blur, location
// permissions) are out of scope here — those need a real device test.

test.describe("Easy Met smoke", () => {
  test("home screen loads with bell + settings icons", async ({ page }) => {
    await page.goto("/");
    // Bell carries an accessibility label whether or not there are unread
    // items — it always renders in the Home header.
    await expect(
      page.getByLabel(/network updates|unread network updates/i),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel("Open tweaks")).toBeVisible();
  });

  test("Plan tab loads the From/To form", async ({ page }) => {
    // Navigating by URL is the reliable cross-platform path — RN's
    // Pressable on web doesn't always expose as a clickable role that
    // Playwright's getByRole picks up.
    await page.goto("/plan");
    await expect(page.getByText("Plan", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("From", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("To", { exact: true }).first()).toBeVisible();
  });

  test("can search for a station from the Plan tab", async ({ page }) => {
    await page.goto("/plan");
    // The picker sheet replaces the old inline filter.
    await page.getByLabel("Pick From station").click();
    await page.getByPlaceholder("Search stations").fill("Piccadilly");
    await expect(
      page.getByText("Piccadilly", { exact: false }).first(),
    ).toBeVisible();
  });

  test("Browse search filters to Victoria", async ({ page }) => {
    await page.goto("/browse");
    await expect(page.getByText("Browse", { exact: true }).first()).toBeVisible();
    const search = page.getByPlaceholder(/Search/i);
    await search.fill("Victoria");
    await expect(
      page.getByText("Victoria", { exact: false }).first(),
    ).toBeVisible();
  });

  test("opens Updates page from the Home bell", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel(/network updates|unread network updates/i).click();
    await expect(page.getByText("Updates", { exact: true })).toBeVisible();
  });

  test("picking a From station auto-advances to the To slot", async ({ page }) => {
    await page.goto("/plan");
    // The inline list defaults to "Tap to add as From". After picking
    // any station it should flip to "Tap to add as To".
    await page.getByText("Altrincham", { exact: true }).first().click();
    await expect(page.getByText(/Tap to add as To/i)).toBeVisible();
  });
});
