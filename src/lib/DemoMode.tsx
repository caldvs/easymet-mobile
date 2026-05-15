import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

// Dev scenarios — let the developer force the app into a specific data
// state without standing up real backends or waiting for the right
// service moment. Also used in production as the overnight fallback
// ("demo" snapshot when no live trams are running).
//
//   live    real fetches against tfgm.com / easymet-edge
//   demo    bundled peak-hour snapshot from fixture.json (default
//           overnight, default in localhost dev so we don't hammer the
//           real edge endpoint)
//   empty   same shape as live but no departures — exercises the
//           "no upcoming trams" UI
//   down    pretend the edge endpoint is failing — exercises the
//           "Couldn't reach Metrolink data" UI
export type Scenario = "live" | "demo" | "empty" | "down";

const KEY = "easymet:scenario:v1";
const LEGACY_DEMO_KEY = "easymet:demo:v1"; // pre-scenario boolean

// Metrolink doesn't run 01:00–05:30 local time. With no stored
// preference and inside that gap, default to demo so the app actually
// shows something useful at 2am.
function isOvernightUK(): boolean {
  try {
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        hour12: false,
        timeZone: "Europe/London",
      }).format(new Date()),
    );
    return hour >= 1 && hour < 6;
  } catch {
    return false;
  }
}

// On localhost web (dev server) we default to the demo snapshot so the
// app doesn't hit the real Cloudflare edge during iteration.
function isLocalhostWeb(): boolean {
  if (Platform.OS !== "web") return false;
  try {
    return (
      typeof location !== "undefined" &&
      (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

interface DemoCtx {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  // Back-compat for existing call sites that just want the boolean
  // "are we showing the bundled snapshot" — i.e. the live/demo pill.
  demo: boolean;
  toggle: () => void;
  loaded: boolean;
}

const Ctx = createContext<DemoCtx>({
  scenario: "live",
  setScenario: () => undefined,
  demo: false,
  toggle: () => undefined,
  loaded: false,
});

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [scenario, setScenarioState] = useState<Scenario>("live");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw === "live" || raw === "demo" || raw === "empty" || raw === "down") {
        setScenarioState(raw);
      } else {
        // Migrate the older boolean preference if it exists.
        const legacy = await AsyncStorage.getItem(LEGACY_DEMO_KEY);
        if (legacy === "1") setScenarioState("demo");
        else if (legacy === "0") setScenarioState("live");
        else if (isLocalhostWeb()) setScenarioState("demo");
        else if (isOvernightUK()) setScenarioState("demo");
      }
      setLoaded(true);
    })();
  }, []);

  const setScenario = useCallback((s: Scenario) => {
    setScenarioState(s);
    AsyncStorage.setItem(KEY, s);
  }, []);

  const toggle = useCallback(() => {
    setScenarioState((prev) => {
      const next: Scenario = prev === "demo" ? "live" : "demo";
      AsyncStorage.setItem(KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<DemoCtx>(
    () => ({ scenario, setScenario, demo: scenario === "demo", toggle, loaded }),
    [scenario, setScenario, toggle, loaded],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemoMode() {
  return useContext(Ctx);
}
