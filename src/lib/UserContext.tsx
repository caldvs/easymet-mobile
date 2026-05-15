import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const KEY = "easymet:user-name:v1";

interface UserCtxValue {
  name: string;
  setName: (n: string) => void;
  loaded: boolean;
}

const Ctx = createContext<UserCtxValue>({
  name: "",
  setName: () => undefined,
  loaded: false,
});

// User's personal details. Currently just their name for the Home greeting;
// future additions (avatar, preferred greeting language, etc.) live here.
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [name, setNameState] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setNameState(raw);
      setLoaded(true);
    });
  }, []);

  const setName = useCallback((n: string) => {
    setNameState(n);
    AsyncStorage.setItem(KEY, n);
  }, []);

  return <Ctx.Provider value={{ name, setName, loaded }}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}
