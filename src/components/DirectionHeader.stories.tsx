import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { View } from "react-native";
import { DirectionHeader } from "./DirectionHeader";

const meta: Meta<typeof DirectionHeader> = {
  title: "Molecules/DirectionHeader",
  component: DirectionHeader,
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "grouped",
      values: [
        { name: "grouped", value: "#F2F2F7" },
        { name: "white", value: "#FFFFFF" },
      ],
    },
  },
  args: { onToggle: fn() },
  decorators: [
    (Story) => (
      <View style={{ width: 360, backgroundColor: "#FFFFFF", borderRadius: 24 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const group = {
  label: "Towards Altrincham",
  terminus: "Altrincham",
  lines: ["Altrincham"],
  departures: [
    { destination: "Altrincham", carriages: 2, status: "Due", waitMinutes: 3, platform: "TPID01", corridor: "Altrincham", direction: "Outgoing" },
    { destination: "Altrincham", carriages: 1, status: "Due", waitMinutes: 11, platform: "TPID02", corridor: "Altrincham", direction: "Outgoing" },
  ],
};

export const Expanded: Story = { args: { group, expanded: true } };
export const Collapsed: Story = { args: { group, expanded: false } };

export const CollapsedDue: Story = {
  args: {
    expanded: false,
    group: {
      ...group,
      departures: [{ ...group.departures[0]!, waitMinutes: 0 }],
    },
  },
};
