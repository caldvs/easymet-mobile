// Individual stories for every atom in the soft-UI kit. Each story is
// hooked up to local state so the atom is actually functional in the
// preview — click the IconToggle to toggle, type into Search, click the
// dropdown to open the menu, dismiss chips and watch them disappear.

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Text, View } from "react-native";
import { DashedPill } from "./DashedPill";
import { FilterChip } from "./FilterChip";
import { IconToggle } from "./IconToggle";
import { SearchPill } from "./SearchPill";
import { SoftIcon } from "./SoftIcon";
import { StatusBadge } from "./StatusBadge";
import { Stepper } from "./Stepper";
import { ToolbarDropdown } from "./Toolbar";
import { Tooltip } from "./Tooltip";
import { UserChip } from "./UserChip";
import { soft } from "./tokens";

const Padded = ({ children }: { children: React.ReactNode }) => (
  <View style={{ padding: 32, backgroundColor: soft.canvas, alignItems: "flex-start" }}>
    {children}
  </View>
);

const meta: Meta = {
  title: "Soft UI/Atoms",
  parameters: { softKit: true },
  decorators: [(Story) => <Padded><Story /></Padded>],
};
export default meta;

type Story = StoryObj;

const Caption = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      fontFamily: soft.font.family,
      color: soft.textMuted,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 4,
    }}
  >
    {children}
  </Text>
);

export const TooltipStory: Story = {
  name: "Tooltip",
  render: () => <Tooltip>Bold: ⌘ + B</Tooltip>,
};

// Click the unselected B / I / U buttons to toggle them on; the active
// state lifts the tile, matching the design's raised "Bold" affordance.
export const IconToggleStory: Story = {
  name: "IconToggle (toggleable)",
  render: () => {
    const [marks, setMarks] = useState({ b: true, i: false, u: false });
    const toggle = (k: keyof typeof marks) =>
      setMarks((m) => ({ ...m, [k]: !m[k] }));
    return (
      <View style={{ gap: 8 }}>
        <Caption>Click each to toggle</Caption>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <IconToggle
            glyph={<SoftIcon name="boldB" size={18} color={soft.text} />}
            selected={marks.b}
            onPress={() => toggle("b")}
          />
          <IconToggle
            glyph={<SoftIcon name="italicI" size={18} color={soft.text} />}
            selected={marks.i}
            onPress={() => toggle("i")}
          />
          <IconToggle
            glyph={<SoftIcon name="underlineU" size={18} color={soft.text} />}
            selected={marks.u}
            onPress={() => toggle("u")}
          />
        </View>
      </View>
    );
  },
};

// Click the ✕ on each chip to dismiss it. "Reset" brings them back.
export const UserChipStory: Story = {
  name: "UserChip (dismissable)",
  render: () => {
    const [users, setUsers] = useState(["Ella M.", "Callum D.", "Sam P."]);
    const reset = () => setUsers(["Ella M.", "Callum D.", "Sam P."]);
    return (
      <View style={{ gap: 12, alignItems: "flex-start" }}>
        <Caption>Click ✕ to dismiss</Caption>
        {users.map((u) => (
          <UserChip
            key={u}
            name={u}
            initials={u[0]}
            onDismiss={() => setUsers((xs) => xs.filter((x) => x !== u))}
          />
        ))}
        {users.length === 0 && (
          <DashedPill
            label="Reset"
            leading={<SoftIcon name="arrowUpRight" size={16} color={soft.text} />}
            onPress={reset}
          />
        )}
      </View>
    );
  },
};

// "Filter" cycles a count up on press; "Sort" is a non-clearable demo;
// "Filter (clearable)" lets you tap ✕ to remove the count.
export const FilterChipStory: Story = {
  name: "FilterChip (counter + clear)",
  render: () => {
    const [count, setCount] = useState(2);
    return (
      <View style={{ gap: 12 }}>
        <Caption>Press the pill to add a filter, ✕ to clear</Caption>
        <FilterChip
          label="Filter"
          count={count > 0 ? count : undefined}
          onPress={() => setCount((c) => c + 1)}
          onClear={count > 0 ? () => setCount(0) : undefined}
        />
        <FilterChip label="Sort" count={1} />
        <FilterChip label="Filter" />
      </View>
    );
  },
};

// Bounded 0–120 mins, 5-minute steps. Press chevrons or hold them.
export const StepperStory: Story = {
  name: "Stepper (bounded 0–120)",
  render: () => (
    <View style={{ gap: 12 }}>
      <Caption>Press the chevrons to change</Caption>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Stepper defaultValue={30} unit="mins" step={5} min={0} max={120} />
        <Stepper defaultValue={1} unit="hr" step={1} min={0} max={12} />
      </View>
    </View>
  ),
};

// Real text input. Submit on Enter logs to the console; click the magnifier
// to submit too.
export const SearchPillStory: Story = {
  name: "SearchPill (typeable)",
  render: () => {
    const [last, setLast] = useState<string | null>(null);
    return (
      <View style={{ gap: 12 }}>
        <Caption>Type then press Enter or the magnifier</Caption>
        <SearchPill placeholder="Search" onSubmit={(q) => setLast(q)} />
        {last && (
          <Text style={{ fontFamily: soft.font.family, color: soft.textMuted, fontSize: 13 }}>
            Submitted: &ldquo;{last}&rdquo;
          </Text>
        )}
      </View>
    );
  },
};

// Open the dropdown to pick a font; the trigger label updates.
export const DropdownStory: Story = {
  name: "ToolbarDropdown (real menu)",
  render: () => {
    const [font, setFont] = useState("Inter");
    const [size, setSize] = useState(14);
    return (
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        <ToolbarDropdown
          label={font}
          hint="Regular"
          value={font}
          onChange={setFont}
          options={[
            { value: "Inter", label: "Inter" },
            { value: "DM Sans", label: "DM Sans" },
            { value: "JetBrains Mono", label: "JetBrains Mono" },
            { value: "SF Pro", label: "SF Pro" },
          ]}
        />
        <ToolbarDropdown
          label={`${size}px`}
          value={size}
          onChange={setSize}
          options={[10, 12, 14, 16, 18, 24, 32].map((n) => ({
            value: n,
            label: `${n}px`,
          }))}
        />
      </View>
    );
  },
};

// Press the pill to fire an action — visible counter proves the press
// actually fired and the press feedback shows the dashed border darken.
export const DashedPillStory: Story = {
  name: "DashedPill (pressable)",
  render: () => {
    const [uploads, setUploads] = useState(0);
    return (
      <View style={{ gap: 12 }}>
        <Caption>Press to upload</Caption>
        <DashedPill
          label="Upload"
          leading={<SoftIcon name="cloudUp" size={18} color={soft.text} />}
          onPress={() => setUploads((n) => n + 1)}
        />
        <Text style={{ fontFamily: soft.font.family, color: soft.textMuted, fontSize: 13 }}>
          {uploads} upload{uploads === 1 ? "" : "s"} fired
        </Text>
      </View>
    );
  },
};

// Static — these badges represent server-driven state, not user actions.
export const StatusBadgeStory: Story = {
  name: "StatusBadge",
  render: () => (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <StatusBadge kind="online" label="Online" />
      <StatusBadge kind="progress" label="In progress" />
    </View>
  ),
};
