import * as Location from "expo-location";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  addActivityPushTokenListener,
  endJourneyActivity,
  startJourneyActivity,
} from "../../modules/journey-activity";
import { doorSideFor } from "../data/stationDoors";
import { corridorFor } from "./lines";
import type { Route } from "./journey";
import { routeDurationSeconds, SIM, SIM_SPEED_MULTIPLIER, USE_GPS } from "./journey";
import { distanceMetres, stationByCode } from "./stations";

export interface ActiveJourney {
  fromCode: string;
  toCode: string;
  route: Route;
  startedAt: number;
}

interface JourneyCtxValue {
  journey: ActiveJourney | null;
  /** Currently-displayed station index — derived from the user's GPS
   *  position when available; falls back to a time-based simulation. */
  currentIdx: number;
  start: (route: Route, fromCode: string, toCode: string) => void;
  end: () => void;
}

const Ctx = createContext<JourneyCtxValue>({
  journey: null,
  currentIdx: 0,
  start: () => undefined,
  end: () => undefined,
});

// Only treat a route-station as "the user is here" if they're within this
// many metres of it. Beyond that (e.g. before the user boards, or if they
// step off briefly), we hold the last known index rather than snapping
// to a station they're nowhere near.
const ON_ROUTE_THRESHOLD_M = 800;

// Local push server (see `scripts/push-server/`). Drives the Live Activity
// updates via `simctl push` so they continue when the app is backgrounded.
// On the iOS Simulator this hits the host machine's loopback through the
// usual proxy; if you're on a real device, you'd point this at a hosted
// APNs-capable server instead.
const PUSH_SERVER_URL = "http://localhost:3030";

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [journey, setJourney] = useState<ActiveJourney | null>(null);
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(null);
  // The journey screen + banner need to re-render every few seconds so the
  // computed currentIdx ticks forward when running on the time fallback.
  const [, force] = useState(0);

  useEffect(() => {
    if (!journey) return;
    const t = setInterval(() => force((n) => n + 1), SIM.tickMs);
    return () => clearInterval(t);
  }, [journey]);

  // Capture the Live Activity's APNs push token and hand it to the
  // local push server. The server schedules tick pushes that re-render
  // the widget at the right cadence — which works even when the app is
  // in the background (the previous JS-side interval did not, because
  // iOS suspends the JS runtime). The widget itself derives all dynamic
  // values from attributes + current time, so the push payload only
  // needs to bump a tick to invalidate the cached render.
  //
  // Server URL is the local Node.js push server (`scripts/push-server`).
  // When pointed at a real APNs gateway later, the token + payload shape
  // is unchanged — only the server's driver swaps.
  useEffect(() => {
    if (!journey) return;
    const sub = addActivityPushTokenListener(({ token }) => {
      const intervalMs = SIM.activityPushMs;
      const journeyDurationMs = routeDurationSeconds(journey.route) * 1000;
      fetch(`${PUSH_SERVER_URL}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          intervalMs,
          journeyDurationMs,
        }),
      }).catch((e) => {
        if (__DEV__) console.warn("push-server /start failed:", e);
      });
    });
    return () => {
      sub.remove();
      fetch(`${PUSH_SERVER_URL}/cancel`, { method: "POST" }).catch(() => undefined);
    };
  }, [journey]);

  // Subscribe to live position while a journey is active. Skipped
  // entirely when USE_GPS is false (the default for local / simulator
  // work). The time-based SIM fallback takes over.
  useEffect(() => {
    if (!journey || !USE_GPS) {
      setCoord(null);
      return;
    }
    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled || status !== "granted") return;
        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 30,
            timeInterval: 10_000,
          },
          (pos) => {
            if (cancelled) return;
            setCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
        );
      } catch {
        /* permission flow or platform unavailable — fall back to SIM */
      }
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [journey]);

  const currentIdx = computeCurrentIdx(journey, coord);

  const start = useCallback((route: Route, fromCode: string, toCode: string) => {
    setJourney({ fromCode, toCode, route, startedAt: Date.now() });
  }, []);

  const end = useCallback(() => {
    setJourney(null);
    endJourneyActivity();
  }, []);

  // Drive the iOS Live Activity. The widget computes its own state from
  // the static attributes inside a TimelineView, so JS only fires `start`
  // once at journey begin and `end` when the journey ends. No periodic
  // pushes — the count-down keeps ticking while the app is backgrounded.
  // No-ops on Android / web / Expo Go.
  const activityStartedRef = useRef(false);
  useEffect(() => {
    if (!journey) {
      if (activityStartedRef.current) {
        activityStartedRef.current = false;
        endJourneyActivity();
      }
      return;
    }
    if (activityStartedRef.current) return; // already started for this journey

    const stations = journey.route.stations;
    const fromStation = stationByCode(journey.fromCode);
    const toStation = stationByCode(journey.toCode);
    const totalSeconds = routeDurationSeconds(journey.route);
    const firstSegment = journey.route.segments[0];
    const firstLineId = firstSegment?.lineId ?? journey.route.lineId;
    const firstLineColor = corridorFor(corridorFromLineId(firstLineId)).colour;

    // Station names in route order.
    const stationNames = stations.map((code) => stationByCode(code)?.name ?? "");

    // Line colour at each station. At transfer boundaries the inbound
    // line's colour is used (the station "belongs" to the segment that
    // brought us there, not the one we're about to switch to).
    const lineColorByStation: string[] = new Array(stations.length).fill(firstLineColor);
    {
      let segStart = 0;
      for (const seg of journey.route.segments) {
        const segEnd = segStart + seg.stations.length - 1;
        const colour = corridorFor(corridorFromLineId(seg.lineId)).colour;
        for (let i = segStart; i <= segEnd; i++) {
          // The first time we visit an index wins, so a transfer station
          // keeps the inbound line's colour rather than being overwritten
          // by the outbound segment's pass.
          if (i === segStart && i !== 0) continue;
          lineColorByStation[i] = colour;
        }
        segStart = segEnd;
      }
    }

    // Door-side at the destination. Uses the final segment of the route
    // to determine corridor + direction. Falls back to "left" by default
    // inside `doorSideFor`.
    const finalSegment = journey.route.segments[journey.route.segments.length - 1];
    let doorsSide: "left" | "right" | "both" | null = null;
    if (finalSegment && toStation) {
      const corridor = corridorFromLineId(finalSegment.lineId);
      const terminusCode = finalSegment.stations[finalSegment.stations.length - 1];
      const terminusName = terminusCode ? stationByCode(terminusCode)?.name : undefined;
      if (terminusName) {
        doorsSide = doorSideFor(corridor, terminusName, toStation.name);
      }
    }

    const totalStops = Math.max(stations.length - 1, 1);
    const scheduledArrivalEpochSeconds = (journey.startedAt + totalSeconds * 1000) / 1000;
    const journeyStartedAtEpochSeconds = journey.startedAt / 1000;

    activityStartedRef.current = true;
    startJourneyActivity({
      lineId: firstLineId,
      lineName: firstLineId,
      lineColorHex: firstLineColor,
      originStation: fromStation?.name ?? "",
      destinationStation: toStation?.name ?? "",
      totalStops,
      scheduledArrivalEpochSeconds,
      journeyStartedAtEpochSeconds,
      secondsPerStop: SIM.secondsPerStop,
      simSpeedMultiplier: SIM_SPEED_MULTIPLIER,
      stationNames,
      lineColorByStation,
      doorsSide,
      isDelayed: false,
    });
  }, [journey]);

  return (
    <Ctx.Provider value={{ journey, currentIdx, start, end }}>{children}</Ctx.Provider>
  );
}

// Lines in our app's data use a few different aliases for the same
// corridor; normalise to the canonical corridor name used by the
// design palette.
function corridorFromLineId(lineId: string): string {
  if (lineId === "Ashton") return "East Manchester";
  if (lineId === "East Didsbury") return "South Manchester";
  if (lineId === "Rochdale") return "Oldham & Rochdale";
  if (lineId === "MediaCityUK") return "Eccles";
  return lineId;
}

function computeCurrentIdx(
  journey: ActiveJourney | null,
  coord: { lat: number; lng: number } | null,
): number {
  if (!journey) return 0;
  const stations = journey.route.stations;

  // Location path: pick the route-station nearest to the user's coord,
  // provided they're within the on-route threshold. Otherwise fall through.
  if (coord) {
    let bestIdx = -1;
    let bestD = Infinity;
    for (let i = 0; i < stations.length; i++) {
      const s = stationByCode(stations[i]!);
      if (!s || s.lat == null || s.lng == null) continue;
      const d = distanceMetres(coord, { lat: s.lat, lng: s.lng });
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0 && bestD <= ON_ROUTE_THRESHOLD_M) return bestIdx;
  }

  // Fallback simulation: time elapsed since journey start, one stop per
  // SIM.secondsPerStop. Mostly useful in demo / no-GPS scenarios.
  const elapsed = Date.now() - journey.startedAt;
  const auto = Math.floor(elapsed / (SIM.secondsPerStop * 1000));
  return Math.max(0, Math.min(stations.length - 1, auto));
}

export function useJourney() {
  return useContext(Ctx);
}
