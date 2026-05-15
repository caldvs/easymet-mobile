import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SoftCard } from "../../src/components/soft/SoftCard";
import { DepartureRow } from "../../src/components/DepartureRow";
import { Icon } from "../../src/components/Icon";
import { JourneyBanner } from "../../src/components/JourneyBanner";
import { LineStrip } from "../../src/components/LineStrip";
import { NetworkBell } from "../../src/components/NetworkBell";
import { NoDeparturesNotice } from "../../src/components/NoDeparturesNotice";
import { TweaksPanel } from "../../src/components/TweaksPanel";
import { departuresFor } from "../../src/lib/api";
import { stationByCode } from "../../src/lib/stations";
import { useTheme, useTweaks } from "../../src/lib/TweaksContext";
import { useUser } from "../../src/lib/UserContext";
import { type } from "../../src/lib/theme";
import { useFavourites } from "../../src/lib/useFavourites";
import { useMetrolinks } from "../../src/lib/useMetrolinks";

// Home screen — the regular-commuter dashboard. The pinned stations live
// here so a daily user opens the app and sees both ends of their journey
// (home stop + work stop) without picking anything.
export default function HomeScreen() {
  const colours = useTheme();
  const { softUI } = useTweaks();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const { favourites, toggle } = useFavourites();
  const { data, refresh, refreshing } = useMetrolinks();
  const { name } = useUser();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "Late night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  }, []);

  const stations = useMemo(
    () => favourites.map((c) => stationByCode(c)).filter((s): s is NonNullable<typeof s> => !!s),
    [favourites],
  );

  // Split into "has something to show" vs "nothing scheduled". Two
  // consequences: (1) ordering — stations with departures rise to the
  // top; (2) the "nothing scheduled" copy is rendered ONCE for the
  // whole batch instead of repeating identically per card.
  const { withDepartures, emptyStations } = useMemo(() => {
    const withD: { station: (typeof stations)[number]; departures: ReturnType<typeof departuresFor> }[] = [];
    const emptyS: typeof stations = [];
    for (const s of stations) {
      const ds = data ? departuresFor(data.value, s.code).slice(0, 3) : [];
      if (ds.length > 0) withD.push({ station: s, departures: ds });
      else emptyS.push(s);
    }
    return { withDepartures: withD, emptyStations: emptyS };
  }, [stations, data]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 180 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colours.accent} />
        }
      >
        <JourneyBanner />
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 20,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: type.sans,
                fontSize: 14,
                color: colours.fgMuted,
                marginBottom: 4,
              }}
            >
              {greeting},
            </Text>
            {name ? (
              <Text
                style={{
                  fontFamily: type.display,
                  fontWeight: "700",
                  fontSize: 34,
                  lineHeight: 36,
                  color: colours.fg,
                  letterSpacing: -1,
                }}
              >
                {name}
              </Text>
            ) : (
              <Pressable onPress={() => setTweaksOpen(true)}>
                <Text
                  style={{
                    fontFamily: type.display,
                  fontWeight: "700",
                    fontSize: 34,
                    lineHeight: 36,
                    color: colours.fgSubtle,
                    letterSpacing: -1,
                  }}
                >
                  Add your name
                </Text>
              </Pressable>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Pressable
              onPress={() => setTweaksOpen(true)}
              hitSlop={12}
              style={({ pressed }) => ({
                padding: 12,
                minHeight: 44,
                minWidth: 44,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.55 : 1,
              })}
              accessibilityLabel="Open tweaks"
            >
              <Icon name="settings" size={26} color={colours.fg} />
            </Pressable>
            <NetworkBell />
          </View>
        </View>

        {stations.length === 0 ? (
          <View style={{ paddingVertical: 60, paddingHorizontal: 30, alignItems: "center" }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                marginBottom: 16,
                backgroundColor: "rgba(0,0,0,0.04)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="star-outline" size={26} color={colours.fgSubtle} />
            </View>
            <Text
              style={{
                fontFamily: type.sansMedium,
                  fontWeight: "500",
                fontSize: 17,
                color: colours.fg,
                marginBottom: 6,
              }}
            >
              Pin your daily stops
            </Text>
            <Text
              style={{
                fontFamily: type.sans,
                fontSize: 14,
                color: colours.fgMuted,
                textAlign: "center",
                marginBottom: 18,
              }}
            >
              Add your home and work stations so you can open the app and see
              departures from both at a glance.
            </Text>
            <Pressable
              onPress={() => router.push("/browse")}
              style={({ pressed }) => ({
                minHeight: 44,
                justifyContent: "center",
                paddingHorizontal: 22,
                borderRadius: 12,
                backgroundColor: colours.accent,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: type.sansSemi,
                  fontWeight: "600",
                  fontSize: 17,
                  color: "#FFFFFF",
                }}
              >
                Browse stations
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {withDepartures.map(({ station: s, departures: ds }) => (
              <SoftCard key={s.code} padding={0}>
                <Pressable
                  onPress={() => router.push(`/station/${s.code}`)}
                  style={({ pressed }) => ({
                    paddingTop: 14,
                    paddingHorizontal: 16,
                    paddingBottom: 4,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: type.display,
                          fontWeight: "700",
                          fontSize: 24,
                          color: colours.fg,
                          letterSpacing: -0.6,
                        }}
                      >
                        {s.name}
                      </Text>
                      <View
                        style={{
                          marginTop: 6,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <LineStrip lines={s.lines} size={7} gap={3} />
                        {s.zone != null && (
                          <Text
                            style={{
                              fontFamily: type.sans,
                              fontSize: 12,
                              color: colours.fgMuted,
                            }}
                          >
                            Zone {s.zone}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        toggle(s.code);
                      }}
                      hitSlop={10}
                      style={({ pressed }) => ({ padding: 10, opacity: pressed ? 0.55 : 1 })}
                      accessibilityLabel="Unpin station"
                    >
                      <Icon name="star" size={20} color={colours.accent} />
                    </Pressable>
                  </View>
                </Pressable>
                <View style={{ paddingLeft: 16, paddingBottom: softUI ? 12 : 4 }}>
                  {ds.map((d, i) => (
                    <View key={i}>
                      <DepartureRow departure={d} />
                      {i < ds.length - 1 && (
                        <View
                          style={{
                            height: 1,
                            marginLeft: 18,
                            backgroundColor: colours.divider,
                          }}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </SoftCard>
            ))}

            {emptyStations.length > 0 && (
              <QuietPinnedSection stations={emptyStations} />
            )}
          </View>
        )}
      </ScrollView>
      <TweaksPanel visible={tweaksOpen} onClose={() => setTweaksOpen(false)} />
    </View>
  );
}

// Grouped notice for pinned stations with no upcoming trams. Replaces
// the per-card repetition you see at 02:00 when every pinned stop is
// quiet for the same reason — three identical paragraphs collapse into
// one shared explanation, with the empty stations still listed (and
// still tappable through to their detail page).
function QuietPinnedSection({
  stations,
}: {
  stations: NonNullable<ReturnType<typeof stationByCode>>[];
}) {
  const colours = useTheme();
  const router = useRouter();
  return (
    <>
      <SoftCard padding={0}>
        {stations.map((s, i) => (
          <View key={s.code}>
            <Pressable
              onPress={() => router.push(`/station/${s.code}`)}
              style={({ pressed }) => ({
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: type.sansSemi,
                    fontWeight: "600",
                    fontSize: 16,
                    color: colours.fg,
                    letterSpacing: -0.2,
                  }}
                >
                  {s.name}
                </Text>
                <View
                  style={{
                    marginTop: 4,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <LineStrip lines={s.lines} size={6} gap={3} />
                  {s.zone != null && (
                    <Text style={{ fontFamily: type.sans, fontSize: 12, color: colours.fgMuted }}>
                      Zone {s.zone}
                    </Text>
                  )}
                </View>
              </View>
              <Icon name="chevron-right" size={16} color={colours.fgFaint} />
            </Pressable>
            {i < stations.length - 1 && (
              <View
                style={{
                  marginLeft: 16,
                  height: 1,
                  backgroundColor: colours.divider,
                }}
              />
            )}
          </View>
        ))}
      </SoftCard>
      <NoDeparturesNotice variant="panel" />
    </>
  );
}
