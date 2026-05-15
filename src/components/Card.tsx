import { type ViewStyle, View } from "react-native";
import { useTheme } from "../lib/TweaksContext";
import { radii } from "../lib/theme";

// iOS inset-grouped card. White surface on the grouped grey canvas, with a
// very faint shadow for lift — same recipe used by Apple Maps' "Place" and
// "Routes" sections. `accent` adds a thin coloured left edge for status.
export function Card({
  children,
  style,
  radius = radii.card,
  accent,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  radius?: number;
  accent?: string;
  intensity?: number; // back-compat shim — ignored
  tint?: "default" | "chrome"; // back-compat shim — ignored
}) {
  const colours = useTheme();
  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: colours.surface,
          // Subtle elevation. Higher than zero so the card reads as a
          // discrete surface against the grey canvas; lower than the old
          // glass-card recipe so it doesn't feel theatrical.
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        },
        style,
      ]}
    >
      {accent && (
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: accent,
          }}
        />
      )}
      {children}
    </View>
  );
}
