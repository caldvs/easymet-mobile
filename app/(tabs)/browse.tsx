import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  SectionList,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "../../src/components/soft/EmptyState";
import { SearchPill } from "../../src/components/soft/SearchPill";
import { JourneyBanner } from "../../src/components/JourneyBanner";
import { LineDot } from "../../src/components/LineDot";
import { StationListRow } from "../../src/components/StationListRow";
import { corridorFor } from "../../src/lib/lines";
import { allStations, stationsByDistance, type Station } from "../../src/lib/stations";
import { useNearestStation } from "../../src/lib/NearestLocationContext";
import { useTheme, useTweaks } from "../../src/lib/TweaksContext";
import { microLabel, text, type } from "../../src/lib/theme";
import { useFavourites } from "../../src/lib/useFavourites";

// Service lines from the design palette, mapped to corridor names for colour
// lookup via corridorFor().
const SERVICE_LINES: { name: string; corridor: string }[] = [
  { name: "Airport",        corridor: "Airport" },
  { name: "Altrincham",     corridor: "Altrincham" },
  { name: "Ashton",         corridor: "East Manchester" },
  { name: "Bury",           corridor: "Bury" },
  { name: "East Didsbury",  corridor: "South Manchester" },
  { name: "Eccles",         corridor: "Eccles" },
  { name: "Rochdale",       corridor: "Oldham & Rochdale" },
  { name: "Trafford Park",  corridor: "Trafford Park" },
];

export default function BrowseScreen() {
  const colours = useTheme();
  const { softUI } = useTweaks();
  const labelStyle = microLabel(softUI);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [lineFilter, setLineFilter] = useState<string | "ALL">("ALL");
  const { isFavourite, toggle } = useFavourites();
  const nearest = useNearestStation();

  // Top 3 nearest stations shown above the alphabetical list. Only when the
  // search is empty, no line filter active, and we actually have a location
  // — otherwise we'd be muddying a deliberate search.
  const nearestList = useMemo(() => {
    if (!nearest.coord || query.trim() || lineFilter !== "ALL") return [];
    return stationsByDistance(nearest.coord, 3);
  }, [nearest.coord, query, lineFilter]);

  // Dismiss the keyboard before pushing to station detail. Otherwise the
  // keyboard rides along through the slide animation and is still visible
  // (covering the tab bar) when the user comes back to Browse. The TextInput
  // stays unfocused but its text is preserved, so a return-to-refine still
  // has the previous query waiting.
  const openStation = useCallback(
    (code: string) => {
      Keyboard.dismiss();
      router.push(`/station/${code}`);
    },
    [router],
  );

  const sections = useMemo(() => {
    let xs = allStations();
    if (lineFilter !== "ALL") xs = xs.filter((s) => s.lines.includes(lineFilter));
    const q = query.trim().toLowerCase();
    if (q) xs = xs.filter((s) => s.name.toLowerCase().includes(q));

    const grouped = new Map<string, Station[]>();
    for (const s of xs) {
      const k = s.name[0]!.toUpperCase();
      if (!grouped.has(k)) grouped.set(k, []);
      grouped.get(k)!.push(s);
    }
    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, data]) => ({ title: letter, data }));
  }, [query, lineFilter]);

  const stationCount = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.code}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 180 }}
        ListHeaderComponent={
          <View>
            <JourneyBanner />
            <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
              <Text style={{ ...text.largeTitle, color: colours.fg }}>Browse</Text>
            </View>

            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <SearchPill
                placeholder={`Search ${allStations().length} stations`}
                width="100%"
                value={query}
                onChangeText={setQuery}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
            >
              <Chip
                label="All lines"
                active={lineFilter === "ALL"}
                onPress={() => setLineFilter("ALL")}
              />
              {SERVICE_LINES.map((L) => (
                <Chip
                  key={L.name}
                  label={L.name}
                  corridor={L.corridor}
                  active={lineFilter === L.name}
                  onPress={() => setLineFilter(L.name)}
                />
              ))}
            </ScrollView>

            {nearestList.length > 0 && (
              <View style={{ paddingTop: 6 }}>
                <Text
                  style={{
                    paddingHorizontal: 20,
                    paddingTop: 14,
                    paddingBottom: 6,
                    ...text.footnote,
                    fontWeight: "600",
                    color: colours.fgMuted,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                  }}
                >
                  Nearest
                </Text>
                {nearestList.map((n, i) => (
                  <StationListRow
                    key={`nearest-${n.station.code}`}
                    station={n.station}
                    pinned={isFavourite(n.station.code)}
                    onOpen={() => openStation(n.station.code)}
                    onTogglePin={() => toggle(n.station.code)}
                    position={
                      nearestList.length === 1
                        ? "only"
                        : i === 0
                        ? "first"
                        : i === nearestList.length - 1
                        ? "last"
                        : "middle"
                    }
                  />
                ))}
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 6,
            }}
          >
            <Text
              style={{
                ...text.footnote,
                fontWeight: "600",
                color: colours.fgMuted,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const len = section.data.length;
          const position =
            len === 1
              ? "only"
              : index === 0
              ? "first"
              : index === len - 1
              ? "last"
              : "middle";
          return (
            <StationListRow
              station={item}
              pinned={isFavourite(item.code)}
              onOpen={() => openStation(item.code)}
              onTogglePin={() => toggle(item.code)}
              position={position}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title={query ? `No stations match "${query}"` : "No stations match this filter"}
            description="Try another spelling, or clear the filter."
          />
        }
      />
    </View>
  );
}

function Chip({
  label,
  corridor,
  active,
  onPress,
}: {
  label: string;
  corridor?: string;
  active: boolean;
  onPress: () => void;
}) {
  const colours = useTheme();
  // Look up colour by corridor passed in (or grey for "All lines").
  const accentColour = corridor ? corridorFor(corridor).colour : "#888";
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 0.5,
        borderColor: active ? accentColour : "#F2F2F7",
        backgroundColor: active ? `${accentColour}26` : "#F2F2F7",
      }}
    >
      {corridor && <LineDot corridor={corridor} size={8} />}
      <Text
        style={{
          fontFamily: type.sansMedium,
                  fontWeight: "500",
          fontSize: 13,
          color: colours.fg,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
