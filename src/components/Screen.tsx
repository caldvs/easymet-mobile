import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../lib/TweaksContext";

// Standard screen container for pushed/modal routes. Renders an opaque
// canvas so the previous screen doesn't bleed through during the native
// push/modal slide. Tab screens use the shared canvas in app/_layout.tsx.
export function Screen({ children }: { children: React.ReactNode }) {
  const colours = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colours.bg }}>
      <View style={{ flex: 1, paddingTop: insets.top }}>{children}</View>
    </View>
  );
}
