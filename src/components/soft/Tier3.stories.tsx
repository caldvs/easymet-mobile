// Tier 3 atoms — specialised pickers and structural components.

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Text, View } from "react-native";
import { Accordion } from "./Accordion";
import { AvatarGroup } from "./AvatarGroup";
import { DatePicker } from "./DatePicker";
import { Slider } from "./Slider";
import { Tabs } from "./Tabs";
import { soft } from "./tokens";

const Padded = ({ children }: { children: React.ReactNode }) => (
  <View
    style={{
      padding: 32,
      backgroundColor: soft.canvas,
      alignItems: "flex-start",
      minHeight: 500,
      gap: 16,
    }}
  >
    {children}
  </View>
);

const meta: Meta = {
  title: "Soft UI/Tier 3",
  parameters: { softKit: true },
  decorators: [(Story) => <Padded><Story /></Padded>],
};
export default meta;
type Story = StoryObj;

// Tabs — switch sections and watch the body change.
export const TabsStory: Story = {
  name: "Tabs",
  render: () => (
    <Tabs
      defaultValue="overview"
      options={[
        { value: "overview", label: "Overview" },
        { value: "activity", label: "Activity" },
        { value: "settings", label: "Settings" },
      ]}
    >
      {(active) => (
        <View>
          <Text style={{ fontFamily: soft.font.family, color: soft.text, fontSize: 16, fontWeight: "600" }}>
            {active.toString().replace(/^./, (c) => c.toUpperCase())}
          </Text>
          <Text style={{ fontFamily: soft.font.family, color: soft.textMuted, fontSize: 14, marginTop: 6, lineHeight: 22 }}>
            The body re-renders with the active tab's value as a prop.
          </Text>
        </View>
      )}
    </Tabs>
  ),
};

// Accordion — single-open by default; toggle `multiple` for FAQ behaviour.
export const AccordionStory: Story = {
  name: "Accordion",
  render: () => (
    <View style={{ alignSelf: "stretch", maxWidth: 520, gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ color: soft.textMuted, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>
          Single open (default)
        </Text>
        <Accordion
          defaultExpanded="a"
          items={[
            { id: "a", title: "What's included?", body: "Everything in the kit is yours — buttons, inputs, modals, the whole tier-1 set, plus the soft language tokens." },
            { id: "b", title: "Can I theme it?", body: "Yes — tokens.ts is the single source of truth. Swap the surface / accent / tone palette there and everything updates." },
            { id: "c", title: "Does it work on web?", body: "Storybook runs on react-native-web so every atom you see here renders on web too. Mobile-specific touch-target rules kick in only on iOS / Android." },
          ]}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: soft.textMuted, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>
          Multiple open (FAQ)
        </Text>
        <Accordion
          multiple
          items={[
            { id: "1", title: "How do I install it?", body: "Pull `src/components/soft/` into your project and import from `./components/soft`." },
            { id: "2", title: "Is it accessible?", body: "Hit targets meet iOS HIG / Material on native; press feedback follows the kit's pressFeedback recipe." },
            { id: "3", title: "What's missing?", body: "DnD, virtualised lists, rich text — those compose on top of the kit rather than living inside it." },
          ]}
        />
      </View>
    </View>
  ),
};

// AvatarGroup — overflow tile when more than `max`.
export const AvatarGroupStory: Story = {
  name: "AvatarGroup",
  render: () => {
    const people = [
      { name: "Ella M." },
      { name: "Sam P." },
      { name: "Kim T." },
      { name: "Riley J." },
      { name: "Jordan B." },
      { name: "Cam D." },
      { name: "Pat L." },
    ];
    return (
      <View style={{ gap: 16, alignItems: "flex-start" }}>
        <Text style={{ color: soft.textMuted, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>
          Sizes
        </Text>
        <AvatarGroup people={people} size="sm" />
        <AvatarGroup people={people} size="md" />
        <AvatarGroup people={people} size="lg" />
        <Text style={{ color: soft.textMuted, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginTop: 12 }}>
          Max overrides
        </Text>
        <AvatarGroup people={people} max={2} />
        <AvatarGroup people={people} max={10} />
      </View>
    );
  },
};

// Slider — drag the thumb.
export const SliderStory: Story = {
  name: "Slider",
  render: () => {
    const [vol, setVol] = useState(40);
    const [size, setSize] = useState(12);
    return (
      <View style={{ gap: 24, alignSelf: "flex-start" }}>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: soft.font.family, color: soft.text, fontSize: 14, fontWeight: "600" }}>
            Volume · {vol}
          </Text>
          <Slider value={vol} onChange={setVol} min={0} max={100} step={1} />
        </View>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: soft.font.family, color: soft.text, fontSize: 14, fontWeight: "600" }}>
            Font size · {size}px (step 2)
          </Text>
          <Slider value={size} onChange={setSize} min={10} max={32} step={2} />
        </View>
      </View>
    );
  },
};

// DatePicker — pick a day, click around the calendar.
export const DatePickerStory: Story = {
  name: "DatePicker",
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    return (
      <View style={{ gap: 12 }}>
        <DatePicker value={date} onChange={setDate} />
        <Text style={{ fontFamily: soft.font.family, color: soft.textMuted, fontSize: 13 }}>
          Selected:{" "}
          {date ? date.toDateString() : "nothing yet — tap a day"}
        </Text>
      </View>
    );
  },
};
