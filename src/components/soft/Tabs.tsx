import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { soft, useSoftTheme } from "./tokens";

// Top-level navigation tabs. Visually different from SegmentedControl —
// no chassis fill, and the active tab gets an underline + accent label
// (the wide-page pattern, not the inline switch pattern). Use
// SegmentedControl for compact 2-4 way pickers; use Tabs for big section
// switchers.

export function Tabs<T extends string | number>({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  children,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value?: T;
  defaultValue?: T;
  onChange?: (next: T) => void;
  /** Optional render-prop body — gets the active value. */
  children?: (active: T) => ReactNode;
}) {
  const [internal, setInternal] = useState<T>(defaultValue ?? options[0]!.value);
  const value = controlledValue ?? internal;
  const setValue = (next: T) => {
    if (controlledValue == null) setInternal(next);
    onChange?.(next);
  };

  return (
    <View style={{ alignSelf: "stretch", gap: 16 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          borderBottomWidth: 1,
          borderBottomColor: soft.divider,
        }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => setValue(opt.value)}
              style={(state) => ({
                paddingHorizontal: 14,
                paddingVertical: 10,
                minHeight: minTouch,
                borderBottomWidth: 2,
                borderBottomColor: active ? soft.accent : "transparent",
                marginBottom: -1,
                ...pressFeedback(state),
              })}
            >
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: active ? soft.accent : soft.textMuted,
                  fontSize: 14,
                  fontWeight: active ? "700" : "500",
                  letterSpacing: -0.1,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {children && children(value)}
    </View>
  );
}
