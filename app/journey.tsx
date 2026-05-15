import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { SoftCard } from "../src/components/soft/SoftCard";
import { Icon } from "../src/components/Icon";
import { JourneyLadder } from "../src/components/JourneyLadder";
import { Screen } from "../src/components/Screen";
import { useJourney } from "../src/lib/JourneyContext";
import { routeDurationSeconds, SIM } from "../src/lib/journey";
import { corridorFor } from "../src/lib/lines";
import { stationByCode } from "../src/lib/stations";
import { useTheme, useTweaks } from "../src/lib/TweaksContext";
import { microLabel, type } from "../src/lib/theme";

export default function JourneyScreen() {
  const colours = useTheme();
  const { softUI } = useTweaks();
  const labelStyle = microLabel(softUI);
  const router = useRouter();
  const { journey, currentIdx, end } = useJourney();

  // If a user lands here without an active journey (deep link, reload),
  // bounce back to home.
  useEffect(() => {
    if (!journey) router.replace("/");
  }, [journey, router]);

  // Derive everything the render needs *before* the early return so the
  // hook order stays stable across the "no journey yet" → "journey set"
  // transition. React tracks hooks by call order, so adding a hook below
  // a conditional `return null` breaks on the next render once the
  // condition flips.
  const stations = journey?.route.stations ?? [];
  const lineId = journey?.route.lineId;
  const lineCorridor =
    lineId === "Ashton" ? "East Manchester" :
    lineId === "East Didsbury" ? "South Manchester" :
    lineId === "Rochdale" ? "Oldham & Rochdale" : (lineId ?? "");
  const lineColour = corridorFor(lineCorridor).colour;

  const origin = journey ? stationByCode(journey.fromCode) : undefined;
  const destination = journey ? stationByCode(journey.toCode) : undefined;
  const arrived = stations.length > 0 && currentIdx >= stations.length - 1;
  const nextStation =
    stations.length > 0
      ? stationByCode(stations[Math.min(currentIdx + 1, stations.length - 1)]!)
      : undefined;

  const totalStops = stations.length > 0 ? stations.length - 1 : 0;
  const totalSeconds = journey ? routeDurationSeconds(journey.route) : 0;
  const totalMinutes = Math.round(totalSeconds / 60);
  const arrivalMs = journey ? journey.startedAt + totalSeconds * 1000 : 0;
  const arrival = new Date(arrivalMs);
  const arrivalLabel = `${String(arrival.getHours()).padStart(2, "0")}:${String(arrival.getMinutes()).padStart(2, "0")}`;
  const minsToGo = Math.max(0, Math.round((arrivalMs - Date.now()) / 60_000));

  // Plain-text share via the OS share sheet. No backend, no location
  // data leaves the device — just a short natural-language message the
  // user's friend can read in iMessage / WhatsApp / Telegram / etc.
  const shareJourney = useCallback(() => {
    let message: string;
    if (arrived) {
      message = `Just arrived at ${destination?.name ?? "my stop"}.`;
    } else {
      const next = nextStation?.name;
      const intro = `On my way to ${destination?.name ?? "my stop"} via the ${lineId} line.`;
      const eta = `ETA around ${arrivalLabel} (~${minsToGo} min).`;
      message = next ? `${intro} Next stop: ${next}. ${eta}` : `${intro} ${eta}`;
    }
    Share.share({ message }).catch(() => undefined);
  }, [arrived, arrivalLabel, destination?.name, lineId, minsToGo, nextStation?.name]);

  if (!journey) return null;

  return (
    <Screen>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 8,
          paddingHorizontal: 12,
        }}
      >
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/");
          }}
          style={({ pressed }) => ({
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            opacity: pressed ? 0.55 : 1,
          })}
          hitSlop={10}
        >
          <Icon name="back" size={22} color={colours.accent} />
          <Text
            style={{
              fontFamily: type.sansMedium,
              fontWeight: "500",
              fontSize: 16,
              color: colours.accent,
            }}
          >
            Back
          </Text>
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={shareJourney}
            hitSlop={10}
            style={({ pressed }) => ({
              padding: 10,
              opacity: pressed ? 0.55 : 1,
            })}
            accessibilityLabel="Share journey progress"
          >
            <Text
              style={{
                fontFamily: type.sansMedium,
                fontWeight: "500",
                fontSize: 16,
                color: colours.accent,
              }}
            >
              Share
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              end();
              router.replace("/");
            }}
            style={({ pressed }) => ({ padding: 10, opacity: pressed ? 0.55 : 1 })}
            hitSlop={10}
          >
            <Text
              style={{
                fontFamily: type.sansMedium,
                fontWeight: "500",
                fontSize: 16,
                color: colours.accent,
              }}
            >
              End
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: lineColour,
              }}
            />
            <Text
              style={{
                fontSize: softUI ? 12 : 11,
                color: colours.fgSubtle,
                ...labelStyle,
              }}
            >
              {lineId} line journey
            </Text>
          </View>
          <Text
            style={{
              fontFamily: type.display,
                  fontWeight: "700",
              fontSize: 32,
              lineHeight: 36,
              color: colours.fg,
              letterSpacing: -1.2,
            }}
          >
            {origin?.name}{" "}
            <Text style={{ color: lineColour }}>→</Text>{" "}
            {destination?.name}
          </Text>
          <Text
            style={{
              fontFamily: type.sans,
              fontSize: 13,
              color: colours.fgMuted,
              marginTop: 6,
            }}
          >
            {totalStops} stops · {totalMinutes} min
            {journey.route.transfers > 0
              ? ` · ${journey.route.transfers} change${journey.route.transfers > 1 ? "s" : ""}`
              : ""}
            {" · arriving around "}
            {arrivalLabel}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <SoftCard padding={0}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                padding: 16,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${lineColour}26`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="tram" size={22} color={lineColour} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: softUI ? 12 : 10,
                    color: colours.fgSubtle,
                    ...labelStyle,
                  }}
                >
                  {arrived ? "You've arrived" : "Next stop"}
                </Text>
                <Text
                  style={{
                    fontFamily: type.display,
                  fontWeight: "700",
                    fontSize: 22,
                    color: colours.fg,
                    letterSpacing: -0.6,
                    marginTop: 2,
                  }}
                >
                  {arrived ? destination?.name : nextStation?.name}
                </Text>
                {!arrived && (
                  <Text
                    style={{
                      fontFamily: type.sans,
                      fontSize: 12,
                      color: colours.fgMuted,
                      marginTop: 2,
                    }}
                  >
                    Arriving in about {Math.round(SIM.secondsPerStop / 60)} min ·{" "}
                    {stations.length - 1 - currentIdx} stops to {destination?.name}
                  </Text>
                )}
              </View>
            </View>
          </SoftCard>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <SoftCard padding={0}>
            <View style={{ paddingVertical: 4 }}>
              <JourneyLadder />
            </View>
          </SoftCard>
        </View>

        <Text
          style={{
            paddingHorizontal: 24,
            paddingTop: 16,
            fontFamily: type.sans,
            fontSize: 11,
            color: colours.fgFaint,
            textAlign: "center",
          }}
        >
          Progress updates from your live location. Keep this screen open while
          you travel — it'll advance automatically as you move along the line.
        </Text>
      </ScrollView>
    </Screen>
  );
}
