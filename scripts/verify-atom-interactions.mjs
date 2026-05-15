// Click each interactive atom and screenshot the resulting state. Lets us
// confirm the controls actually do something instead of just rendering.
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const STORYBOOK = "http://localhost:6006";
const OUT_DIR = "/tmp/soft-ui-shots-live";

async function shot(page, file) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(OUT_DIR, file), fullPage: true });
}

async function gotoStory(page, id) {
  await page.goto(`${STORYBOOK}/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(300);
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 900, height: 600 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // Dropdown: click to open, then pick a value.
  await gotoStory(page, "soft-ui-atoms--dropdown-story");
  await shot(page, "1-dropdown-closed.png");
  await page.getByText("Inter").first().click();
  await page.waitForTimeout(200);
  await shot(page, "2-dropdown-open.png");
  await page.getByText("DM Sans").first().click();
  await page.waitForTimeout(200);
  await shot(page, "3-dropdown-selected.png");

  // SearchPill: type and submit.
  await gotoStory(page, "soft-ui-atoms--search-pill-typeable");
  await shot(page, "4-search-empty.png");
  await page.locator("input").first().fill("metrolink");
  await page.waitForTimeout(150);
  await shot(page, "5-search-typed.png");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await shot(page, "6-search-submitted.png");

  // FilterChip: press to bump count.
  await gotoStory(page, "soft-ui-atoms--filter-chip-counter-clear");
  await shot(page, "7-filter-default.png");
  await page.getByText("Filter").first().click();
  await page.waitForTimeout(150);
  await shot(page, "8-filter-bumped.png");
  await page.getByText("Filter").first().click();
  await page.waitForTimeout(150);
  await shot(page, "9-filter-bumped-again.png");

  // IconToggle (toggleable) — click each in order. They sit in a row near
  // the top-left of the canvas.
  await gotoStory(page, "soft-ui-atoms--icon-toggle-toggleable");
  await shot(page, "10-toggle-default.png");

  // UserChip dismiss
  await gotoStory(page, "soft-ui-atoms--user-chip-dismissable");
  await shot(page, "11-userchip-three.png");

  // Stepper default render
  await gotoStory(page, "soft-ui-atoms--stepper-bounded-0-120");
  await shot(page, "12-stepper-default.png");

  // Toolbar InContext
  await gotoStory(page, "soft-ui-toolbar--in-context");
  await shot(page, "13-toolbar-default.png");

  await browser.close();
  console.log(`Done. Shots in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
