// Stub of expo-router for Storybook. Routing is faked: useRouter logs
// navigation, useSegments returns [], and useLocalSearchParams reads from
// `globalThis.__SB_ROUTE_PARAMS__` so individual stories can supply route
// params via a decorator.

import { Fragment } from "react";

export function Stack(_props: object) {
  return null;
}

export function useRouter() {
  return {
    push: (to: unknown) => console.log("[router] push", to),
    replace: (to: unknown) => console.log("[router] replace", to),
    navigate: (to: unknown) => console.log("[router] navigate", to),
    back: () => console.log("[router] back"),
  };
}

export function useSegments() {
  return [] as string[];
}

export function useLocalSearchParams<T = Record<string, string>>(): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((globalThis as any).__SB_ROUTE_PARAMS__ ?? {}) as T;
}

// `Link` is occasionally used directly in app code; provide a no-op so
// stories don't crash.
export function Link({ children }: { children?: React.ReactNode }) {
  return <Fragment>{children}</Fragment>;
}
