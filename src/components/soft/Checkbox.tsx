import { useState } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";
import { minTouch, pressFeedback } from "./interaction";
import { SoftIcon } from "./SoftIcon";
import { soft, useSoftTheme } from "./tokens";

// Soft-UI checkbox: 22pt rounded square. Idle = thin border on canvas;
// checked = accent fill + white tick. Tap target expands to ≥minTouch via
// a wider Pressable. Accepts an inline label that's also part of the
// touch target.
export function Checkbox({
  value: controlledValue,
  defaultValue = false,
  onChange,
  label,
  disabled = false,
}: {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;
  const toggle = () => {
    if (disabled) return;
    const next = !value;
    if (controlledValue == null) setInternal(next);
    onChange?.(next);
  };

  const box: ViewStyle = {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: value ? 0 : 1.5,
    borderColor: soft.divider,
    backgroundColor: value ? soft.accent : "transparent",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      style={(state) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        // Pad vertically so the row itself meets minTouch even when the
        // label fits in a single line.
        minHeight: minTouch,
        opacity: disabled ? 0.4 : 1,
        ...pressFeedback(state),
      })}
    >
      <View style={box}>
        {/* 12pt check inside a 22pt box leaves a clear 1pt border of
            tint visible around the glyph — more breathing room than
            the previous 14pt fit. */}
        {value && <SoftIcon name="check" size={12} color="#FFFFFF" strokeWidth={2.5} />}
      </View>
      {label && (
        <Text
          style={{
            fontFamily: soft.font.family,
            color: soft.text,
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
