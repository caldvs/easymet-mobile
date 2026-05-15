import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text, View } from "react-native";
import { DashedPill } from "./DashedPill";
import { FilterChip } from "./FilterChip";
import { GradientButton, Sparkles } from "./GradientButton";
import { IconToggle } from "./IconToggle";
import { SearchPill } from "./SearchPill";
import { SoftIcon } from "./SoftIcon";
import { StatusBadge } from "./StatusBadge";
import { Stepper } from "./Stepper";
import { AlignSegmented } from "./Toolbar";
import { UserChip } from "./UserChip";
import { soft } from "./tokens";

const meta: Meta = {
  title: "Soft UI/Showcase",
  parameters: { softKit: true },
  decorators: [
    (Story) => (
      <View style={{ padding: 48, backgroundColor: soft.canvas, minWidth: 1100 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Recreates image 4 — the kitchen-sink grid that shows every "shape" the
// soft kit ships: gradient AI, user chip, dashed upload, filter chip, align
// control, stepper + primary CTA, sidebar toggle, live-state badges, search.
export const ComponentsKit: Story = {
  render: () => (
    <View style={{ gap: 28, alignItems: "center" }}>
      {/* Row 1 — primary, identity, optional */}
      <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
        <GradientButton
          label="Ask AI"
          leading={<Sparkles />}
          gradient="askAILarge"
        />
        <UserChip name="Ella M." initials="E" onDismiss={() => {}} />
        <DashedPill
          label="Upload"
          leading={<SoftIcon name="cloudUp" size={18} color={soft.text} />}
        />
      </View>

      {/* Row 2 — filter, alignment, stepper + CTA */}
      <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
        <FilterChip label="Filter" count={2} onClear={() => {}} />
        <View
          style={[
            {
              backgroundColor: soft.surface,
              borderRadius: soft.radii.pill,
              paddingHorizontal: 6,
              paddingVertical: 4,
              flexDirection: "row",
            },
            soft.shadow.pill,
          ]}
        >
          <AlignSegmented value="left" />
        </View>
        <View
          style={[
            {
              backgroundColor: soft.surface,
              borderRadius: soft.radii.pill,
              paddingLeft: 16,
              paddingRight: 6,
              paddingVertical: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            },
            soft.shadow.pill,
          ]}
        >
          <Text
            style={{
              fontFamily: soft.font.family,
              color: soft.text,
              fontSize: 17,
              fontWeight: "700",
            }}
          >
            30{" "}
            <Text style={{ color: soft.textMuted, fontWeight: "500" }}>mins</Text>
          </Text>
          <View style={{ alignItems: "center" }}>
            <SoftIcon name="chevronUp" size={12} color={soft.textMuted} strokeWidth={2} />
            <View style={{ marginTop: -4 }}>
              <SoftIcon name="chevronDown" size={12} color={soft.textMuted} strokeWidth={2} />
            </View>
          </View>
          <GradientButton label="Book a Call" gradient="bookCall" size="sm" />
        </View>
      </View>

      {/* Row 3 — sidebar toggle, live states, search */}
      <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
        <View
          style={[
            {
              backgroundColor: soft.surface,
              borderRadius: soft.radii.square,
              padding: 4,
            },
            soft.shadow.pill,
          ]}
        >
          <IconToggle
            glyph={<SoftIcon name="sidebar" size={20} color={soft.text} />}
            size={36}
          />
        </View>
        <StatusBadge kind="online" label="Online" />
        <StatusBadge kind="progress" label="In progress" />
        <SearchPill placeholder="Search" />
      </View>
    </View>
  ),
};

// Quick reference: each atom on its own.
export const Atoms: Story = {
  render: () => (
    <View style={{ gap: 24, alignItems: "flex-start" }}>
      <Caption>Identity</Caption>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <UserChip name="Ella M." initials="E" onDismiss={() => {}} />
        <UserChip name="Callum D." initials="C" />
      </View>

      <Caption>Status badges</Caption>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <StatusBadge kind="online" label="Online" />
        <StatusBadge kind="progress" label="In progress" />
      </View>

      <Caption>Filter / Search / Stepper / Upload</Caption>
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <FilterChip count={2} onClear={() => {}} />
        <SearchPill />
        <Stepper value={30} unit="mins" />
        <DashedPill
          label="Upload"
          leading={<SoftIcon name="cloudUp" size={18} color={soft.text} />}
        />
      </View>
    </View>
  ),
};

function Caption({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
