import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { View } from "react-native";
import { StationListRow } from "./StationListRow";

const meta: Meta<typeof StationListRow> = {
  title: "Molecules/StationListRow",
  component: StationListRow,
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
  args: { onOpen: fn(), onTogglePin: fn() },
  decorators: [
    (Story) => (
      <View style={{ width: 360, backgroundColor: "#FFFFFF" }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseStation = {
  code: "BUR",
  name: "Bury",
  atcoCode: "9400ZZMABUR2",
  corridor: "Bury",
  platforms: 2,
  zone: 4,
  lines: ["Bury"],
  lat: 53.5907,
  lng: -2.2986,
};

export const Unpinned: Story = { args: { station: baseStation, pinned: false } };
export const Pinned: Story = { args: { station: baseStation, pinned: true } };

export const Interchange: Story = {
  args: {
    station: {
      code: "SPS",
      name: "St Peter's Square",
      atcoCode: "9400ZZMASTP4",
      corridor: "Eccles",
      platforms: 6,
      zone: 1,
      lines: ["Altrincham", "Bury", "Eccles", "Airport", "East Didsbury", "Rochdale", "Ashton", "Trafford Park"],
      lat: 53.4782,
      lng: -2.2431,
    },
    pinned: true,
  },
};
