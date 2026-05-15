// Build stations.json from a live TfGM snapshot via the easymet-edge Worker.
// Run: node scripts/build-stations.mjs
//
// Run this when TfGM adds/removes stations (e.g. Trafford line extensions).
// The generated file is committed; it's not regenerated at app build time.

import { readFile, writeFile } from "node:fs/promises";

const WORKER_URL = process.env.EASYMET_EDGE_URL ?? "https://easymet-edge.dvscllm.workers.dev";

// Zones + service-line membership augmented from Wikipedia's published list.
// TfGM only gives us the physical corridor — these are the lines users
// recognise from the network map.
const META_PATH = new URL("./stations-wikipedia.json", import.meta.url);
const metaRaw = JSON.parse(await readFile(META_PATH, "utf8"));
const normalizeName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
const META = new Map(
  metaRaw.map((m) => [normalizeName(m.name), { zone: m.zone, lines: m.lines }]),
);

// Station coordinates from the metrolink-sim project's GeoJSON. Matches by
// stationCode (TLAREF) primarily; falls back to a normalised-name match for
// the handful of stations where the two datasets differ on code (e.g. TfGM
// `GMX` vs metrolink-sim `DCF` for Deansgate-Castlefield).
const STOPS_PATH =
  "/Users/callum/software-local/metrolink-sim/dist/tfgm-stops.json";
const COORDS = new Map();
const COORDS_BY_NAME = new Map();
try {
  const geo = JSON.parse(await readFile(STOPS_PATH, "utf8"));
  for (const f of geo.features ?? []) {
    const code = f?.properties?.stationCode;
    const name = f?.properties?.name;
    const [lng, lat] = f?.geometry?.coordinates ?? [];
    if (lat == null || lng == null) continue;
    if (code) COORDS.set(code, { lat, lng });
    if (name) COORDS_BY_NAME.set(normalizeName(name), { lat, lng });
  }
  console.log(`[build-stations] loaded ${COORDS.size} station coordinates from metrolink-sim`);
} catch {
  console.warn("[build-stations] no metrolink-sim coords found — stations will ship without lat/lng");
}

// TfGM groups stations by infrastructure corridor (not service pattern).
// These 8 names are the actual values in the Line field of /odata/Metrolinks.
// Colours roughly match the public Metrolink map.
const LINE_COLOURS = {
  "Airport": "#093a8c",
  "Altrincham": "#00a65d",
  "Bury": "#ffcd00",
  "East Manchester": "#009ddc",
  "Eccles": "#0066b3",
  "Oldham & Rochdale": "#ee5c00",
  "South Manchester": "#c5499f",
  "Trafford Park": "#da291c",
};

const res = await fetch(`${WORKER_URL}/metrolinks`);
if (!res.ok) {
  console.error(`Worker fetch failed: HTTP ${res.status}`);
  process.exit(1);
}
const { value: platforms } = await res.json();

// TfGM's `Line` field is the corridor the station sits on (not service pattern).
// Each TLAREF maps to exactly one corridor. Assert that to catch model drift.
const stations = new Map();
const corridors = new Set();

for (const p of platforms) {
  const code = p.TLAREF;
  if (!code) continue;
  corridors.add(p.Line);

  const existing = stations.get(code);
  if (existing) {
    if (existing.corridor !== p.Line) {
      throw new Error(
        `Station ${code} (${p.StationLocation}) has multiple corridors: ${existing.corridor} and ${p.Line}. TfGM model has changed.`,
      );
    }
    existing.platforms += 1;
  } else {
    const meta = META.get(normalizeName(p.StationLocation));
    const coord = COORDS.get(code) ?? COORDS_BY_NAME.get(normalizeName(p.StationLocation));
    stations.set(code, {
      code,
      name: p.StationLocation,
      atcoCode: p.AtcoCode,
      corridor: p.Line,
      platforms: 1,
      zone: meta?.zone ?? null,
      lines: meta?.lines ?? [],
      lat: coord?.lat ?? null,
      lng: coord?.lng ?? null,
    });
  }
}

const unmatched = [...stations.values()].filter((s) => s.zone == null);
if (unmatched.length) {
  console.warn(
    `Warning: no Wikipedia match for ${unmatched.length} stations: ${unmatched.map((s) => s.name).join(", ")}`,
  );
}

const stationList = [...stations.values()].sort((a, b) => a.name.localeCompare(b.name));

const corridorList = [...corridors]
  .filter(Boolean)
  .sort()
  .map((name) => ({ name, colour: LINE_COLOURS[name] ?? "#666666" }));

const missingColours = corridorList.filter((l) => l.colour === "#666666");
if (missingColours.length) {
  console.warn(`Warning: no brand colour mapped for: ${missingColours.map((l) => l.name).join(", ")}`);
}

const output = {
  generatedAt: new Date().toISOString(),
  source: WORKER_URL,
  stations: stationList,
  corridors: corridorList,
};

const outPath = new URL("../src/data/stations.json", import.meta.url);
await writeFile(outPath, JSON.stringify(output, null, 2) + "\n");

console.log(`Wrote ${stationList.length} stations, ${corridorList.length} corridors → ${outPath.pathname}`);
