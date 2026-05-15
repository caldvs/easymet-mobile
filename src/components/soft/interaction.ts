import { Platform, type PressableStateCallbackType, type ViewStyle } from "react-native";

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
