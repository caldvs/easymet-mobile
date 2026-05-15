import { Pressable, Text, View, type ViewStyle } from "react-native";
import { pressFeedback } from "./interaction";
import { SoftIcon, type IconName } from "./SoftIcon";
import { soft, type Tone } from "./tokens";

// Lightweight content pill — smaller and quieter than SoftPill / Button.
// Meant for inline metadata: ETAs, counts, tags, labels next to text.
// Two visual variants:
//   * `tint`  — tonal background fill (the default, for status/category)
//   * `outline` — hairline border, transparent background
// Both can carry a leading icon and an optional `onPress` for tappable
// chips.

export function Pill({
  label,
  leadingIcon,
  tone = "neutral",
  variant = "tint",
  onPress,
  style,
}: {
  label: string;
  leadingIcon?: IconName;
  tone?: Tone;
  variant?: "tint" | "outline";
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const palette = soft.tone[tone];
  const layout: ViewStyle = {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: soft.radii.pill,
    backgroundColor: variant === "tint" ? palette.tint : "transparent",
    borderWidth: variant === "outline" ? 1 : 0,
    borderColor: palette.fg,
  };

  const content = (
    <>
      {leadingIcon && <SoftIcon name={leadingIcon} size={11} color={palette.fg} strokeWidth={2} />}
      <Text
        style={{
          fontFamily: soft.font.family,
          color: palette.fg,
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: -0.05,
        }}
      >
        {label}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={(state) => ({ ...layout, ...style, ...pressFeedback(state) })}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[layout, style]}>{content}</View>;
}
