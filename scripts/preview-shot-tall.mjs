// Same as preview-shot.mjs but viewport tall enough to show the full
// 402×874 device frame including the bottom TabBar.
import fs from "node:fs/promises";
import { chromium } from "playwright";

const [, , storyId, file = "/tmp/tall.png"] = process.argv;
if (!storyId) {
  console.error("usage: node preview-shot-tall.mjs <story-id> [out-path]");
  process.exit(1);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 460, height: 940 },
  deviceScaleFactor: 1.5,
});
const page = await ctx.newPage();
await page.goto(`http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(500);
await fs.mkdir("/tmp", { recursive: true });
await page.screenshot({ path: file, fullPage: false });
await browser.close();
console.log(file);
