// Global test setup.
//
// happy-dom doesn't ship a localStorage by default — the AsyncStorage web
// build relies on it. Provide a minimal in-memory implementation so hook
// tests that touch AsyncStorage work without complaint.

// React Native injects `__DEV__` as a global at runtime; expo-modules-core
// (transitive dep of expo-location etc.) reads it at module load. Define
// it for Vitest's node-like environment so those modules don't crash on
// import.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__DEV__ = true;

if (typeof window !== "undefined" && !window.localStorage) {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, String(v)),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() {
        return store.size;
      },
    },
    writable: false,
  });
}
