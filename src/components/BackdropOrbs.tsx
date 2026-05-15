import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { useReduceMotion } from "./soft/interaction";

// Subtle pastel orbs behind the grouped canvas. Each orb breathes slowly
// in a sinusoidal drift, offset from the others in period and phase so
// they never line up — the canvas always looks alive but never busy.
// Movement is small (12-22pt) and slow (22-30s per cycle) so it reads
// as ambient, not animated.

interface OrbDef {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  size: number;
  colour: string;
  opacity: number;
  driftX: number;
  driftY: number;
  periodMs: number;
  delayMs: number;
}

const ORBS: OrbDef[] = [
  { top: -120, left: -120, size: 420, colour: "#0A84FF", opacity: 0.28, driftX: 22, driftY: 14, periodMs: 24000, delayMs: 0 },
  { top: 80, right: -140, size: 360, colour: "#34C759", opacity: 0.24, driftX: -18, driftY: 16, periodMs: 28000, delayMs: 4000 },
  { top: "42%", left: -100, size: 320, colour: "#5E5CE6", opacity: 0.22, driftX: 16, driftY: -14, periodMs: 22000, delayMs: 8000 },
  { bottom: -100, right: -80, size: 300, colour: "#E94B8A", opacity: 0.20, driftX: -14, driftY: -12, periodMs: 30000, delayMs: 12000 },
];

export function BackdropOrbs() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      {ORBS.map((o, i) => (
        <Orb key={i} {...o} />
      ))}
    </View>
  );
}

function Orb({
  colour,
  size,
  opacity,
  driftX,
  driftY,
  periodMs,
  delayMs,
  ...pos
}: OrbDef) {
  const a = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    // Honour the OS Reduce Motion preference — the orbs are
    // decorative-only, so freezing them at their starting position is
    // the right behaviour (no static-mount frame to worry about).
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, {
          toValue: 1,
          duration: periodMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(a, {
          toValue: 0,
          duration: periodMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    // Stagger each orb's start so they're never in phase. The first orb
    // begins immediately to avoid a static-on-mount frame.
    const timer = delayMs > 0 ? setTimeout(() => loop.start(), delayMs) : null;
    if (delayMs === 0) loop.start();
    return () => {
      if (timer) clearTimeout(timer);
      loop.stop();
    };
  }, [a, periodMs, delayMs, reduceMotion]);

  const translateX = a.interpolate({
    inputRange: [0, 1],
    outputRange: [-driftX, driftX],
  });
  const translateY = a.interpolate({
    inputRange: [0, 1],
    outputRange: [-driftY, driftY],
  });

  if (Platform.OS === "web") {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity,
            transform: [{ translateX }, { translateY }],
          },
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            backgroundImage: `radial-gradient(circle, ${colour}cc 0%, ${colour}66 35%, ${colour}00 75%)`,
            filter: "blur(30px)",
          } as never,
          pos as never,
        ]}
      />
    );
  }

  const id = `orb-${colour.replace("#", "")}-${size}`;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
        pos as never,
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colour} stopOpacity="0.6" />
            <Stop offset="35%" stopColor={colour} stopOpacity="0.32" />
            <Stop offset="65%" stopColor={colour} stopOpacity="0.12" />
            <Stop offset="100%" stopColor={colour} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}
