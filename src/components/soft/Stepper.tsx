import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { SoftIcon } from "./SoftIcon";
import { soft } from "./tokens";

// "30 mins ⇅" pill from image 4. Bold value, muted unit suffix, then a
// stacked-chevrons control on the right. Uncontrolled by default — pass
// `value` + `onChange` to control it, or just `defaultValue` to let the
// component manage state internally. Bounded by `min`/`max`/`step`.
export function Stepper({
  value: controlledValue,
  defaultValue = 0,
  unit,
  step = 1,
  min = -Infinity,
  max = Infinity,
  onChange,
}: {
  value?: number;
  defaultValue?: number;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  onChange?: (next: number) => void;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;

  const bump = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    if (controlledValue == null) setInternal(next);
    onChange?.(next);
  };

  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: soft.surface,
          borderRadius: soft.radii.pill,
          paddingLeft: 18,
          paddingRight: 8,
          paddingVertical: 9,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        },
        soft.shadow.pill,
      ]}
    >
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 17,
          fontWeight: "700",
          letterSpacing: -0.3,
        }}
      >
        {value}
      </Text>
      {unit && (
        <Text
          style={{
            fontFamily: soft.font.family,
            color: soft.textMuted,
            fontSize: 17,
            fontWeight: "500",
            letterSpacing: -0.3,
          }}
        >
          {unit}
        </Text>
      )}
      {/* On native we render two large square buttons (each = minTouch) so
         every chevron is a comfortable thumb target. On web we keep the
         compact stacked-chevrons recipe from the design. */}
      {Platform.OS === "web" ? (
        <View style={{ marginLeft: 2, alignItems: "center" }}>
          <Pressable
            onPress={() => bump(step)}
            hitSlop={8}
            style={(state) => ({ paddingHorizontal: 4, paddingVertical: 2, ...pressFeedback(state) })}
          >
            <SoftIcon name="chevronUp" size={14} color={soft.textMuted} strokeWidth={2} />
          </Pressable>
          <Pressable
            onPress={() => bump(-step)}
            hitSlop={8}
            style={(state) => ({
              paddingHorizontal: 4,
              paddingVertical: 2,
              marginTop: -4,
              ...pressFeedback(state),
            })}
          >
            <SoftIcon name="chevronDown" size={14} color={soft.textMuted} strokeWidth={2} />
          </Pressable>
        </View>
      ) : (
        <View style={{ flexDirection: "row", marginLeft: 4, gap: 4 }}>
          <Pressable
            onPress={() => bump(-step)}
            style={(state) => ({
              width: minTouch,
              height: minTouch,
              borderRadius: minTouch / 2,
              backgroundColor: soft.surfaceInset,
              alignItems: "center",
              justifyContent: "center",
              ...pressFeedback(state),
            })}
          >
            <SoftIcon name="chevronDown" size={18} color={soft.text} strokeWidth={2} />
          </Pressable>
          <Pressable
            onPress={() => bump(step)}
            style={(state) => ({
              width: minTouch,
              height: minTouch,
              borderRadius: minTouch / 2,
              backgroundColor: soft.surfaceInset,
              alignItems: "center",
              justifyContent: "center",
              ...pressFeedback(state),
            })}
          >
            <SoftIcon name="chevronUp" size={18} color={soft.text} strokeWidth={2} />
          </Pressable>
        </View>
      )}
    </View>
  );
}
