import { Image, Text, View, type ViewStyle } from "react-native";
import { SoftIcon } from "./SoftIcon";
import { soft } from "./tokens";

// Standalone avatar. Renders the image when `src` is given, otherwise
// `initials` (preferred), otherwise a generic person glyph. Sizes follow
// a small scale (xs/sm/md/lg/xl) — pass a custom `size` to escape it.
//
// Status dots: pass `status` to overlay a coloured dot bottom-right (the
// "online / busy / offline" affordance used in chat/collab tools).

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

const STATUS_COLOURS = {
  online: soft.status.online.fg,
  busy: soft.tone.danger.fg,
  away: soft.tone.warning.fg,
  offline: soft.textFaint,
} as const;
export type AvatarStatus = keyof typeof STATUS_COLOURS;

export function Avatar({
  src,
  initials,
  name,
  size = "md",
  status,
  style,
}: {
  src?: string;
  initials?: string;
  /** Used to derive initials when `initials` isn't supplied. */
  name?: string;
  size?: AvatarSize | number;
  status?: AvatarStatus;
  style?: ViewStyle;
}) {
  const px = typeof size === "number" ? size : SIZES[size];
  const initialsText =
    initials ??
    (name
      ? name
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "");

  return (
    <View style={[{ width: px, height: px }, style]}>
      <View
        style={{
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: soft.surfaceInset,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {src ? (
          <Image source={{ uri: src }} style={{ width: px, height: px }} />
        ) : initialsText ? (
          <Text
            style={{
              fontFamily: soft.font.family,
              color: soft.text,
              fontSize: px * 0.4,
              fontWeight: "600",
              letterSpacing: -0.4,
            }}
          >
            {initialsText}
          </Text>
        ) : (
          <SoftIcon name="personFill" size={px * 0.6} color={soft.textMuted} />
        )}
      </View>
      {status && (
        <View
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: Math.max(8, px * 0.28),
            height: Math.max(8, px * 0.28),
            borderRadius: 999,
            backgroundColor: STATUS_COLOURS[status],
            borderWidth: 2,
            borderColor: soft.surface,
          }}
        />
      )}
    </View>
  );
}
