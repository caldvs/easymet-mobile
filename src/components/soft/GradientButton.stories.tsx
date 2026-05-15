import type { Meta, StoryObj } from "@storybook/react-vite";
import { View } from "react-native";
import { GradientButton, Sparkles } from "./GradientButton";
import { soft } from "./tokens";

const meta: Meta<typeof GradientButton> = {
  title: "Soft UI/GradientButton",
  component: GradientButton,
  parameters: { softKit: true },
  decorators: [
    (Story) => (
      <View style={{ padding: 32, backgroundColor: soft.canvas }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    gradient: {
      control: "select",
      options: ["askAI", "bookCall", "askAILarge"],
    },
    size: { control: "select", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AskAI: Story = {
  args: {
    label: "Ask AI",
    leading: <Sparkles />,
    gradient: "askAI",
  },
};

export const BookACall: Story = {
  args: { label: "Book a Call", gradient: "bookCall" },
};

export const AllGradients: Story = {
  render: () => (
    <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
      <GradientButton label="Ask AI" leading={<Sparkles />} gradient="askAI" />
      <GradientButton label="Ask AI" leading={<Sparkles />} gradient="askAILarge" />
      <GradientButton label="Book a Call" gradient="bookCall" />
    </View>
  ),
};
