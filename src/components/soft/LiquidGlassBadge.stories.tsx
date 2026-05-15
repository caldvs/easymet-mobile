import type { Meta, StoryObj } from "@storybook/react-vite";
import { View } from "react-native";
import { LiquidGlassBadge } from "./LiquidGlassBadge";
import { soft } from "./tokens";

const meta: Meta<typeof LiquidGlassBadge> = {
  title: "Soft UI/LiquidGlassBadge",
  component: LiquidGlassBadge,
  parameters: { softKit: true },
  decorators: [
    (Story) => (
      <View
        style={{
          padding: 32,
          backgroundColor: soft.canvas,
          alignItems: "flex-start",
        }}
      >
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = { args: { label: "Live", tone: "danger" } };
export const Accent: Story = { args: { label: "On time", tone: "accent" } };
export const Success: Story = { args: { label: "Arrived", tone: "success" } };
export const Warning: Story = { args: { label: "Delayed", tone: "warning" } };

export const AllTones: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
      <LiquidGlassBadge label="Live" tone="danger" />
      <LiquidGlassBadge label="On time" tone="accent" />
      <LiquidGlassBadge label="Arrived" tone="success" />
      <LiquidGlassBadge label="Delayed" tone="warning" />
      <LiquidGlassBadge label="Neutral" tone="neutral" />
    </View>
  ),
};
