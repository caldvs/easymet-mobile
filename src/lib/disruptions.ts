// Mirror of easymet-edge/src/disruptions/types.ts. If the Worker's schema
// changes, update both files in lockstep — there's no codegen yet.

import { EDGE_URL } from "./api";

export type DisruptionType = "incident" | "planned-works";
export type DisruptionScope = "network" | "line" | "station";
export type DisruptionSeverity = "severe" | "notice" | "info";

export interface Disruption {
  id: string;
  source: "travel-alerts" | "improvement-works";
  sourceUrl: string;
  fetchedAt: string;
  sourceUpdatedAt: string | null;
  title: string;
  body: string;
  startsAt: string | null;
  endsAt: string | null;
  type: DisruptionType;
  scope: DisruptionScope;
  severity: DisruptionSeverity;
  linesRaw: string[];
  stopsRaw: string[];
  affectedCorridors: string[];
  affectedStationCodes: string[];
}

export interface DisruptionsResponse {
  fetchedAt: string;
  disruptions: Disruption[];
}

export async function fetchDisruptions(signal?: AbortSignal): Promise<DisruptionsResponse> {
  const res = await fetch(`${EDGE_URL}/disruptions`, { signal });
  if (!res.ok) throw new Error(`disruptions upstream ${res.status}`);
  return (await res.json()) as DisruptionsResponse;
}

export type Timing = "active" | "today" | "upcoming" | "ended";

/** Classifies a disruption against `now` so the UI can route it. The Worker
 *  stores raw startsAt/endsAt; the client decides whether an alert is
 *  active or coming-up because that decision is time-sensitive and
 *  shouldn't be pinned to the cron timestamp. */
export function timingFor(d: Disruption, now: Date = new Date()): Timing {
  const t = now.getTime();
  const start = d.startsAt ? new Date(d.startsAt).getTime() : null;
  const end = d.endsAt ? new Date(d.endsAt).getTime() : null;

  // No start date → assume live (TfGM marks these "until further notice").
  if (start === null) return end !== null && end < t ? "ended" : "active";

  if (end !== null && end < t) return "ended";
  if (start <= t) return "active";

  // Starts later today (within 12h) → "today"; further out → "upcoming".
  const twelveHours = 12 * 60 * 60 * 1000;
  return start - t <= twelveHours ? "today" : "upcoming";
}

/** Active disruptions worthy of the Home banner: incidents that are live
 *  now, OR planned works that have already started. Excludes future planned
 *  works (those go to the "Coming up" section). */
export function activeForBanner(ds: Disruption[], now: Date = new Date()): Disruption[] {
  return ds.filter((d) => {
    const timing = timingFor(d, now);
    if (timing !== "active") return false;
    // Don't shout about station-scope alerts on the network banner — those
    // belong on the specific station's page.
    if (d.scope === "station") return false;
    return true;
  });
}

/** Disruptions affecting a specific station. Includes both active and
 *  upcoming (within ~7 days) so a traveller can see what's coming. */
export function disruptionsForStation(
  ds: Disruption[],
  stationCode: string,
  now: Date = new Date(),
): Disruption[] {
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return ds.filter((d) => {
    if (!d.affectedStationCodes.includes(stationCode)) return false;
    const timing = timingFor(d, now);
    if (timing === "ended") return false;
    if (timing === "upcoming" && d.startsAt) {
      const delta = new Date(d.startsAt).getTime() - now.getTime();
      if (delta > sevenDays) return false;
    }
    return true;
  });
}

/** All currently-relevant disruptions, grouped for the Announcements
 *  screen. "Right now" = active. "Coming up" = today + upcoming planned. */
export function groupedForAnnouncements(
  ds: Disruption[],
  now: Date = new Date(),
): { active: Disruption[]; upcoming: Disruption[] } {
  const active: Disruption[] = [];
  const upcoming: Disruption[] = [];
  for (const d of ds) {
    const t = timingFor(d, now);
    if (t === "active") active.push(d);
    else if (t === "today" || t === "upcoming") upcoming.push(d);
  }
  // Sort active by severity (severe first) then most recent.
  const sevRank = { severe: 0, notice: 1, info: 2 } as const;
  active.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
  // Upcoming sorted by start date (sooner first).
  upcoming.sort((a, b) => {
    const ax = a.startsAt ? new Date(a.startsAt).getTime() : Infinity;
    const bx = b.startsAt ? new Date(b.startsAt).getTime() : Infinity;
    return ax - bx;
  });
  return { active, upcoming };
}
