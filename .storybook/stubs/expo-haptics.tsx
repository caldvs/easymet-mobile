// Stub of expo-haptics for Storybook. The real package imports
// expo-modules-core, which imports `TurboModuleRegistry` from react-native
// — a symbol react-native-web doesn't expose. Haptics is a no-op on the
// web preview anyway, so return resolved promises.

export const ImpactFeedbackStyle = { Light: "light", Medium: "medium", Heavy: "heavy" } as const;
export const NotificationFeedbackType = { Success: "success", Warning: "warning", Error: "error" } as const;

export async function selectionAsync() {}
export async function impactAsync(_style?: unknown) {}
export async function notificationAsync(_type?: unknown) {}
