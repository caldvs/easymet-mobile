// Test stub for the local journey-activity Expo module. The real module
// imports expo-modules-core which expects the React Native native bridge
// to be present — it isn't, in a node + happy-dom runtime. Tests never
// exercise the platform calls; they just need the import to resolve.

export function isJourneyActivitySupported(): boolean {
  return false;
}

export async function startJourneyActivity(_args: unknown): Promise<string | null> {
  return null;
}

export function addActivityPushTokenListener(
  _handler: (event: { activityId: string; token: string }) => void,
): { remove: () => void } {
  return { remove: () => undefined };
}

export async function endJourneyActivity(): Promise<void> {
  return undefined;
}
