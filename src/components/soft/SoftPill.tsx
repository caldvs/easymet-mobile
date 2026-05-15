import { Pressable, View, type ViewStyle } from "react-native";
import { pressFeedback } from "./interaction";
import { soft } from "./tokens";

// The foundational capsule for the soft-UI kit. White surface, soft drop
// shadow, fully rounded by default. Everything else (gradient buttons,
// status badges, chips) is built on top.
export function SoftPill({
  children,
  onPress,
  variant = "surface",
  pressed = false,
  radius = soft.radii.pill,
  paddingHorizontal = 16,
  paddingVertical = 10,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  /** `surface` = standard white floating pill.
   *  `raised`  = the active/selected variant, lifted higher.
   *  `inset`   = subtle recessed grey, used as a track. */
  variant?: "surface" | "raised" | "inset";
  pressed?: boolean;
  radius?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: ViewStyle;
}) {
  const isInset = variant === "inset";
  const shadow = isInset
    ? null
    : variant === "raised" || pressed
    ? soft.shadow.raised
    : soft.shadow.pill;

  const baseStyle: ViewStyle = {
    backgroundColor: isInset ? soft.surfaceInset : soft.surface,
    borderRadius: radius,
    paddingHorizontal,
    paddingVertical,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...(shadow ?? {}),
    ...(style ?? {}),
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={(state) => ({ ...baseStyle, ...pressFeedback(state) })}>
        {children}
      </Pressable>
    );
  }
  return <View style={baseStyle}>{children}</View>;
}
