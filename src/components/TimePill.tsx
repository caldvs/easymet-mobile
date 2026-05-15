import { Text, View } from "react-native";
import { useTheme, useTweaks } from "../lib/TweaksContext";
import { type } from "../lib/theme";

export function TimePill({
  waitMinutes,
  status,
}: {
  waitMinutes: number;
  status: string;
}) {
  const colours = useTheme();
  const { timeFormat } = useTweaks();

  if (status === "Cancelled") {
    return (
      <Text
        style={{
          fontFamily: type.mono,
          fontSize: 13,
          color: colours.status.cancelled,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Cancelled
      </Text>
    );
  }

  const isDue = waitMinutes <= 1;
  const delayed = status === "Delayed";

  if (timeFormat === "clock") {
    const now = new Date();
    const eta = new Date(now.getTime() + waitMinutes * 60_000);
    const hh = String(eta.getHours()).padStart(2, "0");
    const mm = String(eta.getMinutes()).padStart(2, "0");
    return (
      <View style={{ alignItems: "flex-end", minWidth: 64 }}>
        <Text
          style={{
            fontFamily: type.mono,
            fontVariant: ["tabular-nums"],
            fontSize: 22,
            fontWeight: "600",
            color: delayed ? colours.status.delayed : colours.fg,
            lineHeight: 24,
            letterSpacing: -0.5,
          }}
        >
          {hh}:{mm}
        </Text>
        {delayed && (
          <Text
            style={{
              fontSize: 11,
              marginTop: 2,
              color: colours.status.delayed,
              letterSpacing: 0.5,
            }}
          >
            delayed
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={{ alignItems: "flex-end", minWidth: 56 }}>
      <Text
        style={{
          fontFamily: type.mono,
          fontVariant: ["tabular-nums"],
          fontSize: isDue ? 20 : 28,
          fontWeight: "600",
          color: delayed ? colours.status.delayed : colours.fg,
          lineHeight: isDue ? 22 : 30,
        }}
      >
        {isDue ? "Due" : String(waitMinutes)}
      </Text>
      {!isDue && (
        <Text
          style={{
            fontSize: 11,
            marginTop: 1,
            color: delayed ? colours.status.delayed : colours.fgMuted,
            letterSpacing: 0.5,
          }}
        >
          {delayed ? "delayed" : "min"}
        </Text>
      )}
    </View>
  );
}
