import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../../src/components/Icon";
import { JourneyBanner } from "../../src/components/JourneyBanner";
import { LineStrip } from "../../src/components/LineStrip";
import { StationPickerSheet } from "../../src/components/StationPickerSheet";
import { Button } from "../../src/components/soft/Button";
import { SearchPill } from "../../src/components/soft/SearchPill";
import { SoftIcon } from "../../src/components/soft/SoftIcon";
import { useJourney } from "../../src/lib/JourneyContext";
import { findRoute, routeDurationSeconds } from "../../src/lib/journey";
import { allStations, stationByCode, type Station } from "../../src/lib/stations";
import { useTheme } from "../../src/lib/TweaksContext";
import { radii, text, type } from "../../src/lib/theme";

type Slot = "from" | "to";

export default function PlanScreen() {
  const colours = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { start } = useJourney();

  const [fromCode, setFromCode] = useState<string | null>(null);
  const [toCode, setToCode] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<Slot | null>(null);

  const fromStation = fromCode ? stationByCode(fromCode) : null;
  const toStation = toCode ? stationByCode(toCode) : null;
  const route = useMemo(
    () => (fromCode && toCode ? findRoute(fromCode, toCode) : null),
    [fromCode, toCode],
  );
  // The "All stations" browser becomes irrelevant once both ends are
  // picked — there's nowhere left to put a new tap.
  const bothFilled = Boolean(fromCode && toCode);

  // Picking from the "All stations" list always lands in the first empty
  // slot (From if empty, otherwise To). The picker sheet is explicit
  // about its slot, so this only governs the inline list flow.
  const targetSlot: Slot = fromCode ? "to" : "from";
  const targetLabel = targetSlot === "from" ? "From" : "To";

  function pickStation(s: Station, slot?: Slot) {
    const useSlot = slot ?? targetSlot;
    if (useSlot === "from") setFromCode(s.code);
    else setToCode(s.code);
  }

  function swap() {
    const a = fromCode;
    setFromCode(toCode);
    setToCode(a);
  }

  function go() {
    if (!route || !fromCode || !toCode) return;
    start(route, fromCode, toCode);
    router.push("/journey");
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <JourneyBanner />

        <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 }}>
          <Text style={{ ...text.largeTitle, color: colours.fg }}>Plan</Text>
          <Text
            style={{
              ...text.subheadline,
              color: colours.fgMuted,
              marginTop: 4,
            }}
          >
            Pick where you're starting and where you're heading.
          </Text>
        </View>

        {/* From / To input card */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View
            style={{
              borderRadius: radii.card,
              backgroundColor: colours.surface,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
              overflow: "hidden",
            }}
          >
            <SlotRow
              label="From"
              station={fromStation}
              onPick={() => setPickerOpen("from")}
              onClear={() => setFromCode(null)}
            />
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                marginLeft: 56,
                backgroundColor: colours.divider,
              }}
            />
            <SlotRow
              label="To"
              station={toStation}
              onPick={() => setPickerOpen("to")}
              onClear={() => setToCode(null)}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingTop: 8,
            }}
          >
            <Button
              label="Swap"
              variant="ghost"
              size="sm"
              tone="accent"
              disabled={!fromCode && !toCode}
              onPress={swap}
              leading={
                <SoftIcon
                  name="swap"
                  size={14}
                  color={colours.accent}
                  strokeWidth={2}
                />
              }
            />
          </View>
        </View>

        {/* Start journey CTA — only when both slots are filled, sits ABOVE
            the browse list so it's the first thing the user reaches once
            they've picked their two stations. */}
        {bothFilled && route && (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Button
              label={`Start journey · ${Math.round(routeDurationSeconds(route) / 60)} min${
                route.transfers > 0
                  ? ` · ${route.transfers} change${route.transfers > 1 ? "s" : ""}`
                  : ""
              }`}
              onPress={go}
              size="lg"
              fullWidth
              leading={<SoftIcon name="navigate" size={18} color="#FFFFFF" />}
            />
          </View>
        )}

        {/* No-route helper — both ends set but findRoute returned null.
            Typically only fires when the user picks the same station for
            both ends. */}
        {bothFilled && !route && (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <Text style={{ ...text.footnote, color: colours.fgMuted, textAlign: "center" }}>
              We couldn't find a route from {fromStation?.name} to {toStation?.name}.
            </Text>
          </View>
        )}

        {/* Search affordance + browse list — hidden once the plan has
            both ends filled (nothing left to add). The search opens a
            dedicated sheet rather than filtering the inline list, so
            text search and visual browsing stay separate intents. */}
        {!bothFilled && (
          <>
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <Pressable
                onPress={() => setPickerOpen(targetSlot)}
                accessibilityLabel={`Search stations to set ${targetLabel}`}
              >
                {/* Read-only SearchPill — tapping it opens the picker
                    sheet rather than focusing an inline input. The
                    pointerEvents wrapper makes the whole pill an
                    affordance for the Pressable above it. */}
                <View pointerEvents="none">
                  <SearchPill placeholder="Search stations" width="100%" />
                </View>
              </Pressable>
            </View>

            <View style={{ paddingTop: 24 }}>
              <Text
                style={{
                  paddingHorizontal: 20,
                  paddingBottom: 8,
                  ...text.footnote,
                  fontWeight: "600",
                  color: colours.fgMuted,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                Tap to add as {targetLabel}
              </Text>
              <View
                style={{
                  marginHorizontal: 16,
                  borderRadius: radii.card,
                  backgroundColor: colours.surface,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                  overflow: "hidden",
                }}
              >
                {allStations()
                  .filter((s) => s.code !== fromCode && s.code !== toCode)
                  .map((s, i, arr) => {
                    const isLast = i === arr.length - 1;
                    return (
                      <View key={s.code}>
                        <Pressable
                          onPress={() => pickStation(s)}
                          accessibilityLabel={`Add ${s.name} as ${targetLabel}`}
                          style={({ pressed }) => ({
                            minHeight: 48,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            opacity: pressed ? 0.55 : 1,
                          })}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{ ...text.body, color: colours.fg }} numberOfLines={1}>
                              {s.name}
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                                marginTop: 3,
                              }}
                            >
                              <LineStrip lines={s.lines} size={7} gap={3} />
                              {s.zone != null && (
                                <Text style={{ ...text.footnote, color: colours.fgMuted }}>
                                  Zone {s.zone}
                                </Text>
                              )}
                            </View>
                          </View>
                          <AddBadge label={targetLabel} colour={colours.accent} />
                        </Pressable>
                        {!isLast && (
                          <View
                            pointerEvents="none"
                            style={{
                              marginLeft: 16,
                              height: StyleSheet.hairlineWidth,
                              backgroundColor: colours.divider,
                            }}
                          />
                        )}
                      </View>
                    );
                  })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <StationPickerSheet
        visible={pickerOpen !== null}
        title={pickerOpen === "from" ? "Pick starting station" : "Pick destination"}
        excludeCodes={[fromCode, toCode].filter((c): c is string => Boolean(c))}
        onClose={() => setPickerOpen(null)}
        onPick={(s) => {
          if (pickerOpen) pickStation(s, pickerOpen);
          setPickerOpen(null);
        }}
      />
    </View>
  );
}

function AddBadge({ label, colour }: { label: string; colour: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: `${colour}1F`,
      }}
    >
      <Text
        style={{
          fontFamily: type.sansSemi,
          fontWeight: "600",
          fontSize: 12,
          color: colour,
        }}
      >
        + {label}
      </Text>
    </View>
  );
}

function SlotRow({
  label,
  station,
  onPick,
  onClear,
}: {
  label: string;
  // Accept undefined too — `stationByCode` returns `Station | undefined`
  // for unknown codes, and callers pass the raw value through.
  station: Station | null | undefined;
  onPick: () => void;
  onClear: () => void;
}) {
  const colours = useTheme();
  return (
    <Pressable
      onPress={onPick}
      accessibilityLabel={`Pick ${label} station`}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View
        style={{
          width: 28,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: station ? colours.accent : colours.fgFaint,
            backgroundColor: station ? colours.accent : "transparent",
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ ...text.caption1, color: colours.fgMuted }}>{label}</Text>
        <Text
          style={{
            ...text.body,
            color: station ? colours.fg : colours.fgSubtle,
            marginTop: 1,
          }}
          numberOfLines={1}
        >
          {station ? station.name : "Pick a station"}
        </Text>
      </View>
      {station ? (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onClear();
          }}
          hitSlop={10}
          style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.55 : 1 })}
          accessibilityLabel={`Clear ${label}`}
        >
          <Icon name="close" size={16} color={colours.fgMuted} />
        </Pressable>
      ) : (
        <Icon name="chevron-right" size={16} color={colours.fgFaint} />
      )}
    </Pressable>
  );
}
