import type { Meta, StoryObj } from "@storybook/react-vite";
import { View } from "react-native";
import { StatusPill } from "./StatusPill";
import { soft, type StatusKind } from "./tokens";

const meta: Meta<typeof StatusPill> = {
  title: "Soft UI/StatusPill",
  component: StatusPill,
  parameters: { softKit: true },
  decorators: [
    (Story) => (
      <View style={{ padding: 32, backgroundColor: soft.canvas }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    status: {
      control: "select",
      options: ["pending", "submitted", "success", "failed", "expired"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = { args: { status: "pending" } };
export const Submitted: Story = { args: { status: "submitted" } };
export const Success: Story = { args: { status: "success" } };
export const Failed: Story = { args: { status: "failed" } };
export const Expired: Story = { args: { status: "expired" } };

// Recreates image 2 — the five pills laid out 3 × 2.
export const AllStatesGrid: Story = {
  render: () => {
    const top: StatusKind[] = ["pending", "submitted", "success"];
    const bottom: StatusKind[] = ["failed", "expired"];
    return (
      <View style={{ gap: 24, alignItems: "flex-start" }}>
        <View style={{ flexDirection: "row", gap: 28 }}>
          {top.map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 28, marginLeft: 60 }}>
          {bottom.map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </View>
      </View>
    );
  },
};
