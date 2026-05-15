import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { pressFeedback } from "./interaction";
import { soft, useSoftTheme, type GradientKind } from "./tokens";

// Saturated capsule button — used for AI / primary CTAs (Ask AI, Book a
// Call). White text, ~120° gradient, glow shadow tinted from the gradient
// itself so it sits a little brighter than a normal soft pill.
export function GradientButton({
  label,
  leading,
  trailing,
  gradient = "askAI",
  onPress,
  size = "md",
  style,
}: {
  label: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  gradient?: GradientKind;
  onPress?: () => void;
  size?: "sm" | "md";
  style?: ViewStyle;
}) {
  const colors = soft.gradient[gradient] as readonly string[];
  // Tint the glow with the gradient's first stop so the lift feels coloured
  // (cf. the pink halo under "Ask AI" in image 4).
  const glow = colors[0];
  const padV = size === "sm" ? 8 : 11;
  const padH = size === "sm" ? 14 : 18;

  return (
    <Pressable
      onPress={onPress}
      style={(state) => ({ ...(style ?? {}), ...pressFeedback(state) })}
    >
      <View
        style={{
          borderRadius: soft.radii.pill,
          shadowColor: glow,
          shadowOpacity: 0.45,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={colors as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: soft.radii.pill,
            paddingHorizontal: padH,
            paddingVertical: padV,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {leading}
          <Text
            style={{
              fontFamily: soft.font.family,
              color: "#FFFFFF",
              fontSize: size === "sm" ? 13 : 14,
              fontWeight: "600",
              letterSpacing: -0.1,
            }}
          >
            {label}
          </Text>
          {trailing}
        </LinearGradient>
      </View>
    </Pressable>
  );
}

// Small ✦ sparkle glyph for the leading slot of AI buttons. Stored as text
// so we don't need an icon font wired into Storybook.
export function Sparkles({ color = "#FFFFFF", size = 14 }: { color?: string; size?: number }) {
  return (
    <Text
      style={{
        color,
        fontSize: size,
        fontWeight: "700",
        lineHeight: size + 2,
      }}
    >
      ✦
    </Text>
  );
}
