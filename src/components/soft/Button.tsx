import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { useSoftTheme, type GradientKind, type Tone } from "./tokens";

// The universal button — the most-reached-for atom. Three visual variants
// (`solid` / `soft` / `outline` / `ghost`), three sizes, plus an `gradient`
// escape hatch for the AI/CTA buttons from the design (just pass
// `gradient="askAI"`). Inherits press feedback + minTouch from the kit
// primitives so it's mobile-safe by default.

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  tone?: Tone;
  /** Replaces the variant fill with a saturated gradient (Ask AI / Book a
   *  Call style). Ignored when `variant !== "solid"`. */
  gradient?: GradientKind;
  size?: ButtonSize;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

// The visible padding stays tight for `sm` (so the button reads as small),
// but `minHeight` is floored at `minTouch` (44pt on native) so the tap
// area still meets HIG. The visible chrome can be smaller than the hit
// area — RN supports that without a layout shift.
const SIZES: Record<ButtonSize, { padV: number; padH: number; font: number; minH: number }> = {
  sm: { padV: 7, padH: 14, font: 13, minH: 32 },
  md: { padV: 10, padH: 18, font: 14, minH: 40 },
  lg: { padV: 14, padH: 22, font: 16, minH: 48 },
};

export function Button({
  label,
  onPress,
  variant = "solid",
  tone = "accent",
  gradient,
  size = "md",
  leading,
  trailing,
  disabled,
  fullWidth,
  style,
}: Props) {
  const theme = useSoftTheme();
  const s = SIZES[size];
  const palette = theme.tone[tone];

  // Resolve foreground / background per variant.
  const isSolid = variant === "solid" && !gradient;
  const isGradient = variant === "solid" && !!gradient;
  const isSoft = variant === "soft";
  const isOutline = variant === "outline";

  const fgColor =
    isSolid || isGradient
      ? "#FFFFFF"
      : isSoft
      ? palette.fg
      : isOutline
      ? palette.fg
      : palette.fg;

  const layout: ViewStyle = {
    minHeight: Math.max(s.minH, minTouch),
    paddingHorizontal: s.padH,
    paddingVertical: s.padV,
    borderRadius: theme.radii.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: fullWidth ? "stretch" : "flex-start",
    opacity: disabled ? 0.4 : 1,
    ...(isSolid ? { backgroundColor: palette.bg, ...theme.shadow.pill } : null),
    ...(isSoft ? { backgroundColor: palette.tint } : null),
    ...(isOutline
      ? { backgroundColor: "transparent", borderWidth: 1.5, borderColor: palette.fg }
      : null),
    // ghost is intentionally just the label + leading/trailing.
  };

  const labelNode = (
    <Text
      style={{
        fontFamily: theme.font.family,
        color: fgColor,
        fontSize: s.font,
        fontWeight: "600",
        letterSpacing: -0.1,
      }}
    >
      {label}
    </Text>
  );

  if (isGradient) {
    const colors = theme.gradient[gradient!] as readonly string[];
    return (
      <Pressable
        onPress={disabled ? undefined : onPress}
        style={(state) => ({ ...style, ...(disabled ? {} : pressFeedback(state)) })}
      >
        <View
          style={{
            borderRadius: theme.radii.pill,
            shadowColor: colors[0],
            shadowOpacity: 0.4,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
            alignSelf: fullWidth ? "stretch" : "flex-start",
            opacity: disabled ? 0.4 : 1,
          }}
        >
          <LinearGradient
            colors={colors as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 1 }}
            style={layout}
          >
            {leading}
            {labelNode}
            {trailing}
          </LinearGradient>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={(state) => ({ ...layout, ...style, ...(disabled ? {} : pressFeedback(state)) })}
    >
      {leading}
      {labelNode}
      {trailing}
    </Pressable>
  );
}
