import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import {
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SoftCard } from "../../src/components/soft/SoftCard";
import { DepartureRow } from "../../src/components/DepartureRow";
import { DestinationPickerSheet } from "../../src/components/DestinationPickerSheet";
import { Icon } from "../../src/components/Icon";
import { JourneyBanner } from "../../src/components/JourneyBanner";
import { LineStrip } from "../../src/components/LineStrip";
import { MiniMap } from "../../src/components/MiniMap";
import { NoDeparturesNotice } from "../../src/components/NoDeparturesNotice";
import { ServiceNotice } from "../../src/components/ServiceNotice";
import { departuresFor, messageBoardFor } from "../../src/lib/api";
import { useDemoMode } from "../../src/lib/DemoMode";
import { allStations, stationByCode } from "../../src/lib/stations";
import { useTheme, useTweaks } from "../../src/lib/TweaksContext";
import { microLabel, type } from "../../src/lib/theme";
import { stationsByDistance } from "../../src/lib/stations";
import { useFavourites } from "../../src/lib/useFavourites";
import { useMetrolinks } from "../../src/lib/useMetrolinks";
import { useNearestStation } from "../../src/lib/useNearestStation";

const DEFAULT_STATION = "SPS"; // St Peter's Square — used until geolocation resolves

function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

export default function NowScreen() {
  const colours = useTheme();
  const { softUI } = useTweaks();
  const labelStyle = microLabel(softUI);
  const router = useRouter();
  // userOverride is set when the user manually picks a station from the
  // Change sheet, so subsequent location updates don't drag them away.
  const insets = useSafeAreaInsets();
  const [userOverride, setUserOverride] = useState<string | null>(null);
  const [journeySheetOpen, setJourneySheetOpen] = useState(false);
  const { favourites, isFavourite, toggle } = useFavourites();
  const { demo, toggle: toggleDemo } = useDemoMode();
  const { data, lastUpdated, loading, error, refresh, refreshing } = useMetrolinks();
  const nearest = useNearestStation();

  // Priority: user pick > geolocation > default. The "Near you" pill on
  // the header reflects which one's active.
  const currentCode = userOverride ?? nearest.station?.code ?? DEFAULT_STATION;
  const station = stationByCode(currentCode) ?? allStations()[0]!;
  const pinned = isFavourite(station.code);

  const scrollRef = useRef<ScrollView>(null);
  const contentOpacity = useRef(new Animated.Value(1)).current;

  // Up to 4 nearest stations including the current one, so the user can see
  // their selection persist in the list (marked "Current") instead of having
  // it silently swap out — which previously felt like the page was just
  // shuffling itself.
  const nearbyList = useMemo(() => {
    if (!nearest.coord) return [];
    return stationsByDistance(nearest.coord, 4);
  }, [nearest.coord]);

  // Deliberate ~600ms transition when the active station changes. Brief
  // opacity dim + scroll-to-top + light haptic gives the user time to see
  // that the data is switching, instead of a silent instant swap.
  const switchTo = useCallback(
    (code: string) => {
      if (code === station.code) return;
      Haptics.selectionAsync().catch(() => undefined);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      Animated.timing(contentOpacity, {
        toValue: 0.25,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: Platform.OS !== "web",
      }).start(() => {
        setUserOverride(code);
        setTimeout(() => {
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: Platform.OS !== "web",
          }).start();
        }, 120);
      });
    },
    [station.code, contentOpacity],
  );

  const openInMaps = useCallback(() => {
    if (station.lat == null || station.lng == null) return;
    // Apple Maps with walking directions from the user's current location.
    // dirflg=w = walking. Apple Maps accepts the literal "Current Location"
    // as the saddr.
    const url =
      `https://maps.apple.com/?saddr=Current+Location` +
      `&daddr=${station.lat},${station.lng}&dirflg=w`;
    Linking.openURL(url).catch(() => undefined);
  }, [station]);

  const departures = useMemo(
    () => (data ? departuresFor(data.value, station.code).slice(0, 5) : []),
    [data, station.code],
  );
  const message = useMemo(
    () => (data ? messageBoardFor(data.value, station.code) : null),
    [data, station.code],
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "Late night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  }, [lastUpdated]);

  const updatedAt = lastUpdated ? new Date(lastUpdated) : null;

  const handleRefresh = useCallback(() => {
    refresh();
    nearest.refresh();
  }, [refresh, nearest]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || nearest.refreshing}
            onRefresh={handleRefresh}
            tintColor={colours.accent}
          />
        }
      >
        <JourneyBanner />
        <Animated.View style={{ opacity: contentOpacity }}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 28,
            paddingBottom: 24,
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
                marginBottom: 12,
              }}
            >
              {greeting}, your nearest station is
            </Text>
            <Text
              style={{
                fontFamily: type.display,
                  fontWeight: "700",
                fontSize: 36,
                lineHeight: 40,
                color: colours.fg,
                letterSpacing: -1.2,
              }}
            >
              {station.name}
            </Text>
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <LineStrip lines={station.lines} size={9} gap={4} />
              <Text style={{ fontFamily: type.sans, fontSize: 12, color: colours.fgMuted }}>
                {station.lines.length} {station.lines.length === 1 ? "line" : "lines"}
                {station.zone != null ? ` · Zone ${station.zone}` : ""}
              </Text>
              <Pressable
                onPress={() => toggle(station.code)}
                hitSlop={10}
                style={{ marginLeft: 4, padding: 6 }}
                accessibilityLabel={pinned ? "Unpin station" : "Pin station"}
              >
                <Icon
                name={pinned ? "star" : "star-outline"}
                size={22}
                color={pinned ? colours.accent : colours.fgSubtle}
              />
            </Pressable>
            </View>
          </View>
          {station.lat != null && station.lng != null && (
            <MiniMap
              lat={station.lat}
              lng={station.lng}
              userLat={nearest.coord?.lat}
              userLng={nearest.coord?.lng}
              size={96}
              onPress={openInMaps}
            />
          )}
        </View>

        <SoftCard style={{ marginHorizontal: 16 }} padding={0}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 14,
              paddingHorizontal: 18,
              paddingBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: softUI ? 13 : 11,
                color: colours.fgSubtle,
                ...labelStyle,
              }}
            >
              Next departures
            </Text>
            <Pressable
              onPress={toggleDemo}
              hitSlop={8}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              accessibilityLabel={demo ? "Switch to live data" : "Switch to demo data"}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: demo ? colours.accent : colours.status.good,
                }}
              />
              <Text
                style={{
                  fontFamily: type.mono,
                  fontSize: 11,
                  color: demo ? colours.accent : colours.fgSubtle,
                }}
              >
                {demo ? "demo" : "live"} ·{" "}
                {updatedAt
                  ? `${String(updatedAt.getHours()).padStart(2, "0")}:${String(updatedAt.getMinutes()).padStart(2, "0")}`
                  : "--:--"}
              </Text>
            </Pressable>
          </View>
          <View style={{ paddingLeft: 16, paddingBottom: softUI ? 14 : 8 }}>
            {loading && departures.length === 0 ? (
              <View style={{ padding: 16 }}>
                <Text style={{ fontFamily: type.sans, color: colours.fgMuted }}>Loading…</Text>
              </View>
            ) : error ? (
              <View style={{ padding: 16 }}>
                <Text style={{ fontFamily: type.sans, color: colours.status.delayed }}>
                  Couldn't reach Metrolink data. Pull to retry.
                </Text>
              </View>
            ) : departures.length === 0 ? (
              <NoDeparturesNotice stationName={station.name} variant="panel" />
            ) : (
              departures.map((d, i) => (
                <View key={`${d.platform}-${i}`}>
                  <DepartureRow departure={d} />
                  {i < departures.length - 1 && (
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
          {departures.length > 0 && (
            <Pressable
              onPress={() => router.push(`/station/${station.code}`)}
              style={{
                padding: 14,
                paddingHorizontal: 18,
                borderTopWidth: 0.5,
                borderTopColor: colours.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: type.sansMedium,
                    fontWeight: "500", fontSize: 14, color: colours.fg }}>
                All departures
              </Text>
              <Text style={{ fontSize: 16, color: colours.fgSubtle }}>›</Text>
            </Pressable>
          )}
        </SoftCard>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Pressable
            onPress={() => setJourneySheetOpen(true)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: 44,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: `${colours.accent}1F`, // ~12% alpha — iOS tinted button
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Icon name="navigate" size={18} color={colours.accent} />
            <Text
              style={{
                fontFamily: type.sansSemi,
                fontWeight: "600",
                fontSize: 17,
                color: colours.accent,
              }}
            >
              Plan a journey from here
            </Text>
          </Pressable>
        </View>

        {nearbyList.length > 0 && (
          <View style={{ marginTop: 28, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: softUI ? 13 : 11,
                color: colours.fgSubtle,
                paddingHorizontal: 4,
                marginBottom: 8,
                ...labelStyle,
              }}
            >
              Stations nearby
            </Text>
            <SoftCard padding={0}>
              {nearbyList.map((alt, i) => {
                const isCurrent = alt.station.code === station.code;
                return (
                  <Pressable
                    key={alt.station.code}
                    onPress={() => switchTo(alt.station.code)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderTopWidth: i === 0 ? 0 : 0.5,
                      borderTopColor: colours.divider,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: type.sansMedium,
                  fontWeight: "500",
                          fontSize: 16,
                          color: colours.fg,
                        }}
                      >
                        {alt.station.name}
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          fontFamily: type.sans,
                          fontSize: 12,
                          color: colours.fgMuted,
                        }}
                      >
                        {formatDistance(alt.metres)} walk
                      </Text>
                    </View>
                    {isCurrent ? (
                      <View
                        style={{
                          paddingVertical: 3,
                          paddingHorizontal: 8,
                          borderRadius: 999,
                          backgroundColor: `${colours.accent}22`,
                          borderWidth: 0.5,
                          borderColor: colours.accent,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: softUI ? 11 : 10,
                            color: colours.accent,
                            ...labelStyle,
                          }}
                        >
                          Current
                        </Text>
                      </View>
                    ) : (
                      <Icon name="chevron-right" size={16} color={colours.fgFaint} />
                    )}
                  </Pressable>
                );
              })}
            </SoftCard>
          </View>
        )}

        {message && <ServiceNotice message={message} />}

        {favourites.filter((c) => c !== station.code).length > 0 && (
          <View style={{ marginTop: 28 }}>
            <Text
              style={{
                fontSize: softUI ? 13 : 11,
                color: colours.fgSubtle,
                paddingHorizontal: 20,
                marginBottom: 8,
                ...labelStyle,
              }}
            >
              Pinned
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {favourites
                .filter((c) => c !== station.code)
                .map((c) => {
                  const s = stationByCode(c);
                  if (!s) return null;
                  const next = data ? departuresFor(data.value, c)[0] : undefined;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => switchTo(c)}
                      style={({ pressed }) => ({
                        width: 180,
                        padding: 14,
                        borderRadius: 12,
                        backgroundColor: colours.surface,
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 1,
                        opacity: pressed ? 0.6 : 1,
                      })}
                    >
                      <LineStrip lines={s.lines} size={8} gap={3} />
                      <Text
                        style={{
                          fontFamily: type.sansMedium,
                  fontWeight: "500",
                          fontSize: 16,
                          marginTop: 8,
                          color: colours.fg,
                          letterSpacing: -0.2,
                        }}
                      >
                        {s.name}
                      </Text>
                      <View
                        style={{
                          marginTop: 6,
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            flex: 1,
                            fontFamily: type.sans,
                            fontSize: 12,
                            color: colours.fgMuted,
                          }}
                        >
                          {next ? `→ ${next.destination}` : "—"}
                        </Text>
                        <Text style={{ fontFamily: type.mono, fontSize: 12, color: colours.fg }}>
                          {next ? (next.waitMinutes <= 1 ? "Due" : `${next.waitMinutes} min`) : ""}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
            </ScrollView>
          </View>
        )}
        </Animated.View>
      </ScrollView>
      <DestinationPickerSheet
        visible={journeySheetOpen}
        fromCode={station.code}
        onClose={() => setJourneySheetOpen(false)}
      />
    </View>
  );
}
