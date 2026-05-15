#!/usr/bin/env node
/**
 * Build src/data/stationSchedules.json — first/last tram times per station.
 *
 * Side task, run ~monthly to keep bundle data fresh. Scrapes tfgm.com's
 * "first and last tram times" pages, one fetch per station (paired
 * against a single city-centre anchor — Piccadilly for most stations,
 * Altrincham for Piccadilly itself). Polite ~2s delay between fetches;
 * resumable (re-running skips entries already present in the output).
 *
 * Usage:
 *   node scripts/build-schedules.mjs            # full run
 *   node scripts/build-schedules.mjs --reset    # discard cached entries
 *   node scripts/build-schedules.mjs --limit=3  # smoke-test with 3 fetches
 *
 * The TfGM HTML has no semantic class hooks, so the parser anchors on
 * plain text ("Saturday 16 May First 05:47 Last 01:08"). If TfGM rev
 * the page layout, the parser breaks — that's intentional: this is a
 * local bundle-data build step, not a runtime dependency.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const STATIONS = path.join(ROOT, "src/data/stations.json");
const OUT = path.join(ROOT, "src/data/stationSchedules.json");

const BASE = "https://tfgm.com/plan-a-journey/schedules/first-and-last-tram-times";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_0) AppleWebKit/537.36";
const DELAY_MS = 2000;

const args = new Set(process.argv.slice(2));
const RESET = args.has("--reset");
const LIMIT = (() => {
  const a = process.argv.find((x) => x.startsWith("--limit="));
  return a ? Number(a.split("=")[1]) : Infinity;
})();

// Strip the trailing platform digit TfGM appends to the published ATCO
// (`9400ZZMAAUL1` → `9400ZZMAAUL`). The schedule URL only accepts the
// shorter form.
const atcoForUrl = (atco) => atco.replace(/\d$/, "");

// Universal city-centre anchor. One pair per station = ~99 fetches. The
// first/last times TfGM returns for `station → PIC` are functionally
// the same as `station → anywhere else city-side`, because Metrolink
// service hours are line-wide rather than per-destination.
const ANCHOR_CODE = "PIC";
const FALLBACK_ANCHOR_CODE = "ALT"; // used when the station IS Piccadilly

async function main() {
  const stations = JSON.parse(await fs.readFile(STATIONS, "utf8")).stations;
  const byCode = new Map(stations.map((s) => [s.code, s]));
  const anchor = byCode.get(ANCHOR_CODE);
  const fallbackAnchor = byCode.get(FALLBACK_ANCHOR_CODE);
  if (!anchor || !fallbackAnchor) {
    throw new Error(`Anchor stations ${ANCHOR_CODE}/${FALLBACK_ANCHOR_CODE} missing from data`);
  }

  let existing = {};
  if (!RESET) {
    try {
      existing = JSON.parse(await fs.readFile(OUT, "utf8"));
    } catch {
      /* first run */
    }
  }

  let done = 0;
  let skipped = 0;
  for (const station of stations) {
    if (done >= LIMIT) break;
    if (existing[station.code]) {
      skipped++;
      continue;
    }
    const to = station.code === ANCHOR_CODE ? fallbackAnchor : anchor;
    const fromStop = atcoForUrl(station.atcoCode);
    const toStop = atcoForUrl(to.atcoCode);
    const url = `${BASE}?fromStop=${fromStop}&toStop=${toStop}`;

    process.stdout.write(`[${done + skipped + 1}/${stations.length}] ${station.code} (${station.name}) → ${to.code} … `);
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const parsed = parse(html);
      existing[station.code] = {
        anchor: to.code,
        firstTram: parsed.firstTram,
        lastTram: parsed.lastTram,
        durationMin: parsed.durationMin,
      };
      process.stdout.write(
        `wk ${parsed.firstTram.weekday ?? "?"}–${parsed.lastTram.weekday ?? "?"} ` +
          `sat ${parsed.firstTram.saturday ?? "?"}–${parsed.lastTram.saturday ?? "?"} ` +
          `sun ${parsed.firstTram.sunday ?? "?"}–${parsed.lastTram.sunday ?? "?"} ` +
          `· ${parsed.durationMin ?? "?"}min\n`,
      );
      // Persist after each fetch so a crash mid-run loses at most one entry.
      await fs.writeFile(OUT, JSON.stringify(existing, null, 2));
      done++;
      await sleep(DELAY_MS);
    } catch (err) {
      process.stdout.write(`FAILED: ${err.message}\n`);
      // Don't break — continue with the rest. The missing entries can be
      // retried on the next run (resumable behaviour).
    }
  }

  console.log(`\n✓ Done. ${done} new, ${skipped} cached, ${stations.length - done - skipped} remaining.`);
}

function parse(html) {
  // Collapse HTML to whitespace-separated text. Two-strategy walk:
  //
  //   Strategy A — strict "[day] First HH:MM Last HH:MM": looks for the
  //   pattern where the day label sits adjacent to its First/Last pair.
  //   Fast and unambiguous when the page renders the table inline.
  //
  //   Strategy B — proximity fallback: collect all day labels and all
  //   "First HH:MM Last HH:MM" pairs separately, then pair each pair
  //   with the nearest preceding day label. Survives extra markup
  //   between the label and the times.
  //
  // The page renders the same data twice (mobile + desktop) and lists
  // the next ~7 days explicitly (e.g. "Saturday 16 May"), so we can
  // resolve weekday vs Saturday vs Sunday from the labels directly —
  // no need to know the run date.
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

  const blocks = [];
  const strict =
    /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+\d{1,2}\s+\w+\s+First\s+(\d{2}:\d{2})\s+Last\s+(\d{2}:\d{2})/g;
  let m;
  while ((m = strict.exec(text)) !== null) {
    blocks.push({ day: m[1], first: m[2], last: m[3] });
  }

  if (blocks.length === 0) {
    // Strategy B — pair each "First HH:MM Last HH:MM" with the nearest
    // preceding day-of-week label within ~200 chars.
    const dayLabels = [...text.matchAll(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/g)];
    const timePairs = [...text.matchAll(/First\s+(\d{2}:\d{2})\s+Last\s+(\d{2}:\d{2})/g)];
    for (const tp of timePairs) {
      const tpStart = tp.index ?? 0;
      let nearest = null;
      for (const dl of dayLabels) {
        const dlStart = dl.index ?? 0;
        if (dlStart < tpStart && tpStart - dlStart < 200) nearest = dl;
        else if (dlStart >= tpStart) break;
      }
      if (nearest) blocks.push({ day: nearest[1], first: tp[1], last: tp[2] });
    }
  }

  const firstTram = { weekday: null, saturday: null, sunday: null };
  const lastTram = { weekday: null, saturday: null, sunday: null };
  for (const b of blocks) {
    const key =
      b.day === "Saturday" ? "saturday" : b.day === "Sunday" ? "sunday" : "weekday";
    // First sample wins per bucket — duplicates across mobile/desktop
    // copies should be identical anyway.
    if (firstTram[key] == null) firstTram[key] = b.first;
    if (lastTram[key] == null) lastTram[key] = b.last;
  }

  const mins = text.match(/(\d+)\s+minutes/);
  const durationMin = mins ? Number(mins[1]) : null;

  return { firstTram, lastTram, durationMin };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
