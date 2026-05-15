import { Pressable, Text, View } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { SoftIcon } from "./SoftIcon";
import { soft, useSoftTheme } from "./tokens";

// "Filter · 2 ✕" pill from image 4. Funnel glyph on the left, a count in
// the accent colour, then a hairline divider and a dismiss affordance.
// Pressing the pill itself fires `onPress` (e.g. open a popover of filter
// options); pressing the ✕ fires `onClear` and stops propagation.
export function FilterChip({
  label = "Filter",
  count,
  onPress,
  onClear,
}: {
  label?: string;
  count?: number;
  onPress?: () => void;
  onClear?: () => void;
}) {
  const content = (
    <>
      <SoftIcon name="filter" size={16} color={soft.text} />
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 15,
          fontWeight: "600",
          letterSpacing: -0.1,
        }}
      >
        {label}
      </Text>
      {count != null && (
        <>
          <Text
            style={{ color: soft.textFaint, fontSize: 13, marginHorizontal: 1 }}
          >
            ·
          </Text>
          <Text
            style={{
              fontFamily: soft.font.family,
              color: soft.accent,
              fontSize: 15,
              fontWeight: "700",
            }}
          >
            {count}
          </Text>
        </>
      )}
      {onClear && (
        <>
          <View
            style={{
              width: 1,
              height: 14,
              backgroundColor: soft.divider,
              marginLeft: 4,
            }}
          />
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label} filter`}
            hitSlop={Math.max(8, (minTouch - 16) / 2)}
            style={(state) => ({
              padding: 2,
              borderRadius: 999,
              ...pressFeedback(state),
            })}
          >
            <SoftIcon name="close" size={14} color={soft.textFaint} />
          </Pressable>
        </>
      )}
    </>
  );

  const layout = {
    alignSelf: "flex-start" as const,
    backgroundColor: soft.surface,
    borderRadius: soft.radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    ...soft.shadow.pill,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={(state) => ({ ...layout, ...pressFeedback(state) })}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={layout}>{content}</View>;
}
