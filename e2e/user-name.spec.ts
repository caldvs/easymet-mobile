import { expect, test } from "@playwright/test";
import { clearAppState } from "./fixtures";

// Fresh-user flow: when AsyncStorage has no saved name, Home shows the
// muted "Add your name" affordance. Tapping it opens the Tweaks bottom
// sheet with a text input; typing into it should immediately reflect
// in the Home greeting once the sheet is dismissed.

test.describe("Add your name", () => {
  test("typing a name in the bottom drawer updates the Home greeting", async ({ page }) => {
    await clearAppState(page);
    await page.goto("/");

    const addYourName = page.getByText("Add your name", { exact: true });
    await expect(addYourName).toBeVisible({ timeout: 10_000 });
    await addYourName.click();

    const nameField = page.getByPlaceholder("Your name (for the greeting)");
    await expect(nameField).toBeVisible();
    const testName = "Test User";
    await nameField.fill(testName);

    // Dismiss the sheet by tapping the backdrop above it. The sheet has
    // `maxHeight: min(height * 0.78, 640)` and sits flush at the bottom,
    // so the upper portion of the viewport is the backdrop Pressable.
    await page.mouse.click(20, 20);
    await expect(nameField).toBeHidden();

    // The greeting now renders `{name}` in place of "Add your name".
    await expect(page.getByText("Add your name")).toHaveCount(0);
    await expect(page.getByText(testName, { exact: true })).toBeVisible();
  });
});
