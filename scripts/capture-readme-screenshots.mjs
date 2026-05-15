// Captures portfolio-quality iPhone-framed screenshots of every app
// screen via the Showcase stories. Writes PNGs to `docs/screenshots/`.
// Run with Storybook already running at :6006.
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const STORYBOOK = "http://localhost:6006";
const REPO = path.resolve(new URL(".", import.meta.url).pathname, "..");
const OUT_DIR = path.join(REPO, "docs", "screenshots");

// Viewport sized so the phone frame (421×880) sits on a soft canvas
// margin without forcing the screen to scroll. 2× DPR for crisp PNGs on
// GitHub's retina rendering.
const VIEWPORT = { width: 560, height: 1020 };

const SHOTS = [
  { id: "showcase--home", file: "01-home.png", note: "Home" },
  { id: "showcase--pinned", file: "02-pinned.png", note: "Pinned" },
  { id: "showcase--plan", file: "03-plan.png", note: "Plan" },
  { id: "showcase--journey", file: "04-journey.png", note: "Journey" },
  { id: "showcase--station-detail", file: "05-station-detail.png", note: "Station detail" },
  { id: "showcase--browse", file: "06-browse.png", note: "Browse" },
  { id: "showcase--announcements", file: "07-announcements.png", note: "Announcements" },
  { id: "showcase--nearby", file: "08-nearby.png", note: "Nearby" },
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
    // Long settle: the seeded AsyncStorage favourites + name need to load,
    // and the orb backdrop animation needs to reach a stable frame.
    await page.waitForTimeout(1400);
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
