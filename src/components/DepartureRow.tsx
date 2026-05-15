import { Text, View } from "react-native";
import type { Departure } from "../lib/api";
import { corridorFor } from "../lib/lines";
import { useTheme, useTweaks } from "../lib/TweaksContext";
import { text, type } from "../lib/theme";
import { TimePill } from "./TimePill";

export function DepartureRow({ departure }: { departure: Departure }) {
  const colours = useTheme();
  const { dense } = useTweaks();
  const c = corridorFor(departure.corridor);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        minHeight: 44,
        paddingVertical: dense ? 10 : 14,
        paddingRight: 16,
      }}
    >
      <View
        style={{
          width: 4,
          alignSelf: "stretch",
          borderRadius: 999,
          backgroundColor: c.colour,
        }}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            ...text.headline,
            color: colours.fg,
          }}
          numberOfLines={1}
        >
          {departure.destination}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 2,
          }}
        >
          <Text
            style={{
              ...text.footnote,
              color: colours.fgMuted,
            }}
            numberOfLines={1}
          >
            {c.displayName} line
          </Text>
          {departure.carriages != null && (
            <>
              <View
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: colours.fgFaint,
                }}
              />
              <Text
                style={{
                  fontFamily: type.mono,
                  fontVariant: ["tabular-nums"],
                  fontSize: 12,
                  color: colours.fgMuted,
                }}
              >
                {departure.carriages}-car
              </Text>
            </>
          )}
        </View>
      </View>
      <TimePill waitMinutes={departure.waitMinutes} status={departure.status} />
    </View>
  );
}
