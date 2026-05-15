import { corridorForDestination } from "./lines";

export const EDGE_URL = "https://easymet-edge.dvscllm.workers.dev";

// Raw TfGM platform row. Each platform has up to 4 upcoming-tram slots
// (Dest0/Wait0/..., Dest1/..., Dest2/..., Dest3/...).
export interface TfgmPlatform {
  Id: number;
  Line: string;
  TLAREF: string;
  PIDREF: string;
  StationLocation: string;
  AtcoCode: string;
  Direction: "Incoming" | "Outgoing" | string;
  Dest0: string; Carriages0: string; Status0: string; Wait0: string;
  Dest1: string; Carriages1: string; Status1: string; Wait1: string;
  Dest2: string; Carriages2: string; Status2: string; Wait2: string;
  Dest3: string; Carriages3: string; Status3: string; Wait3: string;
  MessageBoard: string;
  LastUpdated: string;
}

export interface TfgmResponse {
  value: TfgmPlatform[];
}

export interface Departure {
  destination: string;
  carriages: number | null;  // 1 (Single), 2 (Double), null (unknown/empty)
  status: string;
  waitMinutes: number;
  platform: string;          // last segment of PIDREF, e.g. "TPID01"
  corridor: string;          // TfGM Line value
  direction: string;
}

export async function fetchMetrolinks(signal?: AbortSignal): Promise<TfgmResponse> {
  const res = await fetch(`${EDGE_URL}/metrolinks`, { signal });
  if (!res.ok) throw new Error(`Worker returned HTTP ${res.status}`);
  return res.json();
}

function parseCarriages(c: string): number | null {
  if (c === "Single") return 1;
  if (c === "Double") return 2;
  return null;
}

export function departuresFor(platforms: TfgmPlatform[], tlaref: string): Departure[] {
  const out: Departure[] = [];
  for (const p of platforms) {
    if (p.TLAREF !== tlaref) continue;
    const platformId = p.PIDREF.split("-").pop() ?? p.PIDREF;
    for (const i of [0, 1, 2, 3] as const) {
      const dest = p[`Dest${i}` as const];
      const wait = p[`Wait${i}` as const];
      if (!dest) continue;
      out.push({
        destination: dest,
        carriages: parseCarriages(p[`Carriages${i}` as const]),
        status: p[`Status${i}` as const],
        waitMinutes: Number(wait) || 0,
        platform: platformId,
        // Correct the corridor based on destination so interchange platforms
        // (tagged with their physical corridor) report the actual service line.
        corridor: corridorForDestination(dest, p.Line),
        direction: p.Direction,
      });
    }
  }
  return out.sort((a, b) => a.waitMinutes - b.waitMinutes);
}

export function messageBoardFor(platforms: TfgmPlatform[], tlaref: string): string | null {
  const messages = new Set<string>();
  for (const p of platforms) {
    if (p.TLAREF !== tlaref) continue;
    if (p.MessageBoard?.trim()) messages.add(p.MessageBoard.trim());
  }
  // Most stations have the same message across platforms. Take the first
  // distinct one to keep the UI quiet.
  return messages.size === 0 ? null : [...messages][0]!;
}

// Network announcements derived from the MessageBoard field across all
// platforms. We dedupe identical messages and classify severity from the
// text so the Home banner can colour-code (and the user can decide whether
// to bother expanding).

export type AnnouncementSeverity = "severe" | "notice" | "info";

export interface Announcement {
  message: string;
  severity: AnnouncementSeverity;
  /** TLAREF codes of stations whose platforms carry this message. */
  affectedStations: string[];
}

function classifySeverity(msg: string): AnnouncementSeverity {
  const lower = msg.toLowerCase();
  if (
    /\b(no service|line (is )?closed|suspended|severe delays?|cancelled|emergency|evacuat|police|station closed|no trams)\b/.test(
      lower,
    )
  ) {
    return "severe";
  }
  if (
    /\b(engineering|works|replacement (bus|service)|diversion|reduced|delay|short trams?|disruption|busy)\b/.test(
      lower,
    )
  ) {
    return "notice";
  }
  return "info";
}

const SEVERITY_RANK: Record<AnnouncementSeverity, number> = {
  severe: 0,
  notice: 1,
  info: 2,
};

export function getAnnouncements(platforms: TfgmPlatform[]): Announcement[] {
  const byMessage = new Map<string, Set<string>>();
  for (const p of platforms) {
    const msg = p.MessageBoard?.trim();
    if (!msg) continue;
    if (!byMessage.has(msg)) byMessage.set(msg, new Set());
    byMessage.get(msg)!.add(p.TLAREF);
  }
  return [...byMessage.entries()]
    .map(
      ([message, set]): Announcement => ({
        message,
        severity: classifySeverity(message),
        affectedStations: [...set].sort(),
      }),
    )
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

// A direction is a destination passengers can travel to from this station.
// We derive directions from live data rather than authoring them per-station —
// each unique destination string becomes its own direction. "Terminates Here"
// trams are filtered out (they're not useful for someone waiting to board).
export interface DirectionGroup {
  label: string;          // e.g. "Towards Altrincham"
  terminus: string;       // the destination as TfGM reports it
  lines: string[];        // corridor names of platforms serving this direction
  departures: Departure[];
}

export function groupByDirection(departures: Departure[]): DirectionGroup[] {
  const groups = new Map<string, DirectionGroup>();
  for (const d of departures) {
    if (!d.destination || d.destination === "Terminates Here") continue;
    let g = groups.get(d.destination);
    if (!g) {
      g = {
        label: `Towards ${d.destination}`,
        terminus: d.destination,
        lines: [],
        departures: [],
      };
      groups.set(d.destination, g);
    }
    if (!g.lines.includes(d.corridor)) g.lines.push(d.corridor);
    g.departures.push(d);
  }
  // Within each group, sort by wait time; across groups, sort by next departure.
  for (const g of groups.values()) {
    g.departures.sort((a, b) => a.waitMinutes - b.waitMinutes);
  }
  return [...groups.values()].sort((a, b) => {
    const aNext = a.departures[0]?.waitMinutes ?? Infinity;
    const bNext = b.departures[0]?.waitMinutes ?? Infinity;
    return aNext - bNext;
  });
}
