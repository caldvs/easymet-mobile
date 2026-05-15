import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Persists which disruption IDs the user has acknowledged ("dismissed").
// A dismissed item still appears in the Announcements list under the
// collapsible "Acknowledged" section so the user can revisit it, but it
// stops contributing to the unread badge.

const KEY = "easymet:dismissed:v1";

type DismissedMap = Record<string, number>;

interface CtxValue {
  dismissedAt: DismissedMap;
  isDismissed: (id: string) => boolean;
  dismiss: (id: string) => void;
  dismissAll: (ids: string[]) => void;
  restore: (id: string) => void;
}

const Ctx = createContext<CtxValue>({
  dismissedAt: {},
  isDismissed: () => false,
  dismiss: () => undefined,
  dismissAll: () => undefined,
  restore: () => undefined,
});

export function DismissedAnnouncementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dismissedAt, setDismissedAt] = useState<DismissedMap>({});

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            setDismissedAt(parsed);
          }
        } catch {
          /* corrupted — ignore */
        }
      })
      .catch(() => undefined);
  }, []);

  const persist = useCallback((next: DismissedMap) => {
    setDismissedAt(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const value = useMemo<CtxValue>(
    () => ({
      dismissedAt,
      isDismissed: (id) => dismissedAt[id] !== undefined,
      dismiss: (id) => persist({ ...dismissedAt, [id]: Date.now() }),
      dismissAll: (ids) => {
        const now = Date.now();
        const next = { ...dismissedAt };
        for (const id of ids) next[id] = now;
        persist(next);
      },
      restore: (id) => {
        const next = { ...dismissedAt };
        delete next[id];
        persist(next);
      },
    }),
    [dismissedAt, persist],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDismissedAnnouncements() {
  return useContext(Ctx);
}
