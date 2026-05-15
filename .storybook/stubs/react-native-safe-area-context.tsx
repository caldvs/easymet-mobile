// Minimal stub of react-native-safe-area-context for Storybook. The real
// package taps into platform APIs that aren't meaningful here; rendering
// SafeAreaView as a passthrough View keeps screen stories laying out
// correctly.

import { View, type ViewProps } from "react-native";

export function SafeAreaView(props: ViewProps) {
  return <View {...props} />;
}

export function SafeAreaProvider({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function useSafeAreaInsets() {
  return { top: 0, bottom: 0, left: 0, right: 0 };
}

export function useSafeAreaFrame() {
  return { x: 0, y: 0, width: 402, height: 874 };
}
