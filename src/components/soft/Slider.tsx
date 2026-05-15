import { useRef, useState } from "react";
import { Animated, PanResponder, View } from "react-native";
import { minTouch } from "./interaction";
import { soft } from "./tokens";

// Single-value slider. PanResponder-based so it works on web + native
// without a third-party library. The thumb is a white circle with the
// standard pill shadow; the filled portion of the track uses the accent.

export function Slider({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  width = 280,
}: {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (next: number) => void;
  width?: number;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlledValue ?? internal;

  const trackHeight = 6;
  const thumbSize = Math.max(20, minTouch * 0.5);
  const inner = width - thumbSize;

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => Math.round(v / step) * step;

  const setFromX = (x: number) => {
    const pct = Math.min(1, Math.max(0, x / inner));
    const raw = min + pct * (max - min);
    const next = clamp(snap(raw));
    if (next === value) return;
    if (controlledValue == null) setInternal(next);
    onChange?.(next);
  };

  const startXRef = useRef(0);
  const startValRef = useRef(value);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, g) => {
        startXRef.current = g.x0;
        startValRef.current = value;
      },
      onPanResponderMove: (_, g) => {
        const startPct = (startValRef.current - min) / (max - min);
        const startX = startPct * inner;
        setFromX(startX + g.dx);
      },
    }),
  ).current;

  // Refresh the start ref every render so the responder reads the right value.
  startValRef.current = value;

  const pct = (value - min) / (max - min);
  const thumbX = pct * inner;

  return (
    <View
      {...pan.panHandlers}
      style={{
        width,
        height: minTouch,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          height: trackHeight,
          borderRadius: trackHeight / 2,
          backgroundColor: soft.surfaceInset,
          marginHorizontal: thumbSize / 2,
        }}
      >
        <View
          style={{
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: soft.accent,
            width: pct * inner,
          }}
        />
      </View>
      <Animated.View
        style={{
          position: "absolute",
          left: thumbX,
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          backgroundColor: soft.surface,
          borderWidth: 1,
          borderColor: soft.divider,
          ...soft.shadow.pill,
        }}
      />
    </View>
  );
}
