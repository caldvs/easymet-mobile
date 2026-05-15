import { Pressable, ScrollView, Text, View } from "react-native";
import { useDemoMode } from "../lib/DemoMode";
import { useTheme, useTweaks } from "../lib/TweaksContext";
import { useUser } from "../lib/UserContext";
import { ACCENTS, type AccentId, microLabel, type } from "../lib/theme";
import { SegmentedControl } from "./soft/SegmentedControl";
import { SoftModal } from "./soft/Modal";
import { Switch } from "./soft/Switch";
import { TextField } from "./soft/TextField";

// Developer-facing tweaks bottom sheet. Was 380 lines of hand-rolled
// Modal + Animated translateY + segmented controls + toggle switches.
// Now uses the soft kit's SoftModal chassis + SegmentedControl + Switch
// for everything except the bespoke "Scenario" picker (which has per-
// option hint text the kit doesn't surface) and the AccentRow (which
// uses the app's existing `ACCENTS` palette directly).
export function TweaksPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const tweaks = useTweaks();

  return (
    <SoftModal visible={visible} onClose={onClose} position="bottom" title="Tweaks">
      <ScrollView style={{ flexGrow: 0, maxHeight: 520 }}>
        <Section label="You">
          <NameRow />
        </Section>

        <Section label="Theme">
          <Row label="Mode">
            <SegmentedControl
              value={tweaks.theme}
              onChange={(v) => tweaks.setTheme(v)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </Row>
          <AccentRow current={tweaks.accent} onChange={tweaks.setAccent} />
        </Section>

        <Section label="Departures">
          <Row label="Time format">
            <SegmentedControl
              value={tweaks.timeFormat}
              onChange={(v) => tweaks.setTimeFormat(v)}
              options={[
                { value: "mins", label: "Minutes" },
                { value: "clock", label: "Clock" },
              ]}
            />
          </Row>
          <Row label="Dense rows">
            <Switch value={tweaks.dense} onChange={tweaks.setDense} />
          </Row>
        </Section>

        <Section label="Developer">
          <ScenarioRow />
        </Section>
      </ScrollView>
    </SoftModal>
  );
}

// Local helpers — kept because they hook into context the soft kit
// doesn't know about (the app's microLabel preference, the bespoke
// per-scenario hint text, etc.).

function NameRow() {
  const { name, setName } = useUser();
  return (
    <View style={{ paddingHorizontal: 4, paddingVertical: 4 }}>
      <TextField
        value={name}
        onChangeText={setName}
        placeholder="Your name (for the greeting)"
      />
    </View>
  );
}

function ScenarioRow() {
  const colours = useTheme();
  const { scenario, setScenario } = useDemoMode();
  const options = [
    { id: "live", label: "Live", hint: "Real edge fetches" },
    { id: "demo", label: "Demo", hint: "Bundled peak-hour snapshot" },
    { id: "empty", label: "No trams", hint: "Empty departures everywhere" },
    { id: "down", label: "Service down", hint: "Simulate edge failure" },
  ] as const;
  return (
    <View style={{ paddingHorizontal: 4, paddingVertical: 4, gap: 8 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => {
          const active = scenario === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => setScenario(o.id)}
              accessibilityLabel={`Scenario: ${o.label}`}
              style={({ pressed }) => ({
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: active ? colours.fg : colours.surfaceFillChrome,
                borderWidth: 0.5,
                borderColor: active ? colours.fg : colours.chromeBorder,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: type.sansMedium,
                  fontWeight: "500",
                  fontSize: 13,
                  color: active ? "#fff" : colours.fg,
                }}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ fontFamily: type.sans, fontSize: 12, color: colours.fgMuted }}>
        {options.find((o) => o.id === scenario)?.hint ?? ""}
      </Text>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const colours = useTheme();
  const { softUI } = useTweaks();
  const labelStyle = microLabel(softUI);
  return (
    <View style={{ marginTop: 12 }}>
      <Text
        style={{
          paddingHorizontal: 4,
          paddingBottom: 8,
          fontSize: softUI ? 13 : 11,
          color: colours.fgSubtle,
          ...labelStyle,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const colours = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 4,
        paddingVertical: 10,
      }}
    >
      <Text style={{ fontFamily: type.sansMedium, fontWeight: "500", fontSize: 14, color: colours.fg }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function AccentRow({
  current,
  onChange,
}: {
  current: AccentId;
  onChange: (id: AccentId) => void;
}) {
  const colours = useTheme();
  const ids = Object.keys(ACCENTS) as AccentId[];
  return (
    <Row label="Accent">
      <View style={{ flexDirection: "row", gap: 8 }}>
        {ids.map((id) => {
          const active = id === current;
          return (
            <Pressable
              key={id}
              onPress={() => onChange(id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: ACCENTS[id].fg,
                borderWidth: active ? 2 : 0.5,
                borderColor: active ? colours.fg : colours.surfaceBorder,
              }}
              accessibilityLabel={ACCENTS[id].name}
            />
          );
        })}
      </View>
    </Row>
  );
}
