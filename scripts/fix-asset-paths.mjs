// Cloudflare Pages's deploy ignores paths containing `node_modules` (a
// Wrangler default), even when those paths live inside `dist/`. Expo's
// web export emits font + image assets at
// `dist/assets/node_modules/@expo-google-fonts/...`, so they'd silently
// vanish on deploy and the browser would render system fonts only.
//
// This script renames the offending directory and rewrites references in
// the bundled JS + pre-rendered HTML so the asset paths still resolve.

import { existsSync } from "node:fs";
import { readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DIST = "dist";
const FROM = "assets/node_modules";
const TO = "assets/_pkg";

async function walk(dir, out = []) {
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

const offending = join(DIST, FROM);
if (!existsSync(offending)) {
  console.log("[fix-asset-paths] nothing to fix (no node_modules dir)");
  process.exit(0);
}

await rename(offending, join(DIST, TO));
console.log(`[fix-asset-paths] renamed ${FROM} → ${TO}`);

const files = (await walk(DIST)).filter((f) => f.endsWith(".js") || f.endsWith(".html"));
let touched = 0;
for (const f of files) {
  const src = await readFile(f, "utf8");
  if (!src.includes(FROM)) continue;
  await writeFile(f, src.split(FROM).join(TO));
  touched += 1;
}
console.log(`[fix-asset-paths] rewrote references in ${touched} file(s)`);
