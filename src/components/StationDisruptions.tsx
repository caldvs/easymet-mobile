import { Text, View } from "react-native";
import { useDisruptions } from "../lib/DisruptionsContext";
import {
  disruptionsForStation,
  timingFor,
  type Disruption,
  type DisruptionSeverity,
} from "../lib/disruptions";
import { useTheme, useTweaks } from "../lib/TweaksContext";
import { microLabel, type } from "../lib/theme";
import { Card } from "./Card";

const SEVERITY_COLOUR: Record<DisruptionSeverity, string> = {
  severe: "#FF3B30", // iOS systemRed
  notice: "#F2C14E", // amber
  info: "#888888",
};

// Inline disruption block for the station detail screen. Surfaces alerts
// where the station appears in `affectedStationCodes` AND timing is
// active-now OR starts within ~7 days. Hidden entirely when nothing
// relevant — we don't want a "no alerts" placeholder on every station page.
export function StationDisruptions({ stationCode }: { stationCode: string }) {
  const colours = useTheme();
  const { softUI } = useTweaks();
  const labelStyle = microLabel(softUI);
  const { disruptions } = useDisruptions();

  const relevant = disruptionsForStation(disruptions, stationCode);
  if (relevant.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 16, gap: 12 }}>
      {relevant.map((d) => (
        <DisruptionRow key={d.id} d={d} softUI={softUI} labelStyle={labelStyle} />
      ))}
    </View>
  );
}

function DisruptionRow({
  d,
  softUI,
  labelStyle,
}: {
  d: Disruption;
  softUI: boolean;
  labelStyle: ReturnType<typeof microLabel>;
}) {
  const colours = useTheme();
  const colour = SEVERITY_COLOUR[d.severity];
  const timing = timingFor(d);
  const timingLabel =
    timing === "active"
      ? "Now"
      : timing === "today"
      ? "Later today"
      : d.startsAt
      ? `From ${formatShort(d.startsAt)}`
      : "Upcoming";

  return (
    <Card accent={colour}>
      <View style={{ padding: 14 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <View
            style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colour }}
          />
          <Text
            style={{
              fontSize: softUI ? 12 : 11,
              color: colour,
              ...labelStyle,
            }}
          >
            {timingLabel}
          </Text>
          {d.type === "planned-works" && (
            <Text
              style={{
                fontSize: softUI ? 12 : 11,
                color: colours.fgMuted,
                ...labelStyle,
              }}
            >
              · Planned
            </Text>
          )}
        </View>
        <Text
          style={{
            fontFamily: type.sansSemi,
                  fontWeight: "600",
            fontSize: 15,
            color: colours.fg,
            marginBottom: 4,
          }}
        >
          {d.title}
        </Text>
        <Text
          style={{
            fontFamily: type.sans,
            fontSize: 13,
            color: colours.fgMuted,
            lineHeight: 19,
          }}
          numberOfLines={4}
        >
          {d.body}
        </Text>
      </View>
    </Card>
  );
}

function formatShort(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Europe/London",
  });
}
