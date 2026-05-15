import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text, View } from "react-native";
import { text } from "../lib/theme";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Atoms/Card",
  component: Card,
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
};

export default meta;
type Story = StoryObj<typeof meta>;

const sample = (
  <View style={{ padding: 16 }}>
    <Text style={{ ...text.headline, color: "#000000" }}>Next departures</Text>
    <Text
      style={{
        ...text.subheadline,
        color: "rgba(60,60,67,0.6)",
        marginTop: 4,
      }}
    >
      Five upcoming trams in the next ten minutes.
    </Text>
  </View>
);

export const Default: Story = {
  args: { children: sample, style: { width: 320 } },
};

export const RedAccent: Story = {
  args: { accent: "#FF3B30", children: sample, style: { width: 320 } },
};

export const ForestAccent: Story = {
  args: { accent: "#22A06B", children: sample, style: { width: 320 } },
};

export const AmberAccent: Story = {
  args: { accent: "#F2C14E", children: sample, style: { width: 320 } },
};

export const BlueAccent: Story = {
  args: { accent: "#0A84FF", children: sample, style: { width: 320 } },
};
