import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useDemoMode } from "./DemoMode";
import { fetchDisruptions, type Disruption, type DisruptionsResponse } from "./disruptions";

// Worker /disruptions is edge-cached for 60s and refreshed by a 5-min cron
// upstream. Polling every 2 minutes on the client is plenty — and we pause
// on background to be polite to battery.
const POLL_MS = 2 * 60 * 1000;

interface State {
  disruptions: Disruption[];
  fetchedAt: string | null;
  loading: boolean;
  error: Error | null;
}

interface CtxValue extends State {
  refresh: () => Promise<void>;
}

const Ctx = createContext<CtxValue>({
  disruptions: [],
  fetchedAt: null,
  loading: true,
  error: null,
  refresh: async () => undefined,
});

export function DisruptionsProvider({ children }: { children: React.ReactNode }) {
  const { scenario } = useDemoMode();
  const [state, setState] = useState<State>({
    disruptions: [],
    fetchedAt: null,
    loading: true,
    error: null,
  });
  const inflight = useRef<AbortController | null>(null);

  const fetchOnce = useCallback(async () => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    try {
      const res: DisruptionsResponse = await fetchDisruptions(ctrl.signal);
      if (ctrl.signal.aborted) return;
      setState({
        disruptions: res.disruptions,
        fetchedAt: res.fetchedAt,
        loading: false,
        error: null,
      });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setState((s) => ({ ...s, error: err as Error, loading: false }));
    }
  }, []);

  useEffect(() => {
    // Non-live scenarios short-circuit so the dev server doesn't hit
    // the real edge while iterating. "demo"/"empty" both render as
    // good-service (no disruptions); "down" surfaces an error so the
    // failure UI can be styled.
    if (scenario !== "live") {
      inflight.current?.abort();
      if (scenario === "down") {
        setState({
          disruptions: [],
          fetchedAt: null,
          loading: false,
          error: new Error("Simulated disruptions failure (scenario: down)"),
        });
      } else {
        setState({
          disruptions: [],
          fetchedAt: new Date().toISOString(),
          loading: false,
          error: null,
        });
      }
      return;
    }
    fetchOnce();
    let timer: ReturnType<typeof setInterval> | null = setInterval(fetchOnce, POLL_MS);
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        if (!timer) timer = setInterval(fetchOnce, POLL_MS);
        fetchOnce();
      } else if (timer) {
        clearInterval(timer);
        timer = null;
      }
    });
    return () => {
      if (timer) clearInterval(timer);
      sub.remove();
      inflight.current?.abort();
    };
  }, [scenario, fetchOnce]);

  return <Ctx.Provider value={{ ...state, refresh: fetchOnce }}>{children}</Ctx.Provider>;
}

export function useDisruptions() {
  return useContext(Ctx);
}
