import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { soft } from "./tokens";

// Indeterminate loading spinner. SVG-free implementation — uses a single
// rotating ring with a 75% arc cut out (faked via a notch overlay). Cheap,
// crisp, and works on web/native with the same animation driver.

export function Spinner({
  size = 20,
  color = soft.accent,
  thickness = 2,
}: {
  size?: number;
  color?: string;
  thickness?: number;
}) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rot]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }],
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: thickness,
          borderColor: color,
          borderTopColor: "transparent",
          borderRightColor: "transparent",
        }}
      />
    </Animated.View>
  );
}
