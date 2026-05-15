import { Text, View } from "react-native";
import { soft } from "./tokens";

// The "Bold: ⌘ + B" keyboard-hint pill that floats above the toolbar in
// images 1 and 3. Same surface recipe as SoftPill but tighter padding and
// muted body text.
export function Tooltip({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: soft.surface,
          borderRadius: soft.radii.pill,
          paddingHorizontal: 12,
          paddingVertical: 6,
        },
        soft.shadow.pill,
      ]}
    >
      <Text
        style={{
          fontFamily: soft.font.family,
          fontSize: 13,
          color: soft.textMuted,
          fontWeight: "500",
        }}
      >
        {children}
      </Text>
    </View>
  );
}
