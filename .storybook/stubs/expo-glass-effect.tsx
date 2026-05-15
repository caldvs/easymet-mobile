// Stub of expo-glass-effect for Storybook. The real package wraps
// UIVisualEffectView (iOS 26+) through a native module that Vite can't
// process. On web/Storybook we render a translucent View that
// approximates the visual: tinted white with a CSS backdrop filter for
// the blur. `isLiquidGlassAvailable()` returns false so callers fall
// back to their non-glass recipe.

import { View, type ViewProps } from "react-native";

export interface GlassEffectStyleConfig {
  style: "clear" | "regular" | "none";
  animate?: boolean;
  animationDuration?: number;
}

interface GlassViewProps extends ViewProps {
  glassEffectStyle?: "clear" | "regular" | "none" | GlassEffectStyleConfig;
  colorScheme?: "auto" | "light" | "dark";
  tintColor?: string;
  isInteractive?: boolean;
}

export function GlassView({ tintColor, style, ...rest }: GlassViewProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: tintColor ? `${tintColor}26` : "rgba(255,255,255,0.55)",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          backdropFilter: "blur(24px) saturate(180%)" as any,
        },
        style,
      ]}
    />
  );
}

export function GlassContainer({ style, ...rest }: ViewProps & { spacing?: number }) {
  return <View {...rest} style={style} />;
}

// Storybook is web — Liquid Glass isn't available, so callers fall back.
export function isLiquidGlassAvailable() {
  return false;
}
export function isGlassEffectAPIAvailable() {
  return false;
}
