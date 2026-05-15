import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  PixelRatio,
  type PressableStateCallbackType,
  type ViewStyle,
} from "react-native";

// Minimum touch-target size. iOS HIG says 44pt, Material says 48dp. We use
// 44 on touch platforms (also makes the icon-sized hit areas reachable
// reliably with a finger) and a tighter 28 on web/desktop where cursor
// precision is higher and crowding from full touch targets looks weird.
export const minTouch = Platform.OS === "web" ? 28 : 44;

// Shared press-state styling for all soft-UI Pressable atoms. Pass to
// Pressable's `style` prop:
//   <Pressable style={pressFeedback}>...
// The default recipe is a tiny scale-down + opacity dip — enough to feel
// responsive without overshooting the kit's quiet aesthetic.
export const pressFeedback = (
  state: PressableStateCallbackType,
): ViewStyle => ({
  opacity: state.pressed ? 0.85 : 1,
  transform: [{ scale: state.pressed ? 0.97 : 1 }],
});

// Variant that composes the press recipe with caller-supplied base styles.
//   <Pressable style={withPressFeedback(myBaseStyle)}>...
export function withPressFeedback(
  base: ViewStyle | ((s: PressableStateCallbackType) => ViewStyle),
) {
  return (state: PressableStateCallbackType): ViewStyle => {
    const resolved = typeof base === "function" ? base(state) : base;
    return { ...resolved, ...pressFeedback(state) };
  };
}

// ---- Dynamic Type ----------------------------------------------------
// `PixelRatio.getFontScale()` returns the user's system text-size preference
// as a multiplier (1.0 = default, ~1.5–2.0 = accessibility sizes). We clamp
// the upper bound so the kit doesn't blow layouts at the very largest
// accessibility setting (Apple recommends supporting Dynamic Type up to a
// reasonable max — kit chrome shouldn't grow 3× alongside body text).
//
// Use:
//   const scale = useFontScale();
//   <Text style={{ fontSize: 14 * scale }}>…</Text>
//
// Or the helper:
//   <Text style={{ fontSize: scaled(14) }}>…</Text>
export function useFontScale({ max = 1.4 }: { max?: number } = {}) {
  // PixelRatio.getFontScale() is reactive on iOS — re-renders on change.
  // On other platforms it's a static-on-mount read which is fine for
  // session-scope.
  return Math.min(max, PixelRatio.getFontScale());
}

// Helper for one-off callers that want to scale a single size without
// holding the hook value. Reads the scale at call time.
export function scaled(size: number, { max = 1.4 }: { max?: number } = {}) {
  return Math.round(size * Math.min(max, PixelRatio.getFontScale()));
}

// ---- Reduce Motion ---------------------------------------------------
// Subscribes to the OS Reduce Motion preference. Components animating
// position / scale / blur should gate their animations on this:
//   const reduceMotion = useReduceMotion();
//   Animated.timing(value, {
//     toValue: 1,
//     duration: reduceMotion ? 0 : 280,
//     useNativeDriver: true,
//   }).start();
// Returns `false` on initial mount and updates once the subscription
// resolves — components should read it on every render.
export function useReduceMotion(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (!cancelled) setEnabled(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setEnabled,
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
  return enabled;
}
