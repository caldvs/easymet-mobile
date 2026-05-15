import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useJourney } from "../lib/JourneyContext";
import { corridorFor } from "../lib/lines";
import { stationByCode } from "../lib/stations";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { Icon } from "./Icon";

// Persistent strip at the top of Now / Browse / Pinned tabs when a journey is
// active. Tap → returns to the Journey screen.
export function JourneyBanner() {
  const colours = useTheme();
  const router = useRouter();
  const { journey, currentIdx } = useJourney();
  if (!journey) return null;

  const stations = journey.route.stations;
  const lineId = journey.route.lineId;
  const lineCorridor =
    lineId === "Ashton" ? "East Manchester" :
    lineId === "East Didsbury" ? "South Manchester" :
    lineId === "Rochdale" ? "Oldham & Rochdale" : lineId;
  const lineColour = corridorFor(lineCorridor).colour;
  const arrived = currentIdx >= stations.length - 1;
  const finalStation = stationByCode(stations[stations.length - 1]!);
  const nextStation = stationByCode(stations[Math.min(currentIdx + 1, stations.length - 1)]!);

  return (
    <Pressable
      onPress={() => router.push(`/journey`)}
      style={({ pressed }) => ({
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 10,
        borderRadius: 14,
        backgroundColor: colours.surfaceFill,
        borderWidth: 0.5,
        borderColor: lineColour,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: `${lineColour}26`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="tram" size={16} color={lineColour} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        {arrived ? (
          <>
            <Text
              style={{
                fontFamily: type.sansSemi,
                  fontWeight: "600",
                fontSize: 13,
                color: colours.fg,
              }}
              numberOfLines={1}
            >
              Arrived: {finalStation?.name ?? ""}
            </Text>
            <Text
              style={{
                fontFamily: type.sans,
                fontSize: 11,
                color: colours.fgMuted,
              }}
              numberOfLines={1}
            >
              Tap to end journey
            </Text>
          </>
        ) : (
          <>
            <Text
              style={{
                fontFamily: type.sansMedium,
                  fontWeight: "500",
                fontSize: 13,
                color: colours.fg,
              }}
              numberOfLines={1}
            >
              Next: {nextStation?.name ?? ""}
            </Text>
            <Text
              style={{
                fontFamily: type.sans,
                fontSize: 11,
                color: colours.fgMuted,
              }}
              numberOfLines={1}
            >
              {stations.length - 1 - currentIdx} stops to {finalStation?.name ?? ""}
            </Text>
          </>
        )}
      </View>
      <Icon name="chevron-right" size={16} color={colours.fgFaint} />
    </Pressable>
  );
}
