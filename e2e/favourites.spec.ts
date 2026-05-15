import { expect, test } from "@playwright/test";
import { clearAppState, seedFavourites } from "./fixtures";

test.describe("Favourites — pin/unpin lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  test("Home empty state when no stations are pinned", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Pin your daily stops")).toBeVisible();
    await expect(page.getByText("Browse stations")).toBeVisible();
  });

  test("seeded favourites appear as pinned cards on Home", async ({ page }) => {
    await seedFavourites(page, ["PIC", "ALT"]);
    await page.goto("/");
    await expect(page.getByText("Piccadilly", { exact: true }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Altrincham", { exact: true }).first()).toBeVisible();
  });

  test("Home empty-state CTA navigates to Browse", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Browse stations").click();
    await expect(page.getByText("Browse", { exact: true }).first()).toBeVisible();
    await expect(page.getByPlaceholder(/Search/i)).toBeVisible();
  });
});
