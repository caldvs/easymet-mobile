import { Children, Fragment, type ReactNode } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { SoftIcon, type IconName } from "./SoftIcon";
import { soft } from "./tokens";

// One row in a list. Leading slot (icon / avatar), title + subtitle stack,
// trailing slot (chevron / value / control). When `onPress` is set it
// auto-adds a chevron in the trailing slot to communicate "tap to drill".
//
// Group rows with `ListRowGroup` to get the inset-grouped iOS look —
// rounded outer surface, hairline dividers between rows.

export function ListRow({
  title,
  subtitle,
  leadingIcon,
  leading,
  trailing,
  onPress,
  showChevron,
}: {
  title: string;
  subtitle?: string;
  leadingIcon?: IconName;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  /** Defaults to true when `onPress` is set. */
  showChevron?: boolean;
}) {
  const chev = (showChevron ?? !!onPress) && !trailing;

  const content = (
    <>
      {leading ?? (leadingIcon && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: soft.surfaceInset,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SoftIcon name={leadingIcon} size={16} color={soft.text} />
        </View>
      ))}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: soft.font.family,
            color: soft.text,
            fontSize: 15,
            fontWeight: "600",
            letterSpacing: -0.1,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: soft.font.family,
              color: soft.textMuted,
              fontSize: 13,
              fontWeight: "500",
              marginTop: 1,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
      {chev && <SoftIcon name="chevronRight" size={16} color={soft.textFaint} strokeWidth={2} />}
    </>
  );

  const layout: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: minTouch,
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={(state) => ({ ...layout, ...pressFeedback(state) })}>
        {content}
      </Pressable>
    );
  }
  return <View style={layout}>{content}</View>;
}

// Container that groups rows into a single white card with hairline
// separators between them — the iOS "inset grouped" pattern.
export function ListRowGroup({ children }: { children: ReactNode }) {
  const kids = Children.toArray(children).filter(Boolean);
  return (
    <View
      style={[
        {
          backgroundColor: soft.surface,
          borderRadius: soft.radii.card,
          overflow: "hidden",
          alignSelf: "stretch",
        },
        soft.shadow.pill,
      ]}
    >
      {kids.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <View
              style={{
                height: 1,
                backgroundColor: soft.divider,
                marginLeft: 58, // align with title text, leaving the leading icon column clean
              }}
            />
          )}
          {c}
        </Fragment>
      ))}
    </View>
  );
}
