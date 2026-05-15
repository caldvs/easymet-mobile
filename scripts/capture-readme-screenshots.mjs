// Captures portfolio-quality iPhone-sized screenshots of the live app
// rendered through Storybook's `Pages` stories. Writes PNGs to
// `docs/screenshots/`. Run with Storybook already running at :6006.
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const STORYBOOK = "http://localhost:6006";
const REPO = path.resolve(new URL(".", import.meta.url).pathname, "..");
const OUT_DIR = path.join(REPO, "docs", "screenshots");

// iPhone 14 Pro logical resolution. 2× device scale keeps the PNGs crisp
// when GitHub renders them at half-size.
const VIEWPORT = { width: 402, height: 874 };

// Which page stories to capture, in the order they appear in the README.
const SHOTS = [
  { id: "pages--home", file: "01-home.png", note: "Home" },
  { id: "pages--plan", file: "02-plan.png", note: "Plan" },
  { id: "pages--browse", file: "03-browse.png", note: "Browse" },
  { id: "pages--pinned", file: "04-pinned.png", note: "Pinned" },
  { id: "pages--journey", file: "05-journey.png", note: "Journey" },
  { id: "pages--station-detail-airport", file: "06-station-detail.png", note: "Station detail" },
  { id: "pages--announcements", file: "07-announcements.png", note: "Announcements" },
  { id: "pages--pinned-empty", file: "08-empty-state.png", note: "Empty state" },
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  for (const { id, file, note } of SHOTS) {
    const url = `${STORYBOOK}/iframe.html?id=${id}&viewMode=story`;
    await page.goto(url, { waitUntil: "networkidle" });
    // Give the orb-backdrop animation a beat to settle and any seeded
    // contexts (Favourites, JourneyContext) to run their useEffects.
    await page.waitForTimeout(800);
    const target = path.join(OUT_DIR, file);
    await page.screenshot({ path: target, fullPage: false });
    console.log(`  ✓ ${note.padEnd(20)} → ${path.relative(REPO, target)}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
