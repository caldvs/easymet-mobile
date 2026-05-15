// Sub-pages reached from drill-down rows in the EasyMet Account story.
// Each one is a self-contained screen that demonstrates how the soft-UI
// kit composes for a real navigation target — every drill row in the
// Account spike now has somewhere to go.
//
// Pages in this file:
//   1. Station picker  — used by Home station + Work station rows
//   2. Pinned stations — manage + reorder pins
//   3. Travel history  — recent journeys + clear

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BackdropOrbs } from "../BackdropOrbs";
import { CORRIDORS } from "../../lib/lines";
import { allStations, type Station } from "../../lib/stations";
import { Banner } from "./Banner";
import { Button } from "./Button";
import { pressFeedback, minTouch } from "./interaction";
import { ListRow, ListRowGroup } from "./ListRow";
import { Pill } from "./Pill";
import { SearchPill } from "./SearchPill";
import { SegmentedControl } from "./SegmentedControl";
import { SoftCard } from "./SoftCard";
import { SoftIcon } from "./SoftIcon";
import { soft } from "./tokens";

const DEVICE_W = 402;
const DEVICE_H = 874;
const PHONE_BG = "#F4F4FB";

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        width: DEVICE_W,
        height: DEVICE_H,
        backgroundColor: PHONE_BG,
        overflow: "hidden",
        borderRadius: 28,
        ...soft.shadow.chassis,
      }}
    >
      <BackdropOrbs />
      {children}
    </View>
  );
}

// Reusable page header — back chevron, title, optional trailing button.
// Modelled on the iOS large-title bar but lives on the soft canvas, not
// chrome surface, so it disappears against the orbs nicely.
function Header({
  title,
  trailing,
  onBack,
}: {
  title: string;
  trailing?: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
      }}
    >
      <Pressable
        onPress={onBack}
        style={(state) => ({
          width: minTouch,
          height: minTouch,
          borderRadius: minTouch / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: soft.surface,
          ...soft.shadow.pill,
          ...pressFeedback(state),
        })}
      >
        <SoftIcon name="chevronLeft" size={18} color={soft.text} strokeWidth={2} />
      </Pressable>
      <Text
        style={{
          flex: 1,
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 20,
          fontWeight: "700",
          letterSpacing: -0.3,
          marginLeft: 4,
        }}
      >
        {title}
      </Text>
      {trailing}
    </View>
  );
}

const meta: Meta = {
  title: "Soft UI/Sample pages",
  parameters: { softKit: true },
};
export default meta;
type Story = StoryObj;

// =====================================================================
// 1. Station picker — drilled into from "Home station" / "Work station"
// =====================================================================
//
// EasyMet has ~99 Metrolink stations across 8 corridors. The picker
// composes search + corridor filter + grouped list with a coloured
// corridor dot per row. Selection is single-pick; tapping a row shows
// the chosen station as a confirmation card at the top.

export const StationPicker: Story = {
  name: "EasyMet · Station picker",
  render: () => {
    const [query, setQuery] = useState("");
    const [corridor, setCorridor] = useState<string | "all">("all");
    const [selected, setSelected] = useState<Station | null>(null);

    const stations = useMemo(() => allStations(), []);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      return stations
        .filter((s) =>
          corridor === "all" ? true : s.corridor === corridor,
        )
        .filter((s) => (q ? s.name.toLowerCase().includes(q) : true))
        .sort((a, b) => a.name.localeCompare(b.name));
    }, [stations, corridor, query]);

    return (
      <Phone>
        <View style={{ flex: 1 }}>
          <Header title="Home station" />

          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <SearchPill
              placeholder="Search stations"
              width={DEVICE_W - 32}
              value={query}
              onChangeText={setQuery}
            />

            {/* Corridor filter — horizontal pill row. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            >
              <CorridorChip
                label="All lines"
                active={corridor === "all"}
                onPress={() => setCorridor("all")}
              />
              {(Object.keys(CORRIDORS) as Array<keyof typeof CORRIDORS>).map((c) => (
                <CorridorChip
                  key={c}
                  label={CORRIDORS[c].displayName}
                  colour={CORRIDORS[c].colour}
                  active={corridor === c}
                  onPress={() => setCorridor(c)}
                />
              ))}
            </ScrollView>

            {selected && (
              <SoftCard
                title={selected.name}
                subtitle={`${CORRIDORS[selected.corridor as keyof typeof CORRIDORS]?.displayName ?? selected.corridor} line`}
                leadingIcon="home"
                headerTrailing={
                  <Pill label="Selected" tone="success" leadingIcon="check" />
                }
              />
            )}
          </View>

          {/* Grouped result list */}
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              gap: 8,
              paddingBottom: 32,
            }}
          >
            <Text
              style={{
                fontFamily: soft.font.family,
                color: soft.textMuted,
                fontSize: 12,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginLeft: 4,
                marginBottom: 4,
              }}
            >
              {filtered.length} {filtered.length === 1 ? "station" : "stations"}
            </Text>

            <ListRowGroup>
              {filtered.slice(0, 30).map((s) => (
                <StationRow
                  key={s.code}
                  station={s}
                  selected={selected?.code === s.code}
                  onPress={() => setSelected(s)}
                />
              ))}
            </ListRowGroup>

            {filtered.length > 30 && (
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.textFaint,
                  fontSize: 12,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                +{filtered.length - 30} more · refine your search
              </Text>
            )}
          </ScrollView>
        </View>
      </Phone>
    );
  },
};

// Helper: coloured-dot corridor filter chip. Active state lifts to white,
// idle state is the inset chip. Reused for the chip strip at the top.
function CorridorChip({
  label,
  colour,
  active,
  onPress,
}: {
  label: string;
  colour?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={(state) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: soft.radii.pill,
        backgroundColor: active ? soft.surface : soft.surfaceInset,
        ...(active ? soft.shadow.pill : null),
        ...pressFeedback(state),
      })}
    >
      {colour && (
        <View
          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colour }}
        />
      )}
      <Text
        style={{
          fontFamily: soft.font.family,
          color: active ? soft.text : soft.textMuted,
          fontSize: 13,
          fontWeight: "600",
          letterSpacing: -0.05,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Single station row — coloured-dot leading icon for its primary
// corridor, name + zone, check mark when picked.
function StationRow({
  station,
  selected,
  onPress,
}: {
  station: Station;
  selected: boolean;
  onPress: () => void;
}) {
  const corridor = CORRIDORS[station.corridor as keyof typeof CORRIDORS];
  const dot = corridor?.colour ?? soft.divider;
  return (
    <ListRow
      leading={
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: `${dot}22`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot }}
          />
        </View>
      }
      title={station.name}
      subtitle={
        station.zone ? `Zone ${station.zone} · ${station.platforms} platforms` : undefined
      }
      trailing={
        selected ? (
          <SoftIcon name="check" size={18} color={soft.accent} strokeWidth={2.5} />
        ) : undefined
      }
      onPress={onPress}
      showChevron={false}
    />
  );
}

// =====================================================================
// 2. Pinned stations — drilled into from "Pinned stations · 6 pinned"
// =====================================================================
//
// Manage which stations appear at the top of Home. Each pin can be
// removed; the row itself shows reorder grips. The hint at the top
// explains the affordance.

export const PinnedStations: Story = {
  name: "EasyMet · Pinned stations",
  render: () => {
    const [pins, setPins] = useState([
      "Cornbrook",
      "St Peter's Square",
      "Manchester Airport",
      "Trafford Bar",
      "Altrincham",
      "Piccadilly",
    ]);

    const move = (i: number, delta: -1 | 1) => {
      const j = i + delta;
      if (j < 0 || j >= pins.length) return;
      setPins((xs) => {
        const next = xs.slice();
        const tmp = next[i]!;
        next[i] = next[j]!;
        next[j] = tmp;
        return next;
      });
    };

    const remove = (name: string) =>
      setPins((xs) => xs.filter((x) => x !== name));

    return (
      <Phone>
        <View style={{ flex: 1 }}>
          <Header
            title="Pinned stations"
            trailing={
              <Button label="Add" variant="soft" size="sm" leading={<SoftIcon name="plus" size={14} color={soft.accent} />} />
            }
          />
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
          >
            <Banner
              tone="accent"
              title="Tap up / down to reorder"
              description="Pinned stations show on Home in this order. Drag-and-drop is coming on native."
            />

            <ListRowGroup>
              {pins.map((p, i) => (
                <ListRow
                  key={p}
                  leadingIcon="star"
                  title={p}
                  subtitle={i === 0 ? "First on Home" : `Position ${i + 1}`}
                  trailing={
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <ReorderButton
                        direction="up"
                        disabled={i === 0}
                        onPress={() => move(i, -1)}
                      />
                      <ReorderButton
                        direction="down"
                        disabled={i === pins.length - 1}
                        onPress={() => move(i, 1)}
                      />
                      <Pressable
                        onPress={() => remove(p)}
                        style={(state) => ({
                          width: minTouch,
                          height: minTouch,
                          alignItems: "center",
                          justifyContent: "center",
                          ...pressFeedback(state),
                        })}
                      >
                        <SoftIcon name="trash" size={16} color={soft.tone.danger.fg} />
                      </Pressable>
                    </View>
                  }
                  showChevron={false}
                />
              ))}
            </ListRowGroup>

            {pins.length === 0 && (
              <SoftCard>
                <Text
                  style={{
                    fontFamily: soft.font.family,
                    color: soft.textMuted,
                    fontSize: 14,
                    textAlign: "center",
                    paddingVertical: 12,
                  }}
                >
                  No pinned stations yet. Tap Add to pick some.
                </Text>
              </SoftCard>
            )}
          </ScrollView>
        </View>
      </Phone>
    );
  },
};

function ReorderButton({
  direction,
  disabled,
  onPress,
}: {
  direction: "up" | "down";
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={(state) => ({
        width: minTouch - 8,
        height: minTouch - 8,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.3 : 1,
        ...(disabled ? null : pressFeedback(state)),
      })}
    >
      <SoftIcon
        name={direction === "up" ? "chevronUp" : "chevronDown"}
        size={14}
        color={soft.text}
        strokeWidth={2}
      />
    </Pressable>
  );
}

// =====================================================================
// 3. Travel history — drilled into from "Clear travel history"
// =====================================================================
//
// Recent journeys with a filter strip + per-journey row. Empty state
// after clearing. Real-time-ago labels make this feel current rather
// than archival.

type Trip = {
  from: string;
  to: string;
  when: string;
  duration: string;
  status: "ok" | "delay" | "cancel";
};

const SAMPLE_TRIPS: Trip[] = [
  { from: "Cornbrook", to: "St Peter's Square", when: "Today · 08:42", duration: "12 min", status: "ok" },
  { from: "St Peter's Square", to: "Cornbrook", when: "Today · 17:55", duration: "12 min", status: "delay" },
  { from: "Cornbrook", to: "Manchester Airport", when: "Yesterday · 09:10", duration: "38 min", status: "ok" },
  { from: "Cornbrook", to: "Altrincham", when: "Tuesday · 18:24", duration: "18 min", status: "ok" },
  { from: "Cornbrook", to: "Trafford Centre", when: "Sunday · 13:08", duration: "9 min", status: "cancel" },
  { from: "Trafford Bar", to: "Piccadilly", when: "23 May · 09:02", duration: "14 min", status: "ok" },
];

export const TravelHistory: Story = {
  name: "EasyMet · Travel history",
  render: () => {
    const [scope, setScope] = useState<"week" | "month" | "all">("month");
    const [trips, setTrips] = useState<Trip[]>(SAMPLE_TRIPS);

    return (
      <Phone>
        <View style={{ flex: 1 }}>
          <Header
            title="Travel history"
            trailing={
              <Button
                label="Clear"
                variant="ghost"
                tone="danger"
                size="sm"
                onPress={() => setTrips([])}
              />
            }
          />
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 14 }}
          >
            <SegmentedControl
              fullWidth
              value={scope}
              onChange={setScope}
              options={[
                { value: "week", label: "This week" },
                { value: "month", label: "This month" },
                { value: "all", label: "All time" },
              ]}
            />

            <SoftCard>
              <View style={{ flexDirection: "row" }}>
                <Stat value={`${trips.length}`} label="Trips" />
                <Divider />
                <Stat value="6h 12m" label="On trams" />
                <Divider />
                <Stat value="74 km" label="Distance" />
              </View>
            </SoftCard>

            {trips.length === 0 ? (
              <SoftCard>
                <View style={{ alignItems: "center", gap: 8, paddingVertical: 16 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: soft.surfaceInset,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SoftIcon name="trash" size={22} color={soft.textMuted} />
                  </View>
                  <Text
                    style={{
                      fontFamily: soft.font.family,
                      color: soft.text,
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Travel history cleared
                  </Text>
                  <Text
                    style={{
                      fontFamily: soft.font.family,
                      color: soft.textMuted,
                      fontSize: 13,
                      textAlign: "center",
                      maxWidth: 280,
                    }}
                  >
                    New journeys will appear here as you take them. We don't keep
                    anything you don't ask us to.
                  </Text>
                </View>
              </SoftCard>
            ) : (
              <ListRowGroup>
                {trips.map((t, i) => (
                  <ListRow
                    key={i}
                    leading={
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          backgroundColor:
                            t.status === "ok"
                              ? soft.tone.success.tint
                              : t.status === "delay"
                              ? soft.tone.warning.tint
                              : soft.tone.danger.tint,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <SoftIcon
                          name={
                            t.status === "ok"
                              ? "check"
                              : t.status === "delay"
                              ? "clock"
                              : "errorOctagon"
                          }
                          size={16}
                          color={
                            t.status === "ok"
                              ? soft.tone.success.fg
                              : t.status === "delay"
                              ? soft.tone.warning.fg
                              : soft.tone.danger.fg
                          }
                          strokeWidth={2}
                        />
                      </View>
                    }
                    title={`${t.from} → ${t.to}`}
                    subtitle={`${t.when} · ${t.duration}`}
                    onPress={() => {}}
                  />
                ))}
              </ListRowGroup>
            )}
          </ScrollView>
        </View>
      </Phone>
    );
  },
};

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}>
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.text,
          fontSize: 18,
          fontWeight: "700",
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.textMuted,
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={{ width: 1, backgroundColor: soft.divider, marginVertical: 4 }} />;
}
