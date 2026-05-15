// Quick ad-hoc capture of every soft-UI story to disk. Lets us review the
// rendered output without needing a live browser. Run with:
//   node scripts/capture-soft-stories.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const STORYBOOK = "http://localhost:6006";
const OUT_DIR = "/tmp/soft-ui-shots";

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const res = await fetch(`${STORYBOOK}/index.json`);
  const idx = await res.json();
  const stories = Object.keys(idx.entries).filter((id) => id.startsWith("soft-ui-"));
  console.log(`Capturing ${stories.length} stories...`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  for (const id of stories) {
    const url = `${STORYBOOK}/iframe.html?id=${id}&viewMode=story`;
    await page.goto(url, { waitUntil: "networkidle" });
    // Wait for the storybook root to have content.
    await page.waitForSelector("#storybook-root", { state: "attached" });
    await page.waitForTimeout(250);
    const file = path.join(OUT_DIR, `${id}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  ✓ ${id}`);
  }

  await browser.close();
  console.log(`Done. Screenshots in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
