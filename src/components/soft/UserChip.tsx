import { Image, Pressable, Text, View } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { SoftIcon } from "./SoftIcon";
import { soft } from "./tokens";

// User pill from image 4 — avatar on the left, name in the middle, dismiss
// ✕ on the right. Same surface recipe as the rest of the soft kit.
export function UserChip({
  name,
  avatarUrl,
  initials,
  onDismiss,
}: {
  name: string;
  avatarUrl?: string;
  /** Fallback letters when no avatar URL is provided. */
  initials?: string;
  onDismiss?: () => void;
}) {
  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: soft.surface,
          borderRadius: soft.radii.pill,
          paddingLeft: 6,
          paddingRight: 12,
          paddingVertical: 6,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        soft.shadow.pill,
      ]}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: 28, height: 28, borderRadius: 14 }}
        />
      ) : (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: soft.canvasMuted,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: soft.font.family,
              color: soft.text,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {initials ?? name.slice(0, 1)}
          </Text>
        </View>
      )}
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 15,
          fontWeight: "600",
          letterSpacing: -0.2,
        }}
      >
        {name}
      </Text>
      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name}`}
          // Expand the touch area without bloating the visible chip — the
          // hit area extends `(minTouch - 16) / 2` in every direction.
          hitSlop={Math.max(8, (minTouch - 16) / 2)}
          style={(state) => ({
            padding: 2,
            borderRadius: 999,
            ...pressFeedback(state),
          })}
        >
          <SoftIcon name="close" size={14} color={soft.textFaint} />
        </Pressable>
      )}
    </View>
  );
}
