import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { Icon } from "./Icon";

type Variant = "compact" | "panel";

// Replaces the bare "No upcoming trams." line with a context-aware
// notice: a quiet-hours headline when Metrolink isn't running, and a
// gentler "nothing scheduled right now" with a link to Updates when
// service should be active but the board is empty (usually a planned
// works or short-term outage). Compact variant for tight contexts
// (pinned-station cards on Home); panel variant for the dedicated
// departures cards on Nearby / station detail.
export function NoDeparturesNotice({
  stationName,
  variant = "panel",
}: {
  stationName?: string;
  variant?: Variant;
}) {
  const colours = useTheme();
  const router = useRouter();

  // Metrolink's published service hours: roughly 06:00 to 01:00 every
  // day (last departures ~23:30 from outer ends). Outside that window
  // the board is reliably empty because no trams are running — that's
  // a different message from "the board is empty mid-afternoon".
  const tone = useMemo<"overnight" | "late-night" | "first-trams" | "service-gap">(() => {
    const h = new Date().getHours();
    if (h >= 1 && h < 5) return "overnight";
    if (h >= 5 && h < 6) return "first-trams";
    if (h >= 23) return "late-night";
    return "service-gap";
  }, []);

  const where = stationName ? ` at ${stationName}` : "";
  const headline = {
    overnight: "Quiet night",
    "late-night": "Service is winding down",
    "first-trams": "First trams arriving soon",
    "service-gap": "No upcoming trams",
  }[tone];
  const body = {
    overnight: `Trams aren't running${where} right now. First services typically start around 6 AM.`,
    "late-night": `The last trams of the day are running. Check Updates for tonight's final departures${where}.`,
    "first-trams": `Trams should start appearing on the board shortly${where}.`,
    "service-gap": `Nothing's scheduled${where} right now. Service updates might explain why.`,
  }[tone];
  const sleeping = tone === "overnight" || tone === "late-night";
  const iconName = sleeping ? "clock" : "tram";

  if (variant === "compact") {
    return (
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Icon name={iconName} size={16} color={colours.fgSubtle} />
        <Text
          style={{
            flex: 1,
            fontFamily: type.sans,
            fontSize: 13,
            lineHeight: 17,
            color: colours.fgMuted,
          }}
          numberOfLines={2}
        >
          <Text style={{ color: colours.fg, fontFamily: type.sansMedium, fontWeight: "500" }}>
            {headline}.
          </Text>{" "}
          {body}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingVertical: 28, paddingHorizontal: 24, alignItems: "center" }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          marginBottom: 14,
          backgroundColor: `${colours.accent}14`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={iconName} size={26} color={colours.accent} />
      </View>
      <Text
        style={{
          fontFamily: type.sansSemi,
          fontWeight: "600",
          fontSize: 17,
          color: colours.fg,
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        {headline}
      </Text>
      <Text
        style={{
          fontFamily: type.sans,
          fontSize: 13,
          color: colours.fgMuted,
          textAlign: "center",
          lineHeight: 18,
          marginBottom: 16,
          maxWidth: 280,
        }}
      >
        {body}
      </Text>
      <Pressable
        onPress={() => router.push("/announcements")}
        accessibilityLabel="See network updates"
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 999,
          backgroundColor: `${colours.accent}1F`,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Icon name="bell" size={14} color={colours.accent} />
        <Text
          style={{
            fontFamily: type.sansSemi,
            fontWeight: "600",
            fontSize: 13,
            color: colours.accent,
          }}
        >
          See Updates
        </Text>
      </Pressable>
    </View>
  );
}
