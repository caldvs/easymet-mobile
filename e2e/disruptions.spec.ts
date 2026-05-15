import { expect, test } from "@playwright/test";
import {
  clearAppState,
  mockDisruptions,
  mockDisruptionsFailure,
} from "./fixtures";

// All assertions now happen against the Updates page (`/announcements`)
// since the on-Home banner was replaced by a bell + dedicated page.

test.describe("Disruptions — Updates page rendering", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  test("empty disruptions → Good service empty state on Updates page", async ({ page }) => {
    await mockDisruptions(page, []);
    await page.goto("/announcements");
    await expect(
      page.getByText("Good service across the network"),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("severe line-scope disruption appears under Happening now", async ({ page }) => {
    await mockDisruptions(page, [
      {
        title: "Bury Line - Major Disruption",
        body: "No service between Victoria and Bury.",
        severity: "severe",
        scope: "line",
        type: "incident",
        linesRaw: ["Bury"],
        stopsRaw: ["All"],
        affectedCorridors: ["Bury"],
      },
    ]);
    await page.goto("/announcements");
    await expect(page.getByText("Happening now", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Bury Line - Major Disruption", { exact: true }),
    ).toBeVisible();
  });

  test("future planned works appear under Coming up", async ({ page }) => {
    const inThreeDays = new Date(Date.now() + 3 * 24 * 3600_000).toISOString();
    await mockDisruptions(page, [
      {
        title: "Rochdale line works",
        body: "Major engineering works starting next week.",
        severity: "severe",
        scope: "line",
        type: "planned-works",
        startsAt: inThreeDays,
      },
    ]);
    await page.goto("/announcements");
    await expect(page.getByText("Coming up", { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Rochdale line works", { exact: true })).toBeVisible();
    // Not in Happening now.
    await expect(page.getByText("Happening now", { exact: true })).toBeHidden();
  });

  test("both Happening now AND Coming up render when both sets non-empty", async ({ page }) => {
    await mockDisruptions(page, [
      { id: "a", title: "Active now", body: "Live.", severity: "notice", scope: "line", type: "incident" },
      {
        id: "b",
        title: "Future works",
        body: "Planned.",
        severity: "notice",
        scope: "line",
        type: "planned-works",
        startsAt: new Date(Date.now() + 5 * 24 * 3600_000).toISOString(),
      },
    ]);
    await page.goto("/announcements");
    await expect(page.getByText("Happening now", { exact: true })).toBeVisible();
    await expect(page.getByText("Coming up", { exact: true })).toBeVisible();
    await expect(page.getByText("Active now", { exact: true })).toBeVisible();
    await expect(page.getByText("Future works", { exact: true })).toBeVisible();
  });

  test("dismiss a disruption → moves it to Acknowledged section", async ({ page }) => {
    await mockDisruptions(page, [
      { id: "x1", title: "Bury fault", body: "Live.", severity: "notice", scope: "line", type: "incident" },
    ]);
    await page.goto("/announcements");
    // Dismiss the card.
    await page.getByText("Dismiss", { exact: true }).first().click();
    // Acknowledged section header appears.
    await expect(page.getByText("Acknowledged", { exact: true })).toBeVisible();
    // Expand to confirm the card moved there (badge count is 1).
    await page.getByText("Acknowledged", { exact: true }).click();
    await expect(page.getByText("Bury fault", { exact: true })).toBeVisible();
    // Restore action is now available.
    await expect(page.getByText("Restore", { exact: true })).toBeVisible();
  });

  test("Dismiss all → all active items move to Acknowledged", async ({ page }) => {
    await mockDisruptions(page, [
      { id: "a", title: "Alpha", body: ".", severity: "notice", scope: "line", type: "incident" },
      { id: "b", title: "Beta", body: ".", severity: "notice", scope: "line", type: "incident" },
    ]);
    await page.goto("/announcements");
    await page.getByText("Dismiss all", { exact: true }).click();
    await expect(page.getByText("Happening now", { exact: true })).toBeHidden();
    await expect(page.getByText("Acknowledged", { exact: true })).toBeVisible();
  });

  test("disruptions endpoint failure → Updates page still mounts the empty state", async ({ page }) => {
    await mockDisruptionsFailure(page, 503);
    await page.goto("/announcements");
    await expect(
      page.getByText("Good service across the network"),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Disruptions — bell badge on Home", () => {
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  test("no disruptions → bell shows no badge", async ({ page }) => {
    await mockDisruptions(page, []);
    await page.goto("/");
    // Bell renders; accessibility label says "Network updates" (no
    // unread count) when there's nothing to read.
    await expect(page.getByLabel("Network updates")).toBeVisible({ timeout: 10_000 });
  });

  test("one undismissed disruption → bell badge shows 1 unread", async ({ page }) => {
    await mockDisruptions(page, [
      { id: "a", title: "Active now", body: ".", severity: "notice", scope: "line", type: "incident" },
    ]);
    await page.goto("/");
    await expect(
      page.getByLabel(/1 unread network updates/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
