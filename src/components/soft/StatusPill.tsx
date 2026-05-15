import { Text, View } from "react-native";
import { useSoftTheme, type StatusKind } from "./tokens";

// Tonal status pill from image 2 — white surface, coloured icon tile + label.
// The icon tile is a small rounded square filled in the status hue, with a
// white glyph on top; the label uses the same hue so the pair reads as one
// chromatic unit.
type Config = { glyph: string; label: string };

const CONFIG: Record<StatusKind, Config> = {
  pending:   { glyph: "i",  label: "Pending" },
  submitted: { glyph: "↗",  label: "Submitted" },
  success:   { glyph: "✓",  label: "Success" },
  failed:    { glyph: "✕",  label: "Failed" },
  expired:   { glyph: "◷",  label: "Expired" },
};

export function StatusPill({
  status,
  label,
}: {
  status: StatusKind;
  /** Override the default label text. */
  label?: string;
}) {
  const theme = useSoftTheme();
  const tone = theme.status[status];
  const cfg = CONFIG[status];

  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: theme.surface,
          borderRadius: theme.radii.pill,
          paddingHorizontal: 12,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        },
        theme.shadow.pill,
      ]}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          backgroundColor: tone.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: theme.font.family,
            fontSize: 13,
            fontWeight: "700",
            lineHeight: 15,
          }}
        >
          {cfg.glyph}
        </Text>
      </View>
      <Text
        style={{
          color: tone.fg,
          fontFamily: theme.font.family,
          fontSize: 17,
          fontWeight: "600",
          letterSpacing: -0.2,
        }}
      >
        {label ?? cfg.label}
      </Text>
    </View>
  );
}
