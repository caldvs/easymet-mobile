import { allStations, distanceMetres, stationByCode, type Station } from "./stations";

// Station orderings along each of the 8 Metrolink service lines, in physical
// travel order from one terminus to the other. Authored by name (easier to
// read + maintain) and resolved to TLAREF codes at module-load time.
//
// Notes / known gaps:
// - These are end-to-end service patterns. Real-world service overlays
//   (short workings, peak extensions) aren't represented.
// - East Didsbury and Rochdale share the same physical track through the city
//   loop; their service patterns terminate differently.
// - findRoute() only finds single-line journeys. Multi-line (with a transfer
//   at e.g. St Peter's Square) is intentionally out of scope for v1.
const LINE_ORDERS_BY_NAME: Record<string, string[]> = {
  Airport: [
    "Manchester Airport",
    "Shadowmoss",
    "Robinswood Road",
    "Peel Hall",
    "Martinscroft",
    "Benchill",
    "Crossacres",
    "Wythenshawe Town Centre",
    "Wythenshawe Park",
    "Baguley",
    "Roundthorn",
    "Moor Road",
    "Northern Moor",
    "Sale Water Park",
    "Barlow Moor Road",
    "St Werburgh's Road",
    "Firswood",
    "Trafford Bar",
    "Cornbrook",
    "Deansgate - Castlefield",
    "St Peter's Square",
    "Market Street",
    "Shudehill",
    "Victoria",
  ],
  Altrincham: [
    "Altrincham",
    "Navigation Road",
    "Timperley",
    "Brooklands",
    "Sale",
    "Dane Road",
    "Stretford",
    "Old Trafford",
    "Trafford Bar",
    "Cornbrook",
    "Deansgate - Castlefield",
    "St Peter's Square",
    "Market Street",
    "Shudehill",
    "Victoria",
    "Queens Road",
    "Abraham Moss",
    "Crumpsall",
    "Bowker Vale",
    "Heaton Park",
    "Prestwich",
    "Besses o' th' Barn",
    "Whitefield",
    "Radcliffe",
    "Bury",
  ],
  Ashton: [
    "Ashton-Under-Lyne",
    "Ashton West",
    "Ashton Moss",
    "Audenshaw",
    "Droylsden",
    "Edge Lane",
    "Cemetery Road",
    "Velopark",
    "Clayton Hall",
    "Etihad Campus",
    "Holt Town",
    "New Islington",
    "Piccadilly",
    "Piccadilly Gardens",
    "Market Street",
    "St Peter's Square",
    "Deansgate - Castlefield",
    "Cornbrook",
    "Pomona",
    "Exchange Quay",
    "Salford Quays",
    "Anchorage",
    "Harbour City",
    "Broadway",
    "Langworthy",
    "Ladywell",
    "Weaste",
    "Eccles",
  ],
  Bury: [
    "Bury",
    "Radcliffe",
    "Whitefield",
    "Besses o' th' Barn",
    "Prestwich",
    "Heaton Park",
    "Bowker Vale",
    "Crumpsall",
    "Abraham Moss",
    "Queens Road",
    "Victoria",
    "Shudehill",
    "Market Street",
    "Piccadilly Gardens",
    "Piccadilly",
  ],
  "East Didsbury": [
    "East Didsbury",
    "Didsbury Village",
    "Withington",
    "Burton Road",
    "West Didsbury",
    "Chorlton",
    "Firswood",
    "St Werburgh's Road",
    "Trafford Bar",
    "Cornbrook",
    "Deansgate - Castlefield",
    "St Peter's Square",
    "Market Street",
    "Shudehill",
    "Victoria",
  ],
  Eccles: [
    "Eccles",
    "Weaste",
    "Ladywell",
    "Langworthy",
    "Broadway",
    "Harbour City",
    "Anchorage",
    "Salford Quays",
    "Exchange Quay",
    "Pomona",
    "Cornbrook",
    "Deansgate - Castlefield",
    "St Peter's Square",
    "Market Street",
    "Piccadilly Gardens",
    "Piccadilly",
  ],
  Rochdale: [
    "Rochdale Town Centre",
    "Rochdale Railway Station",
    "Newbold",
    "Kingsway Business Park",
    "Milnrow",
    "Newhey",
    "Shaw and Crompton",
    "Derker",
    "Oldham Mumps",
    "Oldham Central",
    "Oldham King Street",
    "Westwood",
    "Freehold",
    "South Chadderton",
    "Hollinwood",
    "Failsworth",
    "Newton Heath and Moston",
    "Central Park",
    "Monsall",
    "Victoria",
    "Shudehill",
    "Market Street",
    "Piccadilly Gardens",
    "St Peter's Square",
    "Deansgate - Castlefield",
    "Cornbrook",
    "Trafford Bar",
    "Firswood",
    "Chorlton",
    "West Didsbury",
    "Burton Road",
    "Withington",
    "Didsbury Village",
    "East Didsbury",
  ],
  "Trafford Park": [
    "The Trafford Centre",
    "Trafford Palazzo",
    "Village",
    "Parkway",
    "Imperial War Museum",
    "Wharfside",
    "Pomona",
    "Cornbrook",
    "Deansgate - Castlefield",
    "St Peter's Square",
    "Market Street",
    "Shudehill",
    "Victoria",
    "Crumpsall",
  ],
  // Short branch off the Eccles line: MediaCityUK ↔ Harbour City. From
  // Harbour City passengers continue on the Eccles line either direction.
  // Modelled as its own line so the multi-line planner emits a transfer
  // at Harbour City rather than pretending MediaCityUK sits inline on
  // the main Eccles corridor.
  "MediaCityUK": [
    "Harbour City",
    "MediaCityUK",
  ],
};

// Build name → code lookup from stations.json. Names use a normalised form
// so small punctuation differences ("St Peter's Square" vs "St Peters Square")
// match.
const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const byNormName = new Map<string, Station>();
for (const s of allStations()) byNormName.set(normalise(s.name), s);

function nameToCode(name: string): string | null {
  return byNormName.get(normalise(name))?.code ?? null;
}

export const LINE_ORDERS: Record<string, string[]> = {};
const unresolved: Record<string, string[]> = {};
for (const [line, names] of Object.entries(LINE_ORDERS_BY_NAME)) {
  const codes: string[] = [];
  const missed: string[] = [];
  for (const name of names) {
    const code = nameToCode(name);
    if (code) codes.push(code);
    else missed.push(name);
  }
  LINE_ORDERS[line] = codes;
  if (missed.length) unresolved[line] = missed;
}
if (Object.keys(unresolved).length && typeof console !== "undefined") {
  console.warn("[journey] Unresolved station names:", unresolved);
}

export interface RouteSegment {
  /** Line id (key from LINE_ORDERS) used for this leg. */
  lineId: string;
  /** Station codes traversed on this leg, inclusive of both ends. The
   *  first station of a non-initial segment is the transfer station. */
  stations: string[];
}

export interface Route {
  segments: RouteSegment[];
  /** Flat station list with transfer stations de-duplicated. Always
   *  includes both endpoints. */
  stations: string[];
  /** First segment's line id — kept for backward-compat with consumers
   *  that don't yet handle multi-line routes. */
  lineId: string;
  /** Number of line changes (= segments.length - 1). */
  transfers: number;
}

// Adjacency built once from LINE_ORDERS: station code → list of
// { neighbour code, line id used for this edge }. Each consecutive
// station pair in a line yields two directed edges (both ways).
interface Edge { to: string; lineId: string }
const ADJ: Map<string, Edge[]> = (() => {
  const m = new Map<string, Edge[]>();
  for (const [lineId, order] of Object.entries(LINE_ORDERS)) {
    for (let i = 0; i < order.length - 1; i++) {
      const a = order[i]!;
      const b = order[i + 1]!;
      if (!m.has(a)) m.set(a, []);
      if (!m.has(b)) m.set(b, []);
      m.get(a)!.push({ to: b, lineId });
      m.get(b)!.push({ to: a, lineId });
    }
  }
  return m;
})();

// Find a route between two stations. Prefers fewer line changes
// (transfers) above all else; hops tie-break. Implemented as Dijkstra
// over (station, incoming-line) state pairs — a plain BFS would lock in
// the first line that reaches each station and emit spurious transfers.
export function findRoute(fromCode: string, toCode: string): Route | null {
  if (fromCode === toCode) return null;
  if (!ADJ.has(fromCode) || !ADJ.has(toCode)) return null;

  // Fast path: if any single line contains both endpoints, BFS on that
  // line alone is optimal and avoids the Dijkstra setup.
  for (const [lineId, order] of Object.entries(LINE_ORDERS)) {
    const fromIdx = order.indexOf(fromCode);
    const toIdx = order.indexOf(toCode);
    if (fromIdx < 0 || toIdx < 0) continue;
    const stations =
      fromIdx < toIdx
        ? order.slice(fromIdx, toIdx + 1)
        : order.slice(toIdx, fromIdx + 1).reverse();
    return {
      segments: [{ lineId, stations: [...stations] }],
      stations,
      lineId,
      transfers: 0,
    };
  }

  // Multi-line fallback: Dijkstra. Cost = transfers * BIG + hops. The
  // priority queue is a plain array — for ~100 stations × ~5 lines this
  // is fine; swap for a heap if perf ever matters.
  const TRANSFER_COST = 1_000_000;
  interface Node {
    station: string;
    line: string | null;
    cost: number;
    parent: Node | null;
  }
  const open: Node[] = [{ station: fromCode, line: null, cost: 0, parent: null }];
  const best = new Map<string, number>(); // key: `${station}|${line}` → best cost

  while (open.length > 0) {
    // Pop min-cost node.
    let minIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i]!.cost < open[minIdx]!.cost) minIdx = i;
    }
    const cur = open.splice(minIdx, 1)[0]!;
    if (cur.station === toCode) return reconstructRoute(cur);

    for (const edge of ADJ.get(cur.station) ?? []) {
      const isTransfer = cur.line !== null && cur.line !== edge.lineId;
      const newCost = cur.cost + 1 + (isTransfer ? TRANSFER_COST : 0);
      const key = `${edge.to}|${edge.lineId}`;
      const prev = best.get(key);
      if (prev !== undefined && prev <= newCost) continue;
      best.set(key, newCost);
      open.push({ station: edge.to, line: edge.lineId, cost: newCost, parent: cur });
    }
  }
  return null;
}

function reconstructRoute(final: { station: string; line: string | null; parent: unknown }): Route {
  // Walk the parent chain back to the origin.
  interface Step { station: string; line: string | null }
  const reverse: Step[] = [];
  let cursor: Step | null = final as Step;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursorAny: any = final;
  while (cursorAny !== null) {
    reverse.push({ station: cursorAny.station, line: cursorAny.line });
    cursorAny = cursorAny.parent;
  }
  const path = reverse.reverse();
  // path[0].line is null (origin); path[i>=1].line is the line used to
  // arrive at path[i] from path[i-1].

  const segments: RouteSegment[] = [];
  for (let i = 1; i < path.length; i++) {
    const edgeLine = path[i]!.line!;
    const last = segments[segments.length - 1];
    if (last && last.lineId === edgeLine) {
      last.stations.push(path[i]!.station);
    } else {
      segments.push({ lineId: edgeLine, stations: [path[i - 1]!.station, path[i]!.station] });
    }
  }

  return {
    segments,
    stations: path.map((p) => p.station),
    lineId: segments[0]?.lineId ?? "",
    transfers: Math.max(0, segments.length - 1),
  };
}

// All station codes reachable from `fromCode`. With the multi-line graph
// in place, every station with at least one line is reachable from any
// other connected station. We BFS to find the connected component the
// origin sits in.
export function reachableFrom(fromCode: string): string[] {
  if (!ADJ.has(fromCode)) return [];
  const visited = new Set<string>([fromCode]);
  const queue: string[] = [fromCode];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of ADJ.get(current) ?? []) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);
      queue.push(edge.to);
    }
  }
  visited.delete(fromCode);
  return [...visited];
}

// Dev-only knob: compress journey timing so the Live Activity count-down
// ("in 3 min → 2 → 1 → now") steps through quickly without waiting real
// minutes. 1 = real time, 2 = twice as fast, 4 = four times. RESET TO 1
// BEFORE SHIPPING.
export const SIM_SPEED_MULTIPLIER = 4;

// Local-only switch: force the journey simulation regardless of whether
// GPS is available. When false, the JourneyProvider skips the location
// watcher entirely and advances currentIdx purely on the time-based
// model. Useful for the simulator (where GPS is typically a fixed
// point) and for predictable demo runs. Flip to true to exercise the
// real GPS path.
export const USE_GPS = false;

// Simulation constants — kept together so a real-GPS swap is one-line.
export const SIM = {
  /** Seconds per stop used by the time-based fallback counter when GPS
   *  is unavailable. Calibrated to network average — real per-segment
   *  duration is now computed from station-to-station distance below. */
  secondsPerStop: 90 / SIM_SPEED_MULTIPLIER,
  /** Re-render cadence (ms) for the journey screen / banner. */
  tickMs: 5000 / SIM_SPEED_MULTIPLIER,
  /** How often the Live Activity is re-pushed with a fresh
   *  minutesToNextStop. Scales with the multiplier so minute precision
   *  still steps cleanly in fast-forward mode. */
  activityPushMs: 30_000 / SIM_SPEED_MULTIPLIER,
};

// Metrolink network-average speed including dwell at stops. Calibrated
// against TfGM published end-to-end times — e.g. Piccadilly→Altrincham
// (14km, 14 stops, 1 transfer) lands at ~36 min from this model, against
// a published ~35 min. City-centre vs outer-line variability is averaged
// out; sufficient for "leave by" estimates within a couple of minutes.
const AVG_SPEED_MPS = 7;
// Time penalty for each line change — wait for the connecting service +
// platform transit at an interchange.
const TRANSFER_SECONDS = 300;

/** Estimated end-to-end duration of a route, in seconds. Uses haversine
 *  between adjacent stations divided by the network-average speed (which
 *  bakes in dwell), plus a flat 5 min per transfer. */
export function routeDurationSeconds(route: Route): number {
  let seconds = 0;
  for (let i = 0; i < route.stations.length - 1; i++) {
    const a = stationByCode(route.stations[i]!);
    const b = stationByCode(route.stations[i + 1]!);
    if (a?.lat == null || a?.lng == null || b?.lat == null || b?.lng == null) {
      // Missing coords → fallback per-stop estimate.
      seconds += SIM.secondsPerStop;
      continue;
    }
    const d = distanceMetres({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
    seconds += d / AVG_SPEED_MPS;
  }
  seconds += route.transfers * TRANSFER_SECONDS;
  return Math.round(seconds);
}

/** Per-position line id for each rail-segment between adjacent stations
 *  in the flattened route. positionLineId[i] is the line used to travel
 *  from stations[i] → stations[i+1]. Length = stations.length - 1. */
export function positionLineIds(route: Route): string[] {
  const out: string[] = [];
  for (const seg of route.segments) {
    for (let i = 0; i < seg.stations.length - 1; i++) {
      out.push(seg.lineId);
    }
  }
  return out;
}
