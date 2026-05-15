import type { Meta, StoryObj } from "@storybook/react-vite";
import { View } from "react-native";
import { TimePill } from "./TimePill";

const meta: Meta<typeof TimePill> = {
  title: "Atoms/TimePill",
  component: TimePill,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Due: Story = { args: { waitMinutes: 0, status: "Due" } };
export const ThreeMinutes: Story = { args: { waitMinutes: 3, status: "Due" } };
export const TenMinutes: Story = { args: { waitMinutes: 10, status: "Due" } };
export const Delayed: Story = { args: { waitMinutes: 7, status: "Delayed" } };
export const Cancelled: Story = { args: { waitMinutes: 0, status: "Cancelled" } };

export const Spectrum: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
      <TimePill waitMinutes={0} status="Due" />
      <TimePill waitMinutes={3} status="Due" />
      <TimePill waitMinutes={12} status="Due" />
      <TimePill waitMinutes={7} status="Delayed" />
      <TimePill waitMinutes={0} status="Cancelled" />
    </View>
  ),
};
