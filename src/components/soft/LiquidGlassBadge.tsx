// LiquidGlassBadge — a small floating badge that renders through Apple's
// SwiftUI glassEffect modifier on iOS 26+, with two graceful fallbacks:
//   1. iOS pre-26 / interactive native UIVisualEffectView → expo-glass-effect's GlassView
//   2. Web / Android → expo-blur's BlurView
//
// The point of this component is to demonstrate the Expo blog's
// recommended pattern — host a SwiftUI view tree inside React Native and
// apply the official Liquid Glass modifier to it. Hosting through
// `<Host matchContents>` means the badge sizes to its SwiftUI content
// (Text), and the glass material wraps the same content natively.

import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Host, Text as SwiftText } from "@expo/ui/swift-ui";
import { glassEffect, padding } from "@expo/ui/swift-ui/modifiers";
import { Platform, Text, View } from "react-native";
import { soft, type Tone } from "./tokens";

// Liquid Glass via @expo/ui (SwiftUI host) requires iOS 26+. We only
// reach for it on iOS — Android always goes through the fallback.
const USE_SWIFTUI_GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();

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

  // Non-iOS-26 path — the same visual using the existing soft-kit
  // primitives. GlassView falls through to a translucent View on web,
  // so this branch is what Storybook screenshots will render.
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
