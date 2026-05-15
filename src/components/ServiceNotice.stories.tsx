import type { Meta, StoryObj } from "@storybook/react-vite";
import { View } from "react-native";
import { ServiceNotice } from "./ServiceNotice";

const meta: Meta<typeof ServiceNotice> = {
  title: "Molecules/ServiceNotice",
  component: ServiceNotice,
  decorators: [
    (Story) => (
      <View style={{ width: 360 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message:
      "Engineering Work — 10th May until 10am no services will operate through Victoria & no service will operate on the Rochdale line until 11am. A bus replacement service will be in place.",
  },
};

export const WithoutLabel: Story = {
  args: {
    showLabel: false,
    message: "Minor delays on the Bury line — services running ~5 min behind schedule.",
  },
};
