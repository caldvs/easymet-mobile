// Stub of expo-location for Storybook. The real package pulls in
// expo-modules-core, which imports `TurboModuleRegistry` from react-native;
// react-native-web doesn't expose that symbol, so Vite errors at runtime.
// Storybook doesn't need real geolocation — return inert no-ops so the
// providers initialise without trying to call into a native bridge.

export const Accuracy = {
  Lowest: 1,
  Low: 2,
  Balanced: 3,
  High: 4,
  Highest: 5,
  BestForNavigation: 6,
} as const;

export type LocationSubscription = { remove: () => void };

export async function requestForegroundPermissionsAsync() {
  return { status: "denied" as const, granted: false, canAskAgain: false, expires: "never" as const };
}

export async function getCurrentPositionAsync(_opts?: unknown) {
  return {
    coords: {
      latitude: 0,
      longitude: 0,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };
}

export async function watchPositionAsync(
  _opts: unknown,
  _cb: (loc: unknown) => void,
): Promise<LocationSubscription> {
  return { remove: () => {} };
}
