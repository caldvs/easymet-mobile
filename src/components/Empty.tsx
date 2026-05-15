import { Text, View } from "react-native";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";

export function Empty({ title, hint }: { title: string; hint?: string }) {
  const colours = useTheme();
  return (
    <View style={{ paddingVertical: 60, paddingHorizontal: 30, alignItems: "center" }}>
      <Text
        style={{
          fontFamily: type.sansMedium,
                  fontWeight: "500",
          fontSize: 16,
          color: colours.fg,
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {hint && (
        <Text
          style={{
            fontFamily: type.sans,
            fontSize: 13,
            color: colours.fgMuted,
            textAlign: "center",
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}
