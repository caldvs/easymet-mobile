import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  ACCENTS,
  type AccentId,
  darkColours,
  lightColours,
  type Theme,
  type TimeFormat,
} from "./theme";

interface Tweaks {
  theme: Theme;
  accent: AccentId;
  timeFormat: TimeFormat;
  dense: boolean;
  /** Prototype: softens uppercase mono labels → title-case sans, bumps
   *  card radii, warms greys. Off by default. */
  softUI: boolean;
}

const DEFAULTS: Tweaks = {
  theme: "light",
  accent: "blue",
  timeFormat: "mins",
  dense: false,
  softUI: false,
};

const KEY = "easymet:tweaks:v1";

interface TweaksCtxValue extends Tweaks {
  setTheme: (t: Theme) => void;
  setAccent: (a: AccentId) => void;
  setTimeFormat: (f: TimeFormat) => void;
  setDense: (d: boolean) => void;
  setSoftUI: (s: boolean) => void;
  /** Active colour palette derived from theme + accent override. */
  colours: typeof lightColours;
}

const Ctx = createContext<TweaksCtxValue>({
  ...DEFAULTS,
  setTheme: () => undefined,
  setAccent: () => undefined,
  setTimeFormat: () => undefined,
  setDense: () => undefined,
  setSoftUI: () => undefined,
  colours: lightColours,
});

export function TweaksProvider({ children }: { children: React.ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setTweaks((t) => ({ ...t, ...parsed }));
        }
      } catch {
        /* corrupted → keep defaults */
      }
    });
  }, []);

  const update = useCallback((patch: Partial<Tweaks>) => {
    setTweaks((t) => {
      const next = { ...t, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setTheme = useCallback((theme: Theme) => update({ theme }), [update]);
  const setAccent = useCallback((accent: AccentId) => update({ accent }), [update]);
  const setTimeFormat = useCallback((timeFormat: TimeFormat) => update({ timeFormat }), [update]);
  const setDense = useCallback((dense: boolean) => update({ dense }), [update]);
  const setSoftUI = useCallback((softUI: boolean) => update({ softUI }), [update]);

  const base = tweaks.theme === "dark" ? darkColours : lightColours;
  // Resolve accent defensively — earlier versions of the app stored ids
  // ("coral"/"slate") that no longer exist in the accent table. Fall back
  // to the system-blue default rather than crashing on .fg access.
  const accentEntry = ACCENTS[tweaks.accent] ?? ACCENTS.blue;
  const colours = { ...base, accent: accentEntry.fg };

  return (
    <Ctx.Provider
      value={{
        ...tweaks,
        setTheme,
        setAccent,
        setTimeFormat,
        setDense,
        setSoftUI,
        colours,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTweaks() {
  return useContext(Ctx);
}

/** Subset hook for components that only need the palette. */
export function useTheme() {
  const ctx = useContext(Ctx);
  return ctx.colours;
}
