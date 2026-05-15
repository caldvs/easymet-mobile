import { useEffect, useRef } from "react";
import { Animated, Easing, View, type DimensionValue, type ViewStyle } from "react-native";
import { soft, useSoftTheme } from "./tokens";

// Loading placeholder. Animates a gentle opacity pulse between the canvas
// inset and a slightly lighter shade. Use `circle` for avatars, `rect` for
// rows/cards. Compose them inside a Card to mimic the real layout.

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [soft.surfaceInset, "#F5F5F8"],
          }),
        },
        style,
      ]}
    />
  );
}

// Quick composite — three lines of skeleton "text". Good default for a
// paragraph loading state.
export function SkeletonParagraph({ lines = 3 }: { lines?: number }) {
  return (
    <View style={{ gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? "60%" : "100%"}
          height={12}
          radius={6}
        />
      ))}
    </View>
  );
}
