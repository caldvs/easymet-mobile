import { Text, View } from "react-native";
import { soft } from "./tokens";

// Tonal live-state badge (image 4): a tint-filled capsule with a leading
// indicator. Two kinds:
//   * `online`   — solid colored dot.
//   * `progress` — dashed ring (the "spinner" look).
export function StatusBadge({
  kind,
  label,
}: {
  kind: "online" | "progress";
  label: string;
}) {
  const tone = soft.status[kind];

  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: tone.tint,
        borderRadius: soft.radii.pill,
        paddingHorizontal: 14,
        paddingVertical: 9,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      {kind === "online" ? (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: tone.fg,
          }}
        />
      ) : (
        // Dashed ring — RN borderStyle:'dashed' actually renders on web.
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            borderWidth: 2,
            borderColor: tone.fg,
            borderStyle: "dashed",
          }}
        />
      )}
      <Text
        style={{
          fontFamily: soft.font.family,
          color: tone.fg,
          fontSize: 15,
          fontWeight: "600",
          letterSpacing: -0.1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
