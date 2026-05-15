import { Pressable, Text, View, type ViewStyle } from "react-native";
import { pressFeedback } from "./interaction";
import { SoftIcon, type IconName } from "./SoftIcon";
import { soft } from "./tokens";

// Rectangular content container. Distinct from SoftPill (which is a
// capsule meant for chips/buttons) — Card is for "this is a chunk of
// content". Convenience header slot accepts `title` + optional `subtitle`,
// `leadingIcon`, and a `headerTrailing` slot for buttons/menus.

export function SoftCard({
  children,
  onPress,
  style,
  padding = 16,
  title,
  subtitle,
  leadingIcon,
  headerTrailing,
}: {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  title?: string;
  subtitle?: string;
  leadingIcon?: IconName;
  headerTrailing?: React.ReactNode;
}) {
  const body = (
    <>
      {(title || subtitle || leadingIcon || headerTrailing) && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: children ? 12 : 0,
          }}
        >
          {leadingIcon && (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: soft.surfaceInset,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SoftIcon name={leadingIcon} size={18} color={soft.text} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            {title && (
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.text,
                  fontSize: 17,
                  fontWeight: "600",
                  letterSpacing: -0.2,
                }}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.textMuted,
                  fontSize: 13,
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {headerTrailing}
        </View>
      )}
      {children}
    </>
  );

  const layout: ViewStyle = {
    backgroundColor: soft.surface,
    borderRadius: soft.radii.card,
    padding,
    ...soft.shadow.pill,
    ...(style ?? {}),
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={(state) => ({ ...layout, ...pressFeedback(state) })}>
        {body}
      </Pressable>
    );
  }
  return <View style={layout}>{body}</View>;
}
