import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useJourney } from "../lib/JourneyContext";
import { findRoute, reachableFrom } from "../lib/journey";
import { corridorFor } from "../lib/lines";
import { stationByCode } from "../lib/stations";
import { useTheme } from "../lib/TweaksContext";
import { type } from "../lib/theme";
import { pressFeedback } from "./soft/interaction";
import { SearchPill } from "./soft/SearchPill";
import { SoftIcon } from "./soft/SoftIcon";
import { SoftModal } from "./soft/Modal";

// Bottom sheet for picking a destination. We pre-filter to stations actually
// routable in a single line from the origin — no point letting the user pick
// somewhere we can't get them to.
//
// Chassis is the soft kit's `SoftModal position="bottom"`. This file now
// holds just the content: the "From <origin>" eyebrow + title, the search,
// and the annotated destination list.
export function DestinationPickerSheet({
  visible,
  fromCode,
  onClose,
}: {
  visible: boolean;
  fromCode: string;
  onClose: () => void;
}) {
  const colours = useTheme();
  const router = useRouter();
  const { start } = useJourney();
  const [q, setQ] = useState("");

  const fromStation = stationByCode(fromCode);

  const destinations = useMemo(() => {
    if (!fromStation) return [];
    const codes = reachableFrom(fromCode);
    const list = codes
      .map((c) => stationByCode(c))
      .filter((s): s is NonNullable<typeof s> => !!s);

    // Annotate each with its shortest route + hop count via findRoute.
    const annotated = list
      .map((s) => {
        const route = findRoute(fromCode, s.code);
        if (!route) return null;
        return {
          station: s,
          lineId: route.lineId,
          hops: route.stations.length - 1,
          transfers: route.transfers,
          route,
        };
      })
      .filter((x): x is NonNullable<typeof x> => !!x)
      .sort((a, b) => a.station.name.localeCompare(b.station.name));

    if (!q.trim()) return annotated;
    const k = q.trim().toLowerCase();
    return annotated.filter((x) => x.station.name.toLowerCase().includes(k));
  }, [fromCode, fromStation, q]);

  if (!fromStation) return null;

  return (
    <SoftModal
      visible={visible}
      onClose={() => {
        setQ("");
        onClose();
      }}
      position="bottom"
      title={`From ${fromStation.name}`}
    >
      <Text
        style={{
          fontFamily: type.sansSemi,
          fontWeight: "600",
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: colours.fgSubtle,
          marginTop: -8,
          marginBottom: 12,
        }}
      >
        Heading to…
      </Text>

      <SearchPill
        placeholder="Where to?"
        width="100%"
        value={q}
        onChangeText={setQ}
        autoFocus
      />

      <ScrollView
        style={{ flexGrow: 0, marginTop: 12, maxHeight: 440 }}
        keyboardShouldPersistTaps="handled"
      >
        {destinations.length === 0 ? (
          <View style={{ paddingHorizontal: 8, paddingVertical: 30, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: type.sansMedium,
                fontWeight: "500",
                fontSize: 14,
                color: colours.fg,
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              No single-line journeys from {fromStation.name}
              {q.trim() ? ` match "${q.trim()}"` : ""}
            </Text>
            <Text
              style={{
                fontFamily: type.sans,
                fontSize: 12,
                color: colours.fgMuted,
                textAlign: "center",
              }}
            >
              We don&apos;t yet plan trips with line changes.
            </Text>
          </View>
        ) : (
          destinations.map(({ station, lineId, hops, transfers, route }) => {
            const c = corridorFor(
              lineId === "Ashton"
                ? "East Manchester"
                : lineId === "East Didsbury"
                ? "South Manchester"
                : lineId === "Rochdale"
                ? "Oldham & Rochdale"
                : lineId,
            );
            return (
              <Pressable
                key={station.code}
                onPress={() => {
                  start(route, fromCode, station.code);
                  onClose();
                  router.push(`/journey`);
                }}
                style={(state) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  ...pressFeedback(state),
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: type.sansMedium,
                      fontWeight: "500",
                      fontSize: 16,
                      color: colours.fg,
                      letterSpacing: -0.2,
                    }}
                  >
                    {station.name}
                  </Text>
                  <View
                    style={{
                      marginTop: 3,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: c.colour,
                      }}
                    />
                    <Text
                      style={{ fontFamily: type.sans, fontSize: 12, color: colours.fgMuted }}
                    >
                      {transfers === 0
                        ? `${lineId} line`
                        : `via ${transfers} change${transfers > 1 ? "s" : ""}`}
                    </Text>
                    <View
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: 1.5,
                        backgroundColor: colours.fgMuted,
                      }}
                    />
                    <Text
                      style={{ fontFamily: type.mono, fontSize: 11, color: colours.fgMuted }}
                    >
                      {hops} stops
                    </Text>
                  </View>
                </View>
                <SoftIcon
                  name="chevronRight"
                  size={16}
                  color={colours.fgFaint}
                  strokeWidth={2}
                />
              </Pressable>
            );
          })
        )}
        <View style={{ height: 12 }} />
      </ScrollView>
    </SoftModal>
  );
}
