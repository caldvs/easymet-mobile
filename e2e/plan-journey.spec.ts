import { expect, test } from "@playwright/test";
import { clearAppState } from "./fixtures";

// Two ways the user gets a journey planned on the Plan tab:
//   1) Typing into the search field to filter the long station list.
//   2) Tapping a station straight from the default ALL STATIONS list
//      (no typing) — works because the default suggestions are an
//      alphabetical slice of `allStations()` and the desired stops
//      happen to sit in the first 20 entries.
// Both flows end the same way: both slots filled and a Start journey
// button surfaced for a valid route.

test.describe("Plan tab — journey planning", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  test("typed search: Piccadilly → Wythenshawe Town Centre", async ({ page }) => {
    await page.goto("/plan");

    // FROM: open the picker on the From slot, type, pick the exact match.
    await page.getByLabel("Pick From station").click();
    let sheetInput = page.getByPlaceholder("Search stations");
    await sheetInput.fill("Piccadilly");
    await page.getByText("Piccadilly", { exact: true }).first().click();

    // After picking, the picker closes — open the To picker explicitly.
    await page.getByLabel("Pick To station").click();
    sheetInput = page.getByPlaceholder("Search stations");
    await sheetInput.fill("Wythenshawe");
    await page.getByText("Wythenshawe Town Centre", { exact: true }).first().click();

    // Both ends on the Airport line — a single-line Start button.
    await expect(page.getByText(/Start journey · \d+ min/)).toBeVisible();
    await expect(page.getByText(/couldn't find a route/i)).toBeHidden();
  });

  test("pick from list: Abraham Moss → Altrincham", async ({ page }) => {
    await page.goto("/plan");

    // FROM: no typing — Abraham Moss is the first entry in the default
    // alphabetical "Tap to add as From" list. Tap it straight.
    await page.getByText("Abraham Moss", { exact: true }).first().click();

    // The browse list label flips to "as To" once the From slot is set.
    await expect(page.getByText(/Tap to add as To/i)).toBeVisible();

    // TO: Altrincham is still the second entry now that the list rebuilds.
    await page.getByText("Altrincham", { exact: true }).first().click();

    // Whatever the routing engine returns, the Start button must surface
    // (and the no-route helper must not).
    await expect(page.getByText(/Start journey · \d+ min/)).toBeVisible();
    await expect(page.getByText(/couldn't find a route/i)).toBeHidden();
  });
});
