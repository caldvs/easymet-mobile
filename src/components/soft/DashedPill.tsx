import { Pressable, Text } from "react-native";
import { pressFeedback } from "./interaction";
import { soft, useSoftTheme } from "./tokens";

// The "Upload" affordance from image 4 — a transparent pill with a dashed
// outline. Reads as "drop target / optional / not-yet-filled" in the soft
// vocabulary.
export function DashedPill({
  label,
  leading,
  onPress,
}: {
  label: string;
  leading?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={(state) => ({
        alignSelf: "flex-start",
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: soft.radii.pill,
        borderWidth: 1.5,
        borderColor: state.pressed ? soft.text : soft.textFaint,
        borderStyle: "dashed",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        ...pressFeedback(state),
      })}
    >
      {leading}
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 16,
          fontWeight: "500",
          letterSpacing: -0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
