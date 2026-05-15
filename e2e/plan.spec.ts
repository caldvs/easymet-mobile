import { expect, test } from "@playwright/test";
import { clearAppState } from "./fixtures";

test.describe("Plan tab — journey planning flow", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  test("From/To form renders with both slots empty", async ({ page }) => {
    await page.goto("/plan");
    await expect(page.getByText("From", { exact: true })).toBeVisible();
    await expect(page.getByText("To", { exact: true })).toBeVisible();
    const placeholders = page.getByText("Pick a station");
    await expect(placeholders.first()).toBeVisible();
  });

  test("picking From advances the browse list label to 'as To'", async ({ page }) => {
    await page.goto("/plan");
    await pickFromList(page, "Altrincham");
    await expect(page.getByText(/Tap to add as To/i)).toBeVisible();
  });

  test("Start button hidden until both ends are valid", async ({ page }) => {
    await page.goto("/plan");
    await expect(page.getByText(/Start journey/i)).toBeHidden();
    await pickFromList(page, "Altrincham");
    await expect(page.getByText(/Start journey/i)).toBeHidden();
  });

  test("single-line journey: Altrincham → Cornbrook surfaces a Start button with no changes", async ({ page }) => {
    await page.goto("/plan");
    await pickFromList(page, "Altrincham");
    await pickFromList(page, "Cornbrook");
    const startBtn = page.getByText(/Start journey · \d+ min$/);
    await expect(startBtn).toBeVisible();
  });

  test("multi-line journey: Piccadilly → MediaCityUK plans via Harbour City", async ({ page }) => {
    await page.goto("/plan");
    await pickViaSheet(page, "from", "Piccadilly");
    await pickViaSheet(page, "to", "MediaCityUK");
    await expect(page.getByText(/Start journey · \d+ min · 1 change$/)).toBeVisible();
    await expect(page.getByText(/couldn't find a route/i)).toBeHidden();
  });

  test("multi-line journey: Airport → Bury surfaces a Start button with changes", async ({ page }) => {
    await page.goto("/plan");
    await pickViaSheet(page, "from", "Manchester Airport");
    await pickViaSheet(page, "to", "Bury");
    await expect(page.getByText(/Start journey · \d+ min · \d+ change/)).toBeVisible();
  });

  test("picker excludes the already-picked station so same-station is impossible", async ({ page }) => {
    await page.goto("/plan");
    await pickViaSheet(page, "from", "Altrincham");
    // Open the To sheet — Altrincham must not appear in the list,
    // because picking it would mean same-station origin/destination.
    await page.getByLabel("Pick To station").click();
    const sheet = page.getByPlaceholder("Search stations");
    await sheet.waitFor({ state: "visible" });
    await sheet.fill("Altrincham");
    // The sheet should match no stations now (Altrincham excluded).
    await expect(page.getByText(/No stations match/i)).toBeVisible();
  });

  test("tapping Start navigates to the Journey screen", async ({ page }) => {
    await page.goto("/plan");
    await pickFromList(page, "Altrincham");
    await pickFromList(page, "Cornbrook");
    await page.getByText(/Start journey/i).click();
    await page.waitForURL(/\/journey/, { timeout: 10_000 });
    await expect(page.getByLabel(/share journey progress/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Share button is present on the journey screen", async ({ page }) => {
    await page.goto("/plan");
    await pickFromList(page, "Altrincham");
    await pickFromList(page, "Cornbrook");
    await page.getByText(/Start journey/i).click();
    await page.waitForURL(/\/journey/);
    await expect(page.getByLabel(/share journey progress/i)).toBeVisible();
    await expect(page.getByText("End", { exact: true })).toBeVisible();
  });
});

// Helpers — keep specs declarative against the new picker flow.

/** Tap a station from the inline "Tap to add as From/To" browse list. */
async function pickFromList(page: import("@playwright/test").Page, stationName: string) {
  await page
    .getByText(stationName, { exact: true })
    .first()
    .click();
}

/** Open the search sheet on the chosen slot, type, then tap the result. */
async function pickViaSheet(
  page: import("@playwright/test").Page,
  slot: "from" | "to",
  stationName: string,
) {
  const label = slot === "from" ? "From" : "To";
  await page.getByLabel(`Pick ${label} station`).click();
  const sheetInput = page.getByPlaceholder("Search stations");
  await sheetInput.waitFor({ state: "visible" });
  await sheetInput.fill(stationName);
  await page.getByText(stationName, { exact: true }).first().click();
}
