import { Text, View } from "react-native";
import { Button } from "./Button";
import { SoftIcon, type IconName } from "./SoftIcon";
import { soft, useSoftTheme } from "./tokens";

// "Nothing here" placeholder. Centred icon-in-soft-tile, title, supporting
// copy, optional CTA. The icon tile uses the inset surface so the empty
// state reads as quiet — not an error.

export function EmptyState({
  icon = "info",
  title,
  description,
  actionLabel,
  onActionPress,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 36,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          backgroundColor: soft.surfaceInset,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <SoftIcon name={icon} size={26} color={soft.textMuted} strokeWidth={1.75} />
      </View>
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 17,
          fontWeight: "700",
          textAlign: "center",
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontFamily: soft.font.family,
            color: soft.textMuted,
            fontSize: 14,
            fontWeight: "500",
            textAlign: "center",
            maxWidth: 360,
            lineHeight: 21,
          }}
        >
          {description}
        </Text>
      )}
      {actionLabel && (
        <View style={{ marginTop: 8 }}>
          <Button label={actionLabel} onPress={onActionPress} variant="soft" tone="accent" />
        </View>
      )}
    </View>
  );
}
