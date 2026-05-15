import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { nearestStation, stationByCode, type Station } from "./stations";

export type Permission = "pending" | "granted" | "denied" | "unsupported";

interface NearestState {
  permission: Permission;
  coord: { lat: number; lng: number } | null;
  station: Station | null;
  error: string | null;
  refreshing: boolean;
  /** When the current `coord` was acquired (epoch ms). null if not yet
   *  resolved or only hydrated from a stale cache. */
  fetchedAt: number | null;
}

interface CtxValue extends NearestState {
  /** Force a fresh GPS fix. Use for pull-to-refresh. */
  refresh: () => Promise<void>;
}

const Ctx = createContext<CtxValue>({
  permission: "pending",
  coord: null,
  station: null,
  error: null,
  refreshing: false,
  fetchedAt: null,
  refresh: async () => undefined,
});

const CACHE_KEY = "easymet:nearest:v1";
const CACHE_FRESH_MS = 5 * 60 * 1000; // hydrate UI instantly if cache is within 5 min

interface Cached {
  coord: { lat: number; lng: number };
  stationCode: string;
  fetchedAt: number;
}

// Geolocation provider with on-device nearest-station lookup. All station
// lat/lng pairs are bundled in `stations.json`, so the "nearest" math is
// pure haversine on the user's last known coord — no network. We persist
// the last fix to AsyncStorage with a 5-minute freshness window so
// subsequent app opens (or fast tab-switches between Home and Nearby) get
// an immediate answer rather than the GPS-warmup placeholder.
export function NearestLocationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NearestState>({
    permission: "pending",
    coord: null,
    station: null,
    error: null,
    refreshing: false,
    fetchedAt: null,
  });
  const cancelledRef = useRef(false);

  // Hydrate from cache synchronously so the first paint already has data
  // when the cached fix is recent. We still kick off a fresh fetch in the
  // background unless the cache is well within the freshness window.
  useEffect(() => {
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (!raw || cancelledRef.current) return;
        try {
          const cached = JSON.parse(raw) as Cached;
          const station =
            stationByCode(cached.stationCode) ?? nearestStation(cached.coord);
          if (!station) return;
          setState((s) => ({
            ...s,
            permission: "granted",
            coord: cached.coord,
            station,
            fetchedAt: cached.fetchedAt,
          }));
        } catch {
          /* corrupted cache — ignore */
        }
      })
      .catch(() => undefined);
  }, []);

  const fetchFresh = useCallback(async (userInitiated: boolean) => {
    if (userInitiated) setState((s) => ({ ...s, refreshing: true }));

    if (Platform.OS === "web") {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setState((s) => ({ ...s, permission: "unsupported", refreshing: false }));
        return;
      }
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            commit(coord);
            resolve();
          },
          (err) => {
            setState((s) => ({
              ...s,
              permission: err.code === 1 ? "denied" : "unsupported",
              error: err.message,
              refreshing: false,
            }));
            resolve();
          },
          { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8_000 },
        );
      });
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setState((s) => ({ ...s, permission: "denied", refreshing: false }));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      commit(coord);
    } catch (e) {
      setState((s) => ({
        ...s,
        permission: "unsupported",
        error: (e as Error).message,
        refreshing: false,
      }));
    }

    function commit(coord: { lat: number; lng: number }) {
      const station = nearestStation(coord);
      const now = Date.now();
      setState({
        permission: "granted",
        coord,
        station,
        error: null,
        refreshing: false,
        fetchedAt: now,
      });
      if (station) {
        const payload: Cached = { coord, stationCode: station.code, fetchedAt: now };
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload)).catch(() => undefined);
      }
    }
  }, []);

  // On mount, decide whether to skip the initial fresh fetch. If the cache
  // hydration above produced a fix within 5 min, hold off — pull-to-refresh
  // is the user's escape hatch. Otherwise fetch immediately.
  useEffect(() => {
    cancelledRef.current = false;
    (async () => {
      const raw = await AsyncStorage.getItem(CACHE_KEY).catch(() => null);
      if (cancelledRef.current) return;
      if (raw) {
        try {
          const cached = JSON.parse(raw) as Cached;
          if (Date.now() - cached.fetchedAt < CACHE_FRESH_MS) return;
        } catch {
          /* fall through to fetch */
        }
      }
      fetchFresh(false);
    })();
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchFresh]);

  const refresh = useCallback(() => fetchFresh(true), [fetchFresh]);

  return <Ctx.Provider value={{ ...state, refresh }}>{children}</Ctx.Provider>;
}

export function useNearestStation() {
  return useContext(Ctx);
}
