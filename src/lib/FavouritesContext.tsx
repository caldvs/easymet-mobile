import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const KEY = "easymet:favourites:v1";

interface FavouritesCtx {
  favourites: string[];
  toggle: (code: string) => void;
  isFavourite: (code: string) => boolean;
  loaded: boolean;
}

const Ctx = createContext<FavouritesCtx>({
  favourites: [],
  toggle: () => undefined,
  isFavourite: () => false,
  loaded: false,
});

// Single shared favourites state across every screen. Hoisted into a context
// so a toggle on Now is visible on Pinned within the same render — multiple
// useState instances across screens each held their own copy and never
// resynced.
export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setFavourites(parsed.filter((x) => typeof x === "string"));
        } catch {
          /* corrupted → start empty */
        }
      }
      setLoaded(true);
    });
  }, []);

  const toggle = useCallback((code: string) => {
    setFavourites((cur) => {
      const next = cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code];
      AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavourite = useCallback(
    (code: string) => favourites.includes(code),
    [favourites],
  );

  return (
    <Ctx.Provider value={{ favourites, toggle, isFavourite, loaded }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFavourites() {
  return useContext(Ctx);
}
