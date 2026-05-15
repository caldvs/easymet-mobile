import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Icon } from "../src/components/Icon";
import { Screen } from "../src/components/Screen";
import { Button } from "../src/components/soft/Button";
import { Pill } from "../src/components/soft/Pill";
import { SoftCard } from "../src/components/soft/SoftCard";
import { type Tone } from "../src/components/soft/tokens";
import { useDisruptions } from "../src/lib/DisruptionsContext";
import { useDismissedAnnouncements } from "../src/lib/DismissedAnnouncementsContext";
import {
  groupedForAnnouncements,
  type Disruption,
  type DisruptionSeverity,
} from "../src/lib/disruptions";
import { stationByCode } from "../src/lib/stations";
import { useTheme } from "../src/lib/TweaksContext";
import { text, type } from "../src/lib/theme";

const SEVERITY_COLOUR: Record<DisruptionSeverity, string> = {
  severe: "#FF3B30",
  notice: "#F2C14E",
  info: "#888888",
};

const SEVERITY_LABEL: Record<DisruptionSeverity, string> = {
  severe: "Severe",
  notice: "Notice",
  info: "Info",
};

export default function AnnouncementsScreen() {
  const router = useRouter();
  const colours = useTheme();
  const { disruptions } = useDisruptions();
  const { isDismissed, dismiss, dismissAll, restore } = useDismissedAnnouncements();

  // Partition the feed: active (undismissed) vs acknowledged (dismissed).
  // Then group active into Right-now / Coming-up via the existing helper.
  const { activeNow, comingUp, acknowledged } = useMemo(() => {
    const active = disruptions.filter((d) => !isDismissed(d.id));
    const dismissedList = disruptions.filter((d) => isDismissed(d.id));
    const { active: a, upcoming: u } = groupedForAnnouncements(active);
    return { activeNow: a, comingUp: u, acknowledged: dismissedList };
  }, [disruptions, isDismissed]);

  const totalActive = activeNow.length + comingUp.length;
  const [acknowledgedExpanded, setAcknowledgedExpanded] = useState(false);

  return (
    <Screen>
      {/* Header: back + title + "Dismiss all" action */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
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
          accessibilityLabel="Back"
        >
          <Icon name="back" size={22} color={colours.accent} />
          <Text style={{ ...text.body, color: colours.accent }}>Back</Text>
        </Pressable>
        {totalActive > 0 && (
          <Pressable
            onPress={() => dismissAll([...activeNow, ...comingUp].map((d) => d.id))}
            hitSlop={8}
            style={({ pressed }) => ({
              padding: 10,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <Text style={{ ...text.body, color: colours.accent }}>Dismiss all</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ ...text.largeTitle, color: colours.fg }}>Updates</Text>
          {disruptions.length > 0 && (
            <Text
              style={{
                ...text.subheadline,
                color: colours.fgMuted,
                marginTop: 4,
              }}
            >
              {activeNow.length} happening now · {comingUp.length} coming up
              {acknowledged.length > 0
                ? ` · ${acknowledged.length} acknowledged`
                : ""}
            </Text>
          )}
        </View>

        {totalActive === 0 && acknowledged.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={{ gap: 24 }}>
            {activeNow.length > 0 && (
              <Section title="Happening now" accent="#FF3B30" tone="alert">
                {activeNow.map((d) => (
                  <DisruptionCard key={d.id} d={d} onDismiss={() => dismiss(d.id)} />
                ))}
              </Section>
            )}
            {comingUp.length > 0 && (
              <Section title="Coming up" accent={colours.accent} tone="calendar">
                {comingUp.map((d) => (
                  <DisruptionCard key={d.id} d={d} onDismiss={() => dismiss(d.id)} />
                ))}
              </Section>
            )}
            {acknowledged.length > 0 && (
              <AcknowledgedSection
                items={acknowledged}
                expanded={acknowledgedExpanded}
                onToggle={() => setAcknowledgedExpanded((e) => !e)}
                onRestore={(id) => restore(id)}
              />
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function Section({
  title,
  accent,
  tone,
  children,
}: {
  title: string;
  accent: string;
  tone: "alert" | "calendar";
  children: React.ReactNode;
}) {
  const colours = useTheme();
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 20,
          paddingBottom: 10,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: accent,
          }}
        />
        <Text
          style={{
            ...text.title2,
            fontWeight: "700",
            color: colours.fg,
          }}
        >
          {title}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>{children}</View>
    </View>
  );
}

// Map TfGM disruption severities to soft Tone semantics. Severe → danger,
// notice → warning, info → neutral. Keeping the table at module scope so
// the colour vocabulary is in one obvious place.
const SEVERITY_TONE: Record<DisruptionSeverity, Tone> = {
  severe: "danger",
  notice: "warning",
  info: "neutral",
};

function DisruptionCard({
  d,
  onDismiss,
  acknowledged,
  onRestore,
}: {
  d: Disruption;
  onDismiss?: () => void;
  acknowledged?: boolean;
  onRestore?: () => void;
}) {
  const colours = useTheme();
  const tone = SEVERITY_TONE[d.severity];
  const stations = d.affectedStationCodes
    .map((c) => stationByCode(c))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const rawStops = d.stopsRaw.filter((s) => s.toLowerCase() !== "all");
  const dateBadge = formatDateBadge(d);

  return (
    <SoftCard style={{ opacity: acknowledged ? 0.6 : 1 }}>
      {/* Severity row — soft Pill replaces the hand-rolled dot + uppercase
          label. "Planned" stays as a muted inline annotation since it's
          orthogonal to severity (planned works can be severe or notice). */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <Pill label={SEVERITY_LABEL[d.severity]} tone={tone} />
        {d.type === "planned-works" && (
          <Text
            style={{
              ...text.caption2,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              color: colours.fgMuted,
            }}
          >
            · Planned
          </Text>
        )}
      </View>

      <Text style={{ ...text.headline, color: colours.fg, marginBottom: 6 }}>
        {d.title}
      </Text>

      {dateBadge && (
        <Text style={{ ...text.footnote, color: colours.fgMuted, marginBottom: 8 }}>
          {dateBadge}
        </Text>
      )}

      <Text style={{ ...text.subheadline, color: colours.fg, lineHeight: 21 }}>
        {d.body}
      </Text>

      {(stations.length > 0 || rawStops.length > 0) && (
        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          {stations.length > 0
            ? stations.slice(0, 10).map((s) => <Chip key={s.code} label={s.name} />)
            : rawStops.slice(0, 10).map((name) => <Chip key={name} label={name} />)}
          {stations.length > 10 && (
            <Chip label={`+${stations.length - 10} more`} muted />
          )}
        </View>
      )}

      <View
        style={{
          marginTop: 14,
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <Button
          label={acknowledged ? "Restore" : "Dismiss"}
          variant="ghost"
          size="sm"
          tone="accent"
          onPress={acknowledged ? onRestore : onDismiss}
        />
      </View>
    </SoftCard>
  );
}

function AcknowledgedSection({
  items,
  expanded,
  onToggle,
  onRestore,
}: {
  items: Disruption[];
  expanded: boolean;
  onToggle: () => void;
  onRestore: (id: string) => void;
}) {
  const colours = useTheme();
  return (
    <View>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 20,
          paddingVertical: 10,
          opacity: pressed ? 0.55 : 1,
        })}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colours.fgFaint,
          }}
        />
        <Text
          style={{
            ...text.title2,
            fontWeight: "700",
            color: colours.fgMuted,
            flex: 1,
          }}
        >
          Acknowledged
        </Text>
        <Text style={{ ...text.footnote, color: colours.fgMuted }}>
          {items.length}
        </Text>
        <Icon
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colours.fgMuted}
        />
      </Pressable>
      {expanded && (
        <View style={{ paddingHorizontal: 16, gap: 12, paddingTop: 4 }}>
          {items.map((d) => (
            <DisruptionCard
              key={d.id}
              d={d}
              acknowledged
              onRestore={() => onRestore(d.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function Chip({ label, muted = false }: { label: string; muted?: boolean }) {
  const colours = useTheme();
  return (
    <Text
      style={{
        ...text.caption2,
        color: muted ? colours.fgFaint : colours.fgMuted,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.04)",
      }}
    >
      {label}
    </Text>
  );
}

function EmptyState() {
  const colours = useTheme();
  return (
    <View style={{ paddingHorizontal: 30, paddingTop: 40, alignItems: "center" }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "rgba(34,160,107,0.18)",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#22A06B",
          }}
        />
      </View>
      <Text style={{ ...text.headline, color: colours.fg }}>
        Good service across the network
      </Text>
      <Text
        style={{
          ...text.footnote,
          color: colours.fgMuted,
          textAlign: "center",
          marginTop: 4,
        }}
      >
        No disruptions, engineering works, or notices to report right now.
      </Text>
    </View>
  );
}

function formatDateBadge(d: Disruption): string | null {
  if (!d.startsAt && !d.endsAt) return null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Europe/London",
    });
  if (d.startsAt && d.endsAt) return `${fmt(d.startsAt)} — ${fmt(d.endsAt)}`;
  if (d.startsAt) return `From ${fmt(d.startsAt)}`;
  return null;
}
