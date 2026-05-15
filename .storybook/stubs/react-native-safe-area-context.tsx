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

// Fake a Pro-class device bottom inset (34pt for the home indicator)
// so screens leave room for the floating tab bar overlay in Storybook.
// Top stays 0 — the storybook canvas isn't a status-bar surface.
export function useSafeAreaInsets() {
  return { top: 0, bottom: 34, left: 0, right: 0 };
}

export function useSafeAreaFrame() {
  return { x: 0, y: 0, width: 402, height: 874 };
}
