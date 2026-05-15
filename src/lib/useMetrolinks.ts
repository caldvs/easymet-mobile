import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { fetchMetrolinks, type TfgmResponse } from "./api";
import fixture from "../data/fixture.json";
import { useDemoMode } from "./DemoMode";

const POLL_MS = 30_000;
const FIXTURE: TfgmResponse = fixture as TfgmResponse;

interface State {
  data: TfgmResponse | null;
  error: Error | null;
  loading: boolean;
  /** True only when the user explicitly pulled-to-refresh. Auto-polls don't
   *  flip this — otherwise the RefreshControl spinner animates every 30s.
   */
  refreshing: boolean;
  lastUpdated: number | null;
}

// Polls /metrolinks every 30s while foregrounded, pauses on background.
// Single instance is enough for the whole app — TfGM's response covers
// every station, so each screen filters from the same payload.
// In demo mode we return a bundled peak-hour snapshot instead, so the UI
// stays populated outside service hours.
export function useMetrolinks() {
  const { scenario, demo } = useDemoMode();
  const [state, setState] = useState<State>({
    data: null,
    error: null,
    loading: true,
    refreshing: false,
    lastUpdated: null,
  });
  const inflight = useRef<AbortController | null>(null);

  const doFetch = useCallback(async (userInitiated: boolean) => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    if (userInitiated) setState((s) => ({ ...s, refreshing: true }));
    try {
      const data = await fetchMetrolinks(ctrl.signal);
      if (ctrl.signal.aborted) return;
      setState({
        data,
        error: null,
        loading: false,
        refreshing: false,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setState((s) => ({ ...s, error: err as Error, loading: false, refreshing: false }));
    }
  }, []);

  /** User pulled to refresh — shows the RefreshControl spinner. */
  const refresh = useCallback(() => doFetch(true), [doFetch]);
  /** Background poll — silent. */
  const poll = useCallback(() => doFetch(false), [doFetch]);

  useEffect(() => {
    // Non-live scenarios short-circuit the fetch entirely so the dev
    // server doesn't hit the real edge — the picker in Tweaks (or the
    // legacy live/demo pill on Nearby) sets this.
    if (scenario !== "live") {
      inflight.current?.abort();
      if (scenario === "demo") {
        setState({
          data: FIXTURE,
          error: null,
          loading: false,
          refreshing: false,
          lastUpdated: Date.now(),
        });
      } else if (scenario === "empty") {
        setState({
          data: { value: [] } as unknown as TfgmResponse,
          error: null,
          loading: false,
          refreshing: false,
          lastUpdated: Date.now(),
        });
      } else if (scenario === "down") {
        setState({
          data: null,
          error: new Error("Simulated edge failure (scenario: down)"),
          loading: false,
          refreshing: false,
          lastUpdated: null,
        });
      }
      return;
    }
    poll();
    let timer: ReturnType<typeof setInterval> | null = setInterval(poll, POLL_MS);

    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        if (!timer) timer = setInterval(poll, POLL_MS);
        poll();
      } else {
        if (timer) clearInterval(timer);
        timer = null;
      }
    });

    return () => {
      if (timer) clearInterval(timer);
      sub.remove();
      inflight.current?.abort();
    };
  }, [scenario, poll]);

  return { ...state, refresh, demo };
}
