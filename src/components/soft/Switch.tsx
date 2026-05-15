import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { useReduceMotion } from "./interaction";
import { soft } from "./tokens";

// Animated boolean toggle. Uncontrolled by default — pass `value` /
// `onChange` to control externally, or just rely on internal state. Track
// uses an accent fill when on, neutral inset when off. Thumb animates left
// ↔ right over 180ms with a subtle ease.

export function Switch({
  value: controlledValue,
  defaultValue = false,
  onChange,
  disabled = false,
}: {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;

  // Track ↔ thumb sizing — kept here so a future Switch.lg/Switch.sm
  // variant can override one place.
  const TRACK_W = 48;
  const TRACK_H = 28;
  const PAD = 3;
  const THUMB = TRACK_H - PAD * 2;
  const TRAVEL = TRACK_W - THUMB - PAD * 2;

  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const reduceMotion = useReduceMotion();
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: reduceMotion ? 0 : 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, anim, reduceMotion]);

  const toggle = () => {
    if (disabled) return;
    const next = !value;
    if (controlledValue == null) setInternal(next);
    onChange?.(next);
  };

  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      // Track itself is already 28pt tall + a generous touch target via
      // hitSlop so the thumb is comfortably reachable on mobile.
      hitSlop={8}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          padding: PAD,
          backgroundColor: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [soft.surfaceInset, soft.accent],
          }),
        }}
      >
        <Animated.View
          style={{
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            backgroundColor: soft.surface,
            transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] }) }],
            ...soft.shadow.pill,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
