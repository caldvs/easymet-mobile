import { Pressable, Text, View } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { SoftIcon, type IconName } from "./SoftIcon";
import { soft } from "./tokens";

// Generic segmented control. Each option can be a text label, an icon, or
// both. Selected segment lifts on a raised white surface — matches the
// "active B" treatment from the original toolbar but works for tabs and
// any other 2-5 way switch.

export type SegmentOption<T> = {
  value: T;
  label?: string;
  icon?: IconName;
};

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  fullWidth,
}: {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange?: (next: T) => void;
  fullWidth?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: soft.surfaceInset,
        borderRadius: soft.radii.pill,
        padding: 4,
        gap: 2,
        alignSelf: fullWidth ? "stretch" : "flex-start",
      }}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={i}
            onPress={() => onChange?.(opt.value)}
            style={(state) => ({
              flex: fullWidth ? 1 : undefined,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              minHeight: minTouch - 8,
              borderRadius: soft.radii.pill,
              ...(active
                ? { backgroundColor: soft.surface, ...soft.shadow.raised }
                : null),
              ...pressFeedback(state),
            })}
          >
            {opt.icon && (
              <SoftIcon
                name={opt.icon}
                size={16}
                color={active ? soft.text : soft.textMuted}
              />
            )}
            {opt.label && (
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: active ? soft.text : soft.textMuted,
                  fontSize: 14,
                  fontWeight: active ? "600" : "500",
                  letterSpacing: -0.1,
                }}
              >
                {opt.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
