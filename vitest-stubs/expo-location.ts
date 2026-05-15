// Test stub for expo-location. The real module pulls in expo-modules-core
// which expects the React Native native bridge to be present — it isn't,
// in a node + happy-dom runtime. Tests that exercise journey/location
// code never actually call into the platform; they just need the import
// to resolve.

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
  return { status: "denied" as const };
}

export async function getCurrentPositionAsync(): Promise<never> {
  throw new Error("getCurrentPositionAsync stub: not implemented in test env");
}

export async function watchPositionAsync(
  _opts: unknown,
  _cb: unknown,
): Promise<LocationSubscription> {
  return { remove: () => undefined };
}
