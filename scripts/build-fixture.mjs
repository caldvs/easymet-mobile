// Build src/data/fixture.json from a captured TfGM snapshot.
// metrolink-performance stores rows in snake_case JSONL; this re-shapes them
// to TfGM's original mixed-case keys so the fixture is drop-in compatible
// with the live response shape.

import { execSync } from "node:child_process";
import { writeFile } from "node:fs/promises";

const SNAPSHOT =
  "/Users/callum/software-local/metrolink-performance/data/live/snapshots/2026/05/06/2026-05-06T16-54-29Z.jsonl.gz";

const KEY_MAP = {
  id: "Id",
  line: "Line",
  tlaref: "TLAREF",
  pidref: "PIDREF",
  station_location: "StationLocation",
  atco_code: "AtcoCode",
  direction: "Direction",
  dest0: "Dest0",  carriages0: "Carriages0",  status0: "Status0",  wait0: "Wait0",
  dest1: "Dest1",  carriages1: "Carriages1",  status1: "Status1",  wait1: "Wait1",
  dest2: "Dest2",  carriages2: "Carriages2",  status2: "Status2",  wait2: "Wait2",
  dest3: "Dest3",  carriages3: "Carriages3",  status3: "Status3",  wait3: "Wait3",
  message_board: "MessageBoard",
  last_updated: "LastUpdated",
};

const raw = execSync(`gunzip -c ${SNAPSHOT}`, { encoding: "utf8" });
const lines = raw.trim().split("\n");

function nullToEmpty(v) {
  return v == null ? "" : v;
}

const value = lines.map((line) => {
  const src = JSON.parse(line);
  const out = {};
  for (const [from, to] of Object.entries(KEY_MAP)) {
    out[to] = nullToEmpty(src[from]);
  }
  return out;
});

const output = { value };
const outPath = new URL("../src/data/fixture.json", import.meta.url);
await writeFile(outPath, JSON.stringify(output) + "\n");

const withTrams = value.filter(
  (p) => p.Dest0 || p.Dest1 || p.Dest2 || p.Dest3,
).length;
console.log(`Wrote ${value.length} platforms (${withTrams} active) → ${outPath.pathname}`);
console.log(`Source: ${SNAPSHOT.split("/").pop()}`);
