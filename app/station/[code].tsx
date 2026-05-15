import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SoftCard } from "../../src/components/soft/SoftCard";
import { DepartureRow } from "../../src/components/DepartureRow";
import { DestinationPickerSheet } from "../../src/components/DestinationPickerSheet";
import { EmptyState } from "../../src/components/soft/EmptyState";
import { Icon } from "../../src/components/Icon";
import { LineStrip } from "../../src/components/LineStrip";
import { MiniMap } from "../../src/components/MiniMap";
import { NoDeparturesNotice } from "../../src/components/NoDeparturesNotice";
import { ServiceNotice } from "../../src/components/ServiceNotice";
import { StationDisruptions } from "../../src/components/StationDisruptions";
import { departuresFor, messageBoardFor } from "../../src/lib/api";
import { useDemoMode } from "../../src/lib/DemoMode";
import { stationByCode } from "../../src/lib/stations";
import { useTheme, useTweaks } from "../../src/lib/TweaksContext";
import { microLabel, type } from "../../src/lib/theme";
import { useFavourites } from "../../src/lib/useFavourites";
import { useMetrolinks } from "../../src/lib/useMetrolinks";

export default function StationDetailScreen() {
  const colours = useTheme();
  const { softUI } = useTweaks();
  const labelStyle = microLabel(softUI);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ code: string }>();
  const code = (params.code ?? "").toUpperCase();
  const station = stationByCode(code);
  const { data, lastUpdated, refresh, refreshing } = useMetrolinks();
  const { demo, toggle: toggleDemo } = useDemoMode();
  const { isFavourite, toggle } = useFavourites();
  const [journeySheetOpen, setJourneySheetOpen] = useState(false);

  const departures = useMemo(() => {
    if (!data || !station) return [];
    return departuresFor(data.value, station.code);
  }, [data, station]);

  const message = useMemo(
    () => (data && station ? messageBoardFor(data.value, station.code) : null),
    [data, station],
  );

  const updatedAt = lastUpdated ? new Date(lastUpdated) : null;

  if (!station) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <EmptyState
          icon="info"
          title={`Station "${code}" not found`}
          description="The link might be out of date, or this stop has been renamed."
          actionLabel="Browse stations"
          onActionPress={() => router.replace("/browse")}
        />
      </View>
    );
  }

  const pinned = isFavourite(station.code);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
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
            // On a deep link (e.g. typing /station/ANC directly into the
            // browser, or following a shared link), the navigation stack
            // only contains this screen — `router.back()` would no-op and
            // strand the user. Fall back to Home in that case.
            if (router.canGoBack()) router.back();
            else router.replace("/");
          }}
          style={{ padding: 10, flexDirection: "row", alignItems: "center", gap: 4 }}
          hitSlop={10}
          accessibilityLabel="Back"
        >
          <Icon name="back" size={22} color={colours.fg} />
          <Text style={{ fontFamily: type.sansMedium,
                  fontWeight: "500", fontSize: 16, color: colours.fg }}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => toggle(station.code)}
          style={{ padding: 10 }}
          hitSlop={10}
          accessibilityLabel={pinned ? "Unpin station" : "Pin station"}
        >
          <Icon
            name={pinned ? "star" : "star-outline"}
            size={22}
            color={pinned ? colours.accent : colours.fg}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colours.accent} />
        }
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 24,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
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
            </View>
          </View>
          {station.lat != null && station.lng != null && (
            <MiniMap lat={station.lat} lng={station.lng} size={96} />
          )}
        </View>

        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
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
        <SoftCard style={{ marginHorizontal: 16 }} padding={0}>
          <View style={{ paddingLeft: 16, paddingVertical: 4, paddingBottom: softUI ? 12 : 4 }}>
            {departures.length === 0 ? (
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
              backgroundColor: `${colours.accent}1F`,
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

        <StationDisruptions stationCode={station.code} />

        {message && <ServiceNotice message={message} />}
      </ScrollView>
      <DestinationPickerSheet
        visible={journeySheetOpen}
        fromCode={station.code}
        onClose={() => setJourneySheetOpen(false)}
      />
    </View>
  );
}
