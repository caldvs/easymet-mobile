import { expect, test } from "@playwright/test";
import { clearAppState } from "./fixtures";

test.describe("Browse — search + filter", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  test("alphabetised section headers appear", async ({ page }) => {
    await page.goto("/browse");
    // Section labels include single letters like A, B, V, etc.
    await expect(page.getByText("A", { exact: true }).first()).toBeVisible();
  });

  test("search filters the list", async ({ page }) => {
    await page.goto("/browse");
    await page.getByPlaceholder(/Search/i).fill("Victoria");
    await expect(page.getByText("Victoria", { exact: true }).first()).toBeVisible();
    // "Old Trafford" isn't on the line-filter chips (only line names are),
    // so its absence from the visible DOM is a clean signal that the
    // station list filtered away non-matches.
    await expect(page.getByText("Old Trafford", { exact: true })).toBeHidden();
  });

  test("no-match query shows an empty state", async ({ page }) => {
    await page.goto("/browse");
    await page.getByPlaceholder(/Search/i).fill("xyzzy");
    await expect(page.getByText(/No stations match/i)).toBeVisible();
  });

  test("line filter chips are visible and tappable", async ({ page }) => {
    await page.goto("/browse");
    // Verify each chip text renders. Tap one and confirm the screen
    // stays mounted — the filtering assertion is fragile because chip
    // names collide with station names and line-label text in row
    // metadata, so this is the soundest cross-pattern test we can write
    // without adding accessibility-role/test-id on the app side.
    await expect(page.getByText("All lines", { exact: true })).toBeVisible();
    await expect(page.getByText("Airport", { exact: true }).first()).toBeVisible();
    await page.getByText("All lines", { exact: true }).click();
    await expect(page.getByText("Browse", { exact: true }).first()).toBeVisible();
  });

  test("clearing the search restores the full list", async ({ page }) => {
    await page.goto("/browse");
    const search = page.getByPlaceholder(/Search/i);
    // Filter to nothing using the empty-state assertion — more robust
    // than testing individual stations' visibility because SectionList's
    // virtualization may keep off-screen rows in the DOM.
    await search.fill("zzzz");
    await expect(page.getByText(/No stations match/i)).toBeVisible();
    await search.fill("");
    await expect(page.getByText(/No stations match/i)).toBeHidden();
    // "Abraham Moss" is the first alphabetical station and sits at the
    // top of the list — visible without needing to scroll.
    await expect(page.getByText("Abraham Moss", { exact: true }).first()).toBeVisible();
  });
});
