import { Text, View } from "react-native";
import { Avatar, type AvatarSize } from "./Avatar";
import { soft } from "./tokens";

// Stacked overlapping avatars. Truncates at `max` and renders a "+N" tile
// for the remainder. Useful for "X people are on this thread" / channel
// member previews / shared-document headers.

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 20,
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

export function AvatarGroup({
  people,
  size = "md",
  max = 4,
}: {
  people: ReadonlyArray<{ name?: string; initials?: string; src?: string }>;
  size?: AvatarSize;
  max?: number;
}) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;
  const px = SIZE_MAP[size];
  // Overlap each avatar by ~30% of its width.
  const overlap = Math.round(px * 0.3);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {visible.map((p, i) => (
        <View
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -overlap,
            // White hairline so overlapping avatars read as separate tokens
            // instead of merging at the edges.
            borderRadius: px / 2 + 2,
            borderWidth: 2,
            borderColor: soft.surface,
          }}
        >
          <Avatar size={size} name={p.name} initials={p.initials} src={p.src} />
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={{
            marginLeft: -overlap,
            width: px,
            height: px,
            borderRadius: px / 2,
            backgroundColor: soft.surfaceInset,
            borderWidth: 2,
            borderColor: soft.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: soft.font.family,
              color: soft.textMuted,
              fontSize: px * 0.36,
              fontWeight: "700",
              letterSpacing: -0.4,
            }}
          >
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}
