// LiquidGlassBadge — iOS-only implementation.
//
// Metro resolves this file ahead of `LiquidGlassBadge.tsx` on iOS, so
// `@expo/ui/swift-ui` (which calls `requireNativeViewManager` at module
// load and would crash a web build) never reaches the bundler on the
// other platforms. iOS 26+ gets a real SwiftUI Host + `glassEffect`
// modifier; earlier iOS falls through to the same GlassView fallback
// the default file uses.

import { Host, Text as SwiftText } from "@expo/ui/swift-ui";
import { glassEffect, padding } from "@expo/ui/swift-ui/modifiers";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Text, View } from "react-native";
import { soft, type Tone } from "./tokens";

const USE_SWIFTUI_GLASS = isLiquidGlassAvailable();

export function LiquidGlassBadge({
  label,
  tone = "accent",
}: {
  label: string;
  tone?: Tone;
}) {
  const palette = soft.tone[tone];

  if (USE_SWIFTUI_GLASS) {
    return (
      <Host matchContents>
        <SwiftText
          modifiers={[
            padding({ horizontal: 14, vertical: 8 }),
            glassEffect({
              glass: { variant: "regular", interactive: true, tint: palette.fg },
              shape: "capsule",
            }),
          ]}
        >
          {label}
        </SwiftText>
      </Host>
    );
  }

  return (
    <GlassView
      glassEffectStyle="regular"
      tintColor={palette.fg}
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
      }}
    >
      <View>
        <Text
          style={{
            fontFamily: soft.font.family,
            color: palette.fg,
            fontSize: 13,
            fontWeight: "700",
            letterSpacing: -0.1,
          }}
        >
          {label}
        </Text>
      </View>
    </GlassView>
  );
}
