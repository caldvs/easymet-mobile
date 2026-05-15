import type { Meta, StoryObj } from "@storybook/react-vite";
import { View } from "react-native";
import { DepartureRow } from "./DepartureRow";

const meta: Meta<typeof DepartureRow> = {
  title: "Molecules/DepartureRow",
  component: DepartureRow,
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
  decorators: [
    (Story) => (
      <View style={{ width: 360, backgroundColor: "#FFFFFF", borderRadius: 16, paddingLeft: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Altrincham: Story = {
  args: {
    departure: {
      destination: "Altrincham",
      carriages: 2,
      status: "Due",
      waitMinutes: 3,
      platform: "TPID01",
      corridor: "Altrincham",
      direction: "Outgoing",
    },
  },
};

export const AirportDue: Story = {
  args: {
    departure: {
      destination: "Manchester Airport",
      carriages: 1,
      status: "Due",
      waitMinutes: 0,
      platform: "TPID01",
      corridor: "Airport",
      direction: "Outgoing",
    },
  },
};

export const RochdaleDelayed: Story = {
  args: {
    departure: {
      destination: "Rochdale Town Centre",
      carriages: 2,
      status: "Delayed",
      waitMinutes: 8,
      platform: "TPID02",
      corridor: "Oldham & Rochdale",
      direction: "Outgoing",
    },
  },
};

export const Stacked: Story = {
  render: () => (
    <>
      <DepartureRow
        departure={{ destination: "Altrincham", carriages: 2, status: "Due", waitMinutes: 0, platform: "TPID01", corridor: "Altrincham", direction: "Outgoing" }}
      />
      <DepartureRow
        departure={{ destination: "Bury", carriages: 1, status: "Due", waitMinutes: 4, platform: "TPID02", corridor: "Bury", direction: "Outgoing" }}
      />
      <DepartureRow
        departure={{ destination: "Manchester Airport", carriages: 2, status: "Due", waitMinutes: 11, platform: "TPID03", corridor: "Airport", direction: "Outgoing" }}
      />
    </>
  ),
};
