// Single-story shot at moderate viewport — used for quick spot-checks
// without the full capture pass.
import fs from "node:fs/promises";
import { chromium } from "playwright";

const [, , storyId, file = "/tmp/preview.png"] = process.argv;
if (!storyId) {
  console.error("usage: node preview-shot.mjs <story-id> [out-path]");
  process.exit(1);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 800, height: 700 },
  deviceScaleFactor: 1.5,
});
const page = await ctx.newPage();
await page.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(400);
await fs.mkdir("/tmp", { recursive: true });
await page.screenshot({ path: file, fullPage: false });
await browser.close();
console.log(file);
