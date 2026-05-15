// Stub of expo-blur for Storybook (Vite can't process the native source).
// Renders a translucent white View — close enough for static component previews.

import type { ViewStyle } from "react-native";
import { View } from "react-native";

export function BlurView({
  children,
  style,
  intensity = 50,
  tint = "light",
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: "light" | "dark" | "default";
}) {
  // Map intensity 0..100 to alpha; tint switches background.
  const a = Math.min(1, intensity / 100) * 0.7;
  const bg =
    tint === "dark" ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`;
  return (
    <View
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={[{ backgroundColor: bg, backdropFilter: `blur(${intensity / 3}px) saturate(180%)` } as any, style]}
    >
      {children}
    </View>
  );
}
