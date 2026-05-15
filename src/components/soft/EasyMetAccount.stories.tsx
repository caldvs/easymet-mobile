// Spike: an EasyMet-specific user settings page built entirely with the
// soft-UI kit. Distinct from the generic "Settings" sample in that it
// surfaces the controls that matter for a Metrolink rider: home/work
// stations, per-corridor service alerts, live-journey notifications,
// step-free routing, the app's existing theme/accent/time-format tweaks,
// and the standard privacy/support tail.
//
// Sections shipped:
//   1. Identity card
//   2. Travel preferences
//   3. Service alerts (per Metrolink corridor)
//   4. Journey notifications
//   5. Display (maps to TweaksContext: theme / accent / timeFormat)
//   6. Accessibility
//   7. Privacy & data
//   8. Support (rate / about / privacy policy)
//   9. Sign out

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BackdropOrbs } from "../BackdropOrbs";
import { CORRIDORS, type CorridorName } from "../../lib/lines";
import { ACCENTS, type AccentId } from "../../lib/theme";
import { Avatar } from "./Avatar";
import { Banner } from "./Banner";
import { Button } from "./Button";
import { ListRow, ListRowGroup } from "./ListRow";
import { Pill } from "./Pill";
import { SegmentedControl } from "./SegmentedControl";
import { SoftCard } from "./SoftCard";
import { SoftIcon } from "./SoftIcon";
import { Stepper } from "./Stepper";
import { Switch } from "./Switch";
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

const meta: Meta = {
  title: "Soft UI/Sample pages",
  parameters: { softKit: true },
};
export default meta;
type Story = StoryObj;

// ---- Section label (kept local — same recipe as the other sample pages)
function SectionLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
      <Text
        style={{
          fontFamily: soft.font.family,
          color: soft.textMuted,
          fontSize: 12,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {children}
      </Text>
      {hint && (
        <Text
          style={{
            fontFamily: soft.font.family,
            color: soft.textFaint,
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
}

// Coloured-dot row used for the per-corridor service-alert toggles.
function CorridorRow({
  corridor,
  value,
  onChange,
}: {
  corridor: CorridorName;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  const c = CORRIDORS[corridor];
  return (
    <ListRow
      leading={
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: `${c.colour}22`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: c.colour,
            }}
          />
        </View>
      }
      title={c.displayName}
      subtitle="Service alerts"
      trailing={<Switch value={value} onChange={onChange} />}
      showChevron={false}
    />
  );
}

// Accent swatch picker — uses the same ACCENTS palette the app's TweaksPanel
// exposes, so this is a real prototype, not a mock.
function AccentPicker({
  value,
  onChange,
}: {
  value: AccentId;
  onChange: (next: AccentId) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      {(Object.keys(ACCENTS) as AccentId[]).map((id) => {
        const fg = ACCENTS[id].fg;
        const active = id === value;
        return (
          <View
            key={id}
            // Using View as the tap target since Pressable styling is
            // already saturated for color swatches; the soft kit's
            // pressFeedback would muddy the colour read.
            onTouchEnd={() => onChange(id)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: fg,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: active ? 3 : 0,
              borderColor: soft.surface,
              ...soft.shadow.pill,
            }}
          >
            {active && <SoftIcon name="check" size={16} color="#FFFFFF" strokeWidth={2.5} />}
          </View>
        );
      })}
    </View>
  );
}

// ---- The page --------------------------------------------------------
export const EasyMetAccount: Story = {
  name: "EasyMet account",
  render: () => {
    // Identity
    const [name] = useState("Callum Davies");
    const [email] = useState("dvscllm@gmail.com");

    // Travel preferences
    const [home] = useState("Cornbrook");
    const [work] = useState("St Peter's Square");
    const [stepFree, setStepFree] = useState(false);
    const [timeFormat, setTimeFormat] = useState<"mins" | "clock">("mins");

    // Service alerts — one switch per corridor. Defaults reflect what a
    // realistic Trafford-based commuter cares about.
    const [alerts, setAlerts] = useState<Record<CorridorName, boolean>>({
      Airport: false,
      Altrincham: true,
      Bury: false,
      "East Manchester": false,
      Eccles: false,
      "Oldham & Rochdale": false,
      "South Manchester": true,
      "Trafford Park": true,
    });
    const setAlert = (k: CorridorName, v: boolean) =>
      setAlerts((m) => ({ ...m, [k]: v }));
    const enabledCount = Object.values(alerts).filter(Boolean).length;

    // Journey notifications
    const [liveActivity, setLiveActivity] = useState(true);
    const [approaching, setApproaching] = useState(true);
    const [approachingMins, setApproachingMins] = useState(3);
    const [quietHours, setQuietHours] = useState(true);

    // Display
    const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
    const [accent, setAccent] = useState<AccentId>("blue");

    // Accessibility
    const [largerText, setLargerText] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    // Privacy
    const [analytics, setAnalytics] = useState(true);

    return (
      <Phone>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              paddingTop: 28,
              paddingHorizontal: 20,
              paddingBottom: 48,
              gap: 16,
            }}
          >
            <Text
              style={{
                fontFamily: soft.font.family,
                color: soft.text,
                fontSize: 28,
                fontWeight: "700",
                letterSpacing: -0.5,
              }}
            >
              Account
            </Text>

            {/* 1. Identity */}
            <SoftCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <Avatar size="lg" name={name} status="online" />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: soft.font.family,
                      color: soft.text,
                      fontSize: 17,
                      fontWeight: "700",
                      letterSpacing: -0.2,
                    }}
                  >
                    {name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: soft.font.family,
                      color: soft.textMuted,
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    {email}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
                    <Pill label="Frequent rider" tone="accent" leadingIcon="navigate" />
                    <Pill label="42 journeys" tone="neutral" leadingIcon="clock" />
                  </View>
                </View>
              </View>
            </SoftCard>

            {/* 2. Travel preferences */}
            <SectionLabel hint="Defaults used by Home and the Plan tab">Travel</SectionLabel>
            <ListRowGroup>
              <ListRow
                leadingIcon="home"
                title="Home station"
                subtitle={home}
                onPress={() => {}}
              />
              <ListRow
                leadingIcon="navigate"
                title="Work station"
                subtitle={work}
                onPress={() => {}}
              />
              <ListRow
                leadingIcon="star"
                title="Pinned stations"
                subtitle="6 pinned · tap to reorder"
                onPress={() => {}}
              />
              <ListRow
                leadingIcon="user"
                title="Step-free routing"
                subtitle="Avoid stairs and escalators"
                trailing={<Switch value={stepFree} onChange={setStepFree} />}
                showChevron={false}
              />
            </ListRowGroup>

            <View style={{ paddingHorizontal: 4, marginTop: 4 }}>
              <Text
                style={{
                  fontFamily: soft.font.family,
                  color: soft.text,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Time format
              </Text>
              <SegmentedControl
                fullWidth
                value={timeFormat}
                onChange={setTimeFormat}
                options={[
                  { value: "mins", label: "Minutes ('2 min')" },
                  { value: "clock", label: "Clock (15:42)" },
                ]}
              />
            </View>

            {/* 3. Service alerts */}
            <SectionLabel hint={`Alerts on ${enabledCount} of 8 lines`}>
              Service alerts
            </SectionLabel>
            <Banner
              tone="accent"
              title="Disruption alerts"
              description="Get a push when a tram on a selected line is delayed, cancelled, or has a planned closure."
            />
            <ListRowGroup>
              {(Object.keys(CORRIDORS) as CorridorName[]).map((c) => (
                <CorridorRow
                  key={c}
                  corridor={c}
                  value={alerts[c]}
                  onChange={(v) => setAlert(c, v)}
                />
              ))}
            </ListRowGroup>

            {/* 4. Journey notifications */}
            <SectionLabel>Journey notifications</SectionLabel>
            <ListRowGroup>
              <ListRow
                leadingIcon="bell"
                title="Live journey activity"
                subtitle="Show on lock screen and Dynamic Island"
                trailing={<Switch value={liveActivity} onChange={setLiveActivity} />}
                showChevron={false}
              />
              <ListRow
                leadingIcon="clock"
                title="Tram approaching"
                subtitle="Push when a planned tram is close"
                trailing={<Switch value={approaching} onChange={setApproaching} />}
                showChevron={false}
              />
              {approaching && (
                <ListRow
                  title="Approaching threshold"
                  subtitle={`Push ${approachingMins} min before arrival`}
                  trailing={
                    <Stepper
                      value={approachingMins}
                      step={1}
                      min={1}
                      max={10}
                      unit="min"
                      onChange={setApproachingMins}
                    />
                  }
                  showChevron={false}
                />
              )}
              <ListRow
                leadingIcon="clock"
                title="Quiet hours"
                subtitle="No pings 23:00 – 06:00"
                trailing={<Switch value={quietHours} onChange={setQuietHours} />}
                showChevron={false}
              />
            </ListRowGroup>

            {/* 5. Display */}
            <SectionLabel>Display</SectionLabel>
            <View
              style={[
                {
                  backgroundColor: soft.surface,
                  borderRadius: soft.radii.card,
                  padding: 14,
                  gap: 14,
                },
                soft.shadow.pill,
              ]}
            >
              <View>
                <Text
                  style={{
                    fontFamily: soft.font.family,
                    color: soft.text,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Theme
                </Text>
                <SegmentedControl
                  fullWidth
                  value={theme}
                  onChange={setTheme}
                  options={[
                    { value: "system", label: "System" },
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontFamily: soft.font.family,
                    color: soft.text,
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Accent
                </Text>
                <AccentPicker value={accent} onChange={setAccent} />
              </View>
            </View>

            {/* 6. Accessibility */}
            <SectionLabel>Accessibility</SectionLabel>
            <ListRowGroup>
              <ListRow
                leadingIcon="info"
                title="Larger text"
                subtitle="Honour iOS Dynamic Type"
                trailing={<Switch value={largerText} onChange={setLargerText} />}
                showChevron={false}
              />
              <ListRow
                leadingIcon="info"
                title="Reduce motion"
                subtitle="Pause the orb backdrop and other animations"
                trailing={<Switch value={reduceMotion} onChange={setReduceMotion} />}
                showChevron={false}
              />
            </ListRowGroup>

            {/* 7. Privacy & data */}
            <SectionLabel>Privacy &amp; data</SectionLabel>
            <ListRowGroup>
              <ListRow
                leadingIcon="location"
                title="Location"
                subtitle="While using the app"
                onPress={() => {}}
              />
              <ListRow
                leadingIcon="trash"
                title="Clear travel history"
                subtitle="128 recent journeys"
                onPress={() => {}}
              />
              <ListRow
                leadingIcon="info"
                title="Crash &amp; usage analytics"
                trailing={<Switch value={analytics} onChange={setAnalytics} />}
                showChevron={false}
              />
              <ListRow
                leadingIcon="mail"
                title="Export my data"
                subtitle="Email a copy of your journeys"
                onPress={() => {}}
              />
            </ListRowGroup>

            {/* 8. Support */}
            <SectionLabel>Support</SectionLabel>
            <ListRowGroup>
              <ListRow leadingIcon="star" title="Rate EasyMet" onPress={() => {}} />
              <ListRow leadingIcon="info" title="About" subtitle="Version 2026.05" onPress={() => {}} />
              <ListRow leadingIcon="lock" title="Privacy policy" onPress={() => {}} />
            </ListRowGroup>

            {/* 9. Sign out + danger */}
            <View style={{ marginTop: 12, gap: 8 }}>
              <Button label="Sign out" variant="soft" tone="neutral" fullWidth />
              <Button label="Delete account" variant="ghost" tone="danger" fullWidth />
            </View>

            <Text
              style={{
                fontFamily: soft.font.family,
                color: soft.textFaint,
                fontSize: 11,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              EasyMet 2026.05 · TfGM data © Transport for Greater Manchester
            </Text>
          </ScrollView>
        </View>
      </Phone>
    );
  },
};
