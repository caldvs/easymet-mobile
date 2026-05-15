import { Pressable, Text, View } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { SoftIcon, type IconName } from "./SoftIcon";
import { useSoftTheme, type Tone } from "./tokens";

// Persistent inline notification — for non-dismissable warnings, info
// strips, or page-level callouts. Tone-tinted background, matching icon
// on the left, dismiss ✕ on the right when `onDismiss` is supplied.

const DEFAULT_ICON: Record<Tone, IconName> = {
  neutral: "info",
  accent: "info",
  success: "check",
  warning: "warning",
  danger: "errorOctagon",
};

export function Banner({
  title,
  description,
  tone = "neutral",
  icon,
  action,
  onActionPress,
  onDismiss,
}: {
  title: string;
  description?: string;
  tone?: Tone;
  icon?: IconName;
  /** Inline text-link action ("Retry" / "Learn more"). */
  action?: string;
  onActionPress?: () => void;
  onDismiss?: () => void;
}) {
  const theme = useSoftTheme();
  const palette = theme.tone[tone];
  const iconName = icon ?? DEFAULT_ICON[tone];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        backgroundColor: palette.tint,
        borderRadius: theme.radii.card,
        paddingHorizontal: 14,
        paddingVertical: 12,
        alignSelf: "stretch",
      }}
    >
      <View style={{ paddingTop: 1 }}>
        <SoftIcon name={iconName} size={18} color={palette.fg} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, gap: description ? 2 : 0 }}>
        <Text
          style={{
            fontFamily: theme.font.family,
            color: palette.fg,
            fontSize: 14,
            fontWeight: "600",
            letterSpacing: -0.1,
          }}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={{
              fontFamily: theme.font.family,
              color: palette.fg,
              fontSize: 13,
              fontWeight: "500",
              opacity: 0.85,
            }}
          >
            {description}
          </Text>
        )}
        {action && (
          <Pressable
            onPress={onActionPress}
            hitSlop={6}
            style={(state) => ({ marginTop: 6, alignSelf: "flex-start", ...pressFeedback(state) })}
          >
            <Text
              style={{
                fontFamily: theme.font.family,
                color: palette.fg,
                fontSize: 13,
                fontWeight: "700",
                textDecorationLine: "underline",
              }}
            >
              {action}
            </Text>
          </Pressable>
        )}
      </View>
      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={`Dismiss: ${title}`}
          hitSlop={Math.max(8, (minTouch - 16) / 2)}
          style={(state) => ({ padding: 2, ...pressFeedback(state) })}
        >
          <SoftIcon name="close" size={14} color={palette.fg} />
        </Pressable>
      )}
    </View>
  );
}
