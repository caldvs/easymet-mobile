// LiquidGlassBadge — default (web + Android) implementation.
//
// `@expo/ui/swift-ui` calls `requireNativeViewManager` at module load
// time, which throws on web because that bridge doesn't exist. Importing
// it statically here would crash the entire Web build before any code
// runs. Metro's platform-specific resolution gives us
// `LiquidGlassBadge.ios.tsx` for iOS (the real SwiftUI Host +
// glassEffect path); web and Android land here on the GlassView
// fallback, which itself degrades to a translucent View on non-iOS.

import { GlassView } from "expo-glass-effect";
import { Text, View } from "react-native";
import { soft, type Tone } from "./tokens";

export function LiquidGlassBadge({
  label,
  tone = "accent",
}: {
  label: string;
  tone?: Tone;
}) {
  const palette = soft.tone[tone];
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
