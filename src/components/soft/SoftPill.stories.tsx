import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text, View } from "react-native";
import { SoftPill } from "./SoftPill";
import { soft } from "./tokens";

const meta: Meta<typeof SoftPill> = {
  title: "Soft UI/Foundation/SoftPill",
  component: SoftPill,
  parameters: { softKit: true },
  decorators: [
    (Story) => (
      <View style={{ padding: 32, backgroundColor: soft.canvas }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const Label = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontFamily: soft.font.family, color: soft.text, fontSize: 15, fontWeight: "600" }}>
    {children}
  </Text>
);

export const Surface: Story = {
  render: () => (
    <SoftPill>
      <Label>Surface pill</Label>
    </SoftPill>
  ),
};

export const Raised: Story = {
  render: () => (
    <SoftPill variant="raised">
      <Label>Raised pill</Label>
    </SoftPill>
  ),
};

export const Inset: Story = {
  render: () => (
    <SoftPill variant="inset">
      <Label>Inset pill</Label>
    </SoftPill>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <SoftPill>
        <Label>Surface</Label>
      </SoftPill>
      <SoftPill variant="raised">
        <Label>Raised</Label>
      </SoftPill>
      <SoftPill variant="inset">
        <Label>Inset</Label>
      </SoftPill>
    </View>
  ),
};
