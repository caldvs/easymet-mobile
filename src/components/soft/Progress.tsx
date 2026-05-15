import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { soft, type Tone } from "./tokens";

// Linear progress bar. Determinate when `value` ∈ [0,1] is supplied;
// indeterminate (sliding shimmer) when `value === undefined`.

export function Progress({
  value,
  tone = "accent",
  height = 8,
}: {
  value?: number;
  tone?: Tone;
  height?: number;
}) {
  const palette = soft.tone[tone];
  const indeterminate = value === undefined;
  const determinate = useRef(new Animated.Value(value ?? 0)).current;
  const indet = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (indeterminate) return;
    Animated.timing(determinate, {
      toValue: Math.min(1, Math.max(0, value!)),
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, indeterminate, determinate]);

  useEffect(() => {
    if (!indeterminate) return;
    const loop = Animated.loop(
      Animated.timing(indet, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [indeterminate, indet]);

  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: soft.surfaceInset,
        overflow: "hidden",
        alignSelf: "stretch",
      }}
    >
      {indeterminate ? (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "40%",
            borderRadius: height / 2,
            backgroundColor: palette.fg,
            left: indet.interpolate({
              inputRange: [0, 1],
              outputRange: ["-40%", "100%"],
            }),
          }}
        />
      ) : (
        <Animated.View
          style={{
            height: "100%",
            borderRadius: height / 2,
            backgroundColor: palette.fg,
            width: determinate.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          }}
        />
      )}
    </View>
  );
}
