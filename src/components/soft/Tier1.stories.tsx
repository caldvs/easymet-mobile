// Tier 1 atoms — the universal app components. Every story is hooked up
// to local state so the controls actually do something in the preview.

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Text, View } from "react-native";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Sparkles } from "./GradientButton";
import { SoftModal } from "./Modal";
import { RadioGroup } from "./Radio";
import { SegmentedControl } from "./SegmentedControl";
import { SoftCard } from "./SoftCard";
import { SoftIcon } from "./SoftIcon";
import { Switch } from "./Switch";
import { TextField } from "./TextField";
import { soft } from "./tokens";

const Padded = ({ children }: { children: React.ReactNode }) => (
  <View
    style={{
      padding: 32,
      backgroundColor: soft.canvas,
      alignItems: "flex-start",
      minHeight: 400,
      gap: 16,
    }}
  >
    {children}
  </View>
);

const Caption = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      fontFamily: soft.font.family,
      color: soft.textMuted,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
    }}
  >
    {children}
  </Text>
);

const meta: Meta = {
  title: "Soft UI/Tier 1",
  parameters: { softKit: true },
  decorators: [(Story) => <Padded><Story /></Padded>],
};
export default meta;
type Story = StoryObj;

// Button — every variant + size, and a press counter to show feedback.
export const ButtonStory: Story = {
  name: "Button",
  render: () => {
    const [count, setCount] = useState(0);
    return (
      <View style={{ gap: 16, alignItems: "flex-start" }}>
        <Caption>Variants (accent tone)</Caption>
        <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
          <Button label="Solid" variant="solid" onPress={() => setCount((n) => n + 1)} />
          <Button label="Soft" variant="soft" onPress={() => setCount((n) => n + 1)} />
          <Button label="Outline" variant="outline" onPress={() => setCount((n) => n + 1)} />
          <Button label="Ghost" variant="ghost" onPress={() => setCount((n) => n + 1)} />
        </View>

        <Caption>Tones (soft variant)</Caption>
        <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
          <Button label="Neutral" variant="soft" tone="neutral" />
          <Button label="Accent" variant="soft" tone="accent" />
          <Button label="Success" variant="soft" tone="success" />
          <Button label="Warning" variant="soft" tone="warning" />
          <Button label="Danger" variant="soft" tone="danger" />
        </View>

        <Caption>Sizes</Caption>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          <Button label="Small" size="sm" />
          <Button label="Medium" size="md" />
          <Button label="Large" size="lg" />
        </View>

        <Caption>Gradient + leading / disabled</Caption>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Button label="Ask AI" gradient="askAI" leading={<Sparkles />} />
          <Button label="Book a Call" gradient="bookCall" />
          <Button label="Disabled" disabled />
        </View>
        <Text style={{ fontFamily: soft.font.family, color: soft.textMuted, fontSize: 13 }}>
          Pressed {count}×
        </Text>
      </View>
    );
  },
};

// TextField — full lifecycle: label / placeholder / typing / submit / error / secure.
export const TextFieldStory: Story = {
  name: "TextField",
  render: () => {
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const emailError = email.length > 0 && !email.includes("@") ? "Needs an @" : undefined;
    return (
      <View style={{ gap: 18, maxWidth: 360, alignSelf: "stretch" }}>
        <TextField
          label="Email"
          placeholder="you@example.com"
          leadingIcon="info"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          helper={emailError ? undefined : "We'll never share it"}
        />
        <TextField
          label="Password"
          placeholder="••••••••"
          value={pw}
          onChangeText={setPw}
          secure
        />
      </View>
    );
  },
};

// Switch — flip it. Confirmation text reflects state.
export const SwitchStory: Story = {
  name: "Switch",
  render: () => {
    const [a, setA] = useState(true);
    const [b, setB] = useState(false);
    return (
      <View style={{ gap: 16 }}>
        <Row label={`Notifications · ${a ? "on" : "off"}`}>
          <Switch value={a} onChange={setA} />
        </Row>
        <Row label={`Dark mode · ${b ? "on" : "off"}`}>
          <Switch value={b} onChange={setB} />
        </Row>
        <Row label="Disabled · off">
          <Switch value={false} disabled />
        </Row>
      </View>
    );
  },
};

// Checkbox + Radio.
export const CheckboxAndRadio: Story = {
  name: "Checkbox & Radio",
  render: () => {
    const [picks, setPicks] = useState({ a: true, b: false, c: true });
    const [tier, setTier] = useState<"free" | "pro" | "team">("pro");
    return (
      <View style={{ gap: 24, alignItems: "flex-start" }}>
        <View style={{ gap: 4 }}>
          <Caption>Checkbox</Caption>
          <Checkbox value={picks.a} onChange={(v) => setPicks({ ...picks, a: v })} label="Send me weekly digests" />
          <Checkbox value={picks.b} onChange={(v) => setPicks({ ...picks, b: v })} label="Beta features" />
          <Checkbox value={picks.c} onChange={(v) => setPicks({ ...picks, c: v })} label="Product updates" />
        </View>
        <View style={{ gap: 4 }}>
          <Caption>Radio group</Caption>
          <RadioGroup
            value={tier}
            onChange={setTier}
            options={[
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro · $12/mo" },
              { value: "team", label: "Team · $36/mo" },
            ]}
          />
        </View>
      </View>
    );
  },
};

// Card — header + body, with a press handler so the whole tile is the
// affordance.
export const CardStory: Story = {
  name: "SoftCard",
  render: () => {
    const [opened, setOpened] = useState(0);
    return (
      <View style={{ gap: 12, maxWidth: 360, alignSelf: "stretch" }}>
        <SoftCard
          title="Quarterly revenue"
          subtitle="Up 12% from last quarter"
          leadingIcon="arrowUpRight"
          onPress={() => setOpened((n) => n + 1)}
        >
          <Text
            style={{
              fontFamily: soft.font.family,
              color: soft.textMuted,
              fontSize: 14,
              lineHeight: 22,
            }}
          >
            Click anywhere on the card to drill in. Press feedback runs over
            the whole surface.
          </Text>
        </SoftCard>
        <SoftCard title="Decorative card">
          <Text style={{ color: soft.text }}>No press handler — pure container.</Text>
        </SoftCard>
        <Text style={{ color: soft.textMuted, fontSize: 13, fontFamily: soft.font.family }}>
          Pressed the first card {opened}×
        </Text>
      </View>
    );
  },
};

// Avatar — size scale + status dots + image vs initials vs glyph fallback.
export const AvatarStory: Story = {
  name: "Avatar",
  render: () => (
    <View style={{ gap: 16, alignItems: "flex-start" }}>
      <Caption>Sizes</Caption>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Avatar size="xs" initials="A" />
        <Avatar size="sm" initials="B" />
        <Avatar size="md" initials="C" />
        <Avatar size="lg" initials="D" />
        <Avatar size="xl" initials="E" />
      </View>

      <Caption>Status</Caption>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Avatar name="Ella M." status="online" />
        <Avatar name="Sam P." status="busy" />
        <Avatar name="Kim T." status="away" />
        <Avatar name="Riley J." status="offline" />
      </View>

      <Caption>Glyph fallback (no name / initials)</Caption>
      <Avatar />
    </View>
  ),
};

// Modal — toggle visible from a button trigger.
export const ModalStory: Story = {
  name: "SoftModal",
  render: () => {
    const [center, setCenter] = useState(false);
    const [bottom, setBottom] = useState(false);
    return (
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button label="Open dialog" onPress={() => setCenter(true)} />
        <Button label="Open bottom sheet" variant="soft" onPress={() => setBottom(true)} />

        <SoftModal
          visible={center}
          onClose={() => setCenter(false)}
          title="Delete project"
        >
          <Text
            style={{ fontFamily: soft.font.family, color: soft.textMuted, fontSize: 14, lineHeight: 22, marginBottom: 18 }}
          >
            This will permanently remove the project and all of its tasks.
            You can't undo this.
          </Text>
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
            <Button label="Cancel" variant="ghost" onPress={() => setCenter(false)} />
            <Button label="Delete" tone="danger" onPress={() => setCenter(false)} />
          </View>
        </SoftModal>

        <SoftModal
          visible={bottom}
          onClose={() => setBottom(false)}
          position="bottom"
          title="Filters"
        >
          <Text style={{ color: soft.textMuted, fontFamily: soft.font.family, fontSize: 14 }}>
            Bottom-sheet body. Mobile-first overlay — slides up, has a drag
            handle, dismisses on backdrop tap.
          </Text>
        </SoftModal>
      </View>
    );
  },
};

// SegmentedControl — generic version (replaces the editor-only AlignSegmented).
export const SegmentedStory: Story = {
  name: "SegmentedControl",
  render: () => {
    const [tab, setTab] = useState<"day" | "week" | "month">("week");
    const [view, setView] = useState<"list" | "grid">("list");
    return (
      <View style={{ gap: 16, alignItems: "flex-start" }}>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
        />
        <SegmentedControl
          value={view}
          onChange={setView}
          options={[
            { value: "list", icon: "alignLeft", label: "List" },
            { value: "grid", icon: "sidebar", label: "Grid" },
          ]}
        />
      </View>
    );
  },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
      {children}
      <Text style={{ fontFamily: soft.font.family, color: soft.text, fontSize: 14, fontWeight: "500" }}>
        {label}
      </Text>
    </View>
  );
}
