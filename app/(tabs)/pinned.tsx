import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DepartureRow } from "../../src/components/DepartureRow";
import { JourneyBanner } from "../../src/components/JourneyBanner";
import { LineStrip } from "../../src/components/LineStrip";
import { EmptyState } from "../../src/components/soft/EmptyState";
import { SoftCard } from "../../src/components/soft/SoftCard";
import { SoftIcon } from "../../src/components/soft/SoftIcon";
import { departuresFor } from "../../src/lib/api";
import { stationByCode } from "../../src/lib/stations";
import { useTheme } from "../../src/lib/TweaksContext";
import { type } from "../../src/lib/theme";
import { useFavourites } from "../../src/lib/useFavourites";
import { useMetrolinks } from "../../src/lib/useMetrolinks";

export default function PinnedScreen() {
  const colours = useTheme();
  const router = useRouter();
  const { favourites, toggle } = useFavourites();
  const { data, refresh, refreshing } = useMetrolinks();

  const stations = useMemo(
    () => favourites.map((c) => stationByCode(c)).filter((s): s is NonNullable<typeof s> => !!s),
    [favourites],
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colours.accent} />
        }
      >
        <JourneyBanner />
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontFamily: type.display,
                  fontWeight: "700",
              fontSize: 34,
              color: colours.fg,
              letterSpacing: -1,
            }}
          >
            Pinned
          </Text>
          <Text style={{ fontFamily: type.sans, fontSize: 13, color: colours.fgMuted }}>
            {stations.length} {stations.length === 1 ? "station" : "stations"}
          </Text>
        </View>

        {stations.length === 0 ? (
          // 80 lines of bespoke empty-state markup replaced by one atom
          // from the soft kit. Same shape (icon tile + headline + body +
          // CTA), one source of truth, theme-aware.
          <EmptyState
            icon="star"
            title="No pinned stations yet"
            description="Pin a station to keep its next departures one tap away."
            actionLabel="Browse stations"
            onActionPress={() => router.push("/browse")}
          />
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {stations.map((s, idx) => {
              const ds = data ? departuresFor(data.value, s.code).slice(0, 2) : [];
              return (
                <SoftCard key={s.code} padding={0}>
                  <Pressable
                    onPress={() => router.push(`/station/${s.code}`)}
                    style={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 4 }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Text
                        style={{
                          fontFamily: type.mono,
                          fontSize: 11,
                          width: 22,
                          color: colours.fgSubtle,
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: type.sansMedium,
                  fontWeight: "500",
                            fontSize: 19,
                            color: colours.fg,
                            letterSpacing: -0.3,
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
                        hitSlop={8}
                        style={{ padding: 6 }}
                      >
                        {/* SVG star replaces the ★ text glyph — renders
                            consistently across platforms and respects the
                            accent colour. */}
                        <SoftIcon name="star" size={20} color={colours.accent} filled />
                      </Pressable>
                    </View>
                  </Pressable>
                  <View style={{ paddingLeft: 28 }}>
                    {ds.length === 0 ? (
                      <Text
                        style={{
                          fontFamily: type.sans,
                          fontSize: 13,
                          color: colours.fgMuted,
                          padding: 12,
                        }}
                      >
                        No upcoming trams.
                      </Text>
                    ) : (
                      ds.map((d, i) => (
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
                      ))
                    )}
                  </View>
                </SoftCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
